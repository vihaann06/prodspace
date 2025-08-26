# 🚀 ProdSpace - Your Personal Productivity Hub

A modern, full-stack productivity application built with React and Supabase that helps you focus on what matters most - one day at a time.

![ProdSpace Dashboard](https://img.shields.io/badge/Status-Live-brightgreen)
![React](https://img.shields.io/badge/React-19.1.0-blue)
![Supabase](https://img.shields.io/badge/Supabase-Backend-orange)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-38B2AC)

## ✨ Features

### 🎯 **Core Productivity Tools**
- **📝 To-Do List** - Organize and track your daily tasks with priority management
- **⏰ Pomodoro Timer** - Stay focused with customizable work sessions and breaks
- **📅 Calendar** - Schedule and visualize your day with drag-and-drop functionality
- **🔄 Habit Tracker** - Build lasting habits with streak tracking and progress visualization

### 🔐 **Authentication & User Management**
- Secure user authentication with Supabase Auth
- Anonymous user support for quick testing
- User profile management with personalized settings

## 🛠️ Tech Stack

### Frontend
- **React 19.1.0** - Modern React with hooks and functional components
- **React Router DOM** - Client-side routing
- **Tailwind CSS** - Utility-first CSS framework
- **Heroicons & Lucide React** - Beautiful icon libraries

### Backend & Database
- **Supabase** - Backend-as-a-Service with PostgreSQL
- **Real-time Database** - Live updates across all components
- **Row Level Security (RLS)** - Secure data access
- **Authentication** - Built-in auth with multiple providers

### Development Tools
- **Create React App** - Zero-configuration build tool
- **PostCSS & Autoprefixer** - CSS processing
- **ESLint** - Code quality and consistency

## 🚀 Getting Started

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn package manager

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/prodspace.git
   cd prodspace/prodspace-web
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   Create a `.env` file in the `prodspace-web` directory:
   ```env
   REACT_APP_SUPABASE_URL=your_supabase_url
   REACT_APP_SUPABASE_ANON_KEY=your_supabase_anon_key
   ```

4. **Start the development server**
   ```bash
   npm start
   ```

5. **Open your browser**
   Navigate to `http://localhost:3000`

## 📁 Project Structure

```
prodspace-web/
├── src/
│   ├── components/          # React components
│   │   ├── Dashboard.js     # Main dashboard interface
│   │   ├── ToDoList.js      # Task management
│   │   ├── PomodoroTimer.js # Focus timer
│   │   ├── Calendar.js      # Scheduling interface
│   │   ├── HabitTracker.js  # Habit tracking
│   │   ├── SignIn.js        # Authentication
│   │   └── SignUp.js        # User registration
│   ├── services/            # API and business logic
│   │   ├── authService.js   # Authentication service
│   │   ├── todoService.js   # Todo CRUD operations
│   │   ├── calendarService.js # Calendar operations
│   │   └── habitService.js  # Habit tracking logic
│   ├── lib/                 # Third-party integrations
│   │   └── supabase.js      # Supabase client configuration
│   └── hooks/               # Custom React hooks
└── public/                  # Static assets
```

## 🎯 Key Features Deep Dive

### **Smart Task Management**
- Create, edit, and delete tasks with priority levels
- Mark tasks as complete with satisfying animations
- Filter and search through your task list
- Integration with calendar for scheduling

### **Focus Timer (Pomodoro)**
- Customizable work and break intervals
- Visual progress indicators
- Sound notifications for session changes
- Session history tracking

### **Interactive Calendar**
- Drag-and-drop task scheduling
- Daily, weekly, and monthly views
- Event management and reminders
- Integration with todo list

### **Habit Building**
- Track daily habits with streak counters
- Visual progress charts and statistics
- Habit categories and goal setting
- Motivation through achievement tracking

## 🔧 Database Schema

The application uses Supabase with the following main tables:
- `profiles` - User profile information
- `todos` - Task management data
- `habits` - Habit tracking records
- `calendar_events` - Scheduled events and tasks

## 🚀 Deployment

The application is designed to be easily deployable to platforms like:
- Vercel
- Netlify
- Heroku
- AWS Amplify

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

---

**Ready to boost your productivity?** 🚀

[Live Demo] https://prodspace.app | [Report Bug] https://github.com/vihaann06/prodspace/issues | [Request Feature] https://github.com/vihaann06/prodspace/issues

---