import type { ReactNode } from 'react';

interface PortfolioTemplateProps {
  header: ReactNode;
  children: ReactNode;
  footer: ReactNode;
  floatingAction?: ReactNode;
}

function PortfolioTemplate({
  header,
  children,
  footer,
  floatingAction,
}: PortfolioTemplateProps) {
  return (
    <>
      {header}
      <main>{children}</main>
      {footer}
      {floatingAction}
    </>
  );
}

export default PortfolioTemplate;
