# Reflect

Reflect is a social feedback and reputation platform where users can give meaningful feedback, respond to it, build friendships, and develop a reputation based on positive interactions.

The backend is built with **Node.js, Express, PostgreSQL, Prisma, Redis, and JWT authentication**.

## Features

### Authentication
- User registration and login
- JWT-based authentication
- Protected API routes
- Argon2 password hashing

### User & Profile
- User accounts
- User profiles
- Privacy settings
- Reputation visibility controls

### Feedback
Users can send feedback to other users with different feedback types and reputation dimensions.

Supported feedback types:
- `APPRECIATION`
- `CONSTRUCTIVE`
- `ENCOURAGEMENT`
- `APOLOGY`
- `GRATITUDE`

Supported reputation dimensions:
- `KINDNESS`
- `RESPECT`
- `RELIABILITY`
- `ACCOUNTABILITY`

Feedback also supports:
- Anonymous feedback
- Optional identity reveal
- Public/private visibility
- Feedback responses
- Feedback deletion
- Reporting
- Hiding reported feedback through moderation

### Anonymous Feedback

Feedback is anonymous by default.

The sender can choose whether the recipient is allowed to reveal their identity later.

For anonymous feedback, sender identity is not returned through the normal feedback response.

Identity can only be revealed through the dedicated identity-reveal endpoint when the sender has permitted it.

### Friend System
- Send friend requests
- Accept requests
- Reject requests
- Cancel outgoing requests
- List incoming requests
- List outgoing requests
- View friends
- Unfriend users

### Blocking
Users can:
- Block another user
- Unblock a user
- View blocked users

Blocking also prevents interaction between the two users through:
- Feedback
- Friend requests

### Reputation

Reflect uses reputation events generated from qualifying feedback.

The reputation system includes:
- Multiple reputation dimensions
- Sender trust weighting
- Time decay
- Baseline/prior scoring
- Minimum sample-size protection

A reputation score is only considered available after at least **5 qualifying events**.

### Notifications
The backend supports in-app notifications for events such
as:
- Friend request accepted
- Safety report updates
- Moderation warnings
- Account restrictions
- Other important account activity

### Moderation & Safety

Reflect includes a moderation system for handling reported feedback and unsafe content.

Moderators can:
- View pending reports
- Review safety reports
- Update report status
- View report history
- Hide reported feedback
- Warn users
- Restrict user accounts
- Remove inappropriate feedback
- Record moderation actions

### Moderation Appeals

Users affected by moderation actions can submit an appeal.

The appeal system supports:
- Creating an appeal
- Preventing duplicate open appeals
- Reviewing appeals
- Upholding moderation decisions
- Overturning moderation decisions

### Best Friends

Users can mark existing friends as best friends.

- Add best friends
- Remove best friends
- View best friends
- Best-friend visibility is controlled through privacy settings

### Hobbies

Users can add hobbies to their profile.

- Add hobbies
- Remove hobbies
- View hobbies
- Duplicate hobbies are prevented
- Hobby visibility is controlled through privacy settings

### Account Restrictions

Reflect supports different account statuses:

- `ACTIVE`
- `RESTRICTED`
- `SUSPENDED`
- `BANNED`

Restricted accounts cannot perform certain actions such as sending new feedback or friend requests.

### Testing

The backend includes automated tests for important parts of the system.

The current test suite covers:
- Reputation calculations
- Feedback access control
- IDOR protection
- Moderation workflows
- Safety report moderation

Current test result:

`31 tests passed`

### Tech Stack

- Node.js
- Express.js
- PostgreSQL
- Prisma ORM
- Redis
- JWT
- Argon2
- JavaScript (ES Modules)

### Project Structure

```text
backend/
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── routes/
│   ├── services/
│   ├── app.js
│   └── server.js
│
├── tests/
├── prisma/
├── generated/
├── .env.example
├── package.json
├── prisma.config.ts
└── README.md
```

### Running the Backend
Install dependencies:

```
npm install
```

Configure the environment variables in `.env`. Set `FRONTEND_URL` to the frontend origin when deploying the frontend and API on different origins. Localhost origins are allowed automatically outside production.

Run Prisma migrations:

```
npx prisma migrate dev
```

Start the server:

```
npm run dev
```

Run tests:

```
npm test
```

The API runs on the configured application port.

### API
Main API route groups include:

- `/api/auth`
- `/api/users`
- `/api/feedback`
- `/api/friend-request`
- `/api/friendship`
- `/api/notifications`
- `/api/reputation`
- `/api/moderation`
- `/api/block`
- `/api/best-friends`
- `/api/hobbies`

### Project Status
Reflect backend MVP is implemented and tested.

The main social, feedback, reputation, friendship, privacy, safety, and moderation functionality is currently available through the API.
