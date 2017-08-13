/* eslint no-console: "off" */
import Ember from 'ember';
import Changeset from 'ember-changeset';
import lookupValidator from 'ember-changeset-validations';
import { validatePresence, validateNumber } from 'ember-changeset-validations/validators';
import validateSometimes from 'ember-changeset-conditional-validations/validators/sometimes';

const { get } = Ember;

const Validations = {
  creditCardNumber: validateSometimes([
    validatePresence(true),
    validateNumber({ is: 16 })
  ], function(changes) {
    return get(changes, 'paymentMethod.isCreditCard')
  })
};

export default Ember.Route.extend({
  model() {
    let settings = {};
    let changeset = new Changeset(settings, lookupValidator(Validations), Validations);

    console.log(changeset.get('isValid')); // true
    changeset.set('paymentMethod', {
      isCreditCard: true
    });
    changeset.validate();
    console.log(changeset.get('isValid')); // false
    console.log(changeset.get('errors')); // [{key: 'creditCardNumber', validation: ['Credit card number can't be blank', 'Credit card number must be a number']}]
    changeset.set('creditCardNumber', '1234567890123456');
    changeset.validate();
    console.log(changeset.get('isValid')); // true
    changeset.set('creditCardNumber', '1234');
    changeset.validate();
    console.log(changeset.get('isValid')); // false
    console.log(changeset.get('errors')); // [{key: 'creditCardNumber', value: '1234', validation: ['Credit card number must be equal to 16']}]
    changeset.set('paymentMethod', {
      isCreditCard: false
    });
    changeset.validate();
    console.log(changeset.get('isValid')); // true
  }
});
