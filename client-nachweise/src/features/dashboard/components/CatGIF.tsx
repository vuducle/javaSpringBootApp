'use client';
import React from 'react';
import Image from 'next/image';

function CatGIF() {
  return (
    <div className="armin-dorri abdullah-yildirim">
      <div className="bg-white/60 dark:bg-zinc-800/50 backdrop-blur-md border border-white/20 dark:border-zinc-700/40 shadow-lg rounded-2xl p-6 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4 text-primary">
          🐱 Cat GIF
        </h2>
        <Image
          src="https://cataas.com/cat/gif"
          alt="Quote illustration"
          width={400}
          height={200}
          loading="lazy"
        />
      </div>
    </div>
  );
}

export default CatGIF;
