const mongoose = require('mongoose');
const Schema = mongoose.Schema;

// Create Schema
const UserSchema = new Schema({
  name: {
    type: String,
    required: true
  },
 
  dateOfBirth: {
    type: Date,
    
  },
    
    
  email: {
    type: String,
    required: true
  },
  password: {
    type: String,
    required: true
  },
  profilePic: {
    type: String,
  },
  userName: {
    type: String,
  },
  PhoneNumber:{
    type: String
  },
  language:{
    type:String
  },
  country:{
    type:String
  },

  social: {
    linkedIn: {
      type: String
    },
    twitter: {
      type: String
    },
    facebook: {
      type: String
    },
    instagram: {
      type: String
    }
  },
 
  date: {
    type: Date,
    default: Date.now
  }
});

module.exports = User = mongoose.model('users', UserSchema);
