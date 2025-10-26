import { useState } from 'react';
import { Plus, Tag, FileText, Trash2 } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from './ui/dialogue';
import { Label } from './ui/label';
import { Badge } from './ui/badge';

interface Topic {
  id: string;
  name: string;
  description: string;
  itemCount: number;
  color: string;
}

export function TopicsPage() {
  const [topics, setTopics] = useState<Topic[]>([
    { id: '1', name: 'Machine Learning', description: 'Deep learning and neural networks', itemCount: 24, color: 'bg-blue-500' },
    { id: '2', name: 'Organic Chemistry', description: 'Reactions and mechanisms', itemCount: 18, color: 'bg-green-500' },
    { id: '3', name: 'Spanish Vocabulary', description: 'Common phrases and words', itemCount: 156, color: 'bg-yellow-500' },
    { id: '4', name: 'Art History', description: 'Renaissance to Modern', itemCount: 42, color: 'bg-purple-500' },
  ]);
  
  const [newTopicName, setNewTopicName] = useState('');
  const [newTopicDescription, setNewTopicDescription] = useState('');
  const [isDialogOpen, setIsDialogOpen] = useState(false);

  const handleCreateTopic = () => {
    if (newTopicName.trim()) {
      const colors = ['bg-blue-500', 'bg-green-500', 'bg-yellow-500', 'bg-purple-500', 'bg-pink-500', 'bg-indigo-500'];
      const newTopic: Topic = {
        id: Date.now().toString(),
        name: newTopicName,
        description: newTopicDescription,
        itemCount: 0,
        color: colors[Math.floor(Math.random() * colors.length)],
      };
      setTopics([...topics, newTopic]);
      setNewTopicName('');
      setNewTopicDescription('');
      setIsDialogOpen(false);
    }
  };

  const handleDeleteTopic = (id: string) => {
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

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {topics.map((topic) => (
            <Card key={topic.id} className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className={`w-3 h-3 rounded-full ${topic.color}`} />
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
                <CardDescription>{topic.description}</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2 text-slate-600">
                    <FileText className="w-4 h-4" />
                    <span>{topic.itemCount} items</span>
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
      </div>
    </div>
  );
}
