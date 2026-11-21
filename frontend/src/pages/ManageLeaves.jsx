import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { CheckCircle2, XCircle, Clock, MessageSquare, AlertCircle } from 'lucide-react';

export default function ManageLeaves() {
  const [leaves, setLeaves] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('pending'); // 'pending' or 'all'
  const [selectedRequest, setSelectedRequest] = useState(null);
  const [decision, setDecision] = useState(''); // 'Approved' or 'Rejected'
  const [managerComment, setManagerComment] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [feedbackMsg, setFeedbackMsg] = useState('');

  const fetchLeaves = async () => {
    setLoading(true);
    try {
      const endpoint = activeTab === 'pending' ? '/leaverequests/pending' : '/leaverequests/all';
      const res = await api.get(endpoint);
      setLeaves(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLeaves();
  }, [activeTab]);

  const openDecisionModal = (req, type) => {
    setSelectedRequest(req);
    setDecision(type);
    setManagerComment(type === 'Approved' ? 'Approved based on team coverage.' : 'Unable to approve due to sprint milestones.');
  };

  const handleDecisionSubmit = async (e) => {
    e.preventDefault();
    if (!selectedRequest) return;

    setSubmitting(true);
    try {
      await api.put(`/leaverequests/${selectedRequest.id}/status`, {
        status: decision,
        managerComment: managerComment
      });

      setFeedbackMsg(`Request from ${selectedRequest.employeeName} has been ${decision.toLowerCase()}.`);
      setSelectedRequest(null);
      fetchLeaves();
      setTimeout(() => setFeedbackMsg(''), 4000);
    } catch (err) {
      alert(err.response?.data?.message || 'Error processing status update.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800 tracking-tight">
            Team Leave Approvals
          </h1>
          <p className="text-sm text-slate-500 mt-1">
            Evaluate, approve, or decline team leave applications
          </p>
        </div>

        {/* Tab switch */}
        <div className="flex bg-slate-200/70 p-1 rounded-xl">
          <button
            onClick={() => setActiveTab('pending')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'pending'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Pending Review
          </button>
          <button
            onClick={() => setActiveTab('all')}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeTab === 'all'
                ? 'bg-white text-slate-900 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            All Team History
          </button>
        </div>
      </div>

      {feedbackMsg && (
        <div className="p-3.5 bg-emerald-50 border border-emerald-200 text-emerald-800 text-sm rounded-2xl flex items-center gap-2">
          <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          <span>{feedbackMsg}</span>
        </div>
      )}

      {/* Main Table */}
      <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-600">
            <thead className="bg-slate-50/80 text-xs font-semibold uppercase text-slate-400 border-b border-slate-100">
              <tr>
                <th className="px-6 py-3">Employee</th>
                <th className="px-6 py-3">Type</th>
                <th className="px-6 py-3">Requested Period</th>
                <th className="px-6 py-3">Days</th>
                <th className="px-6 py-3">Reason</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3 text-right">Review Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-slate-400 text-sm">
                    Loading requests...
                  </td>
                </tr>
              ) : leaves.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-12 text-slate-400 text-sm">
                    {activeTab === 'pending'
                      ? '🎉 High five! No pending leave requests requiring review.'
                      : 'No team records found.'}
                  </td>
                </tr>
              ) : (
                leaves.map((req) => (
                  <tr key={req.id} className="hover:bg-slate-50/50">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-slate-900">{req.employeeName}</div>
                      <div className="text-xs text-slate-400">{req.department} • {req.jobTitle}</div>
                    </td>
                    <td className="px-6 py-4 font-medium text-slate-800">{req.leaveTypeName}</td>
                    <td className="px-6 py-4 text-xs font-medium text-slate-600">
                      {new Date(req.startDate).toLocaleDateString()} – {new Date(req.endDate).toLocaleDateString()}
                    </td>
                    <td className="px-6 py-4 font-bold text-slate-800">{req.numberOfDays}</td>
                    <td className="px-6 py-4 text-xs text-slate-600 max-w-xs">
                      <span className="italic">"{req.reason}"</span>
                    </td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                        req.status === 'Approved' ? 'bg-emerald-100 text-emerald-800' :
                        req.status === 'Rejected' ? 'bg-red-100 text-red-800' :
                        req.status === 'Cancelled' ? 'bg-slate-100 text-slate-600' :
                        'bg-amber-100 text-amber-800'
                      }`}>
                        {req.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {req.status === 'Pending' ? (
                        <div className="inline-flex gap-2">
                          <button
                            onClick={() => openDecisionModal(req, 'Approved')}
                            className="inline-flex items-center gap-1 bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm transition-all"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5" /> Approve
                          </button>
                          <button
                            onClick={() => openDecisionModal(req, 'Rejected')}
                            className="inline-flex items-center gap-1 bg-red-600 hover:bg-red-700 text-white text-xs font-medium px-3 py-1.5 rounded-lg shadow-sm transition-all"
                          >
                            <XCircle className="w-3.5 h-3.5" /> Reject
                          </button>
                        </div>
                      ) : (
                        <span className="text-xs text-slate-400">Processed</span>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Decision Remarks Modal */}
      {selectedRequest && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-6 shadow-2xl border border-slate-100">
            <h3 className="text-lg font-bold text-slate-900 mb-2">
              {decision === 'Approved' ? '✅ Confirm Approval' : '❌ Confirm Rejection'}
            </h3>
            <p className="text-xs text-slate-500 mb-4">
              Employee: <span className="font-semibold text-slate-700">{selectedRequest.employeeName}</span> ({selectedRequest.numberOfDays} days of {selectedRequest.leaveTypeName})
            </p>

            <form onSubmit={handleDecisionSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                  Manager Feedback / Remarks
                </label>
                <textarea
                  rows={3}
                  value={managerComment}
                  onChange={(e) => setManagerComment(e.target.value)}
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
                  required
                />
              </div>

              <div className="flex justify-end gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => setSelectedRequest(null)}
                  className="px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className={`px-5 py-2 text-sm font-semibold text-white rounded-xl shadow-sm ${
                    decision === 'Approved' ? 'bg-emerald-600 hover:bg-emerald-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {submitting ? 'Updating...' : `Confirm ${decision}`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
