import React, { useEffect, useRef, useState } from 'react';
import FreeCamToggle from './FreeCamToggle';
import MuteToggle from './MuteToggle';
import LanguageToggle from './LanguageToggle';
import { getCopy, type Locale, useLocale } from '../i18n';

interface InfoOverlayProps {
    visible: boolean;
}

const MULTIPLIER = 1;

const InfoOverlay: React.FC<InfoOverlayProps> = ({ visible }) => {
    const locale = useLocale();
    const copy = getCopy(locale);
    const typedLocaleRef = useRef<Locale | null>(null);
    const visRef = useRef(visible);
    const [nameText, setNameText] = useState('');
    const [titleText, setTitleText] = useState('');
    const [taglineText, setTaglineText] = useState('');
    const timeLocale = locale === 'zh' ? 'zh-CN' : 'en-US';
    const [time, setTime] = useState(() =>
        new Date().toLocaleTimeString(timeLocale)
    );
    const timeRef = useRef(time);
    const [timeText, setTimeText] = useState('');
    const [textDone, setTextDone] = useState(false);
    const [volumeVisible, setVolumeVisible] = useState(false);
    const [freeCamVisible, setFreeCamVisible] = useState(false);
    const typingTimeoutsRef = useRef<number[]>([]);

    const clearTypingTimeouts = () => {
        typingTimeoutsRef.current.forEach((id) => clearTimeout(id));
        typingTimeoutsRef.current = [];
    };

    const setTrackedTimeout = (fn: () => void, delayMs: number) => {
        const id = window.setTimeout(fn, delayMs);
        typingTimeoutsRef.current.push(id);
    };

    const typeText = (
        i: number,
        curText: string,
        text: string,
        setText: React.Dispatch<React.SetStateAction<string>>,
        callback: () => void,
        refOverride?: React.MutableRefObject<string>
    ) => {
        if (refOverride) {
            text = refOverride.current;
        }
        if (i < text.length) {
            setTrackedTimeout(() => {
                if (visRef.current === true)
                    window.postMessage(
                        { type: 'keydown', key: `_AUTO_${text[i]}` },
                        '*'
                    );

                setText(curText + text[i]);
                typeText(
                    i + 1,
                    curText + text[i],
                    text,
                    setText,
                    callback,
                    refOverride
                );
            }, Math.random() * 50 + 50 * MULTIPLIER);
        } else {
            callback();
        }
    };

    useEffect(() => {
        visRef.current = visible;
        if (!visible) return;

        if (typedLocaleRef.current === locale && nameText !== '') return;

        clearTypingTimeouts();
        typedLocaleRef.current = locale;

        setNameText('');
        setTitleText('');
        setTaglineText('');
        setTimeText('');
        setTextDone(false);
        setVolumeVisible(false);
        setFreeCamVisible(false);

        setTrackedTimeout(() => {
            typeText(0, '', copy.profile.name, setNameText, () => {
                typeText(0, '', copy.profile.title, setTitleText, () => {
                    typeText(
                        0,
                        '',
                        copy.profile.tagline,
                        setTaglineText,
                        () => {
                            typeText(
                                0,
                                '',
                                time,
                                setTimeText,
                                () => {
                                    setTextDone(true);
                                },
                                timeRef
                            );
                        }
                    );
                });
            });
        }, 400);
        visRef.current = visible;
    }, [visible, locale]);

    useEffect(() => {
        if (textDone) {
            setTrackedTimeout(() => {
                setVolumeVisible(true);
                setTrackedTimeout(() => {
                    setFreeCamVisible(true);
                }, 250);
            }, 250);
        }
    }, [textDone]);

    useEffect(() => {
        window.postMessage({ type: 'keydown', key: `_AUTO_` }, '*');
    }, [freeCamVisible, volumeVisible]);

    useEffect(() => {
        const interval = setInterval(() => {
            setTime(new Date().toLocaleTimeString(timeLocale));
        }, 1000);
        return () => clearInterval(interval);
    }, [timeLocale]);

    useEffect(() => {
        timeRef.current = time;
        textDone && setTimeText(time);
    }, [time]);

    return (
        <div style={styles.wrapper}>
            {nameText !== '' && (
                <div style={styles.container}>
                    <p>{nameText}</p>
                </div>
            )}
            {titleText !== '' && (
                <div style={styles.container}>
                    <p>{titleText}</p>
                </div>
            )}
            {taglineText !== '' && (
                <div style={styles.container}>
                    <p>{taglineText}</p>
                </div>
            )}
            {timeText !== '' && (
                <div style={styles.lastRow}>
                    <div
                        style={Object.assign(
                            {},
                            styles.container,
                            styles.lastRowChild
                        )}
                    >
                        <p>{timeText}</p>
                    </div>
                    {volumeVisible && (
                        <div style={styles.lastRowChild}>
                            <MuteToggle />
                        </div>
                    )}
                    {freeCamVisible && (
                        <div style={styles.lastRowChild}>
                            <FreeCamToggle />
                        </div>
                    )}
                    {textDone && (
                        <div style={styles.lastRowChild}>
                            <LanguageToggle />
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

const styles: StyleSheetCSS = {
    container: {
        background: 'black',
        padding: 4,
        paddingLeft: 16,
        paddingRight: 16,
        textAlign: 'center',
        display: 'flex',
        marginBottom: 4,
        boxSizing: 'border-box',
    },
    wrapper: {
        position: 'absolute',
        display: 'flex',
        flexDirection: 'column',
        width: '100%',
        alignItems: 'flex-start',
        justifyContent: 'flex-start',
    },
    blinkingContainer: {
        // width: 100,
        // height: 100,
        marginLeft: 8,
        paddingBottom: 2,
        paddingRight: 4,
    },
    lastRow: {
        display: 'flex',
        flexDirection: 'row',
    },
    lastRowChild: {
        marginRight: 4,
    },
};

export default InfoOverlay;
