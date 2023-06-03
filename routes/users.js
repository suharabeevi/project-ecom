var express = require("express");
var router = express.Router();
const usercontroller = require("../controllers/usercontrol");
const userhelpers = require("../helpers/user-helper");
const usersession = require("../session/session");
const productcontroller = require("../controllers/productcontrol");
const ordercontroller = require("../controllers/order-control");

//get home page
router.get("/", usercontroller.userHome);
//get signup page
router.get("/signup", usercontroller.getsignupPage);

router.post("/signup", usercontroller.postSignup);
//get login page
router.get("/login", usersession.usercheck, usercontroller.getLoginPage);

router.post("/login", usercontroller.dologin);

router.get("/logout", usersession.checklogout, usercontroller.logout);

//get product list page
router.get("/productlist",usersession.checklogout, usercontroller.viewproducts);
// get otp login page

// user account
router.get(
  "/useraccount",
  usersession.shop_usercheck,
  ordercontroller.Get_accountpage
);
// shop list
router.get(
  "/shoplist",
  usersession.shop_usercheck,
  usercontroller.Get_shoplistpage
);

// product filter
router.get(
  "/categoryfilter",
  usersession.shop_usercheck,
  usercontroller.Get_categoryfilterpage
);
// product details
router.get("/productdetails", usercontroller.Get_singleproductpage);

router.get("/cart",usersession.shop_usercheck, usercontroller.Get_usercart);
//user cart
router.get(
  "/Usercart/:id",
  usersession.shop_usercheck,
  usercontroller.user_addtocart
);
// change product quantity
router.patch(
  "/change-product-quantity",
  usersession.shop_usercheck,
  usercontroller.change_quantity
);
// delete product
router.delete("/delete-product-cart", usercontroller.removeproduct);
// get profile
router.get(
  "/get-profile",
  usersession.shop_usercheck,
  ordercontroller.get_address
);

router.get(
  "/get-profile",
  usersession.shop_usercheck,
  ordercontroller.Get_Userorders
);

router.get(
  "/order-details",
  usersession.shop_usercheck,
  ordercontroller.orderDetails
);
// cancel order
router.route("/cancel-order/").post(ordercontroller.cancelOrder);
// return order
router.route("/return-order/").post(ordercontroller.returnOrder);
// edit address
router.put("/edit-address/:id", ordercontroller.Edit_Address);

// delete address
router.delete("/delete-address/:id", ordercontroller.delete_Address);

router.get(
  "/usercheckout",
  usersession.shop_usercheck,
  ordercontroller.usercheckout
);

router.post(
  "/add-address",
  usersession.shop_usercheck,
  ordercontroller.post_address
);

router.post(
  "/usercheckout",
  usersession.shop_usercheck,
  ordercontroller.post_usercheckout
);
// Razorpay 
router.post(
  "/verify_payment",
  usersession.shop_usercheck,
  ordercontroller.verifyPayment
);
// opt
router.post("/send-otp", usercontroller.sendOtp);

router.post("/verify-otp", usercontroller.verifyOtp);
// verify coupon
router.get(
  "/coupon-verify/:id",
  usersession.shop_usercheck,
  usercontroller.verifyCoupon
);
// coupon apply
router.get(
  "/apply-coupon/:id",
  usersession.shop_usercheck,
  usercontroller.applyCoupon
);
// change password
router.post(
  "/changeuserdata",
  usersession.shop_usercheck,
  usercontroller.updateUserPassword
);
// order status
router.get(
  "/ordersuccsess",
  usersession.shop_usercheck,
  usercontroller.successpage
);

module.exports = router;
