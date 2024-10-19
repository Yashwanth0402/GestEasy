import React from 'react';
import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import GestureGallery from './components/GestureGallery';
import Login from './components/Login';
import Register from './components/Register';
import Landing from './components/Landing';
import Settings from './components/Settings';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<GestureGallery />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route path="/landing" element={<ProtectedRoute element={<Landing />} />} />
        <Route path="/settings" element={<ProtectedRoute element={<Settings />} />} />
      </Routes>
    </Router>
  );
}

export default App;
