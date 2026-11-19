import { memo, type ReactNode, type RefObject } from 'react';

export interface PortfolioTemplateProps {
  readonly backdrop: ReactNode;
  readonly topbar: ReactNode;
  readonly sidebar: ReactNode;
  readonly mainContent: ReactNode;
  readonly sidebarRef?: RefObject<HTMLElement | null>;
  readonly mainRef?: RefObject<HTMLElement | null>;
}

const PortfolioTemplate = memo(function PortfolioTemplate({
  backdrop,
  topbar,
  sidebar,
  mainContent,
  sidebarRef,
  mainRef,
}: PortfolioTemplateProps) {
  return (
    <div className="screen-container">
      {backdrop}
      <div className="resume-viewport">
        {topbar}
        <div className="resume-grid">
          <aside
            ref={sidebarRef}
            className="glass-panel depth-recessed glass-scroll resume-sidebar-scroll"
            aria-label="Profile Summary and Technical Skills"
          >
            {sidebar}
          </aside>
          <main
            ref={mainRef}
            className="glass-panel depth-recessed glass-scroll resume-main-scroll"
            aria-label="Career Experience and Projects"
          >
            {mainContent}
          </main>
        </div>
      </div>
    </div>
  );
});

export default PortfolioTemplate;
