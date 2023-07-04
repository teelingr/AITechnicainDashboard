import Head from 'next/head';
import Body from '../components/Body';
import React, { useState, useEffect, useContext } from "react";
import SummaryPanel from '@/components/test_components/SummaryPanel';
import ThemeContext from '@/components/ThemeContext'; // update with the actual path to ThemeContext.js


export default function Home() {
  
  const [theme, setTheme] = useState("dark-theme" ); // Default theme is light
  const toggleTheme = () => {
    setTheme((prevTheme) =>
      prevTheme === "light-theme" ? "dark-theme" : "light-theme"
    );
  };
  
    return (
      
    <div className={theme}>
    <div className="App">
        <Head>
            <title>SEW Dashboard</title>
            <meta name='description' content='Generated by create next app'/>
            <meta name='viewport' content='width=device-width, initial-scale=1'/>
        </Head>
         <ThemeContext.Provider value={{ theme, toggleTheme }}>
          <Body />
        </ThemeContext.Provider>
          {/* <SummaryPanel /> */}
      </div >
      </div>
    );
}