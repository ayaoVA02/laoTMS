/*
  # Seed LaoTMS with Real Data

  1. Users - 4 demo users (Admin, Staff, Entrepreneur, Tourist)
  2. Profile tables - entrepreneurs, tourists, staffs
  3. Types - 8 attraction categories
  4. Attractions - 12 real Laos attractions with Cloudflare R2 images
  5. Attraction images - multiple images per attraction
  6. Reviews - 8 real reviews
  7. Travel plans - 3 demo plans
  8. Travel plan details - plan-attraction links
  9. Favorites - sample favorites
  10. Promotions - 3 sample promotions
  11. Notifications - 7 sample notifications

  Note: Passwords are hashed with bcrypt (password: "password123")
  Using Cloudflare R2 bucket: laotms at https://f8bc59debf0847d2b7cdd5fbb5102d21.r2.cloudflarestorage.com/laotms
*/

-- Insert users (password_hash is bcrypt hash of "password123")
INSERT INTO users (user_id, email, password_hash, role, is_active) VALUES
  ('a1b2c3d4-e5f6-7890-abcd-ef1234567890', 'admin@laotms.la', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7pK0dC6S8Y5qXz5Z3vR1a2e', 'ADMIN', true),
  ('b2c3d4e5-f6a7-8901-bcde-f12345678901', 'staff@laotms.la', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7pK0dC6S8Y5qXz5Z3vR1a2e', 'STAFF', true),
  ('c3d4e5f6-a7b8-9012-cdef-123456789012', 'somsak@laotms.la', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7pK0dC6S8Y5qXz5Z3vR1a2e', 'ENTREPRENEUR', true),
  ('d4e5f6a7-b8c9-0123-defa-234567890123', 'john@travel.com', '$2a$10$N9qo8uLOickgx2ZMRZoMyeIjZAgcfl7pK0dC6S8Y5qXz5Z3vR1a2e', 'TOURIST', true)
ON CONFLICT (email) DO NOTHING;

-- Insert entrepreneur profile
INSERT INTO entrepreneurs (en_id, user_id, position, first_name, last_name, gender, profile_img, phone, nationality, province, district, village) VALUES
  ('e1f2a3b4-c5d6-7890-abcd-ef1234567890', 'c3d4e5f6-a7b8-9012-cdef-123456789012', 'Owner', 'Somsak', 'Vongvichit', 'MALE', '', '+856 20 5555 1234', 'Lao', 'Vientiane', 'Chanthabouly', 'Sisattanak')
ON CONFLICT DO NOTHING;

-- Insert tourist profile
INSERT INTO tourists (tourist_id, user_id, preferences, first_name, last_name, gender, profile_img, phone, nationality) VALUES
  ('f2a3b4c5-d6e7-8901-bcde-f12345678901', 'd4e5f6a7-b8c9-0123-defa-234567890123', 'nature,temple,food', 'John', 'Traveler', 'MALE', '', '+1 555 0123', 'American')
ON CONFLICT DO NOTHING;

-- Insert staff profile
INSERT INTO staffs (staff_id, user_id, staff_code, first_name, last_name, gender, profile_img, phone, nationality, province, district, village, status) VALUES
  ('a3b4c5d6-e7f8-9012-cdef-123456789012', 'b2c3d4e5-f6a7-8901-bcde-f12345678901', 'STF-001', 'Phet', 'Souvannavong', 'MALE', '', '+856 20 7777 5678', 'Lao', 'Vientiane', 'Sisattanak', 'Ban Pong', 'active')
ON CONFLICT DO NOTHING;

-- Insert types (attraction categories)
INSERT INTO types (type_id, name_la, name_en, description, type_icon, type_image, is_active) VALUES
  ('11111111-1111-1111-1111-111111111111', 'ວັດ', 'Temples', 'Buddhist temples and religious sites', 'Landmark', '', true),
  ('22222222-2222-2222-2222-222222222222', 'ທຳມະຊາດ', 'Nature', 'Natural attractions including waterfalls, forests, and caves', 'TreePine', '', true),
  ('33333333-3333-3333-3333-333333333333', 'ຜະຈົນໄພ', 'Adventure', 'Adventure and outdoor activities', 'Mountain', '', true),
  ('44444444-4444-4444-4444-444444444444', 'ວັດທະນະທຳ', 'Culture', 'Cultural experiences and traditions', 'Palette', '', true),
  ('55555555-5555-5555-5555-555555555555', 'ອາຫານ', 'Food & Dining', 'Lao cuisine and dining experiences', 'UtensilsCrossed', '', true),
  ('66666666-6666-6666-6666-666666666666', 'ຫາດຊາດ', 'Beaches', 'Beaches and island destinations', 'Waves', '', true),
  ('77777777-7777-7777-7777-777777777777', 'ປະຫວັດສາດ', 'Historical', 'Historical and archaeological sites', 'Building2', '', true),
  ('88888888-8888-8888-8888-888888888888', 'ກາງຄືນ', 'Nightlife', 'Nightlife and entertainment', 'Music', '', true)
ON CONFLICT DO NOTHING;

-- Insert attractions with Cloudflare R2 image URLs
INSERT INTO attractions (attraction_id, user_id, type_id, name_la, name_en, thumbnail_image, description, province, district, village, latitude, longitude, location, entry_fee_foreigner, best_time_visit, has_parking, is_free_parking, parking_price, has_restaurant, has_accommodation, acc_price, has_internet, is_free_wifi, is_free_entry, open_time, close_time, status, activity, social_share, rating, review_count, featured, created_at) VALUES
  ('10000000-0000-0000-0000-000000000001', 'c3d4e5f6-a7b8-9012-cdef-123456789012', '11111111-1111-1111-1111-111111111111', 'ພະທາດຫຼວງ', 'Pha That Luang', 'https://f8bc59debf0847d2b7cdd5fbb5102d21.r2.cloudflarestorage.com/laotms/attractions/pha-that-luang/thumb.jpg', 'Pha That Luang is a gold-covered large Buddhist stupa in the centre of Vientiane. Since its initial establishment, suggested to be in the 3rd century, the stupa has undergone several reconstructions as recently as the 1930s due to foreign invasions. It is generally regarded as the most important national monument in Laos and a national symbol.', 'Vientiane', 'Chanthabouly', 'That Luang', 17.90940000, 102.64080000, 'Vientiane', 15000, 'November to February', true, true, 0, false, false, 0, false, false, false, '08:00', '17:00', 'approved', 'Sightseeing, Photography, Cultural tours', true, 4.80, 342, true, '2025-01-15'),

  ('10000000-0000-0000-0000-000000000002', 'c3d4e5f6-a7b8-9012-cdef-123456789012', '22222222-2222-2222-2222-222222222222', 'ນ້ຳຕົກດັງກວາງຊີ', 'Kuang Si Falls', 'https://f8bc59debf0847d2b7cdd5fbb5102d21.r2.cloudflarestorage.com/laotms/attractions/kuang-si-falls/thumb.jpg', 'The Kuang Si Falls is a three-tier waterfall about 29 kilometres south of Luang Prabang. The falls begin in shallow pools atop a steep hillside. These lead to the main fall with a 60-metre cascade. The water collects in numerous turquoise blue pools as it flows downstream.', 'Luang Prabang', 'Luang Prabang', 'Kuang Si', 19.74670000, 101.99330000, 'Luang Prabang', 25000, 'November to March', true, true, 0, true, false, 0, false, false, false, '07:00', '18:00', 'approved', 'Swimming, Hiking, Photography, Picnic', true, 4.90, 567, true, '2025-02-10'),

  ('10000000-0000-0000-0000-000000000003', 'c3d4e5f6-a7b8-9012-cdef-123456789012', '11111111-1111-1111-1111-111111111111', 'ວັດຊຽງທອງ', 'Wat Xieng Thong', 'https://f8bc59debf0847d2b7cdd5fbb5102d21.r2.cloudflarestorage.com/laotms/attractions/wat-xieng-thong/thumb.jpg', 'Wat Xieng Thong is a Buddhist temple in Luang Prabang. It was built in 1560 by King Setthathirath and was under the patronage of the royal family. The temple is considered the most beautiful in Luang Prabang and is a masterpiece of Laotian art.', 'Luang Prabang', 'Luang Prabang', 'Xieng Thong', 19.89330000, 102.13500000, 'Luang Prabang', 20000, 'October to April', true, true, 0, false, false, 0, false, false, false, '06:00', '18:00', 'approved', 'Sightseeing, Cultural tours, Photography', false, 4.70, 289, true, '2025-01-20'),

  ('10000000-0000-0000-0000-000000000004', 'c3d4e5f6-a7b8-9012-cdef-123456789012', '33333333-3333-3333-3333-333333333333', 'ວັງວຽງ', 'Vang Vieng Adventure', 'https://f8bc59debf0847d2b7cdd5fbb5102d21.r2.cloudflarestorage.com/laotms/attractions/vang-vieng/thumb.jpg', 'Vang Vieng is a town surrounded by dramatic karst hill landscapes and is a popular destination for adventure tourism. Activities include tubing on the Nam Song River, rock climbing, hiking, and exploring caves.', 'Vientiane', 'Vang Vieng', 'Vang Vieng', 18.92360000, 102.83280000, 'Vang Vieng', 50000, 'November to March', true, false, 5000, true, true, 150000, true, true, false, '06:00', '20:00', 'approved', 'Tubing, Rock Climbing, Caving, Kayaking', true, 4.50, 412, true, '2025-03-05'),

  ('10000000-0000-0000-0000-000000000005', 'c3d4e5f6-a7b8-9012-cdef-123456789012', '77777777-7777-7777-7777-777777777777', 'ປະຕູໄຊ', 'Patuxai Monument', 'https://f8bc59debf0847d2b7cdd5fbb5102d21.r2.cloudflarestorage.com/laotms/attractions/patuxai/thumb.jpg', 'Patuxai is a war monument in the centre of Vientiane, built between 1957 and 1968. The monument was built with concrete donated by the US, originally intended for a new airport. It is sometimes called the Arc de Triomphe of Vientiane.', 'Vientiane', 'Chanthabouly', 'Patuxai', 17.91270000, 102.62970000, 'Vientiane', 10000, 'Year-round', true, true, 0, false, false, 0, false, false, false, '08:00', '17:00', 'approved', 'Sightseeing, Photography, Viewing Platform', false, 4.30, 198, false, '2025-02-28'),

  ('10000000-0000-0000-0000-000000000006', 'c3d4e5f6-a7b8-9012-cdef-123456789012', '77777777-7777-7777-7777-777777777777', 'ທົ່ງໄຫຫິນ', 'Plain of Jars', 'https://f8bc59debf0847d2b7cdd5fbb5102d21.r2.cloudflarestorage.com/laotms/attractions/plain-of-jars/thumb.jpg', 'The Plain of Jars is a megalithic archaeological landscape in Laos. It consists of thousands of stone jars scattered around the upland valleys and the lower foothills of the central plain of the Xiangkhoang Plateau.', 'Xieng Khouang', 'Xieng Khouang', 'Ban Ang', 19.41670000, 103.15000000, 'Xieng Khouang', 15000, 'November to March', true, true, 0, false, false, 0, false, false, false, '08:00', '16:00', 'approved', 'Archaeological tours, Photography, Hiking', true, 4.40, 156, false, '2025-04-10'),

  ('10000000-0000-0000-0000-000000000007', 'c3d4e5f6-a7b8-9012-cdef-123456789012', '44444444-4444-4444-4444-444444444444', 'ຕະຫຼາດກາງຄືນຫຼວງພະບາງ', 'Night Market Luang Prabang', 'https://f8bc59debf0847d2b7cdd5fbb5102d21.r2.cloudflarestorage.com/laotms/attractions/night-market-lp/thumb.jpg', 'The Luang Prabang Night Market is a vibrant market that opens every evening on Sisavangvong Road. It offers a wide variety of handmade textiles, clothing, jewelry, and local food.', 'Luang Prabang', 'Luang Prabang', 'Sisavangvong', 19.88500000, 102.13330000, 'Luang Prabang', 0, 'Year-round', false, true, 0, true, false, 0, false, false, true, '17:00', '22:00', 'approved', 'Shopping, Street Food, Cultural Experience', true, 4.60, 378, true, '2025-01-05'),

  ('10000000-0000-0000-0000-000000000008', 'c3d4e5f6-a7b8-9012-cdef-123456789012', '22222222-2222-2222-2222-222222222222', 'ນ້ຳຕົກຕາດໂລ', 'Tat Lo Waterfall', 'https://f8bc59debf0847d2b7cdd5fbb5102d21.r2.cloudflarestorage.com/laotms/attractions/tat-lo/thumb.jpg', 'Tat Lo is a scenic waterfall located in Salavan Province in southern Laos. The waterfall is surrounded by lush jungle and is a popular spot for swimming and relaxation. The nearby village offers homestay experiences.', 'Salavan', 'Salavan', 'Tat Lo', 15.11670000, 106.41670000, 'Salavan', 5000, 'June to October', true, true, 0, false, true, 80000, false, false, false, '06:00', '18:00', 'approved', 'Swimming, Nature Walks, Homestay', false, 4.20, 89, false, '2025-05-01'),

  ('10000000-0000-0000-0000-000000000009', 'c3d4e5f6-a7b8-9012-cdef-123456789012', '55555555-5555-5555-5555-555555555555', 'ຫ້ອງຮຽນກຽນອາຫານລາວ', 'Lao Cooking Class', 'https://f8bc59debf0847d2b7cdd5fbb5102d21.r2.cloudflarestorage.com/laotms/attractions/cooking-class/thumb.jpg', 'Experience authentic Lao cuisine with a hands-on cooking class. Learn to prepare traditional dishes like laap, tam mak hoong, and sticky rice. Visit the local market to select fresh ingredients before cooking.', 'Vientiane', 'Chanthabouly', 'Ban Anou', 17.97570000, 102.63310000, 'Vientiane', 75000, 'Year-round', false, true, 0, false, false, 0, true, true, false, '09:00', '14:00', 'approved', 'Cooking, Cultural Experience, Market Tour', true, 4.70, 234, false, '2025-03-20'),

  ('10000000-0000-0000-0000-000000000010', 'c3d4e5f6-a7b8-9012-cdef-123456789012', '66666666-6666-6666-6666-666666666666', 'ສີພັນດອນ', 'Si Phan Don (4000 Islands)', 'https://f8bc59debf0847d2b7cdd5fbb5102d21.r2.cloudflarestorage.com/laotms/attractions/si-phan-don/thumb.jpg', 'Si Phan Don, or the 4000 Islands, is a riverine archipelago in the Mekong River in southern Laos. The area is known for its relaxed atmosphere, beautiful scenery, and the rare Irrawaddy dolphins.', 'Champasak', 'Khong', 'Don Det', 14.11670000, 105.85000000, 'Champasak', 0, 'November to February', false, true, 0, true, true, 120000, true, true, true, '00:00', '23:59', 'approved', 'Kayaking, Dolphin Watching, Cycling, Relaxation', true, 4.60, 267, true, '2025-02-15'),

  ('10000000-0000-0000-0000-000000000011', 'c3d4e5f6-a7b8-9012-cdef-123456789012', '55555555-5555-5555-5555-555555555555', 'ທັດສະນາກາດກາເຟບໍລະເວນ', 'Bolaven Plateau Coffee Tour', 'https://f8bc59debf0847d2b7cdd5fbb5102d21.r2.cloudflarestorage.com/laotms/attractions/bolaven-coffee/thumb.jpg', 'The Bolaven Plateau is famous for its coffee plantations. Take a guided tour through lush coffee farms, learn about the coffee-making process from bean to cup, and taste some of the finest coffee in Southeast Asia.', 'Champasak', 'Pakse', 'Bolaven', 15.11670000, 106.45000000, 'Pakse', 60000, 'October to March', true, true, 0, true, false, 0, false, false, false, '08:00', '16:00', 'pending', 'Coffee Tasting, Farm Tours, Nature Walks', true, 4.50, 145, false, '2025-04-25'),

  ('10000000-0000-0000-0000-000000000012', 'c3d4e5f6-a7b8-9012-cdef-123456789012', '88888888-8888-8888-8888-888888888888', 'ຍານການຄືນນະຄອນຫຼວງ', 'Vientiane Nightlife District', 'https://f8bc59debf0847d2b7cdd5fbb5102d21.r2.cloudflarestorage.com/laotms/attractions/vientiane-nightlife/thumb.jpg', 'Experience the vibrant nightlife of Vientiane along the Mekong River. From rooftop bars to live music venues, the capital city offers a growing nightlife scene that blends traditional Lao culture with modern entertainment.', 'Vientiane', 'Chanthabouly', 'Mekong Riverside', 17.96890000, 102.62890000, 'Vientiane', 0, 'Year-round', false, true, 0, true, true, 200000, true, true, true, '18:00', '02:00', 'approved', 'Live Music, Dining, Bar Hopping', false, 4.10, 112, false, '2025-03-15')
ON CONFLICT DO NOTHING;

-- Insert attraction images
INSERT INTO attraction_images (image_id, attraction_id, image_url, display_order) VALUES
  ('20000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'https://f8bc59debf0847d2b7cdd5fbb5102d21.r2.cloudflarestorage.com/laotms/attractions/pha-that-luang/1.jpg', 0),
  ('20000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 'https://f8bc59debf0847d2b7cdd5fbb5102d21.r2.cloudflarestorage.com/laotms/attractions/pha-that-luang/2.jpg', 1),
  ('20000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000001', 'https://f8bc59debf0847d2b7cdd5fbb5102d21.r2.cloudflarestorage.com/laotms/attractions/pha-that-luang/3.jpg', 2),
  ('20000000-0000-0000-0000-000000000004', '10000000-0000-0000-0000-000000000002', 'https://f8bc59debf0847d2b7cdd5fbb5102d21.r2.cloudflarestorage.com/laotms/attractions/kuang-si-falls/1.jpg', 0),
  ('20000000-0000-0000-0000-000000000005', '10000000-0000-0000-0000-000000000002', 'https://f8bc59debf0847d2b7cdd5fbb5102d21.r2.cloudflarestorage.com/laotms/attractions/kuang-si-falls/2.jpg', 1),
  ('20000000-0000-0000-0000-000000000006', '10000000-0000-0000-0000-000000000002', 'https://f8bc59debf0847d2b7cdd5fbb5102d21.r2.cloudflarestorage.com/laotms/attractions/kuang-si-falls/3.jpg', 2),
  ('20000000-0000-0000-0000-000000000007', '10000000-0000-0000-0000-000000000003', 'https://f8bc59debf0847d2b7cdd5fbb5102d21.r2.cloudflarestorage.com/laotms/attractions/wat-xieng-thong/1.jpg', 0),
  ('20000000-0000-0000-0000-000000000008', '10000000-0000-0000-0000-000000000003', 'https://f8bc59debf0847d2b7cdd5fbb5102d21.r2.cloudflarestorage.com/laotms/attractions/wat-xieng-thong/2.jpg', 1),
  ('20000000-0000-0000-0000-000000000009', '10000000-0000-0000-0000-000000000004', 'https://f8bc59debf0847d2b7cdd5fbb5102d21.r2.cloudflarestorage.com/laotms/attractions/vang-vieng/1.jpg', 0),
  ('20000000-0000-0000-0000-000000000010', '10000000-0000-0000-0000-000000000004', 'https://f8bc59debf0847d2b7cdd5fbb5102d21.r2.cloudflarestorage.com/laotms/attractions/vang-vieng/2.jpg', 1),
  ('20000000-0000-0000-0000-000000000011', '10000000-0000-0000-0000-000000000005', 'https://f8bc59debf0847d2b7cdd5fbb5102d21.r2.cloudflarestorage.com/laotms/attractions/patuxai/1.jpg', 0),
  ('20000000-0000-0000-0000-000000000012', '10000000-0000-0000-0000-000000000005', 'https://f8bc59debf0847d2b7cdd5fbb5102d21.r2.cloudflarestorage.com/laotms/attractions/patuxai/2.jpg', 1),
  ('20000000-0000-0000-0000-000000000013', '10000000-0000-0000-0000-000000000006', 'https://f8bc59debf0847d2b7cdd5fbb5102d21.r2.cloudflarestorage.com/laotms/attractions/plain-of-jars/1.jpg', 0),
  ('20000000-0000-0000-0000-000000000014', '10000000-0000-0000-0000-000000000007', 'https://f8bc59debf0847d2b7cdd5fbb5102d21.r2.cloudflarestorage.com/laotms/attractions/night-market-lp/1.jpg', 0),
  ('20000000-0000-0000-0000-000000000015', '10000000-0000-0000-0000-000000000007', 'https://f8bc59debf0847d2b7cdd5fbb5102d21.r2.cloudflarestorage.com/laotms/attractions/night-market-lp/2.jpg', 1),
  ('20000000-0000-0000-0000-000000000016', '10000000-0000-0000-0000-000000000008', 'https://f8bc59debf0847d2b7cdd5fbb5102d21.r2.cloudflarestorage.com/laotms/attractions/tat-lo/1.jpg', 0),
  ('20000000-0000-0000-0000-000000000017', '10000000-0000-0000-0000-000000000009', 'https://f8bc59debf0847d2b7cdd5fbb5102d21.r2.cloudflarestorage.com/laotms/attractions/cooking-class/1.jpg', 0),
  ('20000000-0000-0000-0000-000000000018', '10000000-0000-0000-0000-000000000009', 'https://f8bc59debf0847d2b7cdd5fbb5102d21.r2.cloudflarestorage.com/laotms/attractions/cooking-class/2.jpg', 1),
  ('20000000-0000-0000-0000-000000000019', '10000000-0000-0000-0000-000000000010', 'https://f8bc59debf0847d2b7cdd5fbb5102d21.r2.cloudflarestorage.com/laotms/attractions/si-phan-don/1.jpg', 0),
  ('20000000-0000-0000-0000-000000000020', '10000000-0000-0000-0000-000000000010', 'https://f8bc59debf0847d2b7cdd5fbb5102d21.r2.cloudflarestorage.com/laotms/attractions/si-phan-don/2.jpg', 1),
  ('20000000-0000-0000-0000-000000000021', '10000000-0000-0000-0000-000000000011', 'https://f8bc59debf0847d2b7cdd5fbb5102d21.r2.cloudflarestorage.com/laotms/attractions/bolaven-coffee/1.jpg', 0),
  ('20000000-0000-0000-0000-000000000022', '10000000-0000-0000-0000-000000000012', 'https://f8bc59debf0847d2b7cdd5fbb5102d21.r2.cloudflarestorage.com/laotms/attractions/vientiane-nightlife/1.jpg', 0)
ON CONFLICT DO NOTHING;

-- Insert reviews
INSERT INTO reviews (review_id, user_id, attraction_id, rating, content, created_at) VALUES
  ('30000000-0000-0000-0000-000000000001', 'd4e5f6a7-b8c9-0123-defa-234567890123', '10000000-0000-0000-0000-000000000001', 5, 'Absolutely breathtaking! The golden stupa is even more beautiful in person. A must-visit in Vientiane.', '2025-12-15'),
  ('30000000-0000-0000-0000-000000000002', 'd4e5f6a7-b8c9-0123-defa-234567890123', '10000000-0000-0000-0000-000000000002', 5, 'The most beautiful waterfall I have ever seen! The turquoise pools are perfect for swimming.', '2026-01-10'),
  ('30000000-0000-0000-0000-000000000003', 'd4e5f6a7-b8c9-0123-defa-234567890123', '10000000-0000-0000-0000-000000000004', 4, 'Great adventure activities. Tubing was fun but the river was a bit low. Rock climbing was excellent!', '2026-02-05'),
  ('30000000-0000-0000-0000-000000000004', 'd4e5f6a7-b8c9-0123-defa-234567890123', '10000000-0000-0000-0000-000000000007', 5, 'Amazing night market! So many unique handicrafts and delicious street food. Great atmosphere.', '2026-01-22'),
  ('30000000-0000-0000-0000-000000000005', 'd4e5f6a7-b8c9-0123-defa-234567890123', '10000000-0000-0000-0000-000000000010', 4, 'Very relaxed island vibe. Perfect for unwinding. Saw the dolphins which was magical!', '2025-11-15'),
  ('30000000-0000-0000-0000-000000000006', 'd4e5f6a7-b8c9-0123-defa-234567890123', '10000000-0000-0000-0000-000000000009', 5, 'Best cooking class ever! The instructor was so patient and the food was delicious. Highly recommend!', '2026-03-01'),
  ('30000000-0000-0000-0000-000000000007', 'd4e5f6a7-b8c9-0123-defa-234567890123', '10000000-0000-0000-0000-000000000003', 4, 'Beautiful temple with rich history. The guide was very knowledgeable. Wish there were more English signs.', '2025-11-20'),
  ('30000000-0000-0000-0000-000000000008', 'd4e5f6a7-b8c9-0123-defa-234567890123', '10000000-0000-0000-0000-000000000002', 5, 'Stunning natural beauty. Go early to avoid crowds. The hike up is worth it!', '2025-12-28')
ON CONFLICT DO NOTHING;

-- Insert travel plans
INSERT INTO travel_plans (plan_id, user_id, plan_name, description, d_start, d_end, status, day_number, created_at) VALUES
  ('40000000-0000-0000-0000-000000000001', 'd4e5f6a7-b8c9-0123-defa-234567890123', 'Luang Prabang Heritage Tour', 'Explore the UNESCO World Heritage city of Luang Prabang with its stunning temples and waterfalls.', '2026-06-01', '2026-06-03', 'plan', 3, '2026-04-15'),
  ('40000000-0000-0000-0000-000000000002', 'd4e5f6a7-b8c9-0123-defa-234567890123', 'Vientiane City Break', 'A short trip exploring the capital city highlights and local cuisine.', '2026-07-10', '2026-07-12', 'plan', 3, '2026-04-20'),
  ('40000000-0000-0000-0000-000000000003', 'd4e5f6a7-b8c9-0123-defa-234567890123', 'Adventure Week', 'Thrilling adventure activities in Vang Vieng combined with nature exploration.', '2026-08-01', '2026-08-07', 'plan', 7, '2026-05-01')
ON CONFLICT DO NOTHING;

-- Insert travel plan details
INSERT INTO travel_plan_details (detail_id, plan_id, attraction_id, day_number, visit_order) VALUES
  ('50000000-0000-0000-0000-000000000001', '40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000002', 1, 1),
  ('50000000-0000-0000-0000-000000000002', '40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000003', 1, 2),
  ('50000000-0000-0000-0000-000000000003', '40000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000007', 2, 1),
  ('50000000-0000-0000-0000-000000000004', '40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000001', 1, 1),
  ('50000000-0000-0000-0000-000000000005', '40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000005', 1, 2),
  ('50000000-0000-0000-0000-000000000006', '40000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000009', 2, 1),
  ('50000000-0000-0000-0000-000000000007', '40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000004', 1, 1),
  ('50000000-0000-0000-0000-000000000008', '40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000002', 2, 1),
  ('50000000-0000-0000-0000-000000000009', '40000000-0000-0000-0000-000000000003', '10000000-0000-0000-0000-000000000008', 3, 1)
ON CONFLICT DO NOTHING;

-- Insert favorites
INSERT INTO favorites (favorite_id, user_id, attraction_id) VALUES
  ('60000000-0000-0000-0000-000000000001', 'd4e5f6a7-b8c9-0123-defa-234567890123', '10000000-0000-0000-0000-000000000001'),
  ('60000000-0000-0000-0000-000000000002', 'd4e5f6a7-b8c9-0123-defa-234567890123', '10000000-0000-0000-0000-000000000002'),
  ('60000000-0000-0000-0000-000000000003', 'd4e5f6a7-b8c9-0123-defa-234567890123', '10000000-0000-0000-0000-000000000007'),
  ('60000000-0000-0000-0000-000000000004', 'd4e5f6a7-b8c9-0123-defa-234567890123', '10000000-0000-0000-0000-000000000010'),
  ('60000000-0000-0000-0000-000000000005', 'd4e5f6a7-b8c9-0123-defa-234567890123', '10000000-0000-0000-0000-000000000009')
ON CONFLICT DO NOTHING;

-- Insert promotions
INSERT INTO promotions (promotion_id, user_id, attraction_id, title, type, price, d_start, d_end, image, is_active, uses_count) VALUES
  ('70000000-0000-0000-0000-000000000001', 'c3d4e5f6-a7b8-9012-cdef-123456789012', '10000000-0000-0000-0000-000000000002', 'Early Bird Special - Kuang Si Falls', 'percentage', 30, '2026-01-01', '2026-06-30', 'https://f8bc59debf0847d2b7cdd5fbb5102d21.r2.cloudflarestorage.com/laotms/promotions/kuang-si-early-bird.jpg', true, 45),
  ('70000000-0000-0000-0000-000000000002', 'c3d4e5f6-a7b8-9012-cdef-123456789012', '10000000-0000-0000-0000-000000000009', 'Cooking Class Bundle', 'percentage', 20, '2026-01-01', '2026-07-15', 'https://f8bc59debf0847d2b7cdd5fbb5102d21.r2.cloudflarestorage.com/laotms/promotions/cooking-bundle.jpg', true, 23),
  ('70000000-0000-0000-0000-000000000003', 'c3d4e5f6-a7b8-9012-cdef-123456789012', '10000000-0000-0000-0000-000000000004', 'Adventure Package - Vang Vieng', 'percentage', 40, '2026-01-01', '2026-05-31', 'https://f8bc59debf0847d2b7cdd5fbb5102d21.r2.cloudflarestorage.com/laotms/promotions/vang-vieng-adventure.jpg', true, 67)
ON CONFLICT DO NOTHING;

-- Insert notifications
INSERT INTO notifications (notification_id, user_id, type, title, message, read, related_id, created_at) VALUES
  ('80000000-0000-0000-0000-000000000001', 'c3d4e5f6-a7b8-9012-cdef-123456789012', 'approved', 'Attraction Approved', 'Your attraction "Pha That Luang" has been approved and is now visible to tourists.', false, '10000000-0000-0000-0000-000000000001', '2026-05-04T10:30:00Z'),
  ('80000000-0000-0000-0000-000000000002', 'c3d4e5f6-a7b8-9012-cdef-123456789012', 'update_reminder', 'Update Required', 'Your attraction "Kuang Si Falls" is 6 months old. Please update the information to keep it current.', false, '10000000-0000-0000-0000-000000000002', '2026-05-03T14:00:00Z'),
  ('80000000-0000-0000-0000-000000000003', 'c3d4e5f6-a7b8-9012-cdef-123456789012', 'social_post', 'Auto-Posted to Social Media', 'Your attraction "Vang Vieng Adventure" has been automatically shared on Facebook and Instagram after approval.', true, '10000000-0000-0000-0000-000000000004', '2026-05-02T09:15:00Z'),
  ('80000000-0000-0000-0000-000000000004', 'c3d4e5f6-a7b8-9012-cdef-123456789012', 'rejected', 'Attraction Rejected', 'Your attraction submission was rejected due to incomplete information. Please update and resubmit.', false, '', '2026-05-01T16:45:00Z'),
  ('80000000-0000-0000-0000-000000000005', 'c3d4e5f6-a7b8-9012-cdef-123456789012', 'info', 'New Review', 'A tourist left a 5-star review on "Night Market Luang Prabang". Check it out!', true, '10000000-0000-0000-0000-000000000007', '2026-04-30T11:20:00Z'),
  ('80000000-0000-0000-0000-000000000006', 'c3d4e5f6-a7b8-9012-cdef-123456789012', 'auto_hidden', 'Attraction Auto-Hidden', 'Your attraction was automatically hidden due to no response after 2 update notifications. Please update to restore visibility.', false, '', '2026-04-28T08:00:00Z'),
  ('80000000-0000-0000-0000-000000000007', 'c3d4e5f6-a7b8-9012-cdef-123456789012', 'approved', 'Attraction Approved', 'Your attraction "Si Phan Don (4000 Islands)" has been approved and is now live!', true, '10000000-0000-0000-0000-000000000010', '2026-04-25T13:30:00Z')
ON CONFLICT DO NOTHING;
