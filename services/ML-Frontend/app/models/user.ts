import mongoose from 'mongoose';

const userSchema = new mongoose.Schema({
  email: { type: String, trim: true, unique: true, required: true },
  password: { type: String }, // bcrypt hashed password for credentials login
  name: { type: String, trim: true },
  role: { type: String, default: 'user' },
  profile: {
    firstName: { type: String, trim: true },
    lastName: { type: String, trim: true },
    image: { type: String, trim: true },
  },
}, { timestamps: true });

const User = mongoose.models.User || mongoose.model('User', userSchema);

export default User;