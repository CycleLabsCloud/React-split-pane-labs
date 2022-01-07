import React from 'react';
import {SplitPane} from '../src/SplitPane';
import ReactDOM from 'react-dom';

function MyComponent() {
  // example split pane usage here
  return <SplitPane split="horizontal" minSize={50}>
    <div>default min: 50px</div>
    <div />
  </SplitPane>
}

ReactDOM.render(
        <MyComponent />,
        document.getElementById('root'),
    );