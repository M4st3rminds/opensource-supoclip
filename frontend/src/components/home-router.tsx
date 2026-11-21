"use client";

import dynamic from "next/dynamic";

const HomeApp = dynamic(() => import("@/components/home-app"), {
  ssr: false,
});

/** This local build always opens straight into the app — there is no sign-in gate. */
export function HomeRouter() {
  return <HomeApp />;
}
