const mongoose = require('mongoose');
var Schema = mongoose.Schema;
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");

const userSchema = new Schema({
  id: { type: String, required: false },
  username: { type: String, required: true },
  password: { type: String, required: true },
  organization: { type: mongoose.Schema.Types.ObjectId, ref: 'organization' },
  role: { type: mongoose.Schema.Types.ObjectId, ref: 'role' },
  status: { type: Number, default: 0, required: false },
},
  {
    timestamps: { createdAt: 'createdAt', updatedAt: 'updatedAt' }
  });

userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) {
    next();
  }
  try {
    this.password = await bcrypt.hash(this.password, 10);
    next();
  } catch (error) {
    next(error);
  }
});

userSchema.pre('save', function (next) {
  this.id = this._id;
  return next();
});

userSchema.methods.getJWTToken = function () {
  const expiresInMinutes = process.env.JWT_EXPIRE;
  const expirationTimeInSeconds = expiresInMinutes * 60;

  //const expirationTimestamp = Math.floor(Date.now() / 1000) + expirationTimeInSeconds;
  return jwt.sign({ id: this._id }, process.env.JWT_SECRET, {
    expiresIn: expirationTimeInSeconds,
  });
};

userSchema.methods.comparePassword = async function (password) {
  return await bcrypt.compare(password, this.password);
};

userSchema.pre('findOneAndUpdate', async function (next) {
  const update = this.getUpdate(); // Get the update object
  // Check if the password field exists and is being modified
  if (update.$set && update.$set.password) {
    try {
      // Hash the password and update the value in the update object

      delete update.$set.updatedAt;
      delete update.$setOnInsert;
      const hashedPassword = await bcrypt.hash(update.$set.password, 10);

      // Update the value of the password field in the update object
      update.$set.password = hashedPassword;
    } catch (error) {
      console.log("TCL: error", error)
      return next(error); // Pass error to the next middleware
    }
  }

  next(); // Call the next middleware
});

module.exports = mongoose.model('user', userSchema);