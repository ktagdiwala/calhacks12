import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { CheckCircle, XCircle, ChevronRight } from 'lucide-react';
import { tagsAPI } from '../src/services/api';

interface Question {
  id: number;
  topic: string;
  type: string;
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

export function Quiz() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  // Fetch user ID from localStorage
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(parseInt(storedUserId, 10));
    }
  }, []);

  // Fetch quiz questions for the user
  useEffect(() => {
    const fetchQuestions = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        setError(null);
        const data = await tagsAPI.getQuestionsToShow(userId);
        
        // Filter only quiz questions (not flashcards) and map to Question format
        const quizQuestions = (data.questions || [])
          .filter((q: any) => q.typeOfQuestion !== 'FLASHCARD')
          .map((q: any) => ({
            id: q.id,
            topic: q.tagName,
            type: q.typeOfQuestion || 'MULTIPLE_CHOICE',
            question: q.question,
            options: q.options || [],
            correctAnswer: q.correctAnswer || '',
            explanation: q.explanation || 'No explanation provided',
          }));
        console.log("Fetched quiz questions:", quizQuestions);
        setQuestions(quizQuestions);
      } catch (err) {
        console.error('Error fetching quiz questions:', err);
        setError('Failed to load quiz questions. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchQuestions();
  }, [userId]);

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center items-center py-12">
            <p className="text-slate-600">Loading quiz questions...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8">
        <div className="max-w-3xl mx-auto">
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
            {error}
          </div>
        </div>
      </div>
    );
  }

  if (questions.length === 0) {
    return (
      <div className="p-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center py-12">
            <p className="text-slate-600">No quiz questions available. Create some topics and questions to get started!</p>
          </div>
        </div>
      </div>
    );
  }

  const currentQuestion = questions[currentIndex];
  const progress = ((currentIndex + 1) / questions.length) * 100;

  const checkAnswer = () => {
    const correct = userAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase().trim();
    setIsCorrect(correct);
    setShowResult(true);
    if (correct) {
      setScore(score + 1);
    }
  };

  const nextQuestion = () => {
    if (currentIndex < questions.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setUserAnswer('');
      setShowResult(false);
    }
  };

  const renderQuestionInput = () => {
    switch (currentQuestion.type) {
      case 'MULTIPLE_CHOICE':
      case 'multiple-choice':
        return (
          <RadioGroup value={userAnswer} onValueChange={setUserAnswer}>
            <div className="space-y-3">
              {currentQuestion.options?.map((option) => (
                <div key={option} className="flex items-center space-x-2 border rounded-lg p-4 hover:bg-slate-50">
                  <RadioGroupItem value={option} id={option} />
                  <Label htmlFor={option} className="flex-1 cursor-pointer">
                    {option}
                  </Label>
                </div>
              ))}
            </div>
          </RadioGroup>
        );
      
      case 'FILL_IN_BLANK':
      case 'EXPLAIN_PROMPT':
      case 'fill-blank':
      case 'calculation':
        return (
          <Input
            placeholder="Type your answer..."
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="text-lg p-6"
            disabled={showResult}
          />
        );
      
      default:
        return (
          <Input
            placeholder="Type your answer..."
            value={userAnswer}
            onChange={(e) => setUserAnswer(e.target.value)}
            className="text-lg p-6"
            disabled={showResult}
          />
        );
    }
  };

  return (
    <div className="space-y-6 mt-6">
      <div className="flex items-center justify-between">
        <div>
          <p className="text-slate-600">
            Question {currentIndex + 1} of {questions.length}
          </p>
          <Badge className="mt-1">{currentQuestion.topic}</Badge>
        </div>
        <div className="text-right">
          <p className="text-slate-600">Score</p>
          <p className="text-slate-900">{score} / {currentIndex + (showResult ? 1 : 0)}</p>
        </div>
      </div>

      <Progress value={progress} />

      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <Badge variant="outline" className="capitalize">
              {currentQuestion.type.replace('-', ' ')}
            </Badge>
          </div>
          <CardTitle className="mt-4">{currentQuestion.question}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {renderQuestionInput()}

          {!showResult ? (
            <Button
              onClick={checkAnswer}
              disabled={!userAnswer}
              className="w-full"
              size="lg"
            >
              Submit Answer
            </Button>
          ) : (
            <div className="space-y-4">
              <div className={`p-4 rounded-lg border-2 ${
                isCorrect
                  ? 'bg-green-50 border-green-300'
                  : 'bg-red-50 border-red-300'
              }`}>
                <div className="flex items-center gap-2 mb-2">
                  {isCorrect ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-600" />
                      <p className="text-green-900">Correct!</p>
                    </>
                  ) : (
                    <>
                      <XCircle className="w-5 h-5 text-red-600" />
                      <p className="text-red-900">Incorrect</p>
                    </>
                  )}
                </div>
                <p className="text-slate-700">{currentQuestion.explanation}</p>
                {!isCorrect && (
                  <p className="text-slate-700 mt-2">
                    Correct answer: <span className="text-slate-900">{currentQuestion.correctAnswer}</span>
                  </p>
                )}
              </div>

              {currentIndex < questions.length - 1 ? (
                <Button onClick={nextQuestion} className="w-full" size="lg">
                  Next Question
                  <ChevronRight className="w-4 h-4 ml-2" />
                </Button>
              ) : (
                <div className="text-center p-6 bg-blue-50 rounded-lg">
                  <p className="text-blue-900 mb-2">Quiz Complete!</p>
                  <p className="text-blue-700">
                    Final Score: {score} / {questions.length} ({Math.round((score / questions.length) * 100)}%)
                  </p>
                </div>
              )}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
