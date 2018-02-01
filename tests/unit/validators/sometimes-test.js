import { module, test } from 'qunit';
import { validatePresence, validateLength } from 'ember-changeset-validations/validators';
import validateSometimes from 'ember-changeset-conditional-validations/validators/sometimes';
import lookupValidator from 'ember-changeset-validations';
import sinon from 'sinon';
import isFunction from './../../helpers/is-function';
import Changeset from 'ember-changeset';

module('Unit | Validator | sometimes');

test('an array of validators is returned', function(assert) {
  let validatorA = sinon.stub();
  let validatorB = sinon.stub();
  let condition = sinon.stub();
  let validators = validateSometimes([validatorA, validatorB], condition);
  assert.equal(validators.length, 2);
  assert.ok(validators.every(isFunction));
});

test('if the condition returns false, the validators return true', function(assert) {
  let validatorA = sinon.stub();
  let validatorB = sinon.stub();
  let condition = sinon.stub().returns(false);
  let validators = validateSometimes([validatorA, validatorB], condition);
  let validations = validators.map((validator) => {
    return validator();
  });
  assert.deepEqual(validations, [true, true]);
});

test('if the condition returns true, the validators are invoked and their result is returned', function(assert) {
  let validatorA = sinon.stub().returns('Error message A');
  let validatorB = sinon.stub().returns(true);
  let condition = sinon.stub().returns(true);
  let validators = validateSometimes([validatorA, validatorB], condition);
  let validations = validators.map((validator) => {
    return validator();
  });
  assert.deepEqual(validations, ['Error message A', true]);
});

test('the condition is invoked with the changes and content for each validator', function(assert) {
  let key = 'name';
  let newValue = 'Yehuda';
  let oldValue = 'YK';
  let changes = {};
  let content = {};

  let validatorA = sinon.stub().returns('Error message A');
  let validatorB = sinon.stub().returns(true);
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
  let condition = sinon.stub().returns(true);
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

test('this.get() to access the changes', function(assert) {
  const Validations = {
    paymentMethod: validatePresence(true),
    creditCardNumber: validateSometimes([
      validatePresence(true),
      validateLength({ is: 16 })
    ], function() {
      return this.get('paymentMethod') === 'credit-card';
    })
  };

  let settings = {};
  let changeset = new Changeset(settings, lookupValidator(Validations), Validations);
  changeset.set('paymentMethod', 'credit-card');
  changeset.set('creditCardNumber', '12');
  changeset.validate();
  assert.notOk(changeset.get('isValid'), 'invalid');
  changeset.set('creditCardNumber', '1234567890123456');
  changeset.validate();
  assert.ok(changeset.get('isValid'), 'valid');
  changeset.set('creditCardNumber', '');
  changeset.set('paymentMethod', 'paypal');
  changeset.validate();
  assert.ok(changeset.get('isValid'), 'still valid');
});

test('this.get() to access the content', function(assert) {
  const Validations = {
    paymentMethod: validatePresence(true),
    creditCardNumber: validateSometimes([
      validatePresence(true),
      validateLength({ is: 16 })
    ], function() {
      return this.get('paymentMethod') === 'credit-card';
    })
  };

  let settings = {
    paymentMethod: 'credit-card'
  };
  let changeset = new Changeset(settings, lookupValidator(Validations), Validations);
  changeset.set('creditCardNumber', '12');
  changeset.validate();
  assert.notOk(changeset.get('isValid'), 'invalid');
  changeset.set('creditCardNumber', '1234567890123456');
  changeset.save();
  assert.ok(changeset.get('isValid'), 'valid');
});

test('this.get() has the same semantics as Ember.get when accessing content', function(assert) {
  const Validations = {
    paymentMethod: validatePresence(true),
    creditCardNumber: validateSometimes([
      validatePresence(true),
      validateLength({ is: 16 })
    ], function() {
      return this.get('paymentMethod.isCreditCard');
    })
  };

  let settings = {
    paymentMethod: {
      isCreditCard: true
    },
    creditCardNumber: 12
  };
  let changeset = new Changeset(settings, lookupValidator(Validations), Validations);
  changeset.validate();
  assert.notOk(changeset.get('isValid'));
});

test('this.get() has the same semantics as Ember.get when accessing changes', function(assert) {
  const Validations = {
    paymentMethod: validatePresence(true),
    creditCardNumber: validateSometimes([
      validatePresence(true),
      validateLength({ is: 16 })
    ], function() {
      return this.get('paymentMethod.isCreditCard');
    })
  };

  let settings = {};
  let changeset = new Changeset(settings, lookupValidator(Validations), Validations);
  changeset.set('paymentMethod', {
    isCreditCard: true
  });
  changeset.set('creditCardNumber', '12');
  changeset.validate();
  assert.notOk(changeset.get('isValid'));
});
