import firebase from 'firebase/app';

let db = firebase.firestore();

interface UserProfile extends firebase.firestore.DocumentData {
  photoURL: string;
  displayName: string;
  uid: string;
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

async function getNumberOfFollowers(userId: string) {
  let collection = db.collection('follower');
  let ref = collection.where('following', '==', userId);

  let queryResult = await ref.get();

  return queryResult.size;
}

async function getNumberOfFollowings(userId: string) {
  let collection = db.collection('follower');
  let ref = collection.where('follower', '==', userId);

  let queryResult = await ref.get();

  return queryResult.size;
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

export {
  getUser,
  toggleFollow,
  getFollowStatus,
  getNumberOfFollowers,
  getNumberOfFollowings,
};

export type { UserProfile };
