export default function validateSometimes(validators, condition) {
  return validators.map(function(validator) {
    return function(key, newValue, oldValue, changes, content) {
      if (condition(changes, content)) {
        return validator(key, newValue, oldValue, changes, content);
      }
      return true;
    };
  });
}
