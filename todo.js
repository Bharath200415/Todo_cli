#!/usr/bin/env node
import inquirer from "inquirer";
import chalk from "chalk";
import fs from "fs";
import { Command } from "commander";
import Table from "cli-table3";


const program = new Command();
const File = "./tasks.json";

function loadTasks() {
  try {
    if (!fs.existsSync(File)) return [];
    const data = fs.readFileSync(File, "utf8");
    return JSON.parse(data || "[]");
  } catch (err) {
    console.error("Error loading tasks:", err);
    return [];
  }
}

function saveTasks(tasks) {
  try {
    fs.writeFileSync(File, JSON.stringify(tasks, null, 2));
  } catch (err) {
    console.error("Error saving tasks:", err);
  }
}

// Commands:

//Add task
program
    .command("add <task>")
    .description("Add a new task")
    .action((task)=>{
        const tasks = loadTasks();
        tasks.push({
            title:task,
            done:false,
            createdAt:new Date().toISOString()
        });

        saveTasks(tasks); 
        console.log("Task added, complete it soon!");
    })


//list tasks:
program
  .command("list")
  .description("show all tasks")
  .action(() => {
    const tasks = loadTasks();

    if (tasks.length === 0) {
      console.log("No tasks yet..");
      return;
    }

    const table = new Table({
      head: ["#", "Task", "Timestamp", "Status"],
      colWidths: [6, 30, 28, 12],
      style: { head: ["cyan"] }
    });

    tasks.forEach((task, i) => {
      const status = task.done
        ? chalk.green("✓")
        : chalk.red("✗");

      const title = task.done
        ? chalk.strikethrough(task.title)
        : task.title;

      const timestamp = new Date(task.createdAt)
        .toLocaleString();

      table.push([
        i + 1,
        title,
        timestamp,
        status
      ]);
    });

    console.log("\n" + table.toString());
  });

//Done
program
    .command("done")
    .description(
        "Mark tasks as done"
    )
    .action(async()=>{
        const tasks= loadTasks();

        if (tasks.length===0){
            console.log("No tasks found!");
            return;
        }

        const choices = tasks.map((task,i)=>({
            name:`${task.done? "✓" : "✗"} ${task.title}`,
            value:i,
            checked:task.done,
        }));

        const ans = await inquirer.prompt([
            {
                type:"checkbox",
                name:"completed",
                message:"Select tasks to mark as done (Space = select, Enter = confirm)",
                choices,
            }
        ]);

        tasks.forEach((task, i) => {
            task.done = ans.completed.includes(i);
        });


        saveTasks(tasks);
        console.log("Tasks updated :)");
    });

//delete
program 
    .command("delete")
    .description("Delete tasks")
    .action(async()=>{
        const tasks = loadTasks();
        if (tasks.length===0){
            console.log("No tasks found");
            return;
        }

        const choices= tasks.map((task,i)=>({
            name:task.title,
            value:i,
        }));

        const answers = await inquirer.prompt([
            {
                type:"checkbox",
                name:"toDelete",
                message:"Select tasks to delete! (Space=select, Enter=confirm)",
                choices,
            },
        ]);

        const filtered = tasks.filter(
            (_,i)=>!answers.toDelete.includes(i)
        );

        saveTasks(filtered);
        console.log("Task deleted!");
    });

program.version("1.0.0");
program.parse(process.argv);


