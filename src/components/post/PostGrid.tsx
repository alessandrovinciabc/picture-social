import React from 'react';

import firebase from 'firebase/app';

import styled from 'styled-components';

import { useHistory } from 'react-router';

let Container = styled.div`
  display: flex;
  justify-content: center;

  margin-top: 1rem;
`;

let Grid = styled.div`
  display: flex;
  flex-wrap: wrap;

  width: calc(250px * 3 + 6rem);
`;

let PostContainer = styled.div`
  position: relative;
  display: flex;

  width: 250px;
  height: 250px;

  margin: 0.5rem;

  &:hover::after {
    content: 'Goto post';

    color: white;

    display: flex;
    justify-content: center;
    align-items: center;

    position: absolute;
    background-color: rgba(0, 0, 0, 0.4);
    height: 250px;
    width: 250px;

    cursor: pointer;
  }
`;

let PostSquare = styled.img`
  position: relative;

  width: 250px;
  height: 250px;
  object-fit: contain;
`;

const PostGrid: React.FC<{
  posts: firebase.firestore.DocumentData[];
}> = (props) => {
  let { posts } = props;
  let history = useHistory();

  return (
    <Container>
      <Grid>
        {posts.map((post) => {
          return (
            <PostContainer
              key={post.postId}
              onClick={() => {
                history.push(`/p/${post.postId}`);
              }}
            >
              <PostSquare src={post.img} />
            </PostContainer>
          );
        })}
      </Grid>
    </Container>
  );
};

export default PostGrid;
