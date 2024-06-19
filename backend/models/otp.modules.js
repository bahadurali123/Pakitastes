import mongoose from "mongoose";

const optSchema = new mongoose.Schema(
    {
        code:{
            type: String,
            require: true,
            minimum: 6,
            maximum: 8,
        },
        userId:{
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            require: true,
        },
        expiryTime:{
            type: Date,
            require: true,
            default: () => new Date(Date.now() + 180000),
        },
    },
    {timestamps: true}
);

const Otp = mongoose.model("Otp", optSchema);
export default Otp;