import React, { useContext, useState, useEffect, useRef } from 'react'
import { ShopContext } from '../context/ShopContext'
import axios from 'axios'
import { toast } from 'react-toastify'
import {
  Star, Upload, X, Image, Video, Link2, MessageCircle,
  CheckCircle, Lock, ChevronDown, ChevronUp, Send,
  Play, ExternalLink, ShieldCheck, Loader2, Camera,
  HelpCircle, MessageSquare, BadgeCheck, Zap
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// ── Platform detection for social / video links ────────────────────────────
const detectPlatform = (url = '') => {
  if (!url) return null;
  const u = url.toLowerCase();
  if (u.includes('instagram.com')) return { name: 'Instagram', color: 'from-purple-500 to-pink-500', emoji: '📸' };
  if (u.includes('youtube.com') || u.includes('youtu.be')) return { name: 'YouTube', color: 'from-red-500 to-red-700', emoji: '▶️' };
  if (u.includes('twitter.com') || u.includes('x.com')) return { name: 'X / Twitter', color: 'from-gray-800 to-black', emoji: '𝕏' };
  if (u.includes('facebook.com') || u.includes('fb.com')) return { name: 'Facebook', color: 'from-blue-600 to-blue-800', emoji: '👤' };
  if (u.includes('tiktok.com')) return { name: 'TikTok', color: 'from-gray-900 to-black', emoji: '🎵' };
  if (u.includes('pinterest.com')) return { name: 'Pinterest', color: 'from-red-600 to-red-800', emoji: '📌' };
  return { name: 'Link', color: 'from-gray-500 to-gray-700', emoji: '🔗' };
};

// ── Star rating ────────────────────────────────────────────────────────────
const StarRating = ({ value, onChange, readonly = false, size = 'md' }) => {
  const [hovered, setHovered] = useState(0);
  const sz = size === 'lg' ? 'w-8 h-8' : size === 'sm' ? 'w-4 h-4' : 'w-6 h-6';
  return (
    <div className="flex gap-1">
      {[1, 2, 3, 4, 5].map(s => (
        <button
          key={s}
          type="button"
          disabled={readonly}
          onClick={() => onChange?.(s)}
          onMouseEnter={() => !readonly && setHovered(s)}
          onMouseLeave={() => !readonly && setHovered(0)}
          className={`transition-transform ${!readonly ? 'cursor-pointer hover:scale-110' : 'cursor-default'}`}
        >
          <Star
            className={`${sz} transition-colors ${
              s <= (hovered || value) ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'
            }`}
          />
        </button>
      ))}
    </div>
  );
};

// ── Individual review card ─────────────────────────────────────────────────
const ReviewCard = ({ rev, index }) => {
  const [lightbox, setLightbox] = useState(null);
  const images = (rev.media || []).filter(m => m.type === 'image');
  const video = (rev.media || []).find(m => m.type === 'video');
  const videoLink = (rev.media || []).find(m => m.type === 'videoLink');
  const platform = detectPlatform(rev.socialLink) || detectPlatform(videoLink?.url);

  const initials = (rev.name || 'U').split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase();
  const avatarColors = ['from-orange-400 to-red-500', 'from-blue-400 to-indigo-500', 'from-emerald-400 to-teal-500', 'from-purple-400 to-pink-500', 'from-amber-400 to-orange-500'];
  const avatarColor = avatarColors[index % avatarColors.length];

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.05 }}
      className="bg-white border border-gray-100 rounded-2xl p-5 shadow-sm hover:shadow-md transition-shadow"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${avatarColor} flex items-center justify-center text-white font-bold text-sm flex-shrink-0`}>
          {initials}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-gray-900 text-sm">{rev.name}</span>
            {rev.verified && (
              <span className="inline-flex items-center gap-1 text-[10px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                <BadgeCheck className="w-3 h-3" /> Verified Purchase
              </span>
            )}
          </div>
          <div className="flex items-center gap-2 mt-0.5">
            <StarRating value={rev.rating} readonly size="sm" />
            <span className="text-xs text-gray-400">{new Date(rev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}</span>
          </div>
        </div>
      </div>

      {/* Comment */}
      <p className="text-gray-700 text-sm leading-relaxed mb-3">{rev.comment}</p>

      {/* Image grid */}
      {images.length > 0 && (
        <div className={`grid gap-2 mb-3 ${images.length === 1 ? 'grid-cols-1' : images.length === 2 ? 'grid-cols-2' : 'grid-cols-3'}`}>
          {images.map((img, i) => (
            <div
              key={i}
              onClick={() => setLightbox(img.url)}
              className="relative aspect-square rounded-xl overflow-hidden cursor-pointer group"
            >
              <img src={img.url} alt="" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300" />
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors flex items-center justify-center">
                <Camera className="w-5 h-5 text-white opacity-0 group-hover:opacity-100 transition-opacity" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Uploaded video */}
      {video && (
        <div className="mb-3 rounded-xl overflow-hidden bg-black">
          <video controls className="w-full max-h-48 object-contain" src={video.url} />
        </div>
      )}

      {/* Video or social link chip */}
      {(videoLink || rev.socialLink) && platform && (
        <a
          href={videoLink?.url || rev.socialLink}
          target="_blank"
          rel="noopener noreferrer"
          className={`inline-flex items-center gap-2 bg-gradient-to-r ${platform.color} text-white text-xs font-semibold px-3 py-1.5 rounded-full hover:opacity-90 transition-opacity`}
        >
          <span>{platform.emoji}</span>
          <span>View on {platform.name}</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      )}

      {/* Lightbox */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[3000] bg-black/90 flex items-center justify-center p-4"
          >
            <button onClick={() => setLightbox(null)} className="absolute top-4 right-4 text-white hover:text-gray-300">
              <X className="w-8 h-8" />
            </button>
            <img src={lightbox} alt="" className="max-w-full max-h-[90vh] object-contain rounded-lg" onClick={e => e.stopPropagation()} />
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

// ── Q&A Thread item ────────────────────────────────────────────────────────
const QuestionThread = ({ q, idx, productId, userData, token, backendUrl, hasPurchased, onRefresh }) => {
  const [showAnswerForm, setShowAnswerForm] = useState(false);
  const [answerText, setAnswerText] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const isAdmin = userData?.role === 'admin';
  const canAnswer = token && (isAdmin || hasPurchased);

  const handleAnswer = async (e) => {
    e.preventDefault();
    if (!answerText.trim()) return;
    setSubmitting(true);
    try {
      const res = await axios.post(backendUrl + '/api/product/add-answer', {
        productId,
        questionId: q._id || q.date,
        answer: answerText,
        name: userData?.name || 'Anonymous',
      }, { headers: { token } });
      if (res.data.success) {
        toast.success('Answer posted!');
        setAnswerText('');
        setShowAnswerForm(false);
        onRefresh();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: idx * 0.05 }}
      className="border border-gray-100 rounded-2xl overflow-hidden bg-white shadow-sm"
    >
      {/* Question */}
      <div className="p-4 bg-gradient-to-r from-blue-50 to-indigo-50">
        <div className="flex items-start gap-3">
          <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0 mt-0.5">
            <HelpCircle className="w-4 h-4 text-blue-500" />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-semibold text-blue-700">{q.name}</span>
              <span className="text-[10px] text-blue-400">{new Date(q.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
            </div>
            <p className="text-sm text-gray-800 font-medium">{q.question}</p>
          </div>
        </div>
      </div>

      {/* Answers */}
      {q.answers?.length > 0 && (
        <div className="divide-y divide-gray-50">
          {q.answers.map((ans, ai) => (
            <div key={ai} className="p-4 pl-12 bg-white">
              <div className="flex items-start gap-3">
                <div className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${ans.isAdmin ? 'bg-orange-100' : 'bg-emerald-100'}`}>
                  {ans.isAdmin ? (
                    <ShieldCheck className="w-3.5 h-3.5 text-orange-600" />
                  ) : (
                    <BadgeCheck className="w-3.5 h-3.5 text-emerald-600" />
                  )}
                </div>
                <div className="flex-1">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-gray-800">{ans.name}</span>
                    {ans.isAdmin && (
                      <span className="text-[10px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-bold">Seller</span>
                    )}
                    {!ans.isAdmin && ans.isVerifiedBuyer && (
                      <span className="text-[10px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">Verified Buyer</span>
                    )}
                    <span className="text-[10px] text-gray-400">{new Date(ans.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                  </div>
                  <p className="text-sm text-gray-700">{ans.answer}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Answer form */}
      {canAnswer && (
        <div className="p-3 bg-gray-50 border-t border-gray-100">
          {!showAnswerForm ? (
            <button
              onClick={() => setShowAnswerForm(true)}
              className="flex items-center gap-1.5 text-xs text-orange-600 hover:text-orange-700 font-semibold transition-colors"
            >
              <MessageSquare className="w-3.5 h-3.5" />
              {isAdmin ? 'Answer as Seller' : 'Answer as Verified Buyer'}
            </button>
          ) : (
            <form onSubmit={handleAnswer} className="flex gap-2">
              <input
                value={answerText}
                onChange={e => setAnswerText(e.target.value)}
                placeholder="Write your answer..."
                className="flex-1 text-sm border border-gray-200 rounded-lg px-3 py-2 outline-none focus:border-orange-400 bg-white"
                autoFocus
              />
              <button type="submit" disabled={submitting} className="p-2 bg-orange-500 text-white rounded-lg hover:bg-orange-600 transition-colors disabled:opacity-60">
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
              </button>
              <button type="button" onClick={() => setShowAnswerForm(false)} className="p-2 text-gray-400 hover:text-gray-600">
                <X className="w-4 h-4" />
              </button>
            </form>
          )}
        </div>
      )}
    </motion.div>
  );
};

// ── Main ReviewSection ─────────────────────────────────────────────────────
const ReviewSection = ({ productId, reviews = [], questions = [], onReviewAdded }) => {
  const { token, backendUrl, userData } = useContext(ShopContext);
  const [activeTab, setActiveTab] = useState('reviews');

  // ── Purchase check state ───────────────────────────────────────────────
  const [hasPurchased, setHasPurchased] = useState(false);
  const [purchaseChecked, setPurchaseChecked] = useState(false);

  useEffect(() => {
    if (!token) { setPurchaseChecked(true); return; }
    axios.post(backendUrl + '/api/product/check-purchase', { productId }, { headers: { token } })
      .then(res => { if (res.data.success) setHasPurchased(res.data.purchased); })
      .catch(() => {})
      .finally(() => setPurchaseChecked(true));
  }, [token, productId]);

  // ── Review form state ──────────────────────────────────────────────────
  const [rating, setRating] = useState(5);
  const [comment, setComment] = useState('');
  const [socialLink, setSocialLink] = useState('');
  const [videoLink, setVideoLink] = useState('');
  const [mediaFiles, setMediaFiles] = useState([]);    // image files
  const [videoFile, setVideoFile] = useState(null);    // video file
  const [mediaPreviews, setMediaPreviews] = useState([]);
  const [videoPreview, setVideoPreview] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const imageInputRef = useRef();
  const videoInputRef = useRef();

  // Already reviewed?
  const alreadyReviewed = reviews.some(r => r.userId === userData?._id || r.userId === userData?.id);

  const handleImageSelect = (e) => {
    const files = Array.from(e.target.files || []);
    if (mediaFiles.length + files.length > 5) {
      toast.error('Max 5 photos allowed'); return;
    }
    const newFiles = [...mediaFiles, ...files].slice(0, 5);
    setMediaFiles(newFiles);
    const urls = newFiles.map(f => URL.createObjectURL(f));
    setMediaPreviews(urls);
  };

  const handleVideoSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 50 * 1024 * 1024) { toast.error('Video must be under 50 MB'); return; }
    setVideoFile(file);
    setVideoPreview(URL.createObjectURL(file));
    toast.info('Note: video will be trimmed to 15 seconds on upload');
  };

  const removeImage = (idx) => {
    const nf = mediaFiles.filter((_, i) => i !== idx);
    const np = mediaPreviews.filter((_, i) => i !== idx);
    setMediaFiles(nf); setMediaPreviews(np);
  };

  const handleSubmitReview = async (e) => {
    e.preventDefault();
    if (!token) { toast.error('Please login'); return; }
    if (!comment.trim()) { toast.error('Please write a comment'); return; }
    setSubmitting(true);
    try {
      const formData = new FormData();
      formData.append('productId', productId);
      formData.append('rating', rating);
      formData.append('comment', comment);
      formData.append('name', userData?.name || 'User');
      formData.append('socialLink', socialLink);
      formData.append('videoLink', videoLink);
      mediaFiles.forEach(f => formData.append('reviewMedia', f));
      if (videoFile) formData.append('reviewVideo', videoFile);

      const res = await axios.post(backendUrl + '/api/product/add-review', formData, {
        headers: { token, 'Content-Type': 'multipart/form-data' }
      });
      if (res.data.success) {
        toast.success(res.data.message);
        setComment(''); setSocialLink(''); setVideoLink('');
        setMediaFiles([]); setMediaPreviews([]); setVideoFile(null); setVideoPreview(null);
        setRating(5);
        onReviewAdded?.();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmitting(false);
    }
  };

  // ── Q&A state ──────────────────────────────────────────────────────────
  const [questionText, setQuestionText] = useState('');
  const [submittingQ, setSubmittingQ] = useState(false);

  const handleSubmitQuestion = async (e) => {
    e.preventDefault();
    if (!token) { toast.error('Please login to ask a question'); return; }
    if (!questionText.trim()) return;
    setSubmittingQ(true);
    try {
      const res = await axios.post(backendUrl + '/api/product/add-question', {
        productId,
        question: questionText,
        name: userData?.name || 'User',
      }, { headers: { token } });
      if (res.data.success) {
        toast.success(res.data.message);
        setQuestionText('');
        onReviewAdded?.();
      } else {
        toast.error(res.data.message);
      }
    } catch (err) {
      toast.error(err.message);
    } finally {
      setSubmittingQ(false);
    }
  };

  const socialPlatform = detectPlatform(socialLink);

  return (
    <div className="mt-20">
      {/* ── Section Header ─────────────────────────────────────── */}
      <div className="flex items-center gap-4 mb-8">
        <h2 className="text-2xl font-semibold">Reviews & Q&A</h2>
        <span className="bg-orange-50 border border-orange-100 text-orange-600 px-3 py-1 text-sm rounded-full font-semibold">{reviews.length} Reviews</span>
        <span className="bg-blue-50 border border-blue-100 text-blue-600 px-3 py-1 text-sm rounded-full font-semibold">{questions.length} Questions</span>
      </div>

      {/* ── Tabs ───────────────────────────────────────────────── */}
      <div className="flex gap-1 mb-6 bg-gray-100 rounded-xl p-1 w-fit">
        {[
          { id: 'reviews', label: 'Reviews', icon: Star, count: reviews.length },
          { id: 'qa', label: 'Q&A', icon: HelpCircle, count: questions.length },
        ].map(tab => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-sm font-semibold transition-all ${
              activeTab === tab.id
                ? 'bg-white shadow-sm text-gray-900'
                : 'text-gray-500 hover:text-gray-700'
            }`}
          >
            <tab.icon className="w-4 h-4" />
            {tab.label}
            <span className={`text-xs px-1.5 py-0.5 rounded-full ${activeTab === tab.id ? 'bg-orange-100 text-orange-600' : 'bg-gray-200 text-gray-500'}`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      <AnimatePresence mode="wait">
        {/* ══════════════ REVIEWS TAB ══════════════ */}
        {activeTab === 'reviews' && (
          <motion.div
            key="reviews"
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 10 }}
            className="grid grid-cols-1 xl:grid-cols-[1fr_420px] gap-8"
          >
            {/* Left: Review list */}
            <div className="flex flex-col gap-4 max-h-[700px] overflow-y-auto pr-2 custom-scroll">
              {reviews.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl">
                  <Star className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 font-medium">No reviews yet</p>
                  <p className="text-gray-300 text-sm">Be the first to share your experience!</p>
                </div>
              ) : (
                reviews.map((rev, i) => <ReviewCard key={i} rev={rev} index={i} />)
              )}
            </div>

            {/* Right: Write review form */}
            <div>
              {!token ? (
                <div className="bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl p-8 text-center">
                  <Lock className="w-10 h-10 text-gray-300 mx-auto mb-3" />
                  <p className="font-semibold text-gray-700 mb-1">Login to write a review</p>
                  <p className="text-sm text-gray-400">Share your experience with this product</p>
                </div>
              ) : !purchaseChecked ? (
                <div className="bg-gray-50 rounded-2xl p-8 flex items-center justify-center">
                  <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
                </div>
              ) : alreadyReviewed ? (
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-6 text-center">
                  <CheckCircle className="w-10 h-10 text-emerald-500 mx-auto mb-3" />
                  <p className="font-semibold text-emerald-700">You've already reviewed this product</p>
                  <p className="text-sm text-emerald-500 mt-1">Thank you for your feedback!</p>
                </div>
              ) : !hasPurchased ? (
                <div className="bg-orange-50 border-2 border-dashed border-orange-200 rounded-2xl p-8 text-center">
                  <Lock className="w-10 h-10 text-orange-300 mx-auto mb-3" />
                  <p className="font-semibold text-gray-800 mb-1">Verified Buyers Only</p>
                  <p className="text-sm text-gray-500">Purchase and receive this product to leave a review</p>
                  <div className="mt-4 inline-flex items-center gap-2 text-xs text-orange-600 bg-orange-100 px-3 py-1.5 rounded-full font-semibold">
                    <BadgeCheck className="w-3.5 h-3.5" /> Your review will get a Verified Purchase badge
                  </div>
                </div>
              ) : (
                /* ── Review Form ── */
                <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                  <div className="bg-gradient-to-r from-orange-500 to-amber-500 px-5 py-4">
                    <div className="flex items-center gap-2">
                      <BadgeCheck className="w-5 h-5 text-white" />
                      <p className="text-white font-semibold text-sm">Write a Verified Review</p>
                    </div>
                    <p className="text-white/70 text-xs mt-0.5">Your review will appear with a Verified Purchase badge</p>
                  </div>

                  <form onSubmit={handleSubmitReview} className="p-5 flex flex-col gap-5">
                    {/* Star rating */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Your Rating</p>
                      <StarRating value={rating} onChange={setRating} size="lg" />
                      <p className="text-xs text-gray-400 mt-1">
                        {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][rating]}
                      </p>
                    </div>

                    {/* Comment */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">Your Review</p>
                      <textarea
                        value={comment}
                        onChange={e => setComment(e.target.value)}
                        rows={4}
                        placeholder="Share your experience — quality, fit, delivery..."
                        required
                        className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-orange-400 resize-none transition-colors"
                      />
                    </div>

                    {/* Photo upload */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Add Photos <span className="text-gray-300 font-normal">(up to 5)</span>
                      </p>
                      {mediaPreviews.length > 0 && (
                        <div className="grid grid-cols-4 gap-2 mb-2">
                          {mediaPreviews.map((url, i) => (
                            <div key={i} className="relative aspect-square rounded-lg overflow-hidden group">
                              <img src={url} alt="" className="w-full h-full object-cover" />
                              <button
                                type="button"
                                onClick={() => removeImage(i)}
                                className="absolute top-1 right-1 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                              >
                                <X className="w-3 h-3" />
                              </button>
                            </div>
                          ))}
                          {mediaPreviews.length < 5 && (
                            <button
                              type="button"
                              onClick={() => imageInputRef.current?.click()}
                              className="aspect-square rounded-lg border-2 border-dashed border-gray-200 flex items-center justify-center hover:border-orange-300 transition-colors text-gray-300 hover:text-orange-400"
                            >
                              <Image className="w-5 h-5" />
                            </button>
                          )}
                        </div>
                      )}
                      {mediaPreviews.length === 0 && (
                        <button
                          type="button"
                          onClick={() => imageInputRef.current?.click()}
                          className="w-full border-2 border-dashed border-gray-200 hover:border-orange-300 rounded-xl py-4 flex flex-col items-center gap-2 transition-colors group"
                        >
                          <Camera className="w-7 h-7 text-gray-300 group-hover:text-orange-400 transition-colors" />
                          <span className="text-sm text-gray-400 group-hover:text-orange-500">Click to add photos</span>
                        </button>
                      )}
                      <input
                        ref={imageInputRef}
                        type="file"
                        accept="image/*"
                        multiple
                        className="hidden"
                        onChange={handleImageSelect}
                      />
                    </div>

                    {/* Video upload */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Add Short Video <span className="text-gray-300 font-normal">(≤ 15 sec · max 50 MB)</span>
                      </p>
                      {videoPreview ? (
                        <div className="relative rounded-xl overflow-hidden bg-black">
                          <video src={videoPreview} controls className="w-full max-h-32 object-contain" />
                          <button
                            type="button"
                            onClick={() => { setVideoFile(null); setVideoPreview(null); }}
                            className="absolute top-2 right-2 w-6 h-6 bg-red-500 text-white rounded-full flex items-center justify-center"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <button
                          type="button"
                          onClick={() => videoInputRef.current?.click()}
                          className="w-full border-2 border-dashed border-gray-200 hover:border-orange-300 rounded-xl py-3 flex items-center justify-center gap-2 transition-colors group"
                        >
                          <Play className="w-5 h-5 text-gray-300 group-hover:text-orange-400 transition-colors" />
                          <span className="text-sm text-gray-400 group-hover:text-orange-500">Upload a video clip</span>
                        </button>
                      )}
                      <input
                        ref={videoInputRef}
                        type="file"
                        accept="video/*"
                        className="hidden"
                        onChange={handleVideoSelect}
                      />
                    </div>

                    {/* Video link (YouTube/Instagram/etc.) */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Or paste a Reel / Short link
                      </p>
                      <div className="relative">
                        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="url"
                          value={videoLink}
                          onChange={e => setVideoLink(e.target.value)}
                          placeholder="YouTube, Instagram, TikTok link..."
                          className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
                        />
                      </div>
                    </div>

                    {/* Social media link */}
                    <div>
                      <p className="text-xs font-semibold text-gray-500 uppercase tracking-wider mb-2">
                        Share a post from your social profile
                      </p>
                      <div className="relative">
                        <Link2 className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                        <input
                          type="url"
                          value={socialLink}
                          onChange={e => setSocialLink(e.target.value)}
                          placeholder="Instagram, Facebook, Twitter post link..."
                          className="w-full border border-gray-200 rounded-xl pl-9 pr-3 py-2.5 text-sm outline-none focus:border-orange-400 transition-colors"
                        />
                      </div>
                      {socialPlatform && socialLink && (
                        <div className={`mt-2 inline-flex items-center gap-1.5 bg-gradient-to-r ${socialPlatform.color} text-white text-xs px-3 py-1 rounded-full font-semibold`}>
                          {socialPlatform.emoji} Will show as {socialPlatform.name} link
                        </div>
                      )}
                    </div>

                    {/* Submit */}
                    <button
                      type="submit"
                      disabled={submitting}
                      className="w-full bg-gradient-to-r from-orange-500 to-amber-500 hover:from-orange-600 hover:to-amber-600 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-orange-100 disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {submitting ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Uploading & Submitting...</>
                      ) : (
                        <><Star className="w-4 h-4 fill-white" /> Submit Review</>
                      )}
                    </button>
                  </form>
                </div>
              )}
            </div>
          </motion.div>
        )}

        {/* ══════════════ Q&A TAB ══════════════ */}
        {activeTab === 'qa' && (
          <motion.div
            key="qa"
            initial={{ opacity: 0, x: 10 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -10 }}
            className="grid grid-cols-1 xl:grid-cols-[1fr_380px] gap-8"
          >
            {/* Left: Questions list */}
            <div className="flex flex-col gap-4 max-h-[700px] overflow-y-auto pr-2 custom-scroll">
              {questions.length === 0 ? (
                <div className="text-center py-16 bg-gray-50 rounded-2xl">
                  <HelpCircle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                  <p className="text-gray-400 font-medium">No questions yet</p>
                  <p className="text-gray-300 text-sm">Be the first to ask something!</p>
                </div>
              ) : (
                questions.map((q, i) => (
                  <QuestionThread
                    key={i}
                    q={q}
                    idx={i}
                    productId={productId}
                    userData={userData}
                    token={token}
                    backendUrl={backendUrl}
                    hasPurchased={hasPurchased}
                    onRefresh={onReviewAdded}
                  />
                ))
              )}
            </div>

            {/* Right: Ask a question */}
            <div>
              <div className="bg-white border border-gray-100 rounded-2xl shadow-sm overflow-hidden">
                <div className="bg-gradient-to-r from-blue-500 to-indigo-600 px-5 py-4">
                  <div className="flex items-center gap-2">
                    <HelpCircle className="w-5 h-5 text-white" />
                    <p className="text-white font-semibold text-sm">Ask a Question</p>
                  </div>
                  <p className="text-white/70 text-xs mt-0.5">Sellers & verified buyers will answer</p>
                </div>

                {!token ? (
                  <div className="p-6 text-center">
                    <Lock className="w-8 h-8 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm text-gray-500">Login to ask a question</p>
                  </div>
                ) : (
                  <form onSubmit={handleSubmitQuestion} className="p-5 flex flex-col gap-4">
                    <textarea
                      value={questionText}
                      onChange={e => setQuestionText(e.target.value)}
                      rows={4}
                      placeholder="Ask about size, material, delivery, or anything else..."
                      className="w-full border border-gray-200 rounded-xl px-4 py-3 text-sm outline-none focus:border-blue-400 resize-none transition-colors"
                      required
                    />
                    <button
                      type="submit"
                      disabled={submittingQ}
                      className="w-full bg-gradient-to-r from-blue-500 to-indigo-600 hover:from-blue-600 hover:to-indigo-700 text-white font-semibold py-3 rounded-xl transition-all shadow-lg shadow-blue-100 disabled:opacity-60 flex items-center justify-center gap-2"
                    >
                      {submittingQ ? (
                        <><Loader2 className="w-4 h-4 animate-spin" /> Posting...</>
                      ) : (
                        <><Send className="w-4 h-4" /> Post Question</>
                      )}
                    </button>
                    <p className="text-xs text-gray-400 text-center">
                      Questions are public. Don't include personal info.
                    </p>
                  </form>
                )}
              </div>

              {/* Who can answer */}
              <div className="mt-4 bg-gradient-to-br from-blue-50 to-indigo-50 border border-blue-100 rounded-xl p-4">
                <p className="text-xs font-bold text-blue-800 mb-2">Who answers questions?</p>
                <div className="flex flex-col gap-2">
                  <div className="flex items-center gap-2 text-xs text-blue-700">
                    <ShieldCheck className="w-4 h-4 text-orange-500" />
                    <span><strong>Sellers</strong> — official product sellers</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-blue-700">
                    <BadgeCheck className="w-4 h-4 text-emerald-500" />
                    <span><strong>Verified Buyers</strong> — customers who bought this product</span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default ReviewSection;
