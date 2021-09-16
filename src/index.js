import CustomReact from './CustomReact';
import App from './App';

CustomReact.render(
/** @jsx CustomReact.createElement */
  <App title="Todo list" />,
  document.querySelector('#root'),
);

