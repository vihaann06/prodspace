-- Add assigned_time field to todos table for calendar integration
ALTER TABLE todos 
ADD COLUMN assigned_time tsrange;

-- Add index for better performance when querying by assigned time
CREATE INDEX IF NOT EXISTS idx_todos_assigned_time ON todos USING GIST (assigned_time);

-- Add comment to document the new field
COMMENT ON COLUMN todos.assigned_time IS 'Time range when the todo is scheduled on the calendar (start_time-end_time)'; 