interface LoginDto{
    username: string;
    password: string;
}


export async function login(login: LoginDto){
    try {
        const response = await fetch("http://localhost:8080/api/auth/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(login),
        });
    
        if (!response.ok) {   
            console.log("login erro")
        }

        const data = await response.json();
        localStorage.setItem("token", data.token);
        return data;
    } catch (error) {
        console.error("Login failed:", error);
        throw error;
    }
}