import { useState } from 'react';
import { Check, X, ChevronRight } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Badge } from './ui/badge';
import { RadioGroup, RadioGroupItem } from './ui/radio-group';
import { Label } from './ui/label';

interface Question {
  id: string;
  topic: string;
  type: 'multiple-choice' | 'fill-in-blank' | 'calculation';
  question: string;
  options?: string[];
  correctAnswer: string;
  explanation: string;
}

const mockQuestions: Question[] = [
  {
    id: '1',
    topic: 'Machine Learning',
    type: 'multiple-choice',
    question: 'Which activation function is commonly used in the output layer of a binary classification problem?',
    options: ['ReLU', 'Sigmoid', 'Tanh', 'Softmax'],
    correctAnswer: 'Sigmoid',
    explanation: 'Sigmoid function outputs values between 0 and 1, making it ideal for binary classification problems where we need a probability.',
  },
  {
    id: '2',
    topic: 'Organic Chemistry',
    type: 'fill-in-blank',
    question: 'In an SN2 reaction, the nucleophile attacks from the _____ side of the carbon atom.',
    correctAnswer: 'back',
    explanation: 'The nucleophile must attack from the back side (opposite to the leaving group) to cause the characteristic inversion of configuration.',
  },
  {
    id: '3',
    topic: 'Machine Learning',
    type: 'calculation',
    question: 'If a neural network has an input layer with 10 neurons and a hidden layer with 5 neurons, how many weights are needed to connect these two layers?',
    correctAnswer: '50',
    explanation: 'Each of the 10 input neurons connects to each of the 5 hidden neurons: 10 × 5 = 50 weights.',
  },
];

export function QuizPage() {
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [selectedAnswer, setSelectedAnswer] = useState('');
  const [userAnswer, setUserAnswer] = useState('');
  const [showResult, setShowResult] = useState(false);
  const [score, setScore] = useState(0);

  const currentQuestion = mockQuestions[currentQuestionIndex];
  const isCorrect = showResult && (
    (currentQuestion.type === 'multiple-choice' && selectedAnswer === currentQuestion.correctAnswer) ||
    (currentQuestion.type !== 'multiple-choice' && userAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase())
  );

  const handleSubmit = () => {
    const answerIsCorrect = (
      (currentQuestion.type === 'multiple-choice' && selectedAnswer === currentQuestion.correctAnswer) ||
      (currentQuestion.type !== 'multiple-choice' && userAnswer.toLowerCase().trim() === currentQuestion.correctAnswer.toLowerCase())
    );
    
    setShowResult(true);
    if (answerIsCorrect) {
      setScore(score + 1);
    }
  };

  const handleNext = () => {
    if (currentQuestionIndex < mockQuestions.length - 1) {
      setCurrentQuestionIndex(currentQuestionIndex + 1);
      setSelectedAnswer('');
      setUserAnswer('');
      setShowResult(false);
    }
  };

  const renderQuestionInput = () => {
    if (currentQuestion.type === 'multiple-choice' && currentQuestion.options) {
      return (
        <RadioGroup value={selectedAnswer} onValueChange={setSelectedAnswer}>
          <div className="space-y-3">
            {currentQuestion.options.map((option, index) => (
              <div
                key={index}
                className={`flex items-center space-x-2 p-4 rounded-lg border-2 transition-colors ${
                  showResult
                    ? option === currentQuestion.correctAnswer
                      ? 'border-green-500 bg-green-50'
                      : option === selectedAnswer
                      ? 'border-red-500 bg-red-50'
                      : 'border-slate-200'
                    : selectedAnswer === option
                    ? 'border-blue-500 bg-blue-50'
                    : 'border-slate-200 hover:border-slate-300'
                }`}
              >
                <RadioGroupItem value={option} id={option} disabled={showResult} />
                <Label htmlFor={option} className="flex-1 cursor-pointer">
                  {option}
                </Label>
                {showResult && option === currentQuestion.correctAnswer && (
                  <Check className="w-5 h-5 text-green-600" />
                )}
                {showResult && option === selectedAnswer && option !== currentQuestion.correctAnswer && (
                  <X className="w-5 h-5 text-red-600" />
                )}
              </div>
            ))}
          </div>
        </RadioGroup>
      );
    }

    return (
      <div className="space-y-2">
        <Input
          type={currentQuestion.type === 'calculation' ? 'number' : 'text'}
          placeholder="Type your answer here..."
          value={userAnswer}
          onChange={(e) => setUserAnswer(e.target.value)}
          disabled={showResult}
          className={
            showResult
              ? isCorrect
                ? 'border-green-500 bg-green-50'
                : 'border-red-500 bg-red-50'
              : ''
          }
        />
        {showResult && !isCorrect && (
          <p className="text-slate-600">
            Correct answer: <span className="text-green-600">{currentQuestion.correctAnswer}</span>
          </p>
        )}
      </div>
    );
  };

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-slate-900 mb-2">Today's Quiz</h1>
          <p className="text-slate-600">Test your knowledge with these questions</p>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-slate-600">
              Question {currentQuestionIndex + 1} of {mockQuestions.length}
            </span>
          </div>
          <div className="flex items-center gap-2">
            <span className="text-slate-600">Score:</span>
            <Badge variant="secondary">{score}/{currentQuestionIndex + (showResult ? 1 : 0)}</Badge>
          </div>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between mb-4">
              <Badge variant="secondary">{currentQuestion.topic}</Badge>
              <Badge>
                {currentQuestion.type === 'multiple-choice' && 'Multiple Choice'}
                {currentQuestion.type === 'fill-in-blank' && 'Fill in the Blank'}
                {currentQuestion.type === 'calculation' && 'Calculation'}
              </Badge>
            </div>
            <CardTitle className="text-slate-900">{currentQuestion.question}</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {renderQuestionInput()}

            {showResult && (
              <div className={`p-4 rounded-lg ${isCorrect ? 'bg-green-50' : 'bg-blue-50'}`}>
                <div className="flex items-start gap-3">
                  {isCorrect ? (
                    <div className="w-6 h-6 rounded-full bg-green-500 flex items-center justify-center flex-shrink-0 mt-0.5">
                      <Check className="w-4 h-4 text-white" />
                    </div>
                  ) : (
                    <div className="w-6 h-6 rounded-full bg-blue-500 flex items-center justify-center flex-shrink-0 mt-0.5 text-white text-xs">
                      i
                    </div>
                  )}
                  <div>
                    <p className={isCorrect ? 'text-green-900' : 'text-blue-900'}>
                      {isCorrect ? 'Correct!' : 'Explanation:'}
                    </p>
                    <p className={`text-sm mt-1 ${isCorrect ? 'text-green-700' : 'text-blue-700'}`}>
                      {currentQuestion.explanation}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-end gap-2">
              {!showResult ? (
                <Button
                  onClick={handleSubmit}
                  disabled={
                    (currentQuestion.type === 'multiple-choice' && !selectedAnswer) ||
                    (currentQuestion.type !== 'multiple-choice' && !userAnswer)
                  }
                >
                  Submit Answer
                </Button>
              ) : (
                <Button
                  onClick={handleNext}
                  disabled={currentQuestionIndex === mockQuestions.length - 1}
                  className="gap-2"
                >
                  Next Question
                  <ChevronRight className="w-4 h-4" />
                </Button>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
