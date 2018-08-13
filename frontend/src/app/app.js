import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import ngMessages from 'angular-messages'

import '../style/app.scss';

const MODULE_NAME = 'odin';

function config($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state({
      name: 'root',
      url: '/',
      template: 'Testing Testing 123'
    });
}

function run($rootScope) {
  $rootScope.pageTitle = 'Potato'
}

angular.module(MODULE_NAME, [uiRouter, ngMessages])
  .config(config)
  .run(run);

export default MODULE_NAME;
