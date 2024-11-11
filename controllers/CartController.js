const CartModel = require("./CartModel");
const ObjectId = require("mongoose").Types.ObjectId;
const AppConstants = require("../helpers/AppConstants");
const UserModel = require("./UserModel");
const ProductModel = require("./ProductModel");
// const AddressModel = require("./AddressModel");

//________________________________________APP_______________________________________

//thêm cart
const addCart = async (user, products) => {
  try {
    // user: user id của người mua
    // products: mảng id của sản phẩm và số lượng mua
    console.log(products)
    const userInDB = await UserModel.findById(user);
    if (!userInDB) {
      throw new Error("User not found");
    }
    console.log("user", user);
    // kiểm tra products có phải là mảng hay không
    console.log("Products", products);
    if (!Array.isArray(products)) {
      throw new Error("Products must be an array");
    }
    let productsInCart = [];
    let total = 0;
    for (let index = 0; index < products.length; index++) {
      //thầy dùng mảng để chắc chắn tất cả các sp đều được duyệt qua
      const item = products[index];
      const product = await ProductModel.findById(item.id);
      if (!product) {
        throw new Error("Product not found");
      }
      // nếu số lượng lớn hơn số lượng tồn kho
      if (item.quantity > product.quantity) {
        throw new Error("Product out of stock");
      }
      const productItem = {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: item.quantity,
      };
      productsInCart.push(productItem);
      total += product.price * item.quantity;
    }
    // const addressInDB = await AddressModel.findById(address);

    // console.log(address);

    // if (!addressInDB) {
    //   throw new Error("address not found");
    // }
    // tạo giỏ hàng mới
    const cart = new CartModel({
      user: { _id: userInDB._id, name: userInDB.name },
      products: productsInCart,
      // address: {
      //   _id: addressInDB._id,
      //   houseNumber: addressInDB.houseNumber,
      //   alley: addressInDB.alley,
      //   quarter: addressInDB.quarter,
      //   district: addressInDB.district,
      //   city: addressInDB.city,
      //   country: addressInDB.country,
      // },
      total,
    });
    const result = await cart.save();

    setTimeout(async () => {
      // chạy ngầm cập nhật số lượng tồn kho của sản phẩm
      for (let index = 0; index < products.length; index++) {
        const item = products[index];
        const product = await ProductModel.findById(item.id);
        product.quantity -= item.quantity;
        await product.save();
      }
      // cập nhật lịch sử mua hàng của người dùng

      //....sửa lại để đáp ứng giao diện history
      for (let index = 0; index < products.length; index++) {
        const item = products[index];
        const product = await ProductModel.findById(item.id);
        let newItem = {
          _id: item.id,
          name: product.name,
          quantity: item.quantity,
          status: result.status,
          images: product.images,
          date: Date.now(),
        };
        userInDB.carts.push(newItem);
      }
      // let item = {
      //     _id: result._id,
      //     date: result.date,
      //     total: result.total,
      //     status: result.status,
      //     //....Thêm 2 thuộc tính để hiển thị lấy cart từ user hiển thị lên history
      //     quantity: result.quantity,
      //     name: result.name
      // };
      // userInDB.carts.push(item);
      await userInDB.save();
    }, 0);

    return result;
  } catch (error) {
    console.log(error);
    throw new Error("Add to cart failed");
  }
};
// cập nhật trangj thái đơn hàng 
const updateCarts = async (id, status) => {
  try {
    const cart = await CartModel.findById(id);
    if (!cart) {
      throw new error("Không tìm thấy giỏ hàng ");

    }
    if (status < cart.status ||
      (status == AppConstants.CART_STATUS.HOAN_THANH &&
        (cart.status == AppConstants.CART_STATUS.XAC_NHAN ||
          cart.status == AppConstants.CART_STATUS.DANG_GIAO ||
          cart.status == AppConstants.CART_STATUS.HUY)) ||
      status > 4) {
      throw new Error("Trạng thái đơn hàng không hợp lệ");
    }
    cart.status = status;
    let result = await cart.save();
    return result;
  } catch (error) {
      console.log(error);
      throw new Error("Cập nhật trạng thái đơn hàng thất bại");
      
  }
};
const QuanLyHangHoa = async (productQuery, userQuery) => {
  try {
    // Fetch product based on productQuery (e.g., by product ID or another unique identifier)
    const productInDB = await CartModel.findOne(productQuery).select(['name', 'category', 'price', 'deliveryMethod', 'orderStatus', 'totalProductPrice', 'totalPayment']);

    if (!productInDB) {
      console.error("Error: Sản phẩm không tồn tại");
      return { error: "Sản phẩm không tồn tại" };
    }

    // Fetch user based on userQuery (assuming userId is associated with the product in the database)
    const userInDB = await UserModel.findOne(userQuery).select('email');

    if (!userInDB) {
      console.error("Error: Người dùng không tồn tại");
      return { error: "Người dùng không tồn tại" };
    }

    // Construct response body with product and user information
    const body = {
      email: userInDB.email,
      name: productInDB.name,
      category: productInDB.category,
      price: productInDB.price,
      deliveryMethod: productInDB.deliveryMethod || "N/A",
      orderStatus: productInDB.orderStatus || "N/A",
      totalProductPrice: productInDB.totalProductPrice || 0,
      totalPayment: productInDB.totalPayment || 0
    };

    return body;
  } catch (error) {
    console.error("Lấy danh sách sản phẩm lỗi: ", error.message);
    return { error: "Lấy danh sách sản phẩm lỗi" };
  }
};

const getAllCart = async () => {
  try {
      const carts = await CartModel.find();
      if(!carts){
        throw new Error("Không giỏ hàng");
      }
      return carts
  } catch (error) {
      console.error("Lỗi khi lấy danh sách giỏ hàng:", error); // In chi tiết lỗi ra console
      throw new Error("Có lỗi xảy ra trong quá trình lấy giỏ hàng.");
  }
};


module.exports = {
  addCart,
  updateCarts,
  QuanLyHangHoa,
  getAllCart
};
