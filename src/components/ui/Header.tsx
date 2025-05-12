import * as React from 'react';
import { Button } from './button';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../firebaseConfig';
import { useNavigate } from 'react-router-dom';
interface IHeaderProps {
    login: string | null;
    signup:string | null;
}

const Header: React.FunctionComponent<IHeaderProps> = (props) => {
    const [user, loading] = useAuthState(auth);
    const navigate = useNavigate();
    if(loading){
      return <div></div>;
    }
    return (
        <header className="w-full border-b-2 border-border h-20 flex items-center place-content-around">
        <h1 className="logo text-3xl" onClick={() => navigate("/")}>Mathforces</h1>
        <nav>
          <ul className="flex gap-10">
            <li className="hover:font-medium" onClick={() => navigate("/contests")}><a href="">Contests</a></li>
            <li className="hover:font-medium "><a href="" onClick={() => navigate("/problemset")}>Problemset</a></li>
            <li className="hover:font-medium"><a href="" onClick={() => navigate("/ranking")}>Ranking</a></li>
          </ul>
        </nav>
        {(user && 
          <div className="w-fit h-15 rounded-md flex items-center gap-2 bg-[#dfdfdf] justify-start p-3">
            <div className="rounded-full w-12 h-12 bg-amber-500"></div>
            <div className="flex flex-col justify-items-start items-start ">
              <h1 className="font-bold">amrbassem218</h1>
              <div className="flex gap-2 items-center">
                <div className="bg-purple-700 py-1 px-0.5 rounded-md"><p className="text-xs tracking-tighter">Cd. Master</p></div>
                <p className="text-sm">2500Elo</p>
              </div>
            </div>
          </div>
        )}
        {(!user && 
          <div className="w-fit h-full flex items-center justify-center gap-2">
            <Button className={(props.login == "full" ? "bg-text text-lavender hover:bg-text hover:opacity-95" : "border-2 border-navbtn bg-transparent hover:bg-border" )+ " w-25 h-8"} onClick={() => navigate("/login")}>
              Login
            </Button>
            <Button className={(props.signup == "full" ? "bg-text text-lavender hover:bg-text hover:opacity-95" : "border-2 border-navbtn bg-transparent hover:bg-border" )+ " login rounded-md  w-25 h-8"} onClick={() => navigate("/signup")}>
              <h2 className="">Signup</h2>
            </Button>

          </div>
        )} 
      </header>
    )
};

export default Header;
