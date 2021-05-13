import { FormEventHandler } from 'react';

import styled from 'styled-components';
import Button from '../Button';

let PostForm = styled.form`
  width: 350px;
  margin: 1rem auto;

  display: flex;
  flex-direction: column;
  align-items: center;

  border: 1px solid rgba(0, 0, 0, 0.2);
  border-radius: 5px;
  padding: 1rem;
`;

let PostTextInput = styled.textarea`
  resize: none;
  height: 48px;
  width: 293px;

  margin-top: 5px;
`;

let ButtonContainer = styled.div`
  display: flex;
  margin-top: 5px;
`;

let ConfirmPost = styled(Button)`
  margin-right: 2px;
  border-color: #0074d9;
  background-color: #0074d9;
  color: white;

  &:hover {
    background-color: #0074d9;

    filter: saturate(50%) contrast(150%);
  }
`;

let CancelPost = styled(Button)`
  margin-left: 2px;
  border: none;

  &:hover {
    background-color: white;
    color: black;
  }
`;

const PostAddForm: React.FC<{
  submitHandler: FormEventHandler<HTMLFormElement>;
}> = ({ submitHandler }) => {
  return (
    <PostForm onSubmit={submitHandler}>
      <input type="file" name="file" required />
      <PostTextInput
        placeholder="Type something here... (optional)"
        autoComplete="off"
        name="text"
        maxLength={280}
      />
      <ButtonContainer>
        <ConfirmPost type="submit">Send</ConfirmPost>
        <CancelPost type="reset">Reset</CancelPost>
      </ButtonContainer>
    </PostForm>
  );
};

export default PostAddForm;
