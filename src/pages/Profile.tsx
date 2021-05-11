import React, { FormEventHandler, useEffect, useState } from 'react';

import post from '../firebase/post';

import firebase from 'firebase/app';

import Post from '../components/post/Post';
import PostAddForm from '../components/post/PostAddForm';

function Profile(
  props: React.PropsWithoutRef<{ match: { params: { profile: string } } }>
) {
  let profileId = props.match.params.profile;
  let [posts, setPosts] = useState<firebase.firestore.DocumentData[]>([]);
  let [wasUpdated, setWasUpdated] = useState(false);

  useEffect(() => {
    let getPostsAndSetState = async () => {
      setPosts(await post.getPosts(profileId));
    };

    getPostsAndSetState();
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
      <div style={{ display: 'flex', flexWrap: 'wrap', marginTop: '2rem' }}>
        {posts &&
          posts.length > 0 &&
          posts.map((post, index) => <Post key={index} post={post} />)}
      </div>
    </div>
  );
}

export default Profile;
