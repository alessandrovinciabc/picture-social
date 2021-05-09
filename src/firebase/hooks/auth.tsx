import { useState, useEffect } from 'react';

import { onAuthChange } from '../auth';

const useLoginStatus = () => {
  let [isLogged, setIsLogged] = useState(false);

  useEffect(() => {
    onAuthChange((user) => {
      if (user) {
        setIsLogged(true);
      } else {
        setIsLogged(false);
      }
    });
  }, []);

  return isLogged;
};

export default useLoginStatus;
