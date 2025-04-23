const mongoose = require("mongoose");

const ministrySchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
      unique: true,
    },
    description: {
      type: String,
      trim: true,
    },
    contactInfo: {
      email: String,
      phone: String,
      address: String,
      website: String,
    },
    responsibilities: [String],
    logo: {
      type: String,
    },
    websiteUrl: {
      type: String,
    },
    isActive: {
      type: Boolean,
      default: true,
    },
    categories: [
      {
        category: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Category",
        },
        assignmentDate: {
          type: Date,
          default: Date.now,
        },
        priority: {
          type: Number,
          default: 0,
        },
      },
    ],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Ministry", ministrySchema);
