import { Routes, Route } from 'react-router-dom'
import { useAuthStore } from './store/useAuthStore'
import { LoginPage } from './pages/LoginPage'
import { RegisterPage } from './pages/RegisterPage'
import { DashboardPage } from './pages/DashboardPage'
import { CreateEventPage } from './pages/CreateEventPage'
import { EventsPage } from './pages/EventsPage'
import { HomePage } from './pages/HomePage'
import { EventDetail } from './components/events/EventDetail'
import { EditEventForm } from './components/events/EditEventForm'
import { TicketManagementPage } from './pages/TicketManagementPage'
import { TicketPurchasePage } from './pages/TicketPurchasePage'
import { ProtectedRoute } from './components/auth/ProtectedRoute'

function App() {
  const { isAuthenticated } = useAuthStore()

  return (
    <div className="min-h-screen bg-background">
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/events" element={<EventsPage />} />
        <Route path="/events/:id" element={<EventDetail />} />
        <Route path="/login" element={<LoginPage />} />
        <Route path="/register" element={<RegisterPage />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <DashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/create-event"
          element={
            <ProtectedRoute>
              <CreateEventPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/:id/edit"
          element={
            <ProtectedRoute>
              <EditEventForm />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/:eventId/tickets"
          element={
            <ProtectedRoute>
              <TicketManagementPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/:id/purchase"
          element={
            <TicketPurchasePage />
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <div>Profile Page</div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  )
}

export default App