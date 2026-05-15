/* eslint-disable @next/next/no-img-element */
// Pulls every page's CSS module into the root layout's CSS chunk.
//
// Without this, each route ships its own CSS chunk and App Router fetches
// it on demand at navigation time — producing the brief "unstyled HTML"
// flash that's visible on the first navigation in a cold browser profile.
//
// By importing each .module.css here and referencing one class from each
// in the rendered (but hidden) JSX, Next.js's bundler includes all of
// these stylesheets in the layout's chunk. The pages themselves still
// `import styles from ...` as normal — Next.js deduplicates, so they pull
// from the layout chunk instead of fetching new chunks.

import homeStyles       from '@/sections/home/Home.module.css';
import servicesStyles   from '@/sections/services/Services.module.css';
import howItWorksStyles from '@/sections/how-it-works/HowItWorks.module.css';
import ourWorkStyles    from '@/sections/our-work/OurWork.module.css';
import contactStyles    from '@/sections/contact/Contact.module.css';
import blogsPageStyles  from './blogs/blogs.module.css';

export default function StylesPreloader() {
  // Renders nothing visible. The className references below are what
  // prevent tree-shaking from dropping the imports above. The element
  // is `hidden` (display: none) so layout, paint, and a11y all skip it.
  return (
    <div hidden aria-hidden="true" data-styles-preloader>
      <span className={homeStyles.section} />
      <span className={servicesStyles.section} />
      <span className={howItWorksStyles.section} />
      <span className={ourWorkStyles.section} />
      <span className={contactStyles.section} />
      <span className={blogsPageStyles.page} />
    </div>
  );
}
