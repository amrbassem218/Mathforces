import { createUserWithEmailAndPassword, onAuthStateChanged, signInWithEmailAndPassword, signInWithPopup, signOut, User, GoogleAuthProvider, GithubAuthProvider } from 'firebase/auth';
import * as React from 'react';
import {auth} from "../../firebaseConfig"
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
const logInWithGithub = () =>{
    const githubProvider = new GithubAuthProvider();
    return signInWithPopup(auth, githubProvider);
}
interface AuthUserContextProps{
    user: User | null;
    login: typeof login;
    signup: typeof signup;
    logInWithGoogle: typeof logInWithGoogle;
    logInWithGithub: typeof logInWithGithub;
    logout: typeof logout;
    loading: boolean;
}
const AuthUserContextInitial:AuthUserContextProps = {
    user: null,
    login:login,
    signup:signup,
    logInWithGoogle:logInWithGoogle,
    logInWithGithub: logInWithGithub,
    logout: logout,
    loading: true,
}

export const AuthUserContext = createContext<AuthUserContextProps>(AuthUserContextInitial);

const AuthUserProvider: React.FunctionComponent<AuthUserProviderProps> = ({children}) => {
    const [user, setUser] = useState<User | null>(null);
    const [loading, setLoading] = useState<boolean >(true);
    useEffect(() => {
        const unsubscribe = onAuthStateChanged(auth, (user) => {
            if(user && !user.emailVerified){
                signOut(auth);
            }
            else if(user){
                setUser(user);
            }
            setLoading(false);
        })
        return (() => unsubscribe());
    });
    const val = {
        user: user,
        login:login,
        signup:signup,
        logInWithGoogle:logInWithGoogle,
        logInWithGithub: logInWithGithub,
        logout:logout,
        loading: loading,
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
