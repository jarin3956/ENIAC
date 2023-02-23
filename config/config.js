
require('dotenv').config()
const sessionSecrets = process.env.session

const connectDb = () => {
    const mongoose = require("mongoose");
    mongoose.set('strictQuery',false);
    mongoose.connect(process.env.data_url+process.env.database);
}

//const accountSid = "ACc7ac0f552d53cb10f3d01f516b02324c";
//const authToken = "af639a5287cd6c56e0c746a20672f953";

module.exports = {
    sessionSecrets,
    connectDb ,
    //accountSid,
    //authToken
}