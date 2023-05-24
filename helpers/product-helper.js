const bcrypt = require("bcrypt");
const admin = require("../model/admin-model");
const mongoose = require("mongoose");
const users = require("../model/user-model");
const categories = require("../model/category-model");
const PRODUCT = require("../model/product-model");

module.exports = {
  productcheck: (title) => {
    return new Promise(async (resolve, reject) => {
      const product = await PRODUCT.findOne({ producttitle: title });
      if (product) {
        resolve(product);
      } else {
        resolve();
      }
    });
  },
  listproducts: (pageNum, perPage) => {
    return new Promise(async (resolve, reject) => {
      let getproduct = await PRODUCT.find()
        .skip((pageNum - 1) * perPage)
        .limit(perPage);
      console.log(getproduct);
      resolve(getproduct);
    });
  },
  unlistproduct: (UnlistproductId) => {
    return new Promise(async (resolve, reject) => {
      const product = await PRODUCT.updateOne(
        { _id: UnlistproductId },
        { $set: { status: false } }
      );
      console.log(product);
      if (product) {
        resolve(product);
      } else {
        resolve();
      }
    });
  },
  ListProduct: (listproductId) => {
    return new Promise(async (resolve, reject) => {
      const product = await PRODUCT.updateOne(
        { _id: listproductId },
        { $set: { status: true } }
      );
      console.log(product);
      if (product) {
        resolve(product);
      } else {
        resolve();
      }
    });
  },
  listedit_product: (EditproID) => {
    return new Promise(async (resolve, reject) => {
      let geteditproduct = await PRODUCT.findOne({ _id: EditproID });
      resolve(geteditproduct);
    });
  },
  findproduct: (productid, data) => {
    console.log(productid, data);
    console.log(data.price);
    return new Promise(async (resolve, reject) => {
      const pro = await PRODUCT.updateOne(
        { _id: productid },
        {
          $set: {
            producttitle: data.producttitle,
            description: data.description,
            price: data.price,
            categoryname: data.categoryname,
            discount: data.Discount,
            stock: data.numberofstock,
          },
        }
      );
      console.log(pro);

      if (pro) {
        resolve(pro);
      } else {
        reject();
      }
    });
  },
  decreamentStock:(proDetails) => {
    return new Promise(async(resolve,reject) => {
        try {
            for(let i=0;i<proDetails.length;i++){
                await PRODUCT
                .updateOne(
                    {
                        _id: proDetails[i].item
                    },
                    {
                        $inc: {
                            "stock": -proDetails[i].quantity
                        }
                    }
                )
            }
            resolve();
        }
        catch{
            resolve();
        }
    })
},
incrementStock: (proDetails) => {
  console.log(proDetails, "orderproductsssssssss");
  return new Promise(async (resolve, reject) => {
    try {

      for (let i = 0; i < proDetails.length; i++) {
        console.log( proDetails[i][0].quantity);
        await PRODUCT.updateOne(
          {
            _id: proDetails[i][0].productId
          },
          {
            $inc: {
              "stock": proDetails[i][0].quantity
            }
          }
        );
      }
      resolve();
    } catch (error) {
      reject(error);
    }
  });
}

};
