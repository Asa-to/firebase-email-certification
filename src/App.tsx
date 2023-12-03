import { getAuth } from "firebase/auth";
import "./App.css";
import { initializeApp } from "firebase/app";
import { useState } from "react";
import { useAuth } from "./hooks/useAuth";

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
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isSignIn, setIsSignIn] = useState(true);
  const { isInitialized, user, signUpOrSignIn, signOut } = useAuth(auth);

  // ログイン済み時はonAuthStateChange初回実行時にユーザー情報が読み込まれる
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
      {user ? (
        <div>
          <p>ようこそ{user.displayName ?? user.email ?? user.uid}さん</p>
          <button
            onClick={async () => {
              await signOut();
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
