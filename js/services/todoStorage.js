/*global angular */

/**
 * Services that persists and retrieves todos from localStorage or a backend API
 * if available.
 *
 * They both follow the same API, returning promises for all changes to the
 * model.
 */
angular.module('todomvc').factory('todoStorage', function ($http, $injector) {
  'use strict';

  //  Checks for API server and returns it if it exists; otherwise uses localStorage
  return $http.get('/api').then(
    function () {
      return $injector.get('api');
    },
    function () {
      return $injector.get('localstorage');
    }
  );
});
