const React = {
  createElement(tag, attributes, ...childArgs) {
    const children = [].concat(...childArgs);
    const element = document.createElement(tag);
    Object.entries(attributes || {}).forEach(([name, value]) => {
      switch (name) {
        case 'className':
          element.className = value;
          break;
        case '__source':
        case '__self':
          // noop
          break;
        case 'onClick':
          element.onclick = value;
          break;
        default:
          if (typeof value === 'function') {
            element.addEventListener(name.replace(/^on/, ''), value);
          } else {
            element.setAttribute(name, value);
          }
          break;
      }
    });

    children
      .map(
        child =>
          child.nodeType ? child : document.createTextNode(child.toString())
      )
      .forEach(child => {
        element.appendChild(child);
      });

    return element;
  }
};

export default React;
