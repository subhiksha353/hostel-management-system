-- ==============================================================================
-- CAMPUSVOICE DATABASE MIGRATION & RLS PRIVACY ARCHITECTURE
-- ==============================================================================

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. ENUMS
DO $$ BEGIN
    CREATE TYPE user_role AS ENUM ('student', 'warden', 'department_staff', 'admin', 'super_admin');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE complaint_priority AS ENUM ('low', 'medium', 'high', 'critical');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE complaint_status AS ENUM (
        'submitted',
        'acknowledged',
        'assigned',
        'investigating',
        'waiting_for_info',
        'action_taken',
        'resolved',
        'reopened',
        'closed'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

DO $$ BEGIN
    CREATE TYPE suggestion_status AS ENUM ('pending', 'under_review', 'approved', 'rejected', 'implemented');
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- 2. DEPARTMENTS TABLE
CREATE TABLE IF NOT EXISTS departments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name VARCHAR(100) NOT NULL UNIQUE,
    code VARCHAR(50) NOT NULL UNIQUE,
    description TEXT,
    contact_email VARCHAR(255),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 3. PROFILES TABLE (Separated student / staff identities)
CREATE TABLE IF NOT EXISTS profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    email VARCHAR(255) NOT NULL,
    name VARCHAR(255) NOT NULL,
    role user_role NOT NULL DEFAULT 'student',
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    year VARCHAR(20),
    hostel_resident BOOLEAN DEFAULT true,
    hostel_block VARCHAR(50),
    room_number VARCHAR(50),
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 4. COMPLAINTS TABLE (Public grievance record - ZERO student ID reference)
CREATE TABLE IF NOT EXISTS complaints (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    public_tracking_id VARCHAR(20) NOT NULL UNIQUE, -- e.g. CV-82K4P
    anonymous_public_id VARCHAR(50) NOT NULL, -- e.g. Anonymous Student #A7F29
    category VARCHAR(50) NOT NULL,
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    priority complaint_priority NOT NULL DEFAULT 'medium',
    status complaint_status NOT NULL DEFAULT 'submitted',
    location VARCHAR(255) NOT NULL,
    hostel_block VARCHAR(50),
    assigned_department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    is_emergency BOOLEAN DEFAULT FALSE,
    upvote_count INTEGER DEFAULT 0,
    ai_summary TEXT,
    ai_suggested_category VARCHAR(50),
    ai_confidence NUMERIC(5,2),
    resolution_notes TEXT,
    resolved_at TIMESTAMPTZ,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 5. COMPLAINT IDENTITY MAP TABLE (STRICT PRIVACY VAULT)
-- NEVER Accessible by warden, staff, or management roles via RLS
CREATE TABLE IF NOT EXISTS complaint_identity_map (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    student_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_complaint_student UNIQUE (complaint_id, student_id)
);

-- 6. COMPLAINT ATTACHMENTS TABLE
CREATE TABLE IF NOT EXISTS complaint_attachments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    file_name VARCHAR(255) NOT NULL,
    file_type VARCHAR(100) NOT NULL, -- 'image', 'video', 'audio', 'document'
    file_size BIGINT NOT NULL,
    file_url TEXT NOT NULL,
    storage_path TEXT NOT NULL,
    uploader_role VARCHAR(50) NOT NULL, -- 'student' or 'management'
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 7. COMPLAINT MESSAGES TABLE (Realtime two-way anonymous chat)
CREATE TABLE IF NOT EXISTS complaint_messages (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    sender_role VARCHAR(50) NOT NULL, -- 'student' or 'management' / 'warden' / 'staff'
    sender_display_name VARCHAR(100) NOT NULL, -- 'Anonymous Student #A7F29' or 'Hostel Warden'
    message TEXT NOT NULL,
    attachments JSONB DEFAULT '[]'::jsonb,
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 8. COMPLAINT STATUS HISTORY & AUDIT TRAIL
CREATE TABLE IF NOT EXISTS complaint_status_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    old_status complaint_status,
    new_status complaint_status NOT NULL,
    changed_by_role VARCHAR(50) NOT NULL,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 9. COMPLAINT UPVOTES TABLE (Hash-protected anonymous upvotes)
CREATE TABLE IF NOT EXISTS complaint_upvotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    student_hash VARCHAR(64) NOT NULL, -- SHA256(student_id + salt)
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_complaint_upvote UNIQUE (complaint_id, student_hash)
);

-- 10. SUGGESTIONS TABLE
CREATE TABLE IF NOT EXISTS suggestions (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    description TEXT NOT NULL,
    category VARCHAR(50) NOT NULL,
    anonymous_public_id VARCHAR(50) NOT NULL,
    status suggestion_status NOT NULL DEFAULT 'pending',
    upvote_count INTEGER DEFAULT 0,
    official_response TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 11. SUGGESTION UPVOTES TABLE
CREATE TABLE IF NOT EXISTS suggestion_upvotes (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    suggestion_id UUID NOT NULL REFERENCES suggestions(id) ON DELETE CASCADE,
    student_hash VARCHAR(64) NOT NULL,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_suggestion_upvote UNIQUE (suggestion_id, student_hash)
);

-- 12. ANNOUNCEMENTS TABLE
CREATE TABLE IF NOT EXISTS announcements (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    title VARCHAR(255) NOT NULL,
    content TEXT NOT NULL,
    department_id UUID REFERENCES departments(id) ON DELETE SET NULL,
    target_audience VARCHAR(50) DEFAULT 'all', -- 'all', 'hostel', 'day_scholars', 'block_a', etc.
    priority VARCHAR(20) DEFAULT 'normal', -- 'normal', 'urgent'
    expires_at TIMESTAMPTZ,
    created_by VARCHAR(100) DEFAULT 'Campus Administration',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 13. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    user_role VARCHAR(50),
    title VARCHAR(255) NOT NULL,
    message TEXT NOT NULL,
    link VARCHAR(255),
    type VARCHAR(50) DEFAULT 'general', -- 'complaint', 'message', 'status', 'announcement', 'emergency'
    is_read BOOLEAN DEFAULT FALSE,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 14. FEEDBACK TABLE (Post-resolution verification)
CREATE TABLE IF NOT EXISTS feedback (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    complaint_id UUID NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
    is_resolved BOOLEAN NOT NULL,
    rating INTEGER CHECK (rating >= 1 AND rating <= 5),
    comments TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT unique_complaint_feedback UNIQUE (complaint_id)
);

-- 15. AUDIT LOGS TABLE
CREATE TABLE IF NOT EXISTS audit_logs (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    action VARCHAR(100) NOT NULL,
    entity_type VARCHAR(50) NOT NULL,
    entity_id VARCHAR(100) NOT NULL,
    actor_role VARCHAR(50) NOT NULL,
    details JSONB DEFAULT '{}'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ==============================================================================
-- INDEXES FOR MAXIMUM QUERY PERFORMANCE
-- ==============================================================================
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_priority ON complaints(priority);
CREATE INDEX IF NOT EXISTS idx_complaints_category ON complaints(category);
CREATE INDEX IF NOT EXISTS idx_complaints_tracking_id ON complaints(public_tracking_id);
CREATE INDEX IF NOT EXISTS idx_complaints_dept ON complaints(assigned_department_id);
CREATE INDEX IF NOT EXISTS idx_complaint_identity_student ON complaint_identity_map(student_id);
CREATE INDEX IF NOT EXISTS idx_complaint_messages_complaint ON complaint_messages(complaint_id);
CREATE INDEX IF NOT EXISTS idx_complaint_attachments_complaint ON complaint_attachments(complaint_id);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_suggestions_status ON suggestions(status);

-- ==============================================================================
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ==============================================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE departments ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaints ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_identity_map ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_attachments ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_status_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE complaint_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestions ENABLE ROW LEVEL SECURITY;
ALTER TABLE suggestion_upvotes ENABLE ROW LEVEL SECURITY;
ALTER TABLE announcements ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE audit_logs ENABLE ROW LEVEL SECURITY;

-- Helper function to check role
CREATE OR REPLACE FUNCTION current_user_role()
RETURNS user_role AS $$
  SELECT role FROM profiles WHERE id = auth.uid() LIMIT 1;
$$ LANGUAGE sql SECURITY DEFINER;

-- 1. PROFILES POLICIES
CREATE POLICY "Users can read own profile"
    ON profiles FOR SELECT
    USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
    ON profiles FOR UPDATE
    USING (auth.uid() = id);

CREATE POLICY "Super admin can read all profiles"
    ON profiles FOR SELECT
    USING (current_user_role() = 'super_admin');

-- 2. DEPARTMENTS POLICIES
CREATE POLICY "Anyone authenticated can read departments"
    ON departments FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Admins can manage departments"
    ON departments FOR ALL
    TO authenticated
    USING (current_user_role() IN ('admin', 'super_admin'));

-- 3. COMPLAINTS POLICIES
-- Students can read complaints they created (via identity map) OR all complaints in public/upvoting feed
CREATE POLICY "Anyone authenticated can read complaints"
    ON complaints FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Students can create complaints"
    ON complaints FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Management can update complaints"
    ON complaints FOR UPDATE
    TO authenticated
    USING (current_user_role() IN ('warden', 'department_staff', 'admin', 'super_admin'));

-- 4. COMPLAINT IDENTITY MAP POLICIES (THE PRIVACY CORE)
-- CRITICAL: Students can ONLY SELECT/INSERT their own map rows.
-- ZERO management roles are allowed to SELECT from this table.
CREATE POLICY "Students can view only their own mapping"
    ON complaint_identity_map FOR SELECT
    TO authenticated
    USING (auth.uid() = student_id);

CREATE POLICY "Students can insert their own mapping"
    ON complaint_identity_map FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = student_id);

-- Explicitly DO NOT create any management select policy for complaint_identity_map.

-- 5. COMPLAINT ATTACHMENTS POLICIES
CREATE POLICY "Authenticated users can read attachments"
    ON complaint_attachments FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can upload attachments"
    ON complaint_attachments FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- 6. COMPLAINT MESSAGES POLICIES
CREATE POLICY "Users can read messages for complaints"
    ON complaint_messages FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Authenticated users can send messages"
    ON complaint_messages FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- 7. SUGGESTIONS & ANNOUNCEMENTS POLICIES
CREATE POLICY "Anyone can read suggestions"
    ON suggestions FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Students can create suggestions"
    ON suggestions FOR INSERT
    TO authenticated
    WITH CHECK (true);

CREATE POLICY "Management can update suggestions"
    ON suggestions FOR UPDATE
    TO authenticated
    USING (current_user_role() IN ('warden', 'department_staff', 'admin', 'super_admin'));

CREATE POLICY "Anyone can read announcements"
    ON announcements FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Management can manage announcements"
    ON announcements FOR ALL
    TO authenticated
    USING (current_user_role() IN ('warden', 'department_staff', 'admin', 'super_admin'));

-- 8. NOTIFICATIONS POLICIES
CREATE POLICY "Users can read own notifications"
    ON notifications FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id OR user_role = current_user_role()::text);

CREATE POLICY "Users can update own notifications"
    ON notifications FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

-- 9. FEEDBACK POLICIES
CREATE POLICY "Anyone authenticated can read feedback"
    ON feedback FOR SELECT
    TO authenticated
    USING (true);

CREATE POLICY "Students can submit feedback"
    ON feedback FOR INSERT
    TO authenticated
    WITH CHECK (true);

-- 10. AUDIT LOGS POLICIES
CREATE POLICY "Staff and admin can view audit logs"
    ON audit_logs FOR SELECT
    TO authenticated
    USING (current_user_role() IN ('warden', 'department_staff', 'admin', 'super_admin'));

CREATE POLICY "Authenticated users can create audit logs"
    ON audit_logs FOR INSERT
    TO authenticated
    WITH CHECK (true);
