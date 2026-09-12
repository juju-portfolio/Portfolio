import type { ReactNode } from 'react';

export default function GuideRegion({
  id,
  className = '',
  children,
}: {
  id: string;
  className?: string;
  children: ReactNode;
}) {
  return (
    <div className={`guide-region ${className}`} data-guide-stop={id}>
      <div
        className="guide-pocket"
        data-guide-pocket
        data-reservation="closed"
        aria-hidden="true"
      />
      <div className="guide-protected" data-guide-content>
        {children}
        <div className="guide-perch" data-guide-perch aria-hidden="true" />
      </div>
    </div>
  );
}
