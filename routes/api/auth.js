const express = require("express");
const auth = require("../../middleware/auth");
const User = require("../../models/User");
const { check, validationResult } = require("express-validator/check");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
//const config = require('config')
const jwtSecret = "Silencio is a villainsio";

const router = new express.Router();

/*
 *  @route   POST api/login
 *  @desc    Test route
 *  @access  Public
 */
router.get("/", auth, async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (e) {
    console.error(e.message);
    res.status(500).send("Server error");
  }
});

router.post(
  "/",
  [
    check("email").isEmail(),
    check(
      "password",
      "Please enter a password with 6 or more characters"
    ).isLength({ min: 6 }),
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (errors.length > 0) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { provider, id } = req.body;
    if (provider !== "") {
      const { email, id } = req.body;
      try {
        let user = await User.findOne({ email: req.body.email });
        if (!user) {
          user = new User({
            email: req.body.email,
            password: req.body.password,
            name: req.body.name,
            profilePic:req.body.profilePic,
            userName:req.body.name,
          });

          const salt = await bcrypt.genSalt(10);

          user.password = await bcrypt.hash(req.body.password, salt);

          await user.save();
        }
        const payload = {
          user: {
            id: user.id,
          },
        };
        const createLink = `http://localhost:4200/profile/${payload.user.id}`;
        const askQuestionLink = `http://localhost:4200/ask/${user.id}`;
        const userObject = {
          id: payload.user.id,
          email: email,
          link: createLink,
          askQuestionLink:askQuestionLink,
          name:user.name,
          profilePic:user.profilePic,
          social:user.social
        };

          


  

        jwt.sign(payload, jwtSecret, { expiresIn: "365d" }, (err, token) => {
          if (err) {
            throw err;
          }
          res.json({ token: token, user: userObject });
        });
      } catch (e) {
        console.error(e.message);
        res.status(500).send("Server error");
      }
    } else {
      const { email, password } = req.body;

      try {
        let user = await User.findOne({ email });

        if (!user) {
          return res
            .status(400)
            .json({ errors: [{ msg: "Invalid credentials" }] });
        }

        const payload = {
          user: {
            id: user.id,
          },
        };

        const createLink = `http://localhost:4200/profile/${user.id}`;
      const askQuestionLink = `http://localhost:4200/ask/${user.id}`;

        const userObject = {
          id: user.id,
          email: user.email,
          link: createLink,
          askQuestionLink:askQuestionLink,
          name:user.name
        };

        const isMatch = await bcrypt.compare(password, user.password);

        if (!isMatch) {
          return res
            .status(400)
            .json({ errors: [{ msg: "Invalid credentials" }] });
        }

        jwt.sign(payload, jwtSecret, { expiresIn: "365d" }, (err, token) => {
          if (err) {
            throw err;
          }
          res.json({ token: token, user: userObject });
        });
      } catch (e) {
        console.error(e.message);
        res.status(500).send("Server error");
      }
    }
  }
);

module.exports = router;
