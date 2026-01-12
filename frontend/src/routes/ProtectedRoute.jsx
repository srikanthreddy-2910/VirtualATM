import { Navigate } from "react-router-dom";

export default function ProtectedRoute({ children }) {
  const isAuth = sessionStorage.getItem("authenticated");
  const sessionId = sessionStorage.getItem("sessionId");

  if (!isAuth || !sessionId) {
    return <Navigate to="/" replace />;
  }

  return children;
}
