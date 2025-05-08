import { useAuthUserContext } from '@/context/authUserContext';
import Login from '@/pages/login';
import * as React from 'react';
import { Navigate, Outlet, Route, Router, useLocation } from 'react-router-dom';
import {useState, useEffect } from 'react';
import { User } from 'firebase/auth';
import {useAuthState} from 'react-firebase-hooks/auth'
import { auth } from '../../../firebaseConfig';
interface ProtectedRoutesProps {
}

const ProtectedRoutes: React.FunctionComponent<ProtectedRoutesProps> = (props) => {
  const [user, loading] = useAuthState(auth);
  if(loading){
    return (<div>Loading...</div>)
  }
  return (
    (user  ? <Outlet/> : <Navigate to={"/login"}/>)
  );
};

export default ProtectedRoutes;
