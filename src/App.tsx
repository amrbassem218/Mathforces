import "katex/dist/katex.min.css";
import "./App.css";

import { useEffect, useState } from "react";
import { RouterProvider } from "react-router-dom";
import { Toaster } from "sonner";
import { Analytics } from "@vercel/analytics/next";
import router from "./router";
import ServerManipulator from "./components/serverManipulator";
import { Chart } from "./components/ui/chart";
import { UserContext } from "./context/authUserProfile";
import { DocumentData } from "firebase/firestore";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../firebaseConfig";
import { getUserData } from "../utilities";

function App() {
  const [userProfile, setUserProfile] = useState<DocumentData | undefined>();
  const [user, loading] = useAuthState(auth);
  const [hasUserName, setHasUserName] = useState(false);
  useEffect(() => {
    if(user){
      const checkUserName = async() => {
        const userData = await getUserData(user);
        if(userData){
          setUserProfile(userData);
        }
      }
      checkUserName();
    }
  }, [user])
  if(loading) return <p>loading...</p>
  return (
    <div>
      <UserContext.Provider value={{ userProfile, setUserProfile }}>
        <Toaster />
        <RouterProvider router={router} />
        {/* <ServerManipulator/> */}
      </UserContext.Provider>
    </div>
  );
}

export default App;
