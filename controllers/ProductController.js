const { isValidObjectId, Types } = require("mongoose");
const ProductModel = require("./ProductModel");
const CategoryModel = require("./CategoryModel");
const PreserveModel = require("./PreserveModel");
const OrderModel = require("./OderModel");
const UserModel = require("./UserModel");
//________________________________________APP_______________________________________

// Lấy danh sách sản phẩm (HOME)
const getProduct = async () => {
  try {
    let query = {};
    const products = await ProductModel.find(query).sort({ createAt: -1 });
    return products;
  } catch (error) {
    console.log("getProducts error: ", error.message);
    throw new Error("Lấy danh sách sản phẩm lỗi");
  }
};

// Lấy chi tiết sản phẩm
const getProductDetailById_App = async (id) => {
  try {
    const productInDB = await ProductModel.findById(id);
    if (!productInDB) {
      throw new Error("Không tìm thấy sp");
    }
    return productInDB;
  } catch (error) {
    console.log("getProducts error: ", error.message);
    throw new Error("Lấy danh sách sản phẩm lỗi");
  }
};
const getOutOfStockProducts = async () => {
  try {
   
    const query = { quantity: { $lte: 0 } };
    const products = await ProductModel.find(query)
      .select("name quantity") 
      .sort({ createAt: -1 }); 

    return products;
  } catch (error) {
    console.log("getOutOfStockProducts error: ", error.message);
    throw new Error("Lấy danh sách sản phẩm hết hàng lỗi");
  }
};



// Thống kê top 10 sp bán chạy nhiều nhất
const getTopProductSell_Web = async () => {
  try {
    const products = await ProductModel.find({}, "name sold")
      .sort({ sold: -1 })
      .limit(10);
    return products;
  } catch (error) {
    console.log("getTopProduct error: ", error.message);
    throw new Error("Lấy sp lỗi");
  }
};

// Tìm sản phẩm theo từ khóa
const findProductsByKey_App = async (key) => {
  try {
    let query = {
      $or: [
        { name: { $regex: key, $options: "i" } },
        { oum: { $regex: key, $options: "i" } }
      ],
    };


    const products = await ProductModel.find(query);


    const productsWithDefaults = products.map((product) => ({
      ...product._doc,
      image:
        product.images && product.images.length > 0
          ? product.images[0]
          : "default_image_url", 
      oum: product.oum || "Không có trọng lượng",
    }));

    return productsWithDefaults;
  } catch (error) {
    console.log("getProducts error: ", error.message);
    throw new Error("Lấy danh sách sản phẩm lỗi");
  }
};


// Xóa sản phẩm theo id
const deleteProduct = async (id) => {
  try {
    const productInDB = await ProductModel.findById(id);
    if (!productInDB) {
      throw new Error("Sản phẩm không tồn tại");
    }
    await ProductModel.deleteOne({ _id: id });
    return true;
  } catch (error) {
    console.log("deleteProduct: ", error);
    throw new Error("Xóa sp lỗi");
  }
};

// Thêm sản phẩm mới
const addProduct = async (
  name,
  category,
  quantity,
  origin,
  price,
  fiber,
  oum,
  preserve,
  supplier,
  uses,
  images,
  description,
  discount
) => {
  try {

    if (
      !name ||
      !category ||
      !quantity ||
      !price ||
      !oum ||
      !preserve ||
      !images


    ) {
      throw new Error("Vui lòng cung cấp đầy đủ thông tin sản phẩm hoặc nhập khuyến mãi hợp lệ");
    }


    if (quantity <= 0) {
      throw new Error("Số lượng không được nhập dưới 1");
    }


    if (price < 0) {
      throw new Error("Giá tiền không được âm");
    }

    if (discount < 0) {
      throw new Error("Giá giảm không được âm");
    }

    if(discount > price){
      throw new Error("Giá giảm không được lớn hơn giá gốc");
    }

    



    const categoryInDB = await CategoryModel.findById(category);
    if (!categoryInDB) {
      throw new Error("Danh mục không tồn tại");
    }

    const preserveInDB = await PreserveModel.findById(preserve);
    if (!preserveInDB) {
      throw new Error("Loại hàng không tồn tại");
    }
    category = {
      category_id: categoryInDB._id,
      category_name: categoryInDB.name,
    };


    preserve = {
      preserve_id: preserveInDB._id,
      preserve_name: preserveInDB.name,
    };


    const product = {
      name,
      category,
      quantity,
      origin,
      price,
      fiber,
      oum,
      preserve,
      supplier,
      uses,
      images,
      description,
      discount: discount || 0,
    };


    const newProduct = new ProductModel(product);
    const result = await newProduct.save();

    return result;
  } catch (error) {
    console.error("addProduct error: ", error.message);
    throw new Error("Thêm sản phẩm thất bại: " + error.message);
  }
};

// Cập nhật sản phẩm
const updateProduct = async (
  id,
  name,
  category,
  quantity,
  origin, // Có thể truyền chuỗi rỗng
  price,
  fiber, // Có thể truyền chuỗi rỗng
  oum, // Có thể truyền chuỗi rỗng
  preserve,
  supplier, // Có thể truyền chuỗi rỗng
  uses, // Có thể truyền chuỗi rỗng
  discount,
  images,
  description // Có thể truyền chuỗi rỗng

) => {
  try {
    // Tìm sản phẩm theo ID
    const udtProduct = await ProductModel.findById(id);
    if (!udtProduct) {
      throw new Error("Sản phẩm không tồn tại");
    }

    // Kiểm tra và lấy category nếu có
    if (!category) {
      throw new Error("Danh mục không tồn tại");
    }
    const udtcCategory = await CategoryModel.findById(category);
    if (!udtcCategory) {
      throw new Error("Danh mục không tồn tại");
    }
    udtProduct.category = {
      category_id: udtcCategory._id,
      category_name: udtcCategory.name,
    };

    // Kiểm tra và lấy preserve nếu có
    if (!preserve) {
      throw new Error("Loại hàng không tồn tại");
    }
    const udtcPreserve = await PreserveModel.findById(preserve);
    if (!udtcPreserve) {
      throw new Error("Loại hàng không tồn tại");
    }

    if (quantity <= 0) {
      throw new Error("Số lượng không được nhập dưới 1");
    }


    if (price < 0) {
      throw new Error("Giá tiền không được âm");
    }

    if (discount < 0) {
      throw new Error("Giá giảm không được âm");
    }

    if(discount > price){
      throw new Error("Giá giảm không được lớn hơn giá gốc");
    }
    udtProduct.preserve = {
      preserve_id: udtcPreserve._id,
      preserve_name: udtcPreserve.name,
    };

    // Cập nhật các trường nếu có giá trị mới
    udtProduct.name = name || udtProduct.name;
    udtProduct.price = price || udtProduct.price;
    udtProduct.quantity = quantity || udtProduct.quantity;
    udtProduct.images = images || udtProduct.images;

    // Cập nhật nếu có giá trị truyền vào, cho phép chuỗi rỗng
    if (origin !== undefined) udtProduct.origin = origin;
    if (fiber !== undefined) udtProduct.fiber = fiber;
    if (oum !== undefined) udtProduct.oum = oum;
    if (supplier !== undefined) udtProduct.supplier = supplier;
    if (uses !== undefined) udtProduct.uses = uses;
    if (discount !== undefined) udtProduct.discount = discount;
    if (description !== undefined) udtProduct.description = description;

    // Cập nhật thời gian sửa đổi
    udtProduct.updateProduct = new Date();

    // Lưu lại sản phẩm đã cập nhật
    await udtProduct.save();
    return udtProduct; // Trả về sản phẩm đã được cập nhật thay vì chỉ true
  } catch (error) {
    console.log("updateProduct error: ", error.message);
    throw new Error(`Cập nhật sản phẩm lỗi: ${error.message}`);
  }
};

const getProductsByCategory = async (id) => {
  try {
    console.log("---------------id: ", id);
    let query = {};
    query = {
      ...query,
      "category.category_id": new Types.ObjectId(id),
    };
    console.log(query);
    const products = await ProductModel.find(query);
    return products;
  } catch (error) {
    console.log("findProduct error: ", error.message);
    throw new Error("Tìm kiếm sản phẩm không thành công");
  }
};

const commentProduct = async (
  productId,
  user,
  rating,
  comment,
  images,
  videos,
  displayName
) => {
  try {
    console.log("1");
    const productInDB = await ProductModel.findById(productId);
    if (!productInDB) {
      throw new Error("Sản phẩm không tồn tại");
    }

    const userInDB = await UserModel.findById(user);
    if (!userInDB) {
      throw new Error("Người dùng không tồn tại");
    }

    const newComment = {
      productId,
      user: { _id: userInDB._id, name: userInDB.name },
      rating,
      comment,
      images,
      videos,
      displayName,
    };
    console.log(user);
    productInDB.comments.push(newComment);

    await productInDB.save();
    return productInDB;
  } catch (error) {
    console.error("addComment error:", error);
    throw error;
  }
};

// const getTop10PW = async (week, year) => {
//   // Hàm tính ngày bắt đầu tuần
//   function getStartOfWeek(week, year) {
//     const firstDayOfYear = new Date(year, 0, 1);
//     const days = (week - 1) * 7;
//     const startOfWeek = new Date(
//       firstDayOfYear.setDate(firstDayOfYear.getDate() + days)
//     );
//     startOfWeek.setHours(0, 0, 0, 0);
//     return startOfWeek;
//   }

//   // Hàm tính ngày kết thúc tuần
//   function getEndOfWeek(week, year) {
//     const startOfWeek = getStartOfWeek(week, year);
//     const endOfWeek = new Date(startOfWeek);
//     endOfWeek.setDate(startOfWeek.getDate() + 6);
//     endOfWeek.setHours(23, 59, 59, 999);
//     return endOfWeek;
//   }

//   const currentDate = new Date();
//   week =
//     week ||
//     Math.ceil(
//       ((currentDate - new Date(currentDate.getFullYear(), 0, 1)) / 86400000 + 1) / 7
//     );
//   year = year || currentDate.getFullYear();

//   const startOfWeek = getStartOfWeek(week, year);
//   const endOfWeek = getEndOfWeek(week, year);

//   console.log("Start of Week:", startOfWeek);
//   console.log("End of Week:", endOfWeek);

//   try {
//     // Lấy các đơn hàng trong tuần
//     const orders = await OrderModel.find({
//       date: { $gte: startOfWeek, $lte: endOfWeek },
//     }).select("cart");

//     // Đếm tổng số lượng đã bán cho mỗi sản phẩm trong tuần
//     const productSales = {};

//     for (let order of orders) {
//       for (let product of order.cart[0].products) {
//         const productId = product._id;
//         const quantitySold = product.quantity;

//         if (productSales[productId]) {
//           productSales[productId] += quantitySold;
//         } else {
//           productSales[productId] = quantitySold;
//         }
//       }
//     }

//     // Lấy top 10 sản phẩm bán chạy
//     const productIds = Object.keys(productSales);
//     const topProducts = await ProductModel.find({
//       _id: { $in: productIds },
//     })
//       .select("name sold")
//       .sort({ sold: -1 })
//       .limit(10);

//     console.log("Top 10 Products:", topProducts);
//     return topProducts;
//   } catch (error) {
//     console.error("Error in getTop10PW:", error.message);
//     throw new Error(error.message);
//   }
// };
const getTop10PW = async (inputDate) => {
  const getStartOfWeekFromDate = (date) => {
    const dayOfWeek = date.getDay(); // Chủ nhật = 0
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  };

  const getEndOfWeekFromDate = (startOfWeek) => {
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    return endOfWeek;
  };

  try {
    const currentDate = inputDate ? new Date(inputDate) : new Date();
    const startOfWeek = getStartOfWeekFromDate(currentDate);
    const endOfWeek = getEndOfWeekFromDate(startOfWeek);

    console.log("Start of Week:", startOfWeek);
    console.log("End of Week:", endOfWeek);

    const orders = await OrderModel.find({
      date: { $gte: startOfWeek, $lte: endOfWeek },
    }).select("cart");

    if (!orders || orders.length === 0) {
      console.log("No orders found for the week.");
      return [];
    }

    const productSales = {};
    for (let order of orders) {
      if (!order.cart || !order.cart[0]?.products) continue;

      for (let product of order.cart[0].products) {
        const productId = product._id;
        const quantitySold = product.quantity || 0;
        productSales[productId] = (productSales[productId] || 0) + quantitySold;
      }
    }

    const productIds = Object.keys(productSales);
    if (productIds.length === 0) {
      console.log("No products sold during the week.");
      return [];
    }

    const topProducts = await ProductModel.find({
      _id: { $in: productIds },
    })
      .select("name sold")
      .sort({ sold: -1 })
      .limit(10);

    console.log("Top 10 Products:", topProducts);
    return topProducts;
  } catch (error) {
    console.error("Error in getTop10PW:", error.message);
    throw new Error(error.message);
  }
};

const ThongKeDoanhSo = async (inputDate) => {
  const getStartOfWeekFromDate = (date) => {
    const dayOfWeek = date.getDay(); // Chủ nhật = 0
    const startOfWeek = new Date(date);
    startOfWeek.setDate(date.getDate() - dayOfWeek);
    startOfWeek.setHours(0, 0, 0, 0);
    return startOfWeek;
  };

  const getEndOfWeekFromDate = (startOfWeek) => {
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(startOfWeek.getDate() + 6);
    endOfWeek.setHours(23, 59, 59, 999);
    return endOfWeek;
  };

  try {
    const currentDate = inputDate ? new Date(inputDate) : new Date();
    const startOfWeek = getStartOfWeekFromDate(currentDate);
    const endOfWeek = getEndOfWeekFromDate(startOfWeek);

    console.log("Start of Week:", startOfWeek);
    console.log("End of Week:", endOfWeek);

    // Tìm các đơn hàng trong khoảng thời gian của tuần
    const orders = await OrderModel.find({
      date: { $gte: startOfWeek, $lte: endOfWeek },
    }).select("cart");

    if (!orders || orders.length === 0) {
      console.log("No orders found for the week.");
      return [];
    }

    // Thống kê tổng doanh thu cho từng sản phẩm
    const productRevenue = {};
    for (let order of orders) {
      if (!order.cart || !order.cart[0]?.products) continue;

      for (let product of order.cart[0].products) {
        const productId = product._id;
        const quantitySold = product.quantity || 0;
        const productPrice = product.price || 0; // Assume each product has a price field
        const revenue = quantitySold * productPrice;

        productRevenue[productId] = (productRevenue[productId] || 0) + revenue;
      }
    }

    const productIds = Object.keys(productRevenue);
    if (productIds.length === 0) {
      console.log("No products sold during the week.");
      return [];
    }

    // Lấy thông tin sản phẩm và ghép với doanh thu đã bán
    const products = await ProductModel.find({
      _id: { $in: productIds },
    }).select("name");

    const revenueReport = products.map((product) => ({
      productId: product._id,
      name: product.name,
      totalRevenue: productRevenue[product._id] || 0,
    }));

    // Sắp xếp theo tổng doanh thu giảm dần
    revenueReport.sort((a, b) => b.totalRevenue - a.totalRevenue);

    console.log("Weekly Revenue Report:", revenueReport);
    return revenueReport;
  } catch (error) {
    console.error("Error in getWeeklyRevenueReport:", error.message);
    throw new Error(error.message);
  }
};


const updateQuantity = async (id, quantityChange) => {
  try {
    // Kiểm tra ID sản phẩm có hợp lệ không
    if (!id || typeof id !== 'string') {
      throw new Error("ID sản phẩm không hợp lệ");
    }

    // Tìm sản phẩm theo ID
    const product = await ProductModel.findById(id);
    if (!product) {
      throw new Error(`Không tìm thấy sản phẩm với ID: ${id}`);
    }

    // Kiểm tra giá trị thay đổi số lượng
    if (quantityChange === undefined || typeof quantityChange !== "number") {
      throw new Error("Số lượng thay đổi không hợp lệ");
    }

    // Kiểm tra số lượng thay đổi có phải là số nguyên không
    if (!Number.isInteger(quantityChange)) {
      throw new Error("Số lượng thay đổi phải là số nguyên");
    }

    // Đảm bảo không giảm số lượng vượt quá tồn kho
    if (quantityChange < 0 && product.quantity + quantityChange < 0) {
      throw new Error("Số lượng thay đổi vượt quá tồn kho hiện có");
    }

    // Cập nhật số lượng sản phẩm
    product.quantity += quantityChange;

    // Cập nhật thời gian sửa đổi
    product.updatedAt = new Date();

    // Lưu lại sản phẩm đã cập nhật vào cơ sở dữ liệu
    await product.save();

    return {
      success: true,
      message: "Cập nhật số lượng thành công",
      data: product,
    };
  } catch (error) {
    console.error("updateQuantity error: ", error.message);

    // Trả về thông báo lỗi
    return {
      success: false,
      message: error.message,
    };
  }
};
const deleteProductDB = async (productId) => {
  try {
    // Kiểm tra ID sản phẩm hợp lệ
    if (!mongoose.Types.ObjectId.isValid(productId)) {
      throw new Error("ID sản phẩm không hợp lệ.");
    }

    // Kiểm tra xem sản phẩm có trong đơn hàng nào không
    const productInOrder = await CartModel.aggregate([
      { $match: { "products._id": new mongoose.Types.ObjectId(productId) } }, // Tìm sản phẩm trong giỏ hàng
      {
        $lookup: {
          from: "products",
          localField: "products._id",
          foreignField: "_id",
          as: "productDetails"
        }
      },
      { $unwind: "$products" },
      { $unwind: "$productDetails" },
      {
        $match: { "products._id": new mongoose.Types.ObjectId(productId) }
      }
    ]);

    if (productInOrder.length > 0) {
      throw new Error("Không thể xóa sản phẩm vì sản phẩm đang có trong giỏ hàng.");
    }

    // Tiến hành xóa sản phẩm
    const result = await ProductModel.findByIdAndDelete(productId);
    if (!result) {
      throw new Error("Sản phẩm không tồn tại hoặc đã bị xóa.");
    }

    return { status: true, message: "Xóa sản phẩm thành công." };
  } catch (error) {
    console.error("Lỗi khi xóa sản phẩm:", error);
    return { status: false, message: error.message };
  }
};

// quản lí hàng hóa

module.exports = {
  getProduct,
  getProductDetailById_App,
  getTopProductSell_Web,
  findProductsByKey_App,
  deleteProduct,
  addProduct,
  updateProduct,
  getProductsByCategory,
  commentProduct,
  getTop10PW,
  updateQuantity,
  ThongKeDoanhSo,
  getOutOfStockProducts,
  deleteProductDB
};
