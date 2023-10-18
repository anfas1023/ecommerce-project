const mongoose=require("mongoose")

const googleSchema=new mongoose.Schema(
    {
        username:{
            type:String,
            required:true
        },
        email:{
            type:String,
            required:true,
        },
        isBlocked:{
            type:Boolean,
            default:false,
        }

    }
)

module.exports=mongoose.model("googleUsers",googleSchema,'users')