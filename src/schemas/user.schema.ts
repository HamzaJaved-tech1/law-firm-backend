import mongoose from 'mongoose';
import * as bcrypt from 'bcrypt';
import { User } from 'src/interfaces/user.interface';

export const UserSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: false,
  },
  email: {
    type: String,
    required: true,
    unique: true, // Ensure email is unique
  },
  password: {
    type: String,
    required: true,
  },

  dob: {
    type: String,
    required: false,
  },
  isVerified: {
    type: Boolean,
    default: false
  },
 

});

UserSchema.methods.validatePassword = async function (this: User, password: string): Promise<boolean> {
  return await bcrypt.compare(password, this.password);
};