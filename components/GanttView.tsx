"use client";

import { useMemo, useState } from "react";
import { Task } from "@/lib/supabase/models";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface GanttViewProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export default function GanttView({ tasks, onTaskClick }: GanttViewProps) {
  const [startDate, setStartDate] = useState(new Date());
  const [daysToShow, setDaysToShow] = useState(14);

  const { dateRange, taskBars } = useMemo(() => {
    const start = new Date(startDate);
    start.setHours(0, 0, 0, 0);
    
    const dates: Date[] = [];
    for (let i = 0; i < daysToShow; i++) {
      const date = new Date(start);
      date.setDate(date.getDate() + i);
      dates.push(date);
    }

    const bars = tasks
      .filter((task) => task.due_date)
      .map((task) => {
        const dueDate = new Date(task.due_date!);
        const start = new Date(startDate);
        start.setHours(0, 0, 0, 0);
        
        const taskStart = new Date(Math.max(start.getTime(), dueDate.getTime() - 3 * 24 * 60 * 60 * 1000));
        const taskEnd = dueDate;
        
        const startOffset = Math.floor((taskStart.getTime() - start.getTime()) / (24 * 60 * 60 * 1000));
        const duration = Math.min(
          Math.floor((taskEnd.getTime() - taskStart.getTime()) / (24 * 60 * 60 * 1000)) + 1,
          daysToShow - startOffset
        );

        return {
          task,
          startOffset: Math.max(0, startOffset),
          duration: Math.max(1, duration),
        };
      });

    return { dateRange: dates, taskBars: bars };
  }, [startDate, daysToShow, tasks]);

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-blue-500";
    }
  };

  const prevDays = () => {
    const newDate = new Date(startDate);
    newDate.setDate(newDate.getDate() - 7);
    setStartDate(newDate);
  };

  const nextDays = () => {
    const newDate = new Date(startDate);
    newDate.setDate(newDate.getDate() + 7);
    setStartDate(newDate);
  };

  const goToToday = () => {
    setStartDate(new Date());
  };

  const isToday = (date: Date) => {
    const today = new Date();
    return date.toDateString() === today.toDateString();
  };

  const isPast = (date: Date) => {
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return date < today;
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-slate-800/50 rounded-lg border border-slate-700/50 overflow-hidden"
    >
      <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-white">Timeline</h2>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevDays}
              className="text-slate-400 hover:text-white"
            >
              <ChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={goToToday}
              className="text-slate-400 hover:text-white text-sm"
            >
              Today
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={nextDays}
              className="text-slate-400 hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={daysToShow === 7 ? "default" : "ghost"}
            size="sm"
            onClick={() => setDaysToShow(7)}
            className={daysToShow === 7 ? "bg-purple-600" : "text-slate-400"}
          >
            Week
          </Button>
          <Button
            variant={daysToShow === 14 ? "default" : "ghost"}
            size="sm"
            onClick={() => setDaysToShow(14)}
            className={daysToShow === 14 ? "bg-purple-600" : "text-slate-400"}
          >
            2 Weeks
          </Button>
          <Button
            variant={daysToShow === 30 ? "default" : "ghost"}
            size="sm"
            onClick={() => setDaysToShow(30)}
            className={daysToShow === 30 ? "bg-purple-600" : "text-slate-400"}
          >
            Month
          </Button>
        </div>
      </div>

      <div className="overflow-x-auto">
        <div className="min-w-[800px]">
          <div className="flex border-b border-slate-700/50">
            <div className="w-48 flex-shrink-0 p-3 bg-slate-700/30 border-r border-slate-700/50">
              <span className="text-sm font-medium text-slate-400">Task</span>
            </div>
            <div className="flex-1 flex">
              {dateRange.map((date) => (
                <div
                  key={date.toISOString()}
                  className={`
                    flex-1 min-w-[60px] p-2 text-center border-r border-slate-700/30
                    ${isToday(date) ? "bg-purple-500/20" : ""}
                    ${isPast(date) && !isToday(date) ? "bg-slate-700/20" : ""}
                  `}
                >
                  <div className="text-xs text-slate-400">
                    {date.toLocaleDateString("en-US", { weekday: "short" })}
                  </div>
                  <div className={`
                    text-sm font-medium
                    ${isToday(date) ? "text-purple-400" : "text-white"}
                    ${isPast(date) && !isToday(date) ? "text-slate-500" : ""}
                  `}>
                    {date.getDate()}
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-1">
            {taskBars.map((bar, index) => (
              <motion.div
                key={bar.task.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                className="flex"
              >
                <div className="w-48 flex-shrink-0 p-2 bg-slate-700/20 border-r border-slate-700/50">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    onClick={() => onTaskClick?.(bar.task)}
                    className="cursor-pointer"
                  >
                    <p className="text-sm text-white truncate">{bar.task.title}</p>
                    <p className="text-xs text-slate-500 truncate">
                      {bar.task.assignee || "Unassigned"}
                    </p>
                  </motion.div>
                </div>
                <div className="flex-1 flex relative h-12">
                  {dateRange.map((date) => (
                    <div
                      key={date.toISOString()}
                      className="flex-1 min-w-[60px] border-r border-slate-700/20"
                    />
                  ))}
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${(bar.duration / daysToShow) * 100}%` }}
                    transition={{ duration: 0.3, delay: index * 0.1 }}
                    className={`
                      absolute top-2 h-8 rounded cursor-pointer
                      ${getPriorityColor(bar.task.priority)}
                      opacity-90 hover:opacity-100
                    `}
                    style={{
                      left: `${(bar.startOffset / daysToShow) * 100}%`,
                    }}
                    onClick={() => onTaskClick?.(bar.task)}
                  >
                    <div className="h-full px-2 flex items-center overflow-hidden">
                      <span className="text-xs text-white truncate">
                        {bar.task.title}
                      </span>
                    </div>
                  </motion.div>
                </div>
              </motion.div>
            ))}

            {taskBars.length === 0 && (
              <div className="p-8 text-center text-slate-400">
                <p>No tasks with due dates to show in timeline</p>
                <p className="text-sm mt-1">Add due dates to tasks to see them here</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <div className="p-4 border-t border-slate-700/50">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span className="text-slate-400">High Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-yellow-500" />
            <span className="text-slate-400">Medium Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span className="text-slate-400">Low Priority</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
