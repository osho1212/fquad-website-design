// lib/dev-sample-ongoing.ts
// A placeholder "Ongoing" project so the Ongoing category can be reviewed on a
// developer machine before any real one exists in the CMS.
//
// It is only ever used when BOTH hold: NODE_ENV is not "production" and
// PREVIEW_ONGOING_SAMPLE=1 is set (in .env.local). Production never sees it.

import type { PastProject } from '@/lib/past-projects';

export function devSampleOngoing(): PastProject[] {
  if (process.env.NODE_ENV === 'production') return [];
  if (process.env.PREVIEW_ONGOING_SAMPLE !== '1') return [];

  return [
    {
      slug: 'sample-ongoing-project',
      name: 'Sample Ongoing Project',
      category: 'ongoing',
      location: 'Hyderabad',
      type: 'Private Residence · Under Construction',
      area: '',
      tagline:
        'Placeholder shown only in local preview — add real ongoing projects in the CMS and this disappears.',
      images: ['/assets/images/a2.jpg', '/assets/images/a3.jpg', '/assets/images/b23.jpg'],
      chapters: [
        {
          num: '01',
          title: 'Where It Stands',
          body: [
            'This is a stand-in so the Ongoing category can be reviewed. Real ongoing projects added through the CMS replace it automatically.',
          ],
        },
      ],
    },
  ];
}
