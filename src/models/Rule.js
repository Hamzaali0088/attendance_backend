const mongoose = require('mongoose');

/**
 * Singleton rules/policy document (keyed).
 * Stores office rules content that Super Admin can edit.
 */
const RuleSchema = new mongoose.Schema(
  {
    key: { type: String, required: true, unique: true, default: 'office_rules' },
    content: { type: String, required: true },
    updatedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', default: null },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Rule', RuleSchema);

