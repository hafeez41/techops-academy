"use client";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

export function LessonContent({ content }: { content: string }) {
  return (
    <div className="prose prose-neutral dark:prose-invert max-w-none mb-6
      prose-headings:font-semibold prose-headings:tracking-tight
      prose-a:text-brand prose-a:no-underline hover:prose-a:underline
      prose-code:rounded prose-code:bg-muted prose-code:px-1 prose-code:py-0.5 prose-code:text-sm prose-code:font-mono
      prose-pre:bg-muted prose-pre:border prose-pre:border-border
      prose-blockquote:border-l-brand prose-blockquote:text-muted-foreground
      prose-img:rounded-lg prose-img:border prose-img:border-border
      prose-hr:border-border">
      <ReactMarkdown remarkPlugins={[remarkGfm]}>
        {content}
      </ReactMarkdown>
    </div>
  );
}
