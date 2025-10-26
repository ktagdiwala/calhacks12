import { useState, useEffect } from "react";
import {
  Upload,
  FileText,
  Link as LinkIcon,
  Check,
  Loader,
} from "lucide-react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "./ui/card";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { Label } from "./ui/label";
import { Textarea } from "./ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "./ui/select";
import { Alert, AlertDescription } from "./ui/alert";
import { LettaClient } from "@letta-ai/letta-client";
import { aiAPI, tagsAPI } from "../src/services/api";

/* =========================================
   Types & Utils (no UI changes required)
========================================= */

type QuestionType = "FILL_IN_BLANK" | "MULTIPLE_CHOICE";

type QuizQuestion = {
  question: string;
  correctAnswer: string;
  type: QuestionType;
  explanation: string;
  options: [string, string, string, string];
  tagId: number;
  // allow passthrough fields if Letta adds more
  [k: string]: any;
};

type Flashcard = {
  term?: string;
  definition?: string;
  tagId?: number;
  [k: string]: any;
};

type OutputStructure = {
  topic: string;
  content_type: string;
  quiz_questions: any[]; // raw from Letta; we will coerce to QuizQuestion
  flashcards: any[];
};

/** Extract JSON object from Letta message response */
function extractJsonFromLetta(messages: any[]): any {
  if (!Array.isArray(messages) || messages.length === 0) {
    return null;
  }

  // Letta typically returns messages as an array; get the last one
  const lastMessage = messages[messages.length - 1];
  
  // Try to extract JSON from message text
  const messageText = lastMessage?.message || lastMessage?.content || String(lastMessage);
  
  // Find JSON object in the text (between first { and last })
  const jsonMatch = messageText.match(/\{[\s\S]*\}/);
  if (!jsonMatch) {
    console.warn("No JSON found in Letta response");
    return null;
  }

  try {
    return JSON.parse(jsonMatch[0]);
  } catch (e) {
    console.error("Failed to parse JSON from Letta:", e);
    return null;
  }
}

/** Ensure the expected top-level shape even if Letta is loose */
function normalizeTop(
  parsed: any,
  fallbackTopic: string,
  fallbackContentType: string
): OutputStructure {
  return {
    topic: typeof parsed?.topic === "string" ? parsed.topic : fallbackTopic,
    content_type:
      typeof parsed?.content_type === "string"
        ? parsed.content_type
        : fallbackContentType,
    quiz_questions: Array.isArray(parsed?.quiz_questions)
      ? parsed.quiz_questions
      : [],
    flashcards: Array.isArray(parsed?.flashcards) ? parsed.flashcards : [],
  };
}

/** Coerce any Letta question into the strict QuizQuestion shape */
function coerceToQuizQuestion(raw: any, tagId: number): QuizQuestion {
  // Pull possible fields from raw
  const q = String(raw?.question ?? raw?.prompt ?? "");
  const correct =
    raw?.correctAnswer ??
    raw?.answer ??
    raw?.correct_answer ??
    raw?.solution ??
    "";
  let t: QuestionType;

  // If type exists, coerce to allowed set; else infer from options length/content
  const rawType = String(raw?.type ?? "").toUpperCase();
  if (rawType === "MULTIPLE_CHOICE" || rawType === "MCQ") {
    t = "MULTIPLE_CHOICE";
  } else if (rawType === "FILL_IN_BLANK" || rawType === "FIB") {
    t = "FILL_IN_BLANK";
  } else {
    const hasOptions =
      Array.isArray(raw?.options) && raw.options.filter((x: any) => x).length > 0;
    t = hasOptions ? "MULTIPLE_CHOICE" : "FILL_IN_BLANK";
  }

  const explanation =
    String(raw?.explanation ?? raw?.rationale ?? raw?.why ?? "") || "";

  // Options handling
  let options: [string, string, string, string] = ["", "", "", ""];
  if (t === "MULTIPLE_CHOICE") {
    const src = Array.isArray(raw?.options) ? raw.options.slice(0, 4) : [];
    // Pad/truncate to 4
    options = [
      String(src[0] ?? ""),
      String(src[1] ?? ""),
      String(src[2] ?? ""),
      String(src[3] ?? ""),
    ];
  }

  return {
    question: q,
    correctAnswer: String(correct ?? ""),
    type: t,
    explanation,
    options,
    tagId,
    ...raw, // keep any additional fields, but ours above take precedence
  };
}

/** Attach tagId to flashcards too (optional) */
function attachTagIdToFlashcards(cards: any[], tagId: number): Flashcard[] {
  if (!Array.isArray(cards)) return [];
  return cards.map((c) => ({ ...c, tagId }));
}

/* =========================================
   Component (UI unchanged)
========================================= */

export function UploadContent() {
  const [selectedTopic, setSelectedTopic] = useState("");
  const [uploadType, setUploadType] = useState<"file" | "text" | "link" | null>(
    null
  );
  const [textContent, setTextContent] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
  const [showSuccess, setShowSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");
  const [tags, setTags] = useState<Array<{ id: number; name: string }>>([]);
  const [loadingTags, setLoadingTags] = useState(true);

  // Fetch tags on component mount
  useEffect(() => {
    const fetchTags = async () => {
      try {
        const userIdStr = localStorage.getItem("userId");
        if (userIdStr) {
          const userId = parseInt(userIdStr, 10);
          if (!isNaN(userId)) {
            const fetchedTags = await tagsAPI.getTagsByUserId(userId);
            setTags(fetchedTags);
          }
        }
      } catch (err) {
        console.error("Error fetching tags:", err);
      } finally {
        setLoadingTags(false);
      }
    };

    fetchTags();
  }, []);

  // Initialize Letta client
  const getLettaClient = () => {
    return new LettaClient({
      // ⚠️ Move real secrets server-side; use env var or a backend proxy instead of bundling tokens in the client.
      token:
        "sk-let-NDM0MmRiMjYtNmU2Ny00ZGExLTgyYmUtOWUxY2M4YzIxYzMwOmUzOTE2NTI5LTYyZGUtNGU4OC1hMTQ2LTI2YzAzODU3YmY3Nw==",
    });
  };

  /** Resolve tagId for the selected topic by querying your `tags` table.
   * Calls backend with topic name and userId from localStorage.
   */
  const fetchTagIdByName = async (name: string): Promise<number> => {
    // Throw if name is empty to avoid silent failure
    if (!name) throw new Error("No topic selected");

    // Get userId from localStorage
    const userIdStr = localStorage.getItem("userId");
    if (!userIdStr) throw new Error("User not authenticated");

    const userId = parseInt(userIdStr, 10);
    if (isNaN(userId)) throw new Error("Invalid user ID in storage");

    try {
      // Call backend using axios wrapper
      const data = await aiAPI.getTagIdByName(name, userId);
      return data.id;
    } catch (error) {
      console.error("Error fetching tagId:", error);
      throw error;
    }
  };

  /** Convert File to base64 string */
  const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = () => {
        const result = reader.result as string;
        // Extract base64 part after the comma
        const base64 = result.split(",")[1];
        resolve(base64);
      };
      reader.onerror = reject;
      reader.readAsDataURL(file);
    });
  };

  /** Handle file selection from input or drag-drop */
  const handleFileSelect = (files: FileList | null) => {
    if (!files) return;
    const imageFiles = Array.from(files).filter((file) =>
      file.type.startsWith("image/") || file.type === "application/pdf"
    );
    if (imageFiles.length === 0) {
      setError("Please select valid image or PDF files");
      return;
    }
    setUploadedFiles(imageFiles);
    setError("");
  };

  /** Handle drag and drop */
  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    handleFileSelect(e.dataTransfer.files);
  };

  /** Send to Letta, parse output, coerce questions to strict schema, attach tagId */
  const sendToLetta = async (content: string, contentType: string) => {
    try {
      setIsProcessing(true);
      setError("");

      const client = getLettaClient();
      // const agentId = process.env.REACT_APP_LETTA_AGENT_ID || 'YOUR_AGENT_ID';
      const agentId = "agent-f44ff4d7-31a3-4692-a752-17ba77533052";

      // 1) Resolve tagId from your tags table
      const tagId = await fetchTagIdByName(selectedTopic);
      console.log("Resolved tagId:", tagId);
      // 2) Ask Letta
      const messageContent = `Topic: ${selectedTopic}

      Content Type: ${contentType}
      ${content}`.trim();

      const response = await client.agents.messages.create(agentId, {
        messages: [
          {
            role: "user",
            content: [
              {
                type: "text",
                text: messageContent,
              },
            ],
          },
        ],
      });

      console.log("Letta raw response:", response?.messages);

      // 3) Parse Letta -> normalize top
      const parsed = extractJsonFromLetta(response?.messages || []);
      if (!parsed) {
        throw new Error("Could not parse JSON from Letta response.");
      }
          
      const normalized = normalizeTop(parsed, selectedTopic, contentType);

      // 4) Coerce EVERY quiz question into your required shape and attach tagId
      const strictQuestions: QuizQuestion[] = (normalized.quiz_questions || []).map(
        (q: any) => coerceToQuizQuestion(q, tagId)
      );

      // 5) (Optional) attach tagId to flashcards too
      const taggedFlashcards: Flashcard[] = attachTagIdToFlashcards(
        normalized.flashcards || [],
        tagId
      );

      // 6) Get userId from localStorage
      const userIdStr = localStorage.getItem("userId");
      if (!userIdStr) throw new Error("User not authenticated");
      const userId = parseInt(userIdStr, 10);
      if (isNaN(userId)) throw new Error("Invalid user ID in storage");

      // 7) POST flashcards to backend
      if (taggedFlashcards.length > 0) {
        try {
          const flashcardsResponse = await aiAPI.postFlashcards(
            selectedTopic,
            contentType.toUpperCase(),
            taggedFlashcards,
            userId
          );
          console.log("Flashcards posted successfully:", flashcardsResponse);
        } catch (err) {
          console.error("Error posting flashcards:", err);
          throw err;
        }
      }

      // 8) POST quiz questions to backend
      if (strictQuestions.length > 0) {
        try {
          const quizResponse = await aiAPI.postQuizQuestions(
            selectedTopic,
            contentType.toUpperCase(),
            strictQuestions,
            userId
          );
          console.log("Quiz questions posted successfully:", quizResponse);
        } catch (err) {
          console.error("Error posting quiz questions:", err);
          throw err;
        }
      }

      return { quiz_questions: strictQuestions, flashcards: taggedFlashcards };
    } catch (err: any) {
      console.error("Error sending to Letta:", err);
      setError(err?.message || "Failed to process content with Letta AI");
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpload = async () => {
    try {
      let content = "";
      let contentType = "";

      // Determine content based on upload type
      if (uploadType === "text") {
        content = textContent;
        contentType = "text";
      } else if (uploadType === "link") {
        content = linkUrl;
        contentType = "link";
      } else if (uploadType === "file") {
        // Convert uploaded files to base64 strings
        if (uploadedFiles.length === 0) {
          setError("No files selected.");
          return;
        }

        try {
          const fileContents = await Promise.all(
            uploadedFiles.map(async (file) => {
              const base64 = await fileToBase64(file);
              return {
                fileName: file.name,
                fileType: file.type,
                size: file.size,
                content: base64,
              };
            })
          );

          content = JSON.stringify(fileContents);
          contentType = "file";
        } catch (err) {
          setError("Failed to read files. Please try again.");
          return;
        }
      } else {
        setError("Please choose an upload method.");
        return;
      }

      if (!selectedTopic) {
        setError("Please select a topic.");
        return;
      }

      // Send to Letta -> normalize -> coerce -> tag with tagId
      await sendToLetta(content, contentType);

      // Show success
      setShowSuccess(true);
      setTimeout(() => {
        setShowSuccess(false);
        setUploadType(null);
        setTextContent("");
        setLinkUrl("");
        setUploadedFiles([]);
      }, 2000);
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  return (
    <div className="p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-slate-900 mb-2">Upload Content</h1>
          <p className="text-slate-600">
            Add learning materials to your topics
          </p>
        </div>

        {showSuccess && (
          <Alert className="mb-6 border-green-200 bg-green-50">
            <Check className="w-4 h-4 text-green-600" />
            <AlertDescription className="text-green-800">
              Content uploaded successfully! AI is analyzing your materials...
            </AlertDescription>
          </Alert>
        )}

        {error && (
          <Alert className="mb-6 border-red-200 bg-red-50">
            <AlertDescription className="text-red-800">
              {error}
            </AlertDescription>
          </Alert>
        )}

        {isProcessing && (
          <Alert className="mb-6 border-blue-200 bg-blue-50">
            <Loader className="w-4 h-4 text-blue-600 animate-spin" />
            <AlertDescription className="text-blue-800">
              Processing your content... Please wait while we analyze and create flashcards and quiz questions.
            </AlertDescription>
          </Alert>
        )}

        <Card className="mb-6">
          <CardHeader>
            <CardTitle>Select Topic</CardTitle>
            <CardDescription>
              Choose which topic this content belongs to
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Select value={selectedTopic} onValueChange={setSelectedTopic}>
              <SelectTrigger>
                <SelectValue placeholder={loadingTags ? "Loading topics..." : "Select a topic"} />
              </SelectTrigger>
              <SelectContent>
                {tags.length === 0 ? (
                  <SelectItem value="_empty" disabled>
                    {loadingTags ? "Loading..." : "No topics available"}
                  </SelectItem>
                ) : (
                  tags.map((tag) => (
                    <SelectItem key={tag.id} value={tag.name}>
                      {tag.name}
                    </SelectItem>
                  ))
                )}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card
            className={`cursor-pointer transition-all hover:shadow-md ${
              uploadType === "file" ? "ring-2 ring-blue-500" : ""
            }`}
            onClick={() => setUploadType("file")}
          >
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Upload className="w-6 h-6 text-blue-600" />
              </div>
              <h3 className="text-slate-900 mb-1">Upload Files</h3>
              <p className="text-slate-600 text-sm">
                PDFs, images, handwritten notes
              </p>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all hover:shadow-md ${
              uploadType === "text" ? "ring-2 ring-blue-500" : ""
            }`}
            onClick={() => setUploadType("text")}
          >
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <FileText className="w-6 h-6 text-green-600" />
              </div>
              <h3 className="text-slate-900 mb-1">Paste Text</h3>
              <p className="text-slate-600 text-sm">
                Notes, excerpts, definitions
              </p>
            </CardContent>
          </Card>

          <Card
            className={`cursor-pointer transition-all hover:shadow-md ${
              uploadType === "link" ? "ring-2 ring-blue-500" : ""
            }`}
            onClick={() => setUploadType("link")}
          >
            <CardContent className="pt-6 text-center">
              <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
                <LinkIcon className="w-6 h-6 text-purple-600" />
              </div>
              <h3 className="text-slate-900 mb-1">Add Link</h3>
              <p className="text-slate-600 text-sm">
                Videos, articles, resources
              </p>
            </CardContent>
          </Card>
        </div>

        {uploadType === "file" && (
          <Card>
            <CardHeader>
              <CardTitle>Upload Files</CardTitle>
            </CardHeader>
            <CardContent>
              <div
                className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors cursor-pointer"
                onDragOver={handleDragOver}
                onDrop={handleDrop}
              >
                <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
                <p className="text-slate-600 mb-2">
                  Drag and drop files here, or click to browse
                </p>
                <p className="text-slate-500 text-sm">
                  Supports PDF, PNG, JPG, and other image formats
                </p>
                <input
                  type="file"
                  className="hidden"
                  multiple
                  accept=".pdf,.png,.jpg,.jpeg"
                  onChange={(e) => handleFileSelect(e.target.files)}
                  onClick={(e) => {
                    (e.target as HTMLInputElement).value = '';
                  }}
                />
                <button
                  type="button"
                  onClick={() => {
                    const input = document.querySelector(
                      'input[type="file"]'
                    ) as HTMLInputElement;
                    input?.click();
                  }}
                  className="text-blue-600 hover:underline"
                >
                  click to browse
                </button>
              </div>

              {uploadedFiles.length > 0 && (
                <div className="mt-4">
                  <h4 className="font-semibold text-slate-900 mb-2">
                    Selected Files ({uploadedFiles.length})
                  </h4>
                  <ul className="space-y-2">
                    {uploadedFiles.map((file, idx) => (
                      <li
                        key={idx}
                        className="flex items-center justify-between p-2 bg-slate-100 rounded"
                      >
                        <span className="text-slate-700 text-sm">
                          {file.name} ({(file.size / 1024).toFixed(1)} KB)
                        </span>
                        <button
                          type="button"
                          onClick={() => {
                            setUploadedFiles(
                              uploadedFiles.filter((_, i) => i !== idx)
                            );
                          }}
                          className="text-red-600 hover:text-red-800 text-sm"
                        >
                          Remove
                        </button>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              <div className="flex justify-end mt-4">
                <Button
                  onClick={handleUpload}
                  disabled={!selectedTopic || uploadedFiles.length === 0 || isProcessing}
                >
                  {isProcessing ? "Processing..." : "Process Upload"}
                </Button>
              </div>
            </CardContent>
          </Card>
        )}

        {uploadType === "text" && (
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
                  <Button
                    onClick={handleUpload}
                    disabled={!selectedTopic || !textContent}
                  >
                    Process Content
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {uploadType === "link" && (
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
                <p className="text-slate-600 text-sm">
                  Supports YouTube videos, articles, and web pages
                </p>
                <div className="flex justify-end">
                  <Button
                    onClick={handleUpload}
                    disabled={!selectedTopic || !linkUrl}
                  >
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
