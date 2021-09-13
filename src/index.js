let nextUnitOfWork = null;
let workInProgressRoot = null;
let previousRoot = null;
let deletions = [];

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

function createDom(element) {
  const dom = element.type === 'TEXT_ELEMENT' ? document.createTextNode("") : document.createElement(element.type);

  updateDom(dom, {}, element.props);

  return dom;
}

function commitRoot() {
  deletions.forEach(commitWork);
  commitWork(workInProgressRoot.child);
  previousRoot = workInProgressRoot;
  workInProgressRoot = null;
  deletions = [];

}

function commitWork(fiber) {
  if (!fiber) return;
  if (fiber.parent?.dom) {
    const domParent = fiber.parent.dom;
    if (fiber.dom && fiber.effectTag === 'ADD') {
      domParent.appendChild(fiber.dom);
    }

    if (fiber.effectTag === 'DELETE') {
      domParent.removeChild(fiber.dom);
    }

    if (fiber.effectTag === 'UPDATE') {
      updateDom(fiber.dom, fiber.previous.props, fiber.props);
    }
  }

  commitWork(fiber.child);
  commitWork(fiber.sibling);
}

const isProperty = prop => prop !== 'children' && !prop.startsWith('on');
const isEvent = prop => prop.startsWith('on');
const isRemovedProp = (next) => key => !(key in next);
const isNewProp = (prev, next) => key => !(key in prev) || prev[key] !== next[key];

function updateDom(dom, prevProps, currentProps) {
  Object.keys(currentProps)
    .filter(isProperty)
    .filter(isNewProp(prevProps, currentProps))
    .forEach(key => {
      dom[key] = currentProps[key];
    });

  Object.keys(prevProps)
    .filter(isProperty)
    .filter(isRemovedProp(currentProps))
    .forEach(key => {
      dom[key] = '';
    });

  //removed deleted or updated event listeners
  Object.keys(prevProps)
    .filter(isEvent)
    .filter(isNewProp(prevProps, currentProps))
    .forEach(event => {
      const eventType = event.substring(2);
      document.removeEventListener(eventType, prevProps[event]);
    });

  //add new or updated event listeners
  Object.keys(currentProps)
    .filter(isEvent)
    .filter(isNewProp(prevProps, currentProps))
    .forEach(event => {
      const eventType = event.substring(2);
      document.addEventListener(eventType, currentProps[event]);
    });
}

function render(element, container) {

  workInProgressRoot = {
    dom: container,
    props: {
      children: [element],
    },
    previous: previousRoot,
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

  const elements = fiber.props.children;

  reconcileElements(fiber, elements);  

  if (fiber.child) {
    return fiber.child;
  }

  let nextFiber = fiber;

  while (nextFiber) {
    if (fiber.sibling) return fiber.sibling;

    nextFiber = nextFiber.parent;
  }
}

function reconcileElements(fiber, elements) {

  let prevSibling = null;

  elements.forEach((child, index) => {

    //reconcile with old fiber 
    let oldFiber;

    if (index === 0) {
      oldFiber = fiber.previous?.child;
    } else {
      oldFiber = prevSibling.previous.sibling;
    }
    const sameType = oldFiber && child && oldFiber.type === child.type;

    if (sameType) {
      newFiber = {
        type: child.type,
        props: child.props,
        parent: fiber,
        dom: oldFiber.dom,
        previous: oldFiber,
        effectTag: 'UPDATE',
      }
    }

    if (child && !sameType) {
      newFiber = {
        type: child.type,
        props: child.props,
        parent: fiber,
        dom: null,
        previous: oldFiber,
        effectTag: 'ADD',
      }
    }

    if (oldFiber && !sameType) {
      oldFiber.effectTag = 'DELETE';
      deletions.push(oldFiber);
    }

    if (index === 0) {
      fiber.child = newFiber;
    } else {
      prevSibling.sibling = newFiber;
    }

    prevSibling = newFiber;

  });
}


const CustomReact = {
  createElement,
  render,
};

/** @jsx CustomReact.createElement */
const element = (
  <h1 title='main title' onClick={() => alert("I was clicked")}>
    Hi
  </h1>
);

CustomReact.render(
  element,
  document.querySelector('#root'),
);

