const express = require("express");;
const user_route = express();
const session = require("express-session");
const config = require("../config/config");
const path = require("path");

const nocache = require('nocache')  // cache blocking

user_route.use(session({
    secret: config.sessionSecrets,
    saveUninitialized: false,
    resave: false
}));

user_route.use(nocache())

user_route.use(express.json());
user_route.use(express.urlencoded({ extended: true }));


const Razorpay = require('razorpay')
var instance = new Razorpay({ key_id: config.razorId , key_secret: config.razorPass })

const verify = require('../middleware/userConfirm');
const guestVerify = require('../middleware/guestConfirm');

const userController = require('../controllers/userController');

const wishlistController = require('../controllers/wishlistController');

const shopController = require('../controllers/shopController');

user_route.use(express.static(path.join(__dirname, 'public')));


user_route.set('views', './views/user');


user_route.get('/register', verify.isLogout, userController.loadRegister);
user_route.post('/register', userController.insertUser);
user_route.get('/', userController.loadHome);

user_route.get('/otpverify', verify.isLogout, userController.loadOtp);
user_route.post('/otpverify', userController.otpVerify);
user_route.get('/resendotp', verify.isLogout, userController.resendOtp);
user_route.post('/resendotp', userController.resendVerifyMail);
user_route.get('/resendotpload', verify.isLogout, userController.resendOtpLoad);
user_route.post('/resendotpload', userController.verifyResendOtp);

user_route.get('/forget', verify.isLogout, userController.forgetLoad);
user_route.post('/forget', userController.forgetVerify);

user_route.get('/forgetpassword', verify.isLogout, userController.forgetPassword);
user_route.post('/forgetpassword', userController.resetPassword);

user_route.get('/changepassword', verify.isLogin, userController.changePassword);
user_route.post('/changepassword', userController.updatePassword);


user_route.get('/login', verify.isLogout, userController.loginLoad);
user_route.post('/login', userController.verifyLogin);


user_route.get('/home', verify.isLogin, userController.loadHome);
user_route.get('/logout', verify.isLogin, userController.userLogout);

user_route.get('/productview', userController.productView);



user_route.get('/profile', verify.isLogin, userController.loadProfile);
user_route.get('/savedaddress', verify.isLogin, userController.savedAddress);
user_route.get('/addaddress', verify.isLogin, userController.addAddressLoad);
user_route.post('/addaddress', userController.addAddress);
user_route.get('/deleteaddress', verify.isLogin, userController.deleteAddress);
user_route.get('/editaddress', verify.isLogin, userController.editAddress);
user_route.post('/editaddress', userController.updateAddress);
user_route.get('/editprofile', verify.isLogin, userController.editProfile);
user_route.post('/editprofile', userController.updateProfile);
user_route.get('/cart', verify.isLogin, userController.loadCart);
user_route.get('/addtocart', guestVerify.isLogin, userController.addToCart);

user_route.delete('/removecartproduct/:id', verify.isLogin, userController.removeCartProduct);
user_route.delete('/removewishlistproduct/:id', verify.isLogin, wishlistController.removeWishlistProduct);
user_route.post('/proceedtocheckout', userController.checkoutOrder);
user_route.get('/checkoutaddaddress', verify.isLogin, userController.loadCheckOutAdd);
user_route.post('/checkoutaddaddress', userController.checkoutAddAddress);

user_route.post('/placeorder', userController.placeOrder);

user_route.get('/contactus', userController.contactUs);
user_route.get('/aboutus', userController.aboutUs);

user_route.get('/myorders', verify.isLogin, userController.loadMyOrders);
user_route.get('/myorderdetails', verify.isLogin, userController.myOrderDetails)

user_route.get('/cancelreturnorder', verify.isLogin, userController.cancelReturnOrder);


user_route.post('/create/orderId', verify.isLogin, userController.createOdId);

user_route.post("/api/payment/verify", verify.isLogin, userController.paymentVerify);

user_route.get('/wishlist', verify.isLogin, wishlistController.loadWishlist)
user_route.get('/addtowishlist', guestVerify.isLogin, wishlistController.addToWishlist)


user_route.get('/viewproducts', shopController.viewShopProducts)

user_route.get('/wishlisttocart', verify.isLogin, wishlistController.wishlistToCart);

user_route.get('/carttowishlist', verify.isLogin, wishlistController.cartToWishlist);

user_route.post('/search',userController.searchedData);

user_route.post('/validateCoupon',verify.isLogin,userController.validateCoupon);

user_route.get('/ordersuccess',verify.isLogin,userController.orderSuccess);

user_route.get('/404',userController.errorPage);

user_route.get('/errorback',userController.errorBack);

module.exports = user_route