import express from "express";
import multer from "multer";
import upload from "../middleware/multer.middleware.js";
import { userAuthantice, userFlexibleAuthentication } from "../middleware/userauth.middleware.js";

// Create a new Express Router
const router = express.Router();
// router.use(uponCloudinary);

// imports registration / user controllers
import { postUser, getUser, getuserlogin, postuserlogin, googleredirect, calback, get_otp_verify, get_otp_regenrete, logoutUser } from "../controllers/user.controllers.js";
// imports store / brand controllers
import {  get_store, get_create_store, post_create_store, get_update_store, updata_store, get_update_store_json } from "../controllers/store.controllers.js";
// imports product controllers
import { delete_product, get_create_product, get_products, get_update_product, get_update_product_json, post_create_product, put_update_product } from "../controllers/product.controllers.js";
// imports category controllers
import { delete_category, get_create_category, get_update_category, post_create_category, put_update_category } from "../controllers/category.controllers.js";
// imports store_others controllers
import { get_bookmarks, get_customer, get_order, get_reviews, get_totalOrders, get_totalUsers } from "../controllers/store_others.controllers.js";
// imports pages controllers
import { Product_bookmark, Product_like, brand, brand_bookmark, brand_like, brand_review, brands, category_products, categorys, get_profileEdit, home, product, product_review, products, profile, put_profileEdit, search } from "../controllers/pages.controllers.js";
// imports cart controllers
import { delete_cart_product, update_cart_product, get_cart, product_addto_cart } from "../controllers/cart.controllers.js";
// imports order controllers
import { get_show_pay_page, post_captureOrder, post_createOrder } from "../controllers/order.controllers.js";

// Register router for user and store;
// one function is left add user varification in user schema.
router.get("/user", getUser); //
router.post("/user", upload.single('picture'), postUser); //
router.get("/userlogin", getuserlogin); //
router.post("/userlogin", postuserlogin); //
router.get("/googleredirect", googleredirect);
router.get("/auth/google/calback", calback);
router.post("/otpverify", get_otp_verify);
router.get("/regenrateotp/:mail", get_otp_regenrete);
router.get("/userlogout", userAuthantice, logoutUser); //

// Store creation and updaion routs
router.get("/store", userAuthantice, get_store); //
router.get("/store/create", userAuthantice, get_create_store); //
router.post("/store/createstore", upload.fields([{ name: "logo", maxCount: 1 }, { name: "banner", maxCount: 1 }]), userAuthantice, post_create_store); //
router.get("/store/update", userAuthantice, get_update_store); //
router.get("/store/update/json", userAuthantice, get_update_store_json); //
router.put("/store/update", upload.fields([{ name: "logo", maxCount: 1 }, { name: "banner", maxCount: 1 }]), userAuthantice, updata_store); //

// Product creation and updaion routs
router.get("/store/your/products", userAuthantice, get_products); //
router.get("/store/product/create", userAuthantice, get_create_product); //
router.post("/store/product/create", upload.single('image'), userAuthantice, post_create_product); //
router.get("/store/product/update/:id", userAuthantice, get_update_product); //
router.get("/store/product/update/:id/json", userAuthantice, get_update_product_json); //
router.put("/store/product/update/:id", upload.single('image'), userAuthantice, put_update_product); //
router.get("/store/product/delete/:id", userAuthantice, delete_product); //

// category creation and updaion routs
router.get("/store/category/create", userAuthantice, get_create_category); //
router.post("/store/category/create", upload.single('video'), userAuthantice, post_create_category); //
router.get("/store/category/:id", userAuthantice, get_update_category); //
router.put("/store/category/:id", upload.single('video'), userAuthantice, put_update_category); //
router.get("/store/category/delete/:id", userAuthantice, delete_category); //

// Store others routs
router.get("/store/orders", userAuthantice, get_totalOrders);
router.get("/store/order/:id/:productId", userAuthantice, get_order); //
router.get("/store/customers", userAuthantice, get_totalUsers); //
router.get("/store/customer/:id", userAuthantice, get_customer); //
router.get("/store/bookmarks", userAuthantice, get_bookmarks); //
router.get("/store/reviews", userAuthantice, get_reviews); //

// deal with cart routs
router.post("/product/add", userAuthantice, product_addto_cart); //
router.get("/cart", userAuthantice, get_cart); //
router.post("/product/delete", userAuthantice, delete_cart_product); //
router.put("/product/update", userAuthantice, update_cart_product); //

// deal with order routs
router.get("/paypal", userAuthantice, get_show_pay_page);
router.post("/paypal/order", userAuthantice, post_createOrder);
router.post("/paypal/order/:orderId/capture", userAuthantice, post_captureOrder);

// deal with pages routs
router.get("/commerce", userFlexibleAuthentication, home); //
router.get("/categorys", userFlexibleAuthentication, categorys); //
router.get("/categorys/:id", userFlexibleAuthentication, category_products); //
router.get("/products", userFlexibleAuthentication, products); //
router.get("/product/:id", userFlexibleAuthentication, product); //
router.post("/product/:id/review", userAuthantice, product_review); //
router.post("/product/bookmark", userAuthantice, Product_bookmark); //
router.post("/product/like", userAuthantice, Product_like); //
router.get("/brands", userFlexibleAuthentication, brands); //
router.get("/brand/:brandId", userFlexibleAuthentication, brand); //
router.post("/brand/:brandId/review", userAuthantice, brand_review); //
router.post("/brand/bookmark", userAuthantice, brand_bookmark); //
router.post("/brand/like", userAuthantice, brand_like); //
router.get("/profile", userAuthantice, profile); //
router.get("/profile/edit", userAuthantice, get_profileEdit); //
router.put("/profile/edit", upload.single("picture"), userAuthantice, put_profileEdit); //
router.get("/search/:searchterm", userFlexibleAuthentication, search); //

export default router;