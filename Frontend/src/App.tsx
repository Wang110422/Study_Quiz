import { BrowserRouter, Route, Routes, Navigate } from 'react-router-dom';
import './App.css';
import FlashCardDetailPage from './pages/vocalearn/FlashCardDetailPage';
import LoginPage from './pages/auth/LoginPage';
import OAuth2RedirectHandler from './pages/auth/OAuth2RedirectHandler';
import ProtectedRoute from './components/ProtectedRoute';

// VocaLearn Pages
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
import VocaMockTestPage from './pages/vocalearn/VocaMockTestPage';
import VocaExamsPage from './pages/vocalearn/VocaExamsPage';
import VocaLessonsPage from './pages/vocalearn/VocaLessonsPage';
import ExamPracticeRoomPage from './pages/vocalearn/ExamPracticeRoomPage';
import MockTestOverviewPage from './pages/vocalearn/MockTestOverviewPage';
import MockExamRoomPage from './pages/vocalearn/MockExamRoomPage';
import { AuthProvider } from './store';

// Dedicated Study Mode Pages (Quizlet Style)
import StudyFlashcardsPage from './pages/study/StudyFlashcardsPage';
import StudyLearnPage from './pages/study/StudyLearnPage';
import StudyTestPage from './pages/study/StudyTestPage';
import StudyGrammarPage from './pages/study/StudyGrammarPage';
import StudyReadingPage from './pages/study/StudyReadingPage';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
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

            {/* Overview Study Set Routes */}
            <Route path="/folders/:folderSlug/:slug" element={<FlashCardDetailPage />} />
            <Route path="/studyset/:slug" element={<FlashCardDetailPage />} />

            {/* Dedicated Quizlet-Style Study Mode Pages */}
            <Route path="/folders/:folderSlug/:slug/flashcards" element={<StudyFlashcardsPage />} />
            <Route path="/studyset/:slug/flashcards" element={<StudyFlashcardsPage />} />

            <Route path="/folders/:folderSlug/:slug/learn" element={<StudyLearnPage />} />
            <Route path="/studyset/:slug/learn" element={<StudyLearnPage />} />

            <Route path="/folders/:folderSlug/:slug/test" element={<StudyTestPage />} />
            <Route path="/studyset/:slug/test" element={<StudyTestPage />} />

            <Route path="/folders/:folderSlug/:slug/grammar" element={<StudyGrammarPage />} />
            <Route path="/studyset/:slug/grammar" element={<StudyGrammarPage />} />

            <Route path="/folders/:folderSlug/:slug/reading" element={<StudyReadingPage />} />
            <Route path="/studyset/:slug/reading" element={<StudyReadingPage />} />

            <Route path="/create-set" element={<CreateStudySetPage />} />
            <Route path="/paths" element={<VocaPathsPage />} />
            <Route path="/roadmap" element={<VocaPathsPage />} />
            <Route path="/lessons" element={<VocaLessonsPage />} />
            <Route path="/practice" element={<VocaLessonsPage />} />
            <Route path="/exams" element={<VocaExamsPage />} />
            <Route path="/exams/:examId/practice" element={<ExamPracticeRoomPage />} />
            <Route path="/exam-practice" element={<VocaExamsPage />} />
            <Route path="/mock-test" element={<VocaMockTestPage />} />
            <Route path="/mock-test/:examId" element={<MockTestOverviewPage />} />
            <Route path="/mock-test/:examId/overview" element={<MockTestOverviewPage />} />
            <Route path="/mock-test/:examId/room" element={<MockExamRoomPage />} />
            <Route path="/scan" element={<VocaScanDocumentPage />} />
            <Route path="/profile" element={<VocaProfilePage />} />
            <Route path="/trash" element={<VocaTrashPage />} />
          </Route>

          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
