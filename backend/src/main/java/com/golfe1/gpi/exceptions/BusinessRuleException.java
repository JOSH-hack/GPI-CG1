/*

Nom du fichier   : BusinessRuleException.java
Objectif         : Exception métier levée quand une règle métier est violée
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.exceptions;

public class BusinessRuleException extends RuntimeException {

    public BusinessRuleException(String message) {
        super(message);
    }
}