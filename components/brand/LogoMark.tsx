import Image from 'next/image';
import styles from './LogoMark.module.css';

type Props = {
  alt?: string;
  /** Intrinsic size handed to next/image (the PNGs are 500×500). */
  size?: number;
  sizes?: string;
  priority?: boolean;
  className?: string;
};

// The brand mark, in both themes. The mark is navy and sinks into a dark
// ground, so dark mode shows a light-ink version (public/logo-icon-dark.png)
// rather than setting the navy one on a plate. Both are in the markup and CSS
// keys off [data-theme], which the boot script sets before first paint — so
// there is no flash, and the hidden one is out of the accessibility tree, so
// the alt is only read once.
export default function LogoMark({ alt = '', size = 500, sizes, priority, className = '' }: Props) {
  return (
    <>
      <Image
        src="/logo-icon.png"
        alt={alt}
        width={size}
        height={size}
        sizes={sizes}
        priority={priority}
        className={`${styles.light} ${className}`}
      />
      <Image
        src="/logo-icon-dark.png"
        alt={alt}
        width={size}
        height={size}
        sizes={sizes}
        priority={priority}
        className={`${styles.dark} ${className}`}
      />
    </>
  );
}
