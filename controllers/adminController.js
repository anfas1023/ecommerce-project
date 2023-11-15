const User=require('../model/userModel')
const Product=require('../model/productModel')
const Catagory=require('../model/categoryManagment');
const Order=require('../model/orderModel');






const adminget=(req,res)=>{
    res.render('admin',{message:" "});
}

const adminpost=(req,res)=>{
    try{
        const Email="admin@gmail.com"
        const Password="1234"
        const email=req.body.email
        const password=req.body.password

        console.log(email,password);

        if(Email===email && Password=== password){
            res.redirect('/admindashboard')
        }else{
            res.render('admin',{message:"Invalid"});
        }
    }catch(error){
        console.log(error);
    }



};

const admindashboard=(req,res)=>{
    res.render("admindashboard");
}





const userManangment=async(req,res)=>{
    try{
        let alluser= await User.find();
        let newuser=req.session.data


        if (newuser === undefined) {
            newuser = alluser;
            res.render("usermanagment", { message: " ", newuser: newuser, alluser: alluser });
          }else{
            res.render("usermanagment", { message: " ", newuser: newuser, alluser: alluser });
          }


    }catch(error){
        console.log(error)

    }
}

const userToBlock=async(req,res)=>{
    try {
        const id=req.params.id
        const block= await User.findByIdAndUpdate(id,{isBlocked:true})
        if(!block){
            res.status(400)
            throw new Error("cannot find user to block");
        }
        console.log("block",block)
        res.redirect('/usermanagment');
    } catch (error) {
        console.log(error);
    }
}


const userToUnblock=async(req,res)=>{
    try {
        const id=req.params.id
        const unBlock=await User.findByIdAndUpdate(id,{isBlocked:false})
        if(!unBlock){
            res.status(400)
            throw new Error("user cannot been Unblock")
        }
        res.redirect('/userManagment');
    } catch (error) {
        console.log(error)
    }
}

const edituserget=async(req,res)=>{
try{
    const id=req.params.id
const user=await User.findById(id)
    res.render('edituser',{user});
}catch(error){
console.log(error);
}

};

const edituserpost = async (req, res) => {
    try {
      const id = req.params.id;
      console.log("User ID:", id)
      const updateddata = {
        username: req.body.username,
        email: req.body.email,
        password: req.body.password,
        phone: req.body.phone
      };
      console.log("Updated Data:", updateddata);

      const updateindatabase = await User.findOneAndUpdate({ _id: id }, updateddata);

      if (!updateindatabase) {
        console.error("User not found or not updated.");
      }

      console.log("Updated User:", updateindatabase);
      res.redirect('/usermanagment');
    } catch (error) {
      console.error("Error:", error);

      res.status(500).send("Internal Server Error");
    }
  };

//   product managment

  const productmanagmentget=async(req,res)=>{

    const allproduct=await Product.find()
    res.render("productmanagment",{allproduct:allproduct})

  }
//   add product get

  const addproductget=async(req,res)=>{
    const catagory=await Catagory.find();
const categoryNames = catagory.map(category => category.catagoryname);
res.render('addproduct',{categoryNames,message:" "})
  }

//   add product post

  const addproduct=async(req,res)=>{
    try{
        if(!req.files){
            console.log("error ocuur wil euploadiing");
            throw new Error("no file founded")
        }
        const images = req.files.map(file => ({ filename: file.filename, data: file.buffer, type: file.mimetype }));
        const newproduct = {
            productname: req.body.productname,
            productprice: req.body.productprice,
            productdescription: req.body.productdescription,
            productstocks: req.body.productstocks,
            productcatagory: req.body.productcatagory,
            productimage:images,
        };
        const addedproduct=await Product.insertMany([newproduct]);
        return res.redirect('/productmanagment');
    }catch(error){
        console.log(error);
    }
  }

//   edit product get
const mongoose = require('mongoose');

const editproductget = async (req, res) => {
    try {
        const id = req.params.id;

        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: 'Invalid product ID' });
        }

        const product = await Product.findById(id);

        if (!product) {
            return res.status(404).json({ message: 'Product not found' });
        }

        const catagory = await Catagory.find();
        const categoryNames = catagory.map((category) => category.catagoryname);

        res.render('editproduct', { product: product, categoryNames: categoryNames });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: 'Internal Server Error' });
    }
}




//   edit product post
 // edit product post
const editproductpost = async (req, res) => {
    try {
        const id = req.params.id;
        console.log(id);
        console.log("req.files",req.files)

        // if there is no images while uploadig
        if (req.files.length===0) {
            console.log("here");
            const oldproduct=await Product.findById(id);
            const{images}=oldproduct.productimage.map((image)=>{
                return image.filename
            })

            console.log("images",images)

           const editednewproduct = {
                productname: req.body.productname,
                productprice: req.body.productprice,
                productdescription: req.body.productdescription,
                productstocks: req.body.productstocks,
                productcatagory: req.body.productcatagory,
                productimage: images,
            };

            const newproduct = await Product.findByIdAndUpdate(id, editednewproduct);
         return res.redirect('/productmanagment');
        }

        // edit a prroduct
        const images = req.files.map(file => ({ filename: file.filename, data: file.buffer, type: file.mimetype }));

        const editednewproduct = {
            productname: req.body.productname,
            productprice: req.body.productprice,
            productdescription: req.body.productdescription,
            productstocks: req.body.productstocks,
            productcatagory: req.body.productcatagory,
            productimage: images,
        };

        // Use findByIdAndUpdate and check the result
        const newproduct = await Product.findByIdAndUpdate(id,editednewproduct);

        if (!newproduct) {
            // Handle the case where the product is not found
            res.status(404).json({ message: "Product not found" });
        } else {
            console.log("Updated product:", newproduct);
          return res.redirect('/productmanagment');
        }
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Internal Server Error" });
    }
};



//   catagory managment
  const categorymanagmentget=async(req,res)=>{

    const allcatagory=await Catagory.find();
return res.render('catagorymanagment',{allcatagory:allcatagory,message:req.session.message});
  }
//    add catagory

  const addcatagory=async(req,res)=>{
    const catagory = new RegExp(req.body.catagoryname, 'i');
    const catagoryname = await Catagory.findOne({catagoryname:catagory});
    console.log("catagoryname",catagoryname);
    if (catagoryname) {
      return res.status(400).json("catagory name already exit");
    }

    // const capital=catagory.toUpperCase

      const newcatagory={
        catagoryname:req.body.catagoryname,
        catagorydescription:req.body.catagorydescription
      }
      console.log("new data");
      console.log("newcatagory",newcatagory)
      const catagorydata=await Catagory.insertMany([ newcatagory]);
      console.log(catagorydata)
     return res.redirect('/catagorymanagment');
  }
//     edit catagory
  const editcatagory = async (req, res) => {
    try {
        // const id = req.params.id;
        const id = req.body.catagoryid;
        console.log("id", id);

        const catagory = new RegExp(req.body.catagoryname, 'i');
        const catagoryname = await Catagory.findOne({catagoryname:catagory});
        console.log("catagoryname",catagoryname);
        if (catagoryname) {
          return res.status(400).json("catagory name already exit");
        }

        const updatedcatagory = {
            catagoryname: req.body.catagoryname,
            catagorydescription: req.body.catagorydescription
        }
        console.log("updated catagory", updatedcatagory);

        if (!updatedcatagory) {
            throw new Error("category not found or cannot be updated");
        }

        const newcatagory = await  Catagory.findByIdAndUpdate( id,updatedcatagory);

        if (!newcatagory) {
            throw new Error("cannot update the data");
        }


         res.redirect('/catagorymanagment');
    } catch (error) {
        console.log("error:", error);
    }
}

const orderManagnment = async (req, res) => {
    try {
        const orders = await Order.find().populate('products.productId');
        const products = orders.map(order => order.products.map(product => product.productId));

        console.log("products", products);

        res.render('ordermanagment', { orders: orders,products:products});
    } catch (error) {
        console.error(error);
        // Handle the error and send an appropriate response
        res.status(500).send('Internal Server Error');
    }
}


const statusUpdate=async(req,res)=>{
    const orderId=req.params.orderid
    const selectedStatus=req.params.selectedStatus
    console.log("req.params.selectedStatus",selectedStatus)
    console.log("orderId",orderId)
    const order = await Order.findByIdAndUpdate(orderId, { status: selectedStatus }, { new: true });

    console.log("order",order);
    res.redirect('/orderManagnment');
}






module.exports={
    adminget,
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
    statusUpdate

}