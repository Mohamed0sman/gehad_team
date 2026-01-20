import React, { useState, useEffect, useCallback, useMemo, createContext, useContext, useReducer, useRef } from 'react';
import { 
  Layout, List, Calendar, BarChart3, Plus, Search, Filter, MoreHorizontal, 
  Star, Archive, Trash2, Edit, Copy, GripVertical, Clock, CalendarDays,
  CheckSquare, Users, MessageSquare, Paperclip, Tag, AlertCircle, ChevronDown,
  ChevronRight, X, Save, RotateCcw, Bell, Settings, HelpCircle, Menu, Home, 
  FolderKanban, Folder, Smile, GripHorizontal, Check, XCircle, Eye, Target,
  TrendingUp, Activity, PieChart as PieChartIcon
} from 'lucide-react';

// Utility functions
const generateId = () => Math.random().toString(36).substr(2, 9);
const formatDate = (date) => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
};
const isOverdue = (dueDate) => dueDate && new Date(dueDate) < new Date();
const isDueSoon = (dueDate) => {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  const now = new Date();
  const diff = due - now;
  return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
};

// Colors
const PRIORITY_COLORS = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-emerald-500',
};

const TAG_COLORS = [
  'bg-purple-500', 'bg-pink-500', 'bg-blue-500', 'bg-cyan-500',
  'bg-teal-500', 'bg-green-500', 'bg-lime-500', 'bg-yellow-500',
  'bg-orange-500', 'bg-red-500', 'bg-indigo-500', 'bg-violet-500'
];

// Demo Data
const DEMO_USERS = [
  { id: 'u1', name: 'John Doe', color: '#8B5CF6' },
  { id: 'u2', name: 'Sarah Wilson', color: '#EC4899' },
  { id: 'u3', name: 'Mike Johnson', color: '#10B981' },
  { id: 'u4', name: 'Emily Brown', color: '#F59E0B' },
  { id: 'u5', name: 'Alex Chen', color: '#3B82F6' },
];

const DEMO_TAGS = [
  { id: 't1', name: 'Design', color: 'bg-purple-500' },
  { id: 't2', name: 'Frontend', color: 'bg-blue-500' },
  { id: 't3', name: 'Backend', color: 'bg-green-500' },
  { id: 't4', name: 'Mobile', color: 'bg-pink-500' },
  { id: 't5', name: 'Marketing', color: 'bg-orange-500' },
  { id: 't6', name: 'Research', color: 'bg-cyan-500' },
  { id: 't7', name: 'Documentation', color: 'bg-slate-500' },
  { id: 't8', name: 'DevOps', color: 'bg-indigo-500' },
];

const DEMO_PROJECTS = [
  { id: 'p1', name: 'Website Redesign', color: '#8B5CF6', starred: true },
  { id: 'p2', name: 'Mobile App', color: '#EC4899', starred: true },
  { id: 'p3', name: 'Marketing Campaign', color: '#10B981', starred: false },
  { id: 'p4', name: 'Infrastructure', color: '#F59E0B', starred: false },
];

const DEMO_BOARDS = [
  {
    id: 'b1', projectId: 'p1',
    columns: [
      {
        id: 'c1', name: 'Backlog', color: '#64748B', tasks: [
          { id: 't1', title: 'Conduct user research interviews', description: 'Interview 10 potential users', priority: 'high', dueDate: '2024-04-15', assignees: ['u2'], tags: ['Research'], subtasks: [{id: 's1', title: 'Create guide', completed: true}, {id: 's2', title: 'Schedule interviews', completed: false}], comments: 3, attachments: 1, completedSubtasks: 1 },
          { id: 't2', title: 'Create mood board', description: 'Collect design inspiration', priority: 'medium', dueDate: '2024-04-20', assignees: ['u2'], tags: ['Design'], subtasks: [], comments: 1, attachments: 2, completedSubtasks: 0 },
        ]
      },
      {
        id: 'c2', name: 'To Do', color: '#3B82F6', limit: 5, tasks: [
          { id: 't3', title: 'Design system components', description: 'Create reusable UI library', priority: 'high', dueDate: '2024-04-10', assignees: ['u1'], tags: ['Design', 'Frontend'], subtasks: [{id: 's3', title: 'Buttons', completed: true}, {id: 's4', title: 'Cards', completed: false}], comments: 5, attachments: 0, completedSubtasks: 1 },
          { id: 't4', title: 'Setup CI/CD pipeline', description: 'Configure automated deployment', priority: 'high', dueDate: '2024-04-05', assignees: ['u3'], tags: ['DevOps'], subtasks: [], comments: 2, attachments: 0, completedSubtasks: 0 },
          { id: 't5', title: 'Write API documentation', description: 'Document all REST endpoints', priority: 'low', dueDate: '2024-04-25', assignees: ['u3'], tags: ['Documentation'], subtasks: [], comments: 0, attachments: 1, completedSubtasks: 0 },
        ]
      },
      {
        id: 'c3', name: 'In Progress', color: '#F59E0B', limit: 3, tasks: [
          { id: 't6', title: 'Homepage redesign', description: 'Create new homepage layout', priority: 'high', dueDate: '2024-04-01', assignees: ['u1', 'u2'], tags: ['Design', 'Frontend'], subtasks: [{id: 's5', title: 'Wireframe', completed: true}, {id: 's6', title: 'Mockup', completed: true}, {id: 's7', title: 'Implementation', completed: false}], comments: 8, attachments: 3, completedSubtasks: 2 },
          { id: 't7', title: 'User authentication', description: 'Implement OAuth2 login', priority: 'high', dueDate: '2024-04-03', assignees: ['u3'], tags: ['Backend', 'Security'], subtasks: [{id: 's8', title: 'OAuth setup', completed: true}, {id: 's9', title: 'JWT', completed: false}], comments: 4, attachments: 0, completedSubtasks: 1 },
        ]
      },
      {
        id: 'c4', name: 'Review', color: '#8B5CF6', limit: 2, tasks: [
          { id: 't8', title: 'Landing page A/B test', description: 'Run comparison test', priority: 'medium', dueDate: '2024-03-28', assignees: ['u4'], tags: ['Marketing', 'Research'], subtasks: [], comments: 6, attachments: 2, completedSubtasks: 0 },
        ]
      },
      {
        id: 'c5', name: 'Done', color: '#10B981', tasks: [
          { id: 't9', title: 'Project kickoff', description: 'Initial team alignment', priority: 'medium', dueDate: '2024-02-15', assignees: ['u1'], tags: ['Planning'], subtasks: [], comments: 12, attachments: 1, completedSubtasks: 0 },
          { id: 't10', title: 'Requirements gathering', description: 'Collect all requirements', priority: 'high', dueDate: '2024-02-28', assignees: ['u1', 'u2'], tags: ['Planning'], subtasks: [{id: 's10', title: 'Interviews', completed: true}, {id: 's11', title: 'Document', completed: true}], comments: 15, attachments: 4, completedSubtasks: 2 },
          { id: 't11', title: 'Architecture design', description: 'Define system architecture', priority: 'high', dueDate: '2024-03-05', assignees: ['u1', 'u3'], tags: ['Architecture'], subtasks: [], comments: 8, attachments: 3, completedSubtasks: 0 },
        ]
      },
    ]
  },
  {
    id: 'b2', projectId: 'p2',
    columns: [
      { id: 'c6', name: 'Backlog', color: '#64748B', tasks: [{ id: 't12', title: 'Push notifications', description: 'FCM integration', priority: 'medium', dueDate: '2024-04-20', assignees: ['u3'], tags: ['Mobile', 'Backend'], subtasks: [], comments: 2, attachments: 0, completedSubtasks: 0 }] },
      { id: 'c7', name: 'In Development', color: '#F59E0B', limit: 4, tasks: [{ id: 't13', title: 'Onboarding flow', description: 'Create smooth onboarding', priority: 'high', dueDate: '2024-04-08', assignees: ['u1', 'u4'], tags: ['Mobile', 'UX'], subtasks: [{id: 's12', title: 'Welcome', completed: true}, {id: 's13', title: 'Tutorial', completed: false}], comments: 7, attachments: 1, completedSubtasks: 1 }] },
      { id: 'c8', name: 'Testing', color: '#8B5CF6', limit: 3, tasks: [{ id: 't14', title: 'Payment gateway', description: 'Stripe integration', priority: 'high', dueDate: '2024-04-02', assignees: ['u3'], tags: ['Mobile', 'Payments'], subtasks: [], comments: 9, attachments: 2, completedSubtasks: 0 }] },
      { id: 'c9', name: 'Released', color: '#10B981', tasks: [{ id: 't15', title: 'App store submission', description: 'Submit to App Store', priority: 'high', dueDate: '2024-03-20', assignees: ['u1', 'u3', 'u4'], tags: ['Mobile', 'Release'], subtasks: [{id: 's14', title: 'Screenshots', completed: true}, {id: 's15', title: 'Description', completed: true}, {id: 's16', title: 'Privacy', completed: true}], comments: 20, attachments: 5, completedSubtasks: 3 }] },
    ]
  },
];

// Context
const AppContext = createContext(null);

// Reducer
const initialState = {
  projects: DEMO_PROJECTS,
  boards: DEMO_BOARDS,
  currentProject: 'p1',
  currentBoard: 'b1',
  currentView: 'board',
  searchQuery: '',
  filters: { priority: [], tags: [] },
  sidebarOpen: true,
  darkMode: true,
  taskModalOpen: false,
  selectedTask: null,
  notifications: [],
  undoStack: [],
  redoStack: [],
};

function appReducer(state, action) {
  const pushUndo = (prevState, newState) => ({
    ...newState,
    undoStack: [...prevState.undoStack.slice(-19), prevState],
    redoStack: [],
  });

  switch (action.type) {
    case 'SET_VIEW':
      return { ...state, currentView: action.payload };
    case 'SET_PROJECT':
      const newBoard = state.boards.find(b => b.projectId === action.payload);
      return { ...state, currentProject: action.payload, currentBoard: newBoard?.id || null };
    case 'SET_BOARD':
      return { ...state, currentBoard: action.payload };
    case 'SET_SEARCH':
      return { ...state, searchQuery: action.payload };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'OPEN_TASK_MODAL':
      return { ...state, taskModalOpen: true, selectedTask: action.payload };
    case 'CLOSE_TASK_MODAL':
      return { ...state, taskModalOpen: false, selectedTask: null };
    case 'TOGGLE_PROJECT_STAR':
      return {
        ...state,
        projects: state.projects.map(p => p.id === action.payload ? { ...p, starred: !p.starred } : p),
      };
    case 'ADD_TASK': {
      const { columnId, task } = action.payload;
      return pushUndo(state, {
        ...state,
        boards: state.boards.map(b => 
          b.id === state.currentBoard 
            ? { ...b, columns: b.columns.map(c => 
                c.id === columnId 
                  ? { ...c, tasks: [...c.tasks, { ...task, id: generateId(), createdAt: new Date().toISOString(), comments: 0, attachments: 0, completedSubtasks: 0 }] }
                  : c
              ) }
            : b
        ),
        notifications: [...state.notifications, { id: generateId(), message: 'Task created', type: 'success' }]
      });
    }
    case 'UPDATE_TASK': {
      const { taskId, updates } = action.payload;
      return pushUndo(state, {
        ...state,
        boards: state.boards.map(b => 
          b.id === state.currentBoard 
            ? { ...b, columns: b.columns.map(c => ({
                ...c,
                tasks: c.tasks.map(t => t.id === taskId ? { ...t, ...updates } : t)
              })) }
            : b
        ),
      });
    }
    case 'DELETE_TASK': {
      return pushUndo(state, {
        ...state,
        boards: state.boards.map(b => 
          b.id === state.currentBoard 
            ? { ...b, columns: b.columns.map(c => ({
                ...c,
                tasks: c.tasks.filter(t => t.id !== action.payload)
              })) }
            : b
        ),
      });
    }
    case 'MOVE_TASK': {
      const { taskId, sourceColumnId, destColumnId, newIndex } = action.payload;
      return pushUndo(state, {
        ...state,
        boards: state.boards.map(b => {
          if (b.id !== state.currentBoard) return b;
          let task = null;
          const columns = b.columns.map(c => {
            const columnTasks = c.tasks.filter(t => {
              if (t.id === taskId) { task = t; return false; }
              return true;
            });
            return { ...c, tasks: columnTasks };
          });
          if (!task) return b;
          return {
            ...b,
            columns: columns.map(c => {
              if (c.id === destColumnId) {
                const tasks = [...c.tasks];
                tasks.splice(newIndex, 0, task);
                return { ...c, tasks };
              }
              return c;
            })
          };
        }),
      });
    }
    case 'TOGGLE_SUBTASK': {
      const { taskId, subtaskId } = action.payload;
      return pushUndo(state, {
        ...state,
        boards: state.boards.map(b => 
          b.id === state.currentBoard 
            ? { ...b, columns: b.columns.map(c => ({
                ...c,
                tasks: c.tasks.map(t => {
                  if (t.id !== taskId) return t;
                  const subtasks = t.subtasks?.map(s => 
                    s.id === subtaskId ? { ...s, completed: !s.completed } : s
                  ) || [];
                  const completedSubtasks = subtasks.filter(s => s.completed).length;
                  return { ...t, subtasks, completedSubtasks };
                })
              })) }
            : b
        ),
      });
    }
    case 'ADD_SUBTASK': {
      const { taskId, subtask } = action.payload;
      return pushUndo(state, {
        ...state,
        boards: state.boards.map(b => 
          b.id === state.currentBoard 
            ? { ...b, columns: b.columns.map(c => ({
                ...c,
                tasks: c.tasks.map(t => 
                  t.id === taskId 
                    ? { ...t, subtasks: [...(t.subtasks || []), { ...subtask, id: generateId() }] }
                    : t
                )
              })) }
            : b
        ),
      });
    }
    case 'UNDO':
      if (state.undoStack.length === 0) return state;
      return {
        ...state.undoStack[state.undoStack.length - 1],
        undoStack: state.undoStack.slice(0, -1),
        redoStack: [...state.redoStack, state],
      };
    case 'REDO':
      if (state.redoStack.length === 0) return state;
      return {
        ...state.redoStack[state.redoStack.length - 1],
        redoStack: state.redoStack.slice(0, -1),
        undoStack: [...state.undoStack, state],
      };
    case 'REMOVE_NOTIFICATION':
      return { ...state, notifications: state.notifications.filter(n => n.id !== action.payload) };
    default:
      return state;
  }
}

// Components
const Button = ({ children, onClick, variant = 'primary', size = 'md', className = '', disabled = false, icon: Icon }) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 shadow-lg shadow-purple-500/25',
    secondary: 'bg-slate-700/50 text-white hover:bg-slate-700 border border-slate-600',
    ghost: 'text-slate-300 hover:bg-slate-700/50 hover:text-white',
    danger: 'bg-red-600 text-white hover:bg-red-700',
  };
  const sizes = { sm: 'px-3 py-1.5 text-sm', md: 'px-4 py-2 text-sm', lg: 'px-6 py-3 text-base' };
  
  return (
    <button onClick={onClick} disabled={disabled} className={`${baseStyles} ${variants[variant]} ${sizes[size]} ${className}`}>
      {Icon && <Icon className="w-4 h-4" />}
      {children}
    </button>
  );
};

const Badge = ({ children, color = 'slate', size = 'sm' }) => {
  const colors = {
    slate: 'bg-slate-700/50 text-slate-300', purple: 'bg-purple-500/20 text-purple-300',
    emerald: 'bg-emerald-500/20 text-emerald-300', amber: 'bg-amber-500/20 text-amber-300',
    red: 'bg-red-500/20 text-red-300',
  };
  const sizes = { sm: 'px-2 py-0.5 text-xs', md: 'px-3 py-1 text-sm' };
  return <span className={`inline-flex items-center rounded-full border ${colors[color]} ${sizes[size]}`}>{children}</span>;
};

const Avatar = ({ user, size = 'md' }) => {
  const sizes = { sm: 'w-6 h-6 text-xs', md: 'w-8 h-8 text-sm', lg: 'w-10 h-10 text-base' };
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  return (
    <div className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold bg-gradient-to-br from-violet-500 to-purple-600 text-white shadow-lg`} title={user?.name}>
      {initials}
    </div>
  );
};

const ProgressBar = ({ value, max = 100, color = 'purple', showLabel = false }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const colors = { purple: 'bg-gradient-to-r from-violet-500 to-purple-500', emerald: 'bg-gradient-to-r from-emerald-500 to-green-500', amber: 'bg-gradient-to-r from-amber-500 to-yellow-500' };
  return (
    <div className="w-full">
      {showLabel && <div className="flex justify-between text-xs text-slate-400 mb-1"><span>Progress</span><span>{Math.round(percentage)}%</span></div>}
      <div className="h-2 bg-slate-700 rounded-full overflow-hidden">
        <div className={`h-full ${colors[color]} transition-all duration-500 ease-out`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

// Task Card
const TaskCard = ({ task, onClick }) => {
  const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  
  return (
    <motion.div
      layout initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2, boxShadow: '0 10px 40px -10px rgba(139, 92, 246, 0.3)' }}
      onClick={onClick}
      className="relative bg-slate-800/70 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4 cursor-pointer group hover:border-slate-600/50 transition-all"
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${PRIORITY_COLORS[task.priority]}`} />
      <div className="pl-3">
        {task.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {task.tags.slice(0, 3).map((tagName, i) => {
              const tag = DEMO_TAGS.find(t => t.name === tagName);
              return <span key={i} className={`${tag?.color || 'bg-slate-600'} px-2 py-0.5 rounded-full text-xs text-white`}>{tagName}</span>;
            })}
          </div>
        )}
        <h4 className="text-white font-medium text-sm mb-2 group-hover:text-purple-300 transition-colors">{task.title}</h4>
        {totalSubtasks > 0 && <div className="mb-3"><ProgressBar value={completedSubtasks} max={totalSubtasks} color={completedSubtasks === totalSubtasks ? 'emerald' : 'purple'} /></div>}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {task.assignees?.length > 0 && (
              <div className="flex -space-x-2">
                {task.assignees.slice(0, 3).map((userId, i) => {
                  const user = DEMO_USERS.find(u => u.id === userId);
                  return <Avatar key={i} user={user} size="sm" />;
                })}
              </div>
            )}
            <div className="flex items-center gap-2 text-slate-500">
              {task.comments > 0 && <span className="flex items-center gap-1 text-xs"><MessageSquare className="w-3 h-3" />{task.comments}</span>}
              {task.attachments > 0 && <span className="flex items-center gap-1 text-xs"><Paperclip className="w-3 h-3" />{task.attachments}</span>}
            </div>
          </div>
          {task.dueDate && (
            <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${isOverdue(task.dueDate) ? 'bg-red-500/20 text-red-400' : isDueSoon(task.dueDate) && !isOverdue(task.dueDate) ? 'bg-amber-500/20 text-amber-400' : 'bg-slate-700/50 text-slate-400'}`}>
              <CalendarDays className="w-3 h-3" />{formatDate(task.dueDate)}
            </div>
          )}
        </div>
      </div>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <button className="p-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-600 text-slate-400 hover:text-white"><Edit className="w-3.5 h-3.5" /></button>
        <button className="p-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-600 text-slate-400 hover:text-white"><Copy className="w-3.5 h-3.5" /></button>
      </div>
    </motion.div>
  );
};

// Column Component
const Column = ({ column, tasks, onAddTask, onTaskClick }) => {
  const atLimit = column.limit && tasks.length >= column.limit;
  
  return (
    <div className="flex-shrink-0 w-80 flex flex-col max-h-full rounded-2xl bg-slate-800/30 border border-slate-700/50 transition-all">
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: column.color }} />
          <h3 className="font-semibold text-white">{column.name}</h3>
          <Badge color="slate">{tasks.length}{column.limit ? `/${column.limit}` : ''}</Badge>
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white"><Plus className="w-4 h-4" /></button>
          <button className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white"><MoreHorizontal className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {tasks.map(task => <TaskCard key={task.id} task={task} onClick={() => onTaskClick(task)} />)}
        {tasks.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-700/50 flex items-center justify-center"><Plus className="w-5 h-5" /></div>
            <p className="text-sm">No tasks yet</p>
            <button onClick={() => onAddTask(column.id)} className="text-xs text-purple-400 hover:text-purple-300 mt-1">Add a task</button>
          </div>
        )}
        {atLimit && <div className="text-center py-2 text-amber-400 text-xs">⚠️ Column limit reached</div>}
      </div>
      <div className="p-3 border-t border-slate-700/50">
        <button onClick={() => onAddTask(column.id)} disabled={atLimit} className={`w-full py-2.5 rounded-xl flex items-center justify-center gap-2 text-sm font-medium transition-all ${atLimit ? 'bg-slate-700/30 text-slate-500 cursor-not-allowed' : 'bg-slate-700/50 text-slate-300 hover:bg-slate-700 hover:text-white'}`}>
          <Plus className="w-4 h-4" />Add Task
        </button>
      </div>
    </div>
  );
};

// Board View
const BoardView = ({ tasks, onAddTask, onTaskClick }) => {
  const { state, dispatch } = useContext(AppContext);
  const currentBoard = state.boards.find(b => b.id === state.currentBoard);
  
  return (
    <div className="h-full overflow-x-auto">
      <div className="flex gap-4 p-6 min-w-max">
        {currentBoard?.columns.map(column => (
          <Column key={column.id} column={column} tasks={tasks.filter(t => t.columnId === column.id || column.tasks.find(ct => ct.id === t.id))} onAddTask={onAddTask} onTaskClick={onTaskClick} />
        ))}
        <div className="flex-shrink-0 w-80">
          <button onClick={() => dispatch({ type: 'OPEN_TASK_MODAL', payload: { mode: 'createColumn' } })} className="w-full h-16 rounded-2xl border-2 border-dashed border-slate-700/50 flex items-center justify-center gap-2 text-slate-500 hover:text-slate-300 hover:border-slate-600/50 transition-all">
            <Plus className="w-5 h-5" />Add New Column
          </button>
        </div>
      </div>
    </div>
  );
};

// List View
const ListView = ({ tasks, onTaskClick }) => {
  const sortedTasks = [...tasks].sort((a, b) => { const p = { high: 0, medium: 1, low: 2 }; return p[a.priority] - p[b.priority]; });
  
  return (
    <div className="p-6">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700/30 border-b border-slate-700/50">
            <tr>
              <th className="text-left p-4 text-slate-400 font-medium text-sm">Task</th>
              <th className="text-left p-4 text-slate-400 font-medium text-sm">Status</th>
              <th className="text-left p-4 text-slate-400 font-medium text-sm">Priority</th>
              <th className="text-left p-4 text-slate-400 font-medium text-sm">Assignees</th>
              <th className="text-left p-4 text-slate-400 font-medium text-sm">Due Date</th>
              <th className="text-left p-4 text-slate-400 font-medium text-sm">Progress</th>
            </tr>
          </thead>
          <tbody>
            {sortedTasks.map(task => {
              const column = state?.boards?.find(b => b.id === state.currentBoard)?.columns.find(c => c.tasks.some(ct => ct.id === task.id));
              return (
                <tr key={task.id} onClick={() => onTaskClick(task)} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors cursor-pointer">
                  <td className="p-4"><div><h4 className="text-white font-medium">{task.title}</h4>{task.description && <p className="text-slate-500 text-sm truncate max-w-xs">{task.description}</p>}</div></td>
                  <td className="p-4"><Badge color="slate">{column?.name || 'Unknown'}</Badge></td>
                  <td className="p-4"><span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[task.priority]} text-white`}>{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span></td>
                  <td className="p-4"><div className="flex -space-x-2">{task.assignees?.slice(0, 3).map((uid, i) => <Avatar key={i} user={DEMO_USERS.find(u => u.id === uid)} size="sm" />)}</div></td>
                  <td className="p-4">{task.dueDate && <span className={`text-sm ${isOverdue(task.dueDate) ? 'text-red-400' : isDueSoon(task.dueDate) ? 'text-amber-400' : 'text-slate-400'}`}>{formatDate(task.dueDate)}</span>}</td>
                  <td className="p-4 w-32"><ProgressBar value={task.completedSubtasks} max={task.subtasks?.length || 1} color={task.subtasks?.length && task.completedSubtasks === task.subtasks.length ? 'emerald' : 'purple'} /></td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};

// Calendar View
const CalendarView = ({ tasks }) => {
  const [currentDate, setCurrentDate] = useState(new Date());
  const { state } = useContext(AppContext);
  
  const getDaysInMonth = (date) => {
    const year = date.getFullYear();
    const month = date.getMonth();
    const firstDay = new Date(year, month, 1);
    const lastDay = new Date(year, month + 1, 0);
    return { daysInMonth: lastDay.getDate(), startingDay: firstDay.getDay(), year, month };
  };
  
  const { daysInMonth, startingDay, year, month } = getDaysInMonth(currentDate);
  const monthNames = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const dayNames = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
  
  const getTasksForDate = (day) => {
    const date = new Date(year, month, day);
    return tasks.filter(task => task.dueDate && new Date(task.dueDate).getDate() === day && new Date(task.dueDate).getMonth() === month && new Date(task.dueDate).getFullYear() === year);
  };
  
  const days = [...Array(startingDay).fill(null), ...Array(daysInMonth).keys().map(i => i + 1)];
  
  return (
    <div className="p-6 h-full">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden h-full flex flex-col">
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
          <h2 className="text-xl font-bold text-white">{monthNames[month]} {year}</h2>
          <div className="flex items-center gap-2">
            <button onClick={() => setCurrentDate(new Date(year, month - 1, 1))} className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white"><ChevronRight className="w-5 h-5 rotate-180" /></button>
            <button onClick={() => setCurrentDate(new Date())} className="px-3 py-1.5 rounded-lg bg-slate-700/50 text-slate-300 text-sm">Today</button>
            <button onClick={() => setCurrentDate(new Date(year, month + 1, 1))} className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white"><ChevronRight className="w-5 h-5" /></button>
          </div>
        </div>
        <div className="grid grid-cols-7 border-b border-slate-700/50">{dayNames.map(day => <div key={day} className="p-3 text-center text-slate-400 font-medium text-sm">{day}</div>)}</div>
        <div className="grid grid-cols-7 flex-1 overflow-auto">
          {days.map((day, index) => {
            const tasksForDate = day ? getTasksForDate(day) : [];
            const isToday = day === new Date().getDate() && month === new Date().getMonth() && year === new Date().getFullYear();
            return (
              <div key={index} className={`min-h-[100px] p-2 border-b border-r border-slate-700/30 ${!day ? 'bg-slate-800/30' : 'bg-slate-800/50'} ${isToday ? 'ring-2 ring-purple-500 inset-0' : ''}`}>
                {day && (<><span className={`text-sm font-medium mb-1 inline-block ${isToday ? 'text-purple-400' : 'text-slate-400'}`}>{day}</span><div className="space-y-1">{tasksForDate.slice(0, 3).map(task => <div key={task.id} className={`${PRIORITY_COLORS[task.priority]} px-2 py-0.5 rounded text-xs truncate text-white cursor-pointer`}>{task.title}</div>)}</div></>)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Analytics View
const AnalyticsView = ({ tasks }) => {
  const { state } = useContext(AppContext);
  const currentBoard = state.boards.find(b => b.id === state.currentBoard);
  const completedTasks = tasks.filter(t => { const col = currentBoard?.columns.find(c => c.tasks.some(ct => ct.id === t.id)); return col?.name === 'Done'; }).length;
  const inProgressTasks = tasks.filter(t => { const col = currentBoard?.columns.find(c => c.tasks.some(ct => ct.id === t.id)); return col?.name === 'In Progress'; }).length;
  const totalTasks = tasks.length;
  const completionRate = totalTasks > 0 ? Math.round((completedTasks / totalTasks) * 100) : 0;
  const overdueTasks = tasks.filter(t => t.dueDate && isOverdue(t.dueDate)).length;
  
  const priorityData = [
    { name: 'High', value: tasks.filter(t => t.priority === 'high').length },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length },
    { name: 'Low', value: tasks.filter(t => t.priority === 'low').length },
  ];
  
  const statusData = currentBoard?.columns.map(c => ({ name: c.name, value: c.tasks.length })) || [];
  
  return (
    <div className="p-6 overflow-auto h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4"><p className="text-slate-400 text-sm">Total Tasks</p><p className="text-3xl font-bold text-white mt-1">{totalTasks}</p></div>
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4"><p className="text-slate-400 text-sm">Completed</p><p className="text-3xl font-bold text-emerald-400 mt-1">{completedTasks}</p><ProgressBar value={completionRate} color="emerald" /></div>
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4"><p className="text-slate-400 text-sm">In Progress</p><p className="text-3xl font-bold text-amber-400 mt-1">{inProgressTasks}</p></div>
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4"><p className="text-slate-400 text-sm">Overdue</p><p className="text-3xl font-bold text-red-400 mt-1">{overdueTasks}</p></div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6"><h3 className="text-lg font-semibold text-white mb-4">Priority Distribution</h3>
          <div className="flex justify-center gap-4">{priorityData.map((item, i) => <div key={i} className="text-center"><div className={`w-12 h-12 rounded-full ${item.name === 'High' ? 'bg-red-500' : item.name === 'Medium' ? 'bg-amber-500' : 'bg-emerald-500'} mb-2`}></div><p className="text-slate-400 text-sm">{item.name}</p><p className="text-white font-bold">{item.value}</p></div>)}</div>
        </div>
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6"><h3 className="text-lg font-semibold text-white mb-4">Tasks by Status</h3>
          <div className="space-y-3">{statusData.map((item, i) => <div key={i} className="flex items-center gap-3"><span className="text-slate-400 text-sm w-24">{item.name}</span><div className="flex-1 h-4 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-violet-500 to-purple-500 transition-all" style={{ width: `${totalTasks > 0 ? (item.value / totalTasks) * 100 : 0}%` }} /></div><span className="text-slate-400 text-sm w-8">{item.value}</span></div>)}</div>
        </div>
      </div>
    </div>
  );
};

// Task Modal
const TaskModal = () => {
  const { state, dispatch } = useContext(AppContext);
  if (!state.taskModalOpen) return null;
  
  const handleClose = () => dispatch({ type: 'CLOSE_TASK_MODAL' });
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="relative w-full max-w-2xl bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50"><h2 className="text-xl font-bold text-white">Task Details</h2><button onClick={handleClose} className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button></div>
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)] space-y-6">
          <div><label className="block text-sm font-medium text-slate-300 mb-2">Title</label><input type="text" placeholder="Enter task title..." className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder:text-slate-500" /></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-2">Description</label><textarea placeholder="Add a detailed description..." rows={4} className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder:text-slate-500 resize-none" /></div>
          <div className="grid grid-cols-2 gap-4">
            <div><label className="block text-sm font-medium text-slate-300 mb-2">Priority</label><select className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white"><option value="high">🔴 High</option><option value="medium">🟡 Medium</option><option value="low">🟢 Low</option></select></div>
            <div><label className="block text-sm font-medium text-slate-300 mb-2">Due Date</label><input type="date" className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white" /></div>
          </div>
          <div><label className="block text-sm font-medium text-slate-300 mb-2">Assignees</label><div className="flex flex-wrap gap-2">{DEMO_USERS.map(user => <button key={user.id} className="flex items-center gap-2 px-3 py-2 rounded-xl border bg-slate-700/50 border-slate-600/50 text-slate-300 hover:bg-slate-700"><Avatar user={user} size="sm" /><span className="text-sm">{user.name}</span></button>)}</div></div>
          <div><label className="block text-sm font-medium text-slate-300 mb-2">Tags</label><div className="flex flex-wrap gap-2">{DEMO_TAGS.map(tag => <button key={tag.id} className="px-3 py-1.5 rounded-full text-xs font-medium bg-slate-700/50 text-slate-400 hover:bg-slate-700">{tag.name}</button>)}</div></div>
        </div>
        <div className="flex items-center justify-between p-4 border-t border-slate-700/50 bg-slate-800/50">
          <div className="flex items-center gap-2"><button className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400"><Paperclip className="w-5 h-5" /></button><button className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400"><MessageSquare className="w-5 h-5" /></button></div>
          <div className="flex items-center gap-2"><Button variant="ghost" onClick={handleClose}>Cancel</Button><Button variant="secondary"><Save className="w-4 h-4" />Save Task</Button></div>
        </div>
      </motion.div>
    </div>
  );
};

// Sidebar
const Sidebar = () => {
  const { state, dispatch } = useContext(AppContext);
  const starredProjects = state.projects.filter(p => p.starred);
  const otherProjects = state.projects.filter(p => !p.starred);
  
  return (
    <div className={`fixed left-0 top-0 bottom-0 z-40 bg-slate-900/95 backdrop-blur-xl border-r border-slate-800 transition-all duration-300 flex flex-col ${state.sidebarOpen ? 'w-64' : 'w-0 -translate-x-full lg:w-16 lg:translate-x-0'}`}>
      <div className="p-4 border-b border-slate-800">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-violet-500 to-purple-600 flex items-center justify-center shadow-lg shadow-purple-500/25"><Layout className="w-5 h-5 text-white" /></div>
          {state.sidebarOpen && <div><h1 className="font-bold text-white">TaskFlow</h1><p className="text-xs text-slate-500">Project Manager</p></div>}
        </div>
      </div>
      {state.sidebarOpen && <div className="p-4"><Button className="w-full" size="lg"><Plus className="w-5 h-5" />New Project</Button></div>}
      <nav className="flex-1 overflow-y-auto p-2">
        {state.sidebarOpen && (
          <div className="mb-4">
            <button onClick={() => dispatch({ type: 'SET_VIEW', payload: 'dashboard' })} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${state.currentView === 'dashboard' ? 'bg-purple-500/20 text-purple-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><Home className="w-5 h-5" /><span className="font-medium">Dashboard</span></button>
          </div>
        )}
        {state.sidebarOpen && starredProjects.length > 0 && (
          <div className="mb-4">
            <p className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Starred</p>
            {starredProjects.map(project => (
              <button key={project.id} onClick={() => dispatch({ type: 'SET_PROJECT', payload: project.id })} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${state.currentProject === project.id ? 'bg-purple-500/20 text-purple-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${project.color}20` }}><FolderKanban className="w-4 h-4" style={{ color: project.color }} /></div>
                {state.sidebarOpen && <span className="font-medium truncate">{project.name}</span>}
              </button>
            ))}
          </div>
        )}
        {state.sidebarOpen && (
          <div>
            <p className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Projects</p>
            {otherProjects.map(project => (
              <button key={project.id} onClick={() => dispatch({ type: 'SET_PROJECT', payload: project.id })} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${state.currentProject === project.id ? 'bg-purple-500/20 text-purple-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
                <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${project.color}20` }}><FolderKanban className="w-4 h-4" style={{ color: project.color }} /></div>
                {state.sidebarOpen && <span className="font-medium truncate">{project.name}</span>}
              </button>
            ))}
          </div>
        )}
      </nav>
    </div>
  );
};

// Header
const Header = () => {
  const { state, dispatch } = useContext(AppContext);
  const currentProject = state.projects.find(p => p.id === state.currentProject);
  
  return (
    <header className="h-16 bg-slate-900/80 backdrop-blur-xl border-b border-slate-800 flex items-center justify-between px-6 shrink-0">
      <div className="flex items-center gap-4">
        <button onClick={() => dispatch({ type: 'TOGGLE_SIDEBAR' })} className="p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"><Menu className="w-5 h-5" /></button>
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg flex items-center justify-center" style={{ backgroundColor: `${currentProject?.color}20` }}><FolderKanban className="w-4 h-4" style={{ color: currentProject?.color }} /></div>
          <div><h1 className="font-semibold text-white">{currentProject?.name}</h1><p className="text-xs text-slate-500">{state.boards.filter(b => b.projectId === state.currentProject).length} boards</p></div>
        </div>
      </div>
      <div className="flex-1 max-w-xl mx-8">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
          <input type="text" placeholder="Search tasks..." value={state.searchQuery} onChange={(e) => dispatch({ type: 'SET_SEARCH', payload: e.target.value })} className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500" />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs bg-slate-700 text-slate-400 rounded">⌘K</kbd>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-slate-800/50 rounded-lg p-1">
          {[{ id: 'board', icon: Layout }, { id: 'list', icon: List }, { id: 'calendar', icon: CalendarDays }, { id: 'analytics', icon: BarChart3 }].map(view => (
            <button key={view.id} onClick={() => dispatch({ type: 'SET_VIEW', payload: view.id })} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${state.currentView === view.id ? 'bg-purple-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}><view.icon className="w-4 h-4" /><span className="hidden xl:inline">{view.id.charAt(0).toUpperCase() + view.id.slice(1)}</span></button>
          ))}
        </div>
        <div className="w-px h-8 bg-slate-700 mx-2" />
        <button className="relative p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"><Bell className="w-5 h-5" /><span className="absolute top-1 right-1 w-2 h-2 bg-red-500 rounded-full" /></button>
        <div className="flex items-center gap-2 pl-2 border-l border-slate-700"><Avatar user={DEMO_USERS[0]} size="md" /><div className="hidden lg:block"><p className="text-sm font-medium text-white">{DEMO_USERS[0].name}</p><p className="text-xs text-slate-500">Admin</p></div></div>
      </div>
    </header>
  );
};

// Toast Container
const ToastContainer = ({ notifications, onClose }) => (
  <div className="fixed bottom-4 right-4 z-50 space-y-2">
    {notifications.slice(-5).map(notification => (
      <motion.div key={notification.id} initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm ${notification.type === 'success' ? 'bg-emerald-500/90 text-white' : ''} ${notification.type === 'error' ? 'bg-red-500/90 text-white' : ''}`}>
        <span className="flex-1 text-sm font-medium">{notification.message}</span>
        <button onClick={() => onClose(notification.id)} className="p-1 hover:bg-white/20 rounded"><X className="w-4 h-4" /></button>
      </motion.div>
    ))}
  </div>
);

// Main Content
const MainContent = () => {
  const { state, dispatch } = useContext(AppContext);
  const currentBoard = state.boards.find(b => b.id === state.currentBoard);
  const allTasks = currentBoard?.columns.flatMap(c => c.tasks.map(t => ({ ...t, columnId: c.id }))) || [];
  
  const filteredTasks = allTasks.filter(task => {
    if (state.searchQuery) {
      const query = state.searchQuery.toLowerCase();
      if (!task.title.toLowerCase().includes(query) && !task.description?.toLowerCase().includes(query)) return false;
    }
    return true;
  });
  
  const handleTaskClick = (task) => dispatch({ type: 'OPEN_TASK_MODAL', payload: { ...task, mode: 'edit' } });
  
  const renderView = () => {
    switch (state.currentView) {
      case 'board': return <BoardView tasks={filteredTasks} onAddTask={() => dispatch({ type: 'OPEN_TASK_MODAL', payload: { mode: 'create' } })} onTaskClick={handleTaskClick} />;
      case 'list': return <ListView tasks={filteredTasks} onTaskClick={handleTaskClick} />;
      case 'calendar': return <CalendarView tasks={filteredTasks} />;
      case 'analytics': return <AnalyticsView tasks={filteredTasks} />;
      default: return <BoardView tasks={filteredTasks} onAddTask={() => {}} onTaskClick={handleTaskClick} />;
    }
  };
  
  return (
    <main className="flex-1 overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-slate-800">
      <Header />
      <div className="h-[calc(100%-64px)] overflow-hidden">{renderView()}</div>
      <TaskModal />
    </main>
  );
};

// Main App
const ProjectManagementApp = () => {
  const [state, dispatch] = useReducer(appReducer, initialState);
  const contextValue = useMemo(() => ({ state, dispatch }), [state, dispatch]);
  
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'z') {
        e.preventDefault();
        if (e.shiftKey) dispatch({ type: 'REDO' });
        else dispatch({ type: 'UNDO' });
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);
  
  useEffect(() => {
    state.notifications.forEach(notification => {
      setTimeout(() => dispatch({ type: 'REMOVE_NOTIFICATION', payload: notification.id }), 4000);
    });
  }, [state.notifications]);
  
  return (
    <AppContext.Provider value={contextValue}>
      <div className="flex h-screen bg-slate-900 text-white overflow-hidden">
        <Sidebar />
        <MainContent />
        <ToastContainer notifications={state.notifications} onClose={(id) => dispatch({ type: 'REMOVE_NOTIFICATION', payload: id })} />
      </div>
    </AppContext.Provider>
  );
};

export default ProjectManagementApp;
