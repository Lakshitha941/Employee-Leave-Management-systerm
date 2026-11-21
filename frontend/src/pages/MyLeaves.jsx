import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { FileText, Calendar, Clock, Trash2, AlertCircle } from 'lucide-react';

export default function MyLeaves({ onOpenApplyModal }) {
  const [leaves, setLeaves] = useState([]);
  const [filter, setFilter] = useState('All');
  const [loading, setLoading] = useState(true);
  const [actionMessage, setActionMessage] = useState('');

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const res = await api.get('/leaverequests/my-leaves');
      setLeaves(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, []);

  const handleCancel = async (id) => {
    if (!window.confirm('Are you sure you want to cancel this pending leave request?')) return;
    try {
      await api.delete(`/leaverequests/${id}/cancel`);
      setActionMessage('Leave request cancelled successfully.');
      fetchLeaves();
      setTimeout(() => setActionMessage(''), 3000);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to cancel leave request.');
    }
  };

  const filteredLeaves = leaves.filter(l => {
    if (filter === 'All') return true;
    return l.status === filter;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            My Leave Applications
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Review status, approval history, or cancel pending requests
          </p>
        </div>

        <button
          onClick={onOpenApplyModal}
          className="bg-blue-600 hover:bg-blue-700 text-white font-medium px-4 py-2 rounded-xl text-sm shadow-sm transition-all"
        >
          + New Application
        </button>
      </div>

      {actionMessage && (
        <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-700 text-sm rounded-xl">
          {actionMessage}
        </div>
      )}

      {/* Filter Tabs */}
      <div className="flex gap-2 border-b border-slate-200 pb-2">
        {['All', 'Pending', 'Approved', 'Rejected', 'Cancelled'].map((tab) => (
          <button
            key={tab}
            onClick={() => setFilter(tab)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
              filter === tab
                ? 'bg-slate-900 text-white'
                : 'text-slate-600 hover:bg-slate-100'
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-xs font-semibold uppercase text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Category</th>
                <th className="px-6 py-3">Duration</th>
                <th className="px-6 py-3">Days</th>
                <th className="px-6 py-3">Applied On</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Manager Feedback</th>
                <th className="px-6 py-3 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 text-sm">
                    Loading your leave applications...
                  </td>
                </tr>
              ) : filteredLeaves.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 text-sm">
                    No leave requests found in "{filter}".
                  </td>
                </tr>
              ) : (
                filteredLeaves.map((l) => (
                  <tr key={l.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4 font-semibold text-slate-800">{l.leaveTypeName}</td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-600">
                      {new Date(l.startDate).toLocaleDateString()} – {new Date(l.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-700">{l.numberOfDays}</td>
                    <td className="px-6 py-4 text-xs text-slate-400">
                      {new Date(l.appliedOn).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        l.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                        l.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        l.status === 'Cancelled' ? 'bg-slate-100 text-slate-600' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {l.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-xs text-slate-500">
                      {l.managerComment ? (
                        <div>
                          <p className="font-medium text-slate-800">"{l.managerComment}"</p>
                          <span className="text-[11px] text-slate-400">By {l.processedBy}</span>
                        </div>
                      ) : (
                        <span className="text-slate-400 italic">Pending review</span>
                      )}
                    </td>
                    <td className="px-6 py-4 text-right">
                      {l.status === 'Pending' && (
                        <button
                          onClick={() => handleCancel(l.id)}
                          title="Cancel Request"
                          className="p-1.5 text-slate-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
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
