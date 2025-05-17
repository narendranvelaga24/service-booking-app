-- Sample data for Service Booking Application

-- Services
INSERT INTO services (name, description, price, estimated_time_minutes, category, is_mobile_service_option) VALUES
('Standard Car Wash', 'Exterior wash, tire shine, and window cleaning.', 15.99, 30, 'Washing', 1),
('Premium Car Wash & Wax', 'Includes Standard Wash plus hand wax and interior vacuuming.', 35.00, 75, 'Washing', 1),
('Basic Oil Change', 'Standard oil and filter change (up to 5 quarts conventional oil).', 39.99, 45, 'Maintenance', 0),
('Synthetic Oil Change', 'Premium synthetic oil and filter change (up to 5 quarts).', 69.99, 45, 'Maintenance', 0),
('Tire Rotation', 'Rotate tires to promote even wear.', 24.99, 30, 'Maintenance', 1),
('Brake Pad Replacement (Front)', 'Replacement of front brake pads. Price per axle.', 129.99, 90, 'Repair', 0),
('Brake Pad Replacement (Rear)', 'Replacement of rear brake pads. Price per axle.', 139.99, 90, 'Repair', 0),
('Engine Diagnostic', 'Full engine diagnostic check to identify issues.', 75.00, 60, 'Repair', 0),
('Air Conditioning Recharge', 'Recharge AC system with refrigerant.', 99.99, 60, 'Maintenance', 0),
('Full Interior Detailing', 'Deep cleaning of all interior surfaces, shampoo carpets and upholstery.', 150.00, 180, 'Detailing', 1);

-- Tips (from motor-vehicle-maintenance-website)
INSERT INTO tips (title, content) VALUES
('How to Check Your Oil Level', '1. Ensure your car is parked on level ground and the engine is cool. 2. Locate the dipstick, pull it out, and wipe it clean. 3. Reinsert the dipstick fully, then pull it out again. 4. Check the oil level against the markings (usually "min" and "max"). If low, add the recommended type of oil.'),
('Understanding Tire Pressure', 'Proper tire pressure is crucial for safety, fuel efficiency, and tire longevity. Check your owner''s manual or the sticker on your driver''s side doorjamb for the recommended PSI. Check pressure when tires are cold. Use a reliable tire pressure gauge.'),
('When to Replace Wiper Blades', 'Wiper blades typically last 6-12 months. Replace them if you notice streaking, skipping, or chattering. Good visibility is key to safe driving, especially in adverse weather conditions.'),
('Importance of Regular Fluid Checks', 'Besides engine oil, your car uses brake fluid, coolant, power steering fluid, and transmission fluid. Regularly checking these fluids can prevent major issues. Consult your owner''s manual for checking procedures and schedules.'),
('Signs Your Brakes Need Attention', 'Listen for squealing or grinding noises. Notice if your car pulls to one side when braking, or if the brake pedal feels spongy or goes too far down. These are signs you need a brake inspection immediately.');

DELETE FROM team_members; -- Ensure table is empty before inserting new data
-- Team Members (from motor-vehicle-maintenance-website)
-- Note: Ensure image_url paths are relative to the service-booking-app/public/images/ directory
-- For example, if images are in service-booking-app/public/images/team/, then '/images/team/john_doe.jpg' is correct.
INSERT INTO team_members (name, role, image_url, description) VALUES
('Shyam Kumar R', 'Lead Mechanic', '/images/team/john_doe.jpg', 'John has over 15 years of experience in automotive repair and diagnostics. He is ASE certified and specializes in engine performance.'),
('V Narendran', 'Service Advisor', '/images/team/jane_smith.jpg', 'Jane is dedicated to providing excellent customer service and ensuring all your maintenance needs are clearly understood and addressed.'),
('Sirish Aravindakumar', 'Tire Specialist', '/images/team/mike_brown.jpg', 'Mike is our go-to expert for all things tires, from rotations and balancing to new tire installations.'),
('Vikas D H', 'Apprentice Mechanic', '/images/team/sarah_lee.jpg', 'Sarah is passionate about cars and eager to learn. She assists our senior mechanics and is quickly developing her skills.');

-- Note: User data is not pre-populated here; users will register.
-- Booking data will be generated as users make bookings.
