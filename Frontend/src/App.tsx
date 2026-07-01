
import { BrowserRouter, Route, Routes } from 'react-router-dom'
import './App.css'
import FlashCardDetailPage from './pages/FlashCardDetailPage'
import StudySetPage from './pages/StudySetPage'

function App() {

  return (
    <>
      <BrowserRouter>
        <Routes>
          <Route path="/studyset/:slug" element={<FlashCardDetailPage />} />
          <Route path="/studyset" element={<StudySetPage />} />
        </Routes>
      </BrowserRouter>
    </>
  )
}

export default App
