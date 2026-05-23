import Link from 'next/link';
import { Mail, Clock, Users, BarChart, CheckCircle, Zap, Shield, Globe } from 'lucide-react';

export default function LandingPage() {
  return (
    <div className="bg-white">
      {/* Hero Section */}
      <section className="relative overflow-hidden">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24">
          <div className="text-center">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 mb-6">
              Schedule Emails at
              <span className="text-blue-600"> Scale</span>
            </h1>
            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Send personalized email campaigns to thousands of customers with intelligent scheduling,
              batch processing, and detailed analytics.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <Link
                href="/register"
                className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 font-semibold text-lg transition-colors"
              >
                Start Free Trial
              </Link>
              <Link
                href="/login"
                className="border-2 border-gray-300 text-gray-700 px-8 py-4 rounded-lg hover:border-gray-400 font-semibold text-lg transition-colors"
              >
                View Demo
              </Link>
            </div>
          </div>

          {/* Hero Image/Stats */}
          <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="text-center p-6 bg-blue-50 rounded-lg">
              <div className="text-4xl font-bold text-blue-600 mb-2">100K+</div>
              <div className="text-gray-600">Emails Sent Daily</div>
            </div>
            <div className="text-center p-6 bg-green-50 rounded-lg">
              <div className="text-4xl font-bold text-green-600 mb-2">99.9%</div>
              <div className="text-gray-600">Delivery Rate</div>
            </div>
            <div className="text-center p-6 bg-purple-50 rounded-lg">
              <div className="text-4xl font-bold text-purple-600 mb-2">24/7</div>
              <div className="text-gray-600">Automated Sending</div>
            </div>
          </div>
        </div>

        {/* Background Decoration */}
        <div className="absolute top-0 right-0 -z-10 opacity-10">
          <Mail className="w-96 h-96 text-blue-600" />
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-gray-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              Powerful Features for Modern Email Marketing
            </h2>
            <p className="text-xl text-gray-600 max-w-2xl mx-auto">
              Everything you need to manage and automate your email campaigns effectively
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: <Clock className="w-12 h-12 text-blue-600" />,
                title: 'Smart Scheduling',
                description: 'Schedule emails for specific days and time windows. Our intelligent system ensures optimal delivery times.',
              },
              {
                icon: <Users className="w-12 h-12 text-green-600" />,
                title: 'Batch Processing',
                description: 'Send to 100,000+ recipients efficiently. Automatic batch processing prevents overwhelming your SMTP server.',
              },
              {
                icon: <BarChart className="w-12 h-12 text-purple-600" />,
                title: 'Real-time Analytics',
                description: 'Track sent, failed, and pending emails. Monitor campaign performance with detailed statistics.',
              },
              {
                icon: <Zap className="w-12 h-12 text-yellow-600" />,
                title: 'Template System',
                description: 'Save and reuse email templates. Create once, send multiple times with just a click.',
              },
              {
                icon: <Shield className="w-12 h-12 text-red-600" />,
                title: 'Failure Recovery',
                description: 'Automatic retry for failed emails. Configure retry attempts and delays to ensure delivery.',
              },
              {
                icon: <Globe className="w-12 h-12 text-indigo-600" />,
                title: 'Rich Text Editor',
                description: 'Create beautiful HTML emails with our intuitive rich text editor. Add formatting, links, and more.',
              },
            ].map((feature, index) => (
              <div key={index} className="bg-white p-6 rounded-lg shadow-md hover:shadow-xl transition-shadow">
                <div className="mb-4">{feature.icon}</div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How It Works Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-gray-900 mb-4">
              How It Works
            </h2>
            <p className="text-xl text-gray-600">
              Get started in three simple steps
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                step: '1',
                title: 'Add Your Customers',
                description: 'Import or manually add customer details. Organize them with tags and company information.',
              },
              {
                step: '2',
                title: 'Compose Your Email',
                description: 'Use our rich text editor to create beautiful emails. Save templates for future use.',
              },
              {
                step: '3',
                title: 'Schedule & Send',
                description: 'Select recipients, choose a schedule, and let our system handle the rest automatically.',
              },
            ].map((item, index) => (
              <div key={index} className="text-center">
                <div className="w-16 h-16 bg-blue-600 text-white rounded-full flex items-center justify-center text-2xl font-bold mx-auto mb-4">
                  {item.step}
                </div>
                <h3 className="text-2xl font-semibold text-gray-900 mb-2">{item.title}</h3>
                <p className="text-gray-600">{item.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Benefits Section */}
      <section className="py-24 bg-blue-600">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-4xl font-bold text-white mb-4">
              Why Choose Email Scheduler?
            </h2>
            <p className="text-xl text-blue-100">
              Built for scale, designed for simplicity
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {[
              'Handle 100,000+ customers without breaking a sweat',
              'Automatic retry for failed deliveries',
              'Schedule emails for optimal engagement times',
              'Real-time tracking and analytics',
              'Rich text editing with HTML support',
              'File attachments up to 10MB per email',
              'Batch processing for large campaigns',
              'Template system for quick sending',
            ].map((benefit, index) => (
              <div key={index} className="flex items-start space-x-3">
                <CheckCircle className="w-6 h-6 text-green-300 flex-shrink-0 mt-1" />
                <span className="text-white text-lg">{benefit}</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24">
        <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-4xl font-bold text-gray-900 mb-4">
            Ready to Transform Your Email Marketing?
          </h2>
          <p className="text-xl text-gray-600 mb-8">
            Join thousands of businesses using Email Scheduler to automate their campaigns
          </p>
          <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
            <Link
              href="/register"
              className="bg-blue-600 text-white px-8 py-4 rounded-lg hover:bg-blue-700 font-semibold text-lg transition-colors"
            >
              Start Free Trial
            </Link>
            <Link
              href="/login"
              className="text-gray-700 hover:text-gray-900 font-semibold text-lg"
            >
              Already have an account? Sign in →
            </Link>
          </div>
        </div>
      </section>
    </div>
  );
}