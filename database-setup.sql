-- Create boards table
CREATE TABLE IF NOT EXISTS boards (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  color VARCHAR(50) DEFAULT 'bg-blue-500',
  user_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create columns table
CREATE TABLE IF NOT EXISTS columns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  board_id UUID REFERENCES boards(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  user_id VARCHAR(255) NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create tasks table
CREATE TABLE IF NOT EXISTS tasks (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  column_id UUID REFERENCES columns(id) ON DELETE CASCADE,
  title VARCHAR(255) NOT NULL,
  description TEXT,
  assignee VARCHAR(255),
  due_date TIMESTAMP WITH TIME ZONE,
  priority VARCHAR(10) DEFAULT 'medium' CHECK (priority IN ('low', 'medium', 'high')),
  sort_order INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_boards_user_id ON boards(user_id);
CREATE INDEX IF NOT EXISTS idx_columns_board_id ON columns(board_id);
CREATE INDEX IF NOT EXISTS idx_tasks_column_id ON tasks(column_id);

-- Enable Row Level Security (RLS)
ALTER TABLE boards ENABLE ROW LEVEL SECURITY;
ALTER TABLE columns ENABLE ROW LEVEL SECURITY;
ALTER TABLE tasks ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for boards
CREATE POLICY "Users can view their own boards" ON boards
  FOR SELECT USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can insert their own boards" ON boards
  FOR INSERT WITH CHECK (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can update their own boards" ON boards
  FOR UPDATE USING (user_id = auth.jwt() ->> 'sub');

CREATE POLICY "Users can delete their own boards" ON boards
  FOR DELETE USING (user_id = auth.jwt() ->> 'sub');

-- Create RLS policies for columns
CREATE POLICY "Users can view columns of their boards" ON columns
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = columns.board_id 
      AND boards.user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can insert columns to their boards" ON columns
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = columns.board_id 
      AND boards.user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can update columns of their boards" ON columns
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = columns.board_id 
      AND boards.user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can delete columns of their boards" ON columns
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM boards 
      WHERE boards.id = columns.board_id 
      AND boards.user_id = auth.jwt() ->> 'sub'
    )
  );

-- Create RLS policies for tasks
CREATE POLICY "Users can view tasks of their boards" ON tasks
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM columns 
      JOIN boards ON boards.id = columns.board_id 
      WHERE columns.id = tasks.column_id 
      AND boards.user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can insert tasks to their boards" ON tasks
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM columns 
      JOIN boards ON boards.id = columns.board_id 
      WHERE columns.id = tasks.column_id 
      AND boards.user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can update tasks of their boards" ON tasks
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM columns 
      JOIN boards ON boards.id = columns.board_id 
      WHERE columns.id = tasks.column_id 
      AND boards.user_id = auth.jwt() ->> 'sub'
    )
  );

CREATE POLICY "Users can delete tasks of their boards" ON tasks
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM columns 
      JOIN boards ON boards.id = columns.board_id 
      WHERE columns.id = tasks.column_id 
      AND boards.user_id = auth.jwt() ->> 'sub'
    )
  );

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create triggers for updated_at
CREATE TRIGGER update_boards_updated_at BEFORE UPDATE ON boards
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at BEFORE UPDATE ON tasks
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();