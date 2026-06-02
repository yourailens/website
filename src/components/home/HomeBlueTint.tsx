import type { ElementType, ReactNode } from "react";

type HomeBlueTintProps = {
  children: ReactNode;
  className?: string;
  as?: ElementType;
  id?: string;
};

/** Wraps homepage blocks in the same soft sky/blue wash as the hero. */
export default function HomeBlueTint({
  children,
  className = "",
  as: Tag = "section",
  id,
}: HomeBlueTintProps) {
  return (
    <Tag id={id} className={`home-section-tint ${className}`.trim()}>
      {children}
    </Tag>
  );
}
