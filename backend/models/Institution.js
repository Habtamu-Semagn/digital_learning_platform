const mongoose = require("mongoose");

const institutionSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Institution name is required"],
      trim: true,
      maxlength: [200, "Name cannot exceed 200 characters"],
    },

    emailDomain: {
      type: String,
      required: [true, "Email domain is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },

    type: {
      type: String,
      enum: ["school", "college", "university", "training_center", "ngo"],
      default: "school",
    },

    isActive: {
      type: Boolean,
      default: true,
    },

    contactEmail: {
      type: String,
      trim: true,
    },

    website: {
      type: String,
      trim: true,
    },

    logo: {
      type: String,
      default: "",
    },
  },
  {
    timestamps: true,
  }
);

const Institution = mongoose.model(institutionSchema);
export default Institution;
