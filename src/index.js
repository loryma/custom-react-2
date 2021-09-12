let nextUnitOfWork = null;
let workInProgressRoot = null;

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

function createDom(element) {
  const dom = element.type === 'TEXT_ELEMENT' ? document.createTextNode("") : document.createElement(element.type);

  Object.keys(element.props)
    .filter(isProperty)
    .forEach(prop => dom[prop] = element.props[prop]);

  return dom;
}

function commitRoot() {
  commitWork(workInProgressRoot.child);
}

function commitWork(fiber) {
  if (!fiber) return;
  if (fiber.parent?.dom) {
    fiber.parent.dom.appendChild(fiber.dom);
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

function render(element, container) {

  workInProgressRoot = {
    dom: container,
    props: {
      children: [element],
    }
  }

  nextUnitOfWork = workInProgressRoot;
};

function workLoop(deadline) {
  let shouldYield = false;

  while (nextUnitOfWork && !shouldYield) {
    nextUnitOfWork = performUnitOfWork(nextUnitOfWork);

    if (deadline.timeRemaining() < 1) shouldYield = true;
  }

  requestIdleCallback(workLoop);

  if (workInProgressRoot && !nextUnitOfWork) commitRoot();
}

requestIdleCallback(workLoop);

function performUnitOfWork(fiber) {
  if (!fiber.dom) {
    fiber.dom = createDom(fiber);
  }

  let prevSibling = null;

  fiber.props.children.forEach((child, index) => {
    const newFiber = {
      type: child.type,
      props: child.props,
      parent: fiber,
      dom: null,
    };

    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;
  });

  if (fiber.child) {
    return fiber.child;
  }

  let nextFiber = fiber;

  while (nextFiber) {
    if (fiber.sibling) return fiber.sibling;

    nextFiber = nextFiber.parent;
  }
}


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

