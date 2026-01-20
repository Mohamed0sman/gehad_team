"use client";

import { useState, useEffect, useRef } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useSupabase } from "@/lib/supabase/SupabaseProvider";
import { useUser } from "@clerk/nextjs";
import type { UserResource } from "@clerk/types";
import { Message } from "@/lib/supabase/models";
import { Send, Trash2, MessageCircle, X } from "lucide-react";
import { motion } from "framer-motion";

interface ChatPanelProps {
  boardId: string;
  isOpen: boolean;
  onClose: () => void;
}

const getUserDisplayInfo = (userId: string, currentUser: UserResource | null | undefined): { name: string; initials: string; color: string; isCurrentUser: boolean } => {
  const isCurrentUser = currentUser && userId === currentUser.id;
  
  if (isCurrentUser && currentUser) {
    const name = currentUser.fullName || currentUser.firstName || currentUser.emailAddresses[0]?.emailAddress?.split("@")[0] || "You";
    const initials = name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2);
    return { name, initials, color: "from-indigo-600 via-purple-600 to-fuchsia-600", isCurrentUser };
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

export default function ChatPanel({ boardId, isOpen, onClose }: ChatPanelProps) {
  const { supabase } = useSupabase();
  const { user } = useUser();
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isOpen]);

  useEffect(() => {
    if (!supabase || !boardId) {
      setLoading(false);
      return;
    }

    const loadMessages = async () => {
      try {
        const { data, error } = await supabase
          .from("messages")
          .select("*")
          .eq("board_id", boardId)
          .order("created_at", { ascending: true });

        if (error) {
          console.warn("Chat: Table not found or RLS issue. Messages will be disabled.");
          setMessages([]);
        } else {
          setMessages(data || []);
        }
      } catch (err) {
        console.warn("Chat feature unavailable:", err);
        setMessages([]);
      } finally {
        setLoading(false);
      }
    };

    loadMessages();

    const subscription = supabase
      .channel(`messages:${boardId}`)
      .on(
        "postgres_changes",
        {
          event: "INSERT",
          schema: "public",
          table: "messages",
          filter: `board_id=eq.${boardId}`,
        },
        (payload) => {
          setMessages((prev) => [...prev, payload.new as Message]);
        }
      )
      .subscribe();

    return () => {
      subscription.unsubscribe();
    };
  }, [supabase, boardId]);

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !supabase || !user) return;

    const messageContent = newMessage.trim();
    setNewMessage("");

    try {
      const { error } = await supabase
        .from("messages")
        .insert({
          content: messageContent,
          user_id: user.id,
          board_id: boardId,
        });

      if (error) {
        if (error.message.includes("relation") || error.message.includes("table") || error.message.includes("RLS")) {
          console.warn("Chat feature unavailable - database table not configured");
        } else {
          console.warn("Could not send message:", error.message);
        }
      }
    } catch {
      console.warn("Could not delete message");
    }
  };

  const handleDeleteMessage = async (messageId: string) => {
    if (!supabase) return;
    try {
      const { error } = await supabase
        .from("messages")
        .delete()
        .eq("id", messageId);
      
      if (error) {
        console.warn("Could not delete message");
      } else {
        setMessages((prev) => prev.filter((m) => m.id !== messageId));
      }
    } catch {
      console.warn("Could not delete message");
    }
  };

  if (!isOpen) return null;

  return (
    <motion.div 
      initial={{ x: 400, opacity: 0 }}
      animate={{ x: 0, opacity: 1 }}
      exit={{ x: 400, opacity: 0 }}
      className="fixed right-0 top-0 h-full w-96 bg-slate-900/98 backdrop-blur-xl border-l border-slate-700/50 shadow-2xl flex flex-col z-50"
    >
      <div className="p-4 border-b border-slate-700/50 flex items-center justify-between bg-gradient-to-r from-indigo-600 via-purple-600 to-fuchsia-600 text-white">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-white/20 flex items-center justify-center">
            <MessageCircle className="h-4 w-4" />
          </div>
          <h2 className="font-semibold text-lg">Team Chat</h2>
        </div>
        <Button
          variant="ghost"
          size="sm"
          onClick={onClose}
          className="text-white/80 hover:bg-white/20 hover:text-white"
        >
          <X className="h-4 w-4" />
        </Button>
      </div>

      <div className="flex-1 overflow-y-auto p-4 space-y-4 bg-slate-900/50">
        {loading ? (
          <div className="flex items-center justify-center h-full text-slate-400">
            <div className="flex flex-col items-center gap-2">
              <div className="w-8 h-8 border-2 border-purple-500 border-t-transparent rounded-full animate-spin" />
              <p className="text-sm">Loading messages...</p>
            </div>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-slate-400">
            <div className="w-16 h-16 rounded-full bg-slate-800 flex items-center justify-center mb-4">
              <MessageCircle className="h-8 w-8 text-slate-600" />
            </div>
            <p className="text-center">No messages yet.<br/>Start the conversation!</p>
          </div>
        ) : (
          messages.map((message) => {
            const userInfo = getUserDisplayInfo(message.user_id, user);
            return (
              <motion.div
                key={message.id}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex gap-3 ${userInfo.isCurrentUser ? "flex-row-reverse" : ""}`}
              >
                <div className={`w-9 h-9 rounded-full bg-gradient-to-br ${userInfo.color} flex items-center justify-center text-white text-sm font-semibold flex-shrink-0 shadow-lg`}>
                  {userInfo.initials}
                </div>
                <div className={`flex flex-col ${userInfo.isCurrentUser ? "items-end" : "items-start"} max-w-[80%]`}>
                  {!userInfo.isCurrentUser && (
                    <span className="text-xs text-slate-400 px-1 mb-1">{userInfo.name}</span>
                  )}
                  <div
                    className={`rounded-2xl p-3 ${
                      userInfo.isCurrentUser
                        ? "bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-purple-500/25"
                        : "bg-slate-800 text-white border border-slate-700"
                    }`}
                  >
                    <p className="text-sm break-words">{message.content}</p>
                  </div>
                  <span className="text-xs text-slate-500 mt-1.5 px-1">
                    {new Date(message.created_at).toLocaleTimeString([], {
                      hour: "2-digit",
                      minute: "2-digit",
                    })}
                  </span>
                  {userInfo.isCurrentUser && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteMessage(message.id)}
                      className="h-6 w-6 p-0 text-slate-500 hover:text-red-400 hover:bg-red-400/10 mt-1"
                    >
                      <Trash2 className="h-3 w-3" />
                    </Button>
                  )}
                </div>
              </motion.div>
            );
          })
        )}
        <div ref={messagesEndRef} />
      </div>

      <form onSubmit={handleSendMessage} className="p-4 border-t border-slate-700/50 bg-slate-900/50">
        <div className="flex gap-2">
          <Input
            value={newMessage}
            onChange={(e) => setNewMessage(e.target.value)}
            placeholder="Type a message..."
            className="flex-1 bg-slate-800/50 border-slate-700 text-white placeholder:text-slate-500 focus:border-purple-500 focus:ring-1 focus:ring-purple-500/50 rounded-xl"
          />
          <Button 
            type="submit" 
            disabled={!newMessage.trim()} 
            className="bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 rounded-xl shadow-lg shadow-purple-500/25"
          >
            <Send className="h-4 w-4" />
          </Button>
        </div>
      </form>
    </motion.div>
  );
}
