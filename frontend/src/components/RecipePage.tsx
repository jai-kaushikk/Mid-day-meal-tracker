import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { addRecipe, deleteRecipe, getRecipe } from '../utils/api';
import axios from 'axios';

function getLocalStorageItem(name: string) {
    return localStorage.getItem(name) || '';
}

const RecipePage = () => {
    const [recipeName, setRecipeName] = useState('');
    const [ingredients, setIngredients] = useState([{ name: '', weight: '' }]);
    const [childrenCount, setChildrenCount] = useState(1);
    const [fetchedRecipe, setFetchedRecipe] = useState<any>(null);
    const [errorMsg, setErrorMsg] = useState('');
    const [isAdmin, setIsAdmin] = useState(false);
    const [adminMsg, setAdminMsg] = useState('');
    const [newUser, setNewUser] = useState({ id: '', password: '', idAdmin: false });
    const token = getLocalStorageItem('token');
    const userId = getLocalStorageItem('user_id');

    useEffect(() => {
        const isAdminString = localStorage.getItem('is_admin');
        setIsAdmin(isAdminString ? JSON.parse(isAdminString) : false);
    }, []);

    const handleAddIngredient = () => {
        setIngredients([...ingredients, { name: '', weight: '' }]);
    };

    const handleIngredientChange = (index: number, field: 'name' | 'weight', value: string) => {
        const newIngredients = [...ingredients];
        newIngredients[index] = {
            ...newIngredients[index],
            [field]: value
        };
        setIngredients(newIngredients);
    };


    const handleAddRecipe = async () => {
        setErrorMsg('');
        if (!isAdmin) return;
        try {
            const ingredientsWithNumbers = ingredients.map(ing => ({
                ...ing,
                weight: parseInt(ing.weight, 10) || 0,
            }));
            await addRecipe({ name: recipeName, ingredients: ingredientsWithNumbers });
            setRecipeName('');
            setIngredients([{ name: '', weight: '' }]);
        } catch (err: any) {
            setErrorMsg(err.message || 'Failed to add recipe');
        }
    };


    const handleDeleteRecipe = async () => {
        setErrorMsg('');
        if (!isAdmin) return;
        try {
            await deleteRecipe(recipeName);
            setRecipeName('');
        } catch (err: any) {
            setErrorMsg(err.message || 'Failed to delete recipe');
        }
    };


    const handleGetRecipe = async () => {
        setErrorMsg('');
        try {
            const recipe = await getRecipe(recipeName, childrenCount);
            setFetchedRecipe(recipe as any);
        } catch (err: any) {
            setFetchedRecipe(null);
            setErrorMsg(err.message || 'Failed to get recipe');
        }
    };

    const handleCreateUser = async () => {
        if (!isAdmin) return;
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/admin/create', newUser, {
                headers: { Authorization: `Bearer ${token}` },
            });
            setAdminMsg('User created successfully');
            setNewUser({ id: '', password: '', idAdmin: false });
        } catch (err) {
            setAdminMsg('Error creating user');
        }
    };

    return (
        <div style={{ minHeight: '100vh', background: 'linear-gradient(135deg, #f8fafc 0%, #e0e7ff 100%)', padding: 0, margin: 0 }}>
            {errorMsg && (
                <div style={{ color: '#ef4444', textAlign: 'center', marginBottom: 16, fontWeight: 600 }}>{errorMsg}</div>
            )}
            <div style={{ maxWidth: 700, margin: '0 auto', padding: 32 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 32 }}>
                    <h1 style={{ color: '#4f46e5', fontWeight: 700, letterSpacing: 1, margin: 0 }}>Recipe Management</h1>
                    {isAdmin && (
                        <Link to="/admin" style={{ background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)', color: '#fff', textDecoration: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 600, fontSize: 15, boxShadow: '0 2px 8px rgba(99,102,241,0.08)' }}>
                            Admin Panel
                        </Link>
                    )}
                </div>
                {isAdmin && (
                    <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(99,102,241,0.08)', padding: 24, marginBottom: 32 }}>
                        <h2 style={{ color: '#6366f1', fontWeight: 600 }}>Admin: Create User</h2>
                        <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
                            <input
                                type="text"
                                placeholder="User ID"
                                value={newUser.id}
                                onChange={e => setNewUser({ ...newUser, id: e.target.value })}
                                style={{ padding: 8, borderRadius: 8, border: '1px solid #c7d2fe', fontSize: 15, minWidth: 120 }}
                            />
                            <input
                                type="password"
                                placeholder="Password"
                                value={newUser.password}
                                onChange={e => setNewUser({ ...newUser, password: e.target.value })}
                                style={{ padding: 8, borderRadius: 8, border: '1px solid #c7d2fe', fontSize: 15, minWidth: 120 }}
                            />
                            <label style={{ marginLeft: 8, fontWeight: 500, color: '#374151' }}>
                                <input
                                    type="checkbox"
                                    checked={newUser.idAdmin}
                                    onChange={e => setNewUser({ ...newUser, idAdmin: e.target.checked })}
                                />{' '}
                                Is Admin
                            </label>
                            <button onClick={handleCreateUser} style={{ background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)', color: '#fff', border: 'none', borderRadius: 8, padding: '10px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer', boxShadow: '0 2px 8px rgba(99,102,241,0.08)' }}>Create User</button>
                        </div>
                        {adminMsg && <div style={{ color: 'green', marginTop: 8 }}>{adminMsg}</div>}
                    </div>
                )}
                {isAdmin && (
                    <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(99,102,241,0.08)', padding: 24, marginBottom: 32 }}>
                        <h2 style={{ color: '#6366f1', fontWeight: 600 }}>Add Recipe</h2>
                        <input
                            type="text"
                            placeholder="Recipe Name"
                            value={recipeName}
                            onChange={(e) => setRecipeName(e.target.value)}
                            style={{ padding: 8, borderRadius: 8, border: '1px solid #c7d2fe', fontSize: 15, marginBottom: 10 }}
                        />
                        {ingredients.map((ingredient, index) => (
                            <div key={index} style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
                                <input
                                    type="text"
                                    placeholder="Ingredient Name"
                                    value={ingredient.name}
                                    onChange={(e) => handleIngredientChange(index, 'name', e.target.value)}
                                    style={{ padding: 8, borderRadius: 8, border: '1px solid #c7d2fe', fontSize: 15, minWidth: 120 }}
                                />
                                <input
                                    type="number"
                                    placeholder="Weight (gm)"
                                    value={ingredient.weight}
                                    onChange={(e) => handleIngredientChange(index, 'weight', e.target.value)}
                                    style={{ padding: 8, borderRadius: 8, border: '1px solid #c7d2fe', fontSize: 15, minWidth: 120 }}
                                />
                            </div>
                        ))}
                        <button onClick={handleAddIngredient} style={{ marginRight: 8, background: '#e0e7ff', color: '#4f46e5', border: 'none', borderRadius: 8, padding: '8px 14px', fontWeight: 500, fontSize: 15, cursor: 'pointer' }}>Add Ingredient</button>
                        <button onClick={handleAddRecipe} style={{ background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Add Recipe</button>
                    </div>
                )}
                {isAdmin && (
                    <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(99,102,241,0.08)', padding: 24, marginBottom: 32 }}>
                        <h2 style={{ color: '#6366f1', fontWeight: 600 }}>Delete Recipe</h2>
                        <input
                            type="text"
                            placeholder="Recipe Name"
                            value={recipeName}
                            onChange={(e) => setRecipeName(e.target.value)}
                            style={{ padding: 8, borderRadius: 8, border: '1px solid #c7d2fe', fontSize: 15, marginBottom: 10 }}
                        />
                        <button onClick={handleDeleteRecipe} style={{ background: 'linear-gradient(90deg, #ef4444 0%, #f87171 100%)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Delete Recipe</button>
                    </div>
                )}
                <div style={{ background: '#fff', borderRadius: 12, boxShadow: '0 2px 12px rgba(99,102,241,0.08)', padding: 24 }}>
                    <h2 style={{ color: '#6366f1', fontWeight: 600 }}>Get Recipe</h2>
                    <input
                        type="text"
                        placeholder="Recipe Name"
                        value={recipeName}
                        onChange={(e) => setRecipeName(e.target.value)}
                        style={{ padding: 8, borderRadius: 8, border: '1px solid #c7d2fe', fontSize: 15, marginBottom: 10 }}
                    />
                    <input
                        type="number"
                        placeholder="Number of Children"
                        value={childrenCount}
                        onChange={(e) => setChildrenCount(Number(e.target.value))}
                        style={{ padding: 8, borderRadius: 8, border: '1px solid #c7d2fe', fontSize: 15, marginBottom: 10 }}
                    />
                    <button onClick={handleGetRecipe} style={{ background: 'linear-gradient(90deg, #6366f1 0%, #818cf8 100%)', color: '#fff', border: 'none', borderRadius: 8, padding: '8px 18px', fontWeight: 600, fontSize: 15, cursor: 'pointer' }}>Get Recipe</button>
                    {fetchedRecipe && (
                        <div style={{ marginTop: 18 }}>
                            <h3 style={{ color: '#4f46e5', fontWeight: 600 }}>Fetched Recipe:</h3>
                            <pre style={{ background: '#f3f4f6', borderRadius: 8, padding: 16, fontSize: 15 }}>{JSON.stringify(fetchedRecipe, null, 2)}</pre>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RecipePage;
