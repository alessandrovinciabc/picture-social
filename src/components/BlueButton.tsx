import Button from './Button';
import styled from 'styled-components';

let BlueButton = styled(Button)`
  margin-right: 2px;
  border-color: #0074d9;
  background-color: #0074d9;
  color: white;

  &:hover {
    background-color: #0074d9;

    filter: saturate(50%) contrast(150%);
  }
`;

export default BlueButton;
