import React, { useEffect, useRef } from 'react';
import { useLocation, Outlet } from 'react-router-dom';
import { gsap } from 'gsap';
import { SwitchTransition, CSSTransition } from 'react-transition-group';

const PageTransition = () => {
  const location = useLocation();
  const nodeRef = useRef(null);

  useEffect(() => {
    const fadeIn = gsap.fromTo(
      nodeRef.current,
      { opacity: 0 },
      { opacity: 1, duration: 0.5, ease: 'power2.inOut' }
    );

    return () => {
      fadeIn.kill();
    };
  }, [location.pathname]);

  return (
    <SwitchTransition>
      <CSSTransition
        key={location.pathname} // Triggers on route change
        nodeRef={nodeRef}
        timeout={500}
        classNames="fade"
      >
        <div ref={nodeRef} className="page">
          <Outlet />
        </div>
      </CSSTransition>
    </SwitchTransition>
  );
};

export default PageTransition;
