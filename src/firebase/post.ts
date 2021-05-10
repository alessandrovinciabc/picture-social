import firebase from 'firebase/app';

let db = firebase.firestore();
let storageRef = firebase.storage().ref();

async function getPosts(uid: string) {
  let querySnapshot = await db
    .collection('user')
    .doc(uid)
    .collection('post')
    .orderBy('timestamp')
    .get();

  let posts: {}[] = [];
  querySnapshot.forEach((snap) => {
    posts.push(snap.data());
  });

  return posts;
}

async function uploadImage(file: File, postId: string) {
  let extension = file.type.replace('image/', '');
  let ref = storageRef.child(`${postId}.${extension}`);

  await ref.put(file);

  return await ref.getDownloadURL();
}

async function createPost(uid: string) {
  return db.collection('user').doc(uid).collection('post').add({});
}

async function updatePost(
  ref: firebase.firestore.DocumentReference<firebase.firestore.DocumentData>,
  imgUrl: string,
  text: string
) {
  return await ref.update({
    img: imgUrl,
    text,
    timestamp: firebase.firestore.Timestamp.now(),
  });
}

async function uploadImageAndSendPost(uid: string, file: File, text: string) {
  let postRef = await createPost(uid);
  let postId = postRef.id;

  let img = await uploadImage(file, postId);

  await updatePost(postRef, img, text);
}

let defaultExport = { getPosts, uploadImageAndSendPost };

export default defaultExport;
