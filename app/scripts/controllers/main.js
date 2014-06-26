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
      },
      {
        name: 'Esbjörn',
        doctype: 'est'
      },
      {
        name: 'Dan',
        doctype: 'est'
      }
    ];

    var gybe = [
      {
        name: 'Efrim',
        doctype: 'gybe'
      },
      {
        name: 'Mike',
        doctype: 'gybe'
      }
    ];

    var sigur = [
      {
        name: 'Jón',
        doctype: 'sigur'
      },
      {
        name: 'Orri',
        doctype: 'sigur'
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
      return growl.info('Inserted ' + result.length + ' band members');
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

    var listMembers = function(docs, band, key) {
      key = !key ? 'key' : key;
      // jshint camelcase: false
      growl.info('Found ' + docs.rows.length + ' ' + band + ' members');
      $scope.$apply(function() {
        $scope[band] = docs.rows.map(function(row) {
          return row[key];
        });
      });
    };

    var listBeatles = function(docs) {
      return listMembers(docs, 'beatles');
    };

    var listNirvana = function(docs) {
      return listMembers(docs, 'nirvana');
    };

    var setNirvanaView = function() {
      var nirvanaView = {
        _id: '_design/nirvana',
        views: {
          nirvana: {
            map: function(doc, emit) {
              if (doc.doctype === 'nirvana') {
                emit(doc.name, 1);
              }
            }.toString()
          }
        }
      };

      return db.put(nirvanaView);
    };

    var initView = function(view) {
      return db.query(view, {
        stale: 'update_after'
      });
    };

    var initNirvanaView = function() {
      return initView('nirvana');
    };

    var getNirvana = function() {
      return db.query('nirvana');
    };

    var createDesignDoc = function(name, mapFunction) {
      var ddoc = {
        _id: '_design/' + name,
        views: {}
      };
      ddoc.views[name] = { map: mapFunction.toString() };
      return ddoc;
    };

    var setESTView = function() {
      var estView = createDesignDoc('est', function(doc, emit) {
        emit(doc.doctype, doc.name);
      });
      return db.put(estView);
    };

    var initESTView = function() {
      return initView('est');
    };

    var getEST = function() {
      return db.query('est', {
        key: 'est'
      });
    };

    var listEST = function(docs) {
      return listMembers(docs, 'est', 'value');
    };

    var generateGYBEDocURIs = function() {
      $window.docuri.route('bands/:doctype/:name', 'bands');

      gybe = gybe.map(function(g) {
        g._id = $window.docuri.bands(g);
        return g;
      });
    };

    var insertGYBE = function() {
      return db.bulkDocs(gybe);
    };

    var getAllDocsByRange = function(key) {
      return db.allDocs({
        // jshint camelcase: false
        include_docs: true,
        startkey: key,
        endkey: key + '_'
      });
    };

    var getGYBE = function() {
      return getAllDocsByRange('bands/gybe');
    };

    var listGYBE = function(docs) {
      return listMembers(docs, 'gybe', 'doc');
    };

    var generateSigurCollateIDs = function() {
      sigur = sigur.map(function(s) {
        s._id = $window.pouchCollate.toIndexableString([
          'bands', s.doctype, s.name
        ]);
        return s;
      });
    };

    var insertSigur = function() {
      return db.bulkDocs(sigur);
    };

    var getSigur = function() {
      var key = $window.pouchCollate.toIndexableString([
        'bands', 'sigur'
      ]);
      return getAllDocsByRange(key);
    };

    var listSigur = function(docs) {
      return listMembers(docs, 'sigur', 'doc');
    };

    initDB()
      .then(insertBands)
      .then(growlBands)
      .then(getBeatles)
      .then(listBeatles)
      .then(setNirvanaView)
      .then(initNirvanaView)
      .then(getNirvana)
      .then(listNirvana)
      .then(setESTView)
      .then(initESTView)
      .then(getEST)
      .then(listEST)
      .then(generateGYBEDocURIs)
      .then(insertGYBE)
      .then(growlBands)
      .then(getGYBE)
      .then(listGYBE)
      .then(generateSigurCollateIDs)
      .then(insertSigur)
      .then(growlBands)
      .then(getSigur)
      .then(listSigur)
      .catch(growlError);
  });
