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
        return $injector.get('localStorage');
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
  })
  .factory('localStorage', function ($q) {
    'use strict';

    const STORAGE_ID = 'todos-angularjs';

    const store = {
      todos: [],

      _getFromLocalStorage: function () {
        return JSON.parse(localStorage.getItem(STORAGE_ID) || []);
      },

      _saveToLocalStorage: function () {
        localStorage.setItem(STORAGE_ID, JSON.stringify(store.todos));
      },

      clearCompleted: function () {
        // Could DRY up code by abstracting this later
        const deferred = $q.defer();

        const incompleteTodos = store.todos.filter((todo) => !todo.completed);

        angular.copy(incompleteTodos, store.todos);
        store._saveToLocalStorage(store.todos);

        deferred.resolve(store.todos);
        return deferred.promise;
      },

      insert: function (todo) {
        const deferred = $q.defer();

        store.todos.push(todo);
        store._saveToLocalStorage(store.todos);

        deferred.resolve(store.todos);
        return deferred.promise;
      },

      get: function () {
        const deferred = $q.defer();

        angular.copy(store._getFromLocalStorage, store.todos);

        deferred.resolve(store.todos);
        return deferred.promise;
      },

      put: function (todo, index) {
        const deferred = $q.defer();

        store.todos[index] = todo;
        store._saveToLocalStorage(store.todos);

        deferred.resolve(store.todos);
        return deferred.promise;
      },

      delete: function (todo) {
        const deferred = $q.defer();

        store.todos.splice(store.todos.indexOf(todo), 1);
        store._saveToLocalStorage(store.todos);

        deferred.resolve(store.todos);
        return deferred.promise;
      },
    };

    return store;
  });
