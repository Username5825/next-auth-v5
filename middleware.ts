import NextAuth from "next-auth";
import authConfig from "@/auth.config";
import {DEFAULT_LOGIN_REDIRECT, apiAuthPrefix, authRoutes, publicRoutes} from "@/routes"; // 💡


const { auth } = NextAuth(authConfig);


export default auth((req) => {
  const { nextUrl } = req;
  const isLoggedIn = !!req.auth; // boolean
  // console.log("IS LOGGED IN: ", isLoggedIn)

  const isApiAuthRoute = nextUrl.pathname.startsWith(apiAuthPrefix);
  const isPublicRoute = publicRoutes.includes(nextUrl.pathname);
  const isAuthRoute = authRoutes.includes(nextUrl.pathname);

  // CHECK 1
  if (isApiAuthRoute) {
    return null; // do not do any action (needed for Next auth to work)
  }

  // CHECK 2
  if (isAuthRoute) {
    if (isLoggedIn) {
      return Response.redirect(new URL(DEFAULT_LOGIN_REDIRECT, nextUrl))
    }
    return null;
  }

  // CHECK 3
  if (!isLoggedIn && !isPublicRoute) {
    let callbackUrl = nextUrl.pathname;
    if (nextUrl.search) {
      callbackUrl += nextUrl.search;
    }

    const encodedCallbackUrl = encodeURIComponent(callbackUrl);

    return Response.redirect(new URL(
      `/auth/login?callbackUrl=${encodedCallbackUrl}`,
      nextUrl
    ));
  }

  return null;
})


// 🌐 Regex from Clerk (https://clerk.com/docs/quickstarts/nextjs)
// 💡 It will always invoke the auth function from the middleware (except Regex)
// 💡 This way, every routes are protected BY DEFAULT
export const config = {
  matcher: ['/((?!.+\\.[\\w]+$|_next).*)', '/', '/(api|trpc)(.*)'],
}

