import { useState } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';

interface Message {
  id: string;
  role: 'student' | 'tutor';
  content: string;
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: '1',
    role: 'student',
    content: "Hi! I'm trying to understand neural networks better. Can you explain to me what an activation function is and why we need it?",
    timestamp: new Date(),
  },
];

export function TutorStudentPage() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [currentTopic] = useState('Machine Learning');

  const handleSend = () => {
    if (!inputValue.trim()) return;

    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'tutor',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    setInputValue('');

    setTimeout(() => {
      const studentResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'student',
        content: getStudentResponse(inputValue),
        timestamp: new Date(),
      };
      setMessages(prev => [...prev, studentResponse]);
    }, 1500);
  };

  const getStudentResponse = (tutorMessage: string) => {
    const responses = [
      "That makes sense! So if I understand correctly, the activation function helps the network learn non-linear patterns?",
      "I see! Can you give me an example of when we would use that?",
      "Interesting! What happens if we don't use that approach?",
      "Thanks for explaining! So in summary, would you say that...",
      "That's helpful! How does this relate to what we discussed earlier?",
    ];
    return responses[Math.floor(Math.random() * responses.length)];
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-slate-900 mb-2">Tutor the Student</h1>
          <p className="text-slate-600">Teach concepts to an AI student to reinforce your understanding</p>
        </div>

        <Card className="mb-6">
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>Active Session</CardTitle>
                <CardDescription>Teaching about {currentTopic}</CardDescription>
              </div>
              <Badge variant="secondary" className="gap-2">
                <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
                Active
              </Badge>
            </div>
          </CardHeader>
          <CardContent>
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <p className="text-blue-900 text-sm">
                <strong>Teaching Tip:</strong> Try to explain concepts in your own words. The AI student will ask follow-up questions to help you think deeper about the material.
              </p>
            </div>
          </CardContent>
        </Card>

        <Card className="flex flex-col h-[600px]">
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
          </CardHeader>
          <CardContent className="flex-1 flex flex-col p-0">
            <ScrollArea className="flex-1 px-6">
              <div className="space-y-4 pb-4">
                {messages.map((message) => (
                  <div
                    key={message.id}
                    className={`flex gap-3 ${
                      message.role === 'tutor' ? 'flex-row-reverse' : 'flex-row'
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === 'student'
                          ? 'bg-purple-100'
                          : 'bg-blue-100'
                      }`}
                    >
                      {message.role === 'student' ? (
                        <Bot className="w-4 h-4 text-purple-600" />
                      ) : (
                        <User className="w-4 h-4 text-blue-600" />
                      )}
                    </div>
                    <div
                      className={`flex-1 max-w-[80%] ${
                        message.role === 'tutor' ? 'text-right' : 'text-left'
                      }`}
                    >
                      <div
                        className={`inline-block p-4 rounded-lg ${
                          message.role === 'student'
                            ? 'bg-slate-100 text-slate-900'
                            : 'bg-blue-500 text-white'
                        }`}
                      >
                        <p className="whitespace-pre-wrap">{message.content}</p>
                      </div>
                      <p className="text-xs text-slate-500 mt-1 px-2">
                        {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            <div className="border-t border-slate-200 p-4">
              <div className="flex gap-2">
                <Textarea
                  placeholder="Explain the concept to the student..."
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter' && !e.shiftKey) {
                      e.preventDefault();
                      handleSend();
                    }
                  }}
                  className="min-h-[60px] resize-none"
                />
                <Button onClick={handleSend} disabled={!inputValue.trim()} className="px-4">
                  <Send className="w-4 h-4" />
                </Button>
              </div>
              <p className="text-xs text-slate-500 mt-2">
                Press Enter to send, Shift+Enter for new line
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
