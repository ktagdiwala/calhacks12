import { useState } from 'react';
import { Upload, FileText, Image, Video, Link as LinkIcon, Check } from 'lucide-react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from './ui/card';
import { Button } from './ui/button';
import { Input } from './ui/input';
import { Label } from './ui/label';
import { Textarea } from './ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select';
import { Alert, AlertDescription } from './ui/alert';

export function UploadContent() {
  const [selectedTopic, setSelectedTopic] = useState('');
  const [uploadType, setUploadType] = useState<'file' | 'text' | 'link' | null>(null);
  const [textContent, setTextContent] = useState('');
  const [linkUrl, setLinkUrl] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);

  const topics = [
    'Machine Learning',
    'Organic Chemistry',
    'Spanish Vocabulary',
    'Art History',
  ];

  const handleUpload = () => {
    setShowSuccess(true);
    setTimeout(() => {
      setShowSuccess(false);
      setUploadType(null);
      setTextContent('');
      setLinkUrl('');
    }, 2000);
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-slate-900 mb-2">Upload Content</h1>
          <p className="text-slate-600">Add learning materials to your topics</p>
        </div>

        {showSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <Check className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Content uploaded successfully! AI is analyzing your materials...
            </AlertDescription>
          </Alert>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Topic</CardTitle>
            <CardDescription>Choose which topic this content belongs to</CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedTopic} onValueChange={setSelectedTopic}>
              <SelectTrigger>
                <SelectValue placeholder="Select a topic" />
              </SelectTrigger>
              <SelectContent>
                {topics.map((topic) => (
                  <SelectItem key={topic} value={topic}>
                    {topic}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${
              uploadType === 'file' ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setUploadType('file')}
          >
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-slate-900 mb-1">Upload Files</h3>
              <p className="text-slate-600 text-sm">PDFs, images, handwritten notes</p>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${
              uploadType === 'text' ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setUploadType('text')}
          >
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-slate-900 mb-1">Paste Text</h3>
              <p className="text-slate-600 text-sm">Notes, excerpts, definitions</p>
            </CardContent>
          </Card>

          <Card 
            className={`cursor-pointer transition-all hover:shadow-md ${
              uploadType === 'link' ? 'ring-2 ring-blue-500' : ''
            }`}
            onClick={() => setUploadType('link')}
          >
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <LinkIcon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-slate-900 mb-1">Add Link</h3>
              <p className="text-slate-600 text-sm">Videos, articles, resources</p>
            </CardContent>
          </Card>
        </div>

        {uploadType === 'file' && (
          <Card>
            <CardHeader>
              <CardTitle>Upload Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors cursor-pointer">
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 mb-2">Drag and drop files here, or click to browse</p>
                <p className="text-slate-500 text-sm">Supports PDF, PNG, JPG, and other image formats</p>
                <input type="file" className="hidden" multiple accept=".pdf,.png,.jpg,.jpeg" />
              </div>
              <div className="flex justify-end mt-4">
                <Button onClick={handleUpload} disabled={!selectedTopic}>
                  Process Upload
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {uploadType === 'text' && (
          <Card>
            <CardHeader>
              <CardTitle>Paste Text Content</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="text-content">Content</Label>
                  <Textarea
                    id="text-content"
                    placeholder="Paste your notes, definitions, or any text content here..."
                    value={textContent}
                    onChange={(e) => setTextContent(e.target.value)}
                    className="min-h-[200px] mt-2"
                  />
                </div>
                <div className="flex justify-end">
                  <Button onClick={handleUpload} disabled={!selectedTopic || !textContent}>
                    Process Content
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {uploadType === 'link' && (
          <Card>
            <CardHeader>
              <CardTitle>Add Link</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="link-url">URL</Label>
                  <Input
                    id="link-url"
                    type="url"
                    placeholder="https://example.com/article"
                    value={linkUrl}
                    onChange={(e) => setLinkUrl(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <p className="text-slate-600 text-sm">Supports YouTube videos, articles, and web pages</p>
                <div className="flex justify-end">
                  <Button onClick={handleUpload} disabled={!selectedTopic || !linkUrl}>
                    Process Link
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  );
}
