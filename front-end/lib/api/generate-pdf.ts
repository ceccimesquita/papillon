import { NextApiRequest, NextApiResponse } from 'next';
import libreoffice from 'libreoffice-convert';
import fs from 'fs';
import path from 'path';

// Configura o libreoffice-convert para usar promises
libreoffice.convert = require('util').promisify(libreoffice.convert);

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  try {
    const { budgetData } = req.body;

    // 1. Caminho para o template (ajuste conforme sua estrutura de pastas)
    const templatePath = path.join(process.cwd(), 'public', 'templates', 'orcamento-template.docx');
    const template = fs.readFileSync(templatePath);

    // 2. Gerar DOCX
    const createReport = (await import('docx-templates')).createReport;
    const docxBuffer = await createReport({
      template,
      data: budgetData,
      cmdDelimiter: ['{', '}'],
      processLineBreaks: true,
    });

    // 3. Converter para PDF
    const pdfBuffer = await libreoffice.convert(docxBuffer, '.pdf', undefined);

    // 4. Retornar o PDF
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', 'attachment; filename=orcamento.pdf');
    return res.send(pdfBuffer);
  } catch (error) {
    console.error('Error generating PDF:', error);
    return res.status(500).json({ error: 'Failed to generate PDF' });
  }
}