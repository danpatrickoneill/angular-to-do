/*global angular */

/**
 * The main TodoMVC app module
 *
 * @type {angular.Module}
 */
angular
  .module('todomvc', ['ngRoute', 'ngResource'])
  .config(function ($routeProvider) {
    'use strict';

    const routeConfig = {
      controller: 'TodoCtrl',
      templateUrl: 'todomvc-index.html',
      resolve: {
        store: function (todoStorage) {
          // get the API or localStorage module
          return todoStorage.then(function (module) {
            module.get();
            return module;
          });
        },
      },
    };

    $routeProvider
      .when('/', routeConfig)
      .when('/:status', routeConfig)
      .otherwise({ redirectTo: '/' });
  });
