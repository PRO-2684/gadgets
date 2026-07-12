// ==UserScript==
// @name         WASM Test
// @namespace    http://tampermonkey.net/
// @version      0.1.0
// @description  WASM Test
// @author       PRO-2684
// @match        *://*/*
// @run-at       document-start
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @license      gpl-3.0
// @grant        GM_getResourceURL
// @resource     wasmModule          https://pro-2684.github.io/Morphio/wasm/morphio_bg.wasm
// ==/UserScript==
(async function () {
    "use strict";
    /**
     * Options for morphing a font.
     */
    class MorphOptions {
        static __wrap(ptr) {
            ptr = ptr >>> 0;
            const obj = Object.create(MorphOptions.prototype);
            obj.__wbg_ptr = ptr;
            MorphOptionsFinalization.register(obj, obj.__wbg_ptr, obj);
            return obj;
        }
        __destroy_into_raw() {
            const ptr = this.__wbg_ptr;
            this.__wbg_ptr = 0;
            MorphOptionsFinalization.unregister(this);
            return ptr;
        }
        free() {
            const ptr = this.__destroy_into_raw();
            wasm.__wbg_morphoptions_free(ptr, 0);
        }
        /**
         * Whether to skip rules that reference missing glyphs instead of failing.
         * @returns {boolean}
         */
        get skip_missing_glyphs() {
            const ret = wasm.__wbg_get_morphoptions_skip_missing_glyphs(
                this.__wbg_ptr,
            );
            return ret !== 0;
        }
        /**
         * Whether to require a word boundary after the matched source word.
         *
         * ## Example
         *
         * Say we want to morph "banana" to "orange". With end matching enabled,
         * `bananas` will not be affected; with it disabled, `bananas` can be
         * rendered as `oranges`.
         * @returns {boolean}
         */
        get word_match_end() {
            const ret = wasm.__wbg_get_morphoptions_word_match_end(
                this.__wbg_ptr,
            );
            return ret !== 0;
        }
        /**
         * Whether to require a word boundary before the matched source word.
         *
         * ## Example
         *
         * Say we want to morph "banana" to "orange". With start matching enabled,
         * `xbanana` will not be affected; with it disabled, `xbanana` can be
         * rendered as `xorange`.
         * @returns {boolean}
         */
        get word_match_start() {
            const ret = wasm.__wbg_get_morphoptions_word_match_start(
                this.__wbg_ptr,
            );
            return ret !== 0;
        }
        /**
         * Creates a new [`MorphOptions`].
         * @param {boolean} word_match_start
         * @param {boolean} word_match_end
         * @param {boolean} skip_missing_glyphs
         */
        constructor(word_match_start, word_match_end, skip_missing_glyphs) {
            const ret = wasm.morphoptions_new(
                word_match_start,
                word_match_end,
                skip_missing_glyphs,
            );
            this.__wbg_ptr = ret >>> 0;
            MorphOptionsFinalization.register(this, this.__wbg_ptr, this);
            return this;
        }
        /**
         * Whether to skip rules that reference missing glyphs instead of failing.
         * @param {boolean} arg0
         */
        set skip_missing_glyphs(arg0) {
            wasm.__wbg_set_morphoptions_skip_missing_glyphs(
                this.__wbg_ptr,
                arg0,
            );
        }
        /**
         * Whether to require a word boundary after the matched source word.
         *
         * ## Example
         *
         * Say we want to morph "banana" to "orange". With end matching enabled,
         * `bananas` will not be affected; with it disabled, `bananas` can be
         * rendered as `oranges`.
         * @param {boolean} arg0
         */
        set word_match_end(arg0) {
            wasm.__wbg_set_morphoptions_word_match_end(this.__wbg_ptr, arg0);
        }
        /**
         * Whether to require a word boundary before the matched source word.
         *
         * ## Example
         *
         * Say we want to morph "banana" to "orange". With start matching enabled,
         * `xbanana` will not be affected; with it disabled, `xbanana` can be
         * rendered as `xorange`.
         * @param {boolean} arg0
         */
        set word_match_start(arg0) {
            wasm.__wbg_set_morphoptions_word_match_start(this.__wbg_ptr, arg0);
        }
    }
    if (Symbol.dispose)
        MorphOptions.prototype[Symbol.dispose] = MorphOptions.prototype.free;

    /**
     * WebAssembly entry point that morphs the provided font bytes using multiple rules.
     * @param {Uint8Array} font_data
     * @param {Array<any>} rules
     * @param {MorphOptions} options
     * @returns {Uint8Array}
     */
    function morphFontMany(font_data, rules, options) {
        const ptr0 = passArray8ToWasm0(font_data, wasm.__wbindgen_malloc);
        const len0 = WASM_VECTOR_LEN;
        _assertClass(options, MorphOptions);
        var ptr1 = options.__destroy_into_raw();
        const ret = wasm.morphFontMany(ptr0, len0, rules, ptr1);
        if (ret[3]) {
            throw takeFromExternrefTable0(ret[2]);
        }
        var v3 = getArrayU8FromWasm0(ret[0], ret[1]).slice();
        wasm.__wbindgen_free(ret[0], ret[1] * 1, 1);
        return v3;
    }

    /**
     * WebAssembly entry point that parses a recipe TOML string into JS-friendly data.
     * @param {string} recipe_toml
     * @returns {any}
     */
    function parseRecipe(recipe_toml) {
        const ptr0 = passStringToWasm0(
            recipe_toml,
            wasm.__wbindgen_malloc,
            wasm.__wbindgen_realloc,
        );
        const len0 = WASM_VECTOR_LEN;
        const ret = wasm.parseRecipe(ptr0, len0);
        if (ret[2]) {
            throw takeFromExternrefTable0(ret[1]);
        }
        return takeFromExternrefTable0(ret[0]);
    }

    /**
     * WebAssembly entry point that serializes structured recipe data to TOML.
     * @param {Array<any>} rules
     * @param {MorphOptions} options
     * @returns {string}
     */
    function serializeRecipe(rules, options) {
        let deferred3_0;
        let deferred3_1;
        try {
            _assertClass(options, MorphOptions);
            var ptr0 = options.__destroy_into_raw();
            const ret = wasm.serializeRecipe(rules, ptr0);
            var ptr2 = ret[0];
            var len2 = ret[1];
            if (ret[3]) {
                ptr2 = 0;
                len2 = 0;
                throw takeFromExternrefTable0(ret[2]);
            }
            deferred3_0 = ptr2;
            deferred3_1 = len2;
            return getStringFromWasm0(ptr2, len2);
        } finally {
            wasm.__wbindgen_free(deferred3_0, deferred3_1, 1);
        }
    }

    function __wbg_get_imports() {
        const import0 = {
            __proto__: null,
            __wbg___wbindgen_string_get_395e606bd0ee4427: function (
                arg0,
                arg1,
            ) {
                const obj = arg1;
                const ret = typeof obj === "string" ? obj : undefined;
                var ptr1 = isLikeNone(ret)
                    ? 0
                    : passStringToWasm0(
                          ret,
                          wasm.__wbindgen_malloc,
                          wasm.__wbindgen_realloc,
                      );
                var len1 = WASM_VECTOR_LEN;
                getDataViewMemory0().setInt32(arg0 + 4 * 1, len1, true);
                getDataViewMemory0().setInt32(arg0 + 4 * 0, ptr1, true);
            },
            __wbg___wbindgen_throw_6ddd609b62940d55: function (arg0, arg1) {
                throw new Error(getStringFromWasm0(arg0, arg1));
            },
            __wbg_from_4bdf88943703fd48: function (arg0) {
                const ret = Array.from(arg0);
                return ret;
            },
            __wbg_get_a8ee5c45dabc1b3b: function (arg0, arg1) {
                const ret = arg0[arg1 >>> 0];
                return ret;
            },
            __wbg_get_unchecked_329cfe50afab7352: function (arg0, arg1) {
                const ret = arg0[arg1 >>> 0];
                return ret;
            },
            __wbg_length_b3416cf66a5452c8: function (arg0) {
                const ret = arg0.length;
                return ret;
            },
            __wbg_morphoptions_new: function (arg0) {
                const ret = MorphOptions.__wrap(arg0);
                return ret;
            },
            __wbg_new_a70fbab9066b301f: function () {
                const ret = new Array();
                return ret;
            },
            __wbg_new_ab79df5bd7c26067: function () {
                const ret = new Object();
                return ret;
            },
            __wbg_push_e87b0e732085a946: function (arg0, arg1) {
                const ret = arg0.push(arg1);
                return ret;
            },
            __wbg_set_7eaa4f96924fd6b3: function () {
                return handleError(function (arg0, arg1, arg2) {
                    const ret = Reflect.set(arg0, arg1, arg2);
                    return ret;
                }, arguments);
            },
            __wbindgen_cast_0000000000000001: function (arg0, arg1) {
                // Cast intrinsic for `Ref(String) -> Externref`.
                const ret = getStringFromWasm0(arg0, arg1);
                return ret;
            },
            __wbindgen_init_externref_table: function () {
                const table = wasm.__wbindgen_externrefs;
                const offset = table.grow(4);
                table.set(0, undefined);
                table.set(offset + 0, undefined);
                table.set(offset + 1, null);
                table.set(offset + 2, true);
                table.set(offset + 3, false);
            },
        };
        return {
            __proto__: null,
            "./morphio_bg.js": import0,
        };
    }

    const MorphOptionsFinalization =
        typeof FinalizationRegistry === "undefined"
            ? { register: () => {}, unregister: () => {} }
            : new FinalizationRegistry((ptr) =>
                  wasm.__wbg_morphoptions_free(ptr >>> 0, 1),
              );

    function addToExternrefTable0(obj) {
        const idx = wasm.__externref_table_alloc();
        wasm.__wbindgen_externrefs.set(idx, obj);
        return idx;
    }

    function _assertClass(instance, klass) {
        if (!(instance instanceof klass)) {
            throw new Error(`expected instance of ${klass.name}`);
        }
    }

    function getArrayU8FromWasm0(ptr, len) {
        ptr = ptr >>> 0;
        return getUint8ArrayMemory0().subarray(ptr / 1, ptr / 1 + len);
    }

    let cachedDataViewMemory0 = null;
    function getDataViewMemory0() {
        if (
            cachedDataViewMemory0 === null ||
            cachedDataViewMemory0.buffer.detached === true ||
            (cachedDataViewMemory0.buffer.detached === undefined &&
                cachedDataViewMemory0.buffer !== wasm.memory.buffer)
        ) {
            cachedDataViewMemory0 = new DataView(wasm.memory.buffer);
        }
        return cachedDataViewMemory0;
    }

    function getStringFromWasm0(ptr, len) {
        ptr = ptr >>> 0;
        return decodeText(ptr, len);
    }

    let cachedUint8ArrayMemory0 = null;
    function getUint8ArrayMemory0() {
        if (
            cachedUint8ArrayMemory0 === null ||
            cachedUint8ArrayMemory0.byteLength === 0
        ) {
            cachedUint8ArrayMemory0 = new Uint8Array(wasm.memory.buffer);
        }
        return cachedUint8ArrayMemory0;
    }

    function handleError(f, args) {
        try {
            return f.apply(this, args);
        } catch (e) {
            const idx = addToExternrefTable0(e);
            wasm.__wbindgen_exn_store(idx);
        }
    }

    function isLikeNone(x) {
        return x === undefined || x === null;
    }

    function passArray8ToWasm0(arg, malloc) {
        const ptr = malloc(arg.length * 1, 1) >>> 0;
        getUint8ArrayMemory0().set(arg, ptr / 1);
        WASM_VECTOR_LEN = arg.length;
        return ptr;
    }

    function passStringToWasm0(arg, malloc, realloc) {
        if (realloc === undefined) {
            const buf = cachedTextEncoder.encode(arg);
            const ptr = malloc(buf.length, 1) >>> 0;
            getUint8ArrayMemory0()
                .subarray(ptr, ptr + buf.length)
                .set(buf);
            WASM_VECTOR_LEN = buf.length;
            return ptr;
        }

        let len = arg.length;
        let ptr = malloc(len, 1) >>> 0;

        const mem = getUint8ArrayMemory0();

        let offset = 0;

        for (; offset < len; offset++) {
            const code = arg.charCodeAt(offset);
            if (code > 0x7f) break;
            mem[ptr + offset] = code;
        }
        if (offset !== len) {
            if (offset !== 0) {
                arg = arg.slice(offset);
            }
            ptr = realloc(ptr, len, (len = offset + arg.length * 3), 1) >>> 0;
            const view = getUint8ArrayMemory0().subarray(
                ptr + offset,
                ptr + len,
            );
            const ret = cachedTextEncoder.encodeInto(arg, view);

            offset += ret.written;
            ptr = realloc(ptr, len, offset, 1) >>> 0;
        }

        WASM_VECTOR_LEN = offset;
        return ptr;
    }

    function takeFromExternrefTable0(idx) {
        const value = wasm.__wbindgen_externrefs.get(idx);
        wasm.__externref_table_dealloc(idx);
        return value;
    }

    let cachedTextDecoder = new TextDecoder("utf-8", {
        ignoreBOM: true,
        fatal: true,
    });
    cachedTextDecoder.decode();
    const MAX_SAFARI_DECODE_BYTES = 2146435072;
    let numBytesDecoded = 0;
    function decodeText(ptr, len) {
        numBytesDecoded += len;
        if (numBytesDecoded >= MAX_SAFARI_DECODE_BYTES) {
            cachedTextDecoder = new TextDecoder("utf-8", {
                ignoreBOM: true,
                fatal: true,
            });
            cachedTextDecoder.decode();
            numBytesDecoded = len;
        }
        return cachedTextDecoder.decode(
            getUint8ArrayMemory0().subarray(ptr, ptr + len),
        );
    }

    const cachedTextEncoder = new TextEncoder();

    if (!("encodeInto" in cachedTextEncoder)) {
        cachedTextEncoder.encodeInto = function (arg, view) {
            const buf = cachedTextEncoder.encode(arg);
            view.set(buf);
            return {
                read: arg.length,
                written: buf.length,
            };
        };
    }

    let WASM_VECTOR_LEN = 0;

    let wasmModule, wasm;
    function __wbg_finalize_init(instance, module) {
        wasm = instance.exports;
        console.log("WASM exports:", wasm);
        wasmModule = module;
        cachedDataViewMemory0 = null;
        cachedUint8ArrayMemory0 = null;
        wasm.__wbindgen_start();
        return wasm;
    }

    async function __wbg_load(module, imports) {
        if (typeof Response === "function" && module instanceof Response) {
            if (typeof WebAssembly.instantiateStreaming === "function") {
                try {
                    return await WebAssembly.instantiateStreaming(
                        module,
                        imports,
                    );
                } catch (e) {
                    const validResponse =
                        module.ok && expectedResponseType(module.type);

                    if (
                        validResponse &&
                        module.headers.get("Content-Type") !==
                            "application/wasm"
                    ) {
                        console.warn(
                            "`WebAssembly.instantiateStreaming` failed because your server does not serve Wasm with `application/wasm` MIME type. Falling back to `WebAssembly.instantiate` which is slower. Original error:\n",
                            e,
                        );
                    } else {
                        throw e;
                    }
                }
            }

            const bytes = await module.arrayBuffer();
            return await WebAssembly.instantiate(bytes, imports);
        } else {
            const instance = await WebAssembly.instantiate(module, imports);

            if (instance instanceof WebAssembly.Instance) {
                return { instance, module };
            } else {
                return instance;
            }
        }

        function expectedResponseType(type) {
            switch (type) {
                case "basic":
                case "cors":
                case "default":
                    return true;
            }
            return false;
        }
    }

    function initSync(module) {
        if (wasm !== undefined) return wasm;

        if (module !== undefined) {
            if (Object.getPrototypeOf(module) === Object.prototype) {
                ({ module } = module);
            } else {
                console.warn(
                    "using deprecated parameters for `initSync()`; pass a single object instead",
                );
            }
        }

        const imports = __wbg_get_imports();
        if (!(module instanceof WebAssembly.Module)) {
            module = new WebAssembly.Module(module);
        }
        const instance = new WebAssembly.Instance(module, imports);
        return __wbg_finalize_init(instance, module);
    }

    async function __wbg_init(module_or_path) {
        if (wasm !== undefined) return wasm;

        if (module_or_path !== undefined) {
            if (Object.getPrototypeOf(module_or_path) === Object.prototype) {
                ({ module_or_path } = module_or_path);
            } else {
                console.warn(
                    "using deprecated parameters for the initialization function; pass a single object instead",
                );
            }
        }

        if (module_or_path === undefined) {
            // module_or_path = new URL("morphio_bg.wasm", import.meta.url);
        }
        const imports = __wbg_get_imports();

        if (
            typeof module_or_path === "string" ||
            (typeof Request === "function" &&
                module_or_path instanceof Request) ||
            (typeof URL === "function" && module_or_path instanceof URL)
        ) {
            module_or_path = fetch(module_or_path);
        }

        const { instance, module } = await __wbg_load(
            await module_or_path,
            imports,
        );

        return __wbg_finalize_init(instance, module);
    }

    const url = GM_getResourceURL("wasmModule");
    console.log("WASM URL:", url);
    await __wbg_init({ module_or_path: url }); // Maybe GM_getResourceText?
    console.log("WASM loaded");
    const ser = serializeRecipe([], new MorphOptions(true, true, true));
    console.log("Serialized recipe:", ser);
})();
