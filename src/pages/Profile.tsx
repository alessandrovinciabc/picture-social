import React, { FormEventHandler, useEffect, useState } from 'react';

import post from '../firebase/post';

import firebase from 'firebase/app';

import PostAddForm from '../components/post/PostAddForm';
import PostGrid from '../components/post/PostGrid';

function Profile(
  props: React.PropsWithoutRef<{
    match: { params: { profile: string } };
    currentUser: string;
  }>
) {
  let profileId = props.match.params.profile;
  let [posts, setPosts] = useState<firebase.firestore.DocumentData[]>([]);
  let [wasUpdated, setWasUpdated] = useState(false);

  useEffect(() => {
    let isUnmounting = false;
    let getPostsAndSetState = async () => {
      let newPosts = await post.getPosts(profileId);

      if (!isUnmounting) {
        setPosts(newPosts);
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

  return (
    <div>
      {profileId}
      <br />
      <PostAddForm submitHandler={submitHandler} />
      <PostGrid posts={posts} />
    </div>
  );
}

export default Profile;
