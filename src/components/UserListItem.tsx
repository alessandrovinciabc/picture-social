import firebase from 'firebase/app';

import styled from 'styled-components';

import userIconPlaceholder from '../assets/images/user-icon-placeholder.png';

import React from 'react';

import { useHistory } from 'react-router';

let UserContainer = styled.div`
  display: flex;
  padding: 0.5rem 0;
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

const UserListItem: React.FC<{
  userObj: firebase.firestore.DocumentData;
  viewerId: string;
  afterLink: Function;
}> = (props) => {
  let { userObj } = props;

  let history = useHistory();

  return (
    <UserContainer>
      <ProfileSection
        onClick={() => {
          props.afterLink();
          history.push(`/${userObj!.uid}`);
        }}
      >
        <UserIcon src={userObj ? userObj.photoURL : userIconPlaceholder} />
        <ProfileName>{userObj ? userObj.displayName : null}</ProfileName>
      </ProfileSection>
    </UserContainer>
  );
};

export default UserListItem;
