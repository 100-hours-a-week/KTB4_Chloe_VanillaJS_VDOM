import createElement from './vdom/createElement.js';
import mount from './vdom/mount.js';

const vdom = createElement('div', { className: 'container' },
  createElement('h1', null, 'Hello VDOM'),
  createElement('ul', null,
    createElement('li', null, 'item 1'),
    createElement('li', null, 'item 2')
  ),
  createElement('button', { onClick: () => alert('clicked!') }, 'Click me')
);

const root = document.getElementById('root');
mount(root,vdom);
console.log(root.domNode)
console.log(root.preVnode)