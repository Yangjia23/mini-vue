import {observer} from './observer/index'
import { proxy } from './utils'

export function initState(vm) {
  const opts = vm.$options 

  if (opts.props) {
    initProps(vm)
  }
  if (opts.data) {
    initData(vm)
  }
}

function initProps() {}

function initData(vm) {
  // 获取到用户传入的data 参数
  // data 可以是对象，也可以是个函数，若是函数，获取函数返回值

  let data = vm.$options.data
  // 实例 vm 通过 $data 就可以访问检测后的数据
  vm.$data = data = typeof data === 'function' ? data.call(vm) : data

  // 数据代理
  for(let key in data){
    proxy(vm,'_data',key);
  }
  // 观测数据
  observer(data)
}