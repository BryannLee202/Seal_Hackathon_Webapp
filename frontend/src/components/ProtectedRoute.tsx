import type { ReactNode } from "react";
import { Navigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { Layout } from "./Layout";
import type { RoleName } from "../api/types";

export function ProtectedRoute({ children, requireRole }: { children: ReactNode; requireRole?: RoleName }) {
  const { user, loading, hasRole } = useAuth();

  if (loading) {
    return <div className="empty-state">Đang tải...</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }
  if (requireRole && !hasRole(requireRole)) {
    return (
      <Layout>
        <div className="alert error">Bạn không có quyền truy cập trang này.</div>
      </Layout>
    );
  }
  return <Layout>{children}</Layout>;
}
