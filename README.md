[![Build Status](https://travis-ci.org/skaterdav85/ember-changeset-conditional-validations.svg?branch=master)](https://travis-ci.org/skaterdav85/ember-changeset-conditional-validations) [![Ember Observer Score](https://emberobserver.com/badges/ember-changeset-conditional-validations.svg)](https://emberobserver.com/addons/ember-changeset-conditional-validations)

# ember-changeset-conditional-validations

An extra validator for conditional validations with [`ember-changeset-validations`](https://github.com/DockYard/ember-changeset-validations).

## Installation

```
ember install ember-changeset-conditional-validations
```

## Usage

Let's say you want to validate a user's settings. Only if the payment method is a credit card should the credit card number validations be applied.

```js
import Ember from 'ember';
import { validatePresence, validateLength } from 'ember-changeset-validations/validators';
import validateSometimes from 'ember-changeset-conditional-validations/validators/sometimes';

export default {
  creditCardNumber: validateSometimes([
    validatePresence(true),
    validateLength({ is: 16 })
  ], function(changes, content) {
    return this.get('paymentMethod.isCreditCard');
  })
};
```

`validateSometimes` takes 2 arguments. The first is a list of validators you want applied to the attribute. The second argument is a callback function which represents the condition. If the condition callback returns `true`, the rules will be added. This callback function will be invoked with the changeset's changes and content. The callback will also be invoked with its `this` value set to an object that has a `get()` method for accessing a property. `this.get(property)` first proxies to the changes and then the underlying content.

```js
import Changeset from 'ember-changeset';
import lookupValidator from 'ember-changeset-validations';
import Validations from './../validations/settings';

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
```

## Installation

* `git clone <repository-url>` this repository
* `cd ember-changeset-conditional-validations`
* `npm install`

## Running

* `ember serve`
* Visit your app at [http://localhost:4200](http://localhost:4200).

## Running Tests

* `npm test` (Runs `ember try:each` to test your addon against multiple Ember versions)
* `ember test`
* `ember test --server`

## Building

* `ember build`

For more information on using ember-cli, visit [https://ember-cli.com/](https://ember-cli.com/).
