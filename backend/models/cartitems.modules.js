import mongoose from "mongoose";

const cartitems = new mongoose.Schema(
    {
        productId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "Product",
            require: true,
        },
        cartId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Cart",
            require: true,
        },
        produdtQty: {
            type: Number,
            require: true,
        }
    },
    {timestamps: true}
);

const Cartitems = mongoose.model("Cartitems", cartitems);
export default Cartitems;