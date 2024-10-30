var express = require("express");
var router = express.Router();

const OderController = require("../controllers/OderController");

router.get("/getAllOrder", async (req, res, next) => {
  try {
    const result = await OderController.getAllOrder();
    return res.status(200).json({ status: true, data: result });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ status: false, data: error.message });
  }
});

/**
 * lấy ds tất cả danh mục
 * method: get
 * url: http://localhost:6677/categories
 * trả về:
 */
router.post("/addOder", async (req, res, next) => {
  try {
    const { cart, address, ship, sale } = req.body;
    const result = await OderController.addOrder(cart, address, ship, sale);
    return res.status(200).json({ status: true, data: result });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ status: false, data: error.message });
  }
});

// cập nhật trạng thái đơn hàng
router.post("/:id/updateOrder", async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status } = req.body;
    const result = await OderController.updateOrder(id, status);
    return res.status(200).json({ status: true, data: result });
  } catch (error) {
    console.log(error.message);
    return res.status(500).json({ status: false, data: error.message });
  }
});

module.exports = router;