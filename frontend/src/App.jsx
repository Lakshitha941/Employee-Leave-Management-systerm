import React, { useState } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Navbar from './components/Navbar';
import Sidebar from './components/Sidebar';
import LeaveModal from './components/LeaveModal';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import MyLeaves from './pages/MyLeaves';
import ManageLeaves from './pages/ManageLeaves';

const ProtectedLayout = ({ children, onOpenApplyModal }) => {
  const { user } = useAuth();
  if (!user) return <Navigate to="/login" replace />;

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex flex-col md:flex-row">
        <Sidebar onOpenApplyModal={onOpenApplyModal} />
        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full">
          {children}
        </main>
      </div>
    </div>
  );
};

export default function App() {
  const [isApplyModalOpen, setIsApplyModalOpen] = useState(false);
  const [refreshKey, setRefreshKey] = useState(0);

  const handleLeaveSuccess = () => {
    setRefreshKey(prev => prev + 1);
  };

  return (
    <AuthProvider>
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/register" element={<Register />} />
          
          <Route
            path="/"
            element={
              <ProtectedLayout onOpenApplyModal={() => setIsApplyModalOpen(true)}>
                <Dashboard 
                  key={refreshKey} 
                  onOpenApplyModal={() => setIsApplyModalOpen(true)} 
                />
              </ProtectedLayout>
            }
          />

          <Route
            path="/my-leaves"
            element={
              <ProtectedLayout onOpenApplyModal={() => setIsApplyModalOpen(true)}>
                <MyLeaves 
                  key={refreshKey} 
                  onOpenApplyModal={() => setIsApplyModalOpen(true)} 
                />
              </ProtectedLayout>
            }
          />

          <Route
            path="/manage-leaves"
            element={
              <ProtectedLayout onOpenApplyModal={() => setIsApplyModalOpen(true)}>
                <ManageLeaves key={refreshKey} />
              </ProtectedLayout>
            }
          />

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>

        <LeaveModal
          isOpen={isApplyModalOpen}
          onClose={() => setIsApplyModalOpen(false)}
          onSuccess={handleLeaveSuccess}
        />
      </BrowserRouter>
    </AuthProvider>
  );
}
