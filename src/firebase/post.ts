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

async function getPost(id: string) {
  let postSnapshot = await db.collection('post').doc(id).get();

  return postSnapshot;
}

async function getPostsForUser(
  uid: string,
  startAfter?: firebase.firestore.DocumentSnapshot
) {
  let queryRef;

  if (startAfter) {
    queryRef = db
      .collection('post')
      .where('ownerId', '==', uid)
      .orderBy('timestamp', 'desc')
      .startAfter(startAfter)
      .limit(6);
  } else {
    queryRef = db
      .collection('post')
      .where('ownerId', '==', uid)
      .orderBy('timestamp', 'desc')
      .limit(6);
  }

  let resultOfQuery = await queryRef.get();

  let posts: {}[] = [];
  resultOfQuery.forEach((snap) => {
    posts.push(snap.data());
  });

  return posts;
}

async function getAllPosts() {
  let querySnapshot = await db.collection('post').orderBy('timestamp').get();

  let posts: firebase.firestore.DocumentData[] = [];
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
  let newPostRef = await db.collection('post').add({ ownerId: uid });

  let newId = newPostRef.id;
  await newPostRef.update({ postId: newId });

  return newPostRef;
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

async function addComment(postId: string, userId: string, text: string) {
  let commentsRef = db.collection('post').doc(postId).collection('comments');

  return await commentsRef.add({
    ownerId: userId,
    text,
    timestamp: firebase.firestore.Timestamp.now(),
  });
}

async function deleteComment(postId: string, commentId: string) {
  let commentRef = db
    .collection('post')
    .doc(postId)
    .collection('comments')
    .doc(commentId);

  await commentRef.delete();
}

async function getComments(postId: string) {
  let postRef = db.collection('post').doc(postId);
  let commentsRef = postRef.collection('comments');

  let comments = await commentsRef.orderBy('timestamp').get();

  let resultOfQuery: firebase.firestore.DocumentData[] = [];
  comments.forEach(async (comment) => {
    let commentData = comment.data();

    let userThatCommented = await db
      .collection('user')
      .doc(commentData.ownerId)
      .get();

    let nameOfCommenter = userThatCommented.data()?.profile.displayName;
    resultOfQuery.push({
      ...commentData,
      displayName: nameOfCommenter,
      commentId: comment.id,
    });
  });

  return resultOfQuery;
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

async function deletePost(postId: string) {
  let postRef = db.collection('post').doc(postId);
  let likes = postRef.collection('likes');
  let comments = postRef.collection('comments');

  let post = await postRef.get();

  let postData = post.data();
  if (postData == null) return;
  let url = postData.img;

  await likes.get().then((snapshot) => {
    snapshot.forEach((doc) => {
      doc.ref.delete();
    });
  });

  await comments.get().then((snapshot) => {
    snapshot.forEach((doc) => {
      doc.ref.delete();
    });
  });

  await deleteImage(url);
  await postRef.delete();
}

async function getLikeStatus(userId: string, postId: string) {
  let likeRef = db
    .collection('post')
    .doc(postId)
    .collection('likes')
    .doc(userId);

  let likeSnapshot = await likeRef.get();

  if (likeSnapshot.exists) return true;
  return false;
}

async function getLikesCount(postId: string) {
  let postLikesRef = db.collection('post').doc(postId).collection('likes');

  let postLikesData = await postLikesRef.get();
  let count = postLikesData.size;

  return count;
}

async function togglePostLike(userId: string, postId: string) {
  let likeRef = db
    .collection('post')
    .doc(postId)
    .collection('likes')
    .doc(userId);

  let likeSnapshot = await likeRef.get();

  if (likeSnapshot.exists) {
    await likeRef.delete();
    return false;
  }

  await likeRef.set({ userId, postId });

  return true;
}

let defaultExport = {
  getPost,
  getPostsForUser,
  getAllPosts,
  uploadImageAndSendPost,
  deletePost,
  togglePostLike,
  getLikeStatus,
  getLikesCount,
  addComment,
  deleteComment,
  getComments,
};

export default defaultExport;

export type { PostObject };
