import { validatePresence, validateLength } from 'ember-changeset-validations/validators';
import validateSometimes from 'ember-changeset-conditional-validations/validators/sometimes';

export default {
  paymentMethod: validatePresence(true),
  creditCardNumber: validateSometimes([
    validatePresence(true),
    validateLength({ is: 16 })
  ], function() {
    return this.get('paymentMethod') === 'credit-card';
  })
};
