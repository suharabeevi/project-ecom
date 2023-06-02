//const { ObjectId } = require('bson')
const objectId = require("mongodb").ObjectId;
const { ObjectId } = require("bson");
const mongoose = require("mongoose");
const orderhelpers = require("../helpers/order-helpers");
const productHelper = require("../helpers/product-helper");
const userhelpers = require("../helpers/user-helper");
const { logout } = require("./usercontrol");
const Razorpay = require("razorpay");

require("dotenv").config();

const keyId = process.env.RAZORPAY_KEY_ID;
const keySecret = process.env.RAZORPAY_KEY_SECRET;

var instance = new Razorpay({
  key_id: keyId,
  key_secret: keySecret,
});

module.exports = {
  usercheckout: async (req, res) => {
    let user = req.session.user;
    let coupons = await userhelpers.totalcoupons();
    let total = await userhelpers.totalCheckOutAmount(user?.user._id);
    let cartitems = await userhelpers.getcart_products(user?.user._id);
    let address = await orderhelpers.get_Address(user?.user._id);
    let cartcount = await userhelpers.getcart_count(user?.user._id);
    res.render("../views/user/user-checkout", {
      user,
      cartitems,
      total,
      address,
      cartcount,
      coupons,
    });
  },
  
  post_address: async (req, res) => {
    let user = req.session.user;
    let data = req.body;
    
    orderhelpers.postAddress(data, user?.user._id).then((response) => {
      res.redirect("/usercheckout");
    });
  },
  get_address: async (req, res) => {
    let user = req.session.user;
    let address = await orderhelpers.get_Address(user?.user._id);
  },

  Edit_Address: async (req, res) => {
    try {
      const user = req.session.user;

      const editdata = req.params.id;

      // const addressId = new objectId(editdata);

      await orderhelpers
        .get_EditAddress(editdata, user?.user._id)
        .then((data) => {
         
          res.json({ address: data });
        });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  },

  delete_Address: async (req, res) => {
    try {
      const user = req.session.user;

      const deletedata = req.params.id;

      // const addressId = new objectId(editdata);

      await orderhelpers
        .delete_Address(deletedata, user?.user._id)
        .then((response) => {
          res.send(response);
        });
    } catch (error) {
      console.error(error);
      res.status(500).send("Internal server error");
    }
  },

  post_usercheckout: async (req, res) => {
    const user = req.session.user;
    let data = req.body;
    let cartproducts= await userhelpers.getCartProductList(user?.user._id);
    // let total1= parseInt(req.body.total)
    
    let total = parseInt(data.total);
    await orderhelpers.placeOrder(data).then(async (result) => {
      let response={}
      orderid=result.id
      if (data.payment_method === "cod") {
        productHelper.decreamentStock(cartproducts).then(() => {}).catch((err) =>console.log(err));
        response.cod=true
        response.orderid=orderid
        res.json(response);
      } else if (data.payment_method === "razorpay") {
   await productHelper.decreamentStock(cartproducts).then(() => {}).catch((err) =>console.log(err));
        await orderhelpers
          .generateRazorpay(user?.user._id, total)
          .then((order) => {
         
            response.Razorpay=true
            res.json(order);
          });
      }
    });
  },
  Get_Userorders: async (req, res) => {
    const user = req.session.user;
    let orders = await orderhelpers.getOrders(user?.user._id);
  
  },
  orderDetails: async (req, res) => {
    let user = req.session.user;
    let { orderid } = req.query;
   
    let cartcount = await userhelpers.getcart_count(user?.user._id);
    let orders = await orderhelpers.findOrder(orderid, user?.user._id);
    let products = await orderhelpers.findProduct(orderid, user?.user._id);
    let Address = await orderhelpers.findAddress(orderid, user?.user._id);
    
    //     orderHelpers.findAddress(orderId, userId).then((address) => {

    //             console.log(orders, '====');
    res.render("../views/user/order-details", {
      user,
      cartcount,
      orders,
      products,
      Address,
    });
  },
  Get_accountpage: async (req, res) => {
    let user = req.session.user;
    let cartcount = await userhelpers.getcart_count(user?.user._id);
    let address = await orderhelpers.get_Address(user?.user._id);
    let orders = await orderhelpers.getOrders(user?.user._id);
   
    res.render("../views/user/user-account", {
      user,
      cartcount,
      orders,
      address,
    });
  },

  verifyPayment: (req, res) => {
    let user = req.session.user;
    orderhelpers.verifyPayment(req.body).then((result) => {
      orderhelpers
        .changePaymentStatus(user?.user._id, req.body["order[receipt]"])
        .then(() => {
          res.json(result);
        })
        .catch((err) => {
          res.json({ status: false });
        });
    });
  },
  cancelOrder:async (req, res) => {
    let orderId = req.query.id;
   let total = req.query.total;
    let user = req.session.user;
    
   
    orderhelpers.cancelOrder(orderId).then(async(canceled) => {
      let orderproducts = await orderhelpers.findProduct(orderId,user?.user._id);
      
     await productHelper.incrementStock(orderproducts).then(() => {}).catch((err) =>console.log(err));
     
      // orderHelpers.addWallet(userId, total).then((walletStatus) => {
      // console.log(canceled, 'cancel', walletStatus, 'wallet');
      res.send(canceled);
      // })
    });
  },

  returnOrder: async(req, res) => {
    let orderId = req.query.id;
    let total = req.query.total;
    let user = req.session.user;
    orderhelpers.returnOrder(orderId, user?.user._id).then(async(returnOrderStatus) => {

      let orderproducts = await orderhelpers.findProduct(orderId,user?.user._id);
     
     await productHelper.incrementStock(orderproducts).then(() => {}).catch((err) =>console.log(err));
     
      res.send(returnOrderStatus);
      // })
      // })
    });
  },

  // })
};
