import { Request, Response } from "express";
import { v4 as uuidv4 } from "uuid";
import path from "path";
import { generatePdf, savePdfToFile } from "../utils/pdfGenerator";

const PDF_STORAGE_PATH = path.join(__dirname, "..", "..", "public", "pdfs");

export class PdfController {
  public async convertTextToPdf(req: Request, res: Response): Promise<void> {
    try {
      const { text, textInput } = req.body;
      const inputText = text || textInput;

      if (!inputText) {
        res.status(400).json({ error: "Text content is required" });
        return;
      }

      const pdfBuffer = await generatePdf(inputText);
      res.set({
        "Content-Type": "application/pdf",
        "Content-Disposition": 'attachment; filename="converted.pdf"',
        "Content-Length": pdfBuffer.length,
      });
      res.send(pdfBuffer);
    } catch (error: unknown) {
      const errorMessage =
        error instanceof Error ? error.message : "Unknown error occurred";
      console.error("Error converting to PDF:", errorMessage);
      res
        .status(500)
        .json({
          error: "Failed to convert text to PDF",
          details: errorMessage,
        });
    }
  }

  public async convertTextToPdfAndGetLink(
    req: Request,
    res: Response
  ): Promise<void> {
    try {
      const { text, textInput } = req.body;
      const inputText = text || textInput;

      if (!inputText) {
        res.status(400).json({ error: "Text content is required" });
        return;
      }

      const uniqueFilename = `${uuidv4()}.pdf`;
      const filePath = path.join(PDF_STORAGE_PATH, uniqueFilename);

      await savePdfToFile(inputText, filePath);

      const downloadLink = `${req.protocol}://${req.get(
        "host"
      )}/downloads/${uniqueFilename}`;
      res.status(200).json({ downloadLink });
    } catch (err: unknown) {
      const errorMessage =
        err instanceof Error
          ? err.message
          : typeof err === "string"
          ? err
          : "An unknown error occurred";

      console.error("Error generating PDF link:", errorMessage);
      res.status(500).json({
        error: "Failed to generate PDF link",
        details: errorMessage,
      });
    }
  }
}
