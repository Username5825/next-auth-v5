
/*´:°•.°+.*•´.*:˚.°*.˚•´.°:°•.°•.*•´.*:˚.°*.˚•´.°:°•.°+.*•´.*:*/
/*                💡USED IN MIDDLEWARE💡                     */
/*.•°:°.´+˚.*°.˚:*.´•*.+°.•°:´*.´•*.•°.•°:°.´:•˚°.*°.˚:*.´+°.•*/


// 1️⃣
export const publicRoutes = [
  "/",
  "/auth/new-verification"
];


//2️⃣
export const authRoutes = [
  "/auth/login",
  "/auth/register",
  "/auth/error",
  "/auth/reset",
  "/auth/new-password"
];

//3️⃣
export const apiAuthPrefix = "/api/auth";

//4️⃣
export const DEFAULT_LOGIN_REDIRECT = "/settings"; // we can change it later
