/*
  # Add RLS Policies for LaoTMS Tables

  1. Security
    - Users: can read own data; admins can read all
    - Entrepreneurs: owner can read/write own; admin/staff can read all
    - Tourists: owner can read/write own; admin/staff can read all
    - Staffs: owner can read own; admin can manage all
    - Types: anyone authenticated can read; admin can manage
    - Attractions: anyone can read; owner can CRUD own; admin/staff can manage
    - Attraction images: same as attractions
    - Reviews: anyone can read; authenticated can insert; owner can update/delete
    - Travel plans: owner can CRUD; admin can read
    - Travel plan details: same as travel plans
    - Favorites: owner can CRUD
    - Promotions: anyone can read; owner can CRUD; admin can manage
    - Notifications: owner can read/update own
*/

-- Users policies
CREATE POLICY "Users can read own data" ON users FOR SELECT TO authenticated USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role = 'ADMIN'));
CREATE POLICY "Users can update own data" ON users FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Admins can insert users" ON users FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role = 'ADMIN'));
CREATE POLICY "Admins can delete users" ON users FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role = 'ADMIN'));

-- Entrepreneurs policies
CREATE POLICY "Entrepreneurs read own" ON entrepreneurs FOR SELECT TO authenticated USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role IN ('ADMIN', 'STAFF')));
CREATE POLICY "Entrepreneurs insert own" ON entrepreneurs FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Entrepreneurs update own" ON entrepreneurs FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Tourists policies
CREATE POLICY "Tourists read own" ON tourists FOR SELECT TO authenticated USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role IN ('ADMIN', 'STAFF')));
CREATE POLICY "Tourists insert own" ON tourists FOR INSERT TO authenticated WITH CHECK (user_id = auth.uid());
CREATE POLICY "Tourists update own" ON tourists FOR UPDATE TO authenticated USING (user_id = auth.uid()) WITH CHECK (user_id = auth.uid());

-- Staffs policies
CREATE POLICY "Staffs read own" ON staffs FOR SELECT TO authenticated USING (user_id = auth.uid() OR EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role = 'ADMIN'));
CREATE POLICY "Admins insert staffs" ON staffs FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role = 'ADMIN'));
CREATE POLICY "Admins update staffs" ON staffs FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role = 'ADMIN'));

-- Types policies
CREATE POLICY "Anyone can read types" ON types FOR SELECT TO authenticated USING (true);
CREATE POLICY "Admins manage types" ON types FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role = 'ADMIN'));
CREATE POLICY "Admins update types" ON types FOR UPDATE TO authenticated USING (EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role = 'ADMIN'));
CREATE POLICY "Admins delete types" ON types FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role = 'ADMIN'));

-- Attractions policies
CREATE POLICY "Anyone can read attractions" ON attractions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Entrepreneurs insert attractions" ON attractions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner or admin update attractions" ON attractions FOR UPDATE TO authenticated USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role IN ('ADMIN', 'STAFF'))) WITH CHECK (auth.uid() = user_id OR EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role IN ('ADMIN', 'STAFF')));
CREATE POLICY "Owner or admin delete attractions" ON attractions FOR DELETE TO authenticated USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role = 'ADMIN'));

-- Attraction images policies
CREATE POLICY "Anyone can read attraction images" ON attraction_images FOR SELECT TO authenticated USING (true);
CREATE POLICY "Owner insert attraction images" ON attraction_images FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM attractions WHERE attraction_id = attraction_images.attraction_id AND user_id = auth.uid()));
CREATE POLICY "Owner or admin delete attraction images" ON attraction_images FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM attractions a WHERE a.attraction_id = attraction_images.attraction_id AND (a.user_id = auth.uid() OR EXISTS (SELECT 1 FROM users u WHERE u.user_id = auth.uid() AND u.role IN ('ADMIN', 'STAFF')))));

-- Reviews policies
CREATE POLICY "Anyone can read reviews" ON reviews FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated insert reviews" ON reviews FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner update reviews" ON reviews FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner or admin delete reviews" ON reviews FOR DELETE TO authenticated USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role IN ('ADMIN', 'STAFF')));

-- Travel plans policies
CREATE POLICY "Owner read travel plans" ON travel_plans FOR SELECT TO authenticated USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role IN ('ADMIN', 'STAFF')));
CREATE POLICY "Owner insert travel plans" ON travel_plans FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner update travel plans" ON travel_plans FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner delete travel plans" ON travel_plans FOR DELETE TO authenticated USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role = 'ADMIN'));

-- Travel plan details policies
CREATE POLICY "Owner read plan details" ON travel_plan_details FOR SELECT TO authenticated USING (EXISTS (SELECT 1 FROM travel_plans WHERE plan_id = travel_plan_details.plan_id AND user_id = auth.uid()));
CREATE POLICY "Owner insert plan details" ON travel_plan_details FOR INSERT TO authenticated WITH CHECK (EXISTS (SELECT 1 FROM travel_plans WHERE plan_id = travel_plan_details.plan_id AND user_id = auth.uid()));
CREATE POLICY "Owner delete plan details" ON travel_plan_details FOR DELETE TO authenticated USING (EXISTS (SELECT 1 FROM travel_plans WHERE plan_id = travel_plan_details.plan_id AND user_id = auth.uid()));

-- Favorites policies
CREATE POLICY "Owner read favorites" ON favorites FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owner insert favorites" ON favorites FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner delete favorites" ON favorites FOR DELETE TO authenticated USING (auth.uid() = user_id);

-- Promotions policies
CREATE POLICY "Anyone read promotions" ON promotions FOR SELECT TO authenticated USING (true);
CREATE POLICY "Owner insert promotions" ON promotions FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner or admin update promotions" ON promotions FOR UPDATE TO authenticated USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role IN ('ADMIN', 'STAFF'))) WITH CHECK (auth.uid() = user_id OR EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role IN ('ADMIN', 'STAFF')));
CREATE POLICY "Owner or admin delete promotions" ON promotions FOR DELETE TO authenticated USING (auth.uid() = user_id OR EXISTS (SELECT 1 FROM users WHERE user_id = auth.uid() AND role = 'ADMIN'));

-- Notifications policies
CREATE POLICY "Owner read notifications" ON notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Owner insert notifications" ON notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner update notifications" ON notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Owner delete notifications" ON notifications FOR DELETE TO authenticated USING (auth.uid() = user_id);
