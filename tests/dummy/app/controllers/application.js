import Controller from '@ember/controller';
import { action } from '@ember/object';
import Changeset from 'ember-changeset';
import lookupValidator from 'ember-changeset-validations';
import Validations from './../validations/settings';

export default class ApplicationController extends Controller {
  constructor() {
    super(...arguments);
    this.changeset = new Changeset(
      {},
      lookupValidator(Validations),
      Validations
    );
  }

  @action
  updateCreditCardNumber({ target: { value } }) {
    this.changeset.creditCardNumber = value;
  }
}
