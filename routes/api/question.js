const express = require("express");
const router = express.Router();
const { check, validationResult } = require("express-validator");
const Question = require("../../models/question");
const Notification=require("../../models/notifications")
const auth = require("../../middleware/auth");

// @route    QUESTION api/question
// @desc     Create a question
// @access   Public
router.post(
  "/:userId",
  [check("question", "Text is required").not().isEmpty()],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    } 

    try {
      const user = await User.findById(req.params.userId).select("-password");

      const newQuestion = new Question({
        question: req.body.question,
        user: req.params.userId,
        answer: req.body.answer || "",
        visibleStatus:false,
      });

      console.log(user,'checkUserrrr')

      const question = await newQuestion.save();

      const notification = new Notification({
       // reviewUserId: req.params.userId,
        reviewUsername: user.name,
        postId:question._id,
        postDescription:question.question,
        userNotification:req.params.userId,
        status:'unSeen',
        notificationType:'question'
      });
     
      await notification.save()
      res.json(question);
    } catch (err) {
      console.error(err.message);
      res.status(500).send("Server Error");
    }
  }
);

// @route    GET api/question
// @desc     Get all questions
// @access   Public
router.get("/:id", async (req, res) => {
  try {
    const question = await Question.find({ user: req.params.id }).sort({
      date: -1,
    });
    res.json(question);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});
// @route    GET api/question
// @desc     Get all questions
// @access   Public
router.get("/length/:id", async (req, res) => {
  try {
    const question = await Question.find({ user: req.params.id ,answer:''})
    console.log(question.length)
    res.json(question.length);
  } catch (err) {
    console.error(err.message);
    res.status(500).send("Server Error");
  }
});

// @route    PUT api/profile/education
// @desc     Add profile education
// @access   Private
router.patch(
  "/answer/:id",
  [auth, [check("answer", "School is required").not().isEmpty()]],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { answer } = req.body;
    const options = {
      new: true,
    };
    try {
      Question.findOneAndUpdate(
        { _id: req.params.id },
        {
          $set: { answer: answer, visibleStatus: true },
        },
        options,
        (err, doc) => {
          if (err) {
            res.json("not found");
          }
          res.json({ msg: "success" });
        }
      );
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
    const question = await Question.findById(req.params.id);

    if (!question) {
      return res.status(404).json({ msg: "Post not found" });
    }

    // Check user
    if (question.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "User not authorized" });
    }

    await question.remove();

    res.json({ msg: "question removed" });
  } catch (err) {
    console.error(err.message);

    res.status(500).send("Server Error");
  }
});

module.exports = router;
