const bcrypt = require("bcrypt");
const admin = require("../model/admin-model");
const mongoose = require("mongoose");
const users = require("../model/user-model");
const categories = require("../model/category-model");
const product = require("../model/product-model");
const order = require("../model/order-model");
const Coupon = require("../model/coupon-model");
const banner = require("../model/banner-model");
const voucherCode = require("voucher-code-generator");
const Banner = require("../config/Banner");

module.exports = {
  getadmin: (email, password) => {
    return new Promise(async (resolve, reject) => {
      const Admin = await admin.findOne({ email: email });
      if (Admin) {
        if (password === Admin.password) {
          const response = Admin;
          // response.user=user
          resolve(response);
        } else {
          resolve();
        }
      } else {
        resolve();
      }
    });
  },
  blockuser: (Blockid) => {
    return new Promise(async (resolve, reject) => {
      const user = await users.updateOne(
        { _id: Blockid },
        { $set: { status: false } }
      );
      console.log(user);
      if (user) {
        resolve(user);
      } else {
        resolve();
      }
    });
  },
  unblockuser: (unblockid) => {
    return new Promise(async (resolve, reject) => {
      const user = await users.updateOne(
        { _id: unblockid },
        { $set: { status: true } }
      );
      console.log(user);
      if (user) {
        resolve(user);
      } else {
        resolve();
      }
    });
  },
  categorycheck: (name) => {
    return new Promise(async (resolve, reject) => {
      const category = await categories.findOne({ name: name });
      if (category) {
        resolve(category);
      } else {
        resolve();
      }
    });
  },
  Saveitems: (category) => {
    return new Promise(async (resolve, reject) => {
      let categoryDetails = new categories({
        name: category.category,
        description: category.description,
        numberofstock: category.stocknumber,
        status: true,
      });
      console.log("details", categoryDetails);
      await categoryDetails.save();
      resolve(categoryDetails);
    });
  },
  listcategories: () => {
    return new Promise(async (resolve, reject) => {
      let getcategory = await categories.find();
      resolve(getcategory);
    });
  },
  unlistcategory: (removecategoryid) => {
    return new Promise(async (resolve, reject) => {
      const category = await categories.updateOne(
        { _id: removecategoryid },
        { $set: { status: false } }
      );
      console.log(category);
      if (category) {
        resolve(category);
      } else {
        resolve();
      }
    });
  },
  Listcategory: (listcategoryid) => {
    return new Promise(async (resolve, reject) => {
      const category = await categories.updateOne(
        { _id: listcategoryid },
        { $set: { status: true } }
      );
      console.log(category);
      if (category) {
        resolve(category);
      } else {
        resolve();
      }
    });
  },
  Editcategory: (dataId) => {
    return new Promise(async (resolve, reject) => {
      let getcategory = await categories.findOne({ _id: dataId });
      resolve(getcategory);
    });
  },
  showproducts: (pagenum, perPage) => {
    return new Promise(async (resolve, reject) => {
      let findproduct = await product
        .find()
        .skip((pagenum - 1) * perPage)
        .limit(perPage);
      resolve(findproduct);
    });
  },
  update_category: (editID, category, stocknumber, description) => {
    return new Promise(async (resolve, reject) => {
      const UPcategory = await categories.updateOne(
        { _id: editID },
        {
          $set: {
            name: category,
            description: description,
            numberofstock: stocknumber,
          },
        }
      );
      console.log(UPcategory);
      if (category) {
        resolve(UPcategory);
      } else {
        resolve();
      }
    });
  },
  documentCount: () => {
    return new Promise(async (resolve, reject) => {
      await product
        .find()
        .countDocuments()
        .then((documents) => {
          resolve(documents);
        });
    });
  },
  DocumentCount: () => {
    return new Promise(async (resolve, reject) => {
      await users
        .find()
        .countDocuments()
        .then((documents) => {
          resolve(documents);
        });
    });
  },
  DOCUMENTCount: (userid) => {
    return new Promise(async (resolve, reject) => {
      await order
        .findOne({ user: userid })
        .countDocuments()
        .then((documents) => {
          resolve(documents);
        });
    });
  },
  searchItemCoupon: (item) => {
    return new Promise(async (resolve, reject) => {
      product
        .find({ producttitle: { $regex: item, $options: "i" } })
        .then((response) => {
          resolve(response);
        })
        .catch((error) => {
          reject(error);
        });
    });
  },
  productCount: () => {
    return new Promise(async (resolve, reject) => {
      await product
        .find()
        .countDocuments()
        .then((documents) => {
          resolve(documents);
        });
    });
  },
  generatorCouponCode: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let couponCode = voucherCode.generate({
          length: 6,
          count: 1,
          charset: "0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ",
          prefix: "Promo-",
        });
        resolve({ status: true, couponCode: couponCode[0] });
      } catch (err) {}
    });
  },
  postaddCoupon: (data) => {
    try {
      return new Promise((resolve, reject) => {
        Coupon.findOne({ couponCode: data.couponCode }).then((coupon) => {
          if (coupon) {
            resolve({ status: false });
          } else {
            Coupon(data)
              .save()
              .then((response) => {
                resolve({ status: true });
              });
          }
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  },

  getCouponList: () => {
    try {
      return new Promise((resolve, reject) => {
        Coupon.find().then((coupons) => {
          resolve(coupons);
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  },
  deliverGraph: () => {
    return new Promise(async (resolve, reject) => {
      let result = await order.aggregate([
        {
          $unwind: "$orders",
        },
        {
          $group: {
            _id: {
              $month: "$orders.createdAt",
            },
            count: {
              $sum: 1,
            },
          },
        },
      ]);

      resolve(result);
    });
  },
  dashboard: async () => {
    let response = {};
    let numberofproducts = await product.countDocuments({});

    response.numberofproducts = numberofproducts;

    return response;
  },
  addBanner: (texts, Image) => {
    return new Promise(async (resolve, reject) => {
      const newBanner = new banner({
        title: texts.title,
        description: texts.description,
        image: Image,
      });
      await newBanner.save().then((response) => {
        resolve(response);
      });
    });
  },

  orderdocument: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let orders = await order.aggregate([
          { $unwind: "$orders" },
          { $group: { _id: null, totalOrders: { $sum: 1 } } },
        ]);

        resolve(orders[0].totalOrders);
      } catch (error) {
        reject(error);
      }
    });
  },
  totalrevenue: () => {
    return new Promise(async (resolve, reject) => {
      let orders = await order.aggregate([
        {
          $unwind: "$orders",
        },
        {
          $group: {
            _id: null,
            totalPriceSum: {
              $sum: "$orders.totalPrice",
            },
          },
        },
      ]);
      resolve(orders[0].totalPriceSum);
    });
  },
  totalEarning: () => {
    return new Promise(async (resolve, reject) => {
      try {
        let orders = await order.aggregate([
          { $unwind: "$orders" },
          {
            $match: {
              "orders.orderConfirm": "delivered",
            },
          },
          { $group: { _id: null, totalPrice: { $sum: "$orders.totalPrice" } } },
        ]);

        if (orders.length === 0) {
          resolve(0); // No delivered orders found
          console.log("No delivered orders found.");
        } else {
          resolve(orders[0].totalPrice);
        }
      } catch (error) {
        reject(error);
      }
    });
  },
  showbanners: (pagenum, perPage) => {
    return new Promise(async (resolve, reject) => {
      let findbanner = await banner.find();

      resolve(findbanner);
    });
  },
  getSalesReport: () => {
    try {
      return new Promise((resolve, reject) => {
        order
          .aggregate([
            {
              $unwind: "$orders",
            },
            {
              $match: {
                "orders.orderConfirm": "delivered",
              },
            },
          ])
          .then((response) => {
            resolve(response);
          });
      });
    } catch (error) {
      console.log(error.message);
    }
  },

  postReport: (date) => {
    try {
      let start = new Date(date.startdate);
      let end = new Date(date.enddate);
      return new Promise((resolve, reject) => {
        order
          .aggregate([
            {
              $unwind: "$orders",
            },
            {
              $match: {
                $and: [
                  { "orders.orderConfirm": "delivered" },
                  { "orders.createdAt": { $gte: start, $lte: end } },
                ],
              },
            },
          ])
          .exec()
          .then((response) => {
            resolve(response);
          });
      });
    } catch (error) {
      console.log(error.message);
    }
  },
  getBannerList: () => {
    return new Promise((resolve, reject) => {
      banner.find().then((banner) => {
        resolve(banner);
      });
    });
  },

  deleteBanner: (bannerId) => {
    return new Promise((resolve, reject) => {
      banner.deleteOne({ _id: bannerId }).then(() => {
        resolve();
      });
    });
  },
};
