import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { 
  Calendar, CheckCircle2, Clock, AlertTriangle, Users, 
  ArrowUpRight, ShieldAlert, Sparkles 
} from 'lucide-react';

export default function Dashboard({ onOpenApplyModal }) {
  const { user, isManager } = useAuth();
  const [balance, setBalance] = useState({ annual: 0, casual: 0, medical: 0 });
  const [myLeaves, setMyLeaves] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      if (isManager) {
        const statsRes = await api.get('/dashboard/stats');
        setStats(statsRes.data);
      }
      
      const [balRes, leavesRes] = await Promise.all([
        api.get('/leaverequests/balance'),
        api.get('/leaverequests/my-leaves')
      ]);

      setBalance(balRes.data);
      setMyLeaves(leavesRes.data.slice(0, 5)); // recent 5
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [isManager]);

  return (
    <div className="space-y-6">
      {/* Welcome Banner */}
      <div className="bg-gradient-to-r from-blue-700 via-indigo-700 to-indigo-800 rounded-3xl p-6 sm:p-8 text-white shadow-xl shadow-blue-900/10 relative overflow-hidden">
        <div className="relative z-10 max-w-2xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/10 backdrop-blur-md text-xs font-medium text-blue-100 border border-white/15 mb-3">
            <Sparkles className="w-3.5 h-3.5" />
            <span>{user?.department} Team • {user?.jobTitle}</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight">
            Welcome back, {user?.fullName}! 👋
          </h1>
          <p className="mt-2 text-blue-100 text-sm leading-relaxed">
            {isManager 
              ? 'You have administrative oversight to evaluate team absence and streamline workflows.' 
              : 'Keep track of your annual vacation, medical days, and request planned leaves easily.'}
          </p>
        </div>
      </div>

      {/* Manager Metric Cards (If Manager) */}
      {isManager && stats && (
        <div>
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider mb-3">
            Team Management Overview
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Total Team</p>
                <h3 className="text-2xl font-bold text-slate-800 mt-1">{stats.totalEmployees}</h3>
                <span className="text-[11px] text-slate-400">Registered users</span>
              </div>
              <div className="p-3 bg-blue-50 text-blue-600 rounded-xl">
                <Users className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-amber-200 shadow-sm bg-gradient-to-br from-white to-amber-50/40 flex items-center justify-between">
              <div>
                <p className="text-xs font-semibold text-amber-700">Pending Approvals</p>
                <h3 className="text-2xl font-bold text-amber-900 mt-1">{stats.totalPendingRequests}</h3>
                <span className="text-[11px] text-amber-600">Requires your review</span>
              </div>
              <div className="p-3 bg-amber-100 text-amber-700 rounded-xl">
                <Clock className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Approved This Month</p>
                <h3 className="text-2xl font-bold text-emerald-600 mt-1">{stats.totalApprovedThisMonth}</h3>
                <span className="text-[11px] text-slate-400">Staff absence granted</span>
              </div>
              <div className="p-3 bg-emerald-50 text-emerald-600 rounded-xl">
                <CheckCircle2 className="w-6 h-6" />
              </div>
            </div>

            <div className="bg-white p-5 rounded-2xl border border-slate-200/80 shadow-sm flex items-center justify-between">
              <div>
                <p className="text-xs font-medium text-slate-500">Rejected</p>
                <h3 className="text-2xl font-bold text-slate-600 mt-1">{stats.totalRejectedThisMonth}</h3>
                <span className="text-[11px] text-slate-400">Past 30 days</span>
              </div>
              <div className="p-3 bg-slate-100 text-slate-600 rounded-xl">
                <ShieldAlert className="w-6 h-6" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Personal Leave Balances */}
      <div>
        <div className="flex justify-between items-center mb-3">
          <h2 className="text-sm font-bold text-slate-500 uppercase tracking-wider">
            Your Leave Balances
          </h2>
          <button
            onClick={onOpenApplyModal}
            className="text-xs font-semibold text-blue-600 hover:text-blue-700 flex items-center gap-1"
          >
            Apply Now <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Annual */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-blue-200 transition-colors">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-blue-700 bg-blue-50 px-2.5 py-1 rounded-lg">
                Annual Vacation
              </span>
              <Calendar className="w-5 h-5 text-blue-500" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-800">{balance.annual}</span>
              <span className="text-xs text-slate-400 font-medium">days remaining</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-blue-600 h-full rounded-full transition-all" 
                style={{ width: `${Math.min(100, (balance.annual / 14) * 100)}%` }}
              />
            </div>
          </div>

          {/* Casual */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-amber-200 transition-colors">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-amber-700 bg-amber-50 px-2.5 py-1 rounded-lg">
                Casual / Emergency
              </span>
              <Clock className="w-5 h-5 text-amber-500" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-800">{balance.casual}</span>
              <span className="text-xs text-slate-400 font-medium">days remaining</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-amber-500 h-full rounded-full transition-all" 
                style={{ width: `${Math.min(100, (balance.casual / 7) * 100)}%` }}
              />
            </div>
          </div>

          {/* Medical */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200 shadow-sm hover:border-emerald-200 transition-colors">
            <div className="flex justify-between items-start">
              <span className="text-xs font-semibold text-emerald-700 bg-emerald-50 px-2.5 py-1 rounded-lg">
                Medical / Sick
              </span>
              <CheckCircle2 className="w-5 h-5 text-emerald-500" />
            </div>
            <div className="mt-4 flex items-baseline gap-2">
              <span className="text-3xl font-extrabold text-slate-800">{balance.medical}</span>
              <span className="text-xs text-slate-400 font-medium">days remaining</span>
            </div>
            <div className="w-full bg-slate-100 h-2 rounded-full mt-3 overflow-hidden">
              <div 
                className="bg-emerald-500 h-full rounded-full transition-all" 
                style={{ width: `${Math.min(100, (balance.medical / 14) * 100)}%` }}
              />
            </div>
          </div>
        </div>
      </div>

      {/* Recent Leave Applications Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="px-6 py-4 border-b border-slate-100 flex justify-between items-center">
          <h2 className="text-sm font-bold text-slate-800">
            {isManager ? 'Recent Organizational Activity' : 'Your Recent Applications'}
          </h2>
          <span className="text-xs text-slate-500 font-medium">Showing latest 5</span>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-xs font-semibold uppercase text-slate-400 border-b border-slate-100">
              <tr>
                {isManager && <th className="px-6 py-3">Employee</th>}
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Dates</th>
                <th className="px-6 py-3">Days</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Remarks / Reason</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {(isManager && stats ? stats.recentRequests : myLeaves).length === 0 ? (
                <tr>
                  <td colSpan={6} className="text-center py-8 text-slate-400 text-xs">
                    No leave requests found yet.
                  </td>
                </tr>
              ) : (
                (isManager && stats ? stats.recentRequests : myLeaves).map((item) => (
                  <tr key={item.id} className="hover:bg-slate-50/60 transition-colors">
                    {isManager && (
                      <td className="px-6 py-4 font-medium text-slate-900">
                        {item.employeeName}
                        <span className="block text-xs font-normal text-slate-400">{item.department}</span>
                      </td>
                    )}
                    <td className="px-6 py-4 font-medium text-slate-800">{item.leaveTypeName}</td>
                    <td className="px-6 py-4 text-xs">
                      {new Date(item.startDate).toLocaleDateString()} - {new Date(item.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-semibold text-slate-800">{item.numberOfDays}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${
                        item.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                        item.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        item.status === 'Cancelled' ? 'bg-slate-100 text-slate-600' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {item.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500 max-w-xs truncate" title={item.reason}>
                      {item.managerComment ? (
                        <span className="text-slate-700 font-medium">"{item.managerComment}"</span>
                      ) : (
                        item.reason
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
