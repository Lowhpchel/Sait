import { useTheme } from '../../context/ThemeContext';
import './ThemeToggle.css';

function ThemeToggle() {
  const { isDark, toggleTheme } = useTheme();

  return (
    <button onClick={toggleTheme} className="theme-toggle" title={isDark ? 'Светлая тема' : 'Темная тема'}>
      {isDark ? '☀️' : '🌙'}
    </button>
  );
}

export default ThemeToggle;