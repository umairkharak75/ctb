const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const notificationSchema = mongoose.Schema({
    reviewUserId: {
    type: mongoose.Schema.Types.ObjectId,

    ref: "users",
  },

  reviewUsername: {
   type: String
  },
  status: {
    type: String
   },
   notificationType: {
    type: String
   },

  postId: {  type: mongoose.Schema.Types.ObjectId,
    postDescription: {
      type: String
     },
    

  ref: "post", },
  userNotification: { type: mongoose.Schema.Types.ObjectId,

    ref: "users", },
  
  date: {
    type: Date,
    default: Date.now,
  },
 
});

module.exports = mongoose.model("Notifications", notificationSchema);
