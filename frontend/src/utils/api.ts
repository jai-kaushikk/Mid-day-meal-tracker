import axios from 'axios';

const getToken = () => {
    return localStorage.getItem('token') || '';
};

export const signIn = async (id: string, password: string) => {
    try {
        const response = await axios.post('/api/auth/signin', { id, password });
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
        const response = await axios.post('/api/recipes/add', recipe, {
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
        const response = await axios.delete('/api/recipes/delete', {
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
        const response = await axios.get('/api/recipes/get', {
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
