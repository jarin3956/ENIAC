
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Banner = require('../models/bannerModel');
const Order = require('../models/orderModel');
const Coupon = require('../models/couponModel');
const Category = require('../models/categoryModel');

const moment = require('moment');


const config = require('../config/config');

const nodemailer = require('nodemailer');
const randomstring = require("randomstring");

const bcrypt = require('bcrypt');
const { ObjectId, OrderedBulkOperation } = require('mongodb');

/*const client = require('twilio')(config.accountSid, config.authToken, {
    lazyLoading: true
});*/


function generateOTP() {
    return Math.floor(100000 + Math.random() * 900000);
}
const OTP = generateOTP();

const sendOtp = async (name, email, user_id) => {

    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: config.emailId,
                pass: config.emailPass
            }

        });

        const mailOptions = {
            from: 'jarinmeethal@gmail.com',
            to: email,
            subject: 'For Verification mail',
            html: '<p>Hii ' + name + ' This is your OTP  ' + OTP + '</p> '
        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            } else {
                console.log("Email has been send:- ", info.response);
            }
        });



    } catch (error) {
        console.log(error.message);
    }
}

const resetPasswordMail = async (name, email, token) => {
    try {
        const transporter = nodemailer.createTransport({
            host: 'smtp.gmail.com',
            port: 587,
            secure: false,
            requireTLS: true,
            auth: {
                user: config.emailId,
                pass: config.emailPass
            }
        });

        const mailOptions = {
            from: config.emailId,
            to: email,
            subject: 'For Reset password',
            html: '<p>Hii ' + name + ' please click here to <a href="https://eniacecommerce.online/forgetpassword?token=' + token + '"> Reset </a> your password.</p>'
        }
        transporter.sendMail(mailOptions, function (error, info) {
            if (error) {
                console.log(error);
            }
            else {
                console.log("Email has been sent:-", info.response);

            }
        })
    } catch (error) {
        console.log(error.message);
    }
}


const securePassword = async (password) => {

    try {
        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;
    } catch (error) {
        console.log(error.message);
    }
}

const loadRegister = async (req, res) => {

    try {
        res.render('registration', { loggedout: 1 });
    } catch (error) {
        console.log(error.message)
    }
}

const insertUser = async (req, res) => {

    try {
        const spassword = await securePassword(req.body.password);
        const checkSameEmail = await User.findOne({ email: req.body.email });
        if (checkSameEmail) {
            res.render('registration', { loggedout: 1, message: "Email already exists" });
        } else {
            const user = new User({
                name: req.body.name,
                email: req.body.email,
                mobile: req.body.mob,
                password: spassword,
                is_verified: 0,
                token: OTP
            });

            if (req.body.password === req.body.conpassword) {
                const userData = await user.save();

                if (userData) {

                    sendOtp(req.body.name, req.body.email, userData.id);

                    res.redirect('otpverify?id=' + userData._id)

                } else {

                    res.render('registration', { loggedout: 1, message: "your registration is not completed" });
                }
            } else {
                res.render('registration', { loggedout: 1, message: "password doesn't match" });
            }
        }

    } catch (error) {
        console.log(error.message);
    }
}



const loginLoad = async (req, res) => {

    try {
        res.render('login', { loggedout: 1 })
    } catch (error) {
        console.log(error.message);
    }
}

const verifyLogin = async (req, res) => {

    try {

        const email = req.body.email;
        const password = req.body.password;

        const userData = await User.findOne({ email: email });

        if (userData && userData.is_verified) {

            const passwordMatch = await bcrypt.compare(password, userData.password);

            if (userData.blocked) {
                res.render('login', { loggedout: 1, message: "User Blocked" });
            }
            else {
                if (passwordMatch) {
                    req.session.user_id = userData._id
                    res.redirect('/home');
                } else {
                    res.render('login', { loggedout: 1, message: "Email or Password is incorrect" });
                }
            }
        } else {
            res.render('login', { loggedout: 1, message: "Email or Password is incorrect" });

        }
    } catch (error) {
        console.log(error.message);
    }
}

const loadHome = async (req, res) => {
    try {

        const bannerData = await Banner.find({});
        const categoryData = await Category.find({})
        const productdata = await Product.aggregate([
            { $match: { is_deleted: false } },
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "Product"
                }
            }
        ]);
        if (req.session.user_id) {
            res.render('home', { products: productdata, banner: bannerData, category: categoryData, logged: 1 });

        }
        else {
            res.render('home', { products: productdata, banner: bannerData, category: categoryData, loggedout: 1 });

        }



    } catch (error) {
        console.log(error.message);
    }
}

const userLogout = async (req, res) => {

    try {
        req.session.destroy();
        //req.session.user_id = 0
        res.redirect('/');
    } catch (error) {
        console.log(error.message);
    }
}

const loadOtp = async (req, res) => {
    try {
        res.render('otp-verify', { loggedout: 1 });
    } catch (error) {
        console.log(error.message);
    }
}

const otpVerify = async (req, res) => {

    try {

        const enterotp = await req.body.otp;
        const userOtp = await User.findOne({
            _id: req.query.id
        })
        if (enterotp == userOtp.token) {

            const updateinfo = await User.updateOne({
                email: userOtp.email
            }, {
                $set: {
                    is_verified: 1
                }
            });
            res.redirect('/login')
        } else {
            res.render('otp-verify', { loggedout: 1, message: "invalid otp please check and retry" });
        }
    } catch (error) {
        console.log(error.message);
    }
}


const resendOtp = async (req, res) => {

    try {
        res.render('resend-otp', { loggedout: 1 })
    } catch (error) {
        console.log(error.message);
    }
}

const resendVerifyMail = async (req, res) => {

    try {
        const userData = await User.findOne({ email: req.body.email });
        if (userData) {
            sendOtp(userData.name, req.body.email, userData._id);

            const updateOtp = await User.findOneAndUpdate({ email: req.body.email }, { $set: { token: OTP } });

            if (updateOtp) {
                res.redirect('/resendotpload?id=' + userData._id + '');
            } else {
                res.render('resend-otp', { loggedout: 1, message: "error" });
            }
        } else {
            res.render('resend-otp', { loggedout: 1, message: "email not found" });
        }
    } catch (error) {
        console.log(error.message);
    }
}

const resendOtpLoad = async (req, res) => {

    try {

        const userData = await User.findOne({ _id: req.query.id });
        req.session.userData = userData
        res.render('resend-otpverify', { users: userData, loggedout: 1 });

    } catch (error) {
        console.log(error.message);
    }
}

const verifyResendOtp = async (req, res) => {

    try {
        const userData = req.session.userData

        const email = req.body.email;
        const enterotp = await req.body.otp;

        if (enterotp == userData.token) {


            const updateinfo = await User.updateOne({
                email: userData.email
            }, {
                $set: {
                    is_verified: 1
                }
            });
            res.redirect('/login')
        } else {
            res.render('otp-verify', { loggedout: 1, message: "invalid otp please check and retry" });
        }
    } catch (error) {
        console.log(error.message);
    }

}


const forgetLoad = async (req, res) => {

    try {
        res.render('forget', { loggedout: 1 });
    } catch (error) {
        console.log(error.message);
    }
}

const forgetVerify = async (req, res) => {

    try {
        const email = req.body.email;
        const userData = await User.findOne({ email: email });

        if (userData) {
            if (userData.is_verified === 0) {
                res.render('forget', { loggedout: 1, message: "Please verify your mail id" })
            } else {
                const randomString = randomstring.generate();
                const updatedData = await User.updateOne({ email: email }, { $set: { token: randomString } });
                resetPasswordMail(userData.name, userData.email, randomString);
                res.render('forget', { loggedout: 1, message: "reset password link has been sent to your registered mail id " })
            }
        } else {
            res.render('forget', { loggedout: 1, message: "User email is incorrect" })
        }
    } catch (error) {
        console.log(error.message);
    }
}

const forgetPassword = async (req, res) => {
    try {
        const token = req.query.token;
        const tokenData = await User.findOne({ token: token });

        if (tokenData) {
            res.render('forget-password', { loggedout: 1, email: tokenData.email });
        } else {
            res.render('404', { loggedout: 1, message: "Invalid token" });
        }

    } catch (error) {
        console.log(error.message);
    }
}

const resetPassword = async (req, res) => {

    try {
        const password = req.body.password;
        const conpassword = req.body.conpassword;
        const secure_Password = await securePassword(password);

        if (password === conpassword) {
            const updatedData = await User.findOneAndUpdate({ email: req.body.email }, { $set: { password: secure_Password, token: '' } });
            res.redirect('/');
        } else {
            res.render('forget-password', { loggedout: 1, message: "password doesn't match" })
        }
    } catch (error) {
        console.log(error.message);
    }

}

const changePassword = async (req, res) => {
    try {
        res.render('change-password', { logged: 1 })
    } catch (error) {
        console.log(error.message);
    }
}

const updatePassword = async (req, res) => {
    try {

        const password = req.body.password
        const conpassword = req.body.conpassword
        const secure_Password = await securePassword(password);
        if (password === conpassword) {
            const updatedData = await User.findByIdAndUpdate({ _id: req.session.user_id }, {
                $set: {
                    password: secure_Password
                }
            });
            res.redirect('/profile');
        } else {
            res.render('change-password', { logged: 1, message: "password doesn't match" });
        }
    } catch (error) {
        console.log(error.message);
    }
}

const productView = async (req, res) => {

    try {

        const productdata = await Product.aggregate([
            { $match: { _id: ObjectId(req.query.id) } },
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "Product"
                }
            }
        ])
        if (req.session.user_id) {
            res.render('product-view', { products: productdata, logged: 1 });
        } else {
            res.render('product-view', { products: productdata, loggedout: 1 });
        }
    } catch (error) {
        console.log(error.message)
    }
}




const loadProfile = async (req, res) => {

    try {
        const userData = await User.find({ _id: req.session.user_id }).lean();
        res.render('profile', { user: userData, address: userData[0].Address, logged: 1 })

    } catch (error) {
        console.log(error.message)
    }
}

const savedAddress = async (req, res) => {
    try {
        const userData = await User.find({ _id: req.session.user_id }).lean();
        res.render('saved-address', { address: userData[0].Address, logged: 1 })
    } catch (error) {
        console.log(error.message);
    }
}



const addAddressLoad = async (req, res) => {
    try {
        res.render('add-address', { logged: 1 });
    } catch (error) {
        console.log(error.message);
    }
}

const addAddress = async (req, res) => {
    try {
        const address = await User.findByIdAndUpdate({ _id: req.session.user_id }, { $addToSet: { Address: req.body } });
        res.redirect('/savedaddress');
    } catch (error) {
        console.log(error.message);
    }
}

const loadCheckOutAdd = async (req, res) => {
    try {
        res.render('add-address', { logged: 1 });
    } catch (error) {
        console.log(error.message);
    }
}

const checkoutAddAddress = async (req, res) => {
    try {
        const address = await User.findByIdAndUpdate({ _id: req.session.user_id }, { $addToSet: { Address: req.body } });
        res.redirect('/cart');
    } catch (error) {
        console.log(error.message);
    }
}


const deleteAddress = async (req, res) => {
    try {
        const id = req.query.id;
        const userData = await User.findByIdAndUpdate({ _id: req.session.user_id },
            {
                $pull: {
                    Address: { _id: id }
                }
            });
        res.redirect('/savedaddress');
    } catch (error) {
        console.log(error.message);
    }
}

const editAddress = async (req, res) => {
    try {

        const userData = await User.findOne({ _id: req.session.user_id });
        const addressData = userData.Address.filter((element) => {
            if (element._id == req.query.id) {
                return element
            }
        })
        const address = addressData[0]


        res.render("edit-address", { address, logged: 1 });
    } catch (error) {
        console.log(error.message);
    }
};

const updateAddress = async (req, res) => {
    try {
        const id = req.query.id;

        const Data = await User.findOne({ _id: req.session.user_id });

        const index = Data.Address.findIndex((val) => val._id == id);


        const userData = await User.findOneAndUpdate(
            { _id: req.session.user_id, "Address._id": id },
            {
                $set: {
                    [`Address.${index}`]: {
                        index,
                        _id: id,
                        name: req.body.name,
                        number: req.body.number,
                        house: req.body.house,
                        city: req.body.city,
                        state: req.body.state,
                        country: req.body.country,
                        pincode: req.body.pincode,
                        deliver_to: req.body.deliver_to
                    },
                },
            },
            { new: true }
        );

        res.redirect("/savedaddress");
    } catch (error) {
        console.log(error.message);
    }
};


const editProfile = async (req, res) => {

    try {
        const userData = await User.findOne({ _id: req.session.user_id });
        res.render('edit-profile', { user: userData, logged: 1 });
    } catch (error) {
        console.log(error.message);
    }
}


const updateProfile = async (req, res) => {
    try {

        const userData = await User.updateOne({ _id: req.session.user_id }, {
            $set: {
                name: req.body.name,
                email: req.body.email,
                mobile: req.body.mob
            }
        })
        res.redirect('/profile');
    } catch (error) {
        console.log(error.message);
    }
}


const addToCart = async (req, res) => {
    try {

        const cartData = await User.updateOne({ _id: req.session.user_id }, {
            $addToSet: {
                cart: { productId: ObjectId(req.query.id) }
            }
        });
        res.redirect('/home');

    } catch (error) {
        console.log(error.message);
    }
}


const loadCart = async (req, res) => {

    try {

        const cartData = await User.aggregate([
            { $match: { _id: ObjectId(req.session.user_id) } },
            {

                $lookup: {
                    from: "products",
                    localField: 'cart.productId',
                    foreignField: '_id',
                    as: 'Cart'
                }
            }
        ]);
        const cartProducts = cartData[0].Cart
        let subtotal = 0;
        cartProducts.forEach((cartProduct) => {
            subtotal = subtotal + cartProduct.price;
        });

        const length = cartProducts.length

        res.render('cart', { cartProducts, subtotal, length, logged: 1 });
    } catch (error) {
        console.log(error.message);
    }
}


const removeCartProduct = async (req, res) => {
    try {
        const result = await User.findByIdAndUpdate({ _id: req.session.user_id }, {
            $pull: {
                cart: { productId: req.params.id }
            }
        });
        res.json("success")
    } catch (error) {
        console.log(error.message);
    }
}


let grandTotal;

const checkoutOrder = async (req, res) => {
    try {
        const address = await User.find({ _id: req.session.user_id }).lean();

        const cartData = await User.aggregate([
            { $match: { _id: ObjectId(req.session.user_id) } },
            {

                $lookup: {
                    from: "products",
                    localField: 'cart.productId',
                    foreignField: '_id',
                    as: 'Cartproduct'
                }
            }
        ]);

        const couponData = await Coupon.find({
            userId: { $ne: req.session.user_id },
            status: { $ne: "Inactive" }
        }).limit(5);

        let subtotal = 0;

        grandTotal = 0;
        const cartProducts = cartData[0].Cartproduct;
        cartProducts.map((cartProduct, i) => {
            cartProduct.quantity = req.body.quantity[i];
            subtotal = subtotal + cartProduct.price * req.body.quantity[i];
            grandTotal = subtotal
        });

        
        res.render("checkout", {
            productDetails: cartData[0].Cartproduct,
            subtotal: subtotal,
            grandTotal: subtotal,
            offer: 0,
            address: address[0].Address,
            logged: 1,
            coupon: couponData
        });
    } catch (error) {
        console.log(error.message);
    }
}


const validateCoupon = async (req, res) => {
    try {
        const codeId = req.body.code

        const couponData = await Coupon.findOne({ name: codeId }).lean();

        const userData = await Coupon.findOne({ name: codeId, userId: req.session.user_id }).lean()

        if (couponData && couponData.status == "Active") {
            offerPrice = couponData.offer
            let maxDiscount = couponData.limit
            if (userData) {
                res.json("fail")
            } else {

                const CouponData = await Coupon.updateOne({ name: codeId }, { $push: { userId: req.session.user_id } })

                res.json({offerPrice,maxDiscount})


            }
        } else {
            res.json("NOT")
        }

    } catch (error) {
        console.log(error.message);
    }
}
let finalTotal = 0;
let gCoupon;
let gCouponAmount;
const placeOrder = async (req, res) => {
    try {

        let cApp = false
        const { productid, productname, payment, price, quantity, addressId, orderPrice } = req.body;
        const result = Math.random().toString(36).substring(2, 7);
        const id = Math.floor(100000 + Math.random() * 900000);
        const orderId = result + id;
        finalTotal = orderPrice
        const today = new Date()
        const singleProduct = productid.map((item, i) => ({
            id: productid[i],
            name: productname[i],
            price: price[i],
            quantity: quantity[i]
        }));

        if (req.body.coupon) {
            gCoupon = req.body.coupon
            
            const couponApplied = await Coupon.findOne({ name: req.body.coupon })
            gCouponAmount = couponApplied.offer
            let maxDiscount = couponApplied.limit
            if (gCouponAmount && orderPrice) {
                const amount = (orderPrice * gCouponAmount) / 100;
                
                if (amount >= maxDiscount) {
                    finalTotal = orderPrice - maxDiscount;
                }else{
                    finalTotal = orderPrice - amount;
                }


                cApp = true;

            } else {
                finalTotal = orderPrice

            }
        }

        const couponDiscount = orderPrice - finalTotal
        

        let data = {
            userId: ObjectId(req.session.user_id),
            orderId: orderId,
            date: today,
            addressId: addressId,
            product: singleProduct,
            payment_method: String(payment),
            orderPrice: Number(finalTotal),
            productPrice: Number(orderPrice),
            couponDiscount: couponDiscount,
            coupon_app: cApp ? "Active" : "Inactive"

        };

        const orderPlacement = await Order.insertMany(data);


        const clearCart = await User.updateOne({ _id: req.session.user_id }, {
            $set: {
                cart: []
            }
        })
        quantity.map(async (item, i) => {
            const reduceStock = await Product.updateOne({ _id: ObjectId(productid[i]) }, {
                $inc: {
                    stock: -Number(item)
                }
            })
        })
        if (orderPlacement && clearCart) {
            res.json("success")
        } else {
            const handlePlacementissue = await Order.deleteMany({ orderId: orderId, });
            res.json("try again")
        }
    } catch (error) {
        console.log(error.message);
    }
}

const contactUs = async (req, res) => {
    try {
        if (req.session.user_id) {
            res.render('contactus', { logged: 1 });
        }
        else {
            res.render('contactus', { loggedout: 1 });
        }
    } catch (error) {
        console.log(error.message);
    }
}


const aboutUs = async (req, res) => {
    try {
        if (req.session.user_id) {
            res.render('aboutus', { logged: 1 });
        }
        else {
            res.render('aboutus', { loggedout: 1 });
        }

    } catch (error) {
        console.log(error.message);
    }
}

const loadMyOrders = async (req, res) => {
    try {
        const orderData = await Order.find({ userId: req.session.user_id }).sort({ _id: -1 })
        const length = orderData.length
        res.render('my-orders', { myorders: orderData, logged: 1, length })
    } catch (error) {
        console.log(error.message);
    }
}

const myOrderDetails = async (req, res) => {
    try {
        const orderData = await Order.find({ _id: req.query.id });
        const theDate = orderData[0].date
        const dDate = orderData[0].delivery_date
        let oDate = moment(theDate).format('DD-MM-YYYY');
        let deliDate = moment(dDate).format('DD-MM-YYYY');



        res.render('my-orderdetails', { myorders: orderData, oDate, deliDate, logged: 1 })
    } catch (error) {
        console.log(error.message)
    }
}

const cancelReturnOrder = async (req, res) => {
    try {
        const id = req.query.id;
        const orderData = await Order.findOne({ _id: id }).lean();
        const pID=orderData.product;
        pID.forEach(async(elem,i)=>{const reduceStock=await Product.updateOne({_id:elem.id},{
              $inc:{
               stock:+elem.quantity
               }})})

        if (orderData.payment_method === "1") {
            if (orderData.status === "Delivered") {
                const returnOrder = await Order.findOneAndUpdate({ _id: id }, {

                    $set: {
                        status: "Returned"

                    }

                })
                if (returnOrder) {
                    const userData = await User.findOneAndUpdate({ _id: ObjectId(orderData.userId) },
                        { $inc: { wallet: orderData.orderPrice } }

                    )
                }
            }
            else {
                const CancelOrder = await Order.findOneAndUpdate(
                    { _id: id },
                    {
                        $set: {
                            status: "Cancelled",
                        },
                    }
                );

            }
        } else {
            if (orderData.status === "Delivered") {
                const returnOrder = await Order.findOneAndUpdate({ _id: id }, {

                    $set: {
                        status: "Returned"

                    }

                })
                if (returnOrder) {
                    const userData = await User.findOneAndUpdate({ _id: ObjectId(orderData.userId) },
                        { $inc: { wallet: orderData.orderPrice } }

                    )
                }
            }
            else {
                const CancelOrder = await Order.findOneAndUpdate(
                    { _id: id },
                    {
                        $set: {
                            status: "Cancelled",
                        },
                    }
                )
                if (CancelOrder) {
                    const userData = await User.findOneAndUpdate({ _id: ObjectId(orderData.userId) },
                        { $inc: { wallet: orderData.orderPrice } }

                    )
                }
            }
        }





        res.redirect('/myorders');
    } catch (error) {
        console.log(error.message);
    }
}


const createOdId = async (req, res) => {
    try {
        console.log("Create OrderId Request", req.body)
        var options = {
            amount: req.body.amount,  // amount in the smallest currency unit
            currency: "INR",
            receipt: "rcp1"
        };
        instance.orders.create(options, function (err, order) {
            console.log(order);
            res.send({ orderId: order.id });//EXTRACT5NG ORDER ID AND SENDING IT TO CHECKOUT
        });
    } catch (error) {
        console.log(error.message);
    }
}


const paymentVerify = async (req, res) => {
    try {
        let body = req.body.response.razorpay_order_id + "|" + req.body.response.razorpay_payment_id;

        var crypto = require("crypto");
        var expectedSignature = crypto.createHmac('sha256', config.razorPass)
            .update(body.toString())
            .digest('hex');
        // console.log("sig received ", req.body.response.razorpay_signature);
        // console.log("sig generated ", expectedSignature);
        var response = { "signatureIsValid": "false" }
        if (expectedSignature === req.body.response.razorpay_signature)
            response = { "signatureIsValid": "true" }
        res.send(response);
    } catch (error) {
        console.log(error.message);
    }
}


const searchedData = async (req, res) => {
    try {
        const data = await Product.find({ name: { $regex: new RegExp(req.body.text, 'i') } });


        console.log(data);

        const length = data.length
        if (req.session.user_id) {
            res.render('searched', { products: data, logged: 1, length });
        } else {
            res.render('searched', { products: data, loggedout: 1, length });
        }
    } catch (error) {
        console.log(error.message);
    }


}

const orderSuccess = async (req, res) => {
    try {
        const orderData = await Order.find({}).sort({ _id: -1 }).limit(1)

        const theDate = orderData[0].date

        let oDate = moment(theDate).format('DD-MM-YYYY');

        res.render('order-success', { myorders: orderData, oDate, logged: 1 })
    } catch (error) {
        console.log(error.message);
    }
}


const errorPage = async (req, res) => {
    try {
        res.render('error-page');
    } catch (error) {
        console.log(error.message);
    }
}

const errorBack = async (req, res) => {
    try {
        if (req.session.user_id) {
            res.redirect('/home')
        } else if (req.session.admin_id) {
            res.redirect('/admin')
        }


    } catch (error) {
        console.log(error.message);
    }
}

module.exports = {
    loginLoad,
    loadRegister,
    insertUser,
    verifyLogin,
    loadHome,
    loadOtp,
    otpVerify,
    productView,
    userLogout,
    resendOtp,
    resendVerifyMail,
    resendOtpLoad,
    verifyResendOtp,
    forgetLoad,
    forgetVerify,
    forgetPassword,
    resetPassword,
    changePassword,
    updatePassword,
    loadProfile,
    addAddressLoad,
    addAddress,
    loadCheckOutAdd,
    checkoutAddAddress,
    deleteAddress,
    editProfile,
    updateProfile,
    loadCart,
    addToCart,
    removeCartProduct,
    checkoutOrder,
    contactUs,
    aboutUs,
    placeOrder,
    loadMyOrders,
    cancelReturnOrder,
    savedAddress,
    editAddress,
    updateAddress,
    createOdId,
    paymentVerify,
    myOrderDetails,
    searchedData,
    validateCoupon,
    orderSuccess,
    errorPage,
    errorBack

}
