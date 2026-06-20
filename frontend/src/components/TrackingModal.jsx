import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X, Lock, Phone, MessageSquare, Star, Truck, Check,
  ShieldCheck, Copy, MapPin, Clock, Package, RefreshCw,
  Navigation, Bike, ChevronRight, AlertCircle, CheckCircle2
} from 'lucide-react';

// Avatar color palette for delivery partners
const AVATAR_COLORS = {
  VM: { bg: 'from-blue-400 to-blue-600', text: 'text-white' },
  AP: { bg: 'from-purple-400 to-purple-600', text: 'text-white' },
  RS: { bg: 'from-emerald-400 to-emerald-600', text: 'text-white' },
  DV: { bg: 'from-orange-400 to-orange-600', text: 'text-white' },
  SY: { bg: 'from-rose-400 to-rose-600', text: 'text-white' },
};

const getAvatarColor = (seed) => {
  if (!seed) return { bg: 'from-gray-400 to-gray-600', text: 'text-white' };
  return AVATAR_COLORS[seed] || { bg: 'from-indigo-400 to-indigo-600', text: 'text-white' };
};

const companyBadgeColor = {
  BlueDart: 'bg-blue-50 text-blue-700 border-blue-200',
  Delhivery: 'bg-purple-50 text-purple-700 border-purple-200',
  Shadowfax: 'bg-teal-50 text-teal-700 border-teal-200',
  Ekart: 'bg-orange-50 text-orange-700 border-orange-200',
  DTDC: 'bg-red-50 text-red-700 border-red-200',
  XpressBees: 'bg-yellow-50 text-yellow-700 border-yellow-200',
};

const TrackingModal = ({ item, onClose, onRefresh }) => {
  const [copied, setCopied] = useState(false);
  const [lastRefresh, setLastRefresh] = useState(new Date());
  const [refreshing, setRefreshing] = useState(false);
  const latestOnRefresh = React.useRef(onRefresh);

  // Keep ref up-to-date with latest onRefresh
  useEffect(() => {
    latestOnRefresh.current = onRefresh;
  }, [onRefresh]);

  // Auto-refresh every 30 seconds while modal is open
  useEffect(() => {
    const interval = setInterval(async () => {
      if (latestOnRefresh.current) {
        setRefreshing(true);
        try {
          await latestOnRefresh.current();
        } catch (e) {
          console.log('Auto-refresh error:', e);
        } finally {
          setLastRefresh(new Date());
          setRefreshing(false);
        }
      }
    }, 30000);
    return () => clearInterval(interval);
  }, []); // run once on mount, interval never resets

  const handleManualRefresh = async () => {
    if (!onRefresh || refreshing) return;
    setRefreshing(true);
    try {
      await onRefresh();
    } catch (e) {
      console.log('Refresh error:', e);
    } finally {
      setLastRefresh(new Date());
      setRefreshing(false);
    }
  };

  // ── PIN ──────────────────────────────────────────────
  const getProductPin = () => {
    if (item.pin) return item.pin;
    const str = (item.orderId || '') + (item._id || item.name || '');
    let hash = 0;
    for (let i = 0; i < str.length; i++) hash = str.charCodeAt(i) + ((hash << 5) - hash);
    return (Math.abs(hash % 900000) + 100000).toString();
  };
  const deliveryPin = getProductPin();

  const copyPin = () => {
    navigator.clipboard.writeText(deliveryPin);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  // ── Fallback deterministic partner ──────────────────
  const getFallbackPartner = () => {
    const pool = [
      { name: 'Vikram Malhotra', phone: '+91 98765 01234', vehicle: 'DL 3C AB 1234', company: 'BlueDart', rating: '4.9', avatarSeed: 'VM' },
      { name: 'Amit Patel', phone: '+91 98234 56789', vehicle: 'MH 12 CD 5678', company: 'Delhivery', rating: '4.7', avatarSeed: 'AP' },
      { name: 'Rohan Sharma', phone: '+91 99112 23344', vehicle: 'KA 03 EF 9012', company: 'Shadowfax', rating: '4.8', avatarSeed: 'RS' },
    ];
    let hash = 0;
    const id = item.orderId || '';
    for (let i = 0; i < id.length; i++) hash = id.charCodeAt(i) + ((hash << 5) - hash);
    return pool[Math.abs(hash) % pool.length];
  };

  const partner = (item.deliveryPartner?.name) ? item.deliveryPartner : getFallbackPartner();
  const avatarSeed = partner.avatarSeed || (partner.name?.split(' ').map(n => n[0]).join('') || '?');
  const avatarStyle = getAvatarColor(avatarSeed);
  const companyBadge = companyBadgeColor[partner.company] || 'bg-gray-50 text-gray-600 border-gray-200';

  // ── Timeline ─────────────────────────────────────────
  const stages = [
    {
      key: 'Order Placed',
      label: 'Order Confirmed',
      sub: 'Your order has been confirmed',
      icon: Package,
      completedSub: 'Order confirmed & processing began',
    },
    {
      key: 'Packing',
      label: 'Packing',
      sub: 'Items are being carefully packed',
      icon: Package,
      completedSub: 'Packed and ready for dispatch',
    },
    {
      key: 'Shipped',
      label: 'Shipped',
      sub: 'On the way to delivery hub',
      icon: Truck,
      completedSub: 'Dispatched from warehouse',
    },
    {
      key: 'Out for delivery',
      label: 'Out for Delivery',
      sub: 'Delivery partner is on their way',
      icon: Navigation,
      completedSub: 'En route to your address',
    },
    {
      key: 'Delivered',
      label: 'Delivered',
      sub: 'Package delivered successfully',
      icon: CheckCircle2,
      completedSub: 'Successfully delivered',
    },
  ];

  const currentStatusIndex = stages.findIndex(s => s.key === item.status);
  const isCancelled = item.status === 'Cancelled';

  const getStageDate = (stageKey) => {
    const base = new Date(item.date);
    const fmt = (d) => d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short' });
    const fmtTime = (ts) => {
      const d = new Date(ts);
      return `${fmt(d)}, ${d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}`;
    };
    switch (stageKey) {
      case 'Order Placed': return fmtTime(item.date);
      case 'Packing': return item.packedAt ? fmtTime(item.packedAt) : (() => { base.setDate(base.getDate() + 1); return fmt(base); })();
      case 'Shipped': return item.shippedAt ? fmtTime(item.shippedAt) : (() => { base.setDate(base.getDate() + 2); return fmt(base); })();
      case 'Out for delivery': return item.outForDeliveryAt ? fmtTime(item.outForDeliveryAt) : (() => { base.setDate(base.getDate() + 3); return fmt(base); })();
      case 'Delivered': return item.deliveredAt ? fmtTime(item.deliveredAt) : (() => { base.setDate(base.getDate() + 4); return fmt(base); })();
      case 'Cancelled': return item.cancelledAt ? fmtTime(item.cancelledAt) : fmtTime(item.date);
      default: return '';
    }
  };

  const showPartner = ['Shipped', 'Out for delivery', 'Delivered'].includes(item.status);

  // Expected delivery date
  const getExpectedDelivery = () => {
    const d = new Date(item.date);
    d.setDate(d.getDate() + 5);
    return d.toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'long' });
  };

  return (
    <div
      className="fixed inset-0 z-[2000] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-4"
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 100 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 100 }}
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
        className="bg-white w-full sm:max-w-lg rounded-t-3xl sm:rounded-2xl shadow-2xl flex flex-col max-h-[92vh] sm:max-h-[88vh] overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* ── Header ───────────────────────────────────── */}
        <div className="relative bg-gradient-to-r from-slate-800 to-slate-900 px-5 pt-5 pb-6 text-white">
          {/* drag handle on mobile */}
          <div className="w-10 h-1 bg-white/20 rounded-full mx-auto mb-4 sm:hidden" />

          <div className="flex items-start justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <Truck className="w-4 h-4 text-orange-400" />
                <p className="text-xs font-semibold text-orange-400 uppercase tracking-widest">Track Shipment</p>
              </div>
              <h3 className="text-xl font-bold">{item.name}</h3>
              <p className="text-white/50 text-xs mt-0.5 font-mono">#{item.orderId?.slice(-10)}</p>
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleManualRefresh}
                className={`p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors ${refreshing ? 'opacity-60' : ''}`}
                title="Refresh tracking"
              >
                <RefreshCw className={`w-4 h-4 text-white/80 ${refreshing ? 'animate-spin' : ''}`} />
              </button>
              <button
                onClick={onClose}
                className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </div>

          {/* Status badge */}
          <div className="mt-4 flex items-center gap-3">
            <span className={`inline-flex items-center gap-1.5 text-xs font-bold px-3 py-1.5 rounded-full ${
              isCancelled ? 'bg-red-500/20 text-red-300' :
              item.status === 'Delivered' ? 'bg-emerald-500/20 text-emerald-300' :
              'bg-orange-500/20 text-orange-300'
            }`}>
              {!isCancelled && item.status !== 'Delivered' && (
                <span className="relative flex w-2 h-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-75"></span>
                  <span className="relative inline-flex rounded-full w-2 h-2 bg-orange-400"></span>
                </span>
              )}
              {item.status}
            </span>
            {!isCancelled && item.status !== 'Delivered' && (
              <p className="text-white/40 text-xs">Expected by {getExpectedDelivery()}</p>
            )}
          </div>
        </div>

        {/* ── Scrollable Body ──────────────────────────── */}
        <div className="overflow-y-auto flex-1 divide-y divide-gray-100">

          {/* ── Timeline Section ────────────────────────── */}
          <div className="px-5 py-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Shipment Progress</p>

            {isCancelled ? (
              <div className="relative pl-9">
                <div className="absolute left-[14px] top-3 bottom-0 w-0.5 bg-red-100" />
                {/* Ordered step */}
                <div className="relative mb-6">
                  <div className="absolute -left-[23px] top-0.5 w-5 h-5 rounded-full bg-emerald-500 flex items-center justify-center shadow-sm shadow-emerald-200">
                    <Check className="w-3 h-3 text-white" />
                  </div>
                  <p className="font-semibold text-gray-800 text-sm">Order Confirmed</p>
                  <p className="text-xs text-gray-400 mt-0.5">{getStageDate('Order Placed')}</p>
                </div>
                {/* Cancelled step */}
                <div className="relative">
                  <div className="absolute -left-[23px] top-0.5 w-5 h-5 rounded-full bg-red-500 flex items-center justify-center shadow-sm shadow-red-200">
                    <X className="w-3 h-3 text-white" />
                  </div>
                  <p className="font-bold text-red-600 text-sm">Cancelled</p>
                  {item.cancelReason && (
                    <p className="text-xs text-red-400 mt-1 bg-red-50 border border-red-100 rounded-lg px-3 py-2 italic">
                      "{item.cancelReason}"
                    </p>
                  )}
                  <p className="text-xs text-red-400 mt-1">{getStageDate('Cancelled')}</p>
                </div>
              </div>
            ) : (
              <div className="relative pl-9 space-y-0">
                {stages.map((stage, index) => {
                  const isCompleted = index < currentStatusIndex || item.status === 'Delivered';
                  const isActive = index === currentStatusIndex && item.status !== 'Delivered';
                  const isFuture = !isCompleted && !isActive;
                  const Icon = stage.icon;

                  return (
                    <div key={index} className="relative pb-5 last:pb-0">
                      {/* Connector line */}
                      {index < stages.length - 1 && (
                        <div className={`absolute left-[-23px] top-5 w-0.5 h-full transition-colors duration-500 ${
                          isCompleted ? 'bg-gradient-to-b from-emerald-500 to-emerald-300' : 'bg-gray-200'
                        }`} />
                      )}

                      {/* Node */}
                      <div className="absolute -left-[31px] top-0">
                        {isCompleted ? (
                          <div className="w-6 h-6 rounded-full bg-emerald-500 flex items-center justify-center shadow shadow-emerald-200">
                            <Check className="w-3.5 h-3.5 text-white" />
                          </div>
                        ) : isActive ? (
                          <div className="relative w-6 h-6 rounded-full bg-orange-500 flex items-center justify-center shadow shadow-orange-200">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-orange-400 opacity-60"></span>
                            <Icon className="w-3 h-3 text-white relative z-10" />
                          </div>
                        ) : (
                          <div className="w-6 h-6 rounded-full border-2 border-gray-200 bg-white flex items-center justify-center">
                            <Icon className="w-3 h-3 text-gray-300" />
                          </div>
                        )}
                      </div>

                      {/* Content */}
                      <div className={`transition-opacity duration-300 ${isFuture ? 'opacity-40' : 'opacity-100'}`}>
                        <p className={`font-semibold text-sm ${isActive ? 'text-orange-600' : isCompleted ? 'text-gray-900' : 'text-gray-400'}`}>
                          {stage.label}
                          {isActive && (
                            <span className="ml-2 text-[10px] font-normal bg-orange-100 text-orange-600 px-1.5 py-0.5 rounded-full">LIVE</span>
                          )}
                        </p>
                        <p className={`text-xs mt-0.5 ${isActive ? 'text-orange-500' : 'text-gray-400'}`}>
                          {isCompleted ? stage.completedSub : isActive ? stage.sub : ''}
                        </p>
                        {!isFuture && (
                          <p className="text-[11px] text-gray-400 mt-0.5 flex items-center gap-1">
                            <Clock className="w-2.5 h-2.5" />
                            {getStageDate(stage.key)}
                          </p>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

          {/* ── Delivery Partner Section ─────────────────── */}
          {showPartner && (
            <div className="px-5 py-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-4">Delivery Partner</p>

              <div className="bg-gradient-to-br from-slate-50 to-white border border-slate-100 rounded-2xl overflow-hidden shadow-sm">
                {/* Partner Header */}
                <div className="p-4 flex items-center gap-4">
                  {/* Avatar */}
                  <div className={`relative w-14 h-14 rounded-2xl bg-gradient-to-br ${avatarStyle.bg} flex items-center justify-center shadow-md flex-shrink-0`}>
                    <span className={`text-lg font-extrabold ${avatarStyle.text}`}>{avatarSeed}</span>
                    {/* Online indicator */}
                    <span className="absolute -bottom-0.5 -right-0.5 w-4 h-4 bg-emerald-500 border-2 border-white rounded-full flex items-center justify-center">
                      <span className="w-1.5 h-1.5 rounded-full bg-white"></span>
                    </span>
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-start justify-between gap-2">
                      <div>
                        <h4 className="font-bold text-gray-900 text-base leading-tight">{partner.name}</h4>
                        <div className="flex items-center flex-wrap gap-2 mt-1">
                          <span className={`text-[10px] font-semibold px-2 py-0.5 rounded-full border ${companyBadge}`}>
                            {partner.company}
                          </span>
                          <span className="flex items-center gap-0.5 text-[11px] font-bold text-amber-500">
                            <Star className="w-3 h-3 fill-amber-400" />
                            {partner.rating}
                          </span>
                        </div>
                      </div>
                    </div>
                    {partner.vehicle && (
                      <div className="flex items-center gap-1.5 mt-2 text-xs text-gray-500">
                        <Bike className="w-3.5 h-3.5 text-gray-400" />
                        <span className="font-mono font-semibold text-gray-700 bg-gray-100 px-1.5 py-0.5 rounded text-[11px]">{partner.vehicle}</span>
                      </div>
                    )}
                  </div>
                </div>

                {/* Divider */}
                <div className="border-t border-dashed border-slate-200 mx-4" />

                {/* Action Buttons */}
                <div className="p-4 flex gap-3">
                  <a
                    href={`tel:${partner.phone}`}
                    className="flex-1 flex items-center justify-center gap-2 bg-orange-500 hover:bg-orange-600 active:scale-95 text-white rounded-xl py-3 text-sm font-bold transition-all shadow-md shadow-orange-100"
                  >
                    <Phone className="w-4 h-4" />
                    Call Partner
                  </a>
                  <a
                    href={`sms:${partner.phone}`}
                    className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 rounded-xl px-4 py-3 text-sm font-semibold transition-all"
                    title="Send SMS"
                  >
                    <MessageSquare className="w-4 h-4" />
                  </a>
                  <button
                    className="flex items-center justify-center gap-2 bg-slate-100 hover:bg-slate-200 active:scale-95 text-slate-600 rounded-xl px-4 py-3 text-sm font-semibold transition-all"
                    onClick={() => {}}
                    title="Live location (coming soon)"
                  >
                    <MapPin className="w-4 h-4" />
                  </button>
                </div>

                {/* Phone number */}
                <div className="px-4 pb-4">
                  <p className="text-center text-xs text-gray-400">
                    Partner's Number: <span className="font-semibold text-gray-600">{partner.phone}</span>
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* ── Delivery PIN ─────────────────────────────── */}
          <div className="px-5 py-5">
            <p className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-3">Delivery OTP</p>
            <div className="relative bg-gradient-to-br from-orange-500 via-orange-500 to-amber-500 rounded-2xl p-5 text-white overflow-hidden shadow-lg shadow-orange-100">
              <div className="absolute -right-4 -bottom-4 opacity-10">
                <Lock className="w-32 h-32" />
              </div>
              <div className="flex items-center gap-4">
                <div className="bg-white/20 backdrop-blur-sm p-3 rounded-xl">
                  <Lock className="w-5 h-5" />
                </div>
                <div className="flex-1">
                  <p className="text-xs text-white/70 font-semibold tracking-wider uppercase">Secure Verification PIN</p>
                  <div className="flex items-center gap-3 mt-1">
                    <span className="text-3xl font-extrabold tracking-[0.2em]">{deliveryPin}</span>
                    <button
                      onClick={copyPin}
                      className="flex items-center gap-1.5 bg-white/20 hover:bg-white/30 active:scale-95 transition-all px-3 py-1.5 rounded-lg text-xs font-bold"
                    >
                      {copied ? <><CheckCircle2 className="w-3.5 h-3.5" /> Copied!</> : <><Copy className="w-3.5 h-3.5" /> Copy</>}
                    </button>
                  </div>
                  <p className="text-[11px] text-white/70 mt-2 leading-relaxed">
                    Share with delivery partner at the time of delivery to confirm receipt.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* ── Product + Order Info ─────────────────────── */}
          <div className="px-5 py-4">
            <div className="flex items-center gap-4 bg-gray-50 rounded-2xl p-4">
              <img className="w-16 h-16 object-cover rounded-xl border border-gray-100 bg-white shadow-sm" src={item.image?.[0]} alt={item.name} />
              <div className="flex-1 min-w-0">
                <h4 className="font-semibold text-gray-900 text-sm truncate">{item.name}</h4>
                <div className="flex flex-wrap gap-x-3 gap-y-1 text-xs text-gray-400 mt-1">
                  <span>Size: <strong className="text-gray-700">{item.size}</strong></span>
                  <span>Qty: <strong className="text-gray-700">{item.quantity}</strong></span>
                  <span>₹<strong className="text-gray-700">{item.price}</strong></span>
                </div>
                <p className="text-[10px] font-mono text-gray-300 mt-1 truncate">#{item.orderId}</p>
              </div>
            </div>
          </div>

          {/* ── Safety Banner ────────────────────────────── */}
          <div className="px-5 py-4">
            <div className="flex items-start gap-3 bg-blue-50 border border-blue-100 rounded-xl p-4">
              <ShieldCheck className="w-5 h-5 text-blue-500 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-bold text-blue-800">Your Safety Comes First</p>
                <p className="text-[11px] text-blue-600/80 mt-1 leading-relaxed">
                  Our delivery partners follow contactless protocols, use sanitized equipment, and are trained for safe deliveries.
                </p>
              </div>
            </div>
          </div>

          {/* ── Last Updated ─────────────────────────────── */}
          <div className="px-5 py-3">
            <p className="text-center text-[11px] text-gray-300">
              Last updated: {lastRefresh.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', second: '2-digit' })}
              {' · '}Auto-refreshes every 30 seconds
            </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default TrackingModal;
