import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import FlashCardDetailPage from './pages/FlashCardDetailPage';
// import StudySetPage from './pages/StudySetPage';
import LoginPage from './pages/LoginPage';
import OAuth2RedirectHandler from './pages/OAuth2RedirectHandler';
import ProtectedRoute from './components/ProtectedRoute';

// VocaLearn Figma Pages
import VocaDashboardPage from './pages/vocalearn/VocaDashboardPage';
import VocaClassesPage from './pages/vocalearn/VocaClassesPage';
import VocaFoldersPage from './pages/vocalearn/VocaFoldersPage';
import FolderDetailPage from './pages/vocalearn/FolderDetailPage';
import VocaPathsPage from './pages/vocalearn/VocaPathsPage';
import VocaTrashPage from './pages/vocalearn/VocaTrashPage';
import CreateStudySetPage from './pages/vocalearn/CreateStudySetPage';

import VocaScanDocumentPage from './pages/vocalearn/VocaScanDocumentPage';
import VocaProfilePage from './pages/vocalearn/VocaProfilePage';
import GroupDetailPage from './pages/vocalearn/GroupDetailPage';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        <Route path="/oauth2/redirect" element={<OAuth2RedirectHandler />} />

        {/* Protected Routes */}
        <Route element={<ProtectedRoute />}>
          <Route path="/" element={<VocaDashboardPage />} />
          <Route path="/dashboard" element={<VocaDashboardPage />} />
          <Route path="/classes" element={<VocaClassesPage />} />
          <Route path="/classes/:classId" element={<GroupDetailPage />} />
          <Route path="/study-groups" element={<VocaClassesPage />} />
          <Route path="/study-groups/:groupId" element={<GroupDetailPage />} />
          <Route path="/study_group" element={<VocaClassesPage />} />
          <Route path="/study_group/:groupId" element={<GroupDetailPage />} />
          <Route path="/groups/:groupId" element={<GroupDetailPage />} />
          <Route path="/folders" element={<VocaFoldersPage />} />
          <Route path="/folders/:folderSlug" element={<FolderDetailPage />} />
          <Route path="/folders/:folderSlug/:slug" element={<FlashCardDetailPage />} />
          <Route path="/create-set" element={<CreateStudySetPage />} />
          <Route path="/paths" element={<VocaPathsPage />} />
          <Route path="/scan" element={<VocaScanDocumentPage />} />
          <Route path="/profile" element={<VocaProfilePage />} />
          <Route path="/trash" element={<VocaTrashPage />} />
          {/* <Route path="/studyset" element={<StudySetPage />} /> */}
          <Route path="/studyset/:slug" element={<FlashCardDetailPage />} />
        </Route>

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  );
}

export default App;
