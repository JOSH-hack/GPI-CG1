package com.golfe1.gpi.services;

import com.golfe1.gpi.dto.request.ExportRequest;
import org.springframework.stereotype.Service;

@Service
public class PdfExportGenerator implements ExportGenerator {
    private final DocumentPdfService pdfService;

    public PdfExportGenerator(DocumentPdfService pdfService) { 
        this.pdfService = pdfService; 
    }

    @Override
    public byte[] generer(ExportRequest request) throws Exception {
        return pdfService.genererFicheEquipementEditee(request.getIdEquipement(), request.getDonneesEditees());
    }

    @Override
    public String getFormatSupporte() { return "PDF"; }
}
