/*

Nom du fichier   : documentValues.js
Objectif         : Helpers de formatage partages par les sections de
                    l'editeur de document (fiche equipement) - valeur par
                    defaut, dates et montants, coherents avec les
                    conventions deja utilisees dans Liste.jsx / Detail.jsx.
Propriétaire     : Josué BEDEL
Date de création : 17/09/2026

*/

export function valeurAffichee(valeur) {
    if (valeur === null || valeur === undefined || valeur === '') return '—'
    return String(valeur)
}

export function formaterDate(valeur) {
    if (!valeur) return '—'
    return new Date(valeur).toLocaleDateString('fr-FR')
}

export function formaterMontant(valeur) {
    if (valeur === null || valeur === undefined || valeur === '') return '—'
    const nombre = Number(valeur)
    if (Number.isNaN(nombre)) return '—'
    return `${nombre.toLocaleString('fr-FR')} FCFA`
}