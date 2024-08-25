const { makeMsgDao } = require('../message-dao.js');

module.exports.sendMsg = async (req, res, next) => {
    try {
        let dao;
        const dbUrl = process.env.MONGO_URL;
        const daoResult = await makeMsgDao(dbUrl);
        if(!daoResult.status){
          console.error(daoResult.message);
        }
        dao = daoResult.dao;
        const { from, to, message } = req.body;
        const messageData = { message: { text: message }, users: [from, to], sender: from, };
        const m = await dao.add(messageData);
        if(m.status){
          return res.json({ msg: "Message added successfully." });
        }else{
          return res.json({ status: true, u });
        }
      } catch (ex) {
        next(ex);
      }
};

module.exports.fetchMsg = async (req, res, next) => {
  try {
    let dao;
    const dbUrl = process.env.MONGO_URL;
    const daoResult = await makeMsgDao(dbUrl);
    if(!daoResult.status){
      console.error(daoResult.message);
    }
    dao = daoResult.dao;
    const { from, to } = req.body;
    const messages =  await dao.getMessages(req.body);
    const projectedMessages = messages.cursor.map((msg) => {
      return {
        fromSelf: msg.sender.toString() === from,
        message: msg.message.text,
      };
    });
    return res.json(projectedMessages);
  } catch (ex) {
    next(ex);
  }
};