require('dotenv').config();
const session = require('express-session');
const express = require('express');
const passport = require('passport');
const app = express();
const db = require('./app/models');
const userRouter = require('./app/routes/user.routes'); // pass the app object
require('./auth');


app.use(session({ secret: process.env.SECRET_KEY }));
app.use(passport.initialize());
app.use(passport.session());

app.use(express.json());
app.use(express.urlencoded({ extended: true }));


db.sequelize.sync()
  .then(() => {
    console.log('Synced db.');
  })
  .catch((err) => {
    console.log('Failed to sync db: ' + err.message);
  });

app.use('/', userRouter);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}.`);
});
