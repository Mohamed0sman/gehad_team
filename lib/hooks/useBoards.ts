"use client";

import { useUser } from "@clerk/nextjs";
import {
  boardDataService,
  boardService,
  columnService,
  taskService,
} from "../services";
import { useEffect, useState, useCallback } from "react";
import { Board, ColumnWithTasks, Task } from "../supabase/models";
import { useSupabase } from "../supabase/SupabaseProvider";

export function useBoards() {
  const { user } = useUser();
  const { supabase } = useSupabase();
  const [boards, setBoards] = useState<Board[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBoards = useCallback(async () => {
    if (!user || !supabase) {
      setError("Please complete Clerk + Supabase setup. See CLERK_SUPABASE_SETUP.md");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await boardService.getBoards(supabase, user.id);
      setBoards(data);
    } catch (err) {
      console.error("Error loading boards:", err);
      setError(err instanceof Error ? err.message : "Failed to load boards.");
    } finally {
      setLoading(false);
    }
  }, [user, supabase]);

  useEffect(() => {
    if (user && supabase) {
      loadBoards();
    }
  }, [user, supabase, loadBoards]);

  async function createBoard(boardData: {
    title: string;
    description?: string;
    color?: string;
  }) {
    if (!user) {
      setError("User not authenticated");
      throw new Error("User not authenticated");
    }

    if (!supabase) {
      setError("Database connection not ready. Please wait...");
      throw new Error("Database connection not ready");
    }

    try {
      setError(null);
      const newBoard = await boardDataService.createBoardWithDefaultColumns(
        supabase,
        {
          ...boardData,
          userId: user.id,
        }
      );
      setBoards((prev) => [newBoard, ...prev]);
      return newBoard;
    } catch (err) {
      console.error("Error creating board:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to create board.";
      setError(errorMessage);
      throw err;
    }
  }

  async function deleteBoard(boardId: string) {
    if (!user) {
      setError("User not authenticated");
      throw new Error("User not authenticated");
    }

    if (!supabase) {
      setError("Database connection not ready");
      throw new Error("Database connection not ready");
    }

    try {
      setError(null);
      await boardService.deleteBoard(supabase, boardId);
      setBoards((prev) => prev.filter((board) => board.id !== boardId));
    } catch (err) {
      console.error("Error deleting board:", err);
      const errorMessage = err instanceof Error ? err.message : "Failed to delete board.";
      setError(errorMessage);
      throw err;
    }
  }

  return { boards, loading, error, createBoard, deleteBoard };
}

export function useBoard(boardId: string) {
  const { supabase } = useSupabase();
  const { user } = useUser();

  const [board, setBoard] = useState<Board | null>(null);
  const [columns, setColumns] = useState<ColumnWithTasks[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const loadBoard = useCallback(async () => {
    if (!boardId) return;

    if (!supabase) {
      setError("Database connection not ready");
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      setError(null);
      const data = await boardDataService.getBoardWithColumns(
        supabase,
        boardId
      );
      setBoard(data.board);
      setColumns(data.columnsWithTasks);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to load boards.");
    } finally {
      setLoading(false);
    }
  }, [boardId, supabase]);

  useEffect(() => {
    if (boardId) {
      loadBoard();
    }
  }, [boardId, supabase, loadBoard]);

  async function updateBoard(boardId: string, updates: Partial<Board>) {
    if (!supabase) {
      setError("Database connection not ready");
      throw new Error("Database connection not ready");
    }

    try {
      const updatedBoard = await boardService.updateBoard(
        supabase,
        boardId,
        updates
      );
      setBoard(updatedBoard);
      return updatedBoard;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to update the board."
      );
    }
  }

  async function createRealTask(
    columnId: string,
    taskData: {
      title: string;
      description?: string;
      assignee?: string;
      dueDate?: string;
      priority?: "low" | "medium" | "high";
    }
  ) {
    if (!supabase) {
      setError("Database connection not ready");
      throw new Error("Database connection not ready");
    }

    try {
      const newTask = await taskService.createTask(supabase, {
        title: taskData.title,
        description: taskData.description || null,
        assignee: taskData.assignee || null,
        due_date: taskData.dueDate || null,
        column_id: columnId,
        sort_order:
          columns.find((col) => col.id === columnId)?.tasks.length || 0,
        priority: taskData.priority || "medium",
      });

      setColumns((prev) =>
        prev.map((col) =>
          col.id === columnId ? { ...col, tasks: [...col.tasks, newTask] } : col
        )
      );

      return newTask;
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "Failed to create the task."
      );
    }
  }

  async function moveTask(
    taskId: string,
    newColumnId: string,
    newOrder: number
  ) {
    if (!supabase) {
      setError("Database connection not ready");
      throw new Error("Database connection not ready");
    }

    try {
      await taskService.moveTask(supabase, taskId, newColumnId, newOrder);

      setColumns((prev) => {
        const newColumns = [...prev];

        // Find and remove task from the old column
        let taskToMove: Task | null = null;
        for (const col of newColumns) {
          const taskIndex = col.tasks.findIndex((task) => task.id === taskId);
          if (taskIndex !== -1) {
            taskToMove = col.tasks[taskIndex];
            col.tasks.splice(taskIndex, 1);
            break;
          }
        }

        if (taskToMove) {
          // Add task to new column
          const targetColumn = newColumns.find((col) => col.id === newColumnId);
          if (targetColumn) {
            targetColumn.tasks.splice(newOrder, 0, taskToMove);
          }
        }

        return newColumns;
      });
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to move task.");
    }
  }

  async function createColumn(title: string) {
    if (!board || !user) throw new Error("Board not loaded");
    if (!supabase) throw new Error("Database connection not ready");

    try {
      const newColumn = await columnService.createColumn(supabase, {
        title,
        board_id: board.id,
        sort_order: columns.length,
        user_id: user.id,
      });

      setColumns((prev) => [...prev, { ...newColumn, tasks: [] }]);
      return newColumn;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create column.");
    }
  }

  async function updateColumn(columnId: string, title: string) {
    if (!supabase) {
      setError("Database connection not ready");
      throw new Error("Database connection not ready");
    }

    try {
      const updatedColumn = await columnService.updateColumnTitle(
        supabase,
        columnId,
        title
      );

      setColumns((prev) =>
        prev.map((col) =>
          col.id === columnId ? { ...col, ...updatedColumn } : col
        )
      );

      return updatedColumn;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to create column.");
    }
  }

  async function updateTask(taskId: string, updates: Partial<Task>) {
    if (!supabase) {
      setError("Database connection not ready");
      throw new Error("Database connection not ready");
    }

    try {
      const updatedTask = await taskService.updateTask(supabase, taskId, updates);

      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          tasks: col.tasks.map((task) =>
            task.id === taskId ? { ...task, ...updatedTask } : task
          ),
        }))
      );

      return updatedTask;
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to update task.");
    }
  }

  async function deleteTask(taskId: string) {
    if (!supabase) {
      setError("Database connection not ready");
      throw new Error("Database connection not ready");
    }

    try {
      await taskService.deleteTask(supabase, taskId);

      setColumns((prev) =>
        prev.map((col) => ({
          ...col,
          tasks: col.tasks.filter((task) => task.id !== taskId),
        }))
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to delete task.");
    }
  }

  return {
    board,
    columns,
    loading,
    error,
    updateBoard,
    createRealTask,
    setColumns,
    moveTask,
    createColumn,
    updateColumn,
    updateTask,
    deleteTask,
  };
}
