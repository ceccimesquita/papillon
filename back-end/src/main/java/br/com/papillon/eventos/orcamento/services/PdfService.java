package br.com.papillon.eventos.orcamento.services;

import com.lowagie.text.*;
import com.lowagie.text.Font;
import com.lowagie.text.pdf.*;
import br.com.papillon.eventos.orcamento.entities.Orcamento;
import org.springframework.stereotype.Service;
import java.awt.*;
import java.io.ByteArrayOutputStream;

@Service
public class PdfService {

    public byte[] generatePdfFromOrcamento(Orcamento orcamento) {
        try (ByteArrayOutputStream baos = new ByteArrayOutputStream()) {
            Document document = new Document(PageSize.A4, 36, 36, 36, 36); // Margens reduzidas
            PdfWriter.getInstance(document, baos);
            document.open();

            // Configuração de fontes
            Font titleFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 16, Color.BLUE);
            Font headerFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 12);
            Font normalFont = FontFactory.getFont(FontFactory.HELVETICA, 10);
            Font smallBoldFont = FontFactory.getFont(FontFactory.HELVETICA_BOLD, 9);
            
            // Título principal
            Paragraph title = new Paragraph("DETALHES DO ORÇAMENTO", titleFont);
            title.setAlignment(Element.ALIGN_CENTER);
            title.setSpacingAfter(20);
            document.add(title);

            // Tabela de informações principais
            float[] columnWidths = {30, 70};
            PdfPTable mainTable = new PdfPTable(columnWidths);
            mainTable.setWidthPercentage(100);
            mainTable.setSpacingBefore(10);
            
            addTableHeader(mainTable, "Campo", headerFont);
            addTableHeader(mainTable, "Valor", headerFont);
            
            addTableRow(mainTable, "Número do Orçamento:", orcamento.getId().toString(), normalFont);
            addTableRow(mainTable, "Cliente:", orcamento.getCliente().getNome(), normalFont);
            addTableRow(mainTable, "Data do Evento:", orcamento.getDataDoEvento().toString(), normalFont);
            addTableRow(mainTable, "Quantidade de Pessoas:", String.valueOf(orcamento.getQuantidadePessoas()), normalFont);
            addTableRow(mainTable, "Valor por Pessoa:", "R$" + orcamento.getValorPorPessoa(), normalFont);
            addTableRow(mainTable, "Valor Total:", "R$" + orcamento.getValorTotal(), headerFont);
            addTableRow(mainTable, "Data Limite:", orcamento.getDataLimite().toString(), normalFont);
            
            document.add(mainTable);
            
            // Seção de cardápios
            Paragraph cardapiosTitle = new Paragraph("\n📋 CARDÁPIOS", headerFont);
            cardapiosTitle.setSpacingBefore(15);
            document.add(cardapiosTitle);
            
            for (var c : orcamento.getCardapios()) {
                Paragraph cardapioName = new Paragraph("- " + c.getNome(), smallBoldFont);
                cardapioName.setIndentationLeft(10);
                document.add(cardapioName);
                
                PdfPTable itensTable = new PdfPTable(2);
                itensTable.setWidthPercentage(100);
                itensTable.setSpacingBefore(5);
                
                itensTable.addCell(createCell("Item", Element.ALIGN_LEFT, true, smallBoldFont));
                itensTable.addCell(createCell("Tipo", Element.ALIGN_LEFT, true, smallBoldFont));
                
                for (var i : c.getItens()) {
                    itensTable.addCell(createCell("    • " + i.getNome(), Element.ALIGN_LEFT, false, normalFont));
                    itensTable.addCell(createCell(i.getTipo(), Element.ALIGN_LEFT, false, normalFont));
                }
                
                document.add(itensTable);
            }

            // Seção de funcionários
            Paragraph funcionariosTitle = new Paragraph("\n👷 FUNCIONÁRIOS", headerFont);
            funcionariosTitle.setSpacingBefore(15);
            document.add(funcionariosTitle);
            
            PdfPTable funcTable = new PdfPTable(new float[]{50, 30, 20});
            funcTable.setWidthPercentage(100);
            funcTable.setSpacingBefore(5);
            
            funcTable.addCell(createCell("Nome", Element.ALIGN_LEFT, true, smallBoldFont));
            funcTable.addCell(createCell("Função", Element.ALIGN_LEFT, true, smallBoldFont));
            funcTable.addCell(createCell("Valor", Element.ALIGN_RIGHT, true, smallBoldFont));
            
            for (var f : orcamento.getFuncionarios()) {
                funcTable.addCell(createCell(f.getNome(), Element.ALIGN_LEFT, false, normalFont));
                funcTable.addCell(createCell(f.getFuncao(), Element.ALIGN_LEFT, false, normalFont));
                funcTable.addCell(createCell("R$" + f.getValor(), Element.ALIGN_RIGHT, false, normalFont));
            }
            
            document.add(funcTable);

            // Rodapé
            Paragraph footer = new Paragraph("\nGerado em: " + new java.util.Date(), normalFont);
            footer.setAlignment(Element.ALIGN_CENTER);
            document.add(footer);

            document.close();
            return baos.toByteArray();
        } catch (Exception e) {
            throw new RuntimeException("Erro ao gerar PDF do orçamento", e);
        }
    }

    // Métodos auxiliares para criação de células
    private void addTableHeader(PdfPTable table, String text, Font font) {
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setBackgroundColor(new Color(220, 220, 220));
        cell.setPadding(5);
        table.addCell(cell);
    }
    
    private void addTableRow(PdfPTable table, String label, String value, Font font) {
        table.addCell(createCell(label, Element.ALIGN_RIGHT, true, font));
        table.addCell(createCell(value, Element.ALIGN_LEFT, false, font));
    }
    
    private PdfPCell createCell(String text, int alignment, boolean isBold, Font baseFont) {
        Font font = isBold ? 
            FontFactory.getFont(FontFactory.HELVETICA_BOLD, baseFont.getSize(), baseFont.getColor()) : 
            baseFont;
        
        PdfPCell cell = new PdfPCell(new Phrase(text, font));
        cell.setHorizontalAlignment(alignment);
        cell.setPadding(5);
        cell.setBorderColor(Color.LIGHT_GRAY);
        return cell;
    }
}