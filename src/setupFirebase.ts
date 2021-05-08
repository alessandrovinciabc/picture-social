import firebase from 'firebase/app';

import 'firebase/auth';
import 'firebase/firestore';

const firebaseConfig = {
  apiKey: 'AIzaSyCiX9Kf9DTKk0udoSHtR0Isr5g22m1-YF8',
  authDomain: 'picture-social.firebaseapp.com',
  projectId: 'picture-social',
  storageBucket: 'picture-social.appspot.com',
  messagingSenderId: '839065973804',
  appId: '1:839065973804:web:e06ee9318371b36f2d0d89',
};

firebase.initializeApp(firebaseConfig);
