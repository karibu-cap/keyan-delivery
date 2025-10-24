
export const deleteDriver = async (driverId: string) => {
    try {
        const result = await fetch(`/api/admin/drivers/${driverId}`, {
            method: "DELETE",
        });
        const data = await result.json();
        return data;
    } catch (error) {
        console.error(error);
        return { error: "Failed to delete the driver " + error };
    }
}

export const approveDriver = async (driverId: string) => {
    try {
        const result = await fetch(`/api/admin/drivers/${driverId}/approve`, {
            method: "PATCH",
        });
        const data = await result.json();
        return data;
    } catch (error) {
        console.error(error);
        return { error: "Failed to approve the driver " + error };
    }
}

export const rejectDriver = async (driverId: string) => {
    try {
        const result = await fetch(`/api/admin/drivers/${driverId}/reject`, {
            method: "PATCH",
        });
        const data = await result.json();
        return data;
    } catch (error) {
        console.error(error);
        return { error: "Failed to reject the driver " + error };
    }
}

export const banDriver = async (driverId: string) => {
    try {
        const result = await fetch(`/api/admin/drivers/${driverId}/ban`, {
            method: "PATCH",
        });
        const data = await result.json();
        return data;
    } catch (error) {
        console.error(error);
        return { error: "Failed to reject the driver " + error };
    }
}

export const unbanDriver = async (driverId: string) => {
    try {
        const result = await fetch(`/api/admin/drivers/${driverId}/unban`, {
            method: "PATCH",
        });
        const data = await result.json();
        return data;
    } catch (error) {
        console.error(error);
        return { error: "Failed to reject the driver " + error };
    }
}


