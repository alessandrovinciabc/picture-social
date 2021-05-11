import firebase from 'firebase/app';

import styled from 'styled-components';

import { IconDots } from '@tabler/icons';
import userIconPlaceholder from '../../assets/images/user-icon-placeholder.png';

import { getUser, UserProfile } from '../../firebase/user';
import { useEffect, useState } from 'react';

import posts from '../../firebase/post';

//Type definitions
import { PostObject } from '../../firebase/post';

let PostContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;

  min-height: 350px;
  width: 300px;

  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  margin: 1rem;

  user-select: none;
`;

let ProfileSection = styled.div`
  display: flex;
  align-items: center;

  cursor: pointer;
`;

let UserIcon = styled.img`
  background-size: cover;
  border-radius: 100%;
  height: 40px;
  width: 40px;

  margin-right: 10px;
`;

let ProfileName = styled.a`
  font-weight: bold;

  width: 200px;

  overflow: hidden;
`;

let PostTopSection = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;
  width: 100%;

  padding: 5px;

  border-bottom: 1px solid rgba(0, 0, 0, 0.2);
`;

let PostBottomSection = styled.div`
  display: flex;

  width: 100%;
  flex-grow: 1;

  padding: 5px;

  border-top: 1px solid rgba(0, 0, 0, 0.2);
`;

let OptionsContainer = styled.div`
  position: relative;
  display: flex;
  align-items: center;
  flex-direction: column;
`;

let OptionsIcon = styled(IconDots)`
  height: 30px;
  width: 30px;

  stroke: black;
  stroke-width: 1;

  cursor: pointer;
`;

let OptionsDialog = styled.div`
  position: absolute;
  top: 25px;

  height: 30px;
  width: 100px;
  background-color: white;

  border-radius: 5px;
  border: 1px solid rgba(0, 0, 0, 0.2);

  font-size: 14px;
  color: red;
  font-weight: bold;

  display: flex;
  justify-content: center;
  align-items: center;

  &:hover {
    background-color: #ebebeb;

    cursor: pointer;
  }
`;

let PostImage = styled.img`
  width: 300px;
  height: 300px;
  object-fit: contain;

  border-radius: 2px;
`;

const Post: React.FC<{
  post: PostObject | firebase.firestore.DocumentData;
  isOwner: boolean;
}> = (props) => {
  let { post } = props;
  let [user, setUser] = useState<UserProfile | null>(null);
  let [viewOptions, setViewOptions] = useState(false);

  useEffect(() => {
    let getUserAndSetState = async () => {
      let user = await getUser(post.ownerId);

      if (user) {
        setUser(user);
      }
    };

    getUserAndSetState();
  }, [post]);

  let onOptionsClick = () => {
    setViewOptions((prev) => {
      return !prev;
    });
  };

  return (
    <PostContainer>
      <PostTopSection>
        <ProfileSection>
          <UserIcon src={user ? user.photoURL : userIconPlaceholder} />
          <ProfileName>{user ? user.displayName : null}</ProfileName>
        </ProfileSection>
        {props.isOwner ? (
          <OptionsContainer>
            <OptionsIcon onClick={onOptionsClick} />
            {viewOptions && (
              <OptionsDialog
                onClick={() => {
                  if (user) {
                    posts.deletePost(user.uid, post.postId).then(() => {
                      window.location.reload();
                    });
                  }
                }}
              >
                Delete Post
              </OptionsDialog>
            )}
          </OptionsContainer>
        ) : null}
      </PostTopSection>
      <PostImage src={post.img} alt="" />
      <PostBottomSection>{post.text}</PostBottomSection>
    </PostContainer>
  );
};

export default Post;
