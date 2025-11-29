import NextAuth from "next-auth";
import Google from "next-auth/providers/google";
import Credentials from "next-auth/providers/credentials";

export const { handlers, signIn, signOut, auth } = NextAuth({
  providers: [
    Google({
      clientId: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    }),
    Credentials({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        // TODO: Replace with actual API call to your backend
        // For now, this is a mock implementation
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        // Mock user - replace with actual database lookup
        const user = {
          id: "1",
          email: credentials.email as string,
          walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
        };

        return user;
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user, account }) {
      if (user) {
        token.id = user.id;
        token.walletAddress = (user as any).walletAddress;

        // If signing in with Google, register the user in the backend
        if (account?.provider === "google" && user.email) {
          console.log('[Auth] Google sign-in detected, calling backend...', {
            email: user.email,
            apiUrl: process.env.NEXT_PUBLIC_API_URL,
          });
          try {
            // Call backend API to register Google user
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/auth/register`, {
              method: 'POST',
              headers: {
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                email: user.email,
                provider: 'google',
              }),
            });

            console.log('[Auth] Backend response status:', response.status);

            if (response.ok) {
              const data = await response.json();
              console.log('[Auth] Backend registration successful:', data.user.email);
              // Store the backend user data
              token.id = data.user.id;
              token.walletAddress = data.user.walletAddress;
              token.accessToken = data.accessToken;
            } else if (response.status === 409) {
              // User already exists, try to login
              console.log('[Auth] User already exists, attempting to fetch user data');
              // We'll handle this in the session callback
            } else {
              const errorText = await response.text();
              console.error('[Auth] Backend error:', response.status, errorText);
            }
          } catch (error) {
            console.error('[Auth] Failed to register Google user:', error);
          }
        }
      }
      return token;
    },
    async session({ session, token }) {
      console.log('[Auth] Session callback - token data:', {
        hasId: !!token.id,
        hasWallet: !!token.walletAddress,
        hasToken: !!token.accessToken,
      });

      if (session.user) {
        (session.user as any).id = token.id;
        (session.user as any).walletAddress = token.walletAddress;
        (session.user as any).accessToken = token.accessToken;
      }
      return session;
    },
  },
  pages: {
    signIn: "/login",
  },
  session: {
    strategy: "jwt",
  },
});
