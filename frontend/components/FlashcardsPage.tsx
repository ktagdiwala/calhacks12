import { useState } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';

interface Flashcard {
  id: string;
  topic: string;
  content: string;
  context: string;
}

const mockFlashcards: Flashcard[] = [
  {
    id: '1',
    topic: 'Machine Learning',
    content: 'A neural network is a series of algorithms that attempts to recognize underlying relationships in a set of data through a process that mimics the way the human brain operates.',
    context: 'Deep Learning Fundamentals',
  },
  {
    id: '2',
    topic: 'Organic Chemistry',
    content: 'The SN2 reaction is a type of nucleophilic substitution where the nucleophile attacks the carbon atom from the back side, causing a simultaneous departure of the leaving group.',
    context: 'Nucleophilic Substitution Reactions',
  },
  {
    id: '3',
    topic: 'Spanish Vocabulary',
    content: 'El desayuno - breakfast. Common phrase: "¿Qué quieres para el desayuno?" (What do you want for breakfast?)',
    context: 'Daily Routines Vocabulary',
  },
];

export function FlashcardsPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedConfidence, setSelectedConfidence] = useState<number | null>(null);

  const currentCard = mockFlashcards[currentIndex];

  const handleConfidenceSelect = (level: number) => {
    setSelectedConfidence(level);
    setTimeout(() => {
      if (currentIndex < mockFlashcards.length - 1) {
        setCurrentIndex(currentIndex + 1);
        setSelectedConfidence(null);
      }
    }, 500);
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedConfidence(null);
    }
  };

  const handleNext = () => {
    if (currentIndex < mockFlashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedConfidence(null);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedConfidence(null);
  };

  const confidenceLevels = [
    { level: 1, label: 'Not Confident', color: 'bg-red-500 hover:bg-red-600' },
    { level: 2, label: 'Somewhat Confident', color: 'bg-orange-500 hover:bg-orange-600' },
    { level: 3, label: 'Confident', color: 'bg-yellow-500 hover:bg-yellow-600' },
    { level: 4, label: 'Very Confident', color: 'bg-green-500 hover:bg-green-600' },
  ];

  return (
    <div className="p-8">
      <div className="max-w-3xl mx-auto">
        <div className="mb-8">
          <h1 className="text-slate-900 mb-2">Today's Flashcards</h1>
          <p className="text-slate-600">Review and rate your confidence level</p>
        </div>

        <div className="mb-6 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-slate-600">
              Card {currentIndex + 1} of {mockFlashcards.length}
            </span>
            <div className="flex gap-1">
              {mockFlashcards.map((_, index) => (
                <div
                  key={index}
                  className={`w-2 h-2 rounded-full ${
                    index === currentIndex ? 'bg-blue-500' : 'bg-slate-300'
                  }`}
                />
              ))}
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleRestart} className="gap-2">
            <RotateCcw className="w-4 h-4" />
            Restart
          </Button>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <Badge variant="secondary">{currentCard.topic}</Badge>
              <span className="text-slate-500 text-sm">{currentCard.context}</span>
            </div>
          </CardHeader>
          <CardContent className="pt-6">
            <div className="bg-slate-50 rounded-lg p-8 min-h-[200px] flex items-center justify-center">
              <p className="text-slate-700 text-center leading-relaxed">
                {currentCard.content}
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>How confident do you feel about this information?</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
              {confidenceLevels.map((item) => (
                <Button
                  key={item.level}
                  onClick={() => handleConfidenceSelect(item.level)}
                  className={`${item.color} text-white h-auto py-4 flex flex-col gap-1 ${
                    selectedConfidence === item.level ? 'ring-2 ring-offset-2 ring-slate-900' : ''
                  }`}
                >
                  <span>{item.level}</span>
                  <span className="text-xs opacity-90">{item.label}</span>
                </Button>
              ))}
            </div>
          </CardContent>
        </Card>

        <div className="flex items-center justify-between mt-6">
          <Button
            variant="outline"
            onClick={handlePrevious}
            disabled={currentIndex === 0}
            className="gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Previous
          </Button>
          <Button
            variant="outline"
            onClick={handleNext}
            disabled={currentIndex === mockFlashcards.length - 1}
            className="gap-2"
          >
            Next
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
