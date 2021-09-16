import CustomReact from './CustomReact';

/** @jsx CustomReact.createElement */
function Item({ text }) {
  return (
    <li>{ text }</li>
  );
};

export default Item;