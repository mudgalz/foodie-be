import mongoose from "mongoose";

const userSchema = new mongoose.Schema({
  auth0Id: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
  },
  name: String,
  address: String,
  city: String,
  zipcode: String,
});

const User = mongoose.model("User", userSchema);
export default User;
