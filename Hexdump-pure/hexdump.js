/**
 * render hexdump 
 * @param {*} str 
 * @param {*} options 
 */
function hexdump(str, options) {

    // get the aim element, render mode and other options
    // mode should be html or string (string mode should be render in <pre></pre>) default string mode
    // spacing means the space between each hex
    // left break means the character between offset part and the hex part
    let { el } = options;
    let mode = options.mode || 'string';
    let spacing = options.spacing || 2;
    let rightBreak = options.rightBreak || '|';
    let leftBreak = options.leftBreak || '|';
    let offset = options.offset || 16;

    let aimString = str;

    /**
     * string -> Uint8Array buffer
     * @param {*} str input string
     */
    const string2buffer = Str => {
        Str = Str.split("");
        let val = [];
        for (let i = 0; i < Str.length; i++) {
            val.push(Str[i].charCodeAt().toString(16));
        }
        return new Uint8Array(
            val.map(function (h) {
                return parseInt(h, 16);
            })
        ).buffer;
    }

    const spaceGenerator = count => {
        let space = '';
        for (let i = 0; i < count; i++) {
            space += ' ';
        }
        return space;
    }

    /**
     * render function of html mode
     * @param {*} htmlString 
     */
    const renderHtmlMode = () => {
        let hexdumpTitle = `<div><span style='color:red' class="hexdump-offset">offset</span>${(
            () => {
                let str = '';
                for (let i = 0; i < 16; i++) {
                    str += `<span style='color:red' class="hexdump-hex">${i}</span>`
                }
                return str;
            }
        )()}</div>`;
        let outWrapper = '<div class="hexdump-wrapper">' + hexdumpTitle;
        for (let i = 0; i < aimString.byteLength; i += 16) {
            outWrapper += `<span class="hexdump-offset">0000${(i.toString(16).toUpperCase()).slice(-4)}</span>${leftBreak}`;
            for (let j = 0; j < 16; j++) {
                let ch =
                    i + j > aimString.byteLength - 1
                        ? "  "
                        : `<span class="hexdump-hex">${(
                            0 +
                            view
                                .getUint8(i + j)
                                .toString(16)
                                .toUpperCase()
                        ).slice(-2)}</span>`;
                outWrapper += ch;
            }
            outWrapper += `<span><span>${rightBreak}</span>`
            outWrapper += `<span>${String.fromCharCode
                .apply(null, new Uint8Array(aimString.slice(i, i + 16)))
                .replace(/[^\x20-\x7E]/g, ".")}</span></span></br>`;
        }
        outWrapper += '</div>';
        dump = outWrapper;
    }

    /**
     * render function of string mode
     * @param {*} string 
     */
    const renderStringMode = () => {
        dump =`<span style='color:red'>offset   0${spaceGenerator(spacing)}  1${spaceGenerator(spacing)}  2${spaceGenerator(spacing)}  3${spaceGenerator(spacing)}  4${spaceGenerator(spacing)}  5${spaceGenerator(spacing)}  6${spaceGenerator(spacing)}  7${spaceGenerator(spacing)}  8${spaceGenerator(spacing)}  9${spaceGenerator(spacing)}  A${spaceGenerator(spacing)}  B${spaceGenerator(spacing)}  C${spaceGenerator(spacing)}  D${spaceGenerator(spacing)}  E${spaceGenerator(spacing)}  F${spaceGenerator(spacing)}    </span>`;
        for (let i = 0; i < aimString.byteLength; i += 16) {
            dump += `\n<span>0000${(i.toString(16).toUpperCase()).slice(-4)}${leftBreak}   </span>`;
            for (let j = 0; j < 16; j++) {
                let ch =
                    i + j > aimString.byteLength - 1
                        ? "  "
                        : (
                            0 +
                            view
                                .getUint8(i + j)
                                .toString(16)
                                .toUpperCase()
                        ).slice(-2);
                dump += `${ch} ${spaceGenerator(spacing)}`;
            }
            dump += rightBreak;
            dump += String.fromCharCode
                .apply(null, new Uint8Array(aimString.slice(i, i + 16)))
                .replace(/[^\x20-\x7E]/g, ".");
        }
    }

    const insertStyle = () => {

        // style of the rendered html or string
        let style = mode === 'html'? `
            span {
                color: blue;
            }
            .hexdump-wrapper {
                box-shadow:0px 5px 20px -4px rgba(0,0,0,0.5);
                border-radius: 25px;
                padding: 10px;
                min-height: 100px;
            }
            .hexdump-hex {
                margin-right: 5px;
                display: inline-block;
                width: 25px;
                text-align: center;
                box-shadow:0px 5px 20px -4px rgba(0,0,0,0.5);
            }
            .hexdump-hex:hover {
                transform: scale(1.2);
                transition: all .2s;
            }
            .hexdump-offset {
                display: inline-block;
                width: 70px;
            }
        `:`
            span {
                color: blue;
            }
        `;
        let styleElement = document.createElement('style');
        styleElement.innerHTML = style;
        document.head.appendChild(styleElement);
    }

    if (typeof aimString === 'string') {
        aimString = string2buffer(str);
    }
    if (!(aimString instanceof ArrayBuffer)) {
        console.error("[ERROR]:Input must be string or buffer");
    }
    let dump;
    let view = new DataView(aimString);

    mode === 'html' ? renderHtmlMode(): renderStringMode();

    el.innerHTML = dump;
    insertStyle();

    return dump;
}