const fs = require("fs");
const path = require("path");
const { createCanvas, Image } = require("canvas");
global.Image = Image;
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.mjs");
const Tesseract = require("tesseract.js");
let fromPath;
try {
  fromPath = require("pdf2pic").fromPath;
} catch (e) {
  fromPath = null;
}

async function pdfToPngNode(pdfPath, pngPath) {
  const data = new Uint8Array(fs.readFileSync(pdfPath));
  const loadingTask = pdfjsLib.getDocument({ data });
  const pdfDocument = await loadingTask.promise;
  const page = await pdfDocument.getPage(1);

  const viewport = page.getViewport({ scale: 2.0 });
  const canvas = createCanvas(viewport.width, viewport.height);
  const context = canvas.getContext("2d");

  await page.render({ canvasContext: context, viewport }).promise;

  const buffer = canvas.toBuffer("image/png");
  fs.writeFileSync(pngPath, buffer);
  console.log("[Node.js puro] PNG gerado:", pngPath);
}

async function pdfToPngPdf2pic(pdfPath, pngPath) {
  if (!fromPath) {
    console.log("[pdf2pic] pdf2pic não está instalado. Pulando esta abordagem.");
    return null;
  }
  const outputDir = path.dirname(pngPath);
  const outputName = path.basename(pngPath, ".png");
  const converter = fromPath(pdfPath, {
    density: 300,
    saveFilename: outputName,
    savePath: outputDir,
    format: "png",
    width: 1654,
    height: 2339,
  });
  const result = await converter(1);
  console.log("[pdf2pic] PNG gerado:", result.path);
  return result.path;
}

async function ocrAndSave(pngPath, jsonPath, label) {
  const { data: { text } } = await Tesseract.recognize(pngPath, "por", { logger: m => console.log(`[${label}] ` + m.status) });
  fs.writeFileSync(jsonPath, JSON.stringify({ texto: text }, null, 2), "utf8");
  console.log(`[${label}] Texto extraído salvo em:`, jsonPath);
}

(async () => {
  const pdfPath = path.join(__dirname, "documentos", "teste1.pdf");
  const pngNodePath = path.join(__dirname, "documentos", "teste1-node-pure.png");
  const pngPdf2picPath = path.join(__dirname, "documentos", "teste1-pdf2pic.png");
  const jsonNodePath = path.join(__dirname, "documentos", "texto_ocr_node.json");
  const jsonPdf2picPath = path.join(__dirname, "documentos", "texto_ocr_pdf2pic.json");

  // 1. Node.js puro
  // await pdfToPngNode(pdfPath, pngNodePath);
  // await ocrAndSave(pngNodePath, jsonNodePath, "Node.js puro");

  // 2. pdf2pic (se disponível)
  if (fromPath) {
    const resultPath = await pdfToPngPdf2pic(pdfPath, pngPdf2picPath);
    if (resultPath) {
      await ocrAndSave(resultPath, jsonPdf2picPath, "pdf2pic");
    }
  }
})();