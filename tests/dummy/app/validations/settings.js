import Ember from 'ember';
import { validatePresence, validateLength } from 'ember-changeset-validations/validators';
import validateSometimes from 'ember-changeset-conditional-validations/validators/sometimes';

const { get } = Ember;

export default {
  paymentMethod: validatePresence(true),
  creditCardNumber: validateSometimes([
    validatePresence(true),
    validateLength({ is: 16 })
  ], function(changes, content) {
    return this.get('paymentMethod') === 'credit-card';
  })
};
