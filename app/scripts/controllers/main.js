'use strict';

/**
 * @ngdoc function
 * @name pocPouchApp.controller:MainCtrl
 * @description
 * # MainCtrl
 * Controller of the pocPouchApp
 */
angular.module('pocPouchApp')
  .controller('MainCtrl', function($scope, $window, growl, $q) {
    var docs = [
      {
        name: 'George',
        doctype: 'beatle'
      },
      {
        name: 'Ringo',
        doctype: 'beatle'
      },
      {
        name: 'Kurt',
        doctype: 'nirvana'
      },
      {
        name: 'Dave',
        doctype: 'nirvana'
      }
    ];

    var db = 'bands';
    var initDB = function() {
      return $window.PouchDB.destroy('bands')
        .then(function() {
          db = new $window.PouchDB(db);
        });
    };

    var insertBands = function() {
      // You'd usually use db.bulkDocs here
      var promises = docs.map(function(doc) {
        return db.post(doc);
      });
      return $q.all(promises);
    };

    var growlBands = function(result) {
      return growl.info('Inserted ' + result.length + ' bands');
    };

    var growlError = function(reason) {
      return growl.error(reason.message);
    };

    var getBeatles = function() {
      var map = function(doc, emit) {
        if (doc.doctype === 'beatle') {
          emit(doc.name);
        }
      };
      return db.query(map);
    };

    var listBeatles = function(docs) {
      // jshint camelcase: false
      growl.info('Found ' + docs.total_rows + ' beatles');
      $scope.$apply(function() {
        $scope.beatles = docs.rows.map(function(row) {
          return row.key;
        });
      });
    };

    initDB()
      .then(insertBands)
      .then(growlBands)
      .then(getBeatles)
      .then(listBeatles)
      .catch(growlError);
  });
