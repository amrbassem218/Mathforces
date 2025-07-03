import * as React from "react";
import { Button } from "./button";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth, db } from "../../../firebaseConfig";
import { useNavigate } from "react-router-dom";
import { doc, DocumentData, getDoc } from "firebase/firestore";
import { useState, useEffect } from "react";
import {
  HoverCard,
  HoverCardContent,
  HoverCardTrigger,
} from "@radix-ui/react-hover-card";
import { getUserData, title } from "../../../utilities";
interface IHeaderProps {
  page?: string;
}

const Header: React.FunctionComponent<IHeaderProps> = ({ page }) => {
  const [user, loading] = useAuthState(auth);
  const [data, setData] = useState<DocumentData | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("");
  useEffect(() => {
    if(user){
      const getData = async() => {
        setData(await getUserData(user));
      }
      getData();
    }
  }, [user]);
  const navigate = useNavigate();
  if (loading) {
    return <div></div>;
  }
  return (
    <header className="w-full border-b-2 border-border h-20 flex items-center place-content-around">
      <h1 className="logo text-3xl" onClick={() => navigate("/")}>
        Mathforces
      </h1>
      <nav>
        <ul className="flex gap-10">
          <li className="hover:font-medium">
            <Button
              variant={"link"}
              className={`text-md text-text font-normal ${
                page == "contests" && "underline"
              }`}
              onClick={() => navigate("/contests")}
            >
              Contests
            </Button>
          </li>
          <li className="hover:font-medium">
            <Button
              variant={"link"}
              className={`text-md text-text font-normal ${
                page == "contests" && "underline"
              }`}
              onClick={() => navigate("/problemset")}
            >
              Problemset
            </Button>
          </li>
          <li className="hover:font-medium">
            <Button
              variant={"link"}
              className={`text-md text-text font-normal ${
                page == "contests" && "underline"
              }`}
              onClick={() => navigate("/ranking")}
            >
              Ranking
            </Button>
          </li>
        </ul>
      </nav>
      {user && data && (
        <div className="w-fit h-15 rounded-md flex items-center gap-2 bg-[#dfdfdf] justify-start p-3">
          <div className="rounded-full w-12 h-12 bg-amber-500"></div>
          <div className="flex flex-col justify-items-start items-start ">
            <h1 className="font-bold">{data.username}</h1>
            <div className="flex gap-2 items-center">
              <div className={`p-1 rounded-md ${title(data.rating).bg}`}>
                <p className="text-xs tracking-tighter">
                  {title(data.rating).name}
                </p>
              </div>
              <p className="text-sm">{data.rating}</p>
            </div>
          </div>
        </div>
      )}
      {(!user || !data) && (
        <div className="w-fit h-full flex items-center justify-center gap-2">
          <Button
            className="bg-text text-lavender hover:bg-text hover:opacity-95 w-25 h-8"
            onClick={() => navigate("/login")}
          >
            Login
          </Button>
          <Button
            className="border-2 border-navbtn bg-transparent hover:bg-border rounded-md w-25 h-8"
            onClick={() => navigate("/signup")}
          >
            <h2 className="">Signup</h2>
          </Button>
        </div>
      )}
    </header>
  );
};

export default Header;
