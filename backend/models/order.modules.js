import mongoose from "mongoose";

const orderSchema = new mongoose.Schema(
    {
        cartId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Cart",
            require: true,
        },
        customerId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "",
            require: true,
        },
        payerOrderId: {
            type: String,
            require: true,
        },
        payerAccountId: {
            type: String,
        },
        totalProducts: {
            type: Number,
            require: true,
        },
        totalPrice: {
            type: Number,
            require: true,
        },
        payerFirstName: {
            type: String,
        },
        payerLastName: {
            type: String,
        },
        payerEmail: {
            type: String,
        },
        payerCountryCode: {
            type: String,
            minlength: 2,
            maxlength: 2,
        },
        payerAccountStatus: {
            text: String,
            Enum: ["VERIFIED", "UNVERIFIED"]
        },
        paymentStatus: {
            type: String,
            Enum: ['CREATED', 'COMPLETED', 'FAILURE']
        },
        amount: [{
            currencyCode: {
                type: String,
                maxlength: 3,
                minlength: 3,
            },
            currencyValue: {
                type: Number,
            },
            Id: {
                type: String,
            }
        }],
        exchangeRate: [{
            sourceCurrency: {
                type: String,
                maxlength: 3,
                minlength: 3,
            },
            targetCurrency: {
                type: String,
                maxlength: 3,
                minlength: 3,
            },
        }],
        grossAmount: [{
            currencyCode: {
                type: String,
                maxlength: 3,
                minlength: 3,
            },
            value: {
                type: Number,
            }
        }],
        netAmount: [{
            currencyCode: {
                type: String,
                maxlength: 3,
                minlength: 3,
            },
            value: {
                type: Number,
            }
        }],
        paypalFee: [{
            currencyCode: {
                type: String,
                maxlength: 3,
                minlength: 3,
            },
            value: {
                type: Number,
            }
        }],
        receivableAmount: [{
            currencyCode: {
                type: String,
                maxlength: 3,
                minlength: 3,
            },
            value: {
                type: Number,
            }
        }],
        shippingAddress: [{
            address_line_1: {
                type: String,
            },
            address_line_2: {
                type: String,
            },
            admin_area_2: {
                type: String,
            },
            admin_area_1: {
                type: String,
            },
            postal_code: {
                type: Number,
                maxlength: 6,
                minlength: 4,
            },
            country_code: {
                type: String,
                minlength: 2,
                maxlength: 2,
            }
        }]
    },
    { timestamps: true }
);

const Order = mongoose.model("Order", orderSchema);

export default Order;