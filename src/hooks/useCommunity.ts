import { useCallback, useEffect, useMemo, useState } from "react";

export type CommunityUser = {
  id: string;
  name: string;
  color: string;
};

export type CommunityComment = {
  id: string;
  postId: string;
  author: CommunityUser;
  content: string;
  createdAt: string; // ISO
};

export type CommunityPost = {
  id: string;
  author: CommunityUser;
  content: string;
  createdAt: string; // ISO
  encouragements: string[]; // userIds who encouraged
  comments: CommunityComment[];
};

export type CommunityState = {
  currentUser: CommunityUser;
  posts: CommunityPost[];
};

const STORAGE_KEY = "community:data:v1";

function uid(prefix = "id") {
  return `${prefix}_${Math.random().toString(36).slice(2, 10)}_${Date.now().toString(36)}`;
}

function randomColor() {
  const colors = [
    "#4f46e5",
    "#16a34a",
    "#db2777",
    "#f59e0b",
    "#0ea5e9",
    "#ef4444",
    "#22c55e",
  ];
  return colors[Math.floor(Math.random() * colors.length)];
}

function loadInitial(): CommunityState {
  const raw = localStorage.getItem(STORAGE_KEY);
  if (raw) {
    try {
      const parsed = JSON.parse(raw) as CommunityState;
      return parsed;
    } catch {}
  }
  const user: CommunityUser = { id: uid("user"), name: "You", color: randomColor() };
  return { currentUser: user, posts: [] };
}

function save(state: CommunityState) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

export function useCommunityStore() {
  const [state, setState] = useState<CommunityState>(() => loadInitial());

  useEffect(() => {
    save(state);
  }, [state]);

  const setName = useCallback((name: string) => {
    setState((s) => ({ ...s, currentUser: { ...s.currentUser, name } }));
  }, []);

  const newPost = useCallback((content: string) => {
    setState((s) => {
      const post: CommunityPost = {
        id: uid("post"),
        author: s.currentUser,
        content: content.trim(),
        createdAt: new Date().toISOString(),
        encouragements: [],
        comments: [],
      };
      return { ...s, posts: [post, ...s.posts] };
    });
  }, []);

  const toggleEncourage = useCallback((postId: string) => {
    setState((s) => {
      const uidv = s.currentUser.id;
      const posts = s.posts.map((p) => {
        if (p.id !== postId) return p;
        const has = p.encouragements.includes(uidv);
        return {
          ...p,
          encouragements: has
            ? p.encouragements.filter((id) => id !== uidv)
            : [...p.encouragements, uidv],
        };
      });
      return { ...s, posts };
    });
  }, []);

  const addComment = useCallback((postId: string, content: string) => {
    setState((s) => {
      const comment: CommunityComment = {
        id: uid("cmt"),
        postId,
        author: s.currentUser,
        content: content.trim(),
        createdAt: new Date().toISOString(),
      };
      const posts = s.posts.map((p) => (p.id === postId ? { ...p, comments: [...p.comments, comment] } : p));
      return { ...s, posts };
    });
  }, []);

  const removePost = useCallback((postId: string) => {
    setState((s) => ({ ...s, posts: s.posts.filter((p) => p.id !== postId) }));
  }, []);

  const removeComment = useCallback((postId: string, commentId: string) => {
    setState((s) => {
      const posts = s.posts.map((p) =>
        p.id === postId ? { ...p, comments: p.comments.filter((c) => c.id !== commentId) } : p
      );
      return { ...s, posts };
    });
  }, []);

  const value = useMemo(
    () => ({
      state,
      setName,
      newPost,
      toggleEncourage,
      addComment,
      removePost,
      removeComment,
    }),
    [state, setName, newPost, toggleEncourage, addComment, removePost, removeComment]
  );

  return value;
}

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return "just now";
  if (mins < 60) return `${mins}m ago`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h ago`;
  const days = Math.floor(hrs / 24);
  return `${days}d ago`;
}
