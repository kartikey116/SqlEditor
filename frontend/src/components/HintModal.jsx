import { useEffect } from 'react';
import './HintModal.scss';

export default function HintModal({ hint, loading, onClose }) {
    // Close on Escape
    useEffect(() => {
        const fn = (e) => { if (e.key === 'Escape') onClose(); };
        window.addEventListener('keydown', fn);
        return () => window.removeEventListener('keydown', fn);
    }, [onClose]);

    return (
        <div className="hint-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="hint-modal" data-aos="zoom-in" data-aos-duration="300">
                <div className="hint-icon">💡</div>
                <h3>AI Hint</h3>

                {loading ? (
                    <div className="hint-loading">
                        <div className="hint-spinner" />
                        <span>Generating hint…</span>
                    </div>
                ) : (
                    <p className="hint-text">{hint}</p>
                )}

                <button className="btn-primary hint-close" onClick={onClose}>Got it!</button>
            </div>
        </div>
    );
}
