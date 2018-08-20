import angular from 'angular';

import api from '../services/api'

const MODULE_NAME = 'clientsPage';

angular.module(MODULE_NAME, [api])
  .component(MODULE_NAME, {
    template: require('./page.html'),
    controller: PageCtrl
  });

function PageCtrl(api) {
  this._i = {
    api
  };
}

PageCtrl.prototype.$onInit = function() {
  this.refreshClients();
};

PageCtrl.prototype.refreshClients = function() {
  var self = this;
  self.loading = true;
  this._i.api.get('/api/game/commander')
    .then(function(resp) {
      self.clients = resp.data;
    })
    .finally(function() {
      self.loading = false;
    });
};

export default MODULE_NAME;
