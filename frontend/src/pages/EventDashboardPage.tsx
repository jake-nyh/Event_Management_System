import React from 'react';
import { EventDashboard } from '@/components/events/EventDashboard';
import { ProtectedRoute } from '@/components/auth/ProtectedRoute';

export function EventDashboardPage() {
  return (
    <ProtectedRoute>
      <div className="container mx-auto py-8">
        <EventDashboard />
      </div>
    </ProtectedRoute>
  );
}