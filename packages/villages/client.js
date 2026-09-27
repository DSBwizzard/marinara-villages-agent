var u$=Object.create;var Wu=Object.defineProperty;var d$=Object.getOwnPropertyDescriptor;var h$=Object.getOwnPropertyNames;var m$=Object.getPrototypeOf,p$=Object.prototype.hasOwnProperty;var g$=(e,t,a)=>t in e?Wu(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a;var Za=(e,t)=>()=>{try{return t||e((t={exports:{}}).exports,t),t.exports}catch(a){throw t=0,a}};var f$=(e,t,a,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let o of h$(t))!p$.call(e,o)&&o!==a&&Wu(e,o,{get:()=>t[o],enumerable:!(n=d$(t,o))||n.enumerable});return e};var ys=(e,t,a)=>(a=e!=null?u$(m$(e)):{},f$(t||!e||!e.__esModule?Wu(a,"default",{value:e,enumerable:!0}):a,e));var Ng=(e,t,a)=>g$(e,typeof t!="symbol"?t+"":t,a);var _g=Za(W=>{"use strict";var ad=Symbol.for("react.transitional.element"),b$=Symbol.for("react.portal"),v$=Symbol.for("react.fragment"),y$=Symbol.for("react.strict_mode"),w$=Symbol.for("react.profiler"),$$=Symbol.for("react.consumer"),x$=Symbol.for("react.context"),N$=Symbol.for("react.forward_ref"),S$=Symbol.for("react.suspense"),T$=Symbol.for("react.memo"),Cg=Symbol.for("react.lazy"),k$=Symbol.for("react.activity"),E$=Symbol.for("react.view_transition"),Sg=Symbol.iterator;function C$(e){return e===null||typeof e!="object"?null:(e=Sg&&e[Sg]||e["@@iterator"],typeof e=="function"?e:null)}var Ag={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},zg=Object.assign,Mg={};function bo(e,t,a){this.props=e,this.context=t,this.refs=Mg,this.updater=a||Ag}bo.prototype.isReactComponent={};bo.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")};bo.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function Rg(){}Rg.prototype=bo.prototype;function nd(e,t,a){this.props=e,this.context=t,this.refs=Mg,this.updater=a||Ag}var id=nd.prototype=new Rg;id.constructor=nd;zg(id,bo.prototype);id.isPureReactComponent=!0;var Tg=Array.isArray;function td(){}var _e={H:null,A:null,T:null,S:null},Og=Object.prototype.hasOwnProperty;function od(e,t,a){var n=a.ref;return{$$typeof:ad,type:e,key:t,ref:n!==void 0?n:null,props:a}}function A$(e,t){return od(e.type,t,e.props)}function rd(e){return typeof e=="object"&&e!==null&&e.$$typeof===ad}function z$(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(a){return t[a]})}var kg=/\/+/g;function ed(e,t){return typeof e=="object"&&e!==null&&e.key!=null?z$(""+e.key):t.toString(36)}function M$(e){switch(e.status){case"fulfilled":return e.value;case"rejected":throw e.reason;default:switch(typeof e.status=="string"?e.then(td,td):(e.status="pending",e.then(function(t){e.status==="pending"&&(e.status="fulfilled",e.value=t)},function(t){e.status==="pending"&&(e.status="rejected",e.reason=t)})),e.status){case"fulfilled":return e.value;case"rejected":throw e.reason}}throw e}function fo(e,t,a,n,o){var l=typeof e;(l==="undefined"||l==="boolean")&&(e=null);var c=!1;if(e===null)c=!0;else switch(l){case"bigint":case"string":case"number":c=!0;break;case"object":switch(e.$$typeof){case ad:case b$:c=!0;break;case Cg:return c=e._init,fo(c(e._payload),t,a,n,o)}}if(c)return o=o(e),c=n===""?"."+ed(e,0):n,Tg(o)?(a="",c!=null&&(a=c.replace(kg,"$&/")+"/"),fo(o,t,a,"",function(g){return g})):o!=null&&(rd(o)&&(o=A$(o,a+(o.key==null||e&&e.key===o.key?"":(""+o.key).replace(kg,"$&/")+"/")+c)),t.push(o)),1;c=0;var d=n===""?".":n+":";if(Tg(e))for(var h=0;h<e.length;h++)n=e[h],l=d+ed(n,h),c+=fo(n,t,a,l,o);else if(h=C$(e),typeof h=="function")for(e=h.call(e),h=0;!(n=e.next()).done;)n=n.value,l=d+ed(n,h++),c+=fo(n,t,a,l,o);else if(l==="object"){if(typeof e.then=="function")return fo(M$(e),t,a,n,o);throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.")}return c}function ws(e,t,a){if(e==null)return e;var n=[],o=0;return fo(e,n,"","",function(l){return t.call(a,l,o++)}),n}function R$(e){if(e._status===-1){var t=e._result,a=t();a.then(function(n){(e._status===0||e._status===-1)&&(e._status=1,e._result=n,a.status===void 0&&(a.status="fulfilled",a.value=n))},function(n){(e._status===0||e._status===-1)&&(e._status=2,e._result=n,a.status===void 0&&(a.status="rejected",a.reason=n))}),e._status===-1&&(e._status=0,e._result=a)}if(e._status===1)return e._result.default;throw e._result}var Eg=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)};function Vg(e){var t=_e.T,a={};a.types=t!==null?t.types:null,_e.T=a;try{var n=e(),o=_e.S;o!==null&&o(a,n),typeof n=="object"&&n!==null&&typeof n.then=="function"&&n.then(td,Eg)}catch(l){Eg(l)}finally{t!==null&&a.types!==null&&(t.types=a.types),_e.T=t}}function Dg(e){var t=_e.T;if(t!==null){var a=t.types;a===null?t.types=[e]:a.indexOf(e)===-1&&a.push(e)}else Vg(Dg.bind(null,e))}var O$={map:ws,forEach:function(e,t,a){ws(e,function(){t.apply(this,arguments)},a)},count:function(e){var t=0;return ws(e,function(){t++}),t},toArray:function(e){return ws(e,function(t){return t})||[]},only:function(e){if(!rd(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};W.Activity=k$;W.Children=O$;W.Component=bo;W.Fragment=v$;W.Profiler=w$;W.PureComponent=nd;W.StrictMode=y$;W.Suspense=S$;W.ViewTransition=E$;W.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=_e;W.__COMPILER_RUNTIME={__proto__:null,c:function(e){return _e.H.useMemoCache(e)}};W.addTransitionType=Dg;W.cache=function(e){return function(){return e.apply(null,arguments)}};W.cacheSignal=function(){return null};W.cloneElement=function(e,t,a){if(e==null)throw Error("The argument must be a React element, but you passed "+e+".");var n=zg({},e.props),o=e.key;if(t!=null)for(l in t.key!==void 0&&(o=""+t.key),t)!Og.call(t,l)||l==="key"||l==="__self"||l==="__source"||l==="ref"&&t.ref===void 0||(n[l]=t[l]);var l=arguments.length-2;if(l===1)n.children=a;else if(1<l){for(var c=Array(l),d=0;d<l;d++)c[d]=arguments[d+2];n.children=c}return od(e.type,o,n)};W.createContext=function(e){return e={$$typeof:x$,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null},e.Provider=e,e.Consumer={$$typeof:$$,_context:e},e};W.createElement=function(e,t,a){var n,o={},l=null;if(t!=null)for(n in t.key!==void 0&&(l=""+t.key),t)Og.call(t,n)&&n!=="key"&&n!=="__self"&&n!=="__source"&&(o[n]=t[n]);var c=arguments.length-2;if(c===1)o.children=a;else if(1<c){for(var d=Array(c),h=0;h<c;h++)d[h]=arguments[h+2];o.children=d}if(e&&e.defaultProps)for(n in c=e.defaultProps,c)o[n]===void 0&&(o[n]=c[n]);return od(e,l,o)};W.createRef=function(){return{current:null}};W.forwardRef=function(e){return{$$typeof:N$,render:e}};W.isValidElement=rd;W.lazy=function(e){return{$$typeof:Cg,_payload:{_status:-1,_result:e},_init:R$}};W.memo=function(e,t){return{$$typeof:T$,type:e,compare:t===void 0?null:t}};W.startTransition=Vg;W.unstable_useCacheRefresh=function(){return _e.H.useCacheRefresh()};W.use=function(e){return _e.H.use(e)};W.useActionState=function(e,t,a){return _e.H.useActionState(e,t,a)};W.useCallback=function(e,t){return _e.H.useCallback(e,t)};W.useContext=function(e){return _e.H.useContext(e)};W.useDebugValue=function(){};W.useDeferredValue=function(e,t){return _e.H.useDeferredValue(e,t)};W.useEffect=function(e,t){return _e.H.useEffect(e,t)};W.useEffectEvent=function(e){return _e.H.useEffectEvent(e)};W.useId=function(){return _e.H.useId()};W.useImperativeHandle=function(e,t,a){return _e.H.useImperativeHandle(e,t,a)};W.useInsertionEffect=function(e,t){return _e.H.useInsertionEffect(e,t)};W.useLayoutEffect=function(e,t){return _e.H.useLayoutEffect(e,t)};W.useMemo=function(e,t){return _e.H.useMemo(e,t)};W.useOptimistic=function(e,t){return _e.H.useOptimistic(e,t)};W.useReducer=function(e,t,a){return _e.H.useReducer(e,t,a)};W.useRef=function(e){return _e.H.useRef(e)};W.useState=function(e){return _e.H.useState(e)};W.useSyncExternalStore=function(e,t,a){return _e.H.useSyncExternalStore(e,t,a)};W.useTransition=function(){return _e.H.useTransition()};W.version="19.3.0"});var $s=Za((YS,Hg)=>{"use strict";Hg.exports=_g()});var Qg=Za(Le=>{"use strict";function ud(e,t){var a=e.length;e.push(t);e:for(;0<a;){var n=a-1>>>1,o=e[n];if(0<xs(o,t))e[n]=t,e[a]=o,a=n;else break e}}function Ka(e){return e.length===0?null:e[0]}function Ss(e){if(e.length===0)return null;var t=e[0],a=e.pop();if(a!==t){e[0]=a;e:for(var n=0,o=e.length,l=o>>>1;n<l;){var c=2*(n+1)-1,d=e[c],h=c+1,g=e[h];if(0>xs(d,a))h<o&&0>xs(g,d)?(e[n]=g,e[h]=a,n=h):(e[n]=d,e[c]=a,n=c);else if(h<o&&0>xs(g,a))e[n]=g,e[h]=a,n=h;else break e}}return t}function xs(e,t){var a=e.sortIndex-t.sortIndex;return a!==0?a:e.id-t.id}Le.unstable_now=void 0;typeof performance=="object"&&typeof performance.now=="function"?(Ug=performance,Le.unstable_now=function(){return Ug.now()}):(ld=Date,qg=ld.now(),Le.unstable_now=function(){return ld.now()-qg});var Ug,ld,qg,mn=[],Dn=[],V$=1,ba=null,kt=3,dd=!1,Hr=!1,Ur=!1,hd=!1,Lg=typeof setTimeout=="function"?setTimeout:null,jg=typeof clearTimeout=="function"?clearTimeout:null,Ig=typeof setImmediate<"u"?setImmediate:null;function Ns(e){for(var t=Ka(Dn);t!==null;){if(t.callback===null)Ss(Dn);else if(t.startTime<=e)Ss(Dn),t.sortIndex=t.expirationTime,ud(mn,t);else break;t=Ka(Dn)}}function md(e){if(Ur=!1,Ns(e),!Hr)if(Ka(mn)!==null)Hr=!0,yo||(yo=!0,vo());else{var t=Ka(Dn);t!==null&&pd(md,t.startTime-e)}}var yo=!1,qr=-1,Gg=5,Yg=-1;function Xg(){return hd?!0:!(Le.unstable_now()-Yg<Gg)}function sd(){if(hd=!1,yo){var e=Le.unstable_now();Yg=e;var t=!0;try{e:{Hr=!1,Ur&&(Ur=!1,jg(qr),qr=-1),dd=!0;var a=kt;try{t:{for(Ns(e),ba=Ka(mn);ba!==null&&!(ba.expirationTime>e&&Xg());){var n=ba.callback;if(typeof n=="function"){ba.callback=null,kt=ba.priorityLevel;var o=n(ba.expirationTime<=e);if(e=Le.unstable_now(),typeof o=="function"){ba.callback=o,Ns(e),t=!0;break t}ba===Ka(mn)&&Ss(mn),Ns(e)}else Ss(mn);ba=Ka(mn)}if(ba!==null)t=!0;else{var l=Ka(Dn);l!==null&&pd(md,l.startTime-e),t=!1}}break e}finally{ba=null,kt=a,dd=!1}t=void 0}}finally{t?vo():yo=!1}}}var vo;typeof Ig=="function"?vo=function(){Ig(sd)}:typeof MessageChannel<"u"?(cd=new MessageChannel,Bg=cd.port2,cd.port1.onmessage=sd,vo=function(){Bg.postMessage(null)}):vo=function(){Lg(sd,0)};var cd,Bg;function pd(e,t){qr=Lg(function(){e(Le.unstable_now())},t)}Le.unstable_IdlePriority=5;Le.unstable_ImmediatePriority=1;Le.unstable_LowPriority=4;Le.unstable_NormalPriority=3;Le.unstable_Profiling=null;Le.unstable_UserBlockingPriority=2;Le.unstable_cancelCallback=function(e){e.callback=null};Le.unstable_forceFrameRate=function(e){0>e||125<e?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):Gg=0<e?Math.floor(1e3/e):5};Le.unstable_getCurrentPriorityLevel=function(){return kt};Le.unstable_next=function(e){switch(kt){case 1:case 2:case 3:var t=3;break;default:t=kt}var a=kt;kt=t;try{return e()}finally{kt=a}};Le.unstable_requestPaint=function(){hd=!0};Le.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var a=kt;kt=e;try{return t()}finally{kt=a}};Le.unstable_scheduleCallback=function(e,t,a){var n=Le.unstable_now();switch(typeof a=="object"&&a!==null?(a=a.delay,a=typeof a=="number"&&0<a?n+a:n):a=n,e){case 1:var o=-1;break;case 2:o=250;break;case 5:o=1073741823;break;case 4:o=1e4;break;default:o=5e3}return o=a+o,e={id:V$++,callback:t,priorityLevel:e,startTime:a,expirationTime:o,sortIndex:-1},a>n?(e.sortIndex=a,ud(Dn,e),Ka(mn)===null&&e===Ka(Dn)&&(Ur?(jg(qr),qr=-1):Ur=!0,pd(md,a-n))):(e.sortIndex=o,ud(mn,e),Hr||dd||(Hr=!0,yo||(yo=!0,vo()))),e};Le.unstable_shouldYield=Xg;Le.unstable_wrapCallback=function(e){var t=kt;return function(){var a=kt;kt=t;try{return e.apply(this,arguments)}finally{kt=a}}}});var Kg=Za((QS,Zg)=>{"use strict";Zg.exports=Qg()});var Fg=Za(Et=>{"use strict";var D$=$s();function Pg(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)t+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function _n(){}var Vt={d:{f:_n,r:function(){throw Error(Pg(522))},D:_n,C:_n,L:_n,m:_n,X:_n,S:_n,M:_n},p:0,findDOMNode:null},_$=Symbol.for("react.portal"),H$=Symbol.for("react.recoverable"),Jg=Symbol.for("react.optimistic_key");function U$(e,t,a){var n=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:_$,key:n==null?null:n===Jg?Jg:""+n,children:e,containerInfo:t,implementation:a}}var Ir=D$.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function Ts(e,t){if(e==="font")return"";if(typeof t=="string")return t==="use-credentials"?t:""}Et.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=Vt;Et.browser=function(e){return{$$typeof:H$,_reason:e}};Et.createPortal=function(e,t){var a=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)throw Error(Pg(299));return U$(e,t,null,a)};Et.flushSync=function(e){var t=Ir.T,a=Vt.p;try{if(Ir.T=null,Vt.p=2,e)return e()}finally{Ir.T=t,Vt.p=a,Vt.d.f()}};Et.preconnect=function(e,t){typeof e=="string"&&(t?(t=t.crossOrigin,t=typeof t=="string"?t==="use-credentials"?t:"":void 0):t=null,Vt.d.C(e,t))};Et.prefetchDNS=function(e){typeof e=="string"&&Vt.d.D(e)};Et.preinit=function(e,t){if(typeof e=="string"&&t&&typeof t.as=="string"){var a=t.as,n=Ts(a,t.crossOrigin),o=typeof t.integrity=="string"?t.integrity:void 0,l=typeof t.fetchPriority=="string"?t.fetchPriority:void 0;a==="style"?Vt.d.S(e,typeof t.precedence=="string"?t.precedence:void 0,{crossOrigin:n,integrity:o,fetchPriority:l}):a==="script"&&Vt.d.X(e,{crossOrigin:n,integrity:o,fetchPriority:l,nonce:typeof t.nonce=="string"?t.nonce:void 0})}};Et.preinitModule=function(e,t){if(typeof e=="string")if(typeof t=="object"&&t!==null){if(t.as==null||t.as==="script"){var a=Ts(t.as,t.crossOrigin);Vt.d.M(e,{crossOrigin:a,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0})}}else t==null&&Vt.d.M(e)};Et.preload=function(e,t){if(typeof e=="string"&&typeof t=="object"&&t!==null&&typeof t.as=="string"){var a=t.as,n=Ts(a,t.crossOrigin);Vt.d.L(e,a,{crossOrigin:n,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,type:typeof t.type=="string"?t.type:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0,referrerPolicy:typeof t.referrerPolicy=="string"?t.referrerPolicy:void 0,imageSrcSet:typeof t.imageSrcSet=="string"?t.imageSrcSet:void 0,imageSizes:typeof t.imageSizes=="string"?t.imageSizes:void 0,media:typeof t.media=="string"?t.media:void 0})}};Et.preloadModule=function(e,t){if(typeof e=="string")if(t){var a=Ts(t.as,t.crossOrigin);Vt.d.m(e,{as:typeof t.as=="string"&&t.as!=="script"?t.as:void 0,crossOrigin:a,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0})}else Vt.d.m(e)};Et.requestFormReset=function(e){Vt.d.r(e)};Et.unstable_batchedUpdates=function(e,t){return e(t)};Et.useFormState=function(e,t,a){return Ir.H.useFormState(e,t,a)};Et.useFormStatus=function(){return Ir.H.useHostTransitionStatus()};Et.version="19.3.0"});var tf=Za((KS,ef)=>{"use strict";function Wg(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Wg)}catch(e){console.error(e)}}Wg(),ef.exports=Fg()});var Lw=Za(ru=>{"use strict";var ct=Kg(),Bb=$s(),q$=tf();function z(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)t+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function Lb(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function El(e){for(var t=e,a=t;a&&!a.alternate;)t=a,(t.flags&4098)!==0&&(e=t.return),a=t.return;for(;t.return;)t=t.return;return t.tag===3?e:null}function jb(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function Gb(e){if(e.tag===31){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function af(e){if(El(e)!==e)throw Error(z(188))}function I$(e){var t=e.alternate;if(!t){if(t=El(e),t===null)throw Error(z(188));return t!==e?null:e}for(var a=e,n=t;;){var o=a.return;if(o===null)break;var l=o.alternate;if(l===null){if(n=o.return,n!==null){a=n;continue}break}if(o.child===l.child){for(l=o.child;l;){if(l===a)return af(o),e;if(l===n)return af(o),t;l=l.sibling}throw Error(z(188))}if(a.return!==n.return)a=o,n=l;else{for(var c=!1,d=o.child;d;){if(d===a){c=!0,a=o,n=l;break}if(d===n){c=!0,n=o,a=l;break}d=d.sibling}if(!c){for(d=l.child;d;){if(d===a){c=!0,a=l,n=o;break}if(d===n){c=!0,n=l,a=o;break}d=d.sibling}if(!c)throw Error(z(189))}}if(a.alternate!==n)throw Error(z(190))}if(a.tag!==3)throw Error(z(188));return a.stateNode.current===a?e:t}function Yb(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e;for(e=e.child;e!==null;){if(t=Yb(e),t!==null)return t;e=e.sibling}return null}function Qt(e,t,a,n,o,l){for(;e!==null;){if((e.tag===5||e.tag===27||e.tag===6)&&a(e,n,o,l)||(e.tag!==22||e.memoizedState===null)&&(t||e.tag!==5&&e.tag!==27)&&Qt(e.child,t,a,n,o,l))return!0;e=e.sibling}return!1}function Bi(e){for(e=e.return;e!==null;){if(e.tag===3||e.tag===5||e.tag===27)return e;e=e.return}return null}function nf(e){var t=!1;for(e=e.return;e!==null&&(e.tag===4&&(t=!0),!(e.tag===3||e.tag===5||e.tag===27));)e=e.return;return t}function Xb(e){var t=[null,null],a=Bi(e);return a===null||Qb(t,e,a.child,{foundSelf:!1}),t}function Qb(e,t,a,n){for(;a!==null;){if(a===t)n.foundSelf=!0;else if(a.tag===5||a.tag===27||a.tag===6){if(n.foundSelf)return e[1]=a,!0;e[0]=a}else if((a.tag!==22||a.memoizedState===null)&&Qb(e,t,a.child,n))return!0;a=a.sibling}return!1}function st(e){switch(e.tag){case 5:case 27:case 6:return e.stateNode;case 3:return e.stateNode.containerInfo;default:throw Error(z(559))}}var ko=null,Xd=null;function B$(e,t,a){return e===a?!0:e===t?(ko=e,!0):!1}function L$(e,t,a){return e===a?(Xd=e,!1):e===t?(Xd!==null&&(ko=e),!0):!1}function of(e){if(e===null)return null;do e=e===null?null:e.return;while(e&&e.tag!==5&&e.tag!==27&&e.tag!==3);return e||null}function Qd(e,t,a){for(var n=0,o=e;o;o=a(o))n++;o=0;for(var l=t;l;l=a(l))o++;for(;0<n-o;)e=a(e),n--;for(;0<o-n;)t=a(t),o--;for(;n--;){if(e===t||t!==null&&e===t.alternate)return e;e=a(e),t=a(t)}return null}var Ve=Object.assign,j$=Symbol.for("react.element"),ks=Symbol.for("react.transitional.element"),Qr=Symbol.for("react.portal"),Eo=Symbol.for("react.fragment"),Zb=Symbol.for("react.strict_mode"),Zd=Symbol.for("react.profiler"),Kb=Symbol.for("react.consumer"),tn=Symbol.for("react.context"),nm=Symbol.for("react.forward_ref"),Kd=Symbol.for("react.suspense"),Jd=Symbol.for("react.suspense_list"),im=Symbol.for("react.memo"),In=Symbol.for("react.lazy"),Pd=Symbol.for("react.activity"),G$=Symbol.for("react.legacy_hidden"),Y$=Symbol.for("react.memo_cache_sentinel"),Fd=Symbol.for("react.view_transition"),X$=Symbol.for("react.recoverable"),rf=Symbol.iterator;function Br(e){return e===null||typeof e!="object"?null:(e=rf&&e[rf]||e["@@iterator"],typeof e=="function"?e:null)}var Q$=Symbol.for("react.client.reference");function Wd(e){if(e==null)return null;if(typeof e=="function")return e.$$typeof===Q$?null:e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case Eo:return"Fragment";case Zd:return"Profiler";case Zb:return"StrictMode";case Kd:return"Suspense";case Jd:return"SuspenseList";case Pd:return"Activity";case Fd:return"ViewTransition"}if(typeof e=="object")switch(e.$$typeof){case Qr:return"Portal";case tn:return e.displayName||"Context";case Kb:return(e._context.displayName||"Context")+".Consumer";case nm:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case im:return t=e.displayName||null,t!==null?t:Wd(e.type)||"Memo";case In:t=e._payload,e=e._init;try{return Wd(e(t))}catch{}}return null}var Zr=Array.isArray,F=Bb.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,$e=q$.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Ci={pending:!1,data:null,method:null,action:null},eh=[],Co=-1;function cn(e){return{current:e}}function wt(e){0>Co||(e.current=eh[Co],eh[Co]=null,Co--)}function qe(e,t){Co++,eh[Co]=e.current,e.current=t}var rn=cn(null),dl=cn(null),Kn=cn(null),hc=cn(null);function mc(e,t){switch(qe(Kn,t),qe(dl,e),qe(rn,null),t.nodeType){case 9:case 11:e=(e=t.documentElement)&&(e=e.namespaceURI)?wb(e):0;break;default:if(e=t.tagName,t=t.namespaceURI)t=wb(t),e=bw(t,e);else switch(e){case"svg":e=1;break;case"math":e=2;break;default:e=0}}wt(rn),qe(rn,e)}function Zo(){wt(rn),wt(dl),wt(Kn)}function th(e){var t=e.memoizedState;t!==null&&(ir._currentValue=t.memoizedState,qe(hc,e)),t=rn.current;var a=bw(t,e.type);t!==a&&(qe(dl,e),qe(rn,a))}function pc(e){dl.current===e&&(wt(rn),wt(dl)),hc.current===e&&(wt(hc),ir._currentValue=Ci)}var gd,lf;function Un(e){if(gd===void 0)try{throw Error()}catch(a){var t=a.stack.trim().match(/\n( *(at )?)/);gd=t&&t[1]||"",lf=-1<a.stack.indexOf(`
    at`)?" (<anonymous>)":-1<a.stack.indexOf("@")?"@unknown:0:0":""}return`
`+gd+e+lf}var fd=!1;function bd(e,t){if(!e||fd)return"";fd=!0;var a=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var n={DetermineComponentFrameRoot:function(){try{if(t){var N=function(){throw Error()};if(Object.defineProperty(N.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(N,[])}catch(C){var f=C}Reflect.construct(e,[],N)}else{try{N.call()}catch(C){f=C}N=!1;try{var $=Object.getOwnPropertyDescriptor(e.prototype,"props");Object.defineProperty(e.prototype,"props",{configurable:!0,set:function(){throw Error()}}),N=!0,new e}finally{N&&($!==void 0?Object.defineProperty(e.prototype,"props",$):delete e.prototype.props)}}}else{try{throw Error()}catch(C){f=C}(N=e())&&typeof N.catch=="function"&&N.catch(function(){})}}catch(C){if(C&&f&&typeof C.stack=="string")return[C.stack,f.stack]}return[null,null]}};n.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var o=Object.getOwnPropertyDescriptor(n.DetermineComponentFrameRoot,"name");o&&o.configurable&&Object.defineProperty(n.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var l=n.DetermineComponentFrameRoot(),c=l[0],d=l[1];if(c&&d){var h=c.split(`
`),g=d.split(`
`);for(o=n=0;n<h.length&&!h[n].includes("DetermineComponentFrameRoot");)n++;for(;o<g.length&&!g[o].includes("DetermineComponentFrameRoot");)o++;if(n===h.length||o===g.length)for(n=h.length-1,o=g.length-1;1<=n&&0<=o&&h[n]!==g[o];)o--;for(;1<=n&&0<=o;n--,o--)if(h[n]!==g[o]){if(n!==1||o!==1)do if(n--,o--,0>o||h[n]!==g[o]){var y=`
`+h[n].replace(" at new "," at ");return e.displayName&&y.includes("<anonymous>")&&(y=y.replace("<anonymous>",e.displayName)),y}while(1<=n&&0<=o);break}}}finally{fd=!1,Error.prepareStackTrace=a}return(a=e?e.displayName||e.name:"")?Un(a):""}function Z$(e,t){switch(e.tag){case 26:case 27:case 5:return Un(e.type);case 16:return Un("Lazy");case 13:return e.child!==t&&t!==null?Un("Suspense Fallback"):Un("Suspense");case 19:return Un("SuspenseList");case 0:case 15:return bd(e.type,!1);case 11:return bd(e.type.render,!1);case 1:return bd(e.type,!0);case 31:return Un("Activity");case 30:return Un("ViewTransition");default:return""}}function sf(e){try{var t="",a=null;do t+=Z$(e,a),a=e,e=e.return;while(e);return t}catch(n){return`
Error generating stack: `+n.message+`
`+n.stack}}var ah=Object.prototype.hasOwnProperty,om=ct.unstable_scheduleCallback,vd=ct.unstable_cancelCallback,K$=ct.unstable_shouldYield,J$=ct.unstable_requestPaint,oa=ct.unstable_now,P$=ct.unstable_getCurrentPriorityLevel,Jb=ct.unstable_ImmediatePriority,Pb=ct.unstable_UserBlockingPriority,gc=ct.unstable_NormalPriority,F$=ct.unstable_LowPriority,Fb=ct.unstable_IdlePriority,W$=ct.log,ex=ct.unstable_setDisableYieldValue,Cl=null,ra=null;function jn(e){if(typeof W$=="function"&&ex(e),ra&&typeof ra.setStrictMode=="function")try{ra.setStrictMode(Cl,e)}catch{}}var la=Math.clz32?Math.clz32:nx,tx=Math.log,ax=Math.LN2;function nx(e){return e>>>=0,e===0?32:31-(tx(e)/ax|0)|0}var Es=256,Cs=262144,As=4194304;function Ni(e){var t=e&42;if(t!==0)return t;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&-e;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function Bc(e,t,a){var n=e.pendingLanes;if(n===0)return 0;var o=0,l=e.suspendedLanes,c=e.pingedLanes;e=e.warmLanes;var d=n&134217727;return d!==0?(n=d&~l,n!==0?o=Ni(n):(c&=d,c!==0?o=Ni(c):a||(a=d&~e,a!==0&&(o=Ni(a))))):(d=n&~l,d!==0?o=Ni(d):c!==0?o=Ni(c):a||(a=n&~e,a!==0&&(o=Ni(a)))),o===0?0:t!==0&&t!==o&&(t&l)===0&&(l=o&-o,a=t&-t,l>=a||l===32&&(a&4194048)!==0)?t:o}function Al(e,t){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&t)===0}function Wb(e,t){(t&8)!==0&&(t|=t&32);var a=e.entangledLanes;if(a!==0)for(e=e.entanglements,a&=t;0<a;){var n=31-la(a),o=1<<n;t|=e[n],a&=~o}return t}function ix(e,t){switch(e){case 1:case 2:case 4:case 8:case 64:return t+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function ev(){var e=As;return As<<=1,(As&62914560)===0&&(As=4194304),e}function yd(e){for(var t=[],a=0;31>a;a++)t.push(e);return t}function zl(e,t){e.pendingLanes|=t,t!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function ox(e,t,a,n,o,l){var c=e.pendingLanes;e.pendingLanes=a,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=a,e.entangledLanes&=a,e.errorRecoveryDisabledLanes&=a,e.shellSuspendCounter=0;var d=e.entanglements,h=e.expirationTimes,g=e.hiddenUpdates;for(a=c&~a;0<a;){var y=31-la(a),N=1<<y;d[y]=0,h[y]=-1;var f=g[y];if(f!==null)for(g[y]=null,y=0;y<f.length;y++){var $=f[y];$!==null&&($.lane&=-536870913)}a&=~N}n!==0&&tv(e,n,0),l!==0&&o===0&&e.tag!==0&&(e.suspendedLanes|=l&~(c&~t))}function tv(e,t,a){e.pendingLanes|=t,e.suspendedLanes&=~t;var n=31-la(t);e.entangledLanes|=t,e.entanglements[n]=e.entanglements[n]|1073741824|a&261930}function av(e,t){var a=e.entangledLanes|=t;for(e=e.entanglements;a;){var n=31-la(a),o=1<<n;o&t|e[n]&t&&(e[n]|=t),a&=~o}}function nv(e,t){var a=t&-t;return a=(a&42)!==0?1:rm(a),(a&(e.suspendedLanes|t))!==0?0:a}function rm(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function lm(e){return e&=-e,2<e?8<e?(e&134217727)!==0?32:268435456:8:2}function iv(){var e=$e.p;return e!==0?e:(e=window.event,e===void 0?32:qw(e.type))}function cf(e,t){var a=$e.p;try{return $e.p=e,t()}finally{$e.p=a}}var kn=Math.random().toString(36).slice(2),vt="__reactFiber$"+kn,Zt="__reactProps$"+kn,lr="__reactContainer$"+kn,uf="__reactEvents$"+kn,rx="__reactListeners$"+kn,lx="__reactHandles$"+kn,df="__reactResources$"+kn,Ml="__reactMarker$"+kn,fc="__reactLoad$"+kn;function Lc(e){delete e[vt],delete e[Zt],delete e[rx],delete e[lx]}function ki(e){var t;if(t=e[vt])return t;for(var a=e.parentNode;a;){if(t=a[lr]||a[vt]){if(a=t.alternate,t.child!==null||a!==null&&a.child!==null)for(e=Cb(e);e!==null;){if(a=e[vt])return a;e=Cb(e)}return t}e=a,a=e.parentNode}return null}function sr(e){if(e=e[vt]||e[lr]){var t=e.tag;if(t===5||t===6||t===13||t===31||t===26||t===27||t===3)return e}return null}function Kr(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e.stateNode;throw Error(z(33))}function Uo(e){var t=e[df];return t||(t=e[df]={hoistableStyles:new Map,hoistableScripts:new Map}),t}function pt(e){e[Ml]=!0}function ov(e){e[fc]=void 0}var rv=new Set,lv={};function Li(e,t){Ko(e,t),Ko(e+"Capture",t)}function Ko(e,t){for(lv[e]=t,e=0;e<t.length;e++)rv.add(t[e])}var sx=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),hf={},mf={};function cx(e){return ah.call(mf,e)?!0:ah.call(hf,e)?!1:sx.test(e)?mf[e]=!0:(hf[e]=!0,!1)}var ve=!1;function pf(){var e=ve;return ve=!1,e}function Qs(e,t,a){if(cx(t))if(a===null)e.removeAttribute(t);else{switch(typeof a){case"undefined":case"function":case"symbol":e.removeAttribute(t);return;case"boolean":var n=t.toLowerCase().slice(0,5);if(n!=="data-"&&n!=="aria-"){e.removeAttribute(t);return}}e.setAttribute(t,a)}}function zs(e,t,a){if(a===null)e.removeAttribute(t);else{switch(typeof a){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(t);return}e.setAttribute(t,a)}}function pn(e,t,a,n){if(n===null)e.removeAttribute(a);else{switch(typeof n){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(a);return}e.setAttributeNS(t,a,n)}}function ta(e){switch(typeof e){case"bigint":case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function sv(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function ux(e,t,a){var n=Object.getOwnPropertyDescriptor(e.constructor.prototype,t);if(!e.hasOwnProperty(t)&&typeof n<"u"&&typeof n.get=="function"&&typeof n.set=="function"){var o=n.get,l=n.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return o.call(this)},set:function(c){a=""+c,l.call(this,c)}}),Object.defineProperty(e,t,{enumerable:n.enumerable}),{getValue:function(){return a},setValue:function(c){a=""+c},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function nh(e){if(!e._valueTracker){var t=sv(e)?"checked":"value";e._valueTracker=ux(e,t,""+e[t])}}function cv(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var a=t.getValue(),n="";return e&&(n=sv(e)?e.checked?"true":"false":e.value),e=n,e!==a?(t.setValue(e),!0):!1}var dx=/[\n"\\]/g;function xa(e){return e.replace(dx,function(t){return"\\"+t.charCodeAt(0).toString(16)+" "})}function ih(e,t,a,n,o,l,c,d){e.name="",c!=null&&typeof c!="function"&&typeof c!="symbol"&&typeof c!="boolean"?e.type=c:e.removeAttribute("type"),t!=null?c==="number"?(t===0&&e.value===""||e.value!=t)&&(e.value=""+ta(t)):e.value!==""+ta(t)&&(e.value=""+ta(t)):c!=="submit"&&c!=="reset"||e.removeAttribute("value"),t!=null?c==="number"&&e.value==t?wd(e,ta(e.value)):wd(e,ta(t)):a!=null?wd(e,ta(a)):n!=null&&e.removeAttribute("value"),o==null&&l!=null&&(e.defaultChecked=!!l),o!=null&&(e.checked=o&&typeof o!="function"&&typeof o!="symbol"),d!=null&&typeof d!="function"&&typeof d!="symbol"&&typeof d!="boolean"?e.name=""+ta(d):e.removeAttribute("name")}function uv(e,t,a,n,o,l,c,d){if(l!=null&&typeof l!="function"&&typeof l!="symbol"&&typeof l!="boolean"&&(e.type=l),t!=null||a!=null){if(!(l!=="submit"&&l!=="reset"||t!=null)){nh(e);return}a=a!=null?""+ta(a):"",t=t!=null?""+ta(t):a,d||t===e.value||(e.value=t),e.defaultValue=t}n=n??o,n=typeof n!="function"&&typeof n!="symbol"&&!!n,e.checked=d?e.checked:!!n,e.defaultChecked=!!n,c!=null&&typeof c!="function"&&typeof c!="symbol"&&typeof c!="boolean"&&(e.name=c),nh(e)}function wd(e,t){e.defaultValue!==""+t&&(e.defaultValue=""+t)}function qo(e,t,a,n){if(e=e.options,t){t={};for(var o=0;o<a.length;o++)t["$"+a[o]]=!0;for(a=0;a<e.length;a++)o=t.hasOwnProperty("$"+e[a].value),e[a].selected!==o&&(e[a].selected=o),o&&n&&(e[a].defaultSelected=!0)}else{for(a=""+ta(a),t=null,o=0;o<e.length;o++){if(e[o].value===a){e[o].selected=!0,n&&(e[o].defaultSelected=!0);return}t!==null||e[o].disabled||(t=e[o])}t!==null&&(t.selected=!0)}}function dv(e,t,a){if(t!=null&&(t=""+ta(t),t!==e.value&&(e.value=t),a==null)){e.defaultValue!==t&&(e.defaultValue=t);return}e.defaultValue=a!=null?""+ta(a):""}function hv(e,t,a,n){if(t==null){if(n!=null){if(a!=null)throw Error(z(92));if(Zr(n)){if(1<n.length)throw Error(z(93));n=n[0]}a=n}a==null&&(a=""),t=a}a=ta(t),e.defaultValue=a,n=e.textContent,n===a&&n!==""&&n!==null&&(e.value=n),nh(e)}function Jo(e,t){if(t){var a=e.firstChild;if(a&&a===e.lastChild&&a.nodeType===3){a.nodeValue=t;return}}e.textContent=t}var hx=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function gf(e,t,a){var n=t.indexOf("--")===0;a==null||typeof a=="boolean"||a===""?n?e.setProperty(t,""):t==="float"?e.cssFloat="":e[t]="":n?e.setProperty(t,a):typeof a!="number"||a===0||hx.has(t)?t==="float"?e.cssFloat=a:e[t]=(""+a).trim():e[t]=a+"px"}function mv(e,t,a){if(t!=null&&typeof t!="object")throw Error(z(62));if(e=e.style,a!=null){for(var n in a)!a.hasOwnProperty(n)||t!=null&&t.hasOwnProperty(n)||(n.indexOf("--")===0?e.setProperty(n,""):n==="float"?e.cssFloat="":e[n]="",ve=!0);for(var o in t)n=t[o],t.hasOwnProperty(o)&&a[o]!==n&&(gf(e,o,n),ve=!0)}else for(var l in t)t.hasOwnProperty(l)&&gf(e,l,t[l])}function sm(e){if(e.indexOf("-")===-1)return!1;switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var mx=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["maskType","mask-type"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),px=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function Zs(e){return px.test(""+e)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":e}function an(){}var oh=null;function cm(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var Ao=null,Io=null;function ff(e){var t=sr(e);if(t&&(e=t.stateNode)){var a=e[Zt]||null;e:switch(e=t.stateNode,t.type){case"input":if(ih(e,a.value,a.defaultValue,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name),t=a.name,a.type==="radio"&&t!=null){for(a=e;a.parentNode;)a=a.parentNode;for(a=a.querySelectorAll('input[name="'+xa(""+t)+'"][type="radio"]'),t=0;t<a.length;t++){var n=a[t];if(n!==e&&n.form===e.form){var o=n[Zt]||null;if(!o)throw Error(z(90));ih(n,o.value,o.defaultValue,o.defaultValue,o.checked,o.defaultChecked,o.type,o.name)}}for(t=0;t<a.length;t++)n=a[t],n.form===e.form&&cv(n)}break e;case"textarea":dv(e,a.value,a.defaultValue);break e;case"select":t=a.value,t!=null&&qo(e,!!a.multiple,t,!1)}}}var $d=!1;function pv(e,t,a){if($d)return e(t,a);$d=!0;try{var n=e(t);return n}finally{if($d=!1,(Ao!==null||Io!==null)&&(au(),Ao&&(t=Ao,e=Io,Io=Ao=null,ff(t),e)))for(t=0;t<e.length;t++)ff(e[t])}}function hl(e,t){var a=e.stateNode;if(a===null)return null;var n=a[Zt]||null;if(n===null)return null;a=n[t];e:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(n=!n.disabled)||(e=e.type,n=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!n;break e;default:e=!1}if(e)return null;if(a&&typeof a!="function")throw Error(z(231,t,typeof a));return a}var wn=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),rh=!1;if(wn)try{wo={},Object.defineProperty(wo,"passive",{get:function(){rh=!0}}),window.addEventListener("test",wo,wo),window.removeEventListener("test",wo,wo)}catch{rh=!1}var wo,Gn=null,um=null,Ks=null;function gv(){if(Ks)return Ks;var e,t=um,a=t.length,n,o="value"in Gn?Gn.value:Gn.textContent,l=o.length;for(e=0;e<a&&t[e]===o[e];e++);var c=a-e;for(n=1;n<=c&&t[a-n]===o[l-n];n++);return Ks=o.slice(e,1<n?1-n:void 0)}function Js(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function Ms(){return!0}function bf(){return!1}function Ut(e){function t(a,n,o,l,c){this._reactName=a,this._targetInst=o,this.type=n,this.nativeEvent=l,this.target=c,this.currentTarget=null;for(var d in e)e.hasOwnProperty(d)&&(a=e[d],this[d]=a?a(l):l[d]);return this.isDefaultPrevented=(l.defaultPrevented!=null?l.defaultPrevented:l.returnValue===!1)?Ms:bf,this.isPropagationStopped=bf,this}return Ve(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var a=this.nativeEvent;a&&(a.preventDefault?a.preventDefault():typeof a.returnValue!="unknown"&&(a.returnValue=!1),this.isDefaultPrevented=Ms)},stopPropagation:function(){var a=this.nativeEvent;a&&(a.stopPropagation?a.stopPropagation():typeof a.cancelBubble!="unknown"&&(a.cancelBubble=!0),this.isPropagationStopped=Ms)},persist:function(){},isPersistent:Ms}),t}var ui={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},jc=Ut(ui),Rl=Ve({},ui,{view:0,detail:0}),gx=Ut(Rl),xd,Nd,Lr,Gc=Ve({},Rl,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:dm,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==Lr&&(Lr&&e.type==="mousemove"?(xd=e.screenX-Lr.screenX,Nd=e.screenY-Lr.screenY):Nd=xd=0,Lr=e),xd)},movementY:function(e){return"movementY"in e?e.movementY:Nd}}),vf=Ut(Gc),fx=Ve({},Gc,{dataTransfer:0}),bx=Ut(fx),vx=Ve({},Rl,{relatedTarget:0}),Sd=Ut(vx),yx=Ve({},ui,{animationName:0,elapsedTime:0,pseudoElement:0}),wx=Ut(yx),$x=Ve({},ui,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),xx=Ut($x),Nx=Ve({},ui,{data:0}),yf=Ut(Nx),Sx={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},Tx={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},kx={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function Ex(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=kx[e])?!!t[e]:!1}function dm(){return Ex}var Cx=Ve({},Rl,{key:function(e){if(e.key){var t=Sx[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=Js(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?Tx[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:dm,charCode:function(e){return e.type==="keypress"?Js(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?Js(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),Ax=Ut(Cx),zx=Ve({},Gc,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),wf=Ut(zx),Mx=Ve({},ui,{submitter:0}),Rx=Ut(Mx),Ox=Ve({},Rl,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:dm}),Vx=Ut(Ox),Dx=Ve({},ui,{propertyName:0,elapsedTime:0,pseudoElement:0}),_x=Ut(Dx),Hx=Ve({},Gc,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),Ux=Ut(Hx),qx=Ve({},ui,{newState:0,oldState:0,source:0}),Ix=Ut(qx),Bx=[9,13,27,32],hm=wn&&"CompositionEvent"in window,Fr=null;wn&&"documentMode"in document&&(Fr=document.documentMode);var Lx=wn&&"TextEvent"in window&&!Fr,fv=wn&&(!hm||Fr&&8<Fr&&11>=Fr),$f=" ",xf=!1;function bv(e,t){switch(e){case"keyup":return Bx.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function vv(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var zo=!1;function jx(e,t){switch(e){case"compositionend":return vv(t);case"keypress":return t.which!==32?null:(xf=!0,$f);case"textInput":return e=t.data,e===$f&&xf?null:e;default:return null}}function Gx(e,t){if(zo)return e==="compositionend"||!hm&&bv(e,t)?(e=gv(),Ks=um=Gn=null,zo=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return fv&&t.locale!=="ko"?null:t.data;default:return null}}var Yx={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function Nf(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!Yx[e.type]:t==="textarea"}function yv(e,t,a,n){Ao?Io?Io.push(n):Io=[n]:Ao=n,t=Uc(t,"onChange"),0<t.length&&(a=new jc("onChange","change",null,a,n),e.push({event:a,listeners:t}))}var Wr=null,ml=null;function Xx(e){pw(e,0)}function Yc(e){var t=Kr(e);if(cv(t))return e}function Sf(e,t){if(e==="change")return t}var wv=!1;wn&&(wn?(Os="oninput"in document,Os||(Td=document.createElement("div"),Td.setAttribute("oninput","return;"),Os=typeof Td.oninput=="function"),Rs=Os):Rs=!1,wv=Rs&&(!document.documentMode||9<document.documentMode));var Rs,Os,Td;function Tf(){Wr&&(Wr.detachEvent("onpropertychange",$v),ml=Wr=null)}function $v(e){if(e.propertyName==="value"&&Yc(ml)){var t=[];yv(t,ml,e,cm(e)),pv(Xx,t)}}function Qx(e,t,a){e==="focusin"?(Tf(),Wr=t,ml=a,Wr.attachEvent("onpropertychange",$v)):e==="focusout"&&Tf()}function Zx(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return Yc(ml)}function Kx(e,t){if(e==="click")return Yc(t)}function Jx(e,t){if(e==="input"||e==="change")return Yc(t)}function Px(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var ca=typeof Object.is=="function"?Object.is:Px;function pl(e,t){if(ca(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var a=Object.keys(e),n=Object.keys(t);if(a.length!==n.length)return!1;for(n=0;n<a.length;n++){var o=a[n];if(!ah.call(t,o)||!ca(e[o],t[o]))return!1}return!0}function lh(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}function kf(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function Ef(e,t){var a=kf(e);e=0;for(var n;a;){if(a.nodeType===3){if(n=e+a.textContent.length,e<=t&&n>=t)return{node:a,offset:t-e};e=n}e:{for(;a;){if(a.nextSibling){a=a.nextSibling;break e}a=a.parentNode}a=void 0}a=kf(a)}}function xv(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?xv(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function Nv(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var t=lh(e.document);t instanceof e.HTMLIFrameElement;){try{var a=typeof t.contentWindow.location.href=="string"}catch{a=!1}if(a)e=t.contentWindow;else break;t=lh(e.document)}return t}function mm(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}var Fx=wn&&"documentMode"in document&&11>=document.documentMode,Mo=null,sh=null,el=null,ch=!1;function Cf(e,t,a){var n=a.window===a?a.document:a.nodeType===9?a:a.ownerDocument;ch||Mo==null||Mo!==lh(n)||(n=Mo,"selectionStart"in n&&mm(n)?n={start:n.selectionStart,end:n.selectionEnd}:(n=(n.ownerDocument&&n.ownerDocument.defaultView||window).getSelection(),n={anchorNode:n.anchorNode,anchorOffset:n.anchorOffset,focusNode:n.focusNode,focusOffset:n.focusOffset}),el&&pl(el,n)||(el=n,n=Uc(sh,"onSelect"),0<n.length&&(t=new jc("onSelect","select",null,t,a),e.push({event:t,listeners:n}),t.target=Mo)))}function $i(e,t){var a={};return a[e.toLowerCase()]=t.toLowerCase(),a["Webkit"+e]="webkit"+t,a["Moz"+e]="moz"+t,a}var Ro={animationend:$i("Animation","AnimationEnd"),animationiteration:$i("Animation","AnimationIteration"),animationstart:$i("Animation","AnimationStart"),transitionrun:$i("Transition","TransitionRun"),transitionstart:$i("Transition","TransitionStart"),transitioncancel:$i("Transition","TransitionCancel"),transitionend:$i("Transition","TransitionEnd")},kd={},Sv={};wn&&(Sv=document.createElement("div").style,"AnimationEvent"in window||(delete Ro.animationend.animation,delete Ro.animationiteration.animation,delete Ro.animationstart.animation),"TransitionEvent"in window||delete Ro.transitionend.transition);function ji(e){if(kd[e])return kd[e];if(!Ro[e])return e;var t=Ro[e],a;for(a in t)if(t.hasOwnProperty(a)&&a in Sv)return kd[e]=t[a];return e}var Tv=ji("animationend"),kv=ji("animationiteration"),Ev=ji("animationstart"),Wx=ji("transitionrun"),eN=ji("transitionstart"),tN=ji("transitioncancel"),Cv=ji("transitionend"),Av=new Map,uh="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");uh.push("scrollEnd");function Ia(e,t){Av.set(e,t),Li(t,[e])}var aN=0;function $n(e,t){if(e.name!=null&&e.name!=="auto")return e.name;if(t.autoName!==null)return t.autoName;e=qa.identifierPrefix;var a=aN++;return e="_"+e+"t_"+a.toString(32)+"_",t.autoName=e}function Af(e){if(e==null||typeof e=="string")return e;var t=null,a=Qo;if(a!==null)for(var n=0;n<a.length;n++){var o=e[a[n]];if(o!=null){if(o==="none")return"none";t=t==null?o:t+(" "+o)}}return t??e.default}function En(e,t){return e=Af(e),t=Af(t),t==null?e==="auto"?null:e:t==="auto"?null:t}var bc=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)},ya=[],Oo=0,pm=0;function Xc(){for(var e=Oo,t=pm=Oo=0;t<e;){var a=ya[t];ya[t++]=null;var n=ya[t];ya[t++]=null;var o=ya[t];ya[t++]=null;var l=ya[t];if(ya[t++]=null,n!==null&&o!==null){var c=n.pending;c===null?o.next=o:(o.next=c.next,c.next=o),n.pending=o}l!==0&&zv(a,o,l)}}function Qc(e,t,a,n){ya[Oo++]=e,ya[Oo++]=t,ya[Oo++]=a,ya[Oo++]=n,pm|=n,e.lanes|=n,e=e.alternate,e!==null&&(e.lanes|=n)}function gm(e,t,a,n){return Qc(e,t,a,n),vc(e)}function Gi(e,t){return Qc(e,null,null,t),vc(e)}function zv(e,t,a){e.lanes|=a;var n=e.alternate;n!==null&&(n.lanes|=a);for(var o=!1,l=e.return;l!==null;)l.childLanes|=a,n=l.alternate,n!==null&&(n.childLanes|=a),l.tag===22&&(e=l.stateNode,e===null||e._visibility&1||(o=!0)),e=l,l=l.return;return e.tag===3?(l=e.stateNode,o&&t!==null&&(o=31-la(a),e=l.hiddenUpdates,n=e[o],n===null?e[o]=[t]:n.push(t),t.lane=a|536870912),l):null}function vc(e){if(50<ul)throw ul=0,rc=null,Error(z(185));for(var t=e.return;t!==null;)e=t,t=e.return;return e.tag===3?e.stateNode:null}var Vo={};function nN(e,t,a,n){this.tag=e,this.key=a,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=n,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Yt(e,t,a,n){return new nN(e,t,a,n)}function fm(e){return e=e.prototype,!(!e||!e.isReactComponent)}function vn(e,t){var a=e.alternate;return a===null?(a=Yt(e.tag,t,e.key,e.mode),a.elementType=e.elementType,a.type=e.type,a.stateNode=e.stateNode,a.alternate=e,e.alternate=a):(a.pendingProps=t,a.type=e.type,a.flags=0,a.subtreeFlags=0,a.deletions=null),a.flags=e.flags&1206910976,a.childLanes=e.childLanes,a.lanes=e.lanes,a.child=e.child,a.memoizedProps=e.memoizedProps,a.memoizedState=e.memoizedState,a.updateQueue=e.updateQueue,t=e.dependencies,a.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},a.sibling=e.sibling,a.index=e.index,a.ref=e.ref,a.refCleanup=e.refCleanup,a}function Mv(e,t){e.flags&=1206910978;var a=e.alternate;return a===null?(e.childLanes=0,e.lanes=t,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=a.childLanes,e.lanes=a.lanes,e.child=a.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=a.memoizedProps,e.memoizedState=a.memoizedState,e.updateQueue=a.updateQueue,e.type=a.type,t=a.dependencies,e.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),e}function Ps(e,t,a,n,o,l){var c=0;if(n=e,typeof n=="function")fm(n)&&(c=1);else if(typeof n=="string")c=A5(e,a,rn.current)?26:e==="html"||e==="head"||e==="body"?27:5;else e:switch(n){case Pd:return e=Yt(31,a,t,o),e.elementType=Pd,e.lanes=l,e;case Eo:return Ai(a.children,o,l,t);case Zb:c=8,o|=24;break;case Zd:return e=Yt(12,a,t,o|2),e.elementType=Zd,e.lanes=l,e;case Kd:return e=Yt(13,a,t,o),e.elementType=Kd,e.lanes=l,e;case Jd:return e=Yt(19,a,t,o),e.elementType=Jd,e.lanes=l,e;case G$:case Fd:return e=o|32,e=Yt(30,a,t,e),e.elementType=Fd,e.lanes=l,e.stateNode={autoName:null,paired:null,clones:null,ref:null},e;default:if(typeof n=="object"&&n!==null)switch(n.$$typeof){case tn:c=10;break e;case Kb:c=9;break e;case nm:c=11;break e;case im:c=14;break e;case In:c=16,n=null;break e}c=29,a=Error(z(130,e===null?"null":typeof e,"")),n=null}return t=Yt(c,a,t,o),t.elementType=e,t.type=n,t.lanes=l,t}function Ai(e,t,a,n){return e=Yt(7,e,n,t),e.lanes=a,e}function Ed(e,t,a){return e=Yt(6,e,null,t),e.lanes=a,e}function Rv(e){var t=Yt(18,null,null,0);return t.stateNode=e,t}function Cd(e,t,a){return t=Yt(4,e.children!==null?e.children:[],e.key,t),t.lanes=a,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}var zf=new WeakMap;function Na(e,t){if(typeof e=="object"&&e!==null){var a=zf.get(e);return a!==void 0?a:(t={value:e,source:t,stack:sf(t)},zf.set(e,t),t)}return{value:e,source:t,stack:sf(t)}}var Do=[],_o=0,yc=null,gl=0,wa=[],$a=0,oi=null,nn=1,on="";function fn(e,t){Do[_o++]=gl,Do[_o++]=yc,yc=e,gl=t}function Ov(e,t,a){wa[$a++]=nn,wa[$a++]=on,wa[$a++]=oi,oi=e;var n=nn;e=on;var o=32-la(n)-1;n&=~(1<<o),a+=1;var l=32-la(t)+o;if(30<l){var c=o-o%5;l=(n&(1<<c)-1).toString(32),n>>=c,o-=c,nn=1<<32-la(t)+o|a<<o|n,on=l+e}else nn=1<<l|a<<o|n,on=e}function Zc(e){e.return!==null&&(fn(e,1),Ov(e,1,0))}function bm(e){for(;e===yc;)yc=Do[--_o],Do[_o]=null,gl=Do[--_o],Do[_o]=null;for(;e===oi;)oi=wa[--$a],wa[$a]=null,on=wa[--$a],wa[$a]=null,nn=wa[--$a],wa[$a]=null}function Vv(e,t){wa[$a++]=nn,wa[$a++]=on,wa[$a++]=oi,nn=t.id,on=t.overflow,oi=e}var gt=null,Ue=null,re=!1,Jn=null,Sa=!1,dh=Error(z(519));function ri(e){var t=Error(z(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw fl(Na(t,e)),dh}function Mf(e){var t=e.stateNode,a=e.type,n=e.memoizedProps;switch(t[vt]=e,t[Zt]=n,a){case"dialog":ce("cancel",t),ce("close",t);break;case"iframe":case"object":case"embed":ce("load",t);break;case"video":case"audio":for(a=0;a<wl.length;a++)ce(wl[a],t);break;case"source":ce("error",t);break;case"img":case"image":case"link":ce("error",t),ce("load",t);break;case"details":ce("toggle",t);break;case"input":ce("invalid",t),uv(t,n.value,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name,!0);break;case"select":ce("invalid",t);break;case"textarea":ce("invalid",t),hv(t,n.value,n.defaultValue,n.children)}a=n.children,typeof a!="string"&&typeof a!="number"&&typeof a!="bigint"||t.textContent===""+a||n.suppressHydrationWarning===!0||fw(t.textContent,a)?(n.popover!=null&&(ce("beforetoggle",t),ce("toggle",t)),n.onScroll!=null&&ce("scroll",t),n.onScrollEnd!=null&&ce("scrollend",t),n.onClick!=null&&(t.onclick=an),t=!0):t=!1,t||ri(e,!0)}function wc(e){for(gt=e.return;gt;)switch(gt.tag){case 5:case 31:case 13:Sa=!1;return;case 27:case 3:Sa=!0;return;default:gt=gt.return}}function $o(e){if(e!==gt)return!1;if(!re)return wc(e),re=!0,!1;var t=e.tag,a;if((a=t!==3&&t!==27)&&((a=t===5)&&(a=e.type,a=!(a!=="form"&&a!=="button")||Kh(e.type,e.memoizedProps)),a=!a),a&&Ue&&ri(e),wc(e),t===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(z(317));Ue=Eb(e)}else if(t===31){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(z(317));Ue=Eb(e)}else t===27?(t=Ue,di(e.type)?(e=Wh,Wh=null,Ue=e):Ue=t):Ue=gt?Ta(e.stateNode.nextSibling):null;return!0}function Oi(){Ue=gt=null,re=!1}function Ad(){var e=Jn;return e!==null&&(jt===null?jt=e:jt.push.apply(jt,e),Jn=null),e}function fl(e){Jn===null?Jn=[e]:Jn.push(e)}var hh=cn(null),Yi=null,bn=null;function Yn(e,t,a){qe(hh,t._currentValue),t._currentValue=a}function yn(e){e._currentValue=hh.current,wt(hh)}function Fs(e,t,a){for(;e!==null;){var n=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,n!==null&&(n.childLanes|=t)):n!==null&&(n.childLanes&t)!==t&&(n.childLanes|=t),e===a)break;e=e.return}}function mh(e,t,a,n){var o=e.child;for(o!==null&&(o.return=e);o!==null;){var l=o.dependencies;if(l!==null){var c=o.child;l=l.firstContext;e:for(;l!==null;){var d=l;l=o;for(var h=0;h<t.length;h++)if(d.context===t[h]){l.lanes|=a,d=l.alternate,d!==null&&(d.lanes|=a),Fs(l.return,a,e),n||(c=null);break e}l=d.next}}else if(o.tag===18){if(c=o.return,c===null)throw Error(z(341));c.lanes|=a,l=c.alternate,l!==null&&(l.lanes|=a),Fs(c,a,e),c=null}else o.tag===13&&o.memoizedState!==null&&o.memoizedState.dehydrated===null?(o.lanes|=a,c=o.alternate,c!==null&&(c.lanes|=a),Fs(o.return,a,e),c=o.child,c=c!==null?c.sibling:null):c=o.child;if(c!==null)c.return=o;else for(c=o;c!==null;){if(c===e){c=null;break}if(o=c.sibling,o!==null){o.return=c.return,c=o;break}c=c.return}o=c}}function Vi(e,t,a,n){e=null;for(var o=t,l=!1;o!==null;){if(!l){if((o.flags&524288)!==0)l=!0;else if((o.flags&262144)!==0)break}if(o.tag===10){var c=o.alternate;if(c===null)throw Error(z(387));if(c=c.memoizedProps,c!==null){var d=o.type;ca(o.pendingProps.value,c.value)||(e!==null?e.push(d):e=[d])}}else if(o===hc.current){if(c=o.alternate,c===null)throw Error(z(387));c.memoizedState.memoizedState!==o.memoizedState.memoizedState&&(e!==null?e.push(ir):e=[ir])}o=o.return}return e!==null&&mh(t,e,a,n),t.flags|=262144,e!==null}function $c(e){for(e=e.firstContext;e!==null;){if(!ca(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function Di(e){Yi=e,bn=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function yt(e){return Dv(Yi,e)}function Vs(e,t){return Yi===null&&Di(e),Dv(e,t)}function Dv(e,t){var a=t._currentValue;if(t={context:t,memoizedValue:a,next:null},bn===null){if(e===null)throw Error(z(308));bn=t,e.dependencies={lanes:0,firstContext:t},e.flags|=524288}else bn=bn.next=t;return a}var iN=typeof AbortController<"u"?AbortController:function(){var e=[],t=this.signal={aborted:!1,addEventListener:function(a,n){e.push(n)}};this.abort=function(){t.aborted=!0,e.forEach(function(a){return a()})}},oN=ct.unstable_scheduleCallback,rN=ct.unstable_NormalPriority,tt={$$typeof:tn,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function vm(){return{controller:new iN,data:new Map,refCount:0}}function Ol(e){e.refCount--,e.refCount===0&&oN(rN,function(){e.controller.abort()})}function Rf(e,t){if((e.pendingLanes&4194048)!==0){var a=e.transitionTypes;for(a===null&&(a=e.transitionTypes=[]),e=0;e<t.length;e++){var n=t[e];a.indexOf(n)===-1&&a.push(n)}}}var Jr=null;function lN(e){var t=e.transitionTypes;return e.transitionTypes=null,t}var tl=null,ph=0,_i=0,Bo=null;function sN(e,t){if(tl===null){var a=tl=[];ph=0,_i=Xm(),Bo={status:"pending",value:void 0,then:function(n){a.push(n)}}}return ph++,t.then(Of,Of),t}function Of(){if(--ph===0&&(Jr=null,tl!==null)){Bo!==null&&(Bo.status="fulfilled");var e=tl;tl=null,_i=0,Bo=null;for(var t=0;t<e.length;t++)(0,e[t])()}}function cN(e,t){var a=[],n={status:"pending",value:null,reason:null,then:function(o){a.push(o)}};return e.then(function(){n.status="fulfilled",n.value=t;for(var o=0;o<a.length;o++)(0,a[o])(t)},function(o){for(n.status="rejected",n.reason=o,o=0;o<a.length;o++)(0,a[o])(void 0)}),n}var Vf=F.S;F.S=function(e,t){if(Wy=oa(),typeof t=="object"&&t!==null&&typeof t.then=="function"&&sN(e,t),Jr!==null)for(var a=tr;a!==null;)Rf(a,Jr),a=a.next;if(a=e.types,a!==null){for(var n=tr;n!==null;)Rf(n,a),n=n.next;if(_i!==0){n=Jr,n===null&&(n=Jr=[]);for(var o=0;o<a.length;o++){var l=a[o];n.indexOf(l)===-1&&n.push(l)}}}Vf!==null&&Vf(e,t)};var zi=cn(null);function ym(){var e=zi.current;return e!==null?e:Oe.pooledCache}function Ws(e,t){t===null?qe(zi,zi.current):qe(zi,t.pool)}function _v(){var e=ym();return e===null?null:{parent:tt._currentValue,pool:e}}var cr=Error(z(460)),wm=Error(z(474)),Kc=Error(z(542)),xc={then:function(){}};function Df(e){return e=e.status,e==="fulfilled"||e==="rejected"}function Hv(e,t,a){switch(a=e[a],a===void 0?e.push(t):a!==t&&(t.then(an,an),t=a),t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,Hf(e),e===void 0&&!("reason"in t)?Error(z(600)):e;default:if(typeof t.status=="string")t.then(an,an);else{if(e=Oe,e!==null&&100<e.shellSuspendCounter)throw Error(z(482));e=t,e.status="pending",e.then(function(n){if(t.status==="pending"){var o=t;o.status="fulfilled",o.value=n}},function(n){if(t.status==="pending"){var o=t;o.status="rejected",o.reason=n}})}switch(t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,Hf(e),e}throw Mi=t,cr}}function Si(e){try{var t=e._init;return t(e._payload)}catch(a){throw a!==null&&typeof a=="object"&&typeof a.then=="function"?(Mi=a,cr):a}}var Mi=null;function _f(){if(Mi===null)throw Error(z(459));var e=Mi;return Mi=null,e}function Hf(e){if(e===cr||e===Kc)throw Error(z(483))}var Lo=null,bl=0;function Ds(e){var t=bl;return bl+=1,Lo===null&&(Lo=[]),Hv(Lo,e,t)}function Hn(e,t){t=t.props.ref,e.ref=t!==void 0?t:null}function _s(e,t){throw t.$$typeof===j$?Error(z(525)):(e=Object.prototype.toString.call(t),Error(z(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)))}function Uv(e){function t(w,v){if(e){var b=w.deletions;b===null?(w.deletions=[v],w.flags|=16):b.push(v)}}function a(w,v){if(!e)return null;for(;v!==null;)t(w,v),v=v.sibling;return null}function n(w){for(var v=new Map;w!==null;)w.key===null?v.set(w.index,w):v.set(w.key,w),w=w.sibling;return v}function o(w,v){return w=vn(w,v),w.index=0,w.sibling=null,w}function l(w,v,b){return w.index=b,e?(b=w.alternate,b!==null?(b=b.index,b<v?(w.flags|=2,v):b):(w.flags|=134217730,v)):(w.flags|=1048576,v)}function c(w){return e&&w.alternate===null&&(w.flags|=134217730),w}function d(w,v,b,S){return v===null||v.tag!==6?(v=Ed(b,w.mode,S),v.return=w,v):(v=o(v,b),v.return=w,v)}function h(w,v,b,S){var R=b.type;return R===Eo?(w=y(w,v,b.props.children,S,b.key),Hn(w,b),w):v!==null&&(v.elementType===R||typeof R=="object"&&R!==null&&R.$$typeof===In&&Si(R)===v.type)?(v=o(v,b.props),Hn(v,b),v.return=w,v):(v=Ps(b.type,b.key,b.props,null,w.mode,S),Hn(v,b),v.return=w,v)}function g(w,v,b,S){return v===null||v.tag!==4||v.stateNode.containerInfo!==b.containerInfo||v.stateNode.implementation!==b.implementation?(v=Cd(b,w.mode,S),v.return=w,v):(v=o(v,b.children||[]),v.return=w,v)}function y(w,v,b,S,R){return v===null||v.tag!==7?(v=Ai(b,w.mode,S,R),v.return=w,v):(v=o(v,b),v.return=w,v)}function N(w,v,b){if(typeof v=="string"&&v!==""||typeof v=="number"||typeof v=="bigint")return v=Ed(""+v,w.mode,b),v.return=w,v;if(typeof v=="object"&&v!==null){switch(v.$$typeof){case ks:return b=Ps(v.type,v.key,v.props,null,w.mode,b),Hn(b,v),b.return=w,b;case Qr:return v=Cd(v,w.mode,b),v.return=w,v;case In:return v=Si(v),N(w,v,b)}if(Zr(v)||Br(v))return v=Ai(v,w.mode,b,null),v.return=w,v;if(typeof v.then=="function")return N(w,Ds(v),b);if(v.$$typeof===tn)return N(w,Vs(w,v),b);_s(w,v)}return null}function f(w,v,b,S){var R=v!==null?v.key:null;if(typeof b=="string"&&b!==""||typeof b=="number"||typeof b=="bigint")return R!==null?null:d(w,v,""+b,S);if(typeof b=="object"&&b!==null){switch(b.$$typeof){case ks:return b.key===R?h(w,v,b,S):null;case Qr:return b.key===R?g(w,v,b,S):null;case In:return b=Si(b),f(w,v,b,S)}if(Zr(b)||Br(b))return R!==null?null:y(w,v,b,S,null);if(typeof b.then=="function")return f(w,v,Ds(b),S);if(b.$$typeof===tn)return f(w,v,Vs(w,b),S);_s(w,b)}return null}function $(w,v,b,S,R){if(typeof S=="string"&&S!==""||typeof S=="number"||typeof S=="bigint")return w=w.get(b)||null,d(v,w,""+S,R);if(typeof S=="object"&&S!==null){switch(S.$$typeof){case ks:return w=w.get(S.key===null?b:S.key)||null,h(v,w,S,R);case Qr:return w=w.get(S.key===null?b:S.key)||null,g(v,w,S,R);case In:return S=Si(S),$(w,v,b,S,R)}if(Zr(S)||Br(S))return w=w.get(b)||null,y(v,w,S,R,null);if(typeof S.then=="function")return $(w,v,b,Ds(S),R);if(S.$$typeof===tn)return $(w,v,b,Vs(v,S),R);_s(v,S)}return null}function C(w,v,b,S){for(var R=null,P=null,U=v,B=v=0,fe=null;U!==null&&B<b.length;B++){U.index>B?(fe=U,U=null):fe=U.sibling;var Y=f(w,U,b[B],S);if(Y===null){U===null&&(U=fe);break}e&&U&&Y.alternate===null&&t(w,U),v=l(Y,v,B),P===null?R=Y:P.sibling=Y,P=Y,U=fe}if(B===b.length)return a(w,U),re&&fn(w,B),R;if(U===null){for(;B<b.length;B++)U=N(w,b[B],S),U!==null&&(v=l(U,v,B),P===null?R=U:P.sibling=U,P=U);return re&&fn(w,B),R}for(U=n(U);B<b.length;B++)fe=$(U,w,B,b[B],S),fe!==null&&(e&&(Y=fe.alternate,Y!==null&&U.delete(Y.key===null?B:Y.key)),v=l(fe,v,B),P===null?R=fe:P.sibling=fe,P=fe);return e&&U.forEach(function(De){return t(w,De)}),re&&fn(w,B),R}function k(w,v,b,S){if(b==null)throw Error(z(151));for(var R=null,P=null,U=v,B=v=0,fe=null,Y=b.next();U!==null&&!Y.done;B++,Y=b.next()){U.index>B?(fe=U,U=null):fe=U.sibling;var De=f(w,U,Y.value,S);if(De===null){U===null&&(U=fe);break}e&&U&&De.alternate===null&&t(w,U),v=l(De,v,B),P===null?R=De:P.sibling=De,P=De,U=fe}if(Y.done)return a(w,U),re&&fn(w,B),R;if(U===null){for(;!Y.done;B++,Y=b.next())Y=N(w,Y.value,S),Y!==null&&(v=l(Y,v,B),P===null?R=Y:P.sibling=Y,P=Y);return re&&fn(w,B),R}for(U=n(U);!Y.done;B++,Y=b.next())Y=$(U,w,B,Y.value,S),Y!==null&&(e&&(fe=Y.alternate,fe!==null&&U.delete(fe.key===null?B:fe.key)),v=l(Y,v,B),P===null?R=Y:P.sibling=Y,P=Y);return e&&U.forEach(function(Fe){return t(w,Fe)}),re&&fn(w,B),R}function D(w,v,b,S){if(typeof b=="object"&&b!==null&&b.type===Eo&&b.key===null&&b.props.ref===void 0&&(b=b.props.children),typeof b=="object"&&b!==null){switch(b.$$typeof){case ks:e:{for(var R=b.key;v!==null;){if(v.key===R){if(R=b.type,R===Eo){if(v.tag===7){a(w,v.sibling),S=o(v,b.props.children),Hn(S,b),S.return=w,w=S;break e}}else if(v.elementType===R||typeof R=="object"&&R!==null&&R.$$typeof===In&&Si(R)===v.type){a(w,v.sibling),S=o(v,b.props),Hn(S,b),S.return=w,w=S;break e}a(w,v);break}else t(w,v);v=v.sibling}b.type===Eo?(S=Ai(b.props.children,w.mode,S,b.key),Hn(S,b),S.return=w,w=S):(S=Ps(b.type,b.key,b.props,null,w.mode,S),Hn(S,b),S.return=w,w=S)}return c(w);case Qr:e:{for(R=b.key;v!==null;){if(v.key===R)if(v.tag===4&&v.stateNode.containerInfo===b.containerInfo&&v.stateNode.implementation===b.implementation){a(w,v.sibling),S=o(v,b.children||[]),S.return=w,w=S;break e}else{a(w,v);break}else t(w,v);v=v.sibling}S=Cd(b,w.mode,S),S.return=w,w=S}return c(w);case In:return b=Si(b),D(w,v,b,S)}if(Zr(b))return C(w,v,b,S);if(Br(b)){if(R=Br(b),typeof R!="function")throw Error(z(150));return b=R.call(b),k(w,v,b,S)}if(typeof b.then=="function")return D(w,v,Ds(b),S);if(b.$$typeof===tn)return D(w,v,Vs(w,b),S);_s(w,b)}return typeof b=="string"&&b!==""||typeof b=="number"||typeof b=="bigint"?(b=""+b,v!==null&&v.tag===6?(a(w,v.sibling),S=o(v,b),S.return=w,w=S):(a(w,v),S=Ed(b,w.mode,S),S.return=w,w=S),c(w)):a(w,v)}return function(w,v,b,S){try{bl=0;var R=D(w,v,b,S);return Lo=null,R}catch(U){if(U===cr||U===Kc)throw U;var P=Yt(29,U,null,w.mode);return P.lanes=S,P.return=w,P}}}var Hi=Uv(!0),qv=Uv(!1),Bn=!1;function $m(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function gh(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function Pn(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function Fn(e,t,a){var n=e.updateQueue;if(n===null)return null;if(n=n.shared,(we&2)!==0){var o=n.pending;return o===null?t.next=t:(t.next=o.next,o.next=t),n.pending=t,t=vc(e),zv(e,null,a),t}return Qc(e,n,t,a),vc(e)}function al(e,t,a){if(t=t.updateQueue,t!==null&&(t=t.shared,(a&4194048)!==0)){var n=t.lanes;n&=e.pendingLanes,a|=n,t.lanes=a,av(e,a)}}function zd(e,t){var a=e.updateQueue,n=e.alternate;if(n!==null&&(n=n.updateQueue,a===n)){var o=null,l=null;if(a=a.firstBaseUpdate,a!==null){do{var c={lane:a.lane,tag:a.tag,payload:a.payload,callback:null,next:null};l===null?o=l=c:l=l.next=c,a=a.next}while(a!==null);l===null?o=l=t:l=l.next=t}else o=l=t;a={baseState:n.baseState,firstBaseUpdate:o,lastBaseUpdate:l,shared:n.shared,callbacks:n.callbacks},e.updateQueue=a;return}e=a.lastBaseUpdate,e===null?a.firstBaseUpdate=t:e.next=t,a.lastBaseUpdate=t}var fh=!1;function nl(){if(fh){var e=Bo;if(e!==null)throw e}}function il(e,t,a,n){fh=!1;var o=e.updateQueue;Bn=!1;var l=o.firstBaseUpdate,c=o.lastBaseUpdate,d=o.shared.pending;if(d!==null){o.shared.pending=null;var h=d,g=h.next;h.next=null,c===null?l=g:c.next=g,c=h;var y=e.alternate;y!==null&&(y=y.updateQueue,d=y.lastBaseUpdate,d!==c&&(d===null?y.firstBaseUpdate=g:d.next=g,y.lastBaseUpdate=h))}if(l!==null){var N=o.baseState;c=0,y=g=h=null,d=l;do{var f=d.lane&-536870913,$=f!==d.lane;if($?(ge&f)===f:(n&f)===f){f!==0&&f===_i&&(fh=!0),y!==null&&(y=y.next={lane:0,tag:d.tag,payload:d.payload,callback:null,next:null});e:{var C=e,k=d;f=t;var D=a;switch(k.tag){case 1:if(C=k.payload,typeof C=="function"){N=C.call(D,N,f);break e}N=C;break e;case 3:C.flags=C.flags&-65537|128;case 0:if(C=k.payload,f=typeof C=="function"?C.call(D,N,f):C,f==null)break e;N=Ve({},N,f);break e;case 2:Bn=!0}}f=d.callback,f!==null&&(e.flags|=64,$&&(e.flags|=8192),$=o.callbacks,$===null?o.callbacks=[f]:$.push(f))}else $={lane:f,tag:d.tag,payload:d.payload,callback:d.callback,next:null},y===null?(g=y=$,h=N):y=y.next=$,c|=f;if(d=d.next,d===null){if(d=o.shared.pending,d===null)break;$=d,d=$.next,$.next=null,o.lastBaseUpdate=$,o.shared.pending=null}}while(!0);y===null&&(h=N),o.baseState=h,o.firstBaseUpdate=g,o.lastBaseUpdate=y,l===null&&(o.shared.lanes=0),ci|=c,e.lanes=c,e.memoizedState=N}}function Iv(e,t){if(typeof e!="function")throw Error(z(191,e));e.call(t)}function Bv(e,t){var a=e.callbacks;if(a!==null)for(e.callbacks=null,e=0;e<a.length;e++)Iv(a[e],t)}var li=cn(null),Nc=cn(0);function Uf(e,t){e=Tn,qe(Nc,e),qe(li,t),Tn=e|t.baseLanes}function bh(){qe(Nc,Tn),qe(li,li.current)}function xm(){Tn=Nc.current,wt(li),wt(Nc)}var Nt=cn(null),Ct=null;function Wn(e){var t=e.alternate;qe($t,$t.current&1),qe(Nt,e),Ct===null&&(t===null||li.current!==null||t.memoizedState!==null)&&(Ct=e)}function vh(e){qe($t,$t.current),qe(Nt,e),Ct===null&&(Ct=e)}function Lv(e){e.tag===22?(qe($t,$t.current),qe(Nt,e),Ct===null&&(Ct=e)):ei()}function ei(){qe($t,$t.current),qe(Nt,Nt.current)}function aa(e){wt(Nt),Ct===e&&(Ct=null),wt($t)}var $t=cn(0);function vl(e,t){qe(Nt,Nt.current),qe($t,t)}function Nm(e){wt($t),wt(Nt),Ct===e&&(Ct=null)}function Sc(e){for(var t=e;t!==null;){if(t.tag===13){var a=t.memoizedState;if(a!==null&&(a=a.dehydrated,a===null||Fh(a)||Jm(a)))return t}else if(t.tag===19&&t.memoizedProps.revealOrder!=="independent"){if((t.flags&128)!==0)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var xn=0,ne=null,Ce=null,et=null,Tc=!1,jo=!1,Ui=!1,kc=0,yl=0,Go=null,uN=0;function Qe(){throw Error(z(321))}function Sm(e,t){if(t===null)return!1;for(var a=0;a<t.length&&a<e.length;a++)if(!ca(e[a],t[a]))return!1;return!0}function Tm(e,t,a,n,o,l){return xn=l,ne=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,F.H=e===null||e.memoizedState===null?yy:wy,Ui=!1,l=a(n,o),Ui=!1,jo&&(l=Gv(t,a,n,o)),jv(e),l}function jv(e){F.H=Ec;var t=Ce!==null&&Ce.next!==null;if(xn=0,et=Ce=ne=null,Tc=!1,yl=0,Go=null,t)throw Error(z(300));e===null||at||(e=e.dependencies,e!==null&&$c(e)&&(at=!0))}function Gv(e,t,a,n){ne=e;var o=0;do{if(jo&&(Go=null),yl=0,jo=!1,25<=o)throw Error(z(301));if(o+=1,et=Ce=null,e.updateQueue!=null){var l=e.updateQueue;l.lastEffect=null,l.events=null,l.stores=null,l.memoCache!=null&&(l.memoCache.index=0)}F.H=vN,l=t(a,n)}while(jo);return l}function dN(){var e=F.H,t=e.useState()[0];return t=typeof t.then=="function"?Vl(t):t,e=e.useState()[0],(Ce!==null?Ce.memoizedState:null)!==e&&(ne.flags|=1024),t}function km(){var e=kc!==0;return kc=0,e}function Em(e,t,a){t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~a}function Cm(e){if(Tc){for(e=e.memoizedState;e!==null;){var t=e.queue;t!==null&&(t.pending=null),e=e.next}Tc=!1}xn=0,et=Ce=ne=null,jo=!1,yl=kc=0,Go=null}function Ht(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return et===null?ne.memoizedState=et=e:et=et.next=e,et}function Pe(){if(Ce===null){var e=ne.alternate;e=e!==null?e.memoizedState:null}else e=Ce.next;var t=et===null?ne.memoizedState:et.next;if(t!==null)et=t,Ce=e;else{if(e===null)throw ne.alternate===null?Error(z(467)):Error(z(310));Ce=e,e={memoizedState:Ce.memoizedState,baseState:Ce.baseState,baseQueue:Ce.baseQueue,queue:Ce.queue,next:null},et===null?ne.memoizedState=et=e:et=et.next=e}return et}function Jc(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function Vl(e){var t=yl;return yl+=1,Go===null&&(Go=[]),e=Hv(Go,e,t),t=ne,(et===null?t.memoizedState:et.next)===null&&(t=t.alternate,F.H=t===null||t.memoizedState===null?yy:wy),e}function Pc(e){if(e!==null&&typeof e=="object"){if(typeof e.then=="function")return Vl(e);if(e.$$typeof===X$)return;if(e.$$typeof===tn)return yt(e)}throw Error(z(438,String(e)))}function Am(e){var t=null,a=ne.updateQueue;if(a!==null&&(t=a.memoCache),t==null){var n=ne.alternate;n!==null&&(n=n.updateQueue,n!==null&&(n=n.memoCache,n!=null&&(t={data:n.data.map(function(o){return o.slice()}),index:0})))}if(t==null&&(t={data:[],index:0}),a===null&&(a=Jc(),ne.updateQueue=a),a.memoCache=t,a=t.data[t.index],a===void 0)for(a=t.data[t.index]=Array(e),n=0;n<e;n++)a[n]=Y$;return t.index++,a}function Nn(e,t){return typeof t=="function"?t(e):t}function ec(e){var t=Pe();return zm(t,Ce,e)}function zm(e,t,a){var n=e.queue;if(n===null)throw Error(z(311));n.lastRenderedReducer=a;var o=e.baseQueue,l=n.pending;if(l!==null){if(o!==null){var c=o.next;o.next=l.next,l.next=c}t.baseQueue=o=l,n.pending=null}if(l=e.baseState,o===null)e.memoizedState=l;else{t=o.next;var d=c=null,h=null,g=t,y=!1;do{var N=g.lane&-536870913;if(N!==g.lane?(ge&N)===N:(xn&N)===N){var f=g.revertLane;if(f===0)h!==null&&(h=h.next={lane:0,revertLane:0,gesture:null,action:g.action,hasEagerState:g.hasEagerState,eagerState:g.eagerState,next:null}),N===_i&&(y=!0);else if((xn&f)===f){g=g.next,f===_i&&(y=!0);continue}else N={lane:0,revertLane:g.revertLane,gesture:null,action:g.action,hasEagerState:g.hasEagerState,eagerState:g.eagerState,next:null},h===null?(d=h=N,c=l):h=h.next=N,ne.lanes|=f,ci|=f;N=g.action,Ui&&a(l,N),l=g.hasEagerState?g.eagerState:a(l,N)}else f={lane:N,revertLane:g.revertLane,gesture:g.gesture,action:g.action,hasEagerState:g.hasEagerState,eagerState:g.eagerState,next:null},h===null?(d=h=f,c=l):h=h.next=f,ne.lanes|=N,ci|=N;g=g.next}while(g!==null&&g!==t);if(h===null?c=l:h.next=d,!ca(l,e.memoizedState)&&(at=!0,y&&(a=Bo,a!==null)))throw a;e.memoizedState=l,e.baseState=c,e.baseQueue=h,n.lastRenderedState=l}return o===null&&(n.lanes=0),[e.memoizedState,n.dispatch]}function Md(e){var t=Pe(),a=t.queue;if(a===null)throw Error(z(311));a.lastRenderedReducer=e;var n=a.dispatch,o=a.pending,l=t.memoizedState;if(o!==null){a.pending=null;var c=o=o.next;do l=e(l,c.action),c=c.next;while(c!==o);ca(l,t.memoizedState)||(at=!0),t.memoizedState=l,t.baseQueue===null&&(t.baseState=l),a.lastRenderedState=l}return[l,n]}function Yv(e,t,a){var n=ne,o=Pe(),l=re;if(l){if(a===void 0)throw Error(z(407));a=a()}else a=t();var c=!ca((Ce||o).memoizedState,a);if(c&&(o.memoizedState=a,at=!0),o=o.queue,Mm(Zv.bind(null,n,o,e),[e]),e=o.getSnapshot!==t||c||et!==null&&(et.memoizedState.tag&1)!==0,Po(e?9:8,{destroy:void 0},Qv.bind(null,n,o,a,t),null),e){if(n.flags|=2048,Oe===null)throw Error(z(349));l||(xn&127)!==0||Xv(n,t,a)}return a}function Xv(e,t,a){e.flags|=16384,e={getSnapshot:t,value:a},t=ne.updateQueue,t===null?(t=Jc(),ne.updateQueue=t,t.stores=[e]):(a=t.stores,a===null?t.stores=[e]:a.push(e))}function Qv(e,t,a,n){t.value=a,t.getSnapshot=n,Kv(t)&&Jv(e)}function Zv(e,t,a){return a(function(){Kv(t)&&Jv(e)})}function Kv(e){var t=e.getSnapshot;e=e.value;try{var a=t();return!ca(e,a)}catch{return!0}}function Jv(e){var t=Gi(e,2);t!==null&&Xt(t,e,2)}function yh(e){var t=Ht();if(typeof e=="function"){var a=e;if(e=a(),Ui){jn(!0);try{a()}finally{jn(!1)}}}return t.memoizedState=t.baseState=e,t.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Nn,lastRenderedState:e},t}function Pv(e,t,a,n){return e.baseState=a,zm(e,Ce,typeof n=="function"?n:Nn)}function hN(e,t,a,n,o){if(Wc(e))throw Error(z(485));if(e=t.action,e!==null){var l={payload:o,action:e,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(c){l.listeners.push(c)}};F.T!==null?a(!0):l.isTransition=!1,n(l),a=t.pending,a===null?(l.next=t.pending=l,Fv(t,l)):(l.next=a.next,t.pending=a.next=l)}}function Fv(e,t){var a=t.action,n=t.payload,o=e.state;if(t.isTransition){var l=F.T,c={};c.types=l!==null?l.types:null,F.T=c;try{var d=a(o,n),h=F.S;h!==null&&h(c,d),qf(e,t,d)}catch(g){wh(e,t,g)}finally{l!==null&&c.types!==null&&(l.types=c.types),F.T=l}}else try{l=a(o,n),qf(e,t,l)}catch(g){wh(e,t,g)}}function qf(e,t,a){a!==null&&typeof a=="object"&&typeof a.then=="function"?a.then(function(n){If(e,t,n)},function(n){return wh(e,t,n)}):If(e,t,a)}function If(e,t,a){t.status="fulfilled",t.value=a,Wv(t),e.state=a,t=e.pending,t!==null&&(a=t.next,a===t?e.pending=null:(a=a.next,t.next=a,Fv(e,a)))}function wh(e,t,a){var n=e.pending;if(e.pending=null,n!==null){n=n.next;do t.status="rejected",t.reason=a,Wv(t),t=t.next;while(t!==n)}e.action=null}function Wv(e){e=e.listeners;for(var t=0;t<e.length;t++)(0,e[t])()}function ey(e,t){return t}function Bf(e,t){if(re){var a=Oe.formState;if(a!==null){e:{var n=ne;if(re){if(Ue){t:{for(var o=Ue,l=Sa;o.nodeType!==8;){if(!l){o=null;break t}if(o=Ta(o.nextSibling),o===null){o=null;break t}}l=o.data,o=l==="F!"||l==="F"?o:null}if(o){Ue=Ta(o.nextSibling),n=o.data==="F!";break e}}ri(n)}n=!1}n&&(t=a[0])}}return a=Ht(),a.memoizedState=a.baseState=t,n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:ey,lastRenderedState:t},a.queue=n,a=fy.bind(null,ne,n),n.dispatch=a,n=yh(!1),l=Dm.bind(null,ne,!1,n.queue),n=Ht(),o={state:t,dispatch:null,action:e,pending:null},n.queue=o,a=hN.bind(null,ne,o,l,a),o.dispatch=a,n.memoizedState=e,[t,a,!1]}function Lf(e){var t=Pe();return ty(t,Ce,e)}function ty(e,t,a){if(t=zm(e,t,ey)[0],e=ec(Nn)[0],typeof t=="object"&&t!==null&&typeof t.then=="function")try{var n=Vl(t)}catch(c){throw c===cr?Kc:c}else n=t;t=Pe();var o=t.queue,l=o.dispatch;return a!==t.memoizedState&&(ne.flags|=2048,Po(9,{destroy:void 0},mN.bind(null,o,a),null)),[n,l,e]}function mN(e,t){e.action=t}function jf(e){var t=Pe(),a=Ce;if(a!==null)return ty(t,a,e);Pe(),t=t.memoizedState,a=Pe();var n=a.queue.dispatch;return a.memoizedState=e,[t,n,!1]}function Po(e,t,a,n){return e={tag:e,create:a,deps:n,inst:t,next:null},t=ne.updateQueue,t===null&&(t=Jc(),ne.updateQueue=t),a=t.lastEffect,a===null?t.lastEffect=e.next=e:(n=a.next,a.next=e,e.next=n,t.lastEffect=e),e}function ay(){return Pe().memoizedState}function tc(e,t,a,n){var o=Ht();ne.flags|=e,o.memoizedState=Po(1|t,{destroy:void 0},a,n===void 0?null:n)}function Fc(e,t,a,n){var o=Pe();n=n===void 0?null:n;var l=o.memoizedState.inst;Ce!==null&&n!==null&&Sm(n,Ce.memoizedState.deps)?o.memoizedState=Po(t,l,a,n):(ne.flags|=e,o.memoizedState=Po(1|t,l,a,n))}function Gf(e,t){tc(8390656,8,e,t)}function Mm(e,t){Fc(2048,8,e,t)}function pN(e){ne.flags|=4;var t=ne.updateQueue;if(t===null)t=Jc(),ne.updateQueue=t,t.events=[e];else{var a=t.events;a===null?t.events=[e]:a.push(e)}}function ny(e){var t=Pe().memoizedState;return pN({ref:t,nextImpl:e}),function(){if((we&2)!==0)throw Error(z(440));return t.impl.apply(void 0,arguments)}}function iy(e,t){return Fc(4,2,e,t)}function oy(e,t){return Fc(4,4,e,t)}function ry(e,t){if(typeof t=="function"){e=e();var a=t(e);return function(){typeof a=="function"?a():t(null)}}if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function ly(e,t,a){a=a!=null?a.concat([e]):null,Fc(4,4,ry.bind(null,t,e),a)}function Rm(){}function sy(e,t){var a=Pe();t=t===void 0?null:t;var n=a.memoizedState;return t!==null&&Sm(t,n[1])?n[0]:(a.memoizedState=[e,t],e)}function cy(e,t){var a=Pe();t=t===void 0?null:t;var n=a.memoizedState;if(t!==null&&Sm(t,n[1]))return n[0];if(n=e(),Ui){jn(!0);try{e()}finally{jn(!1)}}return a.memoizedState=[n,t],n}function Om(e,t,a){return a===void 0||(xn&1073741824)!==0&&(ge&261930)===0?e.memoizedState=t:(e.memoizedState=a,e=tw(),ne.lanes|=e,ci|=e,a)}function uy(e,t,a,n){return ca(a,t)?a:li.current!==null?(e=Om(e,a,n),ca(e,t)||(at=!0),e):(xn&106)===0||(xn&1073741824)!==0&&(ge&261930)===0?(at=!0,e.memoizedState=a):(e=tw(),ne.lanes|=e,ci|=e,t)}function dy(e,t,a,n,o){var l=$e.p;$e.p=l!==0&&8>l?l:8;var c=F.T,d={};d.types=c!==null?c.types:null,F.T=d,Dm(e,!1,t,a);try{var h=o(),g=F.S;if(g!==null&&g(d,h),h!==null&&typeof h=="object"&&typeof h.then=="function"){var y=cN(h,n);ol(e,t,y,sa(e))}else ol(e,t,n,sa(e))}catch(N){ol(e,t,{then:function(){},status:"rejected",reason:N},sa())}finally{$e.p=l,c!==null&&d.types!==null&&(c.types=d.types),F.T=c}}function gN(){}function $h(e,t,a,n){if(e.tag!==5)throw Error(z(476));var o=hy(e).queue;dy(e,o,t,Ci,a===null?gN:function(){return my(e),a(n)})}function hy(e){var t=e.memoizedState;if(t!==null)return t;t={memoizedState:Ci,baseState:Ci,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Nn,lastRenderedState:Ci},next:null};var a={};return t.next={memoizedState:a,baseState:a,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:Nn,lastRenderedState:a},next:null},e.memoizedState=t,e=e.alternate,e!==null&&(e.memoizedState=t),t}function my(e){var t=hy(e);t.next===null&&(t=e.alternate.memoizedState),ol(e,t.next.queue,{},sa())}function Vm(){return yt(ir)}function py(){return Pe().memoizedState}function gy(){return Pe().memoizedState}function fN(e){for(var t=e.return;t!==null;){switch(t.tag){case 24:case 3:var a=sa();e=Pn(a);var n=Fn(t,e,a);n!==null&&(Xt(n,t,a),al(n,t,a)),t={cache:vm()},e.payload=t;return}t=t.return}}function bN(e,t,a){var n=sa();a={lane:n,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null},Wc(e)?by(t,a):(a=gm(e,t,a,n),a!==null&&(Xt(a,e,n),vy(a,t,n)))}function fy(e,t,a){var n=sa();ol(e,t,a,n)}function ol(e,t,a,n){var o={lane:n,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null};if(Wc(e))by(t,o);else{var l=e.alternate;if(e.lanes===0&&(l===null||l.lanes===0)&&(l=t.lastRenderedReducer,l!==null))try{var c=t.lastRenderedState,d=l(c,a);if(o.hasEagerState=!0,o.eagerState=d,ca(d,c))return Qc(e,t,o,0),Oe===null&&Xc(),!1}catch{}if(a=gm(e,t,o,n),a!==null)return Xt(a,e,n),vy(a,t,n),!0}return!1}function Dm(e,t,a,n){if(n={lane:2,revertLane:Xm(),gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},Wc(e)){if(t)throw Error(z(479))}else t=gm(e,a,n,2),t!==null&&Xt(t,e,2)}function Wc(e){var t=e.alternate;return e===ne||t!==null&&t===ne}function by(e,t){jo=Tc=!0;var a=e.pending;a===null?t.next=t:(t.next=a.next,a.next=t),e.pending=t}function vy(e,t,a){if((a&4194048)!==0){var n=t.lanes;n&=e.pendingLanes,a|=n,t.lanes=a,av(e,a)}}var Ec={readContext:yt,use:Pc,useCallback:Qe,useContext:Qe,useEffect:Qe,useImperativeHandle:Qe,useLayoutEffect:Qe,useInsertionEffect:Qe,useMemo:Qe,useReducer:Qe,useRef:Qe,useState:Qe,useDebugValue:Qe,useDeferredValue:Qe,useTransition:Qe,useSyncExternalStore:Qe,useId:Qe,useHostTransitionStatus:Qe,useFormState:Qe,useActionState:Qe,useOptimistic:Qe,useMemoCache:Qe,useCacheRefresh:Qe,useEffectEvent:Qe},yy={readContext:yt,use:Pc,useCallback:function(e,t){return Ht().memoizedState=[e,t===void 0?null:t],e},useContext:yt,useEffect:Gf,useImperativeHandle:function(e,t,a){a=a!=null?a.concat([e]):null,tc(4194308,4,ry.bind(null,t,e),a)},useLayoutEffect:function(e,t){return tc(4194308,4,e,t)},useInsertionEffect:function(e,t){tc(4,2,e,t)},useMemo:function(e,t){var a=Ht();t=t===void 0?null:t;var n=e();if(Ui){jn(!0);try{e()}finally{jn(!1)}}return a.memoizedState=[n,t],n},useReducer:function(e,t,a){var n=Ht();if(a!==void 0){var o=a(t);if(Ui){jn(!0);try{a(t)}finally{jn(!1)}}}else o=t;return n.memoizedState=n.baseState=o,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:o},n.queue=e,e=e.dispatch=bN.bind(null,ne,e),[n.memoizedState,e]},useRef:function(e){var t=Ht();return e={current:e},t.memoizedState=e},useState:function(e){e=yh(e);var t=e.queue,a=fy.bind(null,ne,t);return t.dispatch=a,[e.memoizedState,a]},useDebugValue:Rm,useDeferredValue:function(e,t){var a=Ht();return Om(a,e,t)},useTransition:function(){var e=yh(!1);return e=dy.bind(null,ne,e.queue,!0,!1),Ht().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,t,a){var n=ne,o=Ht();if(re){if(a===void 0)throw Error(z(407));a=a()}else{if(a=t(),Oe===null)throw Error(z(349));(ge&127)!==0||Xv(n,t,a)}o.memoizedState=a;var l={value:a,getSnapshot:t};return o.queue=l,Gf(Zv.bind(null,n,l,e),[e]),n.flags|=2048,Po(9,{destroy:void 0},Qv.bind(null,n,l,a,t),null),a},useId:function(){var e=Ht(),t=Oe.identifierPrefix;if(re){var a=on,n=nn;a=(n&~(1<<32-la(n)-1)).toString(32)+a,t="_"+t+"R_"+a,a=kc++,0<a&&(t+="H"+a.toString(32)),t+="_"}else a=uN++,t="_"+t+"r_"+a.toString(32)+"_";return e.memoizedState=t},useHostTransitionStatus:Vm,useFormState:Bf,useActionState:Bf,useOptimistic:function(e){var t=Ht();t.memoizedState=t.baseState=e;var a={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return t.queue=a,t=Dm.bind(null,ne,!0,a),a.dispatch=t,[e,t]},useMemoCache:Am,useCacheRefresh:function(){return Ht().memoizedState=fN.bind(null,ne)},useEffectEvent:function(e){var t=Ht(),a={impl:e};return t.memoizedState=a,function(){if((we&2)!==0)throw Error(z(440));return a.impl.apply(void 0,arguments)}}},wy={readContext:yt,use:Pc,useCallback:sy,useContext:yt,useEffect:Mm,useImperativeHandle:ly,useInsertionEffect:iy,useLayoutEffect:oy,useMemo:cy,useReducer:ec,useRef:ay,useState:function(){return ec(Nn)},useDebugValue:Rm,useDeferredValue:function(e,t){var a=Pe();return uy(a,Ce.memoizedState,e,t)},useTransition:function(){var e=ec(Nn)[0],t=Pe().memoizedState;return[typeof e=="boolean"?e:Vl(e),t]},useSyncExternalStore:Yv,useId:py,useHostTransitionStatus:Vm,useFormState:Lf,useActionState:Lf,useOptimistic:function(e,t){var a=Pe();return Pv(a,Ce,e,t)},useMemoCache:Am,useCacheRefresh:gy,useEffectEvent:ny},vN={readContext:yt,use:Pc,useCallback:sy,useContext:yt,useEffect:Mm,useImperativeHandle:ly,useInsertionEffect:iy,useLayoutEffect:oy,useMemo:cy,useReducer:Md,useRef:ay,useState:function(){return Md(Nn)},useDebugValue:Rm,useDeferredValue:function(e,t){var a=Pe();return Ce===null?Om(a,e,t):uy(a,Ce.memoizedState,e,t)},useTransition:function(){var e=Md(Nn)[0],t=Pe().memoizedState;return[typeof e=="boolean"?e:Vl(e),t]},useSyncExternalStore:Yv,useId:py,useHostTransitionStatus:Vm,useFormState:jf,useActionState:jf,useOptimistic:function(e,t){var a=Pe();return Ce!==null?Pv(a,Ce,e,t):(a.baseState=e,[e,a.queue.dispatch])},useMemoCache:Am,useCacheRefresh:gy,useEffectEvent:ny};function Rd(e,t,a,n){t=e.memoizedState,a=a(n,t),a=a==null?t:Ve({},t,a),e.memoizedState=a,e.lanes===0&&(e.updateQueue.baseState=a)}var xh={enqueueSetState:function(e,t,a){e=e._reactInternals;var n=sa(),o=Pn(n);o.payload=t,a!=null&&(o.callback=a),t=Fn(e,o,n),t!==null&&(Xt(t,e,n),al(t,e,n))},enqueueReplaceState:function(e,t,a){e=e._reactInternals;var n=sa(),o=Pn(n);o.tag=1,o.payload=t,a!=null&&(o.callback=a),t=Fn(e,o,n),t!==null&&(Xt(t,e,n),al(t,e,n))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var a=sa(),n=Pn(a);n.tag=2,t!=null&&(n.callback=t),t=Fn(e,n,a),t!==null&&(Xt(t,e,a),al(t,e,a))}};function Yf(e,t,a,n,o,l,c){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(n,l,c):t.prototype&&t.prototype.isPureReactComponent?!pl(a,n)||!pl(o,l):!0}function Xf(e,t,a,n){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(a,n),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(a,n),t.state!==e&&xh.enqueueReplaceState(t,t.state,null)}function qi(e,t){var a=t;if("ref"in t){a={};for(var n in t)n!=="ref"&&(a[n]=t[n])}if(e=e.defaultProps){a===t&&(a=Ve({},a));for(var o in e)a[o]===void 0&&(a[o]=e[o])}return a}function $y(e){bc(e)}function xy(e){console.error(e)}function Ny(e){bc(e)}function Cc(e,t){try{var a=e.onUncaughtError;a(t.value,{componentStack:t.stack})}catch(n){setTimeout(function(){throw n})}}function Qf(e,t,a){try{var n=e.onCaughtError;n(a.value,{componentStack:a.stack,errorBoundary:t.tag===1?t.stateNode:null})}catch(o){setTimeout(function(){throw o})}}function Nh(e,t,a){return a=Pn(a),a.tag=3,a.payload={element:null},a.callback=function(){Cc(e,t)},a}function Sy(e){return e=Pn(e),e.tag=3,e}function Ty(e,t,a,n){var o=a.type.getDerivedStateFromError;if(typeof o=="function"){var l=n.value;e.payload=function(){return o(l)},e.callback=function(){Qf(t,a,n)}}var c=a.stateNode;c!==null&&typeof c.componentDidCatch=="function"&&(e.callback=function(){Qf(t,a,n),typeof o!="function"&&(ti===null?ti=new Set([this]):ti.add(this));var d=n.stack;this.componentDidCatch(n.value,{componentStack:d!==null?d:""})})}function yN(e,t,a,n,o){if(a.flags|=32768,n!==null&&typeof n=="object"&&typeof n.then=="function"){if(t=a.alternate,t!==null&&Vi(t,a,o,!0),a=Nt.current,a!==null){switch(a.tag){case 31:case 13:case 19:return Ct===null?_c():a.alternate===null&&Ze===0&&(Ze=3),a.flags&=-257,a.flags|=65536,a.lanes=o,n===xc?a.flags|=16384:(t=a.updateQueue,t===null?a.updateQueue=new Set([n]):t.add(n),qd(e,n,o)),!1;case 22:return a.flags|=65536,n===xc?a.flags|=16384:(t=a.updateQueue,t===null?(t={transitions:null,markerInstances:null,retryQueue:new Set([n])},a.updateQueue=t):(a=t.retryQueue,a===null?t.retryQueue=new Set([n]):a.add(n)),qd(e,n,o)),!1}throw Error(z(435,a.tag))}return qd(e,n,o),_c(),!1}if(re)return t=Nt.current,t!==null?((t.flags&65536)===0&&(t.flags|=256),t.flags|=65536,t.lanes=o,n!==dh&&(e=Error(z(422),{cause:n}),fl(Na(e,a)))):(n!==dh&&(t=Error(z(423),{cause:n}),fl(Na(t,a))),e=e.current.alternate,e.flags|=65536,o&=-o,e.lanes|=o,n=Na(n,a),o=Nh(e.stateNode,n,o),zd(e,o),Ze!==4&&(Ze=2)),!1;var l=Error(z(520),{cause:n});if(l=Na(l,a),cl===null?cl=[l]:cl.push(l),Ze!==4&&(Ze=2),t===null)return!0;n=Na(n,a),a=t;do{switch(a.tag){case 3:return a.flags|=65536,e=o&-o,a.lanes|=e,e=Nh(a.stateNode,n,e),zd(a,e),!1;case 1:if(t=a.type,l=a.stateNode,(a.flags&128)===0&&(typeof t.getDerivedStateFromError=="function"||l!==null&&typeof l.componentDidCatch=="function"&&(ti===null||!ti.has(l))))return a.flags|=65536,o&=-o,a.lanes|=o,o=Sy(o),Ty(o,e,a,n),zd(a,o),!1;break;case 22:if(a.memoizedState!==null)return a.flags|=65536,!1}a=a.return}while(a!==null);return!1}var _m=Error(z(461)),at=!1;function lt(e,t,a,n){t.child=e===null?qv(t,null,a,n):Hi(t,e.child,a,n)}function Zf(e,t,a,n,o){a=a.render;var l=t.ref;if("ref"in n){var c={};for(var d in n)d!=="ref"&&(c[d]=n[d])}else c=n;return Di(t),n=Tm(e,t,a,c,l,o),d=km(),e!==null&&!at?(Em(e,t,o),Sn(e,t,o)):(re&&d&&Zc(t),t.flags|=1,lt(e,t,n,o),t.child)}function Kf(e,t,a,n,o){if(e===null){var l=a.type;return typeof l=="function"&&!fm(l)&&l.defaultProps===void 0&&a.compare===null?(t.tag=15,t.type=l,ky(e,t,l,n,o)):(e=Ps(a.type,null,n,t,t.mode,o),e.ref=t.ref,e.return=t,t.child=e)}if(l=e.child,!Um(e,o)){var c=l.memoizedProps;if(a=a.compare,a=a!==null?a:pl,a(c,n)&&e.ref===t.ref)return Sn(e,t,o)}return t.flags|=1,e=vn(l,n),e.ref=t.ref,e.return=t,t.child=e}function ky(e,t,a,n,o){if(e!==null){var l=e.memoizedProps;if(pl(l,n)&&e.ref===t.ref)if(at=!1,t.pendingProps=n=l,Um(e,o))(e.flags&131072)!==0&&(at=!0);else return t.lanes=e.lanes,Sn(e,t,o)}return Sh(e,t,a,n,o)}function Ey(e,t,a,n){var o=n.children,l=e!==null?e.memoizedState:null;if(e===null&&t.stateNode===null&&(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),n.mode==="hidden"){if((t.flags&128)!==0){if(l=l!==null?l.baseLanes|a:a,e!==null){for(n=t.child=e.child,o=0;n!==null;)o=o|n.lanes|n.childLanes,n=n.sibling;n=o&~l}else n=0,t.child=null;return Jf(e,t,l,a,n)}if((a&536870912)!==0)t.memoizedState={baseLanes:0,cachePool:null},e!==null&&Ws(t,l!==null?l.cachePool:null),l!==null?Uf(t,l):bh(),Lv(t);else return n=t.lanes=536870912,Jf(e,t,l!==null?l.baseLanes|a:a,a,n)}else l!==null?(Ws(t,l.cachePool),Uf(t,l),ei(),t.memoizedState=null):(e!==null&&Ws(t,null),bh(),ei());return lt(e,t,o,a),t.child}function rl(e,t){return e!==null&&e.tag===22||t.stateNode!==null||(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),t.sibling}function Jf(e,t,a,n,o){var l=ym();return l=l===null?null:{parent:tt._currentValue,pool:l},t.memoizedState={baseLanes:a,cachePool:l},e!==null&&Ws(t,null),bh(),Lv(t),e!==null&&Vi(e,t,n,!0),t.childLanes=o,null}function ac(e,t){return t=eu({mode:t.mode,children:t.children},e.mode),t.ref=e.ref,e.child=t,t.return=e,t}function Pf(e,t,a){return Hi(t,e.child,null,a),e=ac(t,t.pendingProps),e.flags|=2,aa(t),t.memoizedState=null,e}function wN(e,t,a){var n=t.pendingProps,o=(t.flags&128)!==0;if(t.flags&=-129,e===null){if(re){if(n.mode==="hidden")return e=ac(t,n),t.lanes=536870912,e.memoizedState={baseLanes:0,cachePool:null},rl(null,e);if(vh(t),(e=Ue)?(e=Ew(e,Sa),e=e!==null&&e.data==="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:oi!==null?{id:nn,overflow:on}:null,retryLane:536870912,hydrationErrors:null},a=Rv(e),a.return=t,t.child=a,gt=t,Ue=null)):e=null,e===null)throw ri(t);return t.lanes=536870912,null}return ac(t,n)}var l=e.memoizedState;if(l!==null){var c=l.dehydrated;if(vh(t),o)if(t.flags&256)t.flags&=-257,t=Pf(e,t,a);else if(t.memoizedState!==null)t.child=e.child,t.flags|=128,t=null;else throw Error(z(558));else if(at||Vi(e,t,a,!1),o=(a&e.childLanes)!==0,at||o){if(li.current===null){if(n=Oe,n!==null&&(c=nv(n,a),c!==0&&c!==l.retryLane))throw l.retryLane=c,Gi(e,c),Xt(n,e,c),_m;_c()}t=Pf(e,t,a)}else e=l.treeContext,Ue=Ta(c.nextSibling),gt=t,re=!0,Jn=null,Sa=!1,e!==null&&Vv(t,e),t=ac(t,n),t.flags|=134221824;return t}return e=vn(e.child,{mode:n.mode,children:n.children}),e.ref=t.ref,t.child=e,e.return=t,e}function No(e,t){var a=t.ref;if(a===null)e!==null&&e.ref!==null&&(t.flags|=4194816);else{if(typeof a!="function"&&typeof a!="object")throw Error(z(284));(e===null||e.ref!==a)&&(t.flags|=4194816)}}function Sh(e,t,a,n,o){return Di(t),a=Tm(e,t,a,n,void 0,o),n=km(),e!==null&&!at?(Em(e,t,o),Sn(e,t,o)):(re&&n&&Zc(t),t.flags|=1,lt(e,t,a,o),t.child)}function Ff(e,t,a,n,o,l){return Di(t),t.updateQueue=null,a=Gv(t,n,a,o),jv(e),n=km(),e!==null&&!at?(Em(e,t,l),Sn(e,t,l)):(re&&n&&Zc(t),t.flags|=1,lt(e,t,a,l),t.child)}function Wf(e,t,a,n,o){if(Di(t),t.stateNode===null){var l=Vo,c=a.contextType;typeof c=="object"&&c!==null&&(l=yt(c)),l=new a(n,l),t.memoizedState=l.state!==null&&l.state!==void 0?l.state:null,l.updater=xh,t.stateNode=l,l._reactInternals=t,l=t.stateNode,l.props=n,l.state=t.memoizedState,l.refs={},$m(t),c=a.contextType,l.context=typeof c=="object"&&c!==null?yt(c):Vo,l.state=t.memoizedState,c=a.getDerivedStateFromProps,typeof c=="function"&&(Rd(t,a,c,n),l.state=t.memoizedState),typeof a.getDerivedStateFromProps=="function"||typeof l.getSnapshotBeforeUpdate=="function"||typeof l.UNSAFE_componentWillMount!="function"&&typeof l.componentWillMount!="function"||(c=l.state,typeof l.componentWillMount=="function"&&l.componentWillMount(),typeof l.UNSAFE_componentWillMount=="function"&&l.UNSAFE_componentWillMount(),c!==l.state&&xh.enqueueReplaceState(l,l.state,null),il(t,n,l,o),nl(),l.state=t.memoizedState),typeof l.componentDidMount=="function"&&(t.flags|=4194308),n=!0}else if(e===null){l=t.stateNode;var d=t.memoizedProps,h=qi(a,d);l.props=h;var g=l.context,y=a.contextType;c=Vo,typeof y=="object"&&y!==null&&(c=yt(y));var N=a.getDerivedStateFromProps;y=typeof N=="function"||typeof l.getSnapshotBeforeUpdate=="function",d=t.pendingProps!==d,y||typeof l.UNSAFE_componentWillReceiveProps!="function"&&typeof l.componentWillReceiveProps!="function"||(d||g!==c)&&Xf(t,l,n,c),Bn=!1;var f=t.memoizedState;l.state=f,il(t,n,l,o),nl(),g=t.memoizedState,d||f!==g||Bn?(typeof N=="function"&&(Rd(t,a,N,n),g=t.memoizedState),(h=Bn||Yf(t,a,h,n,f,g,c))?(y||typeof l.UNSAFE_componentWillMount!="function"&&typeof l.componentWillMount!="function"||(typeof l.componentWillMount=="function"&&l.componentWillMount(),typeof l.UNSAFE_componentWillMount=="function"&&l.UNSAFE_componentWillMount()),typeof l.componentDidMount=="function"&&(t.flags|=4194308)):(typeof l.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=n,t.memoizedState=g),l.props=n,l.state=g,l.context=c,n=h):(typeof l.componentDidMount=="function"&&(t.flags|=4194308),n=!1)}else{l=t.stateNode,gh(e,t),c=t.memoizedProps,y=qi(a,c),l.props=y,N=t.pendingProps,f=l.context,g=a.contextType,h=Vo,typeof g=="object"&&g!==null&&(h=yt(g)),d=a.getDerivedStateFromProps,(g=typeof d=="function"||typeof l.getSnapshotBeforeUpdate=="function")||typeof l.UNSAFE_componentWillReceiveProps!="function"&&typeof l.componentWillReceiveProps!="function"||(c!==N||f!==h)&&Xf(t,l,n,h),Bn=!1,f=t.memoizedState,l.state=f,il(t,n,l,o),nl();var $=t.memoizedState;c!==N||f!==$||Bn||e!==null&&e.dependencies!==null&&$c(e.dependencies)?(typeof d=="function"&&(Rd(t,a,d,n),$=t.memoizedState),(y=Bn||Yf(t,a,y,n,f,$,h)||e!==null&&e.dependencies!==null&&$c(e.dependencies))?(g||typeof l.UNSAFE_componentWillUpdate!="function"&&typeof l.componentWillUpdate!="function"||(typeof l.componentWillUpdate=="function"&&l.componentWillUpdate(n,$,h),typeof l.UNSAFE_componentWillUpdate=="function"&&l.UNSAFE_componentWillUpdate(n,$,h)),typeof l.componentDidUpdate=="function"&&(t.flags|=4),typeof l.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof l.componentDidUpdate!="function"||c===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof l.getSnapshotBeforeUpdate!="function"||c===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),t.memoizedProps=n,t.memoizedState=$),l.props=n,l.state=$,l.context=h,n=y):(typeof l.componentDidUpdate!="function"||c===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof l.getSnapshotBeforeUpdate!="function"||c===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),n=!1)}return l=n,No(e,t),n=(t.flags&128)!==0,l||n?(l=t.stateNode,a=n&&typeof a.getDerivedStateFromError!="function"?null:l.render(),t.flags|=1,e!==null&&n?(t.child=Hi(t,e.child,null,o),t.child=Hi(t,null,a,o)):lt(e,t,a,o),t.memoizedState=l.state,e=t.child):e=Sn(e,t,o),e}function eb(e,t,a,n){return Oi(),t.flags|=256,lt(e,t,a,n),t.child}var Th={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function kh(e){return{baseLanes:e,cachePool:_v()}}function Eh(e,t,a){return e=e!==null?e.childLanes&~a:0,t&&(e|=ia),e}function Cy(e,t,a){var n=t.pendingProps,o=!1,l=(t.flags&128)!==0,c;if((c=l)||(c=e!==null&&e.memoizedState===null?!1:($t.current&2)!==0),c&&(o=!0,t.flags&=-129),c=(t.flags&32)!==0,t.flags&=-33,e===null){if(re){if(o?Wn(t):ei(),(e=Ue)?(e=Ew(e,Sa),e=e!==null&&e.data!=="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:oi!==null?{id:nn,overflow:on}:null,retryLane:536870912,hydrationErrors:null},a=Rv(e),a.return=t,t.child=a,gt=t,Ue=null)):e=null,e===null)throw ri(t);return Jm(e)?t.lanes=32:t.lanes=536870912,null}return l=n.children,n=n.fallback,o?(ei(),o=t.mode,l=eu({mode:"hidden",children:l},o),n=Ai(n,o,a,null),l.return=t,n.return=t,l.sibling=n,t.child=l,n=t.child,n.memoizedState=kh(a),n.childLanes=Eh(e,c,a),t.memoizedState=Th,rl(null,n)):(Wn(t),Hm(t,l))}var d=e.memoizedState;if(d!==null){var h=d.dehydrated;if(h!==null)return $N(e,t,l,c,n,h,d,a)}return o?(ei(),o=n.fallback,l=t.mode,d=e.child,h=d.sibling,n=vn(d,{mode:"hidden",children:n.children}),n.subtreeFlags=d.subtreeFlags&1206910976,h!==null?o=vn(h,o):(o=Ai(o,l,a,null),o.flags|=2),o.return=t,n.return=t,n.sibling=o,t.child=n,rl(null,n),n=t.child,o=e.child.memoizedState,o===null?o=kh(a):(l=o.cachePool,l!==null?(d=tt._currentValue,l=l.parent!==d?{parent:d,pool:d}:l):l=_v(),o={baseLanes:o.baseLanes|a,cachePool:l}),n.memoizedState=o,n.childLanes=Eh(e,c,a),t.memoizedState=Th,rl(e.child,n)):(Wn(t),a=e.child,e=a.sibling,a=vn(a,{mode:"visible",children:n.children}),a.return=t,a.sibling=null,e!==null&&(c=t.deletions,c===null?(t.deletions=[e],t.flags|=16):c.push(e)),t.child=a,t.memoizedState=null,a)}function Hm(e,t){return t=eu({mode:"visible",children:t},e.mode),t.return=e,e.child=t}function eu(e,t){return e=Yt(22,e,null,t),e.lanes=0,e}function Hs(e,t,a){return Hi(t,e.child,null,a),e=Hm(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function $N(e,t,a,n,o,l,c,d){if(a)return t.flags&256?(Wn(t),t.flags&=-257,Hs(e,t,d)):t.memoizedState!==null?(ei(),t.child=e.child,t.flags|=128,null):(ei(),l=o.fallback,c=t.mode,o=eu({mode:"visible",children:o.children},c),l=Ai(l,c,d,null),l.flags|=2,o.return=t,l.return=t,o.sibling=l,t.child=o,Hi(t,e.child,null,d),o=t.child,o.memoizedState=kh(d),o.childLanes=Eh(e,n,d),t.memoizedState=Th,rl(null,o));if(Wn(t),Jm(l)){if(n=l.nextSibling&&l.nextSibling.dataset,n)var h=n.dgst;return n=h,n!==""&&(o=Error(z(419)),o.stack="",o.digest=n,fl({value:o,source:null,stack:null})),Hs(e,t,d)}if(at||Vi(e,t,d,!1),n=(d&e.childLanes)!==0,at||n){if(li.current!==null)return Hs(e,t,d);if(n=Oe,n!==null&&(o=nv(n,d),o!==0&&o!==c.retryLane))throw c.retryLane=o,Gi(e,o),Xt(n,e,o),_m;return Fh(l)||_c(),Hs(e,t,d)}return Fh(l)?(t.flags|=192,t.child=e.child,null):(e=c.treeContext,Ue=Ta(l.nextSibling),gt=t,re=!0,Jn=null,Sa=!1,e!==null&&Vv(t,e),t=Hm(t,o.children),t.flags|=134221824,t)}function tb(e,t,a){e.lanes|=t;var n=e.alternate;n!==null&&(n.lanes|=t),Fs(e.return,t,a)}function ab(e){for(var t=null;e!==null;){var a=e.alternate;a!==null&&Sc(a)===null&&(t=e),e=e.sibling}return t}function Us(e,t,a,n,o,l){var c=e.memoizedState;c===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:n,tail:a,tailMode:o,treeForkCount:l}:(c.isBackwards=t,c.rendering=null,c.renderingStartTime=0,c.last=n,c.tail=a,c.tailMode=o,c.treeForkCount=l)}function Od(e){var t=e.child;for(e.child=null;t!==null;){var a=t.sibling;t.sibling=e.child,e.child=t,t=a}}function Ch(e,t,a){var n=t.pendingProps,o=n.revealOrder,l=n.tail;n=n.children;var c=$t.current;if(t.flags&128)return vl(t,c),null;var d=(c&2)!==0;if(d?(c=c&1|2,t.flags|=128):c&=1,vl(t,c),o==="backwards"&&e!==null?(Od(e),lt(e,t,n,a),Od(e)):lt(e,t,n,a),n=re?gl:0,!d&&e!==null&&(e.flags&128)!==0)e:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&tb(e,a,t);else if(e.tag===19)tb(e,a,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(o){case"backwards":a=ab(t.child),a===null?(o=t.child,t.child=null):(o=a.sibling,a.sibling=null,Od(t)),Us(t,!0,o,null,l,n);break;case"unstable_legacy-backwards":for(a=null,o=t.child,t.child=null;o!==null;){if(e=o.alternate,e!==null&&Sc(e)===null){t.child=o;break}e=o.sibling,o.sibling=a,a=o,o=e}Us(t,!0,a,null,l,n);break;case"together":Us(t,!1,null,null,void 0,n);break;case"independent":t.memoizedState=null;break;default:a=ab(t.child),a===null?(o=t.child,t.child=null):(o=a.sibling,a.sibling=null),Us(t,!1,o,a,l,n)}return t.child}function nb(e,t,a){var n=t.pendingProps;return Yn(t,t.type,n.value),lt(e,t,n.children,a),t.child}function Sn(e,t,a){if(e!==null&&(t.dependencies=e.dependencies),ci|=t.lanes,(a&t.childLanes)===0)if(e!==null){if(Vi(e,t,a,!1),(a&t.childLanes)===0)return null}else return null;if(e!==null&&t.child!==e.child)throw Error(z(153));if(t.child!==null){for(e=t.child,a=vn(e,e.pendingProps),t.child=a,a.return=t;e.sibling!==null;)e=e.sibling,a=a.sibling=vn(e,e.pendingProps),a.return=t;a.sibling=null}return t.child}function Um(e,t){return(e.lanes&t)!==0?!0:(e=e.dependencies,!!(e!==null&&$c(e)))}function xN(e,t,a){switch(t.tag){case 3:mc(t,t.stateNode.containerInfo),Yn(t,tt,e.memoizedState.cache),Oi();break;case 27:case 5:th(t);break;case 4:mc(t,t.stateNode.containerInfo);break;case 10:Yn(t,t.type,t.memoizedProps.value);break;case 31:if(t.memoizedState!==null)return t.flags|=128,vh(t),null;break;case 13:var n=t.memoizedState;if(n!==null){if(n.dehydrated!==null)return Wn(t),t.flags|=128,null;n=Vi(e,t,a,!1);var o=t.child.childLanes;return n||(a&o)!==0?Cy(e,t,a):(Wn(t),e=Sn(e,t,a),e!==null?e.sibling:null)}Wn(t);break;case 19:if(t.flags&128)return Ch(e,t,a);if(o=(e.flags&128)!==0,n=(a&t.childLanes)!==0,n||(Vi(e,t,a,!1),n=(a&t.childLanes)!==0),o){if(n)return Ch(e,t,a);t.flags|=128}if(o=t.memoizedState,o!==null&&(o.rendering=null,o.tail=null,o.lastEffect=null),vl(t,$t.current),n)break;return null;case 22:return t.lanes=0,Ey(e,t,a,t.pendingProps);case 24:Yn(t,tt,e.memoizedState.cache)}return Sn(e,t,a)}function Ay(e,t,a){if(e!==null)if(e.memoizedProps!==t.pendingProps)at=!0;else{if(!Um(e,a)&&(t.flags&128)===0)return at=!1,xN(e,t,a);at=(e.flags&131072)!==0}else at=!1,re&&(t.flags&1048576)!==0&&Ov(t,gl,t.index);switch(t.lanes=0,t.tag){case 16:e:{var n=t.pendingProps;if(e=Si(t.elementType),t.type=e,typeof e=="function")fm(e)?(n=qi(e,n),t.tag=1,t=Wf(null,t,e,n,a)):(t.tag=0,t=Sh(null,t,e,n,a));else{if(e!=null){var o=e.$$typeof;if(o===nm){t.tag=11,t=Zf(null,t,e,n,a);break e}else if(o===im){t.tag=14,t=Kf(null,t,e,n,a);break e}else if(o===tn){t.tag=10,t.type=e,t=nb(null,t,a);break e}}throw t=Wd(e)||e,Error(z(306,t,""))}}return t;case 0:return Sh(e,t,t.type,t.pendingProps,a);case 1:return n=t.type,o=qi(n,t.pendingProps),Wf(e,t,n,o,a);case 3:e:{if(mc(t,t.stateNode.containerInfo),e===null)throw Error(z(387));n=t.pendingProps;var l=t.memoizedState;o=l.element,gh(e,t),il(t,n,null,a);var c=t.memoizedState;if(n=c.cache,Yn(t,tt,n),n!==l.cache&&mh(t,[tt],a,!0),nl(),n=c.element,l.isDehydrated)if(l={element:n,isDehydrated:!1,cache:c.cache},t.updateQueue.baseState=l,t.memoizedState=l,t.flags&256){t=eb(e,t,n,a);break e}else if(n!==o){o=Na(Error(z(424)),t),fl(o),t=eb(e,t,n,a);break e}else for(e=t.stateNode.containerInfo,e.nodeType===9?e=e.body:e=e.nodeName==="HTML"?e.ownerDocument.body:e,Ue=Ta(e.firstChild),gt=t,re=!0,Jn=null,Sa=!0,a=qv(t,null,n,a),t.child=a;a;)a.flags=a.flags&-3|134221824,a=a.sibling;else{if(Oi(),n===o){t=Sn(e,t,a);break e}lt(e,t,n,a)}t=t.child}return t;case 26:return No(e,t),e===null?(a=zb(t.type,null,t.pendingProps,null))?t.memoizedState=a:re||(t.stateNode=vw(t.type,t.pendingProps,Kn.current,t)):t.memoizedState=zb(t.type,e.memoizedProps,t.pendingProps,e.memoizedState),null;case 27:return th(t),e===null&&re&&(n=t.stateNode=Cw(t.type,t.pendingProps,Kn.current),gt=t,Sa=!0,o=Ue,di(t.type)?(Wh=o,Ue=Ta(n.firstChild)):Ue=o),lt(e,t,t.pendingProps.children,a),No(e,t),e===null&&(t.flags|=4194304),t.child;case 5:return e===null&&re&&((o=n=Ue)&&(n=p5(n,t.type,t.pendingProps,Sa),n!==null?(t.stateNode=n,gt=t,Ue=Ta(n.firstChild),Sa=!1,o=!0):o=!1),o||ri(t)),th(t),o=t.type,l=t.pendingProps,c=e!==null?e.memoizedProps:null,n=l.children,Kh(o,l)?n=null:c!==null&&Kh(o,c)&&(t.flags|=32),t.memoizedState!==null&&(o=Tm(e,t,dN,null,null,a),ir._currentValue=o),No(e,t),lt(e,t,n,a),t.child;case 6:return e===null&&re&&((e=a=Ue)&&(a=g5(a,t.pendingProps,Sa),a!==null?(t.stateNode=a,gt=t,Ue=null,e=!0):e=!1),e||ri(t)),null;case 13:return Cy(e,t,a);case 4:return mc(t,t.stateNode.containerInfo),n=t.pendingProps,e===null?t.child=Hi(t,null,n,a):lt(e,t,n,a),t.child;case 11:return Zf(e,t,t.type,t.pendingProps,a);case 7:return n=t.pendingProps,No(e,t),lt(e,t,n,a),t.child;case 8:return lt(e,t,t.pendingProps.children,a),t.child;case 12:return lt(e,t,t.pendingProps.children,a),t.child;case 10:return nb(e,t,a);case 9:return o=t.type._context,n=t.pendingProps.children,Di(t),o=yt(o),n=n(o),t.flags|=1,lt(e,t,n,a),t.child;case 14:return Kf(e,t,t.type,t.pendingProps,a);case 15:return ky(e,t,t.type,t.pendingProps,a);case 19:return Ch(e,t,a);case 31:return wN(e,t,a);case 22:return Ey(e,t,a,t.pendingProps);case 24:return Di(t),n=yt(tt),e===null?(o=ym(),o===null&&(o=Oe,l=vm(),o.pooledCache=l,l.refCount++,l!==null&&(o.pooledCacheLanes|=a),o=l),t.memoizedState={parent:n,cache:o},$m(t),Yn(t,tt,o)):((e.lanes&a)!==0&&(gh(e,t),il(t,null,null,a),nl()),o=e.memoizedState,l=t.memoizedState,o.parent!==n?(o={parent:n,cache:n},t.memoizedState=o,t.lanes===0&&(t.memoizedState=t.updateQueue.baseState=o),Yn(t,tt,n)):(n=l.cache,Yn(t,tt,n),n!==o.cache&&mh(t,[tt],a,!0))),lt(e,t,t.pendingProps.children,a),t.child;case 30:return t.stateNode===null&&(t.stateNode={autoName:null,paired:null,clones:null,ref:null}),n=t.pendingProps,n.name!=null&&n.name!=="auto"?t.flags|=e===null?18882560:18874368:re&&Zc(t),e!==null&&e.memoizedProps.name!==n.name?t.flags|=4194816:No(e,t),lt(e,t,n.children,a),t.child;case 29:throw t.pendingProps}throw Error(z(156,t.tag))}function gn(e){e.flags|=4}function Vd(e,t,a,n,o){var l;if((l=(e.mode&32)!==0)&&(l=a===null?Ob(t,n):Ob(t,n)&&(n.src!==a.src||n.srcSet!==a.srcSet)),l){if(e.flags|=16777216,(o&335544128)===o)if(e.stateNode.complete)e.flags|=8192;else if(iw())e.flags|=8192;else throw Mi=xc,wm}else e.flags&=-16777217}function ib(e,t){if(t.type!=="stylesheet"||(t.state.loading&4)!==0)e.flags&=-16777217;else if(e.flags|=16777216,!Rw(t))if(iw())e.flags|=8192;else throw Mi=xc,wm}function qs(e,t){t!==null&&(e.flags|=4),e.flags&16384&&(t=e.tag!==22?ev():536870912,e.lanes|=t,Fo|=t)}function jr(e,t){if(!re)switch(e.tailMode){case"visible":break;case"collapsed":for(var a=e.tail,n=null;a!==null;)a.alternate!==null&&(n=a),a=a.sibling;n===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:n.sibling=null;break;default:for(t=e.tail,a=null;t!==null;)t.alternate!==null&&(a=t),t=t.sibling;a===null?e.tail=null:a.sibling=null}}function He(e){var t=e.alternate!==null&&e.alternate.child===e.child,a=0,n=0;if(t)for(var o=e.child;o!==null;)a|=o.lanes|o.childLanes,n|=o.subtreeFlags&1206910976,n|=o.flags&1206910976,o.return=e,o=o.sibling;else for(o=e.child;o!==null;)a|=o.lanes|o.childLanes,n|=o.subtreeFlags,n|=o.flags,o.return=e,o=o.sibling;return e.subtreeFlags|=n,e.childLanes=a,t}function NN(e,t,a){var n=t.pendingProps;switch(bm(t),t.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return He(t),null;case 1:return He(t),null;case 3:return a=t.stateNode,n=null,e!==null&&(n=e.memoizedState.cache),t.memoizedState.cache!==n&&(t.flags|=2048),yn(tt),Zo(),a.pendingContext&&(a.context=a.pendingContext,a.pendingContext=null),(e===null||e.child===null)&&($o(t)?gn(t):e===null||e.memoizedState.isDehydrated&&(t.flags&256)===0||(t.flags|=1024,Ad())),He(t),null;case 26:var o=t.type,l=t.memoizedState;return e===null?(gn(t),l!==null?(He(t),ib(t,l)):(He(t),Vd(t,o,null,n,a))):l?l!==e.memoizedState?(gn(t),He(t),ib(t,l)):(He(t),t.flags&=-16777217):(e=e.memoizedProps,e!==n&&gn(t),He(t),Vd(t,o,e,n,a)),null;case 27:if(pc(t),a=Kn.current,o=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==n&&gn(t);else{if(!n){if(t.stateNode===null)throw Error(z(166));return He(t),t.subtreeFlags&=-33554433,null}e=rn.current,$o(t)?Mf(t,e):(e=Cw(o,n,a),t.stateNode=e,gn(t))}return He(t),t.subtreeFlags&=-33554433,null;case 5:if(pc(t),o=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==n&&gn(t);else{if(!n){if(t.stateNode===null)throw Error(z(166));return He(t),t.subtreeFlags&=-33554433,null}if(l=rn.current,$o(t))Mf(t,l);else{var c=xl(Kn.current);switch(l){case 1:l=c.createElementNS("http://www.w3.org/2000/svg",o);break;case 2:l=c.createElementNS("http://www.w3.org/1998/Math/MathML",o);break;default:switch(o){case"svg":l=c.createElementNS("http://www.w3.org/2000/svg",o);break;case"math":l=c.createElementNS("http://www.w3.org/1998/Math/MathML",o);break;case"script":l=c.createElement("div"),l.innerHTML="<script><\/script>",l=l.removeChild(l.firstChild);break;case"select":l=typeof n.is=="string"?c.createElement("select",{is:n.is}):c.createElement("select"),n.multiple?l.multiple=!0:n.size&&(l.size=n.size);break;default:l=typeof n.is=="string"?c.createElement(o,{is:n.is}):c.createElement(o)}}l[vt]=t,l[Zt]=n;e:for(c=t.child;c!==null;){if(c.tag===5||c.tag===6)l.appendChild(c.stateNode);else if(c.tag!==4&&c.tag!==27&&c.child!==null){c.child.return=c,c=c.child;continue}if(c===t)break e;for(;c.sibling===null;){if(c.return===null||c.return===t)break e;c=c.return}c.sibling.return=c.return,c=c.sibling}t.stateNode=l;e:switch(xt(l,o,n),o){case"button":case"input":case"select":case"textarea":n=!!n.autoFocus;break e;case"img":n=!0;break e;default:n=!1}n&&gn(t)}}return He(t),t.subtreeFlags&=-33554433,Vd(t,t.type,e===null?null:e.memoizedProps,t.pendingProps,a),null;case 6:if(e&&t.stateNode!=null)e.memoizedProps!==n&&gn(t);else{if(typeof n!="string"&&t.stateNode===null)throw Error(z(166));if(e=Kn.current,$o(t)){if(e=t.stateNode,a=t.memoizedProps,n=null,o=gt,o!==null)switch(o.tag){case 27:case 5:n=o.memoizedProps}e[vt]=t,e=!!(e.nodeValue===a||n!==null&&n.suppressHydrationWarning===!0||fw(e.nodeValue,a)),e||ri(t,!0)}else e=xl(e).createTextNode(n),e[vt]=t,t.stateNode=e}return He(t),null;case 31:if(a=t.memoizedState,e===null||e.memoizedState!==null){if(n=$o(t),a!==null){if(e===null){if(!n)throw Error(z(318));if(e=t.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(z(557));e[vt]=t}else Oi(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;He(t),e=!1}else a=Ad(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=a),e=!0;if(!e)return t.flags&256?(aa(t),t):(aa(t),null);if((t.flags&128)!==0)throw Error(z(558))}return He(t),null;case 13:if(n=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(o=$o(t),n!==null&&n.dehydrated!==null){if(e===null){if(!o)throw Error(z(318));if(o=t.memoizedState,o=o!==null?o.dehydrated:null,!o)throw Error(z(317));o[vt]=t}else Oi(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;He(t),o=!1}else o=Ad(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=o),o=!0;if(!o)return t.flags&256?(aa(t),t):(aa(t),null)}return aa(t),(t.flags&128)!==0?(t.lanes=a,t):(a=n!==null,e=e!==null&&e.memoizedState!==null,a&&(n=t.child,o=null,n.alternate!==null&&n.alternate.memoizedState!==null&&n.alternate.memoizedState.cachePool!==null&&(o=n.alternate.memoizedState.cachePool.pool),l=null,n.memoizedState!==null&&n.memoizedState.cachePool!==null&&(l=n.memoizedState.cachePool.pool),l!==o&&(n.flags|=2048)),a!==e&&a&&(t.child.flags|=8192),qs(t,t.updateQueue),He(t),null);case 4:return Zo(),e===null&&Qm(t.stateNode.containerInfo),t.flags|=67108864,He(t),null;case 10:return yn(t.type),He(t),null;case 19:if(Nm(t),n=t.memoizedState,n===null)return He(t),null;if(o=(t.flags&128)!==0,l=n.rendering,l===null)if(o)jr(n,!1);else{if(Ze!==0||e!==null&&(e.flags&128)!==0)for(e=t.child;e!==null;){if(l=Sc(e),l!==null){for(t.flags|=128,jr(n,!1),e=l.updateQueue,t.updateQueue=e,qs(t,e),t.subtreeFlags=0,e=a,a=t.child;a!==null;)Mv(a,e),a=a.sibling;return vl(t,$t.current&1|2),re&&fn(t,n.treeForkCount),t.child}e=e.sibling}n.tail!==null&&oa()>Vc&&(t.flags|=128,o=!0,jr(n,!1),t.lanes=4194304)}else{if(!o)if(e=Sc(l),e!==null){if(t.flags|=128,o=!0,e=e.updateQueue,t.updateQueue=e,qs(t,e),jr(n,!0),n.tail===null&&n.tailMode!=="collapsed"&&n.tailMode!=="visible"&&!l.alternate&&!re)return He(t),null}else 2*oa()-n.renderingStartTime>Vc&&a!==536870912&&(t.flags|=128,o=!0,jr(n,!1),t.lanes=4194304);n.isBackwards?(l.sibling=t.child,t.child=l):(e=n.last,e!==null?e.sibling=l:t.child=l,n.last=l)}if(n.tail!==null){e=n.tail;e:{for(a=e;a!==null;){if(a.alternate!==null){a=!1;break e}a=a.sibling}a=!0}return n.rendering=e,n.tail=e.sibling,n.renderingStartTime=oa(),e.sibling=null,l=$t.current,l=o?l&1|2:l&1,n.tailMode==="visible"||n.tailMode==="collapsed"||!a||re?vl(t,l):(a=l,qe(Nt,t),qe($t,a),Ct===null&&(Ct=t)),re&&fn(t,n.treeForkCount),e}return He(t),null;case 22:case 23:return aa(t),xm(),n=t.memoizedState!==null,e!==null?e.memoizedState!==null!==n&&(t.flags|=8192):n&&(t.flags|=8192),n?(a&536870912)!==0&&(t.flags&128)===0&&(He(t),t.subtreeFlags&6&&(t.flags|=8192)):He(t),a=t.updateQueue,a!==null&&qs(t,a.retryQueue),a=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),n=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(n=t.memoizedState.cachePool.pool),n!==a&&(t.flags|=2048),e!==null&&wt(zi),null;case 24:return a=null,e!==null&&(a=e.memoizedState.cache),t.memoizedState.cache!==a&&(t.flags|=2048),yn(tt),He(t),null;case 25:return null;case 30:return t.flags|=33554432,He(t),null}throw Error(z(156,t.tag))}function SN(e,t){switch(bm(t),t.tag){case 1:return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return yn(tt),Zo(),e=t.flags,(e&65536)!==0&&(e&128)===0?(t.flags=e&-65537|128,t):null;case 26:case 27:case 5:return pc(t),null;case 31:if(t.memoizedState!==null){if(aa(t),t.alternate===null)throw Error(z(340));Oi()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 13:if(aa(t),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(z(340));Oi()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return Nm(t),e=t.flags,e&65536?(t.flags=e&-65537|128,e=t.memoizedState,e!==null&&(e.rendering=null,e.tail=null),t.flags|=4,t):null;case 4:return Zo(),null;case 10:return yn(t.type),null;case 22:case 23:return aa(t),xm(),e!==null&&wt(zi),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 24:return yn(tt),null;case 25:return null;default:return null}}function zy(e,t){switch(bm(t),t.tag){case 3:yn(tt),Zo();break;case 26:case 27:case 5:pc(t);break;case 4:Zo();break;case 31:t.memoizedState!==null&&aa(t);break;case 13:aa(t);break;case 19:Nm(t);break;case 10:yn(t.type);break;case 22:case 23:aa(t),xm(),e!==null&&wt(zi);break;case 24:yn(tt)}}function Dl(e,t){try{var a=t.updateQueue,n=a!==null?a.lastEffect:null;if(n!==null){var o=n.next;a=o;do{if((a.tag&e)===e){n=void 0;var l=a.create,c=a.inst;n=l(),c.destroy=n}a=a.next}while(a!==o)}}catch(d){Te(t,t.return,d)}}function si(e,t,a){try{var n=t.updateQueue,o=n!==null?n.lastEffect:null;if(o!==null){var l=o.next;n=l;do{if((n.tag&e)===e){var c=n.inst,d=c.destroy;if(d!==void 0){c.destroy=void 0,o=t;var h=a,g=d;try{g()}catch(y){Te(o,h,y)}}}n=n.next}while(n!==l)}}catch(y){Te(t,t.return,y)}}function My(e){var t=e.updateQueue;if(t!==null){var a=e.stateNode;try{Bv(t,a)}catch(n){Te(e,e.return,n)}}}function Ry(e,t,a){a.props=qi(e.type,e.memoizedProps),a.state=e.memoizedState;try{a.componentWillUnmount()}catch(n){Te(e,t,n)}}function Wa(e,t){try{var a=e.ref;if(a!==null){switch(e.tag){case 26:case 27:case 5:var n=e.stateNode;break;case 30:var o=e.stateNode,l=$n(e.memoizedProps,o);(o.ref===null||o.ref.name!==l)&&(o.ref=xw(l)),n=o.ref;break;case 7:if(e.stateNode===null){var c=new ua(e);Qt(e.child,!1,h5,c,void 0,void 0),e.stateNode=c}n=e.stateNode;break;default:n=e.stateNode}typeof a=="function"?e.refCleanup=a(n):a.current=n}}catch(d){Te(e,t,d)}}function bt(e,t){var a=e.ref,n=e.refCleanup;if(a!==null)if(typeof n=="function")try{n()}catch(o){Te(e,t,o)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof a=="function")try{a(null)}catch(o){Te(e,t,o)}else a.current=null}function Ac(e,t){if((e.tag===5||e.tag===27||e.tag===6)&&e.alternate===null&&t!==null)for(var a=0;a<t.length;a++)kw(e.stateNode,t[a])}function ob(e){for(var t=e.return;t!==null&&(Im(t)&&kw(e.stateNode,t.stateNode),!qm(t));)t=t.return}function ll(e){for(var t=e.return;t!==null&&(Im(t)&&m5(e.stateNode,t.stateNode),!qm(t));)t=t.return}function qm(e){return e.tag===5||e.tag===3||e.tag===27}function Im(e){return e&&e.tag===7&&e.stateNode!==null}function Ah(e){var t=e.type,a=e.memoizedProps,n=e.stateNode;try{e:switch(t){case"button":case"input":case"select":case"textarea":a.autoFocus&&n.focus();break e;case"img":a.src?n.src=a.src:a.srcSet&&(n.srcset=a.srcSet)}}catch(o){Te(e,e.return,o)}}function Dd(e,t,a){try{var n=e.stateNode;ZN(n,e.type,a,t),n[Zt]=t}catch(o){Te(e,e.return,o)}}function Oy(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&di(e.type)||e.tag===4}function _d(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||Oy(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&di(e.type)||e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function zh(e,t,a,n){var o=e.tag;if(o===5||o===6)o=e.stateNode,t?(a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a).insertBefore(o,t):(t=a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a,t.appendChild(o),a=a._reactRootContainer,a!=null||t.onclick!==null||(t.onclick=an)),Ac(e,n),ve=!0;else if(o!==4&&(o===27&&(Ac(e,n),n=null,di(e.type)&&(a=e.stateNode,t=null)),e=e.child,e!==null))for(zh(e,t,a,n),e=e.sibling;e!==null;)zh(e,t,a,n),e=e.sibling}function zc(e,t,a,n){var o=e.tag;if(o===5||o===6)o=e.stateNode,t?a.insertBefore(o,t):a.appendChild(o),Ac(e,n),ve=!0;else if(o!==4&&(o===27&&(Ac(e,n),n=null,di(e.type)&&(a=e.stateNode)),e=e.child,e!==null))for(zc(e,t,a,n),e=e.sibling;e!==null;)zc(e,t,a,n),e=e.sibling}function Vy(e){var t=e.stateNode,a=e.memoizedProps;try{for(var n=e.type,o=t.attributes;o.length;)t.removeAttributeNode(o[0]);xt(t,n,a),t[vt]=e,t[Zt]=a}catch(l){Te(e,e.return,l)}}var Mc=!1,na=null;function rb(e){(e.tag===30||(e.subtreeFlags&33554432)!==0)&&(Mc=!0)}var en=null;function lb(){var e=en;return en=null,e}var Gt=0;function ur(e,t,a,n,o){return Gt=0,Dy(e.child,t,a,n,o)}function Dy(e,t,a,n,o){for(var l=!1;e!==null;){if(e.tag===5){var c=e.stateNode;if(n!==null){var d=Jh(c);n.push(d),d.view&&(l=!0)}else l||Jh(c).view&&(l=!0);Mc=!0,yw(c,Gt===0?t:t+"_"+Gt,a),Gt++}else(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&o||Dy(e.child,t,a,n,o)&&(l=!0));e=e.sibling}return l}function sn(e,t){for(;e!==null;)e.tag===5?ww(e.stateNode,e.memoizedProps):(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&t||sn(e.child,t)),e=e.sibling}function nc(e){if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if((e.tag!==22||e.memoizedState===null)&&(nc(e),e.tag===30&&(e.flags&18874368)!==0&&e.stateNode.paired)){var t=e.memoizedProps;if(t.name==null||t.name==="auto")throw Error(z(544));var a=t.name;t=En(t.default,t.share),t!=="none"&&(ur(e,a,t,null,!1)||sn(e.child,!1))}e=e.sibling}}function Mh(e,t){if(e.tag===30){var a=e.stateNode,n=e.memoizedProps,o=$n(n,a),l=En(n.default,a.paired?n.share:n.enter);l!=="none"?ur(e,o,l,null,!1)?(nc(e),a.paired||t||Wo(e,n.onEnter)):sn(e.child,!1):nc(e)}else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)Mh(e,t),e=e.sibling;else nc(e)}function Rh(e){if(na!==null&&na.size!==0){var t=na;if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&(e.flags&18874368)!==0){var a=e.memoizedProps,n=a.name;if(n!=null&&n!=="auto"){var o=t.get(n);if(o!==void 0){var l=En(a.default,a.share);if(l!=="none"&&(ur(e,n,l,null,!1)?(l=e.stateNode,o.paired=l,l.paired=o,Wo(e,a.onShare)):sn(e.child,!1)),t.delete(n),t.size===0)break}}}Rh(e)}e=e.sibling}}}function Oh(e){if(e.tag===30){var t=e.memoizedProps,a=$n(t,e.stateNode),n=na!==null?na.get(a):void 0,o=En(t.default,n!==void 0?t.share:t.exit);o!=="none"&&(ur(e,a,o,null,!1)?n!==void 0?(o=e.stateNode,n.paired=o,o.paired=n,na.delete(a),Wo(e,t.onShare)):Wo(e,t.onExit):sn(e.child,!1)),na!==null&&Rh(e)}else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)Oh(e),e=e.sibling;else na!==null&&Rh(e)}function _y(e){for(e=e.child;e!==null;){if(e.tag===30){var t=e.memoizedProps,a=$n(t,e.stateNode);t=En(t.default,t.update),e.flags&=-5,t!=="none"&&ur(e,a,t,e.memoizedState=[],!1)}else(e.subtreeFlags&33554432)!==0&&_y(e);e=e.sibling}}function Vh(e){if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&(e.flags&18874368)!==0){var t=e.stateNode;t.paired!==null&&(t.paired=null,sn(e.child,!1))}Vh(e)}e=e.sibling}}function ic(e){if(e.tag===30)e.stateNode.paired=null,sn(e.child,!1),Vh(e);else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)ic(e),e=e.sibling;else Vh(e)}function Hy(e){for(e=e.child;e!==null;)e.tag===30?sn(e.child,!1):(e.subtreeFlags&33554432)!==0&&Hy(e),e=e.sibling}function Bm(e,t,a,n,o,l,c){for(var d=!1;t!==null;){if(t.tag===5){var h=t.stateNode;if(l!==null&&Gt<l.length){var g=l[Gt],y=Jh(h);(g.view||y.view)&&(d=!0);var N;if(N=(e.flags&4)===0)if(y.clip)N=!0;else{N=g.rect;var f=y.rect;N=N.y!==f.y||N.x!==f.x||N.height!==f.height||N.width!==f.width}N&&(e.flags|=4),y.abs?y=!g.abs:(g=g.rect,y=y.rect,y=g.height!==y.height||g.width!==y.width),y&&(e.flags|=32)}else e.flags|=32;(e.flags&4)!==0&&yw(h,Gt===0?a:a+"_"+Gt,o),d&&(e.flags&4)!==0||(en===null&&(en=[]),en.push(h,Gt===0?n:n+"_"+Gt,t.memoizedProps)),Gt++}else(t.tag!==22||t.memoizedState===null)&&(t.tag===30&&c?e.flags|=t.flags&32:Bm(e,t.child,a,n,o,l,c)&&(d=!0));t=t.sibling}return d}function Uy(e,t){for(e=e.child;e!==null;){if(e.tag===30){var a=e.memoizedProps,n=e.stateNode,o=$n(a,n),l=En(a.default,a.update);if(t){n=n.clones;var c=n===null?null:n.map(e5)}else c=e.memoizedState,e.memoizedState=null;n=e;var d=e.child;Gt=0,o=Bm(n,d,o,o,l,c,!1),(e.flags&4)!==0&&o&&(t||Wo(e,a.onUpdate))}else(e.subtreeFlags&33554432)!==0&&Uy(e,t);e=e.sibling}}var ht=!1,xe=!1,Ja=!1,Hd=!1,sb=typeof WeakSet=="function"?WeakSet:Set,mt=null,Pa=!1,Pr=!1,Rc=!1,Dh=!1;function TN(e,t,a){if(e=e.containerInfo,Qh=or,e=Nv(e),mm(e)){if("selectionStart"in e)var n={start:e.selectionStart,end:e.selectionEnd};else e:{n=(n=e.ownerDocument)&&n.defaultView||window;var o=n.getSelection&&n.getSelection();if(o&&o.rangeCount!==0){n=o.anchorNode;var l=o.anchorOffset,c=o.focusNode;o=o.focusOffset;try{n.nodeType,c.nodeType}catch{n=null;break e}var d=0,h=-1,g=-1,y=0,N=0,f=e,$=null;t:for(;;){for(var C;f!==n||l!==0&&f.nodeType!==3||(h=d+l),f!==c||o!==0&&f.nodeType!==3||(g=d+o),f.nodeType===3&&(d+=f.nodeValue.length),(C=f.firstChild)!==null;)$=f,f=C;for(;;){if(f===e)break t;if($===n&&++y===l&&(h=d),$===c&&++N===o&&(g=d),(C=f.nextSibling)!==null)break;f=$,$=f.parentNode}f=C}n=h===-1||g===-1?null:{start:h,end:g}}else n=null}n=n||{start:0,end:0}}else n=null;for(Zh={focusedElem:e,selectionRange:n},or=!1,a=(a&335544064)===a,mt=t,t=a?9270:1024;mt!==null;){if(e=mt,a&&(n=e.deletions,n!==null))for(l=0;l<n.length;l++)a&&Oh(n[l]);if(e.alternate===null&&(e.flags&2)!==0)a&&rb(e),Is(a);else{if(e.tag===22){if(n=e.alternate,e.memoizedState!==null){n!==null&&n.memoizedState===null&&a&&Oh(n),Is(a);continue}else if(n!==null&&n.memoizedState!==null){a&&rb(e),Is(a);continue}}n=e.child,(e.subtreeFlags&t)!==0&&n!==null?(n.return=e,mt=n):(a&&_y(e),Is(a))}}na=null}function Is(e){for(;mt!==null;){var t=mt,a=e,n=t.alternate,o=t.flags;switch(t.tag){case 0:case 11:case 15:break;case 1:if((o&1024)!==0&&n!==null){a=void 0,o=n.memoizedProps,n=n.memoizedState;var l=t.stateNode;try{var c=qi(t.type,o);a=l.getSnapshotBeforeUpdate(c,n),l.__reactInternalSnapshotBeforeUpdate=a}catch(d){Te(t,t.return,d)}}break;case 3:if((o&1024)!==0){if(n=t.stateNode.containerInfo,a=n.nodeType,a===9)Ph(n);else if(a===1)switch(n.nodeName){case"HEAD":case"HTML":case"BODY":Ph(n);break;default:n.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;case 30:a&&n!==null&&(a=$n(n.memoizedProps,n.stateNode),o=t.memoizedProps,o=En(o.default,o.update),o!=="none"&&ur(n,a,o,n.memoizedState=[],!0));break;default:if((o&1024)!==0)throw Error(z(163))}if(n=t.sibling,n!==null){n.return=t.return,mt=n;break}mt=t.return}}function qy(e,t,a){var n=a.flags;switch(a.tag){case 0:case 11:case 15:Fa(e,a),n&4&&Dl(5,a);break;case 1:if(Fa(e,a),n&4)if(e=a.stateNode,t===null)try{e.componentDidMount()}catch(c){Te(a,a.return,c)}else{var o=qi(a.type,t.memoizedProps);t=t.memoizedState;try{e.componentDidUpdate(o,t,e.__reactInternalSnapshotBeforeUpdate)}catch(c){Te(a,a.return,c)}}n&64&&My(a),n&512&&Wa(a,a.return);break;case 3:if(Fa(e,a),n&64&&(e=a.updateQueue,e!==null)){if(t=null,a.child!==null)switch(a.child.tag){case 27:case 5:t=a.child.stateNode;break;case 1:t=a.child.stateNode}try{Bv(e,t)}catch(c){Te(a,a.return,c)}}break;case 27:t===null&&n&4&&Vy(a);case 26:case 5:Fa(e,a),t===null&&n&4&&Ah(a),n&512&&Wa(a,a.return);break;case 12:Fa(e,a);break;case 31:Fa(e,a),n&4&&jy(e,a);break;case 13:Fa(e,a),n&4&&Gy(e,a),n&64&&(e=a.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(a=HN.bind(null,a),f5(e,a))));break;case 22:if(n=a.memoizedState!==null||ht,!n){var l=t!==null&&t.memoizedState!==null||xe;t=ht,o=xe,ht=n,(xe=l)&&!o?(n=2,(a.subtreeFlags&8772)!==0&&(n|=1),_a(e,a,n)):Fa(e,a),ht=t,xe=o}break;case 30:Fa(e,a),n&512&&Wa(a,a.return);break;case 7:n&512&&Wa(a,a.return);default:Fa(e,a)}}function _h(e,t){for(e=e.child;e!==null;)Iy(e,t),e=e.sibling}function Iy(e,t){switch(e.tag){case 5:case 26:try{var a=e.stateNode;if(t){var n=a.style;typeof n.setProperty=="function"?n.setProperty("display","none","important"):n.display="none"}else{var o=e.stateNode,l=e.memoizedProps.style,c=l!=null&&l.hasOwnProperty("display")?l.display:null;o.style.display=c==null||typeof c=="boolean"?"":(""+c).trim()}}catch(h){Te(e,e.return,h)}Hh(e,t);break;case 6:try{e.stateNode.nodeValue=t?"":e.memoizedProps,ve=!0}catch(h){Te(e,e.return,h)}break;case 18:try{var d=e.stateNode;t?Sb(d,!0):Sb(e.stateNode,!1)}catch(h){Te(e,e.return,h)}break;case 22:case 23:e.memoizedState===null&&_h(e,t);break;default:_h(e,t)}}function Hh(e,t){if(e.subtreeFlags&67108864)for(e=e.child;e!==null;){e:{var a=e,n=t;switch(a.tag){case 4:Iy(a,n);break e;case 22:a.memoizedState===null&&Hh(a,n);break e;default:Hh(a,n)}}e=e.sibling}}function By(e){var t=e.alternate;t!==null&&(e.alternate=null,By(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&Lc(t)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var je=null,Lt=!1;function Da(e,t,a){for(a=a.child;a!==null;)Ly(e,t,a),a=a.sibling}function Ly(e,t,a){if(ra&&typeof ra.onCommitFiberUnmount=="function")try{ra.onCommitFiberUnmount(Cl,a)}catch{}switch(a.tag){case 26:xe||bt(a,t),Da(e,t,a),a.memoizedState?a.memoizedState.count--:a.stateNode&&!xe&&(a=a.stateNode,a.parentNode.removeChild(a));break;case 27:xe||bt(a,t),ll(a);var n=je,o=Lt;di(a.type)&&(je=a.stateNode,Lt=!1),Da(e,t,a),Aw(a.stateNode,a.type,a.memoizedProps),je=n,Lt=o;break;case 5:xe||bt(a,t),ll(a);case 6:if(a.tag===6&&ll(a),n=je,o=Lt,je=null,Da(e,t,a),je=n,Lt=o,je!==null)if(Lt)try{(je.nodeType===9?je.body:je.nodeName==="HTML"?je.ownerDocument.body:je).removeChild(a.stateNode),ve=!0}catch(l){Te(a,t,l)}else try{je.removeChild(a.stateNode),ve=!0}catch(l){Te(a,t,l)}break;case 18:je!==null&&(Lt?(e=je,Nb(e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,a.stateNode),rr(e)):Nb(je,a.stateNode));break;case 4:n=je,o=Lt,je=a.stateNode.containerInfo,Lt=!0,Da(e,t,a),je=n,Lt=o;break;case 0:case 11:case 14:case 15:si(2,a,t),xe||si(4,a,t),Da(e,t,a);break;case 1:xe||(bt(a,t),n=a.stateNode,typeof n.componentWillUnmount=="function"&&Ry(a,t,n)),Da(e,t,a);break;case 21:Da(e,t,a);break;case 22:xe=(n=xe)||a.memoizedState!==null,Da(e,t,a),xe=n;break;case 30:bt(a,t),Da(e,t,a);break;case 7:xe||bt(a,t),Da(e,t,a);break;default:Da(e,t,a)}}function jy(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{rr(e)}catch(a){Te(t,t.return,a)}}}function Gy(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{rr(e)}catch(a){Te(t,t.return,a)}}function kN(e){switch(e.tag){case 31:case 13:case 19:var t=e.stateNode;return t===null&&(t=e.stateNode=new sb),t;case 22:return e=e.stateNode,t=e._retryCache,t===null&&(t=e._retryCache=new sb),t;default:throw Error(z(435,e.tag))}}function Bs(e,t){var a=kN(e);t.forEach(function(n){if(!a.has(n)){a.add(n);var o=UN.bind(null,e,n);n.then(o,o)}})}function Dt(e,t,a){var n=t.deletions;if(n!==null)for(var o=0;o<n.length;o++){var l=n[o],c=e,d=t,h=d;e:for(;h!==null;){switch(h.tag){case 27:if(di(h.type)){je=h.stateNode,Lt=!1;break e}break;case 5:je=h.stateNode,Lt=!1;break e;case 3:case 4:je=h.stateNode.containerInfo,Lt=!0;break e}h=h.return}if(je===null)throw Error(z(160));Ly(c,d,l),je=null,Lt=!1,c=l.alternate,c!==null&&(c.return=null),l.return=null}if(t.subtreeFlags&13886)for(t=t.child;t!==null;)Yy(t,e,a),t=t.sibling}var Ha=null;function Yy(e,t,a){var n=e.alternate,o=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:if(o&4&&(n=e.updateQueue,n=n!==null?n.events:null,n!==null))for(var l=0;l<n.length;l++){var c=n[l];c.ref.impl=c.nextImpl}Dt(t,e,a),_t(e),o&4&&(si(3,e,e.return),Dl(3,e),si(5,e,e.return));break;case 1:Dt(t,e,a),_t(e),o&512&&(xe||n===null||bt(n,n.return)),o&64&&ht&&(e=e.updateQueue,e!==null&&(t=e.callbacks,t!==null&&(a=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=a===null?t:a.concat(t))));break;case 26:if(l=Ha,Dt(t,e,a),_t(e),o&512&&(xe||n===null||bt(n,n.return)),o&4)if(o=n!==null?n.memoizedState:null,a=e.memoizedState,n===null)if(a===null)if(e.stateNode===null)if(ht)e.stateNode=vw(e.type,e.memoizedProps,t.containerInfo,e);else{e:{t=e.type,a=e.memoizedProps,o=l.ownerDocument||l;t:switch(t){case"title":n=o.getElementsByTagName("title")[0],(!n||n[Ml]||n[vt]||n.namespaceURI==="http://www.w3.org/2000/svg"||n.hasAttribute("itemprop"))&&(n=o.createElement(t),o.head.insertBefore(n,o.querySelector("head > title"))),xt(n,t,a),n[vt]=e,pt(n),t=n;break e;case"link":if(l=Rb("link","href",o).get(t+(a.href||""))){for(c=0;c<l.length;c++)if(n=l[c],n.getAttribute("href")===(a.href==null||a.href===""?null:a.href)&&n.getAttribute("rel")===(a.rel==null?null:a.rel)&&n.getAttribute("title")===(a.title==null?null:a.title)&&n.getAttribute("crossorigin")===(a.crossOrigin==null?null:a.crossOrigin)){l.splice(c,1);break t}}n=o.createElement(t),xt(n,t,a),o.head.appendChild(n);break;case"meta":if(l=Rb("meta","content",o).get(t+(a.content||""))){for(c=0;c<l.length;c++)if(n=l[c],n.getAttribute("content")===(a.content==null?null:""+a.content)&&n.getAttribute("name")===(a.name==null?null:a.name)&&n.getAttribute("property")===(a.property==null?null:a.property)&&n.getAttribute("http-equiv")===(a.httpEquiv==null?null:a.httpEquiv)&&n.getAttribute("charset")===(a.charSet==null?null:a.charSet)){l.splice(c,1);break t}}n=o.createElement(t),xt(n,t,a),o.head.appendChild(n);break;default:throw Error(z(468,t))}n[vt]=e,pt(n),t=n}e.stateNode=t}else ht||em(l,e.type,e.stateNode);else e.stateNode=Mb(l,a,e.memoizedProps);else o!==a?(o===null?(t=n.stateNode,t===null||xe||t.parentNode.removeChild(t)):o.count--,a===null?ht||em(l,e.type,e.stateNode):Mb(l,a,e.memoizedProps)):a===null&&e.stateNode!==null&&Dd(e,e.memoizedProps,n.memoizedProps);break;case 27:Dt(t,e,a),_t(e),o&512&&(xe||n===null||bt(n,n.return)),n!==null&&o&4&&Dd(e,e.memoizedProps,n.memoizedProps);break;case 5:if(l=Ja,Ja=!1,Dt(t,e,a),Ja=l,_t(e),o&512&&(xe||n===null||bt(n,n.return)),e.flags&32){t=e.stateNode;try{Jo(t,""),ve=!0}catch(y){Te(e,e.return,y)}}o&4&&e.stateNode!=null&&(t=e.memoizedProps,Dd(e,t,n!==null?n.memoizedProps:t)),o&1024&&(Hd=!0);break;case 6:if(Dt(t,e,a),_t(e),o&4){if(e.stateNode===null)throw Error(z(162));t=e.memoizedProps,a=e.stateNode;try{a.nodeValue=t,ve=!0}catch(y){Te(e,e.return,y)}}break;case 3:if(ve=!1,sc=null,l=Ha,Ha=Nl(t.containerInfo),Dt(t,e,a),Ha=l,_t(e),o&4&&n!==null&&n.memoizedState.isDehydrated)try{rr(t.containerInfo)}catch(y){Te(e,e.return,y)}Hd&&(Hd=!1,Xy(e)),ve=!1;break;case 4:o=Ja,Ja=ht,n=pf(),l=Ha,Ha=Nl(e.stateNode.containerInfo),Dt(t,e,a),_t(e),Ha=l,ve&&Pr&&(Rc=!0),ve=n,Ja=o;break;case 12:Dt(t,e,a),_t(e);break;case 31:Dt(t,e,a),_t(e),o&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,Bs(e,t)));break;case 13:Dt(t,e,a),_t(e),e.child.flags&8192&&e.memoizedState!==null!=(n!==null&&n.memoizedState!==null)&&(tu=oa()),o&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,Bs(e,t)));break;case 22:l=e.memoizedState!==null,c=n!==null&&n.memoizedState!==null;var d=ht,h=xe,g=Ja;ht=d||l,Ja=g||l,xe=h||c,Dt(t,e,a),xe=h,Ja=g,ht=d,_t(e),o&8192&&(t=e.stateNode,t._visibility=l?t._visibility&-2:t._visibility|1,!l||n===null||c||ht||xe||(t=c||xe,a=ht,n=xe,ht=l||ht,xe=t,qn(e,2),ht=a,xe=n),!l&&Ja||_h(e,l)),o&4&&(t=e.updateQueue,t!==null&&(a=t.retryQueue,a!==null&&(t.retryQueue=null,Bs(e,a))));break;case 19:Dt(t,e,a),_t(e),o&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,Bs(e,t)));break;case 30:o&512&&(xe||n===null||bt(n,n.return)),o=pf(),l=Pr,c=(a&335544064)===a,d=e.memoizedProps,Pr=c&&En(d.default,d.update)!=="none",Dt(t,e,a),_t(e),c&&n!==null&&ve&&(e.flags|=4),Pr=l,ve=o;break;case 21:break;case 7:o&512&&(xe||n===null||bt(n,n.return)),n&&n.stateNode!==null&&(n.stateNode._fragmentFiber=e);default:Dt(t,e,a),_t(e)}}function _t(e){var t=e.flags;if(t&2){try{for(var a,n=e.return;n!==null;){if(Oy(n)){a=n;break}n=n.return}n=null;for(var o=e.return;o!==null;){if(Im(o)){var l=o.stateNode;n===null?n=[l]:n.push(l)}if(qm(o))break;o=o.return}var c=n;if(a==null)throw Error(z(160));switch(a.tag){case 27:var d=a.stateNode,h=_d(e);zc(e,h,d,c);break;case 5:var g=a.stateNode;a.flags&32&&(Jo(g,""),a.flags&=-33);var y=_d(e);zc(e,y,g,c);break;case 3:case 4:var N=a.stateNode.containerInfo,f=_d(e);zh(e,f,N,c);break;default:throw Error(z(161))}}catch($){Te(e,e.return,$)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function Xy(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var t=e;Xy(t),t.tag===5&&t.flags&1024&&(t=t.stateNode,or=!0,t.reset(),or=!1),e=e.sibling}}function xo(e,t){if(t.subtreeFlags&9270)for(t=t.child;t!==null;)Qy(t,e),t=t.sibling;else Uy(t,!1)}function Qy(e,t){var a=e.alternate;if(a===null)Mh(e,!1);else switch(e.tag){case 3:if(Dh=Pa=!1,lb(),xo(t,e),!Pa&&!Rc){if(e=en,e!==null)for(var n=0;n<e.length;n+=3){a=e[n];var o=e[n+1];ww(a,e[n+2]),a=a.ownerDocument.documentElement,a!==null&&a.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group("+o+")"})}e=t.containerInfo,e=e.nodeType===9?e.documentElement:e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName===""&&(e.style.viewTransitionName="none",e.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group(root)"}),e.animate({width:[0,0],height:[0,0]},{duration:0,fill:"forwards",pseudoElement:"::view-transition"})),Dh=!0}en=null;break;case 5:xo(t,e);break;case 4:n=Pa,Pa=!1,xo(t,e),Pa&&(Rc=!0),Pa=n;break;case 22:e.memoizedState===null&&(a.memoizedState!==null?Mh(e,!1):xo(t,e));break;case 30:n=Pa,o=lb(),Pa=!1,xo(t,e),Pa&&(e.flags|=4);var l=e.memoizedProps,c=e.stateNode;t=$n(l,c),c=$n(a.memoizedProps,c);var d=En(l.default,l.update);d==="none"?t=!1:(l=a.memoizedState,a.memoizedState=null,a=e.child,Gt=0,t=Bm(e,a,t,c,d,l,!0),Gt!==(l===null?0:l.length)&&(e.flags|=32)),(e.flags&4)!==0&&t?(Wo(e,e.memoizedProps.onUpdate),en=o):o!==null&&(o.push.apply(o,en),en=o),Pa=(e.flags&32)!==0?!0:n;break;default:xo(t,e)}}function Fa(e,t){if(t.subtreeFlags&8772)for(t=t.child;t!==null;)qy(e,t.alternate,t),t=t.sibling}function qn(e,t){for(e=e.child;e!==null;){var a=e,n=t;switch(a.tag){case 0:case 11:case 14:case 15:si(4,a,a.return),qn(a,n);break;case 1:bt(a,a.return);var o=a.stateNode;typeof o.componentWillUnmount=="function"&&Ry(a,a.return,o),qn(a,n);break;case 27:(n&2)!==0&&Aw(a.stateNode,a.type,a.memoizedProps);case 5:bt(a,a.return),a.tag!==5&&a.tag!==27||ll(a),qn(a,n);break;case 6:ll(a);break;case 26:bt(a,a.return),o=a.stateNode,a.memoizedState!==null||o===null||xe||o.parentNode.removeChild(o),qn(a,n);break;case 22:a.memoizedState===null&&qn(a,n);break;case 30:bt(a,a.return),qn(a,n);break;case 7:bt(a,a.return);default:qn(a,n)}e=e.sibling}}function _a(e,t,a){for(a=(t.subtreeFlags&8772)!==0?a:a&-2,t=t.child;t!==null;){var n=t.alternate,o=e,l=t,c=l.flags,d=(a&1)!==0;switch(l.tag){case 0:case 11:case 15:_a(o,l,a),Dl(4,l);break;case 1:if(_a(o,l,a),n=l,o=n.stateNode,typeof o.componentDidMount=="function")try{o.componentDidMount()}catch(y){Te(n,n.return,y)}if(n=l,o=n.updateQueue,o!==null){var h=n.stateNode;try{var g=o.shared.hiddenCallbacks;if(g!==null)for(o.shared.hiddenCallbacks=null,o=0;o<g.length;o++)Iv(g[o],h)}catch(y){Te(n,n.return,y)}}d&&c&64&&My(l),Wa(l,l.return);break;case 27:(a&2)!==0&&Vy(l);case 5:l.tag!==5&&l.tag!==27||ob(l),_a(o,l,a),d&&n===null&&c&4&&Ah(l),Wa(l,l.return);break;case 6:ob(l);break;case 26:h=l.stateNode,l.memoizedState!==null||h===null||ht||em(Nl(h.ownerDocument),l.type,h),_a(o,l,a),d&&n===null&&c&4&&Ah(l),Wa(l,l.return);break;case 12:_a(o,l,a);break;case 31:_a(o,l,a),d&&c&4&&jy(o,l);break;case 13:_a(o,l,a),d&&c&4&&Gy(o,l);break;case 22:l.memoizedState===null&&_a(o,l,a),Wa(l,l.return);break;case 30:_a(o,l,a),Wa(l,l.return);break;case 7:Wa(l,l.return);default:_a(o,l,a)}t=t.sibling}}function Lm(e,t){var a=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),e=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(e=t.memoizedState.cachePool.pool),e!==a&&(e!=null&&e.refCount++,a!=null&&Ol(a))}function jm(e,t){e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&Ol(e))}function va(e,t,a,n){var o=(a&335544064)===a;if(t.subtreeFlags&(o?10262:10256))for(t=t.child;t!==null;)Zy(e,t,a,n),t=t.sibling;else o&&Hy(t)}function Zy(e,t,a,n){var o=(a&335544064)===a;o&&t.alternate===null&&t.return!==null&&t.return.alternate!==null&&ic(t);var l=t.flags;switch(t.tag){case 0:case 11:case 15:va(e,t,a,n),l&2048&&Dl(9,t);break;case 1:va(e,t,a,n);break;case 3:va(e,t,a,n),o&&Dh&&(e=e.containerInfo,e=e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,e.style.viewTransitionName==="root"&&(e.style.viewTransitionName=""),e=e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName==="none"&&(e.style.viewTransitionName="")),l&2048&&(l=null,t.alternate!==null&&(l=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==l&&(t.refCount++,l!=null&&Ol(l)));break;case 12:if(l&2048){va(e,t,a,n),l=t.stateNode;try{var c=t.memoizedProps,d=c.id,h=c.onPostCommit;typeof h=="function"&&h(d,t.alternate===null?"mount":"update",l.passiveEffectDuration,-0)}catch(g){Te(t,t.return,g)}}else va(e,t,a,n);break;case 31:va(e,t,a,n);break;case 13:va(e,t,a,n);break;case 23:break;case 22:c=t.stateNode,d=t.alternate,t.memoizedState!==null?(o&&d!==null&&d.memoizedState===null&&ic(d),c._visibility&2?va(e,t,a,n):sl(e,t)):(o&&d!==null&&d.memoizedState!==null&&ic(t),c._visibility&2?va(e,t,a,n):(c._visibility|=2,So(e,t,a,n,(t.subtreeFlags&10256)!==0||!1))),l&2048&&Lm(d,t);break;case 24:va(e,t,a,n),l&2048&&jm(t.alternate,t);break;case 30:o&&(l=t.alternate,l!==null&&(sn(l.child,!0),sn(t.child,!0))),va(e,t,a,n);break;default:va(e,t,a,n)}}function So(e,t,a,n,o){for(o=o&&((t.subtreeFlags&10256)!==0||!1),t=t.child;t!==null;){var l=e,c=t,d=a,h=n,g=c.flags;switch(c.tag){case 0:case 11:case 15:So(l,c,d,h,o),Dl(8,c);break;case 23:break;case 22:var y=c.stateNode;c.memoizedState!==null?y._visibility&2?So(l,c,d,h,o):sl(l,c):(y._visibility|=2,So(l,c,d,h,o)),o&&g&2048&&Lm(c.alternate,c);break;case 24:So(l,c,d,h,o),o&&g&2048&&jm(c.alternate,c);break;default:So(l,c,d,h,o)}t=t.sibling}}function sl(e,t){if(t.subtreeFlags&10256)for(t=t.child;t!==null;){var a=e,n=t,o=n.flags;switch(n.tag){case 22:sl(a,n),o&2048&&Lm(n.alternate,n);break;case 24:sl(a,n),o&2048&&jm(n.alternate,n);break;default:sl(a,n)}t=t.sibling}}var Ti=8192;function xi(e,t,a){if(e.subtreeFlags&Ti)for(e=e.child;e!==null;)Ky(e,t,a),e=e.sibling}function Ky(e,t,a){switch(e.tag){case 26:xi(e,t,a),e.flags&Ti&&(e.memoizedState!==null?z5(a,Ha,e.memoizedState,e.memoizedProps):(e=e.stateNode,(t&335544128)===t&&Vb(a,e)));break;case 5:xi(e,t,a),e.flags&Ti&&(e=e.stateNode,(t&335544128)===t&&Vb(a,e));break;case 3:case 4:var n=Ha;Ha=Nl(e.stateNode.containerInfo),xi(e,t,a),Ha=n;break;case 22:e.memoizedState===null&&(n=e.alternate,n!==null&&n.memoizedState!==null?(n=Ti,Ti=16777216,xi(e,t,a),Ti=n):xi(e,t,a));break;case 30:if((e.flags&Ti)!==0&&(n=e.memoizedProps.name,n!=null&&n!=="auto")){var o=e.stateNode;o.paired=null,na===null&&(na=new Map),na.set(n,o)}xi(e,t,a);break;default:xi(e,t,a)}}function Jy(e){var t=e.alternate;if(t!==null&&(e=t.child,e!==null)){t.child=null;do t=e.sibling,e.sibling=null,e=t;while(e!==null)}}function Gr(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var a=0;a<t.length;a++){var n=t[a];mt=n,Fy(n,e)}Jy(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)Py(e),e=e.sibling}function Py(e){switch(e.tag){case 0:case 11:case 15:Gr(e),e.flags&2048&&si(9,e,e.return);break;case 3:Gr(e);break;case 12:Gr(e);break;case 22:var t=e.stateNode;e.memoizedState!==null&&t._visibility&2&&(e.return===null||e.return.tag!==13)?(t._visibility&=-3,oc(e)):Gr(e);break;default:Gr(e)}}function oc(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var a=0;a<t.length;a++){var n=t[a];mt=n,Fy(n,e)}Jy(e)}for(e=e.child;e!==null;){switch(t=e,t.tag){case 0:case 11:case 15:si(8,t,t.return),oc(t);break;case 22:a=t.stateNode,a._visibility&2&&(a._visibility&=-3,oc(t));break;default:oc(t)}e=e.sibling}}function Fy(e,t){for(;mt!==null;){var a=mt;switch(a.tag){case 0:case 11:case 15:si(8,a,t);break;case 23:case 22:if(a.memoizedState!==null&&a.memoizedState.cachePool!==null){var n=a.memoizedState.cachePool.pool;n!=null&&n.refCount++}break;case 24:Ol(a.memoizedState.cache)}if(n=a.child,n!==null)n.return=a,mt=n;else e:for(a=e;mt!==null;){n=mt;var o=n.sibling,l=n.return;if(By(n),n===a){mt=null;break e}if(o!==null){o.return=l,mt=o;break e}mt=l}}}var EN={getCacheForType:function(e){var t=yt(tt),a=t.data.get(e);return a===void 0&&(a=e(),t.data.set(e,a)),a},cacheSignal:function(){return yt(tt).controller.signal}},CN=typeof WeakMap=="function"?WeakMap:Map,we=0,Oe=null,ue=null,ge=0,Ne=0,ea=null,Xn=!1,dr=!1,Gm=!1,Tn=0,Ze=0,ci=0,Ri=0,Oc=0,ia=0,Fo=0,cl=null,jt=null,Uh=!1,tu=0,Wy=0,Vc=1/0,Dc=null,ti=null,Xe=0,qa=null,Ii=null,ln=0,qh=0,Ih=null,ew=null,Yo=null,Xo=null,Qo=null,ul=0,rc=null;function sa(){return(we&2)!==0&&ge!==0?ge&-ge:F.T!==null?Xm():iv()}function tw(){if(ia===0)if((ge&536870912)===0||re){var e=Cs;Cs<<=1,(Cs&3932160)===0&&(Cs=262144),ia=e}else ia=536870912;return e=Nt.current,e!==null&&(e.flags|=32),ia}function Wo(e,t){if(t!=null){var a=e.stateNode,n=a.ref;n===null&&(n=a.ref=xw($n(e.memoizedProps,a))),Xo===null&&(Xo=[]),Xo.push(t.bind(null,n))}}function Xt(e,t,a){(e===Oe&&(Ne===2||Ne===9)||e.cancelPendingCommit!==null)&&(er(e,0),Qn(e,ge,ia,!1)),zl(e,a),((we&2)===0||e!==Oe)&&(e===Oe&&((we&2)===0&&(Ri|=a),Ze===4&&Qn(e,ge,ia,!1)),un(e))}function aw(e,t,a){if((we&6)!==0)throw Error(z(327));var n=!a&&(t&127)===0&&(t&e.expiredLanes)===0||Al(e,t),o=n?MN(e,t):Ud(e,t,!0),l=n;do{if(o===0){dr&&!n&&Qn(e,t,0,!1);break}else{if(a=e.current.alternate,l&&!AN(a)){o=Ud(e,t,!1),l=!1;continue}if(o===2){if(l=t,e.errorRecoveryDisabledLanes&l)var c=0;else c=e.pendingLanes&-536870913,c=c!==0?c:c&536870912?536870912:0;if(c!==0){t=c;e:{var d=e;o=cl;var h=d.current.memoizedState.isDehydrated;if(h&&(er(d,c).flags|=256),c=Ud(d,c,!1),c!==2&&c!==6){if(Gm&&!h){d.errorRecoveryDisabledLanes|=l,Ri|=l,o=4;break e}l=jt,jt=o,l!==null&&(jt===null?jt=l:jt.push.apply(jt,l))}o=c}if(l=!1,o!==2)continue}}if(o===1){er(e,0),Qn(e,t,0,!0);break}e:{switch(n=e,l=o,l){case 0:case 1:throw Error(z(345));case 4:if((t&4194048)!==t&&(t&62914560)!==t)break;case 6:Qn(n,t,ia,!Xn);break e;case 2:jt=null;break;case 3:case 5:break;default:throw Error(z(329))}if((t&62914560)===t&&(o=tu+300-oa(),10<o)){if(Qn(n,t,ia,!Xn),Bc(n,0,!0)!==0)break e;ln=t,n.timeoutHandle=Zm(cb.bind(null,n,a,jt,Dc,Uh,t,ia,Ri,Fo,Xn,l,"Throttled",-0,0),o);break e}cb(n,a,jt,Dc,Uh,t,ia,Ri,Fo,Xn,l,null,-0,0)}}break}while(!0);un(e)}function cb(e,t,a,n,o,l,c,d,h,g,y,N,f,$){e.timeoutHandle=-1;var C=t.subtreeFlags,k=(l&335544064)===l;if(N=null,(k||C&8192||(C&16785408)===16785408)&&(N={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:an},na=null,Ky(t,l,N),k&&(C=N,k=e.containerInfo,k=(k.nodeType===9?k:k.ownerDocument).__reactViewTransition,k!=null&&(C.count++,C.waitingForViewTransition=!0,C=Sl.bind(C),k.finished.then(C,C))),C=(l&62914560)===l?tu-oa():(l&4194048)===l?Wy-oa():0,C=M5(N,C),C!==null)){ln=l,e.cancelPendingCommit=C(db.bind(null,e,t,l,a,n,o,c,d,h,g,y,N,null,f,$)),Qn(e,l,c,!g);return}db(e,t,l,a,n,o,c,d,h,g,y,N)}function AN(e){for(var t=e;;){var a=t.tag;if((a===0||a===11||a===15)&&t.flags&16384&&(a=t.updateQueue,a!==null&&(a=a.stores,a!==null)))for(var n=0;n<a.length;n++){var o=a[n],l=o.getSnapshot;o=o.value;try{if(!ca(l(),o))return!1}catch{return!1}}if(a=t.child,t.subtreeFlags&16384&&a!==null)a.return=t,t=a;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function Qn(e,t,a,n){t=Wb(e,t),t&=~Oc,t&=~Ri,e.suspendedLanes|=t,e.pingedLanes&=~t,n&&(e.warmLanes|=t),n=e.expirationTimes;for(var o=t;0<o;){var l=31-la(o),c=1<<l;n[l]=-1,o&=~c}a!==0&&tv(e,a,t)}function au(){return(we&6)===0?(_l(0,!1),!1):!0}function Ym(){if(ue!==null){if(Ne===0)var e=ue.return;else e=ue,bn=Yi=null,Cm(e),Lo=null,bl=0,e=ue;for(;e!==null;)zy(e.alternate,e),e=e.return;ue=null}}function er(e,t){var a=e.timeoutHandle;return a!==-1&&(e.timeoutHandle=-1,PN(a)),a=e.cancelPendingCommit,a!==null&&(e.cancelPendingCommit=null,a()),ln=0,Ym(),Oe=e,ue=a=vn(e.current,null),ge=t,Ne=0,ea=null,Xn=!1,dr=Al(e,t),Gm=!1,Fo=ia=Oc=Ri=ci=Ze=0,jt=cl=null,Uh=!1,Tn=Wb(e,t),Xc(),a}function nw(e,t){ne=null,F.H=Ec,t===cr||t===Kc?(t=_f(),Ne=3):t===wm?(t=_f(),Ne=4):Ne=t===_m?8:t!==null&&typeof t=="object"&&typeof t.then=="function"?6:1,ea=t,ue===null&&(Ze=1,Cc(e,Na(t,e.current)))}function iw(){var e=Nt.current;return e===null?!0:(ge&4194048)===ge?Ct===null:(ge&62914560)===ge||(ge&536870912)!==0?e===Ct:!1}function ow(){var e=F.H;return F.H=Ec,e===null?Ec:e}function rw(){var e=F.A;return F.A=EN,e}function _c(){Ze=4,Xn||(ge&4194048)!==ge&&Nt.current!==null||(dr=!0),(ci&134217727)===0&&(Ri&134217727)===0||Oe===null||Qn(Oe,ge,ia,!1)}function Ud(e,t,a){var n=we;we|=2;var o=ow(),l=rw();(Oe!==e||ge!==t)&&(Dc=null,er(e,t)),t=!1;var c=Ze;e:do try{if(Ne!==0&&ue!==null){var d=ue,h=ea;switch(Ne){case 8:Ym(),c=6;break e;case 3:case 2:case 9:case 6:Nt.current===null&&(t=!0);var g=Ne;if(Ne=0,ea=null,Ho(e,d,h,g),a&&dr){c=0;break e}break;default:g=Ne,Ne=0,ea=null,Ho(e,d,h,g)}}zN(),c=Ze;break}catch(y){nw(e,y)}while(!0);return t&&e.shellSuspendCounter++,bn=Yi=null,we=n,F.H=o,F.A=l,ue===null&&(Oe=null,ge=0,Xc()),c}function zN(){for(;ue!==null;)lw(ue)}function MN(e,t){var a=we;we|=2;var n=ow(),o=rw();Oe!==e||ge!==t?(Dc=null,Vc=oa()+500,er(e,t)):dr=Al(e,t);e:do try{if(Ne!==0&&ue!==null){t=ue;var l=ea;t:switch(Ne){case 1:Ne=0,ea=null,Ho(e,t,l,1);break;case 2:case 9:if(Df(l)){Ne=0,ea=null,ub(t);break}t=function(){Ne!==2&&Ne!==9||Oe!==e||(Ne=7),un(e)},l.then(t,t);break e;case 3:Ne=7;break e;case 4:Ne=5;break e;case 7:Df(l)?(Ne=0,ea=null,ub(t)):(Ne=0,ea=null,Ho(e,t,l,7));break;case 5:var c=null;switch(ue.tag){case 26:c=ue.memoizedState;case 5:case 27:var d=ue;if(c?Rw(c):d.stateNode.complete){Ne=0,ea=null;var h=d.sibling;if(h!==null)ue=h;else{var g=d.return;g!==null?(ue=g,nu(g)):ue=null}break t}}Ne=0,ea=null,Ho(e,t,l,5);break;case 6:Ne=0,ea=null,Ho(e,t,l,6);break;case 8:Ym(),Ze=6;break e;default:throw Error(z(462))}}RN();break}catch(y){nw(e,y)}while(!0);return bn=Yi=null,F.H=n,F.A=o,we=a,ue!==null?0:(Oe=null,ge=0,Xc(),Ze)}function RN(){for(;ue!==null&&!K$();)lw(ue)}function lw(e){var t=Ay(e.alternate,e,Tn);e.memoizedProps=e.pendingProps,t===null?nu(e):ue=t}function ub(e){var t=e,a=t.alternate;switch(t.tag){case 15:case 0:t=Ff(a,t,t.pendingProps,t.type,void 0,ge);break;case 11:t=Ff(a,t,t.pendingProps,t.type.render,t.ref,ge);break;case 5:Cm(t);var n=t;n===gt&&(re?(wc(n),n.tag===5&&n.stateNode!=null&&(Ue=n.stateNode)):(wc(n),re=!0));default:zy(a,t),t=ue=Mv(t,Tn),t=Ay(a,t,Tn)}e.memoizedProps=e.pendingProps,t===null?nu(e):ue=t}function Ho(e,t,a,n){bn=Yi=null,Cm(t),Lo=null,bl=0;var o=t.return;try{if(yN(e,o,t,a,ge)){Ze=1,Cc(e,Na(a,e.current)),ue=null;return}}catch(l){if(o!==null)throw ue=o,l;Ze=1,Cc(e,Na(a,e.current)),ue=null;return}t.flags&32768?(re||n===1?e=!0:dr||(ge&536870912)!==0?e=!1:(Xn=e=!0,(n===2||n===9||n===3||n===6)&&(n=Nt.current,n!==null&&n.tag===13&&(n.flags|=16384))),sw(t,e)):nu(t)}function nu(e){var t=e;do{if((t.flags&32768)!==0){sw(t,Xn);return}e=t.return;var a=NN(t.alternate,t,Tn);if(a!==null){ue=a;return}if(t=t.sibling,t!==null){ue=t;return}ue=t=e}while(t!==null);Ze===0&&(Ze=5)}function sw(e,t){do{var a=SN(e.alternate,e);if(a!==null){a.flags&=32767,ue=a;return}if(a=e.return,a!==null&&(a.flags|=32768,a.subtreeFlags=0,a.deletions=null),!t&&(e=e.sibling,e!==null)){ue=e;return}ue=e=a}while(e!==null);Ze=6,ue=null}function db(e,t,a,n,o,l,c,d,h,g,y,N){e.cancelPendingCommit=null;do iu();while(Xe!==0);if((we&6)!==0)throw Error(z(327));if(t!==null){if(t===e.current)throw Error(z(177));e===Oe&&(ue=Oe=null,ge=0),Ii=t,qa=e,ln=a,Ih=o,ew=n,ON(e,t,a,c,d,h,N)}}function ON(e,t,a,n,o,l,c){var d=t.lanes|t.childLanes;if(qh=d,d|=pm,ox(e,a,d,n,o,l),Xo=null,(a&335544064)===a?(Qo=lN(e),n=10262):(Qo=null,n=10256),(t.subtreeFlags&n)!==0||(t.flags&n)!==0?(e.callbackNode=null,e.callbackPriority=0,qN(gc,function(){return Gh(),null})):(e.callbackNode=null,e.callbackPriority=0),Mc=!1,n=(t.flags&13878)!==0,(t.subtreeFlags&13878)!==0||n){n=F.T,F.T=null,o=$e.p,$e.p=2,l=we,we|=4;try{TN(e,t,a)}finally{we=l,$e.p=o,F.T=n}}Xe=1,Mc?Yo=n5(c,e.containerInfo,Qo,Bh,Lh,DN,jh,Gh,VN,null,null):(Bh(),Lh(),jh())}function VN(e){if(Xe!==0){var t=qa.onRecoverableError;t(e,{componentStack:null})}}function DN(){Xe===3&&(Xe=0,Qy(Ii,qa),Xe=4)}function Bh(){if(Xe===1){Xe=0;var e=qa,t=Ii,a=ln,n=(t.flags&13878)!==0;if((t.subtreeFlags&13878)!==0||n){n=F.T,F.T=null;var o=$e.p;$e.p=2;var l=we;we|=4;try{Pr=Rc=!1,Yy(t,e,a),a=Zh;var c=Nv(e.containerInfo),d=a.focusedElem,h=a.selectionRange;if(c!==d&&d&&d.ownerDocument&&xv(d.ownerDocument.documentElement,d)){if(h!==null&&mm(d)){var g=h.start,y=h.end;if(y===void 0&&(y=g),"selectionStart"in d)d.selectionStart=g,d.selectionEnd=Math.min(y,d.value.length);else{var N=d.ownerDocument||document,f=N&&N.defaultView||window;if(f.getSelection){var $=f.getSelection(),C=d.textContent.length,k=Math.min(h.start,C),D=h.end===void 0?k:Math.min(h.end,C);!$.extend&&k>D&&(c=D,D=k,k=c);var w=Ef(d,k),v=Ef(d,D);if(w&&v&&($.rangeCount!==1||$.anchorNode!==w.node||$.anchorOffset!==w.offset||$.focusNode!==v.node||$.focusOffset!==v.offset)){var b=N.createRange();b.setStart(w.node,w.offset),$.removeAllRanges(),k>D?($.addRange(b),$.extend(v.node,v.offset)):(b.setEnd(v.node,v.offset),$.addRange(b))}}}}for(N=[],$=d;$=$.parentNode;)$.nodeType===1&&N.push({element:$,left:$.scrollLeft,top:$.scrollTop});for(typeof d.focus=="function"&&d.focus(),d=0;d<N.length;d++){var S=N[d];S.element.scrollLeft=S.left,S.element.scrollTop=S.top}}or=!!Qh,Zh=Qh=null}finally{we=l,$e.p=o,F.T=n}}e.current=t,Xe=2}}function Lh(){if(Xe===2){Xe=0;var e=qa,t=Ii,a=(t.flags&8772)!==0;if((t.subtreeFlags&8772)!==0||a){a=F.T,F.T=null;var n=$e.p;$e.p=2;var o=we;we|=4;try{qy(e,t.alternate,t)}finally{we=o,$e.p=n,F.T=a}}Xe=3}}function jh(){if(Xe===4||Xe===3){Xe=0;var e=Yo;Yo=null,J$();var t=qa,a=Ii,n=ln,o=ew,l=(n&335544064)===n?10262:10256;if((a.subtreeFlags&l)!==0||(a.flags&l)!==0?Xe=5:(Xe=0,Ii=qa=null,cw(t,t.pendingLanes)),l=t.pendingLanes,l===0&&(ti=null),lm(n),a=a.stateNode,ra&&typeof ra.onCommitFiberRoot=="function")try{ra.onCommitFiberRoot(Cl,a,void 0,(a.current.flags&128)===128)}catch{}if(o!==null){a=F.T,l=$e.p,$e.p=2,F.T=null;try{for(var c=t.onRecoverableError,d=0;d<o.length;d++){var h=o[d];c(h.value,{componentStack:h.stack})}}finally{F.T=a,$e.p=l}}if(o=Xo,c=Qo,Qo=null,o!==null&&(Xo=null,c===null&&(c=[]),e!==null))for(h=0;h<o.length;h++)a=(0,o[h])(c),a!==void 0&&e.finished.finally(a);(ln&3)!==0&&iu(),un(t),l=t.pendingLanes,(n&261930)!==0&&(l&42)!==0?t===rc?ul++:(ul=0,rc=t):(ul=0,rc=null),_l(0,!1)}}function cw(e,t){(e.pooledCacheLanes&=t)===0&&(t=e.pooledCache,t!=null&&(e.pooledCache=null,Ol(t)))}function iu(){return Yo!==null&&(Yo.skipTransition(),Yo=null),Bh(),Lh(),jh(),Gh()}function Gh(){if(Xe!==5)return!1;var e=qa,t=qh;qh=0;var a=lm(ln),n=F.T,o=$e.p;try{$e.p=32>a?32:a,F.T=null,a=Ih,Ih=null;var l=qa,c=ln;if(Xe=0,Ii=qa=null,ln=0,(we&6)!==0)throw Error(z(331));var d=we;if(we|=4,Py(l.current),Zy(l,l.current,c,a),we=d,_l(0,!1),ra&&typeof ra.onPostCommitFiberRoot=="function")try{ra.onPostCommitFiberRoot(Cl,l)}catch{}return!0}finally{$e.p=o,F.T=n,cw(e,t)}}function hb(e,t,a){t=Na(a,t),t=Nh(e.stateNode,t,2),e=Fn(e,t,2),e!==null&&(zl(e,2),un(e))}function Te(e,t,a){if(e.tag===3)hb(e,e,a);else for(;t!==null;){if(t.tag===3){hb(t,e,a);break}else if(t.tag===1){var n=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof n.componentDidCatch=="function"&&(ti===null||!ti.has(n))){e=Na(a,e),a=Sy(2),n=Fn(t,a,2),n!==null&&(Ty(a,n,t,e),zl(n,2),un(n));break}}t=t.return}}function qd(e,t,a){var n=e.pingCache;if(n===null){n=e.pingCache=new CN;var o=new Set;n.set(t,o)}else o=n.get(t),o===void 0&&(o=new Set,n.set(t,o));o.has(a)||(Gm=!0,o.add(a),e=_N.bind(null,e,t,a),t.then(e,e))}function _N(e,t,a){var n=e.pingCache;n!==null&&n.delete(t),e.pingedLanes|=e.suspendedLanes&a,e.warmLanes&=~a,Oe===e&&(ge&a)===a&&((Ze===4||Ze===3&&(ge&62914560)===ge&&300>oa()-tu)&&(we&2)===0?er(e,0):Oc|=a,Fo===ge&&(Fo=0)),un(e)}function uw(e,t){t===0&&(t=ev()),e=Gi(e,t),e!==null&&(zl(e,t),un(e))}function HN(e){var t=e.memoizedState,a=0;t!==null&&(a=t.retryLane),uw(e,a)}function UN(e,t){var a=0;switch(e.tag){case 31:case 13:var n=e.stateNode,o=e.memoizedState;o!==null&&(a=o.retryLane);break;case 19:n=e.stateNode;break;case 22:n=e.stateNode._retryCache;break;default:throw Error(z(314))}n!==null&&n.delete(t),uw(e,a)}function qN(e,t){return om(e,t)}var tr=null,To=null,Yh=!1,Hc=!1,Id=!1,Zn=0;function un(e){e!==To&&e.next===null&&(To===null?tr=To=e:To=To.next=e),Hc=!0,Yh||(Yh=!0,BN())}function _l(e,t){if(!Id&&Hc){Id=!0;do for(var a=!1,n=tr;n!==null;){if(!t)if(e!==0){var o=n.pendingLanes;if(o===0)var l=0;else{var c=n.suspendedLanes,d=n.pingedLanes;l=(1<<31-la(42|e)+1)-1,l&=o&~(c&~d),l=l&201326741?l&201326741|1:l?l|2:0}l!==0&&(a=!0,mb(n,l))}else l=ge,l=Bc(n,n===Oe?l:0,n.cancelPendingCommit!==null||n.timeoutHandle!==-1),(l&3)===0||Al(n,l)||(a=!0,mb(n,l));n=n.next}while(a);Id=!1}}function IN(){dw()}function dw(){Hc=Yh=!1;var e=0;Zn!==0&&JN()&&(e=Zn);for(var t=oa(),a=null,n=tr;n!==null;){var o=n.next,l=hw(n,t);l===0?(n.next=null,a===null?tr=o:a.next=o,o===null&&(To=a)):(a=n,(e!==0||(l&3)!==0)&&(Hc=!0)),n=o}Xe!==0&&Xe!==5||_l(e,!1),Zn!==0&&(Zn=0)}function hw(e,t){for(var a=e.suspendedLanes,n=e.pingedLanes,o=e.expirationTimes,l=e.pendingLanes&-62914561;0<l;){var c=31-la(l),d=1<<c,h=o[c];h===-1?((d&a)===0||(d&n)!==0)&&(o[c]=ix(d,t)):h<=t&&(e.expiredLanes|=d),l&=~d}if(t=Oe,a=ge,a=Bc(e,e===t?a:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),n=e.callbackNode,a===0||e===t&&(Ne===2||Ne===9)||e.cancelPendingCommit!==null)return n!==null&&n!==null&&vd(n),e.callbackNode=null,e.callbackPriority=0;if((a&3)===0||Al(e,a)){if(t=a&-a,t===e.callbackPriority)return t;switch(n!==null&&vd(n),lm(a)){case 2:case 8:a=Pb;break;case 32:a=gc;break;case 268435456:a=Fb;break;default:a=gc}return n=mw.bind(null,e),a=om(a,n),e.callbackPriority=t,e.callbackNode=a,t}return n!==null&&n!==null&&vd(n),e.callbackPriority=2,e.callbackNode=null,2}function mw(e,t){if(Xe!==0&&Xe!==5)return e.callbackNode=null,e.callbackPriority=0,null;var a=e.callbackNode;if(iu()&&e.callbackNode!==a)return null;var n=ge;return n=Bc(e,e===Oe?n:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),n===0?null:(aw(e,n,t),hw(e,oa()),e.callbackNode!=null&&e.callbackNode===a?mw.bind(null,e):null)}function mb(e,t){if(iu())return null;aw(e,t,!0)}function BN(){FN(function(){(we&6)!==0?om(Jb,IN):dw()})}function Xm(){if(Zn===0){var e=_i;e===0&&(e=Es,Es<<=1,(Es&261888)===0&&(Es=256)),Zn=e}return Zn}function pb(e){return e==null||typeof e=="symbol"||typeof e=="boolean"?null:typeof e=="function"?e:Zs(e)}function LN(e,t,a,n,o){if(t==="submit"&&a&&a.stateNode===o){var l=pb((o[Zt]||null).action),c=n.submitter;c&&(t=(t=c[Zt]||null)?pb(t.formAction):c.getAttribute("formAction"),t!==null&&(l=t,c=null));var d=new jc("action","action",null,n,o);e.push({event:d,listeners:[{instance:null,listener:function(){if(n.defaultPrevented){if(Zn!==0){var h=new FormData(o,c);$h(a,{pending:!0,data:h,method:o.method,action:l},null,h)}}else typeof l=="function"&&(d.preventDefault(),h=new FormData(o,c),$h(a,{pending:!0,data:h,method:o.method,action:l},l,h))},currentTarget:o}]})}}for(Ls=0;Ls<uh.length;Ls++)js=uh[Ls],gb=js.toLowerCase(),fb=js[0].toUpperCase()+js.slice(1),Ia(gb,"on"+fb);var js,gb,fb,Ls;Ia(Tv,"onAnimationEnd");Ia(kv,"onAnimationIteration");Ia(Ev,"onAnimationStart");Ia("dblclick","onDoubleClick");Ia("focusin","onFocus");Ia("focusout","onBlur");Ia(Wx,"onTransitionRun");Ia(eN,"onTransitionStart");Ia(tN,"onTransitionCancel");Ia(Cv,"onTransitionEnd");Ko("onMouseEnter",["mouseout","mouseover"]);Ko("onMouseLeave",["mouseout","mouseover"]);Ko("onPointerEnter",["pointerout","pointerover"]);Ko("onPointerLeave",["pointerout","pointerover"]);Li("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));Li("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));Li("onBeforeInput",["compositionend","keypress","textInput","paste"]);Li("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));Li("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));Li("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var wl="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),jN=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(wl));function pw(e,t){t=(t&4)!==0;for(var a=0;a<e.length;a++){var n=e[a],o=n.event;n=n.listeners;e:{var l=void 0;if(t)for(var c=n.length-1;0<=c;c--){var d=n[c],h=d.instance,g=d.currentTarget;if(d=d.listener,h!==l&&o.isPropagationStopped())break e;l=d,o.currentTarget=g;try{l(o)}catch(y){bc(y)}o.currentTarget=null,l=h}else for(c=0;c<n.length;c++){if(d=n[c],h=d.instance,g=d.currentTarget,d=d.listener,h!==l&&o.isPropagationStopped())break e;l=d,o.currentTarget=g;try{l(o)}catch(y){bc(y)}o.currentTarget=null,l=h}}}}function ce(e,t){var a=t[uf];a===void 0&&(a=t[uf]=new Set);var n=e+"__bubble";a.has(n)||(gw(t,e,2,!1),a.add(n))}function Bd(e,t,a){var n=0;t&&(n|=4),gw(a,e,n,t)}var Gs="_reactListening"+Math.random().toString(36).slice(2);function Qm(e){if(!e[Gs]){e[Gs]=!0,rv.forEach(function(a){a!=="selectionchange"&&(jN.has(a)||Bd(a,!1,e),Bd(a,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[Gs]||(t[Gs]=!0,Bd("selectionchange",!1,t))}}function gw(e,t,a,n){switch(qw(t)){case 2:var o=D5;break;case 8:o=_5;break;default:o=ep}a=o.bind(null,t,a,e),o=void 0,!rh||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(o=!0),n?o!==void 0?e.addEventListener(t,a,{capture:!0,passive:o}):e.addEventListener(t,a,!0):o!==void 0?e.addEventListener(t,a,{passive:o}):e.addEventListener(t,a,!1)}function Ld(e,t,a,n,o){var l=n;if((t&1)===0&&(t&2)===0&&n!==null)e:for(;;){if(n===null)return;var c=n.tag;if(c===3||c===4){var d=n.stateNode.containerInfo;if(d===o)break;if(c===4)for(c=n.return;c!==null;){var h=c.tag;if((h===3||h===4)&&c.stateNode.containerInfo===o)return;c=c.return}for(;d!==null;){if(c=ki(d),c===null)return;if(h=c.tag,h===5||h===6||h===26||h===27){n=l=c;continue e}d=d.parentNode}}n=n.return}pv(function(){var g=l,y=cm(a),N=[];e:{var f=Av.get(e);if(f!==void 0){var $=jc,C=e;switch(e){case"keypress":if(Js(a)===0)break e;case"keydown":case"keyup":$=Ax;break;case"focusin":C="focus",$=Sd;break;case"focusout":C="blur",$=Sd;break;case"beforeblur":case"afterblur":$=Sd;break;case"click":if(a.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":$=vf;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":$=bx;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":$=Vx;break;case Tv:case kv:case Ev:$=wx;break;case Cv:$=_x;break;case"scroll":case"scrollend":$=gx;break;case"wheel":$=Ux;break;case"copy":case"cut":case"paste":$=xx;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":$=wf;break;case"submit":$=Rx;break;case"toggle":case"beforetoggle":$=Ix}var k=(t&4)!==0,D=!k&&(e==="scroll"||e==="scrollend"),w=k?f!==null?f+"Capture":null:f;k=[];for(var v=g,b;v!==null;){var S=v;if(b=S.stateNode,S=S.tag,S!==5&&S!==26&&S!==27||b===null||w===null||(S=hl(v,w),S!=null&&k.push($l(v,S,b))),D)break;v=v.return}0<k.length&&(f=new $(f,C,null,a,y),N.push({event:f,listeners:k}))}}if((t&7)===0){e:{if($=e==="mouseover"||e==="pointerover",f=e==="mouseout"||e==="pointerout",$&&a!==oh&&(C=a.relatedTarget||a.fromElement)&&(ki(C)||C[lr]))break e;(f||$)&&(C=y.window===y?y:($=y.ownerDocument)?$.defaultView||$.parentWindow:window,f?($=a.relatedTarget||a.toElement,f=g,$=$?ki($):null,$!==null&&(D=El($),k=$.tag,$!==D||k!==5&&k!==27&&k!==6)&&($=null)):(f=null,$=g),f!==$&&(k=vf,S="onMouseLeave",w="onMouseEnter",v="mouse",(e==="pointerout"||e==="pointerover")&&(k=wf,S="onPointerLeave",w="onPointerEnter",v="pointer"),D=f==null?C:Kr(f),b=$==null?C:Kr($),C=new k(S,v+"leave",f,a,y),C.target=D,C.relatedTarget=b,S=null,ki(y)===g&&(k=new k(w,v+"enter",$,a,y),k.target=b,k.relatedTarget=D,S=k),D=S,k=f&&$?Qd(f,$,GN):null,f!==null&&bb(N,C,f,k,!1),$!==null&&D!==null&&bb(N,D,$,k,!0)))}e:{if(f=g?Kr(g):window,$=f.nodeName&&f.nodeName.toLowerCase(),$==="select"||$==="input"&&f.type==="file")var R=Sf;else if(Nf(f))if(wv)R=Jx;else{R=Zx;var P=Qx}else $=f.nodeName,!$||$.toLowerCase()!=="input"||f.type!=="checkbox"&&f.type!=="radio"?g&&sm(g.elementType)&&(R=Sf):R=Kx;if(R&&(R=R(e,g))){yv(N,R,a,y);break e}P&&P(e,f,g)}switch(P=g?Kr(g):window,e){case"focusin":(Nf(P)||P.contentEditable==="true")&&(Mo=P,sh=g,el=null);break;case"focusout":el=sh=Mo=null;break;case"mousedown":ch=!0;break;case"contextmenu":case"mouseup":case"dragend":ch=!1,Cf(N,a,y);break;case"selectionchange":if(Fx)break;case"keydown":case"keyup":Cf(N,a,y)}var U;if(hm)e:{switch(e){case"compositionstart":var B="onCompositionStart";break e;case"compositionend":B="onCompositionEnd";break e;case"compositionupdate":B="onCompositionUpdate";break e}B=void 0}else zo?bv(e,a)&&(B="onCompositionEnd"):e==="keydown"&&a.keyCode===229&&(B="onCompositionStart");B&&(fv&&a.locale!=="ko"&&(zo||B!=="onCompositionStart"?B==="onCompositionEnd"&&zo&&(U=gv()):(Gn=y,um="value"in Gn?Gn.value:Gn.textContent,zo=!0)),P=Uc(g,B),0<P.length&&(B=new yf(B,e,null,a,y),N.push({event:B,listeners:P}),U?B.data=U:(U=vv(a),U!==null&&(B.data=U)))),(U=Lx?jx(e,a):Gx(e,a))&&(B=Uc(g,"onBeforeInput"),0<B.length&&(P=new yf("onBeforeInput","beforeinput",null,a,y),N.push({event:P,listeners:B}),P.data=U)),LN(N,e,g,a,y)}pw(N,t)})}function $l(e,t,a){return{instance:e,listener:t,currentTarget:a}}function Uc(e,t){for(var a=t+"Capture",n=[];e!==null;){var o=e,l=o.stateNode;if(o=o.tag,o!==5&&o!==26&&o!==27||l===null||(o=hl(e,a),o!=null&&n.unshift($l(e,o,l)),o=hl(e,t),o!=null&&n.push($l(e,o,l))),e.tag===3)return n;e=e.return}return[]}function GN(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function bb(e,t,a,n,o){for(var l=t._reactName,c=[];a!==null&&a!==n;){var d=a,h=d.alternate,g=d.stateNode;if(d=d.tag,h!==null&&h===n)break;d!==5&&d!==26&&d!==27||g===null||(h=g,o?(g=hl(a,l),g!=null&&c.unshift($l(a,g,h))):o||(g=hl(a,l),g!=null&&c.push($l(a,g,h)))),a=a.return}c.length!==0&&e.push({event:t,listeners:c})}var YN=/\r\n?/g,XN=/\u0000|\uFFFD/g;function vb(e){return(typeof e=="string"?e:""+e).replace(YN,`
`).replace(XN,"")}function fw(e,t){return t=vb(t),vb(e)===t}function Se(e,t,a,n,o,l){switch(a){case"children":if(typeof n=="string")t==="body"||t==="textarea"&&n===""||Jo(e,n);else if(typeof n=="number"||typeof n=="bigint")t!=="body"&&Jo(e,""+n);else return;break;case"className":zs(e,"class",n);break;case"tabIndex":zs(e,"tabindex",n);break;case"dir":case"role":case"viewBox":case"width":case"height":zs(e,a,n);break;case"style":mv(e,n,l);return;case"data":if(t!=="object"){zs(e,"data",n);break}case"src":case"href":if(n===""&&(t!=="a"||a!=="href")){e.removeAttribute(a);break}if(n==null||typeof n=="function"||typeof n=="symbol"||typeof n=="boolean"){e.removeAttribute(a);break}n=Zs(n),e.setAttribute(a,n);break;case"action":case"formAction":if(typeof n=="function"){e.setAttribute(a,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof l=="function"&&(a==="formAction"?(t!=="input"&&Se(e,t,"name",o.name,o,null),Se(e,t,"formEncType",o.formEncType,o,null),Se(e,t,"formMethod",o.formMethod,o,null),Se(e,t,"formTarget",o.formTarget,o,null)):(Se(e,t,"encType",o.encType,o,null),Se(e,t,"method",o.method,o,null),Se(e,t,"target",o.target,o,null)));if(n==null||typeof n=="symbol"||typeof n=="boolean"){e.removeAttribute(a);break}n=Zs(n),e.setAttribute(a,n);break;case"onClick":n!=null&&(e.onclick=an);return;case"onScroll":n!=null&&ce("scroll",e);return;case"onScrollEnd":n!=null&&ce("scrollend",e);return;case"dangerouslySetInnerHTML":if(n!=null){if(typeof n!="object"||!("__html"in n))throw Error(z(61));if(a=n.__html,a!=null){if(o.children!=null)throw Error(z(60));l?.__html!==a&&(e.innerHTML=a)}}break;case"multiple":e.multiple=n&&typeof n!="function"&&typeof n!="symbol";break;case"muted":e.muted=n&&typeof n!="function"&&typeof n!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(n==null||typeof n=="function"||typeof n=="boolean"||typeof n=="symbol"){e.removeAttribute("xlink:href");break}a=Zs(n),e.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",a);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":n!=null&&typeof n!="function"&&typeof n!="symbol"?e.setAttribute(a,n):e.removeAttribute(a);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"credentialless":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":n&&typeof n!="function"&&typeof n!="symbol"?e.setAttribute(a,""):e.removeAttribute(a);break;case"capture":case"download":n===!0?e.setAttribute(a,""):n!==!1&&n!=null&&typeof n!="function"&&typeof n!="symbol"?e.setAttribute(a,n):e.removeAttribute(a);break;case"cols":case"rows":case"size":case"span":n!=null&&typeof n!="function"&&typeof n!="symbol"&&!isNaN(n)&&1<=n?e.setAttribute(a,n):e.removeAttribute(a);break;case"rowSpan":case"start":n==null||typeof n=="function"||typeof n=="symbol"||isNaN(n)?e.removeAttribute(a):e.setAttribute(a,n);break;case"popover":ce("beforetoggle",e),ce("toggle",e),Qs(e,"popover",n);break;case"xlinkActuate":pn(e,"http://www.w3.org/1999/xlink","xlink:actuate",n);break;case"xlinkArcrole":pn(e,"http://www.w3.org/1999/xlink","xlink:arcrole",n);break;case"xlinkRole":pn(e,"http://www.w3.org/1999/xlink","xlink:role",n);break;case"xlinkShow":pn(e,"http://www.w3.org/1999/xlink","xlink:show",n);break;case"xlinkTitle":pn(e,"http://www.w3.org/1999/xlink","xlink:title",n);break;case"xlinkType":pn(e,"http://www.w3.org/1999/xlink","xlink:type",n);break;case"xmlBase":pn(e,"http://www.w3.org/XML/1998/namespace","xml:base",n);break;case"xmlLang":pn(e,"http://www.w3.org/XML/1998/namespace","xml:lang",n);break;case"xmlSpace":pn(e,"http://www.w3.org/XML/1998/namespace","xml:space",n);break;case"is":Qs(e,"is",n);break;case"innerText":case"textContent":return;default:if(!(2<a.length)||a[0]!=="o"&&a[0]!=="O"||a[1]!=="n"&&a[1]!=="N")a=mx.get(a)||a,Qs(e,a,n);else return}ve=!0}function Xh(e,t,a,n,o,l){switch(a){case"style":mv(e,n,l);return;case"dangerouslySetInnerHTML":if(n!=null){if(typeof n!="object"||!("__html"in n))throw Error(z(61));if(a=n.__html,a!=null){if(o.children!=null)throw Error(z(60));l?.__html!==a&&(e.innerHTML=a)}}break;case"children":if(typeof n=="string")Jo(e,n);else if(typeof n=="number"||typeof n=="bigint")Jo(e,""+n);else return;break;case"onScroll":n!=null&&ce("scroll",e);return;case"onScrollEnd":n!=null&&ce("scrollend",e);return;case"onClick":n!=null&&(e.onclick=an);return;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":return;case"innerText":case"textContent":return;default:if(!lv.hasOwnProperty(a))e:{if(a[0]==="o"&&a[1]==="n"&&(o=a.endsWith("Capture"),l=a.slice(2,o?a.length-7:void 0),t=e[Zt]||null,t=t!=null?t[a]:null,typeof t=="function"&&e.removeEventListener(l,t,o),typeof n=="function")){typeof t!="function"&&t!==null&&(a in e?e[a]=null:e.hasAttribute(a)&&e.removeAttribute(a)),e.addEventListener(l,n,o);break e}ve=!0,a in e?e[a]=n:n===!0?e.setAttribute(a,""):Qs(e,a,n)}return}ve=!0}function xt(e,t,a){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":ce("error",e),ce("load",e);var n=!1,o=!1,l;for(l in a)if(a.hasOwnProperty(l)){var c=a[l];if(c!=null)switch(l){case"src":n=!0;break;case"srcSet":o=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(z(137,t));default:Se(e,t,l,c,a,null)}}o&&Se(e,t,"srcSet",a.srcSet,a,null),n&&Se(e,t,"src",a.src,a,null);return;case"input":ce("invalid",e);var d=l=c=o=null,h=null,g=null;for(n in a)if(a.hasOwnProperty(n)){var y=a[n];if(y!=null)switch(n){case"name":o=y;break;case"type":c=y;break;case"checked":h=y;break;case"defaultChecked":g=y;break;case"value":l=y;break;case"defaultValue":d=y;break;case"children":case"dangerouslySetInnerHTML":if(y!=null)throw Error(z(137,t));break;default:Se(e,t,n,y,a,null)}}uv(e,l,d,h,g,c,o,!1);return;case"select":ce("invalid",e),n=c=l=null;for(o in a)if(a.hasOwnProperty(o)&&(d=a[o],d!=null))switch(o){case"value":l=d;break;case"defaultValue":c=d;break;case"multiple":n=d;default:Se(e,t,o,d,a,null)}t=l,a=c,e.multiple=!!n,t!=null?qo(e,!!n,t,!1):a!=null&&qo(e,!!n,a,!0);return;case"textarea":ce("invalid",e),l=o=n=null;for(c in a)if(a.hasOwnProperty(c)&&(d=a[c],d!=null))switch(c){case"value":n=d;break;case"defaultValue":o=d;break;case"children":l=d;break;case"dangerouslySetInnerHTML":if(d!=null)throw Error(z(91));break;default:Se(e,t,c,d,a,null)}hv(e,n,o,l);return;case"option":for(h in a)a.hasOwnProperty(h)&&(n=a[h],n!=null)&&(h==="selected"?e.selected=n&&typeof n!="function"&&typeof n!="symbol":Se(e,t,h,n,a,null));return;case"dialog":ce("beforetoggle",e),ce("toggle",e),ce("cancel",e),ce("close",e);break;case"iframe":case"object":ce("load",e);break;case"video":case"audio":for(n=0;n<wl.length;n++)ce(wl[n],e);break;case"image":ce("error",e),ce("load",e);break;case"details":ce("toggle",e);break;case"embed":case"source":case"link":ce("error",e),ce("load",e);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(g in a)if(a.hasOwnProperty(g)&&(n=a[g],n!=null))switch(g){case"children":case"dangerouslySetInnerHTML":throw Error(z(137,t));default:Se(e,t,g,n,a,null)}return;default:if(sm(t)){for(y in a)a.hasOwnProperty(y)&&(n=a[y],n!==void 0&&Xh(e,t,y,n,a,void 0));return}}for(d in a)a.hasOwnProperty(d)&&(n=a[d],n!=null&&Se(e,t,d,n,a,null))}var QN={};function ZN(e,t,a,n){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var o=null,l=null,c=null,d=null,h=null,g=null,y=null;for($ in a){var N=a[$];if(a.hasOwnProperty($)&&N!=null)switch($){case"checked":break;case"value":break;case"defaultValue":h=N;default:n.hasOwnProperty($)||Se(e,t,$,null,n,N)}}for(var f in n){var $=n[f];if(N=a[f],n.hasOwnProperty(f)&&($!=null||N!=null))switch(f){case"type":$!==N&&(ve=!0),l=$;break;case"name":$!==N&&(ve=!0),o=$;break;case"checked":$!==N&&(ve=!0),g=$;break;case"defaultChecked":$!==N&&(ve=!0),y=$;break;case"value":$!==N&&(ve=!0),c=$;break;case"defaultValue":$!==N&&(ve=!0),d=$;break;case"children":case"dangerouslySetInnerHTML":if($!=null)throw Error(z(137,t));break;default:$!==N&&Se(e,t,f,$,n,N)}}ih(e,c,d,h,g,y,l,o);return;case"select":$=c=d=f=null;for(l in a)if(h=a[l],a.hasOwnProperty(l)&&h!=null)switch(l){case"value":break;case"multiple":$=h;default:n.hasOwnProperty(l)||Se(e,t,l,null,n,h)}for(o in n)if(l=n[o],h=a[o],n.hasOwnProperty(o)&&(l!=null||h!=null))switch(o){case"value":l!==h&&(ve=!0),f=l;break;case"defaultValue":l!==h&&(ve=!0),d=l;break;case"multiple":l!==h&&(ve=!0),c=l;default:l!==h&&Se(e,t,o,l,n,h)}t=d,a=c,n=$,f!=null?qo(e,!!a,f,!1):!!n!=!!a&&(t!=null?qo(e,!!a,t,!0):qo(e,!!a,a?[]:"",!1));return;case"textarea":$=f=null;for(d in a)if(o=a[d],a.hasOwnProperty(d)&&o!=null&&!n.hasOwnProperty(d))switch(d){case"value":break;case"children":break;default:Se(e,t,d,null,n,o)}for(c in n)if(o=n[c],l=a[c],n.hasOwnProperty(c)&&(o!=null||l!=null))switch(c){case"value":o!==l&&(ve=!0),f=o;break;case"defaultValue":o!==l&&(ve=!0),$=o;break;case"children":break;case"dangerouslySetInnerHTML":if(o!=null)throw Error(z(91));break;default:o!==l&&Se(e,t,c,o,n,l)}dv(e,f,$);return;case"option":for(var C in a)f=a[C],a.hasOwnProperty(C)&&f!=null&&!n.hasOwnProperty(C)&&(C==="selected"?e.selected=!1:Se(e,t,C,null,n,f));for(h in n)f=n[h],$=a[h],n.hasOwnProperty(h)&&f!==$&&(f!=null||$!=null)&&(h==="selected"?(f!==$&&(ve=!0),e.selected=f&&typeof f!="function"&&typeof f!="symbol"):Se(e,t,h,f,n,$));return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var k in a)f=a[k],a.hasOwnProperty(k)&&f!=null&&!n.hasOwnProperty(k)&&Se(e,t,k,null,n,f);for(g in n)if(f=n[g],$=a[g],n.hasOwnProperty(g)&&f!==$&&(f!=null||$!=null))switch(g){case"children":case"dangerouslySetInnerHTML":if(f!=null)throw Error(z(137,t));break;default:Se(e,t,g,f,n,$)}return;default:if(sm(t)){for(var D in a)f=a[D],a.hasOwnProperty(D)&&f!==void 0&&!n.hasOwnProperty(D)&&Xh(e,t,D,void 0,n,f);for(y in n)f=n[y],$=a[y],!n.hasOwnProperty(y)||f===$||f===void 0&&$===void 0||Xh(e,t,y,f,n,$);return}}for(var w in a)f=a[w],a.hasOwnProperty(w)&&f!=null&&!n.hasOwnProperty(w)&&Se(e,t,w,null,n,f);for(N in n)f=n[N],$=a[N],!n.hasOwnProperty(N)||f===$||f==null&&$==null||Se(e,t,N,f,n,$)}function yb(e){switch(e){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function KN(){if(typeof performance.getEntriesByType=="function"){for(var e=0,t=0,a=performance.getEntriesByType("resource"),n=0;n<a.length;n++){var o=a[n],l=o.transferSize,c=o.initiatorType,d=o.duration;if(l&&d&&yb(c)){for(c=0,d=o.responseEnd,n+=1;n<a.length;n++){var h=a[n],g=h.startTime;if(g>d)break;var y=h.transferSize,N=h.initiatorType;y&&yb(N)&&(h=h.responseEnd,c+=y*(h<d?1:(d-g)/(h-g)))}if(--n,t+=8*(l+c)/(o.duration/1e3),e++,10<e)break}}if(0<e)return t/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e=="number")?e:5}var Qh=null,Zh=null;function xl(e){return e.nodeType===9?e:e.ownerDocument}function wb(e){switch(e){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function bw(e,t){if(e===0)switch(t){case"svg":return 1;case"math":return 2;default:return 0}return e===1&&t==="foreignObject"?0:e}function vw(e,t,a,n){return a=xl(a).createElement(e),a[vt]=n,a[Zt]=t,xt(a,e,t),pt(a),a}function Kh(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.children=="bigint"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var jd=null;function JN(){var e=window.event;return e&&e.type==="popstate"?e===jd?!1:(jd=e,!0):(jd=null,!1)}var Zm=typeof setTimeout=="function"?setTimeout:void 0,PN=typeof clearTimeout=="function"?clearTimeout:void 0,$b=typeof Promise=="function"?Promise:void 0,xb=typeof requestAnimationFrame=="function"?requestAnimationFrame:Zm,FN=typeof queueMicrotask=="function"?queueMicrotask:typeof $b<"u"?function(e){return $b.resolve(null).then(e).catch(WN)}:Zm;function WN(e){setTimeout(function(){throw e})}function di(e){return e==="head"}function Nb(e,t){var a=t,n=0;do{var o=a.nextSibling;if(e.removeChild(a),o&&o.nodeType===8)if(a=o.data,a==="/$"||a==="/&"){if(n===0){e.removeChild(o),rr(t);return}n--}else if(a==="$"||a==="$?"||a==="$~"||a==="$!"||a==="&")n++;else if(a==="html")Yd(e.ownerDocument.documentElement);else if(a==="head"){a=e.ownerDocument.head,Yd(a);for(var l=a.firstChild;l;){var c=l.nextSibling,d=l.nodeName;l[Ml]||d==="SCRIPT"||d==="STYLE"||d==="LINK"&&l.rel.toLowerCase()==="stylesheet"||a.removeChild(l),l=c}}else a==="body"&&Yd(e.ownerDocument.body);a=o}while(a);rr(t)}function Sb(e,t){var a=e;e=0;do{var n=a.nextSibling;if(a.nodeType===1?t?(a._stashedDisplay=a.style.display,a.style.display="none"):(a.style.display=a._stashedDisplay||"",a.getAttribute("style")===""&&a.removeAttribute("style")):a.nodeType===3&&(t?(a._stashedText=a.nodeValue,a.nodeValue=""):a.nodeValue=a._stashedText||""),n&&n.nodeType===8)if(a=n.data,a==="/$"){if(e===0)break;e--}else a!=="$"&&a!=="$?"&&a!=="$~"&&a!=="$!"||e++;a=n}while(a)}function yw(e,t,a){if(t=CSS.escape(t)!==t?"r-"+btoa(t).replace(/=/g,""):t,e.style.viewTransitionName=t,a!=null&&(e.style.viewTransitionClass=a),a=getComputedStyle(e),a.display==="inline"){if(t=e.getClientRects(),t.length===1)var n=1;else for(var o=n=0;o<t.length;o++){var l=t[o];0<l.width&&0<l.height&&n++}n===1&&(e=e.style,e.display=t.length===1?"inline-block":"block",e.marginTop="-"+a.paddingTop,e.marginBottom="-"+a.paddingBottom)}}function ww(e,t){e=e.style,t=t.style;var a=t!=null?t.hasOwnProperty("viewTransitionName")?t.viewTransitionName:t.hasOwnProperty("view-transition-name")?t["view-transition-name"]:null:null;e.viewTransitionName=a==null||typeof a=="boolean"?"":(""+a).trim(),a=t!=null?t.hasOwnProperty("viewTransitionClass")?t.viewTransitionClass:t.hasOwnProperty("view-transition-class")?t["view-transition-class"]:null:null,e.viewTransitionClass=a==null||typeof a=="boolean"?"":(""+a).trim(),e.display==="inline-block"&&(t==null?e.display=e.margin="":(a=t.display,e.display=a==null||typeof a=="boolean"?"":a,a=t.margin,a!=null?e.margin=a:(a=t.hasOwnProperty("marginTop")?t.marginTop:t["margin-top"],e.marginTop=a==null||typeof a=="boolean"?"":a,t=t.hasOwnProperty("marginBottom")?t.marginBottom:t["margin-bottom"],e.marginBottom=t==null||typeof t=="boolean"?"":t)))}function $w(e,t,a){return a=a.ownerDocument.defaultView,{rect:e,abs:t.position==="absolute"||t.position==="fixed",clip:t.clipPath!=="none"||t.overflow!=="visible"||t.filter!=="none"||t.mask!=="none"||t.mask!=="none"||t.borderRadius!=="0px",view:0<=e.bottom&&0<=e.right&&e.top<=a.innerHeight&&e.left<=a.innerWidth}}function Jh(e){var t=e.getBoundingClientRect(),a=getComputedStyle(e);return $w(t,a,e)}function e5(e){var t=e.getBoundingClientRect();t=new DOMRect(t.x+2e4,t.y+2e4,t.width,t.height);var a=getComputedStyle(e);return $w(t,a,e)}function t5(e){return e.documentElement.clientHeight}function a5(e){this.addEventListener("load",e),this.addEventListener("error",e)}function n5(e,t,a,n,o,l,c,d,h){var g=t.nodeType===9?t:t.ownerDocument;try{var y=g.startViewTransition({update:function(){var f=g.defaultView,$=f.navigation&&f.navigation.transition,C=g.fonts.status;n();var k=[];if(C==="loaded"&&(t5(g),g.fonts.status==="loading"&&k.push(g.fonts.ready)),C=k.length,e!==null)for(var D=e.suspenseyImages,w=0,v=0;v<D.length;v++){var b=D[v];if(!b.complete){var S=b.getBoundingClientRect();if(0<S.bottom&&0<S.right&&S.top<f.innerHeight&&S.left<f.innerWidth){if(w+=Ow(b),w>cc){k.length=C;break}b=new Promise(a5.bind(b)),k.push(b)}}}if(0<k.length)return f=Promise.race([Promise.all(k),new Promise(function(R){return setTimeout(R,500)})]).then(o,o),($?Promise.allSettled([$.finished,f]):f).then(l,l);if(o(),$)return $.finished.then(l,l);l()},types:a});g.__reactViewTransition=y;var N=[];return y.ready.then(function(){for(var f=g.documentElement.getAnimations({subtree:!0}),$=0;$<f.length;$++){var C=f[$],k=C.effect,D=k.pseudoElement;if(D!=null&&D.startsWith("::view-transition")){N.push(C),C=k.getKeyframes();for(var w=D=void 0,v=!0,b=0;b<C.length;b++){var S=C[b],R=S.width;if(D===void 0)D=R;else if(D!==R){v=!1;break}if(R=S.height,w===void 0)w=R;else if(w!==R){v=!1;break}delete S.width,delete S.height,S.transform==="none"&&delete S.transform}v&&D!==void 0&&w!==void 0&&(k.setKeyframes(C),v=getComputedStyle(k.target,k.pseudoElement),v.width!==D||v.height!==w)&&(v=C[0],v.width=D,v.height=w,v=C[C.length-1],v.width=D,v.height=w,k.setKeyframes(C))}}c()},function(f){g.__reactViewTransition===y&&(g.__reactViewTransition=null);try{typeof f=="object"&&f!==null&&f.name==="InvalidStateError"&&(f.message==="View transition was skipped because document visibility state is hidden."||f.message==="Skipping view transition because document visibility state has become hidden."||f.message==="Skipping view transition because viewport size changed."||f.message==="Transition was aborted because of invalid state")&&(f=null),f!==null&&h(f)}finally{n(),o(),c()}}),y.finished.finally(function(){for(var f=0;f<N.length;f++)N[f].cancel();g.__reactViewTransition===y&&(g.__reactViewTransition=null),d()}),y}catch{return n(),o(),c(),null}}function Ei(e,t){this._scope=document.documentElement,this._selector="::view-transition-"+e+"("+t+")"}Ei.prototype.animate=function(e,t){return t=typeof t=="number"?{duration:t}:Ve({},t),t.pseudoElement=this._selector,this._scope.animate(e,t)};Ei.prototype.getAnimations=function(){for(var e=this._scope,t=this._selector,a=e.getAnimations({subtree:!0}),n=[],o=0;o<a.length;o++){var l=a[o].effect;l!==null&&l.target===e&&l.pseudoElement===t&&n.push(a[o])}return n};Ei.prototype.getComputedStyle=function(){return getComputedStyle(this._scope,this._selector)};function xw(e){return{name:e,group:new Ei("group",e),imagePair:new Ei("image-pair",e),old:new Ei("old",e),new:new Ei("new",e)}}function ua(e){this._fragmentFiber=e,this._observers=this._eventListeners=null}ua.prototype.addEventListener=function(e,t,a){var n=null,o=null;if(!(a!=null&&typeof a!="boolean"&&(n=a.signal||null,n!==null&&n.aborted))){this._eventListeners===null&&(this._eventListeners=[]);var l=this._eventListeners;if(Nw(l,e,t,a)===-1){var c=this,d=t;a!=null&&typeof a!="boolean"&&a.once===!0&&(d=function(h){c.removeEventListener(e,t,a),typeof t=="function"?t.call(this,h):t.handleEvent(h)}),n!==null&&(o=c.removeEventListener.bind(c,e,t,a),n.addEventListener("abort",o,{once:!0}),o=n.removeEventListener.bind(n,"abort",o)),n=ar(a),l.push({type:e,listener:t,optionsOrUseCapture:a,attachedListener:d,cleanup:o}),Qt(this._fragmentFiber.child,!1,i5,e,d,n)}this._eventListeners=l}};function i5(e,t,a,n){return st(e).addEventListener(t,a,n),!1}ua.prototype.removeEventListener=function(e,t,a){var n=this._eventListeners;if(n!==null&&(t=Nw(n,e,t,a),t!==-1)){var o=n[t];a=o.attachedListener;var l=o.cleanup;o=ar(o.optionsOrUseCapture),Qt(this._fragmentFiber.child,!1,o5,e,a,o),n.splice(t,1),l!==null&&l()}};function o5(e,t,a,n){return st(e).removeEventListener(t,a,n),!1}function ar(e){return e!=null&&typeof e!="boolean"&&(e.once===!0||e.signal instanceof AbortSignal)?{capture:e.capture,passive:e.passive}:e}function Tb(e){return e==null?"c=0":typeof e=="boolean"?"c="+(e?"1":"0"):"c="+(e.capture?"1":"0")}function Nw(e,t,a,n){if(e.length===0)return-1;n=Tb(n);for(var o=0;o<e.length;o++){var l=e[o];if(l.type===t&&l.listener===a&&Tb(l.optionsOrUseCapture)===n)return o}return-1}ua.prototype.dispatchEvent=function(e){var t=Bi(this._fragmentFiber);if(t===null)return!0;t=st(t);var a=this._eventListeners;if(a!==null&&0<a.length||!e.bubbles){var n=t.nodeType===9?t.createComment(""):document.createTextNode("");if(a)for(var o=0;o<a.length;o++){var l=a[o];n.addEventListener(l.type,l.attachedListener,ar(l.optionsOrUseCapture))}if(t.appendChild(n),e=n.dispatchEvent(e),a)for(o=0;o<a.length;o++)l=a[o],n.removeEventListener(l.type,l.attachedListener,ar(l.optionsOrUseCapture));return t.removeChild(n),e}return t.dispatchEvent(e)};ua.prototype.focus=function(e){Qt(this._fragmentFiber.child,!0,Sw,e,void 0,void 0)};function Sw(e,t){return e.tag===6?!1:(e=st(e),b5(e,t))}ua.prototype.focusLast=function(e){var t=[];Qt(this._fragmentFiber.child,!0,Km,t,void 0,void 0);for(var a=t.length-1;0<=a&&!Sw(t[a],e);a--);};function Km(e,t){return t.push(e),!1}ua.prototype.blur=function(){var e=Bi(this._fragmentFiber);e!==null&&(e=st(e),e=xl(e).activeElement,e!==null&&Qt(this._fragmentFiber.child,!1,r5,e,void 0,void 0))};function r5(e,t){return e.tag===6?!1:(e=st(e),e===t||e.contains(t)?(t.blur(),!0):!1)}ua.prototype.observeUsing=function(e){this._observers===null&&(this._observers=new Set),this._observers.add(e),Qt(this._fragmentFiber.child,!1,l5,e,void 0,void 0)};function l5(e,t){return e.tag===6||(e=st(e),t.observe(e)),!1}ua.prototype.unobserveUsing=function(e){var t=this._observers;if(t!==null&&t.has(e)){t.delete(e),Qt(this._fragmentFiber.child,!1,s5,e,void 0,void 0);for(var a=t=0;a<Ua.length;a++){var n=Ua[a];n.fragmentInstance===this&&n.observer===e?e.unobserve(n.instance):Ua[t++]=n}Ua.length=t}};function s5(e,t){return e.tag===6||(e=st(e),t.unobserve(e)),!1}var Ua=[],Gd=!1;function c5(e,t,a){Ua.push({fragmentInstance:e,observer:t,instance:a}),Gd||(Gd=!0,v5(function(){Gd=!1;var n=Ua;Ua=[];for(var o=0;o<n.length;o++){var l=n[o];l.observer.unobserve(l.instance)}}))}ua.prototype.getClientRects=function(){var e=[];return Qt(this._fragmentFiber.child,!1,u5,e,void 0,void 0),e};function u5(e,t){if(e.tag===6){e=e.stateNode;var a=e.ownerDocument.createRange();a.selectNodeContents(e),t.push.apply(t,a.getClientRects())}else e=st(e),t.push.apply(t,e.getClientRects());return!1}ua.prototype.getRootNode=function(e){var t=Bi(this._fragmentFiber);return t===null?this:st(t).getRootNode(e)};ua.prototype.compareDocumentPosition=function(e){var t=Bi(this._fragmentFiber);if(t===null)return Node.DOCUMENT_POSITION_DISCONNECTED;var a=[];Qt(this._fragmentFiber.child,!1,Km,a,void 0,void 0);var n=st(t);if(a.length===0){if(a=n,nf(this._fragmentFiber)){e:{for(t=this._fragmentFiber.return;t!==null;){if(t.tag===4){t=t.stateNode.containerInfo;break e}if(t.tag===3||t.tag===5||t.tag===27)break;t=t.return}t=null}t!=null&&(a=t)}t=this._fragmentFiber;var o=n=a.compareDocumentPosition(e);return a===e?o=Node.DOCUMENT_POSITION_CONTAINS:n&Node.DOCUMENT_POSITION_CONTAINED_BY&&(a=Xb(t)[1],a===null?o=Node.DOCUMENT_POSITION_PRECEDING:(e=st(a).compareDocumentPosition(e),o=e===0||e&Node.DOCUMENT_POSITION_FOLLOWING?Node.DOCUMENT_POSITION_FOLLOWING:Node.DOCUMENT_POSITION_PRECEDING)),o|=Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC}t=st(a[0]),o=st(a[a.length-1]);var l=nf(this._fragmentFiber)?t.parentElement:n;if(l==null)return Node.DOCUMENT_POSITION_DISCONNECTED;n=l.compareDocumentPosition(t)&Node.DOCUMENT_POSITION_CONTAINED_BY,l=l.compareDocumentPosition(o)&Node.DOCUMENT_POSITION_CONTAINED_BY;var c=t.compareDocumentPosition(e),d=o.compareDocumentPosition(e),h=c&Node.DOCUMENT_POSITION_CONTAINED_BY||d&Node.DOCUMENT_POSITION_CONTAINED_BY;return d=n&&l&&c&Node.DOCUMENT_POSITION_FOLLOWING&&d&Node.DOCUMENT_POSITION_PRECEDING,t=n&&t===e||l&&o===e||h||d?Node.DOCUMENT_POSITION_CONTAINED_BY:!n&&t===e||!l&&o===e?Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC:c,t&Node.DOCUMENT_POSITION_DISCONNECTED||t&Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC||d5(t,this._fragmentFiber,a[0],a[a.length-1],e)?t:Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC};function d5(e,t,a,n,o){var l=ki(o);if(e&Node.DOCUMENT_POSITION_CONTAINED_BY){if(a=!!l)e:{for(;l!==null;){if(l.tag===7&&(l===t||l.alternate===t)){a=!0;break e}l=l.return}a=!1}return a}if(e&Node.DOCUMENT_POSITION_CONTAINS){if(l===null)return l=o.ownerDocument,o===l||o===l.documentElement||o===l.body;e:{for(l=t,t=Bi(t);l!==null;){if(!(l.tag!==5&&l.tag!==3&&l.tag!==27||l!==t&&l.alternate!==t)){l=!0;break e}l=l.return}l=!1}return l}return e&Node.DOCUMENT_POSITION_PRECEDING?((t=!!l)&&!(t=l===a)&&(t=Qd(a,l,of),t===null?t=!1:(Qt(t,!0,B$,l,a),l=ko,ko=null,t=l!==null)),t):e&Node.DOCUMENT_POSITION_FOLLOWING?((t=!!l)&&!(t=l===n)&&(t=Qd(n,l,of),t===null?t=!1:(Qt(t,!0,L$,l,n),l=ko,Xd=ko=null,t=l!==null)),t):!1}function kb(e,t){var a=e.ownerDocument.createRange();a.selectNodeContents(e),e=a.getBoundingClientRect(),window.scrollTo(window.scrollX+e.left,t?window.scrollY+e.top:window.scrollY+e.bottom-window.innerHeight)}ua.prototype.scrollIntoView=function(e){if(typeof e=="object")throw Error(z(566));var t=[];Qt(this._fragmentFiber.child,!1,Km,t,void 0,void 0);var a=e!==!1;if(t.length===0){var n=Xb(this._fragmentFiber);if(n=a?n[1]||n[0]||Bi(this._fragmentFiber):n[0]||n[1],n===null)return;if(n.tag===6){e=st(n),kb(e,a);return}if(n=st(n),n.nodeType!==9){if(n.nodeType===11){a="host"in n?n.host:null,a!==null&&a.scrollIntoView(e);return}n.scrollIntoView(e)}}for(n=a?t.length-1:0;n!==(a?-1:t.length);){var o=t[n];o.tag===6?(o=st(o),kb(o,a)):st(o).scrollIntoView(e),n+=a?-1:1}};function h5(e,t){return e=st(e),Tw(e,t),!1}function Tw(e,t){e.reactFragments==null&&(e.reactFragments=new Set),e.reactFragments.add(t)}function kw(e,t){var a=t._eventListeners;if(a!==null)for(var n=0;n<a.length;n++){var o=a[n];e.addEventListener(o.type,o.attachedListener,ar(o.optionsOrUseCapture))}e.nodeType!==3&&(a=t._observers,a!==null&&a.forEach(function(l){for(var c=0,d=0;d<Ua.length;d++){var h=Ua[d];(h.fragmentInstance!==t||h.observer!==l||h.instance!==e)&&(Ua[c++]=h)}Ua.length=c,l.observe(e)}),Tw(e,t))}function m5(e,t){var a=t._eventListeners;if(a!==null)for(var n=0;n<a.length;n++){var o=a[n];e.removeEventListener(o.type,o.attachedListener,ar(o.optionsOrUseCapture))}e.nodeType!==3&&(a=t._observers,a!==null&&a.forEach(function(l){typeof l.rootMargin=="string"?c5(t,l,e):l.unobserve(e)}),e.reactFragments!=null&&e.reactFragments.delete(t))}function Ph(e){var t=e.firstChild;for(t&&t.nodeType===10&&(t=t.nextSibling);t;){var a=t;switch(t=t.nextSibling,a.nodeName){case"HTML":case"HEAD":case"BODY":Ph(a),Lc(a);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(a.rel.toLowerCase()==="stylesheet")continue}e.removeChild(a)}}function p5(e,t,a,n){for(;e.nodeType===1;){var o=a;if(e.nodeName.toLowerCase()!==t.toLowerCase()){if(!n&&(e.nodeName!=="INPUT"||e.type!=="hidden"))break}else if(n){if(!e[Ml])switch(t){case"meta":if(!e.hasAttribute("itemprop"))break;return e;case"link":if(l=e.getAttribute("rel"),l==="stylesheet"&&e.hasAttribute("data-precedence"))break;if(l!==o.rel||e.getAttribute("href")!==(o.href==null||o.href===""?null:o.href)||e.getAttribute("crossorigin")!==(o.crossOrigin==null?null:o.crossOrigin)||e.getAttribute("title")!==(o.title==null?null:o.title))break;return e;case"style":if(e.hasAttribute("data-precedence"))break;return e;case"script":if(l=e.getAttribute("src"),(l!==(o.src==null?null:o.src)||e.getAttribute("type")!==(o.type==null?null:o.type)||e.getAttribute("crossorigin")!==(o.crossOrigin==null?null:o.crossOrigin))&&l&&e.hasAttribute("async")&&!e.hasAttribute("itemprop"))break;return e;default:return e}}else if(t==="input"&&e.type==="hidden"){var l=o.name==null?null:""+o.name;if(o.type==="hidden"&&e.getAttribute("name")===l)return e}else return e;if(e=Ta(e.nextSibling),e===null)break}return null}function g5(e,t,a){if(t==="")return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!a||(e=Ta(e.nextSibling),e===null))return null;return e}function Ew(e,t){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!t||(e=Ta(e.nextSibling),e===null))return null;return e}function Fh(e){return e.data==="$?"||e.data==="$~"}function Jm(e){return e.data==="$!"||e.data==="$?"&&e.ownerDocument.readyState!=="loading"}function f5(e,t){var a=e.ownerDocument;if(e.data==="$~")e._reactRetry=t;else if(e.data!=="$?"||a.readyState!=="loading")t();else{var n=function(){t(),a.removeEventListener("DOMContentLoaded",n)};a.addEventListener("DOMContentLoaded",n),e._reactRetry=n}}function Ta(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?"||t==="$~"||t==="&"||t==="F!"||t==="F")break;if(t==="/$"||t==="/&")return null}}return e}var Wh=null;function Eb(e){e=e.nextSibling;for(var t=0;e;){if(e.nodeType===8){var a=e.data;if(a==="/$"||a==="/&"){if(t===0)return Ta(e.nextSibling);t--}else a!=="$"&&a!=="$!"&&a!=="$?"&&a!=="$~"&&a!=="&"||t++}e=e.nextSibling}return null}function Cb(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var a=e.data;if(a==="$"||a==="$!"||a==="$?"||a==="$~"||a==="&"){if(t===0)return e;t--}else a!=="/$"&&a!=="/&"||t++}e=e.previousSibling}return null}function b5(e,t){function a(){n=!0}if(e.ownerDocument.activeElement===e)return!0;var n=!1;try{e.ownerDocument.addEventListener("focus",a,!0),(e.focus||HTMLElement.prototype.focus).call(e,t)}finally{e.ownerDocument.removeEventListener("focus",a,!0)}return n}function v5(e){xb(function(){xb(function(t){return e(t)})})}function Cw(e,t,a){switch(t=xl(a),e){case"html":if(e=t.documentElement,!e)throw Error(z(452));return e;case"head":if(e=t.head,!e)throw Error(z(453));return e;case"body":if(e=t.body,!e)throw Error(z(454));return e;default:throw Error(z(451))}}function Aw(e,t,a){for(var n in a){var o=a[n];a.hasOwnProperty(n)&&o!=null&&Se(e,t,n,null,QN,o)}a.dangerouslySetInnerHTML!=null&&(e.textContent=""),e.onclick===an&&(e.onclick=null),Lc(e)}function Yd(e){for(var t=e.attributes;t.length;)e.removeAttributeNode(t[0]);Lc(e)}var ka=new Map,Ab=new Set;function Nl(e){if(typeof e.getRootNode=="function"){var t=e.getRootNode();if(t.nodeType===9||t.nodeType===11)return t}return e.nodeType===9?e:e.ownerDocument}var Cn=$e.d;$e.d={f:y5,r:w5,D:$5,C:x5,L:N5,m:S5,X:k5,S:T5,M:E5};function y5(){var e=Cn.f(),t=au();return e||t}function w5(e){var t=sr(e);t!==null&&t.tag===5&&t.type==="form"?my(t):Cn.r(e)}var hr=typeof document>"u"?null:document;function zw(e,t,a){var n=hr;if(n&&typeof t=="string"&&t){var o=xa(t);o='link[rel="'+e+'"][href="'+o+'"]',typeof a=="string"&&(o+='[crossorigin="'+a+'"]'),Ab.has(o)||(Ab.add(o),e={rel:e,crossOrigin:a,href:t},n.querySelector(o)===null&&(t=n.createElement("link"),xt(t,"link",e),pt(t),n.head.appendChild(t)))}}function $5(e){Cn.D(e),zw("dns-prefetch",e,null)}function x5(e,t){Cn.C(e,t),zw("preconnect",e,t)}function N5(e,t,a){Cn.L(e,t,a);var n=hr;if(n&&e&&t){var o='link[rel="preload"][as="'+xa(t)+'"]';t==="image"&&a&&a.imageSrcSet?(o+='[imagesrcset="'+xa(a.imageSrcSet)+'"]',typeof a.imageSizes=="string"&&(o+='[imagesizes="'+xa(a.imageSizes)+'"]')):o+='[href="'+xa(e)+'"]';var l=o;switch(t){case"style":l=nr(e);break;case"script":l=mr(e)}if(!(ka.has(l)||(e=Ve({rel:"preload",href:t==="image"&&a&&a.imageSrcSet?void 0:e,as:t},a),ka.set(l,e),n.querySelector(o)!==null||t==="style"&&n.querySelector(Hl(l))||t==="script"&&n.querySelector(Ul(l))))){var c=n.createElement("link");xt(c,"link",e),t==="style"&&(c[fc]=!0,c.onload=c.onerror=function(){ov(c)}),pt(c),n.head.appendChild(c)}}}function S5(e,t){Cn.m(e,t);var a=hr;if(a&&e){var n=t&&typeof t.as=="string"?t.as:"script",o='link[rel="modulepreload"][as="'+xa(n)+'"][href="'+xa(e)+'"]',l=o;switch(n){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":l=mr(e)}if(!ka.has(l)&&(e=Ve({rel:"modulepreload",href:e},t),ka.set(l,e),a.querySelector(o)===null)){switch(n){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(a.querySelector(Ul(l)))return}n=a.createElement("link"),xt(n,"link",e),pt(n),a.head.appendChild(n)}}}function T5(e,t,a){Cn.S(e,t,a);var n=hr;if(n&&e){var o=Uo(n).hoistableStyles,l=nr(e);t=t||"default";var c=o.get(l);if(!c){var d={loading:0,preload:null};if(c=n.querySelector(Hl(l)))d.loading=5;else{e=Ve({rel:"stylesheet",href:e,"data-precedence":t},a),(a=ka.get(l))&&Pm(e,a);var h=c=n.createElement("link");pt(h),xt(h,"link",e),h._p=new Promise(function(g,y){h.onload=g,h.onerror=y}),h.addEventListener("load",function(){d.loading|=1}),h.addEventListener("error",function(){d.loading|=2}),d.loading|=4,lc(c,t,n)}c={type:"stylesheet",instance:c,count:1,state:d},o.set(l,c)}}}function k5(e,t){Cn.X(e,t);var a=hr;if(a&&e){var n=Uo(a).hoistableScripts,o=mr(e),l=n.get(o);l||(l=a.querySelector(Ul(o)),l||(e=Ve({src:e,async:!0},t),(t=ka.get(o))&&Fm(e,t),l=a.createElement("script"),pt(l),xt(l,"link",e),a.head.appendChild(l)),l={type:"script",instance:l,count:1,state:null},n.set(o,l))}}function E5(e,t){Cn.M(e,t);var a=hr;if(a&&e){var n=Uo(a).hoistableScripts,o=mr(e),l=n.get(o);l||(l=a.querySelector(Ul(o)),l||(e=Ve({src:e,async:!0,type:"module"},t),(t=ka.get(o))&&Fm(e,t),l=a.createElement("script"),pt(l),xt(l,"link",e),a.head.appendChild(l)),l={type:"script",instance:l,count:1,state:null},n.set(o,l))}}function zb(e,t,a,n){var o=(o=Kn.current)?Nl(o):null;if(!o)throw Error(z(446));switch(e){case"meta":case"title":return null;case"style":return typeof a.precedence=="string"&&typeof a.href=="string"?(a=nr(a.href),t=Uo(o).hoistableStyles,n=t.get(a),n||(n={type:"style",instance:null,count:0,state:null},t.set(a,n)),n):{type:"void",instance:null,count:0,state:null};case"link":if(a.rel==="stylesheet"&&typeof a.href=="string"&&typeof a.precedence=="string"){e=nr(a.href);var l=Uo(o).hoistableStyles,c=l.get(e);if(c||(o=o.ownerDocument||o,c={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},l.set(e,c),(l=o.querySelector(Hl(e)))?l._p||(c.instance=l,c.state.loading=5):(l=ka.get(e),l||(l={rel:"preload",as:"style",href:a.href,crossOrigin:a.crossOrigin,integrity:a.integrity,media:a.media,hrefLang:a.hrefLang,referrerPolicy:a.referrerPolicy},ka.set(e,l)),C5(o,e,l,c.state))),t&&n===null)throw Error(z(528,""));return c}if(t&&n!==null)throw Error(z(529,""));return null;case"script":return t=a.async,a=a.src,typeof a=="string"&&t&&typeof t!="function"&&typeof t!="symbol"?(a=mr(a),t=Uo(o).hoistableScripts,n=t.get(a),n||(n={type:"script",instance:null,count:0,state:null},t.set(a,n)),n):{type:"void",instance:null,count:0,state:null};default:throw Error(z(444,e))}}function nr(e){return'href="'+xa(e)+'"'}function Hl(e){return'link[rel="stylesheet"]['+e+"]"}function Mw(e){return Ve({},e,{"data-precedence":e.precedence,precedence:null})}function C5(e,t,a,n){if(t=e.querySelector('link[rel="preload"][as="style"]['+t+"]")){if(t[fc]!==!0){n.loading=1;return}}else t=e.createElement("link"),t[fc]=!0,t.onload=t.onerror=ov.bind(null,t),xt(t,"link",a),pt(t),e.head.appendChild(t);n.preload=t,t.addEventListener("load",function(){return n.loading|=1}),t.addEventListener("error",function(){return n.loading|=2})}function mr(e){return'[src="'+xa(e)+'"]'}function Ul(e){return"script[async]"+e}function Mb(e,t,a){if(t.count++,t.instance===null)switch(t.type){case"style":var n=e.querySelector('style[data-href~="'+xa(a.href)+'"]');if(n)return t.instance=n,pt(n),n;var o=Ve({},a,{"data-href":a.href,"data-precedence":a.precedence,href:null,precedence:null});return n=(e.ownerDocument||e).createElement("style"),pt(n),xt(n,"style",o),lc(n,a.precedence,e),t.instance=n;case"stylesheet":o=nr(a.href);var l=e.querySelector(Hl(o));if(l)return t.state.loading|=4,t.instance=l,pt(l),l;n=Mw(a),(o=ka.get(o))&&Pm(n,o),l=(e.ownerDocument||e).createElement("link"),pt(l);var c=l;return c._p=new Promise(function(d,h){c.onload=d,c.onerror=h}),xt(l,"link",n),t.state.loading|=4,lc(l,a.precedence,e),t.instance=l;case"script":return l=mr(a.src),(o=e.querySelector(Ul(l)))?(t.instance=o,pt(o),o):(n=a,(o=ka.get(l))&&(n=Ve({},a),Fm(n,o)),e=e.ownerDocument||e,o=e.createElement("script"),pt(o),xt(o,"link",n),e.head.appendChild(o),t.instance=o);case"void":return null;default:throw Error(z(443,t.type))}else t.type==="stylesheet"&&(t.state.loading&4)===0&&(n=t.instance,t.state.loading|=4,lc(n,a.precedence,e));return t.instance}function lc(e,t,a){for(var n=a.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),o=n.length?n[n.length-1]:null,l=o,c=0;c<n.length;c++){var d=n[c];if(d.dataset.precedence===t)l=d;else if(l!==o)break}l?l.parentNode.insertBefore(e,l.nextSibling):(t=a.nodeType===9?a.head:a,t.insertBefore(e,t.firstChild))}function Pm(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.title==null&&(e.title=t.title)}function Fm(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.integrity==null&&(e.integrity=t.integrity)}var sc=null;function Rb(e,t,a){if(sc===null){var n=new Map,o=sc=new Map;o.set(a,n)}else o=sc,n=o.get(a),n||(n=new Map,o.set(a,n));if(n.has(e))return n;for(n.set(e,null),a=a.getElementsByTagName(e),o=0;o<a.length;o++){var l=a[o];if(!(l[Ml]||l[vt]||e==="link"&&l.getAttribute("rel")==="stylesheet")&&l.namespaceURI!=="http://www.w3.org/2000/svg"){var c=l.getAttribute(t)||"";c=e+c;var d=n.get(c);d?d.push(l):n.set(c,[l])}}return n}function em(e,t,a){e=e.ownerDocument||e,e.head.insertBefore(a,t==="title"?e.querySelector("head > title"):null)}function A5(e,t,a){if(a===1||t.itemProp!=null)return!1;switch(e){case"meta":case"title":return!0;case"style":if(typeof t.precedence!="string"||typeof t.href!="string"||t.href==="")break;return!0;case"link":if(typeof t.rel!="string"||typeof t.href!="string"||t.href===""||t.onLoad||t.onError)break;return t.rel==="stylesheet"?(e=t.disabled,typeof t.precedence=="string"&&e==null):!0;case"script":if(t.async&&typeof t.async!="function"&&typeof t.async!="symbol"&&!t.onLoad&&!t.onError&&t.src&&typeof t.src=="string")return!0}return!1}function Ob(e,t){return e==="img"&&t.src!=null&&t.src!==""&&t.onLoad==null&&t.loading!=="lazy"}function Rw(e){return!(e.type==="stylesheet"&&(e.state.loading&3)===0)}function Ow(e){return(e.width||100)*(e.height||100)*(typeof devicePixelRatio=="number"?devicePixelRatio:1)*.25}function Vb(e,t){typeof t.decode=="function"&&(e.imgCount++,t.complete||(e.imgBytes+=Ow(t),e.suspenseyImages.push(t)),e=R5.bind(e),t.decode().then(e,e))}function z5(e,t,a,n){if(a.type==="stylesheet"&&(typeof n.media!="string"||matchMedia(n.media).matches!==!1)&&(a.state.loading&4)===0){if(a.instance===null){var o=nr(n.href),l=t.querySelector(Hl(o));if(l){t=l._p,t!==null&&typeof t=="object"&&typeof t.then=="function"&&(e.count++,e=Sl.bind(e),t.then(e,e)),a.state.loading|=4,a.instance=l,pt(l);return}l=t.ownerDocument||t,n=Mw(n),(o=ka.get(o))&&Pm(n,o),l=l.createElement("link"),pt(l);var c=l;c._p=new Promise(function(d,h){c.onload=d,c.onerror=h}),xt(l,"link",n),a.instance=l}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(a,t),(t=a.state.preload)&&(a.state.loading&3)===0&&(e.count++,a=Sl.bind(e),t.addEventListener("load",a),t.addEventListener("error",a))}}var cc=0;function M5(e,t){return e.stylesheets&&e.count===0&&uc(e,e.stylesheets),0<e.count||0<e.imgCount?function(a){var n=setTimeout(function(){if(e.stylesheets&&uc(e,e.stylesheets),e.unsuspend){var l=e.unsuspend;e.unsuspend=null,l()}},6e4+t);0<e.imgBytes&&cc===0&&(cc=62500*KN());var o=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&uc(e,e.stylesheets),e.unsuspend)){var l=e.unsuspend;e.unsuspend=null,l()}},(e.imgBytes>cc?50:800)+t);return e.unsuspend=a,function(){e.unsuspend=null,clearTimeout(n),clearTimeout(o)}}:null}function Vw(e){if(e.count===0&&(e.imgCount===0||!e.waitingForImages)){if(e.stylesheets)uc(e,e.stylesheets);else if(e.unsuspend){var t=e.unsuspend;e.unsuspend=null,t()}}}function Sl(){this.count--,Vw(this)}function R5(){this.imgCount--,Vw(this)}var qc=null;function uc(e,t){e.stylesheets=null,e.unsuspend!==null&&(e.count++,qc=new Map,t.forEach(O5,e),qc=null,Sl.call(e))}function O5(e,t){if(!(t.state.loading&4)){var a=qc.get(e);if(a)var n=a.get(null);else{a=new Map,qc.set(e,a);for(var o=e.querySelectorAll("link[data-precedence],style[data-precedence]"),l=0;l<o.length;l++){var c=o[l];(c.nodeName==="LINK"||c.getAttribute("media")!=="not all")&&(a.set(c.dataset.precedence,c),n=c)}n&&a.set(null,n)}o=t.instance,c=o.getAttribute("data-precedence"),l=a.get(c)||n,l===n&&a.set(null,o),a.set(c,o),this.count++,n=Sl.bind(this),o.addEventListener("load",n),o.addEventListener("error",n),l?l.parentNode.insertBefore(o,l.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(o,e.firstChild)),t.state.loading|=4}}var ir={$$typeof:tn,Provider:null,Consumer:null,_currentValue:Ci,_currentValue2:Ci,_threadCount:0};function V5(e,t,a,n,o,l,c,d,h){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=yd(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=yd(0),this.hiddenUpdates=yd(null),this.identifierPrefix=n,this.onUncaughtError=o,this.onCaughtError=l,this.onRecoverableError=c,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=h,this.transitionTypes=null,this.incompleteTransitions=new Map}function Dw(e,t,a,n,o,l,c,d,h,g,y,N){return e=new V5(e,t,a,c,h,g,y,N,d),t=1,l===!0&&(t|=24),l=Yt(3,null,null,t),e.current=l,l.stateNode=e,t=vm(),t.refCount++,e.pooledCache=t,t.refCount++,l.memoizedState={element:n,isDehydrated:a,cache:t},$m(l),e}function _w(e){return e?(e=Vo,e):Vo}function Hw(e,t,a,n,o,l){o=_w(o),n.context===null?n.context=o:n.pendingContext=o,n=Pn(t),n.payload={element:a},l=l===void 0?null:l,l!==null&&(n.callback=l),a=Fn(e,n,t),a!==null&&(Xt(a,e,t),al(a,e,t))}function Db(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var a=e.retryLane;e.retryLane=a!==0&&a<t?a:t}}function Wm(e,t){Db(e,t),(e=e.alternate)&&Db(e,t)}function Uw(e){if(e.tag===13||e.tag===31){var t=Gi(e,67108864);t!==null&&Xt(t,e,67108864),Wm(e,67108864)}}function _b(e){if(e.tag===13||e.tag===31){var t=sa();t=rm(t);var a=Gi(e,t);a!==null&&Xt(a,e,t),Wm(e,t)}}var or=!0;function D5(e,t,a,n){var o=F.T;F.T=null;var l=$e.p;try{$e.p=2,ep(e,t,a,n)}finally{$e.p=l,F.T=o}}function _5(e,t,a,n){var o=F.T;F.T=null;var l=$e.p;try{$e.p=8,ep(e,t,a,n)}finally{$e.p=l,F.T=o}}function ep(e,t,a,n){if(or){var o=tm(n);if(o===null)Ld(e,t,n,Ic,a),Hb(e,n);else if(U5(o,e,t,a,n))n.stopPropagation();else if(Hb(e,n),t&4&&-1<H5.indexOf(e)){for(;o!==null;){var l=sr(o);if(l!==null)switch(l.tag){case 3:if(l=l.stateNode,l.current.memoizedState.isDehydrated){var c=Ni(l.pendingLanes);if(c!==0){var d=l;for(d.pendingLanes|=2,d.entangledLanes|=2;c;){var h=1<<31-la(c);d.entanglements[1]|=h,c&=~h}un(l),(we&6)===0&&(Vc=oa()+500,_l(0,!1))}}break;case 31:case 13:d=Gi(l,2),d!==null&&Xt(d,l,2),au(),Wm(l,2)}if(l=tm(n),l===null&&Ld(e,t,n,Ic,a),l===o)break;o=l}o!==null&&n.stopPropagation()}else Ld(e,t,n,null,a)}}function tm(e){return e=cm(e),tp(e)}var Ic=null;function tp(e){if(Ic=null,e=ki(e),e!==null){var t=El(e);if(t===null)e=null;else{var a=t.tag;if(a===13){if(e=jb(t),e!==null)return e;e=null}else if(a===31){if(e=Gb(t),e!==null)return e;e=null}else if(a===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null)}}return Ic=e,null}function qw(e){switch(e){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"fullscreenerror":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"resize":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(P$()){case Jb:return 2;case Pb:return 8;case gc:case F$:return 32;case Fb:return 268435456;default:return 32}default:return 32}}var am=!1,ai=null,ni=null,ii=null,Tl=new Map,kl=new Map,Ln=[],H5="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function Hb(e,t){switch(e){case"focusin":case"focusout":ai=null;break;case"dragenter":case"dragleave":ni=null;break;case"mouseover":case"mouseout":ii=null;break;case"pointerover":case"pointerout":Tl.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":kl.delete(t.pointerId)}}function Yr(e,t,a,n,o,l){return e===null||e.nativeEvent!==l?(e={blockedOn:t,domEventName:a,eventSystemFlags:n,nativeEvent:l,targetContainers:[o]},t!==null&&(t=sr(t),t!==null&&Uw(t)),e):(e.eventSystemFlags|=n,t=e.targetContainers,o!==null&&t.indexOf(o)===-1&&t.push(o),e)}function U5(e,t,a,n,o){switch(t){case"focusin":return ai=Yr(ai,e,t,a,n,o),!0;case"dragenter":return ni=Yr(ni,e,t,a,n,o),!0;case"mouseover":return ii=Yr(ii,e,t,a,n,o),!0;case"pointerover":var l=o.pointerId;return Tl.set(l,Yr(Tl.get(l)||null,e,t,a,n,o)),!0;case"gotpointercapture":return l=o.pointerId,kl.set(l,Yr(kl.get(l)||null,e,t,a,n,o)),!0}return!1}function Iw(e){var t=ki(e.target);if(t!==null){var a=El(t);if(a!==null){if(t=a.tag,t===13){if(t=jb(a),t!==null){e.blockedOn=t,cf(e.priority,function(){_b(a)});return}}else if(t===31){if(t=Gb(a),t!==null){e.blockedOn=t,cf(e.priority,function(){_b(a)});return}}else if(t===3&&a.stateNode.current.memoizedState.isDehydrated){e.blockedOn=a.tag===3?a.stateNode.containerInfo:null;return}}}e.blockedOn=null}function dc(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var a=tm(e.nativeEvent);if(a===null){a=e.nativeEvent;var n=new a.constructor(a.type,a);oh=n,a.target.dispatchEvent(n),oh=null}else return t=sr(a),t!==null&&Uw(t),e.blockedOn=a,!1;t.shift()}return!0}function Ub(e,t,a){dc(e)&&a.delete(t)}function q5(){am=!1,ai!==null&&dc(ai)&&(ai=null),ni!==null&&dc(ni)&&(ni=null),ii!==null&&dc(ii)&&(ii=null),Tl.forEach(Ub),kl.forEach(Ub)}function Ys(e,t){e.blockedOn===t&&(e.blockedOn=null,am||(am=!0,ct.unstable_scheduleCallback(ct.unstable_NormalPriority,q5)))}var Xs=null;function qb(e){Xs!==e&&(Xs=e,ct.unstable_scheduleCallback(ct.unstable_NormalPriority,function(){Xs===e&&(Xs=null);for(var t=0;t<e.length;t+=3){var a=e[t],n=e[t+1],o=e[t+2];if(typeof n!="function"){if(tp(n||a)===null)continue;break}var l=sr(a);l!==null&&(e.splice(t,3),t-=3,$h(l,{pending:!0,data:o,method:a.method,action:n},n,o))}}))}function rr(e){function t(h){return Ys(h,e)}ai!==null&&Ys(ai,e),ni!==null&&Ys(ni,e),ii!==null&&Ys(ii,e),Tl.forEach(t),kl.forEach(t);for(var a=0;a<Ln.length;a++){var n=Ln[a];n.blockedOn===e&&(n.blockedOn=null)}for(;0<Ln.length&&(a=Ln[0],a.blockedOn===null);)Iw(a),a.blockedOn===null&&Ln.shift();if(a=(e.ownerDocument||e).$$reactFormReplay,a!=null)for(n=0;n<a.length;n+=3){var o=a[n],l=a[n+1],c=o[Zt]||null;if(typeof l=="function")c||qb(a);else if(c){var d=null;if(l&&l.hasAttribute("formAction")){if(o=l,c=l[Zt]||null)d=c.formAction;else if(tp(o)!==null)continue}else d=c.action;typeof d=="function"?a[n+1]=d:(a.splice(n,3),n-=3),qb(a)}}}function Bw(){function e(l){l.canIntercept&&l.info==="react-transition"&&l.intercept({handler:function(){return new Promise(function(c){return o=c})},focusReset:"manual",scroll:"manual"})}function t(){o!==null&&(o(),o=null),n||setTimeout(a,20)}function a(){if(!n&&!navigation.transition){var l=navigation.currentEntry;l&&l.url!=null&&navigation.navigate(l.url,{state:l.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var n=!1,o=null;return navigation.addEventListener("navigate",e),navigation.addEventListener("navigatesuccess",t),navigation.addEventListener("navigateerror",t),setTimeout(a,100),function(){n=!0,navigation.removeEventListener("navigate",e),navigation.removeEventListener("navigatesuccess",t),navigation.removeEventListener("navigateerror",t),o!==null&&(o(),o=null)}}}function ap(e){this._internalRoot=e}ou.prototype.render=ap.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(z(409));var a=t.current,n=sa();Hw(a,n,e,t,null,null)};ou.prototype.unmount=ap.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;Hw(e.current,2,null,e,null,null),au(),t[lr]=null}};function ou(e){this._internalRoot=e}ou.prototype.unstable_scheduleHydration=function(e){if(e){var t=iv();e={blockedOn:null,target:e,priority:t};for(var a=0;a<Ln.length&&t!==0&&t<Ln[a].priority;a++);Ln.splice(a,0,e),a===0&&Iw(e)}};var Ib=Bb.version;if(Ib!=="19.3.0")throw Error(z(527,Ib,"19.3.0"));$e.findDOMNode=function(e){var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(z(188)):(e=Object.keys(e).join(","),Error(z(268,e)));return e=I$(t),e=e!==null?Yb(e):null,e=e===null?null:e.stateNode,e};var I5={bundleType:0,version:"19.3.0",rendererPackageName:"react-dom",currentDispatcherRef:F,reconcilerVersion:"19.3.0"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(Xr=__REACT_DEVTOOLS_GLOBAL_HOOK__,!Xr.isDisabled&&Xr.supportsFiber))try{Cl=Xr.inject(I5),ra=Xr}catch{}var Xr;ru.createRoot=function(e,t){if(!Lb(e))throw Error(z(299));var a=!1,n="",o=$y,l=xy,c=Ny;return t!=null&&(t.unstable_strictMode===!0&&(a=!0),t.identifierPrefix!==void 0&&(n=t.identifierPrefix),t.onUncaughtError!==void 0&&(o=t.onUncaughtError),t.onCaughtError!==void 0&&(l=t.onCaughtError),t.onRecoverableError!==void 0&&(c=t.onRecoverableError)),t=Dw(e,1,!1,null,null,a,n,null,o,l,c,Bw),e[lr]=t.current,Qm(e),new ap(t)};ru.hydrateRoot=function(e,t,a){if(!Lb(e))throw Error(z(299));var n=!1,o="",l=$y,c=xy,d=Ny,h=null;return a!=null&&(a.unstable_strictMode===!0&&(n=!0),a.identifierPrefix!==void 0&&(o=a.identifierPrefix),a.onUncaughtError!==void 0&&(l=a.onUncaughtError),a.onCaughtError!==void 0&&(c=a.onCaughtError),a.onRecoverableError!==void 0&&(d=a.onRecoverableError),a.formState!==void 0&&(h=a.formState)),t=Dw(e,1,!0,t,a??null,n,o,h,l,c,d,Bw),t.context=_w(null),a=t.current,n=sa(),n=rm(n),o=Pn(n),o.callback=null,Fn(a,o,n),a=n,t.current.lanes=a,zl(t,a),un(t),e[lr]=t.current,Qm(e),new ou(t)};ru.version="19.3.0"});var Yw=Za((PS,Gw)=>{"use strict";function jw(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(jw)}catch(e){console.error(e)}}jw(),Gw.exports=Lw()});var s0=Za(uu=>{"use strict";var Q5=Symbol.for("react.transitional.element"),Z5=Symbol.for("react.fragment");function l0(e,t,a){var n=null;if(a!==void 0&&(n=""+a),t.key!==void 0&&(n=""+t.key),"key"in t){a={};for(var o in t)o!=="key"&&(a[o]=t[o])}else a=t;return t=a.ref,{$$typeof:Q5,type:e,key:n,ref:t!==void 0?t:null,props:a}}uu.Fragment=Z5;uu.jsx=l0;uu.jsxs=l0});var op=Za((l2,c0)=>{"use strict";c0.exports=s0()});var m=ys($s()),R0=ys(Yw());function B5(e,t=!1){let a=e.replace(/\r\n?/g,`
`).split(`
`),n="",o=[],l=[];for(let c=0;c<a.length;c++){let d=a[c],h=/^ {0,3}(`{3,}|~{3,})/.exec(d)?.[1];if(h&&(n?h[0]===n[0]&&h.length>=n.length&&(n=""):n=h),!n&&!d.trim()&&(!t||c<a.length-1)){let g=o.join(`
`).trim();g&&l.push(g),o=[]}else o.push(d)}if(!t){let c=o.join(`
`).trim();c&&l.push(c)}return l}var L5=['"',"'","\u201D","\u2019","\xBB","\u300D"],j5=['"',"'","\u201C","\u2018","\xAB","\u300C"];function Xw(e){let t=e.trim();return L5.includes(t.slice(-1))&&j5.some(n=>t.slice(0,-1).includes(n))?"speech":"prose"}function Qw(e,t){let a=B5(e),n=()=>({paragraphs:a,asides:a.map(()=>[]),expressions:a.map(()=>null)});if(!t||t.length!==a.length)return n();let o=[],l=[],c=[],d=[];for(let h=0;h<a.length;h+=1){let g=t[h];if(g.kind==="untagged"){o.push(a[h]),l.push(d),c.push(g.expression??null),d=[];continue}let y={register:g.kind==="whisper"?"whisper":"side",text:g.text,...g.target?{target:g.target}:{}};o.length?l[l.length-1].push(y):d.push(y)}return o.length===0?n():{paragraphs:o,asides:l,expressions:c}}var G5="\\\\([-\\\\*_~`#|>!=\\[\\]{}])|\\[([^\\]]*)\\]\\((https?:\\/\\/[^)\\s]+)\\)|`([^`\\n]+)`|==(.+?)==|~~(.+?)~~|\\*\\*\\*(.+?)\\*\\*\\*|\\*\\*(.+?)\\*\\*|__(.+?)__|(?<!\\*)\\*(?!\\*)(.+?)(?<!\\*)\\*(?!\\*)|(?<![_\\w])_([^_]+?)_(?![_\\w])";function Xi(e,t){if(t>6)return[{kind:"text",text:e}];let a=[],n=new RegExp(G5,"g"),o=0,l,c=d=>{let h=a[a.length-1];if(h?.kind==="text"){a[a.length-1]={kind:"text",text:h.text+d};return}a.push({kind:"text",text:d})};for(;(l=n.exec(e))!==null;)l.index>o&&c(e.slice(o,l.index)),l[1]!=null?c(l[1]):l[2]!=null&&l[3]!=null?a.push({kind:"link",text:l[2],href:l[3]}):l[4]!=null?a.push({kind:"code",text:l[4]}):l[5]!=null?a.push({kind:"styled",style:"highlight",children:Xi(l[5],t+1)}):l[6]!=null?a.push({kind:"styled",style:"strikethrough",children:Xi(l[6],t+1)}):l[7]!=null?a.push({kind:"styled",style:"bold-italic",children:Xi(l[7],t+1)}):l[8]!=null?a.push({kind:"styled",style:"bold",children:Xi(l[8],t+1)}):l[9]!=null?a.push({kind:"styled",style:"underline",children:Xi(l[9],t+1)}):(l[10]!=null||l[11]!=null)&&a.push({kind:"styled",style:"italic",children:Xi(l[10]??l[11],t+1)}),o=l.index+l[0].length;return o<e.length&&c(e.slice(o)),a}function Zw(e){return Xi(e,0)}function An(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function Kw(e){return e===null||typeof e=="string"}function Jw(e){return e===null||typeof e=="number"&&Number.isFinite(e)}function lu(e){return Array.isArray(e)&&e.every(t=>typeof t=="string")}function Y5(e){return e===null?!0:An(e)?typeof e.ref=="string"&&typeof e.url=="string"&&typeof e.id=="string":!1}function X5(e){if(!An(e)||typeof e.id!="string"||e.id.trim().length===0||typeof e.name!="string"||typeof e.purpose!="string"||typeof e.category!="string"||!lu(e.capabilities)||!An(e.presentation)||!An(e.occupancy)||!An(e.state))return!1;let{presentation:t,occupancy:a,state:n}=e;return Y5(t.image)&&Jw(t.x)&&Jw(t.y)&&typeof a.playerHome=="boolean"&&Kw(a.residentCharacterId)&&Kw(a.homeKind)&&typeof n.condition=="string"&&lu(n.upgrades)&&lu(n.furniture)&&lu(n.publicFacts)&&typeof n.updatedAt=="string"}function Pw(e){if(!An(e)||!An(e.settings)||!Array.isArray(e.settings.venues))return e;let t=e.settings.venues,a=t.filter(X5),n=Array.isArray(e.venueRequests)?e.venueRequests:[],o=n.filter(l=>An(l)&&typeof l.id=="string"&&An(l.venueDraft)&&typeof l.venueDraft.name=="string"&&typeof l.venueDraft.purpose=="string"&&typeof l.venueDraft.category=="string");return a.length===t.length&&o.length===n.length&&n===e.venueRequests?e:{...e,venueRequests:o,settings:{...e.settings,venues:a}}}function Fw(e,t,a){return e==="Enter"&&!t&&!a}function su(){let e=globalThis.crypto;if(typeof e?.randomUUID=="function")return e.randomUUID();if(typeof e?.getRandomValues=="function"){let t=e.getRandomValues(new Uint8Array(16));t[6]=t[6]&15|64,t[8]=t[8]&63|128;let a=Array.from(t,n=>n.toString(16).padStart(2,"0")).join("");return`${a.slice(0,8)}-${a.slice(8,12)}-${a.slice(12,16)}-${a.slice(16,20)}-${a.slice(20)}`}return`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,11)}`}function Ww(e,t,a,n){let o=Math.max(0,a-1);return!e||e.roomId!==t?o:a>e.stepCount?e.stepCount:Math.min(n,o)}function e0(e,t){return t<0||t===e?"front":t<e?"left":"right"}function t0(e,t,a){let n=a==="front"?"front":"side",o=e.find(l=>l.view===n&&l.label===t)??e.find(l=>l.view===n&&l.label==="neutral")??e.find(l=>l.view==="front"&&l.label===t)??e.find(l=>l.view==="front"&&l.label==="neutral");return o?{image:o,mirrored:o.view==="side"&&a==="left"}:null}function a0(e,t,a){let n=.2*a.photoWidth/a.width,o=.2*a.photoHeight/a.height;return t.some(l=>l.x!==null&&l.y!==null&&Math.abs(l.x-e.x)<n&&Math.abs(l.y-e.y)<o)}function n0(e,t){return Math.hypot(t.x-e.x,t.y-e.y)>8||Math.abs(t.distance-e.distance)>8}var hi=(e,t,a)=>Math.min(a,Math.max(t,e));function cu(e,t){if(!e.width||!e.height||!t.width||!t.height)return 1;let a=Math.min(t.width/e.width,t.height/e.height);return Math.max(t.width/(e.width*a),t.height/(e.height*a))}function np(e,t,a){if(!e.width||!e.height||!t.width||!t.height)return{left:0,top:0,width:0,height:0};let n=Math.min(t.width/e.width,t.height/e.height),o=Math.max(a.zoom,cu(e,t)),l=e.width*n*o,c=e.height*n*o,d=t.width/2-a.centerX*l,h=t.height/2-a.centerY*c;return{left:l<=t.width?(t.width-l)/2:hi(d,t.width-l,0),top:c<=t.height?(t.height-c)/2:hi(h,t.height-c,0),width:l,height:c}}function i0(e,t,a,n,o,l){let c=np(e,t,a);if(!c.width||!c.height)return a;let d=cu(e,t),h=hi(a.zoom*l,d,Math.max(4,d*2)),g=h/Math.max(a.zoom,d),y=c.width*g,N=c.height*g,f=(n.x-c.left)/c.width,$=(n.y-c.top)/c.height,C=o.x-f*y,k=o.y-$*N;return{zoom:h,centerX:hi((t.width/2-C)/y,0,1),centerY:hi((t.height/2-k)/N,0,1)}}function o0(e,t){let a=Math.max(1,t),n=Math.max(4,a*2);return .32+1.03*((hi(e,a,n)-a)/(n-a))}function r0(e,t){return t?Math.max(1,e):e}function ip(e,t,a){let n=Math.min(90,t.width/2),o=64,l=116,c=e.left+a.x*e.width,d=e.top+a.y*e.height,h=d+o,g=h+l<=t.height?h:d-o-l;return{left:hi(c,n,t.width-n),top:hi(g,0,Math.max(0,t.height-l))}}var r=ys(op()),i="marinara-capability-villages",u0="marinara-capability-villages-styles",K5="/api/villages",J5=.7,d0=[{value:"fresh-start",label:"Fresh start"},{value:"refuge",label:"Refuge"},{value:"shared-project",label:"Shared project"},{value:"discovery",label:"Discovery"},{value:"homecoming",label:"Homecoming"},{value:"something-else",label:"Something else"}],h0={roads:!0,structures:!1,water:!1},m0=["Village identity","Connections","Village map","Build the village","Review"],p0=1,rp=3,lp="__villages_image_disabled__",mu=["neutral","happy","sad","angry","surprised","thinking"];function g0(e,t,a,n,o=!1,l=1){let c=t==="gathering"?"Gathering Place":o?"Your residence":`Residence ${l}`;return{id:e,name:c,form:t==="gathering"?"Gathering place":"Home",classes:[t],spaces:[{id:t,venueClass:t,description:"",image:null,state:{condition:"",items:[],publicFacts:[],features:[],traces:[],updatedAt:""}}],residenceCapacity:1,residentIds:[],improvements:[null,null],purpose:"",description:"",category:t==="gathering"?"public-center":"",presentation:{image:null,x:a,y:n},occupancy:{playerHome:o,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""},guidance:""}}function P5(e){let t=[];for(let a of e){let n=t[t.length-1];n&&n.label===a.dateLabel?n.entries.push(a):t.push({label:a.dateLabel,entries:[a]})}return t}var O0={commitment:"Promise & obligation","personal-fact":"Personal truth",preference:"Preference & boundary",relationship:"Relationship change","shared-experience":"Shared experience"};function du(e){return e.map(t=>t.name).join(", ")||"No resident recorded"}function F5(e,t){let a=Date.parse(e)-t;if(a<=0)return"expiring now";let n=Math.floor(a/36e5),o=Math.max(1,Math.ceil(a%36e5/6e4));return n>0?`${n}h ${o}m left`:`${o}m left`}function W5({library:e,busy:t,onRefresh:a,onForget:n}){let[o,l]=(0,m.useState)("all"),[c,d]=(0,m.useState)(""),[h,g]=(0,m.useState)(""),[y,N]=(0,m.useState)(null),[f,$]=(0,m.useState)(""),C=Date.now(),k=(b,S)=>(!h.trim()||`${b} ${S.map(R=>R.name).join(" ")}`.toLowerCase().includes(h.trim().toLowerCase()))&&(!c||S.some(R=>R.id===c)),D=(e?.recollections??[]).filter(b=>k(b.text,[...b.subjects,...b.knownBy])),w=(e?.durable??[]).filter(b=>k(b.text,[...b.subjects,...b.knownBy])),v=async(b,S)=>{try{let R=await V(`/rooms/archive/${encodeURIComponent(b)}`);N({visit:R.visit,lineIds:S}),$("")}catch(R){N(null),$(q(R,"The source visit could not be read."))}};return(0,r.jsxs)("div",{className:`${i}-memory-library`,children:[(0,r.jsxs)("section",{className:`${i}-memory-hero`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("span",{className:`${i}-memory-kicker`,children:"Continuity, with receipts"}),(0,r.jsx)("h3",{children:"What your villagers carry forward"}),(0,r.jsx)("p",{children:"Passing recollections keep conversations coherent for 24 hours. Durable memories survive because an end-of-visit review found lasting meaning. Exact transcripts remain separate and are never used as hidden character knowledge."})]}),(0,r.jsxs)("div",{className:`${i}-memory-stats`,children:[(0,r.jsxs)("span",{children:[(0,r.jsx)("strong",{children:e?.recollections.length??0})," passing"]}),(0,r.jsxs)("span",{children:[(0,r.jsx)("strong",{children:e?.durable.length??0})," durable"]}),(0,r.jsxs)("span",{children:[(0,r.jsx)("strong",{children:e?.archive.total??0})," archived visits"]})]})]}),(0,r.jsxs)("div",{className:`${i}-memory-layers`,"aria-label":"How Villages memory works",children:[(0,r.jsxs)("article",{children:[(0,r.jsx)("span",{children:"01"}),(0,r.jsx)("strong",{children:"Passing"}),(0,r.jsx)("p",{children:"Useful context with a visible 24-hour expiry."})]}),(0,r.jsxs)("article",{children:[(0,r.jsx)("span",{children:"02"}),(0,r.jsx)("strong",{children:"Durable"}),(0,r.jsx)("p",{children:"Promises, truths, boundaries, bonds, and significant experiences."})]}),(0,r.jsxs)("article",{children:[(0,r.jsx)("span",{children:"03"}),(0,r.jsx)("strong",{children:"Archive"}),(0,r.jsx)("p",{children:"Word-for-word evidence, stored independently from character memory."})]})]}),e?.archive.pendingReviewCount?(0,r.jsxs)("div",{className:`${i}-memory-health`,role:"status",children:[(0,r.jsx)("span",{children:"\u25C7"}),(0,r.jsxs)("div",{children:[(0,r.jsxs)("strong",{children:[e.archive.pendingReviewCount," visit review pending"]}),(0,r.jsx)("p",{children:"The transcript is safe. Villages will retry without holding the room."})]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:t,onClick:a,children:"Retry now"})]}):null,(0,r.jsxs)("div",{className:`${i}-memory-toolbar`,children:[(0,r.jsx)("div",{className:`${i}-memory-tabs`,role:"group","aria-label":"Memory type",children:[["all","All"],["passing","Passing"],["durable","Durable"]].map(([b,S])=>(0,r.jsx)("button",{type:"button","data-active":o===b,onClick:()=>l(b),children:S},b))}),(0,r.jsx)("input",{type:"search",value:h,onChange:b=>g(b.target.value),placeholder:"Search memories\u2026","aria-label":"Search memories"}),(0,r.jsxs)("select",{value:c,onChange:b=>d(b.target.value),"aria-label":"Filter memories by resident",children:[(0,r.jsx)("option",{value:"",children:"Everyone"}),(e?.residents??[]).map(b=>(0,r.jsx)("option",{value:b.id,children:b.name},b.id))]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:t,onClick:a,children:"Refresh"})]}),e===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Reading the village\u2019s memory layers\u2026"}):null,e&&o!=="durable"&&D.length>0?(0,r.jsxs)("section",{className:`${i}-memory-section`,children:[(0,r.jsxs)("div",{className:`${i}-memory-section-head`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("span",{className:`${i}-memory-orb`,"data-kind":"passing",children:"\u25CC"}),(0,r.jsx)("h3",{children:"Passing recollections"})]}),(0,r.jsx)("span",{children:"Quiet context \xB7 expires naturally"})]}),(0,r.jsx)("div",{className:`${i}-memory-grid`,children:D.map(b=>{let S=b.evidence[b.evidence.length-1]??{visitId:b.visitId,lineIds:[]};return(0,r.jsxs)("article",{className:`${i}-memory-card`,"data-kind":"passing",children:[(0,r.jsxs)("div",{className:`${i}-memory-card-top`,children:[(0,r.jsx)("span",{className:`${i}-memory-pill`,children:"Passing"}),(0,r.jsx)("span",{children:F5(b.expiresAt,C)})]}),(0,r.jsx)("p",{className:`${i}-memory-text`,children:b.text}),(0,r.jsxs)("dl",{children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("dt",{children:"About"}),(0,r.jsx)("dd",{children:du(b.subjects)})]}),(0,r.jsxs)("div",{children:[(0,r.jsx)("dt",{children:"Known by"}),(0,r.jsx)("dd",{children:du(b.knownBy)})]})]}),b.reinforcementCount>0?(0,r.jsxs)("p",{className:`${i}-memory-reinforced`,children:["\u21BB Reinforced ",b.reinforcementCount," ",b.reinforcementCount===1?"time":"times"]}):null,(0,r.jsxs)("div",{className:`${i}-memory-card-actions`,children:[(0,r.jsx)("button",{type:"button",onClick:()=>{v(S.visitId,S.lineIds)},children:"View evidence"}),(0,r.jsx)("button",{type:"button",disabled:t,onClick:()=>n("recollections",b.id),children:"Let go"})]})]},b.id)})})]}):null,e&&o!=="passing"&&w.length>0?(0,r.jsxs)("section",{className:`${i}-memory-section`,children:[(0,r.jsxs)("div",{className:`${i}-memory-section-head`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("span",{className:`${i}-memory-orb`,"data-kind":"durable",children:"\u2726"}),(0,r.jsx)("h3",{children:"Durable memories"})]}),(0,r.jsx)("span",{children:"Lasting meaning \xB7 no arbitrary visit quota"})]}),(0,r.jsx)("div",{className:`${i}-memory-grid`,children:w.map(b=>(0,r.jsxs)("article",{className:`${i}-memory-card`,"data-kind":"durable",children:[(0,r.jsxs)("div",{className:`${i}-memory-card-top`,children:[(0,r.jsx)("span",{className:`${i}-memory-pill`,children:b.memoryCategory?O0[b.memoryCategory]:b.kind==="favour"?"Fulfilled wish":"Legacy memory"}),(0,r.jsxs)("span",{children:[b.dateLabel,pp(b)?` \xB7 ${pp(b)}`:""]})]}),(0,r.jsx)("p",{className:`${i}-memory-text`,children:b.text}),(0,r.jsxs)("dl",{children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("dt",{children:"About"}),(0,r.jsx)("dd",{children:du(b.subjects)})]}),(0,r.jsxs)("div",{children:[(0,r.jsx)("dt",{children:"Known by"}),(0,r.jsx)("dd",{children:du(b.knownBy)})]})]}),(0,r.jsxs)("div",{className:`${i}-memory-card-actions`,children:[b.evidence?(0,r.jsx)("button",{type:"button",onClick:()=>{v(b.evidence.visitId,b.evidence.lineIds)},children:"View evidence"}):(0,r.jsx)("span",{className:`${i}-memory-legacy`,children:"No evidence link on this older memory"}),(0,r.jsx)("button",{type:"button",disabled:t,onClick:()=>n("durable",b.id),children:"Forget"})]})]},b.id))})]}):null,e&&(o!=="durable"&&D.length||o!=="passing"&&w.length)===0?(0,r.jsxs)("div",{className:`${i}-memory-empty`,children:[(0,r.jsx)("span",{children:"\u2727"}),(0,r.jsx)("h3",{children:"No memories match"}),(0,r.jsx)("p",{children:"Try another resident, phrase, or memory layer."})]}):null,e?.expiredRecollectionCount?(0,r.jsxs)("p",{className:`${i}-memory-footnote`,children:[e.expiredRecollectionCount," expired passing recollection",e.expiredRecollectionCount===1?" is":"s are"," waiting for routine cleanup."]}):null,f?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:f}):null,y?(0,r.jsxs)("section",{className:`${i}-memory-evidence`,children:[(0,r.jsxs)("div",{className:`${i}-memory-section-head`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("span",{className:`${i}-memory-orb`,"data-kind":"archive",children:"\u2301"}),(0,r.jsxs)("h3",{children:["Exact evidence \xB7 ",y.visit.placeName]})]}),(0,r.jsx)("button",{type:"button",onClick:()=>N(null),"aria-label":"Close evidence",children:"\xD7"})]}),(0,r.jsx)("p",{children:"Only the cited archive lines are shown. The full visit remains in DEBUG \u2192 Venue Visits."}),(0,r.jsx)("ol",{children:y.visit.lines.filter(b=>y.lineIds.includes(b.id)).map(b=>(0,r.jsxs)("li",{children:[(0,r.jsxs)("span",{children:[(0,r.jsx)("strong",{children:b.name||"Player"}),(0,r.jsxs)("small",{children:[pu(b.at)," \xB7 heard by"," ",b.heardBy.map(S=>y.visit.participants.find(R=>R.characterId===S)?.name??S).join(", ")||"no one"]})]}),pr(b.content,`memory-evidence-${b.id}-`)]},b.id))})]}):null]})}function pu(e){if(e.length===0)return"";let t=new Date(e);return Number.isNaN(t.getTime())?"":q0.format(t)}function pp(e){return pu(e.occurredAt)}function eS(e,t){return e.find(a=>a.id===t)?.name??"a place that is gone"}function f0(e){return`${String(Math.floor(e/60)).padStart(2,"0")}:${String(e%60).padStart(2,"0")}`}function sp(e){let t=e.agenda?.activeDay;if(!t)return!1;let a=(e.ingestSchedule?e.agenda?.scheduleWeek?.[t.weekday]:void 0)??e.agenda?.week?.[t.weekday];return!!a&&JSON.stringify(t.blocks)!==JSON.stringify(a)}var tS=new Intl.DateTimeFormat(void 0,{day:"numeric",month:"short"});function aS(e,t){let a=[],n=Date.parse(e);if(Number.isFinite(n)){let l=Math.floor((Date.now()-n)/864e5);a.push(l<=0?"written today":l===1?"written yesterday":`written ${l} days ago`)}let o=Date.parse(t);return a.push(Number.isFinite(o)?`fades ${tS.format(new Date(o))}`:"no set end"),a.join(" \xB7 ")}function nS(e,t){let a=e.find(n=>n.id===t.placeId);return a?t.area==="outside"?a.presentation.image?.url??"":t.area==="private"?a.privateSpaces?.find(n=>n.ownerId===t.privateOwnerId)?.image?.url??"":(t.spaceClass?Ge(a,t.spaceClass).image:null)?.url??"":""}var gp=class extends m.Component{constructor(){super(...arguments);Ng(this,"state",{error:null})}static getDerivedStateFromError(a){return{error:a}}componentDidCatch(a){let n=a.message||"Villages could not open.";this.props.element.capabilityRuntimeError=n,this.props.element.dispatchEvent(new CustomEvent("marinara-capability-runtime-error",{detail:{message:n},bubbles:!0})),console.error("Villages client capability stopped",a)}render(){return this.state.error?(0,r.jsx)("div",{className:`${i}-root`,role:"alert",children:(0,r.jsxs)("section",{className:`${i}-panel`,children:[(0,r.jsx)("h1",{className:`${i}-panel-title`,children:"Villages could not open"}),(0,r.jsx)("p",{className:`${i}-error`,children:this.state.error.message||"An unexpected client error occurred."}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{this.props.element.capabilityRuntimeError=null,this.setState({error:null})},children:"Try again"})]})}):this.props.children}},iS=`
/*
  THE TAB'S OWN SIZES, DECLARED ONCE AND READ EVERYWHERE.

  Two of them: the padding a screen keeps from its own edge, and the gap between
  the things on it. Those are the two that have to answer to the room the tab was
  given, because a phone has a third of the height a monitor has and cannot afford
  the same margin twice over. Both are written so that a wide, tall tab gets
  exactly the numbers this sheet was tuned against before there was a scale at all
  \u2014 1.25rem and 1rem \u2014 and simply gets less when there is less.

  What is deliberately NOT here is the type. Every font-size in this sheet stays
  the size it has always been, on every device. GachaForge shrinks its type with
  its frame because its game is a 16:9 stage that has to fit inside the box
  whole, and words that do not shrink with the picture do not fit the picture.
  This tab is a panel and not a stage: its prose wraps and its lists scroll, and
  a list that scrolls is not improved by being printed smaller. Twelve-pixel body
  text is as legible on a phone as it is on a monitor, and what a phone actually
  needs is its room back \u2014 which is what the fullscreen toggle on the map and the
  queries at the foot of this sheet are for.

  0.4.45 took the word "landscape" out of that sentence, and out of one more in
  this sheet, and put nothing in its place. The tab is drawn for whichever way up
  a phone is held now, so the size a phone is told to print at no longer has a
  side to it; see the PORTRAIT block at the foot of the sheet for what replaced
  the instruction to turn over.

  Both numbers are measured against the TAB rather than the window: the tab
  shares the screen with the Engine's own furniture and takes the whole screen in
  fullscreen, and a window query cannot tell those two apart.
*/
.${i}-root {
  --${i}-pad: clamp(.625rem, 2cqw, 1.25rem);
  --${i}-gap: clamp(.5rem, 1.4cqw, 1rem);
  display: flex;
  flex-direction: column;
  gap: var(--${i}-gap);
  height: 100%;
  min-height: 0;
  overflow-y: auto;
  padding: var(--${i}-pad);
  color: var(--foreground);
}
.${i}-header { display: flex; flex-wrap: wrap; align-items: flex-end; justify-content: space-between; gap: .75rem; }
.${i}-title { margin: 0; font-size: 1.5rem; font-weight: 600; letter-spacing: -.01em; }
.${i}-subtitle { margin: .125rem 0 0; font-size: .75rem; color: var(--muted-foreground); }
.${i}-panel {
  border: 1px solid var(--border);
  border-radius: .75rem;
  background: var(--popover);
  padding: .875rem 1rem;
}
.${i}-panel-title { margin: 0 0 .625rem; font-size: .6875rem; font-weight: 600; letter-spacing: .06em; text-transform: uppercase; color: var(--muted-foreground); }
.${i}-villagers { display: grid; gap: .625rem; grid-template-columns: repeat(auto-fill, minmax(13rem, 1fr)); }
.${i}-villager { display: flex; gap: .625rem; align-items: flex-start; }
.${i}-avatar {
  position: relative;
  display: flex; align-items: center; justify-content: center;
  flex: 0 0 auto; width: 2.25rem; height: 2.25rem;
  border-radius: 999px; border: 1px solid var(--border);
  background: var(--background);
  font-size: .875rem; font-weight: 600;
  overflow: hidden;
}
/* The circle is the frame, so the picture gives up its own shape to it rather
   than the frame growing around whatever the Engine happened to store. The
   card's own avatar crop is drawn on top of this by the picture's own styles \u2014
   see avatarCropStyle \u2014 which is why the frame is what clips it: a framing is
   drawn by enlarging the picture and pushing the rest of it out of the box, and
   a box that did not clip would be a frame with the whole photograph still
   around it. A crop in the older zoom-and-offset format is a transform on this
   same picture, and one in the current format replaces this rule's geometry
   outright; both end up framed by the circle and neither needs a second rule. */
.${i}-avatar > img { display: block; width: 100%; height: 100%; object-fit: cover; }
/*
  The Engine's own person mark, for the one face in this drawer that is nobody's
  picture.

  It is what the Engine draws for the player in its own chats, and it is here
  rather than an initial for the reason an initial is right for a villager and
  wrong for the player: a villager's name is on the map in front of the player,
  and the player's is whatever they called themselves in the wizard, in whatever
  language, possibly one word and possibly five, said in a village that may know
  them by something else entirely. A letter off the front of that is a guess about
  which word a person goes by, and the person mark guesses nothing at all. The
  AvatarFace component draws it.

  Sized in em rather than in rem so that it takes the frame's own scale: the two
  frames here set their own font-size for the initial they used to draw, and a
  mark that read against that initial is one that reads in both. It is drawn a
  little larger than the initial beside it because a line drawing with air inside
  it reads smaller than a block of type at the same measure. The stroke is
  currentColor and the path is filled nowhere, so the mark takes the frame's own
  colour the way a picture would have taken its own.
*/
.${i}-person { width: 1.5em; height: 1.5em; }
.${i}-villager-name { font-size: .8125rem; font-weight: 600; }
.${i}-villager-role { font-size: .6875rem; color: var(--muted-foreground); }
.${i}-villager-note { margin: .375rem 0 0; font-size: .75rem; line-height: 1.45; color: var(--muted-foreground); }
.${i}-notices { margin: 0; padding-left: 1.1rem; display: grid; gap: .375rem; font-size: .75rem; line-height: 1.5; color: var(--muted-foreground); }
.${i}-actions { display: flex; align-items: center; gap: .625rem; }
.${i}-button {
  border: 1px solid var(--border);
  border-radius: .5rem;
  background: var(--background);
  color: var(--foreground);
  padding: .3125rem .625rem;
  font-size: .75rem;
  cursor: pointer;
}
.${i}-button:hover { border-color: var(--primary); color: var(--primary); }
.${i}-button:disabled { opacity: .6; cursor: default; }
.${i}-button[data-active="true"] {
  border-color: var(--primary);
  color: var(--primary);
  box-shadow: inset 0 0 0 1px var(--primary);
}
/*
  The menu's options, gathered under headings rather than strung out in one row:
  everything that shows you the village under Village Management, and everything
  that changes how it behaves under General Settings. More groups are expected.
*/
.${i}-menu-nav { display: flex; flex-direction: column; gap: .875rem; }
.${i}-menu-group { display: flex; flex-direction: column; gap: .375rem; }
.${i}-menu-group > .${i}-panel-title { margin: 0; }
.${i}-menu-group-buttons { display: flex; flex-wrap: wrap; gap: .5rem; }
.${i}-menu-body { display: flex; flex-direction: column; gap: 1rem; }
.${i}-roster { display: flex; flex-direction: column; gap: .375rem; margin-top: .75rem; }
.${i}-roster-entry { min-width: 0; border: 1px solid var(--border); border-radius: .75rem; padding: .5rem .625rem; background: color-mix(in srgb, var(--popover) 92%, transparent); }
.${i}-roster-row { display: flex; align-items: center; justify-content: space-between; flex-wrap: wrap; gap: .5rem; font-size: .75rem; }
.${i}-roster-row > div:first-child { flex: 1 1 10rem; min-width: 0; }
.${i}-roster-row > .${i}-villager-name {
  flex: 1 1 auto;
  min-width: 0;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.${i}-status { font-size: .75rem; color: var(--muted-foreground); }
.${i}-error { font-size: .75rem; color: var(--destructive, #e5484d); }
.${i}-tile {
  display: flex; flex-direction: column; gap: .25rem;
  width: 100%; text-align: left;
  border: 1px solid var(--border); border-radius: .625rem;
  background: var(--background); color: inherit;
  padding: .625rem .75rem; cursor: pointer; font: inherit;
}
.${i}-tile:hover { border-color: var(--primary); }
.${i}-tile[data-selected="true"] { border-color: var(--primary); box-shadow: inset 0 0 0 1px var(--primary); }
.${i}-tile-head { display: flex; align-items: center; gap: .5rem; }
.${i}-tile-name { font-size: .8125rem; font-weight: 600; flex: 1 1 auto; min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.${i}-tile-summary { margin: 0; font-size: .75rem; line-height: 1.45; color: var(--muted-foreground); }
.${i}-tile-meta { display: flex; flex-wrap: wrap; gap: .375rem; align-items: center; font-size: .6875rem; color: var(--muted-foreground); }
.${i}-badge {
  border-radius: 999px; padding: .0625rem .375rem;
  border: 1px solid color-mix(in srgb, var(--destructive, #e5484d) 45%, transparent);
  color: var(--destructive, #e5484d); font-size: .625rem;
}
.${i}-tag { border: 1px solid var(--border); border-radius: 999px; padding: .0625rem .375rem; font-size: .625rem; }
.${i}-remove {
  flex: 0 0 auto; border: 1px solid var(--border); border-radius: .375rem;
  background: transparent; color: var(--muted-foreground);
  font-size: .6875rem; line-height: 1; padding: .25rem .375rem; cursor: pointer;
}
.${i}-remove:hover { border-color: var(--destructive, #e5484d); color: var(--destructive, #e5484d); }
.${i}-empty { margin: 0; font-size: .75rem; line-height: 1.55; color: var(--muted-foreground); }
.${i}-search {
  width: 100%; box-sizing: border-box;
  border: 1px solid var(--border); border-radius: .5rem;
  background: var(--background); color: var(--foreground);
  padding: .375rem .5rem; font-size: .75rem; font-family: inherit;
}
.${i}-picker-list { display: flex; flex-direction: column; gap: .375rem; margin-top: .625rem; max-height: 16rem; overflow-y: auto; }
.${i}-picker-item { display: flex; align-items: center; gap: .625rem; border: 1px solid var(--border); border-radius: .5rem; padding: .5rem .625rem; }
.${i}-picker-item[data-resident="true"] { opacity: .6; }
.${i}-picker-text { flex: 1 1 auto; min-width: 0; }
/*
  A villager's conversation, as a Visual Novel stage over the whole map.

  IT USED TO BE A DRAWER DOWN THE RIGHT-HAND SHARE, and the shape changed because
  the Engine's own roleplay chats have a Visual Novel presentation and this is the
  village's version of it: the picture fills the tab, the villager stands in it,
  and the words are read a paragraph at a time in a card held just above the box
  the player types in. A card of that kind needs the width the whole tab has \u2014
  the whole point of it is one paragraph set at a comfortable measure, and a
  paragraph in two fifths of a phone is a column of single words.

  It is still parked off the right edge and slides in rather than appearing, and
  the reason has not changed: the map is never resized out from under the pins
  just because the player started talking to somebody. Absolute positioning rather
  than fixed keeps it inside the tab \u2014 fixed would escape to the viewport and
  leave the Engine's own furniture behind \u2014 and the homepage's overflow: hidden
  is what clips the parked position. visibility is what takes the shut stage out
  of the tab order and the accessibility tree, since a translated box is still on
  the page.

  NO BORDER, NO RADIUS AND NO WIDTH, because it is the tab: a panel with an edge
  inside a tab that also has an edge is a picture in a frame inside a frame. The
  padding stays, and it is what the picture bleeds past \u2014 the stage layer is
  inset to this box, so the map behind the words runs to the tab's own edge
  rather than stopping a gutter short of it.

  The fill is still the theme's popover, because the layer above it \u2014 the head,
  the reader and the composer \u2014 is drawn over the picture in that colour at an
  opacity, and a picture with no fill under it would be a picture over whatever
  happened to be behind the tab.
*/
.${i}-chat {
  position: absolute; inset: 0; z-index: 3;
  display: flex; flex-direction: column; gap: .75rem;
  min-height: 0;
  border-left: 0; border-radius: 0;
  background: var(--popover); padding: .875rem;
  transform: translateX(100%);
  visibility: hidden;
  transition: transform .28s ease, visibility 0s linear .28s;
}
.${i}-chat[data-open="true"] {
  transform: translateX(0);
  visibility: visible;
  transition: transform .28s ease;
}
.${i}-room-screen {
  position: relative; display: flex; height: 100%; min-height: 0; overflow: hidden;
}
.${i}-room-screen > .${i}-chat {
  position: relative; inset: auto; flex: 1 1 auto; min-width: 0;
  box-sizing: border-box; overflow: hidden; transform: none; visibility: visible; transition: none;
}
.${i}-room-screen .${i}-chat-scene { pointer-events: none; }
.${i}-room-screen .${i}-chat-head {
  align-items: center;
}
.${i}-room-screen .${i}-chat-actions {
  width: 100%; justify-content: flex-end; margin-left: 0;
}
.${i}-room-stars {
  position: absolute; z-index: 4; top: 4.25rem; left: .875rem;
  display: grid; gap: .4rem; width: min(20rem, calc(100% - 1.75rem));
  max-height: min(40vh, 18rem); overflow-y: auto; pointer-events: auto;
}
.${i}-room-star {
  display: flex; align-items: flex-start; gap: .5rem; padding: .55rem .65rem;
  border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border)); border-radius: .65rem;
  background: var(--marinara-chat-chrome-panel-bg, var(--surface)); color: var(--text);
  box-shadow: 0 .25rem 1rem #0003; font-size: .82rem; line-height: 1.35;
}
.${i}-room-star > span:first-child { color: #e5b13e; font-size: 1.2rem; line-height: 1; }
.${i}-room-star > span:nth-child(2) { flex: 1; }
.${i}-room-star button { border: 0; background: transparent; color: inherit; cursor: pointer; font: inherit; }
.${i}-room-star-dismiss { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; width: 2.5rem; height: 2.5rem; margin: -.5rem -.55rem -.5rem 0; font-size: 1.2rem !important; line-height: 1; }
.${i}-room-star button:focus-visible { outline: 2px solid currentColor; border-radius: .2rem; }
@media (max-width: 600px) {
  .${i}-room-stars { top: 4.75rem; left: .625rem; width: min(19rem, calc(100% - 1.25rem)); max-height: 32vh; }
}
@media (prefers-reduced-motion: reduce) {
  .${i}-chat, .${i}-chat[data-open="true"] { transition: none; }
}
/*
  THE PICTURE IS THE GROUND FLOOR, and everything else is a layer drawn over it.

  The stage is taken out of the column and pinned to the whole tab, so it is not
  a flex row's child any more and it reserves no height at all: the head, the
  reading card, the way out and the composer lay themselves out as if the picture
  were not there, and the picture fills whatever space they leave. That is the
  whole difference between a stage and a column \u2014 the picture is BEHIND the words
  rather than beside them, which is what lets the words have the tab's full
  width.

  A positioned box paints over in-flow content, so every layer has to say that it
  is above the picture rather than rely on document order. The list is written
  once, here, rather than a z-index being repeated into each rule below: a layer
  added to the column later is one line in this selector list, and forgetting it
  is a layer that disappears behind the map rather than a subtle stacking bug,
  which is the kind of failure a list like this exists to make obvious.

  The child combinator rather than a descendant one, because several of these
  names \u2014 error, composer, the two panel classes \u2014 are drawn by the rest of the
  sheet as well, and a bare descendant selector would hand a stacking context to
  every one of them.

  The head is NOT in this list, and its absence is deliberate rather than an
  oversight: it is the floating top chrome and it carries its own, higher
  z-index in its own rule. Everything named here sits above the picture and below
  the chrome, which is the one ordering the whole sheet depends on.

  The way out is not in the list either, and its absence is the other deliberate
  one rather than a second oversight: it is not a row of this column any more.
  It is drawn inside the bottom stack and pinned to the top of it, so it is
  already above the picture by being above the reading \u2014 see its own rule.
*/
.${i}-chat > .${i}-chat-stage,
.${i}-chat > .${i}-chat-activities,
.${i}-chat > .${i}-chat-vn,
.${i}-chat > .${i}-chat-confirm,
.${i}-chat > .${i}-error,
.${i}-chat > .${i}-room-error,
.${i}-chat > .${i}-composer,
.${i}-chat > .${i}-chat-ended { position: relative; z-index: 1; }
/*
  THE TOP CHROME, floating over the picture.

  It used to be a row in the column with a wash of its own behind it \u2014 a header,
  in other words \u2014 and it is now a bar laid over the stage, which is what the
  Engine's own roleplay surface does with the top of its chats: the picture runs
  to all four edges of the tab and everything the tab has to say is drawn on top
  of it.

  pointer-events: none on the bar and auto on its children, because a bar that
  spanned the tab and swallowed presses would be a bar that took the room away
  from the player: the badge is a thing to read, and the only thing in here to
  press is the options button at the far end.

  The wash the row used to wear is gone with the row, and it has not been
  replaced by nothing: each thing in here carries its own surface, which is the
  statement the Engine makes in the same place \u2014 its top chrome is a row of
  individually surfaced controls rather than a plate across the tab, so that the
  picture is visible between them.

  0.4.50 took the "right now" chip out of here and with it the last of the prose.
  What is left is one badge and one button, so the row no longer needs wrapping
  room and no longer competes with the reading for the top of the tab \u2014 see the
  note on the head itself. The badge is still first in the row and the button is
  still held at the far end by the auto margin on the actions beside it.
*/
.${i}-chat-head {
  position: absolute; top: .875rem; left: .875rem; right: .875rem; z-index: 3;
  display: flex; flex-wrap: wrap; align-items: flex-start; gap: .375rem;
  pointer-events: none;
}
.${i}-chat-head > * { pointer-events: auto; }
/*
  THE THREE DOTS, and everything the room can do behind them.

  There used to be a bare row of buttons here \u2014 End conversation and Forget, then
  the spin-off verb, then the debug pair \u2014 and it was read as a row of five equal
  things when only one of them was the player's ordinary way out. The Engine's
  own roleplay chats keep their commands behind a "..." in the corner, and this
  is the same control doing the same job: the room is not a toolbar, and the two
  presses a player makes in an hour should not be the two loudest things on the
  screen.

  NO BACKDROP and no focus trap, deliberately: the menu hangs off a button in the
  top chrome rather than covering the tab, and the paragraph the player was
  reading stays readable behind it. Closing it is one press anywhere else, or
  Escape \u2014 see the effect on the panel.
*/
.${i}-chat-actions { display: flex; flex-wrap: wrap; align-items: center; gap: .375rem; margin-left: auto; }
.${i}-chat-menu-anchor { position: relative; display: inline-flex; }
/*
  The button itself, cut to the Engine's own toolbar button.

  The Engine keeps one shape for everything in the chrome \u2014 a control square, a
  rounded corner, a translucency over the picture and a blurred backdrop behind
  the translucency \u2014 and this is that shape, in the Engine's own chrome tokens.
  Those are declared on the document root, so they arrive here already resolved
  for whatever theme the Engine is wearing; the fallbacks beside them are what
  keeps the button drawn if a name is ever missing.

  The narrow-container step to a slightly larger square is an override at the end
  of the sheet, where the container queries live, because it is a change of size
  rather than a second button.
*/
.${i}-chat-menu-button {
  display: inline-flex; align-items: center; justify-content: center;
  width: 2rem; height: 2rem; padding: .375rem; box-sizing: border-box;
  border: 1px solid var(--marinara-chat-chrome-button-border, var(--border));
  border-radius: .5rem;
  background: var(--marinara-chat-chrome-button-bg, var(--popover));
  color: var(--marinara-chat-chrome-button-text, var(--foreground));
  backdrop-filter: blur(12px);
  cursor: pointer;
  transition: border-color .15s ease, background-color .15s ease, color .15s ease;
}
.${i}-chat-menu-button:hover {
  border-color: var(--marinara-chat-chrome-button-border-hover, var(--primary));
  background: var(--marinara-chat-chrome-button-bg-hover, var(--popover));
  color: var(--marinara-chat-chrome-button-text-hover, var(--primary));
}
.${i}-chat-menu-button:focus-visible {
  outline: 2px solid var(--marinara-chat-chrome-focus-ring, var(--primary));
  outline-offset: 1px;
}
.${i}-chat-menu-button svg { width: 1rem; height: 1rem; }
/*
  The same button shape, for the one press that has a word on it.

  A card that has gone from the library draws Close instead of the options menu,
  and it is drawn in the chrome rather than in the row below because there is
  nowhere else for it to be. It wears the toolbar's own surface so that the one
  control in the top chrome is the same control whether it is a glyph or a word.
*/
.${i}-chat-tool {
  min-height: 2rem; box-sizing: border-box;
  border-color: var(--marinara-chat-chrome-button-border, var(--border));
  background: var(--marinara-chat-chrome-button-bg, var(--popover));
  color: var(--marinara-chat-chrome-button-text, var(--foreground));
  backdrop-filter: blur(12px);
}
.${i}-chat-tool:hover {
  border-color: var(--marinara-chat-chrome-button-border-hover, var(--primary));
  background: var(--marinara-chat-chrome-button-bg-hover, var(--popover));
  color: var(--marinara-chat-chrome-button-text-hover, var(--primary));
}
/*
  The popover, modelled on the tracker menu so there is one popover in this
  package rather than two that look almost the same.

  It is bounded in both directions and scrolls inside that bound. Its height is
  the reason: this list is the longest one in the tab now \u2014 four verbs, the way
  between the two ways of reading, and a debug group \u2014 and on a phone held
  sideways an unbounded one would be taller than the tab it hangs off. cqh rather
  than vh, because the container is the tab the Engine drew and not the window:
  in fullscreen those are two different boxes, and it is the tab this menu has to
  fit in.

  The surface is the Engine's own panel, in the Engine's own tokens, so that a
  popover and the button it hangs off are cut from one cloth. It used to be the
  theme's popover colour, which was the right surface for a menu inside a header
  row and is the wrong one for a menu hanging off a translucent control over a
  photograph: the panel tokens already carry the blur-friendly opacity and the
  accent-tinted edge that keep the two reading as a pair.
*/
.${i}-chat-menu {
  position: absolute; top: calc(100% + .5rem); right: 0; z-index: 40;
  width: 19rem; max-width: min(19rem, 82cqw);
  max-height: min(26rem, 70cqh); overflow-y: auto;
  display: flex; flex-direction: column; gap: .375rem;
  border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  border-radius: .625rem;
  background: var(--marinara-chat-chrome-panel-bg, var(--popover, var(--background)));
  color: var(--marinara-chat-chrome-panel-text, var(--foreground));
  backdrop-filter: blur(12px);
  box-shadow: 0 .875rem 2rem rgba(0, 0, 0, .35); padding: .625rem;
}
.${i}-chat-menu-note {
  margin: 0; font-size: .6875rem; line-height: 1.5;
  color: var(--marinara-chat-chrome-panel-muted, var(--muted-foreground));
}
/*
  Ending is the ordinary way out and forgetting is the rare, total one, so the
  pair is drawn as a plain button and a red one rather than as two buttons of
  equal weight. Forget is RED because it is a debug action: nothing a player of
  this game is meant to be able to do leaves the village with no memory of a
  conversation that happened, and the colour is the part of that statement a
  player reads before they read the words.

  Both are drawn full width in the menu, because a menu is a list of things to
  press and a ragged cluster of differently sized ones is a list nobody scans.
*/
.${i}-chat-menu .${i}-button { width: 100%; justify-content: flex-start; text-align: left; }
/*
  DEBUG. The two fixture controls, at the foot of the menu behind a rule.

  A different promise from the pair above them, which belongs to the conversation
  and comes and goes with it: these two are a fixture of the tab while it is being
  worked on, so they are drawn whatever the phase, whatever the card, and whether
  or not anybody has said a word. Nothing about them is conditional, and that is
  the point \u2014 a control that is only sometimes there is a control that has to be
  looked for.

  The rule above them is the whole of what marks them apart. They used to be
  pushed to the far end of a header row, which is where a second claim on the
  space is made; in a menu the same statement is made by a divider, because the
  menu is already the corner and there is no further end to push anything to.
*/
.${i}-chat-debug {
  display: flex; flex-direction: column; gap: .375rem;
  margin-top: .125rem; padding-top: .5625rem; border-top: 1px solid var(--border);
}
/*
  The last press, floating over the room just above the box.

  A room the village has already remembered wears End conversation here, and it
  is the only control of its kind on the screen: the first press \u2014 Leave this
  conversation, which 0.4.49 moved into the menu under the box \u2014 is what spends
  the goodbye and files the memory away, and this is what closes the drawer
  afterwards. A player who sees it has finished rather than being asked to
  confirm something they did a second ago.

  The rooms with no ending to give draw Close in the same slot: the one whose
  villager could not be reached at all. Neither name is a lie about what pressing
  it does \u2014 it closes the drawer and releases the map.

  It is drawn as CHROME rather than as a message, and that is one of the two
  things 0.4.49 changed about it. It used to be a plate centred between the
  reading and the box with a message's own padding on it, and the padding was the
  mistake: a button with a message's insides reads as part of what somebody said,
  and a way out is not something anybody said. So it wears the Engine's own
  toolbar surface \u2014 the translucent chip, the blurred backdrop, the pill radius,
  the shadow \u2014 and nothing is drawn behind it.

  AND IT FLOATS, which is the other thing. It is a child of the bottom stack and
  it hangs off the TOP of it, so it is over the room rather than in a row of the
  column: the reading and the box keep the position they have in every other
  room, and all this state adds is a chip over the room above them. A row of its
  own \u2014 which is what it was \u2014 pushed the card up the room for as long as it was
  drawn, and a room that moves because a button appeared is the one thing this
  drawer's reading is not allowed to do.

  It hangs off the bottom stack rather than sitting in a corner, and that is the
  Visual Novel's own arrangement rather than a preference: the reading is the
  card and the history is a pane the player opens, so there is no log to write a
  button into, and one written into the transcript would come and go with the
  history instead of sitting where the reading ends.

  WHO sees it was narrowed in the same release \u2014 see showFoot. It used to be
  drawn for anything that was not mid-answer, which included a room whose card is
  gone, where the head already carries the same press, and a room whose villager
  is still finding their first line.
*/
.${i}-chat-end {
  position: absolute; left: 50%; bottom: calc(100% + .375rem);
  transform: translateX(-50%);
  display: flex; justify-content: center;
}
.${i}-chat-end > .${i}-button {
  border-color: var(--marinara-chat-chrome-button-border, var(--border));
  border-radius: 999px; padding: .3125rem .875rem;
  background: var(--marinara-chat-chrome-button-bg, var(--popover));
  color: var(--marinara-chat-chrome-button-text, var(--foreground));
  backdrop-filter: blur(12px);
  box-shadow: 0 .5rem 1.5rem rgba(0, 0, 0, .4);
}
.${i}-chat-end > .${i}-button:hover {
  border-color: var(--marinara-chat-chrome-button-border-hover, var(--primary));
  background: var(--marinara-chat-chrome-button-bg-hover, var(--popover));
  color: var(--marinara-chat-chrome-button-text-hover, var(--primary));
}
.${i}-button-quiet { border-color: transparent; background: transparent; color: var(--muted-foreground); }
.${i}-button-quiet:hover { border-color: var(--destructive, #e5484d); color: var(--destructive, #e5484d); }
/*
  The debug action's question, drawn under the button that raised it rather than
  over the whole tab. It belongs beside the control it is about \u2014 a modal would
  put the map, the drawer and the player's own words behind a sheet of grey to
  ask one question about one button \u2014 and it is drawn in the destructive colour
  so that the question and the thing it is asking about read as one action.
*/
.${i}-chat-confirm {
  display: flex; flex-direction: column; gap: .375rem;
  border: 1px solid color-mix(in srgb, var(--destructive, #e5484d) 45%, transparent);
  border-radius: .5rem; padding: .5rem .625rem;
  background: color-mix(in srgb, var(--destructive, #e5484d) 10%, transparent);
}
.${i}-chat-confirm-note { margin: 0; font-size: .6875rem; line-height: 1.5; color: var(--foreground); }
.${i}-chat-confirm-row { display: flex; flex-wrap: wrap; gap: .375rem; }
.${i}-image-recommendation { color: #d68a18; }
/*
  Where the composer was, once the conversation has been ended.

  Everything that could still say something to a villager who has been left is
  taken off the screen rather than disabled: a row of greyed-out verbs would be
  an invitation to keep talking to somebody who has already been said goodbye
  to, and the one thing left to do with a conversation that has been remembered
  is close it. The box is hidden rather than unmounted so the half-written
  sentence in it survives, which is the same promise the Fulfill verb makes.

  dashed rather than solid, because this is not a control: it is the drawer
  saying it is finished with the player.
*/
.${i}-chat[data-ended="true"] .${i}-composer { display: none; }
/*
  And the same hiding, for the two states of a greeting that has not landed.

  A villager greets first, so while they are still finding their line there is
  nothing to answer: the box would take a sentence the player cannot send, and
  every verb above it would be a greyed-out version of itself. Hiding rather than
  unmounting keeps the half-written line in the box across a retry that succeeds,
  which is the same promise the ended state above makes, and it keeps the change
  to one property.

  failed hides it for a different reason: there is no conversation. Nothing was
  written down, the order of the room was never established, so the only control
  on offer is the one that gets the player out.

  Both rules sit BELOW the ended rule rather than beside it because the ended
  state is the one that matters when they could overlap, and they are separate
  selectors rather than one list so that each keeps its own reason.
*/
.${i}-chat[data-greeting="writing"] .${i}-composer { display: none; }
.${i}-chat[data-greeting="failed"] .${i}-composer { display: none; }
.${i}-chat-ended {
  margin: 0; padding: .5rem .625rem; border: 1px dashed var(--border); border-radius: .5rem;
  font-size: .6875rem; line-height: 1.5; color: var(--muted-foreground); text-align: center;
}
/*
  THE ROOM, and the floor the villager stands on.

  The scene used to be a bounded column BESIDE the words, and it is the whole
  backdrop now: the picture of the place the villager is standing in runs to the
  tab's own edges and everything else in the aside is read over the top of it.
  That is the Engine's own Visual Novel shape, and it is the reason the card can
  be a card at all \u2014 a paragraph set at a comfortable measure needs the tab's
  full width, and two fifths of a phone is a column of single words.

  It keeps the muted plate the places list uses for a picture it does not have, so
  a place with no picture reads as a place with no picture rather than as a
  picture that failed: the same statement, made the same way, in both lists.
*/
.${i}-chat-scene {
  position: absolute; inset: 0; z-index: 0;
  min-height: 0;
  background: var(--muted, rgba(127, 127, 127, .08));
  overflow: hidden;
}
.${i}-chat-scene-backdrop {
  position: absolute; inset: 0; display: block;
  width: 100%; height: 100%; object-fit: cover;
}
.${i}-chat-scene-placeholder {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  color: var(--muted-foreground); font-size: .85rem; text-align: center; padding: 1rem;
}
/*
  THE TWO LAYERS BETWEEN THE PICTURE AND THE WORDS.

  The Engine draws both of these over its own roleplay backdrop and this tab had
  neither, which is the whole of why its room read as a photograph with a card
  lying on it rather than as a stage:

  The scrim is a vertical wash of the theme's own background \u2014 dark in a dark
  theme, light in a light one \u2014 so it darkens the picture where the chrome sits
  and leaves it most visible in the middle. It is mixed rather than painted a
  fixed near-black, because a fixed near-black over a pale theme's map is a black
  band across a drawing rather than a photograph going into shadow, and the
  Engine's own light theme makes exactly the same substitution.

  The vignette is the other half of the same statement, around the edges instead
  of above and below: the eye is drawn to the middle of the room, and the corners
  of a photograph stop competing with the words laid over them. It is the
  Engine's own radius and the Engine's own opacity.

  Both are inside the scene rather than beside it because the scene is the layer
  that knows where the picture is, and neither is drawn for a place that has no
  picture \u2014 there is nothing to darken and nothing to frame.
*/
.${i}-chat-scrim {
  position: absolute; inset: 0; display: block;
  background: linear-gradient(
    180deg,
    color-mix(in srgb, var(--background) 55%, transparent) 0%,
    color-mix(in srgb, var(--background) 40%, transparent) 42%,
    color-mix(in srgb, var(--background) 45%, transparent) 72%,
    color-mix(in srgb, var(--background) 60%, transparent) 100%
  );
}
.${i}-chat-vignette {
  position: absolute; inset: 0; display: block;
  background: radial-gradient(ellipse at center, transparent 50%, color-mix(in srgb, #000 30%, transparent) 100%);
}
/*
  THE FLOOR, and it is a row of the tab rather than a layer on the stage.

  The villager used to stand at the head of the reading column, and the note that
  used to be here explained at length that this was the one place the tab departed
  from the Engine and that it departed for the length of a face. It was a real
  problem \u2014 the Engine's sprite is a whole body, so a card across its shins still
  leaves a head thirty centimetres above the card, and ours is a square crop
  whose chin is not far below its eyes \u2014 but standing the figure in the reading
  column answered it by putting the villager inside the words, which is the one
  thing a Visual Novel stage is for.

  So the figure is on the floor, the way the Engine's is, and the problem is
  answered by the floor being the right size rather than by moving the person. The
  floor is this row, and the figure stands on the bottom of it and grows upward. It
  cannot be walked over by the card, because the card is not in this row \u2014 and on a
  tab with almost no height left it shrinks like a sprite rather than being clipped
  like one.

  The floor CLAIMS a share of the tab and yields proportionally when the tab cannot
  pay it. A flex-basis of 34cqh is the same share the figure is allowed to ask for;
  a shrink factor of 1 is what lets a tab with a long paragraph in it take the
  shortfall off the floor and off the card together rather than off one of them
  alone. A floor that took only what was LEFT OVER \u2014 flex-basis auto, which is what
  this rule used to say \u2014 is paid last and can be paid nothing, and that is how a
  figure ends up standing above the top edge of the tab with its head cut off.

  container-type: size is what lets the figure ask the FLOOR how tall it is instead
  of asking the tab and hoping the arithmetic comes out. Every cq unit inside this
  row is the row's own square from here on, which is why the figure's height share
  is 100cqh below rather than a number tuned against the chrome around it. The
  price is stated plainly: the floor's size no longer answers to its contents, so
  neither the figure nor the plate can push the row outward. That is the point \u2014 it
  is why the figure is allowed to shrink at all \u2014 and it is also why the row needs
  a basis of its own rather than a basis of its content.

  It comes BEFORE the bottom stack in the document, and it is the bottom stack
  that is drawn last, so the order the layers paint in is the order the room reads
  in whether or not every rule's z-index survives a future edit.

  0.4.49 makes the floor GROW as well as shrink, and that is the difference
  between a stage and a block at the top of the tab. The card and the composer
  both have ceilings of their own, so on a tab taller than 34cqh the share the
  floor claimed was all it ever took and the rest of the tab sat empty under the
  card: measured at 1200x800 the row was 272 pixels and the 240 under the composer
  were nobody's. A grow factor of 1 hands that slack back to the row, which is what
  puts the room over the whole tab with the card and the box laid out at the foot
  of it.

  It is also the foundation the spritesheet is going to be drawn on. A villager is
  a framed square crop today, and a full-body sprite is the art that is coming; the
  row it will stand in is now the row the tab actually has rather than a fixed
  share of it, so the ground a sprite will need already belongs to the figure's row
  and nothing about the card, the composer or the chrome has to move again to make
  room for it.
*/
.${i}-chat-stage {
  flex: 1 1 34cqh; min-height: 0;
  container-type: size;
  display: flex; flex-direction: column; justify-content: flex-end; align-items: center;
  gap: .375rem;
  padding-bottom: .25rem;
}
.${i}-chat-activities {
  max-width: min(90%, 42rem); max-height: 5rem; overflow-y: auto;
  flex: 0 0 auto; align-self: center;
  display: flex; flex-wrap: wrap; justify-content: center; gap: .25rem;
  color: var(--foreground); font-size: .6875rem; line-height: 1.4;
}
.${i}-chat-activity {
  padding: .15rem .4rem; border-radius: .4rem;
  background: color-mix(in srgb, var(--background) 80%, transparent);
}
/*
  THE BOTTOM STACK: the tab, the card, and the whole of the reading.

  One block, directly above the composer, with its contents justified to the end
  so that the card always sits on the box the player types in. That is the
  Engine's own arrangement \u2014 its visual-novel card is pinned to the bottom of the
  input chrome and the room is what is left above it \u2014 and it is what makes the
  card's position stable: a card that floated up and down the tab with the length
  of the paragraph would be a different screen every turn.

  It is the flexible row, and the stage above it is the other one, so the two
  share what the tab has left between them. The card cannot grow into the stage
  because a card has its own ceiling \u2014 see the reading box \u2014 and neither can an
  open history, which is capped where it is declared.
*/
.${i}-chat-vn {
  flex: 0 1 auto; min-height: 0;
  display: flex; flex-direction: column; justify-content: flex-end; gap: .375rem;
}
/*  Square, and that is a requirement rather than a preference: the card's own
    framing of its picture is a square region of it, and the arithmetic that
    draws a framing \u2014 see avatarCropStyle \u2014 only lands undistorted on a frame
    of the same shape. A tall frame would show the same crop with the face
    stretched through it.

    Centred rather than stretched across the tab: it is a person standing in a
    room, and a person is not the width of a room.

    ONE width, and the square follows from it, which is what keeps the two
    dimensions from ever disagreeing. It is the smaller of a share of the tab's
    width and the room the floor actually has, because a figure that only answered
    width would eat a landscape tab's height \u2014 and the second term is measured
    against the FLOOR rather than against the tab, because the floor is a size
    container of its own. That is the whole answer to a short tab, and it is why
    the short-tab queries at the end of the sheet no longer carry a figure size of
    their own: the figure is exactly as big as the row it stands in, so it cannot
    stand above the top edge of the tab however little room the card and the
    composer have left it. The 2.5rem is the gap, the plate and the floor's own
    padding, spent so that the plate is not pushed off the bottom of the tab by a
    figure that filled the row.

    flex: 0 0 auto, because the stage is justified to its end and the plate below
    is the row that may give way. A shrinkable figure means a long place name
    squashes the face to buy the plate a line it did not need.

    0.4.49 raises the width share from 30cqw to 38cqw, and only because the floor
    now grows: the figure is capped by the row it stands in either way, and a row
    that owns the whole tab can afford a bigger person in it. What it is NOT is a
    spritesheet \u2014 a villager is still a square crop in a soft frame, at a size
    that leaves the room around them, and the extra room the floor now owns is
    what the full-body art is going to be drawn into. The radius, the border and
    the drop shadow below are the shape that art has to arrive in.
*/
.${i}-chat-figure {
  position: relative; z-index: 1;
  flex: 0 0 auto;
  display: flex; align-items: center; justify-content: center;
  width: min(38cqw, calc(100cqh - 2.5rem)); aspect-ratio: 1 / 1;
  border-radius: .625rem; border: 1px solid var(--border);
  background: var(--popover);
  box-shadow: 0 .5rem 1.5rem rgba(0, 0, 0, .35);
  filter: drop-shadow(0 4px 12px rgba(0, 0, 0, .5));
  font-size: 1.5rem; font-weight: 600;
  overflow: hidden;
}
.${i}-chat-figure > img { display: block; width: 100%; height: 100%; object-fit: cover; }
.${i}-chat-figure[data-sprite="true"] { width: min(35cqw, 23rem); height: min(65cqh, 35rem); aspect-ratio: auto; border: 0; background: transparent; box-shadow: none; overflow: visible; }
.${i}-chat-figure[data-sprite="true"] > img { width: 100%; height: 100%; object-fit: contain; object-position: center bottom; }
.${i}-chat-figure[data-sprite="true"][data-framing="half"] { overflow: hidden; height: min(54cqh, 25rem); }
.${i}-chat-figure[data-sprite="true"][data-framing="half"] > img { object-fit: cover; object-position: center top; }
.${i}-sprite-editor { min-width: 0; border-top: 1px solid var(--border); padding: 1rem .125rem .25rem; margin-top: .625rem; display: grid; gap: .875rem; }
.${i}-sprite-heading, .${i}-sprite-section-head { display: flex; align-items: flex-start; justify-content: space-between; flex-wrap: wrap; gap: .5rem 1rem; }
.${i}-sprite-heading h3 { margin: 0; font-size: 1.1rem; }
.${i}-sprite-heading p { margin: .25rem 0 0; color: var(--muted-foreground); font-size: .8125rem; }
.${i}-sprite-count { border: 1px solid var(--border); border-radius: 99rem; padding: .25rem .625rem; white-space: nowrap; font-size: .75rem; }
.${i}-sprite-views { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5rem; }
.${i}-sprite-view { display: grid; gap: .2rem; min-width: 0; text-align: left; border: 1px solid var(--border); border-radius: .7rem; padding: .7rem .8rem; background: var(--popover); color: var(--foreground); cursor: pointer; font: inherit; }
.${i}-sprite-view span { color: var(--muted-foreground); font-size: .75rem; }
.${i}-sprite-view[data-active="true"], .${i}-sprite-choice[data-active="true"] { border-color: var(--primary); background: color-mix(in srgb, var(--primary) 12%, var(--popover)); box-shadow: inset 0 0 0 1px var(--primary); }
.${i}-sprite-section-head { color: var(--foreground); font-size: .8125rem; }
.${i}-sprite-section-head span { color: var(--muted-foreground); }
.${i}-sprite-choices { display: grid; grid-template-columns: repeat(auto-fill, minmax(6.25rem, 1fr)); gap: .5rem; }
.${i}-sprite-choice { display: grid; justify-items: center; gap: .15rem; min-width: 0; border: 1px solid var(--border); border-radius: .65rem; padding: .4rem; background: var(--popover); color: var(--foreground); cursor: pointer; font: inherit; text-transform: capitalize; }
.${i}-sprite-choice-art { display: grid; place-items: center; width: 100%; height: 6rem; border-radius: .4rem; background: color-mix(in srgb, var(--muted) 75%, transparent); color: var(--muted-foreground); font-size: 1.3rem; overflow: hidden; }
.${i}-sprite-choice-art img { display: block; width: 100%; height: 100%; object-fit: contain; }
.${i}-sprite-choice small { color: var(--muted-foreground); font-size: .6875rem; text-transform: none; }
.${i}-sprite-selected { display: flex; align-items: baseline; flex-wrap: wrap; gap: .25rem .75rem; font-size: .8125rem; text-transform: capitalize; }
.${i}-sprite-selected span { color: var(--muted-foreground); text-transform: none; }
.${i}-sprite-editor label { display: grid; gap: .25rem; font-size: .8125rem; }
.${i}-sprite-editor label.${i}-row { display: flex; align-items: center; }
.${i}-sprite-editor textarea { min-height: 5rem; }
.${i}-sprite-actions { display: flex; flex-wrap: wrap; gap: .5rem; align-items: center; }
.${i}-sprite-candidate { display: grid; gap: .75rem; border: 1px solid var(--border); border-radius: .7rem; padding: .75rem; background: var(--popover); }
.${i}-sprite-candidate-views { display: flex; flex-wrap: wrap; gap: .75rem; }
.${i}-sprite-candidate-views > div { display: grid; gap: .25rem; justify-items: center; flex: 0 1 12rem; min-width: 0; font-size: .75rem; color: var(--muted-foreground); }
.${i}-sprite-candidate-views img { display: block; width: 100%; height: 14rem; object-fit: contain; background: repeating-conic-gradient(#7773 0 25%, transparent 0 50%) 0 0/20px 20px; }
.${i}-sprite-mirrored { transform: scaleX(-1); }
.${i}-sprite-more { border-top: 1px solid var(--border); padding-top: .5rem; }
.${i}-sprite-more summary { cursor: pointer; font-size: .8125rem; }
.${i}-sprite-more > .${i}-row { margin-top: .75rem; }
.${i}-sprite-view:focus-visible, .${i}-sprite-choice:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
/*
  THE ROOM'S OWN CAST, standing in the floor the villager stands in.

  A private conversation has one figure on the floor and the card repeats them a
  paragraph at a time. A room has everybody who was in it, and this is the same
  drawing made plural: the faces stand at the foot of the room as themselves
  rather than as the card's illustration of whoever happens to be talking.

  The ENGINE's own avatar frame is reused rather than a second frame at a second
  size, because the two things that frame has to do \u2014 clip a crop, and hold a
  person's initial \u2014 are done by that rule and would have to be copied to be done
  again. The row wraps, because a mill with six people in it is a mill with six
  people in it, and a row that overflowed the tab would push the plate off the
  bottom of it.
*/
.${i}-chat-cast {
  position: relative; z-index: 1;
  display: flex; align-items: flex-end; justify-content: center;
  flex-wrap: nowrap; gap: .375rem;
  width: 100%; height: min(100%, 28rem); min-height: 0;
}
.${i}-chat-cast-person {
  display: flex; flex: 0 1 27%; flex-direction: column; align-items: center; justify-content: flex-end;
  min-width: 0; height: 85%; color: var(--foreground); font-size: .6875rem;
  text-shadow: 0 1px 4px #000, 0 2px 8px #000;
}
.${i}-chat-cast-person[data-active="true"] { flex-basis: 40%; height: 100%; }
.${i}-chat-cast-person > img { display: block; width: 100%; height: calc(100% - 1.5rem); object-fit: contain; object-position: center bottom; filter: drop-shadow(0 .5rem .75rem #0009); }
.${i}-chat-cast-person > img[data-framing="half"] { object-fit: cover; object-position: center top; }
.${i}-chat-cast-person > img[data-facing="left"] { transform: scaleX(-1); }
.${i}-chat-cast-person > .${i}-avatar { width: min(7rem, 100%); height: auto; aspect-ratio: 1; }
.${i}-chat-cast-person > span:not(.${i}-avatar) { display: block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; padding: .15rem .35rem; border-radius: .35rem; background: #0009; }
.${i}-chat-cast-rest { display: flex; flex-wrap: wrap; justify-content: center; gap: .25rem; max-height: 2rem; overflow-y: auto; }
.${i}-chat-cast-rest > span { display: inline-flex; align-items: center; gap: .2rem; padding: .1rem .35rem; border-radius: .35rem; background: #000a; color: white; font-size: .625rem; }
.${i}-chat-cast-rest .${i}-avatar { width: 1rem; height: 1rem; border-radius: 50%; overflow: hidden; }
.${i}-room-screen .${i}-chat-activities { display: none; }
.${i}-room-screen .${i}-chat-history-toggle { width: auto; height: auto; min-height: 2rem; align-self: center; padding: .2rem .65rem; border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border)); border-radius: .5rem; }
.${i}-room-screen .${i}-chat-vn-text { font-size: .9375rem; line-height: 1.55; }
.${i}-room-screen .${i}-chat-vn-aside-text { font-size: .8125rem; line-height: 1.45; }
/* The plate is what makes the name readable over a picture, so it is drawn
   whether or not there is one behind it: place names are short, and a name that
   changed its contrast depending on the hour would be worse than a plain chip. */
.${i}-chat-scene-place {
  position: relative; z-index: 1; max-width: 100%;
  border-radius: 999px; padding: .1875rem .5rem;
  background: color-mix(in srgb, var(--popover) 88%, transparent);
  font-size: .6875rem; color: var(--foreground); text-align: center;
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
/*
  THE HISTORY, and the little tab that opens it.

  The log is the old transcript in a pane rather than in the tab's own flow: the
  villager's answers and the player's own lines, in order, in the bubbles they
  have always been drawn in, and the only change is that it is something the
  player OPENS rather than the only thing on screen. That is what the Engine's
  Visual Novel does, and it is why the card can show one paragraph at a time
  without the player losing the thread: the whole of the conversation is one press
  away, and it scrolls inside its own frame instead of growing the tab.

  It is capped in height rather than left to fill, and the cap is cqh for the
  same reason every other measurement in this sheet is: the container is the tab
  the Engine drew. What the cap buys is the stage \u2014 a history that grew to the
  ceiling of the tab would be a history with no room behind it, and the room is
  what the player is reading the conversation IN.

  READ ONLY, deliberately: nothing here can be edited, and the history is the
  village's own record of what was said rather than a draft.
*/
.${i}-chat-log {
  display: flex; flex-direction: column; gap: .5rem;
  flex: 0 1 auto; min-height: 6rem; max-height: min(52cqh, 28rem); overflow-y: auto;
  border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  border-radius: .625rem; padding: .5rem;
  background: var(--marinara-chat-chrome-panel-bg, color-mix(in srgb, var(--popover) 92%, transparent));
  backdrop-filter: blur(12px);
  box-shadow: 0 .5rem 1.5rem rgba(0, 0, 0, .28);
}
/*
  THE LITTLE TAB, and it is the Engine's own.

  It used to be a labelled pill \u2014 a chevron and the words "Chat history" \u2014 and
  the words are the whole of what changed. The Engine's Visual Novel hangs a bare
  chevron the width of a thumb off the top of its card, and it can, because the
  card is directly under it and the thing being opened is obviously the history of
  the thing being read: the label was doing work the position had already done.

  The words are not gone, they are out of the way: the accessible name and the
  title still say "Show chat history" and "Return to Visual Novel" in both
  directions, so anything reading the tab aloud, and anything hovering it, is told
  exactly what the pill used to say.

  The shape is the Engine's shape, and the shape is the state: a tab rounded at
  the top and open at the bottom when the card is up, rounded at the bottom and
  open at the top when the history is, so the control and the thing it opened
  read as one object. The pseudo-element is the Engine's own trick \u2014 a hit area
  taller and wider than the drawing, so a 24-pixel tab is not a 24-pixel target
  on a phone.
*/
.${i}-chat-tab { display: flex; justify-content: center; }
.${i}-chat-history-toggle {
  position: relative;
  display: inline-flex; align-items: center; justify-content: center;
  width: 2.5rem; height: 1.5rem; padding: 0; box-sizing: border-box;
  border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  border-bottom: 0; border-radius: .5rem .5rem 0 0;
  background: var(--marinara-chat-chrome-panel-bg, var(--popover));
  color: var(--marinara-chat-chrome-button-text, var(--foreground));
  backdrop-filter: blur(12px);
  cursor: pointer; font-family: inherit;
}
.${i}-chat-history-toggle::before { content: ""; position: absolute; inset: -.625rem -.25rem; }
.${i}-chat-history-toggle:hover { color: var(--marinara-chat-chrome-highlight-text, var(--primary)); }
.${i}-chat-history-toggle svg { width: .875rem; height: .875rem; }
.${i}-chat-history-toggle[aria-expanded="true"] {
  margin-top: -1px;
  border-top: 0; border-bottom: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  border-radius: 0 0 .5rem .5rem;
}
/*
  THE READING CARD, and it is the Engine's visual-novel bubble.

  A surface of its own holding the speaker's face, the speaker's name and one
  paragraph of what they said, with the arrows under it to walk the rest. It is
  drawn at the FOOT of the stack, directly above the composer, because that is
  where the eye already is at the end of a turn \u2014 the player looks down at the box
  they type in, and the answer arrives just above it.

  The face and the name are the two things this card did not have and the Engine's
  has. A card that shows a paragraph of somebody's speech without saying who is
  speaking is a card that only works while there is a heading above it saying the
  same thing \u2014 and the heading is gone, because the Engine has no heading: it has
  a card with a face in it, which is the same statement made where the player is
  already looking.

  It is the ENGINE'S OWN double structure that puts the face in two places at
  once, and it is worth being plain about it: the Engine stands a sprite on the
  stage floor AND draws a square portrait in the card, because those are two
  different pictures \u2014 a body and a head. A village has one picture per villager,
  so both frames show it, and the one on the floor is the one the card is read
  across. The card's is the one that is always fully visible.

  THE PADDING IS ON THE ROW, not on the card, and that is the Engine's own
  structure rather than a preference: the Engine's plate holds a padded dialogue
  block and then a rule with the arrows in it, so the rule reaches both edges of
  the surface while the face and the words are held in from them. Padding on the
  card would inset the rule as well and draw a short line across the middle of the
  plate, which is a divider between nothing and nothing.
*/
.${i}-chat-vn-card {
  display: flex; flex-direction: column;
  flex: 0 1 auto; min-height: 0; overflow: hidden;
  border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  border-radius: .75rem;
  background: var(--marinara-chat-chrome-panel-bg, color-mix(in srgb, var(--popover) 94%, transparent));
  backdrop-filter: blur(12px);
  box-shadow: 0 .75rem 2rem rgba(0, 0, 0, .4);
}
/*
  The row and the column are the two boxes the reading shrinks inside of.

  flex-start on the row would size the column to its own content, and a box whose
  size IS its content is a box whose child cannot be made smaller than it \u2014 so the
  column stretches to the row instead and the reading is what gives way. That is
  the order the card yields in, and it is worth stating: the paragraph first, the
  arrows never. A paragraph is the one part of a card that can be scrolled, and a
  clipped arrow is a control the player cannot press at all.
*/
.${i}-chat-vn-row {
  display: flex; gap: .75rem; min-width: 0; min-height: 0; align-items: flex-start;
  padding: .75rem;
}
.${i}-chat-vn-portrait {
  position: relative; flex: 0 0 auto; align-self: flex-start;
  display: flex; align-items: center; justify-content: center;
  width: min(5rem, 26cqw); aspect-ratio: 1 / 1;
  border-radius: .75rem; border: 1px solid var(--border);
  background: var(--secondary);
  font-size: 1.25rem; font-weight: 600;
  overflow: hidden;
}
.${i}-chat-vn-portrait > img { display: block; width: 100%; height: 100%; object-fit: cover; }
.${i}-chat-vn-column { display: flex; flex-direction: column; gap: .5rem; min-width: 0; min-height: 0; align-self: stretch; flex: 1 1 auto; }
.${i}-chat-vn-name {
  margin: 0; min-width: 0;
  font-size: .875rem; font-weight: 600; line-height: 1.3;
  color: var(--marinara-chat-chrome-highlight-text, var(--foreground));
  overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
}
/*
  The paragraph, in a box with a ceiling on it.

  This is the one place the card CANNOT be allowed to grow, and the number is the
  Engine's own: min(30dvh, 18rem) there, min(30cqh, 18rem) here, for the reason
  every other measurement in this sheet is in cqh \u2014 the container is the tab, and
  in fullscreen the tab and the window are two different boxes. Thirty percent of
  the tab is where a long answer stops pushing the card up the screen and starts
  scrolling inside it, which is what keeps the figure on the floor visible and
  the composer where the player left it.

  That ceiling keeps the card from GROWING, and flex: 0 1 auto is what lets it
  SHRINK: a short tab takes its height off the paragraph rather than off the arrows
  under it, and the reading is the one box in the card that can give that height up
  without reading as broken.
*/
.${i}-chat-vn-reading {
  flex: 0 1 auto; min-height: 0; max-height: min(30cqh, 18rem);
  overflow-y: auto; overscroll-behavior: contain;
  display: flex; flex-direction: column; gap: .375rem;
  padding-right: .25rem;
}
.${i}-chat-vn-reading:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; border-radius: .25rem; }
.${i}-chat-vn-text {
  margin: 0; font-size: .8125rem; line-height: 1.6;
  white-space: pre-wrap; overflow-wrap: break-word;
}
.${i}-chat-vn-text[data-empty="true"] { color: var(--muted-foreground); }
/*  The sentence a failed greeting is said in. The destructive colour is the one
    the rest of the sheet already uses for something that went wrong rather than
    something the player did, and the words themselves are deliberately plain:
    this is a villager who could not be reached, not a mistake anybody made. */
.${i}-chat-vn-text[data-error="true"] { color: var(--destructive, #e5484d); }
/*
  THE TWO REGISTERS OF A BEAT, and they are the Engine's own.

  A villager's turn is two things at once: what they SAY, and the room going on
  around them. Game Mode draws those as two registers in one window, and what
  separates them is ATTRIBUTION rather than decoration:

    - somebody speaking is drawn under their own face and their own name
    - the room describing itself is drawn under the word NARRATION and a bubble
      with no face over it at all. The Engine's own comment on that branch is
      "no avatar", and the pill below is its pill, copied to the values:
      rounded-full, the muted wash, .625rem, uppercase, wide tracking.

  0.4.56 got the second one wrong, and the mistake is worth naming rather than
  only fixing. The description was drawn in a bubble INSIDE the speaking
  register \u2014 under the villager's name and under the villager's face \u2014 which
  reads as that villager having said it, quietly. The words were in the right
  place on the card and attributed to the wrong speaker.

  So the label below is the fix, and it is a register of its own rather than an
  extra: the head of the card carries the speaker's name OR the word NARRATION
  and never both, because a beat belongs to whoever spoke it or to the room, and
  to nothing in between. The bubble underneath is the room's, drawn with nobody
  standing behind it \u2014 see the chat-vn-beat rule below, which is the bubble and
  no longer the whole register.

  This is the SHAPE of a beat, and deliberately not its line TYPE. The Engine's
  stage draws three more registers beside speech \u2014 something said across a room,
  something said to one listener, and somebody's private thought \u2014 and a village
  with one villager in the room can produce none of them. data-register is
  therefore this tab saying which of the two drawings it used, and the line
  types arrive with the room that can produce one: "side" for something said
  aloud to everybody present, "whisper" for something said to one listener, and
  "thought" if a room ever wants it.

  THE LINE TYPES HAVE ARRIVED \u2014 the first two of them, and as a stored field
  rather than as a second read of the words. The package's own turn reader takes
  a side tag or a whisper tag with a listener's name off the front of a line,
  stores the register beside the prose, and writes the content with the tag taken
  off, so a message can now arrive knowing two things a paragraph shape cannot
  describe: a remark said aloud but not offered to whoever is in front of them,
  and something said to one listener alone. Both of those are ordinary sentences
  and there is no punctuation that makes them otherwise \u2014 which is exactly why
  the villager marks them and why the client must not guess.

  So data-register now carries four names rather than two, and it lives on the
  CARD rather than on the bubble. That is the whole reason for the move: the
  head of the card is the speaker's name for a spoken beat and the word NARRATION
  for a described one, the bubble is the plate for anything the villager said and
  the room's own bubble only for the room, an aside leaves the plate for a small
  floating bubble of its own \u2014 see the aside rules further down, which are the
  Engine's second surface for exactly those lines \u2014 and a card that announces
  which drawing it is in lets all three dress from one fact instead of three
  rules guessing at the same thing.

  "thought" is still not here, and the reason is not that it is hard. An inner
  monologue the player is SHOWN is a different decision from something said out
  of the side of somebody's mouth, and it is a decision about whether the player
  may see it at all. The name is free when somebody makes that decision.

  INTENDED, NOT BUILT: a sprite system, and an expression per beat.

  The Engine's stage puts a character on the floor of the visual novel and lets
  a line carry the expression that goes with it \u2014 the nine effects its
  ExpressionReaction table knows, keyed to a mood and pinned to the face in the
  portrait. Villages has no sprite layer at all yet, so there is nothing here to
  attach an expression to. When there is, this is where it goes: one expression
  per beat, read beside the register below and drawn on the portrait above, not
  as a second drawing of the same words somewhere else.
*/
.${i}-chat-vn-label {
  margin: 0; align-self: flex-start;
  padding: .125rem .5rem; border-radius: 999px;
  background: color-mix(in srgb, var(--foreground) 12%, transparent);
  font-size: .625rem; font-weight: 600; line-height: 1.5;
  letter-spacing: .04em; text-transform: uppercase;
  color: var(--muted-foreground);
}
/*
  THE ASIDES, AND THEY ARE DRAWN IN THE BAND ABOVE THE PLATE.

  This is the box the bubbles stand in rather than a bubble itself, and it exists
  because of WHERE the Engine draws these lines rather than because of what they
  look like. A side remark is "a small floating box shown with the dialogue it
  follows", so it cannot be drawn inside the plate and it cannot be drawn inside
  the room's own portrait either. It goes in the band between them \u2014 the dead
  room the vignette leaves above the card \u2014 justified to the END of it, which is
  where the Engine puts it and which is also the side of the window that is not
  the speaker's own face.

  Four things are decided here and each of them is deliberate:

    - flex-end, so the bubbles stack against the right-hand edge and a short
      remark sits at the end of the band instead of floating in the middle of it.
      The bubbles themselves are therefore content-sized: end alignment does not
      stretch, so a bubble is as wide as its own words and no wider.

    - a CEILING, because a villager who writes six asides is not a reason for the
      plate to be pushed off the bottom of the tab. The Engine caps its own block
      at min(16rem, 38vh); this is the same idea at this surface's own number,
      and it is a cqh rather than a vh because in fullscreen the tab and the
      window are two different boxes. Past the ceiling it scrolls, exactly as the
      Engine's own block does.

    - nothing at all when it is empty. The block is not drawn at all rather than
      drawn empty, so a turn that carries no aside draws precisely what it drew
      before any of this existed \u2014 the stage does not lose a band's worth of room
      to a box with no bubbles in it.

    - a 75 percent cap on each bubble, which is the Engine's own ratio kept
      because it is what makes a bubble read as an aside rather than as another
      paragraph. It is the one measurement in here that comes off the Engine's
      window rather than off this card's own furniture.
*/
.${i}-chat-vn-asides {
  display: flex; flex-direction: column; align-items: flex-end; gap: .375rem;
  flex: 0 1 auto; min-height: 0; max-height: min(12rem, 30cqh);
  overflow-y: auto; overflow-x: hidden; overscroll-behavior: contain;
  padding-right: .25rem;
}
/*
  ONE BUBBLE, and it is the Engine's own small floating box copied to the values
  rather than imported: a round face a seventh of the card's own portrait, the
  type's mark beside the speaker's name at eleven pixels semibold, the listener
  after an arrow, and the words under both at twelve. The arrow is the Engine's
  own and so is the italic on a whisper, and both are kept because a whisper
  whose listener is not written down is an ordinary line with a symbol in front
  of it.

  Two translations, and both are forced by the surface underneath rather than
  chosen. The Engine draws these over a picture and fills them with black at
  three quarters, with a white hairline; this band is over a vignette and a card
  and not over a picture in the Engine's sense, so the same fill on it is a bubble
  with no edge at all \u2014 the fills are therefore this tab's own panel and border
  tokens at the Engine's own measured sizes, which is what makes the bubble read
  as a bubble here rather than as a hole in the stage. And the shadow is the
  Engine's, kept, because that is the half of the drawing that makes it float: a
  second surface that is only a second colour reads as another paragraph.

  flex: 0 0 auto, so a long bubble in a capped band scrolls rather than squashes.

  It has been in two wrong places before it got here, and both are worth naming
  because the sheet is where the mistake was both times. 0.4.56 drew an aside as
  a badge in the speaker's own row, which is a fact in the right place told inside
  the plate \u2014 the one thing the Engine never does with these lines. 0.4.57 took
  the badge out and pushed the whole bubble into the plate instead, which was
  worse: the aside stopped being a badge and started being the PARAGRAPH, so the
  line it followed left the card entirely and the player had to step the arrows
  to find it. This release fixes the second mistake and does not reintroduce the
  first: the plate is the plate, whatever the turn carries, and an aside is only
  ever something floating above it.
*/
.${i}-chat-vn-aside {
  flex: 0 0 auto;
  display: flex; align-items: flex-start; gap: .5rem;
  max-width: 75%;
  padding: .5rem .75rem; border-radius: .75rem;
  border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  background: var(--marinara-chat-chrome-panel-bg, color-mix(in srgb, var(--popover) 92%, transparent));
  box-shadow: 0 1rem 2.375rem rgba(0, 0, 0, .45);
}
/* The whisper is the one aside that changes colour as well as mark. It is the
   pair of tokens this sheet already reserves for the thing being pointed at, and
   the Engine's own whisper bubble is the same pair \u2014 a whisper is the register
   whose whole meaning is WHO it was aimed at, so it is the register that gets the
   colour that means pointed at. */
.${i}-chat-vn-aside[data-register="whisper"] {
  border-color: var(--marinara-chat-chrome-button-border, var(--marinara-chat-chrome-panel-border, var(--border)));
}
.${i}-chat-vn-aside-face {
  position: relative; flex: 0 0 auto; margin-top: .125rem;
  display: flex; align-items: center; justify-content: center;
  width: 1.75rem; height: 1.75rem;
  border-radius: 999px; border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  background: var(--secondary);
  font-size: .6875rem; font-weight: 600;
  overflow: hidden;
}
.${i}-chat-vn-aside-face > img { display: block; width: 100%; height: 100%; object-fit: cover; }
.${i}-chat-vn-aside-column { display: flex; flex-direction: column; min-width: 0; flex: 1 1 auto; }
.${i}-chat-vn-aside-head {
  display: flex; align-items: center; gap: .375rem;
  margin: 0; min-width: 0;
}
.${i}-chat-vn-aside-icon { flex: 0 0 auto; font-size: .5625rem; }
.${i}-chat-vn-aside-name {
  min-width: 0; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font-size: .6875rem; font-weight: 600; line-height: 1.4;
  color: var(--marinara-chat-chrome-highlight-text, var(--foreground));
}
.${i}-chat-vn-aside-target {
  flex: 0 0 auto; overflow: hidden; text-overflow: ellipsis; white-space: nowrap;
  font-size: .5625rem; color: var(--muted-foreground);
}
.${i}-chat-vn-aside-text {
  margin: .125rem 0 0; min-width: 0;
  font-size: .75rem; line-height: 1.6; font-style: normal;
  white-space: pre-wrap; overflow-wrap: break-word;
  color: var(--marinara-chat-chrome-panel-text, var(--foreground));
}
.${i}-chat-vn-aside[data-register="whisper"] .${i}-chat-vn-aside-text { font-style: italic; }
.${i}-chat-vn-beat {
  margin: 0; align-self: flex-start; max-width: 100%;
  padding: .5rem .625rem; border-radius: .625rem;
  border: 1px solid var(--marinara-chat-chrome-panel-divider, color-mix(in srgb, var(--border) 60%, transparent));
  background: color-mix(in srgb, var(--foreground) 6%, transparent);
  color: var(--muted-foreground);
  font-size: .8125rem; line-height: 1.6;
  white-space: pre-wrap; overflow-wrap: break-word;
}
/*
  The marks a villager's line can carry, read by villages-inline-markdown.ts and
  assembled by renderVillagesMarkdown above.

  Only three of them need a rule. Bold and italic are the browser's own strong and
  em, and underline and strikethrough are the browser's own u and del, so the sheet
  says nothing about them; a code span, a link and a highlight would otherwise be
  indistinguishable from the words on either side of them.

  The Engine draws these same three \u2014 packages/client/src/styles/globals.css, at
  mari-md-inline-code and friends \u2014 and those rules cannot be borrowed, only
  copied: every one of them is scoped to mari-message-content, which is the
  Engine's chat bubble and not this card. The colours here are deliberately the
  Engine's, so a backtick span and a highlighted phrase look the same in a village
  as they do in a roleplay, and a highlight stays a colour the reader already
  knows rather than a new one this tab invented.
*/
.${i}-chat-md-code {
  font-family: Consolas, Monaco, "Courier New", monospace;
  font-size: .85em; padding: .1em .35em; border-radius: 4px;
  background: rgba(255, 255, 255, .06); border: 1px solid rgba(255, 255, 255, .1);
  color: #e8e6e3; direction: ltr; unicode-bidi: isolate;
}
.${i}-chat-md-link { color: var(--primary); text-decoration: underline; text-underline-offset: .12em; }
.${i}-chat-md-link:hover { opacity: .85; }
.${i}-chat-md-highlight {
  background: rgba(250, 204, 21, .15); color: #facc15;
  border-radius: 2px; padding: 0 .1em;
}
/*
  The arrows, drawn as a rule-separated row under the paragraph.

  They are hidden when there is nowhere to go at all, which is the common case for
  a short answer that came in one piece: a pair of dead arrows under every line of
  a village's small talk would be two controls that say "there is nothing more"
  fifty times a session. One step in either direction is enough to draw them, and
  the step may cross from one speaker to the other \u2014 the reading is the whole
  conversation, so the arrows walk out of the villager's line into the player's own
  and back again. The turns memo above the drawer is the list they walk.

  The rule above them is the Engine's own, drawn at half the weight of the card's
  edge because it separates two things inside one surface rather than ending a
  surface: the paragraph and the controls that walk it. The row carries the
  plate's own horizontal padding, so it reaches both edges of the plate while the
  two arrows sit in from them \u2014 the Engine's own inset, at the Engine's own size.

  The words are the Engine's own two as well, and they are worth being long: the
  card is one paragraph of a longer answer, and a control called Next on a card
  that is holding somebody's speech is a control next to what? The room above the
  arrows already knows where it is; the arrows are the only thing in the plate that
  has to say what they walk.
*/
.${i}-chat-vn-nav {
  display: flex; align-items: center; justify-content: space-between; gap: .5rem;
  padding: .375rem .75rem;
  border-top: 1px solid var(--marinara-chat-chrome-panel-divider, color-mix(in srgb, var(--border) 50%, transparent));
  color: var(--marinara-chat-chrome-accent, var(--muted-foreground));
  font-size: .75rem;
}
.${i}-chat-vn-counter {
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  font-size: .6875rem; opacity: .75;
  color: var(--marinara-chat-chrome-accent, var(--muted-foreground));
  font-variant-numeric: tabular-nums;
}
.${i}-chat-vn-button {
  display: inline-flex; align-items: center; gap: .25rem;
  border-radius: .25rem; padding: .25rem .5rem;
  background: transparent;
  color: var(--marinara-chat-chrome-accent, var(--muted-foreground));
  font-size: .75rem; font-family: inherit; cursor: pointer;
  transition: background-color .15s ease;
}
.${i}-chat-vn-button svg { width: .875rem; height: .875rem; }
.${i}-chat-vn-button:hover { background: var(--marinara-chat-chrome-button-bg-hover, color-mix(in srgb, var(--foreground) 10%, transparent)); }
.${i}-chat-vn-button:disabled {
  cursor: default; opacity: .3;
  pointer-events: none;
}
/*
  The wait: one dot going round at the end of the reading.

  It stands in for two sentences \u2014 "N is thinking..." in the card and "N is
  saying goodbye..." in the log \u2014 and that is the whole argument for it. A line
  saying that somebody is thinking is a line the player reads once and has to
  read again on every turn, and the only thing it carries that a moving dot does
  not is a name the tab already has across the top of it.

  It is drawn in the place the answer is about to arrive rather than in a corner
  of its own: at the head of the reading, directly under the last thing the
  villager said, which is where the eye already is at the end of a turn and where
  the reply will appear a moment later. The same row is drawn while the villager
  is finding their first line and while an ordinary reply is in flight, because
  both are the same fact.

  The dot is not announced. What it means for anybody who cannot see it is in a
  hidden span beside it, since a spinner on its own is nothing to read out.
*/
.${i}-chat-pending { display: flex; justify-content: flex-start; margin: 0; }
.${i}-chat-spinner {
  flex: 0 0 auto;
  width: .75rem; height: .75rem; border-radius: 999px;
  border: 2px solid color-mix(in srgb, var(--muted-foreground) 30%, transparent);
  border-top-color: var(--muted-foreground);
}
/*
  Words for the accessibility tree and nobody else.

  Not the display:none form, which takes them out of the tree as well, and not a
  zero-width box, which some readers skip: this is the shape that is laid out as
  a one-pixel box with a one-pixel clip, so it keeps its name without keeping any
  room on the screen. The package had none of these until the spinner needed one,
  because every other control in the tab says what it is in visible words.
*/
.${i}-visually-hidden {
  position: absolute; width: 1px; height: 1px;
  margin: -1px; padding: 0; border: 0;
  overflow: hidden; clip-path: inset(50%); white-space: nowrap;
}
/*
  NEVER BREAK A WORD.

  overflow-wrap: anywhere is the one that looks harmless and is not. It lets the
  layout engine count a box's smallest possible width as a single character, so
  any box with no other floor shrinks until the letters stack one per line.
  GachaForge measured its narrowest rail drawing "Inven/tory/scree/n" at 33
  pixels of text width, and this keyword was the cause.

  break-word still breaks a word that cannot fit \u2014 a URL, a name with no spaces \u2014
  but it does not tell the layout engine that every word is a thing to be broken
  up, so the box keeps a floor of its longest word instead of a floor of one
  letter.
*/
.${i}-msg { max-width: 88%; border-radius: .625rem; padding: .4375rem .625rem; font-size: .75rem; line-height: 1.5; white-space: pre-wrap; overflow-wrap: break-word; }
/*
  Two speakers, two washes.

  Both bubbles are the same construction: one soft gradient, light at the top
  left and very slightly deeper at the bottom right, mixed over the theme's own
  background so a change of theme carries through and so the mix knows how dark
  the surface it is landing on is. The text colour is --foreground in both cases
  and is never taken from the gradient, which is what keeps both readable in
  both themes: the wash is always most of the background's own colour, and
  --foreground is the colour the theme has already promised contrasts with that.

  The villager's is the quieter of the two \u2014 the theme's own accent at a low
  mix, which is a cool grey-blue in a dark theme and a pale lilac in a light
  one \u2014 because it is the surface an answer arrives on. The player's is a soft,
  light blue, built from a fixed blue HUE rather than from --primary: what makes
  it read as blue is the hue, and what makes it light or dark is the background
  it is mixed over. A hard-coded light blue would be unreadable in a dark theme
  and invisible in a light one, and the blue is the one thing here the player
  asked for by name.

  The player's is the stronger of the two on purpose: it is the one they wrote,
  it is the one they will look for, and if the two were equally loud the log
  would read as two people shouting, which is not what either of them is doing.
*/
.${i}-msg[data-role="assistant"] {
  align-self: flex-start;
  background: linear-gradient(160deg, color-mix(in srgb, var(--primary) 14%, var(--background)), color-mix(in srgb, var(--primary) 6%, var(--background)));
  border: 1px solid var(--border);
}
.${i}-msg[data-role="user"] {
  align-self: flex-end;
  background: linear-gradient(160deg, color-mix(in srgb, #60a5fa 26%, var(--background)), color-mix(in srgb, #60a5fa 13%, var(--background)));
  border: 1px solid color-mix(in srgb, #60a5fa 40%, transparent);
}
.${i}-msg-pending { align-self: flex-start; font-size: .75rem; color: var(--muted-foreground); padding: .25rem .125rem; }
/*
  The judge's sentence, under the reply it produced. It is drawn as a footnote
  rather than a bubble because it is not something anybody said \u2014 it is the
  village's account of whether the player was believed, and the one place the
  player can find out why the answer went the way it did. The rule on the left
  is the whole of it: green for believed, red for not.
*/
.${i}-ruling {
  align-self: stretch; margin: .125rem 0 0; padding: .25rem 0 .25rem .5rem;
  border-left: 2px solid var(--muted-foreground);
  font-size: .6875rem; line-height: 1.5; color: var(--muted-foreground);
}
.${i}-ruling[data-fulfilled="true"] { border-left-color: var(--primary); color: var(--primary); }
.${i}-ruling[data-fulfilled="false"] { border-left-color: var(--destructive, #e5484d); color: var(--destructive, #e5484d); }
/*
  How to talk, behind one button.

  The three verbs used to be three pills in a row across the bar, and the row was
  the problem: "Chat", "Ask something" and "Fulfill something" are about thirty
  characters of the twenty a phone's bar has, so on the screen this tab shares with
  the Engine's own panels the row WAS the bar and the box the player types in was
  an afterthought under it. The Engine's own answer is the shape this copies \u2014 its
  Connections switcher \u2014 and the reason is the same: what would be a row of words
  on a phone becomes one small square with a glyph on it, and the words live in a
  menu above it where there is room to say what each one is. It is also the shape
  the composer wants at its left-hand edge, where the glyph it now sits at the end
  of a line of words rather than in a corner of the row: a control at the edge of
  a box that opens something should look like one.

  A CIRCLE rather than the toolbar's rounded square. The options button in the
  head is a square and it presses something; this one opens a menu, and two
  controls over the same photograph should not look like each other when they do
  different things. The Engine makes the same distinction \u2014 its own attach button
  is round and its toolbar squares are not \u2014 and both are drawn in the chrome's
  tokens, since the bar is a translucent surface over a picture and a control that
  was not would be a hole in it.
*/
.${i}-chat-mode-button {
  display: inline-flex; align-items: center; justify-content: center;
  width: 2rem; height: 2rem; padding: .375rem; box-sizing: border-box;
  border: 1px solid var(--marinara-chat-chrome-button-border, var(--border));
  border-radius: 999px;
  background: var(--marinara-chat-chrome-button-bg, var(--popover));
  color: var(--marinara-chat-chrome-button-text, var(--foreground));
  backdrop-filter: blur(12px);
  cursor: pointer;
  transition: border-color .15s ease, background-color .15s ease, color .15s ease;
}
.${i}-chat-mode-button:hover {
  border-color: var(--marinara-chat-chrome-button-border-hover, var(--primary));
  background: var(--marinara-chat-chrome-button-bg-hover, var(--popover));
  color: var(--marinara-chat-chrome-button-text-hover, var(--primary));
}
.${i}-chat-mode-button:focus-visible {
  outline: 2px solid var(--marinara-chat-chrome-focus-ring, var(--primary));
  outline-offset: 1px;
}
.${i}-chat-mode-button:disabled { cursor: default; opacity: .5; }
.${i}-chat-mode-button svg { width: 1rem; height: 1rem; }
/*
  The menu the button opens, modelled on the Connections switcher: a titled head
  over a list of rows, the row in force marked with a tick, and the whole thing
  bounded in both directions so a translation of the labels cannot push it off the
  tab. It is the second popover in the drawer and it is deliberately the same
  panel as the first \u2014 same tokens, same radius, same blur, same shadow \u2014 because
  a drawer with two kinds of menu in it is a drawer the player has to read twice.

  It opens UPWARD, off the box's own top edge, which is the other thing it has in
  common with the Connections switcher and with the Engine's own popovers: the box
  is on the floor of the tab, at the foot of the screen, and a menu that opened
  downward would be a menu off the bottom of it. It measures itself from the box
  rather than from the button inside it \u2014 the box is what the anchor inside it is
  static for, which is what puts the panel flush with the frame's top edge instead
  of a button's height into it.

  z-index 40 is the popover layer the options menu also sits on: both are drawn
  over the room, neither is ever over the other, since a press closes whichever
  one is not being pressed.
*/
.${i}-chat-modes {
  position: absolute; left: 0; bottom: calc(100% + .375rem); z-index: 40;
  width: 15rem; max-width: min(15rem, 82cqw);
  max-height: min(20rem, 70cqh); overflow-y: auto;
  display: flex; flex-direction: column;
  border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  border-radius: .625rem;
  background: var(--marinara-chat-chrome-panel-bg, var(--popover, var(--background)));
  color: var(--marinara-chat-chrome-panel-text, var(--foreground));
  backdrop-filter: blur(12px);
  box-shadow: 0 .875rem 2rem rgba(0, 0, 0, .35);
}
.${i}-chat-modes-head {
  display: flex; align-items: center; justify-content: space-between; gap: .5rem;
  border-bottom: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  padding: .4375rem .625rem;
  font-size: .6875rem; font-weight: 600;
}
.${i}-chat-modes-list { display: flex; flex-direction: column; gap: .125rem; padding: .25rem; }
.${i}-chat-mode-item {
  display: flex; align-items: center; gap: .5rem; width: 100%;
  border: 0; border-radius: .5rem; padding: .4375rem .5rem;
  background: transparent; color: inherit;
  font-size: .75rem; font-family: inherit; text-align: left; cursor: pointer;
  transition: background-color .15s ease;
}
.${i}-chat-mode-item:hover { background: color-mix(in srgb, var(--foreground) 10%, transparent); }
.${i}-chat-mode-item[data-active="true"] { font-weight: 600; }
.${i}-chat-mode-item:disabled { cursor: default; opacity: .5; }
.${i}-chat-mode-item-label { flex: 1 1 auto; min-width: 0; }
.${i}-chat-mode-item svg { width: .875rem; height: .875rem; flex: 0 0 auto; }
/*
  The one press in the menu that is not a mode.

  Leaving is a verb of the conversation rather than a way of being answered, so it
  is drawn under a rule at the foot of the list rather than beside the three that
  are: a player scanning the modes should not find walking out among them. It is
  still drawn only where there is a conversation to leave \u2014 see showLeave \u2014 and
  it is the press that spends the goodbye, which is why it is here rather than
  beside the ending that follows it.
*/
.${i}-chat-modes-foot {
  display: flex; flex-direction: column;
  border-top: 1px solid var(--marinara-chat-chrome-panel-border, var(--border));
  padding: .25rem;
}
.${i}-chat-modes-foot > .${i}-button { width: 100%; justify-content: flex-start; text-align: left; }
/*
  Where the player says what they did for somebody.

  This is the third verb's box rather than a panel beside the ordinary one: the
  same composer, with the label and the claim input swapped in for the textarea,
  because a claim is still something being said to this villager and only one
  sentence is on the table at a time. The verbs underneath do not move, so
  changing your mind is pressing Chat and getting your half-written message back
  exactly as you left it \u2014 the draft belongs to the drawer, not to this box.
*/
.${i}-claim { display: flex; flex-direction: column; gap: .375rem; }
.${i}-composer { display: flex; flex-direction: column; gap: .375rem; }
.${i}-textarea {
  width: 100%; box-sizing: border-box; resize: vertical; min-height: 3.25rem; max-height: 9rem;
  border: 1px solid var(--border); border-radius: .5rem;
  background: var(--background); color: var(--foreground);
  padding: .4375rem .5rem; font-size: .75rem; font-family: inherit; line-height: 1.5;
}
/*
  One row under the box, and it is the Engine's own composer.

  It used to be a grid of three columns \u2014 Leave on the left, the verbs centred,
  Send on the right \u2014 and 0.4.49 takes it apart for the shape the Engine's own
  roleplay composer has. 0.4.50 finishes the job: the way to talk moved inside the
  box, at its left-hand edge, where the press that sends already was at its
  right-hand edge \u2014 so the only thing left in this row is the box itself. Nothing
  is pinned to a corner because nothing is in a corner any more: how to talk is a
  menu rather than a row of words, both controls are glyphs inside the frame, and
  Leave is one press down inside the menu.

  It stays a row of its own rather than being folded into the composer above it,
  because the box is what the row is for and a wrapper that says so reads better
  than a column whose only child is the thing the column is named after. The one
  child still takes the row: flex 1 1 auto with min-width 0, so a long line wraps
  inside the box rather than widening the row past the tab, and the box is the
  thing that shrinks on a narrow tab \u2014 the override that used to spread Leave and
  Send across two rows went with them.
*/
.${i}-composer-row { display: flex; }
.${i}-composer-row > .${i}-claim,
.${i}-composer-row > .${i}-chat-input { flex: 1 1 auto; min-width: 0; }
/*
  The box, and both of the glyphs that belong to it.

  The press that sends is INSIDE the box, on its right-hand edge, and so is the
  button that chooses how the line will be taken, at its left-hand edge. The
  second one is what 0.4.50 moved: the box used to be the frame around the
  player's words with the way to talk standing outside it in the row, which made
  that button the one piece of the composer that was not in the composer. Both are
  glyphs, both are inside the same frame as the words they act on, and both are
  centred on the frame's height \u2014 which is what align-items: center is doing here,
  and it is the whole of what the picture of the target layout asked for. The
  words are the only thing left on the frame's last line, and the only thing whose
  height changes as they wrap.

  The frame is the ENGINE'S OWN input shell, in the Engine's own words: the same
  rounded-2xl radius, the same input border and input fill, the same blurred
  backdrop, and the same focus behaviour \u2014 the border lights up and a one-pixel
  ring goes round the whole box when the caret is anywhere inside it, which is why
  the ring is on :focus-within rather than on the textarea. The press used to be a
  glyph button floating over a framed textarea's right edge; two frames around one
  act were one frame too many, and the shell is the one the Engine's composer
  already wears.

  The textarea inside it is stripped of its frame rather than given a second one:
  no border, no fill, no resize grip. The grip matters \u2014 a dragged corner would
  sit exactly where the glyph now is \u2014 and what it cost is small: the box still
  scrolls once it reaches its ceiling, and the ceiling is where it always was.

  The button that sends is a glyph rather than a word in every one of the three
  verbs. The box already says what mode the player is in, so a label saying Send,
  Tell them or anything else would be a second statement of the same thing in the
  one part of the tab where there is no room for it. What it does NOT do is move
  when it does: the disabled state is the whole difference between an empty box
  and a full one, and it is opacity, which is what the Engine uses too.
*/
.${i}-chat-input {
  position: relative; display: flex; align-items: center; gap: .5rem;
  padding: .375rem .5rem;
  border: 1px solid var(--marinara-chat-chrome-input-border, var(--border));
  border-radius: 1rem;
  background: var(--marinara-chat-chrome-input-bg, var(--background));
  color: var(--marinara-chat-chrome-panel-text, var(--foreground));
  box-shadow: 0 .0625rem .125rem rgba(0, 0, 0, .18);
  backdrop-filter: blur(12px);
  transition: border-color .2s ease, box-shadow .2s ease;
}
.${i}-chat-input:focus-within {
  border-color: var(--marinara-chat-chrome-input-border-focus, var(--primary));
  box-shadow: 0 0 0 1px var(--marinara-chat-chrome-focus-ring, var(--primary));
}
/*
  The way to talk, at the frame's left-hand edge.

  Static rather than relative, and that is the whole of what this rule is for:
  the anchor is the thing the menu above it measures itself from, so taking its
  own positioning away hands that job up to the box, which is the nearest
  positioned thing over it. The menu therefore opens off the box's own top edge
  rather than off a button sitting in the middle of it \u2014 flush with the frame
  instead of a button's height into it.

  It keeps its own width, because it is a glyph and not a thing that stretches:
  flex 0 0 auto, so a long line cannot squash the control that says how the line
  will be read.
*/
.${i}-chat-input > .${i}-chat-menu-anchor { position: static; flex: 0 0 auto; }
/*
  The words, and the only thing in the frame that is allowed to change height.

  Its own horizontal padding is gone, because the glyphs beside it hold its two
  edges apart now: the frame's padding is the inset, and a second one inside the
  frame would be two insets for one gap. What is left is the vertical inset that
  keeps the first line off the frame's top edge.
*/
.${i}-chat-input > .${i}-textarea {
  flex: 1 1 auto; min-width: 0;
  border: 0; border-radius: 0; box-shadow: none; resize: none;
  background: transparent; color: inherit;
  min-height: 2.75rem; max-height: 9rem;
  padding: .3125rem 0;
}
/*
  The sentence the frame says when there is nothing to put in it.

  It is drawn INSIDE the frame rather than in the frame's place, because the frame
  carries the way back to the other verbs: a claim with nothing to settle is the
  one state where the player has a box they cannot type in, and a state with no
  frame would be a state with no way out of the verb. The sentence stretches to
  fill what the glyph beside it leaves and is a wrapping item rather than a rigid
  one, so it wraps inside the box instead of widening it.
*/
.${i}-chat-input > .${i}-hint { flex: 1 1 auto; min-width: 0; }
.${i}-chat-send {
  display: inline-flex; align-items: center; justify-content: center;
  flex: 0 0 auto;
  width: 1.75rem; height: 1.75rem; padding: 0; box-sizing: border-box;
  border: 1px solid transparent; border-radius: 999px;
  background: transparent; color: var(--marinara-chat-chrome-panel-muted, var(--muted-foreground));
  cursor: pointer;
  transition: border-color .15s ease, background-color .15s ease, color .15s ease;
}
.${i}-chat-send:hover {
  border-color: var(--marinara-chat-chrome-button-border-hover, var(--primary));
  background: color-mix(in srgb, var(--primary) 12%, transparent);
  color: var(--marinara-chat-chrome-button-text-hover, var(--primary));
}
.${i}-chat-send:focus-visible {
  outline: 2px solid var(--marinara-chat-chrome-focus-ring, var(--primary));
  outline-offset: 1px;
}
.${i}-chat-send:disabled { cursor: default; opacity: .45; }
.${i}-chat-send:disabled:hover {
  border-color: transparent; background: transparent;
  color: var(--marinara-chat-chrome-panel-muted, var(--muted-foreground));
}
.${i}-chat-send svg { width: 1rem; height: 1rem; }
.${i}-room-screen .${i}-chat-send {
  width: auto; min-width: 4.5rem; height: 2.75rem; padding: 0 .75rem;
  border-color: var(--primary); border-radius: .75rem;
  background: var(--primary); color: var(--primary-foreground, white);
  font-size: .75rem; font-weight: 700; touch-action: manipulation;
}
.${i}-room-screen .${i}-chat-mode-button {
  width: auto; min-width: 4.5rem; height: 2.25rem; padding: 0 .625rem;
  border-radius: .625rem; font-size: .75rem; font-weight: 700; white-space: nowrap;
}
.${i}-room-screen .${i}-chat-send:hover:not(:disabled) {
  background: var(--primary); color: var(--primary-foreground, white);
}
.${i}-room-screen .${i}-chat-pending { align-items: center; gap: .5rem; }
.${i}-room-screen .${i}-chat-pending-label { font-size: .75rem; }
.${i}-room-modes { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .375rem; }
.${i}-room-mode {
  min-width: 0; min-height: 2.5rem; padding: .375rem .25rem;
  border: 1px solid var(--border); border-radius: .625rem;
  background: var(--popover); color: var(--foreground);
  font: inherit; font-size: .75rem; font-weight: 600; cursor: pointer;
}
.${i}-room-mode[data-active="true"] { border-color: var(--primary); background: color-mix(in srgb, var(--primary) 18%, var(--popover)); color: var(--primary); }
.${i}-room-mode:disabled { opacity: .5; cursor: default; }
.${i}-room-mode:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.${i}-room-error {
  display: flex; flex-wrap: wrap; align-items: center; gap: .5rem;
  border: 1px solid color-mix(in srgb, var(--destructive, #e5484d) 45%, transparent);
  border-radius: .625rem; padding: .625rem;
  background: color-mix(in srgb, var(--destructive, #e5484d) 9%, var(--popover));
  color: var(--destructive, #e5484d); font-size: .75rem;
}
.${i}-room-error p { margin: 0; flex: 1 1 12rem; overflow-wrap: anywhere; }
.${i}-room-error .${i}-button { flex: 0 0 auto; border-color: currentColor; color: inherit; }
.${i}-room-screen .${i}-chat[data-opening-error="true"] .${i}-chat-vn { display: none; }
.${i}-hint { font-size: .625rem; color: var(--muted-foreground); }
/* Said in the colour a warning is said in, so enlarging a small picture is not
   something the player has to notice for themselves. */
.${i}-hint[data-tone="warn"] { color: var(--destructive, #e5484d); }
.${i}-field { display: flex; flex-direction: column; gap: .25rem; margin-top: .625rem; }
.${i}-label { font-size: .6875rem; font-weight: 600; color: var(--muted-foreground); }
/* A switch is the box and its words as one control. Clicking the sentence
   toggles it, which is what every settings list is expected to do. */
.${i}-switch { display: flex; align-items: flex-start; gap: .4375rem; font-size: .75rem; line-height: 1.5; cursor: pointer; }
.${i}-switch[data-disabled="true"] { cursor: default; opacity: .5; }
.${i}-switch input { flex: none; margin: .1875rem 0 0; accent-color: var(--primary); }
.${i}-switch-hours { font-size: .625rem; color: var(--muted-foreground); font-variant-numeric: tabular-nums; }
/* Indented under the master switch, because it is what the master switch is
   holding open rather than a second, unrelated question. */
.${i}-switches { display: grid; gap: .25rem; margin-top: .125rem; padding-left: 1.3125rem; }
/*
  The three places a panel opens a scrolling list inside a panel that already
  scrolls. Each ceiling is whichever is smaller: the length it has always had, or
  a share of the tab's height. On any tab big enough for the old number the old
  number is what binds, so nothing on a monitor moves; on a short tab the inner
  box stops being taller than the screen it is on, which is what turns one scroll
  region into two nested ones.
*/
.${i}-preset {
  width: 100%; box-sizing: border-box; resize: vertical;
  min-height: 11rem; max-height: min(24rem, 60cqh);
  border: 1px solid var(--border); border-radius: .5rem;
  background: var(--background); color: var(--foreground);
  padding: .4375rem .5rem; font-size: .6875rem; line-height: 1.55;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
.${i}-macros { display: flex; flex-wrap: wrap; gap: .375rem; margin-top: .5rem; }
.${i}-macro {
  border: 1px solid var(--border); border-radius: .375rem;
  background: var(--background); color: var(--foreground);
  padding: .1875rem .4375rem; cursor: pointer;
  font-size: .625rem; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
}
.${i}-macro:hover { border-color: var(--primary); color: var(--primary); }
.${i}-macro-help { margin: .5rem 0 0; font-size: .625rem; line-height: 1.55; color: var(--muted-foreground); }
/* A control that is switched off while the village setup flow which will owe it
   is still being written. The prose around it stays at full strength, because
   the reason it is off is the thing worth reading; the control itself is dimmed
   so nobody tries to type into a box that will not take the letters. */
.${i}-off { opacity: .5; }
/*
  A translation prompt, printed verbatim. Monospaced and scrollable, because it
  is read as the thing being worked on rather than as prose: a prompt reflowed
  into a paragraph is a prompt nobody can compare against the one they meant to
  write. The cap is here rather than on the overlay so that a villager with a
  long week cannot push the whole panel off the bottom of the tab.
*/
.${i}-prompt {
  margin: .5rem 0 0; padding: .4375rem .5rem;
  max-height: min(18rem, 55cqh); overflow: auto;
  border: 1px solid var(--border); border-radius: .5rem;
  background: var(--background); color: var(--foreground);
  font-size: .625rem; line-height: 1.55;
  font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  white-space: pre-wrap; overflow-wrap: break-word;
}
.${i}-notice-row { display: flex; align-items: flex-start; gap: .5rem; font-size: .75rem; line-height: 1.5; color: var(--muted-foreground); }
.${i}-notice-row > span { flex: 1 1 auto; min-width: 0; }
.${i}-notice-author { font-weight: 600; color: var(--foreground); }
.${i}-notice-add { display: flex; gap: .5rem; margin-top: .625rem; }
.${i}-notice-input {
  flex: 1 1 auto; min-width: 0; box-sizing: border-box;
  border: 1px solid var(--border); border-radius: .5rem;
  background: var(--background); color: var(--foreground);
  padding: .375rem .5rem; font-size: .75rem; font-family: inherit;
}
/*
  A place and its picture: the picture on the left, its name and the buttons
  that act on it on the right. A grid rather than a flex row so the names line
  up down the column even when one of them wraps to two lines, which is what
  makes the list read as a list instead of as a stack of unrelated things.
*/
.${i}-places { margin: .5rem 0 0; padding: 0; list-style: none; display: grid; gap: .625rem; }
.${i}-place { display: grid; grid-template-columns: 4.5rem minmax(0, 1fr); gap: .625rem; align-items: start; }
.${i}-place-thumb {
  width: 4.5rem; height: 3rem; display: block; object-fit: cover;
  border: 1px solid var(--border); border-radius: .375rem;
  background: var(--muted, rgba(127, 127, 127, .08));
}
/* Empty is drawn as empty \u2014 dashed rather than solid \u2014 so "no picture yet" is
   visibly a state the village is in rather than a picture that failed. */
.${i}-place-thumb[data-empty="true"] { border-style: dashed; }
.${i}-place-body { display: flex; flex-direction: column; gap: .25rem; min-width: 0; }
.${i}-place-name { font-size: .75rem; font-weight: 600; color: var(--foreground); overflow-wrap: break-word; }
/* The buttons hug the name rather than sitting a row's gap below it: the row
   margin is right for a row under a paragraph and wrong for one under a label. */
.${i}-place-body .${i}-row { margin-top: 0; }
.${i}-place-body .${i}-file { font-size: .625rem; }
/*
  THE PLACE ITSELF, as the screen that stands in it: its picture on one side and
  what the village knows on the other.

  flex-wrap rather than a media query, because the tab is not the window. In
  fullscreen the Engine hands this package a box whose width has nothing to do
  with the viewport, so a query on max-width would be answering a different
  question; two items whose bases add up to more than the row fall onto two rows
  wherever that line happens to be. The picture keeps its basis and the text grows
  into the rest, so the only two shapes are "beside" and "under".

  A place nobody has drawn is the same box with nothing in it, dashed, which is
  the statement the places list already makes for a picture that is not there yet.
*/
.${i}-venue { display: flex; flex-wrap: wrap; gap: 1rem; margin-top: .875rem; align-items: flex-start; }
.${i}-venue-exterior { flex: 0 1 18rem; min-width: 0; display: flex; flex-direction: column; gap: .625rem; }
.${i}-venue-picture {
  flex: 0 1 18rem; min-width: 0; box-sizing: border-box;
  aspect-ratio: 4 / 3; border-radius: .625rem;
  background: var(--muted, rgba(127, 127, 127, .08));
}
.${i}-venue-picture:not([data-empty="true"]) {
  display: block; width: 100%; object-fit: cover; border: 1px solid var(--border);
}
.${i}-venue-picture[data-empty="true"] {
  display: flex; align-items: center; justify-content: center;
  border: 1px dashed var(--border); padding: .5rem; text-align: center;
  font-size: .6875rem; line-height: 1.5; color: var(--muted-foreground);
}
.${i}-venue-body { flex: 1 1 20rem; min-width: 0; display: flex; flex-direction: column; gap: .625rem; }
/* The buttons hug the beat above them rather than sitting a row's margin below it,
   which is the same substitution the places list makes under a name. */
.${i}-venue-body .${i}-row { margin-top: 0; }
/* The look-around is the one paragraph on this screen, so it is set at reading
   size rather than at the sheet's label size. */
.${i}-venue-beat { margin: 0; font-size: .875rem; line-height: 1.65; }
.${i}-venue-page, .${i}-venue-editor-page, .${i}-venue-proposal-page {
  display: flex; flex-direction: column; gap: 1rem; margin-top: 1rem;
}
.${i}-venue-hero {
  display: grid; grid-template-columns: minmax(15rem, 30rem) minmax(15rem, 38rem);
  gap: 1rem; align-items: start;
}
.${i}-venue-hero > .${i}-venue-picture,
.${i}-venue-hero > .${i}-venue-image-empty {
  width: 100%; min-height: 0; max-height: 22.5rem; aspect-ratio: 4 / 3;
}
.${i}-venue-context, .${i}-venue-card {
  display: flex; flex-direction: column; align-items: flex-start; gap: .625rem;
  border: 1px solid var(--border); border-radius: .75rem;
  background: var(--popover); padding: 1rem;
}
.${i}-venue-context p, .${i}-venue-card p { margin: 0; }
.${i}-venue-context { align-self: center; }
.${i}-venue-space-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr)); gap: 1rem; }
.${i}-venue-card .${i}-venue-space-picture {
  width: 100%; max-width: none; max-height: 16rem; aspect-ratio: 16 / 10;
}
.${i}-venue-image-empty {
  display: grid; place-items: center; width: 100%; min-height: 10rem; max-height: 16rem;
  border: 1px dashed var(--border); border-radius: .625rem; color: var(--muted-foreground);
  background: var(--background); text-align: center; font-size: .75rem;
}
.${i}-venue-visit-picker { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; }
.${i}-venue-scene-details { width: 100%; border-top: 1px solid var(--border); padding-top: .5rem; }
.${i}-venue-scene-details summary { cursor: pointer; font-weight: 600; }
.${i}-venue-scene-details[open] { display: flex; flex-direction: column; gap: .625rem; }
@media (max-width: 700px) {
  .${i}-venue-hero { grid-template-columns: 1fr; }
  .${i}-venue-page .${i}-button,
  .${i}-venue-editor-page .${i}-button,
  .${i}-venue-proposal-page .${i}-button { min-height: 2.5rem; }
}
/*
  The village story. A flat list under a date heading, scrolled by the overlay
  it sits in, with a monospaced stamp on the memories that carry one. The max
  height is here rather than on the overlay so a very old village cannot push
  the panel taller than the tab.
*/
.${i}-story { margin: 0 0 .75rem; padding: 0; list-style: none; display: grid; gap: .375rem; max-height: min(26rem, 60cqh); overflow-y: auto; }
.${i}-story-day {
  position: sticky; top: 0; z-index: 1; margin: 0 0 .375rem;
  background: var(--background); padding: .125rem 0;
  font-size: .625rem; font-weight: 600; letter-spacing: .04em;
  text-transform: uppercase; color: var(--muted-foreground);
}
.${i}-story-row { display: flex; align-items: flex-start; gap: .5rem; font-size: .75rem; line-height: 1.5; color: var(--muted-foreground); }
.${i}-story-row > span { flex: 1 1 auto; min-width: 0; }
.${i}-story-meta {
  display: block; margin-bottom: .0625rem;
  font-size: .625rem; font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
  color: var(--muted-foreground);
}
.${i}-story-scope { color: var(--primary); }
/* Villagers \u2192 Memories: a calm library, not a diagnostic table. */
.${i}-villager-submenu {
  display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .5rem; margin: 0 0 1rem;
  padding: .3rem; border: 1px solid color-mix(in srgb, var(--border) 76%, transparent);
  border-radius: .85rem; background: color-mix(in srgb, var(--muted) 55%, transparent);
}
.${i}-villager-submenu button {
  display: flex; flex-direction: column; align-items: flex-start; gap: .12rem; min-width: 0;
  border: 0; border-radius: .62rem; padding: .62rem .8rem; background: transparent; color: var(--muted-foreground);
  text-align: left; cursor: pointer; transition: background .16s ease, color .16s ease, box-shadow .16s ease;
}
.${i}-villager-submenu button[data-active="true"] {
  background: var(--background); color: var(--foreground); box-shadow: 0 1px 8px color-mix(in srgb, #000 12%, transparent);
}
.${i}-villager-submenu span { font-size: .8rem; font-weight: 700; }
.${i}-villager-submenu small { overflow: hidden; max-width: 100%; font-size: .64rem; text-overflow: ellipsis; white-space: nowrap; }
.${i}-memory-library { display: flex; flex-direction: column; gap: 1rem; }
.${i}-memory-hero {
  display: grid; grid-template-columns: minmax(0, 1.7fr) minmax(12rem, .8fr); gap: 1rem; padding: 1.15rem;
  overflow: hidden; border: 1px solid color-mix(in srgb, var(--primary) 25%, var(--border)); border-radius: 1rem;
  background:
    radial-gradient(circle at 92% 8%, color-mix(in srgb, var(--primary) 23%, transparent), transparent 37%),
    linear-gradient(145deg, color-mix(in srgb, var(--popover) 95%, transparent), color-mix(in srgb, var(--muted) 62%, transparent));
}
.${i}-memory-kicker { font-size: .62rem; font-weight: 800; letter-spacing: .11em; text-transform: uppercase; color: var(--primary); }
.${i}-memory-hero h3 { margin: .28rem 0 .38rem; font-family: Georgia, 'Times New Roman', serif; font-size: clamp(1.15rem, 3vw, 1.7rem); font-weight: 500; }
.${i}-memory-hero p { max-width: 50rem; margin: 0; color: var(--muted-foreground); font-size: .76rem; line-height: 1.55; }
.${i}-memory-stats { display: grid; grid-template-columns: repeat(3, 1fr); align-self: stretch; gap: .4rem; }
.${i}-memory-stats span { display: flex; flex-direction: column; justify-content: center; min-width: 0; border: 1px solid color-mix(in srgb, var(--border) 72%, transparent); border-radius: .72rem; padding: .62rem .35rem; background: color-mix(in srgb, var(--background) 78%, transparent); text-align: center; color: var(--muted-foreground); font-size: .6rem; }
.${i}-memory-stats strong { color: var(--foreground); font-family: Georgia, 'Times New Roman', serif; font-size: 1.28rem; font-weight: 500; }
.${i}-memory-layers { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .55rem; }
.${i}-memory-layers article { display: grid; grid-template-columns: auto 1fr; gap: .05rem .48rem; border: 1px solid var(--border); border-radius: .72rem; padding: .65rem .72rem; background: color-mix(in srgb, var(--background) 74%, transparent); }
.${i}-memory-layers article > span { grid-row: 1 / span 2; color: color-mix(in srgb, var(--primary) 72%, var(--muted-foreground)); font: 700 .58rem/1.35 ui-monospace, monospace; }
.${i}-memory-layers strong { font-size: .7rem; }
.${i}-memory-layers p { margin: 0; color: var(--muted-foreground); font-size: .62rem; line-height: 1.35; }
.${i}-memory-health { display: flex; align-items: center; gap: .7rem; border: 1px solid color-mix(in srgb, #d59a34 50%, var(--border)); border-radius: .72rem; padding: .66rem .78rem; background: color-mix(in srgb, #d59a34 9%, var(--background)); }
.${i}-memory-health > span { color: #d59a34; font-size: 1.2rem; }
.${i}-memory-health > div { flex: 1; min-width: 0; }
.${i}-memory-health strong { font-size: .72rem; }
.${i}-memory-health p { margin: .08rem 0 0; color: var(--muted-foreground); font-size: .62rem; }
.${i}-memory-toolbar { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; }
.${i}-memory-toolbar input { flex: 1 1 12rem; min-width: 0; }
.${i}-memory-toolbar input, .${i}-memory-toolbar select { min-height: 2.25rem; border: 1px solid var(--border); border-radius: .58rem; padding: .42rem .62rem; background: var(--background); color: var(--foreground); font-size: .72rem; }
.${i}-memory-tabs { display: flex; gap: .18rem; border: 1px solid var(--border); border-radius: .6rem; padding: .2rem; background: var(--muted); }
.${i}-memory-tabs button { border: 0; border-radius: .4rem; padding: .38rem .62rem; background: transparent; color: var(--muted-foreground); font-size: .68rem; cursor: pointer; }
.${i}-memory-tabs button[data-active="true"] { background: var(--background); color: var(--foreground); box-shadow: 0 1px 4px color-mix(in srgb, #000 12%, transparent); }
.${i}-memory-section { display: flex; flex-direction: column; gap: .55rem; }
.${i}-memory-section-head { display: flex; align-items: center; justify-content: space-between; gap: .6rem; }
.${i}-memory-section-head > div { display: flex; align-items: center; gap: .48rem; min-width: 0; }
.${i}-memory-section-head h3 { margin: 0; font-size: .78rem; }
.${i}-memory-section-head > span { color: var(--muted-foreground); font-size: .62rem; }
.${i}-memory-orb { display: grid; place-items: center; width: 1.55rem; height: 1.55rem; border-radius: 50%; font-size: .72rem; }
.${i}-memory-orb[data-kind="passing"] { background: color-mix(in srgb, #60a5fa 16%, transparent); color: #60a5fa; }
.${i}-memory-orb[data-kind="durable"] { background: color-mix(in srgb, #e5b94b 17%, transparent); color: #dcae35; }
.${i}-memory-orb[data-kind="archive"] { background: color-mix(in srgb, var(--primary) 15%, transparent); color: var(--primary); }
.${i}-memory-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 18rem), 1fr)); gap: .62rem; }
.${i}-memory-card { display: flex; flex-direction: column; gap: .58rem; min-width: 0; border: 1px solid var(--border); border-radius: .82rem; padding: .8rem; background: color-mix(in srgb, var(--popover) 94%, transparent); box-shadow: 0 5px 20px color-mix(in srgb, #000 6%, transparent); }
.${i}-memory-card[data-kind="passing"] { border-left: 3px solid color-mix(in srgb, #60a5fa 72%, var(--border)); }
.${i}-memory-card[data-kind="durable"] { border-left: 3px solid color-mix(in srgb, #e5b94b 78%, var(--border)); }
.${i}-memory-card-top { display: flex; align-items: center; justify-content: space-between; gap: .5rem; color: var(--muted-foreground); font-size: .6rem; }
.${i}-memory-pill { overflow: hidden; border-radius: 999px; padding: .2rem .42rem; background: color-mix(in srgb, var(--primary) 11%, var(--muted)); color: color-mix(in srgb, var(--primary) 82%, var(--foreground)); font-weight: 750; text-overflow: ellipsis; white-space: nowrap; }
.${i}-memory-text { margin: 0; color: var(--foreground); font-family: Georgia, 'Times New Roman', serif; font-size: .9rem; line-height: 1.45; }
.${i}-memory-card dl { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: .38rem; margin: 0; }
.${i}-memory-card dl > div { min-width: 0; border-top: 1px solid color-mix(in srgb, var(--border) 70%, transparent); padding-top: .38rem; }
.${i}-memory-card dt { color: var(--muted-foreground); font-size: .55rem; font-weight: 700; letter-spacing: .06em; text-transform: uppercase; }
.${i}-memory-card dd { overflow: hidden; margin: .08rem 0 0; font-size: .66rem; text-overflow: ellipsis; }
.${i}-memory-reinforced, .${i}-memory-footnote, .${i}-memory-legacy { margin: 0; color: var(--muted-foreground); font-size: .6rem; }
.${i}-memory-card-actions { display: flex; align-items: center; justify-content: space-between; gap: .5rem; margin-top: auto; }
.${i}-memory-card-actions button, .${i}-memory-evidence button { border: 0; padding: .18rem 0; background: transparent; color: var(--primary); font-size: .64rem; font-weight: 700; cursor: pointer; }
.${i}-memory-card-actions button:last-child { color: var(--muted-foreground); }
.${i}-memory-empty { display: grid; place-items: center; min-height: 10rem; border: 1px dashed var(--border); border-radius: .82rem; padding: 1rem; text-align: center; color: var(--muted-foreground); }
.${i}-memory-empty span { color: var(--primary); font-size: 1.35rem; }
.${i}-memory-empty h3 { margin: .25rem 0 0; color: var(--foreground); font-size: .82rem; }
.${i}-memory-empty p { margin: .15rem 0 0; font-size: .68rem; }
.${i}-memory-evidence { display: flex; flex-direction: column; gap: .58rem; border: 1px solid color-mix(in srgb, var(--primary) 28%, var(--border)); border-radius: .82rem; padding: .82rem; background: color-mix(in srgb, var(--primary) 4%, var(--background)); }
.${i}-memory-evidence > p { margin: 0; color: var(--muted-foreground); font-size: .64rem; }
.${i}-memory-evidence ol { display: grid; gap: .42rem; margin: 0; padding: 0; list-style: none; }
.${i}-memory-evidence li { border-left: 2px solid color-mix(in srgb, var(--primary) 46%, var(--border)); padding: .45rem .55rem; background: color-mix(in srgb, var(--popover) 88%, transparent); font-size: .72rem; line-height: 1.45; }
.${i}-memory-evidence li > span { display: flex; align-items: baseline; justify-content: space-between; gap: .5rem; margin-bottom: .16rem; }
.${i}-memory-evidence small { color: var(--muted-foreground); font-size: .56rem; font-weight: 400; }
@media (max-width: 700px) {
  .${i}-memory-hero { grid-template-columns: 1fr; }
  .${i}-memory-layers { grid-template-columns: 1fr; }
  .${i}-memory-stats { grid-template-columns: repeat(3, minmax(0, 1fr)); }
  .${i}-memory-toolbar > input { order: -1; flex-basis: 100%; }
  .${i}-memory-section-head > span { display: none; }
}
.${i}-wish-card {
  padding: .625rem .75rem; border: 1px solid var(--border); border-radius: .5rem;
  background: var(--background); font-size: .75rem; line-height: 1.4;
}
.${i}-wish-card p { margin: 0; }
.${i}-wish-card p + p { margin-top: .25rem; }
.${i}-wish-text { color: var(--foreground); font-weight: 600; }
.${i}-wish-tell { color: var(--muted-foreground); }
.${i}-wish-meta { color: var(--muted-foreground); font-size: .6875rem; }
/*
  The schedules panel's own explanation, shut.

  The panel used to open with three paragraphs of prose, and print the whole
  translation prompt under every villager, before a reader had seen an hour of
  anybody's day: the answers sat below the documentation for them. The prose and
  the prompt are what a reader reaches for when a row reads wrong, so they are
  kept exactly as they were written and put behind a disclosure rather than cut.
  What stays open is the week itself \u2014 the name, the badges, the timetable, and
  the two labelled lines inside each block \u2014 so the panel reads as a week first
  and as an explanation second.

  The summary is a button and the marker is hidden for the same reason the news
  toggle hides its own: the browser's triangle cannot be sized, coloured or placed
  with the rest of the control, and the button already says it can be pressed. The
  body carries no frame of its own because what is inside it does \u2014 the sentences
  are prose and the prompt is a scroll box of its own.
*/
.${i}-agenda-notes { margin: 0 0 .625rem; }
.${i}-agenda-notes > summary {
  display: inline-flex; align-items: center; gap: .3125rem;
  list-style: none; cursor: pointer;
}
.${i}-agenda-notes > summary::-webkit-details-marker { display: none; }
.${i}-agenda-notes > summary::marker { content: ""; }
.${i}-agenda-notes[open] > summary { border-color: var(--primary); color: var(--primary); }
.${i}-agenda-notes-body { display: flex; flex-direction: column; gap: .5rem; margin: .4375rem 0 0; }
/*
  A day the Engine's week has nothing in, drawn as an absence. Muted rather than
  coloured and italic rather than plain, because it is the one row in this list
  that is not an event: the label above it is a real day and the hours under it
  really are empty, so the row that says so has to look like a note rather than
  like something a villager is doing.
*/
.${i}-story-blank { color: var(--muted-foreground); font-style: italic; opacity: .75; }
.${i}-row { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; margin-top: .75rem; }

/*
  The week, resident by resident, shut.

  Every resident is a disclosure and every one of them starts shut, because the
  panel is opened to CHECK one week rather than to read a village: shut, it is a
  list of names with their state beside them, which is the question a reader
  arrives with. The summary carries the heading's type rather than a button's,
  because it is a heading rather than a control, and the browser's own triangle is
  hidden for the reason the news toggle hides its own: it cannot be sized or
  placed with the rest of the control.

  The frame is the sheet's ordinary border and background, so an open resident
  reads as one card among several rather than as a run-on list.
*/
.${i}-week {
  display: block; margin: 0 0 .5rem; padding: .5rem .625rem;
  border: 1px solid var(--border); border-radius: .5rem; background: var(--card);
}
.${i}-week-toggle {
  display: flex; flex-wrap: wrap; align-items: center; gap: .375rem;
  list-style: none; cursor: pointer;
}
.${i}-week-toggle::-webkit-details-marker { display: none; }
.${i}-week-toggle::marker { content: ""; }
.${i}-week-head {
  flex: 1 1 auto; min-width: 0; margin: 0;
  font-size: .6875rem; font-weight: 600; letter-spacing: .04em;
  text-transform: uppercase; color: var(--muted-foreground);
}
.${i}-week-toggle:hover > .${i}-week-head,
.${i}-week[open] > .${i}-week-toggle > .${i}-week-head { color: var(--primary); }
.${i}-week-body { display: flex; flex-direction: column; margin-top: .5rem; }

.${i}-agenda-list { display: grid; gap: .5rem; }
.${i}-agenda-actions { display: flex; flex-wrap: wrap; align-items: center; gap: .75rem; margin: .75rem 0 .25rem; }
.${i}-agenda-switch { display: inline-flex; align-items: center; gap: .4rem; font-size: .75rem; cursor: pointer; }
.${i}-agenda-switch input { accent-color: var(--primary); }
.${i}-agenda-days { display: grid; gap: .35rem; margin-top: .5rem; }
.${i}-agenda-day { border: 1px solid var(--border); border-radius: .375rem; padding: .35rem .5rem; }
.${i}-agenda-day > summary { cursor: pointer; font-size: .75rem; font-weight: 600; }
.${i}-agenda-compare { display: grid; gap: .75rem; padding-top: .5rem; }
.${i}-agenda-compare[data-comparison="true"] { grid-template-columns: repeat(2, minmax(0, 1fr)); }
.${i}-agenda-compare section { min-width: 0; }
.${i}-agenda-compare h4 { margin: 0 0 .35rem; font-size: .7rem; color: var(--muted-foreground); }
.${i}-agenda-blocks { display: grid; gap: .3rem; margin: 0; padding: 0; list-style: none; }
.${i}-agenda-blocks li { display: grid; grid-template-columns: 7.2rem minmax(0, 1fr); gap: .1rem .5rem; padding: .4rem .5rem; border-radius: .3rem; background: var(--muted); font-size: .7rem; line-height: 1.35; }
.${i}-agenda-blocks time { grid-row: span 4; white-space: nowrap; font-variant-numeric: tabular-nums; color: var(--muted-foreground); }
.${i}-agenda-blocks strong { font-weight: 600; }
@container ${i} (max-width: 35rem) {
  .${i}-agenda-compare[data-comparison="true"] { grid-template-columns: minmax(0, 1fr); }
  .${i}-agenda-blocks li { grid-template-columns: minmax(0, 1fr); }
  .${i}-agenda-blocks time { grid-row: auto; }
}

/*
  The founding wizard is two columns: the questions on the left and the map
  beside them on the right, so the player can answer and mark their own houses
  without either one being drawn over the other. The columns are measured in rem
  and allowed to wrap, which is what keeps the wizard honest when the Engine's
  own side panels open: the room the tab has shrinks with them, and past a point
  the map drops underneath the questions instead of squeezing to a sliver beside
  them. The homepage does not use them; it is the map.
*/
/* Both of these are the root's own two numbers at a smaller share of them, so a
   narrow tab tightens every screen at once rather than one screen at a time. */
.${i}-home {
  gap: calc(var(--${i}-gap) * .75);
  padding: calc(var(--${i}-pad) * .8);
  overflow-y: auto;
}
.${i}-home-body { display: flex; flex-wrap: wrap; align-items: flex-start; gap: .75rem; }
.${i}-setup-map-shell { position: relative; flex: 1 1 26rem; min-width: 0; }
.${i}-setup-map-viewport {
  width: 100%; overflow: auto; border: 2px solid color-mix(in srgb, var(--primary) 45%, var(--border));
  border-radius: .875rem; background: color-mix(in srgb, var(--popover) 80%, #111827);
  box-shadow: 0 0 0 3px color-mix(in srgb, var(--primary) 12%, transparent), 0 .75rem 2rem rgba(0, 0, 0, .3);
}
.${i}-setup-map-viewport > .${i}-stage:not(.${i}-stage-compact) { width: 100%; flex: none; border: 0; }
.${i}-home-map-viewport { flex: 1 1 auto; min-width: 0; width: 100%; height: 100%; display: flex; align-items: center; justify-content: center; overflow: visible; }
.${i}-reason-options { display: flex; flex-wrap: wrap; gap: .5rem .875rem; margin-top: .375rem; }
.${i}-field:where(fieldset) { border: 0; padding: 0; min-width: 0; }
.${i}-reason-option { display: inline-flex; align-items: center; gap: .35rem; font-size: .75rem; cursor: pointer; }
.${i}-debug-label { color: #ff465f; font-weight: 800; letter-spacing: .06em; }
.${i}-side { display: flex; flex-direction: column; gap: .75rem; flex: 1 1 18rem; min-width: 0; }
/*
  The homepage is the map, and the map is the whole tab. The map's shape is its
  own \u2014 a fixed ratio that comes from the settings, not from whatever shape this
  tab happens to be \u2014 so this row gives it the room it has left over and lets
  the space it does not fill show, rather than stretching the picture into a
  shape no map has.

  A row of two columns: the village's news down the left, the map in what is
  left. Both are children of this row, so the news is never drawn over the
  picture. The old shape was neither \u2014 the news was a window laid on top of a
  tab-wide map, which only looked right while the tab was wide enough for the
  map to be shorter than it and leave a gutter on each side. The Engine's own
  side panels narrow the tab until the map fills it edge to edge, and then the
  window landed on the picture. A row cannot do that: whatever width the tab
  has, the news takes its share and the map is fitted to the rest.

  The news is the only thing in this row besides the map. The readout and the
  notices are not in the row at all \u2014 they are drawn inside the map's own frame,
  because the frame is the only box whose corner is the picture's corner.

  There is no min-height floor. A floor taller than the visible tab is a floor
  the map is fitted against and then cropped by the overflow below \u2014 the map
  would be measured against a box bigger than the one it is seen in, and the
  bottom of the picture, and the pins on it, would be behind the tab's edge.
  A short tab is meant to give a small map, not a cut-off one.

  The two numbers next to this comment are the map's whole frame: the wood is
  the thickness of the wooden frame and the mat the margin inside it. They are
  written down once here and read everywhere they are needed, so the frame and
  the room that keeps it clear of the tab's edge cannot disagree.

  The shared bar takes its own row above the map on both phone and desktop, so
  its controls cannot cover a place pinned near the map's top edge.
*/
.${i}-home-full {
  --${i}-map-wood: .75rem;
  --${i}-map-mat: .5rem;
  position: relative;
  box-sizing: border-box;
  display: flex; flex-direction: column; align-items: stretch;
  gap: .5rem;
  height: 100%; min-height: 0;
  padding: .5rem; overflow: hidden;
}
/*
  The space below the controls is the box the desktop map is fitted against.
  The frame stays centered in it; notices belong to the frame itself.

  The padding is the buffer the wooden frame is drawn into. It is the wood and
  the mat plus a pixel, which is exactly enough for the frame to exist without
  ever reaching the edge of a box that clips its overflow, and it is written as
  that sum rather than as a length so it stays true if either is retuned. The
  frame is drawn outwards from the picture, so this padding is the frame's own
  width and a pixel of clearance, and the picture itself is unchanged by it.
*/
.${i}-room {
  position: relative;
  flex: 1 1 auto; min-width: 0; min-height: 0;
  display: flex; align-items: center; justify-content: center;
  padding: calc(var(--${i}-map-wood) + var(--${i}-map-mat) + 1px);
}
/*
  The frame's border and rounding belong to the wizard, where the map shares the
  tab with the questions. On the homepage the wood replaces both, so this rule
  takes them away.

  No width is stated here on purpose. The measurement gives the frame BOTH of
  its sides inline, and a width would fight it: a frame left to the room's width
  alone is a frame taller than the room, and a frame taller than the room is a
  frame the map is cropped to fill \u2014 which is how four houses on the four
  corners of the map went missing.

  The clipping this frame used to do has not gone anywhere, it moved down to the
  picture's own layer, which is the same box. Splitting it that way is what lets
  the wood be drawn outside the frame while a pin on a corner house is still cut
  off at the edge of the map rather than floating over the wood.

  isolation makes this frame a stacking context, which is what keeps the two
  wood layers behind the picture. Without it a layer at a negative depth is not
  contained by anything here and paints behind whatever it finds further up \u2014
  the wood would still be in the file and nowhere on the screen.
*/
.${i}-home-full .${i}-stage {
  flex: 0 0 auto;
  border: 0; border-radius: 0;
  overflow: visible;
  isolation: isolate;
}
/*
  Until the picture has been read there is no shape to fit it to, so there is
  nothing to measure and no inline size to fall back on: the frame takes the
  column's width instead of letting the picture's own width decide it, which
  would be a frame as wide as the file and wider than the tab.
*/
.${i}-home-full .${i}-stage:not([data-shaped="true"]) { width: 100%; }
.${i}-home-full .${i}-canvas {
  overflow: hidden;
  z-index: 1;
}
/*
  The wooden frame, drawn outside the map's box rather than inside it.

  Outside, because a frame drawn inside would have to come out of the picture,
  and the picture is the map: a frame inside it would crop the map or mat it,
  and would move every pin as it did. Grown outwards, the map's box stays
  exactly the map, and nothing about where a house sits changes.

  Two layers because a picture frame has two faces \u2014 the wood itself, and the
  mat inside it that keeps the picture off the wood. The mat is painted second
  and so covers the wood's inner edge, which is what leaves the wood showing as
  a ring. A single layer would be a solid slab behind the map.

  The grain is a set of repeating gradients \u2014 plank bands down the frame crossed
  by finer, uneven ones \u2014 which is as much wood as a band this thin can hold.
  The insets are written as sums of the same two numbers the frame's thickness
  and the room's buffer are made of, so the wood always fits the space it is
  given: this is the one place the two must not drift apart.

  Scoped to the homepage's frame. The wizard and the town map editor keep the
  plain border they have always had.
*/
.${i}-home-full .${i}-stage::before,
.${i}-home-full .${i}-stage::after {
  content: "";
  position: absolute;
  z-index: -1;
  pointer-events: none;
}
.${i}-home-full .${i}-stage::before {
  inset: calc(-1 * (var(--${i}-map-wood) + var(--${i}-map-mat)));
  border-radius: .625rem;
  background:
    repeating-linear-gradient(90deg, rgba(0, 0, 0, .18) 0 1px, rgba(0, 0, 0, 0) 1px 11px),
    repeating-linear-gradient(90deg, rgba(255, 255, 255, .06) 0 1px, rgba(255, 255, 255, 0) 1px 29px),
    linear-gradient(168deg, #a97641 0%, #8a5c2c 30%, #96683a 52%, #744a20 78%, #8d5f31 100%);
  box-shadow:
    inset 0 0 0 1px rgba(0, 0, 0, .35),
    inset 0 0 0 3px rgba(255, 255, 255, .055),
    0 .5rem 1.5rem rgba(0, 0, 0, .34);
}
.${i}-home-full .${i}-stage::after {
  inset: calc(-1 * var(--${i}-map-mat));
  border-radius: .375rem;
  background: color-mix(in srgb, var(--popover) 86%, #c08b4e);
  box-shadow: inset 0 0 0 1px rgba(0, 0, 0, .22);
}
.${i}-places-picker { position: relative; pointer-events: auto; }
.${i}-places-list {
  position: absolute; top: calc(100% + .375rem); left: 0; z-index: 10;
  display: flex; flex-direction: column; gap: .375rem;
  min-width: min(19rem, 80vw); max-width: min(24rem, 90vw); max-height: 60vh; overflow: auto;
  padding: .5rem; border: 1px solid var(--border); border-radius: .625rem;
  background: var(--popover); box-shadow: 0 .375rem 1rem rgba(0, 0, 0, .28);
}
.${i}-places-list-row { display: flex; flex-wrap: wrap; align-items: center; gap: .375rem; }
.${i}-places-list-name { flex: 1 1 100%; font-size: .8125rem; font-weight: 600; }
/* A button whose whole content is a drawn glyph: square, with the glyph centred
   in it rather than sitting on a text baseline it has none of. */
.${i}-icon-button {
  display: inline-flex; align-items: center; justify-content: center;
  padding: .3125rem; line-height: 0;
}
.${i}-icon-button svg { display: block; width: 1rem; height: 1rem; }
/*
  Anything that went wrong, said in the corner rather than in a bar: there is no
  footer on the map, so this is the only place it can be said, and it is only
  ever there while there is something to say.

  It belongs to the picture, so it stays in the frame's lower corner while the
  clock and controls stay above the map.
*/
.${i}-notice {
  position: absolute; bottom: .5rem; left: .5rem; z-index: 2;
  display: flex; flex-direction: column; gap: .375rem;
  max-width: min(30rem, 75%); pointer-events: none;
}
.${i}-notice .${i}-status,
.${i}-notice .${i}-error {
  border: 1px solid var(--border); border-radius: .5rem;
  background: color-mix(in srgb, var(--popover) 92%, transparent);
  padding: .3125rem .5rem;
}
/*
  The village's news, behind a button in the shared bar above the map.

  It used to be a column of the homepage: a permanent gutter down one side of
  the map, holding a list that is usually short and often empty. A column that is
  always there is a column the map always pays for, and on a phone held sideways
  there is no width to pay it with \u2014 the map would have been fitted to whatever
  the news left of the tab, which is a strange thing for reading the news to do.

  So the news is a disclosure instead. The button says the feed is there and the
  panel unrolls beneath it, over the picture: it costs the map nothing while it
  is shut and covers a corner of it while it is open. What the rail said is still
  said; it is said on request.

  A details element rather than a button and a box of state, because the
  open-and-shut flag, the keyboard behaviour and the expanded-or-collapsed
  announcement are all the element's own and none of them can drift out of step
  with the panel. What it does not do by itself is shut when the player presses
  somewhere else, which is the one thing the component adds: a panel that can
  only be dismissed by finding the button again sits over the game while the game
  is being played.

  Hung below its own button rather than centred on the map, so the panel opens
  where the button is. Both of its limits are shares of the tab rather than
  lengths, so a small tab gets a panel that fits and scrolls instead of one
  taller or wider than the screen it is on.
*/
.${i}-news { position: relative; }
.${i}-news-toggle { display: inline-flex; align-items: center; gap: .3125rem; list-style: none; }
.${i}-news-toggle svg { display: block; flex: 0 0 auto; width: 1rem; height: 1rem; }
/* The browser's own disclosure triangle: a character that cannot be sized,
   coloured or placed with the rest of the button. The button is the affordance;
   a marker on top of it is a second one saying the same thing. */
.${i}-news-toggle::-webkit-details-marker { display: none; }
.${i}-news-toggle::marker { content: ""; }
.${i}-news[open] > .${i}-news-toggle { border-color: var(--primary); color: var(--primary); }
.${i}-news-panel {
  position: absolute; top: calc(100% + .375rem); right: 0; z-index: 4;
  box-sizing: border-box; width: min(20rem, 72cqw);
  max-height: min(24rem, 60cqh);
  overflow-y: auto;
  display: flex; flex-direction: column; gap: .375rem;
  border: 1px solid var(--border); border-radius: .625rem;
  background: var(--popover);
  padding: .5rem .625rem;
  box-shadow: 0 .5rem 1.5rem rgba(0, 0, 0, .28);
}
.${i}-news-title {
  margin: 0; font-size: .6875rem; font-weight: 600;
  text-transform: uppercase; letter-spacing: .04em;
  color: var(--muted-foreground);
}
.${i}-news-list { margin: 0; padding: 0; list-style: none; display: grid; gap: .375rem; }
.${i}-news-item { font-size: .75rem; line-height: 1.5; color: var(--muted-foreground); }
.${i}-news-empty {
  margin: 0; font-size: .75rem; line-height: 1.5; color: var(--muted-foreground);
}
.${i}-mapbar {
  display: flex; flex-wrap: wrap; align-items: center; gap: .375rem;
  border: 1px solid var(--border); border-radius: .75rem;
  background: var(--popover); padding: .5rem .625rem;
}
.${i}-mapbar-title { font-size: .8125rem; font-weight: 600; }
/*
  The map's own frame: beside the wizard's questions, in a column of prose, or
  filling the homepage. Its shape is the map's rather than the container's \u2014 the
  ratio is set inline from the picture size the settings named \u2014 so the same
  picture is drawn at the same shape everywhere, and a picture that is not that
  shape is cropped, stretched or letterboxed inside it by choice rather than by
  accident. The frame's background is what shows wherever the picture is not:
  the part of the frame that is not the picture should not look like somewhere a
  house can go. MapStage measures the frame and the picture separately and pins
  the homes to the picture.
*/
.${i}-stage {
  position: relative;
  flex: 1 1 26rem; min-width: 0;
  border: 1px solid var(--border); border-radius: .75rem;
  overflow: hidden;
  background: color-mix(in srgb, var(--muted-foreground) 12%, var(--background));
}
/*
  Before the settings name the map's shape there is no shape to be, so the frame
  stands at a usable height rather than at nothing. Once the settings arrive the
  ratio set inline takes over and the height follows the width, the way a
  picture's does.
*/
.${i}-stage:not([data-shaped="true"]) { min-height: 14rem; }
/* A stand-in for the map rather than the map itself: the same picture at the same
   shape, small enough to sit beside a column of prose. */
.${i}-stage-compact { flex: 0 1 auto; width: min(100%, 22rem); align-self: center; }
.${i}-canvas { position: absolute; inset: 0; }
.${i}-stage[data-empty="true"] .${i}-canvas {
  background:
    radial-gradient(circle at 20% 28%, color-mix(in srgb, var(--primary) 12%, transparent) 0 2%, transparent 2.25%),
    radial-gradient(circle at 73% 68%, color-mix(in srgb, var(--primary) 10%, transparent) 0 3%, transparent 3.25%),
    linear-gradient(24deg, transparent 47%, color-mix(in srgb, var(--border) 65%, transparent) 48% 52%, transparent 53%),
    color-mix(in srgb, var(--muted) 55%, var(--background));
}
.${i}-canvas-empty {
  position: absolute; right: .625rem; bottom: .5rem;
  color: var(--muted-foreground); font-size: .6875rem;
}
.${i}-canvas[data-placing="true"] { cursor: crosshair; }
.${i}-canvas[data-dragging="true"] { cursor: grabbing; }
.${i}-stage[data-framing="true"] .${i}-canvas { cursor: grab; touch-action: none; }
.${i}-stage[data-framing="true"] .${i}-canvas[data-dragging="true"] { cursor: grabbing; }
.${i}-canvas-img {
  display: block; width: 100%; height: 100%;
  object-fit: contain;
  user-select: none;
}
/*
  The framing editor's controls. Sat outside the frame rather than in it so a
  press on one of them is not also the start of a drag, and drawn small at the
  foot of the frame so what they change stays visible while they change it.
*/
.${i}-zoom {
  position: absolute; right: .5rem; bottom: .5rem; z-index: 3;
  display: flex; gap: .25rem;
}
.${i}-zoom-button {
  border: 1px solid var(--border); border-radius: .375rem;
  background: color-mix(in srgb, var(--popover) 92%, transparent);
  color: inherit; font: inherit; font-size: .6875rem; line-height: 1;
  padding: .3125rem .4375rem; cursor: pointer;
}
.${i}-zoom-button:disabled { opacity: .5; cursor: default; }
.${i}-canvas-missing {
  position: absolute; inset: 0; display: flex; align-items: center; justify-content: center;
  padding: 1rem; text-align: center; font-size: .8125rem; line-height: 1.45;
  color: var(--muted-foreground);
}
.${i}-pin-holder { position: absolute; transform: translate(-50%, -50%); display: flex; align-items: center; gap: .125rem; }
.${i}-pin {
  display: flex; align-items: center; gap: .25rem;
  border: 1px solid var(--primary); border-radius: 999px;
  background: color-mix(in srgb, var(--background) 88%, transparent);
  color: var(--foreground);
  padding: .125rem .4375rem .125rem .25rem;
  font: inherit; font-size: .6875rem; line-height: 1.6; cursor: pointer;
  white-space: nowrap;
}
.${i}-pin:hover { color: var(--primary); }
.${i}-pin:disabled { cursor: default; color: var(--muted-foreground); }
.${i}-pin[data-selected="true"] { box-shadow: 0 0 0 2px color-mix(in srgb, var(--primary) 45%, transparent); }
.${i}-pin[data-tone="player"] { border-color: var(--primary); }
.${i}-pin[data-tone="empty"] {
  border-style: dashed; border-color: var(--muted-foreground); color: var(--muted-foreground);
}
/*
  A place that is not a house: a shop, a harbour, the mill pond. The plainest
  thing on the map, in the ordinary border colour, because all it has to do is be
  read \u2014 there is nothing behind it to press yet.
*/
.${i}-pin[data-tone="venue"] { border-color: var(--border); }
/*
  Somebody standing at a place rather than the place itself.

  Dimmer than the building and drawn without the tack, because the tack is what
  says "there is a building here" and two things on one spot both claiming to be
  the building is the map lying about one of them. The building keeps its pin and
  the people hang underneath it, which is also the order the two answers arrive in:
  what is here, then who.
*/
.${i}-pin[data-kind="person"] {
  border-style: dotted; border-color: var(--muted-foreground); color: var(--muted-foreground);
}
.${i}-pin[data-kind="person"] .${i}-pin-tack { display: none; }
/*
  A thumbtack, because that is what the thing on a map is: something pushed
  through the paper to say a building is here. Drawn rather than taken from a
  font or an emoji, so it is the same tack on every machine the Engine runs on.
*/
.${i}-pin-tack { flex: 0 0 auto; width: 1rem; height: 1rem; color: var(--destructive, #e5484d); }
.${i}-pin-tack svg { display: block; width: 100%; height: 100%; fill: currentColor; }
.${i}-pin[data-tone="empty"] .${i}-pin-tack { color: var(--muted-foreground); }
.${i}-pin-remove {
  border: 1px solid var(--border); border-radius: 999px;
  background: color-mix(in srgb, var(--background) 88%, transparent); color: var(--muted-foreground);
  font-size: .625rem; line-height: 1; padding: .125rem .25rem; cursor: pointer;
}
.${i}-pin-remove:hover { border-color: var(--destructive, #e5484d); color: var(--destructive, #e5484d); }
/*
  DEBUG. The way back into a conversation that was closed without being ended.

  Outside the pin's own box rather than in it: the pin is placed by its centre
  on a building, and a second row inside it would move the pin up the picture by
  half of the control's height, so a house would stop being marked where it is.
  Hung below the pin's box, the pin stays exactly where it was and the control
  reads as belonging to it.

  Drawn in the destructive colour for the same reason the debug verbs in the
  drawer are: a control that is not part of the game should not be mistaken for
  one, and a player of this game never has a conversation in hand whose window is
  shut. Unlike them it is never disabled \u2014 on a locked map it is the only thing
  that answers a click, and a locked map with nothing to press is a tab that has
  to be reloaded.
*/
.${i}-pin-resume {
  position: absolute; top: calc(100% + .1875rem); left: 50%; transform: translateX(-50%);
  white-space: nowrap; cursor: pointer; font: inherit; font-size: .625rem; line-height: 1.4;
  border: 1px solid var(--destructive, #e5484d); border-radius: 999px;
  background: color-mix(in srgb, var(--background) 92%, transparent);
  color: var(--destructive, #e5484d); padding: .125rem .375rem;
}
/*
  THE TWO DOORS A PLACE WITH SOMEBODY IN IT OFFERS.

  Hung under the pin it belongs to and drawn outside the frame rather than inside
  it. The frame is the picture's box and it is also what cuts off anything that
  reaches past a corner house, so a pair of buttons under a pin near the bottom of
  the map would be half a pair of buttons. The offsets are set inline from the same
  two numbers the pin above is placed with, so the list opens exactly under its own
  pin at every size the picture is drawn at.

  The step down is a length rather than a share of the picture on purpose: what it
  has to clear is a pin, and a pin is a fixed size however large the map is.

  A list rather than one button, because the two answers are genuinely different.
  Looking at a place and walking in to talk to whoever is standing in it are two
  things a player can want, and the map used to decide between them: a pin with one
  person behind it opened their conversation and skipped the place entirely, so a
  house with somebody in it could not be looked at. A card rather than two loose
  pills, because the pair belongs to one pin and has to read as one thing.
*/
.${i}-doors {
  position: absolute; z-index: 4;
  transform: translate(-50%, 2.75rem);
  display: flex; flex-direction: column; align-items: stretch; gap: .1875rem;
  border: 1px solid var(--border); border-radius: .5rem;
  background: color-mix(in srgb, var(--popover) 96%, transparent);
  padding: .25rem;
  box-shadow: 0 .375rem 1rem rgba(0, 0, 0, .28);
}
.${i}-door {
  white-space: nowrap; cursor: pointer;
  font: inherit; font-size: .6875rem; line-height: 1.6;
  border: 1px solid var(--border); border-radius: 999px;
  background: color-mix(in srgb, var(--background) 88%, transparent);
  color: var(--foreground); padding: .125rem .625rem;
}
.${i}-door:hover { border-color: var(--primary); color: var(--primary); }
/* A card, whether it is the wizard's questions or an option open in the Menu. */
.${i}-overlay {
  display: flex; flex-direction: column; gap: .625rem;
  border: 1px solid var(--border); border-radius: .75rem;
  background: var(--popover); padding: .875rem 1rem;
}
.${i}-overlay-head { display: flex; align-items: center; gap: .5rem; }
.${i}-overlay-head > .${i}-panel-title { flex: 1 1 auto; margin: 0; }

/* The founding wizard. */
.${i}-steps { display: flex; flex-wrap: wrap; gap: .375rem; }
/*
  A chip that says where something has got to: which step of the wizard, or
  which of the three fits a picture is drawn with. Only the ones that are
  really a control say so, by carrying the data-clickable attribute \u2014 a chip
  that answers the cursor and then does nothing when it is clicked is a promise
  the strip cannot keep. That is why the wizard's own chips are not controls.
*/
.${i}-step {
  font: inherit; font-size: .6875rem; color: var(--muted-foreground);
  border: 1px solid var(--border); border-radius: 999px;
  background: color-mix(in srgb, var(--background) 85%, transparent);
  padding: .1875rem .5rem;
}
.${i}-step[data-clickable="true"] { cursor: pointer; }
.${i}-step[data-clickable="true"]:hover { border-color: var(--primary); color: var(--primary); }
.${i}-step[data-active="true"] { border-color: var(--primary); color: var(--primary); }
.${i}-step[data-done="true"] { border-color: color-mix(in srgb, var(--primary) 45%, transparent); }
.${i}-home-row {
  display: flex; flex-wrap: wrap; align-items: center; gap: .5rem;
  border: 1px solid var(--border); border-radius: .5rem; padding: .4375rem .5rem;
}
.${i}-home-row[data-selected="true"] { border-color: var(--primary); }
.${i}-home-list { display: flex; flex-direction: column; gap: .375rem; margin-top: .625rem; }
.${i}-home-index {
  flex: 0 0 auto; display: flex; align-items: center; justify-content: center;
  width: 1.25rem; height: 1.25rem; border-radius: 999px;
  border: 1px solid var(--border); font-size: .625rem; color: var(--muted-foreground);
}
/*
  What the house IS, straight from the village's own catalogue. Drawn as a
  fixed chip rather than a field because there is nothing here to answer \u2014 the
  question the row asks is who lives in it. The class rides along beside the
  name so "housing" is visible rather than merely stored.
*/
.${i}-building {
  flex: 0 0 auto; display: flex; align-items: center; gap: .375rem;
  border: 1px solid var(--border); border-radius: 999px;
  background: color-mix(in srgb, var(--muted-foreground) 10%, transparent);
  padding: .125rem .5rem; font-size: .6875rem; color: var(--muted-foreground);
}
.${i}-select {
  box-sizing: border-box; max-width: 100%;
  border: 1px solid var(--border); border-radius: .5rem;
  background: var(--background); color: var(--foreground);
  padding: .3125rem .375rem; font-size: .75rem; font-family: inherit;
}
.${i}-who { font-size: .75rem; color: var(--muted-foreground); min-width: 5rem; }
.${i}-danger { border-color: color-mix(in srgb, var(--destructive, #e5484d) 45%, transparent); color: var(--destructive, #e5484d); }
.${i}-spacer { flex: 1 1 auto; }
.${i}-file { max-width: 100%; font-size: .6875rem; color: var(--muted-foreground); }

/*
  ==============================================================================
  THE TAB ITSELF, AND WHAT IT DOES WHEN THE SCREEN IS A PHONE
  ==============================================================================
*/

/*
  THE HOST, WHICH IS THE ONE BOX EVERY SIZE IN THIS SHEET IS MEASURED AGAINST.

  The Engine makes this element and gives it the classes it was mounted with \u2014
  block, h-full, min-h-0, w-full, from the Home hub \u2014 and nothing else: there is
  no class on it carrying this package's name. So the rules for it are written
  against the TAG, which is the only thing on the element that is ours to name.
  The old .marinara-capability-villages rule was a class the element never had:
  dead on arrival, and the tab stood up anyway only because Tailwind happened to
  say the same three things.

  container-type: size is what makes the tab answerable to the room it was
  actually given rather than to the window. This package is mounted in a tab that
  shares the screen with the Engine's own furniture, and in fullscreen it has the
  whole screen instead \u2014 no viewport query can tell those two apart. A phone held
  sideways is 844x390 and a laptop is 1400x760, so the width is not the telling
  difference and the height is, which is why this is size and not inline-size and
  why the queries at the foot of this sheet ask about both.

  Containment means this element's own size can no longer come from its children,
  which is why the height is stated here outright rather than left to whatever
  mounted it. An element one hundred percent of a definite box is itself
  definite \u2014 the hub's main is flex-1 and this element is h-full inside it \u2014 and
  an element whose percentage ever resolved to auto would now collapse to nothing
  instead of falling back to the size of its content.

  ponytail: that is the ceiling of this line. If this tab is ever mounted into a
  box with no definite height, this is the rule to look at first.

  text-size-adjust is the same argument made the other way round: a phone browser
  will otherwise inflate the text of a page it decides is too small to read, block
  by block and by its own rules, which changes a layout nobody measured and cannot
  be seen from inside this file.
*/
${i} {
  display: block;
  height: 100%;
  min-height: 0;
  container-type: size;
  container-name: ${i};
  text-size-adjust: 100%;
  -webkit-text-size-adjust: 100%;
}

/*
  FULLSCREEN.

  The HOST goes fullscreen, and only the host. It is the one node the Engine does
  not re-make when the tab re-renders, so it is the one node that can hold the
  whole screen while everything inside it is replaced; put the screen on an inner
  box and the next render throws the fullscreen state away with the box. That is
  also why there is no state here: the browser is already keeping the answer, and
  document.fullscreenElement reads it back.

  One toggle and not two. GachaForge draws a button in its header bar and a second
  one in the corner of its stage, because its header can be pushed off screen;
  this tab's controls live on the picture and travel with it, so the one button is
  always where it was and there is nothing for a second one to cover.

  The map is not stretched to fill the screen, and that is the whole point of
  asking for it: MapStage measures the room it was given and fits the frame to its
  own ratio, so a bigger room gives a bigger map. Filling and fitting are the same
  thing on a 16:9 monitor and are not on a phone, where stretching the height
  would fatten every pin away from the house it was put on.

  The background is stated because a fullscreen element keeps a transparent
  background and the browser paints its own black backdrop behind it: without
  this, every letterboxed inch around the picture would be black rather than the
  Engine's surface.

  The safe-area insets are for the notch, which on a phone held sideways is on the
  LEFT or the RIGHT edge and upright is along the TOP \u2014 and sideways is where the
  chat drawer's own header sits while upright is where the map's controls are now
  drawn. All four sides are written for that reason: which pair matters depends on
  the way up the phone is, and on a phone that is not a phone they are zero. They
  need the Engine's own page to declare a cover viewport to be anything but zero,
  and this package cannot set that: two numbers a package cannot import are being
  written down here a second time.
*/
${i}:fullscreen {
  background: var(--background);
  --${i}-safe-top: env(safe-area-inset-top, 0px);
  --${i}-safe-right: env(safe-area-inset-right, 0px);
  --${i}-safe-bottom: env(safe-area-inset-bottom, 0px);
  --${i}-safe-left: env(safe-area-inset-left, 0px);
}
${i}:fullscreen .${i}-root {
  padding:
    calc(var(--${i}-pad) + var(--${i}-safe-top))
    calc(var(--${i}-pad) + var(--${i}-safe-right))
    calc(var(--${i}-pad) + var(--${i}-safe-bottom))
    calc(var(--${i}-pad) + var(--${i}-safe-left));
}
${i}:fullscreen .${i}-home-full {
  padding:
    calc(var(--${i}-pad) * .6 + var(--${i}-safe-top))
    calc(var(--${i}-pad) * .6 + var(--${i}-safe-right))
    calc(var(--${i}-pad) * .6 + var(--${i}-safe-bottom))
    calc(var(--${i}-pad) * .6 + var(--${i}-safe-left));
}

/*
  \u2500\u2500 DORMANT 0.4.45 \u2014 the notice that told a phone held upright to turn over. \u2500\u2500

  This is the one rule in the sheet that decided which way up a phone had to be
  held. It is SWITCHED OFF, and it is not retired: 0.4.45 draws the tab for
  portrait, so there is nothing left for this to answer and nothing left to read
  it \u2014 the four pieces of the component that drew it are dormant beside their own
  definitions, and the RotateNotice element is dormant on the homepage. Left live,
  the media query below would match every portrait phone in the world and put a
  full-bleed panel over the village; the block is commented out for that reason
  and not for tidiness.

  It is kept rather than deleted because the decision is not final. The map is
  still a wide 19:13 surface fitted WHOLE to its frame \u2014 the frame is the two
  numbers above and the reason it is fitted rather than cropped is that a house
  on a corner of the map that nobody can see is a house nobody can open \u2014 and a
  map still wants a wide box. A later lane may decide it wants the map on its side
  again and may want to say so again.

  To bring it back: uncomment this block, uncomment the four pieces of the notice
  beside hostOf, and put the RotateNotice element back on the homepage at the foot
  of the row. Nothing else changed; the rule is exactly what it was.

  What it would take to REMOVE it rather than leave it dormant: nothing. It is a
  media query and a sentence, and neither of them is load-bearing. Delete the
  block and the four pieces when the portrait layout has been lived with and
  nobody wants the sideways map back \u2014 or delete them now, if that is already
  known to be the answer. It is left here unanswered on purpose.
*/
/*
.${i}-rotate { display: none; }
@media (orientation: portrait) and (pointer: coarse) {
  .${i}-rotate {
    position: absolute; inset: 0; z-index: 5;
    display: grid; place-content: center; justify-items: center;
    gap: .75rem;
    padding: calc(var(--${i}-pad) * 2) var(--${i}-pad);
    background: color-mix(in srgb, var(--background) 96%, transparent);
    text-align: center;
  }
}
.${i}-rotate-phone { width: 3.25rem; color: var(--primary); }
.${i}-rotate-phone svg { display: block; width: 100%; height: auto; }
.${i}-rotate-title { margin: 0; font-size: .875rem; font-weight: 600; color: var(--foreground); }
.${i}-rotate-note { margin: 0; max-width: 32ch; font-size: .8125rem; line-height: 1.5; color: var(--muted-foreground); }
*/
/*
  ON A TOUCH SCREEN, EVERY CONTROL IS AT LEAST A THUMB.

  The paddings above draw most of these controls about twenty-six pixels tall:
  comfortable to click with a mouse and too small to tap reliably with a thumb,
  and a control exists to be pressed.

  Forty-four is the number the guidance asks for and it is more than a map can pay
  everywhere \u2014 a taller row is a taller row, and the rows around these are the
  picture \u2014 so the ones that stand in a row of their own take the full amount and
  the ones that sit in a cluster take less, which is still a real improvement over
  twenty-six and still leaves the map its room.

  Only where the pointer is coarse. A finger is not a mouse and a mouse is not a
  thumb: nothing moves on a desktop.

  The square ones are centred as well, because a box grown around a glyph lets the
  glyph sit at the top of it. The map's own pin controls are the exception and are
  left as small as a finger can manage, because every pixel one of them takes is a
  pixel of the picture: a pin's remove button sits on the house, not in a bar.
*/
@media (pointer: coarse) {
  .${i}-button,
  .${i}-select,
  .${i}-search,
  .${i}-notice-input,
  .${i}-macro,
  .${i}-chat-mode-button,
  .${i}-chat-send,
  .${i}-step[data-clickable="true"],
  .${i}-zoom-button,
  .${i}-remove { min-height: 2.25rem; }
  .${i}-icon-button,
  .${i}-chat-mode-button,
  .${i}-chat-send { min-width: 2.25rem; }
  .${i}-zoom-button,
  .${i}-icon-button,
  .${i}-chat-mode-button,
  .${i}-chat-send { justify-content: center; }
  /*
    There used to be a second rule here, reserving room on the box's right-hand
    edge for the press, because the press floated over the words and grew under a
    coarse pointer. The press is a flex item at the end of the line now, so the
    box makes that room for it by itself and there is nothing left to reserve.
  */
  .${i}-pin-remove { min-width: 1.75rem; min-height: 1.75rem; }
  .${i}-textarea { min-height: 4.5rem; }
}

/*
  WHAT THE TAB DOES WHEN IT HAS LESS ROOM.

  Container queries, not window queries, and the container is named. This sheet is
  injected into the document rather than into a shadow root, so it is a global
  stylesheet, and an unnamed query in a global stylesheet is a query that matches
  whatever container happens to be nearest. Naming the host's container says which
  box is being asked about, and there is exactly one.

  Five states: four the tab has always answered to, in the order they take room
  away, and one for the way up a phone is held, which is the release after this
  one and has a block of its own below.

  A tab narrower than 44rem is a phone, or a tab squeezed by the Engine's own side
  panels. The stage is already the whole tab at every width, so what is left for
  this query is the paragraph: the card keeps less of its own padding, because on
  a phone the tab's edges are close enough to be their own margins and every
  pixel spent on a gutter is a pixel off a line the player is reading. The tab's
  own padding comes in with it, so the picture keeps running to the edge.

  A tab shorter than 30rem is a phone held sideways, and very little else. It
  cannot afford the villager a figure as big as the floor would like, and the
  words need the height more than the picture does. The figure shrinks rather than
  the card moving somewhere else: the card is already directly above the composer,
  and a card that moved when the phone turned over would be a different screen
  every time the player shifted their grip. Shrinks, not narrows, and the two are
  not the same edit: it is HEIGHT that this tab is short of, and a square that
  answers a height the tab does not have is a square squeezing the paragraph.

  The figure's own share of the floor is asked for in the FLOOR's units now, so the
  only thing this block still has to say about it is how much of the row to keep
  clear under it: with the plate gone, half a rem is the row's own padding and
  nothing else.

  The tab gives up a row here too, and the row it gives up is the plate. The name
  of the villager is on the card, and the plate only says where they are, so a tab
  with 390 pixels of height spends its last one on the words rather than on the
  place they are said from. The portrait in the card goes with it, and for the
  same reason: the figure is still standing on the floor, and a second copy of it
  in the card is the first thing a short tab can do without.

  These fixes are not cosmetics and the reason is worth writing down, because it
  is a property of the stack rather than of any one row: the bottom stack is
  justified to its END, so anything that does not fit does not extend past the
  composer. It cannot spill upward either \u2014 the floor above it is the flexible
  row, so the stage yields first and the chrome stays where it is. That is the
  whole reason the figure has a floor of its own rather than a place at the head
  of the reading: a row that shrinks is a row nothing can be printed on top of.

  A tab narrower than 34rem gets the Menu as a column of full-width buttons
  instead of a wrapped cluster of ragged ones, which is how a phone draws a menu
  and how a thumb presses one. The figure used to shrink again here and no longer
  has to: a narrow tab is a handset, a handset is a tall tab, and a figure that is
  a share of the floor's height is width-limited by its own rule long before this
  block is reached.

  One ordering hazard runs through all five, and it is worth stating where the
  blocks are: a container query does not raise a rule's weight, so an override
  only wins by being read later. Every rule overridden below is declared a
  thousand lines above, which is why these blocks sit here at the end of the
  sheet rather than beside the rules they belong to.

  A tab that is taller than it is wide is a phone held the way a phone is normally
  held, and it is the case these three were never written for: every one of them
  asks about room, and portrait has the room \u2014 it is the SHAPE of the map that is
  the problem, because a wide picture in a tall box leaves most of the box under
  the picture rather than beside it. That state is the portrait block below, and it
  is the one that decides where the readout and the controls are drawn.
*/
@container ${i} (max-width: 44rem) {
  .${i}-chat { padding: .625rem; }
  .${i}-chat-head { top: .625rem; left: .625rem; right: .625rem; }
  .${i}-chat-vn-row { gap: .5rem; padding: .625rem; }
  .${i}-room-screen > .${i}-chat { overflow-y: auto; }
  .${i}-room-screen .${i}-chat-stage {
    flex: 1 1 9.5rem; height: auto; min-height: 9.5rem; padding-top: 3.25rem;
    justify-content: flex-end;
  }
  .${i}-room-screen .${i}-chat-cast { height: 100%; max-height: none; }
  .${i}-room-screen .${i}-chat-cast-person,
  .${i}-room-screen .${i}-chat-cast-person[data-active="true"] {
    flex: 0 1 30%; height: auto; justify-content: center;
  }
  .${i}-room-screen .${i}-chat-cast-person > .${i}-avatar { width: min(4rem, 100%); }
  .${i}-room-screen .${i}-chat-cast-person > img { height: 5rem; max-width: 100%; }
  .${i}-room-screen .${i}-chat-vn { flex: 0 0 auto; justify-content: flex-start; }
  .${i}-room-screen .${i}-chat > .${i}-composer { flex: 0 0 auto; }
  .${i}-room-screen .${i}-chat > .${i}-composer {
    position: sticky; bottom: 0; z-index: 2;
    padding-bottom: env(safe-area-inset-bottom, 0px);
    background: var(--popover);
  }
}
@container ${i} (max-width: 55rem) and (max-height: 32rem) {
  .${i}-setup-map-viewport { max-height: min(65cqh, 36rem); overscroll-behavior: contain; }
}
@container ${i} (max-height: 30rem) {
  .${i}-chat { gap: .5rem; padding: .625rem; }
  .${i}-chat-stage { gap: .25rem; }
  /*
    The same share of the figure's width as the rule it overrides, and a TIGHTER
    reservation under it: this block is where the plate under the figure is given
    up, so the half a rem it was keeping clear goes back to the figure. That is
    the only difference between the two lines, and it is the whole reason this
    block still states a size of its own.
  */
  .${i}-chat-figure { width: min(38cqw, calc(100cqh - .5rem)); }
  .${i}-chat-scene-place { display: none; }
  .${i}-chat-log { gap: .375rem; }
  .${i}-chat-vn-portrait { display: none; }
  .${i}-chat-vn-reading { max-height: min(34cqh, 11rem); }
}
/* A short landscape viewport gives the cast a column beside the reading stack. */
@container ${i} (min-width: 34rem) and (max-height: 30rem) {
  .${i}-room-screen .${i}-chat-stage {
    position: absolute; top: 3rem; bottom: .5rem; left: .5rem; width: 34%;
    z-index: 1; flex: none;
  }
  .${i}-room-screen .${i}-chat-cast-person { font-size: .5625rem; }
  .${i}-room-screen .${i}-chat-vn,
  .${i}-room-screen .${i}-chat > .${i}-row,
  .${i}-room-screen .${i}-chat > .${i}-composer {
    width: 64%; align-self: flex-end; box-sizing: border-box;
  }
  .${i}-room-screen .${i}-chat-vn { margin-top: auto; }
}
@container ${i} (max-width: 34rem) {
  .${i}-menu-group-buttons { flex-direction: column; align-items: stretch; }
  .${i}-chat-menu { max-width: 88cqw; }
  .${i}-chat-modes { max-width: 88cqw; }
  .${i}-chat-menu-button { width: 2.25rem; height: 2.25rem; }
  .${i}-chat-vn-portrait { width: min(4rem, 22cqw); }
}
@container ${i} (max-width: 34rem) and (max-height: 32rem) {
  .${i}-room-screen .${i}-chat-stage { min-height: 7.5rem; padding-top: 2.75rem; }
  .${i}-room-screen .${i}-chat-cast-person > .${i}-avatar { width: min(3.25rem, 100%); }
  .${i}-room-screen .${i}-chat-cast-person > img { height: 3.5rem; }
}
/*
  A tab shorter than 22rem is 352 pixels of height, and at that height the top
  chrome, the card, the history tab, the composer and its own padding have already
  spent the tab: what is left for the floor is a strip, which is a villager's
  shoulders and nothing else. So this block buys the card's room from the three
  things that can most afford to give it up: the gap between the figure and its
  plate, the ceiling on the paragraph, and the size of the speaker's name.

  It used to take its share from the "right now" line as well, and 0.4.50 deleted
  that line rather than override it here \u2014 there is nothing left in the block to
  hide, so the row of chrome above the card is one badge and one button at every
  height. What the block does now is what it always did underneath: the paragraph
  is the box that shrinks, and the ceiling on it is what stops a long answer
  pushing the composer off a tab this short.

  It is last of the three on purpose: at 640x360 or 390x340 every one of these
  queries matches at once, and the floor is squeezed hardest by whichever block is
  read last. The shares are smaller here than in either block above for the same
  reason.

  ponytail: the ceiling of this block is about 19rem, and it is lower than it used
  to be because the card now carries a face, a name and a paragraph rather than a
  paragraph alone. Under 19rem the chrome, the card and the composer are the whole
  tab and the floor is a strip, so the figure is a strip too \u2014 it is a share of the
  row it stands in, and the row is whatever the card and the composer leave. What
  is accepted here is that a strip is what the player gets: a villager's shoulders
  and not their face. There is no honest alternative left to trade for \u2014 the row is
  the first thing this tab is short of, and the card is what is being read \u2014 and a
  figure that were allowed to keep its size would be a figure with its head above
  the top edge of the tab. If a tab this short ever has to work properly, the fix
  is a compact composer: the figure is already at its floor here and there is
  nothing left to take from the card.
*/
@container ${i} (max-height: 22rem) {
  .${i}-chat-stage { gap: .125rem; padding-bottom: .125rem; }
  .${i}-chat-vn-reading { max-height: min(38cqh, 9rem); }
  .${i}-chat-vn-name { font-size: .8125rem; }
}

@container ${i} (max-width: 44rem) {
  .${i}-setup-map-viewport { max-height: min(65cqh, 36rem); overscroll-behavior: contain; }
}

/*
  There is no rule here for the way into a roleplay, and its absence is the fix.

  A section of its own used to live at the foot of the drawer: a heading, a verb
  in a row of its own, and a paragraph explaining what the verb does. On a phone
  held sideways that is a hundred and forty pixels of a three-hundred-and-ninety
  pixel drawer, and the drawer pays for it in the only currency it has left \u2014
  the conversation, which came out at twenty-six pixels on an 844x390 screen and
  at NOTHING at all at 844x340 and 740x360, with the villager's square portrait
  flattened to two pixels in the column beside it. The room the player opened the
  drawer for was the thing being spent.

  So the verb is drawn in the drawer's own options menu, where it costs no height
  at all: the list is drawn over the reading rather than beside it, and it is
  closed when it is not being read. The paragraph it used to carry is the button's
  title now, which costs nothing and is where a player looks for it anyway.
*/
/*
  The spawn sheet: the questions asked between pressing Create spinoff chat and
the roleplay existing.

  It is a SHEET over the whole window rather than a panel inside the tab, and
  that is the one thing about it the player has to feel rather than read. Making
a chat is the moment this tab stops being a picture of a village and starts
  being a real roleplay in the player's own library, and a control that simply
  changed a dropdown would let that happen without anybody noticing. The dim is
  gentle on purpose \u2014 the game is still visible behind it and nothing is
  destroyed \u2014 but it is there, because what is about to happen is not a setting.

  Fixed rather than absolute, because the tab scrolls: a sheet anchored to the
  document would open somewhere up the page from wherever the player was
  standing. A transform on an ancestor would make this relative to that ancestor
  instead of to the window \u2014 the one thing that could move it, and the reason
  this is stated here rather than assumed.
*/
.${i}-backdrop {
  position: fixed; inset: 0; z-index: 60;
  display: flex; align-items: center; justify-content: center;
  padding: clamp(.75rem, 3vw, 2rem);
  background: color-mix(in srgb, #05060a 52%, transparent);
}
.${i}-sheet {
  display: flex; flex-direction: column; gap: .75rem;
  width: min(100%, 27rem); max-height: min(100%, 34rem);
  border: 1px solid var(--border); border-radius: .875rem;
  background: var(--popover, var(--background)); color: var(--foreground);
  box-shadow: 0 1.5rem 3.5rem rgba(0, 0, 0, .45);
  padding: .9375rem;
  overflow: hidden;
}
.${i}-sheet-head { display: flex; flex-direction: column; gap: .1875rem; }
.${i}-sheet-title { margin: 0; font-size: .9625rem; font-weight: 600; }
.${i}-sheet-note { margin: 0; font-size: .75rem; line-height: 1.5; color: var(--muted-foreground); }
.${i}-sheet-body {
  display: flex; flex-direction: column; gap: .5rem;
  min-height: 0; overflow-y: auto; padding-right: .125rem;
}
.${i}-sheet-actions { display: flex; flex-wrap: wrap; align-items: center; gap: .375rem; }
.${i}-sheet-actions-end { margin-left: auto; display: flex; flex-wrap: wrap; gap: .375rem; }
/*  The one filled button in the package. Everywhere else the accent is a border,
    because everywhere else the control sits inside the player's village and is
    one of several. Here there is exactly one thing to do next. */
.${i}-button-primary {
  border-color: var(--primary); background: var(--primary);
  color: var(--primary-foreground, var(--background));
}
.${i}-button-primary:hover { border-color: var(--primary); color: var(--primary-foreground, var(--background)); opacity: .9; }
/*  A preset, as a row rather than as an option in a select. It is drawn as a
    list because a preset is a choice with consequences \u2014 it decides how the
    whole roleplay reads \u2014 and a dropdown hides the consequences behind a click. */
.${i}-choice {
  display: flex; flex-direction: column; align-items: flex-start; gap: .125rem;
  width: 100%; text-align: left;
  border: 1px solid var(--border); border-radius: .5rem;
  background: transparent; color: var(--foreground);
  padding: .4375rem .625rem; font: inherit; font-size: .8125rem; cursor: pointer;
}
.${i}-choice:hover { border-color: var(--primary); }
.${i}-choice[data-active="true"] { border-color: var(--primary); box-shadow: inset 0 0 0 1px var(--primary); }
.${i}-choice-note { font-size: .6875rem; line-height: 1.45; color: var(--muted-foreground); }
/*  One preset question, and the answers to it. The pills are the Engine's own
    button mode; the list below is its listbox mode, which it reaches for by
    itself once a question has enough answers that a wall of pills stops being
    readable. Both are drawn here because the popup has to be able to show
    whichever one the preset asked for. */
.${i}-var { display: flex; flex-direction: column; gap: .3125rem; }
.${i}-var-question { font-size: .75rem; font-weight: 600; line-height: 1.4; }
.${i}-var-options { display: flex; flex-wrap: wrap; gap: .25rem; }
.${i}-var-option {
  display: inline-flex; align-items: center; gap: .3125rem;
  border: 1px solid var(--border); border-radius: 999px;
  padding: .1875rem .5rem; font-size: .75rem; line-height: 1.4; cursor: pointer;
}
.${i}-var-option:hover { border-color: var(--primary); }
.${i}-var-option[data-on="true"] { border-color: var(--primary); color: var(--primary); }
.${i}-var-option input { flex: none; margin: 0; accent-color: var(--primary); }
.${i}-var-list {
  font: inherit; font-size: .75rem; max-width: 100%; min-height: 7rem;
  border: 1px solid var(--border); border-radius: .5rem;
  background: var(--background); color: var(--foreground); padding: .25rem;
}
/*
  RETIRED 0.4.43 \u2014 the gate: what the tab used to be while one of its villagers
  was away in a scene.

  The whole village was replaced rather than dimmed, and that was the narrative
  rule the old feature was built on \u2014 while the player was doing something with
  one character, the village was not a place to be rearranging. It said so, and
  then gave three ways out: go to the chat, bring them home, or let the link go.

  No element carries these classes any more: the component that drew them,
  SceneGate, is retired next to the place it used to be defined. They are kept for
  the same reason it is \u2014 they are the only drawing of a village standing still,
  and a later lane that wants one again will want them again. Nothing reads a
  -gate- rule, so nothing here costs anything.
*/
.${i}-gate {
  display: flex; flex-direction: column; gap: .75rem; align-items: flex-start;
  margin: auto; width: min(100%, 32rem); padding: 1.25rem;
  border: 1px solid var(--border); border-radius: .875rem;
  background: var(--popover, var(--background));
  box-shadow: 0 1rem 2.5rem rgba(0, 0, 0, .3);
}
.${i}-gate-title { margin: 0; font-size: 1.125rem; font-weight: 600; }
.${i}-gate-note { margin: 0; font-size: .8125rem; line-height: 1.55; color: var(--muted-foreground); }
.${i}-gate-actions { display: flex; flex-wrap: wrap; align-items: center; gap: .5rem; }
/*  The chip's own popover, hung off the toolbar button it belongs to. Absolute
    rather than fixed: it is a sentence about the button under the player's
    finger, and it should move with the chat chrome rather than with the page. */
.${i}-tracker-menu {
  position: absolute; top: calc(100% + .5rem); right: 0; z-index: 40;
  width: 17rem; display: flex; flex-direction: column; gap: .5rem;
  border: 1px solid var(--border); border-radius: .625rem;
  background: var(--popover, var(--background)); color: var(--foreground);
  box-shadow: 0 .875rem 2rem rgba(0, 0, 0, .35); padding: .625rem;
}
.${i}-tracker-menu-title { margin: 0; font-size: .8125rem; font-weight: 600; }
.${i}-tracker-menu-note { margin: 0; font-size: .75rem; line-height: 1.5; color: var(--muted-foreground); }
.${i}-tracker-menu-row { display: flex; flex-wrap: wrap; gap: .375rem; }
/*
  The chip's width, released from the host's square.

  The Engine hands every package toolbar control the same class, and that class
  is a fixed square because every other control in that strip is one icon and
  nothing else. This one is not: its whole job is to tell the player that the chat
  they are reading belongs to their village, and an icon cannot tell them that.
  So the width is released here, the label is worn inside the button, and the
  colour, the radius, the border and the states all stay the host's \u2014 this rule
  adds a width and a gap and paints nothing.
*/
.${i}-tracker-chip { width: auto; max-width: none; gap: .3125rem; padding-inline: .5rem; }
.${i}-tracker-label { font-size: .6875rem; font-weight: 600; line-height: 1; letter-spacing: .01em; }
/*  On a phone the strip is a row of squares and there is no room for a word, so
    the chip goes back to being one: the icon, the same host chrome, and the same
    menu one press away. The sentence the label was carrying is the menu's first
    line, which is where a player on a phone will read it anyway. */
.${i}-tracker[data-compact="true"] .${i}-tracker-label { display: none; }
.${i}-tracker[data-open="true"] .${i}-tracker-label { color: var(--marinara-chat-chrome-button-text-active, currentColor); }
/*
  The tracker panel's body.

  Drawn inside the Engine's own tracker section, which already supplies the
  card, the veil and the heading, so this adds no chrome of its own \u2014 only the
  small amount of layout the Engine's shell leaves to the package.
*/
.${i}-panel-view { display: flex; flex-direction: column; gap: .4375rem; }
.${i}-panel-view-row { display: flex; flex-wrap: wrap; align-items: baseline; gap: .375rem; font-size: .75rem; line-height: 1.5; }
.${i}-panel-view-key { color: var(--muted-foreground); }
.${i}-panel-view-actions { display: flex; flex-wrap: wrap; gap: .375rem; margin-top: .125rem; }
/*
  The tracker button, which is drawn inside the Engine's own chat chrome rather
  than inside this tab. Its colours and its size are the host's: the class the
  Engine hands over is worn whole, and everything here is only what the host has
  no opinion about \u2014 that the button and its icon share the host's own colour
  rather than this tab's.

  The data-state=done rule below and the spinner under it have nothing to match
  since 0.4.43 \u2014 there is one state now, because there is nothing the chip can be
  waiting for. Kept with the icons they belonged to; see the RETIRED note in the
  chrome further down.

  THE SPINNER HAS AN OWNER AGAIN as of 0.4.47, and it is not this one. It is the
  dot in the corner of a chat that is waiting on a villager \u2014 see chat-pending \u2014
  which is the same animation doing the same job that the chip's spinner did: a
  turn going round while a model is out. The style itself was never the surprise;
  what went missing in 0.4.43 was the thing being waited for.
*/
.${i}-tracker { position: relative; display: inline-flex; align-items: center; }
.${i}-tracker svg { width: 1rem; height: 1rem; }
.${i}-tracker[data-state="done"] { opacity: .7; }
.${i}-spin { animation: ${i}-spin .9s linear infinite; }
@keyframes ${i}-spin { to { transform: rotate(360deg); } }
@media (prefers-reduced-motion: reduce) {
  .${i}-spin { animation: none; }
}

/* 0.6.10 mobile village: the wooden frame is the viewport, not the moving map. */
.${i}-home-full[data-mobile="true"] { box-sizing: border-box; flex-direction: column; overflow: hidden; padding: .5rem; gap: .5rem; }
.${i}-home-full[data-mobile="true"] .${i}-room { min-height: 0; padding: calc(var(--${i}-map-wood) + var(--${i}-map-mat) + 1px); }
.${i}-home-full[data-mobile="true"] .${i}-home-map-viewport { display: block; width: 100%; height: 100%; overflow: visible; }
.${i}-home-full[data-mobile="true"] .${i}-stage { display: block; width: 100% !important; height: 100% !important; aspect-ratio: auto !important; touch-action: none; }
.${i}-stage[data-mobile="true"] { touch-action: none; user-select: none; }
.${i}-stage[data-mobile="true"] .${i}-canvas { overflow: hidden; }
.${i}-stage[data-mobile="true"] .${i}-canvas-img { max-width: none; max-height: none; pointer-events: none; }
.${i}-stage[data-mobile="true"][data-empty="true"] .${i}-canvas { background: var(--background); }
.${i}-mobile-logical { position: absolute; display: block; background: radial-gradient(circle at 30% 25%, color-mix(in srgb, var(--primary) 17%, transparent), transparent 30%), linear-gradient(25deg, #34304d, #20243b); pointer-events: none; }
.${i}-home-bar { display: flex; align-items: center; flex: 0 0 auto; gap: .35rem; min-width: 0; z-index: 15; }
.${i}-home-bar-actions { display: inline-flex; align-items: center; gap: .35rem; margin-left: auto; }
.${i}-home-bar .${i}-button { min-height: 2.5rem; }
.${i}-mobile-datetime { display: inline-flex; align-items: center; gap: .2rem; min-width: 0; border: 1px solid #d6ba7c; border-radius: .65rem; background: #718eb6; color: #172238; padding: .2rem .3rem; font-size: .95rem; white-space: nowrap; }
.${i}-mobile-clock { display: flex; flex-direction: column; line-height: 1.15; font-variant-numeric: tabular-nums; font-size: clamp(.58rem, 2.5cqw, .75rem); }
.${i}-mobile-board-button, .${i}-mobile-menu-button, .${i}-home-bar .${i}-news-toggle { flex: 0 0 auto; display: inline-flex; align-items: center; justify-content: center; width: 2.5rem; height: 2.5rem; min-width: 2.5rem; min-height: 2.5rem; padding: .15rem; }
.${i}-mobile-board-button { border: 3px solid #5c381d; border-radius: .3rem; background: repeating-linear-gradient(90deg, #ad7540 0 9px, #9a6636 9px 11px); color: #f6e3b6; box-shadow: inset 0 0 0 2px #c5925a, 0 2px 4px #0007; font-size: 1.4rem; cursor: pointer; }
.${i}-mobile-board-button:disabled { opacity: .55; }
.${i}-mobile-menu-button { font-size: 1.5rem; line-height: 1; }
.${i}-home-bar .${i}-news-toggle { position: relative; }
.${i}-home-bar .${i}-news-toggle svg { width: 1.3rem; height: 1.3rem; }
.${i}-news-nyi { position: absolute; right: -.15rem; bottom: -.3rem; border-radius: .2rem; background: var(--popover); color: var(--foreground); padding: 0 .1rem; font-size: .55rem; font-weight: 700; }
.${i}-home-bar .${i}-news-panel { width: min(19rem, 80cqw); max-height: 60cqh; }
.${i}-home-full[data-mobile="false"] .${i}-mobile-datetime { font-size: 1rem; padding: .25rem .45rem; }
.${i}-home-full[data-mobile="false"] .${i}-mobile-clock { font-size: .75rem; }
.${i}-stage[data-mobile="true"] .${i}-pin-holder { z-index: 2; }
.${i}-stage .${i}-pin-holder[data-selected="true"] { z-index: 7; }
.${i}-home-full .${i}-pin[data-kind="place"], .${i}-stage[data-mobile="true"] .${i}-pin[data-kind="place"] { display: flex; align-items: center; justify-content: center; width: 3rem; height: 3rem; padding: 0; border: 0; border-radius: 0; background: transparent; color: #30261c; box-shadow: none; text-align: center; white-space: normal; line-height: 1.1; overflow: visible; }
.${i}-home-full .${i}-pin-photo-card, .${i}-stage[data-mobile="true"] .${i}-pin-photo-card { display: flex; flex: 0 0 auto; flex-direction: column; width: clamp(3.5rem, 6cqw, 5rem); gap: .1rem; padding: .18rem; box-sizing: border-box; border-radius: .1rem; background: #faf4e7; box-shadow: 0 3px 8px #0009; transform-origin: center; transition: transform 160ms ease-out; }
.${i}-stage[data-mobile="true"] .${i}-pin-photo-card { width: clamp(4rem, 17cqw, 5.25rem); }
.${i}-home-full .${i}-pin-photo, .${i}-stage[data-mobile="true"] .${i}-pin-photo { position: relative; display: block; width: 100%; aspect-ratio: 1 / 1; background: #201e29; overflow: visible; }
.${i}-home-full .${i}-pin-photo img, .${i}-stage[data-mobile="true"] .${i}-pin-photo img { display: block; width: 100%; height: 100%; object-fit: cover; }
.${i}-home-full .${i}-pin-photo-tack, .${i}-stage[data-mobile="true"] .${i}-pin-photo-tack { position: absolute; top: -.35rem; left: 50%; width: .55rem; height: .55rem; transform: translateX(-50%); border-radius: 50%; background: #b89a43; box-shadow: 0 1px 2px #0009; }
.${i}-home-full .${i}-pin-name, .${i}-stage[data-mobile="true"] .${i}-pin-name { display: block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; font-size: .58rem; font-weight: 700; }
.${i}-stage[data-mobile="true"] .${i}-pin[data-kind="person"] { max-width: 7rem; }
.${i}-stage[data-mobile="true"][data-mobile-gesturing="true"] .${i}-pin-photo-card { transition: none; }
.${i}-stage[data-mobile="true"] .${i}-doors { z-index: 8; transform: translateX(-50%); min-width: min(10rem, 70cqw); }
.${i}-sectioned-menu .${i}-menu-nav { display: none; }
.${i}-mobile-menu-nav { display: grid; grid-template-columns: repeat(auto-fit, minmax(min(100%, 9rem), 1fr)); gap: .5rem; }
.${i}-mobile-menu-nav .${i}-button { min-height: 2.75rem; text-align: left; }
.${i}-mobile-menu-nav .${i}-status { grid-column: 1 / -1; margin: 0; line-height: 1.45; }
.${i}-sectioned-menu[data-section="index"] > .${i}-panel, .${i}-sectioned-menu[data-section="index"] > .${i}-menu-body { display: none; }
.${i}-sectioned-menu[data-section="noticeboard"] .${i}-overlay { border: .8rem solid #9e6835; border-radius: .5rem; background: repeating-linear-gradient(90deg, #ba854d 0 21px, #a9733d 21px 24px); box-shadow: inset 0 0 0 2px #6b3d1e, 0 .5rem 1rem #0005; padding: .8rem; }
.${i}-sectioned-menu[data-section="noticeboard"] .${i}-notice-row { border: 1px solid #d9c69c; background: #fff7db; color: #33281d; padding: .6rem; box-shadow: 1px 2px 3px #0005; }
.${i}-sectioned-menu[data-section="noticeboard"] .${i}-notice-author { color: #33281d; }
.${i}-sectioned-menu[data-section="noticeboard"] .${i}-overlay-head > .${i}-panel-title { color: #2e2116; font-size: 1rem; }
.${i}-sectioned-menu[data-mobile="false"] .${i}-mobile-menu-nav { grid-template-columns: repeat(auto-fit, minmax(12rem, 1fr)); }
.${i}-sectioned-menu[data-mobile="false"] .${i}-mobile-menu-nav .${i}-button { min-height: 2.5rem; }
.${i}-mobile-map-preview { display: block; max-width: min(100%, 22rem); max-height: 13rem; object-fit: contain; border: 2px solid var(--border); }
.${i}-setup-map-viewport:has(> .${i}-stage[data-mobile="true"]) { height: min(55cqh, 30rem); overflow: hidden; }
.${i}-setup-map-viewport > .${i}-stage[data-mobile="true"] { width: 100% !important; height: 100% !important; aspect-ratio: auto !important; }
/* Shared place photographs, including the founding map before an image exists. */
.${i}-stage[data-photo-pins="true"][data-mobile="false"] .${i}-pin[data-kind="place"] { display: flex; align-items: center; justify-content: center; min-width: 0; min-height: 0; padding: 0; border: 0; background: transparent; box-shadow: none; overflow: visible; }
.${i}-stage[data-photo-pins="true"][data-mobile="false"] .${i}-pin-photo-card { display: flex; flex-direction: column; gap: .1rem; width: 4rem; padding: .18rem; box-sizing: border-box; border-radius: .1rem; background: #faf4e7; color: #30261c; box-shadow: 0 3px 8px #0009; transform-origin: center; transition: transform 160ms ease-out; }
.${i}-stage[data-photo-pins="true"][data-mobile="false"] .${i}-pin-photo { position: relative; display: block; width: 100%; aspect-ratio: 1 / 1; background: #201e29; }
.${i}-stage[data-photo-pins="true"][data-mobile="false"] .${i}-pin-photo img { display: block; width: 100%; height: 100%; object-fit: cover; }
.${i}-stage[data-photo-pins="true"][data-mobile="false"] .${i}-pin-photo-tack { position: absolute; top: -.35rem; left: 50%; width: .55rem; height: .55rem; transform: translateX(-50%); border-radius: 50%; background: #b89a43; box-shadow: 0 1px 2px #0009; }
.${i}-stage[data-photo-pins="true"][data-mobile="false"] .${i}-pin-name { display: block; max-width: 100%; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: .55rem; font-weight: 700; }
.${i}-pin-photo-empty { display: flex; width: 100%; height: 100%; align-items: center; justify-content: center; color: #e8dfc9; font-size: 1.5rem; }
.${i}-pin-placement-error { position: absolute; z-index: 15; left: .5rem; bottom: .5rem; margin: 0; max-width: calc(100% - 1rem); padding: .4rem .6rem; border-radius: .5rem; background: #261a19e8; color: white; font-size: .75rem; pointer-events: none; }
.${i}-setup-venue-list { display: grid; gap: .45rem; margin: .5rem 0; }
.${i}-setup-venue-card { display: grid; grid-template-columns: 3.5rem minmax(0, 1fr); align-items: center; gap: .65rem; min-height: 4.4rem; width: 100%; box-sizing: border-box; text-align: left; border: 1px solid var(--border); border-radius: .6rem; background: var(--background); color: var(--foreground); padding: .45rem; }
.${i}-setup-venue-card[data-selected="true"] { border-color: var(--primary); }
.${i}-setup-venue-card img, .${i}-setup-venue-placeholder { width: 3.5rem; height: 3.5rem; object-fit: cover; border-radius: .3rem; background: #31291f; }
.${i}-setup-venue-placeholder { display: grid; place-items: center; color: #eee5d5; font-size: 1.3rem; }
@media (prefers-reduced-motion: reduce) { .${i}-pin-photo-card { transition: none; } }
.${i}-setup-venue-card strong, .${i}-setup-venue-card small { display: block; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.${i}-setup-venue-editor { display: grid; gap: .65rem; border-top: 1px solid var(--border); padding-top: .75rem; }
.${i}-setup-image-preview { display: block; width: min(100%, 18rem); aspect-ratio: 3 / 2; object-fit: cover; border-radius: .5rem; }
.${i}-preparing { display: grid; place-items: center; min-height: 100%; padding: 2rem; text-align: center; background: radial-gradient(circle at 50% 65%, #584a2e, #241e24 70%); color: #fff4dd; }
.${i}-preparing-house { font-size: clamp(4rem, 13vw, 7rem); animation: ${i}-settle 2.5s ease-in-out infinite; }
@keyframes ${i}-settle { 50% { transform: translateY(-.35rem) rotate(2deg); } }
@media (prefers-reduced-motion: reduce) { .${i}-preparing-house { animation: none; } }
/* Game Mode's reading stack: asides float over a bounded bottom panel. */
.${i}-root.${i}-room-screen { box-sizing: border-box; padding: 0; overflow: hidden; }
.${i}-room-screen .${i}-chat-vn { position: relative; align-self: center; width: min(58rem, 100%); margin-top: auto; padding: .6rem; box-sizing: border-box; border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border)); border-radius: 1rem; background: var(--marinara-chat-chrome-panel-bg, color-mix(in srgb, var(--popover) 88%, transparent)); backdrop-filter: blur(14px); box-shadow: 0 .75rem 2rem #0007; }
.${i}-room-screen .${i}-chat-vn-asides { position: absolute; right: .5rem; bottom: calc(100% + .5rem); width: min(75%, 24rem); max-height: min(30cqh, 12rem); }
.${i}-room-screen .${i}-chat-vn-card { background: color-mix(in srgb, var(--background) 62%, transparent); box-shadow: none; }
.${i}-room-screen .${i}-chat-vn-reading { max-height: min(30cqh, 18rem); }
.${i}-room-panel-tools { display: flex; align-items: center; gap: .5rem; min-height: 2rem; }
.${i}-room-screen .${i}-chat-history-toggle { min-height: 2rem; }
.${i}-room-screen .${i}-composer { min-width: 0; }
.${i}-room-mode-anchor { position: relative; flex: 0 0 auto; }
.${i}-room-mode-toggle { display: inline-flex; align-items: center; justify-content: center; width: 2rem; height: 2rem; border: 0; border-radius: .5rem; background: transparent; color: var(--primary); font-size: 1rem; cursor: pointer; }
.${i}-room-mode-menu { position: absolute; z-index: 20; left: 0; bottom: calc(100% + .45rem); display: grid; width: 9rem; padding: .25rem; border: 1px solid var(--border); border-radius: .6rem; background: var(--popover); box-shadow: 0 .5rem 1rem #0008; }
.${i}-room-mode-menu button { border: 0; border-radius: .35rem; background: transparent; color: var(--foreground); text-align: left; padding: .5rem; font: inherit; cursor: pointer; }
.${i}-room-mode-menu button[aria-checked="true"] { background: color-mix(in srgb, var(--primary) 17%, var(--popover)); }
.${i}-room-mode-menu button:disabled { opacity: .5; cursor: default; }
.${i}-mailbox-backdrop { position: fixed; inset: 0; z-index: 100; display: grid; place-items: center; padding: 1rem; background: #0009; }
.${i}-mailbox { width: min(42rem, 100%); max-height: min(80vh, 48rem); overflow: auto; padding: 1.5rem; border: 1px solid var(--border); border-radius: 1rem; background: var(--popover); box-shadow: 0 1rem 3rem #0009; }
.${i}-mailbox-list { display: grid; gap: .75rem; margin-top: 1rem; }
.${i}-mailbox-item { padding: .9rem; border: 1px solid var(--border); border-radius: .75rem; }
.${i}-venue-space-picture { display: block; width: min(100%, 24rem); aspect-ratio: 4 / 3; object-fit: cover; border: 1px solid var(--border); border-radius: .625rem; }
.${i}-room-mode-toggle:focus-visible, .${i}-room-mode-menu button:focus-visible, .${i}-room-star-detail:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
.${i}-room-star-detail { flex: 1; align-self: stretch; border: 0; padding: 0; background: transparent; color: inherit; font: inherit; line-height: inherit; text-align: left; cursor: pointer; }
.${i}-memory-backdrop { position: absolute; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center; padding: 1rem; background: #0009; }
.${i}-memory-dialog { box-sizing: border-box; width: min(28rem, 100%); max-height: min(75cqh, 36rem); overflow-y: auto; padding: 1rem; border: 1px solid var(--border); border-radius: .8rem; background: var(--popover); color: var(--foreground); box-shadow: 0 1rem 2rem #0009; }
.${i}-memory-dialog-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
.${i}-memory-dialog-head h2 { margin: 0; font-size: 1rem; line-height: 1.4; }
.${i}-memory-dialog-head button { border: 0; background: transparent; color: inherit; font: inherit; font-size: 1.5rem; cursor: pointer; }
.${i}-memory-dialog p { margin: .75rem 0 0; white-space: pre-wrap; overflow-wrap: anywhere; line-height: 1.5; }
@container ${i} (max-width: 44rem) { .${i}-room-screen .${i}-chat-vn { width: 100%; padding: .45rem; } .${i}-room-screen .${i}-chat-vn-asides { width: min(85%, 22rem); } .${i}-room-mode-toggle { width: 2.5rem; height: 2.5rem; } }
@container ${i} (min-width: 34rem) and (max-height: 30rem) { .${i}-room-screen .${i}-chat-vn { width: 64%; align-self: flex-end; } }
.${i}-room-screen[data-mobile="true"] .${i}-room-stars { top: 4.25rem; left: .625rem; width: min(15rem, calc(100% - 1.25rem)); max-height: 20cqh; gap: .25rem; }
.${i}-room-screen[data-mobile="true"] .${i}-room-star { gap: .35rem; padding: .35rem .45rem; font-size: .75rem; line-height: 1.3; }
.${i}-room-screen[data-mobile="true"] .${i}-room-star-dismiss { margin: -.3rem -.35rem -.3rem 0; }
.${i}-room-screen[data-mobile="true"] .${i}-chat-vn-asides { position: static; flex: 0 0 auto; align-self: flex-end; width: min(90%, 20rem); max-height: 9rem; margin-bottom: .125rem; z-index: 2; }
.${i}-room-screen[data-mobile="true"] .${i}-chat-vn-aside { max-width: 100%; padding: .4rem .55rem; gap: .375rem; }
.${i}-room-screen[data-mobile="true"] .${i}-chat-vn-aside-face { width: 1.5rem; height: 1.5rem; }
.${i}-room-screen[data-mobile="true"] .${i}-memory-backdrop { padding: .5rem; }
.${i}-room-screen[data-mobile="true"] .${i}-memory-dialog { width: min(20rem, 100%); max-height: 60cqh; padding: .75rem; }
`;function b0(){let e=document.getElementById(u0);if(!document.querySelector(i)){e?.remove();return}if(e)return;let t=document.createElement("style");t.id=u0,t.textContent=iS,document.head.appendChild(t)}var oS="marinara_admin_secret";function V0(e){let t=new Headers(e?.headers);try{let a=window.localStorage.getItem(oS)?.trim();a&&t.set("X-Admin-Secret",a)}catch{}return typeof e?.body=="string"&&!t.has("Content-Type")&&t.set("Content-Type","application/json"),t}var rS="This action needs loopback access or admin access. Open the app through localhost, or set ADMIN_SECRET=<secret> in the server .env and paste the same value in Settings \u2192 Advanced \u2192 Admin Access. Marinara sends it as the X-Admin-Secret header.";function D0(e,t,a){let n=e?.error,o=typeof n=="string"&&n?n:a;return t===403&&/admin[-_ ]?secret/iu.test(o)?new Error(`${rS} (${o})`):new Error(o)}async function V(e,t){let a=await fetch(`${K5}${e}`,{...t,headers:V0(t)}),n=await a.json().catch(()=>null);if(!a.ok)throw D0(n,a.status,`The village replied ${a.status}.`);return Pw(n)}async function vp(e,t){let a=await fetch(e,{cache:"no-store",credentials:"same-origin",...t,headers:V0(t)}),n=await a.json().catch(()=>null);if(!a.ok)throw D0(n,a.status,`The Engine replied ${a.status}.`);return n}var Qi=e=>typeof e=="number"&&Number.isFinite(e);function _0(e){let t=e;for(let N=0;N<2&&typeof t=="string";N+=1)try{t=JSON.parse(t)}catch{return null}if(!t||typeof t!="object"||Array.isArray(t))return null;let a=t,{srcX:n,srcY:o,srcWidth:l,srcHeight:c}=a;if(Qi(n)&&Qi(o)&&Qi(l)&&Qi(c))return l<=0||c<=0||n<0||o<0||n+l>1.001||o+c>1.001?null:{srcX:n,srcY:o,srcWidth:l,srcHeight:c};let{zoom:d,offsetX:h,offsetY:g,fullImage:y}=a;return!Qi(d)||d<=0||!Qi(h)||!Qi(g)||y!==void 0&&typeof y!="boolean"?null:y===void 0?{zoom:d,offsetX:h,offsetY:g}:{zoom:d,offsetX:h,offsetY:g,fullImage:y}}function lS(e){if(!e)return{};if("zoom"in e){let t=`scale(${e.zoom}) translate(${e.offsetX}%, ${e.offsetY}%)`;return e.fullImage?{objectFit:"contain",transform:t}:e.zoom<=1?{}:{transform:t}}return{position:"absolute",width:`${100/e.srcWidth}%`,height:`${100/e.srcHeight}%`,left:`${-e.srcX/e.srcWidth*100}%`,top:`${-e.srcY/e.srcHeight*100}%`,maxWidth:"none",maxHeight:"none",objectFit:"fill"}}async function sS(e,t){if(e.length===0)return{};let a=await vp("/api/characters/summaries",{method:"POST",body:JSON.stringify({ids:e}),signal:t}),n={};if(!Array.isArray(a))return n;for(let o of a){let l=typeof o?.id=="string"?o.id:"",c=typeof o?.avatarUrl=="string"?o.avatarUrl.trim():"";l.length>0&&c.length>0&&(n[l]={url:c,crop:_0(o.avatarCrop)})}return n}async function cS(e,t){let a=e.trim();if(a.length===0)return null;let n=await vp(`/api/characters/personas/${encodeURIComponent(a)}`,{signal:t}),o=typeof n?.avatarPath=="string"?n.avatarPath.trim():"";return o.length===0?null:{url:o,crop:_0(n.avatarCrop)}}function uS(e){let t=[];for(let a of e){let n=typeof a.id=="string"?a.id.trim():"";if(n.length===0)continue;let o=typeof a.provider=="string"?a.provider:"";if(o==="video_generation")continue;let l=typeof a.name=="string"&&a.name.trim()?a.name.trim():n;t.push({id:n,name:l,category:o==="image_generation"?"image_generation":"language",defaultForAgents:a.defaultForAgents===!0||a.defaultForAgents==="true"})}return t}function q(e,t){return e instanceof Error&&e.message?e.message:t}function ql(e){let t=q(e,"");return t.includes("Interrupted: Inactivity")?"inactivity":/no longer available|not active|already ended/iu.test(t)?"elsewhere":null}async function v0(e){try{let{session:t}=await V("/rooms/active",{signal:AbortSignal.timeout(5e3)});return t?.id===e&&t.status!=="opening"?t:null}catch{return null}}function y0(e){let t=q(e,"The greeting could not be prepared.");return/timeout|timed out|exceeded 28 seconds/iu.test(t)?"The greeting took too long. Retry it or continue without a greeting.":`${t} Retry it or continue without a greeting.`}function pr(e,t){return H0(Zw(e),t)}function H0(e,t){let a=0;return e.map(n=>{let o=`${t}${a++}`;switch(n.kind){case"text":return n.text;case"code":return(0,r.jsx)("code",{className:`${i}-chat-md-code`,dir:"ltr",children:n.text},o);case"link":return(0,r.jsx)("a",{className:`${i}-chat-md-link`,href:n.href,target:"_blank",rel:"noopener noreferrer",children:n.text},o);default:return dS(n,o)}})}function dS(e,t){let a=H0(e.children,`${t}-`);switch(e.style){case"bold":return(0,r.jsx)("strong",{children:a},t);case"bold-italic":return(0,r.jsx)("strong",{children:(0,r.jsx)("em",{children:a})},t);case"italic":return(0,r.jsx)("em",{children:a},t);case"underline":return(0,r.jsx)("u",{children:a},t);case"strikethrough":return(0,r.jsx)("del",{children:a},t);default:return(0,r.jsx)("mark",{className:`${i}-chat-md-highlight`,children:a},t)}}function hS(e){return e==="off"?"Time, schedules, wishes, and approved projects still advance. No optional stories are added.":e==="quiet"?"Usually one optional village story is written on an active day.":e==="lively"?"Up to three optional village stories may be written on an active day.":"Usually one to three optional village stories are written on an active day, averaging two."}function fr(e){return e.classes?.includes("residence")??(e.occupancy.playerHome||e.occupancy.residentCharacterId!==null||e.occupancy.homeKind!==null)}var U0=["residence","workplace","gathering","other"];function Mn(e){return e.classes?.length?e.classes:fr(e)?["residence"]:["other"]}function w0(e){return Math.min(4,(e.residenceCapacity??1)+(e.improvements??[]).reduce((t,a)=>t+(a?.extraBeds??0),0))}function gu(e){return(e.residentIds?.length??+!!e.occupancy.residentCharacterId)+Number(e.occupancy.playerHome)}function Ge(e,t){return e.spaces?.find(a=>a.venueClass===t)??{id:t,venueClass:t,description:e.description,image:e.presentation.image,state:{condition:e.state.condition,items:e.state.furniture,publicFacts:e.state.publicFacts,features:e.state.features??[],traces:e.state.traces??[],updatedAt:e.state.updatedAt}}}function $0({draft:e,existing:t,villagers:a,editableClasses:n,onChange:o}){let l=Mn(e),c=(d,h)=>{let g=l.map(y=>y===d?{...Ge(e,y),...h}:Ge(e,y));o({...e,spaces:g,description:g[0]?.description??e.description})};return(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsxs)("label",{className:`${i}-label`,children:["Name",(0,r.jsx)("input",{className:`${i}-notice-input`,value:e.name,maxLength:100,onChange:d=>o({...e,name:d.target.value}),placeholder:"The Lantern Workshop"})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Form ",(0,r.jsx)("span",{className:`${i}-hint`,children:"What is it, in your world?"}),(0,r.jsx)("input",{className:`${i}-notice-input`,value:e.form??"",maxLength:200,onChange:d=>o({...e,form:d.target.value}),placeholder:"A converted truck, a sleeping pod, an old diner\u2026"})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Purpose",(0,r.jsx)("input",{className:`${i}-notice-input`,value:e.purpose,maxLength:200,onChange:d=>o({...e,purpose:d.target.value}),placeholder:"What happens here?"})]}),(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Map pin \xB7 optional"}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Use a fraction from 0 to 1 across the map and down the map."}),(0,r.jsx)("div",{className:`${i}-row`,children:["x","y"].map(d=>(0,r.jsxs)("label",{className:`${i}-label`,children:[d==="x"?"Across":"Down",(0,r.jsx)("input",{className:`${i}-notice-input`,type:"number",min:0,max:1,step:.01,value:e.presentation[d]??"",disabled:t&&gu(e)>0,onChange:h=>o({...e,presentation:{...e.presentation,[d]:h.target.value===""?null:Number(h.target.value)}})})]},d))}),t&&gu(e)>0?(0,r.jsx)("p",{className:`${i}-hint`,children:"Move residents before changing this Venue's pin."}):null]}),(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Classes \xB7 choose up to two"}),(0,r.jsx)("div",{className:`${i}-row`,children:U0.map(d=>(0,r.jsxs)("label",{className:`${i}-label`,style:{textTransform:"capitalize"},children:[(0,r.jsx)("input",{type:"checkbox",checked:l.includes(d),disabled:t||!l.includes(d)&&l.length>=2,onChange:h=>{let g=h.target.checked?[...l,d]:l.filter(y=>y!==d);g.length<1||g.length>2||o({...e,classes:g,spaces:g.map(y=>Ge(e,y))})}})," ",d]},d))}),t?(0,r.jsx)("p",{className:`${i}-hint`,children:"Class changes go through a Venue proposal."}):null]}),l.includes("residence")?(0,r.jsxs)("label",{className:`${i}-label`,children:["Resident capacity \xB7 includes you",(0,r.jsx)("input",{className:`${i}-notice-input`,type:"number",min:1,max:4,value:e.residenceCapacity??1,disabled:t,onChange:d=>o({...e,residenceCapacity:Number(d.target.value)})}),t?(0,r.jsx)("span",{className:`${i}-hint`,children:"Capacity changes go through a Venue proposal."}):null]}):null,l.includes("workplace")?(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Workers"}),a.map(d=>(0,r.jsxs)("label",{className:`${i}-label`,children:[(0,r.jsx)("input",{type:"checkbox",checked:(e.workerIds??[]).includes(d.characterId),onChange:h=>o({...e,workerIds:h.target.checked?[...e.workerIds??[],d.characterId]:(e.workerIds??[]).filter(g=>g!==d.characterId)})})," ",d.name]},d.characterId)),a.length===0?(0,r.jsx)("p",{className:`${i}-hint`,children:"No villagers are available yet."}):null]}):null,l.filter(d=>!n||n.includes(d)).map(d=>{let h=Ge(e,d);return(0,r.jsxs)("section",{className:`${i}-field`,children:[(0,r.jsxs)("h3",{className:`${i}-panel-title`,style:{textTransform:"capitalize"},children:[d," space"]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Scene description",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:h.description,maxLength:1e3,onChange:g=>c(d,{description:g.target.value})})]}),(0,r.jsxs)("details",{className:`${i}-venue-scene-details`,children:[(0,r.jsx)("summary",{children:"Scene details"}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Current physical state used by visits and pictures."}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Condition now"," ",(0,r.jsx)("span",{className:`${i}-hint`,children:"For example, a leaking roof or a repaired door."}),(0,r.jsx)("input",{className:`${i}-notice-input`,value:h.state.condition,onChange:g=>c(d,{state:{...h.state,condition:g.target.value}})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Present items \xB7 one per line"," ",(0,r.jsx)("span",{className:`${i}-hint`,children:"Objects physically in this space."}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:h.state.items.join(`
`),onChange:g=>c(d,{state:{...h.state,items:g.target.value.split(`
`)}})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Established facts \xB7 one per line"," ",(0,r.jsx)("span",{className:`${i}-hint`,children:"Durable truths about this space."}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:h.state.publicFacts.join(`
`),onChange:g=>c(d,{state:{...h.state,publicFacts:g.target.value.split(`
`)}})})]}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Features \xB7 lasting details established through play"}),h.state.features.map((g,y)=>(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("input",{className:`${i}-notice-input`,value:g.text,"aria-label":`Feature ${y+1}`,onChange:N=>c(d,{state:{...h.state,features:h.state.features.map(f=>f.id===g.id?{...f,text:N.target.value}:f)}})}),(0,r.jsxs)("label",{className:`${i}-label`,children:[(0,r.jsx)("input",{type:"checkbox",checked:g.locked,onChange:N=>c(d,{state:{...h.state,features:h.state.features.map(f=>f.id===g.id?{...f,locked:N.target.checked}:f)}})})," ","Locked"]}),(0,r.jsx)("button",{type:"button",className:`${i}-remove`,"aria-label":`Remove feature ${y+1}`,onClick:()=>c(d,{state:{...h.state,features:h.state.features.filter(N=>N.id!==g.id)}}),children:"\xD7"})]},g.id)),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:h.state.features.length>=5,onClick:()=>c(d,{state:{...h.state,features:[...h.state.features,{id:su(),text:"",sourceCharacterId:"",locked:!1,updatedAt:""}]}}),children:"Add Feature"})]})]}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Structural improvements use two proposal slots per Venue."})]},d)})]})}function fp(e){return e.filter(t=>fr(t))}function zn(e){return e.filter(t=>!fr(t)||Mn(t).some(a=>a!=="residence"))}function mS(e,t){let a=fp(e);return a.length!==t.length?!1:t.every((n,o)=>{let l=a[o];return l.id===n.id&&l.name===n.name&&(l.form??"Home")===n.form&&l.occupancy.playerHome===n.isPlayerHome&&l.occupancy.residentCharacterId===n.characterId&&l.description===n.description&&Math.abs((l.presentation.x??-1)-(n.x??-1))<1e-4&&Math.abs((l.presentation.y??-1)-(n.y??-1))<1e-4})}function pS(e,t){let a=new Map(e.map(o=>[o.id,o]));return[...t.map(o=>{let l=a.get(o.id);return{id:o.id,name:o.name,form:o.form,classes:["residence"],spaces:[{...Ge(l??{id:o.id,name:o.name,description:o.description,purpose:"",category:"",presentation:{image:null,x:o.x,y:o.y},occupancy:{playerHome:o.isPlayerHome,residentCharacterId:o.characterId,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}},"residence"),description:o.description}],residenceCapacity:l?.residenceCapacity??1,residentIds:o.characterId?[o.characterId]:[],improvements:l?.improvements??[null,null],purpose:l?.purpose??"",description:o.description,category:l?.category??"",presentation:{image:l?.presentation.image??null,x:o.x,y:o.y},occupancy:{playerHome:o.isPlayerHome,residentCharacterId:o.characterId,homeKind:null},capabilities:l?.capabilities??[],state:l?.state??{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}}}),...e.filter(o=>!fr(o))]}function Zi(){return Math.random().toString(36).slice(2,10)}function Ki(e){return Math.round(e*1e4)/1e4}var gS=new Intl.DateTimeFormat(void 0,{weekday:"short",day:"numeric",month:"short"}),q0=new Intl.DateTimeFormat(void 0,{hour:"2-digit",minute:"2-digit"}),fS=6e4,bS=700;function x0(e){return`${gS.format(e)} \xB7 ${q0.format(e)}`}function vS(){let[e,t]=(0,m.useState)(()=>x0(new Date));return(0,m.useEffect)(()=>{let a=setInterval(()=>t(x0(new Date)),1e3);return()=>clearInterval(a)},[]),e}function yS(){let[e,t]=vS().split(" \xB7 ");return(0,r.jsxs)("span",{className:`${i}-mobile-clock`,children:[(0,r.jsx)("span",{children:e}),(0,r.jsx)("strong",{children:t})]})}function wS({weather:e}){return(0,r.jsxs)("span",{className:`${i}-mobile-datetime`,children:[(0,r.jsx)(yS,{}),(0,r.jsx)("span",{role:"img","aria-label":`Weather: ${e||"unknown"}`,title:e||"Weather unavailable",children:$S(e)})]})}function $S(e){return/thunder/u.test(e)?"\u26C8\uFE0F":/snow/u.test(e)?"\u2744\uFE0F":/sleet/u.test(e)?"\u{1F328}\uFE0F":/rain|drizzle/u.test(e)?"\u{1F327}\uFE0F":/fog|haze/u.test(e)?"\u{1F32B}\uFE0F":/wind|breez/u.test(e)?"\u{1F32C}\uFE0F":/overcast/u.test(e)?"\u2601\uFE0F":/frost/u.test(e)?"\u{1F976}":/hot|heat/u.test(e)?"\u2600\uFE0F":"\u{1F324}\uFE0F"}function N0(e){return e?.closest(i)??null}function xS(){let[e,t]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let o=()=>t(N0(document.fullscreenElement)!==null);return o(),document.addEventListener("fullscreenchange",o),()=>document.removeEventListener("fullscreenchange",o)},[]);let a=document.fullscreenEnabled,n=a?e?"Leave the whole screen":"Use the whole screen":"This browser will not give the tab the whole screen";return(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-icon-button`,disabled:!a,"aria-pressed":e,"aria-label":n,title:n,onClick:o=>{let l=N0(o.currentTarget);if(!l)return;if(document.fullscreenElement===l){document.exitFullscreen().catch(()=>{});return}let c=l.requestFullscreen?.();c&&c.catch(()=>{})},children:(0,r.jsx)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",focusable:"false",children:e?(0,r.jsx)("path",{d:"M9 4H5a1 1 0 0 0-1 1v4M15 4h4a1 1 0 0 1 1 1v4M9 20H5a1 1 0 0 1-1-1v-4M15 20h4a1 1 0 0 0 1-1v-4"}):(0,r.jsx)("path",{d:"M9 3H4a1 1 0 0 0-1 1v5M15 3h5a1 1 0 0 1 1 1v5M9 21H4a1 1 0 0 1-1-1v-5M15 21h5a1 1 0 0 0 1-1v-5"})})})}function NS({happenings:e,recap:t,mobile:a=!1}){let n=(0,m.useRef)(null),[o,l]=(0,m.useState)(!1);return(0,m.useEffect)(()=>{let c=n.current;if(!c)return;let d=()=>l(c.open);return c.addEventListener("toggle",d),()=>c.removeEventListener("toggle",d)},[]),(0,m.useEffect)(()=>{if(!o)return;let c=d=>{!(d.target instanceof Node)||n.current?.contains(d.target)||n.current?.removeAttribute("open")};return document.addEventListener("pointerdown",c),document.addEventListener("keydown",c),()=>{document.removeEventListener("pointerdown",c),document.removeEventListener("keydown",c)}},[o]),(0,r.jsxs)("details",{ref:n,className:`${i}-news`,children:[(0,r.jsxs)("summary",{className:`${i}-button ${i}-news-toggle`,"aria-label":"Events (NYI)",children:[(0,r.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",focusable:"false",children:[(0,r.jsx)("path",{d:"M4 5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"}),(0,r.jsx)("path",{d:"M8 8h7M8 12h7M8 16h4"})]}),a?null:"Events",(0,r.jsx)("span",{className:`${i}-news-nyi`,children:"NYI"})]}),(0,r.jsxs)("div",{className:`${i}-news-panel`,children:[(0,r.jsx)("h2",{className:`${i}-news-title`,children:"Events"}),t?(0,r.jsxs)("div",{children:[(0,r.jsx)("strong",{children:"While you were away"}),t.details.length>0?(0,r.jsx)("ul",{className:`${i}-news-list`,children:t.details.map(c=>(0,r.jsx)("li",{className:`${i}-news-item`,children:c.text},`recap-${c.id}`))}):null,t.summaries.map(c=>(0,r.jsx)("p",{className:`${i}-news-empty`,children:c},c)),t.pendingDecisionCount>0?(0,r.jsxs)("p",{className:`${i}-news-empty`,children:[t.pendingDecisionCount," pending"," ",t.pendingDecisionCount===1?"decision needs":"decisions need"," your attention."]}):null]}):null,e.length===0?(0,r.jsx)("p",{className:`${i}-news-empty`,children:"No events to show yet."}):(0,r.jsx)("ul",{className:`${i}-news-list`,children:e.map(c=>(0,r.jsx)("li",{className:`${i}-news-item`,children:c.text},c.id))})]})]})}function I0(e,t){return`${e==="You"?t?"Your":"your":`${e}'s`} house`}function SS(e){return e.length>0?I0(e,!0):"Empty house"}function S0(e,t){return t===null?{kind:"",name:"Venue residence",category:""}:e.find(a=>a.kind===t)??{kind:t,name:t,category:""}}function T0(e){return e.isPlayerHome?"player":e.occupant?"resident":"empty"}function TS(e,t){return t.length>0?I0(t,!0):e.name||"An empty house"}function Il(e){return e?e.presentation.x===null||e.presentation.y===null?null:{x:e.presentation.x,y:e.presentation.y}:null}var kS=.028;function Bl(e){return new Promise((t,a)=>{let n=new FileReader;n.onload=()=>t(typeof n.result=="string"?n.result:""),n.onerror=()=>a(new Error("That picture could not be read.")),n.readAsDataURL(e)})}function cp(e){return new Promise((t,a)=>{let n=new Image;n.onload=()=>t({width:n.naturalWidth,height:n.naturalHeight}),n.onerror=()=>a(new Error("That picture could not be read.")),n.src=e})}var k0=[{fit:"cover",label:"Fill the frame",help:"Keeps the picture's own shape and crops whatever hangs outside the frame. Drag the map to choose which part is kept."},{fit:"stretch",label:"Stretch to fill",help:"Squeezes the whole picture into the frame. Nothing is lost, but a picture that is not the map's shape is drawn stretched."},{fit:"contain",label:"Show all of it",help:"Keeps the whole picture and leaves the frame's own background showing around it."}];function up(e){return e.width/e.height<1.2?{tone:"warn",text:`This ${e.width}\xD7${e.height} map is nearly square or portrait. It will fit in full, but navigation may feel cramped on a wide desktop.`}:e.width<1024||e.height<700?{tone:"warn",text:`This ${e.width}\xD7${e.height} map will fit in full, but it may look soft when enlarged.`}:{tone:"ok",text:`This ${e.width}\xD7${e.height} map will be shown at its native shape, with the whole image visible.`}}function dp(e,t,a){return e<t?t:e>a?a:e}function ES(e,t,a){if(a.fit==="stretch")return{left:0,top:0,width:t.width,height:t.height};if(a.fit==="contain"){let c=Math.min(t.width/e.width,t.height/e.height),d=e.width*c,h=e.height*c;return{left:(t.width-d)/2,top:(t.height-h)/2,width:d,height:h}}let n=Math.max(t.width/e.width,t.height/e.height)*a.zoom,o=e.width*n,l=e.height*n;return{left:(t.width-o)*(a.focusX/100),top:(t.height-l)*(a.focusY/100),width:o,height:l}}function CS(e){return e.fit==="stretch"?{objectFit:"fill"}:e.fit==="contain"?{objectFit:"contain"}:{objectFit:"cover",objectPosition:`${e.focusX}% ${e.focusY}%`,...e.zoom===1?null:{transform:`scale(${e.zoom})`,transformOrigin:`${e.focusX}% ${e.focusY}%`}}}function hu(e){return{fit:e,focusX:50,focusY:50,zoom:1}}function hp({src:e,alt:t,pins:a,placing:n,view:o,shape:l,zoom:c,onPlace:d,onView:h,onDismiss:g,compact:y,fitToRoom:N,mobile:f,photoPins:$,children:C}){let k=d!==void 0,D=h!==void 0,w=(0,m.useRef)(null),v=(0,m.useRef)(null),[b,S]=(0,m.useState)(null),[R,P]=(0,m.useState)(null),[U,B]=(0,m.useState)(null),fe=(0,m.useRef)(null),Y=(0,m.useRef)(new Map),De=(0,m.useRef)(null),[Fe,Ba]=(0,m.useState)(null),[mi,qt]=(0,m.useState)(null),nt=(0,m.useRef)(null),I=(0,m.useRef)(null),te=(0,m.useRef)(!1),[Ie,La]=(0,m.useState)(null),le=(0,m.useMemo)(()=>Ie?{...o,...Ie}:o,[Ie,o]),de=e?b?.src===e?b:null:l,Ea={zoom:de&&R?cu(de,R):1,centerX:.5,centerY:.5},da=U??Ea,Q=(0,m.useMemo)(()=>f?de&&R?np(de,R,da):null:e?b&&b.src===e&&R?ES(b,R,le):null:R?{left:0,top:0,width:R.width,height:R.height}:null,[b,R,le,f,de,da,e]);(0,m.useEffect)(()=>{B(null),fe.current=null,Y.current.clear(),De.current=null},[e,R?.width,R?.height]);let Ca=l?N&&Fe?{width:`${Fe.width}px`,height:`${Fe.height}px`,aspectRatio:`${l.width} / ${l.height}`}:{aspectRatio:`${l.width} / ${l.height}`}:void 0,dn=(0,m.useCallback)(()=>{let E=v.current;if(!E)return;let H=E.getBoundingClientRect();H.width===0||H.height===0||P(me=>me&&me.width===H.width&&me.height===H.height?me:{width:H.width,height:H.height})},[]);(0,m.useEffect)(()=>{let E=v.current;if(!E||typeof ResizeObserver>"u")return;let H=new ResizeObserver(()=>dn());return H.observe(E),()=>H.disconnect()},[dn]);let Aa=(0,m.useCallback)(()=>{let E=w.current?.parentElement;if(!E||!l)return;let H=E.getBoundingClientRect(),me=getComputedStyle(E),ye=it=>Number.parseFloat(me.getPropertyValue(it))||0,Be=H.width-ye("padding-left")-ye("padding-right"),dt=H.height-ye("padding-top")-ye("padding-bottom"),Ke=l.width/l.height,G=Math.min(Be,dt*Ke);G>0&&Ba(it=>it&&Math.abs(it.width-G)<.5?it:{width:G,height:G/Ke})},[l]);(0,m.useLayoutEffect)(()=>{if(!N||(Aa(),typeof ResizeObserver>"u"))return;let E=w.current?.parentElement;if(!E)return;let H=new ResizeObserver(()=>Aa());return H.observe(E),()=>H.disconnect()},[N,Aa]);let he=(0,m.useCallback)(E=>{if(!k||!d||!Q)return;let H=E.currentTarget.getBoundingClientRect(),me=(E.clientX-H.left-Q.left)/Q.width,ye=(E.clientY-H.top-Q.top)/Q.height;if(!(me>=0&&me<=1)||!(ye>=0&&ye<=1))return;let dt=v.current?.querySelector(`.${i}-pin-photo`)?.getBoundingClientRect();d(Ki(me),Ki(ye),{width:Q.width,height:Q.height,photoWidth:dt?.width??58,photoHeight:dt?.height??58})},[d,k,Q]),Ae=(0,m.useCallback)(E=>{if(!D||!Q||!h||le.fit!=="cover")return;let H=E.currentTarget.getBoundingClientRect();nt.current={x:E.clientX,y:E.clientY,focusX:le.focusX,focusY:le.focusY,spanX:H.width-Q.width,spanY:H.height-Q.height},La({focusX:le.focusX,focusY:le.focusY}),E.currentTarget.setPointerCapture(E.pointerId),E.preventDefault()},[D,le.focusX,le.focusY,le.fit,h,Q]),ee=(0,m.useCallback)(E=>{let H=nt.current;if(!H)return;let me=H.spanX===0?H.focusX:H.focusX+(E.clientX-H.x)/H.spanX*100,ye=H.spanY===0?H.focusY:H.focusY+(E.clientY-H.y)/H.spanY*100;La({focusX:Ki(dp(me,0,100)),focusY:Ki(dp(ye,0,100))})},[]),oe=(0,m.useCallback)(E=>{if(!nt.current)return;nt.current=null,E.currentTarget.hasPointerCapture(E.pointerId)&&E.currentTarget.releasePointerCapture(E.pointerId);let H=Ie;La(null),H&&h&&h({...o,...H})},[Ie,h,o]),za=(0,m.useCallback)(E=>{!h||!c||h({...o,zoom:Ki(dp(E,c.min,c.max))})},[h,o,c]),At=()=>{let E=[...Y.current.values()];if(E.length===0){De.current=null;return}let H=E[0],me=E[1];De.current={view:fe.current??da,x:me?(H.x+me.x)/2:H.x,y:me?(H.y+me.y)/2:H.y,distance:me?Math.hypot(H.x-me.x,H.y-me.y):1}},Kt=E=>{if(!f||E.pointerType!=="touch"||(E.isPrimary&&(Y.current.clear(),te.current=!1),!v.current)||E.target instanceof Element&&E.target.closest(`.${i}-doors, .${i}-zoom`))return;w.current?.setAttribute("data-mobile-gesturing","true");let H=v.current.getBoundingClientRect();Y.current.set(E.pointerId,{x:E.clientX-H.left,y:E.clientY-H.top}),Y.current.size>1&&(te.current=!0),At()},St=E=>{if(!f||!Y.current.has(E.pointerId)||!de||!R||!v.current)return;let H=v.current.getBoundingClientRect();Y.current.set(E.pointerId,{x:E.clientX-H.left,y:E.clientY-H.top});let me=[...Y.current.values()],ye=me[0],Be=me[1],dt=Be?(ye.x+Be.x)/2:ye.x,Ke=Be?(ye.y+Be.y)/2:ye.y,G=Be?Math.hypot(ye.x-Be.x,ye.y-Be.y):1,it=De.current;if(!it||!n0(it,{x:dt,y:Ke,distance:G})&&!te.current)return;te.current||g?.(),te.current=!0;let ke=i0(de,R,it.view,{x:it.x,y:it.y},{x:dt,y:Ke},Be&&it.distance>0?G/it.distance:1);fe.current=ke,B(ke)},ut=(E,H=!1)=>{if(!f||!Y.current.has(E.pointerId))return;let me=!H&&Y.current.size===1&&!te.current;if(Y.current.delete(E.pointerId),Y.current.size===0&&w.current?.removeAttribute("data-mobile-gesturing"),At(),!me||!(E.target instanceof Element))return;let ye=E.target.closest(`.${i}-pin`)?.dataset.pinId,Be=ye?a.find(dt=>dt.id===ye):null;if(Be?.onSelect){te.current=!0,Be.onSelect();return}if(!(!E.target.closest(`.${i}-canvas`)||E.target.closest("button")))if(k&&n&&d&&Q){let dt=v.current.getBoundingClientRect(),Ke=(E.clientX-dt.left-Q.left)/Q.width,G=(E.clientY-dt.top-Q.top)/Q.height;if(Ke>=0&&Ke<=1&&G>=0&&G<=1){te.current=!0;let A=v.current?.querySelector(`.${i}-pin-photo`)?.getBoundingClientRect();d(Ki(Ke),Ki(G),{width:Q.width,height:Q.height,photoWidth:A?.width??72,photoHeight:A?.height??72})}}else g&&(te.current=!0,g())};return(0,r.jsxs)("div",{ref:w,className:`${i}-stage${y?` ${i}-stage-compact`:""}`,style:Ca,"data-shaped":l?"true":"false","data-framing":D&&le.fit==="cover"?"true":"false","data-mobile":f?"true":"false","data-photo-pins":$?"true":"false","data-empty":e?"false":"true",onPointerDownCapture:E=>{if(f){Kt(E);return}te.current=!1,I.current=E.pointerType==="touch"?{x:E.clientX,y:E.clientY}:null},onPointerMoveCapture:E=>{if(f){St(E);return}let H=I.current;H&&(Math.abs(E.clientX-H.x)>8||Math.abs(E.clientY-H.y)>8)&&(te.current=!0)},onPointerUpCapture:f?ut:void 0,onPointerCancelCapture:E=>{f&&ut(E,!0),I.current&&(te.current=!0)},onClickCapture:E=>{te.current&&(te.current=!1,E.preventDefault(),E.stopPropagation())},children:[C,(0,r.jsxs)("div",{ref:v,className:`${i}-canvas`,"data-placing":k&&n?"true":"false","data-dragging":Ie?"true":"false",onClick:k&&n?he:g?()=>g():void 0,onPointerDown:D?Ae:void 0,onPointerMove:D?ee:void 0,onPointerUp:D?oe:void 0,onPointerCancel:D?oe:void 0,children:[e?(0,r.jsx)("img",{className:`${i}-canvas-img`,style:f&&Q?{position:"absolute",left:Q.left,top:Q.top,width:Q.width,height:Q.height,objectFit:"fill"}:CS(le),src:e,alt:t,draggable:!1,onLoad:E=>{let{naturalWidth:H,naturalHeight:me}=E.currentTarget;H<=0||me<=0||(S({src:e,width:H,height:me}),dn())},onError:()=>qt(e)}):(0,r.jsxs)(r.Fragment,{children:[f&&Q?(0,r.jsx)("span",{className:`${i}-mobile-logical`,style:{left:Q.left,top:Q.top,width:Q.width,height:Q.height},"aria-hidden":"true"}):null,(0,r.jsx)("span",{className:`${i}-canvas-empty`,children:"Logical village map"})]}),e&&mi===e?(0,r.jsx)("span",{className:`${i}-canvas-missing`,children:"The map picture could not be loaded \u2014 pick another one from the Town map panel."}):null,Q?a.map(E=>(0,r.jsxs)("span",{className:`${i}-pin-holder`,"data-selected":E.selected?"true":"false",style:{left:`${Q.left+E.x*Q.width}px`,top:`${Q.top+(E.y+(f&&E.kind!=="person"?0:E.dy??0))*Q.height}px`},children:[(0,r.jsx)("button",{type:"button",className:`${i}-pin`,"data-pin-id":E.id,"data-tone":E.tone,"data-kind":E.kind??"place","data-selected":E.selected?"true":"false","aria-expanded":E.doors?!0:void 0,disabled:E.onSelect===void 0,title:E.text,onClick:H=>{H.stopPropagation(),E.onSelect?.()},children:(f||$)&&E.kind!=="person"?(0,r.jsxs)("span",{className:`${i}-pin-photo-card`,style:{transform:`scale(${r0(f?o0(da.zoom,Ea.zoom):J5,E.selected===!0)})`},children:[(0,r.jsxs)("span",{className:`${i}-pin-photo`,"aria-hidden":"true",children:[E.image?(0,r.jsx)("img",{src:E.image,alt:"",loading:"lazy",draggable:!1}):(0,r.jsx)("span",{className:`${i}-pin-photo-empty`,role:"img","aria-label":"House",children:"\u{1F3E0}"}),(0,r.jsx)("span",{className:`${i}-pin-photo-tack`})]}),(0,r.jsx)("span",{className:`${i}-pin-name`,children:E.text})]}):(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("span",{"aria-hidden":"true",className:`${i}-pin-tack`,children:(0,r.jsxs)("svg",{viewBox:"0 0 24 24",focusable:"false",children:[(0,r.jsx)("path",{d:"M7 2h10a1.2 1.2 0 0 1 1.2 1.2v2.4a1.2 1.2 0 0 1-1.2 1.2H7A1.2 1.2 0 0 1 5.8 5.6V3.2A1.2 1.2 0 0 1 7 2Z"}),(0,r.jsx)("path",{d:"M9.4 7.4h5.2l-.7 3.2H10.1z"}),(0,r.jsx)("path",{d:"M11.3 10.9h1.4v10.3l-.7 1.2-.7-1.2z"})]})}),(0,r.jsx)("span",{className:`${i}-pin-name`,children:E.text})]})}),E.onRemove?(0,r.jsx)("button",{type:"button",className:`${i}-pin-remove`,"aria-label":`Take ${E.text} off the map`,onClick:H=>{H.stopPropagation(),E.onRemove?.()},children:"\xD7"}):null,E.onResume?(0,r.jsx)("button",{type:"button",className:`${i}-pin-resume`,onClick:H=>{H.stopPropagation(),E.onResume?.()},children:"DEBUG: Resume Chat"}):null]},E.id)):null]}),Q?a.filter(E=>E.doors!==void 0&&E.doors.length>0).map(E=>(0,r.jsx)("div",{className:`${i}-doors`,style:{left:`${R?ip(Q,R,E).left:Q.left+E.x*Q.width}px`,top:`${R?ip(Q,R,E).top:Q.top+(E.y+(E.dy??0))*Q.height}px`},children:E.doors?.map(H=>(0,r.jsx)("button",{type:"button",className:`${i}-door`,onClick:me=>{me.stopPropagation(),H.onSelect()},children:H.label},H.label))},`doors:${E.id}`)):null,D&&c&&le.fit==="cover"?(0,r.jsxs)("div",{className:`${i}-zoom`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-zoom-button`,title:"Show less of the picture, larger","aria-label":"Zoom in",disabled:le.zoom>=c.max,onClick:()=>za(le.zoom+c.step),children:"+"}),(0,r.jsx)("button",{type:"button",className:`${i}-zoom-button`,title:"Show more of the picture, smaller","aria-label":"Zoom out",disabled:le.zoom<=c.min,onClick:()=>za(le.zoom-c.step),children:"\u2212"}),(0,r.jsx)("button",{type:"button",className:`${i}-zoom-button`,title:"Put the middle of the picture back in the middle of the frame",disabled:le.focusX===50&&le.focusY===50&&le.zoom===c.min,onClick:()=>{h&&h({...o,focusX:50,focusY:50,zoom:c.min})},children:"Centre"})]}):null]})}function Ji(e){let t=e?.settings.playerPersonaName;return typeof t=="string"&&t.trim()||"You"}function E0({idPrefix:e,personas:t,draft:a,onDraft:n,storedId:o,storedName:l,storedMissing:c,disabled:d}){let h=(t??[]).find(f=>f.id===a)??null,g=h?.name??(a===o?l:""),y=c&&a===o,N=a.length>0;return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-${e}-persona`,children:"Who are you?"}),(0,r.jsxs)("select",{id:`${i}-${e}-persona`,className:`${i}-select`,value:a,disabled:d||t===null||t.length===0,onChange:f=>n(f.target.value),children:[(0,r.jsx)("option",{value:"",disabled:!0,children:t===null?"Reading Personas\u2026":"Choose a Persona"}),(t??[]).map(f=>(0,r.jsx)("option",{value:f.id,children:f.isActive?`${f.name} \u2014 your Persona`:f.name},f.id))]}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:t===null?"Reading your Personas\u2026":t.length===0?"Create a Persona in your library before founding a village.":t.some(f=>f.isActive)?"Your active Persona is offered first. The village reads it live, so editing the Persona changes what the villagers believe about you.":"The village reads the Persona you pick here, live, so editing it changes what the villagers believe about you."})]}),N?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("p",{className:`${i}-empty`,children:y?"The Persona you chose is no longer in your library, so the villagers are going by the copy they kept of it. Pick another one to change who you are.":g.length>0?`The villagers know you as ${g}.`:"The villagers know you as this Persona."}),h&&h.summary.length>0?(0,r.jsx)("p",{className:`${i}-macro-help`,children:h.summary}):null]}):null]})}function C0({books:e,error:t,selected:a,onChange:n,disabled:o}){let l=new Map((e??[]).map(h=>[h.id,h])),c=(e??[]).filter(h=>!h.hiddenFromLibrary||a.includes(h.id)),d=a.filter(h=>!l.has(h));return(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Lorebooks for this village"}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Selected books supply live world facts for places, stories, conversations, wishes, agendas, and generated scenery. Villages never edits them."}),t?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:t}):null,e===null&&!t?(0,r.jsx)("p",{className:`${i}-hint`,children:"Loading lorebooks\u2026"}):null,e===null&&t&&a.length>0?(0,r.jsx)("p",{className:`${i}-hint`,children:"Selected books could not be checked. Lore generation will skip unavailable books."}):null,e?.length===0?(0,r.jsx)("p",{className:`${i}-hint`,children:"No lorebooks in the Engine library."}):null,[...c,...d.map(h=>({id:h,name:h,enabled:!1}))].map(h=>{let g=a.includes(h.id),y=d.includes(h.id)?e===null?t?"Unavailable \u2014 skipped":"Checking status":"Missing \u2014 skipped":h.enabled?"":"Disabled \u2014 skipped";return(0,r.jsxs)("label",{className:`${i}-reason-option`,children:[(0,r.jsx)("input",{type:"checkbox",checked:g,disabled:o||!h.enabled&&!g,onChange:()=>n(g?a.filter(N=>N!==h.id):[...a,h.id])}),h.name,y?` (${y})`:""]},h.id)})]})}function AS({homes:e,villagers:t,disabled:a,selectedId:n,onPatch:o,onRemove:l,onSelect:c,lockedIds:d,showDescriptions:h,onGenerateDescription:g}){let y=new Set(e.map(N=>N.characterId));return(0,r.jsx)("div",{className:`${i}-home-list`,children:e.map((N,f)=>{let $=d?.has(N.id)??!1,C=t.find(k=>k.id===N.characterId)?.name??"";return(0,r.jsxs)("div",{className:`${i}-home-row`,"data-selected":N.id===n?"true":"false",onMouseEnter:()=>c(N.id),children:[(0,r.jsx)("span",{className:`${i}-home-index`,"aria-hidden":"true",children:f+1}),N.isPlayerHome?(0,r.jsx)("span",{className:`${i}-who`,children:"You live here"}):(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("span",{className:`${i}-who`,children:C?`${C} lives here`:"No villager lives here"}),t.length>0?(0,r.jsxs)("select",{className:`${i}-select`,value:N.characterId??"",disabled:a||$,"aria-label":`Who lives in home ${f+1}`,onChange:k=>o(N.id,{characterId:k.target.value||null}),children:[(0,r.jsx)("option",{value:"",children:"Nobody yet"}),t.map(k=>{let D=k.id!==N.characterId&&y.has(k.id);return(0,r.jsx)("option",{value:k.id,disabled:D,children:D?`${k.name} \u2014 already housed`:k.name},k.id)})]}):null]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Venue name",(0,r.jsx)("input",{className:`${i}-notice-input`,value:N.name,maxLength:60,disabled:a||$,onChange:k=>o(N.id,{name:k.target.value})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Form \xB7 what is it?",(0,r.jsx)("input",{className:`${i}-notice-input`,value:N.form,maxLength:240,disabled:a||$,onChange:k=>o(N.id,{form:k.target.value}),placeholder:"Cabin, truck, sleeping pod\u2026"})]}),h?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("textarea",{className:`${i}-textarea`,value:N.description,maxLength:1e3,disabled:a||$,"aria-label":`Description of home ${f+1}`,onChange:k=>o(N.id,{description:k.target.value})}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:a||$,onClick:()=>g?.(N),children:"Generate description draft"})]}):null,(0,r.jsx)("button",{type:"button",className:`${i}-remove`,disabled:a||$,"aria-label":`Take home ${f+1} off the map`,onClick:()=>l(N.id),children:"\xD7"}),$?(0,r.jsx)("span",{className:`${i}-hint`,children:"Move approved and completed before changing this home."}):null]},N.id)})})}function A0({id:e,label:t,hint:a,options:n,value:o,disabled:l,onChange:c}){let d=o.length>0&&!n.some(h=>h.id===o);return(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:e,children:t}),(0,r.jsxs)("select",{id:e,className:`${i}-select`,value:o,disabled:l,onChange:h=>c(h.target.value),children:[(0,r.jsx)("option",{value:"",children:"Engine default"}),d?(0,r.jsx)("option",{value:o,children:"Missing \u2014 this connection is gone"}):null,n.map(h=>(0,r.jsx)("option",{value:h.id,children:h.name},h.id))]}),(0,r.jsx)("span",{className:`${i}-hint`,children:a})]})}function mp({onSetupProblem:e,onImageWarningChange:t}){let[a,n]=(0,m.useState)(null),[o,l]=(0,m.useState)([]),[c,d]=(0,m.useState)(""),[h,g]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let k=!1;return(async()=>{try{let[D,w]=await Promise.all([V("/connections"),vp("/api/connections")]);if(k)return;n(D),l(uS(Array.isArray(w)?w:[]))}catch(D){k||d(q(D,"This agent's connections could not be read."))}})(),()=>{k=!0}},[]);let y=(0,m.useCallback)(async k=>{g(!0),d("");try{n(await V("/connections",{method:"PUT",body:JSON.stringify(k)}))}catch(D){d(q(D,"That connection could not be saved."))}finally{g(!1)}},[]),N=o.filter(k=>k.category==="language"),f=o.filter(k=>k.category==="image_generation"),$=f.some(k=>k.defaultForAgents),C=a!==null&&(a.imageConnectionId===lp||f.length===0||a.imageConnectionId.length===0&&!$);return(0,m.useEffect)(()=>{if(!e)return;let k=a?.systemConnectionId??"",D=a?.narrationConnectionId??"";a?k.length===0||D.length===0?e("Choose both System and Narration connections before continuing."):!N.some(w=>w.id===k)||!N.some(w=>w.id===D)?e("Choose available language connections for System and Narration."):e(""):e("Connections are still loading.")},[e,a,N]),(0,m.useEffect)(()=>{t?.(C)},[C,t]),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Connections"}),(0,r.jsx)("p",{className:`${i}-empty`,children:"The village spends model calls on three kinds of work, and they are not worth the same money. The heavy lifting is one long call about the whole village. The conversations are short and frequent. Pictures are drawn only when you ask for one. Leave any of these alone and the agent's own choice is used."}),a?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(A0,{id:`${i}-connection-system`,label:"System",hint:"Founding the village, the write-up each time the day turns over, and the village's reading of what happened while you were away.",options:N,value:a.systemConnectionId,disabled:h,onChange:k=>{y({systemConnectionId:k})}}),(0,r.jsx)(A0,{id:`${i}-connection-narration`,label:"Narration",hint:"Everything the villagers say to you, and how the conversation reads back afterwards.",options:N,value:a.narrationConnectionId,disabled:h,onChange:k=>{y({narrationConnectionId:k})}}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-connection-image`,children:"Images"}),(0,r.jsxs)("select",{id:`${i}-connection-image`,className:`${i}-select`,value:a.imageConnectionId,disabled:h,onChange:k=>{y({imageConnectionId:k.target.value})},children:[(0,r.jsx)("option",{value:lp,children:"Disabled"}),(0,r.jsx)("option",{value:"",children:"Use Engine default"}),a.imageConnectionId.length>0&&a.imageConnectionId!==lp&&!f.some(k=>k.id===a.imageConnectionId)?(0,r.jsx)("option",{value:a.imageConnectionId,children:"Missing \u2014 this connection is gone"}):null,f.map(k=>(0,r.jsx)("option",{value:k.id,children:k.name},k.id))]}),(0,r.jsxs)("span",{className:`${i}-hint`,children:["This is the connection that Villages uses to generate images such as character sprites, the Village map, Venue backgrounds, etc."," ",(0,r.jsxs)("span",{className:`${i}-image-recommendation`,children:["The intended experience includes an image generation connection to bring the world and characters to life, and is ",(0,r.jsx)("em",{children:"highly"})," recommended."]})]})]})]}):c.length===0?(0,r.jsx)("span",{className:`${i}-hint`,children:"Reading this agent's connections\u2026"}):null,c?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:c}):null]})}function B0(){let[e,t]=(0,m.useState)(null),[a,n]=(0,m.useState)(""),[o,l]=(0,m.useState)(!1),[c,d]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let g=!1;return V("/narration").then(y=>{g||t(y)}).catch(y=>{g||n(q(y,"Village writing settings could not be read."))}),()=>{g=!0}},[]);let h=(0,m.useCallback)(async g=>{l(!0),d(!1),n("");try{let y=await V("/narration",{method:"PUT",body:JSON.stringify(g)});return t(y),d(!0),y}catch(y){return n(q(y,"That writing change could not be saved.")),null}finally{l(!1)}},[]);return{view:e,error:a,busy:o,saved:c,save:h}}function zS(){let{view:e,error:t,busy:a,saved:n,save:o}=B0(),[l,c]=(0,m.useState)(null),d=l??e?.styleInstructions??"";return(0,r.jsxs)("div",{className:i+"-field",children:[(0,r.jsx)("span",{className:i+"-label",children:"Narration style"}),(0,r.jsx)("p",{className:i+"-empty",children:"Shape scene descriptions and the descriptive beats around replies. Each resident's card still governs their spoken voice. Saved changes apply to the next generated venue turn."}),e?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("textarea",{className:i+"-textarea","aria-label":"Narration style",value:d,rows:3,maxLength:e.styleMaxLength,disabled:a,onChange:h=>c(h.target.value)}),(0,r.jsx)("button",{type:"button",className:i+"-button",disabled:a||d===e.styleInstructions,onClick:()=>{o({styleInstructions:d}).then(h=>{h&&c(h.styleInstructions)})},children:"Apply style"}),(0,r.jsx)("button",{type:"button",className:i+"-button",disabled:a||d===e.defaultStyleInstructions,onClick:()=>{o({styleInstructions:""}).then(h=>{h&&c(h.styleInstructions)})},children:"Restore default style"}),(0,r.jsxs)("div",{className:i+"-row",children:[(0,r.jsxs)("label",{className:i+"-field",children:[(0,r.jsx)("span",{className:i+"-label",children:"Tense"}),(0,r.jsxs)("select",{value:e.tense,disabled:a,onChange:h=>{o({tense:h.target.value})},children:[(0,r.jsx)("option",{value:"present",children:"Present"}),(0,r.jsx)("option",{value:"past",children:"Past"})]})]}),(0,r.jsxs)("label",{className:i+"-field",children:[(0,r.jsx)("span",{className:i+"-label",children:"Person"}),(0,r.jsxs)("select",{value:e.person,disabled:a,onChange:h=>{o({person:h.target.value})},children:[(0,r.jsx)("option",{value:"first",children:"First person (I)"}),(0,r.jsx)("option",{value:"second",children:"Second person (you)"}),(0,r.jsx)("option",{value:"third",children:"Third person (player name)"})]})]}),(0,r.jsxs)("label",{className:i+"-field",children:[(0,r.jsx)("span",{className:i+"-label",children:"Content rating"}),(0,r.jsxs)("select",{value:e.rating,disabled:a,onChange:h=>{o({rating:h.target.value})},children:[(0,r.jsx)("option",{value:"sfw",children:"SFW"}),(0,r.jsx)("option",{value:"nsfw",children:"NSFW"})]})]})]}),(0,r.jsx)("span",{className:i+"-hint",children:"Rating applies to venue narration and dialogue only. NSFW allows adult content when the scene calls for it."})]}):t?null:(0,r.jsx)("span",{className:i+"-hint",children:"Reading narration style\u2026"}),a?(0,r.jsx)("span",{className:i+"-hint",children:"Saving\u2026"}):null,n&&!a?(0,r.jsx)("span",{className:i+"-hint",role:"status",children:"Saved for the next venue turn."}):null,t?(0,r.jsx)("p",{className:i+"-error",role:"alert",children:t}):null]})}function MS(){let{view:e,error:t,busy:a,saved:n,save:o}=B0(),[l,c]=(0,m.useState)(null),d=l??e?.replyGuidance??"";return(0,r.jsxs)("section",{className:i+"-panel",children:[(0,r.jsx)("h2",{className:i+"-panel-title",children:"DEBUG: Villager reply guidance"}),(0,r.jsx)("p",{className:i+"-empty",children:"This prompt guides each resident's voice, knowledge, and motivation. Saved edits apply to the next generated venue turn."}),e?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("textarea",{className:i+"-textarea","aria-label":"Villager reply guidance",value:d,rows:12,maxLength:e.replyGuidanceMaxLength,disabled:a,onChange:h=>c(h.target.value)}),(0,r.jsxs)("div",{className:i+"-row",children:[(0,r.jsx)("button",{type:"button",className:i+"-button",disabled:a||d===e.replyGuidance,onClick:()=>{o({replyGuidance:d}).then(h=>{h&&c(h.replyGuidance)})},children:"Apply guidance"}),(0,r.jsx)("button",{type:"button",className:i+"-button",disabled:a||d===e.defaultReplyGuidance,onClick:()=>{o({replyGuidance:null}).then(h=>{h&&c(h.replyGuidance)})},children:"Restore built-in guidance"})]}),(0,r.jsxs)("details",{children:[(0,r.jsx)("summary",{children:"Show built-in guidance"}),(0,r.jsx)("pre",{className:i+"-hint",style:{whiteSpace:"pre-wrap"},children:e.defaultReplyGuidance})]})]}):t?null:(0,r.jsx)("span",{className:i+"-hint",children:"Reading villager reply guidance\u2026"}),a?(0,r.jsx)("span",{className:i+"-hint",children:"Saving\u2026"}):null,n&&!a?(0,r.jsx)("span",{className:i+"-hint",role:"status",children:"Saved for the next venue turn."}):null,t?(0,r.jsx)("p",{className:i+"-error",role:"alert",children:t}):null]})}function gr({portrait:e,name:t,className:a,glyph:n="initial"}){return(0,r.jsx)("span",{"aria-hidden":"true",className:a,children:e?(0,r.jsx)("img",{src:e.url,alt:"",style:lS(e.crop)}):n==="person"?(0,r.jsxs)("svg",{className:`${i}-person`,viewBox:"0 0 24 24","aria-hidden":"true",focusable:"false",children:[(0,r.jsx)("path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"}),(0,r.jsx)("circle",{cx:"12",cy:"7",r:"4",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})]}):t.slice(0,1).toUpperCase()})}function RS({villager:e,portrait:t,selected:a,onSelect:n}){return(0,r.jsxs)("div",{className:`${i}-tile`,"data-selected":a?"true":"false",children:[(0,r.jsxs)("div",{className:`${i}-tile-head`,children:[(0,r.jsx)(gr,{portrait:t,name:e.name,className:`${i}-avatar`}),(0,r.jsx)("button",{type:"button",className:`${i}-tile-name`,onClick:n,disabled:n===void 0,title:n?`See where ${e.name} is`:`${e.name} has no known venue`,children:e.name})]}),e.summary?(0,r.jsx)("p",{className:`${i}-tile-summary`,children:e.summary}):null,(0,r.jsxs)("div",{className:`${i}-tile-meta`,children:[e.missing?(0,r.jsx)("span",{className:`${i}-badge`,children:"card missing"}):null,e.tags.slice(0,3).map(o=>(0,r.jsx)("span",{className:`${i}-tag`,children:o},o))]})]})}function z0(e,t){let a=URL.createObjectURL(t),n=document.createElement("a");n.href=a,n.download=e,n.click(),setTimeout(()=>URL.revokeObjectURL(a),3e4)}async function OS(e){let t=e.sprite?.images??[];if(!t.length)return;let a=[...t].sort((N,f)=>{let $=C=>{let k=mu.indexOf(C);return k<0?mu.length:k};return $(N.label)-$(f.label)||N.label.localeCompare(f.label)||N.view.localeCompare(f.view)}),n=512,o=768,l=2,c=document.createElement("canvas");c.width=l*n,c.height=Math.ceil(a.length/l)*o;let d=c.getContext("2d");if(!d)throw new Error("The browser cannot assemble this sprite sheet.");let h=[];for(let N=0;N<a.length;N+=1){let f=a[N],$=new Image;$.src=f.url,await $.decode();let C=N%l*n,k=Math.floor(N/l)*o,D=Math.min(n/$.naturalWidth,o/$.naturalHeight),w=Math.round($.naturalWidth*D),v=Math.round($.naturalHeight*D);d.drawImage($,C+Math.floor((n-w)/2),k+o-v,w,v),h.push({view:f.view,expression:f.label,x:C,y:k,width:n,height:o})}let g=await new Promise((N,f)=>c.toBlob($=>$?N($):f(new Error("The browser could not export this sheet.")),"image/png")),y=e.name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"resident";z0(`${y}-sprites.png`,g),z0(`${y}-sprites.json`,new Blob([JSON.stringify({width:c.width,height:c.height,cells:h},null,2)],{type:"application/json"}))}function VS({villager:e,onSaved:t}){let a=`/villagers/${encodeURIComponent(e.characterId)}/sprites`,[n,o]=(0,m.useState)("front"),[l,c]=(0,m.useState)("neutral"),[d,h]=(0,m.useState)(""),[g,y]=(0,m.useState)(""),[N,f]=(0,m.useState)(!0),[$,C]=(0,m.useState)(null),[k,D]=(0,m.useState)([]),[w,v]=(0,m.useState)(!1),[b,S]=(0,m.useState)(""),[R,P]=(0,m.useState)(""),U=(0,m.useRef)(null),B=e.sprite?.images??[],fe=B.filter(I=>I.view===n),Y=B.some(I=>I.view==="front"&&I.label==="neutral"),De=fe.some(I=>I.label==="neutral"),Fe=l==="custom"?d.trim().toLowerCase().replace(/\s+/g,"_"):l,Ba=fe.find(I=>I.label===Fe),mi=[...mu,...B.map(I=>I.label).filter(I=>!mu.includes(I))].filter((I,te,Ie)=>Ie.indexOf(I)===te);(0,m.useEffect)(()=>{C(null),o("front"),c("neutral"),S(""),V(`${a}/source`).then(I=>D(I.sprites)).catch(()=>D([]))},[a]);async function qt(I){v(!0),S(""),P("");try{await I()}catch(te){S(q(te,"The sprite could not be prepared."))}finally{v(!1)}}function nt(){if(!/^[a-z0-9_-]{1,40}$/.test(Fe))throw new Error("Use a short expression name with letters, numbers, dashes, or underscores.");if(n==="side"&&!Y)throw new Error("Approve the front neutral sprite first.");if(Fe!=="neutral"&&!De)throw new Error(`Approve the ${n} neutral sprite first.`);return Fe}return(0,r.jsxs)("section",{className:`${i}-sprite-editor`,"aria-label":`${e.name} sprite studio`,children:[(0,r.jsxs)("div",{className:`${i}-sprite-heading`,children:[(0,r.jsxs)("div",{children:[(0,r.jsxs)("h3",{children:[e.name,"'s sprite studio"]}),(0,r.jsx)("p",{children:"Build a front view for player conversations and one side profile for villager-to-villager moments."})]}),(0,r.jsxs)("span",{className:`${i}-sprite-count`,children:[B.length," approved"]})]}),(0,r.jsx)("div",{className:`${i}-sprite-views`,"aria-label":"Sprite view",children:["front","side"].map(I=>(0,r.jsxs)("button",{type:"button",className:`${i}-sprite-view`,"aria-pressed":n===I,"data-active":n===I?"true":"false",disabled:w,onClick:()=>{o(I),c("neutral"),C(null)},children:[(0,r.jsx)("strong",{children:I==="front"?"Facing you":"Facing villagers"}),(0,r.jsxs)("span",{children:[B.filter(te=>te.view===I).length," approved \xB7"," ",I==="front"?"front":"side, mirrored left or right"]})]},I))}),(0,r.jsxs)("div",{className:`${i}-sprite-section-head`,children:[(0,r.jsx)("strong",{children:"Choose an expression"}),(0,r.jsx)("span",{children:"Only approved images appear in scenes."})]}),(0,r.jsxs)("div",{className:`${i}-sprite-choices`,children:[mi.map(I=>{let te=fe.find(Ie=>Ie.label===I);return(0,r.jsxs)("button",{type:"button",className:`${i}-sprite-choice`,"data-active":l===I?"true":"false","aria-pressed":l===I,disabled:w,onClick:()=>{c(I),C(null)},children:[(0,r.jsx)("span",{className:`${i}-sprite-choice-art`,children:te?(0,r.jsx)("img",{src:te.url,alt:""}):(0,r.jsx)("span",{"aria-hidden":"true",children:"\uFF0B"})}),(0,r.jsx)("span",{children:I}),(0,r.jsx)("small",{children:te?"Approved":"Open"})]},I)}),(0,r.jsxs)("button",{type:"button",className:`${i}-sprite-choice`,"data-active":l==="custom"?"true":"false","aria-pressed":l==="custom",disabled:w,onClick:()=>{c("custom"),C(null)},children:[(0,r.jsx)("span",{className:`${i}-sprite-choice-art`,"aria-hidden":"true",children:"\u2726"}),(0,r.jsx)("span",{children:"Custom"}),(0,r.jsx)("small",{children:"Name your own"})]})]}),l==="custom"?(0,r.jsxs)("label",{children:["Custom expression name",(0,r.jsx)("input",{value:d,maxLength:40,disabled:w,onChange:I=>{h(I.target.value),C(null)}})]}):null,(0,r.jsxs)("div",{className:`${i}-sprite-selected`,children:[(0,r.jsxs)("strong",{children:[n==="front"?"Front":"Side"," \xB7 ",Fe||"custom"]}),(0,r.jsx)("span",{children:Ba?"Approved art is ready. You can replace it after reviewing a new candidate.":"No approved art yet."})]}),n==="side"&&!Y?(0,r.jsx)("p",{className:`${i}-hint`,children:"Start with an approved front neutral sprite to keep the side profile recognizable."}):null,Fe!=="neutral"&&!De?(0,r.jsx)("p",{className:`${i}-hint`,children:"Approve this view's neutral sprite before adding expressions."}):null,(0,r.jsxs)("label",{children:["Appearance details for generation",(0,r.jsx)("textarea",{value:g,maxLength:2e3,disabled:w,onChange:I=>y(I.target.value),placeholder:"Use the resident\u2019s saved appearance, or describe it here"})]}),(0,r.jsxs)("label",{className:`${i}-row`,children:[(0,r.jsx)("input",{type:"checkbox",checked:N,disabled:w,onChange:I=>f(I.target.checked)})," ","Use an approved neutral or available portrait as the identity reference"]}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Turn references off for a connection that cannot accept images. Review identity carefully before approval."}),(0,r.jsxs)("div",{className:`${i}-sprite-actions`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:w||n==="side"&&!Y||Fe!=="neutral"&&!De,onClick:()=>{qt(async()=>{let I=nt(),te=await V(`${a}/generate`,{method:"POST",body:JSON.stringify({view:n,expression:I,appearance:g,useReference:N})});C({view:n,label:I,image:te.image}),P(`Candidate: ${te.width} \xD7 ${te.height}. Review before approving.`)})},children:w?"Working\u2026":`Generate ${n} ${Fe||"sprite"} \xB7 1 image request`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:w||n==="side"&&!Y||Fe!=="neutral"&&!De,onClick:()=>U.current?.click(),children:"Upload candidate"}),(0,r.jsx)("input",{ref:U,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",hidden:!0,onChange:I=>{qt(async()=>{let te=nt(),Ie=I.target.files?.[0];Ie&&C({view:n,label:te,image:await Bl(Ie)}),I.target.value=""})}})]}),(0,r.jsx)("p",{className:`${i}-hint`,children:"One cell per click. Approval, mirroring, and export use no image API. If the selected Engine connection fails, its configured fallback may make another provider attempt."}),$?(0,r.jsxs)("div",{className:`${i}-sprite-candidate`,children:[(0,r.jsxs)("div",{className:`${i}-sprite-section-head`,children:[(0,r.jsx)("strong",{children:"Review candidate"}),(0,r.jsxs)("span",{children:[$.view," \xB7 ",$.label]})]}),(0,r.jsxs)("div",{className:`${i}-sprite-candidate-views`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("img",{src:$.image,alt:`${$.view} ${$.label} candidate for ${e.name}`}),(0,r.jsx)("span",{children:$.view==="side"?"Facing right":"Facing you"})]}),$.view==="side"?(0,r.jsxs)("div",{children:[(0,r.jsx)("img",{className:`${i}-sprite-mirrored`,src:$.image,alt:""}),(0,r.jsx)("span",{children:"Mirrored left \xB7 no extra image"})]}):null]}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:w,onClick:()=>{qt(async()=>{let I=await V(`${a}/approve`,{method:"POST",body:JSON.stringify({view:$.view,expression:$.label,image:$.image})});t(I),C(null),P(`${$.view} ${$.label} approved.`)})},children:"Approve this sprite"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:w,onClick:()=>C(null),children:"Discard candidate"})]})]}):null,k.length&&n==="front"?(0,r.jsxs)("details",{className:`${i}-sprite-more`,children:[(0,r.jsx)("summary",{children:"Copy an existing Engine full-body sprite"}),(0,r.jsx)("div",{className:`${i}-row`,children:k.map(I=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:w||I.expression!=="neutral"&&!De,onClick:()=>{qt(async()=>{let te=await V(`${a}/import`,{method:"POST",body:JSON.stringify({view:n,expression:I.expression})});t(te),P(`${I.expression} copied to this Village.`)})},children:I.expression},I.expression))})]}):null,B.length?(0,r.jsx)(r.Fragment,{children:(0,r.jsxs)("details",{className:`${i}-sprite-more`,children:[(0,r.jsx)("summary",{children:"Display framing and export"}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsxs)("label",{children:["Display framing"," ",(0,r.jsxs)("select",{value:e.sprite?.framing.mode??"full",disabled:w,onChange:I=>{qt(async()=>t(await V(`${a}/framing`,{method:"PATCH",body:JSON.stringify({mode:I.target.value,cropPercent:e.sprite?.framing.cropPercent??58})})))},children:[(0,r.jsx)("option",{value:"full",children:"Full body"}),(0,r.jsx)("option",{value:"half",children:"Waist up"})]})]}),e.sprite?.framing.mode==="half"?(0,r.jsxs)("label",{children:["Visible height: ",e.sprite.framing.cropPercent,"%"," ",(0,r.jsx)("input",{type:"range",min:40,max:85,value:e.sprite.framing.cropPercent,disabled:w,onChange:I=>{qt(async()=>t(await V(`${a}/framing`,{method:"PATCH",body:JSON.stringify({mode:"half",cropPercent:Number(I.target.value)})})))}})]}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:w,onClick:()=>{qt(()=>OS(e))},children:"Download both views and manifest"})]})]})}):null,R?(0,r.jsx)("p",{role:"status",children:R}):null,b?(0,r.jsx)("p",{role:"alert",children:b}):null]})}function DS({entry:e,onDecide:t}){let[a,n]=(0,m.useState)(e.improvement?.title??""),[o,l]=(0,m.useState)(e.improvement?.description??""),[c,d]=(0,m.useState)(e.improvement?.extraBeds??0),[h,g]=(0,m.useState)(e.improvementSlot??0),[y,N]=(0,m.useState)(!1),[f,$]=(0,m.useState)(""),C=D=>{N(!0),$(""),t(D,{title:a,description:o,extraBeds:c,slot:h}).catch(w=>$(q(w,"That Venue request could not be decided."))).finally(()=>N(!1))},k=a!==e.improvement?.title||o!==e.improvement?.description||c!==e.improvement?.extraBeds||h!==e.improvementSlot;return(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsxs)("label",{className:`${i}-label`,children:["Proposed improvement",(0,r.jsx)("input",{className:`${i}-notice-input`,value:a,onChange:D=>n(D.target.value)})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["What changes?",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:o,onChange:D=>l(D.target.value)})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Extra beds",(0,r.jsx)("input",{type:"number",min:0,max:3,value:c,onChange:D=>d(Number(D.target.value))})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Improvement slot",(0,r.jsxs)("select",{value:h,onChange:D=>g(Number(D.target.value)),children:[(0,r.jsx)("option",{value:0,children:"Slot 1"}),(0,r.jsx)("option",{value:1,children:"Slot 2"})]})]}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:y||!a.trim()||!o.trim(),onClick:()=>C(!0),children:k?"Send counteroffer":"Approve exact request"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:y,onClick:()=>C(!1),children:"Decline"})]}),f?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:f}):null]})}function _S({room:e,picture:t,draft:a,mode:n,targetId:o,busy:l,error:c,greetingNotice:d,ruling:h,open:g,ended:y,playerName:N,playerPortrait:f,portraits:$,sprites:C,onDraft:k,onMode:D,onTarget:w,onSend:v,onLeave:b,onViewVenue:S,onEnterPrivate:R,privateSpaceOwnerName:P,onEnd:U,onLeavePending:B,endFailed:fe,onRetryGreeting:Y,onContinueWithoutGreeting:De,notices:Fe,onDismissNotice:Ba,debugDiscardEnabled:mi,onDebugDiscard:qt,onUseMailbox:nt}){let[I,te]=(0,m.useState)(0),[Ie,La]=(0,m.useState)(!1),[le,de]=(0,m.useState)(!1),[Ea,da]=(0,m.useState)(null),Q=(0,m.useRef)(null),Ca=(0,m.useRef)(null),dn=!y&&e.status==="active",Aa=(0,m.useRef)(null),he=(0,m.useCallback)(()=>{da(null),window.requestAnimationFrame(()=>Q.current?.focus())},[]);(0,m.useEffect)(()=>{if(!Ea)return;window.requestAnimationFrame(()=>Ca.current?.focus());let A=ke=>{if(ke.key==="Tab"){ke.preventDefault(),Ca.current?.focus();return}ke.key==="Escape"&&(ke.preventDefault(),he())};return window.addEventListener("keydown",A),()=>window.removeEventListener("keydown",A)},[he,Ea]);let Ae=(0,m.useMemo)(()=>{let A=[],ke=new Map;for(let pe of e.lines){if(pe.kind!=="side"&&pe.kind!=="whisper"||!pe.asideFor)continue;let ha=ke.get(pe.asideFor)??[];ha.push({register:pe.kind,text:pe.content,...pe.targetId?{target:e.participants.find(Jt=>Jt.characterId===pe.targetId)?.name??pe.targetId}:{},speakerId:pe.speakerId,name:pe.name,expression:pe.expression,gazeAt:pe.gazeAt}),ke.set(pe.asideFor,ha)}for(let pe of e.lines){if(pe.kind==="side"||pe.kind==="whisper")continue;let ha=pe.speakerId.length===0,Jt=Qw(pe.content,pe.beats??null);Jt.paragraphs.forEach((br,Rn)=>{A.push({key:`${A.length}`,speakerId:ha?"":pe.speakerId,name:ha?N:pe.name,player:ha,text:br,asides:[...Jt.asides[Rn]??[],...Rn===Jt.paragraphs.length-1?ke.get(pe.id??"")??[]:[]],...pe.kind?{register:pe.kind==="narration"?"narration":"speech"}:{},...pe.expression?{expression:pe.expression}:{},...pe.gazeAt?{gazeAt:pe.gazeAt}:{}})})}return A},[N,e.lines,e.participants]);(0,m.useLayoutEffect)(()=>{te(A=>Ww(Aa.current,e.id,Ae.length,A)),Aa.current={roomId:e.id,stepCount:Ae.length}},[e.id,Ae.length]);let ee=Math.min(I,Math.max(0,Ae.length-1)),oe=Ae[ee],za=ee>0,At=ee<Ae.length-1,Kt=oe?.register??(oe===void 0||oe.speakerId==="__venue_scene__"?"narration":oe.player||Xw(oe.text)==="speech"?"speech":"narration"),St=oe===void 0?void 0:oe.player?f:$[oe.speakerId],ut=e.participants.filter(A=>e.activeIds.includes(A.characterId)),E=e.status==="closed"&&ut.length===0?e.participants:ut,H=E.find(A=>A.characterId===oe?.speakerId),me=E.filter(A=>A.characterId!==H?.characterId),ye=E.find(A=>A.characterId===oe?.gazeAt&&A.characterId!==H?.characterId),Be=me.filter(A=>A.characterId!==ye?.characterId),dt=!!(H&&ye&&E.indexOf(ye)<E.indexOf(H)),Ke=H?ye?[dt?ye:Be[0],H,dt?Be[0]:ye].filter(A=>!!A):[me[0],H,me[1]].filter(A=>!!A):E.slice(0,3),G=E.filter(A=>!Ke.some(ke=>ke.characterId===A.characterId)),it=(0,r.jsxs)("p",{className:`${i}-chat-pending`,role:"status",children:[(0,r.jsx)("span",{className:`${i}-chat-spinner ${i}-spin`,"aria-hidden":"true"}),(0,r.jsx)("span",{className:`${i}-chat-pending-label`,children:e.status==="opening"?"Preparing a greeting\u2026":e.status==="closing"?"Saving this visit\u2026":"The room is answering\u2026"})]});return(0,r.jsxs)("aside",{className:`${i}-chat`,"data-open":g?"true":"false","data-ended":y?"true":"false","data-opening-error":e.status==="opening"&&c?"true":"false","aria-label":`${e.area==="outside"?"Outside":"Inside"} ${e.placeName}`,children:[(0,r.jsx)("p",{className:`${i}-visually-hidden`,children:`Here now: ${ut.length?ut.map(A=>`${A.name}${A.doing?` is ${A.doing}`:""}`).join("; "):"nobody"}.`}),(0,r.jsx)("div",{className:`${i}-chat-scene`,"aria-hidden":"true",children:t?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("img",{className:`${i}-chat-scene-backdrop`,src:t,alt:""}),(0,r.jsx)("span",{className:`${i}-chat-scrim`}),(0,r.jsx)("span",{className:`${i}-chat-vignette`})]}):(0,r.jsx)("span",{className:`${i}-chat-scene-placeholder`,children:e.area==="outside"?"Exterior not drawn yet":"Interior / space not drawn yet"})}),(0,r.jsx)("div",{className:`${i}-chat-head`,children:(0,r.jsxs)("span",{className:`${i}-chat-actions`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-chat-tool`,onClick:S,disabled:l,children:"View Venue"}),R?(0,r.jsxs)("button",{type:"button",className:`${i}-button ${i}-chat-tool`,onClick:R,disabled:l,children:["Enter ",P??"private space"]}):null,mi&&e.status!=="closed"?(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-chat-tool`,onClick:qt,disabled:l,title:"DEBUG: Clears this visit and transcript. Completed effects and memories remain.",children:"DEBUG: Discard Visit"}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-chat-tool`,onClick:U,disabled:l,title:"End this visit and leave the venue",children:"End visit and leave"}),fe||e.status==="closing"?(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-chat-tool`,onClick:B,children:"Leave with memory pending"}):null]})}),e.area==="outside"?(0,r.jsx)("p",{className:`${i}-hint`,role:"status",children:"You\u2019re outside this Residence. A resident needs to invite you in. You can speak in your own words, or leave whenever you like."}):null,Fe.length>0?(0,r.jsx)("div",{className:`${i}-room-stars`,"aria-live":"polite","aria-label":"Village events",children:Fe.map(A=>(0,r.jsxs)("div",{className:`${i}-room-star`,children:[(0,r.jsx)("span",{"aria-hidden":"true",children:"\u2726"}),A.kind==="memory"&&A.detail?(0,r.jsx)("button",{type:"button",className:`${i}-room-star-detail`,onClick:ke=>{Q.current=ke.currentTarget,da(A)},"aria-label":`View memory: ${A.text}`,title:"View saved memory",children:A.text}):(0,r.jsx)("span",{children:A.text}),(0,r.jsx)("button",{type:"button",className:`${i}-room-star-dismiss`,onClick:()=>{Ea?.id===A.id&&da(null),Ba(A.id)},"aria-label":`Dismiss ${A.text}`,title:"Dismiss notice",children:"\xD7"})]},A.id))}):null,Ea?.detail?(0,r.jsx)("div",{className:`${i}-memory-backdrop`,onClick:A=>{A.currentTarget===A.target&&he()},children:(0,r.jsxs)("div",{className:`${i}-memory-dialog`,role:"dialog","aria-modal":"true","aria-labelledby":`${i}-memory-dialog-title`,children:[(0,r.jsxs)("div",{className:`${i}-memory-dialog-head`,children:[(0,r.jsx)("h2",{id:`${i}-memory-dialog-title`,children:Ea.text}),(0,r.jsx)("button",{ref:Ca,type:"button",onClick:he,"aria-label":"Close memory",children:"\xD7"})]}),(0,r.jsx)("p",{children:Ea.detail})]})}):null,ut.length>0?(0,r.jsx)("div",{className:`${i}-chat-activities`,tabIndex:0,"aria-label":"What everyone here is doing",children:ut.map(A=>(0,r.jsx)("span",{className:`${i}-chat-activity`,children:`${A.name}: ${A.doing||"spending time here"}`},A.characterId))}):null,(0,r.jsxs)("div",{className:`${i}-chat-stage`,"aria-hidden":"true",children:[(0,r.jsx)("div",{className:`${i}-chat-cast`,children:Ke.map((A,ke)=>{let pe=C[A.characterId],ha=A.characterId===H?.characterId,Jt=oe?.asides.find(Pi=>Pi.speakerId===A.characterId),br=ha?oe?.expression??"neutral":Jt?.expression??"neutral",Rn=ha?oe?.gazeAt:Jt?.gazeAt??(A.characterId===ye?.characterId?H?.characterId:void 0),fu=Ke.findIndex(Pi=>Pi.characterId===Rn),Ma=t0(pe?.images??[],br,e0(ke,fu));return(0,r.jsxs)("div",{className:`${i}-chat-cast-person`,"data-active":A.characterId===H?.characterId?"true":"false",children:[Ma?(0,r.jsx)("img",{src:Ma.image.url,alt:"","data-framing":pe?.framing.mode??"full","data-facing":Ma.mirrored?"left":"right"}):(0,r.jsx)(gr,{portrait:$[A.characterId],name:A.name,className:`${i}-avatar`}),(0,r.jsx)("span",{children:A.name})]},A.characterId)})}),G.length>0?(0,r.jsx)("div",{className:`${i}-chat-cast-rest`,children:G.map(A=>(0,r.jsxs)("span",{children:[(0,r.jsx)(gr,{portrait:$[A.characterId],name:A.name,className:`${i}-avatar`}),A.name]},A.characterId))}):null]}),(0,r.jsxs)("div",{className:`${i}-chat-vn`,children:[e.lines.length>0?(0,r.jsx)("button",{type:"button",className:`${i}-chat-history-toggle`,"aria-expanded":Ie,onClick:()=>La(A=>!A),children:Ie?"Hide history":"History"}):null,Ie?(0,r.jsx)("div",{className:`${i}-chat-log`,role:"log","aria-label":"Venue conversation history",tabIndex:0,children:e.lines.map((A,ke)=>(0,r.jsxs)("p",{className:`${i}-chat-vn-text`,children:[(0,r.jsxs)("strong",{children:[A.role==="user"?N:A.kind==="narration"||A.speakerId==="__venue_scene__"?"Narration":A.name||"Resident",A.kind==="side"?" \xB7 aside":A.kind==="whisper"?" \xB7 whisper":"",":"," "]}),pr(A.content,`history-${ke}-`)]},A.id??ke))}):null,oe&&oe.asides.length>0?(0,r.jsx)("div",{className:`${i}-chat-vn-asides`,"aria-live":"polite",children:oe.asides.map((A,ke)=>(0,r.jsxs)("div",{className:`${i}-chat-vn-aside`,"data-register":A.register,children:[(0,r.jsx)(gr,{portrait:A.speakerId?$[A.speakerId]:St,name:A.name??oe.name,glyph:oe.player?"person":"initial",className:`${i}-chat-vn-aside-face`}),(0,r.jsxs)("div",{className:`${i}-chat-vn-aside-column`,children:[(0,r.jsxs)("p",{className:`${i}-chat-vn-aside-head`,children:[(0,r.jsx)("span",{className:`${i}-chat-vn-aside-icon`,children:A.register==="whisper"?"\u{1F92B}":"\u{1F4AC}"}),(0,r.jsx)("span",{className:`${i}-chat-vn-aside-name`,children:A.name??oe.name}),A.register==="whisper"&&A.target?(0,r.jsx)("span",{className:`${i}-chat-vn-aside-target`,children:`\u2192 ${A.target}`}):null]}),(0,r.jsx)("p",{className:`${i}-chat-vn-aside-text`,children:pr(A.text,`vn-aside-${ke}-`)})]})]},`${ke}-${A.register}`))}):null,(0,r.jsxs)("div",{className:`${i}-chat-vn-card`,"data-register":Kt,children:[(0,r.jsxs)("div",{className:`${i}-chat-vn-row`,children:[Kt==="speech"?(0,r.jsx)(gr,{portrait:St,name:oe?.name??"",glyph:oe?.player?"person":"initial",className:`${i}-chat-vn-portrait`}):null,(0,r.jsxs)("div",{className:`${i}-chat-vn-column`,children:[Kt==="narration"?(0,r.jsx)("p",{className:`${i}-chat-vn-label`,children:"Narration"}):(0,r.jsx)("p",{className:`${i}-chat-vn-name`,children:oe?.name??""}),(0,r.jsxs)("div",{className:`${i}-chat-vn-reading`,role:"region","aria-label":"Current paragraph","aria-live":"polite",tabIndex:0,children:[oe?Kt==="narration"?(0,r.jsx)("p",{className:`${i}-chat-vn-beat`,"data-register":"narration",children:pr(oe.text,"vn-beat-")}):(0,r.jsx)("p",{className:`${i}-chat-vn-text`,children:pr(oe.text,"vn-")}):(0,r.jsx)("p",{className:`${i}-chat-vn-text`,"data-empty":"true",children:e.status==="opening"?`Preparing a greeting in ${e.placeName}\u2026`:ut.length===0?`You are alone in ${e.placeName}.`:"\u2026"}),!y&&l?it:null]})]})]}),za||At?(0,r.jsxs)("div",{className:`${i}-chat-vn-nav`,children:[(0,r.jsxs)("button",{type:"button",className:`${i}-chat-vn-button`,onClick:()=>te(ee-1),disabled:!za,title:"Read the paragraph before this one",children:[(0,r.jsx)("svg",{viewBox:"0 0 16 16","aria-hidden":"true",focusable:"false",children:(0,r.jsx)("path",{d:"M10 3.5 5.5 8l4.5 4.5",fill:"none",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round"})}),"Previous paragraph"]}),(0,r.jsx)("span",{className:`${i}-chat-vn-counter`,children:`${ee+1} / ${Math.max(1,Ae.length)}`}),(0,r.jsxs)("button",{type:"button",className:`${i}-chat-vn-button`,onClick:()=>te(ee+1),disabled:!At,title:"Read the next paragraph",children:["Next paragraph",(0,r.jsx)("svg",{viewBox:"0 0 16 16","aria-hidden":"true",focusable:"false",children:(0,r.jsx)("path",{d:"M6 3.5 10.5 8 6 12.5",fill:"none",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round"})})]})]}):null]}),(0,r.jsxs)("div",{className:`${i}-room-panel-tools`,children:[e.lines.length>0?(0,r.jsx)("button",{type:"button",className:`${i}-chat-history-toggle`,"aria-expanded":Ie,onClick:()=>La(A=>!A),children:Ie?"Hide history":"History"}):null,(0,r.jsx)("span",{className:`${i}-spacer`}),y&&!At?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:U,disabled:l,children:"Return to map"}):null]}),c&&e.status==="opening"?(0,r.jsxs)("div",{className:`${i}-room-error`,role:"alert",children:[(0,r.jsx)("p",{children:c}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:U,disabled:l,children:"Back to map"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:Y,disabled:l,children:"Retry greeting"}),e.id?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:De,disabled:l,children:"Continue without greeting"}):null]}):null,d?(0,r.jsx)("div",{className:`${i}-room-error`,role:"status",children:(0,r.jsx)("p",{children:d})}):null,h?(0,r.jsx)("p",{className:`${i}-empty`,children:h}):null,e.status==="closing"?(0,r.jsx)("p",{className:`${i}-hint`,children:"The visit is still being remembered. You can leave with memory pending if filing cannot finish."}):null,dn&&n==="fulfill"&&ut.length===0?(0,r.jsx)("p",{className:`${i}-hint`,children:"Nobody is here whose wish you can fulfill."}):null,dn?(0,r.jsxs)("div",{className:`${i}-composer`,children:[n==="fulfill"&&ut.length>0?(0,r.jsxs)("select",{value:o,onChange:A=>w(A.target.value),"aria-label":"Whose wish you fulfilled",disabled:l||y||e.status!=="active",children:[(0,r.jsx)("option",{value:"",children:"Choose one villager"}),ut.map(A=>(0,r.jsx)("option",{value:A.characterId,children:A.name},A.characterId))]}):null,(0,r.jsx)("div",{className:`${i}-composer-row`,children:(0,r.jsxs)("span",{className:`${i}-chat-input`,children:[(0,r.jsxs)("span",{className:`${i}-room-mode-anchor`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-room-mode-toggle`,onClick:()=>de(A=>!A),"aria-label":`Mode: ${n==="chat"?"Chat":"Fulfill"}. Choose mode`,"aria-haspopup":"menu","aria-expanded":le,title:n==="chat"?"Chat":"Fulfill",children:"\u{1F4AC}"}),le?(0,r.jsxs)("span",{className:`${i}-room-mode-menu`,role:"menu","aria-label":"Visit mode",children:[["chat","fulfill"].map(A=>(0,r.jsx)("button",{type:"button",role:"menuitemradio","aria-checked":n===A,disabled:l||A==="fulfill"&&ut.length===0,onClick:()=>{D(A),de(!1)},children:A==="chat"?"Chat":"Fulfill"},A)),(0,r.jsx)("button",{type:"button",role:"menuitem",disabled:l||e.status!=="active",onClick:()=>{de(!1),b()},children:"Leave Scene"})]}):null]}),nt?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:nt,title:"Use the Mailbox at home",children:"Use\u2026 Mailbox"}):null,(0,r.jsx)("textarea",{className:`${i}-textarea`,value:a,onChange:A=>k(A.target.value),onKeyDown:A=>{Fw(A.key,A.shiftKey,A.nativeEvent.isComposing)&&(A.preventDefault(),e.status==="active"&&(n!=="fulfill"||o)&&v())},placeholder:n==="fulfill"?"What did you do for them?":"Say or do something\u2026","aria-label":`Message at ${e.placeName}`,disabled:l||y||e.status!=="active"}),(0,r.jsx)("button",{type:"button",className:`${i}-chat-send`,onClick:v,disabled:l||y||e.status!=="active"||a.trim().length===0||n==="fulfill"&&!o,"aria-label":l?"Sending":"Send",title:l?"Sending":"Send",children:l?"Sending\u2026":"Send"})]})}),c&&e.status!=="opening"?(0,r.jsxs)("div",{className:`${i}-room-error`,role:"alert",children:[(0,r.jsx)("p",{children:c}),e.status==="active"&&a.trim()?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:v,disabled:l||y,children:"Retry message"}):null]}):null]}):null]}),y?(0,r.jsx)("p",{className:`${i}-chat-ended`,children:"That is the end of it. Each of them has kept what they took from it, and the village is yours again."}):null]})}var M0="Testing action: runs normal time catch-up, then bypasses Story pace for one visual Events update. It can spend a model call, but its prose cannot change memories, wishes, notices, venues, or resident behavior.";function HS({element:e}){let[t,a]=(0,m.useState)(!1);(0,m.useLayoutEffect)(()=>{let s=()=>{let p=e.getBoundingClientRect();a(p.width<=704||p.width<=880&&p.height<=512)};s();let u=new ResizeObserver(s);return u.observe(e),()=>u.disconnect()},[e]);let[n,o]=(0,m.useState)(null),[l,c]=(0,m.useState)(null),[d,h]=(0,m.useState)(null),[g,y]=(0,m.useState)(0),[N,f]=(0,m.useState)("residents"),[$,C]=(0,m.useState)(null),[k,D]=(0,m.useState)(null),[w,v]=(0,m.useState)(0),[b,S]=(0,m.useState)(0),[R,P]=(0,m.useState)(0),[U,B]=(0,m.useState)(null),[fe,Y]=(0,m.useState)(!1),[De,Fe]=(0,m.useState)(""),[Ba,mi]=(0,m.useState)(""),[qt,nt]=(0,m.useState)(""),[I,te]=(0,m.useState)(null),[Ie,La]=(0,m.useState)(!1),[le,de]=(0,m.useState)("home"),[Ea,da]=(0,m.useState)(null),[Q,Ca]=(0,m.useState)("view"),[dn,Aa]=(0,m.useState)(!1),[he,Ae]=(0,m.useState)(null),[ee,oe]=(0,m.useState)(null),[za,At]=(0,m.useState)(!1),[Kt,St]=(0,m.useState)(""),[ut,E]=(0,m.useState)(""),[H,me]=(0,m.useState)(""),[ye,Be]=(0,m.useState)(null),[dt,Ke]=(0,m.useState)(!1),[G,it]=(0,m.useState)("village"),[A,ke]=(0,m.useState)("index"),[pe,ha]=(0,m.useState)({}),[Jt,br]=(0,m.useState)(null),[Rn,fu]=(0,m.useState)({}),[Ma,Pi]=(0,m.useState)({}),[bu,Ll]=(0,m.useState)(""),[G0,yp]=(0,m.useState)(null),[wp,$p]=(0,m.useState)(""),[hn,jl]=(0,m.useState)(""),[ma,Gl]=(0,m.useState)(""),[vu,xp]=(0,m.useState)(null),[Yl,Np]=(0,m.useState)(""),[Xl,Sp]=(0,m.useState)([]),[yu,Tp]=(0,m.useState)(1600),[ja,kp]=(0,m.useState)([]),[Fi,Ep]=(0,m.useState)(1600),[wu,Y0]=(0,m.useState)(null),[Cp,Ap]=(0,m.useState)(""),[Ql,Wi]=(0,m.useState)([]),[zp,X0]=(0,m.useState)(""),[pa,Zl]=(0,m.useState)([]),[pi,It]=(0,m.useState)(!1),[Kl,gi]=(0,m.useState)(!1),[Q0,$u]=(0,m.useState)(null),[Z0,xu]=(0,m.useState)(null),[Jl,Nu]=(0,m.useState)(null),[Pl,Mp]=(0,m.useState)(""),[Ye,Su]=(0,m.useState)(0),[Ra,Rp]=(0,m.useState)(""),[Tt,Op]=(0,m.useState)(""),[Pt,Vp]=(0,m.useState)(""),[Ga,Dp]=(0,m.useState)(""),[K0,Fl]=(0,m.useState)([]),[Ee,fi]=(0,m.useState)([]),[_p,On]=(0,m.useState)(null),[Tu,bi]=(0,m.useState)(null),[Ft,eo]=(0,m.useState)({}),[vr,to]=(0,m.useState)(null),[Oa,ao]=(0,m.useState)(!1),[Hp,ku]=(0,m.useState)(""),[Eu,Up]=(0,m.useState)(h0),[ze,vi]=(0,m.useState)("generate"),[J0,Cu]=(0,m.useState)(""),[Wl,Au]=(0,m.useState)(null),[yr,zu]=(0,m.useState)(null),[yi,Mu]=(0,m.useState)(""),[wr,Ru]=(0,m.useState)(""),[zt,$r]=(0,m.useState)(!1),[qp,es]=(0,m.useState)(""),[Ou,P0]=(0,m.useState)("Connections are still loading."),[Ip,Bp]=(0,m.useState)(!1),[F0,xr]=(0,m.useState)(!1),[Lp,be]=(0,m.useState)(""),[W0,ts]=(0,m.useState)(!1),[as,ns]=(0,m.useState)(""),[Va,Vu]=(0,m.useState)(null),[Du,Nr]=(0,m.useState)(null),[e1,_u]=(0,m.useState)(!1),[Ya,no]=(0,m.useState)(""),[jp,Vn]=(0,m.useState)(null),io=n?.settings.townMapView??hu("cover"),Gp=n?Va?.size??{width:n.settings.townMapExpectedWidth,height:n.settings.townMapExpectedHeight}:null,Yp=n?ze==="existing"?{width:n.settings.townMapExpectedWidth,height:n.settings.townMapExpectedHeight}:yr&&Wl===ze?yr:{width:n.settings.townMapGenerationWidth,height:n.settings.townMapGenerationHeight}:null,t1=n?{min:n.settings.townMapZoomMin,max:n.settings.townMapZoomMax,step:n.settings.townMapZoomStep}:{min:1,max:1,step:.1},is=Va?Va.image:as||null,wi=ze==="none"?null:ze==="existing"?as||null:Wl===ze&&J0||null,os=Va!==null||e1,Sr=os?Du??io:io,Hu=Va?up(Va.size):null,[Tr,Me]=(0,m.useState)(""),[Mt,Z]=(0,m.useState)(""),[_,j]=(0,m.useState)(!1),[L,Je]=(0,m.useState)(null),[a1,kr]=(0,m.useState)(!1),[n1,Xa]=(0,m.useState)(!1),[Er,oo]=(0,m.useState)(""),[rs,Uu]=(0,m.useState)("chat"),[Cr,ls]=(0,m.useState)(""),[i1,Xp]=(0,m.useState)(""),[o1,ga]=(0,m.useState)([]),Wt=(0,m.useRef)(new Set),[qu,r1]=(0,m.useState)(!1),Qp=(0,m.useRef)(0),ro=(0,m.useRef)(0),Zp=(0,m.useRef)(""),[Iu,Ar]=(0,m.useState)(""),[fa,We]=(0,m.useState)(!1),lo=(0,m.useRef)(!1),so=(0,m.useRef)(null),ss=(0,m.useRef)(null),zr=(0,m.useRef)(!1),[l1,ft]=(0,m.useState)(""),[s1,Mr]=(0,m.useState)(""),[Bu,Lu]=(0,m.useState)(!1),[cs,ju]=(0,m.useState)(""),Kp=(0,m.useRef)(""),us=(0,m.useRef)(!1),[ds,Jp]=(0,m.useState)(!1),Gu=(0,m.useRef)(null),Yu=(0,m.useRef)(null);(0,m.useEffect)(()=>{let s=Yu.current,u=Gu.current;s===null||!u||(Yu.current=null,u.focus(),u.setSelectionRange(s,s))},[hn]);let hs=(0,m.useCallback)(async(s=!1)=>{if(us.current)return null;us.current=!0;let u=setTimeout(()=>Jp(!0),bS);try{let p=await V("/reconcile",{method:"POST",body:s?JSON.stringify({forceStory:!0}):void 0});return o(p),p}catch{return null}finally{clearTimeout(u),Jp(!1),us.current=!1}},[]),Pp=(0,m.useCallback)(async()=>{let s=n?.happenings[0]?.id??"";ju("Writing...");let u=await hs(!0);if(!u){ju("The update request failed. Check the village again before retrying; time catch-up may already have run.");return}ju((u.happenings[0]?.id??"")===s?"No new happening was added. Other village records may have changed during catch-up.":"A new visual event was added. See Events.")},[n,hs]),Re=(0,m.useCallback)(async(s={})=>{try{let u=await V("",{signal:s.signal});o(u),Me("")}catch(u){if(s.signal?.aborted||s.quiet)return;o(null),Me(q(u,"Could not read the village."))}},[]);(0,m.useEffect)(()=>{let s=n?.village.nextTransitionAt??"";s.length===0||s===Kp.current||(Kp.current=s,n?.isFounded&&hs())},[n,hs]);let Qa=(0,m.useCallback)(async s=>{try{let u=await V("/catalog",{signal:s});c(u.characters),Me("")}catch(u){if(s?.aborted)return;Me(q(u,"Could not read your character library."))}},[]),co=(0,m.useCallback)(async s=>{try{let u=await V("/personas",{signal:s});xp(u.personas)}catch(u){if(s?.aborted)return;xp([]),Me(q(u,"Could not read your Personas."))}},[]),uo=(0,m.useCallback)(async s=>{try{let u=await V("/lorebooks",{signal:s});Y0(u.books),Ap("")}catch(u){if(s?.aborted)return;Ap(q(u,"Could not read Engine lorebooks. Selected books will be skipped until available."))}},[]),Fp=(0,m.useCallback)(async s=>{try{let u=await V("/story?offset=0&limit=50",{signal:s});h(u.entries),y(u.total)}catch(u){if(s?.aborted)return;h(null),Me(q(u,"Could not read the village story."))}},[]),ms=(0,m.useCallback)(async s=>{try{let u=await V("/memories",{signal:s});C(u),Me("")}catch(u){if(s?.aborted)return;C(null),Me(q(u,"Could not read villager memories."))}},[]),c1=(0,m.useCallback)(async(s,u)=>{let p=s==="durable"?"Forget this durable memory?":"Let this passing recollection go now?";if(window.confirm(p)){j(!0);try{await V(`/memories/${s}/${encodeURIComponent(u)}`,{method:"DELETE"}),await ms()}catch(x){Me(q(x,"That memory could not be removed."))}finally{j(!1)}}},[ms]),u1=(0,m.useCallback)(async s=>{j(!0);try{let u=await V(`/story/${encodeURIComponent(s)}`,{method:"DELETE"});h(u.entries),y(u.total),Me("")}catch(u){Me(q(u,"That memory could not be removed."))}finally{j(!1)}},[]),d1=(0,m.useCallback)(async()=>{let s=d?.length??0;try{let u=await V(`/story?offset=${s}&limit=50`);h(p=>[...p??[],...u.entries]),y(u.total)}catch(u){Me(q(u,"Could not read more memories."))}},[d]),ps=(0,m.useCallback)(async s=>{try{let u=await V("/agendas",{signal:s});te(u.villagers)}catch(u){if(s?.aborted)return;te(null),Me(q(u,"Could not read what the villagers wish for."))}},[]);(0,m.useEffect)(()=>{if(le!=="menu"||G!=="agendas"&&G!=="schedules"||!I?.some(u=>u.agenda?.personalizationPending&&!u.agenda.personalizationFailure))return;let s=window.setInterval(()=>{ps()},5e3);return()=>window.clearInterval(s)},[I,ps,G,le]);let h1=(0,m.useCallback)(async s=>{j(!0);try{let u=await V(`/agendas/${encodeURIComponent(s)}/regenerate`,{method:"POST"});te(u.villagers),Me("")}catch(u){Me(q(u,"That villager could not be asked again."))}finally{j(!1)}},[]),m1=(0,m.useCallback)(async(s,u)=>{j(!0);try{let p=await V(`/agendas/${encodeURIComponent(s)}/completed/${encodeURIComponent(u)}/correct`,{method:"POST"});te(p.villagers),Me("")}catch(p){Me(q(p,"That wish completion could not be corrected."))}finally{j(!1)}},[]),p1=(0,m.useCallback)(async(s,u)=>{j(!0);try{let p=await V(`/agendas/${encodeURIComponent(s)}/ingestion`,{method:"PATCH",body:JSON.stringify({ingestSchedule:u})});te(p.villagers),Me("")}catch(p){Me(q(p,"Schedule use could not be changed."))}finally{j(!1)}},[]);(0,m.useEffect)(()=>{let s=new AbortController;return Re({signal:s.signal}),()=>s.abort()},[Re]),(0,m.useEffect)(()=>{let s=()=>{document.hidden||Re({quiet:!0})},u=setInterval(()=>{document.hidden||us.current||Re({quiet:!0})},fS);return document.addEventListener("visibilitychange",s),()=>{clearInterval(u),document.removeEventListener("visibilitychange",s)}},[Re]),(0,m.useEffect)(()=>{if(!L?.id||L.status==="closed"||le!=="room")return;Zp.current!==L.id?(Zp.current=L.id,ro.current=Date.parse(L.lastActivityAt||L.startedAt)||Date.now()):ro.current=Math.max(ro.current,Date.parse(L.lastActivityAt||L.startedAt)||0);let s=!1,u=O=>{s||(Je(null),Xa(!1),ga([]),Wt.current.clear(),Ar(O==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),de("home"),Re())},p=(O=!1)=>{V("/rooms/active").then(async({session:se})=>{if(se?.id===L.id){O&&(await V("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:L.id})}),ro.current=Date.now());return}let ie=await V(`/rooms/archive/${encodeURIComponent(L.id)}`).catch(()=>null);u(ie?.visit.endReason==="inactivity"?"inactivity":"elsewhere")}).catch(se=>{let ie=ql(se);ie&&u(ie)})},x=O=>{if(Date.now()-ro.current>=30*6e4){O.cancelable&&O.preventDefault(),O.stopImmediatePropagation(),p(!0);return}ro.current=Date.now(),!(Date.now()-Qp.current<15e3)&&(Qp.current=Date.now(),V("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:L.id})}).catch(se=>{let ie=ql(se);ie?u(ie):p()}))},M=()=>p();window.addEventListener("focus",M),document.addEventListener("visibilitychange",M);for(let O of["pointerdown","keydown","input","scroll"])window.addEventListener(O,x,!0);return()=>{s=!0,window.removeEventListener("focus",M),document.removeEventListener("visibilitychange",M);for(let O of["pointerdown","keydown","input","scroll"])window.removeEventListener(O,x,!0)}},[L?.id,L?.status,L?.lastActivityAt,L?.startedAt,le,Re]),(0,m.useEffect)(()=>{let s=new AbortController;return V("/rooms/active",{signal:s.signal}).then(({session:u,debugDiscardEnabled:p})=>{r1(p),!(s.signal.aborted||!u)&&(Je(u),Uu("chat"),Xa(!0),de("room"),u.status==="opening"&&(We(!0),V("/rooms/greet",{method:"POST",body:JSON.stringify({sessionId:u.id}),signal:AbortSignal.timeout(3e4)}).then(({session:x})=>{s.signal.aborted||Je(x)}).catch(async x=>{if(s.signal.aborted)return;let M=await v0(u.id);s.signal.aborted||(M?Je(M):ft(y0(x)))}).finally(()=>{s.signal.aborted||We(!1)})))}).catch(()=>{}),()=>s.abort()},[]),(0,m.useEffect)(()=>{if(G!=="chatlogs"||!n?.isFounded)return;let s=new AbortController,u=new URLSearchParams;return De&&u.set("venueId",De),Ba&&u.set("characterId",Ba),u.set("offset",String(b)),u.set("limit","20"),D(null),V(`/rooms/archive?${u.toString()}`,{signal:s.signal}).then(({visits:p,total:x})=>{s.signal.aborted||(D(p),v(x),nt(""))}).catch(p=>{s.signal.aborted||nt(q(p,"Venue visits could not be read."))}),()=>s.abort()},[De,Ba,b,R,G,n?.isFounded]);let Xu=(0,m.useCallback)(async s=>{try{let u=await V(`/rooms/archive/${encodeURIComponent(s)}`);B(u.visit),nt("")}catch(u){nt(q(u,"That visit could not be read."))}},[]),g1=(0,m.useCallback)(async s=>{j(!0);try{await V(`/rooms/archive/${encodeURIComponent(s)}/retry-memory`,{method:"POST"}),await Xu(s),P(u=>u+1),nt("")}catch(u){nt(q(u,"Memory filing is still pending."))}finally{j(!1)}},[Xu]),Wp=(0,m.useCallback)(async s=>{if(window.confirm(s?"Delete this exact visit transcript? Filed memories and world changes remain. Any pending memory can no longer be retried.":"Delete all completed visit transcripts? Filed memories and world changes remain. Any pending memories can no longer be retried.")){j(!0);try{await V(s?`/rooms/archive/${encodeURIComponent(s)}`:"/rooms/archive",{method:"DELETE"}),B(null),S(0),P(u=>u+1),nt("")}catch(u){nt(q(u,"Visit transcripts could not be deleted."))}finally{j(!1)}}},[]);(0,m.useEffect)(()=>{if(!Ie)return;let s=new AbortController;return Qa(s.signal),()=>s.abort()},[Ie,Qa]);let eg=n?n.settings.townMapImageSetAt:null;(0,m.useEffect)(()=>{if(eg===null)return;let s=new AbortController;return(async()=>{try{let u=await V("/town-map",{signal:s.signal});ns(u.image)}catch{s.signal.aborted||ns("")}})(),()=>s.abort()},[eg]);let f1=(0,m.useCallback)(async s=>{j(!0);try{o(await V("/villagers",{method:"POST",body:JSON.stringify({characterId:s})})),Me(""),await Qa()}catch(u){Me(q(u,"That character could not move in."))}finally{j(!1)}},[Qa]),b1=(0,m.useCallback)(async s=>{j(!0);try{o(await V(`/villagers/${encodeURIComponent(s)}`,{method:"DELETE"})),Me(""),l&&await Qa()}catch(u){Me(q(u,"That villager could not leave."))}finally{j(!1)}},[l,Qa]),v1=(0,m.useCallback)(async s=>{Ll(s);try{let u=await V(`/villagers/${encodeURIComponent(s)}/refresh`);Pi(p=>({...p,[s]:u})),Me("")}catch(u){Me(q(u,"That villager's card could not be compared."))}finally{Ll("")}},[]),y1=(0,m.useCallback)(async s=>{Ll(s);try{o(await V(`/villagers/${encodeURIComponent(s)}/refresh`,{method:"POST"})),Pi(u=>{let p={...u};return delete p[s],p}),Me("")}catch(u){Me(q(u,"That villager's card could not be refreshed."))}finally{Ll("")}},[]),ot=(0,m.useCallback)(s=>{ke(s==="noticeboard"?"noticeboard":s==="general"?"general":s==="replyGuidance"||s==="story"||s==="chatlogs"||s==="agendas"||s==="schedules"?"debug":"village"),Z(""),Ke(!1),s==="villagers"&&Qa(),s==="villagers"&&(le!=="menu"||G!=="villagers")&&f("residents"),s==="village"&&co(),s==="village"&&uo(),s==="story"&&Fp(),(s==="agendas"||s==="schedules")&&ps(),s==="village"&&(le!=="menu"||G!=="village")&&n&&(jl(n.settings.promptKnowledge),Gl(n.settings.playerPersonaId),Np(n.settings.setting),Sp(n.settings.selectedLorebookIds),Tp(n.settings.loreTokenBudget),Wi(zn(n.settings.venues).map(p=>({...p})))),it(s),de("menu")},[ps,Qa,uo,co,Fp,G,le,n]),Qu=(0,m.useCallback)(()=>{La(!1),Z(""),Be(null),Ke(!1),de("home")},[]),w1=(0,m.useCallback)(async()=>{if(!(!L||fa)){We(!0),ft(""),Y(!1),Je({...L,status:"closing"});try{if(L.id&&await V("/rooms/end",{method:"POST",body:JSON.stringify({sessionId:L.id})}),lo.current)return;Xa(!1),Je(null),ga([]),Wt.current.clear(),oo(""),Mr(""),de("home"),Re()}catch(s){if(lo.current)return;let u=ql(s);if(u){Je(null),Xa(!1),ga([]),Wt.current.clear(),Ar(u==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),de("home"),Re();return}ft(q(s,"You could not leave the venue.")),Y(!0)}finally{We(!1)}}},[Re,L,fa]),$1=(0,m.useCallback)(async()=>{if(!L?.id||L.status!=="active"||fa||zr.current)return;let s=ss.current??su();ss.current=s,We(!0),ft(""),Y(!1);try{let u=await V("/rooms/leave",{method:"POST",body:JSON.stringify({sessionId:L.id,submissionId:s,message:Er}),signal:AbortSignal.timeout(3e5)});Je(u.session),Re(),Lu(!0);for(let p of u.recordEvents??[])Wt.current.has(p.id)||(Wt.current.add(p.id),ga(x=>[...x,p]));ss.current=null,Re()}catch(u){ft(q(u,"The scene could not end yet.")),Y(!0)}finally{We(!1)}},[Re,L,fa,Er]),x1=(0,m.useCallback)(async()=>{if(!(!L?.id||lo.current)){lo.current=!0,We(!0);try{await V("/rooms/leave-pending",{method:"POST",body:JSON.stringify({sessionId:L.id})}),Xa(!1),Je(null),ga([]),Wt.current.clear(),de("home"),Y(!1),Re()}catch(s){ft(q(s,"The visit could not be left yet.")),lo.current=!1}finally{We(!1)}}},[Re,L]),N1=(0,m.useCallback)(async()=>{if(!(!L?.id||!qu||fa)&&window.confirm("DEBUG: Discard this visit and its transcript? Completed effects and villager memories remain.")){We(!0);try{await V("/rooms/debug/discard",{method:"POST",body:JSON.stringify({sessionId:L.id})}),Je(null),Xa(!1),ga([]),Wt.current.clear(),oo(""),de("home"),Re()}catch(s){ft(q(s,"The debug discard failed."))}finally{We(!1)}}},[L,qu,fa,Re]),S1=(0,m.useCallback)(async()=>{let s=Er.trim();if(L===null||!L.id||Bu||fa||zr.current||s.length===0)return;zr.current=!0;let u=so.current??su();so.current=u;let p=L;try{await V("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:L.id})})}catch(M){zr.current=!1;let O=ql(M);O?(Je(null),Xa(!1),ga([]),Wt.current.clear(),Ar(O==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),de("home"),Re()):ft(q(M,"The visit could not be checked."));return}let x={speakerId:"",name:"",role:"user",content:s,at:new Date().toISOString()};We(!0),ft(""),oo(""),Je({...L,lines:[...L.lines,x]});try{let M=await V("/rooms/turn",{method:"POST",body:JSON.stringify({sessionId:L.id,message:s,mode:rs,targetId:rs==="fulfill"?Cr:"",submissionId:u}),signal:AbortSignal.timeout(3e5)});if(Je(M.session),Lu(M.session.status==="closed"),M.session.status==="closed")ga([]),Wt.current.clear();else for(let O of M.recordEvents??[])Wt.current.has(O.id)||(Wt.current.add(O.id),ga(se=>[...se,O]));Cr&&!M.session.activeIds.includes(Cr)&&ls(""),Xp(M.verdict?.reason??""),so.current=null,Mr(""),Re()}catch(M){let O=ql(M);if(O){Je(null),Xa(!1),ga([]),Wt.current.clear(),Ar(O==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),de("home"),Re();return}Je(p),oo(s),ft(q(M,"That line could not be sent."))}finally{zr.current=!1,We(!1)}},[Re,L,fa,Er,Bu,rs,Cr]),T1=(0,m.useCallback)(s=>(n?.villagers??[]).filter(u=>u.place?.id===s),[n]),gs=(0,m.useCallback)(s=>{Be(null),Ke(!1),da(s.id),Ca("view"),Aa(!1),Ae(null),oe(null),de("venue")},[]),Zu=(0,m.useCallback)(async s=>{We(!0),ft(""),Mr("");try{let u=await V("/rooms/greet",{method:"POST",body:JSON.stringify({sessionId:s}),signal:AbortSignal.timeout(3e4)});Je(u.session),Re()}catch(u){let p=await v0(s);p?Je(p):ft(y0(u))}finally{We(!1)}},[Re]),k1=(0,m.useCallback)(async s=>{We(!0);try{let{session:u}=await V("/rooms/continue",{method:"POST",body:JSON.stringify({sessionId:s}),signal:AbortSignal.timeout(1e4)});Je(u),Mr(u.lines.length===0?"The greeting failed. You can start the conversation now.":""),ft("")}catch(u){ft(q(u,"The visit could not continue. Retry or leave the venue."))}finally{We(!1)}},[]),Rr=(0,m.useCallback)(async(s,u,p="")=>{lo.current=!1,Be(null),Ke(!1),Vn(null),oo(""),Lu(!1),ft(""),Mr(""),ga([]),Wt.current.clear(),We(!0),Je({version:1,id:"",placeId:s.id,placeName:s.name,startedAt:"",endedAt:"",status:"opening",activeIds:[],participants:[],lines:[]}),Xa(!0),de("room");try{let{session:x}=await V("/rooms",{method:"POST",body:JSON.stringify({venueId:s.id,spaceClass:u,privateOwnerId:p}),signal:AbortSignal.timeout(2e4)});Je(x),Uu("chat"),ls(""),Xp(""),Ar(""),Xa(!0),Re(),x.status==="opening"&&await Zu(x.id)}catch(x){ft(q(x,"That room could not be opened. Retry or leave the venue."))}finally{We(!1)}},[Zu,Re]),tg=(0,m.useCallback)(s=>{Ke(!1),Be(s.id),de("home")},[]),ag=(0,m.useCallback)(()=>{da(null),Ca("view"),Aa(!1),Ae(null),oe(null),Be(null),de("home")},[]),E1=(0,m.useCallback)(async()=>{j(!0),Z("");try{o(await V("/settings",{method:"PATCH",body:JSON.stringify({promptKnowledge:hn,playerPersonaId:ma,setting:Yl,selectedLorebookIds:Xl,loreTokenBudget:yu})}))}catch(s){Z(q(s,"Those settings could not be saved."))}finally{j(!1)}},[hn,Xl,yu,ma,Yl]),C1=(0,m.useCallback)(async s=>{j(!0),Z("");try{o(await V("/settings",{method:"PATCH",body:JSON.stringify({storyPace:s})}))}catch(u){Z(q(u,"That could not be saved."))}finally{j(!1)}},[]),ng=(0,m.useCallback)(async s=>{j(!0),Z("");try{o(await V("/settings",{method:"PATCH",body:JSON.stringify({visitRetention:s})})),P(u=>u+1)}catch(u){Z(q(u,"Visit retention could not be saved."))}finally{j(!1)}},[]),A1=(0,m.useCallback)(async()=>{if(!(n&&zn(n.settings.venues).length>0&&!window.confirm("Replace the current places with new suggestions? This removes places you created or approved."))){j(!0),Z("");try{let s=await V("/bootstrap",{method:"POST"});Wi(s.places.map(u=>({id:Zi(),name:u.name,purpose:u.purpose,description:"",category:"public",presentation:{image:null,x:null,y:null},occupancy:{playerHome:!1,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}})))}catch(s){Z(q(s,"The village did not suggest any places."))}finally{j(!1)}}},[n]),z1=(0,m.useCallback)(async()=>{if(Tt.trim().length===0){be("Write the Setting and Theme before generating its map.");return}if(yi.trim().length===0){be("The DEBUG map layout prompt cannot be blank.");return}$r(!0),be("");try{let s=await V("/setup/town-map/generate",{method:"POST",body:JSON.stringify({structure:yi===n?.settings.townMapLayoutPrompt?void 0:yi,negative:wr===n?.settings.townMapNegativePrompt?void 0:wr,setting:Tt,options:Eu,selectedLorebookIds:ja})}),u=await cp(s.image);if(u.width!==s.width||u.height!==s.height)throw new Error("The generated map's reported dimensions do not match the image.");Cu(s.image),Au("generate"),zu(u),vi("generate")}catch(s){be(q(s,"The village map could not be generated."))}finally{$r(!1)}},[ja,wr,yi,Tt,Eu,n?.settings.townMapLayoutPrompt,n?.settings.townMapNegativePrompt]),M1=(0,m.useCallback)(async()=>{be(""),j(!0);try{let s=await V("/setup/public-venue/names/suggest",{method:"POST",body:JSON.stringify({setting:Tt,selectedLorebookIds:ja,loreTokenBudget:Fi})});Fl(s.names)}catch(s){be(q(s,"The village could not suggest names for the public venue."))}finally{j(!1)}},[ja,Fi,Tt]),R1=(0,m.useCallback)(async s=>{if(!s||!n)return;be("");let u=Math.floor((n.settings.townMapImageMaxLength-64)*3/4);if(s.size>u){let p=x=>Math.round(x/1e5)/10;be(`That picture is ${p(s.size)} MB and a village map holds ${p(u)} MB. Choose a smaller copy.`);return}$r(!0);try{let p=await Bl(s),x=await cp(p);Cu(p),Au("upload"),zu(x),vi("upload")}catch(p){be(q(p,"That picture could not be used as the village map."))}finally{$r(!1)}},[n]),ig=(0,m.useCallback)(async s=>{if(!s||!n)return;Z("");let u=Math.floor((n.settings.townMapImageMaxLength-64)*3/4);if(s.size>u){let p=x=>Math.round(x/1e5)/10;Z(`That picture is ${p(s.size)} MB and the village map holds ${p(u)} MB. Try a smaller copy.`);return}j(!0);try{let p=await Bl(s),x=await cp(p);Vu({image:p,size:x}),Nr(hu("cover"))}catch(p){Z(q(p,"That picture could not be used as the town map."))}finally{j(!1)}},[n]),og=(0,m.useCallback)(async()=>{if(!n)return;let s=Va?Va.image:as;j(!0),Z("");try{o(await V("/settings",{method:"PATCH",body:JSON.stringify({townMapImage:s,townMapView:Du??n.settings.townMapView})})),ns(s),Vu(null),Nr(null),_u(!1)}catch(u){Z(q(u,"The town map could not be saved."))}finally{j(!1)}},[n,Du,as,Va]),fs=(0,m.useCallback)(()=>{Vu(null),Nr(null),_u(!1),Z("")},[]),rg=(0,m.useCallback)(async()=>{j(!0),Z("");try{o(await V("/settings",{method:"PATCH",body:JSON.stringify({townMapImage:""})})),ns(""),fs()}catch(s){Z(q(s,"The town map could not be taken down."))}finally{j(!1)}},[fs]),O1=(0,m.useCallback)(async(s,u,p="")=>{if(!Ya){no(s),Vn(null),Z("");try{o(await V("/locations/venue/image",{method:"POST",body:JSON.stringify({venueId:s,spaceClass:u,privateOwnerId:p})}))}catch(x){Vn({id:s,text:q(x,"That place could not be drawn.")})}finally{no("")}}},[Ya]),V1=(0,m.useCallback)(async(s,u,p,x="")=>{if(!(!u||!n||Ya)){no(s),Vn(null),Z("");try{let M=se=>Math.round(se/1e5)/10;if(u.size>n.settings.maxVenueImageBytes){Vn({id:s,text:`That picture is ${M(u.size)} MB and a place holds ${M(n.settings.maxVenueImageBytes)} MB. Try a smaller copy.`});return}let O=await Bl(u);o(await V("/locations/venue/image",{method:"PUT",body:JSON.stringify({venueId:s,image:O,spaceClass:p,privateOwnerId:x})}))}catch(M){Vn({id:s,text:q(M,"That picture could not be kept.")})}finally{no("")}}},[Ya,n]),D1=(0,m.useCallback)(async(s,u,p="")=>{if(!Ya){no(s),Vn(null),Z("");try{o(await V("/locations/venue/image",{method:"DELETE",body:JSON.stringify({venueId:s,spaceClass:u,privateOwnerId:p})}))}catch(x){Vn({id:s,text:q(x,"That picture could not be taken away.")})}finally{no("")}}},[Ya]),_1=n?.settings.maxPlaces??48,ho=n?.settings.setupMaxVillagerCount??rp,lg=(n?.settings.homeBuildings??[]).map(s=>({...s,name:n?.settings.homeBuildingNames?.[s.kind]??s.name})),H1=n&&!n.isFounded?1+ho:_1,bs=Math.max(0,H1-zn(n?.settings.venues??[]).length),U1=(n?.settings.venues.length??0)+Ql.filter(s=>!n?.settings.venues.some(u=>u.id===s.id)).length,Or=(0,m.useCallback)(s=>{let u=fp(s);Zl(u.map(p=>({id:p.id,name:p.name,form:p.form??"Home",description:p.description,x:p.presentation.x,y:p.presentation.y,building:p.occupancy.homeKind,isPlayerHome:p.occupancy.playerHome,characterId:p.occupancy.residentCharacterId}))),$u(u[0]?.id??null),It(!1)},[]),sg=(0,m.useCallback)(()=>{Z(""),n&&Or(n.settings.venues),ke("village"),it("homes"),de("menu")},[Or,n]),cg=(0,m.useCallback)((s,u)=>{if(Z(""),pa.length>=bs||pa.length>=1+ho)return;let p=Zi(),x=pa.length===0;Zl(M=>[...M,{id:p,name:x?"Your residence":`Residence ${M.length+1}`,form:"Home",description:"",x:s,y:u,building:null,isPlayerHome:x,characterId:null}]),$u(p)},[pa.length,bs,ho]),q1=(0,m.useCallback)((s,u,p)=>{let x=Ee.find(O=>O.category==="public-center"),M=Tu??(Kl?x?.id:void 0);if(a0({x:s,y:u},Ee.filter(O=>O.id!==M).map(O=>O.presentation),p??{width:1e3,height:700,photoWidth:58,photoHeight:58})){ku("That photograph would cover another venue. Place it a little to the side.");return}if(ku(""),M)fi(O=>O.map(se=>se.id===M?{...se,presentation:{...se.presentation,x:s,y:u}}:se)),On(M);else if(Kl){let O=g0(Zi(),"gathering",s,u);fi(se=>[...se,O]),On(O.id)}else if(pi){let O=Ee.filter(ie=>ie.classes?.includes("residence"));if(O.length>=1+ho)return;let se=g0(Zi(),"residence",s,u,O.length===0,O.length+1);fi(ie=>[...ie,se]),On(se.id)}bi(null),It(!1),gi(!1)},[Tu,pi,Kl,ho,Ee]),Bt=(0,m.useCallback)((s,u)=>{fi(p=>p.map(x=>x.id===s?u(x):x))},[]),I1=(0,m.useCallback)(s=>{fi(u=>{let p=u.filter(x=>x.id!==s);if(!p.some(x=>x.occupancy.playerHome)){let x=p.findIndex(M=>M.classes?.includes("residence"));x>=0&&(p[x]={...p[x],occupancy:{...p[x].occupancy,playerHome:!0,residentCharacterId:null},residentIds:[]})}return p}),On(u=>u===s?null:u),eo(u=>{let p={...u};return delete p[s],p})},[]),B1=(0,m.useCallback)((s,u)=>{cg(s,u),It(!1),de("menu")},[cg]),ug=(0,m.useCallback)((s,u)=>{n?.settings.venues.some(p=>p.id===s&&p.occupancy.residentCharacterId)||Zl(p=>p.map(x=>x.id===s?{...x,...u}:x))},[n]),L1=(0,m.useCallback)(s=>{if(n?.settings.venues.some(u=>u.id===s&&u.occupancy.residentCharacterId)){Z("Move the resident to another venue before removing this home.");return}Zl(u=>{let p=u.filter(x=>x.id!==s);return p.length>0&&!p.some(x=>x.isPlayerHome)&&(p[0]={...p[0],isPlayerHome:!0,characterId:null}),p})},[n]),j1=(0,m.useCallback)(async()=>{if(n){if(pa.some(s=>!s.description.trim())){Z("Review a description for every home before saving.");return}j(!0),Z("");try{o(await V("/settings",{method:"PATCH",body:JSON.stringify({venues:pS(n.settings.venues,pa),venueScope:"homes"})})),It(!1)}catch(s){Z(q(s,"Those homes could not be saved."))}finally{j(!1)}}},[pa,n]),G1=async s=>{if(!n)return;let u=n.villagers.find(x=>x.characterId===s.characterId)?.name,p=s.isPlayerHome?`${Ji(n)}'s home`:u?`${u}'s home`:S0(lg,s.building).name;j(!0),Z("");try{let x=await V("/locations/venue/descriptions/draft",{method:"POST",body:JSON.stringify({venues:[{id:s.id,name:p,purpose:s.isPlayerHome?"Player residence":u?`Home of ${u}`:"Available home",homeKind:s.building}]})});ug(s.id,{description:x.descriptions[s.id]??""})}catch(x){Z(q(x,"The home description could not be generated. You can write it by hand."))}finally{j(!1)}},Vr=(0,m.useCallback)((s,u)=>{Z(""),be(""),Bp(!1),xr(!1),ts(!1),La(!1),$p(""),Su(0),Rp(s?"":u?.village.name??""),Op(s?"":u?.village.setting??""),Vp(s?"":u?.settings.foundingReason??""),Dp(s?"":u?.settings.foundingDetails??""),Fl([]);let p=s||!u?[]:u.settings.venues.filter(x=>x.classes?.includes("residence")||x.category==="public-center");fi(p.map(x=>({...x,guidance:""}))),On(p[0]?.id??null),bi(null),eo({}),to(null),ku(""),kp(s?[]:u?.settings.selectedLorebookIds??[]),Ep(s?1600:u?.settings.loreTokenBudget??1600),Up({...h0}),vi(s?"generate":u?.settings.townMapImageSetAt?"existing":"none"),Cu(""),Au(null),zu(null),Mu(u?.settings.townMapLayoutPrompt??""),Ru(u?.settings.townMapNegativePrompt??""),$r(!1),Gl(s?"":u?.settings.playerPersonaId??""),co(),uo(),Or(s||!u?[]:u.settings.venues),de("setup")},[uo,co,Or]),dg=(0,m.useCallback)(s=>{if(Ye===0&&s>0){if(Ra.trim().length===0){be("Give the village a name before continuing.");return}if(ma.trim().length===0){be("Choose the Persona who lives in this village.");return}if(!Pt||Pt==="something-else"&&!Ga.trim()){be("Choose why the village is being founded, and describe Something else if selected.");return}}if(Ye===1&&s>1&&Ou.length>0){be(Ou);return}if(Ye===1&&s>1&&Ip){xr(!0);return}if(Ye===2&&s>2){if(Tt.trim().length===0){be("Write the Setting and Theme before continuing.");return}if(ze!=="none"&&!wi){be(ze==="generate"?"Generate the map, or choose an upload or no background image.":"Choose a map image, or select no background image.");return}}if(Ye===3&&s>3){let u=Ee.filter(O=>O.classes?.includes("residence")),p=u.filter(O=>!O.occupancy.playerHome),x=p.length;if(!u.some(O=>O.occupancy.playerHome)||x<p0||x>rp||!Ee.some(O=>O.category==="public-center")){be("Place your home, one to three homes for initial villagers, and a named public meeting location.");return}if(Ee.some(O=>!O.name.trim()||!O.form?.trim()||!O.description.trim()||!O.spaces?.[0]?.description.trim())){be("Give every venue a name, form, exterior description, and scene description before review.");return}let M=p.map(O=>O.occupancy.residentCharacterId).filter(Boolean);if(M.length!==p.length||new Set(M).size!==M.length){be("Assign a different villager to each villager Residence before review.");return}}xr(!1),be(""),Su(s),s===0&&(co(),uo()),s===3&&Qa(),It(!1),gi(!1),bi(null)},[Ou,Ee,Ip,Qa,co,uo,ma,ze,wi,Ra,Pt,Ga,Tt,Ye]),Y1=(0,m.useCallback)(()=>{xr(!1),be(""),Su(2),It(!1),gi(!1)},[]),X1=(0,m.useCallback)(()=>{xr(!1),be("")},[]),J=Ee.find(s=>s.id===_p)??null,mo=J?Ge(J,J.category==="public-center"?"gathering":"residence"):null,hg=s=>({id:s.id,name:s.name,form:s.form??"",purpose:s.purpose,description:s.description,spaceDescription:s.spaces?.[0]?.description??"",venueClass:s.classes?.includes("gathering")?"gathering":"residence",residentCharacterId:s.occupancy.residentCharacterId??"",guidance:s.guidance}),mg=async s=>{if(!(!s.length||Oa)){ao(!0),be("");try{let u=await V("/setup/venues/draft",{method:"POST",body:JSON.stringify({setting:Tt,foundingReason:Pt,foundingDetails:Ga,selectedLorebookIds:ja,loreTokenBudget:Fi,venues:s.map(hg)})});eo(p=>({...p,...u.drafts}))}catch(u){be(q(u,"Venue text could not be drafted."))}finally{ao(!1)}}},Ku=(s,u)=>{let p=Ft[s];p&&(Bt(s,x=>{let M=(ie,Ot,po="")=>(u||!ie.trim()||ie===po)&&Ot||ie,O=Ge(x,x.classes?.includes("gathering")?"gathering":"residence"),se=(ie,Ot)=>u||ie.length===0?Ot??ie:ie;return{...x,name:M(x.name,p.name,x.category==="public-center"?"Gathering Place":x.occupancy.playerHome?"Your residence":`Residence ${Ee.filter(ie=>ie.classes?.includes("residence")).findIndex(ie=>ie.id===x.id)+1}`),form:M(x.form??"",p.form,x.category==="public-center"?"Gathering place":"Home"),purpose:M(x.purpose,p.purpose),description:M(x.description,p.description),spaces:[{...O,description:M(O.description,p.spaceDescription),state:{...O.state,condition:M(O.state.condition,p.condition),items:se(O.state.items,p.items),publicFacts:se(O.state.publicFacts,p.publicFacts),features:se(O.state.features.map(ie=>ie.text),p.features).map((ie,Ot)=>({id:O.state.features[Ot]?.id??Zi(),text:ie,sourceCharacterId:"",locked:O.state.features[Ot]?.locked??!1,updatedAt:""}))}}]}}),eo(x=>{let M={...x};return delete M[s],M}))},Q1=async(s,u)=>{if(!Oa){ao(!0),be("");try{let p=await V("/setup/venue-image/generate",{method:"POST",body:JSON.stringify({venue:hg(s),area:u,villageName:Ra,setting:Tt,selectedLorebookIds:ja})});to({venueId:s.id,area:u,image:p})}catch(p){be(q(p,"Venue art could not be generated."))}finally{ao(!1)}}},Z1=async(s,u,p)=>{if(!(!p||Oa)){if(p.size>(n?.settings.maxVenueImageBytes??8e6)){be("That venue image is too large. Choose a smaller file.");return}ao(!0),be("");try{let x=await V("/setup/venue-image",{method:"PUT",body:JSON.stringify({name:s.name,image:await Bl(p)})});to({venueId:s.id,area:u,image:x})}catch(x){be(q(x,"That venue image could not be uploaded."))}finally{ao(!1)}}},K1=()=>{if(!vr)return;let{venueId:s,area:u,image:p}=vr;Bt(s,x=>u==="exterior"?{...x,presentation:{...x.presentation,image:p}}:{...x,spaces:[{...Ge(x,x.classes?.includes("gathering")?"gathering":"residence"),image:p}]}),to(null)},pg=(0,m.useCallback)(()=>{if(Ra.trim().length===0)return"Give the village a name.";if(ma.trim().length===0)return"Choose the Persona who lives in this village.";if(!Pt||Pt==="something-else"&&!Ga.trim())return"Choose why the village is being founded.";if(Tt.trim().length===0)return"Write the Setting and Theme.";if(ze!=="none"&&!wi)return"Choose, generate, or upload the village map.";let s=Ee.filter(x=>x.classes?.includes("residence")),u=s.filter(x=>!x.occupancy.playerHome);if(u.length<p0||u.length>rp)return"Place one to three homes for initial villagers.";if(!s.some(x=>x.occupancy.playerHome))return"One Residence has to be yours.";if(Ee.some(x=>!x.name.trim()||!x.form?.trim()||!x.description.trim()||!x.spaces?.[0]?.description.trim()))return"Give every venue a name, Form, exterior description, and scene description in Step 4.";let p=u.map(x=>x.occupancy.residentCharacterId).filter(x=>x!==null);return p.length!==u.length?"Choose who lives in each villager home.":new Set(p).size!==p.length?"A villager can only live in one house.":Ee.filter(x=>x.category==="public-center").length!==1?"Place one Gathering Place.":""},[Ee,ma,ze,wi,Ra,Pt,Ga,Tt]),J1=(0,m.useCallback)(async()=>{let s=pg();if(s){be(s);return}j(!0),be("");try{let u=await V("/setup",{method:"POST",body:JSON.stringify({name:Ra.trim(),setting:Tt.trim(),foundingReason:Pt,foundingDetails:Ga.trim(),selectedLorebookIds:ja,loreTokenBudget:Fi,playerPersonaId:ma,townMapImage:wi??"",townMapView:ze==="existing"?io:hu("cover"),venues:Ee})});o(u),It(!1),de(!n?.isFounded||u.foundingPreparation?.status==="pending"||u.foundingPreparation?.status==="failed"?"preparing":"home")}catch(u){be(q(u,"The village could not be founded."))}finally{j(!1)}},[n?.isFounded,Ee,ma,io,pg,ze,wi,Ra,Pt,Ga,ja,Fi,Tt]),P1=(0,m.useCallback)(async()=>{j(!0),Z("");try{let s=await V("/setup/reset",{method:"POST"});o(s),c(null),Vr(!0,s)}catch(s){Z(q(s,"The village could not be reset."))}finally{j(!1),ts(!1)}},[Vr]),gg=(0,m.useRef)(!1);(0,m.useEffect)(()=>{!n||gg.current||(gg.current=!0,n.isFounded?n.foundingPreparation&&n.foundingPreparation.status!=="ready"&&de("preparing"):Vr(!1,n))},[Vr,n]),(0,m.useEffect)(()=>{if(le!=="preparing")return;let s=!1,u=async()=>{try{let x=await V("/setup/preparation");if(s)return;o(x),es(""),(!x.foundingPreparation||x.foundingPreparation.status==="ready")&&de("home")}catch(x){s||es(q(x,"Preparation status could not be read."))}};u();let p=window.setInterval(()=>{u()},2500);return()=>{s=!0,window.clearInterval(p)}},[le]);let F1=(0,m.useCallback)(async()=>{es("");try{o(await V("/setup/preparation/retry",{method:"POST"}))}catch(s){es(q(s,"Preparation could not be retried."))}},[]),W1=(0,m.useCallback)(()=>{Ae({id:Zi(),name:"",form:"",classes:["other"],spaces:[],residenceCapacity:1,residentIds:[],improvements:[null,null],purpose:"",description:"",category:"",presentation:{image:null,x:null,y:null},occupancy:{playerHome:!1,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}})},[]),e$=(0,m.useCallback)(async s=>{j(!0),Z("");try{let u=n?.settings.venues.some(O=>O.id===s.id)??!1,p=Mn(s).map(O=>Ge(s,O)),x=await V(u?`/locations/venue/${encodeURIComponent(s.id)}`:"/locations/venue",{method:u?"PUT":"POST",body:JSON.stringify({name:s.name,form:s.form,classes:s.classes,residenceCapacity:s.residenceCapacity,spaces:p,workerIds:s.workerIds??[],presentation:{x:s.presentation.x,y:s.presentation.y},purpose:s.purpose,category:s.category,description:p[0]?.description??s.description,state:{condition:p[0]?.state.condition??"",furniture:p[0]?.state.items??[],publicFacts:p[0]?.state.publicFacts??[],features:p[0]?.state.features??[]}})}),M=zn(x.settings.venues).find(O=>u?O.id===s.id:O.name.toLowerCase()===s.name.trim().toLowerCase());o(x),Ae(null),Wi(O=>{let se=O.map(ie=>ie.id===s.id&&M?M:ie);return[...se,...zn(x.settings.venues).filter(ie=>!se.some(Ot=>Ot.id===ie.id))]})}catch(u){Z(q(u,"That place could not be saved."))}finally{j(!1)}},[n]),t$=(0,m.useCallback)(async s=>{let u=n?.settings.venues.find(p=>p.id===s);if(!u){Wi(p=>p.filter(x=>x.id!==s));return}j(!0),Z("");try{let p=await V(`/locations/venue/${encodeURIComponent(s)}/dependencies`);if(p.roomPresent||p.playerHome||p.residentCharacterIds.length||p.pendingMailCount){Z(p.roomPresent?"End the active visit before deleting this Venue.":p.pendingMailCount?"Resolve pending Venue decisions before deleting this Venue.":"Move every resident, including yourself, before deleting this Residence.");return}let x=p.residentCharacterIds.length+p.pendingResidenceCharacterIds.length,M=x||p.workerCharacterIds.length||p.remapCount||p.eventCount?`This place is referenced by ${x} pending moves, ${p.workerCharacterIds.length} workers, ${p.remapCount} schedule moves, and ${p.eventCount} events. Delete it?`:`Delete ${u.name}?`;if(!window.confirm(M))return;let O=await V(`/locations/venue/${encodeURIComponent(s)}`,{method:"DELETE",body:JSON.stringify({confirmed:!0})});o(O),Wi(se=>se.filter(ie=>ie.id!==s))}catch(p){Z(q(p,"That place could not be removed."))}finally{j(!1)}},[n]),fg=(0,m.useCallback)(async(s,u)=>{j(!0),Z("");try{let p=pe[s.id]??s.venueDraft,x=await V(`/venue-requests/${encodeURIComponent(s.id)}/${u?"approve":"deny"}`,{method:"POST",body:u?JSON.stringify(p):void 0});if(o(x),u){let M=new Set(Ql.map(O=>O.id));Wi(O=>[...O,...zn(x.settings.venues).filter(se=>!M.has(se.id))])}ha(M=>{let O={...M};return delete O[s.id],O})}catch(p){Z(q(p,u?"That venue could not be approved.":"That request could not be denied."))}finally{j(!1)}},[pe,Ql]),a$=(0,m.useCallback)(s=>{let u=Gu.current,p=u?.selectionStart??hn.length,x=u?.selectionEnd??p;Yu.current=p+s.length,jl(`${hn.slice(0,p)}${s}${hn.slice(x)}`)},[hn]),bg=(0,m.useCallback)(async()=>{let s=Pl.trim();if(s.length!==0){j(!0),Z("");try{o(await V("/noticeboard",{method:"POST",body:JSON.stringify({notice:s})})),Mp("")}catch(u){Z(q(u,"That notice could not be pinned up."))}finally{j(!1)}}},[Pl]),n$=(0,m.useCallback)(async s=>{j(!0),Z("");try{o(await V(`/noticeboard/${s}`,{method:"DELETE"}))}catch(u){Z(q(u,"That notice could not be taken down."))}finally{j(!1)}},[]),vs=wp.trim().toLowerCase(),Ju=(l??[]).filter(s=>vs.length===0||s.name.toLowerCase().includes(vs)||s.comment.toLowerCase().includes(vs)||s.tags.some(u=>u.toLowerCase().includes(vs))),vg=[...(n?.villagers??[]).map(s=>s.characterId),...Ie?Ju.map(s=>s.id):[]].join(`
`),yg=(0,m.useRef)(new Set);(0,m.useEffect)(()=>{let s=vg.split(`
`).filter(p=>p.length>0&&!yg.current.has(p));if(s.length===0)return;for(let p of s)yg.current.add(p);let u=new AbortController;return(async()=>{try{let p=await sS(s,u.signal);u.signal.aborted||fu(x=>({...x,...p}))}catch{}})(),()=>u.abort()},[vg]);let Pu=n?.settings.playerPersonaId??"";(0,m.useEffect)(()=>{if(yp(null),Pu.length===0)return;let s=new AbortController;return(async()=>{try{let u=await cS(Pu,s.signal);s.signal.aborted||yp(u)}catch{}})(),()=>s.abort()},[Pu]);let Rt=(0,m.useCallback)(s=>s?l?.find(u=>u.id===s)?.name??n?.villagers.find(u=>u.characterId===s)?.name??"":"",[l,n]),i$=(()=>{let s=n?.settings.venues??[],u=[],p=new Map;for(let x of n?.villagers??[]){let M=x.place?.id;if(!M)continue;let O=p.get(M);O?O.push(x):p.set(M,[x])}for(let x of s){let M=Il(x);if(!M)continue;let O=x.occupancy.residentCharacterId,se=fr(x),ie=x.occupancy.playerHome?Ji(n):Rt(O);u.push({id:x.id,x:M.x,y:M.y,text:se?SS(ie):x.name,image:x.presentation.image?.url??null,tone:se?T0({isPlayerHome:x.occupancy.playerHome,occupant:O}):"venue",selected:ye===x.id,doors:ye===x.id?[{label:"View venue",onSelect:()=>gs(x)},{label:"Visit",onSelect:()=>{Rr(x)}}]:void 0,onSelect:()=>tg(x)}),(p.get(x.id)??[]).forEach((Ot,po)=>{u.push({id:`villager:${Ot.characterId}`,x:M.x,y:M.y,dy:kS*(po+1),text:Ot.name,tone:"resident",kind:"person"})})}return u})(),o$=Ee.flatMap(s=>{let u=Il(s);return u?[{id:s.id,x:u.x,y:u.y,text:s.name||(s.category==="public-center"?"Gathering Place":"Residence"),image:s.presentation.image?.url??null,tone:s.category==="public-center"?"venue":s.occupancy.playerHome?"player":"resident",onSelect:()=>On(s.id)}]:[]});if(le==="room")return(0,r.jsxs)("div",{className:`${i}-root ${i}-room-screen`,"data-mobile":t?"true":"false",children:[L?(0,r.jsx)(_S,{room:L,picture:nS(n?.settings.venues??[],L),draft:Er,mode:rs,targetId:Cr,busy:fa,error:l1,greetingNotice:s1,ruling:i1,open:n1,ended:Bu,playerName:Ji(n),playerPortrait:G0??void 0,portraits:Rn,sprites:Object.fromEntries((n?.villagers??[]).map(s=>[s.characterId,s.sprite])),onDraft:s=>{so.current=null,ss.current=null,oo(s)},onMode:s=>{so.current=null,Uu(s),s!=="fulfill"&&ls("")},onTarget:s=>{so.current=null,ls(s)},onSend:()=>{S1()},onLeave:()=>{$1()},onViewVenue:()=>{da(L.placeId),Ae(null),de("venue"),Re()},onEnterPrivate:L.area==="shared"&&L.privateAccessOwnerId?()=>{We(!0),V("/rooms/enter-private",{method:"POST",body:JSON.stringify({sessionId:L.id,ownerId:L.privateAccessOwnerId})}).then(({session:s})=>{Je(s),Re()}).catch(s=>ft(q(s,"That private space could not be entered."))).finally(()=>We(!1))}:void 0,privateSpaceOwnerName:Rt(L.privateAccessOwnerId),onEnd:()=>{w1()},notices:o1,onDismissNotice:s=>ga(u=>u.filter(p=>p.id!==s)),debugDiscardEnabled:qu,onDebugDiscard:()=>{N1()},onLeavePending:()=>{x1()},endFailed:fe,onRetryGreeting:()=>{if(L.id)Zu(L.id);else{let s=n?.settings.venues.find(u=>u.id===L.placeId);s&&Rr(s)}},onContinueWithoutGreeting:()=>{L.id&&k1(L.id)},onUseMailbox:n?.settings.venues.some(s=>s.id===L.placeId&&s.occupancy.playerHome&&(!L.spaceClass||L.spaceClass==="residence"))?()=>kr(!0):void 0}):(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:Qu,children:"Back to village"}),a1&&n?(0,r.jsx)("div",{className:`${i}-mailbox-backdrop`,onClick:()=>kr(!1),children:(0,r.jsxs)("section",{className:`${i}-mailbox`,role:"dialog","aria-modal":"true","aria-label":"Mailbox",onClick:s=>s.stopPropagation(),children:[(0,r.jsxs)("div",{className:`${i}-row`,style:{justifyContent:"space-between"},children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Mailbox"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>kr(!1),children:"Close"})]}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Venue decisions and replies from the people affected by them."}),(0,r.jsxs)("div",{className:`${i}-mailbox-list`,children:[[...n.venueMail??[]].reverse().map(s=>(0,r.jsxs)("article",{className:`${i}-mailbox-item`,children:[(0,r.jsx)("strong",{children:s.title}),(0,r.jsx)("p",{children:s.detail}),(0,r.jsx)("p",{className:`${i}-hint`,children:s.status==="awaiting-villagers"?`Awaiting replies \xB7 due ${new Date(s.dueAt).toLocaleString()}`:s.status==="pending-player"?"Awaiting your decision":s.status==="approved"?"Approved":"Declined"}),s.decisions.map(u=>(0,r.jsxs)("p",{children:[(0,r.jsxs)("strong",{children:[Rt(u.characterId),":"]})," ",u.reply]},u.characterId)),s.status==="pending-player"&&s.kind==="villager-change"?(0,r.jsx)(DS,{entry:s,onDecide:async(u,p)=>{o(await V(`/venue-mail/${encodeURIComponent(s.id)}/decision`,{method:"POST",body:JSON.stringify({approved:u,...p})}))}}):null,s.error?(0,r.jsxs)("p",{className:`${i}-hint`,children:["Reply delayed: ",s.error]}):null]},s.id)),(n.venueMail?.length??0)===0&&n.venueRequests.length===0&&n.upgradeRequests.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"No Venue mail yet."}):null,n.venueRequests.map(s=>(0,r.jsxs)("article",{className:`${i}-mailbox-item`,children:[(0,r.jsxs)("strong",{children:[s.requesterName||"A villager"," suggests ",s.venueDraft.name]}),(0,r.jsx)("p",{children:s.venueDraft.purpose}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{kr(!1),ot("venueRequests")},children:"Review request"})]},s.id)),n.upgradeRequests.map(s=>(0,r.jsxs)("article",{className:`${i}-mailbox-item`,children:[(0,r.jsxs)("strong",{children:[s.requesterName," suggests a home change"]}),(0,r.jsx)("p",{children:s.detail}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{kr(!1),ot("venueRequests")},children:"Review request"})]},s.id))]})]})}):null]});if(le==="venue"){let s=(n?.settings.venues??[]).find(T=>T.id===Ea)??null;if(!n||!s)return(0,r.jsx)("div",{className:`${i}-root`,children:(0,r.jsxs)("header",{className:`${i}-header`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("h1",{className:`${i}-title`,children:"A place that is gone"}),(0,r.jsx)("p",{className:`${i}-subtitle`,children:"This venue is no longer in the village."})]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:ag,children:"Back to map"})]})});let u=T1(s.id),p=Mn(s),x=s.occupancy.homeKind?S0(lg,s.occupancy.homeKind).name:"",M=s.occupancy.playerHome?Ji(n):Rt(s.occupancy.residentCharacterId),O=p.includes("residence")&&(s.residentIds?.length??0)>0,se=L?.placeId===s.id&&(L.area==="shared"||L.area==="private"),ie=L?.placeId===s.id&&L.area==="private"?L.privateOwnerId:"",Ot=s.occupancy.playerHome||s.playerSeenShared||se,po=(s.privateSpaces??[]).filter(T=>s.playerSeenPrivateIds?.includes(T.ownerId)||T.ownerId===ie),Dr=[...p.map(T=>({key:T,label:`${T[0].toUpperCase()}${T.slice(1)} space`,spaceClass:T,ownerId:""})),...(s.playerInvitations??[]).filter(T=>T.scope==="private"&&T.ownerId).map(T=>({key:`private:${T.ownerId}`,label:`${Rt(T.ownerId??"")}'s private space`,spaceClass:"residence",ownerId:T.ownerId??""}))],Fu=(T,K,X,ae="")=>(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsx)("h3",{className:`${i}-panel-title`,children:T}),K?(0,r.jsx)("img",{className:`${i}-venue-space-picture`,src:K.url,alt:`${T} at ${s.name}`}):(0,r.jsx)("div",{className:`${i}-venue-image-empty`,children:"No image yet"}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:!!Ya||_,onClick:()=>{O1(s.id,X,ae)},children:K?"Redraw image":"Draw image"}),(0,r.jsx)("input",{className:`${i}-file`,type:"file",accept:"image/*","aria-label":`Upload ${T.toLowerCase()} image`,disabled:!!Ya||_,onChange:rt=>{let _r=rt.target.files?.[0];rt.target.value="",V1(s.id,_r,X,ae)}}),K?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:!!Ya||_,onClick:()=>{D1(s.id,X,ae)},children:"Remove image"}):null]})]},ae||X||"exterior"),go=T=>({name:T.name,form:T.form,purpose:T.purpose,workerIds:T.workerIds,position:{x:T.presentation.x,y:T.presentation.y},spaces:p.map(K=>{let X=Ge(T,K);return{description:X.description,condition:X.state.condition,items:X.state.items,publicFacts:X.state.publicFacts,features:X.state.features.map(({id:ae,text:rt,locked:_r})=>({id:ae,text:rt,locked:_r}))}}),privateSpaces:T.privateSpaces?.map(K=>({ownerId:K.ownerId,description:K.description,condition:K.state.condition,items:K.state.items,publicFacts:K.state.publicFacts,features:K.state.features.map(({id:X,text:ae,locked:rt})=>({id:X,text:ae,locked:rt}))}))}),r$=!!(he&&JSON.stringify(go(he))!==JSON.stringify(go(s))),l$=!!(ee&&(JSON.stringify(ee.classes)!==JSON.stringify(p)||ee.capacity!==(s.residenceCapacity??1)||ee.slot!==0||ee.title||ee.description||ee.extraBeds)),s$=()=>{(Q==="edit"&&r$||Q==="proposal"&&l$)&&!window.confirm("Discard your unsaved changes?")||(Ca("view"),Ae(null),oe(null),St(""),E(""))},wg=(T,K)=>{o(T);let X=T.settings.venues.find(ae=>ae.id===s.id);X&&Ae(structuredClone(X)),E(K)},c$=async()=>{if(he){if(O){let T=go(he),K=go(s),X=p.indexOf("residence");if((X>=0&&JSON.stringify(T.spaces[X])!==JSON.stringify(K.spaces[X])||JSON.stringify(T.privateSpaces)!==JSON.stringify(K.privateSpaces))&&!window.confirm("Saving Venue details will discard unsaved room changes. Continue?"))return}At(!0),St(""),E("");try{let T=p.map(ae=>Ge(O&&ae==="residence"?s:he,ae)),K=T[0],X=await V(`/locations/venue/${encodeURIComponent(s.id)}`,{method:"PUT",body:JSON.stringify({name:he.name,form:he.form,purpose:he.purpose,description:O?s.description:K?.description??he.description,spaces:T,workerIds:he.workerIds??[],presentation:{x:he.presentation.x,y:he.presentation.y},state:O?s.state:{condition:K?.state.condition??"",furniture:K?.state.items??[],publicFacts:K?.state.publicFacts??[],features:K?.state.features??[]}})});wg(X,"Venue details saved.")}catch(T){St(q(T,"The Venue could not be saved."))}finally{At(!1)}}},$g=async(T,K="")=>{if(!he)return;let X=T==="private"?he.privateSpaces?.find(rt=>rt.ownerId===K):Ge(he,"residence");if(!X)return;let ae=structuredClone(he);if(T==="shared"?ae.spaces=ae.spaces?.map(rt=>rt.venueClass==="residence"?Ge(s,"residence"):rt):ae.privateSpaces=ae.privateSpaces?.map(rt=>rt.ownerId===K?s.privateSpaces?.find(_r=>_r.ownerId===K)??rt:rt),!(JSON.stringify(go(ae))!==JSON.stringify(go(s))&&!window.confirm("Submitting this room edit will discard other unsaved changes. Continue?"))){At(!0),St(""),E("");try{let rt=await V(`/locations/venue/${encodeURIComponent(s.id)}/edit-proposals`,{method:"POST",body:JSON.stringify({target:T,ownerId:K,description:X.description,state:X.state})});wg(rt,`${T==="private"?"Private":"Shared"} room edit proposed.`)}catch(rt){St(q(rt,"That room edit could not be proposed."))}finally{At(!1)}}},xg=TS(s,M);return(0,r.jsxs)("div",{className:`${i}-root`,children:[(0,r.jsxs)("header",{className:`${i}-header`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("h1",{className:`${i}-title`,children:Q==="view"?xg:`${Q==="edit"?"Edit Venue":"Propose Change"} \xB7 ${xg}`}),(0,r.jsx)("p",{className:`${i}-subtitle`,children:Q==="view"?u.length===0?"Nobody is here right now":`Villagers here: ${u.map(T=>T.name).join(", ")}`:Q==="edit"?"Pictures and venue details":"Review a structural change"})]}),(0,r.jsx)("div",{className:`${i}-actions`,children:Q==="view"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Ae(structuredClone(s)),St(""),E(""),Ca("edit")},children:"Edit Venue"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{oe({classes:p,capacity:s.residenceCapacity??1,slot:0,title:"",description:"",extraBeds:0}),St(""),E(""),Ca("proposal")},children:"Propose Change"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:L?.placeId===s.id&&L.status!=="closed"?()=>de("room"):ag,children:L?.placeId===s.id&&L.status!=="closed"?"Return to scene":"Back to map"})]}):(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:s$,children:Q==="edit"?"Close Editor":"Exit Change Proposal"})})]}),Q==="view"?(0,r.jsxs)("main",{className:`${i}-venue-page`,children:[(0,r.jsxs)("section",{className:`${i}-venue-hero`,children:[s.presentation.image?(0,r.jsx)("img",{className:`${i}-venue-picture`,src:s.presentation.image.url,alt:`Exterior of ${s.name}`}):(0,r.jsx)("div",{className:`${i}-venue-image-empty`,children:"Exterior image not drawn yet"}),(0,r.jsxs)("div",{className:`${i}-venue-context`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"The place"}),s.purpose?(0,r.jsx)("p",{className:`${i}-venue-beat`,children:s.purpose}):null,s.form||x?(0,r.jsx)("p",{children:s.form||x}):null,n.village.setting?(0,r.jsx)("p",{className:`${i}-hint`,children:n.village.setting}):null,p.includes("residence")?(0,r.jsxs)("p",{className:`${i}-hint`,children:[gu(s)," / ",w0(s)," residents"]}):null,(0,r.jsx)("div",{className:`${i}-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:fa,"aria-expanded":Dr.length>1?dn:void 0,onClick:()=>{if(Dr.length===1){let T=Dr[0];Rr(s,T.spaceClass,T.ownerId)}else Aa(T=>!T)},children:fa?"Opening visit\u2026":"Visit Venue"})}),dn&&Dr.length>1?(0,r.jsxs)("div",{className:`${i}-venue-visit-picker`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Choose a space"}),Dr.map(T=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:fa,onClick:()=>{Aa(!1),Rr(s,T.spaceClass,T.ownerId)},children:T.label},T.key))]}):null,p.includes("residence")&&!s.occupancy.playerHome?(0,r.jsx)("p",{className:`${i}-hint`,children:"You can speak from outside. Entering a resident's home requires an invitation."}):null]})]}),p.includes("residence")&&!Ot?(0,r.jsx)("p",{className:`${i}-hint`,children:"The shared Residence space appears after you enter with an invitation."}):null,(0,r.jsxs)("div",{className:`${i}-venue-space-grid`,children:[p.filter(T=>T!=="residence"||Ot).map(T=>{let K=Ge(s,T);return(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:T==="residence"?"Shared Residence space":`${T[0].toUpperCase()}${T.slice(1)} space`}),K.image?(0,r.jsx)("img",{className:`${i}-venue-space-picture`,src:K.image.url,alt:`${T} space at ${s.name}`}):(0,r.jsx)("div",{className:`${i}-venue-image-empty`,children:"Image not drawn yet"}),K.description?(0,r.jsx)("p",{className:`${i}-venue-beat`,children:K.description}):null,K.state.condition?(0,r.jsxs)("p",{className:`${i}-hint`,children:["Condition now: ",K.state.condition]}):null,K.state.items.length?(0,r.jsxs)("p",{className:`${i}-hint`,children:["Present items: ",K.state.items.join(", ")]}):null,K.state.publicFacts.length?(0,r.jsxs)("p",{className:`${i}-hint`,children:["Established facts: ",K.state.publicFacts.join(" \xB7 ")]}):null]},T)}),po.map(T=>(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsxs)("h2",{className:`${i}-panel-title`,children:[Rt(T.ownerId),"'s private space"]}),T.image?(0,r.jsx)("img",{className:`${i}-venue-space-picture`,src:T.image.url,alt:`${Rt(T.ownerId)}'s private space`}):(0,r.jsx)("div",{className:`${i}-venue-image-empty`,children:"Image not drawn yet"}),T.description?(0,r.jsx)("p",{className:`${i}-venue-beat`,children:T.description}):null,T.adaptationPending?(0,r.jsx)("p",{className:`${i}-hint`,children:"This room is still being adapted after a move."}):null]},T.ownerId))]}),(s.editProposals??[]).map(T=>(0,r.jsxs)("p",{className:`${i}-hint`,children:["Proposed ",T.target," room edit:"," ",T.declined?"declined or stale":`approved by ${T.approvedIds.length} of ${T.requiredIds.length} residents`]},T.id)),p.includes("residence")&&!s.occupancy.playerHome?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{V(`/locations/venue/${encodeURIComponent(s.id)}/player-move`,{method:"POST"}).then(o).catch(T=>St(q(T,"The move could not be requested.")))},children:"Request to live here"}):null,Kt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Kt}):null]}):Q==="edit"?(0,r.jsxs)("main",{className:`${i}-venue-editor-page`,children:[(0,r.jsxs)("div",{className:`${i}-venue-space-grid`,children:[Fu("Exterior image",s.presentation.image),p.filter(T=>T!=="residence"||Ot).map(T=>Fu(T==="residence"?"Shared Residence image":`${T} space image`,Ge(s,T).image,T)),po.map(T=>Fu(`${Rt(T.ownerId)}'s private image`,T.image,"residence",T.ownerId))]}),Ya===s.id?(0,r.jsx)("p",{className:`${i}-hint`,children:"Drawing or saving the image\u2026"}):null,jp?.id===s.id?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:jp.text}):null,he?(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Venue details"}),(0,r.jsx)($0,{draft:he,existing:!0,villagers:n.villagers,editableClasses:p.filter(T=>T!=="residence"||!O||se),onChange:Ae}),O?(0,r.jsx)("p",{className:`${i}-hint`,children:"Save Venue details updates the public fields. Changes to the shared Residence room require a separate proposal during an invited visit."}):null,(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:za||!he.name.trim(),onClick:()=>{c$()},children:"Save Venue details"}),O&&se?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:za||!Ge(he,"residence").description.trim(),onClick:()=>{$g("shared")},children:"Propose shared room edit"}):null]}),O&&!se?(0,r.jsx)("p",{className:`${i}-hint`,children:"Enter with a resident's invitation to propose changes to the shared room's contents."}):null]}):null,ie&&he?.privateSpaces?.filter(T=>T.ownerId===ie).map(T=>(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsxs)("h2",{className:`${i}-panel-title`,children:["Propose changes to ",Rt(T.ownerId),"'s private space"]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Scene description",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:T.description,onChange:K=>Ae(X=>X&&{...X,privateSpaces:X.privateSpaces?.map(ae=>ae.ownerId===T.ownerId?{...ae,description:K.target.value}:ae)})})]}),(0,r.jsxs)("details",{className:`${i}-venue-scene-details`,children:[(0,r.jsx)("summary",{children:"Scene details"}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Physical state used during visits and for this room's image. These facts stay private until the player enters this room."}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Condition now"," ",(0,r.jsx)("span",{className:`${i}-hint`,children:"For example, a broken shutter or a repaired floor."}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:T.state.condition,onChange:K=>Ae(X=>X&&{...X,privateSpaces:X.privateSpaces?.map(ae=>ae.ownerId===T.ownerId?{...ae,state:{...ae.state,condition:K.target.value}}:ae)})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Present items \xB7 one per line"," ",(0,r.jsx)("span",{className:`${i}-hint`,children:"Objects physically in this room."}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:T.state.items.join(`
`),onChange:K=>Ae(X=>X&&{...X,privateSpaces:X.privateSpaces?.map(ae=>ae.ownerId===T.ownerId?{...ae,state:{...ae.state,items:K.target.value.split(`
`)}}:ae)})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Established facts \xB7 one per line"," ",(0,r.jsx)("span",{className:`${i}-hint`,children:"Durable truths about this room."}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:T.state.publicFacts.join(`
`),onChange:K=>Ae(X=>X&&{...X,privateSpaces:X.privateSpaces?.map(ae=>ae.ownerId===T.ownerId?{...ae,state:{...ae.state,publicFacts:K.target.value.split(`
`)}}:ae)})})]})]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:za||!T.description.trim(),onClick:()=>{$g("private",T.ownerId)},children:"Propose private room edit"})]},T.ownerId)),O&&(s.residentIds?.length??0)>0?(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Resident moves"}),(0,r.jsxs)("select",{value:H,onChange:T=>me(T.target.value),"aria-label":"Destination for resident move",children:[(0,r.jsx)("option",{value:"",children:"Choose a Residence with an available bed"}),n.settings.venues.filter(T=>T.id!==s.id&&Mn(T).includes("residence")&&gu(T)<w0(T)).map(T=>(0,r.jsx)("option",{value:T.id,children:T.name},T.id))]}),(s.residentIds??[]).map(T=>{let K=n.residences.find(X=>X.characterId===T&&X.status!=="current");return(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("strong",{children:Rt(T)}),K?(0,r.jsx)("span",{className:`${i}-hint`,children:K.status==="moving"?"Moving":"Awaiting consent"}):(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:!H||za,onClick:()=>{At(!0),V("/residences/proposals",{method:"POST",body:JSON.stringify({characterId:T,venueId:H})}).then(o).catch(X=>St(q(X,"The move could not be requested."))).finally(()=>At(!1))},children:"Ask to move"})]},T)})]}):null,ut?(0,r.jsx)("p",{className:`${i}-hint`,role:"status",children:ut}):null,Kt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Kt}):null]}):(0,r.jsx)("main",{className:`${i}-venue-proposal-page`,children:(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Propose a Venue change"}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Residents and workers affected by a structural change will reply in your Mailbox. A vacant Venue changes after you submit the reviewed terms."}),ee?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Classes \xB7 choose up to two"}),(0,r.jsx)("div",{className:`${i}-row`,children:U0.map(T=>(0,r.jsxs)("label",{className:`${i}-label`,children:[(0,r.jsx)("input",{type:"checkbox",checked:ee.classes.includes(T),disabled:!ee.classes.includes(T)&&ee.classes.length>=2,onChange:K=>oe(X=>X&&{...X,classes:K.target.checked?[...X.classes,T]:X.classes.filter(ae=>ae!==T)})})," ",T]},T))})]}),ee.classes.includes("residence")?(0,r.jsxs)("label",{className:`${i}-label`,children:["Base capacity \xB7 includes you",(0,r.jsx)("input",{className:`${i}-notice-input`,type:"number",min:1,max:4,value:ee.capacity,onChange:T=>oe({...ee,capacity:Number(T.target.value)})})]}):null,(0,r.jsxs)("label",{className:`${i}-label`,children:["Improvement slot",(0,r.jsxs)("select",{value:ee.slot,onChange:T=>oe({...ee,slot:Number(T.target.value)}),children:[(0,r.jsxs)("option",{value:0,children:["Slot 1 \xB7 ",s.improvements?.[0]?.title??"empty"]}),(0,r.jsxs)("option",{value:1,children:["Slot 2 \xB7 ",s.improvements?.[1]?.title??"empty"]})]})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Improvement title \xB7 leave empty for a Class or capacity proposal",(0,r.jsx)("input",{className:`${i}-notice-input`,value:ee.title,onChange:T=>oe({...ee,title:T.target.value}),placeholder:"A second sleeping alcove"})]}),ee.title?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("label",{className:`${i}-label`,children:["What changes in the story?",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:ee.description,onChange:T=>oe({...ee,description:T.target.value})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Extra beds \xB7 optional mechanical effect",(0,r.jsx)("input",{className:`${i}-notice-input`,type:"number",min:0,max:3,value:ee.extraBeds,onChange:T=>oe({...ee,extraBeds:Number(T.target.value)})})]})]}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:za||ee.classes.length<1||ee.title.trim().length>0&&!ee.description.trim(),onClick:()=>{At(!0),St(""),V(`/locations/venue/${encodeURIComponent(s.id)}/proposals`,{method:"POST",body:JSON.stringify({classes:ee.classes,capacity:ee.capacity,...ee.title.trim()?{slot:ee.slot,improvement:{title:ee.title,description:ee.description,extraBeds:ee.extraBeds}}:{},title:ee.title||`Change ${s.name}`,detail:ee.description||`Change Venue Classes or capacity at ${s.name}.`})}).then(T=>{o(T),oe(null),E("Proposal submitted.")}).catch(T=>St(q(T,"The proposal could not be saved."))).finally(()=>At(!1))},children:"Submit proposal"})]}):(0,r.jsx)("p",{className:`${i}-hint`,role:"status",children:ut||"Proposal submitted."}),Kt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Kt}):null]})})]})}if(le==="menu")return(0,r.jsxs)("div",{className:`${i}-root ${i}-sectioned-menu`,"data-section":A,"data-mobile":t,children:[(0,r.jsxs)("header",{className:`${i}-header`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("h1",{className:`${i}-title`,children:{index:"Menu",general:"General Settings",village:"Village Settings",debug:"DEBUG Settings",noticeboard:"Noticeboard"}[A]}),t?null:(0,r.jsx)("p",{className:`${i}-subtitle`,children:"Everything you can change about the village lives here, away from the village itself."})]}),(0,r.jsx)("div",{className:`${i}-actions`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:A!=="index"?()=>ke("index"):Qu,children:A!=="index"?"Back to menu":"Back to the village"})})]}),Tr?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Tr}):null,(0,r.jsx)("nav",{className:`${i}-mobile-menu-nav`,"aria-label":"Village menu",children:A==="index"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>ot("general"),children:"General Settings"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>ot("village"),children:"Village Settings"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>ot("story"),children:"DEBUG Settings"})]}):A==="village"?(0,r.jsx)(r.Fragment,{children:[["villagers","Villagers"],["venueRequests","Venue Requests"],["homes","Homes"],["map","Town map"],["village","Village Settings"]].map(([s,u])=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,"data-active":G===s,onClick:()=>s==="homes"?sg():ot(s),children:u},s))}):A==="debug"?(0,r.jsxs)(r.Fragment,{children:[[["story","Village Story"],["replyGuidance","Villager reply guidance"],["chatlogs","Venue Visits"],["agendas","Villager Wishes"],["schedules","Villager Agendas"]].map(([s,u])=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,"data-active":G===s,onClick:()=>ot(s),children:u},s)),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:!n||_||ds,onClick:()=>{Pp()},children:"Force Village Update"}),(0,r.jsx)("p",{className:`${i}-status`,children:M0}),cs?(0,r.jsx)("p",{className:`${i}-status`,role:"status",children:cs}):null]}):null}),(0,r.jsxs)("nav",{className:`${i}-menu-nav`,"aria-label":"Everything you can change",children:[(0,r.jsxs)("div",{className:`${i}-menu-group`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Village Management"}),(0,r.jsxs)("div",{className:`${i}-menu-group-buttons`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":G==="villagers","data-active":G==="villagers"?"true":"false",disabled:!n||_,onClick:()=>ot("villagers"),children:`Villagers (${n?.villagers.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":G==="noticeboard","data-active":G==="noticeboard"?"true":"false",disabled:!n||_,onClick:()=>ot("noticeboard"),children:`Noticeboard (${n?.noticeboard.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":G==="venueRequests","data-active":G==="venueRequests"?"true":"false",disabled:!n||_,onClick:()=>ot("venueRequests"),children:`Venue Requests (${(n?.venueRequests?.length??0)+(n?.upgradeRequests?.length??0)+(n?.residences?.filter(s=>s.status==="pending"&&s.requestedBy==="villager").length??0)})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":G==="homes","data-active":G==="homes"?"true":"false",disabled:!n||_,onClick:sg,children:`Homes (${fp(n?.settings.venues??[]).length})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":G==="map","data-active":G==="map"?"true":"false",disabled:!n||_,onClick:()=>ot("map"),children:"Town map"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":G==="village","data-active":G==="village"?"true":"false",onClick:()=>ot("village"),children:"Village Settings"})]})]}),(0,r.jsxs)("div",{className:`${i}-menu-group`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"General Settings"}),(0,r.jsx)("div",{className:`${i}-menu-group-buttons`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":G==="general","data-active":G==="general"?"true":"false",onClick:()=>ot("general"),children:"General settings"})})]}),(0,r.jsxs)("div",{className:`${i}-menu-group`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Debug"}),(0,r.jsxs)("div",{className:`${i}-menu-group-buttons`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":G==="replyGuidance","data-active":G==="replyGuidance"?"true":"false",disabled:!n||_,onClick:()=>ot("replyGuidance"),children:"DEBUG: Villager reply guidance"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":G==="story","data-active":G==="story"?"true":"false",disabled:!n||_,onClick:()=>ot("story"),children:`DEBUG: Village Story (${d?.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":G==="chatlogs","data-active":G==="chatlogs"?"true":"false",disabled:!n||_,onClick:()=>ot("chatlogs"),children:`DEBUG: Venue Visits (${k?.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":G==="agendas","data-active":G==="agendas"?"true":"false",disabled:!n||_,onClick:()=>ot("agendas"),children:`DEBUG: Villager Wishes (${I?.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":G==="schedules","data-active":G==="schedules"?"true":"false",disabled:!n||_,onClick:()=>ot("schedules"),children:`Villager Agendas (${I?.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:!n||_||ds,onClick:()=>{Pp()},children:"Force Village Update"})]}),(0,r.jsx)("p",{className:`${i}-status`,children:M0}),cs?(0,r.jsx)("p",{className:`${i}-status`,role:"status",children:cs}):null]})]}),G==="general"?(0,r.jsxs)("section",{className:`${i}-panel`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"General settings"}),(0,r.jsx)(mp,{}),n?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-story-pace`,children:"Story pace"}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Village time follows your device clock. When Marinara reopens, the village reconstructs elapsed life from its last saved instant. Story pace controls the visual Events feed only; its prose does not affect narration or village state. Schedules and other rule-driven state always advance."}),(0,r.jsx)("select",{id:`${i}-story-pace`,value:n.settings.storyPace,disabled:_,onChange:s=>{C1(s.target.value)},children:n.settings.storyPaces.map(s=>(0,r.jsx)("option",{value:s,children:s.charAt(0).toUpperCase()+s.slice(1)},s))}),(0,r.jsx)("span",{className:`${i}-hint`,children:hS(n.settings.storyPace)})]}):null,n?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-visit-retention`,children:"Visit transcripts"}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Exact visit logs are kept forever by default. Automatic cleanup skips visits with memory pending and keeps filed memories and world changes."}),(0,r.jsxs)("select",{id:`${i}-visit-retention`,value:n.settings.visitRetention.mode,disabled:_,onChange:s=>{let u=s.target.value;ng({mode:u,value:u==="count"?100:u==="days"?365:0})},children:[(0,r.jsx)("option",{value:"forever",children:"Keep forever"}),(0,r.jsx)("option",{value:"count",children:"Keep latest visits"}),(0,r.jsx)("option",{value:"days",children:"Retire after days"})]}),n.settings.visitRetention.mode!=="forever"?(0,r.jsx)("input",{type:"number","aria-label":n.settings.visitRetention.mode==="count"?"Number of visits to keep":"Days to keep visits",min:n.settings.visitRetention.mode==="count"?1:30,max:n.settings.visitRetention.mode==="count"?1e3:3650,defaultValue:n.settings.visitRetention.value,onBlur:s=>{let u=Number(s.target.value);u!==n.settings.visitRetention.value&&ng({mode:n.settings.visitRetention.mode,value:u})}},`${n.settings.visitRetention.mode}:${n.settings.visitRetention.value}`):null]}):null,(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("p",{className:`${i}-empty`,children:"Setting the village up again is the same three questions you answered when you arrived, over the village as it stands now."}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_||!n,onClick:()=>Vr(!1,n),children:"Run setup again"}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Keeps your villagers, their conversations and anything you have written."})]})]}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Starting over"}),(0,r.jsx)("p",{className:`${i}-empty`,children:"This is not the same thing. It takes the village apart completely \u2014 the villagers, their conversations, the places, the noticeboard, your own details and the map \u2014 and hands you an empty one. There is no way back."}),(0,r.jsx)("div",{className:`${i}-row`,children:W0?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-danger`,disabled:_,onClick:()=>{P1()},children:"Yes, empty the village"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>ts(!1),children:"Keep it"})]}):(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_||!n,onClick:()=>ts(!0),children:"Reset the village and start over"})})]}),Mt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Mt}):null]}):G==="village"?(0,r.jsxs)("div",{className:`${i}-menu-body`,children:[n?(0,r.jsxs)("section",{className:`${i}-panel`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Village settings"}),(0,r.jsx)("p",{className:`${i}-empty`,children:"These choices belong to this village. Narration style shapes scene prose; resident cards shape their dialogue. Village knowledge is refreshed for every reply."}),(0,r.jsx)(zS,{}),t?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Map background image"}),is?(0,r.jsx)("img",{className:`${i}-mobile-map-preview`,src:is,alt:"Current village map background"}):(0,r.jsx)("p",{className:`${i}-empty`,children:"The map has no background image."}),(0,r.jsx)("input",{className:`${i}-file`,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",disabled:_,"aria-label":"Choose a town map picture",onChange:s=>{let u=s.target.files?.[0];s.target.value="",ig(u)}}),Va?(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>{og()},children:"Use this map"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:fs,children:"Cancel"})]}):n.settings.townMapImageSetAt?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>{rg()},children:"Remove background image"}):null]}):null,(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setting`,children:"Setting and Theme"}),(0,r.jsx)("textarea",{id:`${i}-setting`,className:`${i}-textarea ${i}-off`,value:Yl,maxLength:n.settings.settingMaxLength,placeholder:"A cliffside fishing town where the boats go out before dawn\u2026",disabled:!0,onChange:s=>Np(s.target.value)}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"Read-only here. What this place is like is the wizard's first question, asked beside where the houses stand so the village is described once rather than twice; run it again to change this. What is written still reaches every villager in the meantime."})]}),(0,r.jsx)(C0,{books:wu,error:Cp,selected:Xl,onChange:Sp,disabled:_}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-lore-budget`,children:"Lorebook token budget"}),(0,r.jsx)("input",{id:`${i}-lore-budget`,className:`${i}-notice-input`,type:"number",min:n.settings.loreTokenBudgetMin,max:n.settings.loreTokenBudgetMax,step:100,value:yu,disabled:_,onChange:s=>Tp(Number(s.target.value))}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Maximum approximate lore tokens in future text generation. Image prompts keep a separate short excerpt."})]}),(0,r.jsxs)("section",{className:`${i}-field`,children:[(0,r.jsxs)("div",{className:`${i}-row`,style:{justifyContent:"space-between"},children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Venues"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:W1,disabled:_||U1>=n.settings.maxPlaces,children:"Create Venue"})]}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Each Venue is one unique place. Its Form describes what it is; one or two Classes describe what people do there."}),(0,r.jsx)("input",{className:`${i}-notice-input`,type:"search",value:zp,onChange:s=>X0(s.target.value),placeholder:"Find a Venue by name, Form, or Class","aria-label":"Search Venues"}),(0,r.jsx)("div",{className:`${i}-notice-add`,children:n.settings.venues.filter(s=>`${s.name} ${s.form??""} ${Mn(s).join(" ")}`.toLowerCase().includes(zp.toLowerCase())).map(s=>(0,r.jsxs)("div",{className:`${i}-notice-row`,children:[(0,r.jsx)("strong",{children:s.name||"Unnamed Residence"}),(0,r.jsx)("span",{className:`${i}-hint`,children:[s.form,Mn(s).join(" + ")].filter(Boolean).join(" \xB7 ")}),Mn(s).includes("residence")?(0,r.jsxs)("span",{className:`${i}-hint`,children:[(s.residentIds?.length??+!!s.occupancy.residentCharacterId)+Number(s.occupancy.playerHome)," ","/ ",s.residenceCapacity??1," residents"]}):null,(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>gs(s),children:"View Venue"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Ae(structuredClone(s)),children:"Edit"}),(0,r.jsx)("button",{type:"button",className:`${i}-remove`,onClick:()=>{t$(s.id)},"aria-label":`Delete ${s.name}`,disabled:_,children:"\xD7"})]})]},s.id))}),he?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("h3",{className:`${i}-panel-title`,children:n.settings.venues.some(s=>s.id===he.id)?"Edit Venue":"Create Venue"}),(0,r.jsx)($0,{draft:he,existing:n.settings.venues.some(s=>s.id===he.id),villagers:n.villagers,onChange:Ae}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_||!he.name.trim()||!Mn(he).every(s=>Ge(he,s).description.trim()),onClick:()=>{e$(he)},children:"Save Venue"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Ae(null),children:"Cancel"})]})]}):null,(0,r.jsx)("div",{className:`${i}-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{A1()},disabled:_,children:"Suggest Venues"})}),Ql.filter(s=>!n.settings.venues.some(u=>u.id===s.id)).map(s=>(0,r.jsxs)("div",{className:`${i}-notice-row`,children:[(0,r.jsx)("strong",{children:s.name}),(0,r.jsx)("span",{className:`${i}-hint`,children:s.purpose}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Ae(s),children:"Review suggestion"})]},s.id))]}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-knowledge`,children:"The information villagers know"}),(0,r.jsx)("textarea",{id:`${i}-knowledge`,ref:Gu,className:`${i}-preset`,value:hn,maxLength:n.settings.promptBoxMaxLength,spellCheck:!1,onChange:s=>jl(s.target.value)}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"What a villager here knows, written as tokens the village fills in for itself: the time, the weather, who else lives here, what is on the noticeboard. Because it is written out fresh on every reply, a villager here is always current \u2014 and because it is only these tokens, adding a place or pinning a note reaches every villager without anything being edited here. A resident's card and the DEBUG Villager reply guidance govern how they respond."}),(0,r.jsx)("div",{className:`${i}-macros`,children:n.settings.macros.map(s=>(0,r.jsx)("button",{type:"button",className:`${i}-macro`,title:`${s.label} \u2014 ${s.help}`,onClick:()=>a$(s.token),children:s.token},s.token))}),(0,r.jsxs)("p",{className:`${i}-macro-help`,children:["Click a token to drop it in at the cursor of the box. A token with nothing behind it turns into nothing at all, so ",(0,r.jsx)("code",{children:"{{lore}}"})," can sit in the prompt until there is lore to put there."]})]}),(0,r.jsx)(E0,{idPrefix:"settings",personas:vu,draft:ma,onDraft:Gl,storedId:n.settings.playerPersonaId,storedName:n.settings.playerPersonaName,storedMissing:n.settings.playerPersonaMissing,disabled:_}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{E1()},disabled:_,children:"Save settings"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{jl(n.settings.defaultPromptKnowledge)},disabled:_,children:"Restore the default box"}),(0,r.jsx)("span",{className:`${i}-hint`,children:hn===n.settings.promptKnowledge&&ma===n.settings.playerPersonaId&&Yl===n.settings.setting&&JSON.stringify(Xl)===JSON.stringify(n.settings.selectedLorebookIds)?"No unsaved settings changes. Save places individually.":"Unsaved settings changes. Save places individually."})]})]}):null,Mt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Mt}):null]}):(0,r.jsxs)("div",{className:`${i}-menu-body`,children:[G==="villagers"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Villagers"})}),(0,r.jsxs)("nav",{className:`${i}-villager-submenu`,"aria-label":"Villagers sections",children:[(0,r.jsxs)("button",{type:"button","data-active":N==="residents","aria-pressed":N==="residents",onClick:()=>f("residents"),children:[(0,r.jsx)("span",{children:"Residents"}),(0,r.jsxs)("small",{children:[n?.villagers.length??0," living here"]})]}),(0,r.jsxs)("button",{type:"button","data-active":N==="memories","aria-pressed":N==="memories",onClick:()=>{f("memories"),C(null),ms()},children:[(0,r.jsx)("span",{children:"Memories"}),(0,r.jsx)("small",{children:"Passing, durable & evidence"})]})]}),N==="residents"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("p",{className:`${i}-empty`,children:"Characters from your library live here. Moving someone out forgets nothing about the character card itself."}),(0,r.jsx)("div",{className:`${i}-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>La(s=>!s),disabled:_,children:Ie?"Close the list":"Add a villager"})}),Ie?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("input",{className:`${i}-search`,type:"search",value:wp,onChange:s=>$p(s.target.value),placeholder:"Search by name, note or tag\u2026","aria-label":"Search your character library"}),l===null?(0,r.jsx)("p",{className:`${i}-empty`,style:{marginTop:".625rem"},children:"Reading your library\u2026"}):Ju.length===0?(0,r.jsx)("p",{className:`${i}-empty`,style:{marginTop:".625rem"},children:"No characters match that search."}):(0,r.jsx)("div",{className:`${i}-picker-list`,children:Ju.map(s=>(0,r.jsxs)("div",{className:`${i}-picker-item`,"data-resident":s.inVillage?"true":"false",children:[(0,r.jsx)(gr,{portrait:Rn[s.id],name:s.name,className:`${i}-avatar`}),(0,r.jsxs)("div",{className:`${i}-picker-text`,children:[(0,r.jsx)("div",{className:`${i}-villager-name`,children:s.name}),(0,r.jsx)("div",{className:`${i}-villager-role`,children:s.comment||s.tags.slice(0,3).join(" \xB7 ")}),s.summary?(0,r.jsx)("p",{className:`${i}-tile-summary`,children:s.summary}):null]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{f1(s.id)},disabled:_||s.inVillage,children:s.inVillage?"Lives here":"Move in"})]},s.id))})]}):null,n&&n.villagers.length>0?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("div",{className:`${i}-villagers`,children:n.villagers.map(s=>(0,r.jsx)(RS,{villager:s,portrait:Rn[s.characterId],selected:!1,onSelect:!s.place||L!==null?void 0:()=>{let u=n.settings.venues.find(p=>p.id===s.place?.id);u&&tg(u)}},s.characterId))}),(0,r.jsx)("div",{className:`${i}-roster`,children:n.villagers.map(s=>(0,r.jsxs)("div",{className:`${i}-roster-entry`,children:[(0,r.jsxs)("div",{className:`${i}-roster-row`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("span",{className:`${i}-villager-name`,children:s.name}),s.missing?(0,r.jsx)("span",{className:`${i}-badge`,children:"card missing"}):null,Ma[s.characterId]?(0,r.jsx)("div",{className:`${i}-tile-summary`,children:Ma[s.characterId].changed?`New card: ${Ma[s.characterId].proposed?.name??"unavailable"}`:Ma[s.characterId].sourceAvailable?`Snapshot revision ${Ma[s.characterId].current.revision} is current.`:"The saved snapshot remains playable; the source card is unavailable."}):null]}),(0,r.jsxs)("span",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>br(Jt===s.characterId?null:s.characterId),"aria-expanded":Jt===s.characterId,children:Jt===s.characterId?"Close sprite studio":`Sprites \xB7 ${s.sprite?.images.length??0} approved`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{v1(s.characterId)},disabled:_||bu.length>0,children:"Compare card"}),Ma[s.characterId]?.changed&&Ma[s.characterId]?.sourceAvailable?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{y1(s.characterId)},disabled:_||bu.length>0,children:"Apply refresh"}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{b1(s.characterId)},disabled:_||bu.length>0,children:"Move out"})]})]}),Jt===s.characterId?(0,r.jsx)(VS,{villager:s,onSaved:o}):null]},s.characterId))})]}):(0,r.jsx)("p",{className:`${i}-empty`,children:"Nobody lives here yet. If you have just founded the village, the people you named are on their way."})]}):(0,r.jsx)(W5,{library:$,busy:_,onRefresh:()=>{C(null),ms()},onForget:(s,u)=>{c1(s,u)}})]}):null,G==="noticeboard"&&n?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Noticeboard"})}),n.noticeboard.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Nothing is pinned up. Anything you add here is something the villagers can bring up in conversation \u2014 and they will pin notes of their own up as time goes on."}):(0,r.jsx)("ul",{className:`${i}-notices`,children:n.noticeboard.map((s,u)=>(0,r.jsxs)("li",{className:`${i}-notice-row`,children:[(0,r.jsxs)("span",{children:[s.author.length>0?(0,r.jsx)("span",{className:`${i}-notice-author`,children:`${s.author}: `}):null,s.text]}),(0,r.jsx)("button",{type:"button",className:`${i}-remove`,onClick:()=>{n$(u)},disabled:_,"aria-label":`Take down: ${s.text}`,children:"\xD7"})]},`${u}:${s.text}`))}),(0,r.jsxs)("div",{className:`${i}-notice-add`,children:[(0,r.jsx)("input",{className:`${i}-notice-input`,type:"text",value:Pl,maxLength:n.settings.maxNoticeLength,placeholder:"Pin up a rumour, an event, a rule\u2026","aria-label":"New noticeboard note",onChange:s=>Mp(s.target.value),onKeyDown:s=>{s.key==="Enter"&&(s.preventDefault(),bg())}}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{bg()},disabled:_||Pl.trim().length===0||n.noticeboard.length>=n.settings.maxNoticeboardNotes,children:`Pin it up (${n.noticeboard.length}/${n.settings.maxNoticeboardNotes})`})]})]}):null,G==="venueRequests"&&n?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Venue Requests"})}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"Villagers can ask for places in conversation or during village life. A place joins the village only when you approve it here. Taking down a notice does not change a request."}),n.venueRequests.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Nobody has requested a new place."}):(0,r.jsx)("ul",{className:`${i}-notices`,children:n.venueRequests.map(s=>{let u=pe[s.id]??s.venueDraft,p=x=>ha(M=>({...M,[s.id]:{...u,...x}}));return(0,r.jsx)("li",{className:`${i}-notice-row`,children:(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("strong",{children:s.requesterName||"A villager"}),(0,r.jsx)("span",{className:`${i}-hint`,children:` \xB7 ${s.source==="chat"?"Conversation":"Village life"}`}),(0,r.jsx)("input",{className:`${i}-notice-input`,value:u.name,maxLength:n.settings.maxVenueNameLength,"aria-label":`Requested place name from ${s.requesterName||"villager"}`,onChange:x=>p({name:x.target.value})}),(0,r.jsx)("input",{className:`${i}-notice-input`,value:u.purpose,maxLength:n.settings.maxVenueNoteLength,"aria-label":`Requested place purpose from ${s.requesterName||"villager"}`,onChange:x=>p({purpose:x.target.value})}),(0,r.jsx)("input",{className:`${i}-notice-input`,value:u.category,maxLength:n.settings.maxVenueNoteLength,placeholder:"Category (optional)","aria-label":`Requested place category from ${s.requesterName||"villager"}`,onChange:x=>p({category:x.target.value})}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:u.description??"",maxLength:1e3,"aria-label":`Requested place description from ${s.requesterName||"villager"}`,onChange:x=>p({description:x.target.value})}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_||!u.name.trim(),onClick:()=>{j(!0),Z(""),V("/locations/venue/descriptions/draft",{method:"POST",body:JSON.stringify({venues:[{id:s.id,name:u.name,purpose:u.purpose}]})}).then(x=>p({description:x.descriptions[s.id]??""})).catch(x=>Z(q(x,"The description draft could not be generated."))).finally(()=>j(!1))},children:"Generate description draft"}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_||!u.name.trim()||!u.purpose.trim()||!u.description?.trim(),onClick:()=>{fg(s,!0)},children:u.name!==s.venueDraft.name||u.purpose!==s.venueDraft.purpose||u.category!==s.venueDraft.category?"Send counteroffer":"Approve exact request"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>{fg(s,!1)},children:"Deny"})]})]})},s.id)})}),(0,r.jsx)("h3",{className:`${i}-panel-title`,children:"Home upgrade requests"}),n.upgradeRequests.length===0?(0,r.jsx)("p",{className:`${i}-hint`,children:"No home upgrades requested."}):n.upgradeRequests.map(s=>(0,r.jsxs)("div",{className:`${i}-notice-row`,children:[(0,r.jsx)("span",{children:s.detail}),[!0,!1].map(u=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>{j(!0),Z(""),V(`/venue-upgrades/${encodeURIComponent(s.id)}/${u?"approve":"deny"}`,{method:"POST"}).then(o).catch(p=>Z(q(p,"The upgrade request could not be decided."))).finally(()=>j(!1))},children:u?"Approve upgrade":"Deny"},String(u)))]},s.id)),(0,r.jsx)("h3",{className:`${i}-panel-title`,children:"Resident move requests"}),n.residences.filter(s=>s.status!=="current").length===0?(0,r.jsx)("p",{className:`${i}-hint`,children:"No moves pending."}):n.residences.filter(s=>s.status!=="current").map(s=>{let u=Rt(s.characterId),p=n.settings.venues.find(x=>x.id===s.proposedVenueId)?.name||"another venue";return(0,r.jsxs)("div",{className:`${i}-notice-row`,children:[(0,r.jsx)("span",{children:`${u} \u2192 ${p}`}),s.status==="moving"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("span",{className:`${i}-hint`,children:["Move due ",new Date(s.completesAt??"").toLocaleString()]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>{j(!0),Z(""),V("/residences/debug/complete-now",{method:"POST",body:JSON.stringify({characterId:s.characterId})}).then(o).catch(x=>Z(q(x,"The move could not be completed."))).finally(()=>j(!1))},children:"DEBUG: Complete move now"})]}):s.requestedBy==="player"?(0,r.jsxs)("span",{className:`${i}-hint`,children:["Awaiting ",u,"'s answer in conversation."]}):[!0,!1].map(x=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>{j(!0),Z(""),V(`/residences/${x?"approvals":"denials"}`,{method:"POST",body:JSON.stringify({characterId:s.characterId})}).then(o).catch(M=>Z(q(M,"The move request could not be decided."))).finally(()=>j(!1))},children:x?"Approve move":"Deny"},String(x)))]},s.characterId)}),Mt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Mt}):null]}):null,G==="homes"&&n?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Homes on the map"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Where everyone lives. Each Residence has its own name and Form. A Residence nobody has moved into is a normal thing for a village to have, and the villagers are told about the occupied ones and nothing else."}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_||pa.length>=bs,onClick:()=>{It(!0),Qu()},children:"Put a home on the map"}),(0,r.jsx)("span",{className:`${i}-hint`,children:`${pa.length} of at most ${bs}`})]}),pa.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"No homes on the map yet."}):(0,r.jsx)(AS,{homes:pa,villagers:(n?.villagers??[]).map(s=>({id:s.characterId,name:s.name})),disabled:_,selectedId:Q0,onPatch:ug,onRemove:L1,onSelect:$u,showDescriptions:!0,onGenerateDescription:s=>{G1(s)},lockedIds:new Set(n.settings.venues.filter(s=>s.occupancy.residentCharacterId).map(s=>s.id))}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>{j1()},children:"Save the homes"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>Or(n.settings.venues),children:"Put them back"}),(0,r.jsx)("span",{className:`${i}-hint`,children:mS(n.settings.venues,pa)?"No unsaved changes.":"Unsaved changes."})]})]}):null,G==="map"&&n?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Town map"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"The optional picture beneath the village's logical map. Upload one here, or leave the navigation surface clean; venue pins work in either case."}),(0,r.jsx)(hp,{src:is,alt:"A preview of the town map, framed the way it will be drawn in the village.",pins:n.settings.venues.flatMap(s=>{let u=Il(s);if(!u)return[];let p=s.occupancy.residentCharacterId?Rt(s.occupancy.residentCharacterId):s.occupancy.playerHome?Ji(n):"";return[{id:s.id,x:u.x,y:u.y,text:p?`${s.name||"Home"} \xB7 ${p}`:s.name,tone:fr(s)?T0({isPlayerHome:s.occupancy.playerHome,occupant:s.occupancy.residentCharacterId}):"venue",onSelect:()=>xu(s.id)}]}),placing:Jl!==null,view:Sr,shape:Gp,zoom:t1,onView:os?Nr:void 0,onPlace:Jl?(s,u)=>{let p=Jl;j(!0),Z(""),V(`/locations/venue/${encodeURIComponent(p)}`,{method:"PUT",body:JSON.stringify({presentation:{x:s,y:u}})}).then(o).catch(x=>Z(q(x,"The venue could not be placed."))).finally(()=>{j(!1),Nu(null)})}:void 0}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Venue positions and residents"}),n.settings.venues.map(s=>{let u=s.occupancy.residentCharacterId?Rt(s.occupancy.residentCharacterId):s.occupancy.playerHome?Ji(n):"",p=!!s.occupancy.residentCharacterId;return(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":Z0===s.id,onClick:()=>xu(s.id),children:s.name||"Home"}),(0,r.jsx)("span",{className:`${i}-hint`,children:u?`Lives here: ${u}`:"No villager lives here"}),(0,r.jsx)("span",{className:`${i}-hint`,children:Il(s)?"On map":"Not placed"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_||p,onClick:()=>{xu(s.id),Nu(s.id)},children:Il(s)?"Move pin":"Place pin"})]},s.id)}),Jl?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Nu(null),children:"Cancel pin placement"}):null,Mt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Mt}):null]}),os?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("div",{className:`${i}-steps`,role:"group","aria-label":"How the picture sits in the frame",children:k0.map(s=>(0,r.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":Sr.fit===s.fit?"true":"false","aria-pressed":Sr.fit===s.fit,onClick:()=>Nr({...Sr,fit:s.fit}),children:s.label},s.fit))}),(0,r.jsx)("p",{className:`${i}-hint`,children:k0.find(s=>s.fit===Sr.fit)?.help})]}):null,Hu?(0,r.jsx)("p",{className:`${i}-hint`,"data-tone":Hu.tone,children:Hu.text}):null,(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("input",{className:`${i}-file`,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",disabled:_,"aria-label":"Choose a town map picture",onChange:s=>{let u=s.target.files?.[0];s.target.value="",ig(u)}}),n.settings.townMapImageSetAt?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>{rg()},children:"Remove background image"}):null]}),os?(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>{og()},children:Va?"Use this map":"Keep this framing"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:fs,children:"Leave it as it was"})]}):(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("p",{className:`${i}-hint`,children:n.settings.townMapImageSetAt?"Your own map is drawn at the moment.":"The logical map is drawn without a background image."}),n.settings.townMapImageSetAt?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>_u(!0),children:"Crop or fit it again"}):null]}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"Landscape images work best. Each map keeps its actual size and shape, with the whole image visible on desktop. It is stored with the village so it travels with a backup. A picture that is too large is refused before upload rather than silently shrunk."}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Pictures of the places"}),(0,r.jsxs)("p",{className:`${i}-macro-help`,children:["What a conversation stands in when somebody is there. Open a Venue to generate, upload, or remove its picture. Nothing is drawn automatically. These are kept in the"," ",(0,r.jsx)("strong",{children:n.settings.villageGalleryFolderName})," folder of the Engine's own gallery rather than with the village, so they are yours to reuse or throw away from there, and a village with twenty pictured places stays as small as one with none."]}),zn(n.settings.venues).length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"No places yet, so there is nothing to draw."}):(0,r.jsx)("ul",{className:`${i}-places`,children:zn(n.settings.venues).map(s=>(0,r.jsxs)("li",{className:`${i}-place`,children:[s.presentation.image?(0,r.jsx)("img",{className:`${i}-place-thumb`,src:s.presentation.image.url,alt:"",loading:"lazy"}):(0,r.jsx)("span",{className:`${i}-place-thumb`,"data-empty":"true","aria-hidden":"true"}),(0,r.jsxs)("div",{className:`${i}-place-body`,children:[(0,r.jsx)("span",{className:`${i}-place-name`,children:s.name}),(0,r.jsx)("div",{className:`${i}-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>{gs(s)},children:"View Venue"})})]})]},s.id))})]})]}):null,G==="replyGuidance"?(0,r.jsx)(MS,{}):null,G==="story"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Village story"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Memories from conversations and favors can guide residents. Older model-written tick entries are kept here for review but no longer affect the village while Events is being rebuilt. A private memory is known only to the people named on it and to you. Deleting one here is permanent."}),d===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Reading what the village remembers\u2026"}):d.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Nothing written down yet. Meaningful visits and fulfilled wishes can leave memories."}):P5(d).map(s=>(0,r.jsxs)("section",{children:[(0,r.jsx)("h3",{className:`${i}-story-day`,children:s.label}),(0,r.jsx)("ul",{className:`${i}-story`,children:s.entries.map(u=>{let p=pp(u),x=u.actors.map(M=>M.name).join(", ");return(0,r.jsxs)("li",{className:`${i}-story-row`,children:[(0,r.jsxs)("span",{children:[p.length>0||u.scope==="private"||u.kind==="favour"?(0,r.jsxs)("span",{className:`${i}-story-meta`,children:[p,u.scope==="private"?(0,r.jsx)("span",{className:`${i}-story-scope`,children:` \xB7 private to ${x}`}):null,u.kind==="favour"?(0,r.jsx)("span",{className:`${i}-story-scope`,children:" \xB7 a favour"}):null,u.kind==="tick"?(0,r.jsx)("span",{className:`${i}-story-scope`,children:" \xB7 legacy Events prose"}):null]}):null,u.text]}),(0,r.jsx)("button",{type:"button",className:`${i}-remove`,disabled:_,onClick:()=>{u1(u.id)},"aria-label":`Forget: ${u.text}`,children:"\xD7"})]},u.id)})})]},`${s.label}:${s.entries[0]?.id??""}`)),d&&d.length<g?(0,r.jsxs)("button",{type:"button",className:`${i}-button`,onClick:()=>{d1()},children:["Load more memories (",d.length," of ",g,")"]}):null]}):null,G==="chatlogs"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Venue visits"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Completed venue visits are kept here word for word. Filter by place or resident; each visit has one shared record, including who heard each line. The village uses only the separately distilled memories."}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsxs)("select",{"aria-label":"Filter visits by venue",value:De,onChange:s=>{Fe(s.target.value),S(0),B(null)},children:[(0,r.jsx)("option",{value:"",children:"All venues"}),(n?.settings.venues??[]).map(s=>(0,r.jsx)("option",{value:s.id,children:s.name},s.id))]}),(0,r.jsxs)("select",{"aria-label":"Filter visits by resident",value:Ba,onChange:s=>{mi(s.target.value),S(0),B(null)},children:[(0,r.jsx)("option",{value:"",children:"All residents"}),(n?.villagers??[]).map(s=>(0,r.jsx)("option",{value:s.characterId,children:s.name},s.characterId))]})]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_||w===0,onClick:()=>{Wp()},children:"Delete all completed logs"}),qt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:qt}):null,k===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Reading venue visits\u2026"}):k.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"No completed visits match these filters."}):k.map(s=>(0,r.jsxs)("section",{children:[(0,r.jsxs)("h3",{className:`${i}-story-day`,children:[s.placeName," \xB7 ",pu(s.startedAt)]}),(0,r.jsxs)("p",{className:`${i}-story-meta`,children:[s.participants.map(u=>u.name).join(", ")," \xB7 ",s.lineCount," lines",s.endReason==="inactivity"?" \xB7 Interrupted: Inactivity":"",s.memoryPending?s.memoryReview?.status==="pending"?` \xB7 durable review pending \xB7 ${s.memoryReview.attempts} ${s.memoryReview.attempts===1?"attempt":"attempts"}`:` \xB7 legacy memory pending (${s.memoryProgress?.nextUnit??0}/${s.memoryUnits} pieces processed)`:""]}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Xu(s.id)},children:U?.id===s.id?"Refresh transcript":"Open transcript"}),s.memoryPending?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>{g1(s.id)},children:s.memoryReview?.status==="pending"?"Retry review":"Retry memory"}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>{Wp(s.id)},children:"Delete log"})]}),U?.id===s.id?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("ul",{className:`${i}-story`,children:U.lines.map((u,p)=>(0,r.jsx)("li",{className:`${i}-story-row`,children:(0,r.jsxs)("span",{children:[(0,r.jsxs)("span",{className:`${i}-story-meta`,children:[u.name||Ji(n)," \xB7 ",pu(u.at)]}),pr(u.content,`venue-${s.id}-${p}-`),(0,r.jsxs)("span",{className:`${i}-story-meta`,children:["Heard by:"," ",u.heardBy?.map(x=>U.participants.find(M=>M.characterId===x)?.name??x).join(", ")||"no one"]})]})},`${s.id}:${p}`))}),(U.submissions??[]).some(u=>u.recollections?.length)?(0,r.jsxs)("details",{className:`${i}-agenda-notes`,children:[(0,r.jsx)("summary",{children:"Captured recollections and evidence"}),(0,r.jsx)("ul",{className:`${i}-story`,children:(U.submissions??[]).flatMap(u=>(u.recollections??[]).map(p=>(0,r.jsxs)("li",{className:`${i}-wish-card`,children:[(0,r.jsx)("p",{className:`${i}-wish-text`,children:p.text}),(0,r.jsx)("p",{className:`${i}-wish-meta`,children:`Subjects: ${p.subjectCharacterIds.join(", ")||"none"} \xB7 Known by: ${p.knownByCharacterIds.join(", ")}`}),(0,r.jsx)("p",{className:`${i}-wish-meta`,children:`Evidence: ${p.lineIds.join(", ")}`})]},p.id)))})]}):null,U.memoryReview&&U.memoryReview.status!=="none"?(0,r.jsxs)("details",{className:`${i}-agenda-notes`,open:U.memoryPending,children:[(0,r.jsx)("summary",{children:`Durable review \xB7 ${U.memoryReview?.status??"none"}`}),(0,r.jsxs)("div",{className:`${i}-agenda-notes-body`,children:[(0,r.jsxs)("p",{className:`${i}-story-meta`,children:[`${U.memoryReview?.attempts??0} review attempts`,U.memoryReview?.error?` \xB7 Last error: ${U.memoryReview.error}`:""]}),(0,r.jsx)("ul",{className:`${i}-story`,children:(U.memoryReview?.decisions??[]).map(u=>(0,r.jsxs)("li",{className:`${i}-wish-card`,children:[(0,r.jsx)("p",{className:`${i}-wish-text`,children:`${u.action==="promote"?"Promoted":"Rejected"}${u.category?` \xB7 ${O0[u.category]}`:""}`}),u.text?(0,r.jsx)("p",{children:u.text}):null,(0,r.jsx)("p",{className:`${i}-wish-meta`,children:u.reason}),(0,r.jsx)("p",{className:`${i}-wish-meta`,children:`Sources: ${u.recollectionIds.join(", ")}`})]},u.id))})]})]}):null]}):null]},s.id)),w>20?(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:b===0,onClick:()=>{S(Math.max(0,b-20)),B(null)},children:"Previous"}),(0,r.jsxs)("span",{children:[b+1,"\u2013",Math.min(w,b+20)," of ",w]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:b+20>=w,onClick:()=>{S(b+20),B(null)},children:"Next"})]}):null]}):null,G==="agendas"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"What the villagers wish"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Private wishes can shape what a villager notices, says, and does. Their agenda is in Villager Agendas."}),I===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Reading what the villagers wish\u2026"}):I.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Nobody lives here yet."}):(0,r.jsx)("section",{children:I.map(s=>(0,r.jsxs)("div",{children:[(0,r.jsxs)("h3",{className:`${i}-story-day`,children:[s.name,s.missing?(0,r.jsx)("span",{className:`${i}-badge`,children:"card missing"}):null]}),s.agenda===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Not written for yet. The village works this out on the next part of the day it already runs on, so there is nothing to press."}):s.agenda.wishes.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:s.agenda.personalizationFailure?`Wish generation failed: ${s.agenda.personalizationFailure}`:s.agenda.generatedAt?"No current wishes.":"Wishes are still being worked out. Their provisional agenda is already available."}):(0,r.jsx)("ul",{className:`${i}-story`,children:s.agenda.wishes.map(u=>(0,r.jsxs)("li",{className:`${i}-wish-card`,children:[(0,r.jsx)("p",{className:`${i}-wish-text`,children:u.wish}),u.tell.length>0?(0,r.jsx)("p",{className:`${i}-wish-tell`,children:`Shows as: ${u.tell}`}):null,(0,r.jsx)("p",{className:`${i}-wish-meta`,children:`${u.intensity===1?"Faint":u.intensity===3?"Strong":"Present"} \xB7 ${aS(u.addedAt??"",u.expiresAt??"")}`})]},u.id))}),s.completedWishes.length>0?(0,r.jsxs)("details",{className:`${i}-agenda-notes`,children:[(0,r.jsx)("summary",{children:`Completed wishes (${s.completedWishes.length})`}),(0,r.jsx)("ul",{className:`${i}-story`,children:s.completedWishes.map(u=>(0,r.jsxs)("li",{className:`${i}-wish-card`,children:[(0,r.jsx)("p",{className:`${i}-wish-text`,children:u.wish.wish}),(0,r.jsx)("p",{className:`${i}-wish-meta`,children:`Fulfilled ${new Date(u.fulfilledAt).toLocaleDateString()}`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>{m1(s.characterId,u.wish.id)},children:"Mark as not fulfilled"})]},u.wish.id))})]}):null]},s.characterId))})]}):null,G==="schedules"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Villager agendas"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Each villager follows a Villages agenda. A Marinara schedule can guide future days when enabled."}),I===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Loading agendas\u2026"}):I.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Nobody lives here yet."}):(0,r.jsx)("div",{className:`${i}-agenda-list`,children:I.map(s=>(0,r.jsxs)("details",{className:`${i}-week`,children:[(0,r.jsx)("summary",{className:`${i}-week-toggle`,children:(0,r.jsxs)("h3",{className:`${i}-week-head`,children:[s.name,s.agenda?.personalizationPending?(0,r.jsx)("span",{className:`${i}-badge`,children:s.agenda.personalizationFailure?"Personalization needs retry":"Personalizing"}):null,s.agenda?.personalizationFailure?(0,r.jsx)("span",{className:`${i}-badge`,children:"Personalization failed"}):null,s.missing?(0,r.jsx)("span",{className:`${i}-badge`,children:"Card missing"}):null,s.nativeSchedule?(0,r.jsx)("span",{className:`${i}-badge`,children:s.agenda?.activeDay?.scheduleInformed?"Schedule used today":"Schedule available"}):null,sp(s)?(0,r.jsx)("span",{className:`${i}-badge`,children:"Earlier hours kept"}):null]})}),(0,r.jsxs)("div",{className:`${i}-week-body`,children:[s.agenda?.routineSummary?(0,r.jsx)("p",{className:`${i}-story-meta`,children:s.agenda.routineSummary}):null,s.agenda?.personalizationFailure?(0,r.jsx)("p",{className:`${i}-empty`,children:s.agenda.personalizationFailure}):s.agenda?.personalizationPending?(0,r.jsx)("p",{className:`${i}-story-scope`,children:"Personalizing this agenda in the background."}):null,(0,r.jsxs)("div",{className:`${i}-agenda-actions`,children:[(0,r.jsxs)("label",{className:`${i}-agenda-switch`,children:[(0,r.jsx)("input",{type:"checkbox",checked:s.ingestSchedule,disabled:_,onChange:u=>{p1(s.characterId,u.target.checked)}}),"Use Marinara schedule when available"]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>{h1(s.characterId)},children:"Regenerate agenda"})]}),s.nativeSchedule?(0,r.jsxs)("p",{className:`${i}-story-scope`,children:[s.ingestSchedule&&s.remapFailure?`Schedule translation failed: ${s.remapFailure.message}`:s.ingestSchedule&&s.agenda?.scheduleWeek?"Schedule guides today and future days.":s.ingestSchedule?"Schedule translation is pending.":"Schedule ingestion is off.",sp(s)?" Earlier hours retain the previous plan.":""]}):sp(s)?(0,r.jsx)("p",{className:`${i}-story-scope`,children:"Earlier hours retain the previous plan."}):null,s.weekUnreadable?(0,r.jsx)("p",{className:`${i}-empty`,children:"Marinara schedules could not be read right now. The Villages agenda remains active."}):s.nativeSchedule?null:(0,r.jsx)("p",{className:`${i}-empty`,children:"No Marinara schedule. Villages uses its own agenda."}),(0,r.jsx)("div",{className:`${i}-agenda-days`,children:s.days.map(u=>{let p=u.isToday?s.agenda?.activeDay?.blocks??s.agenda?.week?.[u.weekday]??[]:(s.ingestSchedule?s.agenda?.scheduleWeek?.[u.weekday]:void 0)??s.agenda?.week?.[u.weekday]??[],x=s.nativeSchedule?.days[u.weekday]??[];return(0,r.jsxs)("details",{className:`${i}-agenda-day`,open:u.isToday||void 0,children:[(0,r.jsxs)("summary",{children:[u.weekday," \xB7 ",u.dateLabel,u.isToday?" \xB7 Today":""]}),(0,r.jsxs)("div",{className:`${i}-agenda-compare`,"data-comparison":s.nativeSchedule?"true":void 0,children:[(0,r.jsxs)("section",{"aria-label":`${u.weekday} Villages agenda`,children:[(0,r.jsx)("h4",{children:"Villages agenda"}),(0,r.jsx)("ol",{className:`${i}-agenda-blocks`,children:p.map((M,O)=>(0,r.jsxs)("li",{children:[(0,r.jsxs)("time",{children:[f0(M.startMinute),"\u2013",f0(M.endMinute)]}),(0,r.jsx)("strong",{children:M.activity}),(0,r.jsx)("span",{children:M.venueId?eS(n?.settings.venues??[],M.venueId):"Home"}),(0,r.jsx)("span",{children:M.reason}),(0,r.jsx)("span",{className:`${i}-story-scope`,children:M.status==="idle"?"Available":M.status==="dnd"?"Busy":M.status==="offline"?"Offline":"Online"})]},`${M.startMinute}-${M.endMinute}-${O}`))})]}),s.nativeSchedule?(0,r.jsxs)("section",{"aria-label":`${u.weekday} Marinara schedule`,children:[(0,r.jsx)("h4",{children:"Marinara schedule"}),x.length?(0,r.jsx)("ol",{className:`${i}-agenda-blocks`,children:x.map((M,O)=>(0,r.jsxs)("li",{children:[(0,r.jsx)("time",{children:M.time}),(0,r.jsx)("strong",{children:M.activity}),(0,r.jsx)("span",{className:`${i}-story-scope`,children:M.status||"No availability set"})]},`${M.time}-${O}`))}):(0,r.jsx)("p",{className:`${i}-empty`,children:"No schedule blocks for this day."})]}):null]})]},`${u.weekday}-${u.dateLabel}`)})})]})]},s.characterId))})]}):null,Mt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Mt}):null]})]});if(le==="preparing"){let s=n?.foundingPreparation,u=n?.villagers.length??0,p=s?.completedIds.length??0,x=n?.villagers.find(M=>M.characterId===s?.currentId)?.name;return(0,r.jsx)("div",{className:`${i}-root ${i}-preparing`,role:"status","aria-live":"polite",children:(0,r.jsxs)("div",{children:[(0,r.jsx)("div",{className:`${i}-preparing-house`,"aria-hidden":"true",children:"\u{1F3E1}"}),(0,r.jsxs)("h1",{children:[n?.village.name??"Your village"," is settling in"]}),(0,r.jsx)("p",{children:s?.status==="failed"?"The villagers need a hand before the gates open.":x?`Making room for ${x}\u2026`:"Lighting windows and making plans\u2026"}),(0,r.jsx)("p",{children:`${p} of ${u} villagers ready`}),s?.status==="failed"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:s.error}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{F1()},children:"Retry"}),(0,r.jsxs)("details",{children:[(0,r.jsx)("summary",{children:"Change connections"}),(0,r.jsx)(mp,{})]})]}):null,qp?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:qp}):null]})})}if(le==="setup"){let s=(l??[]).map(u=>({id:u.id,name:u.name}));return(0,r.jsxs)("div",{className:`${i}-root ${i}-home`,children:[(0,r.jsx)("div",{className:`${i}-mapbar`,children:(0,r.jsx)("span",{className:`${i}-mapbar-title`,children:Ra.trim()||"A new village"})}),(0,r.jsxs)("div",{className:`${i}-home-body`,children:[(0,r.jsx)("div",{className:`${i}-side`,children:(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:n?.isFounded?"Setting the village up again":"Founding your village"})}),(0,r.jsx)("div",{className:`${i}-steps`,children:m0.map((u,p)=>(0,r.jsx)("span",{className:`${i}-step`,"data-active":p===Ye?"true":"false","data-done":p<Ye?"true":"false",children:`${p+1}. ${u}`},u))}),Ye===0?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setup-name`,children:"What is this village called?"}),(0,r.jsx)("input",{id:`${i}-setup-name`,className:`${i}-search`,type:"text",value:Ra,maxLength:n?.settings.villageNameMaxLength,placeholder:"Ashwater",disabled:_,onChange:u=>Rp(u.target.value)})]}),(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Why is this village being founded?"}),(0,r.jsx)("div",{className:`${i}-reason-options`,children:d0.map(u=>(0,r.jsxs)("label",{className:`${i}-reason-option`,children:[(0,r.jsx)("input",{type:"radio",name:`${i}-founding-reason`,checked:Pt===u.value,disabled:_,onChange:()=>Vp(u.value)}),u.label]},u.value))})]}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsxs)("label",{className:`${i}-label`,htmlFor:`${i}-founding-details`,children:["Founding details ",Pt==="something-else"?"(required)":"(optional)"]}),(0,r.jsx)("textarea",{id:`${i}-founding-details`,className:`${i}-textarea`,value:Ga,maxLength:n?.settings.foundingDetailsMaxLength??500,placeholder:"Who brought everyone together, and what are they hoping to build?",disabled:_,onChange:u=>Dp(u.target.value)}),(0,r.jsx)("span",{className:`${i}-hint`,children:"This premise informs village stories without forcing repeated events."})]}),(0,r.jsx)(E0,{idPrefix:"setup",personas:vu,draft:ma,onDraft:Gl,storedId:n?.settings.playerPersonaId??"",storedName:n?.settings.playerPersonaName??"",storedMissing:n?.settings.playerPersonaMissing??!1,disabled:_}),(0,r.jsx)(C0,{books:wu,error:Cp,selected:ja,onChange:u=>{kp(u),Fl([])},disabled:_}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setup-lore-budget`,children:"Lorebook token budget"}),(0,r.jsx)("input",{id:`${i}-setup-lore-budget`,className:`${i}-notice-input`,type:"number",min:n?.settings.loreTokenBudgetMin??200,max:n?.settings.loreTokenBudgetMax??3200,step:100,value:Fi,disabled:_,onChange:u=>Ep(Number(u.target.value))}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Maximum approximate lore tokens for village text, wishes, and agendas."})]})]}):null,Ye===1?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(mp,{onSetupProblem:P0,onImageWarningChange:Bp}),F0?(0,r.jsxs)("div",{className:`${i}-chat-confirm`,role:"alertdialog","aria-label":"Image connection recommendation",children:[(0,r.jsx)("p",{className:`${i}-chat-confirm-note`,children:"Villages is meant to be an immersive experience with dynamic locations and expressive characters. An image connection is highly recommended for the complete Villages experience."}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"Villages is still playable without an image connection. You can always manually add images to locations, characters, and more."}),(0,r.jsxs)("span",{className:`${i}-chat-confirm-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:X1,children:"Set up an image connection"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:Y1,children:"I understand, continue"})]})]}):null]}):null,Ye===2?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setup-setting`,children:"Setting and Theme"}),(0,r.jsx)("textarea",{id:`${i}-setup-setting`,className:`${i}-textarea`,value:Tt,maxLength:n?.settings.settingMaxLength,placeholder:"A cliffside fishing town where the boats go out before dawn\u2026",disabled:_||zt,onChange:u=>{Op(u.target.value),Fl([])}}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Required. Describe the village's setting, visual style, and narrative vibe."})]}),(0,r.jsxs)("div",{className:`${i}-steps`,role:"group","aria-label":"Village map image source",children:[(0,r.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":ze==="generate"?"true":"false","aria-pressed":ze==="generate",disabled:zt,onClick:()=>vi("generate"),children:"Generate with AI"}),(0,r.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":ze==="upload"?"true":"false","aria-pressed":ze==="upload",disabled:zt,onClick:()=>vi("upload"),children:"Upload an image"}),(0,r.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":ze==="none"?"true":"false","aria-pressed":ze==="none",disabled:zt,onClick:()=>vi("none"),children:"No background image"}),n?.settings.townMapImageSetAt?(0,r.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":ze==="existing"?"true":"false","aria-pressed":ze==="existing",disabled:zt,onClick:()=>vi("existing"),children:"Keep current map"}):null]}),ze==="generate"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Map elements"}),(0,r.jsx)("div",{className:`${i}-reason-options`,children:[["roads","Roads and paths"],["structures","Structures"],["water","Water"]].map(([u,p])=>(0,r.jsxs)("label",{className:`${i}-reason-option`,children:[(0,r.jsx)("input",{type:"checkbox",checked:Eu[u],disabled:zt,onChange:x=>Up(M=>({...M,[u]:x.target.checked}))}),p]},u))}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Unchecked elements are excluded, even if Setting and Theme mentions them. Structures may appear anywhere but must leave room for future locations."})]}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsxs)("label",{className:`${i}-label`,htmlFor:`${i}-setup-map-prompt`,children:[(0,r.jsx)("span",{className:`${i}-debug-label`,children:"DEBUG"})," Map layout prompt"]}),(0,r.jsx)("textarea",{id:`${i}-setup-map-prompt`,className:`${i}-textarea`,value:yi,maxLength:1500,disabled:zt,onChange:u=>Mu(u.target.value)}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Temporary testing override. The default comes from the server; edits apply only to this setup session."})]}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsxs)("label",{className:`${i}-label`,htmlFor:`${i}-setup-map-negative`,children:[(0,r.jsx)("span",{className:`${i}-debug-label`,children:"DEBUG"})," Negative map tags"]}),(0,r.jsx)("textarea",{id:`${i}-setup-map-negative`,className:`${i}-textarea`,value:wr,maxLength:1500,disabled:zt,onChange:u=>Ru(u.target.value)}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Image providers handle negative tags differently. Review the resulting map before continuing."})]}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:zt||Tt.trim().length===0||yi.trim().length===0,onClick:()=>{z1()},children:zt?"Generating map\u2026":Wl==="generate"?"Generate again":"Generate map"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:zt||yi===n?.settings.townMapLayoutPrompt&&wr===n?.settings.townMapNegativePrompt,onClick:()=>{Mu(n?.settings.townMapLayoutPrompt??""),Ru(n?.settings.townMapNegativePrompt??"")},children:"Restore default prompt"})]})]}):null,ze==="upload"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("input",{className:`${i}-file`,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",disabled:zt,"aria-label":"Choose a village map image",onChange:u=>{let p=u.target.files?.[0];u.target.value="",R1(p)}}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Landscape images work best. PNG, JPEG, WebP, and AVIF are accepted at their native size; the file must fit the size limit shown if it is refused."})]}):null,ze==="none"?(0,r.jsx)("p",{className:`${i}-empty`,children:"Venues will remain clickable on a clean logical map surface. You can add an image from the Town map panel later."}):null,yr&&ze!=="none"&&Wl===ze&&Yp?(0,r.jsx)("p",{className:`${i}-hint`,"data-tone":up(yr).tone,children:up(yr).text}):null]}):null,Ye===3?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("p",{className:`${i}-empty`,children:"Place your Residence, one to three villager Residences, and one Gathering Place. Select a photograph to finish it."}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_||Oa||Ee.filter(u=>u.classes?.includes("residence")).length>=1+ho,onClick:()=>{It(!0),gi(!1),bi(null)},children:"Place a Residence"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_||Oa||Ee.some(u=>u.category==="public-center"),onClick:()=>{It(!1),gi(!0),bi(null)},children:"Place a Gathering Place"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_||Oa||Ee.length===0,onClick:()=>{fi([]),On(null),eo({}),to(null),bi(null),It(!1),gi(!1)},children:"Reset all venues"})]}),Hp?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Hp}):null,(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_||Oa||!Ee.length,onClick:()=>{mg(Ee)},children:"Draft all venue text"}),Object.keys(Ft).length>1?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Object.keys(Ft).forEach(u=>Ku(u,!1)),children:"Use all drafts in empty fields"}):null]}),(0,r.jsx)("div",{className:`${i}-setup-venue-list`,children:Ee.map(u=>(0,r.jsxs)("button",{type:"button",className:`${i}-setup-venue-card`,"data-selected":u.id===_p?"true":"false",onClick:()=>On(u.id),children:[u.presentation.image?(0,r.jsx)("img",{src:u.presentation.image.url,alt:""}):(0,r.jsx)("span",{className:`${i}-setup-venue-placeholder`,"aria-hidden":"true",children:"\u2302"}),(0,r.jsxs)("span",{children:[(0,r.jsx)("strong",{children:u.name||"Unnamed venue"}),(0,r.jsxs)("small",{children:[u.category==="public-center"?"Gathering Place":"Residence"," \xB7"," ",u.occupancy.playerHome?"You":Rt(u.occupancy.residentCharacterId)||"Choose a villager"]})]})]},u.id))}),J&&mo?(0,r.jsxs)("div",{className:`${i}-setup-venue-editor`,children:[(0,r.jsxs)("h3",{className:`${i}-panel-title`,children:[J.category==="public-center"?"Gathering Place":"Residence"," \xB7"," ",J.name]}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{bi(J.id),It(!1),gi(!1)},children:"Move on map"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>I1(J.id),children:"Remove venue"})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Name",(0,r.jsx)("input",{className:`${i}-notice-input`,value:J.name,maxLength:100,onChange:u=>Bt(J.id,p=>({...p,name:u.target.value}))})]}),J.category==="public-center"?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_||Oa,onClick:()=>{M1()},children:"Suggest three names"}),K0.map(u=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Bt(J.id,p=>({...p,name:u})),children:u},u))]}):null,(0,r.jsxs)("label",{className:`${i}-label`,children:["Form \xB7 what is it?",(0,r.jsx)("input",{className:`${i}-notice-input`,value:J.form??"",maxLength:240,onChange:u=>Bt(J.id,p=>({...p,form:u.target.value}))})]}),J.category!=="public-center"?(0,r.jsxs)("label",{className:`${i}-label`,children:["Resident",(0,r.jsxs)("select",{className:`${i}-select`,value:J.occupancy.residentCharacterId??"",disabled:J.occupancy.playerHome,onChange:u=>Bt(J.id,p=>({...p,residentIds:u.target.value?[u.target.value]:[],occupancy:{...p.occupancy,residentCharacterId:u.target.value||null}})),children:[(0,r.jsx)("option",{value:"",children:J.occupancy.playerHome?"You":"Choose a villager"}),s.map(u=>(0,r.jsx)("option",{value:u.id,disabled:Ee.some(p=>p.id!==J.id&&p.occupancy.residentCharacterId===u.id),children:u.name},u.id))]})]}):null,(0,r.jsxs)("label",{className:`${i}-label`,children:["Purpose",(0,r.jsx)("input",{className:`${i}-notice-input`,value:J.purpose,maxLength:240,onChange:u=>Bt(J.id,p=>({...p,purpose:u.target.value}))})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Guidance for AI text and art",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:J.guidance,maxLength:1e3,placeholder:"Mood, materials, details to include or avoid\u2026",onChange:u=>Bt(J.id,p=>({...p,guidance:u.target.value}))})]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:Oa,onClick:()=>{mg([J])},children:"Generate text draft"}),Ft[J.id]?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("strong",{children:"Suggested venue text"}),(0,r.jsxs)("p",{children:[Ft[J.id]?.name," \xB7"," ",Ft[J.id]?.form]}),(0,r.jsxs)("p",{children:[(0,r.jsx)("strong",{children:"Purpose:"})," ",Ft[J.id]?.purpose]}),(0,r.jsxs)("p",{children:[(0,r.jsx)("strong",{children:"Exterior:"})," ",Ft[J.id]?.description]}),(0,r.jsxs)("p",{children:[(0,r.jsx)("strong",{children:"Scene:"})," ",Ft[J.id]?.spaceDescription]}),(0,r.jsxs)("p",{children:[(0,r.jsx)("strong",{children:"Initial condition:"})," ",Ft[J.id]?.condition]}),(0,r.jsxs)("p",{children:[(0,r.jsx)("strong",{children:"Items:"})," ",Ft[J.id]?.items.join(", ")||"None"]}),(0,r.jsxs)("p",{children:[(0,r.jsx)("strong",{children:"Public facts:"})," ",Ft[J.id]?.publicFacts.join(", ")||"None"]}),(0,r.jsxs)("p",{children:[(0,r.jsx)("strong",{children:"Features:"})," ",Ft[J.id]?.features.join(", ")||"None"]}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Ku(J.id,!1),children:"Use in empty fields"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Ku(J.id,!0),children:"Replace text with this draft"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>eo(u=>{let p={...u};return delete p[J.id],p}),children:"Discard draft"})]})]}):null,(0,r.jsxs)("label",{className:`${i}-label`,children:["Exterior description",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:J.description,maxLength:1e3,onChange:u=>Bt(J.id,p=>({...p,description:u.target.value}))})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Scene description",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:mo.description,maxLength:1e3,onChange:u=>Bt(J.id,p=>({...p,spaces:[{...Ge(p,p.category==="public-center"?"gathering":"residence"),description:u.target.value}]}))})]}),["exterior","interior"].map(u=>{let p=u==="exterior"?J.presentation.image:mo.image;return(0,r.jsxs)("section",{className:`${i}-field`,children:[(0,r.jsxs)("span",{className:`${i}-label`,children:[u==="exterior"?"Exterior photograph":"Interior photograph"," \xB7 optional"]}),p?(0,r.jsx)("img",{className:`${i}-setup-image-preview`,src:p.url,alt:`${u} of ${J.name}`}):(0,r.jsx)("p",{className:`${i}-hint`,children:"No image yet. A placeholder will be used."}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:Oa,onClick:()=>{Q1(J,u)},children:p?"Regenerate image":"Generate image"}),(0,r.jsx)("input",{className:`${i}-file`,type:"file",accept:"image/*",disabled:Oa,"aria-label":`Upload ${u} image for ${J.name}`,onChange:x=>{let M=x.target.files?.[0];x.target.value="",Z1(J,u,M)}}),p?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Bt(J.id,x=>u==="exterior"?{...x,presentation:{...x.presentation,image:null}}:{...x,spaces:[{...Ge(x,x.category==="public-center"?"gathering":"residence"),image:null}]}),children:"Remove image"}):null]}),vr?.venueId===J.id&&vr.area===u?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("img",{className:`${i}-setup-image-preview`,src:vr.image.url,alt:"New image preview"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:K1,children:"Use this photograph"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>to(null),children:"Discard"})]}):null]},u)}),(0,r.jsxs)("details",{children:[(0,r.jsx)("summary",{children:"Advanced venue details"}),(0,r.jsxs)("div",{className:`${i}-setup-venue-editor`,children:[(0,r.jsxs)("label",{className:`${i}-label`,children:["Initial condition",(0,r.jsx)("input",{className:`${i}-notice-input`,value:mo.state.condition,onChange:u=>Bt(J.id,p=>{let x=Ge(p,p.category==="public-center"?"gathering":"residence");return{...p,spaces:[{...x,state:{...x.state,condition:u.target.value}}]}})})]}),["items","publicFacts"].map(u=>(0,r.jsxs)("label",{className:`${i}-label`,children:[u==="items"?"Notable items \xB7 one per line":"Public facts \xB7 one per line",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:mo.state[u].join(`
`),onChange:p=>Bt(J.id,x=>{let M=Ge(x,x.category==="public-center"?"gathering":"residence");return{...x,spaces:[{...M,state:{...M.state,[u]:p.target.value.split(`
`).map(O=>O.trim()).filter(Boolean)}}]}})})]},u)),(0,r.jsxs)("label",{className:`${i}-label`,children:["Features \xB7 one per line",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:mo.state.features.map(u=>u.text).join(`
`),onChange:u=>Bt(J.id,p=>{let x=Ge(p,p.category==="public-center"?"gathering":"residence");return{...p,spaces:[{...x,state:{...x.state,features:u.target.value.split(`
`).map(M=>M.trim()).filter(Boolean).slice(0,5).map((M,O)=>({id:x.state.features[O]?.id??Zi(),text:M,sourceCharacterId:"",locked:!1,updatedAt:""}))}}]}})})]})]})]})]}):(0,r.jsx)("p",{className:`${i}-hint`,children:"Place or select a venue to edit it."}),l===null?(0,r.jsx)("p",{className:`${i}-hint`,children:"Reading your villager library\u2026"}):null]}):null,Ye===4?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("p",{className:`${i}-empty`,children:"Review your village before opening its gates. Return to Step 4 to change a venue."}),(0,r.jsxs)("p",{className:`${i}-hint`,children:[Ra.trim()," \xB7 ",Tt.trim()," \xB7"," ",Ee.filter(u=>u.classes?.includes("residence")).length," Residences \xB7"," ",Ee.filter(u=>u.category==="public-center").length," Gathering Place"]}),(0,r.jsxs)("p",{className:`${i}-hint`,children:[(0,r.jsx)("strong",{children:"Persona:"})," ",vu?.find(u=>u.id===ma)?.name??"Selected Persona"," \xB7 ",(0,r.jsx)("strong",{children:"Founded for:"})," ",d0.find(u=>u.value===Pt)?.label??Pt,Ga?` \xB7 ${Ga}`:""]}),(0,r.jsxs)("p",{className:`${i}-hint`,children:[(0,r.jsx)("strong",{children:"Map:"})," ",ze==="none"?"Logical map":"Chosen picture"," \xB7 ",(0,r.jsx)("strong",{children:"Lorebooks:"})," ",ja.map(u=>wu?.find(p=>p.id===u)?.name??u).join(", ")||"None"]}),(0,r.jsx)("div",{className:`${i}-setup-venue-list`,children:Ee.map(u=>(0,r.jsxs)("div",{className:`${i}-setup-venue-card`,children:[u.presentation.image?(0,r.jsx)("img",{src:u.presentation.image.url,alt:""}):(0,r.jsx)("span",{className:`${i}-setup-venue-placeholder`,"aria-hidden":"true",children:"\u2302"}),(0,r.jsxs)("span",{children:[(0,r.jsxs)("strong",{children:[u.name," \xB7 ",u.category==="public-center"?"Gathering Place":"Residence"]}),(0,r.jsxs)("small",{children:[u.form," \xB7"," ",u.occupancy.playerHome?"You":Rt(u.occupancy.residentCharacterId)||"Community"]})]})]},u.id))}),Ee.map(u=>(0,r.jsxs)("p",{className:`${i}-hint`,children:[(0,r.jsxs)("strong",{children:[u.name,":"]})," ",u.description," ",u.spaces?.[0]?.description]},`${u.id}-summary`))]}):null,(0,r.jsxs)("div",{className:`${i}-row`,children:[Ye>0?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_||zt,onClick:()=>dg(Ye-1),children:"Back"}):null,Ye<m0.length-1?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_||zt,onClick:()=>dg(Ye+1),children:"Next"}):(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_||zt||!n,onClick:()=>{J1()},children:n?.isFounded?"Save this village":"Found the village"}),n?.isFounded?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("span",{className:`${i}-spacer`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>{It(!1),de("home")},children:"Show me the village"})]}):null]}),Lp?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Lp}):null,Mt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Mt}):null]})}),(0,r.jsx)("div",{className:`${i}-setup-map-shell`,children:(0,r.jsx)("div",{className:`${i}-setup-map-viewport`,children:(0,r.jsx)(hp,{src:wi,alt:`A map of ${Ra.trim()||"your new village"}.`,pins:Ye<3?[]:o$,placing:Ye===3&&(pi||Kl||Tu!==null),view:ze==="existing"?io:hu("cover"),shape:Yp,onPlace:Ye===3?q1:void 0,compact:Ye<2,mobile:t&&Ye>=2,photoPins:Ye>=3})})})]})]})}return(0,r.jsxs)("div",{className:`${i}-root ${i}-home ${i}-home-full`,"data-mobile":t?"true":"false",children:[(0,r.jsxs)("div",{className:`${i}-home-bar`,children:[(0,r.jsx)(wS,{weather:n?.village.weather??""}),!t&&n?.isFounded&&zn(n.settings.venues).length>0?(0,r.jsxs)("div",{className:`${i}-places-picker`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-expanded":dt,"aria-controls":`${i}-places-list`,disabled:_,onClick:()=>{Be(null),Ke(s=>!s)},children:"Places"}),dt?(0,r.jsx)("div",{id:`${i}-places-list`,className:`${i}-places-list`,children:n.settings.venues.map(s=>(0,r.jsxs)("div",{className:`${i}-places-list-row`,children:[(0,r.jsx)("span",{className:`${i}-places-list-name`,children:s.name}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>gs(s),children:"View venue"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Rr(s)},children:"Visit"})]},s.id))}):null]}):null,(0,r.jsxs)("span",{className:`${i}-home-bar-actions`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-mobile-board-button`,"aria-label":`Noticeboard (${n?.noticeboard.length??0})`,disabled:!n||_,onClick:()=>ot("noticeboard"),children:(0,r.jsx)("span",{"aria-hidden":"true",children:"\u25A4"})}),n?.isFounded?(0,r.jsx)(NS,{happenings:n.happenings,recap:n.recap,mobile:t}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-mobile-menu-button`,"aria-label":"Open settings menu",disabled:_||!n,onClick:()=>{ke("index"),de("menu")},children:"\u2630"}),t?null:(0,r.jsx)(xS,{}),pi?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>It(!1),children:"Cancel"}):null]})]}),(0,r.jsx)("div",{className:`${i}-room`,children:(0,r.jsx)("div",{className:`${i}-home-map-viewport`,children:(0,r.jsx)(hp,{src:is,alt:`A map of ${n?.village.name??"the village"}.`,pins:i$,placing:pi,view:io,shape:Gp,onPlace:B1,onDismiss:()=>{Be(null),Ke(!1)},fitToRoom:!t,mobile:t,photoPins:!0,children:Tr||Mt||pi||ds||Iu?(0,r.jsxs)("div",{className:`${i}-notice`,children:[Tr?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Tr}):null,Mt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Mt}):null,pi?(0,r.jsx)("span",{className:`${i}-status`,children:"Click the map where the house stands."}):null,ds?(0,r.jsxs)("span",{className:`${i}-status`,children:["Catching up on what ",n?.village.name??"the village"," has been doing\u2026"]}):null,Iu?(0,r.jsx)("p",{className:`${i}-status`,children:Iu}):null]}):null})})})]})}var bp=class extends HTMLElement{connectedCallback(){b0(),this.__root??(this.__root=(0,R0.createRoot)(this)),this.__root.render((0,r.jsx)(gp,{element:this,children:(0,r.jsx)(US,{element:this})}))}disconnectedCallback(){queueMicrotask(()=>{!this.isConnected&&this.__root&&(this.__root.unmount(),this.__root=null),b0()})}};function US({element:e}){let[,t]=(0,m.useState)(0);(0,m.useEffect)(()=>{let n=()=>t(o=>o+1);return e.addEventListener("marinara-capability-props",n),()=>e.removeEventListener("marinara-capability-props",n)},[e]);let a=e.getAttribute("view");return a==="tracker"?(0,r.jsx)(LS,{props:e.capabilityProps??{}}):a==="toolbar"?(0,r.jsx)(BS,{props:e.capabilityProps??{}}):(0,r.jsx)(HS,{element:e})}function qS(){return(0,r.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round","aria-hidden":"true",children:[(0,r.jsx)("path",{d:"M3 10.5 12 3l9 7.5"}),(0,r.jsx)("path",{d:"M5.5 9.5V20h13V9.5"}),(0,r.jsx)("path",{d:"M9.5 16.5h5"})]})}var IS="marinara-active-chat-id";function L0(){try{window.localStorage.removeItem(IS)}catch{}window.location.reload()}function j0(e,t){let[a,n]=(0,m.useState)(null),[o,l]=(0,m.useState)(!1);return(0,m.useEffect)(()=>{if(l(!1),n(null),!t)return;let c=new AbortController;return(async()=>{try{let d=await V(`/spinoffs/${encodeURIComponent(e)}`,{signal:c.signal});if(c.signal.aborted)return;n(d??null),l(!0)}catch{}})(),()=>c.abort()},[e,t]),{origin:a,known:o}}function BS({props:e}){let t=typeof e.chatId=="string"?e.chatId:"",a=e.chatMode==="roleplay",n=e.mobileCompact===!0,o=typeof e.toolbarButtonClass=="string"?e.toolbarButtonClass:"",{origin:l,known:c}=j0(t,a&&t.length>0),[d,h]=(0,m.useState)(!1),g=(0,m.useRef)(null);if((0,m.useEffect)(()=>h(!1),[t,a]),(0,m.useEffect)(()=>{if(!d)return;let $=k=>{g.current?.contains(k.target)||h(!1)},C=k=>{k.key==="Escape"&&h(!1)};return document.addEventListener("pointerdown",$),document.addEventListener("keydown",C),()=>{document.removeEventListener("pointerdown",$),document.removeEventListener("keydown",C)}},[d]),!a||!c||l===null)return null;let y=l.name||"your villager",N=l.villageName||"your village",f=`Villages \u2014 this roleplay spun off from ${N}`;return(0,r.jsxs)("span",{className:`${i}-tracker`,"data-compact":n,"data-open":d,ref:g,children:[(0,r.jsxs)("button",{type:"button",className:o?`${o} ${i}-tracker-chip`:`${i}-button ${i}-tracker-chip`,onClick:()=>h($=>!$),"aria-haspopup":"menu","aria-expanded":d,title:f,"aria-label":f,children:[(0,r.jsx)(qS,{}),(0,r.jsx)("span",{className:`${i}-tracker-label`,children:"Villages"})]}),d?(0,r.jsxs)("div",{className:`${i}-tracker-menu`,role:"menu","aria-label":`Villages \u2014 ${N}`,children:[(0,r.jsxs)("p",{className:`${i}-tracker-menu-title`,children:["This roleplay spun off from ",N]}),l.resident?(0,r.jsxs)("p",{className:`${i}-tracker-menu-note`,children:[y," still lives there. ",N," was photographed into this chat the moment it was made, and has not looked at it since: nothing said here is read, counted or kept by the village."]}):(0,r.jsxs)("p",{className:`${i}-tracker-menu-note`,children:[y," does not live in ",N," any more. This chat is yours either way \u2014 it was let go of the moment it was made, and nothing in the village is waiting on it."]}),(0,r.jsx)("p",{className:`${i}-tracker-menu-note`,children:"It is an ordinary chat in your own list. Renaming it, keeping it or deleting it changes nothing about the village."}),(0,r.jsx)("div",{className:`${i}-tracker-menu-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:L0,title:`Leaves this chat and opens Marinara's home screen, where the ${N} tab is waiting.`,children:"Open the village"})})]}):null]})}function LS({props:e}){let t=typeof e.chatId=="string"?e.chatId:"",a=e.chatMode==="roleplay",{origin:n,known:o}=j0(t,a&&t.length>0);if(!a||!o)return null;if(n===null)return(0,r.jsx)("div",{className:`${i}-panel-view`,children:(0,r.jsx)("p",{className:`${i}-tracker-menu-note`,children:"This chat did not come out of a village. A roleplay started from Villages says so here."})});let l=n.name||"this villager",c=n.villageName||"your village";return(0,r.jsxs)("div",{className:`${i}-panel-view`,children:[(0,r.jsx)("p",{className:`${i}-tracker-menu-note`,children:n.resident?`This roleplay spun off from ${c}, and ${c} has not looked at it since. Nothing said here is read, counted or kept by the village.`:`This roleplay spun off from ${c}, and ${l} does not live there any more. Nothing said here is read by the village either way.`}),(0,r.jsxs)("div",{className:`${i}-panel-view-row`,children:[(0,r.jsx)("span",{className:`${i}-panel-view-key`,children:"Villager"}),(0,r.jsx)("span",{children:l})]}),(0,r.jsxs)("div",{className:`${i}-panel-view-row`,children:[(0,r.jsx)("span",{className:`${i}-panel-view-key`,children:"Chat"}),(0,r.jsx)("span",{children:n.room})]}),(0,r.jsxs)("div",{className:`${i}-panel-view-row`,children:[(0,r.jsx)("span",{className:`${i}-panel-view-key`,children:"Came from"}),(0,r.jsx)("span",{children:c})]}),(0,r.jsx)("div",{className:`${i}-panel-view-actions`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:L0,title:`Leaves this chat and opens Marinara's home screen, where the ${c} tab is waiting.`,children:"Open the village"})})]})}customElements.get(i)||customElements.define(i,bp);
/*! Bundled license information:

react/cjs/react.production.js:
  (**
   * @license React
   * react.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

scheduler/cjs/scheduler.production.js:
  (**
   * @license React
   * scheduler.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-dom/cjs/react-dom.production.js:
  (**
   * @license React
   * react-dom.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react-dom/cjs/react-dom-client.production.js:
  (**
   * @license React
   * react-dom-client.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)

react/cjs/react-jsx-runtime.production.js:
  (**
   * @license React
   * react-jsx-runtime.production.js
   *
   * Copyright (c) Meta Platforms, Inc. and affiliates.
   *
   * This source code is licensed under the MIT license found in the
   * LICENSE file in the root directory of this source tree.
   *)
*/
