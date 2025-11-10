import { Navigate, Outlet, useLocation } from "react-router-dom";
import Layout from "../components/Layout";

const AUTH_TOKEN_KEY = "token";

function ProtectedRoute() {
  const location = useLocation();
  const isAuth = localStorage.getItem(AUTH_TOKEN_KEY);

  if (!isAuth) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export default ProtectedRoute;
