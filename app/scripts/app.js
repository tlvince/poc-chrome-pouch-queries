'use strict';

/**
 * @ngdoc overview
 * @name pocPouchApp
 * @description
 * # pocPouchApp
 *
 * Main module of the application.
 */
angular
  .module('pocPouchApp', [
    'angular-growl'
  ])

  .config(function(growlProvider) {
    growlProvider.onlyUniqueMessages(false);
  });
