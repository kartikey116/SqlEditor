import './ResultsTable.scss';

export default function ResultsTable({ columns = [], rows = [], error = null, loading = false }) {
    if (loading) {
        return (
            <div className="results-state">
                <div className="results-spinner" />
                <span>Executing query…</span>
            </div>
        );
    }
    if (error) {
        return (
            <div className="results-state results-error">
                <span className="results-error-icon">✗</span>
                <pre>{error}</pre>
            </div>
        );
    }
    if (!columns.length) {
        return (
            <div className="results-state results-empty">
                <span>▶ Run a query to see results here</span>
            </div>
        );
    }

    return (
        <div className="results-wrap">
            <div className="results-meta">
                {rows.length} row{rows.length !== 1 ? 's' : ''} returned
            </div>
            <div className="results-scroll">
                <table className="results-table">
                    <thead>
                        <tr>
                            {columns.map(col => <th key={col}>{col}</th>)}
                        </tr>
                    </thead>
                    <tbody>
                        {rows.map((row, i) => (
                            <tr key={i}>
                                {columns.map(col => (
                                    <td key={col}>{row[col] === null ? <span className="null-val">NULL</span> : String(row[col])}</td>
                                ))}
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>
        </div>
    );
}
