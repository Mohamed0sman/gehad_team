"use client";

import { useState, useEffect, useRef } from "react";
import { TimeEntry } from "@/lib/supabase/models";
import { timeEntryService } from "@/lib/services";
import { useSupabase } from "@/lib/supabase/SupabaseProvider";
import { useUser } from "@clerk/nextjs";
import { motion } from "framer-motion";
import { Play, Pause, Clock, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

interface TimeTrackerProps {
  taskId: string;
  onTimeUpdate?: (totalTime: number) => void;
}

export default function TimeTracker({ taskId, onTimeUpdate }: TimeTrackerProps) {
  const { supabase } = useSupabase();
  const { user } = useUser();
  const [timeEntries, setTimeEntries] = useState<TimeEntry[]>([]);
  const [activeTimer, setActiveTimer] = useState<TimeEntry | null>(null);
  const [elapsedTime, setElapsedTime] = useState(0);
  const [description, setDescription] = useState("");
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (!supabase || !taskId) return;

    const loadTimeEntries = async () => {
      try {
        const [entries, active] = await Promise.all([
          timeEntryService.getTimeEntries(supabase, taskId),
          user ? timeEntryService.getActiveTimer(supabase, user.id) : null,
        ]);
        setTimeEntries(entries);

        if (active && active.task_id === taskId) {
          setActiveTimer(active);
        }
      } catch (error) {
        console.error("Error loading time entries:", error);
      }
    };

    loadTimeEntries();
  }, [supabase, taskId, user]);

  useEffect(() => {
    if (activeTimer) {
      const startTime = new Date(activeTimer.start_time).getTime();
      timerRef.current = setInterval(() => {
        const elapsed = Math.floor((Date.now() - startTime) / 1000);
        setElapsedTime(elapsed);
      }, 1000);
    } else {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
      setElapsedTime(0);
    }

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
      }
    };
  }, [activeTimer]);

  const formatTime = (seconds: number) => {
    const hrs = Math.floor(seconds / 3600);
    const mins = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hrs.toString().padStart(2, "0")}:${mins.toString().padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const formatDuration = (duration: number | null) => {
    if (!duration) return "0:00:00";
    return formatTime(duration);
  };

  const startTimer = async () => {
    if (!supabase || !user) return;

    try {
      const newEntry = await timeEntryService.startTimer(supabase, {
        task_id: taskId,
        user_id: user.id,
        start_time: new Date().toISOString(),
        description: description || null,
      });
      setActiveTimer(newEntry);
      setDescription("");
    } catch (error) {
      console.error("Error starting timer:", error);
    }
  };

  const stopTimer = async () => {
    if (!supabase || !activeTimer) return;

    try {
      const updatedEntry = await timeEntryService.stopTimer(supabase, activeTimer.id);
      setTimeEntries((prev) => [updatedEntry, ...prev]);
      setActiveTimer(null);
      onTimeUpdate?.(updatedEntry.duration || 0);
    } catch (error) {
      console.error("Error stopping timer:", error);
    }
  };

  const deleteEntry = async (entryId: string) => {
    if (!supabase) return;

    try {
      await timeEntryService.deleteTimeEntry(supabase, entryId);
      setTimeEntries((prev) => prev.filter((e) => e.id !== entryId));
    } catch (error) {
      console.error("Error deleting entry:", error);
    }
  };

  const totalTime = timeEntries.reduce((sum, entry) => sum + (entry.duration || 0), 0) + elapsedTime;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-4"
    >
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-white flex items-center gap-2">
          <Clock className="h-4 w-4 text-purple-400" />
          Time Tracking
        </h3>
        <div className="text-lg font-mono text-purple-400">
          {formatTime(totalTime)}
        </div>
      </div>

      <div className="p-4 rounded-lg bg-slate-700/30 border border-slate-700/50">
        <div className="flex items-center gap-4">
          {activeTimer ? (
            <motion.div
              initial={{ scale: 0.9 }}
              animate={{ scale: 1 }}
              className="flex-1"
            >
              <div className="text-center mb-3">
                <motion.div
                  animate={{ opacity: [1, 0.5, 1] }}
                  transition={{ repeat: Infinity, duration: 1 }}
                  className="text-3xl font-mono text-red-400"
                >
                  {formatTime(elapsedTime)}
                </motion.div>
                <p className="text-xs text-slate-400 mt-1">Timer running...</p>
              </div>
              <Button
                onClick={stopTimer}
                className="w-full bg-red-600 hover:bg-red-700"
              >
                <Pause className="h-4 w-4 mr-2" />
                Stop Timer
              </Button>
            </motion.div>
          ) : (
            <div className="flex-1">
              <Input
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="What are you working on?"
                className="mb-3 bg-slate-600/50 border-slate-500 text-white"
              />
              <Button
                onClick={startTimer}
                className="w-full bg-green-600 hover:bg-green-700"
              >
                <Play className="h-4 w-4 mr-2" />
                Start Timer
              </Button>
            </div>
          )}
        </div>
      </div>

      {timeEntries.length > 0 && (
        <div className="space-y-2">
          <h4 className="text-sm font-medium text-slate-400">Recent Entries</h4>
          <div className="space-y-2 max-h-48 overflow-y-auto">
            {timeEntries.slice(0, 10).map((entry) => (
              <div
                key={entry.id}
                className="flex items-center justify-between p-2 rounded bg-slate-700/20 border border-slate-700/30"
              >
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-white truncate">
                    {entry.description || "No description"}
                  </p>
                  <p className="text-xs text-slate-500">
                    {new Date(entry.start_time).toLocaleString()}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-mono text-slate-300">
                    {formatDuration(entry.duration)}
                  </span>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => deleteEntry(entry.id)}
                    className="h-8 w-8 p-0 text-slate-500 hover:text-red-400"
                  >
                    <Trash2 className="h-3 w-3" />
                  </Button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </motion.div>
  );
}
