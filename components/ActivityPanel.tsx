"use client";

import { useState, useEffect } from "react";
import { Activity } from "@/lib/supabase/models";
import { useSupabase } from "@/lib/supabase/SupabaseProvider";
import { useUser } from "@clerk/nextjs";
import type { UserResource } from "@clerk/types";
import { motion, AnimatePresence } from "framer-motion";
import { Activity as ActivityIcon, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ActivityPanelProps {
  boardId: string;
  isOpen: boolean;
  onClose: () => void;
}

const getUserDisplayInfo = (userId: string, currentUser: UserResource | null | undefined): { name: string; initials: string; color: string } => {
  if (currentUser && userId === currentUser.id) {
    const name = currentUser.fullName || currentUser.firstName || currentUser.emailAddresses[0]?.emailAddress?.split("@")[0] || "You";
    const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    return { name, initials, color: "from-violet-500 to-fuchsia-500" };
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
  const initials = `U${userId.slice(0, 1).toUpperCase()}`;
  return { name: "Team Member", initials, color: colors[colorIndex] };
};

export default function ActivityPanel({ boardId, isOpen, onClose }: ActivityPanelProps) {
  const { supabase } = useSupabase();
  const { user } = useUser();
  const [activities, setActivities] = useState<Activity[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!supabase || !boardId) {
      setLoading(false);
      return;
    }

    const loadActivities = async () => {
      try {
        const { data, error } = await supabase
          .from("activities")
          .select("*")
          .eq("board_id", boardId)
          .order("created_at", { ascending: false })
          .limit(100);

        if (error) {
          console.warn("Activity: Table not found or RLS issue. Activity log will be disabled.");
          setActivities([]);
        } else {
          setActivities(data || []);
        }
      } catch (err) {
        console.warn("Activity feature unavailable:", err);
        setActivities([]);
      } finally {
        setLoading(false);
      }
    };

    loadActivities();

    const subscription = supabase
      .channel(`activities:${boardId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "activities",
          filter: `board_id=eq.${boardId}`,
        },
        (payload) => {
          setActivities((prev) => [payload.new as Activity, ...prev]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, boardId]);

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

  if (!isOpen) return null;

  return (
    <motion.div
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className="fixed left-0 top-0 h-full w-80 bg-slate-800/95 backdrop-blur-sm border-r border-slate-700 shadow-2xl flex flex-col z-50"
    >
      <div className="p-4 border-b border-slate-700 flex items-center justify-between bg-gradient-to-r from-purple-600 to-blue-600 text-white">
        <div className="flex items-center gap-2">
          <ActivityIcon className="h-5 w-5" />
          <h2 className="font-semibold">Activity</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-white hover:bg-white/20"
        >
          ✕
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {loading ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            Loading activities...
          </div>
        ) : activities.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400 space-y-2">
            <ActivityIcon className="h-12 w-12 opacity-50" />
            <p className="text-center">No activities yet</p>
            <p className="text-xs text-center opacity-75">
              Start working to see your activity log here
            </p>
          </div>
        ) : (
          <AnimatePresence>
            {activities.map((activity, index) => {
              const userInfo = getUserDisplayInfo(activity.user_id, user);
              return (
                <motion.div
                  key={activity.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="flex gap-3 p-3 rounded-lg bg-white/5 border border-white/10"
                >
                  <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${userInfo.color} flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 shadow-lg`}>
                    {userInfo.initials}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium text-white">{userInfo.name}</span>
                    </div>
                    <p className={`text-sm text-slate-300 mt-0.5`}>
                      {activity.action}
                    </p>
                    <div className="flex items-center gap-2 mt-1.5 text-xs text-slate-500">
                      <Clock className="h-3 w-3" />
                      <span>{formatTime(activity.created_at)}</span>
                    </div>
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        )}
      </div>

      <div className="p-4 border-t border-slate-700 text-xs text-slate-500 text-center">
        Showing last 100 activities
      </div>
    </motion.div>
  );
}
