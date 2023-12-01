const mongoose=require('mongoose');

const cartItemSchema = new mongoose.Schema({
    productId: {
      type: mongoose.Schema.Types.ObjectId, // Assuming each cart item is associated with a product
      ref: 'Product', // Reference to the Product model
      required: true,
    },
    quantity: {
      type: Number,
      required: true,
      default: 1, // Default quantity is 1
    },
  });

  const addressSchema = new mongoose.Schema({
    street: String,
    city: String,
    state: String,
    pincode: String,
    country: String,
    primary: {
      type: Boolean,
      default: false,
    },
  });

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
    isVerified:{
      type:Boolean,
      default:false,
    },
    blockedBy:[{type:mongoose.Schema.Types.ObjectId,ref:'User'}]
    ,

    referralCode:{
     type:String,
    },

    address:[addressSchema],

  cartitems:[cartItemSchema],
  totalPrice:{
    type:Number,
    default:0, // default totalPrice is 0
},
});



module.exports=mongoose.model("User",userSchema,'users');