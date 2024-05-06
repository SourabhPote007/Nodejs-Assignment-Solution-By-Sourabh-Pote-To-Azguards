import express from 'express';
import { verifyToken } from '../middleware/Verify.js';
import { CreateTask, UpdateTask, getTask, getTasks, deleteTask, filterTasksByStatus, DownloadCsvFile } from '../Controllers/Task.js';
const router = express.Router();


router.post('/create', verifyToken, CreateTask) 
router.put('/:id', verifyToken, UpdateTask) 
router.get('/:id', verifyToken, getTask)
router.delete('/:id', verifyToken, deleteTask)
router.get('/', verifyToken, getTasks)
router.get('/filter', verifyToken, filterTasksByStatus);
router.get('/download-csv', verifyToken, DownloadCsvFile)

export default router