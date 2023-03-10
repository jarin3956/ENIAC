
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
let orderdataFilter
let filter = false;



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
        req.session.admin_id = null;
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



    try {


        const users = await User.countDocuments({});
        const orderCount = await Order.countDocuments({});
        const productCount = await Product.countDocuments({});
        const couponCount = await Coupon.countDocuments({});


        res.render('dash', { admin: 1, users: users, orderCount: orderCount, productCount: productCount, couponCount: couponCount });

    } catch (error) {
        console.log(error.message);
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

        const orderData = await Order.find({ status: "Processing" }).sort({ _id: -1 }).lean();
        orderData.forEach(order => {
            order.dateFormatted = moment(order.date).format('DD-MM-YYYY');
        });
        res.render('user-orders', { orderData: orderData, admin: 1 });

    } catch (error) {
        console.log(error.message)
    }
}


const loadShipped = async (req, res) => {
    try {
        const orderData = await Order.find({ status: "Shipped" }).sort({ _id: -1 }).lean();
        orderData.forEach(order => {
            order.dateFormatted = moment(order.date).format('DD-MM-YYYY');
        });
        res.render('user-orders', { orderData: orderData, admin: 1 });
    } catch (error) {
        console.log(error.message);
    }
}

const outForDelivery = async (req, res) => {
    try {
        const orderData = await Order.find({ status: "Out for Delivery" }).sort({ _id: -1 }).lean();
        orderData.forEach(order => {
            order.dateFormatted = moment(order.date).format('DD-MM-YYYY');
        });
        res.render('user-orders', { orderData: orderData, admin: 1 });
    } catch (error) {
        console.log(error.message);
    }
}

const loadDelivered = async (req, res) => {
    try {
        const orderData = await Order.find({ status: "Delivered" }).sort({ _id: -1 }).lean();
        orderData.forEach(order => {
            order.dateFormatted = moment(order.date).format('DD-MM-YYYY');
        });
        res.render('cancel-returns', { orderData: orderData, admin: 1 });
    } catch (error) {
        console.log(error.message);
    }
}

const loadCancelled = async (req, res) => {
    try {
        const orderData = await Order.find({ status: "Cancelled" }).sort({ _id: -1 }).lean();
        orderData.forEach(order => {
            order.dateFormatted = moment(order.date).format('DD-MM-YYYY');
        });
        res.render('cancel-returns', { orderData: orderData, admin: 1 });
    } catch (error) {
        console.log(error.message);
    }
}

const loadReturns = async (req, res) => {
    try {

        const orderData = await Order.find({ status: "Returned" }).sort({ _id: -1 }).lean();
        orderData.forEach(order => {
            order.dateFormatted = moment(order.date).format('DD-MM-YYYY');
        });
        res.render('cancel-returns', { orderData: orderData, admin: 1 });


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

            orderdata.forEach(order => {
                order.dateFormatted = moment(order.date).format('DD-MM-YYYY');
            });    

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
            res.redirect('/admin/orders');
        } else if (orderData.status === "Shipped") {
            const deliverOrder = await Order.findOneAndUpdate({ _id: id }, {
                $set: {
                    status: "Out for Delivery"
                }
            })
            res.redirect('/admin/shipped');
        } else if (orderData.status === "Out for Delivery") {
            const deliveredDate = new Date()
            const date = deliveredDate
            const deliverOrder = await Order.findOneAndUpdate({ _id: id }, {
                $set: {
                    status: "Delivered",
                    delivery_date: date
                }
            })
            res.redirect('/admin/outfordelivery');
        }

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

        const checkSameCoupon = await Coupon.findOne({ name: req.body.name });
        if (checkSameCoupon) {
            res.render('add-coupon', { admin: 1, message: "Coupon already exist" });
        } else {
            const coupon = new Coupon({
                name: req.body.name,
                offer: req.body.offer,
                limit: req.body.limit,
                status: "Active"
            });
            const couponData = await coupon.save();
            if (couponData) {
                res.redirect('/admin/coupons');
            } else {
                res.render('add-coupon', { admin: 1, message: "error" });
            }
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


const reports = async (req, res) => {
    try {

        const orderdata = await Order.aggregate([
            { $match: { status: "Delivered" } },
            {
                $group: {
                    _id: null,
                    totalSales: { $sum: "$orderPrice" }

                },

            },
            {
                $sort: { _id: 1 }
            }
        ]);

        if (!filter) {
            orderdataFilter = await Order.find({ status: "Delivered" })
        }
        const totalSales = orderdata.length > 0 ? orderdata[0].totalSales : 0;

        //  orderdataFilter.forEach(order => {
        //      order.deliveryDateFormatted = moment(order.delivery_date).format('DD-MM-YYYY');
        //  });

        res.render('reports', { admin: 1, orderdata: orderdataFilter, totalSales: totalSales });

    } catch (error) {
        console.log(error.message);
    }
}


const filteringOrder = async (req, res) => {
    try {
        const reqDate = req.body.fromDate
        const toDate = req.body.toDate


        orderdataFilter = await Order.find(

            {
                $and: [
                    {
                        delivery_date: {
                            $gt: reqDate,
                        }
                    },
                    {
                        delivery_date: {
                            $lt: toDate,
                        }
                    }]
            });


        // const orderdata = await Order.aggregate([
        //     {
        //         $match: {
        //             status: "Delivered",
        //             $and: [
        //                 {
        //                     delivery_date: {
        //                         $gt: reqDate
        //                     }
        //                 },
        //                 {
        //                     delivery_date: {
        //                         $lt: toDate
        //                     }
        //                 }
        //             ]
        //         }
        //     },
        //     {
        //         $group: {
        //             _id: null,
        //             totalSales: { $sum: "$orderPrice" }
        //         }
        //     }
        // ]);

        // const totalSales = orderdata.length > 0 ? orderdata[0].totalSales : 0;

        //console.log(totalSales + "filtered sales data");
        console.log(reqDate, toDate);
        console.log(orderdataFilter);

        filter = true;
        res.redirect('/admin/reports');
    } catch (error) {
        console.log(error.message);
    }
}



const adminDashboard = async (req, res) => {
    try {

        const totalDeliveredsum = await Order.aggregate([{
            $match: {
                status: 'Delivered'
            },
        }, {
            $group: {
                _id: {
                    $week: '$date'
                },
                sum: {
                    $sum: '$orderPrice'
                }
            }
        }, {
            $sort: {
                _id: -1
            }
        }, {
            $limit: 7
        }])




        const Piechart = await Order.aggregate([{
            $match: {
                $or: [{
                    payment_method: '1' // COD payment
                }, {
                    payment_method: '2' // Online payment
                }]
            },
        }, {
            $group: {
                _id: {
                    payment_method: '$payment_method',
                },
                sum: {
                    $sum: 1
                }
            }
        }])





        const Cancelorder = await Order.aggregate([{
            $match: {
                $or: [{
                    status: 'Returned'
                }, {
                    status: 'Delivered'
                }, {
                    status: 'Cancelled',
                }]
            },
        }, {
            $group: {
                _id: {
                    status: '$status',
                    date: {
                        $month: '$date'
                    },
                },
                sum: {
                    $sum: 1
                }
            }
        }])

        let delivered = 0;
        let cancelled = 0;
        let returned = 0;

        Cancelorder.forEach((item) => {
            if (item._id.status == 'Delivered')
                delivered += item.sum;

            if (item._id.status == 'Returned')
                returned += item.sum;

            if (item._id.status == 'Cancelled')
                cancelled += item.sum;
        })



        const userData = await Product.aggregate([
            {
                $lookup: {
                    from: "categories",
                    localField: "category",
                    foreignField: "_id",
                    as: "category"
                }
            },
            {
                $unwind: "$category"
            },
            {
                $group: {
                    _id: "$category.name",
                    count: { $sum: 1 }
                }
            }
        ]);

        const categoryNames = userData.map(data => data._id);
        const productCounts = userData.map(data => data.count);


        res.json({
            pie: Piechart,
            revenue: totalDeliveredsum,
            chart: {
                delivered,
                cancelled,
                returned
            },
            proC: {
                categoryNames,
                productCounts
            }

        })
    } catch (error) {
        console.log(error);

    }
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
    restoreCoupon,
    reports,
    adminDashboard,
    filteringOrder,
    loadReturns,
    loadShipped,
    outForDelivery,
    loadDelivered,
    loadCancelled
}
