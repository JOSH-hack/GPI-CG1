package com.golfe1.gpi.services;

import com.golfe1.gpi.dto.request.ExportRequest;
import org.springframework.stereotype.Service;

@Service
public class DocxExportGenerator implements ExportGenerator {

    private final DocumentDocxService documentDocxService;

    public DocxExportGenerator(DocumentDocxService documentDocxService) {
        this.documentDocxService = documentDocxService;
    }

    @Override
    public byte[] generer(ExportRequest request) throws Exception {
        return documentDocxService.genererFicheEquipement(request.getIdEquipement());
    }

    @Override
    public String getFormatSupporte() {
        return "DOCX";
    }
}
