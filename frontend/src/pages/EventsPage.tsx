import { Link } from 'react-router-dom';
import { EventList } from '@/components/events/EventList';
import { useAuthStore } from '@/store/useAuthStore';
import { Button } from '@/components/ui/button';
import { Plus, Sparkles } from 'lucide-react';
import { banners } from '@/lib/designSystem';

export function EventsPage() {
  const { user } = useAuthStore();
  const isCreator = user?.role === 'event_creator';

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-slate-50">
      {/* Hero Banner Section */}
      <section className="relative overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-900 to-indigo-900">
        {/* Banner Image Overlay */}
        <div
          className="absolute inset-0 opacity-20 bg-cover bg-center"
          style={{
            backgroundImage: `url(${banners.events})`,
          }}
        />

        {/* Background Pattern */}
        <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxwYXRoIGQ9Ik0zNiAxOGMzLjMxNCAwIDYgMi42ODYgNiA2cy0yLjY4NiA2LTYgNi02LTIuNjg2LTYtNiAyLjY4Ni02IDYtNnoiIHN0cm9rZT0icmdiYSgyNTUsMjU1LDI1NSwwLjAzKSIgc3Ryb2tlLXdpZHRoPSIyIi8+PC9nPjwvc3ZnPg==')] opacity-40"></div>

        {/* Gradient Orbs */}
        <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500 rounded-full filter blur-3xl opacity-20 animate-pulse"></div>
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-indigo-500 rounded-full filter blur-3xl opacity-20 animate-pulse delay-1000"></div>

        <div className="container mx-auto px-4 py-16 md:py-24 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-white/10 backdrop-blur-sm px-4 py-2 rounded-full text-white/90 text-sm mb-6 border border-white/20">
              <Sparkles className="w-4 h-4" />
              <span>{isCreator ? 'Your Events Dashboard' : 'Explore Events'}</span>
            </div>

            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-white leading-tight">
              {isCreator ? (
                <>
                  Manage Your
                  <span className="block mt-2 bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 bg-clip-text text-transparent">
                    Event Portfolio
                  </span>
                </>
              ) : (
                <>
                  Discover Amazing
                  <span className="block mt-2 bg-gradient-to-r from-purple-300 via-pink-300 to-indigo-300 bg-clip-text text-transparent">
                    Events Near You
                  </span>
                </>
              )}
            </h1>

            <p className="text-xl md:text-2xl mb-8 text-indigo-100 max-w-2xl mx-auto">
              {isCreator
                ? 'Create, manage, and track all your events in one powerful platform.'
                : 'Find concerts, conferences, workshops, and more. Book tickets instantly.'
              }
            </p>

            {isCreator && (
              <Link to="/create-event">
                <Button size="lg" className="bg-white text-indigo-900 hover:bg-indigo-50 shadow-xl shadow-indigo-900/50 px-8 py-6 text-lg font-semibold group">
                  <Plus className="mr-2 w-5 h-5" />
                  Create New Event
                </Button>
              </Link>
            )}

            {/* Stats */}
            {!isCreator && (
              <div className="mt-12 grid grid-cols-3 gap-6 max-w-2xl mx-auto">
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">500+</div>
                  <div className="text-indigo-200 text-sm">Live Events</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">50K+</div>
                  <div className="text-indigo-200 text-sm">Attendees</div>
                </div>
                <div className="text-center">
                  <div className="text-3xl font-bold text-white mb-1">100+</div>
                  <div className="text-indigo-200 text-sm">Categories</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Wave Separator */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg className="w-full h-auto" viewBox="0 0 1440 120" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0,64L80,69.3C160,75,320,85,480,80C640,75,800,53,960,48C1120,43,1280,53,1360,58.7L1440,64L1440,120L1360,120C1280,120,1120,120,960,120C800,120,640,120,480,120C320,120,160,120,80,120L0,120Z" fill="rgb(248, 250, 252)"/>
          </svg>
        </div>
      </section>

      {/* Events List Section */}
      <section className="py-12">
        <div className="container mx-auto px-4">
          <EventList showFilters={true} />
        </div>
      </section>
    </div>
  );
}