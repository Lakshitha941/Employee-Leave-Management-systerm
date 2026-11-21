import React from 'react';
import { NavLink } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { LayoutDashboard, FileText, CheckSquare, PlusCircle } from 'lucide-react';

export default function Sidebar({ onOpenApplyModal }) {
  const { isManager } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: LayoutDashboard },
    { name: 'My Requests', path: '/my-leaves', icon: FileText },
  ];

  if (isManager) {
    navItems.push({ name: 'Review Approvals', path: '/manage-leaves', icon: CheckSquare });
  }

  return (
    <aside className="w-full md:w-64 bg-white border-r border-slate-200 md:min-h-[calc(100vh-4rem)] p-4 flex flex-col justify-between">
      <div className="space-y-6">
        {/* Quick Action Button */}
        <div>
          <button
            onClick={onOpenApplyModal}
            className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2.5 px-4 rounded-xl shadow-sm shadow-blue-500/20 flex items-center justify-center gap-2 transition-all active:scale-[0.98]"
          >
            <PlusCircle className="w-5 h-5" />
            <span>Apply For Leave</span>
          </button>
        </div>

        {/* Navigation Links */}
        <nav className="space-y-1">
          <p className="px-3 text-xs font-semibold text-slate-400 uppercase tracking-wider mb-2">
            Menu
          </p>
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.path}
                to={item.path}
                className={({ isActive }) =>
                  `flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors ${
                    isActive
                      ? 'bg-blue-50 text-blue-700 font-semibold'
                      : 'text-slate-600 hover:bg-slate-50 hover:text-slate-900'
                  }`
                }
              >
                <Icon className="w-5 h-5" />
                <span>{item.name}</span>
              </NavLink>
            );
          })}
        </nav>
      </div>
    </aside>
  );
}
