// Guest auth client (email one-time code). Exposes window.rrAuth.
// NOTE: inline <script is:inline> blocks run BEFORE this bundled module, so screens must
// wait for it:  window.rrAuth ? go() : addEventListener('rr-auth-ready', go, { once: true });
import { createClient } from '@supabase/supabase-js';
import { url, key } from './supabase';

const sb = createClient(url, key, {
  auth: { storageKey: 'rr_auth', persistSession: true, autoRefreshToken: true, detectSessionInUrl: false },
});

type R = { ok: boolean; error?: string; [k: string]: any };
const NET: R = { ok: false, error: 'network' };

async function rpc(fn: string, args?: Record<string, unknown>): Promise<{ data: any; fail: boolean }> {
  try {
    const { data, error } = await sb.rpc(fn, args);
    if (error) return { data: null, fail: true };
    return { data, fail: false };
  } catch { return { data: null, fail: true }; }
}
async function call(fn: string, args?: Record<string, unknown>): Promise<R> {
  const r = await rpc(fn, args);
  if (r.fail || r.data == null) return { ...NET };
  return r.data as R;
}

function mirror(uid: string) {
  try { localStorage.setItem('rr_uid', uid || ''); } catch {}
}

const rrAuth = {
  async session() {
    try { return (await sb.auth.getSession()).data.session; } catch { return null; }
  },
  async sendCode(email: string): Promise<R> {
    try {
      // SECURITY: data.kind='guest' makes the DB create a guest, not an operator. Never omit.
      const { error } = await sb.auth.signInWithOtp({
        email: String(email || '').trim(),
        options: { shouldCreateUser: true, data: { kind: 'guest' } },
      });
      return error ? { ok: false, error: error.message || 'send_failed' } : { ok: true };
    } catch { return { ...NET }; }
  },
  async verify(email: string, code: string): Promise<R> {
    try {
      const { error } = await sb.auth.verifyOtp({ email: String(email || '').trim(), token: String(code || ''), type: 'email' });
      return error ? { ok: false, error: error.message || 'invalid_code' } : { ok: true };
    } catch { return { ...NET }; }
  },
  // Returns the profile object, null ONLY when the guest really has no profile yet,
  // and { error: 'network' } when the call failed (callers must show a retry, not the name form).
  async profile(): Promise<any> {
    const r = await rpc('my_guest_profile');
    if (r.fail) return { error: 'network' };
    return r.data ?? null;
  },
  saveProfile(name: string, phone?: string | null) {
    return call('save_guest_profile', { p_name: name, p_phone: phone ?? null });
  },
  // The account's trips; null when the call failed (callers show a retry, not "no trips").
  async trips(): Promise<any[] | null> {
    const r = await rpc('my_trips');
    return r.fail || !Array.isArray(r.data) ? null : r.data;
  },
  claim(token: string) { return call('claim_trip', { p_token: token }); },
  invite(bookingId: number | string) { return call('create_trip_invite', { p_booking: bookingId }); },
  accept(code: string) { return call('accept_trip_invite', { p_code: code }); },
  bookRequest(p: { apartment_id: string; ci: string; co: string; adults: number; amount?: number | null; currency?: string }) {
    return call('create_my_booking_request', {
      p_apartment: p.apartment_id, p_ci: p.ci, p_co: p.co, p_adults: p.adults,
      p_amount: p.amount ?? null, p_currency: p.currency || 'usd',
    });
  },
  async signOut(): Promise<R> {
    try { await sb.auth.signOut(); } catch {}
    mirror('');
    return { ok: true };
  },
  async deleteAccount(): Promise<R> {
    try {
      const s = await rrAuth.session();
      if (!s) return { ok: false, error: 'no_session' };
      const res = await fetch(url + '/functions/v1/guest-account', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: 'Bearer ' + s.access_token, apikey: key },
        body: JSON.stringify({ action: 'delete' }),
      });
      const body = await res.json().catch(() => ({}));
      if (!res.ok || !body.ok) return { ok: false, error: body.error || 'network' };
      await rrAuth.signOut();
      return { ok: true };
    } catch { return { ...NET }; }
  },
};

(window as any).rrAuth = rrAuth;
sb.auth.onAuthStateChange((_e, s) => mirror(s?.user?.id || ''));
rrAuth.session().then((s) => mirror(s?.user?.id || ''));
window.dispatchEvent(new Event('rr-auth-ready'));
