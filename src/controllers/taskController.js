const { default: mongoose } = require('mongoose');
const Task = require('../models/Task');
const User = require('../models/User');
const ErrorResponse = require('../utils/errorResponse');

const createTask = async (req, res, next) => {
  const { title, description, dueDate, priority, assignedTo } = req.body;

  try {
    const task = await Task.create({
      title,
      description,
      dueDate,
      priority,
      assignedTo,
      createdBy: req.user.id,
    });
    res.status(201).json({ success: true, data: task });
  } catch (err) {
    next(new ErrorResponse(err.message, 500));
  }
};



const getTasks = async (req, res, next) => {
  // Start with base query based on RBAC (same as before)
  let query = Task.find();

  if (req.user.role === 'admin') {
    // Admin: all tasks
  } else if (req.user.role === 'manager') {
    const user = await User.findById(req.user.id);
    if (user && user.team) {
      const teamUsers = await User.find({ team: user.team }).select('_id');
      const teamUserIds = teamUsers.map(u => u._id);
      query = query.or([
        { createdBy: req.user.id },
        { assignedTo: req.user.id },
        { assignedTo: { $in: teamUserIds } }
      ]);
    } else {
      query = query.or([{ createdBy: req.user.id }, { assignedTo: req.user.id }]);
    }
  } else {
    query = query.or([{ createdBy: req.user.id }, { assignedTo: req.user.id }]);
  }

  // 🔍 Advanced Filtering & Search
  const { search, status, priority, dueDateFrom, dueDateTo } = req.query;

  // Text search (title or description)
  if (search) {
    const regex = new RegExp(search, 'i');
    query = query.or([{ title: regex }, { description: regex }]);
  }

  // Status filter
  if (status) {
    query = query.where('status').equals(status);
  }

  // Priority filter
  if (priority) {
    query = query.where('priority').equals(priority);
  }

  // Due date range
  if (dueDateFrom || dueDateTo) {
    query = query.where('dueDate');
    if (dueDateFrom) query = query.gte(new Date(dueDateFrom));
    if (dueDateTo) query = query.lte(new Date(dueDateTo));
  }

  // Populate
  query = query.populate('assignedTo', 'username email').populate('createdBy', 'username');

  try {
    const tasks = await query;
    res.status(200).json({
      success: true,
      count: tasks.length,
      data: tasks
    });
  } catch (err) {
    next(new ErrorResponse(err.message, 500));
  }
};

const getTask = async (req, res, next) => {
  const task = await Task.findById(req.params.id)
    .populate('assignedTo', 'username email')
    .populate('createdBy', 'username');

  if (!task) return next(new ErrorResponse('Task not found', 404));

  // RBAC: only owners or admins/managers (with team logic) can view
  if (
    req.user.role === 'user' &&
    String(task.createdBy._id) !== req.user.id &&
    String(task.assignedTo?._id) !== req.user.id
  ) {
    return next(new ErrorResponse('Not authorized', 403));
  }

  res.status(200).json({ success: true, data: task });
};

const updateTask = async (req, res, next) => {
  let task = await Task.findById(req.params.id);
  if (!task) return next(new ErrorResponse('Task not found', 404));

  // RBAC: only creator or admin can update
  if (req.user.role === 'user' && String(task.createdBy) !== req.user.id) {
    return next(new ErrorResponse('Not authorized', 403));
  }

  // ✅ Validate assignedTo is a valid ObjectId (if provided)
  if (req.body.assignedTo) {
    if (!mongoose.Types.ObjectId.isValid(req.body.assignedTo)) {
      return next(new ErrorResponse('Invalid assignedTo ID', 400));
    }
  }

  task = await Task.findByIdAndUpdate(req.params.id, req.body, {
    new: true,
    runValidators: true,
  });

  res.status(200).json({ success: true, data: task });
};

const deleteTask = async (req, res, next) => {
  const task = await Task.findById(req.params.id);
  if (!task) return next(new ErrorResponse('Task not found', 404));

  // RBAC: only creator or admin can delete
  if (req.user.role === 'user' && String(task.createdBy) !== req.user.id) {
    return next(new ErrorResponse('Not authorized', 403));
  }

  // ✅ Use deleteOne() instead of remove()
  await task.deleteOne();

  res.status(200).json({ success: true, data: {} });
};

module.exports = { createTask, getTasks, getTask, updateTask, deleteTask };