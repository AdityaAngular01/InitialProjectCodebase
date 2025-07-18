const {mongoose} = require("../package");
const {
  safeSoftDeletePlugin,
  paginatePlugin,
  privateFieldsPlugin
} = require("./plugins");

const auditTrailSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  entityType: { type: String, required: true }, // e.g. 'Task', 'Project', 'User'
  entityId: { type: mongoose.Schema.Types.ObjectId, required: true },
  action: { type: String, required: true }, // e.g. 'created', 'updated', 'deleted'
  changes: { type: mongoose.Schema.Types.Mixed }, // JSON of changes (old/new values)
  timestamp: { type: Date, default: Date.now },
}, { timestamps: false });

auditTrailSchema.plugin(safeSoftDeletePlugin);
auditTrailSchema.plugin(paginatePlugin);
auditTrailSchema.plugin(privateFieldsPlugin);
module.exports = mongoose.model('AuditTrail', auditTrailSchema);
