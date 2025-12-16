import React, { useState, useEffect } from 'react';
import BannerImage from '../../assets/Ban.jpg';

const Banner = () => {
  // Set the sale end date (YYYY, MM-1, DD, HH, MM, SS)
  const saleEndDate = new Date(2025, 11, 31, 23, 59, 59); // December 31, 2025 23:59:59

  const [timeLeft, setTimeLeft] = useState({
    hours: '00',
    minutes: '00',
    seconds: '00',
  });

  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date();
      const difference = saleEndDate - now;

      if (difference <= 0) {
        clearInterval(interval);
        setTimeLeft({ hours: '00', minutes: '00', seconds: '00' });
        return;
      }

      const hours = String(Math.floor((difference / (1000 * 60 * 60)) % 24)).padStart(2, '0');
      const minutes = String(Math.floor((difference / (1000 * 60)) % 60)).padStart(2, '0');
      const seconds = String(Math.floor((difference / 1000) % 60)).padStart(2, '0');

      setTimeLeft({ hours, minutes, seconds });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  return (
    <section
      className="h-[70vh] mt-[14vh] bg-cover bg-right max-w-[2000px] mx-auto"
      style={{ backgroundImage: `url(${BannerImage})` }}
    >
      <div className="pl-6 flex flex-col justify-center h-full gap-2">
        <h1 className="text-blue-700 text-6xl uppercase font-bold tracking-tight">
          Big Sale!
        </h1>
        <h2 className="text-zinc-800 text-3xl mt-1">
          UP To 50% Off - Limited Time Only!
        </h2>
        <div className="text-6xl font-bold text-zinc-800 flex gap-x-3 mt-3">
          <span className="text-white bg-zinc-800 p-3">{timeLeft.hours}</span>:
          <span className="text-white bg-zinc-800 p-3">{timeLeft.minutes}</span>:
          <span className="text-white bg-zinc-800 p-3">{timeLeft.seconds}</span>
        </div>
      </div>
    </section>
  );
};

export default Banner;
