export function renderMixin (Vue) {

  // DOM节点
  Vue.prototype._c = function () {
    return createElement(...arguments)
  }
  // Text节点
  Vue.prototype._v = function (text) {
    return createTextElement(text)
  }
  // 变量
  Vue.prototype._s = function (val) {
    return val == null ? '' : (typeof val == 'object') ? JSON.stringify(val) : val;
  }

  Vue.prototype._render = function () {
    // 调用真实的 render 方法，
    const vm = this
    const render = vm.$options.render
    const vNode = render.call(vm) // 确保this正确
    return vNode
  }
}

function createElement (tag, data = {}, ...children) {
  return createVNode(tag, data, data.key, children)
}
function createTextElement (text) {
  return createVNode(undefined,undefined,undefined,undefined,text);
}
function createVNode (tag,data,key,children,text) {
  return {
    tag,
    data,
    key,
    children,
    text
  }
}