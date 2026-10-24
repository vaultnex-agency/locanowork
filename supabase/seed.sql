-- ==============================================================================
-- LOCANO — Development / Demo Seed Data
-- Clearly isolated with is_demo = true and status = 'published'
-- ==============================================================================

-- ACCOMMODATION DEMO LISTINGS
insert into public.accommodation_listings (
  id, name, tagline, type, gender, area, approximate_location, nearest_landmark,
  monthly_rent_from, security_deposit, sharing_options, amenities, room_features,
  house_rules, food_option, notice_period_days, description, sample_image, status, is_demo
) values
(
  'greenfield-residence',
  'Greenfield Student Residence',
  'Spacious student living with quiet study areas near Kadri',
  'PG',
  'Boys',
  'Kadri',
  'Kadri Temple Road vicinity',
  'Near Kadri Hills / Park',
  6500,
  13000,
  array['Single Room', 'Double Sharing', 'Triple Sharing'],
  array['High-speed Wi-Fi', 'Power Backup', 'Washing Machine', '24/7 Water Supply', 'CCTV Security', 'Daily Housekeeping'],
  array['Study Table & Chair', 'Wardrobe', 'Ceiling Fan', 'Attached Bathroom'],
  array['Gate closing time: 10:00 PM', 'Visitors allowed in common lounge only', 'No smoking or alcohol on premises'],
  'Included (3 meals)',
  30,
  'A fictional student PG designed to showcase LOCANO layout. Features ventilated rooms, high-speed Wi-Fi, home-style South Indian food, and proximity to city transit stops.',
  '/hero-coast.png',
  'published',
  true
),
(
  'coastal-breeze-women-pg',
  'Coastal Breeze Women''s PG',
  'Secure and homely residence for female students and interns',
  'PG',
  'Girls',
  'Balmatta',
  'Falnir - Balmatta corridor',
  'Near Balmatta Circle',
  7200,
  14400,
  array['Single Room', 'Double Sharing'],
  array['Biometric Access & Warden', 'High-speed Wi-Fi', 'Pure Drinking Water (RO)', 'Laundry Area', 'Solar Water Heater', 'Emergency Power Backup'],
  array['Individual Wardrobes', 'Mattress & Bed', 'Study Desk', 'Balcony in select rooms'],
  array['Entry curfew: 9:00 PM', 'Prior intimation for night-outs required', 'No male visitors inside hostel blocks'],
  'Included (3 meals)',
  30,
  'Safe, well-maintained ladies residence close to coaching academies, city bus routes, and key healthcare campuses.',
  '/hero-coast.png',
  'published',
  true
),
(
  'sahyadri-scholars-inn',
  'Sahyadri Scholars Inn',
  'Affordable twin and triple sharing rooms for engineering and medical students',
  'Hostel',
  'Boys',
  'Kottara',
  'Kottara Chowki bypass area',
  'Near Infosys Kottara campus',
  5500,
  11000,
  array['Double Sharing', 'Triple Sharing', 'Four Sharing'],
  array['Wi-Fi in all rooms', 'Filtered Drinking Water', 'Two-wheeler Parking', 'Self-service Laundry Area', 'Daily Cleaning'],
  array['Bunk Beds with Storage', 'Compact Study Table', 'Ceiling Fans'],
  array['Quiet hours strictly enforced from 10:30 PM', 'Guest policy subject to warden clearance'],
  'Optional / Available',
  15,
  'Budget-friendly hostel stay designed for students requiring swift transit to NH-66 and north Mangaluru educational institutions.',
  '/hero-coast.png',
  'published',
  true
),
(
  'palm-grove-shared-flat',
  'Palm Grove Student Flats',
  'Fully furnished 3BHK flat shared between college friends with kitchen access',
  'Shared Apartment',
  'Co-ed',
  'Bejai',
  'Bejai Main Road',
  'Behind KSRTC Bus Stand',
  8000,
  16000,
  array['Single Room', 'Double Sharing'],
  array['High-speed 100 Mbps Wi-Fi', 'Washing Machine', 'Refrigerator & Stove', 'Covered Car/Bike Parking', 'Lift with Generator Backup'],
  array['Air Conditioner (select rooms)', 'Work Desk & Ergonomic Chair', 'Built-in Cupboards'],
  array['Maintain neighborhood decorum', 'Strictly no loud music past 11:00 PM'],
  'Self-cooking only',
  30,
  'Independent apartment living with complete autonomy, kitchen facilities, and walking distance to KSRTC transit terminal.',
  '/hero-coast.png',
  'published',
  true
),
(
  'kudla-comfort-stays',
  'Kudla Comfort Ladies PG',
  'Premium AC and non-AC rooms with home-style Mangalorean dining',
  'PG',
  'Girls',
  'Kankanady',
  'Pumpwell - Kankanady junction',
  'Near Father Muller Medical College',
  7800,
  15600,
  array['Single Room', 'Double Sharing', 'Triple Sharing'],
  array['24/7 Female Security Guard', 'Full Power Backup', 'RO Purifier', 'Hot Water', 'Study Hall & Library Corner'],
  array['Orthopedic Mattress', 'Large Wardrobe', 'Study Desk with Lamp', 'Attached Bath'],
  array['Entry cutoff: 9:30 PM', 'ID verification for visitors', 'Quiet hours for study after 10:00 PM'],
  'Included (3 meals)',
  30,
  'A premium fictional girls'' residence showcasing comprehensive amenity tags, inclusive meals, and full-featured property details.',
  '/hero-coast.png',
  'published',
  true
)
on conflict (id) do nothing;

-- MESS DEMO LISTINGS
insert into public.mess_listings (
  id, name, tagline, cuisine, dietary, service_type, area, approximate_location, nearest_landmark,
  monthly_price_from, per_meal_price_from, meals_served, meal_plans, daily_menu_sample, timings,
  highlights, kitchen_features, subscription_rules, description, sample_image, status, is_demo
) values
(
  'annapoorna-student-mess',
  'Annapoorna Student Mess',
  'Authentic coastal vegetarian meals served hot and unlimited every day',
  'Udupi & South Indian Pure Veg',
  'Pure Veg',
  'Dine-in & Delivery',
  'Kadri',
  'Near Kadri Temple Square',
  'Behind Kadri Police Station',
  3200,
  90,
  array['Breakfast', 'Lunch', 'Dinner'],
  '[
    {"name": "Full Month (3 Meals/Day)", "price": 3200, "period": "month", "description": "Unlimited breakfast, lunch and dinner every day. Sunday evening special sweet.", "popular": true},
    {"name": "Lunch & Dinner Pass", "price": 2600, "period": "month", "description": "Ideal for students having campus canteen breakfast."},
    {"name": "Single Meal Coupon", "price": 90, "period": "per-meal", "description": "Pay and eat anytime without monthly commitment."}
  ]'::jsonb,
  '{
    "breakfast": "Idli Sambar / Poha / Set Dosa + Filter Coffee or Tea",
    "lunch": "Boiled Rice / White Rice, Rasam, Sambar, Palya, Buttermilk, Papad",
    "dinner": "Chapati (3 pcs), Mixed Veg Kurma, Dal, Steamed Rice, Curd"
  }'::jsonb,
  '{
    "breakfast": "7:30 AM – 9:45 AM",
    "lunch": "12:30 PM – 3:00 PM",
    "dinner": "7:30 PM – 10:00 PM"
  }'::jsonb,
  array['Unlimited Rice & Rasam', 'Home-style Coconut Chutney', 'Clean Filtered Drinking Water', 'Sunday Payasam Special'],
  array['Separate stainless steel prep tables', 'RO UV Water Filtration', 'Closed steam cooking vessels'],
  array['Carry Locano digital QR pass upon arrival', 'Advance pause notice required 12 hours prior via WhatsApp'],
  'Annapoorna has been serving student-friendly coastal thalis and Udupi-style meals in Kadri. Famous for fragrant boiled rice, digestion-friendly ginger rasam, and Sunday sweets.',
  '/mess-tiffin.jpg',
  'published',
  true
),
(
  'swathi-tiffin-express',
  'Swathi Tiffin & Dabba Service',
  'Convenient student doorstep tiffin boxes delivered directly to your PG or hostel room',
  'Mangalorean & North Indian Options',
  'Veg & Non-Veg',
  'Tiffin & Delivery',
  'Balmatta',
  'Balmatta Road Corridor',
  'Near Don Bosco Hall',
  3500,
  110,
  array['Lunch', 'Dinner'],
  '[
    {"name": "Monthly Dabba (Lunch + Dinner)", "price": 3500, "period": "month", "description": "Delivered in thermal 4-tier steel dabbas twice daily.", "popular": true},
    {"name": "Dinner Only Dabba", "price": 1950, "period": "month", "description": "Ideal for students who eat campus food during the day."},
    {"name": "15-Day Flexible Plan", "price": 1900, "period": "15-days", "description": "Great for exam prep blocks or internship stays."}
  ]'::jsonb,
  '{
    "lunch": "3 Phulkas, Basmati Rice, Chicken Curry (or Paneer Butter Masala for Veg), Dry Sabji, Dal Fry, Pickle",
    "dinner": "Ghee Rice, Dal Tadka, Seasonal Veg Sabzi, Salad, Sweet Dish"
  }'::jsonb,
  '{
    "lunch": "Delivery between 12:15 PM – 1:15 PM",
    "dinner": "Delivery between 7:30 PM – 8:30 PM"
  }'::jsonb,
  array['Insulated Hot Dabbas', 'Free Delivery within 3 km', 'Flexible Pause Policy during Exams', 'Rotational Weekly Menu'],
  array['Hygienic foil & steel packing options', 'Separate vegetarian prep zone', 'Cooks undergo routine health checkups'],
  array['Tiffin container must be washed and handed back during next delivery', 'Pause subscriptions 24 hours in advance'],
  'Reliable student dabba service covering hostels and shared flats across Balmatta, Hampankatta, and Falnir. Nutritious, low-oil preparation designed for everyday eating.',
  '/mess-tiffin.jpg',
  'published',
  true
)
on conflict (id) do nothing;
