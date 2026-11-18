// Site-wide contact details. Edit here once; every page picks them up.

export const SITE = {
  name: 'Salsabila Azka Putri',
  short: 'Salsa',
  role: 'QA Engineer',
  city: 'Jakarta',
  location: 'Jakarta Metropolitan Area',
  company: 'Treetan Nusantara Network',
  email: 'salsabilaazkaputri@gmail.com',
  linkedin: 'https://www.linkedin.com/in/salsabilaazka-putri-499496246',
  description:
    'Salsabila Azka Putri — QA Engineer in Jakarta. Test automation with Playwright, API and performance testing with k6.',
};

export const WHATSAPP = {
  number: '62XXXXXXXXXXX', // TODO: real WhatsApp number, format 62… (no +, no leading 0)
  message: "Hi Salsa! I just saw your portfolio and would love to chat.",
};

export const waLink = () =>
  `https://wa.me/${WHATSAPP.number.replace(/\D/g, '')}?text=${encodeURIComponent(WHATSAPP.message)}`;

// Main navigation. Hash links point at sections on the home page.
export const NAV = [
  { n: '01', label: 'About', href: '/#about' },
  { n: '03', label: 'Experience', href: '/#experience' },
  { n: '04', label: 'Projects', href: '/projects' },
  { n: '05', label: 'Skills', href: '/#skills' },
  { n: '06', label: 'Contact', href: '/#contact' },
];
