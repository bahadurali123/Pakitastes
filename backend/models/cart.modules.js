import mongoose from "mongoose";

const cartScema = new mongoose.Schema(
    {
        addToOrder:{
            type: String,
            Enum: [true, false],
            default: false,
            require: true,
        },
        customerId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            require: true,
        }
    },
    {timestamps: true}
);

const Cart = mongoose.model("Cart", cartScema);
export default Cart;