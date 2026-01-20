# 🚀 Gehad Team - Full Features Trello Clone

A complete, production-ready project management application with all premium features from Trello, ClickUp, and more - completely FREE!

## ✨ All Features Included

### 🎯 Core Project Management
- ✅ **Unlimited Boards** - Create as many boards as you need
- ✅ **Unlimited Tasks** - No restrictions on task creation
- ✅ **Drag & Drop** - Intuitive task management
- ✅ **Custom Columns** - Create unlimited columns per board
- ✅ **Board Colors** - Personalize with custom colors

### 💬 Team Chat
- ✅ **Real-time Chat** - Instant messaging for team collaboration
- ✅ **Board-specific** - Separate chat for each board
- ✅ **Message History** - View all conversation history
- ✅ **Delete Messages** - Remove unwanted messages

### 📎 File Attachments
- ✅ **File Upload** - Attach files to tasks
- ✅ **Multiple Files** - Upload multiple files at once
- ✅ **File Preview** - View file details (name, size, type)
- ✅ **Download Files** - Easily download attachments
- ✅ **File Management** - Remove unwanted attachments

### 🏷️ Tags & Labels
- ✅ **Custom Tags** - Create unlimited tags per board
- ✅ **Color Coded** - Visual organization with colors
- ✅ **Multiple Tags** - Apply multiple tags to tasks
- ✅ **Tag Management** - Add/remove tags easily

### ✅ Checklists
- ✅ **Multiple Checklists** - Add unlimited checklists per task
- ✅ **Checklist Items** - Add as many items as needed
- ✅ **Progress Tracking** - Mark items as complete
- ✅ **Editable Items** - Update checklist items
- ✅ **Delete Items** - Remove completed items

### 💬 Comments & Activity
- ✅ **Task Comments** - Add comments to any task
- ✅ **Activity Log** - Track all board activities
- ✅ **Real-time Updates** - See changes instantly
- ✅ **Edit Comments** - Update your comments
- ✅ **Delete Comments** - Remove unwanted comments

### 🔍 Search & Filter
- ✅ **Search Boards** - Find boards quickly
- ✅ **Filter by Priority** - Low, Medium, High
- ✅ **Filter by Date** - Filter by due dates
- ✅ **Advanced Filters** - Combine multiple filters

### 📊 Task Features
- ✅ **Priority Levels** - Set task priority (Low, Medium, High)
- ✅ **Due Dates** - Set deadlines
- ✅ **Assignees** - Assign team members
- ✅ **Descriptions** - Add detailed task information
- ✅ **Edit & Delete** - Full task management

### 👥 User Experience
- ✅ **Responsive Design** - Works on all devices
- ✅ **Dark Mode Ready** - Modern UI
- ✅ **Real-time Sync** - Changes sync instantly
- ✅ **Smooth Animations** - Professional feel
- ✅ **Accessible** - WCAG compliant

## 🛠️ Installation

### Prerequisites
- Node.js 16+
- Supabase account
- Clerk account

### Step 1: Clone & Install
```bash
git clone <repository-url>
cd trello-clone-fullstack
npm install
```

### Step 2: Set Up Environment Variables

Create `.env.local`:
```env
# Clerk Authentication
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_clerk_key
CLERK_SECRET_KEY=your_clerk_secret

# Supabase Database
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Step 3: Database Setup

Run these SQL scripts in Supabase SQL Editor:

1. **Basic Tables** (already done):
```sql
-- Run: supabase-migrations.sql
-- This creates boards, columns, tasks tables
```

2. **Additional Features**:
```sql
-- Run: supabase-migrations-additional.sql
-- This creates chat, tags, checklists, comments, activities tables
```

3. **File Storage**:
```sql
-- Run: supabase-storage.sql
-- This creates storage bucket for file attachments
```

### Step 4: Run Development Server
```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📖 Feature Guide

### 🎨 Creating Boards
1. Go to Dashboard
2. Click "Create Your First Board" or "Create New Board"
3. Enter board title and description
4. Choose a color
5. Click "Create Board"

### 📝 Managing Tasks
1. Click on a board to open it
2. Click "Add Task" or use the "+" button in any column
3. Fill in task details:
   - Title (required)
   - Description
   - Assignee
   - Priority
   - Due Date
4. Click "Create Task"
5. Drag and drop tasks between columns

### 💬 Using Team Chat
1. Open any board
2. Click "Chat" button in the top right
3. Type your message in the input box
4. Press Enter or click Send button
5. Messages appear in real-time for all users

### 📎 Attaching Files to Tasks
1. Click on a task to edit it
2. In the "Attachments" section, click "Attach Files"
3. Select one or multiple files
4. Wait for upload to complete
5. Click download icon to download files
6. Click X to remove attachments

### 🏷️ Working with Tags
1. In task edit dialog, find "Tags" section
2. Click "Add Tag"
3. Enter tag name and choose color
4. Click "Add"
5. Apply tag to task by clicking on it

### ✅ Creating Checklists
1. Edit a task
2. Click "Add Checklist"
3. Enter checklist title
4. Click "Add Item" for each checklist item
5. Click checkbox to mark complete
6. Track progress in the checklist header

### 💬 Adding Comments
1. Open task details
2. Find "Comments" section
3. Type your comment in the input
4. Press Enter or click "Post Comment"
5. Edit or delete your comments anytime

### 🔍 Filtering Tasks
1. Click "Filter" button in board
2. Select filters:
   - Priority: Choose one or more priorities
   - Due Date: Select specific date
   - Search: Type to search task titles
3. Click "Apply Filters"
4. Click "Clear Filters" to reset

## 🚀 Deployment to Vercel

### Quick Deploy

1. **Push to GitHub**
```bash
git init
git add .
git commit -m "Initial commit"
git branch -M main
git remote add origin <your-repo-url>
git push -u origin main
```

2. **Deploy on Vercel**
- Go to [vercel.com](https://vercel.com)
- Click "Add New Project"
- Import your repository
- Add environment variables
- Click "Deploy"

### Environment Variables for Production

Add these in Vercel Settings:
```
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=your_production_key
CLERK_SECRET_KEY=your_production_secret
NEXT_PUBLIC_SUPABASE_URL=your_production_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_production_anon_key
```

## 🗄️ Database Schema

### Tables Created
- `boards` - Project boards
- `columns` - Board columns
- `tasks` - Task items
- `messages` - Chat messages
- `tags` - Task tags
- `task_tags` - Task-tag relationships
- `checklists` - Task checklists
- `checklist_items` - Checklist items
- `comments` - Task comments
- `activities` - Activity log
- `task_attachments` - File attachments

### Storage
- `task-attachments` - File storage bucket

## 🔒 Security

- ✅ Row Level Security (RLS) enabled
- ✅ User-specific data isolation
- ✅ Secure file uploads
- ✅ Clerk authentication
- ✅ JWT token validation

## 📱 Supported Browsers

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)
- Mobile browsers (iOS Safari, Chrome Mobile)

## 🛠️ Development

### Available Scripts
```bash
npm run dev      # Start development server
npm run build    # Build for production
npm run start    # Start production server
npm run lint     # Run ESLint
```

### Tech Stack
- **Frontend**: Next.js 15, React 19
- **Styling**: Tailwind CSS, shadcn/ui
- **Authentication**: Clerk
- **Database**: Supabase (PostgreSQL)
- **Real-time**: Supabase Subscriptions
- **Drag & Drop**: dnd-kit
- **File Storage**: Supabase Storage

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## 📄 License

This project is open source and available under MIT License.

## 💡 Tips

1. **First Time Setup**: Run all SQL scripts in order
2. **Development**: Use `npm run dev` for hot reload
3. **Testing**: Test features locally before deployment
4. **Storage**: Make sure Supabase storage is enabled
5. **Real-time**: Use browser tabs to test real-time features

## 🆘 Troubleshooting

### Chat not working
- Check Supabase real-time is enabled
- Verify RLS policies for messages table

### File upload failing
- Ensure storage bucket is created
- Check storage policies allow uploads

### Real-time not updating
- Verify Supabase subscriptions are active
- Check browser console for errors

## 📞 Support

For issues or questions:
- Open an issue on GitHub
- Check documentation in code comments
- Review SQL scripts for database issues

---

**Made with ❤️ using Next.js, Supabase, and Clerk**

🎉 **All Features. Free Forever.**
