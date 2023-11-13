const User=require('../model/userModel')
const Product=require('../model/productModel')
const Order=require('../model/orderModel')
const nodemailer=require("nodemailer")
const otpgenerator=require("otp-generator")
const bcrypt=require("bcrypt");
const { session } = require('passport');
const transporter=nodemailer.createTransport({
    host:"smtp.gmail.com",
    service:"gmail",
    port:465,
    secure:true,
    auth:{
        user:"anfasmuhammed936@gmail.com",
        pass:"pmal xgtb micc hrwo"
    }
});


const loginuser=(req,res)=>{
    if(req.session.userId){
      res.redirect('/home')

}else{
   res.render('login',{message:" "});
}
}

const home=async(req,res)=>{
    if(req.session.userId){
    const userId=req.session.userId

        const allproduct= await Product.find()
        res.render('home',{allproduct:allproduct,userId:userId});

    }else{
        console.log("req.session.new",req.session.new);
        res.redirect('/login');
    }

}

const loginuserpost=async(req,res)=>{
    try{

        const check=await User.findOne({email:req.body.email});
        if (!check) {
            // Handle the case where no user with the provided email is found
            res.render('login', { message: "Email not found" });
            return;
        }


        if(await bcrypt.compare(req.body.password,check.password) && check.isBlocked===false && req.body.email===check.email){
            req.session.userId = check._id;

            res.redirect('/home');

        }else{
            res.render('login',{message:"not valid email and password"});
        }

    }catch(error){
        console.log(error);
    }
}

const signup=(req,res)=>{
    if(req.session.userId){
        res.redirect('/home')
    }else{

        res.render('signup',{message:" "});
    }


}



 const signuppost= async(req,res)=>{
    const otp=otpgenerator.generate(4,{digits:true,upperCaseAlphabets:false,lowerCaseAlphabets:false,specialChars:false});

    const check=await User.findOne({email:req.body.email});

    if(check){
      return  res.render('signup',{message:"Email address already there"});
    }


    const hashpassword=await bcrypt.hash(req.body.password,10);

   const data={
    username:req.body.username,
    email:req.body.email,
    password:hashpassword,
    phone:req.body.phone,
   }

    const mailoptions={
        from:"anfasmuhammed936@gmail.com",
        to:data.email,
        subject:"OTP Message",
        text:"this is a message",
        html: otp,
    }
    const user=new User(data)
    await user.save()
    transporter.sendMail(mailoptions,(error,info)=>{
        if(error){
            console.log(error);
        }else
       console.log("email sent",info.response);
     })
     console.log("generate otp",otp);
    console.log("start")
    const update = await User.findOneAndUpdate({ email: req.body.email },{$set:{otp:otp}},{new:true});

         if (update.nModified === 1) {
            console.log('Document updated successfully:', update);
        } else {
            console.log('No document was updated.');
         }

        console.log("update", update);
      req.session.email=req.body.email
        setTimeout(async () => {
            const otpUnset = await User.findOneAndUpdate(
                { email:req.body.email },
                { $unset: { otp: 1 } },
                {new:true}
            );
            console.log("otp un set sucessfull")
        }, 30000);

        const newUser = await User.findOne({ username: data.username });

    return res.redirect('/otp');

 }


 const otpget=(req,res)=>{
    if(req.session.userId){
        res.redirect('/home');
    }else{
        res.render('otplogin',{message:" "});

    }

 }

 const resendotp=async(req,res)=>{
    const otp=otpgenerator.generate(4,{digits:true,upperCaseAlphabets:false,lowerCaseAlphabets:false,specialChars:false});
    Email=req.session.email
    const update = await User.findOneAndUpdate({ email: Email },{$set:{otp:otp}},{new:true});
    const user=await User.findOne({email:Email})
    console.log("update",update);
    const mailoptions={
        from:"anfasmuhammed936@gmail.com",
        to:user.email,
        subject:"OTP Message",
        text:"this is a message",
        html: otp,
    }

      transporter.sendMail(mailoptions,(error,info)=>{
        if(error){
            console.log(error);
        }else
       console.log("email sent",info.response);
     })


     setTimeout(async () => {
        const otpUnset = await User.findOneAndUpdate(
            { email:Email},
            { $unset: { otp: 1 } },
            {new:true}
        );
        console.log("otp un set sucessfull")
    }, 30000);
     res.redirect('/otp');


 }



const otppost = async (req, res) => {
    try {

        const email=req.session.email
        console.log("Email",email)
        const user=await User.findOne({email});
        console.log("user",user)

        if (!user) {
            // User with the provided email doesn't exist
            res.redirect('/login');
            return;
        }
        console.log("no")



        console.log("user otp",user.otp,req.body.otp);




        if (user.otp == req.body.otp) {
            console.log("okkk");
            res.redirect('/login');
        } else {
            // Incorrect OTP
            console.log("in else case")
            res.render('otplogin',{message:"in correct otp"})
        }
    } catch (error) {
        console.log("Error:", error);
        res.redirect('/login');
    }
};

// cart managment


const Cartget=async(req,res)=>{
    try{
        if(!req.session.userId){
            return res.redirect('/login');
        }
        const userid= req.session.userId
        if(!userid){
            throw new Error("there is no user Id");
        }
        const user= await User.findById(userid).populate({path:'cartitems.productId',model:'Product',});

        if(!user){
            throw new Error("cannot find the user");
        }
        console.log("user",user)
        const totalPrice = user.cartitems.reduce((acc, curr) => {
            let total= acc +parseInt(curr.productId.productprice * curr.quantity);
            console.log("total",total)
            return total;
          }, 0);
        user.totalPrice=totalPrice
        await user.save();
        res.render('cart',{userid:userid,user:user,totalPrice:totalPrice});

    }catch(error){
        console.log("error");
        console.log(error);

    }

}

// add to Cart

const addCart=async(req,res)=>{
    try{
        const userid=req.params.userid
    const productid=req.params.productid
    const product=await Product.findById(productid);
    const user=await User.findById(userid).populate(
        {path:'cartitems.productId',model:'Product'}
    );
    let quantity=1;

    console.log("productid",productid);

    if(!product || !user){
        throw new Error("Cannot find User And Product");
    }

    // const existingProduct=user.cartitems.find((items)=>{
    //     console.log("items.productId",items.productId._id);
    //     items.productId._id===productid.toString
    // });
    const existingProduct = user.cartitems.find((item) =>  item.productId._id.toString() === productid);

    if(existingProduct){
        console.log('existingProduct:',existingProduct.quantity);
        existingProduct.quantity += 1
    }
    else{
            const cartItems={
                    quantity:quantity,
                    productId:product._id,
                   }
               user.cartitems.push(cartItems);

    }
    await user.save();
   return res.redirect('/cart');


    }catch(error){
        console.log("error ocuured");

        console.log(error)

    }

}



const removecart = async (req, res) => {
    try {
        const userId = req.params.userid;
        const productId = req.params.productid;
        console.log( "userid and product id",userId,productId);
        const user = await User.findByIdAndUpdate(
            userId,
            {
                "$pull": { 'cartitems': { "productId": productId } }
            },
            { new: true }
        );

        if (!user) {
            throw new Error("User not found");
        }

        res.redirect('/cart');
    } catch (error) {
        console.error("Error:", error);
    }
}


const incrementquantity = async (req, res) => {
    try {
    //   const userid = req.params.userid;
    //   const quantity = parseInt(req.params.quantity);
    //   const productId = req.params.productid;
      const {userid,productid,quantity} = req.params
      const parsequantity = parseInt(quantity)
    //   console.log('hereeeee',typeof(parsequantity));

      const product = await Product.findById(productid);

      const user = await User.findById(userid).populate({
        path: 'cartitems.productId',
        model: 'Product'
      });


      if (!product || !user) {
        throw new Error("Cannot find user and product");
      }

      const existingProduct = user.cartitems.find((item) => item.productId._id.toString() === productid);

      if (existingProduct) {
        existingProduct.quantity=parsequantity;
        await user.save();
      }

      // Calculate the total price
      const totalPrice = user.cartitems.reduce((acc, curr) => {
        console.log( acc, curr.productId.productprice ,curr.quantity,curr.productId.productprice * curr.quantity)
        let total= acc + curr.productId.productprice * curr.quantity;

        return total;
      }, 0);



      // Update the user's cart items and total price
      const updatedUser = await User.findByIdAndUpdate(userid, {
        $set: {
          "totalPrice": totalPrice // Update the totalPrice field
        }
      });



    return  res.redirect('/cart');
    } catch (error) {
      console.error(error);
      // Handle the error and potentially send an error response to the client
    }
  };


const decrementquantity=async(req,res)=>{
    try{

        const{userid,productid,quantity}=req.params
    const parsequantity = parseInt(quantity)


    const product = await Product.findById(productid);

    const user = await User.findById(userid).populate({
        path: 'cartitems.productId',
        model: 'Product'
      });

      if (!product || !user) {
        throw new Error("Cannot find user and product");
      }

      const existingProduct = user.cartitems.find((item) => item.productId._id.toString() === productid);

      if(existingProduct){
        existingProduct.quantity=parsequantity

      }

      const totalPrice = user.cartitems.reduce((acc, curr) => {
        return acc + curr.productId.productprice * curr.quantity;
      }, 0);

      const updatedUser = await User.findByIdAndUpdate(userid, {
        $set: {
          cartitems: user.cartitems,
          "cartitems.totalPrice": totalPrice
        }
      });

      if(!updatedUser){
        throw new Error("no updateuser")
      }

      res.redirect('/cart');


    }catch(error){
        console.log("error");
    }


}
// product page

const productlist = async (req, res) => {
    try {
        const page = parseInt(req.query.page) || 1;
        const limit = parseInt(req.query.limit) || 6;
        const skip = (page - 1) * limit;

      const allproduct = await Product.find();
      const totalCount = allproduct.length;
      const totalPages = Math.ceil(totalCount / limit);

      const paginatedProducts = await Product.find()
        .skip(skip)
        .limit(limit);

      res.render('productlistgrid', { allproduct: paginatedProducts, totalPages: totalPages });
    } catch (error) {
      console.log(error);
      res.status(500).send('Internal Server Error');
    }
};


const productDetail=async(req,res)=>{
    try{
        const productId=req.params.id;

        const userid= req.session.userId
        console.log("userid",req.session.userId);
        const singleproduct=await Product.findById(productId);

        res.render('productdetailpage',{singleproduct:singleproduct,userid:userid});
    }catch(error){
        console.log(error)
    }

}

// userprofile

const userProfile=async(req,res)=>{
    if(req.session.userId){
        const userId=req.session.userId
        const user=await User.findById(userId);
        res.render('userprofile',{user:user});

    }else{
        res.redirect('/login');
    }

}

const userprofileEdit=async(req,res)=>{
    if(req.session.userId){
        const userId=req.session.userId
        const user=await User.findById(userId);
        res.render('usereditprofile',{user,user});

    }else{
        res.redirect('/login');
    }

}

const userprofilePost=async (req,res)=>{
    if(req.session.userId){
        const UserId=req.session.userId
        console.log(req.body.confirmpassword)
        const hashpassword=await bcrypt.hash(req.body.confirmpassword,10);

        const updateUserProfile={
            username:req.body.username,
            email:req.body.email,
            password:hashpassword,
            phone:req.body.phone,
        }

    const user=await User.findByIdAndUpdate(
        UserId,

        {$set:
            updateUserProfile
        },

        {new:true}
        )

        res.redirect('/userprofile')

    }else{
res.redirect("/login")

    }

}


// address managment

const addAddresGet=async(req,res)=>{
    try{
        if(req.session.userId){
            const userid=req.session.userId

            const user=await User.findById(userid);

            res.render('addaddress',{user});
        }else{
            res.redirect('/login')
        }


    }catch(error){
        console.log(error)

    }

}

const addAddressPost=async(req,res)=>{

    try{
    if(req.session.userId){
        const userId= req.session.userId;
        console.log("req.body",req.body);
       const userAddress={
        street:req.body.street,

        city:req.body.city,
        state: req.body.state,
        pincode:req.body.pincode,
        country:req.body.country,
       }

       const newAddress=await User.findByIdAndUpdate(userId,
        {
            $push:{
                'address':userAddress
            }
        },
        {new:true}
        );

        if(!newAddress){
            throw new Error("newAddress");
        }

        console.log("newAddress",newAddress);

        res.redirect('/userprofile');


    }else{
        res.redirect('/login');

    }

    }catch(error){
        console.log(error)

    }

}

const checkOutPageGet=async(req,res)=>{
    if(req.session.userId){

        const userId=req.session.userId

        const user=await User.findById(userId).populate('address');
        const product =await User.findById(userId).populate(
            {path:'cartitems.productId',model:'Product'}
        );
        if (product.cartitems.length === 0) {
          return  res.redirect('/cart');
        }

        console.log("address",user.address);
        console.log("userproduct",product.cartitems);
        console.log("product",product)
       return res.render('checkoutpage',{address:user.address,userproduct:product.cartitems,product:product});

    }else{
       return res.redirect('/login');
    }

}

const editAddress=(req,res)=>{

    const addressId=req.params.id

    const pullAddress=User.findByIdAndUpdate(addressId,)

}

//  orderManagnment

const orderManagnmentPost = async (req, res) => {
    if (req.session.userId) {
        const userId = req.session.userId;
        const addressId = req.params.addressId;
        try {
            const user = await User.findById(userId)
                .populate('address')
                .populate({
                    path: 'cartitems.productId',
                    model: 'Product'
                });
                if (!user) {
                    return res.status(404).json({ error: 'User not found' });
                }

            const address = user.address.id(addressId);
            if (!address) {
                return res.status(404).json({ error: 'Address not found' });
            }
            console.log("user",user)

            const orderProducts = user.cartitems.map((cartItem) => ({
                productId: cartItem.productId._id
            }));
            console.log("orderProductsss",orderProducts.productId);

            const totalPrice = user.totalPrice;

            const orderData = {
                user: userId,
                customerName: user.username,
                orderDate: new Date(),
                products: orderProducts,
                totalPrice: totalPrice,
                shippingAddress: {
                    street: address.street,
                    city: address.city,
                    state: address.state,
                    pincode: address.pincode,
                    country: address.country,
                },
                status: 'Pending',
            };

            const order = await Order.create(orderData);

            const productId=user.cartitems.map((user)=>{
              return user.productId._id

            })


            const cartDelete=await User.findByIdAndUpdate(userId,
                {
                    $pull:{'cartitems':{'productId':{$in: productId}}}
                },
                {new:true}

                );

                console.log("cartDelete",cartDelete);

            res.json({order});
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.redirect('/login');
    }
};

const ordersucessfull=(req,res)=>{
    res.render('ordersucessfull');
};


const ordertrackingdetail = async (req, res) => {
    if (req.session.userId) {
        const userId = req.session.userId;
        console.log('User ID:', userId);
        const orders = await Order.find({ user: userId }).populate('products.productId');

        // console.log('orders:', orders);
        res.render('ordertrackingdetail', { orders });
    } else {
        res.redirect('/login');
    }
};

const cancelOrder=async(req,res)=>{
    const orderId=req.params.id
    console.log("id",orderId);
    const order= await Order.findByIdAndUpdate(orderId,{$set:{status:"cancel"}},{new:true});
    if(!order){
        throw new Error("canno cancel the order")
    }
    res.redirect('/ordertracking');
}


















module.exports={
    loginuser,
    signup,
    signuppost,
    loginuserpost,
    otppost,
    otpget,
    resendotp,
    home,
    Cartget,
    addCart,
    removecart,
    incrementquantity,
    decrementquantity,
    productlist,
    productDetail,
    userProfile,
    userprofileEdit,
    userprofilePost,
    addAddresGet,
    addAddressPost,
    checkOutPageGet,
    editAddress,
    orderManagnmentPost,
    ordersucessfull,
    ordertrackingdetail,
    cancelOrder,
}

