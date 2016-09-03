/*----HTTP Server----*/
var http = require("http");
httpServer = http.createServer(function(req, res){
  console.log("Server is running");
});
httpServer.listen(80);

/*-----MongoDB-------*/
var mongoClient = require("mongodb").MongoClient;
var url = 'mongodb://localhost/messaging';
var bcrypt = require('bcrypt');
const saltRounds = 10;
var user1;
var user2;
var password = 'test';

/*-----OpenPGP-------*/
var openpgp = require('openpgp'); // use as CommonJS, AMD, ES6 module or via window.openpgp
openpgp.initWorker({ path:'openpgp.worker.js' }) // set the relative web worker path
openpgp.config.aead_protect = true // activate fast AES-GCM mode (experimental)
var options, encrypted;

/*----Sockets-------*/
var io = require("socket.io").listen(httpServer);
var users = {};

io.sockets.on("connection", function(socket){
  var me = false;
  var messages = [];
  var password = '';

  for(var k in users){
    socket.emit('newusr', users[k]);
  }

  socket.on('login', function(user){
    mongoClient.connect(url, function (err, db) {
    if (err) {
        return console.error('Connection failed', err);
    }
    console.log('Connection successful on ', url);

    var findDocuments = function(db, callback) {
      // Get the documents collection
      var collection = db.collection('users');
      // Find some documents
      collection.find({'login': [users.login]}).toArray(function(err, docs) {
        if(err){
          socket.emit('error', err);
        }
        /*if(rows.length === 1 && rows[0].token === user.token){
          me = {};
          me.id = rows[0].id;
          me.username = rows[0].login;
          socket.emit('logged');
          users[me.id] = me;
          password = rows[0].pass;
          io.sockets.emit('newusr', me);
        }*/
        assert.equal(err, null);
        console.log("Found the following records");
        console.log(docs);
        callback(docs);
      });
    }

    /*
     bcrypt.genSalt(saltRounds, function(err, salt) {
      bcrypt.hash(password, salt, function(err, hash) {
        user1 = {login: 'blasphemy', pass: hash, email: 'undergroundempire7@gmail.com', token: ''};
        user2 = {login: 'troisieme', pass: hash, email: 'trucalacon@gmail.com', token: ''};

        collection.insertMany([user1, user2], function (err, result) {
            if (err) {
                console.error('Insert failed', err);
            } else {
                console.log('Insert successful', result);
            }

            db.close()
        });
      });
     });*/
    });
    connection.query('SELECT * FROM users WHERE id = ?', [user.id], function(err, rows, fields){
      if(err){
        socket.emit('error', err);
      }
      if(rows.length === 1 && rows[0].token === user.token){
        me = {};
        me.id = rows[0].id;
        me.username = rows[0].login;
        socket.emit('logged');
        users[me.id] = me;
        password = rows[0].pass;
        io.sockets.emit('newusr', me);
      }
      else{
        io.sockets.emit('error', 'Cet utilisateur n\'existe pas');
      }
    });
  });
});
/*
  socket.on('loadMsg', function(emetteur, destinataire){
    messages = [];
    connection.query('SELECT users.id AS user_id, users.login, messages.texte, messages.id_user2 AS id_user2, UNIX_TIMESTAMP(messages.date) AS date FROM messages LEFT JOIN users ON users.id = messages.id_user WHERE (messages.id_user = ? AND messages.id_user2 = ?) OR (messages.id_user = ? AND messages.id_user2 = ?) ORDER BY date LIMIT 10',
    [
      emetteur,
      destinataire,
      destinataire,
      emetteur
    ],
    function(err, rows){
      if(err){
        socket.emit('error', err);
        return true;
      }
      for(k in rows){
        var row = rows[k];
        options = {
            message: openpgp.message.readArmored(row.texte), // parse armored message
            password: password                         // decrypt with password
        };
        openpgp.decrypt(options).then(function(plaintext) {
            var decrypted = plaintext.data; // 'Hello, World!'
            message = {
              message : decrypted,
              date : row.date * 1000,
              destinataire : row.id_user2,
              user:{
                id : row.user_id,
                username : row.login
              }
            }
            socket.emit('newMsg', message);
        });
      }
    });
  });

  socket.on('newMsg', function(message, destinataire){
    if(message.message === ''){
      return false;
    }
    options = {
        data: message.message,      // input as String
        passwords: password // multiple passwords possible
    };
    openpgp.encrypt(options).then(function(ciphertext){
        encrypted = ciphertext.data; // '-----BEGIN PGP MESSAGE ... END PGP MESSAGE-----'
        message.user = me;
        message.date = Date.now();
        connection.query('INSERT INTO messages SET id_user = ?, texte = ?, date = ?, id_user2 = ?', [
          message.user.id,
          encrypted,
          new Date(message.date),
          message.destinataire
        ], function(err){
            if(err){
              socket.emit('error', err);
            }
            io.sockets.emit('newMsg', message, destinataire);
          }
        )
    });
  });

  socket.on('disconnect', function(){
    if(!me){
      return false;
    }
    delete users[me.id];
    io.sockets.emit('disusr', me);
  });*/
