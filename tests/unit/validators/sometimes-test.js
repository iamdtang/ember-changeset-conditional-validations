import { module, test } from 'qunit';
import { validatePresence, validateLength } from 'ember-changeset-validations/validators';
import validateSometimes from 'ember-changeset-conditional-validations/validators/sometimes';
import lookupValidator from 'ember-changeset-validations';
import sinon from 'sinon';
import isFunction from './../../helpers/is-function';
import Changeset from 'ember-changeset';

module('Unit | Validator | sometimes');

test('an array of validators is returned', function(assert) {
  let validatorA = function() {};
  let validatorB = function() {};
  let condition = function() {};

  let validators = validateSometimes([validatorA, validatorB], condition);

  assert.equal(validators.length, 2);
  assert.ok(validators.every(isFunction));
});

test('if the condition returns false, the validators return true', function(assert) {
  let validatorA = function() {};
  let validatorB = function() {};
  let condition = () => false;

  let validators = validateSometimes([validatorA, validatorB], condition);
  let validations = validators.map(validator => validator());

  assert.deepEqual(validations, [true, true]);
});

test('if the condition returns true, the validators are invoked and their result is returned', function(assert) {
  let validatorA = () => 'Error message A';
  let validatorB = () => true;
  let condition = () => true;

  let validators = validateSometimes([validatorA, validatorB], condition);
  let validations = validators.map(validator => validator());

  assert.deepEqual(validations, ['Error message A', true]);
});

test('the condition is invoked with the changes and content for each validator', function(assert) {
  let key = 'name';
  let newValue = 'Yehuda';
  let oldValue = 'YK';
  let changes = {};
  let content = {};

  let validatorA = () => 'Error message A';
  let validatorB = () => true;
  let condition = sinon.spy();

  let validators = validateSometimes([validatorA, validatorB], condition);
  validators.forEach((validator) => {
    return validator(key, newValue, oldValue, changes, content);
  });

  assert.equal(condition.callCount, 2);
  assert.strictEqual(condition.getCall(0).args[0], changes);
  assert.strictEqual(condition.getCall(0).args[1], content);
  assert.strictEqual(condition.getCall(1).args[0], changes);
  assert.strictEqual(condition.getCall(1).args[1], content);
});

test('each validator is invoked with key, newValue, oldValue, changes, and content', function(assert) {
  let key = 'name';
  let newValue = 'Yehuda';
  let oldValue = 'YK';
  let changes = {};
  let content = {};

  let validatorA = sinon.spy();
  let validatorB = sinon.spy();
  let condition = () => true;

  let validators = validateSometimes([validatorA, validatorB], condition);
  validators.forEach((validator) => {
    return validator(key, newValue, oldValue, changes, content);
  });

  assert.strictEqual(validatorA.firstCall.args[0], key);
  assert.strictEqual(validatorA.firstCall.args[1], newValue);
  assert.strictEqual(validatorA.firstCall.args[2], oldValue);
  assert.strictEqual(validatorA.firstCall.args[3], changes);
  assert.strictEqual(validatorA.firstCall.args[4], content);
  assert.strictEqual(validatorB.firstCall.args[0], key);
  assert.strictEqual(validatorB.firstCall.args[1], newValue);
  assert.strictEqual(validatorB.firstCall.args[2], oldValue);
  assert.strictEqual(validatorB.firstCall.args[3], changes);
  assert.strictEqual(validatorB.firstCall.args[4], content);
});

test('this.get() when accessing the changes', function(assert) {
  let Validations = {
    paymentMethod: validatePresence(true),
    creditCardNumber: validateSometimes([
      validatePresence(true),
      validateLength({ is: 16 })
    ], function() {
      return this.get('paymentMethod') === 'credit-card';
    })
  };

  let changeset = new Changeset({}, lookupValidator(Validations), Validations);
  changeset.set('paymentMethod', 'credit-card');
  changeset.set('creditCardNumber', '12');
  changeset.validate();

  assert.notOk(changeset.get('isValid'), 'invalid');

  changeset.set('creditCardNumber', '1234567890123456');
  changeset.validate();

  assert.ok(changeset.get('isValid'), 'valid');
});

test('this.get() when accessing the content', function(assert) {
  let Validations = {
    paymentMethod: validatePresence(true),
    creditCardNumber: validateSometimes([
      validatePresence(true),
      validateLength({ is: 16 })
    ], function() {
      return this.get('paymentMethod') === 'credit-card';
    })
  };

  let changeset = new Changeset({
    paymentMethod: 'credit-card'
  }, lookupValidator(Validations), Validations);

  changeset.set('creditCardNumber', '12');
  changeset.validate();

  assert.notOk(changeset.get('isValid'), 'invalid');

  changeset.set('creditCardNumber', '1234567890123456');

  assert.ok(changeset.get('isValid'), 'valid');
});

test('this.get() when accessing content with a property path', function(assert) {
  let Validations = {
    paymentMethod: validatePresence(true),
    creditCardNumber: validateSometimes([
      validatePresence(true),
      validateLength({ is: 16 })
    ], function() {
      return this.get('paymentMethod.isCreditCard');
    })
  };

  let changeset = new Changeset({
    paymentMethod: {
      isCreditCard: true
    },
    creditCardNumber: 12
  }, lookupValidator(Validations), Validations);
  changeset.validate();

  assert.notOk(changeset.get('isValid'));
});

test('this.get() when accessing changes with a property path', function(assert) {
  let Validations = {
    paymentMethod: validatePresence(true),
    creditCardNumber: validateSometimes([
      validatePresence(true),
      validateLength({ is: 16 })
    ], function() {
      return this.get('paymentMethod.isCreditCard');
    })
  };

  let changeset = new Changeset({}, lookupValidator(Validations), Validations);
  changeset.set('paymentMethod', {
    isCreditCard: true
  });
  changeset.set('creditCardNumber', '12');
  changeset.validate();

  assert.notOk(changeset.get('isValid'));
});

test('this.get() when setting the key to false', function(assert) {
  let Validations = {
    hasCreditCard: validatePresence(true),
    creditCardNumber: validateSometimes([
      validatePresence(true),
      validateLength({ is: 16 })
    ], function () {
      return this.get('hasCreditCard');
    })
  };

  let changeset = new Changeset({
    hasCreditCard: true
  }, lookupValidator(Validations), Validations);

  changeset.set('hasCreditCard', false);
  changeset.set('creditCardNumber', '12');
  changeset.validate();

  assert.ok(changeset.get('isValid'), 'valid');
});
