import { redirect } from "next/navigation";

/** This local build has no sign-in flow; send old links straight to the app. */
export default function SignInRedirect() {
  redirect("/");
}
