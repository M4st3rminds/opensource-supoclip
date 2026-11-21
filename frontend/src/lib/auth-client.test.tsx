import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";

import { useSession } from "./auth-client";

function SessionView() {
  const { data, isPending } = useSession();
  return <div>{isPending ? "Loading" : data ? `Signed in: ${data.user.id}` : "Sign in required"}</div>;
}

describe("local session", () => {
  it("is always available without a sign-in flow", () => {
    render(<SessionView />);
    expect(screen.getByText("Signed in: local-user")).toBeTruthy();
  });
});
