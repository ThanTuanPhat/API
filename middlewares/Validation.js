const { Types } = require("mongoose");
// Kiểm tra lỗi cho cả 1 sp, sử dụng ở thêm và sửa sản phẩm
const validateProduct = async (req, res, next) => {
  try {
    const {
      name,
      price,
      quantity,
      images,
      category,
      description,
      oum,
      fiber,
      origin,
      preserve,
      uses,
      discount,
    } = req.body;

    // Danh sách các giá trị OUM hợp lệ
    const validOUMs = ["kg", "chai", "bó", "gm"];

    // Kiểm tra tên sản phẩm
    if (!name || !name.trim() || !isNaN(name)) {
      throw new Error("Name is invalid");
    }

    // Kiểm tra giá sản phẩm
    if (!price || isNaN(price) || price <= 0) {
      throw new Error("Price is invalid");
    }

    // Kiểm tra số lượng sản phẩm
    if (!quantity || isNaN(quantity) || quantity <= 0) {
      throw new Error("Quantity is invalid");
    }

    // Kiểm tra hình ảnh sản phẩm
    if (!images || !Array.isArray(images) || images.length === 0) {
      throw new Error("Images are invalid");
    }

    // Kiểm tra danh mục sản phẩm
    if (!category) {
      throw new Error("Category is invalid");
    }

    // Kiểm tra UOM
    if (
      !oum ||
      typeof oum !== "string" ||
      !/^\s*(\d*\s*(kg|chai|bó|gram|lít|thùng|con|ml))$/i.test(oum.trim())
    ) {
      throw new Error(
        "OUM is invalid. Only allowed values are: kg, chai, bó, gram, lít, thùng, con, ml."
      );
    }

    // Kiểm tra preserve (bảo quản)
    if (!preserve) {
      throw new Error("Preserve information is invalid");
    }

    // Nếu mọi thứ ok thì chuyển sang middleware tiếp theo
    next();
  } catch (error) {
    console.log("Validate product error:", error.message);
    return res.status(400).json({ status: false, data: error.message });
  }
};

// Kiểm tra lỗi cho get sp
const validateLimitPage = async (req, res, next) => {
  try {
    const { limit, page } = req.query;
    if (!limit || isNaN(limit) || limit <= 0) {
      throw new Error("Limit is invalid");
    }
    if (!page || isNaN(page) || page <= 0) {
      throw new Error("Page is invalid");
    }
    // Nếu mọi thứ ok thì chuyển sang middleware tiếp theo
    next();
  } catch (error) {
    console.log("Validate limit and page error", error);
    return res.status(400).json({ status: false, data: error.message });
  }
};

// Kiểm tra lỗi cho get sp
const validateMinMax = async (req, res, next) => {
  try {
    const { min, max } = req.query;
    if (!min || isNaN(min) || min < 0) {
      // Changed to min < 0 to allow zero
      throw new Error("Min is invalid");
    }
    if (!max || isNaN(max) || max <= 0) {
      throw new Error("Max is invalid");
    }
    // Nếu mọi thứ ok thì chuyển sang middleware tiếp theo
    next();
  } catch (error) {
    console.log("Validate min and max error", error);
    return res.status(400).json({ status: false, data: error.message });
  }
};

// Kiểm tra username
const validateUserName = async (req, res, next) => {
  try {
    const { name } = req.body;
    if (!name.trim() || !isNaN(name)) {
      throw new Error("Username is invalid");
    }
    // Nếu mọi thứ ok thì chuyển sang middleware tiếp theo
    next();
  } catch (error) {
    console.log("Validate username error: ", error.message);
    return res.status(400).json({ status: false, data: error.message });
  }
};

// Kiểm tra email
const validateEmail = async (req, res, next) => {
  try {
    const { email } = req.body;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email.trim() || !emailRegex.test(email)) {
      throw new Error("Email is invalid");
    }
    // Nếu mọi thứ ok thì chuyển sang middleware tiếp theo
    next();
  } catch (error) {
    console.log("Validate email error: ", error.message);
    return res.status(400).json({ status: false, data: error.message });
  }
};

// Kiểm tra password
const validatePassword = async (req, res, next) => {
  try {
    const { password } = req.body;
    // Password có ít nhất 8 chữ số, chữ viết hoa, số, ký tự đặc biệt
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&^])[A-Za-z\d@.#$!%*?&]{8,15}$/;

    if (!password.trim() || !passwordRegex.test(password)) {
      throw new Error("Password is invalid");
    }
    // Nếu mọi thứ ok thì chuyển sang middleware tiếp theo
    next();
  } catch (error) {
    console.log("Validate password error: ", error.message);
    return res.status(400).json({ status: false, data: error.message });
  }
};

module.exports = {
  validateProduct,
  validateLimitPage,
  validateUserName,
  validateEmail,
  validatePassword,
  validateMinMax,
};
