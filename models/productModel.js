
const mongoose = require("mongoose");

const Schema = mongoose.Schema;

ObjectId = Schema.ObjectId

const productSchema = new mongoose.Schema({

    name:{
        type:String,
        required:true
    },
    category:{
        type:ObjectId,
        required:true
    },
    fake_price:{
        type:Number,
        required:true
    },
    price:{
        type:Number,
        required:true
    },
    description:{
        type:String,
        required:true
    },
    image:{
        type:Array,
        required:true
    },
    is_deleted:{
        type:Boolean,
        default:false
    },
    stock:{
        type:Number,
        required:true
    }
});

module.exports = mongoose.model('Product',productSchema);