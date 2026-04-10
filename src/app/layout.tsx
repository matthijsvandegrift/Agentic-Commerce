import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { cookies } from "next/headers";
import { getTenant } from "@/lib/tenant";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Agentic Commerce",
  description: "AI-powered conversational shopping assistant",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookieStore = await cookies();
  const tenantId = cookieStore.get("tenant")?.value;
  const tenant = getTenant(tenantId);

  const cssVars = {
    "--tenant-primary": tenant.theme.primary,
    "--tenant-secondary": tenant.theme.secondary,
    "--tenant-accent": tenant.theme.accent,
    "--tenant-bg": tenant.theme.background,
    "--tenant-fg": tenant.theme.foreground,
    "--tenant-chat-user": tenant.theme.chatBubbleUser,
    "--tenant-chat-assistant": tenant.theme.chatBubbleAssistant,
  } as React.CSSProperties;

  return (
    <html
      lang="nl"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
      style={cssVars}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <script
          dangerouslySetInnerHTML={{
            __html: `window.__TENANT__ = ${JSON.stringify({
              id: tenant.id,
              name: tenant.name,
              tagline: tenant.tagline,
              welcomeMessage: tenant.welcomeMessage,
              suggestedQuestions: tenant.suggestedQuestions,
              theme: tenant.theme,
            })};`,
          }}
        />
        {children}
      </body>
    </html>
  );
}
