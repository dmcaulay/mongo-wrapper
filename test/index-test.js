var assert = require('assert')
var mongo = require('../')

var options = {
  "hosts" : [ 
    {
      "name": "localhost", 
      "port": 27017
    }
  ],
  "options": {
    "w": 1
  },
  "database" : "test_db"
}

var db;
describe('mongo-wrapper', function() {
  it('returns a db object', function() {
    db = mongo.setup(options);
    assert(db)
  })
  describe('collection', function() {
    it('inserts documents', function(done) {
      db.add('tests')
      db.tests.insert({name:'insert',meta: { pass: 'ok', message: 'run next test'}}, function(err) {
        assert.ifError(err)
        db.tests.findOne({name:'insert'}, function(err, test) {
          assert.ifError(err)
          assert.equal(test.name,'insert')
          assert(test.meta)
          assert.equal(test.meta.pass,'ok')
          assert.equal(test.meta.message, 'run next test')
          done()
        })
      })
    })

    it('contains a bind function', function(done) {
      db.add('tests');
      db.tests.bind('insert', {name: 'test-bind'})(function(err) {
        assert.ifError(err)
        db.tests.findOne({name: 'test-bind'}, function(err, test) {
          assert.ifError(err)
          assert.equal(test.name, 'test-bind')
          done()
        })
      });
    });
  })
})
