const express = require("express");;
const admin_route = express();
const session = require("express-session");
const config = require("../config/config");
const path = require("path");


const nocache = require('nocache')  // cache blocking

admin_route.use(session({
    secret: config.sessionSecrets,
    saveUninitialized: false,
    resave: false
}));

admin_route.use(nocache())

admin_route.use(express.json());
admin_route.use(express.urlencoded({ extended: true }));

const adminController = require('../controllers/adminController');

admin_route.set('views','./views/admin');

//add image
const multer = require("multer");

admin_route.use(express.static('public'));

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, path.join(__dirname, '../public/productImages'));
    },
    filename: function (req, file, cb) {
        const name = Date.now() + '-' + file.originalname;
        cb(null, name);
    }
});

const upload = multer({ storage: storage });

const verifyAdmin = require('../middleware/adminConfirm');


admin_route.get('/',verifyAdmin.isLogout,adminController.loadLogin);
admin_route.post('/',adminController.verifyLogin);
admin_route.get('/home',verifyAdmin.isLogin,adminController.loadAdminHome);
admin_route.get('/logout',verifyAdmin.isLogin,adminController.adminLogout);

admin_route.get('/register',verifyAdmin.isLogout,adminController.loadRegister);
admin_route.post('/register',adminController.insertAdmin);

admin_route.get('/products',verifyAdmin.isLogin,adminController.loadProductsManagement);
admin_route.get('/addproduct',verifyAdmin.isLogin,adminController.addProductLoad);
admin_route.post('/addproduct',upload.array('image',4),adminController.insertProduct);
admin_route.get('/editproduct',verifyAdmin.isLogin,adminController.editProduct);
admin_route.post('/editproduct',upload.single('image'),adminController.updateProduct);
admin_route.get('/deleteproduct',verifyAdmin.isLogin,adminController.deleteProduct);
admin_route.get('/restoreproduct',verifyAdmin.isLogin,adminController.restoreProduct);

admin_route.get('/category',verifyAdmin.isLogin,adminController.loadCategory);
admin_route.get('/addcategory',verifyAdmin.isLogin,adminController.addCategoryLoad);
admin_route.post('/addcategory',adminController.insertCategory);
admin_route.get('/editcategory',verifyAdmin.isLogin,adminController.editCategory);
admin_route.post('/editcategory',adminController.updateCategory);
admin_route.get('/deletecategory',verifyAdmin.isLogin,adminController.deleteCategory);
admin_route.get('/restorecategory',verifyAdmin.isLogin,adminController.restoreCategory)

admin_route.get('/banner',verifyAdmin.isLogin,adminController.loadBanner);
admin_route.get('/addbanner',verifyAdmin.isLogin,adminController.addBanner);
admin_route.post('/addbanner',upload.single('image'),adminController.insertBanner);
admin_route.get('/editbanner',verifyAdmin.isLogin,adminController.editBanner);
admin_route.post('/editbanner',upload.single('image'),adminController.updateBanner);
admin_route.get('/deletebanner',verifyAdmin.isLogin,adminController.deleteBanner);

admin_route.get('/users',verifyAdmin.isLogin,adminController.loadUserManagement);
admin_route.get('/blockuser',verifyAdmin.isLogin,adminController.blockUser);
admin_route.get('/unblockuser',verifyAdmin.isLogin,adminController.unBlockUser);

admin_route.get('/orders',verifyAdmin.isLogin,adminController.loadUserOrders);
admin_route.get('/viewproducts',verifyAdmin.isLogin,adminController.viewOrderedProducts);
admin_route.get('/changestatus',verifyAdmin.isLogin,adminController.cancelOrder);

admin_route.get('/coupons',verifyAdmin.isLogin,adminController.couponManagement);
admin_route.get('/addcoupon',verifyAdmin.isLogin,adminController.addCoupon);
admin_route.post('/addcoupon',adminController.insertCoupon);
admin_route.get('/deletecoupon',verifyAdmin.isLogin,adminController.deleteCoupon);
admin_route.get('/restorecoupon',verifyAdmin.isLogin,adminController.restoreCoupon);

admin_route.get('/reports',verifyAdmin.isLogin,adminController.reports);
admin_route.post('/filter',adminController.filteringOrder)



admin_route.get('/dash-bord/',verifyAdmin.isLogin,adminController.adminDashboard)

module.exports = admin_route