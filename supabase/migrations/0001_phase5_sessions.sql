CREATE TYPE session_type AS ENUM ('regular', 'special');
CREATE TYPE session_status AS ENUM ('scheduled', 'completed', 'cancelled');

ALTER TABLE sessions
ADD COLUMN type session_type NOT NULL DEFAULT 'regular',
ADD COLUMN title TEXT,
ADD COLUMN status session_status NOT NULL DEFAULT 'scheduled';

-- Allow public to view approved officials for the Kagawads transparency page
CREATE POLICY "Public can view approved officials" 
  ON officials FOR SELECT 
  TO PUBLIC 
  USING (status = 'approved');
