-- Add new tracking columns to the habits table
ALTER TABLE habits 
ADD COLUMN current_streak INTEGER DEFAULT 0,
ADD COLUMN longest_streak INTEGER DEFAULT 0,
ADD COLUMN last_tracked_date DATE,
ADD COLUMN start_date TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
ADD COLUMN last_relapse_date TIMESTAMP WITH TIME ZONE;

-- Update existing habits to have a start_date if they don't have one
UPDATE habits 
SET start_date = created_at 
WHERE start_date IS NULL;

-- Add comments to document the new columns
COMMENT ON COLUMN habits.current_streak IS 'Current consecutive streak for starting habits';
COMMENT ON COLUMN habits.longest_streak IS 'Longest streak achieved for starting habits';
COMMENT ON COLUMN habits.last_tracked_date IS 'Last date when habit was marked as done';
COMMENT ON COLUMN habits.start_date IS 'Date when habit tracking started';
COMMENT ON COLUMN habits.last_relapse_date IS 'Last timestamp when user relapsed (for quitting habits)'; 