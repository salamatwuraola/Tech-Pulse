import { ArticleCard } from './ArticleCard';
import { ArticleSkeleton } from './ArticleSkeleton';
import type { NewsArticle } from '@workspace/api-client-react';
import { Newspaper, RefreshCw, SearchX } from 'lucide-react';

interface ArticleGridProps {
  articles: NewsArticle[] | undefined;
  isLoading: boolean;
  isError: boolean;
  searchQuery: string;
  onRetry: () => void;
}

export function ArticleGrid({ articles, isLoading, isError, searchQuery, onRetry }: ArticleGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="articles-loading">
        {Array.from({ length: 6 }).map((_, i) => (
          <ArticleSkeleton key={i} />
        ))}
      </div>
    );
  }

  if (isError) {
    return (
      <div
        data-testid="articles-error"
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-destructive/10 flex items-center justify-center mb-4">
          <Newspaper className="w-7 h-7 text-destructive" />
        </div>
        <h3 className="font-serif-display text-xl font-semibold text-foreground mb-2">
          Failed to load headlines
        </h3>
        <p className="text-sm text-muted-foreground mb-6 max-w-sm">
          There was a problem fetching the latest news. Check your connection and try again.
        </p>
        <button
          data-testid="button-retry"
          onClick={onRetry}
          className="inline-flex items-center gap-2 px-4 py-2 rounded-md bg-primary text-primary-foreground text-sm font-semibold hover:opacity-90 transition-opacity"
        >
          <RefreshCw className="w-4 h-4" />
          Try Again
        </button>
      </div>
    );
  }

  if (!articles || articles.length === 0) {
    return (
      <div
        data-testid="articles-empty"
        className="flex flex-col items-center justify-center py-24 text-center"
      >
        <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center mb-4">
          <SearchX className="w-7 h-7 text-muted-foreground" />
        </div>
        <h3 className="font-serif-display text-xl font-semibold text-foreground mb-2">
          {searchQuery ? 'No stories found' : 'No headlines available'}
        </h3>
        <p className="text-sm text-muted-foreground max-w-sm">
          {searchQuery
            ? `Nothing matched "${searchQuery}". Try a different keyword or browse by category.`
            : 'No headlines are available in this category right now. Check back soon.'}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6" data-testid="articles-grid">
      {articles.map((article, index) => (
        <ArticleCard
          key={`${article.url}-${index}`}
          article={article}
          index={index}
        />
      ))}
    </div>
  );
}
