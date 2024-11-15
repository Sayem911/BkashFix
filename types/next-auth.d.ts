import NextAuth from 'next-auth';

declare module 'next-auth' {
  interface Session {
    user: {
      id: string;
      email: string;
      name: string;
      image?: string;
      role: 'admin' | 'reseller' | 'customer';
      status: 'active' | 'pending' | 'suspended';
    };
  }

  interface User {
    id: string;
    email: string;
    name: string;
    image?: string;
    role: 'admin' | 'reseller' | 'customer';
    status: 'active' | 'pending' | 'suspended';
  }
}