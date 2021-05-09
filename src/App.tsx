import { useEffect, useState } from 'react';

import './setupFirebase';
import firebase from 'firebase/app';

import useLoginStatus from './firebase/hooks/auth';
import { logout, getCurrentUser, login } from './firebase/auth';

function App() {
  let loginStatus = useLoginStatus();
  let [currentUser, setCurrentUser] = useState<firebase.User | null>(null);

  useEffect(() => {
    setCurrentUser(getCurrentUser());
  }, [loginStatus]);

  let handleLogout = () => {
    logout();
  };

  let handleLogin = () => {
    login();
  };

  return (
    <div>
      {currentUser ? (
        <>
          <img src={currentUser.photoURL!} alt="" />
          <br />
          {currentUser.displayName}
          <br />
        </>
      ) : (
        false
      )}
      Login status: {loginStatus ? 'true' : 'false'}
      <br />
      {loginStatus && <button onClick={handleLogout}>Logout</button>}
      {!loginStatus && <button onClick={handleLogin}>Login</button>}
    </div>
  );
}

export default App;
