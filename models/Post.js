const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const PostSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,

    ref: "users",
  },
  description: { type: String },
  productImage: { type: String, required: true },
  
  date: {
    type: Date,
    default: Date.now,
  },
  comments: [
    {
      user: {
        type: Schema.Types.ObjectId,
      },
      review: {
        type: Number,
        required: true,
      },
      name: {
        type: String,
      },
      profilePic: {
        type: String,
      },
      date: {
        type: Date,
        default: Date.now,
      },
    },
  ],
});

module.exports = mongoose.model("Post", PostSchema);
