// ---------- Dependencies ----------
const mysql = require("mysql");
const inquirer = require("inquirer");
const table = require("console.table");

// ---------- Create MYSQL Connection ----------
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "TuckEverlasting8", // Enter your specific password
    database: "employee_db"
});

// ---------- Initiate Database Connection ----------
connection.connect(err => {
    if (err) throw err;
    console.log("Connected as id " + connection.threadId);
});

// ---------- Functions for Application ----------

function displayTitle() {
    console.log(`
------------------------------
------ Employee Tracker ------
------------------------------
    `);
}

function start() {
    inquirer.prompt([{
        type: "list",
        name: "action",
        message: "What would you like to do?",
        choices: [
            {
                name: "View all Employees",
                value: "viewEmployees"
            },
            {
                name: "View all Employees by Department",
                value: "viewDepartments"
            },
            {
                name: "View all Employees by Role",
                value: "viewRoles"
            },
            {
                name: "Add New Employee",
                value: "addEmployee"
            },
            {
                name: "Add New Department",
                value: "addDepartment"
            },
            {
                name: "Add New Role",
                value: "addRole"
            },
            {
                name: "Update Employee Role",
                value: "updateEmployee"
            },
            {
                name: "Quit",
                value: "quit"
            }
        ]
    }]).then(actionPrompt => {
        if (actionPrompt.action === 'viewEmployees') {
            viewAllEmployees();
        } else if (actionPrompt.action === 'viewDepartments') {
            viewByDepartment();
        } else if (actionPrompt.action === 'viewRoles') {
            viewByRole();
        } else if (actionPrompt.action === 'addEmployee') {
            addEmployee();
        }
        else {
            return;
        }
    });
}

function viewAllEmployees() {
    connection.query(`
    SELECT e.id, e.first_name, e.last_name, role.title, department.name as 'department', role.salary, 
    CONCAT(m.first_name, ' ', m.last_name) as 'manager'
    FROM employee e
    INNER JOIN role ON e.role_id = role.id
    INNER JOIN department
    LEFT JOIN employee m ON m.id = e.manager_id
    GROUP BY (e.id)`,
        (err, data) => {
            console.log('\n');
            console.table(data);
            console.log('\n');
            start();
        });
}

function viewByDepartment() {
    connection.query(`
    SELECT department.id, department.name as 'department', CONCAT(employee.first_name, ' ', employee.last_name) as 'employee',role.title
    FROM department
    INNER JOIN role ON role.department_id = department.id
    INNER JOIN employee ON employee.role_id = role.id`,
        (err, data) => {
            console.log('\n');
            console.table(data);
            console.log('\n');
            start();
        });

}

function viewByRole() {
    connection.query(`
    SELECT role.id, role.title, role.salary, department.name as 'department', 
    CONCAT(employee.first_name, ' ', employee.last_name) as 'employee'
    FROM role
    INNER JOIN department ON role.department_id = department.id
    INNER JOIN employee on employee.role_id = role.id`,
        (err, data) => {
            console.log('\n');
            console.table(data);
            console.log('\n');
            start();
        });
}

function addEmployee() {
    var roles = [];
    connection.query("SELECT title from role", (err, data) => {
        if (err) throw err;
        for (var i = 0; i < data.length; i++) {
            roles.push({
                name: data[i].title,
                value: data[i].title
            });
        }
    });
    var employees = [];
    connection.query("SELECT CONCAT(first_name, ' ', last_name) as employee from employee", (err, data) => {
        if (err) throw err;
        for (var i = 0; i < data.length; i++) {
            employees.push({
                name: data[i].employee,
                value: data[i].employee
            });
        }
        employees.push({
            name: "None",
            value: "none"
        });
    });
    inquirer.prompt([
        {
            message: "What is the employee's first name? ",
            name: "firstName"
        },
        {
            message: "What is the employee's last name? ",
            name: "lastName"
        },
        {
            message: "Choose an employee role: ",
            name: "role",
            type: "list",
            choices: roles
        },
        {
            message: "Choose a manager: ",
            name: "manager",
            type: "list",
            choices: employees
        }

    ]).then(answers => {
        var first = answers.firstName;
        var last = answers.lastName;
        
    });
}

// ---------- Call Functions ----------
displayTitle();
start();