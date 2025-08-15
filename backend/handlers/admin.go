package handlers

import (
	"log"
	"my-recipe-app/backend/db"
	"my-recipe-app/backend/models"
	"net/http"

	"github.com/labstack/echo/v4"
	"golang.org/x/crypto/bcrypt"
)

// CreateAdminHandler handles the creation of new users by an admin.
func CreateAdminHandler(c echo.Context) error {
	claims := c.Get("user").(*Claims)
	if !claims.IsAdmin {
		return c.JSON(http.StatusForbidden, map[string]string{"error": "Admin access required"})
	}

	var req struct {
		Username string `json:"id"`
		Password string `json:"password"`
		IsAdmin  bool   `json:"idAdmin"`
	}

	if err := c.Bind(&req); err != nil {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request format"})
	}

	if req.Username == "" || req.Password == "" {
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Username and password are required"})
	}

	hashedPassword, err := bcrypt.GenerateFromPassword([]byte(req.Password), bcrypt.DefaultCost)
	if err != nil {
		log.Printf("[ADMIN] Error hashing password for user %s: %v", req.Username, err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to process password"})
	}

	newUser := models.User{
		Username: req.Username,
		Password: string(hashedPassword),
		IsAdmin:  req.IsAdmin,
	}

	if err := db.DB.Create(&newUser).Error; err != nil {
		log.Printf("[ADMIN] Error creating user %s: %v", req.Username, err)
		return c.JSON(http.StatusInternalServerError, map[string]string{"error": "Failed to create user"})
	}

	log.Printf("[ADMIN] User %s created successfully by admin %d", newUser.Username, claims.UserID)
	return c.JSON(http.StatusCreated, map[string]string{"message": "User created successfully"})
}
