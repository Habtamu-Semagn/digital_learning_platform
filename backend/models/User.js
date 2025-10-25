const mongoose = require("mongoose");
const validator = require("validator");
const bcrypt = require("bcryptjs");
const { Schema } = mongoose;
const userSchema = new Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },
    email: {
      type: String,
      validate: [validator.isEmail, "Please enter a valid email"],
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
    },
    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: 8,
      select: false,
      validate: {
        validator: function (value) {
          return /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@.#$!%*?&])[A-Za-z\d@.#$!%*?&]{8,15}$/.test(
            value
          );
        },
        message:
          "Password must be at least 8 characters long and include at least one uppercase letter, one lowercase letter, one number, and one special character!",
      },
    },
    passwordConfirm: {
      type: String,
      require: [true, "Please confirm your password"],
      validate: {
        // This only works on create and save!!!
        validator: function (el) {
          return el === this.password;
        },
        message: "Passwords are not same!",
      },
    },
    role: {
      type: String,
      enum: ["student", "instructor", "admin", "superadmin", "writer"],
      default: "student",
      required: true,
    },
    institution: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Institution",
      trim: true,
    },
    avatar: {
      type: String,
      trim: true,
      default: "/images/default-avatar.png",
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    lastLogin: {
      type: Date,
    },
    passwordChangedAt: { type: Date },
  },
  { timestamps: true },
  { toJSON: { virtuals: true } }
);

// MIDDLEWARE
userSchema.pre("save", async function (next) {
  if (!this.isModified("password")) return next();

  this.password = await bcrypt.hash(this.password, 12);

  // Delete password confirm field
  this.passwordConfirm = undefined;
  next();
});

userSchema.methods.updateLastLogin = async function () {
  this.lastLogin = new Date();
  await this.save({ validateBeforeSave: false });
};

// INSTANCE METHODS
userSchema.methods.correctPassword = async function (
  candidatePassword,
  userPassword
) {
  return await bcrypt.compare(candidatePassword, userPassword);
};

userSchema.methods.changedPasswordAfter = function (JWTTimestamp) {
  if (this.passwordChangedAt) {
    const changedTimestamp = parseInt(
      this.passwordChangedAt.getTime() / 1000,
      10
    );
    return JWTTimestamp < changedTimestamp;
  }
  return false; // Password not changed
};

userSchema.methods.canEditContent = function (content) {
  return (
    this.role === "admin" ||
    this.role === "superadmin" ||
    (this.role === "instructor" &&
      content.uploadedBy.toString() === this._id.toString())
  );
};

userSchema.methods.canAccessAdmin = function () {
  return ["admin", "superadmin", "instructor"].includes(this.role);
};

// STATIC METHODS
userSchema.statics.getUsersByInstitution = function (institutionId) {
  return this.find({ institutionId })
    .select("name email role avatar lastLogin")
    .sort({ name: 1 });
};

userSchema.statics.getInstructors = function () {
  return this.find({ role: "instructor" })
    .select("name email institution")
    .sort({ name: 1 });
};

// VIRTUAL FIELDS
userSchema.virtual("initials").get(function () {
  return this.name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .toUpperCase();
});

userSchema.virtual("isStaff").get(function () {
  return ["instructor", "admin", "superadmin"].includes(this.role);
});
module.exports = mongoose.model("User", userSchema);
