import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ProtectedRoute } from './ProtectedRoute';
import { DashboardLayout } from '../components/layout/DashboardLayout';

// Public Pages
import { Landing } from '../pages/Landing';
import { Login } from '../pages/Login';
import { Register } from '../pages/Register';
import { ForgotPassword } from '../pages/ForgotPassword';

// Student Pages
import { StudentDashboard } from '../pages/student/StudentDashboard';
import { CreateComplaint } from '../pages/student/CreateComplaint';
import { EmergencyReport } from '../pages/student/EmergencyReport';
import { MyComplaints } from '../pages/student/MyComplaints';
import { StudentComplaintDetail } from '../pages/student/StudentComplaintDetail';
import { LeaveFormPage } from '../pages/student/LeaveFormPage';
import { MyLeaveRequestsPage } from '../pages/student/MyLeaveRequestsPage';
import { FoodCountPage } from '../pages/student/FoodCountPage';
import { SuggestionsPage } from '../pages/student/SuggestionsPage';
import { AnnouncementsPage } from '../pages/student/AnnouncementsPage';
import { PrivacyCenter } from '../pages/student/PrivacyCenter';

// Management & Staff Pages
import { ManagementDashboard } from '../pages/management/ManagementDashboard';
import { ComplaintsList } from '../pages/management/ComplaintsList';
import { ManagementComplaintDetail } from '../pages/management/ManagementComplaintDetail';
import { EmergencyQueue } from '../pages/management/EmergencyQueue';
import { LeaveApprovalsPage } from '../pages/management/LeaveApprovalsPage';
import { FoodCountManagementPage } from '../pages/management/FoodCountManagementPage';
import { ManagementAnalytics } from '../pages/management/ManagementAnalytics';
import { ManagementSuggestions } from '../pages/management/ManagementSuggestions';
import { ManagementAnnouncements } from '../pages/management/ManagementAnnouncements';
import { AuditLogs } from '../pages/management/AuditLogs';
import { ManagementSettings } from '../pages/management/ManagementSettings';

// Dedicated Portals
import { AdminDashboard } from '../pages/admin/AdminDashboard';
import { ChefMessDashboard } from '../pages/chef/ChefMessDashboard';
import { WatchmanScannerPage } from '../pages/watchman/WatchmanScannerPage';
import { CollegeManagementPortal } from '../pages/management/CollegeManagementPortal';

export const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Public Pages */}
      <Route path="/" element={<Landing />} />
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />
      <Route path="/forgot-password" element={<ForgotPassword />} />

      {/* Student Protected Routes */}
      <Route
        path="/student/dashboard"
        element={
          <ProtectedRoute allowedRoles={['student', 'guest_student']}>
            <DashboardLayout>
              <StudentDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/create"
        element={
          <ProtectedRoute allowedRoles={['student', 'guest_student']}>
            <DashboardLayout>
              <CreateComplaint />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/emergency"
        element={
          <ProtectedRoute allowedRoles={['student', 'guest_student']}>
            <DashboardLayout>
              <EmergencyReport />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/my-reports"
        element={
          <ProtectedRoute allowedRoles={['student', 'guest_student']}>
            <DashboardLayout>
              <MyComplaints />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/complaints/:id"
        element={
          <ProtectedRoute allowedRoles={['student', 'guest_student']}>
            <DashboardLayout>
              <StudentComplaintDetail />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/leave/apply"
        element={
          <ProtectedRoute allowedRoles={['student', 'guest_student']}>
            <DashboardLayout>
              <LeaveFormPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/leave/requests"
        element={
          <ProtectedRoute allowedRoles={['student', 'guest_student']}>
            <DashboardLayout>
              <MyLeaveRequestsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/food-count"
        element={
          <ProtectedRoute allowedRoles={['student', 'guest_student']}>
            <DashboardLayout>
              <FoodCountPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/suggestions"
        element={
          <ProtectedRoute allowedRoles={['student', 'guest_student']}>
            <DashboardLayout>
              <SuggestionsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/announcements"
        element={
          <ProtectedRoute allowedRoles={['student', 'guest_student']}>
            <DashboardLayout>
              <AnnouncementsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/student/privacy"
        element={
          <ProtectedRoute allowedRoles={['student', 'guest_student']}>
            <DashboardLayout>
              <PrivacyCenter />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* University Admin Control Center */}
      <Route
        path="/admin"
        element={
          <ProtectedRoute allowedRoles={['admin', 'super_admin', 'warden']}>
            <DashboardLayout>
              <AdminDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Watchman Gate Camera Scanner Portal */}
      <Route
        path="/watchman/scanner"
        element={
          <ProtectedRoute allowedRoles={['watchman', 'warden', 'admin', 'super_admin']}>
            <DashboardLayout>
              <WatchmanScannerPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Chef & Mess Kitchen Portal */}
      <Route
        path="/chef/dashboard"
        element={
          <ProtectedRoute allowedRoles={['chef', 'warden', 'admin', 'super_admin']}>
            <DashboardLayout>
              <ChefMessDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* College Management & Classroom Operations Portal */}
      <Route
        path="/college-management/dashboard"
        element={
          <ProtectedRoute allowedRoles={['college_management', 'admin', 'super_admin', 'warden', 'department_staff']}>
            <DashboardLayout>
              <CollegeManagementPortal />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Management Protected Routes */}
      <Route
        path="/management/dashboard"
        element={
          <ProtectedRoute allowedRoles={['warden', 'college_management', 'department_staff', 'admin', 'super_admin', 'chef', 'watchman']}>
            <DashboardLayout>
              <ManagementDashboard />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/management/complaints"
        element={
          <ProtectedRoute allowedRoles={['warden', 'college_management', 'department_staff', 'admin', 'super_admin']}>
            <DashboardLayout>
              <ComplaintsList />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/management/complaints/:id"
        element={
          <ProtectedRoute allowedRoles={['warden', 'college_management', 'department_staff', 'admin', 'super_admin']}>
            <DashboardLayout>
              <ManagementComplaintDetail />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/management/emergency-queue"
        element={
          <ProtectedRoute allowedRoles={['warden', 'college_management', 'department_staff', 'admin', 'super_admin', 'watchman']}>
            <DashboardLayout>
              <EmergencyQueue />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/management/leave-approvals"
        element={
          <ProtectedRoute allowedRoles={['warden', 'department_staff', 'admin', 'super_admin', 'watchman']}>
            <DashboardLayout>
              <LeaveApprovalsPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/management/food-count"
        element={
          <ProtectedRoute allowedRoles={['warden', 'department_staff', 'admin', 'super_admin', 'chef']}>
            <DashboardLayout>
              <FoodCountManagementPage />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/management/analytics"
        element={
          <ProtectedRoute allowedRoles={['warden', 'college_management', 'department_staff', 'admin', 'super_admin']}>
            <DashboardLayout>
              <ManagementAnalytics />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/management/suggestions"
        element={
          <ProtectedRoute allowedRoles={['warden', 'college_management', 'department_staff', 'admin', 'super_admin']}>
            <DashboardLayout>
              <ManagementSuggestions />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/management/announcements"
        element={
          <ProtectedRoute allowedRoles={['warden', 'college_management', 'department_staff', 'admin', 'super_admin']}>
            <DashboardLayout>
              <ManagementAnnouncements />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/management/audit-logs"
        element={
          <ProtectedRoute allowedRoles={['warden', 'college_management', 'department_staff', 'admin', 'super_admin']}>
            <DashboardLayout>
              <AuditLogs />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />
      <Route
        path="/management/settings"
        element={
          <ProtectedRoute allowedRoles={['warden', 'department_staff', 'admin', 'super_admin']}>
            <DashboardLayout>
              <ManagementSettings />
            </DashboardLayout>
          </ProtectedRoute>
        }
      />

      {/* Fallback */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
};
