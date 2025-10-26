import { useState, useEffect } from 'react';
import { Send, Bot, User } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './ui/card';
import { Button } from './ui/button';
import { Textarea } from './ui/textarea';
import { Badge } from './ui/badge';
import { ScrollArea } from './ui/scroll-area';
import { LettaClient } from "@letta-ai/letta-client";
import { aiAPI } from '../services/api';

interface Message {
  id: string;
  role: 'student' | 'tutor';
  content: string;
  timestamp: Date;
}

export function TutorStudentPage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputValue, setInputValue] = useState('');
  const [currentTopic, setCurrentTopic] = useState('Machine Learning');
  const [isLoading, setIsLoading] = useState(false);

  // Fetch random question on component mount
  useEffect(() => {
    const fetchRandomQuestion = async () => {
      try {
        const question = await aiAPI.getRandomQuestion();
        const initialMessage: Message = {
          id: '1',
          role: 'student',
          content: question.question,
          timestamp: new Date(),
        };
        setMessages([initialMessage]);
        setCurrentTopic(question.tag?.name || 'Machine Learning');
      } catch (error) {
        console.error('Error fetching random question:', error);
        // Fallback message if API fails
        const initialMessage: Message = {
          id: '1',
          role: 'student',
          content: 'Explain the concept of machine learning.',
          timestamp: new Date(),
        };
        setMessages([initialMessage]);
      }
    };

    fetchRandomQuestion();
  }, []);

  const getLettaClient = () => {
    return new LettaClient({
      token: "sk-let-NDM0MmRiMjYtNmU2Ny00ZGExLTgyYmUtOWUxY2M4YzIxYzMwOmUzOTE2NTI5LTYyZGUtNGU4OC1hMTQ2LTI2YzAzODU3YmY3Nw==",
    });
  };

  /** Extract text from Letta's message response */
  const extractLettaResponse = (messages: any[]): string => {
    if (!messages || messages.length === 0) return "";
    
    // Get the last message (most recent response from agent)
    const lastMessage = messages[messages.length - 1];
    
    if (lastMessage?.message) {
      return lastMessage.message;
    }
    
    if (typeof lastMessage === 'string') {
      return lastMessage;
    }
    
    return "I understand. Can you tell me more?";
  };

  const sendToLetta = async (tutorMessage: string): Promise<string> => {
    const client = getLettaClient();
    const agentId = "agent-b4f5ea54-fcb0-49bb-9207-cad7a8965960";

    try {
      const response = await client.agents.messages.create(agentId, {
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: tutorMessage,
              },
            ],
          },
        ],
      });

      // Extract the agent's response text
      const agentResponse = extractLettaResponse(response?.messages || []);
      return agentResponse || "Thank you for explaining that!";
    } catch (err) {
      console.error("Error communicating with Letta agent:", err);
      return "I'm having trouble understanding. Could you rephrase that?";
    }
  };

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading) return;

    // Add tutor message
    const newMessage: Message = {
      id: Date.now().toString(),
      role: 'tutor',
      content: inputValue,
      timestamp: new Date(),
    };

    setMessages([...messages, newMessage]);
    const userInput = inputValue;
    setInputValue('');
    setIsLoading(true);

    try {
      // Get agent response from database
      const agentResponse = await sendToLetta(userInput);

      // Add agent message
      const studentResponse: Message = {
        id: (Date.now() + 1).toString(),
        role: 'student',
        content: agentResponse,
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, studentResponse]);
    } catch (err) {
      console.error("Failed to get agent response:", err);
      // Add error message
      const errorMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'student',
        content:
          "Sorry, I encountered an error. Could you try asking again?",
        timestamp: new Date(),
      };
      setMessages((prev) => [...prev, errorMessage]);
    } finally {
      setIsLoading(false);
    }
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
                      className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${
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
                
                {isLoading && (
                  <div className="flex gap-3">
                    <div className="w-8 h-8 rounded-full flex items-center justify-center shrink-0 bg-purple-100">
                      <Bot className="w-4 h-4 text-purple-600" />
                    </div>
                    <div className="flex-1 max-w-[80%]">
                      <div className="inline-block p-4 rounded-lg bg-slate-100">
                        <div className="flex gap-1">
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce" />
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-100" />
                          <div className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-200" />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
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
                  disabled={isLoading}
                  className="min-h-[60px] resize-none"
                />
                <Button 
                  onClick={handleSend} 
                  disabled={!inputValue.trim() || isLoading} 
                  className="px-4"
                >
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
