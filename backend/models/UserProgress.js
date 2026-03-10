const mongoose = require('mongoose');

const AttemptSchema = new mongoose.Schema({
    sql: { type: String, required: true },
    isCorrect: { type: Boolean, default: false },
    createdAt: { type: Date, default: Date.now },
}, { _id: false });

const UserProgressSchema = new mongoose.Schema({
    userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
    assignmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Assignment', required: true },
    attempts: [AttemptSchema],
    isCompleted: { type: Boolean, default: false },
    completedAt: { type: Date },
    attemptCount: { type: Number, default: 0 },
}, { timestamps: true });

// Compound unique index: one progress doc per user+assignment
UserProgressSchema.index({ userId: 1, assignmentId: 1 }, { unique: true });

module.exports = mongoose.model('UserProgress', UserProgressSchema);
