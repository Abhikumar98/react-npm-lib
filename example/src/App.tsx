import React, { VFC } from 'react';
import styled from 'styled-components';
import { startNewThread } from './reactComponentLib';

// import { createThread } from '@abhikumar_98/test3';

const StyledDiv = styled.div`
  padding: 10px;
  background-color: blue;
  color: white;
`;

export const App: VFC = () => {
  const reply = () => {
    console.log('here?');

    startNewThread({
      receiver: '0xad6561e9e306c923512b4ea7af902994bebd99b8',
      message: 'Something',
      subject: 'Another thing',
      chainId: '0x1',
    });
  };

  const fetchMessages = async () => {
    // const data = await getAllUserThreads('0xad6561e9e306c923512b4ea7af902994bebd99b8', '0x1');
    // const response = await getAllUserSentThreads('0xad6561e9e306c923512b4ea7af902994bebd99b8', '0x1');
    // console.log({ data, response });
  };

  const onboardingCheck = async () => {
    // const data = await onboardUser('0xad6561e9e306c923512b4ea7af902994bebd99b8', '0x4');
    // const response = await checkUserOnboarding('0x4');
    // console.log({ data, response });
  };

  return (
    <div>
      <StyledDiv>Example App styled component</StyledDiv>
      <button onClick={reply}>Click</button>
      <button onClick={fetchMessages}>Fetch</button>
      <button onClick={onboardingCheck}>onboard</button>
    </div>
  );
};
