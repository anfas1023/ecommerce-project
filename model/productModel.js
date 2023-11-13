const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
    productname: {
        type: String,
        required: true,
    },
    productprice: {
        type: String,
        required: true,
    },
    productdescription: {
        type: String,
        required: true,
    },
    productcatagory: {
        type: String,
        required: true,
    },
    productstocks: {
        type: String,
        required: true,
    },
    productimage:[
        {
            filename: String,
            data: Buffer,
            contentType: String,
        }],
});

module.exports = mongoose.model("Product", productSchema);
