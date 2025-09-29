import {
  Briefcase,
  Users,
  MessageSquare,
  Star,
  CheckCircle,
  TrendingUp,
  Shield,
} from "lucide-react";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-50 to-indigo-100 dark:from-blue-950/20 dark:to-indigo-950/20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 lg:py-32">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            <div>
              <h1 className="text-4xl lg:text-6xl font-bold text-gray-900 dark:text-white mb-6 text-balance">
                Welcome to your
                <span className="text-blue-600"> professional community</span>
              </h1>
              <p className="text-xl text-gray-600 dark:text-gray-300 mb-8 text-pretty">
                Connect with professionals worldwide, showcase your expertise,
                and discover opportunities that advance your career.
              </p>
            </div>
            <div className="relative">
              <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-2xl p-8 border border-gray-200 dark:border-gray-700">
                <div className="flex items-center space-x-4 mb-6">
                  <div className="w-12 h-12 bg-blue-100 dark:bg-blue-900/30 rounded-full flex items-center justify-center">
                    <Users className="h-6 w-6 text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-semibold text-gray-900 dark:text-white">
                      Professional Network
                    </h3>
                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      Connect with industry leaders
                    </p>
                  </div>
                </div>
                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Build meaningful connections
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Showcase your projects
                    </span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <CheckCircle className="h-5 w-5 text-green-500" />
                    <span className="text-sm text-gray-700 dark:text-gray-300">
                      Get verified client feedback
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-24 bg-white dark:bg-gray-900">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-16">
            <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 dark:text-white mb-4">
              Everything you need to grow professionally
            </h2>
            <p className="text-xl text-gray-600 dark:text-gray-300 max-w-3xl mx-auto">
              ProNet combines traditional networking with modern freelancer
              tools to help you build your career.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            <div className="text-center p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <div className="bg-blue-100 dark:bg-blue-900/30 p-4 rounded-full w-fit mx-auto mb-6">
                <Users className="h-8 w-8 text-blue-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Professional Networking
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Connect with industry professionals, send connection requests,
                and build your network organically.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-full w-fit mx-auto mb-6">
                <Briefcase className="h-8 w-8 text-green-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Project Showcase
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Display your work with auto-detected platform icons from GitHub,
                Figma, Dribbble, and more.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <div className="bg-purple-100 dark:bg-purple-900/30 p-4 rounded-full w-fit mx-auto mb-6">
                <Star className="h-8 w-8 text-purple-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Verified Feedback
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Build credibility with verified client feedback, ratings, and
                detailed job history.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <div className="bg-orange-100 dark:bg-orange-900/30 p-4 rounded-full w-fit mx-auto mb-6">
                <MessageSquare className="h-8 w-8 text-orange-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Direct Messaging
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Communicate seamlessly with your professional contacts through
                our integrated messaging system.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <div className="bg-red-100 dark:bg-red-900/30 p-4 rounded-full w-fit mx-auto mb-6">
                <TrendingUp className="h-8 w-8 text-red-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Career Growth
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Track your professional journey with detailed analytics and
                performance insights.
              </p>
            </div>

            <div className="text-center p-8 rounded-2xl border border-gray-200 dark:border-gray-700 hover:shadow-lg transition-shadow">
              <div className="bg-indigo-100 dark:bg-indigo-900/30 p-4 rounded-full w-fit mx-auto mb-6">
                <Shield className="h-8 w-8 text-indigo-600" />
              </div>
              <h3 className="text-xl font-semibold text-gray-900 dark:text-white mb-4">
                Secure Platform
              </h3>
              <p className="text-gray-600 dark:text-gray-400">
                Your data is protected with enterprise-grade security and
                privacy controls.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 bg-blue-600">
        <div className="max-w-4xl mx-auto text-center px-4 sm:px-6 lg:px-8">
          <h2 className="text-3xl lg:text-4xl font-bold text-white mb-6">
            Ready to advance your career?
          </h2>
          <p className="text-xl text-blue-100 mb-8">
            Join thousands of professionals who are already building their
            future on ProNet.
          </p>
        </div>
      </section>
    </div>
  );
}
