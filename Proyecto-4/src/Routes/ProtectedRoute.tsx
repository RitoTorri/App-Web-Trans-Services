import { Navigate, Outlet, useLocation } from "react-router-dom";
import Layout from "../components/Layout";

const AUTH_TOKEN_KEY = "token";

interface ProtectedRouteProps{
  requiredRol?: string;
}

function ProtectedRoute({requiredRol}: ProtectedRouteProps) {
  const location = useLocation();
  const isAuth = localStorage.getItem(AUTH_TOKEN_KEY);
  const rolUser = localStorage.getItem('rol')

  if (!isAuth) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  if(requiredRol && rolUser !== requiredRol){
    return <Navigate to="/paginainicio" replace/>
  }

  return (
    <Layout>
      <Outlet />
    </Layout>
  );
}

export default ProtectedRoute;
