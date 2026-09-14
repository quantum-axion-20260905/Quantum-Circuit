import Workspace from '../components/Workspace';

export default function Home() {
  return (
    <main style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
      <div style={{ textAlign: 'center', padding: '4rem 2rem 1rem' }} className="animate-fade">
        <h1 style={{ fontSize: '3.5rem', fontWeight: 800, marginBottom: '1rem', background: 'linear-gradient(135deg, #fff, var(--text-secondary))', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
          Quantum Complexity <br /> Profiler
        </h1>
        <p style={{ color: 'var(--text-secondary)', fontSize: '1.2rem', maxWidth: '600px', margin: '0 auto', lineHeight: '1.6' }}>
          Find where entanglement grows, which cut becomes a bottleneck, and what to inspect next — entirely in your browser.
        </p>
      </div>

      <Workspace />
    </main>
  );
}
