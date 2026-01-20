"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
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

interface TaskDialogProps {
  task: {
    id: string;
    title: string;
    description: string | null;
    assignee: string | null;
    due_date: string | null;
    priority: "low" | "medium" | "high";
  };
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSave: (updates: {
    title: string;
    description?: string;
    assignee?: string;
    due_date?: string | null;
    priority: "low" | "medium" | "high";
  }) => void;
  onDelete: () => void;
}

export default function TaskDialog({
  task,
  open,
  onOpenChange,
  onSave,
  onDelete,
}: TaskDialogProps) {
  const [title, setTitle] = useState(task.title);
  const [description, setDescription] = useState(task.description || "");
  const [assignee, setAssignee] = useState(task.assignee || "");
  const [dueDate, setDueDate] = useState(task.due_date || "");
  const [priority, setPriority] = useState<"low" | "medium" | "high">(task.priority);

  const handleSave = () => {
    onSave({
      title,
      description,
      assignee,
      due_date: dueDate || null,
      priority,
    });
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="w-[95vw] max-w-[600px] mx-auto">
        <DialogHeader>
          <div className="flex items-center justify-between">
            <DialogTitle>Edit Task</DialogTitle>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="text-red-600 hover:text-red-700"
            >
              X
            </Button>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label>Title *</Label>
            <Input
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="Enter task title"
            />
          </div>

          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Enter task description"
              rows={3}
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Assignee</Label>
              <Input
                value={assignee}
                onChange={(e) => setAssignee(e.target.value)}
                placeholder="Who should do this?"
              />
            </div>

            <div className="space-y-2">
              <Label>Priority</Label>
              <Select value={priority} onValueChange={(v) => setPriority(v as "low" | "medium" | "high")}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">LOW</SelectItem>
                  <SelectItem value="medium">MEDIUM</SelectItem>
                  <SelectItem value="high">HIGH</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Due Date</Label>
            <Input
              type="date"
              value={dueDate}
              onChange={(e) => setDueDate(e.target.value)}
            />
          </div>
        </div>

        <div className="flex justify-end space-x-2">
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Cancel
          </Button>
          <Button onClick={handleSave}>Save Changes</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
