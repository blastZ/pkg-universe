function isMergeableObject(val: any) {
  const nonNullObject = val && typeof val === 'object';

  return (
    nonNullObject &&
    Object.prototype.toString.call(val) !== '[object RegExp]' &&
    Object.prototype.toString.call(val) !== '[object Date]'
  );
}

function emptyTarget(val: any) {
  return Array.isArray(val) ? [] : {};
}

function cloneIfNecessary(value: any, optionsArgument: OptionsArgument): any {
  const clone = optionsArgument && optionsArgument.clone === true;
  return clone && isMergeableObject(value)
    ? deepmerge(emptyTarget(value), value, optionsArgument)
    : value;
}

function defaultArrayMerge(
  target: any,
  source: any,
  optionsArgument: OptionsArgument,
) {
  const destination = target.slice();
  source.forEach((e: any, i: any) => {
    if (typeof destination[i] === 'undefined') {
      destination[i] = cloneIfNecessary(e, optionsArgument);
    } else if (isMergeableObject(e)) {
      destination[i] = deepmerge(target[i], e, optionsArgument);
    } else if (target.indexOf(e) === -1) {
      destination.push(cloneIfNecessary(e, optionsArgument));
    }
  });
  return destination;
}

function mergeObject(
  target: any,
  source: any,
  optionsArgument: OptionsArgument,
) {
  const destination: any = {};
  if (isMergeableObject(target)) {
    Object.keys(target).forEach((key) => {
      destination[key] = cloneIfNecessary(target[key], optionsArgument);
    });
  }
  Object.keys(source).forEach((key) => {
    if (!isMergeableObject(source[key]) || !target[key]) {
      destination[key] = cloneIfNecessary(source[key], optionsArgument);
    } else {
      destination[key] = deepmerge(target[key], source[key], optionsArgument);
    }
  });
  return destination;
}

export default function deepmerge(
  target: any,
  source: any,
  optionsArgument?: OptionsArgument,
) {
  const array = Array.isArray(source);
  const options = optionsArgument || { arrayMerge: defaultArrayMerge };
  const arrayMerge = options.arrayMerge || defaultArrayMerge;

  if (array) {
    return Array.isArray(target)
      ? arrayMerge(target, source, options)
      : cloneIfNecessary(source, options);
  }

  return mergeObject(target, source, options);
}

type OptionsArgument = {
  arrayMerge: Function;
  clone?: boolean;
};
