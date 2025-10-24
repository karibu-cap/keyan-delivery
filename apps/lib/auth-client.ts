import { emailOTPClient, inferAdditionalFields } from "better-auth/client/plugins";
import { createAuthClient } from "better-auth/react";
import type { auth } from "./auth";

const authClient = createAuthClient({
    plugins: [
        emailOTPClient(),
        inferAdditionalFields<typeof auth>()
    ]
});

export const {
  signIn,
  signUp,
  signOut,
  useSession,
  getAccessToken,
} = authClient;

export const getUser = async () => {
    const session = await authClient.getSession();
    return session?.data?.user;
}
