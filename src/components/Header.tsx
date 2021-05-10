import firebase from 'firebase/app';
import React from 'react';

import styled, { AnyStyledComponent } from 'styled-components';

import { IconHome, IconCompass } from '@tabler/icons';
import { useHistory } from 'react-router-dom';

let HeaderContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;

  border-bottom: 1px solid rgba(0, 0, 0, 0.2);

  height: 3.5rem;
`;

let ProfileIcon: AnyStyledComponent = styled.img.attrs((props: any) => ({
  src: props.icon,
}))`
  background-size: cover;
  border-radius: 100%;
  height: 30px;
  width: 30px;

  margin-right: 0.6rem;

  cursor: pointer;
`;

let LoginContainer = styled.div`
  display: flex;
  justify-content: space-between;
  align-items: center;

  margin-left: 0.6rem;
`;

let LogButton = styled.button`
  background: none;
  border: 1.5px solid black;
  border-radius: 2px;

  padding: 0.1rem;

  &:hover {
    background-color: black;
    color: white;

    cursor: pointer;
  }
`;

function applyStyles(component: AnyStyledComponent | React.ComponentType<any>) {
  return styled(component)`
    stroke: black;
    stroke-width: 1;
    width: 35px;
    height: 35px;
    margin: 0.6rem;

    cursor: pointer;
  `;
}

let HomeIcon = applyStyles(IconHome);
let CompassIcon = applyStyles(IconCompass);

const Header: React.FC<{
  handlers: {
    login: React.MouseEventHandler<HTMLButtonElement>;
    logout: React.MouseEventHandler<HTMLButtonElement>;
  };
  user: firebase.User | null;
  logged: boolean;
}> = (props) => {
  let history = useHistory();
  let { user, handlers, logged } = props;

  function goto(str: string) {
    history.push(str);
  }
  return (
    <HeaderContainer>
      <HomeIcon
        onClick={() => {
          goto('/');
        }}
      />
      <CompassIcon
        onClick={() => {
          goto('/explore');
        }}
      />
      <LoginContainer>
        {user ? (
          <ProfileIcon
            icon={user.photoURL!}
            referrerPolicy="no-referrer"
            onClick={() => {
              goto(`/${user!.uid}`);
            }}
          />
        ) : (
          false
        )}
        {logged && <LogButton onClick={handlers.logout}>Logout</LogButton>}
        {!logged && <LogButton onClick={handlers.login}>Login</LogButton>}
      </LoginContainer>
    </HeaderContainer>
  );
};

export default Header;
