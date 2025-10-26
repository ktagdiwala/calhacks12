// import { useState } from "react";
// import {
//   Upload,
//   FileText,
//   Image,
//   Video,
//   Link as LinkIcon,
//   Check,
// } from "lucide-react";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "./ui/card";
// import { Button } from "./ui/button";
// import { Input } from "./ui/input";
// import { Label } from "./ui/label";
// import { Textarea } from "./ui/textarea";
// import {
//   Select,
//   SelectContent,
//   SelectItem,
//   SelectTrigger,
//   SelectValue,
// } from "./ui/select";
// import { Alert, AlertDescription } from "./ui/alert";
// import { LettaClient } from "@letta-ai/letta-client";

// export function UploadContent() {
//   const [selectedTopic, setSelectedTopic] = useState("");
//   const [uploadType, setUploadType] = useState<"file" | "text" | "link" | null>(
//     null
//   );
//   const [textContent, setTextContent] = useState("");
//   const [linkUrl, setLinkUrl] = useState("");
//   const [showSuccess, setShowSuccess] = useState(false);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [error, setError] = useState("");

//   // Initialize Letta client
//   const getLettaClient = () => {
//     return new LettaClient({
//       token:
//         "sk-let-NDM0MmRiMjYtNmU2Ny00ZGExLTgyYmUtOWUxY2M4YzIxYzMwOmUzOTE2NTI5LTYyZGUtNGU4OC1hMTQ2LTI2YzAzODU3YmY3Nw==",
//     });
//   };

//   const sendToLetta = async (content: string, contentType: string) => {
//     try {
//       setIsProcessing(true);
//       setError("");

//       const client = getLettaClient();
//       // const agentId = process.env.REACT_APP_LETTA_AGENT_ID || 'YOUR_AGENT_ID';
//       const agentId = "agent-f44ff4d7-31a3-4692-a752-17ba77533052";

//       // Construct message based on upload type
//       const messageContent = `Topic: ${selectedTopic}\nContent Type: ${contentType}\n\n${content}`;

//       const response = await client.agents.messages.create(agentId, {
//         messages: [
//           {
//             role: "user",
//             content: [
//               {
//                 type: "text",
//                 text: messageContent,
//               },
//             ],
//           },
//         ],
//       });

//       console.log("Letta response:", response.messages);

//       // Process the response and return it
//       return response;
//     } catch (err) {
//       console.error("Error sending to Letta:", err);
//       setError("Failed to process content with Letta AI");
//       throw err;
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const handleUpload = async () => {
//     console.log("inside on click")
//     try {
//       let content = "";
//       let contentType = "";

//       // Determine content based on upload type
//       if (uploadType === "text") {
//         content = textContent;
//         contentType = "text";
//       } else if (uploadType === "link") {
//         content = linkUrl;
//         contentType = "link";
//       } else if (uploadType === "file") {
//         content = "File upload processing (implement file handling)";
//         contentType = "file";
//       }

//       // Send to Letta
//       await sendToLetta(content, contentType);

//       // Show success
//       setShowSuccess(true);
//       setTimeout(() => {
//         setShowSuccess(false);
//         setUploadType(null);
//         setTextContent("");
//         setLinkUrl("");
//       }, 2000);
//     } catch (err) {
//       console.error("Upload failed:", err);
//     }
//   };

//   const topics = [
//     "Machine Learning",
//     "Organic Chemistry",
//     "Spanish Vocabulary",
//     "Art History",
//   ];
//   // const client = new LettaClient({ baseUrl: "http://localhost:8283" });

//   return (
//     <div className="p-8">
//       <div className="max-w-4xl mx-auto">
//         <div className="mb-8">
//           <h1 className="text-slate-900 mb-2">Upload Content</h1>
//           <p className="text-slate-600">
//             Add learning materials to your topics
//           </p>
//         </div>

//         {showSuccess && (
//           <Alert className="mb-6 border-green-200 bg-green-50">
//             <Check className="w-4 h-4 text-green-600" />
//             <AlertDescription className="text-green-800">
//               Content uploaded successfully! AI is analyzing your materials...
//             </AlertDescription>
//           </Alert>
//         )}

//         <Card className="mb-6">
//           <CardHeader>
//             <CardTitle>Select Topic</CardTitle>
//             <CardDescription>
//               Choose which topic this content belongs to
//             </CardDescription>
//           </CardHeader>
//           <CardContent>
//             <Select value={selectedTopic} onValueChange={setSelectedTopic}>
//               <SelectTrigger>
//                 <SelectValue placeholder="Select a topic" />
//               </SelectTrigger>
//               <SelectContent>
//                 {topics.map((topic) => (
//                   <SelectItem key={topic} value={topic}>
//                     {topic}
//                   </SelectItem>
//                 ))}
//               </SelectContent>
//             </Select>
//           </CardContent>
//         </Card>

//         <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
//           <Card
//             className={`cursor-pointer transition-all hover:shadow-md ${
//               uploadType === "file" ? "ring-2 ring-blue-500" : ""
//             }`}
//             onClick={() => setUploadType("file")}
//           >
//             <CardContent className="pt-6 text-center">
//               <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center mx-auto mb-3">
//                 <Upload className="w-6 h-6 text-blue-600" />
//               </div>
//               <h3 className="text-slate-900 mb-1">Upload Files</h3>
//               <p className="text-slate-600 text-sm">
//                 PDFs, images, handwritten notes
//               </p>
//             </CardContent>
//           </Card>

//           <Card
//             className={`cursor-pointer transition-all hover:shadow-md ${
//               uploadType === "text" ? "ring-2 ring-blue-500" : ""
//             }`}
//             onClick={() => setUploadType("text")}
//           >
//             <CardContent className="pt-6 text-center">
//               <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center mx-auto mb-3">
//                 <FileText className="w-6 h-6 text-green-600" />
//               </div>
//               <h3 className="text-slate-900 mb-1">Paste Text</h3>
//               <p className="text-slate-600 text-sm">
//                 Notes, excerpts, definitions
//               </p>
//             </CardContent>
//           </Card>

//           <Card
//             className={`cursor-pointer transition-all hover:shadow-md ${
//               uploadType === "link" ? "ring-2 ring-blue-500" : ""
//             }`}
//             onClick={() => setUploadType("link")}
//           >
//             <CardContent className="pt-6 text-center">
//               <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center mx-auto mb-3">
//                 <LinkIcon className="w-6 h-6 text-purple-600" />
//               </div>
//               <h3 className="text-slate-900 mb-1">Add Link</h3>
//               <p className="text-slate-600 text-sm">
//                 Videos, articles, resources
//               </p>
//             </CardContent>
//           </Card>
//         </div>

//         {uploadType === "file" && (
//           <Card>
//             <CardHeader>
//               <CardTitle>Upload Files</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors cursor-pointer">
//                 <Upload className="w-12 h-12 text-slate-400 mx-auto mb-4" />
//                 <p className="text-slate-600 mb-2">
//                   Drag and drop files here, or click to browse
//                 </p>
//                 <p className="text-slate-500 text-sm">
//                   Supports PDF, PNG, JPG, and other image formats
//                 </p>
//                 <input
//                   type="file"
//                   className="hidden"
//                   multiple
//                   accept=".pdf,.png,.jpg,.jpeg"
//                 />
//               </div>
//               <div className="flex justify-end mt-4">
//                 <Button
//                   onClick={handleUpload}
//                   disabled={!selectedTopic || isProcessing}
//                 >
//                   {isProcessing ? "Processing..." : "Process Upload"}
//                 </Button>
//               </div>
//             </CardContent>
//           </Card>
//         )}

//         {uploadType === "text" && (
//           <Card>
//             <CardHeader>
//               <CardTitle>Paste Text Content</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 <div>
//                   <Label htmlFor="text-content">Content</Label>
//                   <Textarea
//                     id="text-content"
//                     placeholder="Paste your notes, definitions, or any text content here..."
//                     value={textContent}
//                     onChange={(e) => setTextContent(e.target.value)}
//                     className="min-h-[200px] mt-2"
//                   />
//                 </div>
//                 <div className="flex justify-end">
//                   <Button
//                     onClick={handleUpload}
//                     disabled={!selectedTopic || !textContent}
//                   >
//                     Process Content
//                   </Button>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         )}

//         {uploadType === "link" && (
//           <Card>
//             <CardHeader>
//               <CardTitle>Add Link</CardTitle>
//             </CardHeader>
//             <CardContent>
//               <div className="space-y-4">
//                 <div>
//                   <Label htmlFor="link-url">URL</Label>
//                   <Input
//                     id="link-url"
//                     type="url"
//                     placeholder="https://example.com/article"
//                     value={linkUrl}
//                     onChange={(e) => setLinkUrl(e.target.value)}
//                     className="mt-2"
//                   />
//                 </div>
//                 <p className="text-slate-600 text-sm">
//                   Supports YouTube videos, articles, and web pages
//                 </p>
//                 <div className="flex justify-end">
//                   <Button
//                     onClick={handleUpload}
//                     disabled={!selectedTopic || !linkUrl}
//                   >
//                     Process Link
//                   </Button>
//                 </div>
//               </div>
//             </CardContent>
//           </Card>
//         )}
//       </div>
//     </div>
//   );
// }

import { useState } from "react";
import {
  Upload,
  FileText,
  Link as LinkIcon,
  Check,
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

/** Parse Letta messages into JSON.
 *  Handles raw JSON, ```json fenced code, and best-effort object extraction.
 */
function extractJsonFromLetta(messages: any[]): OutputStructure | null {
  const last = [...messages]
    .reverse()
    .find((m) => m.role === "assistant" && Array.isArray(m.content));

  const textChunk = last?.content?.find?.((c: any) => c.type === "text")?.text;
  if (!textChunk || typeof textChunk !== "string") return null;

  // Try direct JSON
  try {
    return JSON.parse(textChunk);
  } catch {}

  // Try fenced ```json blocks
  const fenceMatch =
    textChunk.match(/```json\s*([\s\S]*?)```/i) ||
    textChunk.match(/```\s*([\s\S]*?)```/i);

  if (fenceMatch?.[1]) {
    try {
      return JSON.parse(fenceMatch[1]);
    } catch {}
  }

  // Try first JSON-looking object substring
  const s = textChunk.indexOf("{");
  const e = textChunk.lastIndexOf("}");
  if (s !== -1 && e > s) {
    try {
      return JSON.parse(textChunk.slice(s, e + 1));
    } catch {}
  }

  return null;
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
  const [showSuccess, setShowSuccess] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState("");

  // Initialize Letta client
  const getLettaClient = () => {
    return new LettaClient({
      // ⚠️ Move real secrets server-side; use env var or a backend proxy instead of bundling tokens in the client.
      token:
        "sk-let-NDM0MmRiMjYtNmU2Ny00ZGExLTgyYmUtOWUxY2M4YzIxYzMwOmUzOTE2NTI5LTYyZGUtNGU4OC1hMTQ2LTI2YzAzODU3YmY3Nw==",
    });
  };

  /** Resolve tagId for the selected topic by querying your `tags` table.
   * Replace with your real API call / DB query.
   */
  const fetchTagIdByName = async (name: string): Promise<number> => {
    // Example 1: call your backend
    // const res = await fetch(`/api/tags?name=${encodeURIComponent(name)}`);
    // if (!res.ok) throw new Error("Failed to fetch tagId");
    // const data = await res.json(); // e.g., { id: 42 }
    // return data.id;

    // Example 2: fallback mock while wiring up backend
    // Throw if name is empty to avoid silent failure
    if (!name) throw new Error("No topic selected");
    // TODO: replace with real id; this just simulates a lookup
    return 1;
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

      // 6) Build final output structure
      const quiz_questions = { quiz_questions: strictQuestions }
      const flashcards = { flashcards: taggedFlashcards }

      console.log(quiz_questions);
      console.log(flashcards);

      // TODO call post on quiz questions
      // TODO call post on flashcards

      // TODO: persist `enriched` to your backend / DB
      // await fetch("/api/content", { method: "POST", body: JSON.stringify(enriched) });

      return enriched;
    } catch (err: any) {
      console.error("Error sending to Letta:", err);
      setError(err?.message || "Failed to process content with Letta AI");
      throw err;
    } finally {
      setIsProcessing(false);
    }
  };

  const handleUpload = async () => {
    console.log("inside on click");
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
        content = "File upload processing (implement file handling)";
        contentType = "file";
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
      }, 2000);
    } catch (err) {
      console.error("Upload failed:", err);
    }
  };

  const topics = [
    "Machine Learning",
    "Organic Chemistry",
    "Spanish Vocabulary",
    "Art History",
  ];

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
              <div className="border-2 border-dashed border-slate-300 rounded-lg p-12 text-center hover:border-blue-400 transition-colors cursor-pointer">
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
                />
              </div>
              <div className="flex justify-end mt-4">
                <Button
                  onClick={handleUpload}
                  disabled={!selectedTopic || isProcessing}
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
