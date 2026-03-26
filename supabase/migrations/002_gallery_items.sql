-- ==============================================================================
-- GALLERY ITEMS TABLE
-- ==============================================================================

CREATE TABLE gallery_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  url text NOT NULL,
  category text NOT NULL CHECK (category IN ('coiffure','esthetique','onglerie','maquillage')),
  alt_text text NOT NULL DEFAULT '',
  created_at timestamptz DEFAULT now()
);

ALTER TABLE gallery_items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "public_read" ON gallery_items FOR SELECT USING (true);
CREATE POLICY "admin_all" ON gallery_items FOR ALL USING ((auth.jwt() ->> 'user_role')::text = 'admin');
