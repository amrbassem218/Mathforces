import { auth } from '../../../firebaseConfig';
import * as React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import { Outlet, useLocation, useNavigate } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { getUserData } from 'utilities';
import { getProfile } from '@/context/authUserProfile';
interface LayoutProps {
}

const Layout: React.FunctionComponent<LayoutProps> = (props) => {
  const userProfile = getProfile();
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate();
  const location = useLocation();
  useEffect(() => {
    if(user){
      console.log("ay dh el denya trawa ")
      if(userProfile?.userProfile){
        console.log("tl3 mawgood aho ")
      }
      if(userProfile?.userProfile && !userProfile?.userProfile.username){
        console.log("ana goa m3ah");
        navigate('/signup/username');
      }
      console.log("ana bara aho")
    }
  }, [user, userProfile, location])
  return (
    <div>
        <main>
            <Outlet/>
        </main>
    </div>
  );
};

export default Layout;
