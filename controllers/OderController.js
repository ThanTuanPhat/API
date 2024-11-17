const OrderModel = require("./OderModel");
const CartModel = require("./CartModel");
const UserModel = require("./UserModel");
const ProductModel = require("./ProductModel");
const AddressModel = require("./AddressModel");
const { CART_STATUS } = require("../helpers/AppConstants");
const { isValidObjectId, Types } = require("mongoose");

//________________________________________APP_______________________________________

const getAllOrder = async () => {
  try {
    const orderInDB = await OrderModel.find();
    return orderInDB;
  } catch (error) {
    console.log("getAllOrder error: ", error.massage);
    throw new Error("Lấy ds đơn hàng lỗi");
  }
};

const getOrderQById = async (id) => {
  try {
    if (!id) {
      throw new Error("Vui lòng nhập id người dùng");
    }
    let query = {};
    query = {
      ...query,
      "user._id": new Types.ObjectId(id),
    };
    const orderInDB = await OrderModel.find(query);
    return orderInDB;
  } catch (error) {
    console.log("getOrderQById error: ", error.message);
    throw new Error("Lấy sản phẩm theo id người dùng không thành công");
  }
};

const addOrder = async (cart, userId, ship, sale) => {
  try {
    const user = await UserModel.findById(userId);
    if (!user) {
      throw new Error("Không tìm thấy người dùng");
    }

    // Kiểm tra địa chỉ của người dùng
    let address = null;
    if (user.address && user.address.length > 0) {
      address = user.address.find((addr) => addr.available) || user.address[0];
    } else {
      throw new Error("Người dùng chưa có địa chỉ. Vui lòng thêm địa chỉ trước khi đặt hàng.");
    }

    // Tạo giỏ hàng cho đơn hàng
    let cartInOrder = [];
    let total = 0;

    for (let itemId of cart) {
      const cartO = await CartModel.findById(itemId);

      if (!cartO) {
        console.log(`Không tìm thấy giỏ hàng với id: ${itemId}`);
        throw new Error("Không tìm thấy giỏ hàng");
      }

      total += cartO.total || 0;
      const cartItem = {
        _id: cartO._id,
        user: cartO.user,
        total: cartO.total,
        products: cartO.products,
        date: cartO.date,
      };
      cartInOrder.push(cartItem);
    }

    // Tính phí vận chuyển
    let shippingFee = 0;
    if (ship === 1) {
      shippingFee = 8000;
    } else if (ship === 2) {
      shippingFee = 10000;
    } else if (ship === 3) {
      shippingFee = 20000;
    }
    let totalOrder = total + shippingFee;

    // Tính giảm giá
    let totalDiscount = 0;
    if (Array.isArray(sale)) {
      totalDiscount = sale.reduce((sum, item) => {
        if (typeof item.discountAmount === "number" && item.discountAmount > 0) {
          return sum + item.discountAmount;
        } else if (
          typeof item.discountPercent === "number" &&
          item.discountPercent > 0 &&
          item.discountPercent <= 100
        ) {
          return sum + (totalOrder * item.discountPercent) / 100;
        } else {
          return sum;
        }
      }, 0);
      totalOrder -= totalDiscount;
      if (totalOrder < 0) {
        totalOrder = 0;
      }
    } else {
      throw new Error("Sale phải là một mảng");
    }

    // Tạo đơn hàng
    const order = new OrderModel({
      cart: cartInOrder,
      ship,
      address,
      sale,
      totalOrder,
    });
    const result = await order.save();

    // Cập nhật số lượng `sold` cho các sản phẩm
    for (let cartItem of cartInOrder) {
      for (let productItem of cartItem.products) {
        const productId = productItem.productId || productItem._id; // Hỗ trợ cả productId và _id
        if (!productId) {
          console.error(`Sản phẩm thiếu ID: ${JSON.stringify(productItem)}`);
          continue;
        }

        const product = await ProductModel.findById(productId);
        if (product) {
          product.sold = (product.sold || 0) + productItem.quantity;
          await product.save();
          console.log(`Cập nhật thành công: Sản phẩm ${product.name}, Sold: ${product.sold}`);
        } else {
          console.error(`Không tìm thấy sản phẩm với ID: ${productId}`);
        }
      }
    }
    

    // Cập nhật lịch sử mua hàng của người dùng
    const userInDB = await UserModel.findById(userId);
    if (userInDB) {
      for (let cartItem of cartInOrder) {
        for (let productItem of cartItem.products) {
          const product = await ProductModel.findById(productItem.productId);
          if (product) {
            let newItem = {
              _id: productItem.productId,
              name: product.name,
              quantity: productItem.quantity,
              status: result.status,
              images: product.images,
              date: Date.now(),
            };
            userInDB.carts.push(newItem);
          }
        }
      }
      await userInDB.save();
    }

    return result;
  } catch (error) {
    console.log(error.message);
    throw new Error(error.message || "Thêm đơn hàng thất bại");
  }
};










// const addOrder = async (cart, userId, ship, sale) => {







//update trạng thái đơn hàng

// const addOrder = async (cart, address, ship, sale) => {

//   try {
//     // Tìm thông tin user để lấy địa chỉ
//     const user = await UserModel.findById(userId);
//     if (!user || !user.address) {
//       throw new Error("Không tìm thấy người dùng hoặc địa chỉ không tồn tại");
//     }

//     // Chọn địa chỉ mặc định (hoặc địa chỉ có `available: true`)
//     const address =
//       user.address.find((addr) => addr.available) || user.address[0];
    
//     if (!address) {
//       throw new Error("Người dùng không có địa chỉ khả dụng");
//     }

//     let cartInOrder = [];
//     let total = 0;

//     for (const cartItemId of cart) {
//       const cartItem = await CartModel.findById(cartItemId);
//       if (!cartItem) {
//         throw new Error("Không tìm thấy giỏ hàng");
//       }

//       let cartProducts = [];
//       for (const productItem of cartItem.products) {
//         const product = await ProductModel.findById(productItem._id);
//         if (!product) {
//           throw new Error("Không tìm thấy sản phẩm trong giỏ hàng");
//         }

//         total += product.price * productItem.quantity;
//         cartProducts.push({
//           _id: product._id,
//           name: product.name,
//           quantity: productItem.quantity,
//           price: product.price,
//         });
//       }

//       cartInOrder.push({
//         _id: cartItem._id,
//         user: cartItem.user,
//         total: cartItem.total,
//         products: cartProducts,
//         date: cartItem.date,
//       });
//     }

//     let shippingFee = ship === 1 ? 8000 : ship === 2 ? 10000 : 20000;
//     let totalOrder = total + shippingFee;

//     let totalDiscount = 0;
//     if (Array.isArray(sale)) {
//       totalDiscount = sale.reduce((sum, item) => {
//         if (item.discountAmount) return sum + item.discountAmount;
//         else if (item.discountPercent)
//           return sum + (totalOrder * item.discountPercent) / 100;
//         return sum;
//       }, 0);

//       totalOrder = Math.max(0, totalOrder - totalDiscount);
//     } else {
//       throw new Error("Sale phải là một mảng");
//     }

//     const order = new OrderModel({
//       cart: cartInOrder,
//       ship,
//       address, // Sử dụng địa chỉ đã lấy từ `UserModel`
//       sale,
//       totalOrder,
//     });
//     const result = await order.save();

//     for (const cartItem of cartInOrder) {
//       for (const productItem of cartItem.products) {
//         const product = await ProductModel.findById(productItem._id);
//         if (product) {
//           product.quantity = Math.max(product.quantity - productItem.quantity, 0);
//           product.sold = (product.sold || 0) + productItem.quantity;
//           await product.save();
//         }
//       }
//     }

//     return result;
//   } catch (error) {
//     console.log(error);
//     throw new Error("Add to order failed");
//   }
// };


//update trạng thái đơn hàng
const updateOrder = async (id, status) => {
  try {
    const order = await OrderModel.findById(id);
    if (!order) {
      throw new error("Không tìm thấy đơn hàng ");
    }
    if (
      status < order.status ||
      (status == CART_STATUS.HOAN_THANH &&
        (order.status == CART_STATUS.XAC_NHAN ||
          order.status == CART_STATUS.DANG_GIAO ||
          order.status == CART_STATUS.HUY)) ||
      status > 4
    ) {
      throw new Error("Trạng thái đơn hàng không hợp lệ");
    }
    order.status = status;
    let result = await order.save();
    return result;
  } catch (error) {
    console.log(error);
    throw new Error("Cập nhật trạng thái đơn hàng thất bại");
  }
};

module.exports = {
  getAllOrder,
  addOrder,
  updateOrder,
  getOrderQById,
};
