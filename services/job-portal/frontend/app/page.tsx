import Link from 'next/link';
import { Search, Briefcase, Users, TrendingUp } from 'lucide-react';
import { Button } from './components/ui/Button';

export default function Home() {
  return (
    <div>
      {/* Hero Section */}
      <section className="bg-linear-to-r from-primary-600 to-primary-800 text-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold mb-6">
              Find Your Dream Job Today
            </h1>
            <p className="text-xl md:text-2xl mb-8 text-primary-100">
              Connect with top employers and discover opportunities that match your skills
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link href="/jobs">
                <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                  Browse Jobs
                </Button>
              </Link>
              <Link href="/register">
                <Button size="lg" variant="outline" className="w-full sm:w-auto bg-white text-primary-600 hover:bg-gray-100">
                  Get Started
                </Button>
              </Link>
            </div>
          </div>

          {/* Search Bar */}
          <div className="mt-12 max-w-4xl mx-auto">
            <div className="bg-white rounded-lg shadow-lg p-4">
              <form className="flex flex-col md:flex-row gap-4">
                <input
                  type="text"
                  placeholder="Job title or keyword"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                />
                <input
                  type="text"
                  placeholder="Location"
                  className="flex-1 px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent text-gray-900"
                />
                <Button type="submit" size="lg" className="md:w-auto">
                  <Search className="w-5 h-5 mr-2" />
                  Search
                </Button>
              </form>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-4xl font-bold text-center mb-12 text-gray-900">
            Why Choose JobPortal?
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Briefcase className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                Thousands of Jobs
              </h3>
              <p className="text-gray-600">
                Access to thousands of job opportunities from top companies worldwide
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                Trusted Companies
              </h3>
              <p className="text-gray-600">
                Connect with verified employers and startups looking for talent
              </p>
            </div>
            <div className="text-center">
              <div className="bg-primary-100 w-16 h-16 rounded-full flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-primary-600" />
              </div>
              <h3 className="text-xl font-semibold mb-2 text-gray-900">
                Career Growth
              </h3>
              <p className="text-gray-600">
                Get personalized recommendations and grow your career
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="bg-gray-100 py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold mb-4 text-gray-900">
            Ready to Get Started?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of job seekers and employers on our platform
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/register?role=job_seeker">
              <Button size="lg" className="w-full sm:w-auto">
                I'm Looking for a Job
              </Button>
            </Link>
            <Link href="/register?role=employer">
              <Button size="lg" variant="secondary" className="w-full sm:w-auto">
                I'm Hiring
              </Button>
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}