// see https://github.com/facebook/react/blob/b5ac963fb791d1298e7f396236383bc955f916c1/src/isomorphic/classic/element/ReactElement.js#L21-L25
const canUseSymbol = typeof Symbol === 'function' && Symbol.for;

const REACT_ELEMENT_TYPE = canUseSymbol ? Symbol.for('react.element') : 0xeac7;

function isReactElement(value: any) {
  return value.$$typeof === REACT_ELEMENT_TYPE;
}

function isBuffer(value: any) {
  return value instanceof Buffer;
}

function isSpecial(value: any) {
  const stringValue = Object.prototype.toString.call(value);

  return (
    stringValue === '[object RegExp]' ||
    stringValue === '[object Date]' ||
    isReactElement(value) ||
    isBuffer(value)
  );
}

function isNonNullObject(value: any) {
  return !!value && typeof value === 'object';
}

export function isMergeableObject(value: any) {
  return isNonNullObject(value) && !isSpecial(value);
}
