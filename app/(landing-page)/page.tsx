import Banner from '@/components/Banner';
import FAQ from '@/components/FAQ';
import Features from '@/components/Features';
import Footer from '@/components/Footer';
import HowToStart from '@/components/HowToStart';
import Navbar from '@/components/Navbar';
import Review from '@/components/Review';
import TrustedCount from '@/components/TCount';
import React from 'react';

const page = () => {
    return (
        <div>
            <Navbar/>
            <Banner/>
            <Features/>
            <TrustedCount/>
            <HowToStart/>
            <Review/>
            <FAQ/>
            <Footer/>
        </div>
    );
};

export default page;