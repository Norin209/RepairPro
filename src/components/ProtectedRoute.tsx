import { Navigate } from "react-router-dom";
import type { ReactNode } from "react";

interface ProtectedRouteProps {
  children: ReactNode;
}

const ProtectedRoute = ({ children }: ProtectedRouteProps) => {
  const isAuth = localStorage.getItem("adminAuth") === "true";

  return isAuth ? children : <Navigate to="/admin-portal-9831" replace />;
};

export default ProtectedRoute;
