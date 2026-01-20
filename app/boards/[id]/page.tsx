"use client";

import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useBoard } from "@/lib/hooks/useBoards";
import { ColumnWithTasks, Task } from "@/lib/supabase/models";
import { DialogTrigger } from "@radix-ui/react-dialog";
import { Calendar, MoreHorizontal, Pencil, Plus, Trash2, User, MessageSquare, X, Clock, Layout, List, CalendarDays } from "lucide-react";
import { useParams } from "next/navigation";
import { useState } from "react";
import {
  DndContext,
  DragEndEvent,
  DragOverEvent,
  DragOverlay,
  DragStartEvent,
  PointerSensor,
  rectIntersection,
  useDroppable,
  useSensor,
  useSensors,
} from "@dnd-kit/core";
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
} from "@dnd-kit/sortable";
import { CSS } from "@dnd-kit/utilities";
import ChatPanel from "@/components/ChatPanel";
import { motion, AnimatePresence } from "framer-motion";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import TaskComments from "@/components/TaskComments";
import TaskChecklists from "@/components/TaskChecklists";
import FileUpload from "@/components/FileUpload";
import CalendarView from "@/components/CalendarView";
import GanttView from "@/components/GanttView";
import ActivityPanel from "@/components/ActivityPanel";
import TimeTracker from "@/components/TimeTracker";

function DroppableColumn({
  column,
  children,
  onCreateTask,
  onEditColumn,
}: {
  column: ColumnWithTasks;
  children: React.ReactNode;
  onCreateTask: (e: React.FormEvent<HTMLFormElement>) => Promise<void>;
  onEditColumn: (column: ColumnWithTasks) => void;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: column.id });
  return (
    <motion.div
      ref={setNodeRef}
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className={`w-full lg:flex-shrink-0 lg:w-80 ${isOver ? "bg-violet-500/20 rounded-lg" : ""}`}
    >
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white/5 backdrop-blur-xl border border-white/10 rounded-2xl ${
          isOver ? "ring-2 ring-violet-500/50" : ""
        }`}
      >
        <div className="p-4 border-b border-white/10">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2 min-w-0">
              <div className="w-3 h-3 rounded-full bg-gradient-to-r from-violet-500 to-fuchsia-500" />
              <h3 className="font-semibold text-white text-sm sm:text-base truncate">
                {column.title}
              </h3>
              <Badge variant="secondary" className="text-xs flex-shrink-0 bg-violet-500/20 text-violet-300 border-0 rounded-lg">
                {column.tasks.length}
              </Badge>
            </div>
            <Button
              variant="ghost"
              size="sm"
              className="flex-shrink-0 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg"
              onClick={() => onEditColumn(column)}
            >
              <MoreHorizontal />
            </Button>
          </div>
        </div>

        <div className="p-2">
          {children}
          <Dialog>
            <DialogTrigger asChild>
              <motion.div
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
              >
                <Button
                  variant="ghost"
                  className="w-full mt-3 text-slate-400 hover:text-white hover:bg-slate-700/50"
                >
                  <Plus />
                  Add Task
                </Button>
              </motion.div>
            </DialogTrigger>
            <DialogContent className="w-[95vw] max-w-[425px] mx-auto bg-slate-800 border-slate-700">
              <DialogHeader>
                <DialogTitle className="text-white">Create New Task</DialogTitle>
                <p className="text-sm text-slate-400">Add a task to the board</p>
              </DialogHeader>

              <form className="space-y-4" onSubmit={onCreateTask}>
                <div className="space-y-2">
                  <Label className="text-slate-300">Title *</Label>
                  <Input
                    id="title"
                    name="title"
                    placeholder="Enter task title"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Description</Label>
                  <Textarea
                    id="description"
                    name="description"
                    placeholder="Enter task description"
                    rows={3}
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-slate-300">Assignee</Label>
                  <Input
                    id="assignee"
                    name="assignee"
                    placeholder="Who should do this?"
                    className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                  />
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Priority</Label>
                  <Select name="priority" defaultValue="medium">
                    <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-slate-800 border-slate-700">
                      {["low", "medium", "high"].map((priority, key) => (
                        <SelectItem key={key} value={priority}>
                          {priority.charAt(0).toUpperCase() + priority.slice(1)}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label className="text-slate-300">Due Date</Label>
                  <Input type="date" id="dueDate" name="dueDate" className="bg-slate-700/50 border-slate-600 text-white" />
                </div>

                <div className="flex justify-end space-x-2 pt-4">
                  <Button type="submit" className="bg-purple-600 hover:bg-purple-700">Create Task</Button>
                </div>
              </form>
            </DialogContent>
          </Dialog>
        </div>
      </motion.div>
    </motion.div>
  );
}

function SortableTask({ 
  task, 
  onEdit, 
  onDelete 
}: { 
  task: Task; 
  onEdit: (task: Task) => void;
  onDelete: (taskId: string) => void;
}) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });

  const styles = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  function getPriorityColor(priority: "low" | "medium" | "high"): string {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-yellow-500";
    }
  }
  return (
    <motion.div
      ref={setNodeRef}
      style={styles}
      {...listeners}
      {...attributes}
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      <Card className="cursor-pointer hover:shadow-xl transition-all duration-300 bg-white/5 border-white/10 backdrop-blur-sm group relative rounded-xl overflow-hidden">
        <div className="absolute top-0 left-0 w-1 h-full bg-gradient-to-b from-violet-500 to-fuchsia-500" />
        <CardContent className="p-4">
          <div className="space-y-3">
            <div className="flex items-start justify-between">
              <h4 className="font-medium text-white text-sm leading-tight flex-1 min-w-0 pr-2">
                {task.title}
              </h4>
            </div>

            <p className="text-xs text-slate-400 line-clamp-2">
              {task.description || "No description."}
            </p>

            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 min-w-0">
                {task.assignee && (
                  <div className="flex items-center space-x-1 text-xs text-slate-400">
                    <User className="h-3 w-3" />
                    <span className="truncate">{task.assignee}</span>
                  </div>
                )}
                {task.due_date && (
                  <div className="flex items-center space-x-1 text-xs text-slate-400">
                    <Calendar className="h-3 w-3" />
                    <span className="truncate">{task.due_date}</span>
                  </div>
                )}
              </div>
              <motion.div
                className={`w-2.5 h-2.5 rounded-full flex-shrink-0 ${getPriorityColor(
                  task.priority
                )}`}
                whileHover={{ scale: 1.5 }}
              />
            </div>
          </div>
        </CardContent>
        <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-all duration-200 flex gap-1">
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onEdit(task);
            }}
            className="p-1.5 hover:bg-white/10 rounded-lg bg-white/5"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Pencil className="h-3.5 w-3.5 text-slate-400 hover:text-violet-400" />
          </motion.button>
          <motion.button
            onClick={(e) => {
              e.stopPropagation();
              onDelete(task.id);
            }}
            className="p-1.5 hover:bg-red-500/10 rounded-lg bg-white/5"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Trash2 className="h-3.5 w-3.5 text-slate-400 hover:text-red-400" />
          </motion.button>
        </div>
      </Card>
    </motion.div>
  );
}

function TaskOverlay({ task }: { task: Task }) {
  function getPriorityColor(priority: "low" | "medium" | "high"): string {
    switch (priority) {
      case "high":
        return "bg-red-500";
      case "medium":
        return "bg-yellow-500";
      case "low":
        return "bg-green-500";
      default:
        return "bg-yellow-500";
    }
  }
  return (
    <Card className="cursor-grabbing shadow-xl bg-slate-700 border-slate-600">
      <CardContent className="p-3 sm:p-4">
        <div className="space-y-2 sm:space-y-3">
          <div className="flex items-start justify-between">
            <h4 className="font-medium text-white text-sm leading-tight flex-1 min-w-0 pr-2">
              {task.title}
            </h4>
          </div>

          <p className="text-xs text-slate-400 line-clamp-2">
            {task.description || "No description."}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-1 sm:space-x-2 min-w-0">
              {task.assignee && (
                <div className="flex items-center space-x-1 text-xs text-slate-400">
                  <User className="h-3 w-3" />
                  <span className="truncate">{task.assignee}</span>
                </div>
              )}
              {task.due_date && (
                <div className="flex items-center space-x-1 text-xs text-slate-400">
                  <Calendar className="h-3 w-3" />
                  <span className="truncate">{task.due_date}</span>
                </div>
              )}
            </div>
            <motion.div
              className={`w-2 h-2 rounded-full flex-shrink-0 ${getPriorityColor(
                task.priority
              )}`}
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ repeat: Infinity, duration: 2 }}
            />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export default function BoardPage() {
  const { id } = useParams<{ id: string }>();
  const {
    board,
    createColumn,
    updateBoard,
    columns,
    createRealTask,
    setColumns,
    moveTask,
    updateColumn,
    updateTask,
    deleteTask,
  } = useBoard(id);

  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newColor, setNewColor] = useState("");

  const [isFilterOpen, setIsFilterOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isActivityOpen, setIsActivityOpen] = useState(false);
  const [isCreatingColumn, setIsCreatingColumn] = useState(false);
  const [isEditingColumn, setIsEditingColumn] = useState(false);
  const [isEditingTask, setIsEditingTask] = useState(false);
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [newColumnTitle, setNewColumnTitle] = useState("");
  const [editingColumnTitle, setEditingColumnTitle] = useState("");
  const [editingColumn, setEditingColumn] = useState<ColumnWithTasks | null>(null);
  const [taskAttachments, setTaskAttachments] = useState<Array<{id: string; name: string; url: string; type: string; size: number}>>([]);
  const [viewMode, setViewMode] = useState<"board" | "calendar" | "gantt">("board");


  const [filters, setFilters] = useState({
    priority: [] as string[],
    assignee: [] as string[],
    dueDate: null as string | null,
  });

  const [activeTask, setActiveTask] = useState<Task | null>(null);

  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );

  function handleFilterChange(
    type: "priority" | "assignee" | "dueDate",
    value: string | string[] | null
  ) {
    setFilters((prev) => ({
      ...prev,
      [type]: value,
    }));
  }

  function clearFilters() {
    setFilters({
      priority: [] as string[],
      assignee: [] as string[],
      dueDate: null as string | null,
    });
  }

  async function handleUpdateBoard(e: React.FormEvent) {
    e.preventDefault();

    if (!newTitle.trim() || !board) return;

    try {
      await updateBoard(board.id, {
        title: newTitle.trim(),
        color: newColor || board.color,
      });
      setIsEditingTitle(false);
    } catch {}
  }

  async function handleCreateTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const taskData = {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || undefined,
      assignee: (formData.get("assignee") as string) || undefined,
      dueDate: (formData.get("dueDate") as string) || undefined,
      priority:
        (formData.get("priority") as "low" | "medium" | "high") || "medium",
    };

    if (taskData.title.trim()) {
      await createRealTask(columns[0]?.id || "", taskData);

      const trigger = document.querySelector(
        '[data-state="open"]'
      ) as HTMLElement;
      if (trigger) trigger.click();
    }
  }

  function handleDragStart(event: DragStartEvent) {
    const taskId = event.active.id as string;
    const task = columns
      .flatMap((col) => col.tasks)
      .find((task) => task.id === taskId);

    if (task) {
      setActiveTask(task);
    }
  }

  function handleDragOver(event: DragOverEvent) {
    const { active, over } = event;
    if (!over) return;

    const activeId = active.id as string;
    const overId = over.id as string;

    const sourceColumn = columns.find((col) =>
      col.tasks.some((task) => task.id === activeId)
    );

    const targetColumn = columns.find((col) =>
      col.tasks.some((task) => task.id === overId)
    );

    if (!sourceColumn || !targetColumn) return;

    if (sourceColumn.id === targetColumn.id) {
      const activeIndex = sourceColumn.tasks.findIndex(
        (task) => task.id === activeId
      );

      const overIndex = targetColumn.tasks.findIndex(
        (task) => task.id === overId
      );

      if (activeIndex !== overIndex) {
        setColumns((prev: ColumnWithTasks[]) => {
          const newColumns = [...prev];
          const column = newColumns.find((col) => col.id === sourceColumn.id);
          if (column) {
            const tasks = [...column.tasks];
            const [removed] = tasks.splice(activeIndex, 1);
            tasks.splice(overIndex, 0, removed);
            column.tasks = tasks;
          }
          return newColumns;
        });
      }
    }
  }

  async function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over) return;

    const taskId = active.id as string;
    const overId = over.id as string;

    const targetColumn = columns.find((col) => col.id === overId);
    if (targetColumn) {
      const sourceColumn = columns.find((col) =>
        col.tasks.some((task) => task.id === taskId)
      );

      if (sourceColumn && sourceColumn.id !== targetColumn.id) {
        await moveTask(taskId, targetColumn.id, targetColumn.tasks.length);
      }
    } else {
      // Check to see if were dropping on another task
      const sourceColumn = columns.find((col) =>
        col.tasks.some((task) => task.id === taskId)
      );

      const targetColumn = columns.find((col) =>
        col.tasks.some((task) => task.id === overId)
      );

      if (sourceColumn && targetColumn) {
        const oldIndex = sourceColumn.tasks.findIndex(
          (task) => task.id === taskId
        );

        const newIndex = targetColumn.tasks.findIndex(
          (task) => task.id === overId
        );

        if (oldIndex !== newIndex) {
          await moveTask(taskId, targetColumn.id, newIndex);
        }
      }
    }
  }

  async function handleCreateColumn(e: React.FormEvent) {
    e.preventDefault();

    if (!newColumnTitle.trim()) return;

    await createColumn(newColumnTitle.trim());

    setNewColumnTitle("");
    setIsCreatingColumn(false);
  }

  async function handleUpdateColumn(e: React.FormEvent) {
    e.preventDefault();

    if (!editingColumnTitle.trim() || !editingColumn) return;

    await updateColumn(editingColumn.id, editingColumnTitle.trim());

    setEditingColumnTitle("");
    setIsEditingColumn(false);
    setEditingColumn(null);
  }

  function handleEditColumn(column: ColumnWithTasks) {
    setIsEditingColumn(true);
    setEditingColumn(column);
    setEditingColumnTitle(column.title);
  }

  function handleEditTask(task: Task) {
    setSelectedTask(task);
    setIsEditingTask(true);
  }

  async function handleUpdateTask(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);
    const taskData = {
      title: formData.get("title") as string,
      description: (formData.get("description") as string) || undefined,
      assignee: (formData.get("assignee") as string) || undefined,
      dueDate: (formData.get("dueDate") as string) || undefined,
      priority: (formData.get("priority") as "low" | "medium" | "high") || "medium",
    };

    if (!selectedTask || !taskData.title.trim()) return;

    try {
      await updateTask(selectedTask.id, taskData);
      setIsEditingTask(false);
      setSelectedTask(null);
    } catch (err) {
      console.error("Error updating task:", err);
    }
  }

  async function handleDeleteTask(taskId: string) {
    if (confirm("Are you sure you want to delete this task?")) {
      try {
        await deleteTask(taskId);
      } catch (err) {
        console.error("Error deleting task:", err);
      }
    }
  }

  const filteredColumns = columns.map((column) => ({
    ...column,
    tasks: column.tasks.filter((task) => {
      // Filter by priority
      if (
        filters.priority.length > 0 &&
        !filters.priority.includes(task.priority)
      ) {
        return false;
      }

      // Filter by due date

      if (filters.dueDate && task.due_date) {
        const taskDate = new Date(task.due_date).toDateString();
        const filterDate = new Date(filters.dueDate).toDateString();

        if (taskDate !== filterDate) {
          return false;
        }
      }

      return true;
    }),
  }));

  return (
    <>
      <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
        {/* Background gradient */}
        <div className="fixed inset-0 bg-gradient-to-br from-violet-950/20 via-[#0a0a0f] to-fuchsia-950/20 pointer-events-none" />
        <Navbar
          boardTitle={board?.title}
          onEditBoard={() => {
            setNewTitle(board?.title ?? "");
            setNewColor(board?.color ?? "");
            setIsEditingTitle(true);
          }}
          onFilterClick={() => setIsFilterOpen(true)}
          filterCount={Object.values(filters).reduce(
            (count, v) =>
              count + (Array.isArray(v) ? v.length : v !== null ? 1 : 0),
            0
          )}
        />

        <Dialog open={isEditingTitle} onOpenChange={setIsEditingTitle}>
          <DialogContent className="w-[95vw] max-w-[425px] mx-auto bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Edit Board</DialogTitle>
            </DialogHeader>
            <form className="space-y-4" onSubmit={handleUpdateBoard}>
              <div className="space-y-2">
                <Label htmlFor="boardTitle" className="text-slate-300">Board Title</Label>
                <Input
                  id="boardTitle"
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="Enter board title..."
                  required
                  className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Board Color</Label>
                <div className="grid grid-cols-4 sm:grid-cols-6 gap-2">
                  {[
                    "bg-blue-500",
                    "bg-green-500",
                    "bg-yellow-500",
                    "bg-red-500",
                    "bg-purple-500",
                    "bg-pink-500",
                    "bg-indigo-500",
                    "bg-gray-500",
                    "bg-orange-500",
                    "bg-teal-500",
                    "bg-cyan-500",
                    "bg-emerald-500",
                  ].map((color, key) => (
                    <button
                      key={key}
                      type="button"
                      className={`w-8 h-8 rounded-full ${color} ${
                        color === newColor
                          ? "ring-2 ring-offset-2 ring-white"
                          : ""
                      } `}
                      onClick={() => setNewColor(color)}
                    />
                  ))}
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setIsEditingTitle(false)}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </Button>
                <Button type="submit" className="bg-purple-600 hover:bg-purple-700">Save Changes</Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        <Dialog open={isFilterOpen} onOpenChange={setIsFilterOpen}>
          <DialogContent className="w-[95vw] max-w-[425px] mx-auto bg-slate-800 border-slate-700">
            <DialogHeader>
              <DialogTitle className="text-white">Filter Tasks</DialogTitle>
              <p className="text-sm text-slate-400">
                Filter tasks by priority, assignee, or due date
              </p>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-slate-300">Priority</Label>
                <div className="flex flex-wrap gap-2">
                  {["low", "medium", "high"].map((priority, key) => (
                    <Button
                      onClick={() => {
                        const newPriorities = filters.priority.includes(
                          priority
                        )
                          ? filters.priority.filter((p) => p !== priority)
                          : [...filters.priority, priority];

                        handleFilterChange("priority", newPriorities);
                      }}
                      key={key}
                      variant={
                        filters.priority.includes(priority)
                          ? "default"
                          : "outline"
                      }
                      size="sm"
                      className={filters.priority.includes(priority) ? "bg-purple-600" : "border-slate-600 text-slate-300"}
                    >
                      {priority.charAt(0).toUpperCase() + priority.slice(1)}
                    </Button>
                  ))}
                </div>
              </div>

              <div className="space-y-2">
                <Label className="text-slate-300">Due Date</Label>
                <Input
                  type="date"
                  value={filters.dueDate || ""}
                  onChange={(e) =>
                    handleFilterChange("dueDate", e.target.value || null)
                  }
                  className="bg-slate-700/50 border-slate-600 text-white"
                />
              </div>

              <div className="flex justify-between pt-4">
                <Button
                  type="button"
                  variant={"outline"}
                  onClick={clearFilters}
                  className="border-slate-600 text-slate-300 hover:bg-slate-700"
                >
                  Clear Filters
                </Button>
                <Button type="button" onClick={() => setIsFilterOpen(false)} className="bg-purple-600 hover:bg-purple-700">
                  Apply Filters
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>

        <motion.main 
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="container mx-auto px-2 sm:px-4 py-4 sm:py-6 relative z-10"
        >
          <motion.div 
            initial={{ y: -20, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 space-y-4 sm:space-y-0"
          >
            <div className="flex flex-wrap items-center gap-4 sm:gap-6">
              <motion.div 
                className="text-sm text-slate-300"
                whileHover={{ scale: 1.05 }}
              >
                <span className="font-medium text-white">Total Tasks: </span>
                {columns.reduce((sum, col) => sum + col.tasks.length, 0)}
              </motion.div>
            </div>

            <div className="flex gap-2 flex-wrap">
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => setIsActivityOpen(!isActivityOpen)}
                  variant="outline"
                  className="border-white/20 text-slate-300 hover:bg-white/10 hover:text-white rounded-xl"
                >
                  <Clock className="mr-2 h-4 w-4" />
                  Activity
                </Button>
              </motion.div>
              <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                <Button
                  onClick={() => setIsChatOpen(!isChatOpen)}
                  variant="outline"
                  className="border-white/20 text-slate-300 hover:bg-white/10 hover:text-white rounded-xl"
                >
                  <MessageSquare className="mr-2 h-4 w-4" />
                  Chat
                </Button>
              </motion.div>
              
              <div className="flex items-center gap-1 bg-white/5 border border-white/10 rounded-xl p-1">
                <Button
                  variant={viewMode === "board" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("board")}
                  className={viewMode === "board" ? "bg-violet-600/90 text-white" : "text-slate-400 hover:text-white rounded-lg"}
                >
                  <Layout className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "calendar" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("calendar")}
                  className={viewMode === "calendar" ? "bg-violet-600/90 text-white" : "text-slate-400 hover:text-white rounded-lg"}
                >
                  <CalendarDays className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === "gantt" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setViewMode("gantt")}
                  className={viewMode === "gantt" ? "bg-violet-600/90 text-white" : "text-slate-400 hover:text-white rounded-lg"}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
              
              <Dialog>
                <DialogTrigger asChild>
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-pink-500 rounded-xl shadow-lg shadow-fuchsia-500/25">
                      <Plus className="mr-2 h-4 w-4" />
                      Add Task
                    </Button>
                  </motion.div>
                </DialogTrigger>
                <DialogContent className="w-[95vw] max-w-[425px] mx-auto bg-slate-800 border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Create New Task</DialogTitle>
                    <p className="text-sm text-slate-400">
                      Add a task to the board
                    </p>
                  </DialogHeader>

                  <form className="space-y-4" onSubmit={handleCreateTask}>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Title *</Label>
                      <Input
                        id="title"
                        name="title"
                        placeholder="Enter task title"
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Description</Label>
                      <Textarea
                        id="description"
                        name="description"
                        placeholder="Enter task description"
                        rows={3}
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Assignee</Label>
                      <Input
                        id="assignee"
                        name="assignee"
                        placeholder="Who should do this?"
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-300">Priority</Label>
                      <Select name="priority" defaultValue="medium">
                        <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          {["low", "medium", "high"].map((priority, key) => (
                            <SelectItem key={key} value={priority}>
                              {priority.charAt(0).toUpperCase() +
                                priority.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-300">Due Date</Label>
                      <Input type="date" id="dueDate" name="dueDate" className="bg-slate-700/50 border-slate-600 text-white" />
                    </div>

                    <div className="flex justify-end space-x-2 pt-4">
                      <Button type="submit" className="bg-purple-600 hover:bg-purple-700">Create Task</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            </div>
          </motion.div>

          {viewMode === "board" && (
            <DndContext
              sensors={sensors}
              collisionDetection={rectIntersection}
              onDragStart={handleDragStart}
              onDragOver={handleDragOver}
              onDragEnd={handleDragEnd}
            >
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="flex flex-col lg:flex-row lg:space-x-6 lg:overflow-x-auto 
              lg:pb-6 lg:px-2 lg:-mx-2 lg:[&::-webkit-scrollbar]:h-2 
              lg:[&::-webkit-scrollbar-track]:bg-slate-800 
              lg:[&::-webkit-scrollbar-thumb]:bg-slate-600 lg:[&::-webkit-scrollbar-thumb]:rounded-full 
              space-y-4 lg:space-y-0"
              >
                <AnimatePresence>
                  {filteredColumns.map((column, key) => (
                    <DroppableColumn
                      key={key}
                      column={column}
                      onCreateTask={handleCreateTask}
                      onEditColumn={handleEditColumn}
                    >
                      <SortableContext
                        items={column.tasks.map((task) => task.id)}
                        strategy={verticalListSortingStrategy}
                      >
                        <div className="space-y-3">
                          {column.tasks.map((task, key) => (
                            <SortableTask 
                              task={task} 
                              key={key} 
                              onEdit={handleEditTask}
                              onDelete={handleDeleteTask}
                            />
                          ))}
                        </div>
                      </SortableContext>
                    </DroppableColumn>
                  ))}
                </AnimatePresence>

                <motion.div
                  className="w-full lg:flex-shrink-0 lg:w-80"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                    <Button
                      variant="outline"
                      className="w-full h-full min-h-[200px] border-2 border-dashed border-white/20 text-slate-400 hover:text-white hover:bg-white/5 hover:border-violet-500/50 rounded-2xl transition-all duration-300"
                      onClick={() => setIsCreatingColumn(true)}
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add another list
                    </Button>
                  </motion.div>
                </motion.div>

                <DragOverlay>
                  {activeTask ? <TaskOverlay task={activeTask} /> : null}
                </DragOverlay>
              </motion.div>
            </DndContext>
          )}

          {viewMode === "calendar" && (
            <CalendarView
              tasks={columns.flatMap((col) => col.tasks)}
              onTaskClick={handleEditTask}
            />
          )}

          {viewMode === "gantt" && (
            <GanttView
              tasks={columns.flatMap((col) => col.tasks)}
              onTaskClick={handleEditTask}
            />
          )}

          <AnimatePresence>
            {isCreatingColumn && (
              <Dialog open={isCreatingColumn} onOpenChange={setIsCreatingColumn}>
                <DialogContent className="w-[95vw] max-w-[425px] mx-auto bg-slate-800 border-slate-700">
                  <DialogHeader>
                    <DialogTitle className="text-white">Create New Column</DialogTitle>
                    <p className="text-sm text-slate-400">
                      Add new column to organize your tasks
                    </p>
                  </DialogHeader>
                  <form className="space-y-4" onSubmit={handleCreateColumn}>
                    <div className="space-y-2">
                      <Label className="text-slate-300">Column Title</Label>
                      <Input
                        id="columnTitle"
                        value={newColumnTitle}
                        onChange={(e) => setNewColumnTitle(e.target.value)}
                        placeholder="Enter column title..."
                        required
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                      />
                    </div>
                    <div className="space-x-2 flex justify-end">
                      <Button
                        type="button"
                        onClick={() => setIsCreatingColumn(false)}
                        variant="outline"
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-purple-600 hover:bg-purple-700">Create Column</Button>
                    </div>
                  </form>
                </DialogContent>
              </Dialog>
            )}
          </AnimatePresence>
        </motion.main>
      </div>

      <Dialog open={isEditingColumn} onOpenChange={setIsEditingColumn}>
        <DialogContent className="w-[95vw] max-w-[425px] mx-auto bg-slate-800 border-slate-700">
          <DialogHeader>
            <DialogTitle className="text-white">Edit Column</DialogTitle>
            <p className="text-sm text-slate-400">
              Update the title of your column
            </p>
          </DialogHeader>
          <form className="space-y-4" onSubmit={handleUpdateColumn}>
            <div className="space-y-2">
              <Label className="text-slate-300">Column Title</Label>
              <Input
                id="columnTitle"
                value={editingColumnTitle}
                onChange={(e) => setEditingColumnTitle(e.target.value)}
                placeholder="Enter column title..."
                required
                className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
              />
            </div>
            <div className="space-x-2 flex justify-end">
              <Button
                type="button"
                onClick={() => {
                  setIsEditingColumn(false);
                  setEditingColumnTitle("");
                  setEditingColumn(null);
                }}
                variant="outline"
                className="border-slate-600 text-slate-300 hover:bg-slate-700"
              >
                Cancel
              </Button>
              <Button type="submit" className="bg-purple-600 hover:bg-purple-700">Edit Column</Button>
            </div>
          </form>
        </DialogContent>
      </Dialog>

      <Dialog open={isEditingTask} onOpenChange={setIsEditingTask}>
        <DialogContent className="w-[95vw] max-w-[700px] mx-auto bg-slate-800 border-slate-700 max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <div className="flex items-center justify-between">
              <DialogTitle className="text-white text-xl">Edit Task</DialogTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => {
                  setIsEditingTask(false);
                  setSelectedTask(null);
                }}
                className="text-slate-400 hover:text-white hover:bg-slate-700"
              >
                <X className="h-4 w-4" />
              </Button>
            </div>
          </DialogHeader>

          {selectedTask && (
            <Tabs defaultValue="details" className="w-full">
              <TabsList className="grid w-full grid-cols-5 bg-slate-700/50">
                <TabsTrigger value="details" className="data-[state=active]:bg-purple-600">Details</TabsTrigger>
                <TabsTrigger value="checklists" className="data-[state=active]:bg-purple-600">Checklists</TabsTrigger>
                <TabsTrigger value="time" className="data-[state=active]:bg-purple-600">Time</TabsTrigger>
                <TabsTrigger value="comments" className="data-[state=active]:bg-purple-600">Comments</TabsTrigger>
                <TabsTrigger value="files" className="data-[state=active]:bg-purple-600">Files</TabsTrigger>
              </TabsList>
              
              <TabsContent value="details" className="space-y-4 mt-4">
                <form onSubmit={handleUpdateTask}>
                  <div className="space-y-2">
                    <Label className="text-slate-300">Title *</Label>
                    <Input
                      id="title"
                      name="title"
                      defaultValue={selectedTask.title}
                      placeholder="Enter task title"
                      required
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div className="space-y-2 mt-3">
                    <Label className="text-slate-300">Description</Label>
                    <Textarea
                      id="description"
                      name="description"
                      defaultValue={selectedTask.description || ""}
                      placeholder="Enter task description"
                      rows={3}
                      className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                    />
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3">
                    <div className="space-y-2">
                      <Label className="text-slate-300">Assignee</Label>
                      <Input
                        id="assignee"
                        name="assignee"
                        defaultValue={selectedTask.assignee || ""}
                        placeholder="Who should do this?"
                        className="bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label className="text-slate-300">Priority</Label>
                      <Select name="priority" defaultValue={selectedTask.priority || "medium"}>
                        <SelectTrigger className="bg-slate-700/50 border-slate-600 text-white">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent className="bg-slate-800 border-slate-700">
                          {["low", "medium", "high"].map((priority, key) => (
                            <SelectItem key={key} value={priority}>
                              {priority.charAt(0).toUpperCase() +
                                priority.slice(1)}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="space-y-2 mt-3">
                    <Label className="text-slate-300">Due Date</Label>
                    <Input 
                      type="date" 
                      id="dueDate" 
                      name="dueDate"
                      defaultValue={selectedTask.due_date || ""}
                      className="bg-slate-700/50 border-slate-600 text-white w-full"
                    />
                  </div>

                  <div className="flex justify-between pt-4 mt-4 border-t border-slate-700">
                    <Button
                      type="button"
                      variant="destructive"
                      onClick={() => {
                        handleDeleteTask(selectedTask.id);
                        setIsEditingTask(false);
                        setSelectedTask(null);
                      }}
                    >
                      Delete Task
                    </Button>
                    <div className="flex gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => {
                          setIsEditingTask(false);
                          setSelectedTask(null);
                        }}
                        className="border-slate-600 text-slate-300 hover:bg-slate-700"
                      >
                        Cancel
                      </Button>
                      <Button type="submit" className="bg-purple-600 hover:bg-purple-700">Save Changes</Button>
                    </div>
                  </div>
                </form>
              </TabsContent>
              
              <TabsContent value="checklists" className="mt-4">
                <TaskChecklists taskId={selectedTask.id} />
              </TabsContent>
              
              <TabsContent value="time" className="mt-4">
                <TimeTracker taskId={selectedTask.id} />
              </TabsContent>
              
              <TabsContent value="comments" className="mt-4">
                <TaskComments taskId={selectedTask.id} />
              </TabsContent>
              
              <TabsContent value="files" className="mt-4">
                <FileUpload 
                  taskId={selectedTask.id}
                  attachments={taskAttachments}
                  onAttachmentAdded={(attachment) => setTaskAttachments([...taskAttachments, attachment])}
                  onAttachmentRemoved={(attachmentId) => setTaskAttachments(taskAttachments.filter(a => a.id !== attachmentId))}
                />
              </TabsContent>
            </Tabs>
          )}
        </DialogContent>
      </Dialog>

      <ChatPanel
        boardId={id || ""}
        isOpen={isChatOpen}
        onClose={() => setIsChatOpen(false)}
      />

      <ActivityPanel
        boardId={id || ""}
        isOpen={isActivityOpen}
        onClose={() => setIsActivityOpen(false)}
      />

      <Footer />
    </>
  );
}
