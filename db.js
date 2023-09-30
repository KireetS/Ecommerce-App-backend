const mongoose = require("mongoose");
const mongourl = process.env.MONGO_URI;
const connectToMongo = async () => {
  try {
    await mongoose.connect(mongourl, {
      useNewUrlParser: true,
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log("connected to mongo");
  } catch (err) {
    console.error(err);
  }
};

module.exports = connectToMongo;
