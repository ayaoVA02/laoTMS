"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import {
    ArrowRight, MapPin, Heart, Code2, Palette, Globe,
    Sparkles, Users, Mountain, Star
} from "lucide-react";
import { useTranslation } from "react-i18next";
import Footer from "@/components/layout/footer";
import { muelo, numfon, yao } from "@/assets";
import Image from "next/image";

const TEAM = [
    {
        initials: "YV",
        name: "Yao VA",
        image: yao,
        role: "Full-Stack Developer & Co-Founder",
        color: "from-amber-400 to-orange-500",
        ring: "ring-amber-200",
        bio: "Yao is the engine behind LaoTMS's architecture. With a passion for clean code and scalable systems, he designed the backend infrastructure, Supabase integrations, and the data pipelines that power the platform. When not debugging queries, he's on a mission to find the best khao piak sen the country has to offer.",
        highlights: ["Backend Architecture", "Supabase & Database", "API Design"],
        icon: <Code2 className="h-5 w-5" />,
        location: "Laos",
    },
    {
        initials: "MK",
        image: muelo,
        name: "Muelo Korphea",
        role: "Frontend Developer & Co-Founder",
        color: "from-violet-400 to-purple-600",
        ring: "ring-violet-200",
        bio: "Muelo turns ideas into pixels. He's the craftsman behind the interactive UI, the smooth animations, and the component systems that make LaoTMS feel alive. His philosophy: every screen should feel like a local guide handing you a hand-drawn map. Detail-obsessed and endlessly curious about new web technologies.",
        highlights: ["UI Engineering", "Animations & Motion", "Component Systems"],
        icon: <Palette className="h-5 w-5" />,
        location: "Laos",
    },
    {
        initials: "NK",
        name: "Numfon Konlavong",
        image: numfon,
        role: "Product & Content Lead · Co-Founder",
        color: "from-pink-400 to-rose-500",
        ring: "ring-rose-200",
        bio: "Numfon is the voice and vision of LaoTMS. She shapes the product strategy, curates attraction content, and ensures every word on the platform reflects genuine Lao hospitality. A born explorer who has travelled across the country — and she'll happily tell you the best waterfall to swim in each province.",
        highlights: ["Product Strategy", "Content & Curation", "User Experience"],
        icon: <Globe className="h-5 w-5" />,
        location: "Laos",
    },
];

const VALUES = [
    {
        icon: <Heart className="h-6 w-6 text-rose-500" />,
        title: "Local at heart",
        desc: "Every decision starts with one question: does this serve the people of Laos? We build for the communities that make this country extraordinary.",
    },
    {
        icon: <Mountain className="h-6 w-6 text-teal-500" />,
        title: "Authentic discovery",
        desc: "No paid rankings, no sponsored bias. Every attraction is listed on its own merits — because honest guidance builds lasting trust.",
    },
    {
        icon: <Star className="h-6 w-6 text-amber-500" />,
        title: "Quality over quantity",
        desc: "We'd rather surface 10 genuinely great experiences than 100 mediocre ones. Curation is our most important product.",
    },
    {
        icon: <Users className="h-6 w-6 text-violet-500" />,
        title: "Built with community",
        desc: "Entrepreneurs, guides, and travellers shape what LaoTMS becomes. The platform grows as the people who use it contribute.",
    },
];

export default function AboutPage() {
    const { t } = useTranslation();

    return (
        <div className="min-h-screen bg-gray-50">

            {/* ===== HERO ===== */}
            <section className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-500 pb-32 pt-24">
                <div
                    className="pointer-events-none absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                        backgroundSize: '28px 28px',
                    }}
                />
                <div className="pointer-events-none absolute -left-32 top-0 h-96 w-96 rounded-full bg-white/5 blur-3xl" />
                <div className="pointer-events-none absolute right-0 top-1/2 h-80 w-80 rounded-full bg-emerald-300/10 blur-3xl" />

                <div className="relative mx-auto max-w-4xl px-4 text-center sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: -12 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.5 }}
                        className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/30 bg-white/10 px-4 py-2 backdrop-blur-sm"
                    >
                        <Sparkles className="h-4 w-4 text-emerald-200" />
                        <span className="text-sm font-medium text-white/85">{t("home.about.ourStory", "Our Story")}</span>
                    </motion.div>

                    <motion.h1
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.1 }}
                        className="text-4xl font-extrabold tracking-tight text-white sm:text-5xl lg:text-6xl"
                    >
                        {t("about.hero.title", "Three friends.")}<br />
                        <span className="text-emerald-200">{t("about.hero.subtitle", "One shared love for Laos.")}</span>
                    </motion.h1>

                    <motion.p
                        initial={{ opacity: 0, y: 15 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.6, delay: 0.2 }}
                        className="mx-auto mt-6 max-w-2xl text-lg leading-relaxed text-white/75"
                    >
                        {t("about.hero.description", "LaoTMS started as a passion project between three friends from across Laos who were tired of seeing their country undersold online. We wanted a platform that matched the depth, warmth, and sheer beauty of the land we grew up in — so we built one.")}
                    </motion.p>

                    {/* Stacked avatars in hero */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ duration: 0.6, delay: 0.35 }}
                        className="mt-10 flex items-center justify-center -space-x-5"
                    >
                        {TEAM.map((member, i) => (
                            <div
                                key={i}
                                title={member.name}
                                className={`relative flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br ${member.color} ring-4 ring-teal-600 text-white text-xl font-bold shadow-lg sm:h-20 sm:w-20 sm:text-2xl overflow-hidden`}
                            >
                                {member.image ? (
                                    <Image
                                        src={member.image}
                                        alt={member.name}
                                        fill
                                        className="object-cover"
                                        priority
                                    />
                                ) : (
                                    member.initials
                                )}
                            </div>
                        ))}
                    </motion.div>
                    <p className="mt-3 text-sm text-white/55">{t("about.hero.names", "Yao · Muelo · Numfon — from across Laos")}</p>
                </div>
            </section>

            {/* ===== MISSION STRIP ===== */}
            <section className="relative -mt-16 z-10 mx-auto max-w-5xl px-4 sm:px-6 lg:px-8">
                <motion.div
                    initial={{ opacity: 0, y: 24 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.6 }}
                    className="rounded-3xl bg-white p-8 shadow-xl shadow-teal-500/10 sm:p-12"
                >
                    <div className="flex flex-col items-center gap-6 text-center sm:flex-row sm:text-left">
                        <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-teal-500 to-emerald-600 shadow-md shadow-teal-500/30">
                            <MapPin className="h-8 w-8 text-white" />
                        </div>
                        <div>
                            <h2 className="text-xl font-bold text-gray-900 sm:text-2xl">
                                {t("about.mission.title", "Our mission: make Laos impossible to miss.")}
                            </h2>
                            <p className="mt-2 text-gray-500 leading-relaxed">
                                {t("about.mission.description", "Millions of travellers pass through Southeast Asia every year — and Laos is still the best-kept secret. We're changing that by giving every attraction, from ancient temples to jungle waterfalls, the platform it deserves.")}
                            </p>
                        </div>
                    </div>
                </motion.div>
            </section>

            {/* ===== TEAM ===== */}
            <section className="py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="mb-16 text-center"
                    >
                        <span className="mb-3 inline-block rounded-full bg-teal-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-teal-600">
                            {t("about.team.section", "The people behind it")}
                        </span>
                        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">{t("about.team.title", "Meet the team")}</h2>
                        <p className="mt-3 text-gray-500">{t("about.team.subtitle", "Three builders from across Laos, united by one idea.")}</p>
                    </motion.div>

                    <div className="grid grid-cols-1 gap-8 md:grid-cols-3">
                        {TEAM.map((member, index) => (
                            <motion.div
                                key={member.name}
                                initial={{ opacity: 0, y: 30 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.12, duration: 0.55 }}
                                className="group flex flex-col rounded-3xl bg-white p-8 shadow-sm border border-gray-100 transition-all duration-300 hover:-translate-y-1 hover:shadow-xl hover:shadow-teal-500/10"
                            >
                                {/* Avatar */}
                                <div className="mb-6 flex items-center gap-4">
                                    <div
                                        title={member.name}
                                        className={`relative flex h-16 w-16 shrink-0 items-center justify-center bg-gradient-to-br ${member.color} rounded-2xl text-white text-xl font-bold shadow-lg overflow-hidden`}
                                    >
                                        {member.image ? (
                                            <Image
                                                src={member.image}
                                                alt={member.name}
                                                fill
                                                className="object-cover"
                                                priority
                                            />
                                        ) : (
                                            member.initials
                                        )}
                                    </div>
                                    <div>
                                        <h3 className="text-lg font-bold text-gray-900">{member.name}</h3>
                                        <p className="text-sm text-gray-500">{member.role}</p>
                                        <p className="mt-0.5 flex items-center gap-1 text-xs text-gray-400">
                                            <MapPin className="h-3 w-3" />
                                            {member.location}
                                        </p>
                                    </div>
                                </div>

                                {/* Bio */}
                                <p className="flex-1 text-sm leading-relaxed text-gray-600">{member.bio}</p>

                                {/* Highlight pills */}
                                <div className="mt-6 flex flex-wrap gap-2">
                                    {member.highlights.map((tag) => (
                                        <span
                                            key={tag}
                                            className="inline-flex items-center gap-1 rounded-full bg-gray-50 border border-gray-100 px-3 py-1 text-xs font-medium text-gray-600"
                                        >
                                            {tag}
                                        </span>
                                    ))}
                                </div>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== VALUES ===== */}
            <section className="bg-white py-24">
                <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                        className="mb-16 text-center"
                    >
                        <span className="mb-3 inline-block rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold uppercase tracking-widest text-emerald-600">
                            {t("about.values.section", "What guides us")}
                        </span>
                        <h2 className="text-3xl font-bold text-gray-900 sm:text-4xl">{t("about.values.title", "Our values")}</h2>
                    </motion.div>

                    <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                        {VALUES.map((v, index) => (
                            <motion.div
                                key={v.title}
                                initial={{ opacity: 0, y: 20 }}
                                whileInView={{ opacity: 1, y: 0 }}
                                viewport={{ once: true }}
                                transition={{ delay: index * 0.1, duration: 0.5 }}
                                className="rounded-2xl border border-gray-100 bg-gray-50 p-7"
                            >
                                <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-white shadow-sm">
                                    {v.icon}
                                </div>
                                <h3 className="mb-2 text-base font-bold text-gray-900">{v.title}</h3>
                                <p className="text-sm leading-relaxed text-gray-500">{v.desc}</p>
                            </motion.div>
                        ))}
                    </div>
                </div>
            </section>

            {/* ===== CTA BANNER ===== */}
            <section className="relative overflow-hidden bg-gradient-to-br from-teal-700 via-teal-600 to-emerald-500 py-20">
                <div
                    className="pointer-events-none absolute inset-0 opacity-10"
                    style={{
                        backgroundImage: 'radial-gradient(circle, white 1px, transparent 1px)',
                        backgroundSize: '28px 28px',
                    }}
                />
                <div className="relative mx-auto max-w-3xl px-4 text-center sm:px-6">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ duration: 0.6 }}
                    >
                        <h2 className="text-3xl font-extrabold text-white sm:text-4xl">
                            {t("about.cta.title", "Ready to discover Laos?")}
                        </h2>
                        <p className="mx-auto mt-4 max-w-xl text-white/70">
                            {t("about.cta.description", "Browse hundreds of approved attractions — temples, waterfalls, markets, adventure spots, and more.")}
                        </p>
                        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
                            <Link
                                href="/attractions"
                                className="group inline-flex items-center gap-2 rounded-full bg-white px-8 py-3.5 text-sm font-bold text-teal-700 shadow-lg transition-all hover:bg-emerald-50 hover:shadow-xl"
                            >
                                {t("about.cta.startExploring", "Start Exploring")}
                                <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                            </Link>
                            <Link
                                href="/"
                                className="inline-flex items-center gap-2 rounded-full border border-white/40 bg-white/10 px-8 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20"
                            >
                                {t("about.cta.backToHome", "Back to Home")}
                            </Link>
                        </div>
                    </motion.div>
                </div>
            </section>

            <Footer />
        </div>
    );
}