// Shared-element name for the «card photo grows into the big card» view transition.
// The SAME rule lives in public/app-gallery.js (phName) — change both together.
// Slugs are lowercase latin + digits + dashes; anything else becomes «_» so the result is
// always a valid CSS ident (the «ph-» prefix covers slugs that start with a digit).
export const phName = (slug: string): string => 'ph-' + String(slug || '').replace(/[^a-zA-Z0-9_-]/g, '_');
