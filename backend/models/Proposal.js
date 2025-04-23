const mongoose = require("mongoose");

const proposalSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    content: {
      type: String,
      required: true,
    },
    createdAt: {
      type: Date,
      default: Date.now,
    },
    updatedAt: {
      type: Date,
      default: Date.now,
    },
    status: {
      type: String,
      enum: [
        "submitted",
        "processing",
        "categorized",
        "forwarded",
        "answered",
        "completed",
        "rejected",
      ],
      default: "submitted",
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    visibility: {
      type: String,
      enum: ["public", "private"],
      default: "public",
    },
    sourceInfo: {
      type: String,
    },
    user: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
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
        assignmentType: {
          type: String,
          enum: ["manual", "ai"],
          default: "ai",
        },
        confidence: {
          type: Number,
          min: 0,
          max: 1,
          default: 1,
        },
      },
    ],
    ministries: [
      {
        ministry: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Ministry",
        },
        assignmentDate: {
          type: Date,
          default: Date.now,
        },
        status: {
          type: String,
          enum: ["assigned", "processing", "answered", "completed"],
          default: "assigned",
        },
        priority: {
          type: Number,
          default: 0,
        },
        assignedUser: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "User",
        },
      },
    ],
    attachments: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Attachment",
      },
    ],
    tags: [
      {
        tag: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Tag",
        },
        assignmentDate: {
          type: Date,
          default: Date.now,
        },
        assignmentType: {
          type: String,
          enum: ["manual", "ai"],
          default: "ai",
        },
        confidence: {
          type: Number,
          min: 0,
          max: 1,
          default: 1,
        },
      },
    ],
    aiAnalysis: {
      analysisDate: Date,
      quality: {
        type: Number,
        min: 0,
        max: 1,
      },
      relevance: {
        type: Number,
        min: 0,
        max: 1,
      },
      feasibility: {
        type: Number,
        min: 0,
        max: 1,
      },
      sentiment: String,
      keywords: [String],
      similarProposals: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Proposal",
        },
      ],
      processingTime: Number,
      modelVersion: String,
      rawData: mongoose.Schema.Types.Mixed,
    },
    votes: {
      type: Number,
      default: 0,
    },
    priority: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("Proposal", proposalSchema);
