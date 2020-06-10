(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
  typeof define === 'function' && define.amd ? define(factory) :
  (global = global || self, global.Vue = factory());
}(this, (function () { 'use strict';

  function _typeof(obj) {
    "@babel/helpers - typeof";

    if (typeof Symbol === "function" && typeof Symbol.iterator === "symbol") {
      _typeof = function (obj) {
        return typeof obj;
      };
    } else {
      _typeof = function (obj) {
        return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
      };
    }

    return _typeof(obj);
  }

  function _classCallCheck(instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  }

  function _defineProperties(target, props) {
    for (var i = 0; i < props.length; i++) {
      var descriptor = props[i];
      descriptor.enumerable = descriptor.enumerable || false;
      descriptor.configurable = true;
      if ("value" in descriptor) descriptor.writable = true;
      Object.defineProperty(target, descriptor.key, descriptor);
    }
  }

  function _createClass(Constructor, protoProps, staticProps) {
    if (protoProps) _defineProperties(Constructor.prototype, protoProps);
    if (staticProps) _defineProperties(Constructor, staticProps);
    return Constructor;
  }

  function isObject(obj) {
    return obj && _typeof(obj) === 'object';
  }
  function isArray(list) {
    return Array.isArray(list);
  }

  var oldArrayMethods = Array.prototype;
  var arrayMethods = Object.create(oldArrayMethods); // 能够修改数组的方法, 进行重写拦截

  var methods = ['push', 'pop', 'shift', 'unshift', 'sort', 'reverse', 'splice'];
  methods.forEach(function (method) {
    arrayMethods[method] = function () {
      var ob = this.__ob__; // 执行数组方法默认的逻辑

      for (var _len = arguments.length, args = new Array(_len), _key = 0; _key < _len; _key++) {
        args[_key] = arguments[_key];
      }

      var result = oldArrayMethods[method].apply(this, args); // 对于 push, unshift, splice 会往数组中添加新的元素，
      // 如果新的元素是个对象，也需要对这个对象进行监测

      var inserted;

      switch (method) {
        case 'push':
        case 'unshift':
          inserted = args;
          break;

        case 'splice':
          inserted = args.slice(2);
          break;
      }

      inserted && ob.observerArray(inserted);
      return result;
    };
  });

  var Observer = /*#__PURE__*/function () {
    function Observer(data) {
      _classCallCheck(this, Observer);

      // 标识
      Object.defineProperty(data, '__ob__', {
        enumerable: false,
        configurable: false,
        value: this
      }); // 相对于对对象中每个属性做监测，很少会对数组中的每一项做监测
      // ps: 1、数组可能很大，2、很少通过数组下标修改值 arr[10] = xxx 
      // 所以数组和对象的监测需要区分开

      if (isArray(data)) {
        // vue 对数组的监测，采用的是 函数劫持
        // 对能够修改原数组的方法，进行重写
        data.__proto__ = arrayMethods; // 如果是个对象数组，需要对数组中每个对象进行监测

        this.observerArray(data);
      } else {
        this.walk(data); // 对数据一步一步处理
      }
    }

    _createClass(Observer, [{
      key: "observerArray",
      value: function observerArray(data) {
        for (var i = 0; i < data.length; i++) {
          observer(data[i]);
        }
      }
    }, {
      key: "walk",
      value: function walk(data) {
        Object.keys(data).forEach(function (key) {
          defineReactive(data, key, data[key]);
        });
      }
    }]);

    return Observer;
  }();

  function defineReactive(target, key, value) {
    observer(value); // 如果 value 是个对象，就需要做递归循环检测

    Object.defineProperty(target, key, {
      get: function get() {
        return value;
      },
      set: function set(newValue) {
        if (newValue === value) return;
        observer(newValue); //如果 newValue 是个对象，也需要做递归循环检测

        value = newValue;
      }
    });
  }

  function observer(data) {
    // vue 2 中，通过 defineProperty 来实现响应式原理
    if (!isObject(data)) {
      return;
    }

    if (data.__ob__ instanceof Observer) {
      // 防止对象被重复观测
      return;
    }

    return new Observer(data);
  }

  function initState(vm) {
    var opts = vm.$options;

    if (opts.props) ;

    if (opts.data) {
      initData(vm);
    }
  }

  function initData(vm) {
    // 获取到用户传入的data 参数
    // data 可以是对象，也可以是个函数，若是函数，获取函数返回值
    var data = vm.$options.data; // 实例 vm 通过 $data 就可以访问检测后的数据

    data = vm.$data = typeof data === 'function' ? data.call(vm) : data; // 观测数据

    observer(data);
  }

  function initMixin(Vue) {
    Vue.prototype._init = function (options) {
      var vm = this;
      vm.$options = options; // 用户传入的参数

      initState(vm); // 初始化状态
    };
  }

  function Vue(options) {
    // 内部初始化操作
    this._init(options);
  }

  initMixin(Vue);

  return Vue;

})));
//# sourceMappingURL=vue.js.map
