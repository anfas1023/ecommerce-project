const mongoose=require('mongoose');

const catagorySchema=new mongoose.Schema({
    catagoryname:{
    type:String,
    required:true,
},catagorydescription:{
    type:String,
    required:String,
}

})

module.exports=mongoose.model("catagory",catagorySchema);