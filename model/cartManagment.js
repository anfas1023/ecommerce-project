const mongoose=require("mongoose");

const cartSchema=new mongoose.Schema({
    cartname:{
        type:String,
        required:true
    },
    cartprice:{
        type:String,
        required:true
    },
    cartdescription:{
        type:String,
        required:true
    },
    cartcatagory:{
        type:String,
        required:true
    },
    cartstocks:{
        type:String,
        required:true
    },
    cartimage:{
        data:Buffer,
        type:String,
        filename:String,
    },
})

module.exports=mongoose.model("Cart", cartSchema);