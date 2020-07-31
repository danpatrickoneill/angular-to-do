/*global angular */

/**
 * The main controller for the app. The controller:
 * - retrieves and persists the model via the todoStorage service
 * - exposes the model to the template and provides event handlers
 */

angular
  .module('todomvc')
  .controller('TodoCtrl', function TodoCtrl(
    $scope,
    $routeParams,
    $filter,
    store
  ) {
    'use strict';

    const todos = ($scope.todos = store.todos);

    $scope.newTodo = '';
    $scope.editedTodo = null;

    $scope.$watch(
      'todos',
      function () {
        $scope.remainingCount = $filter('filter')(todos, {
          completed: false,
        }).length;
        $scope.completedCount = todos.length - $scope.remainingCount;
        $scope.allChecked = !$scope.remainingCount;
      },
      true
    );

    // Monitors the route for changes and adjusts the filter accordingly
    $scope.$on('$routeChangeSuccess', function () {
      const status = ($scope.status = $routeParams.status || '');
      $scope.statusFilter =
        status === 'active'
          ? { completed: false }
          : status === 'completed'
          ? { completed: true }
          : {};
    });

    $scope.addTodo = function () {
      const newTodo = {
        title: $scope.newTodo.trim(),
        completed: false,
      };

      if (!newTodo.title) {
        return;
      }

      $scope.saving = true;
      store
        .insert(newTodo)
        .then(function success() {
          $scope.newTodo = '';
        })
        .finally(function () {
          $scope.saving = false;
        });
    };
  });
