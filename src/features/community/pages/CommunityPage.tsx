import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Heart, MessageSquare, Trash2, ArrowLeft, Send } from "lucide-react";
import { useCommunityStore, timeAgo } from "@/features/community/hooks/useCommunity";

function Initials({ name }: { name: string }) {
  const parts = name.trim().split(/\s+/);
  const initials = parts.length === 1 ? parts[0][0] : `${parts[0][0]}${parts[parts.length - 1][0]}`;
  return <span>{initials.toUpperCase()}</span>;
}

export default function CommunityPage() {
  const { state, setName, newPost, toggleEncourage, addComment, removePost, removeComment } = useCommunityStore();
  const [content, setContent] = useState("");
  const [filter, setFilter] = useState<"latest" | "top">("latest");
  const [commentDrafts, setCommentDrafts] = useState<Record<string, string>>({});

  const posts = useMemo(() => {
    const base = [...state.posts];
    if (filter === "top") {
      base.sort((a, b) => b.encouragements.length - a.encouragements.length || b.comments.length - a.comments.length);
    } else {
      base.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
    }
    return base;
  }, [state.posts, filter]);

  const canPost = content.trim().length > 0 && content.trim().length <= 1000;

  const handleSubmit = () => {
    if (!canPost) return;
    newPost(content);
    setContent("");
  };

  const setDraft = (postId: string, v: string) => setCommentDrafts((d) => ({ ...d, [postId]: v }));
  const submitComment = (postId: string) => {
    const v = (commentDrafts[postId] || "").trim();
    if (!v) return;
    addComment(postId, v);
    setDraft(postId, "");
  };

  return (
    <div className="min-h-screen bg-background p-4">
      <div className="max-w-3xl mx-auto">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between mb-6">
          <div className="flex items-center gap-3">
            <Link to="/" className="inline-flex">
              <Button variant="outline" size="icon"><ArrowLeft className="w-4 h-4" /></Button>
            </Link>
            <h1 className="text-2xl font-bold">Community</h1>
            <Badge variant="secondary">Frontend only</Badge>
          </div>
          <div className="flex items-center gap-2 w-full sm:w-auto">
            <Input
              value={state.currentUser.name}
              onChange={(e) => setName(e.target.value)}
              className="w-40"
              placeholder="Your name"
            />
          </div>
        </div>

        <Card className="p-4 mb-6">
          <div className="flex gap-3">
            <Avatar>
              <AvatarFallback className="text-white" style={{ backgroundColor: state.currentUser.color }}>
                <Initials name={state.currentUser.name} />
              </AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <Textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Share an encouragement, tip, or question..."
                className="min-h-24"
              />
              <div className="flex items-center justify-between mt-2 text-sm text-muted-foreground">
                <div>{content.trim().length}/1000</div>
                <div className="flex items-center gap-2">
                  <Button size="sm" variant={filter === "latest" ? "default" : "outline"} onClick={() => setFilter("latest")}>Latest</Button>
                  <Button size="sm" variant={filter === "top" ? "default" : "outline"} onClick={() => setFilter("top")}>Top</Button>
                  <Button size="sm" onClick={handleSubmit} disabled={!canPost}>
                    <Send className="w-4 h-4 mr-2" /> Post
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </Card>

        {posts.length === 0 ? (
          <Card className="p-8 text-center text-muted-foreground">Be the first to start a conversation.</Card>
        ) : (
          <div className="space-y-4">
            {posts.map((post) => (
              <Card key={post.id} className="p-4">
                <div className="flex gap-3">
                  <Avatar>
                    <AvatarFallback className="text-white" style={{ backgroundColor: post.author.color }}>
                      <Initials name={post.author.name} />
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <div className="font-medium">{post.author.name}</div>
                      <div className="text-xs text-muted-foreground">{timeAgo(post.createdAt)}</div>
                    </div>
                    <p className="mt-1 whitespace-pre-wrap">{post.content}</p>
                    <div className="flex items-center gap-3 mt-3">
                      <Button
                        variant={post.encouragements.includes(state.currentUser.id) ? "default" : "outline"}
                        size="sm"
                        onClick={() => toggleEncourage(post.id)}
                      >
                        <Heart className="w-4 h-4 mr-2" /> Encourage {post.encouragements.length > 0 && `(${post.encouragements.length})`}
                      </Button>
                      <div className="text-sm text-muted-foreground flex items-center">
                        <MessageSquare className="w-4 h-4 mr-1" /> {post.comments.length}
                      </div>
                      <Button variant="ghost" size="icon" onClick={() => removePost(post.id)} aria-label="Delete post">
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>

                    <Separator className="my-3" />

                    <div className="space-y-3">
                      {post.comments.map((cmt) => (
                        <div key={cmt.id} className="flex gap-3">
                          <Avatar>
                            <AvatarFallback className="text-white" style={{ backgroundColor: cmt.author.color }}>
                              <Initials name={cmt.author.name} />
                            </AvatarFallback>
                          </Avatar>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div className="text-sm font-medium">{cmt.author.name}</div>
                              <div className="text-xs text-muted-foreground">{timeAgo(cmt.createdAt)}</div>
                            </div>
                            <div className="text-sm">{cmt.content}</div>
                          </div>
                          <Button variant="ghost" size="icon" onClick={() => removeComment(post.id, cmt.id)} aria-label="Delete comment">
                            <Trash2 className="w-4 h-4" />
                          </Button>
                        </div>
                      ))}
                      <div className="flex gap-2">
                        <Input
                          placeholder="Write a comment"
                          value={commentDrafts[post.id] || ""}
                          onChange={(e) => setDraft(post.id, e.target.value)}
                          onKeyDown={(e) => {
                            if (e.key === "Enter" && !e.shiftKey) {
                              e.preventDefault();
                              submitComment(post.id);
                            }
                          }}
                        />
                        <Button onClick={() => submitComment(post.id)} disabled={!((commentDrafts[post.id] || "").trim())}>
                          Reply
                        </Button>
                      </div>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
