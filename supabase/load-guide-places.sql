-- guide_places reload (pure ASCII). Idempotent ON CONFLICT(slug).
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('japan-33','Japan 33','Japan 33','eat-drink','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','Authentic Japanese cuisine
Sake & cocktails
33rd floor views
Sun-Fri 15:00-00:00 | Sat 15:00-01:00
Sherif Khimshiashvili 15b','A stylish Japanese restaurant located on the 33rd floor with panoramic views over the sea, mountains, and Batumi skyline. JAPAN 33 combines authentic Japanese cuisine, signature cocktails, sake, and a refined modern atmosphere that feels very different from typical sushi places in the city.

The restaurant was created as a collaboration between Panorama Restaurant, ORBI Group, and Ginza Project, with chef Ri focusing on authentic Japanese dishes and high-quality natural ingredients. The interior combines natural wood, plants, soft lighting, and Japanese-inspired aesthetics, while evening DJ sets and sunset views make the place especially atmospheric.

Perfect for:

- sushi & sashimi

- sunset dinners

- cocktails & sake

- date nights

- stylish evening atmosphere

What to try:

- sashimi & nigiri

- signature rolls

- kaisen don

- Japanese cocktails

- sake selection

15b Sherif Khimshiashvili St, 33rd floor, Batumi

Sun-Fri: 15:00 - 00:00

Sat: 15:00 - 01:00','https://static.tildacdn.com/tild3863-3433-4631-b236-366664343031/__2026-05-07__021805.png','["https://static.tildacdn.com/tild3863-3433-4631-b236-366664343031/__2026-05-07__021805.png", "https://static.tildacdn.com/tild3638-3963-4231-a637-313634333531/__2026-05-07__021818.png", "https://static.tildacdn.com/tild6234-3432-4563-b065-353865623139/__2026-05-07__021755.png", "https://static.tildacdn.com/tild3865-3937-4333-a132-353931613664/__2026-05-07__021946.png"]'::jsonb,41.63718,41.6100409,'15b Sherif Khimshiashvili St, Batumi 6000, Georgia',null,'["Monday: 3:00 PM - 12:00 AM", "Tuesday: 3:00 PM - 12:00 AM", "Wednesday: 3:00 PM - 12:00 AM", "Thursday: 3:00 PM - 12:00 AM", "Friday: 3:00 PM - 12:00 AM", "Saturday: 3:00 PM - 1:00 AM", "Sunday: 3:00 PM - 12:00 AM"]'::jsonb,'https://www.instagram.com/japan33_batumi?igsh=Y2M0bzFnZTBkZnAz','https://maps.google.com/?cid=10573646343052134634',4.4,86,null,true)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('milevskii-coffee','Milevskii coffee','Milevskii coffee','eat-drink','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','Specialty Coffee - All Day Breakfast - CocktailsOpen daily 09:00 - 20:00Pet-friendly6 Irakli Abashidze St, Batumi','A modern specialty coffee spot in Batumi known for its aesthetic interior, strong breakfast menu, and relaxed European cafe atmosphere. Milevskii combines quality coffee, fresh bakery, all-day breakfasts, and cocktails in a space that feels stylish but still cozy and comfortable.

The place is especially loved for its beautifully presented brunch dishes, syrniki, Benedicts, specialty coffee, and calm atmosphere that works equally well for slow mornings, remote work, or meeting friends. They also have cocktails and wine for later in the day, making it feel more like an all-day coffee bar than a classic cafe.

Perfect for:

- specialty coffee

- breakfast & brunch

- desserts & bakery

- working remotely

- relaxed meetings

What to try:

- syrniki

- salmon Benedict

- flat white

- filter coffee

- pastries & desserts

6 Irakli Abashidze St, Batumi

Daily: 09:00 - 20:00','https://static.tildacdn.com/tild3035-3833-4961-b066-313665616464/__2026-05-07__021212.png','["https://static.tildacdn.com/tild3035-3833-4961-b066-313665616464/__2026-05-07__021212.png", "https://static.tildacdn.com/tild6438-3632-4433-b863-616136333434/__2026-05-07__021202.png", "https://static.tildacdn.com/tild6430-3734-4731-b964-616239383132/__2026-05-07__021148.png", "https://static.tildacdn.com/tild6666-3439-4536-b636-623437633439/__2026-05-07__021050.png"]'::jsonb,41.6497076,41.6373744,'6 Irakli Abashidze St, Batumi 6001, Georgia','593 65 21 70','["Monday: 9:00 AM - 8:00 PM", "Tuesday: 9:00 AM - 8:00 PM", "Wednesday: 9:00 AM - 8:00 PM", "Thursday: 9:00 AM - 8:00 PM", "Friday: 9:00 AM - 8:00 PM", "Saturday: 9:00 AM - 8:00 PM", "Sunday: 9:00 AM - 8:00 PM"]'::jsonb,'https://milevskii.ge/','https://maps.google.com/?cid=1434279201701436317',4.6,345,null,true)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('nova-coffee','Nova coffee','Nova coffee','eat-drink','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','Every day 8.00-23.00
Parnavaz Mepe 60','One of Batumi''s strongest specialty coffee spots, combining high-quality coffee, a modern minimalist interior, and a full brunch-style menu. Nova feels more like a contemporary European cafe than a typical coffee shop, which is why it became a favorite among locals, expats, and people working remotely in the city.

The place is especially loved for its filter coffee, signature drinks, beautifully presented food, and relaxed atmosphere with good music and plenty of space to work or meet friends. They also have a coffee store with beans and accessories for home brewing.

Perfect for:

- specialty coffee

- breakfast & brunch

- working remotely

- slow mornings

- meeting friends

What to try:

- V60 & filter coffee

- espresso tonic

- flat white

- breakfast dishes

- tiramisu & desserts

60 Parnavaz Mepe St, Batumi

Daily: 08:00 - 23:00','https://static.tildacdn.com/tild6435-3963-4937-a130-613335613432/__2026-05-07__020631.png','["https://static.tildacdn.com/tild6435-3963-4937-a130-613335613432/__2026-05-07__020631.png", "https://static.tildacdn.com/tild3965-3336-4139-b065-333735643637/__2026-05-07__020846.png", "https://static.tildacdn.com/tild6132-6362-4466-a363-383537356265/__2026-05-07__020641.png", "https://static.tildacdn.com/tild3732-3736-4037-a562-623737653635/__2026-05-07__020719.png", "https://static.tildacdn.com/tild3262-3536-4734-b536-333265323666/__2026-05-07__020708.png"]'::jsonb,41.6481999,41.636938,'60 Parnavaz Mepe St, Batumi, Georgia',null,'["Monday: 8:00 AM - 11:00 PM", "Tuesday: 8:00 AM - 11:00 PM", "Wednesday: 8:00 AM - 11:00 PM", "Thursday: 8:00 AM - 11:00 PM", "Friday: 8:00 AM - 11:00 PM", "Saturday: 8:00 AM - 11:00 PM", "Sunday: 8:00 AM - 11:00 PM"]'::jsonb,'https://www.instagram.com/nova_coffeebar/','https://maps.google.com/?cid=6590380861872611391',4.4,559,null,true)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('livi-coffee','Livi coffee','Livi coffee','eat-drink','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','coffee, breakfasts, salads & sweet treats
open daily 9:00-22:00
Kldiashvili, 16, Batumi','LIVI - Batumi
A cozy modern cafe built around specialty coffee, fresh pastries, desserts, and relaxed everyday atmosphere. LIVI has quickly become one of the favorite local spots in Batumi for breakfasts, coffee meetings, and slow mornings with good food and beautifully made drinks.','https://static.tildacdn.com/tild3935-6162-4337-b363-356236636664/L_height.jpeg','["https://static.tildacdn.com/tild3935-6162-4337-b363-356236636664/L_height.jpeg", "https://static.tildacdn.com/tild6637-6263-4133-b562-333563373863/__2026-05-07__015917.png", "https://static.tildacdn.com/tild3932-3337-4337-a337-363063363830/images.jpeg"]'::jsonb,41.6497661,41.63122509999999,'16 Kldiashvili St, Batumi 6010, Georgia','511 12 24 18','["Monday: 9:00 AM - 10:00 PM", "Tuesday: 9:00 AM - 10:00 PM", "Wednesday: 9:00 AM - 10:00 PM", "Thursday: 9:00 AM - 10:00 PM", "Friday: 9:00 AM - 10:00 PM", "Saturday: 9:00 AM - 10:00 PM", "Sunday: 9:00 AM - 10:00 PM"]'::jsonb,null,'https://maps.google.com/?cid=4752867127864845385',4.9,200,null,true)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('elly-restaurant-gonio','Elly restaurant Gonio','Elly restaurant Gonio','eat-drink','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','Taste. Breeze. Memory. 
Poolside restaurant in Gonio 
09:00-21:00','A stylish restaurant in Gonio combining European cuisine with Georgian influences, cocktails, wine, and a relaxed coastal atmosphere. Located a short drive from Batumi, ELLY feels more like a hidden seaside escape than a typical tourist restaurant.

The space is especially loved for its terrace, slow dinners, breakfast by the sea, and calm aesthetic atmosphere surrounded by greenery and the quieter side of the coast. A perfect place for escaping the busy city for a few hours.

Perfect for:

- breakfast & brunch

- sunset dinners

- wine & cocktails

- slow weekends outside Batumi

- relaxed evenings by the sea

What to try:

- European dishes with Georgian accents

- cocktails & wine

- seafood

- breakfast menu

- desserts

Gonio, 18 Andria Pirveltsodebuli Hwy III Deadlock

Daily: 09:00 - 21:00','https://static.tildacdn.com/tild3436-3762-4366-a530-653861303334/__2026-05-07__012925.png','["https://static.tildacdn.com/tild3436-3762-4366-a530-653861303334/__2026-05-07__012925.png", "https://static.tildacdn.com/tild3339-6439-4438-b765-376536653035/__2026-05-07__012915.png", "https://static.tildacdn.com/tild3835-3336-4262-b130-623666356532/__2026-05-07__012906.png", "https://static.tildacdn.com/tild6232-6532-4263-b762-313461373234/__2026-05-07__012858.png", "https://static.tildacdn.com/tild3565-3337-4932-a632-336564633737/__2026-05-07__012849.png"]'::jsonb,41.5623949,41.5663392,'18 Andria Pirveltsodebuli Hwy III Deadlock, Gonio, Georgia','557 33 13 32','["Monday: 9:00 AM - 12:00 AM", "Tuesday: 9:00 AM - 12:00 AM", "Wednesday: 9:00 AM - 12:00 AM", "Thursday: 9:00 AM - 12:00 AM", "Friday: 9:00 AM - 12:00 AM", "Saturday: 9:00 AM - 12:00 AM", "Sunday: 9:00 AM - 12:00 AM"]'::jsonb,'https://www.facebook.com/profile.php?id=61562434920001&mibextid=LQQJ4d','https://maps.google.com/?cid=18201598718432976109',4.6,226,null,true)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('botanico-cafe','Botanico cafe','Botanico cafe','eat-drink','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','A Taste of Paradise at Green Cape 
Working Hours: Mon - Sun: 12:00 PM - 12 AM','A beautiful cafe and restaurant located near the Batumi Botanical Garden, surrounded by greenery, sea views, and a calm resort atmosphere. Botanico feels more like a hidden coastal escape than a typical city restaurant - perfect for slow lunches, sunset dinners, and long conversations with wine.

The place combines Georgian and European cuisine with a stylish modern aesthetic, poolside atmosphere, cocktails, and panoramic views of the Black Sea. One of the best spots around Batumi for a relaxed dinner outside the busy city center.

Perfect for:

- sunset dinners

- wine & cocktails

- food with a sea view

- slow weekends outside the city

- special occasions

What to try:

- Georgian & European dishes

- seafood

- cocktails

- wine selection

- desserts

Green Cape, near Batumi Botanical Garden
Location
Daily: 12:00 - 00:00','https://static.tildacdn.com/tild3263-6266-4730-b535-636233376638/__2026-05-07__011452.png','["https://static.tildacdn.com/tild3263-6266-4730-b535-636233376638/__2026-05-07__011452.png", "https://static.tildacdn.com/tild3036-3862-4131-b530-333631333539/__2026-05-07__012025.png", "https://static.tildacdn.com/tild3934-6535-4461-a662-326135353936/__2026-05-07__011523.png", "https://static.tildacdn.com/tild6233-3164-4932-b861-333766303865/__2026-05-07__011514.png", "https://static.tildacdn.com/tild6337-3366-4134-b231-333738336238/__2026-05-07__011502.png", "https://static.tildacdn.com/tild6135-3132-4238-a664-383966306635/__2026-05-07__013041.png"]'::jsonb,41.6906667,41.7061111,'MPR4+FCW, Batumi, Georgia','577 36 15 73','["Monday: 12:00 PM - 12:00 AM", "Tuesday: 12:00 PM - 12:00 AM", "Wednesday: 12:00 PM - 12:00 AM", "Thursday: 12:00 PM - 12:00 AM", "Friday: 12:00 PM - 12:00 AM", "Saturday: 12:00 PM - 12:00 AM", "Sunday: 12:00 PM - 12:00 AM"]'::jsonb,null,'https://maps.google.com/?cid=5255347113814170852',4.9,713,null,true)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('alcobrand','Alcobrand','Alcobrand','eat-drink','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','One of the most popular alcohol stores in Batumi 
Georgian and imported wines
gin, tequila, beer, and premium spirits


98 Zurab Gorgiladze St, Batumi
25 Zurab Gorgiladze St, Batumi 
12 Mikheil Lermontovi, Batumi','AlcoBrand - Batumi
One of the most popular alcohol stores in Batumi with a large selection of Georgian and imported wines, whiskey, gin, tequila, beer, and premium spirits. A great place if you want something beyond the typical supermarket selection.','https://static.tildacdn.com/tild6433-3361-4435-a431-393034303465/unnamed.jpeg','["https://static.tildacdn.com/tild6433-3361-4435-a431-393034303465/unnamed.jpeg", "https://static.tildacdn.com/tild3731-6330-4464-a537-303732663563/unnamed_1.jpeg", "https://static.tildacdn.com/tild3163-3837-4030-a365-303837646564/2025-04-25.jpeg"]'::jsonb,41.6419484,41.6164194,'98 Zurab Gorgiladze St, Batumi, Georgia','595 10 18 78','["Monday: 10:00 AM - 2:00 AM", "Tuesday: 10:00 AM - 2:00 AM", "Wednesday: 10:00 AM - 2:00 AM", "Thursday: 10:00 AM - 2:00 AM", "Friday: 10:00 AM - 2:00 AM", "Saturday: 10:00 AM - 2:00 AM", "Sunday: 10:00 AM - 2:00 AM"]'::jsonb,'https://instagram.com/alco.brand.batumi?igshid=MjAxZDBhZDhlNA==','https://maps.google.com/?cid=6735233852842266020',4.6,30,null,true)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('gastronome-batumi','Gastronome Batumi','Gastronome Batumi','eat-drink','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','Curated selection of finest food and drinks from around the world
First gourmet store chain in Georgia
14 Vazha-Pshavela St, Batumi','Gastronom - Batumi
A stylish gourmet grocery and delicatessen store with a carefully selected collection of European products, wine, cheese, snacks, desserts, and specialty food items that are hard to find elsewhere in Batumi.','https://static.tildacdn.com/tild3935-3235-4164-a139-643138393262/__2026-05-07__005603.png','["https://static.tildacdn.com/tild3935-3235-4164-a139-643138393262/__2026-05-07__005603.png", "https://static.tildacdn.com/tild3631-3137-4066-b736-383937663064/__2026-05-07__005500.png", "https://static.tildacdn.com/tild6239-6138-4735-b530-653838316536/__2026-05-07__005434.png", "https://static.tildacdn.com/tild6462-6531-4366-b639-336665353432/__2026-05-07__005415.png"]'::jsonb,41.6497141,41.6320556,'14 Vazha-Pshavela St, Batumi 0281, Georgia','595 88 88 66','["Monday: 9:00 AM - 11:00 PM", "Tuesday: 9:00 AM - 11:00 PM", "Wednesday: 9:00 AM - 11:00 PM", "Thursday: 9:00 AM - 11:00 PM", "Friday: 9:00 AM - 11:00 PM", "Saturday: 9:00 AM - 11:00 PM", "Sunday: 9:00 AM - 11:00 PM"]'::jsonb,'http://gastronome.ge/','https://maps.google.com/?cid=8426947051460866636',3.7,19,null,true)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('8000-vintages','8000 vintages','8000 vintages','eat-drink','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','Georgian wine shop & bar.
Batumi, Gogebashvili 30','8000 Vintages - Batumi
One of the best places in Batumi to discover Georgian wine culture. 8000 Vintages is a modern wine shop and bar focused on carefully selected wines from small Georgian wineries, including natural and qvevri wines from different regions of the country.','https://static.tildacdn.com/tild3035-6638-4431-b236-363434373966/__2026-05-07__005103.png','["https://static.tildacdn.com/tild3035-6638-4431-b236-363434373966/__2026-05-07__005103.png", "https://static.tildacdn.com/tild6333-6362-4633-a632-323464626638/__2026-05-07__005046.png", "https://static.tildacdn.com/tild3233-3464-4361-a433-376433663362/__2026-05-07__005036.png", "https://static.tildacdn.com/tild3462-6266-4330-b330-306161643230/__2026-05-07__005005.png"]'::jsonb,41.6483675,41.6444325,'30 Gogebashvili St, Batumi 6006, Georgia','555 88 60 80','["Monday: 11:00 AM - 1:00 AM", "Tuesday: 11:00 AM - 1:00 AM", "Wednesday: 11:00 AM - 1:00 AM", "Thursday: 11:00 AM - 12:00 AM", "Friday: 11:00 AM - 1:00 AM", "Saturday: 11:00 AM - 1:00 AM", "Sunday: 11:00 AM - 1:00 AM"]'::jsonb,'https://8000vintages.ge/','https://maps.google.com/?cid=2548398888913282612',4.7,372,null,true)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('garage-wines-wine-bar','Garage wines - wine bar','Garage wines - wine bar','eat-drink','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','18:00-00:00
18:00-01:00 on weekends
Dine & Shop Georgian
Natural Wine, Cheese, tea
8 Giorgi Mazniashvili St, Batumi','A unique natural wine bar and wine shop located inside a former family garage in Old Batumi. Garage Wines is one of the most atmospheric places in the city for discovering Georgian natural, organic, and biodynamic wines in a relaxed and authentic setting.

The place feels more like a hidden local gathering spot than a traditional wine bar - with vintage interiors, wine cellars, candlelight atmosphere, cheese, conversations, and a team that genuinely loves wine culture. Many guests come here not only to drink wine, but to learn more about Georgian winemaking and try small producers you rarely find elsewhere.

Perfect for:

- natural Georgian wines

- wine & cheese evenings

- authentic local atmosphere

- date nights

- slow conversations and late evenings

What to try:

- natural qvevri wines

- cheese plates

- Georgian biodynamic wines

- homemade desserts

- local tea & chacha

8 Giorgi Mazniashvili St, Batumi

Daily: 18:00 - 01:00

Friday-Saturday: until 02:00','https://static.tildacdn.com/tild3436-3835-4966-b134-666263353436/__2026-05-07__004226.png','["https://static.tildacdn.com/tild3436-3835-4966-b134-666263353436/__2026-05-07__004226.png", "https://static.tildacdn.com/tild3833-3237-4330-b861-376662343363/__2026-05-07__004316.png", "https://static.tildacdn.com/tild6539-6162-4435-b334-626163653138/__2026-05-07__004256.png", "https://static.tildacdn.com/tild6464-3361-4138-a361-333836376133/__2026-05-07__004308.png", "https://static.tildacdn.com/tild3066-3535-4130-a662-666139623864/__2026-05-07__004328.png"]'::jsonb,41.6512543,41.638939,'8 Giorgi Mazniashvili St, Batumi 6100, Georgia','555 12 41 62','["Monday: 6:00 PM - 1:00 AM", "Tuesday: 6:00 PM - 1:00 AM", "Wednesday: 6:00 PM - 1:00 AM", "Thursday: 6:00 PM - 1:00 AM", "Friday: 6:00 PM - 2:00 AM", "Saturday: 6:00 PM - 2:00 AM", "Sunday: 6:00 PM - 1:00 AM"]'::jsonb,'https://www.instagram.com/garage.wines/','https://maps.google.com/?cid=15605946332748592665',4.8,245,null,true)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('qube-bar','Qube bar','Qube bar','eat-drink','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','Distilling cocktails straight into your heart Dance, drink, repeatEvery day 20:00-5:004 Sherif Khimshiashvili St, Batumi','A small but very atmospheric cocktail bar in Batumi known for its strong cocktail culture, friendly bartenders, and relaxed late-night vibe. Qube feels more like a hidden local spot than a tourist bar - the kind of place people return to for conversations, music, and really well-made drinks.

The bar is especially loved for its classic and signature cocktails, cozy interior, and welcoming atmosphere without unnecessary glamour or loud club energy. Perfect both for starting the night and for staying until late.

Perfect for:

- cocktails & nightlife

- late-night drinks

- relaxed atmosphere

- meeting friends

- starting the night in Batumi

What to try:

- signature cocktails

- Negroni

- Daiquiri

- Espresso Martini

- custom cocktails based on your taste

4 Sherif Khimshiashvili St, Batumi

Daily: 20:00 - 05:00','https://static.tildacdn.com/tild3339-3836-4537-b933-396134383037/__2026-05-07__003820.png','["https://static.tildacdn.com/tild3339-3836-4537-b933-396134383037/__2026-05-07__003820.png", "https://static.tildacdn.com/tild6231-3636-4862-b536-373866356364/__2026-05-07__003733.png", "https://static.tildacdn.com/tild3436-6161-4536-a164-363365323731/__2026-05-07__003722.png", "https://static.tildacdn.com/tild3466-6637-4332-a234-653363303862/__2026-05-07__003855.png", "https://static.tildacdn.com/tild6235-3832-4166-b237-616530623834/__2026-05-07__003808.png"]'::jsonb,41.6432409,41.6168685,'4 Sherif Khimshiashvili St, Batumi, Georgia',null,'["Monday: 8:00 PM - 5:00 AM", "Tuesday: 8:00 PM - 5:00 AM", "Wednesday: 8:00 PM - 5:00 AM", "Thursday: 8:00 PM - 5:00 AM", "Friday: 8:00 PM - 5:00 AM", "Saturday: 8:00 PM - 5:00 AM", "Sunday: 8:00 PM - 5:00 AM"]'::jsonb,'https://qubebar.online/','https://maps.google.com/?cid=3123802442844189249',4.8,165,null,true)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('gimlet-bar','Gimlet bar','Gimlet bar','eat-drink','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','- Cocktails with character - Nights with soul- The vibe you''ve been looking for - Daily 18:00 - 03:0017 Zviad Gamsakhurdia St, Batumi 6010','Gimlet - Batumi
One of Batumi''s best cocktail bars for people who appreciate classic drinks, good music, and a stylish but relaxed atmosphere. Gimlet combines modern bar culture with a cozy European vibe, making it a perfect place for both quiet evening cocktails and starting a longer night out.','https://static.tildacdn.com/tild6531-6461-4461-a666-613139383365/__2026-05-07__003353.png','["https://static.tildacdn.com/tild6531-6461-4461-a666-613139383365/__2026-05-07__003353.png", "https://static.tildacdn.com/tild3334-3230-4130-b530-656563356330/__2026-05-07__003337.png", "https://static.tildacdn.com/tild3735-3739-4739-b662-326438643538/__2026-05-07__003418.png", "https://static.tildacdn.com/tild3164-3534-4539-a265-666330386239/__2026-05-07__003400.png"]'::jsonb,41.65068710000001,41.6415774,'17 Zviad Gamsakhurdia St, Batumi, Georgia',null,'["Monday: 6:00 PM - 3:00 AM", "Tuesday: 6:00 PM - 3:00 AM", "Wednesday: 6:00 PM - 3:00 AM", "Thursday: 6:00 PM - 3:00 AM", "Friday: 6:00 PM - 3:00 AM", "Saturday: 6:00 PM - 3:00 AM", "Sunday: 6:00 PM - 3:00 AM"]'::jsonb,'https://www.instagram.com/gimlet.batumi/','https://maps.google.com/?cid=3669509845223456546',4.9,228,null,true)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('medea-restaurant','Medea restaurant','Medea restaurant','eat-drink','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','Modern Georgian-European restaurant offering a diverse selection of delicious dishes
Mon - Sun: 13:00 PM - 12 AM','An elegant modern Georgian restaurant located inside the Radisson Blu Hotel, combining traditional Georgian flavors with a more refined contemporary style. Medea is one of the best places in Batumi for a stylish dinner, wine, and a calmer upscale atmosphere away from the typical tourist restaurants.

The interior feels modern and sophisticated, while the menu mixes classic Georgian dishes with European presentation and fine dining touches. In summer, the terrace becomes one of the nicest spots for long dinners and evening wine.

Perfect for:

- elegant dinners

- Georgian cuisine with a modern twist

- wine & cocktails

- date nights

- business meetings

What to try:

- Adjarian khachapuri

- khinkali

- grilled meat dishes

- Georgian wine

- desserts

Ninoshvili St. 1, Radisson Blu Hotel, Batumi

Daily: 13:00 - 00:00','https://static.tildacdn.com/tild3932-6235-4661-a662-383061346132/__2026-05-07__002747.png','["https://static.tildacdn.com/tild3932-6235-4661-a662-383061346132/__2026-05-07__002747.png", "https://static.tildacdn.com/tild6534-3132-4235-b239-386237373534/__2026-05-07__002756.png", "https://static.tildacdn.com/tild3631-3038-4039-b936-653331333661/__2026-05-07__002724.png", "https://static.tildacdn.com/tild3539-3936-4364-b234-366566323339/__2026-05-07__002807.png"]'::jsonb,41.65356269999999,41.6376312,'Ninoshvili str.# 1 Batumi, Ajara 6000, Georgia','577 36 62 00','["Monday: 1:00 PM - 12:00 AM", "Tuesday: 1:00 PM - 12:00 AM", "Wednesday: 1:00 PM - 12:00 AM", "Thursday: 1:00 PM - 12:00 AM", "Friday: 1:00 PM - 12:00 AM", "Saturday: 1:00 PM - 12:00 AM", "Sunday: 1:00 PM - 12:00 AM"]'::jsonb,'https://silkhospitality.com/radisson-blu-batumi/restaurants-bars/medea/','https://maps.google.com/?cid=3106640728451451309',4.9,995,null,true)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('brasserie-1900','Brasserie 1900','Brasserie 1900','eat-drink','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','A stylish restaurant and social hub in the heart of Batumi, 25 Memed Abashidze Ave','Brasserie 1900 - Batumi
A beautiful European-style brasserie in the heart of Old Batumi with elegant interiors, classic atmosphere, and one of the most refined dining experiences in the city. Inspired by traditional French and European brasseries, the place combines timeless design, wine culture, and carefully prepared dishes.','https://static.tildacdn.com/tild3735-3831-4361-b761-373430376239/__2026-05-07__002253.png','["https://static.tildacdn.com/tild3735-3831-4361-b761-373430376239/__2026-05-07__002253.png", "https://static.tildacdn.com/tild6466-6132-4435-b536-306337623935/__2026-05-07__002230.png", "https://static.tildacdn.com/tild6165-3334-4562-b963-316164306434/__2026-05-07__002146.png", "https://static.tildacdn.com/tild3564-6138-4434-b164-336536616633/__2026-05-07__002136.png"]'::jsonb,41.6509904,41.6375773,'25 Memed Abashidze Ave, Batumi 0167, Georgia','511 22 22 52','["Monday: 8:00 AM - 11:00 PM", "Tuesday: 8:00 AM - 11:00 PM", "Wednesday: 8:00 AM - 11:00 PM", "Thursday: 8:00 AM - 11:00 PM", "Friday: 8:00 AM - 11:00 PM", "Saturday: 8:00 AM - 11:00 PM", "Sunday: 8:00 AM - 11:00 PM"]'::jsonb,'https://www.brasserie1900.ge/','https://maps.google.com/?cid=895365817124148954',4.9,128,null,true)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('moonrise','Moonrise','Moonrise','eat-drink','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','Moonrise - cafe & brunch
A quiet aesthetic place in Batumi
specialty coffee
signature breakfasts
Batumi, Mamuladze St 19','A quiet aesthetic cafe in Batumi built around specialty coffee, signature breakfasts, and a warm, relaxed atmosphere. Moonrise combines minimalist design, soft natural light, and carefully curated details that make it feel more like a calm creative space than a typical cafe.

The place is especially loved for slow mornings, brunches, beautiful presentation, and a cozy atmosphere equally good for conversations, working remotely, or simply taking a break from the city.

Perfect for:

- specialty coffee

- signature breakfasts

- brunch & desserts

- working remotely

- slow mornings

What to try:

- breakfast dishes

- specialty coffee

- desserts

- signature drinks

David Mamuladze 19, Batumi

Daily: 09:00 - 23:00','https://static.tildacdn.com/tild3939-3664-4135-b265-663739623935/__2026-05-07__001242.png','["https://static.tildacdn.com/tild3939-3664-4135-b265-663739623935/__2026-05-07__001242.png", "https://static.tildacdn.com/tild3834-6266-4332-b438-623837373734/__2026-05-07__001827.png", "https://static.tildacdn.com/tild6164-3739-4736-a461-303063303365/__2026-05-07__001256.png", "https://static.tildacdn.com/tild6237-6536-4237-a331-306664626635/__2026-05-07__001850.png"]'::jsonb,41.63290300000001,41.6072479,'David mamuladze 19, Batumi 6010, Georgia','591 43 09 09','["Monday: 9:00 AM - 11:00 PM", "Tuesday: 9:00 AM - 11:00 PM", "Wednesday: 9:00 AM - 11:00 PM", "Thursday: 9:00 AM - 11:00 PM", "Friday: 9:00 AM - 11:00 PM", "Saturday: 9:00 AM - 11:00 PM", "Sunday: 9:00 AM - 11:00 PM"]'::jsonb,'https://moonrise.ge/','https://maps.google.com/?cid=4855794382703407698',4.9,51,null,true)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('ravi-neobistro','Ravi neobistro','Ravi neobistro','eat-drink','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','10:00-22:00
- All DAY FOOD
- TRENDY DRINKS
- ATMOSPHERE OF COMFORT 
27 Mamuladze St., Next White','RAVI - Batumi
A stylish all-day cafe with a modern interior, trendy drinks, and a relaxed atmosphere that makes you want to stay longer than planned. RAVI combines comfort, good food, music, and an aesthetic vibe that feels fresh and modern without trying too hard.','https://static.tildacdn.com/tild3736-3134-4136-a466-343834353463/__2026-05-07__000137.png','["https://static.tildacdn.com/tild3736-3134-4136-a466-343834353463/__2026-05-07__000137.png", "https://static.tildacdn.com/tild3965-6663-4634-b337-653432313033/__2026-05-07__000300.png", "https://static.tildacdn.com/tild6364-3834-4335-a662-333030633761/__2026-05-07__000423.png", "https://static.tildacdn.com/tild6137-6266-4637-a237-333936613736/__2026-05-07__000438.png", "https://static.tildacdn.com/tild3734-6138-4437-b464-393162616665/__2026-05-07__000310.png"]'::jsonb,41.6319181,41.6045069,' 27 David Khakhutaishvili St, Batumi 6010, Georgia','591 00 41 02','["Monday: 10:00 AM - 10:00 PM", "Tuesday: 10:00 AM - 10:00 PM", "Wednesday: 10:00 AM - 10:00 PM", "Thursday: 10:00 AM - 10:00 PM", "Friday: 10:00 AM - 10:00 PM", "Saturday: 10:00 AM - 10:00 PM", "Sunday: 10:00 AM - 10:00 PM"]'::jsonb,'https://www.instagram.com/ravi.neobistro?igsh=NHVpdWxrc3Zhd2Mw','https://maps.google.com/?cid=15528712223556860017',4.5,111,null,true)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('rhino-coffee','Rhino coffee','Rhino coffee','eat-drink','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','MON-FRI 8:30 - 21:00
SAT-SUN 9:00 - 21:00
Coffee, bakery & food
Khariton Akhvlediani, 4a','Coffee, Bakery & Food - Batumi
One of Batumi''s cozy everyday spots for good coffee, fresh pastries, and relaxed breakfasts. Open since 2019, this place has built a loyal local following thanks to its warm atmosphere, quality bakery, and simple but consistently good food.','https://static.tildacdn.com/tild6332-3266-4538-b162-363634626461/__2026-05-06__234210.png','["https://static.tildacdn.com/tild6332-3266-4538-b162-363634626461/__2026-05-06__234210.png", "https://static.tildacdn.com/tild3365-6531-4966-b534-663866633534/__2026-05-06__234201.png", "https://static.tildacdn.com/tild6362-3265-4731-b834-363935366436/__2026-05-06__234149.png"]'::jsonb,41.6471505,41.6330165,'4a Khariton Akhvlediani St, Batumi 6004, Georgia','595 50 51 26','["Monday: 8:30 AM - 9:00 PM", "Tuesday: 8:30 AM - 9:00 PM", "Wednesday: 8:30 AM - 9:00 PM", "Thursday: 8:30 AM - 9:00 PM", "Friday: 8:30 AM - 9:00 PM", "Saturday: 9:00 AM - 9:00 PM", "Sunday: 9:00 AM - 9:00 PM"]'::jsonb,'http://rhinocoffee.ge/','https://maps.google.com/?cid=1991563822285347658',4.6,1732,null,true)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('minimalist-coffee-and-food','Minimalist coffee and food','Minimalist coffee and food','eat-drink','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','Where Simplicity Meets Flavor 
Open: 9:00- 22:00
Lermontov st. 8','Minimalist - Batumi
A calm and beautifully designed cafe where simplicity, good coffee, and relaxed atmosphere come together. Minimalist has quickly become one of Batumi''s favorite spots for specialty coffee, slow breakfasts, and quiet mornings away from the busy tourist streets.','https://static.tildacdn.com/tild6136-6132-4630-b366-383761363039/__2026-05-06__233503.png','["https://static.tildacdn.com/tild6136-6132-4630-b366-383761363039/__2026-05-06__233503.png", "https://static.tildacdn.com/tild6366-3865-4662-b337-323039393933/minimalistbatumi1.jpg", "https://static.tildacdn.com/tild3734-6164-4666-b264-626539356164/__2026-05-06__232515.png"]'::jsonb,41.6428354,41.6328482,'Urban Roastery, 40 Melikishvili St, Batumi 6010, Georgia','593 65 09 54','["Monday: 8:00 AM - 8:00 PM", "Tuesday: 8:00 AM - 8:00 PM", "Wednesday: 8:00 AM - 8:00 PM", "Thursday: 8:00 AM - 8:00 PM", "Friday: 8:00 AM - 8:00 PM", "Saturday: 8:00 AM - 8:00 PM", "Sunday: 8:00 AM - 8:00 PM"]'::jsonb,'https://www.instagram.com/urban_roastery_ge','https://maps.google.com/?cid=13779949869241695437',4.7,233,null,true)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('nord-specialty-coffee-food','Nord specialty coffee & food','Nord specialty coffee & food','eat-drink','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','Specialty coffee bar & european food
 8:00 - 22:00 
Pet Friendly 
Location: Inasaridze 13','Specialty Coffee Bar & European Food
A cozy modern cafe combining specialty coffee, European comfort food, and a relaxed neighborhood atmosphere. One of those places in Batumi that works equally well for breakfast, lunch, coffee with a laptop, or a slow evening with wine and friends.','https://static.tildacdn.com/tild3562-3730-4964-b032-333131643133/__2026-05-06__231608.png','["https://static.tildacdn.com/tild3562-3730-4964-b032-333131643133/__2026-05-06__231608.png", "https://static.tildacdn.com/tild6563-6532-4134-b636-663831383333/__2026-05-06__231652.png", "https://static.tildacdn.com/tild3036-3661-4836-b662-333030643737/__2026-05-06__231550.png", "https://static.tildacdn.com/tild3035-6236-4430-b164-303433653137/__2026-05-06__231532.png"]'::jsonb,41.6499439,41.6392124,'24 Noe Zhordania St, Batumi, Georgia','591 06 21 18','["Monday: 10:00 AM - 10:00 PM", "Tuesday: 10:00 AM - 10:00 PM", "Wednesday: 10:00 AM - 10:00 PM", "Thursday: 10:00 AM - 10:00 PM", "Friday: 10:00 AM - 10:00 PM", "Saturday: 10:00 AM - 10:00 PM", "Sunday: 10:00 AM - 10:00 PM"]'::jsonb,'https://www.instagram.com/nordcoffee.ge/','https://maps.google.com/?cid=17715235062727338856',4.7,424,null,true)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('nord-coffee-old-town','Nord coffee old town','Nord coffee old town','eat-drink','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','Every day 10:00 - 22:00
Pet friendly 
Address: 24 Noe Zhordania St, Batumi','Nord Specialty Coffee - Batumi
One of the most loved specialty coffee spots in Batumi, known for its minimalist Scandinavian-style interior, excellent coffee, and calm atmosphere. A perfect place for slow mornings, working from a laptop, or taking a break from the city.','https://static.tildacdn.com/tild6636-6130-4735-a537-343030346435/__2026-05-06__231247.png','["https://static.tildacdn.com/tild6636-6130-4735-a537-343030346435/__2026-05-06__231247.png", "https://static.tildacdn.com/tild3163-3163-4662-b238-343563313164/__2026-05-06__231214.png", "https://static.tildacdn.com/tild3361-3664-4539-a662-666139396539/__2026-05-06__231201.png", "https://static.tildacdn.com/tild3931-6562-4137-b432-363836663731/__2026-05-06__231144.png", "https://static.tildacdn.com/tild3363-3136-4966-a639-626637616337/__2026-05-06__231129.png"]'::jsonb,41.6499439,41.6392124,'24 Noe Zhordania St, Batumi, Georgia','591 06 21 18','["Monday: 10:00 AM - 10:00 PM", "Tuesday: 10:00 AM - 10:00 PM", "Wednesday: 10:00 AM - 10:00 PM", "Thursday: 10:00 AM - 10:00 PM", "Friday: 10:00 AM - 10:00 PM", "Saturday: 10:00 AM - 10:00 PM", "Sunday: 10:00 AM - 10:00 PM"]'::jsonb,'https://www.instagram.com/nordcoffee.ge/','https://maps.google.com/?cid=17715235062727338856',4.7,424,null,true)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('pure-bistro','Pure Bistro','Pure Bistro','eat-drink','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','Breakfast / Lunch / Coffee / Wine / Pastries
Mon-Fri from 9:00 to 22:59
Sat-Sun from 9:00 to 23:59
Location - 26 May, 20','Pure Bistro - Batumi
A stylish modern bistro from the creators of one of Batumi''s favorite specialty coffee spots - but in a completely new format. Pure Bistro combines beautiful interior design, warm natural light, wine, cocktails, and a relaxed European atmosphere made for long brunches and slow dinners with friends.','https://static.tildacdn.com/tild6336-3131-4163-a561-633263386235/__2026-05-06__190716.png','["https://static.tildacdn.com/tild6336-3131-4163-a561-633263386235/__2026-05-06__190716.png", "https://static.tildacdn.com/tild3164-3565-4339-a162-613362306438/__2026-05-06__190659.png", "https://static.tildacdn.com/tild6135-3839-4837-a532-393134633336/__2026-05-06__190650.png", "https://static.tildacdn.com/tild3964-6265-4164-a232-336361646430/__2026-05-06__190636.png", "https://static.tildacdn.com/tild6239-3863-4861-b830-386263663737/__2026-05-06__190617.png", "https://static.tildacdn.com/tild3865-6332-4463-a261-323464383839/__2026-05-06__190502.png"]'::jsonb,41.6487811,41.63102079999999,'JJXJ+GC6, Batumi, Georgia',null,'["Monday: 9:00 AM - 11:00 PM", "Tuesday: 9:00 AM - 11:00 PM", "Wednesday: 9:00 AM - 11:00 PM", "Thursday: 9:00 AM - 11:00 PM", "Friday: 9:00 AM - 12:00 AM", "Saturday: 9:00 AM - 12:00 AM", "Sunday: 9:00 AM - 11:00 PM"]'::jsonb,null,'https://maps.google.com/?cid=15487686883465427884',4.8,44,null,true)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('nisha','Nisha','Nisha','eat-drink','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','This is Nisha in Batumi
EVERYDAY 11AM- 11PM
Friday-Saturday 11AM - 12AM
39 Noe Zhordania St.','Nisha - Batumi
A stylish all-day cafe and bar with a relaxed atmosphere, good music, cocktails, and one of the nicest modern interiors in Batumi. A popular spot for brunches, slow breakfasts, evening drinks, and meeting friends.','https://static.tildacdn.com/tild3438-6665-4734-b465-653263333839/__2026-05-06__190246.png','["https://static.tildacdn.com/tild3438-6665-4734-b465-653263333839/__2026-05-06__190246.png", "https://static.tildacdn.com/tild6530-3934-4363-b062-393732363338/__2026-05-06__190232.png", "https://static.tildacdn.com/tild3832-3733-4066-a463-613535303666/__2026-05-06__190121.png", "https://static.tildacdn.com/tild3864-6666-4337-b537-353635653530/__2026-05-06__190110.png", "https://static.tildacdn.com/tild3466-3730-4137-b034-623164653533/__2026-05-06__190100.png", "https://static.tildacdn.com/tild3766-3764-4266-b435-633665643833/__2026-05-06__190040.png"]'::jsonb,41.6498225,41.6392012,'39 Noe Zhordania St, Batumi 6010, Georgia','591 89 29 29','["Monday: 11:00 AM - 11:00 PM", "Tuesday: 11:00 AM - 11:00 PM", "Wednesday: 11:00 AM - 11:00 PM", "Thursday: 11:00 AM - 11:00 PM", "Friday: 11:00 AM - 12:00 AM", "Saturday: 11:00 AM - 12:00 AM", "Sunday: 11:00 AM - 11:00 PM"]'::jsonb,null,'https://maps.google.com/?cid=11196618021099648808',4.6,132,null,true)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('1905-bar','1905 BAR','1905 BAR','eat-drink','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','Craft & Bites
14 Zviad Gamsakhurdia st, Batumi
Open 18:00-02:00. kitchen till 00:00','1905 - Batumi
One of Batumi''s most atmospheric cocktail bars, inspired by classic European speakeasies. Dim lighting, vinyl music, jazz, and expertly crafted cocktails create a vibe that feels somewhere between Tbilisi, Berlin, and old Odessa.','https://static.tildacdn.com/tild6564-6131-4965-b063-393431663235/__2026-05-06__185307.png','["https://static.tildacdn.com/tild6564-6131-4965-b063-393431663235/__2026-05-06__185307.png", "https://static.tildacdn.com/tild3533-3832-4465-b463-353337386134/__2026-05-06__185255.png", "https://static.tildacdn.com/tild3136-6432-4234-b330-343138633531/__2026-05-06__185244.png"]'::jsonb,41.6511127,41.6408795,'14 Zviad Gamsakhurdia St, Batumi, Georgia',null,'["Monday: 11:00 AM - 2:00 AM", "Tuesday: 11:00 AM - 2:00 AM", "Wednesday: 11:00 AM - 2:00 AM", "Thursday: 11:00 AM - 2:00 AM", "Friday: 11:00 AM - 2:00 AM", "Saturday: 11:00 AM - 2:00 AM", "Sunday: 11:00 AM - 2:00 AM"]'::jsonb,null,'https://maps.google.com/?cid=4883574869233840412',5,60,null,true)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('kopi-brew','Kopi brew','Kopi brew','eat-drink','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','Specialty Coffee Roastery and shop
09:00-22:00
8, Lermontov str','Specialty Coffee Roastery & Shop

One of the best specialty coffee spots in Batumi for people who truly love coffee. They roast their own beans, serve excellent filter coffee and espresso, and the atmosphere feels more like a local European cafe than a touristy place.

Perfect for:

- morning coffee

- working with a laptop

- a relaxed breakfast

- buying beans to take home

 8 Lermontov St

09:00-22:00','https://static.tildacdn.com/tild6332-6335-4561-b138-643633323332/IMG_0810.PNG','["https://static.tildacdn.com/tild6332-6335-4561-b138-643633323332/IMG_0810.PNG", "https://static.tildacdn.com/tild3932-3833-4337-b632-373435363139/IMG_0811.PNG", "https://static.tildacdn.com/tild3039-6566-4734-b232-393634663638/IMG_0812.PNG"]'::jsonb,41.6452005,41.6242944,'8 Lermontov Str, Batumi 6400, Georgia','550 05 27 49','["Monday: 9:00 AM - 10:00 PM", "Tuesday: 9:00 AM - 10:00 PM", "Wednesday: 9:00 AM - 10:00 PM", "Thursday: 9:00 AM - 10:00 PM", "Friday: 9:00 AM - 10:00 PM", "Saturday: 9:00 AM - 10:00 PM", "Sunday: 9:00 AM - 10:00 PM"]'::jsonb,'https://kopiroasters.ge/','https://maps.google.com/?cid=15468823544390630221',4.8,43,null,true)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('the-kitchen-by-rooms','The Kitchen (by Rooms)','The Kitchen (by Rooms)','eat-drink','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','The Kitchen - rooftop dining at Rooms Batumi','A refined rooftop restaurant with 360 views over the Old Town and the port, set poolside above the city. Expect a menu built around local seafood and smart vegetarian plates, plus a considered list of Georgian and international wines; cocktails are mixed at the rooftop bar. Open for dinner-time it for sunset and linger for the skyline.

BRE.GE CLUB recommends:

Go classic-order a seafood main and pair it with a glass of Georgian wine; or keep it lighter with a vegetarian plate and a cocktail from the bar. It''s an easy, unhurried way to enjoy the view and the room''s designforward vibe.

Where: Rooftop of Rooms Batumi','https://static.tildacdn.com/tild6435-6139-4739-a333-646138393763/photo_2025-07-29_150.jpeg','["https://static.tildacdn.com/tild6435-6139-4739-a333-646138393763/photo_2025-07-29_150.jpeg", "https://static.tildacdn.com/tild3838-3732-4230-b431-323831316137/photo_2025-07-29_150.jpeg", "https://static.tildacdn.com/tild6366-6230-4932-a234-313837316139/photo_2025-07-29_150.jpeg", "https://static.tildacdn.com/tild6236-3230-4133-b735-316264323862/photo_2025-07-29_150.jpeg", "https://static.tildacdn.com/tild3733-6236-4037-a364-666666343765/photo_2025-07-29_150.jpeg"]'::jsonb,41.6512511,41.6432636,'10 Gogebashvili St, Batumi 6010, Georgia','032 220 02 99','["Monday: 3:00 PM - 12:00 AM", "Tuesday: 3:00 PM - 12:00 AM", "Wednesday: 3:00 PM - 12:00 AM", "Thursday: 3:00 PM - 12:00 AM", "Friday: 3:00 PM - 12:00 AM", "Saturday: 3:00 PM - 12:00 AM", "Sunday: 3:00 PM - 12:00 AM"]'::jsonb,'https://roomshotels.com/hotel/batumi','https://maps.google.com/?cid=13582320018996356808',4.5,70,null,true)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('daphna-batumi','Daphna Batumi','Daphna Batumi','eat-drink','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','Daphna - khinkali & honest Georgian food in the heart of Batumi','Daphna - khinkali & honest Georgian food in the heart of Batumi

A citycenter spot for simple, satisfying Georgian classics without the fuss. Come for the cozy, casual vibe and stay for the dish this place is known for: handmade khinkali-juicy, generously filled, and served piping hot. There''s a short menu of comfort plates, local wine by the glass, and a smooth house chacha to match.

BRE.GE CLUB recommends:

Order a full plate of classic khinkali (our pick here) and pair it with a shot of chacha-or keep it light with a glass of local wine. It''s the easiest way to taste why locals come back late after a seaside walk.

Good to know: central location, friendly service, and late hours-handy for an unplanned, nofrills dinner after the boulevard.','https://static.tildacdn.com/tild3762-3762-4431-b264-613934303030/XXXL_18_copy.jpg','["https://static.tildacdn.com/tild3762-3762-4431-b264-613934303030/XXXL_18_copy.jpg", "https://static.tildacdn.com/tild3434-6435-4964-a236-313061303733/XXXL_19_copy.jpg", "https://static.tildacdn.com/tild3133-6161-4737-b935-363037666363/XXXL_21_copy.jpg", "https://static.tildacdn.com/tild6638-3231-4338-b132-386131396131/XXXL_22_copy.jpg"]'::jsonb,41.649759,41.6343819,'43 Memed Abashidze Ave, Batumi, Georgia','595 69 00 22','["Monday: 11:00 AM - 2:00 AM", "Tuesday: 11:00 AM - 2:00 AM", "Wednesday: 11:00 AM - 2:00 AM", "Thursday: 11:00 AM - 2:00 AM", "Friday: 11:00 AM - 6:00 AM", "Saturday: 11:00 AM - 6:00 AM", "Sunday: 11:00 AM - 2:00 AM"]'::jsonb,'https://cafedaphna.ge/','https://maps.google.com/?cid=3483040804812198387',4.7,1126,null,true)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('ambassadori-restaurant','Ambassadori restaurant','Ambassadori restaurant','eat-drink','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','Working hours: 12:00-00:00
Kitchen works until 23:00
WhatsApp +995 555 77 44 88
near old dancing fountain, Seafront Promenade, Batumi','The Ambassadori in Batumi is an absolute gem of a restaurant. It''s located in a really cool and scenic area, and has a cozy, elegant atmosphere with stunning views of the city from every angle.

This place is famous for their incredible Italian cuisine. Their chef uses only the best, freshest ingredients to create dishes that are to die for. From classic pasta and risotto to fresh salads and decadent meat dishes, there''s something for everyone.

But the creme brulee is a whole other level. It''s a work of art created with so much skill and attention to detail. The creamy custard, topped with a crunchy caramel crust, is just out of this world.

And the wine list is equally impressive. You''ll find some of the finest Italian wines, as well as some gems from other countries. A knowledgeable sommelier can help you find the perfect wine to pair with your meal.The restaurant staff are all super friendly and really take care of you, making you feel right at home. The atmosphere is so cozy and welcoming, like you''re in a friend''s house. And the food is just incredible - you can''t go wrong. It''s not just about the food though, it''s also about the experience. Every time you go to the Ambassadori, it''s like a special occasion.','https://static.tildacdn.com/tild3136-3866-4262-b334-343861373861/Screenshot_2024-06-1.png','["https://static.tildacdn.com/tild3136-3866-4262-b334-343861373861/Screenshot_2024-06-1.png", "https://static.tildacdn.com/tild3263-6337-4730-a537-393731616332/Screenshot_2024-06-1.png", "https://static.tildacdn.com/tild6534-6435-4735-b033-373737353461/Screenshot_2024-06-1.png", "https://static.tildacdn.com/tild3530-3665-4632-a330-343832396265/Screenshot_2024-06-1.png"]'::jsonb,41.6551602,41.6352731,'near old dancing fountain, Seafront Promenade, Batumi 6000, Georgia','555 77 44 88','["Monday: 12:00 - 10:45 PM", "Tuesday: 12:00 - 10:45 PM", "Wednesday: 12:00 - 10:45 PM", "Thursday: 12:00 - 10:45 PM", "Friday: 12:00 - 10:45 PM", "Saturday: 12:00 - 10:45 PM", "Sunday: 12:00 - 10:45 PM"]'::jsonb,'https://www.facebook.com/RestaurantAmbassadoriBatumi','https://maps.google.com/?cid=4897247930856672107',4.1,1813,null,true)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('urban-coffee','Urban coffee','Urban coffee','eat-drink','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','here you find coffee and comfort food
working hours are 9 am to 6 pm
40, Melikishvili str','Cafe with some really good coffee from roasters in Saudi Arabia. It''s in the city center and they specialize in breakfast - you know, like Hokkaido toast or an English breakfast, or even some original dishes. And for coffee, they have a classic menu or you can try some different brewing methods.

We recommend the sweet Hokkaido toast with freshly made batch brew

Special offer for the guests of the BRE apartments: show logo BRE.GE CLUB, get your coffee for free, when ordering any meal','https://static.tildacdn.com/tild6131-3432-4663-b064-343034363932/photo_2025-07-29_143.jpeg',null,41.6428354,41.6328482,'Urban Roastery, 40 Melikishvili St, Batumi 6010, Georgia','593 65 09 54','["Monday: 8:00 AM - 8:00 PM", "Tuesday: 8:00 AM - 8:00 PM", "Wednesday: 8:00 AM - 8:00 PM", "Thursday: 8:00 AM - 8:00 PM", "Friday: 8:00 AM - 8:00 PM", "Saturday: 8:00 AM - 8:00 PM", "Sunday: 8:00 AM - 8:00 PM"]'::jsonb,'https://www.instagram.com/urban_roastery_ge','https://maps.google.com/?cid=13779949869241695437',4.7,233,null,true)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('panorama-restaurant','Panorama restaurant','Panorama restaurant','eat-drink','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','working hours 11:00-00:00
+995 598 42 42 42
Menu by Izo Dzandzava
15B, Sherif Khimshiashvili str','The largest restaurant complex in Adjara with open kitchens one hundred meters above sea level opened in Batumi.

Panorama is a multi-level restaurant complex by Ginza Project, an international company with twenty years of experience. A unique project with 360-degree view, dynamic terraces, and cuisine by the first Georgian chef recognized by the Michelin Guide.

Panorama is located on four floors in the central ORBI Sea tower. Each level has its own atmosphere and is inspired by the multifaceted DNA of Georgian culture. With culinary accompaniment by Izo Dzandzava, you will feel like the most esteemed guest at a colorful and generous Georgian feast, whether you are with a hundred friends or on an intimate date for two. The menu features all the classics of Georgian cuisine - recipes passed down through generations in the Dzandzava family. But there is also room for creative interpretations, innovation, and gastronomic vision.

The Panorama restaurant complex is full of aesthetic and gastronomic experiences-such a scale is presented in Batumi for the first time. Open kitchens, innovative technologies, a unique interpretation of Georgian cuisine, high-level service, and an incredible collection of rare Georgian wines. Perhaps here there is a complete absence of the casual charm of authentic tourist establishments, but it is this vision that the creators see as the future of Georgian restaurant culture','https://static.tildacdn.com/tild6238-6539-4463-b332-323136643165/Screenshot_2024-06-1.png','["https://static.tildacdn.com/tild6238-6539-4463-b332-323136643165/Screenshot_2024-06-1.png", "https://static.tildacdn.com/tild6435-3065-4461-b464-643265613935/Screenshot_2024-06-1.png", "https://static.tildacdn.com/tild3733-6462-4932-b461-626130383135/Screenshot_2024-06-1.png", "https://static.tildacdn.com/tild3266-3139-4237-b433-383763613138/Screenshot_2024-06-1.png", "https://static.tildacdn.com/tild6238-3438-4365-a463-346234376133/Screenshot_2024-06-1.png"]'::jsonb,41.63746,41.610214,'15b Sherif Khimshiashvili St, Batumi 6000, Georgia','598 42 42 42','["Monday: 12:00 PM - 12:00 AM", "Tuesday: 12:00 PM - 12:00 AM", "Wednesday: 12:00 PM - 12:00 AM", "Thursday: 12:00 PM - 12:00 AM", "Friday: 12:00 PM - 12:00 AM", "Saturday: 12:00 PM - 1:00 AM", "Sunday: 12:00 PM - 12:00 AM"]'::jsonb,'https://panorama-batumi.com/','https://maps.google.com/?cid=2751450313102545683',4.3,1663,null,true)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('g-garden-restaurant','G garden restaurant','G garden restaurant','eat-drink','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','Chef @mamiajojua marked by Michelin guide
Modern Georgian, Asian and Italian cuisine
Mon - Sun 10:00-00:00
+995 577 294 680
1, Lech and Maria Kaczynski str','One of the coolest restaurants in town. They''ve got modern Georgian cuisine with a touch of Europe, and they go crazy for Asian food. It''s a really great place with awesome food. You could have a great night out there, and sometimes they even have live music. The chef''s even got a Michelin star!','https://static.tildacdn.com/tild3731-3866-4736-a134-373563653935/g-garden-INFOBATUMI-.jpg','["https://static.tildacdn.com/tild3731-3866-4736-a134-373563653935/g-garden-INFOBATUMI-.jpg", "https://static.tildacdn.com/tild3334-3833-4435-a666-386331663831/g-garden-INFOBATUMI-.jpg", "https://static.tildacdn.com/tild3436-6538-4236-a662-346264623663/our-restaurant.jpg"]'::jsonb,41.627219,41.600729,'1 Lech and Maria Kaczynski St, Batumi 6010, Georgia','577 29 46 80','["Monday: 12:00 PM - 12:00 AM", "Tuesday: 12:00 PM - 12:00 AM", "Wednesday: 12:00 PM - 12:00 AM", "Thursday: 12:00 PM - 12:00 AM", "Friday: 12:00 PM - 12:00 AM", "Saturday: 12:00 PM - 12:00 AM", "Sunday: 12:00 PM - 12:00 AM"]'::jsonb,'https://www.instagram.com/g.garden.rest/','https://maps.google.com/?cid=5400721841484232093',4.5,390,null,true)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('tiflis','Tiflis','Tiflis','eat-drink','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','Tiflisi. Restaurant "Tiflis" is located in Batumi, at the intersection of Vakhtan Gorgasli and Haidar Abashidze streets. 
Cuisine: Georgian and European','A restaurant in the heart of the city with authentic Georgian food. You can taste all the real Georgian flavors here: khachapuri, khinkali, ajapsandali, and more. The place often has live music and even has outdoor seating on the terrace.','https://static.tildacdn.com/tild3635-6266-4536-b066-363263643435/discover-a-new-culin.jpg','["https://static.tildacdn.com/tild3635-6266-4536-b066-363263643435/discover-a-new-culin.jpg", "https://static.tildacdn.com/tild6635-3838-4433-b034-313832393963/tiflisi-INFOBATUMI-G.jpg", "https://static.tildacdn.com/tild3739-3836-4962-b365-376463366236/discover-a-new-culin.jpg", "https://static.tildacdn.com/tild3038-3264-4262-a537-623635636564/discover-a-new-culin.jpg"]'::jsonb,41.6447322,41.6297677,'110/18 Vakhtang Gorgasali St, Batumi 6000, Georgia','568 76 76 38','["Monday: 10:00 AM - 12:00 AM", "Tuesday: 10:00 AM - 12:00 AM", "Wednesday: 10:00 AM - 12:00 AM", "Thursday: 10:00 AM - 12:00 AM", "Friday: 10:00 AM - 12:00 AM", "Saturday: 10:00 AM - 12:00 AM", "Sunday: 10:00 AM - 12:00 AM"]'::jsonb,'https://webapp.mayber.com/places/0ad3b0c3-9187-40cf-b9b6-b2e148e6eea7','https://maps.google.com/?cid=11556419655831233730',4.5,877,null,true)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('kava-lova','Kava Lova','Kava Lova','eat-drink','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','Cozy cafe in Batumi.
Run by brand-barista @ekaterina_kostenko, participant and winner of coffee championships.
Every day 10:00-21:00
31, Zubalashvilli str','This is a great cafe in the heart of the city that started as a little coffee shop. The staff are all experts in their field and they love coffee. You can get some amazing specialty coffee here, have lunch, drink some wine, and try some delicious desserts that they make themselves.','https://static.tildacdn.com/tild6237-3864-4539-b366-313363303439/photo_2024-06-14_173.jpeg','["https://static.tildacdn.com/tild6237-3864-4539-b366-313363303439/photo_2024-06-14_173.jpeg", "https://static.tildacdn.com/tild3039-3330-4238-b933-653630393133/photo_2024-06-14_173.jpeg", "https://static.tildacdn.com/tild3866-6533-4864-b964-376639626131/Screenshot_2024-06-1.png", "https://static.tildacdn.com/tild3638-3162-4466-b838-306434366632/Screenshot_2024-06-1.png"]'::jsonb,41.64604569999999,41.6376609,'31 Zubalashvili St, Batumi, Georgia',null,'["Monday: 10:00 AM - 9:00 PM", "Tuesday: 10:00 AM - 9:00 PM", "Wednesday: 10:00 AM - 9:00 PM", "Thursday: 10:00 AM - 9:00 PM", "Friday: 10:00 AM - 9:00 PM", "Saturday: 10:00 AM - 9:00 PM", "Sunday: 10:00 AM - 9:00 PM"]'::jsonb,'https://instagram.com/kava.lova.ge','https://maps.google.com/?cid=8066224162065083648',4.7,286,null,true)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('pure-coffee','Pure coffee','Pure coffee','eat-drink','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','A place in Batumi for breakfast, dinner and work! Every day, from 9:00 to 22:00. There is a delivery!
8, Lech and Maria Kaczynski str.','Pure is perhaps the most popular cafe in Batumi. Here, you can choose from a variety of ways to spend your time. Try the branded breakfasts, which are available until 7 p.m., and enjoy the excellent coffee, wine by the glass, and delicious salads and snacks.','https://static.tildacdn.com/tild3039-6330-4466-a435-663238626662/Screenshot_2024-06-1.png','["https://static.tildacdn.com/tild3039-6330-4466-a435-663238626662/Screenshot_2024-06-1.png", "https://static.tildacdn.com/tild3030-3031-4333-b530-623131366635/IMG_1063.jpg", "https://static.tildacdn.com/tild6561-6665-4762-b532-356462636163/photo_2024-06-15_153.jpeg", "https://static.tildacdn.com/tild6461-3766-4030-b933-366638326365/IMG_1064.jpg", "https://static.tildacdn.com/tild3234-3432-4961-a336-326661343739/photo_2024-06-15_153.jpeg", "https://static.tildacdn.com/tild3933-6134-4165-a436-316330663266/IMG_7103.JPG"]'::jsonb,41.6233559,41.5933971,'8 Lech and Maria Kaczynski St, Batumi 6010, Georgia',null,'["Monday: 9:00 AM - 10:00 PM", "Tuesday: 9:00 AM - 10:00 PM", "Wednesday: 9:00 AM - 10:00 PM", "Thursday: 9:00 AM - 10:00 PM", "Friday: 9:00 AM - 10:00 PM", "Saturday: 9:00 AM - 10:00 PM", "Sunday: 9:00 AM - 10:00 PM"]'::jsonb,null,'https://maps.google.com/?cid=9817076329914877795',4.5,710,null,true)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('jet-scooter-rent','Jet scooter rent','Jet scooter rent','move-around','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','App-based electric scooter sharing service for fast and flexible rides around Batumi with QR unlocking and per-minute rentals.


Available across Batumi via mobile app

24/7','JET
JET is a modern electric scooter sharing service operating in Batumi through a mobile app with QR-based unlocking and flexible per-minute pricing. The service is especially convenient for short rides between cafes, beaches, coworking spaces, and central areas of the city without needing taxis or rental cars.','https://static.tildacdn.com/tild3864-3138-4632-b434-323431396633/__2026-05-07__205334.png',null,41.641905,41.6165288,'98 Zurab Gorgiladze St, Batumi 6010, Georgia','558 62 26 00','["Monday: 9:00 AM - 9:00 PM", "Tuesday: 9:00 AM - 9:00 PM", "Wednesday: 9:00 AM - 9:00 PM", "Thursday: 9:00 AM - 9:00 PM", "Friday: 9:00 AM - 9:00 PM", "Saturday: 9:00 AM - 9:00 PM", "Sunday: 9:00 AM - 9:00 PM"]'::jsonb,'https://trip360.shop/batumi','https://maps.google.com/?cid=1585330358316507908',4.9,223,null,false)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('maxim-taxi','Maxim taxi','Maxim taxi','move-around','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','Affordable ride-hailing app in Batumi for everyday city transportation, airport rides and budget-friendly trips around the city.


Available across Batumi via mobile app

24/7','Taxi Maxim is a budget-friendly ride-hailing service operating in Batumi and other cities across Georgia. The app is especially popular among locals and long-term visitors thanks to lower prices compared to other taxi platforms and simple ride ordering process through the mobile app. taximaxim.com','https://static.tildacdn.com/tild6531-6562-4564-b061-323062393861/taksi-v-batumi2.jpg',null,41.631652,41.6325216,'100 Lermontov Str, Batumi 6000, Georgia','0422 24 00 00','["Monday: Open 24 hours", "Tuesday: Open 24 hours", "Wednesday: Open 24 hours", "Thursday: Open 24 hours", "Friday: Open 24 hours", "Saturday: Open 24 hours", "Sunday: Open 24 hours"]'::jsonb,'https://taximaxim.ge/','https://maps.google.com/?cid=5147597231831255653',3.6,163,null,false)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('yandex-go-taxi','Yandex Go taxi','Yandex Go taxi','move-around','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','Popular ride-hailing app in Batumi for affordable city rides, airport transfers and fast everyday transportation around the city.


Available across Batumi via mobile app

24/7','Yandex Go is one of the most widely used ride-hailing apps in Batumi for everyday transportation, airport rides, late-night trips, and moving around the city without needing a rental car. The service works through a mobile app with upfront pricing, live driver tracking, and multiple ride categories depending on comfort level and budget.

The app is especially popular for affordable rides between New Boulevard, Old Batumi, beaches, coworking spaces, restaurants, and nightlife areas. Users can pay by card or cash and order rides at almost any time of day, making it one of the most convenient transport options for both locals and tourists in Batumi.

Perfect for:

- airport transfers

- affordable city rides

- nightlife transportation

- moving around Batumi without a car

- everyday transportation

What to expect:

- app-based ride ordering

- upfront pricing

- card & cash payments

- multiple ride categories

- 24/7 availability

Available across Batumi via mobile app

24/7','https://static.tildacdn.com/tild6532-6332-4562-b765-303230666138/b1d14e09412a4dceb00d.png','["https://static.tildacdn.com/tild6532-6332-4562-b765-303230666138/b1d14e09412a4dceb00d.png", "https://static.tildacdn.com/tild3931-3130-4132-b230-373235633934/6a6a975f3d6e4b23a412.png", "https://static.tildacdn.com/tild3035-3661-4062-b263-303035376561/afd18a712cf04d98a42a.png"]'::jsonb,41.6392202,41.6537751,'2 Sergi Meskhi St, Batumi 6000, Georgia','568 44 44 99','["Monday: 10:00 AM - 6:00 PM", "Tuesday: 10:00 AM - 6:00 PM", "Wednesday: 10:00 AM - 6:00 PM", "Thursday: 10:00 AM - 6:00 PM", "Friday: 10:00 AM - 6:00 PM", "Saturday: 10:00 AM - 6:00 PM", "Sunday: Closed"]'::jsonb,'http://taxibatumi.ge/','https://maps.google.com/?cid=15117106258937335359',5,1332,null,false)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('bolt-taxi','Bolt taxi','Bolt taxi','move-around','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','The most popular ride-hailing app in Batumi for fast and affordable city rides, airport transfers and everyday transportation around the city.


Available across Batumi via mobile app

24/7','Bolt is the main ride-hailing service used in Batumi for everyday city transportation, airport trips, late-night rides, and moving around the city without needing a rental car. The app works similarly to Uber and is widely used both by locals and tourists thanks to its simple interface, fast pickup times, and affordable pricing.','https://static.tildacdn.com/tild3636-3264-4436-b437-663634363064/rideHailing.jpeg',null,41.6230694,41.6386632,'182 Mamia Varshanidze St, Batumi, Georgia','574 30 04 00','["Monday: Open 24 hours", "Tuesday: Open 24 hours", "Wednesday: Open 24 hours", "Thursday: Open 24 hours", "Friday: Open 24 hours", "Saturday: Open 24 hours", "Sunday: Open 24 hours"]'::jsonb,null,'https://maps.google.com/?cid=7009090546794185650',3.6,16,null,false)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('getmancar-carsharing','Getmancar carsharing','Getmancar carsharing','move-around','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','App-based carsharing service in Batumi with per-minute, hourly and daily rentals, smartphone unlocking and flexible city parking zones.


Available across Batumi via mobile app

24/7','Getmancar
A modern app-based carsharing service in Batumi designed for quick city trips, flexible daily rentals, and spontaneous travel around the city without paperwork or rental offices. Cars can be booked, unlocked, and managed directly through the Getmancar mobile app, making it one of the most convenient urban mobility options in Batumi.','https://static.tildacdn.com/tild3534-3866-4938-a139-643736333437/1.jpeg','["https://static.tildacdn.com/tild3534-3866-4938-a139-643736333437/1.jpeg", "https://static.tildacdn.com/tild6238-3364-4935-a636-333734386132/2056cf5f2719f82f4b3c.jpeg", "https://static.tildacdn.com/tild3636-3335-4334-b736-333030626435/car-image.jpeg"]'::jsonb,41.651664,41.6398035,'10 Melashvili Ahmed Street,  6000, Georgia','571 95 19 51','["Monday: 10:00 AM - 7:00 PM", "Tuesday: 10:00 AM - 7:00 PM", "Wednesday: 10:00 AM - 7:00 PM", "Thursday: 10:00 AM - 7:00 PM", "Friday: 10:00 AM - 7:00 PM", "Saturday: 10:00 AM - 7:00 PM", "Sunday: 10:00 AM - 7:00 PM"]'::jsonb,'https://getmancar.com/ru/batumi/rent','https://maps.google.com/?cid=13690451103797621778',4.2,33,null,false)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('easyrent-car-rental','Easyrent car rental','Easyrent car rental','move-around','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','Modern car rental service in Batumi with affordable prices, fast booking process and a wide selection of cars for city driving and road trips around Georgia.


98 Zurab Gorgiladze St, Batumi','EasyRent Car Rental
A modern car rental service in Batumi offering comfortable and flexible rental options for travelers exploring the city, the coastline, and mountain regions of Georgia. EasyRent is popular among tourists and digital nomads thanks to its easy booking process, well-maintained cars, and customer-oriented service.','https://static.tildacdn.com/tild6266-3336-4837-a533-653166356335/IMG_7974jpg.jpeg','["https://static.tildacdn.com/tild6266-3336-4837-a533-653166356335/IMG_7974jpg.jpeg", "https://static.tildacdn.com/tild3831-6334-4733-b164-656566363437/IMG_4974jpg.jpeg", "https://static.tildacdn.com/tild6166-3036-4364-b433-373836616539/photoJPG.jpeg", "https://static.tildacdn.com/tild6439-6231-4134-b466-666166303031/BMW_2JPG.jpeg", "https://static.tildacdn.com/tild6536-3066-4666-a363-643530663362/BMWJPG.jpeg"]'::jsonb,41.6428009,41.6226261,'98 Zurab Gorgiladze St, Batumi 6010, Georgia',null,'["Monday: Open 24 hours", "Tuesday: Open 24 hours", "Wednesday: Open 24 hours", "Thursday: Open 24 hours", "Friday: Open 24 hours", "Saturday: Open 24 hours", "Sunday: Open 24 hours"]'::jsonb,'https://rentcar-batumi.com/ru','https://maps.google.com/?cid=10226520397515253670',4.9,189,null,false)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('vasily-car-rental','Vasily car rental','Vasily car rental','move-around','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','Flexible local car rental service in Batumi with affordable prices, no-deposit options, unlimited mileage and booking without prepayment.


Cars from 80 GEL','A local car rental service in Batumi offering practical and flexible rental options for travelers exploring the city, the coast, and mountain regions of Georgia. Especially convenient for visitors looking for simple rental conditions, affordable pricing, and easy communication without complicated booking process.

The service offers city cars, SUVs, and vehicles for longer trips around Georgia, with flexible rental conditions, unlimited mileage options, and no-deposit cars available for selected vehicles. Suitable both for short Batumi stays and long road trips across the country.

Perfect for:

- road trips around Georgia

- mountain & coastal travel

- affordable daily rentals

- flexible rental conditions

- independent travel around Batumi

What to expect:

- unlimited mileage

- no-deposit car options

- booking without prepayment

- affordable pricing

- local support

Cars from 80 GEL','https://static.tildacdn.com/tild6432-6563-4136-b539-323463363537/images_10.jpeg','["https://static.tildacdn.com/tild6432-6563-4136-b539-323463363537/images_10.jpeg", "https://static.tildacdn.com/tild6336-6533-4137-b066-323532333839/images_9.jpeg", "https://static.tildacdn.com/tild3862-3431-4632-b433-323465386631/images_8.jpeg", "https://static.tildacdn.com/tild3135-6365-4534-b831-366632396161/images_7.jpeg"]'::jsonb,41.6428009,41.6226261,'98 Zurab Gorgiladze St, Batumi 6010, Georgia',null,'["Monday: Open 24 hours", "Tuesday: Open 24 hours", "Wednesday: Open 24 hours", "Thursday: Open 24 hours", "Friday: Open 24 hours", "Saturday: Open 24 hours", "Sunday: Open 24 hours"]'::jsonb,'https://rentcar-batumi.com/ru','https://maps.google.com/?cid=10226520397515253670',4.9,189,null,false)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('geo-drive-car-rental','Geo.drive car rental','Geo.drive car rental','move-around','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','The largest car fleet: economy, comfort, SUVs, premium
Investments | Rent & Buy | Auto Service | Car rental','Reliable car rental service in Batumi with a wide selection of cars, airport delivery, flexible pickup options and 24/7 support for traveling around Georgia. Open 24/7.

90 Lermontov Str, Batumi

Open 24/7

Tags: Car Rental - Airport Delivery - Road Trips - New Boulevard - Travel Around Georgia

A modern car rental service in Batumi popular among tourists, digital nomads, and travelers exploring Georgia by car. GeoDrive offers economy cars, SUVs, premium vehicles, airport delivery, one-way rentals between cities, and full support throughout the rental period.

The service works especially well for people planning road trips outside Batumi - to mountain regions, wineries, beaches, and smaller coastal towns. GeoDrive also provides flexible pickup and return options between Batumi, Tbilisi, Kutaisi, and airports across Georgia.

Perfect for:

- road trips around Georgia

- airport pickup

- long-term rental

- mountain & coastal travel

- flexible intercity travel

What to expect:

- insured vehicles

- 24/7 support

- airport delivery

- one-way rental options

- economy to premium cars

220 Airport Highway, Batumi','https://static.tildacdn.com/tild6532-3138-4035-b436-313637613231/__2026-05-07__200437.png','["https://static.tildacdn.com/tild6532-3138-4035-b436-313637613231/__2026-05-07__200437.png", "https://static.tildacdn.com/tild6437-3437-4232-b237-363062323565/__2026-05-07__200507.png", "https://static.tildacdn.com/tild6363-3664-4361-a230-353030303765/__2026-05-07__200428.png", "https://static.tildacdn.com/tild3466-3532-4532-b037-643864383963/__2026-05-07__200413.png"]'::jsonb,41.6348337,41.6307581,'6010, 90 Lermontov Str, Batumi 6004, Georgia','599 00 16 65','["Monday: Open 24 hours", "Tuesday: Open 24 hours", "Wednesday: Open 24 hours", "Thursday: Open 24 hours", "Friday: Open 24 hours", "Saturday: Open 24 hours", "Sunday: Open 24 hours"]'::jsonb,'https://en.geodrive.info/','https://maps.google.com/?cid=9159298800975966736',4.7,172,null,false)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('grand-bellagio-wellness-spa','Grand Bellagio Wellness & SPA','Grand Bellagio Wellness & SPA','wellness','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','Large modern wellness complex near New Boulevard with indoor pool, hammam, sauna, massage treatments, fitness facilities and sea views.


3 Lech and Maria Kaczynski St, Batumi

Daily: 09:00 - 23:00','Grand Bellagio Wellness & SPA
A large modern wellness complex near New Boulevard with indoor pool, hammam, sauna, massage treatments, fitness facilities, and relaxing sea-view atmosphere. One of the biggest SPA spaces in Batumi for a full recovery and wellness day near the beach.','https://static.tildacdn.com/tild6439-3037-4133-b036-386530333063/0BJ7ExliVmPcH5fSqDUC.jpg','["https://static.tildacdn.com/tild6439-3037-4133-b036-386530333063/0BJ7ExliVmPcH5fSqDUC.jpg", "https://static.tildacdn.com/tild3133-3330-4463-b261-373138393039/QWIL2I6BDUlg6PzQyade.jpg"]'::jsonb,41.62591889999999,41.5988076,'3 Lech and Maria Kaczynski St, Batumi 6000, Georgia','591 24 11 99','["Monday: Open 24 hours", "Tuesday: Open 24 hours", "Wednesday: Open 24 hours", "Thursday: Open 24 hours", "Friday: Open 24 hours", "Saturday: Open 24 hours", "Sunday: Open 24 hours"]'::jsonb,'https://taplink.cc/grand_bellagio','https://maps.google.com/?cid=1091172939744498895',3.9,23,null,true)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('orchid-spa-batumi','Orchid SPA Batumi','Orchid SPA Batumi','wellness','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','Modern wellness & SPA complex near New Boulevard with indoor pool, hammam, Finnish sauna, massage treatments, fitness area and calm luxury atmosphere. 



5a Lech and Maria Kaczynski St, Batumi

Daily: 08:00 - 23:00','A modern premium wellness complex near New Boulevard combining indoor pool, Finnish sauna, hammam, massage treatments, fitness facilities, and a calm luxury atmosphere close to the sea. Orchid SPA is considered one of the most aesthetic and well-designed SPA spaces in Batumi, popular both among hotel guests and locals looking for a slower wellness-focused day.

The space combines soft modern interiors, large relaxation areas, wellness treatments, and a comfortable pool zone that works especially well during rainy weather, recovery days, or quiet evenings after the beach. The SPA also includes fitness facilities and different treatment programs focused on relaxation and recovery.

Perfect for:

- SPA & wellness

- indoor pool

- hammam & sauna

- massage & recovery

- wellness weekends near the sea

What to try:

- relaxing massage

- hammam session

- Finnish sauna

- indoor pool access

- wellness treatments & recovery programs

5a Lech and Maria Kaczynski St, Batumi

Daily: 08:00 - 23:00','https://static.tildacdn.com/tild3963-3537-4966-b439-363634363039/3PwEw33CQZHxJm6i17v4.jpg','["https://static.tildacdn.com/tild3963-3537-4966-b439-363634363039/3PwEw33CQZHxJm6i17v4.jpg", "https://static.tildacdn.com/tild6232-3238-4134-b162-326136303831/MuyqnM5MZj4PImAD3RWz.jpg", "https://static.tildacdn.com/tild3831-3734-4461-a265-316337323061/fzkym1fJD3UCW2DFEQ0i.jpg", "https://static.tildacdn.com/tild3332-3365-4233-b164-656562333130/NeIwaMjHuqifzo0Ptxb7.jpg", "https://static.tildacdn.com/tild3763-3332-4031-a563-623237323838/iNZRt0CLebZnBaHzRSF8.jpg", "https://static.tildacdn.com/tild3533-3765-4130-b635-373564643238/cMxjCYojqHPL62baySyc.jpg"]'::jsonb,41.6246414,41.5980632,'5a Lech and Maria Kaczynski St, Batumi 6000, Georgia','577 20 22 25','["Monday: 8:00 AM - 11:00 PM", "Tuesday: 8:00 AM - 11:00 PM", "Wednesday: 8:00 AM - 11:00 PM", "Thursday: 8:00 AM - 11:00 PM", "Friday: 8:00 AM - 11:00 PM", "Saturday: 8:00 AM - 11:00 PM", "Sunday: 8:00 AM - 11:00 PM"]'::jsonb,'https://www.grandeurhotel.ge/en/gallery/album/601?p=229','https://maps.google.com/?cid=17125848304444406833',4.8,205,null,true)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('eforea-spa-at-hilton-batumi','eforea SPA at Hilton Batumi','eforea SPA at Hilton Batumi','wellness','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','Premium wellness & SPA space inside Hilton Batumi with indoor pool, sauna, steam room, fitness area and signature massage treatments in a calm luxury atmosphere.


40 Rustaveli Ave, Batumi

Daily: 09:00 - 22:00','A modern luxury spa located inside Hilton Batumi, just steps from the boulevard and the sea. eforea SPA is one of the best-known wellness spaces in the city, combining indoor pool access, sauna, steam room, massages, fitness facilities, and relaxing treatments in a calm premium setting.

The spa is especially popular for recovery days, rainy weather, and slower wellness-focused weekends in Batumi. Treatments include classic massages, hot stone therapy, Vichy shower procedures, facials, and wellness rituals designed for full relaxation and reset','https://static.tildacdn.com/tild3633-6431-4665-b462-393533346332/-mg-0897-1.jpg','["https://static.tildacdn.com/tild3633-6431-4665-b462-393533346332/-mg-0897-1.jpg", "https://static.tildacdn.com/tild3764-6564-4864-b235-646238303536/-mg-0873-1.avif", "https://static.tildacdn.com/tild3831-3065-4939-b464-313338333063/-mg-0888-pano-1.avif", "https://static.tildacdn.com/tild3662-3864-4136-b538-393861356132/-mg-0852-1.avif", "https://static.tildacdn.com/tild6262-6433-4937-b337-346663326563/busbt-vicybed.avif", "https://static.tildacdn.com/tild3938-3231-4265-a636-323739613634/-dsf1995.avif"]'::jsonb,41.6493275,41.6257368,'40 Rustaveli Ave, Batumi, Georgia','591 62 85 65','["Monday: 9:00 AM - 10:00 PM", "Tuesday: 9:00 AM - 10:00 PM", "Wednesday: 9:00 AM - 10:00 PM", "Thursday: 9:00 AM - 10:00 PM", "Friday: 9:00 AM - 10:00 PM", "Saturday: 9:00 AM - 10:00 PM", "Sunday: 9:00 AM - 10:00 PM"]'::jsonb,'https://www.hilton.com/en/hotels/busbthi-hilton-batumi/spa/','https://maps.google.com/?cid=14043178094634803777',3.8,13,null,true)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('sheraton-batumi-shine-spa','Sheraton Batumi Shine SPA','Sheraton Batumi Shine SPA','wellness','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','Luxury wellness & SPA space in the center of Batumi with indoor pool, sauna, steam room, jacuzzi, fitness area and premium massage treatments in a classic five-star atmosphere.


28 Rustaveli Ave, Batumi

Daily','Shine SPA at Sheraton Batumi is one of the city''s best-known luxury wellness spaces, combining classic hotel elegance with a full SPA & relaxation experience. The complex includes an indoor pool, jacuzzi, sauna, steam room, fitness facilities, and treatment rooms designed for slower recovery days and calm evenings near the boulevard.

Perfect for:

- SPA & wellness

- indoor pool & jacuzzi

- sauna & steam room

- luxury relaxation

- rainy day recovery

What to try:

- relaxing massage

- jacuzzi & indoor pool

- sauna & steam room

- wellness treatments

- spa evening after the beach

28 Rustaveli Ave, Batumi
Daily','https://static.tildacdn.com/tild3464-6237-4362-b532-306231376136/bussi-outdoor-pool-7.jpeg','["https://static.tildacdn.com/tild3464-6237-4362-b532-306231376136/bussi-outdoor-pool-7.jpeg", "https://static.tildacdn.com/tild3131-3236-4562-b232-363339323536/bussi-outdoor-pool-7.avif", "https://static.tildacdn.com/tild6332-6332-4236-b434-306235333735/bussi-sheraton-fitne.jpeg", "https://static.tildacdn.com/tild6163-3534-4237-a131-323832623139/si-bussi-spa-85853_C.jpeg", "https://static.tildacdn.com/tild3862-3531-4266-b463-616363396637/bussi-turkish-bathro.avif", "https://static.tildacdn.com/tild3265-6539-4362-a437-303464396238/images_6.jpeg", "https://static.tildacdn.com/tild6530-6265-4965-b136-326163613832/images_5.jpeg"]'::jsonb,41.6508774,41.6303844,'28 Rustaveli Ave, Batumi 6000, Georgia','0422 22 90 00',null,'https://www.marriott.com/en-us/hotels/bussi-sheraton-batumi-hotel/overview/?scid=f2ae0541-1279-4f24-b197-a979c79310b0','https://maps.google.com/?cid=15812990505051039975',4.6,4716,null,true)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('radisson-blu-batumi-spa','Radisson Blu Batumi SPA','Radisson Blu Batumi SPA','wellness','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','Modern luxury SPA & wellness center in the heart of Old Batumi with indoor pool, sauna, steam room, fitness area and Anne Semonin treatments overlooking the sea.


1 Ninoshvili St, Batumi

Daily','A premium wellness space inside Radisson Blu Batumi combining panoramic sea views, modern SPA facilities, indoor pool, fitness center, and relaxing treatments in a calm luxury atmosphere. One of the best options in the city for a slower wellness day near the boulevard and Old Batumi.

Perfect for:

- SPA & wellness

- indoor pool

- sauna & steam room

- relaxing massages

- luxury slow living

What to try:

- Anne Semonin treatments

- indoor pool access

- sauna & steam room

- relaxing massage

- wellness day with sea views','https://static.tildacdn.com/tild6337-3630-4437-b338-376136376237/outdoor-pool.jpg','["https://static.tildacdn.com/tild6337-3630-4437-b338-376136376237/outdoor-pool.jpg", "https://static.tildacdn.com/tild6233-6434-4937-b939-613061323033/Radisson-batumi-03.jpeg", "https://static.tildacdn.com/tild3835-3162-4265-a436-333666313065/18310276s.jpg", "https://static.tildacdn.com/tild3731-3635-4965-a531-643866363962/images-3.jpeg", "https://static.tildacdn.com/tild6436-6261-4230-a361-633538353430/images-2.jpeg"]'::jsonb,41.6536078,41.6375782,'1 Ninoshvili St, Batumi 6000, Georgia','0422 25 55 55',null,'https://www.radissonhotels.com/en-us/hotels/radisson-blu-batumi?cid=a:se+b:gmb+c:emea+i:local+e:rdb+d:eerut+h:GEBUS1','https://maps.google.com/?cid=4155303521286385238',4.6,4324,null,true)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('colosseum-marina-spa','Colosseum Marina SPA','Colosseum Marina SPA','wellness','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','Large seaside SPA complex with indoor & outdoor pools, sauna, steam room, massage and direct beach access near New Boulevard. 
18 Sherif Khimshiashvili St, Batumi Daily: 08:00 - 22:00','A large seaside wellness complex in New Boulevard with indoor and outdoor pools, sauna, steam room, massage treatments, gym, and direct beach access. One of the most popular SPA options in Batumi for a full relaxing day by the sea.

The hotel is especially known for its big indoor pool area, heated pool, outdoor seasonal pool, wellness zone, and panoramic sea views. Works well both for quick recovery days and full slow-living weekends near the beach.

Perfect for:

- SPA & wellness

- indoor & outdoor pools

- sauna & steam room

- massage & recovery

- seaside relaxation

What to try:

- indoor heated pool

- sauna & steam room

- relaxing massage

- outdoor pool in summer

- spa day with sea views

18 Sherif Khimshiashvili St, Batumi

Daily: 08:00 - 22:00','https://static.tildacdn.com/tild6437-6263-4430-a537-666464303832/52260320.jpg','["https://static.tildacdn.com/tild6437-6263-4430-a537-666464303832/52260320.jpg", "https://static.tildacdn.com/tild3765-6439-4334-a134-626166633064/__2026-05-07__183639.png", "https://static.tildacdn.com/tild3137-3261-4965-b437-396266303635/__2026-05-07__183628.png", "https://static.tildacdn.com/tild3039-3763-4630-a133-663437353130/__2026-05-07__183617.png"]'::jsonb,41.6375614,41.6093267,'18 Sherif Khimshiashvili St, Batumi, Georgia','0422 24 44 00',null,'http://www.colosseummarina.ge/','https://maps.google.com/?cid=18361015822331458327',3.9,451,null,true)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('le-m-ridien-batumi-spa-wellness','Le Meridien Batumi SPA & Wellness','Le Meridien Batumi SPA & Wellness','wellness','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','Modern premium hotel SPA with indoor pool, sauna, steam room, fitness area and wellness treatments in the center of Batumi.
40 Rustaveli Ave, Batumi

Daily','A premium wellness and SPA space in the center of Old Batumi with indoor and outdoor pools, sauna, steam room, massages, fitness area, and panoramic sea views. One of the best options in the city for a slower luxury-style wellness day near the boulevard and the beach. The hotel''s Explore Spa is especially known for its calm atmosphere, modern design, pool area, and massage treatments.

Perfect for:

- SPA & wellness

- indoor pool

- sauna & steam room

- rainy day relaxation

- luxury slow living

What to try:

- relaxing massage

- sauna & steam room

- indoor pool access

- wellness treatments

- spa day with sea views

Ninoshvili / Zhgenti Street, Batumi

Daily: 07:00 - 23:00','https://static.tildacdn.com/tild6536-3234-4463-b131-313564343933/md-busmd-spa-23541-C.jpeg','["https://static.tildacdn.com/tild6536-3234-4463-b131-313564343933/md-busmd-spa-23541-C.jpeg", "https://static.tildacdn.com/tild6431-3035-4564-b939-356137346266/md-busmd-spa-recepti.jpeg", "https://static.tildacdn.com/tild3065-3138-4336-a638-646266613739/md-busmd-spa-34360-C.jpeg", "https://static.tildacdn.com/tild6536-6364-4234-a365-343438363062/md-busmd-spa-37812-C.jpeg", "https://static.tildacdn.com/tild3865-3635-4034-b232-356633613466/md-busmd-fitness-271.jpeg", "https://static.tildacdn.com/tild3338-3637-4036-b066-303164663463/md-busmd-indoor-pool.jpeg", "https://static.tildacdn.com/tild6230-3732-4135-b735-633565373137/md-busmd-outdoor-poo.jpeg"]'::jsonb,41.65397730000001,41.636475,'MJ3P+JGG, Ninoshvili / Zhgenti Street, Batumi 6010, Georgia','0422 29 90 90',null,'https://www.marriott.com/en-us/hotels/busmd-le-meridien-batumi/overview/?scid=f2ae0541-1279-4f24-b197-a979c79310b0','https://maps.google.com/?cid=18321831435634645900',4.5,776,null,true)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('gardenia-spa-at-steps-batumi','Gardenia Spa at STEPS Batumi','Gardenia Spa at STEPS Batumi','wellness','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','Relaxing spa & wellness space with sauna, steam room, massage and pool access.
2B Grigol Lortkipanidze St, Batumi
Daily','Gardenia Spa at STEPS Batumi
A relaxed spa and wellness space located inside STEPS Batumi Hotel & Suites, close to New Boulevard and the sea. Gardenia Spa is a good option for a calm reset day without leaving the city - with massage, sauna, steam room, fitness facilities and pool access in one place.','https://static.tildacdn.com/tild3830-3733-4734-b331-306631643038/1726216864999-DJI_07.jpg','["https://static.tildacdn.com/tild3830-3733-4734-b331-306631643038/1726216864999-DJI_07.jpg", "https://static.tildacdn.com/tild3932-6330-4932-a631-616566653966/1726216885452-DSC_52.jpg", "https://static.tildacdn.com/tild3466-3965-4137-a639-613237333664/1726216865000-DSC_52.jpg", "https://static.tildacdn.com/tild3165-3235-4137-b062-613239333239/1726216885451-DSC_52.jpg", "https://static.tildacdn.com/tild3633-3232-4639-b265-626262643236/1726216885450-DSC_52.jpg", "https://static.tildacdn.com/tild3938-3964-4230-b666-336461636162/1726216864999-DSC_50.jpg"]'::jsonb,41.6255561,41.5999507,'2B Grigol Lortkipanidze St, Batumi 6000, Georgia','577 27 00 22',null,'https://www.stepsbatumi.ge/en/','https://maps.google.com/?cid=14643067122576077215',4.9,131,null,true)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('d-block-workspace-rooms-batumi','D Block Workspace @ Rooms Batumi','D Block Workspace @ Rooms Batumi','work','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','Stylish coworking and creative workspace inside Rooms Batumi with modern design, relaxed work atmosphere and strong creative community vibe.


10 Gogebashvili St, Batumi

Open 24/7','D Block Workspace @ Rooms Batumi
A stylish coworking and creative workspace located inside Rooms Batumi, combining modern design, comfortable work areas, fast Wi-Fi, and relaxed creative atmosphere in the heart of Old Batumi. D Block is especially popular among freelancers, designers, entrepreneurs, and remote workers looking for a more aesthetic and inspiring work environment near the sea.','https://static.tildacdn.com/tild3934-6534-4436-a237-643136343066/dblock-batumi-slide-.jpeg','["https://static.tildacdn.com/tild3934-6534-4436-a237-643136343066/dblock-batumi-slide-.jpeg", "https://static.tildacdn.com/tild6362-3964-4166-a434-666563346335/dblock-batumi-slide-.jpeg", "https://static.tildacdn.com/tild3232-6130-4564-b664-663637636236/dblock-batumi-slide-.jpeg", "https://static.tildacdn.com/tild6435-6539-4863-a630-306332316564/meeting20rooms1.jpeg", "https://static.tildacdn.com/tild3030-3361-4535-a335-616339623830/meeting20rooms2.jpeg"]'::jsonb,41.6509955,41.6432727,'10 Gogebashvili St, Batumi 6010, Georgia','032 200 22 99','["Monday: Open 24 hours", "Tuesday: Open 24 hours", "Wednesday: Open 24 hours", "Thursday: Open 24 hours", "Friday: Open 24 hours", "Saturday: Open 24 hours", "Sunday: Open 24 hours"]'::jsonb,'https://dblock.com/','https://maps.google.com/?cid=10742188157882649731',4,2,null,true)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('terminal-coworking','Terminal coworking','Terminal coworking','work','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','Modern coworking and creative workspace in the center of Batumi with fast Wi-Fi, comfortable work areas, networking atmosphere and regular community events.


37 Memed Abashidze Ave, Batumi

Daily','Terminal Batumi
A modern coworking and creative workspace in the center of Batumi designed for freelancers, startups, remote workers, and digital nomads. Terminal combines comfortable work areas, fast Wi-Fi, meeting rooms, community atmosphere, and regular networking events in one of the city''s most active professional spaces.','https://static.tildacdn.com/tild3539-3032-4731-b462-303539386139/bfbd9051ec13-desktop.jpeg','["https://static.tildacdn.com/tild3539-3032-4731-b462-303539386139/bfbd9051ec13-desktop.jpeg", "https://static.tildacdn.com/tild3364-3835-4430-a561-323365373166/ec3ff5adbbdd-desktop.jpeg", "https://static.tildacdn.com/tild6264-3763-4435-b036-386530343865/e8891f0a40e7-desktop.jpeg", "https://static.tildacdn.com/tild3239-6132-4536-a565-313435336639/4c694d36018d-desktop.jpeg", "https://static.tildacdn.com/tild6630-3339-4630-b761-383737396563/0626db1119f6-desktop.jpeg", "https://static.tildacdn.com/tild3164-6662-4966-a666-323436323835/1f070892c109-desktop.jpeg", "https://static.tildacdn.com/tild3662-3332-4461-b466-326634383137/d08e3340a344-desktop.jpeg"]'::jsonb,41.6521814,41.6381304,'Akhmeteli str, 7a,  6000, Georgia','032 212 10 15','["Monday: 9:00 AM - 9:00 PM", "Tuesday: 9:00 AM - 9:00 PM", "Wednesday: 9:00 AM - 9:00 PM", "Thursday: 9:00 AM - 9:00 PM", "Friday: 9:00 AM - 9:00 PM", "Saturday: 9:00 AM - 9:00 PM", "Sunday: 9:00 AM - 9:00 PM"]'::jsonb,'https://terminal.center/','https://maps.google.com/?cid=11920916313064438379',4.3,45,null,true)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;
insert into guide_places (slug,name,title,category,status,city_id,summary,body,image,photos,lat,lng,address,phone,hours,website,gmaps_url,rating,reviews,tags,show_on_map) values ('lendspace','LendSpace','LendSpace','work','published','7113ceaf-ff3a-4786-862c-cbb19c6507fd','Modern coworking space near New Boulevard with fast Wi-Fi, meeting rooms, quiet work zones and strong digital nomad atmosphere.

4 Sherif Khimshiashvili St, Batumi
Daily: 10:00 - 22:00','A modern coworking space near New Boulevard and the sea, popular among freelancers, remote workers, startups, and digital nomads in Batumi. LendSpace combines a relaxed atmosphere, fast Wi-Fi, meeting rooms, quiet zones, and comfortable workspaces with a strong remote-work community vibe.

The space is especially convenient for people staying near the boulevard area who want a calm productive environment close to cafes, restaurants, and the beach. LendSpace offers open-space desks, fixed workplaces, meeting rooms, tea & coffee, and comfortable common areas designed for long workdays and networking.

Perfect for:

- remote work

- freelancers & startups

- laptop-friendly workdays

- networking & community

- work near the sea

What to expect:

- fast Wi-Fi

- meeting rooms

- quiet zones

- coffee & tea

- flexible daily and monthly passes

4 Sherif Khimshiashvili St, Batumi

Daily: 10:00 - 22:00','https://static.tildacdn.com/tild3666-6330-4836-a265-653064653062/332703154_2004334259.jpeg','["https://static.tildacdn.com/tild3666-6330-4836-a265-653064653062/332703154_2004334259.jpeg", "https://static.tildacdn.com/tild6136-3839-4666-b439-386638616239/331503737_6658776419.jpeg", "https://static.tildacdn.com/tild3431-3565-4139-a136-613738323036/photo_2023-06-20_09-.jpeg", "https://static.tildacdn.com/tild6366-3234-4938-b264-363166366630/photo_2023-06-20_09-.jpeg", "https://static.tildacdn.com/tild6330-3731-4437-b939-323434623630/photo_2023-06-20_09-.jpeg", "https://static.tildacdn.com/tild6661-3230-4633-a535-326233636232/339952447_9874609922.jpeg", "https://static.tildacdn.com/tild3430-6463-4762-b337-633136393266/344733002_1290311358.jpeg"]'::jsonb,41.64353699999999,41.6159553,'4 Sherif Khimshiashvili St, Batumi 6000, Georgia','500 70 35 82','["Monday: 10:00 AM - 10:00 PM", "Tuesday: 10:00 AM - 10:00 PM", "Wednesday: 10:00 AM - 10:00 PM", "Thursday: 10:00 AM - 10:00 PM", "Friday: 10:00 AM - 10:00 PM", "Saturday: 10:00 AM - 10:00 PM", "Sunday: 10:00 AM - 10:00 PM"]'::jsonb,'https://lendspace.ge/','https://maps.google.com/?cid=16288971574140874946',4.7,78,null,true)
  on conflict (slug) do update set name=excluded.name,title=excluded.title,category=excluded.category,status=excluded.status,city_id=excluded.city_id,summary=excluded.summary,body=excluded.body,image=excluded.image,photos=excluded.photos,lat=excluded.lat,lng=excluded.lng,address=excluded.address,phone=excluded.phone,hours=excluded.hours,website=excluded.website,gmaps_url=excluded.gmaps_url,rating=excluded.rating,reviews=excluded.reviews,tags=excluded.tags,show_on_map=excluded.show_on_map;