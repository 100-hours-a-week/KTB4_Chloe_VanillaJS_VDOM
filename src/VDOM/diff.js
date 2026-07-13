import render from './render.js'

function diff(oldVnode,newVnode){
    //노드가 삭제된 경우
    if(!newVnode){
        return { 
            type: 'REMOVE' 
        };
    }

    //원래 없던 노드가 새로 생긴 경우
    if(!oldVnode){
        return {
            type : 'CREATE',
            newVNode
        }
    }

    //타입이 다른 경우 -> 태그가 아예 다른 경우
    if (oldVnode.type !== newVnode.type) {
        return { 
            type: 'REPLACE', 
            newVNode 
        };
    }

    //타입이 같은 경우 -> 태그가 변하지 않은 경우 (속성을 비교)

    //타입이 문자열이나 숫자인 경우
    if (typeof newVnode === 'string' || typeof newVnode === 'number') {
    
        //객체가 아니라서 그냥 값 비교! -> 내부 속성 비교
        if (oldVNode !== newVNode) {
            return { 
                type: 'TEXT', 
                newVNode 
            };
        }
            return null; // 값도 같으면 변경 없음
    }

    
    return {
        type: 'UPDATE',
        propsPatches: diffProps(oldVNode.props, newVNode.props),
        childrenPatches: diffChildren(oldVNode.children, newVNode.children)
    }



}

// 타입이 같은데 일반 요소 일때 (문자열이나 숫자가 아닐때)
// 내부의 속성을 제대로 비교해야한다.
function diffProps(oldProps,newProps){
  const toSet = {};
  const toRemove = [];

  for (const key in newProps) {
    //oldProps와 newProps가 다른게 있다면 새로 생기거나 변경되었다는 뜻
    if (oldProps[key] !== newProps[key]) {
      toSet[key] = newProps[key];
    }
  }

  for (const key in oldProps) {
    //oldProps에서 있는 값이 newProps에 없다면 삭제된 것 
    if (!(key in newProps)) {
      toRemove.push(key);
    }
  }

  return { toSet, toRemove };
}

function diffChildren(oldChildVnode,newChildVnode){
    const patches =[];

    // 1. oldChildren을 key 기준으로 빠르게 찾을 수 있게 Map 생성
    const oldMap = new Map();
    oldChildren.forEach((child, i) => {
        oldMap.set(child.props.key, { vnode: child, index: i });
    });

    // 2. newChildren을 순회하며 CREATE / UPDATE(+MOVE) 판단
    newChildren.forEach((newChild, newIndex) => {
        const old = oldMap.get(newChild.props.key);

        if (!old) {
        // old에 없던 key → 새로 생김
        patches.push({ type: 'CREATE', newVNode: newChild, toIndex: newIndex });
        } else {
        // old에 있던 key → 내용 비교(재귀 diff)
        const contentPatch = diff(old.vnode, newChild);
        const moved = old.index !== newIndex;

        patches.push({
            type: 'UPDATE',
            contentPatch,      // 내부 props/children 변경사항
            moved,             // 위치가 바뀌었는지
            fromIndex: old.index,
            toIndex: newIndex
        });

        oldMap.delete(newChild.props.key); // 매칭 완료 → 삭제 대상에서 제외
        }
    });

    // 3. oldMap에 남은 것 = new에 없는 것 = 삭제 대상
    oldMap.forEach(({ vnode, index }) => {
        patches.push({ type: 'REMOVE', fromIndex: index });
    });

    return patches;
}