const express = require("express");
const fs = require("node:fs");
const path = require("node:path");

const app = express();
const PORT = 3000;

// Convert incoming JSON request bodies into JavaScript data.
app.use(express.json());

// Load the initial student records.
const filePath = path.join(__dirname, "students.json");
const students = JSON.parse(
  fs.readFileSync(filePath, "utf8")
);

// Return all students when a client sends GET /students.
app.get("/students", (req, res) => {
  res.status(200).json(students);
});

// Return one student by ID.
app.get("/students/:id", (req, res) => {
  const id = Number(req.params.id);

  const student = students.find(student => student.id === id);

  if (!student) {
    return res.status(404).json({
      message: "Student not found"
    });
  }

  res.status(200).json(student);
});
// Create a student.
app.post("/students", (req, res) => {
  const { name, department } = req.body ?? {};

  // Reject missing, non-string, or blank values.
  if (
    typeof name !== "string" ||
    name.trim() === "" ||
    typeof department !== "string" ||
    department.trim() === ""
  ) {
    return res.status(400).json({
      message: "Name and department must be non-empty strings"
    });
  }

  const nextId = students.reduce(
    (highestId, student) => Math.max(highestId, student.id),
    0
  ) + 1;

  const newStudent = {
    id: nextId,
    name: name.trim(),
    department: department.trim()
  };

  // Save first, then update the in-memory array.
  const updatedStudents = [...students, newStudent];

  fs.writeFileSync(
    filePath,
    JSON.stringify(updatedStudents, null, 2),
    "utf8"
  );

  students.push(newStudent);

  res.status(201).json(newStudent);
});

// Update an existing student's details.
app.put("/students/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = students.findIndex(student => student.id === id);

  if (index === -1) {
    return res.status(404).json({
      message: "Student not found"
    });
  }

  const { name, department } = req.body ?? {};

  if (
    typeof name !== "string" ||
    name.trim() === "" ||
    typeof department !== "string" ||
    department.trim() === ""
  ) {
    return res.status(400).json({
      message: "Name and department must be non-empty strings"
    });
  }

  const updatedStudent = {
    id,
    name: name.trim(),
    department: department.trim()
  };

  const updatedStudents = [...students];
  updatedStudents[index] = updatedStudent;

  fs.writeFileSync(
    filePath,
    JSON.stringify(updatedStudents, null, 2),
    "utf8"
  );

  students[index] = updatedStudent;

  res.status(200).json(updatedStudent);
});

// Delete an existing student.
app.delete("/students/:id", (req, res) => {
  const id = Number(req.params.id);
  const index = students.findIndex(student => student.id === id);

  if (index === -1) {
    return res.status(404).json({
      message: "Student not found"
    });
  }

  const deletedStudent = students[index];
  const updatedStudents = students.filter(student => student.id !== id);

  fs.writeFileSync(
    filePath,
    JSON.stringify(updatedStudents, null, 2),
    "utf8"
  );

  students.splice(index, 1);

  res.status(200).json({
    message: "Student deleted successfully",
    student: deletedStudent
  });
});

// Return students belonging to the requested department.
app.get("/students/department/:department", (req, res) => {
  const department = req.params.department.toLowerCase();

  const matchingStudents = students.filter(
    student => student.department.toLowerCase() === department
  );

  res.status(200).json(matchingStudents);
});


// Start accepting requests.
app.listen(PORT, () => {
  console.log(`Server running at http://localhost:${PORT}`);
});