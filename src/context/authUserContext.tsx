import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut, User } from 'firebase/auth';
import * as React from 'react';
import {auth} from "../../firebaseConfig"
import { GoogleAuthProvider } from 'firebase/auth/web-extension';
import { useState, useEffect, useContext, createContext } from 'react';
import { inflateRaw } from 'zlib';
interface AuthUserProviderProps {
    children: React.ReactNode;
}
const login = (email:string, password:string) =>{
    return signInWithEmailAndPassword(auth, email, password);
}
const signup = (email:string, password:string) =>{
    return createUserWithEmailAndPassword(auth, email, password);
}
const logout = () =>{
    return signOut(auth);
}
const logInWithGoogle = () =>{
    const googleProvider = new GoogleAuthProvider();
    return signInWithPopup(auth, googleProvider);
}
interface AuthUserContextProps{
    user: User | null;
    login: typeof login;
    signup: typeof signup;
    logInWithGoogle: typeof logInWithGoogle;
    logout: typeof logout;
}
const AuthUserContextInitial:AuthUserContextProps = {
    user: null,
    login:login,
    signup:signup,
    logInWithGoogle:logInWithGoogle,
    logout: logout,
}

export const AuthUserContext = createContext<AuthUserContextProps>(AuthUserContextInitial);

const AuthUserProvider: React.FunctionComponent<AuthUserProviderProps> = ({children}) => {
    const [user, setUser] = useState<User | null>(null);
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if(user){
                setUser(user);
            }
        })
        return (() => unsubscribe());
    })
    const val = {
        user: user,
        login:login,
        signup:signup,
        logInWithGoogle:logInWithGoogle,
        logout:logout,
    }
  return (
    <AuthUserContext.Provider value={val}>
        {children}
    </AuthUserContext.Provider>
  );
};
export const useAuthUserContext = () => {
    return useContext(AuthUserContext);
}
export default AuthUserProvider;
