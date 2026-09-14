import Link from "next/link";
import React from "react";

export default function Navbar() {
    return (
        <header className="header">
            <Link href="/" className="logo cursor-pointer tracking-tight" style={{ textDecoration: 'none' }}>
                K<span style={{ color: 'var(--text-primary)' }}>ET</span> / Profiler
            </Link>
            <nav className="nav-links">
                <Link href="/about" className="text-secondary hover:text-primary transition-colors" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.95rem' }}>About</Link>
                <Link href="/docs" className="text-secondary hover:text-primary transition-colors" style={{ textDecoration: 'none', color: 'var(--text-secondary)', fontWeight: 500, fontSize: '0.95rem' }}>Documentation</Link>
                <a href="https://github.com/AxionSoftware-Inc/Quantum-Circuit" target="_blank" rel="noopener noreferrer" className="btn" style={{ textDecoration: 'none' }}>
                    <svg width="18" height="18" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
                    </svg>
                    GitHub
                </a>
                <a href="https://unitary.foundation" target="_blank" rel="noopener noreferrer" className="btn-primary" style={{ textDecoration: 'none' }}>Unitary Foundation</a>
            </nav>
        </header>
    );
}
