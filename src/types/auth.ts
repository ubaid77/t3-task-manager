import { DefaultSession } from "next-auth";

export interface User {
  id: string;
  name: string | null;
  email: string | null;
  emailVerified: Date | null;
  image: string | null;
}

export interface Session extends DefaultSession {
  user: User;
}
