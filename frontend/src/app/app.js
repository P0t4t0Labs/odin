import angular from 'angular';
import uiRouter from '@uirouter/angularjs';
import ngMessages from 'angular-messages'

import '../style/app.scss';

import mainNav from './navigation/mainNav'
import clientsMod from './clients/module'
import msgBar from './msgBar/msgBar'

const MODULE_NAME = 'odin';

function config($stateProvider, $urlRouterProvider) {
  $urlRouterProvider.otherwise('/');

  $stateProvider
    .state({
      name: 'home',
      url: '/',
      template: '<div class="container"><h1>Homepage Pending</h1></div>',
      mainNav: {
        title: 'Dashboard',
        position: -100
      }
    })
    .state({
      name: 'clientList',
      url: '/clients',
      component: 'clientsPage',
      pageTitle: 'Clients',
      mainNav: {
        title: 'Clients',
        position: -90
      }
    });
}

function run($rootScope, $transitions, $stateRegistry, $log) {
  // Update page title
  $transitions.onSuccess({}, function(transition) {
    var state = transition.$to();
    if (state.self && state.self.pageTitle) {
      $rootScope.pageTitle = state.self.pageTitle;
    } else {
      $rootScope.pageTitle = null;
    }
  });

  // Build the main nav array
  var mainNav = [];
  angular.forEach($stateRegistry.states, function(state) {
    if (!state.self || !state.self.mainNav) {
      return;
    }

    // Cast strings into objects
    var main = state.self.mainNav;
    if (!angular.isObject(main)) {
      $log.error('Invalid mainNav property for state.', state);
      return;
    }

    // Shove it in
    mainNav.push({
      title: main.title || state.name,
      position: main.position || 0,
      name: state.name
    });
  });

  mainNav.sort((a, b) => a.position - b.position);
  $rootScope.mainNav = mainNav;
}

angular.module(MODULE_NAME, [
    uiRouter,
    ngMessages,
    mainNav,
    clientsMod,
    msgBar,
  ])
  .config(config)
  .run(run);

export default MODULE_NAME;
