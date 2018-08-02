import { typeOf } from '@ember/utils';

export default function isFunction(fn) {
  return typeOf(fn) === 'function';
}
