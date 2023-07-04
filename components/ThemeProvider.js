// ThemeProvider.js

import React, { useState } from 'react';
import ThemeContext from './ThemeContext';

const ThemeProvider = ({ children }) => {
  const [theme, setTheme] = useState('light-theme');

  const toggleTheme = () => {
    setTheme((prevTheme) => prevTheme === 'light-theme' ? 'dark-theme' : 'light-theme');
  };

  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
};

export default ThemeProvider;
