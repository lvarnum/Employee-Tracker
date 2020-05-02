// ---------- Dependencies ----------
const mysql = require("mysql");
const inquirer = require("inquirer");
const table = require("console.table");

// ---------- Create MYSQL Connection ----------
const connection = mysql.createConnection({
    host: "localhost",
    port: 3306,
    user: "root",
    password: "", // Enter your specific password
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

// ----- Menu of Actions -----
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
                name: "Remove Employee",
                value: "removeEmployee"
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
        } else if (actionPrompt.action === 'addDepartment') {
            addDepartment();
        } else if (actionPrompt.action === 'addRole') {
            addRole();
        } else if (actionPrompt.action === 'updateEmployee') {
            updateEmployee();
        } else if (actionPrompt.action === 'removeEmployee') {
            removeEmployee();
        }
        else {
            displayEnd();
            return;
        }
    });
}

// ----- View All Employees and their Info -----
function viewAllEmployees() {
    connection.query(`
    SELECT e.id, e.first_name, e.last_name, role.title, department.name as 'department', role.salary, 
    CONCAT(m.first_name, ' ', m.last_name) as 'manager'
    FROM employee e
    INNER JOIN role ON e.role_id = role.id
    INNER JOIN department ON role.department_id = department.id
    LEFT JOIN employee m ON m.id = e.manager_id
    GROUP BY (e.id)`,
        (err, data) => {
            console.log('\n');
            console.table(data);
            console.log('\n');
            start();
        });
}

// ----- View all Departments and their Employees -----
function viewByDepartment() {
    connection.query(`
    SELECT department.id, department.name as 'department', CONCAT(employee.first_name, ' ', employee.last_name) as 'employee',role.title
    FROM department
    LEFT JOIN role ON role.department_id = department.id
    LEFT JOIN employee ON employee.role_id = role.id`,
        (err, data) => {
            console.log('\n');
            console.table(data);
            console.log('\n');
            start();
        });

}

// ----- View all Roles and their Info and Employees -----
function viewByRole() {
    connection.query(`
    SELECT role.id, role.title, CONCAT(employee.first_name, ' ', employee.last_name) as 'employee', department.name as 'department',
    role.salary
    FROM role
    LEFT JOIN employee on employee.role_id = role.id
    LEFT JOIN department ON role.department_id = department.id`,
        (err, data) => {
            console.log('\n');
            console.table(data);
            console.log('\n');
            start();
        });
}

// ----- Add a new Employee to the Database -----
function addEmployee() {
    var roles = [];
    connection.query("SELECT * from role", (err, data) => {
        if (err) throw err;
        for (var i = 0; i < data.length; i++) {
            roles.push({
                name: data[i].title,
                value: data[i].id
            });
        }
    });
    var employees = [];
    connection.query("SELECT * from employee", (err, data) => {
        if (err) throw err;
        for (var i = 0; i < data.length; i++) {
            employees.push({
                name: data[i].first_name + ' ' + data[i].last_name,
                value: data[i].id
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
        var first = answers.firstName.trim();
        var last = answers.lastName.trim();
        var role = answers.role;
        var manager = answers.manager;
        var query;
        if (manager === "none") {
            query = {
                first_name: first,
                last_name: last,
                role_id: role
            }
        } else {
            query = {
                first_name: first,
                last_name: last,
                role_id: role,
                manager_id: manager
            }
        }

        connection.query("INSERT INTO employee SET ?", query, (err, res) => {
            if (err) throw err;
            console.log("\n~ Employee Added ~\n");
            start();
        });
    });
}

// ----- Add a new Department to the Database -----
function addDepartment() {
    inquirer.prompt(
        {
            message: "What is the name of the department? ",
            name: "name"
        }
    ).then(answer => {
        connection.query("INSERT INTO department SET ?",
            {
                name: answer.name.trim()
            },
            (err, res) => {
                if (err) throw err;
                console.log("\n~ Department Added ~\n");
                start();
            });
    });
}

// ----- Add a new Role to the Database -----
function addRole() {
    var departments = [];
    connection.query("SELECT * FROM department", (err, data) => {
        if (err) throw err;
        for (var i = 0; i < data.length; i++) {
            departments.push(
                {
                    name: data[i].name,
                    value: data[i].id
                }
            );
        }
    });
    inquirer.prompt([
        {
            message: "What is the name of the role? ",
            name: "title"
        },
        {
            message: "Enter the salary for the role: ",
            name: "salary"
        },
        {
            message: "What department does the role belong to? ",
            name: "department",
            type: "list",
            choices: departments
        }
    ]).then(answers => {
        var title = answers.title.trim();
        var salary = parseFloat(answers.salary.trim());
        var id = answers.department;
        connection.query("INSERT INTO role SET ?",
            {
                title: title,
                salary: salary,
                department_id: id
            },
            (err, res) => {
                if (err) throw err;
                console.log("\n~ Role Added ~\n");
                start();
            });
    });
}

// ----- Update an Existing Employee's Role and Manager -----
function updateEmployee() {
    var employees = [];
    connection.query("SELECT * FROM employee", (err, data) => {
        if (err) throw err;
        for (var i = 0; i < data.length; i++) {
            employees.push(
                {
                    name: data[i].first_name + ' ' + data[i].last_name,
                    value: data[i].id
                }
            );
        }
        employees.push(
            {
                name: "None",
                value: "none"
            }
        );
    });
    var roles = [];
    connection.query("SELECT * from role", (err, data) => {
        if (err) throw err;
        for (var i = 0; i < data.length; i++) {
            roles.push({
                name: data[i].title,
                value: data[i].id
            });
        }
    });
    inquirer.prompt([
        {
            message: "Press enter to continue.",
            name: "enter"
        },
        {
            message: "Which employee would you like to update? ",
            name: "employee",
            type: "list",
            choices: employees
        },
        {
            message: "Enter their new role: ",
            name: "role",
            type: "list",
            choices: roles
        },
        {
            message: "Enter their manager: ",
            name: "manager",
            type: "list",
            choices: employees
        }
    ]).then(answers => {
        var query;
        if (answers.manager === "none") {
            query = {
                role_id: answers.role,
                manager_id: null
            }
        } else {
            query = {
                role_id: answers.role,
                manager_id: answers.manager
            }
        }
        connection.query("UPDATE employee SET ? WHERE id ='" + answers.employee + "'", query,
        (err, res) => {
            if (err) throw err;
            console.log("\n~ Employee Updated ~\n");
            start();
        });
    });
}

// ----- Remove an Employee from the Database -----
function removeEmployee() {
    connection.query("SELECT * FROM employee", (err, data) => {
        if (err) throw err;
        inquirer.prompt(
            {
                message: "Select the employee you would like to remove: ",
                name: "employee",
                type: "list",
                choices: data.map(employee => {
                    return {
                        name: employee.first_name + ' ' + employee.last_name,
                        value: employee.id
                    }
                })
            }
        ).then(answer => {
            connection.query("DELETE FROM employee WHERE id = '" + answer.employee + "'", (err, res) => {
                if (err) throw err;
                console.log("\n~ Employee Removed ~\n");
                start();
            })
        });
    });
}

function displayEnd() {
    console.log(`
------------------------------
----- End of Application -----
------------------------------
    `);
}

// ---------- Call Functions ----------
displayTitle();
start();
