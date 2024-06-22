import Product from "../models/product.modules.js";
// import User from "../models/user.modules.js";
import Store from "../models/store.modules.js";
import {deletefile, findFile, updateCloudinaryFile, uponCloudinary} from "../middleware/cloudinary.middleware.js";
import Category from "../models/category.modules.js";
import { diskStorage, memoryStorage } from "multer";

const get_products = async (req, res) => {
    try {
        console.log("Producs!");
        const getstore = req.user._id;
        const data = await Store.findOne({ userId: getstore });
        const products = await Product.find({ storeId: data._id });
        const productIds = products.map(item => item.categoryId);
        const categorys = await Category.find({ _id: { $in: productIds } });

        const storelogo = data.logo;
        res.status(200).render("store_products", { storelogo, products, categorys, message: "Successfully get products!" });
    } catch (error) {
        res.status(500).json({ message: "Someone error during get products!" });
    }
};

const get_create_product = async (__, res) => {
    try {
        // show form page for product creation
        console.log("Product creation!");
        const category = await Category.find().select("name");
        res.status(200).render("store_product_add",{ category, message: "Successfully get form for create product!" });
    } catch (error) {
        res.status(500).json({ message: "Someone error during get create product!" });
    }
};

const post_create_product = async (req, res) => {
    try {
        console.log("Product create Post!");
        const { name, price, stockQty, discription, category } = req.body;
        const user = req.user._id;
        // const file = req.file.path;
        const file = req.file.buffer;
        // console.log("data is: ", name, price, stockQty, discription, user, file, category);
        if (!name || !price || !stockQty || !discription || !category || !file) {
            req.status(400).json({ message: "All fiels are require!" });
            return;
        };
        if (name.length < 3 || name.length > 50) {
            req.status(400).json({ message: "Name length is incorrect!" });
            return;
        };
        if (price < 1) {
            req.status(400).json({ message: "Price is incorrect!" });
            return;
        };
        if (stockQty.length < 1) {
            req.status(400).json({ message: "Stock Quantity is incorrect!" });
            return;
        };
        if (discription.length < 15 || discription.length > 250) {
            req.status(400).json({ message: "Description is must be between 15 to 250 leaters!" });
            return;
        };
        const findCategory = await Category.findOne({name: category}).select("_id");
        const categoryId = findCategory._id;
        if ((categoryId === null)) {
            req.status(400).json({ message: "Category is incorrect!" });
            return;
        };

        const given_user = await Store.findOne({ userId: user });
        const storeId = given_user._id;

        if (!storeId) {
            req.status(400).json({ message: "Store not exist!" });
            return;
        };

        const cloudinary_output = await uponCloudinary(file);
        // console.log("Cloudiners res: ", cloudinary_output);

        // // For diskStorage
        // const picture = cloudinary_output.url;

        // For memoryStorage
        const picture = cloudinary_output.secure_url;

        const newproduct = new Product({
            name,
            price,
            stockQty,
            picture,
            discription,
            storeId,
            categoryId,
        });
        await newproduct.save();
        // console.log("Created product is: ", save_product);
        res.status(200).json({ message: "Successfully create product!" });
    } catch (error) {
        res.status(500).json({ message: "Someone error during Create product!" });
    }
};

const get_update_product = async (__, res) => {
    try {
        res.status(200).render("store_product_edit");
    } catch (error) {
        res.status(500).json({ message: "Someone error during get update product!" });
    }
};

const get_update_product_json = async (req, res) => {
    try {
        const pro = req.params.id;
        // console.log("Params is", pro);
        const gproduct = await Product.findOne({_id: pro})
        .select("_id name price stockQty discription categoryId");
        const catg = await Category.find().select("name");
        res.status(200).json({ gproduct, catg });
    } catch (error) {
        res.status(500).json({ message: "Someone error during get update product json data!" });
    }
};

const put_update_product = async (req, res) => {
    try {
        console.log("Updata product");
        const productis = req.params.id;
        const { name, price, stockQty, discription, category } = req.body;
        const user = req.user._id;
        // const file = req.file.path;
        const file = req.file.buffer;
        // console.log("file is: ", file);
        // console.log("F is: ", name, price, stockQty, discription, user, file, productis);
        if (!name || !price || !stockQty || !discription || !category || !file) {
            req.status(400).send({ message: "All fiels are require!" });
            return;
        };
        if (name.length < 3 || name.length > 50) {
            req.status(400).send({ message: "Name length is incorrect!" });
            return;
        };
        if (price < 1) {
            req.status(400).send({ message: "Price is incorrect!" });
            return;
        };
        if (stockQty.length < 1) {
            req.status(400).send({ message: "Stock Quantity is incorrect!" });
            return;
        };
        if (discription.length < 15 || discription.length > 250) {
            req.status(400).send({ message: "Description is must be between 15 to 250 leaters!" });
            return;
        };
        const findCategory = await Category.findOne({name: category}).select("_id");
        if ((findCategory._id === null)) {
            req.status(400).send({ message: "Category is incorrect!" });
            return;
        };
        const given_store = await Store.findOne({ userId: user });
        const storeId = given_store._id;
        if (!storeId) {
            req.status(400).send({ message: "Store not exist!" });
            return;
        };
        const prod = await Product.findById({_id: productis});
        // Extrect Cloudinary picture id from picture url
        const find_file_Id = await findFile(prod.picture);
        const cloudinary_output = await updateCloudinaryFile(find_file_Id, file);
        const picture = cloudinary_output;

        const newproduct = await Product.findOneAndUpdate(
            {
                _id: prod._id
            },
            {
                name,
                price,
                stockQty,
                picture,
                discription,
                storeId,
                categoryId: findCategory._id,
            },
            { new: true }
        );

        res.status(200).json({ newproduct, message: "Successfully update product!" });
    } catch (error) {
        res.status(500).json({ message: "Someone error during get update product!" });
    }
};

const delete_product = async (req, res) => {
    try {
        const id = req.params.id;
        const del_product = await Product.findOneAndDelete({ _id: id });
        const publicId = await findFile(del_product.picture);
        await deletefile(publicId);
        // const deleteis = await deletefile(publicId);
        res.status(200).json({ del_product, message: "Successfully delete product!" });
    } catch (error) {
        res.status(500).json({ message: "Someone error during delete product!" });
    }
};
export {
    get_products,
    get_create_product,
    post_create_product,
    get_update_product,
    get_update_product_json,
    put_update_product,
    delete_product
}