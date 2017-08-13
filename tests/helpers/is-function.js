import Ember from 'ember';

const { typeOf } = Ember;

export default function isFunction(fn) {
  return typeOf(fn) === 'function';
}
