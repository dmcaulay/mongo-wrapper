var assert = require('assert')
var mongo = require('../')
var options = {
  "id": "db",
  "name": "mongo_wrapper_test",
  "host": "localhost", 
  "port": 27017
}

describe('mongo-wrapper', function() {
  it('returns a db object', function() {
    assert(mongo.setup(options))
    assert(mongo.db)
  })
  describe('db', function() {
    it('adds collections',function() {
      var db = mongo.db.add('tests')
      assert(db)
    })
  })
  describe('collection', function() {
    it('inserts documents', function(done) {
      var db = mongo.db.add('tests')
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
  })
})
