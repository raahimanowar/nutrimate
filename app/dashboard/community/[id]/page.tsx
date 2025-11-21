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
  });

  // Fetch community posts
  const { data: posts = [], isLoading: postsLoading } = useQuery({
    queryKey: ['communityPosts', communityId],
    queryFn: () => getCommunityPosts(communityId),
    enabled: !!communityId,
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
    <div className="min-h-screen bg-linear-to-br from-orange-50 via-white to-blue-50 p-6">
      <Toaster position="top-right" />
      
      {/* Remove Member Confirmation Modal */}
      {showRemoveConfirm && memberToRemove && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-sm w-full p-6">
            <h3 className="text-xl font-bold text-gray-900 mb-3">Remove Member?</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to remove this member from the community? This action cannot be undone.
            </p>
            <div className="flex gap-3">
              <button
                onClick={() => {
                  setShowRemoveConfirm(false);
                  setMemberToRemove(null);
                }}
                className="flex-1 px-4 py-2 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => removeUserMutation.mutate()}
                disabled={removeUserMutation.isPending}
                className="flex-1 px-4 py-2 bg-linear-to-r from-red-500 to-red-600 text-white font-semibold rounded-lg hover:shadow-lg transition disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
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
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full p-8">
            <div className="flex items-center justify-between mb-6">
              <h3 className="text-2xl font-bold text-gray-900">Create a Post</h3>
              <button
                onClick={() => {
                  setShowPostModal(false);
                  setNewPostContent('');
                  setNewPostCategory('general');
                }}
                className="text-gray-400 hover:text-gray-600 text-2xl font-semibold"
              >
                ×
              </button>
            </div>

            <textarea
              value={newPostContent}
              onChange={(e) => setNewPostContent(e.target.value)}
              placeholder="What&apos;s on your mind? Share a recipe, tip, or discussion..."
              className="w-full p-4 border-2 border-gray-200 rounded-lg resize-none focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 mb-4"
              rows={6}
            />

            {/* Category Selector */}
            <div className="mb-4">
              <label className="block text-sm font-semibold text-gray-700 mb-2">Category</label>
              <select
                value={newPostCategory}
                onChange={(e) => setNewPostCategory(e.target.value)}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
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
                className="flex-1 px-4 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-lg hover:bg-gray-50 transition"
              >
                Cancel
              </button>
              <button
                onClick={() => {
                  postMutation.mutate();
                }}
                disabled={!newPostContent.trim() || postMutation.isPending}
                className="flex-1 px-4 py-3 bg-linear-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-lg hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2"
              >
                {postMutation.isPending && <Loader className="w-4 h-4 animate-spin" />}
                {postMutation.isPending ? 'Posting...' : 'Post'}
              </button>
            </div>
          </div>
        </div>
      )}
      
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <Link href="/dashboard/community" className="flex items-center gap-2 text-orange-600 hover:text-orange-700 font-semibold mb-6 w-fit">
          <ArrowLeft size={20} /> Back to Communities
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-3">
            {/* Community Info Card */}
            <div className="bg-white rounded-2xl shadow-lg p-8 mb-8 border-2 border-orange-100">
              <div className="flex items-start justify-between mb-6">
                <div className="flex-1">
                  <h1 className="text-4xl font-black text-gray-900 mb-2">{community.name}</h1>
                  <div className="flex flex-wrap gap-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <MapPin size={18} className="text-orange-500" />
                      <span>{community.location}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users size={18} className="text-orange-500" />
                      <span>{community.membersCount} members</span>
                    </div>
                  </div>
                </div>
                {community.isAdmin && (
                  <div className="bg-orange-100 text-orange-700 px-4 py-2 rounded-lg font-semibold">
                    Admin
                  </div>
                )}
              </div>

              <div className="flex items-start gap-2 mb-6">
                <FileText size={20} className="text-orange-500 mt-1 shrink-0" />
                <p className="text-gray-700 leading-relaxed">{community.description}</p>
              </div>

              <div className="pt-4 border-t-2 border-gray-200">
                <p className="text-sm text-gray-500">Created on {new Date(community.createdAt).toLocaleDateString()}</p>
              </div>
            </div>

            {/* Create Post Button */}
            <button
              onClick={() => setShowPostModal(true)}
              className="w-full bg-white rounded-2xl shadow-lg p-6 mb-8 border-2 border-blue-100 hover:shadow-xl transition text-left"
            >
              <p className="text-gray-400 font-medium">What&apos;s on your mind? Share a recipe, tip, or discussion...</p>
            </button>

            {/* Posts Feed */}
            <div className="space-y-6">
              <h2 className="text-2xl font-bold text-gray-900">Community Feed</h2>
              {postsLoading ? (
                <LoadingSpinner message="Loading posts..." />
              ) : posts && posts.length > 0 ? (
                posts.map((post) => (
                  <div key={post._id} className="bg-white rounded-2xl shadow-lg p-6 border-2 border-gray-100 hover:shadow-xl transition">
                    {/* Post Header */}
                    <div className="mb-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="text-sm font-semibold text-gray-700">{post.author?.username || 'Anonymous'}</p>
                        <span className="text-xs bg-blue-100 text-blue-700 px-3 py-1 rounded-full font-medium">
                          {post.category === 'general' ? 'General' : post.category === 'tips' ? 'Tips' : 'Food Sharing'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-500">
                        {new Date(post.createdAt).toLocaleDateString()} at {new Date(post.createdAt).toLocaleTimeString()}
                      </p>
                    </div>

                    {/* Post Content */}
                    <p className="text-gray-800 mb-6 leading-relaxed">{post.content}</p>

                    {/* Vote Section */}
                    <div className="flex items-center gap-4 pt-4 border-t border-gray-200">
                      <button
                        onClick={() => voteMutation.mutate({ postId: post._id, voteType: 'upvote' })}
                        disabled={voteMutation.isPending}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-green-50 hover:bg-green-100 text-green-600 font-semibold transition disabled:opacity-50"
                      >
                        <ThumbsUp size={18} />
                        <span>{post.upvotesCount}</span>
                      </button>
                      <button
                        onClick={() => voteMutation.mutate({ postId: post._id, voteType: 'downvote' })}
                        disabled={voteMutation.isPending}
                        className="flex items-center gap-2 px-4 py-2 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 font-semibold transition disabled:opacity-50"
                      >
                        <ThumbsDown size={18} />
                        <span>{post.downvotesCount}</span>
                      </button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="text-center py-12 text-gray-500">
                  <p>No posts yet. Be the first to share!</p>
                </div>
              )}
            </div>
          </div>

          {/* Members Aside Panel (Admin Only) */}
          {community.isAdmin && (
            <div className="lg:col-span-1">
              <div className="bg-white rounded-2xl shadow-lg p-6 border-2 border-purple-100 sticky top-6">
                <div className="flex items-center gap-2 mb-6">
                  <Users size={22} className="text-purple-600" />
                  <h3 className="text-xl font-bold text-gray-900">Members ({community.membersCount})</h3>
                </div>

                {/* Members List */}
                <div className="space-y-3 max-h-[600px] overflow-y-auto">
                  {community.members && community.members.length > 0 ? (
                    community.members.map((member) => (
                      <div
                        key={member._id}
                        className="flex items-center justify-between gap-3 p-3 bg-linear-to-r from-purple-50 to-blue-50 rounded-lg hover:shadow-md transition"
                      >
                        <div className="flex-1 min-w-0">
                          <p className="text-sm font-semibold text-gray-900 truncate">
                            {member.username}
                            {String(member._id) === currentUserId && (
                              <span className="ml-2 text-xs font-normal text-purple-600">(You)</span>
                            )}
                          </p>
                          <p className="text-xs text-gray-500 truncate">{member.email}</p>
                        </div>
                        {String(member._id) !== currentUserId && (
                          <button
                            onClick={() => {
                              setMemberToRemove(member._id);
                              setShowRemoveConfirm(true);
                            }}
                            disabled={removeUserMutation.isPending}
                            title="Remove member"
                            className="p-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200 transition disabled:opacity-50 disabled:cursor-not-allowed shrink-0"
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
                    <div className="text-center py-6 text-gray-500">
                      <p className="text-sm">No members yet</p>
                    </div>
                  )}
                </div>

                {/* Info Box */}
                <div className="mt-6 p-4 bg-purple-50 rounded-lg border border-purple-200">
                  <p className="text-xs text-gray-600">
                    <span className="font-semibold text-purple-700">Tip:</span> Click the trash icon to remove members from the community.
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