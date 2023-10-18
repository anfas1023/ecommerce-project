const express=require('express')
const app=express()
const path=require('path')
const userRoutes=require('./routes/userRoutes')
const adminRoutes=require('./routes/adminRoutes')
const mongoDBconnection=require('./config/dbConnection')
const dotenv=require('dotenv').config()
const session = require('express-session');


mongoDBconnection()


// view engine setup
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, './views'));


const port=5000

// middleware set ups

console.log(path.join(__dirname, "public"));
app.use(express.static(path.join(__dirname, "public")))
app.use(express.json())
app.use(express.urlencoded({extended:true}))
app.use(session({
    secret:"your-secret-key",
    resave: false,
    saveUninitialized: true
}))
// const nocache = (req,res,next)=> {
//     console.log('cache');
//     res.header('Cache-Control', 'private, no-cache, no-store, must-revalidate');
//     next();

// }

// app.use(nocache)



app.use('/',userRoutes);
app.use('/',adminRoutes)


app.listen(port,()=>{
    console.log(`server running at port ${port}`);
})
