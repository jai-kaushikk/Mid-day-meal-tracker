package handlers

import (
	"fmt"
	"log"
	"my-recipe-app/backend/db"
	"my-recipe-app/backend/models"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/golang-jwt/jwt/v5"
	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
)

// --- Best Practices: Configuration ---
// Load the JWT secret key from an environment variable for better security.
// Do NOT hardcode secrets in your application.
var jwtKey []byte

func InitializeJWT() {
	// --- Security: JWT Secret Key ---
	// Load the JWT secret key from an environment variable.
	// It's crucial that this is set to a strong, random string.
	secret := os.Getenv("JWT_SECRET_KEY")
	if secret == "" {
		log.Fatal("[FATAL] JWT_SECRET_KEY environment variable not set")
	}
	jwtKey = []byte(secret)
}

// --- Best Practices: Context Keys ---
// Use a custom type for context keys to avoid collisions.
type contextKey string

const (
	userContextKey = contextKey("user")
)

// Claims defines the structure of the JWT claims.
type Claims struct {
	UserID  uint `json:"user_id"`
	IsAdmin bool `json:"is_admin"`
	jwt.RegisteredClaims
}

// SignInRequest defines the expected structure for the sign-in request body.
type SignInRequest struct {
	Username string `json:"id"`
	Password string `json:"password"`
}

// SignInHandler handles user authentication and JWT generation.
func SignInHandler(c echo.Context) error {
	log.Printf("[AUTH] SignIn attempt from IP: %s", c.RealIP())

	var req SignInRequest
	if err := c.Bind(&req); err != nil {
		log.Printf("[AUTH] Invalid request body: %v", err)
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request format"})
	}


	// --- Security: Input Validation ---
	if req.Username == "" || req.Password == "" {
		log.Printf("[AUTH] Empty credentials provided")
		// Use a generic error message to prevent user enumeration attacks.
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid username or password"})
	}

	log.Printf("[AUTH] Attempting to authenticate user: %s", req.Username)

	// Fetch user from the database by username.
	var user models.User
	if err := db.DB.Where("username = ?", req.Username).First(&user).Error; err != nil {
		log.Printf("[AUTH] Authentication failed for user '%s': %v", req.Username, err)
		// Again, use a generic error to avoid confirming if a user exists.
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid username or password"})
	}

	log.Printf("[AUTH] User found in database: %s (ID: %d, IsAdmin: %t)", user.Username, user.ID, user.IsAdmin)

	// --- Security: Password Hashing ---
	// Compare the provided password with the stored hash.
	// Your user model should store a hashed password, not plain text.
	if err := bcrypt.CompareHashAndPassword([]byte(user.Password), []byte(req.Password)); err != nil {
		// --- Best Practices: Differentiate Error Types ---
		// Distinguish between a password mismatch and other errors (e.g., invalid hash).
		if err == bcrypt.ErrMismatchedHashAndPassword {
			log.Printf("[AUTH] Password mismatch for user: %s", req.Username)
		} else {
			log.Printf("[AUTH] Error comparing password for user %s: %v. This may indicate an invalid hash format in the database.", req.Username, err)
		}
		return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid username or password"})
	}

	log.Printf("[AUTH] Password verified for user: %s", req.Username)

	// Define token expiration time.
	expirationTime := time.Now().Add(24 * time.Hour)

	// Create the JWT claims.
	claims := &Claims{
		UserID:  uint(user.ID),
		IsAdmin: user.IsAdmin,
		RegisteredClaims: jwt.RegisteredClaims{
			ExpiresAt: jwt.NewNumericDate(expirationTime),
			IssuedAt:  jwt.NewNumericDate(time.Now()),
			Subject:   fmt.Sprintf("%d", user.ID),
		},
	}

	// Create and sign the token.
	token := jwt.NewWithClaims(jwt.SigningMethodHS256, claims)
	tokenString, err := token.SignedString(jwtKey)
	if err != nil {
		log.Printf("[AUTH] Failed to create JWT token for user %s: %v", req.Username, err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to generate token"})
	}

	log.Printf("[AUTH] Successfully authenticated user: %s (IsAdmin: %t)", user.Username, user.IsAdmin)

	// Return the token to the client.
	return c.JSON(http.StatusOK, map[string]interface{}{
		"token":    tokenString,
		"is_admin": user.IsAdmin,
	})
}

// JWTMiddleware validates the JWT token from the Authorization header.
func JWTMiddleware(next echo.HandlerFunc) echo.HandlerFunc {
	return func(c echo.Context) error {
		log.Printf("[JWT] Validating token for %s %s from IP: %s", c.Request().Method, c.Request().URL.Path, c.RealIP())

		authHeader := c.Request().Header.Get("Authorization")
		if authHeader == "" {
			log.Println("[JWT] Missing Authorization header")
			return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Authorization header is required"})
		}

		// Check for "Bearer " prefix and extract the token.
		tokenString := strings.TrimPrefix(authHeader, "Bearer ")
		if tokenString == authHeader { // No prefix found
			log.Println("[JWT] Invalid Authorization header format")
			return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid token format"})
		}

		claims := &Claims{}
		token, err := jwt.ParseWithClaims(tokenString, claims, func(token *jwt.Token) (interface{}, error) {
			// Ensure the signing method is what you expect.
			if _, ok := token.Method.(*jwt.SigningMethodHMAC); !ok {
				return nil, fmt.Errorf("unexpected signing method: %v", token.Header["alg"])
			}
			return jwtKey, nil
		})

		if err != nil || !token.Valid {
			log.Printf("[JWT] Invalid or expired token: %v", err)
			return c.JSON(http.StatusUnauthorized, map[string]string{"error": "Invalid or expired token"})
		}

		log.Printf("[JWT] Token validated for user ID: %d (IsAdmin: %t)", claims.UserID, claims.IsAdmin)

		// --- Best Practices: Pass Claims via Context ---
		// Store the entire claims object in the context for handlers to use.
		c.Set(string(userContextKey), claims)

		return next(c)
	}
}
