package handlers

import (
	"fmt"
	"log"
	"my-recipe-app/backend/models"
	"net/http"

	"github.com/labstack/echo/v4"
)

var recipes = make(map[string]models.Recipe)

func AddRecipeHandler(c echo.Context) error {
	claims := c.Get("user").(*Claims)
	userID := claims.UserID
	isAdmin := claims.IsAdmin

	log.Printf("[RECIPE] Add recipe request from user ID: %d (IsAdmin: %t)", userID, isAdmin)

	if !isAdmin {
		log.Printf("[RECIPE] Non-admin user %d attempted to add recipe", userID)
		return c.JSON(http.StatusForbidden, map[string]string{"error": "Admin only"})
	}

	var recipe models.Recipe
	if err := c.Bind(&recipe); err != nil {
		log.Printf("[RECIPE] Invalid recipe data from user %d: %v", userID, err)
		return c.JSON(http.StatusBadRequest, map[string]string{"error": err.Error()})
	}

	log.Printf("[RECIPE] Adding new recipe: %s (by user %d)", recipe.Name, userID)
	recipes[recipe.Name] = recipe

	log.Printf("[RECIPE] Recipe '%s' successfully added. Total recipes: %d", recipe.Name, len(recipes))
	return c.JSON(http.StatusCreated, recipe)
}

func DeleteRecipeHandler(c echo.Context) error {
	claims := c.Get("user").(*Claims)
	userID := claims.UserID
	isAdmin := claims.IsAdmin

	log.Printf("[RECIPE] Delete recipe request from user ID: %d (IsAdmin: %t)", userID, isAdmin)

	if !isAdmin {
		log.Printf("[RECIPE] Non-admin user %d attempted to delete recipe", userID)
		return c.JSON(http.StatusForbidden, map[string]string{"error": "Admin only"})
	}

	var req struct {
		Name string `json:"name"`
	}
	if err := c.Bind(&req); err != nil {
		log.Printf("[RECIPE] Invalid delete request from user %d: %v", userID, err)
		return c.JSON(http.StatusBadRequest, map[string]string{"error": "Invalid request"})
	}

	log.Printf("[RECIPE] Attempting to delete recipe: %s (by user %d)", req.Name, userID)

	if _, exists := recipes[req.Name]; !exists {
		log.Printf("[RECIPE] Recipe '%s' not found for deletion", req.Name)
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Recipe not found"})
	}
	
	delete(recipes, req.Name)
	log.Printf("[RECIPE] Recipe '%s' successfully deleted. Remaining recipes: %d", req.Name, len(recipes))
	return c.NoContent(http.StatusNoContent)
}

func GetRecipesHandler(c echo.Context) error {
	claims := c.Get("user").(*Claims)
	userID := claims.UserID
	name := c.QueryParam("name")
	children := 1
	if c.QueryParam("children") != "" {
		fmt.Sscanf(c.QueryParam("children"), "%d", &children)
	}

	log.Printf("[RECIPE] Get recipes request from user ID: %d (name: '%s', children: %d)", userID, name, children)

	if name == "" {
		// Return all recipes if no name provided
		recipeList := make([]models.Recipe, 0, len(recipes))
		for _, v := range recipes {
			recipeList = append(recipeList, v)
		}
		log.Printf("[RECIPE] Returning all recipes to user %d. Total count: %d", userID, len(recipeList))
		return c.JSON(http.StatusOK, recipeList)
	}

	recipe, exists := recipes[name]
	if !exists {
		log.Printf("[RECIPE] Recipe '%s' not found for user %d", name, userID)
		return c.JSON(http.StatusNotFound, map[string]string{"error": "Recipe not found"})
	}

	// Multiply ingredients by children
	scaledIngredients := make([]models.Ingredient, len(recipe.Ingredients))
	for i, ingredient := range recipe.Ingredients {
		scaledIngredients[i] = models.Ingredient{
			Name:   ingredient.Name,
			Weight: ingredient.Weight * children,
		}
	}

	log.Printf("[RECIPE] Returning recipe '%s' to user %d (scaled for %d children)", name, userID, children)
	return c.JSON(http.StatusOK, map[string]interface{}{
		"name":        recipe.Name,
		"ingredients": scaledIngredients,
	})
}
