const express = require('express');
const {
  getTasks,
  getStats,
  getTaskById,
  createTask,
  updateTask,
  deleteTask,
} = require('../controllers/taskController');
const { protect } = require('../middleware/auth');
const { taskRules, taskUpdateRules, handleValidation } = require('../utils/validators');

const router = express.Router();

router.use(protect); // every task route requires a valid JWT

router.get('/stats', getStats);
router.get('/', getTasks);
router.get('/:id', getTaskById);
router.post('/', taskRules, handleValidation, createTask);
router.put('/:id', taskUpdateRules, handleValidation, updateTask);
router.delete('/:id', deleteTask);

module.exports = router;
