const {
    sendMsg,
    fetchMsg,
  } = require("../controllers/msgController");

const { protectRoute } = require("../middleware/protectRoute");

const router = require("express").Router();
  
router.post("/sendMsg", protectRoute ,sendMsg);
router.post("/fetchMsg", protectRoute, fetchMsg);

  module.exports = router;