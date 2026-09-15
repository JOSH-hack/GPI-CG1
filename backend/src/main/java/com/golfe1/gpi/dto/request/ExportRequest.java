package com.golfe1.gpi.dto.request;

import lombok.Data;
import java.util.Map;

@Data
  public class ExportRequest {
      private Long idEquipement;
      private String format; // "DOCX" ou "XLSX"

      // Contient toutes les données modifiées (ex: {"nom": "PC HP", "localisation": "Bureau 101"})
      private Map<String, Object> donneesEditees;
  }
