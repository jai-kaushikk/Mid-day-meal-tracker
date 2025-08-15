package models

// Ingredient defines the structure for a single ingredient.
type Ingredient struct {
	Name   string `json:"name"`
	Weight int    `json:"weight"`
}

// Recipe defines the structure for a recipe, now using a slice of Ingredients.
type Recipe struct {
	Name        string       `json:"name"`
	Ingredients []Ingredient `json:"ingredients"`
}
