/** Map backend post shape to UI-friendly fields. */
export function normalizePost(post, currentUserId) {
  if (!post) return null;

  const author = post.author || post.user;
  const likeCount = post._count?.likes ?? post.likes ?? 0;
  const commentCount = post._count?.comments ?? post.comments ?? 0;
  const bookmarkCount = post._count?.bookmarks ?? post.bookmarks ?? 0;
  const likedByMe =
    post.isLiked ??
    (currentUserId && post.likes?.some?.((l) => l.user_id === currentUserId));

    const normalizedTags = post.tags?.map((t) => {
      if (typeof t === 'string') return t;
      return t.tag?.tag_name || t.name || t.tag_name || '';
    }).filter(Boolean) || [];

    return {
      ...post,
      author: author
        ? {
            id: author.id,
            username: author.username,
            profile_image: author.profile_image,
            educationLevel: author.education_level || post.education_level,
          }
        : undefined,
      category: post.category?.name || (typeof post.category === 'string' && post.category !== 'General' ? post.category : null) || (normalizedTags.length > 0 ? normalizedTags[0] : 'ทั่วไป'),
      tags: normalizedTags,
    likes: likeCount,
    comments: commentCount,
    bookmarks: bookmarkCount,
    isLiked: Boolean(likedByMe),
    isBookmarked: Boolean(post.isBookmarked),
    views: post.view_count ?? post.views ?? 0,
    createdAt: post.created_at
      ? new Date(post.created_at).toLocaleDateString()
      : post.createdAt,
  };
}
