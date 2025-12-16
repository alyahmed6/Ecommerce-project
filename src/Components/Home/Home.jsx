import React from 'react';
import Navbar from '../Navbar/Navbar';
import Banner from '../Banner/Banner';
import Product from '../Products/Product';
import Cart from '../Cart/Cart';
import { useSelector, useDispatch } from 'react-redux';
import { setSearchTerm } from '../../Store/searchSlice'; 
import Footer from '../Footer/Footer';

const Home = () => {
  const dispatch = useDispatch();
  const searchTerm = useSelector((state) => state.search.searchTerm);

  const handleScroll = () => {
    const section = document.getElementById('products-section');
    if (section) {
      section.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <div>
      <Navbar
        handleScroll={handleScroll}
        searchTerm={searchTerm}
        setSearchTerm={(term) => dispatch(setSearchTerm(term))}
      />
      <Cart/>
      <Banner />
      <Product limit={8} />
    </div>
  );
};

export default Home;
