-- Create calendar_events table
CREATE TABLE IF NOT EXISTS calendar_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  todo_id UUID REFERENCES todos(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  date DATE NOT NULL,
  start_time TIME NOT NULL,
  duration_minutes INTEGER NOT NULL DEFAULT 30,
  position_top INTEGER DEFAULT 0,
  is_scheduled BOOLEAN DEFAULT false,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_calendar_events_user_date ON calendar_events(user_id, date);
CREATE INDEX IF NOT EXISTS idx_calendar_events_todo_id ON calendar_events(todo_id);

-- Enable Row Level Security
ALTER TABLE calendar_events ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can view their own calendar events" ON calendar_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own calendar events" ON calendar_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own calendar events" ON calendar_events
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own calendar events" ON calendar_events
  FOR DELETE USING (auth.uid() = user_id);

-- Add comments
COMMENT ON TABLE calendar_events IS 'Calendar events created from todos';
COMMENT ON COLUMN calendar_events.todo_id IS 'Reference to the todo that created this event';
COMMENT ON COLUMN calendar_events.date IS 'Date of the calendar event';
COMMENT ON COLUMN calendar_events.start_time IS 'Start time of the event (HH:MM:SS)';
COMMENT ON COLUMN calendar_events.duration_minutes IS 'Duration of the event in minutes';
COMMENT ON COLUMN calendar_events.position_top IS 'Top position for drag and drop functionality';
COMMENT ON COLUMN calendar_events.is_scheduled IS 'Whether the event has been scheduled on the calendar'; 