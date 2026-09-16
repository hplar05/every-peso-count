-- Create custom types
CREATE TYPE official_role AS ENUM ('admin', 'secretary', 'council_member');
CREATE TYPE official_status AS ENUM ('pending', 'approved', 'rejected');
CREATE TYPE project_status AS ENUM ('planning', 'ongoing', 'completed', 'on_hold');
CREATE TYPE feedback_status AS ENUM ('pending', 'in_review', 'resolved');
CREATE TYPE attendance_status AS ENUM ('present', 'absent', 'excused');

-- Officials Table
CREATE TABLE officials (
    id UUID PRIMARY KEY, -- Maps to auth.users if they have a login, otherwise just a unique UUID for council members
    name TEXT NOT NULL,
    role official_role NOT NULL,
    position TEXT,
    status official_status NOT NULL DEFAULT 'approved',
    qr_code TEXT,
    rejection_reason TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Projects Table
CREATE TABLE projects (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    description TEXT,
    status project_status NOT NULL DEFAULT 'planning',
    start_date DATE,
    target_date DATE,
    budget_allocated DECIMAL(15, 2) NOT NULL DEFAULT 0,
    budget_utilized DECIMAL(15, 2) NOT NULL DEFAULT 0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Milestones Table
CREATE TABLE milestones (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    title TEXT NOT NULL,
    target_date DATE,
    status project_status NOT NULL DEFAULT 'planning'
);

-- Budget Entries Table
CREATE TABLE budget_entries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    project_id UUID NOT NULL REFERENCES projects(id) ON DELETE CASCADE,
    source TEXT NOT NULL,
    amount_allocated DECIMAL(15, 2) NOT NULL DEFAULT 0,
    amount_spent DECIMAL(15, 2) NOT NULL DEFAULT 0,
    remaining_balance DECIMAL(15, 2) GENERATED ALWAYS AS (amount_allocated - amount_spent) STORED,
    purpose TEXT,
    date DATE NOT NULL DEFAULT CURRENT_DATE
);

-- Sessions Table
CREATE TABLE sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_date DATE NOT NULL,
    agenda TEXT NOT NULL,
    minutes_file_url TEXT
);

-- Attendance Table
CREATE TABLE attendance (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES sessions(id) ON DELETE CASCADE,
    official_id UUID NOT NULL REFERENCES officials(id) ON DELETE CASCADE,
    status attendance_status NOT NULL,
    scanned_at TIMESTAMPTZ,
    UNIQUE(session_id, official_id)
);

-- Feedback Table
CREATE TABLE feedback (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    resident_name TEXT,
    message TEXT NOT NULL,
    status feedback_status NOT NULL DEFAULT 'pending',
    response TEXT,
    handled_by UUID REFERENCES officials(id) ON DELETE SET NULL,
    tracking_code TEXT UNIQUE,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Notifications Table
CREATE TABLE notifications (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    type TEXT NOT NULL,
    message TEXT NOT NULL,
    sent_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    recipient_scope TEXT NOT NULL
);

-- ENABLE ROW LEVEL SECURITY
ALTER TABLE officials ENABLE ROW LEVEL SECURITY;
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE milestones ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_entries ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE attendance ENABLE ROW LEVEL SECURITY;
ALTER TABLE feedback ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;


-- -----------------------------------------------------------------------------
-- RLS POLICIES
-- -----------------------------------------------------------------------------

-- Helper function to check if the current user is an approved admin or secretary
CREATE OR REPLACE FUNCTION is_admin_or_secretary()
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM officials 
    WHERE id = auth.uid() 
      AND (role = 'admin' OR role = 'secretary') 
      AND status = 'approved'
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;


-- 1. Officials
-- Admin/Secretary can read/write everything
CREATE POLICY "Admin and Secretary can manage officials" 
  ON officials FOR ALL 
  USING (is_admin_or_secretary());

-- 2. Projects
CREATE POLICY "Admin and Secretary can manage projects" 
  ON projects FOR ALL 
  USING (is_admin_or_secretary());

CREATE POLICY "Public can view projects" 
  ON projects FOR SELECT 
  TO PUBLIC 
  USING (true);

-- 3. Milestones
CREATE POLICY "Admin and Secretary can manage milestones" 
  ON milestones FOR ALL 
  USING (is_admin_or_secretary());

CREATE POLICY "Public can view milestones" 
  ON milestones FOR SELECT 
  TO PUBLIC 
  USING (true);

-- 4. Budget Entries
CREATE POLICY "Admin and Secretary can manage budget_entries" 
  ON budget_entries FOR ALL 
  USING (is_admin_or_secretary());

CREATE POLICY "Public can view budget_entries" 
  ON budget_entries FOR SELECT 
  TO PUBLIC 
  USING (true);

-- 5. Sessions
CREATE POLICY "Admin and Secretary can manage sessions" 
  ON sessions FOR ALL 
  USING (is_admin_or_secretary());

CREATE POLICY "Public can view sessions" 
  ON sessions FOR SELECT 
  TO PUBLIC 
  USING (true);

-- 6. Attendance
CREATE POLICY "Admin and Secretary can manage attendance" 
  ON attendance FOR ALL 
  USING (is_admin_or_secretary());

CREATE POLICY "Public can view attendance" 
  ON attendance FOR SELECT 
  TO PUBLIC 
  USING (true);

-- 7. Feedback
CREATE POLICY "Admin and Secretary can manage feedback" 
  ON feedback FOR ALL 
  USING (is_admin_or_secretary());

-- Public can view resolved feedback, but can insert any new feedback
CREATE POLICY "Public can view resolved feedback" 
  ON feedback FOR SELECT 
  TO PUBLIC 
  USING (status = 'resolved');

CREATE POLICY "Public can submit feedback" 
  ON feedback FOR INSERT 
  TO PUBLIC 
  WITH CHECK (true);

-- 8. Notifications
CREATE POLICY "Admin and Secretary can manage notifications" 
  ON notifications FOR ALL 
  USING (is_admin_or_secretary());

CREATE POLICY "Public can view public notifications" 
  ON notifications FOR SELECT 
  TO PUBLIC 
  USING (recipient_scope = 'public');
