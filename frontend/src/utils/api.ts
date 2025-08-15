import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_BASE_URL

const getToken = () => {
    return localStorage.getItem('token') || '';
};

export const signIn = async (id: string, password: string) => {
    try {
        // Prepend the base URL to the endpoint
        const response = await axios.post(`${API_BASE_URL}/api/auth/signin`, { id, password });
        return response.data;
    } catch (error) {
        if (error instanceof Error && (error as any).response) {
            throw new Error((error as any).response.data.message || 'Sign in failed');
        }
        throw new Error('Sign in failed');
    }
};


export const addRecipe = async (recipe: any) => {
    const token = getToken();
    try {
        // Prepend the base URL to the endpoint
        const response = await axios.post(`${API_BASE_URL}/api/recipes/add`, recipe, {
            headers: { Authorization: `Bearer ${token}` }
        });
        return response.data;
    } catch (error) {
        if (error instanceof Error && (error as any).response) {
            throw new Error((error as any).response.data.message || 'Failed to add recipe');
        }
        throw new Error('Failed to add recipe');
    }
};


export const deleteRecipe = async (recipeName: string) => {
    const token = getToken();
    try {
        // Prepend the base URL to the endpoint
        const response = await axios.delete(`${API_BASE_URL}/api/recipes/delete`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { recipeName }
        });
        return response.data;
    } catch (error) {
        if (error instanceof Error && (error as any).response) {
            throw new Error((error as any).response.data.message || 'Failed to delete recipe');
        }
        throw new Error('Failed to delete recipe');
    }
};


export const getRecipe = async (recipeName: string, numberOfChildren: number) => {
    const token = getToken();
    try {
        // Prepend the base URL to the endpoint
        const response = await axios.get(`${API_BASE_URL}/api/recipes/get`, {
            headers: { Authorization: `Bearer ${token}` },
            params: { name: recipeName, children: numberOfChildren }
        });
        return response.data;
    } catch (error) {
        if (error instanceof Error && (error as any).response) {
            throw new Error((error as any).response.data.message || 'Failed to get recipe');
        }
        throw new Error('Failed to get recipe');
    }
};
