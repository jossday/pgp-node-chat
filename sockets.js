var app = require('./app');
var Message = require('./models/message');
var sockets = {};

/*-----OpenPGP-------*/
var openpgp = require('openpgp'); // use as CommonJS, AMD, ES6 module or via window.openpgp
openpgp.initWorker({ path:'openpgp.worker.js' }) // set the relative web worker path
openpgp.config.aead_protect = true // activate fast AES-GCM mode (experimental)
var options, encrypted;
var password = '';

sockets.init = function (server) {
    //Socket.io setup
    io = require('socket.io').listen(server);
    var users = {};

    io.sockets.on('connection', function (socket) {
      var me = false;

      for(var k in users){
        socket.emit('already', users[k]);
      }
      //User logged
      socket.on('logged', function(id, user, pass){
        me = {};
        me.id = id;
        me.username = user;
        password = pass;
        users[me.id] = me;
        io.sockets.emit('online', id, user);
      });

      //Load messages
      socket.on('loadMsg', function(emetteur, destinataire){
        /*Message.remove({}, function(err) {
           console.log('collection removed');
        });*/
        Message.find(
          {
            $or: [
              { $and: [{'id_user' : emetteur}, {'id_user2' : destinataire}]},
              { $and: [{'id_user' : destinataire}, {'id_user2' : emetteur}]}
            ]
          }, function(err, messages){
            if(messages.length == 0){
              socket.emit('newMsg', 'Aucun message');
            }
            else{
              for(var k in messages){
                options = {
                    message: openpgp.message.readArmored(messages[k].texte), // parse armored message
                    password: password                         // decrypt with password
                };
                openpgp.decrypt(options).then(function(plaintext) {
                  var decrypted = plaintext.data;
                  messages[k].texte = decrypted;
                  socket.emit('newMsg', messages);
                });
              }
            }
        });
      });

      //New messages
      socket.on('newMsg', function(message, destinataire){
        options = {
            data: message,      // input as String
            passwords: password // multiple passwords possible
        };
        openpgp.encrypt(options).then(function(ciphertext){
          var messages = new Message();
          messages.id_user = me.id;
          messages.username = me.username;
          messages.texte = ciphertext.data;
          messages.date = new Date();
          messages.id_user2 = destinataire;

          // save the user
          messages.save(function(err) {
              if (err){
                  console.log('Error in Saving message: '+err);
                  throw err;
              }
              else{
                options = {
                    message: openpgp.message.readArmored(messages.texte), // parse armored message
                    password: password                         // decrypt with password
                };
                openpgp.decrypt(options).then(function(plaintext) {
                  var decrypted = plaintext.data;
                  messages.texte = decrypted;
                  io.sockets.emit('newMsg', messages);
                });

              }
          });
        });
      });
      //User disconnect
      socket.on('disconnect', function(){
        if(!me){
          return false;
        }
        delete users[me.id];
        io.sockets.emit('disusr', me);
      });

    });

}

module.exports = sockets;
