import { LoginForm } from '@/components/auth/LoginForm';
import { Calendar, Sparkles, Shield, Zap, TrendingUp } from 'lucide-react';
import { banners } from '@/lib/designSystem';

export function LoginPage() {
  return (
    <div className="min-h-screen flex">
      {/* Left side - Premium Branding */}
      <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900">
        {/* Banner Image Overlay */}
        <div
          className="absolute inset-0 opacity-10 bg-cover bg-center"
          style={{
            backgroundImage: `url(${banners.hero})`,
          }}
        />

        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-30"></div>

        {/* Gradient Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl opacity-20 animate-pulse delay-1000"></div>

        <div className="relative z-10 flex items-center justify-center p-12 w-full">
          <div className="max-w-md w-full space-y-8 text-white">
            {/* Logo */}
            <div className="flex items-center justify-center w-24 h-24 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-3xl shadow-2xl mb-8 mx-auto">
              <Calendar className="w-12 h-12 text-white" />
            </div>

            {/* Heading */}
            <div className="text-center">
              <h1 className="text-5xl font-bold mb-4">
                Welcome Back
              </h1>
              <p className="text-2xl bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 bg-clip-text text-transparent font-semibold">
                Event Management
              </p>
              <p className="text-xl text-indigo-200 mt-4">
                Sign in to manage your events and grow your audience.
              </p>
            </div>

            {/* Features */}
            <div className="mt-12 space-y-6">
              <div className="flex items-start space-x-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-blue-400 to-indigo-500 rounded-xl flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Lightning Fast Setup</h3>
                  <p className="text-indigo-200">Create events in minutes with our intuitive platform</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-purple-400 to-pink-500 rounded-xl flex items-center justify-center">
                    <Shield className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Secure & Reliable</h3>
                  <p className="text-indigo-200">Bank-level security for all your transactions</p>
                </div>
              </div>

              <div className="flex items-start space-x-4 bg-white/10 backdrop-blur-sm rounded-2xl p-4 border border-white/20">
                <div className="flex-shrink-0">
                  <div className="w-10 h-10 bg-gradient-to-br from-green-400 to-emerald-500 rounded-xl flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                </div>
                <div>
                  <h3 className="text-lg font-semibold">Advanced Analytics</h3>
                  <p className="text-indigo-200">Real-time insights and performance tracking</p>
                </div>
              </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4 mt-8 pt-8 border-t border-white/20">
              <div className="text-center">
                <div className="text-2xl font-bold">10K+</div>
                <div className="text-sm text-indigo-200">Events</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">50K+</div>
                <div className="text-sm text-indigo-200">Users</div>
              </div>
              <div className="text-center">
                <div className="text-2xl font-bold">98%</div>
                <div className="text-sm text-indigo-200">Satisfaction</div>
              </div>
            </div>
          </div>
        </div>
      </div>
      
      {/* Right side - Login form */}
      <div className="w-full lg:w-1/2 flex items-center justify-center bg-gradient-to-br from-slate-50 via-white to-slate-50 p-8">
        <div className="max-w-md w-full">
          {/* Mobile Logo */}
          <div className="lg:hidden text-center mb-10">
            <div className="flex justify-center mb-6">
              <div className="flex items-center justify-center w-20 h-20 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-3xl shadow-xl">
                <Calendar className="w-10 h-10 text-white" />
              </div>
            </div>
            <h1 className="text-4xl font-bold text-gray-900 mb-2">Event Management</h1>
            <p className="text-gray-600">Sign in to your account</p>
          </div>

          {/* Premium Badge */}
          <div className="hidden lg:flex items-center justify-center gap-2 bg-indigo-50 px-4 py-2 rounded-full text-indigo-600 text-sm mb-8 font-medium w-fit mx-auto">
            <Sparkles className="w-4 h-4" />
            <span>Premium Event Platform</span>
          </div>

          {/* Form Container */}
          <div className="bg-white rounded-3xl shadow-2xl p-8 border border-gray-100">
            <div className="mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-2">Welcome Back</h2>
              <p className="text-gray-600">Please sign in to continue</p>
            </div>

            <LoginForm />
          </div>

        </div>
      </div>
    </div>
  );
}