'use client';
import React, { useState } from 'react';
import Image from 'next/image';
import Lightbox from 'yet-another-react-lightbox';
import 'yet-another-react-lightbox/styles.css';

function CatGIF() {
  const [openSrc, setOpenSrc] = useState<string | null>(null);
  const src = 'https://cataas.com/cat/gif';

  return (
    <div className="armin-dorri abdullah-yildirim">
      <div className="bg-white/60 dark:bg-zinc-800/50 backdrop-blur-md border border-white/20 dark:border-zinc-700/40 shadow-lg rounded-2xl p-6 flex flex-col items-center">
        <h2 className="text-2xl font-bold mb-4 text-primary">
          🐱 Cat GIF
        </h2>
        <button
          type="button"
          onClick={() => setOpenSrc(src)}
          className="p-0 m-0"
          aria-label="Open GIF preview"
        >
          <Image
            src={src}
            alt="Quote illustration"
            width={400}
            height={200}
            loading="lazy"
          />
        </button>
      </div>
      {openSrc ? (
        <Lightbox
          open={!!openSrc}
          close={() => setOpenSrc(null)}
          slides={[{ src: openSrc }]}
        />
      ) : null}
    </div>
  );
}

export default CatGIF;
