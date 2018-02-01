import { get } from '@ember/object';

export default function validateSometimes(validators, condition) {
  return validators.map(function(validator) {
    return function(key, newValue, oldValue, changes, content) {
      let thisValue = {
        get(property) {
          return get(changes, property) || get(content, property);
        }
      };

      if (condition.call(thisValue, changes, content)) {
        return validator(key, newValue, oldValue, changes, content);
      }
      return true;
    };
  });
}
