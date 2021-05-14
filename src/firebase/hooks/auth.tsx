import { useState, useEffect } from 'react';

import { onAuthChange } from '../auth';

import saveUserDetailsToDB from '../user';

import firebase from 'firebase/app';

const useLoginStatus = (): [boolean, firebase.User | null] => {
  let [state, setState] = useState<{
    isLogged: boolean;
    user: firebase.User | null;
  }>({ isLogged: false, user: null });

  useEffect(() => {
    onAuthChange((user) => {
      if (user) {
        setState({ isLogged: true, user });
        saveUserDetailsToDB(user);
      } else {
        setState({ isLogged: false, user: null });
      }
    });
  }, []);

  return [state.isLogged, state.user];
};

export default useLoginStatus;
