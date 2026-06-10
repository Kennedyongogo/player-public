import { Navigate, useLocation } from "react-router-dom";

/**
 * Wraps marketplace area routes. Redirects to /marketplace (login) if user is not logged in.
 */
export default function MarketplaceGate({ children }) {
  const location = useLocation();
  const token =
    typeof localStorage !== "undefined"
      ? localStorage.getItem("marketplace_token")
      : null;

  if (!token) {
    return <Navigate to="/marketplace" state={{ from: location }} replace />;
  }

  return children;
}
