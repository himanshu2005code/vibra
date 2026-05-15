'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/button';
import type { Banner } from '@/lib/api';

export function HeroCarousel({ banners }: { banners: Banner[] }) {
  const [index, setIndex] = useState(0);
  const items = banners.length ? banners : [{ id: '1', title: 'EventSphere', imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1400', linkUrl: '/explore' }];

  useEffect(() => {
    const t = setInterval(() => setIndex((i) => (i + 1) % items.length), 5000);
    return () => clearInterval(t);
  }, [items.length]);

  const current = items[index];

  return (
    <section className="relative mx-4 mt-4 overflow-hidden rounded-2xl md:mx-6 md:mt-6 aspect-[21/9] min-h-[200px]">
      <AnimatePresence mode="wait">
        <motion.div
          key={current.id}
          initial={{ opacity: 0, scale: 1.05 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.6 }}
          className="absolute inset-0"
        >
          <Image src={current.imageUrl} alt={current.title} fill className="object-cover" priority />
          <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
          <div className="absolute bottom-0 left-0 right-0 p-6 md:p-10">
            <h1 className="text-2xl font-bold md:text-4xl">{current.title}</h1>
            {current.linkUrl && (
              <Link href={current.linkUrl}>
                <Button className="mt-4" size="lg">
                  Book Now
                </Button>
              </Link>
            )}
          </div>
        </motion.div>
      </AnimatePresence>
      <div className="absolute bottom-4 right-4 flex gap-1.5">
        {items.map((_, i) => (
          <button
            key={i}
            onClick={() => setIndex(i)}
            className={`h-1.5 rounded-full transition-all ${i === index ? 'w-6 bg-brand-500' : 'w-1.5 bg-white/40'}`}
            aria-label={`Slide ${i + 1}`}
          />
        ))}
      </div>
    </section>
  );
}
