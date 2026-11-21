"use client";
/* eslint-disable @typescript-eslint/no-explicit-any -- drop-in stubs for the old auth-client types */

/**
 * Client-side auth stubs for this local, login-free build.
 *
 * The rest of the app imports these names to read the current user. Here the
 * user is a constant local identity, so the whole UI is available without a
 * sign-in screen. Every stub resolves successfully and never redirects.
 */

export const LOCAL_USER = {
  id: "local-user",
  name: "Local User",
  email: "local@example.com",
  emailVerified: true,
  is_admin: true,
};

const LOCAL_SESSION_DATA = { user: LOCAL_USER, session: { id: "local-session" } };

const emptyRefetch = async () => {};

export function useSession() {
  return {
    data: LOCAL_SESSION_DATA,
    isPending: false,
    isError: false,
    refetch: emptyRefetch,
    error: null,
  } as any;
}

export async function signIn() {
  return { data: LOCAL_SESSION_DATA, error: null } as any;
}

export async function signOut() {
  return { data: null, error: null } as any;
}

export async function signUp() {
  return { data: LOCAL_SESSION_DATA, error: null } as any;
}

export async function requestPasswordReset() {
  return { data: null, error: null } as any;
}

export async function resetPassword() {
  return { data: null, error: null } as any;
}

export async function getSession() {
  return { data: LOCAL_SESSION_DATA, error: null } as any;
}

const harmless = async () => ({ data: null, error: null });

/** Drop-in replacement for the Better Auth client: every call is a local no-op. */
export const authClient = {
  getSession,
  signIn,
  signOut,
  signUp,
  requestPasswordReset,
  resetPassword,
  sendVerificationEmail: harmless,
  useSession,
  signInWithOAuth: harmless,
  linkSocialAccount: harmless,
  listAccounts: harmless,
} as any;
