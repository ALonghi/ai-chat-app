export type User = {
    id: string;          // uuid-ish
    name: string;
    email: string;
    password: string;    // plaintext for demo ONLY (replace with hashed later)
};
