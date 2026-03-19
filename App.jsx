import { useState, useEffect } from 'react';
import { Plus, Briefcase, Filter, Import as SortAsc } from 'lucide-react';
import { supabase } from './lib/supabase';
import { JobApplication, STATUS_OPTIONS, JobStatus } from './types/job';
import { JobModal } from './components/JobModal';
import { JobCard } from './components/JobCard';

function App() {
  const [jobs, setJobs] = useState<JobApplication[]>([]);
  const [filteredJobs, setFilteredJobs] = useState<JobApplication[]>([]);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState<'add' | 'edit'>('add');
  const [selectedJob, setSelectedJob] = useState<JobApplication | null>(null);
  const [filterStatus, setFilterStatus] = useState<string>('all');
  const [sortBy, setSortBy] = useState<'date' | 'company'>('date');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterAndSortJobs();
  }, [jobs, filterStatus, sortBy]);

  const fetchJobs = async () => {
    try {
      const { data, error } = await supabase
        .from('job_applications')
        .select('*')
        .order('date_applied', { ascending: false });

      if (error) throw error;
      setJobs(data || []);
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterAndSortJobs = () => {
    let filtered = [...jobs];

    if (filterStatus !== 'all') {
      filtered = filtered.filter(job => job.status === filterStatus);
    }

    filtered.sort((a, b) => {
      if (sortBy === 'date') {
        return new Date(b.date_applied).getTime() - new Date(a.date_applied).getTime();
      } else {
        return a.company_name.localeCompare(b.company_name);
      }
    });

    setFilteredJobs(filtered);
  };

  const handleAddJob = async (jobData: Partial<JobApplication>) => {
    try {
      const { error } = await supabase
        .from('job_applications')
        .insert([jobData]);

      if (error) throw error;
      await fetchJobs();
      setIsModalOpen(false);
    } catch (error) {
      console.error('Error adding job:', error);
    }
  };

  const handleEditJob = async (jobData: Partial<JobApplication>) => {
    if (!selectedJob) return;

    try {
      const { error } = await supabase
        .from('job_applications')
        .update({ ...jobData, updated_at: new Date().toISOString() })
        .eq('id', selectedJob.id);

      if (error) throw error;
      await fetchJobs();
      setIsModalOpen(false);
      setSelectedJob(null);
    } catch (error) {
      console.error('Error updating job:', error);
    }
  };

  const handleDeleteJob = async (id: string) => {
    if (!confirm('Are you sure you want to delete this application?')) return;

    try {
      const { error } = await supabase
        .from('job_applications')
        .delete()
        .eq('id', id);

      if (error) throw error;
      await fetchJobs();
    } catch (error) {
      console.error('Error deleting job:', error);
    }
  };

  const openAddModal = () => {
    setModalMode('add');
    setSelectedJob(null);
    setIsModalOpen(true);
  };

  const openEditModal = (job: JobApplication) => {
    setModalMode('edit');
    setSelectedJob(job);
    setIsModalOpen(true);
  };

  const getStatusCount = (status: string) => {
    return jobs.filter(job => job.status === status).length;
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading applications...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-slate-100">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="mb-8">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="bg-blue-600 p-3 rounded-lg">
                <Briefcase className="text-white" size={32} />
              </div>
              <div>
                <h1 className="text-4xl font-bold text-gray-900">Job Application Tracker</h1>
                <p className="text-gray-600 mt-1">Keep track of all your job applications in one place</p>
              </div>
            </div>
            <button
              onClick={openAddModal}
              className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors shadow-md hover:shadow-lg"
            >
              <Plus size={20} />
              Add Application
            </button>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
            {STATUS_OPTIONS.map(status => (
              <div key={status} className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
                <div className="text-2xl font-bold text-gray-900">{getStatusCount(status)}</div>
                <div className="text-sm text-gray-600">{status}</div>
              </div>
            ))}
          </div>

          <div className="flex flex-col sm:flex-row gap-4 bg-white p-4 rounded-lg shadow-sm border border-gray-200">
            <div className="flex items-center gap-2 flex-1">
              <Filter size={20} className="text-gray-400" />
              <select
                value={filterStatus}
                onChange={(e) => setFilterStatus(e.target.value)}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="all">All Statuses</option>
                {STATUS_OPTIONS.map(status => (
                  <option key={status} value={status}>{status}</option>
                ))}
              </select>
            </div>

            <div className="flex items-center gap-2 flex-1">
              <SortAsc size={20} className="text-gray-400" />
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value as 'date' | 'company')}
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="date">Sort by Date</option>
                <option value="company">Sort by Company</option>
              </select>
            </div>
          </div>
        </div>

        {filteredJobs.length === 0 ? (
          <div className="text-center py-16 bg-white rounded-lg shadow-sm border border-gray-200">
            <Briefcase size={64} className="mx-auto text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">No applications yet</h3>
            <p className="text-gray-600 mb-6">
              {filterStatus !== 'all'
                ? `No applications with status "${filterStatus}"`
                : 'Start tracking your job applications by adding your first one'}
            </p>
            {filterStatus === 'all' && (
              <button
                onClick={openAddModal}
                className="inline-flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={20} />
                Add Your First Application
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredJobs.map(job => (
              <JobCard
                key={job.id}
                job={job}
                onEdit={openEditModal}
                onDelete={handleDeleteJob}
              />
            ))}
          </div>
        )}
      </div>

      <JobModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setSelectedJob(null);
        }}
        onSave={modalMode === 'add' ? handleAddJob : handleEditJob}
        job={selectedJob}
        mode={modalMode}
      />
    </div>
  );
}

export default App;
