export function patch (oldVNode, newVNode) {
  let newEl = createEl(newVNode)
  let parentEl = oldVNode.parentNode
  parentEl.insertBefore(newEl, oldVNode.nextSibling)
  parentEl.removeChild(oldVNode)
}

function createEl (vNode) {
  let {tag,key,children,text} = vNode
  if (tag && typeof tag === 'string') {
    vNode.el = document.createElement(tag)
    updateElProperties(vNode)
    children.forEach(child => {
      vNode.el.appendChild(createEl(child))
    })
  } else {
    vNode.el = document.createTextNode(text)
  }
  return vNode.el
}

function updateElProperties (vNode) {
  const {el, data = {}} = vNode
  for (const key in data) {
    if (data.hasOwnProperty(key)) {
      if (key === 'style') {
        const styleObj = data.style
        for (const v in styleObj) {
          el.style[v.trim()] = styleObj[v]
        }
      } else if (key === 'class'){
        el.className = data.class
      } else {
        el.setAttribute(key, data[key])
      }
    }
  }
}