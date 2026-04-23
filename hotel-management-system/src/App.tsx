import { lazy, Suspense } from 'react'
import { Routes, Route, Navigate } from 'react-router-dom'
import { Spin } from 'antd'
import PrivateRoute from './components/common/PrivateRoute'
import RoleGuard from './components/common/RoleGuard'
import { StaffRole } from './types/enums'

// Lazy loading
const Login = lazy(() => import('./pages/Login'))
const AppLayout = lazy(() => import('./components/layout/AppLayout'))
const Dashboard = lazy(() => import('./pages/Dashboard/Dashboard'))
const GuestList = lazy(() => import('./pages/Guests/GuestList'))
const RoomList = lazy(() => import('./pages/Rooms/RoomList'))
const BookingList = lazy(() => import('./pages/Bookings/BookingList'))
const CheckIn = lazy(() => import('./pages/Bookings/CheckIn'))
const CheckOut = lazy(() => import('./pages/Bookings/CheckOut'))
const PaymentList = lazy(() => import('./pages/Payments/PaymentList'))
const StaffList = lazy(() => import('./pages/Staff/StaffList'))
const ServiceList = lazy(() => import('./pages/Services/ServiceList'))
const ServiceOrders = lazy(() => import('./pages/Services/ServiceOrders'))
const RevenueReport = lazy(() => import('./pages/Reports/RevenueReport'))
const OccupancyReport = lazy(() => import('./pages/Reports/OccupancyReport'))
const GuestStats = lazy(() => import('./pages/Reports/GuestStats'))

const LoadingFallback = () => (
  <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
    <Spin size="large" tip="Yuklanmoqda..." />
  </div>
)

const ALL_ROLES = [StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.RECEPTIONIST, StaffRole.HOUSEKEEPER, StaffRole.ACCOUNTANT]
const ADMIN_MANAGER = [StaffRole.ADMIN, StaffRole.MANAGER]
const ADMIN_MANAGER_RECEPTIONIST = [StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.RECEPTIONIST]
const ADMIN_MANAGER_ACCOUNTANT = [StaffRole.ADMIN, StaffRole.MANAGER, StaffRole.ACCOUNTANT]

export default function App() {
  return (
    <Suspense fallback={<LoadingFallback />}>
      <Routes>
        {/* Public routes */}
        <Route path="/login" element={<Login />} />

        {/* Protected routes */}
        <Route
          path="/"
          element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }
        >
          <Route index element={<Navigate to="/dashboard" replace />} />

          <Route path="dashboard" element={
            <RoleGuard allowedRoles={ALL_ROLES}>
              <Dashboard />
            </RoleGuard>
          } />

          <Route path="guests" element={
            <RoleGuard allowedRoles={ADMIN_MANAGER_RECEPTIONIST}>
              <GuestList />
            </RoleGuard>
          } />

          <Route path="rooms" element={
            <RoleGuard allowedRoles={ALL_ROLES}>
              <RoomList />
            </RoleGuard>
          } />

          <Route path="bookings" element={
            <RoleGuard allowedRoles={ADMIN_MANAGER_RECEPTIONIST}>
              <BookingList />
            </RoleGuard>
          } />

          <Route path="bookings/check-in" element={
            <RoleGuard allowedRoles={ADMIN_MANAGER_RECEPTIONIST}>
              <CheckIn />
            </RoleGuard>
          } />

          <Route path="bookings/check-out" element={
            <RoleGuard allowedRoles={ADMIN_MANAGER_RECEPTIONIST}>
              <CheckOut />
            </RoleGuard>
          } />

          <Route path="payments" element={
            <RoleGuard allowedRoles={ADMIN_MANAGER_ACCOUNTANT}>
              <PaymentList />
            </RoleGuard>
          } />

          <Route path="staff" element={
            <RoleGuard allowedRoles={ADMIN_MANAGER}>
              <StaffList />
            </RoleGuard>
          } />

          <Route path="services" element={
            <RoleGuard allowedRoles={ALL_ROLES}>
              <ServiceList />
            </RoleGuard>
          } />

          <Route path="services/orders" element={
            <RoleGuard allowedRoles={ALL_ROLES}>
              <ServiceOrders />
            </RoleGuard>
          } />

          <Route path="reports/revenue" element={
            <RoleGuard allowedRoles={ADMIN_MANAGER_ACCOUNTANT}>
              <RevenueReport />
            </RoleGuard>
          } />

          <Route path="reports/occupancy" element={
            <RoleGuard allowedRoles={ADMIN_MANAGER}>
              <OccupancyReport />
            </RoleGuard>
          } />

          <Route path="reports/guests" element={
            <RoleGuard allowedRoles={ADMIN_MANAGER}>
              <GuestStats />
            </RoleGuard>
          } />
        </Route>

        {/* 404 */}
        <Route path="*" element={
          <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', minHeight: '100vh' }}>
            <div style={{ textAlign: 'center' }}>
              <h1 style={{ fontSize: 72, color: '#1677ff' }}>404</h1>
              <p>Sahifa topilmadi</p>
              <a href="/">Bosh sahifaga qaytish</a>
            </div>
          </div>
        } />
      </Routes>
    </Suspense>
  )
}
