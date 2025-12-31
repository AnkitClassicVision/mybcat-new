/**
 * Testimonial data for use across site
 * Pulled from existing homepage content
 */

export interface Testimonial {
  quote: string;
  author: string;
  title: string;
  company?: string;
  industry?: string;
  avatar?: string;
  initials: string;
  featured?: boolean;
  videoSrc?: string;
  videoPoster?: string;
}

export const testimonials: Testimonial[] = [
  {
    quote: "Honestly it was a godsend when we brought them in. You have taken a process that we were challenged with, we struggled, and once we got the little kinks figured out, you just run with it.",
    author: "Dr. Michael Dittman",
    title: "Owner",
    company: "Dittman Eye Care (5 locations)",
    industry: "optometry",
    initials: "MD",
    featured: true,
    videoSrc: "/videos/dittman-optimized.mp4",
    videoPoster: "/videos/final-optimized-landscape.webp",
    avatar: "/videos/dittman-headshot-optimized.webp"
  },
  {
    quote: "It was amazing—patients and staff immediately noticed the difference. The phones were always answered, appointments stayed full, and my team in the office could focus on patients in front of them.",
    author: "Dr. Mital Patel",
    title: "Owner",
    company: "Classic Vision Care (2 locations)",
    industry: "optometry",
    initials: "MP",
    featured: false
  },
  {
    quote: "The biggest thing I like about My Business Care Team is your manager. I talk directly to your managing team—they manage the remote staff. That's what I appreciate, it takes it off my plate.",
    author: "Dr. Derek Black",
    title: "Owner",
    company: "Multi-Location Practice",
    industry: "optometry",
    initials: "DB",
    featured: false
  },
  {
    quote: "Turnover especially at the front desk is daunting. When we can systemize and use companies like My Business Care Team, we can hire for personality and take time training on the things we need them to do on the ground level. It's been phenomenal for profitability.",
    author: "Dr. Bradley Grant",
    title: "Owner",
    company: "Multi-Location Practice",
    industry: "optometry",
    initials: "BG",
    featured: false
  },
  {
    quote: "From our first conversation, I felt confident this would be a great opportunity for our business to grow. Nofa and her team trained diligently to learn our office protocols with a nearly flawless transition. I highly recommend My Business Care Team.",
    author: "Ashley Choate",
    title: "Manager",
    company: "Family Eye Clinic (Lafayette, LA)",
    industry: "optometry",
    initials: "AC",
    featured: false
  },
  {
    quote: "I love how quiet the office is now.",
    author: "Dr. Larry Golson",
    title: "Owner",
    company: "Envision Eyecare",
    industry: "optometry",
    initials: "LG",
    featured: false
  }
];

// Client logos for authority section
export const clientLogos = [
  { src: '/images/authority/classic-logo.webp', alt: 'Classic Vision Care' },
  { src: '/images/authority/golden-triangle-logo.webp', alt: 'Golden Triangle' },
  { src: '/images/authority/fec_logo.webp', alt: 'FEC' },
  { src: '/images/authority/idoc.webp', alt: 'iDoc' },
  { src: '/images/authority/rlk.webp', alt: 'RLK Vision' },
  { src: '/images/authority/ODonFinance-Logo.webp', alt: 'ODon Finance' },
  { src: '/images/authority/Emerald.webp', alt: 'Emerald Eye Care' },
  { src: '/images/authority/505-logo.webp', alt: '505 Vision' },
  { src: '/images/authority/shelby-logo.webp', alt: 'Shelby Eye Care' },
  { src: '/images/authority/winchester-logo.webp', alt: 'Winchester Eye Care' }
];

// Helper functions
export function getFeaturedTestimonial(): Testimonial | undefined {
  return testimonials.find(t => t.featured);
}

export function getTestimonialsByIndustry(industry: string): Testimonial[] {
  return testimonials.filter(t => t.industry === industry);
}

export function getTestimonialsForDisplay(count: number = 3): Testimonial[] {
  return testimonials.slice(0, count);
}
