function patch(domNode,patchObj){

    if (!patchObj) return; // 변경 없으면 스킵

    switch(patchObj.type){
        // 기존 노드 삭제
        case 'REMOVE':
            domNode.remove();
            break;
        //타입이 달라서 기존 노드를 새 노드로 완전 교체
        case 'REPLACE':
            domNode.replaceWith(render(patchObj.newVNode));
            break;
        //TEXT라서 값만 변경 (얘는 무조건 말단 노드)
        case 'TEXT':
            domNode.textContent = patchObj.newVNode;
            break;
        case 'UPDATE':
            patchProps(domNode, patchObj.propsPatches);     // toSet/toRemove 반영
            patchChildren(domNode, patchObj.childrenPatches); // 자식들 각각 재귀 patch
            break;
    }
        

}

function patchProps(domNode, { toSet, toRemove }) {
  for (const key in toSet) {
    if (key.startsWith('on')) {

      const eventName = key.slice(2).toLowerCase();

      // 예전 핸들러 제거 후 새 핸들러 등록
      if (domNode._listeners && domNode._listeners[eventName]) {
        domNode.removeEventListener(eventName, domNode._listeners[eventName]);
      }
      domNode.addEventListener(eventName, toSet[key]);

      // 다음 patch 때 "예전 핸들러가 뭐였는지" 알아야 지울 수 있으므로 저장해둠
      domNode._listeners = domNode._listeners || {};
      domNode._listeners[eventName] = toSet[key];

    } else {
      domNode.setAttribute(key, toSet[key]);
    }
  }
  for (const key of toRemove) {
    //이벤트 처리
    if (key.startsWith('on')) {
        const eventName = key.slice(2).toLowerCase();
        
        if (domNode._listeners && domNode._listeners[eventName]) {
            domNode.removeEventListener(eventName, domNode._listeners[eventName]);
            delete domNode._listeners[eventName];
    }
    } else {
        domNode.removeAttribute(key);
    }
  }
}

function patchChildren(parentDomNode, childrenPatches) {
  // 여기서 parentDomNode는 patch()가 이미 갖고 있던 domNode를 그대로 전달받은 것
  childrenPatches.forEach(childPatch => {
    if (childPatch.type === 'CREATE') {
      parentDomNode.appendChild(render(childPatch.newVNode)); // 여기서 씀
    } else {
      
      const targetDom = parentDomNode.childNodes[childPatch.fromIndex];
      patch(targetDom, childPatch); // REMOVE/UPDATE/TEXT는 기존 자식 대상
    }
  });
}
