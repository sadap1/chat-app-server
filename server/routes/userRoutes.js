const {
    signup,
    signin,
    getcontacts,
    logout,
  } = require("../controllers/userController");
const { protectRoute } = require("../middleware/protectRoute")
const router = require("express").Router();
  
router.post("/signup", signup);
router.post("/signin", signin);
router.get("/getcontacts/:id", protectRoute, getcontacts);
router.get("/logout",logout);

  module.exports = router;