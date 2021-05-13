import React, { FormEventHandler, useEffect, useState } from 'react';

import post from '../firebase/post';

import firebase from 'firebase/app';

import PostAddForm from '../components/post/PostAddForm';
import PostGrid from '../components/post/PostGrid';

import styled from 'styled-components';
import { getUser } from '../firebase/user';

import userIconPlaceholder from '../assets/images/user-icon-placeholder.png';
import Button from '../components/Button';
import handleScroll from '../helper/scroll';

let Container = styled.div`
  overflow: auto;
  height: calc(100vh - 3.5rem);
`;

let ProfileSection = styled.div`
  display: flex;
  justify-content: center;

  margin-top: 1rem;
`;

let ProfileGroup = styled.div`
  display: flex;
  width: 340px;
`;

let ProfileIcon = styled.img`
  height: 100px;
  width: 100px;

  border-radius: 100%;
`;

let ProfileDetails = styled.div`
  width: 240px;
`;

let Name = styled.div`
  text-align: center;
  font-size: 1.2rem;
  font-weight: bold;
`;

let Counts = styled.div`
  display: flex;
  justify-content: space-evenly;
  align-items: center;

  font-size: 0.8rem;
`;

let AddPostButton = styled(Button)`
  width: 110px;
  margin: 0 auto;
  margin-top: 1rem;
`;

function Profile(
  props: React.PropsWithoutRef<{
    match: { params: { profile: string } };
    currentUser: string;
  }>
) {
  let profileId = props.match.params.profile;
  let [user, setUser] = useState<firebase.firestore.DocumentData | null>(null);
  let [posts, setPosts] = useState<firebase.firestore.DocumentData[]>([]);
  let [wasUpdated, setWasUpdated] = useState(false);
  let [addFormVisibility, setAddFormVisibility] = useState(false);

  let [canLoadMore, setCanLoadMore] = useState(true);

  let [postCount, setPostCount] = useState(0);

  useEffect(() => {
    let isUnmounting = false;
    let getPostsAndSetState = async () => {
      let newPosts = await post.getPostsForUser(profileId);
      let newUser = await getUser(profileId);

      let newPostCount = await post.getNumberOfPosts(profileId);

      if (!isUnmounting) {
        setPosts(newPosts);
        setUser(newUser);

        setPostCount(newPostCount);
      }
    };

    getPostsAndSetState();

    return () => {
      isUnmounting = true;
    };
  }, [profileId, wasUpdated]);

  let submitHandler: FormEventHandler<HTMLFormElement> = (e) => {
    e.preventDefault();
    let target = e.target as HTMLFormElement;
    let fileInput = target.elements.namedItem('file') as HTMLInputElement;

    if (fileInput.files == null) return;

    let textInput = target.elements.namedItem('text') as HTMLInputElement;

    if (textInput == null) return;

    let image = fileInput.files[0];
    post.uploadImageAndSendPost(profileId, image, textInput.value).then(() => {
      setWasUpdated((prev) => {
        return !prev;
      });
    });

    target.reset();
  };

  let scrollBeingHandled = false;
  let scrollCallback = async () => {
    if (scrollBeingHandled) return;
    scrollBeingHandled = true;
    let lastPostId = posts[posts.length - 1].postId as string;
    let lastPostSnapshot = await post.getPost(lastPostId);
    if (!lastPostSnapshot) return;

    let newPostsToAdd = await post.getPostsForUser(profileId, lastPostSnapshot);

    if (!newPostsToAdd.length) setCanLoadMore(false);
    else setPosts((prev) => [...prev, ...newPostsToAdd]);
  };

  return (
    <Container
      onScroll={(e) => {
        handleScroll(e, canLoadMore, scrollCallback);
      }}
    >
      <ProfileSection>
        <ProfileGroup>
          <ProfileIcon src={user ? user.photoURL : userIconPlaceholder} />
          <ProfileDetails>
            <Name>{user?.displayName}</Name>
            <Counts>
              {postCount} posts
              <br /> {0} followers
              <br /> {0} following
            </Counts>
          </ProfileDetails>
        </ProfileGroup>
      </ProfileSection>
      <AddPostButton
        onClick={() => {
          setAddFormVisibility((prev) => !prev);
        }}
      >
        New Post+
      </AddPostButton>
      {addFormVisibility && <PostAddForm submitHandler={submitHandler} />}
      <PostGrid posts={posts} />
    </Container>
  );
}

export default Profile;
