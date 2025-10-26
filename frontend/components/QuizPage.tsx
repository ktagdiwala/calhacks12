import { Quiz } from './Quiz';

export function QuizPage() {
  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-slate-900 mb-2">Today's Quiz</h1>
          <p className="text-slate-600">Test your knowledge with these questions</p>
        </div>
        <Quiz />
      </div>
    </div>
  );
}
