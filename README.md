# mongo-wrapper

This is a lightweight wrapper around the mongodb driver for Node.js. It simplifies connecting and adds a few helper methods.

## Installation

```bash
$ npm install mongo-wrapper
```

## Usage

### Configuration

```js
var mongo = require('mongo-wrapper');

var config = {
  username: 'admin_user',
  password: 'secret',
  hosts: [ 
    {name: 'primary-1.db.com', port: 27017}, 
    {name: 'secondary-1.db.com', port: 27017},
    {name: 'secondary-2.db.com', port: 27017} 
  ],
  database: 'db_1',
  options: {
    replicaSet: 'replicaset_1',
    readPreference: 'primaryPreferred'
  },
  indexes: {
    users: [
      {index: 'email', options: {unique: true}}
    ]
  }
};

db = mongo.setup(config);

// add your collections
db.add('users');
```

### Query

```js
// once the db is setup and collections are added you can use any
// methods found in the Mongo Driver Collection class
// http://mongodb.github.io/node-mongodb-native/api-generated/collection.html

db.users.insert({email: 'dan@email.com'}, function(err) {
  // inserted
});

db.users.findOne({email: 'dan@email.com'}, function(err, user) {
  // use user
});
```

### Additional Helper Functions

#### findArray()

```js
// findArray() simply calls toArray() on the cursor returned from
// Collection.find()
db.users.findArray(function(err, users) {
  // use users
});
```

#### findById(), updateById(), findAndModifyById()

```js
// These functions make it simple to query by ObjectId and they
// accept either and ObjectId object or a JavaScript String.
db.users.findById('53683ca19c49151345e479ad', function(err, user) {
  // use user
});
```

#### db.id()

```js
// a wrapper around ObjectId
db.id(); // creates a new ObjectId
db.id('53683ca19c49151345e479ad'); // creates the ObjectId
db.id('invalid id'); // returns null
```

