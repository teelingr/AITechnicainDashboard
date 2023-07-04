// ThemeContext.js

import React from 'react';

const ThemeContext = React.createContext({
  theme: 'light-theme',
  toggleTheme: () => {},
});

export default ThemeContext;
