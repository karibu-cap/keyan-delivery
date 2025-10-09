import { clientConfig, serverConfig } from "@/auth_config"
import { getTokens, Tokens } from "next-firebase-auth-edge"
import { cookies } from "next/headers"
import { NextRequest } from "next/server"

export const getUserTokensOnApiRoute = async (
    request: NextRequest,
  ): Promise<Tokens | undefined> => {
    const tokens = await getTokens(request.cookies, {
      apiKey: clientConfig.apiKey,
      cookieName: serverConfig.cookieName,
      cookieSignatureKeys: serverConfig.cookieSignatureKeys,
      serviceAccount: serverConfig.serviceAccount,
    })
  
    if (!tokens) {
      return
    }
    return tokens
  }
  
  export const getUserTokens = async (): Promise<Tokens | undefined> => {
    const tokens = await getTokens(await cookies(), {
      apiKey: clientConfig.apiKey,
      cookieName: serverConfig.cookieName,
      cookieSignatureKeys: serverConfig.cookieSignatureKeys,
      serviceAccount: serverConfig.serviceAccount,
    })
  
    if (!tokens) {
      return
    }
    return tokens
  }