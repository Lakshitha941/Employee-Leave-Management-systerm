import React from 'react';
import { useAuth } from '../context/AuthContext';
import { Calendar, LogOut, User as UserIcon, Shield } from 'lucide-react';

export default function Navbar() {
  const { user, logout, isManager } = useAuth();

  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16 items-center">
          {/* Logo / App Name */}
          <div className="flex items-center space-x-3">
            <div className="h-10 w-10 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-600 flex items-center justify-center text-white shadow-md shadow-blue-500/20">
              <Calendar className="h-5 w-5" />
            </div>
            <div>
              <span className="text-xl font-bold bg-gradient-to-r from-slate-900 to-slate-700 bg-clip-text text-transparent">
                LeaveSync
              </span>
              <span className="hidden sm:inline-block ml-2 text-xs font-medium px-2 py-0.5 rounded-full bg-blue-50 text-blue-700 border border-blue-200">
                HR Portal
              </span>
            </div>
          </div>

          {/* User profile & action buttons */}
          <div className="flex items-center space-x-4">
            <div className="hidden sm:flex flex-col text-right">
              <span className="text-sm font-semibold text-slate-800 leading-tight">
                {user?.fullName || 'User'}
              </span>
              <span className="text-xs text-slate-500">
                {user?.department || 'Staff'} • {user?.jobTitle || ''}
              </span>
            </div>

            <span className={`text-xs px-2.5 py-1 rounded-full font-medium inline-flex items-center gap-1 ${
              isManager 
                ? 'bg-purple-100 text-purple-700 border border-purple-200' 
                : 'bg-emerald-100 text-emerald-700 border border-emerald-200'
            }`}>
              {isManager && <Shield className="w-3 h-3" />}
              {user?.role || 'Employee'}
            </span>

            <button
              onClick={logout}
              title="Sign Out"
              className="p-2 text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors border border-transparent hover:border-red-100"
            >
              <LogOut className="h-5 w-5" />
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
