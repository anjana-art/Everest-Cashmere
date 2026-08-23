// app/admin/experiences/page.tsx
"use client";

import { useState, useEffect } from 'react';
import { CheckIcon, XMarkIcon, EyeIcon, TrashIcon } from '@heroicons/react/24/outline';

interface Experience {
  id: string;
  content: string;
  status: string;
  createdAt: string;
  user: {
    name: string;
    email: string;
  };
}

export default function AdminExperiencesPage() {
  const [experiences, setExperiences] = useState<Experience[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('PENDING');
  const [selectedExp, setSelectedExp] = useState<Experience | null>(null);
  const [showDetail, setShowDetail] = useState(false);

  useEffect(() => {
    fetchExperiences();
  }, [filter]);

  const fetchExperiences = async () => {
    try {
      setLoading(true);
      const url = filter === 'ALL' 
        ? '/api/admin/experiences/all'
        : `/api/admin/experiences?status=${filter}`;
      
      const res = await fetch(url);
      if (res.ok) {
        const data = await res.json();
        setExperiences(data.experiences || data);
      }
    } catch (error) {
      console.error('Error fetching experiences:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateExperienceStatus = async (id: string, status: string) => {
    try {
      const res = await fetch(`/api/admin/experiences`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status }),
      });
      
      if (res.ok) {
        fetchExperiences();
        if (selectedExp?.id === id) {
          setSelectedExp(null);
          setShowDetail(false);
        }
      }
    } catch (error) {
      console.error('Error updating experience:', error);
      alert('Failed to update experience');
    }
  };

  const deleteExperience = async (id: string) => {
    if (!confirm('Are you sure you want to delete this experience?')) return;
    
    try {
      const res = await fetch(`/api/admin/experiences/${id}`, {
        method: 'DELETE',
      });
      
      if (res.ok) {
        fetchExperiences();
        if (selectedExp?.id === id) {
          setSelectedExp(null);
          setShowDetail(false);
        }
      }
    } catch (error) {
      console.error('Error deleting experience:', error);
      alert('Failed to delete experience');
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString('en-GB', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-[400px]">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-serif font-bold text-red-900">Customer Experiences</h1>
          <p className="text-gray-500 text-sm">Manage customer stories and testimonials</p>
        </div>
        <div className="flex items-center gap-2">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-4 py-2 border border-amber-200 rounded-lg focus:border-amber-500 focus:ring-1 focus:ring-amber-500 outline-none"
          >
            <option value="PENDING">Pending</option>
            <option value="APPROVED">Approved</option>
            <option value="REJECTED">Rejected</option>
            <option value="ALL">All</option>
          </select>
          <span className="text-sm text-gray-400">{experiences.length} experiences</span>
        </div>
      </div>

      {/* Experiences List */}
      {experiences.length === 0 ? (
        <div className="text-center py-12 bg-amber-50 rounded-xl border border-amber-100">
          <div className="text-5xl mb-4">💬</div>
          <h3 className="font-serif text-lg text-red-900">No experiences found</h3>
          <p className="text-gray-500 text-sm">All caught up!</p>
        </div>
      ) : (
        <div className="space-y-4">
          {experiences.map((exp) => (
            <div
              key={exp.id}
              className="bg-white rounded-xl border border-amber-100 p-4 hover:shadow-md transition"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <span className="font-medium text-red-900">
                      {exp.user?.name || 'Anonymous Customer'}
                    </span>
                    <span className={`text-xs px-2 py-0.5 rounded-full ${
                      exp.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                      exp.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                      'bg-amber-100 text-amber-700'
                    }`}>
                      {exp.status}
                    </span>
                  </div>
                  
                  <p className="text-stone-700 text-sm line-clamp-2">
                    {exp.content}
                  </p>
                  
                  <div className="flex items-center gap-4 mt-2">
                    <span className="text-xs text-gray-400">
                      {formatDate(exp.createdAt)}
                    </span>
                    <span className="text-xs text-gray-400">
                      {exp.user?.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center gap-2 flex-shrink-0">
                  {exp.status === 'PENDING' && (
                    <>
                      <button
                        onClick={() => updateExperienceStatus(exp.id, 'APPROVED')}
                        className="p-1.5 bg-green-600 hover:bg-green-700 text-white rounded-lg transition"
                        title="Approve"
                      >
                        <CheckIcon className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => updateExperienceStatus(exp.id, 'REJECTED')}
                        className="p-1.5 bg-red-600 hover:bg-red-700 text-white rounded-lg transition"
                        title="Reject"
                      >
                        <XMarkIcon className="w-4 h-4" />
                      </button>
                    </>
                  )}
                  <button
                    onClick={() => {
                      setSelectedExp(exp);
                      setShowDetail(true);
                    }}
                    className="p-1.5 border border-amber-200 text-amber-700 hover:bg-amber-50 rounded-lg transition"
                    title="View"
                  >
                    <EyeIcon className="w-4 h-4" />
                  </button>
                  <button
                    onClick={() => deleteExperience(exp.id)}
                    className="p-1.5 text-red-600 hover:text-red-700 hover:bg-red-50 rounded-lg transition"
                    title="Delete"
                  >
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Detail Modal */}
      {showDetail && selectedExp && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6 lg:p-8">
              <div className="flex justify-between items-start mb-6">
                <h2 className="text-xl font-serif font-bold text-red-900">
                  Experience Details
                </h2>
                <button
                  onClick={() => {
                    setShowDetail(false);
                    setSelectedExp(null);
                  }}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <XMarkIcon className="w-6 h-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Customer</label>
                  <p className="font-medium">{selectedExp.user?.name || 'Anonymous'}</p>
                  <p className="text-sm text-gray-500">{selectedExp.user?.email}</p>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Experience</label>
                  <div className="mt-2 bg-amber-50 rounded-xl p-4 border border-amber-100">
                    <p className="text-stone-700 leading-relaxed whitespace-pre-wrap">
                      {selectedExp.content}
                    </p>
                  </div>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Status</label>
                  <span className={`inline-block mt-1 px-3 py-1 rounded-full text-sm ${
                    selectedExp.status === 'APPROVED' ? 'bg-green-100 text-green-700' :
                    selectedExp.status === 'REJECTED' ? 'bg-red-100 text-red-700' :
                    'bg-amber-100 text-amber-700'
                  }`}>
                    {selectedExp.status}
                  </span>
                </div>

                <div>
                  <label className="text-xs font-medium text-gray-400 uppercase tracking-wider">Submitted</label>
                  <p className="text-sm">{formatDate(selectedExp.createdAt)}</p>
                </div>

                {selectedExp.status === 'PENDING' && (
                  <div className="flex gap-3 pt-4 border-t border-amber-100">
                    <button
                      onClick={() => {
                        updateExperienceStatus(selectedExp.id, 'APPROVED');
                        setShowDetail(false);
                        setSelectedExp(null);
                      }}
                      className="flex-1 bg-green-600 hover:bg-green-700 text-white py-2 rounded-lg font-medium transition"
                    >
                      <CheckIcon className="w-4 h-4 inline mr-1" />
                      Approve
                    </button>
                    <button
                      onClick={() => {
                        updateExperienceStatus(selectedExp.id, 'REJECTED');
                        setShowDetail(false);
                        setSelectedExp(null);
                      }}
                      className="flex-1 bg-red-600 hover:bg-red-700 text-white py-2 rounded-lg font-medium transition"
                    >
                      <XMarkIcon className="w-4 h-4 inline mr-1" />
                      Reject
                    </button>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}