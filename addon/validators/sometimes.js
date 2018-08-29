import { get } from '@ember/object';

export default function validateSometimes(validator, condition) {
  return Array.isArray(validator) ? validator.map(mapValidator) : mapValidator(validator)
}

function mapValidator(validator) {
  return function(key, newValue, oldValue, changes, content) {
    let thisValue = {
      get(property) {
        return get(changes, property) != null
          ? get(changes, property)
          : get(content, property);
      }
    };

    if (condition.call(thisValue, changes, content)) {
      return validator(key, newValue, oldValue, changes, content);
    }
    return true;
  };
}
