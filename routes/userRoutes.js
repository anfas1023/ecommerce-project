const express=require('express')
const router=express.Router();
const passport = require('passport')
const upload=require('../middlewares/multer')
const { loginuser,
    signup,
    signuppost,
    loginuserpost,
    otppost,
    getcart,
    postcart,
    home,
}=require('../controllers/userController')

require('../middlewares/GoogleAuth')(passport)
const session=require('express-session')
router.use(session({ secret: 'your_secret_key', resave: true, saveUninitialized: true }));
router.use(passport.initialize());
router.use(passport.session());








router.get('/home',home);
router.get('/login',loginuser);
router.post('/login',loginuserpost);
router.get('/signup',signup);
router.post('/signup',signuppost);
router.post('/otp', otppost);
router.get('/cart',getcart);
router.post('/cartpost',upload.single('filename'),postcart);

router.get('/auth/google',passport.authenticate('google',{
    scope:['profile','email']
}));

router.get('/auth/google/callback',passport.authenticate('google',{
    successRedirect: '/sucess',
    failureRedirect:'/failed',
}));

router.get('/sucess',(req,res)=>{
    res.send("welcome")
})

router.get('/failure',(req,res)=>{
    res.send("error");
})



module.exports=router

