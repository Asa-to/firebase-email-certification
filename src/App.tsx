import {
  User,
  createUserWithEmailAndPassword,
  getAuth,
  onAuthStateChanged,
  signInWithEmailAndPassword,
} from "firebase/auth";
import "./App.css";
import { FirebaseError, initializeApp } from "firebase/app";
import { useCallback, useEffect, useState } from "react";

const firebaseConfig = {
  apiKey: import.meta.env.VITE_API_KEY,
  authDomain: import.meta.env.VITE_AUTH_DOMAIN,
  projectId: import.meta.env.PROJECT_ID,
  storageBucket: import.meta.env.STORAGE_BUCKET,
  messagingSenderId: import.meta.env.MESSAGING_SENDER_ID,
  appId: import.meta.env.VITE_APP_ID,
};

const app = initializeApp(firebaseConfig);

function App() {
  const auth = getAuth(app);
  const [userInfo, setUserInfo] = useState<User | null>(auth.currentUser);
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignIn, setIsSignIn] = useState(true);
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

  // ログイン済み時はonAuthStateChange初回実行時にユーザー情報が読み込まれる
  const [isInitialized, setIsInitialized] = useState(false);
  useEffect(() => {
    // @see https://firebase.google.com/docs/auth/web/manage-users?hl=ja
    return onAuthStateChanged(auth, (user) => {
      if (!isInitialized) {
        setIsInitialized(true);
      }
      if (user) {
        setUserInfo(user);
      }
    });
  }, [auth, isInitialized]);
  if (!isInitialized) {
    return <>loading</>;
  }

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "4px",
      }}
    >
      {userInfo ? (
        <div>
          <p>
            ようこそ{userInfo.displayName ?? userInfo.email ?? userInfo.uid}
            さん
          </p>
          <button
            onClick={async () => {
              await auth.signOut();
              setUserInfo(null);
            }}
          >
            ログアウト
          </button>
        </div>
      ) : (
        <div>
          <p>ログインしてください</p>
          <form
            onSubmit={(e) => {
              e.preventDefault();
              signUpOrSignIn(email, password, isSignIn);
            }}
          >
            <div>
              <label htmlFor="email">メールアドレス</label>
              <input
                required
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </div>
            <div>
              <label htmlFor="password">パスワード</label>
              <input
                required
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
              />
            </div>
            <button type="submit" onClick={() => setIsSignIn(false)}>
              sign up
            </button>
            <button type="submit" onClick={() => setIsSignIn(true)}>
              sign in
            </button>
          </form>
        </div>
      )}
    </div>
  );
}

export default App;
