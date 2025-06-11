import { Button } from '@/components/ui/button';
import Header from '@/components/ui/Header';
import { useAuthUserContext } from '@/context/authUserContext';
import * as React from 'react';

const Home: React.FunctionComponent = () => {
  const {logout} = useAuthUserContext();
  
  return (
    <div className='flex flex-col h-screen'>
      <Header login={"full"} signup={"outline"}/>
      <div className='flex flex-col flex-grow justify-center items-center'>
        <h1 className='text-4xl font-medium mb-4'>Go to Contests and prove your dominance</h1>
        <p className='text-sm'>
          (I promise it's going to look pretty, initial <a href="https://www.figma.com/design/8J9sj1J0mAInp9GeWPDpPY/Mathforces?node-id=0-1&t=QSSiwEyCxex7bQV6-1" className='underline text-blue-600'>figma design</a>)
        </p>
        <Button onClick={logout} className="mt-4">Logout</Button>
      </div>
    </div>
  );
};

export default Home;
