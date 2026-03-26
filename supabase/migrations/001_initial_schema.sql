-- ==============================================================================
-- BLOSSOME INITIAL SCHEMA MIGRATION
-- ==============================================================================

CREATE EXTENSION IF NOT EXISTS btree_gist;

-- ------------------------------------------------------------------------------
-- 1. TABLES
-- ------------------------------------------------------------------------------

-- Profiles
CREATE TABLE profiles (
  id uuid PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  full_name text,
  phone text,
  avatar_url text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Services
CREATE TABLE services (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category text NOT NULL CHECK (category IN ('coiffure','esthetique','onglerie','maquillage')),
  name text NOT NULL,
  slug text UNIQUE NOT NULL,
  description text,
  duration_minutes integer NOT NULL CHECK (duration_minutes > 0),
  price_mga integer NOT NULL CHECK (price_mga > 0),
  deposit_percent integer NOT NULL DEFAULT 25 CHECK (deposit_percent BETWEEN 0 AND 100),
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  sort_order integer NOT NULL DEFAULT 0,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Staff
CREATE TABLE staff (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  full_name text NOT NULL,
  role text NOT NULL,
  bio text,
  avatar_url text,
  service_categories text[] DEFAULT '{}',
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Availability Slots
CREATE TABLE availability_slots (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  staff_id uuid NOT NULL REFERENCES staff(id) ON DELETE CASCADE,
  slot_start timestamptz NOT NULL,
  slot_end timestamptz NOT NULL,
  is_blocked boolean NOT NULL DEFAULT false,
  created_at timestamptz DEFAULT now(),
  CONSTRAINT no_overlap EXCLUDE USING gist (
    staff_id WITH =,
    tstzrange(slot_start, slot_end) WITH &&
  ) WHERE (staff_id IS NOT NULL AND is_blocked = false)
);

-- Bookings
CREATE TABLE bookings (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id uuid REFERENCES profiles(id) ON DELETE SET NULL, -- Nullable for guests
  client_name text,
  client_phone text NOT NULL,
  service_id uuid NOT NULL REFERENCES services(id),
  staff_id uuid REFERENCES staff(id),
  slot_start timestamptz NOT NULL,
  slot_end timestamptz NOT NULL,
  status text NOT NULL CHECK (status IN ('pending_payment', 'confirmed', 'completed', 'cancelled', 'no_show')) DEFAULT 'pending_payment',
  payment_method text CHECK (payment_method IN ('mvola', 'airtel_money', 'stripe', 'cash')),
  payment_reference text,
  notes text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now(),
  CONSTRAINT booking_end_after_start CHECK (slot_end > slot_start)
);

CREATE INDEX idx_bookings_availability ON bookings (slot_start, status);
CREATE INDEX idx_bookings_client_phone ON bookings (client_phone);

-- School Courses
CREATE TABLE school_courses (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  category text CHECK (category IN ('coiffure','esthetique','onglerie','maquillage')),
  duration_weeks integer NOT NULL CHECK (duration_weeks > 0),
  price_mga integer NOT NULL CHECK (price_mga > 0),
  max_students integer NOT NULL CHECK (max_students > 0),
  image_url text,
  is_active boolean NOT NULL DEFAULT true,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enrolments
CREATE TABLE enrolments (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  student_id uuid REFERENCES profiles(id) ON DELETE SET NULL,
  student_name text,
  student_phone text,
  course_id uuid NOT NULL REFERENCES school_courses(id),
  enrolled_at timestamptz DEFAULT now(),
  status text NOT NULL CHECK (status IN ('active', 'completed', 'withdrawn')) DEFAULT 'active',
  payment_method text CHECK (payment_method IN ('mvola', 'airtel_money', 'stripe', 'cash')),
  payment_reference text,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);


-- ------------------------------------------------------------------------------
-- 2. ROW LEVEL SECURITY
-- ------------------------------------------------------------------------------

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE services ENABLE ROW LEVEL SECURITY;
ALTER TABLE staff ENABLE ROW LEVEL SECURITY;
ALTER TABLE availability_slots ENABLE ROW LEVEL SECURITY;
ALTER TABLE bookings ENABLE ROW LEVEL SECURITY;
ALTER TABLE school_courses ENABLE ROW LEVEL SECURITY;
ALTER TABLE enrolments ENABLE ROW LEVEL SECURITY;

-- Profiles
CREATE POLICY "owner_access" ON profiles FOR ALL USING (id = auth.uid());

-- Services
CREATE POLICY "public_read" ON services FOR SELECT USING (true);
CREATE POLICY "admin_all" ON services FOR ALL USING ((auth.jwt() ->> 'user_role')::text = 'admin');

-- Staff
CREATE POLICY "public_read" ON staff FOR SELECT USING (true);
CREATE POLICY "admin_all" ON staff FOR ALL USING ((auth.jwt() ->> 'user_role')::text = 'admin');

-- School Courses
CREATE POLICY "public_read" ON school_courses FOR SELECT USING (true);
CREATE POLICY "admin_all" ON school_courses FOR ALL USING ((auth.jwt() ->> 'user_role')::text = 'admin');

-- Availability Slots
CREATE POLICY "public_read" ON availability_slots FOR SELECT USING (true);
CREATE POLICY "admin_all" ON availability_slots FOR ALL USING ((auth.jwt() ->> 'user_role')::text = 'admin');

-- Bookings
CREATE POLICY "owner_read" ON bookings FOR SELECT USING (
  client_id = auth.uid() OR (auth.jwt() ->> 'user_role')::text = 'admin'
);
CREATE POLICY "anon_insert" ON bookings FOR INSERT WITH CHECK (true);
CREATE POLICY "admin_update" ON bookings FOR UPDATE USING (
  (auth.jwt() ->> 'user_role')::text = 'admin'
);

-- Enrolments
CREATE POLICY "anon_insert" ON enrolments FOR INSERT WITH CHECK (true);
CREATE POLICY "admin_all" ON enrolments FOR ALL USING (
  (auth.jwt() ->> 'user_role')::text = 'admin'
);


-- ------------------------------------------------------------------------------
-- 3. FUNCTIONS
-- ------------------------------------------------------------------------------

CREATE OR REPLACE FUNCTION check_slot_available(
  p_slot_start timestamptz,
  p_slot_end timestamptz,
  p_staff_id uuid DEFAULT NULL
) RETURNS boolean AS $$
  SELECT NOT EXISTS (
    SELECT 1 FROM bookings
    WHERE status NOT IN ('cancelled', 'no_show')
    AND slot_start < p_slot_end
    AND slot_end > p_slot_start
    AND (p_staff_id IS NULL OR staff_id = p_staff_id)
  );
$$ LANGUAGE sql SECURITY DEFINER;


-- ------------------------------------------------------------------------------
-- 4. SEED DATA
-- ------------------------------------------------------------------------------

-- Seed Services
INSERT INTO services (category, name, slug, duration_minutes, price_mga) VALUES
  ('coiffure', 'Lissage brésilien', 'lissage-bresilien', 120, 85000),
  ('esthetique', 'Soin visage hydratant', 'soin-visage-hydratant', 60, 35000),
  ('onglerie', 'Pose gel complète', 'pose-gel-complete', 90, 45000),
  ('maquillage', 'Maquillage événementiel', 'maquillage-evenementiel', 60, 55000);

-- Seed Staff
INSERT INTO staff (full_name, role, service_categories) VALUES
  ('Mialy', 'Coiffeuse Visagiste', ARRAY['coiffure']),
  ('Kanto', 'Esthéticienne / Prothésiste', ARRAY['esthetique', 'onglerie']),
  ('Rina', 'Makeup Artist', ARRAY['maquillage']);

-- Seed School Courses
INSERT INTO school_courses (title, category, duration_weeks, price_mga, max_students) VALUES
  ('Formation Prothésiste Ongulaire', 'onglerie', 4, 350000, 10),
  ('Masterclass Coiffure', 'coiffure', 2, 250000, 15);

-- Seed Availability Slots Next 30 Days (Mon-Sat, 09:00-17:30 UTC+3, 30m increments)
INSERT INTO availability_slots (staff_id, slot_start, slot_end)
SELECT 
  s.id as staff_id,
  (day_series::date + time '09:00' + (slot_series * interval '30 minutes')) AT TIME ZONE 'Africa/Nairobi' as slot_start,
  (day_series::date + time '09:30' + (slot_series * interval '30 minutes')) AT TIME ZONE 'Africa/Nairobi' as slot_end
FROM staff s
CROSS JOIN generate_series(current_date, current_date + 30, interval '1 day') AS day_series
CROSS JOIN generate_series(0, 16) AS slot_series
WHERE extract(isodow FROM day_series) BETWEEN 1 AND 6;

-- ------------------------------------------------------------------------------
-- 5. MVOLA TRANSACTIONS
-- ------------------------------------------------------------------------------

CREATE TABLE mvola_transactions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  booking_id uuid REFERENCES bookings(id) ON DELETE CASCADE,
  correlation_id text NOT NULL UNIQUE,
  server_correlation_id text UNIQUE,
  transaction_reference text UNIQUE,
  client_msisdn text NOT NULL,
  amount_mga integer NOT NULL,
  status text NOT NULL DEFAULT 'initiated'
    CHECK (status IN ('initiated', 'pending', 'completed', 'failed')),
  notification_method text,
  raw_callback jsonb,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

ALTER TABLE mvola_transactions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "admin_only" ON mvola_transactions
  FOR ALL USING ((auth.jwt() ->> 'user_role')::text = 'admin');
