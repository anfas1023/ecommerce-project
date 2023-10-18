const User=require('../model/userModel')
const Product=require('../model/productModel')
const Catagory=require('../model/categoryManagment')






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
    console.log(allproduct);

    res.render("productmanagment",{allproduct:allproduct})

  }
//   add product get

  const addproductget=(req,res)=>{
res.render('addproduct')
  }

//   add product post

  const addproduct=async(req,res)=>{
    try{
        if(!req.file){
            console.log("error ocuur wil euploadiing")
            throw new Error("no file founded")
        }
        const newproduct = {
            productname: req.body.productname,
            productprice: req.body.productprice,
            productdescription: req.body.productdescription,
            productstocks: req.body.productstocks,
            productcatagory: req.body.productcatagory,
            productimage: req.file.filename,
        };
        console.log(req.file.filename)
        const addedproduct=await Product.insertMany([newproduct]);
           console.log(addedproduct);
           res.redirect('/productmanagment');
    }catch(error){
        console.log(error)
    }
  }

//   edit product get

  const editproductget=async(req,res)=>{
    const id=req.params.id
    const product= await Product.findById(id)
    res.render('editproduct',{product:product});
  }

//   edit product post
  const editproductpost=async(req,res)=>{
    try{
        const id=req.params.id
        console.log(id)
        if(!req.file){
            throw new Error("cannot get the  ")
            console.log("error");
        }
        const editednewproduct={
            productname:req.body.productname,
            productprice: req.body.productprice,
            productdescription: req.body.productdescription,
            productstocks: req.body.productstocks,
            productcatagory: req.body.productcatagory,
            productimage: req.file.filename,
        }
        const newproduct= await Product.findByIdAndUpdate(id,editednewproduct)

        if(!newproduct){
            res.status(400)
            throw new Error("There is no new file is found");
        }

        console.log("newproduct",newproduct);
        res.redirect('/productmanagment');

    }catch(error){
        console.log(error)
    }

  }



  const categorymanagmentget=async(req,res)=>{

    const allcatagory=await Catagory.find()
res.render('catagorymanagment',{allcatagory:allcatagory});
  }

  const addcatagory=async(req,res)=>{
      const newcatagory={
        catagoryname:req.body.catagoryname,
        catagorydescription:req.body.catagorydescription
      }
      console.log("new data");
      console.log("newcatagory",newcatagory)
      const catagorydata=await Catagory.insertMany([ newcatagory]);
      console.log(catagorydata)
      res.redirect('/catagorymanagment');
  }

  const editcatagory = async (req, res) => {
    try {
        // const id = req.params.id;
        const id = req.body.catagoryid;
        console.log("id", id);

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

}