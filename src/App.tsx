import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import PublicLayout from './components/layout/PublicLayout';
import AdminLayout from './components/layout/AdminLayout';
import ProtectedRoute from './components/ProtectedRoute';

import Landing from './pages/Landing';
import Booking from './pages/Booking';
import Checkout from './pages/Checkout';
import Success from './pages/Success';
import Track from './pages/Track';
import Demo from './pages/Demo';
import Login from './pages/Login';

import Dashboard from './pages/admin/Dashboard';
import AdminBookings from './pages/admin/Bookings';
import AdminCustomers from './pages/admin/Customers';
import CourtSettings from './pages/admin/CourtSettings';
import AdminPricing from './pages/admin/Pricing';
import AdminReports from './pages/admin/Reports';

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Public routes */}
        <Route element={<PublicLayout />}>
          <Route path="/" element={<Landing />} />
          <Route path="/book" element={<Booking />} />
          <Route path="/book/checkout" element={<Checkout />} />
          <Route path="/book/success" element={<Success />} />
          <Route path="/track" element={<Track />} />
          <Route path="/demo" element={<Demo />} />
        </Route>

        {/* Auth */}
        <Route path="/login" element={<Login />} />

        {/* Admin routes */}
        <Route element={<ProtectedRoute />}>
          <Route element={<AdminLayout />}>
            <Route path="/admin" element={<Dashboard />} />
            <Route path="/admin/bookings" element={<AdminBookings />} />
            <Route path="/admin/customers" element={<AdminCustomers />} />
            <Route path="/admin/court" element={<CourtSettings />} />
            <Route path="/admin/pricing" element={<AdminPricing />} />
            <Route path="/admin/reports" element={<AdminReports />} />
          </Route>
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

