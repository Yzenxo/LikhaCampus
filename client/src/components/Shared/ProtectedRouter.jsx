import { Navigate, Outlet } from "react-router-dom";

const ProtectedRouter = ({ user, role, loading, redirectTo = "/login" }) => {
  if (loading)
    return <span className="loading loading-spinner text-primary"></span>; // or a spinner
  if (!user || user.role !== role) return <Navigate to={redirectTo} />;
  return <Outlet />;
};

export default ProtectedRouter;
