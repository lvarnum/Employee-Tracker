DROP DATABASE IF EXISTS employee_db;
CREATE DATABASE employee_db;
USE employee_db;

CREATE TABLE department (
    id integer auto_increment not null,
    name varchar(30) not null,
    primary key (id)
);

CREATE TABLE role (
    id integer auto_increment not null,
    title varchar(30) not null,
    salary decimal not null,
    department_id integer not null,
    primary key (id),
    foreign key (department_id) references department(id)
);

CREATE TABLE employee (
    id integer auto_increment not null,
    first_name varchar(30) not null,
    last_name varchar(30) not null,
    role_id integer not null,
    manager_id integer,
    primary key (id),
    foreign key (role_id) references role (id),
    foreign key(manager_id) references employee (id)
);

INSERT INTO department (name) VALUES ("Engineering"); 
INSERT INTO role (title, salary, department_id) VALUES ("Lead Software Engineer", 150000, 1);
INSERT INTO employee (first_name, last_name, role_id) VALUES ("Darren", "Cole", 1);
INSERT INTO role (title, salary, department_id) VALUES ("Software Engineer", 120000, 1);
INSERT INTO employee (first_name, last_name, role_id, manager_id) VALUES ("Piper", "Jackabee", 2, 1);