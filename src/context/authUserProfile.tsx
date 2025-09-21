import { DocumentData } from "firebase/firestore";
import { createContext, useContext, type Dispatch, type SetStateAction } from "react";
interface UserProfileState {
  userProfile: DocumentData | undefined;
  setUserProfile: Dispatch<SetStateAction<DocumentData | undefined>>;
}
export const UserContext = createContext<UserProfileState | undefined>(undefined);

export const getProfile = () => {
  const profile = useContext(UserContext);
  return profile;
}


