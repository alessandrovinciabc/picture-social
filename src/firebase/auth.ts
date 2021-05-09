import firebase from 'firebase/app';

const auth = firebase.auth();

const google = new firebase.auth.GoogleAuthProvider();

async function login(
  callback?: (userData: firebase.User) => void
): Promise<void> {
  await auth.signInWithRedirect(google);

  let { user } = await auth.getRedirectResult();

  if (user) callback?.(user);
}

function logout() {
  return auth.signOut();
}

function onAuthChange(callback: (user: firebase.User | null) => any) {
  auth.onAuthStateChanged(callback);
}

function getCurrentUser() {
  return auth.currentUser;
}

export { login, logout, onAuthChange, getCurrentUser };
