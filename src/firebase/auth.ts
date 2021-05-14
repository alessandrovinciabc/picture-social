import firebase from 'firebase/app';

const auth = firebase.auth();

const google = new firebase.auth.GoogleAuthProvider();

async function login(
  callback?: (userData: firebase.User) => void
): Promise<void> {
  await auth.signInWithRedirect(google);
}

function logout() {
  return auth.signOut();
}

function onAuthChange(callback: (user: firebase.User | null) => any) {
  auth.onAuthStateChanged(callback);
}

export { login, logout, onAuthChange };
