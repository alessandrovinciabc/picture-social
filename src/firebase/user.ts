import firebase from 'firebase/app';

let db = firebase.firestore();

interface UserProfile extends firebase.firestore.DocumentData {
  photoURL: string;
  displayName: string;
}

async function saveUserDetailsToDB(user: firebase.User) {
  await db
    .collection('user')
    .doc(user.uid)
    .set(
      {
        profile: {
          photoURL: user.photoURL,
          displayName: user.displayName,
        },
      },
      { merge: true }
    );
}

async function getUser(uid: string) {
  let queryResult = await db.collection('user').doc(uid).get();

  let data = queryResult.data()?.profile;

  return data;
}

export default saveUserDetailsToDB;

export { getUser };

export type { UserProfile };
