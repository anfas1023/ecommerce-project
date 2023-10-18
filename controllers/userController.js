const User=require('../model/userModel')
const Product=require('../model/productModel')
const  Cart= require('../model/cartManagment')
const nodemailer=require("nodemailer")
const otpgenerator=require("otp-generator")
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
    if(req.session.new){
      res.redirect('/home')

}else{
   res.render('login');
}
}

const home=async(req,res)=>{
    if(req.session.new){
        const allproduct= await Product.find()
        res.render('home',{allproduct:allproduct})

    }else{
        res.redirect('/login')
    }

}

const loginuserpost=async(req,res)=>{
    try{

        const check=await User.findOne({password:req.body.password});
        console.log(check)

        if( !check.password || !check.email){
            res.status(400)
            throw new Error("There is no check")
        }

        if(check.password===req.body.password && check.isBlocked===false){
            req.session.new=true
            res.redirect('/home')

        }else{
            res.redirect('/login');
        }

    }catch(error){
        console.log(error);
    }
}

const signup=(req,res)=>{
    console.log("strt");
res.render('signup')
}

 const signuppost= async(req,res)=>{

    const otp=otpgenerator.generate(6,{digits:true,upperCaseAlphabets:false,lowerCaseAlphabets:false,specialChars:false});
   const data={
    username:req.body.username,
    email:req.body.email,
    password:req.body.password,
    phone:req.body.phone,
   }
   console.log("req.body",req.body,otp);
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
       console.log("email sent",info.response)
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
        }, 10000);


  res.render('otplogin');

 }

// const signuppost = async (req, res) => {
//     const otp = otpgenerator.generate(6, { digits: true, upperCaseAlphabets: false, lowerCaseAlphabets: false, specialChars: false });

//     const data = {
//         username: req.body.username,
//         email: req.body.email,
//         password: req.body.password,
//         phone: req.body.phone,
//     };

//     console.log(req.body);

//     // Insert the data into the database
//     const user = new User(data);
//     await user.save();

//     console.log("start");

//     // Retrieve the document from the database by email
//     const existingUser = await User.findOne({ email: req.body.email });

//     if (existingUser) {
//         // Update the retrieved document with the OTP
//         existingUser.otp = otp;
//         await existingUser.save();


//         console.log('Document updated successfully:', existingUser);
//     } else {
//         console.log('No document was updated.');
//     }

//     console.log("update");

//     res.render('otplogin');
// };



const otppost = async (req, res) => {
    try {

        const email=req.session.email
        console.log("Email",email)
        const user=await User.findOne({email})
        console.log("user",user)

        if (!user) {
            // User with the provided email doesn't exist
            res.redirect('/login');
            return;
        }
        console.log("no")



        console.log("user otp",user.otp,req.body.otp)




        if (user.otp == req.body.otp) {
            console.log("okkk")
            res.redirect('/home');
        } else {
            // Incorrect OTP, redirect to login
            console.log("in else case")
            res.redirect('/login');
        }
    } catch (error) {
        console.log("Error:", error);
        res.redirect('/login');
    }
};


const getcart=async(req,res)=>{
    const cartdata=await Cart.find();
    res.render('cart',{cartdata:cartdata});
};

const postcart=async(req,res)=>{
    const productid=req.params.id;
    const product= await Product.findById(productid)
    const data=await Cart.create(product);
    res.redirect('cart')
}



module.exports={
    loginuser,
    signup,
    signuppost,
    loginuserpost,
    otppost,
    getcart,
    postcart,
    home
}

