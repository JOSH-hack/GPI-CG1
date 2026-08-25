/*

Nom du fichier   : ResourceNotFoundException.java
Objectif         : Exception métier levée quand une ressource n'existe pas en base
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.exceptions;

public class ResourceNotFoundException extends RuntimeException {

    public ResourceNotFoundException(String resourceName, Long id) {
        super(resourceName + " introuvable avec l'ID : " + id);
    }

    public ResourceNotFoundException(String resourceName, String field, String value) {
        super(resourceName + " introuvable avec " + field + " : " + value);
    }
}