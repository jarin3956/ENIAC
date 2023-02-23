
const mongoose = require('mongoose')
const Schema = mongoose.Schema;

ObjectId = Schema.ObjectId

const orderSchema = new Schema({
    userId: {
        type: ObjectId,
        required: true
    },
    product: [
        {
            id: { type: ObjectId },
            name: { type: String },
            price: { type: Number },
            quantity: { type: Number },
            
        }

    ],
    orderId: {
        type: String,
        required: true
    },
    date: {
        type: String,
        required: true
    },
    status: {  
        type: String,
        required: true,
        default: "Processing"
    },
    delivery_date:{
        type: String
    },
    payment_method: {  
        type: String,
        required: true
    },
    addressId: {
        type: String,
        required:true
    },
    orderPrice:{
        type:Number,
        required:true
    }
    
   
}, {timestamps: true})
module.exports = mongoose.model('Order', orderSchema)