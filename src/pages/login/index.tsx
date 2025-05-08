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
import { useEffect, useState } from "react"
import { useAuthUserContext } from "@/context/authUserContext"
import { sendEmailVerification } from "firebase/auth"
import { useNavigate } from "react-router-dom"

export function Login() {
    const [userError, setUserError] = useState<string>("");
    const [email, setEmail] = useState<string>("");
    const [pass, setPass] = useState<string>("");
    const {user, signup , login, logInWithGoogle, logInWithGithub,logout} = useAuthUserContext();
    const navigate = useNavigate();
    const handleSubmit = async(e:React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        await login(email, pass)
        .then(async(cred) => {
          if(!cred.user.emailVerified){
            await sendEmailVerification(cred.user).then(() => {
              setUserError("Verify email first");
            })
            .catch((error) => {console.error(error); console.log("error here in email verification sending")});
          }
          else if(cred){
            setUserError("");
            navigate("/");
          }
          else{
            setUserError("Something went wrong");
          }
        })
        .catch((error:any) => {
          if(error.code == "auth/account-exists-with-different-credential" || error.code == "auth/email-already-in-use"){
            setUserError("This email is already in use");
          }
          if(error.code == "auth/invalid-credential"){
            setUserError("Wrong Email or Password");
          }
          else console.error(error);
        })
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
      }
    }
    const handleGithubSubmit = async(e:React.MouseEvent<HTMLElement>) => {
        e.preventDefault();
      try {
        const response = await logInWithGithub();
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
      }
    }

    useEffect(() => {
      if (userError) {
          const timer = setTimeout(() => setUserError(""), 2500);
          return () => clearTimeout(timer);
      }
    }, [userError]);
  return (
    <form onSubmit={handleSubmit}>
    <Card>
      <CardHeader className="space-y-1">
        <CardTitle className="text-2xl">Log in to account</CardTitle>
        <CardDescription>
          Enter your email below to log in to your account
        </CardDescription>
      </CardHeader>
      <CardContent className="grid gap-4">
        <div className="grid grid-cols-2 gap-6">
          <Button variant="outline" onClick={handleGithubSubmit} type="button">
            <Icons.gitHub />
            GitHub
          </Button>
          <Button variant="outline" onClick={handleGoogleSubmit} className="" type="button">
            <Icons.google />
            Google
          </Button>
        </div>
        <div className="relative">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
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
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" placeholder="m@example.com" onChange={(e) => setEmail(e.target.value)}/>
        </div>
        <div className="grid gap-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" onChange={(e) => setPass(e.target.value)}/>
        </div>
      </CardContent>
      <CardFooter>
        <Button className="w-full" type="submit">Login</Button>
      </CardFooter>
    </Card>
      </form>
  )
}
export default Login;