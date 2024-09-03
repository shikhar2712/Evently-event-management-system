import { model, models, Schema } from "mongoose";

const UserSchema = new Schema({
    clerkId: { type: String, required: true, unique: true },
    email: { type: String, required: true, unique: true },
    username: { type: String, required: true, unique: true },
    firstname: { type: String, required: true, default: null }, // Default to null if not provided
    lastname: { type: String, required: true, default: null },  // Default to null if not provided
    photo: { type: String, required: true },
});


const User = models.User || model('User', UserSchema);
export default User;
