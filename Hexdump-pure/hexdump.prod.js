'use strict';

//
// Hexdump v1.0.2
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
    var el = options.el;

    var mode = options.mode || 'string';
    var spacing = options.spacing || 2;
    var rightBreak = options.rightBreak || '|';
    var leftBreak = options.leftBreak || '|';
    var offset = options.offset || 16;
    var render = options.render;

    if (render == undefined) {
        render = true;
    }

    var aimString = str;

    /**
     * string -> Uint8Array buffer
     * @param {*} str input string
     */
    var string2buffer = function string2buffer(Str) {
        Str = Str.split("");
        var val = [];
        for (var i = 0; i < Str.length; i++) {
            val.push(Str[i].charCodeAt().toString(16));
        }
        return new Uint8Array(val.map(function (h) {
            return parseInt(h, 16);
        })).buffer;
    };

    var spaceGenerator = function spaceGenerator(count) {
        var space = '';
        for (var i = 0; i < count; i++) {
            space += ' ';
        }
        return space;
    };

    /**
     * render function of html mode
     * @param {*} htmlString 
     */
    var renderHtmlMode = function renderHtmlMode() {
        var hexdumpTitle = '<div class="hexdump-title-group"><span style=\'color:red\' class="hexdump-offset">offset</span>' + function () {
            var str = '';
            for (var i = 0; i < offset; i++) {
                str += '<span style=\'color:red\' class="hexdump-hex hexdump-title" data-index="' + i + '">' + i.toString(16).toUpperCase() + '</span>';
            }
            return str;
        }() + '</div>';
        var outWrapper = '<div class="hexdump-wrapper">' + hexdumpTitle;

        var _loop = function _loop(i) {
            outWrapper += '<div class="hexdump-hex-left"><span class="hexdump-offset" data-line="' + Math.floor(i / offset) + '">0000' + i.toString(16).toUpperCase().slice(-4) + '<span class="hexdump-leftBreak">' + leftBreak + '</span></span>';
            for (var j = 0; j < offset; j++) {
                var ch = i + j > aimString.byteLength - 1 ? '<span class="hexdump-hex"></span>' : '<span class="hexdump-hex" data-index="' + j + '"  data-row="' + Math.floor(i / offset) + '">' + (0 + view.getUint8(i + j).toString(16).toUpperCase()).slice(-2) + '</span>';
                outWrapper += ch;
            }
            outWrapper += '</div><div class="hexdump-hex-right"><span><span>' + rightBreak + '</span>';
            var rightChars = String.fromCharCode.apply(null, new Uint8Array(aimString.slice(i, i + offset))).replace(/[^\x20-\x7E]/g, ".").split("");
            outWrapper += '<span>' + function () {
                var output = '';
                rightChars.forEach(function (char, index) {
                    output += '<span class="hexdump-hex" data-index="' + index + '" data-row="' + Math.floor(i / offset) + '">' + char + '</span>';
                });
                return output;
            }() + '</span></span></div></br>';
        };

        for (var i = 0; i < aimString.byteLength; i += offset) {
            _loop(i);
        }
        outWrapper += '</div>';
        dump = outWrapper;
    };

    /**
     * render function of string mode
     * @param {*} string 
     */
    var renderStringMode = function renderStringMode() {
        dump = '<span style=\'color:red\'>offset   ' + function () {
            var str = '';
            for (var i = 0; i < offset; i++) {
                str += i.toString(16).toUpperCase() + '  ' + spaceGenerator(spacing);
            }
            return str;
        }() + '</span>';
        for (var i = 0; i < aimString.byteLength; i += offset) {
            dump += '\n<span>0000' + i.toString(16).toUpperCase().slice(-4) + leftBreak + '   </span>';
            for (var j = 0; j < offset; j++) {
                var ch = i + j > aimString.byteLength - 1 ? "  " : (0 + view.getUint8(i + j).toString(16).toUpperCase()).slice(-2);
                dump += ch + ' ' + spaceGenerator(spacing);
            }
            dump += rightBreak;
            dump += String.fromCharCode.apply(null, new Uint8Array(aimString.slice(i, i + offset))).replace(/[^\x20-\x7E]/g, ".");
        }
    };

    var insertStyle = function insertStyle() {

        // style of the rendered html or string
        var style = mode === 'html' ? '\n            span {\n                color: blue;\n            }\n            .hexdump-wrapper {\n                box-shadow:0px 5px 20px -4px rgba(0,0,0,0.5);\n                border-radius: 25px;\n                padding: 10px;\n                min-height: 100px;\n                user-select:none;\n            }\n            .hexdump-hex {\n                margin-right: ' + spacing + 'px;\n                display: inline-block;\n                width: 25px;\n                text-align: center;\n                box-shadow:0px 5px 20px -4px rgba(0,0,0,0.5);\n            }\n            .hexdump-hex:hover {\n                transform: scale(1.2);\n                transition: all .2s;\n            }\n            .hexdump-offset {\n                display: inline-block;\n                width: 70px;\n            }\n            .hexdump-hex-left,\n            .hexdump-hex-right {\n                display: inline-block;\n            }\n            .hexdump-hex-left {\n                float: left;\n            }\n            .hexdump-leftBreak {\n                float: right;\n                position: relative;\n                right: 10px;\n            }\n            .hexdump-red {\n                background: red;\n                color: white;\n            }\n            .hexdump-blue {\n                background: blue;\n                color: white;\n            }\n        ' : '\n            span {\n                color: blue;\n            }\n        ';
        var styleElement = document.createElement('style');
        styleElement.innerHTML = style;
        document.head.appendChild(styleElement);
    };

    if (typeof aimString === 'string') {
        aimString = string2buffer(str);
    }
    if (!(aimString instanceof ArrayBuffer)) {
        console.error("[ERROR]:Input must be string or buffer");
    }
    var dump = void 0;
    var view = new DataView(aimString);

    mode === 'html' ? renderHtmlMode() : renderStringMode();

    if (render) {
        el.innerHTML = dump;
        insertStyle();
    }

    var hexLefts = document.getElementsByClassName("hexdump-hex-left");
    var hexRights = document.getElementsByClassName("hexdump-hex-right");
    var hexWrapper = document.getElementsByClassName("hexdump-wrapper")[0];
    var hexTitleGroup = document.getElementsByClassName('hexdump-title-group')[0];
    var hexOffsetGroup = document.getElementsByClassName('hexdump-offset');

    hexOffsetGroup = Array.prototype.slice.call(hexOffsetGroup);
    hexOffsetGroup.shift();

    var _loop2 = function _loop2(i) {
        hexLefts[i].addEventListener("click", function (target) {
            var rightCharElement = hexRights[i].getElementsByClassName("hexdump-hex")[target.srcElement.dataset.index];
            if (target.srcElement.classList.contains("hexdump-hex")) {
                target.srcElement.classList.toggle("hexdump-blue");
                rightCharElement.classList.toggle("hexdump-red");
            }
        });
    };

    for (var i = 0; i < hexLefts.length; i++) {
        _loop2(i);
    }

    // two flag which means the start and the end of the select
    var startFlag = null,
        endFlag = null;

    hexWrapper.addEventListener("mousedown", function (target) {
        if (target.srcElement.classList.contains("hexdump-hex")) {
            startFlag = [parseInt(target.srcElement.dataset.row), parseInt(target.srcElement.dataset.index)];
        }
    });

    hexTitleGroup.addEventListener("click", function (target) {
        var column = parseInt(target.srcElement.dataset.index);
        for (var i = 0; i < hexLefts.length; i++) {
            if (hexLefts[i].getElementsByClassName("hexdump-hex")[column].classList.contains("hexdump-hex")) {
                hexLefts[i].getElementsByClassName("hexdump-hex")[column].classList.toggle("hexdump-blue");
                hexRights[i].getElementsByClassName("hexdump-hex")[column].classList.toggle("hexdump-red");
            }
        }
    });

    hexOffsetGroup.forEach(function (offsetElem) {
        offsetElem.addEventListener("click", function (target) {
            var line = parseInt(target.srcElement.dataset.line);
            for (var i = 0; i < offset; i++) {
                try {
                    if (hexLefts[line].getElementsByClassName("hexdump-hex")[i].classList.contains("hexdump-hex")) {
                        hexLefts[line].getElementsByClassName("hexdump-hex")[i].classList.toggle("hexdump-blue");
                        hexRights[line].getElementsByClassName("hexdump-hex")[i].classList.toggle("hexdump-red");
                    }
                } catch (e) {}
            }
        });
    });

    hexWrapper.addEventListener("mouseup", function (target) {
        if (target.srcElement.classList.contains("hexdump-hex")) {
            if (startFlag) {
                endFlag = [parseInt(target.srcElement.dataset.row), parseInt(target.srcElement.dataset.index)];
                if (endFlag[0] == startFlag[0] && endFlag[1] == startFlag[1]) {
                    return;
                }
                if (endFlag[0] < startFlag[0] || endFlag[0] == startFlag[0] && endFlag[1] < startFlag[1]) {
                    var temp = endFlag;
                    endFlag = startFlag;
                    startFlag = temp;
                }
                for (var startRow = startFlag[0]; startRow <= endFlag[0]; startRow++) {
                    var lineStarter = 0;
                    var lineEnder = offset - 1;
                    if (startRow === startFlag[0]) {
                        lineStarter = startFlag[1];
                    }
                    if (startRow === endFlag[0]) {
                        lineEnder = endFlag[1];
                    }
                    for (var startLine = lineStarter; startLine <= lineEnder; startLine++) {
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
    });

    return dump;
}
