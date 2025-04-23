const mongoose = require("mongoose");

const proposalAnalysisSchema = new mongoose.Schema(
  {
    proposal: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Proposal",
      required: true,
    },
    similarProposals: [
      {
        proposal: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Proposal",
        },
        similarityScore: {
          type: Number,
          min: 0,
          max: 1,
        },
        reason: String,
      },
    ],
    isMerged: {
      type: Boolean,
      default: false,
    },
    mergeSource: {
      type: Boolean,
      default: false,
    },
    mergedInto: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Proposal",
    },
    mergeStrategy: String,
    mergeRationale: String,
    aiEvaluation: {
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
      sustainability: {
        type: Number,
        min: 0,
        max: 1,
      },
      innovation: {
        type: Number,
        min: 0,
        max: 1,
      },
      strengths: [String],
      weaknesses: [String],
      politicalDomains: [String],
      societalBenefit: String,
      costBenefitRatio: {
        type: String,
        enum: ["niedrig", "mittel", "hoch"],
        default: "mittel",
      },
      summary: String,
    },
    suggestedCategories: [
      {
        category: {
          type: mongoose.Schema.Types.ObjectId,
          ref: "Category",
        },
        confidence: {
          type: Number,
          min: 0,
          max: 1,
        },
        reason: String,
      },
    ],
    isProcessed: {
      type: Boolean,
      default: false,
    },
    lastProcessedAt: Date,
    processingErrors: [String],
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("ProposalAnalysis", proposalAnalysisSchema);
