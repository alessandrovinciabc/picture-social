import React, { useEffect, useState } from 'react';

import firebase from 'firebase/app';

import postDB from '../firebase/post';

import PostGrid from '../components/post/PostGrid';

function Explore(props: React.PropsWithoutRef<{}>) {
  let [posts, setPosts] = useState<firebase.firestore.DocumentData[]>([]);

  useEffect(() => {
    let isUnmounting = false;

    let fetchPostsAndSetState = async () => {
      let snapshot = await postDB.getAllPosts();
      if (isUnmounting) return;
      setPosts(snapshot);
    };

    fetchPostsAndSetState();

    return () => {
      isUnmounting = true;
    };
  }, []);

  return (
    <>
      <PostGrid posts={posts}></PostGrid>
    </>
  );
}

export default Explore;
