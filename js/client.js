var startTchat;
var socket = io.connect('http://localhost:8080');
var lastmsg = false;
var current;
var history;

//Initialisation du chat et assignation d'un token de sécurité à l'utilisateur
startTchat = function(id, token){
  current = id;
  socket.emit('login', {
    id    : id,
    token : token
  });
}

//Une fois l'utilisateur actuel loggé on fait un focus sur le champ de message
socket.on('logged', function(user){
  $('#message').focus();
});

//On détecte les nouveaux arrivants en ligne et on écrit leur pseudo dans la liste des connectés
socket.on('newusr', function(user){
  if(user.id != current){
    $('#friends').append("<a href='#' class='contacts' id='"+user.id+"'>"+user.username+"</a>");
    $('#'+user.id).addClass('online');
  }
});

//On détecte la déconnexion des utilisateurs et on les efface de la liste
socket.on('disusr', function(user){
  $('#'+user.id).remove();
});

//Lorsque l'on clique sur le pseudo d'une personne en ligne la fenêtre de chat le concernant s'affiche
$('#friends').on("click", ".contacts", function(){
  var emetteur = current;
  var destinataire = $(this).closest(".contacts").attr("id");
  var username = $(this).closest(".contacts").html();
  $('#container').append('<a href="#" class="close">x</a><div class="messenger" id="'+destinataire+'"><h3>'+username+'</h3><div class="messages" id="user'+destinataire+'"></div><form action="" class="msgForm"><input type="text" class="inputMessage" placeholder="Message..."><input type="submit" value="Envoyer" id="submitMsg"></form></div>')
  $('#container').show();
  socket.emit('loadMsg', emetteur, destinataire);
});

$('#container').on("click", ".close", function(){
  $(this).closest("div").find(".messages").html("");
  $(this).closest("div").find("").hide();
});
//Récupération des messages provenant du serveur (BDD Mysql)
socket.on('newMsg', function(messages){
  if(!Array.isArray(messages)){
    messages = [messages];
  }
  for(k in messages){
    message = messages[k];
    message.h = new Date(message.date).getHours();
    message.m = new Date(message.date).getMinutes();
    if(message.destinataire != current){
      var messagerie = $('#user'+message.destinataire);
    }
    else{
      var messagerie = $('#user'+message.user.id);
    }
    if(lastmsg != message.user.id){
      messagerie.append('<div class="separator"></div>');
      lastmsg = message.user.id;
    }
    messagerie.append('<p><b>'+message.user.username+' : </b>'+message.message+message.h+':'+message.m+'</p>');
  }
  messagerie.animate({scrollTop: messagerie.prop('scrollHeight')}, 50);
});

//Lorsqu'on soumet un formulaire d'envoi de message
$('body').on("submit", ".msgForm", function(event){
  event.preventDefault();
  var msg = $(this).children('.inputMessage').val();
  var dest = $(this).closest('.messenger').attr("id");
  socket.emit('newMsg', {message : msg, destinataire : dest});
  $(this).children('.inputMessage').val('');
  $(this).children('.inputMessage').focus();
});

//Récupération des messages d'erreur
socket.on('error', function(err){
  alert(err);
});
