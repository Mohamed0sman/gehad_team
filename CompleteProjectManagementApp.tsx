"use client";

import React, { useState, useEffect, useCallback, useMemo, createContext, useContext, useReducer, useRef } from 'react';
import { motion } from 'framer-motion';
import { 
  Layout, List, Calendar, BarChart3, Plus, Search, Filter, MoreHorizontal, 
  Star, Archive, Trash2, Edit, Copy, GripVertical, Clock, CalendarDays,
  CheckSquare, Users, MessageSquare, Paperclip, Tag, AlertCircle, ChevronDown,
  ChevronRight, X, Save, RotateCcw, Bell, Settings, HelpCircle, Menu, Home, 
  FolderKanban, Folder, Smile, GripHorizontal, Check, XCircle, Eye, Target,
  TrendingUp, Activity, PieChart as PieChartIcon, Hash, Send, Reply,
  Heart, Share2, Download, Upload, RefreshCw, ZoomIn, ZoomOut,
  Grid, Columns, Rows, Sun, Moon, LogOut, User, Building2, Building,
  Crown, Rocket, Sparkles, Wand2, Zap, FolderPlus, MoreVertical,
  ChevronUp, GripVertical as GripV, Play, Pause, StopCircle, FileText,
  Link2, ExternalLink, Monitor, Smartphone, Tablet, Mail, Calendar as CalIcon,
  Clock as ClockIcon, Timer, Percent, BarChart2, LineChart,
  PieChart, AreaChart, TrendingDown, CheckCircle2,
  Circle, Square, Triangle, Diamond, Star as StarIcon, Heart as HeartIcon
} from 'lucide-react';

// Utility functions
const generateId = () => Math.random().toString(36).substr(2, 9);
const formatDate = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  return new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
};
const formatDateTime = (date: Date | string | null | undefined): string => {
  if (!date) return '';
  return new Date(date).toLocaleString('en-US', { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};
const isOverdue = (dueDate: Date | string | null | undefined): boolean => !!(dueDate && new Date(dueDate) < new Date());
const isDueSoon = (dueDate: Date | string | null | undefined): boolean => {
  if (!dueDate) return false;
  const due = new Date(dueDate);
  const now = new Date();
  const diff = due.getTime() - now.getTime();
  return diff > 0 && diff < 3 * 24 * 60 * 60 * 1000;
};
const isTodayDate = (date: Date | string | null | undefined): boolean => {
  if (!date) return false;
  const d = new Date(date);
  const now = new Date();
  return d.getDate() === now.getDate() && d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
};

// Blue color palette
const COLORS = {
  primary: '#3B82F6',
  primaryLight: '#60A5FA',
  primaryDark: '#2563EB',
  primaryGlow: 'rgba(59, 130, 246, 0.5)',
  secondary: '#8B5CF6',
  success: '#10B981',
  warning: '#F59E0B',
  danger: '#EF4444',
  info: '#06B6D4',
};

const PRIORITY_COLORS = {
  high: 'bg-red-500',
  medium: 'bg-amber-500',
  low: 'bg-emerald-500',
};

const TAG_COLORS = [
  'bg-blue-500', 'bg-indigo-500', 'bg-violet-500', 'bg-purple-500',
  'bg-pink-500', 'bg-rose-500', 'bg-orange-500', 'bg-amber-500',
  'bg-yellow-500', 'bg-lime-500', 'bg-green-500', 'bg-emerald-500',
  'bg-teal-500', 'bg-cyan-500', 'bg-sky-500', 'bg-azure-500'
];

// Demo Data
const DEMO_USERS = [
  { id: 'u1', name: 'John Smith', email: 'john@company.com', role: 'admin', avatar: null, color: '#3B82F6', online: true },
  { id: 'u2', name: 'Sarah Johnson', email: 'sarah@company.com', role: 'manager', avatar: null, color: '#8B5CF6', online: true },
  { id: 'u3', name: 'Mike Wilson', email: 'mike@company.com', role: 'developer', avatar: null, color: '#10B981', online: false },
  { id: 'u4', name: 'Emily Davis', email: 'emily@company.com', role: 'designer', avatar: null, color: '#F59E0B', online: true },
  { id: 'u5', name: 'Alex Chen', email: 'alex@company.com', role: 'developer', avatar: null, color: '#EC4899', online: false },
  { id: 'u6', name: 'Lisa Park', email: 'lisa@company.com', role: 'qa', avatar: null, color: '#06B6D4', online: true },
];

const DEMO_TAGS = [
  { id: 't1', name: 'Design', color: 'bg-blue-500' },
  { id: 't2', name: 'Frontend', color: 'bg-indigo-500' },
  { id: 't3', name: 'Backend', color: 'bg-emerald-500' },
  { id: 't4', name: 'Mobile', color: 'bg-violet-500' },
  { id: 't5', name: 'Marketing', color: 'bg-pink-500' },
  { id: 't6', name: 'Research', color: 'bg-cyan-500' },
  { id: 't7', name: 'Documentation', color: 'bg-slate-500' },
  { id: 't8', name: 'DevOps', color: 'bg-orange-500' },
  { id: 't9', name: 'Security', color: 'bg-red-500' },
  { id: 't10', name: 'Analytics', color: 'bg-amber-500' },
  { id: 't11', name: 'Testing', color: 'bg-teal-500' },
  { id: 't12', name: 'UX', color: 'bg-purple-500' },
];

const DEMO_PROJECTS = [
  { id: 'p1', name: 'Website Redesign 2024', description: 'Complete overhaul of company website with modern UI/UX', color: '#3B82F6', icon: 'layout', starred: true, archived: false, createdAt: '2024-01-15', members: ['u1', 'u2', 'u3', 'u4'] },
  { id: 'p2', name: 'Mobile App v2.0', description: 'Native iOS and Android app for customer engagement', color: '#8B5CF6', icon: 'smartphone', starred: true, archived: false, createdAt: '2024-02-01', members: ['u1', 'u3', 'u5', 'u6'] },
  { id: 'p3', name: 'Marketing Campaign Q2', description: 'Spring marketing initiative and brand awareness', color: '#10B981', icon: 'trending', starred: false, archived: false, createdAt: '2024-03-10', members: ['u2', 'u4', 'u6'] },
  { id: 'p4', name: 'Infrastructure Upgrade', description: 'Cloud migration and server optimization', color: '#F59E0B', icon: 'server', starred: false, archived: false, createdAt: '2024-01-20', members: ['u1', 'u3', 'u5'] },
  { id: 'p5', name: 'Data Analytics Platform', description: 'Business intelligence and data visualization', color: '#06B6D4', icon: 'chart', starred: false, archived: false, createdAt: '2024-03-25', members: ['u1', 'u2', 'u3', 'u4', 'u5', 'u6'] },
];

const DEMO_COMMENTS = [
  { id: 'cm1', taskId: 't1', userId: 'u2', content: 'Great progress! Let\'s schedule a review meeting.', createdAt: '2024-03-10T14:30:00Z', likes: 2 },
  { id: 'cm2', taskId: 't1', userId: 'u1', content: 'Agreed! I\'ll set up the meeting for tomorrow.', createdAt: '2024-03-10T15:00:00Z', likes: 1 },
  { id: 'cm3', taskId: 't3', userId: 'u3', content: 'I\'ve completed the API documentation draft. Please review.', createdAt: '2024-03-11T09:15:00Z', likes: 3 },
  { id: 'cm4', taskId: 't6', userId: 'u4', content: 'New design mocks are ready for review!', createdAt: '2024-03-11T11:45:00Z', likes: 5 },
];

const DEMO_ACTIVITIES = [
  { id: 'a1', userId: 'u1', action: 'created', entityType: 'task', entityName: 'Homepage redesign', projectId: 'p1', createdAt: '2024-03-08T10:30:00Z' },
  { id: 'a2', userId: 'u2', action: 'completed', entityType: 'subtask', entityName: 'Wireframe', projectId: 'p1', createdAt: '2024-03-08T14:15:00Z' },
  { id: 'a3', userId: 'u3', action: 'commented on', entityType: 'task', entityName: 'User authentication', projectId: 'p1', createdAt: '2024-03-09T09:00:00Z' },
  { id: 'a4', userId: 'u1', action: 'moved', entityName: 'Design system components', projectId: 'p1', createdAt: '2024-03-09T11:45:00Z' },
  { id: 'a5', userId: 'u4', action: 'attached', entityType: 'file', entityName: 'mockup-v2.fig', projectId: 'p1', createdAt: '2024-03-10T08:20:00Z' },
  { id: 'a6', userId: 'u2', action: 'created', entityType: 'task', entityName: 'Landing page A/B test', projectId: 'p1', createdAt: '2024-03-10T09:30:00Z' },
  { id: 'a7', userId: 'u1', action: 'completed', entityName: 'Project kickoff', projectId: 'p1', createdAt: '2024-03-11T16:00:00Z' },
  { id: 'a8', userId: 'u3', action: 'uploaded', entityType: 'file', entityName: 'api-docs.pdf', projectId: 'p1', createdAt: '2024-03-11T17:30:00Z' },
];

const DEMO_BOARDS = [
  {
    id: 'b1', projectId: 'p1', name: 'Main Development',
    columns: [
      {
        id: 'c1', name: 'Backlog', color: '#64748B', limit: null, tasks: [
          { id: 't1', title: 'Conduct user research interviews', description: 'Interview 10 potential users about their pain points and needs for the new website design. Create detailed notes and synthesize findings.', priority: 'high', dueDate: '2024-04-15', assignees: ['u2'], tags: ['Research', 'Design'], subtasks: [{id: 's1', title: 'Create interview guide', completed: true}, {id: 's2', title: 'Recruit participants', completed: true}, {id: 's3', title: 'Schedule interviews', completed: false}, {id: 's4', title: 'Conduct interviews', completed: false}], comments: 5, attachments: 2, createdAt: '2024-03-01', completedSubtasks: 2, timeTracked: 0, isRecurring: false, recurrence: null },
          { id: 't2', title: 'Create mood board', description: 'Collect design inspiration and create visual mood board for the new website. Include competitor analysis.', priority: 'medium', dueDate: '2024-04-20', assignees: ['u4'], tags: ['Design', 'Research'], subtasks: [], comments: 3, attachments: 5, createdAt: '2024-03-05', completedSubtasks: 0, timeTracked: 0, isRecurring: false, recurrence: null },
          { id: 't20', title: 'Performance optimization audit', description: 'Conduct a comprehensive audit of current website performance and identify improvement areas.', priority: 'low', dueDate: '2024-05-01', assignees: ['u3'], tags: ['DevOps', 'Performance'], subtasks: [], comments: 1, attachments: 0, createdAt: '2024-03-12', completedSubtasks: 0, timeTracked: 0, isRecurring: false, recurrence: null },
        ]
      },
      {
        id: 'c2', name: 'To Do', color: '#3B82F6', limit: 5, tasks: [
          { id: 't3', title: 'Design system components', description: 'Create reusable UI component library including buttons, inputs, cards, modals, and navigation elements.', priority: 'high', dueDate: '2024-04-10', assignees: ['u1', 'u4'], tags: ['Design', 'Frontend'], subtasks: [{id: 's5', title: 'Buttons & inputs', completed: true}, {id: 's6', title: 'Cards & containers', completed: true}, {id: 's7', title: 'Modals & dialogs', completed: false}, {id: 's8', title: 'Navigation components', completed: false}], comments: 12, attachments: 3, createdAt: '2024-03-10', completedSubtasks: 2, timeTracked: 7200, isRecurring: false, recurrence: null },
          { id: 't4', title: 'Setup CI/CD pipeline', description: 'Configure automated testing and deployment pipeline using GitHub Actions.', priority: 'high', dueDate: '2024-04-05', assignees: ['u3'], tags: ['DevOps', 'Backend'], subtasks: [{id: 's9', title: 'Configure GitHub Actions', completed: true}, {id: 's10', title: 'Set up automated tests', completed: false}, {id: 's11', title: 'Configure deployment', completed: false}], comments: 8, attachments: 1, createdAt: '2024-03-12', completedSubtasks: 1, timeTracked: 3600, isRecurring: false, recurrence: null },
          { id: 't5', title: 'Write API documentation', description: 'Document all REST endpoints with examples, request/response schemas, and authentication guides.', priority: 'low', dueDate: '2024-04-25', assignees: ['u3', 'u5'], tags: ['Documentation', 'Backend'], subtasks: [], comments: 4, attachments: 2, createdAt: '2024-03-14', completedSubtasks: 0, timeTracked: 0, isRecurring: false, recurrence: null },
          { id: 't21', title: 'SEO optimization', description: 'Implement meta tags, sitemaps, and structured data for better search engine visibility.', priority: 'medium', dueDate: '2024-04-18', assignees: ['u2'], tags: ['Marketing', 'SEO'], subtasks: [], comments: 2, attachments: 0, createdAt: '2024-03-15', completedSubtasks: 0, timeTracked: 0, isRecurring: false, recurrence: null },
        ]
      },
      {
        id: 'c3', name: 'In Progress', color: '#F59E0B', limit: 3, tasks: [
          { id: 't6', title: 'Homepage redesign', description: 'Create new homepage layout with hero section, features showcase, and call-to-action buttons.', priority: 'high', dueDate: '2024-04-01', assignees: ['u1', 'u4'], tags: ['Design', 'Frontend'], subtasks: [{id: 's12', title: 'Wireframe creation', completed: true}, {id: 's13', title: 'High-fidelity mockup', completed: true}, {id: 's14', title: 'Responsive implementation', completed: false}, {id: 's15', title: 'Cross-browser testing', completed: false}], comments: 15, attachments: 8, createdAt: '2024-03-08', completedSubtasks: 2, timeTracked: 14400, isRecurring: false, recurrence: null },
          { id: 't7', title: 'User authentication system', description: 'Implement OAuth2 login with social providers (Google, GitHub, LinkedIn).', priority: 'high', dueDate: '2024-04-03', assignees: ['u3', 'u5'], tags: ['Backend', 'Security'], subtasks: [{id: 's16', title: 'OAuth2 setup', completed: true}, {id: 's17', title: 'JWT implementation', completed: false}, {id: 's18', title: 'Session management', completed: false}, {id: 's19', title: 'Security testing', completed: false}], comments: 9, attachments: 0, createdAt: '2024-03-06', completedSubtasks: 1, timeTracked: 10800, isRecurring: false, recurrence: null },
          { id: 't22', title: 'Mobile responsiveness', description: 'Ensure all pages are fully responsive and work seamlessly on mobile devices.', priority: 'high', dueDate: '2024-03-28', assignees: ['u1'], tags: ['Frontend', 'Mobile'], subtasks: [{id: 's20', title: 'Breakpoint testing', completed: true}, {id: 's21', title: 'Touch interaction testing', completed: false}, {id: 's22', title: 'Performance on mobile', completed: false}], comments: 6, attachments: 2, createdAt: '2024-03-16', completedSubtasks: 1, timeTracked: 5400, isRecurring: false, recurrence: null },
        ]
      },
      {
        id: 'c4', name: 'Review', color: '#8B5CF6', limit: 2, tasks: [
          { id: 't8', title: 'Landing page A/B test', description: 'Run comparison test on new landing page variants to determine best conversion rate.', priority: 'medium', dueDate: '2024-03-28', assignees: ['u2', 'u6'], tags: ['Marketing', 'Analytics'], subtasks: [], comments: 11, attachments: 4, createdAt: '2024-03-01', completedSubtasks: 0, timeTracked: 0, isRecurring: false, recurrence: null },
          { id: 't23', title: 'Accessibility audit', description: 'Conduct WCAG 2.1 AA compliance audit and fix any issues found.', priority: 'medium', dueDate: '2024-03-30', assignees: ['u4', 'u6'], tags: ['Design', 'Accessibility'], subtasks: [{id: 's23', title: 'Automated testing', completed: true}, {id: 's24', title: 'Manual testing', completed: false}, {id: 's25', title: 'Fix issues', completed: false}], comments: 7, attachments: 1, createdAt: '2024-03-17', completedSubtasks: 1, timeTracked: 7200, isRecurring: false, recurrence: null },
        ]
      },
      {
        id: 'c5', name: 'Done', color: '#10B981', tasks: [
          { id: 't9', title: 'Project kickoff meeting', description: 'Initial team alignment, scope discussion, and milestone planning.', priority: 'medium', dueDate: '2024-02-15', assignees: ['u1', 'u2'], tags: ['Planning'], subtasks: [], comments: 18, attachments: 3, createdAt: '2024-02-01', completedSubtasks: 0, timeTracked: 0, isRecurring: false, recurrence: null },
          { id: 't10', title: 'Requirements gathering', description: 'Collect and document all project requirements from stakeholders.', priority: 'high', dueDate: '2024-02-28', assignees: ['u1', 'u2', 'u4'], tags: ['Planning', 'Research'], subtasks: [{id: 's26', title: 'Stakeholder interviews', completed: true}, {id: 's27', title: 'Requirements document', completed: true}, {id: 's28', title: 'Approval sign-off', completed: true}], comments: 24, attachments: 8, createdAt: '2024-02-05', completedSubtasks: 3, timeTracked: 18000, isRecurring: false, recurrence: null },
          { id: 't11', title: 'Technical architecture design', description: 'Define system architecture, tech stack, and data models.', priority: 'high', dueDate: '2024-03-05', assignees: ['u1', 'u3', 'u5'], tags: ['Architecture', 'Backend'], subtasks: [], comments: 14, attachments: 5, createdAt: '2024-02-10', completedSubtasks: 0, timeTracked: 0, isRecurring: false, recurrence: null },
          { id: 't12', title: 'Development environment setup', description: 'Configure development tools, linting, and code standards.', priority: 'low', dueDate: '2024-03-01', assignees: ['u3'], tags: ['DevOps'], subtasks: [], comments: 6, attachments: 0, createdAt: '2024-02-20', completedSubtasks: 0, timeTracked: 0, isRecurring: false, recurrence: null },
          { id: 't13', title: 'Brand guidelines update', description: 'Update brand guidelines document with new color palette and typography.', priority: 'medium', dueDate: '2024-03-10', assignees: ['u4'], tags: ['Design', 'Brand'], subtasks: [], comments: 8, attachments: 3, createdAt: '2024-02-25', completedSubtasks: 0, timeTracked: 0, isRecurring: false, recurrence: null },
        ]
      },
    ]
  },
  {
    id: 'b2', projectId: 'p2', name: 'Development Sprint',
    columns: [
      { id: 'c6', name: 'Sprint Backlog', color: '#64748B', tasks: [
        { id: 't14', title: 'Push notification integration', description: 'Implement FCM for push notifications on both iOS and Android.', priority: 'high', dueDate: '2024-04-12', assignees: ['u3', 'u5'], tags: ['Mobile', 'Backend'], subtasks: [], comments: 4, attachments: 0, createdAt: '2024-03-15', completedSubtasks: 0, timeTracked: 0, isRecurring: false, recurrence: null },
        { id: 't15', title: 'Offline data sync', description: 'Implement local database and offline-first sync functionality.', priority: 'high', dueDate: '2024-04-20', assignees: ['u5'], tags: ['Mobile', 'Backend'], subtasks: [], comments: 6, attachments: 1, createdAt: '2024-03-16', completedSubtasks: 0, timeTracked: 0, isRecurring: false, recurrence: null },
      ]},
      { id: 'c7', name: 'In Development', color: '#F59E0B', limit: 4, tasks: [
        { id: 't16', title: 'Onboarding flow', description: 'Create smooth onboarding experience for new users with tutorial slides.', priority: 'high', dueDate: '2024-04-08', assignees: ['u1', 'u4'], tags: ['Mobile', 'UX'], subtasks: [{id: 's29', title: 'Welcome screen', completed: true}, {id: 's30', title: 'Tutorial slides', completed: true}, {id: 's31', title: 'Preference selection', completed: false}], comments: 11, attachments: 2, createdAt: '2024-03-10', completedSubtasks: 2, timeTracked: 12600, isRecurring: false, recurrence: null },
        { id: 't17', title: 'Dark mode implementation', description: 'Add full dark mode support throughout the app.', priority: 'medium', dueDate: '2024-04-15', assignees: ['u1'], tags: ['Mobile', 'Design'], subtasks: [], comments: 3, attachments: 0, createdAt: '2024-03-17', completedSubtasks: 0, timeTracked: 0, isRecurring: false, recurrence: null },
      ]},
      { id: 'c8', name: 'Testing', color: '#8B5CF6', limit: 3, tasks: [
        { id: 't18', title: 'Payment gateway integration', description: 'Stripe integration for in-app purchases and subscriptions.', priority: 'high', dueDate: '2024-04-02', assignees: ['u3'], tags: ['Mobile', 'Payments'], subtasks: [], comments: 14, attachments: 3, createdAt: '2024-03-05', completedSubtasks: 0, timeTracked: 0, isRecurring: false, recurrence: null },
        { id: 't19', title: 'Biometric authentication', description: 'Implement Face ID and Touch ID authentication.', priority: 'medium', dueDate: '2024-04-10', assignees: ['u5'], tags: ['Mobile', 'Security'], subtasks: [], comments: 5, attachments: 0, createdAt: '2024-03-18', completedSubtasks: 0, timeTracked: 0, isRecurring: false, recurrence: null },
      ]},
      { id: 'c9', name: 'Released', color: '#10B981', tasks: [
        { id: 't20', title: 'App store submission', description: 'Prepare and submit app to App Store and Google Play.', priority: 'high', dueDate: '2024-03-20', assignees: ['u1', 'u3', 'u4', 'u6'], tags: ['Mobile', 'Release'], subtasks: [{id: 's32', title: 'Screenshots & video', completed: true}, {id: 's33', title: 'App description', completed: true}, {id: 's34', title: 'Privacy policy', completed: true}, {id: 's35', title: 'Test flight setup', completed: true}], comments: 28, attachments: 8, createdAt: '2024-03-01', completedSubtasks: 4, timeTracked: 28800, isRecurring: false, recurrence: 'monthly' },
      ]},
    ]
  },
  {
    id: 'b3', projectId: 'p3', name: 'Campaign Board',
    columns: [
      { id: 'c10', name: 'Ideas', color: '#64748B', tasks: [
        { id: 't21', title: 'Social media giveaways', description: 'Plan Instagram and Twitter giveaway campaigns for Q2.', priority: 'medium', dueDate: '2024-04-15', assignees: ['u2'], tags: ['Social Media', 'Marketing'], subtasks: [], comments: 5, attachments: 0, createdAt: '2024-03-16', completedSubtasks: 0, timeTracked: 0, isRecurring: false, recurrence: null },
      ]},
      { id: 'c11', name: 'Planning', color: '#3B82F6', limit: 5, tasks: [
        { id: 't22', title: 'Email newsletter series', description: 'Create 5-part email drip campaign for lead nurturing.', priority: 'high', dueDate: '2024-04-12', assignees: ['u2', 'u4'], tags: ['Email', 'Marketing'], subtasks: [{id: 's36', title: 'Email 1 - Welcome', completed: true}, {id: 's37', title: 'Email 2 - Feature highlight', completed: true}, {id: 's38', title: 'Email 3 - Case study', completed: true}, {id: 's39', title: 'Email 4 - Testimonial', completed: false}], comments: 9, attachments: 4, createdAt: '2024-03-08', completedSubtasks: 3, timeTracked: 16200, isRecurring: false, recurrence: null },
      ]},
      { id: 'c12', name: 'In Progress', color: '#F59E0B', limit: 3, tasks: [
        { id: 't23', title: 'Blog content calendar', description: 'Plan and schedule Q2 blog posts for SEO and engagement.', priority: 'medium', dueDate: '2024-04-05', assignees: ['u4'], tags: ['Content', 'SEO'], subtasks: [], comments: 6, attachments: 2, createdAt: '2024-03-12', completedSubtasks: 0, timeTracked: 0, isRecurring: false, recurrence: null },
      ]},
      { id: 'c13', name: 'Published', color: '#10B981', tasks: [
        { id: 't24', title: 'Product launch press release', description: 'Draft and distribute press release for new feature launch.', priority: 'high', dueDate: '2024-03-25', assignees: ['u2'], tags: ['PR', 'Launch'], subtasks: [], comments: 15, attachments: 5, createdAt: '2024-03-01', completedSubtasks: 0, timeTracked: 0, isRecurring: false, recurrence: null },
        { id: 't25', title: 'Customer case study', description: 'Create detailed case study showcasing customer success story.', priority: 'medium', dueDate: '2024-03-20', assignees: ['u2', 'u4'], tags: ['Content', 'Marketing'], subtasks: [{id: 's40', title: 'Customer interview', completed: true}, {id: 's41', title: 'Write draft', completed: true}, {id: 's42', title: 'Design layout', completed: true}], comments: 12, attachments: 6, createdAt: '2024-03-05', completedSubtasks: 3, timeTracked: 21600, isRecurring: false, recurrence: null },
      ]},
    ]
  },
];

// Context
const AppContext = createContext(null);

// Reducer
const initialState = {
  projects: DEMO_PROJECTS,
  boards: DEMO_BOARDS,
  users: DEMO_USERS,
  tags: DEMO_TAGS,
  comments: DEMO_COMMENTS,
  activities: DEMO_ACTIVITIES,
  currentProject: 'p1',
  currentBoard: 'b1',
  currentView: 'board',
  searchQuery: '',
  filters: { priority: [], tags: [], assignees: [], dueDate: null, status: [] },
  sidebarOpen: true,
  darkMode: true,
  taskModalOpen: false,
  selectedTask: null,
  selectedProject: null,
  notifications: [],
  undoStack: [],
  redoStack: [],
  showOnboarding: false,
  bulkSelectedTasks: [],
  viewSettings: { compactMode: false, showCompletedSubtasks: true },
};

function appReducer(state, action) {
  const pushUndo = (prevState, newState) => ({
    ...newState,
    undoStack: [...prevState.undoStack.slice(-29), prevState],
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
    case 'SET_FILTERS':
      return { ...state, filters: { ...state.filters, ...action.payload } };
    case 'CLEAR_FILTERS':
      return { ...state, filters: { priority: [], tags: [], assignees: [], dueDate: null, status: [] } };
    case 'TOGGLE_SIDEBAR':
      return { ...state, sidebarOpen: !state.sidebarOpen };
    case 'TOGGLE_DARK_MODE':
      return { ...state, darkMode: !state.darkMode };
    case 'OPEN_TASK_MODAL':
      return { ...state, taskModalOpen: true, selectedTask: action.payload };
    case 'CLOSE_TASK_MODAL':
      return { ...state, taskModalOpen: false, selectedTask: null };
    case 'TOGGLE_PROJECT_STAR':
      return {
        ...state,
        projects: state.projects.map(p => p.id === action.payload ? { ...p, starred: !p.starred } : p),
      };
    case 'ADD_PROJECT':
      return pushUndo(state, {
        ...state,
        projects: [...state.projects, { ...action.payload, id: generateId(), createdAt: new Date().toISOString(), archived: false, starred: false }],
        notifications: [...state.notifications, { id: generateId(), message: 'Project created successfully', type: 'success' }]
      });
    case 'DELETE_PROJECT':
      return pushUndo(state, {
        ...state,
        projects: state.projects.filter(p => p.id !== action.payload),
        boards: state.boards.filter(b => b.projectId !== action.payload),
      });
    case 'ADD_TASK': {
      const { columnId, task } = action.payload;
      const newTask = { ...task, id: generateId(), createdAt: new Date().toISOString(), comments: 0, attachments: 0, completedSubtasks: 0, timeTracked: 0 };
      return pushUndo(state, {
        ...state,
        boards: state.boards.map(b => 
          b.id === state.currentBoard 
            ? { ...b, columns: b.columns.map(c => 
                c.id === columnId 
                  ? { ...c, tasks: [...c.tasks, newTask] }
                  : c
              ) }
            : b
        ),
        activities: [...state.activities, {
          id: generateId(), userId: 'u1', action: 'created', entityType: 'task', entityName: newTask.title, projectId: state.currentProject, createdAt: new Date().toISOString()
        }],
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
      const task = state.boards.find(b => b.id === state.currentBoard)?.columns.flatMap(c => c.tasks).find(t => t.id === action.payload);
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
        activities: [...state.activities, {
          id: generateId(), userId: 'u1', action: 'deleted', entityType: 'task', entityName: task?.title || 'task', projectId: state.currentProject, createdAt: new Date().toISOString()
        }],
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
            const tasks = c.tasks.filter(t => {
              if (t.id === taskId) { task = t; return false; }
              return true;
            });
            return { ...c, tasks };
          });
          if (!task) return b;
          const newTask = { ...task, updatedAt: new Date().toISOString() };
          return {
            ...b,
            columns: columns.map(c => {
              if (c.id === destColumnId) {
                const tasks = [...c.tasks];
                tasks.splice(newIndex, 0, newTask);
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
                  return { ...t, subtasks, completedSubtasks, updatedAt: new Date().toISOString() };
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
                    ? { ...t, subtasks: [...(t.subtasks || []), { ...subtask, id: generateId() }], updatedAt: new Date().toISOString() }
                    : t
                )
              })) }
            : b
        ),
      });
    }
    case 'ADD_COMMENT': {
      const { taskId, content } = action.payload;
      const comment = { id: generateId(), taskId, userId: 'u1', content, createdAt: new Date().toISOString(), likes: 0 };
      return {
        ...state,
        comments: [...state.comments, comment],
        boards: state.boards.map(b => 
          b.id === state.currentBoard 
            ? { ...b, columns: b.columns.map(c => ({
                ...c,
                tasks: c.tasks.map(t => t.id === taskId ? { ...t, comments: (t.comments || 0) + 1 } : t)
              })) }
            : b
        ),
        activities: [...state.activities, {
          id: generateId(), userId: 'u1', action: 'commented on', entityType: 'task', entityName: 'task', projectId: state.currentProject, createdAt: new Date().toISOString()
        }],
      };
    }
    case 'ADD_ACTIVITY':
      return {
        ...state,
        activities: [action.payload, ...state.activities].slice(0, 100),
      };
    case 'TOGGLE_BULK_SELECT':
      return {
        ...state,
        bulkSelectedTasks: state.bulkSelectedTasks.includes(action.payload)
          ? state.bulkSelectedTasks.filter(id => id !== action.payload)
          : [...state.bulkSelectedTasks, action.payload],
      };
    case 'CLEAR_BULK_SELECT':
      return { ...state, bulkSelectedTasks: [] };
    case 'UPDATE_TASK_TIME': {
      const { taskId, time } = action.payload;
      return {
        ...state,
        boards: state.boards.map(b => 
          b.id === state.currentBoard 
            ? { ...b, columns: b.columns.map(c => ({
                ...c,
                tasks: c.tasks.map(t => t.id === taskId ? { ...t, timeTracked: (t.timeTracked || 0) + time } : t)
              })) }
            : b
        ),
      };
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
    case 'SHOW_ONBOARDING':
      return { ...state, showOnboarding: true };
    case 'HIDE_ONBOARDING':
      return { ...state, showOnboarding: false };
    case 'UPDATE_VIEW_SETTINGS':
      return { ...state, viewSettings: { ...state.viewSettings, ...action.payload } };
    default:
      return state;
  }
}

// Components
const Button = ({ children, onClick, variant = 'primary', size = 'md', className = '', disabled = false, icon: Icon }) => {
  const baseStyles = 'inline-flex items-center justify-center font-medium transition-all duration-200 rounded-lg focus:outline-none disabled:opacity-50 disabled:cursor-not-allowed';
  const variants = {
    primary: 'bg-gradient-to-r from-blue-500 to-blue-600 text-white hover:from-blue-600 hover:to-blue-700 shadow-lg shadow-blue-500/25',
    secondary: 'bg-slate-700/50 text-white hover:bg-slate-700 border border-slate-600',
    ghost: 'text-slate-300 hover:bg-slate-700/50 hover:text-white',
    danger: 'bg-red-600 text-white hover:bg-red-700',
    success: 'bg-emerald-600 text-white hover:bg-emerald-700',
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
    slate: 'bg-slate-700/50 text-slate-300', blue: 'bg-blue-500/20 text-blue-300',
    purple: 'bg-purple-500/20 text-purple-300', emerald: 'bg-emerald-500/20 text-emerald-300',
    amber: 'bg-amber-500/20 text-amber-300', red: 'bg-red-500/20 text-red-300',
  };
  const sizes = { sm: 'px-2 py-0.5 text-xs', md: 'px-3 py-1 text-sm' };
  return <span className={`inline-flex items-center rounded-full border ${colors[color]} ${sizes[size]}`}>{children}</span>;
};

const Avatar = ({ user, size = 'md', showOnline = false }) => {
  const sizes = { sm: 'w-6 h-6 text-xs', md: 'w-8 h-8 text-sm', lg: 'w-10 h-10 text-base', xl: 'w-12 h-12 text-lg' };
  const initials = user?.name?.split(' ').map(n => n[0]).join('').toUpperCase() || '?';
  
  return (
    <div className={`${sizes[size]} rounded-full flex items-center justify-center font-semibold bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-lg relative`} title={user?.name}>
      {initials}
      {showOnline && user?.online && (
        <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-slate-800" />
      )}
    </div>
  );
};

const ProgressBar = ({ value, max = 100, color = 'blue', showLabel = false, height = 'h-2' }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const colors = {
    blue: 'bg-gradient-to-r from-blue-500 to-blue-400',
    emerald: 'bg-gradient-to-r from-emerald-500 to-green-500',
    amber: 'bg-gradient-to-r from-amber-500 to-yellow-500',
    red: 'bg-gradient-to-r from-red-500 to-rose-500',
  };
  
  return (
    <div className="w-full">
      {showLabel && <div className="flex justify-between text-xs text-slate-400 mb-1"><span>Progress</span><span>{Math.round(percentage)}%</span></div>}
      <div className={`${height} bg-slate-700 rounded-full overflow-hidden`}>
        <div className={`h-full ${colors[color]} transition-all duration-500 ease-out`} style={{ width: `${percentage}%` }} />
      </div>
    </div>
  );
};

const ProgressCircle = ({ value, max = 100, size = 60, strokeWidth = 6, color = '#3B82F6' }) => {
  const percentage = Math.min(100, Math.max(0, (value / max) * 100));
  const circumference = 2 * Math.PI * ((size - strokeWidth) / 2);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;
  
  return (
    <svg width={size} height={size} className="transform -rotate-90">
      <circle cx={size / 2} cy={size / 2} r={(size - strokeWidth) / 2} fill="none" stroke="#334155" strokeWidth={strokeWidth} />
      <circle cx={size / 2} cy={size / 2} r={(size - strokeWidth) / 2} fill="none" stroke={color} strokeWidth={strokeWidth} strokeDasharray={circumference} strokeDashoffset={strokeDashoffset} strokeLinecap="round" className="transition-all duration-500" />
    </svg>
  );
};

const Tooltip = ({ children, content }) => {
  const [show, setShow] = useState(false);
  
  return (
    <div className="relative" onMouseEnter={() => setShow(true)} onMouseLeave={() => setShow(false)}>
      {children}
      {show && (
        <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 px-2 py-1 bg-slate-800 text-white text-xs rounded whitespace-nowrap z-50 shadow-lg">
          {content}
          <div className="absolute top-full left-1/2 -translate-x-1/2 border-4 border-transparent border-t-slate-800" />
        </div>
      )}
    </div>
  );
};

const ToastContainer = ({ notifications, onClose }) => (
  <div className="fixed bottom-4 right-4 z-50 space-y-2">
    {notifications.slice(-5).map(notification => (
      <motion.div key={notification.id} initial={{ opacity: 0, y: 20, scale: 0.9 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, y: -20 }} className={`flex items-center gap-3 px-4 py-3 rounded-lg shadow-lg backdrop-blur-sm ${notification.type === 'success' ? 'bg-emerald-500/90 text-white' : ''} ${notification.type === 'error' ? 'bg-red-500/90 text-white' : ''} ${notification.type === 'warning' ? 'bg-amber-500/90 text-white' : ''} ${notification.type === 'info' ? 'bg-blue-500/90 text-white' : ''}`}>
        <span className="flex-1 text-sm font-medium">{notification.message}</span>
        <button onClick={() => onClose(notification.id)} className="p-1 hover:bg-white/20 rounded"><X className="w-4 h-4" /></button>
      </motion.div>
    ))}
  </div>
);

// Task Card Component
const TaskCard = ({ task, column, onClick, isDragging }) => {
  const completedSubtasks = task.subtasks?.filter(s => s.completed).length || 0;
  const totalSubtasks = task.subtasks?.length || 0;
  
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.9 }}
      whileHover={{ y: -2, boxShadow: '0 10px 40px -10px rgba(59, 130, 246, 0.3)' }}
      onClick={onClick}
      className={`
        relative bg-slate-800/70 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4 cursor-pointer group
        ${isDragging ? 'shadow-2xl ring-2 ring-blue-500 rotate-2' : ''}
        hover:border-slate-600/50 transition-all duration-200
      `}
    >
      <div className={`absolute left-0 top-0 bottom-0 w-1 rounded-l-xl ${PRIORITY_COLORS[task.priority]}`} />
      <div className="pl-3">
        {task.tags?.length > 0 && (
          <div className="flex flex-wrap gap-1 mb-2">
            {task.tags.slice(0, 3).map((tagName, i) => {
              const tag = DEMO_TAGS.find(t => t.name === tagName);
              return <span key={i} className={`${tag?.color || 'bg-slate-600'} px-2 py-0.5 rounded-full text-xs text-white`}>{tagName}</span>;
            })}
            {task.tags.length > 3 && <span className="px-2 py-0.5 rounded-full text-xs bg-slate-700 text-slate-300">+{task.tags.length - 3}</span>}
          </div>
        )}
        <h4 className="text-white font-medium text-sm mb-2 group-hover:text-blue-300 transition-colors">{task.title}</h4>
        {task.description && <p className="text-slate-400 text-xs mb-3 line-clamp-2">{task.description}</p>}
        {totalSubtasks > 0 && <div className="mb-3"><ProgressBar value={completedSubtasks} max={totalSubtasks} color={completedSubtasks === totalSubtasks ? 'emerald' : 'blue'} /></div>}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            {task.assignees?.length > 0 && (
              <div className="flex -space-x-2">
                {task.assignees.slice(0, 3).map((userId, i) => {
                  const user = DEMO_USERS.find(u => u.id === userId);
                  return <Avatar key={i} user={user} size="sm" showOnline />;
                })}
                {task.assignees.length > 3 && <div className="w-6 h-6 rounded-full bg-slate-700 flex items-center justify-center text-xs text-slate-300 border-2 border-slate-800">+{task.assignees.length - 3}</div>}
              </div>
            )}
            <div className="flex items-center gap-2 text-slate-500">
              {task.comments > 0 && <span className="flex items-center gap-1 text-xs"><MessageSquare className="w-3 h-3" />{task.comments}</span>}
              {task.attachments > 0 && <span className="flex items-center gap-1 text-xs"><Paperclip className="w-3 h-3" />{task.attachments}</span>}
              {task.isRecurring && <Tooltip content="Recurring task"><span className="text-xs">🔄</span></Tooltip>}
            </div>
          </div>
          {task.dueDate && (
            <div className={`flex items-center gap-1 text-xs px-2 py-1 rounded-full ${isOverdue(task.dueDate) ? 'bg-red-500/20 text-red-400' : isDueSoon(task.dueDate) && !isOverdue(task.dueDate) ? 'bg-amber-500/20 text-amber-400' : isTodayDate(task.dueDate) ? 'bg-blue-500/20 text-blue-400' : 'bg-slate-700/50 text-slate-400'}`}>
              <CalendarDays className="w-3 h-3" />{formatDate(task.dueDate)}
            </div>
          )}
        </div>
        {task.timeTracked > 0 && (
          <div className="flex items-center gap-1 text-xs text-slate-500 mt-2">
            <Clock className="w-3 h-3" />
            <span>{Math.floor(task.timeTracked / 3600)}h {Math.floor((task.timeTracked % 3600) / 60)}m tracked</span>
          </div>
        )}
      </div>
      <div className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity flex gap-1">
        <button className="p-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-600 text-slate-400 hover:text-white transition-colors"><Edit className="w-3.5 h-3.5" /></button>
        <button className="p-1.5 rounded-lg bg-slate-700/80 hover:bg-slate-600 text-slate-400 hover:text-white transition-colors"><Copy className="w-3.5 h-3.5" /></button>
      </div>
    </motion.div>
  );
};

// Column Component
const Column = ({ column, tasks, onAddTask, onTaskClick }) => {
  const [isDraggingOver, setIsDraggingOver] = useState(false);
  const atLimit = column.limit && tasks.length >= column.limit;
  
  return (
    <div 
      className={`flex-shrink-0 w-80 flex flex-col max-h-full rounded-2xl border transition-all duration-300 ${isDraggingOver ? 'bg-blue-500/10 border-blue-500/50 ring-2 ring-blue-500/20' : 'bg-slate-800/30 border-slate-700/50'}`}
      onDragOver={(e) => { e.preventDefault(); setIsDraggingOver(true); }}
      onDragLeave={() => setIsDraggingOver(false)}
      onDrop={(e) => { e.preventDefault(); setIsDraggingOver(false); }}
    >
      <div className="flex items-center justify-between p-4 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <div className="w-3 h-3 rounded-full" style={{ backgroundColor: column.color }} />
          <h3 className="font-semibold text-white">{column.name}</h3>
          <Badge color="slate">{tasks.length}{column.limit ? `/${column.limit}` : ''}</Badge>
          {atLimit && <Tooltip content="Column limit reached"><span className="text-amber-400 text-xs">⚠️</span></Tooltip>}
        </div>
        <div className="flex items-center gap-1">
          <button className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"><Plus className="w-4 h-4" /></button>
          <button className="p-1.5 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white transition-colors"><MoreHorizontal className="w-4 h-4" /></button>
        </div>
      </div>
      <div className="flex-1 overflow-y-auto p-3 space-y-3 custom-scrollbar">
        {tasks.map(task => <TaskCard key={task.id} task={task} column={column} onClick={() => onTaskClick(task)} />)}
        {tasks.length === 0 && (
          <div className="text-center py-8 text-slate-500">
            <div className="w-12 h-12 mx-auto mb-3 rounded-full bg-slate-700/50 flex items-center justify-center"><Plus className="w-5 h-5" /></div>
            <p className="text-sm">No tasks yet</p>
            <button onClick={() => onAddTask(column.id)} className="text-xs text-blue-400 hover:text-blue-300 mt-1">Add a task</button>
          </div>
        )}
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
          <Column key={column.id} column={column} tasks={tasks.filter(t => t.columnId === column.id || column.tasks.some(ct => ct.id === t.id))} onAddTask={onAddTask} onTaskClick={onTaskClick} />
        ))}
        <div className="flex-shrink-0 w-80">
          <button onClick={() => dispatch({ type: 'OPEN_TASK_MODAL', payload: { mode: 'createColumn' })} className="w-full h-16 rounded-2xl border-2 border-dashed border-slate-700/50 flex items-center justify-center gap-2 text-slate-500 hover:text-slate-300 hover:border-slate-600/50 transition-all">
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
  const { state } = useContext(AppContext);
  const currentBoard = state.boards.find(b => b.id === state.currentBoard);
  
  return (
    <div className="p-6">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 overflow-hidden">
        <table className="w-full">
          <thead className="bg-slate-700/30 border-b border-slate-700/50">
            <tr>
              <th className="text-left p-4 text-slate-400 font-medium text-sm w-8"><input type="checkbox" className="rounded border-slate-600" /></th>
              <th className="text-left p-4 text-slate-400 font-medium text-sm">Task</th>
              <th className="text-left p-4 text-slate-400 font-medium text-sm">Status</th>
              <th className="text-left p-4 text-slate-400 font-medium text-sm">Priority</th>
              <th className="text-left p-4 text-slate-400 font-medium text-sm">Assignees</th>
              <th className="text-left p-4 text-slate-400 font-medium text-sm">Due Date</th>
              <th className="text-left p-4 text-slate-400 font-medium text-sm w-32">Progress</th>
            </tr>
          </thead>
          <tbody>
            {sortedTasks.map((task, index) => {
              const column = currentBoard?.columns.find(c => c.tasks.some(ct => ct.id === task.id));
              return (
                <tr key={task.id} onClick={() => onTaskClick(task)} className="border-b border-slate-700/30 hover:bg-slate-700/20 transition-colors cursor-pointer group">
                  <td className="p-4"><input type="checkbox" className="rounded border-slate-600 group-hover:border-blue-500" /></td>
                  <td className="p-4"><div><h4 className="text-white font-medium group-hover:text-blue-300 transition-colors">{task.title}</h4>{task.description && <p className="text-slate-500 text-sm truncate max-w-xs">{task.description}</p>}</div></td>
                  <td className="p-4"><Badge color="slate">{column?.name || 'Unknown'}</Badge></td>
                  <td className="p-4"><span className={`inline-flex items-center gap-1.5 px-2 py-1 rounded-full text-xs font-medium ${PRIORITY_COLORS[task.priority]} text-white`}>{task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}</span></td>
                  <td className="p-4"><div className="flex -space-x-2">{task.assignees?.slice(0, 4).map((uid, i) => <Avatar key={i} user={DEMO_USERS.find(u => u.id === uid)} size="sm" showOnline />)}</div></td>
                  <td className="p-4">{task.dueDate && <span className={`text-sm ${isOverdue(task.dueDate) ? 'text-red-400' : isDueSoon(task.dueDate) ? 'text-amber-400' : isTodayDate(task.dueDate) ? 'text-blue-400' : 'text-slate-400'}`}>{formatDate(task.dueDate)}</span>}</td>
                  <td className="p-4 w-32"><ProgressBar value={task.completedSubtasks} max={task.subtasks?.length || 1} color={task.subtasks?.length && task.completedSubtasks === task.subtasks.length ? 'emerald' : 'blue'} /></td>
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
              <div key={index} className={`min-h-[100px] p-2 border-b border-r border-slate-700/30 ${!day ? 'bg-slate-800/30' : 'bg-slate-800/50'} ${isToday ? 'ring-2 ring-blue-500 inset-0' : ''}`}>
                {day && (<><span className={`text-sm font-medium mb-1 inline-block ${isToday ? 'text-blue-400' : 'text-slate-400'}`}>{day}</span><div className="space-y-1">{tasksForDate.slice(0, 4).map(task => <div key={task.id} className={`${PRIORITY_COLORS[task.priority]} px-2 py-0.5 rounded text-xs truncate text-white cursor-pointer hover:opacity-80`}>{task.title}</div>)}</div></>)}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

// Timeline View
const TimelineView = ({ tasks }) => {
  const sortedTasks = [...tasks].filter(t => t.dueDate).sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  const minDate = sortedTasks.length > 0 ? new Date(Math.min(...sortedTasks.map(t => new Date(t.dueDate).getTime()))) : new Date();
  const maxDate = sortedTasks.length > 0 ? new Date(Math.max(...sortedTasks.map(t => new Date(t.dueDate).getTime()))) : new Date();
  minDate.setDate(minDate.getDate() - 3);
  maxDate.setDate(maxDate.getDate() + 7);
  const totalDays = Math.ceil((maxDate.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
  
  const getPosition = (dueDate) => {
    const date = new Date(dueDate);
    const diff = Math.floor((date.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24));
    return (diff / totalDays) * 100;
  };
  
  const today = new Date();
  const todayPosition = Math.max(0, Math.min(100, ((today.getTime() - minDate.getTime()) / (1000 * 60 * 60 * 24) / totalDays) * 100));
  
  return (
    <div className="p-6 h-full overflow-auto">
      <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4">
        <div className="relative h-8 mb-6">
          <div className="absolute inset-0 flex items-center"><div className="w-full h-0.5 bg-slate-700" /></div>
          {todayPosition >= 0 && todayPosition <= 100 && <div className="absolute top-0 bottom-0 w-0.5 bg-red-500" style={{ left: `${todayPosition}%` }}><div className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-red-400 whitespace-nowrap">Today</div></div>}
          <div className="absolute inset-0 flex justify-between text-xs text-slate-500 px-1"><span>{formatDate(minDate)}</span><span>{formatDate(maxDate)}</span></div>
        </div>
        <div className="space-y-4">
          {sortedTasks.map((task, index) => {
            const position = getPosition(task.dueDate);
            const isPast = new Date(task.dueDate) < today;
            return (
              <div key={task.id} className="flex items-center gap-4">
                <div className="w-32 text-sm text-slate-400 shrink-0">{formatDate(task.dueDate)}</div>
                <div className="flex-1 relative h-8">
                  <div className={`absolute top-1/2 -translate-y-1/2 px-3 py-1 rounded-lg text-xs font-medium ${PRIORITY_COLORS[task.priority]} text-white ${isPast ? 'opacity-50' : ''}`} style={{ left: `${Math.max(0, Math.min(95, position))}%` }}>{task.title}</div>
                </div>
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
    { name: 'High', value: tasks.filter(t => t.priority === 'high').length, color: '#EF4444' },
    { name: 'Medium', value: tasks.filter(t => t.priority === 'medium').length, color: '#F59E0B' },
    { name: 'Low', value: tasks.filter(t => t.priority === 'low').length, color: '#10B981' },
  ];
  
  const statusData = currentBoard?.columns.map(c => ({ name: c.name, value: c.tasks.length, color: c.color })) || [];
  
  const weeklyProgress = [
    { day: 'Mon', completed: 4, created: 3 },
    { day: 'Tue', completed: 6, created: 5 },
    { day: 'Wed', completed: 3, created: 4 },
    { day: 'Thu', completed: 8, created: 6 },
    { day: 'Fri', completed: 5, created: 4 },
    { day: 'Sat', completed: 2, created: 1 },
    { day: 'Sun', completed: 1, created: 2 },
  ];
  
  const teamProductivity = DEMO_USERS.slice(0, 5).map(user => ({
    ...user,
    tasks: tasks.filter(t => t.assignees?.includes(user.id)).length,
    completed: tasks.filter(t => t.assignees?.includes(user.id)).filter(t => { const col = currentBoard?.columns.find(c => c.tasks.some(ct => ct.id === t.id)); return col?.name === 'Done'; }).length
  }));
  
  return (
    <div className="p-6 overflow-auto h-full">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4"><p className="text-slate-400 text-sm">Total Tasks</p><p className="text-3xl font-bold text-white mt-1">{totalTasks}</p><div className="flex items-center gap-2 mt-2 text-xs text-blue-400"><TrendingUp className="w-4 h-4" />+12% this week</div></div>
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4"><p className="text-slate-400 text-sm">Completed</p><p className="text-3xl font-bold text-emerald-400 mt-1">{completedTasks}</p><ProgressBar value={completionRate} color="emerald" /></div>
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4"><p className="text-slate-400 text-sm">In Progress</p><p className="text-3xl font-bold text-amber-400 mt-1">{inProgressTasks}</p><div className="flex items-center gap-2 mt-2 text-xs text-amber-400"><Clock className="w-4 h-4" />Active tasks</div></div>
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-4"><p className="text-slate-400 text-sm">Overdue</p><p className="text-3xl font-bold text-red-400 mt-1">{overdueTasks}</p><div className="flex items-center gap-2 mt-2 text-xs text-red-400"><AlertCircle className="w-4 h-4" />Needs attention</div></div>
      </div>
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6"><h3 className="text-lg font-semibold text-white mb-4">Weekly Progress</h3><div className="space-y-3">{weeklyProgress.map((day, i) => <div key={i} className="flex items-center gap-3"><span className="text-slate-400 text-sm w-8">{day.day}</span><div className="flex-1 h-4 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-blue-500 to-blue-400 transition-all" style={{ width: `${totalTasks > 0 ? (day.completed / Math.max(...weeklyProgress.map(d => Math.max(d.completed, d.created))) * 100 : 0}%` }} /></div><span className="text-slate-400 text-xs w-16 text-right">{day.completed} done</span></div>)}</div></div>
        
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6"><h3 className="text-lg font-semibold text-white mb-4">Priority Distribution</h3><div className="flex justify-center gap-6">{priorityData.map((item, i) => <div key={i} className="text-center"><ProgressCircle value={item.value} max={Math.max(...priorityData.map(d => d.value), 1)} size={80} color={item.color} /><p className="text-slate-400 text-sm mt-2">{item.name}</p><p className="text-white font-bold">{item.value}</p></div>)}</div></div>
        
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6"><h3 className="text-lg font-semibold text-white mb-4">Tasks by Status</h3><div className="space-y-3">{statusData.map((item, i) => <div key={i} className="flex items-center gap-3"><div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} /><span className="text-slate-400 text-sm w-24">{item.name}</span><div className="flex-1 h-4 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400 transition-all" style={{ width: `${totalTasks > 0 ? (item.value / totalTasks) * 100 : 0}%` }} /></div><span className="text-slate-400 text-sm w-8">{item.value}</span></div>)}</div></div>
        
        <div className="bg-slate-800/50 backdrop-blur-sm rounded-xl border border-slate-700/50 p-6"><h3 className="text-lg font-semibold text-white mb-4">Team Productivity</h3><div className="space-y-3">{teamProductivity.map(user => { const pct = totalTasks > 0 ? Math.round((user.tasks / totalTasks) * 100) : 0; return (<div key={user.id} className="flex items-center gap-3"><Avatar user={user} size="md" /><div className="flex-1"><div className="flex justify-between text-sm mb-1"><span className="text-white">{user.name}</span><span className="text-slate-400">{user.tasks} tasks</span></div><div className="h-2 bg-slate-700 rounded-full overflow-hidden"><div className="h-full bg-gradient-to-r from-blue-500 to-cyan-400" style={{ width: `${pct}%` }} /></div></div></div>);})}</div></div>
      </div>
    </div>
  );
};

// Task Modal
const TaskModal = () => {
  const { state, dispatch } = useContext(AppContext);
  const [activeTab, setActiveTab] = useState('details');
  const [showComments, setShowComments] = useState(false);
  const [newComment, setNewComment] = useState('');
  
  if (!state.taskModalOpen) return null;
  const task = state.selectedTask;
  
  const handleClose = () => dispatch({ type: 'CLOSE_TASK_MODAL' });
  
  const handleAddComment = () => {
    if (!newComment.trim()) return;
    dispatch({ type: 'ADD_COMMENT', payload: { taskId: task.id, content: newComment } });
    setNewComment('');
  };
  
  const taskComments = state.comments.filter(c => c.taskId === task.id);
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={handleClose} />
      <motion.div initial={{ opacity: 0, scale: 0.95, y: 20 }} animate={{ opacity: 1, scale: 1, y: 0 }} className="relative w-full max-w-2xl bg-slate-800/95 backdrop-blur-xl rounded-2xl border border-slate-700/50 shadow-2xl max-h-[90vh] overflow-hidden">
        <div className="flex items-center justify-between p-4 border-b border-slate-700/50 bg-gradient-to-r from-blue-600/20 to-blue-500/10">
          <div className="flex items-center gap-3">
            <div className={`w-2 h-10 rounded-full ${PRIORITY_COLORS[task?.priority || 'medium']}`} />
            <div><h2 className="text-xl font-bold text-white">{task?.mode === 'create' ? 'Create New Task' : task?.title}</h2><p className="text-xs text-slate-400">In {state.boards.find(b => b.id === state.currentBoard)?.name}</p></div>
          </div>
          <button onClick={handleClose} className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white"><X className="w-5 h-5" /></button>
        </div>
        
        <div className="flex border-b border-slate-700/50">
          {['details', 'subtasks', 'comments', 'activity'].map(tab => (
            <button key={tab} onClick={() => setActiveTab(tab)} className={`flex-1 py-3 text-sm font-medium transition-colors ${activeTab === tab ? 'text-blue-400 border-b-2 border-blue-400 bg-blue-500/10' : 'text-slate-400 hover:text-white'}`}>{tab.charAt(0).toUpperCase() + tab.slice(1)}</button>
          ))}
        </div>
        
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)] space-y-6">
          {activeTab === 'details' && (
            <>
              <div><label className="block text-sm font-medium text-slate-300 mb-2">Title</label><input type="text" defaultValue={task?.title || ''} placeholder="Enter task title..." className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder:text-slate-500" /></div>
              <div><label className="block text-sm font-medium text-slate-300 mb-2">Description</label><textarea defaultValue={task?.description || ''} placeholder="Add a detailed description..." rows={4} className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder:text-slate-500 resize-none" /></div>
              <div className="grid grid-cols-2 gap-4">
                <div><label className="block text-sm font-medium text-slate-300 mb-2">Priority</label><select defaultValue={task?.priority || 'medium'} className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white"><option value="high">🔴 High</option><option value="medium">🟡 Medium</option><option value="low">🟢 Low</option></select></div>
                <div><label className="block text-sm font-medium text-slate-300 mb-2">Due Date</label><input type="date" defaultValue={task?.dueDate || ''} className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white" /></div>
              </div>
              <div><label className="block text-sm font-medium text-slate-300 mb-2">Assignees</label><div className="flex flex-wrap gap-2">{DEMO_USERS.map(user => <button key={user.id} className={`flex items-center gap-2 px-3 py-2 rounded-xl border transition-all ${task?.assignees?.includes(user.id) ? 'bg-blue-500/20 border-blue-500/50 text-blue-300' : 'bg-slate-700/50 border-slate-600/50 text-slate-300 hover:bg-slate-700'}`}><Avatar user={user} size="sm" /><span className="text-sm">{user.name}</span></button>)}</div></div>
              <div><label className="block text-sm font-medium text-slate-300 mb-2">Tags</label><div className="flex flex-wrap gap-2">{DEMO_TAGS.map(tag => <button key={tag.id} className={`px-3 py-1.5 rounded-full text-xs font-medium transition-all ${task?.tags?.includes(tag.name) ? `${tag.color} text-white` : 'bg-slate-700/50 text-slate-400 hover:bg-slate-700'}`}>{tag.name}</button>)}</div></div>
            </>
          )}
          
          {activeTab === 'subtasks' && (
            <div className="space-y-3">
              {task?.subtasks?.map((subtask, i) => (
                <div key={i} className="flex items-center gap-3 p-3 bg-slate-700/30 rounded-lg">
                  <button onClick={() => dispatch({ type: 'TOGGLE_SUBTASK', payload: { taskId: task.id, subtaskId: subtask.id })} className={`w-5 h-5 rounded-md border-2 flex items-center justify-center transition-all ${subtask.completed ? 'bg-blue-500 border-blue-500 text-white' : 'border-slate-600 hover:border-blue-500'}`}>{subtask.completed && <Check className="w-3 h-3" />}</button>
                  <span className={`flex-1 text-sm ${subtask.completed ? 'text-slate-500 line-through' : 'text-white'}`}>{subtask.title}</span>
                </div>
              ))}
              <button className="flex items-center gap-2 text-sm text-blue-400 hover:text-blue-300 mt-2"><Plus className="w-4 h-4" />Add subtask</button>
              {task?.subtasks?.length > 0 && <ProgressBar value={task.completedSubtasks} max={task.subtasks.length} color="blue" showLabel />}
            </div>
          )}
          
          {activeTab === 'comments' && (
            <div className="space-y-4">
              <div className="flex gap-3">
                <Avatar user={DEMO_USERS[0]} size="md" />
                <div className="flex-1"><textarea value={newComment} onChange={(e) => setNewComment(e.target.value)} placeholder="Write a comment..." rows={2} className="w-full px-4 py-2 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder:text-slate-500 resize-none" /><div className="flex justify-end mt-2"><Button size="sm" onClick={handleAddComment} disabled={!newComment.trim()}><Send className="w-4 h-4" />Send</Button></div></div>
              </div>
              <div className="space-y-3">{taskComments.map(comment => { const user = DEMO_USERS.find(u => u.id === comment.userId); return (<div key={comment.id} className="flex gap-3 p-3 bg-slate-700/30 rounded-lg"><Avatar user={user} size="sm" /><div className="flex-1"><div className="flex items-center gap-2 mb-1"><span className="text-sm font-medium text-white">{user?.name}</span><span className="text-xs text-slate-500">{formatDateTime(comment.createdAt)}</span></div><p className="text-sm text-slate-300">{comment.content}</p></div></div>);})}</div>
            </div>
          )}
          
          {activeTab === 'activity' && (
            <div className="space-y-3">
              {state.activities.slice(0, 20).map(activity => { const user = DEMO_USERS.find(u => u.id === activity.userId); return (<div key={activity.id} className="flex items-start gap-3 p-3 bg-slate-700/30 rounded-lg"><Avatar user={user} size="sm" /><div><div className="flex items-center gap-2"><span className="text-sm font-medium text-white">{user?.name}</span><span className="text-xs text-slate-500">{formatDateTime(activity.createdAt)}</span></div><p className="text-sm text-slate-300"><span className="text-blue-400">{user?.name}</span> {activity.action} {activity.entityName}</p></div></div>);})}
            </div>
          )}
        </div>
        
        <div className="flex items-center justify-between p-4 border-t border-slate-700/50 bg-slate-800/50">
          <div className="flex items-center gap-2">
            <Tooltip content="Attach file"><button className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white"><Paperclip className="w-5 h-5" /></button></Tooltip>
            <Tooltip content="Add subtask"><button className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white"><CheckSquare className="w-5 h-5" /></button></Tooltip>
            <Tooltip content="Set reminder"><button className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white"><Bell className="w-5 h-5" /></button></Tooltip>
            <Tooltip content="Track time"><button className="p-2 rounded-lg hover:bg-slate-700/50 text-slate-400 hover:text-white"><Clock className="w-5 h-5" /></button></Tooltip>
          </div>
          <div className="flex items-center gap-2"><Button variant="ghost" onClick={handleClose}>Cancel</Button><Button variant="secondary"><Save className="w-4 h-4" />Save Changes</Button></div>
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
          <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-blue-500 to-blue-600 flex items-center justify-center shadow-lg shadow-blue-500/25"><Layout className="w-5 h-5 text-white" /></div>
          {state.sidebarOpen && <div><h1 className="font-bold text-white">TaskFlow</h1><p className="text-xs text-slate-500">Project Manager</p></div>}
        </div>
      </div>
      {state.sidebarOpen && <div className="p-4"><Button className="w-full" size="lg"><FolderPlus className="w-5 h-5" />New Project</Button></div>}
      <nav className="flex-1 overflow-y-auto p-2">
        {state.sidebarOpen && (
          <div className="mb-4">
            <button onClick={() => dispatch({ type: 'SET_VIEW', payload: 'dashboard' })} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${state.currentView === 'dashboard' ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}><Home className="w-5 h-5" /><span className="font-medium">Dashboard</span></button>
          </div>
        )}
        {state.sidebarOpen && starredProjects.length > 0 && (
          <div className="mb-4">
            <p className="px-3 py-2 text-xs font-semibold text-slate-500 uppercase tracking-wider">Starred</p>
            {starredProjects.map(project => (
              <button key={project.id} onClick={() => dispatch({ type: 'SET_PROJECT', payload: project.id })} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${state.currentProject === project.id ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
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
              <button key={project.id} onClick={() => dispatch({ type: 'SET_PROJECT', payload: project.id })} className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg ${state.currentProject === project.id ? 'bg-blue-500/20 text-blue-400' : 'text-slate-400 hover:bg-slate-800 hover:text-white'}`}>
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
          <input type="text" placeholder="Search tasks... (Ctrl+K)" value={state.searchQuery} onChange={(e) => dispatch({ type: 'SET_SEARCH', payload: e.target.value })} className="w-full pl-10 pr-4 py-2.5 bg-slate-800/50 border border-slate-700/50 rounded-xl text-white placeholder:text-slate-500" />
          <kbd className="absolute right-3 top-1/2 -translate-y-1/2 px-2 py-0.5 text-xs bg-slate-700 text-slate-400 rounded">⌘K</kbd>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <div className="flex items-center bg-slate-800/50 rounded-lg p-1">
          {[{ id: 'board', icon: Layout }, { id: 'list', icon: List }, { id: 'calendar', icon: CalendarDays }, { id: 'timeline', icon: Clock }, { id: 'analytics', icon: BarChart3 }].map(view => (
            <button key={view.id} onClick={() => dispatch({ type: 'SET_VIEW', payload: view.id })} className={`flex items-center gap-1.5 px-3 py-1.5 rounded-md text-sm font-medium transition-all ${state.currentView === view.id ? 'bg-blue-500 text-white shadow-lg' : 'text-slate-400 hover:text-white hover:bg-slate-700/50'}`}><view.icon className="w-4 h-4" /><span className="hidden xl:inline">{view.id.charAt(0).toUpperCase() + view.id.slice(1)}</span></button>
          ))}
        </div>
        <div className="w-px h-8 bg-slate-700 mx-2" />
        <button className="relative p-2 rounded-lg hover:bg-slate-800 text-slate-400 hover:text-white"><Bell className="w-5 h-5" /><span className="absolute top-1 right-1 w-2 h-2 bg-blue-500 rounded-full" /></button>
        <div className="flex items-center gap-2 pl-2 border-l border-slate-700"><Avatar user={DEMO_USERS[0]} size="md" showOnline /><div className="hidden lg:block"><p className="text-sm font-medium text-white">{DEMO_USERS[0].name}</p><p className="text-xs text-slate-500">Admin</p></div></div>
      </div>
    </header>
  );
};

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
    if (state.filters.priority.length > 0 && !state.filters.priority.includes(task.priority)) return false;
    if (state.filters.tags.length > 0 && !task.tags?.some(t => state.filters.tags.includes(t))) return false;
    return true;
  });
  
  const handleTaskClick = (task) => dispatch({ type: 'OPEN_TASK_MODAL', payload: { ...task, mode: 'edit' } });
  
  const renderView = () => {
    switch (state.currentView) {
      case 'board': return <BoardView tasks={filteredTasks} onAddTask={() => dispatch({ type: 'OPEN_TASK_MODAL', payload: { mode: 'create' })} onTaskClick={handleTaskClick} />;
      case 'list': return <ListView tasks={filteredTasks} onTaskClick={handleTaskClick} />;
      case 'calendar': return <CalendarView tasks={filteredTasks} />;
      case 'timeline': return <TimelineView tasks={filteredTasks} />;
      case 'analytics': return <AnalyticsView tasks={filteredTasks} />;
      default: return <BoardView tasks={filteredTasks} onAddTask={() => {}} onTaskClick={handleTaskClick} />;
    }
  };
  
  return (
    <main className="flex-1 overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950/20 to-slate-900">
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
