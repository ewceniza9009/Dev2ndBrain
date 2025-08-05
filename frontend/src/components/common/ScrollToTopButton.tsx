import React, { useState, useEffect } from 'react';
import { ArrowUpIcon } from '@heroicons/react/20/solid';
import clsx from 'clsx';

interface ScrollToTopButtonProps {
  scrollableElementRef: React.RefObject<HTMLElement>;
}

const ScrollToTopButton: React.FC<ScrollToTopButtonProps> = ({ scrollableElementRef }) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const scrollableElement = scrollableElementRef.current;

    const handleScroll = () => {
      if (scrollableElement) {
        // Show button when scrolled down 300px
        if (scrollableElement.scrollTop > 300) {
          setIsVisible(true);
        } else {
          setIsVisible(false);
        }
      }
    };

    // Attach scroll listener
    scrollableElement?.addEventListener('scroll', handleScroll);

    // Cleanup listener on component unmount
    return () => scrollableElement?.removeEventListener('scroll', handleScroll);
  }, [scrollableElementRef]);

  const scrollToTop = () => {
    scrollableElementRef.current?.scrollTo({
      top: 0,
      behavior: 'smooth',
    });
  };

  return (
    <button
      onClick={scrollToTop}
      className={clsx(
        'fixed bottom-6 right-6 z-50 p-3 rounded-full bg-teal-600 text-white shadow-lg hover:bg-teal-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-teal-500 transition-all duration-300',
        {
          'opacity-100 translate-y-0': isVisible,
          'opacity-0 translate-y-4 pointer-events-none': !isVisible,
        }
      )}
      aria-label="Scroll to top"
    >
      <ArrowUpIcon className="h-6 w-6" />
    </button>
  );
};

export default ScrollToTopButton;