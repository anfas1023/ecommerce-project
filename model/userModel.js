const mongoose=require('mongoose')

const userSchema=new mongoose.Schema({
    username:{
        type:String,
        required:true
    },
    email:{
        type:String,
        required:true,
    },
    password:{
        type:String,
        required:true
    },
    otp:{
        type:Number,
        required:false
    },
    phone:{
        type:String,
        required:true

    },
    isBlocked:{
        type:Boolean,
        default:false,
    },
    blockedBy:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}]
});

module.exports=mongoose.model("User",userSchema,'users')