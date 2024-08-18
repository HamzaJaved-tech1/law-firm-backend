import * as mongoose from 'mongoose';

export interface RefreshToken extends mongoose.Document {
  token: string;
  user: mongoose.Schema.Types.ObjectId;
  expires: Date;
}
