import "dotenv/config";
import express from "express";
import bodyParser from "body-parser";
import path from "path";
import { setPdfRoutes } from "./routes/pdfRoutes";

const app = express();
const PORT = process.env.PORT || 3000;

app.use(bodyParser.json());

app.use(
  "/downloads",
  express.static(path.join(__dirname, "..", "public", "pdfs"))
);

app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok' });
});

setPdfRoutes(app);

app.use(
  (
    err: any,
    req: express.Request,
    res: express.Response,
    next: express.NextFunction
  ) => {
    console.error(err.stack);
    res.status(500).json({ error: "Something went wrong!" });
  }
);

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});
