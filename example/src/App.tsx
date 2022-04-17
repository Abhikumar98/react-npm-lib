import React, { VFC } from 'react';
import styled from 'styled-components';

import { threadReply } from './reactComponentLib';

const StyledDiv = styled.div`
  padding: 10px;
  background-color: blue;
  color: white;
`;

export const App: VFC = () => {
  const reply = () => {
    // threadReply();
  };

  return (
    <div>
      <StyledDiv>Example App styled component</StyledDiv>
    </div>
  );
};
