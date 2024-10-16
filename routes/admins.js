const express = require("express");
var router = express.Router();
const adminController = require("../controllers/AdminController");

/* GET users listing. */

///////////////////////////////////////////////////////////////////
// login

router.post("/loginAdmin", async (req, res, next) => {
  try {
    const { email, password, adminID } = req.body;
    const result = await adminController.loginAdmin(email, password, adminID);
   
    if (result) {
      return res.status(200).json({ status: true, data: result });

    } else {
      return res
        .status(400)
        .json({ status: false, data: "Thông tin đăng nhập không đúng" });
    }
  } catch (error) {
    console.log("Login error:", error.message);
    return res.status(500).json({ status: false, data: error.message });
  }
});

module.exports = router;