import { createCanvas } from "canvas";
import fs from "fs/promises";
import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import Tesseract from "tesseract.js";

// Set worker source to avoid worker errors in Node.js
pdfjsLib.GlobalWorkerOptions.workerSrc =
  "pdfjs-dist/legacy/build/pdf.worker.mjs";

// Extract academic year and semester from registration form PDF
export const extractRegistrationFormInfo = async (pdfPath) => {
  try {
    console.log("Starting PDF extraction...");
    console.log("PDF path:", pdfPath);

    // Read PDF file
    const pdfBuffer = await fs.readFile(pdfPath);
    const data = new Uint8Array(pdfBuffer);

    // Load PDF with worker disabled
    const loadingTask = pdfjsLib.getDocument({
      data,
      useWorkerFetch: false,
      isEvalSupported: false,
      useSystemFonts: true,
      disableFontFace: false,
      standardFontDataUrl: null,
    });
    const pdf = await loadingTask.promise;

    console.log(`PDF loaded. Pages: ${pdf.numPages}`);

    // Extract text from all pages
    let fullText = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
      const page = await pdf.getPage(pageNum);
      const textContent = await page.getTextContent();
      const pageText = textContent.items.map((item) => item.str).join(" ");
      fullText += pageText + "\n";
    }

    console.log("=== Extracted PDF Text ===");
    console.log(fullText);
    console.log("==========================");

    // If text extraction failed, try OCR on first page
    if (!fullText || fullText.trim().length < 50) {
      console.log("Text extraction minimal. Attempting OCR...");
      fullText = await extractWithOCR(pdf);
      console.log("=== OCR Result ===");
      console.log(fullText);
      console.log("==================");
    }

    // Extract Academic Year
    const academicYearPatterns = [
      /ACADEMIC\s*YEAR[:\s]*(\d{4}[-–\s]*\d{4})/i,
      /A\.?Y\.?[:\s]*(\d{4}[-–\s]*\d{4})/i,
      /(\d{4}[-–\s]*\d{4})\s*ACADEMIC\s*YEAR/i,
      /SCHOOL\s*YEAR[:\s]*(\d{4}[-–\s]*\d{4})/i,
      /S\.?Y\.?[:\s]*(\d{4}[-–\s]*\d{4})/i,
      /(\d{4}\s*[-–]\s*\d{4})/i,
    ];

    let academicYear = null;
    for (const pattern of academicYearPatterns) {
      const match = fullText.match(pattern);
      if (match) {
        academicYear = match[1].replace(/\s+/g, "").replace(/–/g, "-");
        break;
      }
    }

    // Extract Semester
    const semesterPatterns = [
      /FIRST\s*SEMESTER/i,
      /1ST\s*SEMESTER/i,
      /SECOND\s*SEMESTER/i,
      /2ND\s*SEMESTER/i,
      /SEMESTER[:\s]*(FIRST|1ST|SECOND|2ND)/i,
    ];

    let semester = null;
    for (const pattern of semesterPatterns) {
      const match = fullText.match(pattern);
      if (match) {
        const found = match[0].toUpperCase();
        if (found.includes("FIRST") || found.includes("1ST")) {
          semester = "First Semester";
        } else if (found.includes("SECOND") || found.includes("2ND")) {
          semester = "Second Semester";
        }
        break;
      }
    }

    // Extract student number
    const studentNumberPatterns = [
      /STUDENT\s*(?:NO|NUMBER|ID)[.:]?\s*(\d{9})/gi,
      /ID\s*(?:NO|NUMBER)?[.:]?\s*(\d{9})/gi,
      /(?:NO|NUMBER)[.:]?\s*(\d{9})/gi,
      /\b(20\d{7})\b/g, // 9-digit number starting with 20
    ];

    let studentNumber = null;
    for (const pattern of studentNumberPatterns) {
      try {
        const matches = fullText.matchAll(pattern);
        for (const match of matches) {
          const num = match[1];
          const clean = num.replace(/\D/g, "");
          if (clean.length === 9 && clean.startsWith("20")) {
            studentNumber = clean;
            break;
          }
        }
        if (studentNumber) break;
      } catch (error) {
        // Fallback to single match if matchAll fails
        const match = fullText.match(pattern);
        if (match && match[1]) {
          const clean = match[1].replace(/\D/g, "");
          if (clean.length === 9 && clean.startsWith("20")) {
            studentNumber = clean;
            break;
          }
        }
      }
    }

    console.log("Extracted Info:");
    console.log("- Academic Year:", academicYear);
    console.log("- Semester:", semester);
    console.log("- Student Number:", studentNumber || "Not found in PDF");

    return {
      success: !!(academicYear && semester),
      academicYear,
      semester,
      studentNumber,
      extractedText: fullText,
      message:
        academicYear && semester
          ? "Registration form information extracted successfully"
          : "Could not extract semester/academic year from registration form. Please ensure the document contains clear text.",
    };
  } catch (error) {
    console.error("PDF extraction error:", error);
    console.error("Stack:", error.stack);
    return {
      success: false,
      academicYear: null,
      semester: null,
      studentNumber: null,
      extractedText: "",
      message:
        "Failed to extract information from registration form. Please ensure you uploaded a valid PDF.",
    };
  }
};

// OCR fallback for image-based PDFs
async function extractWithOCR(pdf) {
  try {
    // Only OCR first page to save time
    const page = await pdf.getPage(1);
    const viewport = page.getViewport({ scale: 2.0 });

    // Create canvas
    const canvas = createCanvas(viewport.width, viewport.height);
    const context = canvas.getContext("2d");

    // Render PDF page to canvas
    const renderContext = {
      canvasContext: context,
      viewport: viewport,
    };
    await page.render(renderContext).promise;

    // Get image data
    const imageData = canvas.toDataURL("image/png");
    const base64Data = imageData.replace(/^data:image\/png;base64,/, "");
    const buffer = Buffer.from(base64Data, "base64");

    // Save to temp file
    const tempImagePath = `temp/ocr-temp-${Date.now()}.png`;
    await fs.writeFile(tempImagePath, buffer);

    console.log("OCR processing page 1...");
    const {
      data: { text },
    } = await Tesseract.recognize(tempImagePath, "eng", {
      logger: (m) => {
        if (m.status === "recognizing text") {
          console.log(`OCR Progress: ${Math.round(m.progress * 100)}%`);
        }
      },
    });

    // Cleanup
    await fs.unlink(tempImagePath).catch(() => {});

    return text;
  } catch (error) {
    console.error("OCR error:", error);
    return "";
  }
}
