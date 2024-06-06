import mongoose from 'mongoose'

const messageSchema = mongoose.Schema({
    sender:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"User"
    },
    messageType: {
        type: String,
        required: true
    },
    content:{
        type:String,
        trim:true
    },
    fileName:{
        type:String,
        trim:true
    },
    chat:{
        type:mongoose.Schema.Types.ObjectId,
        ref:'Chat'
    },
    readBy:[
        {type:mongoose.Schema.Types.ObjectId,ref:"User"}
    ]

})

const Message = mongoose.model('Message',messageSchema)
export default Message;