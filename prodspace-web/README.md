# ProdSpace Web App

A React-based web application for the ProdSpace productivity platform. This is the frontend implementation of the unified productivity tool that combines Pomodoro Timer, To-Do List, Calendar, and Habit Tracker.

## 🚀 Getting Started

### Prerequisites

- Node.js (version 14 or higher)
- npm or yarn

### Installation

1. Clone the repository:
```bash
git clone <repository-url>
cd prodspace-web
```

2. Install dependencies:
```bash
npm install
```

3. Start the development server:
```bash
npm start
```

The app will open in your browser at `http://localhost:3000`.

## 🏗️ Project Structure

```
src/
├── components/          # Reusable UI components
│   ├── SignIn.js       # Sign in form component
│   ├── SignUp.js       # Sign up form component
│   └── Dashboard.js    # Main dashboard component
├── screens/            # Page-level components (future)
├── utils/              # Utility functions (future)
├── App.js              # Main app component with routing
├── index.js            # App entry point
└── index.css           # Global styles with Tailwind CSS
```

## 🎨 Features

### Current Features
- ✅ **Authentication UI**: Sign in and sign up forms with validation
- ✅ **Responsive Design**: Mobile-first design using Tailwind CSS
- ✅ **Routing**: React Router for navigation between pages
- ✅ **Form Validation**: Client-side validation for all forms
- ✅ **Loading States**: Loading indicators for better UX

### Planned Features
- 🔄 **Supabase Integration**: Real authentication and database
- ⏰ **Pomodoro Timer**: Work/break timer with task integration
- ✅ **To-Do List**: Task management with priority and time estimation
- 📅 **Calendar**: Day-focused scheduling interface
- 🔄 **Habit Tracker**: Start/quit habit tracking with streaks

## 🛠️ Tech Stack

- **Frontend**: React 18
- **Styling**: Tailwind CSS
- **Routing**: React Router v6
- **Backend**: Supabase (planned)
- **State Management**: React Context API (planned)

## 🔧 Development

### Available Scripts

- `npm start` - Start development server
- `npm test` - Run tests
- `npm run build` - Build for production
- `npm run eject` - Eject from Create React App

### Environment Variables

Create a `.env` file in the root directory:

```env
REACT_APP_SUPABASE_URL=your-supabase-url
REACT_APP_SUPABASE_ANON_KEY=your-supabase-anon-key
```

## 🎯 Demo

This is currently a demo version with mock authentication. You can:

1. Navigate to `/signin` or `/signup`
2. Fill out the forms (any valid email/password will work)
3. Access the dashboard at `/dashboard`
4. Sign out to return to the authentication flow

## 📱 Responsive Design

The app is designed to work on:
- Desktop (1024px+)
- Tablet (768px - 1023px)
- Mobile (320px - 767px)

## 🔮 Next Steps

1. **Supabase Setup**: Configure Supabase project and integrate authentication
2. **Database Schema**: Implement the database tables as defined in the main README
3. **Core Features**: Build the four main productivity tools
4. **State Management**: Add proper state management for user data
5. **Testing**: Add unit and integration tests

## 📄 License

This project is part of the ProdSpace productivity platform.
