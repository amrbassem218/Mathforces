import * as React from 'react';
import { useAuthState } from 'react-firebase-hooks/auth';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card";
import { Icons } from "../../components/ui/icons";
import { Input } from "../../components/ui/input";
import { Label } from "../../components/ui/label";
import { Button } from '@/components/ui/button';
import { auth, db } from '../../../firebaseConfig';
import { useState, useEffect } from 'react';
import { collection, doc, getDocs, setDoc } from 'firebase/firestore';
import { useNavigate } from 'react-router-dom';
import Header from '@/components/ui/Header';
import { toast } from 'sonner';
import { getProfile } from '@/context/authUserProfile';
interface IUsernameEntryProps {
}

const UsernameEntry: React.FunctionComponent<IUsernameEntryProps> = (props) => {
  const [user, loading] = useAuthState(auth);
  const navigate = useNavigate(); 
  const [userError, setUserError] = useState<string>("");
  const [userName, setUserName] = useState<string>("");
  const [userNameTaken, setUserNameTaken] = useState<boolean | null>(null);
  const userProfile = getProfile();
  useEffect(() => {
    const checkAvailability = async () => {
    const querySnapShot = await getDocs(collection(db, "users"));
    if (userName != "") {
        let flag = false;
        querySnapShot.forEach((doc) => {
        const docData = doc.data();
        if (String(docData.username) == userName) {
            setUserNameTaken(true);
            flag = true;
        }
        });
        if (!flag) {
        setUserNameTaken(false);
        }
    } else {
        setUserNameTaken(null);
    }
    };
    checkAvailability();
}, [userName]);

useEffect(() => {
    if (userError) {
    const timer = setTimeout(() => setUserError(""), 2500);
    return () => clearTimeout(timer);
    }
}, [userError]);
const handleFormSubmit = async(e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if(userNameTaken){
        setUserError("Username taken try again");
    }
    else if(user){
        await setDoc(doc(db, "users", user.uid), {
          username: userName,
          email: user.email,
          ranking: "Beginner",
          rating: 1000,
        });
        toast(`Hello ${userName}`, {description: "Welcome to Mathforces"});
        let tempProfile = userProfile?.userProfile;
        if(tempProfile){
            tempProfile.username = userName;
            userProfile?.setUserProfile(tempProfile);
            navigate("/");
        }
    }
}
  if(loading) return <p>loading...</p>
  return (
    <div className='flex flex-col min-h-screen w-full'>
        <Header/>
        <form onSubmit={handleFormSubmit} className='m-auto flex items-center justify-center flex-grow'>
            <Card className="w-120 max-w-full border-border">
            <CardHeader className="space-y-1 ">
                <CardTitle className="text-2xl">Enter your username</CardTitle>
                <CardDescription>
                Enter your  below to create your account
                </CardDescription>
            </CardHeader>
            <CardContent className="grid gap-4">
                {userError && (
                <div className="fixed bottom-4 left-1/2 -translate-x-1/2 transform bg-red-500 text-white px-6 py-3 rounded-xl shadow-lg z-50 w-fit animate-fade-slide">
                    <p className="text-sm">{userError}</p>
                    <div className="mt-2 h-1 bg-white/30 w-full rounded-full overflow-hidden">
                    <div
                        className="h-full bg-white"
                        style={{ animation: "grow-bar 2.5s linear forwards" }}
                    />
                    </div>
                </div>
                )}
                <div className="grid gap-2">
                <Label htmlFor="email">username</Label>
                <Input
                    id="userName"
                    type="text"
                    className={
                    (userNameTaken === true &&
                        "border-red-500 ring-red-500 focus-visible:ring-red-500") ||
                    (userNameTaken === false &&
                        "border-green-500 ring-green-500 focus-visible:ring-green-500") ||
                    ""
                    }
                    placeholder="amr219"
                    onChange={(e) => setUserName(e.target.value)}
                />
                {userNameTaken === true && (
                    <p className="text-sm text-red-600 text-left">Username taken</p>
                )}
                </div>
            </CardContent>
            <CardFooter>
                <Button className="w-full" type="submit" >
                Submit
                </Button>
            </CardFooter>
            <p className="text-sm opacity-90">
                Already Have an account?-
                <button
                type="button"
                className="underline text-accent cursor-pointer hover:text-[#E34845] hover:font-medium"
                onClick={() => navigate("/login")}
                >
                Login
                </button>
            </p>
            </Card>
        </form>
    </div>
  );
};

export default UsernameEntry;
