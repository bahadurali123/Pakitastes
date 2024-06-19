import { caputureOrder, createOrder } from "../config/paymentConfig.js";
import Cart from "../models/cart.modules.js";
import Cartitems from "../models/cartitems.modules.js";
import Order from "../models/order.modules.js";
import Product from "../models/product.modules.js";

const get_show_pay_page = async (req, res) => {
    try {
        console.log("Order page successfuly show!");
        res.status(200).render("order");
    } catch (error) {
        console.error("Failed to show order page:", error);
        res.status(500).json({ error: "Failed to show order page." });
    }
}
const post_createOrder = async (req, res) => {
    try {
        const user = req.user._id;
        const { address_line_1, address_line_2, admin_area_2, admin_area_1, postal, country, } = req.body;
        if (!address_line_1 || !address_line_2 || !admin_area_2 || !admin_area_1 || !postal || !country) {
            res.status(400).json("Shipping address is require");
            return;
        };
        // console.log(req.body, user);
        const usercart = await Cart.findOne({ $and: [{ customerId: user, addToOrder: false }] })
        const itemcarts = await Cartitems.find({ cartId: usercart._id });
        const total_quantity = itemcarts.reduce((acc, items) => acc + items.produdtQty, 0);
        const productIds = itemcarts.map(item => item.productId);
        const find_products = await Product.find({ _id: { $in: productIds } });
        let p = 0;

        find_products.forEach(element => {
            for (const key in itemcarts) {
                if (parseInt(itemcarts[key].productId) === parseInt(element._id)) {
                    p += element.price * itemcarts[key].produdtQty;
                }
            }
        });
        const cart = {
            totalprice: p,
            address_line_1,
            address_line_2,
            admin_area_2,
            admin_area_1,
            postal,
            country,
        }

        const { jsonResponse, StatusCode } = await createOrder(cart);
        // console.log("Order response", jsonResponse);
        // console.log("Status :", jsonResponse.status)

        const newOrder = new Order({
            cartId: usercart._id,
            customerId: user,
            payerOrderId: jsonResponse.id,
            totalPrice: p,
            totalProducts: total_quantity,
            paymentStatus: jsonResponse.status,
        });

        // const order_response = await newOrder.save();
        await newOrder.save();

        const cart_update = await Cart.findOneAndUpdate(
            {
                $and: [{ customerId: user, addToOrder: false }]
            },
            {
                addToOrder: true
            },
            { new: true }
        );
        console.log("Update cart response is: ", cart_update);
        
        res.status(StatusCode).json(jsonResponse)
    } catch (error) {
        res.status(500).json({ error: "Failed to create order." });
    }
}

const post_captureOrder = async (req, res) => {
    try {
        console.log("In capture order");
        const order_id = req.params.orderId;
        const userId = req.user._id;
        const { jsonResponse, StatusCode } = await caputureOrder(order_id);
        
        const { id, status } = jsonResponse;
        const { address_line_1, address_line_2, admin_area_2, admin_area_1, postal_code, country_code } = jsonResponse.purchase_units[0].shipping.address;
        const { currency_code, value } = jsonResponse.purchase_units[0].payments.captures[0].amount;
        const amountId = jsonResponse.purchase_units[0].payments.captures[0].id;
        const { source_currency, target_currency } = jsonResponse.purchase_units[0].payments.captures[0].seller_receivable_breakdown.exchange_rate;
        const gross_currency_code = jsonResponse.purchase_units[0].payments.captures[0].seller_receivable_breakdown.gross_amount.currency_code;
        const gross_value = jsonResponse.purchase_units[0].payments.captures[0].seller_receivable_breakdown.gross_amount.value;
        const net_amount_currency_code = jsonResponse.purchase_units[0].payments.captures[0].seller_receivable_breakdown.net_amount.currency_code;
        const net_amount_value = jsonResponse.purchase_units[0].payments.captures[0].seller_receivable_breakdown.net_amount.value;
        const paypal_fee_currency_code = jsonResponse.purchase_units[0].payments.captures[0].seller_receivable_breakdown.paypal_fee.currency_code;
        const paypal_fee_value = jsonResponse.purchase_units[0].payments.captures[0].seller_receivable_breakdown.paypal_fee.value;
        const receivable_amount_currency_code = jsonResponse.purchase_units[0].payments.captures[0].seller_receivable_breakdown.receivable_amount.currency_code;
        const receivable_amount_value = jsonResponse.purchase_units[0].payments.captures[0].seller_receivable_breakdown.receivable_amount.value;
        const { given_name, surname } = jsonResponse.payer.name;

        const order_update = await Order.findOneAndUpdate(
            {
                $and: [{
                    payerOrderId: id,
                    customerId: userId,
                }]
            },
            {
                payerAccountId: jsonResponse.payer.payer_id,
                payerFirstName: given_name,
                payerLastName: surname,
                payerEmail: jsonResponse.payer.email_address,
                payerCountryCode: jsonResponse.payer.address.country_code,
                payerAccountStatus: jsonResponse.payment_source.paypal.account_status,
                paymentStatus: status,
                amount: {
                    currencyCode: currency_code,
                    currencyValue: value,
                    Id: amountId,
            },
            exchangeRate: {
                sourceCurrency: source_currency,
                targetCurrency: target_currency,
            },
            grossAmount: {
                currencyCode: gross_currency_code,
                value: gross_value,
            },
            netAmount: {
                currencyCode: net_amount_currency_code,
                value: net_amount_value,
            },
            paypalFee: {
                currencyCode: paypal_fee_currency_code,
                value: paypal_fee_value,
            },
            receivableAmount: {
                currencyCode: receivable_amount_currency_code,
                value: receivable_amount_value,
            },
            shippingAddress: {
                address_line_1,
                address_line_2,
                admin_area_2,
                admin_area_1,
                postal_code,
                country_code,
            }
            },
            {new: true}
        );
        console.log("Data for card in capture: ", order_update);
        
        res.status(StatusCode).json(jsonResponse);
    } catch (error) {
        res.status(500).json({ error: "Faild to capture order." });
    }
}

export {
    get_show_pay_page,
    post_createOrder,
    post_captureOrder
}