import {initMixin} from './init.js'
import { renderMixin } from './vdom/index.js'
import { lifecycleMixin } from './lifecycle.js'

function Vue(options) {
  // 内部初始化操作
  this._init(options) 
}

initMixin(Vue) // 
lifecycleMixin(Vue) // 生命周期混合
renderMixin(Vue) // 方法混合

export default Vue