import React, { useState, useEffect, useRef } from 'react';
import { supabase } from '../lib/supabase';
import { motion, AnimatePresence } from 'framer-motion';
import {
    Users, Globe, Shield, Search, MoreVertical, ArrowLeft,
    LayoutDashboard, ExternalLink, Image as ImageIcon, Plus, Edit2, Trash2, X,
    Upload, Code2, ShieldCheck, Palette, Settings, CheckCircle2, AlertCircle,
    WalletCards, RefreshCcw, FileText, Activity
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';

function cn(...classes) { return classes.filter(Boolean).join(' '); }

// ---------- SUPABASE IMAGE UPLOAD HELPER ----------
async function uploadImageToSupabase(file, bucket = 'portfolio') {
    const ext = file.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;
    const { error } = await supabase.storage.from(bucket).upload(fileName, file, { upsert: true });
    if (error) throw error;
    const { data } = supabase.storage.from(bucket).getPublicUrl(fileName);
    return data.publicUrl;
}

// ---------- IMAGE UPLOAD FIELD ----------
function ImageUploadField({ label, value, onChange, multiple = false }) {
    const inputRef = useRef(null);
    const [uploading, setUploading] = useState(false);
    const [error, setError] = useState(null);

    const handleFiles = async (files) => {
        if (!files || files.length === 0) return;
        setUploading(true);
        setError(null);
        try {
            const uploads = await Promise.all(Array.from(files).map(f => uploadImageToSupabase(f)));
            if (multiple) {
                const current = value ? value.split('\n').filter(Boolean) : [];
                onChange([...current, ...uploads].join('\n'));
            } else {
                onChange(uploads[0]);
            }
        } catch (err) {
            setError('Upload failed: ' + err.message);
        } finally {
            setUploading(false);
        }
    };

    return (
        <div>
            <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">{label}</label>
            {/* Preview */}
            {!multiple && value && (
                <div className="mb-3 relative group w-full h-40 rounded-2xl overflow-hidden border border-slate-600">
                    <img src={value} alt="preview" className="w-full h-full object-cover" />
                    <button type="button" onClick={() => onChange('')} className="absolute top-2 right-2 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity">
                        <X size={14} />
                    </button>
                </div>
            )}
            {multiple && value && value.split('\n').filter(Boolean).map((url, i) => (
                <div key={i} className="mb-2 relative group flex items-center gap-2">
                    <img src={url} alt={`gallery-${i}`} className="w-16 h-16 object-cover rounded-xl border border-slate-600 shrink-0" />
                    <span className="text-xs text-slate-400 truncate flex-1">{url}</span>
                    <button type="button" onClick={() => {
                        const arr = value.split('\n').filter(Boolean);
                        arr.splice(i, 1);
                        onChange(arr.join('\n'));
                    }} className="text-red-400 hover:text-red-300 shrink-0"><X size={14} /></button>
                </div>
            ))}

            {/* Upload Zone */}
            <button
                type="button"
                onClick={() => inputRef.current?.click()}
                disabled={uploading}
                className="w-full flex flex-col items-center justify-center gap-2 border-2 border-dashed border-slate-600 rounded-2xl py-6 text-slate-400 hover:border-blue-500 hover:text-blue-400 transition-all text-sm font-bold"
            >
                {uploading ? <span className="animate-pulse">Uploading…</span> : (
                    <><Upload size={20} /><span>Click to upload from your PC</span><span className="text-[10px] font-normal text-slate-500">PNG, JPG, WEBP</span></>
                )}
            </button>
            <input ref={inputRef} type="file" accept="image/*" multiple={multiple} className="hidden" onChange={e => handleFiles(e.target.files)} />
            {error && <p className="text-red-400 text-xs mt-2 flex items-center gap-1"><AlertCircle size={12} />{error}</p>}
        </div>
    );
}

// ---------- MAIN ADMIN COMPONENT ----------
export default function Admin() {
    const [loading, setLoading] = useState(false);
    const [profiles, setProfiles] = useState([]);
    const [sites, setSites] = useState([]);
    const [services, setServices] = useState([]);
    const [isPinVerified, setIsPinVerified] = useState(false);
    const [pinInput, setPinInput] = useState('');
    const [searchQuery, setSearchQuery] = useState('');
    const [activeTab, setActiveTab] = useState('overview');
    const [purchases, setPurchases] = useState([]);
    const [financialUploads, setFinancialUploads] = useState([]);
    const [toast, setToast] = useState(null);
    const navigate = useNavigate();

    // Service Modal State
    const [showServiceModal, setShowServiceModal] = useState(false);
    const [editingServiceId, setEditingServiceId] = useState(null);
    const [serviceForm, setServiceForm] = useState({
        title: '', description: '', icon: 'Code2', badge: '',
        points: '', whatsapp_msg: '', cover_image: '', display_order: 0
    });

    const showToast = (msg, type = 'success') => {
        setToast({ msg, type });
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        const savedPin = localStorage.getItem('adminPin');
        if (savedPin === '1965') { setIsPinVerified(true); fetchData(); }
    }, []);

    const handlePinSubmit = (e) => {
        e.preventDefault();
        if (pinInput === '1965') {
            localStorage.setItem('adminPin', '1965');
            setIsPinVerified(true);
            fetchData();
        } else {
            alert('Incorrect PIN');
            setPinInput('');
        }
    };

    async function fetchData() {
        setLoading(true);
        try {
            // Fetch profiles, sites, portfolio, services normally
            const [profilesRes, sitesRes, servicesRes] = await Promise.all([
                supabase.from('profiles').select('*').order('updated_at', { ascending: false }),
                supabase.from('sites').select('*, profiles(full_name)').order('created_at', { ascending: false }),
                supabase.from('services').select('*').order('display_order', { ascending: true }),
            ]);
            setProfiles(profilesRes.data || []);
            setSites(sitesRes.data || []);
            setServices(servicesRes.data || []);

            // Fetch purchases via edge function (service role — bypasses RLS entirely)
            const { data: purchasesData, error: purchasesErr } = await supabase.functions.invoke('admin-purchases');
            if (!purchasesErr && purchasesData?.purchases) {
                setPurchases(purchasesData.purchases);
            } else {
                console.warn('Purchases fetch failed:', purchasesErr?.message || purchasesData?.error);
                setPurchases([]);
            }

            // Fetch financial uploads (Admin view — all users)
            const { data: uploadsData } = await supabase
                .from('financial_uploads')
                .select('*, profiles(full_name, username)')
                .order('created_at', { ascending: false });
            setFinancialUploads(uploadsData || []);

        } catch (error) {
            console.error('Error fetching admin data:', error);
        } finally {
            setLoading(false);
        }
    }

    const filteredProfiles = profiles.filter(p =>
        p.full_name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.username?.toLowerCase().includes(searchQuery.toLowerCase())
    );

    // ---- SERVICE ACTIONS ----
    const handleServiceSubmit = async (e) => {
        e.preventDefault();
        const pointsArray = serviceForm.points.split('\n').map(s => s.trim()).filter(Boolean);
        const payload = {
            title: serviceForm.title, description: serviceForm.description,
            icon: serviceForm.icon, badge: serviceForm.badge,
            points: pointsArray, whatsapp_msg: serviceForm.whatsapp_msg,
            cover_image: serviceForm.cover_image,
            display_order: parseInt(serviceForm.display_order) || 0
        };
        try {
            if (editingServiceId) {
                await supabase.from('services').update(payload).eq('id', editingServiceId);
            } else {
                await supabase.from('services').insert([payload]);
            }
            setShowServiceModal(false);
            fetchData();
            showToast(editingServiceId ? 'Service updated!' : 'Service created!');
        } catch (error) {
            console.error("Error saving service:", error);
            showToast("Failed to save service. Ensure the `services` table exists in Supabase.", 'error');
        }
    };

    const editService = (svc) => {
        setEditingServiceId(svc.id);
        setServiceForm({
            title: svc.title, description: svc.description || '',
            icon: svc.icon || 'Code2', badge: svc.badge || '',
            points: (svc.points || []).join('\n'), whatsapp_msg: svc.whatsapp_msg || '',
            cover_image: svc.cover_image || '',
            display_order: svc.display_order || 0
        });
        setShowServiceModal(true);
    };

    const deleteService = async (id) => {
        if (!window.confirm("Delete this service?")) return;
        await supabase.from('services').delete().eq('id', id);
        fetchData();
        showToast('Service deleted.');
    };

    const openCreateServiceModal = () => {
        setEditingServiceId(null);
        setServiceForm({ title: '', description: '', icon: 'Code2', badge: '', points: '', whatsapp_msg: '', cover_image: '', display_order: services.length });
        setShowServiceModal(true);
    };

    // ---- PIN SCREEN ----
    if (!isPinVerified) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6 text-white text-center">
                <div className="max-w-md w-full bg-slate-900/50 p-10 rounded-3xl border border-slate-700 shadow-2xl backdrop-blur">
                    <div className="mx-auto w-16 h-16 bg-blue-500/10 text-blue-500 border border-blue-500/20 rounded-2xl flex items-center justify-center mb-6">
                        <Shield className="w-8 h-8" />
                    </div>
                    <h1 className="text-2xl font-bold mb-2">Admin Control Center</h1>
                    <p className="text-slate-400 mb-8 text-sm">Please enter the master security PIN to authorize access.</p>
                    <form onSubmit={handlePinSubmit} className="space-y-4">
                        <input type="password" placeholder="Enter PIN"
                            className="w-full text-center tracking-[0.5em] text-2xl font-black bg-[#020617] border border-slate-700 rounded-xl py-4 focus:border-blue-500 focus:outline-none focus:ring-1 focus:ring-blue-500 placeholder:text-slate-600 placeholder:text-base placeholder:tracking-normal placeholder:font-normal transition-all"
                            value={pinInput} onChange={(e) => setPinInput(e.target.value)} autoFocus />
                        <button type="submit" className="w-full bg-blue-600 hover:bg-blue-500 text-white font-bold py-4 rounded-xl transition-all active:scale-95 shadow-lg shadow-blue-500/20">
                            Unlock Dashboard
                        </button>
                    </form>
                    <button onClick={() => navigate('/')} className="mt-8 text-sm text-slate-500 hover:text-slate-300 transition-colors flex items-center justify-center w-full gap-2">
                        <ArrowLeft size={16} /> Return to Home
                    </button>
                </div>
            </div>
        );
    }

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'services', label: 'Services' },
        { id: 'purchases', label: `Purchases ${purchases.length > 0 ? `(${purchases.length})` : ''}` },
        { id: 'monitoring', label: `Monitoring ${financialUploads.length > 0 ? `(${financialUploads.length})` : ''}` },
    ];

    return (
        <div className="min-h-screen bg-[#020617] text-white">
            {/* Toast */}
            <AnimatePresence>
                {toast && (
                    <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -20 }}
                        className={cn("fixed top-6 right-6 z-[100] flex items-center gap-3 px-6 py-4 rounded-2xl shadow-2xl text-sm font-bold",
                            toast.type === 'error' ? 'bg-red-600 text-white' : 'bg-green-600 text-white')}>
                        {toast.type === 'error' ? <AlertCircle size={18} /> : <CheckCircle2 size={18} />}
                        {toast.msg}
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Header */}
            <div className="bg-slate-900 text-white p-4 sm:p-6 sticky top-0 z-40 shadow-xl border-b border-slate-800">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-4">
                    <div className="flex items-center gap-4">
                        <button onClick={() => navigate('/')} className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 transition-all">
                            <ArrowLeft size={20} />
                        </button>
                        <div>
                            <div className="text-[10px] font-black uppercase tracking-[0.3em] text-blue-400">Control Center</div>
                            <h1 className="text-xl font-bold">Admin Dashboard</h1>
                        </div>
                    </div>
                    <div className="flex bg-slate-800 p-1 rounded-2xl overflow-x-auto gap-1">
                        {tabs.map(tab => (
                            <button key={tab.id}
                                className={cn("whitespace-nowrap px-4 sm:px-6 py-2 rounded-xl text-sm font-bold transition-all",
                                    activeTab === tab.id ? "bg-blue-600 text-white shadow" : "text-white/60 hover:text-white")}
                                onClick={() => setActiveTab(tab.id)}>
                                {tab.label}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            <main className="max-w-7xl mx-auto p-4 sm:p-6 md:p-10">

                {/* ---- OVERVIEW TAB ---- */}
                {activeTab === 'overview' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6 mb-10">
                            <StatCard icon={<Users className="text-blue-500" />} label="Total Users" value={profiles.length} />
                            <StatCard icon={<Globe className="text-cyan-500" />} label="Site Requests" value={sites.length} />
                            <StatCard icon={<LayoutDashboard className="text-purple-500" />} label="System Status" value="Operational" />
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                            <div className="lg:col-span-2 space-y-6">
                                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-2">
                                    <h3 className="text-lg font-bold flex items-center gap-2"><Users size={20} className="text-blue-500" /> User Directory</h3>
                                    <div className="relative w-full sm:w-64">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
                                        <input type="text" placeholder="Search users..."
                                            className="w-full pl-10 pr-4 py-2 rounded-xl border border-slate-600 bg-slate-900 text-sm focus:outline-none focus:border-blue-500 transition-all"
                                            value={searchQuery} onChange={(e) => setSearchQuery(e.target.value)} />
                                    </div>
                                </div>
                                <div className="bg-slate-900 rounded-3xl border border-slate-700 overflow-hidden shadow-sm overflow-x-auto">
                                    <table className="w-full text-left min-w-[500px]">
                                        <thead className="bg-[#020617] border-b border-slate-700">
                                            <tr>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">User</th>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Status</th>
                                                <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400 text-right">Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody className="divide-y divide-slate-800">
                                            {loading ? <tr><td colSpan="3" className="px-6 py-10 text-center text-slate-400">Loading...</td></tr> :
                                                filteredProfiles.length === 0 ? <tr><td colSpan="3" className="px-6 py-10 text-center text-slate-500">No users found.</td></tr> :
                                                    filteredProfiles.map(profile => (
                                                        <tr key={profile.id} className="hover:bg-slate-800/40 transition-colors">
                                                            <td className="px-6 py-4">
                                                                <div className="flex items-center gap-3">
                                                                    <div className="h-10 w-10 rounded-full bg-slate-800 flex items-center justify-center text-slate-400 border border-slate-700 overflow-hidden shrink-0">
                                                                        {profile.avatar_url ? <img src={profile.avatar_url} className="h-full w-full object-cover" /> : <Users size={18} />}
                                                                    </div>
                                                                    <div><div className="font-bold text-white truncate">{profile.full_name || 'Anonymous'}</div>
                                                                        <div className="text-xs text-slate-400">@{profile.username || 'no-username'}</div></div>
                                                                </div>
                                                            </td>
                                                            <td className="px-6 py-4">
                                                                <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                                                                    profile.is_admin ? "bg-blue-900/40 text-blue-400 border border-blue-500/20" : "bg-slate-800 text-slate-400 border border-slate-700")}>
                                                                    {profile.is_admin ? 'Admin' : 'Client'}
                                                                </span>
                                                            </td>
                                                            <td className="px-6 py-4 text-right text-slate-400">
                                                                <button className="hover:text-white p-2"><MoreVertical size={18} /></button>
                                                            </td>
                                                        </tr>
                                                    ))}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                            <div className="space-y-6">
                                <h3 className="text-lg font-bold flex items-center gap-2"><Globe size={20} className="text-cyan-500" /> Site Tracking</h3>
                                <div className="space-y-4">
                                    {sites.length === 0 ? (
                                        <div className="p-8 rounded-3xl border border-dashed border-slate-600 text-center text-slate-400">
                                            <Globe size={32} className="mx-auto mb-4 text-slate-600" /> No sites tracked yet.
                                        </div>
                                    ) : sites.map(site => (
                                        <div key={site.id} className="p-6 rounded-3xl border border-slate-700 bg-slate-900 shadow-sm">
                                            <div className="flex justify-between items-start mb-4">
                                                <div className="h-10 w-10 rounded-xl bg-cyan-900/30 text-cyan-500 flex items-center justify-center"><Globe size={20} /></div>
                                                <span className={cn("px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest",
                                                    site.status === 'live' ? "bg-green-900/40 text-green-400" : "bg-amber-900/40 text-amber-400")}>
                                                    {site.status}
                                                </span>
                                            </div>
                                            <h4 className="font-bold text-white mb-1">{site.name}</h4>
                                            <p className="text-xs text-slate-400 mb-4">Owner: {site.profiles?.full_name || 'Unknown'}</p>
                                            {site.url && <a href={site.url} target="_blank" className="text-xs font-bold text-blue-400 flex items-center gap-1 hover:underline">Visit Site <ExternalLink size={12} /></a>}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </motion.div>
                )}

                {/* ---- SERVICES TAB ---- */}
                {activeTab === 'services' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3"><Settings className="text-blue-500" /> Service Manager</h2>
                                <p className="text-slate-400 text-sm mt-1">Manage the services displayed on your homepage.</p>
                            </div>
                            <button onClick={openCreateServiceModal}
                                className="flex items-center gap-2 bg-blue-600 text-white px-6 py-3 rounded-2xl font-bold hover:bg-blue-500 transition-all shadow-md active:scale-95 shrink-0">
                                <Plus size={18} /> Add Service
                            </button>
                        </div>

                        {loading ? <div className="text-center py-20 text-slate-400">Loading...</div> :
                            services.length === 0 ? (
                                <div className="py-20 text-center border-2 border-dashed border-slate-700 rounded-[3rem]">
                                    <Settings size={48} className="mx-auto mb-4 text-slate-600" />
                                    <h3 className="text-xl font-bold mb-2">No services yet</h3>
                                    <p className="text-slate-400 mb-6 text-sm">Add your first service to display it on the homepage.</p>
                                    <button onClick={openCreateServiceModal} className="text-blue-400 font-bold hover:underline">+ Add Service</button>
                                </div>
                            ) : (
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                    {services.map(svc => (
                                        <div key={svc.id} className="bg-slate-900 rounded-3xl border border-slate-700 overflow-hidden shadow hover:border-blue-500/40 transition-all">
                                            {svc.cover_image && (
                                                <div className="aspect-[4/3] relative bg-slate-800">
                                                    <img src={svc.cover_image} alt={svc.title} className="w-full h-full object-cover" />
                                                </div>
                                            )}
                                            <div className="p-5">
                                                <div className="flex items-center gap-2 mb-3">
                                                    <div className="h-8 w-8 rounded-xl bg-blue-600/10 text-blue-400 flex items-center justify-center text-xs font-black">{svc.icon?.substring(0, 2)}</div>
                                                    <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Order: {svc.display_order}</span>
                                                </div>
                                                <h3 className="font-bold text-white mb-1">{svc.title}</h3>
                                                <p className="text-xs text-slate-400 line-clamp-2 mb-4">{svc.description}</p>
                                                {svc.points?.length > 0 && <p className="text-[10px] text-slate-500 mb-4">{svc.points.length} feature point(s)</p>}
                                                <div className="flex gap-2">
                                                    <button onClick={() => editService(svc)}
                                                        className="flex-1 flex items-center justify-center gap-2 bg-slate-800 text-slate-300 py-2.5 rounded-xl text-sm font-bold hover:bg-slate-700 transition-colors">
                                                        <Edit2 size={14} /> Edit
                                                    </button>
                                                    <button onClick={() => deleteService(svc.id)}
                                                        className="flex items-center justify-center p-2.5 bg-red-900/30 text-red-400 rounded-xl hover:bg-red-900/60 transition-colors">
                                                        <Trash2 size={16} />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                    </motion.div>
                )}
                {/* ---- PURCHASES TAB ---- */}
                {activeTab === 'purchases' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                                    <WalletCards className="text-green-500" /> Customer Purchases
                                </h2>
                                <p className="text-slate-400 text-sm mt-1">Every payment recorded from your website — linked to customer accounts.</p>
                            </div>
                            <button onClick={fetchData} className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-all font-bold text-sm">
                                <RefreshCcw size={16} /> Refresh
                            </button>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <StatCard icon={<WalletCards className="text-green-500" />} label="Total Sales" value={purchases.length} />
                            <StatCard icon={<FileText className="text-blue-500" />} label="Total Revenue" value={`R${purchases.reduce((sum, p) => sum + (Number(p.amount) || 0), 0).toLocaleString('en-ZA')}`} />
                            <StatCard icon={<Users className="text-purple-500" />} label="Unique Buyers" value={new Set(purchases.map(p => p.user_id).filter(Boolean)).size} />
                        </div>

                        {/* Purchases Table */}
                        <div className="bg-slate-900 rounded-3xl border border-slate-700 overflow-hidden shadow-sm overflow-x-auto">
                            <table className="w-full text-left min-w-[700px]">
                                <thead className="bg-[#020617] border-b border-slate-700">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Date</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Client</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Description</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400 text-right">Amount</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400 text-center">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Reference</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {loading ? (
                                        <tr><td colSpan="6" className="px-6 py-12 text-center text-slate-400">Loading purchases...</td></tr>
                                    ) : purchases.length === 0 ? (
                                        <tr>
                                            <td colSpan="6" className="px-6 py-16 text-center">
                                                <WalletCards size={40} className="mx-auto mb-4 text-slate-600" />
                                                <p className="text-slate-400 font-bold">No purchases yet</p>
                                                <p className="text-slate-500 text-sm mt-1">Purchases will appear here after customers pay.</p>
                                                <p className="text-slate-600 text-xs mt-2">Make sure you ran the purchases SQL in Supabase.</p>
                                            </td>
                                        </tr>
                                    ) : purchases.map(purchase => (
                                        <tr key={purchase.id} className="hover:bg-slate-800/40 transition-colors">
                                            <td className="px-6 py-4 text-sm text-slate-400 whitespace-nowrap">
                                                {new Date(purchase.created_at).toLocaleDateString('en-ZA', { day: 'numeric', month: 'short', year: 'numeric' })}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="flex items-center gap-3">
                                                    <div className="h-9 w-9 rounded-full bg-slate-800 border border-slate-700 flex items-center justify-center text-slate-400 shrink-0">
                                                        <Users size={16} />
                                                    </div>
                                                    <div>
                                                        <div className="font-bold text-white text-sm">{purchase.profile?.full_name || 'Guest'}</div>
                                                        <div className="text-xs text-slate-500">@{purchase.profile?.username || 'unknown'}</div>
                                                        {purchase.profile?.email && <div className="text-[10px] text-slate-600">{purchase.profile.email}</div>}
                                                    </div>
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-white">{purchase.description}</td>
                                            <td className="px-6 py-4 text-right">
                                                <span className="font-black text-white text-base">R{Number(purchase.amount).toLocaleString('en-ZA')}</span>
                                            </td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                    purchase.status === 'success' ? "bg-green-900/40 text-green-400 border border-green-500/20" : "bg-amber-900/40 text-amber-400 border border-amber-500/20"
                                                )}>
                                                    {purchase.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="font-mono text-xs text-slate-500">{purchase.reference?.substring(0, 20)}…</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

                {/* ---- MONITORING TAB ---- */}
                {activeTab === 'monitoring' && (
                    <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="space-y-8">
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                            <div>
                                <h2 className="text-3xl font-bold tracking-tight flex items-center gap-3">
                                    <Activity className="text-blue-500" /> Financial Monitoring
                                </h2>
                                <p className="text-slate-400 text-sm mt-1">Real-time status of all financial document uploads and AI processing.</p>
                            </div>
                            <button onClick={fetchData} className="flex items-center gap-2 px-5 py-3 rounded-2xl border border-slate-700 text-slate-300 hover:text-white hover:border-slate-500 transition-all font-bold text-sm">
                                <RefreshCcw size={16} /> Refresh
                            </button>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                            <StatCard icon={<Upload className="text-blue-500" />} label="Total Uploads" value={financialUploads.length} />
                            <StatCard icon={<CheckCircle2 className="text-green-500" />} label="Completed" value={financialUploads.filter(u => u.status === 'completed').length} />
                            <StatCard icon={<AlertCircle className="text-amber-500" />} label="Processing/Pending" value={financialUploads.filter(u => u.status !== 'completed' && u.status !== 'error').length} />
                        </div>

                        <div className="bg-slate-900 rounded-3xl border border-slate-700 overflow-hidden shadow-sm overflow-x-auto">
                            <table className="w-full text-left min-w-[700px]">
                                <thead className="bg-[#020617] border-b border-slate-700">
                                    <tr>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Date</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Client</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Filename</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400 text-center">Status</th>
                                        <th className="px-6 py-4 text-xs font-bold uppercase tracking-widest text-slate-400">Type</th>
                                    </tr>
                                </thead>
                                <tbody className="divide-y divide-slate-800">
                                    {financialUploads.length === 0 ? (
                                        <tr><td colSpan="5" className="px-6 py-12 text-center text-slate-500">No financial uploads found.</td></tr>
                                    ) : financialUploads.map(upload => (
                                        <tr key={upload.id} className="hover:bg-slate-800/40 transition-colors">
                                            <td className="px-6 py-4 text-sm text-slate-400">
                                                {new Date(upload.created_at).toLocaleDateString('en-ZA')}
                                            </td>
                                            <td className="px-6 py-4">
                                                <div className="font-bold text-white text-sm">{upload.profiles?.full_name || 'Guest'}</div>
                                                <div className="text-[10px] text-slate-500">@{upload.profiles?.username || 'unknown'}</div>
                                            </td>
                                            <td className="px-6 py-4 text-sm font-semibold text-white max-w-[200px] truncate">{upload.filename}</td>
                                            <td className="px-6 py-4 text-center">
                                                <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                                    upload.status === 'completed' ? "bg-green-900/40 text-green-400 border border-green-500/20" :
                                                        upload.status === 'error' ? "bg-red-900/40 text-red-400 border border-red-500/20" :
                                                            "bg-blue-900/40 text-blue-400 border border-blue-500/20"
                                                )}>
                                                    {upload.status}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4">
                                                <span className="text-[10px] font-black uppercase tracking-widest text-slate-500 px-2 py-1 bg-slate-800 rounded border border-slate-700">{upload.file_type}</span>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        </div>
                    </motion.div>
                )}

            </main>

            {/* ---- SERVICE MODAL ---- */}
            <AnimatePresence>
                {showServiceModal && (
                    <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-sm p-4 overflow-y-auto">
                        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.95 }}
                            className="bg-slate-900 rounded-[2.5rem] shadow-2xl w-full max-w-2xl my-8 overflow-hidden border border-slate-700">
                            <div className="p-6 md:p-8 flex items-center justify-between border-b border-slate-800 bg-[#020617]/50">
                                <h3 className="text-2xl font-bold">{editingServiceId ? 'Edit Service' : 'New Service'}</h3>
                                <button onClick={() => setShowServiceModal(false)} className="p-2 bg-slate-800 rounded-full hover:bg-slate-700 transition-colors"><X size={20} /></button>
                            </div>
                            <form onSubmit={handleServiceSubmit} className="p-6 md:p-8 space-y-6 overflow-y-auto max-h-[75vh] custom-scrollbar">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Service Title *</label>
                                        <input required className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-[#020617] focus:border-blue-500 focus:outline-none text-white"
                                            value={serviceForm.title} onChange={e => setServiceForm({ ...serviceForm, title: e.target.value })} placeholder="e.g. Custom Software Systems" />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Icon Name</label>
                                        <select className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-[#020617] focus:border-blue-500 focus:outline-none text-white"
                                            value={serviceForm.icon} onChange={e => setServiceForm({ ...serviceForm, icon: e.target.value })}>
                                            <option value="Code2">Code2 (Software)</option>
                                            <option value="ShieldCheck">ShieldCheck (Security/Voting)</option>
                                            <option value="Image">Image (Design)</option>
                                            <option value="Palette">Palette (Logo/Brand)</option>
                                            <option value="Globe">Globe (Web)</option>
                                            <option value="Cpu">Cpu (AI/Tech)</option>
                                            <option value="Zap">Zap (Fast/Deploy)</option>
                                            <option value="Bot">Bot (AI)</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Description *</label>
                                    <textarea required rows={3} className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-[#020617] focus:border-blue-500 focus:outline-none resize-none text-white"
                                        value={serviceForm.description} onChange={e => setServiceForm({ ...serviceForm, description: e.target.value })} placeholder="Brief description of the service..." />
                                </div>
                                <div>
                                    <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Feature Points (one per line)</label>
                                    <textarea rows={5} className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-[#020617] focus:border-blue-500 focus:outline-none resize-none text-white font-mono text-sm"
                                        value={serviceForm.points} onChange={e => setServiceForm({ ...serviceForm, points: e.target.value })}
                                        placeholder={"Staff management systems\nOrder tracking systems\nAdmin dashboards"} />
                                </div>
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">WhatsApp Message</label>
                                        <input className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-[#020617] focus:border-blue-500 focus:outline-none text-white"
                                            value={serviceForm.whatsapp_msg} onChange={e => setServiceForm({ ...serviceForm, whatsapp_msg: e.target.value })} placeholder="Hello, I want this service." />
                                    </div>
                                    <div>
                                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-400 mb-2">Display Order</label>
                                        <input type="number" className="w-full px-4 py-3 rounded-xl border border-slate-700 bg-[#020617] focus:border-blue-500 focus:outline-none text-white"
                                            value={serviceForm.display_order} onChange={e => setServiceForm({ ...serviceForm, display_order: e.target.value })} />
                                    </div>
                                </div>
                                <ImageUploadField label="Service Cover Image (Optional)" value={serviceForm.cover_image} onChange={url => setServiceForm({ ...serviceForm, cover_image: url })} />
                                <div className="pt-4 border-t border-slate-800 flex flex-col sm:flex-row justify-end gap-3">
                                    <button type="button" onClick={() => setShowServiceModal(false)} className="px-6 py-3 font-bold text-slate-400 hover:text-white transition-colors">Cancel</button>
                                    <button type="submit" className="px-8 py-3 bg-blue-600 text-white font-bold rounded-xl shadow-md hover:bg-blue-500 transition-colors active:scale-95">Save Service</button>
                                </div>
                            </form>
                        </motion.div>
                    </div>
                )}
            </AnimatePresence>
        </div>
    );
}

function StatCard({ icon, label, value }) {
    return (
        <div className="p-8 rounded-[2.5rem] border border-slate-700 bg-slate-900 shadow hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-4">
                <div className="h-12 w-12 rounded-2xl bg-[#020617] flex items-center justify-center">{icon}</div>
                <div className="text-sm font-bold text-slate-400 uppercase tracking-widest">{label}</div>
            </div>
            <div className="text-4xl font-black text-white tracking-tight">{value}</div>
        </div>
    );
}
