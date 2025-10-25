import { useState } from 'react';
import { DashboardPage } from '../components/DashboardPage';
import { Sidebar } from '../components/Sidebar';
// import { TopicsPage } from './components/TopicsPage';
// import { UploadContent } from './components/UploadContent';
// import { FlashcardsPage } from './components/FlashcardsPage';
// import { QuizPage } from './components/QuizPage';
// import { TutorStudentPage } from './components/TutorStudentPage';
// import { DashboardPage } from './components/DashboardPage';

export type PageType = 'dashboard' | 'topics' | 'upload' | 'flashcards' | 'quiz' | 'tutor';

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      // case 'topics':
      //   return <TopicsPage />;
      // case 'upload':
      //   return <UploadContent />;
      // case 'flashcards':
      //   return <FlashcardsPage />;
      // case 'quiz':
      //   return <QuizPage />;
      // case 'tutor':
      //   return <TutorStudentPage />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} />
      <main className="flex-1 overflow-y-auto">
        {renderPage()}
      </main>
    </div>
  );
}