import React, { useState } from 'react';
import axios from 'axios';

const AdminPanel = () => {
    const [recipeName, setRecipeName] = useState('');
    const [ingredients, setIngredients] = useState([{ name: '', value: '' }]);
    const [message, setMessage] = useState('');

    const handleAddIngredient = () => {
        setIngredients([...ingredients, { name: '', value: '' }]);
    };

    const handleIngredientChange = (index: number, field: 'name' | 'value', value: string) => {
        const newIngredients = [...ingredients];
        newIngredients[index] = {
            ...newIngredients[index],
            [field]: value
        };
        setIngredients(newIngredients);
    };

    const handleAddRecipe = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.post('/api/recipes/add', {
                name: recipeName,
                ingredients: ingredients.filter(ing => ing.name && ing.value),
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage((response.data as { message: string }).message);
        } catch (error) {
            setMessage('Error adding recipe');
        }
    };

    const handleDeleteRecipe = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`/api/recipes/delete/${recipeName}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setMessage((response.data as { message: string }).message);
        } catch (error) {
            setMessage('Error deleting recipe');
        }
    };

    const handleGetRecipe = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`/api/recipes/get/${recipeName}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = response.data as { name: string; ingredients: any[] };
            setMessage(`Recipe: ${data.name}, Ingredients: ${JSON.stringify(data.ingredients)}`);
        } catch (error) {
            setMessage('Error fetching recipe');
        }
    };

    return (
        <div>
            <h1>Admin Panel</h1>
            <div>
                <h2>Add Recipe</h2>
                <input
                    type="text"
                    placeholder="Recipe Name"
                    value={recipeName}
                    onChange={(e) => setRecipeName(e.target.value)}
                />
                {ingredients.map((ingredient, index) => (
                    <div key={index}>
                        <input
                            type="text"
                            placeholder="Ingredient Name"
                            value={ingredient.name}
                            onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                        />
                        <input
                            type="text"
                            placeholder="Ingredient Value"
                            value={ingredient.value}
                            onChange={(e) => handleIngredientChange(index, 'value', e.target.value)}
                        />
                    </div>
                ))}
                <button onClick={handleAddIngredient}>Add Ingredient</button>
                <button onClick={handleAddRecipe}>Submit Recipe</button>
            </div>
            <div>
                <h2>Delete Recipe</h2>
                <input
                    type="text"
                    placeholder="Recipe Name"
                    value={recipeName}
                    onChange={(e) => setRecipeName(e.target.value)}
                />
                <button onClick={handleDeleteRecipe}>Delete Recipe</button>
            </div>
            <div>
                <h2>Get Recipe</h2>
                <input
                    type="text"
                    placeholder="Recipe Name"
                    value={recipeName}
                    onChange={(e) => setRecipeName(e.target.value)}
                />
                <button onClick={handleGetRecipe}>Get Recipe</button>
            </div>
            {message && <p>{message}</p>}
        </div>
    );
};

export default AdminPanel;
