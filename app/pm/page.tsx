"use client";

import React, { useReducer, createContext, useContext } from "react";
import { motion } from "framer-motion";
import {
  Layout, BarChart3, Plus, Search,
  FolderKanban, CalendarDays, MoreHorizontal,
  Menu, Home, FolderPlus
} from 'lucide-react';

const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};

const isOverdue = (dueDate) => dueDate && new Date(dueDate) < new Date();

const PRIORITY_COLORS = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-emerald-500',
};

const DEMO_USERS = [
  { id: 'u1', name: 'John Smith', color: '#3B82F6', online: true },
  { id: 'u2', name: 'Sarah Johnson', color: '#8B5CF6', online: true },
  { id: 'u3', name: 'Mike Wilson', color: '#10B981', online: false },
  { id: 'u4', name: 'Emily Davis', color: '#F59E0B', online: true },
];

const DEMO_PROJECTS = [
  { id: 'p1', name: 'Website Redesign', color: '#3B82F6', starred: true },
  { id: 'p2', name: 'Mobile App v2.0', color: '#8B5CF6', starred: true },
];

const DEMO_BOARDS = [
  {
    id: 'b1', projectId: 'p1', name: 'Main Board',
    columns: [
      { id: 'c1', name: 'Backlog', color: '#64748B', tasks: [
        { id: 't1', title: 'User Research Interviews', priority: 'high', dueDate: '2024-04-15', assignees: ['u2'], tags: ['Research'], subtasks: [{id: 's1', title: 'Create guide', completed: true}], comments: 5, attachments: 2, completedSubtasks: 1, timeTracked: 0 },
        { id: 't2', title: 'Create Mood Board', priority: 'medium', dueDate: '2024-04-20', assignees: ['u4'], tags: ['Design'], subtasks: [], comments: 3, attachments: 5, completedSubtasks: 0, timeTracked: 0 },
      ]},
      { id: 'c2', name: 'To Do', color: '#3B82F6', tasks: [
        { id: 't3', title: 'Design System Components', priority: 'high', dueDate: '2024-04-10', assignees: ['u1', 'u4'], tags: ['Design', 'Frontend'], subtasks: [{id: 's5', title: 'Buttons', completed: true}, {id: 's6', title: 'Cards', completed: true}], comments: 12, attachments: 3, completedSubtasks: 2, timeTracked: 7200 },
        { id: 't4', title: 'Setup CI/CD Pipeline', priority: 'high', dueDate: '2024-04-05', assignees: ['u3'], tags: ['DevOps'], subtasks: [{id: 's9', title: 'GitHub Actions', completed: true}], comments: 8, attachments: 1, completedSubtasks: 1, timeTracked: 3600 },
      ]},
      { id: 'c3', name: 'In Progress', color: '#F59E0B', tasks: [
        { id: 't6', title: 'Homepage Redesign', priority: 'high', dueDate: '2024-04-01', assignees: ['u1', 'u4'], tags: ['Design', 'Frontend'], subtasks: [{id: 's12', title: 'Wireframe', completed: true}, {id: 's13', title: 'Mockup', completed: true}], comments: 15, attachments: 8, completedSubtasks: 2, timeTracked: 14400 },
      ]},
      { id: 'c4', name: 'Done', color: '#10B981', tasks: [
        { id: 't9', title: 'Project Kickoff', priority: 'medium', dueDate: '2024-02-15', assignees: ['u1', 'u2'], tags: ['Planning'], subtasks: [], comments: 18, attachments: 3, completedSubtasks: 0, timeTracked: 0 },
      ]},
    ]
  },
];

const initialState = {
  projects: DEMO_PROJECTS,
  boards: DEMO_BOARDS,
  currentProject: 'p1',
  currentBoard: 'b1',
  currentView: 'board',
  searchQuery: '',
  sidebarOpen: true,
};

const AppContext = createContext(null);

const Avatar = ({ user, size = 'md', showOnline = false }) => {
  const sizes = { sm: 'w-6 h-6 text-xs', md: 'w-8 h-8 text-sm', lg: 'w-10 h-10 text-base' };
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  
  return (
    <div className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg relative`}>
      {initials}
      {showOnline && user?.online && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-800" />
      )}
    </div>
  );
};

const ProgressBar = ({ value, max = 100, color = 'blue' }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  
  return (
    <div className="w-full">
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full ${color === 'emerald' ? 'bg-emerald-500' : 'bg-blue-500'} transition-all duration-500 ease-out`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

const TaskCard = ({ task, onClick }) => {
  const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      onClick={onClick}
      className="relative bg-slate-800/70 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4 cursor-pointer group hover:border-slate-600/50 transition-all duration-200"
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${PRIORITY_COLORS[task.priority]}`} />
      <div className="pl-3">
        <h4 className="text-white font-medium text-sm mb-2 group-hover:text-blue-300 transition-colors">{task.title}</h4>
        {totalSubtasks > 0 && <div className="mb-3"><ProgressBar value={completedSubtasks} max={totalSubtasks} color={completedSubtasks === totalSubtasks ? 'emerald' : 'blue'} /></div>}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {task.assignees?.length > 0 && (
              <div className="flex -space-x-2">
                {task.assignees.slice(0, 3).map((userId, i) => {
                  const user = DEMO_USERS.find(u => u.id === userId);
                  return <Avatar key={i} user={user} size="sm" showOnline />;
                })}
              </div>
            )}
          </div>
          {task.dueDate && (
            <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${isOverdue(task.dueDate) ? 'bg-red-500/20 text-red-400' : 'bg-slate-700/50 text-slate-400'}`}>
              <CalendarDays className="w-3 h-3" />
              {formatDate(task.dueDate)}
            </div>
          )}
        </div>
      </div>
    </motion.div>
  );
};

const Column = ({ column, tasks, onTaskClick }) => {
  return (
    <div className="flex-shrink-0 w-80 flex flex-col max-h-full rounded-2xl border bg-slate-800/30 border-slate-700/50">
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: column.color }} />
          <h3 className="font-semibold text-white">{column.name}</h3>
          <span className="px-2 py-0.5 rounded-full bg-slate-700/50 text-slate-400 text-xs">{tasks.length}</span>
        </div>
        <button className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white">
          <MoreHorizontal className="w-4 h-4" />
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3">
        {tasks.map(task => <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />)}
        {tasks.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-700/50 flex items-center justify-center"><Plus className="w-5 h-5" /></div>
            <p className="text-sm">No tasks yet</p>
          </div>
        )}
      </div>
      <div className="p-3 border-t border-slate-700/50">
        <button className="w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-medium bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white transition-all">
          <Plus className="w-4 h-4" />Add Task
        </button>
      </div>
    </div>
  );
};

const BoardView = ({ onTaskClick }) => {
  const context = useContext(AppContext);
  const state = context?.state || initialState;
  const currentBoard = state.boards?.find(b => b.id === state.currentBoard);
  
  if (!currentBoard) return null;
  
  return (
    <div className="h-full overflow-x-auto">
      <div className="flex gap-4 p-6 min-w-max">
        {currentBoard?.columns.map(column => (
          <Column key={column.id} column={column} tasks={column.tasks} onTaskClick={onTaskClick} />
        ))}
        <div className="flex-shrink-0 w-80">
          <button className="w-full h-16 rounded-2xl border-2 border-dashed border-slate-700/50 flex items-center justify-center gap-2 text-slate-500 hover:text-slate-300 hover:border-slate-600/50 transition-all">
            <Plus className="w-5 h-5" />Add New Column
          </button>
        </div>
      </div>
    </div>
  );
};

const AnalyticsView = ({ tasks }) => {
  const totalTasks = tasks.length;
  
  return (
    <div className="p-6 overflow-auto h-full">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4">
          <p className="text-slate-400 text-sm">Total Tasks</p>
          <p className="text-3xl font-bold text-white mt-1">{totalTasks}</p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4">
          <p className="text-slate-400 text-sm">In Progress</p>
          <p className="text-3xl font-bold text-amber-400 mt-1">{tasks.filter(t => t.subtasks?.length > 0 && t.completedSubtasks < t.subtasks.length).length}</p>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4">
          <p className="text-slate-400 text-sm">Completed</p>
          <p className="text-3xl font-bold text-emerald-400 mt-1">{tasks.filter(t => t.subtasks?.length > 0 && t.completedSubtasks === t.subtasks.length).length}</p>
        </div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Tasks by Priority</h3>
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-red-500" />
              <span className="text-slate-400 text-sm w-24">High</span>
              <div className="flex-1 h-4 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-red-500" style={{ width: '40%' }} />
              </div>
              <span className="text-slate-400 text-sm">{tasks.filter(t => t.priority === 'high').length}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-amber-500" />
              <span className="text-slate-400 text-sm w-24">Medium</span>
              <div className="flex-1 h-4 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-amber-500" style={{ width: '35%' }} />
              </div>
              <span className="text-slate-400 text-sm">{tasks.filter(t => t.priority === 'medium').length}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-3 h-3 rounded-full bg-emerald-500" />
              <span className="text-slate-400 text-sm w-24">Low</span>
              <div className="flex-1 h-4 bg-slate-700 rounded-full overflow-hidden">
                <div className="h-full bg-emerald-500" style={{ width: '25%' }} />
              </div>
              <span className="text-slate-400 text-sm">{tasks.filter(t => t.priority === 'low').length}</span>
            </div>
          </div>
        </div>
        
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6">
          <h3 className="text-lg font-semibold text-white mb-4">Team Workload</h3>
          <div className="space-y-3">
            {DEMO_USERS.map(user => {
              const userTasks = tasks.filter(t => t.assignees?.includes(user.id)).length;
              const pct = totalTasks > 0 ? (userTasks / totalTasks) * 100 : 0;
              return (
                <div key={user.id} className="flex items-center gap-3">
                  <Avatar user={user} size="md" />
                  <div className="flex-1">
                    <div className="flex justify-between text-sm mb-1">
                      <span className="text-white">{user.name}</span>
                      <span className="text-slate-400">{userTasks} tasks</span>
                    </div>
                    <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
                      <div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: pct + '%' }} />
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
};

const Sidebar = () => {
  const context = useContext(AppContext);
  const state = context?.state || initialState;
  const dispatch = context?.dispatch || (() => {});
  
  if (!state || !state.projects) return null;
  
  return (
    <div className={`fixed left-0 top-0 bottom-0 z-40 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 transition-all duration-300 flex flex-col ${state.sidebarOpen ? 'w-64' : 'w-0 -translate-x-full'}`}>
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg">
            <Layout className="w-5 h-5 text-white" />
          </div>
          {state.sidebarOpen && (
            <div>
              <h1 className="font-bold text-white">ProjectFlow</h1>
              <p className="text-xs text-slate-500">Project Manager</p>
            </div>
          )}
        </div>
      </div>
      {state.sidebarOpen && (
        <div className="p-4">
          <button className="w-full py-2.5 px-4 bg-gradient-to-r from-blue-500 to-blue-600 text-white rounded-lg text-sm font-medium shadow-lg">
            <FolderPlus className="w-4 h-4 inline mr-2" />
            New Project
          </button>
        </div>
      )}
      <nav className="flex-1 overflow-y-auto p-2">
        <div className="mb-4">
          <button className="w-full flex items-center gap-3 px-3 py-2 rounded-lg text-slate-400 hover:bg-slate-800 hover:text-white">
            <Home className="w-5 h-5" />
            <span className="font-medium">Dashboard</span>
          </button>
        </div>
        <div>
          <p className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Projects</p>
          {state.projects.map(project => (
            <button
              key={project.id}
              onClick={() => dispatch({ type: 'SET_PROJECT', payload: project.id })}
              className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${state.currentProject === project.id ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}
            >
              <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: project.color + '20' }}>
                <FolderKanban className="w-4 h-4" style={{ color: project.color }} />
              </div>
              <span className="font-medium truncate">{project.name}</span>
            </button>
          ))}
        </div>
      </nav>
    </div>
  );
};

const Header = () => {
  const { state, dispatch } = useContext(AppContext);
  const currentProject = state.projects.find(p => p.id === state.currentProject);
  
  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <button onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white">
          <Menu className="w-5 h-5" />
        </button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: currentProject?.color + '20' }}>
            <FolderKanban className="w-4 h-4" style={{ color: currentProject?.color }} />
          </div>
          <div>
            <h1 className="font-semibold text-white">{currentProject?.name}</h1>
            <p className="text-xs text-slate-500">{state.boards.filter(b => b.projectId === state.currentProject).length} boards</p>
          </div>
        </div>
      </div>
      <div className="flex-1 max-w-xl mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input
            type="text"
            placeholder="Search tasks..."
            value={state.searchQuery}
            onChange={(e) => dispatch({ type: 'SET_SEARCH', payload: e.target.value })}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500"
          />
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-slate-800/50 rounded-lg p-1">
          <button
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'board' })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${state.currentView === 'board' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
          >
            <Layout className="w-4 h-4" />
            <span className="hidden xl:inline">Board</span>
          </button>
          <button
            onClick={() => dispatch({ type: 'SET_VIEW', payload: 'analytics' })}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${state.currentView === 'analytics' ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}
          >
            <BarChart3 className="w-4 h-4" />
            <span className="hidden xl:inline">Analytics</span>
          </button>
        </div>
        <div className="w-px h-8 bg-slate-700 mx-2" />
        <div className="flex items-center gap-2 pl-2 border-l border-slate-700">
          <Avatar user={DEMO_USERS[0]} size="md" showOnline />
          <div className="hidden lg:block">
            <p className="text-sm font-medium text-white">{DEMO_USERS[0].name}</p>
            <p className="text-xs text-slate-500">Admin</p>
          </div>
        </div>
      </div>
    </header>
  );
};

const MainContent = () => {
  const { state } = useContext(AppContext);
  const currentBoard = state.boards.find(b => b.id === state.currentBoard);
  const allTasks = currentBoard?.columns.flatMap(c => c.tasks) || [];
  
  const renderView = () => {
    switch (state.currentView) {
      case 'board':
        return <BoardView onTaskClick={() => {}} />;
      case 'analytics':
        return <AnalyticsView tasks={allTasks} />;
      default:
        return <BoardView onTaskClick={() => {}} />;
    }
  };
  
  return (
    <main className="flex-1 overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950/20 to-slate-900">
      <Header />
      <div className="h-[calc(100%-64px)] overflow-hidden">
        {renderView()}
      </div>
    </main>
  );
};

export default function ProjectManagementPage() {
  const [state, dispatch] = useReducer((state, action) => {
    switch (action.type) {
      case 'SET_VIEW':
        return { ...state, currentView: action.payload };
      case 'SET_PROJECT':
        const newBoard = state.boards.find(b => b.projectId === action.payload);
        return { ...state, currentProject: action.payload, currentBoard: newBoard?.id || null };
      case 'SET_SEARCH':
        return { ...state, searchQuery: action.payload };
      case 'TOGGLE_SIDEBAR':
        return { ...state, sidebarOpen: !state.sidebarOpen };
      default:
        return state;
    }
  }, initialState);
  
  return (
    <AppContext.Provider value={{ state, dispatch }}>
      <div className="flex h-screen bg-slate-900 text-white overflow-hidden">
        <Sidebar />
        <MainContent />
      </div>
    </AppContext.Provider>
  );
}
