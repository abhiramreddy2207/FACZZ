import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Image, BarChart2, Hash, Sparkles, Send, X, Check } from "lucide-react";
import { useStore, type SocialPost } from "@/lib/store";
import { createCommunityPost } from "@/lib/social-client";
import { teams } from "@/lib/demo-data";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const SAMPLE_MEDIA = [
  { label: "Race Start", url: "https://images.unsplash.com/photo-1568605117036-5fe5e7bab0b7?w=1200&auto=format&fit=crop&q=80" },
  { label: "Night Circuit", url: "https://images.unsplash.com/photo-1517524008697-84bbe3c3fd98?w=1200&auto=format&fit=crop&q=80" },
  { label: "Pit Lane", url: "https://images.unsplash.com/photo-1541348263662-e0c8de4259ba?w=1200&auto=format&fit=crop&q=80" },
  { label: "Cockpit", url: "https://images.unsplash.com/photo-1533473359331-0135ef1b58bf?w=1200&auto=format&fit=crop&q=80" },
];

export function SocialPostComposer({ onPostCreated }: { onPostCreated?: (post: SocialPost) => void }) {
  const user = useStore((s) => s.user);
  const [isOpen, setIsOpen] = useState(false);
  const [content, setContent] = useState("");
  const [title, setTitle] = useState("");
  const [category, setCategory] = useState<SocialPost["category"]>("Paddock Buzz");
  const [selectedTeam, setSelectedTeam] = useState<string>("");
  const [mediaUrl, setMediaUrl] = useState("");
  const [showMediaInput, setShowMediaInput] = useState(false);

  // Poll state
  const [showPoll, setShowPoll] = useState(false);
  const [pollQuestion, setPollQuestion] = useState("");
  const [pollOptions, setPollOptions] = useState(["", ""]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const maxChars = 500;
  const charsRemaining = maxChars - content.length;

  const handleAddPollOption = () => {
    if (pollOptions.length < 4) {
      setPollOptions([...pollOptions, ""]);
    }
  };

  const handleUpdatePollOption = (idx: number, val: string) => {
    const updated = [...pollOptions];
    updated[idx] = val;
    setPollOptions(updated);
  };

  const handleRemovePollOption = (idx: number) => {
    if (pollOptions.length > 2) {
      setPollOptions(pollOptions.filter((_, i) => i !== idx));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!content.trim()) {
      toast.error("Please enter some thoughts for your post!");
      return;
    }

    const validPollOptions = pollOptions.filter((o) => o.trim().length > 0);
    const hasValidPoll = showPoll && pollQuestion.trim().length > 0 && validPollOptions.length >= 2;

    setIsSubmitting(true);
    try {
      const post = await createCommunityPost({
        title: title.trim() || undefined,
        content,
        category,
        tags: [category.replace(/\s+/g, ""), ...(selectedTeam ? [selectedTeam] : []), "F1Paddock"],
        teams: selectedTeam ? [selectedTeam] : [],
        drivers: [],
        mediaUrl: mediaUrl.trim() || undefined,
        poll: hasValidPoll ? {
          question: pollQuestion.trim(),
          options: validPollOptions,
        } : undefined,
      });

      toast.success("Post published to Paddock Community Feed!", {
        description: "Your post is now synchronized across website and mobile apps.",
      });

      // Reset form
      setContent("");
      setTitle("");
      setMediaUrl("");
      setShowMediaInput(false);
      setShowPoll(false);
      setPollQuestion("");
      setPollOptions(["", ""]);
      setIsOpen(false);

      if (onPostCreated) {
        onPostCreated(post);
      }
    } catch {
      toast.error("Failed to publish post. Please check your connection.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="mb-6 rounded-2xl border border-border/80 bg-card p-4 shadow-sm transition-all md:p-5">
      <div className="flex gap-3">
        <div className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-full border border-border bg-secondary font-bold text-foreground">
          {user?.avatar ? (
            <img src={user.avatar} alt={user.name} className="h-full w-full object-cover" />
          ) : (
            <span>{(user?.name ?? "Fan").slice(0, 2).toUpperCase()}</span>
          )}
        </div>

        <div className="flex-1">
          {!isOpen ? (
            <button
              type="button"
              onClick={() => setIsOpen(true)}
              className="flex h-11 w-full items-center justify-between rounded-xl border border-input/60 bg-muted/40 px-4 text-left text-sm text-muted-foreground transition-all hover:bg-muted hover:text-foreground"
            >
              <span>What's happening in the paddock? Start a discussion…</span>
              <span className="flex items-center gap-1 rounded-full bg-primary/10 px-2.5 py-1 text-xs font-semibold text-primary">
                <Sparkles className="h-3 w-3" /> Post
              </span>
            </button>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-3">
              <div className="flex items-center justify-between border-b border-border/50 pb-2">
                <div className="flex items-center gap-2 text-xs font-semibold text-muted-foreground">
                  <span>Posting as <strong className="text-foreground">{user?.name ?? "Paddock Member"}</strong></span>
                  <span>({user?.handle ?? "@fan"})</span>
                </div>
                <Button
                  variant="unstyled"
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="rounded-full p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="Close composer"
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>

              {/* Optional Title */}
              <input
                type="text"
                placeholder="Title (optional, e.g. Telemetry Analysis or Hot Debate)"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full rounded-lg border border-input/50 bg-background px-3 py-1.5 text-sm font-semibold outline-none focus:border-primary"
              />

              {/* Main Content */}
              <textarea
                value={content}
                onChange={(e) => setContent(e.target.value)}
                maxLength={maxChars}
                rows={3}
                placeholder="Share your race reaction, setup opinions, or predictions..."
                className="w-full resize-none rounded-xl border border-input/50 bg-background p-3 text-sm leading-relaxed outline-none transition-colors focus:border-primary"
                autoFocus
              />

              {/* Character remaining and Category selector */}
              <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                <div className="flex flex-wrap items-center gap-1.5">
                  <span className="font-semibold text-muted-foreground">Category:</span>
                  {(["Paddock Buzz", "Race Debrief", "Hot Take", "Tech Talk", "Meme"] as const).map((cat) => (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setCategory(cat)}
                      className={cn(
                        "rounded-full px-2.5 py-1 font-medium transition-colors",
                        category === cat
                          ? "bg-primary text-primary-foreground font-semibold"
                          : "bg-muted text-muted-foreground hover:bg-secondary hover:text-foreground"
                      )}
                    >
                      {cat}
                    </button>
                  ))}
                </div>

                <span className={cn("font-mono text-xs", charsRemaining < 40 ? "text-destructive font-bold" : "text-muted-foreground")}>
                  {charsRemaining} left
                </span>
              </div>

              {/* Team tag selector */}
              <div className="flex flex-wrap items-center gap-2 text-xs">
                <span className="font-semibold text-muted-foreground">Tag Team:</span>
                <select
                  value={selectedTeam}
                  onChange={(e) => setSelectedTeam(e.target.value)}
                  className="rounded-lg border border-input bg-background px-2.5 py-1 text-xs font-medium outline-none"
                >
                  <option value="">None / General F1</option>
                  {teams.map((t) => (
                    <option key={t.id} value={t.id}>
                      {t.name}
                    </option>
                  ))}
                </select>
              </div>

              {/* Media URL Input Box */}
              {showMediaInput && (
                <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Image className="h-3.5 w-3.5 text-primary" /> Image or Media URL
                    </span>
                    <button
                      type="button"
                      onClick={() => { setShowMediaInput(false); setMediaUrl(""); }}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Cancel
                    </button>
                  </div>
                  <input
                    type="url"
                    value={mediaUrl}
                    onChange={(e) => setMediaUrl(e.target.value)}
                    placeholder="https://example.com/image.jpg"
                    className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs outline-none focus:border-primary"
                  />
                  <div className="flex flex-wrap items-center gap-1.5 pt-1">
                    <span className="text-[11px] text-muted-foreground">Presets:</span>
                    {SAMPLE_MEDIA.map((s) => (
                      <button
                        key={s.label}
                        type="button"
                        onClick={() => setMediaUrl(s.url)}
                        className="rounded bg-secondary px-2 py-0.5 text-[10px] font-semibold text-secondary-foreground hover:bg-primary hover:text-primary-foreground"
                      >
                        {s.label}
                      </button>
                    ))}
                  </div>
                  {mediaUrl && (
                    <div className="relative mt-2 aspect-video w-full max-h-48 overflow-hidden rounded-lg border border-border">
                      <img src={mediaUrl} alt="Preview" className="h-full w-full object-cover" />
                    </div>
                  )}
                </div>
              )}

              {/* Poll builder box */}
              {showPoll && (
                <div className="rounded-xl border border-border bg-muted/30 p-3 space-y-2.5">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <BarChart2 className="h-3.5 w-3.5 text-primary" /> Community Poll
                    </span>
                    <button
                      type="button"
                      onClick={() => { setShowPoll(false); setPollQuestion(""); setPollOptions(["", ""]); }}
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      Remove Poll
                    </button>
                  </div>
                  <input
                    type="text"
                    value={pollQuestion}
                    onChange={(e) => setPollQuestion(e.target.value)}
                    placeholder="Ask a question (e.g. Who wins the Sprint?)"
                    className="w-full rounded-lg border border-input bg-background px-3 py-1.5 text-xs font-medium outline-none focus:border-primary"
                  />
                  <div className="space-y-1.5">
                    {pollOptions.map((opt, i) => (
                      <div key={i} className="flex items-center gap-2">
                        <input
                          type="text"
                          value={opt}
                          onChange={(e) => handleUpdatePollOption(i, e.target.value)}
                          placeholder={`Option ${i + 1}`}
                          className="flex-1 rounded-lg border border-input bg-background px-3 py-1 text-xs outline-none focus:border-primary"
                        />
                        {pollOptions.length > 2 && (
                          <button
                            type="button"
                            onClick={() => handleRemovePollOption(i)}
                            className="text-muted-foreground hover:text-destructive"
                          >
                            <X className="h-3.5 w-3.5" />
                          </button>
                        )}
                      </div>
                    ))}
                  </div>
                  {pollOptions.length < 4 && (
                    <button
                      type="button"
                      onClick={handleAddPollOption}
                      className="text-xs font-semibold text-primary hover:underline"
                    >
                      + Add another option
                    </button>
                  )}
                </div>
              )}

              {/* Footer toolbar & submit */}
              <div className="flex items-center justify-between border-t border-border/50 pt-2.5">
                <div className="flex items-center gap-2">
                  <Button
                    variant="unstyled"
                    type="button"
                    onClick={() => setShowMediaInput(!showMediaInput)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors",
                      showMediaInput ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <Image className="h-3.5 w-3.5" /> Add Image
                  </Button>
                  <Button
                    variant="unstyled"
                    type="button"
                    onClick={() => setShowPoll(!showPoll)}
                    className={cn(
                      "inline-flex items-center gap-1 rounded-lg px-2.5 py-1.5 text-xs font-semibold transition-colors",
                      showPoll ? "bg-primary/10 text-primary" : "text-muted-foreground hover:bg-muted hover:text-foreground"
                    )}
                  >
                    <BarChart2 className="h-3.5 w-3.5" /> Poll
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="unstyled"
                    type="button"
                    onClick={() => setIsOpen(false)}
                    className="rounded-lg px-3 py-1.5 text-xs font-medium text-muted-foreground hover:bg-muted hover:text-foreground"
                  >
                    Cancel
                  </Button>
                  <Button
                    variant="unstyled"
                    type="submit"
                    disabled={!content.trim()}
                    className={cn(
                      "inline-flex items-center gap-1.5 rounded-lg px-4 py-1.5 text-xs font-bold transition-all shadow-sm",
                      content.trim()
                        ? "bg-primary text-primary-foreground hover:bg-primary/90"
                        : "cursor-not-allowed bg-muted text-muted-foreground"
                    )}
                  >
                    <Send className="h-3.5 w-3.5" /> Post
                  </Button>
                </div>
              </div>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}
