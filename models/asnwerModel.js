var mongoose = require('mongoose');
var Schema   = mongoose.Schema;

var asnwerSchema = new Schema({
	'description' : String,
	'qid' : {
	 	type: Schema.Types.ObjectId,
	 	ref: 'question'
	},
	'uid' : {
	 	type: Schema.Types.ObjectId,
	 	ref: 'user'
	},
	'chosen' : Boolean,
	'datetime' : Date,
	'comments': Array

});

module.exports = mongoose.model('asnwer', asnwerSchema);
