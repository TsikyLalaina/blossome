-- ==============================================================================
-- MIGRATION: 003_REFACTOR_BOOKING_SLOTS
-- Description: Replaces direct time columns in bookings with a foreign key 
-- pointing to availability_slots, handling overlap manually via is_blocked.
-- ==============================================================================

-- 1. Drop old constraints and indexes on bookings that rely on slot_start/end
ALTER TABLE bookings DROP CONSTRAINT IF EXISTS booking_end_after_start;
DROP INDEX IF EXISTS idx_bookings_availability;

-- 2. Add slot_id foreign key
ALTER TABLE bookings ADD COLUMN slot_id uuid REFERENCES availability_slots(id) ON DELETE RESTRICT;

-- For existing records in development, we drop the old columns completely 
-- (which destroys history, but acceptable during active dev schema swaps).
ALTER TABLE bookings DROP COLUMN slot_start;
ALTER TABLE bookings DROP COLUMN slot_end;

-- 3. Create the new index for fast queries mapping booking -> availability slot
CREATE INDEX idx_bookings_slot ON bookings (slot_id, status);

-- 4. Re-create the RPC for backwards compatibility or drop it.
-- Since we now use `is_blocked = true` directly on availability_slots, 
-- `check_slot_available` is somewhat obsolete. We'll drop it to enforce the new pattern.
DROP FUNCTION IF EXISTS check_slot_available;
