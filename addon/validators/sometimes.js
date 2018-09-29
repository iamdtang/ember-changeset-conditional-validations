import { get } from '@ember/object';

export default function validateSometimes(validator, condition) {
  if (Array.isArray(arguments[0])) {
    let validators = arguments[0];
    return validators.map(guardValidatorWithCondition);
  } else {
    let validator = arguments[0];
    return guardValidatorWithCondition(validator);
  }

  function guardValidatorWithCondition(validator) {
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
}
