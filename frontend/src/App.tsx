import { useState } from 'react';
import { Sidebar } from '../components/Sidebar';
import { TopicsPage } from '../components/TopicsPage';
import { UploadContent } from '../components/UploadContent';
import { FlashcardsPage } from '../components/FlashcardsPage'
import { QuizPage } from '../components/QuizPage';
import { TutorStudentPage } from '../components/TutorStudentPage';
import { DashboardPage } from '../components/DashboardPage';
import { LoginPage } from '../components/LoginPage';
import { ProfilePage } from './components/ProfilePage';

export type PageType = 'dashboard' | 'topics' | 'upload' | 'flashcards' | 'quiz' | 'tutor' | 'profile';

interface User {
  name: string;
  email: string;
}

export default function App() {
  const [currentPage, setCurrentPage] = useState<PageType>('dashboard');
  const [user, setUser] = useState<User | null>(null);

  const handleLogin = (userData: User) => {
    setUser(userData);
  };

  const handleLogout = () => {
    setUser(null);
    setCurrentPage('dashboard');
  };

  if (!user) {
    return <LoginPage onLogin={handleLogin} />;
  }

  const renderPage = () => {
    switch (currentPage) {
      case 'dashboard':
        return <DashboardPage />;
      case 'topics':
        return <TopicsPage />;
      case 'upload':
        return <UploadContent />;
      case 'flashcards':
        return <FlashcardsPage />;
      case 'quiz':
        return <QuizPage />;
      case 'tutor':
        return <TutorStudentPage />;
      // case 'profile':
      //   return <ProfilePage user={user} onLogout={handleLogout} />;
      default:
        return <DashboardPage />;
    }
  };

  return (
    <div className="flex h-screen bg-slate-50">
      <Sidebar currentPage={currentPage} onPageChange={setCurrentPage} user={user} />
      <main className="flex-1 overflow-y-auto">
        {renderPage()}
      </main>
    </div>
  );
}
