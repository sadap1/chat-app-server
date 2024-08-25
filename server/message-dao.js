const mongo = require('mongodb');

async function makeMsgDao(dbUrl) {
  return await MsgDao.make(dbUrl);
}

const MONGO_OPTIONS = {
  ignoreUndefined: true,
};

class MsgDao {
  constructor(client, messages) {
    this.client = client;
    this.messages = messages;
  }

  static async make(dbUrl) {
    try {
      const client = await (new mongo.MongoClient(dbUrl, MONGO_OPTIONS)).connect();
      const db = client.db();
      const messages = db.collection('messages');
      return { status: true, dao: new MsgDao(client, messages)};
    } catch (err) {
        return { msg: err.message, status: false };
    }
  }

  async close() {
    try {
      await this.client.close();
      return { status: true };
    } catch (err) {
        return { msg: err.message, status: false };
    }
  }

  async add(messageData) {
    const dbObj = { ...messageData };
    try {
      await this.messages.insertOne(dbObj);
      return { status: true, messageData };
    } catch (err) {
        return { msg: err.message, status: false };
    }
  }

  async getByUserId(userId) {
    try {
      const user = await this.users.findOne({ username: userId }, { projection: { _id: false } });
      if (user) {
        return { status: true, user };
      } else {
        return { msg: `no user for id '${userId}'`, status: false };
      }
    } catch (err) {
        return { msg: err.message, status: false };
    }
  }

  async getByEmail(email) {
    try {
      const user = await this.users.findOne({ email }, { projection: { _id: false } });
      if (user) {
        return { status: true, user };
      } else {
        return { msg: `no user for id '${email}'`, status: false };
      }
    } catch (err) {
        return { msg: err.message, status: false };
    }
  }

  async query(filter) {
    try {
      const index = filter.index ?? 0;
      const count = filter.count ?? DEFAULT_COUNT;
      const q = { ...filter };
      delete q.index;
      delete q.count;
      if (q.userId) q._id = q.userId;
      const cursor = await this.users.find(q, { projection: { _id: false } }).sort({ email: 1 }).skip(index).limit(count).toArray();
      return { status: true, cursor };
    } catch (err) {
        return { msg: err.message, status: false };
    }
  }

  async getMessages(filter) {
    try {
      const index = filter.index ?? 0;
      const count = filter.count ?? DEFAULT_COUNT;
      const q = { ...filter };
      delete q.index;
      delete q.count;
      const cursor = await this.messages.find({
        users: {
          $all: [q.from, q.to],
        },
      }).sort({ updatedAt: 1 }).toArray();
      return { status: true, cursor };
    } catch (err) {
        return { msg: err.message, status: false };
    }
  }

  async remove(userId) {
    try {
      const delResult = await this.users.deleteOne({ _id: userId });
      if (!delResult || delResult.deletedCount === 0) {
        return { msg: `no user for userId ${userId}`, status: false };
      }
      if (delResult.deletedCount !== 1) {
        return { msg: `expected 1 deletion; got ${delResult.deletedCount}`, status: false };
      }
      return { status: true };
    } catch (err) {
        return { msg: err.message, status: false };
    }
  }

  async update(userId, updates) {
    try {
      const updateOp = { $set: updates };
      const updateOpts = { projection: { _id: false }, returnDocument: mongo.ReturnDocument.AFTER };
      const updateResult = await this.users.findOneAndUpdate({ _id: userId }, updateOp, updateOpts);
      if (!updateResult) {
        return { msg: `no user for userId ${userId}`, status: false };
      } else {
        return { status: true, updateResult };
      }
    } catch (err) {
      console.error(err);
      return { msg: err.message, status: false };
    }
  }

  async clear() {
    try {
      await this.users.deleteMany({});
      return { status: true };
    } catch (err) {
        return { msg: err.message, status: false };
    }
  }
}

const DEFAULT_COUNT = 5;
const RAND_LEN = 2;

module.exports = {
  makeMsgDao
};
