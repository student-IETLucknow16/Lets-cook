const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const otpSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  hashedOtp: {
    type: String,
    required: true,
  },
  type: {
    type: String,
    enum: ['email_verification', 'password_reset'],
    required: true,
  },
  attempts: {
    type: Number,
    default: 0,
  },
  expiresAt: {
    type: Date,
    required: true,
  },
}, {
  timestamps: true,
});

// Hash the OTP before saving
otpSchema.pre('save', async function () {
  if (!this.isModified('hashedOtp')) {
    return;
  }
  const salt = await bcrypt.genSalt(10);
  this.hashedOtp = await bcrypt.hash(this.hashedOtp, salt);
});

// Compare entered OTP with hashed OTP
otpSchema.methods.matchOtp = async function (enteredOtp) {
  return await bcrypt.compare(enteredOtp, this.hashedOtp);
};

// Create a TTL index in MongoDB to automatically delete expired OTP records
otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OTP', otpSchema);
