package com.golfe1.gpi.services;

import com.golfe1.gpi.dto.request.ExportRequest;

public interface ExportGenerator {
  
    byte[] generer(ExportRequest request) throws Exception;

    /**
     * @return Le format supporté par ce générateur (ex:
     *         "DOCX", "XLSX").
     */
    String getFormatSupporte();
}
