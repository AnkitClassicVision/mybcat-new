/**
 * Hidden podcast guest share pages.
 * Each episode is a private, noindex promo page with copy-ready posts.
 * Add a new object here to publish another guest page from the same template.
 */

export interface GuestShareLink {
  href: string;
  label: string;
}

export interface GuestSharePlatform {
  id: 'linkedin' | 'x' | 'facebook' | 'instagram' | 'tiktok' | 'youtube';
  label: string;
  copy: string;
  actionLabel: string;
  actionHref: string;
}

export interface GuestShareEpisode {
  slug: string;
  pageTitle: string;
  pageDescription: string;
  eyebrow: string;
  titleLine1: string;
  titleLine2?: string;
  subhead: string;
  heroImage: {
    src: string;
    alt: string;
    width: number;
  };
  greeting: string;
  intro: string[];
  listenLinks: GuestShareLink[];
  listenNote: string;
  postsIntro: string;
  platforms: GuestSharePlatform[];
  assetsIntro: string;
  assets: GuestShareLink[];
  assetsNote: string;
  thanks: string;
  footerLinks: GuestShareLink[];
}

const episodeUrl =
  'https://buildingempires.live/episodes/why-your-frame-turn-is-lying-to-you';
const encodedEpisodeUrl = encodeURIComponent(episodeUrl);
const clipUrl = 'https://youtube.com/watch?v=NqCQkFMjSAQ';
const fullEpisodeUrl = 'https://youtube.com/watch?v=RjvlaVi1RQ0';

export const guestShareEpisodes: GuestShareEpisode[] = [
  {
    slug: 'why-your-frame-turn-is-lying-to-you',
    pageTitle: 'Copy your posts · Why Your Frame Turn Is Lying to You',
    pageDescription: 'Copy-ready posts for Optometrists Building Empires Episode 118.',
    eyebrow: 'Episode 118 · Now live',
    titleLine1: 'Why Your Frame Turn',
    titleLine2: 'Is Lying to You',
    subhead: 'Optometrists Building Empires, presented by MyBCAT',
    heroImage: {
      src: 'https://obe-podcast-public-assets.s3.amazonaws.com/3729791/social-image.png',
      alt: 'Episode 118 cover: Why Your Frame Turn Is Lying to You',
      width: 520
    },
    greeting: 'Hi Kayla,',
    intro: [
      "It's live now. Our conversation is out as Episode 118 of Optometrists Building Empires: Why Your Frame Turn Is Lying to You.",
      'A practice can sell plenty of frames and still miss what its inventory numbers are telling it. Kayla Ashlee, Certified Optician and Founder and CEO of Spexy, joins Ankit to explain why an overall frame-turn average can hide the performance of individual brands, how consistent reordering keeps proven sellers on the board, and why the whole optical team should help choose frames.'
    ],
    listenLinks: [
      { href: episodeUrl, label: 'Listen' },
      { href: fullEpisodeUrl, label: 'Full episode' },
      { href: clipUrl, label: 'Short' },
      {
        href: 'https://podcasts.apple.com/us/podcast/optometrists-building-empires/id1762685070',
        label: 'Apple Podcasts'
      },
      {
        href: 'https://open.spotify.com/show/5w1H9BBwRXvBSSkexePYxG',
        label: 'Spotify'
      }
    ],
    listenNote:
      "Use the Optometrists Building Empires link in your posts. It's the brand URL and lets listeners pick their platform.",
    postsIntro:
      'A short post for each platform. Copy it, then post it, or open the clip to share on Instagram, TikTok, or YouTube.',
    platforms: [
      {
        id: 'linkedin',
        label: 'LinkedIn',
        copy: `My episode of Optometrists Building Empires is live: ${episodeUrl}

A few things we covered:

- Why an overall frame-turn number hides what is actually working on your board
- Why "this brand sells in your area" does not hold up. I have seen two opticals in the same area where one sells a brand great and the other cannot move it at all
- Why the first fix is reordering. You can't sell what you don't have up there to sell

If you own an optical and you have been managing inventory off one turn number, this one is for you.

Tag Optometrists Building Empires so they can reshare.`,
        actionLabel: 'Post on LinkedIn',
        actionHref: `https://www.linkedin.com/sharing/share-offsite/?url=${encodedEpisodeUrl}`
      },
      {
        id: 'x',
        label: 'X',
        copy: `My episode of Optometrists Building Empires is live. Frame turn looks at your whole inventory at once. It will not tell you what is actually working on your board. @AnkitTheLeanWay
${episodeUrl}`,
        actionLabel: 'Post on X',
        actionHref:
          'https://x.com/intent/post?text=My%20episode%20of%20Optometrists%20Building%20Empires%20is%20live.%20Frame%20turn%20looks%20at%20your%20whole%20inventory%20at%20once.%20It%20will%20not%20tell%20you%20what%20is%20actually%20working%20on%20your%20board.%20%40AnkitTheLeanWay&url=' +
          encodedEpisodeUrl
      },
      {
        id: 'facebook',
        label: 'Facebook',
        copy: `My episode of Optometrists Building Empires is live: ${episodeUrl}

We talked about why an overall frame-turn number hides what is actually working on your board, why "this brand sells in your area" does not hold up, and why the first fix is reordering. You can't sell what you don't have up there to sell.

If you have been managing inventory off one turn number, this one is for you.`,
        actionLabel: 'Post on Facebook',
        actionHref: `https://www.facebook.com/sharer/sharer.php?u=${encodedEpisodeUrl}`
      },
      {
        id: 'instagram',
        label: 'Instagram',
        copy: `My episode of Optometrists Building Empires is out now. We talked about why frame turn is a lying metric, why "this brand sells in your area" doesn't hold up, and why you can't sell what you don't have on the board. Full conversation here: ${episodeUrl}

@my_business_care_team

#optometry #optical #OptometristsBuildingEmpires`,
        actionLabel: 'Open clip',
        actionHref: clipUrl
      },
      {
        id: 'tiktok',
        label: 'TikTok',
        copy: `Turn rate doesn't mean a damn thing.

Kayla Ashlee, certified optician and founder of Spexy, says turn looks at your whole inventory at once. Most offices stop there. That number alone does not tell you what is actually working out on your board.

Full episode: Why Your Frame Turn Is Lying to You
${episodeUrl}

@my_business_care_team
#optometry #optical #OptometristsBuildingEmpires`,
        actionLabel: 'Open clip',
        actionHref: clipUrl
      },
      {
        id: 'youtube',
        label: 'YouTube',
        copy: `My episode of Optometrists Building Empires is live: Why Your Frame Turn Is Lying to You.

Frame turn looks at your whole inventory at once. It will not tell you what is actually working on your board.

Full episode: ${episodeUrl}`,
        actionLabel: 'Open clip',
        actionHref: clipUrl
      }
    ],
    assetsIntro: 'Open any of these in your browser and attach them when you post.',
    assets: [
      {
        href: 'https://obe-podcast-public-assets.s3.amazonaws.com/3729791/social-image.png',
        label: 'Open social image'
      },
      {
        href: clipUrl,
        label: "Watch clip 1 on YouTube · Turn rate doesn't mean a damn thing."
      },
      {
        href: 'https://media.zernio.com/media/1794488849630_97364e067899d0ab_e118-clip1-thumb.jpg',
        label: 'Open clip 1 still'
      },
      {
        href: 'https://media.zernio.com/media/1794488829252_3ff77c06bd6aee86_e118-clip2.mp4',
        label: 'Watch clip 2 · Anyone who says a brand sells in your area is full of crap.'
      },
      {
        href: 'https://media.zernio.com/media/1794488850442_b64ba1f9de9e2746_e118-clip2-thumb.jpg',
        label: 'Open clip 2 still'
      },
      {
        href: 'https://media.zernio.com/media/1794488838889_d3fa44071dad092e_e118-clip3.mp4',
        label: "Watch clip 3 · You can't sell what you don't have up there to sell."
      },
      {
        href: 'https://media.zernio.com/media/1794488851244_2864171d9fdae109_e118-clip3-thumb.jpg',
        label: 'Open clip 3 still'
      }
    ],
    assetsNote:
      'Clip 2 goes live as a YouTube Short on Saturday, Nov 14, 3:00 PM ET. Clip 3 goes live as a YouTube Short on Monday, Nov 16, 3:00 PM ET. Until then, those two open in your browser from the hosted player.',
    thanks:
      "Thanks again for coming on the show. Tag Optometrists Building Empires on LinkedIn, @my_business_care_team on Instagram and TikTok, and @AnkitTheLeanWay on X, and we'll reshare to amplify it.",
    footerLinks: [
      { href: 'https://buildingempires.live', label: 'buildingempires.live' },
      { href: 'https://mybcat.com', label: 'mybcat.com' }
    ]
  }
];

export function getGuestShareEpisodes(): GuestShareEpisode[] {
  return guestShareEpisodes;
}

export function getGuestShareBySlug(slug: string): GuestShareEpisode | undefined {
  return guestShareEpisodes.find((episode) => episode.slug === slug);
}
