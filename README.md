# digital_learning_platform

## API Routes

### Health
- **GET** `/api/health` — server status check.

### Authentication (`/api/auth`)
- **POST** `/api/auth/signup` — create account.
- **POST** `/api/auth/login` — authenticate user.
- **GET** `/api/auth/me` — fetch authenticated profile *(protected)*.

### Books (`/api/books`)
- **GET** `/api/books/` — list books.
- **GET** `/api/books/search` — search books.
- **GET** `/api/books/:id` — get book by ID.
- **POST** `/api/books/upload` — upload book *(protected, `file` field)*.
- **DELETE** `/api/books/:id` — remove book *(protected)*.

### Videos (`/api/videos`)
- **GET** `/api/videos/` — list videos.
- **GET** `/api/videos/:id` — get video by ID.
- **POST** `/api/videos/upload` — upload video *(protected, `video` field)*.
- **POST** `/api/videos/:id/watch` — track watch time *(protected)*.
- **POST** `/api/videos/:id/rate` — add rating *(protected)*.
- **PATCH** `/api/videos/:id/status` — update status *(protected)*.
- **DELETE** `/api/videos/:id` — remove video *(protected)*.

### Analytics (`/api/analytics`)
- **POST** `/api/analytics/track` — record event *(protected)*.
- **GET** `/api/analytics/overview` — analytics summary *(protected)*.
- **GET** `/api/analytics/institution/:institutionId` — institution analytics *(protected)*.
- **GET** `/api/analytics/user/:userId` — user analytics *(protected)*.
- **GET** `/api/analytics/export` — export analytics *(protected)*.

### Institutions (`/api/institutions`)
- **GET** `/api/institutions/` — list institutions.
- **POST** `/api/institutions/` — create institution *(protected)*.
- **GET** `/api/institutions/:id/analytics` — institution analytics *(protected)*.

### Users (`/api/users`)
- **GET** `/api/users/` — list users *(protected)*.
- **GET** `/api/users/:id` — get user by ID *(protected)*.
- **PATCH** `/api/users/:id` — update user *(protected)*.
- **DELETE** `/api/users/:id` — delete user *(protected)*.
- **PATCH** `/api/users/:id/role` — update role *(protected)*.
