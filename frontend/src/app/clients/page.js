import angular from 'angular';

const MODULE_NAME = 'clientsPage';

angular.module(MODULE_NAME, [])
  .component(MODULE_NAME, {
    template: require('./page.html'),
    controller: PageCtrl
  });

function PageCtrl($http) {
  this._i = {
    $http
  };
}

PageCtrl.prototype.$onInit = function() {
  // TODO: loading and error handling
  // TODO: api that auto-barfs to error handler
  var self = this;
  this._i.$http.get('/api/game/commander')
    .then(function(resp) {
      self.clients = resp.data;
    })
    .catch(function(e) {
      // God this is a shit way to do it lol
      alert(e);
    })
};

export default MODULE_NAME;
