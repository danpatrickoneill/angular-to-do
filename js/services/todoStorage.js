/*global angular */

/**
 * Services that persists and retrieves todos from localStorage or a backend API
 * if available.
 *
 * They both follow the same API, returning promises for all changes to the
 * model.
 */
angular
  .module('todomvc')
  .factory('todoStorage', function ($http, $injector) {
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
  })
  .factory('api', function ($resource) {
    'use strict';

    const store = {
      todos: [],

      api: $resource('/api/todos/:id', null, {
        update: { method: 'PUT' },
      }),

      clearCompleted: function () {
        // Copy current stored todos, just in case
        const originalTodos = store.todos.slice(0);
        const incompleteTodos = store.todos.filter((todo) => !todo.completed);

        angular.copy(incompleteTodos, store.todos);

        return store.api.delete(
          function () {},
          function error() {
            angular.copy(originalTodos, store.todos);
          }
        );
      },

      insert: function (todo) {
        const originalTodos = store.todos.slice(0);

        return store.api.save(
          todo,
          function success(res) {
            todo.id = res.id;
            store.todos.push(todo);
          },
          function error() {
            angular.copy(originalTodos, store.todos);
          }
        );
      },

      get: function () {
        return store.api.query(function (res) {
          angular.copy(res, store.todos);
        });
      },

      put: function (todo) {
        return store.api.update({ id: todo.id }, todo).$promise;
      },

      delete: function (todo) {
        const originalTodos = store.todos.slice(0);

        store.todos.splice(store.todos.indexOf(todo), 1);
        return store.api.delete(
          { id: todo.id },
          function () {},
          function error() {
            angular.copy(originalTodos, store.todos);
          }
        );
      },
    };

    return store;
  });
