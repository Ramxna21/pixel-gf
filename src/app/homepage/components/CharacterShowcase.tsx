'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useAssets } from '@/hooks/useAssets';
import { getAudioUrl, AMBIENT_AUDIO_PATHS } from '@/lib/audioService';

const COSTUMES = [
  {
    id: 'dress',
    label: 'Evening Dress',
    color: '#1A1A2E',
    emoji: '👗',
    groundColor: '#0D0618',
  },
  {
    id: 'casual',
    label: 'Casual Chic',
    color: '#4A2040',
    emoji: '✨',
    groundColor: '#0D1A0D',
  },
  {
    id: 'traditional',
    label: 'Traditional',
    color: '#8B2020',
    emoji: '🌸',
    groundColor: '#1A0D06',
  },
  {
    id: 'fantasy',
    label: 'Fantasy',
    color: '#1A2E4A',
    emoji: '🌙',
    groundColor: '#050A1A',
  },
];

const BOY_CHARACTER_FALLBACK = '/assets/images/ChatGPT_Image_Apr_17__2026__04_14_16_PM-1776424610884.png';
const GIRL_CHARACTER_FALLBACK = '/assets/images/CW_senyum-1776546037986.png';

const GIRL_COSTUME_SLUGS: Record<string, string> = {
  dress: 'girl_dress',
  casual: 'girl_casual',
  traditional: 'girl_traditional',
  fantasy: 'girl_fantasy',
};

const BOY_COSTUME_SLUGS: Record<string, string> = {
  dress: 'boy_dress',
  casual: 'boy_casual',
  traditional: 'boy_traditional',
  fantasy: 'boy_fantasy',
};

// ─── 2D Anime Scene: Evening Dress → Garden Night (Fairy Lights) ───────────
// 🌿 BACKGROUND SCENE #1 — "Garden Night" (tampil saat kostum "Evening Dress")
function SceneCityNight() {
  return (
    <svg
      viewBox="0 0 800 420"
      preserveAspectRatio="xMidYMax slice"
      className="absolute inset-0 w-full h-full"
      style={{ imageRendering: 'pixelated' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="nightSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0B0624" />
          <stop offset="40%" stopColor="#15103A" />
          <stop offset="80%" stopColor="#252055" />
          <stop offset="100%" stopColor="#302045" />
        </linearGradient>
        <linearGradient id="balconyFloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#151620" />
          <stop offset="100%" stopColor="#08080C" />
        </linearGradient>
        <linearGradient id="railGlow" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#E8F4FF" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#E8F4FF" stopOpacity="0.1" />
        </linearGradient>
        <radialGradient id="cityGlow" cx="50%" cy="100%" r="60%">
          <stop offset="0%" stopColor="#FFC870" stopOpacity="0.4" />
          <stop offset="100%" stopColor="#FFC870" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="starGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFFFFF" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#FFFFFF" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Wide Night Sky */}
      <rect width="100%" height="420" fill="url(#nightSky)" />

      {/* Ambient City Glow from below */}
      <rect x="0" y="200" width="100%" height="220" fill="url(#cityGlow)" />

      {/* Distant City Skyline (Parallax Background 1) */}
      <g fill="#161435" opacity="0.6">
        {[0, 60, 140, 220, 290, 370, 450, 530, 610, 680, 760].map((x, i) => (
          <rect key={`bg1-${i}`} x={x} y={180 + (i % 3) * 20} width={40 + (i % 2) * 20} height={240} />
        ))}
      </g>
      
      {/* Midground City Skyline (Parallax 2) */}
      <g fill="#100D28" opacity="0.8">
        {[20, 100, 180, 250, 330, 410, 480, 560, 640, 720].map((x, i) => (
          <rect key={`bg2-${i}`} x={x} y={200 + (i % 4) * 15} width={35 + (i % 3) * 15} height={220} />
        ))}
        {/* City Lights (Windows) */}
        {[25, 105, 185, 255, 335, 415, 485, 565, 645, 725].map((x, i) => (
          <g key={`win-${i}`}>
            {[...Array(6)].map((_, j) => (
              <rect key={j} x={x} y={220 + j * 12 + (i % 4) * 15} width="3" height="4" fill={j % 2 === 0 ? "#FFD700" : "#FFF8DC"} opacity={Math.random() * 0.8 + 0.2} />
            ))}
            {[...Array(6)].map((_, j) => (
              <rect key={j} x={x + 12} y={230 + j * 14 + (i % 4) * 15} width="3" height="4" fill="#FFC870" opacity={Math.random() * 0.8 + 0.2} />
            ))}
          </g>
        ))}
      </g>

      {/* Foreground City Buildings (Parallax 3) */}
      <g fill="#080615">
        {[40, 150, 270, 380, 490, 600, 700, 810].map((x, i) => (
          <g key={`bg3-${i}`}>
            <rect x={x - 20} y={240 - (i % 2) * 30} width={60} height={200} />
            {/* Bright lights on foreground buildings */}
            {[...Array(5)].map((_, j) => (
              <rect key={j} x={x - 10} y={260 - (i % 2) * 30 + j * 18} width="40" height="2" fill="#E8F4FF" opacity="0.6" />
            ))}
          </g>
        ))}
      </g>

      {/* Wide Balcony Floor */}
      <rect x="0" y="320" width="100%" height="100" fill="url(#balconyFloor)" />
      {/* Floor reflection lines */}
      <rect x="0" y="325" width="100%" height="2" fill="#252A3D" opacity="0.5" />
      <rect x="0" y="335" width="100%" height="1" fill="#252A3D" opacity="0.3" />

      {/* Glass Railing (spanning entire width) */}
      <rect x="0" y="270" width="100%" height="50" fill="url(#railGlow)" />
      {/* Handrail (Gold / Metal) */}
      <rect x="0" y="265" width="100%" height="6" fill="#A89F91" />
      <rect x="0" y="267" width="100%" height="2" fill="#E8E5DF" />
      {/* Railing posts */}
      {[...Array(11)].map((_, i) => (
        <g key={`post-${i}`}>
          <rect x={i * 80} y="270" width="6" height="50" fill="#757066" />
          <rect x={i * 80 + 2} y="270" width="2" height="50" fill="#A89F91" />
        </g>
      ))}

      <g transform="translate(200, 0)">
        {/* Sky Elements in the center */}
        
        {/* Shooting Star */}
        <line x1="280" y1="40" x2="160" y2="120" stroke="#FFF" strokeWidth="1.5" opacity="0.6" />
        <line x1="280" y1="40" x2="250" y2="60" stroke="#FFF" strokeWidth="3" opacity="0.8" />
        
        {/* Stars */}
        {[
          [50, 40], [120, 80], [80, 120], [200, 60], 
          [280, 90], [350, 50], [320, 130], [160, 30]
        ].map(([x,y], i) => (
          <circle key={`star-${i}`} cx={x} cy={y} r={1.5 + (i%2)} fill="url(#starGlow)" opacity={0.6 + (i%3)*0.2} />
        ))}
        
        {/* Floating elegant sparkles / bokeh on balcony */}
        {[
          [100, 250], [140, 280], [80, 330], [180, 310],
          [280, 260], [330, 290], [360, 340], [250, 320], [210, 270]
        ].map(([x,y], i) => (
          <circle key={`sparkle-${i}`} cx={x} cy={y} r={2 + (i%3)*1.5} fill="#FFD700" opacity="0.4" />
        ))}
        
        {/* Potted plant / elegant decoration on the sides of the stage */}
        {/* Left Pot */}
        <path d="M 40 320 L 60 320 L 55 360 L 45 360 Z" fill="#151210" />
        <circle cx="50" cy="300" r="18" fill="#0A1510" />
        <circle cx="40" cy="290" r="14" fill="#102515" />
        <circle cx="60" cy="285" r="12" fill="#102515" />
        <circle cx="55" cy="310" r="10" fill="#051008" />
        
        {/* Right Pot */}
        <path d="M 340 320 L 360 320 L 355 360 L 345 360 Z" fill="#151210" />
        <circle cx="350" cy="300" r="18" fill="#0A1510" />
        <circle cx="360" cy="290" r="14" fill="#102515" />
        <circle cx="340" cy="285" r="12" fill="#102515" />
        <circle cx="345" cy="310" r="10" fill="#051008" />

      </g>
    </svg>
  );
}

// ─── 2D Anime Scene: Casual Chic → Zoo ─────────────────────────
// 🦒 BACKGROUND SCENE #2 — "Zoo" (tampil saat kostum "Casual Chic")
function SceneZoo() {
  return (
    <svg
      viewBox="0 0 800 420"
      preserveAspectRatio="xMidYMax slice"
      className="absolute inset-0 w-full h-full"
      style={{ imageRendering: 'pixelated' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="zooSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#6DB4EE" />
          <stop offset="60%" stopColor="#A8D5F6" />
          <stop offset="100%" stopColor="#D4F0CD" />
        </linearGradient>
      </defs>

      {/* Wide backgrounds */}
      <rect width="100%" height="420" fill="url(#zooSky)" />
      <rect x="0" y="320" width="100%" height="100" fill="#69B055" />

      <g transform="translate(200, 0)">
      {/* Sky */}
      <rect width="400" height="420" fill="url(#zooSky)" />
      
      {/* Sun */}
      <circle cx="340" cy="50" r="22" fill="#FFD700" opacity="0.9" />
      <circle cx="340" cy="50" r="30" fill="#FFD700" opacity="0.3" />

      {/* Clouds */}
      <rect x="30" y="60" width="70" height="22" rx="11" fill="#FFFFFF" opacity="0.9" />
      <rect x="50" y="45" width="50" height="25" rx="12.5" fill="#FFFFFF" opacity="0.9" />
      <rect x="240" y="70" width="90" height="26" rx="13" fill="#FFFFFF" opacity="0.8" />
      <rect x="270" y="55" width="60" height="26" rx="13" fill="#FFFFFF" opacity="0.8" />

      {/* Far hills/trees */}
      <ellipse cx="60" cy="290" rx="140" ry="70" fill="#58A048" opacity="0.6" />
      <ellipse cx="340" cy="285" rx="150" ry="80" fill="#4D923F" opacity="0.6" />

      {/* Base ground */}
      <rect x="0" y="320" width="400" height="100" fill="#69B055" />
      <rect x="0" y="318" width="400" height="8" fill="#5AA045" />

      {/* Zoo Path */}
      <ellipse cx="200" cy="380" rx="100" ry="25" fill="#C8B595" opacity="0.9" />
      <rect x="130" y="340" width="140" height="60" fill="#C8B595" opacity="0.9" />
      <ellipse cx="200" cy="340" rx="70" ry="15" fill="#C8B595" opacity="0.9" />
      <path d="M 130 340 L 100 420 L 300 420 L 270 340 Z" fill="#C8B595" opacity="0.9" />
      
      {/* Path borders (stone edges) */}
      {[...Array(6)].map((_, i) => (
        <rect key={`edgeL-${i}`} x={110 - i*5} y={345 + i*12} width="12" height="8" rx="4" fill="#A89A80" />
      ))}
      {[...Array(6)].map((_, i) => (
        <rect key={`edgeR-${i}`} x={275 + i*5} y={345 + i*12} width="12" height="8" rx="4" fill="#A89A80" />
      ))}

      {/* LEFT ENCLOSURE (Giraffe) */}
      <rect x="0" y="300" width="120" height="40" fill="#90C57A" />
      {/* Giraffe */}
      <rect x="45" y="160" width="16" height="150" rx="8" fill="#E8B850" /> {/* Neck */}
      {[180, 210, 240, 270].map((y, i) => (
        <rect key={`g-spot-${i}`} x="47" y={y} width="10" height="14" rx="5" fill="#A56A30" />
      ))}
      <rect x="35" y="140" width="28" height="26" rx="10" fill="#E8B850" /> {/* Head */}
      <rect x="25" y="150" width="20" height="12" rx="6" fill="#F0D090" /> {/* Snout */}
      <circle cx="48" cy="148" r="3" fill="#201000" /> {/* Eye */}
      <rect x="42" y="130" width="4" height="12" rx="2" fill="#E8B850" /> {/* Horn 1 */}
      <rect x="52" y="130" width="4" height="12" rx="2" fill="#E8B850" /> {/* Horn 2 */}
      <circle cx="44" cy="130" r="3" fill="#A56A30" />
      <circle cx="54" cy="130" r="3" fill="#A56A30" />
      <ellipse cx="33" cy="142" rx="6" ry="3" fill="#E8B850" transform="rotate(-30 33 142)" /> {/* Ear */}
      <ellipse cx="65" cy="142" rx="6" ry="3" fill="#E8B850" transform="rotate(30 65 142)" />

      {/* Left Fence */}
      <rect x="15" y="290" width="8" height="50" fill="#7A5530" />
      <rect x="55" y="290" width="8" height="50" fill="#7A5530" />
      <rect x="95" y="290" width="8" height="50" fill="#7A5530" />
      <rect x="0" y="300" width="120" height="6" fill="#956535" />
      <rect x="0" y="315" width="120" height="6" fill="#956535" />

      {/* Large Tree Left */}
      <rect x="-10" y="120" width="20" height="220" fill="#5C3A21" />
      <ellipse cx="10" cy="110" rx="55" ry="60" fill="#2E7D32" />
      <ellipse cx="30" cy="140" rx="40" ry="45" fill="#388E3C" />
      <ellipse cx="-15" cy="150" rx="45" ry="40" fill="#2E7D32" />

      {/* RIGHT ENCLOSURE (Hippo Pool) */}
      <ellipse cx="340" cy="325" rx="70" ry="25" fill="#4CA3D9" /> {/* Water pool */}
      <ellipse cx="340" cy="325" rx="60" ry="20" fill="#69C0EE" /> 
      
      {/* Hippo in water */}
      <ellipse cx="330" cy="318" rx="20" ry="12" fill="#807A8A" /> {/* Body */}
      <ellipse cx="310" cy="315" rx="16" ry="14" fill="#807A8A" /> {/* Head */}
      <ellipse cx="295" cy="320" rx="14" ry="10" fill="#958A9F" /> {/* Snout */}
      <circle cx="308" cy="310" r="2.5" fill="#1A1520" /> {/* Eye */}
      <circle cx="302" cy="310" r="2.5" fill="#1A1520" />
      <ellipse cx="292" cy="318" rx="3" ry="2" fill="#4A3F50" /> {/* Nostril */}
      <ellipse cx="286" cy="318" rx="3" ry="2" fill="#4A3F50" />
      {/* Ear */}
      <circle cx="318" cy="305" r="4" fill="#807A8A" />
      
      {/* Water ripples */}
      <rect x="290" y="332" width="30" height="2" rx="1" fill="#FFFFFF" opacity="0.5" />
      <rect x="330" y="328" width="40" height="2" rx="1" fill="#FFFFFF" opacity="0.5" />
      <rect x="350" y="338" width="20" height="2" rx="1" fill="#FFFFFF" opacity="0.5" />

      {/* Right Fence */}
      <rect x="280" y="295" width="8" height="45" fill="#858A90" />
      <rect x="320" y="295" width="8" height="45" fill="#858A90" />
      <rect x="360" y="295" width="8" height="45" fill="#858A90" />
      <rect x="270" y="305" width="130" height="4" fill="#A0A5AA" />
      <rect x="270" y="320" width="130" height="4" fill="#A0A5AA" />

      {/* Large Tree Right */}
      <rect x="385" y="160" width="18" height="180" fill="#5C3A21" />
      <ellipse cx="380" cy="150" rx="50" ry="55" fill="#388E3C" />
      <ellipse cx="350" cy="180" rx="40" ry="35" fill="#2E7D32" />
      <ellipse cx="400" cy="190" rx="45" ry="40" fill="#43A047" />

      {/* Zoo Signpost */}
      <rect x="130" y="300" width="6" height="50" fill="#6B4A30" />
      <rect x="115" y="305" width="45" height="15" fill="#E8D0A0" />
      <rect x="120" y="310" width="35" height="5" fill="#8B5A2B" opacity="0.8" />
      <polygon points="160,305 168,312.5 160,320" fill="#E8D0A0" />

      {/* Foreground Bushes */}
      <ellipse cx="100" cy="350" rx="35" ry="20" fill="#388E3C" />
      <ellipse cx="75" cy="365" rx="30" ry="25" fill="#2E7D32" />
      <ellipse cx="125" cy="360" rx="25" ry="18" fill="#1B5E20" />
      
      <ellipse cx="300" cy="360" rx="30" ry="20" fill="#388E3C" />
      <ellipse cx="330" cy="370" rx="40" ry="25" fill="#2E7D32" />
      <ellipse cx="275" cy="375" rx="25" ry="15" fill="#1B5E20" />

      {/* Flying birds */}
      <path d="M 180 80 Q 185 75 190 80 Q 195 75 200 80" stroke="#555" strokeWidth="1.5" fill="none" />
      <path d="M 210 60 Q 215 55 220 60 Q 225 55 230 60" stroke="#555" strokeWidth="1.5" fill="none" />
      </g>
    </svg>
  );
}

// ─── 2D Anime Scene: Traditional → Japan Sakura ──────────────────────────
// 🌸 BACKGROUND SCENE #3 — "Japan Sakura" (tampil saat kostum "Traditional")
// Ini adalah SVG 2D anime style murni, tidak menggunakan file gambar eksternal.
// Untuk mengganti dengan gambar nyata: hapus komponen SVG ini dan ganti dengan <Image> dari Next.js
function SceneVillage() {
  return (
    <svg
      viewBox="0 0 800 420"
      preserveAspectRatio="xMidYMax slice"
      className="absolute inset-0 w-full h-full"
      style={{ imageRendering: 'pixelated' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="japanSky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#B0D8F0" />
          <stop offset="45%" stopColor="#D8EEF8" />
          <stop offset="100%" stopColor="#F8E8F0" />
        </linearGradient>
      </defs>

      {/* Wide backgrounds */}
      <rect width="100%" height="420" fill="url(#japanSky)" />
      <rect x="0" y="320" width="100%" height="100" fill="#8AC870" />

      <g transform="translate(200, 0)">
      {/* Sky */}
      <rect width="400" height="420" fill="url(#japanSky)" />
      {/* Distant mountains (Mt Fuji style) */}
      <polygon points="140,200 200,100 260,200" fill="#C8D8E8" opacity="0.7" />
      <polygon points="155,200 200,115 245,200" fill="#D8E8F0" opacity="0.6" />
      {/* Snow cap */}
      <polygon points="185,115 200,100 215,115 205,120 195,120" fill="#FFFFFF" opacity="0.9" />
      {/* Far mountain range */}
      <polygon points="0,220 60,160 120,220" fill="#B0C8D8" opacity="0.5" />
      <polygon points="280,220 340,155 400,220" fill="#B0C8D8" opacity="0.5" />
      {/* Soft clouds */}
      <rect x="15" y="55" width="80" height="20" rx="10" fill="#FFFFFF" opacity="0.85" />
      <rect x="25" y="45" width="60" height="20" rx="10" fill="#FFFFFF" opacity="0.85" />
      <rect x="290" y="45" width="90" height="22" rx="11" fill="#FFFFFF" opacity="0.8" />
      <rect x="300" y="35" width="70" height="22" rx="11" fill="#FFFFFF" opacity="0.8" />
      <rect x="150" y="35" width="60" height="16" rx="8" fill="#FFFFFF" opacity="0.7" />
      {/* Ground / grass */}
      <rect x="0" y="320" width="400" height="100" fill="#8AC870" />
      <rect x="0" y="318" width="400" height="6" fill="#9AD878" />
      {/* Stone path */}
      <rect x="165" y="290" width="70" height="130" fill="#C8B890" opacity="0.6" />
      {[295,308,321,334,347,360,373,386,399,412].map((y,i) => (
        <rect key={i} x={170} y={y} width={60} height={8} rx="2" fill="#B8A880" opacity="0.5" />
      ))}
      {/* Torii gate */}
      {/* Pillars */}
      <rect x="175" y="220" width="10" height="100" fill="#CC2200" />
      <rect x="215" y="220" width="10" height="100" fill="#CC2200" />
      {/* Top beam (kasagi) */}
      <rect x="162" y="210" width="76" height="10" rx="2" fill="#CC2200" />
      {/* Curve ends */}
      <rect x="158" y="212" width="10" height="6" rx="2" fill="#AA1A00" />
      <rect x="232" y="212" width="10" height="6" rx="2" fill="#AA1A00" />
      {/* Second beam (nuki) */}
      <rect x="172" y="228" width="56" height="7" fill="#CC2200" />
      {/* Shimagi (top crossbar detail) */}
      <rect x="165" y="208" width="70" height="5" fill="#AA1A00" opacity="0.7" />
      {/* Japanese pagoda left */}
      <rect x="20" y="240" width="60" height="80" fill="#8B4513" />
      {/* Pagoda roofs */}
      <polygon points="5,240 50,210 95,240" fill="#CC2200" />
      <rect x="3" y="238" width="94" height="5" fill="#AA1A00" />
      <polygon points="15,215 50,192 85,215" fill="#CC2200" />
      <rect x="13" y="213" width="74" height="4" fill="#AA1A00" />
      <polygon points="25,195 50,178 75,195" fill="#CC2200" />
      <rect x="23" y="193" width="54" height="4" fill="#AA1A00" />
      {/* Pagoda windows */}
      <rect x="35" y="248" width="14" height="18" rx="7" fill="#5A3010" />
      <rect x="55" y="248" width="14" height="18" rx="7" fill="#5A3010" />
      <rect x="38" y="270" width="24" height="30" fill="#5A3010" />
      {/* Pagoda right (smaller) */}
      <rect x="320" y="255" width="55" height="65" fill="#8B4513" />
      <polygon points="308,255 347,228 386,255" fill="#CC2200" />
      <rect x="306" y="253" width="82" height="5" fill="#AA1A00" />
      <polygon points="318,232 347,212 376,232" fill="#CC2200" />
      <rect x="316" y="230" width="62" height="4" fill="#AA1A00" />
      <rect x="330" y="262" width="12" height="16" rx="6" fill="#5A3010" />
      <rect x="348" y="262" width="12" height="16" rx="6" fill="#5A3010" />
      <rect x="333" y="280" width="22" height="28" fill="#5A3010" />
      {/* Big sakura tree left */}
      <rect x="88" y="230" width="10" height="90" fill="#6B3A1F" />
      <rect x="88" y="200" width="5" height="35" fill="#6B3A1F" transform="rotate(-20 93 230)" />
      <rect x="93" y="195" width="5" height="35" fill="#6B3A1F" transform="rotate(15 93 230)" />
      <ellipse cx="93" cy="200" rx="48" ry="42" fill="#FFB8D8" opacity="0.9" />
      <ellipse cx="70" cy="215" rx="32" ry="28" fill="#FFC8E0" opacity="0.85" />
      <ellipse cx="116" cy="210" rx="30" ry="26" fill="#FFB8D8" opacity="0.85" />
      <ellipse cx="93" cy="182" rx="36" ry="30" fill="#FFD0E8" opacity="0.8" />
      {/* Big sakura tree right */}
      <rect x="302" y="230" width="10" height="90" fill="#6B3A1F" />
      <rect x="302" y="200" width="5" height="35" fill="#6B3A1F" transform="rotate(20 307 230)" />
      <rect x="307" y="195" width="5" height="35" fill="#6B3A1F" transform="rotate(-15 307 230)" />
      <ellipse cx="307" cy="200" rx="46" ry="40" fill="#FFB8D8" opacity="0.9" />
      <ellipse cx="284" cy="212" rx="30" ry="26" fill="#FFB8D8" opacity="0.85" />
      <ellipse cx="330" cy="210" rx="32" ry="28" fill="#FFC8E0" opacity="0.85" />
      <ellipse cx="307" cy="183" rx="34" ry="28" fill="#FFD0E8" opacity="0.8" />
      {/* Small sakura tree center-left */}
      <rect x="130" y="265" width="7" height="55" fill="#6B3A1F" />
      <ellipse cx="133" cy="255" rx="28" ry="24" fill="#FFB8D8" opacity="0.85" />
      <ellipse cx="118" cy="265" rx="18" ry="16" fill="#FFB8D8" opacity="0.8" />
      <ellipse cx="148" cy="262" rx="18" ry="16" fill="#FFC8E0" opacity="0.8" />
      {/* Small sakura tree center-right */}
      <rect x="263" y="265" width="7" height="55" fill="#6B3A1F" />
      <ellipse cx="266" cy="255" rx="28" ry="24" fill="#FFB8D8" opacity="0.85" />
      <ellipse cx="251" cy="265" rx="18" ry="16" fill="#FFB8D8" opacity="0.8" />
      <ellipse cx="281" cy="262" rx="18" ry="16" fill="#FFC8E0" opacity="0.8" />
      {/* Falling sakura petals */}
      {[
        [60,290],[90,310],[115,280],[145,300],[170,275],[230,278],[255,295],[285,305],
        [310,285],[340,300],[365,275],[50,340],[380,330],[200,260],[160,330],[240,325],
      ].map(([x,y],i) => (
        <ellipse key={i} cx={x} cy={y} rx="3" ry="2"
          fill={i%2===0?'#FFB8D8':'#FFD0E8'} opacity="0.75"
          transform={`rotate(${i*22} ${x} ${y})`} />
      ))}
      {/* Lanterns on torii */}
      <rect x="193" y="232" width="14" height="18" rx="3" fill="#FFD700" opacity="0.85" />
      <rect x="196" y="230" width="8" height="4" fill="#CC2200" />
      <rect x="196" y="250" width="8" height="4" fill="#CC2200" />
      <ellipse cx="200" cy="241" rx="7" ry="9" fill="#FFE566" opacity="0.4" />
      </g>
    </svg>
  );
}

// ─── 2D Anime Scene: Fantasy → Castle with Moon & Night Sky ──────────────
// 🏰 BACKGROUND SCENE #4 — "Fantasy Castle" (tampil saat kostum "Fantasy")
// Ini adalah SVG 2D anime style murni, tidak menggunakan file gambar eksternal.
// Untuk mengganti dengan gambar nyata: hapus komponen SVG ini dan ganti dengan <Image> dari Next.js
function SceneFantasy() {
  return (
    <svg
      viewBox="0 0 800 420"
      preserveAspectRatio="xMidYMax slice"
      className="absolute inset-0 w-full h-full"
      style={{ imageRendering: 'pixelated' }}
      xmlns="http://www.w3.org/2000/svg"
    >
      <defs>
        <linearGradient id="hallWall" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#1C103F" />
          <stop offset="100%" stopColor="#0B0518" />
        </linearGradient>
        <linearGradient id="hallFloor" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="#0B0518" />
          <stop offset="100%" stopColor="#05020A" />
        </linearGradient>
        <linearGradient id="pillarGrad" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#FFD700" />
          <stop offset="50%" stopColor="#FFF8DC" />
          <stop offset="100%" stopColor="#B8860B" />
        </linearGradient>
        <linearGradient id="redCarpet" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0%" stopColor="#8B0000" />
          <stop offset="50%" stopColor="#B22222" />
          <stop offset="100%" stopColor="#8B0000" />
        </linearGradient>
        <radialGradient id="chandelierGlow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#FFD700" stopOpacity="0.3" />
          <stop offset="100%" stopColor="#FFD700" stopOpacity="0" />
        </radialGradient>
        <radialGradient id="magicMotes" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#E6E6FA" stopOpacity="0.8" />
          <stop offset="100%" stopColor="#E6E6FA" stopOpacity="0" />
        </radialGradient>
      </defs>

      {/* Wide backgrounds */}
      <rect width="100%" height="420" fill="url(#hallWall)" />
      <rect x="0" y="310" width="100%" height="110" fill="url(#hallFloor)" />
      <rect x="0" y="306" width="100%" height="4" fill="#B8860B" />

      {/* Grand Pillars on wide background (parallax-like effect) */}
      {[20, 120, 680, 780].map((x, i) => (
        <g key={i}>
          <rect x={x - 16} y="0" width="32" height="310" fill="url(#pillarGrad)" />
          {/* Pillar base */}
          <rect x={x - 22} y="290" width="44" height="20" fill="#8B6508" />
          {/* Pillar capital */}
          <rect x={x - 22} y="0" width="44" height="30" fill="#8B6508" />
          {/* Pillar fluting (lines) */}
          <rect x={x - 8} y="30" width="2" height="260" fill="#8B6508" opacity="0.5" />
          <rect x={x} y="30" width="2" height="260" fill="#8B6508" opacity="0.5" />
          <rect x={x + 8} y="30" width="2" height="260" fill="#8B6508" opacity="0.5" />
        </g>
      ))}

      <g transform="translate(200, 0)">
        {/* Center of the Royal Hall */}
        
        {/* Giant arched window framing the night sky */}
        <path d="M 120 160 A 80 80 0 0 1 280 160 L 280 310 L 120 310 Z" fill="#03010A" />
        
        {/* Night sky outside the window */}
        <circle cx="200" cy="140" r="40" fill="#E8F4FF" opacity="0.9" /> {/* Moon */}
        <circle cx="200" cy="140" r="60" fill="#E8F4FF" opacity="0.2" /> {/* Moon glow */}
        {/* Stars */}
        {[140, 160, 240, 260].map((x, i) => (
          <circle key={`star-${i}`} cx={x} cy={100 + (i * 20 % 30)} r="1.5" fill="#FFF" opacity="0.8" />
        ))}
        
        {/* Window lattice / grid */}
        <path d="M 120 160 A 80 80 0 0 1 280 160 L 280 310 L 120 310 Z" fill="none" stroke="#B8860B" strokeWidth="4" />
        <rect x="198" y="80" width="4" height="230" fill="#B8860B" />
        <rect x="120" y="180" width="160" height="4" fill="#B8860B" />
        <rect x="120" y="240" width="160" height="4" fill="#B8860B" />
        
        {/* Grand Red Curtains flanking the window */}
        <path d="M 80 0 Q 140 100 120 310 L 60 310 Q 80 100 80 0 Z" fill="#4A0000" />
        <path d="M 100 0 Q 150 120 130 310 L 110 310 Q 130 120 100 0 Z" fill="#8B0000" />
        
        <path d="M 320 0 Q 260 100 280 310 L 340 310 Q 320 100 320 0 Z" fill="#4A0000" />
        <path d="M 300 0 Q 250 120 270 310 L 290 310 Q 270 120 300 0 Z" fill="#8B0000" />
        
        {/* Curtain tie-backs (Gold ropes) */}
        <rect x="110" y="190" width="30" height="8" rx="4" fill="#FFD700" />
        <rect x="260" y="190" width="30" height="8" rx="4" fill="#FFD700" />

        {/* Center Chandelier */}
        <line x1="200" y1="0" x2="200" y2="40" stroke="#FFD700" strokeWidth="3" />
        <path d="M 150 70 Q 200 90 250 70 L 210 40 L 190 40 Z" fill="#B8860B" />
        <path d="M 170 55 Q 200 70 230 55 L 205 40 L 195 40 Z" fill="#FFD700" />
        <circle cx="200" cy="65" r="50" fill="url(#chandelierGlow)" />
        {/* Candles on chandelier */}
        {[155, 175, 200, 225, 245].map((x, i) => (
          <g key={`candle-${i}`}>
            <rect x={x-2} y={55 + Math.abs(x-200)*0.25} width="4" height="12" fill="#FFF" />
            <circle cx={x} cy={50 + Math.abs(x-200)*0.25} r="4" fill="#FFCC00" />
            <circle cx={x} cy={50 + Math.abs(x-200)*0.25} r="8" fill="url(#chandelierGlow)" />
          </g>
        ))}

        {/* Grand Staircase / Dais leading up to window */}
        <rect x="100" y="310" width="200" height="6" fill="#1A1025" />
        <rect x="80" y="316" width="240" height="8" fill="#251835" />
        
        {/* Red Carpet extending from window to foreground */}
        <path d="M 160 324 L 240 324 L 320 420 L 80 420 Z" fill="url(#redCarpet)" />
        <line x1="160" y1="324" x2="80" y2="420" stroke="#FFD700" strokeWidth="4" />
        <line x1="240" y1="324" x2="320" y2="420" stroke="#FFD700" strokeWidth="4" />

        {/* Floating magic motes / royal dust */}
        {[
          [100, 280], [140, 250], [120, 360], 
          [300, 270], [260, 240], [280, 350],
          [200, 290], [170, 330], [230, 340]
        ].map(([x,y], i) => (
          <circle key={`mote-${i}`} cx={x} cy={y} r="3" fill="url(#magicMotes)" opacity="0.6" />
        ))}
      </g>
    </svg>
  );
}

const SCENE_COMPONENTS = [SceneCityNight, SceneZoo, SceneVillage, SceneFantasy];

export default function CharacterShowcase() {
  const [selectedCostume, setSelectedCostume] = useState(0);
  const [visible, setVisible] = useState(false);
  const [isIntersecting, setIsIntersecting] = useState(false);
  const [isMemoryPlaying, setIsMemoryPlaying] = useState(false);
  const isMemoryPlayingRef = useRef(false);
  const isPlayingAmbient = isIntersecting && !isMemoryPlaying;

  const sectionRef = useRef<HTMLDivElement>(null);
  const { getAssetUrl } = useAssets();

  // ── Layer 2: Ambient audio refs ──────────────────────────────────────────
  const ambientRef = useRef<HTMLAudioElement | null>(null);
  const ambientFadeRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const ambientUrlsRef = useRef<Record<string, string | null>>({});
  const isMountedRef = useRef(true);

  // Pre-load ambient URLs once on mount
  useEffect(() => {
    isMountedRef.current = true;
    const loadUrls = async () => {
      const entries = await Promise.all(
        Object.entries(AMBIENT_AUDIO_PATHS).map(async ([id, path]) => {
          const url = await getAudioUrl(path);
          return [id, url] as [string, string | null];
        })
      );
      if (isMountedRef.current) {
        ambientUrlsRef.current = Object.fromEntries(entries);
      }
    };
    loadUrls();
    return () => {
      isMountedRef.current = false;
    };
  }, []);

  // Fade-out helper
  const fadeOutAmbient = useCallback((audio: HTMLAudioElement, onDone?: () => void) => {
    if (ambientFadeRef.current) clearInterval(ambientFadeRef.current);
    const step = audio.volume / 20;
    ambientFadeRef.current = setInterval(() => {
      if (audio.volume > step) {
        audio.volume = Math.max(0, audio.volume - step);
      } else {
        audio.volume = 0;
        audio.pause();
        if (ambientFadeRef.current) clearInterval(ambientFadeRef.current);
        ambientFadeRef.current = null;
        onDone?.();
      }
    }, 50);
  }, []);

  // Switch ambient track when costume changes or visibility changes
  useEffect(() => {
    const costumeId = COSTUMES[selectedCostume].id;
    const url = ambientUrlsRef.current[costumeId];

    const startNew = () => {
      if (!url || !isMountedRef.current || !isPlayingAmbient) return;
      const audio = new Audio(url);
      audio.loop = true;
      audio.volume = 0;
      ambientRef.current = audio;
      audio.play().catch(() => {});
      // Fade in to 0.18 (subtle)
      if (ambientFadeRef.current) clearInterval(ambientFadeRef.current);
      const target = 0.18;
      const step = target / 20;
      ambientFadeRef.current = setInterval(() => {
        if (audio.volume < target - step) {
          audio.volume = Math.min(target, audio.volume + step);
        } else {
          audio.volume = target;
          if (ambientFadeRef.current) clearInterval(ambientFadeRef.current);
          ambientFadeRef.current = null;
        }
      }, 50);
    };

    if (ambientRef.current) {
      const old = ambientRef.current;
      fadeOutAmbient(old, () => {
        old.src = '';
        startNew();
      });
    } else {
      startNew();
    }

    return () => {
      // cleanup handled by next effect run or unmount
    };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedCostume, isPlayingAmbient]);

  // Stop ambient on unmount
  useEffect(() => {
    return () => {
      isMountedRef.current = false;
      if (ambientFadeRef.current) clearInterval(ambientFadeRef.current);
      if (ambientRef.current) {
        ambientRef.current.pause();
        ambientRef.current.src = '';
        ambientRef.current = null;
      }
    };
  }, []);

  // Listen to memory song play/stop events
  useEffect(() => {
    const handleFadeOut = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.source === 'memory') {
        setIsMemoryPlaying(true);
        isMemoryPlayingRef.current = true;
      }
    };
    const handleFadeIn = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (detail?.source === 'memory') {
        setIsMemoryPlaying(false);
        isMemoryPlayingRef.current = false;
      }
    };
    window.addEventListener('bgmusic:fadeout', handleFadeOut);
    window.addEventListener('bgmusic:fadein', handleFadeIn);
    return () => {
      window.removeEventListener('bgmusic:fadeout', handleFadeOut);
      window.removeEventListener('bgmusic:fadein', handleFadeIn);
    };
  }, []);

  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            setVisible(true);
            setIsIntersecting(true);
            window.dispatchEvent(new CustomEvent('bgmusic:fadeout', { detail: { delay: 0, fade: false, source: 'showcase' } }));
          } else {
            setIsIntersecting(false);
            if (!isMemoryPlayingRef.current) {
              window.dispatchEvent(new CustomEvent('bgmusic:fadein', { detail: { source: 'showcase' } }));
            }
          }
        });
      },
      { threshold: 0.4 } // Higher threshold so it doesn't trigger while reading the last memory
    );
    if (sectionRef.current) observer.observe(sectionRef.current);
    return () => observer.disconnect();
  }, []);

  const costume = COSTUMES[selectedCostume];
  const girlSlug = GIRL_COSTUME_SLUGS[costume.id];
  const girlCharSrc = getAssetUrl(girlSlug, GIRL_CHARACTER_FALLBACK);
  const boySlug = BOY_COSTUME_SLUGS[costume.id];
  const boyCharSrc = getAssetUrl(boySlug, '') || getAssetUrl('boy_character', BOY_CHARACTER_FALLBACK);
  const SceneComponent = SCENE_COMPONENTS[selectedCostume];

  return (
    <section
      id="characters"
      ref={sectionRef}
      className="relative py-24 px-6 overflow-hidden"
      style={{
        background: 'linear-gradient(180deg, #0D0618 0%, #1C0A30 40%, #2D1B4E 100%)',
        zIndex: 20,
      }}
    >
      {/* Atmospheric glow */}
      <div
        className="absolute pointer-events-none"
        style={{
          width: 600,
          height: 600,
          borderRadius: '50%',
          background: 'radial-gradient(circle, rgba(232,113,58,0.08) 0%, transparent 70%)',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          filter: 'blur(40px)',
        }}
      />

      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="text-center mb-16">
          <span
            className="font-pixel text-xs uppercase tracking-widest mb-4 block"
            style={{
              color: '#F4A261',
              opacity: visible ? 1 : 0,
              animation: visible ? 'fadeInUp 0.7s ease-out 0.1s both' : 'none',
            }}
          >
            🎮 your anime selves
          </span>
          <h2
            className="font-display font-black leading-none mb-4"
            style={{
              fontSize: 'clamp(2rem, 6vw, 4rem)',
              letterSpacing: '-0.03em',
              color: '#FFF1E6',
              opacity: visible ? 1 : 0,
              animation: visible ? 'fadeInUp 0.7s ease-out 0.2s both' : 'none',
            }}
          >
            Characters Built
            <br />
            <span
              style={{
                background: 'linear-gradient(135deg, #E76F8A, #F4A261)',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                backgroundClip: 'text',
              }}
            >
              Just for You.
            </span>
          </h2>
        </div>

        {/* Main showcase */}
        <div className="max-w-4xl mx-auto w-full">
          {/* Character preview */}
          <div
            className="w-full"
            style={{
              opacity: visible ? 1 : 0,
              animation: visible ? 'fadeInUp 0.8s ease-out 0.3s both' : 'none',
            }}
          >
            {/* Character stage */}
            <div
              className="relative rounded-2xl overflow-hidden"
              style={{
                border: '2px solid rgba(244,162,97,0.2)',
                minHeight: 420,
                background: '#050A1A',
              }}
            >
              {/* 2D anime scene background — swaps per costume */}
              <div
                key={costume.id}
                className="absolute inset-0"
                style={{ transition: 'opacity 0.4s ease' }}
              >
                <SceneComponent />
              </div>

              {/* Characters displayed */}
              <div className="absolute bottom-6 left-0 right-0 flex items-end justify-center gap-8" style={{ zIndex: 2 }}>
                {/* Boy — left */}
                <div style={{ animation: 'idleBobSlow 4s ease-in-out infinite' }}>
                  <ShowcaseBoy costumeColor={costume.color} src={boyCharSrc} />
                </div>
                {/* Heart between them */}
                <div
                  className="mb-16 font-pixel text-2xl"
                  style={{
                    color: '#E76F8A',
                    animation: 'idleBob 2.5s ease-in-out infinite',
                    animationDelay: '0.5s',
                  }}
                >
                  ♥
                </div>
                {/* Girl — right */}
                <div style={{ animation: 'idleBob 3.5s ease-in-out infinite' }}>
                  <ShowcaseGirl costumeColor={costume.color} src={girlCharSrc} />
                </div>
              </div>

              {/* Ground overlay */}
              <div
                className="absolute bottom-0 left-0 right-0"
                style={{ height: 60, background: costume.groundColor, transition: 'background 0.6s ease', zIndex: 1 }}
              />
              <svg
                viewBox="0 0 400 60"
                preserveAspectRatio="none"
                className="absolute left-0 w-full"
                style={{ height: 30, bottom: 58, zIndex: 1 }}
              >
                <path
                  d="M0,30 Q100,10 200,20 Q300,30 400,15 L400,60 L0,60 Z"
                  fill={costume.groundColor}
                />
              </svg>

              {/* Costume badge */}
              <div
                className="absolute top-4 left-4 flex items-center gap-2 rounded-full px-3 py-1.5"
                style={{
                  background: 'rgba(13,6,24,0.8)',
                  border: '1px solid rgba(244,162,97,0.3)',
                  backdropFilter: 'blur(8px)',
                  zIndex: 3,
                }}
              >
                <span>{costume.emoji}</span>
                <span className="font-pixel text-xs" style={{ color: '#F4A261' }}>
                  {costume.label}
                </span>
              </div>
            </div>

            {/* Costume selector */}
            <div className="flex gap-3 mt-4 justify-center">
              {COSTUMES.map((c, idx) => (
                <button
                  key={c.id}
                  onClick={() => setSelectedCostume(idx)}
                  className="flex items-center gap-1.5 rounded-full px-3 py-2 text-xs font-medium transition-all duration-300"
                  style={{
                    background: selectedCostume === idx
                      ? 'linear-gradient(135deg, #E8713A, #F4A261)'
                      : 'rgba(255,241,230,0.06)',
                    border: `1px solid ${selectedCostume === idx ? 'transparent' : 'rgba(255,241,230,0.15)'}`,
                    color: selectedCostume === idx ? '#FFF1E6' : 'rgba(255,241,230,0.6)',
                    transform: selectedCostume === idx ? 'scale(1.05)' : 'scale(1)',
                  }}
                >
                  <span>{c.emoji}</span>
                  <span className="hidden sm:inline font-pixel" style={{ fontSize: 10 }}>
                    {c.label}
                  </span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function ShowcaseGirl({ costumeColor, src }: { costumeColor: string; src: string }) {
  if (src && src !== '') {
    return (
      <img
        src={src}
        alt="2D anime girl character"
        width={110}
        height={210}
        style={{ imageRendering: 'pixelated', objectFit: 'contain', mixBlendMode: 'multiply' }}
      />
    );
  }
  return (
    <svg width="110" height="200" viewBox="0 0 72 130" fill="none" xmlns="http://www.w3.org/2000/svg" style={{ imageRendering: 'pixelated' }}>
      <rect x="22" y="6" width="28" height="6" fill="#1A0A0A" />
      <rect x="18" y="10" width="4" height="16" fill="#1A0A0A" />
      <rect x="50" y="10" width="4" height="16" fill="#1A0A0A" />
      <rect x="22" y="12" width="28" height="26" fill="#FDDCB5" />
      <rect x="28" y="22" width="6" height="2" rx="1" fill="#1A0A0A" />
      <rect x="38" y="22" width="6" height="2" rx="1" fill="#1A0A0A" />
      <rect x="24" y="28" width="5" height="2" rx="1" fill="#F4A0A0" opacity="0.7" />
      <rect x="43" y="28" width="5" height="2" rx="1" fill="#F4A0A0" opacity="0.7" />
      <rect x="30" y="32" width="12" height="2" rx="1" fill="#5A3010" />
      <rect x="18" y="24" width="4" height="4" rx="1" fill="#F4A261" />
      <rect x="50" y="24" width="4" height="4" rx="1" fill="#F4A261" />
      <rect x="30" y="38" width="12" height="8" fill="#FDDCB5" />
      <rect x="16" y="44" width="40" height="42" rx="2" fill={costumeColor} />
      <rect x="20" y="44" width="32" height="3" fill={costumeColor === '#1A1A2E' ? '#2A2A4E' : costumeColor} opacity="0.7" />
      <rect x="8" y="46" width="10" height="28" rx="3" fill="#FDDCB5" />
      <rect x="54" y="46" width="10" height="28" rx="3" fill="#FDDCB5" />
      <rect x="22" y="86" width="10" height="36" rx="2" fill={costumeColor} />
      <rect x="40" y="86" width="10" height="36" rx="2" fill={costumeColor} />
      <rect x="20" y="118" width="14" height="6" rx="2" fill="#1A0A0A" />
      <rect x="38" y="118" width="14" height="6" rx="2" fill="#1A0A0A" />
    </svg>
  );
}

function ShowcaseBoy({ costumeColor, src }: { costumeColor: string; src: string }) {
  return (
    <img
      src={src}
      alt="2D anime boy character with black hair, cream open shirt, blue t-shirt, dark jeans, and grey shoes"
      width={110}
      height={210}
      style={{ imageRendering: 'pixelated', objectFit: 'contain', transform: 'scaleX(-1)' }}
    />
  );
}