import Bookmark from "../models/bookmark.modules.js";
import Cart from "../models/cart.modules.js";
import Cartitems from "../models/cartitems.modules.js";
import Category from "../models/category.modules.js";
import GoogleUser from "../models/googleuser.modules.js";
import Order from "../models/order.modules.js";
import Product from "../models/product.modules.js";
import Review from "../models/review.modules.js";
import Store from "../models/store.modules.js";
import User from "../models/user.modules.js";
import { handelPayments } from "../middleware/paymenthandelar.middleware.js"


const get_totalOrders = async (req, res) => {
    try {
        console.log("Total orders list!");
        const newOrders = [];
        // get user id
        const givenUserId = req.user._id;
        // console.log("User ID is: ", givenUserId);
        // find store
        const storeIs = await Store.findOne({ userId: givenUserId });
        const storelogo = storeIs.logo;
        // console.log("Store is: ", storeIs);
        // find products of store
        const productsIs = await Product.find({ storeId: storeIs })
        // console.log("Products is: ", productsIs);
        // find carts they order status true
        const cartsIs = await Cart.find({ addToOrder: true });
        // console.log("Carts is: ", cartsIs);
        // find catitems they contane given cartid and productid
        const cartIds = cartsIs.map(item => item._id);
        const productIds = productsIs.map(item => item._id);
        // console.log("Cart Ids: ", cartIds);
        // console.log("Produc Ids: ", productIds);

        // const find_products = await Product.find({ _id: { $in: productIds } });
        const carItemsIs = await Cartitems.find({ productId: { $in: productIds }, cartId: { $in: cartIds } });
        // console.log("Cart items is: ", carItemsIs);

        for (const key in carItemsIs) {
            // console.log("Cartitems: ", carItemsIs[key]._id);
            for (const pkey in productsIs) {
                // console.log("Products: ", productsIs[pkey]._id);
                for (const ckey in cartsIs) {
                    // console.log("Carts: ", cartsIs[ckey]._id);
                    // if ( (parseInt(carItemsIs[key].productId) === parseInt(productsIs[pkey]._id)) && (parseInt(carItemsIs[key].cartId) === parseInt(cartsIs[ckey]._id)) ) {
                    if ((carItemsIs[key].productId.toHexString() === productsIs[pkey]._id.toHexString()) && (carItemsIs[key].cartId.toHexString() === cartsIs[ckey]._id.toHexString())) {
                        // console.log("Carts 2: ", cartsIs[ckey]._id.toHexString());
                        let customers;
                        if (req.user.googleId) {
                            customers = await GoogleUser.findOne({ _id: cartsIs[ckey].customerId })
                        } else {
                            customers = await User.findOne({ _id: cartsIs[ckey].customerId })
                        }

                        const ord = await Order.findOne({ cartId: cartsIs[ckey]._id, customerId: cartsIs[ckey].customerId })
                        const prodId = productsIs[pkey]._id;
                        const prodName = productsIs[pkey].name;
                        const totalPrice = carItemsIs[key].produdtQty * productsIs[pkey].price;
                        const prodPicture = productsIs[pkey].picture;
                        const custName = customers.name;
                        const payStatus = ord.paymentStatus;
                        const orderId = ord._id;
                        // const orderTime = ord.createdAt;
                        const orderTime = `${ord.createdAt.getFullYear()}/${ord.createdAt.getMonth()}/${ord.createdAt.getDate()}`;
                        // console.log("Time: ", orderTime);
                        console.log("custome Is: ", customers.name);

                        const newObj = {
                            prodId,
                            prodName,
                            totalPrice,
                            prodPicture,
                            custName,
                            payStatus,
                            orderTime,
                            orderId,
                        }
                        // console.log("NewObj: ", newObj);
                        newOrders.push(newObj);
                        console.log("New: ", newOrders);
                    };
                };
            };
        };

        // console.log("New Products:", newOrders);
        res.status(200).render("store_orders", { storelogo, newOrders });
    } catch (error) {
        res.status(500).json({ message: "Someone error during get Orders!" })
    }
};

const get_order = async (req, res) => {
    try {
        let data;
        let shipping;
        const givenOrder = req.params.id;
        const productId = req.params.productId;
        const userId = req.user._id;

        const orderIs = await Order.findOne({ _id: givenOrder });
        const cartIs = await Cart.findOne({ _id: orderIs.cartId, customerId: orderIs.customerId });
        let customerIs;
        customerIs = await User.findOne({ _id: orderIs.customerId });
        if (!customerIs) {
            customerIs = await GoogleUser.findOne({ _id: orderIs.customerId });
        }

        const cartitemsIs = await Cartitems.find({ cartId: cartIs._id });
        // const cartitemsIds = cartitemsIs.map(item => item.productId);
        const storeIs = await Store.findOne({ userId });
        const storelogo = storeIs.logo;

        for (const key in cartitemsIs) {
            if (cartitemsIs[key].productId.toHexString() === productId) {
                const { payerAccountStatus, paymentStatus, createdAt } = orderIs;
                const amount = orderIs.amount[0].currencyValue;
                const netAmount = orderIs.netAmount[0].value;
                const paypalFee = orderIs.paypalFee[0].value;
                const receivableAmount = orderIs.receivableAmount[0].value;
                const { address_line_1, address_line_2, admin_area_2, admin_area_1, postal_code, country_code } = orderIs.shippingAddress[0];
                const { name, email } = customerIs;
                const productIs = await Product.findOne({ _id: cartitemsIs[key].productId })
                const { price, picture, categoryId } = productIs;
                const productName = productIs.name;
                const categoryIs = await Category.findOne({ _id: categoryId });
                const quantity = cartitemsIs[key].produdtQty;
                const totalPrice = price * quantity;
                const category = categoryIs.name;
                const customerName = name;
                const customerEmail = email;
                const orderTime = `${createdAt.getFullYear()}/${createdAt.getMonth()}/${createdAt.getDate()}`;
                const { paypalFeeIs, netAmountIs, exchangeAmountIs } = await handelPayments(paypalFee, netAmount, amount, totalPrice, receivableAmount);

                data = {
                    quantity,
                    productName,
                    price,
                    totalPrice,
                    picture,
                    category,
                    customerName,
                    customerEmail,
                    payerAccountStatus,
                    paymentStatus,
                    orderTime,
                    amount,
                    netAmountIs,
                    paypalFeeIs,
                    exchangeAmountIs,
                }
                shipping = {
                    address_line_1,
                    address_line_2,
                    admin_area_1,
                    admin_area_2,
                    postal_code,
                    country_code,
                }
            }
        }
        console.log("Data: ", data);
        console.log("Shipping: ", shipping);
        res.status(200).render("store_order", { data, shipping, storelogo, message: "Successfully get order data!" })
    } catch (error) {
        res.status(500).json({ message: "Someone error during get Order!" })
    }
};

const get_totalUsers = async (req, res) => {
    try {
        const userId = req.user._id;
        let customersArr = [];
        const storeIs = await Store.findOne({ userId });
        const storelogo = storeIs.logo;
        const products = await Product.find({ storeId: storeIs._id });
        const productarr = products.map(item => item._id);
        const cartitems = await Cartitems.find({ productId: { $in: productarr } });
        const cartItemsarr = cartitems.map(item => item.cartId);
        const carts = await Cart.find({ _id: { $in: cartItemsarr }, addToOrder: true });
        const cartsarr = carts.map(item => item.customerId);
        const cartsIdsarr = carts.map(item => item._id);

        let customers;
        customers = await User.find({ _id: { $in: cartsarr } });
        if (!customers) {
            customers = await GoogleUser.find({ _id: { $in: cartsarr } });
        }

        const orders = await Order.find({ cartId: { $in: cartsIdsarr } });

        for (const key in customers) {
            for (const cartkey in carts) {
                if (
                    customers[key]._id.toHexString() ===
                    carts[cartkey].customerId.toHexString()
                ) {
                    for (const cartitemkey in cartitems) {
                        if (
                            cartitems[cartitemkey].cartId.toHexString() ===
                            carts[cartkey]._id.toHexString()
                        ) {
                            for (const productkey in products) {
                                if (
                                    products[productkey]._id.toHexString() ===
                                    cartitems[cartitemkey].productId.toHexString()
                                ) {
                                    for (const orderkey in orders) {
                                        if (
                                            carts[cartkey]._id.toHexString() ===
                                            orders[orderkey].cartId.toHexString() &&
                                            carts[cartkey].customerId.toHexString() ===
                                            orders[orderkey].customerId.toHexString()
                                        ) {
                                            const amount = orders[orderkey].amount[0].currencyValue;
                                            const netAmount = orders[orderkey].netAmount[0].value;
                                            const paypalFee = orders[orderkey].paypalFee[0].value;
                                            const receivableAmount = orders[orderkey].receivableAmount[0].value;
                                            const price = products[productkey].price;
                                            const quantity = cartitems[cartitemkey].produdtQty;
                                            const totalPrice = price * quantity;

                                            const orderId = orders[orderkey]._id;
                                            const custmrId = customers[key]._id;
                                            const custmrName = customers[key].name;
                                            const custmrPicture = customers[key].picture;

                                            const { paypalFeeIs, netAmountIs, exchangeAmountIs } = await handelPayments(paypalFee, netAmount, amount, totalPrice, receivableAmount);

                                            customersArr.push({
                                                orderId,
                                                custmrId,
                                                custmrName,
                                                custmrPicture,
                                                price,
                                                quantity,
                                                totalPrice,
                                                paypalFeeIs,
                                                netAmountIs,
                                                exchangeAmountIs,
                                            });
                                        }
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }

        function groupObjectsById(array) {
            return array.reduce((acc, obj) => {
                if (!acc[obj.custmrId]) {
                    acc[obj.custmrId] = [];
                }
                acc[obj.custmrId].push(obj);
                return acc;
            }, {});
        }

        const groupedObjects = groupObjectsById(customersArr);

        function getUniqueCustomerIds(array) {
            let uniqueIds = [];
            for (const key in array) {
                let id = array[key].custmrId;
                if (!uniqueIds.includes(id)) {
                    uniqueIds.push(id);
                }
            }
            return uniqueIds;
        }

        let uniqueCustomerIds = getUniqueCustomerIds(customersArr);

        let customer = [];
        for (const [index, iterator] of uniqueCustomerIds.entries()) {
            let go = groupedObjects[iterator];
            const custmrPicture = go.reduce((acc, item) => acc = item.custmrPicture, 0);
            const custmrName = go.reduce((acc, item) => acc = item.custmrName, 0);
            const custmrId = go.reduce((acc, item) => acc = item.custmrId, 0);
            const totalPriceIs = go.reduce((acc, item) => acc + item.totalPrice, 0);
            const totalQuantityIs = go.reduce((acc, item) => acc + item.quantity, 0);

            customer.push({
                index: index + 1,
                totalPriceIs,
                totalQuantityIs,
                custmrId,
                custmrName,
                custmrPicture,
            });
        }

        console.log("Custoemr is: ", customer);
        res.status(200).render("store_customers", { storelogo, customer, message: "Successfully get Users!" });
    } catch (error) {
        res.status(500).json({ message: "Someone error during get Users!" });
    }
};

const get_customer = async (req, res) => {
    try {
        console.log("Store Customer!");
        const _id = req.params.id;
        const storeown = req.user._id;
        let custoemr;
        if (req.user.googleId) {
            custoemr = await GoogleUser.findOne({ _id }).select("_id name email picture");
        } else {
            custoemr = await User.findOne({ _id }).select("_id name email picture");
        }
        const customerId = custoemr._id;

        const storeIs = await Store.findOne({ userId: storeown }).select("_id logo");
        const storelogo = storeIs.logo;
        const products = await Product.find({ storeId: storeIs._id }).select("_id name picture price");
        const carts = await Cart.find({ customerId, addToOrder: true }).select("_id customerId");
        const cartsIds = carts.map((item) => item._id);
        const cartitems = await Cartitems.find({ cartId: { $in: cartsIds } }).select("cartId productId produdtQty");
        const ord = await Order.find({ cartId: { $in: cartsIds } }).select("_id cartId");

        let orders = [];
        let customerIs;
        let totalquan = 0;
        let totalpurchase = 0;

        const findorder = (id) => {
            let orderId;
            for (const key in ord) {
                if (id.toHexString() === ord[key].cartId.toHexString()) {
                    orderId = ord[key]._id;
                }
            }
            return orderId;
        }

        for (const cartskey in carts) {
            const crt = carts[cartskey];
            if (customerId.toHexString() === crt.customerId.toHexString()) {
                for (const cartiemskey in cartitems) {
                    const c = cartitems[cartiemskey];
                    if (crt._id.toHexString() === c.cartId.toHexString()) {
                        for (const productkey in products) {
                            let p = products[productkey];
                            if (c.productId.toHexString() === p._id.toHexString()) {

                                const orderId = findorder(crt._id);

                                orders.push({
                                    Id: p._id,
                                    orderId,
                                    name: p.name,
                                    picture: p.picture,
                                    price: p.price,
                                    totalprice: p.price * c.produdtQty,
                                    quantity: c.produdtQty,
                                });

                                totalquan += c.produdtQty;
                                totalpurchase += p.price * c.produdtQty;

                                customerIs = {
                                    name: custoemr.name,
                                    email: custoemr.email,
                                    picture: custoemr.picture,
                                    totalpurchase,
                                    totalquan,
                                };
                            }
                        }
                    }
                }
            }
        }

        console.log("Orders", orders);
        console.log("Customer", customerIs);
        res.status(200).render("store_customer", { storelogo, customerIs, orders, message: "Successfully get User!" });
    } catch (error) {
        res.status(500).json({ message: "Someone error during get User!" });
    }
};

const get_bookmarks = async (req, res) => {
    try {
        console.log("Bookmarks page!");
        const storeown = req.user._id;
        const storeIs = await Store.findOne({ userId: storeown }).select("_id name logo");
        const storelogo = storeIs.logo;
        const products = await Product.find({ storeId: storeIs._id });
        const productsIds = products.map((item) => item._id);
        const bookmark = await Bookmark.find({
            $or: [
                { storeId: storeIs._id },
                { productId: { $in: productsIds } }
            ]
        });

        function getUniqueCustomerIds(array) {
            let uniqueIds = [];
            for (const key in array) {
                let id = array[key].userId;
                if (!uniqueIds.includes(id.toHexString())) {
                    uniqueIds.push(id.toHexString());
                }
            }
            return uniqueIds;
        }

        const bookmarksIds = getUniqueCustomerIds(bookmark);
        let custoemr;
        custoemr = await GoogleUser.find({ _id: { $in: bookmarksIds } }).select("_id name email picture");
        if (custoemr) {
            custoemr = await User.find({ _id: { $in: bookmarksIds } }).select("_id name email picture");
        }

        let productBookmarks = [];
        let storeBookmarks = [];
        let index = 0;
        let index2 = 0;

        for (const custmkey in custoemr) {
            for (const bokmkey in bookmark) {
                if (bookmark[bokmkey].userId.toHexString() === custoemr[custmkey]._id.toHexString()) {
                    if (bookmark[bokmkey].productId) {
                        for (const prokey in products) {
                            if (bookmark[bokmkey].productId.toHexString() === products[prokey]._id.toHexString()) {

                                const time = bookmark[bokmkey].createdAt;
                                const bookmarkTime = `${time.getFullYear()}/${time.getMonth()}/${time.getDate()}`;
                                index += 1;

                                productBookmarks.push({
                                    index: index,
                                    name: products[prokey].name,
                                    picture: products[prokey].picture,
                                    custoemrName: custoemr[custmkey].name,
                                    custoemrPicture: custoemr[custmkey].picture,
                                    status: bookmark[bokmkey].status,
                                    date: bookmarkTime,
                                });
                            }
                        }
                    }
                    if (bookmark[bokmkey].storeId) {
                        const time = bookmark[bokmkey].createdAt;
                        const bookmarkTime = `${time.getFullYear()}/${time.getMonth()}/${time.getDate()}`;
                        index2 += 1;
                        storeBookmarks.push({
                            index: index2,
                            custoemrName: custoemr[custmkey].name,
                            custoemrPicture: custoemr[custmkey].picture,
                            status: bookmark[bokmkey].status,
                            date: bookmarkTime,
                        });
                    }
                }
            }
        }

        console.log("Products Bookmarks: ", productBookmarks);
        console.log("Store Bookmarks: ", storeBookmarks);
        const totalstorebookmarks = {
            name: storeIs.name,
            length: storeBookmarks.length
        };
        const totalproductbookmarks = productBookmarks.length;

        res.status(200).render("store_bookmarks", { storelogo, totalproductbookmarks, totalstorebookmarks, productBookmarks, storeBookmarks, message: "Successfully get User!" });
    } catch (error) {
        res.status(500).json({ message: "Someone error during get User!" });
    }
};

const get_reviews = async (req, res) => {
    try {
        console.log("Reviews page!");
        const storeown = req.user._id;
        const storeIs = await Store.findOne({ userId: storeown }).select("_id logo");
        const storelogo = storeIs.logo;
        const products = await Product.find({ storeId: storeIs._id }).select("_id name");
        const productsIds = products.map((item) => item._id);
        const reviews = await Review.find({
            $or: [
                { storeId: storeIs._id },
                { productId: { $in: productsIds } }
            ]
        }).select("userId storeId productId createdAt rating review");

        function getUniqueCustomerIds(array) {
            let uniqueIds = [];
            for (const key in array) {
                let id = array[key].userId;
                if (!uniqueIds.includes(id.toHexString())) {
                    uniqueIds.push(id.toHexString());
                }
            }
            return uniqueIds;
        }

        const usersIds = getUniqueCustomerIds(reviews);
        let custoemr;
        custoemr = await GoogleUser.find({ _id: { $in: usersIds } }).select("_id name picture");
        if (custoemr) {
            custoemr = await User.find({ _id: { $in: usersIds } }).select("_id name picture");
        }

        let productReviews = [];
        let storeReviews = [];
        for (const custmkey in custoemr) {
            let c = custoemr[custmkey];
            for (const reviewkey in reviews) {
                let r = reviews[reviewkey];
                if (c._id.toHexString() === r.userId.toHexString()) {
                    if (r.productId) {
                        for (const productkey in products) {
                            let p = products[productkey];
                            if (p._id.toHexString() === r.productId.toHexString()) {

                                const time = r.createdAt;
                                const reviewTime = `${time.getFullYear()}/${time.getMonth()}/${time.getDate()}`;

                                productReviews.push({
                                    image: c.picture,
                                    name: c.name,
                                    rating: r.rating,
                                    review: r.review,
                                    date: reviewTime,
                                    product: p.name,
                                });
                            }
                        }
                    }
                    if (r.storeId) {
                        const time = r.createdAt;
                        const reviewTime = `${time.getFullYear()}/${time.getMonth()}/${time.getDate()}`;

                        storeReviews.push({
                            image: c.picture,
                            name: c.name,
                            rating: r.rating,
                            review: r.review,
                            date: reviewTime,
                        });
                    }
                }
            }
        }
        const rating = (array) => {
            let rating_length = 0;
            let rating_gev_num = 0;
            let rating_total_num = 0;
            let rating1 = 0;
            let rating2 = 0;
            let rating3 = 0;
            let rating4 = 0;
            let rating5 = 0;

            for (const index in array) {
                rating_length = parseInt(index) + 1;
                rating_total_num = rating_length * 5;
                rating_gev_num += array[index].rating;

                if (array[index].rating === 5) {
                    ++rating5
                } else if (array[index].rating === 4) {
                    ++rating4
                } else if (array[index].rating === 3) {
                    ++rating3
                } else if (array[index].rating === 2) {
                    ++rating2
                } else if (array[index].rating === 1) {
                    ++rating1
                }
            }

            // Rating Formula
            // (Weighted score / Total maximum weighted score) * Maximum numeric Rating
            const ratingIs = (rating_gev_num / rating_total_num) * 5;

            return {
                rating_length,
                rating_gev_num,
                rating_total_num,
                ratingIs,
                rating1,
                rating2,
                rating3,
                rating4,
                rating5,
            }
        }
        console.log("Products reviews: ", productReviews);
        console.log("Store reviews: ", storeReviews);
        const store_rating = rating(storeReviews);
        const product_rating = rating(productReviews);

        res.status(200).render("store_review", { storelogo, store_rating, product_rating, storeReviews, productReviews, message: "Successfully get User!" });
    } catch (error) {
        res.status(500).json({ message: "Someone error during get User!" });
    }
}

export {
    get_totalOrders,
    get_order,
    get_totalUsers,
    get_customer,
    get_bookmarks,
    get_reviews
};