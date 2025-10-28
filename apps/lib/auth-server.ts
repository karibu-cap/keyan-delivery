import { headers } from "next/headers";
import { auth } from "./auth";

export const getSession = async () => {

  const session = await auth.api.getSession({
    headers: await headers()

  });
  return session;

};

export const getUser = async () => {
  const session = await getSession();
  return session?.user;
}

export async function verifySession() {
  const session = await getSession();

  if (!session?.user) {
    return null;
  }

  return session;
}
