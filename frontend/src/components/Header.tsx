interface HeaderProps {
  currentPage: 'home' | 'analytics';
  onPageChange: (page: 'home' | 'analytics') => void;
}

export default function Header({ currentPage, onPageChange }: HeaderProps) {
  return (
    <header className="topbar">
      <div className="brand">
        <span className="brandmark">SI</span>
        SessionIQ
      </div>
      <nav className="nav">
        <button
          className={currentPage === 'home' ? 'active' : ''}
          onClick={() => onPageChange('home')}
        >
          Discover
        </button>
        <button
          className={currentPage === 'analytics' ? 'active' : ''}
          onClick={() => onPageChange('analytics')}
        >
          Session analytics
        </button>
      </nav>
      <div className="top-actions">
        <span className="demo-pill">DEMO DATA</span>
        <span className="avatar">AS</span>
      </div>
    </header>
  );
}
