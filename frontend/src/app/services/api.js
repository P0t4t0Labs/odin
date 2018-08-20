import angular from 'angular';

import msgBar from '../msgBar/msgBar';

const MODULE_NAME = 'api';


/**
 * A cheap service to automatically handle any errors from the API.
 * @param $http
 * @param $q
 * @param msgBar
 * @constructor
 */
function API($http, $q, msgBar, $log) {
  var svc = this;

  // Wrap all standard $http calls in error handlers
  ['get', 'head', 'post', 'put', 'delete', 'patch']
    .forEach(function(fnName) {
      svc[fnName] = function() {
        return $http[fnName].apply($http, arguments)
          .then(function(response) {
            // Catch if our response uses the `.error` property when we're screwed.
            if (angular.isObject(response.data) && response.data.error) {
              // Will be pushed to our catch
              return $q.reject(response);
            }
            return response;
          })
          .catch(function(response) {
            var msg = 'An unknown error occurred';

            // Resolve error message
            if (angular.isObject(response.data) && response.data.error) {
              msg = response.data.error;
            } else {
              msg = 'HTTP Error: (' + response.status + ') ' + response.statusText;
            }

            msgBar.error(msg, -1);
            $log.error(msg, response.config.method,response.config.url);

            return $q.reject(response);
          });
      }
    });
}

angular.module(MODULE_NAME, [msgBar])
  .service(MODULE_NAME, API);

export default MODULE_NAME;
