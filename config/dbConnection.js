// const mongoose=require('mongoose');

// const mongoDBconnection=async()=>{
//     console.log(process.env.MONGO);
    
//     try {
//         const connect=await mongoose.connect(`${process.env.MONGO}/userData`,{
//             useNewUrlParser: true,
//             useUnifiedTopology: true,
//         })
//         console.log("data base connected");

//     } catch (error) {
//         console.log(error);

//     }
// }

// module.exports=mongoDBconnection

const mongoose = require('mongoose');

const mongoDBconnection = async () => {
    console.log(process.env.MONGO);
    
    try {
        const connect = await mongoose.connect(process.env.MONGO, {
            dbName: 'userData', // Specify the database name here
            useNewUrlParser: true,
            useUnifiedTopology: true,
        });
        console.log("Database connected successfully");

    } catch (error) {
        console.log("Error connecting to the database:", error);
    }
}

module.exports = mongoDBconnection;


