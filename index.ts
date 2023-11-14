import EventEmitter from "events";
import * as path from "path";

const runtime: string = process.versions["electron"] ? "electron" : "node";

const essential: string =
  runtime +
  "-v" +
  process.versions.modules +
  "-" +
  process.platform +
  "-" +
  process.arch;

const modulePath: string = path.join(
  __dirname,
  "builds",
  essential,
  "build",
  "Release",
  "iohook.node"
);

if (process.env.DEBUG) {
  console.info("Loading native binary:", modulePath);
}

// Use 'any' type for dynamic import
let NodeHookAddon: any = require(modulePath);

interface KeyEvent {
  type: string;
  keyCode: number;
  shiftKey?: boolean;
  altKey?: boolean;
  ctrlKey?: boolean;
  metaKey?: boolean;
}

interface Shortcut {
  [keyCode: number]: boolean;
  id: number;
  callback: (keys: number[]) => void;
  releaseCallback?: (keys: number[]) => void;
}

interface EventMap {
  [key: number]: string;
}

class IOHook extends EventEmitter {
  private active: boolean = false;
  private shortcuts: Shortcut[] = [];
  private eventProperty: string = "keyCode";
  private activatedShortcuts: Shortcut[] = [];

  private lastKeydownShift: boolean = false;
  private lastKeydownAlt: boolean = false;
  private lastKeydownCtrl: boolean = false;
  private lastKeydownMeta: boolean = false;

  constructor() {
    super();
    this.load();
    this.setDebug(false);
  }

  start(enableLogger?: boolean): void {
    if (!this.active) {
      this.active = true;
      this.setDebug(!!enableLogger);
    }
  }

  stop(): void {
    if (this.active) {
      this.active = false;
    }
  }

  registerShortcut(
    keys: number[],
    callback: (keys: number[]) => void,
    releaseCallback?: (keys: number[]) => void
  ): number {
    let shortcut: Shortcut = {
      id: Date.now() + Math.random(),
      callback,
      releaseCallback,
    };

    keys.forEach((keyCode) => {
      shortcut[keyCode] = false;
    });

    this.shortcuts.push(shortcut);

    return shortcut.id;
  }

  unregisterShortcut(shortcutId: number): void {
    this.shortcuts = this.shortcuts.filter(
      (shortcut) => shortcut.id !== shortcutId
    );
  }

  unregisterShortcutByKeys(keyCodes: number[]): void {
    this.shortcuts = this.shortcuts.filter((shortcut) => {
      for (const key in shortcut) {
        if (key === "callback" || key === "releaseCallback" || key === "id") {
          continue;
        }

        const index = keyCodes.indexOf(Number(key));

        if (index === -1 || !shortcut[key]) {
          return false;
        }

        keyCodes.splice(index, 1);
      }

      return keyCodes.length > 0;
    });
  }

  unregisterAllShortcuts(): void {
    this.shortcuts = [];
  }

  load(): void {
    NodeHookAddon.startHook(this._handler.bind(this), this.debug || false);
  }

  unload(): void {
    this.stop();
    NodeHookAddon.stopHook();
  }

  setDebug(mode: boolean): void {
    NodeHookAddon.debugEnable(mode);
  }

  useRawcode(using: boolean): void {
    this.eventProperty = using ? "rawcode" : "keyCode";
  }

  disableClickPropagation(): void {
    NodeHookAddon.grabMouseClick(true);
  }

  enableClickPropagation(): void {
    NodeHookAddon.grabMouseClick(false);
  }

  private _handler(msg: any): void {
    if (this.active === false || !msg) return;

    const event: KeyEvent = msg.mouse || msg.keyboard || msg.wheel;

    event.type = events[msg.type];

    this._handleShift(event);
    this._handleAlt(event);
    this._handleCtrl(event);
    this._handleMeta(event);

    this.emit(event.type, event);

    if (
      (event.type === "keydown" || event.type === "keyup") &&
      this.shortcuts.length > 0
    ) {
      this._handleShortcut(event);
    }
  }

  private _handleShift(event: KeyEvent): void {
    // Implementation...
  }

  private _handleAlt(event: KeyEvent): void {
    // Implementation...
  }

  private _handleCtrl(event: KeyEvent): void {
    // Implementation...
  }

  private _handleMeta(event: KeyEvent): void {
    // Implementation...
  }

  private _handleShortcut(event: KeyEvent): void {
    // Implementation...
  }
}

const iohook = new IOHook();
export = iohook;
