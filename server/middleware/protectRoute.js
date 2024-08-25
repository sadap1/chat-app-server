const jwt = require('jsonwebtoken');
const { makeAuthDao } = require('../auth-dao.js');

module.exports.protectRoute = async (req, res, next) => {
	try {
		const token = req.cookies.jwt;

		if (!token) {
			return res.status(401).json({ error: "Unauthorized - No Token Provided" });
		}

		const decoded = jwt.verify(token, process.env.JWT_SECRET);

		if (!decoded) {
			return res.status(401).json({ error: "Unauthorized - Invalid Token" });
		}
        let dao;
        const dbUrl = process.env.MONGO_URL;
        const daoResult = await makeAuthDao(dbUrl);
        if(!daoResult.status){
            console.error(daoResult.message);
        }
        dao = daoResult.dao;
        const getUser = await dao.getByUserId(decoded.userId);

		if (!getUser.status) {
			return res.status(404).json({ error: "User not found" });
		}
        delete getUser.user.password;
		req.user = getUser.user;

		next();
	} catch (error) {
		console.log("Error in protectRoute middleware: ", error.message);
		res.status(500).json({ error: "Internal server error" });
	}
};