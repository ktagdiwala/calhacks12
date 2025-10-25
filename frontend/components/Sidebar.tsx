import { BookOpen, Upload, Brain, MessageSquare, FileQuestion, LayoutDashboard } from 'lucide-react';
import { PageType } from '../src/App';

interface SidebarProps {
  currentPage: PageType;
  onPageChange: (page: PageType) => void;
}

export function Sidebar({ currentPage, onPageChange }: SidebarProps) {
  const navItems = [
    { id: 'dashboard' as PageType, label: 'Dashboard', icon: LayoutDashboard },
    { id: 'topics' as PageType, label: 'Topics', icon: BookOpen },
    { id: 'upload' as PageType, label: 'Upload Content', icon: Upload },
    { id: 'flashcards' as PageType, label: 'Flashcards', icon: Brain },
    { id: 'quiz' as PageType, label: 'Quiz', icon: FileQuestion },
    { id: 'tutor' as PageType, label: 'Tutor Student', icon: MessageSquare },
  ];

  return (
    <aside className="w-64 bg-white border-r border-slate-200 flex flex-col">
      <div className="p-6">
        <h1 className="text-slate-900">SpaceLearn</h1>
      </div>
      
      <nav className="flex-1 px-3">
        <div className="space-y-1">
          {navItems.map((item) => {
            const Icon = item.icon;
            const isActive = currentPage === item.id;
            
            return (
              <button
                key={item.id}
                onClick={() => onPageChange(item.id)}
                className={`w-full flex items-center gap-3 px-3 py-2 rounded-lg transition-colors ${
                  isActive
                    ? 'bg-blue-50 text-blue-600'
                    : 'text-slate-700 hover:bg-slate-50'
                }`}
              >
                <Icon className="w-5 h-5" />
                <span>{item.label}</span>
              </button>
            );
          })}
        </div>
      </nav>
      
      <div className="p-4 border-t border-slate-200">
        <p className="text-slate-500 text-sm">Daily Notification Active</p>
      </div>
    </aside>
  );
}
