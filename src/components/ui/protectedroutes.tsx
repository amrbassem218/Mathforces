import * as React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Navigate, Outlet } from 'react-router-dom';
import { auth } from '../../../firebaseConfig';
interface ProtectedRoutesProps {
}

const ProtectedRoutes: React.FunctionComponent<ProtectedRoutesProps> = (_props) => {
  const [user, loading] = useAuthState(auth);
  if(loading){
    return (<div>Loading...</div>)
  }
  return (
    (user  ? <Outlet/> : <Navigate to={"/login"}/>)
  );
};

export default ProtectedRoutes;
