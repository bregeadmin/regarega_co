-- Fix apartment coordinates (2026-06-07).
-- Airbnb-scraped lat/lng were approximate (privacy-fuzzed) -> pins landed on
-- wrong buildings. Corrected from: bre guest-instruction map links (verified)
-- + geocoded addresses Artem confirmed. Run in Supabase SQL editor.
-- After running: rebuild + redeploy rega-batumi (SSG reads coords at build).

-- from confirmed addresses (Artem 2026-06-07)
update apartments set lat=41.6347895, lng=41.6072802 where slug='seaside-apartment';            -- Orbi Residence, Kobaladze 2
update apartments set lat=41.6347895, lng=41.6072802 where slug='sunset-apartment';             -- Orbi Residence (same building)
update apartments set lat=41.6234767, lng=41.5935419 where slug='batumi-view-and-vibes';        -- Batumi View complex, Kachinskikh 8
update apartments set lat=41.6327299, lng=41.6072486 where slug='next-seaview-studio';          -- Mamuladze 19
update apartments set lat=41.6209812, lng=41.5905766 where slug='sunway-apartment';             -- Sunway Suites, Kachinskikh

-- from bre guest-instruction map links (were off by 40-470m)
update apartments set lat=41.6414947, lng=41.6160126 where slug='alliance-burgundy-8th-floor';
update apartments set lat=41.645747,  lng=41.637522  where slug='cozy-view-apartment-in-old-batumi';
update apartments set lat=41.6498799, lng=41.6428508 where slug='red-camelia-apartment';         -- same building as white-camelia
update apartments set lat=41.6386243, lng=41.6283177 where slug='modern-batumi-apartment';

-- unchanged (already correct): granat, coral, greenside-emerald, white-camelia

-- verify
select slug, lat, lng from apartments where city_id is not null order by slug;
