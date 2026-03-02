import React from 'react';
import Hero from './Hero';
import HowItWorks from './HowItWorks';
import Services from './Services';
import Testimonials from './Testimonials';
import PriceTable from './PriceTable';
import FAQ from './FAQ';
import About from './About';

const Home: React.FC = () => {
  return (
    <>
      <Hero />
      <HowItWorks />
      <PriceTable />
      <Services />
      <Testimonials />
      <About />
      <FAQ />
    </>
  );
};

export default Home;
