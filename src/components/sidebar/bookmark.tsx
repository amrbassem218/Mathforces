import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BookmarkIcon, ChevronRight, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { useState, useEffect } from 'react';
import { collection, doc, DocumentData, getDoc, getDocs } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../../firebaseConfig';
import { FaBookmark } from "react-icons/fa";
import { useLocation, useNavigate } from 'react-router-dom';
import { fi } from 'date-fns/locale';

interface IBookmarkProps {
}
interface bookmarkPage {
  title: string;
  path: string;
}
const Bookmark: React.FunctionComponent<IBookmarkProps> = (props) => {
  const [bookmarks, setBookMarks] = useState<bookmarkPage[]>([]);
  const [user, loading] = useAuthState(auth)
  const navigate = useNavigate();
  const location = useLocation();
  // useEffect(() => {
  //   if(user){
  //     const getBookMarks = async() => {
  //       const userSnap = await getDoc(doc(db, "users", user.uid));
  //       const userData = userSnap.data()
  //       if(userData && userData.bookmarks.length > 0){
  //         const bookmarksTemp:bookmarkPage[] = [];
  //         userData.bookmarks.forEach((mark: bookmarkPage) => {
  //           bookmarksTemp.push(mark);
  //         })
  //         setBookMarks(bookmarksTemp);
  //       }
  //     }
  //     getBookMarks();
  //   }
  // }, []);
  const handleAddBookMark = async() => {
    const path = location.pathname;
    const rawTitle = document.title
    const i = rawTitle.indexOf('-');
    const title = rawTitle.slice(i+2);
    const mark: bookmarkPage = {title: title, path: path};
    if(bookmarks){
      setBookMarks([...bookmarks, mark])
    }
    else{
      setBookMarks([mark]);
    }
  }
  return (
    <Card className='pt-2 border-border gap-0'>
      <CardHeader className=' flex justify-between px-4 py-2 border-b-1 border-border'>
        <div className='flex gap-2 items-center'>
          <FaBookmark/>
          <CardTitle>Bookmark</CardTitle>
        </div>
        <button onClick={() => handleAddBookMark()}><Plus size={20}/></button>
      </CardHeader>
      <CardContent className='p-0 '>
        {user 
        ? <div>
          {
            bookmarks.length 
            ? <div>
              {
                bookmarks.map((mark, i) => (
                  <div className={`${i % 2 == 0 ? "bg-background" : "bg-gray-200"} overflow-hidden px-2 text-left flex items-center `}>
                    <ChevronRight size={20}/>
                    <button onClick={() => navigate(`${mark.path}`)} className='hover:underline'>{mark.title}</button>
                  </div>
                ))
              }
            </div> 
            : <div className='mt-5'>
              <p className='text-text/70'>click the {<Plus className='inline ' size={15}/>} button to start bookmarking!</p>
            </div>
          }
        </div> 
        : <div>
          <p className='text-text/70'><button className='underline text-primary font-semibold '>Login</button> and start saving bookmarks!!</p>
        </div>
        }
      </CardContent>
    </Card>
  );
};

export default Bookmark;
