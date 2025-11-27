import { Routes, Route } from 'react-router-dom'
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
import { TicketSalesPage } from './pages/TicketSalesPage'
import { MyTicketsPage } from './pages/MyTicketsPage'
import AdminQRValidationPage from './pages/AdminQRValidationPage'
import AdminDashboardPage from './pages/AdminDashboardPage'
import EventAnalyticsPage from './pages/EventAnalyticsPage'
import { ProtectedRoute } from './components/auth/ProtectedRoute'
import { Navigation } from './components/layout/Navigation'

function App() {
  return (
    <div className="min-h-screen bg-background">
      <Navigation />
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
          path="/tickets"
          element={
            <ProtectedRoute requiredRoles={['event_creator']}>
              <TicketSalesPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/profile"
          element={
            <ProtectedRoute>
              <MyTicketsPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/qr-validation"
          element={
            <ProtectedRoute requiredRoles={['event_creator', 'website_owner']}>
              <AdminQRValidationPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute requiredRoles={['event_creator', 'website_owner']}>
              <AdminDashboardPage />
            </ProtectedRoute>
          }
        />
        <Route
          path="/events/:id/analytics"
          element={
            <ProtectedRoute requiredRoles={['event_creator', 'website_owner']}>
              <EventAnalyticsPage />
            </ProtectedRoute>
          }
        />
      </Routes>
    </div>
  )
}

export default App