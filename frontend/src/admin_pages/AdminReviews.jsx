import React, { useContext, useEffect, useState } from 'react'
import axios from 'axios'
import { ShopContext } from '../context/ShopContext'
import { toast } from 'react-toastify'
import { 
  Trash2, Star, MessageSquare, HelpCircle, 
  Play, ExternalLink, Image, Video, ShieldCheck, 
  BadgeCheck, ChevronDown, Calendar, Search, Filter, Loader2, X, Camera
} from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

// Platform detection helper
const detectPlatform = (url = '') => {
  if (!url) return null;
  const u = url.toLowerCase();
  if (u.includes('instagram.com')) return { name: 'Instagram', color: 'from-purple-500 to-pink-500', emoji: '📸' };
  if (u.includes('youtube.com') || u.includes('youtu.be')) return { name: 'YouTube', color: 'from-red-500 to-red-700', emoji: '▶️' };
  if (u.includes('twitter.com') || u.includes('x.com')) return { name: 'X / Twitter', color: 'from-gray-800 to-black', emoji: '𝕏' };
  if (u.includes('facebook.com') || u.includes('fb.com')) return { name: 'Facebook', color: 'from-blue-600 to-blue-800', emoji: '👤' };
  if (u.includes('tiktok.com')) return { name: 'TikTok', color: 'from-gray-900 to-black', emoji: '🎵' };
  return { name: 'Link', color: 'from-gray-500 to-gray-700', emoji: '🔗' };
};

const AdminReviews = () => {
  const { backendUrl, token, currency } = useContext(ShopContext);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState('all');
  const [activeTab, setActiveTab] = useState('reviews'); // 'reviews' or 'questions'
  const [searchTerm, setSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [lightbox, setLightbox] = useState(null);

  // Fetch all products to aggregate reviews and questions
  const fetchProducts = async () => {
    try {
      setLoading(true);
      const response = await axios.get(backendUrl + '/api/product/list');
      if (response.data.success) {
        setProducts(response.data.products);
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      console.log(error);
      toast.error(error.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProducts();
  }, []);

  // Filter products by selected product and search term
  const filteredProducts = products.filter(p => {
    const matchesProduct = selectedProduct === 'all' || p._id === selectedProduct;
    const matchesSearch = p.name.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesProduct && matchesSearch;
  });

  // Collect all reviews from filtered products
  const allReviews = [];
  filteredProducts.forEach(product => {
    if (product.reviews) {
      product.reviews.forEach(review => {
        allReviews.push({
          ...review,
          productName: product.name,
          productImage: product.image[0],
          productId: product._id
        });
      });
    }
  });
  // Sort reviews by date descending
  allReviews.sort((a, b) => b.date - a.date);

  // Collect all questions from filtered products
  const allQuestions = [];
  filteredProducts.forEach(product => {
    if (product.questions) {
      product.questions.forEach(question => {
        allQuestions.push({
          ...question,
          productName: product.name,
          productImage: product.image[0],
          productId: product._id
        });
      });
    }
  });
  // Sort questions by date descending
  allQuestions.sort((a, b) => b.date - a.date);

  // Handle delete review
  const handleDeleteReview = async (productId, reviewId) => {
    if (!window.confirm("Are you sure you want to delete this review? All associated media will also be removed from this view.")) return;
    try {
      const response = await axios.post(backendUrl + '/api/product/delete-review', {
        productId,
        reviewId
      }, { headers: { token } });

      if (response.data.success) {
        toast.success("Review deleted successfully!");
        fetchProducts();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Handle delete question
  const handleDeleteQuestion = async (productId, questionId) => {
    if (!window.confirm("Are you sure you want to delete this question and all of its answers?")) return;
    try {
      const response = await axios.post(backendUrl + '/api/product/delete-question', {
        productId,
        questionId
      }, { headers: { token } });

      if (response.data.success) {
        toast.success("Question deleted successfully!");
        fetchProducts();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  // Handle delete answer
  const handleDeleteAnswer = async (productId, questionId, answerId) => {
    if (!window.confirm("Are you sure you want to delete this answer?")) return;
    try {
      const response = await axios.post(backendUrl + '/api/product/delete-answer', {
        productId,
        questionId,
        answerId
      }, { headers: { token } });

      if (response.data.success) {
        toast.success("Answer deleted successfully!");
        fetchProducts();
      } else {
        toast.error(response.data.message);
      }
    } catch (error) {
      toast.error(error.message);
    }
  };

  return (
    <div className="pb-12">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-2xl font-semibold prata-regular">Reviews & Q&A Moderation</h1>
          <p className="text-sm text-gray-500 mt-1">Manage, watch, and delete user reviews, uploaded media, and questions/answers.</p>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white border border-gray-200 rounded-2xl p-5 mb-6 flex flex-col md:flex-row gap-4 items-center">
        <div className="relative flex-1 w-full">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search products by name..."
            className="w-full pl-9 pr-4 py-2 border border-gray-200 rounded-xl text-sm outline-none focus:border-orange-500 transition-colors"
          />
        </div>

        <div className="flex items-center gap-2 w-full md:w-auto">
          <Filter className="w-4 h-4 text-gray-400" />
          <select
            value={selectedProduct}
            onChange={(e) => setSelectedProduct(e.target.value)}
            className="w-full md:w-64 px-3 py-2 border border-gray-200 rounded-xl text-sm outline-none bg-white focus:border-orange-500 transition-colors"
          >
            <option value="all">All Products</option>
            {products.map(p => (
              <option key={p._id} value={p._id}>{p.name.slice(0, 30)}{p.name.length > 30 ? '...' : ''}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex gap-2 mb-6 border-b border-gray-200 pb-px">
        <button
          onClick={() => setActiveTab('reviews')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-semibold transition-all ${
            activeTab === 'reviews'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <Star className={`w-4 h-4 ${activeTab === 'reviews' ? 'fill-orange-100 text-orange-600' : ''}`} />
          Reviews
          <span className="ml-1 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-bold">
            {allReviews.length}
          </span>
        </button>
        <button
          onClick={() => setActiveTab('questions')}
          className={`flex items-center gap-2 px-5 py-3 border-b-2 text-sm font-semibold transition-all ${
            activeTab === 'questions'
              ? 'border-orange-500 text-orange-600'
              : 'border-transparent text-gray-500 hover:text-gray-700'
          }`}
        >
          <HelpCircle className="w-4 h-4" />
          Questions & Answers
          <span className="ml-1 bg-gray-100 text-gray-600 text-xs px-2 py-0.5 rounded-full font-bold">
            {allQuestions.length}
          </span>
        </button>
      </div>

      {/* Content */}
      {loading ? (
        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-2xl border border-gray-100 shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
          <p className="text-sm text-gray-400 mt-2 font-medium">Loading items...</p>
        </div>
      ) : (
        <div className="space-y-4">
          <AnimatePresence mode="wait">
            {/* Reviews Tab View */}
            {activeTab === 'reviews' && (
              <motion.div
                key="reviews-list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {allReviews.length === 0 ? (
                  <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl shadow-sm">
                    <Star className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 font-medium">No reviews matching the filters</p>
                  </div>
                ) : (
                  allReviews.map((rev, index) => {
                    const images = (rev.media || []).filter(m => m.type === 'image');
                    const video = (rev.media || []).find(m => m.type === 'video');
                    const videoLink = (rev.media || []).find(m => m.type === 'videoLink');
                    const platform = detectPlatform(rev.socialLink) || detectPlatform(videoLink?.url);

                    return (
                      <div key={rev._id || rev.date} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow relative overflow-hidden">
                        {/* Upper row: Product Context */}
                        <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
                          <img src={rev.productImage} alt="" className="w-10 h-10 object-cover rounded-lg border border-gray-200" />
                          <div>
                            <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Review for product</p>
                            <p className="text-sm font-semibold text-gray-900">{rev.productName}</p>
                          </div>
                        </div>

                        {/* Review Header */}
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4 mb-4">
                          <div className="flex items-start gap-3">
                            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-400 to-red-500 flex items-center justify-center text-white font-bold text-sm">
                              {rev.name.charAt(0).toUpperCase()}
                            </div>
                            <div>
                              <div className="flex items-center gap-2 flex-wrap">
                                <span className="font-semibold text-gray-900 text-sm">{rev.name}</span>
                                {rev.verified && (
                                  <span className="inline-flex items-center gap-0.5 text-[9px] bg-emerald-50 text-emerald-700 border border-emerald-200 px-1.5 py-0.5 rounded-full font-bold">
                                    <BadgeCheck className="w-3 h-3 text-emerald-600" /> Verified
                                  </span>
                                )}
                              </div>
                              <div className="flex items-center gap-2 mt-0.5">
                                <div className="flex gap-0.5">
                                  {[1, 2, 3, 4, 5].map(s => (
                                    <Star key={s} className={`w-3.5 h-3.5 ${s <= rev.rating ? 'fill-amber-400 text-amber-400' : 'text-gray-200 fill-gray-200'}`} />
                                  ))}
                                </div>
                                <span className="text-xs text-gray-400 flex items-center gap-1">
                                  <Calendar className="w-3 h-3" />
                                  {new Date(rev.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' })}
                                </span>
                              </div>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteReview(rev.productId, rev._id || rev.date)}
                            className="inline-flex items-center justify-center gap-1.5 px-3 py-1.5 border border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700 text-xs font-semibold rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                            Delete Review
                          </button>
                        </div>

                        {/* Comment */}
                        <p className="text-gray-700 text-sm leading-relaxed mb-4">{rev.comment}</p>

                        {/* Media Section */}
                        {((images && images.length > 0) || video || videoLink || rev.socialLink) && (
                          <div className="bg-gray-50 rounded-xl p-4 border border-gray-100 flex flex-col gap-3">
                            <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Attached Media</p>
                            
                            {/* Images */}
                            {images.length > 0 && (
                              <div className="flex gap-2 flex-wrap">
                                {images.map((img, i) => (
                                  <div 
                                    key={i} 
                                    onClick={() => setLightbox(img.url)} 
                                    className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 group block cursor-pointer"
                                  >
                                    <img src={img.url} alt="" className="w-full h-full object-cover" />
                                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                                      <Camera className="w-4 h-4 text-white" />
                                    </div>
                                  </div>
                                ))}
                              </div>
                            )}

                            {/* Video */}
                            {video && (
                              <div className="max-w-xs rounded-lg overflow-hidden border border-gray-200 bg-black">
                                <video controls className="w-full max-h-32 object-contain" src={video.url} />
                              </div>
                            )}

                            {/* Social / video link */}
                            {(videoLink || rev.socialLink) && platform && (
                              <div className="flex flex-wrap gap-2">
                                <a
                                  href={videoLink?.url || rev.socialLink}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className={`inline-flex items-center gap-1.5 bg-gradient-to-r ${platform.color} text-white text-xs font-semibold px-3 py-1 rounded-full hover:opacity-90 transition-opacity`}
                                >
                                  <span>{platform.emoji}</span>
                                  <span>{platform.name} Link</span>
                                  <ExternalLink className="w-3 h-3" />
                                </a>
                              </div>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </motion.div>
            )}

            {/* Questions Tab View */}
            {activeTab === 'questions' && (
              <motion.div
                key="questions-list"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-4"
              >
                {allQuestions.length === 0 ? (
                  <div className="text-center py-16 bg-white border border-gray-100 rounded-2xl shadow-sm">
                    <HelpCircle className="w-12 h-12 text-gray-200 mx-auto mb-3" />
                    <p className="text-gray-400 font-medium">No questions matching the filters</p>
                  </div>
                ) : (
                  allQuestions.map((q, index) => (
                    <div key={q._id || q.date} className="bg-white border border-gray-200 rounded-2xl p-5 hover:shadow-md transition-shadow">
                      {/* Product Header info */}
                      <div className="flex items-center gap-3 pb-4 mb-4 border-b border-gray-100">
                        <img src={q.productImage} alt="" className="w-10 h-10 object-cover rounded-lg border border-gray-200" />
                        <div>
                          <p className="text-xs text-gray-400 uppercase tracking-wider font-semibold">Q&A for product</p>
                          <p className="text-sm font-semibold text-gray-900">{q.productName}</p>
                        </div>
                      </div>

                      {/* Question box */}
                      <div className="bg-blue-50/50 border border-blue-100 rounded-xl p-4 mb-4">
                        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                          <div className="flex items-start gap-3">
                            <div className="w-8 h-8 rounded-full bg-blue-100 text-blue-600 flex items-center justify-center flex-shrink-0 text-sm font-bold mt-0.5">
                              ?
                            </div>
                            <div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs font-bold text-blue-700">{q.name}</span>
                                <span className="text-[10px] text-blue-400 flex items-center gap-1">
                                  <Calendar className="w-2.5 h-2.5" />
                                  {new Date(q.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}
                                </span>
                              </div>
                              <p className="text-sm font-semibold text-gray-800 mt-1">{q.question}</p>
                            </div>
                          </div>

                          <button
                            onClick={() => handleDeleteQuestion(q.productId, q._id || q.date)}
                            className="inline-flex items-center justify-center gap-1 px-2.5 py-1 border border-red-200 hover:bg-red-50 text-red-600 hover:text-red-700 text-xs font-bold rounded-lg transition-colors cursor-pointer self-start sm:self-auto"
                          >
                            <Trash2 className="w-3 h-3" />
                            Delete Q
                          </button>
                        </div>
                      </div>

                      {/* Answers thread */}
                      <div className="pl-6 border-l-2 border-gray-100 space-y-3">
                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-2">Answers ({q.answers?.length || 0})</p>
                        {q.answers?.length === 0 ? (
                          <p className="text-xs text-gray-400 italic">No answers posted yet</p>
                        ) : (
                          q.answers.map((ans, ai) => (
                            <div key={ans._id || ans.date} className="bg-gray-50 border border-gray-200 rounded-xl p-3 flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                              <div className="flex items-start gap-2.5">
                                <div className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold ${ans.isAdmin ? 'bg-orange-100 text-orange-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                  {ans.isAdmin ? <ShieldCheck className="w-3.5 h-3.5" /> : <BadgeCheck className="w-3.5 h-3.5" />}
                                </div>
                                <div>
                                  <div className="flex items-center gap-1.5 flex-wrap">
                                    <span className="text-xs font-semibold text-gray-900">{ans.name}</span>
                                    {ans.isAdmin && <span className="text-[9px] bg-orange-100 text-orange-700 px-1.5 py-0.5 rounded-full font-bold">Seller</span>}
                                    {!ans.isAdmin && ans.isVerifiedBuyer && <span className="text-[9px] bg-emerald-100 text-emerald-700 px-1.5 py-0.5 rounded-full font-bold">Verified Buyer</span>}
                                    <span className="text-[10px] text-gray-400 font-medium">· {new Date(ans.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                                  </div>
                                  <p className="text-xs text-gray-700 mt-1">{ans.answer}</p>
                                </div>
                              </div>

                              <button
                                onClick={() => handleDeleteAnswer(q.productId, q._id || q.date, ans._id || ans.date)}
                                className="text-red-500 hover:text-red-700 p-1 hover:bg-red-50 rounded transition-colors self-end sm:self-start"
                                title="Delete Answer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                              </button>
                            </div>
                          ))
                        )}
                      </div>
                    </div>
                  ))
                )}
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      )}

      {/* Lightbox for Admin review image verification */}
      <AnimatePresence>
        {lightbox && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={() => setLightbox(null)}
            className="fixed inset-0 z-[3000] bg-black/90 flex items-center justify-center p-4 cursor-zoom-out"
          >
            <button 
              onClick={() => setLightbox(null)} 
              className="absolute top-4 right-4 text-white hover:text-gray-300 bg-white/10 hover:bg-white/20 p-2 rounded-full transition-colors cursor-pointer"
            >
              <X className="w-6 h-6" />
            </button>
            <img 
              src={lightbox} 
              alt="Verification Preview" 
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl" 
              onClick={e => e.stopPropagation()} 
            />
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default AdminReviews;
