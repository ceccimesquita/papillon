package br.com.papillon.eventos.orcamento.services;

import com.lowagie.text.*;
import com.lowagie.text.pdf.*;
import br.com.papillon.eventos.orcamento.entities.Orcamento;
import org.springframework.stereotype.Service;
import java.awt.*;
import com.lowagie.text.Font;
import java.io.ByteArrayOutputStream;
import java.util.Date;

@Service
public class PdfService {

    public byte[] generatePdfFromOrcamento(Orcamento orcamento) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 36, 36);
            PdfWriter.getInstance(document, baos);
            document.open();

            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, new Color(0, 51, 102));
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
            Font smallBoldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9);
            Font italicFont = FontFactory.getFont(FontFactory.HELVETICA_OBLIQUE, 10);
            
            Paragraph saudacao = new Paragraph();
            saudacao.add(new Chunk("PREZADO(A): " + orcamento.getCliente().getNome(), headerFont));
            document.add(saudacao);
            document.add(Chunk.NEWLINE);
            
            addFormattedText(document, 
                "É com imensa satisfação que enviamos proposta e condições especiais para a realização do evento.",
                normalFont, 0);
            
            addFormattedText(document, "- SERVIÇO DE QUALIDADE", headerFont, 10);
            addFormattedText(document, 
                "Nosso serviço proporcionará uma experiência personalizada que valoriza cada pessoa presente. " +
                "Seu evento terá cardápio e decoração exclusivos.", 
                normalFont, 5);
            
            addFormattedText(document, "- NOSSO HISTÓRICO – COMO COMEÇAMOS", headerFont, 10);
            addFormattedText(document, 
                "PAPILLON hoje considerada uma das principais empresas de gastronomia e decoração de Fortaleza, " +
                "tem uma ótima reputação que foi conquistada graças a um trabalho de excelência e muito relacionamento " +
                "de proximidade e respeito com nossos clientes ao longo dos anos. Acreditamos que todos eles merecem " +
                "o mais alto nível de atendimento, e esse é exatamente o nosso compromisso. Desde 2003 Erika Queiroz " +
                "trabalha sempre para superar as expectativas, realizando eventos sociais e corporativos, com " +
                "altíssimo padrão de qualidade a cada entrega.",
                normalFont, 5);
            
            addFormattedText(document, "- SERVIÇOS", headerFont, 10);
            addFormattedText(document, "Gastronomia e Decoração", headerFont, 5);
            addFormattedText(document, 
                "- Nossos serviços são personalizados para refletir a identidade de cada evento. Sendo idealizado " +
                "com muita dedicação, comprometimento e amor, transformando sonhos em realidade!", 
                normalFont, 5);
            
            addFormattedText(document, "- ORÇAMENTO -", headerFont, 10);
            addFormattedText(document, 
                "É com imensa satisfação que enviamos proposta e condições especiais para a realização do seu evento.",
                normalFont, 15);
            
            Paragraph title = new Paragraph(20);
            title.add(new Chunk("DETALHES DO ORÇAMENTO", titleFont));
            title.setAlignment(Element.ALIGN_CENTER);
            document.add(title);

            PdfPTable mainTable = new PdfPTable(new float[]{35, 65});
            mainTable.setWidthPercentage(100);
            mainTable.setSpacingBefore(10);
            
            addTableHeader(mainTable, "Campo", headerFont);
            addTableHeader(mainTable, "Valor", headerFont);
            
            addTableRow(mainTable, "Número do Orçamento:", orcamento.getId().toString(), normalFont);
            addTableRow(mainTable, "Cliente:", orcamento.getCliente().getNome(), normalFont);
            addTableRow(mainTable, "Data do Evento:", orcamento.getDataDoEvento().toString(), normalFont);
            addTableRow(mainTable, "Quantidade de Pessoas:", String.valueOf(orcamento.getQuantidadePessoas()), normalFont);
            addTableRow(mainTable, "Valor por Pessoa:", "R$" + orcamento.getValorPorPessoa(), normalFont);
            addTableRow(mainTable, "Valor Total:", "R$" + orcamento.getValorTotal(), normalFont);
            addTableRow(mainTable, "Data Limite:", orcamento.getDataLimite().toString(), normalFont);
            
            document.add(mainTable);
            
            Paragraph cardapiosTitle = new Paragraph(15);
            cardapiosTitle.add(new Chunk("📋 CARDÁPIOS", headerFont));
            document.add(cardapiosTitle);
            
            for (var c : orcamento.getCardapios()) {
                Paragraph cardapioName = new Paragraph();
                cardapioName.add(new Chunk("- " + c.getNome(), smallBoldFont));
                cardapioName.setIndentationLeft(10);
                document.add(cardapioName);
                
                PdfPTable itensTable = new PdfPTable(new float[]{70, 30});
                itensTable.setWidthPercentage(100);
                itensTable.setSpacingBefore(5);
                
                itensTable.addCell(createCell("Item", Element.ALIGN_LEFT, true, smallBoldFont));
                itensTable.addCell(createCell("Tipo", Element.ALIGN_LEFT, true, smallBoldFont));
                
                for (var i : c.getItens()) {
                    itensTable.addCell(createCell("• " + i.getNome(), Element.ALIGN_LEFT, false, normalFont));
                    itensTable.addCell(createCell(i.getTipo(), Element.ALIGN_LEFT, false, normalFont));
                }
                
                document.add(itensTable);
                document.add(Chunk.NEWLINE);
            }

            Paragraph footer = new Paragraph(20);
            footer.add(new Chunk("Gerado em: " + new Date(), italicFont));
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar PDF do orçamento", e);
        }
    }

    private void addFormattedText(Document document, String text, Font font, float spacingAfter) throws DocumentException {
        Paragraph p = new Paragraph();
        p.add(new Chunk(text, font));
        p.setSpacingAfter(spacingAfter);
        document.add(p);
    }
    
    private void addTableHeader(PdfPTable table, String text, Font font) {
        table.addCell(createCell(text, Element.ALIGN_CENTER, true, font));
    }
    
    private void addTableRow(PdfPTable table, String label, String value, Font font) {
        table.addCell(createCell(label, Element.ALIGN_RIGHT, true, font));
        table.addCell(createCell(value, Element.ALIGN_LEFT, false, font));
    }
    
    private PdfPCell createCell(String text, int alignment, boolean isBold, Font baseFont) {
        Font font = isBold ? 
            FontFactory.getFont(FontFactory.HELVETICA_BOLD, baseFont.getSize(), baseFont.getColor()) : 
            baseFont;
        
        PdfPCell cell = new PdfPCell(new Phrase(new Chunk(text, font)));
        cell.setHorizontalAlignment(alignment);
        cell.setPadding(5);
        cell.setBorderColor(Color.LIGHT_GRAY);
        if (isBold) {
            cell.setBackgroundColor(new Color(240, 240, 240));
        }
        return cell;
    }
}