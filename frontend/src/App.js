import React from 'react';
import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom';
import Layout from './components/Layout';
import PrivateRoute from './components/PrivateRoute';
import Achievements from './pages/Achievements';
import AdminDashboard from './pages/AdminDashboard';
import Analytics from './pages/Analytics';
import Assessment from './pages/Assessment';
import BreathingExercise from './pages/BreathingExercise';
import Calendar from './pages/Calendar';
import Chat from './pages/Chat';
import CrisisResources from './pages/CrisisResources';
import Dashboard from './pages/Dashboard';
import ForgotPassword from './pages/ForgotPassword';
import Journal from './pages/Journal';
import Landing from './pages/Landing';
import Login from './pages/Login';
import MoodJournal from './pages/MoodJournal';
import Profile from './pages/Profile';
import Recommendations from './pages/Recommendations';
import Register from './pages/Register';
import Resources from './pages/Resources';
import Settings from './pages/Settings';
import SleepTracker from './pages/SleepTracker';
import WellnessGoals from './pages/WellnessGoals';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/welcome" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route path="/" element={<Navigate to="/welcome" replace />} />
        <Route path="/dashboard" element={<PrivateRoute><Layout><Dashboard /></Layout></PrivateRoute>} />
        <Route path="/assessment" element={<PrivateRoute><Layout><Assessment /></Layout></PrivateRoute>} />
        <Route path="/analytics" element={<PrivateRoute><Layout><Analytics /></Layout></PrivateRoute>} />
        <Route path="/calendar" element={<PrivateRoute><Layout><Calendar /></Layout></PrivateRoute>} />
        <Route path="/mood" element={<PrivateRoute><Layout><MoodJournal /></Layout></PrivateRoute>} />
        <Route path="/journal" element={<PrivateRoute><Layout><Journal /></Layout></PrivateRoute>} />
        <Route path="/sleep" element={<PrivateRoute><Layout><SleepTracker /></Layout></PrivateRoute>} />
        <Route path="/goals" element={<PrivateRoute><Layout><WellnessGoals /></Layout></PrivateRoute>} />
        <Route path="/breathing" element={<PrivateRoute><Layout><BreathingExercise /></Layout></PrivateRoute>} />
        <Route path="/recommendations" element={<PrivateRoute><Layout><Recommendations /></Layout></PrivateRoute>} />
        <Route path="/chat" element={<PrivateRoute><Layout><Chat /></Layout></PrivateRoute>} />
        <Route path="/resources" element={<PrivateRoute><Layout><Resources /></Layout></PrivateRoute>} />
        <Route path="/crisis" element={<PrivateRoute><Layout><CrisisResources /></Layout></PrivateRoute>} />
        <Route path="/achievements" element={<PrivateRoute><Layout><Achievements /></Layout></PrivateRoute>} />
        <Route path="/settings" element={<PrivateRoute><Layout><Settings /></Layout></PrivateRoute>} />
        <Route path="/profile" element={<PrivateRoute><Layout><Profile /></Layout></PrivateRoute>} />
        <Route path="/admin" element={<PrivateRoute adminOnly><Layout><AdminDashboard /></Layout></PrivateRoute>} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
