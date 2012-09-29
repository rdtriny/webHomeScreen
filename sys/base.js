(function (window, undefined) {
    var base = function (config) {
        if (config && typeof config == "object") {
            for (var i in config) {
                base.Config[i] = config[i]
            }
        }
    };
    base.Config = {
        isVertical: true,
        isBGMovable: false,
        appsPerRow: 4,
        appsPerColumn: 4
    };
    base.extend = function (target) {
        var target = arguments[0];
        if (typeof target != "object" && typeof target != "function") {
            target = {}
        }
        for (var i = 1; i < arguments.length; i++) {
            var options = arguments[i];
            if (typeof options == "object") {
                for (var name in options) {
                    target[name] = options[name]
                }
            }
        }
        return target
    };
    Array.prototype.require = base.require = function (file) {
        var type = toString.call(this),
            target = [];
        if (typeof file == "string") {
            target.push(file)
        }
        if (type.indexOf("Array") != -1) {
            for (var i in this) {
                if (typeof this[i] == "string") {
                    target.push(this[i])
                }
            }
        }
        for (i = 0; i < target.length; i++) {
            var jsFile = target[i];
            if (jsFile.slice(-3)
                .toLowerCase() !== ".js") {
                jsFile += ".js"
            }
            var wdt = document.createElement("script");
            wdt.src = jsFile;
            wdt.type = "text/javascript";
            document.head.appendChild(wdt)
        }
    };
    window._Base_ = base;
    ["./js/Ajax", "./js/Debug", "./js/DOM", "./js/Browser", "./js/System", "./js/Drive", "./js/Page", "./js/App", "./js/Sidebar", "./js/Box", "./js/Queue", "./js/Widget", "./js/Tray", "./js/Notify", "./js/Helper", "./js/Sound", "./js/spriteMovie", "./js/Test"].require()
})(window);
! function (base) {
    base.Ajax = base.extend(base.Ajax, {
        config: {
            type: "GET",
            isAsy: true,
            contentType: "application/x-www-form-urlencoded"
        },
        setConfig: function (type, isAsy, contentType) {
            if (typeof type == "string") {
                base.Ajax.config.type = type
            }
            if (typeof contentType == "string") {
                base.Ajax.config.contentType = contentType
            }
            if (typeof isAsy == "boolean") {
                base.Ajax.config.isAsy = isAsy
            } else {
                if (typeof isAsy == "string") {
                    if (isAsy == "true") {
                        base.Ajax.config.isAsy = true
                    } else {
                        if (isAsy == "false") {
                            base.Ajax.config.isAsy = false
                        }
                    }
                }
            }
            return this
        },
        ajax: function (url, data, callback) {
            var xmlhttp = new XMLHttpRequest();
            if (this.config.type.toUpperCase() == "POST") {
                xmlhttp.open(this.config.type, url, this.config.isAsy);
                xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
                xmlhttp.send(data)
            } else {
                url = encodeURI(url + "?" + data);
                xmlhttp.open(this.config.type, url, this.config.isAsy);
                xmlhttp.send()
            }
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.status == 200) {
                    try {
                        if (xmlhttp.responseXML) {
                            this.getResponseXML(xmlhttp.responseXML);
                            if (typeof callback == "function") {
                                callback(xmlhttp.responseXML)
                            }
                        } else {
                            if (xmlhttp.responseText) {
                                this.getResponseStr(xmlhttp.responseText);
                                if (typeof callback == "function") {
                                    callback(xmlhttp.responseText)
                                }
                            } else {
                                throw "The server response with no valuable entity."
                            }
                        }
                    } catch (message) {
                        debug.log(message)
                    }
                }
            }.bind(base.Ajax)
        },
        getResponseStr: function (str) {
            console.log(str)
        },
        getResponseXML: function (xml) {
            console.log(xml.getElementsByTagName("*")[0].nodeValue)
        },
        get: function (url, queryStr, callback, isAsy) {
            var xmlhttp = new XMLHttpRequest(),
                bool;
            if (typeof isAsy == "boolean") {
                bool = isAsy
            } else {
                bool = true
            }
            url = encodeURI(url + "?" + queryStr);
            xmlhttp.open("GET", url, bool);
            xmlhttp.send();
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.status == 200) {
                    try {
                        if (xmlhttp.responseXML) {
                            this.getResponseXML(xmlhttp.responseXML);
                            if (typeof callback == "function") {
                                callback(xmlhttp.responseXML)
                            }
                        } else {
                            if (xmlhttp.responseText) {
                                this.getResponseStr(xmlhttp.responseText);
                                if (typeof callback == "function") {
                                    callback(xmlhttp.responseText)
                                }
                            } else {
                                throw "The server response with no valuable entity."
                            }
                        }
                    } catch (message) {
                        debug.log(message)
                    }
                }
            }.bind(base.Ajax)
        },
        post: function (url, queryStr, callback, isAsy) {
            var xmlhttp = new XMLHttpRequest(),
                bool;
            if (typeof isAsy == "boolean") {
                bool = isAsy
            } else {
                bool = true
            }
            var data = "";
            if (typeof queryStr == "object") {
                data = JSON.stringify(queryStr)
            } else {
                if (typeof queryStr == "string") {
                    data = queryStr
                }
            }
            xmlhttp.open("POST", url, bool);
            xmlhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
            xmlhttp.send(data);
            xmlhttp.onreadystatechange = function () {
                if (xmlhttp.status == 200) {
                    try {
                        if (xmlhttp.responseXML) {
                            this.getResponseXML(xmlhttp.responseXML);
                            if (typeof callback == "function") {
                                callback(xmlhttp.responseXML)
                            }
                        } else {
                            if (xmlhttp.responseText) {
                                this.getResponseStr(xmlhttp.responseText);
                                if (typeof callback == "function") {
                                    callback(xmlhttp.responseText)
                                }
                            } else {
                                throw "The server response with no valuable entity."
                            }
                        }
                    } catch (message) {
                        debug.log(message)
                    }
                }
            }.bind(base.Ajax)
        }
    });
    _Base_ = base
}(_Base_);
! function (base) {
    base.App = base.extend(base.App, {
        appStyle: null,
        iconWidth: 0,
        iconHeight: 0,
        getSize: function () {
            if (base.App.iconWidth && base.App.iconHeight) {
                return false
            }
            var appScreen = document.getElementById("appScreen");
            if (appScreen.clientWidth && appScreen.clientHeight) {
                base.App.iconWidth = appScreen.clientWidth / 4;
                base.App.iconHeight = appScreen.clientHeight / 4
            }
            return true
        },
        register: function (app) {
            base.App.appsCount++;
            var appNode = base.App.createAppNode(app);
            if (app.widget) {
                base.require(app.widget);
                appNode.setAttribute("hasWidget", "true")
            }
            base.Queue.queue.push(appNode)
        },
        createAppNode: function (app) {
            var appNode;
            if (base.App.appStyle && typeof base.App.appStyle == "function") {
                appNode = base.App.appStyle()
            } else {
                appNode = document.createElement("div");
                appNode.className = "icon";
                appNode.id = app.packageName;
                var closeDiv = document.createElement("div");
                closeDiv.style.position = "absolute";
                closeDiv.style.display = "none";
                closeDiv.style.width = "10px";
                closeDiv.style.height = "10px";
                closeDiv.style.marginTop = "-4px";
                closeDiv.style.marginLeft = "-4px";
                closeDiv.style.zIndex = "2";
                closeDiv.style.background = "url(./images/close.png) top left no-repeat";
                closeDiv.style.backgroundSize = "100% 100%";
                appNode.appendChild(closeDiv);
                var img = document.createElement("img");
                img.src = app.imgSrc;
                appNode.appendChild(img);
                var span = document.createElement("span");
                span.innerHTML = app.title;
                appNode.appendChild(span);
                var openDiv = document.createElement("div");
                openDiv.style.position = "absolute";
                openDiv.style.display = "none";
                openDiv.style.width = "20px";
                openDiv.style.height = "20px";
                openDiv.style.bottom = "0";
                openDiv.style.right = "0";
                openDiv.style.marginTop = "4px";
                openDiv.style.marginLeft = "4px";
                openDiv.style.zIndex = "10";
                openDiv.style.background = "url(./images/enlarge.png) top left no-repeat";
                openDiv.style.backgroundPosition = "right bottom";
                appNode.appendChild(openDiv)
            }
            return appNode
        },
        updateAppStyle: function (func) {
            if (func && typeof func == "function") {
                base.App.appStyle = func;
                return true
            } else {
                return false
            }
        },
        resizeApp: function (app, pos) {
            if (app) {
                app.style.left = (pos % base.Config.appsPerRow) * (100 / base.Config.appsPerRow) + "%";
                app.style.top = Math.floor(pos / base.Config.appsPerColumn) * 100 / (base.Page.pagesCount * base.Config.appsPerColumn) + "%";
                app.style.height = 80 / (base.Page.pagesCount * base.Config.appsPerColumn) + "%"
            }
        },
        shake: function (target) {
            target.style.webkitTransformOrigin = "50% 50%";
            target.style.webkitAnimationDuration = "150ms";
            target.style.webkitAnimationName = "shake";
            target.style.webkitAnimationIterationCount = "2";
            setTimeout(function () {
                target.style.webkitTransformOrigin = "";
                target.style.webkitAnimationDuration = "";
                target.style.webkitAnimationName = "";
                target.style.webkitAnimationIterationCount = ""
            }, 5000)
        }
    });
    base.App = base.extend(base.App, {
        appsCount: 0,
        Yield: function (elPos, widgetSize, direction) {
            if (widgetSize && elPos > 0) {
                if (widgetSize.width == 2 && widgetSize.height == 2) {
                    return base.App.Yield.block22(elPos, widgetSize, direction)
                } else {
                    if (widgetSize.width == 4 && widgetSize.height == 1) {
                        return base.App.Yield.block14(elPos, widgetSize, direction)
                    } else {
                        if (widgetSize.width == 3 && widgetSize.height == 1) {
                            return base.App.Yield.block13(elPos, widgetSize, direction)
                        }
                    }
                }
            }
        }
    });
    base.App.Yield = base.extend(base.App.Yield, {
        block22: function (elPos, widgetSize, direction) {
            var remainder = elPos % base.Config.appsPerRow,
                flag = false;
            var str = "";
            str += base.App.Yield.checkAround(elPos + 4);
            str += base.App.Yield.checkAround(elPos + 5);
            str += base.App.Yield.checkAround(elPos + 1);
            str += base.App.Yield.checkAround(elPos - 3);
            str += base.App.Yield.checkAround(elPos - 4);
            str += base.App.Yield.checkAround(elPos - 5);
            str += base.App.Yield.checkAround(elPos - 1);
            str += base.App.Yield.checkAround(elPos + 3);
            str += str[0];
            console.log(str);
            if (str.substr(2, 3) === "000") {
                if (remainder != 0) {
                    base.Queue.switchQueue(elPos, elPos - 4);
                    elPos -= 4;
                    base.Debug.log("right top blank");
                    flag = true
                }
            } else {
                if (str.substr(4, 3) === "000") {
                    if (remainder != 1) {
                        base.Queue.switchQueue(elPos, elPos - 5);
                        elPos -= 5;
                        base.Debug.log("left top blank");
                        flag = true
                    }
                } else {
                    if (!(str.substr(6, 3)
                        .match(/2/ig)) && !(str.substr(0, 3)
                        .match(/2/ig))) {
                        if ((str.substr(0, 3) + "0")
                            .match(/0/ig)
                            .length < (str.substr(6, 3) + "0")
                            .match(/0/ig)
                            .length) {
                            if (remainder == 1) {
                                base.Queue.switchQueue(elPos, elPos + 1);
                                elPos += 1
                            }
                            base.Debug.log("left down blank");
                            base.Queue.switchQueue(elPos, elPos - 1);
                            elPos -= 1;
                            base.App.Yield.down(elPos, widgetSize)
                        } else {
                            if (remainder == 0) {
                                base.Queue.switchQueue(elPos, elPos - 1);
                                elPos -= 1
                            }
                            base.Debug.log("right down blank");
                            base.App.Yield.down(elPos, widgetSize)
                        }
                        flag = true
                    } else {
                        if (!(str.substr(6, 3)
                            .match(/2/ig)) && (str.substr(0, 3)
                            .match(/2/ig))) {
                            if (remainder != 1) {
                                base.Queue.switchQueue(elPos, elPos - 1);
                                elPos -= 1;
                                base.Debug.log("left down blank");
                                base.App.Yield.down(elPos, widgetSize);
                                flag = true
                            }
                        } else {
                            if ((str.substr(6, 3)
                                .match(/2/ig)) && !(str.substr(0, 3)
                                .match(/2/ig))) {
                                if (remainder != 0) {
                                    base.Debug.log("right down blank");
                                    base.App.Yield.down(elPos, widgetSize);
                                    flag = true
                                }
                            }
                        }
                    }
                }
            }
            var pages = Math.ceil(base.Queue.queue.length / (base.Config.appsPerRow * base.Config.appsPerColumn));
            if (pages > base.Page.pagesCount) {
                base.Page.addPage(1)
            }
            return flag
        },
        block14: function () {},
        block13: function () {},
        checkAround: function (pos) {
            console.log(pos);
            if (pos < 1) {
                return "2"
            }
            if (base.Widget.isWidget(pos)) {
                return "2"
            } else {
                if (base.Queue.queue[pos - 1]) {
                    return "1"
                } else {
                    return "0"
                }
            }
        },
        down: function (elPos, widgetSize) {
            console.log(elPos);
            var vSpace, spaceCount = 0;
            var pos, widgetArray = {}, widgetPos;
            if (elPos % base.Config.appsPerRow == 0) {
                base.Queue.switchQueue(elPos, elPos - 1);
                elPos -= 1
            }
            for (var i = 0; i < widgetSize.width; i++) {
                if (!i) {
                    vSpace = widgetSize.height - 1;
                    pos = elPos + base.Config.appsPerRow;
                    while (spaceCount < vSpace) {
                        if (!base.Queue.queue[pos - 1]) {
                            spaceCount++;
                            for (var k = 0; k < widgetSize.height; k++) {
                                for (var j = 0; j < widgetSize.width; j++) {
                                    widgetPos = pos - j - k * base.Config.appsPerRow;
                                    if (base.Queue.queue[widgetPos - 1] && base.Widget.widgets[base.Queue.queue[widgetPos - 1].id] && base.Widget.widgets[base.Queue.queue[widgetPos - 1].id].widget.style.display == "block") {
                                        widgetArray[base.Queue.queue[widgetPos - 1].id] = widgetPos;
                                        break
                                    }
                                }
                            }
                        }
                        pos += base.Config.appsPerRow
                    }
                    spaceCount = 0;
                    pos -= base.Config.appsPerRow;
                    while (pos > elPos) {
                        if (base.Queue.queue[pos - 1]) {
                            if (widgetArray[base.Queue.queue[pos - 1].id]) {
                                widgetArray[base.Queue.queue[pos - 1].id] += spaceCount * base.Config.appsPerRow
                            }
                            base.Queue.switchQueue(pos, pos + spaceCount * base.Config.appsPerRow)
                        } else {
                            spaceCount++
                        }
                        pos -= base.Config.appsPerRow
                    }
                } else {
                    pos = elPos + i;
                    vSpace = widgetSize.height;
                    while (spaceCount < vSpace) {
                        if (!base.Queue.queue[pos - 1]) {
                            spaceCount++;
                            for (var k = 0; k < widgetSize.height; k++) {
                                for (var j = 0; j < widgetSize.width; j++) {
                                    widgetPos = pos - j - k * base.Config.appsPerRow;
                                    if (base.Queue.queue[widgetPos - 1] && base.Widget.widgets[base.Queue.queue[widgetPos - 1].id] && base.Widget.widgets[base.Queue.queue[widgetPos - 1].id].widget.style.display == "block") {
                                        widgetArray[base.Queue.queue[widgetPos - 1].id] = widgetPos;
                                        break
                                    }
                                }
                            }
                        }
                        pos += base.Config.appsPerRow
                    }
                    spaceCount = 0;
                    pos -= base.Config.appsPerRow;
                    while (pos > elPos) {
                        if (base.Queue.queue[pos - 1]) {
                            if (widgetArray[base.Queue.queue[pos - 1].id]) {
                                widgetArray[base.Queue.queue[pos - 1].id] += spaceCount * base.Config.appsPerRow
                            }
                            base.Queue.switchQueue(pos, pos + spaceCount * base.Config.appsPerRow)
                        } else {
                            spaceCount++
                        }
                        pos -= base.Config.appsPerRow
                    }
                }
                spaceCount = 0
            }
            for (var i in widgetArray) {
                if (typeof widgetArray[i] == "number" && widgetArray[i] != elPos) {
                    base.App.Yield.down(widgetArray[i], {
                        width: 2,
                        height: 2
                    })
                }
            }
        }
    });
    base.App.Drag = base.extend(base.App.Drag, {
        from: false,
        to: false,
        editMode: false,
        activeEdit: false,
        dragStart: function (e) {
            var target = e.target;
            base.Page.rowIndexMem = base.Page.currentRowIndex;
            while (target.parentNode) {
                if (target.parentNode.id == "iconsContainer" || target.className == "icon") {
                    break
                } else {
                    target = target.parentNode
                }
            }
            if (/[A-z0-9]+\./ig.test(target.id)) {
                target.style.webkitTransform = "scale(1.2)";
                target.style.zIndex = "9";
                if (!base.App.editMode) {
                    base.App.activeEdit = true
                } else {
                    base.App.activeEdit = false
                }
                base.App.target = target
            } else {
                if (target.nodeType == 1 && target.getAttribute("iWidget")) {
                    if (!base.App.editMode) {
                        base.App.activeEdit = true
                    } else {
                        base.App.activeEdit = false
                    }
                    base.App.target = target
                } else {
                    base.App.target = null
                }
            }
            if (base.App.activeEdit) {
                base.App.Drag.openEditMode();
                setTimeout(function () {
                    base.Browser.vibrate(60)
                }, 0)
            }
            if (base.App.target) {
                base.App.Drag.bubbleDragEvent(e);
                base.App.from = base.App.Drag.findStartPos();
                base.Tray.isActionOut(target)
            }
        },
        dragMove: function (e) {
            if (!base.App.editMode || !base.App.target) {
                return
            }
            var pagex = base.Drive.Var.endX = e.touches[0].pageX;
            var pagey = base.Drive.Var.endY = e.touches[0].pageY;
            var iconHeight = base.App.iconHeight;
            var iconWidth = base.App.iconWidth;
            var row = Math.round(pagey / iconHeight + 0.4);
            var column = Math.round(pagex / iconWidth + 0.4);
            if (base.Config.isVertical) {
                if (base.Tray.Var.actionOut) {
                    base.App.target.style.left = (pagex - iconWidth / 2) + "px";
                    base.App.target.style.top = (pagey - iconHeight / 2) - iconHeight * base.Config.appsPerColumn + "px"
                } else {
                    base.App.target.style.left = (pagex - iconWidth / 2) + "px";
                    base.App.target.style.top = (pagey - iconHeight / 2) + base.Page.currentRowIndex * iconHeight + "px";
                    if (base.Tray.Var.targetMem) {
                        base.Tray.Var.targetMem.style.left = (pagex - iconWidth / 2) + "px";
                        base.Tray.Var.targetMem.style.top = (pagey - iconHeight / 2) - iconHeight * base.Config.appsPerColumn + "px"
                    }
                }
            }
            if (base.Config.isVertical) {
                if (pagey > iconHeight * 3.5 && pagey < iconHeight * 4) {
                    clearTimeout(base.App.timeout);
                    base.App.timeout = setTimeout(function () {
                        if (base.Page.currentRowIndex + 1 < base.Page.pagesCount * base.Config.appsPerColumn) {
                            base.Page.slideToPage(1, 100)
                        }
                    }, 1000)
                } else {
                    if (pagey < iconHeight * 0.2) {
                        clearTimeout(base.App.timeout);
                        base.App.timeout = setTimeout(function () {
                            if (base.Page.currentRowIndex > 0) {
                                base.Page.slideToPage(-1, 100)
                            }
                        }, 1000)
                    } else {
                        if (pagey >= iconHeight * 4) {
                            clearTimeout(base.App.timeout);
                            if ((!base.Tray.Var.actionOut) && (!base.Tray.Var.actionIn)) {
                                base.Tray.moveInTray()
                            }
                        } else {
                            clearTimeout(base.App.timeout);
                            row = row || 1;
                            if (row > 4) {
                                base.App.to = false
                            } else {
                                row += base.Page.currentRowIndex;
                                base.App.to = (row - 1) * 4 + column
                            }
                        }
                    }
                }
            }
            if (typeof base.App.to == "number") {
                base.Box.highlight(iconWidth);
                base.App.Drag.exchangeOnMove(pagey)
            } else {
                base.Box.highlight(false)
            }
        },
        dragEnd: function (e) {
            clearTimeout(base.App.timeout);
            clearTimeout(base.App.timeout2);
            if (!base.App.editMode || !base.App.target) {
                return
            } else {
                base.App.target.style.webkitTransform = "";
                base.Box.highlight(false)
            }
            if (base.Tray.Var.actionIn) {
                base.Tray.endToIn(base.Drive.Var.endY)
            } else {
                if (base.Tray.Var.actionOut) {
                    if (!base.Queue.queue[base.App.to - 1]) {
                        base.Tray.moveOutTray()
                    }
                    base.Tray.endToOut((!base.Queue.queue[base.App.to - 1]) && (typeof base.App.to == "number"))
                } else {
                    var from = base.App.from;
                    if (typeof (base.App.to) == "number") {
                        var des = base.App.to - 1;
                        if (base.Page.rowIndexMem == base.Page.currentRowIndex || (!base.Queue.queue[des])) {
                            base.App.Drag.doSwitch()
                        } else {
                            base.App.target.style.left = ((from - 1) % base.Config.appsPerRow) * (100 / base.Config.appsPerRow) + "%";
                            base.App.target.style.top = Math.floor((from - 1) / base.Config.appsPerColumn) * 100 / (base.Page.pagesCount * base.Config.appsPerColumn) + "%"
                        }
                        if (base.App.target.getAttribute("iWidget")) {
                            base.App.target.style.zIndex = ""
                        }
                    } else {
                        base.App.target.style.left = ((from - 1) % base.Config.appsPerRow) * (100 / base.Config.appsPerRow) + "%";
                        base.App.target.style.top = Math.floor((from - 1) / base.Config.appsPerColumn) * 100 / (base.Page.pagesCount * base.Config.appsPerColumn) + "%"
                    }
                }
            }
            base.App.to = false;
            base.App.from = false;
            base.App.toMem = false
        },
        findStartPos: function () {
            for (var j = 0; j < base.Queue.queue.length; j++) {
                if (base.Queue.queue[j] && (base.Queue.queue[j].id === base.App.target.id || base.Queue.queue[j].id === base.App.target.getAttribute("iWidget"))) {
                    return (j + 1)
                }
            }
        },
        exchangeOnMove: function (pagey) {
            clearTimeout(base.App.timeout2);
            base.App.timeout2 = setTimeout(function () {
                if (!base.Tray.Var.actionOut && base.Page.rowIndexMem == base.Page.currentRowIndex && pagey < base.App.iconHeight * 4) {
                    base.App.Drag.doSwitch()
                }
            }, 300)
        },
        doSwitch: function () {
            if (base.App.target.getAttribute("iWidget")) {
                if (base.Widget.moveWidget(base.App.from, base.App.to)) {}
                base.App.from = base.App.to
            } else {
                if (base.Widget.isWidget(base.App.to)) {
                    base.Queue.backToFrom(base.App.from)
                } else {
                    base.Queue.switchQueue(base.App.from, base.App.to);
                    base.App.from = base.App.to
                }
            }
        },
        bubbleDragEvent: function (e) {
            var event = document.createEvent("Events");
            event.initEvent("drag", true, true);
            e.target.dispatchEvent(event)
        },
        openEditMode: function () {
            var icons = base.Tray.tray.getElementsByClassName("icon");
            for (var j = 0; j < base.Queue.queue.length; j++) {
                if (base.Queue.queue[j]) {
                    base.Queue.queue[j].firstChild.style.display = "block";
                    if (base.Queue.queue[j].getAttribute("hasWidget")) {
                        base.Queue.queue[j].lastChild.style.display = "block"
                    }
                }
            }
            for (var j in base.Widget.widgets) {
                base.Widget.widgets[j].widget.lastChild.style.display = "block"
            }
            for (var i = 0; i < icons.length; i++) {
                icons[i].firstChild.style.display = "block"
            }
            base.App.editMode = true
        },
        closeEditMode: function () {
            var icons = base.Tray.tray.getElementsByClassName("icon");
            for (var j = 0; j < base.Queue.queue.length; j++) {
                if (base.Queue.queue[j]) {
                    base.Queue.queue[j].firstChild.style.display = "none";
                    if (base.Queue.queue[j].getAttribute("hasWidget")) {
                        base.Queue.queue[j].lastChild.style.display = "none"
                    }
                }
            }
            for (var j in base.Widget.widgets) {
                base.Widget.widgets[j].widget.lastChild.style.display = "none"
            }
            for (var i = 0; i < icons.length; i++) {
                icons[i].firstChild.style.display = "none";
                icons[i].lastChild.style.display = "none"
            }
            base.App.editMode = false;
            base.App.activeEdit = false
        }
    });
    _Base_ = base
}(_Base_);
! function (base) {
    base.Box = base.extend(base.Box, {
        highlightBox: null,
        highlight: function (sideLen) {
            var des = base.App.to - 1,
                i;
            if (!base.Box.highlightBox && sideLen > 1) {
                var div = document.createElement("div");
                div.style.height = sideLen * 0.66 + "px";
                div.style.width = sideLen * 0.66 + "px";
                div.style.marginTop = sideLen / 4 + "px";
                div.style.marginLeft = sideLen / 6 + "px";
                div.style.position = "absolute";
                div.style.display = "none";
                base.container.appendChild(div);
                base.Box.highlightBox = div
            } else {
                if (sideLen !== false) {
                    base.Box.highlightBox.style.display = "block";
                    base.Box.highlightBox.style.left = (des % base.Config.appsPerRow) * (100 / base.Config.appsPerRow) + "%";
                    base.Box.highlightBox.style.top = Math.floor(des / base.Config.appsPerColumn) * 100 / (base.Page.pagesCount * base.Config.appsPerColumn) + "%";
                    if (base.Tray.Var.actionOut || base.Page.rowIndexMem != base.Page.currentRowIndex) {
                        if (base.Queue.queue[des]) {
                            base.Box.highlightBox.style.webkitBoxShadow = "0 0 5px 2px red"
                        } else {
                            base.Box.highlightBox.style.webkitBoxShadow = "0 0 5px 2px green"
                        }
                    } else {
                        base.Box.highlightBox.style.webkitBoxShadow = "0 0 5px 2px green"
                    }
                } else {
                    if (base.Box.highlightBox) {
                        base.Box.highlightBox.style.display = "none"
                    }
                    return "closed"
                }
            }
        }
    });
    _Base_ = base
}(_Base_);
! function (base) {
    base.Browser = base.extend(base.Browser, {
        regListener: function (callbackName) {
            window.nativeapps.setWebUpdateContentCallback(callbackName)
        },
        getDefaultIconUri: function () {
            return window.nativeapps.getDefaultAppIconUri()
        },
        launchApp: function (identification) {
            var array = identification.split("/");
            var pkg = array[0];
            var cls = array[1];
            window.nativeapps.launchActivity(pkg, cls)
        },
        hardkey: function (callbackName) {
            window.nativeapps.setWebKeyEventCallback(callbackName)
        },
        vibrate: function (milliseconds) {
            window.nativeapps.vibrate(milliseconds)
        }
    });
    _Base_ = base
}(_Base_);
! function (base) {
    window.debug = base.Debug = base.extend(base.Debug, {
        log: function () {
            try {
                var str = base.Debug.stringify.apply(base.Debug, arguments)
                    .slice(0, - 1);
                console.log(str);
                return str
            } catch (error) {
                console.log(error)
            }
        },
        stringify: function () {
            var str = "";
            for (var i = 0; i < arguments.length; i++) {
                var type = toString.call(arguments[i]);
                if (type.indexOf("Object") != -1) {
                    str += "{";
                    for (var j in arguments[i]) {
                        str += j + ":" + base.Debug.stringify(arguments[i][j])
                    }
                    if (str[str.length - 1] != "{") {
                        str = str.substr(0, str.length - 1)
                    }
                    str += "},"
                } else {
                    if (type.indexOf("Array") != -1) {
                        str += "[";
                        for (var n = 0; n < arguments[i].length; n++) {
                            str += base.Debug.stringify(arguments[i][n])
                        }
                        if (str[str.length - 1] != "[") {
                            str = str.substr(0, str.length - 1)
                        }
                        str += "],"
                    } else {
                        str += arguments[i] + ","
                    }
                }
            }
            return str
        }
    });
    _Base_ = base
}(_Base_);
! function (base) {
    var quickReg = /(\w+)?[#.]?(\w+)*/;
    base.DOM = function (selector, scope) {
        return new base.DOM.select(selector, scope)
    };
    base.DOM.select = function () {
        var ret = [];
        var selector = arguments[0],
            scope = arguments[1] || window.document;
        if (scope.nodeType !== 1 && scope.nodeType !== 9) {
            scope = window.document
        }
        if (!selector) {
            return this
        }
        if (typeof selector === "object" && selector.nodeType === 1) {
            this.selector = selector;
            return this
        }
        if (typeof selector === "string") {
            var selectArray = selector.trim()
                .split(" ");
            for (var i = 0; i < selectArray.length; i++) {
                var match = quickReg.exec(selectArray[i]);
                if (match) {
                    if (match[2]) {
                        if (match[0].indexOf("#") != -1) {
                            var node = document.getElementById(match[2]);
                            if (!match[1]) {
                                ret.push(node)
                            } else {
                                if (node.nodeName === match[1].toUpperCase()) {
                                    ret.push(node)
                                }
                            }
                        } else {
                            node = Array.prototype.slice.call(scope.getElementsByClassName(match[2]));
                            if (!match[1]) {
                                ret = ret.concat(node)
                            } else {
                                for (var i = 0; i < node.length; i++) {
                                    if (node[i].nodeName === match[1].toUpperCase()) {
                                        ret.push(node[i])
                                    }
                                }
                            }
                        }
                    } else {
                        ret = ret.concat(Array.prototype.slice.call(scope.getElementsByTagName(match[1])))
                    }
                }
            }
            this.selector = ret;
            return this
        }
    };
    base.DOM.select.prototype = base.DOM;
    base.DOM = base.extend(base.DOM, {
        removeAllChild: function (node) {
            this.selector = this.selector || [];
            node = this.selector.concat(node);
            for (var i = 0; i < node.length; i++) {
                if (typeof node[i] == "object" && node[i].nodeType == 1) {
                    while (node[i].firstChild) {
                        node[i].removeChild(node[i].firstChild)
                    }
                }
            }
        },
        listen: function (eventType, func, bool, node) {
            try {
                this.selector = this.selector || [];
                node = this.selector.concat(node);
                for (var i = 0; i < node.length; i++) {
                    if (typeof node[i] == "object" && node[i].nodeType == 1 && ["click", "dbclick", "swipe", "longtap", "drag", "pinch", "touchstart", "touchmove", "touchend", "touchcancel"].indexOf(eventType) != -1) {
                        node[i].addEventListener(eventType, func, bool)
                    } else {
                        throw "wrong arguments, or event is not supported."
                    }
                }
            } catch (error) {
                console.log(error)
            }
        },
        fire: function (eventType, element) {
            this.selector = this.selector || [];
            element = this.selector.concat(element);
            for (var i = 0; i < element.length; i++) {
                if (typeof element[i] == "object" && element[i].nodeType == 1) {
                    var e = document.createEvent("Events");
                    e.initEvent(eventType, true, true);
                    e.target = element[i];
                    element[i].dispatchEvent(e)
                }
            }
        }
    });
    _Base_ = base
}(_Base_);
! function (base) {
    base.Drive = base.Drive || {};
    base.Drive.Var = base.Drive.Var || {};
    base.Drive = base.extend(base.Drive, {
        Var: {
            startX: 0,
            startY: 0,
            pinchStartLen: 0,
            pinchEndLen: 0,
            longTapIndex: -1,
            lastClickTime: 0,
            clickIndex: -1,
            movedDistance: 0,
            moveStartX: 0,
            moveStartY: 0,
            nextToEndX: 0,
            nextToEndY: 0,
            endX: 0,
            endY: 0,
            lastMoveTime: undefined
        },
        touchstart: function (e) {
            base.App.getSize();
            base.Sidebar.sideBar(true);
            base.Drive.Var.pinchEndLen = 0;
            if (e.touches.length === 1) {
                base.Drive.Var.startX = e.touches[0].pageX;
                base.Drive.Var.startY = e.touches[0].pageY;
                if (base.App.editMode) {
                    base.App.Drag.dragStart(e)
                }
                base.Drive.Var.longTapIndex = setTimeout(function () {
                    var event = document.createEvent("Events");
                    event.initEvent("longtap", true, true);
                    e.target.dispatchEvent(event);
                    if (!base.App.editMode) {
                        base.App.Drag.dragStart(e)
                    }
                    base.Sidebar.sideBar(false)
                }, 1000)
            } else {
                if (e.touches.length === 2) {
                    clearTimeout(base.Drive.Var.longTapIndex);
                    var lenX = e.touches[1].pageX - e.touches[0].pageX;
                    var lenY = e.touches[1].pageY - e.touches[0].pageY;
                    base.Drive.Var.pinchStartLen = Math.sqrt(lenX * lenX + lenY * lenY)
                }
            }
        },
        touchmove: function (e) {
            var Var = base.Drive.Var;
            e.preventDefault();
            Var.lastMoveTime = new Date;
            clearTimeout(Var.longTapIndex);
            if (!base.App.editMode) {
                if (e.touches.length == 1) {
                    Var.nextToEndX = Var.endX;
                    Var.nextToEndY = Var.endY;
                    var pagex = Var.endX = e.touches[0].pageX;
                    var pagey = Var.endY = e.touches[0].pageY;
                    if (base.Config.isVertical) {
                        var y = Var.startY - pagey + Var.moveStartY;
                        var maxHeight = document.getElementById("appScreen")
                            .clientHeight * (base.Page.pagesCount - 1);
                        if (y > maxHeight) {
                            y = maxHeight
                        } else {
                            if (y < 0) {
                                y = 0
                            }
                        }
                        var des = {
                            x: 0,
                            y: y
                        };
                        Var.movedDistance = pagey - Var.startY
                    } else {
                        var x = pagex - Var.startX + Var.moveStartX;
                        var maxWidth = document.getElementById("appScreen")
                            .clientWidth * (base.Page.pagesCount - 1) * -1;
                        if (x > 0) {
                            x = 0
                        } else {
                            if (x < maxWidth) {
                                x = maxWidth
                            }
                        }
                        des = {
                            x: x,
                            y: 0
                        };
                        Var.movedDistance = pagex - Var.startX
                    }
                    base.Sidebar.moveSidebar(base.Sidebar.sidebar, des);
                    base.Page.moveBG(base.Config.isBGMovable, des);
                    base.Page.css3move(base.container, des)
                } else {
                    if (e.touches.length == 2) {
                        if (!Var.pinchEndLen) {
                            Var.pinchEndLen = Math.sqrt((e.touches[1].pageX - e.touches[0].pageX) * (e.touches[1].pageX - e.touches[0].pageX) + (e.touches[1].pageY - e.touches[0].pageY) * (e.touches[1].pageY - e.touches[0].pageY));
                            var pinchEvent = document.createEvent("Events");
                            pinchEvent.initEvent("pinch", true, true);
                            pinchEvent.scale = Var.pinchEndLen / Var.pinchStartLen;
                            e.target.dispatchEvent(pinchEvent)
                        }
                    }
                }
            } else {
                var pagey = e.touches[0].pageY;
                var y = Var.startY - pagey + Var.moveStartY;
                base.Sidebar.moveSidebar(base.Sidebar.sidebar, {
                    x: 0,
                    y: y
                });
                base.Page.moveBG(base.Config.isBGMovable, {
                    x: 0,
                    y: y
                });
                base.App.Drag.dragMove(e)
            }
        },
        touchend: function (e) {
            var Var = base.Drive.Var,
                currentRowIndex = base.Page.currentRowIndex;
            if (base.App.editMode) {
                base.App.Drag.dragEnd(e);
                var y = currentRowIndex * base.App.iconHeight;
                base.Sidebar.moveSidebar(base.Sidebar.sidebar, {
                    x: 0,
                    y: y
                });
                base.Page.moveBG(base.Config.isBGMovable, {
                    x: 0,
                    y: y
                })
            } else {
                clearTimeout(Var.longTapIndex);
                var w = Var.endX - Var.nextToEndX;
                var h = Var.endY - Var.nextToEndY;
                var time = (new Date - Var.lastMoveTime);
                var lastMoveSpeed = Math.sqrt(w * w + h * h) / time;
                if (Var.endX) {
                    if (Math.abs(Var.endX - Var.startX) > Math.abs(Var.endY - Var.startY)) {
                        if (Var.endX > Var.startX) {
                            var direction = "right"
                        } else {
                            direction = "left"
                        }
                    } else {
                        if (Var.endY > Var.startY) {
                            var direction = "down"
                        } else {
                            direction = "up"
                        }
                    }
                    var swipe = document.createEvent("Events");
                    swipe.initEvent("swipe", true, true);
                    swipe.data = {};
                    swipe.data.direction = direction;
                    swipe.data.endSpeed = lastMoveSpeed;
                    e.target.dispatchEvent(swipe);
                    Var.endX = 0
                }
                if (base.Config.isVertical) {
                    var percent = Var.movedDistance / (base.App.iconHeight * base.Config.appsPerColumn);
                    var max = (base.Page.pagesCount - 1) * base.Config.appsPerColumn;
                    if (lastMoveSpeed > 0.3) {
                        if (percent > 0) {
                            currentRowIndex -= base.Config.appsPerColumn;
                            currentRowIndex = currentRowIndex > 0 ? currentRowIndex : 0
                        } else {
                            if (percent < 0) {
                                currentRowIndex += base.Config.appsPerColumn;
                                currentRowIndex = currentRowIndex < max ? currentRowIndex : max
                            }
                        }
                    } else {
                        var movedRow = Math.round(percent * base.Config.appsPerColumn);
                        currentRowIndex -= movedRow;
                        if (currentRowIndex < 0) {
                            currentRowIndex = 0
                        } else {
                            if (currentRowIndex > max) {
                                currentRowIndex = max
                            }
                        }
                    }
                    var y = currentRowIndex * base.App.iconHeight;
                    Var.moveStartY = y;
                    base.Page.currentRowIndex = currentRowIndex;
                    var des = {
                        x: 0,
                        y: y
                    }
                }
                base.Sidebar.moveSidebar(base.Sidebar.sidebar, des);
                base.Page.css3move(base.container, des, 100);
                base.Page.moveBG(base.Config.isBGMovable, des);
                base.Sidebar.sideBar(false);
                Var.movedDistance = 0
            }
        },
        touchcancel: function (e) {
            base.Drive.touchend(e)
        },
        click: function (e) {
            var Var = base.Drive.Var;
            var now = new Date;
            var target = e.target;
            if (!base.App.editMode) {
                if (now - Var.lastClickTime < 400) {
                    clearTimeout(Var.clickIndex);
                    var event = document.createEvent("Events");
                    event.initEvent("dbclick", true, true);
                    e.target.dispatchEvent(event)
                } else {
                    Var.clickIndex = setTimeout(function () {
                        while (!target.id && target.id != "iconsContainer") {
                            target = target.parentNode
                        }
                        if (/[A-z0-9]+\./ig.test(target.id) && e.target.nodeName == "IMG") {
                            base.Browser.launchApp(target.id);
                            console.log(target.id);
                            base.Sound.playAudio(0)
                        }
                    }, 400)
                }
            }
            Var.lastClickTime = now
        }
    });
    _Base_ = base
}(_Base_);
! function (base) {
    base.Helper = base.extend(base.Helper, {
        toNum: function (arg) {
            var result = parseFloat(arg);
            if (isNaN(result)) {
                result = 0
            }
            return result
        }
    });
    _Base_ = base
}(_Base_);
! function (base) {
    base.Notify = base.extend(base.Notify, {
        notify: function () {}
    });
    _Base_ = base
}(_Base_);
! function (base) {
    base.Page = base.extend(base.Page, {
        pagesCount: 0,
        currentRowIndex: 0,
        slideToPage: function (inc, time) {
            var appsPerColumn = base.Config.appsPerColumn,
                pagesCount = base.Page.pagesCount,
                currentRowIndex = base.Page.currentRowIndex;
            var rows = inc * appsPerColumn;
            currentRowIndex += rows;
            var max = (pagesCount - 1) * appsPerColumn;
            if (currentRowIndex < 0) {
                currentRowIndex = 0
            } else {
                if (currentRowIndex > max) {
                    currentRowIndex = max
                }
            }
            if (base.Config.isVertical) {
                var y = currentRowIndex * base.App.iconHeight;
                base.Page.css3move(base.container, {
                    x: 0,
                    y: y
                }, time);
                base.Drive.Var.moveStartY = y;
                base.Page.currentRowIndex = currentRowIndex
            }
            base.Page.moveBG(base.Config.isBGMovable, {
                x: 0,
                y: y
            })
        },
        css3move: function (el, distance, time) {
            time = time || 0;
            el.style.webkitTransform = "translate3d(" + distance.x + "px, -" + distance.y + "px,0)";
            el.style.webkitTransitionDuration = time + "ms";
            el.style.webkitBackfaceVisiblity = "hidden";
            el.style.webkitTransformStyle = "preserve-3d";
            el.style.webkitTransitionTimingFunction = "cubic-bezier(0.33,0.66,0.66,1)"
        },
        addPage: function (amount) {
            amount = amount || 1;
            base.Page.pagesCount += amount;
            base.Page.pagesCount = base.Page.pagesCount || 1;
            base.System.refresh()
        },
        moveBG: function (isMovable, coor) {
            if (isMovable && typeof coor.y == "number") {
                document.body.style.backgroundPosition = "0 " + (coor.y * 100 / document.getElementById("iconsContainer")
                    .clientHeight) + "%"
            }
        }
    });
    _Base_ = base
}(_Base_);
! function (base) {
    var App = base.App,
        Drive = base.Drive,
        Tray = base.Tray,
        Box = base.Box;
    base.Queue = base.extend(base.Queue, {
        queue: [],
        switchQueue: function (from, to) {
            var nthF = from - 1,
                nthT = to - 1;
            if (base.Queue.queue[nthF]) {
                base.Queue.queue[nthF].style.left = (nthT % base.Config.appsPerRow) * (100 / base.Config.appsPerRow) + "%";
                base.Queue.queue[nthF].style.top = Math.floor(nthT / base.Config.appsPerColumn) * 100 / (base.Page.pagesCount * base.Config.appsPerColumn) + "%";
                base.Widget.locateWidget(base.Queue.queue[nthF].id, base.Queue.queue[nthF].style.top, base.Queue.queue[nthF].style.left)
            }
            if (from != to) {
                if (base.Queue.queue[nthT]) {
                    base.Queue.queue[nthT].style.left = (nthF % base.Config.appsPerRow) * (100 / base.Config.appsPerRow) + "%";
                    base.Queue.queue[nthT].style.top = Math.floor(nthF / base.Config.appsPerColumn) * 100 / (base.Page.pagesCount * base.Config.appsPerColumn) + "%";
                    base.Widget.locateWidget(base.Queue.queue[nthT].id, base.Queue.queue[nthT].style.top, base.Queue.queue[nthT].style.left)
                }
                var tmp = base.Queue.queue[nthT];
                base.Queue.queue[nthT] = base.Queue.queue[nthF];
                base.Queue.queue[nthF] = tmp
            }
        },
        backToFrom: function (from) {
            var nthF = from - 1;
            if (base.Queue.queue[nthF]) {
                base.Queue.queue[nthF].style.left = (nthF % base.Config.appsPerRow) * (100 / base.Config.appsPerRow) + "%";
                base.Queue.queue[nthF].style.top = Math.floor(nthF / base.Config.appsPerColumn) * 100 / (base.Page.pagesCount * base.Config.appsPerColumn) + "%";
                base.Widget.locateWidget(base.Queue.queue[nthF].id, base.Queue.queue[nthF].style.top, base.Queue.queue[nthF].style.left)
            }
        },
        delQueue: function (from) {
            base.Queue.queue[from - 1] = undefined
        }
    });
    _Base_ = base
}(_Base_);
! function (base) {
    base.Sidebar = base.extend(base.Sidebar, {
        sidebar: null,
        sideBar: function (isShow) {
            if (!base.Sidebar.sidebar && isShow) {
                var sidebar = document.createElement("div");
                sidebar.style.position = "absolute";
                var appScreen = document.getElementById("appScreen");
                if (base.Config.isVertical) {
                    sidebar.style.right = "1px";
                    sidebar.style.width = "4px";
                    sidebar.style.height = (appScreen.clientHeight / base.Page.pagesCount) + "px"
                } else {
                    sidebar.style.bottom = "1px";
                    sidebar.style.height = "4px";
                    sidebar.style.width = (appScreen.clientWidth / base.Page.pagesCount) + "px"
                }
                sidebar.style.backgroundColor = "black";
                sidebar.style.opacity = "0.4";
                sidebar.style.borderRadius = "3px";
                sidebar.style.zIndex = "99";
                appScreen.appendChild(sidebar);
                base.Sidebar.sidebar = sidebar
            } else {
                if (base.Sidebar.sidebar && isShow) {
                    base.Sidebar.sidebar.style.display = "block"
                } else {
                    setTimeout(function () {
                        base.Sidebar.sidebar.style.display = "none"
                    }, 1000)
                }
            }
        },
        moveSidebar: function (sidebar, coor) {
            if (sidebar && typeof coor.y == "number") {
                var top = coor.y;
                var containerH = document.getElementById("iconsContainer")
                    .clientHeight;
                sidebar.style.top = 100 * top / containerH + "%"
            }
        }
    });
    _Base_ = base
}(_Base_);
! function (base) {
    base.Sound = base.extend(base.Sound, {
        audio: [],
        loadAudio: function (src) {
            var audio = new Audio(src);
            audio.preload = "auto";
            this.audio.push(audio)
        },
        playAudio: function (index) {
            this.audio[index].play()
        },
        pauseAudio: function (index) {
            this.audio[index].pause()
        },
        volumeup: function (index) {
            this.audio[index].volume += 0.1
        },
        volumedown: function (index) {
            this.audio[index].volume -= 0.1
        }
    });
    _Base_ = base
}(_Base_);
var spriteMovie = (function () {
    function spriteMovie(imgSrc, flashWindowConf, movieArray) {
        this.imgSrc = imgSrc;
        this.flashWindow = flashWindowConf;
        this.movieArray = movieArray;
        this.loadImage(imgSrc)
    }
    spriteMovie.prototype = {
        isImageLoad: false,
        isbgset: false,
        loadImage: function (imgSrc, callback) {
            var img = new Image();
            img.src = imgSrc;
            var that = this;
            img.onload = function () {
                console.log("image load completed!");
                that.isImageLoad = true;
                if (callback && typeof callback == "function") {
                    callback()
                }
                var notice = document.getElementById("notice");
                if (notice) {
                    notice.innerHTML = "Load completed!"
                }
            }
        },
        setFlashWindow: function (config, movieArray, startPos) {
            config.el.style.width = config.width + "px";
            config.el.style.height = config.height + "px";
            var that = this;
            var bgInterval = setInterval(function () {
                if (that.isImageLoad) {
                    config.el.style.background = "url(" + that.imgSrc + ") top left no-repeat";
                    config.el.style.backgroundPosition = "-" + movieArray[startPos].left + "px -" + movieArray[startPos].top + "px";
                    that.isbgset = true;
                    if (that.wantPlayFps) {
                        that.play(that.wantPlayFps);
                        that.wantPlayFps = 0
                    } else {
                        if (that.wantRewindFps) {
                            that.rewind(that.wantRewindFps);
                            that.wantRewindFps = 0
                        }
                    }
                    clearInterval(bgInterval)
                }
            }, 10)
        },
        play: function (fps) {
            this.setFlashWindow(this.flashWindow, this.movieArray, 0);
            fps = fps || 16;
            var time = 1000 / fps;
            this.wantPlayFps = fps;
            if (this.isbgset) {
                this.wantPlayFps = 0;
                var that = this;
                this.frame = this.frame || 0;
                clearInterval(this.start);
                this.start = setInterval(function () {
                    that.flashWindow.el.style.backgroundPosition = "-" + that.movieArray[that.frame].left + "px -" + that.movieArray[that.frame].top + "px";
                    that.frame == (that.movieArray.length - 1) ? (that.frame = 0, that.stop()) : (that.frame++)
                }, time)
            }
        },
        stop: function () {
            if (this.start) {
                clearInterval(this.start);
                this.frame = 0
            }
        },
        pause: function () {
            if (this.start) {
                clearInterval(this.start)
            }
        },
        rewind: function (fps) {
            this.setFlashWindow(this.flashWindow, this.movieArray, this.movieArray.length - 1);
            fps = fps || 16;
            var time = 1000 / fps;
            this.wantRewindFps = fps;
            if (this.isbgset) {
                this.wantRewindFps = 0;
                var that = this;
                var frame = (this.movieArray.length - 1);
                clearInterval(this.start);
                this.start = setInterval(function () {
                    that.flashWindow.el.style.backgroundPosition = "-" + that.movieArray[frame].left + "px -" + that.movieArray[frame].top + "px";
                    if (frame == 0) {
                        if (that.callback) {
                            console.log("call back");
                            that.callback()
                        }
                        clearInterval(that.start)
                    } else {
                        frame--
                    }
                }, time)
            }
        }
    };
    return spriteMovie
})();
! function (base) {
    base.System = base.extend(base.System, {
        init: function (container) {
            if (typeof container == "string") {
                base.container = document.getElementById(container)
            } else {
                if (typeof container == "object" && container.nodeType == 1) {
                    base.container = container
                }
            }
            document.body.addEventListener("touchstart", function (e) {
                base.Drive.touchstart(e)
            }, false);
            document.body.addEventListener("touchmove", function (e) {
                base.Drive.touchmove(e)
            }, false);
            document.body.addEventListener("touchend", function (e) {
                base.Drive.touchend(e)
            }, false);
            document.body.addEventListener("touchcancel", function (e) {
                base.Drive.touchcancel(e)
            }, false);
            document.body.addEventListener("click", function (e) {
                base.Drive.click(e)
            }, false);
            base.Tray.addFixedArea();
            base.Sound.loadAudio("./mp3.mp3")
        },
        run: function (container, config) {
            base(config);
            base.System.init(container);
            window.loadRes = base.System.loadRes;
            base.Browser.regListener("loadRes");
            window.hardkeyListener = base.System.hardkeyListener;
            base.Browser.hardkey("hardkeyListener");
            base.System.showVersion()
        },
        loadRes: function (appListJson, lastBatch) {
            var apps, defaultUri = base.Browser.getDefaultIconUri();
            apps = eval(appListJson);
            var len = apps.length;
            var icon, label;
            for (var i = 0; i < apps.length; i++) {
                var icon = defaultUri;
                if (apps[i].iconUri != null) {
                    icon = apps[i].iconUri
                }
                label = apps[i].label || "LOADING";
                switch (apps[i].appPackage + "/" + apps[i].appClass) {
                case "com.lge.app.richnote/com.lge.app.richnote.RichNoteList":
                    base.App.register({
                        title: label,
                        packageName: apps[i].appPackage + "/" + apps[i].appClass,
                        imgSrc: icon,
                        widget: "./widget/todo.js"
                    });
                    break;
                case "com.lge.music/com.lge.music.MusicBrowserActivity":
                    base.App.register({
                        title: label,
                        packageName: apps[i].appPackage + "/" + apps[i].appClass,
                        imgSrc: icon,
                        widget: "./widget/music.js"
                    });
                    break;
                case "com.android.mms/com.android.mms.ui.ConversationList":
                    base.App.register({
                        title: label,
                        packageName: apps[i].appPackage + "/" + apps[i].appClass,
                        imgSrc: icon,
                        widget: "./widget/message.js"
                    });
                    break;
                case "com.android.cellbroadcastreceiver/com.android.cellbroadcastreceiver.CellBroadcastListActivity":
                    base.App.register({
                        title: label,
                        packageName: apps[i].appPackage + "/" + apps[i].appClass,
                        imgSrc: icon,
                        widget: "./widget/weather.js"
                    });
                    break;
                case "com.android.gallery3d/com.android.gallery3d.app.Gallery":
                    base.App.register({
                        title: label,
                        packageName: apps[i].appPackage + "/" + apps[i].appClass,
                        imgSrc: icon,
                        widget: "./widget/photo.js"
                    });
                    break;
                case "com.android.settings/com.android.settings.Settings":
                    base.App.register({
                        title: label,
                        packageName: apps[i].appPackage + "/" + apps[i].appClass,
                        imgSrc: icon,
                        widget: "./widget/settings.js"
                    });
                    break;
                case "com.lge.clock/com.lge.clock.AlarmClockActivity":
                    base.App.register({
                        title: label,
                        packageName: apps[i].appPackage + "/" + apps[i].appClass,
                        imgSrc: icon,
                        widget: "./widget/clock.js"
                    });
                    break;
                default:
                    base.App.register({
                        title: label,
                        packageName: apps[i].appPackage + "/" + apps[i].appClass,
                        imgSrc: icon,
                        widget: ""
                    })
                }
            }
            if (lastBatch === "true" || lastBatch === true) {
                base.System.display();
                base.System.refresh()
            }
        },
        display: function () {
            var appNode;
            var appsCount = base.App.appsCount;
            base.Page.pagesCount = Math.ceil(appsCount / (base.Config.appsPerRow * base.Config.appsPerColumn));
            for (var i = 0; i < appsCount; i++) {
                appNode = base.Queue.queue[i];
                base.container.appendChild(appNode)
            }
        },
        refresh: function () {
            var container = base.container,
                pagesCount = base.Page.pagesCount,
                appsPerRow = base.Config.appsPerRow,
                appsPerColumn = base.Config.appsPerColumn;
            var icons = base.Queue.queue;
            if (base.Config.isVertical) {
                container.style.height = 100 * pagesCount + "%";
                for (var i = 0; i < icons.length; i++) {
                    base.App.resizeApp(icons[i], i)
                }
            }
            base.Widget.refresh()
        },
        version: "2.1.6 beta",
        showVersion: function () {
            base.Debug.log("Version: " + base.System.version);
            return base.System.version
        },
        hardkeyListener: function (keycode) {
            if (keycode == 4) {
                base.App.Drag.closeEditMode()
            } else {
                if (keycode == 3) {} else {}
            }
        }
    });
    _Base_ = base
}(_Base_);
window.addEventListener("load", function () {
    _Base_.System.run("iconsContainer", {
        isVertical: true,
        appsPerRow: 4,
        appsPerColumn: 4
    })
}, false);

function updateContent() {}
window.addEventListener("gestureend", function () {
    console.log("getsteure")
}, false);
window.addEventListener("swipe", function (e) {}, false);
window.addEventListener("pinch", function (e) {
    if (e.scale > 1) {
        console.log("pinch to larger")
    } else {
        console.log("pinch to smaller")
    }
}, false);
! function (base) {
    var Drive = base.Drive,
        Box = base.Box;
    base.Tray = base.extend(base.Tray, {
        tray: null,
        Var: {
            targetMem: null,
            actionIn: false,
            actionOut: false
        },
        addFixedArea: function () {
            var div = document.createElement("div");
            div.style.width = "100%";
            div.style.height = "16%";
            div.style.zIndex = "31";
            div.style.position = "absolute";
            div.style.bottom = "0";
            div.style.left = "0";
            div.style.backgroundColor = "black";
            div.style.opacity = "0.6";
            div.style.borderTop = "1px solid #F0FFF0";
            div.id = "tray";
            base.Tray.tray = div;
            document.body.appendChild(div)
        },
        moveInTray: function () {
            var target = base.App.target.cloneNode(true);
            target.style.top = "0";
            target.style.height = "100%";
            target.style.width = "20%";
            base.Tray.tray.appendChild(target);
            base.App.target.style.display = "none";
            base.Tray.Var.actionIn = true;
            base.Tray.Var.targetMem = target;
            if (base.Tray.checkFull()) {
                base.App.to = base.App.from
            }
        },
        endToIn: function (pagey) {
            if (pagey >= base.App.iconHeight * 4 && (!base.Tray.checkFull())) {
                base.Queue.delQueue(base.App.from);
                base.container.removeChild(base.App.target);
                base.App.target = base.Tray.Var.targetMem;
                base.App.target.lastChild.style.display = "none"
            } else {
                base.Queue.switchQueue(base.App.from, base.App.to);
                base.Tray.tray.removeChild(base.Tray.Var.targetMem);
                base.App.target.style.display = "block"
            }
            base.Tray.Var.targetMem = null;
            base.Tray.Var.actionIn = false;
            base.Tray.arrange()
        },
        checkFull: function () {
            var icons = base.Tray.tray.getElementsByClassName("icon");
            if (icons.length < 5) {
                return false
            } else {
                return true
            }
        },
        arrange: function () {
            var icons = base.Tray.tray.getElementsByClassName("icon");
            var num = icons.length;
            var spacing = (100 - 25 * num) / (num + 1);
            for (var i = 0; i < num; i++) {
                icons[i].style.webkitTransform = "";
                icons[i].style.top = "0";
                icons[i].style.height = "100%";
                icons[i].style.left = (spacing + 25) * i + spacing + "%"
            }
        },
        moveOutTray: function () {
            var target = base.App.target.cloneNode(true);
            base.container.appendChild(target);
            base.Tray.Var.targetMem = target
        },
        endToOut: function (isSuccess) {
            if (typeof isSuccess == "boolean" && isSuccess) {
                var des = base.App.to - 1;
                base.Tray.tray.removeChild(base.App.target);
                base.App.target = base.Tray.Var.targetMem;
                base.Queue.queue[des] = base.App.target;
                base.App.resizeApp(base.App.target, des);
                if (base.App.target.getAttribute("hasWidget")) {
                    base.App.target.lastChild.style.display = "block"
                }
            } else {
                if (base.Tray.Var.targetMem) {
                    base.container.removeChild(base.Tray.Var.targetMem)
                }
            }
            base.Tray.Var.targetMem = null;
            base.Tray.arrange();
            base.Tray.Var.actionOut = false;
            base.Tray.restoreEvent()
        },
        isActionOut: function (target) {
            try {
                if (target.parentNode && target.parentNode.id == "tray") {
                    base.Tray.Var.actionOut = true
                } else {
                    base.Tray.Var.actionOut = false
                }
            } catch (error) {
                base.Debug.log(error)
            }
        },
        restoreEvent: function () {
            var key = base.App.target.id;
            var widget = base.Widget.widgets[key];
            if (widget) {
                var openNode = document.getElementById(widget.open.node);
                var closeNode = document.getElementById(widget.close.node);
                widget.widget.style.top = base.App.target.style.top;
                widget.widget.style.left = base.App.target.style.left;
                base.Widget.attachEvent(key, openNode, closeNode, widget)
            }
        }
    });
    _Base_ = base
}(_Base_);
! function (base) {
    var Config = base.Config,
        Page = base.Page,
        Drive = base.Drive,
        Tray = base.Tray,
        Box = base.Box;
    base.Widget = base.extend(base.Widget, {
        widgets: {},
        removeWidget: function (widget) {
            var scripts = document.getElementsByTagName("script");
            for (var i = 0; i < scripts.length; i++) {
                if (scripts[i].src == widget) {
                    scripts[i].parentNode.removeChild(scripts[i]);
                    return true
                }
            }
            return false
        },
        registerWidget: function (wgt) {
            for (var i in wgt) {
                base.Widget.widgets[i] = wgt[i];
                try {
                    if (typeof wgt[i].widget == "string") {
                        base.Widget.widgets[i].widget = document.getElementById(wgt[i].widget)
                    } else {
                        if (typeof wgt[i].widget == "object" && wgt[i].widget.nodeType == 1) {
                            base.Widget.widgets[i].widget = wgt[i].widget
                        } else {
                            throw "wrong widget type, it should be DOM node or elemetn ID"
                        }
                    }
                } catch (e) {
                    console.log(e)
                }
                base.Widget.initWidget(i, wgt[i])
            }
        },
        initWidget: function (key, wgt) {
            if (typeof wgt.open.node == "string") {
                base.Widget.widgets[key].open.node = wgt.open.node;
                var openNode = document.getElementById(wgt.open.node)
            } else {
                if (typeof wgt.open.node == "object" && wgt.open.node.nodeType == 1) {
                    base.Widget.widgets[key].open.node = wgt.open.node.id;
                    openNode = wgt.open.node
                }
            }
            if (typeof wgt.close.node == "string") {
                base.Widget.widgets[key].close.node = wgt.close.node;
                var closeNode = document.getElementById(wgt.close.node)
            } else {
                if (typeof wgt.close.node == "object" && wgt.close.node.nodeType == 1) {
                    base.Widget.widgets[key].close.node = wgt.close.node.id;
                    var closeNode = wgt.close.node
                }
            }
            base.Widget.attachEvent(key, openNode, closeNode, wgt)
        },
        locateWidget: function (wgt, top, left) {
            if (base.Widget.widgets[wgt]) {
                var widget = base.Widget.widgets[wgt].widget;
                widget.style.left = left;
                widget.style.top = top
            }
        },
        moveWidget: function (from, to) {
            if (to % base.Config.appsPerRow == 0 || from == to) {
                base.Queue.switchQueue(from, from);
                return false
            }
            var f = [];
            var t = [];
            var inc;
            var pos, widgetPos;
            for (var i = 0; i < 2; i++) {
                for (var j = 0; j < 2; j++) {
                    inc = i * 4 + j;
                    f.push(from + inc);
                    t.push(to + inc);
                    widgetPos = base.Widget.isWidget(to + inc);
                    if (widgetPos && base.Queue.queue[widgetPos - 1].id != base.App.target.getAttribute("iWidget")) {
                        base.Queue.backToFrom(from);
                        return false
                    }
                }
            }
            for (var i = 0; i < f.length; i++) {
                for (var j = 0; j < t.length; j++) {
                    if (f[i] == t[j]) {
                        t[j] = undefined;
                        f[i] = undefined
                    }
                }
            }
            for (var i = 0; i < f.length; i++) {
                for (var j = 0; j < t.length; j++) {
                    if (f[i] && t[j]) {
                        base.Queue.switchQueue(f[i], t[j]);
                        if (i == 0) {
                            pos = t[j]
                        }
                        f[i] = undefined;
                        t[j] = undefined
                    }
                }
            }
            pos = pos || from;
            base.Debug.log("from", from, "to", to, "pos", pos);
            base.Queue.switchQueue(pos, to);
            return true
        },
        isWidget: function (pos) {
            var widgetPos;
            for (var k = 0; k < 2; k++) {
                for (var j = 0; j < 2; j++) {
                    widgetPos = pos - j - k * base.Config.appsPerRow;
                    if (base.Queue.queue[widgetPos - 1] && base.Widget.widgets[base.Queue.queue[widgetPos - 1].id] && base.Widget.widgets[base.Queue.queue[widgetPos - 1].id].widget.style.display == "block") {
                        return widgetPos
                    }
                }
            }
            return false
        },
        attachEvent: function (key, openNode, closeNode, wgt) {
            var elPos = -1;
            openNode.lastChild.addEventListener("click", function (e) {
                for (var j = 0; j < base.Queue.queue.length; j++) {
                    if (base.Queue.queue[j] && base.Queue.queue[j].id === key) {
                        elPos = j + 1;
                        break
                    }
                }
                base.Widget.widgets[key].widget.style.top = openNode.style.top;
                base.Widget.widgets[key].widget.style.left = openNode.style.left;
                base.Widget.widgets[key].widget.style.height = 45 / _Base_.Page.pagesCount + "%";
                try {
                    var isSuccess = base.App.Yield(elPos, base.Widget.widgets[key].size, "right");
                    if (isSuccess === false) {
                        base.App.shake(openNode);
                        console.log("No available space.")
                    } else {
                        wgt.open.func(e);
                        openNode.style.display = "none";
                        closeNode.style.display = "block"
                    }
                } catch (error) {
                    console.log(error)
                }
            }, false);
            closeNode.lastChild.addEventListener("click", function (e) {
                openNode.style.top = base.Widget.widgets[key].widget.style.top;
                openNode.style.left = base.Widget.widgets[key].widget.style.left;
                try {
                    wgt.close.func(e);
                    closeNode.style.display = "none";
                    openNode.style.display = "block"
                } catch (error) {
                    console.log(error)
                }
            }, false)
        },
        refresh: function () {
            for (var i in base.Widget.widgets) {
                base.Widget.widgets[i].widget.style.height = 45 / _Base_.Page.pagesCount + "%";
                base.Widget.widgets[i].widget.style.top = base.Helper.toNum(base.Widget.widgets[i].widget.style.top) * (base.Page.pagesCount - 1) / base.Page.pagesCount + "%"
            }
        }
    });
    _Base_ = base
}(_Base_);