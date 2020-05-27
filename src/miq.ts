// Check https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol/species


const array = [];

export function $(arg, doc?) {
  doc = doc || document;

  const elements = doc.querySelectorAll(arg);

  console.log('elements', elements);

  return new Proxy(elements, proxyHandler);
}

const proxyHandler = {
  get(target, prop) {
    console.log('>> get', target, prop);
    console.log('typeof prop', typeof prop);

    if (prop == Symbol.iterator) {
      return function* () {
        for (let i = 0; i < target.length; i++) {
          yield target[i];
        }
      }
    }

    if (Array.prototype.hasOwnProperty(prop)) {
      const propValue = Reflect.get(array, prop);
      console.log('Array function', propValue);
      if (typeof propValue == 'function') {
        return new Proxy(propValue, proxyHandler);
      }
    }
    // then return Proxy(prop)

    if (prop == 'length') {
      console.log('length', target.length);
      return target.length;
    }

    if (prop == 'name') {
      return Reflect.get(target, 'name');
    }

    if (!isNaN(Number(prop))) {
      console.log(`prop ${prop} is number`);
      return Reflect.get(target, prop);
    }

    if (target.length > 0) {
      const propValue = Reflect.get(target[0], prop);
      console.log('**** propValue', propValue);

      if (typeof propValue == 'function') {
        return new Proxy(propValue, proxyHandler);
      } else {
        return propValue;
      }
    }

    console.log('last else');
    return Reflect.get(target, prop);
  },

  set(target, prop, value) {
    console.log('>> set', target, prop, value);
    for (const el of target) {
      Reflect.set(el, prop, value);
    }
    return true;
  },

  apply: function (target, thisArg, argumentsList) {
    console.log('>> apply', target, thisArg, argumentsList);
    console.log('Array method', typeof target.name == 'string' && Array.prototype.hasOwnProperty(target.name));
    if (typeof target.name == 'string' && Array.prototype.hasOwnProperty(target.name)) {
      // if (false) {
      console.log('array', target, thisArg, argumentsList);
      const ret = Reflect.apply(target, thisArg, argumentsList);
      const newTarget = typeof ret != 'undefined' ? ret : thisArg
      return new Proxy(newTarget, proxyHandler);
    } else {
      console.log('elements', target, thisArg, argumentsList);
      for (const el of thisArg) {
        Reflect.apply(target, el, argumentsList);
      }
      return thisArg;
    }
  },
};

