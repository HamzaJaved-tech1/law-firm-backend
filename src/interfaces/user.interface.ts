import { Document } from 'mongoose';

export interface User extends Document {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    dob: string;
    isVerified?: boolean;
    validatePassword(password: string): Promise<boolean>;
}