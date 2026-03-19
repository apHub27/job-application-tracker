import { Briefcase, MapPin, Calendar, DollarSign, ExternalLink, User, Pencil, Trash2 } from 'lucide-react';
import { JobApplication, STATUS_COLORS } from '../types/job';

interface JobCardProps {
  job: JobApplication;
  onEdit: (job: JobApplication) => void;
  onDelete: (id: string) => void;
}

export function JobCard({ job, onEdit, onDelete }: JobCardProps) {
  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-lg transition-shadow border border-gray-200 overflow-hidden">
      <div className="p-6">
        <div className="flex justify-between items-start mb-4">
          <div className="flex-1">
            <h3 className="text-xl font-bold text-gray-900 mb-1">{job.position_title}</h3>
            <p className="text-lg text-gray-700 font-medium">{job.company_name}</p>
          </div>
          <span className={`px-3 py-1 rounded-full text-sm font-medium border ${STATUS_COLORS[job.status as keyof typeof STATUS_COLORS]}`}>
            {job.status}
          </span>
        </div>

        <div className="space-y-2 mb-4">
          {job.location && (
            <div className="flex items-center text-gray-600 text-sm">
              <MapPin size={16} className="mr-2 flex-shrink-0" />
              <span>{job.location}</span>
            </div>
          )}

          <div className="flex items-center text-gray-600 text-sm">
            <Calendar size={16} className="mr-2 flex-shrink-0" />
            <span>Applied on {formatDate(job.date_applied)}</span>
          </div>

          {job.salary_range && (
            <div className="flex items-center text-gray-600 text-sm">
              <DollarSign size={16} className="mr-2 flex-shrink-0" />
              <span>{job.salary_range}</span>
            </div>
          )}

          {job.contact_person && (
            <div className="flex items-center text-gray-600 text-sm">
              <User size={16} className="mr-2 flex-shrink-0" />
              <span>{job.contact_person}</span>
            </div>
          )}

          {job.job_url && (
            <a
              href={job.job_url}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center text-blue-600 hover:text-blue-800 text-sm transition-colors"
            >
              <ExternalLink size={16} className="mr-2 flex-shrink-0" />
              <span>View Job Posting</span>
            </a>
          )}
        </div>

        {job.notes && (
          <div className="mb-4 p-3 bg-gray-50 rounded-lg">
            <p className="text-sm text-gray-700 whitespace-pre-wrap">{job.notes}</p>
          </div>
        )}

        <div className="flex gap-2 pt-4 border-t">
          <button
            onClick={() => onEdit(job)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors"
          >
            <Pencil size={16} />
            Edit
          </button>
          <button
            onClick={() => onDelete(job.id)}
            className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-red-50 hover:bg-red-100 text-red-600 rounded-lg transition-colors"
          >
            <Trash2 size={16} />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
}
