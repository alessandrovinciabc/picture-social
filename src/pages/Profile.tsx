import React, { FormEventHandler, useEffect, useState } from 'react';

import post from '../firebase/post';

import firebase from 'firebase/app';

import PostAddForm from '../components/post/PostAddForm';
import PostGrid from '../components/post/PostGrid';

import styled from 'styled-components';
import {
  getFollowStatus,
  getFollowers,
  getFollowings,
  getUser,
  toggleFollow,
} from '../firebase/user';

import userIconPlaceholder from '../assets/images/user-icon-placeholder.png';
import Button from '../components/Button';
import handleScroll from '../helper/scroll';
import BlueButton from '../components/BlueButton';
import ListModal from '../components/ListModal';

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
  align-items: center;

  flex-direction: column;

  font-size: 1rem;
`;

let FollowCount = styled.span`
  cursor: pointer;

  &:hover {
    font-weight: bold;
  }
`;

let AddPostButton = styled(Button)`
  width: 110px;
  margin: 0 auto;
  margin-top: 1rem;
`;

let FollowControl = styled(BlueButton)`
  margin: 15px auto;
`;

function getUsersFromFollow(
  querySnapshot: firebase.firestore.QuerySnapshot,
  type: 'follower' | 'following'
) {
  let arr: firebase.firestore.DocumentData[] = [];
  querySnapshot.forEach(async (follower) => {
    let userSnap = await getUser(follower.data()[type]);
    arr.push(userSnap);
  });
  return arr;
}

function Profile(
  props: React.PropsWithoutRef<{
    match: { params: { profile: string } };
    currentUser: string;
  }>
) {
  let profileId = props.match.params.profile;
  let [viewer, setViewer] =
    useState<firebase.firestore.DocumentData | null>(null);
  let [user, setUser] = useState<firebase.firestore.DocumentData | null>(null);
  let [posts, setPosts] = useState<firebase.firestore.DocumentData[]>([]);
  let [wasUpdated, setWasUpdated] = useState(false);
  let [addFormVisibility, setAddFormVisibility] = useState(false);

  let [canLoadMore, setCanLoadMore] = useState(true);

  let [postCount, setPostCount] = useState(0);
  let [nOfFollowers, setNOfFollowers] = useState(0);
  let [nOfFollowings, setNOfFollowings] = useState(0);

  let [alreadyFollowing, setAlreadyFollowing] = useState(false);

  let [followerModal, setFollowerModal] = useState(false);
  let [followingModal, setFollowingModal] = useState(false);

  let [followers, setFollowers] = useState<firebase.firestore.DocumentData[]>(
    []
  );
  let [followings, setFollowings] = useState<firebase.firestore.DocumentData[]>(
    []
  );

  //get viewer
  useEffect(() => {
    let isUnmounting = false;

    let getViewerAndSetState = async () => {
      let newViewer = await getUser(props.currentUser);

      if (isUnmounting) return;
      setViewer(newViewer);
    };

    getViewerAndSetState();

    return () => {
      isUnmounting = true;
    };
  });

  useEffect(() => {
    let isUnmounting = false;

    let getPostsAndSetState = async () => {
      let newPosts = await post.getPostsForUser(profileId);
      let newUser = await getUser(profileId);

      let newPostCount = await post.getNumberOfPosts(profileId);
      let newFollowers = await getFollowers(profileId);
      let newFollowings = await getFollowings(profileId);

      if (!isUnmounting) {
        setPosts(newPosts);
        setUser(newUser);

        setPostCount(newPostCount);
        setNOfFollowers(newFollowers.size);
        setNOfFollowings(newFollowings.size);

        setFollowers((prev) => {
          return getUsersFromFollow(newFollowers, 'follower');
        });
        setFollowings((prev) => {
          return getUsersFromFollow(newFollowings, 'following');
        });
      }
    };

    getPostsAndSetState();

    return () => {
      isUnmounting = true;
    };
  }, [profileId, wasUpdated]);

  useEffect(() => {
    let isUnmounting = false;
    if (props.currentUser == null) return;

    let fetchAndSetState = async () => {
      let isFollowing = await getFollowStatus(props.currentUser, profileId);

      if (isUnmounting) return;

      setAlreadyFollowing(isFollowing);
    };

    fetchAndSetState();

    return () => {
      isUnmounting = true;
    };
  }, [props.currentUser, profileId]);

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

  let handleFollowClick = () => {
    toggleFollow(props.currentUser, profileId);
    setAlreadyFollowing((prev) => {
      if (prev) {
        setNOfFollowers((prev) => prev - 1);
        setFollowers((prev) => {
          let clone = JSON.parse(JSON.stringify(prev));

          return clone.filter(
            (user: firebase.firestore.DocumentData) => user.uid !== viewer!.uid
          );
        });
      } else {
        setNOfFollowers((prev) => prev + 1);
        setFollowers((prev) => prev.concat(viewer!));
      }
      return !prev;
    });
  };

  return (
    <Container
      onScroll={(e) => {
        handleScroll(e, canLoadMore, scrollCallback);
      }}
    >
      {followerModal && (
        <ListModal
          onClose={() => {
            setFollowerModal(false);
          }}
          title="Followers"
          content={followers}
          viewerId={props.currentUser}
        />
      )}
      {followingModal && (
        <ListModal
          onClose={() => {
            setFollowingModal(false);
          }}
          title="Following"
          content={followings}
          viewerId={props.currentUser}
        />
      )}
      <ProfileSection>
        <ProfileGroup>
          <ProfileIcon src={user ? user.photoURL : userIconPlaceholder} />
          <ProfileDetails>
            <Name>{user?.displayName}</Name>
            <Counts>
              <span>{postCount} posts</span>
              <FollowCount
                onClick={() => {
                  setFollowerModal(true);
                }}
              >
                {nOfFollowers} followers
              </FollowCount>
              <FollowCount
                onClick={() => {
                  setFollowingModal(true);
                }}
              >
                {nOfFollowings} following
              </FollowCount>
            </Counts>
            {props.currentUser != null &&
              user != null &&
              user.uid !== props.currentUser && (
                <FollowControl onClick={handleFollowClick}>
                  {alreadyFollowing ? 'Unfollow' : 'Follow'}
                </FollowControl>
              )}
          </ProfileDetails>
        </ProfileGroup>
      </ProfileSection>
      {props.currentUser === user?.uid && (
        <AddPostButton
          onClick={() => {
            setAddFormVisibility((prev) => !prev);
          }}
        >
          New Post+
        </AddPostButton>
      )}

      {addFormVisibility && <PostAddForm submitHandler={submitHandler} />}
      <PostGrid posts={posts} />
    </Container>
  );
}

export default Profile;
