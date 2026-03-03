import React, { useCallback, useState } from 'react';
import { motion } from 'framer-motion';
import { Easing } from '../Animation';
import { toggleLocale, useLocale } from '../i18n';

interface StyleSheetCSS {
    [key: string]: React.CSSProperties;
}

const LanguageToggle: React.FC = () => {
    const locale = useLocale();
    const [isHovering, setIsHovering] = useState(false);
    const [isActive, setIsActive] = useState(false);

    const onMouseDownHandler = useCallback((event: React.MouseEvent) => {
        setIsActive(true);
        event.preventDefault();
        event.stopPropagation();
        toggleLocale();
    }, []);

    const onMouseUpHandler = useCallback(() => {
        setIsActive(false);
    }, []);

    const label = locale === 'en' ? '中文' : 'EN';

    return (
        <div
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
            style={styles.container}
            onMouseDown={onMouseDownHandler}
            onMouseUp={onMouseUpHandler}
            className="icon-control-container"
            id="prevent-click"
        >
            <motion.p
                id="prevent-click"
                style={{
                    opacity: isActive ? 0.2 : isHovering ? 0.8 : 1,
                    userSelect: 'none',
                }}
                animate={
                    isActive ? 'active' : isHovering ? 'hovering' : 'default'
                }
                variants={vars}
            >
                {label}
            </motion.p>
        </div>
    );
};

const vars = {
    hovering: {
        opacity: 0.8,
        transition: {
            duration: 0.1,
            ease: 'easeOut',
        },
    },
    active: {
        scale: 0.95,
        opacity: 0.5,
        transition: {
            duration: 0.1,
            ease: Easing.expOut,
        },
    },
    default: {
        scale: 1,
        opacity: 1,
        transition: {
            duration: 0.2,
            ease: 'easeOut',
        },
    },
};

const styles: StyleSheetCSS = {
    container: {
        background: 'black',
        paddingLeft: 8,
        paddingRight: 8,
        textAlign: 'center',
        display: 'flex',
        boxSizing: 'border-box',
        justifyContent: 'center',
        alignItems: 'center',
        cursor: 'pointer',
    },
};

export default LanguageToggle;
