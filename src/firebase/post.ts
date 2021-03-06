import firebase from 'firebase/app';

import { getFollowings } from './user';

let db = firebase.firestore();
let storage = firebase.storage();

interface PostObject extends firebase.firestore.DocumentData {
  ownerId: string;
  postId: string;
  img: string;
  text: string;
  timestamp: firebase.firestore.Timestamp;
}

const MAX_AMOUNT_OF_FETCHES = 9;

async function getPostsForFeed(userId: string) {
  let followings = await getFollowings(userId);

  if (followings.size === 0) return null;

  let arrayOfIds: string[] = [];
  followings.forEach(async (user) => {
    let id = user.data().following;
    arrayOfIds.push(id);
  });

  let combined = [];
  do {
    let query = await db
      .collection('post')
      .where('ownerId', 'in', arrayOfIds.splice(0, 10))
      .orderBy('timestamp')
      .get();

    let data: firebase.firestore.DocumentData[] = [];
    query.forEach((el) => {
      data.push(el.data());
    });

    if (data.length > 0) combined.push(...data);
  } while (arrayOfIds.length > 10);

  return combined.sort((a, b) =>
    a.timestamp.toMillis() > b.timestamp.toMillis() ? -1 : 1
  );
}

async function getNumberOfPosts(userId: string) {
  let snapshot = await db
    .collection('post')
    .where('ownerId', '==', userId)
    .get();

  return snapshot.size;
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
      .limit(MAX_AMOUNT_OF_FETCHES);
  } else {
    queryRef = db
      .collection('post')
      .where('ownerId', '==', uid)
      .orderBy('timestamp', 'desc')
      .limit(MAX_AMOUNT_OF_FETCHES);
  }

  let resultOfQuery = await queryRef.get();

  let posts: {}[] = [];
  resultOfQuery.forEach((snap) => {
    posts.push(snap.data());
  });

  return posts;
}

async function getAllPosts(startAfter?: firebase.firestore.DocumentSnapshot) {
  let queryRef;

  if (startAfter) {
    queryRef = db
      .collection('post')
      .orderBy('timestamp', 'desc')
      .startAfter(startAfter)
      .limit(MAX_AMOUNT_OF_FETCHES);
  } else {
    queryRef = db
      .collection('post')
      .orderBy('timestamp', 'desc')
      .limit(MAX_AMOUNT_OF_FETCHES);
  }

  let querySnapshot = await queryRef.get();

  let posts: firebase.firestore.DocumentData[] = [];
  querySnapshot.forEach((snap) => {
    posts.push(snap.data());
  });

  return posts;
}

async function uploadImage(file: File, postId: string, userId: string) {
  let storageRef = storage.ref();

  let extension = file.type.replace('image/', '');
  let ref = storageRef.child(`${userId}.${postId}.${extension}`);

  await ref.put(file);

  return await ref.getDownloadURL();
}

async function createPost(uid: string) {
  let newPostRef = await db.collection('post').add({ ownerId: uid, text: '' });

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

  let resultOfQuery: firebase.firestore.DocumentData[] = Array(comments.size);
  comments.docs.forEach(async (comment, index) => {
    let commentData = comment.data();

    let userThatCommented = await db
      .collection('user')
      .doc(commentData.ownerId)
      .get();

    let nameOfCommenter = userThatCommented.data()?.profile.displayName;
    resultOfQuery[index] = {
      ...commentData,
      displayName: nameOfCommenter,
      commentId: comment.id,
    };
  });

  return resultOfQuery;
}

async function uploadImageAndSendPost(uid: string, file: File, text: string) {
  let postRef = await createPost(uid);
  let postId = postRef.id;

  let img = await uploadImage(file, postId, uid);

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
  getPostsForFeed,
  getNumberOfPosts,
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
