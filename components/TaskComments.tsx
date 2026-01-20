"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { useSupabase } from "@/lib/supabase/SupabaseProvider";
import { useUser } from "@clerk/nextjs";
import type { UserResource } from "@clerk/types";
import { Comment } from "@/lib/supabase/models";
import { Send, Trash2, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface TaskCommentsProps {
  taskId: string;
}

const getUserDisplayInfo = (userId: string, currentUser: UserResource | null | undefined): { name: string; initials: string; color: string; isCurrentUser: boolean } => {
  const isCurrentUser = currentUser && userId === currentUser.id;
  
  if (isCurrentUser && currentUser) {
    const name = "You";
    const initials = currentUser.fullName 
      ? currentUser.fullName.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2)
      : currentUser.firstName?.charAt(0).toUpperCase() || "Y";
    return { name, initials, color: "from-violet-500 to-fuchsia-500", isCurrentUser };
  }
  
  const colors = [
    "from-blue-500 to-cyan-500",
    "from-green-500 to-emerald-500",
    "from-amber-500 to-orange-500",
    "from-red-500 to-pink-500",
    "from-violet-500 to-purple-500",
    "from-rose-500 to-red-500",
  ];
  const colorIndex = userId.split('').reduce((acc, char) => acc + char.charCodeAt(0), 0) % colors.length;
  const initials = userId.slice(0, 2).toUpperCase();
  return { name: "Team Member", initials, color: colors[colorIndex], isCurrentUser };
};

export default function TaskComments({ taskId }: TaskCommentsProps) {
  const { supabase } = useSupabase();
  const { user } = useUser();
  const [comments, setComments] = useState<Comment[]>([]);
  const [newComment, setNewComment] = useState("");
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!supabase) return;

    const loadComments = async () => {
      try {
        const { data, error } = await supabase
          .from("comments")
          .select("*")
          .eq("task_id", taskId)
          .order("created_at", { ascending: true });

        if (error) {
          setError("Comments feature requires database migration");
          setComments([]);
        } else {
          setComments(data || []);
          setError(null);
        }
      } catch {
        setError("Comments feature unavailable");
        setComments([]);
      }
    };

    loadComments();
  }, [supabase, taskId]);

  const handleAddComment = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newComment.trim() || !supabase || !user) return;

    try {
      const { error } = await supabase
        .from("comments")
        .insert({
          content: newComment.trim(),
          user_id: user.id,
          task_id: taskId,
          is_edited: false,
        });

      if (error) {
        setError("Failed to add comment. Table may not exist.");
        return;
      }

      setNewComment("");
      const loadAgain = async () => {
        const { data } = await supabase
          .from("comments")
          .select("*")
          .eq("task_id", taskId)
          .order("created_at", { ascending: true });
        setComments(data || []);
      };
      loadAgain();
    } catch {
      setError("Failed to add comment");
    }
  };

  const handleDeleteComment = async (commentId: string) => {
    if (!supabase) return;

    try {
      const { error } = await supabase
        .from("comments")
        .delete()
        .eq("id", commentId);

      if (error) {
        setError("Failed to delete comment");
        return;
      }

      setComments((prev) => prev.filter((c) => c.id !== commentId));
    } catch {
      setError("Failed to delete comment");
    }
  };

  const formatTime = (date: string) => {
    const d = new Date(date);
    const now = new Date();
    const diffMs = now.getTime() - d.getTime();
    const diffMins = Math.floor(diffMs / 60000);
    const diffHours = Math.floor(diffMs / 3600000);
    const diffDays = Math.floor(diffMs / 86400000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffHours < 24) return `${diffHours}h ago`;
    if (diffDays < 7) return `${diffDays}d ago`;
    return d.toLocaleDateString();
  };

  if (error) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="space-y-3"
      >
        <Label className="text-sm font-medium text-slate-300">Comments</Label>
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
      <Label className="text-sm font-medium text-slate-300">Comments</Label>

      <form onSubmit={handleAddComment} className="flex gap-2">
        <Textarea
          value={newComment}
          onChange={(e) => setNewComment(e.target.value)}
          placeholder="Add a comment..."
          rows={2}
          className="flex-1 text-sm bg-slate-700/50 border-slate-600 text-white placeholder:text-slate-500"
        />
        <Button type="submit" size="icon" disabled={!newComment.trim()} className="bg-purple-600 hover:bg-purple-700">
          <Send className="h-4 w-4" />
        </Button>
      </form>

      <div className="space-y-2 max-h-60 overflow-y-auto">
        {comments.length === 0 ? (
          <p className="text-sm text-slate-500 text-center py-4">
            No comments yet. Be the first to comment!
          </p>
        ) : (
          comments.map((comment) => {
            const userInfo = getUserDisplayInfo(comment.user_id, user);
            return (
              <motion.div
                key={comment.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
              >
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${userInfo.color} flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 shadow-lg`}>
                  {userInfo.initials}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between gap-2">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{userInfo.name}</span>
                    </div>
                    {userInfo.isCurrentUser && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteComment(comment.id)}
                        className="h-6 w-6 p-0 text-slate-500 hover:text-red-400 flex-shrink-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    )}
                  </div>
                  <p className="text-sm text-slate-300 break-words mt-0.5">
                    {comment.content}
                  </p>
                  <div className="flex items-center gap-1 text-xs text-slate-500 mt-1.5">
                    <Clock className="h-3 w-3" />
                    {formatTime(comment.created_at)}
                    {comment.is_edited && <span className="ml-1">(edited)</span>}
                  </div>
                </div>
              </motion.div>
            );
          })
        )}
      </div>
    </motion.div>
  );
}
