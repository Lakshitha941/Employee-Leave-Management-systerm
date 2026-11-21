import React, { useState, useEffect } from 'react';
import api from '../services/api';
import { X, Calendar, AlertCircle, Clock } from 'lucide-react';

export default function LeaveModal({ isOpen, onClose, onSuccess }) {
  const [leaveTypes, setLeaveTypes] = useState([]);
  const [balance, setBalance] = useState({ annual: 0, casual: 0, medical: 0 });
  const [formData, setFormData] = useState({
    leaveTypeId: '',
    startDate: '',
    endDate: '',
    reason: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    if (isOpen) {
      setError('');
      // Load Leave Types and user balance
      Promise.all([
        api.get('/leavetypes'),
        api.get('/leaverequests/balance')
      ]).then(([typesRes, balanceRes]) => {
        setLeaveTypes(typesRes.data);
        setBalance(balanceRes.data);
        if (typesRes.data.length > 0) {
          setFormData(prev => ({
            ...prev,
            leaveTypeId: typesRes.data[0].id.toString()
          }));
        }
      }).catch(err => {
        setError('Failed to load leave settings.');
      });
    }
  }, [isOpen]);

  if (!isOpen) return null;

  // Calculate days requested
  let daysRequested = 0;
  if (formData.startDate && formData.endDate) {
    const start = new Date(formData.startDate);
    const end = new Date(formData.endDate);
    if (end >= start) {
      const diffTime = Math.abs(end - start);
      daysRequested = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1;
    }
  }

  // Determine available balance for selected leave type
  const selectedType = leaveTypes.find(t => t.id.toString() === formData.leaveTypeId.toString());
  let availableBalance = 0;
  if (selectedType) {
    if (selectedType.name.includes('Annual')) availableBalance = balance.annual;
    else if (selectedType.name.includes('Casual')) availableBalance = balance.casual;
    else if (selectedType.name.includes('Medical')) availableBalance = balance.medical;
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (daysRequested <= 0) {
      setError('End date must be greater than or equal to Start date.');
      return;
    }

    if (daysRequested > availableBalance) {
      setError(`Requested days (${daysRequested}) exceed your available ${selectedType?.name} balance (${availableBalance} days).`);
      return;
    }

    setLoading(true);
    try {
      await api.post('/leaverequests/apply', {
        leaveTypeId: parseInt(formData.leaveTypeId),
        startDate: formData.startDate,
        endDate: formData.endDate,
        reason: formData.reason
      });
      onSuccess();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit leave application.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-900/50 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-lg w-full p-6 shadow-2xl border border-slate-100 transition-all">
        {/* Header */}
        <div className="flex justify-between items-center pb-4 border-b border-slate-100">
          <div className="flex items-center gap-2 text-slate-800">
            <Calendar className="w-5 h-5 text-blue-600" />
            <h2 className="text-lg font-bold">New Leave Application</h2>
          </div>
          <button
            onClick={onClose}
            className="text-slate-400 hover:text-slate-600 rounded-lg p-1 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {error && (
          <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-xl text-red-600 text-sm flex items-start gap-2">
            <AlertCircle className="w-4 h-4 mt-0.5 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Leave Category
            </label>
            <select
              value={formData.leaveTypeId}
              onChange={(e) => setFormData({ ...formData, leaveTypeId: e.target.value })}
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
              required
            >
              {leaveTypes.map((t) => (
                <option key={t.id} value={t.id}>
                  {t.name} (Default: {t.defaultDays} days)
                </option>
              ))}
            </select>
            <p className="text-xs text-blue-600 mt-1 font-medium">
              Available balance for this category: <span className="font-bold">{availableBalance} days</span>
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                Start Date
              </label>
              <input
                type="date"
                value={formData.startDate}
                onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
                End Date
              </label>
              <input
                type="date"
                value={formData.endDate}
                onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
                className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white"
                required
              />
            </div>
          </div>

          {daysRequested > 0 && (
            <div className="p-3 bg-blue-50/60 rounded-xl border border-blue-100 flex items-center justify-between text-xs text-blue-800">
              <span className="flex items-center gap-1.5 font-medium">
                <Clock className="w-4 h-4 text-blue-600" /> Total Duration:
              </span>
              <span className="font-bold text-sm bg-blue-600 text-white px-2.5 py-0.5 rounded-lg">
                {daysRequested} {daysRequested === 1 ? 'Day' : 'Days'}
              </span>
            </div>
          )}

          <div>
            <label className="block text-xs font-semibold text-slate-700 uppercase mb-1">
              Reason / Justification
            </label>
            <textarea
              rows={3}
              value={formData.reason}
              onChange={(e) => setFormData({ ...formData, reason: e.target.value })}
              placeholder="e.g. Attending a family wedding / Medical appointment"
              className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 focus:bg-white resize-none"
              required
            />
          </div>

          {/* Action buttons */}
          <div className="flex justify-end gap-3 pt-3 border-t border-slate-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-100 rounded-xl transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading || (daysRequested > 0 && daysRequested > availableBalance)}
              className="px-5 py-2 text-sm font-semibold text-white bg-blue-600 hover:bg-blue-700 disabled:opacity-50 rounded-xl shadow-sm transition-all"
            >
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
