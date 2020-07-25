const express = require("express");
const router = express.Router();
const multer = require("multer");
const mongoose = require("mongoose");

const Post = require("../../models/Post");
const Notification = require("../../models/notifications");

const auth = require("../../middleware/auth");
const { check, validationResult } = require("express-validator");
var _ = require("lodash");

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

// @route    GET api/posts
// @desc     Get all posts
// @access   Private

router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().populate("user", ["name", "profilePic"]).sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    GET api/posts/notification/:id
// @desc     Get all unseen user specific notifications
// @access   Private

router.get("/notification/:id", auth, async (req, res) => {
  try {
    const notification = await Notification.find({userNotification:req.user.id,}).populate("reviewUserId", ["name", "profilePic"]).sort({ date: -1 });
  
    console.log(notification)
    res.json(notification);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});


// @route    delete api/posts/notification/:id
// @desc     delete notification
// @access   private

router.delete("/notification/:id", auth, async (req, res) => {
  try {
    const notification = await Notification.findById(req.params.id);
    
    if (!notification) {
      return res.status(404).json({ msg: "Notification not Found" });
    }

    // Check user
    if (notification.userNotification.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    await notification.remove();

    res.json({ msg: "Notification removed" });
  } catch (err) {
    console.error(err.message);

    res.status(500).send("Server Error");
  }
});


router.patch("/notification/:id", auth, async (req, res) => {
  try {
   var myquery = { userNotification:req.params.id};
   var newvalues = {$set: {status: "seen"} };
  Notification.updateMany(myquery, newvalues, function(err, res) {
    if (err) throw err;
    console.log(res + " document(s) updated");
  });
   

  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});


// @route   GET api/posts/test
// @desc    Tests post route
// @access  Public
router.post("/", [auth], upload.single("productImage"), (req, res) => {
  const post = new Post({
    user: req.user.id,
     description: req.body.description,
  
    productImage: req.file.path,
  });
  post
    .save()
    .then((result) => {
      console.log(result);
      res.status(201).json({
        message: "Created product successfully",
        createdPost: {
          user: req.user.id,
          description: result.description,
          _id: result._id,
          productImage: result.productImage,
        },
      });
    })
    .catch((err) => {
      console.log(err);
      res.status(500).json({
        error: err,
      });
    });
});

// @route    POST api/posts/comment/:id
// @desc     Comment on a post
// @access   Private
router.post(
  "/review/:id",
  [auth, [check("review", "review is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");
      const allpost = await Post.findById(req.params.id);
      const newComment = {
        review: req.body.review,
        name: user.name,
        user: user.id,
        profilePic:user.profilePic
      };
      allpost.comments.unshift(newComment);
      await allpost.save();
      const notification = new Notification({
        reviewUserId: req.user.id,
        reviewUsername: user.name,
        postId:allpost._id,
        postDescription:allpost.description,
        userNotification:allpost.user,
        status:'unSeen',
        notificationType:'review'
      });
     
      await notification.save()

      res.json(allpost.comments);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route    DELETE api/posts/:id
// @desc     Delete a post
// @access   Private
router.delete("/:id", [auth], async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    console.log(post, "fetche from db");
    if (!post) {
      return res.status(404).json({ msg: "Post not found" });
    }

    // Check user
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    await post.remove();

    res.json({ msg: "Post removed" });
  } catch (err) {
    console.error(err.message);

    res.status(500).send("Server Error");
  }
});
// @route     api/posts/:userId
// @desc    getAllPostofSpecifcUser
// @access   Private
router.get("/:id", [auth], async (req, res) => {
   let userId
  if(req.params.id){
     userId=req.params.id
    }
    else{userId=req.user.id}
  try {
    const post = await Post.find({ user: userId }).populate("user", ["name", "profilePic"]).sort({ date: -1 });

    
    res.json(post);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});



// @route     api/posts/avg/:userId
// @desc    getAllPostofSpecifcUser and calculate of avg of response
// @access   Private
// router.get("/avg/:id", [auth], async (req, res) => {
//   let sum=0
//   let userId
//   reviewCount=0
//  if(req.params.id){
//     userId=req.params.id
//    }
//    else{userId=req.user.id}
//  try {
//    const post = await Post.find({ user: userId })
//    console.log(post,'checing')
//    if(post){
//       post.forEach(post=>{  
//         if(post.comments){
//           post.comments.forEach(comments=>{
//             sum=comments.review+sum
//             reviewCount++
//           })
//         }
        
//       })
//     }
//       console.log(sum,'hello')
     
//    res.json(post);
//  } catch (err) {
//    console.error(err.message);
//    res.status(500).send("Server Error");
//  }
// });
















module.exports = router;
