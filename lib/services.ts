import { Board, Column, ColumnWithTasks, Task, Message, Tag, Checklist, ChecklistItem, Comment, Activity, TimeEntry, CustomField, TaskCustomFieldValue, RecurringTask, TaskRelation, Milestone } from "./supabase/models";
import { SupabaseClient } from "@supabase/supabase-js";

export const boardService = {
  async getBoard(supabase: SupabaseClient, boardId: string): Promise<Board> {
    const { data, error } = await supabase
      .from("boards")
      .select("*")
      .eq("id", boardId)
      .single();

    if (error) throw error;

    return data;
  },

  async getBoards(supabase: SupabaseClient, userId: string): Promise<Board[]> {
    console.log("📝 Fetching boards for userId:", userId);
    
    const { data, error } = await supabase
      .from("boards")
      .select("*")
      .eq("user_id", userId)
      .order("created_at", { ascending: false });

    if (error) {
      console.error("❌ Supabase error getting boards:", error);
      console.error("   Error code:", error.code);
      console.error("   Error message:", error.message);
      console.error("   Error details:", error.details);
      console.error("   Error hint:", error.hint);
      
      if (error.code === "PGRST301" || error.message?.includes("JWT") || error.code === "42501") {
        console.error("💡 QUICK FIX: Disable RLS in Supabase → SQL Editor → Run:");
        console.error("   ALTER TABLE public.boards DISABLE ROW LEVEL SECURITY;");
        console.error("   ALTER TABLE public.columns DISABLE ROW LEVEL SECURITY;");
        console.error("   ALTER TABLE public.tasks DISABLE ROW LEVEL SECURITY;");
        console.error("   See FINAL_FIX.md for detailed instructions");
        
        throw new Error(
          "Authentication error: RLS blocking access. See FINAL_FIX.md for quick fix (disable RLS temporarily)."
        );
      }
      throw error;
    }

    console.log("✅ Successfully fetched boards:", data?.length || 0, "boards");
    return data || [];
  },

  async createBoard(
    supabase: SupabaseClient,
    board: Omit<Board, "id" | "created_at" | "updated_at">
  ): Promise<Board> {
    const { data, error } = await supabase
      .from("boards")
      .insert(board)
      .select()
      .single();

    if (error) {
      console.error("Supabase error creating board:", error);
      // Provide more helpful error messages
      if (error.code === "PGRST301" || error.message?.includes("JWT") || error.code === "42501") {
        throw new Error(
          "Authentication error: Please configure Clerk + Supabase integration. See CLERK_SUPABASE_SETUP.md"
        );
      }
      if (error.code === "23505") {
        throw new Error("A board with this title already exists.");
      }
      throw error;
    }

    return data;
  },

  async updateBoard(
    supabase: SupabaseClient,
    boardId: string,
    updates: Partial<Board>
  ): Promise<Board> {
    const { data, error } = await supabase
      .from("boards")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", boardId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteBoard(
    supabase: SupabaseClient,
    boardId: string
  ): Promise<void> {
    const { error } = await supabase
      .from("boards")
      .delete()
      .eq("id", boardId);

    if (error) throw error;
  },
};

export const columnService = {
  async getColumns(
    supabase: SupabaseClient,
    boardId: string
  ): Promise<Column[]> {
    const { data, error } = await supabase
      .from("columns")
      .select("*")
      .eq("board_id", boardId)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    return data || [];
  },

  async createColumn(
    supabase: SupabaseClient,
    column: Omit<Column, "id" | "created_at">
  ): Promise<Column> {
    const { data, error } = await supabase
      .from("columns")
      .insert(column)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async updateColumnTitle(
    supabase: SupabaseClient,
    columnId: string,
    title: string
  ): Promise<Column> {
    const { data, error } = await supabase
      .from("columns")
      .update({ title })
      .eq("id", columnId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export const taskService = {
  async getTasksByBoard(
    supabase: SupabaseClient,
    boardId: string
  ): Promise<Task[]> {
    const { data, error } = await supabase
      .from("tasks")
      .select(
        `
        *,
        columns!inner(board_id)
        `
      )
      .eq("columns.board_id", boardId)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    return data || [];
  },

  async createTask(
    supabase: SupabaseClient,
    task: Omit<Task, "id" | "created_at" | "updated_at">
  ): Promise<Task> {
    const { data, error } = await supabase
      .from("tasks")
      .insert(task)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async moveTask(
    supabase: SupabaseClient,
    taskId: string,
    newColumnId: string,
    newOrder: number
  ) {
    const { data, error } = await supabase
      .from("tasks")
      .update({
        column_id: newColumnId,
        sort_order: newOrder,
      })
      .eq("id", taskId);

    if (error) throw error;
    return data;
  },

  async updateTask(
    supabase: SupabaseClient,
    taskId: string,
    updates: Partial<Task>
  ): Promise<Task> {
    const { data, error } = await supabase
      .from("tasks")
      .update(updates)
      .eq("id", taskId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTask(
    supabase: SupabaseClient,
    taskId: string
  ): Promise<void> {
    const { error } = await supabase
      .from("tasks")
      .delete()
      .eq("id", taskId);

    if (error) throw error;
  },
};

export const boardDataService = {
  async getBoardWithColumns(supabase: SupabaseClient, boardId: string) {
    const [board, columns] = await Promise.all([
      boardService.getBoard(supabase, boardId),
      columnService.getColumns(supabase, boardId),
    ]);

    if (!board) throw new Error("Board not found");

    const tasks = await taskService.getTasksByBoard(supabase, boardId);

    const columnsWithTasks = columns.map((column) => ({
      ...column,
      tasks: tasks.filter((task) => task.column_id === column.id),
    }));

    return {
      board,
      columnsWithTasks,
    };
  },

  async createBoardWithDefaultColumns(
    supabase: SupabaseClient,
    boardData: {
      title: string;
      description?: string;
      color?: string;
      userId: string;
    }
  ) {
    const board = await boardService.createBoard(supabase, {
      title: boardData.title,
      description: boardData.description || null,
      color: boardData.color || "bg-blue-500",
      user_id: boardData.userId,
    });

    const defaultColumns = [
      { title: "To Do", sort_order: 0 },
      { title: "In Progress", sort_order: 1 },
      { title: "Review", sort_order: 2 },
      { title: "Done", sort_order: 3 },
    ];

    await Promise.all(
      defaultColumns.map((column) =>
        columnService.createColumn(supabase, {
          ...column,
          board_id: board.id,
          user_id: boardData.userId,
        })
      )
    );

    return board;
  },
};

export const messageService = {
  async getMessages(supabase: SupabaseClient, boardId: string): Promise<Message[]> {
    const { data, error } = await supabase
      .from("messages")
      .select("*")
      .eq("board_id", boardId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return data || [];
  },

  async createMessage(
    supabase: SupabaseClient,
    message: Omit<Message, "id" | "created_at" | "updated_at" | "is_edited">
  ): Promise<Message> {
    const { data, error } = await supabase
      .from("messages")
      .insert(message)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async deleteMessage(supabase: SupabaseClient, messageId: string): Promise<void> {
    const { error } = await supabase
      .from("messages")
      .delete()
      .eq("id", messageId);

    if (error) throw error;
  },
};

export const tagService = {
  async getTags(supabase: SupabaseClient, boardId: string): Promise<Tag[]> {
    const { data, error } = await supabase
      .from("tags")
      .select("*")
      .eq("board_id", boardId)
      .order("name", { ascending: true });

    if (error) throw error;

    return data || [];
  },

  async createTag(
    supabase: SupabaseClient,
    tag: Omit<Tag, "id" | "created_at">
  ): Promise<Tag> {
    const { data, error } = await supabase
      .from("tags")
      .insert(tag)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async deleteTag(supabase: SupabaseClient, tagId: string): Promise<void> {
    const { error } = await supabase
      .from("tags")
      .delete()
      .eq("id", tagId);

    if (error) throw error;
  },

  async addTagToTask(
    supabase: SupabaseClient,
    taskId: string,
    tagId: string
  ): Promise<void> {
    const { error } = await supabase
      .from("task_tags")
      .insert({ task_id: taskId, tag_id: tagId });

    if (error) throw error;
  },

  async removeTagFromTask(
    supabase: SupabaseClient,
    taskId: string,
    tagId: string
  ): Promise<void> {
    const { error } = await supabase
      .from("task_tags")
      .delete()
      .eq("task_id", taskId)
      .eq("tag_id", tagId);

    if (error) throw error;
  },

  async getTaskTags(supabase: SupabaseClient, taskId: string): Promise<Tag[]> {
    const { data, error } = await supabase
      .from("task_tags")
      .select("tags(*)")
      .eq("task_id", taskId);

    if (error) throw error;

    return data?.map((item: { tags: Tag[] }) => item.tags[0]).filter(Boolean) || [];
  },
};

export const checklistService = {
  async getChecklists(supabase: SupabaseClient, taskId: string): Promise<Checklist[]> {
    const { data, error } = await supabase
      .from("checklists")
      .select("*")
      .eq("task_id", taskId)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    return data || [];
  },

  async createChecklist(
    supabase: SupabaseClient,
    checklist: Omit<Checklist, "id" | "created_at">
  ): Promise<Checklist> {
    const { data, error } = await supabase
      .from("checklists")
      .insert(checklist)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async deleteChecklist(supabase: SupabaseClient, checklistId: string): Promise<void> {
    const { error } = await supabase
      .from("checklists")
      .delete()
      .eq("id", checklistId);

    if (error) throw error;
  },

  async getChecklistItems(supabase: SupabaseClient, checklistId: string): Promise<ChecklistItem[]> {
    const { data, error } = await supabase
      .from("checklist_items")
      .select("*")
      .eq("checklist_id", checklistId)
      .order("sort_order", { ascending: true });

    if (error) throw error;

    return data || [];
  },

  async createChecklistItem(
    supabase: SupabaseClient,
    item: Omit<ChecklistItem, "id" | "created_at" | "updated_at">
  ): Promise<ChecklistItem> {
    const { data, error } = await supabase
      .from("checklist_items")
      .insert(item)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async updateChecklistItem(
    supabase: SupabaseClient,
    itemId: string,
    updates: Partial<ChecklistItem>
  ): Promise<ChecklistItem> {
    const { data, error } = await supabase
      .from("checklist_items")
      .update({ ...updates, updated_at: new Date().toISOString() })
      .eq("id", itemId)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async deleteChecklistItem(supabase: SupabaseClient, itemId: string): Promise<void> {
    const { error } = await supabase
      .from("checklist_items")
      .delete()
      .eq("id", itemId);

    if (error) throw error;
  },
};

export const commentService = {
  async getComments(supabase: SupabaseClient, taskId: string): Promise<Comment[]> {
    const { data, error } = await supabase
      .from("comments")
      .select("*")
      .eq("task_id", taskId)
      .order("created_at", { ascending: true });

    if (error) throw error;

    return data || [];
  },

  async createComment(
    supabase: SupabaseClient,
    comment: Omit<Comment, "id" | "created_at" | "updated_at" | "is_edited">
  ): Promise<Comment> {
    const { data, error } = await supabase
      .from("comments")
      .insert(comment)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async updateComment(
    supabase: SupabaseClient,
    commentId: string,
    content: string
  ): Promise<Comment> {
    const { data, error } = await supabase
      .from("comments")
      .update({ 
        content,
        updated_at: new Date().toISOString(),
        is_edited: true 
      })
      .eq("id", commentId)
      .select()
      .single();

    if (error) throw error;

    return data;
  },

  async deleteComment(supabase: SupabaseClient, commentId: string): Promise<void> {
    const { error } = await supabase
      .from("comments")
      .delete()
      .eq("id", commentId);

    if (error) throw error;
  },
};

export const activityService = {
  async getActivities(supabase: SupabaseClient, boardId: string, limit = 50): Promise<Activity[]> {
    const { data, error } = await supabase
      .from("activities")
      .select("*")
      .eq("board_id", boardId)
      .order("created_at", { ascending: false })
      .limit(limit);

    if (error) throw error;

    return data || [];
  },

  async createActivity(
    supabase: SupabaseClient,
    activity: Omit<Activity, "id" | "created_at">
  ): Promise<Activity> {
    const { data, error } = await supabase
      .from("activities")
      .insert(activity)
      .select()
      .single();

    if (error) throw error;

    return data;
  },
};

export const timeEntryService = {
  async getTimeEntries(supabase: SupabaseClient, taskId: string): Promise<TimeEntry[]> {
    const { data, error } = await supabase
      .from("time_entries")
      .select("*")
      .eq("task_id", taskId)
      .order("start_time", { ascending: false });

    if (error) throw error;
    return data || [];
  },

  async getActiveTimer(supabase: SupabaseClient, userId: string): Promise<TimeEntry | null> {
    const { data, error } = await supabase
      .from("time_entries")
      .select("*")
      .eq("user_id", userId)
      .is("end_time", null)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  async startTimer(
    supabase: SupabaseClient,
    entry: Omit<TimeEntry, "id" | "created_at" | "updated_at" | "end_time" | "duration">
  ): Promise<TimeEntry> {
    const { data, error } = await supabase
      .from("time_entries")
      .insert(entry)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async stopTimer(supabase: SupabaseClient, entryId: string): Promise<TimeEntry> {
    const startEntry = await supabase
      .from("time_entries")
      .select("*")
      .eq("id", entryId)
      .single()
      .then(({ data }) => data);

    if (!startEntry) throw new Error("Time entry not found");

    const endTime = new Date().toISOString();
    const startTime = new Date(startEntry.start_time);
    const duration = Math.floor((new Date(endTime).getTime() - startTime.getTime()) / 1000);

    const { data, error } = await supabase
      .from("time_entries")
      .update({ end_time: endTime, duration })
      .eq("id", entryId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTimeEntry(supabase: SupabaseClient, entryId: string): Promise<void> {
    const { error } = await supabase
      .from("time_entries")
      .delete()
      .eq("id", entryId);

    if (error) throw error;
  },

  async getTotalTimeByTask(supabase: SupabaseClient, taskId: string): Promise<number> {
    const { data, error } = await supabase
      .from("time_entries")
      .select("duration")
      .eq("task_id", taskId)
      .not("duration", "is", null);

    if (error) throw error;

    return data?.reduce((sum, entry) => sum + (entry.duration || 0), 0) || 0;
  },
};

export const customFieldService = {
  async getCustomFields(supabase: SupabaseClient, boardId: string): Promise<CustomField[]> {
    const { data, error } = await supabase
      .from("custom_fields")
      .select("*")
      .eq("board_id", boardId)
      .order("created_at", { ascending: true });

    if (error) throw error;
    return data || [];
  },

  async createCustomField(
    supabase: SupabaseClient,
    field: Omit<CustomField, "id" | "created_at">
  ): Promise<CustomField> {
    const { data, error } = await supabase
      .from("custom_fields")
      .insert(field)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteCustomField(supabase: SupabaseClient, fieldId: string): Promise<void> {
    const { error } = await supabase
      .from("custom_fields")
      .delete()
      .eq("id", fieldId);

    if (error) throw error;
  },

  async getTaskFieldValues(supabase: SupabaseClient, taskId: string): Promise<TaskCustomFieldValue[]> {
    const { data, error } = await supabase
      .from("task_custom_field_values")
      .select("*")
      .eq("task_id", taskId);

    if (error) throw error;
    return data || [];
  },

  async setTaskFieldValue(
    supabase: SupabaseClient,
    taskId: string,
    fieldId: string,
    value: string
  ): Promise<TaskCustomFieldValue> {
    const { data, error } = await supabase
      .from("task_custom_field_values")
      .upsert({ task_id: taskId, custom_field_id: fieldId, value })
      .select()
      .single();

    if (error) throw error;
    return data;
  },
};

export const milestoneService = {
  async getMilestones(supabase: SupabaseClient, boardId: string): Promise<Milestone[]> {
    const { data, error } = await supabase
      .from("milestones")
      .select("*")
      .eq("board_id", boardId)
      .order("due_date", { ascending: true, nullsFirst: false });

    if (error) throw error;
    return data || [];
  },

  async createMilestone(
    supabase: SupabaseClient,
    milestone: Omit<Milestone, "id" | "created_at">
  ): Promise<Milestone> {
    const { data, error } = await supabase
      .from("milestones")
      .insert(milestone)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateMilestone(
    supabase: SupabaseClient,
    milestoneId: string,
    updates: Partial<Milestone>
  ): Promise<Milestone> {
    const { data, error } = await supabase
      .from("milestones")
      .update(updates)
      .eq("id", milestoneId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteMilestone(supabase: SupabaseClient, milestoneId: string): Promise<void> {
    const { error } = await supabase
      .from("milestones")
      .delete()
      .eq("id", milestoneId);

    if (error) throw error;
  },

  async toggleMilestone(supabase: SupabaseClient, milestoneId: string, isCompleted: boolean): Promise<Milestone> {
    return this.updateMilestone(supabase, milestoneId, { is_completed: isCompleted });
  },
};

export const taskRelationService = {
  async getTaskRelations(supabase: SupabaseClient, taskId: string): Promise<TaskRelation[]> {
    const { data, error } = await supabase
      .from("task_relations")
      .select("*")
      .or(`task_id.eq.${taskId},related_task_id.eq.${taskId}`);

    if (error) throw error;
    return data || [];
  },

  async createTaskRelation(
    supabase: SupabaseClient,
    relation: Omit<TaskRelation, "id" | "created_at">
  ): Promise<TaskRelation> {
    const { data, error } = await supabase
      .from("task_relations")
      .insert(relation)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteTaskRelation(supabase: SupabaseClient, relationId: string): Promise<void> {
    const { error } = await supabase
      .from("task_relations")
      .delete()
      .eq("id", relationId);

    if (error) throw error;
  },
};

export const recurringTaskService = {
  async getRecurringTask(supabase: SupabaseClient, taskId: string): Promise<RecurringTask | null> {
    const { data, error } = await supabase
      .from("recurring_tasks")
      .select("*")
      .eq("task_id", taskId)
      .single();

    if (error && error.code !== "PGRST116") throw error;
    return data;
  },

  async createRecurringTask(
    supabase: SupabaseClient,
    recurring: Omit<RecurringTask, "id" | "created_at">
  ): Promise<RecurringTask> {
    const { data, error } = await supabase
      .from("recurring_tasks")
      .insert(recurring)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async updateRecurringTask(
    supabase: SupabaseClient,
    recurringId: string,
    updates: Partial<RecurringTask>
  ): Promise<RecurringTask> {
    const { data, error } = await supabase
      .from("recurring_tasks")
      .update(updates)
      .eq("id", recurringId)
      .select()
      .single();

    if (error) throw error;
    return data;
  },

  async deleteRecurringTask(supabase: SupabaseClient, recurringId: string): Promise<void> {
    const { error } = await supabase
      .from("recurring_tasks")
      .delete()
      .eq("id", recurringId);

    if (error) throw error;
  },
};

export { type Board, type Column, type Task, type ColumnWithTasks, type Message, type Tag, type Checklist, type ChecklistItem, type Comment, type Activity, type TimeEntry, type CustomField, type TaskCustomFieldValue, type RecurringTask, type TaskRelation, type Milestone };
