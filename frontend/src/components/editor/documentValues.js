/*
Nom du fichier   : documentValues.js
Date de mise à jour : 19/09/2026
Objet de mise à jour : Ajout de construireNomFichierParDefaut(), utilisee
                       par la boite de dialogue de nommage a l'export.
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

function nettoyerPourNomFichier(valeur) {
    if (!valeur || valeur === '—') return ''
    return String(valeur).trim()
}

export function construireNomFichierParDefaut(donneesEditees = {}) {
    const nom = nettoyerPourNomFichier(donneesEditees.nom) || 'Equipement'

    const localisation = [
        donneesEditees['localisation.annexe'],
        donneesEditees['localisation.service'],
        donneesEditees['localisation.bureau'],
        donneesEditees['localisation.poste'],
    ]
        .map(nettoyerPourNomFichier)
        .filter(Boolean)
        .join(' - ') || 'Non localise'

    return `Fiche D'Equipement ${nom},${localisation}`
}