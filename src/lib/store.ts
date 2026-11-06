import { useSyncExternalStore } from "react";

export type EntityKind = "teams" | "drivers" | "topics" | "sources";
export type Bookmark = { id: string; type: "story" | "post" | "dataset"; title: string; href: string; collectionId: string | null; savedAt: string };
export type Collection = { id: string; name: string };
export type AlertKey = "practice" | "qualifying" | "sprint" | "race" | "results" | "penalties" | "breaking";

export type UserAccount = {
  id: string;
  name: string;
  handle: string;
  email: string;
  avatar?: string | undefined;
  bio?: string | undefined;
  favTeam?: string | undefined;
  favDriver?: string | undefined;
  location?: string | undefined;
  joinedDate: string;
  followersCount: number;
  followingCount: number;
  badge?: string | undefined;
};

export type SocialPoll = {
  id: string;
  question: string;
  options: { id: string; text: string; votes: number }[];
};

export type SocialComment = {
  id: string;
  postId: string;
  author: {
    id?: string | undefined;
    name: string;
    handle: string;
    avatar?: string | undefined;
    teamId?: string | undefined;
  };
  content: string;
  createdAt: string;
  likes: number;
};

export type SocialPost = {
  id: string;
  author: {
    id?: string | undefined;
    name: string;
    handle: string;
    avatar?: string | undefined;
    badge?: string | undefined;
    teamId?: string | undefined;
    isVerified?: boolean | undefined;
  };
  title?: string | undefined;
  content: string;
  mediaUrl?: string | undefined;
  category: "Paddock Buzz" | "Race Debrief" | "Hot Take" | "Tech Talk" | "Meme";
  tags: string[];
  teams: string[];
  drivers: string[];
  createdAt: string;
  likes: number;
  reposts: number;
  poll?: SocialPoll | undefined;
};

export type State = {
  onboarded: boolean;
  all: boolean;
  teams: string[]; drivers: string[]; topics: string[]; sources: string[];
  theme: "light" | "dark" | "system";
  homeEmphasis: "balanced" | "race" | "feed";
  raceMode: "auto" | "next" | "live" | "results";
  bookmarks: Bookmark[];
  collections: Collection[];
  readNotifs: string[]; clearedNotifs: string[];
  alerts: Record<AlertKey, boolean>;
  alertLead: 15 | 30 | 60;
  favNews: boolean;
  eventNotifs: boolean;
  user: UserAccount | null;
  privacy: { personalize: boolean; analytics: boolean; autoplay: boolean };
  // Social media state & user memory
  userPosts: SocialPost[];
  comments: Record<string, SocialComment[]>;
  likes: string[];
  reposts: string[];
  commentLikes: string[];
  pollVotes: Record<string, string>; // postId -> optionId
};

export const INITIAL_COMMUNITY_POSTS: SocialPost[] = [
  {
    id: "sp-ferrari-upgrades",
    author: {
      id: "u-charles-insider",
      name: "Tifosi Analytics",
      handle: "@tifosi_data",
      badge: "Tech Contributor",
      teamId: "ferrari",
      isVerified: true,
      avatar: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80",
    },
    title: "Ferrari's revised floor edge geometry analyzed",
    content: "The latest floor updates brought to Maranello show a massive 0.18s gain in high-speed corner stability (Turns 4 & 9). Notice how the vortex generators seal the diffuser under heavy roll angles. What do we think of their constructor chances now? 🏎️💨",
    mediaUrl: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&auto=format&fit=crop&q=80",
    category: "Tech Talk",
    tags: ["Ferrari", "Aero", "F12026", "Telemetry"],
    teams: ["ferrari"],
    drivers: ["leclerc", "hamilton"],
    createdAt: new Date(Date.now() - 1000 * 60 * 45).toISOString(),
    likes: 142,
    reposts: 28,
    poll: {
      id: "poll-constructor",
      question: "Who will seal P2 in the Constructors championship?",
      options: [
        { id: "opt-ferrari", text: "Scuderia Ferrari", votes: 89 },
        { id: "opt-mclaren", text: "McLaren F1 Team", votes: 76 },
        { id: "opt-mercedes", text: "Mercedes AMG", votes: 23 },
        { id: "opt-redbull", text: "Red Bull Racing", votes: 31 },
      ],
    },
  },
  {
    id: "sp-norris-radio",
    author: {
      id: "u-paddock-scout",
      name: "Lando's Sector 3",
      handle: "@lando_sector3",
      badge: "Paddock Creator",
      teamId: "mclaren",
      isVerified: false,
      avatar: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80",
    },
    title: "Norris vs Piastri: Sector pace breakdown",
    content: "Lando's tire delta in the opening 14 laps was ridiculous. Piastri has supreme one-lap qualifying trim, but Norris manages the thermal degradation in the rear axle so smoothly. The telemetry overlay is pure cinema! 🔥",
    category: "Race Debrief",
    tags: ["McLaren", "Norris", "Piastri", "RacePace"],
    teams: ["mclaren"],
    drivers: ["norris", "piastri"],
    createdAt: new Date(Date.now() - 1000 * 60 * 180).toISOString(),
    likes: 98,
    reposts: 14,
  },
  {
    id: "sp-meme-alonso",
    author: {
      id: "u-el-nano",
      name: "El Nano Daily",
      handle: "@fernando_goat",
      badge: "Community Legend",
      teamId: "astonmartin",
      isVerified: true,
      avatar: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&auto=format&fit=crop&q=80",
    },
    title: "Alonso defending against drivers who weren't born when he won in 2005",
    content: "Fernando Alonso could drive a shopping trolley with a broken caster wheel to P7 at Monaco. Truly the ageless gladiator of modern motorsport! 🇪🇸⚔️",
    category: "Hot Take",
    tags: ["Alonso", "AstonMartin", "GigaChad", "Motorsport"],
    teams: ["astonmartin"],
    drivers: ["alonso"],
    createdAt: new Date(Date.now() - 1000 * 60 * 360).toISOString(),
    likes: 312,
    reposts: 67,
  },
];

export const INITIAL_COMMENTS: Record<string, SocialComment[]> = {
  "sp-ferrari-upgrades": [
    {
      id: "comm-1",
      postId: "sp-ferrari-upgrades",
      author: {
        name: "Carlos Sainz Fanclub",
        handle: "@smooth_operator55",
        teamId: "williams",
        avatar: "https://images.unsplash.com/photo-1492562080023-ab3db95bfbce?w=150&auto=format&fit=crop&q=80",
      },
      content: "The low-speed mechanical grip has also improved drastically thanks to the front pullrod setup. Maranello cooked here!",
      createdAt: new Date(Date.now() - 1000 * 60 * 30).toISOString(),
      likes: 19,
    },
    {
      id: "comm-2",
      postId: "sp-ferrari-upgrades",
      author: {
        name: "Max Aero Tech",
        handle: "@aero_f1_guru",
        teamId: "redbull",
        avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=150&auto=format&fit=crop&q=80",
      },
      content: "Watch out for high ambient track temperatures though, the Ferrari cooling louvers might induce drag down the long straights.",
      createdAt: new Date(Date.now() - 1000 * 60 * 15).toISOString(),
      likes: 8,
    },
  ],
  "sp-norris-radio": [
    {
      id: "comm-3",
      postId: "sp-norris-radio",
      author: {
        name: "Aussie Grit",
        handle: "@oscar_fan_melb",
        teamId: "mclaren",
        avatar: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&auto=format&fit=crop&q=80",
      },
      content: "Piastri's defense on Lap 22 was world championship material. Both drivers push each other to the limit!",
      createdAt: new Date(Date.now() - 1000 * 60 * 120).toISOString(),
      likes: 14,
    },
  ],
};

export const DEFAULT_DEMO_USER: UserAccount = {
  id: "u-active-paddock-user",
  name: "Alex Vance",
  handle: "@alex_paddock",
  email: "alex.vance@paddock.f1",
  avatar: "https://images.unsplash.com/photo-1535713875002-d1d0cf377fde?w=200&auto=format&fit=crop&q=80",
  bio: "Lifelong Formula 1 fanatic & data enthusiast. Tracking telemetry, team radio debriefs, and race strategies.",
  favTeam: "mclaren",
  favDriver: "norris",
  location: "Silverstone, UK",
  joinedDate: "March 2024",
  followersCount: 1420,
  followingCount: 388,
  badge: "Verified Fan & Creator",
};

export const defaults: State = {
  onboarded: false, all: true, teams: [], drivers: [], topics: [], sources: [],
  theme: "system", homeEmphasis: "balanced", raceMode: "auto",
  bookmarks: [], collections: [{ id: "c-brazil", name: "Brazil GP research" }],
  readNotifs: [], clearedNotifs: [],
  alerts: { practice: false, qualifying: true, sprint: true, race: true, results: true, penalties: false, breaking: true },
  alertLead: 30, favNews: true, eventNotifs: false, user: DEFAULT_DEMO_USER,
  privacy: { personalize: true, analytics: false, autoplay: true },
  userPosts: INITIAL_COMMUNITY_POSTS,
  comments: INITIAL_COMMENTS,
  likes: ["sp-ferrari-upgrades"],
  reposts: [],
  commentLikes: ["comm-1"],
  pollVotes: {},
};

const KEY = "paddock-intel:v1";
let state: State = defaults;
let loaded = false;
const listeners = new Set<() => void>();

function load() {
  if (loaded || typeof window === "undefined") return;
  loaded = true;
  try {
    const raw = localStorage.getItem(KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      state = {
        ...defaults,
        ...parsed,
        // Guarantee array & dictionary structures are preserved
        userPosts: Array.isArray(parsed.userPosts) ? parsed.userPosts : defaults.userPosts,
        comments: parsed.comments && typeof parsed.comments === "object" ? parsed.comments : defaults.comments,
        likes: Array.isArray(parsed.likes) ? parsed.likes : defaults.likes,
        reposts: Array.isArray(parsed.reposts) ? parsed.reposts : defaults.reposts,
        commentLikes: Array.isArray(parsed.commentLikes) ? parsed.commentLikes : defaults.commentLikes,
        pollVotes: parsed.pollVotes && typeof parsed.pollVotes === "object" ? parsed.pollVotes : defaults.pollVotes,
      };
    }
  } catch { /* ignore */ }
}

export function setState(patch: Partial<State> | ((s: State) => Partial<State>)) {
  load();
  const p = typeof patch === "function" ? patch(state) : patch;
  state = { ...state, ...p };
  try { localStorage.setItem(KEY, JSON.stringify(state)); } catch { /* ignore */ }
  listeners.forEach((l) => l());
}

export function getState() { load(); return state; }

export function useStore<T>(sel: (s: State) => T): T {
  return useSyncExternalStore(
    (l) => { listeners.add(l); return () => listeners.delete(l); },
    () => sel(getState()),
    () => sel(defaults),
  );
}

export function toggleFollow(kind: EntityKind, id: string) {
  setState((s) => {
    const list = s[kind];
    return { [kind]: list.includes(id) ? list.filter((x) => x !== id) : [...list, id] } as Partial<State>;
  });
}

export function toggleBookmark(b: Omit<Bookmark, "collectionId" | "savedAt">) {
  setState((s) => s.bookmarks.some((x) => x.id === b.id)
    ? { bookmarks: s.bookmarks.filter((x) => x.id !== b.id) }
    : { bookmarks: [{ ...b, collectionId: null, savedAt: new Date().toISOString() }, ...s.bookmarks] });
}

export function applyTheme(theme: State["theme"]) {
  if (typeof window === "undefined") return;
  const dark = theme === "dark" || (theme === "system" && window.matchMedia("(prefers-color-scheme: dark)").matches);
  document.documentElement.classList.toggle("dark", dark);
}

// ==========================================
// SOCIAL MEDIA MEMORY & ACTIONS
// ==========================================

export function createSocialPost(data: {
  title?: string | undefined;
  content: string;
  category: SocialPost["category"];
  tags: string[];
  teams: string[];
  drivers: string[];
  mediaUrl?: string | undefined;
  poll?: { question: string; options: string[] } | undefined;
}) {
  const current = getState();
  const currentUser = current.user ?? DEFAULT_DEMO_USER;

  const newPost: SocialPost = {
    id: `post-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    author: {
      id: currentUser.id,
      name: currentUser.name,
      handle: currentUser.handle,
      avatar: currentUser.avatar,
      badge: "Community Member",
      teamId: currentUser.favTeam,
      isVerified: Boolean(currentUser.badge),
    },
    title: data.title?.trim() || undefined,
    content: data.content.trim(),
    category: data.category,
    tags: data.tags,
    teams: data.teams,
    drivers: data.drivers,
    mediaUrl: data.mediaUrl?.trim() || undefined,
    createdAt: new Date().toISOString(),
    likes: 1, // User auto-likes their own post
    reposts: 0,
    poll: data.poll && data.poll.question.trim() && data.poll.options.length >= 2 ? {
      id: `poll-${Date.now()}`,
      question: data.poll.question.trim(),
      options: data.poll.options.map((opt, i) => ({
        id: `opt-${i}`,
        text: opt.trim(),
        votes: 0,
      })),
    } : undefined,
  };

  setState((s) => ({
    userPosts: [newPost, ...s.userPosts],
    likes: [...s.likes, newPost.id],
  }));

  return newPost;
}

export function deleteSocialPost(postId: string) {
  setState((s) => ({
    userPosts: s.userPosts.filter((p) => p.id !== postId),
    likes: s.likes.filter((id) => id !== postId),
    reposts: s.reposts.filter((id) => id !== postId),
  }));
}

export function toggleLikePost(postId: string) {
  setState((s) => {
    const isLiked = s.likes.includes(postId);
    const newLikes = isLiked ? s.likes.filter((id) => id !== postId) : [...s.likes, postId];

    const updatedPosts = s.userPosts.map((p) => {
      if (p.id === postId) {
        return { ...p, likes: Math.max(0, p.likes + (isLiked ? -1 : 1)) };
      }
      return p;
    });

    return {
      likes: newLikes,
      userPosts: updatedPosts,
    };
  });
}

export function toggleRepostPost(postId: string) {
  setState((s) => {
    const isReposted = s.reposts.includes(postId);
    const newReposts = isReposted ? s.reposts.filter((id) => id !== postId) : [...s.reposts, postId];

    const updatedPosts = s.userPosts.map((p) => {
      if (p.id === postId) {
        return { ...p, reposts: Math.max(0, p.reposts + (isReposted ? -1 : 1)) };
      }
      return p;
    });

    return {
      reposts: newReposts,
      userPosts: updatedPosts,
    };
  });
}

export function voteSocialPoll(postId: string, optionId: string) {
  setState((s) => {
    if (s.pollVotes[postId]) return s; // already voted

    const updatedPosts = s.userPosts.map((p) => {
      if (p.id === postId && p.poll) {
        return {
          ...p,
          poll: {
            ...p.poll,
            options: p.poll.options.map((opt) => opt.id === optionId ? { ...opt, votes: opt.votes + 1 } : opt),
          },
        };
      }
      return p;
    });

    return {
      pollVotes: { ...s.pollVotes, [postId]: optionId },
      userPosts: updatedPosts,
    };
  });
}

export function addSocialComment(postId: string, content: string) {
  const current = getState();
  const currentUser = current.user ?? DEFAULT_DEMO_USER;

  const newComment: SocialComment = {
    id: `comm-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
    postId,
    author: {
      name: currentUser.name,
      handle: currentUser.handle,
      avatar: currentUser.avatar,
      teamId: currentUser.favTeam,
    },
    content: content.trim(),
    createdAt: new Date().toISOString(),
    likes: 0,
  };

  setState((s) => {
    const postComments = s.comments[postId] ?? [];
    return {
      comments: {
        ...s.comments,
        [postId]: [newComment, ...postComments],
      },
    };
  });

  return newComment;
}

export function toggleLikeComment(commentId: string) {
  setState((s) => {
    const isLiked = s.commentLikes.includes(commentId);
    const newLikes = isLiked ? s.commentLikes.filter((id) => id !== commentId) : [...s.commentLikes, commentId];

    const updatedComments = { ...s.comments };
    for (const postId of Object.keys(updatedComments)) {
      const list = updatedComments[postId];
      if (list?.some((c) => c.id === commentId)) {
        updatedComments[postId] = list.map((c) =>
          c.id === commentId ? { ...c, likes: Math.max(0, c.likes + (isLiked ? -1 : 1)) } : c
        );
      }
    }

    return {
      commentLikes: newLikes,
      comments: updatedComments,
    };
  });
}

export function updateUserProfile(patch: Partial<UserAccount>) {
  setState((s) => ({
    user: s.user ? { ...s.user, ...patch } : { ...DEFAULT_DEMO_USER, ...patch },
  }));
}

export function loginUser(account: UserAccount) {
  setState({ user: account });
}

export function logoutUser() {
  setState({ user: null });
}

export function exportUserMemory(): string {
  const s = getState();
  const backup = {
    version: "2.6.0",
    exportedAt: new Date().toISOString(),
    user: s.user,
    userPosts: s.userPosts,
    comments: s.comments,
    likes: s.likes,
    reposts: s.reposts,
    bookmarks: s.bookmarks,
    collections: s.collections,
    teams: s.teams,
    drivers: s.drivers,
    topics: s.topics,
    sources: s.sources,
    theme: s.theme,
  };
  return JSON.stringify(backup, null, 2);
}

export function importUserMemory(jsonStr: string): boolean {
  try {
    const data = JSON.parse(jsonStr);
    if (!data || typeof data !== "object") return false;
    setState((s) => ({
      ...s,
      user: data.user ?? s.user,
      userPosts: Array.isArray(data.userPosts) ? data.userPosts : s.userPosts,
      comments: data.comments && typeof data.comments === "object" ? data.comments : s.comments,
      likes: Array.isArray(data.likes) ? data.likes : s.likes,
      reposts: Array.isArray(data.reposts) ? data.reposts : s.reposts,
      bookmarks: Array.isArray(data.bookmarks) ? data.bookmarks : s.bookmarks,
      collections: Array.isArray(data.collections) ? data.collections : s.collections,
      teams: Array.isArray(data.teams) ? data.teams : s.teams,
      drivers: Array.isArray(data.drivers) ? data.drivers : s.drivers,
      theme: data.theme ?? s.theme,
    }));
    return true;
  } catch {
    return false;
  }
}
