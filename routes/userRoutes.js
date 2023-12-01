const express=require('express')
const router=express.Router();
const passport = require('passport')
const upload=require('../middlewares/multer')
const { loginuser,
    signup,
    signuppost,
    loginuserpost,
    otppost,
    home,
    otpget,
    resendotp,
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
}=require('../controllers/userController');

require('../middlewares/GoogleAuth')(passport)
const session=require('express-session')
router.use(session({ secret: 'your_secret_key', resave: true, saveUninitialized: true }));
router.use(passport.initialize());
router.use(passport.session());
// const userAuth=require('../middlewares/userAuth');
router.get('/home',home);
router.get('/login',loginuser);
router.post('/login',loginuserpost);
router.get('/signup',signup);
router.post('/signup',signuppost);
router.get('/otp',otpget)
router.post('/otp', otppost);
router.post('/otpresend',resendotp);

router.get('/cart',Cartget);

router.post('/addCart/:userid/:productid',addCart);
router.post('/remove/:userid/:productid', removecart);

router.post('/incrementquantity/:userid/:productid/:quantity',incrementquantity);
router.post('/decrementquantity/:userid/:productid/:quantity',decrementquantity);

router.get('/products',productlist);
router.get('/productdetail/:id',productDetail);


router.get('/userprofile',userProfile);
router.get('/userprofileedit',userprofileEdit);

router.post('/userprofileedit',userprofilePost);
router.get('/addaddress', addAddresGet);
router.post('/addaddress', addAddressPost);

router.post('/editAddress/:id',editAddress);
router.get('/editAddress/:id',editAddressget);

router.get('/checkout',checkOutPageGet);

router.post('/addorder/:addressId',orderManagnmentPost);

router.get('/ordersucessfull', ordersucessfull);
router.get('/ordertracking', ordertrackingdetail);

router.post('/cancelorder/:id',cancelOrder);
router.post('/returnorder/:id',returnOrder)


// productfiliter using catagory

router.get('/catagorylaptop', catagoryLaptop);
router.get('/catagoryprinters',catagoryPrinters)


// by price

router.post('/filiters',filiterPrice);

router.post('/razor/:addressId',orderManagnmentRazor);


// product Search


router.post('/search',searchOutProduct);


// show address

router.get('/showaddress',showAddress);

// delete adreess

router.post('/deleteaddress/:id', deleteAddress);


// coupon

router.post('/redeemCoupon',redeemCoupon)
router.post('/walletpayment/:addressId',walletPaymentPost);

// refffreal

router.post('/referralCode',referralCode);

// invoiceDownload

router.get('/downloadInvoice',downloadInvoice);

// sort product by price

router.post('/sort',sortProductByPrice);


// logout

router.get('/logout',logout)



router.get('/auth/google',passport.authenticate('google',{
    scope:['profile','email']
}));

router.get('/auth/google/callback',passport.authenticate('google',{
    failureRedirect:'/failed',
}),
function (req,res){

    console.log("sucess");
    if(req.user){
        console.log("req.user",req.user);
        req.session.new=true
     return  res.redirect('/home');

    }
  return  res.redirect('/login');

}
);

router.get('/sucess',(req,res)=>{
    res.send("welcome");
})

router.get('/failure',(req,res)=>{
    res.send("error");
})




module.exports=router

