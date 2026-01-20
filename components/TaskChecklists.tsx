"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useSupabase } from "@/lib/supabase/SupabaseProvider";
import { Checklist, ChecklistItem } from "@/lib/supabase/models";
import { Plus, Trash2, CheckCircle, Circle } from "lucide-react";
import { motion } from "framer-motion";

interface TaskChecklistsProps {
  taskId: string;
}

export default function TaskChecklists({ taskId }: TaskChecklistsProps) {
  const { supabase } = useSupabase();
  const [checklists, setChecklists] = useState<Checklist[]>([]);
  const [items, setItems] = useState<Record<string, ChecklistItem[]>>({});
  const [isCreating, setIsCreating] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newItemTitle, setNewItemTitle] = useState<Record<string, string>>({});
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;

    const loadChecklists = async () => {
      try {
        const { data, error } = await supabase
          .from("checklists")
          .select("*")
          .eq("task_id", taskId)
          .order("sort_order", { ascending: true });

        if (error) {
          setError("Checklists feature requires database migration");
          setChecklists([]);
          return;
        }

        setChecklists(data || []);
        setError(null);

        for (const checklist of data || []) {
          const { data: checklistItems } = await supabase
            .from("checklist_items")
            .select("*")
            .eq("checklist_id", checklist.id)
            .order("sort_order", { ascending: true });

          setItems((prev) => ({ ...prev, [checklist.id]: checklistItems || [] }));
        }
      } catch {
        setError("Checklists feature unavailable");
        setChecklists([]);
      }
    };

    loadChecklists();
  }, [supabase, taskId]);

  const createChecklist = async () => {
    if (!newTitle.trim() || !supabase) return;

    try {
      const { data, error } = await supabase
        .from("checklists")
        .insert({
          title: newTitle.trim(),
          task_id: taskId,
          sort_order: checklists.length,
        })
        .select()
        .single();

      if (error) {
        setError("Failed to create checklist");
        return;
      }

      setChecklists([...checklists, data]);
      setNewTitle("");
      setIsCreating(false);
    } catch {
      setError("Failed to create checklist");
    }
  };

  const createChecklistItem = async (checklistId: string) => {
    if (!newItemTitle[checklistId]?.trim() || !supabase) return;

    try {
      const existingItems = items[checklistId] || [];
      const { data, error } = await supabase
        .from("checklist_items")
        .insert({
          title: newItemTitle[checklistId].trim(),
          is_completed: false,
          checklist_id: checklistId,
          sort_order: existingItems.length,
        })
        .select()
        .single();

      if (error) {
        setError("Failed to add item");
        return;
      }

      setItems((prev) => ({
        ...prev,
        [checklistId]: [...existingItems, data],
      }));
      setNewItemTitle({ ...newItemTitle, [checklistId]: "" });
    } catch {
      setError("Failed to add item");
    }
  };

  const toggleItem = async (checklistId: string, item: ChecklistItem) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from("checklist_items")
        .update({ is_completed: !item.is_completed })
        .eq("id", item.id);

      if (error) {
        setError("Failed to update item");
        return;
      }

      setItems((prev) => ({
        ...prev,
        [checklistId]: prev[checklistId].map((i) =>
          i.id === item.id ? { ...i, is_completed: !i.is_completed } : i
        ),
      }));
    } catch {
      setError("Failed to update item");
    }
  };

  const deleteChecklist = async (checklistId: string) => {
    if (!confirm("Delete this checklist?")) return;
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from("checklists")
        .delete()
        .eq("id", checklistId);

      if (error) {
        setError("Failed to delete checklist");
        return;
      }

      setChecklists(checklists.filter((c) => c.id !== checklistId));
      setItems((prev) => {
        const newItems = { ...prev };
        delete newItems[checklistId];
        return newItems;
      });
    } catch {
      setError("Failed to delete checklist");
    }
  };

  const deleteChecklistItem = async (checklistId: string, itemId: string) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from("checklist_items")
        .delete()
        .eq("id", itemId);

      if (error) {
        setError("Failed to delete item");
        return;
      }

      setItems((prev) => ({
        ...prev,
        [checklistId]: prev[checklistId].filter((i) => i.id !== itemId),
      }));
    } catch {
      setError("Failed to delete item");
    }
  };

  const getProgress = (checklistId: string) => {
    const checklistItems = items[checklistId] || [];
    if (checklistItems.length === 0) return 0;
    const completed = checklistItems.filter((i) => i.is_completed).length;
    return Math.round((completed / checklistItems.length) * 100);
  };

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-4"
      >
        <div className="flex items-center justify-between">
          <Label className="text-sm font-medium text-slate-300">Checklists</Label>
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
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <Label className="text-sm font-medium text-slate-300">Checklists</Label>
        {!isCreating ? (
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsCreating(true)}
            className="h-6 text-purple-400 text-xs hover:text-purple-300"
          >
            <Plus className="h-3 w-3 mr-1" />
            Add Checklist
          </Button>
        ) : (
          <div className="flex gap-2">
            <Input
              value={newTitle}
              onChange={(e) => setNewTitle(e.target.value)}
              placeholder="Checklist title"
              className="h-6 text-sm w-40 bg-slate-700/50 border-slate-600 text-white"
            />
            <Button size="sm" onClick={createChecklist} className="h-6 bg-purple-600">
              Add
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsCreating(false)}
              className="h-6 text-slate-400"
            >
              Cancel
            </Button>
          </div>
        )}
      </div>

      <div className="space-y-3">
        {checklists.map((checklist) => {
          const progress = getProgress(checklist.id);
          const checklistItems = items[checklist.id] || [];

          return (
            <motion.div
              key={checklist.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="border rounded-lg p-3 bg-slate-700/20 border-slate-700/50 space-y-2"
            >
              <div className="flex items-center justify-between">
                <h4 className="font-medium text-sm text-white">{checklist.title}</h4>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => deleteChecklist(checklist.id)}
                  className="h-6 w-6 p-0 text-slate-500 hover:text-red-400"
                >
                  <Trash2 className="h-3 w-3" />
                </Button>
              </div>

              {progress > 0 && (
                <div className="space-y-1">
                  <div className="flex items-center justify-between text-xs text-slate-400">
                    <span>Progress</span>
                    <span>{progress}%</span>
                  </div>
                  <div className="h-1.5 bg-slate-700 rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-600 transition-all"
                      style={{ width: `${progress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="space-y-1">
                {checklistItems.map((item) => (
                  <div key={item.id} className="flex items-start gap-2 group">
                    <button
                      onClick={() => toggleItem(checklist.id, item)}
                      className="mt-0.5 flex-shrink-0"
                    >
                      {item.is_completed ? (
                        <CheckCircle className="h-4 w-4 text-purple-500" />
                      ) : (
                        <Circle className="h-4 w-4 text-slate-500" />
                      )}
                    </button>
                    <span
                      className={`text-sm flex-1 ${
                        item.is_completed
                          ? "text-slate-500 line-through"
                          : "text-slate-300"
                      }`}
                    >
                      {item.title}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => deleteChecklistItem(checklist.id, item.id)}
                      className="h-5 w-5 p-0 text-slate-500 hover:text-red-400 opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  </div>
                ))}

                <div className="flex gap-1">
                  <Input
                    value={newItemTitle[checklist.id] || ""}
                    onChange={(e) =>
                      setNewItemTitle({ ...newItemTitle, [checklist.id]: e.target.value })
                    }
                    placeholder="Add an item"
                    className="text-sm h-7 flex-1 bg-slate-700/50 border-slate-600 text-white"
                    onKeyPress={(e) => {
                      if (e.key === "Enter" && newItemTitle[checklist.id]?.trim()) {
                        e.preventDefault();
                        createChecklistItem(checklist.id);
                      }
                    }}
                  />
                  <Button
                    size="sm"
                    onClick={() => createChecklistItem(checklist.id)}
                    disabled={!newItemTitle[checklist.id]?.trim()}
                    className="h-7 bg-purple-600"
                  >
                    <Plus className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </motion.div>
  );
}
