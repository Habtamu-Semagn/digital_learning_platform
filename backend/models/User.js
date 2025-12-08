import mongoose from "mongoose";
import validator from "validator";
import bcrypt from "bcryptjs";
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
      enum: ["user", "student", "instructor", "admin", "superadmin", "writer"],
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

    // Instructor-specific profile
    instructorProfile: {
      bio: {
        type: String,
        maxlength: 500,
        trim: true,
      },
      title: {
        type: String,
        maxlength: 100,
        trim: true,
      },
      socialLinks: {
        linkedin: {
          type: String,
          validate: {
            validator: function (v) {
              return !v || /^https?:\/\/(www\.)?linkedin\.com\/.+/.test(v);
            },
            message: 'Invalid LinkedIn URL'
          }
        },
        twitter: {
          type: String,
          validate: {
            validator: function (v) {
              return !v || /^https?:\/\/(www\.)?twitter\.com\/.+/.test(v);
            },
            message: 'Invalid Twitter URL'
          }
        },
        website: {
          type: String,
          validate: {
            validator: function (v) {
              return !v || /^https?:\/\/.+\..+/.test(v);
            },
            message: 'Invalid website URL'
          }
        },
      },
    },

    // User preferences
    preferences: {
      notifications: {
        emailEnabled: { type: Boolean, default: true },
        newEnrollments: { type: Boolean, default: true },
        newSubmissions: { type: Boolean, default: true },
        newQuestions: { type: Boolean, default: true },
        studentMessages: { type: Boolean, default: true },
        digestFrequency: {
          type: String,
          enum: ['immediate', 'daily', 'weekly'],
          default: 'immediate',
        },
      },
      privacy: {
        profileVisibility: {
          type: String,
          enum: ['public', 'students', 'private'],
          default: 'students',
        },
        showEmail: { type: Boolean, default: false },
        allowMessages: { type: Boolean, default: true },
      },
      courseDefaults: {
        defaultPoints: {
          type: Number,
          min: 0,
          max: 1000,
          default: 100,
        },
        defaultDueDateOffset: {
          type: Number,
          min: 1,
          max: 365,
          default: 7,
        },
        autoPublishAnnouncements: { type: Boolean, default: false },
      },
    },

    // Student course enrollments
    enrolledCourses: [{
      course: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Course',
        required: true
      },
      enrolledAt: {
        type: Date,
        default: Date.now
      },
      status: {
        type: String,
        enum: ['active', 'completed', 'dropped'],
        default: 'active'
      },
      lastAccessedAt: Date,
      progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100
      }
    }]
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
const User = mongoose.model("User", userSchema);
export default User;
