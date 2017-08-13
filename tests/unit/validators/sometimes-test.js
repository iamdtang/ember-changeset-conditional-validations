import { module, test } from 'qunit';
import validateSometimes from 'ember-changeset-conditional-validations/validators/sometimes';
import sinon from 'sinon';
import isFunction from './../../helpers/is-function';

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
  validators.map((validator) => {
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

  validators.map((validator) => {
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
