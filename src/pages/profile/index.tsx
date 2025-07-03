import * as React from 'react';
import useSetTitle from 'utilities';

interface IProfileProps {
}

const Profile: React.FunctionComponent<IProfileProps> = (props) => {
  useSetTitle('Profile')
  return <></>;
};

export default Profile;
