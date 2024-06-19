import { totalItems } from "../middleware/productQuantity.middleware.js";
import Bookmark from "../models/bookmark.modules.js";
import Cart from "../models/cart.modules.js";
import Cartitems from "../models/cartitems.modules.js";
import Like from "../models/like.modules.js";
import Product from "../models/product.modules.js";


const product_addto_cart = async (req, res)=>{
try {
    console.log("Add product in cart!");
    const { prod_is, quantity }=req.body;
    const useris = req.user._id
    // console.log("Data is: ", prod_is, quantity, useris);

    if (quantity < 1) {
        res.status(400).json({message: "quantity not negative!"});
        return;
    };
    const product = await Product.findById({_id:prod_is});
    if (!product) {
        res.status(400).json({message: "Product is not exist"});
        return;
    };
    const findcart = await Cart.findOne({
        $and:[{
            customerId: useris,
            addToOrder: false
        }]
    });

    // If cart not exist or exist but AddToOrder is false
    if (findcart === null || findcart.addToOrder== false) {
        const cartis = new Cart({
            customerId: useris,
        });
        const cart_responce = await cartis.save();
        const cartId= cart_responce._id;
        const cartitem = new Cartitems({
            productId:prod_is,
            cartId,
            produdtQty:quantity,
        });
        const product_res = await cartitem.save();
        console.log("Product is: ", product_res);
        res.status(200).json("Successfuly create and add product");
        return;
    }
    // Find cart if its AddToOrder status is false
    if (!(findcart.addToOrder=== false)) {
        const finditem= await Cartitems.findOne({
            $and:[{
                productId: prod_is,
                cartId: findcart._id,
            }]
        });
        // Find CartItem based on cartId and productId is Null.
        if (!(finditem == null)) {
            const updateitem = await Cartitems.findOneAndUpdate(
                { _id:finditem._id },
                {
                    productId: prod_is,
                    cartId: finditem.cartId,
                    produdtQty: quantity,
                },
                { new:true }
            );
            console.log("Update product :", updateitem);
            res.status(200).json("Successfuly update product");
            return;
        } 
        else {
            const createitem = await Cartitems({
                productId: prod_is,
                cartId: findcart._id,
                produdtQty: quantity,
            });
            const creat_item_res = await createitem.save();
            console.log("Create product :", creat_item_res);
            res.status(200).json("Successfuly Create product!");
            return;
        }
    }
} catch (error) {
    res.status(500).json("Soemone error in product add in cart!");
}
};

const get_cart = async (req, res)=>{
    try {
        console.log("Get cart");
        const name = req.user._id;
        const userProfile = req.user.picture;
        const { totalPrice, totalQuantity } = await totalItems(req.user._id);
        const findcart = await Cart.findOne({
            $and:[{
                customerId:name,
                addToOrder: false
            }]
        });
        if (!findcart) {
            res.status(400).json("Your cart is Empty");
            return;
        };
        const findcartproducts = await Cartitems.find({cartId: findcart._id});
        const productIds = findcartproducts.map(item => item.productId);
        const find_products = await Product.find({ _id: { $in: productIds } });
        const find_bookmarks = await Bookmark.find({productId: { $in: productIds }, userId: name }).select("status productId")
        const find_likes = await Like.find({productId: { $in: productIds }, userId: name }).select("status productId")

        console.log("Products: ", find_products);
        res.status(200).render("cart", {
            totalQuantity,
            totalPrice,
            userProfile,
            productsis: findcartproducts,
            find_bookmarks,
            produ: find_products,
            find_likes
        });
    } catch (error) {
        res.status(500).json("Soemone error in get cart!");
    }
};

const delete_cart_product = async (req, res)=>{
    try {
        console.log("Delete cart product!");
        const userId = req.user._id;
        const { itemId } = req.body;
        const cart = await Cart.findOne({ customerId: userId, addToOrder: false }).select("_id");
        await Cartitems.findOneAndDelete({ $and:[{productId: itemId, cartId: cart._id }] })

        res.status(200).json({message:"Product successfuly Delete from your cart!"});
    } catch (error) {
        res.status(500).json("Soemone error in delete cart product!");
    }
};

const update_cart_product = async (req, res)=>{
    try {
        console.log("Update cart product!");
        const userId = req.user._id;
        const { producId, quantity } = req.body;
        console.log("Eddit is:", userId, producId, quantity);
        const cart = await Cart.findOne({ customerId: userId, addToOrder: false }).select("_id");

        await Cartitems.findOneAndUpdate(
            { $and:[{productId: producId, cartId: cart._id }] },
            { produdtQty:quantity },
            { new: true}
        );

        res.status(200).redirect("/bahadur/v1/cart");
    } catch (error) {
        res.status(500).json("Soemone error in update cart product!");
    }
};

export {
    product_addto_cart,
    get_cart,
    delete_cart_product,
    update_cart_product
}