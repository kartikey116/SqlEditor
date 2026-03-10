import { useState, useEffect, useRef } from 'react';
import AOS from 'aos';
import 'aos/dist/aos.css';
import Navbar from '../components/Navbar';
import AssignmentCard from '../components/AssignmentCard';
import { getAssignments, getAllProgress } from '../api';
import './AssignmentsPage.scss';

const FILTER_TABS = ['All', 'Easy', 'Medium', 'Hard'];

export default function AssignmentsPage() {
    const [assignments, setAssignments] = useState([]);
    const [filtered, setFiltered] = useState([]);
    const [progressMap, setProgressMap] = useState({}); // assignmentId → progress doc
    const [activeTab, setActiveTab] = useState('All');
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const orb1 = useRef(null);
    const orb2 = useRef(null);

    useEffect(() => {
        AOS.init({ once: true, easing: 'ease-out-quart', duration: 700, offset: 60 });
        // Starfield
        const sf = document.getElementById('starfield');
        if (sf && sf.children.length === 0) {
            for (let i = 0; i < 120; i++) {
                const s = document.createElement('div');
                s.className = 'star';
                const size = Math.random() * 2 + 0.5;
                Object.assign(s.style, {
                    width: `${size}px`, height: `${size}px`,
                    top: `${Math.random() * 100}%`, left: `${Math.random() * 100}%`,
                    '--op': `${Math.random() * 0.6 + 0.2}`,
                    '--dur': `${Math.random() * 4 + 2}s`,
                    animationDelay: `${Math.random() * 5}s`,
                });
                sf.appendChild(s);
            }
        }
    }, []);

    useEffect(() => {
        const onMouse = (e) => {
            const cx = window.innerWidth / 2, cy = window.innerHeight / 2;
            const dx = (e.clientX - cx) / cx, dy = (e.clientY - cy) / cy;
            if (orb1.current) orb1.current.style.transform = `translate(${dx * 30}px,${dy * 30}px)`;
            if (orb2.current) orb2.current.style.transform = `translate(${-dx * 25}px,${-dy * 25}px)`;
        };
        window.addEventListener('mousemove', onMouse);
        return () => window.removeEventListener('mousemove', onMouse);
    }, []);

    // Fetch assignments + progress independently — progress failure must never block challenges
    useEffect(() => {
        Promise.allSettled([getAssignments(), getAllProgress()])
            .then(([aResult, pResult]) => {
                if (aResult.status === 'rejected') {
                    setError('Could not load challenges. Is the backend running?');
                    return;
                }
                setAssignments(aResult.value.data);
                setFiltered(aResult.value.data);

                if (pResult.status === 'fulfilled') {
                    const map = {};
                    pResult.value.data.forEach(p => { map[p.assignmentId] = p; });
                    setProgressMap(map);
                }
            })
            .finally(() => setLoading(false));
    }, []);

    useEffect(() => {
        let list = assignments;
        if (activeTab !== 'All') list = list.filter(a => a.description === activeTab);
        if (search.trim()) list = list.filter(a =>
            a.title.toLowerCase().includes(search.toLowerCase()) ||
            a.question.toLowerCase().includes(search.toLowerCase())
        );
        setFiltered(list);
    }, [activeTab, search, assignments]);

    // Progress summary stats
    const completedCount = Object.values(progressMap).filter(p => p.isCompleted).length;
    const totalCount = assignments.length;
    const progressPct = totalCount ? Math.round((completedCount / totalCount) * 100) : 0;

    return (
        <>
            <div id="starfield" />
            <div className="orb orb-1" ref={orb1} />
            <div className="orb orb-2" ref={orb2} />
            <span className="floating-snippet" style={{ top: '15%', left: '2%', animationDuration: '8s' }}>SELECT * FROM employees WHERE salary &gt; 50000;</span>
            <span className="floating-snippet" style={{ top: '35%', right: '2%', animationDuration: '10s', animationDelay: '2s' }}>GROUP BY department HAVING COUNT(*) &gt; 1</span>
            <span className="floating-snippet" style={{ top: '60%', left: '3%', animationDuration: '7s', animationDelay: '4s' }}>JOIN orders ON customers.id = orders.customer_id</span>
            <span className="floating-snippet" style={{ top: '75%', right: '3%', animationDuration: '9s', animationDelay: '1s' }}>SELECT MAX(salary) FROM employees;</span>

            <div className="page-content">
                <Navbar />

                {/* ── Hero ────────────────────────────────────────────── */}
                <section className="hero">
                    <div className="hero-pill" data-aos="fade-down">✦ {totalCount || 4} SQL Challenges Ready</div>
                    <h1 data-aos="fade-up" data-aos-delay="100">
                        Master SQL with<br />
                        <span className="gradient-text">Real Challenges</span>
                    </h1>
                    <p className="hero-sub" data-aos="fade-up" data-aos-delay="200">
                        Write, execute, and debug SQL queries in an isolated NeonDB sandbox. Get AI-powered hints when you're stuck.
                    </p>
                    <div className="hero-actions" data-aos="fade-up" data-aos-delay="300">
                        <a href="#challenges" className="btn-primary">🚀 Start Challenges</a>
                        <a href="#challenges" className="btn-outline">📖 View All</a>
                    </div>
                    <div className="scroll-indicator" data-aos="fade-up" data-aos-delay="600">
                        <div className="scroll-mouse"><div className="scroll-wheel" /></div>
                        <span>SCROLL</span>
                    </div>
                </section>

                {/* ── Stats Bar ───────────────────────────────────────── */}
                <div className="stats-bar">
                    {[['4', 'SQL Challenges'], ['3', 'Difficulty Levels'], ['∞', 'Query Attempts'], ['AI', 'Powered Hints']].map(([num, label], i) => (
                        <div className="stat-item" key={label} data-aos="zoom-in" data-aos-delay={i * 80}>
                            <div className="stat-num gradient-text">{num}</div>
                            <div className="stat-label">{label}</div>
                        </div>
                    ))}
                </div>

                {/* ── Progress Bar ────────────────────────────────────── */}
                {totalCount > 0 && (
                    <div className="overall-progress" data-aos="fade-up">
                        <div className="op-header">
                            <span className="op-title">Your Progress</span>
                            <span className="op-count">{completedCount} / {totalCount} completed</span>
                        </div>
                        <div className="op-track">
                            <div className="op-fill" style={{ width: `${progressPct}%` }} />
                        </div>
                        <div className="op-badges">
                            {assignments.map(a => {
                                const done = progressMap[a._id]?.isCompleted;
                                return (
                                    <div key={a._id} className={`op-dot ${done ? 'done' : ''}`} title={a.title}>
                                        {done ? '✓' : ''}
                                    </div>
                                );
                            })}
                        </div>
                    </div>
                )}

                {/* ── Filter Bar ──────────────────────────────────────── */}
                <section className="filter-section" id="challenges">
                    <div className="filter-header" data-aos="fade-up">
                        <h2>🎯 SQL Challenges</h2>
                        <div className="filter-controls">
                            <div className="search-wrapper">
                                <span className="search-icon">🔍</span>
                                <input
                                    type="text"
                                    placeholder="Search challenges…"
                                    value={search}
                                    onChange={e => setSearch(e.target.value)}
                                />
                            </div>
                            <div className="filter-tabs">
                                {FILTER_TABS.map(tab => (
                                    <button
                                        key={tab}
                                        className={`filter-tab ${activeTab === tab ? 'active' : ''}`}
                                        onClick={() => setActiveTab(tab)}
                                    >
                                        {tab === 'Easy' ? '🟢 ' : tab === 'Medium' ? '🟠 ' : tab === 'Hard' ? '🔴 ' : ''}
                                        {tab}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </section>

                {/* ── Cards Grid ──────────────────────────────────────── */}
                <div className="cards-grid">
                    {loading && (
                        <div className="cards-loading">
                            <div className="loading-spinner" />
                            <span>Loading challenges…</span>
                        </div>
                    )}
                    {error && <div className="cards-error">{error}</div>}
                    {!loading && !error && filtered.length === 0 && (
                        <div className="cards-empty">No challenges match your search.</div>
                    )}
                    {!loading && filtered.map((a, i) => (
                        <AssignmentCard
                            key={a._id}
                            assignment={a}
                            index={i}
                            progress={progressMap[a._id] || null}
                        />
                    ))}
                </div>

                {/* ── CTA ─────────────────────────────────────────────── */}
                <section className="cta-section" data-aos="fade-up">
                    <h2>Ready to level up? <span className="gradient-text">Start now.</span></h2>
                    <p>Pick any challenge, write your query, see instant results.</p>
                    <a href="#challenges" className="btn-primary">🚀 Browse All Challenges</a>
                </section>
            </div>
        </>
    );
}
