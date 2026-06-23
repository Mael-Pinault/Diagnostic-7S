import { BrowserRouter, Routes, Route } from 'react-router-dom'
import Home             from './pages/Home'
import Questionnaire    from './pages/Questionnaire'
import Resultats        from './pages/Resultats'
import SessionCreer     from './pages/SessionCreer'
import SessionJoin      from './pages/SessionJoin'
import ResultatsSession from './pages/ResultatsSession'
import MesSessions      from './pages/MesSessions'
import Analyser         from './pages/Analyser'
import FeuilleDeRoute   from './pages/FeuilleDeRoute'
import Cadrage          from './pages/Cadrage'

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/"                          element={<Home />} />
        <Route path="/questionnaire"             element={<Questionnaire />} />
        <Route path="/resultats"                 element={<Resultats />} />
        <Route path="/creer-session"             element={<SessionCreer />} />
        <Route path="/session/:code"             element={<SessionJoin />} />
        <Route path="/resultats-session/:code"   element={<ResultatsSession />} />
        <Route path="/mes-sessions"              element={<MesSessions />} />
        <Route path="/analyser"                  element={<Analyser />} />
        <Route path="/feuille-de-route/:code"    element={<FeuilleDeRoute />} />
        <Route path="/cadrage/:code"             element={<Cadrage />} />
      </Routes>
    </BrowserRouter>
  )
}
