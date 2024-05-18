const express = require("express");
const objectId = require("mongodb").ObjectId;
const address = require("../model/address-model");
const { ObjectId } = require("bson");
const { logout } = require("../controllers/usercontrol");
const CART = require("../model/cart-model");
const ORDER = require("../model/order-model");
const Razorpay = require("razorpay");
const crypto =require("crypto");
require("dotenv").config();

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;
var instance = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});
module.exports = {
  postAddress: (data, user) => {
    try {
      return new Promise((resolve, reject) => {
        let addressInfo = {
          fname: data.fname,
          lname: data.lname,
          street: data.street,
          appartment: data.appartment,
          city: data.city,
          state: data.state,
          zipcode: data.zipcode,
          phone: data.phone,
          email: data.email,
        };

        address.findOne({ user: user }).then(async (ifAddress) => {
          if (ifAddress) {
            address
              .updateOne(
                { user: user },
                {
                  $push: { Address: addressInfo },
                }
              )
              .then((response) => {
                resolve(response);
              });
          } else {
            let newAddress = address({ user: user, Address: addressInfo });

            await newAddress.save().then((response) => {
              resolve(response);
            });
          }
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  },
  get_Address: async (user) => {
    return await address.findOne({ user: user });
  },
  //   GETADDRESS: async (user) => {
  //     return await address.findOne({ user: user })
  //   },

  get_EditAddress: (ADDID, userId) => {
    //console.log(ADDID,userId);
    return new Promise((resolve, reject) => {
      try {
        var addressId = new ObjectId(ADDID);
        // console.log("addressid",addressId);
        address
          .findOne(
            { user: userId },
            { Address: { $elemMatch: { _id: addressId } } }
          )
          .then((response) => {
            resolve(response.Address[0]);
          })
          .catch((err) => {
            reject(err);
          });
      } catch (error) {
        reject(error);
      }
    });
  },
  delete_Address: (deleteId, user) => {
    console.log(deleteId, user);
    try {
      return new Promise((resolve, reject) => {
        address
          .updateOne(
            { user: user },
            {
              $pull: { Address: { _id: deleteId } },
            }
          )
          .then((response) => {
            resolve(response);
          });
      });
    } catch (error) {
      console.log(error.message);
    }
  },
  placeOrder: (data) => {
    let total = parseInt(data.total);
    try {
      return new Promise(async (resolve, reject) => {
        let productDetails = await CART.aggregate([
          {
            $match: {
              userId: new objectId(data.user),
            },
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
              as: "productDetails",
            },
          },
          {
            $unwind: "$productDetails",
          },
          {
            $project: {
              productId: "$productDetails._id",
              productName: "$productDetails.producttitle",
              productPrice: "$productDetails.price",
              quantity: "$quantity",
              stock: "$productDetails.stock",
              category: "$productDetails.categoryname",
              image: "$productDetails.images",
              totalprice: { $multiply: ["$productDetails.price", "$quantity"] },
              remainingStock: {
                $subtract: ["$productDetails.stock", "$quantity"],
              },
            },
          },
        ]);
      
        let Address = await address.aggregate([
          {
            $match: { user: new objectId(data.user) },
          },
          {
            $unwind: "$Address",
          },
          {
            $match: { "Address._id": new objectId(data.shipping_address) },
          },
          {
            $project: { item: "$Address" },
          },
        ]);
       
        let status, orderStatus;
        if (data.payment_method === "cod") {
          (status = "placed"), (orderStatus = "success");
        } else {
          (status = "pending"), (orderStatus = "pending");
        }

        let orderData = {
          name: Address[0].item.fname,
          paymentStatus: status,
          paymentMethod: data.payment_method,
          productDetails: productDetails,
          shippingAddress: Address,
          orderStatus: orderStatus,
          totalPrice: total,
          _id:new ObjectId()
        };

        let id =orderData._id 
        const hash = crypto.createHash('sha256');
        hash.update(id.toString());
        let userHashId= hash.digest('hex').slice(0, 6);
        orderData.hashedId=userHashId
        
        let order = await ORDER.findOne({ user: data.user });

        if (order) {
          await ORDER.updateOne(
            { user: data.user },
            {
              $push: { orders: orderData },
            }
          ).then((response) => {
            resolve({response,id});
         
         
          });
        } else {
          let newOrder = ORDER({
            user: data.user,
            orders: orderData,
          });
          await newOrder.save().then((response) => {
            resolve(response,id);
           
          });
        }
        await CART.deleteMany({ userId: data.user }).then(() => {
          resolve();
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  },
  getOrders: (userId) => {
    try {
      return new Promise((resolve, reject) => {
        ORDER.findOne({ user: userId })
          // .skip((pagenum - 1) * perPage)
          // .limit(perPage)
          .then((user) => {
            resolve(user);
          });
      });
    } catch (error) {
      console.log(error.message);
    }
  },
  findOrder: (orderId, userId) => {
    try {
      return new Promise((resolve, reject) => {
        ORDER.aggregate([
          {
            $match: {
              "orders._id": new ObjectId(orderId),
              user: new ObjectId(userId),
            },
          },
          {
            $unwind: "$orders",
          },
        ]).then((response) => {
          let orders = response
            .filter((element) => {
              if (element.orders._id == orderId) {
                return true;
              }
              return false;
            })
            .map((element) => element.orders);
          resolve(orders);
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  },
  findProduct: (orderId, userId) => {
    try {
      return new Promise((resolve, reject) => {
        ORDER.aggregate([
          {
            $match: {
              "orders._id": new ObjectId(orderId),
              user: new ObjectId(userId),
            },
          },
          {
            $unwind: "$orders",
          },
        ]).then((response) => {
          let product = response
            .filter((element) => {
              if (element.orders._id == orderId) {
                return true;
              }
              return false;
            })
            .map((element) => element.orders.productDetails);
          resolve(product);
          
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  },
  findAddress: (orderId, userId) => {
    try {
      return new Promise((resolve, reject) => {
        ORDER.aggregate([
          {
            $match: {
              "orders._id": new ObjectId(orderId),
              user: new ObjectId(userId),
            },
          },
          {
            $unwind: "$orders",
          },
        ]).then((response) => {
          let Address = response
            .filter((element) => {
              if (element.orders._id == orderId) {
                return true;
              }
              return false;
            })
            .map((element) => element.orders.shippingAddress[0].item);
          resolve(Address);
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  },
  findings: () => {
    return new Promise(async (resolve, reject) => {
      let orders = await ORDER.aggregate([
        {
          $unwind: "$orders",
        },
      ]);
      resolve(orders);
      console.log(orders, "jiiiiiiiiii");
    });
  },

  generateRazorpay(userId, total) {
    console.log(userId, total);
    try {
      return new Promise(async (resolve, reject) => {
        let orders = await ORDER.find({ user: userId });

        let order = orders[0].orders.slice().reverse();
        let orderId = order[0]._id;

        var options = {
          amount: total * 100, // amount in the smallest currency unit
          currency: "INR",
          receipt: "" + orderId,
        };
        instance.orders.create(options, function (err, order) {
          if (err) {
            console.log(err);
          } else {
            resolve(order);
            console.log("111111111111111", order.receipt)
            console.log("orderId", orderId);
          }
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  },
  verifyPayment: (details) => {
    console.log("deatilsssssssssssssssssss",details);
    try {
      return new Promise((resolve, reject) => {
        const crypto = require("crypto");
        let hmac = crypto.createHmac("sha256", process.env.RAZORPAY_KEY_SECRET);
        hmac.update(
          details["payment[razorpay_order_id]"] +
            "|" +
            details["payment[razorpay_payment_id]"]
        );
        console.log(details["payment[razorpay_order_id]"]);
        hmac = hmac.digest("hex");
       
        if (hmac == details["payment[razorpay_signature]"]) {
          resolve({status:true,orderId: details["order[receipt]"]});
        } else {
          reject({status:false,orderId: details["order[receipt]"]});
        }
      });
    } catch (error) {
      console.log(error.message);
    }
  },
  changePaymentStatus: (userId, orderId) => {
    try {
      return new Promise(async (resolve, reject) => {
        await ORDER.updateOne(
          { "orders._id": orderId },
          {
            $set: {
              "orders.$.orderConfirm": "Success",
              "orders.$.paymentStatus": "Paid",
            },
          }
        ),
          CART.deleteMany({ user: userId }).then(() => {
            resolve();
          });
      });
    } catch (error) {
      console.log(error.message);
    }
  },

  getOrderAddress: (userId, orderId) => {
    return new Promise((resolve, reject) => {
      ORDER.aggregate([
        {
          $match: {
            user: new ObjectId(userId),
          },
        },
        {
          $unwind: "$orders",
        },
        {
          $match: {
            "orders._id": new ObjectId(orderId),
          },
        },
        {
          $unwind: "$orders.shippingAddress",
        },
        {
          $project: {
            shippingAddress: "$orders.shippingAddress",
          },
        },
      ]).then((address) => {
        resolve(address);
      });
    });
  },
  getSubOrders: (orderId, userId) => {
    try {
      return new Promise((resolve, reject) => {
        ORDER.aggregate([
          {
            $match: {
              user: new ObjectId(userId),
            },
          },
          {
            $unwind: "$orders",
          },
          {
            $match: {
              "orders._id": new ObjectId(orderId),
            },
          },
        ]).then((order) => {
          resolve(order);
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  },

  getOrderedProducts: (orderId, userId) => {
    try {
      return new Promise((resolve, reject) => {
        ORDER.aggregate([
          {
            $match: {
              user: new ObjectId(userId),
            },
          },
          {
            $unwind: "$orders",
          },
          {
            $match: {
              "orders._id": new ObjectId(orderId),
            },
          },
          {
            $unwind: "$orders.productDetails",
          },
          {
            $project: {
              productDetails: "$orders.productDetails",
            },
          },
        ]).then((response) => {
          resolve(response);
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  },
  getOrderTotal: (orderId, userId) => {
    try {
      return new Promise((resolve, reject) => {
        ORDER.aggregate([
          {
            $match: {
              user: new ObjectId(userId),
            },
          },
          {
            $unwind: "$orders",
          },
          {
            $match: {
              "orders._id": new ObjectId(orderId),
            },
          },
          {
            $unwind: "$orders.productDetails",
          },
          {
            $group: {
              _id: "$orders._id",
              totalPrice: { $sum: "$orders.productDetails.totalprice" },
            },
          },
        ]).then((response) => {
          if (response && response.length > 0) {
            const orderTotal = response[0].totalPrice;
            resolve(orderTotal);
          }
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  },

  cancelOrder: (orderId) => {
    try {
      return new Promise((resolve, reject) => {
        ORDER.find({ "orders._id": orderId }).then((orders) => {
          let orderIndex = orders[0].orders.findIndex(
            (orders) => orders._id == orderId
          );

          let order = orders[0].orders.find((order) => order._id == orderId);

          if (
            order.paymentMethod === "razorpay" &&
            order.paymentStatus === "paid"
          ) {
            ORDER.updateOne(
              { "orders._id": orderId },
              {
                $set: {
                  ["orders." + orderIndex + ".orderConfirm"]: "Canceled",
                  ["orders." + orderIndex + ".paymentStatus"]: "Refunded",
                },
              }
            ).then((orders) => {
              console.log(orders, "000");
              resolve(orders);
            });
          } else if (
            order.paymentMethod === "COD" &&
            order.orderConfirm === "Delivered" &&
            order.paymentStatus === "paid"
          ) {
            ORDER.updateOne(
              { "orders._id": orderId },
              {
                $set: {
                  ["orders." + orderIndex + ".orderConfirm"]: "Canceled",
                  ["orders." + orderIndex + ".paymentStatus"]: "Refunded",
                },
              }
            ).then((orders) => {
              console.log(orders, "111");
              resolve(orders);
            });
          } else {
            ORDER.updateOne(
              { "orders._id": orderId },
              {
                $set: {
                  ["orders." + orderIndex + ".orderConfirm"]: "Canceled",
                },
              }
            ).then((orders) => {
              console.log(orders, "222");
              resolve(orders);
            });
          }
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  },

  changeOrderStatus: (orderId, status) => {
    try {
      return new Promise((resolve, reject) => {
        ORDER.updateOne(
          { "orders._id": orderId },
          {
            $set: { "orders.$.orderConfirm": status },
          }
        ).then((response) => {
          console.log(response, "$$$$$$$$$$$$$$");
          resolve(response);
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  },

  returnOrder: (orderId) => {
    try {
      return new Promise((resolve, reject) => {
        ORDER.find({ "orders._id": orderId }).then((orders) => {
          let orderIndex = orders[0].orders.findIndex(
            (orders) => orders._id == orderId
          );

          ORDER.updateOne(
            { "orders._id": orderId },
            {
              $set: {
                ["orders." + orderIndex + ".orderConfirm"]: "Returned",
                ["orders." + orderIndex + ".paymentStatus"]: "Refunded",
              },
            }
          ).then((orders) => {
            console.log(orders, "1");
            resolve(orders);
          });
        });
      });
    } catch (error) {
      console.log(error.message);
    }
  },
};
