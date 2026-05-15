import { PrismaClient, UserRole, EventType, EventStatus, SeatCategory } from '@prisma/client';
import * as bcrypt from 'bcryptjs';

const prisma = new PrismaClient();

async function main() {
  const passwordHash = await bcrypt.hash('Password123!', 12);

  const mumbai = await prisma.city.upsert({
    where: { slug: 'mumbai' },
    update: {},
    create: { name: 'Mumbai', slug: 'mumbai', state: 'Maharashtra', latitude: 19.076, longitude: 72.8777 },
  });
  const delhi = await prisma.city.upsert({
    where: { slug: 'delhi' },
    update: {},
    create: { name: 'Delhi NCR', slug: 'delhi', state: 'Delhi', latitude: 28.6139, longitude: 77.209 },
  });
  const bangalore = await prisma.city.upsert({
    where: { slug: 'bangalore' },
    update: {},
    create: { name: 'Bengaluru', slug: 'bangalore', state: 'Karnataka', latitude: 12.9716, longitude: 77.5946 },
  });

  const admin = await prisma.user.upsert({
    where: { email: 'admin@eventsphere.in' },
    update: {},
    create: {
      email: 'admin@eventsphere.in',
      name: 'Super Admin',
      passwordHash,
      role: UserRole.SUPER_ADMIN,
      emailVerified: true,
      referralCode: 'ADMIN001',
    },
  });

  const organizer = await prisma.user.upsert({
    where: { email: 'organizer@eventsphere.in' },
    update: {},
    create: {
      email: 'organizer@eventsphere.in',
      name: 'Live Events Co',
      passwordHash,
      role: UserRole.EVENT_ORGANIZER,
      emailVerified: true,
      cityId: mumbai.id,
      referralCode: 'ORG001',
    },
  });

  const customer = await prisma.user.upsert({
    where: { email: 'user@eventsphere.in' },
    update: {},
    create: {
      email: 'user@eventsphere.in',
      name: 'Demo User',
      passwordHash,
      role: UserRole.CUSTOMER,
      emailVerified: true,
      cityId: mumbai.id,
      referralCode: 'USER001',
    },
  });

  const movies = [
    {
      title: 'Dune: Part Three',
      slug: 'dune-part-three',
      description: 'Epic conclusion to the desert saga.',
      posterUrl: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400',
      bannerUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1200',
      duration: 166,
      language: ['English', 'Hindi'],
      genres: ['Sci-Fi', 'Adventure'],
      rating: 'UA',
      releaseDate: new Date('2026-03-20'),
      trending: true,
      imdbRating: 8.7,
    },
    {
      title: 'Pushpa 3',
      slug: 'pushpa-3',
      description: 'The rule of the red sand rises again.',
      posterUrl: 'https://images.unsplash.com/photo-1574267432553-4b4628081c31?w=400',
      bannerUrl: 'https://images.unsplash.com/photo-1478720568477-152a9a8e8f20?w=1200',
      duration: 175,
      language: ['Telugu', 'Hindi'],
      genres: ['Action', 'Drama'],
      rating: 'A',
      releaseDate: new Date('2026-04-10'),
      trending: true,
      imdbRating: 8.2,
    },
    {
      title: 'Stree 3',
      slug: 'stree-3',
      description: 'Horror comedy returns to haunt India.',
      posterUrl: 'https://images.unsplash.com/photo-1594909121041-c55cf10f1731?w=400',
      duration: 128,
      language: ['Hindi'],
      genres: ['Horror', 'Comedy'],
      rating: 'UA',
      releaseDate: new Date('2026-05-01'),
      trending: false,
      imdbRating: 7.9,
    },
  ];

  for (const m of movies) {
    const movie = await prisma.movie.upsert({
      where: { slug: m.slug },
      update: m,
      create: m,
    });
    for (const city of [mumbai, delhi, bangalore]) {
      await prisma.movieCity.upsert({
        where: { movieId_cityId: { movieId: movie.id, cityId: city.id } },
        update: {},
        create: { movieId: movie.id, cityId: city.id },
      });
    }
  }

  const venue = await prisma.venue.upsert({
    where: { slug: 'jio-world-garden' },
    update: {},
    create: {
      name: 'Jio World Garden',
      slug: 'jio-world-garden',
      address: 'Bandra Kurla Complex, Mumbai',
      cityId: mumbai.id,
      capacity: 15000,
      latitude: 19.0634,
      longitude: 72.8656,
    },
  });

  const events = [
    {
      title: 'Coldplay: Music of the Spheres',
      slug: 'coldplay-mumbai-2026',
      type: EventType.CONCERT,
      status: EventStatus.PUBLISHED,
      posterUrl: 'https://images.unsplash.com/photo-1459749411175-04bf0292b0b5?w=400',
      startAt: new Date('2026-11-15T19:00:00+05:30'),
      tags: ['concert', 'international'],
      artists: ['Coldplay'],
      minPrice: 4999,
      maxPrice: 49999,
      capacity: 15000,
    },
    {
      title: 'Zakir Khan: Mannpasand 2.0',
      slug: 'zakir-khan-mumbai',
      type: EventType.COMEDY,
      status: EventStatus.PUBLISHED,
      posterUrl: 'https://images.unsplash.com/photo-1585699327391-efeb2e0d4b2e?w=400',
      startAt: new Date('2026-08-20T20:00:00+05:30'),
      tags: ['comedy', 'standup'],
      artists: ['Zakir Khan'],
      minPrice: 799,
      maxPrice: 4999,
      capacity: 2000,
    },
    {
      title: 'IPL 2026: MI vs CSK',
      slug: 'ipl-mi-csk-2026',
      type: EventType.SPORTS,
      status: EventStatus.PUBLISHED,
      posterUrl: 'https://images.unsplash.com/photo-1531416510056-6a3ef4b8f3c6?w=400',
      startAt: new Date('2026-04-05T19:30:00+05:30'),
      tags: ['cricket', 'ipl'],
      artists: [],
      minPrice: 1500,
      maxPrice: 25000,
      capacity: 33000,
    },
  ];

  for (const e of events) {
    await prisma.event.upsert({
      where: { slug: e.slug },
      update: { ...e, organizerId: organizer.id, venueId: venue.id, cityId: mumbai.id },
      create: { ...e, organizerId: organizer.id, venueId: venue.id, cityId: mumbai.id },
    });
  }

  const theatre = await prisma.theatre.upsert({
    where: { slug: 'pvr-icon-inorbit-mumbai' },
    update: {},
    create: {
      name: 'PVR ICON: Inorbit Mall',
      slug: 'pvr-icon-inorbit-mumbai',
      address: 'Inorbit Mall, Malad West, Mumbai',
      cityId: mumbai.id,
      amenities: ['Dolby Atmos', 'Recliner', 'F&B'],
      rating: 4.5,
      ownerId: admin.id,
    },
  });

  let screen = await prisma.screen.findFirst({ where: { theatreId: theatre.id, name: 'AUDI 01 - IMAX' } });
  if (!screen) {
    screen = await prisma.screen.create({
      data: {
        theatreId: theatre.id,
        name: 'AUDI 01 - IMAX',
        capacity: 120,
        layout: { rows: 10, cols: 12 },
      },
    });
  }

  const rows = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H', 'I', 'J'];
  for (let r = 0; r < rows.length; r++) {
    for (let n = 1; n <= 12; n++) {
      const category =
        r < 2 ? SeatCategory.RECLINER : r < 5 ? SeatCategory.PLATINUM : r < 8 ? SeatCategory.GOLD : SeatCategory.REGULAR;
      const basePrice = category === SeatCategory.RECLINER ? 650 : category === SeatCategory.PLATINUM ? 450 : category === SeatCategory.GOLD ? 320 : 180;
      await prisma.seat.upsert({
        where: { screenId_row_number: { screenId: screen.id, row: rows[r], number: n } },
        update: {},
        create: { screenId: screen.id, row: rows[r], number: n, category, basePrice },
      });
    }
  }

  const dune = await prisma.movie.findUnique({ where: { slug: 'dune-part-three' } });
  if (dune) {
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    tomorrow.setHours(18, 30, 0, 0);
    await prisma.showtime.create({
      data: {
        movieId: dune.id,
        screenId: screen.id,
        startAt: tomorrow,
        language: 'English',
        format: 'IMAX 3D',
        basePrice: 320,
        available: 120,
      },
    });
  }

  await prisma.banner.createMany({
    data: [
      {
        title: 'Blockbuster Season',
        imageUrl: 'https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?w=1400',
        linkUrl: '/movies',
        position: 0,
        active: true,
      },
      {
        title: 'Live Concerts',
        imageUrl: 'https://images.unsplash.com/photo-1459749411175-04bf0292b0b5?w=1400',
        linkUrl: '/explore?type=concert',
        position: 1,
        active: true,
      },
    ],
    skipDuplicates: true,
  });

  await prisma.coupon.upsert({
    where: { code: 'WELCOME100' },
    update: {},
    create: {
      code: 'WELCOME100',
      description: '₹100 off on first booking',
      discountType: 'FLAT',
      discountValue: 100,
      minAmount: 500,
      usageLimit: 10000,
      validFrom: new Date(),
      validUntil: new Date('2027-12-31'),
      eventTypes: ['MOVIE', 'CONCERT'],
    },
  });

  console.log('Seed complete:', { admin: admin.email, organizer: organizer.email, customer: customer.email });
}

main()
  .catch(console.error)
  .finally(() => prisma.$disconnect());
