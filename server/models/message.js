const mongoose = require('mongoose');

const MessageSchema = mongoose.Schema({
    message:{ 
        type:String
    },
    name:{
        type:String
    },
    eventtype:{
        type:String
    },
    roomname:{
        type:String
    },
    otherdetails:{
        type:String
    }
});

const Message = module.exports = mongoose.model('Message',MessageSchema);