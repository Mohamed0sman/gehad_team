"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Navbar from "@/components/navbar";
import Footer from "@/components/footer";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useBoards } from "@/lib/hooks/useBoards";
import { useUser } from "@clerk/nextjs";
import {
  Clock,
  Grid3x3,
  List,
  Plus,
  Search,
  Trash2,
  Trello,
  ChevronRight,
  MoreHorizontal,
  Edit,
  Copy,
} from "lucide-react";
import Link from "next/link";

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

const staggerContainer = {
  animate: {
    transition: {
      staggerChildren: 0.1
    }
  }
};

export default function DashboardPage() {
  const { user } = useUser();
  const { createBoard, deleteBoard, boards, loading } = useBoards();
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");
  const [isCreating, setIsCreating] = useState(false);
  const [newBoardTitle, setNewBoardTitle] = useState("");
  const [newBoardColor, setNewBoardColor] = useState("bg-blue-500");
  const [searchQuery, setSearchQuery] = useState("");
  const [activeMenu, setActiveMenu] = useState<string | null>(null);

  const colors = [
    "bg-blue-500",
    "bg-green-500",
    "bg-yellow-500",
    "bg-red-500",
    "bg-purple-500",
    "bg-pink-500",
    "bg-indigo-500",
    "bg-orange-500",
  ];

  const totalTasks = boards.reduce((sum) => sum + 0, 0);

  const recentActivity = boards.filter((board) => {
    const updatedAt = new Date(board.updated_at);
    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);
    return updatedAt > oneWeekAgo;
  }).length;

  const filteredBoards = boards.filter((board) =>
    board.title.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateBoard = async () => {
    if (!newBoardTitle.trim()) return;
    await createBoard({ title: newBoardTitle.trim(), color: newBoardColor });
    setNewBoardTitle("");
    setIsCreating(false);
  };

  const handleDeleteBoard = async (boardId: string, e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this board?")) {
      await deleteBoard(boardId);
    }
    setActiveMenu(null);
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#0a0a0f] flex items-center justify-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="flex flex-col items-center gap-4"
        >
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
            className="w-16 h-16 border-4 border-violet-500 border-t-transparent rounded-full"
          />
          <span className="text-white text-lg">Loading your workspace...</span>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#0a0a0f] relative overflow-hidden">
      {/* Background gradient */}
      <div className="fixed inset-0 bg-gradient-to-br from-violet-950/20 via-[#0a0a0f] to-fuchsia-950/20 pointer-events-none" />

      <Navbar />

      <main className="container mx-auto px-4 py-8 relative z-10">
        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
          className="mb-10"
        >
          <motion.div variants={fadeInUp} className="mb-8">
            <h1 className="text-4xl md:text-5xl font-bold text-white mb-3">
              Welcome back,{" "}
              <span className="bg-gradient-to-r from-violet-400 via-fuchsia-400 to-pink-400 bg-clip-text text-transparent">
                {user?.firstName ?? user?.emailAddresses[0]?.emailAddress?.split("@")[0] ?? "there"}
              </span>
              ! 👋
            </h1>
            <p className="text-gray-400 text-lg">
              Here&apos;s what&apos;s happening with your projects today.
            </p>
          </motion.div>

          <motion.div
            variants={fadeInUp}
            className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8"
          >
            {[
              { label: "Total Boards", value: boards.length, icon: "layers", color: "from-blue-500 to-cyan-500" },
              { label: "Total Tasks", value: totalTasks, icon: "target", color: "from-violet-500 to-fuchsia-500" },
              { label: "Active Projects", value: boards.length, icon: "trending", color: "from-emerald-500 to-teal-500" },
              { label: "This Week", value: recentActivity, icon: "clock", color: "from-orange-500 to-amber-500" },
            ].map((stat, index) => (
              <motion.div
                key={index}
                whileHover={{ scale: 1.02, y: -2 }}
                className="p-6 rounded-2xl bg-white/5 backdrop-blur-xl border border-white/10 hover:bg-white/10 hover:border-white/20 transition-all duration-300"
              >
                <div className="flex items-center justify-between mb-3">
                  <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${stat.color} flex items-center justify-center shadow-lg shadow-black/20`}>
                    {stat.icon === "layers" && <Layers className="h-6 w-6 text-white" />}
                    {stat.icon === "target" && <Target className="h-6 w-6 text-white" />}
                    {stat.icon === "trending" && <TrendingUp className="h-6 w-6 text-white" />}
                    {stat.icon === "clock" && <Clock className="h-6 w-6 text-white" />}
                  </div>
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-gray-400 text-sm">{stat.label}</div>
              </motion.div>
            ))}
          </motion.div>
        </motion.div>

        <motion.div
          initial="initial"
          animate="animate"
          variants={staggerContainer}
        >
          <motion.div
            variants={fadeInUp}
            className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-6 gap-4"
          >
            <div>
              <h2 className="text-2xl md:text-3xl font-bold text-white mb-1">Your Boards</h2>
              <p className="text-gray-400">Manage your projects and tasks</p>
            </div>

              <div className="flex items-center gap-3">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-500" />
                  <Input
                    placeholder="Search boards..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="pl-10 w-56 bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:bg-white/10 focus:border-violet-500/50 rounded-xl transition-all"
                  />
                </div>

                <div className="flex items-center gap-1 p-1 rounded-xl bg-white/5 border border-white/10">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("grid")}
                    className={viewMode === "grid" ? "bg-violet-600/80 text-white" : "text-gray-400 hover:text-white"}
                  >
                    <Grid3x3 className="h-4 w-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="sm"
                    onClick={() => setViewMode("list")}
                    className={viewMode === "list" ? "bg-violet-600/80 text-white" : "text-gray-400 hover:text-white"}
                  >
                    <List className="h-4 w-4" />
                  </Button>
                </div>

                <motion.div whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }}>
                  <Button
                    onClick={() => setIsCreating(true)}
                    className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-pink-500 shadow-lg shadow-fuchsia-500/25 rounded-xl"
                  >
                    <Plus className="mr-2 h-5 w-5" /> Create Board
                  </Button>
                </motion.div>
              </div>
          </motion.div>

          <AnimatePresence>
            {isCreating && (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 bg-black/70 backdrop-blur-md flex items-center justify-center z-50 p-4"
                onClick={() => setIsCreating(false)}
              >
                <motion.div
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.9, opacity: 0 }}
                  className="w-full max-w-md p-8 rounded-3xl bg-[#0f0f1a] border border-white/10 shadow-2xl shadow-black/50"
                  onClick={(e) => e.stopPropagation()}
                >
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-600 to-fuchsia-600 flex items-center justify-center">
                      <Plus className="h-5 w-5 text-white" />
                    </div>
                    <h3 className="text-2xl font-bold text-white">Create New Board</h3>
                  </div>
                  <div className="space-y-5">
                    <div>
                      <Label className="text-gray-300 mb-2 block text-sm">Board Title</Label>
                      <Input
                        value={newBoardTitle}
                        onChange={(e) => setNewBoardTitle(e.target.value)}
                        placeholder="Enter board title..."
                        className="bg-white/5 border-white/10 text-white placeholder:text-gray-500 focus:bg-white/10 focus:border-violet-500/50 rounded-xl h-12"
                        onKeyPress={(e) => e.key === "Enter" && handleCreateBoard()}
                      />
                    </div>
                    <div>
                      <Label className="text-gray-300 mb-2 block text-sm">Color</Label>
                      <div className="flex gap-2">
                        {colors.map((color) => (
                          <button
                            key={color}
                            onClick={() => setNewBoardColor(color)}
                            className={`w-10 h-10 rounded-xl ${color} ${
                              newBoardColor === color ? "ring-4 ring-violet-500/50 ring-offset-2 ring-offset-[#0f0f1a]" : ""
                            } transition-all duration-200`}
                          />
                        ))}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-3 mt-8">
                    <Button
                      variant="outline"
                      onClick={() => setIsCreating(false)}
                      className="flex-1 border-white/20 text-gray-300 hover:bg-white/10 rounded-xl"
                    >
                      Cancel
                    </Button>
                    <Button
                      onClick={handleCreateBoard}
                      disabled={!newBoardTitle.trim()}
                      className="flex-1 bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-pink-500 rounded-xl shadow-lg shadow-fuchsia-500/25"
                    >
                      Create Board
                    </Button>
                  </div>
                </motion.div>
              </motion.div>
            )}
          </AnimatePresence>

          {filteredBoards.length === 0 ? (
            <motion.div variants={fadeInUp} className="text-center py-20">
              <motion.div
                animate={{ y: [0, -15, 0] }}
                transition={{ duration: 3, repeat: Infinity }}
                className="w-28 h-28 mx-auto mb-6 rounded-3xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center border border-white/10"
              >
                <Trello className="h-14 w-14 text-violet-400" />
              </motion.div>
              <h3 className="text-2xl font-bold text-white mb-3">
                {boards.length === 0 ? "No boards yet" : "No results found"}
              </h3>
              <p className="text-gray-400 mb-8">
                {boards.length === 0
                  ? "Create your first board to get started"
                  : `No boards matching "${searchQuery}"`}
              </p>
              {boards.length === 0 && (
                <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
                  <Button
                    size="lg"
                    onClick={() => setIsCreating(true)}
                    className="bg-gradient-to-r from-violet-600 via-fuchsia-600 to-pink-600 hover:from-violet-500 hover:via-fuchsia-500 hover:to-pink-500 shadow-lg shadow-fuchsia-500/25 rounded-xl"
                  >
                    <Plus className="mr-2 h-5 w-5" /> Create Your First Board
                  </Button>
                </motion.div>
              )}
            </motion.div>
          ) : viewMode === "grid" ? (
            <motion.div
              variants={staggerContainer}
              className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5"
            >
              {filteredBoards.map((board) => (
                <motion.div
                  key={board.id}
                  variants={fadeInUp}
                  whileHover={{ scale: 1.02, y: -4 }}
                  className="relative group"
                >
                  <Link href={`/boards/${board.id}`}>
                    <Card className="bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer h-64 overflow-hidden rounded-2xl">
                      <div className={`h-32 ${board.color || "bg-gradient-to-br from-violet-600 to-fuchsia-600"}`} />
                      <div className="absolute top-4 right-4 w-20 h-20 bg-gradient-to-bl from-white/20 to-transparent rounded-bl-full" />
                      <CardContent className="p-5 relative">
                        <div className="flex items-start justify-between">
                          <div className="flex-1 min-w-0 pr-8">
                            <h3 className="font-semibold text-white text-lg mb-1 truncate">{board.title}</h3>
                            <p className="text-gray-400 text-sm">
                              Updated {new Date(board.updated_at).toLocaleDateString()}
                            </p>
                          </div>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="opacity-0 group-hover:opacity-100 transition-all duration-200 text-gray-400 hover:text-white bg-white/5 hover:bg-white/10 rounded-xl"
                            onClick={(e) => {
                              e.preventDefault();
                              setActiveMenu(activeMenu === board.id ? null : board.id);
                            }}
                          >
                            <MoreHorizontal className="h-5 w-5" />
                          </Button>
                        </div>
                        <div className="flex items-center gap-2 mt-4">
                          <Badge variant="secondary" className="bg-white/10 text-gray-300 hover:bg-white/20 border-0 rounded-lg">
                            <CheckSquare className="h-3 w-3 mr-1.5" /> 0 tasks
                          </Badge>
                          <Badge variant="secondary" className="bg-white/10 text-gray-300 hover:bg-white/20 border-0 rounded-lg">
                            <Users className="h-3 w-3 mr-1.5" /> 1 member
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                  <AnimatePresence>
                    {activeMenu === board.id && (
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: -10 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: -10 }}
                        className="absolute top-4 right-16 z-20 w-52 p-2 rounded-2xl bg-[#0f0f1a] border border-white/10 shadow-2xl shadow-black/50"
                      >
                        <Button variant="ghost" className="w-full justify-start text-gray-300 hover:bg-white/10 hover:text-white rounded-xl" onClick={() => setActiveMenu(null)}>
                          <Edit className="h-4 w-4 mr-2" /> Edit Board
                        </Button>
                        <Button variant="ghost" className="w-full justify-start text-gray-300 hover:bg-white/10 hover:text-white rounded-xl" onClick={() => setActiveMenu(null)}>
                          <Copy className="h-4 w-4 mr-2" /> Duplicate
                        </Button>
                        <Button variant="ghost" className="w-full justify-start text-red-400 hover:bg-red-500/10 rounded-xl" onClick={(e) => handleDeleteBoard(board.id, e)}>
                          <Trash2 className="h-4 w-4 mr-2" /> Delete Board
                        </Button>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </motion.div>
              ))}
              <motion.div
                variants={fadeInUp}
                whileHover={{ scale: 1.02, y: -4 }}
                className="relative group cursor-pointer"
                onClick={() => setIsCreating(true)}
              >
                <Card className="bg-white/5 backdrop-blur-xl border-2 border-dashed border-white/20 hover:border-violet-500/50 transition-all cursor-pointer h-64 flex items-center justify-center rounded-2xl">
                  <CardContent className="flex flex-col items-center justify-center">
                    <motion.div whileHover={{ rotate: 90 }} transition={{ duration: 0.2 }} className="w-16 h-16 rounded-2xl bg-gradient-to-br from-violet-500/20 to-fuchsia-500/20 flex items-center justify-center mb-4 border border-white/10">
                      <Plus className="h-8 w-8 text-violet-400" />
                    </motion.div>
                    <p className="text-gray-400 group-hover:text-white transition-all duration-300 font-medium">Create New Board</p>
                  </CardContent>
                </Card>
              </motion.div>
            </motion.div>
          ) : (
            <motion.div variants={staggerContainer} className="space-y-3">
              {filteredBoards.map((board) => (
                <motion.div key={board.id} variants={fadeInUp} whileHover={{ x: 10 }}>
                  <Link href={`/boards/${board.id}`}>
                    <Card className="bg-white/5 backdrop-blur-xl border-white/10 hover:bg-white/10 hover:border-white/20 transition-all cursor-pointer rounded-2xl">
                      <CardContent className="p-5 flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className={`w-12 h-12 rounded-xl ${board.color || "bg-gradient-to-br from-violet-600 to-fuchsia-600"}`} />
                          <div>
                            <h3 className="font-semibold text-white text-lg">{board.title}</h3>
                            <p className="text-gray-400 text-sm">Last updated {new Date(board.updated_at).toLocaleDateString()}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-4">
                          <Badge variant="secondary" className="bg-white/10 text-gray-300 border-0 rounded-xl">0 tasks</Badge>
                          <ChevronRight className="h-5 w-5 text-gray-400" />
                        </div>
                      </CardContent>
                    </Card>
                  </Link>
                </motion.div>
              ))}
            </motion.div>
          )}
        </motion.div>
      </main>

      <Footer />
    </div>
  );
}

function Layers({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" /></svg>;
}

function Target({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>;
}

function TrendingUp({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 3" /></svg>;
}

function CheckSquare({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4" /></svg>;
}

function Users({ className }: { className?: string }) {
  return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z" /></svg>;
}
