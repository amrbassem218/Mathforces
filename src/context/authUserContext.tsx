import {
  createUserWithEmailAndPassword,
  GithubAuthProvider,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signInWithPopup,
  signInWithRedirect,
  getRedirectResult,
  signOut,
  User,
} from "firebase/auth";
import * as React from "react";
import { createContext, useContext, useEffect, useState } from "react";
import { auth } from "../../firebaseConfig";
interface AuthUserProviderProps {
  children: React.ReactNode;
}
const login = (email: string, password: string) => {
  return signInWithEmailAndPassword(auth, email, password);
};
const signup = (email: string, password: string) => {
  return createUserWithEmailAndPassword(auth, email, password);
};
const logout = () => {
  return signOut(auth);
};

const handleRedirectResult = async () => {
  try {
    const result = await getRedirectResult(auth);
    return result;
  } catch (error: any) {
    console.error('Error handling redirect result:', error);
    return null;
  }
};
const logInWithGoogle = async () => {
  const googleProvider = new GoogleAuthProvider();
  googleProvider.addScope('email');
  googleProvider.addScope('profile');
  
  try {
    // Try popup first
    const result = await signInWithPopup(auth, googleProvider);
    return result;
  } catch (error: any) {
    // Handle popup blocked errors - fallback to redirect
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
      try {
        await signInWithRedirect(auth, googleProvider);
        return null; // Will redirect, so no result to return
      } catch (redirectError: any) {
        throw new Error('Authentication failed. Please try again.');
      }
    } else if (error.code === 'auth/cancelled-popup-request') {
      throw new Error('Authentication was cancelled.');
    }
    throw error;
  }
};

const logInWithGithub = async () => {
  const githubProvider = new GithubAuthProvider();
  githubProvider.addScope('user:email');
  
  try {
    // Try popup first
    const result = await signInWithPopup(auth, githubProvider);
    return result;
  } catch (error: any) {
    // Handle popup blocked errors - fallback to redirect
    if (error.code === 'auth/popup-blocked' || error.code === 'auth/popup-closed-by-user') {
      try {
        await signInWithRedirect(auth, githubProvider);
        return null; // Will redirect, so no result to return
      } catch (redirectError: any) {
        throw new Error('Authentication failed. Please try again.');
      }
    } else if (error.code === 'auth/cancelled-popup-request') {
      throw new Error('Authentication was cancelled.');
    }
    throw error;
  }
};
interface AuthUserContextProps {
  user: User | null;
  login: typeof login;
  signup: typeof signup;
  logInWithGoogle: typeof logInWithGoogle;
  logInWithGithub: typeof logInWithGithub;
  logout: typeof logout;
  handleRedirectResult: typeof handleRedirectResult;
  loading: boolean;
}
const AuthUserContextInitial: AuthUserContextProps = {
  user: null,
  login: login,
  signup: signup,
  logInWithGoogle: logInWithGoogle,
  logInWithGithub: logInWithGithub,
  logout: logout,
  handleRedirectResult: handleRedirectResult,
  loading: true,
};

export const AuthUserContext = createContext<AuthUserContextProps>(
  AuthUserContextInitial,
);

const AuthUserProvider: React.FunctionComponent<AuthUserProviderProps> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  
  useEffect(() => {
    // Check for redirect result first
    const checkRedirectResult = async () => {
      try {
        await getRedirectResult(auth);
      } catch (error) {
        console.error('Error checking redirect result:', error);
      }
    };
    
    checkRedirectResult();
    
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      try {
        if (user && !user.emailVerified) {
          signOut(auth);
        } else if (user) {
          setUser(user);
        }
        setLoading(false);
      } catch (error) {
        console.error('Error in auth state change:', error);
        setLoading(false);
      }
    });
    return () => unsubscribe();
  }, []);
  const val = {
    user: user,
    login: login,
    signup: signup,
    logInWithGoogle: logInWithGoogle,
    logInWithGithub: logInWithGithub,
    logout: logout,
    handleRedirectResult: handleRedirectResult,
    loading: loading,
  };
  return (
    <AuthUserContext.Provider value={val}>{children}</AuthUserContext.Provider>
  );
};
export const useAuthUserContext = () => {
  return useContext(AuthUserContext);
};
export default AuthUserProvider;
