import firebase from 'firebase/app';

let db = firebase.firestore();

interface UserProfile extends firebase.firestore.DocumentData {
  photoURL: string;
  displayName: string;
  uid: string;
}

async function saveUserDetailsToDB(user: firebase.User) {
  user.reload();
  await db
    .collection('user')
    .doc(user.uid)
    .set(
      {
        profile: {
          photoURL: user.photoURL,
          displayName: user.displayName,
          uid: user.uid,
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

async function getFollowers(userId: string) {
  let collection = db.collection('follower');
  let ref = collection.where('following', '==', userId);

  let queryResult = await ref.get();

  return queryResult;
}

async function getFollowings(userId: string) {
  let collection = db.collection('follower');
  let ref = collection.where('follower', '==', userId);

  let queryResult = await ref.get();

  return queryResult;
}

async function getFollowStatus(follower: string, following: string) {
  let collection = db.collection('follower');
  let followRef = collection
    .where('follower', '==', follower)
    .where('following', '==', following);

  let followSnap = await followRef.get();
  if (followSnap.empty) {
    return false;
  } else {
    return true;
  }
}

async function toggleFollow(follower: string, following: string) {
  let collection = db.collection('follower');
  let followRef = collection
    .where('follower', '==', follower)
    .where('following', '==', following);

  let followSnap = await followRef.get();
  if (followSnap.empty) {
    await collection.add({ follower, following });

    return true;
  } else {
    followSnap.docs[0].ref.delete();

    return false;
  }
}

export default saveUserDetailsToDB;

export { getUser, toggleFollow, getFollowStatus, getFollowers, getFollowings };

export type { UserProfile };
