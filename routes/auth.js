const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const User = require("./../models/User");
const jwt = require("jsonwebtoken");
const path = require("path");
const multer = require("multer");
const fetchUser = require("../middleware/fetchUser");
const { body, validationResult } = require("express-validator");
const fs = require("fs");
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, "uploads");
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + "-" + file.originalname);
  },
});

const upload = multer({ storage: storage });

router.post(
  "/create",
  upload.single("profileImage"),
  [
    body("email").isEmail(),
    body("name").isLength({ min: 3 }),
    body("password").isLength({ min: 5 }),
  ],
  async (req, res) => {
    const result = validationResult(req);
    if (result.isEmpty()) {
      const { email, name, password } = req.body;

      try {
        const existingUser = await User.findOne({ email });

        if (existingUser) {
          return res.status(400).json({ error: "User already exists" });
        }

        let secPass = await bcrypt.hash(password, 10);

        let profileImageUrl = "";
        if (req.file) {
          profileImageUrl = req.file.path;
        }

        const user = new User({
          name,
          email,
          password: secPass,
          profileImage: profileImageUrl,
        });

        await user.save();

        const data = {
          user: {
            id: user.id,
          },
        };

        let token = jwt.sign(data, process.env.SECRET);
        return res.json({ token });
      } catch (err) {
        res.status(500).json({ msg: "Internal Server err" });
        return console.error("Error creating user", err);
      }
    }

    res.send({ errors: result.array() });
  }
);

//login endpoint

router.post(
  "/login",
  [body("email").isEmail(), body("password").exists()],
  async (req, res) => {
    const result = validationResult(req);
    if (result.isEmpty()) {
      const { email, password } = req.body;
      try {
        let user = await User.findOne({ email });
        if (!user) {
          return res.status(400).json({ error: "please enter correct creds" });
        }

        const passCompare = await bcrypt.compare(password, user.password);
        if (!passCompare) {
          return res.status(400).json({ error: "please enter correct creds" });
        }

        const data = {
          user: {
            id: user.id,
          },
        };
        let token = jwt.sign(data, process.env.SECRET);
        return res.json({ token });
      } catch (err) {
        res.status(500).json({ msg: "Internal Server err" });
        console.error("error caused in login", err);
      }
    }

    res.send({ error: result.array() });
  }
);

//Update USER
router.put(
  "/update",
  fetchUser, // Middleware to fetch the authenticated user
  upload.single("profileImage"), // Add this middleware to handle file upload
  async (req, res) => {
    try {
      // Fetch the user's data from the database using req.user.id
      const user = await User.findById(req.user.id);

      if (!user) {
        return res.status(404).json({ error: "User not found" });
      }

      const { name, email, password } = req.body;
      const updatedUserData = {
        name,
        email,
        password,
      };

      if (req.file) {
        if (user.profileImage) {
          const previousImagePath = path.join(
            __dirname,
            "..",
            "uploads",
            user.profileImage
          );
          if (fs.existsSync(previousImagePath)) {
            fs.unlinkSync(previousImagePath);
          }
        }
        updatedUserData.profileImage = req.file.filename;
      }

      // Update the user's information in the database
      const updatedUser = await User.findByIdAndUpdate(
        req.user.id,
        updatedUserData,
        { new: true }
      );

      // Generate a new token with updated user data if needed

      res.json({
        msg: "done successfully",
        profileImage: updatedUser.profileImage,
      });
    } catch (err) {
      console.error("Error updating user profile:", err);
      res.status(500).json({ error: "Internal Server Error" });
    }
  }
);
//fetchUser
router.get("/getuser", fetchUser, async (req, res) => {
  try {
    let user = await User.findById(req.user.id).select("-password");
    res.json(user);
  } catch (err) {
    res.status(500).json({ msg: "Internal Server err" });
    console.error("error getting users  ", err);
  }
});
module.exports = router;
