import {initState} from './state.js'
import { compileToFunctions } from './compiler/index.js'
import { mountComponent } from './lifecycle.js'

export function initMixin(Vue) {
  Vue.prototype._init = function (options) {
    const vm = this
    vm.$options = options // 用户传入的参数
    initState(vm) // 初始化状态

    if (vm.$options.el) {
      vm.$mount(vm.$options.el)
    }
  }

  Vue.prototype.$mount = function (el) {
    const vm = this
    const options = vm.$options
    // - 1 获取真实 dom, 并挂载到 vm 上
    el = document.querySelector(el)
    vm.$el = el
    
    // -2 当不存在 render 函数时，就叫进行模版编译，
    // 判断 template 属性是否存在，不存在就获取 el 对于的Dom 元素的 outerHTML 作为模块进行编译

    if (!options.render) {
      let template = options.template
      if (!template && el) {
        template = el.outerHTML
      }
      // 编译原理，将 template 转换成 render 函数
      const render = compileToFunctions(template)

      // 最终调用的都是 render 方法
      options.render = render
    }

    // 挂载组件
    mountComponent(vm, el)

  }
}