import Controller from '@ember/controller';
import Changeset from 'ember-changeset';
import lookupValidator from 'ember-changeset-validations';
import Validations from './../validations/settings';

export default Controller.extend({
  init() {
    this._super(...arguments);
    let settings = {};
    let changeset = new Changeset(settings, lookupValidator(Validations), Validations);
    this.set('changeset', changeset);
  }
});
