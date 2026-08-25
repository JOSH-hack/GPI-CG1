/*

Nom du fichier   : UnauthorizedActionException.java
Objectif         : Exception levée quand un utilisateur tente une action non autorisée
Propriétaire     : Josué BEDEL
Date de création : 25/08/2026

*/

package com.golfe1.gpi.exceptions;

public class UnauthorizedActionException extends RuntimeException {

    public UnauthorizedActionException(String message) {
        super(message);
    }
}