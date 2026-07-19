import React from 'react';
import AppLogo from '@/components/ui/AppLogo';

export default function Footer() {
  return (
    <footer
      className="relative py-16 px-6 border-t"
      style={{
        background: '#0D0618',
        borderColor: 'rgba(255,241,230,0.06)',
        zIndex: 20,
      }}
    >
      <div className="max-w-6xl mx-auto flex flex-col items-center gap-6">
        {/* Logo + name */}
        <div className="flex items-center gap-2">
          <AppLogo size={28} />
          <span
            className="font-display font-bold text-base tracking-tight"
            style={{ color: 'rgba(255,241,230,0.8)' }}
          >
            Memogift
          </span>
        </div>

        {/* Social icons */}
        <div className="flex items-center gap-5">
          {[
            { label: 'Instagram', emoji: '📸' },
            { label: 'Twitter', emoji: '🐦' },
            { label: 'TikTok', emoji: '🎵' },
          ].map(social => (
            <button
              key={social.label}
              className="flex items-center gap-1.5 rounded-full px-3 py-1.5 transition-all duration-200"
              style={{
                background: 'rgba(255,241,230,0.04)',
                border: '1px solid rgba(255,241,230,0.08)',
                color: 'rgba(255,241,230,0.5)',
                fontSize: 12,
              }}
              aria-label={social.label}
              onMouseEnter={e => {
                (e.currentTarget as HTMLElement).style.color = '#F4A261';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(244,162,97,0.3)';
              }}
              onMouseLeave={e => {
                (e.currentTarget as HTMLElement).style.color = 'rgba(255,241,230,0.5)';
                (e.currentTarget as HTMLElement).style.borderColor = 'rgba(255,241,230,0.08)';
              }}
            >
              <span>{social.emoji}</span>
              <span className="font-pixel" style={{ fontSize: 10 }}>{social.label}</span>
            </button>
          ))}
        </div>

        {/* Copyright + links */}
        <div className="flex flex-col sm:flex-row items-center gap-4 text-center">
          <p
            className="font-pixel"
            style={{ color: 'rgba(255,241,230,0.25)', fontSize: 10 }}
          >
            © 2026 Memogift. Made with ♥ for every love story.
          </p>
          <div className="hidden sm:flex items-center gap-4">
            {['Privacy', 'Terms'].map(link => (
              <a
                key={link}
                href="#"
                className="font-pixel transition-colors duration-200"
                style={{ color: 'rgba(255,241,230,0.25)', fontSize: 10 }}
                onMouseEnter={e => { (e.currentTarget as HTMLElement).style.color = '#F4A261'; }}
                onMouseLeave={e => { (e.currentTarget as HTMLElement).style.color = 'rgba(255,241,230,0.25)'; }}
              >
                {link}
              </a>
            ))}
          </div>
        </div>
      </div>
    </footer>
  );
}