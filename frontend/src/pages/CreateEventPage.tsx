import React from 'react';
import { useNavigate } from 'react-router-dom';
import { EventForm } from '@/components/events/EventForm';
import { useAuthStore } from '@/store/useAuthStore';

export function CreateEventPage() {
  const navigate = useNavigate();
  const { user } = useAuthStore();

  // Redirect if user is not an event creator
  React.useEffect(() => {
    if (user && user.role !== 'event_creator') {
      navigate('/dashboard');
    }
  }, [user, navigate]);

  const handleEventCreated = () => {
    navigate('/dashboard');
  };

  if (!user) {
    return <div>Loading...</div>;
  }

  if (user.role !== 'event_creator') {
    return (
      <div className="container mx-auto py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-red-600 mb-4">Access Denied</h1>
          <p className="text-gray-600">Only event creators can create events.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto py-8">
      <EventForm onSuccess={handleEventCreated} />
    </div>
  );
}