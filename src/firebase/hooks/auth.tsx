import { useState, useEffect } from 'react';

import { onAuthChange } from '../auth';

import saveUserDetailsToDB from '../user';

const useLoginStatus = () => {
  let [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    onAuthChange((user) => {
      if (user) {
        setIsLogged(true);
        saveUserDetailsToDB(user);
      } else {
        setIsLogged(false);
      }
    });
  }, []);

  return isLogged;
};

export default useLoginStatus;
