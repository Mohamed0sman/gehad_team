export interface Board {
  id: string;
  title: string;
  description: string | null;
  color: string;
  user_id: string;
  created_at: string;
  updated_at: string;
}

export interface Column {
  id: string;
  board_id: string;
  title: string;
  sort_order: number;
  created_at: string;
  user_id: string;
}

export type ColumnWithTasks = Column & {
  tasks: Task[];
};

export interface Task {
  id: string;
  column_id: string;
  title: string;
  description: string | null;
  assignee: string | null;
  due_date: string | null;
  priority: "low" | "medium" | "high";
  sort_order: number;
  created_at: string;
}

export interface Message {
  id: string;
  content: string;
  user_id: string;
  board_id: string;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
}

export interface Tag {
  id: string;
  name: string;
  color: string;
  board_id: string;
  user_id: string;
  created_at: string;
}

export interface TaskTag {
  task_id: string;
  tag_id: string;
}

export interface Checklist {
  id: string;
  title: string;
  task_id: string;
  sort_order: number;
  created_at: string;
}

export interface ChecklistItem {
  id: string;
  title: string;
  is_completed: boolean;
  checklist_id: string;
  sort_order: number;
  created_at: string;
  updated_at: string;
}

export interface Comment {
  id: string;
  content: string;
  user_id: string;
  task_id: string;
  created_at: string;
  updated_at: string;
  is_edited: boolean;
}

export interface Activity {
  id: string;
  action: string;
  entity_type: string;
  entity_id: number;
  user_id: string;
  board_id: string;
  created_at: string;
  details: Record<string, unknown>;
}

export interface TimeEntry {
  id: string;
  task_id: string;
  user_id: string;
  start_time: string;
  end_time: string | null;
  duration: number | null;
  description: string | null;
  created_at: string;
  updated_at: string;
}

export interface CustomField {
  id: string;
  name: string;
  field_type: string;
  options: Record<string, unknown> | null;
  board_id: string;
  user_id: string;
  created_at: string;
}

export interface TaskCustomFieldValue {
  task_id: string;
  custom_field_id: string;
  value: string | null;
}

export interface RecurringTask {
  id: string;
  task_id: string;
  frequency: string;
  interval: number;
  days_of_week: number[] | null;
  day_of_month: number | null;
  end_date: string | null;
  last_run: string | null;
  next_run: string | null;
  created_at: string;
}

export interface TaskRelation {
  id: string;
  task_id: string;
  related_task_id: string;
  relation_type: string;
  created_at: string;
}

export interface Milestone {
  id: string;
  name: string;
  description: string | null;
  due_date: string | null;
  board_id: string;
  is_completed: boolean;
  color: string;
  created_at: string;
}

export interface BoardView {
  id: string;
  name: string;
  view_type: string;
  config: Record<string, unknown> | null;
  board_id: string;
  user_id: string;
  is_default: boolean;
  created_at: string;
}
