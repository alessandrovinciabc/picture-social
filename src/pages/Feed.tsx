import React, { useEffect, useState } from 'react';
import Post from '../components/post/Post';

import firebase from 'firebase/app';
import posts from '../firebase/post';

import styled from 'styled-components';

let Container = styled.div`
  display: flex;

  width: 100%;

  align-items: center;
  flex-direction: column;

  margin-top: 1rem;
`;

const Feed: React.FC<{ currentUser: string }> = (props) => {
  let [postsToShow, setPostsToShow] = useState<
    firebase.firestore.DocumentData[]
  >([]);

  useEffect(() => {
    let isUnmounting = false;

    if (props.currentUser == null) return;

    let getPostsAndSetState = async () => {
      let newPosts = await posts.getPostsForFeed(props.currentUser);

      if (isUnmounting || newPosts == null) return;

      setPostsToShow(newPosts);
    };

    getPostsAndSetState();

    return () => {
      isUnmounting = true;
    };
  }, [props.currentUser]);

  return (
    <Container>
      {postsToShow.length === 0
        ? 'No posts to show here!'
        : postsToShow.map((post) => {
            return (
              <Post
                key={post.postId}
                isOwner={props.currentUser === post.ownerId}
                post={post}
                viewerId={props.currentUser}
              />
            );
          })}
    </Container>
  );
};

export default Feed;
