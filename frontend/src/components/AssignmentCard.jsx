import { useRef, useEffect } from 'react';
import { Link } from 'react-router-dom';
import './AssignmentCard.scss';

const ICONS = { Easy: '💰', Medium: '🏢', Hard: '🏆' };
const TIMES = { Easy: '~5 min', Medium: '~10 min', Hard: '~20 min' };
const TAG_MAP = {
    'Find High Salary Employees': ['WHERE', 'SELECT', 'Filtering'],
    'Department-wise Employee Count': ['GROUP BY', 'COUNT()', 'Aggregation'],
    'Total Order Value per Customer': ['JOIN', 'SUM()', 'GROUP BY'],
    'Highest Paid Employee': ['MAX()', 'Subquery', 'WHERE IN'],
};

export default function AssignmentCard({ assignment, index, progress }) {
    const cardRef = useRef(null);

    // 3D tilt and glare on mouse move
    useEffect(() => {
        const card = cardRef.current;
        if (!card) return;
        const onMove = (e) => {
            const r = card.getBoundingClientRect();
            // Calculate relative X, Y (0 to 1) for the glare gradient
            const x = (e.clientX - r.left) / r.width;
            const y = (e.clientY - r.top) / r.height;

            // Calculate tilt degrees
            const rx = ((e.clientY - r.top - r.height / 2) / (r.height / 2)) * -12; // increased tilt
            const ry = ((e.clientX - r.left - r.width / 2) / (r.width / 2)) * 12;

            card.style.transform = `perspective(1000px) rotateX(${rx}deg) rotateY(${ry}deg) translateZ(10px)`;
            card.style.setProperty('--glare-x', `${x * 100}%`);
            card.style.setProperty('--glare-y', `${y * 100}%`);
            card.style.setProperty('--glare-op', '1');
        };
        const onLeave = () => {
            card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) translateZ(0)';
            card.style.setProperty('--glare-op', '0');
        };
        card.addEventListener('mousemove', onMove);
        card.addEventListener('mouseleave', onLeave);
        return () => { card.removeEventListener('mousemove', onMove); card.removeEventListener('mouseleave', onLeave); };
    }, []);

    const diff = assignment.description;
    const tags = TAG_MAP[assignment.title] ?? [];
    const icon = ICONS[diff] ?? '📄';
    const time = TIMES[diff] ?? '~10 min';
    const num = String(index + 1).padStart(2, '0');
    const done = progress?.isCompleted ?? false;
    const attempts = progress?.attemptCount ?? 0;

    return (
        <div
            ref={cardRef}
            className={`a-card ${done ? 'a-card--done' : ''}`}
            data-aos="fade-up"
            data-aos-delay={index * 100}
        >
            <div className="a-card__glare"></div>

            <div className="a-card__top">
                <span className={`badge ${diff.toLowerCase()}`}>
                    {diff === 'Easy' ? '🟢' : diff === 'Medium' ? '🟠' : '🔴'} {diff}
                </span>
                <div className="a-card__top-right">
                    {done && <span className="done-badge">✓ Solved</span>}
                    <span className="a-card__num mono">#{num}</span>
                </div>
            </div>

            <div className={`a-card__icon icon-${diff.toLowerCase()}`}>{icon}</div>
            <h3 className="a-card__title">{assignment.title}</h3>
            <p className="a-card__q">{assignment.question}</p>

            {tags.length > 0 && (
                <div className="a-card__tags">
                    {tags.map(t => <span key={t} className="tag mono">{t}</span>)}
                </div>
            )}

            <div className="a-card__footer">
                <Link to={`/assignments/${assignment._id}`} className="start-link">
                    {done ? 'Review →' : 'Start Challenge →'}
                </Link>
                <span className="a-card__meta mono">
                    {attempts > 0 ? `${attempts} attempt${attempts !== 1 ? 's' : ''}` : time}
                </span>
            </div>
        </div>
    );
}
