import { Icons } from "../../components/ui/icons"
import { Button } from "../../components/ui/button"
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "../../components/ui/card"
import { Input } from "../../components/ui/input"
import { Label } from "../../components/ui/label"
import React, { useEffect, useInsertionEffect, useRef, useState } from "react"
import { useAuthUserContext } from "@/context/authUserContext"
import { addDoc, collection, doc, getDocs, setDoc } from "firebase/firestore"
import { auth, db } from "../../../firebaseConfig"
import { reload, sendEmailVerification } from "firebase/auth"
import EmailVerificationPopup from "@/components/ui/emailVerificationPopup"
import { useNavigate } from "react-router-dom"
import { AlignVerticalSpaceAround, CodeSquare, Divide } from "lucide-react"
import { useAuthState } from "react-firebase-hooks/auth"
import Header from "@/components/ui/Header"

export function Signup() {
  const [user, loading] = useAuthState(auth);
  
  const [userError, setUserError] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [userName, setUserName] = useState<string>("");
    const [password, setPassword] = useState<string>("");
    const [userNameTaken, setUserNameTaken] = useState<boolean | null>(null);
    const {signup , login, logInWithGoogle, logInWithGithub,logout} = useAuthUserContext();
    const [emailVerificationSent, setEmailVerificationSent] = useState<boolean>(false);
    const [weakPass, setWeakPass] = useState<boolean | null>(null);
    const [weakPassError, setWeakPassError] = useState<string>("");
    const navigate = useNavigate();
    const flag = true;
    const handleSubmit = async(e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        if(!email){
          setUserError("Please Enter your Email");
        }
        else if(!userName){
          setUserError('Please Enter your username');
        }
        else if(!password){
          setUserError('Please Enter a valid password');
        }
        else{
          await signup(email, password).then(async(cred) => {
            await setDoc(doc(db, "users", cred.user.uid),{
              username: userName,
              email: email
            })
            sendEmailVerification(cred.user).then(() => {
              setEmailVerificationSent(true);
            })
            .catch((error) => {console.error(error); console.log("error here in ver")});
            if(cred){
              setUserError("");
            }
            else{
              setUserError("Something went wrong");
            }
          })
          .catch((error:any) => {
            if((error.code == "auth/alavenderccount-exists-with-different-credential") || (error.code == "auth/email-already-in-use")){
              setUserError("This email is already in use");
            }
            else if (error.code == "auth/weak-password"){
              setWeakPass(true);
              setWeakPassError("Password should be at least 6 characters");
            }
            console.error(error);
          })
        }
      }
    const handleGoogleSubmit = async(e:React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
      try {
        const response = await logInWithGoogle();
        if(response){
          setUserError("");
        }
        else{
          setUserError("Something went wrong");
        }
      } catch (error: any) {
        if(error.code == "auth/account-exists-with-different-credential" || error.code == "auth/email-already-in-use"){
          setUserError("This email is already in use");
        }
        console.error(error);
        console.log("everything is all over the place");
      }
    }
    const handleGithubSubmit = async(e:React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
      try {
        const response = await logInWithGithub();
        if(response){
          console.log("All good");
          setUserError("");
        }
        else{
          console.log("Didn't get data");
          setUserError("Something went wrong");
        }
      } catch (error: any) {
        if(error.code == "auth/account-exists-with-different-credential" || error.code == "auth/email-already-in-use"){
          setUserError("This email is already in use");
        }
        console.error(error);
        console.log("everything is all over the place");
      }
    }
    useEffect(() => {
      if(emailVerificationSent){
        const verifiedCheck = setInterval(async() => {
          if(auth?.currentUser){
            await reload(auth.currentUser);
            if(auth.currentUser.emailVerified){
              navigate("/login");
            }
          }
        }, 1000);
        return (() => clearInterval(verifiedCheck));
      }
    }, [emailVerificationSent])
    useEffect(() => {
      const checkAvailability = async() =>{
        const querySnapShot = await getDocs(collection(db, "users"));
        if(userName != ""){
          let flag = false;
        querySnapShot.forEach((doc) => {
            const docData = doc.data();
            if(String(docData.username) == userName){
              setUserNameTaken(true);
              flag = true;
            }
          })
          if(!flag){
            setUserNameTaken(false);
          }
        }
        else{
          setUserNameTaken(null);
        }
      }
      checkAvailability();
    }, [userName])
    useEffect(() => {
      if (userError) {
          const timer = setTimeout(() => setUserError(""), 2500);
          return () => clearTimeout(timer);
      }
    }, [userError]);
    useEffect(() => {
      if(password.length > 0 && password.length < 6){
        setWeakPass(true);
        setWeakPassError("Password should be at least 6 characters");
      }
      else if(password.length >= 6){
        setWeakPass(false);
        setWeakPassError("");
      }
    },[password])
    if(loading){
    return <div>loading...</div>;
  }
  return (
    <div className="flex flex-col min-h-screen w-full">
      <Header login={"outline"} signup={"full"}/>
    <form onSubmit={handleSubmit} className="m-auto flex items-center justify-center flex-grow">
    <Card className="w-120 max-w-full border-border">
      {(emailVerificationSent && <EmailVerificationPopup/>)}
      <CardHeader className="space-y-1 ">
        <CardTitle className="text-2xl">Create an account</CardTitle>
        <CardDescription>
          Enter your email below to create your account
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-6">
          <Button variant="outline" className="cursor-pointer border-border" onClick={handleGithubSubmit} type="button">
            <Icons.gitHub />
            GitHub
          </Button>
          <Button variant="outline" onClick={handleGoogleSubmit} className="cursor-pointer border-border" type="button">
            <Icons.google />
            Google
          </Button>
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t border-border" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-card px-2 text-muted-foreground">
              Or continue with
            </span>
          </div>
        </div>
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
          <Input id="userName" type="text" className={
            (userNameTaken === true && "border-red-500 ring-red-500 focus-visible:ring-red-500") ||
            (userNameTaken === false && "border-green-500 ring-green-500 focus-visible:ring-green-500") ||
            ""}
            placeholder="amr219" onChange={(e) => setUserName(e.target.value)}/>
          {userNameTaken === true && (
            <p className="text-sm text-red-600 text-left">Username taken</p>
          )}
        </div>
        <div className="grid gap-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" value={email}  placeholder="m@example.com" onChange={(e) => {setEmail(e.target.value); setEmailVerificationSent(false);}}/>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" className={
            (weakPass === true && "border-red-500 ring-red-500 focus-visible:ring-red-500") ||
            (weakPass === false && "border-green-500 ring-green-500 focus-visible:ring-green-500") ||
            ""}
            value={password} onChange={(e) => setPassword(e.target.value)}/>
            {weakPass === true && (
              <p className="text-sm text-red-600 text-left">{weakPassError}</p>
            )}
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" type="submit">Signup</Button>
      </CardFooter>
        <p className="text-sm opacity-90">Already Have an account?-<button type="button" className="underline text-accent cursor-pointer hover:text-[#E34845] hover:font-medium" onClick={() => navigate("/login")}>Login</button></p>
    </Card>
    </form>
    </div>
  )
}
export default Signup;