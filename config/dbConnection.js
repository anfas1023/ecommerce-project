const mongoose=require('mongoose');

const mongoDBconnection=async()=>{
    try {
        const connect=await mongoose.connect(process.env.MONGO)
        console.log("data base connected");

    } catch (error) {
        console.log(error);

    }
}

module.exports=mongoDBconnection

