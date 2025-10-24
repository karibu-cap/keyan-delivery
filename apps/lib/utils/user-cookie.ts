// lib/utils/user-cookie.ts
// Utility to update user data cookie for middleware access

/**
 * Updates the user data cookie by calling the API
 * This should be called after login, signup, or any user data change
 */
export async function updateUserCookie(): Promise<void> {
    try {
        const response = await fetch('/api/v1/auth/set-user-cookie', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
        });

        if (!response.ok) {
            console.error('Failed to update user cookie:', await response.text());
        }
    } catch (error) {
        console.error('Error updating user cookie:', error);
    }
}

/**
 * Clears the user data cookie (called on logout)
 */
export async function clearUserCookie(): Promise<void> {
    try {
        // The cookie will be cleared by setting it with maxAge: 0
        document.cookie = 'yetu-user-data=; path=/; max-age=0';
    } catch (error) {
        console.error('Error clearing user cookie:', error);
    }
}
