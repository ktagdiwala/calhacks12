import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { Progress } from './ui/progress';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';
import { CheckCircle, XCircle, ChevronRight } from 'lucide-react';

interface Question {
  id: number;
  topic: string;
  type: 'multiple-choice' | 'fill-blank' | 'calculation';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

const questions: Question[] = [
  {
    id: 1,
    topic: 'Mathematics',
    type: 'multiple-choice',
    question: 'What is the derivative of x²?',
    options: ['x', '2x', 'x²', '2x²'],
    correctAnswer: '2x',
    explanation: 'Using the power rule: d/dx(xⁿ) = n·xⁿ⁻¹, so d/dx(x²) = 2x',
  },
  {
    id: 2,
    topic: 'Physics',
    type: 'fill-blank',
    question: 'The speed of light in vacuum is approximately ___ m/s.',
    correctAnswer: '300000000',
    explanation: 'The speed of light in vacuum is approximately 3 × 10⁸ m/s or 300,000,000 m/s',
  },
  {
    id: 3,
    topic: 'Chemistry',
    type: 'calculation',
    question: 'Calculate the molar mass of H₂O (H=1, O=16)',
    correctAnswer: '18',
    explanation: 'H₂O = 2(1) + 16 = 2 + 16 = 18 g/mol',
  },
];

export function Quiz() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [isCorrect, setIsCorrect] = useState(false);
  const [score, setScore] = useState(0);

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
