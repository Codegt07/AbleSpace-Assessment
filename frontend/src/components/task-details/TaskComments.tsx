"use client";

import type { Dispatch, SetStateAction } from "react";

import { TaskComment } from "./types";

type TaskCommentsProps = {
  comments: TaskComment[];
  rootComments: TaskComment[];
  visibleComments: TaskComment[];
  showAllComments: boolean;
  setShowAllComments: Dispatch<SetStateAction<boolean>>;
  expandedReplies: Set<string>;
  toggleReplies: (commentId: string) => void;
  canComment: boolean;
  viewOnly: boolean;
  currentUserId: string;
  addingReply: boolean;
  replyText: string;
  setReplyingTo: Dispatch<SetStateAction<string | null>>;
  replyingTo: string | null;
  setReplyText: Dispatch<SetStateAction<string>>;
  handleAddComment: (parentCommentId?: string | null, messageOverride?: string) => void | Promise<void>;
  addingComment: boolean;
  commentText: string;
  setCommentText: Dispatch<SetStateAction<string>>;
  getUser: (userId: string) => { name?: string; avatar?: string } | undefined;
  userInitial: (userId: string) => string;
  formatUserName: (userId: string) => string;
};

export default function TaskComments({
  comments,
  rootComments,
  visibleComments,
  showAllComments,
  setShowAllComments,
  expandedReplies,
  toggleReplies,
  canComment,
  viewOnly,
  currentUserId,
  addingReply,
  replyText,
  setReplyingTo,
  replyingTo,
  setReplyText,
  handleAddComment,
  addingComment,
  commentText,
  setCommentText,
  getUser,
  userInitial,
  formatUserName,
}: TaskCommentsProps) {
  return (
            <div className="order-8 mt-8 sm:mt-9 lg:order-none">
              <div className="mb-3.5 flex items-center justify-between gap-2">
                <h2 className="text-[14px] font-semibold text-[var(--accent)]">
                  Comments
                </h2>
                {rootComments.length > 2 && (
                  <button
                    type="button"
                    onClick={() => setShowAllComments((previous) => !previous)}
                    className="rounded-md px-2 py-1 text-[11px] cursor-pointer font-medium text-[var(--muted)] transition-colors hover:bg-[var(--accent-soft)] hover:text-[var(--accent)]"
                  >
                    {showAllComments ? "Show less" : `View more (${rootComments.length - 2})`}
                  </button>
                )}
              </div>
{visibleComments.map((comment) => {
  const replies = comments.filter(
    (reply) => reply.parentCommentId === comment._id,
  );

  const repliesOpen = expandedReplies.has(comment._id);

  return (
    <div
      key={comment._id}
      className="mb-3.5 overflow-hidden rounded-lg border border-[var(--border)] bg-[var(--surface)]"
    >
      {/* Main comment */}
      <div className="px-4 py-3.5">
        <div className="flex items-start gap-3">
          {/* Comment avatar */}
          <div className="flex h-[28px] w-[28px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--surface-strong)] text-[9px] font-medium text-white">
            {getUser(comment.userId)?.avatar ? (
              <img
                src={getUser(comment.userId)?.avatar}
                alt=""
                className="h-full w-full object-cover"
              />
            ) : (
              userInitial(comment.userId)
            )}
          </div>

          {/* Comment content */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className="text-[12px] font-semibold text-[var(--text)]">
                {formatUserName(comment.userId)}
              </span>

              <span className="text-[10px] text-[var(--muted)]">
                {new Date(comment.createdAt).toLocaleString("en-GB", {
                  day: "2-digit",
                  month: "short",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </span>
            </div>

            {/* Comment + View replies on same row */}
            <div className="mt-2 flex flex-wrap items-center justify-between gap-2 sm:gap-4">
              <p className="min-w-0 text-[13px] leading-5 text-[var(--text)]">
                {comment.message}
              </p>

              {replies.length > 0 && (
                <button
                  type="button"
                  onClick={() => toggleReplies(comment._id)}
                  className="shrink-0 text-[10px] cursor-pointer font-medium text-[var(--muted)] transition-colors hover:text-[var(--accent)] sm:text-[11px]"
                >
                  {repliesOpen
                    ? "Hide replies"
                    : `View ${replies.length} ${
                        replies.length === 1
                          ? "reply"
                          : "replies"
                      }`}
                </button>
              )}
            </div>
          </div>

          {/* Comment action */}
          <button
            type="button"
            className="shrink-0 rounded-md px-1.5 cursor-pointer py-1 text-[13px] text-[var(--muted)] hover:bg-[var(--hover)]"
          >
            ···
          </button>
        </div>
      </div>

      {/* Expanded replies */}
      {repliesOpen && replies.length > 0 && (
        <div className="border-t border-[var(--border)] px-4 py-2.5">
          <div className="ml-[40px] border-l border-[var(--border)] pl-3.5">
            {replies.map((reply) => (
              <div
                key={reply._id}
                className="flex gap-2.5 py-2"
              >
                {/* Reply avatar */}
                <div className="flex h-[22px] w-[22px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--surface-strong)] text-[7px] text-white">
                  {getUser(reply.userId)?.avatar ? (
                    <img
                      src={getUser(reply.userId)?.avatar}
                      alt=""
                      className="h-full w-full object-cover"
                    />
                  ) : (
                    userInitial(reply.userId)
                  )}
                </div>

                <div>
                  <div className="flex min-w-0 flex-wrap items-center gap-1.5">
                    <span className="text-[10px] font-semibold text-[var(--text)]">
                      {formatUserName(reply.userId)}
                    </span>

                    <span className="text-[9px] text-[var(--muted)]">
                      {new Date(reply.createdAt).toLocaleString(
                        "en-GB",
                        {
                          day: "2-digit",
                          month: "short",
                          hour: "2-digit",
                          minute: "2-digit",
                        },
                      )}
                    </span>
                  </div>

                  <p className="mt-0.5 text-[11px] leading-4 text-[var(--muted)]">
                    {reply.message}
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Leave a reply */}
      {canComment && (
        <div className="border-t border-[var(--border)]">
          <div className="flex h-[48px] w-full items-center gap-2.5 px-4">
            {/* Current user avatar */}
            <div className="flex h-[22px] w-[22px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--surface-strong)] text-[8px] text-white">
              {getUser(currentUserId)?.avatar ? (
                <img
                  src={getUser(currentUserId)?.avatar}
                  alt=""
                  className="h-full w-full object-cover"
                />
              ) : (
                userInitial(currentUserId)
              )}
            </div>

            <input
              value={
                replyingTo === comment._id
                  ? replyText
                  : ""
              }
              onFocus={() => {
                setReplyingTo(comment._id);
              }}
              onChange={(e) => {
                setReplyingTo(comment._id);
                setReplyText(e.target.value);
              }}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleAddComment(comment._id);
                }
              }}
              placeholder="Leave a reply..."
              className="h-full flex-1 bg-transparent text-[11px] text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
            />

            {/* Send */}
            <button
              type="button"
              onClick={() => handleAddComment(comment._id)}
              disabled={
                addingReply || !replyText.trim()
              }
              className="shrink-0 cursor-pointer   text-[14px] text-[var(--muted)] transition-colors hover:text-[var(--accent)] disabled:opacity-40"
            >
              ➤
            </button>
          </div>
        </div>
      )}
    </div>
  );
})}

{/* Main comment input */}
{canComment ? (
  <div className="flex h-[48px] items-center gap-2.5 rounded-lg border border-[var(--border)] px-4">
    <div className="flex h-[23px] w-[23px] shrink-0 items-center justify-center overflow-hidden rounded-full bg-[var(--surface-strong)] text-[8px] text-white">
      {getUser(currentUserId)?.avatar ? (
        <img
          src={getUser(currentUserId)?.avatar}
          alt=""
          className="h-full w-full object-cover"
        />
      ) : (
        userInitial(currentUserId)
      )}
    </div>

    <input
      value={commentText}
      onChange={(e) => setCommentText(e.target.value)}
      onKeyDown={(e) => {
        if (e.key === "Enter") {
          handleAddComment(null);
        }
      }}
      placeholder="Add a comment..."
      className="h-full flex-1 bg-transparent text-[12px] text-[var(--text)] outline-none placeholder:text-[var(--muted)]"
    />

    <button
      type="button"
      onClick={() => handleAddComment(null)}
      disabled={addingComment || !commentText.trim()}
      className="cursor-pointer text-[14px] text-[var(--muted)] transition-colors hover:text-[var(--accent)] disabled:opacity-40"
    >
      ➤
    </button>
  </div>
) : (
  <div className="flex h-[48px] items-center rounded-lg border border-[var(--border)] px-4 text-[11px] text-[var(--muted)]">
    {viewOnly
  ? "Comments are not allowed in view-only mode"
  : "You need to be a member to comment"}
  </div>
)}
  </div>
  );
}
