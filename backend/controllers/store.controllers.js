import Store from "../models/store.modules.js";
import { findFile, updateCloudinaryFile, uponCloudinary } from "../middleware/cloudinary.middleware.js";
import Review from "../models/review.modules.js";
import Product from "../models/product.modules.js";
import Like from "../models/like.modules.js";
import Bookmark from "../models/bookmark.modules.js";
import Cartitems from "../models/cartitems.modules.js";
import Cart from "../models/cart.modules.js";
import Order from "../models/order.modules.js";
import GoogleUser from "../models/googleuser.modules.js";
import User from "../models/user.modules.js";
import { handelPayments } from "../middleware/paymenthandelar.middleware.js"
import { diskStorage } from "multer";


const get_store = async (req, res) => {
    try {
        console.log("Dashboard!");
        const getstore = req.user._id;
        let ordersArr = [];
        // console.log(getstore);
        if (!getstore) {
            res.status(401).json({ message: "You are unauthorized." });
            return;
        };
        const data = await Store.findOne({ userId: getstore }).select("_ld logo");
        const storelogo = data.logo;
        const products = await Product.find({ storeId: data._id }).select("_id name price picture");
        const productsArr = products.map(item => item._id);
        const cartitems = await Cartitems.find({ productId: { $in: productsArr } }).select("cartId productId produdtQty");
        const cartitemsArr = ((arr) => {
            let newarr = [];
            for (const key in arr) {
                const id = (arr[key].cartId).toHexString();
                if (!newarr.includes(id)) {
                    newarr.push(id)
                }
            }
            return newarr;
        });
        const cartsIdsArr = cartitemsArr(cartitems);
        const cart = await Cart.find({ _id: { $in: cartsIdsArr }, addToOrder: true }).select("_id customerId");
        const cartIds = cart.map(item => item._id);
        const cartCustomerIds = cart.map(item => item.customerId);
        const order = await Order.find({ cartId: { $in: cartIds }, customerId: { $in: cartCustomerIds } })
            .select("_id cartId customerId receivableAmount paypalFee netAmount amount createdAt");
        let custoemr;
        custoemr = await GoogleUser.find({ _id: { $in: cartCustomerIds } }).select("_id name");
        if (custoemr.length <= 0) {
            custoemr = await User.find({ _id: { $in: cartCustomerIds } }).select("_id name");
        }
        const findData = async (model, storeId, productsArr) => {
            const result = await model.find({
                $or: [
                    { storeId: storeId },
                    { productId: { $in: productsArr } }
                ]
            }).select("_id status");
            return result;
        };
        const reviews = await findData(Review, data._id, productsArr);
        const likes = await findData(Like, data._id, productsArr);
        const bookmarks = await findData(Bookmark, data._id, productsArr);

        const findTrue = (Arr) => {
            const status = Arr.filter((item) => {
                if (item.status === true) {
                    return item._id;
                }
            });
            return status;
        };
        const findFalse = (Arr) => {
            const status = Arr.filter((item) => {
                if (item.status === false) {
                    return item._id;
                }
            });
            return status;
        };
        const like_true = findTrue(likes);
        const bookmark_true = findTrue(bookmarks);
        const like_false = findFalse(likes);
        const bookmark_false = findFalse(bookmarks);

        for (const custkey in custoemr) {
            for (const cartkey in cart) {
                for (const cartitemskey in cartitems) {
                    if (cart[cartkey]._id.toHexString() === cartitems[cartitemskey].cartId.toHexString()) {
                        for (const prokey in products) {
                            if (cartitems[cartitemskey].productId.toHexString() === products[prokey]._id.toHexString()) {
                                for (const orderkey in order) {
                                    if (order[orderkey].cartId.toHexString() === cart[cartkey]._id.toHexString() && order[orderkey].customerId.toHexString() === custoemr[custkey]._id.toHexString()) {
                                        // console.log("Orders Is: ", order[orderkey]._id);

                                        const amount = order[orderkey].amount[0].currencyValue;
                                        const netAmount = order[orderkey].netAmount[0].value;
                                        const paypalFee = order[orderkey].paypalFee[0].value;
                                        const receivableAmount = order[orderkey].receivableAmount[0].value;
                                        const price = products[prokey].price;
                                        const quantity = cartitems[cartitemskey].produdtQty;
                                        const totalPrice = price * quantity;

                                        const orderId = order[orderkey]._id;
                                        const prodName = products[prokey].name;
                                        const prodPicture = products[prokey].picture;
                                        const custmrId = custoemr[custkey]._id;
                                        const custmrName = custoemr[custkey].name;
                                        const time = order[orderkey].createdAt;
                                        const orderDate = `${time.getFullYear()}/${time.getMonth()}/${time.getDate()}`;

                                        const { netAmountIs } = handelPayments(paypalFee, netAmount, amount, totalPrice, receivableAmount);

                                        ordersArr.push({
                                            orderId,
                                            custmrId,
                                            custmrName,
                                            prodPicture,
                                            prodName,
                                            orderDate,
                                            totalPrice,
                                            netAmountIs,
                                        });
                                    }
                                }
                            }
                        }
                    }
                }
            }
        }
        const sales = ordersArr.reduce((acc, item) => acc + item.totalPrice, 0);
        const earning = ordersArr.reduce((acc, item) => acc + item.netAmountIs, 0);
        const likeIs = {
            like: likes.length,
            true: like_true.length,
            false: like_false.length,
        };
        const bookmarkIs = {
            bookmark: bookmarks.length,
            true: bookmark_true.length,
            false: bookmark_false.length,
        };
        const reviewIs = reviews.length;
        const orderIs = ordersArr.length;
        const saleIs = sales;
        const earningIs = earning;
        const ordersIs = ordersArr;

        // console.log("Reviews: ", reviewIs);
        // console.log("Likes: ", likeIs);
        // console.log("Bookmarks: ", bookmarkIs);
        // console.log("Total orders: ", orderIs);
        // console.log("Total sales: ", saleIs);
        // console.log("Total earning: ", earningIs);
        // console.log("Orders: ", ordersIs);

        res.status(200).render("store_dashboard", { storelogo, orderIs, saleIs, earningIs, reviewIs, bookmarkIs, likeIs, ordersIs, message: "Recover your store data successfully." })
    } catch (error) {
        res.status(500).json({ message: "Someone error during get Store data!" })
    }
};

const get_create_store = async (__, res) => {
    try {
        console.log("Create store!");
        res.status(200).render("store_create", { message: "" })
    } catch (error) {
        res.status(500).json("Someone error during get add items form!");
    }
};

const post_create_store = async (req, res) => {
    try {
        console.log("this is the store create rout!");
        const { name, email, description } = req.body;
        // console.log("Body", req.body);
        // console.log("Files: ", req.files);
        // const filelogo = req.files.logo[0].path;
        // const filebanner = req.files.banner[0].path;
        const filelogo = req.files.logo[0].buffer;
        const filebanner = req.files.banner[0].buffer;
        const userId = req.user._id;

        // validation
        if (!name || !email || !description) {
            res.status(401).json({ message: "All fiels are require!" });
            return;
        };
        if (name.length < 2) {
            res.status(401).json({ message: "Brand / Store name length grater the 2" })
            return;
        };
        // Email validation
        if (email.length < 13 || email.length > 40) {
            res.status(401).json({message: "Email is invalid"});
            return;
        };
        if (!email.includes("@") || !email.includes(".")) {
            res.status(401).json({message: "Email is invalid"});
            return;
        };

        // File validate
        if (!filelogo || !filebanner) {
            res.status(401).json({message: "File is invalid"});
            return;
        };
        // Description validate
        if (description.length > 500) {
            res.status(401).json({message: "description is tolong"});
            return;
        };

        // Duplicate store/brand validate
        const existing_stores = await Store.findOne({ name, email });
        if (existing_stores) {
            res.status(409).json({message: "Store already exist"});
            return;
        };
        // upload logo on cloudinery
        const cloudinary_logo_output = await uponCloudinary(filelogo);
        // // For diskStorage
        // const logo = cloudinary_logo_output.url;
        // // console.log("Logo is:", logo);
        
        // For memoryStorage
        const logo = cloudinary_logo_output.secure_url;
        
        const cloudinary_banner_output = await uponCloudinary(filebanner);
        // // For diskStorage
        // const banner = cloudinary_banner_output.url;
        // console.log("Banner is:", banner);
        
        // For memoryStorage
        const banner = cloudinary_banner_output.secure_url;
        
        const newstore = new Store({
            name,
            email,
            userId,
            description,
            logo,
            banner,
        });
        // console.log("New Store: ", newstore);
        await newstore.save();

        res.status(200).json({ message: "Store ceation successfuly complete!" })
    } catch (error) {
        res.status(500).json("Someone error during Post create store!");
    }
};

const get_update_store = async (__, res) => {
    try {
        console.log("Update Store!");
        res.status(200).render("store_update", { message: "Successfully fetch data for update." })
    } catch (error) {
        res.status(500).json({ message: "Someone error during get Store data for update!" })
    }
};

const get_update_store_json = async (req, res) => {
    try {
        const getUser = req.user._id;

        if (!getUser) {
            res.status(401).json({ message: "You are unauthorized." });
            return;
        };
        const data = await Store.findOne({ userId: getUser })
            .select("name email description");

        res.status(200).json({ data, message: "Successfully fetch data for update." })
    } catch (error) {
        res.status(500).json({ message: "Someone error during get Store data for update!" })
    }
};

const updata_store = async (req, res) => {
    try {
        const { name, email, description } = req.body;
        // const filelogo = req.files.logo[0].path;
        // const filebanner = req.files.banner[0].path;
        const filelogo = req.files.logo[0].buffer;
        const filebanner = req.files.banner[0].buffer;
        // console.log("Files: ", req.files);
        const userId = req.user._id;
        
        // User validate
        const storeId = await Store.findOne({ userId });
        // console.log("Update data", req.params, req.body, "Paramater: ", storeId, userId, filelogo, filebanner);
        if (!name || !email || !description || !filelogo || !filebanner || !storeId || !userId) {
            res.status(401).json({ message: "All fiels are require!" });
            return;
        };
        if (name.length < 2) {
            res.status(401).json({ message: "Brand / Store name length grater the 2" })
            return;
        };
        // Email validation
        if (email.length < 13 || email.length > 40) {
            res.status(401).send("Email is invalid");
            return;
        };
        if (!email.includes("@") || !email.includes(".")) {
            res.status(401).send("Email is invalid");
            return;
        };
        if (!filelogo || !filebanner) {
            res.status(401).send("File is invalid");
            return;
        };
        // Description validate
        if (description.length > 500) {
            res.status(401).send("description is tolong");
            return;
        };

        const file_logo_Id = await findFile(storeId.logo);
        const file_banner_Id = await findFile(storeId.banner);
        const cloudinary_logo_output = await updateCloudinaryFile(file_logo_Id, filelogo);
        const logo = cloudinary_logo_output;
        const cloudinary_banner_output = await updateCloudinaryFile(file_banner_Id, filebanner);
        const banner = cloudinary_banner_output;
        // console.log("Logo is:", logo);
        // console.log("Banner is:", banner);
        
        const updated_store = await Store.findOneAndUpdate(
            {
                _id: storeId._id
            },
            {
                name,
                email,
                logo,
                banner,
                userId,
                description,
            },
            {
                new: true,
            }
        );

        res.status(200).json({ updated_store, message: "Data is successfuly Update!" });
    } catch (error) {
        res.status(500).json({ message: "Someone error during Store update!" });
    }
};

export {
    get_store,
    get_create_store,
    post_create_store,
    get_update_store,
    get_update_store_json,
    updata_store,
}