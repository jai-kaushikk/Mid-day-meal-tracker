# My Recipe App

## Overview
My Recipe App is a web application that allows users to manage recipes, including adding, deleting, and retrieving recipes. The application has a user authentication system and provides admin functionalities for managing user accounts and recipes.

## Project Structure
```
my-recipe-app
├── backend
│   ├── main.go
│   ├── handlers
│   │   ├── auth.go
│   │   ├── recipies.go
│   │   └── admin.go
│   ├── models
│   │   ├── user.go
│   │   └── recipie.go
│   ├── db
│   │   └── schema.sql
│   └── go.mod
├── frontend
│   ├── src
│   │   ├── App.tsx
│   │   ├── index.tsx
│   │   ├── components
│   │   │   ├── LoginForm.tsx
│   │   │   ├── RecipePage.tsx
│   │   │   └── AdminPanel.tsx
│   │   └── utils
│   │       └── api.ts
│   ├── package.json
│   └── tsconfig.json
└── README.md
```

## Technologies Used
- **Frontend**: React, TypeScript
- **Backend**: Go (Golang)
- **Database**: SQL (schema defined in `backend/db/schema.sql`)

## Setup Instructions

### Backend
1. Navigate to the `backend` directory.
2. Run `go mod tidy` to install dependencies.
3. Start the server with `go run main.go`.
4. Ensure the database is set up according to the schema in `schema.sql`.

### Frontend
1. Navigate to the `frontend` directory.
2. Run `npm install` to install dependencies.
3. Start the React application with `npm start`.

## Usage
- **Sign In**: Users can sign in using their ID and password. A session token will be generated and valid for 24 hours.
- **Recipe Management**: Users can add, delete, and retrieve recipes. Admin users have additional privileges to manage user accounts.
- **Admin Panel**: Admins can create new accounts and designate them as admin or regular users.

## API Endpoints
- **Authentication**: `/api/auth/signin`
- **Recipe Management**: 
  - Add Recipe: `/api/recipes/add`
  - Delete Recipe: `/api/recipes/delete`
  - Get Recipe: `/api/recipes/get`

## License
This project is licensed under the MIT License.