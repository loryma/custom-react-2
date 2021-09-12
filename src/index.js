function createElement(type, props, ...children) {
  return {
    type, 
    props: {
      ...props,
      children: children.map( child => typeof child === 'object' ? child : createTextElement(child)),
    }
  }
}

function createTextElement(element) {
  return {
    type: 'TEXT_ELEMENT',
    props: {
      nodeValue: element,
      children: [],
    },
  };
};

const isProperty = prop => prop !== 'children';

function render(element, container) {
  const dom = element.type === 'TEXT_ELEMENT' ? document.createTextNode("") : document.createElement(element.type);

  Object.keys(element.props)
    .filter(isProperty)
    .forEach(prop => dom[prop] = element.props[prop]);

  element.props.children.forEach(child => {
    render(child, dom)
  });

  container.appendChild(dom);
};


const CustomReact = {
  createElement,
  render,
};

/** @jsx CustomReact.createElement */
const element = (
  <h1 title='main title'>
    Hi
  </h1>
);

CustomReact.render(
  element,
  document.querySelector('#root'),
);

