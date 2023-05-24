const adminhelpers = require("../helpers/admin-helper");
const userhelpers = require("../helpers/user-helper");
const producthelpers = require("../helpers/product-helper");
const orderhelpers = require("../helpers/order-helpers");
const Banner = require("../model/banner-model");
module.exports = {
  adminHome: async (req, res) => {
    let dashboard = await adminhelpers.dashboard();
    let ordercount = await adminhelpers.orderdocument();
    let revenue = await adminhelpers.totalrevenue();
    let Earning = await adminhelpers.totalEarning();
    console.log(Earning);
    res.render("admin/admin-homepage", {
      layout: "admin-layout",
      admin: true,
      dashboard,
      ordercount,
      revenue,
      Earning,
    });
  },
  adminlogin: (req, res) => {
    res.render("admin/admin-login", { layout: "admin-layout" });
  },
  dologin: async (req, res) => {
    console.log(req.body);
    let { email, password } = req.body;
    // console.log(email);
    try {
      let dashboard = await adminhelpers.dashboard();
      let ordercount = await adminhelpers.orderdocument();
      let revenue = await adminhelpers.totalrevenue();
      let Earning = await adminhelpers.totalEarning();

      let admin = await adminhelpers.getadmin(email, password);
      console.log(admin);
      if (admin) {
        req.session.admin = admin;
        res.render("admin/admin-homepage", {
          layout: "admin-layout",
          admin: true,
          dashboard,
          ordercount,
          revenue,
          Earning,
        });
      } else {
        res.redirect("/admin/adminlogin");
      }
    } catch (error) {
      console.log("err message",error.message);
      console.log(error);
    }
  },
  getuserslist: async (req, res) => {
    const pagenum = req.query.page;
    console.log(pagenum);
    const currentPage = pagenum;
    const perPage = 4;
    const documentCount = await adminhelpers.DocumentCount();
    let pages2 = Math.ceil(parseInt(documentCount) / perPage);
    let result = await userhelpers.findings(pagenum, perPage);
    let data = JSON.parse(JSON.stringify(result));
    //   console.log(data);
    res.render("admin/users-list", {
      layout: "admin-layout",
      admin: true,
      data,
      pages2,
    });
  },
  getblockdata: (req, res) => {
    let Blockid = req.params.id;
    adminhelpers.blockuser(Blockid).then(res.redirect("/admin/userslist"));
  },
  getunblockdata: (req, res) => {
    let unblockid = req.params.id;
    adminhelpers.unblockuser(unblockid).then(res.redirect("/admin/userslist"));
  },
  getcategorypage: async (req, res) => {
    const result = await adminhelpers.listcategories();
    const categorydata = JSON.parse(JSON.stringify(result));
    res.render("admin/category-list", {
      layout: "admin-layout",
      admin: true,
      categorydata,
    });
  },
  addcategories: async (req, res) => {
    console.log(req.body);

    let name = req.body.category;
    let data = req.body;

    const status = await adminhelpers.categorycheck(name);

    if (status) {
      res.redirect("/admin/categories");
    } else {
      await adminhelpers
        .Saveitems(data)
        .then(res.redirect("/admin/categories"));
    }
  },
  removecategory: (req, res) => {
    let removecategoryid = req.params.id;
    console.log(removecategoryid);
    adminhelpers
      .unlistcategory(removecategoryid)
      .then(res.redirect("/admin/categories"));
  },
  List_category: (req, res) => {
    let listcategoryid = req.params.id;
    adminhelpers
      .Listcategory(listcategoryid)
      .then(res.redirect("/admin/categories"));
  },
  editcategory: async (req, res) => {
    let dataId = req.params.id;
    // console.log("EDITIDDDDDDDDDD",dataId);
    let result = await adminhelpers.Editcategory(dataId);
    const singledata = JSON.parse(JSON.stringify(result));
    // const data=JSON.parse(JSON.stringify(result));
    res.render("../views/admin/edit-category", {
      layout: "admin-layout",
      admin: true,
      singledata,
    });
  },
  updatecategory: (req, res) => {
    console.log(req.body);
    const editID = req.params.id;
    const { category, stocknumber, description } = req.body;
    adminhelpers
      .update_category(editID, category, stocknumber, description)
      .then(res.redirect("/admin/categories"));
  },
  productlist: async (req, res) => {
    const pagenum = req.query.page;
    console.log(pagenum);
    const currentPage = pagenum;
    const perPage = 4;
    const documentCount = await adminhelpers.documentCount();
    let pages2 = Math.ceil(parseInt(documentCount) / perPage);
    console.log(documentCount, "hiiii");
    const result = await producthelpers.listproducts(pagenum, perPage);
    const productdata = JSON.parse(JSON.stringify(result));

    res.render("admin/products-list", {
      layout: "admin-layout",
      admin: true,
      productdata,
      pages2,
    });
  },
  Get_addproducts: async (req, res) => {
    const result = await adminhelpers.listcategories();
    const categoryitem = JSON.parse(JSON.stringify(result));
    console.log("SSSSSSSSSSSSSS", categoryitem);
    res.render("admin/add-product", {
      layout: "admin-layout",
      admin: true,
      categoryitem,
    });
  },
  Edit_product: async (req, res) => {
    let EditproID = req.params.id;
    console.log(EditproID, "88888");
    const result = await adminhelpers.listcategories();
    const categoryitem = JSON.parse(JSON.stringify(result));
    const RESULT = await producthelpers.listedit_product(EditproID);
    const productdata = JSON.parse(JSON.stringify(RESULT));
    console.log(productdata, "yyyyyyyyyyyyyyyyyyy");

    res.render("../views/admin/edit-product", {
      layout: "admin-layout",
      admin: true,
      categoryitem,
      productdata,
    });
  },
  Update_product: (req, res) => {
    let { editid } = req.query;
    console.log(editid);
    console.log(req.body);
    let data = req.body;
    producthelpers
      .findproduct(editid, data)
      .then(res.redirect("/admin/productlist"));
  },

  getOrderList: async (req, res) => {
    let userid = req.params.id;
    console.log(userid);
    const pagenum = req.query.page;
    console.log(pagenum);
    const currentPage = pagenum;
    const perPage = 5;
    const documentCount = await adminhelpers.DOCUMENTCount(userid);
    console.log(documentCount);
    let pages2 = Math.ceil(parseInt(documentCount) / perPage);

    userhelpers.Getuser(userid).then((user) => {
      orderhelpers.getOrders(userid, pagenum, perPage).then((order) => {
        console.log(user);
        console.log(order, "kkkkkkkkk");
        res.render("../views/admin/ORDErList", {
          layout: "admin-layout",
          admin: true,
          order,
          user,
          pages2,
        });
      });
    });
  },
  getorderslist: async (req, res) => {
    const data = await orderhelpers.findings();
    // const data=JSON.parse(JSON.stringify(result));
    console.log(data);
    res.render("../views/admin/order-list", {
      layout: "admin-layout",
      admin: true,
      data,
    });
  },
  getOrderDetails: async (req, res) => {
    let orderId = req.query.orderId;
    let userId = req.query.userId;
    console.log("888888888888", orderId, userId);
    let userDetails = await userhelpers.getDetails(userId);
    let address = await orderhelpers.getOrderAddress(userId, orderId);

    let orders = await orderhelpers.getSubOrders(orderId, userId);
    let product = await orderhelpers.getOrderedProducts(orderId, userId);
    //             orderhelpers.getTotal(orderId, userId).then((productTotalPrice) => {
    let ordertotalprice = await orderhelpers.getOrderTotal(orderId, userId);
    console.log(userDetails, address, orders, product, ordertotalprice);

    // console.log('orderDetails',orderDetails,'orderDetails');
    // console.log('orderId',orderId,'orderId');
    res.render("../views/admin/order-details", {
      layout: "admin-layout",
      admin: true,
      address,
      orders,
      userDetails,
      product,
      orderId,
      ordertotalprice,
    });
  },
  searchItemCoupon: async (req, res) => {
    const pagenum = req.query.page;
    console.log(pagenum);
    const currentPage = pagenum;
    const perPage = 5;
    const documentCount = await adminhelpers.documentCount();
    let pages2 = Math.ceil(parseInt(documentCount) / perPage);
    console.log(req.body);
    await adminhelpers
      .searchItemCoupon(req.body.searchItem)
      .then((productdata) => {
        res.render("admin/products-list", {
          layout: "admin-layout",
          admin: true,
          productdata,
          pages2,
        });
      });
  },
  getaddcouponpage: (req, res) => {
    try {
      res.render("admin/add-coupon", { layout: "admin-layout", admin: true });
    } catch (error) {
      console.log(error);
    }
  },
  generatorCouponCode: (req, res) => {
    adminhelpers.generatorCouponCode().then((couponCode) => {
      console.log(couponCode, "-----");
      res.send(couponCode);
    });
  },
  postaddCoupon: (req, res) => {
    let data = {
      couponCode: req.body.coupon,
      validity: req.body.validity,
      minAmount: req.body.minAmount,
      minDiscountPercentage: req.body.minDiscountPercentage,
      maxDiscountValue: req.body.maxDiscount,
      description: req.body.description,
      status: true,
    };
    adminhelpers.postaddCoupon(data).then((response) => {
      res.send(response);
    });
  },
  getCouponList: (req, res) => {
    let admin = req.session.admin;
    adminhelpers.getCouponList().then((couponList) => {
      res.render("admin/couponList", {
        layout: "admin-layout",
        admin: true,
        couponList,
      });
    });
  },
  chartDetails: async (req, res) => {
    let delivers = await adminhelpers.deliverGraph();
    // let orderStatus = await adminHelpers.ordersGraph();
    // console.log(delivers, orderStatus);
    res.json({ delivers });
  },
  getAddBanner: (req, res) => {
    let admin = req.session.admin;
    res.render("../views/admin/addbanner", {
      layout: "admin-layout",
      admin: true,
    });
  },

  postAddBanner: async (req, res) => {
    const { title, description } = req.body;

    console.log(req.body);
    // console.log(req.files);
    try {
      if (req.files) {
        let i = 1;
        const result = req.files.reduce((acc, obj) => {
          const key = `image${i}`;
          acc[`${key}`] = obj.path;
          i++;
          return acc;
        }, {});

        const newBanner = new Banner({
          title: title,
          description: description,
          images: result,
        });
        await newBanner.save();
      }
      res.status(200).redirect("/admin/add-banner");
    } catch (error) {
      res.status(500).send(error);
    }
  },

  changeOrderStatus: (req, res) => {
    let orderId = req.body.orderId;
    let status = req.body.status;
    orderhelpers.changeOrderStatus(orderId, status).then((response) => {
      console.log(response);
      res.send(response);
    });
  },
  getSalesReport: async (req, res) => {
    let admin = req.session.admin;
    let report = await adminhelpers.getSalesReport();
    console.log(report, "gggggggghhhhhhhhhaaaaaaaaassssssssss");
    let details = [];
    const getDate = (date) => {
      let orderDate = new Date(date);
      let day = orderDate.getDate();
      let month = orderDate.getMonth() + 1;
      let year = orderDate.getFullYear();
      return `${isNaN(day) ? "00" : day} - ${isNaN(month) ? "00" : month} - ${
        isNaN(year) ? "0000" : year
      }`;
    };

    report.forEach((orders) => {
      details.push(orders.orders);
    });
    console.log(details, "uuuuuuuuuuuuuuuuuuuuuuu");
    res.render("../views/admin/Sales-Report", {
      layout: "admin-layout",
      admin: true,
      details,
      getDate,
    });
  },

  postSalesReport: (req, res) => {
    let admin = req.session.admin;
    let details = [];
    const getDate = (date) => {
      let orderDate = new Date(date);
      let day = orderDate.getDate();
      let month = orderDate.getMonth() + 1;
      let year = orderDate.getFullYear();
      return `${isNaN(day) ? "00" : day} - ${isNaN(month) ? "00" : month} - ${
        isNaN(year) ? "0000" : year
      }`;
    };

    adminhelpers.postReport(req.body).then((orderData) => {
      console.log(orderData, "orderData");
      orderData.forEach((orders) => {
        details.push(orders.orders);
      });

      res.render("../views/admin/Sales-Report", {
        layout: "admin-layout",
        admin: true,
        details,
        getDate,
      });
    });
  },

  getBannerList: (req, res) => {
    let admin = req.session.admin;
    adminhelpers.getBannerList().then((banner) => {
      console.log(banner, "banner");

      res.render("../views/admin/banner-list", {
        layout: "admin-layout",
        admin,
        banner,
      });
    });
  },

  deleteBanner: (req, res) => {
    console.log(req.params.id);
    adminhelpers.deleteBanner(req.params.id).then((response) => {
      res.send(response);
    });
  },
};
