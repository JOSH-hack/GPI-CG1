/*

Nom du fichier   : App.jsx
Objectif         : Point d'entree de l'arbre de routage - englobe AppRoutes dans BrowserRouter
Propriétaire     : Josué BEDEL
Date de création : 30/08/2026

*/

import { BrowserRouter } from 'react-router-dom'
import AppRoutes from './routes/AppRoutes'
import { AuthProvider } from './contexts/AuthContext'

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}

export default App