/*

Nom du fichier   : App.jsx
Objectif         : Point d'entree de l'arbre de routage - englobe AppRoutes dans BrowserRouter,
                    et applique le theme MUI global (Quicksand, couleurs Mairie) via ThemeProvider
Propriétaire     : Josué BEDEL
Date de création : 30/08/2026
Date de mise à jour : 02/09/2026
Objet de mise à jour : Branchement du theme MUI (theme.js existait mais n'etait jamais applique)

*/

import { BrowserRouter } from 'react-router-dom'
import { ThemeProvider, CssBaseline } from '@mui/material'
import AppRoutes from './routes/AppRoutes'
import { AuthProvider } from './contexts/AuthContext'
import theme from './theme/theme'

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <BrowserRouter>
        <AuthProvider>
          <AppRoutes />
        </AuthProvider>
      </BrowserRouter>
    </ThemeProvider>
  )
}

export default App