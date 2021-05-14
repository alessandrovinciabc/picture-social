import React from 'react';

import firebase from 'firebase/app';

import styled from 'styled-components';

import UserListItem from './UserListItem';

let BackDrop = styled.div`
  position: absolute;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;

  background-color: rgba(0, 0, 0, 0.5);

  z-index: 1;
`;

let MainContainer = styled.div`
  position: absolute;
  top: 50%;
  left: 50%;

  transform: translate(-50%, -50%);

  z-index: 2;

  background-color: white;

  height: 400px;
  width: 340px;

  border-radius: 20px;

  display: flex;

  flex-direction: column;

  padding: 0.5rem 1.4rem;
`;

let TitleSection = styled.div`
  border-bottom: 1px solid rgba(0, 0, 0, 0.2);

  display: flex;
  justify-content: space-between;
  align-items: flex-end;

  padding-bottom: 0.5rem;
`;

let TitleText = styled.span`
  font-weight: bold;
  font-size: 1.2rem;
`;

let CloseButton = styled.button`
  border: none;
  background: none;

  font-size: 1.5rem;

  transform: scaleX(1.4);

  &::after {
    content: 'X';
  }

  &:hover {
    cursor: pointer;
  }
`;

let Content = styled.div``;

const ListModal: React.FC<{
  onClose?: Function;
  title: string;
  content: firebase.firestore.DocumentData[];
  viewerId: string;
}> = (props) => {
  return (
    <>
      <BackDrop
        onClick={() => {
          props.onClose?.();
        }}
      />
      <MainContainer>
        <TitleSection>
          <TitleText>{props.title}</TitleText>
          <CloseButton
            onClick={() => {
              props.onClose?.();
            }}
          />
        </TitleSection>
        <Content>
          {props.content.length > 0
            ? props.content.map((user) => (
                <UserListItem
                  key={user.uid}
                  userObj={user}
                  viewerId={props.viewerId}
                  afterLink={() => {
                    props.onClose?.();
                  }}
                />
              ))
            : null}
        </Content>
      </MainContainer>
    </>
  );
};

export default ListModal;
