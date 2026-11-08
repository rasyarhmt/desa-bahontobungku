import { Navigate } from "react-router-dom";
import { type ReactNode } from "react";
import { getAccessToken } from "@/lib/api/client";

function isAuthenticated() {
  const token = getAccessToken();
  if (!token) return false;
  try {
    JSON.parse(atob(token.split(".")[1]));
    return true;
  } catch {
    return false;
  }
}

export default function ProtectedRoute({ children }: { children: ReactNode }) {
  if (!isAuthenticated()) {
    return <Navigate to="/login" replace />;
  }
  return children;
}
