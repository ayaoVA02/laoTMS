/*
  # Create LaoTMS Core Tables - Part 1: Tables and Types

  1. New Tables
    - `users` - Core user accounts with role-based access
    - `entrepreneurs` - Extended profile for business owners
    - `tourists` - Extended profile for travelers
    - `staffs` - Extended profile for staff members
    - `types` - Attraction categories/types
    - `attractions` - Main attraction listings with facilities
    - `attraction_images` - Multiple images per attraction
    - `reviews` - User reviews for attractions
    - `travel_plans` - User travel itineraries
    - `travel_plan_details` - Junction table for plans and attractions
    - `favorites` - User favorite attractions
    - `promotions` - Business promotions for attractions
    - `notifications` - User notifications

  2. Improvements over original MySQL schema
    - UUID primary keys instead of VARCHAR(50)
    - Added `attraction_images` table for multiple images per attraction
    - Added `rating` and `review_count` to attractions for performance
    - Added `featured` flag to attractions
    - Added `description` and `status` fields to travel_plans
    - Added `day_number` and `visit_order` to travel_plan_details
    - Added `uses_count` to promotions
    - Added `notifications` table
    - Added `is_active` to users for soft-disable
    - Added `password_hash` instead of plain password
    - Added `is_free_wifi`, `is_free_parking`, `is_free_entry` to attractions
*/

-- Create custom enum types
DO $$ BEGIN
  CREATE TYPE user_role AS ENUM ('ADMIN', 'STAFF', 'ENTREPRENEUR', 'TOURIST');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE gender_type AS ENUM ('MALE', 'FEMALE');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE attraction_status AS ENUM ('draft', 'pending', 'approved');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE plan_status AS ENUM ('plan', 'progress', 'done', 'reject');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE promotion_type AS ENUM ('Free', 'fixed', 'percentage');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE staff_status AS ENUM ('active', 'inactive', 'suspended');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
  CREATE TYPE notification_type AS ENUM ('approved', 'rejected', 'update_reminder', 'auto_hidden', 'social_post', 'info');
EXCEPTION WHEN duplicate_object THEN null;
END $$;

-- USERS
CREATE TABLE IF NOT EXISTS users (
    user_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    email text UNIQUE NOT NULL,
    password_hash text NOT NULL,
    role user_role NOT NULL DEFAULT 'TOURIST',
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ENTREPRENEURS
CREATE TABLE IF NOT EXISTS entrepreneurs (
    en_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    position text DEFAULT '',
    first_name text DEFAULT '',
    last_name text DEFAULT '',
    gender gender_type DEFAULT 'MALE',
    profile_img text DEFAULT '',
    phone text DEFAULT '',
    nationality text DEFAULT '',
    province text DEFAULT '',
    district text DEFAULT '',
    village text DEFAULT '',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- TOURISTS
CREATE TABLE IF NOT EXISTS tourists (
    tourist_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    preferences text DEFAULT '',
    first_name text DEFAULT '',
    last_name text DEFAULT '',
    gender gender_type DEFAULT 'MALE',
    profile_img text DEFAULT '',
    phone text DEFAULT '',
    nationality text DEFAULT '',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- STAFFS
CREATE TABLE IF NOT EXISTS staffs (
    staff_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    staff_code text DEFAULT '',
    first_name text DEFAULT '',
    last_name text DEFAULT '',
    gender gender_type DEFAULT 'MALE',
    profile_img text DEFAULT '',
    phone text DEFAULT '',
    nationality text DEFAULT '',
    province text DEFAULT '',
    district text DEFAULT '',
    village text DEFAULT '',
    status staff_status DEFAULT 'active',
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- TYPES (Attraction Categories)
CREATE TABLE IF NOT EXISTS types (
    type_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    name_la text NOT NULL,
    name_en text NOT NULL,
    description text DEFAULT '',
    type_icon text DEFAULT '',
    type_image text DEFAULT '',
    is_active boolean DEFAULT true,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ATTRACTIONS
CREATE TABLE IF NOT EXISTS attractions (
    attraction_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(user_id),
    type_id uuid REFERENCES types(type_id),
    name_la text DEFAULT '',
    name_en text NOT NULL,
    thumbnail_image text DEFAULT '',
    description text DEFAULT '',
    vdo_reviews text DEFAULT '',
    province text DEFAULT '',
    district text DEFAULT '',
    village text DEFAULT '',
    latitude numeric(10,8),
    longitude numeric(11,8),
    location text DEFAULT '',
    entry_fee_foreigner numeric(10,2) DEFAULT 0,
    best_time_visit text DEFAULT '',
    has_parking boolean DEFAULT false,
    is_free_parking boolean DEFAULT false,
    parking_price numeric(10,2) DEFAULT 0,
    has_restaurant boolean DEFAULT false,
    has_accommodation boolean DEFAULT false,
    acc_price numeric(10,2) DEFAULT 0,
    has_internet boolean DEFAULT false,
    is_free_wifi boolean DEFAULT false,
    is_free_entry boolean DEFAULT false,
    open_time time DEFAULT '08:00',
    close_time time DEFAULT '17:00',
    status attraction_status DEFAULT 'draft',
    activity text DEFAULT '',
    license text DEFAULT '',
    social_share boolean DEFAULT false,
    rating numeric(3,2) DEFAULT 0,
    review_count integer DEFAULT 0,
    featured boolean DEFAULT false,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- ATTRACTION IMAGES
CREATE TABLE IF NOT EXISTS attraction_images (
    image_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    attraction_id uuid NOT NULL REFERENCES attractions(attraction_id) ON DELETE CASCADE,
    image_url text NOT NULL,
    display_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- REVIEWS
CREATE TABLE IF NOT EXISTS reviews (
    review_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(user_id),
    attraction_id uuid NOT NULL REFERENCES attractions(attraction_id) ON DELETE CASCADE,
    rating integer DEFAULT 5 CHECK (rating >= 1 AND rating <= 5),
    content text DEFAULT '',
    created_at timestamptz DEFAULT now()
);

-- TRAVEL PLANS
CREATE TABLE IF NOT EXISTS travel_plans (
    plan_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    plan_name text NOT NULL,
    description text DEFAULT '',
    d_start date,
    d_end date,
    status plan_status DEFAULT 'plan',
    day_number integer DEFAULT 1,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- TRAVEL PLAN DETAILS
CREATE TABLE IF NOT EXISTS travel_plan_details (
    detail_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    plan_id uuid NOT NULL REFERENCES travel_plans(plan_id) ON DELETE CASCADE,
    attraction_id uuid NOT NULL REFERENCES attractions(attraction_id) ON DELETE CASCADE,
    day_number integer DEFAULT 1,
    visit_order integer DEFAULT 0,
    created_at timestamptz DEFAULT now()
);

-- FAVORITES
CREATE TABLE IF NOT EXISTS favorites (
    favorite_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    attraction_id uuid NOT NULL REFERENCES attractions(attraction_id) ON DELETE CASCADE,
    created_at timestamptz DEFAULT now(),
    UNIQUE(user_id, attraction_id)
);

-- PROMOTIONS
CREATE TABLE IF NOT EXISTS promotions (
    promotion_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(user_id),
    attraction_id uuid NOT NULL REFERENCES attractions(attraction_id) ON DELETE CASCADE,
    title text NOT NULL,
    type promotion_type DEFAULT 'percentage',
    price numeric(10,2) DEFAULT 0,
    d_start date,
    d_end date,
    image text DEFAULT '',
    children numeric(10,2) DEFAULT 0,
    adult numeric(10,2) DEFAULT 0,
    is_active boolean DEFAULT true,
    uses_count integer DEFAULT 0,
    created_at timestamptz DEFAULT now(),
    updated_at timestamptz DEFAULT now()
);

-- NOTIFICATIONS
CREATE TABLE IF NOT EXISTS notifications (
    notification_id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL REFERENCES users(user_id) ON DELETE CASCADE,
    type notification_type NOT NULL,
    title text NOT NULL,
    message text DEFAULT '',
    read boolean DEFAULT false,
    related_id text DEFAULT '',
    created_at timestamptz DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE entrepreneurs ENABLE ROW LEVEL SECURITY;
ALTER TABLE tourists ENABLE ROW LEVEL SECURITY;
ALTER TABLE staffs ENABLE ROW LEVEL SECURITY;
ALTER TABLE types ENABLE ROW LEVEL SECURITY;
ALTER TABLE attractions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attraction_images ENABLE ROW LEVEL SECURITY;
ALTER TABLE reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE travel_plan_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE favorites ENABLE ROW LEVEL SECURITY;
ALTER TABLE promotions ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_attractions_user_id ON attractions(user_id);
CREATE INDEX IF NOT EXISTS idx_attractions_type_id ON attractions(type_id);
CREATE INDEX IF NOT EXISTS idx_attractions_status ON attractions(status);
CREATE INDEX IF NOT EXISTS idx_attractions_province ON attractions(province);
CREATE INDEX IF NOT EXISTS idx_reviews_attraction_id ON reviews(attraction_id);
CREATE INDEX IF NOT EXISTS idx_reviews_user_id ON reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_travel_plans_user_id ON travel_plans(user_id);
CREATE INDEX IF NOT EXISTS idx_favorites_user_id ON favorites(user_id);
CREATE INDEX IF NOT EXISTS idx_promotions_attraction_id ON promotions(attraction_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_attraction_images_attraction_id ON attraction_images(attraction_id);
