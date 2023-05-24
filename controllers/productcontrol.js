const adminhelpers = require("../helpers/admin-helper");
const userhelpers = require("../helpers/user-helper");
const producthelpers = require("../helpers/product-helper");
const multer = require("../config/multer");
const Product = require("../model/product-model");
module.exports = {
  Post_addproducts: async (req, res) => {
    const {
      producttitle,
      description,
      categoryname,
      price,
      Discount,
      numberofstock,
    } = req.body;

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

        const newProduct = new Product({
          producttitle: producttitle,
          description: description,
          categoryname: categoryname,
          price: price,
          discount: Discount,
          stock: numberofstock,
          images: result,
        });
        await newProduct.save();
      }
      res
        .status(200)
        .json({ error: false, message: "product has been addded succesfully" });
    } catch (error) {
      res.status(500).send(error);
    }
  },
  remove_product: async (req, res) => {
    let UnlistproductId = req.params.id;
    console.log(req.params.id);
    producthelpers
      .unlistproduct(UnlistproductId)
      .then(res.redirect("/admin/productlist"));
  },
  LIST_product: async (req, res) => {
    let listproductId = req.params.id;
    producthelpers
      .ListProduct(listproductId)
      .then(res.redirect("/admin/productlist"));
  },
};
