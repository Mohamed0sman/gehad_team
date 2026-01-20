"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { useSupabase } from "@/lib/supabase/SupabaseProvider";
import { useUser } from "@clerk/nextjs";
import { Tag } from "@/lib/supabase/models";
import { X, Plus, Trash2 } from "lucide-react";
import { motion } from "framer-motion";

interface TaskTagsProps {
  taskId: string;
  boardId: string;
  tags: Tag[];
  onUpdate: () => void;
}

export function TaskTags({ taskId, boardId, tags, onUpdate }: TaskTagsProps) {
  const { supabase } = useSupabase();
  const { user } = useUser();
  const [availableTags, setAvailableTags] = useState<Tag[]>([]);
  const [taskTags, setTaskTags] = useState<Tag[]>(tags);
  const [isCreating, setIsCreating] = useState(false);
  const [newTagName, setNewTagName] = useState("");
  const [newTagColor, setNewTagColor] = useState("bg-blue-500");
  const [error, setError] = useState<string | null>(null);

  const colors = [
    "bg-red-500",
    "bg-orange-500",
    "bg-yellow-500",
    "bg-green-500",
    "bg-blue-500",
    "bg-indigo-500",
    "bg-purple-500",
    "bg-pink-500",
  ];

  useEffect(() => {
    if (!supabase || !boardId) return;

    const loadTags = async () => {
      try {
        const { data, error } = await supabase
          .from("tags")
          .select("*")
          .eq("board_id", boardId);

        if (error) {
          setError("Tags feature requires database migration");
          setAvailableTags([]);
        } else {
          setAvailableTags(data || []);
          setError(null);
        }
      } catch {
        setError("Tags feature unavailable");
        setAvailableTags([]);
      }
    };

    loadTags();
  }, [supabase, boardId]);

  const toggleTag = async (tag: Tag) => {
    if (!supabase) return;

    const isApplied = taskTags.some((t) => t.id === tag.id);

    try {
      if (isApplied) {
        const { error } = await supabase
          .from("task_tags")
          .delete()
          .eq("task_id", taskId)
          .eq("tag_id", tag.id);

        if (error) {
          setError("Failed to remove tag");
          return;
        }
        setTaskTags(taskTags.filter((t) => t.id !== tag.id));
      } else {
        const { error } = await supabase
          .from("task_tags")
          .insert({ task_id: taskId, tag_id: tag.id });

        if (error) {
          setError("Failed to add tag");
          return;
        }
        setTaskTags([...taskTags, tag]);
      }
      onUpdate();
    } catch {
      setError("Failed to toggle tag");
    }
  };

  const createNewTag = async () => {
    if (!newTagName.trim() || !supabase || !user) return;

    try {
      const { data, error } = await supabase
        .from("tags")
        .insert({
          name: newTagName.trim(),
          color: newTagColor,
          board_id: boardId,
          user_id: user.id,
        })
        .select()
        .single();

      if (error) {
        setError("Failed to create tag");
        return;
      }

      const { error: insertError } = await supabase
        .from("task_tags")
        .insert({ task_id: taskId, tag_id: data.id });

      if (insertError) {
        setError("Failed to add tag to task");
        return;
      }

      setAvailableTags([...availableTags, data]);
      setTaskTags([...taskTags, data]);
      setNewTagName("");
      setIsCreating(false);
      onUpdate();
    } catch {
      setError("Failed to create tag");
    }
  };

  const deleteTag = async (tag: Tag) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from("tags")
        .delete()
        .eq("id", tag.id);

      if (error) {
        setError("Failed to delete tag");
        return;
      }

      setAvailableTags(availableTags.filter((t) => t.id !== tag.id));
      setTaskTags(taskTags.filter((t) => t.id !== tag.id));
      onUpdate();
    } catch {
      setError("Failed to delete tag");
    }
  };

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-3"
      >
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-slate-300">Tags</Label>
        </div>
        <div className="p-4 rounded-lg bg-slate-700/20 border border-slate-700/50 text-center">
          <p className="text-sm text-slate-400 mb-2">{error}</p>
          <p className="text-xs text-slate-500">
            Run supabase-migrations-additional.sql in Supabase SQL Editor
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-3"
    >
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-slate-300">Tags</Label>
        {!isCreating ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCreating(true)}
            className="h-6 text-purple-400 text-xs hover:text-purple-300"
          >
            <Plus className="h-3 w-3 mr-1" />
            New Tag
          </Button>
        ) : (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCreating(false)}
            className="h-6 text-slate-400 text-xs"
          >
            <X className="h-3 w-3" />
          </Button>
        )}
      </div>

      {isCreating && (
        <div className="space-y-2 p-3 border rounded-lg bg-slate-700/20 border-slate-700/50">
          <div className="flex gap-2">
            <Input
              value={newTagName}
              onChange={(e) => setNewTagName(e.target.value)}
              placeholder="Tag name"
              className="text-sm bg-slate-700/50 border-slate-600 text-white"
            />
            <Button size="sm" onClick={createNewTag} className="bg-purple-600">
              Add
            </Button>
          </div>
          <div className="flex gap-1">
            {colors.map((color) => (
              <button
                key={color}
                type="button"
                onClick={() => setNewTagColor(color)}
                className={`w-5 h-5 rounded ${color} ${
                  newTagColor === color ? "ring-2 ring-offset-1 ring-white" : ""
                }`}
              />
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap gap-2">
        {availableTags.map((tag) => {
          const isApplied = taskTags.some((t) => t.id === tag.id);
          return (
            <div key={tag.id} className="relative group">
              <Badge
                className={`cursor-pointer transition-all ${
                  isApplied ? tag.color + " text-white" : "bg-slate-700 text-slate-300 hover:bg-slate-600"
                }`}
                onClick={() => toggleTag(tag)}
              >
                {tag.name}
              </Badge>
              {isApplied && (
                <button
                  type="button"
                  onClick={(e) => {
                    e.stopPropagation();
                    deleteTag(tag);
                  }}
                  className="absolute -top-1 -right-1 bg-red-500 text-white rounded-full p-0.5 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Trash2 className="h-2 w-2" />
                </button>
              )}
            </div>
          );
        })}
      </div>
    </motion.div>
  );
}

export default TaskTags;
