import { redirect } from "next/navigation";

/** This local build has no sign-up flow; send old links straight to the app. */
export default function SignUpRedirect() {
  redirect("/");
}
