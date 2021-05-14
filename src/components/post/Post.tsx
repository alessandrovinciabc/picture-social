import firebase from 'firebase/app';

import styled from 'styled-components';

import { IconDots, IconHeart, IconMessage2 } from '@tabler/icons';
import userIconPlaceholder from '../../assets/images/user-icon-placeholder.png';

import { getUser, UserProfile } from '../../firebase/user';
import React, { useEffect, useState } from 'react';

import posts from '../../firebase/post';

//Type definitions
import { PostObject } from '../../firebase/post';
import Button from '../Button';
import { useHistory } from 'react-router';

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
  text-overflow: ellipsis;
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

  flex-direction: column;

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

let Controls = styled.div`
  position: relative;
  display: flex;

  width: 100%;
`;

let Like = styled.div`
  height: 31px;
  width: 31px;

  cursor: pointer;
`;

let LikeIcon = styled(IconHeart)`
  position: relative;
  height: 30px;
  width: 30px;

  stroke: ${(props: { 'data-active': boolean }) =>
    props['data-active'] ? '#ed3333' : 'black'};

  fill: ${(props: { 'data-active': boolean }) =>
    props['data-active'] ? '#ed3333' : 'white'};

  stroke-width: 1;
`;

let LikeCounter = styled.div`
  height: 25px;
  width: 25px;

  position: absolute;
  top: 50%;
  left: 15px;
  transform: translate(-50%, -50%);

  display: flex;
  justify-content: center;
  align-items: center;

  &::after {
    content: ${(props: { 'data-active': boolean; count: number }) =>
      props.count ? `"${props.count}"` : '"0"'};

    font-size: 0.7rem;
    color: ${(props: { 'data-active': boolean; count: number }) =>
      props['data-active'] ? 'white' : 'black'};
  }
`;

let CommentIcon = styled(IconMessage2)`
  height: 30px;
  width: 30px;

  stroke: black;
  stroke-width: 1;

  cursor: pointer;
`;

let PostText = styled.div`
  display: block;

  margin-top: 5px;
  margin-left: 3px;
  margin-right: 3px;

  word-break: break-word;
`;

let CommentSection = styled.div`
  display: flex;
  flex-direction: column;

  border-top: 1px solid rgba(0, 0, 0, 0.2);
  margin: 5px 3px;
`;

let Comment = styled.div`
  margin: 5px 0;
`;
let CommentProfileName = styled.span`
  font-size: 0.9rem;
  font-weight: bold;

  cursor: pointer;

  &:after {
    content: ' ';
  }
`;

let CommentForm = styled.form`
  padding-top: 5px;

  border-top: 1px solid rgba(0, 0, 0, 0.2);

  display: flex;
  align-items: center;
`;

let FormText = styled.textarea`
  resize: none;

  width: 293px;

  height: 48px;
`;

let ConfirmComment = styled(Button)`
  height: max-content;
  width: max-content;

  border: none;
  margin-left: 5px;

  color: #0074d9;

  &:hover {
    color: #0074d9;
    background-color: white;
  }
`;

let DeleteCommentBtn = styled(Button)`
  display: inline-block;
  height: 16px;
  width: 16px;

  padding: 0;

  vertical-align: middle;
  border: none;

  position: relative;
  &:after {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);

    font-size: 0.7rem;
    font-weight: bold;

    content: 'X';
    color: #ed3333;
  }
`;

let CommentText = styled.span`
  word-break: break-word;
`;

const Post: React.FC<{
  post: PostObject | firebase.firestore.DocumentData;
  isOwner: boolean;
  viewerId: string;
}> = (props) => {
  let { post } = props;

  let [likeStatus, setLikeStatus] = useState(false);
  let [likeCount, setLikeCount] = useState(0);
  let [wasUpdated, setWasUpdated] = useState(true);

  let [user, setUser] = useState<UserProfile | null>(null);
  let [viewer, setViewer] = useState<UserProfile | null>(null);

  let [viewOptions, setViewOptions] = useState(false);

  let [viewCommentSection, setViewCommentSection] = useState(false);
  let [comments, setComments] = useState<firebase.firestore.DocumentData[]>([]);
  let [commentInput, setCommentInput] = useState('');

  let history = useHistory();

  useEffect(() => {
    let isUnmounting = false;
    let getUserAndSetState = async () => {
      let user = await getUser(post.ownerId);
      let viewer = await getUser(props.viewerId);

      if (isUnmounting) return;

      if (user) {
        setUser(user);
      }

      if (viewer) {
        setViewer(viewer);
      }
    };

    getUserAndSetState();

    return () => {
      isUnmounting = true;
    };
  }, [post, props.viewerId]);

  useEffect(() => {
    let isUnmounting = false;
    if (!wasUpdated) return;
    if (user == null) return;

    let getLikeStatusAndSetState = async () => {
      let status = await posts.getLikeStatus(props.viewerId, post.postId);
      let count = await posts.getLikesCount(post.postId);

      if (isUnmounting) return;

      setLikeStatus(status);
      setLikeCount(count);
      setWasUpdated(false);
    };

    getLikeStatusAndSetState();

    return () => {
      isUnmounting = true;
    };
  }, [post, user, props.viewerId, wasUpdated]);

  useEffect(() => {
    let isUnmounting = false;

    let getCommentsAndSetState = async () => {
      let newComments = await posts.getComments(post.postId);

      if (isUnmounting) return;
      setComments(newComments);
    };

    getCommentsAndSetState();

    return () => {
      isUnmounting = true;
    };
  }, [post]);

  let onOptionsClick = () => {
    setViewOptions((prev) => {
      return !prev;
    });
  };

  let onLike = () => {
    if (props.viewerId == null) return;
    let toggleLikeAndSetState = async () => {
      await posts.togglePostLike(props.viewerId, post.postId);

      setWasUpdated(true);
    };

    toggleLikeAndSetState();
  };

  let onCommentIconClick = () => {
    setViewCommentSection((prev) => !prev);
  };

  let handleCommentInput: React.ChangeEventHandler<HTMLTextAreaElement> = (
    e
  ) => {
    setCommentInput(e.target.value);
  };

  let handleCommentAdd: React.FormEventHandler<HTMLFormElement> = async (e) => {
    e.preventDefault();

    let newPostRef = await posts.addComment(
      post.postId,
      props.viewerId,
      commentInput
    );

    let newId = newPostRef.id;

    setComments((prev) => {
      let copy = JSON.parse(JSON.stringify(prev));
      copy.push({
        displayName: viewer?.displayName,
        ownerId: viewer?.uid,
        text: commentInput,
        commentId: newId,
      });

      return copy;
    });
    setCommentInput('');
  };

  let handleCommentDelete: React.MouseEventHandler<HTMLButtonElement> = (e) => {
    let button = e.target as HTMLButtonElement;

    let commentId = button.dataset.commentid!;

    posts.deleteComment(post.postId, commentId);

    setComments((prev) => {
      let copy = JSON.parse(JSON.stringify(prev));
      let filtered = copy.filter(
        (el: firebase.firestore.DocumentData) => el.commentId !== commentId
      );

      return filtered;
    });
  };

  return (
    <PostContainer>
      <PostTopSection>
        <ProfileSection
          onClick={() => {
            history.push(`/${user!.uid}`);
          }}
        >
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
                    posts.deletePost(post.postId).then(() => {
                      history.push(`/${props.viewerId}`);
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
      <PostBottomSection>
        <Controls>
          <Like onClick={onLike}>
            <LikeIcon data-active={likeStatus} />
            <LikeCounter data-active={likeStatus} count={likeCount} />
          </Like>
          <CommentIcon onClick={onCommentIconClick} />
        </Controls>
        <PostText>{post.text}</PostText>
        {viewCommentSection && (
          <CommentSection>
            {comments.map((comment) => (
              <Comment key={comment.commentId}>
                <CommentProfileName
                  onClick={() => {
                    history.push(`/${comment.ownerId}`);
                  }}
                >
                  {comment.displayName}
                </CommentProfileName>
                <CommentText>{comment.text} </CommentText>
                {props.viewerId === post.ownerId ? (
                  <DeleteCommentBtn
                    onClick={handleCommentDelete}
                    data-commentid={comment.commentId}
                  />
                ) : null}
              </Comment>
            ))}
            <CommentForm onSubmit={handleCommentAdd}>
              <FormText
                value={commentInput}
                onChange={handleCommentInput}
                max-length="1"
                required
              />
              <ConfirmComment>Post</ConfirmComment>
            </CommentForm>
          </CommentSection>
        )}
      </PostBottomSection>
    </PostContainer>
  );
};

export default Post;
