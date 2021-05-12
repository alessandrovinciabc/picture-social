import styled from 'styled-components';

let Button = styled.button`
  display: block;
  padding: 0.5rem 1rem;

  background-color: white;
  border: 2px solid black;
  border-radius: 2px;

  &:hover {
    background-color: black;
    color: white;

    cursor: pointer;
  }
`;

export default Button;
