import { Router } from "express";
import { PdfController } from "../controllers/pdfController";

export const setPdfRoutes = (app: Router): void => {
  const router = Router();
  const pdfController = new PdfController();

  router.post("/convert", pdfController.convertTextToPdf.bind(pdfController));
  router.post(
    "/convert-link",
    pdfController.convertTextToPdfAndGetLink.bind(pdfController)
  );

  app.use("/api", router);
};