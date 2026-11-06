import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Link } from "@tanstack/react-router";
import {
  Heart,
  MessageSquare,
  Repeat2,
  Share2,
  Trash2,
  Edit2,
  CheckCircle2,
  BarChart2,
  Send,
  MoreHorizontal,
  Bookmark,
  Check,
  X,
} from "lucide-react";
import {
  toggleRepostPost,
  toggleLikeComment,
  useStore,
  type SocialPost,
  toggleBookmark,
} from "@/lib/store";
import {
  togglePostLike,
  submitPollVote,
  addPostComment,
  deletePostComment,
  deleteCommunityPost,
  editCommunityPost,
  syncPostComments,
} from "@/lib/social-client";
import { getTeam, fmt } from "@/lib/demo-data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export function SocialPostCard({ post }: { post: SocialPost }) {
  const currentUser = useStore((s) => s.user);
  const likes = useStore((s) => s.likes);
  const reposts = useStore((s) => s.reposts);
  const pollVotes = useStore((s) => s.pollVotes);
  const commentsMap = useStore((s) => s.comments);
  const commentLikes = useStore((s) => s.commentLikes);
  const bookmarks = useStore((s) => s.bookmarks);

  const [showComments, setShowComments] = useState(false);
  const [commentText, setCommentText] = useState("");
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(post.title ?? "");
  const [editContent, setEditContent] = useState(post.content);
  const [isSavingEdit, setIsSavingEdit] = useState(false);

  const isLiked = likes.includes(post.id);
  const isReposted = reposts.includes(post.id);
  const userVote = pollVotes[post.id];
  const postComments = commentsMap[post.id] ?? [];
  const isSaved = bookmarks.some((b) => b.id === post.id);
  const isAuthor = currentUser?.id === post.author.id || currentUser?.handle === post.author.handle;

  const team = post.author.teamId ? getTeam(post.author.teamId) : null;

  // Poll calculations
  const totalPollVotes = post.poll?.options.reduce((acc, opt) => acc + opt.votes, 0) ?? 0;

  const handleShare = async () => {
    const shareUrl = typeof window !== "undefined" ? `${window.location.origin}/#post-${post.id}` : "";
    if (typeof navigator !== "undefined" && navigator.share) {
      try {
        await navigator.share({
          title: post.title ?? `${post.author.name} on Faczz`,
          text: post.content,
          url: shareUrl,
        });
        toast.success("Shared successfully!");
        return;
      } catch {
        /* fallback to clipboard */
      }
    }
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      await navigator.clipboard.writeText(`${post.content}\n\n${shareUrl}`);
      toast.success("Post link copied to clipboard!");
    }
  };

  const handleCommentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;

    const text = commentText.trim();
    setCommentText("");
    await addPostComment(post.id, text);
    toast.success("Reply added!");
  };

  const handleDeleteComment = async (commentId: string) => {
    const res = await deletePostComment(post.id, commentId);
    if (res.success) {
      toast.success("Reply deleted.");
    } else {
      toast.error(res.error || "Failed to delete reply.");
    }
  };

  const handleSaveEdit = async () => {
    if (!editContent.trim()) {
      toast.error("Content cannot be empty");
      return;
    }

    setIsSavingEdit(true);
    try {
      const res = await editCommunityPost(post.id, {
        title: editTitle.trim() || undefined,
        content: editContent.trim(),
      });
      if (res.success) {
        setIsEditing(false);
        toast.success("Post updated successfully!");
      } else {
        toast.error(res.error || "Failed to update post");
      }
    } finally {
      setIsSavingEdit(false);
    }
  };

  const handleDeletePost = async () => {
    const res = await deleteCommunityPost(post.id);
    if (res.success) {
      toast.success("Post deleted.");
    } else {
      toast.error(res.error || "Failed to delete post");
    }
  };

  const handleToggleLike = async () => {
    await togglePostLike(post.id);
  };

  const handleVote = async (optionId: string) => {
    const res = await submitPollVote(post.id, optionId);
    if (res.success) {
      toast.success("Vote recorded!");
    } else {
      toast.error(res.error || "Failed to submit vote");
    }
  };

  const handleBookmark = () => {
    toggleBookmark({
      id: post.id,
      type: "post",
      title: post.title ?? post.content.slice(0, 50),
      href: `/#post-${post.id}`,
    });
    toast.info(isSaved ? "Removed from Saved" : "Saved to Bookmarks");
  };

  return (
    <article
      id={`post-${post.id}`}
      className="group rounded-2xl border border-border bg-card p-4 shadow-sm transition-all hover:border-border/80 hover:shadow-md md:p-5"
    >
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary font-bold text-foreground">
            {post.author.avatar ? (
              <img src={post.author.avatar} alt={post.author.name} className="h-full w-full object-cover" />
            ) : (
              <span>{post.author.name.slice(0, 2).toUpperCase()}</span>
            )}
          </div>
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="truncate text-sm font-bold text-foreground">{post.author.name}</span>
              {post.author.isVerified && (
                <CheckCircle2 className="h-3.5 w-3.5 text-primary fill-primary/20 shrink-0" />
              )}
              {team && (
                <span
                  className="inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground"
                  style={{ backgroundColor: `${team.color}15`, border: `1px solid ${team.color}35` }}
                >
                  <span className="h-1.5 w-1.5 rounded-full" style={{ backgroundColor: team.color }} />
                  {team.name}
                </span>
              )}
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <span>{post.author.handle}</span>
              <span>·</span>
              <time dateTime={post.createdAt}>{fmt(post.createdAt)}</time>
              <span>·</span>
              <span className="rounded bg-muted px-1.5 py-0.2 text-[10px] font-semibold text-muted-foreground">
                {post.category}
              </span>
            </div>
          </div>
        </div>

        {/* Top actions */}
        <div className="flex items-center gap-1">
          <Button
            variant="unstyled"
            type="button"
            onClick={handleBookmark}
            aria-label={isSaved ? "Remove bookmark" : "Bookmark post"}
            className={cn(
              "rounded-full p-2 text-muted-foreground transition-colors hover:bg-muted hover:text-foreground",
              isSaved && "text-primary"
            )}
          >
            <Bookmark className={cn("h-4 w-4", isSaved && "fill-current")} />
          </Button>

          {isAuthor && (
            <>
              <Button
                variant="unstyled"
                type="button"
                onClick={() => setIsEditing(!isEditing)}
                aria-label="Edit post"
                className="rounded-full p-2 text-muted-foreground hover:bg-muted hover:text-foreground"
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="unstyled"
                type="button"
                onClick={handleDeletePost}
                aria-label="Delete post"
                className="rounded-full p-2 text-muted-foreground hover:bg-destructive/10 hover:text-destructive"
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </>
          )}
        </div>
      </div>

      {/* Title & Body / Edit Form */}
      {isEditing ? (
        <div className="mt-3 space-y-2 rounded-xl border border-primary/40 bg-muted/20 p-3">
          <input
            type="text"
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            placeholder="Post Title (optional)"
            className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-bold outline-none focus:border-primary"
          />
          <textarea
            rows={3}
            value={editContent}
            onChange={(e) => setEditContent(e.target.value)}
            className="w-full rounded-lg border border-input bg-background p-2.5 text-xs outline-none focus:border-primary"
          />
          <div className="flex justify-end gap-2 pt-1">
            <Button
              variant="unstyled"
              type="button"
              onClick={() => setIsEditing(false)}
              className="rounded-lg px-3 py-1 text-xs font-semibold text-muted-foreground hover:bg-muted"
            >
              Cancel
            </Button>
            <Button
              variant="unstyled"
              type="button"
              disabled={isSavingEdit}
              onClick={handleSaveEdit}
              className="rounded-lg bg-primary px-3.5 py-1 text-xs font-bold text-primary-foreground shadow hover:bg-primary/90"
            >
              {isSavingEdit ? "Saving..." : "Save Changes"}
            </Button>
          </div>
        </div>
      ) : (
        <div className="mt-3 space-y-2">
          {post.title && <h3 className="text-base font-bold text-foreground md:text-lg">{post.title}</h3>}
          <p className="whitespace-pre-line text-sm leading-relaxed text-foreground/90 md:text-[15px]">
            {post.content}
          </p>
        </div>
      )}

      {/* Attached Media */}
      {post.mediaUrl && (
        <div className="mt-3 overflow-hidden rounded-xl border border-border bg-muted/20">
          <img
            src={post.mediaUrl}
            alt="Post attachment"
            loading="lazy"
            className="max-h-96 w-full object-cover transition-transform group-hover:scale-[1.01]"
          />
        </div>
      )}

      {/* Interactive Poll */}
      {post.poll && (
        <div className="mt-4 rounded-xl border border-border bg-muted/30 p-3.5 space-y-2.5">
          <p className="flex items-center gap-1.5 text-xs font-bold uppercase tracking-wider text-muted-foreground">
            <BarChart2 className="h-4 w-4 text-primary" /> {post.poll.question}
          </p>
          <div className="space-y-2">
            {post.poll.options.map((opt) => {
              const pct = totalPollVotes > 0 ? Math.round((opt.votes / totalPollVotes) * 100) : 0;
              const hasVotedThis = userVote === opt.id;

              return (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => handleVote(opt.id)}
                  disabled={Boolean(userVote)}
                  className={cn(
                    "relative flex h-10 w-full items-center justify-between overflow-hidden rounded-lg border px-3 text-left text-xs font-semibold transition-all",
                    hasVotedThis
                      ? "border-primary bg-primary/10 text-primary"
                      : "border-border bg-card hover:bg-muted text-foreground",
                    userVote && "cursor-default"
                  )}
                >
                  {/* Progress fill */}
                  <div
                    className={cn(
                      "absolute inset-y-0 left-0 transition-all duration-500",
                      hasVotedThis ? "bg-primary/20" : "bg-muted-foreground/10"
                    )}
                    style={{ width: `${pct}%` }}
                  />
                  <span className="relative z-10 flex items-center gap-1.5">
                    {opt.text}
                    {hasVotedThis && <CheckCircle2 className="h-3 w-3 text-primary" />}
                  </span>
                  <span className="relative z-10 font-mono text-xs text-muted-foreground">
                    {userVote ? `${pct}% (${opt.votes})` : `${opt.votes} votes`}
                  </span>
                </button>
              );
            })}
          </div>
          <p className="text-[11px] text-muted-foreground">
            {totalPollVotes} total votes {userVote ? "· You voted" : "· Click an option to vote"}
          </p>
        </div>
      )}

      {/* Tags */}
      {post.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {post.tags.map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-secondary px-2.5 py-0.5 text-xs font-medium text-secondary-foreground"
            >
              #{tag}
            </span>
          ))}
        </div>
      )}

      {/* Action Bar */}
      <div className="mt-4 flex items-center justify-between border-t border-border/60 pt-3 text-muted-foreground">
        {/* Like */}
        <button
          type="button"
          onClick={handleToggleLike}
          className={cn(
            "group/btn flex items-center gap-1.5 text-xs font-semibold transition-colors hover:text-red-500",
            isLiked && "text-red-500"
          )}
          aria-label={isLiked ? "Unlike post" : "Like post"}
        >
          <div className="rounded-full p-1.5 transition-transform group-hover/btn:scale-110 group-hover/btn:bg-red-500/10">
            <Heart className={cn("h-4 w-4 transition-all", isLiked && "fill-current scale-110")} />
          </div>
          <span>{post.likes}</span>
        </button>

        {/* Comment */}
        <button
          type="button"
          onClick={() => {
            if (!showComments) {
              syncPostComments(post.id).catch(() => {});
            }
            setShowComments(!showComments);
          }}
          className="group/btn flex items-center gap-1.5 text-xs font-semibold transition-colors hover:text-primary"
          aria-label="View comments"
        >
          <div className="rounded-full p-1.5 transition-transform group-hover/btn:scale-110 group-hover/btn:bg-primary/10">
            <MessageSquare className="h-4 w-4" />
          </div>
          <span>{postComments.length}</span>
        </button>

        {/* Repost */}
        <button
          type="button"
          onClick={() => {
            toggleRepostPost(post.id);
            toast.info(isReposted ? "Undo repost" : "Reposted to your profile!");
          }}
          className={cn(
            "group/btn flex items-center gap-1.5 text-xs font-semibold transition-colors hover:text-green-500",
            isReposted && "text-green-500"
          )}
          aria-label={isReposted ? "Undo repost" : "Repost"}
        >
          <div className="rounded-full p-1.5 transition-transform group-hover/btn:scale-110 group-hover/btn:bg-green-500/10">
            <Repeat2 className="h-4 w-4" />
          </div>
          <span>{post.reposts}</span>
        </button>

        {/* Share */}
        <button
          type="button"
          onClick={handleShare}
          className="group/btn flex items-center gap-1.5 text-xs font-semibold transition-colors hover:text-primary"
          aria-label="Share post"
        >
          <div className="rounded-full p-1.5 transition-transform group-hover/btn:scale-110 group-hover/btn:bg-primary/10">
            <Share2 className="h-4 w-4" />
          </div>
          <span className="hidden sm:inline">Share</span>
        </button>
      </div>

      {/* Threaded Comments Section */}
      {showComments && (
        <div className="mt-4 border-t border-border/80 pt-4 space-y-3">
          {/* Add Reply */}
          <form onSubmit={handleCommentSubmit} className="flex gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary text-xs font-bold">
              {currentUser?.avatar ? (
                <img src={currentUser.avatar} alt="" className="h-full w-full object-cover" />
              ) : (
                <span>{(currentUser?.name ?? "U").slice(0, 1).toUpperCase()}</span>
              )}
            </div>
            <input
              type="text"
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              placeholder="Write a reply or debrief..."
              className="flex-1 rounded-full border border-input bg-background px-3.5 py-1.5 text-xs outline-none focus:border-primary"
            />
            <Button
              variant="unstyled"
              type="submit"
              disabled={!commentText.trim()}
              className={cn(
                "rounded-full px-3 py-1.5 text-xs font-semibold transition-all",
                commentText.trim()
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "cursor-not-allowed bg-muted text-muted-foreground"
              )}
            >
              <Send className="h-3 w-3" />
            </Button>
          </form>

          {/* Comment list */}
          {postComments.length === 0 ? (
            <p className="py-2 text-center text-xs text-muted-foreground">
              No replies yet. Be the first to share your thoughts!
            </p>
          ) : (
            <div className="space-y-2.5 divide-y divide-border/40">
              {postComments.map((comm) => {
                const isCommLiked = commentLikes.includes(comm.id);
                const commTeam = comm.author.teamId ? getTeam(comm.author.teamId) : null;
                const isCommAuthor =
                  Boolean(currentUser?.id && comm.author.id === currentUser.id) ||
                  Boolean(currentUser?.handle && comm.author.handle === currentUser.handle);

                return (
                  <div key={comm.id} className="pt-2 flex items-start gap-2.5">
                    <div className="flex h-7 w-7 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary text-[10px] font-bold">
                      {comm.author.avatar ? (
                        <img src={comm.author.avatar} alt="" className="h-full w-full object-cover" />
                      ) : (
                        <span>{comm.author.name.slice(0, 1).toUpperCase()}</span>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5">
                        <span className="text-xs font-bold text-foreground">{comm.author.name}</span>
                        {commTeam && (
                          <span
                            className="inline-block h-1.5 w-1.5 rounded-full"
                            style={{ backgroundColor: commTeam.color }}
                          />
                        )}
                        <span className="text-[11px] text-muted-foreground">{comm.author.handle}</span>
                        <span className="text-[10px] text-muted-foreground">· {fmt(comm.createdAt)}</span>
                      </div>
                      <p className="mt-0.5 text-xs leading-relaxed text-foreground/90">{comm.content}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => toggleLikeComment(comm.id)}
                        className={cn(
                          "flex items-center gap-1 text-[11px] text-muted-foreground hover:text-red-500",
                          isCommLiked && "text-red-500 font-semibold"
                        )}
                      >
                        <Heart className={cn("h-3 w-3", isCommLiked && "fill-current")} />
                        {comm.likes > 0 && <span>{comm.likes}</span>}
                      </button>
                      {isCommAuthor && (
                        <button
                          type="button"
                          onClick={() => handleDeleteComment(comm.id)}
                          aria-label="Delete comment"
                          className="text-muted-foreground hover:text-destructive p-0.5 rounded"
                        >
                          <Trash2 className="h-3 w-3" />
                        </button>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </article>
  );
}
