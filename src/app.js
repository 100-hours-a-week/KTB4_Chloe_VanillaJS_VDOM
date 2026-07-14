import createElement from './VDOM/createElement.js';
import mount from './VDOM/mount.js';
import diff from './VDOM/diff.js';
import patch from './VDOM/patch.js';

// 재렌더링 시마다 바뀔 state
let count = 0;

// VNode 트리를 "찍어내는 함수"로 분리
// → count가 바뀔 때마다 이 함수를 다시 호출해서 새 VNode를 얻음
function createApp() {
  return createElement('div', { className: 'container' },
    createElement('h1', null, `Hello VDOM (count: ${count})`), // count로 텍스트 변경 확인
    createElement('ul', null,
      // count만큼 li를 동적으로 생성 → key 기반 리스트 diffing 확인용
      ...Array.from({ length: count + 2 }, (_, i) =>
        createElement('li', { key: `item-${i}` }, `item ${i}`)
      )
    ),
    createElement('button', {
      onClick: () => {
        count++;           // state 변경
        rerender();         // 다시 그리기 트리거
      }
    }, 'Click me')
  );
}

// 최초 마운트 (1회만)
const root = document.getElementById('root');
mount(root,createApp()); // container,vnode 순

//console.log(root._domNode.outerHTML);    // 실제 DOM 노드가 찍혀야 함
//console.log(root._prevVnode);  // Vnode 객체가 찍혀야 함 (오타 수정)

// state 변경 이후 호출되는 재렌더링 함수
function rerender() {
  const newVnode = createApp(); // 1. 새 VNode 생성
  const patches = diff(root._prevVnode, newVnode); // 2. 이전 VNode와 비교
                     

  console.log('이전 VNode:', root._prevVnode);  // diff에 들어가기 직전의 old
  console.log('새 VNode:', newVnode);            // diff에 들어가는 new

  
  patch(root._domNode, patches);                        // 3. 실제 DOM에 변경분만 반영
  root._prevVnode = newVnode;                           // 4. 다음 비교를 위해 기준 갱신
}

const before = document.querySelectorAll('li')[0];
const button = document.querySelector('button');

button.click(); // 코드로 클릭 시뮬레이션
button.click();
button.click();

const after = document.querySelectorAll('li')[0];
console.log('같은 노드인가?', before === after);