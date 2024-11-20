const mongoose = require("mongoose");
const roomSchema = new mongoose.Schema({
    roomId: {
        type: String,
        required: [true, "Please provide a room id"],
    },
    user: [
        {
            userName: {
                type: String,
                required: [true, "Please provide a username"],
            },
            content: {
                type: String,
                required: [false, "Please provide a username"],
            },
            userId: {
                type: String,
                required: [true, "Please provide a username"],
            },
        }
    ]
  });
  const roomModel = mongoose.model('rooms',roomSchema);

  module.exports = roomModel;