const mongoose = require('mongoose');

const ColumnSchema = new mongoose.Schema({
    columnName: { type: String, required: true },
    dataType: { type: String, required: true },
}, { _id: false });

const SampleTableSchema = new mongoose.Schema({
    tableName: { type: String, required: true },
    columns: [ColumnSchema],
    rows: [mongoose.Schema.Types.Mixed],
}, { _id: false });

const ExpectedOutputSchema = new mongoose.Schema({
    type: { type: String, default: 'table' },
    value: [mongoose.Schema.Types.Mixed],
}, { _id: false });

const AssignmentSchema = new mongoose.Schema({
    title: { type: String, required: true },
    description: { type: String, required: true }, // used as difficulty: Easy/Medium/Hard
    question: { type: String, required: true },
    sampleTables: [SampleTableSchema],
    expectedOutput: ExpectedOutputSchema,
}, { timestamps: true });

module.exports = mongoose.model('Assignment', AssignmentSchema);
