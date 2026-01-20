"use client";

import { useState } from "react";
import { Task } from "@/lib/supabase/models";
import { motion } from "framer-motion";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Button } from "@/components/ui/button";

interface CalendarViewProps {
  tasks: Task[];
  onTaskClick?: (task: Task) => void;
}

export default function CalendarView({ tasks, onTaskClick }: CalendarViewProps) {
  const [currentDate, setCurrentDate] = useState(new Date());
  const [view, setView] = useState<"month" | "week">("month");

  const getDaysInMonth = (date: Date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    const daysInMonth = lastDay.getDate();
    const startingDay = firstDay.getDay();

    return { daysInMonth, startingDay, year, month };
  };

  const { daysInMonth, startingDay, year, month } = getDaysInMonth(currentDate);

  const getTasksForDate = (date: Date) => {
    return tasks.filter((task) => {
      if (!task.due_date) return false;
      const taskDate = new Date(task.due_date);
      return (
        taskDate.getDate() === date.getDate() &&
        taskDate.getMonth() === date.getMonth() &&
        taskDate.getFullYear() === date.getFullYear()
      );
    });
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "high": return "bg-red-500";
      case "medium": return "bg-yellow-500";
      case "low": return "bg-green-500";
      default: return "bg-gray-500";
    }
  };

  const prevMonth = () => {
    setCurrentDate(new Date(year, month - 1, 1));
  };

  const nextMonth = () => {
    setCurrentDate(new Date(year, month + 1, 1));
  };

  const goToToday = () => {
    setCurrentDate(new Date());
  };

  const monthNames = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December"
  ];

  const dayNames = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

  const days = [];
  for (let i = 0; i < startingDay; i++) {
    days.push(null);
  }
  for (let i = 1; i <= daysInMonth; i++) {
    days.push(i);
  }

  const isToday = (day: number | null) => {
    if (!day) return false;
    const today = new Date();
    return day === today.getDate() && month === today.getMonth() && year === today.getFullYear();
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="bg-slate-800/50 rounded-lg border border-slate-700/50 overflow-hidden"
    >
      <div className="p-4 border-b border-slate-700/50 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <h2 className="text-xl font-bold text-white">
            {monthNames[month]} {year}
          </h2>
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={prevMonth}
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
              onClick={nextMonth}
              className="text-slate-400 hover:text-white"
            >
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant={view === "month" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("month")}
            className={view === "month" ? "bg-purple-600" : "text-slate-400"}
          >
            Month
          </Button>
          <Button
            variant={view === "week" ? "default" : "ghost"}
            size="sm"
            onClick={() => setView("week")}
            className={view === "week" ? "bg-purple-600" : "text-slate-400"}
          >
            Week
          </Button>
        </div>
      </div>

      <div className="p-4">
        <div className="grid grid-cols-7 gap-1 mb-2">
          {dayNames.map((day) => (
            <div key={day} className="text-center text-sm font-medium text-slate-400 py-2">
              {day}
            </div>
          ))}
        </div>

        <div className="grid grid-cols-7 gap-1">
          {days.map((day, index) => {
            const date = day ? new Date(year, month, day) : null;
            const tasksForDate = date ? getTasksForDate(date) : [];
            const isCurrentDay = day ? isToday(day) : false;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: index * 0.01 }}
                className={`
                  min-h-[100px] p-2 rounded-lg border
                  ${day ? "bg-slate-700/30 border-slate-700/50" : "border-transparent"}
                  ${isCurrentDay ? "ring-2 ring-purple-500" : ""}
                `}
              >
                {day && (
                  <>
                    <div className={`text-sm font-medium mb-1 ${isCurrentDay ? "text-purple-400" : "text-slate-300"}`}>
                      {day}
                    </div>
                    <div className="space-y-1">
                      {tasksForDate.slice(0, 3).map((task) => (
                        <motion.div
                          key={task.id}
                          whileHover={{ scale: 1.02 }}
                          onClick={() => onTaskClick?.(task)}
                          className={`
                            text-xs p-1.5 rounded cursor-pointer truncate
                            ${getPriorityColor(task.priority)}
                            text-white
                          `}
                        >
                          {task.title}
                        </motion.div>
                      ))}
                      {tasksForDate.length > 3 && (
                        <div className="text-xs text-slate-400 text-center">
                          +{tasksForDate.length - 3} more
                        </div>
                      )}
                    </div>
                  </>
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="p-4 border-t border-slate-700/50">
        <div className="flex items-center gap-4 text-sm">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-red-500" />
            <span className="text-slate-400">High Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-slate-400">Medium Priority</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 rounded-full bg-green-500" />
            <span className="text-slate-400">Low Priority</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
