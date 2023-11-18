const express=require('express')
const router=express.Router();
const { adminget,
    adminpost,
    admindashboard,
    userManangment,
    userToBlock,
    userToUnblock,
    edituserget,
    edituserpost,
    productmanagmentget,
    addproductget,
    addproduct,
    editproductget,
    editproductpost,
    categorymanagmentget,
    addcatagory,
    editcatagory,
    orderManagnment,
    statusUpdate,
    salesReport,
    salesReportGet,

}=require('../controllers/adminController')
const upload=require('../middlewares/multer');

const logged=(req,res,next)=>{
    console.log("here");
    next();
}

router.get('/admin',adminget)
router.post('/admin',adminpost)
router.get('/admindashboard',admindashboard);

router.get('/usermanagment',userManangment);

router.get('/block/:id',userToBlock);
router.get('/unblock/:id', userToUnblock);

router.get('/edituser/:id',edituserget);
router.post('/edituser/:id',edituserpost);

router.get('/productmanagment',productmanagmentget);

router.get('/addproductget',addproductget)
router.post('/addproduct',upload.array('filename',5),addproduct);

router.get('/editproduct/:id',editproductget);
router.post('/editproduct/:id',upload.array('filename',5), editproductpost);






router.get('/catagorymanagment', categorymanagmentget);
router.post('/addcatagory',addcatagory);
router.post('/editcatagory/:id',editcatagory);

router.get('/orderManagnment',orderManagnment);
router.post('/statusorder/:orderid/:selectedStatus',statusUpdate);

router.get('/salesReport',salesReport);




module.exports=router