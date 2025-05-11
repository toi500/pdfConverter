import PdfPrinter from "pdfmake";
import fs from "fs-extra";
import path from "path";
import { marked, Token, Tokens } from "marked";

const fonts = {
  Roboto: {
    normal: path.join(__dirname, "..", "..", "fonts", "Roboto-Regular.ttf"),
    bold: path.join(__dirname, "..", "..", "fonts", "Roboto-Medium.ttf"),
    italics: path.join(__dirname, "..", "..", "fonts", "Roboto-Italic.ttf"),
    bolditalics: path.join(
      __dirname,
      "..",
      "..",
      "fonts",
      "Roboto-MediumItalic.ttf"
    ),
  },
};

const printer = new PdfPrinter(fonts);

marked.setOptions({
  gfm: true,
  breaks: false,
  pedantic: false,
});

function processInlineTokens(inlineTokens: Token[] | undefined): any[] {
  const pdfMakeTextArray: any[] = [];
  if (!inlineTokens) return pdfMakeTextArray;

  inlineTokens.forEach((token) => {
    switch (token.type) {
      case "text":
        pdfMakeTextArray.push({ text: token.text });
        break;
      case "strong":
        pdfMakeTextArray.push({
          text: processInlineTokens(token.tokens),
          bold: true,
        });
        break;
      case "em":
        pdfMakeTextArray.push({
          text: processInlineTokens(token.tokens),
          italics: true,
        });
        break;
      case "codespan":
        pdfMakeTextArray.push({ text: token.text, style: "inlineCode" });
        break;
      case "del":
        pdfMakeTextArray.push({
          text: processInlineTokens(token.tokens),
          decoration: "lineThrough",
        });
        break;
      case "link":
        pdfMakeTextArray.push({
          text: token.text,
          link: token.href,
          style: "link",
        });
        break;
      case "br":
        pdfMakeTextArray.push({ text: "\n" });
        break;
      default:
        if ("text" in token && token.text) {
          pdfMakeTextArray.push({ text: token.text });
        } else if ("tokens" in token && token.tokens) {
          pdfMakeTextArray.push(
            ...processInlineTokens(token.tokens as Token[])
          );
        }
        break;
    }
  });
  return pdfMakeTextArray;
}

const convertMarkdownToPdfContent = (markdown: string): any[] => {
  const tokens = marked.lexer(markdown);
  const content: any[] = [];

  tokens.forEach((token) => {
    switch (token.type) {
      case "heading":
        content.push({
          text: processInlineTokens((token as Tokens.Heading).tokens),
          style:
            token.depth === 1
              ? "header"
              : token.depth === 2
              ? "subheader"
              : "h3",
          margin: [0, 5, 0, token.depth === 1 ? 10 : token.depth === 2 ? 8 : 5],
        });
        break;
      case "paragraph":
        content.push({
          text: processInlineTokens((token as Tokens.Paragraph).tokens),
          style: "body",
          margin: [0, 0, 0, 10],
        });
        break;
      case "code":
        content.push({
          text: (token as Tokens.Code).text,
          style: "code",
          margin: [0, 5, 0, 10],
        });
        break;
      case "list":
        const listToken = token as Tokens.List;
        const items = listToken.items.map((item) => {
          return {
            text: processInlineTokens((item as Tokens.ListItem).tokens),
            margin: [0, 2, 0, 2],
          };
        });
        content.push({
          [listToken.ordered ? "ol" : "ul"]: items,
          style: "list",
          margin: [listToken.ordered ? 10 : 5, 5, 0, 10],
        });
        break;
      case "blockquote":
        content.push({
          text: processInlineTokens((token as Tokens.Blockquote).tokens),
          style: "blockquote",
          margin: [10, 5, 0, 5],
        });
        break;
      case "hr":
        content.push({
          canvas: [
            {
              type: "line",
              x1: 0,
              y1: 5,
              x2: 515,
              y2: 5,
              lineWidth: 0.5,
              lineColor: "#cccccc",
            },
          ],
          margin: [0, 10, 0, 10],
        });
        break;
      case "space":
        break;
      default:
        if ("raw" in token && (token as any).raw.trim()) {
        }
        break;
    }
  });
  return content;
};

export const savePdfToFile = async (
  text: string,
  filePath: string
): Promise<void> => {
  const docDefinition: any = {
    content: convertMarkdownToPdfContent(text),
    styles: {
      header: { fontSize: 20, bold: true },
      subheader: { fontSize: 16, bold: true },
      h3: { fontSize: 14, bold: true },
      body: { fontSize: 10, lineHeight: 1.4 },
      code: {
        font: "Roboto",
        fontSize: 9,
        background: "#f0f0f0",
        preserveLeadingSpaces: true,
        margin: [0, 5, 0, 5],
      },
      inlineCode: { font: "Roboto", fontSize: 9, background: "#f0f0f0" },
      link: { color: "blue", decoration: "underline" },
      blockquote: { italics: true, color: "grey", margin: [20, 5, 0, 5] },
      list: { margin: [0, 0, 0, 5] },
    },
    defaultStyle: {
      font: "Roboto",
    },
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinition);

  await fs.ensureDir(path.dirname(filePath));

  const stream = fs.createWriteStream(filePath);
  pdfDoc.pipe(stream);
  pdfDoc.end();

  return new Promise((resolve, reject) => {
    stream.on("finish", resolve);
    stream.on("error", reject);
  });
};

export const generatePdf = async (text: string): Promise<Buffer> => {
  const docDefinition: any = {
    content: convertMarkdownToPdfContent(text),
    styles: {
      header: { fontSize: 20, bold: true },
      subheader: { fontSize: 16, bold: true },
      h3: { fontSize: 14, bold: true },
      body: { fontSize: 10, lineHeight: 1.4 },
      code: {
        font: "Roboto",
        fontSize: 9,
        background: "#f0f0f0",
        preserveLeadingSpaces: true,
        margin: [0, 5, 0, 5],
      },
      inlineCode: { font: "Roboto", fontSize: 9, background: "#f0f0f0" },
      link: { color: "blue", decoration: "underline" },
      blockquote: { italics: true, color: "grey", margin: [20, 5, 0, 5] },
      list: { margin: [0, 0, 0, 5] },
    },
    defaultStyle: {
      font: "Roboto",
    },
  };

  const pdfDoc = printer.createPdfKitDocument(docDefinition);
  return new Promise((resolve, reject) => {
    const chunks: Buffer[] = [];
    pdfDoc.on("data", (chunk) => chunks.push(chunk));
    pdfDoc.on("end", () => resolve(Buffer.concat(chunks)));
    pdfDoc.on("error", reject);
    pdfDoc.end();
  });
};
