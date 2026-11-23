import { forwardRef, memo, type HTMLAttributes, type ReactNode } from 'react';

export interface GlassSlabProps extends HTMLAttributes<HTMLElement> {
  readonly children: ReactNode;
  readonly layer?: 1 | 2 | 3 | 'recessed';
  readonly as?:
    | 'section'
    | 'article'
    | 'div'
    | 'header'
    | 'footer'
    | 'aside'
    | 'main';
}

const GlassSlab = memo(
  forwardRef<HTMLElement, GlassSlabProps>(function GlassSlab(
    { children, layer = 1, as: Tag = 'section', className = '', ...rest },
    ref
  ) {
    const depthClass =
      layer === 'recessed' ? 'depth-recessed' : `depth-layer-${layer}`;

    return (
      <Tag
        ref={ref as never}
        className={`tilt-card ${depthClass} ${className}`.trim()}
        {...rest}
      >
        {children}
      </Tag>
    );
  })
);

export default GlassSlab;
