import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const authorSchema = new mongoose.Schema(
  {
    author_id: {
      type: String,
      required: true,
      unique: true,
      index: true,
      trim: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
      trim: true,
      index: true,
    },
    phone: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    joined_date: {
      type: Date,
      required: true,
    },
    password_hash: {
      type: String,
      required: true,
      select: false, // Never return password_hash in API responses
    },
  },
  {
    timestamps: true,
    toJSON: {
      virtuals: true,
      transform: (doc, ret) => {
        delete ret.password_hash;
        return ret;
      },
    },
  }
);

// Method to verify password
authorSchema.methods.comparePassword = async function (candidatePassword) {
  return bcrypt.compare(candidatePassword, this.password_hash);
};

export const Author = mongoose.model('Author', authorSchema);
