const express = require("express");
const router = express.Router();

router.get("/", (req, res) => {
  res.json({ msg: "hofjjfa" });
});

router.post("/add", async () => {
  res.json("jdjdsfj");
});

module.exports = router;
