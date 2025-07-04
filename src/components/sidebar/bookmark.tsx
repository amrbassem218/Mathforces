import * as React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { BookmarkIcon, ChevronRight, Plus } from 'lucide-react';
import { Button } from '../ui/button';
import { useState, useEffect } from 'react';
import { collection, doc, DocumentData, getDoc, getDocs, setDoc, updateDoc } from 'firebase/firestore';
import { useAuthState } from 'react-firebase-hooks/auth';
import { auth, db } from '../../../firebaseConfig';
import { FaBookmark } from "react-icons/fa";
import { useLocation, useNavigate } from 'react-router-dom';
import { fi } from 'date-fns/locale';
import { getUserData } from '../../../utilities';
import { updateCurrentUser } from 'firebase/auth';
import { IoCloseCircle } from "react-icons/io5";
import { toast } from 'sonner';

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
  const didMount = React.useRef(false);
  useEffect(() => {
    if(user){
      const getBookMarks = async() => {
        const userSnap = await getDoc(doc(db, "users", user.uid));
        const userData = userSnap.data()
        if(userData?.bookmarks){
          const bookmarksTemp:bookmarkPage[] = [];
          userData.bookmarks.forEach((mark: bookmarkPage) => {
            bookmarksTemp.push(mark);
          })
          setBookMarks(bookmarksTemp);
        }
      }
      getBookMarks();
    }
  }, [user]);
  const handleAddBookMark = async() => {
    if(user){
      const path = location.pathname;
      const rawTitle = document.title
      const i = rawTitle.indexOf('-');
      const title = rawTitle.slice(i == -1 ? 0 : i+2);
      const mark: bookmarkPage = {title: title, path: path};
      let bookmarksTemp:bookmarkPage[] = [];
      if(bookmarks){
        let found = false;
        for(let curMark of bookmarks){
          if(curMark.title == mark.title){
            found = true;
            break;
          }
        }
        if(found){
          bookmarksTemp = [...bookmarks];
          toast("Bookmark already found!", {
            description: "Don't clutter UI",
          });
        }
        else{
          bookmarksTemp = [...bookmarks, mark];
        }
      }
      else{
        bookmarksTemp = [mark];
      }
      setBookMarks(bookmarksTemp);
    }
    else{
      navigate('/login');
    }
  }
  const handleDelete = (i: number) => {
    const bookmarksTemp = [...bookmarks];
    bookmarksTemp.splice(i, 1);
    setBookMarks(bookmarksTemp);
  }
  useEffect(() => {
    if(didMount.current){
      const updateBookmarks = async() => {
        if(user){
          await updateDoc(doc(db, "users", user.uid), {
            bookmarks: bookmarks
          })
        }
      }
      updateBookmarks();
    }
    else{
      didMount.current = true;
    }
  },[bookmarks, user])
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
                  <div className={`${i % 2 == 0 ? "bg-background" : "bg-gray-200"} overflow-hidden px-4 py-2 text-left flex items-center justify-between`}>
                    <div className='flex items-center'>
                      <ChevronRight size={17}/>
                      <button onClick={() => navigate(`${mark.path}`)} className='hover:underline'>{mark.title}</button>
                    </div>
                    <button className='hover:text-red-700' onClick={() => handleDelete(i)}><IoCloseCircle size={17}/></button>
                  </div>
                ))
              }
            </div> 
            : <div className='mt-5'>
              <p className='text-text/70'>click the {<Plus className='inline ' size={15}/>} button to start bookmarking!</p>
            </div>
          }
        </div> 
        : <div className='py-4'>
          <p className='text-text/70'><button className='underline text-primary font-semibold' onClick={() => navigate('/login')}>Login</button> and start saving bookmarks!!</p>
        </div>
        }
      </CardContent>
    </Card>
  );
};

export default Bookmark;
