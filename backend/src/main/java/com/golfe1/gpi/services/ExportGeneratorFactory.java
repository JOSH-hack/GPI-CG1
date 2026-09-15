package com.golfe1.gpi.services;

import com.golfe1.gpi.dto.request.ExportRequest;
import org.springframework.stereotype.Service;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class ExportGeneratorFactory {

    private final Map<String, ExportGenerator> generateurs;

    // Spring injecte automatiquement tous les beans qui implémentent
    // ExportGenerator
    public ExportGeneratorFactory(List<ExportGenerator> listeGenerateurs) {
        this.generateurs = listeGenerateurs.stream()
                .collect(Collectors.toMap(ExportGenerator::getFormatSupporte, g -> g));
    }

    public byte[] generer(ExportRequest request) throws Exception {
        ExportGenerator generateur = generateurs.get(request.getFormat().toUpperCase());

        if (generateur == null) {
            throw new IllegalArgumentException("Format non supporté : " + request.getFormat());
        }

        return generateur.generer(request);
    }
}