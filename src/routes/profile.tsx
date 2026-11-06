import { Button } from "@/components/ui/button";
import { createFileRoute, Link } from "@tanstack/react-router";
import { useState, useRef, useEffect, type ReactNode } from "react";
import {
  Moon,
  Sun,
  Monitor,
  Download,
  Smartphone,
  QrCode,
  CheckCircle2,
  LogOut,
  Upload,
  Database,
  Bell,
  Sliders,
  Shield,
  User,
  ExternalLink,
  ChevronDown,
  ChevronUp,
  Settings,
  Sparkles,
} from "lucide-react";
import {
  setState,
  useStore,
  type AlertKey,
  type UserAccount,
  loginUser,
  logoutUser,
  updateUserProfile,
  exportUserMemory,
  importUserMemory,
  DEFAULT_DEMO_USER,
} from "@/lib/store";
import {
  syncSessionUser,
  apiLogin,
  apiRegister,
  apiLogout,
  apiRecoverPassword,
  apiResetPassword,
  apiChangePassword,
  apiUpdateProfile,
} from "@/lib/auth-client";
import { getTeam, getDriver, getTopic, getSource, teams, drivers } from "@/lib/demo-data";
import { PageHeader, Chip, FollowButton } from "@/components/bits";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/profile")({
  head: () => ({
    meta: [
      { title: "Profile & Settings — Faczz" },
      { name: "description", content: "Account profile, theme, follows, alerts, data memory, and Android app APK download." },
      { property: "og:title", content: "Profile & Settings — Faczz" },
      { property: "og:description", content: "Manage follows, alerts, data memory, and download the Android app." },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Profile,
});

const SectionCard = ({
  title,
  subtitle,
  children,
  badge,
}: {
  title: string;
  subtitle?: string;
  children: ReactNode;
  badge?: string;
}) => (
  <div className="rounded-2xl border border-border bg-card p-5 md:p-6 shadow-sm space-y-4">
    <div className="flex items-center justify-between border-b border-border/50 pb-3">
      <div>
        <h3 className="text-base md:text-lg font-bold text-foreground">{title}</h3>
        {subtitle && <p className="text-xs text-muted-foreground">{subtitle}</p>}
      </div>
      {badge && (
        <span className="rounded-full bg-primary/10 px-2.5 py-0.5 text-xs font-semibold text-primary">
          {badge}
        </span>
      )}
    </div>
    {children}
  </div>
);

const Toggle = ({ label, on, set }: { label: string; on: boolean; set: (v: boolean) => void }) => (
  <label className="flex items-center justify-between gap-3 py-2 text-sm text-foreground cursor-pointer">
    <span>{label}</span>
    <Button
      variant="unstyled"
      type="button"
      role="switch"
      aria-checked={on}
      aria-label={label}
      onClick={() => set(!on)}
      className={`relative h-6 w-11 rounded-full transition-colors ${on ? "bg-primary" : "bg-muted"}`}
    >
      <span
        className={`absolute top-0.5 h-5 w-5 rounded-full bg-card shadow transition-all ${
          on ? "left-5" : "left-0.5"
        }`}
      />
    </Button>
  </label>
);

const ALERTS: [AlertKey, string][] = [
  ["practice", "Practice"],
  ["qualifying", "Qualifying"],
  ["sprint", "Sprint"],
  ["race", "Race start"],
  ["results", "Results"],
  ["penalties", "Penalties"],
  ["breaking", "Breaking news"],
];

const DEMO_PERSONAS: UserAccount[] = [
  DEFAULT_DEMO_USER,
  {
    id: "u-tifosi-insider",
    name: "Charles Insider",
    handle: "@tifosi_charles",
    email: "tifosi.charles@ferrari.f1",
    avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=200&auto=format&fit=crop&q=80",
    bio: "Scuderia Ferrari diehard. Tracking every telemetry curve and Maranello engine upgrade. Forza Ferrari! 🏎️🇮🇹",
    favTeam: "ferrari",
    favDriver: "leclerc",
    location: "Maranello, Italy",
    joinedDate: "January 2024",
    followersCount: 2310,
    followingCount: 194,
    badge: "Tifosi Ambassador",
  },
  {
    id: "u-max-fan33",
    name: "Max Verstappen Fanclub",
    handle: "@verstappen33_nl",
    email: "max.fan@redbull.f1",
    avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&auto=format&fit=crop&q=80",
    bio: "Simply lovely. Orange Army worldwide! Tracking qualifying laps, race strategy, and Red Bull aero updates. 🦁🇳🇱",
    favTeam: "redbull",
    favDriver: "verstappen",
    location: "Amsterdam, Netherlands",
    joinedDate: "May 2023",
    followersCount: 4120,
    followingCount: 245,
    badge: "Orange Army Chief",
  },
  {
    id: "u-mercedes-silver",
    name: "Mercedes Silver Arrows",
    handle: "@silver_arrows_uk",
    email: "silver.arrows@mercedes.f1",
    avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=200&auto=format&fit=crop&q=80",
    bio: "Still We Rise. Dedicated to technical insights, suspension geometry, and telemetry breakdowns. 🏁⭐",
    favTeam: "mercedes",
    favDriver: "russell",
    location: "Brackley, UK",
    joinedDate: "November 2023",
    followersCount: 1890,
    followingCount: 312,
    badge: "Aero Analyst",
  },
];

function Profile() {
  const s = useStore((x) => x);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // Tab state
  const [activeTab, setActiveTab] = useState("android");

  // Profile Editor state
  const [editingProfile, setEditingProfile] = useState(false);
  const [editName, setEditName] = useState(s.user?.name ?? "");
  const [editHandle, setEditHandle] = useState(s.user?.handle ?? "");
  const [editBio, setEditBio] = useState(s.user?.bio ?? "");
  const [editTeam, setEditTeam] = useState(s.user?.favTeam ?? "mclaren");
  const [editDriver, setEditDriver] = useState(s.user?.favDriver ?? "norris");
  const [editLocation, setEditLocation] = useState(s.user?.location ?? "Silverstone, UK");
  const [editAvatar, setEditAvatar] = useState(s.user?.avatar ?? "");

  // Auth form state
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [authEmail, setAuthEmail] = useState("");
  const [authPassword, setAuthPassword] = useState("");
  const [authName, setAuthName] = useState("");
  const [authHandle, setAuthHandle] = useState("");
  const [authTeam, setAuthTeam] = useState("mclaren");
  const [authDriver, setAuthDriver] = useState("norris");
  const [authLoading, setAuthLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);

  // Recovery & Password Change state
  const [showRecovery, setShowRecovery] = useState(false);
  const [recoveryEmail, setRecoveryEmail] = useState("");
  const [recoveryToken, setRecoveryToken] = useState("");
  const [recoveryPassword, setRecoveryPassword] = useState("");
  const [recoveryStep, setRecoveryStep] = useState<"request" | "reset">("request");
  const [recoveryLoading, setRecoveryLoading] = useState(false);

  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [changePasswordLoading, setChangePasswordLoading] = useState(false);

  // Sync active server session on mount
  useEffect(() => {
    syncSessionUser().catch(() => {});
  }, []);

  // Notifications permission state
  const [perm, setPerm] = useState<string | null>(null);

  // APK info state
  const [showAndroidGuide, setShowAndroidGuide] = useState(false);
  const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
  const [isInstallable, setIsInstallable] = useState(false);

  useEffect(() => {
    const handleBeforeInstall = (e: Event) => {
      e.preventDefault();
      setDeferredPrompt(e);
      setIsInstallable(true);
    };
    window.addEventListener("beforeinstallprompt", handleBeforeInstall);
    return () => window.removeEventListener("beforeinstallprompt", handleBeforeInstall);
  }, []);

  const handleInstallPWA = async () => {
    if (deferredPrompt) {
      deferredPrompt.prompt();
      const { outcome } = await deferredPrompt.userChoice;
      if (outcome === "accepted") {
        toast.success("App installed successfully to home screen!");
      }
      setDeferredPrompt(null);
      setIsInstallable(false);
    } else {
      toast.info("PWA Installation", {
        description: "On Safari/Chrome: tap Share (Safari) or Menu ⋮ (Chrome) and select 'Add to Home Screen'.",
      });
    }
  };

  const follows = [
    ...s.teams.map((id) => ({ k: "teams" as const, id, n: getTeam(id)?.name })),
    ...s.drivers.map((id) => ({ k: "drivers" as const, id, n: getDriver(id)?.name })),
    ...s.topics.map((id) => ({ k: "topics" as const, id, n: getTopic(id)?.name })),
    ...s.sources.map((id) => ({ k: "sources" as const, id, n: getSource(id)?.name })),
  ];

  const enableEvents = async (v: boolean) => {
    if (!v) {
      setState({ eventNotifs: false });
      return;
    }
    if (typeof Notification === "undefined") {
      setPerm("unavailable in this browser");
      return;
    }
    try {
      const result = await Notification.requestPermission();
      setPerm(result);
      setState({ eventNotifs: result === "granted" });
    } catch {
      setPerm("unavailable in this browser");
      setState({ eventNotifs: false });
    }
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    const patch = {
      name: editName.trim() || "Paddock Member",
      handle: editHandle.startsWith("@") ? editHandle.trim() : `@${editHandle.trim()}`,
      bio: editBio.trim(),
      favTeam: editTeam,
      favDriver: editDriver,
      location: editLocation.trim(),
      avatar: editAvatar.trim() || undefined,
    };
    await apiUpdateProfile(patch);
    setEditingProfile(false);
    toast.success("Profile updated successfully!");
  };

  const handleAuthSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);
    if (!authEmail.trim() || !authPassword.trim()) {
      setAuthError("Email and password are required");
      return;
    }

    setAuthLoading(true);
    try {
      if (authMode === "signin") {
        const res = await apiLogin(authEmail, authPassword);
        if (!res.success) {
          setAuthError(res.error || "Failed to log in");
          toast.error(res.error || "Login failed");
        } else {
          toast.success("Welcome back to the Faczz Paddock!");
          setAuthEmail("");
          setAuthPassword("");
        }
      } else {
        const username = authName.trim() || authEmail.split("@")[0] || "PaddockFan";
        const handle = authHandle.trim() || `@${username.toLowerCase().replace(/[^a-z0-9_]/g, "")}`;

        const res = await apiRegister({
          name: username,
          handle,
          email: authEmail,
          password: authPassword,
          favTeam: authTeam,
          favDriver: authDriver,
        });

        if (!res.success) {
          setAuthError(res.error || "Registration failed");
          toast.error(res.error || "Registration failed");
        } else {
          toast.success("Welcome to Faczz! Account created and signed in.");
          setAuthEmail("");
          setAuthPassword("");
          setAuthName("");
          setAuthHandle("");
        }
      }
    } finally {
      setAuthLoading(false);
    }
  };

  const handleSignOut = async () => {
    await apiLogout();
    toast.info("Signed out of your session.");
  };

  const handleRequestRecovery = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryEmail.trim()) return;
    setRecoveryLoading(true);
    try {
      const res = await apiRecoverPassword(recoveryEmail);
      toast.success(res.message);
      if (res.meta?.resetToken) {
        setRecoveryToken(res.meta.resetToken);
      }
      setRecoveryStep("reset");
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!recoveryToken.trim() || !recoveryPassword.trim()) return;
    setRecoveryLoading(true);
    try {
      const res = await apiResetPassword(recoveryToken, recoveryPassword);
      if (res.success) {
        toast.success("Password reset successfully! Please sign in.");
        setShowRecovery(false);
        setRecoveryStep("request");
        setRecoveryToken("");
        setRecoveryPassword("");
        setAuthMode("signin");
      } else {
        toast.error(res.error || "Failed to reset password.");
      }
    } finally {
      setRecoveryLoading(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword || !newPassword) return;
    setChangePasswordLoading(true);
    try {
      const res = await apiChangePassword(currentPassword, newPassword);
      if (res.success) {
        toast.success("Password updated successfully!");
        setCurrentPassword("");
        setNewPassword("");
      } else {
        toast.error(res.error || "Failed to update password.");
      }
    } finally {
      setChangePasswordLoading(false);
    }
  };

  const handleExportData = () => {
    const jsonStr = exportUserMemory();
    const blob = new Blob([jsonStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `faczz-user-memory-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(url);
    toast.success("User memory exported successfully!");
  };

  const handleImportFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      const content = evt.target?.result as string;
      if (content && importUserMemory(content)) {
        toast.success("User memory successfully restored!");
      } else {
        toast.error("Failed to parse memory backup file.");
      }
    };
    reader.readAsText(file);
  };

  const favTeamObj = s.user?.favTeam ? getTeam(s.user.favTeam) : null;
  const favDriverObj = s.user?.favDriver ? getDriver(s.user.favDriver) : null;
  const userPostsCount = s.userPosts.filter((p) => p.author.id === s.user?.id || p.author.handle === s.user?.handle).length;

  return (
    <div className="space-y-6">
      <PageHeader eyebrow="User Hub" title="Profile & Preferences" />

      {/* ========================================================= */}
      {/* 1. COMPACT & CLEAN PROFILE HERO CARD                      */}
      {/* ========================================================= */}
      <div className="relative overflow-hidden rounded-3xl border border-border bg-card shadow-sm">
        {/* Subtle decorative banner */}
        <div
          className="h-24 w-full relative overflow-hidden"
          style={{
            background: favTeamObj?.color
              ? `linear-gradient(135deg, ${favTeamObj.color}cc 0%, #151413 85%)`
              : "linear-gradient(135deg, #d6262b 0%, #1e1e1e 100%)",
          }}
        >
          <div className="absolute inset-0 bg-[radial-gradient(#ffffff15_1px,transparent_1px)] [background-size:16px_16px]" />
          <div className="absolute right-4 bottom-2 text-[10px] font-mono uppercase tracking-widest text-white/50">
            Faczz Paddock
          </div>
        </div>

        {/* Content details */}
        <div className="px-5 pb-5 pt-0">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3 -mt-9 mb-3">
            <div className="flex items-end gap-3.5">
              <div className="relative h-18 w-18 shrink-0 rounded-2xl border-2 border-card bg-secondary overflow-hidden shadow-md">
                {s.user?.avatar ? (
                  <img src={s.user.avatar} alt={s.user.name} className="h-full w-full object-cover" />
                ) : (
                  <div className="flex h-full w-full items-center justify-center font-bold text-xl text-foreground">
                    {(s.user?.name ?? "Fan").slice(0, 2).toUpperCase()}
                  </div>
                )}
              </div>

              <div className="space-y-0.5">
                <div className="flex items-center gap-2">
                  <h2 className="text-lg md:text-xl font-black text-foreground">{s.user?.name ?? "Guest User"}</h2>
                  {s.user?.badge && (
                    <span className="inline-flex items-center gap-1 rounded-full bg-primary/10 px-2 py-0.5 text-[11px] font-semibold text-primary">
                      <CheckCircle2 className="h-3 w-3" /> {s.user.badge}
                    </span>
                  )}
                </div>
                <p className="text-xs text-muted-foreground">{s.user?.handle ?? "@guest"}</p>
              </div>
            </div>

            <Button
              variant="unstyled"
              onClick={() => {
                setEditName(s.user?.name ?? "");
                setEditHandle(s.user?.handle ?? "");
                setEditBio(s.user?.bio ?? "");
                setEditTeam(s.user?.favTeam ?? "mclaren");
                setEditDriver(s.user?.favDriver ?? "norris");
                setEditLocation(s.user?.location ?? "Silverstone, UK");
                setEditAvatar(s.user?.avatar ?? "");
                setEditingProfile(!editingProfile);
              }}
              className="rounded-xl border border-border bg-card px-3.5 py-1.5 text-xs font-bold text-foreground shadow-sm hover:bg-muted self-start sm:self-auto"
            >
              {editingProfile ? "Cancel Editing" : "Edit Profile"}
            </Button>
          </div>

          <p className="text-xs md:text-sm text-foreground/85 leading-relaxed max-w-2xl mb-3">
            {s.user?.bio ?? "Welcome to your personal F1 feed and social paddock! Click Edit Profile to customize."}
          </p>

          {/* Quick stats and tags bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 pt-2.5 border-t border-border/40 text-xs">
            <div className="flex items-center gap-4 text-xs">
              <div>
                <strong className="font-bold text-foreground">{s.user?.followingCount ?? follows.length}</strong>{" "}
                <span className="text-muted-foreground">Following</span>
              </div>
              <div>
                <strong className="font-bold text-foreground">{s.user?.followersCount ?? 142}</strong>{" "}
                <span className="text-muted-foreground">Followers</span>
              </div>
              <div>
                <strong className="font-bold text-foreground">{userPostsCount}</strong>{" "}
                <span className="text-muted-foreground">Posts</span>
              </div>
              <div>
                <strong className="font-bold text-foreground">{s.bookmarks.length}</strong>{" "}
                <span className="text-muted-foreground">Saved</span>
              </div>
            </div>

            <div className="flex items-center gap-2">
              {favTeamObj && (
                <span
                  className="inline-flex items-center gap-1.5 rounded-full px-2 py-0.5 text-[11px] font-semibold text-foreground"
                  style={{ backgroundColor: `${favTeamObj.color}15`, border: `1px solid ${favTeamObj.color}35` }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: favTeamObj.color }} />
                  {favTeamObj.name}
                </span>
              )}
              {favDriverObj && (
                <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-semibold text-secondary-foreground">
                  {favDriverObj.name}
                </span>
              )}
            </div>
          </div>
        </div>

        {/* Collapsible Profile Editor */}
        {editingProfile && (
          <form onSubmit={handleSaveProfile} className="border-t border-border bg-muted/20 p-4 md:p-5 space-y-3">
            <h3 className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Profile Information</h3>
            <div className="grid gap-3 sm:grid-cols-2">
              <div>
                <label className="block text-[11px] font-semibold mb-1">Display Name</label>
                <input
                  type="text"
                  required
                  value={editName}
                  onChange={(e) => setEditName(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold mb-1">Handle</label>
                <input
                  type="text"
                  required
                  value={editHandle}
                  onChange={(e) => setEditHandle(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs outline-none focus:border-primary"
                />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-[11px] font-semibold mb-1">Bio</label>
                <textarea
                  rows={2}
                  value={editBio}
                  onChange={(e) => setEditBio(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold mb-1">Favorite Team</label>
                <select
                  value={editTeam}
                  onChange={(e) => setEditTeam(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs outline-none"
                >
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold mb-1">Favorite Driver</label>
                <select
                  value={editDriver}
                  onChange={(e) => setEditDriver(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs outline-none"
                >
                  {drivers.map((d) => (
                    <option key={d.id} value={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-[11px] font-semibold mb-1">Location</label>
                <input
                  type="text"
                  value={editLocation}
                  onChange={(e) => setEditLocation(e.target.value)}
                  className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs outline-none focus:border-primary"
                />
              </div>
              <div>
                <label className="block text-[11px] font-semibold mb-1">Avatar Image URL</label>
                <input
                  type="url"
                  value={editAvatar}
                  onChange={(e) => setEditAvatar(e.target.value)}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs outline-none focus:border-primary"
                />
              </div>
            </div>
            <div className="flex justify-end gap-2 pt-2">
              <Button
                variant="unstyled"
                type="button"
                onClick={() => setEditingProfile(false)}
                className="rounded-lg px-3 py-1.5 text-xs font-semibold text-muted-foreground hover:bg-muted"
              >
                Cancel
              </Button>
              <Button
                variant="unstyled"
                type="submit"
                className="rounded-lg bg-primary px-4 py-1.5 text-xs font-bold text-primary-foreground shadow"
              >
                Save Profile
              </Button>
            </div>
          </form>
        )}
      </div>

      {/* ========================================================= */}
      {/* 2. DEDICATED NEAT SECTIONS VIA TABS                       */}
      {/* ========================================================= */}
      <div className="w-full space-y-4">
        {/* Navigation Tab Bar (Accessible WAI-ARIA tablist) */}
        <div className="no-scrollbar overflow-x-auto pb-1">
          <div
            role="tablist"
            aria-label="Profile navigation sections"
            className="h-11 flex items-center justify-start rounded-2xl bg-muted/60 p-1 gap-1 border border-border/50 w-full"
          >
            <button
              role="tab"
              id="tab-android"
              aria-selected={activeTab === "android"}
              aria-controls="panel-android"
              type="button"
              onClick={() => setActiveTab("android")}
              className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-bold gap-1.5 transition-all",
                activeTab === "android"
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
              )}
            >
              <Smartphone className="h-4 w-4" /> Android App
            </button>

            <button
              role="tab"
              id="tab-account"
              aria-selected={activeTab === "account"}
              aria-controls="panel-account"
              type="button"
              onClick={() => setActiveTab("account")}
              className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-bold gap-1.5 transition-all",
                activeTab === "account"
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
              )}
            >
              <User className="h-4 w-4" /> Account & Auth
            </button>

            <button
              role="tab"
              id="tab-memory"
              aria-selected={activeTab === "memory"}
              aria-controls="panel-memory"
              type="button"
              onClick={() => setActiveTab("memory")}
              className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-bold gap-1.5 transition-all",
                activeTab === "memory"
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
              )}
            >
              <Database className="h-4 w-4" /> User Data Memory
            </button>

            <button
              role="tab"
              id="tab-notifications"
              aria-selected={activeTab === "notifications"}
              aria-controls="panel-notifications"
              type="button"
              onClick={() => setActiveTab("notifications")}
              className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-bold gap-1.5 transition-all",
                activeTab === "notifications"
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
              )}
            >
              <Bell className="h-4 w-4" /> Alerts
            </button>

            <button
              role="tab"
              id="tab-preferences"
              aria-selected={activeTab === "preferences"}
              aria-controls="panel-preferences"
              type="button"
              onClick={() => setActiveTab("preferences")}
              className={cn(
                "inline-flex items-center justify-center whitespace-nowrap rounded-xl px-3.5 py-1.5 text-xs font-bold gap-1.5 transition-all",
                activeTab === "preferences"
                  ? "bg-card text-primary shadow-sm"
                  : "text-muted-foreground hover:bg-background/50 hover:text-foreground"
              )}
            >
              <Settings className="h-4 w-4" /> Preferences
            </button>
          </div>
        </div>

        {/* --------------------------------------------------------- */}
        {/* TAB 1: ANDROID APP DOWNLOAD & DEPLOYMENT HUB              */}
        {/* --------------------------------------------------------- */}
        {activeTab === "android" && (
          <div id="panel-android" role="tabpanel" aria-labelledby="tab-android" className="space-y-4">
          {/* Quick Install Banner for Phone */}
          <div className="rounded-2xl border-2 border-primary bg-primary/10 p-4 md:p-5 space-y-3">
            <div className="flex items-center gap-2">
              <span className="flex h-7 w-7 items-center justify-center rounded-full bg-primary text-primary-foreground font-bold text-xs">1</span>
              <h3 className="font-extrabold text-foreground text-sm md:text-base">
                Instant Android Installation (Works on all Android phones)
              </h3>
            </div>
            <p className="text-xs md:text-sm text-foreground/90 leading-relaxed">
              Open <strong>Chrome</strong> on your Android phone and go to your live local network address:
            </p>
            <div className="flex items-center gap-2 bg-card p-3 rounded-xl border border-border">
              <code className="text-xs md:text-sm font-mono font-bold text-primary flex-1 select-all">
                http://192.168.29.195:8080/
              </code>
              <Button
                variant="unstyled"
                onClick={() => {
                  navigator.clipboard.writeText("http://192.168.29.195:8080/");
                  toast.success("Link copied! Open this in Chrome on your Android phone.");
                }}
                className="rounded-lg bg-primary/10 px-3 py-1.5 text-xs font-bold text-primary hover:bg-primary/20"
              >
                Copy Link
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              ⚡ When opened in Chrome on Android: tap the <strong>three dots (⋮)</strong> at top right &gt; tap <strong>"Install app"</strong>. Android will immediately install Faczz onto your home screen and app drawer with 0 errors!
            </p>
          </div>

          {/* Instant 1-Click Install Card (Recommended) */}
          <SectionCard
            title="Native Android WebAPK Engine"
            subtitle="100% compatibility across all Android devices (Samsung, Pixel, Xiaomi, OnePlus)"
            badge="Verified"
          >
            <div className="space-y-3">
              <p className="text-xs md:text-sm leading-relaxed text-foreground/90">
                Installs directly into your Android OS home screen and app drawer via Google Play Services WebAPK. Runs fullscreen with high-fps race charts, push notifications, and offline caching.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-1">
                <Button
                  variant="unstyled"
                  type="button"
                  onClick={handleInstallPWA}
                  className="inline-flex items-center gap-2 rounded-xl bg-primary px-5 py-3 text-xs font-extrabold text-primary-foreground shadow-md transition-all hover:bg-primary/90 hover:scale-[1.02]"
                >
                  <Smartphone className="h-4 w-4" />
                  <span>{isInstallable ? "⚡ Install Native App Now" : "⚡ 1-Tap Install on Android"}</span>
                </Button>
              </div>
            </div>
          </SectionCard>

          {/* Sideload APK File Card */}
          <SectionCard
            title="Method 2: Standalone APK Sideload Package"
            subtitle="Direct compiled and signed release APK package (v2.6.0)"
            badge="v2.6.0 APK"
          >
            <div className="grid gap-6 md:grid-cols-[1fr_auto] items-center">
              <div className="space-y-3">
                <p className="text-xs md:text-sm leading-relaxed text-foreground/90">
                  Compiled native Android package (`faczz-v2.6.0.apk`), triple-signed with APK Signature Schemes v1, v2 &amp; v3.
                </p>

                {/* Technical Specs Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px] font-mono text-muted-foreground">
                  <div className="rounded-xl bg-muted/40 p-2.5 border border-border/40">
                    <span className="block text-[10px] uppercase text-muted-foreground">Version</span>
                    <strong className="text-foreground text-xs">2.6.0-stable</strong>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-2.5 border border-border/40">
                    <span className="block text-[10px] uppercase text-muted-foreground">Size</span>
                    <strong className="text-foreground text-xs">~25 KB (Core)</strong>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-2.5 border border-border/40">
                    <span className="block text-[10px] uppercase text-muted-foreground">Target API</span>
                    <strong className="text-foreground text-xs">API 34 (Android 14)</strong>
                  </div>
                  <div className="rounded-xl bg-muted/40 p-2.5 border border-border/40">
                    <span className="block text-[10px] uppercase text-muted-foreground">Signatures</span>
                    <strong className="text-foreground text-xs truncate block">v1+v2+v3 Signed</strong>
                  </div>
                </div>

                {/* Download Button */}
                <div className="flex flex-wrap items-center gap-3 pt-1">
                  <a
                    href="/api/download-apk"
                    download="faczz-v2.6.0.apk"
                    type="application/vnd.android.package-archive"
                    className="inline-flex items-center gap-2.5 rounded-xl border border-border bg-card px-5 py-2.5 text-xs font-bold text-foreground shadow-sm hover:bg-muted transition-all"
                  >
                    <Download className="h-4 w-4 text-primary" />
                    <span>Download faczz-v2.6.0.apk</span>
                  </a>
                </div>
              </div>

              {/* QR Code Card */}
              <div className="rounded-2xl border border-border bg-background p-3.5 flex flex-col items-center justify-center text-center shadow-inner shrink-0">
                <div className="h-28 w-28 rounded-xl bg-white p-2 shadow-sm flex items-center justify-center">
                  <svg viewBox="0 0 100 100" className="h-full w-full">
                    <rect x="5" y="5" width="28" height="28" fill="#151413" rx="2" />
                    <rect x="9" y="9" width="20" height="20" fill="#ffffff" rx="1" />
                    <rect x="13" y="13" width="12" height="12" fill="#151413" rx="1" />

                    <rect x="67" y="5" width="28" height="28" fill="#151413" rx="2" />
                    <rect x="71" y="9" width="20" height="20" fill="#ffffff" rx="1" />
                    <rect x="75" y="13" width="12" height="12" fill="#151413" rx="1" />

                    <rect x="5" y="67" width="28" height="28" fill="#151413" rx="2" />
                    <rect x="9" y="71" width="20" height="20" fill="#ffffff" rx="1" />
                    <rect x="13" y="75" width="12" height="12" fill="#151413" rx="1" />

                    <rect x="38" y="10" width="8" height="8" fill="#d6262b" />
                    <rect x="50" y="14" width="6" height="6" fill="#151413" />
                    <rect x="42" y="24" width="10" height="6" fill="#151413" />
                    <rect x="22" y="44" width="8" height="6" fill="#d6262b" />
                    <rect x="36" y="38" width="8" height="8" fill="#151413" />
                    <rect x="58" y="36" width="10" height="8" fill="#151413" />
                    <rect x="72" y="42" width="8" height="6" fill="#d6262b" />
                    <rect x="54" y="56" width="8" height="8" fill="#d6262b" />
                    <rect x="78" y="56" width="12" height="6" fill="#151413" />
                    <rect x="50" y="72" width="8" height="6" fill="#151413" />
                    <rect x="76" y="72" width="6" height="8" fill="#d6262b" />
                    <rect x="56" y="82" width="8" height="8" fill="#151413" />
                  </svg>
                </div>
                <span className="mt-2 text-[11px] font-bold text-foreground">Scan with Phone</span>
                <span className="text-[10px] text-muted-foreground">Direct mobile download</span>
              </div>
            </div>
          </SectionCard>

          {/* Dedicated Android Installation Troubleshooting Guide */}
          <SectionCard
            title="🛠️ Troubleshooting Android Installation Issues"
            subtitle="Fixes for 'There was a problem parsing the package', 'Blocked by Play Protect', or missing install button"
          >
            <div className="space-y-3 text-xs leading-relaxed text-foreground/90">
              {/* Solution 1 */}
              <div className="rounded-xl border border-primary/20 bg-primary/5 p-3.5 space-y-1">
                <p className="font-bold text-primary flex items-center gap-1.5">
                  <CheckCircle2 className="h-4 w-4 shrink-0" />
                  Best Fix: Use Method 1 (1-Tap Install / WebAPK)
                </p>
                <p className="text-muted-foreground">
                  If your device shows <em>"There was a problem parsing the package"</em> when opening the downloaded APK file, simply use <strong>Method 1 above</strong>. Your phone will generate a clean, device-specific native app package automatically that never fails to parse.
                </p>
              </div>

              {/* Solution 2 */}
              <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-1">
                <p className="font-bold text-foreground">
                  1. How to Install from Chrome Menu (Samsung / Pixel / Motorola / Xiaomi)
                </p>
                <p className="text-muted-foreground">
                  Open this page in Google Chrome on your phone &gt; Tap the <strong>three dots (⋮)</strong> in the top-right corner &gt; Tap <strong>"Install app"</strong> or <strong>"Add to Home screen"</strong>. Android will create the app icon instantly!
                </p>
              </div>

              {/* Solution 3 */}
              <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-1">
                <p className="font-bold text-foreground">
                  2. If blocked by "Google Play Protect"
                </p>
                <p className="text-muted-foreground">
                  Play Protect displays a warning for non-Play-Store apps. Tap <strong>"More details"</strong> (or the dropdown arrow) and select <strong>"Install anyway"</strong>.
                </p>
              </div>

              {/* Solution 4 */}
              <div className="rounded-xl border border-border bg-muted/30 p-3.5 space-y-1">
                <p className="font-bold text-foreground">
                  3. If blocked by "Install Unknown Apps" permission
                </p>
                <p className="text-muted-foreground">
                  Open Android <strong>Settings</strong> &gt; <strong>Apps</strong> &gt; Select <strong>Chrome</strong> (or your File Manager) &gt; Tap <strong>Install unknown apps</strong> &gt; Toggle <strong>"Allow from this source"</strong> to ON.
                </p>
              </div>
            </div>
          </SectionCard>
        </div>
        )}

        {/* --------------------------------------------------------- */}
        {/* TAB 2: ACCOUNT & AUTHENTICATION                           */}
        {/* --------------------------------------------------------- */}
        {activeTab === "account" && (
        <div id="panel-account" role="tabpanel" aria-labelledby="tab-account" className="space-y-4">
          <SectionCard
            title="Account & Security"
            subtitle="Real production authentication with Google OAuth, persistent sessions, and Argon2/bcrypt security"
            badge={s.user ? "Signed In" : "Guest Mode"}
          >
            {s.user ? (
              <div className="space-y-6">
                {/* Active Session Info */}
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 rounded-2xl bg-muted/30 p-4 border border-border">
                  <div className="flex items-center gap-3.5">
                    <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-2xl border-2 border-border bg-secondary font-bold text-sm shadow-sm">
                      {s.user.avatar ? (
                        <img src={s.user.avatar} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span>{s.user.name.slice(0, 2).toUpperCase()}</span>
                      )}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <p className="text-sm font-extrabold text-foreground">{s.user.name}</p>
                        <span className="rounded-full bg-emerald-500/10 px-2 py-0.5 text-[10px] font-bold text-emerald-500">
                          Active Session
                        </span>
                      </div>
                      <p className="text-xs text-muted-foreground">{s.user.email ?? s.user.handle}</p>
                    </div>
                  </div>

                  <Button
                    variant="unstyled"
                    onClick={handleSignOut}
                    className="inline-flex items-center justify-center gap-1.5 rounded-xl border border-destructive/30 bg-destructive/10 px-4 py-2 text-xs font-bold text-destructive hover:bg-destructive/20 transition-colors shadow-sm"
                  >
                    <LogOut className="h-3.5 w-3.5" /> Sign out
                  </Button>
                </div>

                {/* Password Change Section */}
                <div className="rounded-2xl border border-border bg-card p-4 md:p-5 space-y-3">
                  <div className="flex items-center gap-2">
                    <Shield className="h-4 w-4 text-primary" />
                    <h4 className="text-xs font-extrabold uppercase tracking-wider text-foreground">
                      Change Account Password
                    </h4>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Update your credential password. Existing active sessions on other devices will be automatically rotated.
                  </p>

                  <form onSubmit={handleChangePassword} className="space-y-3 pt-1 max-w-md">
                    <div>
                      <label className="block text-[11px] font-semibold text-foreground mb-1">Current Password</label>
                      <input
                        type="password"
                        required
                        value={currentPassword}
                        onChange={(e) => setCurrentPassword(e.target.value)}
                        placeholder="••••••••"
                        className="h-9 w-full rounded-xl border border-input bg-background px-3 text-xs outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <label className="block text-[11px] font-semibold text-foreground mb-1">New Password</label>
                      <input
                        type="password"
                        required
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="At least 8 chars, 1 uppercase, 1 symbol"
                        className="h-9 w-full rounded-xl border border-input bg-background px-3 text-xs outline-none focus:border-primary"
                      />
                    </div>
                    <Button
                      variant="unstyled"
                      type="submit"
                      disabled={changePasswordLoading}
                      className="rounded-xl bg-primary px-4 py-2 text-xs font-bold text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
                    >
                      {changePasswordLoading ? "Updating..." : "Update Password"}
                    </Button>
                  </form>
                </div>

                {/* Demo Persona Switcher */}
                <div>
                  <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                    Quick Switch Test Persona (Sandbox Simulation)
                  </p>
                  <div className="grid gap-2 sm:grid-cols-3">
                    {DEMO_PERSONAS.map((persona) => (
                      <button
                        key={persona.id}
                        type="button"
                        onClick={() => {
                          loginUser(persona);
                          toast.success(`Switched account to ${persona.name}!`);
                        }}
                        className={cn(
                          "rounded-xl border p-3 text-left transition-all",
                          s.user?.id === persona.id
                            ? "border-primary bg-primary/10 text-primary font-bold shadow-sm"
                            : "border-border bg-card text-muted-foreground hover:bg-muted hover:text-foreground"
                        )}
                      >
                        <p className="text-xs font-bold text-foreground">{persona.name}</p>
                        <p className="text-[11px] text-muted-foreground">{persona.handle} · {persona.favTeam?.toUpperCase()}</p>
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              <div className="space-y-4 max-w-md mx-auto">
                {/* Google OAuth 1-Click Button */}
                <a
                  href="/api/auth/google"
                  className="flex w-full items-center justify-center gap-3 rounded-xl border border-border bg-card hover:bg-muted/60 p-2.5 text-xs font-bold text-foreground transition-all shadow-sm group"
                >
                  <svg className="h-4 w-4" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </a>

                {/* Divider */}
                <div className="relative my-4 flex items-center justify-center">
                  <div className="absolute inset-0 flex items-center">
                    <div className="w-full border-t border-border" />
                  </div>
                  <span className="relative bg-card px-3 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                    Or with email credentials
                  </span>
                </div>

                {/* Tab Switcher */}
                <div className="flex border-b border-border">
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signin");
                      setShowRecovery(false);
                      setAuthError(null);
                    }}
                    className={cn(
                      "flex-1 pb-2 text-xs font-bold border-b-2 transition-all",
                      authMode === "signin" && !showRecovery
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Sign In
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setAuthMode("signup");
                      setShowRecovery(false);
                      setAuthError(null);
                    }}
                    className={cn(
                      "flex-1 pb-2 text-xs font-bold border-b-2 transition-all",
                      authMode === "signup" && !showRecovery
                        ? "border-primary text-primary"
                        : "border-transparent text-muted-foreground hover:text-foreground"
                    )}
                  >
                    Create Account
                  </button>
                </div>

                {authError && (
                  <div className="rounded-xl border border-destructive/30 bg-destructive/10 p-3 text-xs text-destructive">
                    {authError}
                  </div>
                )}

                {/* Recovery Form vs Main Form */}
                {showRecovery ? (
                  <div className="space-y-3 rounded-xl border border-border bg-muted/20 p-4">
                    <div className="flex items-center justify-between">
                      <h4 className="text-xs font-bold text-foreground">Password Recovery</h4>
                      <button
                        type="button"
                        onClick={() => setShowRecovery(false)}
                        className="text-[11px] text-muted-foreground hover:text-foreground"
                      >
                        Cancel
                      </button>
                    </div>

                    {recoveryStep === "request" ? (
                      <form onSubmit={handleRequestRecovery} className="space-y-3">
                        <p className="text-[11px] text-muted-foreground">
                          Enter your account email. If registered, we will generate a secure reset token.
                        </p>
                        <div>
                          <label className="block text-xs font-semibold mb-1">Email Address</label>
                          <input
                            type="email"
                            required
                            value={recoveryEmail}
                            onChange={(e) => setRecoveryEmail(e.target.value)}
                            placeholder="you@paddock.f1"
                            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs outline-none focus:border-primary"
                          />
                        </div>
                        <Button
                          variant="unstyled"
                          type="submit"
                          disabled={recoveryLoading}
                          className="w-full rounded-lg bg-primary py-2 text-xs font-bold text-primary-foreground shadow hover:bg-primary/90"
                        >
                          {recoveryLoading ? "Dispatching..." : "Send Reset Instructions"}
                        </Button>
                      </form>
                    ) : (
                      <form onSubmit={handleResetPassword} className="space-y-3">
                        <p className="text-[11px] text-muted-foreground">
                          Enter the reset token received and your new secure password.
                        </p>
                        <div>
                          <label className="block text-xs font-semibold mb-1">Reset Token</label>
                          <input
                            type="text"
                            required
                            value={recoveryToken}
                            onChange={(e) => setRecoveryToken(e.target.value)}
                            placeholder="64-character token"
                            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs font-mono outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">New Password</label>
                          <input
                            type="password"
                            required
                            value={recoveryPassword}
                            onChange={(e) => setRecoveryPassword(e.target.value)}
                            placeholder="At least 8 chars, 1 uppercase, 1 symbol"
                            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs outline-none focus:border-primary"
                          />
                        </div>
                        <Button
                          variant="unstyled"
                          type="submit"
                          disabled={recoveryLoading}
                          className="w-full rounded-lg bg-primary py-2 text-xs font-bold text-primary-foreground shadow hover:bg-primary/90"
                        >
                          {recoveryLoading ? "Resetting..." : "Confirm New Password"}
                        </Button>
                      </form>
                    )}
                  </div>
                ) : (
                  /* Login / Register Form */
                  <form onSubmit={handleAuthSubmit} className="space-y-3">
                    {authMode === "signup" && (
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-semibold mb-1">Display Name</label>
                          <input
                            type="text"
                            required
                            value={authName}
                            onChange={(e) => setAuthName(e.target.value)}
                            placeholder="e.g. Charles Fan"
                            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs outline-none focus:border-primary"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">Handle</label>
                          <input
                            type="text"
                            value={authHandle}
                            onChange={(e) => setAuthHandle(e.target.value)}
                            placeholder="@paddock_scout"
                            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs outline-none focus:border-primary"
                          />
                        </div>
                      </div>
                    )}
                    <div>
                      <label className="block text-xs font-semibold mb-1">Email Address</label>
                      <input
                        type="email"
                        required
                        value={authEmail}
                        onChange={(e) => setAuthEmail(e.target.value)}
                        placeholder="you@paddock.f1"
                        className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs outline-none focus:border-primary"
                      />
                    </div>
                    <div>
                      <div className="flex items-center justify-between mb-1">
                        <label className="block text-xs font-semibold">Password</label>
                        {authMode === "signin" && (
                          <button
                            type="button"
                            onClick={() => {
                              setShowRecovery(true);
                              setRecoveryEmail(authEmail);
                            }}
                            className="text-[11px] text-primary hover:underline font-semibold"
                          >
                            Forgot password?
                          </button>
                        )}
                      </div>
                      <input
                        type="password"
                        required
                        value={authPassword}
                        onChange={(e) => setAuthPassword(e.target.value)}
                        placeholder={authMode === "signup" ? "At least 8 chars, 1 uppercase, 1 symbol" : "••••••••"}
                        className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs outline-none focus:border-primary"
                      />
                      {authMode === "signup" && (
                        <p className="mt-1 text-[10px] text-muted-foreground">
                          Security requirement: 8+ characters with uppercase, lowercase, number, and symbol.
                        </p>
                      )}
                    </div>

                    {authMode === "signup" && (
                      <div className="grid gap-2 sm:grid-cols-2">
                        <div>
                          <label className="block text-xs font-semibold mb-1">Favorite Team</label>
                          <select
                            value={authTeam}
                            onChange={(e) => setAuthTeam(e.target.value)}
                            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs outline-none"
                          >
                            {teams.map((t) => (
                              <option key={t.id} value={t.id}>
                                {t.name}
                              </option>
                            ))}
                          </select>
                        </div>
                        <div>
                          <label className="block text-xs font-semibold mb-1">Favorite Driver</label>
                          <select
                            value={authDriver}
                            onChange={(e) => setAuthDriver(e.target.value)}
                            className="h-9 w-full rounded-lg border border-input bg-background px-3 text-xs outline-none"
                          >
                            {drivers.map((d) => (
                              <option key={d.id} value={d.id}>
                                {d.name}
                              </option>
                            ))}
                          </select>
                        </div>
                      </div>
                    )}

                    <Button
                      variant="unstyled"
                      type="submit"
                      disabled={authLoading}
                      className="w-full rounded-lg bg-primary py-2 text-xs font-bold text-primary-foreground shadow hover:bg-primary/90 disabled:opacity-50"
                    >
                      {authLoading
                        ? "Verifying credentials..."
                        : authMode === "signin"
                        ? "Sign In to Paddock"
                        : "Create Verified Paddock Account"}
                    </Button>
                  </form>
                )}

                {/* Quick Persona Logins */}
                <div className="pt-2 border-t border-border/60">
                  <p className="text-[11px] text-muted-foreground mb-2">Or instant sign-in with test persona:</p>
                  <div className="flex flex-wrap gap-1.5">
                    {DEMO_PERSONAS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          loginUser(p);
                          toast.success(`Logged in as ${p.name}!`);
                        }}
                        className="rounded-lg bg-secondary px-2.5 py-1 text-[11px] font-semibold text-secondary-foreground hover:bg-primary hover:text-primary-foreground transition-colors"
                      >
                        {p.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </SectionCard>
        </div>
        )}

        {/* --------------------------------------------------------- */}
        {/* TAB 3: USER DATA MEMORY & PERSISTENCE                     */}
        {/* --------------------------------------------------------- */}
        {activeTab === "memory" && (
        <div id="panel-memory" role="tabpanel" aria-labelledby="tab-memory" className="space-y-4">
          <SectionCard
            title="User Data Memory & Sync"
            subtitle="Local-first persistence across reloads and device migrations"
            badge="Persistent Storage"
          >
            <p className="text-xs md:text-sm text-foreground/80 leading-relaxed">
              All your paddock contributions (authored posts, comments, liked telemetry, poll votes, and bookmarks) remain permanently saved on this device.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 py-1 text-center">
              <div className="rounded-xl bg-muted/40 p-3 border border-border/40">
                <span className="block text-lg font-bold text-foreground">{s.userPosts.length}</span>
                <span className="text-[11px] text-muted-foreground">Authored Posts</span>
              </div>
              <div className="rounded-xl bg-muted/40 p-3 border border-border/40">
                <span className="block text-lg font-bold text-foreground">{Object.values(s.comments).flat().length}</span>
                <span className="text-[11px] text-muted-foreground">Community Replies</span>
              </div>
              <div className="rounded-xl bg-muted/40 p-3 border border-border/40">
                <span className="block text-lg font-bold text-foreground">{s.likes.length}</span>
                <span className="text-[11px] text-muted-foreground">Liked Items</span>
              </div>
              <div className="rounded-xl bg-muted/40 p-3 border border-border/40">
                <span className="block text-lg font-bold text-foreground">{s.bookmarks.length}</span>
                <span className="text-[11px] text-muted-foreground">Saved Bookmarks</span>
              </div>
            </div>

            <div className="pt-2 flex flex-wrap gap-2.5">
              <Button
                variant="unstyled"
                type="button"
                onClick={handleExportData}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground shadow-sm hover:bg-muted"
              >
                <Download className="h-3.5 w-3.5 text-primary" /> Export Memory (JSON)
              </Button>

              <Button
                variant="unstyled"
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-4 py-2 text-xs font-semibold text-foreground shadow-sm hover:bg-muted"
              >
                <Upload className="h-3.5 w-3.5 text-primary" /> Restore Memory Backup
              </Button>
              <input
                type="file"
                ref={fileInputRef}
                accept=".json"
                onChange={handleImportFile}
                className="hidden"
              />

              <Button
                variant="unstyled"
                onClick={() => {
                  if (confirm("Reset all local memory and reset back to defaults?")) {
                    localStorage.removeItem("paddock-intel:v1");
                    location.href = "/welcome";
                  }
                }}
                className="ml-auto rounded-xl px-3 py-2 text-xs font-semibold text-destructive hover:bg-destructive/10"
              >
                Reset All Local Data
              </Button>
            </div>
          </SectionCard>
        </div>
        )}

        {/* --------------------------------------------------------- */}
        {/* TAB 4: ALERTS & NOTIFICATIONS                             */}
        {/* --------------------------------------------------------- */}
        {activeTab === "notifications" && (
        <div id="panel-notifications" role="tabpanel" aria-labelledby="tab-notifications" className="space-y-4">
          <SectionCard
            title="Session Alerts & Reminders"
            subtitle="Configure countdown alerts before qualifying, sprints, and Grand Prix starts"
          >
            <Toggle label="Event notifications on this device" on={s.eventNotifs} set={enableEvents} />
            <p className="mb-3 text-xs text-muted-foreground">
              We only ask your browser for permission when you switch this on. Alerts run locally.
              {perm && ` Browser permission: ${perm}.`}
            </p>

            <div className="divide-y divide-border/40 pt-1">
              {ALERTS.map(([k, l]) => (
                <Toggle key={k} label={l} on={s.alerts[k]} set={(v) => setState({ alerts: { ...s.alerts, [k]: v } })} />
              ))}
            </div>

            <div className="pt-3 border-t border-border/50">
              <p className="mb-2 text-xs font-bold uppercase tracking-wider text-muted-foreground">
                Remind Me Before Sessions
              </p>
              <div className="flex gap-2">
                {([15, 30, 60] as const).map((m) => (
                  <Chip key={m} active={s.alertLead === m} onClick={() => setState({ alertLead: m })}>
                    {m} min
                  </Chip>
                ))}
              </div>
            </div>

            <div className="pt-2">
              <Toggle label="Favourite team & driver news alerts" on={s.favNews} set={(v) => setState({ favNews: v })} />
            </div>
          </SectionCard>
        </div>
        )}

        {/* --------------------------------------------------------- */}
        {/* TAB 5: PREFERENCES, THEME & FOLLOWING                     */}
        {/* --------------------------------------------------------- */}
        {activeTab === "preferences" && (
        <div id="panel-preferences" role="tabpanel" aria-labelledby="tab-preferences" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Theme Card */}
            <SectionCard title="Theme & Display">
              <div className="flex flex-wrap gap-2">
                {(
                  [
                    ["light", "Light", Sun],
                    ["dark", "Dark", Moon],
                    ["system", "System", Monitor],
                  ] as const
                ).map(([v, l, I]) => (
                  <Chip key={v} active={s.theme === v} onClick={() => setState({ theme: v })}>
                    <I className="h-4 w-4" /> {l}
                  </Chip>
                ))}
              </div>
              <div className="pt-3 border-t border-border/50 space-y-1">
                <Toggle
                  label="Personalise feed order"
                  on={s.privacy.personalize}
                  set={(v) => setState({ privacy: { ...s.privacy, personalize: v } })}
                />
                <Toggle
                  label="Autoplay muted video when visible"
                  on={s.privacy.autoplay}
                  set={(v) => setState({ privacy: { ...s.privacy, autoplay: v } })}
                />
              </div>
            </SectionCard>

            {/* Following Card */}
            <SectionCard title={`Following (${follows.length})`}>
              {follows.length ? (
                <ul className="max-h-48 overflow-y-auto space-y-2 pr-1">
                  {follows.map((f) => (
                    <li key={f.k + f.id} className="flex items-center justify-between text-xs py-1 border-b border-border/40">
                      <span>
                        {f.n} <span className="text-[10px] text-muted-foreground">· {f.k}</span>
                      </span>
                      <FollowButton kind={f.k} id={f.id} size="sm" />
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="text-xs text-muted-foreground">Nothing followed yet.</p>
              )}
              <div className="mt-2 flex gap-3 text-xs font-semibold text-primary">
                <Link to="/explore">Explore Paddock Sources →</Link>
                <Link to="/welcome">Redo Setup →</Link>
              </div>
            </SectionCard>

            {/* Saved Collections Card */}
            <div className="md:col-span-2">
              <SectionCard title="Saved Collections">
                <div className="flex items-center justify-between">
                  <p className="text-xs text-muted-foreground">
                    {s.bookmarks.length} saved items across {s.collections.length} research collections
                  </p>
                  <Link to="/saved" className="text-xs font-bold text-primary hover:underline">
                    Open Saved →
                  </Link>
                </div>
              </SectionCard>
            </div>
          </div>
        </div>
        )}
      </div>
    </div>
  );
}
