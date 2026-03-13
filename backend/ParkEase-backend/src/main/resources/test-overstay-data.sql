-- ╔══════════════════════════════════════════════════════════════════════════════╗
-- ║  TEST DATA FOR OVERSTAY/EXPIRED TICKET SCENARIO                               ║
-- ║  Run this SQL to create a test booking that has already expired               ║
-- ╚══════════════════════════════════════════════════════════════════════════════╝

-- IMPORTANT: Replace user_id and spot_id with valid IDs from your database

-- First, let's see available users and spots (run these SELECTs first to get IDs):
-- SELECT user_id, username, full_name FROM users LIMIT 5;
-- SELECT spot_id, spot_label, zone, is_occupied FROM parking_spots WHERE is_occupied = 0 LIMIT 5;

-- Create an EXPIRED booking (CHECKED_IN status but end_time is in the past)
-- This simulates a car that has overstayed and will trigger overstay charges when scanned

INSERT INTO bookings (
    user_id,
    spot_id,
    vehicle_number,
    ticket_number,
    start_time,
    end_time,
    base_fee,
    surge_fee,
    total_amount,
    status,
    overstay_fee,
    checked_in_time,
    qr_code_url,
    version,
    created_at,
    updated_at
) VALUES (
    1,                                              -- user_id (change to valid user ID)
    1,                                              -- spot_id (change to valid spot ID)
    'MH-12-TEST-999',                               -- vehicle_number
    'PKE-OVERSTAY-TEST',                            -- ticket_number (use this to scan/lookup)
    DATE_SUB(NOW(), INTERVAL 4 HOUR),               -- start_time: 4 hours ago
    DATE_SUB(NOW(), INTERVAL 2 HOUR),               -- end_time: 2 hours ago (EXPIRED!)
    50.00,                                          -- base_fee
    0.00,                                           -- surge_fee
    100.00,                                         -- total_amount (already paid for 2 hours)
    'CHECKED_IN',                                   -- status: already entered the parking
    NULL,                                           -- overstay_fee: will be calculated on scan
    DATE_SUB(NOW(), INTERVAL 4 HOUR),               -- checked_in_time: when they entered
    NULL,                                           -- qr_code_url
    0,                                              -- version
    DATE_SUB(NOW(), INTERVAL 4 HOUR),               -- created_at
    NOW()                                           -- updated_at
);

-- Mark the parking spot as occupied
UPDATE parking_spots SET is_occupied = 1 WHERE spot_id = 1;

-- ══════════════════════════════════════════════════════════════════════════════
-- QUICK REFERENCE FOR TESTING:
-- 
-- Ticket Number: PKE-OVERSTAY-TEST
-- Vehicle: MH-12-TEST-999
-- Status: CHECKED_IN (car is inside)
-- Booked Duration: 2 hours
-- Actual Time Inside: 4 hours (2 hours overstay)
--
-- EXPECTED BEHAVIOR:
-- 1. When admin scans this QR at exit gate:
--    - System detects 2 hours of overstay
--    - Calculates overstay fee: 2 hours × base_rate × 2 (double rate)
--    - Status changes to "OVERSTAY"
--    - Message shows overstay charges
--
-- 2. Admin clicks "Pay Overstay":
--    - Payment is processed
--    - Status changes to "OVERSTAY_PAID"
--    - User can now exit
--
-- 3. When scanned again:
--    - Status changes to "COMPLETED"
--    - Parking spot is freed
-- ══════════════════════════════════════════════════════════════════════════════

-- To reset this test booking (run if you want to test again):
-- DELETE FROM bookings WHERE ticket_number = 'PKE-OVERSTAY-TEST';
-- UPDATE parking_spots SET is_occupied = 0 WHERE spot_id = 1;
