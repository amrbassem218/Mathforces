import * as React from 'react';
import useSetTitle, { getUserData, title } from '../../../utilities';
import { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth } from '../../../firebaseConfig';
import { DocumentData } from 'firebase/firestore';
import SideBar from '@/components/sidebar/sideBar';
import Header from '@/components/ui/Header';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AvatarImage, Avatar, AvatarFallback } from '@/components/ui/avatar';
import { BsBarChartFill } from 'react-icons/bs';
import { FaPen, FaUsers } from 'react-icons/fa';
import { Chart } from '@/components/ui/chart';
interface IProfileProps {
}

const Profile: React.FunctionComponent<IProfileProps> = (props) => {
  const userId = useParams<{id: string;}>();
  const [user, loading] = useAuthState(auth);
  const [profileUserData, setProfileUserData] = useState<DocumentData>();
  const [isUserProfile, setIsUserProfile] = useState(false);
  const [idError, setIdError] = useState(false);
  useSetTitle('Profile');
  useEffect(() => {
    const getData = async() => {
        if(userId.id){
          const userData = await getUserData(userId.id);
          return userData;
        }
        return undefined;
      }
      getData().then((userData) => {
        if(userData){
          if(user && userId.id == user.uid){
            setIsUserProfile(true);
          }
          setProfileUserData(userData);
        }
        else{
          console.error("failed to fetch user");
          setIdError(true);
        }
      })
  }, [userId])
  if(loading){
    return <p>loading...</p>
  }
  if(idError){
    return <p>User doesn't Exist pls check the URL again</p>
  }
  return (
    <div>
      <Header />
      <div className='grid grid-cols-16'>
        <div className='col-span-8 col-start-2 py-10'>
          <Card className='border-border'>
            <CardHeader className='flex justify-between mr-5 relative '>
              <div className='flex flex-col items-start justify-start'>
                <CardDescription className={`${title(profileUserData?.rating).text} text-sm`}>
                  {title(profileUserData?.rating ?? 0).name}
                </CardDescription>
                <CardTitle className={`${title(profileUserData?.rating).text} text-xl tracking-wide`}>
                  @{profileUserData?.username ?? "anon"}
                </CardTitle>
              </div>
              <Avatar className="w-20 h-20 absolute right-7">
                <AvatarImage src={`${profileUserData?.pfp ?? "../../../public/nopfp.jpg"}`} />
                <AvatarFallback>VC</AvatarFallback>
              </Avatar>
            </CardHeader>
            <CardContent className='flex flex-col gap-2'>
              <div>
                <div className='flex gap-2 items-center'>
                  <BsBarChartFill size={17} className={``}/>
                  <h3>Official rating: <span className={`${title(profileUserData?.rating).text}`}>{profileUserData?.rating}</span></h3>
                </div>
                <div className='flex gap-2 items-center'>
                  <FaUsers size={17}/>
                  <h3>Followers: {profileUserData?.Followers ?? 0}</h3>
                </div>

                <div className='flex gap-2 items-center'>
                  <FaPen size={15}/>
                  <h3>Contest contribution: {profileUserData?.contestContribution ?? 0}</h3>
                </div>
              </div>
              <div className='mt-5'>
                <Chart/>
              </div>
            </CardContent>
          </Card>
        </div>
      <div className='col-span-6'>
        <SideBar/>
      </div>
      </div>
    </div>
);
};

export default Profile;
