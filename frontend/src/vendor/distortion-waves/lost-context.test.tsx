import { act, render, screen, waitFor } from "@testing-library/react";
import { useEffect, useState, type ComponentType, type ReactNode } from "react";
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { DistortionWave, type DistortionWaveProps } from "./index";
import { WaveRenderer } from "./renderer";

/** Minimal stand-in for the old upgrade thank-you: it still renders the wave. */
function WaveHarness({ active, children }: { active: boolean; children: ReactNode }) {
  const [revealed, setRevealed] = useState(false);
  useEffect(() => {
    if (!active) return;
    const timer = window.setTimeout(() => setRevealed(true), 700);
    return () => window.clearTimeout(timer);
  }, [active]);
  if (!active) return <>{children}</>;
  const Wave: ComponentType<DistortionWaveProps> = DistortionWave;
  return (
    <Wave
      revealed={revealed}
      palette="sunset"
      cornerRadius={12}
      prewarm
      onFinish={() => {}}
      revealedContent={<div role="status" className="p-4">Pro</div>}
    >
      <div>{children}</div>
    </Wave>
  );
}

/* Safari can hand out a WebGL2 context that is already lost: it makes no
   shaders, programs or buffers, and every call on it is a no-op. */
function lostContext() {
  const noop = () => undefined;
  return new Proxy(
    {
      VERTEX_SHADER: 0x8b31,
      FRAGMENT_SHADER: 0x8b30,
      isContextLost: () => true,
      createShader: () => null,
      // Like Safari: a null shader is a TypeError, not a no-op.
      shaderSource: (shader: unknown) => {
        if (!shader) throw new TypeError("Argument 1 ('shader') to shaderSource must be an instance of WebGLShader");
      },
      createProgram: () => null,
      createBuffer: () => null,
      createTexture: () => null,
      createFramebuffer: () => null,
      getParameter: () => 0,
    } as Record<string | symbol, unknown>,
    { get: (target, key) => (key in target ? target[key] : noop) },
  );
}

let getContext: ReturnType<typeof vi.fn>;

beforeEach(() => {
  getContext = vi.fn((type: string) => (type === "webgl2" ? lostContext() : null));
  vi.spyOn(HTMLCanvasElement.prototype, "getContext").mockImplementation(getContext as never);
  // jsdom has no ResizeObserver.
  vi.stubGlobal(
    "ResizeObserver",
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
    },
  );
});

afterEach(() => {
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe("a lost WebGL context", () => {
  it("leaves the renderer not ok instead of throwing", () => {
    let renderer: WaveRenderer | undefined;
    expect(() => {
      renderer = new WaveRenderer(document.createElement("canvas"), { alpha: true });
    }).not.toThrow();
    expect(renderer?.ok).toBe(false);
    expect(renderer?.lost).toBe(true);
    expect(() => renderer?.dispose()).not.toThrow();
  });

  it("still shows the upgrade thank-you, without retrying the renderer", async () => {
    const errors: unknown[] = [];
    const onError = (e: ErrorEvent) => errors.push(e.error);
    window.addEventListener("error", onError);
    try {
      render(
        <WaveHarness active>
          <div>plan card</div>
        </WaveHarness>,
      );
      // The thank-you reveals after the card's 700 ms hold.
      await waitFor(() => expect(screen.getByRole("status")).toBeInTheDocument(), { timeout: 3000 });
      await act(async () => {
        await new Promise((resolve) => setTimeout(resolve, 900));
      });
      expect(screen.getByRole("status")).toHaveTextContent("Pro");
      expect(errors).toEqual([]);
      expect(getContext.mock.calls.filter(([type]) => type === "webgl2")).toHaveLength(1);
    } finally {
      window.removeEventListener("error", onError);
    }
  });
});
