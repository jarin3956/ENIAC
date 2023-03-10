const mongoose = require('mongoose')
const Schema = mongoose.Schema;

ObjectId = Schema.ObjectId

const couponSchema = new Schema({
    name: {
        type: String,
        required: true
    },
    offer: {
        type: Number,
        required: true
    },
    limit: {
        type: Number,
        require:true
    },
    status: {
        type: String,
        required: true
    },
    userId: [{ type: ObjectId }]
})

module.exports = mongoose.model('Coupon', couponSchema)