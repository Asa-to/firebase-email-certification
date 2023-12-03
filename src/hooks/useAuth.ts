import { FirebaseError } from "firebase/app";
import {
  Auth,
  UserInfo,
  createUserWithEmailAndPassword,
  onAuthStateChanged,
  signInWithEmailAndPassword,
  signOut,
} from "firebase/auth";
import { useCallback, useEffect, useState } from "react";

export const useAuth = (auth: Auth) => {
  const [user, setUser] = useState<UserInfo | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const doSignOut = useCallback(() => {
    try {
      signOut(auth);
    } catch (e) {
      console.error(e);
    }
  }, [auth]);

  useEffect(() => {
    // @see https://firebase.google.com/docs/auth/web/manage-users?hl=ja
    return onAuthStateChanged(auth, (user) => {
      if (!isInitialized) {
        setIsInitialized(true);
      }
      setUser(user);
    });
  }, [auth, isInitialized]);

  const signUpOrSignIn = useCallback(
    async (email: string, password: string, isSignIn = true) => {
      try {
        if (isSignIn) {
          await signInWithEmailAndPassword(auth, email, password);
        } else {
          await createUserWithEmailAndPassword(auth, email, password);
        }
      } catch (error) {
        const firebaseError = error as FirebaseError;
        // @see https://firebase.google.com/docs/auth/admin/errors?hl=ja
        switch (firebaseError.code) {
          case "auth/email-already-in-use":
            alert("使用されたemailは登録済みです");
            break;
          case "auth/invalid-credential":
            alert("emailまたはpasswordが無効です");
            break;
          default:
            alert(firebaseError.code);
        }
      }
    },
    [auth]
  );

  return {
    signUpOrSignIn,
    signOut: doSignOut,
    user,
    isInitialized,
  };
};
