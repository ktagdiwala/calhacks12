import { Card, CardContent, CardHeader } from './ui/card';
import { Button } from './ui/button';
import { Badge } from './ui/badge';
import { Check } from 'lucide-react';

export interface FlashcardProps {
  id: string;
  topic: string;
  content: string;
  context: string;
  onConfidenceSelect: (level: number, flashcardId: string) => void;
  selectedConfidence: number | null;
  isSubmitted?: boolean;
}

const confidenceLevels = [
  { level: 1, label: 'Not Confident', color: 'bg-red-500 hover:bg-red-600' },
  { level: 2, label: 'Somewhat Confident', color: 'bg-orange-500 hover:bg-orange-600' },
  { level: 3, label: 'Confident', color: 'bg-yellow-500 hover:bg-yellow-600' },
  { level: 4, label: 'Very Confident', color: 'bg-green-500 hover:bg-green-600' },
];

export function Flashcard({
  id,
  topic,
  content,
  context,
  onConfidenceSelect,
  selectedConfidence,
  isSubmitted = false,
}: FlashcardProps) {
  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <Badge variant="secondary">{topic}</Badge>
            <span className="text-slate-500 text-sm">{context}</span>
          </div>
        </CardHeader>
        <CardContent className="pt-6">
          <div className="bg-slate-50 rounded-lg p-8 min-h-[200px] flex items-center justify-center">
            <p className="text-slate-700 text-center leading-relaxed">
              {content}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <h3 className="text-lg font-semibold">How confident do you feel about this information?</h3>
        </CardHeader>
        <CardContent>
          {isSubmitted && (
            <div className="mb-4 flex items-center justify-center gap-2 p-3 bg-green-50 border border-green-200 rounded-lg">
              <Check className="w-5 h-5 text-green-600" />
              <span className="text-green-700 font-medium">Response recorded successfully!</span>
            </div>
          )}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            {confidenceLevels.map((item) => (
              <Button
                key={item.level}
                onClick={() => onConfidenceSelect(item.level, id)}
                disabled={isSubmitted}
                className={`${item.color} text-white h-auto py-4 flex flex-col gap-1 relative ${
                  selectedConfidence === item.level ? 'ring-2 ring-offset-2 ring-slate-900' : ''
                } ${isSubmitted ? 'opacity-50 cursor-not-allowed' : ''}`}
              >
                <span>{item.level}</span>
                <span className="text-xs opacity-90">{item.label}</span>
                {isSubmitted && selectedConfidence === item.level && (
                  <Check className="absolute top-1 right-1 w-4 h-4 text-green-300" />
                )}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
