package com.golfe1.gpi.services;

import com.golfe1.gpi.dto.request.ExportRequest;
import org.springframework.stereotype.Service;

@Service
public class ExcelExportGenerator implements ExportGenerator {

    private final ExportService exportService;

    public ExcelExportGenerator(ExportService exportService) {
        this.exportService = exportService;
    }

    @Override
    public byte[] generer(ExportRequest request) throws Exception {
        return exportService.genererExcel(exportService.collecterDonnees());
    }

    @Override
    public String getFormatSupporte() {
        return "XLSX";
    }
}
