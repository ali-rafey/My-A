import Home from '@/sections/home/Home';
import Services from '@/sections/services/Services';
import HowItWorks from '@/sections/how-it-works/HowItWorks';
import BlogsPreview from '@/sections/blogs-preview/BlogsPreview';
import OurWork from '@/sections/our-work/OurWork';
import Contact from '@/sections/contact/Contact';

// Revalidate the homepage hourly so newly published blog posts surface in the BlogsPreview without a redeploy.
export const revalidate = 3600;

export default function HomePage() {
  return (
    <>
      <Home />
      <Services />
      <HowItWorks />
      <BlogsPreview />
      <OurWork />
      <Contact />
    </>
  );
}
