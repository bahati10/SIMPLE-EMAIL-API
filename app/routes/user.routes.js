const passport = require('passport');
const jwt = require('jsonwebtoken');

const users = require("../controllers/user.controller.js");

const router = require("express").Router();


  // Create a new User
  router.post("/create", users.create);
  // // LOGIN
  // router.post("/login", users.login);

  // Retrieve all Users
  router.get("/all", users.findAll);

  // Retrieve a single User with id
  router.get("/one/:id", users.findOne);

  // Update a User with id
  router.put("/update/:id", users.update);

  // Delete a User with id
  router.delete("/delete/:id", users.delete);

  // Delete all Users
  router.delete("/deleteall", users.deleteAll);



router.get('/auth/google', passport.authenticate('google', { scope: ['email', 'profile'] }));


router.get('/google/callback', passport.authenticate('google', { session: false }), (req, res) => {
  const token = jwt.sign({ id: req.user.id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  res.json({ token });
});

module.exports=router;
