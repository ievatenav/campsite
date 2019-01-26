const mongoose = require("mongoose");

let campsiteSchema = new mongoose.Schema({
    name: String,
    price: String,
    img: String,
    description: String,
    author: {
        id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User"
        },
        username: String
    },
    comments: [
      {
         type: mongoose.Schema.Types.ObjectId,
         ref: "Comment"
      }
    ]
});

module.exports = mongoose.model("Campsite", campsiteSchema);