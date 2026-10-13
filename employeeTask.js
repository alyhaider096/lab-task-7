const fs = require("node:fs");
const path = require("node:path");

// Locate employees.json beside this JavaScript file.
const filePath = path.join(__dirname, "employees.json");

// Read the file and convert JSON text into a JavaScript array.
const text = fs.readFileSync(filePath, "utf8");
const employees = JSON.parse(text);

console.log("Existing employees:");
console.table(employees);

// Find the highest existing ID, then add 1.
const nextId = employees.reduce(
  (highestId, employee) => Math.max(highestId, employee.id),
  0
) + 1;

const newEmployee = {
  id: nextId,
  name: "Zain",
  department: "Marketing"
};

// Add the employee to the array.
employees.push(newEmployee);

// Convert the updated array to JSON text and save it.
fs.writeFileSync(
  filePath,
  JSON.stringify(employees, null, 2),
  "utf8"
);

console.log("New employee added:");
console.log(newEmployee);
console.log("Total employees:", employees.length);