const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const UserSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, minlength: 8, select: false },
    handle: { type: String, required: true, unique: true, lowercase: true, trim: true },
    bio: { type: String, default: '', maxlength: 160 },
    plan: { type: String, enum: ['free', 'starter'], default: 'free' },
    theme: { type: String, default: 'purple' },
    redirectEnabled: { type: Boolean, default: false },
    redirectUrl: { type: String, default: '' },
  },
  { timestamps: true }
);

UserSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
});

UserSchema.methods.matchPassword = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

const User = mongoose.model('User', UserSchema);
module.exports = User;
