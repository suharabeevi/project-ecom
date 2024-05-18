require("dotenv").config();
const userhelpers = require("../helpers/user-helper");
const orderhelpers = require("../helpers/order-helpers");
const bcrypt = require("bcrypt");
const User = require("../model/user-model");
const adminhelpers = require("../helpers/admin-helper");
const producthelers = require("../helpers/product-helper");
const banner = require("../model/banner-model");

const accountSid = process.env.TWILIO_ACCOUNT_SID;
const authToken = process.env.TWILIO_AUTH_TOKEN;
const serviceSid = process.env.TWILIO_SERVICE_SID;

// const accountSid = "ACc94a07aa30f93afbd05e3399dd39bcd8";
// const authToken = "238c67d618c6f6d963f72a399d71c38c";
// const serviceSid =  "VA2952dcc5bae99d16e50e0c0235f7f4e5";

const client = require("twilio")(accountSid, authToken);

module.exports = {
  userHome: async (req, res) => {
    let user = req.session.user;

    var count = null;
    const result = await adminhelpers.showproducts();
    console.log("got data");
    const data = JSON.parse(JSON.stringify(result));
    let Banner = await adminhelpers.showbanners();
    if (user) {
      var cartcount = await userhelpers.getcart_count(user?.user._id);
    }

    // res.render('admin/users-list',{layout: "admin-layout",admin:true, data});
    res.render("user/user-homepage", { user, data, cartcount, Banner });
  },
  getLoginPage: (req, res) => {
    res.render("user/user-login", { loginErr: req.session.logginerr });
    req.session.logginerr = false;
  },
  // login form submit
  getsignupPage: (req, res) => {
    res.render("user/user-signup");
  },

  // new user form submit
  postSignup: async (req, res) => {
    try {
      const data = req.body;

      // Check if email or contact already exist
      const existingUser = await User.findOne({
        $or: [{ email: data.email }, { contact: data.contact }],
      });
      if (existingUser) {
        let error;
        if (existingUser.email === data.email) {
          error = "Email already exists.";
        } else if (existingUser.contact === data.contact) {
          error = "Mobile number already exists.";
        }
        res.status(200).json({
          stautsCode: 200,
          errorMsg: error,
          successMsg: null,
          status: false,
        });
      } else {
        await userhelpers.adduser(data);
        res.status(200).json({
          stautsCode: 200,
          errorMsg: null,
          successMsg: "Successfully registered the user..!",
          status: true,
        });
      }
    } catch (error) {
      console.error(error);
      res.status(500).json({ error: "Internal server error." });
    }
  },

  dologin: async (req, res) => {
    let email = req.body.email;
    let password = req.body.password;
    try {
      userhelpers.getuser(email, password).then((response) => {
        console.log("res", response);
        if (response.user) {
          req.session.user = response;
          res.redirect("/");
        } else {
          req.session.logginerr = response.message;
          res.redirect("/login");
        }
      });
    } catch (error) {
      req.session.logginerr = error;
      res.redirect("/login");
    }
  },
  logout: (req, res) => {
    req.session.user = null;
    res.redirect("/");
  },
  viewproducts: (req, res) => {
    res.render("../views/user/user-productlist");
  },
  getotppage: (req, res) => {
    res.render("../views/user/otp-login");
  },

  Get_shoplistpage: async (req, res) => {
    const pagenum = req.query.page;

    const currentPage = pagenum;
    const perPage = 8;
    const documentCount = await adminhelpers.productCount();
    let pages2 = Math.ceil(parseInt(documentCount) / perPage);
    //  let result1 = await userhelpers.Findings(pagenum, perPage);
    const india = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
    });
    // let prices;
    // let result;
    let user = req.session.user;
    let result = await adminhelpers.showproducts(pagenum, perPage);

    const data = JSON.parse(JSON.stringify(result));
    const categories = await adminhelpers.listcategories();
    const category = JSON.parse(JSON.stringify(categories));

    //discount calculation
    let discounts = [];
    for (let i = 0; i < data.length; i++) {
      let discount = (data[i].price * data[i].discount) / 100;
      let price = data[i].price - discount;
      let formatedPrice = india.format(price);
      discounts.push(formatedPrice);
    }

    if (req.query?.search || req.query?.sort || req.query?.filter) {
      console.log(
        "req.query?.search ",
        req.query?.search,
        req.query?.sort,
        req.query?.filter
      );
      const { data, currentPage, totalPages, noProductFound } =
        await userhelpers.getQueriesOnShop(req.query);
      noProductFound
        ? (req.session.noProductFound = noProductFound)
        : (req.session.selectedProducts = data);
      console.log(req.session.noProductFound, "req.session.noProductFound");
      let cartcount = await userhelpers.getcart_count(user?.user._id);

      res.render("../views/user/user-productlist", {
        data,
        user,
        cartcount,
        category,
        discounts,
        pages2,
        productResult: req.session.noProductFound,
      });
    } else {
      const pagenum = req.query.page;

      const currentPage = pagenum;
      const perPage = 8;
      const documentCount = await adminhelpers.productCount();
      let pages2 = Math.ceil(parseInt(documentCount) / perPage);
      console.log("fetching all products");
      product = await userhelpers.getShop();
      let cartcount = await userhelpers.getcart_count(user?.user._id);
      if (product.length != 0) req.session.noProductFound = false;
      res.render("../views/user/user-productlist", {
        data,
        user,
        cartcount,
        category,
        discounts,
        pages2,
        productResult: req.session.noProduct,
      });
      req.session.noProductFound = false;
    }
  },
  Get_usercart: async (req, res) => {
    let user = req.session.user;
    let total = await userhelpers.totalCheckOutAmount(user?.user._id);
    let cartproducts = await userhelpers.getcart_products(user?.user._id);
    let cartcount = await userhelpers.getcart_count(user?.user._id);

    res.render("../views/user/user-cart", {
      user,
      cartproducts,
      cartcount,
      total,
    });
  },
  Get_singleproductpage: async (req, res) => {
    let user = req.session.user;
    const { productid } = req.query;

    const result = await userhelpers.GetsingleProduct(productid);
    let cartcount = await userhelpers.getcart_count(user?.user._id);
    try {
      res
        .status(200)
        .render("../views/user/product-details", { result, user, cartcount });
    } catch (error) {
      res.status(500).json({ message: "internal server error" });
    }
  },
  user_addtocart: async (req, res) => {
    let user = req.session.user;
    let proId = req.params.id;

    //check stock

    const stock = await userhelpers.getQuantiy(user?.user._id, proId);

    if (stock?.quantity) {
      var Q = stock.quantity;
    } else {
      var Q = 0;
    }
    userhelpers.GET_PRODUCTS(proId).then((carted) => {
      let S = carted[0].stock;

      const result = S - Q;
      if (result > 0) {
        console.log(result + " final result");
        userhelpers.cart_page(user.user._id, proId).then((response) => {
          userhelpers.GET_PRODUCTS(proId).then((carted) => {
            let su = [];
            for (let i = 0; i < carted.length; i++) {
              su.push(carted[i].stock);
            }
            console.log(su);
            // console.log(response.products[0].quantity,"111111");
            for (let i = 0; i < response.products.length; i++) {
              // console.log(response.products[i].quantity,"qqqqqqqqqqq")
            }
            // console.log(qu,"iiiii")
            res.json(response);
          });
          // alert("hi")
        });
      } else {
        res.json({ outofstock: true });
      }
    });
  },
  change_quantity: (req, res) => {
    let userId = req.session.user._id;
    console.log(userId);

    let user = req.body.user;
    userhelpers.updateQuantity(req.body).then(async (response) => {
      // console.log(user);
      response.total = await userhelpers.totalCheckOutAmount(user);
      //response.subTotal = await userhelpers.getSubTotal(userId)

      res.json(response);
    });
  },
  removeproduct: (req, res) => {
    let userId = req.session.user._id;
    //console.log(userId)
    console.log(req.body);
    userhelpers.deleteProduct(req.body).then((response) => {
      res.send(response);
    });
  },

  Get_categoryfilterpage: async (req, res) => {
    const india = new Intl.NumberFormat("en-US", {
      style: "currency",
      currency: "INR",
    });
    let user = req.session.user;
    const { name } = req.query;
    console.log(name);
    // let categoryy= req.query?.name

    let data = await userhelpers.filtercategory(name);
    const categories = await adminhelpers.listcategories();
    const category = JSON.parse(JSON.stringify(categories));

    let discounts = [];
    for (let i = 0; i < data.length; i++) {
      let discount = (data[i].price * data[i].discount) / 100;
      let price = data[i].price - discount;
      let formatedPrice = india.format(price);
      discounts.push(formatedPrice);
    }
    let cartcount = await userhelpers.getcart_count(user?.user._id);
    res.status(200).render("../views/user/category-wise", {
      user,
      cartcount,
      data,
      category,
      discounts,
    });
  },

  sendOtp: async (req, res) => {
    const { number } = req.body;
    req.session.number = number;
    try {
      await client.verify.v2
        .services(serviceSid)
        .verifications.create({ to: `+91${number}`, channel: "sms" })
        .then((verification) => res.status(200).json(verification.sid));
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error occurred" });
    }
  },
  verifyOtp: async (req, res) => {
    const { otp } = req.body;
    const number = req.session?.number;
    try {
      await client.verify.v2
        .services(serviceSid)
        .verificationChecks.create({ to: `+91${number}`, code: `${otp}` })
        .then(async (verification_check) => {
          if (verification_check.status == "approved") {
            const user = await User.findOne({ contact: number });
            console.log(user);
            if (user) {
              req.session.user = { user: user };
              return res
                .status(200)
                .json({ error: false, message: "succesfully logged in" });
            }
            res.status(400).json({
              error: true,
              message: "user not found pleace create and account",
            });
          }
        });
    } catch (error) {
      res.status(500).json({ message: "Internal sever error occured" });
    }
  },

  verifyCoupon: (req, res) => {
    let couponCode = req.params.id;
    let userId = req.session.user.user._id;
    userhelpers.verifyCoupon(userId, couponCode).then((response) => {
      res.send(response);
    });
  },

  applyCoupon: async (req, res) => {
    let couponCode = req.params.id;
    let userId = req.session.user.user._id;
    console.log(couponCode, userId);
    let total = await userhelpers.totalCheckOutAmount(userId);
    userhelpers.applyCoupon(couponCode, total).then((response) => {
      res.send(response);
    });
  },

  updateUserPassword: (req, res) => {
    userhelpers.setNewPassword(req.body).then(() => {
      res.redirect("/");
    });
  },

  successpage: async (req, res) => {
    res.render("../views/user/ordersuccess");
  },
};
