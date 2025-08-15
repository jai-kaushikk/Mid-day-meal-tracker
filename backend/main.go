package main

import (
	"log"
	"my-recipe-app/backend/db"
	"my-recipe-app/backend/handlers"
	"my-recipe-app/backend/models"
	"os"

	"github.com/joho/godotenv"
	"github.com/labstack/echo/v4"
	"github.com/labstack/echo/v4/middleware"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

func init() {
	// Load environment variables from .env file if present
	if err := godotenv.Load(); err != nil {
		log.Println("No .env file found, using system environment variables")
	}
}

func main() {
	// Initialize JWT handler
	handlers.InitializeJWT()

	// Example: Get DB details from env
	dbURL := os.Getenv("DB_URL")
	cors := os.Getenv("CORS")
	log.Println("DB_URL:", dbURL)
	if dbURL == "" {
		log.Fatal("DB_URL environment variable not set")
	}
	// Connect to DB using GORM
	var err error
	db.DB, err = gorm.Open(postgres.Open(dbURL), &gorm.Config{})
	if err != nil {
		log.Fatalf("Failed to connect to database: %v", err)
	}
	// Auto-migrate User model
	db.DB.AutoMigrate(&models.User{})

	e := echo.New()

	// Add comprehensive logging middleware
	e.Use(middleware.LoggerWithConfig(middleware.LoggerConfig{
		Format: "${time_rfc3339} | ${status} | ${latency_human} | ${remote_ip} | ${method} ${uri} | ${error}\n",
	}))
	
	// Add CORS middleware for frontend
	e.Use(middleware.CORSWithConfig(middleware.CORSConfig{
		AllowOrigins: []string{cors},
		AllowMethods: []string{echo.GET, echo.PUT, echo.POST, echo.DELETE},
		AllowHeaders: []string{echo.HeaderOrigin, echo.HeaderContentType, echo.HeaderAccept, echo.HeaderAuthorization},
	}))

	// Add recovery middleware
	e.Use(middleware.Recover())

	log.Println("=== RECIPE APP SERVER STARTING ===")
	log.Println("Server will listen on :8080")
	log.Println("Frontend should be running on http://localhost:3000")
	log.Println("API endpoints:")
	log.Println("  POST /api/auth/signin - User authentication")
	log.Println("  POST /api/recipes/add - Add recipe (admin only)")
	log.Println("  DELETE /api/recipes/delete - Delete recipe (admin only)")
	log.Println("  GET /api/recipes/get - Get recipes")
	log.Println("  POST /api/admin/create - Create admin user")
	log.Println("=====================================")

	// Authentication route (public)
	e.POST("/api/auth/signin", handlers.SignInHandler)

	// Protected routes (JWT required)
	jwtMW := handlers.JWTMiddleware
	e.POST("/api/recipes/add", handlers.AddRecipeHandler, jwtMW)
	e.DELETE("/api/recipes/delete", handlers.DeleteRecipeHandler, jwtMW)
	e.GET("/api/recipes/get", handlers.GetRecipesHandler, jwtMW)
	e.POST("/api/admin/create", handlers.CreateAdminHandler, jwtMW)

	// Start the server
	port:= os.Getenv("PORT")
	log.Println("Starting server on :"+port)
	if err := e.Start(":"+port); err != nil {
		log.Fatal(err)
	}
}
