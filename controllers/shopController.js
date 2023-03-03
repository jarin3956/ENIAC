
const Category = require('../models/categoryModel');
const Product = require('../models/productModel');


const viewShopProducts = async (req, res) => {
    try {
        const productData = await Product.find({ category: req.query.categoryid, is_deleted: false })
        const categoryData = await Category.find({_id:req.query.categoryid})
        const cName = categoryData[0].name
        console.log(cName);

        
        if (req.session.user_id) {
            
            res.render('shop-products', { products: productData ,cName, logged:1 })
        } else {
            
            res.render('shop-products', { products: productData ,cName, loggedout:1 })
        }
    } catch (error) {
        console.log(error.message);
    }
}



module.exports = {
    
    viewShopProducts

}
