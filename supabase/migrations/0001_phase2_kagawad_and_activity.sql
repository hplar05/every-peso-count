-- Rename council_member to kagawad
ALTER TYPE official_role RENAME VALUE 'council_member' TO 'kagawad';

-- Create Activity Log Table
CREATE TABLE activity_log (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    official_id UUID REFERENCES officials(id) ON DELETE SET NULL,
    action TEXT NOT NULL,
    target_table TEXT,
    target_id UUID,
    created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE activity_log ENABLE ROW LEVEL SECURITY;

-- Activity Log Policies
-- Admins and Secretaries can view the activity log
CREATE POLICY "Admins and Secretaries can view activity logs" 
  ON activity_log FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM officials 
      WHERE id = auth.uid() 
        AND (role = 'admin' OR role = 'secretary') 
        AND status = 'approved'
    )
  );

-- Admins, Secretaries, and Kagawads can insert into activity log
CREATE POLICY "Officials can insert activity logs" 
  ON activity_log FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM officials 
      WHERE id = auth.uid() 
        AND status = 'approved'
    )
  );
