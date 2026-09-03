import { createBrowserRouter, RouterProvider, Navigate } from "react-router-dom";
import { useAuth } from "../hooks/useAuth";
import { ProtectedRoute } from "../components/layout/ProtectedRoute";
import { Layout } from "../components/layout/Layout";

import Landing from "../pages/Landing";
import Login from "../pages/Login";
import Unauthorized from "../pages/Unauthorized";
import NotFound from "../pages/NotFound";

import AdminDashboard from "../pages/admin/Dashboard";
import StaffManagement from "../pages/admin/StaffManagement";
import AdminManagement from "../pages/admin/AdminManagement";
import AdminTestList from "../pages/shared/TestList";
import AdminResults from "../pages/shared/Results";
import AdminMalpractice from "../pages/shared/Malpractice";
import CreateTest from "../pages/shared/CreateTest";
import EditTest from "../pages/shared/EditTest";
import StudentManagement from "../pages/staff/StudentManagement";
import StaffDashboard from "../pages/staff/Dashboard";
import StudentDashboard from "../pages/student/Dashboard";
import Instructions from "../pages/student/Instructions";
import Exam from "../pages/student/Exam";
import Result from "../pages/student/Result";
import Results from "../pages/shared/Results";
import Malpractice from "../pages/shared/Malpractice";

function RoleRedirect() {
  const { profile, loading } = useAuth();
  if (loading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;
  if (!profile) return <Navigate to="/login" replace />;
  if (profile.role === "admin") return <Navigate to="/admin" replace />;
  if (profile.role === "staff") return <Navigate to="/staff" replace />;
  return <Navigate to="/student" replace />;
}

const adminNav = [
  { label: "Dashboard", path: "/admin" },
  { label: "Admins", path: "/admin/admins" },
  { label: "Staff", path: "/admin/staff" },
  { label: "Students", path: "/admin/students" },
  { label: "Tests", path: "/admin/tests" },
  { label: "Results", path: "/admin/results" },
  { label: "Malpractice", path: "/admin/malpractice" },
];
const staffNav = [
  { label: "Dashboard", path: "/staff" },
  { label: "Students", path: "/staff/students" },
  { label: "Tests", path: "/staff/tests" },
  { label: "Results", path: "/staff/results" },
  { label: "Malpractice", path: "/staff/malpractice" },
];
const studentNav = [
  { label: "Dashboard", path: "/student" },
  { label: "Results", path: "/student/results" },
];

export function AppRouter() {
  const router = createBrowserRouter([
    { path: "/", element: <Landing /> },
    { path: "/login", element: <Login /> },
    { path: "/unauthorized", element: <Unauthorized /> },
    { path: "/dashboard", element: <RoleRedirect /> },

    // Admin
    {
      path: "/admin",
      element: (
        <ProtectedRoute allowedRoles={["admin"]}>
          <Layout navItems={adminNav}><AdminDashboard /></Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/admin/admins",
      element: (
        <ProtectedRoute allowedRoles={["admin"]}>
          <Layout navItems={adminNav}><AdminManagement /></Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/admin/staff",
      element: (
        <ProtectedRoute allowedRoles={["admin"]}>
          <Layout navItems={adminNav}><StaffManagement /></Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/admin/students",
      element: (
        <ProtectedRoute allowedRoles={["admin"]}>
          <Layout navItems={adminNav}><StudentManagement /></Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/admin/tests",
      element: (
        <ProtectedRoute allowedRoles={["admin"]}>
          <Layout navItems={adminNav}><AdminTestList /></Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/admin/tests/create",
      element: (
        <ProtectedRoute allowedRoles={["admin"]}>
          <Layout navItems={adminNav}><CreateTest /></Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/admin/tests/:id/edit",
      element: (
        <ProtectedRoute allowedRoles={["admin"]}>
          <Layout navItems={adminNav}><EditTest /></Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/admin/results",
      element: (
        <ProtectedRoute allowedRoles={["admin"]}>
          <Layout navItems={adminNav}><Results /></Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/admin/malpractice",
      element: (
        <ProtectedRoute allowedRoles={["admin"]}>
          <Layout navItems={adminNav}><Malpractice /></Layout>
        </ProtectedRoute>
      ),
    },

    // Staff
    {
      path: "/staff",
      element: (
        <ProtectedRoute allowedRoles={["staff"]}>
          <Layout navItems={staffNav}><StaffDashboard /></Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/staff/students",
      element: (
        <ProtectedRoute allowedRoles={["staff"]}>
          <Layout navItems={staffNav}><StudentManagement /></Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/staff/tests",
      element: (
        <ProtectedRoute allowedRoles={["staff"]}>
          <Layout navItems={staffNav}><AdminTestList /></Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/staff/tests/create",
      element: (
        <ProtectedRoute allowedRoles={["staff"]}>
          <Layout navItems={staffNav}><CreateTest /></Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/staff/tests/:id/edit",
      element: (
        <ProtectedRoute allowedRoles={["staff"]}>
          <Layout navItems={staffNav}><EditTest /></Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/staff/results",
      element: (
        <ProtectedRoute allowedRoles={["staff"]}>
          <Layout navItems={staffNav}><Results /></Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/staff/malpractice",
      element: (
        <ProtectedRoute allowedRoles={["staff"]}>
          <Layout navItems={staffNav}><Malpractice /></Layout>
        </ProtectedRoute>
      ),
    },

    // Student
    {
      path: "/student",
      element: (
        <ProtectedRoute allowedRoles={["student"]}>
          <Layout navItems={studentNav}><StudentDashboard /></Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/student/results",
      element: (
        <ProtectedRoute allowedRoles={["student"]}>
          <Layout navItems={studentNav}><Results /></Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/student/test/:testId/instructions",
      element: (
        <ProtectedRoute allowedRoles={["student"]}>
          <Layout navItems={studentNav}><Instructions /></Layout>
        </ProtectedRoute>
      ),
    },
    {
      path: "/student/test/:testId/exam",
      element: (
        <ProtectedRoute allowedRoles={["student"]}>
          <Exam />
        </ProtectedRoute>
      ),
    },
    {
      path: "/student/result/:attemptId",
      element: (
        <ProtectedRoute allowedRoles={["student"]}>
          <Layout navItems={studentNav}><Result /></Layout>
        </ProtectedRoute>
      ),
    },

    { path: "*", element: <NotFound /> },
  ]);

  return <RouterProvider router={router} />;
}
