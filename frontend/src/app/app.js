import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import ngMessages from 'angular-messages'

import '../style/app.scss';

import mainNav from './navigation/mainNav'
import clientsMod from './clients/module'

const MODULE_NAME = 'odin';

function config($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state({
      name: 'home',
      url: '/',
      template: '<div class="container"><h1>Homepage Pending</h1></div>'
    })
    .state({
      name: 'clientList',
      url: '/clients',
      component: 'clientsPage'
    });
}

function run($rootScope) {
  $rootScope.pageTitle = 'Potato'
}

angular.module(MODULE_NAME, [
    uiRouter,
    ngMessages,
    mainNav,
    clientsMod,
  ])
  .config(config)
  .run(run);

export default MODULE_NAME;
