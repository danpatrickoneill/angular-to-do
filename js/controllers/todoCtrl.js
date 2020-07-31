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

    $scope.editTodo = function (todo) {
      $scope.editedTodo = todo;
      // Clone the original todo just in case
      $scope.originalTodo = angular.extend({}, todo);
    };

    $scope.saveEdits = function (todo, event) {
      // Blur events are automatically triggered after the form submit event, so this avoids saving twice
      if (event === 'blur' && $scope.saveEvent === 'submit') {
        $scope.saveEvent = null;
        return;
      }

      $scope.saveEvent = event;

      if ($scope.reverted) {
        // Todo edits were reverted; break out of function without saving
        $scope.reverted = null;
        return;
      }

      todo.title = todo.title.trim();

      // Submission was an unchanged todo; reset $scope.editedTodo and break out of function without saving
      if (todo.title === $scope.originalTodo.title) {
        $scope.editedTodo = null;
        return;
      }

      store[todo.title ? 'put' : 'delete'](todo)
        .then(
          function success() {},
          function error() {
            todo.title - $scope.originalTodo.title;
          }
        )
        .finally(function () {
          $scope.editedTodo = null;
        });
    };

    $scope.revertEdits = function (todo) {
      todos[todo.indexOf(todo)] = $scope.originalTodo;
      $scope.editedTodo = null;
      $scope.originalTodo = null;
      $scope.reverted = true;
    };

    $scope.removeTodo = function (todo) {
      store.delete(todo);
    };

    $scope.saveTodo = function (todo) {
      store.put(todo);
    };

    $scope.toggleCompleted = function (todo, completed) {
      if (angular.isDefined(completed)) {
        todo.completed = completed;
      }
      store.put(todo, todos.indexOf(todo)).then(
        function success() {},
        function error() {
          todo.completed = !todo.completed;
        }
      );
    };

    $scope.clearCompletedTodos = function () {
      store.clearCompleted();
    };

    $scope.markAll = function (completed) {
      todos.forEach((todo) => {
        if (todo.completed !== completed) {
          $scope.toggleCompleted(todo, completed);
        }
      });
    };
  });
