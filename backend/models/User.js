const mongoose = require("mongoose");

const userSchema = new mongoose.Schema(
  {
    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,
    },
    passwordHash: {
      type: String,
      required: true,
    },
    firstName: {
      type: String,
      required: true,
      trim: true,
    },
    lastName: {
      type: String,
      required: true,
      trim: true,
    },
    registrationDate: {
      type: Date,
      default: Date.now,
    },
    lastLogin: {
      type: Date,
    },
    userType: {
      type: String,
      enum: ["citizen", "ministry", "admin"],
      default: "citizen",
    },
    status: {
      type: String,
      enum: ["active", "inactive", "blocked"],
      default: "active",
    },
    profileImage: {
      type: String,
    },
    contactInfo: {
      phone: String,
      address: String,
    },
    privacySettings: {
      type: Map,
      of: Boolean,
      default: {
        showEmail: false,
        showName: true,
        showActivity: true,
      },
    },
    notificationSettings: {
      type: Map,
      of: Boolean,
      default: {
        email: true,
        inApp: true,
        proposalUpdates: true,
        comments: true,
        systemNotifications: true,
      },
    },
    roles: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Role",
      },
    ],
    ministries: [
      {
        ministry: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ministry",
        },
        position: String,
        department: String,
        startDate: Date,
        endDate: Date,
        isActive: {
          type: Boolean,
          default: true,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("User", userSchema);
