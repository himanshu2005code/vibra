'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';

interface Item {
  id: string;
  title: string;
  slug: string;
  posterUrl?: string;
  type?: string;
}

export function ContentRow({
  title,
  items,
  hrefPrefix,
  seeAllHref,
}: {
  title: string;
  items: Item[];
  hrefPrefix: string;
  seeAllHref?: string;
}) {
  if (!items?.length) return null;

  return (
    <section className="mt-8 px-4 md:px-6">
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-lg font-semibold md:text-xl">{title}</h2>
        {seeAllHref && (
          <Link href={seeAllHref} className="flex items-center text-sm text-brand-400 hover:underline">
            See all <ChevronRight className="h-4 w-4" />
          </Link>
        )}
      </div>
      <div className="flex gap-4 overflow-x-auto pb-2 scrollbar-hide snap-x">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, x: 20 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.05 }}
          >
            <Link
              href={`${hrefPrefix}/${item.slug}`}
              className="group block w-36 shrink-0 snap-start md:w-44"
            >
              <div className="relative aspect-[2/3] overflow-hidden rounded-xl bg-white/5 ring-1 ring-white/10 transition group-hover:ring-brand-500/50 group-hover:scale-[1.02]">
                {item.posterUrl ? (
                  <Image src={item.posterUrl} alt={item.title} fill className="object-cover" sizes="176px" />
                ) : (
                  <div className="flex h-full items-center justify-center text-white/30">No image</div>
                )}
                <div className="absolute inset-0 bg-card-shine opacity-0 transition group-hover:opacity-100" />
              </div>
              <p className="mt-2 line-clamp-2 text-sm font-medium">{item.title}</p>
            </Link>
          </motion.div>
        ))}
      </div>
    </section>
  );
}
