import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { Avatar, AvatarFallback } from './ui/avatar';
import { Send, Bot, User } from 'lucide-react';
import { ScrollArea } from './ui/scroll-area';

interface Message {
  id: number;
  sender: 'student' | 'user';
  content: string;
  timestamp: Date;
}

const initialMessages: Message[] = [
  {
    id: 1,
    sender: 'student',
    content: 'Hi! I\'m an AI student learning about Mathematics. Can you explain the Pythagorean Theorem to me? I want to understand when and why we use it.',
    timestamp: new Date(),
  },
];

const studentResponses = [
  'Thanks! That makes sense. Can you give me an example of how to apply it?',
  'I see! So if I have a triangle with sides 3 and 4, the hypotenuse would be 5, right?',
  'That\'s helpful! One more question - why does this only work for right-angled triangles?',
  'Great explanation! I understand now. This will be really useful for solving geometry problems.',
];

export function TutorStudent() {
  const [messages, setMessages] = useState<Message[]>(initialMessages);
  const [inputValue, setInputValue] = useState('');
  const [responseCount, setResponseCount] = useState(0);

  const handleSend = () => {
    if (!inputValue.trim()) return;

    // Add user message
    const userMessage: Message = {
      id: messages.length + 1,
      sender: 'user',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages([...messages, userMessage]);
    setInputValue('');

    // Simulate student response after a delay
    if (responseCount < studentResponses.length) {
      setTimeout(() => {
        const studentMessage: Message = {
          id: messages.length + 2,
          sender: 'student',
          content: studentResponses[responseCount],
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, studentMessage]);
        setResponseCount(responseCount + 1);
      }, 1500);
    } else {
      setTimeout(() => {
        const studentMessage: Message = {
          id: messages.length + 2,
          sender: 'student',
          content: 'Thank you so much for teaching me! I feel much more confident about this topic now. 🎓',
          timestamp: new Date(),
        };
        setMessages(prev => [...prev, studentMessage]);
      }, 1500);
    }
  };

  return (
    <div className="space-y-6 mt-6">
      <Card className="bg-purple-50 border-purple-200">
        <CardHeader>
          <div className="flex items-center gap-3">
            <Avatar>
              <AvatarFallback className="bg-purple-500 text-white">
                <Bot className="w-5 h-5" />
              </AvatarFallback>
            </Avatar>
            <div>
              <CardTitle>AI Student</CardTitle>
              <Badge variant="secondary" className="mt-1">Mathematics</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <p className="text-slate-700">
            Teach this AI student to reinforce your own understanding. Explaining concepts helps solidify your knowledge!
          </p>
        </CardContent>
      </Card>

      <Card className="h-[500px] flex flex-col">
        <ScrollArea className="flex-1 p-4">
          <div className="space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex gap-3 ${
                  message.sender === 'user' ? 'flex-row-reverse' : 'flex-row'
                }`}
              >
                <Avatar className="w-8 h-8">
                  <AvatarFallback className={
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-purple-500 text-white'
                  }>
                    {message.sender === 'user' ? (
                      <User className="w-4 h-4" />
                    ) : (
                      <Bot className="w-4 h-4" />
                    )}
                  </AvatarFallback>
                </Avatar>
                <div
                  className={`flex-1 max-w-[80%] rounded-lg p-4 ${
                    message.sender === 'user'
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-100 text-slate-900'
                  }`}
                >
                  <p>{message.content}</p>
                  <p
                    className={`mt-2 ${
                      message.sender === 'user'
                        ? 'text-blue-100'
                        : 'text-slate-500'
                    }`}
                  >
                    {message.timestamp.toLocaleTimeString([], {
                      hour: '2-digit',
                      minute: '2-digit',
                    })}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </ScrollArea>

        <div className="border-t p-4">
          <div className="flex gap-2">
            <Textarea
              placeholder="Explain the concept to the student..."
              value={inputValue}
              onChange={(e) => setInputValue(e.target.value)}
              onKeyPress={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              className="resize-none"
              rows={2}
            />
            <Button onClick={handleSend} size="icon" className="h-auto">
              <Send className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </Card>
    </div>
  );
}
