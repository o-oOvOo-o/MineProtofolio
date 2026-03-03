import { useEffect, useMemo, useState } from 'react';

export type Locale = 'en' | 'zh';

const STORAGE_KEY = 'mineprof.locale';

type Copy = {
    htmlLang: string;
    meta: {
        title: string;
        description: string;
        imagePath: string;
    };
    profile: {
        name: string;
        title: string;
        tagline: string;
        bio: string;
    };
    help: {
        clickAnywhereToBegin: string;
    };
    loading: {
        vendorLine1: string;
        vendorLine2: string;
        released: string;
        biosLine: (year: number) => string;
        modelLine: string;
        showcaseLine: string;
        checkingRamLine: string;
        finishedLoadingResources: string;
        loadingResources: (loaded: number, toLoad: number | '-') => string;
        wait: string;
        loadedResourcePrefix: string;
        allContentLoadedPrefix: string;
        allContentLoadedSuffix: string;
        pressDelEsc: string;
        startPopupTitle: (year: number, showcaseName: string) => string;
        mobileWarningLine1: string;
        mobileWarningLine2: string;
        clickStartToBegin: string;
        startButton: string;
        criticalError: string;
        noWebGlDetected: string;
        webglRequiredLine1: string;
        webglRequiredLine2: string;
    };
};

export const COPY_BY_LOCALE: Record<Locale, Copy> = {
    en: {
        htmlLang: 'en',
        meta: {
            title: 'Anonymous - Portfolio',
            description:
                'Engine tools engineer / technical artist focused on production tooling and pipelines for games.',
            imagePath: '../static/images/preview-new.jpg',
        },
        profile: {
            name: 'Anonymous',
            title: 'Engine Tools Engineer / Technical Artist / Software Engineer',
            tagline:
                'Engine tools engineer / technical artist focused on production tooling and pipelines for games.',
            bio: 'Engine tools engineer / technical artist focused on production tooling and pipelines for games: editor workflows, asset validation/packaging, automation, and procedural utilities. Comfortable bridging art and engineering; shipped tools used by content teams (C++ / Rust / C#).',
        },
        help: {
            clickAnywhereToBegin: 'Click anywhere to begin',
        },
        loading: {
            vendorLine1: 'Anonymous',
            vendorLine2: 'Portfolio',
            released: 'Released: 01/13/2000',
            biosLine: (year) => `MPBIOS (C)${year} MineProf`,
            modelLine: 'HSP S13 2000-2022 Special UC131S',
            showcaseLine: 'HSP Showcase(tm) XX 113',
            checkingRamLine: 'Checking RAM : 14000 OK',
            finishedLoadingResources: 'FINISHED LOADING RESOURCES',
            loadingResources: (loaded, toLoad) =>
                `LOADING RESOURCES (${loaded}/${toLoad})`,
            wait: 'WAIT',
            loadedResourcePrefix: 'Loaded',
            allContentLoadedPrefix: 'All Content Loaded, launching',
            allContentLoadedSuffix: 'V1.0',
            pressDelEsc:
                'Press DEL to enter SETUP , ESC to skip memory test',
            startPopupTitle: (year, showcaseName) =>
                `${showcaseName} ${year}`,
            mobileWarningLine1:
                'WARNING: This experience is best viewed on',
            mobileWarningLine2: 'a desktop or laptop computer.',
            clickStartToBegin: 'Click start to begin',
            startButton: 'START',
            criticalError: 'CRITICAL ERROR:',
            noWebGlDetected: 'No WebGL Detected',
            webglRequiredLine1: 'WebGL is required to run this site.',
            webglRequiredLine2:
                'Please enable it or switch to a browser which supports WebGL',
        },
    },
    zh: {
        htmlLang: 'zh-CN',
        meta: {
            title: 'Anonymous - 作品集',
            description: '引擎工具/技术美术：编辑器工具、生产管线与自动化。',
            imagePath: '../static/images/preview-new.jpg',
        },
        profile: {
            name: 'Anonymous',
            title: '引擎工具工程师 / 技术美术 / 软件工程师',
            tagline: '引擎工具/技术美术：编辑器工具、生产管线与自动化。',
            bio: '五年级起开始对游戏 Mod 开发感兴趣，参与《Cry of Fear》（曾在 Steam 免费恐怖游戏榜单 Top 10）前作 AoMDC 的联机地图开发。2021 年大学毕业转行加入游戏行业，工作至今主要负责 PCG 方向技术美术与工具需求开发（C++ / Rust / C#）。',
        },
        help: {
            clickAnywhereToBegin: '点击任意位置开始',
        },
        loading: {
            vendorLine1: 'Anonymous',
            vendorLine2: '作品集',
            released: '发布：01/13/2000',
            biosLine: (year) => `MPBIOS (C)${year} MineProf`,
            modelLine: 'HSP S13 2000-2022 Special UC131S',
            showcaseLine: 'HSP Showcase(tm) XX 113',
            checkingRamLine: '检查内存 : 14000 OK',
            finishedLoadingResources: '资源加载完成',
            loadingResources: (loaded, toLoad) =>
                `加载资源中 (${loaded}/${toLoad})`,
            wait: '请稍候',
            loadedResourcePrefix: '已加载',
            allContentLoadedPrefix: '内容加载完成，启动',
            allContentLoadedSuffix: 'V1.0',
            pressDelEsc: '按 DEL 进入设置，按 ESC 跳过内存测试',
            startPopupTitle: (year, showcaseName) =>
                `${showcaseName} ${year}`,
            mobileWarningLine1: '警告：该体验建议使用',
            mobileWarningLine2: '台式机或笔记本电脑浏览。',
            clickStartToBegin: '点击开始进入',
            startButton: '开始',
            criticalError: '严重错误：',
            noWebGlDetected: '未检测到 WebGL',
            webglRequiredLine1: '运行本网站需要 WebGL。',
            webglRequiredLine2:
                '请启用 WebGL 或切换到支持 WebGL 的浏览器。',
        },
    },
};

function normalizeLocale(value: unknown): Locale | null {
    if (value === 'en' || value === 'zh') return value;
    return null;
}

function detectLocaleFromNavigator(): Locale {
    if (typeof navigator === 'undefined') return 'en';
    const langs = navigator.languages?.length
        ? navigator.languages
        : [navigator.language];
    return langs.some((l) => String(l).toLowerCase().startsWith('zh'))
        ? 'zh'
        : 'en';
}

function safeGetStoredLocale(): Locale | null {
    if (typeof window === 'undefined') return null;
    try {
        return normalizeLocale(window.localStorage.getItem(STORAGE_KEY));
    } catch {
        return null;
    }
}

function safeStoreLocale(locale: Locale) {
    if (typeof window === 'undefined') return;
    try {
        window.localStorage.setItem(STORAGE_KEY, locale);
    } catch {
        // ignore
    }
}

function setMeta(selector: string, value: string) {
    const el = document.querySelector<HTMLMetaElement>(selector);
    if (el) el.content = value;
}

function applyLocaleToDocument(locale: Locale) {
    if (typeof document === 'undefined') return;

    const copy = COPY_BY_LOCALE[locale];
    document.documentElement.lang = copy.htmlLang;
    document.title = copy.meta.title;

    setMeta('meta[name="title"]', copy.meta.title);
    setMeta('meta[name="description"]', copy.meta.description);
    setMeta('meta[property="og:title"]', copy.meta.title);
    setMeta('meta[property="og:description"]', copy.meta.description);
    setMeta('meta[property="twitter:title"]', copy.meta.title);
    setMeta('meta[name="twitter:title"]', copy.meta.title);
    setMeta(
        'meta[property="twitter:description"]',
        copy.meta.description
    );
    setMeta('meta[name="twitter:description"]', copy.meta.description);

    if (typeof window !== 'undefined') {
        const url = window.location.href;
        const img = new URL(copy.meta.imagePath, url).toString();

        setMeta('meta[property="og:url"]', url);
        setMeta('meta[property="twitter:url"]', url);
        setMeta('meta[name="twitter:url"]', url);

        setMeta('meta[property="twitter:image"]', img);
        setMeta('meta[name="twitter:image"]', img);
        setMeta('meta[property="og:image"]', img);
        setMeta('meta[property="og:image:secure"]', img);
    }
}

let currentLocale: Locale =
    safeGetStoredLocale() ?? detectLocaleFromNavigator();

const listeners = new Set<(locale: Locale) => void>();

export function getLocale(): Locale {
    return currentLocale;
}

export function getCopy(locale: Locale = currentLocale): Copy {
    return COPY_BY_LOCALE[locale];
}

export function setLocale(locale: Locale) {
    if (locale === currentLocale) return;
    currentLocale = locale;
    safeStoreLocale(locale);
    applyLocaleToDocument(locale);
    listeners.forEach((listener) => listener(locale));
}

export function toggleLocale() {
    setLocale(currentLocale === 'en' ? 'zh' : 'en');
}

export function subscribeLocale(listener: (locale: Locale) => void) {
    listeners.add(listener);
    return () => {
        listeners.delete(listener);
    };
}

export function useLocale() {
    const [locale, setLocaleState] = useState<Locale>(() => getLocale());

    useEffect(() => subscribeLocale(setLocaleState), []);

    return locale;
}

export function useCopy() {
    const locale = useLocale();
    return useMemo(() => getCopy(locale), [locale]);
}

applyLocaleToDocument(currentLocale);
