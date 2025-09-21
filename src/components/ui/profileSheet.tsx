import * as React from 'react';
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
import { HoverCard, HoverCardContent, HoverCardTrigger } from '@radix-ui/react-hover-card';
import { Button } from './button';
import { DocumentData } from 'firebase/firestore';
import { nextTitle, title } from '../../../utilities';
import { FaHeart, FaPen, FaUser, FaUserPlus } from 'react-icons/fa';
import { IoSettingsSharp } from 'react-icons/io5';
import { MdContactSupport } from 'react-icons/md';
import { useAuthUserContext } from '@/context/authUserContext';
import { Avatar, AvatarImage ,AvatarFallback } from './avatar';
import { useNavigate } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../firebaseConfig';
interface IProfileSheetProps {
    data?: DocumentData | undefined;
}

const ProfileSheet: React.FunctionComponent<IProfileSheetProps> = ({data}) => {
    const { logout } = useAuthUserContext();
    const [user, loading] = useAuthState(auth);
    const navigate = useNavigate();
    if(!data || loading){
        return <p>loading...</p>
    }
  return (
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
                <li className="sidebar-profile-item hover-lavender" onClick={() => navigate(`/profile/${user?.uid}`)}>
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
            <Button variant={'outline'} className="w-30 mx-auto" onClick={() => logout()}>
              Log out
            </Button>
          </SheetFooter>
          </SheetContent>
        </Sheet>
  );
};

export default ProfileSheet;
