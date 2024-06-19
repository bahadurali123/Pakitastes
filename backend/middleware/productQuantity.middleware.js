import Cart from "../models/cart.modules.js";
import Cartitems from "../models/cartitems.modules.js";
import Product from "../models/product.modules.js";

const totalItems = async (user) => {
    // Find total quantity and price
    // console.log("This is the total Items func: ", user);
    const usercart = await Cart.findOne({ $and: [{ customerId: user, addToOrder: false }] })
    if (usercart=== null) {
        return {
            totalPrice: 0,
            totalQuantity: 0
        };
    }

    const itemcarts = await Cartitems.find({ cartId: usercart._id });
    const total_quantity = itemcarts.reduce((acc, items) => acc + items.produdtQty, 0);
    const productIds = itemcarts.map(item => item.productId);
    const find_products = await Product.find({ _id: { $in: productIds } });
    const q = total_quantity;
    let p = 0;

    find_products.forEach(element => {
        for (const key in itemcarts) {
            if ((itemcarts[key].productId).toHexString() === (element._id).toHexString()) {
                p += element.price * itemcarts[key].produdtQty;
                // console.log("Price is this: ", p);
            }
        }
    });
    console.log(`Price is: ${p} Quantity is: ${q}`);
    return {
        totalPrice: p,
        totalQuantity: q
    };
};

export {
    totalItems
};