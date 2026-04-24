import Blogs from '../../sections/blogs/Blogs';
import Contact from '../../sections/contact/Contact';
import Home from '../../sections/home/Home';
import HowItWorks from '../../sections/how-it-works/HowItWorks';
import OurWork from '../../sections/our-work/OurWork';
import Services from '../../sections/services/Services';

export default function AgencyHomePage() {
  return (
    <>
      <Home />
      <Services />
      <HowItWorks />
      <Blogs />
      <OurWork />
      <Contact />
    </>
  );
}
