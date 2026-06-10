export type NavItem = {
  href: string;
  label: string;
};

export type EventItem = {
  title: string;
  date: string;
  time: string;
  location: string;
  image: string;
  description: string;
};

export type StreamItem = {
  title: string;
  date: string;
  description: string;
  embedUrl: string;
  isLive?: boolean;
};

export type PostItem = {
  title: string;
  slug: string;
  excerpt: string;
  date: string;
  author: string;
  image: string;
};

export type TestimonyItem = {
  title: string;
  body: string;
  author: string;
  memberSince: string;
  image?: string;
};

export type GalleryItem = {
  title: string;
  image: string;
  imageCount: string;
};

export const site = {
  name: "The Nest Church",
  title: "The Nest Church | A Home of Solace",
  description:
    "The youth expression of Truth of Calvary Ministries in Ikotun, Lagos. Worship, discipleship, prayer, and community for a rising generation.",
  url: "https://thenestexpression.com",
  email: "info@thenestexpression.com",
  phone: "+234 123 456 7890",
  address: [
    "Living Stone Hall, 1-2 Church Street",
    "Inside Calvary Bible Church premises",
    "Ikotun-Idimu Road, Council Lagos, Nigeria",
  ],
  socials: {
    instagram: "https://instagram.com/thenestchurch",
    youtube: "https://youtube.com/@thenestchurchglobal",
  },
};

export const navigation: NavItem[] = [
  { href: "/", label: "Home" },
  { href: "/about", label: "About" },
  { href: "/events", label: "Events" },
  { href: "/live", label: "Live" },
  { href: "/give", label: "Give" },
  { href: "/prayer", label: "Prayer" },
  { href: "/testimonies", label: "Stories" },
  { href: "/blog", label: "Blog" },
  { href: "/contact", label: "Contact" },
];

export const upcomingEvents: EventItem[] = [
  {
    title: "Sunday Celebration Service",
    date: "SUN, MAY 04, 2026",
    time: "2:00 PM",
    location: "Living Stone Hall, Ikotun",
    image: "/images/nest2.webp",
    description:
      "A worship gathering marked by prayer, teaching, fellowship, and strong community rhythm.",
  },
  {
    title: "Powered Week Prayers",
    date: "MON, MAY 05, 2026",
    time: "6:30 AM",
    location: "All online platforms",
    image: "/images/nest8.webp",
    description:
      "A short but focused prayer meeting to shape the week with spiritual intensity and faith.",
  },
  {
    title: "Counselling With PM",
    date: "FRI, MAY 09, 2026",
    time: "9:00 AM",
    location: "Church campus",
    image: "/images/nest_member.webp",
    description:
      "Pastoral support and guidance for members navigating purpose, healing, and direction.",
  },
  {
    title: "Youth Leadership Hangout",
    date: "SAT, MAY 10, 2026",
    time: "4:00 PM",
    location: "Ikotun, Lagos",
    image: "/images/nest7.webp",
    description:
      "A relaxed leadership and discipleship conversation around service, growth, and culture.",
  },
];

export const pastEvents: EventItem[] = [
  {
    title: "Night of Worship",
    date: "APR 12, 2026",
    time: "6:00 PM",
    location: "Main auditorium",
    image: "/images/nest9.webp",
    description: "A worship gathering filled with prayer and thanksgiving.",
  },
  {
    title: "Campus Fire Meeting",
    date: "MAR 21, 2026",
    time: "5:00 PM",
    location: "Lagos",
    image: "/images/nest1.webp",
    description: "A city-focused youth discipleship meeting.",
  },
  {
    title: "Prayer Retreat",
    date: "FEB 15, 2026",
    time: "8:00 AM",
    location: "Retreat center",
    image: "/images/nest8.webp",
    description: "A retreat devoted to prayer and renewal.",
  },
  {
    title: "Stories Night",
    date: "JAN 24, 2026",
    time: "3:00 PM",
    location: "Church hall",
    image: "/images/nest_member.webp",
    description: "A testimony-centered community gathering.",
  },
];

export const livestreams: StreamItem[] = [
  {
    title: "Sunday Service Broadcast",
    date: "May 2, 2026",
    description:
      "Join us for live worship and experience God's presence wherever you are.",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
    isLive: true,
  },
  {
    title: "Teaching Archive",
    date: "April 21, 2026",
    description:
      "A previous teaching stream kept here as a placeholder until the real livestream data is migrated.",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    title: "Prayer Gathering Replay",
    date: "April 14, 2026",
    description:
      "A replay card showing the intended archive layout for the Next.js site.",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
  {
    title: "Community Worship Replay",
    date: "April 7, 2026",
    description:
      "Another archive placeholder card that mirrors the structure of the Django page.",
    embedUrl: "https://www.youtube.com/embed/dQw4w9WgXcQ",
  },
];

export const blogPosts: PostItem[] = [
  {
    title: "Developing a Home of Solace",
    slug: "developing-a-home-of-solace",
    excerpt:
      "The central vision of The Nest Church is building a place where young people can be formed with purpose and eternal clarity.",
    date: "May 2, 2026",
    author: "The Nest Team",
    image: "/images/nest1.webp",
  },
  {
    title: "Raising Kingdom Ambassadors",
    slug: "raising-kingdom-ambassadors",
    excerpt:
      "Our mission is not just attendance. It is formation, service, and visible Kingdom expression in everyday life.",
    date: "April 27, 2026",
    author: "The Nest Team",
    image: "/images/nest9.webp",
  },
  {
    title: "Why Prayer Shapes the Culture",
    slug: "why-prayer-shapes-the-culture",
    excerpt:
      "Prayer is not a side ministry here. It is one of the defining disciplines that orders the life of the church.",
    date: "April 20, 2026",
    author: "The Nest Team",
    image: "/images/nest8.webp",
  },
];

export const testimonyItems: TestimonyItem[] = [
  {
    title: "A Place To Heal",
    body:
      "Young adults need more than programs. They need spiritual covering, practical counsel, and a community that stays present. God met me here with unusual peace and restored clarity to my life.",
    author: "Miracle A.",
    memberSince: "2019",
  },
  {
    title: "A Place To Grow",
    body:
      "The Nest frames discipleship as visible growth in prayer, character, service, and conviction. My walk with God became disciplined and intentional through this community.",
    author: "Daniel O.",
    memberSince: "2021",
    image: "/images/wisdom_isaac_oku.jpeg",
  },
  {
    title: "A Place To Belong",
    body:
      "The visitor experience should feel like a real front door into community, not a detached brochure. I found genuine friendship, accountability, and spiritual direction here.",
    author: "Faith U.",
    memberSince: "2020",
  },
];

export const galleryItems: GalleryItem[] = [
  {
    title: "Sunday Celebration Service",
    image: "/images/nest2.webp",
    imageCount: "18 image(s)",
  },
  {
    title: "Prayer Retreat",
    image: "/images/nest8.webp",
    imageCount: "11 image(s)",
  },
  {
    title: "Stories Night",
    image: "/images/nest7.webp",
    imageCount: "14 image(s)",
  },
];
