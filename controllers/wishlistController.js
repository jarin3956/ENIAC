
const { ObjectId } = require('mongodb');
const User = require('../models/userModel');
const Category = require('../models/categoryModel')




const loadWishlist = async (req, res) => {

    try {
        const wishlistData = await User.aggregate([
            { $match: { _id: ObjectId(req.session.user_id) } },
            {
                $lookup: {
                    from: "products",
                    localField: 'wishlist.productId',
                    foreignField: '_id',
                    as: 'Wishlist'
                }
            }
        ]);
        const wishlistProducts = wishlistData[0].Wishlist

        const length = wishlistProducts.length

        res.render('wishlist', { wishlistProducts, length , logged:1});
    } catch (error) {
        console.log(error.message);
    }
}

const addToWishlist = async (req, res) => {
    try {
        
            const id = req.query.id;
            const wishlistData = await User.updateOne({ _id: req.session.user_id }, {
                $addToSet: {
                    wishlist: { productId: id }
                }
            });
            res.redirect('/home');
        
    } catch (error) {
        console.log(error.message);
    }
}

const removeWishlistProduct = async (req, res) => {
    try {
        const result = await User.findByIdAndUpdate({ _id: req.session.user_id }, {
            $pull: {
                wishlist: { productId: req.params.id }
            }
        });
        res.json("success")
    } catch (error) {
        console.log(error.message)
    }
}

///wishlist

const wishlistToCart = async (req, res) => {
    try {
        const result = await User.updateOne({ _id: req.session.user_id }, {
            $addToSet: {
                cart: { productId: ObjectId(req.query.id) }
            }
        });
        if (result) {
            const deletee = await User.findByIdAndUpdate({ _id: req.session.user_id }, {
                $pull: {
                    wishlist: { productId: req.query.id }
                }
            })
        }
        res.redirect('/wishlist')
    } catch (error) {
        console.log(error.message)
    }
}



const cartToWishlist = async (req, res) => {
    try {
        const result = await User.updateOne({ _id: req.session.user_id }, {
            $addToSet: {
                wishlist: { productId: ObjectId(req.query.id) }
            }
        });
        if (result) {
            const deletee = await User.findByIdAndUpdate({ _id: req.session.user_id }, {
                $pull: {
                    cart: { productId: req.query.id }
                }
            })
        }
        res.redirect('/cart')
    } catch (error) {
        console.log(error.message)
    }
}


module.exports = {

    loadWishlist,
    addToWishlist,
    removeWishlistProduct,
    wishlistToCart,
    cartToWishlist
}
