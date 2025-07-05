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
import { getUserData, nextTitle, title } from "../../../utilities";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetFooter,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { Avatar, AvatarFallback, AvatarImage } from "./avatar";
import { Contact, Heart, Info, Settings, Settings2, User, UserPen } from "lucide-react";
import { FaHeart, FaPen, FaUser, FaUserFriends, FaUserPlus } from "react-icons/fa";
import { useAuthUserContext } from "@/context/authUserContext";
import { IoSettingsSharp } from "react-icons/io5";
import { MdContactSupport } from "react-icons/md";

interface IHeaderProps {
  page?: string;
}

const Header: React.FunctionComponent<IHeaderProps> = ({ page }) => {
  const [user, loading] = useAuthState(auth);
  const [data, setData] = useState<DocumentData | undefined>(undefined);
  const [activeTab, setActiveTab] = useState("");
  const { logout } = useAuthUserContext();
  
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
                page == "problemset" && "underline"
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
                page == "ranking" && "underline"
              }`}
              onClick={() => navigate("/ranking")}
            >
              Ranking
            </Button>
          </li>
        </ul>
      </nav>
      {user && data && (
        <Sheet>
          <SheetTrigger>
            <HoverCard>
              <HoverCardTrigger asChild>
                <Button className="w-50 h-15 rounded-md flex items-center gap-2 bg-[#dfdfdf] justify-start p-3 hover:bg-[#c3c3c3]">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={`${data?.pfp ?? "../../../public/nopfp.jpg"}`}/>
                    <AvatarFallback>VC</AvatarFallback>
                  </Avatar>
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
                </Button>
              </HoverCardTrigger>
              <HoverCardContent className="w-70">
                <div className="flex justify-between gap-4 mt-2 bg-gray-200 w-full p-5">
                  <Avatar>
                    <AvatarImage src={`${data?.pfp ?? "../../../public/nopfp.jpg"}`}/>
                    <AvatarFallback>VC</AvatarFallback>
                  </Avatar>
                  <div className="space-y-1 flex flex-col flex-1">
                    <div className="flex justify-between">
                      <h4 className="text-sm font-semibold text-left">@{data.username}</h4>
                      <p className="text-green-600 text-sm">+{nextTitle(data.rating).ratingDiff}</p>
                    </div>
                    <p className="text-sm text-left text-text/70">
                      {data?.bio ?? "Add a cool bio to see here!!"}
                    </p>
                    <div className="text-muted-foreground text-xs">
                      {data?.date ?? "Joined on 1st december 2025"}
                      {/* Joined December 2021 */}
                    </div>
                  </div>
                </div>
              </HoverCardContent>
            </HoverCard>
          </SheetTrigger>
          <SheetContent className="w-70 ">
            <SheetHeader className="pb-0 ">
              <SheetDescription>
                <div className="flex items-center gap-2 justify-start p-3">
                  <Avatar className="w-12 h-12">
                    <AvatarImage src={`${data?.pfp ?? "/nopfp.jpg"}`}/>
                    <AvatarFallback>VC</AvatarFallback>
                  </Avatar>
                  <h1 className="text-lg">@{data.username}</h1>
                </div>
              </SheetDescription>
            </SheetHeader>
            <nav className="px-2 ">
              <ul className="flex flex-col gap-2">
                <li className="sidebar-profile-item hover-lavender">
                  <FaUser size={14}/>
                  <h2>Your Profile</h2>
                </li>
                <li className="sidebar-profile-item hover-lavender">
                  <FaPen size={14}/>
                  <h2>Your Contests</h2>
                </li>
                <li className="sidebar-profile-item hover-lavender">
                  <FaUserPlus size={15}/>
                  <h2>Friends/Followers</h2>
                </li>
                <li className="sidebar-profile-item hover-lavender">
                  <FaHeart size={15}/>
                  <h2>Saved Contests</h2>
                </li>
                <li className="sidebar-profile-item hover-lavender">
                  <IoSettingsSharp size={16}/>
                  <h2>Settings</h2>
                </li>
                <li className="sidebar-profile-item hover-lavender">
                  <MdContactSupport size={17}/>
                  <h2>Support</h2>
                </li>
              </ul>
            </nav>
          <SheetFooter>
            <Button variant={'outline'} className="w-30 mx-auto">
              Log out
            </Button>
          </SheetFooter>
          </SheetContent>
        </Sheet>
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
