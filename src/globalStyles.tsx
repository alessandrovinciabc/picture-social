import { createGlobalStyle } from 'styled-components';

let GlobalStyle = createGlobalStyle`
*, *::before, *::after {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
}

body{
    font-size: 16px;
    font-family: 'Courier New', 'monospace';
}
`;

export default GlobalStyle;
