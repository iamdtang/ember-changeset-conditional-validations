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
    return function (key, newValue, oldValue, changes, content) {
      let thisValue = {
        get(property) {
          if (property.includes('.')) {
            let changesValue = get(changes, property);
            if (typeof changesValue !== 'undefined') {
              return changesValue;
            }

            // Check if the `changes` value is explicitly undefined,
            // or if it's not present at all.
            let pathSegments = property.split('.');
            let propName = pathSegments.pop();
            let objPath = pathSegments.join('.');

            let obj = get(changes, objPath);
            if (obj && Object.prototype.hasOwnProperty.call(obj, propName)) {
              return changesValue;
            }

            return get(content, property);
          }

          if (Object.prototype.hasOwnProperty.call(changes, property)) {
            return get(changes, property);
          } else {
            return get(content, property);
          }
        },
      };

      if (condition.call(thisValue, changes, content)) {
        return validator(key, newValue, oldValue, changes, content);
      }
      return true;
    };
  }
}
