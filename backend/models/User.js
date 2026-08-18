const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Please add a name'],
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'Please add an email'],
      unique: true,
      trim: true,
      lowercase: true,
      match: [/^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/, 'Please add a valid email'],
    },
    password: {
      type: String,
      required: function () {
        // Password is only required if googleId is not present
        return !this.googleId;
      },
      minlength: [6, 'Password must be at least 6 characters'],
    },
    googleId: {
      type: String,
      unique: true,
      sparse: true, // Allow multiple users to have undefined/null googleId
    },
    isVerified: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Encrypt password before saving
userSchema.pre('save', async function () {
  if (!this.isModified('password')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

// Match user entered password to hashed password in database
userSchema.methods.matchPassword = async function (enteredPassword) {
  if (!this.password) return false;
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model('User', userSchema);
