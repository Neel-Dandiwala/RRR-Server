"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validation = void 0;
const validation = (credentials) => {
    if (!credentials.email.includes("@")) {
        return [
            {
                field: "email",
                message: "Invalid Email Address",
            }
        ];
    }
    if (credentials.username.length < 6) {
        return [
            {
                field: "username",
                message: "Username must be at least 6 characters",
            }
        ];
    }
    if (credentials.password.length < 8) {
        return [
            {
                field: "password",
                message: "Password must be at least 8 characters",
            }
        ];
    }
    return null;
};
exports.validation = validation;
//# sourceMappingURL=validation.js.map