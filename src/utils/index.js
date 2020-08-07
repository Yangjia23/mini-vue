export function isObject (obj) {
  return (obj && typeof obj === 'object')
}

export function isArray (list) {
  return Array.isArray(list)
}

export function proxy (vm, target, key) {
  Object.defineProperty(vm, key, {
    get () {
      return vm[target][key]
    },
    set (newV) {
      vm[target][key] = newV
    }
  })
}