import { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, RotateCcw } from 'lucide-react';
import { Button } from './ui/button';
import { Flashcard } from './Flashcard';
import { tagsAPI } from '../src/services/api';

interface FlashcardData {
  id: string;
  question: string;
  typeOfQuestion: string;
  confidence: number;
  tagId: number;
  tagName: string;
  daysSinceLastReview?: number;
}

export function FlashcardsPage() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [selectedConfidence, setSelectedConfidence] = useState<number | null>(null);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [flashcards, setFlashcards] = useState<FlashcardData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userId, setUserId] = useState<number | null>(null);

  // Fetch user ID from localStorage (demo mode)
  useEffect(() => {
    const storedUserId = localStorage.getItem('userId');
    if (storedUserId) {
      setUserId(parseInt(storedUserId, 10));
    }
  }, []);

  // Fetch flashcards for the user
  useEffect(() => {
    const fetchFlashcards = async () => {
      if (!userId) return;

      try {
        setLoading(true);
        setError(null);
        const data = await tagsAPI.getQuestionsToShow(userId);
        console.log(data)
        setFlashcards(data.questions || []);
      } catch (err) {
        console.error('Error fetching flashcards:', err);
        setError('Failed to load flashcards. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchFlashcards();
  }, [userId]);

  // Reset submitted state when index changes
  useEffect(() => {
    setIsSubmitted(false);
  }, [currentIndex]);

  const currentCard = flashcards[currentIndex];

  const handleConfidenceSelect = async (level: number, flashcardId: string) => {
    if (!userId) {
      console.error('User ID not found');
      return;
    }

    try {
      setSelectedConfidence(level);
      
      // Post the confidence rating to the backend
      const response = await tagsAPI.submitFlashcardRating(flashcardId, level, userId);
      console.log('Confidence rating submitted:', response);
      
      // Show success state
      setIsSubmitted(true);
      
      // Move to next card after a short delay
      setTimeout(() => {
        if (currentIndex < flashcards.length - 1) {
          setCurrentIndex(currentIndex + 1);
          setSelectedConfidence(null);
          setIsSubmitted(false);
        }
      }, 1500);
    } catch (error) {
      console.error('Error submitting confidence rating:', error);
      setError('Failed to submit confidence rating. Please try again.');
      setSelectedConfidence(null);
    }
  };

  const handlePrevious = () => {
    if (currentIndex > 0) {
      setCurrentIndex(currentIndex - 1);
      setSelectedConfidence(null);
      setIsSubmitted(false);
    }
  };

  const handleNext = () => {
    if (currentIndex < flashcards.length - 1) {
      setCurrentIndex(currentIndex + 1);
      setSelectedConfidence(null);
      setIsSubmitted(false);
    }
  };

  const handleRestart = () => {
    setCurrentIndex(0);
    setSelectedConfidence(null);
    setIsSubmitted(false);
  };

  if (loading) {
    return (
      <div className="p-8">
        <div className="max-w-3xl mx-auto">
          <div className="flex justify-center items-center py-12">
            <p className="text-slate-600">Loading flashcards...</p>
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

  if (flashcards.length === 0) {
    return (
      <div className="p-8">
        <div className="max-w-3xl mx-auto">
          <div className="text-center py-12">
            <p className="text-slate-600">No flashcards available. Create some topics and questions to get started!</p>
          </div>
        </div>
      </div>
    );
  }

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
              Card {currentIndex + 1} of {flashcards.length}
            </span>
            <div className="flex gap-1">
              {flashcards.map((_, index) => (
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

        <Flashcard
          id={currentCard.id}
          topic={currentCard.tagName}
          content={currentCard.question}
          context={currentCard.typeOfQuestion}
          onConfidenceSelect={handleConfidenceSelect}
          selectedConfidence={selectedConfidence}
          isSubmitted={isSubmitted}
        />

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
            disabled={currentIndex === flashcards.length - 1}
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
