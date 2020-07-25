const mongoose = require("mongoose");
const Schema = mongoose.Schema;

// Create Schema
const QuestionSchema = new Schema({
  user: {
    type: Schema.Types.ObjectId,
    ref: "users",
  },
  question: {
    type: String,
    required: true,
  },
  visibleStatus: {
    type: Boolean,
  },
  answer: {
    type: String,
  },

  date: {
    type: Date,
    default: Date.now,
  },
});

module.exports = Question = mongoose.model("question", QuestionSchema);
