'use client';

import React, { useState } from 'react';
import { useParams } from 'next/navigation';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axios from 'axios';
import { ArrowLeft, Users, MapPin, FileText, ThumbsUp, ThumbsDown, Loader, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import toast, { Toaster } from 'react-hot-toast';
import LoadingSpinner from '@/components/LoadingSpinner';

interface Community {
  _id: string;
  name: string;
  location: string;
  description: string;
  admin: string | AdminMember;
  members: Member[];
  membersCount: number;
  isMember: boolean;
  isAdmin: boolean;
  createdAt: string;
}

interface AdminMember {
  _id: string;
  username: string;
  email: string;
  profilePic?: string;
}

interface Member {
  _id: string;
  username: string;
  email: string;
  profilePic?: string;
}

interface CommunityPost {
  _id: string;
  content: string;
  author: {
    _id: string;
    username: string;
    email: string;
    profilePic?: string;
  };
  category: string;
  upvotesCount: number;
  downvotesCount: number;
  userVote?: string | null;
  createdAt: string;
}

interface Comment {
  _id: string;
  content: string;
  author: {
    _id: string;
    username: string;
    email: string;
    profilePic?: string;
  };
  upvotesCount: number;
  downvotesCount: number;
  userVote?: string | null;
  createdAt: string;
}

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5000';

// API Functions
const getCommunityDetails = async (id: string): Promise<Community> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token');

  const response = await axios.get<ApiResponse<Community>>(
    `${API_BASE}/api/communities/${id}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return response.data.data;
};

const getCommunityPosts = async (id: string): Promise<CommunityPost[]> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token');

  const response = await axios.get<ApiResponse<CommunityPost[]>>(
    `${API_BASE}/api/communities/${id}/posts`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return response.data.data || [];
};

const createPost = async (id: string, content: string, category: string): Promise<CommunityPost> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token');

  const response = await axios.post<ApiResponse<CommunityPost>>(
    `${API_BASE}/api/communities/${id}/posts`,
    { content, category },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return response.data.data;
};

const voteOnPost = async (communityId: string, postId: string, voteType: 'upvote' | 'downvote'): Promise<CommunityPost> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token');

  const response = await axios.post<ApiResponse<CommunityPost>>(
    `${API_BASE}/api/communities/${communityId}/posts/${postId}/vote`,
    { voteType },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return response.data.data;
};

const removeUserFromCommunity = async (communityId: string, userId: string): Promise<void> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token');

  await axios.delete(
    `${API_BASE}/api/communities/${communityId}/members/${userId}`,
    { headers: { Authorization: `Bearer ${token}` } }
  );
};

// Comment API functions
const getPostComments = async (communityId: string, postId: string, page: number = 1): Promise<Comment[]> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token');

  const response = await axios.get<ApiResponse<Comment[]>>(
    `${API_BASE}/api/communities/${communityId}/posts/${postId}/comments?page=${page}&limit=10`,
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return response.data.data || [];
};

const createComment = async (communityId: string, postId: string, content: string): Promise<Comment> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token');

  const response = await axios.post<ApiResponse<Comment>>(
    `${API_BASE}/api/communities/${communityId}/posts/${postId}/comments`,
    { content },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return response.data.data;
};

const voteOnComment = async (communityId: string, postId: string, commentId: string, voteType: 'upvote' | 'downvote'): Promise<Comment> => {
  const token = localStorage.getItem('authToken');
  if (!token) throw new Error('No authentication token');

  const response = await axios.post<ApiResponse<Comment>>(
    `${API_BASE}/api/communities/${communityId}/posts/${postId}/comments/${commentId}/vote`,
    { voteType },
    { headers: { Authorization: `Bearer ${token}` } }
  );

  return response.data.data;
};

const CommunityDetailsPage = () => {
  const params = useParams();
  const communityId = params.id as string;
  const queryClient = useQueryClient();
  const [newPostContent, setNewPostContent] = useState('');
  const [newPostCategory, setNewPostCategory] = useState('general');
  const [memberToRemove, setMemberToRemove] = useState<string | null>(null);
  const [showRemoveConfirm, setShowRemoveConfirm] = useState(false);
  const [showPostModal, setShowPostModal] = useState(false);
  const [currentUserId, setCurrentUserId] = useState<string | null>(null);
  const [selectedPostForComments, setSelectedPostForComments] = useState<string | null>(null);
  const [newCommentContent, setNewCommentContent] = useState<Record<string, string>>({});

  // Get current user ID from localStorage
  React.useEffect(() => {
    const userId = localStorage.getItem('userId');
    setCurrentUserId(userId);
  }, []);

  // Fetch community details
  const { data: community, isLoading: communityLoading, error: communityError } = useQuery({
    queryKey: ['community', communityId],
    queryFn: () => getCommunityDetails(communityId),
    enabled: !!communityId,
    staleTime: 5 * 60 * 1000,
    gcTime: 15 * 60 * 1000,
    retry: 2,
  });

  // Fetch community posts
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['communityPosts', communityId],
    queryFn: () => getCommunityPosts(communityId),
    enabled: !!communityId,
    staleTime: 2 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    retry: 2,
  });

  // Create post mutation
  const postMutation = useMutation({
    mutationFn: () => createPost(communityId, newPostContent, newPostCategory),
    onSuccess: (newPost) => {
      queryClient.setQueryData(['communityPosts', communityId], (old: CommunityPost[] | undefined) => {
        return old ? [newPost, ...old] : [newPost];
      });
      setNewPostContent('');
      setNewPostCategory('general');
      setShowPostModal(false);
      toast.success('Post created successfully! 🎉');
    },
    onError: (error) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorMessage = (error as any).response?.data?.message || 'Failed to create post';
      toast.error(errorMessage);
    },
  });

  // Vote on post mutation with optimistic updates
  const voteMutation = useMutation({
    mutationFn: ({ postId, voteType }: { postId: string; voteType: 'upvote' | 'downvote' }) =>
      voteOnPost(communityId, postId, voteType),
    onMutate: async ({ postId, voteType }) => {
      // Cancel any outgoing refetches to avoid overwriting optimistic update
      await queryClient.cancelQueries({ queryKey: ['communityPosts', communityId] });

      // Snapshot the previous value
      const previousPosts = queryClient.getQueryData<CommunityPost[]>(['communityPosts', communityId]);

      // Optimistically update to the new value
      queryClient.setQueryData(['communityPosts', communityId], (old: CommunityPost[] | undefined) => {
        if (!old) return old;
        return old.map(post => {
          if (post._id === postId) {
            const updatedPost = { ...post };
            if (voteType === 'upvote') {
              updatedPost.upvotesCount = (updatedPost.upvotesCount || 0) + 1;
            } else {
              updatedPost.downvotesCount = (updatedPost.downvotesCount || 0) + 1;
            }
            updatedPost.userVote = voteType;
            return updatedPost;
          }
          return post;
        });
      });

      // Return a context object with the snapshotted value
      return { previousPosts };
    },
    onSuccess: (updatedPost) => {
      // Update with actual server response
      queryClient.setQueryData(['communityPosts', communityId], (old: CommunityPost[] | undefined) => {
        if (!old) return [updatedPost];
        return old.map(post => post._id === updatedPost._id ? updatedPost : post);
      });
      toast.success('Vote recorded! ✨');
    },
    onError: (error, variables, context) => {
      // Revert to previous data on error
      if (context?.previousPosts) {
        queryClient.setQueryData(['communityPosts', communityId], context.previousPosts);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorMessage = (error as any).response?.data?.message || 'Failed to vote';
      toast.error(errorMessage);
    },
  });

  // Remove user mutation
  const removeUserMutation = useMutation({
    mutationFn: () => {
      if (!memberToRemove) throw new Error('No member selected');
      return removeUserFromCommunity(communityId, memberToRemove);
    },
    onSuccess: () => {
      // Update community data with new members count
      queryClient.setQueryData(['community', communityId], (old: Community | undefined) => {
        if (!old) return old;
        return {
          ...old,
          members: old.members.filter(m => m._id !== memberToRemove),
          membersCount: old.membersCount - 1
        };
      });
      setMemberToRemove(null);
      setShowRemoveConfirm(false);
      toast.success('Member removed successfully! 👋');
    },
    onError: (error) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorMessage = (error as any).response?.data?.message || 'Failed to remove member';
      toast.error(errorMessage);
      setMemberToRemove(null);
      setShowRemoveConfirm(false);
    },
  });

  // Fetch comments for a post
  const { data: commentsMap = {} } = useQuery({
    queryKey: ['postComments', communityId],
    queryFn: async () => {
      if (!posts || posts.length === 0) return {};
      
      const commentsData: Record<string, Comment[]> = {};
      
      for (const post of posts) {
        try {
          const comments = await getPostComments(communityId, post._id);
          commentsData[post._id] = comments;
        } catch {
          commentsData[post._id] = [];
        }
      }
      
      return commentsData;
    },
    enabled: !!communityId && posts && posts.length > 0,
    staleTime: 60000, // 1 minute
    gcTime: 5 * 60 * 1000,
    retry: 2,
  });

  // Create comment mutation
  const createCommentMutation = useMutation({
    mutationFn: ({ postId, content }: { postId: string; content: string }) =>
      createComment(communityId, postId, content),
    onSuccess: (newComment, { postId }) => {
      // Update comments for this post
      queryClient.setQueryData(['postComments', communityId], (old: Record<string, Comment[]> | undefined) => {
        if (!old) return { [postId]: [newComment] };
        return {
          ...old,
          [postId]: [...(old[postId] || []), newComment]
        };
      });
      
      // Clear input
      setNewCommentContent(prev => {
        const updated = { ...prev };
        delete updated[postId];
        return updated;
      });
      
      toast.success('Comment posted! 💬');
    },
    onError: (error) => {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorMessage = (error as any).response?.data?.message || 'Failed to post comment';
      toast.error(errorMessage);
    },
  });

  // Vote on comment mutation
  const voteCommentMutation = useMutation({
    mutationFn: ({ postId, commentId, voteType }: { postId: string; commentId: string; voteType: 'upvote' | 'downvote' }) =>
      voteOnComment(communityId, postId, commentId, voteType),
    onMutate: async ({ postId, commentId, voteType }) => {
      await queryClient.cancelQueries({ queryKey: ['postComments', communityId] });
      
      const previousComments = queryClient.getQueryData<Record<string, Comment[]>>(['postComments', communityId]);
      
      queryClient.setQueryData(['postComments', communityId], (old: Record<string, Comment[]> | undefined) => {
        if (!old?.[postId]) return old;
        return {
          ...old,
          [postId]: old[postId].map(comment => {
            if (comment._id === commentId) {
              const updated = { ...comment };
              if (voteType === 'upvote') {
                updated.upvotesCount = (updated.upvotesCount || 0) + 1;
              } else {
                updated.downvotesCount = (updated.downvotesCount || 0) + 1;
              }
              updated.userVote = voteType;
              return updated;
            }
            return comment;
          })
        };
      });
      
      return { previousComments };
    },
    onSuccess: (updatedComment, { postId }) => {
      queryClient.setQueryData(['postComments', communityId], (old: Record<string, Comment[]> | undefined) => {
        if (!old?.[postId]) return old;
        return {
          ...old,
          [postId]: old[postId].map(comment => comment._id === updatedComment._id ? updatedComment : comment)
        };
      });
      toast.success('Vote recorded! ✨');
    },
    onError: (error, variables, context) => {
      if (context?.previousComments) {
        queryClient.setQueryData(['postComments', communityId], context.previousComments);
      }
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const errorMessage = (error as any).response?.data?.message || 'Failed to vote';
      toast.error(errorMessage);
    },
  });

  if (communityLoading) {
    return <LoadingSpinner message="Loading community..." fullScreen />;
  }

  if (communityError || !community) {
    return (
      <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-blue-50 p-6 flex items-center justify-center">
        <div className="text-center space-y-4">
          <AlertCircle className="w-16 h-16 text-red-500 mx-auto" />
          <p className="text-lg text-red-600 font-semibold">Community not found</p>
          <Link href="/dashboard/community" className="text-orange-600 hover:text-orange-700 font-semibold inline-flex items-center gap-2">
            ← Back to Communities
          </Link>
        </div>
      </div>
    );
  }

  // Check if user is NOT a member
  if (!community.isMember) {
    return (
      <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-blue-50 p-6 flex items-center justify-center">
        <div className="text-center space-y-6">
          <div>
            <AlertCircle className="w-16 h-16 text-orange-500 mx-auto mb-4" />
            <p className="text-lg text-gray-700 font-semibold">You are not a member of this community</p>
            <p className="text-gray-600 mt-2">Please join the community first to view posts and participate</p>
          </div>
          <Link href="/dashboard/community" className="inline-flex items-center gap-2 px-6 py-3 bg-linear-to-r from-orange-500 to-amber-500 text-white font-semibold rounded-lg hover:shadow-lg transition">
            ← Back to Communities
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-linear-to-br from-slate-50 via-white to-orange-50/30 p-6">
      {/* Remove Member Confirmation Modal */}
      {showRemoveConfirm && memberToRemove && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-sm w-full p-8 border border-orange-100/50">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-red-100 mx-auto mb-4">
              <AlertCircle className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-xl font-semibold text-gray-900 mb-2 text-center">Remove Member?</h3>
            <p className="text-gray-600 text-center mb-8 text-sm leading-relaxed">
              This member will be removed from the community. This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRemoveConfirm(false);
                  setMemberToRemove(null);
                }}
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200"
              >
                Cancel
              </button>
              <button
                onClick={() => removeUserMutation.mutate()}
                disabled={removeUserMutation.isPending}
                className="flex-1 px-4 py-2.5 bg-linear-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-red-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {removeUserMutation.isPending && <Loader className="w-4 h-4 animate-spin" />}
                {removeUserMutation.isPending ? 'Removing...' : 'Remove'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Create Post Modal */}
      {showPostModal && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl shadow-2xl max-w-2xl w-full p-8 border border-orange-100/50">
            <div className="flex items-center justify-between mb-8">
              <div>
                <h3 className="text-2xl font-semibold text-gray-900">Create a Post</h3>
                <p className="text-sm text-gray-500 mt-1">Share your thoughts with the community</p>
              </div>
              <button
                onClick={() => {
                  setShowPostModal(false);
                  setNewPostContent('');
                  setNewPostCategory('general');
                }}
                className="text-gray-400 hover:text-gray-600 text-3xl font-light transition-colors"
              >
                ×
              </button>
            </div>

            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="What&apos;s on your mind? Share a recipe, tip, or discussion..."
              className="w-full p-4 border border-gray-200 rounded-lg resize-none focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200/50 mb-4 text-sm transition-all"
              rows={6}
            />

            {/* Category Selector */}
            <div className="mb-6">
              <label className="block text-sm font-semibold text-gray-700 mb-3">Category</label>
              <select
                value={newPostCategory}
                onChange={(e) => setNewPostCategory(e.target.value)}
                className="w-full p-3 border border-gray-200 rounded-lg focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200/50 text-sm font-medium transition-all"
              >
                <option value="general">General Discussion</option>
                <option value="tips">Tips & Advice</option>
                <option value="food-sharing">Food Sharing</option>
              </select>
            </div>

            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowPostModal(false);
                  setNewPostContent('');
                  setNewPostCategory('general');
                }}
                className="flex-1 px-4 py-2.5 border-2 border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  postMutation.mutate();
                }}
                disabled={!newPostContent.trim() || postMutation.isPending}
                className="flex-1 px-4 py-2.5 bg-linear-to-r from-orange-500 to-amber-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
              >
                {postMutation.isPending && <Loader className="w-4 h-4 animate-spin" />}
                {postMutation.isPending ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Comments Modal */}
      {selectedPostForComments && (
        <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-hidden border border-orange-100/50 flex flex-col">
            {/* Modal Header */}
            <div className="bg-linear-to-r from-orange-500/10 to-amber-500/10 border-b border-orange-100/50 px-8 py-6 flex items-center justify-between">
              <div>
                <h3 className="text-2xl font-bold text-gray-900">Comments</h3>
                <p className="text-sm text-gray-600 mt-1">{(commentsMap[selectedPostForComments] || []).length} responses</p>
              </div>
              <button
                onClick={() => {
                  setSelectedPostForComments(null);
                  setNewCommentContent(prev => {
                    const updated = { ...prev };
                    delete updated[selectedPostForComments];
                    return updated;
                  });
                }}
                className="text-gray-400 hover:text-gray-600 text-3xl font-light transition-colors"
              >
                ×
              </button>
            </div>

            {/* Modal Content - Scrollable */}
            <div className="flex-1 overflow-y-auto">
              {/* Add Comment Form */}
              <div className="sticky top-0 bg-white border-b border-orange-100/50 px-8 py-6 space-y-4 z-10">
                <textarea
                  value={newCommentContent[selectedPostForComments] || ''}
                  onChange={(e) => setNewCommentContent(prev => ({
                    ...prev,
                    [selectedPostForComments]: e.target.value
                  }))}
                  placeholder="Share your thoughts with the community..."
                  className="w-full p-4 border-2 border-orange-200 rounded-xl resize-none focus:outline-none focus:border-orange-500 focus:ring-2 focus:ring-orange-200/50 text-sm transition-all font-medium"
                  rows={3}
                />
                <div className="flex gap-3">
                  <button
                    onClick={() => setSelectedPostForComments(null)}
                    className="flex-1 px-4 py-3 border-2 border-gray-200 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition-all duration-200 text-sm"
                  >
                    Close
                  </button>
                  <button
                    onClick={() => {
                      const content = newCommentContent[selectedPostForComments];
                      if (content?.trim()) {
                        createCommentMutation.mutate({ postId: selectedPostForComments, content: content.trim() });
                      }
                    }}
                    disabled={!newCommentContent[selectedPostForComments]?.trim() || createCommentMutation.isPending}
                    className="flex-1 px-4 py-3 bg-linear-to-r from-orange-500 to-amber-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 text-sm"
                  >
                    {createCommentMutation.isPending && <Loader className="w-4 h-4 animate-spin" />}
                    {createCommentMutation.isPending ? 'Posting...' : 'Post Comment'}
                  </button>
                </div>
              </div>

              {/* Comments List */}
              <div className="px-8 py-6 space-y-4">
                {(commentsMap[selectedPostForComments] || []).length > 0 ? (
                  (commentsMap[selectedPostForComments] || []).map((comment) => (
                    <div key={comment._id} className="bg-linear-to-br from-orange-50/30 to-amber-50/30 rounded-xl p-5 border border-orange-100/50 hover:border-orange-200 hover:shadow-md transition-all duration-300">
                      {/* Comment Header */}
                      <div className="flex items-start justify-between mb-4">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-linear-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm shrink-0">
                            {comment.author?.username?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{comment.author?.username || 'Anonymous'}</p>
                            <p className="text-xs text-gray-500">{new Date(comment.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric', hour: '2-digit', minute: '2-digit' })}</p>
                          </div>
                        </div>
                      </div>

                      {/* Comment Content */}
                      <p className="text-gray-800 mb-4 leading-relaxed font-medium text-sm">{comment.content}</p>

                      {/* Vote Buttons */}
                      <div className="flex items-center gap-3">
                        <button
                          onClick={() => voteCommentMutation.mutate({ postId: selectedPostForComments, commentId: comment._id, voteType: 'upvote' })}
                          disabled={voteCommentMutation.isPending}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 font-semibold text-xs transition-all duration-200 disabled:opacity-50 hover:shadow-sm"
                        >
                          <ThumbsUp size={14} />
                          <span>{comment.upvotesCount}</span>
                        </button>
                        <button
                          onClick={() => voteCommentMutation.mutate({ postId: selectedPostForComments, commentId: comment._id, voteType: 'downvote' })}
                          disabled={voteCommentMutation.isPending}
                          className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-xs transition-all duration-200 disabled:opacity-50 hover:shadow-sm"
                        >
                          <ThumbsDown size={14} />
                          <span>{comment.downvotesCount}</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12">
                    <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                      <FileText className="w-8 h-8 text-orange-600" />
                    </div>
                    <p className="text-gray-600 font-semibold mb-1">No comments yet</p>
                    <p className="text-gray-500 text-sm">Be the first to share your thoughts!</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto">
        {/* Header Navigation */}
        <Link href="/dashboard/community" className="inline-flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold mb-8 transition-colors duration-200 group">
          <ArrowLeft size={18} className="group-hover:-translate-x-1 transition-transform duration-200" /> Back to Communities
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Community Info Card */}
            <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-8 mb-8 hover:shadow-md transition-shadow duration-300">
              <div className="flex items-start justify-between mb-8">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-3">
                    <h1 className="text-4xl font-bold text-gray-900">{community.name}</h1>
                    {community.isAdmin && (
                      <div className="bg-linear-to-r from-orange-100 to-amber-100 text-orange-700 px-3 py-1.5 rounded-full font-semibold text-xs tracking-wide">
                        ADMIN
                      </div>
                    )}
                  </div>
                  <div className="flex flex-wrap gap-6 text-gray-600 mt-4">
                    <div className="flex items-center gap-2">
                      <MapPin size={18} className="text-orange-500" />
                      <span className="font-medium">{community.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={18} className="text-orange-500" />
                      <span className="font-medium">{community.membersCount} Members</span>
                    </div>
                  </div>
                </div>
              </div>

              <div className="flex items-start gap-3 mb-6 pb-6 border-b border-gray-100">
                <FileText size={20} className="text-orange-500 mt-1 shrink-0" />
                <p className="text-gray-700 leading-relaxed text-sm font-medium">{community.description}</p>
              </div>

              <p className="text-xs text-gray-500 font-medium">
                Created on <span className="text-gray-700 font-semibold">{new Date(community.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
              </p>
            </div>

            {/* Create Post Button */}
            <button
              onClick={() => setShowPostModal(true)}
              className="w-full bg-white rounded-xl shadow-sm border border-gray-100 p-6 mb-8 hover:shadow-md hover:border-orange-200 transition-all duration-300 text-left group"
            >
              <p className="text-gray-400 font-medium group-hover:text-orange-500 transition-colors duration-200 text-sm">✨ What&apos;s on your mind? Share a recipe, tip, or discussion...</p>
            </button>

            {/* Posts Feed */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Community Feed</h2>
                <span className="text-sm font-semibold text-gray-500 bg-gray-100 px-3 py-1 rounded-full">{posts?.length || 0} Posts</span>
              </div>
              {postsLoading ? (
                <LoadingSpinner message="Loading posts..." />
              ) : posts && posts.length > 0 ? (
                posts.map((post) => (
                  <div key={post._id} className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 hover:shadow-md hover:border-orange-100/50 transition-all duration-300">
                    {/* Post Header */}
                    <div className="mb-5">
                      <div className="flex items-center justify-between mb-3">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-full bg-linear-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-sm">
                            {post.author?.username?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-900">{post.author?.username || 'Anonymous'}</p>
                            <p className="text-xs text-gray-500">{new Date(post.createdAt).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</p>
                          </div>
                        </div>
                        <span className="text-xs font-semibold bg-orange-100 text-orange-700 px-3 py-1 rounded-full uppercase tracking-wide">
                          {post.category === 'general' ? 'General' : post.category === 'tips' ? 'Tips' : 'Sharing'}
                        </span>
                      </div>
                    </div>

                    {/* Post Content */}
                    <p className="text-gray-800 mb-6 leading-relaxed text-sm font-medium line-clamp-4">{post.content}</p>

                    {/* Vote Section */}
                    <div className="flex items-center gap-3 pt-5 border-t border-gray-100">
                      <button
                        onClick={() => voteMutation.mutate({ postId: post._id, voteType: 'upvote' })}
                        disabled={voteMutation.isPending}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 font-semibold text-sm transition-all duration-200 disabled:opacity-50"
                      >
                        <ThumbsUp size={16} />
                        <span>{post.upvotesCount}</span>
                      </button>
                      <button
                        onClick={() => voteMutation.mutate({ postId: post._id, voteType: 'downvote' })}
                        disabled={voteMutation.isPending}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-semibold text-sm transition-all duration-200 disabled:opacity-50"
                      >
                        <ThumbsDown size={16} />
                        <span>{post.downvotesCount}</span>
                      </button>
                      <button
                        onClick={() => setSelectedPostForComments(post._id)}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 font-semibold text-sm transition-all duration-200 ml-auto hover:shadow-md"
                      >
                        <span>💬 {(commentsMap[post._id] || []).length}</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-16 px-6 bg-white rounded-xl border border-gray-100">
                  <div className="w-16 h-16 rounded-full bg-orange-100 flex items-center justify-center mx-auto mb-4">
                    <FileText className="w-8 h-8 text-orange-600" />
                  </div>
                  <p className="text-gray-600 text-lg font-semibold mb-2">No posts yet</p>
                  <p className="text-gray-500 text-sm mb-6">Be the first to share your thoughts with the community</p>
                  <button
                    onClick={() => setShowPostModal(true)}
                    className="inline-flex items-center gap-2 px-4 py-2 bg-linear-to-r from-orange-500 to-amber-600 text-white font-semibold rounded-lg hover:shadow-lg hover:shadow-orange-500/30 transition-all duration-200"
                  >
                    Create First Post
                  </button>
                </div>
              )}
            </div>
          </div>

          {/* Members Aside Panel (Admin Only) */}
          {community.isAdmin && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-xl shadow-sm border border-gray-100 p-6 sticky top-6 hover:shadow-md transition-shadow duration-300">
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-8 h-8 rounded-lg bg-linear-to-br from-orange-500 to-amber-500 flex items-center justify-center">
                    <Users size={18} className="text-white" />
                  </div>
                  <h3 className="text-lg font-semibold text-gray-900">Members</h3>
                  <span className="ml-auto text-sm font-semibold text-gray-500 bg-gray-100 px-2.5 py-1 rounded-full">{community.membersCount}</span>
                </div>

                {/* Members List */}
                <div className="space-y-2 max-h-[600px] overflow-y-auto">
                  {community.members && community.members.length > 0 ? (
                    community.members.map((member) => (
                      <div
                        key={member._id}
                        className="flex items-center justify-between gap-3 p-3 bg-gray-50 hover:bg-orange-50 rounded-lg transition-all duration-200 group border border-transparent hover:border-orange-200"
                      >
                        <div className="flex items-center gap-2 flex-1 min-w-0">
                          <div className="w-8 h-8 rounded-full bg-linear-to-br from-orange-500 to-amber-500 flex items-center justify-center text-white font-bold text-xs shrink-0">
                            {member.username?.charAt(0).toUpperCase() || 'U'}
                          </div>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-gray-900 truncate">
                              {member.username}
                              {String(member._id) === currentUserId && (
                                <span className="ml-2 text-xs font-normal text-orange-600">(You)</span>
                              )}
                            </p>
                            <p className="text-xs text-gray-500 truncate">{member.email}</p>
                          </div>
                        </div>
                        {String(member._id) !== currentUserId && (
                          <button
                            onClick={() => {
                              setMemberToRemove(member._id);
                              setShowRemoveConfirm(true);
                            }}
                            disabled={removeUserMutation.isPending}
                            title="Remove member"
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed shrink-0 opacity-0 group-hover:opacity-100"
                          >
                            <svg
                              className="w-4 h-4"
                              fill="none"
                              stroke="currentColor"
                              viewBox="0 0 24 24"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth={2}
                                d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"
                              />
                            </svg>
                          </button>
                        )}
                      </div>
                    ))
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      <p className="text-sm font-medium">No members yet</p>
                    </div>
                  )}
                </div>

                {/* Info Box */}
                <div className="mt-6 p-4 bg-orange-50 rounded-lg border border-orange-200">
                  <p className="text-xs text-gray-700 font-medium">
                    <span className="text-orange-700 font-semibold">Pro Tip:</span> Hover over members to reveal the remove option. Admins only.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default CommunityDetailsPage;