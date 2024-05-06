import Task from "../models/Task.js"
import dayjs from "dayjs"
import { json } from "express"
import { Parser } from "json2csv"
import tasks from "../data/tasks.js"
import fs, { stat } from "fs";
import csv from 'csv-parser';

export const CreateTask = async (req, res, next) => {
    try {
        const { id } = req.user
        const completetionDate = new Date(req.body.date)
        const task = new Task({ ...req.body, userId: id, date: completetionDate })
        const saveTask = await task.save()

        return res.status(201).json({ task: saveTask })
    } catch (err) {
        next(err)
    }
}

export const UpdateTask = async (req, res, next) => {
    try {
        const { id } = req.params;
        const task = await Task.findByIdAndUpdate(id, { ...req.body }, { new: true })
        return res.status(201).json({ task })
    } catch (err) {
        next(err)
    }
}

export const getTask = async (req, res, next) => {
    try {
        const { id } = req.params
        const task = await Task.findById(id)
        return res.status(201).json({ task })
    } catch (err) {
        next(err)
    }
}

export const deleteTask = async (req, res, next) => {
    try {
        const { id } = req.params
        const task = await Task.findById(id).deleteOne()
        return res.status(201).json({ task })
    } catch (err) {
        next(err)
    }
}

export const getTasks = async (req, res, next) => {
    try {
        const type = req.query?.type
        const day = req.query?.day //Today,last 7 days and 30 days of task get
        const { id } = req.user
        var min, max
        if (day === 'today') {
            min = dayjs().format('YYYY-MM-DD')
            max = dayjs().format('YYYY-MM-DD')
        }
        else if (day === 'seven') {
            min = dayjs().subtract(7, 'day').format('YYYY-MM-DD')
            max = dayjs().format('YYYY-MM-DD')
        }
        else if (day === 'thirty') {
            min = dayjs().subtract(30, 'day').format('YYYY-MM-DD')
            max = dayjs().format('YYYY-MM-DD')
        }
        if (type) {
            var tasks = await Task.find({ userId: id, type, ...(day && { date: { $lte: new Date(max), $gte: new Date(min) } }) })
        } else {
            var tasks = await Task.find({ userId: id, ...(day && { date: { $lte: new Date(max), $gte: new Date(min) } }) })
        }

        return res.status(201).json({ tasks })
    } catch (err) {
        next(err)
    }
}
export const filterTasksByStatus = async (req, res, next) => {
    try {
        const status = req.query?.status;
        const { id } = req.user;
        let tasks;

        if (!status) {
            // If status is not provided, return a 400 Bad Request response
            return res.status(400).json({ message: "Status parameter is required" });
        }

        if (status === 'completed' || status === 'pending') {
            // If status is 'completed' or 'pending', filter tasks by the specified status
            tasks = await Task.find({ userId: id, status });
        } else {
            // If status is not 'completed' or 'pending', return a 400 Bad Request response
            return res.status(400).json({ message: "Invalid status value" });
        }

        return res.status(200).json({ tasks });
    } catch (err) {
        console.error('Error in filterTasksByStatus:', err);
        next(err);
    }
};

export const DownloadCsvFile = async (req, res, next) => {
    try {
        const data = await Task.find({});
        const csvData = [];
        // Convert data array to CSV format
        data.forEach((row) => {
            csvData.push(`${row.userId},${row.type},${row.name}`);
        });
        console.log(csvData ,'data..')
        const filePath = path.join(__dirname, 'public', 'data.csv');
        console.log(filePath ,"Calling data ..")
        
        fs.writeFileSync(filePath, csvData.join('\n'));
        
        // Set headers for file download
        res.setHeader('Content-Disposition', 'attachment; filename="data.csv"');
        res.setHeader('Content-Type', 'text/csv');

        // Stream the file to the client
        const fileStream = fs.createReadStream(filePath);
        fileStream.pipe(res);

    } catch (error) {
        next(error); // Use 'error' instead of 'err' here
    }
}

// export const DownloadCsvFile = async (req, res, next) => {
//     try {
//         // Await the result of getTasks
//         // const tasks = await getTasks();
//         let tasks = []
//         const taskData = await Task.find({});
//         userData.forEach((task) => {
//             const { userId, type, status, name, date, time} = task;
//             tasks.push({userId, type, status, name, date, time});
//         });
//         const csvFields = ['userId', 'type', 'status', 'name', 'date', 'time'];
//         const csvParser = new CsvParser({csvFields});
//         console.log(csvParser + "Hey");
//         const csv = csvParser.parse(tasks);

//         console.log(csv);

//         // const json2csvParser = new Parser();
//         // const csv = json2csvParser.parse(tasks);
//         res.setHeader("Content-Type","text/csv");
//         res.setHeader("Content-Disposition","attatchment: filename=tasksData.csv");
//         // res.attachment("Information.csv");
//         res.status(200).end(csv);
//     } catch (error) {
//         next(error); // Use 'error' instead of 'err' here
//     }
// }