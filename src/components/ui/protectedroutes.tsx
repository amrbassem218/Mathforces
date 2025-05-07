import Login from '@/pages/login';
import * as React from 'react';
import { Navigate, Outlet, Route, Router, useLocation } from 'react-router-dom';

interface ProtectedRoutesProps {
}

const ProtectedRoutes: React.FunctionComponent<ProtectedRoutesProps> = (props) => {
    const flag = false;
  return (
    (flag ? <Outlet/> : <Navigate to={"/login"}/>)
  );
};

export default ProtectedRoutes;
