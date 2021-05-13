import React, { useEffect, useState } from 'react';

import firebase from 'firebase/app';

import postDB from '../firebase/post';

import PostGrid from '../components/post/PostGrid';

import styled from 'styled-components';
import handleScroll from '../helper/scroll';

let Container = styled.div`
  overflow: auto;
  height: calc(100vh - 3.5rem);
`;

function Explore(props: React.PropsWithoutRef<{}>) {
  let [posts, setPosts] = useState<firebase.firestore.DocumentData[]>([]);
  let [canLoadMore, setCanLoadMore] = useState(true);

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

  let scrollBeingHandled = false;
  let scrollCallback = async () => {
    if (scrollBeingHandled) return;
    scrollBeingHandled = true;
    let lastPostId = posts[posts.length - 1].postId as string;
    let lastPostSnapshot = await postDB.getPost(lastPostId);
    if (!lastPostSnapshot) return;

    let newPostsToAdd = await postDB.getAllPosts(lastPostSnapshot);

    if (!newPostsToAdd.length) setCanLoadMore(false);
    else setPosts((prev) => [...prev, ...newPostsToAdd]);
  };

  return (
    <Container
      onScroll={(e) => {
        handleScroll(e, canLoadMore, scrollCallback);
      }}
    >
      <PostGrid posts={posts}></PostGrid>
    </Container>
  );
}

export default Explore;
