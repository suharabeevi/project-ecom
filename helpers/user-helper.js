// const usercontroller= require('../controllers/usercontrol')
//const users = require('../model/user-model')
const users = require("../model/user-model");
const bcrypt = require("bcrypt");
const PRODUCT = require("../model/product-model");
const CART = require("../model/cart-model");
const objectId = require("mongodb").ObjectId;
const Product = require("../model/product-model");
const { response } = require("express");
const { ObjectId } = require("bson");
const coupon = require("../model/coupon-model");
const User = require("../model/user-model");

module.exports = {
  findings: (pagenum, perPage) => {
    return new Promise(async (resolve, reject) => {
      let finduser = await users
        .find()
        .skip((pagenum - 1) * perPage)
        .limit(perPage);
      // console.log(finduser);
      resolve(finduser);
    });
  },
  Getuser: (Userid) => {
    return new Promise(async (resolve, reject) => {
      let finduser = await users.find({ _id: Userid });
      // console.log(finduser);
      resolve(finduser);
    });
  },
  adduser: (user) => {
    return new Promise(async (resolve, reject) => {
      let userDetails = new users({
        firstName: user.firstname,
        email: user.email,
        contact: user.contact,
        password: user.password,
        status: true,
      });
      
      userDetails.save();
      resolve(userDetails);
    });
  },
  getuser: async (email, password) => {
    try {
      const user = await users.findOne({ email: email });
      if (user) {
        const status = await new Promise((resolve, reject) => {
          bcrypt.compare(password, user.password, (err, result) => {
            if (err) {
              reject(err);
            } else {
              resolve(result);
            }
          });
        });
        if (status === true) {
          return { user };
        } else {
          return { message: "password error" };
        }
      } else {
        return { message: "user not found" };
      }
    } catch (err) {
      console.log(err);
      return err;
    }
  },
  GetsingleProduct: (SingleProID) => {
    return new Promise(async (resolve, reject) => {
      const getsingleproduct = await PRODUCT.findOne({ _id: SingleProID });

      if (getsingleproduct) {
        resolve(getsingleproduct);
      }
    });
  },

  cart_page: async (userId, productId) => {
    const productObj = {
      item: new objectId(productId),
      quantity: 1,
    };

    try {
      const userCart = await CART.findOneAndUpdate(
        { userId, "products.item": productObj.item },
        { $inc: { "products.$.quantity": 1 } },

        { new: true }
      );
      if (userCart) {
        return userCart;
      }
      const newCart = await CART.findOneAndUpdate(
        { userId },
        { $push: { products: productObj } },
        { new: true, upsert: true }
      );

      return newCart;
    } catch (err) {
      console.error(err);
      throw err;
    }
  },
  getQuantiy: async (userId, proId) => {
    let data = await CART.aggregate([
      // Match cart with given userId
      {
        $match: {
          userId: new ObjectId(userId),
        },
      },
      // Unwind the products array
      {
        $unwind: "$products",
      },
      // Lookup the product document
      {
        $lookup: {
          from: "products",
          localField: "products.item",
          foreignField: "_id",
          as: "product",
        },
      },
      // Unwind the product array
      {
        $unwind: "$product",
      },
      // Match the product with the given productId
      {
        $match: {
          "product._id": new ObjectId(proId),
        },
      },
      // Project the quantity field
      {
        $project: {
          _id: 0,
          quantity: "$products.quantity",
        },
      },
      // Group the results to check if the product exists in cart or not
      {
        $group: {
          _id: null,
          quantity: {
            $sum: "$quantity",
          },
        },
      },
      // Project the final result
      {
        $project: {
          _id: 0,
          quantity: {
            $cond: {
              if: {
                $eq: ["$quantity", null],
              },
              then: 0,
              else: "$quantity",
            },
          },
        },
      },
    ]);

    console.log(data[0]);
    return data[0];
  },

  getcart_products: (user) => {
    return new Promise(async (resolve, reject) => {
      let cartitems = await CART.aggregate([
        {
          $match: { userId: new objectId(user) },
        },
        {
          $unwind: "$products",
        },
        {
          $lookup: {
            from: "products",
            localField: "products.item",
            foreignField: "_id",
            as: "product",
          },
        },
        {
          $project: {
            _id: 1,
            item: "$products.item",
            quantity: "$products.quantity",
            price: { $arrayElemAt: ["$product.price", 0] },
            stock: { $arrayElemAt: ["$product.stock", 0] },
            name: { $arrayElemAt: ["$product.name", 0] },
            product: { $arrayElemAt: ["$product", 0] },
            subtotal: {
              $multiply: [
                "$products.quantity",
                { $arrayElemAt: ["$product.price", 0] },
              ],
            },
          },
        },
      ]);
      cartitems = JSON.parse(JSON.stringify(cartitems));
      resolve(cartitems);
    });
  },
  getcart_count: (user) => {
    return new Promise(async (resolve, reject) => {
      try {
        const cart = await CART.findOne({ userId: user });
        if (cart) {
          const cartcount = cart.products.length;
          console.log(cartcount);
          resolve(cartcount);
        } else {
          resolve(0);
        }
      } catch (err) {
        console.error(err);
        reject(err);
      }
    });
  },
  updateQuantity: (data) => {
    let cartId = new ObjectId(data.cart);
    let proId = new ObjectId(data.product);
    let userId = new ObjectId(data.user);
    let count = parseInt(data.count);
    let quantity = parseInt(data.quantity);

    console.log(cartId, proId, userId, count, quantity);
    try {
      return new Promise(async (resolve, reject) => {
        if (count == -1 && quantity == 1) {
          CART.findOneAndUpdate(
            { userId: userId },
            {
              $pull: { products: { item: proId } },
            }
          ).then(() => {
            resolve({ removed: true });
          });
        } else {
          CART.findOneAndUpdate(
            { userId: userId, "products.item": proId },
            { $inc: { "products.$.quantity": count } },
            { new: true }
          ).then(() => {
            CART.findOne(
              { _id: cartId, "products.item": proId },
              { "products.$": 1 }
            ).then((cart) => {
              const newQuantity = cart.products[0].quantity;
              resolve({ status: true, newQuantity: newQuantity });
            });
          });
        }
      });
    } catch (error) {
      console.log(error.message);
    }
  },
  totalCheckOutAmount: (user) => {
    try {
      return new Promise((resolve, reject) => {
        CART.aggregate([
          {
            $match: { userId: new objectId(user) },
          },
          {
            $unwind: "$products",
          },
          {
            $project: {
              item: "$products.item",
              quantity: "$products.quantity",
            },
          },
          {
            $lookup: {
              from: "products",
              localField: "item",
              foreignField: "_id",
              as: "product",
            },
          },
          {
            $project: {
              item: 1,
              quantity: 1,
              product: { $arrayElemAt: ["$product", 0] },
            },
          },
          {
            $group: {
              _id: null,
              total: { $sum: { $multiply: ["$quantity", "$product.price"] } },
            },
          },
        ]).then((total) => {
          resolve(total[0]?.total);
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  },
  deleteProduct: (data) => {
    let cart = new ObjectId(data.cart);
    let product = new ObjectId(data.product);

    try {
      return new Promise((resolve, reject) => {
        CART.updateOne(
          { _id: cart },
          {
            $pull: { products: { item: product } },
          }
        ).then(() => {
          resolve({ status: true });
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  },
  filtercategory: (name) => {
    return new Promise(async (resolve, reject) => {
      let productfind = await PRODUCT.find({ categoryname: name });
      resolve(productfind);
    });
  },
  GET_PRODUCTS: (proId) => {
    return new Promise(async (resolve, reject) => {
      let productfind = await PRODUCT.find({ _id: proId });
      resolve(productfind);
    });
  },
  getDetails: (userId) => {
    try {
      return new Promise((resolve, reject) => {
        users.findOne({ _id: userId }).then((user) => {
          resolve(user);
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  },
  Findings: (pagenum, perPage) => {
    return new Promise(async (resolve, reject) => {
      let finduser = await Product.find()
        .skip((pagenum - 1) * perPage)
        .limit(perPage);
      // console.log(finduser);
      resolve(finduser);
    });
  },

  verifyCoupon: (userId, couponCode) => {
    try {
      return new Promise((resolve, reject) => {
        coupon.find({ couponCode: couponCode }).then(async (couponExist) => {
          if (couponExist) {
            if (new Date(couponExist[0].validity) - new Date() > 0) {
              let usersCoupon = await User.findOne({
                _id: userId,
                coupons: { $in: [couponCode] },
              });
              console.log(usersCoupon, "usercoupon");
              if (usersCoupon) {
                resolve({
                  status: false,
                  message: "Coupon already used by the user",
                });
              } else {
                resolve({ status: true, message: "Coupon added successfuly" });
              }
            } else {
              resolve({ status: false, message: "Coupon have expiried" });
            }
          } else {
            resolve({ status: false, message: "Coupon doesnt exist" });
          }
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  },
  applyCoupon: (couponCode, total) => {
    console.log(couponCode, total);
    try {
      return new Promise((resolve, reject) => {
        coupon.findOne({ couponCode: couponCode }).then((couponExist) => {
          if (couponExist) {
            if (new Date(couponExist.validity) - new Date() > 0) {
              if (total >= couponExist.minAmount) {
                let discountAmount =
                  (total * couponExist.minDiscountPercentage) / 100;
                if (discountAmount > couponExist.maxDiscountValue) {
                  discountAmount = couponExist.maxDiscountValue;
                  resolve({
                    status: true,
                    discountAmount: discountAmount,
                    discount: couponExist.minDiscountPercentage,
                    couponCode: couponCode,
                  });
                  console.log(discountAmount, "amounttta");
                } else {
                  resolve({
                    status: true,
                    discountAmount: discountAmount,
                    discount: couponExist.minDiscountPercentage,
                    couponCode: couponCode,
                  });
                }
              } else {
                resolve({
                  status: false,
                  message: `Minimum purchase amount is ${couponExist.minAmount}`,
                });
              }
            } else {
              resolve({
                status: false,
                message: "Counpon expired",
              });
            }
          } else {
            resolve({
              status: fasle,
              message: "Counpon doesnt Exist",
            });
          }
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  },

  setNewPassword: (userDetails) => {
    return new Promise(async (resolve, reject) => {
      let userMobile = Number(userDetails.dcontact);
      try {
        let userPassword = await bcrypt.hash(userDetails.npassword, 10);
        users
          .updateOne(
            { contact: userMobile },
            {
              $set: {
                password: userPassword,
              },
            }
          )
          .then((response) => {
            resolve(response);
          });
      } catch (err) {
        console.log(err);
      }
    });
  },
  totalcoupons: () => {
    return new Promise(async (resolve, reject) => {
      let getcoupon = await coupon.find();
      resolve(getcoupon);
    });
  },
  getQueriesOnShop: (query) => {
    const search = query?.search
    const sort = query?.sort
    const filter = query?.filter
    const page = parseInt(query?.page) || 1
    const perPage = 10
console.log(filter,'----');
    // console.log(search, sort, filter, page, perPage)

        return new Promise( async(resolve, reject) =>{

            let filterObj = {}

            if (filter === 'category=mens') {
                filterObj = { categoryname: 'mens' }
            } else if (filter === 'category=women') {
                filterObj = { categoryname: 'women' }
            } else if (filter === 'category=Kids') {
                filterObj = { categoryname: 'Kids' }
            }else if (filter === 'category=ladies') {
              filterObj = { categoryname: 'ladies' }
          }
            console.log(filterObj,'filterObj');

            //Building search query

            let searchQuery = {}

            if (search) {
                searchQuery = {
                    $or: [
                        { producttitle: { $regex: search, $options: 'i' } },
                        { description: { $regex: search, $options: 'i' } }
                    ]
                }
            }

            //Building object based on query parameter

            let sortObj = {}

            if (sort === '-createdAt') {
                sortObj = { createdAt: -1 };
            } else if (sort === 'createdAt') {
                sortObj = { createdAt: 1 };
            } else if (sort === '-price') {
                sortObj = { price: -1 };
            } else if (sort === 'price') {
                sortObj = { price: 1 };
            }

            const skip = (page - 1) * perPage;
            const data = await PRODUCT.find({
                ...searchQuery,
                ...filterObj,
            })
                .sort(sortObj)
                .skip(skip)
                .limit(perPage);
                console.log(data,'product');


            const totalProducts = await PRODUCT.countDocuments({
                ...searchQuery,
                ...filterObj,
            });

        //    console.log(searchQuery,'searchQuery');
        //    console.log(sortObj,'sortObj');
        //    console.log(skip,'skip');
        //    console.log(product,'product');
           console.log(totalProducts,'totalProducts');

            const totalPages = Math.ceil(totalProducts / perPage);
            if(data.length==0){
                resolve({
                    noProductFound:true,
                    Message:"No results found.."
                })
            }
            resolve({
                data,
                noProductFound:false,
                currentPage: page,
                totalPages,
              });

        })    

},
getShop: () => {
  try {
      return new Promise((resolve, reject) => {
          Product.find().then((product) => {
              if (product) {
                  resolve(product)
              } else {
                  console.log('product not found');
              }
          })
      })
  } catch (error) {
      console.log(error.message);
  }
},
getCartProductList: (userId) => {
  return new Promise(async(resolve,reject) => {
      let cart = await CART
          .findOne({userId:new ObjectId(userId)})
      console.log(cart);
      if (cart !== null) {
          resolve(cart.products)
      } else {
          reject(new Error('Cart not found for user'))
      }
  })
},



};
