import { memo, type ReactNode } from 'react';

export interface LandingTemplateProps {
  readonly backdrop?: ReactNode;
  readonly children: ReactNode;
}

const LandingTemplate = memo(function LandingTemplate({
  backdrop,
  children,
}: LandingTemplateProps) {
  return (
    <div className="screen-container">
      {backdrop}
      <main className="landing-viewport">
        <div className="landing-tiles">{children}</div>
      </main>
    </div>
  );
});

export default LandingTemplate;
