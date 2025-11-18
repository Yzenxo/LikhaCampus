import ExcelJS from "exceljs";
import StudentDatabase from "../models/StudentDatabase.js";

// ===== UPLOAd EXCEL FILE =====
export const uploadStudentDatabase = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: "No file uploaded" });
    }

    const workbook = new ExcelJS.Workbook();
    await workbook.xlsx.load(req.file.buffer);

    const worksheet = workbook.worksheets[0];
    if (!worksheet) {
      return res.status(400).json({ message: "Excel file is empty" });
    }

    const headers = [];
    worksheet.getRow(1).eachCell((cell) => {
      headers.push(cell.value);
    });

    const requiredColumns = [
      "firstName",
      "lastName",
      "studentNumber",
      "yearLevel",
    ];
    const missingColumns = requiredColumns.filter(
      (col) => !headers.includes(col)
    );

    if (missingColumns.length > 0) {
      return res.status(400).json({
        message: `Missing required columns: ${missingColumns.join(", ")}`,
        hint: "Excel file must have columns: firstName, lastName, studentNumber, yearLevel",
      });
    }

    const data = [];
    worksheet.eachRow((row, rowNumber) => {
      if (rowNumber === 1) return;

      const rowData = {};
      row.eachCell((cell, colNumber) => {
        const header = headers[colNumber - 1];
        rowData[header] = cell.value;
      });

      if (Object.keys(rowData).length > 0) {
        data.push(rowData);
      }
    });

    if (data.length === 0) {
      return res.status(400).json({ message: "No data found in Excel file" });
    }

    await StudentDatabase.deleteMany({});

    const students = data.map((row) => ({
      firstName: String(row.firstName || "").trim(),
      lastName: String(row.lastName || "").trim(),
      studentNumber: String(row.studentNumber || "").trim(),
      yearLevel: String(row.yearLevel || "").trim(),
    }));

    const validStudents = students.filter(
      (student) =>
        student.firstName &&
        student.lastName &&
        student.studentNumber &&
        student.yearLevel &&
        ["1st Year", "2nd Year", "3rd Year", "4th Year"].includes(
          student.yearLevel
        )
    );

    if (validStudents.length === 0) {
      return res
        .status(400)
        .json({ message: "No valid student data found in Excel file" });
    }

    let insertedCount = 0;
    let duplicatesSkipped = 0;

    for (const student of validStudents) {
      try {
        await StudentDatabase.create(student);
        insertedCount++;
      } catch (err) {
        if (err.code === 11000) {
          duplicatesSkipped++;
        } else {
          console.error("Insert error:", err);
        }
      }
    }

    res.status(200).json({
      message: "Students uploaded successfully",
      totalProcessed: data.length,
      totalInserted: insertedCount,
      duplicatesSkipped: duplicatesSkipped,
    });
  } catch (error) {
    console.error("Upload error:", error);
    res.status(500).json({
      message: "Failed to upload students",
      error: error.message,
    });
  }
};

// ===== GET STUDENT COUNT =====
export const getStudentCount = async (req, res) => {
  try {
    const count = await StudentDatabase.countDocuments();
    res.status(200).json({ count });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to get count", error: error.message });
  }
};

// ===== GET ALL STUDENT COUNT =====
export const getAllStudents = async (req, res) => {
  try {
    const students = await StudentDatabase.find()
      .select("firstName lastName studentNumber yearLevel")
      .sort({ lastName: 1, firstName: 1 })
      .limit(100);

    res.status(200).json({ students, total: students.length });
  } catch (error) {
    res
      .status(500)
      .json({ message: "Failed to fetch students", error: error.message });
  }
};

// ===== VALIDATE STUDENT =====
export const validateStudent = async (
  firstName,
  lastName,
  studentNumber,
  yearLevel
) => {
  try {
    const student = await StudentDatabase.findOne({
      firstName: { $regex: new RegExp(`^${firstName.trim()}$`, "i") },
      lastName: { $regex: new RegExp(`^${lastName.trim()}$`, "i") },
      studentNumber: studentNumber.trim(),
      yearLevel: yearLevel,
    });

    return {
      isValid: !!student,
      message: student
        ? "Student validated successfully"
        : "Student information does not match our records",
    };
  } catch (error) {
    console.error("Validation error:", error);
    return {
      isValid: false,
      message: "Validation failed",
    };
  }
};
