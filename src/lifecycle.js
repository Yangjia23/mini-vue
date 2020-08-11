import { patch } from "./vdom/patch"

export function lifecycleMixin (Vue) {
  Vue.prototype._update = function (vNode) {
    const vm = this
    patch(vm.$el, vNode)
  }
}

export function mountComponent (vm, el) {
  // 挂载就是需要调用之前的c
  vm._update(vm._render())
}