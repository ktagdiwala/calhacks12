import { useState, useEffect } from 'react';
import { Plus, Tag, FileText, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialogue';
import { Label } from './ui/label';
import { Badge } from './ui/badge';
import { tagsAPI } from '../src/services/api';

interface Topic {
  id: number;
  name: string;
  description: string | null;
  userId: number;
  quizQuestions?: any[];
  flashcards?: any[];
}

export function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([]);
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicDescription, setNewTopicDescription] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);
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

  // Fetch tags for the user
  useEffect(() => {
    const fetchTags = async () => {
      if (!userId) return;
      
      try {
        setLoading(true);
        setError(null);
        const data = await tagsAPI.getTagsByUserId(userId);
        setTopics(data);
      } catch (err) {
        console.error('Error fetching tags:', err);
        setError('Failed to load topics. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    fetchTags();
  }, [userId]);

  const handleCreateTopic = async () => {
    if (!newTopicName.trim() || !userId) return;

    try {
      const newTopic = await tagsAPI.createTag({
        name: newTopicName,
        description: newTopicDescription || undefined,
        userId,
      });
      setTopics([...topics, newTopic.tag]);
      setNewTopicName('');
      setNewTopicDescription('');
      setIsDialogOpen(false);
    } catch (err) {
      console.error('Error creating topic:', err);
      setError('Failed to create topic. Please try again.');
    }
  };

  const handleDeleteTopic = (id: number) => {
    setTopics(topics.filter(topic => topic.id !== id));
  };

  return (
    <div className="p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-slate-900 mb-2">Topics & Tags</h1>
            <p className="text-slate-600">Organize your learning content into topics</p>
          </div>
          
          <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
            <DialogTrigger asChild>
              <Button className="gap-2">
                <Plus className="w-4 h-4" />
                New Topic
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Topic</DialogTitle>
                <DialogDescription>
                  Add a new topic to organize your learning materials
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Topic Name</Label>
                  <Input
                    id="name"
                    placeholder="e.g., Machine Learning"
                    value={newTopicName}
                    onChange={(e) => setNewTopicName(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="description">Description</Label>
                  <Input
                    id="description"
                    placeholder="Brief description of this topic"
                    value={newTopicDescription}
                    onChange={(e) => setNewTopicDescription(e.target.value)}
                  />
                </div>
              </div>
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setIsDialogOpen(false)}>
                  Cancel
                </Button>
                <Button onClick={handleCreateTopic}>
                  Create Topic
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-md text-red-800">
            {error}
          </div>
        )}

        {loading ? (
          <div className="flex justify-center items-center py-12">
            <p className="text-slate-600">Loading topics...</p>
          </div>
        ) : topics.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-slate-600 mb-4">No topics yet. Create one to get started!</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {topics.map((topic) => (
              <Card key={topic.id} className="hover:shadow-lg transition-shadow">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <Tag className="w-5 h-5 text-slate-400" />
                      <CardTitle>{topic.name}</CardTitle>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleDeleteTopic(topic.id)}
                      className="h-8 w-8 p-0"
                    >
                      <Trash2 className="w-4 h-4 text-slate-400 hover:text-red-500" />
                    </Button>
                  </div>
                  <CardDescription>{topic.description || 'No description'}</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 text-slate-600">
                      <FileText className="w-4 h-4" />
                      <span>{(topic.quizQuestions?.length || 0) + (topic.flashcards?.length || 0)} items</span>
                    </div>
                    <Badge variant="secondary">
                      <Tag className="w-3 h-3 mr-1" />
                      Active
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
