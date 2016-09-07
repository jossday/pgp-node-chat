var mongoose = require('mongoose');

module.exports = mongoose.model('Message',{
	id: String,
	id_user: String,
	username: String,
	texte: String,
	date: Date,
	id_user2: String
});
