let oldArrayMethods = Array.prototype

export let arrayMethods = Object.create(oldArrayMethods)

// 能够修改数组的方法, 进行重写拦截
const methods = [
  'push',
  'pop',
  'shift',
  'unshift',
  'sort',
  'reverse',
  'splice'
]

methods.forEach(method => {
  arrayMethods[method] = function (...args) {
    const ob = this.__ob__
    // 执行数组方法默认的逻辑
    const result = oldArrayMethods[method].apply(this, args)
    // 对于 push, unshift, splice 会往数组中添加新的元素，
    // 如果新的元素是个对象，也需要对这个对象进行监测
    let inserted
    switch (method) {
      case 'push':
      case 'unshift':
        inserted = args
        break;
      case 'splice':
        inserted = args.slice(2)
        break;
    }
    inserted && ob.observerArray(inserted)
    return result
  }
})