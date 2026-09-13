-- ==============================================================================
-- CAMPUSVOICE SEED DATA (Standard Departments, Sample Complaints, Suggestions)
-- ==============================================================================

-- 1. Insert Core Campus Departments
INSERT INTO departments (id, name, code, description, contact_email) VALUES
('d1111111-1111-1111-1111-111111111111', 'Hostel Administration & Wardens', 'HOSTEL', 'Hostel accommodation, room issues, curfew & hostel amenities', 'warden.office@campus.edu'),
('d2222222-2222-2222-2222-222222222222', 'Campus Maintenance & Plumbing', 'MAINTENANCE', 'Water supply, plumbing, civil repairs, and electrical systems', 'maintenance@campus.edu'),
('d3333333-3333-3333-3333-333333333333', 'IT & Network Infrastructure', 'IT_NETWORK', 'Campus Wi-Fi, Ethernet, portals, and computer laboratory systems', 'ithelpdesk@campus.edu'),
('d4444444-4444-4444-4444-444444444444', 'Mess & Food Services', 'MESS_FOOD', 'Dining hall, cafeteria food quality, hygiene and drinking water', 'mess.committee@campus.edu'),
('d5555555-5555-5555-5555-555555555555', 'Academic Affairs & Faculty', 'ACADEMICS', 'Course registration, lectures, examination hall & faculty queries', 'dean.academics@campus.edu'),
('d6666666-6666-6666-6666-666666666666', 'Campus Security & Safety', 'SECURITY', 'Campus gates, security patrols, surveillance & student safety', 'security.chief@campus.edu'),
('d7777777-7777-7777-7777-777777777777', 'Medical & Healthcare Center', 'MEDICAL', 'Campus dispensary, emergency medical care & health checks', 'healthcenter@campus.edu'),
('d8888888-8888-8888-8888-888888888888', 'Finance & Accounts', 'ACCOUNTS', 'Fee payments, scholarship disbursements & fines queries', 'finance@campus.edu')
ON CONFLICT (code) DO NOTHING;

-- 2. Insert Sample Seed Complaints
INSERT INTO complaints (
    id,
    public_tracking_id,
    anonymous_public_id,
    category,
    title,
    description,
    priority,
    status,
    location,
    hostel_block,
    assigned_department_id,
    is_emergency,
    upvote_count,
    ai_summary,
    ai_suggested_category,
    ai_confidence,
    created_at
) VALUES
(
    'c1111111-1111-1111-1111-111111111111',
    'CV-82K4P',
    'Anonymous Student #A7F29',
    'Hostel',
    'Water leakage in hostel room ceiling',
    'There has been water leaking from the ceiling in the 3rd floor corridor and into room 312 for the past two days. The floor becomes wet and slippery, posing a slip hazard.',
    'high',
    'investigating',
    'Block A, 3rd Floor Corridor & Room 312',
    'Block A',
    'd2222222-2222-2222-2222-222222222222',
    false,
    18,
    'Plumbing issue reported in Block A involving ceiling leakage affecting corridors and student rooms.',
    'Plumbing',
    94.50,
    NOW() - INTERVAL '2 days'
),
(
    'c2222222-2222-2222-2222-222222222222',
    'CV-91M3X',
    'Anonymous Student #B4C81',
    'Wi-Fi/Internet',
    'Wi-Fi connectivity dropouts in Block B study area',
    'Wi-Fi access points in Block B North Wing disconnect constantly every 5 minutes during peak evening hours (8 PM - 11 PM), making it impossible to attend online lectures or submit assignments.',
    'medium',
    'assigned',
    'Block B, North Wing Study Lounge',
    'Block B',
    'd3333333-3333-3333-3333-333333333333',
    false,
    47,
    'Intermittent network access point degradation in Block B study areas during evening peak hours.',
    'Wi-Fi/Internet',
    98.20,
    NOW() - INTERVAL '4 days'
),
(
    'c3333333-3333-3333-3333-333333333333',
    'CV-10X7R',
    'Anonymous Student #E9D12',
    'Security',
    'Exposed high-voltage electrical cable near East Gate walkway',
    'A construction cable is uncovered and exposed to rain water near the East Gate pedestrian walkway. Immediate safety risk for students walking in the evening.',
    'critical',
    'action_taken',
    'Pedestrian Walkway adjacent to East Gate',
    'Campus Grounds',
    'd2222222-2222-2222-2222-222222222222',
    true,
    63,
    'CRITICAL SAFETY HAZARD: Exposed live cable on pedestrian route with rainwater exposure.',
    'Electricity',
    99.80,
    NOW() - INTERVAL '1 day'
),
(
    'c4444444-4444-4444-4444-444444444444',
    'CV-44P9Q',
    'Anonymous Student #K3L88',
    'Mess/Food',
    'Drinking water dispenser filter overdue in South Dining Hall',
    'The water dispenser filter light in South Dining Hall has been flashing red for 2 weeks. The water has a slight metallic odor.',
    'high',
    'resolved',
    'South Dining Hall - Dispenser #2',
    'Dining Complex',
    'd4444444-4444-4444-4444-444444444444',
    false,
    29,
    'Maintenance required for drinking water filtration units in dining area.',
    'Mess/Food',
    92.00,
    NOW() - INTERVAL '6 days'
)
ON CONFLICT (id) DO NOTHING;

-- 3. Sample Messages for CV-82K4P
INSERT INTO complaint_messages (
    complaint_id,
    sender_role,
    sender_display_name,
    message,
    created_at
) VALUES
(
    'c1111111-1111-1111-1111-111111111111',
    'student',
    'Anonymous Student #A7F29',
    'Water leakage is still not fixed and it is dripping heavier after yesterday evening rainfall.',
    NOW() - INTERVAL '1 day'
),
(
    'c1111111-1111-1111-1111-111111111111',
    'warden',
    'Block A Warden Office',
    'Our maintenance plumbing team has been dispatched and will inspect the 4th floor overhead pipe today at 2:00 PM.',
    NOW() - INTERVAL '18 hours'
),
(
    'c1111111-1111-1111-1111-111111111111',
    'student',
    'Anonymous Student #A7F29',
    'Thank you. The issue seems to originate right above room 312.',
    NOW() - INTERVAL '12 hours'
)
ON CONFLICT DO NOTHING;

-- 4. Sample Suggestions
INSERT INTO suggestions (
    id,
    title,
    description,
    category,
    anonymous_public_id,
    status,
    upvote_count,
    official_response,
    created_at
) VALUES
(
    's1111111-1111-1111-1111-111111111111',
    'Extend Library Late Night Hours During Mid-term Exam Weeks',
    'Requesting central library reading halls to remain open until 2:00 AM during mid-term and final examination weeks with safe night shuttle transportation.',
    'Academics',
    'Anonymous Student #S1049',
    'approved',
    114,
    'Approved by Dean of Academics and Security. Library will operate till 1:30 AM starting upcoming exam week.',
    NOW() - INTERVAL '5 days'
),
(
    's2222222-2222-2222-2222-222222222222',
    'Install Additional RO Water Purifiers in Block C',
    'Block C currently has 4 floors but only one functioning water purifier on the ground floor. Installing units on the 2nd and 4th floors would ease congestion.',
    'Hostel',
    'Anonymous Student #S8831',
    'under_review',
    82,
    'Estimates submitted to procurement committee.',
    NOW() - INTERVAL '3 days'
)
ON CONFLICT DO NOTHING;

-- 5. Sample Announcements
INSERT INTO announcements (
    id,
    title,
    content,
    department_id,
    target_audience,
    priority,
    expires_at,
    created_by,
    created_at
) VALUES
(
    'a1111111-1111-1111-1111-111111111111',
    'Scheduled Water Supply Maintenance in Block A & B',
    'Please be informed that overhead tank cleaning and plumbing pipeline maintenance is scheduled for tomorrow between 10:00 AM and 2:00 PM. Please store adequate water beforehand.',
    'd2222222-2222-2222-2222-222222222222',
    'hostel',
    'urgent',
    NOW() + INTERVAL '3 days',
    'Campus Maintenance Office',
    NOW() - INTERVAL '1 day'
),
(
    'a2222222-2222-2222-2222-222222222222',
    'Campus High-Speed Wi-Fi Router Upgrades Completed',
    'IT Department has deployed 24 new Wi-Fi 6 access points across Central Library and Block C. Please report any dead zones directly via CampusVoice.',
    'd3333333-3333-3333-3333-333333333333',
    'all',
    'normal',
    NOW() + INTERVAL '7 days',
    'IT Services Helpdesk',
    NOW() - INTERVAL '2 days'
)
ON CONFLICT DO NOTHING;
