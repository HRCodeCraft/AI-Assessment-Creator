'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Filter, Plus, BookOpen } from 'lucide-react';
import AppShell from '@/components/layout/AppShell';
import AssignmentCard from '@/components/AssignmentCard';
import { assignmentsApi, Assignment } from '@/lib/api';
import { useAssignmentStore } from '@/store/assignmentStore';

export default function DashboardPage() {
  const router = useRouter();
  const { assignments, setAssignments, removeAssignment } = useAssignmentStore();
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('');

  const fetchAssignments = useCallback(async () => {
    try {
      const res = await assignmentsApi.list();
      setAssignments(res.data.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [setAssignments]);

  useEffect(() => {
    fetchAssignments();
  }, [fetchAssignments]);

  async function handleDelete(id: string) {
    if (!confirm('Delete this assignment?')) return;
    try {
      await assignmentsApi.delete(id);
      removeAssignment(id);
    } catch (err) {
      console.error(err);
    }
  }

  const filtered = assignments.filter((a) => {
    const matchSearch =
      !search ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.subject.toLowerCase().includes(search.toLowerCase());
    const matchStatus = !filterStatus || a.status === filterStatus;
    return matchSearch && matchStatus;
  });

  const isEmpty = assignments.length === 0;

  return (
    <AppShell breadcrumbs={[{ label: 'Assignment' }]}>
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-ink-900">Assignments</h1>
          <p className="text-sm text-ink-500 mt-1">
            Manage and create assignments for your classes.
          </p>
        </div>

        {/* Empty State */}
        {!loading && isEmpty && (
          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex flex-col items-center justify-center py-20 text-center"
          >
            {/* Illustration */}
            <div className="w-36 h-36 mb-6 relative">
              <svg viewBox="0 0 140 140" fill="none" xmlns="http://www.w3.org/2000/svg" className="w-full h-full">
                {/* Magnifying glass */}
                <circle cx="72" cy="62" r="34" stroke="#CBD5E1" strokeWidth="6" fill="white" />
                <line x1="96" y1="88" x2="116" y2="108" stroke="#CBD5E1" strokeWidth="8" strokeLinecap="round" />
                {/* Document inside */}
                <rect x="58" y="48" width="28" height="28" rx="3" fill="#F1F5F9" stroke="#CBD5E1" strokeWidth="2" />
                <line x1="63" y1="56" x2="81" y2="56" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
                <line x1="63" y1="62" x2="81" y2="62" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
                <line x1="63" y1="68" x2="74" y2="68" stroke="#CBD5E1" strokeWidth="2" strokeLinecap="round" />
                {/* X */}
                <circle cx="50" cy="40" r="12" fill="white" stroke="#FECACA" strokeWidth="2" />
                <line x1="44" y1="34" x2="56" y2="46" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
                <line x1="56" y1="34" x2="44" y2="46" stroke="#EF4444" strokeWidth="2.5" strokeLinecap="round" />
                {/* Sparkles */}
                <circle cx="26" cy="72" r="3" fill="#FDE68A" />
                <circle cx="118" cy="45" r="2.5" fill="#A5F3FC" />
                <circle cx="105" cy="25" r="2" fill="#FDE68A" />
              </svg>
            </div>

            <h2 className="text-xl font-bold text-ink-800 mb-2">No assignments yet</h2>
            <p className="text-sm text-ink-500 max-w-sm mb-6">
              Create your first assignment to start collecting and grading student submissions.
              You can set up rubrics, define marking criteria, and let AI assist with grading.
            </p>
            <button
              onClick={() => router.push('/create')}
              className="btn-primary px-6 py-3"
            >
              <Plus size={16} />
              Create Your First Assignment
            </button>
          </motion.div>
        )}

        {/* Filled state */}
        {!loading && !isEmpty && (
          <>
            {/* Filter + Search bar */}
            <div className="flex items-center gap-3 mb-5">
              <div className="relative">
                <Filter size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <select
                  value={filterStatus}
                  onChange={(e) => setFilterStatus(e.target.value)}
                  className="pl-8 pr-3 py-2 text-sm bg-white border border-ink-200 rounded-xl
                    text-ink-600 font-medium focus:outline-none focus:ring-2 focus:ring-ink-900/20 shadow-card cursor-pointer"
                >
                  <option value="">Filter By</option>
                  <option value="pending">Pending</option>
                  <option value="processing">Processing</option>
                  <option value="completed">Completed</option>
                  <option value="failed">Failed</option>
                </select>
              </div>

              <div className="flex-1 max-w-xs relative">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-400" />
                <input
                  type="text"
                  placeholder="Search Assignment"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="w-full pl-8 pr-4 py-2 text-sm bg-white border border-ink-200 rounded-xl
                    text-ink-700 placeholder-ink-400 focus:outline-none focus:ring-2 focus:ring-ink-900/20 shadow-card"
                />
              </div>

              <div className="ml-auto">
                <span className="text-xs text-ink-400">{filtered.length} assignment{filtered.length !== 1 ? 's' : ''}</span>
              </div>
            </div>

            {/* Card grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <AnimatePresence>
                {filtered.map((assignment, i) => (
                  <motion.div
                    key={assignment._id}
                    initial={{ opacity: 0, y: 12 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.95 }}
                    transition={{ delay: i * 0.04 }}
                  >
                    <AssignmentCard assignment={assignment} onDelete={handleDelete} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {filtered.length === 0 && (
              <div className="text-center py-16 text-ink-400 text-sm">
                No assignments match your search.
              </div>
            )}
          </>
        )}

        {/* Loading skeleton */}
        {loading && (
          <div className="grid grid-cols-2 gap-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="card p-4 h-36 animate-shimmer" />
            ))}
          </div>
        )}
      </div>

      {/* FAB */}
      {!loading && !isEmpty && (
        <motion.button
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          onClick={() => router.push('/create')}
          className="fixed bottom-20 md:bottom-6 left-1/2 -translate-x-1/2 btn-primary px-6 py-3 shadow-btn-hover"
        >
          <Plus size={16} />
          Create Assignment
        </motion.button>
      )}
    </AppShell>
  );
}
