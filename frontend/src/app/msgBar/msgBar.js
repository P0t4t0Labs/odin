import angular from 'angular';

import './msgBar.scss'

const MODULE_NAME = 'msgBar';

function MsgBarService($q, $timeout) {
  this._i = {
    $q, $timeout
  };

  this.messages = [];

  // Shortcuts
  this.info = this.add.bind(this, 'info');
  this.success = this.add.bind(this, 'success');
  this.warning = this.add.bind(this, 'warning');
  this.danger = this.error = this.add.bind(this, 'danger');

  // DEBUG ONLY
  this.success('Welcome!', 1000);
}
MsgBarService.TIMEOUT = 5000;

/**
 * Display an error
 * @param {string} level 'info', 'success', 'warning', or 'danger'.
 * @param {string} message Message to display.
 * @param {int} [timeout=MsgBarService.TIMEOUT] Time in ms to display the alert before
 *  removing it. Specify <= 0 and the message can only be removed manually.
 */
MsgBarService.prototype.add = function(level, message, timeout) {
  if (!message) {
    return;
  }

  var svc = this;
  var $timeout = this._i.$timeout;
  var $q = this._i.$q;

  if (!angular.isNumber(timeout)) {
    timeout = MsgBarService.TIMEOUT;
  }

  // Create deferred that will remove this message
  var d = $q.defer();
  var remove = d.resolve.bind(d);

  var msg = {
    level: level,
    message: message,
    timeout: null,
    remove: remove
  };

  // Create deferred removal
  d.promise.finally(function() {
    if (msg.timeout) {
      $timeout.cancel(msg.timeout);
      msg.timeout = null;
    }

    var i = svc.messages.indexOf(msg);
    if (i != -1) {
      svc.messages.splice(i, 1);
    }
  });

  // Timed removal
  if (timeout > 0) {
    msg.timeout = $timeout(function() {
      remove();
    }, timeout);
  }

  svc.messages.push(msg);
};

angular.module(MODULE_NAME, [])
  .service('msgBar', MsgBarService)
  .component('msgBar', {
    controller: function(msgBar) {
      this.msgBar = msgBar;
    },
    template: require('./msgBar.html')
  });

export default MODULE_NAME;
