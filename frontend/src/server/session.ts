/* eslint-disable @typescript-eslint/no-explicit-any -- intentional loose session shape for legacy callers */
/**
 * Local, login-free identity used throughout this self-hosted build.
 *
 * Every server route resolves the current user here, so there is no sign-in
 * flow and no session lookup. Clipping behaviour is unchanged: the same user
 * id is used for tasks, uploads, preferences, and every other resource.
 */
export async function getServerSession() {
  return {
    user: {
      id: process.env.SUPOCLIP_LOCAL_USER_ID ?? "local-user",
      name: "Local User",
      email: "local@example.com",
      emailVerified: true,
      is_admin: true,
      createdAt: new Date(0),
    },
  } as any;
}
