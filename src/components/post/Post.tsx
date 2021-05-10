import firebase from 'firebase/app';

import styled from 'styled-components';

let PostContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
`;

let PostImage = styled.img`
  width: 300px;
  height: 300px;
  object-fit: contain;

  border: 1px solid black;
  border-radius: 2px;
`;

const Post: React.FC<{
  post: { img: string; text: string } | firebase.firestore.DocumentData;
}> = (props) => {
  let { post } = props;

  return (
    <PostContainer>
      <PostImage src={post.img} alt="" />
      {post.text}
    </PostContainer>
  );
};

export default Post;
