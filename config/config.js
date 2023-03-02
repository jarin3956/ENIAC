
require('dotenv').config()
const sessionSecrets = process.env.session

const connectDb = () => {
    const mongoose = require("mongoose");
    mongoose.set('strictQuery',false);
    mongoose.connect(process.env.data_url);
}


const emailId = process.env.email_id
const emailPass = process.env.email_pass

const razorId = process.env.razor_id
const razorPass = process.env.razor_secret



module.exports = {
    sessionSecrets,
    connectDb ,
    emailId,
    emailPass,
    razorId,
    razorPass
}