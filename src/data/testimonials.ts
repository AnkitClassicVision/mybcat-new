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
    quote: "Honestly it was a godsend. You have taken a process that we struggled with, and once we got the kinks figured out, you just run with it.",
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
    quote: "The biggest thing I like is your manager. I talk directly to your managing team-they manage the remote staff. That takes it off my plate.",
    author: "Dr. Derek Black",
    title: "Owner",
    company: "Multi-Location Practice",
    industry: "optometry",
    initials: "DB",
    featured: false
  },
  {
    quote: "Patient scheduling improved by 40% and we've never missed a call. 24/7 operations transformed how we operate.",
    author: "Dr. Patel",
    title: "Owner",
    company: "Classic Vision Care",
    industry: "optometry",
    initials: "DP",
    featured: false
  },
  {
    quote: "I pulled my call reports and was SHOCKED. We were missing 29% of our calls on one given day. They were just going to voicemail.",
    author: "Beverly Wilburn",
    title: "Practice Office Manager",
    industry: "optometry",
    initials: "BW",
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
