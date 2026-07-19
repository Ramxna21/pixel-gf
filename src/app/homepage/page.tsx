'use client';

import React from 'react';
import HeroScene from './components/HeroScene';
import MemorySection from './components/MemorySection';
import CharacterShowcase from './components/CharacterShowcase';
import Footer from '@/components/Footer';

export default function Homepage() {
  return (
    <main className="relative bg-background overflow-x-hidden">
      <HeroScene />
      <MemorySection />
      <CharacterShowcase />
      <Footer />
    </main>
  );
}