import {isObject, isArray} from '../utils/index'
import {arrayMethods} from './array'

class Observer{
  constructor (data) {
    // 标识
    Object.defineProperty(data, '__ob__', {
      enumerable: false,
      configurable: false,
      value: this
    })

    // 相对于对对象中每个属性做监测，很少会对数组中的每一项做监测
    // ps: 1、数组可能很大，2、很少通过数组下标修改值 arr[10] = xxx 
    // 所以数组和对象的监测需要区分开
    if (isArray(data)) {
      // vue 对数组的监测，采用的是 函数劫持
      // 对能够修改原数组的方法，进行重写
      data.__proto__ = arrayMethods;
      // 如果是个对象数组，需要对数组中每个对象进行监测
      this.observerArray(data)
    } else {
      this.walk(data) // 对数据一步一步处理
    }
  }
  observerArray(data) {
    for (let i = 0; i < data.length; i++) {
      observer(data[i])
    }
  }
  walk (data) {
    Object.keys(data).forEach(key => {
      defineReactive(data, key, data[key])
    })
  }
}

function defineReactive(target, key, value) {
  observer(value) // 如果 value 是个对象，就需要做递归循环检测
  Object.defineProperty(target, key, {
    get () {
      return value
    },
    set (newValue) {
      if (newValue === value) return
      observer(newValue) //如果 newValue 是个对象，也需要做递归循环检测
      value = newValue
    }
  })
}

export function observer(data) {
  // vue 2 中，通过 defineProperty 来实现响应式原理
  if (!isObject(data)) {
    return
  }
  if(data.__ob__ instanceof Observer){ // 防止对象被重复观测
    return ;
  }
  return new Observer(data)
}