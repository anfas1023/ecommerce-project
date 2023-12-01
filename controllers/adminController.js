const User = require("../model/userModel");
const Product = require("../model/productModel");
const Catagory = require("../model/categoryManagment");
const Order = require("../model/orderModel");
const ExcelJS = require('exceljs');
const fs = require('fs');
const path=require('path');
const Coupon=require('../model/coupenManagment');
const moment = require('moment');


const adminget = (req, res) => {
  res.render("admin", { message: " " });
};

const adminpost = (req, res) => {
  try {
    const Email = "admin@gmail.com";
    const Password = "1234";
    const email = req.body.email;
    const password = req.body.password;

    console.log(email, password);

    if (Email === email && Password === password) {
      res.redirect("/admindashboard");
    } else {
      res.render("admin", { message: "Invalid" });
    }
  } catch (error) {
    console.log(error);
  }
};

const admindashboard = async (req, res) => {
  try {

    // day
   const salestype=req.query.salestype

    let lastSevenDays = [];
    let currentDate = new Date();
    for (let i = 0; i < 7; i++) {
        let day = new Date();
        day.setDate(currentDate.getDate() - i);
        lastSevenDays.push(day.toISOString().split('T')[0]);
    }

    const ordersPerDay = await Order.aggregate([
      {
        $group: {
          _id: {
            $dateToString: { format: "%Y-%m-%d", date: "$orderDate" },
          },
          count: { $sum: 1 },
        },
      },
    ]);

    console.log("orderperday",ordersPerDay);
    const labels = lastSevenDays;
    let data=[]
    // console.log('labelsteh',labels);

    labels.forEach((label) => {
      const order = ordersPerDay.find((o) => o._id === label);
      if (order) {
        data.push(order.count);
      } else {
        data.push(0);
      }
    });

    const labelsWithoutYearAndMonth = labels.map(label => {
      const date = new Date(label);
      return date.getDate();
     });

    //  console.log("data",data,labelsWithoutYearAndMonth)

    //  day


    //  mounth


    let monthsOfCurrentYear = [];
    let currentYear = currentDate.getFullYear();

    for (let month = 1; month < 13; month++) {
        monthsOfCurrentYear.push(`${currentYear}-${month.toString().padStart(2, '0')}`);
    }

    // console.log("monthsOfCurrentYear", monthsOfCurrentYear);

    // console.log("lastSevenDays",lastSevenDays,currentDate);
     const orderPerMounth=await Order.aggregate([
      {
      $group:{
        _id: { $dateToString: { format: "%Y-%m", date: "$orderDate"} },
        count:{$sum:1}
      }
      }
     ])


// console.log("orderPerMounth",orderPerMounth)
const mountdata=[]
orderPerMounth.forEach((order)=>{
 const mounth=monthsOfCurrentYear.filter((mounth)=>{
  if(mounth===order._id){
    mountdata.push(order.count)
  }else{
    mountdata.push(0)
  }
})
})


// console.log("mountdata",mountdata,monthsOfCurrentYear);


// by year


const CurrentYear = new Date().getFullYear();

const startYear = 2019; // You can adjust this to your desired starting year


const allYears = [];
for (let year = startYear; year <= currentYear; year++) {
    allYears.push(year);
}
// console.log('Current Year:', CurrentYear);
// console.log('All Years:', allYears);


const orderPerYear=await Order.aggregate([
  {
    $group:{
      _id: { $dateToString: { format: "%Y", date: "$orderDate"} },
      count:{$sum:1}
    }
  }

]);

const orderData=[];
orderPerYear.forEach((order)=>{
  const year=allYears.filter((year)=>{
    if(year===parseInt(order._id)){
      orderData.push(order.count)
    }else{
      orderData.push(0)
    }
  })
});

const totalOrder = await Order.aggregate([
  {
    $count: 'totalCount',
  },
]);

const totalRevnue = await Order.aggregate([
  {
    $group:{
      _id:null,
      totalRevenue:{$sum:"$totalPrice"}
    }
  },
]);

const totalUser = await User.aggregate([
  {
    $count: 'totalUser',
  },
]);



const totalorder=totalOrder.map((order)=>order.totalCount)
const totalrevenue=totalRevnue.map((sum)=>sum.totalRevenue)
const totaluser =totalUser .map((user)=>user.totalUser)

// console.log("totalorder",totalOrder,totalorder,totalrevenue);

const errorMessage = req.flash('error');
console.log("errorMessage",errorMessage);

// catagory wise sales

const catagory=await Order.aggregate([
  {
    $lookup: {
      from: "products",
      localField: "products.productId",
      foreignField: "_id",
      as: "productData"
    }
  },
  {$unwind:'$productData'},
  {
    $group:{
    _id:'$productData.productcatagory',
    count:{$sum:1}
  }
}

]);

catagoryType=[];
catagoryCount=[];

catagory.forEach((c)=>{
  catagoryType.push(c._id)
  catagoryCount.push(c.count)
})

console.log("catagory",catagory,catagoryType,catagoryCount);




// console.log("orderPerYear",orderPerYear,orderData);
// console.log("lookup",order);
    res.render("admindashboard", { labelsWithoutYearAndMonth,data,mountdata,monthsOfCurrentYear,orderData,allYears,totalorder,totalrevenue,totaluser,errorMessage,salestype,catagoryType,catagoryCount});
  } catch (error) {
    console.error(error);
  }
};
// const salesReportGet=async(req,res)=>{
//   res.render('salesreport')
// }

const salesReport = async (req, res) => {
  try {
    const startDate = new Date(req.query.startDate);
    const endDate = new Date(req.query.endDate);
    // endDate.setHours(23, 59, 59, 999);
    endDate.setDate(endDate.getDate() + 1);
    console.log("start date",startDate,endDate);

    const order = await Order.aggregate([

      {
        $match:{       
        orderDate:{$gte:startDate,$lte:endDate},   
      }
    },
      {
        $lookup: {
          from: "products",
          localField: "products.productId",
          foreignField: "_id",
          as: "productData"
        }
      },
      {
        $lookup: {
          
          from: "users",
          localField: "user",
          foreignField: "_id",
          as: "userData"
        }
      },
      {
        $unwind: "$productData",
      },
      {$project:
      {
        orderId:"$_id",
       shippingAddress:{
        city:"$shippingAddress.city",
        street:"$shippingAddress.street",
        state:"$shippingAddress.state",
        country:"$shippingAddress.country",    
       },
        productDetail:{
          productName:"$productData.productname",
          price:"$productData.productprice",
        },
        totalPrice:1,
        customerName:1,
        quantity:1,
        orderDate:1,
        status:1,
      },
    }
    ]);

    // console.log("order",order)

    if (order.length === 0) {
      console.log("here")
      const errorMessage = "Please provide a valid date";
      req.flash('error', errorMessage);
      return res.redirect('/admindashboard');
    }



    const workbook = new ExcelJS.Workbook();
    const worksheet = workbook.addWorksheet('Sheet 1');
 
    // Add data to the worksheet
    worksheet.columns = [
      { header: 'Product Name', key: 'productDetail.productName', width: 20 },
      { header: 'Customer Name', key: 'customerName', width: 18 },
      { header: 'Street', key: 'shippingAddress.street', width: 15 },
      { header: 'City', key: 'shippingAddress.city', width: 15 },
      { header: 'Country', key: 'shippingAddress.country', width: 15 },
      { header: 'State', key: 'shippingAddress.state', width: 15 },
      { header: 'Status', key: 'status', width: 15 },
      { header: 'Total Price', key: 'totalPrice', width: 15 },
      { header: 'Order Date', key: 'orderDate', width: 15 },
      { header: 'Quantity', key: 'quantity', width: 15 },
    ]
 
    order.forEach((orderItem) => {
      worksheet.addRow({
        'productDetail.productName': orderItem.productDetail.productName,
        'customerName': orderItem.customerName,
        'shippingAddress.street': orderItem.shippingAddress.street,
        'shippingAddress.city': orderItem.shippingAddress.city,
        'shippingAddress.country': orderItem.shippingAddress.country,
        'shippingAddress.state': orderItem.shippingAddress.state,
        'status': orderItem.status,
        'totalPrice': orderItem.totalPrice,
        'orderDate': orderItem.orderDate,
        'quantity':orderItem.quantity,
      });
    });
    // Generate the Excel file and send it as a response
    workbook.xlsx.writeBuffer()
      .then(buffer => {
        const excelBuffer = new Buffer.from(buffer);
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename=excel.xlsx');
        res.send(excelBuffer);
      });
 
  } catch (error) {
    console.error('Error creating or sending Excel file:', error);
    res.status(500).send('Internal Server Error');
  }
 };
 




const userManangment = async (req, res) => {
  try {
    let alluser = await User.find();
    let newuser = req.session.data;

    if (newuser === undefined) {
      newuser = alluser;
      res.render("usermanagment", {
        message: " ",
        newuser: newuser,
        alluser: alluser,
      });
    } else {
      res.render("usermanagment", {
        message: " ",
        newuser: newuser,
        alluser: alluser,
      });
    }
  } catch (error) {
    console.log(error);
  }
};

const userToBlock = async (req, res) => {
  try {
    const id = req.params.id;
    const block = await User.findByIdAndUpdate(id, { isBlocked: true });
    if (!block) {
      res.status(400);
      throw new Error("cannot find user to block");
    }
    console.log("block", block);
    res.redirect("/usermanagment");
  } catch (error) {
    console.log(error);
  }
};

const userToUnblock = async (req, res) => {
  try {
    const id = req.params.id;
    const unBlock = await User.findByIdAndUpdate(id, { isBlocked: false });
    if (!unBlock) {
      res.status(400);
      throw new Error("user cannot been Unblock");
    }
    res.redirect("/userManagment");
  } catch (error) {
    console.log(error);
  }
};

const edituserget = async (req, res) => {
  try {
    const id = req.params.id;
    const user = await User.findById(id);
    res.render("edituser", { user });
  } catch (error) {
    console.log(error);
  }
};

const edituserpost = async (req, res) => {
  try {
    const id = req.params.id;
    console.log("User ID:", id);
    const updateddata = {
      username: req.body.username,
      email: req.body.email,
      password: req.body.password,
      phone: req.body.phone,
    };
    console.log("Updated Data:", updateddata);

    const updateindatabase = await User.findOneAndUpdate(
      { _id: id },
      updateddata
    );

    if (!updateindatabase) {
      console.error("User not found or not updated.");
    }

    console.log("Updated User:", updateindatabase);
    res.redirect("/usermanagment");
  } catch (error) {
    console.error("Error:", error);

    res.status(500).send("Internal Server Error");
  }
};

//   product managment

const productmanagmentget = async (req, res) => {
  const allproduct = await Product.find();
  res.render("productmanagment", { allproduct: allproduct });
};
//   add product get

const addproductget = async (req, res) => {
  const catagory = await Catagory.find();
  const categoryNames = catagory.map((category) => category.catagoryname);
  res.render("addproduct", { categoryNames, message: " " });
};

//   add product post

const addproduct = async (req, res) => {
  try {
    if (!req.files) {
      console.log("error ocuur wil euploadiing");
      throw new Error("no file founded");
    }
    const images = req.files.map((file) => ({
      filename: file.filename,
      data: file.buffer,
      type: file.mimetype,
    }));
    const newproduct = {
      productname: req.body.productname,
      productprice: req.body.productprice,
      productdescription: req.body.productdescription,
      productstocks: req.body.productstocks,
      productcatagory: req.body.productcatagory,
      productoffer:req.body.productoffer,
      productimage: images,
    };
    const addedproduct = await Product.insertMany([newproduct]);
    return res.redirect("/productmanagment");
  } catch (error) {
    console.log(error);
  }
};

//   edit product get
const mongoose = require("mongoose");
const { start } = require("repl");

const editproductget = async (req, res) => {
  try {
    const id = req.params.id;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ message: "Invalid product ID" });
    }

    const product = await Product.findById(id);

    if (!product) {
      return res.status(404).json({ message: "Product not found" });
    }

    const catagory = await Catagory.find();
    const categoryNames = catagory.map((category) => category.catagoryname);

    res.render("editproduct", {
      product: product,
      categoryNames: categoryNames,
    });
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//   edit product post
// edit product post
const editproductpost = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id);
    console.log("req.files", req.files);

    // if there is no images while uploadig
    if (req.files.length === 0) {
      console.log("here");
      const oldproduct = await Product.findById(id);
      const { images } = oldproduct.productimage.map((image) => {
        return image.filename;
      });

      console.log("images", images);

      const editednewproduct = {
        productname: req.body.productname,
        productprice: req.body.productprice,
        productdescription: req.body.productdescription,
        productstocks: req.body.productstocks,
        productcatagory: req.body.productcatagory,
        productoffer:req.body.productoffer,
        productimage: images,
      };

      const newproduct = await Product.findByIdAndUpdate(id, editednewproduct);
      return res.redirect("/productmanagment");
    }

    // edit a prroduct
    const images = req.files.map((file) => ({
      filename: file.filename,
      data: file.buffer,
      type: file.mimetype,
    }));

    const editednewproduct = {
      productname: req.body.productname,
      productprice: req.body.productprice,
      productdescription: req.body.productdescription,
      productstocks: req.body.productstocks,
      productcatagory: req.body.productcatagory,
      productimage: images,
    };

    // Use findByIdAndUpdate and check the result
    const newproduct = await Product.findByIdAndUpdate(id, editednewproduct);

    if (!newproduct) {
      // Handle the case where the product is not found
      res.status(404).json({ message: "Product not found" });
    } else {
      console.log("Updated product:", newproduct);
      return res.redirect("/productmanagment");
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Internal Server Error" });
  }
};

//   catagory managment
const categorymanagmentget = async (req, res) => {
  const allcatagory = await Catagory.find();
  return res.render("catagorymanagment", {
    allcatagory: allcatagory,
    message: req.session.message,
  });
};
//    add catagory

const addcatagory = async (req, res) => {
  const catagory = new RegExp(req.body.catagoryname, "i");
  const catagoryname = await Catagory.findOne({ catagoryname: catagory });
  console.log("catagoryname", catagoryname);
  if (catagoryname) {
    return res.status(400).json("catagory name already exit");
  }

  // const capital=catagory.toUpperCase

  const newcatagory = {
    catagoryname: req.body.catagoryname,
    catagorydescription: req.body.catagorydescription,
  };
  console.log("new data");
  console.log("newcatagory", newcatagory);
  const catagorydata = await Catagory.insertMany([newcatagory]);
  console.log(catagorydata);
  return res.redirect("/catagorymanagment");
};
//     edit catagory
const editcatagory = async (req, res) => {
  try {
    // const id = req.params.id;
    const id = req.body.catagoryid;
    console.log("id", id);

    const catagory = new RegExp(req.body.catagoryname, "i");
    const catagoryname = await Catagory.findOne({ catagoryname: catagory });
    console.log("catagoryname", catagoryname);
    if (catagoryname) {
      return res.status(400).json("catagory name already exit");
    }

    const updatedcatagory = {
      catagoryname: req.body.catagoryname,
      catagorydescription: req.body.catagorydescription,
    };
    console.log("updated catagory", updatedcatagory);

    if (!updatedcatagory) {
      throw new Error("category not found or cannot be updated");
    }

    const newcatagory = await Catagory.findByIdAndUpdate(id, updatedcatagory);

    if (!newcatagory) {
      throw new Error("cannot update the data");
    }

    res.redirect("/catagorymanagment");
  } catch (error) {
    console.log("error:", error);
  }
};

const orderManagnment = async (req, res) => {
  try {
    const orders = await Order.find().populate("products.productId");
    const products = orders.map((order) =>
      order.products.map((product) => product.productId)
    );

    res.render("ordermanagment", { orders: orders, products: products });
  } catch (error) {
    console.error(error);
    // Handle the error and send an appropriate response
    res.status(500).send("Internal Server Error");
  }
};

const statusUpdate = async (req, res) => {
  const orderId = req.params.orderid;
  const selectedStatus = req.params.selectedStatus;
  console.log("req.params.selectedStatus", selectedStatus);
  console.log("orderId", orderId);
  const order = await Order.findByIdAndUpdate(
    orderId,
    { status: selectedStatus },
    { new: true }
  );

  console.log("order", order);
  res.redirect("/orderManagnment");
};

// weekly chart

// const dailyChart=async(req,res)=>{

// }

const couponManagment=async(req,res)=>{
  try{
    const coupons=await Coupon.find()
    return res.render('coupons',{coupons})
  }catch(error){
   return res.status(500).json({message:"cannot Get the Coupon page"})
  }
  
}

const addcouponget=(req,res)=>{
 return res.render('addcoupon',{message:" "});
}

const addcouponpost= async(req,res)=>{
  try{

    const ExistingCoupon=await Coupon.findOne({couponCode:req.body.couponCode})
    if(ExistingCoupon){
      return res.render('addcoupon',{message:"Coupon Already Exits"})
    }
    // const formattedDate = moment(req.body.expirationDate).format('MM-YYYY-DD');
    // console.log("formattedDate",formattedDate)
   const newCoupon=new Coupon({
    couponCode:req.body.couponCode,
    discountAmount:req.body.discountAmount,
    expirationDate:req.body.expirationDate,
    minimumpurchase :req.body.minimumpurchase,
   });
   await newCoupon.save();

   res.redirect('/couponManagment');

  }catch(error){
   res.status(500).json({message:"Cannot add Coupon Error Occured"})
    console.log(error)
  }

}



const couponToBlock = async (req, res) => {
  try {
    const id = req.params.id;
    const block = await Coupon.findByIdAndUpdate(id, {$set:{isBlocked:true}});
    if (!block) {
      res.status(400);
      throw new Error("Coupon cannot to block");
    }
    console.log("block", block);
   return  res.redirect('/couponManagment');
  } catch (error) {
    console.log(error);
  }
};

const couponToUnblock = async (req, res) => {
  try {
    const id = req.params.id;
    console.log(id)
    const unBlock = await Coupon.findByIdAndUpdate(id, {$set:{isBlocked:false}});
    console.log(unBlock)
    if (!unBlock) {
      res.status(400);
      throw new Error("Coupon cannot been Unblock");
    }
    return  res.redirect('/couponManagment');
  } catch (error) {
    console.log(error);
  }
};

module.exports = {
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
  statusUpdate,
  salesReport,
  couponManagment,
  addcouponget,
  addcouponpost,
  couponToBlock,
  couponToUnblock,

};
