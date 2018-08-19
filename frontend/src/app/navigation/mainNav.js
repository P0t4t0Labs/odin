import angular from 'angular';

const MODULE_NAME = 'mainNav';

angular.module(MODULE_NAME, [])
  .component(MODULE_NAME, {
    template: require('./mainNav.html')
  });

export default MODULE_NAME;
