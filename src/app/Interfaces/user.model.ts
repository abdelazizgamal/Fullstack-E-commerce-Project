export interface Address {
  country: string;
  city: string;
}

export interface User {
  id?: number;              // json-server will generate id
  fullName: string;
  email: string;
  password: string;        // Phase-1: stored plaintext in db.json (NOT for production)
  role: 'user' | 'admin';
  address: Address;
  createdAt: string;       // ISO string
}
