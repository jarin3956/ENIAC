
const Admin = require('../models/adminModel');
const User = require('../models/userModel');
const Product = require('../models/productModel');
const Category = require('../models/categoryModel');
const Banner = require('../models/bannerModel');
const Order = require('../models/orderModel');
const Coupon = require('../models/couponModel');

const moment = require('moment');

const bcrypt = require('bcrypt');
const { ObjectId } = require('mongodb');



const securePassword = async (password) => {

    try {

        const passwordHash = await bcrypt.hash(password, 10);
        return passwordHash;

    } catch (error) {

        console.log(error.message)
    }
}

const loadLogin = async (req, res) => {

    try {

        res.render('login', { noNav: 1 });

    } catch (error) {
        console.log(error.message);
    }
}


const verifyLogin = async (req, res) => {

    try {

        const email = req.body.email;
        const password = req.body.password;

        const adminData = await Admin.findOne({ email: email });

        if (adminData) {
            const passwordMatch = await bcrypt.compare(password, adminData.password);
            if (passwordMatch) {

                req.session.admin_id = adminData._id;
                //req.session.user_id = userData._id
                res.redirect('/admin/home');
            } else {
                //req.session.admin=false;
                res.render('login', { noNav: 1, message: "Email and password is incorrect" });
            }
        } else {
            //req.session.admin=false;
            res.render('login', { noNav: 1, message: "Email and password is incorrect" })
        }
    } catch (error) {
        console.log(error.message);
    }
}

const adminLogout = async (req, res) => {

    try {
        req.session.admin_id = false;
        //req.session.destroy();
        res.redirect('/admin');
    } catch (error) {
        console.log(error.message);
    }
}

const loadRegister = async (req, res) => {

    try {
        res.render('registration', { noNav: 1 });
    } catch (error) {
        console.log(error.message);
    }
}


const insertAdmin = async (req, res) => {

    try {
        const spassword = await securePassword(req.body.password);
        const admin = new Admin({
            name: req.body.name,
            email: req.body.email,
            password: spassword
        });

        const adminData = await admin.save();
        res.redirect('/admin');
    } catch (error) {
        console.log(error.message);
    }
}

const loadAdminHome = async (req, res) => {
    const months = {};
    const monthNames = [
      "Jan",
      "Feb",
      "Mar",
      "Apr",
      "May",
      "Jun",
      "Jul",
      "Aug",
      "Sep",
      "Oct",
      "Nov",
      "Dec",
    ];
  
    try {
      const orders = await Order.find({});
      orders.forEach(function (order) {
        var orderDate = new Date(order.createdAt);
        var month = monthNames[orderDate.getMonth()];
        if (!months[month]) {
          months[month] = 0;
        }
        months[month]++;
      });
  
      const result = await Order.aggregate([
        {
          $group: {
            _id: {
              month: { $month: "$createdAt" },
              year: { $year: "$createdAt" }
            },
            count: { $sum: 1 },
          },
        },
      ]);
  
      res.status(200).json({ months: months, result: result });
    } catch (err) {
      console.log(err);
      res.status(500).json({ error: "Internal server error" });
    }
  };
  
      

const loadProductsManagement = async (req, res) => {

    try {
        const productdata = await Product.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "Product"
                }
            }
        ]);

        res.render('product-management', { admin: 1, products: productdata });
    } catch (error) {
        console.log(error.message);
    }
}

const addProductLoad = async (req, res) => {

    try {
        const categoryData = await Category.find({});
        res.render('add-product', { admin: 1, category: categoryData });
    } catch (error) {
        console.log(error.message)
    }
}

const insertProduct = async (req, res) => {

    try {
        const images = req.files.map((file) => {
            return file.filename
        })
        const product = new Product({
            name: req.body.name,
            category: req.body.category,
            price: req.body.price,
            fake_price: req.body.fakeprice,
            stock: req.body.stock,
            description: req.body.description,
            image: images
        });

        const productData = await product.save();
        res.redirect('/admin/products');

    } catch (error) {
        console.log(error.message);
    }
}


const editProduct = async (req, res) => {

    try {
        const id = req.query.id
        const productData = await Product.findById({ _id: id });
        const cate = await Category.findOne({ _id: productData.category })
        const categoryData = await Category.find({});
        res.render('edit-product', { product: productData, category: categoryData, cate, admin: 1 });


    } catch (error) {
        console.log(error.message);
    }
}


const updateProduct = async (req, res) => {

    try {

        const id = req.body.id
        if (req.file) {
            const productData = await Product.findByIdAndUpdate({ _id: id }, {
                $set: {
                    name: req.body.name,
                    category: req.body.category,
                    price: req.body.price,
                    fake_price: req.body.fakeprice,
                    stock: req.body.stock,
                    description: req.body.description,
                    image: req.file.filename
                }
            });
        } else {
            const productData = await Product.findByIdAndUpdate({ _id: id }, {
                $set: {
                    name: req.body.name,
                    category: req.body.category,
                    price: req.body.price,
                    fake_price: req.body.fakeprice,
                    stock: req.body.stock,
                    description: req.body.description
                }
            });
        }

        res.redirect('/admin/products');
    } catch (error) {
        console.log(error.message);
    }
}

const deleteProduct = async (req, res) => {
    try {

        const id = req.query.id;

        const productData = await Product.findByIdAndUpdate({ _id: id }, {
            $set: {
                is_deleted: true
            }
        });
        res.redirect('/admin/products');


    } catch (error) {
        console.log(error.message)
    }
}

const restoreProduct = async (req, res) => {
    try {

        const id = req.query.id;
        const productData = await Product.findByIdAndUpdate({ _id: id }, {
            $set: {
                is_deleted: false
            }
        });
        res.redirect('/admin/products');

    } catch (error) {
        console.log(error.message);
    }
}



const loadUserManagement = async (req, res) => {

    try {
        const userData = await User.find({})
        res.render('user-management', { admin: 1, users: userData })
    } catch (error) {
        console.log(error.message);
    }
}


const blockUser = async (req, res) => {
    try {
        const id = req.query.id
        const userData = await User.findByIdAndUpdate({ _id: id }, {
            $set: {
                blocked: true
            }
        });
        res.redirect('/admin/users');
    } catch (error) {
        console.log(error.message);
    }
}

const unBlockUser = async (req, res) => {

    try {
        const id = req.query.id
        const userData = await User.findByIdAndUpdate({ _id: id }, {
            $set: {
                blocked: false
            }
        });
        res.redirect('/admin/users');
    } catch (error) {
        console.log(error.message)
    }
}



const addCategoryLoad = async (req, res) => {

    try {
        res.render('add-category', { admin: 1 });
    } catch (error) {
        console.log(error.message);
    }
}

const insertCategory = async (req, res) => {

    try {

        const checkSameName = await Category.findOne({ name: req.body.name });

        if (checkSameName) {
            res.render('add-category', { admin: 1, message: "category already exist" })
        } else {
            const category = new Category({
                name: req.body.name,
                status: "Active"
            });

            const categoryData = await category.save();
            res.redirect('/admin/category');
        }

    } catch (error) {
        console.log(error.message);
    }
}

const editCategory = async (req, res) => {

    try {
        const id = req.query.id
        const categoryData = await Category.findById({ _id: id })
        res.render('edit-category', { category: categoryData, admin: 1 });

    } catch (error) {
        console.log(error.message);
    }
}

const updateCategory = async (req, res) => {

    try {

        const name = req.body.name
        const categoryData = await Category.findByIdAndUpdate({ _id: req.body.id }, {
            $set: {
                name: name
            }
        })

        res.redirect('/admin/category');
    } catch (error) {
        console.log(error.message);
    }
}


const deleteCategory = async (req, res) => {
    try {
        const id = req.query.id;
        const categoryData = await Category.findByIdAndUpdate({ _id: id }, {
            $set: {
                status: "Inactive"
            }
        });
        res.redirect('/admin/category');


    } catch (error) {
        console.log(error.message)
    }
}

const restoreCategory = async (req, res) => {
    try {
        const id = req.query.id;
        const categoryData = await Category.findByIdAndUpdate({ _id: id }, {
            $set: {
                status: "Active"
            }
        });
        res.redirect('/admin/category');

    } catch (error) {
        console.log(error.message);
    }
}


const loadCategory = async (req, res) => {

    try {
        const categoryData = await Category.find({});
        res.render('category', { category: categoryData, admin: 1 });
    } catch (error) {
        console.log(error.message);
    }
}

const loadBanner = async (req, res) => {

    try {
        const bannerData = await Banner.find({})
        res.render('banner', { banner: bannerData, admin: 1 });
    } catch (error) {
        console.log(error.message);
    }
}

const addBanner = async (req, res) => {

    try {
        res.render('add-banner', { admin: 1 });
    } catch (error) {
        console.log(error.message);
    }
}

const insertBanner = async (req, res) => {

    try {

        const banner = new Banner({

            name: req.body.name,
            image: req.file.filename
        });

        const bannerData = await banner.save();
        res.redirect('/admin/banner');
    } catch (error) {
        console.log(error.message);
    }
}

const editBanner = async (req, res) => {

    try {
        const id = req.query.id
        const bannerData = await Banner.findById({ _id: id })
        res.render('edit-banner', { banner: bannerData, admin: 1 });

    } catch (error) {
        console.log(error.message);
    }
}

const updateBanner = async (req, res) => {

    try {
        const id = req.body.id
        if (req.file) {
            const bannerData = await Banner.findByIdAndUpdate({ _id: id }, {
                $set: {
                    name: req.body.name,
                    image: req.file.filename
                }
            });
        } else {
            const bannerData = await Banner.findByIdAndUpdate({ _id: id }, {
                $set: {
                    name: req.body.name
                }
            });
        }

        res.redirect('/admin/banner');
    } catch (error) {
        console.log(error.message);
    }
}

const deleteBanner = async (req, res) => {
    try {
        const id = req.query.id;
        const bannerData = await Banner.deleteOne({ _id: id });
        res.redirect('/admin/banner');
    } catch (error) {
        console.log(error.message);
    }
}


const loadUserOrders = async (req, res) => {
    try {
        const orderData = await Order.find({}).sort({ _id: -1 }).lean()
        res.render('user-orders', { orderData: orderData, admin: 1 });

    } catch (error) {
        console.log(error.message)
    }
}

const viewOrderedProducts = async (req, res) => {
    try {

        const orderdata = await Order.aggregate([
            { $match: { _id: ObjectId(req.query.id) } },
            {

                $lookup: {
                    from: "users",
                    localField: "userId",
                    foreignField: "_id",
                    as: "userDetails"

                }
            }])

        res.render('ordered-products', { admin: 1, order: orderdata });

    } catch (error) {
        console.log(error.message);
    }
}


const cancelOrder = async (req, res) => {
    try {
        const id = req.query.id;

        const orderData = await Order.findOne({ _id: id })
        if (orderData.status === "Processing") {
            const shipOrder = await Order.findOneAndUpdate({ _id: id }, {
                $set: {
                    status: "Shipped"
                }
            })
        } else if (orderData.status === "Shipped") {
            const deliverOrder = await Order.findOneAndUpdate({ _id: id }, {
                $set: {
                    status: "Out for Delivery"
                }
            })
        } else if (orderData.status === "Out for Delivery") {
            const deliveredDate = moment();
            const date = deliveredDate.format('dddd, MMMM Do YYYY');
            const deliverOrder = await Order.findOneAndUpdate({ _id: id }, {
                $set: {
                    status: "Delivered",
                    delivery_date: date
                }
            })
        }
        res.redirect('/admin/orders');
    } catch (error) {
        console.log(error.message)
    }
}


const couponManagement = async (req, res) => {
    try {
        const couponData = await Coupon.find({})
        res.render('coupon-management', { admin: 1, coupon: couponData });
    } catch (error) {
        console.log(error.message);
    }
}

const addCoupon = async (req, res) => {
    try {
        res.render('add-coupon', { admin: 1 });
    } catch (error) {
        console.log(error.message);
    }
}

const insertCoupon = async (req, res) => {
    try {
        const coupon = new Coupon({
            name: req.body.name,
            offer: req.body.offer,
            status: "Active"
        });
        const couponData = await coupon.save();
        if (couponData) {
            res.redirect('/admin/coupons');
        } else {
            res.render('add-coupon', { admin: 1, message: "error" });
        }
    } catch (error) {
        console.log(error.message);
    }
}


const deleteCoupon = async (req, res) => {
    try {
        const id = req.query.id;
        const couponData = await Coupon.findByIdAndUpdate({ _id: id }, {
            $set: {
                status: "Inactive"
            }
        });
        res.redirect('/admin/coupons');
    } catch (error) {
        console.log(error.message);
    }
}


const restoreCoupon = async (req, res) => {
    const id = req.query.id;
    const couponData = await Coupon.findByIdAndUpdate({ _id: id }, {
        $set: {
            status: "Active"
        }
    });
    res.redirect('/admin/coupons');

}

module.exports = {
    loadLogin,
    verifyLogin,
    loadRegister,
    insertAdmin,
    loadAdminHome,
    loadProductsManagement,
    addProductLoad,
    editProduct,
    updateProduct,
    insertProduct,
    deleteProduct,
    restoreProduct,
    loadUserManagement,
    blockUser,
    unBlockUser,
    addCategoryLoad,
    insertCategory,
    editCategory,
    updateCategory,
    deleteCategory,
    restoreCategory,
    loadCategory,
    adminLogout,
    loadBanner,
    addBanner,
    insertBanner,
    editBanner,
    updateBanner,
    deleteBanner,
    loadUserOrders,
    viewOrderedProducts,
    cancelOrder,
    couponManagement,
    addCoupon,
    insertCoupon,
    deleteCoupon,
    restoreCoupon
}
