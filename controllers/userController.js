const User=require('../model/userModel')
const Product=require('../model/productModel')
const Order=require('../model/orderModel');
const Coupon=require('../model/coupenManagment');
const nodemailer=require("nodemailer")
const otpgenerator=require("otp-generator")
const bcrypt=require("bcrypt");
const { session } = require('passport');
const dotenv=require('dotenv').config();
// const PDFDocument = require('pdfkit');


const fs = require('fs');
const path=require('path')
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

const Wallet=require('../model/walletManagement')

const Razorpay = require('razorpay');
const razorpay = new Razorpay({
    key_id: process.env.RAZOR_PAY_ID,
    key_secret:  process.env.RAZOR_KEY_SECRET,
});

const loginuser=(req,res)=>{
    if(req.session.userId){
       res.redirect('/home')
    }else{
        res.render('login',{message:' '})
    }
   
}


const home=async(req,res)=>{
    if(req.session.userId){
        console.log(req.session.userId);
        res.render('home');
    }else{
        res.redirect('/login')
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
            console.log(check._id,req.session.userId)

          return  res.redirect('/home');

        }else{
          return  res.render('login',{message:"not valid email and password"});
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

        // console.log("update", update);
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

        // wallet Create
        const newWallet = await Wallet.create({ userId: user._id, balance: 0 });


        // console.log("newWallet",newWallet)

             // refreal create

             const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
             let referralCode = '';
           
             for (let i = 0; i < 8; i++) {
               const randomIndex = Math.floor(Math.random() * characters.length);
               referralCode += characters.charAt(randomIndex);
             }

             const reffrealCreate=await User.findOneAndUpdate({_id:user._id},{$set:{referralCode:referralCode}})

             if(!reffrealCreate){
                throw new Error(" cannot create reffreal")
             }

             console.log("referralCode",referralCode)

             const referralcode=req.body.referralCode
             if (referralcode) {
                // Find the referred user
                const referredUser = await User.findOne({ referralCode: referralcode });
        
                if (referredUser) {
                    // Credit Rs. 50 to the referred user's wallet
                    const referredUserWallet = await Wallet.findOneAndUpdate(
                        { userId: referredUser._id },
                        { $inc: { balance: 50 } },
                        { new: true }
                    );
        
                    if (!referredUserWallet) {
                        console.log('Error updating wallet for referred user');
                    } else {
                        console.log('Wallet updated successfully for referred user:', referredUserWallet);
                    }
        
                    // Credit Rs. 50 to the new user's wallet
                    const newUserWallet = await Wallet.findOneAndUpdate(
                        { userId: user._id },
                        { $inc: { balance: 50 } },
                        { new: true }
                    );
        
                    if (!newUserWallet) {
                        console.log('Error updating wallet for new user');
                    } else {
                        console.log('Wallet updated successfully for new user:', newUserWallet);
                    }
                } else {
                    console.log('Referred user not found');
                }
            }



    return res.redirect('/otp')

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
        if(req.session.userId){

       
        const userid= req.session.userId
        if(!userid){
            throw new Error("there is no user Id");
        }
        const user= await User.findById(userid).populate({path:'cartitems.productId',model:'Product',});

        if(!user){
            throw new Error("cannot find the user");
        }
        // console.log("user",user)
        const totalPrice = user.cartitems.reduce((acc, curr) => {
            let total= acc +parseInt(curr.productId.productprice * curr.quantity);
            // console.log("total",total)
            return total;
          }, 0);
    
        
        const productOffers = user.cartitems.map((cartItem) => cartItem.productId.productoffer);
        const quantities = user.cartitems.map((cartItem) => cartItem.quantity);
        
        const totalOffer = quantities.reduce((acc, curr, index) => {
            return acc + curr * productOffers[index];
        }, 0);
        const realtotalAmount=totalPrice-totalOffer
        console.log("realtotalAmount cartget",realtotalAmount)

        user.totalPrice=realtotalAmount
        
        // console.log("Quantities:", quantities);
        // console.log("Product Offers:", productOffers);
        // console.log("Total Offer:", totalOffer);
        

     
        await user.save();
        res.render('cart',{userid:userid,user:user,realtotalAmount,totalOffer,totalPrice});
    }else{
        res.redirect('/login')
    }

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

    // console.log("productid",productid);

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
        // console.log( "userid and product id",userId,productId);
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
        // console.log( acc, curr.productId.productprice ,curr.quantity,curr.productId.productprice * curr.quantity)
        let total= acc + curr.productId.productprice * curr.quantity;

        return total;
      }, 0);



      // Update the user's cart items and total price
      

    //   console.log("updatedUser",updatedUser.totalPrice)

    const productOffers = user.cartitems.map((cartItem) => cartItem.productId.productoffer);
    const quantities = user.cartitems.map((cartItem) => cartItem.quantity);
    
    const totalOffer = quantities.reduce((acc, curr, index) => {
        return acc + curr * productOffers[index];
    }, 0);

    const realTotalAmount=totalPrice-totalOffer


    const updatedUser = await User.findByIdAndUpdate(userid, {
        $set: {
          "totalPrice": realTotalAmount // Update the totalPrice field
        }
      },{new:true});
    
    // console.log("Quantities:", quantities);
    // console.log("Product Offers:", productOffers);
    // console.log("Total Offer:", totalOffer);
    console.log("realTotalAmount increment",realTotalAmount);
    




    return  res.status(200).json({totalOffer})
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

    //   findinding totalPrice

      const totalPrice = user.cartitems.reduce((acc, curr) => {
        return acc + curr.productId.productprice * curr.quantity;
      }, 0);




    //   product offer and quantity
    const productOffers = user.cartitems.map((cartItem) => cartItem.productId.productoffer);
    const quantities = user.cartitems.map((cartItem) => cartItem.quantity);
    
    const totalOffer = quantities.reduce((acc, curr, index) => {
        return acc + curr * productOffers[index];
    }, 0);


    // setting realTotal price to the database

    const realTotalAmount=totalPrice-totalOffer

    
    const updatedUser = await User.findByIdAndUpdate(userid, {
        $set: {
          cartitems: user.cartitems,
          totalPrice: realTotalAmount
        }
      },{new:true});
      if(!updatedUser){
        throw new Error("no updateuser");
      }
    
    // console.log("Quantities:", quantities);
    // console.log("Product Offers:", productOffers);
    // console.log("Total Offer:", totalOffer);
    console.log("realTotalAmount decrement",realTotalAmount);

   return res.status(200).json({totalOffer})


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

// product filiter By ccatagory

const catagoryLaptop=async(req,res)=>{
    try{
        const catagory=req.query.catagory
        console.log(catagory)
    
        const page = parseInt(req.query.page) || 2;
        const limit = parseInt(req.query.limit) || 6;
        const skip = (page - 1) * limit;
    
        const paginatedProducts = await Product.aggregate([
            {
                $match:{
                    productcatagory:catagory
                }
            },
            {
                $project:{
                    productname:1,
                    productprice:1,
                    productimage:1,
                }
            },
        ]);
    
        const totalCount = paginatedProducts.length;
        const totalPages = Math.ceil(totalCount / limit);
        res.render('productlistgrid', { allproduct:paginatedProducts, totalPages:totalPages });
    
    }catch(error){
        console.log(error)
    }
   
}

// product filiter catatgory printers

const catagoryPrinters=async(req,res)=>{
    try{

        const printers=req.query.catagory


        const page = parseInt(req.query.page) || 2;
        const limit = parseInt(req.query.limit) || 6;
        const skip = (page - 1) * limit;
      
        const paginatedProducts=await Product.aggregate([
          {
              $match:{
                  productcatagory:printers
              }
          },
          {
              $project:{
                  productname:1,
                  productprice:1,
                  productimage:1,
              }
          },
        ]);
      
        const totalCount = paginatedProducts.length;
        const totalPages = Math.ceil(totalCount / limit);
        res.render('productlistgrid', { allproduct:paginatedProducts, totalPages:totalPages });
    }catch(error){
console.log(error)
    }
}


//  product filiter By price

const filiterPrice = async (req, res) => {
    try {
        if(req.session.userId){
            const selectedvalue = parseInt(req.body.flexRadioDefault);
            console.log("req.body",req.body);

            if (selectedvalue) {
                const ltevalue = selectedvalue + 10000;
                console.log("selectedvalue", selectedvalue, ltevalue);

                const productByPrice = await Product.find({
                    productprice: { $gte: selectedvalue, $lte: ltevalue}
                });


                console.log("productByPrice", productByPrice);

                const totalPages = 1;

                res.render("productlistgrid", { allproduct: productByPrice, totalPages: totalPages });
            } else {
                res.json({ error: "Internal server error" });
            }

        }else{
            res.redirect('/login')
        }

    } catch (error) {
        console.error("Error:", error);
        res.json({ error: "Internal server error" });
    }
};

const searchOutProduct=async(req,res)=>{
    try{
        const pattern=req.body.search
        const searchedProduct=await Product.find({productname: {$regex:pattern,$options:'i'}});
        console.log("searchedProduct",searchedProduct)
        const totalPages=1
        res.render("productlistgrid", { allproduct: searchedProduct, totalPages: totalPages });

    }catch(error){
      console.log(error)
    }


}
 
// product sort

const sortProductByPrice = async (req, res) => {


    try {
        console.log("request",req.body.sortOrder)
        if(req.body.sortOrder==="asc"){
            const sortedProducts = await Product.aggregate([
                {
                    $sort: {
                       productprice: 1 // 1 for ascending order, -1 for descending order
                    }
                }
            ]);
    
            const totalPages=1
      return  res.render("productlistgrid", { allproduct: sortedProducts, totalPages: totalPages });
        }else{
            const sortedProducts = await Product.aggregate([
                {
                    $sort: {
                       productprice: -1 // 1 for ascending order, -1 for descending order
                    }
                }
            ]);
    
            const totalPages=1
      return  res.render("productlistgrid", { allproduct: sortedProducts, totalPages: totalPages });
        }
    } catch (error) {
        console.error('Error sorting products by price:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};



// productdetail page


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
        const wallet=await Wallet.findOne({userId:userId})
        // console.log(wallet,wallet.balance)
        const walletbalance=wallet.balance
        res.render('userprofile',{user:user, walletbalance});

    }else{
        res.redirect('/login');
    }

}

const userprofileEdit=async(req,res)=>{
  try {
    if(req.session.userId){
        const userId=req.session.userId
        const user=await User.findById(userId);
        res.render('usereditprofile',{user,user});

    }else{
        res.redirect('/login');
    }
  } catch (error) {
    console.log(error)
  }
 

}

const userprofilePost=async (req,res)=>{

    try {
        
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
    } catch (error) {
        console.log(error)
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

const showAddress=async(req,res)=>{
    if(req.session.userId){

        const userId=req.session.userId

        const user=await User.findById(userId).populate('address');
        const product =await User.findById(userId).populate(
            {path:'cartitems.productId',model:'Product'}
        );
       return res.render('showaddress',{address:user.address,userproduct:product.cartitems,product:product});

    }else{
res.redirect('/login');

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
       return res.render('checkoutpage',{address:user.address,userproduct:product.cartitems,product:product});

    }else{
       return res.redirect('/login');
    }

}

const editAddressget=async(req,res)=>{
 const addressId=req.params.id;
    console.log("addressId",addressId)
    res.render("editaddress",{addressId});
}

const editAddress = async (req, res) => {
    try {
        const userId = req.session.userId;
        const addressId = req.params.id;

        const updatedAddress = await User.findOneAndUpdate(
            { _id: userId, 'address._id': addressId },
            {
                $set: {
                    'address.$.street': req.body.street,
                    'address.$.city': req.body.city,
                    'address.$.state': req.body.state,
                    'address.$.country': req.body.country,
                    'address.$.pincode': req.body.pincode,
                },
            },
            { new: true }
        );

        if (!updatedAddress) {
            return res.status(404).json({ message: 'Address not found' });
        }

        res.redirect("/userprofile")
    } catch (error) {
        console.error(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
};

// delete address

const deleteAddress = async (req, res) => {
    try {
        const userid = req.session.userId;
        const addressid = req.params.id;
        console.log("id", addressid);

        const updatedUser = await User.findOneAndUpdate(
            { _id: userid },
            {
                $pull: {
                    address: {
                        _id: addressid,
                    },
                },
            },
            { new: true }
        );


        if (!updatedUser) {

            return res.status(404).json({ message: "User not found or address not deleted" });
        }

        return res.redirect("/userprofile");
    } catch (error) {
        console.error(error);
        return res.status(500).json({ message: "Internal Server Error" });
    }
};


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


            const orderProducts = user.cartitems.map((cartItem) => ({
                productId: cartItem.productId._id
            }));
            const quantity = user.cartitems.map((cart) => {
              return cart.quantity
            });

            console.log("quantity",quantity)
           const totalPrice = req.body.couponValueApply;
           console.log("totalPrice",totalPrice)


            const orderData = {
                user: userId,
                customerName: user.username,
                products: orderProducts,
                totalPrice: totalPrice,
                shippingAddress: {
                    street: address.street,
                    city: address.city,
                    state: address.state,
                    pincode: address.pincode,
                    country: address.country,
                },
                quantity:parseInt(quantity),
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

                // console.log("cartDelete",cartDelete);

            res.json({order});
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.redirect('/login');
    }
};

// razor pay

const orderManagnmentRazor = async (req, res) => {
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


            const totalPrice = req.body.couponValueApply;

            const orderProducts = user.cartitems.map((cartItem) => ({
                productId: cartItem.productId._id
            }));

            const quantity = user.cartitems.map((cart) => {
                return cart.quantity
              });

            // Move this line after totalPrice is defined
            const orderData = {
                user: userId,
                customerName: user.username,
                products: orderProducts,  // Make sure orderProducts is defined
                totalPrice: totalPrice,
                shippingAddress: {
                    street: address.street,
                    city: address.city,
                    state: address.state,
                    pincode: address.pincode,
                    country: address.country,
                },
                quantity:parseInt(quantity),
                status: 'Pending',
            };



            const order = await Order.create(orderData);

            const productId = user.cartitems.map((user) => {
                return user.productId._id;
            });


            const cartDelete = await User.findByIdAndUpdate(userId,
                {
                    $pull: { 'cartitems': { 'productId': { $in: productId } } }
                },
                { new: true }

            );

            const options = {
                amount: totalPrice * 100, // Razorpay expects amount in paisa
                currency: 'INR',
                receipt: order._id.toString(),
                payment_capture: 1, // Automatically capture the payment when it's successful
            };

            const razorpayOrder = await razorpay.orders.create(options);



            res.json({ razorpayOrder });
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.redirect('/login');
    }
};


const walletPaymentPost = async (req, res) => {
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


            const orderProducts = user.cartitems.map((cartItem) => ({
                productId: cartItem.productId._id
            }));
            const quantity = user.cartitems.map((cart) => {
              return cart.quantity
            });

            console.log("quantity",parseInt(quantity))
           const totalPrice = req.body.couponValueApply;

        //    wallet checking
     const wallet = await Wallet.findOne({ userId: userId }).exec()
        if (!wallet) {
            return res.status(400).json({ error: 'Wallet not found for the user' });
        }
           walletBalance=wallet.balance
           console.log("totalPrice",totalPrice,walletBalance,req.session.userId);

           if (parseInt(totalPrice) > parseInt(walletBalance)) {
            console.log("totalPrice is greater than walletBalance");
            return res.status(200).json({message: 'Insufficient wallet balance' });
        }
        wallet.balance -= totalPrice;
            await wallet.save();
        

        //    ends wallet
            const orderData = {
                user: userId,
                customerName: user.username,
                products: orderProducts,
                totalPrice: totalPrice,
                shippingAddress: {
                    street: address.street,
                    city: address.city,
                    state: address.state,
                    pincode: address.pincode,
                    country: address.country,
                },
                quantity:parseInt(quantity),
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

                // console.log("cartDelete",cartDelete);
                console.log("sucesss")

            res.json({order});
        } catch (error) {
            console.error(error);
            res.status(500).json({ error: 'Internal Server Error' });
        }
    } else {
        res.redirect('/login');
    }
};

// walletPayment here

// payment deteails ends herreee

const ordersucessfull=async(req,res)=>{
    const order=await Order.find()
    res.render('ordersucessfull');
};


const ordertrackingdetail = async (req, res) => {
    if (req.session.userId) {
        const userId = req.session.userId;
        // console.log('User ID:', userId);
        const orders = await Order.find({ user: userId }).populate('products.productId').sort({orderDate:-1});

        // console.log('orders:', orders);
        res.render('ordertrackingdetail', { orders });
    } else {
        res.redirect('/login');
    }
};

const cancelOrder=async(req,res)=>{
    const orderId=req.params.id
    const userId=req.session.userId
    console.log("id",orderId,userId);
    const order= await Order.findByIdAndUpdate(orderId,{$set:{status:"cancel"}},{new:true});
    const transactionData={
        amount:order.totalPrice,
        transactionType:"credit",
        transactionDate: new Date()
    }
    const walletCredit = await Wallet.findOneAndUpdate(
       {userId: userId},
        {
            $inc: { balance: order.totalPrice },
            $push: { transactions: transactionData }
        },
        { new: true }
    );
    console.log("walletCredit",walletCredit)

    if(!walletCredit){
        throw new Error("cannot upadte the wallet")
    }

    if(!order){
        throw new Error("canno cancel the order")
    }
 return res.redirect('/ordertracking');
}

const returnOrder=async(req,res)=>{
    const orderId=req.params.id
    const userId=req.session.userId
    console.log("id",orderId);
    const order= await Order.findByIdAndUpdate(orderId,{$set:{status:"return"}},{new:true});
    if(!order){
        throw new Error("canno cancel the order");
    }

    const transactionData={
        amount:order.totalPrice,
        transactionType:"credit",
        transactionDate: new Date()
    }
    const walletCredit = await Wallet.findOneAndUpdate(
       {userId: userId},
        {
            $inc: { balance: order.totalPrice },
            $push: { transactions: transactionData }
        },
        { new: true }
    );
    console.log("walletCredit",walletCredit)

    if(!walletCredit){
        throw new Error("cannot upadte the wallet")
    }
 return  res.redirect('/ordertracking');
}
// /Wallet orderPayment




const redeemCoupon=async(req,res)=>{
    try{
        // console.log("req.body.couponCode",req.body.couponCode)
const coupon=await Coupon.findOne({couponCode:req.body.couponCode})
if(coupon){
   if(coupon.isBlocked){
    return res.json({message:"Coupon is temporaly blocked"})
   }else{
    const discountAmount=coupon.discountAmount
    const minimumpurchase=coupon.minimumpurchase
    const expirationDate=coupon.expirationDate
    return res.json({discountAmount,minimumpurchase,expirationDate})
   }
    
}else{
    res.status(400).json({message :"cannot find the coupons"})
}
    }catch(error){
        console.log(error)
    }
}


//  referral

const referralCode=async(req,res)=>{
    const userId=req.session.userId
    const referralCode=req.body.referralCode
    const exist=await User.findOne({referralCode:referralCode})
   console.log("exist",exist);
   if(exist){

    if(exist.referralCode){
        await Wallet.findOneAndUpdate({userId:exist._id},{$inc:{balance:50}});
       await Wallet.findOneAndUpdate({userId:userId},{$inc:{balance:50}});
       return res.status(200).json({message:"Reffral Applied Succesfully also 50RS credited to the Wallet "});
    }else{
     return res.json({message:"Cannot apply the refralcode it is not valid "})
    }

   }else{
    console.log("no existss")
   }
   
    
}


const PDFDocument = require('pdfkit-table');



const downloadInvoice = async (req, res) => {
    try {
        const orderId = req.query.orderId;
        const pdfDoc = new PDFDocument();
        const filePath = path.join(__dirname, 'SampleDocument.pdf');

        const order = await Order.findById(orderId).populate('products.productId');

        console.log("order", order);

        // Pipe the PDF content to a writable stream (in this case, a file)
        const writeStream = fs.createWriteStream(filePath);
        pdfDoc.pipe(writeStream);

        // Add content to the PDF
        pdfDoc.text("Invoice Details", { align: 'center' }).moveDown(1);

        // Create a table for product names
        const productTable = {
            headers: ['Product Name'],
            rows: [],
        };

        // Populate table rows with product details
        order.products.forEach((product) => {
            console.log("jkjk");
            if (product && product.productId) {
                console.log("lklk");
                productTable.rows.push([
                    product.productId.productname,
                ]);
            }
        });

        // Draw product table headers
        pdfDoc.font('Helvetica-Bold').fontSize(10);
        pdfDoc.text(productTable.headers[0], 50, 100);

        // Draw product table rows
        pdfDoc.font('Helvetica').fontSize(10);
        let y = 120;
        productTable.rows.forEach((row) => {
            pdfDoc.text(row[0], 50, y);
            y += 20;
        });

        // Add an underline after the product names
        pdfDoc.moveTo(50, y).lineTo(250, y).stroke();

        // Draw total quantity and total price
        pdfDoc.text(`Total Quantity: ${order.quantity}`, 50, y + 20);
        pdfDoc.text(`Total Price: ${order.totalPrice.toFixed(2)}`, 50, y + 40);

        // End the PDF stream
        pdfDoc.end();

        // Wait for the stream to finish writing the file
        writeStream.on('finish', () => {
            // Now, send the file as a response
            res.download(filePath, 'SampleDocument.pdf', (err) => {
                if (err) {
                    console.error('Error sending the file:', err);
                    res.status(500).send('Internal Server Error');
                }
            });
        });
    } catch (error) {
        console.error('Error generating PDF:', error);
        res.status(500).send('Internal Server Error');
    }
};

const logout=(req,res)=>{
 // Destroy the session
 req.session.destroy(err => {
    if (err) {
      return res.status(500).send('Error during logout');
    }
    res.redirect('/login');
  });
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
    catagoryLaptop,
    catagoryPrinters,
    filiterPrice,
    orderManagnmentRazor,
    editAddressget,
    searchOutProduct,
    showAddress,
    deleteAddress,
    returnOrder,
    redeemCoupon,
    walletPaymentPost,
    referralCode,
    downloadInvoice,
    sortProductByPrice,
    logout,
}
