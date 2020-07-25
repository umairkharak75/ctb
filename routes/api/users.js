const express = require("express");
const router = express.Router();
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const auth = require("../../middleware/auth");
const checkObjectId=require("../../middleware/checkId")
const normalize = require('normalize-url');
const multer = require("multer");

const config = require("config");
const { check, validationResult, body } = require("express-validator");
//const normalize = require('normalize-url');

const User = require("../../models/User");



var storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "./public/");
  },
  filename: function (req, file, cb) {
    //cb(null, file.originalname + "-" + Date.now());
    console.log(file);
    cb(null, Date.now() + file.originalname);
  },
});
const fileFilter = (req, file, cb) => {
  // reject a file
  if (file.mimetype === "image/jpeg" || file.mimetype === "image/png") {
    cb(null, true);
  } else {
    cb(null, false);
  }
};

const upload = multer({
  storage: storage,
  limits: {
    fileSize: 1024 * 1024 * 5,
  },
  fileFilter: fileFilter,
});

// @route    POST api/users
// @desc     Register user
// @access   Public
router.post(
  "/",
  [
    check("name", "Name is required").not().isEmpty(),
    check("email", "Please include a valid email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { email, name, password } = req.body;

    try {
      let user = await User.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exists" }] });
      }

      user = new User({
        name,
        email,
        password,
      });

      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const askQuestionLink = `http://localhost:4200/ask/${user.id}`;
      const createLink = `http://localhost:4200/profile/${user.id}`;

      const payload = {
        user: {
          id: user.id,
        },
      };

      const createdUser = {
        id: user.id,
        email: user.email,
        link: createLink,
        askQuestionLink:askQuestionLink,
        name:user.name
      };

      jwt.sign(
        payload,
        "Silencio is a villainsio",
        { expiresIn: "5 days" },
        (err, token) => {
          if (err) throw err;
          res.json({ token: token, user: createdUser });
        }
      );
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);
router.get(
  "/allUser",
   [auth],
  async (req, res) => {
  
    try {
      let user = await User.find().limit(8);
     
      res.json({ users:user });
     
  
      
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

router.get(
  "/findSpecificUser/:id",
   [auth],
  async (req, res) => {
  
    try {
      let user = await User.find({_id:req.params.id}).select("-password");;     
      res.json({ users:user });
     
  
      
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);

router.get(
  "/userIdConfirmation/:id",[checkObjectId('id')],
   
  async (req, res) => {
  
    try {
      let user = await User.find({_id:req.params.id})
        console.log(user)
      res.json({ users:user });
     
  
      
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server error");
    }
  }
);


router.patch("/profileSettings/:id", auth, async (req, res) => {
  let user = await User.find({userName:req.body.userName}).select("-password");
  
    if(user.length ){
      console.log(user)
     
      if(user[0]._id.toString() !== req.user.id) 
      {return res.json({ msg:'userName already exist',
    
              error:409 
    })};
    }
  
  
  
  const {
    userName,
    name,
    dateOfBirth,
    email,
    twitter,
    instagram,
    linkedIn,
    facebook
  } = req.body;

  const profileFields = {
    userName,
    name,
    dateOfBirth,
    email
  };
  const socialfields = {  twitter, instagram, linkedIn, facebook };
    for (const [key, value] of Object.entries(socialfields)) {
      if (value && value.length > 0)
        socialfields[key] = normalize(value, { forceHttps: true });
    }
    profileFields.social = socialfields;
  
  
   var myquery = { _id:req.user.id};
   var newvalues = {$set: profileFields};
   try {
    const resul=  await User.findOneAndUpdate(myquery, newvalues, {new: true,upsert:true});
    res.json({ msg:'Updated Successfully' });
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }

});


// @route   patch /updateProfilePic
// @desc    will update profile pic
// @access  private
router.patch("/updateProfilePic", [auth], upload.single("productImage"), async(req, res) => {

  try { 
    let user = await User.find({_id:req.user.id}).select("-password");;
    var path=req.file.path
    imagepath = path.replace(/\\/g, "/");
    User.findOneAndUpdate({_id:req.user.id}, {$set:{profilePic:'http://localhost:5000/'+imagepath}}, {new: true}, (err, user) => {
      if (err) {
          console.log("Something wrong when updating data!");
      }
      res.json({user})
  });
    
    
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server error");
  }
});

module.exports = router;
