/*

Nom du fichier   : QRCodeDisplay.jsx
Objectif         : Affichage du QR code d'un equipement (encode le code_inventaire), avec bouton d'impression, utilise sur la fiche detaillee equipement
Propriétaire     : Josué BEDEL
Date de création : 29/08/2026

*/

import { useRef } from 'react'
import { Box, Typography, Button } from '@mui/material'
import PrintIcon from '@mui/icons-material/Print'
import { QRCodeSVG } from 'qrcode.react'

export default function QRCodeDisplay({ codeInventaire, taille = 160 }) {
    const zoneImpressionRef = useRef(null)

    function imprimer() {
        const contenu = zoneImpressionRef.current.innerHTML
        const fenetre = window.open('', '_blank')

        fenetre.document.write(`
      <html>
        <head>
          <title>QR Code - ${codeInventaire}</title>
        </head>
        <body style="display: flex; flex-direction: column; align-items: center; justify-content: center; height: 100vh; font-family: sans-serif;">
          ${contenu}
        </body>
      </html>
    `)

        fenetre.document.close()
        fenetre.focus()
        fenetre.print()
        fenetre.close()
    }

    return (
        <Box sx={{ textAlign: 'center' }}>
            <Box ref={zoneImpressionRef}>
                <QRCodeSVG value={codeInventaire} size={taille} />
                <Typography variant="body2" sx={{ mt: 1, fontWeight: 600 }}>
                    {codeInventaire}
                </Typography>
            </Box>

            <Button
                variant="outlined"
                size="small"
                startIcon={<PrintIcon />}
                onClick={imprimer}
                sx={{ mt: 2 }}
            >
                Imprimer
            </Button>
        </Box>
    )
}