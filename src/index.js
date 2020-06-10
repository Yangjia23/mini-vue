import {initMixin} from './init.js'

function Vue(options) {
  // 内部初始化操作
  this._init(options) 
}

initMixin(Vue)

export default Vue