
const mongoose = require('mongoose');
const connect = mongoose.connect('mongodb://localhost:27017/chatsstore', 
    {useNewUrlParser: true, useUnifiedTopology:true },(err)=>{
        if(err) {
            console.log('Some problem with the connection ' +err);
        } else {
            console.log('The Mongoose connection is ready');
        }
    }
    );

module.exports = connect;