import React from 'react';

interface HeaderProps {
  name: string;
  title: string;
}

function Header({ name, title }: HeaderProps) {
  return (
    <header className="header">
      <div className="header-content">
        <h1 className="header-name">{name}</h1>
        <p className="header-title">{title}</p>
      </div>
    </header>
  );
}

export default Header;