-- Database schema for Service Booking Application

-- Users Table
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE,
    password_hash TEXT NOT NULL,
    address TEXT,
    phone_number TEXT,
    email_verified_at DATETIME,
    verification_token TEXT,
    password_reset_token TEXT,
    password_reset_expires DATETIME,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Services Table
CREATE TABLE IF NOT EXISTS services (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    description TEXT NOT NULL,
    price REAL NOT NULL,
    estimated_time_minutes INTEGER, -- e.g., 60 for 1 hour
    category TEXT, -- e.g., 'Washing', 'Repair', 'Maintenance'
    is_mobile_service_option BOOLEAN DEFAULT 0, -- 0 for false, 1 for true
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Bookings Table
CREATE TABLE IF NOT EXISTS bookings (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER NOT NULL,
    booking_date DATE NOT NULL,
    booking_time TEXT NOT NULL, -- e.g., "10:00 AM" or specific time slot ID
    status TEXT NOT NULL DEFAULT 'pending', -- e.g., pending, confirmed, completed, cancelled
    total_price REAL, -- Calculated at time of booking
    notes TEXT,
    mobile_service_address TEXT, -- If applicable
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users (id) ON DELETE CASCADE
);

-- Booking Items Table (to link multiple services to a single booking)
CREATE TABLE IF NOT EXISTS booking_items (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    booking_id INTEGER NOT NULL,
    service_id INTEGER NOT NULL,
    price_at_booking REAL NOT NULL, -- Price of the service when booked
    estimated_time_minutes_at_booking INTEGER,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (booking_id) REFERENCES bookings (id) ON DELETE CASCADE,
    FOREIGN KEY (service_id) REFERENCES services (id) ON DELETE RESTRICT -- Prevent deleting a service if it's part of a booking
);

-- Tips Table (from motor-vehicle-maintenance-website)
CREATE TABLE IF NOT EXISTS tips (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    title TEXT NOT NULL,
    content TEXT NOT NULL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- Team Members Table (from motor-vehicle-maintenance-website)
CREATE TABLE IF NOT EXISTS team_members (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT NOT NULL,
    role TEXT,
    image_url TEXT, -- Path to image, e.g., /images/team/member1.jpg
    description TEXT,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP
);

-- (Optional) Availability Table - for more complex scheduling
-- CREATE TABLE IF NOT EXISTS availability (
--     id INTEGER PRIMARY KEY AUTOINCREMENT,
--     service_id INTEGER, -- Can be null for general availability
--     day_of_week INTEGER, -- 0 for Sunday, 1 for Monday, etc.
--     start_time TIME,
--     end_time TIME,
--     is_available BOOLEAN DEFAULT 1,
--     FOREIGN KEY (service_id) REFERENCES services(id) ON DELETE CASCADE
-- );

-- Triggers to update 'updated_at' timestamps
CREATE TRIGGER IF NOT EXISTS update_users_updated_at
AFTER UPDATE ON users
FOR EACH ROW
BEGIN
    UPDATE users SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS update_services_updated_at
AFTER UPDATE ON services
FOR EACH ROW
BEGIN
    UPDATE services SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS update_bookings_updated_at
AFTER UPDATE ON bookings
FOR EACH ROW
BEGIN
    UPDATE bookings SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS update_tips_updated_at
AFTER UPDATE ON tips
FOR EACH ROW
BEGIN
    UPDATE tips SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;

CREATE TRIGGER IF NOT EXISTS update_team_members_updated_at
AFTER UPDATE ON team_members
FOR EACH ROW
BEGIN
    UPDATE team_members SET updated_at = CURRENT_TIMESTAMP WHERE id = OLD.id;
END;
