import React, { VFC } from 'react';
import styled from 'styled-components';

import { startNewThread, getAllUserThreads, getAllUserSentThreads } from './reactComponentLib';

const StyledDiv = styled.div`
  padding: 10px;
  background-color: blue;
  color: white;
`;

export const App: VFC = () => {
  const reply = () => {
    startNewThread('0xAD6561E9e306C923512B4ea7af902994BEbd99B8', 'Something', 'Another thing', '0x4');
  };

  const fetchMessages = async () => {
    const data = await getAllUserThreads('0xad6561e9e306c923512b4ea7af902994bebd99b8', '0x1');
    const response = await getAllUserSentThreads('0xad6561e9e306c923512b4ea7af902994bebd99b8', '0x1');
    console.log({ data, response });
  };

  return (
    <div>
      <StyledDiv>Example App styled component</StyledDiv>
      <button onClick={reply}>Click</button>
      <button onClick={fetchMessages}>Fetch</button>
      <button onClick={fetchMessages}>Fetch sent</button>
    </div>
  );
};
