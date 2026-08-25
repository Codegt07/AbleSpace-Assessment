"use client";

import { useMemo, useState } from "react";

import type { TaskComment } from "@/components/task-details/types";

export default function useTaskComments(comments: TaskComment[]) {
  const [commentText, setCommentText] = useState("");
  const [replyingTo, setReplyingTo] = useState<string | null>(null);
  const [replyText, setReplyText] = useState("");
  const [showAllComments, setShowAllComments] = useState(false);
  const [expandedReplies, setExpandedReplies] = useState<Set<string>>(
    new Set(),
  );

  const rootComments = useMemo(
    () => comments.filter((comment) => !comment.parentCommentId),
    [comments],
  );

  const visibleComments = useMemo(
    () =>
      showAllComments ? rootComments : rootComments.slice(0, 2),
    [rootComments, showAllComments],
  );

  const toggleReplies = (commentId: string) => {
    setExpandedReplies((previous) => {
      const next = new Set(previous);

      if (next.has(commentId)) {
        next.delete(commentId);
      } else {
        next.add(commentId);
      }

      return next;
    });
  };

  return {
    commentText,
    setCommentText,
    replyingTo,
    setReplyingTo,
    replyText,
    setReplyText,
    showAllComments,
    setShowAllComments,
    expandedReplies,
    rootComments,
    visibleComments,
    toggleReplies,
  };
}