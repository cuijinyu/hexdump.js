//
// Hexdump v1.0.1
// author Cuijinyu
// 2019.5.8
//

/**
 * render hexdump 
 * options eg:
 * {
 *  el: body,
 *  mode: 'html',
 *  spacing: 2,
 *  rightBreak: '|',
 *  leftBreak: '|',
 *  offset: 16
 * }
 * @param {*} str 
 * @param {*} options 
 */
function hexdump(str, options) {

    // get the aim element, render mode and other options
    // mode should be html or string (string mode should be render in <pre></pre>) default string mode
    // spacing means the space between each hex
    // left break means the character between offset part and the hex part
    // render : true => display the output, false => only get the output string
    let { el } = options;
    let mode = options.mode || 'string';
    let spacing = options.spacing || 2;
    let rightBreak = options.rightBreak || '|';
    let leftBreak = options.leftBreak || '|';
    let offset = options.offset || 16;
    let render = options.render || true;

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
                for (let i = 0; i < offset; i++) {
                    str += `<span style='color:red' class="hexdump-hex">${i.toString(16).toUpperCase()}</span>`
                }
                return str;
            }
        )()}</div>`;
        let outWrapper = '<div class="hexdump-wrapper">' + hexdumpTitle;
        for (let i = 0; i < aimString.byteLength; i += offset) {
            outWrapper += `<div class="hexdump-hex-left"><span class="hexdump-offset">0000${(i.toString(16).toUpperCase()).slice(-4)}<span class="hexdump-leftBreak">${leftBreak}</span></span>`;
            for (let j = 0; j < offset; j++) {
                let ch =
                    i + j > aimString.byteLength - 1
                        ? `<span class="hexdump-hex"></span>`
                        : `<span class="hexdump-hex" data-index="${j}"  data-row="${Math.floor(i / offset)}">${(
                            0 +
                            view
                                .getUint8(i + j)
                                .toString(16)
                                .toUpperCase()
                        ).slice(-2)}</span>`;
                outWrapper += ch;
            }
            outWrapper += `</div><div class="hexdump-hex-right"><span><span>${rightBreak}</span>`;
            let rightChars = String.fromCharCode
                .apply(null, new Uint8Array(aimString.slice(i, i + offset)))
                .replace(/[^\x20-\x7E]/g, ".")
                .split("");
            outWrapper += `<span>${
                (() => {
                    let output = '';
                    rightChars.forEach((char, index) => {
                        output += `<span class="hexdump-hex" data-index="${index}" data-row="${Math.floor(i / offset)}">${char}</span>`
                    })
                    return output;
                })()
            }</span></span></div></br>`;
        }
        outWrapper += '</div>';
        dump = outWrapper;
    }

    /**
     * render function of string mode
     * @param {*} string 
     */
    const renderStringMode = () => {
        dump =`<span style='color:red'>offset   ${(
            () => {
                let str = '';
                for (let i = 0; i < offset; i++) {
                    str += `${i.toString(16).toUpperCase()}  ${spaceGenerator(spacing)}`
                }
                return str;
            }
        )()}</span>`;
        for (let i = 0; i < aimString.byteLength; i += offset) {
            dump += `\n<span>0000${(i.toString(16).toUpperCase()).slice(-4)}${leftBreak}   </span>`;
            for (let j = 0; j < offset; j++) {
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
                .apply(null, new Uint8Array(aimString.slice(i, i + offset)))
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
                user-select:none;
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
            .hexdump-hex-left,
            .hexdump-hex-right {
                display: inline-block;
            }
            .hexdump-hex-left {
                float: left;
            }
            .hexdump-leftBreak {
                float: right;
                position: relative;
                right: 10px;
            }
            .hexdump-red {
                background: red;
                color: white;
            }
            .hexdump-blue {
                background: blue;
                color: white;
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

    if (render){
        el.innerHTML = dump;
        insertStyle();
    }

    const hexLefts = document.getElementsByClassName("hexdump-hex-left");
    const hexRights = document.getElementsByClassName("hexdump-hex-right");
    const hexWrapper = document.getElementsByClassName("hexdump-wrapper")[0];

    for (let i = 0; i < hexLefts.length; i++) {
        hexLefts[i].addEventListener("click", target => {
            let rightCharElement = hexRights[i].getElementsByClassName("hexdump-hex")[target.srcElement.dataset.index];
            if (target.srcElement.classList.contains("hexdump-hex")) {
                target.srcElement.classList.toggle("hexdump-blue");
                rightCharElement.classList.toggle("hexdump-red");
            }
        })
    }

    // two flag which means the start and the end of the select
    let startFlag = null, endFlag = null;

    hexWrapper.addEventListener("mousedown", target => {
        if (target.srcElement.classList.contains("hexdump-hex")) {
            startFlag = [parseInt(target.srcElement.dataset.row), parseInt(target.srcElement.dataset.index)];
        }
    })

    hexWrapper.addEventListener("mouseup", target => {
        if (target.srcElement.classList.contains("hexdump-hex")) {
            if (startFlag) {
                endFlag = [parseInt(target.srcElement.dataset.row), parseInt(target.srcElement.dataset.index)];
                if (endFlag[0] == startFlag[0] && endFlag[1] == startFlag[1]){
                    return;
                }
                if (endFlag[0] < startFlag[0] || (endFlag[0] == startFlag[0] && endFlag[1] < startFlag[1])) {
                    let temp = endFlag;
                    endFlag = startFlag;
                    startFlag = temp;
                }
                for (let startRow = startFlag[0]; startRow <= endFlag[0]; startRow ++) {
                    let lineStarter = 0;
                    let lineEnder = offset - 1;
                    if (startRow === startFlag[0]) {
                        lineStarter = startFlag[1];
                    }
                    if (startRow === endFlag[0]) {
                        lineEnder = endFlag[1];
                    }
                    for (let startLine = lineStarter; startLine <= lineEnder; startLine ++) {
                        hexLefts[startRow].getElementsByClassName("hexdump-hex")[startLine].classList.toggle("hexdump-blue");
                        hexRights[startRow].getElementsByClassName("hexdump-hex")[startLine].classList.toggle("hexdump-red");
                    }
                }
            } else {
                startFlag = null;
            }
        }
        startFlag = null;
        endFlag = null;
    })

    return dump;
}