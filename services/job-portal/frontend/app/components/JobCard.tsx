import Link from 'next/link';
import { Job } from '@/app/types';
import { MapPin, Briefcase, DollarSign, Clock } from 'lucide-react';
import { Card } from './ui/Card';
import { formatDistanceToNow } from 'date-fns';

interface JobCardProps {
  job: Job;
}

export default function JobCard({ job }: JobCardProps) {
  return (
    <Link href={`/jobs/${job._id}`}>
      <Card className="hover:shadow-lg transition-shadow cursor-pointer">
        <div className="flex items-start justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              {job.company?.logo && (
                <img
                  src={job.company.logo}
                  alt={job.company?.name || 'Company logo'}
                  className="w-10 h-10 rounded-lg object-cover"
                />
              )}

              <div>
                <h3 className="font-semibold text-lg">{job.title}</h3>
                <p className="text-sm text-gray-600">
                  {job.company?.name || 'Unknown Company'}
                </p>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 text-sm text-gray-600 mb-3">
              <div className="flex items-center">
                <MapPin className="w-4 h-4 mr-1" />
                {job.location.remote ? 'Remote' : `${job.location.city}, ${job.location.country}`}
              </div>
              <div className="flex items-center">
                <Briefcase className="w-4 h-4 mr-1" />
                {job.jobType.replace('_', ' ')}
              </div>
              {job.salary.min && (
                <div className="flex items-center">
                  <DollarSign className="w-4 h-4 mr-1" />
                  {job.salary.min.toLocaleString()} - {job.salary.max?.toLocaleString()} / {job.salary.period}
                </div>
              )}
              <div className="flex items-center">
                <Clock className="w-4 h-4 mr-1" />
                {formatDistanceToNow(new Date(job.createdAt), { addSuffix: true })}
              </div>
            </div>

            <div className="flex flex-wrap gap-2 mb-3">
              {job.skills.slice(0, 5).map((skill, index) => (
                <span
                  key={index}
                  className="px-3 py-1 bg-primary-100 text-primary-700 rounded-full text-xs font-medium"
                >
                  {skill}
                </span>
              ))}
              {job.skills.length > 5 && (
                <span className="px-3 py-1 bg-gray-100 text-gray-700 rounded-full text-xs font-medium">
                  +{job.skills.length - 5} more
                </span>
              )}
            </div>

            <p className="text-gray-700 line-clamp-2">{job.description}</p>
          </div>

          {job.isFeatured && (
            <span className="ml-4 px-3 py-1 bg-yellow-100 text-yellow-800 text-xs font-semibold rounded-full">
              Featured
            </span>
          )}
        </div>
      </Card>
    </Link>
  );
}