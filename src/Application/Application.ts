import * as THREE from 'three';

import Debug from './Utils/Debug';
import Sizes from './Utils/Sizes';
import Time from './Utils/Time';
import Camera, { CameraKey } from './Camera/Camera';
import Renderer from './Renderer';
import Mouse from './Utils/Mouse';
import UIEventBus from './UI/EventBus';

//@ts-ignore
import World from './World/World';
import Resources from './Utils/Resources';

import sources from './sources';

import Stats from 'stats.js';
import Loading from './Utils/Loading';

import UI from './UI';

let instance: Application | null = null;

export default class Application {
    debug: Debug;
    sizes: Sizes;
    time: Time;
    scene: THREE.Scene;
    cssScene: THREE.Scene;
    overlayScene: THREE.Scene;
    resources: Resources;
    camera: Camera;
    renderer: Renderer;
    world: World;
    mouse: Mouse;
    loading: Loading;
    ui: UI;
    stats: Stats | undefined;
    monitorPerfPaused: boolean;

    constructor() {
        // Singleton
        if (instance) {
            return instance;
        }

        instance = this;

        // Global access
        //@ts-ignore
        // window.Application = this;

        // Setup
        this.debug = new Debug();
        this.sizes = new Sizes();
        this.mouse = new Mouse();
        this.loading = new Loading();
        this.time = new Time();
        this.scene = new THREE.Scene();
        this.cssScene = new THREE.Scene();
        this.overlayScene = new THREE.Scene();
        this.resources = new Resources(sources);
        this.camera = new Camera();
        this.renderer = new Renderer();
        this.camera.createControls();
        this.world = new World();

        this.ui = new UI();
        this.monitorPerfPaused = false;

        UIEventBus.on('enterMonitor', () => {
            this.monitorPerfPaused = true;
        });
        UIEventBus.on('leftMonitor', () => {
            this.monitorPerfPaused = false;
        });

        const urlParams = new URLSearchParams(window.location.search);
        if (urlParams.has('debug')) {
            this.stats = new Stats();
            this.stats.showPanel(0);

            document.body.appendChild(this.stats.dom);
        }

        // Resize event
        this.sizes.on('resize', () => {
            this.resize();
        });

        // Time tick event
        this.time.on('tick', () => {
            this.update();
        });
    }

    resize() {
        this.camera.resize();
        this.renderer.resize();

        const shouldPauseForMonitor =
            this.monitorPerfPaused &&
            this.camera.currentKeyframe === CameraKey.MONITOR &&
            !this.camera.targetKeyframe &&
            !this.camera.freeCam;

        // If we pause the main loop while in the monitor, a resize can leave the
        // last rendered frame/DOM transforms out of date. Force a single refresh.
        if (shouldPauseForMonitor) {
            this.camera.update();
            this.world.update();
            this.renderer.update();
        }
    }

    update() {
        if (this.stats) this.stats.begin();

        const shouldPauseForMonitor =
            this.monitorPerfPaused &&
            this.camera.currentKeyframe === CameraKey.MONITOR &&
            !this.camera.targetKeyframe &&
            !this.camera.freeCam;

        if (shouldPauseForMonitor) {
            if (this.stats) this.stats.end();
            return;
        }

        this.camera.update();
        this.world.update();
        this.renderer.update();
        if (this.stats) this.stats.end();
    }

    destroy() {
        this.sizes.off('resize');
        this.time.off('tick');

        // Traverse the whole scene
        this.scene.traverse((child) => {
            // Test if it's a mesh
            if (child instanceof THREE.Mesh) {
                child.geometry.dispose();

                // Loop through the material properties
                for (const key in child.material) {
                    const value = child.material[key];

                    // Test if there is a dispose function
                    if (value && typeof value.dispose === 'function') {
                        value.dispose();
                    }
                }
            }
        });

        this.renderer.instance.dispose();

        if (this.debug.active) this.debug.ui.destroy();
    }
}
