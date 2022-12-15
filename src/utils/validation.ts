import { CredentialsInput } from "src/utils/CredentialsInput";

export const validation = (credentials: CredentialsInput) => {
    if(!credentials.email.includes("@")) {
        return [
            {
                field: "email",
                message: "Invalid Email Address",
            }
        ]
    }

    if(credentials.username.length < 6) {
        return [
            {
                field: "username",
                message: "Username must be at least 6 characters",
            }
        ]
    }

    if(credentials.password.length < 8) {
        return [
            {
                field: "password",
                message: "Password must be at least 8 characters",
            }
        ]
    }

    return null;
}