import mongoose from "mongoose";
import User from "../models/User.js";
import jwt from "jsonwebtoken";
import { config } from "dotenv";
config();
const signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};

export const signUp = async (req, res) => {
  console.log("request body: ", req.body);
  try {
    // validate required fields
    const {
      name,
      email,
      password,
      passwordConfirm,
      role,
      institution,
      avatar,
      isActive,
    } = req.body;

    if (!name || !email || !password || !passwordConfirm) {
      return res.status(400).json({
        status: "fail",
        message: "Name, email, password, and passwordConfirm are required",
      });
    }

    if (password.length < 8) {
      return res.status(400).json({
        status: "fail",
        message: "Password must be at least 8 characters long",
      });
    }

    if (password !== passwordConfirm) {
      return res.status(400).json({
        status: "fail",
        message: "Password do not match",
      });
    }

    // restrict sensitive fields
    const allowedRoles = ["user", "instructor"];
    const userRole = allowedRoles.includes(role) ? role : "user";
    const userIsActive = isActive !== undefined ? isActive : true;

    if (institution && !mongoose.Types.ObjectId.isValid(institution)) {
      return res.status(400).json({
        status: "fail",
        message: "Invalid institution ID",
      });
    }
    const userInstitution = institution || undefined;

    // check if email already exists
    const existingUser = await User.findOne({ email });
    if (existingUser) {
      return res.status(400).json({
        status: "fail",
        message: "Email already in use",
      });
    }

    // create new user
    const newUser = await User.create({
      name,
      email,
      password,
      role: userRole,
      institution: userInstitution,
      avatar,
      isActive: userIsActive,
      lastLogin: null,
      passwordChangedAt: new Date(),
    });

    const token = signToken(newUser._id);
    newUser.password = undefined;
    console.log({ data: newUser }, "successfull");
    res.status(201).json({
      status: "success",
      token,
      data: { user: newUser },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message || "An error occurred during signup",
    });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    // check if email and password exist
    if (!email || !password) {
      return res
        .status(400)
        .json({ status: "fail", message: "Please provide email and password" });
    }

    // check if user exists and password is correct
    const user = await User.findOne({ email }).select("+password");

    if (!user || !(await user.correctPassword(password, user.password))) {
      return res
        .status(401)
        .json({ status: "fail", message: "Incorrect email or password" });
    }

    // update last login
    user.lastLogin = new Date();
    await user.save({ validateBeforeSave: false });

    // Generate JWT
    const token = signToken(user._id);

    // Remove sensitive fields
    user.password = undefined;

    // send response
    res.status(200).json({
      status: "success",
      token,
      data: { user },
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: error.message || "An error occurred during login",
    });
  }
};

export const protect = async (req, res, next) => {
  try {
    // getting token and check of it's there
    console.log("request user: ", req.user)
    let token;
    if (
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      token = req.headers.authorization.split(" ")[1];
    }

    if (!token) {
      return res.status(401).json({
        status: "fail",
        message: "You are not logged in. Please login to access.",
      });
    }

    // verification token
    if (!process.env.JWT_SECRET) {
      throw new Error("JWT_SECRET is not defined in environment variables");
    }
    const decoded = await jwt.verify(token, process.env.JWT_SECRET);

    // check of user still exists
    const currentUser = await User.findById(decoded.id);
    if (!currentUser) {
      return res.status(401).json({
        status: "fail",
        message: "The user belonging to this token does no longer exist",
      });
    }

    // check if user changed password after the token was issued
    if (currentUser.changedPasswordAfter(decoded.iat)) {
      return res.status(401).json({
        status: "fail",
        message: "User recently changed password! Please login!",
      });
    }

    req.user = currentUser;
    next();
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
};

export const authorize = (...roles) => {
  return (req, res, next) => {
    // Check if user exists and has a role
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        status: "fail",
        message: "Not authorized to access this route",
      });
    }

    // Check if user's role is included in the allowed roles
    if (!roles.includes(req.user.role)) {
      return res.status(403).json({
        status: "fail",
        message: `User role ${req.user.role
          } is not authorized to access this route. Required roles: ${roles.join(
            ", "
          )}`,
      });
    }

    // User is authorized, proceed to next middleware
    next();
  };
};
