import firebase from 'firebase/app';

let db = firebase.firestore();
let storage = firebase.storage();

interface PostObject extends firebase.firestore.DocumentData {
  ownerId: string;
  postId: string;
  img: string;
  text: string;
  timestamp: firebase.firestore.Timestamp;
}

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
  let storageRef = storage.ref();

  let extension = file.type.replace('image/', '');
  let ref = storageRef.child(`${postId}.${extension}`);

  await ref.put(file);

  return await ref.getDownloadURL();
}

async function createPost(uid: string) {
  let newPost = await db.collection('post').add({ ownerId: uid });
  let newId = newPost.id;

  let newPostInsideUserRef = db
    .collection('user')
    .doc(uid)
    .collection('post')
    .doc(newId);

  newPostInsideUserRef.set({ ownerId: uid });

  return newPostInsideUserRef;
}

async function updatePost(
  ref: firebase.firestore.DocumentReference<firebase.firestore.DocumentData>,
  imgUrl: string,
  text: string
) {
  return await ref.update({
    img: imgUrl,
    text,
    postId: ref.id,
    timestamp: firebase.firestore.Timestamp.now(),
  });
}

async function uploadImageAndSendPost(uid: string, file: File, text: string) {
  let postRef = await createPost(uid);
  let postId = postRef.id;

  let img = await uploadImage(file, postId);

  await updatePost(postRef, img, text);
}

async function deleteImage(url: string) {
  let imageRef = storage.refFromURL(url);
  imageRef.delete();
}

async function deletePost(ownerId: string, postId: string) {
  await db.collection('post').doc(postId).delete();

  let postRef = db
    .collection('user')
    .doc(ownerId)
    .collection('post')
    .doc(postId);

  let post = await postRef.get();

  let postData = post.data();
  if (postData == null) return;
  let url = postData.img;

  await deleteImage(url);
  await postRef.delete();
}

let defaultExport = { getPosts, uploadImageAndSendPost, deletePost };

export default defaultExport;

export type { PostObject };
