"use client";

import { useState, useEffect } from "react";
import { useTranslations } from "next-intl";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

import { Alert, AlertDescription } from "@/components/ui/alert";
import { Skeleton } from "@/components/ui/skeleton";
import { Select, SelectContent, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Slider } from "@/components/ui/slider";
import { Switch } from "@/components/ui/switch";
import { useSession } from "@/lib/auth-client";
import { useSocialAccess } from "@/hooks/use-social-access";
import { LanguageSwitcher } from "@/components/language-switcher";
import { track } from "@/lib/datafast";
import Link from "next/link";
import { AlertCircle, Check, ChevronRight, Info, Languages, Loader2, Mail, Share2, Type } from "lucide-react";
import { cn } from "@/lib/utils";
import { DEFAULT_SITE_URL, GITHUB_URL } from "@/lib/site";
import { FontSelectOption, type FontOption } from "@/components/font-select-option";

interface UserPreferences {
  fontFamily: string;
  fontSize: number;
  fontColor: string;
  notifyOnCompletion: boolean;
}

export default function SettingsPage() {
  const [fontFamily, setFontFamily] = useState("TikTokSans-Regular");
  const [fontSize, setFontSize] = useState(24);
  const [fontColor, setFontColor] = useState("#FFFFFF");
  const [completionEmails, setCompletionEmails] = useState(true);
  const [availableFonts, setAvailableFonts] = useState<FontOption[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetching, setIsFetching] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [savedSnapshot, setSavedSnapshot] = useState<string | null>(null);
  const { data: session } = useSession();
  const socialAccess = useSocialAccess(Boolean(session?.user));
  const t = useTranslations("settings");
  const tLang = useTranslations("language");

  // Load available fonts from backend and inject them into the page
  useEffect(() => {
    const loadFonts = async () => {
      try {
        const response = await fetch('/api/fonts', { cache: 'no-store' });
        if (response.ok) {
          const data = await response.json();
          setAvailableFonts(data.fonts || []);

          // Dynamically load fonts using @font-face
          const fontFaceStyles = data.fonts.map((font: { name: string }) => {
            return `
              @font-face {
                font-family: '${font.name}';
                src: url('/api/fonts/${font.name}') format('truetype');
                font-weight: normal;
                font-style: normal;
              }
            `;
          }).join('\n');

          const styleElement = document.createElement('style');
          styleElement.id = 'custom-fonts';
          styleElement.innerHTML = fontFaceStyles;

          const existingStyle = document.getElementById('custom-fonts');
          if (existingStyle) {
            existingStyle.remove();
          }

          document.head.appendChild(styleElement);
        }
      } catch (fontError) {
        console.error('Failed to load fonts:', fontError);
      }
    };

    loadFonts();
  }, []);

  // Load user preferences
  useEffect(() => {
    if (!session?.user?.id) return;
    let cancelled = false;
    setIsFetching(true);
    const loadPreferences = async () => {
      try {
        const response = await fetch('/api/preferences');
        if (response.ok) {
          const data: UserPreferences = await response.json();
          if (cancelled) return;
          setFontFamily(data.fontFamily);
          setFontSize(data.fontSize);
          setFontColor(data.fontColor);
          setCompletionEmails(data.notifyOnCompletion ?? true);
          setSavedSnapshot(JSON.stringify([data.fontFamily, data.fontSize, data.fontColor, data.notifyOnCompletion ?? true]));
        }
      } catch (preferencesError) {
        console.error('Failed to load preferences:', preferencesError);
      } finally {
        if (!cancelled) setIsFetching(false);
      }
    };

    void loadPreferences();
    return () => { cancelled = true; };
  }, [session?.user?.id]);

  const handleSavePreferences = async () => {
    setIsLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await fetch('/api/preferences', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          fontFamily,
          fontSize,
          fontColor,
          notifyOnCompletion: completionEmails,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || t("save.failed"));
      }

      track("preferences_saved");
      setSavedSnapshot(JSON.stringify([fontFamily, fontSize, fontColor, completionEmails]));
      setSuccess(true);
      setTimeout(() => setSuccess(false), 3000);
    } catch (saveError) {
      console.error('Error saving preferences:', saveError);
      setError(saveError instanceof Error ? saveError.message : t("save.failed"));
    } finally {
      setIsLoading(false);
    }
  };

  if (isFetching) {
    return (
      <div role="status" className="mx-auto w-full max-w-3xl space-y-6 px-4 py-8 sm:px-8 md:py-10">
        <Skeleton className="h-9 w-40" />
        {[0, 1, 2].map((key) => <Skeleton key={key} className="h-40 w-full rounded-2xl" />)}
      </div>
    );
  }

  const dirty = savedSnapshot !== null && savedSnapshot !== JSON.stringify([fontFamily, fontSize, fontColor, completionEmails]);
  const showSaveBar = dirty || isLoading || success;

  return (
    <main className={cn("mx-auto w-full max-w-3xl px-4 pt-8 sm:px-8 md:pt-10", showSaveBar ? "pb-32" : "pb-16")}>
      <h1 className="font-display text-3xl font-bold tracking-tight">{t("title")}</h1>
      <p className="mt-1 text-sm text-muted-foreground">{t("intro")}</p>

      <div className="mt-8 space-y-6">
        <Section icon={<Languages className="size-4" />} title={tLang("label")} description={t("languageDescription")}>
          <LanguageSwitcher />
        </Section>

        <Section tour="settings-captions" icon={<Type className="size-4" />} title={t("captions.title")} description={t("captions.description")}>
          <div className="grid gap-6 sm:grid-cols-[minmax(0,1fr)_150px]">
            <div className="space-y-5">
              <div className="space-y-2">
                <Label htmlFor="caption-default-font" className="text-sm">{t("captions.font")}</Label>
                <Select value={fontFamily} onValueChange={setFontFamily} disabled={isLoading}>
                  <SelectTrigger id="caption-default-font" className="w-full"><SelectValue placeholder={t("captions.selectFont")} /></SelectTrigger>
                  <SelectContent>
                    {availableFonts.map((font) => (
                      <FontSelectOption key={font.name} font={font} />
                    ))}
                    {availableFonts.length === 0 && <FontSelectOption font={{ name: "TikTokSans-Regular", display_name: "TikTok Sans Regular", scope: "system" }} />}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <Label className="text-sm">{t("captions.size")}</Label>
                  <span className="text-xs tabular-nums text-muted-foreground">{fontSize}px</span>
                </div>
                <Slider value={[fontSize]} onValueChange={(value) => setFontSize(value[0])} max={48} min={12} step={2} disabled={isLoading} aria-label={t("captions.fontSize")} />
              </div>

              <div className="space-y-2">
                <Label className="text-sm">{t("captions.color")}</Label>
                <div className="flex flex-wrap items-center gap-1.5">
                  {["#FFFFFF", "#000000", "#FFD700", "#FF6B6B", "#4ECDC4", "#45B7D1"].map((color) => (
                    <button
                      key={color}
                      type="button"
                      onClick={() => setFontColor(color)}
                      disabled={isLoading}
                      title={color}
                      aria-label={t("captions.captionColor", { color })}
                      className={cn("size-8 rounded-full border-2 transition-transform hover:scale-110 disabled:cursor-not-allowed", fontColor.toUpperCase() === color ? "border-foreground" : "border-border")}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                  <label className="relative size-8 cursor-pointer overflow-hidden rounded-full border-2 border-dashed border-border" title={t("captions.customColor")}>
                    <input type="color" value={fontColor} onChange={(e) => setFontColor(e.target.value)} disabled={isLoading} className="absolute inset-0 cursor-pointer opacity-0" aria-label={t("captions.customCaptionColor")} />
                    <span className="absolute inset-1 rounded-full bg-[conic-gradient(red,yellow,lime,cyan,blue,magenta,red)]" />
                  </label>
                  <Input
                    type="text"
                    value={fontColor}
                    onChange={(e) => setFontColor(e.target.value)}
                    disabled={isLoading}
                    placeholder="#FFFFFF"
                    aria-label={t("captions.captionColorHex")}
                    className="ml-1 h-8 w-24 font-mono text-xs"
                    pattern="^#[0-9A-Fa-f]{6}$"
                  />
                </div>
              </div>
            </div>

            <div className="relative mx-auto aspect-[9/16] w-full max-w-[150px] overflow-hidden rounded-xl bg-[radial-gradient(circle_at_50%_30%,oklch(0.5_0.05_50),oklch(0.2_0.01_50))]" aria-label={t("captions.preview")}>
              <p
                className="absolute inset-x-2 top-[70%] text-center font-bold leading-snug"
                style={{
                  color: fontColor,
                  fontFamily: `'${fontFamily}', system-ui, sans-serif`,
                  fontSize: `${Math.max(Math.min(fontSize * 0.5, 18), 9)}px`,
                  textShadow: "0 2px 6px rgba(0,0,0,0.8), 0 0 2px rgba(0,0,0,0.9)",
                }}
              >
                {t("captions.sample")}
              </p>
            </div>
          </div>
        </Section>

        <Section icon={<Mail className="size-4" />} title={t("notifications.title")} description={t("notifications.description")}>
          <div className="flex items-center justify-between gap-4">
            <Label htmlFor="completion-emails" className="flex-col items-start gap-0.5">
              <span className="text-sm font-medium">{t("notifications.emails")}</span>
              <span className="text-xs font-normal text-muted-foreground">{t("notifications.emailsHint")}</span>
            </Label>
            <Switch id="completion-emails" checked={completionEmails} onCheckedChange={setCompletionEmails} disabled={isLoading} />
          </div>
        </Section>

        {socialAccess === true && (
          <Link href="/settings/social" className="group flex items-center gap-4 rounded-2xl border bg-background p-5 transition-colors hover:border-foreground/25">
            <span className="flex size-9 items-center justify-center rounded-lg bg-muted"><Share2 className="size-4" /></span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold">{t("links.socialTitle")}</span>
              <span className="block text-xs text-muted-foreground">{t("links.socialDescription")}</span>
            </span>
            <ChevronRight className="size-4 text-muted-foreground transition-transform group-hover:translate-x-0.5" />
          </Link>
        )}

        <Section icon={<Info className="size-4" />} title={t("about.title")} description={t("about.credit")}>
          <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm">
            <a className="underline underline-offset-4" href={GITHUB_URL}>{t("about.repository")}</a>
            <a className="underline underline-offset-4" href={DEFAULT_SITE_URL}>supoclip.com</a>
          </div>
        </Section>

        {error && (
          <Alert className="border-red-200 bg-red-50 dark:border-red-900/60 dark:bg-red-950/40">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertDescription className="text-sm text-red-700 dark:text-red-300">
              {error}
            </AlertDescription>
          </Alert>
        )}
      </div>

      {showSaveBar && (
        <div className="fixed inset-x-0 bottom-[calc(4rem+env(safe-area-inset-bottom))] z-30 flex justify-center px-4 pb-4 pointer-events-none md:bottom-0 md:pb-6 md:pl-64">
          <div className="pointer-events-auto flex w-full max-w-3xl animate-in fade-in slide-in-from-bottom-4 duration-200 items-center justify-between gap-4 rounded-2xl border bg-background/95 px-4 py-3 shadow-lg backdrop-blur max-md:mr-14">
            <p role="status" className="flex items-center gap-2 text-sm text-muted-foreground">
              {success ? <><Check className="size-4 text-emerald-600" />{t("save.saved")}</>
                : <><span className="size-2 rounded-full bg-brand" />{t("save.unsaved")}</>}
            </p>
            <Button onClick={handleSavePreferences} disabled={isLoading}>
              {isLoading ? <><Loader2 className="size-4 animate-spin" />{t("save.saving")}</> : t("save.button")}
            </Button>
          </div>
        </div>
      )}
    </main>
  );
}

function Section({ id, tour, icon, title, description, children }: { id?: string; /** `data-tour` target for the welcome tour. */ tour?: string; icon: React.ReactNode; title: string; description: string; children: React.ReactNode }) {
  return (
    <section id={id} data-tour={tour} className="scroll-mt-6 rounded-2xl border bg-background">
      <div className="flex items-start gap-3 border-b px-5 py-4">
        <span className="mt-0.5 flex size-8 shrink-0 items-center justify-center rounded-lg bg-muted">{icon}</span>
        <div>
          <h2 className="text-sm font-semibold">{title}</h2>
          <p className="text-xs text-muted-foreground">{description}</p>
        </div>
      </div>
      <div className="p-5">{children}</div>
    </section>
  );
}
