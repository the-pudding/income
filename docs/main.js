parcelRequire=function(e,r,t,n){var i,o="function"==typeof parcelRequire&&parcelRequire,u="function"==typeof require&&require;function f(t,n){if(!r[t]){if(!e[t]){var i="function"==typeof parcelRequire&&parcelRequire;if(!n&&i)return i(t,!0);if(o)return o(t,!0);if(u&&"string"==typeof t)return u(t);var c=new Error("Cannot find module '"+t+"'");throw c.code="MODULE_NOT_FOUND",c}p.resolve=function(r){return e[t][1][r]||r},p.cache={};var l=r[t]=new f.Module(t);e[t][0].call(l.exports,p,l,l.exports,this)}return r[t].exports;function p(e){return f(p.resolve(e))}}f.isParcelRequire=!0,f.Module=function(e){this.id=e,this.bundle=f,this.exports={}},f.modules=e,f.cache=r,f.parent=o,f.register=function(r,t){e[r]=[function(e,r){r.exports=t},{}]};for(var c=0;c<t.length;c++)try{f(t[c])}catch(e){i||(i=e)}if(t.length){var l=f(t[t.length-1]);"object"==typeof exports&&"undefined"!=typeof module?module.exports=l:"function"==typeof define&&define.amd?define(function(){return l}):n&&(this[n]=l)}if(parcelRequire=f,i)throw i;return f}({"or4r":[function(require,module,exports) {
var global = arguments[3];
var t=arguments[3],e="Expected a function",n=NaN,r="[object Symbol]",i=/^\s+|\s+$/g,o=/^[-+]0x[0-9a-f]+$/i,u=/^0b[01]+$/i,f=/^0o[0-7]+$/i,c=parseInt,a="object"==typeof t&&t&&t.Object===Object&&t,s="object"==typeof self&&self&&self.Object===Object&&self,v=a||s||Function("return this")(),l=Object.prototype,p=l.toString,b=Math.max,m=Math.min,y=function(){return v.Date.now()};function d(t,n,r){var i,o,u,f,c,a,s=0,v=!1,l=!1,p=!0;if("function"!=typeof t)throw new TypeError(e);function d(e){var n=i,r=o;return i=o=void 0,s=e,f=t.apply(r,n)}function g(t){var e=t-a;return void 0===a||e>=n||e<0||l&&t-s>=u}function O(){var t=y();if(g(t))return x(t);c=setTimeout(O,function(t){var e=n-(t-a);return l?m(e,u-(t-s)):e}(t))}function x(t){return c=void 0,p&&i?d(t):(i=o=void 0,f)}function T(){var t=y(),e=g(t);if(i=arguments,o=this,a=t,e){if(void 0===c)return function(t){return s=t,c=setTimeout(O,n),v?d(t):f}(a);if(l)return c=setTimeout(O,n),d(a)}return void 0===c&&(c=setTimeout(O,n)),f}return n=h(n)||0,j(r)&&(v=!!r.leading,u=(l="maxWait"in r)?b(h(r.maxWait)||0,n):u,p="trailing"in r?!!r.trailing:p),T.cancel=function(){void 0!==c&&clearTimeout(c),s=0,i=a=o=c=void 0},T.flush=function(){return void 0===c?f:x(y())},T}function j(t){var e=typeof t;return!!t&&("object"==e||"function"==e)}function g(t){return!!t&&"object"==typeof t}function O(t){return"symbol"==typeof t||g(t)&&p.call(t)==r}function h(t){if("number"==typeof t)return t;if(O(t))return n;if(j(t)){var e="function"==typeof t.valueOf?t.valueOf():t;t=j(e)?e+"":e}if("string"!=typeof t)return 0===t?t:+t;t=t.replace(i,"");var r=u.test(t);return r||f.test(t)?c(t.slice(2),r?2:8):o.test(t)?n:+t}module.exports=d;
},{}],"WEtf":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var r={android:function(){return navigator.userAgent.match(/Android/i)},blackberry:function(){return navigator.userAgent.match(/BlackBerry/i)},ios:function(){return navigator.userAgent.match(/iPhone|iPad|iPod/i)},opera:function(){return navigator.userAgent.match(/Opera Mini/i)},windows:function(){return navigator.userAgent.match(/IEMobile/i)},any:function(){return r.android()||r.blackberry()||r.ios()||r.opera()||r.windows()}},e=r;exports.default=e;
},{}],"hZBy":[function(require,module,exports) {
"use strict";function e(e){return r(e)||n(e)||t()}function t(){throw new TypeError("Invalid attempt to spread non-iterable instance")}function n(e){if(Symbol.iterator in Object(e)||"[object Arguments]"===Object.prototype.toString.call(e))return Array.from(e)}function r(e){if(Array.isArray(e)){for(var t=0,n=new Array(e.length);t<e.length;t++)n[t]=e[t];return n}}function o(e){return document.querySelector(e)}function s(t){return e((arguments.length>1&&void 0!==arguments[1]?arguments[1]:document).querySelectorAll(t))}function c(t,n){return e(t.querySelectorAll(n))}function a(e,t){e.classList?e.classList.remove(t):e.className=e.className.replace(new RegExp("(^|\\b)".concat(t.split(" ").join("|"),"(\\b|$)"),"gi")," ")}function l(e,t){e.classList?e.classList.add(t):e.className="".concat(e.className," ").concat(t)}function i(e,t){return e.classList?e.classList.contains(t):new RegExp("(^| )".concat(t,"( |$)"),"gi").test(e.className)}function u(e,t){t=t||0;var n=e.getBoundingClientRect().top+t,r=(window.pageYOffset||document.documentElement.scrollTop)+n;window.scrollTo(0,r)}Object.defineProperty(exports,"__esModule",{value:!0}),exports.select=o,exports.selectAll=s,exports.find=c,exports.removeClass=a,exports.addClass=l,exports.hasClass=i,exports.jumpTo=u;
},{}],"U9xJ":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=t;var e=require("./dom");function t(){(0,e.selectAll)("[target='_blank']").forEach(function(e){return e.setAttribute("rel","noopener")})}
},{"./dom":"hZBy"}],"WtE3":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var t,e,a,r,s,l=d3.select(".guessMovement"),n=l.select(".guess__figure"),i=n.select("svg"),o=n.select(".instruction2"),c=n.select(".warningMsg"),u=n.select(".interpretText"),d=l.select(".submitBtn"),h=l.select(".answer__figure"),f=h.select("svg"),v=[{levels:0,share:.6},{levels:1,share:11.1},{levels:2,share:44.2},{levels:3,share:29.5},{levels:4,share:14.5}],p=[{levels:0,share:0},{levels:1,share:0},{levels:2,share:0},{levels:3,share:0},{levels:4,share:0}],m={top:20,bottom:50,left:46,right:0},g=0,y=0,b=d3.scaleBand().domain([0,1,2,3,4]).paddingInner(.2).paddingOuter(.6),x=d3.scaleLinear().domain([0,100]);function w(){g=n.node().offsetWidth-m.left-m.right,y=n.node().offsetHeight-m.top-m.bottom,b.range([0,g]),x.range([y,0]),(a=i.attr("width",g+m.left+m.right).attr("height",y+m.top+m.bottom).append("g").attr("transform","translate("+m.left+","+m.top+")")).append("g").attr("class","axis axis--x").attr("transform","translate(0,"+y+")").call(d3.axisBottom(b)).append("text").attr("class","axisTitle").attr("x",g/2).attr("y",m.bottom-2).text("Furthest Quintiles Moved").style("fill","#000"),a.append("g").attr("class","axis axis--y").attr("transform","translate(-"+m.left+", 0)").call(d3.axisRight(x).ticks(5).tickFormat(function(t){return 100===t?t+"% of families":t+"%"}).tickSize(g+m.left)).selectAll("text").attr("x",0).attr("dy",14).style("text-anchor","start"),t=d3.brushY().extent(function(t,e){return[[b(t.levels),0],[b(t.levels)+b.bandwidth(),y]]}).on("brush",B).on("end",k),e=a.selectAll(".brush").data(p).enter().append("g").attr("class","brush").append("g").call(t).call(t.move,function(t){return[t.share,0].map(x)}).call(function(t){return t.select(".overlay").datum({type:"selection"}).on("mousedown touchstart",M)}),d3.selectAll(".selection").style("fill","#124653").style("fill-opacity","0.8"),a.selectAll(".handle--s").remove(),a.selectAll(".selection").attr("cursor","auto"),a.selectAll(".overlay").attr("cursor","auto"),r=i.append("g").attr("transform","translate("+m.left+","+m.top+")").attr("class","answer noDisplay"),(s=r.selectAll(".answerBar").data(v).enter().append("g")).append("rect").attr("class","answerBar").attr("x",function(t){return b(t.levels)}).attr("y",function(t){return y}).attr("width",b.bandwidth()).attr("height",0),s.append("text").attr("class","answerBarLabel").attr("x",function(t){return b(t.levels)+b.bandwidth()/2}).attr("y",function(t){return x(t.share)-10}).text(function(t){return t.share+"%"}).style("opacity",0)}function A(){g=n.node().offsetWidth-m.left-m.right,y=g<470?.7*g-m.top-m.bottom:.54*g-m.top-m.bottom,b.range([0,g]),x.range([y,0]),i.attr("width",g+m.left+m.right).attr("height",y+m.top+m.bottom),a.selectAll(".axis.axis--x").attr("transform","translate(0,"+y+")").call(d3.axisBottom(b)).select(".axisTitle").attr("x",g/2).attr("y",m.bottom-2),a.selectAll(".axis.axis--y").attr("transform","translate(-"+m.left+", 0)").call(d3.axisRight(x).ticks(5).tickFormat(function(t){return 100===t?t+"% of families":t+"%"}).tickSize(g+m.left)).selectAll("text").attr("x",0),t.extent(function(t,e){return[[b(t.levels),0],[b(t.levels)+b.bandwidth(),y]]}),e.call(t).call(t.move,function(t){return[t.share,0].map(x)});var l=!r.classed("noDisplay");s.selectAll(".answerBar").attr("x",function(t){return b(t.levels)}).attr("y",function(t){return l?x(t.share):y}).attr("width",b.bandwidth()).attr("height",function(t){return l?y-x(t.share):0}),s.selectAll(".answerBarLabel").attr("x",function(t){return b(t.levels)+b.bandwidth()/2}).attr("y",function(t){return x(t.share)-10})}function B(){if(d3.event.sourceEvent&&"brush"!==d3.event.sourceEvent.type&&d3.event.selection){var e=d3.event.selection.map(x.invert),a=Math.ceil(e[0]),r=d3.select(this).select(".selection"),s=r.datum().levels,l=(r.datum().share,d3.sum(p.filter(function(t){return t.levels!==s}),function(t){return t.share}));a+l>100?(p[s].share=100-l,d3.select(this).call(t.move,function(t){return[100-l,0].map(x)}),o.style("visibility","visible")):(p[s].share=a,d3.select(this).call(t.move,function(t){return[a,0].map(x)})),_()}}function k(){d3.event.sourceEvent&&"brush"!==d3.event.sourceEvent.type&&(d3.event.selection||e.call(t.move,function(t){return[t.share,0].map(x)}),E())}function M(){var e=d3.mouse(this)[1];d3.select(this.parentNode).call(t.move,[e,0])}function _(){var t=d3.sum(p,function(t){return t.share}),e=100-Math.round(t);if(Math.abs(e)<1){c.html("You must decrease a bar to increase another"),d.attr("aria-disabled",!1),o.style("visibility","visible")}else{var a="Keep going! <strong>".concat(e,"%</strong> of families are still unaccounted");c.html(a),c.style("visibility","visible"),d.attr("aria-disabled",!0),o.style("visibility","hidden")}}function E(){u.text("According to you, roughly equal numbers of families move a lot as do those that move a little.")}function L(){r.classed("noDisplay",!1),i.append("rect").attr("x",m.left).attr("y",m.top).attr("width",g).attr("height",y).style("fill","rgba(255, 255, 255, 0"),d.attr("aria-disabled",!0),d3.selectAll(".answerBar").transition(1e3).delay(function(t,e){return 500*e}).attr("y",function(t){return x(t.share)}).attr("height",function(t){return y-x(t.share)}).end().then(function(){return d3.selectAll(".answerBarLabel").style("opacity",1)})}function z(){w(),d.on("click",L)}var D={init:z,resize:A};exports.default=D;
},{}],"RZIL":[function(require,module,exports) {
var define;
var e;!function(n){"function"==typeof e&&e.amd?e(n):"undefined"!=typeof module&&module.exports?module.exports=n():window.enterView=n.call(this)}(function(){return function(e){function n(){var e=document.documentElement.clientHeight,n=window.innerHeight||0;A=Math.max(e,n)}function t(){x=!1;var e=function(){if(w&&"number"==typeof w){var e=Math.min(Math.max(0,w),1);return A-e*A}return A}();(y=y.filter(function(n){var t=n.getBoundingClientRect(),o=t.top,r=t.bottom,i=t.height,s=o<e,u=r<e;if(s&&!n.__ev_entered){if(_(n),n.__ev_progress=0,l(n,n.__ev_progress),p)return!1}else!s&&n.__ev_entered&&(n.__ev_progress=0,l(n,n.__ev_progress),f(n));if(s&&!u){var d=(e-o)/i;n.__ev_progress=Math.min(1,Math.max(0,d)),l(n,n.__ev_progress)}return s&&u&&1!==n.__ev_progress&&(n.__ev_progress=1,l(n,n.__ev_progress)),n.__ev_entered=s,!0})).length||window.removeEventListener("scroll",o,!0)}function o(){x||(x=!0,h(t))}function r(){n(),t()}function i(){n(),t()}function s(e){for(var n=e.length,t=[],o=0;o<n;o+=1)t.push(e[o]);return t}function u(){y=function(e){var n=arguments.length>1&&void 0!==arguments[1]?arguments[1]:document;return"string"==typeof e?s(n.querySelectorAll(e)):e instanceof NodeList?s(e):e instanceof Array?e:void 0}(d)}var d=e.selector,a=e.enter,_=void 0===a?function(){}:a,c=e.exit,f=void 0===c?function(){}:c,v=e.progress,l=void 0===v?function(){}:v,m=e.offset,w=void 0===m?0:m,g=e.once,p=void 0!==g&&g,h=null,x=!1,y=[],A=0;d?(u(),y&&y.length?(h=window.requestAnimationFrame||window.webkitRequestAnimationFrame||window.mozRequestAnimationFrame||window.msRequestAnimationFrame||function(e){return setTimeout(e,1e3/60)},window.addEventListener("resize",r,!0),window.addEventListener("scroll",o,!0),window.addEventListener("load",i,!0),r(),t()):console.error("no selector elements found")):console.error("must pass a selector")}});
},{}],"xZJw":[function(require,module,exports) {
"use strict";function t(t){return new Promise(function(e,n){var r=t.split(".").pop();"csv"===r?d3.csv("assets/data/".concat(t)).then(e).catch(n):"json"===r?d3.json("assets/data/".concat(t)).then(e).catch(n):n(new Error("unsupported file type for: ".concat(t)))})}function e(e){if("string"==typeof e)return t(e);var n=e.map(t);return Promise.all(n)}Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=e;
},{}],"Gtgh":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var t=n(require("enter-view")),e=n(require("./load-data"));function n(t){return t&&t.__esModule?t:{default:t}}var i,r,l,o,a,d,u,c,s,f,p,h,g,m=d3.select(".familyLines"),w=m.select(".family__figure"),q=w.select(".canvasContainer"),v=w.select("svg.familyBars_svg"),x=m.select(".family_smallMultiples__figure"),b=x.select("svg.familyBars_white_svg"),y=x.select("svg.familyBars_black_svg"),M=x.select("svg.familyBars_latino_svg"),L=x.select("svg.familyBars_asian_svg"),_=x.select("svg.familyBars_multi_svg"),T=x.select("svg.familyBars_native_svg"),U=m.select(".replay"),B=m.select(".skipToEnd"),R=window.devicePixelRatio?Math.min(window.devicePixelRatio,2):1,C={top:40,bottom:24,left:114,right:5},A={left:0,right:55},k=0,E=0,F=0,S=0,P=0,I=10,O=1e3,W=20,j=1,N=["Lower","Lower Middle","Middle","Upper Middle","Upper"],z=d3.scaleLinear(),G=d3.scaleLinear().domain([0,100]),H=d3.scaleLinear().domain([0,20]),Q=d3.scaleLinear(),Y=[100,500,1e3,5e3,1e4,2e4,3e4,43e3],D=Y.slice(),J=d3.scaleBand().domain(N),K=d3.scaleBand().domain(N),V=d3.scaleOrdinal().domain(N).range(["#FFBFBF","#FF8850","#FEE074","#00A08F","#124653"]),X=d3.format(",.0f"),Z=[{quintile:"Lower",n:0},{quintile:"Lower Middle",n:0},{quintile:"Middle",n:0},{quintile:"Upper Middle",n:0},{quintile:"Upper",n:0}],$=[{quintile:"Lower",n:9109},{quintile:"Lower Middle",n:17855},{quintile:"Middle",n:26135},{quintile:"Upper Middle",n:28805},{quintile:"Upper",n:23702}],tt=[{quintile:"Lower",n:12439},{quintile:"Lower Middle",n:14583},{quintile:"Middle",n:13305},{quintile:"Upper Middle",n:9156},{quintile:"Upper",n:3963}],et=[{quintile:"Lower",n:807},{quintile:"Lower Middle",n:1444},{quintile:"Middle",n:1581},{quintile:"Upper Middle",n:1134},{quintile:"Upper",n:661}],nt=[{quintile:"Lower",n:55},{quintile:"Lower Middle",n:124},{quintile:"Middle",n:199},{quintile:"Upper Middle",n:167},{quintile:"Upper",n:219}],it=[{quintile:"Lower",n:418},{quintile:"Lower Middle",n:615},{quintile:"Middle",n:918},{quintile:"Upper Middle",n:851},{quintile:"Upper",n:578}],rt=[{quintile:"Lower",n:88},{quintile:"Lower Middle",n:95},{quintile:"Middle",n:114},{quintile:"Upper Middle",n:97},{quintile:"Upper",n:55}];function lt(){k=(q.node().getBoundingClientRect().width-C.left-C.right)*R,E=(v.node().getBoundingClientRect().width-A.left-A.right)*R,F=b.node().getBoundingClientRect().width-A.left-A.right,S=(.81*w.node().getBoundingClientRect().width-C.top-C.bottom)*R,P=1.5*F,i=q.append("canvas").attr("class","background").attr("width",k+(C.left+C.right)*R).attr("height",S+(C.top+C.bottom)*R).style("width","".concat(k/R+C.left+C.right,"px")).style("height","".concat(S/R+C.top+C.bottom,"px")),r=i.node().getContext("2d"),l=q.append("canvas").attr("class","line").attr("width",k+(C.left+C.right)*R).attr("height",S+(C.top+C.bottom)*R).style("width","".concat(k/R+C.left+C.right,"px")).style("height","".concat(S/R+C.top+C.bottom,"px")),o=l.node().getContext("2d"),z.range([C.left*R,C.left*R+k]),G.range([S+C.top*R,C.top*R]),H.range([0,E/R]),Q.range([0,F]),J.range([S/R,0]),K.range([P,0]),g=d3.line().x(function(t){return xt(z(t.year))}).y(function(t){return xt(G(t.pctile))}).curve(d3.curveStepAfter).context(o),ot(v,Z,E/R,S/R,H,J,!1),ot(b,$,F,P,Q,K,!0),ot(y,tt,F,P,Q,K,!0),ot(M,et,F,P,Q,K,!0),ot(L,nt,F,P,Q,K,!0),ot(_,it,F,P,Q,K,!0),ot(T,rt,F,P,Q,K,!0)}function ot(t,e,n,i,r,l,o){o&&r.domain([0,d3.max(e,function(t){return t.n})]),a=t.attr("width",n+A.left+A.right).attr("height",i+C.top+C.bottom).append("g").attr("transform","translate(".concat(A.left,",").concat(C.top,")")),d=a.selectAll(".bar_group").data(e).enter().append("g").attr("class","bar_group"),u=d.append("rect").attr("class","bar").attr("x",0).attr("y",function(t){return l(t.quintile)}).attr("width",function(t){return r(t.n)}).attr("height",l.bandwidth()).style("fill",function(t){return V(t.quintile)}),c=d.append("text").attr("class","label").attr("x",function(t){return o?r(t.n)+5:5}).attr("y",function(t){return l(t.quintile)+l.bandwidth()/2}).attr("dy",".5em").text(function(t){return X(t.n)}),t.append("text").attr("x",A.left).attr("y","1em").text("Years in Each Quintile"),t.append("text").attr("x",A.left).attr("y","2.3em").text("(across x families)")}function at(){k=(q.node().getBoundingClientRect().width-C.left-C.right)*R,E=(v.node().getBoundingClientRect().width-A.left-A.right)*R,S=q.node().getBoundingClientRect().width<=430?(q.node().getBoundingClientRect().height-C.top-C.bottom)*R:(.81*w.node().getBoundingClientRect().width-C.top-C.bottom)*R,z.range([C.left*R,C.left*R+k]),G.range([S+C.top*R,C.top*R]),H.range([0,E/R]),J.range([S/R,0]),g=d3.line().x(function(t){return xt(z(t.year))}).y(function(t){return xt(G(t.pctile))}).curve(d3.curveStepAfter).context(o),i.attr("width",k+(C.left+C.right)*R).attr("height",S+(C.top+C.bottom)*R).style("width","".concat(k/R+C.left+C.right,"px")).style("height","".concat(S/R+C.top+C.bottom,"px")),l.attr("width",k+(C.left+C.right)*R).attr("height",S+(C.top+C.bottom)*R).style("width","".concat(k/R+C.left+C.right,"px")).style("height","".concat(S/R+C.top+C.bottom,"px")),a.attr("width",E/R+A.left+A.right).attr("height",S/R+C.top+C.bottom),r.clearRect(0,0,i.attr("width"),i.attr("height")),ft(),u.attr("y",function(t){return J(t.quintile)}).attr("width",function(t){return H(t.n)}).attr("height",J.bandwidth()),c.attr("x",function(t){return H(t.n)+5}).attr("y",function(t){return J(t.quintile)+J.bandwidth()/2})}function dt(){var t=p[0].values,e=0;!function n(){if(e<t.length){var i=e>0?t[e-1]:t[0],r=t[e],l=xt(z(i.year)),a=xt(z(r.year)),d=xt(G(i.pctile)),u=xt(G(r.pctile)),c=(a-l)/(a-l+Math.abs(u-d)),s=l,p=d;f=d3.timer(function(t){var e=Math.min(1,t/O),i=l*(1-e/c)+a*(e/c),r=d*((1-e)/(1-c))+u*((e-c)/(1-c));o.beginPath(),e<c?(o.moveTo(s,d),o.lineTo(i,d),s=i,p=d):(s<a&&i>=a&&(o.moveTo(s,d),o.lineTo(a,d)),o.moveTo(a,p),o.lineTo(a,r),s=a,p=r),o.lineWidth=2,o.strokeStyle="rgba(0, 0, 0, 1)",o.stroke(),1===e&&(f.stop(),n())})}pt(t.slice(e,e+1),O);e++}()}function ut(){f.stop(),j<h&&(j<I?(ct(p,j,O),s=setTimeout(ut,O)):(ct(p,j,W),s=setTimeout(ut,W))),j++}function ct(t,e,n){if(o.clearRect(0,0,l.attr("width"),l.attr("height")),e<I)for(var i=e-1;i>=0;i--)st(t[i].values,.1);st(t[e].values,1),pt(t[e].values,n)}function st(t,e){o.beginPath(),g(t),o.lineWidth=2,o.strokeStyle="rgba(0, 0, 0, ".concat(e,")"),o.stroke()}function ft(){r.font="".concat(14*R,'px "National 2 Narrow Web"'),r.fillStyle="#828282",r.textAlign="end",r.textBaseline="bottom",r.fillText("Higher",42,C.top*R+20),r.fillText("income",42,C.top*R+34),r.fillText("Lower",42,C.top*R+S-24),r.fillText("income",42,C.top*R+S-10),r.beginPath(),r.moveTo(37,C.top*R),r.lineTo(42,C.top*R+5),r.lineTo(32,C.top*R+5),r.fill(),r.beginPath(),r.moveTo(37,C.top*R+S),r.lineTo(42,C.top*R+S-5),r.lineTo(32,C.top*R+S-5),r.fill(),r.textAlign="start",r.fillText("Income in first year",C.left*R,C.top*R+S+C.bottom*R-2),r.textAlign="end",r.fillText("Income in last year",C.left*R+k,C.top*R+S+C.bottom*R-2),N.forEach(function(t,e){var n=r.createLinearGradient(C.left*R,0,i.attr("width"),0);n.addColorStop(0,"white"),n.addColorStop(1,V(t)),r.fillStyle=n,r.fillRect(C.left*R,G(20*(e+1)),k,S/5)});var t=new Image;t.src="assets/images/familyLines_yAxis.png",t.onload=function(){r.drawImage(t,50,C.top*R,.1*S,S)}}function pt(t,e){gt(t),ht();var n=v.selectAll(".bar_group");n.data(Z),n.selectAll(".bar").transition().duration(e).attr("width",function(t){return H(t.n)}),n.selectAll(".label").transition().duration(e).attr("x",function(t){return H(t.n)+5}).text(function(t){return X(t.n)})}function ht(){d3.max(Z,function(t){return t.n})>H.domain()[1]&&(H.domain([0,D[0]]),D.shift())}function gt(t){var e=mt(t);Z.forEach(function(t){"Lower"===t.quintile?t.n+=e.Lower:"Lower Middle"==t.quintile?t.n+=e["Lower Middle"]:"Middle"==t.quintile?t.n+=e.Middle:"Upper Middle"==t.quintile?t.n+=e["Upper Middle"]:"Upper"==t.quintile&&(t.n+=e.Upper)})}function mt(t){var e={};return N.forEach(function(t){return e[t]=0}),t.forEach(function(t){"1"===t.quintile?e.Lower++:"2"===t.quintile?e["Lower Middle"]++:"3"===t.quintile?e.Middle++:"4"===t.quintile?e["Upper Middle"]++:"5"===t.quintile&&e.Upper++}),e}function wt(t){return Object.keys(t).map(function(e){return{quintile:e,n:t[e]}})}function qt(){f.stop(),clearTimeout(s),o.clearRect(0,0,l.attr("width"),l.attr("height")),H.domain([0,20]),D=Y.slice(),Z=[{quintile:"Lower",n:0},{quintile:"Lower Middle",n:0},{quintile:"Middle",n:0},{quintile:"Upper Middle",n:0},{quintile:"Upper",n:0}];var t=v.selectAll(".bar_group");t.data(Z),t.select(".bar").transition().duration(500).attr("width",function(t){return H(t.n)}),t.select(".label").transition().duration(500).attr("x",5).text(function(t){return X(t.n)}),j=1;var e=p[0].values.length;dt(),s=setTimeout(ut,e*O)}function vt(t){f.stop(),clearTimeout(s),o.clearRect(0,0,l.attr("width"),l.attr("height")),H.domain([0,Y[Y.length-1]]);var e=v.selectAll(".bar_group");e.data(t),e.select(".bar").transition().duration(500).attr("width",function(t){return H(t.n)}),e.select(".label").transition().duration(500).attr("x",function(t){return H(t.n)+5}).text(function(t){return X(t.n)})}function xt(t){return Math.round(t)}function bt(){lt(),(0,e.default)("line_chart_data.csv").then(function(e){p=d3.nest().key(function(t){return t.id}).entries(e),h=p.length,z.domain([0,d3.max(e,function(t){return+t.year})]).nice();var n=wt(mt(e));ft();var i=p[0].values.length;(0,t.default)({selector:".family__figure",offset:.5,enter:function(){dt(),s=setTimeout(ut,(i+1)*O)},once:!0}),U.on("click",function(){return qt()}),B.on("click",function(){return vt(n)})}).catch(console.error)}var yt={init:bt,resize:at};exports.default=yt;
},{"enter-view":"RZIL","./load-data":"xZJw"}],"TAPd":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var e=i(require("./guessMovement")),t=i(require("./familyLines"));function i(e){return e&&e.__esModule?e:{default:e}}function o(){console.log("Resize!"),e.default.resize(),t.default.resize()}function s(){console.log("Make something awesome!"),e.default.init(),t.default.init()}var u={init:s,resize:o};exports.default=u;
},{"./guessMovement":"WtE3","./familyLines":"Gtgh"}],"v9Q8":[function(require,module,exports) {
"use strict";Object.defineProperty(exports,"__esModule",{value:!0}),exports.default=void 0;var e=[{image:"2018_02_stand-up",url:"2018/02/stand-up",hed:"The Structure of Stand-Up Comedy"},{image:"2018_04_birthday-paradox",url:"2018/04/birthday-paradox",hed:"The Birthday Paradox Experiment"},{image:"2018_11_boy-bands",url:"2018/11/boy-bands",hed:"Internet Boy Band Database"},{image:"2018_08_pockets",url:"2018/08/pockets",hed:"Women’s Pockets are Inferior"}],t=null;function n(e,t){var n=document.getElementsByTagName("script")[0],o=document.createElement("script");return o.src=e,o.async=!0,n.parentNode.insertBefore(o,n),t&&"function"==typeof t&&(o.onload=t),o}function o(t){var n=new XMLHttpRequest,o=Date.now(),r="https://pudding.cool/assets/data/stories.json?v=".concat(o);n.open("GET",r,!0),n.onload=function(){if(n.status>=200&&n.status<400){var o=JSON.parse(n.responseText);t(o)}else t(e)},n.onerror=function(){return t(e)},n.send()}function r(e){return"\n\t<a class='footer-recirc__article' href='https://pudding.cool/".concat(e.url,"' target='_blank' rel='noopener'>\n\t\t<img class='article__img' src='https://pudding.cool/common/assets/thumbnails/640/").concat(e.image,".jpg' alt='").concat(e.hed,"'>\n\t\t<p class='article__headline'>").concat(e.hed,"</p>\n\t</a>\n\t")}function a(){var e=window.location.href,n=t.filter(function(t){return!e.includes(t.url)}).slice(0,4).map(r).join("");d3.select(".pudding-footer .footer-recirc__articles").html(n)}function s(){o(function(e){t=e,a()})}var c={init:s};exports.default=c;
},{}],"epB2":[function(require,module,exports) {
"use strict";var e=a(require("lodash.debounce")),i=a(require("./utils/is-mobile")),s=a(require("./utils/link-fix")),r=a(require("./graphic")),t=a(require("./footer")),l=a(require("./guessMovement.js")),u=a(require("./familyLines.js"));function a(e){return e&&e.__esModule?e:{default:e}}var d=d3.select("body"),n=0;function c(){var e=d.node().offsetWidth;n!==e&&(n=e,r.default.resize())}function o(){if(d.select("header").classed("is-sticky")){var e=d.select(".header__menu"),i=d.select(".header__toggle");i.on("click",function(){var s=e.classed("is-visible");e.classed("is-visible",!s),i.classed("is-visible",!s)})}}function f(){(0,s.default)(),d.classed("is-mobile",i.default.any()),window.addEventListener("resize",(0,e.default)(c,150)),o(),r.default.init()}f();
},{"lodash.debounce":"or4r","./utils/is-mobile":"WEtf","./utils/link-fix":"U9xJ","./graphic":"TAPd","./footer":"v9Q8","./guessMovement.js":"WtE3","./familyLines.js":"Gtgh"}]},{},["epB2"], null)