const mongoose = require('mongoose');

const TaskSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
        trim: true
    },
    description: {
        type: String,
        trim: true
    },
    dueDate: {
        type: Date
    },
    priority: {
        type: String,
        enum: ['low', 'medium', 'high'],
        default: 'medium'
    },
    status: {
        type: String,
        enum: ['todo', 'in-progress', 'done'],
        default: 'todo'
    },
    assignedTo: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        default: null
    },
    createdBy: {
        type: mongoose.Schema.ObjectId,
        ref: 'User',
        required: true
    }
}, { timestamps: true });

// 👇 Add indexes HERE — after schema, before export
TaskSchema.index({ status: 1, dueDate: 1, assignedTo: 1 });
TaskSchema.index({ createdBy: 1, status: 1 });

module.exports = mongoose.model('Task', TaskSchema);

// Why This Placement?
// Mongoose allows you to call .index() on the schema before it’s compiled into a model.
// Once you do mongoose.model(...), the schema is finalized — so indexes must be added before that line.




// What These Indexes Do:
// { status: 1, dueDate: 1, assignedTo: 1 }
// → Speeds up queries like:
// GET /tasks?status=todo&dueDateFrom=...&assignedTo=...
// { createdBy: 1, status: 1 }
// → Speeds up analytics & user-scoped task lists:
// Find all tasks by user X with status = done
//  MongoDB will automatically use these indexes when your queries match the fields