import { useState, useCallback, useRef } from 'react';
import { useSummarizeArticle } from '@workspace/api-client-react';
import type { NewsArticle } from '@workspace/api-client-react';
import { Sparkles, ExternalLink, Clock, AlertCircle } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface ArticleCardProps {
  article: NewsArticle;
  index: number;
}

function ImageWithFallback({ src, alt, className }: { src: string | null | undefined; alt: string; className?: string }) {
  const [failed, setFailed] = useState(false);

  if (!src || failed) {
    return (
      <div className={`bg-gradient-to-br from-muted to-secondary flex items-center justify-center ${className}`}>
        <div className="text-center px-4">
          <div className="w-10 h-10 mx-auto mb-2 rounded-full bg-border flex items-center justify-center">
            <span className="font-serif-display text-lg font-bold text-muted-foreground">N</span>
          </div>
          <p className="text-xs text-muted-foreground font-medium leading-snug">{alt.slice(0, 40)}</p>
        </div>
      </div>
    );
  }

  return (
    <img
      src={src}
      alt={alt}
      className={`object-cover ${className}`}
      onError={() => setFailed(true)}
    />
  );
}

function CategoryDot({ source }: { source: string }) {
  return (
    <span className="inline-flex items-center gap-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-primary flex-shrink-0" />
      <span className="text-xs font-semibold uppercase tracking-widest text-primary">{source}</span>
    </span>
  );
}

function formatTime(dateStr: string): string {
  try {
    return formatDistanceToNow(new Date(dateStr), { addSuffix: true });
  } catch {
    return dateStr;
  }
}

export function ArticleCard({ article, index }: ArticleCardProps) {
  const [summary, setSummary] = useState<string | null>(null);
  const [summaryError, setSummaryError] = useState(false);

  const summarize = useSummarizeArticle({
    mutation: {
      onSuccess: (data) => {
        setSummary(data.summary);
        setSummaryError(false);
      },
      onError: () => {
        setSummaryError(true);
      },
    },
  });

  const summarizeFnRef = useRef(summarize.mutate);
  summarizeFnRef.current = summarize.mutate;

  const handleSummarize = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setSummaryError(false);
    summarizeFnRef.current({
      data: {
        title: article.title,
        description: article.description ?? null,
        content: article.content ?? null,
        url: article.url,
      },
    });
  }, [article.title, article.description, article.content, article.url]);

  const delayClass = `card-enter-${Math.min(index + 1, 10)}`;

  return (
    <article
      data-testid={`article-card-${index}`}
      className={`card-enter ${delayClass} group bg-card border border-card-border rounded-lg overflow-hidden flex flex-col transition-shadow duration-300 hover:shadow-md`}
      style={{ boxShadow: 'var(--shadow-xs)' }}
    >
      {/* Image */}
      <a
        href={article.url}
        target="_blank"
        rel="noopener noreferrer"
        data-testid={`article-image-link-${index}`}
        className="block overflow-hidden flex-shrink-0"
      >
        <div className="relative h-36 sm:h-48 overflow-hidden">
          <ImageWithFallback
            src={article.urlToImage}
            alt={article.title}
            className="w-full h-full transition-transform duration-500 group-hover:scale-[1.03]"
          />
          {/* Subtle gradient at bottom for text readability */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none" />
        </div>
      </a>

      {/* Content */}
      <div className="flex flex-col flex-1 p-4 sm:p-5">
        {/* Source + Time row */}
        <div className="flex items-center justify-between mb-3">
          <CategoryDot source={article.source.name || 'News'} />
          <div className="flex items-center gap-1 text-muted-foreground">
            <Clock className="w-3 h-3" />
            <span className="text-xs">{formatTime(article.publishedAt)}</span>
          </div>
        </div>

        {/* Title */}
        <a
          href={article.url}
          target="_blank"
          rel="noopener noreferrer"
          data-testid={`article-title-link-${index}`}
          className="block group/title flex-1"
        >
          <h2 className="font-serif-display font-semibold text-[1.05rem] leading-snug text-foreground group-hover/title:text-primary transition-colors duration-200 line-clamp-3 mb-2">
            {article.title}
          </h2>
        </a>

        {/* Description */}
        {article.description && (
          <p className="text-sm text-muted-foreground leading-relaxed line-clamp-2 mb-4">
            {article.description}
          </p>
        )}

        {/* Actions row */}
        <div className="flex flex-wrap items-center justify-between gap-2 mt-auto pt-3 border-t border-card-border">
          <a
            href={article.url}
            target="_blank"
            rel="noopener noreferrer"
            data-testid={`article-external-link-${index}`}
            className="inline-flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors duration-200"
          >
            <ExternalLink className="w-3.5 h-3.5" />
            <span>Read full story</span>
          </a>

          {!summary && (
            <button
              data-testid={`button-summarize-${index}`}
              onClick={handleSummarize}
              disabled={summarize.isPending}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-md text-xs font-semibold bg-accent text-accent-foreground border border-accent-border hover:bg-primary hover:text-primary-foreground hover:border-primary-border transition-all duration-200 disabled:opacity-60 disabled:cursor-not-allowed"
            >
              <Sparkles className="w-3.5 h-3.5" />
              {summarize.isPending ? 'Summarizing...' : 'Summarize'}
            </button>
          )}
        </div>

        {/* Loading state */}
        {summarize.isPending && !summary && (
          <div className="mt-3 space-y-2">
            <div className="skeleton-shimmer h-3 rounded-full w-full" />
            <div className="skeleton-shimmer h-3 rounded-full w-5/6" />
            <div className="skeleton-shimmer h-3 rounded-full w-4/6" />
          </div>
        )}

        {/* Summary */}
        {summary && (
          <div
            data-testid={`summary-${index}`}
            className="summary-reveal mt-3 rounded-md p-4 bg-accent border border-accent-border"
          >
            <div className="flex items-center gap-2 mb-2">
              <Sparkles className="w-3.5 h-3.5 text-primary flex-shrink-0" />
              <span className="text-xs font-semibold text-primary uppercase tracking-widest">AI Summary</span>
              <button
                data-testid={`button-dismiss-summary-${index}`}
                onClick={() => setSummary(null)}
                className="ml-auto text-muted-foreground hover:text-foreground text-xs underline transition-colors"
              >
                Dismiss
              </button>
            </div>
            <p className="text-sm leading-relaxed text-foreground">{summary}</p>
          </div>
        )}

        {/* Error state */}
        {summaryError && (
          <div
            data-testid={`summary-error-${index}`}
            className="summary-reveal mt-3 rounded-md p-3 bg-destructive/10 border border-destructive/20 flex items-start gap-2"
          >
            <AlertCircle className="w-4 h-4 text-destructive flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-xs text-destructive font-semibold">Summary unavailable</p>
              <p className="text-xs text-muted-foreground mt-0.5">Could not generate a summary. Try again.</p>
              <button
                data-testid={`button-retry-summary-${index}`}
                onClick={handleSummarize}
                className="text-xs text-primary hover:underline mt-1"
              >
                Retry
              </button>
            </div>
          </div>
        )}
      </div>
    </article>
  );
}
