import { useState, useEffect, useCallback } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Editor from '@monaco-editor/react';
import Navbar from '../components/Navbar';
import ResultsTable from '../components/ResultsTable';
import HintModal from '../components/HintModal';
import { getAssignment, getProgress, executeSQL, saveAttempt, getHint } from '../api';
import './AttemptPage.scss';

const DEFAULT_SQL = '-- Write your SQL query below\nSELECT ';

export default function AttemptPage() {
    const { id } = useParams();
    const navigate = useNavigate();

    const [assignment, setAssignment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [progress, setProgress] = useState(null);  // UserProgress doc

    const [sql, setSql] = useState(DEFAULT_SQL);
    const [results, setResults] = useState({ columns: [], rows: [] });
    const [queryLoading, setQueryLoading] = useState(false);
    const [queryError, setQueryError] = useState(null);
    const [verdict, setVerdict] = useState(null); // 'pass' | 'fail'

    const [showHint, setShowHint] = useState(false);
    const [hint, setHint] = useState('');
    const [hintLoading, setHintLoading] = useState(false);

    // ── Fetch assignment + existing progress ─────────────────────────
    useEffect(() => {
        Promise.all([getAssignment(id), getProgress(id)])
            .then(([aRes, pRes]) => {
                setAssignment(aRes.data);
                setProgress(pRes.data);
                // Restore last attempt SQL if exists
                const lastAttempts = pRes.data?.attempts;
                if (lastAttempts?.length) {
                    setSql(lastAttempts[lastAttempts.length - 1].sql);
                }
            })
            .catch(() => navigate('/'))
            .finally(() => setLoading(false));
    }, [id, navigate]);

    // ── Run Query ────────────────────────────────────────────────────
    const runQuery = useCallback(async () => {
        if (!sql.trim() || queryLoading) return;
        setQueryLoading(true);
        setQueryError(null);
        setVerdict(null);

        try {
            const { data } = await executeSQL({ assignmentId: id, sql });
            setResults(data);

            // isCorrect is now computed by the backend (execute.js → checkVerdict)
            // against assignment.expectedOutput stored in MongoDB — not done on frontend
            const pass = data.isCorrect === true;
            setVerdict(pass ? 'pass' : 'fail');

            // ── Save progress ─────────────────────────────────────────
            try {
                const { data: prog } = await saveAttempt({ assignmentId: id, sql, isCorrect: pass });
                setProgress(prog.progress);
            } catch (saveErr) {
                console.warn('Progress save failed (non-critical):', saveErr?.message);
            }
        } catch (err) {
            setQueryError(err.response?.data?.error ?? 'Query execution failed');
        } finally {
            setQueryLoading(false);
        }
    }, [sql, id, queryLoading]);


    // Ctrl+Enter to run
    useEffect(() => {
        const fn = (e) => { if ((e.ctrlKey || e.metaKey) && e.key === 'Enter') runQuery(); };
        window.addEventListener('keydown', fn);
        return () => window.removeEventListener('keydown', fn);
    }, [runQuery]);

    // ── Get Hint ─────────────────────────────────────────────────────
    const fetchHint = async () => {
        setShowHint(true);
        setHintLoading(true);
        setHint('');
        const schema = assignment?.sampleTables
            ?.map(t => `${t.tableName}(${t.columns.map(c => `${c.columnName} ${c.dataType}`).join(', ')})`)
            .join('\n') ?? '';
        try {
            const { data } = await getHint({ question: assignment?.question, schema, userSql: sql });
            setHint(data.hint);
        } catch {
            setHint('💡 Hint service unavailable. Think about which clause filters rows by a condition.');
        } finally {
            setHintLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="page-content">
                <Navbar />
                <div className="attempt-loading">
                    <div className="loading-spinner" />
                    <span>Loading challenge…</span>
                </div>
            </div>
        );
    }

    const diff = assignment?.description ?? 'Easy';
    const tables = assignment?.sampleTables ?? [];
    const done = progress?.isCompleted ?? false;
    const attemptCount = progress?.attemptCount ?? 0;
    const recentAttempts = (progress?.attempts ?? []).slice(-3).reverse(); // last 3

    return (
        <div className="page-content">
            <Navbar />

            <div className="attempt-layout">
                {/* ── LEFT PANEL ────────────────────────────────────── */}
                <aside className="left-panel">
                    <button className="back-btn" onClick={() => navigate('/')}>← Back to Challenges</button>

                    <div className="challenge-header">
                        <div className="ch-badges">
                            <span className={`badge ${diff.toLowerCase()}`}>
                                {diff === 'Easy' ? '🟢' : diff === 'Medium' ? '🟠' : '🔴'} {diff}
                            </span>
                            {done && <span className="ch-solved-badge">✓ Solved</span>}
                        </div>
                        <h2 className="challenge-title">{assignment?.title}</h2>
                        <p className="challenge-q">{assignment?.question}</p>
                        {attemptCount > 0 && (
                            <span className="attempt-count-badge">{attemptCount} attempt{attemptCount !== 1 ? 's' : ''}</span>
                        )}
                    </div>

                    {/* Schema */}
                    <div className="schema-section">
                        <h4 className="schema-heading">📋 Schema</h4>
                        {tables.map(table => (
                            <div key={table.tableName} className="schema-table">
                                <div className="schema-table-name mono">{table.tableName}</div>
                                <table className="schema-cols">
                                    <thead><tr><th>Column</th><th>Type</th></tr></thead>
                                    <tbody>
                                        {table.columns.map(col => (
                                            <tr key={col.columnName}>
                                                <td className="mono">{col.columnName}</td>
                                                <td className="mono type-col">{col.dataType}</td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        ))}
                    </div>

                    {/* Sample data */}
                    {tables[0] && (
                        <div className="sample-section">
                            <h4 className="schema-heading">🗂 Sample Data ({tables[0].tableName})</h4>
                            <div className="sample-scroll">
                                <table className="schema-cols">
                                    <thead>
                                        <tr>{tables[0].columns.map(c => <th key={c.columnName}>{c.columnName}</th>)}</tr>
                                    </thead>
                                    <tbody>
                                        {tables[0].rows.slice(0, 4).map((row, i) => (
                                            <tr key={i}>
                                                {tables[0].columns.map(c => (
                                                    <td key={c.columnName} className="mono">{String(row[c.columnName])}</td>
                                                ))}
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>
                        </div>
                    )}

                    {/* Recent attempts */}
                    {recentAttempts.length > 0 && (
                        <div className="attempts-section">
                            <h4 className="schema-heading">🕐 Recent Attempts</h4>
                            {recentAttempts.map((a, i) => (
                                <div
                                    key={i}
                                    className={`attempt-item ${a.isCorrect ? 'correct' : 'wrong'}`}
                                    onClick={() => setSql(a.sql)}
                                    title="Click to restore this query"
                                >
                                    <span className={`attempt-icon`}>{a.isCorrect ? '✅' : '❌'}</span>
                                    <span className="attempt-sql mono">{a.sql.replace(/\s+/g, ' ').slice(0, 55)}…</span>
                                </div>
                            ))}
                        </div>
                    )}
                </aside>

                {/* ── RIGHT PANEL ─────────────────────────────────── */}
                <main className="right-panel">
                    {/* Verdict */}
                    {verdict && (
                        <div className={`verdict-banner ${verdict}`}>
                            {verdict === 'pass'
                                ? '🎉 Correct! Your output matches the expected result.'
                                : '❌ Output doesn\'t match. Check column selection and filters.'}
                        </div>
                    )}

                    {/* Editor */}
                    <div className="editor-wrap">
                        <div className="editor-topbar">
                            <span className="mono" style={{ fontSize: '0.75rem', color: '#64748b' }}>query.sql</span>
                            <span style={{ fontSize: '0.72rem', color: '#64748b' }}>Ctrl+Enter to run</span>
                        </div>
                        <Editor
                            height="260px"
                            defaultLanguage="sql"
                            theme="vs-dark"
                            value={sql}
                            onChange={v => setSql(v ?? '')}
                            options={{
                                fontSize: 14,
                                fontFamily: "'JetBrains Mono', monospace",
                                minimap: { enabled: false },
                                scrollBeyondLastLine: false,
                                padding: { top: 12, bottom: 12 },
                                lineNumbers: 'on',
                                wordWrap: 'on',
                            }}
                        />
                    </div>

                    {/* Actions */}
                    <div className="editor-actions">
                        <button className="btn-primary run-btn" onClick={runQuery} disabled={queryLoading}>
                            {queryLoading ? '⏳ Running…' : '▶ Run Query'}
                        </button>
                        <button className="btn-outline hint-btn" onClick={fetchHint}>
                            💡 Get AI Hint
                        </button>
                    </div>

                    {/* Results */}
                    <div className="results-section">
                        <h4 className="results-heading">Results</h4>
                        <div className="results-container">
                            <ResultsTable
                                columns={results.columns}
                                rows={results.rows}
                                error={queryError}
                                loading={queryLoading}
                            />
                        </div>
                    </div>
                </main>
            </div>

            {showHint && (
                <HintModal hint={hint} loading={hintLoading} onClose={() => setShowHint(false)} />
            )}
        </div>
    );
}
