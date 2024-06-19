import { set } from "mongoose";
import { findFile, updateCloudinaryFile } from "../middleware/cloudinary.middleware.js";
import { totalItems } from "../middleware/productQuantity.middleware.js";
import Bookmark from "../models/bookmark.modules.js";
import Cart from "../models/cart.modules.js";
import Cartitems from "../models/cartitems.modules.js";
import Category from "../models/category.modules.js";
import Like from "../models/like.modules.js";
import Order from "../models/order.modules.js";
import Product from "../models/product.modules.js";
import Review from "../models/review.modules.js";
import Store from "../models/store.modules.js";
import User from "../models/user.modules.js";
import GoogleUser from "../models/googleuser.modules.js";

// This function return userProfile and totalQuantity on these routs who accassable withou login.
const userNotLogin = async (prams) => {
  let userProfile;
  let totalQuantity;
  if (prams) {
    userProfile = prams.picture;
    ({ totalQuantity } = await totalItems(prams._id));
    }
  return {
    userProfile,
    totalQuantity
  }
}

const home = async (req, res) => {
  try {
    console.log("Home page");
    const { userProfile, totalQuantity } = await userNotLogin(req.user);
    const carts = await Cart.find({ addToOrder: true });
    const cartsIds = carts.map(item => item._id);
    const cartItem = await Cartitems.find({ cartId: cartsIds });

    const aggregatedProducts = cartItem.reduce((acc, item) => {
      const productId = item.productId.toString();
      if (!acc[productId]) {
        acc[productId] = {
          productId: item.productId,
          produdtQty: 0
        };
      }
      acc[productId].produdtQty += item.produdtQty;
      return acc;
    }, {});
    const resultArray = Object.values(aggregatedProducts).sort((a, b) => b.produdtQty - a.produdtQty);

    // For products
    const products = await Product.find({});
    const popularProducts = [];
    const nonpopularProducts = [];
    const popularProductIds = new Set();
    const nonpopularProductIds = new Set();

    for (const key in resultArray) {
      popularProductIds.add(resultArray[key].productId.toHexString());
    }

    for (const prokey in products) {
      const p = products[prokey];
      const _id = p._id.toHexString();
      const name = p.name;
      const price = p.price;
      const picture = p.picture;
      const categoryId = p.categoryId;
      const storeId = p.storeId;

      const productItem = {
        _id,
        name,
        price,
        picture,
        categoryId,
        storeId,
      };

      if (popularProductIds.has(_id)) {
        popularProducts.push(productItem);
        popularProductIds.add(_id); // This line is redundant but for clarity added
      } else if (!nonpopularProductIds.has(_id)) {
        nonpopularProducts.push(productItem);
        nonpopularProductIds.add(_id);
      }
    }
    // console.log("P P: ", popularProducts);
    // console.log("N P P: ", nonpopularProducts);
    // console.log("P P: ", popularProducts.length);
    // console.log("N P P: ", nonpopularProducts.length);
    // console.log("Products: ", products.length);
    
    // For category
    const category = await Category.find();

    const popularCategorys = [];
    const nonpopularCategorys = [];
    const popularCategoryIds = new Set();
    const nonpopularCategoryIds = new Set();

    for (const key in popularProducts) {
      popularCategoryIds.add(popularProducts[key].categoryId.toHexString());
    }

    for (const prokey in category) {
      const p = category[prokey];
      const _id = p._id.toHexString();
      const name = p.name;
      const discription = p.discription;
      const video = p.video;

      const categoryItem = {
        _id,
        name,
        discription,
        video,
      };

      if (popularCategoryIds.has(_id)) {
        popularCategorys.push(categoryItem);
        popularCategoryIds.add(_id); // This line is redundant but for clarity added
      } else if (!nonpopularCategoryIds.has(_id)) {
        nonpopularCategorys.push(categoryItem);
        nonpopularCategoryIds.add(_id);
      }
    }
    // console.log("P C: ", popularCategorys);
    // console.log("N P C: ", nonpopularCategorys);

    // For brands
    const brand = await Store.find();

    const popularBrands = [];
    const nonpopularBrands = [];
    const popularBrandIds = new Set();
    const nonpopularBrandIds = new Set();

    for (const key in popularProducts) {
      popularBrandIds.add(popularProducts[key].storeId.toHexString());
    }

    for (const prokey in brand) {
      const p = brand[prokey];
      const _id = p._id.toHexString();
      const logo = p.logo;

      const brandItem = {
        _id,
        logo,
      };

      if (popularBrandIds.has(_id)) {
        popularBrands.push(brandItem);
        popularBrandIds.add(_id); // This line is redundant but for clarity added
      } else if (!nonpopularBrandIds.has(_id)) {
        nonpopularBrands.push(brandItem);
        nonpopularBrandIds.add(_id);
      }
    }
    // console.log("P B: ", popularBrands);
    // console.log("N P B: ", nonpopularBrands);

    // For reviews
    const reviews = await Review.find().select("storeId userId rating review");
    const usersIds = reviews.reduce((acc, item) => {
      const userIdStr = item.userId.toString();

      if (!acc.some(id => id.toString() === userIdStr)) {
        acc.push(item.userId);
      }

      return acc;
    }, []);

    const userarr1 = await User.find({ _id: { $in: usersIds } }).select("_id name picture");
    const userarr2 = await GoogleUser.find({_id: { $in: usersIds }}).select("_id name picture");
    const user = userarr1.concat(userarr2);

    const reviewIs = [];
    for (const key in reviews) {
      if (reviews[key].storeId) {
        for (const userkey in user) {
          if (reviews[key].userId.toHexString() === user[userkey]._id.toHexString()) {
            reviewIs.push({
              name: user[userkey].name,
              picture: user[userkey].picture,
              rating: reviews[key].rating,
              review: reviews[key].review,
            });
          }
        }
        }
        }

        // console.log("Store reviews: ", reviewIs);
        res.status(200).render("index", {
      totalQuantity,
      userProfile,
      popularProducts,
      nonpopularProducts,
      popularCategorys,
      nonpopularCategorys,
      popularBrands,
      nonpopularBrands,
      reviewIs
    });
  } catch (error) {
    res.status(500).json('Error during Home page');
  }
};

const categorys = async (req, res) => {
  try {
    console.log("Categories page");
    const { userProfile, totalQuantity } = await userNotLogin(req.user);
    const cat_res = await Category.find()
      .select("-discription -createdAt -updatedAt");

    res.status(200).render("categories", { totalQuantity, userProfile, category: cat_res });
  } catch (error) {
    res.status(500).json('Error to get categories page');
  }
};

const category_products = async (req, res) => {
  try {
    console.log("Category Items page");
    const { userProfile, totalQuantity } = await userNotLogin(req.user);
    const category = req.params.id;

    const cat_res = await Category.findOne({ _id: category })
      .select("-createdAt -updatedAt");
    const productsIs = await Product.find({ categoryId: cat_res._id }).select("_id name price picture storeId");

    const storIds = productsIs.reduce((acc, product) => {
      const storeIdStr = product.storeId.toString();

      // Check if the category ID (as a string) is already in the array
      if (!acc.some(id => id.toString() === storeIdStr)) {
        acc.push(product.storeId);
      }

      return acc;
    }, []);

    // console.log("Category: ", cat_res);
    // console.log("Category Items: ", productsIs);
    // console.log("Category Stor Ids: ", storIds);

    const stors = await Store.find({ _id: { $in: storIds } }).select("_id name logo");

    res.status(200).render("category", { totalQuantity, userProfile, category: cat_res, productsIs, stors });
  } catch (error) {
    res.status(500).json('Error to get category items page');
  }
};

const products = async (req, res) => {
  try {
    console.log("Products page!");
    const { userProfile, totalQuantity } = await userNotLogin(req.user);
    const product_res = await Product.find()
      .select("-stockQty -discription -storeId -categoryId -createdAt -updatedAt");

    res.status(200).render("products", { totalQuantity, userProfile, product: product_res });
  } catch (error) {
    res.status(500).json('Error to get products page');
  }
};

const product = async (req, res) => {
  try {
    console.log("Product page!");
    const _id = req.params.id;
    // const userProfile = req.user.picture;
    // const { totalQuantity } = await totalItems(req.user._id);
    const { userProfile, totalQuantity } = await userNotLogin(req.user);
    const product_res = await Product.findById({ _id })
      .select("-stockQty -categoryId -createdAt -updatedAt");

    res.status(200).render("product", { totalQuantity, userProfile, product: product_res });
  } catch (error) {
    res.status(500).json('Error to get product page');
  }
};

const product_review = async (req, res) => {
  try {
    console.log("Product review page!");
    // Declarations
    const productId = req.params.id;
    const userId = req.user._id;
    const { rating, review } = req.body;

    // console.log("Body", req.body);

    // Data validation
    if (!rating || !review) {
      res.status(401).send("All field are required!");
      return;
    }
    if (rating.trim() === "" || review.trim() === "") {
      res.status(401).send("Not any blanck field!");
      return;
    }

    // Review validation
    if (review.length < 5 || review.length > 250) {
      res.status(401).send("Review is invalid");
      return;
    }

    // Rating validation
    const validRatings = [1, 2, 3, 4, 5];
    if (!validRatings.includes(parseInt(rating))) {
      res.status(401).send("Rating is invalid");
      return;
    }

    // Store validation
    const productis = await Product.findOne({ _id: productId })
      .select("_id");
    if (!productis) {
      res.status(401).send("Product is invalid");
      return;
    }

    const newReview = new Review({
      userId,
      productId: productis._id,
      rating,
      review,
    });

    await newReview.save();
    // const saveReview = await newReview.save();
    // console.log("Review response: ", saveReview);

    res.status(200).redirect(`/bahadur/v1/product/${productis._id}`);
  } catch (error) {
    res.status(500).json('Error to get product page');
  }
};

const Product_bookmark = async (req, res) => {
  try {
    console.log("Product bookmark!");
    const userId = req.user._id;
    const { itemId } = req.body;
    let productIs;
    let respBookmark;

    const storeIs = await Store.findOne({ userId }).select("_id");
    // Ensure storeId is not equal to the given storeId
    if (!storeIs) {
      productIs = await Product.findOne({ _id: itemId }).select("_id");
    } else {
      productIs = await Product.findOne({ _id: itemId, storeId: { $ne: storeIs._id } }).select("_id");
    }

    // Product validation
    if (!productIs) {
      res.status(401).json({ message: "You are clever. Want to bookmark your item?" });
      return;
    }

    const productId = productIs._id;

    if (userId || productId) {
      const bookmarkIs = await Bookmark.findOne({ userId, productId });
      if (bookmarkIs === null) {
        const newBookmark = new Bookmark({
          userId,
          productId,
          status: true,
        });
        await newBookmark.save();

      } else {
        let bookmarkSituation = bookmarkIs.status === true ? false : true;

        respBookmark = await Bookmark.findOneAndUpdate(
          { $and: [{ userId }, { productId }] },
          { status: bookmarkSituation }, { new: true }).select("status");
      };
    };

    res.status(200).json({ message: "Successfully Update Bookmark!" });
  } catch (error) {
    res.status(500).json('Error to bookmark product');
  }
};

const Product_like = async (req, res) => {
  try {
    console.log("Product Like!");
    const userId = req.user._id;
    const { itemId } = req.body;
    let productIs;
    let respLike;

    // console.log("Body", req.body, itemId);

    const storeIs = await Store.findOne({ userId }).select("_id");
    // Ensure storeId is not equal to the given storeId
    if (!storeIs) {
      productIs = await Product.findOne({ _id: itemId }).select("_id");
    } else {
      productIs = await Product.findOne({ _id: itemId, storeId: { $ne: storeIs._id } }).select("_id");
    }
    // Product validation
    if (!productIs) {
      res.status(401).json({ message: "You are clever. Want to like your item?" });
      return;
    }

    const productId = productIs._id;

    if (userId || productId) {
      const likeIs = await Like.findOne({ userId, productId });
      if (likeIs === null) {
        const newLike = new Like({
          userId,
          productId,
          status: true,
        });
        await newLike.save();

      } else {
        let likeSituation = likeIs.status === true ? false : true;

        respLike = await Like.findOneAndUpdate(
          { $and: [{ userId }, { productId }] },
          { status: likeSituation }, { new: true }).select("status");
      };
    };

    res.status(200).json({ message: "Successfully Update Like!" });
  } catch (error) {
    res.status(500).json('Error to Like product');
  }
};

const brands = async (req, res) => {
  try {
    console.log("Stores page!");

    const { userProfile, totalQuantity } = await userNotLogin(req.user);
    const allstore = await Store.find().select("_id name logo");

    res.status(200).render("brands", { totalQuantity, userProfile, allstore });
  } catch (error) {
    res.status(500).json('Error to get brands page');
  }
};

const brand = async (req, res) => {
  try {
    console.log("Brand page")

    const { userProfile, totalQuantity } = await userNotLogin(req.user);
    const brandId = req.params.brandId;

    const brandis = await Store.findOne({ _id: brandId })
      .select("-userId -password");
    const products = await Product.find({ storeId: brandId })
      .select("_id name price picture");
    const find_bookmark = await Bookmark.findOne({ storeId: brandis._id }).select("status");
    const find_like = await Like.findOne({ storeId: brandis._id }).select("status");

    res.status(200).render("brand", { totalQuantity, userProfile, brandis, products, find_bookmark, find_like });
  } catch (error) {
    res.status(500).json('Error to get brand page');
  }
};

const brand_review = async (req, res) => {
  try {
    console.log("Post brand review page!");
    // Declarations
    const brandId = req.params.brandId;
    const userId = req.user._id;
    const { rating, review } = req.body;

    // console.log("Body", req.body);

    // Data validation
    if (!rating || !review) {
      res.status(401).send("All field are required!");
      return;
    }
    if (rating.trim() === "" || review.trim() === "") {
      res.status(401).send("Not any blanck field!");
      return;
    }

    // Review validation
    if (review.length < 5 || review.length > 250) {
      res.status(401).send("Review is invalid");
      return;
    }

    // Rating validation
    const validRatings = [1, 2, 3, 4, 5];
    if (!validRatings.includes(parseInt(rating))) {
      res.status(401).send("Rating is invalid");
      return;
    }

    // Store validation
    const brandis = await Store.findOne({ _id: brandId })
      .select("_id");
    if (!brandis) {
      res.status(401).send("Brand is invalid");
      return;
    }

    const newReview = new Review({
      userId,
      storeId: brandis._id,
      rating,
      review,
    });
    await newReview.save();

    res.status(200).redirect(`/bahadur/v1/brand/${brandis._id}`);
  } catch (error) {
    res.status(500).json('Error to get brands page');
  }
};

const brand_bookmark = async (req, res) => {
  try {
    console.log("Brand bookmark page!");
    const userId = req.user._id;
    const { brandId } = req.body;

    // Ensure userId is not equal to the given userId
    const storeIs = await Store.findOne({ _id: brandId, userId: { $ne: userId } }).select("_id");

    // Store validation
    if (!storeIs) {
      res.status(401).json({ message: "You are clever. Want to bookmark your Brand?" });
      return;
    }

    const storeId = storeIs._id;
    if (userId || storeId) {
      const bookmarkIs = await Bookmark.findOne({ userId, storeId });
      if (bookmarkIs === null) {
        const newBookmark = new Bookmark({
          userId,
          storeId,
          status: true,
        });
        await newBookmark.save();

      } else {
        let bookmarkSituation = bookmarkIs.status === true ? false : true;

        await Bookmark.findOneAndUpdate(
          { $and: [{ userId }, { storeId }] },
          { status: bookmarkSituation }, { new: true }).select("status");
      };
    };

    res.status(200).json({ message: "Successfully Update Bookmark!" });
  } catch (error) {
    res.status(500).json('Error to bookmark Brand');
  }
};

const brand_like = async (req, res) => {
  try {
    console.log("Brand Like page!");
    const userId = req.user._id;
    const { brandId } = req.body;

    // Ensure userId is not equal to the given userId
    const storeIs = await Store.findOne({ _id: brandId, userId: { $ne: userId } }).select("_id");

    // Store validation
    if (!storeIs) {
      res.status(401).json({ message: "You are clever. Want to Like your Brand?" });
      return;
    }

    const storeId = storeIs._id;

    if (userId || storeId) {
      const likeIs = await Like.findOne({ userId, storeId });
      if (likeIs === null) {
        const newLike = new Like({
          userId,
          storeId,
          status: true,
        });
        await newLike.save();

      } else {
        let likeSituation = likeIs.status === true ? false : true;

        await Like.findOneAndUpdate(
          { $and: [{ userId }, { storeId }] },
          { status: likeSituation }, { new: true }).select("status");
      };
    };

    res.status(200).json({ message: "Successfully Update Like!" });
  } catch (error) {
    res.status(500).json('Error to Like Brand');
  }
};

const profile = async (req, res) => {
  try {
    console.log("Profile page!");
    const user = req.user;
    const userProfile = user.picture;
    const { totalQuantity } = await totalItems(req.user._id);
    const storis = await Store.findOne({ userId: user._id }).select("name logo")
    const orders = await Order.find({ customerId: user._id }).select("_id");
    const bookmarks = await Bookmark.find({ userId: user._id }).select("_id");
    const likes = await Like.find({ userId: user._id }).select("_id");
    const data = {
      orderIs: orders.length,
      bookmarkIs: bookmarks.length,
      likeIs: likes.length,
    }

    // console.log("Data Is: ", data);

    res.status(200).render("userprofile", { totalQuantity, userProfile, user, storis, data });
  } catch (error) {
    res.status(500).json('Error to get profile page');
  }
};

const get_profileEdit = async (req, res) => {
  try {
    console.log("Profile Edit page!");
    const user = req.user;

    res.status(200).render("profileedit", { user });
  } catch (error) {
    res.status(500).json('Error to get profile Edit page');
  }
};

const put_profileEdit = async (req, res) => {
  try {
    console.log("Profile edit put!");
    const { name, email } = req.body;
    const user = req.user;
    const file = req.file.path;

    if (!name || !email || !user || !file) {
      req.status(400).send({ message: "All fiels are require!" });
      return;
    };
    if (name.length < 3 || name.length > 50) {
      req.status(400).send({ message: "Name length is incorrect!" });
      return;
    };
    // Email validation
    if (email.length < 13 || email.length > 40 || email === "") {
      res.status(401).send("Email is invalid");
      return;
    }
    if (!email.includes("@") || !email.includes(".")) {
      res.status(401).send("Email is invalid");
      return;
    }

    const find_file_Id = await findFile(user.picture);
    const cloudinary_output = await updateCloudinaryFile(find_file_Id, file)
    const picture = cloudinary_output;

    await User.findOneAndUpdate(
      {
        _id: user._id
      },
      {
        name,
        email,
        picture,
      },
      { new: true }
    );

    res.status(200).json({ message: "Successfully update user data!" });
  } catch (error) {
    res.status(500).json('Error to update profile');
  }
};

const search = async (req, res) => {
  try {
    console.log("Search page");
    const input = req.params.searchterm;
    // const userProfile = req.user.picture;
    // const { totalQuantity } = await totalItems(req.user._id);
    const { userProfile, totalQuantity } = await userNotLogin(req.user);
    // console.log("Search Is: ", input);
    // ......................................................

    function tokenize(searchTerm) {
      return searchTerm.split(/\s+/);
    }

    function constructQuery(tokens) {
      return {
        $or: [
          { name: { $regex: tokens.join('|'), $options: 'i' } },
          { discription: { $regex: tokens.join('|'), $options: 'i' } }
        ]
      };
    }

    // Usage of tokenize and constructQuery
    const searchTerm = input;
    const tokens = tokenize(searchTerm);
    console.log("Tokens Is:", tokens);
    const query = constructQuery(tokens);
    // console.log("Query Is:", query);

    let products = await Product.find(query)
      .select("_id name picture price categoryId storeId");
    const stors = await Store.find(query).select("_id name logo");
    const storProductIds = stors.map(item => item._id);
    const storeproducts = await Product.find({ storeId: { $in: storProductIds } })
      .select("_id name picture price categoryId storeId");

    // Function to merge unique objects from array2 into array1
    function mergeUniqueObjects(arr1, arr2) {
      // Create a set of ids from arr1 for quick lookup
      const idsInArr1 = new Set(arr1.map(obj => obj.id));

      arr2.forEach(obj => {
        // Check if the Set does not contain the current object's id
        if (!idsInArr1.has(obj.id)) {
          arr1.push(obj);
        }
      });

      return arr1;
    }
    // Merge array2 into array1
    const mergedArray = mergeUniqueObjects(products, storeproducts);
    // console.log("Merged Array is: ", mergedArray);

    const cateIds = async () => {
      const uniqueIds = mergedArray.reduce((acc, product) => {
        const categoryIdStr = product.categoryId.toString();

        // Check if the category ID (as a string) is already in the array
        if (!acc.some(id => id.toString() === categoryIdStr)) {
          acc.push(product.categoryId);
        }

        return acc;
      }, []);

      return uniqueIds;
    };

    const storeIds = async () => {
      const uniqueIds = mergedArray.reduce((acc, product) => {
        const storeIdStr = product.storeId.toString();

        // Check if the category ID (as a string) is already in the array
        if (!acc.some(id => id.toString() === storeIdStr)) {
          acc.push(product.storeId);
        }

        return acc;
      }, []);

      return uniqueIds;
    };

    const storeArr = await storeIds();
    const categoryArr = await cateIds();
    const searchedStors = await Store.find({ _id: { $in: storeArr } }).select("_id name logo");
    const searchedCategorys = await Category.find({ _id: { $in: categoryArr } }).select("_id name video");

    // console.log("Search Store: ", searchedStors);
    // console.log("Search Categorys: ", searchedCategorys);

    res.status(200).render("search", { userProfile, totalQuantity, productsIs: mergedArray, searchedStors, searchedCategorys, message: "Successfully search data!" });
  } catch (error) {
    res.status(500).json('Error to search data');
  }
};

export {
  home,
  categorys,
  category_products,
  products,
  product,
  product_review,
  Product_bookmark,
  Product_like,
  brands,
  brand,
  brand_review,
  brand_bookmark,
  brand_like,
  profile,
  get_profileEdit,
  put_profileEdit,
  search
}