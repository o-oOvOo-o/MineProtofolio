import React, { useCallback, useEffect, useRef, useState } from 'react';
// import eventBus from '../EventBus';
import { motion } from 'framer-motion';
import UIEventBus from '../EventBus';
import { getCopy, useLocale } from '../i18n';

type HelpPromptProps = {};

const HelpPrompt: React.FC<HelpPromptProps> = () => {
    const locale = useLocale();
    const copy = getCopy(locale);
    const [helpText, setHelpText] = useState('');
    const [visible, setVisible] = useState(true);
    const visRef = useRef(visible);
    const targetTextRef = useRef(copy.help.clickAnywhereToBegin);
    const typingTimeoutsRef = useRef<number[]>([]);

    const clearTypingTimeouts = () => {
        typingTimeoutsRef.current.forEach((id) => clearTimeout(id));
        typingTimeoutsRef.current = [];
    };

    const setTrackedTimeout = (fn: () => void, delayMs: number) => {
        const id = window.setTimeout(fn, delayMs);
        typingTimeoutsRef.current.push(id);
    };

    const typeHelpText = (i: number, curText: string) => {
        const text = targetTextRef.current;
        if (i < text.length && visRef.current) {
            setTrackedTimeout(() => {
                window.postMessage(
                    { type: 'keydown', key: `_AUTO_${text[i]}` },
                    '*'
                );

                setHelpText(curText + text[i]);
                typeHelpText(i + 1, curText + text[i]);
            }, Math.random() * 120 + 50);
        }
    };

    // make a document listener to listen to clicks

    useEffect(() => {
        document.addEventListener('mousedown', () => {
            setVisible(false);
        });
        UIEventBus.on('enterMonitor', () => {
            setVisible(false);
        });
    }, []);

    useEffect(() => {
        targetTextRef.current = copy.help.clickAnywhereToBegin;
        if (!visible) return;
        clearTypingTimeouts();
        setHelpText('');
        setTrackedTimeout(() => {
            typeHelpText(0, '');
        }, 500);
    }, [copy.help.clickAnywhereToBegin, visible]);

    useEffect(() => {
        if (visible == false) {
            window.postMessage({ type: 'keydown', key: `_AUTO_` }, '*');
        }
        visRef.current = visible;
    }, [visible]);

    return helpText.length > 0 ? (
        <motion.div
            variants={vars}
            animate={visible ? 'visible' : 'hide'}
            style={styles.container}
        >
            <p>{helpText}</p>
            <div style={styles.blinkingContainer}>
                <div className="blinking-cursor" />
            </div>
        </motion.div>
    ) : (
        <></>
    );
};

const vars = {
    visible: {
        opacity: 1,
    },
    hide: {
        y: 12,
        opacity: 0,
        transition: {
            duration: 0.5,
            ease: 'easeOut',
        },
    },
};

const styles: StyleSheetCSS = {
    container: {
        position: 'absolute',
        bottom: 64,
        background: 'black',
        padding: 4,
        paddingLeft: 16,
        paddingRight: 16,
        textAlign: 'center',
        display: 'flex',
        alignItems: 'flex-end',
    },
    blinkingContainer: {
        // width: 100,
        // height: 100,
        marginLeft: 8,
        paddingBottom: 2,
        paddingRight: 4,
    },
};

export default HelpPrompt;
