/*

Nom du fichier   : theme.js
Objectif         : Thème MUI aux couleurs de la Mairie du Golfe 1 (vert sidebar, teal header, rouge corail accent) - reprend l'identité visuelle des maquettes Figma validées
Propriétaire     : Josué BEDEL
Date de création : 27/08/2026

*/

import { createTheme } from '@mui/material/styles'

const theme = createTheme({
    palette: {
        primary: {
            main: '#1B7A4D', // vert principal (sidebar, boutons de validation)
            dark: '#134F3A',
            light: '#2E9A68',
            contrastText: '#FFFFFF',
        },
        secondary: {
            main: '#E63946', // rouge corail (boutons d'action : Ajouter, Créer, Signaler)
            dark: '#C0392B',
            light: '#F26E77',
            contrastText: '#FFFFFF',
        },
        info: {
            main: '#1D6D84', // teal du header
            dark: '#154F5C',
        },
        background: {
            default: '#F4F6F5',
            paper: '#FFFFFF',
        },
        text: {
            primary: '#1E2A24',
            secondary: '#5C6B64',
        },
    },

    // Couleurs custom hors palette MUI standard, pour le layout (Sidebar/Navbar)
    custom: {
        sidebar: {
            background: '#1B6B4A',
            backgroundActive: '#134F3A',
            text: '#FFFFFF',
            textMuted: 'rgba(255, 255, 255, 0.7)',
        },
        header: {
            background: '#1D6D84',
            text: '#FFFFFF',
        },
    },

    typography: {
        fontFamily: ['Quicksand', 'Roboto', 'Helvetica', 'Arial', 'sans-serif'].join(','),
        h1: { fontWeight: 700 },
        h2: { fontWeight: 700 },
        h3: { fontWeight: 600 },
        h4: { fontWeight: 600 },
        h5: { fontWeight: 600 },
        h6: { fontWeight: 600 },
        button: { textTransform: 'none', fontWeight: 600 },
    },

    shape: {
        borderRadius: 10,
    },

    components: {
        MuiButton: {
            styleOverrides: {
                root: {
                    borderRadius: 999, // boutons pilule, comme sur les maquettes (Ajouter, Suivant, Créer)
                    paddingLeft: 20,
                    paddingRight: 20,
                },
            },
        },
        MuiPaper: {
            styleOverrides: {
                root: ({ ownerState }) => ({
                    borderRadius: ownerState.square ? 0 : 14,
                }),
            },
        },
        MuiAppBar: {
            styleOverrides: {
                root: {
                    borderRadius: 0,
                },
            },
        },
        MuiChip: {
            styleOverrides: {
                root: {
                    fontWeight: 600,
                    borderRadius: 8,
                },
            },
        },
        MuiTableHead: {
            styleOverrides: {
                root: {
                    backgroundColor: '#1D6D84',
                    '& .MuiTableCell-root': {
                        color: '#FFFFFF',
                        fontWeight: 600,
                    },
                },
            },
        },
    },
})

export default theme