import { Button, buttonVariants } from '@/components/ui/button';
import { useAuthUserContext } from '@/context/authUserContext';
import * as React from 'react';

interface IHomeProps {
}

const Home: React.FunctionComponent<IHomeProps> = (props) => {
  const {logout} = useAuthUserContext();
  return (
    <div>
      <Button onClick={logout}>logout</Button>
      <div>That's home</div>
    </div>
  );
};

export default Home;
