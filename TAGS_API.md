# 📌 Tags API Endpoints

## Database Schema Changes

Added `userId` field to the `Tag` model to associate tags with specific users.

```prisma
model Tag {
  id          Int      @id @default(autoincrement())
  name        String   @unique
  description String?

  // Foreign keys
  userId      Int

  // Relations
  user        User     @relation(fields: [userId], references: [id], onDelete: Cascade)
  quizQuestions QuizQuestion[]
  flashcards    Flashcard[]
  logs          Log[]

  @@map("tags")
}
```

## API Endpoints

### 1. GET All Tags (Global)

**Endpoint:** `GET /tags`

**Authentication:** Not required (Public)

**Description:** Get all tags across all users

**Response:**

```json
[
  {
    "id": 1,
    "name": "Biology",
    "description": "Biology topics",
    "userId": 1,
    "quizQuestions": [],
    "flashcards": []
  }
]
```

---

### 2. GET All Tags for a User

**Endpoint:** `GET /tags/user/:userId`

**Authentication:** Required (Protected)

**Description:** Get all tags created by a specific user

**Parameters:**

- `userId` (path) - The ID of the user

**Authorization:** User can only access their own tags

**Response:**

```json
[
  {
    "id": 1,
    "name": "Biology",
    "description": "Biology topics",
    "userId": 1,
    "quizQuestions": [],
    "flashcards": []
  },
  {
    "id": 2,
    "name": "Chemistry",
    "description": null,
    "userId": 1,
    "quizQuestions": [],
    "flashcards": []
  }
]
```

---

### 3. POST New Tag (Current User)

**Endpoint:** `POST /tags`

**Authentication:** Required (Protected)

**Description:** Create a new tag for the authenticated user

**Body:**

```json
{
  "name": "Biology",
  "description": "Biology topics"
}
```

**Validation:**

- `name` is required
- Tag name must be unique for the user
- `description` is optional

**Response (201 Created):**

```json
{
  "message": "Tag created successfully",
  "tag": {
    "id": 1,
    "name": "Biology",
    "description": "Biology topics",
    "userId": 1,
    "quizQuestions": [],
    "flashcards": []
  }
}
```

---

### 4. POST New Tag for Specific User

**Endpoint:** `POST /tags/:userId`

**Authentication:** Required (Protected)

**Description:** Create a new tag for a specific user

**Parameters:**

- `userId` (path) - The ID of the user

**Body:**

```json
{
  "name": "Chemistry",
  "description": "Chemistry topics"
}
```

**Authorization:** User can only create tags for themselves

**Validation:**

- `name` is required
- Tag name must be unique per user
- `description` is optional

**Response (201 Created):**

```json
{
  "message": "Tag created successfully",
  "tag": {
    "id": 2,
    "name": "Chemistry",
    "description": "Chemistry topics",
    "userId": 1,
    "quizQuestions": [],
    "flashcards": []
  }
}
```

---

## Error Responses

### 400 Bad Request

```json
{
  "error": "Tag name is required"
}
```

### 403 Forbidden

```json
{
  "error": "You can only access your own tags"
}
```

### 400 Conflict

```json
{
  "error": "Tag already exists for this user"
}
```

---

## Usage Examples

### Create a tag for current user

```bash
curl -X POST http://localhost:8080/tags \
  -H "Authorization: Bearer <token>" \
  -H "Content-Type: application/json" \
  -d '{
    "name": "Biology",
    "description": "Biology topics"
  }'
```

### Get all tags for a user

```bash
curl -X GET http://localhost:8080/tags/user/1 \
  -H "Authorization: Bearer <token>"
```

### Get all tags (public)

```bash
curl -X GET http://localhost:8080/tags
```

---

## Database Migration

After updating the schema, run:

```bash
cd /home/vihashah/dev/calhacks12/express/backend

# Generate migration
npx prisma migrate dev --name add_userid_to_tags

# Or push to database directly (for development)
npx prisma db push
```
