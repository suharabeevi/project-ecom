var express = require("express");
var router = express.Router();
const admincontroller = require("../controllers/admincontrol");
const productcontroller = require("../controllers/productcontrol");
const adminsession = require("../session/session");
const upload = require("../config/multer");
const Banner = require("../config/Banner");

// /* GET home page. */
router.get("/", adminsession.admincheck, admincontroller.adminHome);

router.get("/adminlogin", admincontroller.adminlogin);

router.post("/adminlogin", admincontroller.dologin);

router.get("/userslist", admincontroller.getuserslist);
//block user
router.route("/userblock/:id").get(admincontroller.getblockdata);
// //unblock the user
router.route("/userunblock/:id").get(admincontroller.getunblockdata);
//category page
router
  .route("/categories")
  .get(admincontroller.getcategorypage)
  .post(admincontroller.addcategories);
// unlist category
router.route("/deletecategory/:id").get(admincontroller.removecategory);
//list category
router.route("/listcategory/:id").get(admincontroller.List_category);
//edit category
router
  .route("/editcategory/:id")
  .get(admincontroller.editcategory)
  .post(admincontroller.updatecategory);
// list the products
router.route("/productlist").get(admincontroller.productlist);
// unlist the products
router
  .route("/unlistproduct/:id")
  .get(adminsession.admincheck, productcontroller.remove_product);
// list the products
router
  .route("/listproduct/:id")
  .get(adminsession.admincheck, productcontroller.LIST_product);
// product page
router
  .route("/addproduct")
  .get(adminsession.admincheck, admincontroller.Get_addproducts)
  .post(upload, productcontroller.Post_addproducts);
router.get(
  "/editproduct/:id",
  adminsession.admincheck,
  admincontroller.Edit_product
);
router.post("/editproduct", upload, admincontroller.Update_product);
// list orders
router.route("/order-list/:id").get(admincontroller.getOrderList);
// order deatils
router
  .route("/order-details")
  .get(adminsession.admincheck, admincontroller.getOrderDetails);
// change the order status
router.route("/change-order-status").post(admincontroller.changeOrderStatus);
// get order list
router.get(
  "/orderslist",
  adminsession.admincheck,
  admincontroller.getorderslist
);
// for searching product
router.post(
  "/search-item",
  adminsession.admincheck,
  admincontroller.searchItemCoupon
);
//Coupon management
router.get(
  "/add-coupon",
  adminsession.admincheck,
  admincontroller.getaddcouponpage
);
router.post(
  "/add-coupon",
  adminsession.admincheck,
  admincontroller.postaddCoupon
);
router.get(
  "/generate-coupon-code",
  adminsession.admincheck,
  admincontroller.generatorCouponCode
);
router.get(
  "/coupon-list",
  adminsession.admincheck,
  admincontroller.getCouponList
);
// get dashboard deatils
router.get(
  "/chart-details",
  adminsession.admincheck,
  admincontroller.chartDetails
);
// Banner management
router.get(
  "/add-banner",
  adminsession.admincheck,
  admincontroller.getAddBanner
);
router.post("/add-banner",upload,admincontroller.postAddBanner);
router
  .route("/banner-list")
  .get(adminsession.admincheck, admincontroller.getBannerList);
router
  .route("/delete-banner/:id")
  .delete(adminsession.admincheck, admincontroller.deleteBanner);
// sales report
router
  .route("/sales-report")
  .get(admincontroller.getSalesReport)
  .post(admincontroller.postSalesReport);
  
module.exports = router;
