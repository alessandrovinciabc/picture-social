import React, { useEffect, useState } from 'react';

import posts from '../firebase/post';

import firebase from 'firebase/app';

import Post from '../components/post/Post';

import styled from 'styled-components';

let ViewContainer = styled.div`
  display: flex;

  width: 100%;

  justify-content: center;

  margin-top: 1rem;
`;

function PostView(
  props: React.PropsWithoutRef<{
    match: { params: { postId: string } };
    currentUser: string;
  }>
) {
  let postId = props.match.params.postId;
  let [post, setPost] = useState<firebase.firestore.DocumentData | undefined>();

  useEffect(() => {
    let isUnmounting = false;

    let getPostAndSetState = async () => {
      let newPost = await posts.getPost(postId);
      if (isUnmounting) return;
      setPost(newPost.data());
    };

    getPostAndSetState();

    return () => {
      isUnmounting = true;
    };
  }, [postId]);

  return (
    <ViewContainer>
      {post && (
        <Post
          isOwner={props.currentUser === post.ownerId}
          post={post}
          viewerId={props.currentUser}
        />
      )}
    </ViewContainer>
  );
}

export default PostView;
