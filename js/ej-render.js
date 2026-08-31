var EJ = (() => {
  var __create = Object.create;
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getProtoOf = Object.getPrototypeOf;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __commonJS = (cb, mod) => function __require() {
    try {
      return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
    } catch (e) {
      throw mod = 0, e;
    }
  };
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
    // If the importer is in node compatibility mode or this is not an ESM
    // file that has been converted to a CommonJS file using a Babel-
    // compatible transform (i.e. "__esModule" has not been set), then set
    // "default" to the CommonJS "module.exports" for node compatibility.
    isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
    mod
  ));
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // node_modules/dayjs/dayjs.min.js
  var require_dayjs_min = __commonJS({
    "node_modules/dayjs/dayjs.min.js"(exports, module) {
      !(function(t, e) {
        "object" == typeof exports && "undefined" != typeof module ? module.exports = e() : "function" == typeof define && define.amd ? define(e) : (t = "undefined" != typeof globalThis ? globalThis : t || self).dayjs = e();
      })(exports, (function() {
        "use strict";
        var t = 1e3, e = 6e4, n = 36e5, r = "millisecond", i = "second", s = "minute", u = "hour", a = "day", o = "week", c = "month", f = "quarter", h = "year", d = "date", l = "Invalid Date", $ = /^(\d{4})[-/]?(\d{1,2})?[-/]?(\d{0,2})[Tt\s]*(\d{1,2})?:?(\d{1,2})?:?(\d{1,2})?[.:]?(\d+)?$/, y = /\[([^\]]+)]|Y{1,4}|M{1,4}|D{1,2}|d{1,4}|H{1,2}|h{1,2}|a|A|m{1,2}|s{1,2}|Z{1,2}|SSS/g, M = { name: "en", weekdays: "Sunday_Monday_Tuesday_Wednesday_Thursday_Friday_Saturday".split("_"), months: "January_February_March_April_May_June_July_August_September_October_November_December".split("_"), ordinal: function(t2) {
          var e2 = ["th", "st", "nd", "rd"], n2 = t2 % 100;
          return "[" + t2 + (e2[(n2 - 20) % 10] || e2[n2] || e2[0]) + "]";
        } }, m = function(t2, e2, n2) {
          var r2 = String(t2);
          return !r2 || r2.length >= e2 ? t2 : "" + Array(e2 + 1 - r2.length).join(n2) + t2;
        }, v = { s: m, z: function(t2) {
          var e2 = -t2.utcOffset(), n2 = Math.abs(e2), r2 = Math.floor(n2 / 60), i2 = n2 % 60;
          return (e2 <= 0 ? "+" : "-") + m(r2, 2, "0") + ":" + m(i2, 2, "0");
        }, m: function t2(e2, n2) {
          if (e2.date() < n2.date()) return -t2(n2, e2);
          var r2 = 12 * (n2.year() - e2.year()) + (n2.month() - e2.month()), i2 = e2.clone().add(r2, c), s2 = n2 - i2 < 0, u2 = e2.clone().add(r2 + (s2 ? -1 : 1), c);
          return +(-(r2 + (n2 - i2) / (s2 ? i2 - u2 : u2 - i2)) || 0);
        }, a: function(t2) {
          return t2 < 0 ? Math.ceil(t2) || 0 : Math.floor(t2);
        }, p: function(t2) {
          return { M: c, y: h, w: o, d: a, D: d, h: u, m: s, s: i, ms: r, Q: f }[t2] || String(t2 || "").toLowerCase().replace(/s$/, "");
        }, u: function(t2) {
          return void 0 === t2;
        } }, g = "en", D = {};
        D[g] = M;
        var p = "$isDayjsObject", S = function(t2) {
          return t2 instanceof _ || !(!t2 || !t2[p]);
        }, w = function t2(e2, n2, r2) {
          var i2;
          if (!e2) return g;
          if ("string" == typeof e2) {
            var s2 = e2.toLowerCase();
            D[s2] && (i2 = s2), n2 && (D[s2] = n2, i2 = s2);
            var u2 = e2.split("-");
            if (!i2 && u2.length > 1) return t2(u2[0]);
          } else {
            var a2 = e2.name;
            D[a2] = e2, i2 = a2;
          }
          return !r2 && i2 && (g = i2), i2 || !r2 && g;
        }, O = function(t2, e2) {
          if (S(t2)) return t2.clone();
          var n2 = "object" == typeof e2 ? e2 : {};
          return n2.date = t2, n2.args = arguments, new _(n2);
        }, b = v;
        b.l = w, b.i = S, b.w = function(t2, e2) {
          return O(t2, { locale: e2.$L, utc: e2.$u, x: e2.$x, $offset: e2.$offset });
        };
        var _ = (function() {
          function M2(t2) {
            this.$L = w(t2.locale, null, true), this.parse(t2), this.$x = this.$x || t2.x || {}, this[p] = true;
          }
          var m2 = M2.prototype;
          return m2.parse = function(t2) {
            this.$d = (function(t3) {
              var e2 = t3.date, n2 = t3.utc;
              if (null === e2) return /* @__PURE__ */ new Date(NaN);
              if (b.u(e2)) return /* @__PURE__ */ new Date();
              if (e2 instanceof Date) return new Date(e2);
              if ("string" == typeof e2 && !/Z$/i.test(e2)) {
                var r2 = e2.match($);
                if (r2) {
                  var i2 = r2[2] - 1 || 0, s2 = (r2[7] || "0").substring(0, 3);
                  return n2 ? new Date(Date.UTC(r2[1], i2, r2[3] || 1, r2[4] || 0, r2[5] || 0, r2[6] || 0, s2)) : new Date(r2[1], i2, r2[3] || 1, r2[4] || 0, r2[5] || 0, r2[6] || 0, s2);
                }
              }
              return new Date(e2);
            })(t2), this.init();
          }, m2.init = function() {
            var t2 = this.$d;
            this.$y = t2.getFullYear(), this.$M = t2.getMonth(), this.$D = t2.getDate(), this.$W = t2.getDay(), this.$H = t2.getHours(), this.$m = t2.getMinutes(), this.$s = t2.getSeconds(), this.$ms = t2.getMilliseconds();
          }, m2.$utils = function() {
            return b;
          }, m2.isValid = function() {
            return !(this.$d.toString() === l);
          }, m2.isSame = function(t2, e2) {
            var n2 = O(t2);
            return this.startOf(e2) <= n2 && n2 <= this.endOf(e2);
          }, m2.isAfter = function(t2, e2) {
            return O(t2) < this.startOf(e2);
          }, m2.isBefore = function(t2, e2) {
            return this.endOf(e2) < O(t2);
          }, m2.$g = function(t2, e2, n2) {
            return b.u(t2) ? this[e2] : this.set(n2, t2);
          }, m2.unix = function() {
            return Math.floor(this.valueOf() / 1e3);
          }, m2.valueOf = function() {
            return this.$d.getTime();
          }, m2.startOf = function(t2, e2) {
            var n2 = this, r2 = !!b.u(e2) || e2, f2 = b.p(t2), l2 = function(t3, e3) {
              var i2 = b.w(n2.$u ? Date.UTC(n2.$y, e3, t3) : new Date(n2.$y, e3, t3), n2);
              return r2 ? i2 : i2.endOf(a);
            }, $2 = function(t3, e3) {
              return b.w(n2.toDate()[t3].apply(n2.toDate("s"), (r2 ? [0, 0, 0, 0] : [23, 59, 59, 999]).slice(e3)), n2);
            }, y2 = this.$W, M3 = this.$M, m3 = this.$D, v2 = "set" + (this.$u ? "UTC" : "");
            switch (f2) {
              case h:
                return r2 ? l2(1, 0) : l2(31, 11);
              case c:
                return r2 ? l2(1, M3) : l2(0, M3 + 1);
              case o:
                var g2 = this.$locale().weekStart || 0, D2 = (y2 < g2 ? y2 + 7 : y2) - g2;
                return l2(r2 ? m3 - D2 : m3 + (6 - D2), M3);
              case a:
              case d:
                return $2(v2 + "Hours", 0);
              case u:
                return $2(v2 + "Minutes", 1);
              case s:
                return $2(v2 + "Seconds", 2);
              case i:
                return $2(v2 + "Milliseconds", 3);
              default:
                return this.clone();
            }
          }, m2.endOf = function(t2) {
            return this.startOf(t2, false);
          }, m2.$set = function(t2, e2) {
            var n2, o2 = b.p(t2), f2 = "set" + (this.$u ? "UTC" : ""), l2 = (n2 = {}, n2[a] = f2 + "Date", n2[d] = f2 + "Date", n2[c] = f2 + "Month", n2[h] = f2 + "FullYear", n2[u] = f2 + "Hours", n2[s] = f2 + "Minutes", n2[i] = f2 + "Seconds", n2[r] = f2 + "Milliseconds", n2)[o2], $2 = o2 === a ? this.$D + (e2 - this.$W) : e2;
            if (o2 === c || o2 === h) {
              var y2 = this.clone().set(d, 1);
              y2.$d[l2]($2), y2.init(), this.$d = y2.set(d, Math.min(this.$D, y2.daysInMonth())).$d;
            } else l2 && this.$d[l2]($2);
            return this.init(), this;
          }, m2.set = function(t2, e2) {
            return this.clone().$set(t2, e2);
          }, m2.get = function(t2) {
            return this[b.p(t2)]();
          }, m2.add = function(r2, f2) {
            var d2, l2 = this;
            r2 = Number(r2);
            var $2 = b.p(f2), y2 = function(t2) {
              var e2 = O(l2);
              return b.w(e2.date(e2.date() + Math.round(t2 * r2)), l2);
            };
            if ($2 === c) return this.set(c, this.$M + r2);
            if ($2 === h) return this.set(h, this.$y + r2);
            if ($2 === a) return y2(1);
            if ($2 === o) return y2(7);
            var M3 = (d2 = {}, d2[s] = e, d2[u] = n, d2[i] = t, d2)[$2] || 1, m3 = this.$d.getTime() + r2 * M3;
            return b.w(m3, this);
          }, m2.subtract = function(t2, e2) {
            return this.add(-1 * t2, e2);
          }, m2.format = function(t2) {
            var e2 = this, n2 = this.$locale();
            if (!this.isValid()) return n2.invalidDate || l;
            var r2 = t2 || "YYYY-MM-DDTHH:mm:ssZ", i2 = b.z(this), s2 = this.$H, u2 = this.$m, a2 = this.$M, o2 = n2.weekdays, c2 = n2.months, f2 = n2.meridiem, h2 = function(t3, n3, i3, s3) {
              return t3 && (t3[n3] || t3(e2, r2)) || i3[n3].slice(0, s3);
            }, d2 = function(t3) {
              return b.s(s2 % 12 || 12, t3, "0");
            }, $2 = f2 || function(t3, e3, n3) {
              var r3 = t3 < 12 ? "AM" : "PM";
              return n3 ? r3.toLowerCase() : r3;
            };
            return r2.replace(y, (function(t3, r3) {
              return r3 || (function(t4) {
                switch (t4) {
                  case "YY":
                    return String(e2.$y).slice(-2);
                  case "YYYY":
                    return b.s(e2.$y, 4, "0");
                  case "M":
                    return a2 + 1;
                  case "MM":
                    return b.s(a2 + 1, 2, "0");
                  case "MMM":
                    return h2(n2.monthsShort, a2, c2, 3);
                  case "MMMM":
                    return h2(c2, a2);
                  case "D":
                    return e2.$D;
                  case "DD":
                    return b.s(e2.$D, 2, "0");
                  case "d":
                    return String(e2.$W);
                  case "dd":
                    return h2(n2.weekdaysMin, e2.$W, o2, 2);
                  case "ddd":
                    return h2(n2.weekdaysShort, e2.$W, o2, 3);
                  case "dddd":
                    return o2[e2.$W];
                  case "H":
                    return String(s2);
                  case "HH":
                    return b.s(s2, 2, "0");
                  case "h":
                    return d2(1);
                  case "hh":
                    return d2(2);
                  case "a":
                    return $2(s2, u2, true);
                  case "A":
                    return $2(s2, u2, false);
                  case "m":
                    return String(u2);
                  case "mm":
                    return b.s(u2, 2, "0");
                  case "s":
                    return String(e2.$s);
                  case "ss":
                    return b.s(e2.$s, 2, "0");
                  case "SSS":
                    return b.s(e2.$ms, 3, "0");
                  case "Z":
                    return i2;
                }
                return null;
              })(t3) || i2.replace(":", "");
            }));
          }, m2.utcOffset = function() {
            return 15 * -Math.round(this.$d.getTimezoneOffset() / 15);
          }, m2.diff = function(r2, d2, l2) {
            var $2, y2 = this, M3 = b.p(d2), m3 = O(r2), v2 = (m3.utcOffset() - this.utcOffset()) * e, g2 = this - m3, D2 = function() {
              return b.m(y2, m3);
            };
            switch (M3) {
              case h:
                $2 = D2() / 12;
                break;
              case c:
                $2 = D2();
                break;
              case f:
                $2 = D2() / 3;
                break;
              case o:
                $2 = (g2 - v2) / 6048e5;
                break;
              case a:
                $2 = (g2 - v2) / 864e5;
                break;
              case u:
                $2 = g2 / n;
                break;
              case s:
                $2 = g2 / e;
                break;
              case i:
                $2 = g2 / t;
                break;
              default:
                $2 = g2;
            }
            return l2 ? $2 : b.a($2);
          }, m2.daysInMonth = function() {
            return this.endOf(c).$D;
          }, m2.$locale = function() {
            return D[this.$L];
          }, m2.locale = function(t2, e2) {
            if (!t2) return this.$L;
            var n2 = this.clone(), r2 = w(t2, e2, true);
            return r2 && (n2.$L = r2), n2;
          }, m2.clone = function() {
            return b.w(this.$d, this);
          }, m2.toDate = function() {
            return new Date(this.valueOf());
          }, m2.toJSON = function() {
            return this.isValid() ? this.toISOString() : null;
          }, m2.toISOString = function() {
            return this.$d.toISOString();
          }, m2.toString = function() {
            return this.$d.toUTCString();
          }, M2;
        })(), k = _.prototype;
        return O.prototype = k, [["$ms", r], ["$s", i], ["$m", s], ["$H", u], ["$W", a], ["$M", c], ["$y", h], ["$D", d]].forEach((function(t2) {
          k[t2[1]] = function(e2) {
            return this.$g(e2, t2[0], t2[1]);
          };
        })), O.extend = function(t2, e2) {
          return t2.$i || (t2(e2, _, O), t2.$i = true), O;
        }, O.locale = w, O.isDayjs = S, O.unix = function(t2) {
          return O(1e3 * t2);
        }, O.en = D[g], O.Ls = D, O.p = {}, O;
      }));
    }
  });

  // ../ej-render-test/js/standalone.ts
  var standalone_exports = {};
  __export(standalone_exports, {
    createEjournalAssembler: () => createEjournalAssembler,
    generateCashInText: () => generateCashInText,
    generateCashOutText: () => generateCashOutText,
    generateDailySettlementReceiptText: () => generateDailySettlementReceiptText,
    generateOrderReceiptTexts: () => generateOrderReceiptTexts,
    generatePickupCashText: () => generatePickupCashText,
    generateShiftReceiptText: () => generateShiftReceiptText,
    stripPrinterMarkers: () => stripPrinterMarkers
  });

  // src/services/printer/templates/types.ts
  var DEFAULT_PRINTER_CONFIG = {
    width: 80,
    charPerLine: 48,
    storeName: "",
    companyName: "",
    address: "",
    phone: "",
    tinNumber: "",
    taxType: "",
    snCode: "",
    minNo: "",
    ptuNo: "",
    issueDate: "",
    terminalNo: ""
  };

  // src/services/printer/templates/base.ts
  var import_dayjs = __toESM(require_dayjs_min());
  var ESC_POS = {
    // 对齐命令 - 使用库支持的 [L], [C], [R] 标记 (必须和内容在同一行)
    ALIGN_LEFT: "[L]",
    // 左对齐
    ALIGN_CENTER: "[C]",
    // 居中对齐
    ALIGN_RIGHT: "[R]",
    // 右对齐
    // 字体大小 - 使用 <font size='xxx'> 标签 (react-native-thermal-printer 库支持)
    FONT_NORMAL: "</font>",
    // 关闭字体标签
    FONT_DOUBLE_WIDTH: "<font size='wide'>",
    // 双倍宽度
    FONT_DOUBLE_HEIGHT: "<font size='tall'>",
    // 双倍高度
    FONT_DOUBLE_BOTH: "<font size='big'>",
    // 双倍宽高 (大字体)
    // 切纸和走纸
    CUT_PAPER: "",
    // 切纸（通过 autoCut 选项控制）
    FEED_LINE: " \n",
    // 换行（空格确保 DantSu 库识别为非空行，触发 newLine）
    FEED_3_LINES: " \n \n \n",
    // 进纸3行
    FEED_6_LINES: " \n \n \n \n \n \n",
    // 进纸6行
    FEED_10_LINES: " \n \n \n \n \n \n \n \n \n \n",
    // 进纸10行（切纸前，增加底部留白）
    // 条形码 - 使用 <barcode> 标签 (DantSu ESCPOS-ThermalPrinter-Android)
    // type 可选: EAN8, EAN13, UPCA, UPCE, 128, 39（默认 EAN13，纯数字需 12 位）
    // 必须指定 type='128'，否则默认 EAN13 对纯数字校验失败
    BARCODE: (code) => `<barcode type='128' height='10'>${code}</barcode>`
  };
  function bold(text) {
    return `<b>${text}</b>`;
  }
  function bigText(text) {
    return `<font size='big'>${text}</font>`;
  }
  function centerText(text, width) {
    const textLength = getTextLength(text);
    const padding = Math.round((width - textLength) / 2);
    return " ".repeat(Math.max(0, padding)) + text;
  }
  function bigDisplayWidth(text) {
    let total = 0;
    for (const char of text) {
      if (/[一-龥　-〿＀-￯]/.test(char)) {
        total += 4;
      } else {
        total += 2;
      }
    }
    return total;
  }
  function wrapBigByWords(text, width) {
    const words = text.split(/\s+/).filter(Boolean);
    if (words.length === 0) {
      return [""];
    }
    const lines = [];
    let current = "";
    let currentWidth = 0;
    const flushCurrent = () => {
      if (current) {
        lines.push(current);
      }
      current = "";
      currentWidth = 0;
    };
    for (const word of words) {
      const wordWidth = bigDisplayWidth(word);
      if (wordWidth > width) {
        flushCurrent();
        let part = "";
        let partWidth = 0;
        for (const char of word) {
          const charWidth = /[一-龥　-〿＀-￯]/.test(char) ? 4 : 2;
          if (part && partWidth + charWidth > width) {
            lines.push(part);
            part = char;
            partWidth = charWidth;
          } else {
            part += char;
            partWidth += charWidth;
          }
        }
        if (part) {
          current = part;
          currentWidth = partWidth;
        }
        continue;
      }
      const separatorWidth = current ? 2 : 0;
      if (current && currentWidth + separatorWidth + wordWidth > width) {
        flushCurrent();
        current = word;
        currentWidth = wordWidth;
      } else {
        current = current ? `${current} ${word}` : word;
        currentWidth += separatorWidth + wordWidth;
      }
    }
    flushCurrent();
    return lines;
  }
  function centerBigTitle(text, width) {
    if (!text) {
      return `${ESC_POS.ALIGN_CENTER}${bigText("")}`;
    }
    return wrapBigByWords(text, width).map((chunk) => {
      const displayWidth = bigDisplayWidth(chunk);
      const padding = Math.round((width - displayWidth) / 2);
      return `${ESC_POS.ALIGN_LEFT}${" ".repeat(
        Math.max(0, padding)
      )}${bigText(bold(chunk))}`;
    }).join("\n");
  }
  function repeatChar(char, count) {
    return char.repeat(Math.max(0, count));
  }
  function leftRightText(left, right, width) {
    const leftLength = getTextLength(left);
    const rightLength = getTextLength(right);
    const padding = width - leftLength - rightLength;
    return left + " ".repeat(Math.max(1, padding)) + right;
  }
  function stripHtmlTags(text) {
    return text.replace(/\[L\]|\[C\]|\[R\]/g, "").replace(/<b>|<\/b>/g, "").replace(/<font[^>]*>|<\/font>/g, "").replace(/<u>|<\/u>/g, "").replace(/<i>|<\/i>/g, "");
  }
  function getTextLength(text) {
    const plainText = stripHtmlTags(text);
    let length = 0;
    for (const char of plainText) {
      if (/[\u4e00-\u9fa5\u3000-\u303f\uff00-\uffef]/.test(char)) {
        length += 2;
      } else {
        length += 1;
      }
    }
    return length;
  }
  function wrapText(text, maxWidth) {
    const result = [];
    let currentLine = "";
    let currentWidth = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charAt(i);
      const charWidth = /[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/.test(char) ? 2 : 1;
      if (currentWidth + charWidth <= maxWidth) {
        currentLine += char;
        currentWidth += charWidth;
      } else {
        if (currentLine) {
          result.push(currentLine);
        }
        currentLine = char;
        currentWidth = charWidth;
      }
    }
    if (currentLine) {
      result.push(currentLine);
    }
    return result.length > 0 ? result : [];
  }
  function formatAmountWithComma(amount) {
    if (amount === void 0 || amount === null) {
      return "0.00";
    }
    return amount.toLocaleString("en-PH", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
  function formatTinLabel(taxType, tinNumber) {
    if (!tinNumber) return "";
    const prefix = taxType && parseFloat(taxType) !== 0 ? "VAT-REG TIN:" : "NON-VAT TIN:";
    return `${prefix} ${tinNumber}`;
  }
  function generateFullHeader(config, options) {
    const width = config.charPerLine || 48;
    const lines = [];
    if (config.storeName) {
      lines.push(centerText(config.storeName.toUpperCase(), width));
    }
    if (config.companyName) {
      lines.push(centerText(config.companyName.toUpperCase(), width));
    }
    if (config.address) {
      const addressLines = wrapText(config.address, width);
      addressLines.forEach((line) => {
        lines.push(centerText(line, width));
      });
    }
    if (config.tinNumber) {
      lines.push(
        centerText(formatTinLabel(config.taxType, config.tinNumber), width)
      );
    }
    if (config.snCode) {
      lines.push(centerText(`SN:${config.snCode}`, width));
    }
    if (config.minNo) {
      lines.push(centerText(`MIN: ${config.minNo}`, width));
    }
    if (config.ptuNo && !options?.skipPTU) {
      lines.push(centerText(`PTU:${config.ptuNo}`, width));
    }
    return lines.join("\n");
  }
  function formatPhilippinesDateTime(date) {
    if (!date) {
      return "";
    }
    return (0, import_dayjs.default)(date).format("YYYY-MM-DD HH:mm:ss");
  }
  var LABELS = {
    // 订单信息
    TABLE_NAME: "Table#:",
    BILLING_NO: "Billing#:",
    TRX_TYPE: "Trx Type:",
    PAX: "Pax:",
    CASHIER: "Cashier:",
    TERMINAL_NO: "TERMINAL#:",
    EXACT_DATE: "Exact Date:",
    OPERATOR: "Operator",
    DATE_TIME: "Date&Time",
    // 金额相关
    GROSS_SALES: "Gross Sales",
    GOVERNMENT_DISCOUNT: "Government Discount",
    REGULAR_DISCOUNT: "Regular Discount",
    LESS_VAT: "LESS 12% VAT",
    DISCOUNT: "Discount",
    ADD_VAT: "Add 12% VAT",
    SERVICE_CHARGE: "Service Charge",
    // 兼容：不带比例的默认值
    AMOUNT_DUE: "Amount Due",
    CHANGE: "CHANGE",
    // 支付方式
    CASH: "CASH",
    CREDIT_CARD: "CREDIT CARD",
    GCASH: "GCASH",
    MAYA: "PAYMAYA",
    DEBIT_CARD: "DEBIT CARD",
    GIFT_CHECK: "GIFT CHECK",
    // 统计
    NUMBER_OF_ITEMS: "Number of Items",
    TOTAL_QTY: "Total Qty",
    // 税费
    VATABLE_SALES: "VATable Sales",
    VAT_AMOUNT: "VAT Amount",
    VAT_EXEMPT_SALES: "VAT Exempt Sales",
    ZERO_RATED_SALES: "Zero Rated Sales",
    // 客户信息
    CUSTOMER_NAME: "Customer Name",
    ADDRESS: "Address",
    TIN: "TIN",
    // SC 标签
    SC_ID: "SC ID#",
    SC_NAME: "SC NAME",
    SC_ADDRESS: "SC ADDRESS",
    SC_TIN: "SC TIN",
    // PWD 标签
    PWD_ID: "PWD ID#",
    PWD_NAME: "PWD NAME",
    PWD_ADDRESS: "PWD ADDRESS",
    PWD_TIN: "PWD TIN",
    // NAAC 标签
    NAAC_ID: "NAAC ID#",
    NAAC_NAME: "NAAC NAME",
    NAAC_ADDRESS: "NAAC ADDRESS",
    NAAC_TIN: "NAAC TIN",
    // MOV 标签
    MOV_ID: "MOV ID#",
    MOV_NAME: "MOV NAME",
    MOV_ADDRESS: "MOV ADDRESS",
    MOV_TIN: "MOV TIN",
    // DIPLOMATIC 标签
    DIPLOMATIC_ID: "DIPLOMATIC ID#",
    DIPLOMATIC_NAME: "DIPLOMATIC NAME",
    DIPLOMATIC_ADDRESS: "DIPLOMATIC ADDRESS",
    DIPLOMATIC_TIN: "DIPLOMATIC TIN",
    // SP 标签
    SP_ID: "SP ID#",
    SP_NAME: "SP NAME",
    SP_ADDRESS: "SP ADDRESS",
    SP_TIN: "SP TIN",
    // 其他
    REMARKS: "Remarks",
    NOTE: "Note",
    DATE_OF_ISSUE: "DATE ISSUE",
    PTU_NO: "PTU No.",
    // 商品
    DESCRIPTION: "Description",
    QTY: "Qty",
    UNIT_PRICE: "U.Price",
    AMOUNT: "Amount",
    // 规格选项
    SPECS: "Specs",
    FLAVOR: "Flavor",
    ADD_ONS: "Add-ons",
    SPICY: "Spicy",
    // 小票类型
    SALES_INVOICE: "SALES INVOICE",
    ORDER_SLIP: "Order Slip",
    VOID: "VOID",
    RETURN: "RETURN",
    REPRINT: "REPRINT",
    // 报表
    REPORT_DATE_TIME: "Report Date & Time",
    START_DATE_TIME: "Start Date & Time",
    END_DATE_TIME: "End Date & Time",
    BEG_SI_NO: "Beg. SI #",
    END_SI_NO: "End. SI #",
    BEG_VOID_NO: "Beg. VOID #",
    END_VOID_NO: "End. VOID #",
    BEG_RETURN_NO: "Beg. RETURN #",
    END_RETURN_NO: "End. RETURN #",
    // Z-Reading
    PRESENT_ACCUMULATED_SALES: "Present Accumulated Sales",
    PREVIOUS_ACCUMULATED_SALES: "Previous Accumulated Sales:",
    SALES_FOR_THE_DAY: "Sales for the Day:",
    BREAKDOWN_OF_SALES: "BREAKDOWN OF SALES",
    GROSS_TO_NET: "Gross to Net",
    GROSS_AMOUNT: "Gross Amount",
    LESS_DISCOUNT: "Less Discount",
    LESS_RETURN: "Less Return",
    LESS_VOID: "Less Void",
    LESS_VAT_ADJUSTMENT: "Less VAT Adjustment",
    NET_AMOUNT: "Net Amount",
    DISCOUNT_SUMMARY: "DISCOUNT SUMMARY",
    SALES_ADJUSTMENT: "SALES ADJUSTMENT",
    VAT_ADJUSTMENT: "VAT ADJUSTMENT"
  };
  function getServiceChargeLabel(rate) {
    if (rate != null && rate > 0) {
      return `Service Charge(${rate}%)`;
    }
    return LABELS.SERVICE_CHARGE;
  }
  function generateRegularCustomerInfo(data, width) {
    const lines = [];
    lines.push(
      leftRightText(LABELS.CUSTOMER_NAME + ":", data.customerName || "", width)
    );
    lines.push(
      leftRightText(LABELS.ADDRESS + ":", data.customerAddress || "", width)
    );
    lines.push(leftRightText(LABELS.TIN + ":", data.customerTin || "", width));
    return lines.join("\n");
  }
  function getDiscountLabels(type) {
    switch (type) {
      case "PWD":
        return {
          idLabel: LABELS.PWD_ID,
          nameLabel: LABELS.PWD_NAME,
          addressLabel: LABELS.PWD_ADDRESS,
          tinLabel: LABELS.PWD_TIN
        };
      case "NAAC":
        return {
          idLabel: LABELS.NAAC_ID,
          nameLabel: LABELS.NAAC_NAME,
          addressLabel: LABELS.NAAC_ADDRESS,
          tinLabel: LABELS.NAAC_TIN
        };
      case "MOV":
        return {
          idLabel: LABELS.MOV_ID,
          nameLabel: LABELS.MOV_NAME,
          addressLabel: LABELS.MOV_ADDRESS,
          tinLabel: LABELS.MOV_TIN
        };
      case "DIPLOMATIC":
        return {
          idLabel: LABELS.DIPLOMATIC_ID,
          nameLabel: LABELS.DIPLOMATIC_NAME,
          addressLabel: LABELS.DIPLOMATIC_ADDRESS,
          tinLabel: LABELS.DIPLOMATIC_TIN
        };
      case "SP":
        return {
          idLabel: LABELS.SP_ID,
          nameLabel: LABELS.SP_NAME,
          addressLabel: LABELS.SP_ADDRESS,
          tinLabel: LABELS.SP_TIN
        };
      case "SC":
        return {
          idLabel: LABELS.SC_ID,
          nameLabel: LABELS.SC_NAME,
          addressLabel: LABELS.SC_ADDRESS,
          tinLabel: LABELS.SC_TIN
        };
      default:
        return {
          idLabel: "",
          nameLabel: "",
          addressLabel: "",
          tinLabel: ""
        };
    }
  }
  function generateDiscountPersonInfo(person, width) {
    const lines = [];
    const labels = getDiscountLabels(person.type);
    lines.push(leftRightText(`${labels.nameLabel}:`, person.name || "", width));
    lines.push(
      leftRightText(`${labels.addressLabel}:`, person.address || "", width)
    );
    if (person.type !== "DIPLOMATIC") {
      lines.push(leftRightText(`${labels.tinLabel}:`, person.tin || "", width));
    }
    lines.push(leftRightText(`${labels.idLabel}:`, person.idNumber || "", width));
    return lines.join("\n");
  }

  // src/services/printer/templates/salesInvoice.ts
  function getPaymentLabel(method) {
    const m = method.toUpperCase();
    if (m === "MEMBER_BALANCE") return "MEMBER BALANCE";
    if (m === "CREDIT_CARD" || m === "CREDITCARD") return "CREDIT CARD";
    if (m === "DEBIT_CARD" || m === "DEBITCARD") return "DEBIT CARD";
    if (m === "GIFT_CHECK" || m === "GIFTCHECK") return "GIFT CHECK";
    return m;
  }
  var salesInvoiceTemplate = {
    type: "SALE_INVOICE" /* SALE_INVOICE */,
    name: "\u9500\u552E\u5C0F\u7968",
    generate(data, config) {
      const w = config.charPerLine;
      const lines = [];
      lines.push("");
      if (config.storeLogoPath) {
        lines.push(`[C]<img>${config.storeLogoPath}</img>`);
      }
      lines.push(centerBigTitle((config.storeName || "").toUpperCase(), w));
      const addressLines = wrapText(config.address || "", w);
      if (addressLines.length > 0) {
        addressLines.forEach((line) => {
          lines.push(centerText(line, w));
        });
      }
      lines.push(centerText(formatTinLabel(config.taxType, config.tinNumber), w));
      lines.push(centerText(`SN:${config.snCode || ""}`, w));
      lines.push(centerText(`MIN: ${config.minNo || ""}`, w));
      lines.push(
        `${ESC_POS.ALIGN_CENTER}${formatPhilippinesDateTime(data.dateTime)}`
      );
      lines.push(`${ESC_POS.ALIGN_CENTER}${repeatChar("-", w)}`);
      if (data.industryType !== "RETAIL" /* RETAIL */) {
        if (data.tableName) {
          lines.push(
            `${ESC_POS.ALIGN_LEFT}${LABELS.TABLE_NAME} ${data.tableName}`
          );
        }
        lines.push(
          `${ESC_POS.ALIGN_LEFT}${LABELS.BILLING_NO} ${data.billingNo || ""}`
        );
      }
      lines.push(`${ESC_POS.ALIGN_LEFT}${LABELS.TRX_TYPE} ${data.trxType || ""}`);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${LABELS.PAX} ${(data.pax || "").toString()}`
      );
      lines.push(`${ESC_POS.ALIGN_LEFT}${LABELS.CASHIER} ${data.cashier || ""}`);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${LABELS.TERMINAL_NO} ${data.terminalNo || ""}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${LABELS.EXACT_DATE} ${formatPhilippinesDateTime(data.orderTime || data.dateTime) || ""}`
      );
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      const title = "SALES INVOICE";
      const titleWidth = title.length * 2;
      const padding = Math.round((w - titleWidth) / 2);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${" ".repeat(Math.max(0, padding))}${bigText(
          bold(title)
        )}`
      );
      const siText = `SI ${data.siNumber || ""}`;
      lines.push(`${ESC_POS.ALIGN_LEFT}${centerText(siText, w)}`);
      if (data.isReprint) {
        lines.push(centerBigTitle(LABELS.REPRINT, w));
      }
      if (data.copyType) {
        lines.push(centerBigTitle(data.copyType, w));
      }
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      lines.push(`${ESC_POS.ALIGN_LEFT}${bold(formatProductHeader(w))}`);
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      const hasGovDiscount = (data.discountRateGroups?.length ?? 0) > 0 || (data.governmentDiscountPersons?.length ?? 0) > 0;
      (data.items || []).forEach((item) => {
        const priceWidth = 12;
        const amtWidth = 14;
        const amtStart = w;
        const priceStart = amtStart - amtWidth - 1;
        const qtyStart = priceStart - priceWidth - 1;
        {
          const cnName = item.displayName || item.name || "";
          let nameLine = cnName;
          if (data.bilingual && item.nameEn) {
            const specStr = item.specs?.filter(Boolean).join(", ");
            const enSpec = specStr ? `[${specStr}]` : "";
            nameLine = `${cnName}(${item.nameEn}${enSpec})`;
          }
          lines.push(`${ESC_POS.ALIGN_LEFT}${nameLine}`);
        }
        const taxMark = item.taxType || "V";
        const amountStr = `${formatAmountWithComma(item.amount || 0)} ${taxMark}`;
        const qtyText = (item.quantity || 0).toString();
        const priceText = formatAmountWithComma(item.unitPrice || 0);
        const qtyPrintWidth = getTextLength(qtyText);
        const pricePrintWidth = getTextLength(priceText);
        const amtPrintWidth = getTextLength(amountStr);
        let row2 = "";
        const qtyPadding = Math.max(0, qtyStart - qtyPrintWidth);
        const pricePadding = Math.max(0, priceStart - qtyStart - pricePrintWidth);
        const amtPadding = Math.max(0, amtStart - priceStart - amtPrintWidth);
        row2 = " ".repeat(qtyPadding) + qtyText + " ".repeat(pricePadding) + priceText + " ".repeat(amtPadding) + amountStr;
        lines.push(`${ESC_POS.ALIGN_LEFT}${row2}`);
        if (item.flavors && item.flavors.length > 0) {
          item.flavors.forEach(
            (flavor) => {
              if (flavor && flavor.optionName) {
                lines.push(`${ESC_POS.ALIGN_LEFT}    - ${flavor.optionName}`);
              }
            }
          );
        }
        if (item.notes) {
          lines.push(`${ESC_POS.ALIGN_LEFT}  Memo: ${item.notes}`);
        }
        const bAccountAdjusted = item.rowTotal != null && item.originalSubtotal != null && item.rowTotal !== item.originalSubtotal;
        if (!hasGovDiscount && !bAccountAdjusted && item.originalPrice != null && item.originalPrice > item.unitPrice) {
          const discountAmount = (item.originalPrice - item.unitPrice) * item.quantity;
          lines.push(
            `${ESC_POS.ALIGN_LEFT}  Memo:Discount : ${formatAmountWithComma(discountAmount)}`
          );
        }
      });
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          LABELS.GROSS_SALES,
          formatAmountWithComma(data.grossSales || 0),
          w
        )}`
      );
      if (data.discountRateGroups && data.discountRateGroups.length > 0) {
        const isWholeOrderGov = data.discountMode === "WHOLE_ORDER_GOV";
        data.discountRateGroups.forEach((group) => {
          const lessVatValue = isWholeOrderGov ? group.originalLessVat || 0 : group.lessVat || 0;
          const addVatValue = isWholeOrderGov ? group.originalAddVat || 0 : group.addVat || 0;
          lines.push(
            `${ESC_POS.ALIGN_LEFT}${leftRightText(
              "LESS 12% VAT",
              formatAmountWithComma(Math.abs(lessVatValue)),
              w
            )}`
          );
          lines.push(
            `${ESC_POS.ALIGN_LEFT}${leftRightText(
              `Discount ${Math.round((group.rate || 0) * 100)}%`,
              formatAmountWithComma(Math.abs(group.discountAmount || 0)),
              w
            )}`
          );
          lines.push(
            `${ESC_POS.ALIGN_LEFT}${leftRightText(
              "Add 12% VAT",
              formatAmountWithComma(Math.abs(addVatValue)),
              w
            )}`
          );
        });
      }
      if (data.manualDiscount && data.manualDiscount !== 0) {
        lines.push(
          `${ESC_POS.ALIGN_LEFT}${leftRightText(
            LABELS.REGULAR_DISCOUNT,
            formatAmountWithComma(Math.abs(data.manualDiscount)),
            w
          )}`
        );
      }
      if (data.serviceCharge && data.serviceCharge !== 0) {
        lines.push(
          `${ESC_POS.ALIGN_LEFT}${leftRightText(
            getServiceChargeLabel(data.serviceChargeRate),
            formatAmountWithComma(data.serviceCharge),
            w
          )}`
        );
      }
      const amountDueText = leftRightText(
        LABELS.AMOUNT_DUE,
        formatAmountWithComma(data.amountDue || 0),
        Math.floor(w / 2)
      );
      lines.push(`${ESC_POS.ALIGN_LEFT}${bigText(bold(amountDueText))}`);
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      (data.payments || []).forEach((payment) => {
        lines.push(
          `${ESC_POS.ALIGN_LEFT}${leftRightText(
            getPaymentLabel(payment.method || ""),
            formatAmountWithComma(payment.amount || 0),
            w
          )}`
        );
      });
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${bold(
          leftRightText(
            LABELS.CHANGE,
            formatAmountWithComma(data.change || 0),
            w
          )
        )}`
      );
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          LABELS.NUMBER_OF_ITEMS,
          (data.numberOfItems || 0).toString(),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          LABELS.TOTAL_QTY,
          (data.totalQty || 0).toString(),
          w
        )}`
      );
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          LABELS.VATABLE_SALES,
          formatAmountWithComma(data.taxBreakdown.vatableSales || 0),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          LABELS.VAT_AMOUNT + " (12%)",
          formatAmountWithComma(data.taxBreakdown.vatAmount || 0),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          LABELS.VAT_EXEMPT_SALES,
          formatAmountWithComma(data.taxBreakdown.vatExemptSales || 0),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          LABELS.ZERO_RATED_SALES,
          formatAmountWithComma(data.taxBreakdown.zeroRatedSales || 0),
          w
        )}`
      );
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      if (data.governmentDiscountPersons && data.governmentDiscountPersons.length > 0) {
        data.governmentDiscountPersons.forEach((person, index) => {
          lines.push(
            generateDiscountPersonInfo(
              {
                type: person.type,
                idNumber: person.idNumber,
                name: person.name,
                address: person.address,
                tin: person.tin
              },
              w
            )
          );
          lines.push(`${ESC_POS.ALIGN_LEFT}${person.signatureLine}`);
          lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
        });
      } else {
        lines.push(
          generateRegularCustomerInfo(
            {
              customerName: data.customerName,
              customerAddress: data.customerAddress,
              customerTin: data.customerTin
            },
            w
          )
        );
        lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      }
      if (data.remarks) {
        lines.push(
          `${ESC_POS.ALIGN_LEFT}${leftRightText("Memo:", data.remarks || "", w)}`
        );
        lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      }
      lines.push(`${ESC_POS.ALIGN_CENTER}${config.issueDate}`);
      lines.push(`${ESC_POS.ALIGN_CENTER}${config.ptuNo}`);
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      const barcodeCode = (data.siNumber || "").replace(/^SI\s*/, "");
      if (barcodeCode) {
        lines.push(`${ESC_POS.ALIGN_CENTER}${ESC_POS.BARCODE(barcodeCode)}`);
      }
      lines.push(`${ESC_POS.ALIGN_CENTER}THIS SERVES AS YOUR SALES INVOICE`);
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      lines.push(`${ESC_POS.ALIGN_CENTER}${bigText(data.pickupNo || "")}`);
      lines.push(ESC_POS.FEED_10_LINES);
      return lines.join("\n");
    }
  };
  function formatProductHeader(width) {
    const priceWidth = 12;
    const amtWidth = 14;
    const amtStart = width;
    const priceStart = amtStart - amtWidth - 1;
    const qtyStart = priceStart - priceWidth - 1;
    const descLabel = LABELS.DESCRIPTION;
    const qtyLabel = LABELS.QTY;
    const priceLabel = LABELS.UNIT_PRICE;
    const amtLabel = LABELS.AMOUNT;
    const qtyPrintWidth = getTextLength(qtyLabel);
    const pricePrintWidth = getTextLength(priceLabel);
    const amtPrintWidth = getTextLength(amtLabel);
    const qtyPadding = Math.max(
      0,
      qtyStart - getTextLength(descLabel) - qtyPrintWidth
    );
    const pricePadding = Math.max(0, priceStart - qtyStart - pricePrintWidth);
    const amtPadding = Math.max(0, amtStart - priceStart - amtPrintWidth);
    return descLabel + " ".repeat(qtyPadding) + qtyLabel + " ".repeat(pricePadding) + priceLabel + " ".repeat(amtPadding) + amtLabel;
  }

  // src/services/printer/templates/returnReceipt.ts
  var returnReceiptTemplate = {
    type: "RETURN_TXN" /* RETURN_TXN */,
    name: "\u9000\u8D27\u5C0F\u7968",
    generate(data, config) {
      const w = config.charPerLine;
      const lines = [];
      lines.push("");
      if (config.storeLogoPath) {
        lines.push(`[C]<img>${config.storeLogoPath}</img>`);
      }
      lines.push(centerBigTitle((config.storeName || "").toUpperCase(), w));
      const addressLines = wrapText(config.address || "", w);
      if (addressLines.length > 0) {
        addressLines.forEach((line) => lines.push(centerText(line, w)));
      } else {
        lines.push(centerText("", w));
      }
      lines.push(centerText(formatTinLabel(config.taxType, config.tinNumber), w));
      lines.push(centerText(`SN:${config.snCode || ""}`, w));
      lines.push(centerText(`MIN: ${config.minNo || ""}`, w));
      lines.push(`${ESC_POS.ALIGN_CENTER}${repeatChar("-", w)}`);
      const title = "RETURN TRANSACTION";
      const titleWidth = title.length * 2;
      const padding = Math.round((w - titleWidth) / 2);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${" ".repeat(Math.max(0, padding))}${bigText(
          bold(title)
        )}`
      );
      if (data.isReprint) {
        lines.push(centerBigTitle("REPRINT", w));
      }
      const copyTypeText = data.copyType || "";
      const copyTypeWidth = getPrintWidth(copyTypeText) * 2;
      const copyTypePadding = Math.round((w - copyTypeWidth) / 2);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${" ".repeat(
          Math.max(0, copyTypePadding)
        )}${bigText(bold(copyTypeText))}`
      );
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "RETURN#",
          data.returnNo || "",
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "Date&Time",
          formatPhilippinesDateTime(data.dateTime),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "SI#",
          data.originalSiNo || "",
          w
        )}`
      );
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      if (data.tableName) {
        lines.push(`${ESC_POS.ALIGN_LEFT}${LABELS.TABLE_NAME} ${data.tableName}`);
        lines.push(
          `${ESC_POS.ALIGN_LEFT}${LABELS.BILLING_NO} ${data.billingNo || ""}`
        );
        lines.push(
          `${ESC_POS.ALIGN_LEFT}${LABELS.TRX_TYPE} ${data.trxType || ""}`
        );
        lines.push(
          `${ESC_POS.ALIGN_LEFT}${LABELS.PAX} ${(data.pax || "").toString()}`
        );
        lines.push(
          `${ESC_POS.ALIGN_LEFT}${LABELS.CASHIER} ${data.cashier || ""}`
        );
        lines.push(
          `${ESC_POS.ALIGN_LEFT}${LABELS.TERMINAL_NO} ${data.terminalNo || ""}`
        );
        lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      }
      lines.push(`${ESC_POS.ALIGN_LEFT}${bold(formatProductHeader2(w))}`);
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      data.items.forEach((item) => {
        const priceWidth = 12;
        const amtWidth = 14;
        const amtStart = w;
        const priceStart = amtStart - amtWidth - 1;
        const qtyStart = priceStart - priceWidth - 1;
        {
          const cnName = item.displayName || item.name || "";
          let nameLine = cnName;
          if (data.bilingual && item.nameEn) {
            const specStr = item.specs?.filter(Boolean).join(", ");
            const enSpec = specStr ? `[${specStr}]` : "";
            nameLine = `${cnName}(${item.nameEn}${enSpec})`;
          }
          lines.push(`${ESC_POS.ALIGN_LEFT}${nameLine}`);
        }
        const qty = item.quantity < 0 ? item.quantity : -item.quantity;
        const amount = item.amount || 0;
        const qtyText = qty.toString();
        const priceText = formatAmountWithComma(item.unitPrice);
        const amountStr = formatAmountWithComma(amount);
        const qtyPrintWidth = getTextLength(qtyText);
        const pricePrintWidth = getTextLength(priceText);
        const amtPrintWidth = getTextLength(amountStr);
        const qtyPadding = Math.max(0, qtyStart - qtyPrintWidth);
        const pricePadding = Math.max(0, priceStart - qtyStart - pricePrintWidth);
        const amtPadding = Math.max(0, amtStart - priceStart - amtPrintWidth);
        const row2 = " ".repeat(qtyPadding) + qtyText + " ".repeat(pricePadding) + priceText + " ".repeat(amtPadding) + amountStr;
        lines.push(`${ESC_POS.ALIGN_LEFT}${row2}`);
      });
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      if (data.serviceCharge && data.serviceCharge !== 0) {
        const scValue = data.serviceCharge < 0 ? formatAmountWithComma(data.serviceCharge) : `-${formatAmountWithComma(data.serviceCharge)}`;
        lines.push(
          `${ESC_POS.ALIGN_LEFT}${leftRightText(
            getServiceChargeLabel(data.serviceChargeRate),
            scValue,
            w
          )}`
        );
      }
      const grossSalesStr = data.grossSales !== void 0 ? data.grossSales < 0 ? formatAmountWithComma(data.grossSales) : `-${formatAmountWithComma(data.grossSales)}` : data.total < 0 ? formatAmountWithComma(data.total) : `-${formatAmountWithComma(data.total)}`;
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText("Gross Sales", grossSalesStr, w)}`
      );
      if (data.discountRateGroups && data.discountRateGroups.length > 0) {
        data.discountRateGroups?.forEach((group) => {
          const lessVatValue = Math.abs(group.lessVat || 0);
          const addVatValue = Math.abs(group.addVat || 0);
          lines.push(
            `${ESC_POS.ALIGN_LEFT}${leftRightText(
              LABELS.LESS_VAT,
              formatAmountWithComma(lessVatValue),
              w
            )}`
          );
          lines.push(
            `${ESC_POS.ALIGN_LEFT}${leftRightText(
              `${LABELS.DISCOUNT} ${Math.round(group.rate * 100)}%`,
              formatAmountWithComma(Math.abs(group.discountAmount || 0)),
              w
            )}`
          );
          lines.push(
            `${ESC_POS.ALIGN_LEFT}${leftRightText(
              LABELS.ADD_VAT,
              formatAmountWithComma(addVatValue),
              w
            )}`
          );
        });
      }
      const bigFontWidth = Math.floor(w / 2);
      const amountDueLabel = "Amount";
      const amountDueValue = data.total < 0 ? formatAmountWithComma(data.total) : `-${formatAmountWithComma(data.total)}`;
      const amountDueText = leftRightText(
        amountDueLabel,
        amountDueValue,
        bigFontWidth
      );
      if (data.manualDiscount) {
        lines.push(
          `${ESC_POS.ALIGN_LEFT}${leftRightText(
            "Regular Discount",
            formatAmountWithComma(Math.abs(data.manualDiscount)),
            w
          )}`
        );
      }
      lines.push(`${ESC_POS.ALIGN_LEFT}${bigText(bold(amountDueText))}`);
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      data.payments.forEach((payment) => {
        const paymentStr = payment.amount === 0 ? "0.00" : payment.amount < 0 ? formatAmountWithComma(payment.amount) : `-${formatAmountWithComma(payment.amount)}`;
        lines.push(
          `${ESC_POS.ALIGN_LEFT}${leftRightText(payment.method, paymentStr, w)}`
        );
      });
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      const formatTaxValue = (v) => {
        const abs = formatAmountWithComma(Math.abs(v));
        return abs === "0.00" ? "0.00" : `-${abs}`;
      };
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText("VATable Sales", formatTaxValue(data.taxBreakdown.vatableSales), w)}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText("VAT Amount (12%)", formatTaxValue(data.taxBreakdown.vatAmount), w)}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText("VAT Exempt Sales", formatTaxValue(data.taxBreakdown.vatExemptSales), w)}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "Zero Rated Sales",
          formatTaxValue(data.taxBreakdown.zeroRatedSales),
          w
        )}`
      );
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "Customer Name:",
          data.customerName || "",
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "Address:",
          data.customerAddress || "",
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "TIN:",
          data.customerTin || "",
          w
        )}`
      );
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      lines.push(`${ESC_POS.ALIGN_CENTER}DATE ISSUED: ${config.issueDate}`);
      lines.push(`${ESC_POS.ALIGN_CENTER}PTU: ${config.ptuNo}`);
      lines.push(ESC_POS.FEED_10_LINES);
      lines.push(ESC_POS.CUT_PAPER);
      return lines.join("\n");
    }
  };
  function getPrintWidth(str) {
    let width = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charAt(i);
      if (/[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/.test(char)) {
        width += 2;
      } else {
        width += 1;
      }
    }
    return width;
  }
  function formatProductHeader2(width) {
    const priceWidth = 12;
    const amtWidth = 14;
    const amtStart = width;
    const priceStart = amtStart - amtWidth - 1;
    const qtyStart = priceStart - priceWidth - 1;
    const descLabel = LABELS.DESCRIPTION;
    const qtyLabel = LABELS.QTY;
    const priceLabel = LABELS.UNIT_PRICE;
    const amtLabel = LABELS.AMOUNT;
    const qtyPrintWidth = getTextLength(qtyLabel);
    const pricePrintWidth = getTextLength(priceLabel);
    const amtPrintWidth = getTextLength(amtLabel);
    const qtyPadding = Math.max(
      0,
      qtyStart - getTextLength(descLabel) - qtyPrintWidth
    );
    const pricePadding = Math.max(0, priceStart - qtyStart - pricePrintWidth);
    const amtPadding = Math.max(0, amtStart - priceStart - amtPrintWidth);
    return descLabel + " ".repeat(qtyPadding) + qtyLabel + " ".repeat(pricePadding) + priceLabel + " ".repeat(amtPadding) + amtLabel;
  }

  // src/services/printer/templates/voidReceipt.ts
  var voidReceiptTemplate = {
    type: "VOID_TXN" /* VOID_TXN */,
    name: "\u4F5C\u5E9F\u5C0F\u7968",
    generate(data, config) {
      const w = config.charPerLine;
      const lines = [];
      lines.push("");
      if (config.storeLogoPath) {
        lines.push(`[C]<img>${config.storeLogoPath}</img>`);
      }
      lines.push(centerBigTitle((config.storeName || "").toUpperCase(), w));
      const addressLines = wrapText(config.address || "", w);
      if (addressLines.length > 0) {
        addressLines.forEach((line) => lines.push(centerText(line, w)));
      } else {
        lines.push(centerText("", w));
      }
      lines.push(centerText(formatTinLabel(config.taxType, config.tinNumber), w));
      lines.push(centerText(`SN:${config.snCode || ""}`, w));
      lines.push(centerText(`MIN: ${config.minNo || ""}`, w));
      lines.push(`${ESC_POS.ALIGN_CENTER}${repeatChar("-", w)}`);
      const title = "VOID TRANSACTION";
      const titleWidth = title.length * 2;
      const padding = Math.round((w - titleWidth) / 2);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${" ".repeat(Math.max(0, padding))}${bigText(
          bold(title)
        )}`
      );
      if (data.isReprint) {
        lines.push(centerBigTitle("REPRINT", w));
      }
      const copyTypeText = data.copyType || "";
      const copyTypeWidth = getPrintWidth2(copyTypeText) * 2;
      const copyTypePadding = Math.round((w - copyTypeWidth) / 2);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${" ".repeat(
          Math.max(0, copyTypePadding)
        )}${bigText(bold(copyTypeText))}`
      );
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText("VOID#", data.voidNo || "", w)}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "Date&Time",
          formatPhilippinesDateTime(data.dateTime),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "Sales SI#",
          data.originalSiNo || "",
          w
        )}`
      );
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      if (data.tableName) {
        lines.push(`${ESC_POS.ALIGN_LEFT}${LABELS.TABLE_NAME} ${data.tableName}`);
        lines.push(
          `${ESC_POS.ALIGN_LEFT}${LABELS.BILLING_NO} ${data.billingNo || ""}`
        );
        lines.push(
          `${ESC_POS.ALIGN_LEFT}${LABELS.TRX_TYPE} ${data.trxType || ""}`
        );
        lines.push(
          `${ESC_POS.ALIGN_LEFT}${LABELS.PAX} ${(data.pax || "").toString()}`
        );
        lines.push(
          `${ESC_POS.ALIGN_LEFT}${LABELS.CASHIER} ${data.cashier || ""}`
        );
        lines.push(
          `${ESC_POS.ALIGN_LEFT}${LABELS.TERMINAL_NO} ${data.terminalNo || ""}`
        );
        lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      }
      lines.push(`${ESC_POS.ALIGN_LEFT}${bold(formatProductHeader3(w))}`);
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      data.items.forEach((item) => {
        const priceWidth = 12;
        const amtWidth = 14;
        const amtStart = w;
        const priceStart = amtStart - amtWidth - 1;
        const qtyStart = priceStart - priceWidth - 1;
        {
          const cnName = item.displayName || item.name || "";
          let nameLine = cnName;
          if (data.bilingual && item.nameEn) {
            const specStr = item.specs?.filter(Boolean).join(", ");
            const enSpec = specStr ? `[${specStr}]` : "";
            nameLine = `${cnName}(${item.nameEn}${enSpec})`;
          }
          lines.push(`${ESC_POS.ALIGN_LEFT}${nameLine}`);
        }
        const qty = item.quantity < 0 ? item.quantity : -(item.quantity || 0);
        const unitPrice = item.unitPrice ?? 0;
        const amount = item.amount ?? 0;
        const qtyText = qty.toString();
        const priceText = formatAmountWithComma(unitPrice);
        const amountStr = formatAmountWithComma(amount);
        const qtyPrintWidth = getTextLength(qtyText);
        const pricePrintWidth = getTextLength(priceText);
        const amtPrintWidth = getTextLength(amountStr);
        const qtyPadding = Math.max(0, qtyStart - qtyPrintWidth);
        const pricePadding = Math.max(0, priceStart - qtyStart - pricePrintWidth);
        const amtPadding = Math.max(0, amtStart - priceStart - amtPrintWidth);
        const row2 = " ".repeat(qtyPadding) + qtyText + " ".repeat(pricePadding) + priceText + " ".repeat(amtPadding) + amountStr;
        lines.push(`${ESC_POS.ALIGN_LEFT}${row2}`);
      });
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      if (data.serviceCharge !== 0 && data.serviceCharge !== void 0) {
        lines.push(
          `${ESC_POS.ALIGN_LEFT}${leftRightText(
            LABELS.SERVICE_CHARGE,
            `-${formatAmountWithComma(Math.abs(data.serviceCharge))}`,
            w
          )}`
        );
      }
      const grossSales = data.grossSales || 0;
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "Gross Sales",
          `-${formatAmountWithComma(Math.abs(grossSales))}`,
          w
        )}`
      );
      if (data.manualDiscount !== void 0 && data.manualDiscount !== 0) {
        lines.push(
          `${ESC_POS.ALIGN_LEFT}${leftRightText(
            "Regular Discount",
            formatAmountWithComma(Math.abs(data.manualDiscount)),
            w
          )}`
        );
      }
      if (data.discountRateGroups && data.discountRateGroups.length > 0) {
        const isWholeOrderGov = data.discountMode === "WHOLE_ORDER_GOV";
        data.discountRateGroups.forEach((group) => {
          const lessVatValue = isWholeOrderGov ? Math.abs(group.originalLessVat || 0) : Math.abs(group.lessVat || 0);
          const addVatValue = isWholeOrderGov ? Math.abs(group.originalAddVat || 0) : Math.abs(group.addVat || 0);
          lines.push(
            `${ESC_POS.ALIGN_LEFT}${leftRightText(
              LABELS.LESS_VAT,
              formatAmountWithComma(lessVatValue),
              w
            )}`
          );
          lines.push(
            `${ESC_POS.ALIGN_LEFT}${leftRightText(
              `${LABELS.DISCOUNT} ${Math.round(group.rate * 100)}%`,
              formatAmountWithComma(Math.abs(group.discountAmount || 0)),
              w
            )}`
          );
          lines.push(
            `${ESC_POS.ALIGN_LEFT}${leftRightText(
              LABELS.ADD_VAT,
              formatAmountWithComma(addVatValue),
              w
            )}`
          );
        });
      }
      const bigFontWidth = Math.floor(w / 2);
      const amountDue = data.amountDue || 0;
      const amountDueStr = `-${formatAmountWithComma(Math.abs(amountDue))}`;
      const amountDueText = leftRightText("Amount", amountDueStr, bigFontWidth);
      lines.push(`${ESC_POS.ALIGN_LEFT}${bigText(bold(amountDueText))}`);
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      (data.payments || []).forEach((payment) => {
        const paymentAmount = payment.amount || 0;
        const paymentStr = paymentAmount === 0 ? "0.00" : paymentAmount < 0 ? formatAmountWithComma(paymentAmount) : `-${formatAmountWithComma(paymentAmount)}`;
        lines.push(
          `${ESC_POS.ALIGN_LEFT}${leftRightText(
            payment.method || "",
            paymentStr,
            w
          )}`
        );
      });
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      const taxBreakdown = data.taxBreakdown || {};
      const formatTaxValue = (v) => {
        const abs = formatAmountWithComma(Math.abs(v));
        return abs === "0.00" ? "0.00" : `-${abs}`;
      };
      const vatableSales = taxBreakdown.vatableSales || 0;
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText("VATable Sales", formatTaxValue(vatableSales), w)}`
      );
      const vatAmount = taxBreakdown.vatAmount || 0;
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText("VAT Amount (12%)", formatTaxValue(vatAmount), w)}`
      );
      const vatExemptSales = taxBreakdown.vatExemptSales || 0;
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText("VAT Exempt Sales", formatTaxValue(vatExemptSales), w)}`
      );
      const zeroRatedSales = taxBreakdown.zeroRatedSales || 0;
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "Zero Rated Sales",
          formatTaxValue(zeroRatedSales),
          w
        )}`
      );
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "Customer Name:",
          data.customerName || "",
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "Address:",
          data.customerAddress || "",
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "TIN:",
          data.customerTin || "",
          w
        )}`
      );
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      if (data.memo) {
        lines.push(`${ESC_POS.ALIGN_LEFT}Memo: ${data.memo}`);
        lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      }
      lines.push(`${ESC_POS.ALIGN_CENTER}DATE ISSUED: ${config.issueDate}`);
      lines.push(`${ESC_POS.ALIGN_CENTER}PTU: ${config.ptuNo}`);
      lines.push(ESC_POS.FEED_10_LINES);
      lines.push(ESC_POS.CUT_PAPER);
      return lines.join("\n");
    }
  };
  function getPrintWidth2(str) {
    let width = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charAt(i);
      if (/[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/.test(char)) {
        width += 2;
      } else {
        width += 1;
      }
    }
    return width;
  }
  function formatProductHeader3(width) {
    const priceWidth = 12;
    const amtWidth = 14;
    const amtStart = width;
    const priceStart = amtStart - amtWidth - 1;
    const qtyStart = priceStart - priceWidth - 1;
    const descLabel = LABELS.DESCRIPTION;
    const qtyLabel = LABELS.QTY;
    const priceLabel = LABELS.UNIT_PRICE;
    const amtLabel = LABELS.AMOUNT;
    const qtyPrintWidth = getTextLength(qtyLabel);
    const pricePrintWidth = getTextLength(priceLabel);
    const amtPrintWidth = getTextLength(amtLabel);
    const qtyPadding = Math.max(
      0,
      qtyStart - getTextLength(descLabel) - qtyPrintWidth
    );
    const pricePadding = Math.max(0, priceStart - qtyStart - pricePrintWidth);
    const amtPadding = Math.max(0, amtStart - priceStart - amtPrintWidth);
    return descLabel + " ".repeat(qtyPadding) + qtyLabel + " ".repeat(pricePadding) + priceLabel + " ".repeat(amtPadding) + amtLabel;
  }

  // src/services/printer/templates/billing.ts
  var billingTemplate = {
    type: "BILLING_PREVIEW" /* BILLING_PREVIEW */,
    name: "\u9884\u7ED3\u5355",
    generate(data, config) {
      const w = config.charPerLine;
      const lines = [];
      lines.push("");
      if (config.storeName) {
        lines.push(centerBigTitle(config.storeName.toUpperCase(), w));
      }
      if (config.address) {
        const addressLines = wrapText(config.address, w);
        addressLines.forEach((line) => {
          lines.push(`${ESC_POS.ALIGN_LEFT}${centerText(line, w)}`);
        });
      }
      if (config.tinNumber) {
        lines.push(`${ESC_POS.ALIGN_LEFT}${centerText(config.tinNumber, w)}`);
      }
      if (config.minNo) {
        lines.push(
          `${ESC_POS.ALIGN_LEFT}${centerText(`MIN: ${config.minNo}`, w)}`
        );
      }
      if (config.snCode) {
        lines.push(
          `${ESC_POS.ALIGN_LEFT}${centerText(`SN:${config.snCode}`, w)}`
        );
      }
      if (config.ptuNo) {
        lines.push(
          `${ESC_POS.ALIGN_LEFT}${centerText(`PTU:${config.ptuNo}`, w)}`
        );
      }
      const title = "BILLING";
      const titleWidth = title.split("").reduce((len, char) => len + (/[\u4e00-\u9fa5]/.test(char) ? 4 : 2), 0);
      const padding = Math.round((w - titleWidth) / 2);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${" ".repeat(Math.max(0, padding))}${bigText(
          bold(title)
        )}`
      );
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${centerText(
          bold("THIS IS NOT A SALES INVOICE"),
          w
        )}`
      );
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${centerText("This Document is not valid", w)}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${centerText(" for claim of input tax", w)}`
      );
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${centerText(
          formatPhilippinesDateTime(data.dateTime),
          w
        )}`
      );
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "TERMINAL NO",
          data.terminalNo,
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText("ORDER NO", data.orderNo, w)}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText("Billing No", data.billingNo, w)}`
      );
      if (data.pax !== void 0) {
        lines.push(
          `${ESC_POS.ALIGN_LEFT}${leftRightText("PAX", data.pax.toString(), w)}`
        );
      }
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "Table:",
          data.tableName || "",
          w
        )}`
      );
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      lines.push(`${ESC_POS.ALIGN_LEFT}${bold(formatProductHeader4(w))}`);
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      data.items.forEach((item) => {
        {
          const cnName = item.displayName || item.name;
          let nameLine = cnName;
          if (data.bilingual && item.nameEn) {
            const specStr = item.specs?.filter(Boolean).join(", ");
            const enSpec = specStr ? `[${specStr}]` : "";
            nameLine = `${cnName}(${item.nameEn}${enSpec})`;
          }
          lines.push(`${ESC_POS.ALIGN_LEFT}${nameLine}`);
        }
        const taxMark = item.taxType || "V";
        const amountWithTax = `${formatAmountWithComma(item.amount)} ${taxMark}`;
        lines.push(
          formatProductLine(
            item.quantity.toString(),
            formatAmountWithComma(item.unitPrice),
            amountWithTax,
            w
          )
        );
      });
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          LABELS.NUMBER_OF_ITEMS,
          data.numberOfItems.toString(),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          LABELS.TOTAL_QTY,
          data.totalQty.toString(),
          w
        )}`
      );
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          LABELS.GROSS_SALES,
          formatAmountWithComma(data.grossSales),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "Total Discount",
          formatAmountWithComma(data.totalDiscount || 0),
          w
        )}`
      );
      if (data.governmentDiscount && data.governmentDiscount > 0) {
        lines.push(
          `${ESC_POS.ALIGN_LEFT}${leftRightText(
            "  --" + LABELS.GOVERNMENT_DISCOUNT,
            formatAmountWithComma(data.governmentDiscount),
            w
          )}`
        );
      }
      if (data.regularDiscount && data.regularDiscount > 0) {
        lines.push(
          `${ESC_POS.ALIGN_LEFT}${leftRightText(
            "  --" + LABELS.REGULAR_DISCOUNT,
            formatAmountWithComma(data.regularDiscount),
            w
          )}`
        );
      }
      if (data.serviceCharge && data.serviceCharge > 0) {
        lines.push(
          `${ESC_POS.ALIGN_LEFT}${leftRightText(
            getServiceChargeLabel(data.serviceChargeRate),
            formatAmountWithComma(data.serviceCharge),
            w
          )}`
        );
      }
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${ESC_POS.FONT_DOUBLE_BOTH}${bold(
          leftRightText("Total Sale", formatAmountWithComma(data.totalAmount), w)
        )}${ESC_POS.FONT_NORMAL}`
      );
      if (data.remarks) {
        lines.push(`${ESC_POS.ALIGN_LEFT}${LABELS.REMARKS}: ${data.remarks}`);
      }
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      if (data.customMessage) {
        lines.push(`${ESC_POS.ALIGN_LEFT}${data.customMessage}`);
      }
      if (data.supplierMessage) {
        lines.push(`${ESC_POS.ALIGN_LEFT}${data.supplierMessage}`);
      }
      lines.push(ESC_POS.FEED_10_LINES);
      lines.push(ESC_POS.CUT_PAPER);
      return lines.join("\n");
    }
  };
  function formatProductHeader4(width) {
    const descWidth = Math.floor(width * 0.4);
    const qtyWidth = Math.floor(width * 0.1);
    const priceWidth = Math.floor(width * 0.25);
    const amtWidth = width - descWidth - qtyWidth - priceWidth;
    const desc = LABELS.DESCRIPTION.padEnd(descWidth);
    const qty = LABELS.QTY.padStart(qtyWidth);
    const price = LABELS.UNIT_PRICE.padStart(priceWidth);
    const amt = LABELS.AMOUNT.padStart(amtWidth);
    return desc + qty + price + amt;
  }
  function formatProductLine(qty, price, amount, width) {
    const descWidth = Math.floor(width * 0.4);
    const qtyWidth = Math.floor(width * 0.1);
    const priceWidth = Math.floor(width * 0.25);
    const amtWidth = width - descWidth - qtyWidth - priceWidth;
    const qtyText = qty.padStart(qtyWidth);
    const priceText = price.padStart(priceWidth);
    const amtText = amount.padStart(amtWidth);
    return " ".repeat(descWidth - 1) + qtyText + priceText + amtText;
  }

  // src/services/printer/templates/orderSlip.ts
  function getPrintWidth3(str) {
    let width = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charAt(i);
      if (/[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/.test(char)) {
        width += 2;
      } else {
        width += 1;
      }
    }
    return width;
  }
  function splitTextByPrintWidth(text, maxWidth) {
    const result = [];
    let currentLine = "";
    let currentWidth = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charAt(i);
      const charWidth = /[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/.test(char) ? 2 : 1;
      if (currentWidth + charWidth <= maxWidth) {
        currentLine += char;
        currentWidth += charWidth;
      } else {
        if (currentLine) {
          result.push(currentLine);
        }
        currentLine = char;
        currentWidth = charWidth;
      }
    }
    if (currentLine) {
      result.push(currentLine);
    }
    return result.length > 0 ? result : [""];
  }
  function formatThreeColumnHeader(width) {
    const qtyWidth = 4;
    const priceWidth = 11;
    const separator = "  ";
    const qtyPriceWidth = qtyWidth + separator.length + priceWidth;
    const productWidth = width - qtyPriceWidth - separator.length;
    return "Product".padEnd(productWidth) + separator + "Qty".padStart(qtyWidth) + separator + "Price".padStart(priceWidth);
  }
  function formatTwoColumnHeader(width) {
    const qtyWidth = 4;
    const separator = "  ";
    const productWidth = width - qtyWidth - separator.length;
    return "Product".padEnd(productWidth) + separator + "Qty".padStart(qtyWidth);
  }
  var orderSlipTemplate = {
    type: "ORDER_SLIP" /* ORDER_SLIP */,
    name: "\u70B9\u83DC\u5355",
    generate(data, config) {
      const w = config.charPerLine;
      const lines = [];
      lines.push("");
      const storeName = (data.storeName || config.storeName || "").trim();
      lines.push(centerBigTitle(storeName, w));
      if (data.isAdditional) {
        lines.push(centerBigTitle("ADDITIONAL", w));
      }
      lines.push(centerBigTitle("ORDER SLIP", w));
      if (data.isReprint) {
        lines.push(centerBigTitle("REPRINT", w));
      }
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      const tableName = data.tableName || "";
      const tableText = `Table#: ${tableName}`;
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${ESC_POS.FONT_DOUBLE_BOTH}${bold(tableText)}${ESC_POS.FONT_NORMAL}`
      );
      if (data.trxType) {
        lines.push(`${ESC_POS.ALIGN_LEFT}${data.trxType}`);
      }
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "Date&Time:",
          formatPhilippinesDateTime(data.dateTime),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText("Operator:", data.operator, w)}`
      );
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      const showPrice = data.showPrice !== false;
      const bilingual = data.bilingual === true;
      if (showPrice) {
        lines.push(`${ESC_POS.ALIGN_LEFT}${bold(formatThreeColumnHeader(w))}`);
      } else {
        lines.push(`${ESC_POS.ALIGN_LEFT}${bold(formatTwoColumnHeader(w))}`);
      }
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      data.items.forEach((item, index) => {
        const qty = Number(item.quantity) || 0;
        const displayName = item.displayName || item.name || "";
        {
          let nameLine = displayName;
          if (bilingual && item.nameEn) {
            const specStr = item.specs?.filter(Boolean).join(", ");
            const enSpec = specStr ? `[${specStr}]` : "";
            nameLine = `${displayName}(${item.nameEn}${enSpec})`;
          }
          const nameLines = splitTextByPrintWidth(nameLine, w);
          nameLines.forEach((line) => {
            lines.push(`${ESC_POS.ALIGN_LEFT}${ESC_POS.FONT_DOUBLE_HEIGHT}${line}${ESC_POS.FONT_NORMAL}`);
          });
        }
        if (showPrice) {
          const qtyStr = String(qty).padStart(4);
          const priceStr = ((item.unitPrice || 0) * qty).toFixed(2).padStart(11);
          const qtyPriceStr = qtyStr + "  " + priceStr;
          lines.push(
            `${ESC_POS.ALIGN_LEFT}${ESC_POS.FONT_DOUBLE_HEIGHT}${" ".repeat(
              Math.max(0, w - 17)
            )}${qtyPriceStr}${ESC_POS.FONT_NORMAL}`
          );
        } else {
          const qtyStr = String(qty).padStart(4);
          lines.push(
            `${ESC_POS.ALIGN_LEFT}${ESC_POS.FONT_DOUBLE_HEIGHT}${" ".repeat(Math.max(0, w - 6))}${qtyStr}${ESC_POS.FONT_NORMAL}`
          );
        }
        if (item.flavors && item.flavors.length > 0) {
          const flavorGroups = {};
          item.flavors.forEach(
            (flavor) => {
              if (flavor && flavor.optionName) {
                const group = flavor.groupName || "\u53E3\u5473";
                if (!flavorGroups[group]) {
                  flavorGroups[group] = [];
                }
                flavorGroups[group].push(flavor.optionName);
              }
            }
          );
          Object.entries(flavorGroups).forEach(([groupName, options]) => {
            lines.push(`${ESC_POS.ALIGN_LEFT}${ESC_POS.FONT_DOUBLE_HEIGHT}  ${groupName}\uFF1A${ESC_POS.FONT_NORMAL}`);
            options.forEach((option) => {
              lines.push(`${ESC_POS.ALIGN_LEFT}${ESC_POS.FONT_DOUBLE_HEIGHT}    - ${option}${ESC_POS.FONT_NORMAL}`);
            });
          });
        }
        if (item.notes) {
          lines.push(`${ESC_POS.ALIGN_LEFT}${ESC_POS.FONT_DOUBLE_HEIGHT}  Memo:${item.notes}${ESC_POS.FONT_NORMAL}`);
        }
        if (index < data.items.length - 1) {
          lines.push("");
        }
      });
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      if (data.remarks && data.remarks.trim()) {
        lines.push(`${ESC_POS.ALIGN_LEFT}Memo\uFF1A${data.remarks}`);
        lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      }
      if (data.pickupNo) {
        const displayPickupNo = data.pickupNo.slice(-4);
        const pickupNoText = `${displayPickupNo}`;
        const pickupNoPrintWidth = getPrintWidth3(pickupNoText) * 2;
        const pickupNoPadding = Math.max(
          0,
          Math.floor((w - pickupNoPrintWidth) / 2)
        );
        lines.push(
          `${ESC_POS.ALIGN_LEFT}${" ".repeat(pickupNoPadding)}${ESC_POS.FONT_DOUBLE_BOTH}${bold(pickupNoText)}${ESC_POS.FONT_NORMAL}`
        );
      }
      lines.push(ESC_POS.FEED_10_LINES);
      lines.push(ESC_POS.CUT_PAPER);
      return lines.join("\n");
    }
  };

  // src/services/printer/templates/kitchenDocket.ts
  function splitTextByPrintWidth2(text, maxWidth) {
    const result = [];
    let currentLine = "";
    let currentWidth = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charAt(i);
      const charWidth = /[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/.test(char) ? 2 : 1;
      if (currentWidth + charWidth <= maxWidth) {
        currentLine += char;
        currentWidth += charWidth;
      } else {
        if (currentLine) {
          result.push(currentLine);
        }
        currentLine = char;
        currentWidth = charWidth;
      }
    }
    if (currentLine) {
      result.push(currentLine);
    }
    return result.length > 0 ? result : [""];
  }
  function formatThreeColumnHeader2(width) {
    const qtyWidth = 4;
    const priceWidth = 11;
    const separator = "  ";
    const qtyPriceWidth = qtyWidth + separator.length + priceWidth;
    const productWidth = width - qtyPriceWidth - separator.length;
    return "Product".padEnd(productWidth) + separator + "Qty".padStart(qtyWidth) + separator + "Price".padStart(priceWidth);
  }
  function formatTwoColumnHeader2(width) {
    const qtyWidth = 4;
    const separator = "  ";
    const productWidth = width - qtyWidth - separator.length;
    return "Product".padEnd(productWidth) + separator + "Qty".padStart(qtyWidth);
  }
  var kitchenDocketTemplate = {
    type: "KITCHEN_DOCKET" /* KITCHEN_DOCKET */,
    name: "\u53A8\u623F\u5355",
    generate(data, config) {
      const w = config.charPerLine;
      const lines = [];
      lines.push("");
      const storeName = (data.storeName || config.storeName).trim();
      lines.push(centerBigTitle(storeName, w));
      if (data.isAdditional) {
        lines.push(centerBigTitle("ADDITIONAL", w));
      }
      lines.push(centerBigTitle("KITCHEN DOCKET", w));
      if (data.isReprint) {
        lines.push(centerBigTitle("REPRINT", w));
      }
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      const tableName = data.tableName || "";
      const tableText = `Table#: ${tableName}`;
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${ESC_POS.FONT_DOUBLE_BOTH}${bold(tableText)}${ESC_POS.FONT_NORMAL}`
      );
      if (data.trxType) {
        lines.push(`${ESC_POS.ALIGN_LEFT}${data.trxType}`);
      }
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "Date&Time:",
          formatPhilippinesDateTime(data.dateTime),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText("Operator:", data.operator, w)}`
      );
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      const showPrice = data.showPrice !== false;
      if (showPrice) {
        lines.push(`${ESC_POS.ALIGN_LEFT}${bold(formatThreeColumnHeader2(w))}`);
      } else {
        lines.push(`${ESC_POS.ALIGN_LEFT}${bold(formatTwoColumnHeader2(w))}`);
      }
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      data.items.forEach((item, index) => {
        const qty = Number(item.quantity) || 0;
        const unitPrice = Number(item.unitPrice) || 0;
        const displayName = item.displayName || item.name || "";
        {
          let nameLine = displayName;
          if (data.bilingual && item.nameEn) {
            const specStr = item.specs?.filter(Boolean).join(", ");
            const enSpec = specStr ? `[${specStr}]` : "";
            nameLine = `${displayName}(${item.nameEn}${enSpec})`;
          }
          const nameLines = splitTextByPrintWidth2(nameLine, w);
          nameLines.forEach((line) => {
            lines.push(`${ESC_POS.ALIGN_LEFT}${ESC_POS.FONT_DOUBLE_HEIGHT}${line}${ESC_POS.FONT_NORMAL}`);
          });
        }
        if (showPrice) {
          const qtyStr = String(qty).padStart(4);
          const priceStr = ((unitPrice ?? 0) * qty).toFixed(2).padStart(11);
          const qtyPriceStr = qtyStr + "  " + priceStr;
          lines.push(
            `${ESC_POS.ALIGN_LEFT}${ESC_POS.FONT_DOUBLE_HEIGHT}${" ".repeat(
              Math.max(0, w - 17)
            )}${qtyPriceStr}${ESC_POS.FONT_NORMAL}`
          );
        } else {
          const qtyStr = String(qty).padStart(4);
          lines.push(
            `${ESC_POS.ALIGN_LEFT}${ESC_POS.FONT_DOUBLE_HEIGHT}${" ".repeat(Math.max(0, w - 6))}${qtyStr}${ESC_POS.FONT_NORMAL}`
          );
        }
        if (item.flavors && item.flavors.length > 0) {
          const flavorGroups = {};
          item.flavors.forEach(
            (flavor) => {
              if (flavor && flavor.optionName) {
                const group = flavor.groupName || "";
                if (!flavorGroups[group]) {
                  flavorGroups[group] = [];
                }
                flavorGroups[group].push(flavor.optionName);
              }
            }
          );
          Object.entries(flavorGroups).forEach(([groupName, options]) => {
            if (groupName) {
              lines.push(`${ESC_POS.ALIGN_LEFT}${ESC_POS.FONT_DOUBLE_HEIGHT}  ${groupName}\uFF1A${ESC_POS.FONT_NORMAL}`);
            }
            options.forEach((option) => {
              lines.push(`${ESC_POS.ALIGN_LEFT}${ESC_POS.FONT_DOUBLE_HEIGHT}    - ${option}${ESC_POS.FONT_NORMAL}`);
            });
          });
        }
        if (item.notes && item.notes.trim()) {
          lines.push(`${ESC_POS.ALIGN_LEFT}${ESC_POS.FONT_DOUBLE_HEIGHT}  Memo:${item.notes}${ESC_POS.FONT_NORMAL}`);
        }
        if (index < data.items.length - 1) {
          lines.push("");
        }
      });
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      if (data.remarks && data.remarks.trim()) {
        lines.push(`${ESC_POS.ALIGN_LEFT}Memo\uFF1A${data.remarks}`);
        lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      }
      if (data.isReprint) {
        lines.push(`${ESC_POS.ALIGN_CENTER}${ESC_POS.FONT_DOUBLE_BOTH}Do not reproduce${ESC_POS.FONT_NORMAL}`);
        lines.push("");
      }
      if (data.pickupNo) {
        const displayPickupNo = data.pickupNo.slice(-4);
        lines.push(
          `${ESC_POS.ALIGN_CENTER}${ESC_POS.FONT_DOUBLE_BOTH}${displayPickupNo}${ESC_POS.FONT_NORMAL}`
        );
      }
      lines.push(ESC_POS.FEED_10_LINES);
      lines.push(ESC_POS.CUT_PAPER);
      return lines.join("\n");
    }
  };

  // src/services/printer/templates/voidKitchen.ts
  function splitTextByPrintWidth3(text, maxWidth) {
    const result = [];
    let currentLine = "";
    let currentWidth = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charAt(i);
      const charWidth = /[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/.test(char) ? 2 : 1;
      if (currentWidth + charWidth <= maxWidth) {
        currentLine += char;
        currentWidth += charWidth;
      } else {
        if (currentLine) {
          result.push(currentLine);
        }
        currentLine = char;
        currentWidth = charWidth;
      }
    }
    if (currentLine) {
      result.push(currentLine);
    }
    return result.length > 0 ? result : [""];
  }
  function formatThreeColumnHeader3(width) {
    const qtyWidth = 4;
    const priceWidth = 11;
    const separator = "  ";
    const qtyPriceWidth = qtyWidth + separator.length + priceWidth;
    const productWidth = width - qtyPriceWidth - separator.length;
    return "Product".padEnd(productWidth) + separator + "Qty".padStart(qtyWidth) + separator + "Price".padStart(priceWidth);
  }
  var voidKitchenTemplate = {
    type: "VOID_DISH" /* VOID_DISH */,
    name: "\u9000\u83DC\u5355",
    generate(data, config) {
      const lines = [];
      const w = config.charPerLine;
      lines.push("");
      const voidTitle = "VOID";
      const voidPadding = Math.round((w - voidTitle.length * 2) / 2);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${" ".repeat(Math.max(0, voidPadding))}${bigText(
          bold(voidTitle)
        )}`
      );
      const storeName = config.storeName || "STORE NAME";
      const storeNameWidth = storeName.length * 2;
      const storeNamePadding = Math.round((w - storeNameWidth) / 2);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${" ".repeat(
          Math.max(0, storeNamePadding)
        )}${bigText(bold(storeName))}`
      );
      const kitchenTitle = "KITCHEN DOCKET";
      const kitchenPadding = Math.round((w - kitchenTitle.length * 2) / 2);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${" ".repeat(Math.max(0, kitchenPadding))}${bigText(
          bold(kitchenTitle)
        )}`
      );
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${ESC_POS.FONT_DOUBLE_BOTH}${bold(
          `Table#: ${data.tableName || ""}`
        )}${ESC_POS.FONT_NORMAL}`
      );
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      lines.push(`${ESC_POS.ALIGN_LEFT}${data.trxType}`);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "Date&Time:",
          formatPhilippinesDateTime(data.dateTime),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText("Operator:", data.operator, w)}`
      );
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      lines.push(`${ESC_POS.ALIGN_LEFT}${bold(formatThreeColumnHeader3(w))}`);
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      data.items.forEach((item, index) => {
        let nameLine = item.name;
        if (data.bilingual && item.nameEn) {
          const specStr = item.specs?.filter(Boolean).join(", ");
          const enSpec = specStr ? `[${specStr}]` : "";
          nameLine = `${item.name}(${item.nameEn}${enSpec})`;
        }
        const nameLines = splitTextByPrintWidth3(nameLine, w);
        nameLines.forEach((line) => {
          lines.push(`${ESC_POS.ALIGN_LEFT}${ESC_POS.FONT_DOUBLE_HEIGHT}${line}${ESC_POS.FONT_NORMAL}`);
        });
        const qtyStr = String(item.quantity).padStart(4);
        const priceStr = ((item.unitPrice ?? 0) * item.quantity).toFixed(2).padStart(11);
        const qtyPriceStr = qtyStr + "  " + priceStr;
        lines.push(
          `${ESC_POS.ALIGN_LEFT}${ESC_POS.FONT_DOUBLE_HEIGHT}${" ".repeat(Math.max(0, w - 17))}${qtyPriceStr}${ESC_POS.FONT_NORMAL}`
        );
        if (item.specs && item.specs.length > 0) {
          const specsStr = item.specs.filter(Boolean).join(", ");
          if (specsStr) {
            lines.push(`${ESC_POS.ALIGN_LEFT}${ESC_POS.FONT_DOUBLE_HEIGHT}  \u89C4\u683C\uFF1A${specsStr}${ESC_POS.FONT_NORMAL}`);
          }
        }
        if (item.flavors && item.flavors.length > 0) {
          const flavorGroups = {};
          item.flavors.forEach(
            (flavor) => {
              if (flavor && flavor.optionName) {
                const group = flavor.groupName || "";
                if (!flavorGroups[group]) {
                  flavorGroups[group] = [];
                }
                flavorGroups[group].push(flavor.optionName);
              }
            }
          );
          Object.entries(flavorGroups).forEach(([groupName, options]) => {
            if (groupName) {
              lines.push(`${ESC_POS.ALIGN_LEFT}${ESC_POS.FONT_DOUBLE_HEIGHT}  ${groupName}\uFF1A${ESC_POS.FONT_NORMAL}`);
            }
            options.forEach((option) => {
              lines.push(`${ESC_POS.ALIGN_LEFT}${ESC_POS.FONT_DOUBLE_HEIGHT}    - ${option}${ESC_POS.FONT_NORMAL}`);
            });
          });
        }
        if (item.notes) {
          lines.push(`${ESC_POS.ALIGN_LEFT}${ESC_POS.FONT_DOUBLE_HEIGHT}  \u5907\u6CE8\uFF1A${item.notes}${ESC_POS.FONT_NORMAL}`);
        }
        if (index < data.items.length - 1) {
          lines.push("");
        }
      });
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      if (data.remarks) {
        lines.push(`${ESC_POS.ALIGN_LEFT}${bold("Remarks:")}`);
        lines.push(`${ESC_POS.ALIGN_LEFT}${data.remarks}`);
        lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      }
      if (data.pickupNo) {
        const displayPickupNo = data.pickupNo.slice(-4);
        lines.push(
          `${ESC_POS.ALIGN_CENTER}${ESC_POS.FONT_DOUBLE_BOTH}${displayPickupNo}${ESC_POS.FONT_NORMAL}`
        );
      }
      lines.push(ESC_POS.FEED_10_LINES);
      lines.push(ESC_POS.CUT_PAPER);
      return lines.join("\n");
    }
  };

  // src/services/printer/templates/transferSlip.ts
  function splitTextByPrintWidth4(text, maxWidth) {
    const result = [];
    let currentLine = "";
    let currentWidth = 0;
    for (let i = 0; i < text.length; i++) {
      const char = text.charAt(i);
      const charWidth = /[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/.test(char) ? 2 : 1;
      if (currentWidth + charWidth <= maxWidth) {
        currentLine += char;
        currentWidth += charWidth;
      } else {
        if (currentLine) {
          result.push(currentLine);
        }
        currentLine = char;
        currentWidth = charWidth;
      }
    }
    if (currentLine) {
      result.push(currentLine);
    }
    return result.length > 0 ? result : [""];
  }
  function formatTwoColumnHeader3(width) {
    const qtyWidth = 4;
    const separator = "  ";
    const productWidth = width - qtyWidth - separator.length;
    return "Product".padEnd(productWidth) + separator + "Qty".padStart(qtyWidth);
  }
  var transferSlipTemplate = {
    type: "CHANGE_TABLE" /* CHANGE_TABLE */,
    name: "\u8F6C\u684C\u5355",
    generate(data, config) {
      const w = config.charPerLine;
      const lines = [];
      lines.push("");
      lines.push(centerBigTitle((config.storeName || "").toUpperCase(), w));
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      const title = "Transfer Slip";
      const titleWidth = title.length * 2;
      const padding = Math.round((w - titleWidth) / 2);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${" ".repeat(Math.max(0, padding))}${bigText(
          bold(title)
        )}`
      );
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText("Order No:", data.orderNo, w)}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${bold(
          leftRightText("Original Table#:", data.originalTable, w)
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${bold(
          leftRightText("New Table#:", data.newTable, w)
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "Date&Time:",
          formatPhilippinesDateTime(data.dateTime),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText("Operator:", data.operator, w)}`
      );
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      if (data.items.length > 0) {
        lines.push(`${ESC_POS.ALIGN_LEFT}${bold(formatTwoColumnHeader3(w))}`);
        lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
        data.items.forEach((item, index) => {
          const qty = Number(item.quantity) || 0;
          const displayName = item.displayName || item.name || "";
          let nameLine = displayName;
          if (item.nameEn) {
            const specStr = item.specs?.filter(Boolean).join(", ");
            const enSpec = specStr ? `[${specStr}]` : "";
            nameLine = `${displayName}(${item.nameEn}${enSpec})`;
          }
          const nameLines = splitTextByPrintWidth4(nameLine, w);
          nameLines.forEach((line) => {
            lines.push(`${ESC_POS.ALIGN_LEFT}${ESC_POS.FONT_DOUBLE_HEIGHT}${line}${ESC_POS.FONT_NORMAL}`);
          });
          const qtyStr = String(qty).padStart(4);
          lines.push(
            `${ESC_POS.ALIGN_LEFT}${ESC_POS.FONT_DOUBLE_HEIGHT}${" ".repeat(Math.max(0, w - 6))}${qtyStr}${ESC_POS.FONT_NORMAL}`
          );
          if (item.flavors && item.flavors.length > 0) {
            const flavorGroups = {};
            item.flavors.forEach((flavor) => {
              if (flavor && flavor.optionName) {
                const group = flavor.groupName || "";
                if (!flavorGroups[group]) {
                  flavorGroups[group] = [];
                }
                flavorGroups[group].push(flavor.optionName);
              }
            });
            Object.entries(flavorGroups).forEach(([groupName, options]) => {
              if (groupName) {
                lines.push(`${ESC_POS.ALIGN_LEFT}${ESC_POS.FONT_DOUBLE_HEIGHT}  ${groupName}\uFF1A${ESC_POS.FONT_NORMAL}`);
              }
              options.forEach((option) => {
                lines.push(`${ESC_POS.ALIGN_LEFT}${ESC_POS.FONT_DOUBLE_HEIGHT}    - ${option}${ESC_POS.FONT_NORMAL}`);
              });
            });
          }
          if (item.notes && item.notes.trim()) {
            lines.push(`${ESC_POS.ALIGN_LEFT}${ESC_POS.FONT_DOUBLE_HEIGHT}  Memo:${item.notes}${ESC_POS.FONT_NORMAL}`);
          }
          if (index < data.items.length - 1) {
            lines.push("");
          }
        });
        lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      }
      if (data.remarks) {
        lines.push(`${ESC_POS.ALIGN_LEFT}Remarks: ${data.remarks}`);
        lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      }
      if (data.pickupNo) {
        lines.push("");
        const pickupNoWidth = data.pickupNo.length * 2;
        const pickupNoPadding = Math.round((w - pickupNoWidth) / 2);
        lines.push(
          `${ESC_POS.ALIGN_LEFT}${" ".repeat(
            Math.max(0, pickupNoPadding)
          )}${bigText(bold(data.pickupNo))}`
        );
        lines.push("");
      }
      lines.push(ESC_POS.FEED_10_LINES);
      lines.push(ESC_POS.CUT_PAPER);
      return lines.join("\n");
    }
  };

  // src/services/printer/templates/xReading.ts
  function getPaymentLabel2(method) {
    const m = method.toUpperCase();
    if (m === "CREDIT_CARD" || m === "CREDITCARD") return "CREDIT CARD";
    if (m === "DEBIT_CARD" || m === "DEBITCARD") return "DEBIT CARD";
    if (m === "GIFT_CHECK" || m === "GIFTCHECK") return "GIFT CHECK";
    if (m === "MEMBER_BALANCE") return "MEMBER BALANCE";
    if (m === "POINTS") return "POINTS";
    if (m === "EWALLET") return "E-WALLET";
    return m;
  }
  var xReadingTemplate = {
    type: "X_READING" /* X_READING */,
    name: "X\u8BFB\u6570",
    generate(data, config) {
      const w = config.charPerLine;
      const lines = [];
      lines.push(generateFullHeader(config, { skipPTU: true }));
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      const title = "X-READING";
      const titleWidth = title.length * 2;
      const padding = Math.round((w - titleWidth) / 2);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${" ".repeat(Math.max(0, padding))}${bigText(
          bold(title)
        )}`
      );
      lines.push(`${ESC_POS.ALIGN_LEFT}${centerText("(CASHIER CUT-OFF)", w)}`);
      if (data.isReprint) {
        lines.push(centerBigTitle(LABELS.REPRINT, w));
      }
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          LABELS.REPORT_DATE_TIME + ":",
          formatPhilippinesDateTime(data.reportDateTime),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          LABELS.START_DATE_TIME + ":",
          formatPhilippinesDateTime(data.startDateTime),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          LABELS.END_DATE_TIME,
          formatPhilippinesDateTime(data.endDateTime),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(LABELS.CASHIER, data.cashier, w)}`
      );
      if (data.terminalNo) {
        lines.push(
          `${ESC_POS.ALIGN_LEFT}${leftRightText(
            LABELS.TERMINAL_NO,
            data.terminalNo,
            w
          )}`
        );
      }
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          LABELS.BEG_SI_NO + ":",
          data.begSiNo,
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          LABELS.END_SI_NO + ":",
          data.endSiNo,
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "Cash In Amount:",
          formatAmountWithComma(data.cashInAmount),
          w
        )}`
      );
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      for (const [method, amount] of Object.entries(data.payments)) {
        lines.push(
          `${ESC_POS.ALIGN_LEFT}${leftRightText(
            getPaymentLabel2(method),
            formatAmountWithComma(amount),
            w
          )}`
        );
      }
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${bold(
          leftRightText(
            "Total Payments:",
            formatAmountWithComma(data.totalPayments),
            w
          )
        )}`
      );
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${bold(
          leftRightText("VOID", formatAmountWithComma(data.totalVoid), w)
        )}`
      );
      for (const [method, amount] of Object.entries(data.voids)) {
        lines.push(
          `${ESC_POS.ALIGN_LEFT}${leftRightText(
            getPaymentLabel2(method),
            formatAmountWithComma(amount),
            w
          )}`
        );
      }
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${bold(
          leftRightText("RETURN", formatAmountWithComma(data.totalReturn), w)
        )}`
      );
      for (const [method, amount] of Object.entries(data.returns)) {
        lines.push(
          `${ESC_POS.ALIGN_LEFT}${leftRightText(
            getPaymentLabel2(method),
            formatAmountWithComma(amount),
            w
          )}`
        );
      }
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "PICK UP CASH:",
          formatAmountWithComma(data.pickupCash),
          w
        )}`
      );
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      lines.push(`${ESC_POS.ALIGN_LEFT}${bold("TRANSACTION SUMMARY")}`);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "CASH OUT AMOUNT:",
          formatAmountWithComma(data.cashOutAmount),
          w
        )}`
      );
      for (const [method, amount] of Object.entries(data.payments)) {
        if (method.toUpperCase() !== "CASH") {
          lines.push(
            `${ESC_POS.ALIGN_LEFT}${leftRightText(
              getPaymentLabel2(method),
              formatAmountWithComma(amount),
              w
            )}`
          );
        }
      }
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "CASH IN AMOUNT:",
          formatAmountWithComma(data.cashInAmount),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "Less PICK UP CASH:",
          formatAmountWithComma(data.pickupCash),
          w
        )}`
      );
      const paymentsReceived = data.totalPayments - data.totalVoid - data.totalReturn;
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "Payments Received:",
          formatAmountWithComma(paymentsReceived),
          w
        )}`
      );
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      const shortOverStr = data.shortOver >= 0 ? `+${formatAmountWithComma(Math.abs(data.shortOver))}` : `-${formatAmountWithComma(Math.abs(data.shortOver))}`;
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${bold(
          leftRightText(`SHORT/OVER:`, shortOverStr, w)
        )}`
      );
      lines.push(ESC_POS.FEED_10_LINES);
      lines.push(ESC_POS.CUT_PAPER);
      return lines.join("\n");
    }
  };

  // src/services/printer/templates/zReading.ts
  var zReadingTemplate = {
    type: "Z_READING" /* Z_READING */,
    name: "Z\u8BFB\u6570",
    generate(data, config) {
      const w = config.charPerLine;
      const lines = [];
      lines.push(generateFullHeader(config, { skipPTU: true }));
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      const title = "Z-READING REPORT";
      const titleWidth = title.length * 2;
      const padding = Math.round((w - titleWidth) / 2);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${" ".repeat(Math.max(0, padding))}${bigText(
          bold(title)
        )}`
      );
      if (data.isReprint) {
        lines.push(centerBigTitle(LABELS.REPRINT, w));
      }
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          LABELS.REPORT_DATE_TIME + ":",
          formatPhilippinesDateTime(data.reportDateTime),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          LABELS.START_DATE_TIME + ":",
          formatPhilippinesDateTime(data.startDateTime),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          LABELS.END_DATE_TIME + ":",
          formatPhilippinesDateTime(data.endDateTime),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          LABELS.BEG_SI_NO + ":",
          data.begSiNo,
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          LABELS.END_SI_NO + ":",
          data.endSiNo,
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          LABELS.BEG_VOID_NO + ":",
          data.begVoidNo,
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          LABELS.END_VOID_NO + ":",
          data.endVoidNo,
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          LABELS.BEG_RETURN_NO + ":",
          data.begReturnNo,
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          LABELS.END_RETURN_NO + ":",
          data.endReturnNo,
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "Reset Invoice No.",
          data.resetInvoiceNo.toString(),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "Reset Accumulated Sales",
          data.resetAccumulatedSales.toString(),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "Z Counter.",
          data.zCounterNo.toString(),
          w
        )}`
      );
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          LABELS.PRESENT_ACCUMULATED_SALES,
          formatAmountWithComma(data.presentAccumulatedSales),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          LABELS.PREVIOUS_ACCUMULATED_SALES,
          formatAmountWithComma(data.previousAccumulatedSales),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          LABELS.SALES_FOR_THE_DAY,
          formatAmountWithComma(data.salesForTheDay),
          w
        )}`
      );
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${centerText(bold(LABELS.BREAKDOWN_OF_SALES), w)}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "VATABLE SALES:",
          formatAmountWithComma(data.taxBreakdown.vatableSales),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "VAT AMOUNT:",
          formatAmountWithComma(data.taxBreakdown.vatAmount),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "VAT EXEMPT SALES:",
          formatAmountWithComma(data.taxBreakdown.vatExemptSales),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "ZERO RATED SALES:",
          formatAmountWithComma(data.taxBreakdown.zeroRatedSales),
          w
        )}`
      );
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "GROSS AMOUNT:",
          formatAmountWithComma(data.grossAmount),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "LESS DISCOUNT:",
          formatAmountWithComma(Math.abs(data.lessDiscount)),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "LESS RETURN:",
          formatAmountWithComma(Math.abs(data.lessReturn)),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "LESS VOID:",
          formatAmountWithComma(Math.abs(data.lessVoid)),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "LESS VAT ADJUSTMENT:",
          formatAmountWithComma(Math.abs(data.lessVatAdjustment)),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "NET AMOUNT:",
          formatAmountWithComma(data.netAmount),
          w
        )}`
      );
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${centerText(bold(LABELS.DISCOUNT_SUMMARY), w)}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "SC DISC:",
          formatAmountWithComma(data.discounts.sc),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "PWD DISC:",
          formatAmountWithComma(data.discounts.pwd),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "NAAC DISC:",
          formatAmountWithComma(data.discounts.naac),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "SP DISC:",
          formatAmountWithComma(data.discounts.sp),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "MOV DISC:",
          formatAmountWithComma(data.discounts.mov),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "OTHER DISC:",
          formatAmountWithComma(data.discounts.other),
          w
        )}`
      );
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${centerText(bold(LABELS.SALES_ADJUSTMENT), w)}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "VOID:",
          formatAmountWithComma(data.salesAdjustment.void),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "RETURN:",
          formatAmountWithComma(data.salesAdjustment.return),
          w
        )}`
      );
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${centerText(bold(LABELS.VAT_ADJUSTMENT), w)}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "SC TRANS:",
          formatAmountWithComma(data.vatAdjustment.scTrans),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "PWD TRANS:",
          formatAmountWithComma(data.vatAdjustment.pwdTrans),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "NAAC TRANS:",
          formatAmountWithComma(data.vatAdjustment.naacTrans),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "SP TRANS:",
          formatAmountWithComma(data.vatAdjustment.spTrans),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "MOV TRANS:",
          formatAmountWithComma(data.vatAdjustment.movTrans),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "DIPLOMATIC TRANS:",
          formatAmountWithComma(data.vatAdjustment.diplomaticTrans),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "REG DISC TRANS:",
          formatAmountWithComma(data.vatAdjustment.regDiscTrans),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "ZERO-RATED TRANS:",
          formatAmountWithComma(data.vatAdjustment.zeroRatedTrans),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "VAT ON RETURN:",
          formatAmountWithComma(data.vatAdjustment.vatOnReturn),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "VAT ON VOID:",
          formatAmountWithComma(data.vatAdjustment.vatOnVoid),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "OTHER VAT Adjustment:",
          formatAmountWithComma(data.vatAdjustment.otherAdjustments),
          w
        )}`
      );
      lines.push(ESC_POS.FEED_10_LINES);
      lines.push(ESC_POS.CUT_PAPER);
      return lines.join("\n");
    }
  };

  // src/services/printer/templates/cashIn.ts
  var cashInTemplate = {
    type: "CASH_IN" /* CASH_IN */,
    name: "\u5F00\u73ED\u5907\u7528\u91D1\u5B58\u5165",
    nameEn: "CASH IN",
    generate(data, config) {
      const w = config.charPerLine;
      const lines = [];
      lines.push(generateFullHeader(config));
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      const title = "CASH IN";
      const titleWidth = title.length * 2;
      const padding = Math.round((w - titleWidth) / 2);
      lines.push(`${ESC_POS.ALIGN_LEFT}${" ".repeat(Math.max(0, padding))}${bigText(bold(title))}`);
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "Report Date&Time:",
          formatPhilippinesDateTime(data.dateTime),
          w
        )}`
      );
      if (data.terminalNo) {
        lines.push(
          `${ESC_POS.ALIGN_LEFT}${leftRightText(
            "TERMINAL#:",
            data.terminalNo,
            w
          )}`
        );
      }
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText("Operator:", data.operator, w)}`
      );
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${bold(
          leftRightText("CASH IN", formatAmountWithComma(data.amount), w)
        )}`
      );
      lines.push(ESC_POS.FEED_10_LINES);
      lines.push(ESC_POS.CUT_PAPER);
      return lines.join("\n");
    }
  };

  // src/services/printer/templates/pickupCash.ts
  var pickupCashTemplate = {
    type: "PICK_UP_CASH" /* PICK_UP_CASH */,
    name: "\u4E34\u65F6\u53D6\u6B3E",
    nameEn: "Pick Up Cash",
    generate(data, config) {
      const w = config.charPerLine;
      const lines = [];
      lines.push(generateFullHeader(config));
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      const title = "PICK UP CASH";
      const titleWidth = title.length * 2;
      const padding = Math.round((w - titleWidth) / 2);
      lines.push(`${ESC_POS.ALIGN_LEFT}${" ".repeat(Math.max(0, padding))}${bigText(bold(title))}`);
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "Report Date&Time:",
          formatPhilippinesDateTime(data.dateTime),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText("TERMINAL#:", data.terminalNo, w)}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText("Operator:", data.operator, w)}`
      );
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      const entry = data.entries[0];
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          entry.reason,
          `-${formatAmountWithComma(entry.amount)}`,
          w
        )}`
      );
      lines.push(ESC_POS.FEED_10_LINES);
      lines.push(ESC_POS.CUT_PAPER);
      return lines.join("\n");
    }
  };

  // src/services/printer/templates/cashOut.ts
  var cashOutTemplate = {
    type: "CASH_OUT" /* CASH_OUT */,
    name: "\u7ED3\u73ED\u53D6\u6B3E",
    nameEn: "Cash Out",
    generate(data, config) {
      const w = config.charPerLine;
      const lines = [];
      lines.push(generateFullHeader(config));
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      const title = "CASH OUT";
      const titleWidth = title.length * 2;
      const padding = Math.round((w - titleWidth) / 2);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${" ".repeat(Math.max(0, padding))}${bigText(
          bold(title)
        )}`
      );
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "Report Date&Time:",
          formatPhilippinesDateTime(data.dateTime),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText("TERMINAL#:", data.terminalNo, w)}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText("Operator:", data.operator, w)}`
      );
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText("PICK UP CASH ENTRIES:", "", w)}`
      );
      if (data.pickupEntries && data.pickupEntries.length > 0) {
        data.pickupEntries.forEach((entry) => {
          lines.push(
            `${ESC_POS.ALIGN_LEFT}${leftRightText(
              `   --${entry.reason}`,
              formatAmountWithComma(entry.amount),
              w
            )}`
          );
        });
      }
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "CASH IN",
          formatAmountWithComma(data.cashIn),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "TOTAL PICK UP CASH",
          `-${formatAmountWithComma(data.totalPickupCash)}`,
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "CASH SALES",
          formatAmountWithComma(data.cashSales),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${bold(
          leftRightText("CASH OUT", formatAmountWithComma(data.cashOut), w)
        )}`
      );
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      const shortOverStr = data.shortOver >= 0 ? `+${formatAmountWithComma(Math.abs(data.shortOver))}` : `-${formatAmountWithComma(Math.abs(data.shortOver))}`;
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${bold(
          leftRightText("(-)SHORT/(+)OVER", shortOverStr, w)
        )}`
      );
      lines.push(ESC_POS.FEED_10_LINES);
      lines.push(ESC_POS.CUT_PAPER);
      return lines.join("\n");
    }
  };

  // src/services/printer/templates/birMonthlyReport.ts
  var birMonthlyReportTemplate = {
    type: "MONTHLY_REPORT" /* MONTHLY_REPORT */,
    name: "BIR\u6708\u5EA6\u9500\u552E\u62A5\u544A",
    nameEn: "BIR Monthly Sales Report",
    generate(data, config) {
      const w = config.charPerLine;
      const lines = [];
      lines.push(generateFullHeader(config));
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      const title = "BIR Monthly Sales Report";
      const titleWidth = title.length * 2;
      const padding = Math.round((w - titleWidth) / 2);
      lines.push(`${ESC_POS.ALIGN_LEFT}${" ".repeat(Math.max(0, padding))}${bigText(bold(title))}`);
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      lines.push(`${ESC_POS.ALIGN_LEFT}${leftRightText("COR Branch Code", data.corBranchCode, w)}`);
      lines.push(`${ESC_POS.ALIGN_LEFT}${leftRightText("DATE FROM", data.dateFrom, w)}`);
      lines.push(`${ESC_POS.ALIGN_LEFT}${leftRightText("DATE TO", data.dateTo, w)}`);
      lines.push(`${ESC_POS.ALIGN_LEFT}${leftRightText("Last SI Issued", data.lastSiIssued, w)}`);
      lines.push(`${ESC_POS.ALIGN_LEFT}${leftRightText("Last Cash Invoice SI Issued", data.lastCashInvoiceSiIssued, w)}`);
      lines.push(`${ESC_POS.ALIGN_LEFT}${leftRightText("Last Charge Invoice SI Issued", (data.lastChargeInvoiceSiIssued ?? 0).toFixed(2), w)}`);
      lines.push(`${ESC_POS.ALIGN_LEFT}${leftRightText("VATABLE SALES", formatAmountWithComma(data.vatableSales), w)}`);
      lines.push(`${ESC_POS.ALIGN_LEFT}${leftRightText("ZERO-RATED SALES", formatAmountWithComma(data.zeroRatedSales), w)}`);
      lines.push(`${ESC_POS.ALIGN_LEFT}${leftRightText("VAT EXEMPT SALES", formatAmountWithComma(data.vatExemptSales), w)}`);
      lines.push(`${ESC_POS.ALIGN_LEFT}${leftRightText("Sales subj To Percent Tax", formatAmountWithComma(data.salesSubjToPercentTax), w)}`);
      lines.push("");
      lines.push(`${ESC_POS.ALIGN_LEFT}${leftRightText("DATE PRINTED", data.datePrinted, w)}`);
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      lines.push(`${ESC_POS.ALIGN_CENTER}NOTHING FOLLOWS`);
      lines.push(ESC_POS.FEED_10_LINES);
      lines.push(ESC_POS.CUT_PAPER);
      return lines.join("\n");
    }
  };

  // src/services/printer/templates/membershipRecharge.ts
  var membershipRechargeTemplate = {
    type: "MEMBERSHIP_RECHARGE" /* MEMBERSHIP_RECHARGE */,
    name: "\u4F1A\u5458\u5145\u503C",
    generate(data, config) {
      const w = config.charPerLine;
      const lines = [];
      lines.push(generateFullHeader(config));
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      lines.push(centerBigTitle("Membership Recharge", w));
      lines.push(centerBigTitle("Receipt", w));
      if (data.isReprint) {
        lines.push(centerBigTitle(LABELS.REPRINT, w));
      }
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "Transaction ID:",
          data.transactionId,
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText("Cashier:", data.cashier, w)}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "Recharge Time:",
          formatPhilippinesDateTime(data.rechargeTime),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "Phone Number:",
          maskPhoneNumber(data.phoneNumber),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "Member:",
          data.memberName || "***",
          w
        )}`
      );
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      if (data.payments && data.payments.length > 0) {
        data.payments.forEach((payment) => {
          if (payment.amount > 0) {
            lines.push(
              `${ESC_POS.ALIGN_LEFT}${leftRightText(
                payment.method,
                formatAmountWithComma(payment.amount),
                w
              )}`
            );
            if (payment.cardLastFour) {
              lines.push(`  --Credit Card No. ${payment.cardLastFour}`);
            }
          }
        });
      }
      if (data.change && data.change > 0) {
        lines.push(
          `${ESC_POS.ALIGN_LEFT}${bold(
            leftRightText("CHANGE", formatAmountWithComma(data.change), w)
          )}`
        );
      }
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "Previous Balance:",
          formatAmountWithComma(data.previousBalance),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "Recharge Amount:",
          formatAmountWithComma(data.rechargeAmount),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${leftRightText(
          "Bonus Amount:",
          formatAmountWithComma(data.bonusAmount),
          w
        )}`
      );
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${bold(
          leftRightText(
            "Current Balance:",
            formatAmountWithComma(data.currentBalance),
            w
          )
        )}`
      );
      lines.push(`${ESC_POS.ALIGN_LEFT}${repeatChar("-", w)}`);
      const signatureLabel = "Customer Signature: ";
      const underlineLen = Math.max(0, w - signatureLabel.length);
      lines.push(
        `${ESC_POS.ALIGN_LEFT}${signatureLabel}${repeatChar(
          "_",
          underlineLen
        )}`
      );
      lines.push("");
      lines.push(`${ESC_POS.ALIGN_CENTER}Thank you for your support!`);
      lines.push(ESC_POS.FEED_10_LINES);
      lines.push(ESC_POS.CUT_PAPER);
      return lines.join("\n");
    }
  };
  function maskPhoneNumber(phone) {
    if (!phone || phone.length < 8) {
      return phone;
    }
    const start = phone.slice(0, 3);
    const end = phone.slice(-4);
    return `${start}****${end}`;
  }

  // src/services/printer/templates/cupSticker.ts
  var DPI = 203;
  var W = Math.round(40 * DPI / 25.4);
  var H = Math.round(30 * DPI / 25.4);
  var LM = 10;
  var RM = 16;
  var SAFE = 4;
  var chineseCache = /* @__PURE__ */ new Map();
  function hasChinese(text) {
    const cached = chineseCache.get(text);
    if (cached !== void 0) return cached;
    const result = /[一-鿿　-〿＀-￯]/.test(text);
    chineseCache.set(text, result);
    return result;
  }
  function chineseTextWidth(text) {
    let w = 0;
    for (const ch of text) {
      w += /[一-鿿　-〿＀-￯]/.test(ch) ? 24 : 12;
    }
    return w;
  }
  function textPixelWidth(text) {
    return hasChinese(text) ? chineseTextWidth(text) : text.length * 12;
  }
  function safeTextWidth(text) {
    return textPixelWidth(text) + SAFE;
  }
  function stripLeadingZeros(s) {
    return s.replace(/^0+/, "") || "0";
  }
  function splitTwoLines(text, maxChars) {
    if (text.length <= maxChars) return [text, ""];
    const breakIdx = text.lastIndexOf(" ", maxChars);
    if (breakIdx > 0) {
      const l22 = text.substring(breakIdx + 1);
      return [text.substring(0, breakIdx), l22.length > maxChars ? l22.substring(0, maxChars) : l22];
    }
    const l2 = text.substring(maxChars);
    return [text.substring(0, maxChars), l2.length > maxChars ? l2.substring(0, maxChars) : l2];
  }
  function rightAlignX(text) {
    return Math.max(LM, W - RM - safeTextWidth(text));
  }
  function centerX(text) {
    return Math.max(LM, Math.round((W - safeTextWidth(text)) / 2));
  }
  function computeFlavorLines(flavors, maxTextWidth, maxLines) {
    if (!flavors || flavors.length === 0) return [];
    const isCh = flavors.some((f) => hasChinese(f));
    const measure = (text) => isCh ? chineseTextWidth(text) + SAFE : text.length * 12 + SAFE;
    const lines = [];
    let currentLine = "";
    for (const f of flavors) {
      const tag = `[${f}]`;
      const candidate = currentLine ? `${currentLine}${tag}` : tag;
      if (measure(candidate) <= maxTextWidth || !currentLine) {
        currentLine = candidate;
      } else {
        lines.push(currentLine);
        if (lines.length >= maxLines) return lines;
        currentLine = tag;
      }
    }
    if (currentLine && lines.length < maxLines) {
      lines.push(currentLine);
    }
    const result = lines.slice(0, maxLines);
    const lastIdx = result.length - 1;
    if (lastIdx >= 0 && measure(result[lastIdx]) > maxTextWidth) {
      const line = result[lastIdx];
      let cut = line.length;
      const closeW = isCh ? 24 + SAFE : 12 + SAFE;
      while (cut > 1 && measure(line.substring(0, cut)) + closeW > maxTextWidth) {
        cut--;
      }
      result[lastIdx] = line.substring(0, cut) + "]";
    }
    return result;
  }
  var cupStickerTemplate = {
    type: "CUP_STICKER" /* CUP_STICKER */,
    name: "\u676F\u8D34\u6807\u7B7E",
    generate(data, _config) {
      const labelWidth = data.labelWidth || 40;
      const labelHeight = data.labelHeight || 30;
      const gapDistance = data.gapDistance || 2;
      const cmds = [];
      cmds.push(`SIZE ${labelWidth} mm,${labelHeight} mm`);
      cmds.push(`GAP ${gapDistance} mm,0 mm`);
      cmds.push("DIRECTION 0");
      cmds.push("REFERENCE 0,0");
      cmds.push("OFFSET 0 mm");
      cmds.push("SET PEEL OFF");
      cmds.push("SET CUTTER OFF");
      cmds.push("CLS");
      const maxTextWidth = W - LM - RM;
      const Y_TOP = 8;
      const Y_BOTTOM = H - 24 - 8;
      let nameLineCount = 0;
      let nameLine1 = "";
      let nameLine2 = "";
      if (data.productName) {
        const isChinese = hasChinese(data.productName);
        const boldMaxW = maxTextWidth - SAFE - 1;
        if (isChinese) {
          let w = 0, splitIdx = 0;
          for (let i = 0; i < data.productName.length; i++) {
            const cw = /[一-鿿　-〿＀-￯]/.test(data.productName[i]) ? 24 : 12;
            if (w + cw > boldMaxW) break;
            w += cw;
            splitIdx = i + 1;
          }
          nameLine1 = data.productName.substring(0, splitIdx);
          const rest = data.productName.substring(splitIdx);
          if (rest) {
            w = 0;
            splitIdx = 0;
            for (let i = 0; i < rest.length; i++) {
              const cw = /[一-鿿　-〿＀-￯]/.test(rest[i]) ? 24 : 12;
              if (w + cw > boldMaxW) break;
              w += cw;
              splitIdx = i + 1;
            }
            nameLine2 = rest.substring(0, splitIdx);
          }
        } else {
          const maxChars = Math.floor(boldMaxW / 12);
          [nameLine1, nameLine2] = splitTwoLines(data.productName, maxChars);
        }
        nameLineCount = nameLine2 ? 2 : 1;
      }
      const flavorLines = computeFlavorLines(data.flavors || [], maxTextWidth, 3);
      const flavorLineCount = flavorLines.length;
      const totalLines = 1 + nameLineCount + flavorLineCount + 1;
      const step = totalLines > 1 ? (Y_BOTTOM - Y_TOP) / (totalLines - 1) : 0;
      let lineIdx = 0;
      const lineY = () => Y_TOP + Math.round(lineIdx * step);
      const y1 = lineY();
      if (data.queueNumber) {
        const queueText = `#${stripLeadingZeros(data.queueNumber.replace(/^#/, ""))}`;
        const queueW = safeTextWidth(queueText) * (16 / 12);
        cmds.push(`TEXT ${LM},${y1},"3",0,1,1,"${queueText}"`);
        if (data.orderType) {
          const orderX = Math.max(LM + queueW + 8, centerX(data.orderType));
          cmds.push(`TEXT ${orderX},${y1},"2",0,1,1,"${data.orderType}"`);
        }
      } else if (data.orderType) {
        cmds.push(`TEXT ${centerX(data.orderType)},${y1},"2",0,1,1,"${data.orderType}"`);
      }
      if (data.quantity !== void 0 && data.quantity > 0) {
        const idx = data.copyIndex ?? 1;
        const qtyText = `${idx}/${data.quantity}`;
        cmds.push(`TEXT ${rightAlignX(qtyText)},${y1},"2",0,1,1,"${qtyText}"`);
      }
      lineIdx++;
      if (data.productName) {
        const isChinese = hasChinese(data.productName);
        const nameFont = isChinese ? "TSS24.BF2" : "2";
        const yName1 = lineY();
        cmds.push(`TEXT ${LM},${yName1},"${nameFont}",0,1,1,"${nameLine1}"`);
        cmds.push(`TEXT ${LM + 1},${yName1},"${nameFont}",0,1,1,"${nameLine1}"`);
        lineIdx++;
        if (nameLine2) {
          const yName2 = lineY();
          cmds.push(`TEXT ${LM},${yName2},"${nameFont}",0,1,1,"${nameLine2}"`);
          cmds.push(`TEXT ${LM + 1},${yName2},"${nameFont}",0,1,1,"${nameLine2}"`);
          lineIdx++;
        }
      }
      if (flavorLineCount > 0) {
        const isChinese = (data.flavors || []).some((f) => hasChinese(f));
        const flavorFont = isChinese ? "TSS24.BF2" : "2";
        for (const fLine of flavorLines) {
          cmds.push(`TEXT ${LM},${lineY()},"${flavorFont}",0,1,1,"${fLine}"`);
          lineIdx++;
        }
      }
      const yBottom = Y_BOTTOM;
      const timeParts = [];
      if (data.time) timeParts.push(data.time);
      if (data.date) timeParts.push(data.date);
      if (timeParts.length > 0) {
        cmds.push(`TEXT ${LM},${yBottom},"2",0,1,1,"${timeParts.join("  ")}"`);
      }
      if (data.invoiceNo) {
        const invDisplay = stripLeadingZeros(data.invoiceNo);
        const invText = `SI:${invDisplay}`;
        cmds.push(`TEXT ${rightAlignX(invText)},${yBottom},"2",0,1,1,"${invText}"`);
      }
      cmds.push("PRINT 1");
      return cmds.join("\r\n") + "\r\n";
    }
  };

  // src/services/printer/templates/productLabel.ts
  var chineseCache2 = /* @__PURE__ */ new Map();
  function hasChinese2(text) {
    const cached = chineseCache2.get(text);
    if (cached !== void 0) {
      return cached;
    }
    const result = /[\u4e00-\u9fff\u3000-\u303f\uff00-\uffef]/.test(text);
    chineseCache2.set(text, result);
    return result;
  }
  function ean13CheckDigit(data12) {
    let sum = 0;
    for (let i = 0; i < 12; i++) {
      sum += parseInt(data12[i], 10) * (i % 2 === 0 ? 1 : 3);
    }
    return String((10 - sum % 10) % 10);
  }
  var splitCache = /* @__PURE__ */ new Map();
  function splitIntoTwoLines(text, maxCharsPerLine) {
    const cacheKey = `${text}::${maxCharsPerLine}`;
    const cached = splitCache.get(cacheKey);
    if (cached !== void 0) {
      return cached;
    }
    if (text.length <= maxCharsPerLine) {
      const result2 = [text, ""];
      splitCache.set(cacheKey, result2);
      return result2;
    }
    let line1 = text.substring(0, maxCharsPerLine);
    const breakIdx = line1.lastIndexOf(" ");
    if (breakIdx > 0) {
      line1 = text.substring(0, breakIdx);
      let line22 = text.substring(breakIdx + 1);
      if (line22.length > maxCharsPerLine) {
        line22 = line22.substring(0, maxCharsPerLine);
      }
      const result2 = [line1, line22];
      splitCache.set(cacheKey, result2);
      return result2;
    }
    let line2 = text.substring(maxCharsPerLine);
    if (line2.length > maxCharsPerLine) {
      line2 = line2.substring(0, maxCharsPerLine);
    }
    const result = [line1, line2];
    splitCache.set(cacheKey, result);
    return result;
  }
  var productLabelTemplate = {
    type: "PRODUCT_LABEL" /* PRODUCT_LABEL */,
    name: "\u5546\u54C1\u6807\u7B7E",
    generate(data, _config) {
      const labelWidth = data.labelWidth || 40;
      const labelHeight = data.labelHeight || 30;
      const gapDistance = data.gapDistance || 2;
      const copies = data.copies || 1;
      const DPI2 = 203;
      const labelDotsWidth = Math.round(labelWidth * DPI2 / 25.4);
      const labelDotsHeight = Math.round(labelHeight * DPI2 / 25.4);
      const isSmallLabel = labelWidth <= 30 && labelHeight <= 20;
      console.log(`[ProductLabel] data.labelWidth=${data.labelWidth}, data.labelHeight=${data.labelHeight} \u2192 SIZE ${labelWidth}x${labelHeight}mm (${labelDotsWidth}x${labelDotsHeight}dots), isSmallLabel=${isSmallLabel}`);
      let displayName = data.productName || "";
      if (data.skuName) {
        displayName = `${displayName}[${data.skuName}]`;
      }
      const nameFont = hasChinese2(displayName) ? "TSS24.BF2" : isSmallLabel ? "2" : "3";
      const charWidth = nameFont === "TSS24.BF2" ? 24 : isSmallLabel ? 12 : 16;
      const nameLineHeight = isSmallLabel ? 28 : 36;
      const NAME_Y = isSmallLabel ? 8 : 24;
      const BARCODE_X = isSmallLabel ? 16 : 32;
      const BARCODE_MAX_HEIGHT = isSmallLabel ? 28 : 80;
      const BARCODE_MIN_Y = isSmallLabel ? 56 : 80;
      const BARCODE_HUMAN_H = isSmallLabel ? 16 : 24;
      const CODE39_NARROW = isSmallLabel ? 1 : 2;
      const CODE39_WIDE = isSmallLabel ? 2 : 4;
      const PRICE_FONT = isSmallLabel ? "3" : "4";
      const PRICE_Y = isSmallLabel ? 124 : 184;
      const PRICE_X_P = isSmallLabel ? 16 : 32;
      const PRICE_X_NUM = isSmallLabel ? 52 : 88;
      const MARGIN_LR = isSmallLabel ? 16 : 32;
      const cmds = [];
      cmds.push(`SIZE ${labelWidth} mm,${labelHeight} mm`);
      cmds.push(`GAP ${gapDistance} mm,0 mm`);
      cmds.push("DIRECTION 0");
      cmds.push("SPEED 4");
      cmds.push("DENSITY 8");
      cmds.push("CLS");
      let nameBottomY = 0;
      if (displayName) {
        const maxChars = Math.floor((labelDotsWidth - MARGIN_LR * 2) / charWidth);
        const [l1, l2] = splitIntoTwoLines(displayName, maxChars);
        const line1Width = l1.length * charWidth;
        const line1X = Math.round((labelDotsWidth - line1Width) / 2);
        cmds.push(`TEXT ${line1X},${NAME_Y},"${nameFont}",0,1,1,"${l1}"`);
        nameBottomY = NAME_Y + nameLineHeight;
        if (l2) {
          const line2Width = l2.length * charWidth;
          const line2X = Math.round((labelDotsWidth - line2Width) / 2);
          cmds.push(`TEXT ${line2X},${nameBottomY},"${nameFont}",0,1,1,"${l2}"`);
          nameBottomY += nameLineHeight;
        }
      }
      if (data.barcode) {
        const barcodeY = Math.max(BARCODE_MIN_Y, nameBottomY + 4);
        const available = PRICE_Y - barcodeY - BARCODE_HUMAN_H - 4;
        const barcodeHeight = Math.max(20, Math.min(BARCODE_MAX_HEIGHT, available));
        if (/^\d{12,13}$/.test(data.barcode)) {
          const barcodeData = data.barcode.length === 12 ? data.barcode + ean13CheckDigit(data.barcode) : data.barcode;
          cmds.push(
            `BARCODE ${BARCODE_X},${barcodeY},"EAN13",${barcodeHeight},1,0,2,2,"${barcodeData}"`
          );
        } else {
          cmds.push(
            `BARCODE ${BARCODE_X},${barcodeY},"39",${barcodeHeight},1,0,${CODE39_NARROW},${CODE39_WIDE},"${data.barcode.toUpperCase()}"`
          );
        }
      }
      if (data.price !== void 0) {
        const priceNum = Number.isInteger(data.price) ? String(data.price) : data.price.toFixed(2);
        cmds.push(`TEXT ${PRICE_X_P},${PRICE_Y},"${PRICE_FONT}",0,1,1,"P"`);
        cmds.push(`TEXT ${PRICE_X_NUM},${PRICE_Y},"${PRICE_FONT}",0,1,1,"${priceNum}"`);
      }
      cmds.push(`PRINT ${copies},1`);
      return cmds.join("\r\n") + "\r\n";
    }
  };

  // src/services/printer/templates/index.ts
  var templateRegistry = /* @__PURE__ */ new Map();
  function registerTemplate(template) {
    templateRegistry.set(template.type, template);
  }
  function generateReceipt(type, data, config = DEFAULT_PRINTER_CONFIG) {
    const template = templateRegistry.get(type);
    if (!template) {
      throw new Error(`Template not found: ${type}`);
    }
    return template.generate(data, config);
  }
  function initializeTemplates() {
    registerTemplate(salesInvoiceTemplate);
    registerTemplate(returnReceiptTemplate);
    registerTemplate(voidReceiptTemplate);
    registerTemplate(billingTemplate);
    registerTemplate(orderSlipTemplate);
    registerTemplate(kitchenDocketTemplate);
    registerTemplate(voidKitchenTemplate);
    registerTemplate(transferSlipTemplate);
    registerTemplate(birMonthlyReportTemplate);
    registerTemplate(membershipRechargeTemplate);
    registerTemplate(xReadingTemplate);
    registerTemplate(zReadingTemplate);
    registerTemplate(cashInTemplate);
    registerTemplate(pickupCashTemplate);
    registerTemplate(cashOutTemplate);
    registerTemplate(cupStickerTemplate);
    registerTemplate(productLabelTemplate);
  }
  initializeTemplates();

  // src/utils/discountMode.ts
  function resolveDiscountMode(discountMode, govPersonCount = 0, hasManualDiscount = false) {
    if (discountMode) return discountMode;
    if (govPersonCount > 1) return "WHOLE_ORDER_GOV";
    if (govPersonCount === 1) return "PER_ITEM_GOV";
    return hasManualDiscount ? "MANUAL" : "NONE";
  }

  // src/services/receiptRender/mappers.ts
  var roundTo = (v) => Math.round(v * 100) / 100;
  var num = (v) => {
    if (v == null || v === "") return 0;
    const n = typeof v === "string" ? parseFloat(v) : v;
    return Number.isFinite(n) ? n : 0;
  };
  function grossItemAmount(item) {
    return num(item.rowTotal) || num(item.originalSubtotal) || num(item.rowNet) || 0;
  }
  function mergeOrderHeaderConfig(order, config) {
    return {
      ...config,
      storeName: order.companyName || config.storeName,
      companyName: order.companyName || config.companyName,
      address: order.taxAddress || order.companyAddress || config.address,
      tinNumber: order.tinNumber || config.tinNumber,
      snCode: order.serialNumber || config.snCode,
      minNo: order.minNumber || config.minNo,
      ptuNo: order.ptuNumber || config.ptuNo,
      terminalNo: order.terminalNo || config.terminalNo || ""
    };
  }
  function mapOrderToSalesInvoiceData(detail, config, opts) {
    const { order, items = [], payments = [], govPersons = [] } = detail;
    const w = config.charPerLine;
    const governmentDiscountPersons = govPersons.map((person) => {
      const personType = person.discountType || "OTHER";
      const signaturePrefix = `${personType} Signature\uFF1A`;
      const prefixLength = getTextLength(signaturePrefix);
      const underlineLength = Math.max(0, w - prefixLength);
      return {
        type: personType,
        idNumber: person.personIdNo || "",
        name: person.personName || "",
        address: person.personAddress || "",
        tin: person.personTin || "",
        discountRate: num(person.discountRate),
        discountAmount: num(person.discountAmount),
        signatureLine: `${signaturePrefix}${repeatChar("_", underlineLength)}`
      };
    });
    const rels = detail.govPersonItemRels ?? [];
    const discountRateGroups = rels.length > 0 ? buildDiscountRateGroupsFromRels(rels) : buildDiscountRateGroupsFromGovPersons(govPersons);
    const data = {
      config,
      siNumber: order.siNumber || "",
      dateTime: order.paidAt ? new Date(order.paidAt) : /* @__PURE__ */ new Date(),
      orderTime: order.orderTime ? new Date(order.orderTime) : void 0,
      industryType: null,
      tableName: order.tableNo,
      billingNo: order.preBillNo || "",
      pax: order.totalPersons || 0,
      trxType: getTrxType(order.orderType),
      cashier: order.cashierName || "",
      terminalNo: order.terminalNo || config.terminalNo || "",
      items: items.map(mapSalesItem),
      grossSales: num(order.grossSales),
      manualDiscount: num(order.manualDiscount),
      lessVat: num(order.lessVatAmount),
      addVat: num(order.addVatAmount),
      serviceCharge: num(order.serviceCharge),
      serviceChargeRate: num(order.serviceChargeRate),
      amountDue: num(order.grandTotal),
      payments: payments.map(mapPayment),
      change: num(order.changeAmount),
      taxBreakdown: {
        vatableSales: num(order.variableSales),
        vatAmount: num(order.vatAmount),
        vatExemptSales: num(order.vatExemptSales),
        zeroRatedSales: num(order.zeroRatedSales)
      },
      numberOfItems: items.length,
      totalQty: items.reduce((s, it) => s + num(it.quantity), 0),
      remarks: order.notes || "",
      customerName: order.customerName || "",
      customerAddress: order.customerAddress || "",
      customerTin: order.customerTin || "",
      governmentDiscountPersons,
      discountMode: resolveDiscountMode(
        order.discountMode,
        govPersons.length,
        num(order.manualDiscount) !== 0
      ),
      discountRateGroups,
      // 与 PrintService.ts:615 一致:DB 里存的是 16 位零填充字符串(如 0000000000001000),
      // 实际打印会去掉前导零再 padStart(4),EJ 渲染同样处理避免一长串 0
      pickupNo: order.pickupNo ? (order.pickupNo.replace(/^0+/, "") || "0").padStart(4, "0") : "",
      bilingual: opts?.bilingual,
      copyType: opts?.copyType,
      isReprint: opts?.isReprint
    };
    return data;
  }
  function mapOrderToReturnReceiptData(detail, config, opts) {
    const { order, items = [], payments = [], refundRecord, refundItems = [], govPersons = [] } = detail;
    const refund = refundRecord;
    const origItemMap = /* @__PURE__ */ new Map();
    for (const it of items) {
      if (it.id != null) {
        origItemMap.set(it.id, { rowNet: num(it.rowNet), qty: num(it.quantity) });
      }
    }
    const sourceItems = refundItems.length > 0 ? refundItems.map((ri) => {
      const refundQty = num(ri.quantity);
      const orig = ri.salesOrderItemId != null ? origItemMap.get(ri.salesOrderItemId) : void 0;
      const afterDiscUnit = orig && orig.qty > 0 && orig.rowNet > 0 ? orig.rowNet / orig.qty : num(ri.unitPrice);
      return {
        productName: ri.productName,
        quantity: refundQty,
        unitPrice: afterDiscUnit,
        netAmount: afterDiscUnit * refundQty,
        specs: void 0,
        specName: void 0,
        flavorSnapshot: void 0,
        notes: void 0
      };
    }) : items.map((it) => ({
      productName: it.productName,
      quantity: num(it.quantity),
      unitPrice: num(it.unitPrice),
      netAmount: num(it.rowNet) || num(it.rowTotal) || num(it.originalSubtotal) || 0,
      specs: it.specName ? [it.specName] : void 0,
      flavorSnapshot: it.flavorSnapshot,
      notes: it.notes
    }));
    const returnItems = sourceItems.map((item) => {
      const name = item.productName || "";
      const specs = item.specs ?? (item.specName ? [item.specName] : void 0);
      let displayName = name;
      if (specs && specs.length > 0) {
        const specsStr = specs.filter(Boolean).join(", ");
        if (specsStr) displayName = `${displayName}[${specsStr}]`;
      }
      let flavors;
      if (item.flavorSnapshot) {
        try {
          flavors = JSON.parse(item.flavorSnapshot);
        } catch {
        }
      }
      const qty = num(item.quantity);
      const netAmount = num(item.netAmount) || (qty > 0 ? qty * num(item.unitPrice) : num(item.unitPrice));
      const unitPrice = qty > 0 ? roundTo(netAmount / qty) : num(item.unitPrice);
      return {
        name,
        displayName,
        quantity: -qty,
        unitPrice,
        amount: -netAmount,
        specs,
        flavors,
        notes: item.notes
      };
    });
    const refundTotal = refund ? num(refund.totalAmount || refund.refundAmount) || num(order.grandTotal) : num(order.grandTotal);
    const total = -Math.abs(refundTotal);
    const taxBase = refund || order;
    const taxBreakdown = {
      vatableSales: -num(taxBase.vatableSales),
      vatAmount: -num(taxBase.vatAmount),
      vatExemptSales: -num(taxBase.vatExemptSales),
      zeroRatedSales: -num(taxBase.zeroRatedSales)
    };
    const orderPayments = payments.filter((p) => num(p.amount) > 0);
    const orderTotalPaid = orderPayments.reduce((s, p) => s + num(p.amount), 0);
    let refundPayments;
    if (orderTotalPaid > 0 && Math.abs(total) > 0) {
      const ratio = Math.abs(total) / orderTotalPaid;
      refundPayments = orderPayments.map((p) => ({
        method: p.paymentMethod,
        amount: roundTo(num(p.amount) * ratio)
      }));
      const allocatedTotal = refundPayments.reduce((s, p) => s + p.amount, 0);
      const diff = roundTo(Math.abs(total) - allocatedTotal);
      if (diff !== 0 && refundPayments.length > 0) {
        const maxP = refundPayments.reduce((m, p) => p.amount > m.amount ? p : m);
        maxP.amount = roundTo(maxP.amount + diff);
      }
    } else {
      refundPayments = orderPayments.map((p) => ({
        method: p.paymentMethod,
        amount: num(p.amount)
      }));
    }
    refundPayments.forEach((p) => {
      p.amount = -p.amount;
    });
    const allRels = detail.govPersonItemRels ?? [];
    const refundedItemIds = new Set(
      refundItems.map((ri) => ri.salesOrderItemId).filter((id) => typeof id === "number" && id > 0)
    );
    const rels = refundItems.length > 0 && refundedItemIds.size > 0 ? allRels.filter((r) => refundedItemIds.has(r.salesOrderItemId)) : allRels;
    const discountRateGroups = rels.length > 0 ? buildDiscountRateGroupsFromRels(rels) : buildDiscountRateGroupsFromGovPersons(govPersons);
    const returnManualDiscount = num(refund?.manualDiscount ?? order.manualDiscount);
    const data = {
      config,
      returnNo: refund?.refundNo || order.returnOrderNo || "",
      dateTime: refund?.refundTime ? new Date(refund.refundTime) : order.orderTime ? new Date(order.orderTime) : /* @__PURE__ */ new Date(),
      originalSiNo: order.siNumber || "",
      tableName: order.tableNo,
      billingNo: order.preBillNo || "",
      trxType: getTrxType(order.orderType),
      pax: order.totalPersons,
      cashier: order.cashierName || "",
      terminalNo: order.terminalNo || config.terminalNo || "",
      items: returnItems,
      grossSales: -num(refund?.grossSales || order.grossSales),
      serviceCharge: -num(refund?.serviceCharge || order.serviceCharge),
      serviceChargeRate: num(refund?.serviceChargeRate ?? order.serviceChargeRate),
      manualDiscount: returnManualDiscount ? -returnManualDiscount : void 0,
      // discountMode 仍按原单判定:折扣模式是原单属性(决定 LESS/ADD 12% VAT 取整单还是逐行口径),
      // 与"退回了多少"无关,不能改用 returnManualDiscount。
      discountMode: resolveDiscountMode(
        order.discountMode,
        govPersons.length,
        num(order.manualDiscount) !== 0
      ),
      discountRateGroups,
      total,
      payments: refundPayments,
      taxBreakdown,
      customerName: order.customerName || "",
      customerAddress: order.customerAddress || "",
      customerTin: order.customerTin || "",
      issueDate: config.issueDate,
      ptuNo: config.ptuNo,
      bilingual: opts?.bilingual,
      copyType: opts?.copyType,
      isReprint: opts?.isReprint
    };
    return data;
  }
  function mapOrderToVoidReceiptData(detail, config, opts) {
    const { order, items = [], payments = [], voidRecord, govPersons = [] } = detail;
    const voidTotal = num(order.grandTotal);
    const voidItems = items.map((item) => {
      const name = item.productName || "";
      const specs = item.specName ? [item.specName] : void 0;
      let displayName = name;
      if (specs && specs.length > 0) {
        const specsStr = specs.filter(Boolean).join(", ");
        if (specsStr) displayName = `${displayName}[${specsStr}]`;
      }
      let flavors;
      if (item.flavorSnapshot) {
        try {
          flavors = JSON.parse(item.flavorSnapshot);
        } catch {
        }
      }
      const qty = num(item.quantity);
      const netAmount = num(item.rowNet) || num(item.rowTotal) || num(item.originalSubtotal) || 0;
      const unitPrice = qty > 0 ? netAmount > 0 ? roundTo(netAmount / qty) : num(item.unitPrice) : num(item.unitPrice);
      const amount = netAmount > 0 ? netAmount : qty * num(item.unitPrice);
      return {
        name,
        displayName,
        quantity: -qty,
        unitPrice,
        amount: -amount,
        specs,
        flavors,
        notes: item.notes
      };
    });
    const rels = detail.govPersonItemRels ?? [];
    const discountRateGroups = rels.length > 0 ? buildDiscountRateGroupsFromRels(rels) : buildDiscountRateGroupsFromGovPersons(govPersons);
    const data = {
      config,
      voidNo: voidRecord?.voidNo || order.voidOrderNo || "",
      dateTime: voidRecord?.voidedAt ? new Date(voidRecord.voidedAt) : order.voidedAt ? new Date(order.voidedAt) : /* @__PURE__ */ new Date(),
      originalSiNo: order.siNumber || "",
      tableName: order.tableNo,
      billingNo: order.preBillNo || "",
      trxType: getTrxType(order.orderType),
      pax: order.totalPersons,
      cashier: order.cashierName || "",
      terminalNo: order.terminalNo || config.terminalNo || "",
      items: voidItems,
      grossSales: -num(order.grossSales),
      serviceCharge: -num(order.serviceCharge),
      serviceChargeRate: num(order.serviceChargeRate) || null,
      discountMode: resolveDiscountMode(
        order.discountMode,
        govPersons.length,
        num(order.manualDiscount) !== 0
      ),
      manualDiscount: num(order.manualDiscount) ? -num(order.manualDiscount) : void 0,
      discountRateGroups,
      amountDue: -voidTotal,
      payments: payments.map((p) => ({
        method: p.paymentMethod,
        amount: -(num(p.tenderedAmount) > 0 ? num(p.tenderedAmount) : num(p.amount))
      })),
      taxBreakdown: {
        vatableSales: -num(order.variableSales),
        vatAmount: -num(order.vatAmount),
        vatExemptSales: -num(order.vatExemptSales),
        zeroRatedSales: -num(order.zeroRatedSales)
      },
      customerName: order.customerName || "",
      customerAddress: order.customerAddress || "",
      customerTin: order.customerTin || "",
      memo: voidRecord?.voidReason || order.voidReason || "",
      bilingual: opts?.bilingual,
      copyType: opts?.copyType,
      isReprint: opts?.isReprint
    };
    return data;
  }
  function mapShiftToXReadingData(shift, config, opts) {
    let parsedDetails = {};
    if (shift.shiftDetails) {
      try {
        parsedDetails = JSON.parse(shift.shiftDetails);
      } catch {
      }
    }
    const ALL_PAYMENT_METHODS = ["CASH", "GCASH", "DEBIT_CARD", "CREDIT_CARD", "MAYA", "GIFT_CHECK"];
    const payments = {};
    const voids = {};
    const returns = {};
    for (const m of ALL_PAYMENT_METHODS) {
      payments[m] = 0;
      voids[m] = 0;
      returns[m] = 0;
    }
    for (const [method, amount] of Object.entries(parsedDetails.payments || {})) {
      const upper = method.toUpperCase();
      if (upper in payments) payments[upper] = num(amount);
    }
    for (const [method, amount] of Object.entries(parsedDetails.voids || {})) {
      const upper = method.toUpperCase();
      if (upper in voids) voids[upper] = num(amount);
    }
    for (const [method, amount] of Object.entries(parsedDetails.returns || {})) {
      const upper = method.toUpperCase();
      if (upper in returns) returns[upper] = num(amount);
    }
    const totalPayments = Object.values(parsedDetails.payments || {}).reduce((s, a) => s + num(a), 0);
    const totalVoid = Object.values(parsedDetails.voids || {}).reduce((s, a) => s + num(a), 0);
    const totalReturn = Object.values(parsedDetails.returns || {}).reduce((s, a) => s + num(a), 0);
    return {
      config,
      reportDateTime: shift.endTime ? new Date(shift.endTime) : /* @__PURE__ */ new Date(),
      startDateTime: shift.startTime ? new Date(shift.startTime) : /* @__PURE__ */ new Date(),
      endDateTime: shift.endTime ? new Date(shift.endTime) : /* @__PURE__ */ new Date(),
      cashier: shift.cashierName || "",
      terminalNo: config.terminalNo || "",
      begSiNo: shift.begSiNo || "",
      endSiNo: shift.endSiNo || "",
      cashInAmount: num(shift.openingCash),
      payments,
      totalPayments,
      voids,
      totalVoid,
      returns,
      totalReturn,
      pickupCash: num(shift.pickupCash),
      cashOutAmount: num(shift.closingCash),
      shortOver: num(shift.cashDifference),
      isReprint: opts?.isReprint
    };
  }
  function mapDailySettlementToZReadingData(ds, config, opts) {
    const overrides = {};
    if (ds.snCode) overrides.snCode = ds.snCode;
    if (ds.minNo) overrides.minNo = ds.minNo;
    if (ds.terminalNo) overrides.terminalNo = ds.terminalNo;
    const mergedConfig = {
      ...config,
      ...overrides,
      storeName: ds.storeName || config.storeName,
      companyName: ds.companyName || config.companyName,
      tinNumber: ds.tinNumber || config.tinNumber,
      taxType: ds.taxType || config.taxType,
      address: ds.storeAddress || config.address
    };
    const businessDate = ds.businessDate ? new Date(ds.businessDate) : null;
    const normalizeStart = (raw) => {
      if (businessDate) {
        const d = new Date(businessDate);
        d.setHours(0, 0, 0, 0);
        return d;
      }
      return raw ? new Date(raw) : /* @__PURE__ */ new Date();
    };
    const normalizeEnd = (raw) => {
      if (businessDate) {
        const d = new Date(businessDate);
        d.setHours(23, 59, 59, 999);
        return d;
      }
      return raw ? new Date(raw) : /* @__PURE__ */ new Date();
    };
    return {
      config: mergedConfig,
      reportDateTime: ds.reportDateTime ? new Date(ds.reportDateTime) : /* @__PURE__ */ new Date(),
      startDateTime: normalizeStart(ds.startDateTime),
      endDateTime: normalizeEnd(ds.endDateTime),
      cashier: ds.cashier || ds.operatorName || "",
      terminalNo: mergedConfig.terminalNo || "",
      begSiNo: ds.begSiNo || "",
      endSiNo: ds.endSiNo || "",
      begVoidNo: ds.begVoidNo || "",
      endVoidNo: ds.endVoidNo || "",
      begReturnNo: ds.begReturnNo || "",
      endReturnNo: ds.endReturnNo || "",
      resetInvoiceNo: num(ds.resetInvoiceNo),
      resetAccumulatedSales: num(ds.resetAccumulatedSales),
      zCounterNo: num(ds.zCounterNo),
      presentAccumulatedSales: num(ds.presentAccumulatedSales),
      previousAccumulatedSales: num(ds.previousAccumulatedSales),
      salesForTheDay: num(ds.salesForTheDay),
      taxBreakdown: {
        vatableSales: num(ds.vatableSales),
        vatAmount: num(ds.vatAmount),
        vatExemptSales: num(ds.vatExemptSales),
        zeroRatedSales: num(ds.zeroRatedSales)
      },
      discounts: {
        sc: num(ds.scDiscount),
        pwd: num(ds.pwdDiscount),
        naac: num(ds.naacDiscount),
        sp: num(ds.spDiscount),
        mov: num(ds.movDiscount),
        other: num(ds.otherDiscount)
      },
      salesAdjustment: {
        void: num(ds.voidAmount),
        return: num(ds.returnAmount)
      },
      vatAdjustment: {
        scTrans: num(ds.scTrans),
        pwdTrans: num(ds.pwdTrans),
        naacTrans: num(ds.naacTrans),
        spTrans: num(ds.spTrans),
        movTrans: num(ds.movTrans),
        diplomaticTrans: num(ds.diplomaticTrans),
        regDiscTrans: num(ds.regDiscTrans),
        zeroRatedTrans: num(ds.zeroRatedTrans),
        vatOnReturn: num(ds.vatOnReturn),
        vatOnVoid: num(ds.vatOnVoid),
        otherAdjustments: num(ds.otherVatAdjustment)
      },
      grossAmount: num(ds.grossAmount),
      lessDiscount: num(ds.lessDiscount),
      lessReturn: num(ds.lessReturn),
      lessVoid: num(ds.lessVoid),
      lessVatAdjustment: num(ds.lessVatAdjustment),
      netAmount: num(ds.netAmount),
      isReprint: opts?.isReprint
    };
  }
  function generateOrderReceiptTexts(detail, config, opts) {
    if (!detail || !detail.order) {
      console.warn("[generateOrderReceiptTexts] detail or detail.order missing, returning empty");
      return [];
    }
    const order = detail.order;
    const orderTimeStr = String(order?.paidAt || order?.orderTime || "");
    const voidTimeStr = detail.voidRecord?.voidedAt ? String(detail.voidRecord.voidedAt) : order?.voidedAt ? String(order.voidedAt) : orderTimeStr;
    const hasGovDiscount = (detail.govPersons?.length ?? 0) > 0;
    const saleCopyTypes = hasGovDiscount ? ["Cashier Copy", "Customer Copy"] : [void 0];
    const saleItems = saleCopyTypes.map((copyType) => ({
      text: generateReceipt(
        "SALE_INVOICE" /* SALE_INVOICE */,
        mapOrderToSalesInvoiceData(
          detail,
          config,
          copyType ? { ...opts, copyType } : opts
        ),
        config
      ),
      time: orderTimeStr
    }));
    const headerConfig = mergeOrderHeaderConfig(order, config);
    const refundPacks = detail.refundRecords && detail.refundRecords.length > 0 ? detail.refundRecords : detail.refundRecord ? [{ refund: detail.refundRecord, items: detail.refundItems ?? [] }] : [];
    if (refundPacks.length > 0) {
      const returnItems = refundPacks.flatMap(
        (pack) => ["Cashier Copy", "Customer Copy"].map((copyType) => ({
          text: generateReceipt(
            "RETURN_TXN" /* RETURN_TXN */,
            mapOrderToReturnReceiptData(
              { ...detail, refundRecord: pack.refund, refundItems: pack.items ?? [] },
              headerConfig,
              { ...opts, copyType }
            ),
            headerConfig
          ),
          time: pack.refund?.refundTime ? String(pack.refund.refundTime) : orderTimeStr
        }))
      );
      return [...saleItems, ...returnItems];
    }
    if (detail.voidRecord) {
      const voidItems = ["Cashier Copy", "Customer Copy"].map((copyType) => ({
        text: generateReceipt(
          "VOID_TXN" /* VOID_TXN */,
          mapOrderToVoidReceiptData(detail, headerConfig, { ...opts, copyType }),
          headerConfig
        ),
        time: voidTimeStr
      }));
      return [...saleItems, ...voidItems];
    }
    return saleItems;
  }
  function generateShiftReceiptText(shift, config) {
    return generateReceipt(
      "X_READING" /* X_READING */,
      mapShiftToXReadingData(shift, config),
      config
    );
  }
  function mapShiftToCashInData(shift, config) {
    return {
      config,
      dateTime: shift.startTime ? new Date(shift.startTime) : /* @__PURE__ */ new Date(),
      terminalNo: config.terminalNo || "",
      operator: shift.cashierName || "",
      amount: num(shift.openingCash)
    };
  }
  function mapShiftToPickupCashData(shift, config) {
    const pickup = num(shift.pickupCash);
    return {
      config,
      dateTime: shift.endTime ? new Date(shift.endTime) : /* @__PURE__ */ new Date(),
      terminalNo: config.terminalNo || "",
      operator: shift.cashierName || "",
      // 模板 pickupCash.ts:72 会对 amount 再加负号前缀,这里传正数避免双重负号
      entries: pickup > 0 ? [{ sequence: 1, reason: "Pick Up Cash", amount: pickup }] : [],
      cashInAmount: num(shift.openingCash),
      totalPickupCash: -pickup
    };
  }
  function mapShiftToCashOutData(shift, config) {
    let cashSales = 0;
    if (shift.shiftDetails) {
      try {
        const details = JSON.parse(shift.shiftDetails);
        const payments = details?.payments ?? {};
        cashSales = num(payments.CASH ?? payments.cash ?? 0);
      } catch {
      }
    }
    const pickup = num(shift.pickupCash);
    return {
      config,
      dateTime: shift.endTime ? new Date(shift.endTime) : /* @__PURE__ */ new Date(),
      terminalNo: config.terminalNo || "",
      operator: shift.cashierName || "",
      pickupEntries: pickup > 0 ? [{ sequence: 1, reason: "Pick Up Cash", amount: pickup }] : [],
      cashIn: num(shift.openingCash),
      totalPickupCash: pickup,
      cashSales,
      // closing_cash 是 B 账策略后的 CASH OUT 值(已含随机 SHORT/OVER)
      // 与 AAPP 显示口径一致:输出正值(虽然 AAPP types.ts 注释写"负数",
      // 实际打印是正数,formatAmountWithComma 保留原符号)
      cashOut: num(shift.closingCash),
      shortOver: num(shift.cashDifference)
    };
  }
  function generateCashInText(shift, config) {
    return generateReceipt(
      "CASH_IN" /* CASH_IN */,
      mapShiftToCashInData(shift, config),
      config
    );
  }
  function generatePickupCashText(shift, config) {
    return generateReceipt(
      "PICK_UP_CASH" /* PICK_UP_CASH */,
      mapShiftToPickupCashData(shift, config),
      config
    );
  }
  function generateCashOutText(shift, config) {
    return generateReceipt(
      "CASH_OUT" /* CASH_OUT */,
      mapShiftToCashOutData(shift, config),
      config
    );
  }
  function generateDailySettlementReceiptText(ds, config) {
    const data = mapDailySettlementToZReadingData(ds, config);
    return generateReceipt("Z_READING" /* Z_READING */, data, data.config);
  }
  function buildDiscountRateGroupsFromGovPersons(govPersons) {
    const discountRateGroups = [];
    const groupMap = /* @__PURE__ */ new Map();
    for (const p of govPersons) {
      const key = p.discountType === "NAAC" || p.discountType === "MOV" ? "NAAC_MOV" : `${p.discountType}_${p.discountRate ?? 0}`;
      if (!groupMap.has(key)) groupMap.set(key, []);
      groupMap.get(key).push(p);
    }
    for (const [, persons] of groupMap) {
      const first = persons[0];
      discountRateGroups.push({
        type: first.discountType === "DIPLOMATIC" ? "DIPLOMATIC" : void 0,
        rate: num(first.discountRate),
        lessVat: roundTo(persons.reduce((s, p) => s + num(p.lessVatAmount), 0)),
        discountAmount: roundTo(persons.reduce((s, p) => s + num(p.govDiscountAmountNoTax), 0)),
        addVat: roundTo(persons.reduce((s, p) => s + num(p.addVatAmount), 0)),
        originalLessVat: roundTo(persons.reduce((s, p) => s + num(p.originalLessVatAmount), 0)),
        originalAddVat: roundTo(persons.reduce((s, p) => s + num(p.originalAddVatAmount), 0))
      });
    }
    return discountRateGroups;
  }
  function buildDiscountRateGroupsFromRels(rels) {
    const getGroupKey = (dt, rate) => {
      if (dt === "NAAC" || dt === "MOV") return "NAAC_MOV";
      if (dt === "SC" || dt === "PWD") return `SC_PWD_${rate ?? 0}`;
      return dt || "OTHER";
    };
    const typeMap = /* @__PURE__ */ new Map();
    for (const rel of rels) {
      const key = getGroupKey(rel.discountType, rel.discountRate);
      if (!typeMap.has(key)) typeMap.set(key, []);
      typeMap.get(key).push(rel);
    }
    return Array.from(typeMap.entries()).map(([, groupRels]) => {
      const seenItems = /* @__PURE__ */ new Set();
      let dedupOrigLessVat = 0;
      let dedupOrigAddVat = 0;
      for (const r of groupRels) {
        if (!seenItems.has(r.salesOrderItemId)) {
          seenItems.add(r.salesOrderItemId);
          dedupOrigLessVat += num(r.originalLessVatAmount);
          dedupOrigAddVat += num(r.originalAddVatAmount);
        }
      }
      const isExemptGroup = groupRels.some((r) => num(r.taxExemptShare) > 0);
      return {
        type: groupRels.some((r) => r.discountType === "DIPLOMATIC") ? "DIPLOMATIC" : void 0,
        rate: num(groupRels[0].discountRate),
        lessVat: roundTo(groupRels.reduce((s, r) => s + num(r.lessVatAmount), 0)),
        discountAmount: roundTo(groupRels.reduce((s, r) => s + num(r.govDiscountAmountNoTax), 0)),
        addVat: roundTo(groupRels.reduce((s, r) => s + num(r.addVatAmount), 0)),
        originalLessVat: roundTo(dedupOrigLessVat),
        originalAddVat: isExemptGroup ? roundTo(dedupOrigAddVat) : roundTo(dedupOrigLessVat)
      };
    });
  }
  function mapSalesItem(item) {
    const name = item.productName || "";
    const specs = item.specName ? [item.specName] : void 0;
    let displayName = name;
    if (specs && specs.length > 0) {
      const specsStr = specs.filter(Boolean).join(", ");
      if (specsStr) displayName = `${displayName}[${specsStr}]`;
    }
    let flavors;
    if (item.flavorSnapshot) {
      try {
        flavors = JSON.parse(item.flavorSnapshot);
      } catch {
      }
    }
    const qty = num(item.quantity);
    const rowTotal = num(item.rowTotal);
    const amount = grossItemAmount(item);
    const unitPrice = num(item.unitPrice) || (qty > 0 ? roundTo(amount / qty) : 0);
    return {
      name,
      displayName,
      quantity: qty,
      unitPrice,
      amount,
      taxType: item.taxFlag === "E" ? "E" : "V",
      specs,
      flavors,
      originalPrice: item.originalPrice ? num(item.originalPrice) : void 0,
      rowTotal,
      originalSubtotal: num(item.originalSubtotal),
      notes: item.notes
    };
  }
  function mapPayment(p) {
    const tendered = num(p.tenderedAmount);
    return {
      method: p.paymentMethod,
      amount: tendered > 0 ? tendered : num(p.amount),
      cardLastFour: p.cardNumber,
      reference: p.referenceNo,
      balanceBefore: p.balanceBefore ? num(p.balanceBefore) : void 0,
      balanceAfter: p.balanceAfter ? num(p.balanceAfter) : void 0
    };
  }
  function getTrxType(orderType) {
    switch (orderType) {
      case 1:
        return "Dine-in";
      case 2:
        return "Take out";
      case 3:
      case 4:
        return "Delivery";
      case 5:
        return "Pickup";
      case 6:
        return "Delivery";
      case 7:
        return "In-store";
      default:
        return "In-store";
    }
  }

  // src/services/receiptRender/txtOutput.ts
  var CHAR_PER_LINE = 48;
  function wrapLongLine(line, maxChars) {
    if (line.length <= maxChars) return line;
    const result = [];
    let remaining = line;
    while (remaining.length > maxChars) {
      result.push(remaining.slice(0, maxChars));
      remaining = remaining.slice(maxChars);
    }
    if (remaining) result.push(remaining);
    return result.join("\n");
  }
  function charDisplayWidth(char) {
    if (/[一-龥　-〿＀-￯]/.test(char)) return 2;
    return 1;
  }
  function textDisplayWidth(text) {
    let w = 0;
    for (const c of text) w += charDisplayWidth(c);
    return w;
  }
  var FONT_TAGS = /<font\s+size=['"][^'"]+['"]>|<\/font>/g;
  var BOLD_TAGS = /<b>|<\/b>/g;
  var BARCODE_TAG = /<barcode[^>]*>([\s\S]*?)<\/barcode>/g;
  var GENERIC_TAG = /<\/?[a-z][^>]*>/gi;
  function renderAlignmentMarkers(line) {
    if (!line) return line;
    const parts = [];
    const tokenRegex = /\[([LCR])\]/g;
    let lastIdx = 0;
    let lastMarker = null;
    let m;
    while ((m = tokenRegex.exec(line)) !== null) {
      const text = line.slice(lastIdx, m.index);
      if (text.length > 0 || lastMarker !== null) {
        parts.push({ marker: lastMarker, text });
      }
      lastMarker = m[1];
      lastIdx = m.index + m[0].length;
    }
    const tail = line.slice(lastIdx);
    parts.push({ marker: lastMarker, text: tail });
    if (lastMarker === null) return line;
    const hasRight = parts.some((p) => p.marker === "R");
    const hasCenter = parts.some((p) => p.marker === "C");
    if (hasCenter && !hasRight) {
      const joined = parts.map((p) => p.text).join("");
      const padding = Math.max(0, Math.floor((CHAR_PER_LINE - textDisplayWidth(joined)) / 2));
      return " ".repeat(padding) + joined;
    }
    if (hasRight) {
      let pivotIdx = -1;
      for (let i = 0; i < parts.length; i++) {
        if (parts[i].marker === "R") {
          pivotIdx = i;
          break;
        }
      }
      const leftParts = parts.slice(0, pivotIdx);
      const rightParts = parts.slice(pivotIdx);
      const leftStr = leftParts.map((p) => p.text).join("");
      const rightStr = rightParts.map((p) => p.text).join("");
      const leftW = textDisplayWidth(leftStr);
      const rightW = textDisplayWidth(rightStr);
      const gap = Math.max(1, CHAR_PER_LINE - leftW - rightW);
      return leftStr + " ".repeat(gap) + rightStr;
    }
    return parts.map((p) => p.text).join("");
  }
  function stripPrinterMarkers(input) {
    if (!input) return "";
    const stripped = input.replace(BARCODE_TAG, (_, code) => code ?? "").replace(FONT_TAGS, "").replace(BOLD_TAGS, "").replace(GENERIC_TAG, "");
    return stripped.split("\n").map((line) => renderAlignmentMarkers(line).replace(/\s+$/g, "")).flatMap((line) => wrapLongLine(line, CHAR_PER_LINE).split("\n")).filter((line) => line.length > 0).join("\n");
  }

  // src/services/printer/zSnapshot.ts
  var SNAPSHOT_FIELDS = [
    "storeName",
    "companyName",
    "storeAddress",
    "tinNumber",
    "taxType",
    "snCode",
    "minNo",
    "terminalNo"
  ];
  function toDateKey(raw) {
    if (!raw) {
      return null;
    }
    const s = String(raw);
    if (s.length < 10) {
      return null;
    }
    return s.slice(0, 10);
  }
  function buildDateToZSnapshotMap(dailySettlements) {
    const map = /* @__PURE__ */ new Map();
    if (!dailySettlements?.length) {
      return map;
    }
    for (const ds of dailySettlements) {
      const dateKey = toDateKey(ds.businessDate);
      if (!dateKey || map.has(dateKey)) {
        continue;
      }
      const snapshot = buildZSnapshotFromSettlement(ds);
      if (!snapshot) {
        continue;
      }
      map.set(dateKey, snapshot);
    }
    return map;
  }
  function buildZSnapshotFromSettlement(ds) {
    if (!ds) {
      return null;
    }
    const snapshot = {};
    for (const f of SNAPSHOT_FIELDS) {
      const v = ds[f];
      if (v) {
        snapshot[f] = String(v);
      }
    }
    const hasAny = SNAPSHOT_FIELDS.some((f) => snapshot[f]);
    return hasAny ? snapshot : null;
  }
  function getConfigForSnapshot(baseConfig, snapshot) {
    if (!snapshot) {
      return baseConfig;
    }
    return {
      ...baseConfig,
      ...snapshot.storeName ? { storeName: snapshot.storeName } : {},
      ...snapshot.companyName ? { companyName: snapshot.companyName } : {},
      ...snapshot.storeAddress ? { address: snapshot.storeAddress } : {},
      // 字段名映射
      ...snapshot.tinNumber ? { tinNumber: snapshot.tinNumber } : {},
      ...snapshot.taxType ? { taxType: snapshot.taxType } : {},
      ...snapshot.snCode ? { snCode: snapshot.snCode } : {},
      ...snapshot.minNo ? { minNo: snapshot.minNo } : {},
      ...snapshot.terminalNo ? { terminalNo: snapshot.terminalNo } : {}
    };
  }
  function getConfigForDate(baseConfig, dateStr, dateToZ) {
    const dateKey = dateStr ? toDateKey(dateStr) : null;
    const snapshot = dateKey ? dateToZ.get(dateKey) : void 0;
    return getConfigForSnapshot(baseConfig, snapshot);
  }

  // src/services/receiptRender/ejournalAssembler.ts
  function isReprintReceipt(extend) {
    if (!extend) return false;
    try {
      const parsed = JSON.parse(extend);
      return parsed?.isReprint === true || parsed?.isReprint === "true";
    } catch {
      return false;
    }
  }
  function normalizeSi(s) {
    if (!s) return "";
    const trimmed = s.trim();
    const stripped = trimmed.replace(/^0+/, "");
    return stripped === "" ? "0" : stripped;
  }
  function extractOriginalSiFromReceipt(txt, receiptType) {
    if (receiptType === "RETURN_TXN") {
      const m = txt.match(/^SI#\s*0*(\d+)/m);
      return m ? m[1] : null;
    }
    if (receiptType === "VOID_TXN") {
      const m = txt.match(/Sales SI#\s*0*(\d+)/);
      return m ? m[1] : null;
    }
    return null;
  }
  var OPERATIONAL_RECEIPT_TYPES = /* @__PURE__ */ new Set([
    "KITCHEN_DOCKET",
    "ORDER_SLIP",
    "CHANGE_TABLE",
    "VOID_DISH"
  ]);
  var CROSS_DAY_VERBATIM_TYPES = /* @__PURE__ */ new Set(["RETURN_TXN", "VOID_TXN"]);
  function createEjournalAssembler(baseConfig, options) {
    const { startDate, endDate } = options;
    const renderOpts = {
      bilingual: options.bilingual ?? false,
      isReprint: options.isReprint ?? false
    };
    const tasks = [];
    const orderSiNumbers = /* @__PURE__ */ new Set();
    let dateToZ = /* @__PURE__ */ new Map();
    let extrasHandled = false;
    let pendingReceipts = [];
    const stats = {
      taskCount: 0,
      orderCount: 0,
      missingDetailCount: 0,
      renderFailureCount: 0
    };
    function addShiftTasks(list) {
      for (const shift of list.shiftRecords || []) {
        const perDateConfig = getConfigForDate(
          baseConfig,
          shift.startTime || shift.endTime,
          dateToZ
        );
        const startT = shift.startTime || shift.endTime || "";
        const endT = shift.endTime || shift.startTime || "";
        tasks.push({
          time: startT,
          filterDate: startT.slice(0, 10),
          seq: 0,
          render: () => stripPrinterMarkers(generateCashInText(shift, perDateConfig))
        });
        if ((Number(shift.pickupCash) || 0) > 0) {
          tasks.push({
            time: endT,
            filterDate: endT.slice(0, 10),
            seq: 2,
            render: () => stripPrinterMarkers(generatePickupCashText(shift, perDateConfig))
          });
        }
        tasks.push({
          time: endT,
          filterDate: endT.slice(0, 10),
          seq: 3,
          render: () => stripPrinterMarkers(generateCashOutText(shift, perDateConfig))
        });
        tasks.push({
          time: endT,
          filterDate: endT.slice(0, 10),
          seq: 4,
          render: () => stripPrinterMarkers(
            generateShiftReceiptText(shift, perDateConfig, renderOpts)
          )
        });
      }
    }
    function addSettlementTasks(list) {
      for (const ds of list.dailySettlements || []) {
        const perDateConfig = getConfigForDate(baseConfig, ds.businessDate, dateToZ);
        tasks.push({
          time: ds.reportDateTime || ds.businessDate || "",
          filterDate: (ds.businessDate || "").slice(0, 10),
          seq: 5,
          render: () => stripPrinterMarkers(
            generateDailySettlementReceiptText(ds, perDateConfig, renderOpts)
          )
        });
      }
    }
    function addReceiptTasks() {
      for (const r of pendingReceipts) {
        if (OPERATIONAL_RECEIPT_TYPES.has(r.receiptType)) continue;
        const isReprint = isReprintReceipt(r.extend);
        const isCrossDayCandidate = CROSS_DAY_VERBATIM_TYPES.has(r.receiptType);
        if (!isReprint && !isCrossDayCandidate) continue;
        if (!r.printTxt || !r.printTxt.trim()) continue;
        if (isCrossDayCandidate && !isReprint) {
          const si = normalizeSi(extractOriginalSiFromReceipt(r.printTxt, r.receiptType));
          if (si && si !== "0" && orderSiNumbers.has(si)) continue;
        }
        const printTime = r.printTime || "";
        tasks.push({
          time: printTime,
          filterDate: printTime.slice(0, 10),
          seq: 1,
          render: () => stripPrinterMarkers(r.printTxt || "")
        });
      }
    }
    return {
      addPage(list, details) {
        if (!extrasHandled && (list.dailySettlements?.length || list.shiftRecords?.length || list.receipts?.length)) {
          dateToZ = buildDateToZSnapshotMap(list.dailySettlements);
          addShiftTasks(list);
          addSettlementTasks(list);
          pendingReceipts = list.receipts || [];
          extrasHandled = true;
        }
        for (const header of list.orders || []) {
          const si = normalizeSi(header.siNumber);
          if (si && si !== "0") orderSiNumbers.add(si);
          const detail = details[header.id];
          if (!detail || !detail.order) {
            stats.missingDetailCount++;
            continue;
          }
          stats.orderCount++;
          try {
            const orderDateStr = detail.order.businessDate || detail.order.paidAt || detail.order.orderTime || header.businessDate;
            const perDateConfig = getConfigForDate(baseConfig, orderDateStr, dateToZ);
            generateOrderReceiptTexts(detail, perDateConfig, renderOpts).forEach(
              ({ text, time }) => {
                tasks.push({
                  time,
                  filterDate: time.slice(0, 10),
                  seq: 1,
                  render: () => stripPrinterMarkers(text)
                });
              }
            );
          } catch {
            stats.renderFailureCount++;
          }
        }
      },
      finish() {
        addReceiptTasks();
        const inDateRange = (t) => {
          if (!t || t.length < 10) return true;
          const day = t.slice(0, 10);
          return day >= startDate && day <= endDate;
        };
        const filtered = tasks.filter((t) => inDateRange(t.filterDate));
        filtered.sort((a, b) => {
          if (a.time < b.time) return -1;
          if (a.time > b.time) return 1;
          return a.seq - b.seq;
        });
        stats.taskCount = filtered.length;
        return filtered.map((t) => {
          try {
            return `
   
${t.render()}

`;
          } catch {
            stats.renderFailureCount++;
            return "";
          }
        }).join("");
      },
      getStats() {
        return { ...stats };
      }
    };
  }
  return __toCommonJS(standalone_exports);
})();
