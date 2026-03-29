import React, { useMemo, useState, useEffect, useRef } from "react";
import { Routes, Route, Link, useNavigate } from "react-router-dom";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { LCX_LOGO_B64 } from "./assets/logo-b64";
import { supabase } from "./lib/supabase";
import Auth from "./components/Auth";
import Account from "./components/Account";
import Admin from "./components/Admin";
import YocoPayButton from "./components/YocoPayButton";
import {
    ArrowRight,
    BadgeCheck,
    Building2,
    CheckCircle2,
    ChevronRight,
    Code2,
    Cpu,
    ShieldCheck,
    Globe,
    Image as ImageIcon,
    LayoutDashboard,
    Mail,
    Menu,
    MessageCircle,
    Palette,
    Phone,
    Send,
    Sparkles,
    Star,
    User,
    WalletCards,
    Workflow,
    X,
    Zap,
} from "lucide-react";

const WHATSAPP_NUMBER = "27678846390";
const EMAIL = "hello@lcxstudios.co";

// --- ANIMATION VARIANTS (LUXURY FEEL) ---
const luxuryEase = [0.16, 1, 0.3, 1];

const fadeUpVariant = {
    hidden: { opacity: 0, y: 40 },
    visible: { opacity: 1, y: 0, transition: { duration: 1, ease: luxuryEase } }
};

const staggerContainer = {
    hidden: { opacity: 0 },
    visible: {
        opacity: 1,
        transition: { staggerChildren: 0.1, delayChildren: 0.1 }
    }
};

const navItems = [
    { label: "Home", href: "/" },
    { label: "Services", href: "/services" },
    { label: "Pricing", href: "/pricing" },
    { label: "About", href: "/about" },
    { label: "Contact", href: "/contact" },
];

const serviceCards = [
    {
        icon: Code2,
        title: "Custom Internal Software Systems",
        desc: "Premium internal tools for staff, orders, finance, inventory, operations, and business control.",
        cover_image: "/images/software-dashboard.png",
        points: [
            "Staff management systems",
            "Order tracking systems",
            "Admin dashboards",
            "Finance/payment systems",
            "Customer management systems",
            "Inventory & operations systems",
        ],
        whatsapp: "Hello, I want a custom internal software system.",
    },
    {
        icon: ShieldCheck,
        title: "Pageantry Voting Systems",
        desc: "High-conversion online voting systems for pageants and events with public pages, rankings, and admin control.",
        cover_image: "/images/voting-system.png",
        points: [
            "Public voting pages",
            "Contestant profiles",
            "Rankings and gallery",
            "Admin dashboard",
            "Analytics and portals",
            "Source code handover",
        ],
        whatsapp: "Hello, I want a pageantry voting system.",
    },
    {
        icon: ImageIcon,
        title: "Poster Design Services",
        desc: "Luxury poster design for pageants, modelling shows, entries opens, finalists, semi-finalists, and grand finale campaigns.",
        cover_image: "/images/poster-design.png",
        points: [
            "Finalist posters",
            "Semi-finalist posters",
            "Entries open posters",
            "Grand finale posters",
            "Custom event visuals",
            "Creative direction",
        ],
        whatsapp: "Hello, I want poster design services.",
    },
    {
        icon: Palette,
        title: "Logo Design Services",
        desc: "Modern logo systems and premium visual identity design for brands, events, creators, and businesses.",
        cover_image: "/images/logo-design.png",
        points: [
            "Brand logos",
            "Event logos",
            "Premium concepts",
            "Visual identity direction",
            "Modern company marks",
            "High-end brand feel",
        ],
        whatsapp: "Hello, I want logo design services.",
    }
];

const posterPricing = [
    {
        title: "Finalist Posters",
        price: "R45",
        note: "per poster",
        extra: "Above 30 posters: every poster after the first 30 costs R35 each.",
    },
    {
        title: "Semi-Finalist Posters",
        price: "R25",
        note: "per poster",
        extra: "Above 30 posters: every poster after the first 30 costs R15 each.",
    },
    {
        title: "Entries Open Poster",
        price: "R300",
        note: "once-off",
        extra: "Custom-made according to client specification.",
    },
    {
        title: "Grand Finale Poster",
        price: "R450",
        note: "once-off",
        extra: "Premium event poster with polished creative direction.",
    },
];

const votingPackages = [
    {
        name: "Voting Only Package",
        price: "R45,000",
        support: "2 months service support/control",
        whatsapp: "Hello, I’m interested in your Voting Only Package.",
        featured: false,
        features: [
            "Public voting page",
            "Contestant profiles",
            "Gallery page",
            "Rankings page",
            "Admin dashboard for contestants and gallery updates",
            "No analytics page",
            "No login/register portal",
            "No ticketing",
            "No advanced client portal",
            "Client receives the full source code",
        ],
    },
    {
        name: "Full Voting System",
        price: "R100,000",
        support: "1 year service support/control",
        whatsapp: "Hello, I’m interested in the Full Voting System.",
        featured: true,
        features: [
            "Everything in Voting Only",
            "Full analytics/dashboard",
            "Advanced admin controls",
            "Login and registration",
            "Client portal",
            "Additional advanced features",
            "Scalable full system",
            "Client receives the full source code",
        ],
    },
];

const digitalBusinessPackages = [
    {
        name: "Startup Website Package",
        price: "R6,000 – R12,000",
        bestFor: "Startups, small shops, personal brands, and small service businesses.",
        delivery: "7–10 days",
        whatsapp: "Hello, I’m interested in your Startup Website Package.",
        featured: false,
        features: [
            "4–6 page professional website",
            "Mobile responsive design",
            "Contact form",
            "Google Maps integration",
            "WhatsApp chat button",
            "Basic SEO setup",
            "Social media links"
        ],
        pages: ["Home", "About", "Services", "Contact", "Gallery"]
    },
    {
        name: "Business Website Package",
        price: "R15,000 – R30,000",
        bestFor: "Growing businesses that need a professional online presence.",
        delivery: "10–14 days",
        whatsapp: "Hello, I’m interested in your Business Website Package.",
        featured: true,
        features: [
            "6–10 page professional website",
            "Mobile optimized design",
            "Contact forms and lead capture",
            "WhatsApp integration",
            "Basic SEO optimization",
            "Blog/news section",
            "Admin panel for content updates",
            "Google Analytics integration"
        ],
        addons: ["Online booking system"]
    },
    {
        name: "E-Commerce Website Package",
        price: "R30,000 – R60,000",
        bestFor: "Businesses selling products online.",
        delivery: "2–3 weeks",
        whatsapp: "Hello, I’m interested in your E-Commerce Website Package.",
        featured: false,
        features: [
            "Full online store",
            "Product catalog management",
            "Secure payment gateway integration (Paystack / Yoco / PayFast)",
            "Shopping cart and checkout system",
            "Order management dashboard",
            "Customer accounts",
            "Inventory tracking",
            "Mobile optimized store"
        ]
    },
    {
        name: "Advanced Business System + Website",
        price: "R55,000 – R100,000",
        bestFor: "Businesses needing internal systems + website integration.",
        delivery: "3–5 weeks",
        whatsapp: "Hello, I’m interested in your Advanced Business System + Website package.",
        featured: true,
        features: [
            "Custom website design (Mobile responsive & SEO optimized)",
            "Contact forms and lead capture",
            "Employee portal & HR leave request system",
            "Sick note submission portal",
            "Admin approval dashboard",
            "Payroll creation system & Employee records management",
            "Financial Verification (Bank statements, Payment search & history)",
            "Admin Dashboard (Staff activity logs, HR requests, Financial reports)"
        ]
    }
];


const rentalPackages = [
    {
        name: "1 Month Rental",
        price: "R6,000",
        desc: "Includes custom domain & hosting for 1 month.",
        whatsapp: "Hello, I want to rent the voting system for 1 month.",
    },
    {
        name: "3 Months Rental",
        price: "R8,000",
        desc: "Includes custom domain & hosting for 3 months.",
        whatsapp: "Hello, I want to rent the voting system for 3 months.",
    },
    {
        name: "6 Months Rental",
        price: "R10,000",
        desc: "Includes custom domain & hosting for 6 months.",
        whatsapp: "Hello, I want to rent the voting system for 6 months.",
    },
    {
        name: "1 Year Rental",
        price: "R15,000",
        desc: "Includes custom domain & hosting for 12 months.",
        whatsapp: "Hello, I want to rent the voting system for 12 months.",
    },
];

const buyOptions = [
    {
        title: "Custom Internal Software",
        price: "Custom Quote",
        description: "For businesses that need dashboards, operations systems, finance tools, or internal workflows.",
        cta: "Request a System",
        message: "Hello, I want a custom internal software system.",
    },
    {
        title: "Voting Only Package",
        price: "R45,000",
        description: "A streamlined pageant voting platform with essential public pages and admin updates.",
        cta: "Buy This Package",
        message: "Hello, I’m interested in your Voting Only Package.",
    },
    {
        title: "Full Voting System",
        price: "R100,000",
        description: "A scalable full-featured voting system with analytics, client portal, and advanced controls.",
        cta: "Buy This Package",
        message: "Hello, I’m interested in the Full Voting System.",
    },
];

function cn(...classes) {
    return classes.filter(Boolean).join(" ");
}

function createWhatsAppLink(message) {
    return `https://wa.me/${WHATSAPP_NUMBER}?text=${encodeURIComponent(message)}`;
}


function SectionHeading({ eyebrow, title, description, center, theme = 'light' }) {
    return (
        <div className={cn("max-w-3xl mb-12 sm:mb-20", center && "mx-auto text-center")}>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                className={cn(
                    "mb-4 inline-flex items-center rounded-full px-4 py-1.5 text-[10px] font-black uppercase tracking-[0.3em] shadow-sm",
                    theme === 'dark' ? "bg-blue-500/10 text-blue-400 border border-blue-500/20" : "bg-cyan-50 text-cyan-600 border border-cyan-100"
                )}
            >
                {eyebrow}
            </motion.div>
            <motion.h2
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className={cn(
                    "text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl",
                    theme === 'dark' ? "text-white" : "text-slate-950"
                )}
            >
                {title}
            </motion.h2>
            {description && (
                <motion.p
                    initial={{ opacity: 0, y: 20 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.2 }}
                    className={cn(
                        "mt-6 text-base leading-8 sm:text-lg",
                        theme === 'dark' ? "text-slate-400" : "text-slate-600"
                    )}
                >
                    {description}
                </motion.p>
            )}
        </div>
    );
}

function TopNav({ session, onPortalClick }) {
    const [open, setOpen] = useState(false);
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        const handleScroll = () => setScrolled(window.scrollY > 50);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    return (
        <header className={cn(
            "fixed top-0 z-50 w-full transition-all duration-500",
            scrolled ? "bg-white/40 border-b border-slate-200/50 py-3 sm:py-4 backdrop-blur-3xl shadow-lg" : "bg-transparent py-6 sm:py-8"
        )}>
            <div className="mx-auto flex max-w-7xl items-center justify-between px-6 lg:px-8">
                <Link to="/" className="flex items-center gap-4 transition-transform hover:scale-105 active:scale-95">
                    <div className="relative flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200/50 bg-white/40 backdrop-blur-md shadow-sm overflow-hidden p-1.5">
                        <img src="/logo.png" alt="LCX Logo" className="h-full w-full object-contain" />
                    </div>
                </Link>

                <nav className="hidden items-center gap-10 md:flex">
                    {navItems.map((item) => (
                        <Link key={item.href} to={item.href} className="text-xs font-black uppercase tracking-[0.2em] text-slate-500 transition hover:text-slate-950">
                            {item.label}
                        </Link>
                    ))}
                </nav>

                <div className="flex items-center gap-4">
                    <button
                        onClick={onPortalClick}
                        className="hidden items-center gap-2 rounded-full border border-slate-200/50 bg-white/40 backdrop-blur-md px-6 py-3 text-[10px] font-black uppercase tracking-widest text-slate-950 transition hover:bg-white/60 md:inline-flex shadow-sm hover:shadow-md active:scale-95"
                    >
                        {session ? <LayoutDashboard className="h-4 w-4" /> : <User className="h-4 w-4" />}
                        {session ? "Portal" : "Join Platform"}
                    </button>

                    <button
                        onClick={() => setOpen(!open)}
                        className="flex h-12 w-12 items-center justify-center rounded-2xl border border-slate-200/50 bg-white/40 backdrop-blur-md text-slate-950 transition hover:bg-white/60 md:hidden shadow-sm"
                    >
                        {open ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
                    </button>
                </div>
            </div>

            <AnimatePresence>
                {open && (
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0, y: -20 }}
                        className="absolute inset-x-0 top-full mt-4 mx-4 overflow-hidden rounded-[2.5rem] border border-slate-200 bg-white/95 p-8 shadow-2xl backdrop-blur-2xl md:hidden"
                    >
                        <div className="flex flex-col gap-8">
                            {navItems.map((item) => (
                                <Link key={item.href} to={item.href} onClick={() => setOpen(false)} className="text-sm font-black uppercase tracking-widest text-slate-500 transition hover:text-slate-950">
                                    {item.label}
                                </Link>
                            ))}
                            <button
                                onClick={() => { setOpen(false); onPortalClick(); }}
                                className="flex items-center justify-center gap-2 rounded-3xl bg-slate-950 py-5 text-xs font-black uppercase tracking-widest text-white transition hover:bg-slate-800 shadow-xl active:scale-95"
                            >
                                {session ? <LayoutDashboard className="h-5 w-5" /> : <User className="h-5 w-5" />}
                                {session ? "Access Portal" : "Get Started"}
                            </button>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </header>
    );
}

function Hero() {
    const { scrollY } = useScroll();
    const y1 = useTransform(scrollY, [0, 500], [0, 200]);
    const opacity = useTransform(scrollY, [0, 300], [1, 0]);

    return (
        <section id="home" className="relative min-h-screen overflow-hidden lg:flex lg:items-center bg-white">
            {/* Elite Background */}
            <div className="absolute inset-0 z-0">
                <div className="absolute inset-0 bg-[#f8fafc]" />
                <div className="absolute inset-0 opacity-[0.03] [background-image:radial-gradient(#0f172a_1.5px,transparent_1.5px)] [background-size:40px_40px]" />
                <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-slate-200 to-transparent" />
            </div>

            <div className="relative z-10 mx-auto grid max-w-7xl gap-12 px-6 sm:px-12 py-16 sm:py-32 lg:grid-cols-[1.1fr_0.9fr] lg:px-8">
                <motion.div style={{ opacity }} className="flex flex-col justify-center">
                    <motion.div
                        variants={fadeUpVariant}
                        initial="hidden"
                        animate="visible"
                        className="mb-8 inline-flex items-center gap-3 rounded-full border border-slate-200/50 bg-white/40 backdrop-blur-md px-5 py-2.5 text-[10px] font-black uppercase tracking-[0.4em] text-slate-950 shadow-sm w-fit"
                    >
                        <div className="relative flex h-2 w-2">
                            <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-blue-500 opacity-75"></span>
                            <span className="relative inline-flex h-2 w-2 rounded-full bg-blue-500"></span>
                        </div>
                        Premium Technology Studio
                    </motion.div>

                    <h1
                        variants={fadeUpVariant}
                        initial="hidden"
                        animate="visible"
                        className="text-3xl font-black tracking-tighter text-slate-950 sm:text-5xl md:text-7xl lg:text-8xl leading-[1.05]"
                    >
                        Crafting <span className="text-blue-600">elite</span> digital systems.
                    </h1>

                    <motion.p
                        variants={fadeUpVariant}
                        initial="hidden"
                        animate="visible"
                        className="mt-10 max-w-2xl text-lg font-medium leading-[1.6] text-slate-500 sm:text-xl"
                    >
                        LCX STUDIOS is a next-gen technology house specialized in custom internal software,
                        SaaS architecture, and high-performance pageant voting systems.
                    </motion.p>

                    <motion.div
                        variants={fadeUpVariant}
                        initial="hidden"
                        animate="visible"
                        className="mt-12 flex flex-col sm:flex-row flex-wrap gap-6"
                    >
                        <Link to="/services" className="group relative overflow-hidden rounded-full bg-slate-950 px-10 py-5 text-xs font-black uppercase tracking-widest text-white transition-all hover:scale-105 hover:shadow-[0_20px_40px_rgba(15,23,42,0.2)] active:scale-95 text-center w-full sm:w-auto">
                            Explore Services
                        </Link>
                        <Link to="/pricing" className="rounded-full border border-slate-200 bg-white px-10 py-5 text-xs font-black uppercase tracking-widest text-slate-950 transition-all hover:bg-slate-50 hover:border-slate-300 active:scale-95 text-center w-full sm:w-auto">
                            View Pricing
                        </Link>
                    </motion.div>

                    <motion.div
                        variants={fadeUpVariant}
                        initial="hidden"
                        animate="visible"
                        className="mt-20 grid grid-cols-2 gap-8 border-t border-slate-100 pt-12 sm:grid-cols-4"
                    >
                        {[
                            { val: "100%", label: "Custom Code" },
                            { val: "24/7", label: "Studio Support" },
                            { val: "SaaS", label: "Architecture" },
                            { val: "Premium", label: "UI Design" },
                        ].map((stat) => (
                            <div key={stat.label}>
                                <div className="text-2xl font-black text-slate-950 tracking-tight">{stat.val}</div>
                                <div className="mt-1 text-[10px] font-bold uppercase tracking-widest text-slate-400">{stat.label}</div>
                            </div>
                        ))}
                    </motion.div>
                </motion.div>

                <motion.div
                    style={{ y: y1 }}
                    initial={{ opacity: 0, scale: 0.9, rotate: -2 }}
                    animate={{ opacity: 1, scale: 1, rotate: 0 }}
                    transition={{ duration: 1.5, ease: luxuryEase }}
                    className="relative flex items-center justify-center lg:block order-first lg:order-none mb-12 lg:mb-0"
                >
                    <div className="absolute -inset-20 bg-blue-500/5 blur-[120px] rounded-full" />
                    <div className="relative group">
                        <motion.div
                            animate={{
                                y: [0, -25, 0],
                                rotateY: [0, 8, 0],
                            }}
                            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
                            className="relative z-10 flex h-[200px] w-[200px] sm:h-[400px] sm:w-[400px] lg:h-[520px] lg:w-[520px] items-center justify-center rounded-[3rem] sm:rounded-[4rem] border border-slate-200/50 bg-white/40 backdrop-blur-3xl p-8 sm:p-12 shadow-[0_40px_100px_rgba(0,0,0,0.08)] transition-all group-hover:border-slate-300 group-hover:shadow-[0_60px_120px_rgba(0,0,0,0.12)]"
                        >
                            <img
                                src="/logo.png"
                                alt="LCX Studio Large Logo"
                                className="h-full w-full object-contain filter drop-shadow-[0_20px_40px_rgba(0,0,0,0.1)] transition-transform duration-700 group-hover:scale-110"
                            />
                        </motion.div>
                    </div>
                </motion.div>
            </div>
        </section>
    );
}

function About() {
    return (
        <section id="about" className="relative bg-[#020617] py-32 overflow-hidden">
            <div className="absolute inset-0 opacity-20">
                <div className="absolute inset-x-0 top-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
                <div className="absolute bottom-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-blue-500/50 to-transparent" />
            </div>

            <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid gap-20 lg:grid-cols-2 lg:items-center">
                    <motion.div
                        variants={staggerContainer}
                        initial="hidden"
                        whileInView="visible"
                        viewport={{ once: true }}
                        className="space-y-10"
                    >
                        <motion.div
                            variants={fadeUpVariant}
                            className="inline-flex items-center gap-3 rounded-full border border-blue-500/30 bg-blue-500/10 px-5 py-2 text-[10px] font-black uppercase tracking-[0.3em] text-blue-400"
                        >
                            Visionary Logic
                        </motion.div>
                        <motion.h2
                            variants={fadeUpVariant}
                            className="text-4xl font-black tracking-tighter text-white sm:text-6xl lg:text-7xl leading-[1.05]"
                        >
                            Propelling business into the <span className="text-blue-500">future</span>.
                        </motion.h2>
                        <motion.p
                            variants={fadeUpVariant}
                            className="text-lg font-medium leading-relaxed text-slate-400 max-w-xl"
                        >
                            LCX STUDIOS is an elite digital engineering studio. We combine high-performance code with world-class design to build systems that define current industry standards.
                        </motion.p>
                    </motion.div>

                    <div className="grid gap-6 sm:grid-cols-2">
                        {[
                            {
                                icon: Zap,
                                title: "Elite Execution",
                                text: "Ultra-fast deployment cycles built on robust, scalable modern frameworks.",
                            },
                            {
                                icon: ShieldCheck,
                                title: "High Security",
                                text: "Business-grade security measures for every line of code we ship.",
                            },
                            {
                                icon: Globe,
                                title: "Global Reach",
                                text: "Architectures designed for international scale and high-traffic reliability.",
                            },
                            {
                                icon: Cpu,
                                title: "Advanced Tech",
                                text: "Utilizing modern AI and cloud infrastructure for superior performance.",
                            },
                        ].map((item, id) => (
                            <motion.div
                                key={id}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: id * 0.1, ease: luxuryEase }}
                                className="group relative rounded-[2.5rem] border border-slate-800 bg-slate-900/50 p-8 transition-all hover:bg-slate-800/80 hover:border-slate-700 hover:-translate-y-2 shadow-2xl"
                            >
                                <div className="mb-6 inline-flex h-14 w-14 items-center justify-center rounded-2xl bg-blue-600/10 text-blue-500 group-hover:scale-110 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
                                    <item.icon className="h-7 w-7" />
                                </div>
                                <h3 className="text-xl font-bold text-white tracking-tight">{item.title}</h3>
                                <p className="mt-3 text-sm font-medium text-slate-400 leading-relaxed">{item.text}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
}

// --- ICON MAPPING for dynamic services ---
const ICON_MAP = {
    Code2, ShieldCheck, Globe, Palette, Cpu, Zap,
    Image: ImageIcon,
};

function Services() {
    const navigate = useNavigate();
    const [cards, setCards] = useState(serviceCards); // fallback to hardcoded

    useEffect(() => {
        const fetchServices = async () => {
            const { data, error } = await supabase
                .from('services')
                .select('*')
                .order('display_order', { ascending: true });
            if (!error && data && data.length > 0) {
                setCards(data.map(s => ({
                    icon: ICON_MAP[s.icon] || Code2,
                    title: s.title,
                    desc: s.description,
                    points: s.points || [],
                    whatsapp: s.whatsapp_msg || `Hello, I want ${s.title}.`,
                    cover_image: s.cover_image || null,
                    link: s.link || null,
                })));
            }
        };
        fetchServices();
    }, []);

    return (
        <section id="services" className="relative bg-slate-50 py-32 overflow-hidden">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <SectionHeading
                    eyebrow="Capabilities"
                    title="Engineered for excellence."
                    description="Our studio specializes in the architecture of complex digital systems and high-end brand identities."
                    center
                />

                <div className="mt-20 grid gap-10 lg:grid-cols-2">
                    {cards.map((service, i) => {
                        const IconComp = service.icon;
                        return (
                            <motion.div
                                key={service.title}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: i * 0.1, ease: luxuryEase }}
                                className="group relative rounded-[3rem] p-1 sm:p-1.5 transition-all hover:shadow-[0_40px_80px_rgba(0,0,0,0.06)]"
                            >
                                <div className="relative overflow-hidden rounded-[2.8rem] bg-white/40 border border-slate-200/50 p-8 sm:p-12 h-full backdrop-blur-3xl shadow-xl transition-all group-hover:bg-white/60 group-hover:border-slate-300">
                                    {/* Service cover image if available */}
                                    {service.cover_image && (
                                        <div className="mb-8 -mx-8 sm:-mx-12 -mt-8 sm:-mt-12 h-48 overflow-hidden rounded-t-[2.4rem]">
                                            <img src={service.cover_image} alt={service.title} className="w-full h-full object-cover" />
                                        </div>
                                    )}
                                    <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-8">
                                        <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-600 text-white shadow-xl shadow-blue-600/20">
                                            {IconComp && <IconComp className="h-8 w-8" />}
                                        </div>
                                        {service.link ? (
                                            <button
                                                onClick={() => navigate(service.link)}
                                                className="rounded-full border border-slate-200/50 bg-blue-600 px-8 py-3 text-[10px] font-black uppercase tracking-widest text-white transition-all hover:bg-blue-700 active:scale-95 shadow-sm inline-flex items-center justify-center gap-2"
                                            >
                                                Open Dashboard <ArrowRight className="h-4 w-4" />
                                            </button>
                                        ) : (
                                            <a
                                                href={createWhatsAppLink(service.whatsapp)}
                                                target="_blank"
                                                rel="noreferrer"
                                                className="rounded-full border border-slate-200/50 bg-white/40 backdrop-blur-md px-8 py-3 text-[10px] font-black uppercase tracking-widest text-slate-950 transition-all hover:bg-slate-950 hover:text-white active:scale-95 shadow-sm inline-flex items-center justify-center"
                                            >
                                                Enquire Now
                                            </a>
                                        )}
                                    </div>

                                    <h3 className="mt-10 text-3xl font-black text-slate-950 tracking-tighter">{service.title}</h3>
                                    <p className="mt-6 text-base font-medium text-slate-500 leading-relaxed">
                                        {service.desc}
                                    </p>

                                    {service.points && service.points.length > 0 && (
                                        <div className="mt-12 grid gap-4 sm:grid-cols-2">
                                            {service.points.map((point) => (
                                                <div key={point} className="flex items-center gap-3 rounded-2xl border border-slate-100 bg-slate-50/50 px-5 py-4 text-xs font-bold text-slate-700">
                                                    <div className="flex h-5 w-5 items-center justify-center rounded-full bg-blue-600/10 text-blue-600">
                                                        <BadgeCheck className="h-4 w-4" />
                                                    </div>
                                                    {point}
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

function PricingCards() {
    return (
        <section id="pricing" className="bg-white py-32 relative overflow-hidden">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">

                {/* ---- RENTAL TIER ---- */}
                <div className="mb-40">
                    <SectionHeading
                        eyebrow="Rental Ecosystem"
                        title="Scalable Rental Options"
                        description="Professional voting systems available for rent with full hosting and management included."
                        center
                    />
                    <div className="mt-16 grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
                        {rentalPackages.map((pkg, i) => {
                            const amountInCents = parseInt(pkg.price.replace(/[^0-9]/g, ''), 10) * 100;
                            const waMsg = `Hello LCX STUDIOS. I have just paid ${pkg.price} to reserve the ${pkg.name}. Please confirm my rental.`;
                            return (
                                <motion.div
                                    key={pkg.name}
                                    initial={{ opacity: 0, y: 30 }}
                                    whileInView={{ opacity: 1, y: 0 }}
                                    viewport={{ once: true }}
                                    transition={{ duration: 0.8, delay: i * 0.1, ease: luxuryEase }}
                                    className="group rounded-[2.5rem] border border-slate-200/50 bg-white/30 p-10 backdrop-blur-3xl transition-all hover:bg-white/60 hover:shadow-2xl hover:border-blue-200 flex flex-col h-full shadow-lg"
                                >
                                    <h4 className="text-sm font-black uppercase tracking-widest text-slate-400">{pkg.name}</h4>
                                    <div className="mt-4 text-4xl font-black text-slate-950 tracking-tight">{pkg.price}</div>
                                    <p className="mt-6 text-sm font-medium text-slate-500 leading-relaxed flex-1 mb-10">{pkg.desc}</p>
                                    <YocoPayButton
                                        amountInCents={amountInCents}
                                        description={`Rental: ${pkg.name}`}
                                        label="Reserve Now"
                                        onSuccess={() => window.open(createWhatsAppLink(waMsg), '_blank')}
                                    />
                                </motion.div>
                            );
                        })}
                    </div>
                </div>

                <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-40" />

                {/* ---- DIGITAL BUSINESS INFRASTRUCTURE TIER ---- */}
                <SectionHeading
                    eyebrow="Digital Business Infrastructure"
                    title="Digital Business Infrastructure Development"
                    description="Because businesses don’t just want a website — they want systems that run their operations."
                    center
                />

                <div className="mt-20 mb-40 grid gap-10 lg:grid-cols-2">
                    {digitalBusinessPackages.map((pkg, i) => {
                        const match = pkg.price.match(/\d+(?:,\d+)?/);
                        const amountString = match ? match[0].replace(/,/g, '') : "0";
                        const amountInCents = parseInt(amountString, 10) * 100;
                        const waMsg = `Hello LCX STUDIOS. I have just made a payment of ${pkg.price} for the ${pkg.name}. Please get in touch to get started.`;
                        return (
                            <motion.div
                                key={pkg.name}
                                initial={{ opacity: 0, scale: 0.95 }}
                                whileInView={{ opacity: 1, scale: 1 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: (i % 2) * 0.1, ease: luxuryEase }}
                                className={cn(
                                    "group relative flex flex-col rounded-[3rem] border p-6 sm:p-10 lg:p-14 transition-all hover:shadow-[0_45px_100px_rgba(0,0,0,0.08)]",
                                    pkg.featured ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200"
                                )}
                            >
                                <div className="mb-10">
                                    <h3 className={cn("text-2xl font-black tracking-tight", pkg.featured ? "text-white" : "text-slate-950")}>{pkg.name}</h3>
                                    <div className="mt-6 flex items-baseline gap-2">
                                        <span className={cn("text-3xl sm:text-4xl lg:text-5xl font-black tracking-tighter", pkg.featured ? "text-white" : "text-slate-950")}>{pkg.price}</span>
                                    </div>
                                    <div className="mt-6 flex flex-col gap-2">
                                        <div className="inline-flex max-w-full items-start sm:items-center gap-2 rounded-full bg-blue-600/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-blue-500 leading-relaxed">
                                            <Sparkles className="h-3 w-3 shrink-0 mt-0.5 sm:mt-0" />
                                            <span className="whitespace-normal text-left">Best For: {pkg.bestFor}</span>
                                        </div>
                                        <div className="inline-flex max-w-full items-start sm:items-center gap-2 rounded-full bg-emerald-500/10 px-4 py-2 text-[10px] font-black uppercase tracking-widest text-emerald-600 leading-relaxed w-fit">
                                            <Zap className="h-3 w-3 shrink-0 mt-0.5 sm:mt-0" />
                                            <span className="whitespace-normal text-left">Delivery Time: {pkg.delivery}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="mb-12 flex-1">
                                    <h4 className={cn("text-xs font-black uppercase tracking-widest mb-4", pkg.featured ? "text-slate-300" : "text-slate-400")}>Includes</h4>
                                    <ul className="space-y-4">
                                        {pkg.features.map((feature) => (
                                            <li key={feature} className="flex items-start gap-4 text-sm font-medium">
                                                <div className="mt-1 flex h-4 w-4 shrink-0 items-center justify-center rounded-full bg-blue-600/20 text-blue-500">
                                                    <CheckCircle2 className="h-2 w-2" />
                                                </div>
                                                <span className={pkg.featured ? "text-slate-400" : "text-slate-600"}>{feature}</span>
                                            </li>
                                        ))}
                                    </ul>
                                    {(pkg.pages || pkg.addons) && (
                                        <div className="mt-8">
                                            {pkg.pages && (
                                                <>
                                                    <h4 className={cn("text-xs font-black uppercase tracking-widest mb-4 mt-6", pkg.featured ? "text-slate-300" : "text-slate-400")}>Example Pages</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {pkg.pages.map(page => (
                                                            <span key={page} className={cn("text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full", pkg.featured ? "bg-white/10 text-white border border-white/20" : "bg-slate-100 text-slate-600 border border-slate-200")}>{page}</span>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                            {pkg.addons && (
                                                <>
                                                    <h4 className={cn("text-xs font-black uppercase tracking-widest mb-4 mt-6", pkg.featured ? "text-slate-300" : "text-slate-400")}>Optional Add-Ons</h4>
                                                    <div className="flex flex-wrap gap-2">
                                                        {pkg.addons.map(addon => (
                                                            <span key={addon} className={cn("text-[10px] font-black uppercase tracking-wider px-3 py-1.5 rounded-full border", pkg.featured ? "border-amber-500/30 text-amber-400 bg-amber-500/10" : "border-amber-200 text-amber-600 bg-amber-50")}>+ {addon}</span>
                                                        ))}
                                                    </div>
                                                </>
                                            )}
                                        </div>
                                    )}
                                </div>

                                <div className={pkg.featured ? "[&_button]:bg-blue-600 [&_button]:hover:bg-white [&_button]:hover:text-slate-950 [&_span]:text-slate-400 [&_img]:opacity-80" : ""}>
                                    <YocoPayButton
                                        amountInCents={amountInCents}
                                        description={`Package: ${pkg.name}`}
                                        label="Book Package"
                                        onSuccess={() => window.open(createWhatsAppLink(waMsg), '_blank')}
                                    />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>

                {/* Monthly Maintenance Plans */}
                <div className="mx-auto max-w-4xl mb-40 text-center rounded-[3rem] border border-slate-200 bg-slate-50 p-10 sm:p-14 shadow-xl">
                    <div className="inline-flex items-center gap-2 rounded-full bg-orange-500/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-orange-600 mb-6">
                        <Zap className="h-3 w-3" />
                        Maintenance Plans
                    </div>
                    <h3 className="text-3xl font-black text-slate-950 tracking-tight mb-8">Monthly Maintenance</h3>
                    <div className="grid sm:grid-cols-2 gap-8 text-left">
                        <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm transition hover:shadow-md">
                            <h4 className="text-xl font-bold text-slate-950 tracking-tight">Basic Maintenance</h4>
                            <div className="text-blue-600 font-black mt-2 mb-4">R1,500 / month</div>
                            <ul className="text-sm text-slate-500 mb-6 font-medium space-y-2">
                                <li className="flex gap-2 items-center"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Website updates</li>
                                <li className="flex gap-2 items-center"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Security monitoring</li>
                                <li className="flex gap-2 items-center"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Backup management</li>
                            </ul>
                            <a href={createWhatsAppLink("Hello, I need basic monthly maintenance.")} target="_blank" rel="noreferrer" className="text-sm font-black text-slate-950 hover:text-blue-600 transition flex items-center gap-2">Request Maintenance <ArrowRight className="h-4 w-4" /></a>
                        </div>
                        <div className="rounded-3xl bg-white p-8 border border-slate-200 shadow-sm transition hover:shadow-md">
                            <h4 className="text-xl font-bold text-slate-950 tracking-tight">Advanced Maintenance</h4>
                            <div className="text-blue-600 font-black mt-2 mb-4">R3,000 – R6,000 / month</div>
                            <ul className="text-sm text-slate-500 mb-6 font-medium space-y-2">
                                <li className="flex gap-2 items-center"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Website updates</li>
                                <li className="flex gap-2 items-center"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> System maintenance & Bug fixes</li>
                                <li className="flex gap-2 items-center"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Database monitoring</li>
                                <li className="flex gap-2 items-center"><CheckCircle2 className="h-4 w-4 text-emerald-500" /> Technical support</li>
                            </ul>
                            <a href={createWhatsAppLink("Hello, I need advanced monthly maintenance.")} target="_blank" rel="noreferrer" className="text-sm font-black text-slate-950 hover:text-blue-600 transition flex items-center gap-2">Request Maintenance <ArrowRight className="h-4 w-4" /></a>
                        </div>
                    </div>
                </div>
                <div className="h-px w-full bg-gradient-to-r from-transparent via-slate-200 to-transparent mb-40" />

                {/* ---- VOTING ACQUISITION TIER ---- */}
                <SectionHeading
                    eyebrow="Acquisitions"
                    title="Own the Full Architecture"
                    description="Premium acquisition packages for clients who require complete ownership and long-term studio support."
                    center
                />

                <div className="mt-20 grid gap-10 lg:grid-cols-2">
                    {votingPackages.map((pkg, i) => {
                        const amountInCents = parseInt(pkg.price.replace(/[^0-9]/g, ''), 10) * 100;
                        const waMsg = `Hello LCX STUDIOS. I have just made a payment of ${pkg.price} for the ${pkg.name} acquisition buy-out. Please get in touch to finalize.`;
                        return (
                            <motion.div
                                key={pkg.name}
                                initial={{ opacity: 0, x: i % 2 === 0 ? -30 : 30 }}
                                whileInView={{ opacity: 1, x: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 1, ease: luxuryEase }}
                                className={cn(
                                    "group relative flex flex-col rounded-[3rem] border p-6 sm:p-10 lg:p-14 transition-all hover:shadow-[0_60px_100px_rgba(0,0,0,0.08)]",
                                    pkg.featured ? "bg-slate-950 border-slate-800" : "bg-white border-slate-200"
                                )}
                            >
                                <div className="mb-10">
                                    <h3 className={cn("text-2xl font-black tracking-tight", pkg.featured ? "text-white" : "text-slate-950")}>{pkg.name}</h3>
                                    <div className="mt-6 flex items-baseline gap-2">
                                        <span className={cn("text-4xl sm:text-5xl lg:text-6xl font-black tracking-tighter", pkg.featured ? "text-white" : "text-slate-950")}>{pkg.price}</span>
                                    </div>
                                    <div className="mt-6 inline-flex items-center gap-2 rounded-full bg-blue-600/10 px-4 py-1.5 text-[10px] font-black uppercase tracking-widest text-blue-500">
                                        <Sparkles className="h-3 w-3 shrink-0" />
                                        <span className="whitespace-normal text-left">{pkg.support}</span>
                                    </div>
                                </div>

                                <ul className="mb-12 flex-1 space-y-6">
                                    {pkg.features.map((feature) => (
                                        <li key={feature} className="flex items-start gap-4 text-sm font-medium">
                                            <div className="mt-1 flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-blue-600 text-white">
                                                <CheckCircle2 className="h-3 w-3" />
                                            </div>
                                            <span className={pkg.featured ? "text-slate-400" : "text-slate-600"}>{feature}</span>
                                        </li>
                                    ))}
                                </ul>

                                {/* Override YocoPayButton button color for dark cards */}
                                <div className={pkg.featured ? "[&_button]:bg-blue-600 [&_button]:hover:bg-white [&_button]:hover:text-slate-950 [&_span]:text-slate-400 [&_img]:opacity-80" : ""}>
                                    <YocoPayButton
                                        amountInCents={amountInCents}
                                        description={`Acquisition: ${pkg.name}`}
                                        label="Acquisition Buy-out"
                                        onSuccess={() => window.open(createWhatsAppLink(waMsg), '_blank')}
                                    />
                                </div>
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

function PosterPricing() {
    return (
        <section className="bg-[#020617] py-32 relative overflow-hidden">
            <div className="absolute inset-0 opacity-10">
                <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_right,rgba(59,130,246,0.1),transparent_50%)]" />
            </div>
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <SectionHeading
                    eyebrow="Creative Direction"
                    title="Luxury Poster Design"
                    description="High-end visual communication for pageantry and elite events."
                    theme="dark"
                    center
                />

                <div className="mt-20 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
                    {posterPricing.map((pkg, i) => {
                        const amountString = pkg.price.replace(/[^0-9]/g, '');
                        const amountInCents = parseInt(amountString, 10) * 100;
                        const waMsg = `Hello LCX STUDIOS. I have just paid ${pkg.price} for ${pkg.title}. Here are my design details...`;
                        return (
                            <motion.div
                                key={pkg.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ duration: 0.8, delay: i * 0.1 }}
                                className="group relative rounded-[2.5rem] border border-slate-800 bg-slate-900/40 p-10 backdrop-blur-xl transition-all hover:bg-slate-800/60 hover:border-blue-500/30 shadow-2xl"
                            >
                                <h4 className="text-sm font-black uppercase tracking-widest text-blue-400">{pkg.title}</h4>
                                <div className="mt-4 flex items-baseline gap-1">
                                    <span className="text-4xl font-black text-white">{pkg.price}</span>
                                    <span className="text-xs font-medium text-slate-500">{pkg.note}</span>
                                </div>
                                <p className="mt-6 text-xs font-medium text-slate-400 leading-relaxed mb-10">{pkg.extra}</p>
                                <YocoPayButton
                                    amountInCents={amountInCents}
                                    description={`Purchase: ${pkg.title}`}
                                    label="Buy & Design"
                                    onSuccess={() => {
                                        window.open(createWhatsAppLink(waMsg), '_blank');
                                    }}
                                />
                            </motion.div>
                        );
                    })}
                </div>
            </div>
        </section>
    );
}

function RequestForm() {
    const [form, setForm] = useState({
        fullName: "",
        company: "",
        email: "",
        phone: "",
        service: "Custom Internal Software System",
        budget: "R20,000 - R50,000",
        systemType: "",
        description: "",
        features: "",
        deadline: "",
    });

    const whatsappHref = useMemo(() => {
        const text = `Hello LCX STUDIOS. I want to request a custom system:%0A%0A- Full Name: ${form.fullName}%0A- Company: ${form.company}%0A- Email: ${form.email}%0A- Phone: ${form.phone}%0A- Service: ${form.service}%0A- Budget: ${form.budget}%0A- Type: ${form.systemType}%0A- Description: ${form.description}%0A- Features: ${form.features}%0A- Deadline: ${form.deadline}`;
        return `https://wa.me/${WHATSAPP_NUMBER}?text=${text}`;
    }, [form]);

    const handleChange = (key, value) => setForm((prev) => ({ ...prev, [key]: value }));

    const inputClass = "mt-3 w-full rounded-2xl border border-slate-200 bg-white px-6 py-4 text-sm text-slate-900 outline-none focus:border-cyan-500 transition-all placeholder:text-slate-400 shadow-sm";

    return (
        <section id="request" className="relative bg-white py-24 sm:py-32 border-t border-slate-200">
            <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                <SectionHeading
                    eyebrow="Project Intake"
                    title="Engineered for your needs."
                    description="Send your requirements directly to the developer and get a response within 24 hours."
                    center
                />

                <div className="mt-12 sm:mt-20 mx-auto max-w-4xl bg-slate-50 border border-slate-200 rounded-[2rem] sm:rounded-[3rem] p-6 sm:p-10 lg:p-16 shadow-xl">
                    <div className="grid gap-8 md:grid-cols-2">
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500">Full Name
                            <input className={inputClass} value={form.fullName} onChange={(e) => handleChange("fullName", e.target.value)} placeholder="Enter details..." />
                        </label>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500">Company (Optional)
                            <input className={inputClass} value={form.company} onChange={(e) => handleChange("company", e.target.value)} placeholder="Enter details..." />
                        </label>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500">Email Address
                            <input className={inputClass} value={form.email} onChange={(e) => handleChange("email", e.target.value)} placeholder="Enter details..." />
                        </label>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500">Phone Number
                            <input className={inputClass} value={form.phone} onChange={(e) => handleChange("phone", e.target.value)} placeholder="Enter details..." />
                        </label>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500">Interested Service
                            <select className={inputClass} value={form.service} onChange={(e) => handleChange("service", e.target.value)}>
                                <option>Custom Internal Software System</option>
                                <option>Voting Only Package</option>
                                <option>Full Voting System</option>
                                <option>Creative Design Services</option>
                            </select>
                        </label>
                        <label className="block text-xs font-bold uppercase tracking-widest text-slate-500">Budget Range
                            <select className={inputClass} value={form.budget} onChange={(e) => handleChange("budget", e.target.value)}>
                                <option>Below R10,000</option>
                                <option>R10,000 - R20,000</option>
                                <option>R20,000 - R50,000</option>
                                <option>Above R100,000</option>
                            </select>
                        </label>
                        <div className="md:col-span-2">
                            <label className="block text-xs font-bold uppercase tracking-widest text-slate-500">Tell us about the project
                                <textarea className={cn(inputClass, "min-h-[160px] resize-none")} value={form.description} onChange={(e) => handleChange("description", e.target.value)} placeholder="Features, goals, and audience..." />
                            </label>
                        </div>
                        <div className="md:col-span-2">
                            <a
                                href={whatsappHref}
                                target="_blank"
                                rel="noreferrer"
                                className="flex w-full items-center justify-center gap-3 rounded-2xl bg-cyan-500 py-6 text-sm font-black uppercase tracking-widest text-white transition-all hover:scale-[1.02] hover:shadow-[0_0_40px_rgba(34,211,238,0.3)] shadow-2xl"
                            >
                                <Send className="h-5 w-5" />
                                Submit via WhatsApp
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function Contact() {
    return (
        <section id="contact" className="relative bg-[#020617] py-32 overflow-hidden">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="relative overflow-hidden rounded-[4rem] bg-gradient-to-br from-blue-600 to-blue-800 p-12 sm:p-20 shadow-2xl">
                    <div className="absolute inset-0 opacity-10 [background-image:radial-gradient(white_1px,transparent_1px)] [background-size:20px_20px]" />

                    <div className="relative z-10 flex flex-col items-center text-center">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            whileInView={{ opacity: 1, scale: 1 }}
                            className="mb-10 inline-flex h-24 w-24 items-center justify-center rounded-3xl bg-white/20 backdrop-blur-xl text-white shadow-2xl"
                        >
                            <Zap className="h-12 w-12" />
                        </motion.div>

                        <h2 className="text-4xl font-black text-white sm:text-6xl tracking-tighter max-w-2xl leading-[1.05]">
                            Ready to build your next-gen system?
                        </h2>
                        <p className="mt-8 text-lg font-medium text-blue-100 max-w-xl">
                            Connect with our studio architects directly for high-priority consultations and elite software execution.
                        </p>

                        <div className="mt-12 flex flex-col sm:flex-row gap-6">
                            <a
                                href={createWhatsAppLink("Hello, I want to start a priority system build with LCX STUDIOS.")}
                                target="_blank"
                                rel="noreferrer"
                                className="inline-flex items-center justify-center gap-3 rounded-full bg-white px-10 py-5 text-sm font-black uppercase tracking-widest text-blue-600 transition-all hover:scale-105 active:scale-95 shadow-xl"
                            >
                                <MessageCircle className="h-5 w-5" />
                                WhatsApp Priority
                            </a>
                            <a
                                href={`mailto:${EMAIL}`}
                                className="inline-flex items-center justify-center gap-3 rounded-full border border-white/30 bg-white/10 px-10 py-5 text-sm font-black uppercase tracking-widest text-white backdrop-blur-md transition-all hover:bg-white/20 active:scale-95"
                            >
                                <Mail className="h-5 w-5" />
                                Official Enquiry
                            </a>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
}

function Footer() {
    return (
        <footer className="bg-[#020617] border-t border-slate-900 py-24">
            <div className="mx-auto max-w-7xl px-6 lg:px-8">
                <div className="grid gap-16 lg:grid-cols-2">
                    <div>
                        <div className="flex items-center gap-4">
                            <div className="h-12 w-12 overflow-hidden rounded-2xl border border-slate-700 bg-slate-900 p-1.5">
                                <img src="/logo.png" alt="LCX Footer" className="h-full w-full object-contain" />
                            </div>
                            <span className="text-2xl font-black tracking-tighter text-white">LCX STUDIOS</span>
                        </div>
                        <p className="mt-8 max-w-sm text-sm font-medium leading-relaxed text-slate-500">
                            The technology partner for high-end digital architecture, custom internal software, and elite brand identity.
                        </p>
                        <div className="mt-10 flex gap-6">
                            <a href="#" className="text-slate-500 hover:text-white transition-colors"><Phone className="h-5 w-5" /></a>
                            <a href={`mailto:${EMAIL}`} className="text-slate-500 hover:text-white transition-colors"><Mail className="h-5 w-5" /></a>
                        </div>
                    </div>

                    <div className="grid grid-cols-2 gap-12 sm:grid-cols-3">
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Navigation</h4>
                            <ul className="mt-6 space-y-4">
                                {navItems.map(item => (
                                    <li key={item.label}><a href={item.href} className="text-sm font-medium text-slate-500 hover:text-white transition-colors">{item.label}</a></li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Services</h4>
                            <ul className="mt-6 space-y-4">
                                <li><a href="#" className="text-sm font-medium text-slate-500 hover:text-white transition-colors">Voting Systems</a></li>
                                <li><a href="#" className="text-sm font-medium text-slate-500 hover:text-white transition-colors">Custom Dashboards</a></li>
                                <li><a href="#" className="text-sm font-medium text-slate-500 hover:text-white transition-colors">Visual Posters</a></li>
                            </ul>
                        </div>
                        <div className="col-span-2 sm:col-span-1">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Location</h4>
                            <p className="mt-6 text-sm font-medium text-slate-500 leading-relaxed">
                                Cape Town & Johannesburg,<br />South Africa
                            </p>
                        </div>
                    </div>
                </div>

                <div className="mt-20 flex flex-col sm:flex-row items-center justify-between border-t border-slate-900 pt-12 gap-8 text-[10px] font-bold uppercase tracking-widest text-slate-600">
                    <p>© {new Date().getFullYear()} LCX STUDIOS. High-End Systems Only.</p>
                    <div className="flex gap-10">
                        <a href="/admin" className="hover:text-blue-500 transition-colors">Studio Admin</a>
                        <a href="#" className="hover:text-white transition-colors">Privacy</a>
                        <a href="#" className="hover:text-white transition-colors">Terms</a>
                    </div>
                </div>
            </div>
        </footer>
    );
}



function AdminPage() {
    const [pin, setPin] = useState("");
    const [authorized, setAuthorized] = useState(false);

    if (!authorized) {
        return (
            <div className="min-h-screen bg-[#020617] flex items-center justify-center p-6">
                <motion.div
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    className="max-w-md w-full bg-slate-900 border border-slate-800 p-12 rounded-[3rem] shadow-2xl text-center"
                >
                    <div className="inline-flex h-20 w-20 items-center justify-center rounded-3xl bg-blue-600/10 text-blue-500 mb-8 border border-blue-500/20 shadow-xl">
                        <ShieldCheck className="h-10 w-10" />
                    </div>
                    <h2 className="text-3xl font-black text-white tracking-tighter">Identity Check</h2>
                    <p className="mt-4 text-sm font-medium text-slate-400">Enter your studio access PIN to proceed.</p>

                    <input
                        type="password"
                        maxLength={4}
                        value={pin}
                        onChange={(e) => {
                            setPin(e.target.value);
                            if (e.target.value === "1965") setAuthorized(true);
                        }}
                        className="mt-10 w-full rounded-2xl border border-slate-800 bg-slate-950 px-10 py-6 text-center text-4xl font-black tracking-[0.5em] text-white focus:border-blue-500 focus:ring-1 focus:ring-blue-500 outline-none transition-all"
                        placeholder="••••"
                    />
                </motion.div>
            </div>
        );
    }

    return <Admin />;
}

function PageLayout({ children, session, onPortalClick, showAuth, setShowAuth, showAccount, setShowAccount }) {
    return (
        <div className="min-h-screen bg-white selection:bg-blue-100 selection:text-blue-900 scroll-smooth">
            {/* Mockup Mode Banner */}
            <div className="fixed top-0 left-0 right-0 z-[100] bg-blue-600/10 border-b border-blue-500/20 py-1 px-4 text-center backdrop-blur-md">
                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-blue-500 flex items-center justify-center gap-2">
                    <ShieldCheck size={10} /> Portfolio Mockup Design — Display Only
                </p>
            </div>
            
            <TopNav session={session} onPortalClick={onPortalClick} />
            <main>{children}</main>
            <Footer />

            <AnimatePresence>
                {showAuth && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 p-6 backdrop-blur-2xl"
                    >
                        <div className="relative max-w-md w-full">
                            <button onClick={() => setShowAuth(false)} className="absolute -top-16 right-0 text-white hover:text-blue-400">
                                <X className="h-10 w-10" />
                            </button>
                            <Auth />
                        </div>
                    </motion.div>
                )}
                {showAccount && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/90 p-6 backdrop-blur-2xl"
                    >
                        <div className="relative max-w-4xl w-full">
                            <button onClick={() => setShowAccount(false)} className="absolute -top-16 right-0 text-white hover:text-blue-400">
                                <X className="h-10 w-10" />
                            </button>
                            <Account session={session} onSignOut={() => setShowAccount(false)} onBack={() => setShowAccount(false)} />
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

export default function App() {
    const [session, setSession] = useState(null);
    const [showAuth, setShowAuth] = useState(false);
    const [showAccount, setShowAccount] = useState(false);

    useEffect(() => {
        supabase.auth.getSession().then(({ data: { session } }) => setSession(session));
        const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => setSession(session));
        return () => subscription.unsubscribe();
    }, []);

    const handlePortalClick = () => {
        if (!session) setShowAuth(true);
        else setShowAccount(true);
    };

    const layoutProps = { session, onPortalClick: handlePortalClick, showAuth, setShowAuth, showAccount, setShowAccount };

    return (
        <Routes>
            <Route path="/admin" element={<AdminPage />} />
            <Route path="/" element={
                <PageLayout {...layoutProps}>
                    <Hero />
                </PageLayout>
            } />
            <Route path="/services" element={
                <PageLayout {...layoutProps}>
                    <div className="pt-28">
                        <Services />
                    </div>
                </PageLayout>
            } />
            <Route path="/pricing" element={
                <PageLayout {...layoutProps}>
                    <div className="pt-28">
                        <PricingCards />
                        <PosterPricing />
                    </div>
                </PageLayout>
            } />
            <Route path="/about" element={
                <PageLayout {...layoutProps}>
                    <div className="pt-28">
                        <About />
                    </div>
                </PageLayout>
            } />
            <Route path="/contact" element={
                <PageLayout {...layoutProps}>
                    <div className="pt-28">
                        <RequestForm />
                        <Contact />
                    </div>
                </PageLayout>
            } />
        </Routes>
    );
}
