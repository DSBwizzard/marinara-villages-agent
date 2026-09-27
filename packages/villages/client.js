var W1=Object.create;var Gc=Object.defineProperty;var e$=Object.getOwnPropertyDescriptor;var t$=Object.getOwnPropertyNames;var a$=Object.getPrototypeOf,n$=Object.prototype.hasOwnProperty;var i$=(e,t,a)=>t in e?Gc(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a;var Ua=(e,t)=>()=>{try{return t||e((t={exports:{}}).exports,t),t.exports}catch(a){throw t=0,a}};var o$=(e,t,a,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let o of t$(t))!n$.call(e,o)&&o!==a&&Gc(e,o,{get:()=>t[o],enumerable:!(n=e$(t,o))||n.enumerable});return e};var hs=(e,t,a)=>(a=e!=null?W1(a$(e)):{},o$(t||!e||!e.__esModule?Gc(a,"default",{value:e,enumerable:!0}):a,e));var gg=(e,t,a)=>i$(e,typeof t!="symbol"?t+"":t,a);var Cg=Ua(W=>{"use strict";var Xc=Symbol.for("react.transitional.element"),l$=Symbol.for("react.portal"),r$=Symbol.for("react.fragment"),s$=Symbol.for("react.strict_mode"),u$=Symbol.for("react.profiler"),c$=Symbol.for("react.consumer"),d$=Symbol.for("react.context"),h$=Symbol.for("react.forward_ref"),m$=Symbol.for("react.suspense"),p$=Symbol.for("react.memo"),wg=Symbol.for("react.lazy"),g$=Symbol.for("react.activity"),f$=Symbol.for("react.view_transition"),fg=Symbol.iterator;function b$(e){return e===null||typeof e!="object"?null:(e=fg&&e[fg]||e["@@iterator"],typeof e=="function"?e:null)}var $g={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},xg=Object.assign,Ng={};function co(e,t,a){this.props=e,this.context=t,this.refs=Ng,this.updater=a||$g}co.prototype.isReactComponent={};co.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")};co.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function Sg(){}Sg.prototype=co.prototype;function Qc(e,t,a){this.props=e,this.context=t,this.refs=Ng,this.updater=a||$g}var Zc=Qc.prototype=new Sg;Zc.constructor=Qc;xg(Zc,co.prototype);Zc.isPureReactComponent=!0;var bg=Array.isArray;function jc(){}var ze={H:null,A:null,T:null,S:null},Tg=Object.prototype.hasOwnProperty;function Kc(e,t,a){var n=a.ref;return{$$typeof:Xc,type:e,key:t,ref:n!==void 0?n:null,props:a}}function v$(e,t){return Kc(e.type,t,e.props)}function Jc(e){return typeof e=="object"&&e!==null&&e.$$typeof===Xc}function y$(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(a){return t[a]})}var vg=/\/+/g;function Yc(e,t){return typeof e=="object"&&e!==null&&e.key!=null?y$(""+e.key):t.toString(36)}function w$(e){switch(e.status){case"fulfilled":return e.value;case"rejected":throw e.reason;default:switch(typeof e.status=="string"?e.then(jc,jc):(e.status="pending",e.then(function(t){e.status==="pending"&&(e.status="fulfilled",e.value=t)},function(t){e.status==="pending"&&(e.status="rejected",e.reason=t)})),e.status){case"fulfilled":return e.value;case"rejected":throw e.reason}}throw e}function uo(e,t,a,n,o){var l=typeof e;(l==="undefined"||l==="boolean")&&(e=null);var u=!1;if(e===null)u=!0;else switch(l){case"bigint":case"string":case"number":u=!0;break;case"object":switch(e.$$typeof){case Xc:case l$:u=!0;break;case wg:return u=e._init,uo(u(e._payload),t,a,n,o)}}if(u)return o=o(e),u=n===""?"."+Yc(e,0):n,bg(o)?(a="",u!=null&&(a=u.replace(vg,"$&/")+"/"),uo(o,t,a,"",function(g){return g})):o!=null&&(Jc(o)&&(o=v$(o,a+(o.key==null||e&&e.key===o.key?"":(""+o.key).replace(vg,"$&/")+"/")+u)),t.push(o)),1;u=0;var c=n===""?".":n+":";if(bg(e))for(var h=0;h<e.length;h++)n=e[h],l=c+Yc(n,h),u+=uo(n,t,a,l,o);else if(h=b$(e),typeof h=="function")for(e=h.call(e),h=0;!(n=e.next()).done;)n=n.value,l=c+Yc(n,h++),u+=uo(n,t,a,l,o);else if(l==="object"){if(typeof e.then=="function")return uo(w$(e),t,a,n,o);throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.")}return u}function ms(e,t,a){if(e==null)return e;var n=[],o=0;return uo(e,n,"","",function(l){return t.call(a,l,o++)}),n}function $$(e){if(e._status===-1){var t=e._result,a=t();a.then(function(n){(e._status===0||e._status===-1)&&(e._status=1,e._result=n,a.status===void 0&&(a.status="fulfilled",a.value=n))},function(n){(e._status===0||e._status===-1)&&(e._status=2,e._result=n,a.status===void 0&&(a.status="rejected",a.reason=n))}),e._status===-1&&(e._status=0,e._result=a)}if(e._status===1)return e._result.default;throw e._result}var yg=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)};function Eg(e){var t=ze.T,a={};a.types=t!==null?t.types:null,ze.T=a;try{var n=e(),o=ze.S;o!==null&&o(a,n),typeof n=="object"&&n!==null&&typeof n.then=="function"&&n.then(jc,yg)}catch(l){yg(l)}finally{t!==null&&a.types!==null&&(t.types=a.types),ze.T=t}}function kg(e){var t=ze.T;if(t!==null){var a=t.types;a===null?t.types=[e]:a.indexOf(e)===-1&&a.push(e)}else Eg(kg.bind(null,e))}var x$={map:ms,forEach:function(e,t,a){ms(e,function(){t.apply(this,arguments)},a)},count:function(e){var t=0;return ms(e,function(){t++}),t},toArray:function(e){return ms(e,function(t){return t})||[]},only:function(e){if(!Jc(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};W.Activity=g$;W.Children=x$;W.Component=co;W.Fragment=r$;W.Profiler=u$;W.PureComponent=Qc;W.StrictMode=s$;W.Suspense=m$;W.ViewTransition=f$;W.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=ze;W.__COMPILER_RUNTIME={__proto__:null,c:function(e){return ze.H.useMemoCache(e)}};W.addTransitionType=kg;W.cache=function(e){return function(){return e.apply(null,arguments)}};W.cacheSignal=function(){return null};W.cloneElement=function(e,t,a){if(e==null)throw Error("The argument must be a React element, but you passed "+e+".");var n=xg({},e.props),o=e.key;if(t!=null)for(l in t.key!==void 0&&(o=""+t.key),t)!Tg.call(t,l)||l==="key"||l==="__self"||l==="__source"||l==="ref"&&t.ref===void 0||(n[l]=t[l]);var l=arguments.length-2;if(l===1)n.children=a;else if(1<l){for(var u=Array(l),c=0;c<l;c++)u[c]=arguments[c+2];n.children=u}return Kc(e.type,o,n)};W.createContext=function(e){return e={$$typeof:d$,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null},e.Provider=e,e.Consumer={$$typeof:c$,_context:e},e};W.createElement=function(e,t,a){var n,o={},l=null;if(t!=null)for(n in t.key!==void 0&&(l=""+t.key),t)Tg.call(t,n)&&n!=="key"&&n!=="__self"&&n!=="__source"&&(o[n]=t[n]);var u=arguments.length-2;if(u===1)o.children=a;else if(1<u){for(var c=Array(u),h=0;h<u;h++)c[h]=arguments[h+2];o.children=c}if(e&&e.defaultProps)for(n in u=e.defaultProps,u)o[n]===void 0&&(o[n]=u[n]);return Kc(e,l,o)};W.createRef=function(){return{current:null}};W.forwardRef=function(e){return{$$typeof:h$,render:e}};W.isValidElement=Jc;W.lazy=function(e){return{$$typeof:wg,_payload:{_status:-1,_result:e},_init:$$}};W.memo=function(e,t){return{$$typeof:p$,type:e,compare:t===void 0?null:t}};W.startTransition=Eg;W.unstable_useCacheRefresh=function(){return ze.H.useCacheRefresh()};W.use=function(e){return ze.H.use(e)};W.useActionState=function(e,t,a){return ze.H.useActionState(e,t,a)};W.useCallback=function(e,t){return ze.H.useCallback(e,t)};W.useContext=function(e){return ze.H.useContext(e)};W.useDebugValue=function(){};W.useDeferredValue=function(e,t){return ze.H.useDeferredValue(e,t)};W.useEffect=function(e,t){return ze.H.useEffect(e,t)};W.useEffectEvent=function(e){return ze.H.useEffectEvent(e)};W.useId=function(){return ze.H.useId()};W.useImperativeHandle=function(e,t,a){return ze.H.useImperativeHandle(e,t,a)};W.useInsertionEffect=function(e,t){return ze.H.useInsertionEffect(e,t)};W.useLayoutEffect=function(e,t){return ze.H.useLayoutEffect(e,t)};W.useMemo=function(e,t){return ze.H.useMemo(e,t)};W.useOptimistic=function(e,t){return ze.H.useOptimistic(e,t)};W.useReducer=function(e,t,a){return ze.H.useReducer(e,t,a)};W.useRef=function(e){return ze.H.useRef(e)};W.useState=function(e){return ze.H.useState(e)};W.useSyncExternalStore=function(e,t,a){return ze.H.useSyncExternalStore(e,t,a)};W.useTransition=function(){return ze.H.useTransition()};W.version="19.3.0"});var ps=Ua((R5,Ag)=>{"use strict";Ag.exports=Cg()});var qg=Ua(De=>{"use strict";function ed(e,t){var a=e.length;e.push(t);e:for(;0<a;){var n=a-1>>>1,o=e[n];if(0<gs(o,t))e[n]=t,e[a]=o,a=n;else break e}}function qa(e){return e.length===0?null:e[0]}function bs(e){if(e.length===0)return null;var t=e[0],a=e.pop();if(a!==t){e[0]=a;e:for(var n=0,o=e.length,l=o>>>1;n<l;){var u=2*(n+1)-1,c=e[u],h=u+1,g=e[h];if(0>gs(c,a))h<o&&0>gs(g,c)?(e[n]=g,e[h]=a,n=h):(e[n]=c,e[u]=a,n=u);else if(h<o&&0>gs(g,a))e[n]=g,e[h]=a,n=h;else break e}}return t}function gs(e,t){var a=e.sortIndex-t.sortIndex;return a!==0?a:e.id-t.id}De.unstable_now=void 0;typeof performance=="object"&&typeof performance.now=="function"?(zg=performance,De.unstable_now=function(){return zg.now()}):(Pc=Date,Mg=Pc.now(),De.unstable_now=function(){return Pc.now()-Mg});var zg,Pc,Mg,nn=[],An=[],N$=1,ua=null,wt=3,td=!1,Al=!1,zl=!1,ad=!1,Vg=typeof setTimeout=="function"?setTimeout:null,Dg=typeof clearTimeout=="function"?clearTimeout:null,Og=typeof setImmediate<"u"?setImmediate:null;function fs(e){for(var t=qa(An);t!==null;){if(t.callback===null)bs(An);else if(t.startTime<=e)bs(An),t.sortIndex=t.expirationTime,ed(nn,t);else break;t=qa(An)}}function nd(e){if(zl=!1,fs(e),!Al)if(qa(nn)!==null)Al=!0,mo||(mo=!0,ho());else{var t=qa(An);t!==null&&id(nd,t.startTime-e)}}var mo=!1,Ml=-1,_g=5,Hg=-1;function Ug(){return ad?!0:!(De.unstable_now()-Hg<_g)}function Fc(){if(ad=!1,mo){var e=De.unstable_now();Hg=e;var t=!0;try{e:{Al=!1,zl&&(zl=!1,Dg(Ml),Ml=-1),td=!0;var a=wt;try{t:{for(fs(e),ua=qa(nn);ua!==null&&!(ua.expirationTime>e&&Ug());){var n=ua.callback;if(typeof n=="function"){ua.callback=null,wt=ua.priorityLevel;var o=n(ua.expirationTime<=e);if(e=De.unstable_now(),typeof o=="function"){ua.callback=o,fs(e),t=!0;break t}ua===qa(nn)&&bs(nn),fs(e)}else bs(nn);ua=qa(nn)}if(ua!==null)t=!0;else{var l=qa(An);l!==null&&id(nd,l.startTime-e),t=!1}}break e}finally{ua=null,wt=a,td=!1}t=void 0}}finally{t?ho():mo=!1}}}var ho;typeof Og=="function"?ho=function(){Og(Fc)}:typeof MessageChannel<"u"?(Wc=new MessageChannel,Rg=Wc.port2,Wc.port1.onmessage=Fc,ho=function(){Rg.postMessage(null)}):ho=function(){Vg(Fc,0)};var Wc,Rg;function id(e,t){Ml=Vg(function(){e(De.unstable_now())},t)}De.unstable_IdlePriority=5;De.unstable_ImmediatePriority=1;De.unstable_LowPriority=4;De.unstable_NormalPriority=3;De.unstable_Profiling=null;De.unstable_UserBlockingPriority=2;De.unstable_cancelCallback=function(e){e.callback=null};De.unstable_forceFrameRate=function(e){0>e||125<e?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):_g=0<e?Math.floor(1e3/e):5};De.unstable_getCurrentPriorityLevel=function(){return wt};De.unstable_next=function(e){switch(wt){case 1:case 2:case 3:var t=3;break;default:t=wt}var a=wt;wt=t;try{return e()}finally{wt=a}};De.unstable_requestPaint=function(){ad=!0};De.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var a=wt;wt=e;try{return t()}finally{wt=a}};De.unstable_scheduleCallback=function(e,t,a){var n=De.unstable_now();switch(typeof a=="object"&&a!==null?(a=a.delay,a=typeof a=="number"&&0<a?n+a:n):a=n,e){case 1:var o=-1;break;case 2:o=250;break;case 5:o=1073741823;break;case 4:o=1e4;break;default:o=5e3}return o=a+o,e={id:N$++,callback:t,priorityLevel:e,startTime:a,expirationTime:o,sortIndex:-1},a>n?(e.sortIndex=a,ed(An,e),qa(nn)===null&&e===qa(An)&&(zl?(Dg(Ml),Ml=-1):zl=!0,id(nd,a-n))):(e.sortIndex=o,ed(nn,e),Al||td||(Al=!0,mo||(mo=!0,ho()))),e};De.unstable_shouldYield=Ug;De.unstable_wrapCallback=function(e){var t=wt;return function(){var a=wt;wt=t;try{return e.apply(this,arguments)}finally{wt=a}}}});var Ig=Ua((D5,Bg)=>{"use strict";Bg.exports=qg()});var Yg=Ua($t=>{"use strict";var S$=ps();function Gg(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)t+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function zn(){}var Ct={d:{f:zn,r:function(){throw Error(Gg(522))},D:zn,C:zn,L:zn,m:zn,X:zn,S:zn,M:zn},p:0,findDOMNode:null},T$=Symbol.for("react.portal"),E$=Symbol.for("react.recoverable"),Lg=Symbol.for("react.optimistic_key");function k$(e,t,a){var n=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:T$,key:n==null?null:n===Lg?Lg:""+n,children:e,containerInfo:t,implementation:a}}var Ol=S$.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function vs(e,t){if(e==="font")return"";if(typeof t=="string")return t==="use-credentials"?t:""}$t.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=Ct;$t.browser=function(e){return{$$typeof:E$,_reason:e}};$t.createPortal=function(e,t){var a=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)throw Error(Gg(299));return k$(e,t,null,a)};$t.flushSync=function(e){var t=Ol.T,a=Ct.p;try{if(Ol.T=null,Ct.p=2,e)return e()}finally{Ol.T=t,Ct.p=a,Ct.d.f()}};$t.preconnect=function(e,t){typeof e=="string"&&(t?(t=t.crossOrigin,t=typeof t=="string"?t==="use-credentials"?t:"":void 0):t=null,Ct.d.C(e,t))};$t.prefetchDNS=function(e){typeof e=="string"&&Ct.d.D(e)};$t.preinit=function(e,t){if(typeof e=="string"&&t&&typeof t.as=="string"){var a=t.as,n=vs(a,t.crossOrigin),o=typeof t.integrity=="string"?t.integrity:void 0,l=typeof t.fetchPriority=="string"?t.fetchPriority:void 0;a==="style"?Ct.d.S(e,typeof t.precedence=="string"?t.precedence:void 0,{crossOrigin:n,integrity:o,fetchPriority:l}):a==="script"&&Ct.d.X(e,{crossOrigin:n,integrity:o,fetchPriority:l,nonce:typeof t.nonce=="string"?t.nonce:void 0})}};$t.preinitModule=function(e,t){if(typeof e=="string")if(typeof t=="object"&&t!==null){if(t.as==null||t.as==="script"){var a=vs(t.as,t.crossOrigin);Ct.d.M(e,{crossOrigin:a,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0})}}else t==null&&Ct.d.M(e)};$t.preload=function(e,t){if(typeof e=="string"&&typeof t=="object"&&t!==null&&typeof t.as=="string"){var a=t.as,n=vs(a,t.crossOrigin);Ct.d.L(e,a,{crossOrigin:n,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,type:typeof t.type=="string"?t.type:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0,referrerPolicy:typeof t.referrerPolicy=="string"?t.referrerPolicy:void 0,imageSrcSet:typeof t.imageSrcSet=="string"?t.imageSrcSet:void 0,imageSizes:typeof t.imageSizes=="string"?t.imageSizes:void 0,media:typeof t.media=="string"?t.media:void 0})}};$t.preloadModule=function(e,t){if(typeof e=="string")if(t){var a=vs(t.as,t.crossOrigin);Ct.d.m(e,{as:typeof t.as=="string"&&t.as!=="script"?t.as:void 0,crossOrigin:a,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0})}else Ct.d.m(e)};$t.requestFormReset=function(e){Ct.d.r(e)};$t.unstable_batchedUpdates=function(e,t){return e(t)};$t.useFormState=function(e,t,a){return Ol.H.useFormState(e,t,a)};$t.useFormStatus=function(){return Ol.H.useHostTransitionStatus()};$t.version="19.3.0"});var Qg=Ua((H5,Xg)=>{"use strict";function jg(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(jg)}catch(e){console.error(e)}}jg(),Xg.exports=Yg()});var Vw=Ua(Wu=>{"use strict";var We=Ig(),Rb=ps(),C$=Qg();function A(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)t+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function Vb(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function yr(e){for(var t=e,a=t;a&&!a.alternate;)t=a,(t.flags&4098)!==0&&(e=t.return),a=t.return;for(;t.return;)t=t.return;return t.tag===3?e:null}function Db(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function _b(e){if(e.tag===31){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function Zg(e){if(yr(e)!==e)throw Error(A(188))}function A$(e){var t=e.alternate;if(!t){if(t=yr(e),t===null)throw Error(A(188));return t!==e?null:e}for(var a=e,n=t;;){var o=a.return;if(o===null)break;var l=o.alternate;if(l===null){if(n=o.return,n!==null){a=n;continue}break}if(o.child===l.child){for(l=o.child;l;){if(l===a)return Zg(o),e;if(l===n)return Zg(o),t;l=l.sibling}throw Error(A(188))}if(a.return!==n.return)a=o,n=l;else{for(var u=!1,c=o.child;c;){if(c===a){u=!0,a=o,n=l;break}if(c===n){u=!0,n=o,a=l;break}c=c.sibling}if(!u){for(c=l.child;c;){if(c===a){u=!0,a=l,n=o;break}if(c===n){u=!0,n=l,a=o;break}c=c.sibling}if(!u)throw Error(A(189))}}if(a.alternate!==n)throw Error(A(190))}if(a.tag!==3)throw Error(A(188));return a.stateNode.current===a?e:t}function Hb(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e;for(e=e.child;e!==null;){if(t=Hb(e),t!==null)return t;e=e.sibling}return null}function Lt(e,t,a,n,o,l){for(;e!==null;){if((e.tag===5||e.tag===27||e.tag===6)&&a(e,n,o,l)||(e.tag!==22||e.memoizedState===null)&&(t||e.tag!==5&&e.tag!==27)&&Lt(e.child,t,a,n,o,l))return!0;e=e.sibling}return!1}function Di(e){for(e=e.return;e!==null;){if(e.tag===3||e.tag===5||e.tag===27)return e;e=e.return}return null}function Kg(e){var t=!1;for(e=e.return;e!==null&&(e.tag===4&&(t=!0),!(e.tag===3||e.tag===5||e.tag===27));)e=e.return;return t}function Ub(e){var t=[null,null],a=Di(e);return a===null||qb(t,e,a.child,{foundSelf:!1}),t}function qb(e,t,a,n){for(;a!==null;){if(a===t)n.foundSelf=!0;else if(a.tag===5||a.tag===27||a.tag===6){if(n.foundSelf)return e[1]=a,!0;e[0]=a}else if((a.tag!==22||a.memoizedState===null)&&qb(e,t,a.child,n))return!0;a=a.sibling}return!1}function Fe(e){switch(e.tag){case 5:case 27:case 6:return e.stateNode;case 3:return e.stateNode.containerInfo;default:throw Error(A(559))}}var wo=null,_d=null;function z$(e,t,a){return e===a?!0:e===t?(wo=e,!0):!1}function M$(e,t,a){return e===a?(_d=e,!1):e===t?(_d!==null&&(wo=e),!0):!1}function Jg(e){if(e===null)return null;do e=e===null?null:e.return;while(e&&e.tag!==5&&e.tag!==27&&e.tag!==3);return e||null}function Hd(e,t,a){for(var n=0,o=e;o;o=a(o))n++;o=0;for(var l=t;l;l=a(l))o++;for(;0<n-o;)e=a(e),n--;for(;0<o-n;)t=a(t),o--;for(;n--;){if(e===t||t!==null&&e===t.alternate)return e;e=a(e),t=a(t)}return null}var ke=Object.assign,O$=Symbol.for("react.element"),ys=Symbol.for("react.transitional.element"),ql=Symbol.for("react.portal"),$o=Symbol.for("react.fragment"),Bb=Symbol.for("react.strict_mode"),Ud=Symbol.for("react.profiler"),Ib=Symbol.for("react.consumer"),ja=Symbol.for("react.context"),Qh=Symbol.for("react.forward_ref"),qd=Symbol.for("react.suspense"),Bd=Symbol.for("react.suspense_list"),Zh=Symbol.for("react.memo"),Vn=Symbol.for("react.lazy"),Id=Symbol.for("react.activity"),R$=Symbol.for("react.legacy_hidden"),V$=Symbol.for("react.memo_cache_sentinel"),Ld=Symbol.for("react.view_transition"),D$=Symbol.for("react.recoverable"),Pg=Symbol.iterator;function Rl(e){return e===null||typeof e!="object"?null:(e=Pg&&e[Pg]||e["@@iterator"],typeof e=="function"?e:null)}var _$=Symbol.for("react.client.reference");function Gd(e){if(e==null)return null;if(typeof e=="function")return e.$$typeof===_$?null:e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case $o:return"Fragment";case Ud:return"Profiler";case Bb:return"StrictMode";case qd:return"Suspense";case Bd:return"SuspenseList";case Id:return"Activity";case Ld:return"ViewTransition"}if(typeof e=="object")switch(e.$$typeof){case ql:return"Portal";case ja:return e.displayName||"Context";case Ib:return(e._context.displayName||"Context")+".Consumer";case Qh:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case Zh:return t=e.displayName||null,t!==null?t:Gd(e.type)||"Memo";case Vn:t=e._payload,e=e._init;try{return Gd(e(t))}catch{}}return null}var Bl=Array.isArray,F=Rb.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,pe=C$.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,xi={pending:!1,data:null,method:null,action:null},Yd=[],xo=-1;function Fa(e){return{current:e}}function mt(e){0>xo||(e.current=Yd[xo],Yd[xo]=null,xo--)}function Re(e,t){xo++,Yd[xo]=e.current,e.current=t}var Ka=Fa(null),nr=Fa(null),Gn=Fa(null),ou=Fa(null);function lu(e,t){switch(Re(Gn,t),Re(nr,e),Re(Ka,null),t.nodeType){case 9:case 11:e=(e=t.documentElement)&&(e=e.namespaceURI)?hb(e):0;break;default:if(e=t.tagName,t=t.namespaceURI)t=hb(t),e=uw(t,e);else switch(e){case"svg":e=1;break;case"math":e=2;break;default:e=0}}mt(Ka),Re(Ka,e)}function Lo(){mt(Ka),mt(nr),mt(Gn)}function jd(e){var t=e.memoizedState;t!==null&&(Fo._currentValue=t.memoizedState,Re(ou,e)),t=Ka.current;var a=uw(t,e.type);t!==a&&(Re(nr,e),Re(Ka,a))}function ru(e){nr.current===e&&(mt(Ka),mt(nr)),ou.current===e&&(mt(ou),Fo._currentValue=xi)}var od,Fg;function On(e){if(od===void 0)try{throw Error()}catch(a){var t=a.stack.trim().match(/\n( *(at )?)/);od=t&&t[1]||"",Fg=-1<a.stack.indexOf(`
    at`)?" (<anonymous>)":-1<a.stack.indexOf("@")?"@unknown:0:0":""}return`
`+od+e+Fg}var ld=!1;function rd(e,t){if(!e||ld)return"";ld=!0;var a=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var n={DetermineComponentFrameRoot:function(){try{if(t){var x=function(){throw Error()};if(Object.defineProperty(x.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(x,[])}catch(z){var f=z}Reflect.construct(e,[],x)}else{try{x.call()}catch(z){f=z}x=!1;try{var w=Object.getOwnPropertyDescriptor(e.prototype,"props");Object.defineProperty(e.prototype,"props",{configurable:!0,set:function(){throw Error()}}),x=!0,new e}finally{x&&(w!==void 0?Object.defineProperty(e.prototype,"props",w):delete e.prototype.props)}}}else{try{throw Error()}catch(z){f=z}(x=e())&&typeof x.catch=="function"&&x.catch(function(){})}}catch(z){if(z&&f&&typeof z.stack=="string")return[z.stack,f.stack]}return[null,null]}};n.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var o=Object.getOwnPropertyDescriptor(n.DetermineComponentFrameRoot,"name");o&&o.configurable&&Object.defineProperty(n.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var l=n.DetermineComponentFrameRoot(),u=l[0],c=l[1];if(u&&c){var h=u.split(`
`),g=c.split(`
`);for(o=n=0;n<h.length&&!h[n].includes("DetermineComponentFrameRoot");)n++;for(;o<g.length&&!g[o].includes("DetermineComponentFrameRoot");)o++;if(n===h.length||o===g.length)for(n=h.length-1,o=g.length-1;1<=n&&0<=o&&h[n]!==g[o];)o--;for(;1<=n&&0<=o;n--,o--)if(h[n]!==g[o]){if(n!==1||o!==1)do if(n--,o--,0>o||h[n]!==g[o]){var v=`
`+h[n].replace(" at new "," at ");return e.displayName&&v.includes("<anonymous>")&&(v=v.replace("<anonymous>",e.displayName)),v}while(1<=n&&0<=o);break}}}finally{ld=!1,Error.prepareStackTrace=a}return(a=e?e.displayName||e.name:"")?On(a):""}function H$(e,t){switch(e.tag){case 26:case 27:case 5:return On(e.type);case 16:return On("Lazy");case 13:return e.child!==t&&t!==null?On("Suspense Fallback"):On("Suspense");case 19:return On("SuspenseList");case 0:case 15:return rd(e.type,!1);case 11:return rd(e.type.render,!1);case 1:return rd(e.type,!0);case 31:return On("Activity");case 30:return On("ViewTransition");default:return""}}function Wg(e){try{var t="",a=null;do t+=H$(e,a),a=e,e=e.return;while(e);return t}catch(n){return`
Error generating stack: `+n.message+`
`+n.stack}}var Xd=Object.prototype.hasOwnProperty,Kh=We.unstable_scheduleCallback,sd=We.unstable_cancelCallback,U$=We.unstable_shouldYield,q$=We.unstable_requestPaint,Ft=We.unstable_now,B$=We.unstable_getCurrentPriorityLevel,Lb=We.unstable_ImmediatePriority,Gb=We.unstable_UserBlockingPriority,su=We.unstable_NormalPriority,I$=We.unstable_LowPriority,Yb=We.unstable_IdlePriority,L$=We.log,G$=We.unstable_setDisableYieldValue,wr=null,Wt=null;function Hn(e){if(typeof L$=="function"&&G$(e),Wt&&typeof Wt.setStrictMode=="function")try{Wt.setStrictMode(wr,e)}catch{}}var ea=Math.clz32?Math.clz32:X$,Y$=Math.log,j$=Math.LN2;function X$(e){return e>>>=0,e===0?32:31-(Y$(e)/j$|0)|0}var ws=256,$s=262144,xs=4194304;function bi(e){var t=e&42;if(t!==0)return t;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&-e;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function Vu(e,t,a){var n=e.pendingLanes;if(n===0)return 0;var o=0,l=e.suspendedLanes,u=e.pingedLanes;e=e.warmLanes;var c=n&134217727;return c!==0?(n=c&~l,n!==0?o=bi(n):(u&=c,u!==0?o=bi(u):a||(a=c&~e,a!==0&&(o=bi(a))))):(c=n&~l,c!==0?o=bi(c):u!==0?o=bi(u):a||(a=n&~e,a!==0&&(o=bi(a)))),o===0?0:t!==0&&t!==o&&(t&l)===0&&(l=o&-o,a=t&-t,l>=a||l===32&&(a&4194048)!==0)?t:o}function $r(e,t){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&t)===0}function jb(e,t){(t&8)!==0&&(t|=t&32);var a=e.entangledLanes;if(a!==0)for(e=e.entanglements,a&=t;0<a;){var n=31-ea(a),o=1<<n;t|=e[n],a&=~o}return t}function Q$(e,t){switch(e){case 1:case 2:case 4:case 8:case 64:return t+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function Xb(){var e=xs;return xs<<=1,(xs&62914560)===0&&(xs=4194304),e}function ud(e){for(var t=[],a=0;31>a;a++)t.push(e);return t}function xr(e,t){e.pendingLanes|=t,t!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function Z$(e,t,a,n,o,l){var u=e.pendingLanes;e.pendingLanes=a,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=a,e.entangledLanes&=a,e.errorRecoveryDisabledLanes&=a,e.shellSuspendCounter=0;var c=e.entanglements,h=e.expirationTimes,g=e.hiddenUpdates;for(a=u&~a;0<a;){var v=31-ea(a),x=1<<v;c[v]=0,h[v]=-1;var f=g[v];if(f!==null)for(g[v]=null,v=0;v<f.length;v++){var w=f[v];w!==null&&(w.lane&=-536870913)}a&=~x}n!==0&&Qb(e,n,0),l!==0&&o===0&&e.tag!==0&&(e.suspendedLanes|=l&~(u&~t))}function Qb(e,t,a){e.pendingLanes|=t,e.suspendedLanes&=~t;var n=31-ea(t);e.entangledLanes|=t,e.entanglements[n]=e.entanglements[n]|1073741824|a&261930}function Zb(e,t){var a=e.entangledLanes|=t;for(e=e.entanglements;a;){var n=31-ea(a),o=1<<n;o&t|e[n]&t&&(e[n]|=t),a&=~o}}function Kb(e,t){var a=t&-t;return a=(a&42)!==0?1:Jh(a),(a&(e.suspendedLanes|t))!==0?0:a}function Jh(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function Ph(e){return e&=-e,2<e?8<e?(e&134217727)!==0?32:268435456:8:2}function Jb(){var e=pe.p;return e!==0?e:(e=window.event,e===void 0?32:Mw(e.type))}function ef(e,t){var a=pe.p;try{return pe.p=e,t()}finally{pe.p=a}}var bn=Math.random().toString(36).slice(2),dt="__reactFiber$"+bn,Gt="__reactProps$"+bn,tl="__reactContainer$"+bn,tf="__reactEvents$"+bn,K$="__reactListeners$"+bn,J$="__reactHandles$"+bn,af="__reactResources$"+bn,Nr="__reactMarker$"+bn,uu="__reactLoad$"+bn;function Du(e){delete e[dt],delete e[Gt],delete e[K$],delete e[J$]}function wi(e){var t;if(t=e[dt])return t;for(var a=e.parentNode;a;){if(t=a[tl]||a[dt]){if(a=t.alternate,t.child!==null||a!==null&&a.child!==null)for(e=wb(e);e!==null;){if(a=e[dt])return a;e=wb(e)}return t}e=a,a=e.parentNode}return null}function al(e){if(e=e[dt]||e[tl]){var t=e.tag;if(t===5||t===6||t===13||t===31||t===26||t===27||t===3)return e}return null}function Il(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e.stateNode;throw Error(A(33))}function Oo(e){var t=e[af];return t||(t=e[af]={hoistableStyles:new Map,hoistableScripts:new Map}),t}function it(e){e[Nr]=!0}function Pb(e){e[uu]=void 0}var Fb=new Set,Wb={};function _i(e,t){Go(e,t),Go(e+"Capture",t)}function Go(e,t){for(Wb[e]=t,e=0;e<t.length;e++)Fb.add(t[e])}var P$=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),nf={},of={};function F$(e){return Xd.call(of,e)?!0:Xd.call(nf,e)?!1:P$.test(e)?of[e]=!0:(nf[e]=!0,!1)}var he=!1;function lf(){var e=he;return he=!1,e}function Bs(e,t,a){if(F$(t))if(a===null)e.removeAttribute(t);else{switch(typeof a){case"undefined":case"function":case"symbol":e.removeAttribute(t);return;case"boolean":var n=t.toLowerCase().slice(0,5);if(n!=="data-"&&n!=="aria-"){e.removeAttribute(t);return}}e.setAttribute(t,a)}}function Ns(e,t,a){if(a===null)e.removeAttribute(t);else{switch(typeof a){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(t);return}e.setAttribute(t,a)}}function on(e,t,a,n){if(n===null)e.removeAttribute(a);else{switch(typeof n){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(a);return}e.setAttributeNS(t,a,n)}}function Zt(e){switch(typeof e){case"bigint":case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function ev(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function W$(e,t,a){var n=Object.getOwnPropertyDescriptor(e.constructor.prototype,t);if(!e.hasOwnProperty(t)&&typeof n<"u"&&typeof n.get=="function"&&typeof n.set=="function"){var o=n.get,l=n.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return o.call(this)},set:function(u){a=""+u,l.call(this,u)}}),Object.defineProperty(e,t,{enumerable:n.enumerable}),{getValue:function(){return a},setValue:function(u){a=""+u},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function Qd(e){if(!e._valueTracker){var t=ev(e)?"checked":"value";e._valueTracker=W$(e,t,""+e[t])}}function tv(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var a=t.getValue(),n="";return e&&(n=ev(e)?e.checked?"true":"false":e.value),e=n,e!==a?(t.setValue(e),!0):!1}var ex=/[\n"\\]/g;function pa(e){return e.replace(ex,function(t){return"\\"+t.charCodeAt(0).toString(16)+" "})}function Zd(e,t,a,n,o,l,u,c){e.name="",u!=null&&typeof u!="function"&&typeof u!="symbol"&&typeof u!="boolean"?e.type=u:e.removeAttribute("type"),t!=null?u==="number"?(t===0&&e.value===""||e.value!=t)&&(e.value=""+Zt(t)):e.value!==""+Zt(t)&&(e.value=""+Zt(t)):u!=="submit"&&u!=="reset"||e.removeAttribute("value"),t!=null?u==="number"&&e.value==t?cd(e,Zt(e.value)):cd(e,Zt(t)):a!=null?cd(e,Zt(a)):n!=null&&e.removeAttribute("value"),o==null&&l!=null&&(e.defaultChecked=!!l),o!=null&&(e.checked=o&&typeof o!="function"&&typeof o!="symbol"),c!=null&&typeof c!="function"&&typeof c!="symbol"&&typeof c!="boolean"?e.name=""+Zt(c):e.removeAttribute("name")}function av(e,t,a,n,o,l,u,c){if(l!=null&&typeof l!="function"&&typeof l!="symbol"&&typeof l!="boolean"&&(e.type=l),t!=null||a!=null){if(!(l!=="submit"&&l!=="reset"||t!=null)){Qd(e);return}a=a!=null?""+Zt(a):"",t=t!=null?""+Zt(t):a,c||t===e.value||(e.value=t),e.defaultValue=t}n=n??o,n=typeof n!="function"&&typeof n!="symbol"&&!!n,e.checked=c?e.checked:!!n,e.defaultChecked=!!n,u!=null&&typeof u!="function"&&typeof u!="symbol"&&typeof u!="boolean"&&(e.name=u),Qd(e)}function cd(e,t){e.defaultValue!==""+t&&(e.defaultValue=""+t)}function Ro(e,t,a,n){if(e=e.options,t){t={};for(var o=0;o<a.length;o++)t["$"+a[o]]=!0;for(a=0;a<e.length;a++)o=t.hasOwnProperty("$"+e[a].value),e[a].selected!==o&&(e[a].selected=o),o&&n&&(e[a].defaultSelected=!0)}else{for(a=""+Zt(a),t=null,o=0;o<e.length;o++){if(e[o].value===a){e[o].selected=!0,n&&(e[o].defaultSelected=!0);return}t!==null||e[o].disabled||(t=e[o])}t!==null&&(t.selected=!0)}}function nv(e,t,a){if(t!=null&&(t=""+Zt(t),t!==e.value&&(e.value=t),a==null)){e.defaultValue!==t&&(e.defaultValue=t);return}e.defaultValue=a!=null?""+Zt(a):""}function iv(e,t,a,n){if(t==null){if(n!=null){if(a!=null)throw Error(A(92));if(Bl(n)){if(1<n.length)throw Error(A(93));n=n[0]}a=n}a==null&&(a=""),t=a}a=Zt(t),e.defaultValue=a,n=e.textContent,n===a&&n!==""&&n!==null&&(e.value=n),Qd(e)}function Yo(e,t){if(t){var a=e.firstChild;if(a&&a===e.lastChild&&a.nodeType===3){a.nodeValue=t;return}}e.textContent=t}var tx=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function rf(e,t,a){var n=t.indexOf("--")===0;a==null||typeof a=="boolean"||a===""?n?e.setProperty(t,""):t==="float"?e.cssFloat="":e[t]="":n?e.setProperty(t,a):typeof a!="number"||a===0||tx.has(t)?t==="float"?e.cssFloat=a:e[t]=(""+a).trim():e[t]=a+"px"}function ov(e,t,a){if(t!=null&&typeof t!="object")throw Error(A(62));if(e=e.style,a!=null){for(var n in a)!a.hasOwnProperty(n)||t!=null&&t.hasOwnProperty(n)||(n.indexOf("--")===0?e.setProperty(n,""):n==="float"?e.cssFloat="":e[n]="",he=!0);for(var o in t)n=t[o],t.hasOwnProperty(o)&&a[o]!==n&&(rf(e,o,n),he=!0)}else for(var l in t)t.hasOwnProperty(l)&&rf(e,l,t[l])}function Fh(e){if(e.indexOf("-")===-1)return!1;switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var ax=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["maskType","mask-type"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),nx=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function Is(e){return nx.test(""+e)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":e}function Xa(){}var Kd=null;function Wh(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var No=null,Vo=null;function sf(e){var t=al(e);if(t&&(e=t.stateNode)){var a=e[Gt]||null;e:switch(e=t.stateNode,t.type){case"input":if(Zd(e,a.value,a.defaultValue,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name),t=a.name,a.type==="radio"&&t!=null){for(a=e;a.parentNode;)a=a.parentNode;for(a=a.querySelectorAll('input[name="'+pa(""+t)+'"][type="radio"]'),t=0;t<a.length;t++){var n=a[t];if(n!==e&&n.form===e.form){var o=n[Gt]||null;if(!o)throw Error(A(90));Zd(n,o.value,o.defaultValue,o.defaultValue,o.checked,o.defaultChecked,o.type,o.name)}}for(t=0;t<a.length;t++)n=a[t],n.form===e.form&&tv(n)}break e;case"textarea":nv(e,a.value,a.defaultValue);break e;case"select":t=a.value,t!=null&&Ro(e,!!a.multiple,t,!1)}}}var dd=!1;function lv(e,t,a){if(dd)return e(t,a);dd=!0;try{var n=e(t);return n}finally{if(dd=!1,(No!==null||Vo!==null)&&(Ku(),No&&(t=No,e=Vo,Vo=No=null,sf(t),e)))for(t=0;t<e.length;t++)sf(e[t])}}function ir(e,t){var a=e.stateNode;if(a===null)return null;var n=a[Gt]||null;if(n===null)return null;a=n[t];e:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(n=!n.disabled)||(e=e.type,n=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!n;break e;default:e=!1}if(e)return null;if(a&&typeof a!="function")throw Error(A(231,t,typeof a));return a}var dn=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),Jd=!1;if(dn)try{po={},Object.defineProperty(po,"passive",{get:function(){Jd=!0}}),window.addEventListener("test",po,po),window.removeEventListener("test",po,po)}catch{Jd=!1}var po,Un=null,em=null,Ls=null;function rv(){if(Ls)return Ls;var e,t=em,a=t.length,n,o="value"in Un?Un.value:Un.textContent,l=o.length;for(e=0;e<a&&t[e]===o[e];e++);var u=a-e;for(n=1;n<=u&&t[a-n]===o[l-n];n++);return Ls=o.slice(e,1<n?1-n:void 0)}function Gs(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function Ss(){return!0}function uf(){return!1}function Ot(e){function t(a,n,o,l,u){this._reactName=a,this._targetInst=o,this.type=n,this.nativeEvent=l,this.target=u,this.currentTarget=null;for(var c in e)e.hasOwnProperty(c)&&(a=e[c],this[c]=a?a(l):l[c]);return this.isDefaultPrevented=(l.defaultPrevented!=null?l.defaultPrevented:l.returnValue===!1)?Ss:uf,this.isPropagationStopped=uf,this}return ke(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var a=this.nativeEvent;a&&(a.preventDefault?a.preventDefault():typeof a.returnValue!="unknown"&&(a.returnValue=!1),this.isDefaultPrevented=Ss)},stopPropagation:function(){var a=this.nativeEvent;a&&(a.stopPropagation?a.stopPropagation():typeof a.cancelBubble!="unknown"&&(a.cancelBubble=!0),this.isPropagationStopped=Ss)},persist:function(){},isPersistent:Ss}),t}var ii={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},_u=Ot(ii),Sr=ke({},ii,{view:0,detail:0}),ix=Ot(Sr),hd,md,Vl,Hu=ke({},Sr,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:tm,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==Vl&&(Vl&&e.type==="mousemove"?(hd=e.screenX-Vl.screenX,md=e.screenY-Vl.screenY):md=hd=0,Vl=e),hd)},movementY:function(e){return"movementY"in e?e.movementY:md}}),cf=Ot(Hu),ox=ke({},Hu,{dataTransfer:0}),lx=Ot(ox),rx=ke({},Sr,{relatedTarget:0}),pd=Ot(rx),sx=ke({},ii,{animationName:0,elapsedTime:0,pseudoElement:0}),ux=Ot(sx),cx=ke({},ii,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),dx=Ot(cx),hx=ke({},ii,{data:0}),df=Ot(hx),mx={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},px={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},gx={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function fx(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=gx[e])?!!t[e]:!1}function tm(){return fx}var bx=ke({},Sr,{key:function(e){if(e.key){var t=mx[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=Gs(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?px[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:tm,charCode:function(e){return e.type==="keypress"?Gs(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?Gs(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),vx=Ot(bx),yx=ke({},Hu,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),hf=Ot(yx),wx=ke({},ii,{submitter:0}),$x=Ot(wx),xx=ke({},Sr,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:tm}),Nx=Ot(xx),Sx=ke({},ii,{propertyName:0,elapsedTime:0,pseudoElement:0}),Tx=Ot(Sx),Ex=ke({},Hu,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),kx=Ot(Ex),Cx=ke({},ii,{newState:0,oldState:0,source:0}),Ax=Ot(Cx),zx=[9,13,27,32],am=dn&&"CompositionEvent"in window,Yl=null;dn&&"documentMode"in document&&(Yl=document.documentMode);var Mx=dn&&"TextEvent"in window&&!Yl,sv=dn&&(!am||Yl&&8<Yl&&11>=Yl),mf=" ",pf=!1;function uv(e,t){switch(e){case"keyup":return zx.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function cv(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var So=!1;function Ox(e,t){switch(e){case"compositionend":return cv(t);case"keypress":return t.which!==32?null:(pf=!0,mf);case"textInput":return e=t.data,e===mf&&pf?null:e;default:return null}}function Rx(e,t){if(So)return e==="compositionend"||!am&&uv(e,t)?(e=rv(),Ls=em=Un=null,So=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return sv&&t.locale!=="ko"?null:t.data;default:return null}}var Vx={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function gf(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!Vx[e.type]:t==="textarea"}function dv(e,t,a,n){No?Vo?Vo.push(n):Vo=[n]:No=n,t=Mu(t,"onChange"),0<t.length&&(a=new _u("onChange","change",null,a,n),e.push({event:a,listeners:t}))}var jl=null,or=null;function Dx(e){lw(e,0)}function Uu(e){var t=Il(e);if(tv(t))return e}function ff(e,t){if(e==="change")return t}var hv=!1;dn&&(dn?(Es="oninput"in document,Es||(gd=document.createElement("div"),gd.setAttribute("oninput","return;"),Es=typeof gd.oninput=="function"),Ts=Es):Ts=!1,hv=Ts&&(!document.documentMode||9<document.documentMode));var Ts,Es,gd;function bf(){jl&&(jl.detachEvent("onpropertychange",mv),or=jl=null)}function mv(e){if(e.propertyName==="value"&&Uu(or)){var t=[];dv(t,or,e,Wh(e)),lv(Dx,t)}}function _x(e,t,a){e==="focusin"?(bf(),jl=t,or=a,jl.attachEvent("onpropertychange",mv)):e==="focusout"&&bf()}function Hx(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return Uu(or)}function Ux(e,t){if(e==="click")return Uu(t)}function qx(e,t){if(e==="input"||e==="change")return Uu(t)}function Bx(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var aa=typeof Object.is=="function"?Object.is:Bx;function lr(e,t){if(aa(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var a=Object.keys(e),n=Object.keys(t);if(a.length!==n.length)return!1;for(n=0;n<a.length;n++){var o=a[n];if(!Xd.call(t,o)||!aa(e[o],t[o]))return!1}return!0}function Pd(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}function vf(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function yf(e,t){var a=vf(e);e=0;for(var n;a;){if(a.nodeType===3){if(n=e+a.textContent.length,e<=t&&n>=t)return{node:a,offset:t-e};e=n}e:{for(;a;){if(a.nextSibling){a=a.nextSibling;break e}a=a.parentNode}a=void 0}a=vf(a)}}function pv(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?pv(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function gv(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var t=Pd(e.document);t instanceof e.HTMLIFrameElement;){try{var a=typeof t.contentWindow.location.href=="string"}catch{a=!1}if(a)e=t.contentWindow;else break;t=Pd(e.document)}return t}function nm(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}var Ix=dn&&"documentMode"in document&&11>=document.documentMode,To=null,Fd=null,Xl=null,Wd=!1;function wf(e,t,a){var n=a.window===a?a.document:a.nodeType===9?a:a.ownerDocument;Wd||To==null||To!==Pd(n)||(n=To,"selectionStart"in n&&nm(n)?n={start:n.selectionStart,end:n.selectionEnd}:(n=(n.ownerDocument&&n.ownerDocument.defaultView||window).getSelection(),n={anchorNode:n.anchorNode,anchorOffset:n.anchorOffset,focusNode:n.focusNode,focusOffset:n.focusOffset}),Xl&&lr(Xl,n)||(Xl=n,n=Mu(Fd,"onSelect"),0<n.length&&(t=new _u("onSelect","select",null,t,a),e.push({event:t,listeners:n}),t.target=To)))}function gi(e,t){var a={};return a[e.toLowerCase()]=t.toLowerCase(),a["Webkit"+e]="webkit"+t,a["Moz"+e]="moz"+t,a}var Eo={animationend:gi("Animation","AnimationEnd"),animationiteration:gi("Animation","AnimationIteration"),animationstart:gi("Animation","AnimationStart"),transitionrun:gi("Transition","TransitionRun"),transitionstart:gi("Transition","TransitionStart"),transitioncancel:gi("Transition","TransitionCancel"),transitionend:gi("Transition","TransitionEnd")},fd={},fv={};dn&&(fv=document.createElement("div").style,"AnimationEvent"in window||(delete Eo.animationend.animation,delete Eo.animationiteration.animation,delete Eo.animationstart.animation),"TransitionEvent"in window||delete Eo.transitionend.transition);function Hi(e){if(fd[e])return fd[e];if(!Eo[e])return e;var t=Eo[e],a;for(a in t)if(t.hasOwnProperty(a)&&a in fv)return fd[e]=t[a];return e}var bv=Hi("animationend"),vv=Hi("animationiteration"),yv=Hi("animationstart"),Lx=Hi("transitionrun"),Gx=Hi("transitionstart"),Yx=Hi("transitioncancel"),wv=Hi("transitionend"),$v=new Map,eh="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");eh.push("scrollEnd");function Ma(e,t){$v.set(e,t),_i(t,[e])}var jx=0;function hn(e,t){if(e.name!=null&&e.name!=="auto")return e.name;if(t.autoName!==null)return t.autoName;e=za.identifierPrefix;var a=jx++;return e="_"+e+"t_"+a.toString(32)+"_",t.autoName=e}function $f(e){if(e==null||typeof e=="string")return e;var t=null,a=Io;if(a!==null)for(var n=0;n<a.length;n++){var o=e[a[n]];if(o!=null){if(o==="none")return"none";t=t==null?o:t+(" "+o)}}return t??e.default}function vn(e,t){return e=$f(e),t=$f(t),t==null?e==="auto"?null:e:t==="auto"?null:t}var cu=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)},da=[],ko=0,im=0;function qu(){for(var e=ko,t=im=ko=0;t<e;){var a=da[t];da[t++]=null;var n=da[t];da[t++]=null;var o=da[t];da[t++]=null;var l=da[t];if(da[t++]=null,n!==null&&o!==null){var u=n.pending;u===null?o.next=o:(o.next=u.next,u.next=o),n.pending=o}l!==0&&xv(a,o,l)}}function Bu(e,t,a,n){da[ko++]=e,da[ko++]=t,da[ko++]=a,da[ko++]=n,im|=n,e.lanes|=n,e=e.alternate,e!==null&&(e.lanes|=n)}function om(e,t,a,n){return Bu(e,t,a,n),du(e)}function Ui(e,t){return Bu(e,null,null,t),du(e)}function xv(e,t,a){e.lanes|=a;var n=e.alternate;n!==null&&(n.lanes|=a);for(var o=!1,l=e.return;l!==null;)l.childLanes|=a,n=l.alternate,n!==null&&(n.childLanes|=a),l.tag===22&&(e=l.stateNode,e===null||e._visibility&1||(o=!0)),e=l,l=l.return;return e.tag===3?(l=e.stateNode,o&&t!==null&&(o=31-ea(a),e=l.hiddenUpdates,n=e[o],n===null?e[o]=[t]:n.push(t),t.lane=a|536870912),l):null}function du(e){if(50<ar)throw ar=0,Ws=null,Error(A(185));for(var t=e.return;t!==null;)e=t,t=e.return;return e.tag===3?e.stateNode:null}var Co={};function Xx(e,t,a,n){this.tag=e,this.key=a,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=n,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Bt(e,t,a,n){return new Xx(e,t,a,n)}function lm(e){return e=e.prototype,!(!e||!e.isReactComponent)}function un(e,t){var a=e.alternate;return a===null?(a=Bt(e.tag,t,e.key,e.mode),a.elementType=e.elementType,a.type=e.type,a.stateNode=e.stateNode,a.alternate=e,e.alternate=a):(a.pendingProps=t,a.type=e.type,a.flags=0,a.subtreeFlags=0,a.deletions=null),a.flags=e.flags&1206910976,a.childLanes=e.childLanes,a.lanes=e.lanes,a.child=e.child,a.memoizedProps=e.memoizedProps,a.memoizedState=e.memoizedState,a.updateQueue=e.updateQueue,t=e.dependencies,a.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},a.sibling=e.sibling,a.index=e.index,a.ref=e.ref,a.refCleanup=e.refCleanup,a}function Nv(e,t){e.flags&=1206910978;var a=e.alternate;return a===null?(e.childLanes=0,e.lanes=t,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=a.childLanes,e.lanes=a.lanes,e.child=a.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=a.memoizedProps,e.memoizedState=a.memoizedState,e.updateQueue=a.updateQueue,e.type=a.type,t=a.dependencies,e.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),e}function Ys(e,t,a,n,o,l){var u=0;if(n=e,typeof n=="function")lm(n)&&(u=1);else if(typeof n=="string")u=vS(e,a,Ka.current)?26:e==="html"||e==="head"||e==="body"?27:5;else e:switch(n){case Id:return e=Bt(31,a,t,o),e.elementType=Id,e.lanes=l,e;case $o:return Ni(a.children,o,l,t);case Bb:u=8,o|=24;break;case Ud:return e=Bt(12,a,t,o|2),e.elementType=Ud,e.lanes=l,e;case qd:return e=Bt(13,a,t,o),e.elementType=qd,e.lanes=l,e;case Bd:return e=Bt(19,a,t,o),e.elementType=Bd,e.lanes=l,e;case R$:case Ld:return e=o|32,e=Bt(30,a,t,e),e.elementType=Ld,e.lanes=l,e.stateNode={autoName:null,paired:null,clones:null,ref:null},e;default:if(typeof n=="object"&&n!==null)switch(n.$$typeof){case ja:u=10;break e;case Ib:u=9;break e;case Qh:u=11;break e;case Zh:u=14;break e;case Vn:u=16,n=null;break e}u=29,a=Error(A(130,e===null?"null":typeof e,"")),n=null}return t=Bt(u,a,t,o),t.elementType=e,t.type=n,t.lanes=l,t}function Ni(e,t,a,n){return e=Bt(7,e,n,t),e.lanes=a,e}function bd(e,t,a){return e=Bt(6,e,null,t),e.lanes=a,e}function Sv(e){var t=Bt(18,null,null,0);return t.stateNode=e,t}function vd(e,t,a){return t=Bt(4,e.children!==null?e.children:[],e.key,t),t.lanes=a,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}var xf=new WeakMap;function ga(e,t){if(typeof e=="object"&&e!==null){var a=xf.get(e);return a!==void 0?a:(t={value:e,source:t,stack:Wg(t)},xf.set(e,t),t)}return{value:e,source:t,stack:Wg(t)}}var Ao=[],zo=0,hu=null,rr=0,ha=[],ma=0,Wn=null,Qa=1,Za="";function rn(e,t){Ao[zo++]=rr,Ao[zo++]=hu,hu=e,rr=t}function Tv(e,t,a){ha[ma++]=Qa,ha[ma++]=Za,ha[ma++]=Wn,Wn=e;var n=Qa;e=Za;var o=32-ea(n)-1;n&=~(1<<o),a+=1;var l=32-ea(t)+o;if(30<l){var u=o-o%5;l=(n&(1<<u)-1).toString(32),n>>=u,o-=u,Qa=1<<32-ea(t)+o|a<<o|n,Za=l+e}else Qa=1<<l|a<<o|n,Za=e}function Iu(e){e.return!==null&&(rn(e,1),Tv(e,1,0))}function rm(e){for(;e===hu;)hu=Ao[--zo],Ao[zo]=null,rr=Ao[--zo],Ao[zo]=null;for(;e===Wn;)Wn=ha[--ma],ha[ma]=null,Za=ha[--ma],ha[ma]=null,Qa=ha[--ma],ha[ma]=null}function Ev(e,t){ha[ma++]=Qa,ha[ma++]=Za,ha[ma++]=Wn,Qa=t.id,Za=t.overflow,Wn=e}var ot=null,Oe=null,ie=!1,Yn=null,fa=!1,th=Error(A(519));function ei(e){var t=Error(A(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw sr(ga(t,e)),th}function Nf(e){var t=e.stateNode,a=e.type,n=e.memoizedProps;switch(t[dt]=e,t[Gt]=n,a){case"dialog":le("cancel",t),le("close",t);break;case"iframe":case"object":case"embed":le("load",t);break;case"video":case"audio":for(a=0;a<hr.length;a++)le(hr[a],t);break;case"source":le("error",t);break;case"img":case"image":case"link":le("error",t),le("load",t);break;case"details":le("toggle",t);break;case"input":le("invalid",t),av(t,n.value,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name,!0);break;case"select":le("invalid",t);break;case"textarea":le("invalid",t),iv(t,n.value,n.defaultValue,n.children)}a=n.children,typeof a!="string"&&typeof a!="number"&&typeof a!="bigint"||t.textContent===""+a||n.suppressHydrationWarning===!0||sw(t.textContent,a)?(n.popover!=null&&(le("beforetoggle",t),le("toggle",t)),n.onScroll!=null&&le("scroll",t),n.onScrollEnd!=null&&le("scrollend",t),n.onClick!=null&&(t.onclick=Xa),t=!0):t=!1,t||ei(e,!0)}function mu(e){for(ot=e.return;ot;)switch(ot.tag){case 5:case 31:case 13:fa=!1;return;case 27:case 3:fa=!0;return;default:ot=ot.return}}function go(e){if(e!==ot)return!1;if(!ie)return mu(e),ie=!0,!1;var t=e.tag,a;if((a=t!==3&&t!==27)&&((a=t===5)&&(a=e.type,a=!(a!=="form"&&a!=="button")||qh(e.type,e.memoizedProps)),a=!a),a&&Oe&&ei(e),mu(e),t===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(A(317));Oe=yb(e)}else if(t===31){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(A(317));Oe=yb(e)}else t===27?(t=Oe,oi(e.type)?(e=Gh,Gh=null,Oe=e):Oe=t):Oe=ot?ba(e.stateNode.nextSibling):null;return!0}function ki(){Oe=ot=null,ie=!1}function yd(){var e=Yn;return e!==null&&(Ut===null?Ut=e:Ut.push.apply(Ut,e),Yn=null),e}function sr(e){Yn===null?Yn=[e]:Yn.push(e)}var ah=Fa(null),qi=null,sn=null;function qn(e,t,a){Re(ah,t._currentValue),t._currentValue=a}function cn(e){e._currentValue=ah.current,mt(ah)}function js(e,t,a){for(;e!==null;){var n=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,n!==null&&(n.childLanes|=t)):n!==null&&(n.childLanes&t)!==t&&(n.childLanes|=t),e===a)break;e=e.return}}function nh(e,t,a,n){var o=e.child;for(o!==null&&(o.return=e);o!==null;){var l=o.dependencies;if(l!==null){var u=o.child;l=l.firstContext;e:for(;l!==null;){var c=l;l=o;for(var h=0;h<t.length;h++)if(c.context===t[h]){l.lanes|=a,c=l.alternate,c!==null&&(c.lanes|=a),js(l.return,a,e),n||(u=null);break e}l=c.next}}else if(o.tag===18){if(u=o.return,u===null)throw Error(A(341));u.lanes|=a,l=u.alternate,l!==null&&(l.lanes|=a),js(u,a,e),u=null}else o.tag===13&&o.memoizedState!==null&&o.memoizedState.dehydrated===null?(o.lanes|=a,u=o.alternate,u!==null&&(u.lanes|=a),js(o.return,a,e),u=o.child,u=u!==null?u.sibling:null):u=o.child;if(u!==null)u.return=o;else for(u=o;u!==null;){if(u===e){u=null;break}if(o=u.sibling,o!==null){o.return=u.return,u=o;break}u=u.return}o=u}}function Ci(e,t,a,n){e=null;for(var o=t,l=!1;o!==null;){if(!l){if((o.flags&524288)!==0)l=!0;else if((o.flags&262144)!==0)break}if(o.tag===10){var u=o.alternate;if(u===null)throw Error(A(387));if(u=u.memoizedProps,u!==null){var c=o.type;aa(o.pendingProps.value,u.value)||(e!==null?e.push(c):e=[c])}}else if(o===ou.current){if(u=o.alternate,u===null)throw Error(A(387));u.memoizedState.memoizedState!==o.memoizedState.memoizedState&&(e!==null?e.push(Fo):e=[Fo])}o=o.return}return e!==null&&nh(t,e,a,n),t.flags|=262144,e!==null}function pu(e){for(e=e.firstContext;e!==null;){if(!aa(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function Ai(e){qi=e,sn=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function ht(e){return kv(qi,e)}function ks(e,t){return qi===null&&Ai(e),kv(e,t)}function kv(e,t){var a=t._currentValue;if(t={context:t,memoizedValue:a,next:null},sn===null){if(e===null)throw Error(A(308));sn=t,e.dependencies={lanes:0,firstContext:t},e.flags|=524288}else sn=sn.next=t;return a}var Qx=typeof AbortController<"u"?AbortController:function(){var e=[],t=this.signal={aborted:!1,addEventListener:function(a,n){e.push(n)}};this.abort=function(){t.aborted=!0,e.forEach(function(a){return a()})}},Zx=We.unstable_scheduleCallback,Kx=We.unstable_NormalPriority,Xe={$$typeof:ja,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function sm(){return{controller:new Qx,data:new Map,refCount:0}}function Tr(e){e.refCount--,e.refCount===0&&Zx(Kx,function(){e.controller.abort()})}function Sf(e,t){if((e.pendingLanes&4194048)!==0){var a=e.transitionTypes;for(a===null&&(a=e.transitionTypes=[]),e=0;e<t.length;e++){var n=t[e];a.indexOf(n)===-1&&a.push(n)}}}var Ll=null;function Jx(e){var t=e.transitionTypes;return e.transitionTypes=null,t}var Ql=null,ih=0,zi=0,Do=null;function Px(e,t){if(Ql===null){var a=Ql=[];ih=0,zi=_m(),Do={status:"pending",value:void 0,then:function(n){a.push(n)}}}return ih++,t.then(Tf,Tf),t}function Tf(){if(--ih===0&&(Ll=null,Ql!==null)){Do!==null&&(Do.status="fulfilled");var e=Ql;Ql=null,zi=0,Do=null;for(var t=0;t<e.length;t++)(0,e[t])()}}function Fx(e,t){var a=[],n={status:"pending",value:null,reason:null,then:function(o){a.push(o)}};return e.then(function(){n.status="fulfilled",n.value=t;for(var o=0;o<a.length;o++)(0,a[o])(t)},function(o){for(n.status="rejected",n.reason=o,o=0;o<a.length;o++)(0,a[o])(void 0)}),n}var Ef=F.S;F.S=function(e,t){if(jy=Ft(),typeof t=="object"&&t!==null&&typeof t.then=="function"&&Px(e,t),Ll!==null)for(var a=Ko;a!==null;)Sf(a,Ll),a=a.next;if(a=e.types,a!==null){for(var n=Ko;n!==null;)Sf(n,a),n=n.next;if(zi!==0){n=Ll,n===null&&(n=Ll=[]);for(var o=0;o<a.length;o++){var l=a[o];n.indexOf(l)===-1&&n.push(l)}}}Ef!==null&&Ef(e,t)};var Si=Fa(null);function um(){var e=Si.current;return e!==null?e:Ee.pooledCache}function Xs(e,t){t===null?Re(Si,Si.current):Re(Si,t.pool)}function Cv(){var e=um();return e===null?null:{parent:Xe._currentValue,pool:e}}var nl=Error(A(460)),cm=Error(A(474)),Lu=Error(A(542)),gu={then:function(){}};function kf(e){return e=e.status,e==="fulfilled"||e==="rejected"}function Av(e,t,a){switch(a=e[a],a===void 0?e.push(t):a!==t&&(t.then(Xa,Xa),t=a),t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,Af(e),e===void 0&&!("reason"in t)?Error(A(600)):e;default:if(typeof t.status=="string")t.then(Xa,Xa);else{if(e=Ee,e!==null&&100<e.shellSuspendCounter)throw Error(A(482));e=t,e.status="pending",e.then(function(n){if(t.status==="pending"){var o=t;o.status="fulfilled",o.value=n}},function(n){if(t.status==="pending"){var o=t;o.status="rejected",o.reason=n}})}switch(t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,Af(e),e}throw Ti=t,nl}}function vi(e){try{var t=e._init;return t(e._payload)}catch(a){throw a!==null&&typeof a=="object"&&typeof a.then=="function"?(Ti=a,nl):a}}var Ti=null;function Cf(){if(Ti===null)throw Error(A(459));var e=Ti;return Ti=null,e}function Af(e){if(e===nl||e===Lu)throw Error(A(483))}var _o=null,ur=0;function Cs(e){var t=ur;return ur+=1,_o===null&&(_o=[]),Av(_o,e,t)}function Mn(e,t){t=t.props.ref,e.ref=t!==void 0?t:null}function As(e,t){throw t.$$typeof===O$?Error(A(525)):(e=Object.prototype.toString.call(t),Error(A(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)))}function zv(e){function t($,b){if(e){var N=$.deletions;N===null?($.deletions=[b],$.flags|=16):N.push(b)}}function a($,b){if(!e)return null;for(;b!==null;)t($,b),b=b.sibling;return null}function n($){for(var b=new Map;$!==null;)$.key===null?b.set($.index,$):b.set($.key,$),$=$.sibling;return b}function o($,b){return $=un($,b),$.index=0,$.sibling=null,$}function l($,b,N){return $.index=N,e?(N=$.alternate,N!==null?(N=N.index,N<b?($.flags|=2,b):N):($.flags|=134217730,b)):($.flags|=1048576,b)}function u($){return e&&$.alternate===null&&($.flags|=134217730),$}function c($,b,N,k){return b===null||b.tag!==6?(b=bd(N,$.mode,k),b.return=$,b):(b=o(b,N),b.return=$,b)}function h($,b,N,k){var R=N.type;return R===$o?($=v($,b,N.props.children,k,N.key),Mn($,N),$):b!==null&&(b.elementType===R||typeof R=="object"&&R!==null&&R.$$typeof===Vn&&vi(R)===b.type)?(b=o(b,N.props),Mn(b,N),b.return=$,b):(b=Ys(N.type,N.key,N.props,null,$.mode,k),Mn(b,N),b.return=$,b)}function g($,b,N,k){return b===null||b.tag!==4||b.stateNode.containerInfo!==N.containerInfo||b.stateNode.implementation!==N.implementation?(b=vd(N,$.mode,k),b.return=$,b):(b=o(b,N.children||[]),b.return=$,b)}function v($,b,N,k,R){return b===null||b.tag!==7?(b=Ni(N,$.mode,k,R),b.return=$,b):(b=o(b,N),b.return=$,b)}function x($,b,N){if(typeof b=="string"&&b!==""||typeof b=="number"||typeof b=="bigint")return b=bd(""+b,$.mode,N),b.return=$,b;if(typeof b=="object"&&b!==null){switch(b.$$typeof){case ys:return N=Ys(b.type,b.key,b.props,null,$.mode,N),Mn(N,b),N.return=$,N;case ql:return b=vd(b,$.mode,N),b.return=$,b;case Vn:return b=vi(b),x($,b,N)}if(Bl(b)||Rl(b))return b=Ni(b,$.mode,N,null),b.return=$,b;if(typeof b.then=="function")return x($,Cs(b),N);if(b.$$typeof===ja)return x($,ks($,b),N);As($,b)}return null}function f($,b,N,k){var R=b!==null?b.key:null;if(typeof N=="string"&&N!==""||typeof N=="number"||typeof N=="bigint")return R!==null?null:c($,b,""+N,k);if(typeof N=="object"&&N!==null){switch(N.$$typeof){case ys:return N.key===R?h($,b,N,k):null;case ql:return N.key===R?g($,b,N,k):null;case Vn:return N=vi(N),f($,b,N,k)}if(Bl(N)||Rl(N))return R!==null?null:v($,b,N,k,null);if(typeof N.then=="function")return f($,b,Cs(N),k);if(N.$$typeof===ja)return f($,b,ks($,N),k);As($,N)}return null}function w($,b,N,k,R){if(typeof k=="string"&&k!==""||typeof k=="number"||typeof k=="bigint")return $=$.get(N)||null,c(b,$,""+k,R);if(typeof k=="object"&&k!==null){switch(k.$$typeof){case ys:return $=$.get(k.key===null?N:k.key)||null,h(b,$,k,R);case ql:return $=$.get(k.key===null?N:k.key)||null,g(b,$,k,R);case Vn:return k=vi(k),w($,b,N,k,R)}if(Bl(k)||Rl(k))return $=$.get(N)||null,v(b,$,k,R,null);if(typeof k.then=="function")return w($,b,N,Cs(k),R);if(k.$$typeof===ja)return w($,b,N,ks(b,k),R);As(b,k)}return null}function z($,b,N,k){for(var R=null,P=null,B=b,G=b=0,ue=null;B!==null&&G<N.length;G++){B.index>G?(ue=B,B=null):ue=B.sibling;var D=f($,B,N[G],k);if(D===null){B===null&&(B=ue);break}e&&B&&D.alternate===null&&t($,B),b=l(D,b,G),P===null?R=D:P.sibling=D,P=D,B=ue}if(G===N.length)return a($,B),ie&&rn($,G),R;if(B===null){for(;G<N.length;G++)B=x($,N[G],k),B!==null&&(b=l(B,b,G),P===null?R=B:P.sibling=B,P=B);return ie&&rn($,G),R}for(B=n(B);G<N.length;G++)ue=w(B,$,G,N[G],k),ue!==null&&(e&&(D=ue.alternate,D!==null&&B.delete(D.key===null?G:D.key)),b=l(ue,b,G),P===null?R=ue:P.sibling=ue,P=ue);return e&&B.forEach(function(be){return t($,be)}),ie&&rn($,G),R}function E($,b,N,k){if(N==null)throw Error(A(151));for(var R=null,P=null,B=b,G=b=0,ue=null,D=N.next();B!==null&&!D.done;G++,D=N.next()){B.index>G?(ue=B,B=null):ue=B.sibling;var be=f($,B,D.value,k);if(be===null){B===null&&(B=ue);break}e&&B&&be.alternate===null&&t($,B),b=l(be,b,G),P===null?R=be:P.sibling=be,P=be,B=ue}if(D.done)return a($,B),ie&&rn($,G),R;if(B===null){for(;!D.done;G++,D=N.next())D=x($,D.value,k),D!==null&&(b=l(D,b,G),P===null?R=D:P.sibling=D,P=D);return ie&&rn($,G),R}for(B=n(B);!D.done;G++,D=N.next())D=w(B,$,G,D.value,k),D!==null&&(e&&(ue=D.alternate,ue!==null&&B.delete(ue.key===null?G:ue.key)),b=l(D,b,G),P===null?R=D:P.sibling=D,P=D);return e&&B.forEach(function(lt){return t($,lt)}),ie&&rn($,G),R}function _($,b,N,k){if(typeof N=="object"&&N!==null&&N.type===$o&&N.key===null&&N.props.ref===void 0&&(N=N.props.children),typeof N=="object"&&N!==null){switch(N.$$typeof){case ys:e:{for(var R=N.key;b!==null;){if(b.key===R){if(R=N.type,R===$o){if(b.tag===7){a($,b.sibling),k=o(b,N.props.children),Mn(k,N),k.return=$,$=k;break e}}else if(b.elementType===R||typeof R=="object"&&R!==null&&R.$$typeof===Vn&&vi(R)===b.type){a($,b.sibling),k=o(b,N.props),Mn(k,N),k.return=$,$=k;break e}a($,b);break}else t($,b);b=b.sibling}N.type===$o?(k=Ni(N.props.children,$.mode,k,N.key),Mn(k,N),k.return=$,$=k):(k=Ys(N.type,N.key,N.props,null,$.mode,k),Mn(k,N),k.return=$,$=k)}return u($);case ql:e:{for(R=N.key;b!==null;){if(b.key===R)if(b.tag===4&&b.stateNode.containerInfo===N.containerInfo&&b.stateNode.implementation===N.implementation){a($,b.sibling),k=o(b,N.children||[]),k.return=$,$=k;break e}else{a($,b);break}else t($,b);b=b.sibling}k=vd(N,$.mode,k),k.return=$,$=k}return u($);case Vn:return N=vi(N),_($,b,N,k)}if(Bl(N))return z($,b,N,k);if(Rl(N)){if(R=Rl(N),typeof R!="function")throw Error(A(150));return N=R.call(N),E($,b,N,k)}if(typeof N.then=="function")return _($,b,Cs(N),k);if(N.$$typeof===ja)return _($,b,ks($,N),k);As($,N)}return typeof N=="string"&&N!==""||typeof N=="number"||typeof N=="bigint"?(N=""+N,b!==null&&b.tag===6?(a($,b.sibling),k=o(b,N),k.return=$,$=k):(a($,b),k=bd(N,$.mode,k),k.return=$,$=k),u($)):a($,b)}return function($,b,N,k){try{ur=0;var R=_($,b,N,k);return _o=null,R}catch(B){if(B===nl||B===Lu)throw B;var P=Bt(29,B,null,$.mode);return P.lanes=k,P.return=$,P}}}var Mi=zv(!0),Mv=zv(!1),Dn=!1;function dm(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function oh(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function jn(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function Xn(e,t,a){var n=e.updateQueue;if(n===null)return null;if(n=n.shared,(me&2)!==0){var o=n.pending;return o===null?t.next=t:(t.next=o.next,o.next=t),n.pending=t,t=du(e),xv(e,null,a),t}return Bu(e,n,t,a),du(e)}function Zl(e,t,a){if(t=t.updateQueue,t!==null&&(t=t.shared,(a&4194048)!==0)){var n=t.lanes;n&=e.pendingLanes,a|=n,t.lanes=a,Zb(e,a)}}function wd(e,t){var a=e.updateQueue,n=e.alternate;if(n!==null&&(n=n.updateQueue,a===n)){var o=null,l=null;if(a=a.firstBaseUpdate,a!==null){do{var u={lane:a.lane,tag:a.tag,payload:a.payload,callback:null,next:null};l===null?o=l=u:l=l.next=u,a=a.next}while(a!==null);l===null?o=l=t:l=l.next=t}else o=l=t;a={baseState:n.baseState,firstBaseUpdate:o,lastBaseUpdate:l,shared:n.shared,callbacks:n.callbacks},e.updateQueue=a;return}e=a.lastBaseUpdate,e===null?a.firstBaseUpdate=t:e.next=t,a.lastBaseUpdate=t}var lh=!1;function Kl(){if(lh){var e=Do;if(e!==null)throw e}}function Jl(e,t,a,n){lh=!1;var o=e.updateQueue;Dn=!1;var l=o.firstBaseUpdate,u=o.lastBaseUpdate,c=o.shared.pending;if(c!==null){o.shared.pending=null;var h=c,g=h.next;h.next=null,u===null?l=g:u.next=g,u=h;var v=e.alternate;v!==null&&(v=v.updateQueue,c=v.lastBaseUpdate,c!==u&&(c===null?v.firstBaseUpdate=g:c.next=g,v.lastBaseUpdate=h))}if(l!==null){var x=o.baseState;u=0,v=g=h=null,c=l;do{var f=c.lane&-536870913,w=f!==c.lane;if(w?(se&f)===f:(n&f)===f){f!==0&&f===zi&&(lh=!0),v!==null&&(v=v.next={lane:0,tag:c.tag,payload:c.payload,callback:null,next:null});e:{var z=e,E=c;f=t;var _=a;switch(E.tag){case 1:if(z=E.payload,typeof z=="function"){x=z.call(_,x,f);break e}x=z;break e;case 3:z.flags=z.flags&-65537|128;case 0:if(z=E.payload,f=typeof z=="function"?z.call(_,x,f):z,f==null)break e;x=ke({},x,f);break e;case 2:Dn=!0}}f=c.callback,f!==null&&(e.flags|=64,w&&(e.flags|=8192),w=o.callbacks,w===null?o.callbacks=[f]:w.push(f))}else w={lane:f,tag:c.tag,payload:c.payload,callback:c.callback,next:null},v===null?(g=v=w,h=x):v=v.next=w,u|=f;if(c=c.next,c===null){if(c=o.shared.pending,c===null)break;w=c,c=w.next,w.next=null,o.lastBaseUpdate=w,o.shared.pending=null}}while(!0);v===null&&(h=x),o.baseState=h,o.firstBaseUpdate=g,o.lastBaseUpdate=v,l===null&&(o.shared.lanes=0),ni|=u,e.lanes=u,e.memoizedState=x}}function Ov(e,t){if(typeof e!="function")throw Error(A(191,e));e.call(t)}function Rv(e,t){var a=e.callbacks;if(a!==null)for(e.callbacks=null,e=0;e<a.length;e++)Ov(a[e],t)}var ti=Fa(null),fu=Fa(0);function zf(e,t){e=fn,Re(fu,e),Re(ti,t),fn=e|t.baseLanes}function rh(){Re(fu,fn),Re(ti,ti.current)}function hm(){fn=fu.current,mt(ti),mt(fu)}var ft=Fa(null),xt=null;function Qn(e){var t=e.alternate;Re(pt,pt.current&1),Re(ft,e),xt===null&&(t===null||ti.current!==null||t.memoizedState!==null)&&(xt=e)}function sh(e){Re(pt,pt.current),Re(ft,e),xt===null&&(xt=e)}function Vv(e){e.tag===22?(Re(pt,pt.current),Re(ft,e),xt===null&&(xt=e)):Zn()}function Zn(){Re(pt,pt.current),Re(ft,ft.current)}function Kt(e){mt(ft),xt===e&&(xt=null),mt(pt)}var pt=Fa(0);function cr(e,t){Re(ft,ft.current),Re(pt,t)}function mm(e){mt(pt),mt(ft),xt===e&&(xt=null)}function bu(e){for(var t=e;t!==null;){if(t.tag===13){var a=t.memoizedState;if(a!==null&&(a=a.dehydrated,a===null||Lh(a)||Bm(a)))return t}else if(t.tag===19&&t.memoizedProps.revealOrder!=="independent"){if((t.flags&128)!==0)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var mn=0,ae=null,xe=null,je=null,vu=!1,Ho=!1,Oi=!1,yu=0,dr=0,Uo=null,Wx=0;function Be(){throw Error(A(321))}function pm(e,t){if(t===null)return!1;for(var a=0;a<t.length&&a<e.length;a++)if(!aa(e[a],t[a]))return!1;return!0}function gm(e,t,a,n,o,l){return mn=l,ae=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,F.H=e===null||e.memoizedState===null?dy:hy,Oi=!1,l=a(n,o),Oi=!1,Ho&&(l=_v(t,a,n,o)),Dv(e),l}function Dv(e){F.H=wu;var t=xe!==null&&xe.next!==null;if(mn=0,je=xe=ae=null,vu=!1,dr=0,Uo=null,t)throw Error(A(300));e===null||Qe||(e=e.dependencies,e!==null&&pu(e)&&(Qe=!0))}function _v(e,t,a,n){ae=e;var o=0;do{if(Ho&&(Uo=null),dr=0,Ho=!1,25<=o)throw Error(A(301));if(o+=1,je=xe=null,e.updateQueue!=null){var l=e.updateQueue;l.lastEffect=null,l.events=null,l.stores=null,l.memoCache!=null&&(l.memoCache.index=0)}F.H=rN,l=t(a,n)}while(Ho);return l}function eN(){var e=F.H,t=e.useState()[0];return t=typeof t.then=="function"?Er(t):t,e=e.useState()[0],(xe!==null?xe.memoizedState:null)!==e&&(ae.flags|=1024),t}function fm(){var e=yu!==0;return yu=0,e}function bm(e,t,a){t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~a}function vm(e){if(vu){for(e=e.memoizedState;e!==null;){var t=e.queue;t!==null&&(t.pending=null),e=e.next}vu=!1}mn=0,je=xe=ae=null,Ho=!1,dr=yu=0,Uo=null}function Mt(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return je===null?ae.memoizedState=je=e:je=je.next=e,je}function Ge(){if(xe===null){var e=ae.alternate;e=e!==null?e.memoizedState:null}else e=xe.next;var t=je===null?ae.memoizedState:je.next;if(t!==null)je=t,xe=e;else{if(e===null)throw ae.alternate===null?Error(A(467)):Error(A(310));xe=e,e={memoizedState:xe.memoizedState,baseState:xe.baseState,baseQueue:xe.baseQueue,queue:xe.queue,next:null},je===null?ae.memoizedState=je=e:je=je.next=e}return je}function Gu(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function Er(e){var t=dr;return dr+=1,Uo===null&&(Uo=[]),e=Av(Uo,e,t),t=ae,(je===null?t.memoizedState:je.next)===null&&(t=t.alternate,F.H=t===null||t.memoizedState===null?dy:hy),e}function Yu(e){if(e!==null&&typeof e=="object"){if(typeof e.then=="function")return Er(e);if(e.$$typeof===D$)return;if(e.$$typeof===ja)return ht(e)}throw Error(A(438,String(e)))}function ym(e){var t=null,a=ae.updateQueue;if(a!==null&&(t=a.memoCache),t==null){var n=ae.alternate;n!==null&&(n=n.updateQueue,n!==null&&(n=n.memoCache,n!=null&&(t={data:n.data.map(function(o){return o.slice()}),index:0})))}if(t==null&&(t={data:[],index:0}),a===null&&(a=Gu(),ae.updateQueue=a),a.memoCache=t,a=t.data[t.index],a===void 0)for(a=t.data[t.index]=Array(e),n=0;n<e;n++)a[n]=V$;return t.index++,a}function pn(e,t){return typeof t=="function"?t(e):t}function Qs(e){var t=Ge();return wm(t,xe,e)}function wm(e,t,a){var n=e.queue;if(n===null)throw Error(A(311));n.lastRenderedReducer=a;var o=e.baseQueue,l=n.pending;if(l!==null){if(o!==null){var u=o.next;o.next=l.next,l.next=u}t.baseQueue=o=l,n.pending=null}if(l=e.baseState,o===null)e.memoizedState=l;else{t=o.next;var c=u=null,h=null,g=t,v=!1;do{var x=g.lane&-536870913;if(x!==g.lane?(se&x)===x:(mn&x)===x){var f=g.revertLane;if(f===0)h!==null&&(h=h.next={lane:0,revertLane:0,gesture:null,action:g.action,hasEagerState:g.hasEagerState,eagerState:g.eagerState,next:null}),x===zi&&(v=!0);else if((mn&f)===f){g=g.next,f===zi&&(v=!0);continue}else x={lane:0,revertLane:g.revertLane,gesture:null,action:g.action,hasEagerState:g.hasEagerState,eagerState:g.eagerState,next:null},h===null?(c=h=x,u=l):h=h.next=x,ae.lanes|=f,ni|=f;x=g.action,Oi&&a(l,x),l=g.hasEagerState?g.eagerState:a(l,x)}else f={lane:x,revertLane:g.revertLane,gesture:g.gesture,action:g.action,hasEagerState:g.hasEagerState,eagerState:g.eagerState,next:null},h===null?(c=h=f,u=l):h=h.next=f,ae.lanes|=x,ni|=x;g=g.next}while(g!==null&&g!==t);if(h===null?u=l:h.next=c,!aa(l,e.memoizedState)&&(Qe=!0,v&&(a=Do,a!==null)))throw a;e.memoizedState=l,e.baseState=u,e.baseQueue=h,n.lastRenderedState=l}return o===null&&(n.lanes=0),[e.memoizedState,n.dispatch]}function $d(e){var t=Ge(),a=t.queue;if(a===null)throw Error(A(311));a.lastRenderedReducer=e;var n=a.dispatch,o=a.pending,l=t.memoizedState;if(o!==null){a.pending=null;var u=o=o.next;do l=e(l,u.action),u=u.next;while(u!==o);aa(l,t.memoizedState)||(Qe=!0),t.memoizedState=l,t.baseQueue===null&&(t.baseState=l),a.lastRenderedState=l}return[l,n]}function Hv(e,t,a){var n=ae,o=Ge(),l=ie;if(l){if(a===void 0)throw Error(A(407));a=a()}else a=t();var u=!aa((xe||o).memoizedState,a);if(u&&(o.memoizedState=a,Qe=!0),o=o.queue,$m(Bv.bind(null,n,o,e),[e]),e=o.getSnapshot!==t||u||je!==null&&(je.memoizedState.tag&1)!==0,jo(e?9:8,{destroy:void 0},qv.bind(null,n,o,a,t),null),e){if(n.flags|=2048,Ee===null)throw Error(A(349));l||(mn&127)!==0||Uv(n,t,a)}return a}function Uv(e,t,a){e.flags|=16384,e={getSnapshot:t,value:a},t=ae.updateQueue,t===null?(t=Gu(),ae.updateQueue=t,t.stores=[e]):(a=t.stores,a===null?t.stores=[e]:a.push(e))}function qv(e,t,a,n){t.value=a,t.getSnapshot=n,Iv(t)&&Lv(e)}function Bv(e,t,a){return a(function(){Iv(t)&&Lv(e)})}function Iv(e){var t=e.getSnapshot;e=e.value;try{var a=t();return!aa(e,a)}catch{return!0}}function Lv(e){var t=Ui(e,2);t!==null&&It(t,e,2)}function uh(e){var t=Mt();if(typeof e=="function"){var a=e;if(e=a(),Oi){Hn(!0);try{a()}finally{Hn(!1)}}}return t.memoizedState=t.baseState=e,t.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:pn,lastRenderedState:e},t}function Gv(e,t,a,n){return e.baseState=a,wm(e,xe,typeof n=="function"?n:pn)}function tN(e,t,a,n,o){if(Xu(e))throw Error(A(485));if(e=t.action,e!==null){var l={payload:o,action:e,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(u){l.listeners.push(u)}};F.T!==null?a(!0):l.isTransition=!1,n(l),a=t.pending,a===null?(l.next=t.pending=l,Yv(t,l)):(l.next=a.next,t.pending=a.next=l)}}function Yv(e,t){var a=t.action,n=t.payload,o=e.state;if(t.isTransition){var l=F.T,u={};u.types=l!==null?l.types:null,F.T=u;try{var c=a(o,n),h=F.S;h!==null&&h(u,c),Mf(e,t,c)}catch(g){ch(e,t,g)}finally{l!==null&&u.types!==null&&(l.types=u.types),F.T=l}}else try{l=a(o,n),Mf(e,t,l)}catch(g){ch(e,t,g)}}function Mf(e,t,a){a!==null&&typeof a=="object"&&typeof a.then=="function"?a.then(function(n){Of(e,t,n)},function(n){return ch(e,t,n)}):Of(e,t,a)}function Of(e,t,a){t.status="fulfilled",t.value=a,jv(t),e.state=a,t=e.pending,t!==null&&(a=t.next,a===t?e.pending=null:(a=a.next,t.next=a,Yv(e,a)))}function ch(e,t,a){var n=e.pending;if(e.pending=null,n!==null){n=n.next;do t.status="rejected",t.reason=a,jv(t),t=t.next;while(t!==n)}e.action=null}function jv(e){e=e.listeners;for(var t=0;t<e.length;t++)(0,e[t])()}function Xv(e,t){return t}function Rf(e,t){if(ie){var a=Ee.formState;if(a!==null){e:{var n=ae;if(ie){if(Oe){t:{for(var o=Oe,l=fa;o.nodeType!==8;){if(!l){o=null;break t}if(o=ba(o.nextSibling),o===null){o=null;break t}}l=o.data,o=l==="F!"||l==="F"?o:null}if(o){Oe=ba(o.nextSibling),n=o.data==="F!";break e}}ei(n)}n=!1}n&&(t=a[0])}}return a=Mt(),a.memoizedState=a.baseState=t,n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Xv,lastRenderedState:t},a.queue=n,a=sy.bind(null,ae,n),n.dispatch=a,n=uh(!1),l=Tm.bind(null,ae,!1,n.queue),n=Mt(),o={state:t,dispatch:null,action:e,pending:null},n.queue=o,a=tN.bind(null,ae,o,l,a),o.dispatch=a,n.memoizedState=e,[t,a,!1]}function Vf(e){var t=Ge();return Qv(t,xe,e)}function Qv(e,t,a){if(t=wm(e,t,Xv)[0],e=Qs(pn)[0],typeof t=="object"&&t!==null&&typeof t.then=="function")try{var n=Er(t)}catch(u){throw u===nl?Lu:u}else n=t;t=Ge();var o=t.queue,l=o.dispatch;return a!==t.memoizedState&&(ae.flags|=2048,jo(9,{destroy:void 0},aN.bind(null,o,a),null)),[n,l,e]}function aN(e,t){e.action=t}function Df(e){var t=Ge(),a=xe;if(a!==null)return Qv(t,a,e);Ge(),t=t.memoizedState,a=Ge();var n=a.queue.dispatch;return a.memoizedState=e,[t,n,!1]}function jo(e,t,a,n){return e={tag:e,create:a,deps:n,inst:t,next:null},t=ae.updateQueue,t===null&&(t=Gu(),ae.updateQueue=t),a=t.lastEffect,a===null?t.lastEffect=e.next=e:(n=a.next,a.next=e,e.next=n,t.lastEffect=e),e}function Zv(){return Ge().memoizedState}function Zs(e,t,a,n){var o=Mt();ae.flags|=e,o.memoizedState=jo(1|t,{destroy:void 0},a,n===void 0?null:n)}function ju(e,t,a,n){var o=Ge();n=n===void 0?null:n;var l=o.memoizedState.inst;xe!==null&&n!==null&&pm(n,xe.memoizedState.deps)?o.memoizedState=jo(t,l,a,n):(ae.flags|=e,o.memoizedState=jo(1|t,l,a,n))}function _f(e,t){Zs(8390656,8,e,t)}function $m(e,t){ju(2048,8,e,t)}function nN(e){ae.flags|=4;var t=ae.updateQueue;if(t===null)t=Gu(),ae.updateQueue=t,t.events=[e];else{var a=t.events;a===null?t.events=[e]:a.push(e)}}function Kv(e){var t=Ge().memoizedState;return nN({ref:t,nextImpl:e}),function(){if((me&2)!==0)throw Error(A(440));return t.impl.apply(void 0,arguments)}}function Jv(e,t){return ju(4,2,e,t)}function Pv(e,t){return ju(4,4,e,t)}function Fv(e,t){if(typeof t=="function"){e=e();var a=t(e);return function(){typeof a=="function"?a():t(null)}}if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function Wv(e,t,a){a=a!=null?a.concat([e]):null,ju(4,4,Fv.bind(null,t,e),a)}function xm(){}function ey(e,t){var a=Ge();t=t===void 0?null:t;var n=a.memoizedState;return t!==null&&pm(t,n[1])?n[0]:(a.memoizedState=[e,t],e)}function ty(e,t){var a=Ge();t=t===void 0?null:t;var n=a.memoizedState;if(t!==null&&pm(t,n[1]))return n[0];if(n=e(),Oi){Hn(!0);try{e()}finally{Hn(!1)}}return a.memoizedState=[n,t],n}function Nm(e,t,a){return a===void 0||(mn&1073741824)!==0&&(se&261930)===0?e.memoizedState=t:(e.memoizedState=a,e=Qy(),ae.lanes|=e,ni|=e,a)}function ay(e,t,a,n){return aa(a,t)?a:ti.current!==null?(e=Nm(e,a,n),aa(e,t)||(Qe=!0),e):(mn&106)===0||(mn&1073741824)!==0&&(se&261930)===0?(Qe=!0,e.memoizedState=a):(e=Qy(),ae.lanes|=e,ni|=e,t)}function ny(e,t,a,n,o){var l=pe.p;pe.p=l!==0&&8>l?l:8;var u=F.T,c={};c.types=u!==null?u.types:null,F.T=c,Tm(e,!1,t,a);try{var h=o(),g=F.S;if(g!==null&&g(c,h),h!==null&&typeof h=="object"&&typeof h.then=="function"){var v=Fx(h,n);Pl(e,t,v,ta(e))}else Pl(e,t,n,ta(e))}catch(x){Pl(e,t,{then:function(){},status:"rejected",reason:x},ta())}finally{pe.p=l,u!==null&&c.types!==null&&(u.types=c.types),F.T=u}}function iN(){}function dh(e,t,a,n){if(e.tag!==5)throw Error(A(476));var o=iy(e).queue;ny(e,o,t,xi,a===null?iN:function(){return oy(e),a(n)})}function iy(e){var t=e.memoizedState;if(t!==null)return t;t={memoizedState:xi,baseState:xi,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:pn,lastRenderedState:xi},next:null};var a={};return t.next={memoizedState:a,baseState:a,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:pn,lastRenderedState:a},next:null},e.memoizedState=t,e=e.alternate,e!==null&&(e.memoizedState=t),t}function oy(e){var t=iy(e);t.next===null&&(t=e.alternate.memoizedState),Pl(e,t.next.queue,{},ta())}function Sm(){return ht(Fo)}function ly(){return Ge().memoizedState}function ry(){return Ge().memoizedState}function oN(e){for(var t=e.return;t!==null;){switch(t.tag){case 24:case 3:var a=ta();e=jn(a);var n=Xn(t,e,a);n!==null&&(It(n,t,a),Zl(n,t,a)),t={cache:sm()},e.payload=t;return}t=t.return}}function lN(e,t,a){var n=ta();a={lane:n,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null},Xu(e)?uy(t,a):(a=om(e,t,a,n),a!==null&&(It(a,e,n),cy(a,t,n)))}function sy(e,t,a){var n=ta();Pl(e,t,a,n)}function Pl(e,t,a,n){var o={lane:n,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null};if(Xu(e))uy(t,o);else{var l=e.alternate;if(e.lanes===0&&(l===null||l.lanes===0)&&(l=t.lastRenderedReducer,l!==null))try{var u=t.lastRenderedState,c=l(u,a);if(o.hasEagerState=!0,o.eagerState=c,aa(c,u))return Bu(e,t,o,0),Ee===null&&qu(),!1}catch{}if(a=om(e,t,o,n),a!==null)return It(a,e,n),cy(a,t,n),!0}return!1}function Tm(e,t,a,n){if(n={lane:2,revertLane:_m(),gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},Xu(e)){if(t)throw Error(A(479))}else t=om(e,a,n,2),t!==null&&It(t,e,2)}function Xu(e){var t=e.alternate;return e===ae||t!==null&&t===ae}function uy(e,t){Ho=vu=!0;var a=e.pending;a===null?t.next=t:(t.next=a.next,a.next=t),e.pending=t}function cy(e,t,a){if((a&4194048)!==0){var n=t.lanes;n&=e.pendingLanes,a|=n,t.lanes=a,Zb(e,a)}}var wu={readContext:ht,use:Yu,useCallback:Be,useContext:Be,useEffect:Be,useImperativeHandle:Be,useLayoutEffect:Be,useInsertionEffect:Be,useMemo:Be,useReducer:Be,useRef:Be,useState:Be,useDebugValue:Be,useDeferredValue:Be,useTransition:Be,useSyncExternalStore:Be,useId:Be,useHostTransitionStatus:Be,useFormState:Be,useActionState:Be,useOptimistic:Be,useMemoCache:Be,useCacheRefresh:Be,useEffectEvent:Be},dy={readContext:ht,use:Yu,useCallback:function(e,t){return Mt().memoizedState=[e,t===void 0?null:t],e},useContext:ht,useEffect:_f,useImperativeHandle:function(e,t,a){a=a!=null?a.concat([e]):null,Zs(4194308,4,Fv.bind(null,t,e),a)},useLayoutEffect:function(e,t){return Zs(4194308,4,e,t)},useInsertionEffect:function(e,t){Zs(4,2,e,t)},useMemo:function(e,t){var a=Mt();t=t===void 0?null:t;var n=e();if(Oi){Hn(!0);try{e()}finally{Hn(!1)}}return a.memoizedState=[n,t],n},useReducer:function(e,t,a){var n=Mt();if(a!==void 0){var o=a(t);if(Oi){Hn(!0);try{a(t)}finally{Hn(!1)}}}else o=t;return n.memoizedState=n.baseState=o,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:o},n.queue=e,e=e.dispatch=lN.bind(null,ae,e),[n.memoizedState,e]},useRef:function(e){var t=Mt();return e={current:e},t.memoizedState=e},useState:function(e){e=uh(e);var t=e.queue,a=sy.bind(null,ae,t);return t.dispatch=a,[e.memoizedState,a]},useDebugValue:xm,useDeferredValue:function(e,t){var a=Mt();return Nm(a,e,t)},useTransition:function(){var e=uh(!1);return e=ny.bind(null,ae,e.queue,!0,!1),Mt().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,t,a){var n=ae,o=Mt();if(ie){if(a===void 0)throw Error(A(407));a=a()}else{if(a=t(),Ee===null)throw Error(A(349));(se&127)!==0||Uv(n,t,a)}o.memoizedState=a;var l={value:a,getSnapshot:t};return o.queue=l,_f(Bv.bind(null,n,l,e),[e]),n.flags|=2048,jo(9,{destroy:void 0},qv.bind(null,n,l,a,t),null),a},useId:function(){var e=Mt(),t=Ee.identifierPrefix;if(ie){var a=Za,n=Qa;a=(n&~(1<<32-ea(n)-1)).toString(32)+a,t="_"+t+"R_"+a,a=yu++,0<a&&(t+="H"+a.toString(32)),t+="_"}else a=Wx++,t="_"+t+"r_"+a.toString(32)+"_";return e.memoizedState=t},useHostTransitionStatus:Sm,useFormState:Rf,useActionState:Rf,useOptimistic:function(e){var t=Mt();t.memoizedState=t.baseState=e;var a={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return t.queue=a,t=Tm.bind(null,ae,!0,a),a.dispatch=t,[e,t]},useMemoCache:ym,useCacheRefresh:function(){return Mt().memoizedState=oN.bind(null,ae)},useEffectEvent:function(e){var t=Mt(),a={impl:e};return t.memoizedState=a,function(){if((me&2)!==0)throw Error(A(440));return a.impl.apply(void 0,arguments)}}},hy={readContext:ht,use:Yu,useCallback:ey,useContext:ht,useEffect:$m,useImperativeHandle:Wv,useInsertionEffect:Jv,useLayoutEffect:Pv,useMemo:ty,useReducer:Qs,useRef:Zv,useState:function(){return Qs(pn)},useDebugValue:xm,useDeferredValue:function(e,t){var a=Ge();return ay(a,xe.memoizedState,e,t)},useTransition:function(){var e=Qs(pn)[0],t=Ge().memoizedState;return[typeof e=="boolean"?e:Er(e),t]},useSyncExternalStore:Hv,useId:ly,useHostTransitionStatus:Sm,useFormState:Vf,useActionState:Vf,useOptimistic:function(e,t){var a=Ge();return Gv(a,xe,e,t)},useMemoCache:ym,useCacheRefresh:ry,useEffectEvent:Kv},rN={readContext:ht,use:Yu,useCallback:ey,useContext:ht,useEffect:$m,useImperativeHandle:Wv,useInsertionEffect:Jv,useLayoutEffect:Pv,useMemo:ty,useReducer:$d,useRef:Zv,useState:function(){return $d(pn)},useDebugValue:xm,useDeferredValue:function(e,t){var a=Ge();return xe===null?Nm(a,e,t):ay(a,xe.memoizedState,e,t)},useTransition:function(){var e=$d(pn)[0],t=Ge().memoizedState;return[typeof e=="boolean"?e:Er(e),t]},useSyncExternalStore:Hv,useId:ly,useHostTransitionStatus:Sm,useFormState:Df,useActionState:Df,useOptimistic:function(e,t){var a=Ge();return xe!==null?Gv(a,xe,e,t):(a.baseState=e,[e,a.queue.dispatch])},useMemoCache:ym,useCacheRefresh:ry,useEffectEvent:Kv};function xd(e,t,a,n){t=e.memoizedState,a=a(n,t),a=a==null?t:ke({},t,a),e.memoizedState=a,e.lanes===0&&(e.updateQueue.baseState=a)}var hh={enqueueSetState:function(e,t,a){e=e._reactInternals;var n=ta(),o=jn(n);o.payload=t,a!=null&&(o.callback=a),t=Xn(e,o,n),t!==null&&(It(t,e,n),Zl(t,e,n))},enqueueReplaceState:function(e,t,a){e=e._reactInternals;var n=ta(),o=jn(n);o.tag=1,o.payload=t,a!=null&&(o.callback=a),t=Xn(e,o,n),t!==null&&(It(t,e,n),Zl(t,e,n))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var a=ta(),n=jn(a);n.tag=2,t!=null&&(n.callback=t),t=Xn(e,n,a),t!==null&&(It(t,e,a),Zl(t,e,a))}};function Hf(e,t,a,n,o,l,u){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(n,l,u):t.prototype&&t.prototype.isPureReactComponent?!lr(a,n)||!lr(o,l):!0}function Uf(e,t,a,n){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(a,n),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(a,n),t.state!==e&&hh.enqueueReplaceState(t,t.state,null)}function Ri(e,t){var a=t;if("ref"in t){a={};for(var n in t)n!=="ref"&&(a[n]=t[n])}if(e=e.defaultProps){a===t&&(a=ke({},a));for(var o in e)a[o]===void 0&&(a[o]=e[o])}return a}function my(e){cu(e)}function py(e){console.error(e)}function gy(e){cu(e)}function $u(e,t){try{var a=e.onUncaughtError;a(t.value,{componentStack:t.stack})}catch(n){setTimeout(function(){throw n})}}function qf(e,t,a){try{var n=e.onCaughtError;n(a.value,{componentStack:a.stack,errorBoundary:t.tag===1?t.stateNode:null})}catch(o){setTimeout(function(){throw o})}}function mh(e,t,a){return a=jn(a),a.tag=3,a.payload={element:null},a.callback=function(){$u(e,t)},a}function fy(e){return e=jn(e),e.tag=3,e}function by(e,t,a,n){var o=a.type.getDerivedStateFromError;if(typeof o=="function"){var l=n.value;e.payload=function(){return o(l)},e.callback=function(){qf(t,a,n)}}var u=a.stateNode;u!==null&&typeof u.componentDidCatch=="function"&&(e.callback=function(){qf(t,a,n),typeof o!="function"&&(Kn===null?Kn=new Set([this]):Kn.add(this));var c=n.stack;this.componentDidCatch(n.value,{componentStack:c!==null?c:""})})}function sN(e,t,a,n,o){if(a.flags|=32768,n!==null&&typeof n=="object"&&typeof n.then=="function"){if(t=a.alternate,t!==null&&Ci(t,a,o,!0),a=ft.current,a!==null){switch(a.tag){case 31:case 13:case 19:return xt===null?Au():a.alternate===null&&Ie===0&&(Ie=3),a.flags&=-257,a.flags|=65536,a.lanes=o,n===gu?a.flags|=16384:(t=a.updateQueue,t===null?a.updateQueue=new Set([n]):t.add(n),Ad(e,n,o)),!1;case 22:return a.flags|=65536,n===gu?a.flags|=16384:(t=a.updateQueue,t===null?(t={transitions:null,markerInstances:null,retryQueue:new Set([n])},a.updateQueue=t):(a=t.retryQueue,a===null?t.retryQueue=new Set([n]):a.add(n)),Ad(e,n,o)),!1}throw Error(A(435,a.tag))}return Ad(e,n,o),Au(),!1}if(ie)return t=ft.current,t!==null?((t.flags&65536)===0&&(t.flags|=256),t.flags|=65536,t.lanes=o,n!==th&&(e=Error(A(422),{cause:n}),sr(ga(e,a)))):(n!==th&&(t=Error(A(423),{cause:n}),sr(ga(t,a))),e=e.current.alternate,e.flags|=65536,o&=-o,e.lanes|=o,n=ga(n,a),o=mh(e.stateNode,n,o),wd(e,o),Ie!==4&&(Ie=2)),!1;var l=Error(A(520),{cause:n});if(l=ga(l,a),tr===null?tr=[l]:tr.push(l),Ie!==4&&(Ie=2),t===null)return!0;n=ga(n,a),a=t;do{switch(a.tag){case 3:return a.flags|=65536,e=o&-o,a.lanes|=e,e=mh(a.stateNode,n,e),wd(a,e),!1;case 1:if(t=a.type,l=a.stateNode,(a.flags&128)===0&&(typeof t.getDerivedStateFromError=="function"||l!==null&&typeof l.componentDidCatch=="function"&&(Kn===null||!Kn.has(l))))return a.flags|=65536,o&=-o,a.lanes|=o,o=fy(o),by(o,e,a,n),wd(a,o),!1;break;case 22:if(a.memoizedState!==null)return a.flags|=65536,!1}a=a.return}while(a!==null);return!1}var Em=Error(A(461)),Qe=!1;function Pe(e,t,a,n){t.child=e===null?Mv(t,null,a,n):Mi(t,e.child,a,n)}function Bf(e,t,a,n,o){a=a.render;var l=t.ref;if("ref"in n){var u={};for(var c in n)c!=="ref"&&(u[c]=n[c])}else u=n;return Ai(t),n=gm(e,t,a,u,l,o),c=fm(),e!==null&&!Qe?(bm(e,t,o),gn(e,t,o)):(ie&&c&&Iu(t),t.flags|=1,Pe(e,t,n,o),t.child)}function If(e,t,a,n,o){if(e===null){var l=a.type;return typeof l=="function"&&!lm(l)&&l.defaultProps===void 0&&a.compare===null?(t.tag=15,t.type=l,vy(e,t,l,n,o)):(e=Ys(a.type,null,n,t,t.mode,o),e.ref=t.ref,e.return=t,t.child=e)}if(l=e.child,!Cm(e,o)){var u=l.memoizedProps;if(a=a.compare,a=a!==null?a:lr,a(u,n)&&e.ref===t.ref)return gn(e,t,o)}return t.flags|=1,e=un(l,n),e.ref=t.ref,e.return=t,t.child=e}function vy(e,t,a,n,o){if(e!==null){var l=e.memoizedProps;if(lr(l,n)&&e.ref===t.ref)if(Qe=!1,t.pendingProps=n=l,Cm(e,o))(e.flags&131072)!==0&&(Qe=!0);else return t.lanes=e.lanes,gn(e,t,o)}return ph(e,t,a,n,o)}function yy(e,t,a,n){var o=n.children,l=e!==null?e.memoizedState:null;if(e===null&&t.stateNode===null&&(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),n.mode==="hidden"){if((t.flags&128)!==0){if(l=l!==null?l.baseLanes|a:a,e!==null){for(n=t.child=e.child,o=0;n!==null;)o=o|n.lanes|n.childLanes,n=n.sibling;n=o&~l}else n=0,t.child=null;return Lf(e,t,l,a,n)}if((a&536870912)!==0)t.memoizedState={baseLanes:0,cachePool:null},e!==null&&Xs(t,l!==null?l.cachePool:null),l!==null?zf(t,l):rh(),Vv(t);else return n=t.lanes=536870912,Lf(e,t,l!==null?l.baseLanes|a:a,a,n)}else l!==null?(Xs(t,l.cachePool),zf(t,l),Zn(),t.memoizedState=null):(e!==null&&Xs(t,null),rh(),Zn());return Pe(e,t,o,a),t.child}function Fl(e,t){return e!==null&&e.tag===22||t.stateNode!==null||(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),t.sibling}function Lf(e,t,a,n,o){var l=um();return l=l===null?null:{parent:Xe._currentValue,pool:l},t.memoizedState={baseLanes:a,cachePool:l},e!==null&&Xs(t,null),rh(),Vv(t),e!==null&&Ci(e,t,n,!0),t.childLanes=o,null}function Ks(e,t){return t=Qu({mode:t.mode,children:t.children},e.mode),t.ref=e.ref,e.child=t,t.return=e,t}function Gf(e,t,a){return Mi(t,e.child,null,a),e=Ks(t,t.pendingProps),e.flags|=2,Kt(t),t.memoizedState=null,e}function uN(e,t,a){var n=t.pendingProps,o=(t.flags&128)!==0;if(t.flags&=-129,e===null){if(ie){if(n.mode==="hidden")return e=Ks(t,n),t.lanes=536870912,e.memoizedState={baseLanes:0,cachePool:null},Fl(null,e);if(sh(t),(e=Oe)?(e=yw(e,fa),e=e!==null&&e.data==="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:Wn!==null?{id:Qa,overflow:Za}:null,retryLane:536870912,hydrationErrors:null},a=Sv(e),a.return=t,t.child=a,ot=t,Oe=null)):e=null,e===null)throw ei(t);return t.lanes=536870912,null}return Ks(t,n)}var l=e.memoizedState;if(l!==null){var u=l.dehydrated;if(sh(t),o)if(t.flags&256)t.flags&=-257,t=Gf(e,t,a);else if(t.memoizedState!==null)t.child=e.child,t.flags|=128,t=null;else throw Error(A(558));else if(Qe||Ci(e,t,a,!1),o=(a&e.childLanes)!==0,Qe||o){if(ti.current===null){if(n=Ee,n!==null&&(u=Kb(n,a),u!==0&&u!==l.retryLane))throw l.retryLane=u,Ui(e,u),It(n,e,u),Em;Au()}t=Gf(e,t,a)}else e=l.treeContext,Oe=ba(u.nextSibling),ot=t,ie=!0,Yn=null,fa=!1,e!==null&&Ev(t,e),t=Ks(t,n),t.flags|=134221824;return t}return e=un(e.child,{mode:n.mode,children:n.children}),e.ref=t.ref,t.child=e,e.return=t,e}function bo(e,t){var a=t.ref;if(a===null)e!==null&&e.ref!==null&&(t.flags|=4194816);else{if(typeof a!="function"&&typeof a!="object")throw Error(A(284));(e===null||e.ref!==a)&&(t.flags|=4194816)}}function ph(e,t,a,n,o){return Ai(t),a=gm(e,t,a,n,void 0,o),n=fm(),e!==null&&!Qe?(bm(e,t,o),gn(e,t,o)):(ie&&n&&Iu(t),t.flags|=1,Pe(e,t,a,o),t.child)}function Yf(e,t,a,n,o,l){return Ai(t),t.updateQueue=null,a=_v(t,n,a,o),Dv(e),n=fm(),e!==null&&!Qe?(bm(e,t,l),gn(e,t,l)):(ie&&n&&Iu(t),t.flags|=1,Pe(e,t,a,l),t.child)}function jf(e,t,a,n,o){if(Ai(t),t.stateNode===null){var l=Co,u=a.contextType;typeof u=="object"&&u!==null&&(l=ht(u)),l=new a(n,l),t.memoizedState=l.state!==null&&l.state!==void 0?l.state:null,l.updater=hh,t.stateNode=l,l._reactInternals=t,l=t.stateNode,l.props=n,l.state=t.memoizedState,l.refs={},dm(t),u=a.contextType,l.context=typeof u=="object"&&u!==null?ht(u):Co,l.state=t.memoizedState,u=a.getDerivedStateFromProps,typeof u=="function"&&(xd(t,a,u,n),l.state=t.memoizedState),typeof a.getDerivedStateFromProps=="function"||typeof l.getSnapshotBeforeUpdate=="function"||typeof l.UNSAFE_componentWillMount!="function"&&typeof l.componentWillMount!="function"||(u=l.state,typeof l.componentWillMount=="function"&&l.componentWillMount(),typeof l.UNSAFE_componentWillMount=="function"&&l.UNSAFE_componentWillMount(),u!==l.state&&hh.enqueueReplaceState(l,l.state,null),Jl(t,n,l,o),Kl(),l.state=t.memoizedState),typeof l.componentDidMount=="function"&&(t.flags|=4194308),n=!0}else if(e===null){l=t.stateNode;var c=t.memoizedProps,h=Ri(a,c);l.props=h;var g=l.context,v=a.contextType;u=Co,typeof v=="object"&&v!==null&&(u=ht(v));var x=a.getDerivedStateFromProps;v=typeof x=="function"||typeof l.getSnapshotBeforeUpdate=="function",c=t.pendingProps!==c,v||typeof l.UNSAFE_componentWillReceiveProps!="function"&&typeof l.componentWillReceiveProps!="function"||(c||g!==u)&&Uf(t,l,n,u),Dn=!1;var f=t.memoizedState;l.state=f,Jl(t,n,l,o),Kl(),g=t.memoizedState,c||f!==g||Dn?(typeof x=="function"&&(xd(t,a,x,n),g=t.memoizedState),(h=Dn||Hf(t,a,h,n,f,g,u))?(v||typeof l.UNSAFE_componentWillMount!="function"&&typeof l.componentWillMount!="function"||(typeof l.componentWillMount=="function"&&l.componentWillMount(),typeof l.UNSAFE_componentWillMount=="function"&&l.UNSAFE_componentWillMount()),typeof l.componentDidMount=="function"&&(t.flags|=4194308)):(typeof l.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=n,t.memoizedState=g),l.props=n,l.state=g,l.context=u,n=h):(typeof l.componentDidMount=="function"&&(t.flags|=4194308),n=!1)}else{l=t.stateNode,oh(e,t),u=t.memoizedProps,v=Ri(a,u),l.props=v,x=t.pendingProps,f=l.context,g=a.contextType,h=Co,typeof g=="object"&&g!==null&&(h=ht(g)),c=a.getDerivedStateFromProps,(g=typeof c=="function"||typeof l.getSnapshotBeforeUpdate=="function")||typeof l.UNSAFE_componentWillReceiveProps!="function"&&typeof l.componentWillReceiveProps!="function"||(u!==x||f!==h)&&Uf(t,l,n,h),Dn=!1,f=t.memoizedState,l.state=f,Jl(t,n,l,o),Kl();var w=t.memoizedState;u!==x||f!==w||Dn||e!==null&&e.dependencies!==null&&pu(e.dependencies)?(typeof c=="function"&&(xd(t,a,c,n),w=t.memoizedState),(v=Dn||Hf(t,a,v,n,f,w,h)||e!==null&&e.dependencies!==null&&pu(e.dependencies))?(g||typeof l.UNSAFE_componentWillUpdate!="function"&&typeof l.componentWillUpdate!="function"||(typeof l.componentWillUpdate=="function"&&l.componentWillUpdate(n,w,h),typeof l.UNSAFE_componentWillUpdate=="function"&&l.UNSAFE_componentWillUpdate(n,w,h)),typeof l.componentDidUpdate=="function"&&(t.flags|=4),typeof l.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof l.componentDidUpdate!="function"||u===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof l.getSnapshotBeforeUpdate!="function"||u===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),t.memoizedProps=n,t.memoizedState=w),l.props=n,l.state=w,l.context=h,n=v):(typeof l.componentDidUpdate!="function"||u===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof l.getSnapshotBeforeUpdate!="function"||u===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),n=!1)}return l=n,bo(e,t),n=(t.flags&128)!==0,l||n?(l=t.stateNode,a=n&&typeof a.getDerivedStateFromError!="function"?null:l.render(),t.flags|=1,e!==null&&n?(t.child=Mi(t,e.child,null,o),t.child=Mi(t,null,a,o)):Pe(e,t,a,o),t.memoizedState=l.state,e=t.child):e=gn(e,t,o),e}function Xf(e,t,a,n){return ki(),t.flags|=256,Pe(e,t,a,n),t.child}var gh={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function fh(e){return{baseLanes:e,cachePool:Cv()}}function bh(e,t,a){return e=e!==null?e.childLanes&~a:0,t&&(e|=Pt),e}function wy(e,t,a){var n=t.pendingProps,o=!1,l=(t.flags&128)!==0,u;if((u=l)||(u=e!==null&&e.memoizedState===null?!1:(pt.current&2)!==0),u&&(o=!0,t.flags&=-129),u=(t.flags&32)!==0,t.flags&=-33,e===null){if(ie){if(o?Qn(t):Zn(),(e=Oe)?(e=yw(e,fa),e=e!==null&&e.data!=="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:Wn!==null?{id:Qa,overflow:Za}:null,retryLane:536870912,hydrationErrors:null},a=Sv(e),a.return=t,t.child=a,ot=t,Oe=null)):e=null,e===null)throw ei(t);return Bm(e)?t.lanes=32:t.lanes=536870912,null}return l=n.children,n=n.fallback,o?(Zn(),o=t.mode,l=Qu({mode:"hidden",children:l},o),n=Ni(n,o,a,null),l.return=t,n.return=t,l.sibling=n,t.child=l,n=t.child,n.memoizedState=fh(a),n.childLanes=bh(e,u,a),t.memoizedState=gh,Fl(null,n)):(Qn(t),km(t,l))}var c=e.memoizedState;if(c!==null){var h=c.dehydrated;if(h!==null)return cN(e,t,l,u,n,h,c,a)}return o?(Zn(),o=n.fallback,l=t.mode,c=e.child,h=c.sibling,n=un(c,{mode:"hidden",children:n.children}),n.subtreeFlags=c.subtreeFlags&1206910976,h!==null?o=un(h,o):(o=Ni(o,l,a,null),o.flags|=2),o.return=t,n.return=t,n.sibling=o,t.child=n,Fl(null,n),n=t.child,o=e.child.memoizedState,o===null?o=fh(a):(l=o.cachePool,l!==null?(c=Xe._currentValue,l=l.parent!==c?{parent:c,pool:c}:l):l=Cv(),o={baseLanes:o.baseLanes|a,cachePool:l}),n.memoizedState=o,n.childLanes=bh(e,u,a),t.memoizedState=gh,Fl(e.child,n)):(Qn(t),a=e.child,e=a.sibling,a=un(a,{mode:"visible",children:n.children}),a.return=t,a.sibling=null,e!==null&&(u=t.deletions,u===null?(t.deletions=[e],t.flags|=16):u.push(e)),t.child=a,t.memoizedState=null,a)}function km(e,t){return t=Qu({mode:"visible",children:t},e.mode),t.return=e,e.child=t}function Qu(e,t){return e=Bt(22,e,null,t),e.lanes=0,e}function zs(e,t,a){return Mi(t,e.child,null,a),e=km(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function cN(e,t,a,n,o,l,u,c){if(a)return t.flags&256?(Qn(t),t.flags&=-257,zs(e,t,c)):t.memoizedState!==null?(Zn(),t.child=e.child,t.flags|=128,null):(Zn(),l=o.fallback,u=t.mode,o=Qu({mode:"visible",children:o.children},u),l=Ni(l,u,c,null),l.flags|=2,o.return=t,l.return=t,o.sibling=l,t.child=o,Mi(t,e.child,null,c),o=t.child,o.memoizedState=fh(c),o.childLanes=bh(e,n,c),t.memoizedState=gh,Fl(null,o));if(Qn(t),Bm(l)){if(n=l.nextSibling&&l.nextSibling.dataset,n)var h=n.dgst;return n=h,n!==""&&(o=Error(A(419)),o.stack="",o.digest=n,sr({value:o,source:null,stack:null})),zs(e,t,c)}if(Qe||Ci(e,t,c,!1),n=(c&e.childLanes)!==0,Qe||n){if(ti.current!==null)return zs(e,t,c);if(n=Ee,n!==null&&(o=Kb(n,c),o!==0&&o!==u.retryLane))throw u.retryLane=o,Ui(e,o),It(n,e,o),Em;return Lh(l)||Au(),zs(e,t,c)}return Lh(l)?(t.flags|=192,t.child=e.child,null):(e=u.treeContext,Oe=ba(l.nextSibling),ot=t,ie=!0,Yn=null,fa=!1,e!==null&&Ev(t,e),t=km(t,o.children),t.flags|=134221824,t)}function Qf(e,t,a){e.lanes|=t;var n=e.alternate;n!==null&&(n.lanes|=t),js(e.return,t,a)}function Zf(e){for(var t=null;e!==null;){var a=e.alternate;a!==null&&bu(a)===null&&(t=e),e=e.sibling}return t}function Ms(e,t,a,n,o,l){var u=e.memoizedState;u===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:n,tail:a,tailMode:o,treeForkCount:l}:(u.isBackwards=t,u.rendering=null,u.renderingStartTime=0,u.last=n,u.tail=a,u.tailMode=o,u.treeForkCount=l)}function Nd(e){var t=e.child;for(e.child=null;t!==null;){var a=t.sibling;t.sibling=e.child,e.child=t,t=a}}function vh(e,t,a){var n=t.pendingProps,o=n.revealOrder,l=n.tail;n=n.children;var u=pt.current;if(t.flags&128)return cr(t,u),null;var c=(u&2)!==0;if(c?(u=u&1|2,t.flags|=128):u&=1,cr(t,u),o==="backwards"&&e!==null?(Nd(e),Pe(e,t,n,a),Nd(e)):Pe(e,t,n,a),n=ie?rr:0,!c&&e!==null&&(e.flags&128)!==0)e:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&Qf(e,a,t);else if(e.tag===19)Qf(e,a,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(o){case"backwards":a=Zf(t.child),a===null?(o=t.child,t.child=null):(o=a.sibling,a.sibling=null,Nd(t)),Ms(t,!0,o,null,l,n);break;case"unstable_legacy-backwards":for(a=null,o=t.child,t.child=null;o!==null;){if(e=o.alternate,e!==null&&bu(e)===null){t.child=o;break}e=o.sibling,o.sibling=a,a=o,o=e}Ms(t,!0,a,null,l,n);break;case"together":Ms(t,!1,null,null,void 0,n);break;case"independent":t.memoizedState=null;break;default:a=Zf(t.child),a===null?(o=t.child,t.child=null):(o=a.sibling,a.sibling=null),Ms(t,!1,o,a,l,n)}return t.child}function Kf(e,t,a){var n=t.pendingProps;return qn(t,t.type,n.value),Pe(e,t,n.children,a),t.child}function gn(e,t,a){if(e!==null&&(t.dependencies=e.dependencies),ni|=t.lanes,(a&t.childLanes)===0)if(e!==null){if(Ci(e,t,a,!1),(a&t.childLanes)===0)return null}else return null;if(e!==null&&t.child!==e.child)throw Error(A(153));if(t.child!==null){for(e=t.child,a=un(e,e.pendingProps),t.child=a,a.return=t;e.sibling!==null;)e=e.sibling,a=a.sibling=un(e,e.pendingProps),a.return=t;a.sibling=null}return t.child}function Cm(e,t){return(e.lanes&t)!==0?!0:(e=e.dependencies,!!(e!==null&&pu(e)))}function dN(e,t,a){switch(t.tag){case 3:lu(t,t.stateNode.containerInfo),qn(t,Xe,e.memoizedState.cache),ki();break;case 27:case 5:jd(t);break;case 4:lu(t,t.stateNode.containerInfo);break;case 10:qn(t,t.type,t.memoizedProps.value);break;case 31:if(t.memoizedState!==null)return t.flags|=128,sh(t),null;break;case 13:var n=t.memoizedState;if(n!==null){if(n.dehydrated!==null)return Qn(t),t.flags|=128,null;n=Ci(e,t,a,!1);var o=t.child.childLanes;return n||(a&o)!==0?wy(e,t,a):(Qn(t),e=gn(e,t,a),e!==null?e.sibling:null)}Qn(t);break;case 19:if(t.flags&128)return vh(e,t,a);if(o=(e.flags&128)!==0,n=(a&t.childLanes)!==0,n||(Ci(e,t,a,!1),n=(a&t.childLanes)!==0),o){if(n)return vh(e,t,a);t.flags|=128}if(o=t.memoizedState,o!==null&&(o.rendering=null,o.tail=null,o.lastEffect=null),cr(t,pt.current),n)break;return null;case 22:return t.lanes=0,yy(e,t,a,t.pendingProps);case 24:qn(t,Xe,e.memoizedState.cache)}return gn(e,t,a)}function $y(e,t,a){if(e!==null)if(e.memoizedProps!==t.pendingProps)Qe=!0;else{if(!Cm(e,a)&&(t.flags&128)===0)return Qe=!1,dN(e,t,a);Qe=(e.flags&131072)!==0}else Qe=!1,ie&&(t.flags&1048576)!==0&&Tv(t,rr,t.index);switch(t.lanes=0,t.tag){case 16:e:{var n=t.pendingProps;if(e=vi(t.elementType),t.type=e,typeof e=="function")lm(e)?(n=Ri(e,n),t.tag=1,t=jf(null,t,e,n,a)):(t.tag=0,t=ph(null,t,e,n,a));else{if(e!=null){var o=e.$$typeof;if(o===Qh){t.tag=11,t=Bf(null,t,e,n,a);break e}else if(o===Zh){t.tag=14,t=If(null,t,e,n,a);break e}else if(o===ja){t.tag=10,t.type=e,t=Kf(null,t,a);break e}}throw t=Gd(e)||e,Error(A(306,t,""))}}return t;case 0:return ph(e,t,t.type,t.pendingProps,a);case 1:return n=t.type,o=Ri(n,t.pendingProps),jf(e,t,n,o,a);case 3:e:{if(lu(t,t.stateNode.containerInfo),e===null)throw Error(A(387));n=t.pendingProps;var l=t.memoizedState;o=l.element,oh(e,t),Jl(t,n,null,a);var u=t.memoizedState;if(n=u.cache,qn(t,Xe,n),n!==l.cache&&nh(t,[Xe],a,!0),Kl(),n=u.element,l.isDehydrated)if(l={element:n,isDehydrated:!1,cache:u.cache},t.updateQueue.baseState=l,t.memoizedState=l,t.flags&256){t=Xf(e,t,n,a);break e}else if(n!==o){o=ga(Error(A(424)),t),sr(o),t=Xf(e,t,n,a);break e}else for(e=t.stateNode.containerInfo,e.nodeType===9?e=e.body:e=e.nodeName==="HTML"?e.ownerDocument.body:e,Oe=ba(e.firstChild),ot=t,ie=!0,Yn=null,fa=!0,a=Mv(t,null,n,a),t.child=a;a;)a.flags=a.flags&-3|134221824,a=a.sibling;else{if(ki(),n===o){t=gn(e,t,a);break e}Pe(e,t,n,a)}t=t.child}return t;case 26:return bo(e,t),e===null?(a=xb(t.type,null,t.pendingProps,null))?t.memoizedState=a:ie||(t.stateNode=cw(t.type,t.pendingProps,Gn.current,t)):t.memoizedState=xb(t.type,e.memoizedProps,t.pendingProps,e.memoizedState),null;case 27:return jd(t),e===null&&ie&&(n=t.stateNode=ww(t.type,t.pendingProps,Gn.current),ot=t,fa=!0,o=Oe,oi(t.type)?(Gh=o,Oe=ba(n.firstChild)):Oe=o),Pe(e,t,t.pendingProps.children,a),bo(e,t),e===null&&(t.flags|=4194304),t.child;case 5:return e===null&&ie&&((o=n=Oe)&&(n=nS(n,t.type,t.pendingProps,fa),n!==null?(t.stateNode=n,ot=t,Oe=ba(n.firstChild),fa=!1,o=!0):o=!1),o||ei(t)),jd(t),o=t.type,l=t.pendingProps,u=e!==null?e.memoizedProps:null,n=l.children,qh(o,l)?n=null:u!==null&&qh(o,u)&&(t.flags|=32),t.memoizedState!==null&&(o=gm(e,t,eN,null,null,a),Fo._currentValue=o),bo(e,t),Pe(e,t,n,a),t.child;case 6:return e===null&&ie&&((e=a=Oe)&&(a=iS(a,t.pendingProps,fa),a!==null?(t.stateNode=a,ot=t,Oe=null,e=!0):e=!1),e||ei(t)),null;case 13:return wy(e,t,a);case 4:return lu(t,t.stateNode.containerInfo),n=t.pendingProps,e===null?t.child=Mi(t,null,n,a):Pe(e,t,n,a),t.child;case 11:return Bf(e,t,t.type,t.pendingProps,a);case 7:return n=t.pendingProps,bo(e,t),Pe(e,t,n,a),t.child;case 8:return Pe(e,t,t.pendingProps.children,a),t.child;case 12:return Pe(e,t,t.pendingProps.children,a),t.child;case 10:return Kf(e,t,a);case 9:return o=t.type._context,n=t.pendingProps.children,Ai(t),o=ht(o),n=n(o),t.flags|=1,Pe(e,t,n,a),t.child;case 14:return If(e,t,t.type,t.pendingProps,a);case 15:return vy(e,t,t.type,t.pendingProps,a);case 19:return vh(e,t,a);case 31:return uN(e,t,a);case 22:return yy(e,t,a,t.pendingProps);case 24:return Ai(t),n=ht(Xe),e===null?(o=um(),o===null&&(o=Ee,l=sm(),o.pooledCache=l,l.refCount++,l!==null&&(o.pooledCacheLanes|=a),o=l),t.memoizedState={parent:n,cache:o},dm(t),qn(t,Xe,o)):((e.lanes&a)!==0&&(oh(e,t),Jl(t,null,null,a),Kl()),o=e.memoizedState,l=t.memoizedState,o.parent!==n?(o={parent:n,cache:n},t.memoizedState=o,t.lanes===0&&(t.memoizedState=t.updateQueue.baseState=o),qn(t,Xe,n)):(n=l.cache,qn(t,Xe,n),n!==o.cache&&nh(t,[Xe],a,!0))),Pe(e,t,t.pendingProps.children,a),t.child;case 30:return t.stateNode===null&&(t.stateNode={autoName:null,paired:null,clones:null,ref:null}),n=t.pendingProps,n.name!=null&&n.name!=="auto"?t.flags|=e===null?18882560:18874368:ie&&Iu(t),e!==null&&e.memoizedProps.name!==n.name?t.flags|=4194816:bo(e,t),Pe(e,t,n.children,a),t.child;case 29:throw t.pendingProps}throw Error(A(156,t.tag))}function ln(e){e.flags|=4}function Sd(e,t,a,n,o){var l;if((l=(e.mode&32)!==0)&&(l=a===null?Tb(t,n):Tb(t,n)&&(n.src!==a.src||n.srcSet!==a.srcSet)),l){if(e.flags|=16777216,(o&335544128)===o)if(e.stateNode.complete)e.flags|=8192;else if(Jy())e.flags|=8192;else throw Ti=gu,cm}else e.flags&=-16777217}function Jf(e,t){if(t.type!=="stylesheet"||(t.state.loading&4)!==0)e.flags&=-16777217;else if(e.flags|=16777216,!Sw(t))if(Jy())e.flags|=8192;else throw Ti=gu,cm}function Os(e,t){t!==null&&(e.flags|=4),e.flags&16384&&(t=e.tag!==22?Xb():536870912,e.lanes|=t,Xo|=t)}function Dl(e,t){if(!ie)switch(e.tailMode){case"visible":break;case"collapsed":for(var a=e.tail,n=null;a!==null;)a.alternate!==null&&(n=a),a=a.sibling;n===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:n.sibling=null;break;default:for(t=e.tail,a=null;t!==null;)t.alternate!==null&&(a=t),t=t.sibling;a===null?e.tail=null:a.sibling=null}}function Me(e){var t=e.alternate!==null&&e.alternate.child===e.child,a=0,n=0;if(t)for(var o=e.child;o!==null;)a|=o.lanes|o.childLanes,n|=o.subtreeFlags&1206910976,n|=o.flags&1206910976,o.return=e,o=o.sibling;else for(o=e.child;o!==null;)a|=o.lanes|o.childLanes,n|=o.subtreeFlags,n|=o.flags,o.return=e,o=o.sibling;return e.subtreeFlags|=n,e.childLanes=a,t}function hN(e,t,a){var n=t.pendingProps;switch(rm(t),t.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return Me(t),null;case 1:return Me(t),null;case 3:return a=t.stateNode,n=null,e!==null&&(n=e.memoizedState.cache),t.memoizedState.cache!==n&&(t.flags|=2048),cn(Xe),Lo(),a.pendingContext&&(a.context=a.pendingContext,a.pendingContext=null),(e===null||e.child===null)&&(go(t)?ln(t):e===null||e.memoizedState.isDehydrated&&(t.flags&256)===0||(t.flags|=1024,yd())),Me(t),null;case 26:var o=t.type,l=t.memoizedState;return e===null?(ln(t),l!==null?(Me(t),Jf(t,l)):(Me(t),Sd(t,o,null,n,a))):l?l!==e.memoizedState?(ln(t),Me(t),Jf(t,l)):(Me(t),t.flags&=-16777217):(e=e.memoizedProps,e!==n&&ln(t),Me(t),Sd(t,o,e,n,a)),null;case 27:if(ru(t),a=Gn.current,o=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==n&&ln(t);else{if(!n){if(t.stateNode===null)throw Error(A(166));return Me(t),t.subtreeFlags&=-33554433,null}e=Ka.current,go(t)?Nf(t,e):(e=ww(o,n,a),t.stateNode=e,ln(t))}return Me(t),t.subtreeFlags&=-33554433,null;case 5:if(ru(t),o=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==n&&ln(t);else{if(!n){if(t.stateNode===null)throw Error(A(166));return Me(t),t.subtreeFlags&=-33554433,null}if(l=Ka.current,go(t))Nf(t,l);else{var u=pr(Gn.current);switch(l){case 1:l=u.createElementNS("http://www.w3.org/2000/svg",o);break;case 2:l=u.createElementNS("http://www.w3.org/1998/Math/MathML",o);break;default:switch(o){case"svg":l=u.createElementNS("http://www.w3.org/2000/svg",o);break;case"math":l=u.createElementNS("http://www.w3.org/1998/Math/MathML",o);break;case"script":l=u.createElement("div"),l.innerHTML="<script><\/script>",l=l.removeChild(l.firstChild);break;case"select":l=typeof n.is=="string"?u.createElement("select",{is:n.is}):u.createElement("select"),n.multiple?l.multiple=!0:n.size&&(l.size=n.size);break;default:l=typeof n.is=="string"?u.createElement(o,{is:n.is}):u.createElement(o)}}l[dt]=t,l[Gt]=n;e:for(u=t.child;u!==null;){if(u.tag===5||u.tag===6)l.appendChild(u.stateNode);else if(u.tag!==4&&u.tag!==27&&u.child!==null){u.child.return=u,u=u.child;continue}if(u===t)break e;for(;u.sibling===null;){if(u.return===null||u.return===t)break e;u=u.return}u.sibling.return=u.return,u=u.sibling}t.stateNode=l;e:switch(gt(l,o,n),o){case"button":case"input":case"select":case"textarea":n=!!n.autoFocus;break e;case"img":n=!0;break e;default:n=!1}n&&ln(t)}}return Me(t),t.subtreeFlags&=-33554433,Sd(t,t.type,e===null?null:e.memoizedProps,t.pendingProps,a),null;case 6:if(e&&t.stateNode!=null)e.memoizedProps!==n&&ln(t);else{if(typeof n!="string"&&t.stateNode===null)throw Error(A(166));if(e=Gn.current,go(t)){if(e=t.stateNode,a=t.memoizedProps,n=null,o=ot,o!==null)switch(o.tag){case 27:case 5:n=o.memoizedProps}e[dt]=t,e=!!(e.nodeValue===a||n!==null&&n.suppressHydrationWarning===!0||sw(e.nodeValue,a)),e||ei(t,!0)}else e=pr(e).createTextNode(n),e[dt]=t,t.stateNode=e}return Me(t),null;case 31:if(a=t.memoizedState,e===null||e.memoizedState!==null){if(n=go(t),a!==null){if(e===null){if(!n)throw Error(A(318));if(e=t.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(A(557));e[dt]=t}else ki(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;Me(t),e=!1}else a=yd(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=a),e=!0;if(!e)return t.flags&256?(Kt(t),t):(Kt(t),null);if((t.flags&128)!==0)throw Error(A(558))}return Me(t),null;case 13:if(n=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(o=go(t),n!==null&&n.dehydrated!==null){if(e===null){if(!o)throw Error(A(318));if(o=t.memoizedState,o=o!==null?o.dehydrated:null,!o)throw Error(A(317));o[dt]=t}else ki(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;Me(t),o=!1}else o=yd(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=o),o=!0;if(!o)return t.flags&256?(Kt(t),t):(Kt(t),null)}return Kt(t),(t.flags&128)!==0?(t.lanes=a,t):(a=n!==null,e=e!==null&&e.memoizedState!==null,a&&(n=t.child,o=null,n.alternate!==null&&n.alternate.memoizedState!==null&&n.alternate.memoizedState.cachePool!==null&&(o=n.alternate.memoizedState.cachePool.pool),l=null,n.memoizedState!==null&&n.memoizedState.cachePool!==null&&(l=n.memoizedState.cachePool.pool),l!==o&&(n.flags|=2048)),a!==e&&a&&(t.child.flags|=8192),Os(t,t.updateQueue),Me(t),null);case 4:return Lo(),e===null&&Hm(t.stateNode.containerInfo),t.flags|=67108864,Me(t),null;case 10:return cn(t.type),Me(t),null;case 19:if(mm(t),n=t.memoizedState,n===null)return Me(t),null;if(o=(t.flags&128)!==0,l=n.rendering,l===null)if(o)Dl(n,!1);else{if(Ie!==0||e!==null&&(e.flags&128)!==0)for(e=t.child;e!==null;){if(l=bu(e),l!==null){for(t.flags|=128,Dl(n,!1),e=l.updateQueue,t.updateQueue=e,Os(t,e),t.subtreeFlags=0,e=a,a=t.child;a!==null;)Nv(a,e),a=a.sibling;return cr(t,pt.current&1|2),ie&&rn(t,n.treeForkCount),t.child}e=e.sibling}n.tail!==null&&Ft()>ku&&(t.flags|=128,o=!0,Dl(n,!1),t.lanes=4194304)}else{if(!o)if(e=bu(l),e!==null){if(t.flags|=128,o=!0,e=e.updateQueue,t.updateQueue=e,Os(t,e),Dl(n,!0),n.tail===null&&n.tailMode!=="collapsed"&&n.tailMode!=="visible"&&!l.alternate&&!ie)return Me(t),null}else 2*Ft()-n.renderingStartTime>ku&&a!==536870912&&(t.flags|=128,o=!0,Dl(n,!1),t.lanes=4194304);n.isBackwards?(l.sibling=t.child,t.child=l):(e=n.last,e!==null?e.sibling=l:t.child=l,n.last=l)}if(n.tail!==null){e=n.tail;e:{for(a=e;a!==null;){if(a.alternate!==null){a=!1;break e}a=a.sibling}a=!0}return n.rendering=e,n.tail=e.sibling,n.renderingStartTime=Ft(),e.sibling=null,l=pt.current,l=o?l&1|2:l&1,n.tailMode==="visible"||n.tailMode==="collapsed"||!a||ie?cr(t,l):(a=l,Re(ft,t),Re(pt,a),xt===null&&(xt=t)),ie&&rn(t,n.treeForkCount),e}return Me(t),null;case 22:case 23:return Kt(t),hm(),n=t.memoizedState!==null,e!==null?e.memoizedState!==null!==n&&(t.flags|=8192):n&&(t.flags|=8192),n?(a&536870912)!==0&&(t.flags&128)===0&&(Me(t),t.subtreeFlags&6&&(t.flags|=8192)):Me(t),a=t.updateQueue,a!==null&&Os(t,a.retryQueue),a=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),n=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(n=t.memoizedState.cachePool.pool),n!==a&&(t.flags|=2048),e!==null&&mt(Si),null;case 24:return a=null,e!==null&&(a=e.memoizedState.cache),t.memoizedState.cache!==a&&(t.flags|=2048),cn(Xe),Me(t),null;case 25:return null;case 30:return t.flags|=33554432,Me(t),null}throw Error(A(156,t.tag))}function mN(e,t){switch(rm(t),t.tag){case 1:return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return cn(Xe),Lo(),e=t.flags,(e&65536)!==0&&(e&128)===0?(t.flags=e&-65537|128,t):null;case 26:case 27:case 5:return ru(t),null;case 31:if(t.memoizedState!==null){if(Kt(t),t.alternate===null)throw Error(A(340));ki()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 13:if(Kt(t),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(A(340));ki()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return mm(t),e=t.flags,e&65536?(t.flags=e&-65537|128,e=t.memoizedState,e!==null&&(e.rendering=null,e.tail=null),t.flags|=4,t):null;case 4:return Lo(),null;case 10:return cn(t.type),null;case 22:case 23:return Kt(t),hm(),e!==null&&mt(Si),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 24:return cn(Xe),null;case 25:return null;default:return null}}function xy(e,t){switch(rm(t),t.tag){case 3:cn(Xe),Lo();break;case 26:case 27:case 5:ru(t);break;case 4:Lo();break;case 31:t.memoizedState!==null&&Kt(t);break;case 13:Kt(t);break;case 19:mm(t);break;case 10:cn(t.type);break;case 22:case 23:Kt(t),hm(),e!==null&&mt(Si);break;case 24:cn(Xe)}}function kr(e,t){try{var a=t.updateQueue,n=a!==null?a.lastEffect:null;if(n!==null){var o=n.next;a=o;do{if((a.tag&e)===e){n=void 0;var l=a.create,u=a.inst;n=l(),u.destroy=n}a=a.next}while(a!==o)}}catch(c){we(t,t.return,c)}}function ai(e,t,a){try{var n=t.updateQueue,o=n!==null?n.lastEffect:null;if(o!==null){var l=o.next;n=l;do{if((n.tag&e)===e){var u=n.inst,c=u.destroy;if(c!==void 0){u.destroy=void 0,o=t;var h=a,g=c;try{g()}catch(v){we(o,h,v)}}}n=n.next}while(n!==l)}}catch(v){we(t,t.return,v)}}function Ny(e){var t=e.updateQueue;if(t!==null){var a=e.stateNode;try{Rv(t,a)}catch(n){we(e,e.return,n)}}}function Sy(e,t,a){a.props=Ri(e.type,e.memoizedProps),a.state=e.memoizedState;try{a.componentWillUnmount()}catch(n){we(e,t,n)}}function Ga(e,t){try{var a=e.ref;if(a!==null){switch(e.tag){case 26:case 27:case 5:var n=e.stateNode;break;case 30:var o=e.stateNode,l=hn(e.memoizedProps,o);(o.ref===null||o.ref.name!==l)&&(o.ref=pw(l)),n=o.ref;break;case 7:if(e.stateNode===null){var u=new na(e);Lt(e.child,!1,tS,u,void 0,void 0),e.stateNode=u}n=e.stateNode;break;default:n=e.stateNode}typeof a=="function"?e.refCleanup=a(n):a.current=n}}catch(c){we(e,t,c)}}function ct(e,t){var a=e.ref,n=e.refCleanup;if(a!==null)if(typeof n=="function")try{n()}catch(o){we(e,t,o)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof a=="function")try{a(null)}catch(o){we(e,t,o)}else a.current=null}function xu(e,t){if((e.tag===5||e.tag===27||e.tag===6)&&e.alternate===null&&t!==null)for(var a=0;a<t.length;a++)vw(e.stateNode,t[a])}function Pf(e){for(var t=e.return;t!==null&&(zm(t)&&vw(e.stateNode,t.stateNode),!Am(t));)t=t.return}function Wl(e){for(var t=e.return;t!==null&&(zm(t)&&aS(e.stateNode,t.stateNode),!Am(t));)t=t.return}function Am(e){return e.tag===5||e.tag===3||e.tag===27}function zm(e){return e&&e.tag===7&&e.stateNode!==null}function yh(e){var t=e.type,a=e.memoizedProps,n=e.stateNode;try{e:switch(t){case"button":case"input":case"select":case"textarea":a.autoFocus&&n.focus();break e;case"img":a.src?n.src=a.src:a.srcSet&&(n.srcset=a.srcSet)}}catch(o){we(e,e.return,o)}}function Td(e,t,a){try{var n=e.stateNode;HN(n,e.type,a,t),n[Gt]=t}catch(o){we(e,e.return,o)}}function Ty(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&oi(e.type)||e.tag===4}function Ed(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||Ty(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&oi(e.type)||e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function wh(e,t,a,n){var o=e.tag;if(o===5||o===6)o=e.stateNode,t?(a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a).insertBefore(o,t):(t=a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a,t.appendChild(o),a=a._reactRootContainer,a!=null||t.onclick!==null||(t.onclick=Xa)),xu(e,n),he=!0;else if(o!==4&&(o===27&&(xu(e,n),n=null,oi(e.type)&&(a=e.stateNode,t=null)),e=e.child,e!==null))for(wh(e,t,a,n),e=e.sibling;e!==null;)wh(e,t,a,n),e=e.sibling}function Nu(e,t,a,n){var o=e.tag;if(o===5||o===6)o=e.stateNode,t?a.insertBefore(o,t):a.appendChild(o),xu(e,n),he=!0;else if(o!==4&&(o===27&&(xu(e,n),n=null,oi(e.type)&&(a=e.stateNode)),e=e.child,e!==null))for(Nu(e,t,a,n),e=e.sibling;e!==null;)Nu(e,t,a,n),e=e.sibling}function Ey(e){var t=e.stateNode,a=e.memoizedProps;try{for(var n=e.type,o=t.attributes;o.length;)t.removeAttributeNode(o[0]);gt(t,n,a),t[dt]=e,t[Gt]=a}catch(l){we(e,e.return,l)}}var Su=!1,Jt=null;function Ff(e){(e.tag===30||(e.subtreeFlags&33554432)!==0)&&(Su=!0)}var Ya=null;function Wf(){var e=Ya;return Ya=null,e}var qt=0;function il(e,t,a,n,o){return qt=0,ky(e.child,t,a,n,o)}function ky(e,t,a,n,o){for(var l=!1;e!==null;){if(e.tag===5){var u=e.stateNode;if(n!==null){var c=Bh(u);n.push(c),c.view&&(l=!0)}else l||Bh(u).view&&(l=!0);Su=!0,dw(u,qt===0?t:t+"_"+qt,a),qt++}else(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&o||ky(e.child,t,a,n,o)&&(l=!0));e=e.sibling}return l}function Pa(e,t){for(;e!==null;)e.tag===5?hw(e.stateNode,e.memoizedProps):(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&t||Pa(e.child,t)),e=e.sibling}function Js(e){if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if((e.tag!==22||e.memoizedState===null)&&(Js(e),e.tag===30&&(e.flags&18874368)!==0&&e.stateNode.paired)){var t=e.memoizedProps;if(t.name==null||t.name==="auto")throw Error(A(544));var a=t.name;t=vn(t.default,t.share),t!=="none"&&(il(e,a,t,null,!1)||Pa(e.child,!1))}e=e.sibling}}function $h(e,t){if(e.tag===30){var a=e.stateNode,n=e.memoizedProps,o=hn(n,a),l=vn(n.default,a.paired?n.share:n.enter);l!=="none"?il(e,o,l,null,!1)?(Js(e),a.paired||t||Qo(e,n.onEnter)):Pa(e.child,!1):Js(e)}else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)$h(e,t),e=e.sibling;else Js(e)}function xh(e){if(Jt!==null&&Jt.size!==0){var t=Jt;if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&(e.flags&18874368)!==0){var a=e.memoizedProps,n=a.name;if(n!=null&&n!=="auto"){var o=t.get(n);if(o!==void 0){var l=vn(a.default,a.share);if(l!=="none"&&(il(e,n,l,null,!1)?(l=e.stateNode,o.paired=l,l.paired=o,Qo(e,a.onShare)):Pa(e.child,!1)),t.delete(n),t.size===0)break}}}xh(e)}e=e.sibling}}}function Nh(e){if(e.tag===30){var t=e.memoizedProps,a=hn(t,e.stateNode),n=Jt!==null?Jt.get(a):void 0,o=vn(t.default,n!==void 0?t.share:t.exit);o!=="none"&&(il(e,a,o,null,!1)?n!==void 0?(o=e.stateNode,n.paired=o,o.paired=n,Jt.delete(a),Qo(e,t.onShare)):Qo(e,t.onExit):Pa(e.child,!1)),Jt!==null&&xh(e)}else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)Nh(e),e=e.sibling;else Jt!==null&&xh(e)}function Cy(e){for(e=e.child;e!==null;){if(e.tag===30){var t=e.memoizedProps,a=hn(t,e.stateNode);t=vn(t.default,t.update),e.flags&=-5,t!=="none"&&il(e,a,t,e.memoizedState=[],!1)}else(e.subtreeFlags&33554432)!==0&&Cy(e);e=e.sibling}}function Sh(e){if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&(e.flags&18874368)!==0){var t=e.stateNode;t.paired!==null&&(t.paired=null,Pa(e.child,!1))}Sh(e)}e=e.sibling}}function Ps(e){if(e.tag===30)e.stateNode.paired=null,Pa(e.child,!1),Sh(e);else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)Ps(e),e=e.sibling;else Sh(e)}function Ay(e){for(e=e.child;e!==null;)e.tag===30?Pa(e.child,!1):(e.subtreeFlags&33554432)!==0&&Ay(e),e=e.sibling}function Mm(e,t,a,n,o,l,u){for(var c=!1;t!==null;){if(t.tag===5){var h=t.stateNode;if(l!==null&&qt<l.length){var g=l[qt],v=Bh(h);(g.view||v.view)&&(c=!0);var x;if(x=(e.flags&4)===0)if(v.clip)x=!0;else{x=g.rect;var f=v.rect;x=x.y!==f.y||x.x!==f.x||x.height!==f.height||x.width!==f.width}x&&(e.flags|=4),v.abs?v=!g.abs:(g=g.rect,v=v.rect,v=g.height!==v.height||g.width!==v.width),v&&(e.flags|=32)}else e.flags|=32;(e.flags&4)!==0&&dw(h,qt===0?a:a+"_"+qt,o),c&&(e.flags&4)!==0||(Ya===null&&(Ya=[]),Ya.push(h,qt===0?n:n+"_"+qt,t.memoizedProps)),qt++}else(t.tag!==22||t.memoizedState===null)&&(t.tag===30&&u?e.flags|=t.flags&32:Mm(e,t.child,a,n,o,l,u)&&(c=!0));t=t.sibling}return c}function zy(e,t){for(e=e.child;e!==null;){if(e.tag===30){var a=e.memoizedProps,n=e.stateNode,o=hn(a,n),l=vn(a.default,a.update);if(t){n=n.clones;var u=n===null?null:n.map(GN)}else u=e.memoizedState,e.memoizedState=null;n=e;var c=e.child;qt=0,o=Mm(n,c,o,o,l,u,!1),(e.flags&4)!==0&&o&&(t||Qo(e,a.onUpdate))}else(e.subtreeFlags&33554432)!==0&&zy(e,t);e=e.sibling}}var at=!1,fe=!1,Ba=!1,kd=!1,eb=typeof WeakSet=="function"?WeakSet:Set,nt=null,Ia=!1,Gl=!1,Tu=!1,Th=!1;function pN(e,t,a){if(e=e.containerInfo,Hh=Wo,e=gv(e),nm(e)){if("selectionStart"in e)var n={start:e.selectionStart,end:e.selectionEnd};else e:{n=(n=e.ownerDocument)&&n.defaultView||window;var o=n.getSelection&&n.getSelection();if(o&&o.rangeCount!==0){n=o.anchorNode;var l=o.anchorOffset,u=o.focusNode;o=o.focusOffset;try{n.nodeType,u.nodeType}catch{n=null;break e}var c=0,h=-1,g=-1,v=0,x=0,f=e,w=null;t:for(;;){for(var z;f!==n||l!==0&&f.nodeType!==3||(h=c+l),f!==u||o!==0&&f.nodeType!==3||(g=c+o),f.nodeType===3&&(c+=f.nodeValue.length),(z=f.firstChild)!==null;)w=f,f=z;for(;;){if(f===e)break t;if(w===n&&++v===l&&(h=c),w===u&&++x===o&&(g=c),(z=f.nextSibling)!==null)break;f=w,w=f.parentNode}f=z}n=h===-1||g===-1?null:{start:h,end:g}}else n=null}n=n||{start:0,end:0}}else n=null;for(Uh={focusedElem:e,selectionRange:n},Wo=!1,a=(a&335544064)===a,nt=t,t=a?9270:1024;nt!==null;){if(e=nt,a&&(n=e.deletions,n!==null))for(l=0;l<n.length;l++)a&&Nh(n[l]);if(e.alternate===null&&(e.flags&2)!==0)a&&Ff(e),Rs(a);else{if(e.tag===22){if(n=e.alternate,e.memoizedState!==null){n!==null&&n.memoizedState===null&&a&&Nh(n),Rs(a);continue}else if(n!==null&&n.memoizedState!==null){a&&Ff(e),Rs(a);continue}}n=e.child,(e.subtreeFlags&t)!==0&&n!==null?(n.return=e,nt=n):(a&&Cy(e),Rs(a))}}Jt=null}function Rs(e){for(;nt!==null;){var t=nt,a=e,n=t.alternate,o=t.flags;switch(t.tag){case 0:case 11:case 15:break;case 1:if((o&1024)!==0&&n!==null){a=void 0,o=n.memoizedProps,n=n.memoizedState;var l=t.stateNode;try{var u=Ri(t.type,o);a=l.getSnapshotBeforeUpdate(u,n),l.__reactInternalSnapshotBeforeUpdate=a}catch(c){we(t,t.return,c)}}break;case 3:if((o&1024)!==0){if(n=t.stateNode.containerInfo,a=n.nodeType,a===9)Ih(n);else if(a===1)switch(n.nodeName){case"HEAD":case"HTML":case"BODY":Ih(n);break;default:n.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;case 30:a&&n!==null&&(a=hn(n.memoizedProps,n.stateNode),o=t.memoizedProps,o=vn(o.default,o.update),o!=="none"&&il(n,a,o,n.memoizedState=[],!0));break;default:if((o&1024)!==0)throw Error(A(163))}if(n=t.sibling,n!==null){n.return=t.return,nt=n;break}nt=t.return}}function My(e,t,a){var n=a.flags;switch(a.tag){case 0:case 11:case 15:La(e,a),n&4&&kr(5,a);break;case 1:if(La(e,a),n&4)if(e=a.stateNode,t===null)try{e.componentDidMount()}catch(u){we(a,a.return,u)}else{var o=Ri(a.type,t.memoizedProps);t=t.memoizedState;try{e.componentDidUpdate(o,t,e.__reactInternalSnapshotBeforeUpdate)}catch(u){we(a,a.return,u)}}n&64&&Ny(a),n&512&&Ga(a,a.return);break;case 3:if(La(e,a),n&64&&(e=a.updateQueue,e!==null)){if(t=null,a.child!==null)switch(a.child.tag){case 27:case 5:t=a.child.stateNode;break;case 1:t=a.child.stateNode}try{Rv(e,t)}catch(u){we(a,a.return,u)}}break;case 27:t===null&&n&4&&Ey(a);case 26:case 5:La(e,a),t===null&&n&4&&yh(a),n&512&&Ga(a,a.return);break;case 12:La(e,a);break;case 31:La(e,a),n&4&&Dy(e,a);break;case 13:La(e,a),n&4&&_y(e,a),n&64&&(e=a.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(a=EN.bind(null,a),oS(e,a))));break;case 22:if(n=a.memoizedState!==null||at,!n){var l=t!==null&&t.memoizedState!==null||fe;t=at,o=fe,at=n,(fe=l)&&!o?(n=2,(a.subtreeFlags&8772)!==0&&(n|=1),ka(e,a,n)):La(e,a),at=t,fe=o}break;case 30:La(e,a),n&512&&Ga(a,a.return);break;case 7:n&512&&Ga(a,a.return);default:La(e,a)}}function Eh(e,t){for(e=e.child;e!==null;)Oy(e,t),e=e.sibling}function Oy(e,t){switch(e.tag){case 5:case 26:try{var a=e.stateNode;if(t){var n=a.style;typeof n.setProperty=="function"?n.setProperty("display","none","important"):n.display="none"}else{var o=e.stateNode,l=e.memoizedProps.style,u=l!=null&&l.hasOwnProperty("display")?l.display:null;o.style.display=u==null||typeof u=="boolean"?"":(""+u).trim()}}catch(h){we(e,e.return,h)}kh(e,t);break;case 6:try{e.stateNode.nodeValue=t?"":e.memoizedProps,he=!0}catch(h){we(e,e.return,h)}break;case 18:try{var c=e.stateNode;t?fb(c,!0):fb(e.stateNode,!1)}catch(h){we(e,e.return,h)}break;case 22:case 23:e.memoizedState===null&&Eh(e,t);break;default:Eh(e,t)}}function kh(e,t){if(e.subtreeFlags&67108864)for(e=e.child;e!==null;){e:{var a=e,n=t;switch(a.tag){case 4:Oy(a,n);break e;case 22:a.memoizedState===null&&kh(a,n);break e;default:kh(a,n)}}e=e.sibling}}function Ry(e){var t=e.alternate;t!==null&&(e.alternate=null,Ry(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&Du(t)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var _e=null,Ht=!1;function Ea(e,t,a){for(a=a.child;a!==null;)Vy(e,t,a),a=a.sibling}function Vy(e,t,a){if(Wt&&typeof Wt.onCommitFiberUnmount=="function")try{Wt.onCommitFiberUnmount(wr,a)}catch{}switch(a.tag){case 26:fe||ct(a,t),Ea(e,t,a),a.memoizedState?a.memoizedState.count--:a.stateNode&&!fe&&(a=a.stateNode,a.parentNode.removeChild(a));break;case 27:fe||ct(a,t),Wl(a);var n=_e,o=Ht;oi(a.type)&&(_e=a.stateNode,Ht=!1),Ea(e,t,a),$w(a.stateNode,a.type,a.memoizedProps),_e=n,Ht=o;break;case 5:fe||ct(a,t),Wl(a);case 6:if(a.tag===6&&Wl(a),n=_e,o=Ht,_e=null,Ea(e,t,a),_e=n,Ht=o,_e!==null)if(Ht)try{(_e.nodeType===9?_e.body:_e.nodeName==="HTML"?_e.ownerDocument.body:_e).removeChild(a.stateNode),he=!0}catch(l){we(a,t,l)}else try{_e.removeChild(a.stateNode),he=!0}catch(l){we(a,t,l)}break;case 18:_e!==null&&(Ht?(e=_e,gb(e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,a.stateNode),el(e)):gb(_e,a.stateNode));break;case 4:n=_e,o=Ht,_e=a.stateNode.containerInfo,Ht=!0,Ea(e,t,a),_e=n,Ht=o;break;case 0:case 11:case 14:case 15:ai(2,a,t),fe||ai(4,a,t),Ea(e,t,a);break;case 1:fe||(ct(a,t),n=a.stateNode,typeof n.componentWillUnmount=="function"&&Sy(a,t,n)),Ea(e,t,a);break;case 21:Ea(e,t,a);break;case 22:fe=(n=fe)||a.memoizedState!==null,Ea(e,t,a),fe=n;break;case 30:ct(a,t),Ea(e,t,a);break;case 7:fe||ct(a,t),Ea(e,t,a);break;default:Ea(e,t,a)}}function Dy(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{el(e)}catch(a){we(t,t.return,a)}}}function _y(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{el(e)}catch(a){we(t,t.return,a)}}function gN(e){switch(e.tag){case 31:case 13:case 19:var t=e.stateNode;return t===null&&(t=e.stateNode=new eb),t;case 22:return e=e.stateNode,t=e._retryCache,t===null&&(t=e._retryCache=new eb),t;default:throw Error(A(435,e.tag))}}function Vs(e,t){var a=gN(e);t.forEach(function(n){if(!a.has(n)){a.add(n);var o=kN.bind(null,e,n);n.then(o,o)}})}function At(e,t,a){var n=t.deletions;if(n!==null)for(var o=0;o<n.length;o++){var l=n[o],u=e,c=t,h=c;e:for(;h!==null;){switch(h.tag){case 27:if(oi(h.type)){_e=h.stateNode,Ht=!1;break e}break;case 5:_e=h.stateNode,Ht=!1;break e;case 3:case 4:_e=h.stateNode.containerInfo,Ht=!0;break e}h=h.return}if(_e===null)throw Error(A(160));Vy(u,c,l),_e=null,Ht=!1,u=l.alternate,u!==null&&(u.return=null),l.return=null}if(t.subtreeFlags&13886)for(t=t.child;t!==null;)Hy(t,e,a),t=t.sibling}var Ca=null;function Hy(e,t,a){var n=e.alternate,o=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:if(o&4&&(n=e.updateQueue,n=n!==null?n.events:null,n!==null))for(var l=0;l<n.length;l++){var u=n[l];u.ref.impl=u.nextImpl}At(t,e,a),zt(e),o&4&&(ai(3,e,e.return),kr(3,e),ai(5,e,e.return));break;case 1:At(t,e,a),zt(e),o&512&&(fe||n===null||ct(n,n.return)),o&64&&at&&(e=e.updateQueue,e!==null&&(t=e.callbacks,t!==null&&(a=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=a===null?t:a.concat(t))));break;case 26:if(l=Ca,At(t,e,a),zt(e),o&512&&(fe||n===null||ct(n,n.return)),o&4)if(o=n!==null?n.memoizedState:null,a=e.memoizedState,n===null)if(a===null)if(e.stateNode===null)if(at)e.stateNode=cw(e.type,e.memoizedProps,t.containerInfo,e);else{e:{t=e.type,a=e.memoizedProps,o=l.ownerDocument||l;t:switch(t){case"title":n=o.getElementsByTagName("title")[0],(!n||n[Nr]||n[dt]||n.namespaceURI==="http://www.w3.org/2000/svg"||n.hasAttribute("itemprop"))&&(n=o.createElement(t),o.head.insertBefore(n,o.querySelector("head > title"))),gt(n,t,a),n[dt]=e,it(n),t=n;break e;case"link":if(l=Sb("link","href",o).get(t+(a.href||""))){for(u=0;u<l.length;u++)if(n=l[u],n.getAttribute("href")===(a.href==null||a.href===""?null:a.href)&&n.getAttribute("rel")===(a.rel==null?null:a.rel)&&n.getAttribute("title")===(a.title==null?null:a.title)&&n.getAttribute("crossorigin")===(a.crossOrigin==null?null:a.crossOrigin)){l.splice(u,1);break t}}n=o.createElement(t),gt(n,t,a),o.head.appendChild(n);break;case"meta":if(l=Sb("meta","content",o).get(t+(a.content||""))){for(u=0;u<l.length;u++)if(n=l[u],n.getAttribute("content")===(a.content==null?null:""+a.content)&&n.getAttribute("name")===(a.name==null?null:a.name)&&n.getAttribute("property")===(a.property==null?null:a.property)&&n.getAttribute("http-equiv")===(a.httpEquiv==null?null:a.httpEquiv)&&n.getAttribute("charset")===(a.charSet==null?null:a.charSet)){l.splice(u,1);break t}}n=o.createElement(t),gt(n,t,a),o.head.appendChild(n);break;default:throw Error(A(468,t))}n[dt]=e,it(n),t=n}e.stateNode=t}else at||Yh(l,e.type,e.stateNode);else e.stateNode=Nb(l,a,e.memoizedProps);else o!==a?(o===null?(t=n.stateNode,t===null||fe||t.parentNode.removeChild(t)):o.count--,a===null?at||Yh(l,e.type,e.stateNode):Nb(l,a,e.memoizedProps)):a===null&&e.stateNode!==null&&Td(e,e.memoizedProps,n.memoizedProps);break;case 27:At(t,e,a),zt(e),o&512&&(fe||n===null||ct(n,n.return)),n!==null&&o&4&&Td(e,e.memoizedProps,n.memoizedProps);break;case 5:if(l=Ba,Ba=!1,At(t,e,a),Ba=l,zt(e),o&512&&(fe||n===null||ct(n,n.return)),e.flags&32){t=e.stateNode;try{Yo(t,""),he=!0}catch(v){we(e,e.return,v)}}o&4&&e.stateNode!=null&&(t=e.memoizedProps,Td(e,t,n!==null?n.memoizedProps:t)),o&1024&&(kd=!0);break;case 6:if(At(t,e,a),zt(e),o&4){if(e.stateNode===null)throw Error(A(162));t=e.memoizedProps,a=e.stateNode;try{a.nodeValue=t,he=!0}catch(v){we(e,e.return,v)}}break;case 3:if(he=!1,tu=null,l=Ca,Ca=gr(t.containerInfo),At(t,e,a),Ca=l,zt(e),o&4&&n!==null&&n.memoizedState.isDehydrated)try{el(t.containerInfo)}catch(v){we(e,e.return,v)}kd&&(kd=!1,Uy(e)),he=!1;break;case 4:o=Ba,Ba=at,n=lf(),l=Ca,Ca=gr(e.stateNode.containerInfo),At(t,e,a),zt(e),Ca=l,he&&Gl&&(Tu=!0),he=n,Ba=o;break;case 12:At(t,e,a),zt(e);break;case 31:At(t,e,a),zt(e),o&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,Vs(e,t)));break;case 13:At(t,e,a),zt(e),e.child.flags&8192&&e.memoizedState!==null!=(n!==null&&n.memoizedState!==null)&&(Zu=Ft()),o&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,Vs(e,t)));break;case 22:l=e.memoizedState!==null,u=n!==null&&n.memoizedState!==null;var c=at,h=fe,g=Ba;at=c||l,Ba=g||l,fe=h||u,At(t,e,a),fe=h,Ba=g,at=c,zt(e),o&8192&&(t=e.stateNode,t._visibility=l?t._visibility&-2:t._visibility|1,!l||n===null||u||at||fe||(t=u||fe,a=at,n=fe,at=l||at,fe=t,Rn(e,2),at=a,fe=n),!l&&Ba||Eh(e,l)),o&4&&(t=e.updateQueue,t!==null&&(a=t.retryQueue,a!==null&&(t.retryQueue=null,Vs(e,a))));break;case 19:At(t,e,a),zt(e),o&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,Vs(e,t)));break;case 30:o&512&&(fe||n===null||ct(n,n.return)),o=lf(),l=Gl,u=(a&335544064)===a,c=e.memoizedProps,Gl=u&&vn(c.default,c.update)!=="none",At(t,e,a),zt(e),u&&n!==null&&he&&(e.flags|=4),Gl=l,he=o;break;case 21:break;case 7:o&512&&(fe||n===null||ct(n,n.return)),n&&n.stateNode!==null&&(n.stateNode._fragmentFiber=e);default:At(t,e,a),zt(e)}}function zt(e){var t=e.flags;if(t&2){try{for(var a,n=e.return;n!==null;){if(Ty(n)){a=n;break}n=n.return}n=null;for(var o=e.return;o!==null;){if(zm(o)){var l=o.stateNode;n===null?n=[l]:n.push(l)}if(Am(o))break;o=o.return}var u=n;if(a==null)throw Error(A(160));switch(a.tag){case 27:var c=a.stateNode,h=Ed(e);Nu(e,h,c,u);break;case 5:var g=a.stateNode;a.flags&32&&(Yo(g,""),a.flags&=-33);var v=Ed(e);Nu(e,v,g,u);break;case 3:case 4:var x=a.stateNode.containerInfo,f=Ed(e);wh(e,f,x,u);break;default:throw Error(A(161))}}catch(w){we(e,e.return,w)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function Uy(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var t=e;Uy(t),t.tag===5&&t.flags&1024&&(t=t.stateNode,Wo=!0,t.reset(),Wo=!1),e=e.sibling}}function fo(e,t){if(t.subtreeFlags&9270)for(t=t.child;t!==null;)qy(t,e),t=t.sibling;else zy(t,!1)}function qy(e,t){var a=e.alternate;if(a===null)$h(e,!1);else switch(e.tag){case 3:if(Th=Ia=!1,Wf(),fo(t,e),!Ia&&!Tu){if(e=Ya,e!==null)for(var n=0;n<e.length;n+=3){a=e[n];var o=e[n+1];hw(a,e[n+2]),a=a.ownerDocument.documentElement,a!==null&&a.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group("+o+")"})}e=t.containerInfo,e=e.nodeType===9?e.documentElement:e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName===""&&(e.style.viewTransitionName="none",e.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group(root)"}),e.animate({width:[0,0],height:[0,0]},{duration:0,fill:"forwards",pseudoElement:"::view-transition"})),Th=!0}Ya=null;break;case 5:fo(t,e);break;case 4:n=Ia,Ia=!1,fo(t,e),Ia&&(Tu=!0),Ia=n;break;case 22:e.memoizedState===null&&(a.memoizedState!==null?$h(e,!1):fo(t,e));break;case 30:n=Ia,o=Wf(),Ia=!1,fo(t,e),Ia&&(e.flags|=4);var l=e.memoizedProps,u=e.stateNode;t=hn(l,u),u=hn(a.memoizedProps,u);var c=vn(l.default,l.update);c==="none"?t=!1:(l=a.memoizedState,a.memoizedState=null,a=e.child,qt=0,t=Mm(e,a,t,u,c,l,!0),qt!==(l===null?0:l.length)&&(e.flags|=32)),(e.flags&4)!==0&&t?(Qo(e,e.memoizedProps.onUpdate),Ya=o):o!==null&&(o.push.apply(o,Ya),Ya=o),Ia=(e.flags&32)!==0?!0:n;break;default:fo(t,e)}}function La(e,t){if(t.subtreeFlags&8772)for(t=t.child;t!==null;)My(e,t.alternate,t),t=t.sibling}function Rn(e,t){for(e=e.child;e!==null;){var a=e,n=t;switch(a.tag){case 0:case 11:case 14:case 15:ai(4,a,a.return),Rn(a,n);break;case 1:ct(a,a.return);var o=a.stateNode;typeof o.componentWillUnmount=="function"&&Sy(a,a.return,o),Rn(a,n);break;case 27:(n&2)!==0&&$w(a.stateNode,a.type,a.memoizedProps);case 5:ct(a,a.return),a.tag!==5&&a.tag!==27||Wl(a),Rn(a,n);break;case 6:Wl(a);break;case 26:ct(a,a.return),o=a.stateNode,a.memoizedState!==null||o===null||fe||o.parentNode.removeChild(o),Rn(a,n);break;case 22:a.memoizedState===null&&Rn(a,n);break;case 30:ct(a,a.return),Rn(a,n);break;case 7:ct(a,a.return);default:Rn(a,n)}e=e.sibling}}function ka(e,t,a){for(a=(t.subtreeFlags&8772)!==0?a:a&-2,t=t.child;t!==null;){var n=t.alternate,o=e,l=t,u=l.flags,c=(a&1)!==0;switch(l.tag){case 0:case 11:case 15:ka(o,l,a),kr(4,l);break;case 1:if(ka(o,l,a),n=l,o=n.stateNode,typeof o.componentDidMount=="function")try{o.componentDidMount()}catch(v){we(n,n.return,v)}if(n=l,o=n.updateQueue,o!==null){var h=n.stateNode;try{var g=o.shared.hiddenCallbacks;if(g!==null)for(o.shared.hiddenCallbacks=null,o=0;o<g.length;o++)Ov(g[o],h)}catch(v){we(n,n.return,v)}}c&&u&64&&Ny(l),Ga(l,l.return);break;case 27:(a&2)!==0&&Ey(l);case 5:l.tag!==5&&l.tag!==27||Pf(l),ka(o,l,a),c&&n===null&&u&4&&yh(l),Ga(l,l.return);break;case 6:Pf(l);break;case 26:h=l.stateNode,l.memoizedState!==null||h===null||at||Yh(gr(h.ownerDocument),l.type,h),ka(o,l,a),c&&n===null&&u&4&&yh(l),Ga(l,l.return);break;case 12:ka(o,l,a);break;case 31:ka(o,l,a),c&&u&4&&Dy(o,l);break;case 13:ka(o,l,a),c&&u&4&&_y(o,l);break;case 22:l.memoizedState===null&&ka(o,l,a),Ga(l,l.return);break;case 30:ka(o,l,a),Ga(l,l.return);break;case 7:Ga(l,l.return);default:ka(o,l,a)}t=t.sibling}}function Om(e,t){var a=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),e=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(e=t.memoizedState.cachePool.pool),e!==a&&(e!=null&&e.refCount++,a!=null&&Tr(a))}function Rm(e,t){e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&Tr(e))}function ca(e,t,a,n){var o=(a&335544064)===a;if(t.subtreeFlags&(o?10262:10256))for(t=t.child;t!==null;)By(e,t,a,n),t=t.sibling;else o&&Ay(t)}function By(e,t,a,n){var o=(a&335544064)===a;o&&t.alternate===null&&t.return!==null&&t.return.alternate!==null&&Ps(t);var l=t.flags;switch(t.tag){case 0:case 11:case 15:ca(e,t,a,n),l&2048&&kr(9,t);break;case 1:ca(e,t,a,n);break;case 3:ca(e,t,a,n),o&&Th&&(e=e.containerInfo,e=e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,e.style.viewTransitionName==="root"&&(e.style.viewTransitionName=""),e=e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName==="none"&&(e.style.viewTransitionName="")),l&2048&&(l=null,t.alternate!==null&&(l=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==l&&(t.refCount++,l!=null&&Tr(l)));break;case 12:if(l&2048){ca(e,t,a,n),l=t.stateNode;try{var u=t.memoizedProps,c=u.id,h=u.onPostCommit;typeof h=="function"&&h(c,t.alternate===null?"mount":"update",l.passiveEffectDuration,-0)}catch(g){we(t,t.return,g)}}else ca(e,t,a,n);break;case 31:ca(e,t,a,n);break;case 13:ca(e,t,a,n);break;case 23:break;case 22:u=t.stateNode,c=t.alternate,t.memoizedState!==null?(o&&c!==null&&c.memoizedState===null&&Ps(c),u._visibility&2?ca(e,t,a,n):er(e,t)):(o&&c!==null&&c.memoizedState!==null&&Ps(t),u._visibility&2?ca(e,t,a,n):(u._visibility|=2,vo(e,t,a,n,(t.subtreeFlags&10256)!==0||!1))),l&2048&&Om(c,t);break;case 24:ca(e,t,a,n),l&2048&&Rm(t.alternate,t);break;case 30:o&&(l=t.alternate,l!==null&&(Pa(l.child,!0),Pa(t.child,!0))),ca(e,t,a,n);break;default:ca(e,t,a,n)}}function vo(e,t,a,n,o){for(o=o&&((t.subtreeFlags&10256)!==0||!1),t=t.child;t!==null;){var l=e,u=t,c=a,h=n,g=u.flags;switch(u.tag){case 0:case 11:case 15:vo(l,u,c,h,o),kr(8,u);break;case 23:break;case 22:var v=u.stateNode;u.memoizedState!==null?v._visibility&2?vo(l,u,c,h,o):er(l,u):(v._visibility|=2,vo(l,u,c,h,o)),o&&g&2048&&Om(u.alternate,u);break;case 24:vo(l,u,c,h,o),o&&g&2048&&Rm(u.alternate,u);break;default:vo(l,u,c,h,o)}t=t.sibling}}function er(e,t){if(t.subtreeFlags&10256)for(t=t.child;t!==null;){var a=e,n=t,o=n.flags;switch(n.tag){case 22:er(a,n),o&2048&&Om(n.alternate,n);break;case 24:er(a,n),o&2048&&Rm(n.alternate,n);break;default:er(a,n)}t=t.sibling}}var yi=8192;function fi(e,t,a){if(e.subtreeFlags&yi)for(e=e.child;e!==null;)Iy(e,t,a),e=e.sibling}function Iy(e,t,a){switch(e.tag){case 26:fi(e,t,a),e.flags&yi&&(e.memoizedState!==null?yS(a,Ca,e.memoizedState,e.memoizedProps):(e=e.stateNode,(t&335544128)===t&&Eb(a,e)));break;case 5:fi(e,t,a),e.flags&yi&&(e=e.stateNode,(t&335544128)===t&&Eb(a,e));break;case 3:case 4:var n=Ca;Ca=gr(e.stateNode.containerInfo),fi(e,t,a),Ca=n;break;case 22:e.memoizedState===null&&(n=e.alternate,n!==null&&n.memoizedState!==null?(n=yi,yi=16777216,fi(e,t,a),yi=n):fi(e,t,a));break;case 30:if((e.flags&yi)!==0&&(n=e.memoizedProps.name,n!=null&&n!=="auto")){var o=e.stateNode;o.paired=null,Jt===null&&(Jt=new Map),Jt.set(n,o)}fi(e,t,a);break;default:fi(e,t,a)}}function Ly(e){var t=e.alternate;if(t!==null&&(e=t.child,e!==null)){t.child=null;do t=e.sibling,e.sibling=null,e=t;while(e!==null)}}function _l(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var a=0;a<t.length;a++){var n=t[a];nt=n,Yy(n,e)}Ly(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)Gy(e),e=e.sibling}function Gy(e){switch(e.tag){case 0:case 11:case 15:_l(e),e.flags&2048&&ai(9,e,e.return);break;case 3:_l(e);break;case 12:_l(e);break;case 22:var t=e.stateNode;e.memoizedState!==null&&t._visibility&2&&(e.return===null||e.return.tag!==13)?(t._visibility&=-3,Fs(e)):_l(e);break;default:_l(e)}}function Fs(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var a=0;a<t.length;a++){var n=t[a];nt=n,Yy(n,e)}Ly(e)}for(e=e.child;e!==null;){switch(t=e,t.tag){case 0:case 11:case 15:ai(8,t,t.return),Fs(t);break;case 22:a=t.stateNode,a._visibility&2&&(a._visibility&=-3,Fs(t));break;default:Fs(t)}e=e.sibling}}function Yy(e,t){for(;nt!==null;){var a=nt;switch(a.tag){case 0:case 11:case 15:ai(8,a,t);break;case 23:case 22:if(a.memoizedState!==null&&a.memoizedState.cachePool!==null){var n=a.memoizedState.cachePool.pool;n!=null&&n.refCount++}break;case 24:Tr(a.memoizedState.cache)}if(n=a.child,n!==null)n.return=a,nt=n;else e:for(a=e;nt!==null;){n=nt;var o=n.sibling,l=n.return;if(Ry(n),n===a){nt=null;break e}if(o!==null){o.return=l,nt=o;break e}nt=l}}}var fN={getCacheForType:function(e){var t=ht(Xe),a=t.data.get(e);return a===void 0&&(a=e(),t.data.set(e,a)),a},cacheSignal:function(){return ht(Xe).controller.signal}},bN=typeof WeakMap=="function"?WeakMap:Map,me=0,Ee=null,re=null,se=0,ve=0,Qt=null,Bn=!1,ol=!1,Vm=!1,fn=0,Ie=0,ni=0,Ei=0,Eu=0,Pt=0,Xo=0,tr=null,Ut=null,Ch=!1,Zu=0,jy=0,ku=1/0,Cu=null,Kn=null,qe=0,za=null,Vi=null,Ja=0,Ah=0,zh=null,Xy=null,qo=null,Bo=null,Io=null,ar=0,Ws=null;function ta(){return(me&2)!==0&&se!==0?se&-se:F.T!==null?_m():Jb()}function Qy(){if(Pt===0)if((se&536870912)===0||ie){var e=$s;$s<<=1,($s&3932160)===0&&($s=262144),Pt=e}else Pt=536870912;return e=ft.current,e!==null&&(e.flags|=32),Pt}function Qo(e,t){if(t!=null){var a=e.stateNode,n=a.ref;n===null&&(n=a.ref=pw(hn(e.memoizedProps,a))),Bo===null&&(Bo=[]),Bo.push(t.bind(null,n))}}function It(e,t,a){(e===Ee&&(ve===2||ve===9)||e.cancelPendingCommit!==null)&&(Zo(e,0),In(e,se,Pt,!1)),xr(e,a),((me&2)===0||e!==Ee)&&(e===Ee&&((me&2)===0&&(Ei|=a),Ie===4&&In(e,se,Pt,!1)),Wa(e))}function Zy(e,t,a){if((me&6)!==0)throw Error(A(327));var n=!a&&(t&127)===0&&(t&e.expiredLanes)===0||$r(e,t),o=n?wN(e,t):Cd(e,t,!0),l=n;do{if(o===0){ol&&!n&&In(e,t,0,!1);break}else{if(a=e.current.alternate,l&&!vN(a)){o=Cd(e,t,!1),l=!1;continue}if(o===2){if(l=t,e.errorRecoveryDisabledLanes&l)var u=0;else u=e.pendingLanes&-536870913,u=u!==0?u:u&536870912?536870912:0;if(u!==0){t=u;e:{var c=e;o=tr;var h=c.current.memoizedState.isDehydrated;if(h&&(Zo(c,u).flags|=256),u=Cd(c,u,!1),u!==2&&u!==6){if(Vm&&!h){c.errorRecoveryDisabledLanes|=l,Ei|=l,o=4;break e}l=Ut,Ut=o,l!==null&&(Ut===null?Ut=l:Ut.push.apply(Ut,l))}o=u}if(l=!1,o!==2)continue}}if(o===1){Zo(e,0),In(e,t,0,!0);break}e:{switch(n=e,l=o,l){case 0:case 1:throw Error(A(345));case 4:if((t&4194048)!==t&&(t&62914560)!==t)break;case 6:In(n,t,Pt,!Bn);break e;case 2:Ut=null;break;case 3:case 5:break;default:throw Error(A(329))}if((t&62914560)===t&&(o=Zu+300-Ft(),10<o)){if(In(n,t,Pt,!Bn),Vu(n,0,!0)!==0)break e;Ja=t,n.timeoutHandle=Um(tb.bind(null,n,a,Ut,Cu,Ch,t,Pt,Ei,Xo,Bn,l,"Throttled",-0,0),o);break e}tb(n,a,Ut,Cu,Ch,t,Pt,Ei,Xo,Bn,l,null,-0,0)}}break}while(!0);Wa(e)}function tb(e,t,a,n,o,l,u,c,h,g,v,x,f,w){e.timeoutHandle=-1;var z=t.subtreeFlags,E=(l&335544064)===l;if(x=null,(E||z&8192||(z&16785408)===16785408)&&(x={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:Xa},Jt=null,Iy(t,l,x),E&&(z=x,E=e.containerInfo,E=(E.nodeType===9?E:E.ownerDocument).__reactViewTransition,E!=null&&(z.count++,z.waitingForViewTransition=!0,z=fr.bind(z),E.finished.then(z,z))),z=(l&62914560)===l?Zu-Ft():(l&4194048)===l?jy-Ft():0,z=wS(x,z),z!==null)){Ja=l,e.cancelPendingCommit=z(nb.bind(null,e,t,l,a,n,o,u,c,h,g,v,x,null,f,w)),In(e,l,u,!g);return}nb(e,t,l,a,n,o,u,c,h,g,v,x)}function vN(e){for(var t=e;;){var a=t.tag;if((a===0||a===11||a===15)&&t.flags&16384&&(a=t.updateQueue,a!==null&&(a=a.stores,a!==null)))for(var n=0;n<a.length;n++){var o=a[n],l=o.getSnapshot;o=o.value;try{if(!aa(l(),o))return!1}catch{return!1}}if(a=t.child,t.subtreeFlags&16384&&a!==null)a.return=t,t=a;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function In(e,t,a,n){t=jb(e,t),t&=~Eu,t&=~Ei,e.suspendedLanes|=t,e.pingedLanes&=~t,n&&(e.warmLanes|=t),n=e.expirationTimes;for(var o=t;0<o;){var l=31-ea(o),u=1<<l;n[l]=-1,o&=~u}a!==0&&Qb(e,a,t)}function Ku(){return(me&6)===0?(Cr(0,!1),!1):!0}function Dm(){if(re!==null){if(ve===0)var e=re.return;else e=re,sn=qi=null,vm(e),_o=null,ur=0,e=re;for(;e!==null;)xy(e.alternate,e),e=e.return;re=null}}function Zo(e,t){var a=e.timeoutHandle;return a!==-1&&(e.timeoutHandle=-1,BN(a)),a=e.cancelPendingCommit,a!==null&&(e.cancelPendingCommit=null,a()),Ja=0,Dm(),Ee=e,re=a=un(e.current,null),se=t,ve=0,Qt=null,Bn=!1,ol=$r(e,t),Vm=!1,Xo=Pt=Eu=Ei=ni=Ie=0,Ut=tr=null,Ch=!1,fn=jb(e,t),qu(),a}function Ky(e,t){ae=null,F.H=wu,t===nl||t===Lu?(t=Cf(),ve=3):t===cm?(t=Cf(),ve=4):ve=t===Em?8:t!==null&&typeof t=="object"&&typeof t.then=="function"?6:1,Qt=t,re===null&&(Ie=1,$u(e,ga(t,e.current)))}function Jy(){var e=ft.current;return e===null?!0:(se&4194048)===se?xt===null:(se&62914560)===se||(se&536870912)!==0?e===xt:!1}function Py(){var e=F.H;return F.H=wu,e===null?wu:e}function Fy(){var e=F.A;return F.A=fN,e}function Au(){Ie=4,Bn||(se&4194048)!==se&&ft.current!==null||(ol=!0),(ni&134217727)===0&&(Ei&134217727)===0||Ee===null||In(Ee,se,Pt,!1)}function Cd(e,t,a){var n=me;me|=2;var o=Py(),l=Fy();(Ee!==e||se!==t)&&(Cu=null,Zo(e,t)),t=!1;var u=Ie;e:do try{if(ve!==0&&re!==null){var c=re,h=Qt;switch(ve){case 8:Dm(),u=6;break e;case 3:case 2:case 9:case 6:ft.current===null&&(t=!0);var g=ve;if(ve=0,Qt=null,Mo(e,c,h,g),a&&ol){u=0;break e}break;default:g=ve,ve=0,Qt=null,Mo(e,c,h,g)}}yN(),u=Ie;break}catch(v){Ky(e,v)}while(!0);return t&&e.shellSuspendCounter++,sn=qi=null,me=n,F.H=o,F.A=l,re===null&&(Ee=null,se=0,qu()),u}function yN(){for(;re!==null;)Wy(re)}function wN(e,t){var a=me;me|=2;var n=Py(),o=Fy();Ee!==e||se!==t?(Cu=null,ku=Ft()+500,Zo(e,t)):ol=$r(e,t);e:do try{if(ve!==0&&re!==null){t=re;var l=Qt;t:switch(ve){case 1:ve=0,Qt=null,Mo(e,t,l,1);break;case 2:case 9:if(kf(l)){ve=0,Qt=null,ab(t);break}t=function(){ve!==2&&ve!==9||Ee!==e||(ve=7),Wa(e)},l.then(t,t);break e;case 3:ve=7;break e;case 4:ve=5;break e;case 7:kf(l)?(ve=0,Qt=null,ab(t)):(ve=0,Qt=null,Mo(e,t,l,7));break;case 5:var u=null;switch(re.tag){case 26:u=re.memoizedState;case 5:case 27:var c=re;if(u?Sw(u):c.stateNode.complete){ve=0,Qt=null;var h=c.sibling;if(h!==null)re=h;else{var g=c.return;g!==null?(re=g,Ju(g)):re=null}break t}}ve=0,Qt=null,Mo(e,t,l,5);break;case 6:ve=0,Qt=null,Mo(e,t,l,6);break;case 8:Dm(),Ie=6;break e;default:throw Error(A(462))}}$N();break}catch(v){Ky(e,v)}while(!0);return sn=qi=null,F.H=n,F.A=o,me=a,re!==null?0:(Ee=null,se=0,qu(),Ie)}function $N(){for(;re!==null&&!U$();)Wy(re)}function Wy(e){var t=$y(e.alternate,e,fn);e.memoizedProps=e.pendingProps,t===null?Ju(e):re=t}function ab(e){var t=e,a=t.alternate;switch(t.tag){case 15:case 0:t=Yf(a,t,t.pendingProps,t.type,void 0,se);break;case 11:t=Yf(a,t,t.pendingProps,t.type.render,t.ref,se);break;case 5:vm(t);var n=t;n===ot&&(ie?(mu(n),n.tag===5&&n.stateNode!=null&&(Oe=n.stateNode)):(mu(n),ie=!0));default:xy(a,t),t=re=Nv(t,fn),t=$y(a,t,fn)}e.memoizedProps=e.pendingProps,t===null?Ju(e):re=t}function Mo(e,t,a,n){sn=qi=null,vm(t),_o=null,ur=0;var o=t.return;try{if(sN(e,o,t,a,se)){Ie=1,$u(e,ga(a,e.current)),re=null;return}}catch(l){if(o!==null)throw re=o,l;Ie=1,$u(e,ga(a,e.current)),re=null;return}t.flags&32768?(ie||n===1?e=!0:ol||(se&536870912)!==0?e=!1:(Bn=e=!0,(n===2||n===9||n===3||n===6)&&(n=ft.current,n!==null&&n.tag===13&&(n.flags|=16384))),ew(t,e)):Ju(t)}function Ju(e){var t=e;do{if((t.flags&32768)!==0){ew(t,Bn);return}e=t.return;var a=hN(t.alternate,t,fn);if(a!==null){re=a;return}if(t=t.sibling,t!==null){re=t;return}re=t=e}while(t!==null);Ie===0&&(Ie=5)}function ew(e,t){do{var a=mN(e.alternate,e);if(a!==null){a.flags&=32767,re=a;return}if(a=e.return,a!==null&&(a.flags|=32768,a.subtreeFlags=0,a.deletions=null),!t&&(e=e.sibling,e!==null)){re=e;return}re=e=a}while(e!==null);Ie=6,re=null}function nb(e,t,a,n,o,l,u,c,h,g,v,x){e.cancelPendingCommit=null;do Pu();while(qe!==0);if((me&6)!==0)throw Error(A(327));if(t!==null){if(t===e.current)throw Error(A(177));e===Ee&&(re=Ee=null,se=0),Vi=t,za=e,Ja=a,zh=o,Xy=n,xN(e,t,a,u,c,h,x)}}function xN(e,t,a,n,o,l,u){var c=t.lanes|t.childLanes;if(Ah=c,c|=im,Z$(e,a,c,n,o,l),Bo=null,(a&335544064)===a?(Io=Jx(e),n=10262):(Io=null,n=10256),(t.subtreeFlags&n)!==0||(t.flags&n)!==0?(e.callbackNode=null,e.callbackPriority=0,CN(su,function(){return Vh(),null})):(e.callbackNode=null,e.callbackPriority=0),Su=!1,n=(t.flags&13878)!==0,(t.subtreeFlags&13878)!==0||n){n=F.T,F.T=null,o=pe.p,pe.p=2,l=me,me|=4;try{pN(e,t,a)}finally{me=l,pe.p=o,F.T=n}}qe=1,Su?qo=XN(u,e.containerInfo,Io,Mh,Oh,SN,Rh,Vh,NN,null,null):(Mh(),Oh(),Rh())}function NN(e){if(qe!==0){var t=za.onRecoverableError;t(e,{componentStack:null})}}function SN(){qe===3&&(qe=0,qy(Vi,za),qe=4)}function Mh(){if(qe===1){qe=0;var e=za,t=Vi,a=Ja,n=(t.flags&13878)!==0;if((t.subtreeFlags&13878)!==0||n){n=F.T,F.T=null;var o=pe.p;pe.p=2;var l=me;me|=4;try{Gl=Tu=!1,Hy(t,e,a),a=Uh;var u=gv(e.containerInfo),c=a.focusedElem,h=a.selectionRange;if(u!==c&&c&&c.ownerDocument&&pv(c.ownerDocument.documentElement,c)){if(h!==null&&nm(c)){var g=h.start,v=h.end;if(v===void 0&&(v=g),"selectionStart"in c)c.selectionStart=g,c.selectionEnd=Math.min(v,c.value.length);else{var x=c.ownerDocument||document,f=x&&x.defaultView||window;if(f.getSelection){var w=f.getSelection(),z=c.textContent.length,E=Math.min(h.start,z),_=h.end===void 0?E:Math.min(h.end,z);!w.extend&&E>_&&(u=_,_=E,E=u);var $=yf(c,E),b=yf(c,_);if($&&b&&(w.rangeCount!==1||w.anchorNode!==$.node||w.anchorOffset!==$.offset||w.focusNode!==b.node||w.focusOffset!==b.offset)){var N=x.createRange();N.setStart($.node,$.offset),w.removeAllRanges(),E>_?(w.addRange(N),w.extend(b.node,b.offset)):(N.setEnd(b.node,b.offset),w.addRange(N))}}}}for(x=[],w=c;w=w.parentNode;)w.nodeType===1&&x.push({element:w,left:w.scrollLeft,top:w.scrollTop});for(typeof c.focus=="function"&&c.focus(),c=0;c<x.length;c++){var k=x[c];k.element.scrollLeft=k.left,k.element.scrollTop=k.top}}Wo=!!Hh,Uh=Hh=null}finally{me=l,pe.p=o,F.T=n}}e.current=t,qe=2}}function Oh(){if(qe===2){qe=0;var e=za,t=Vi,a=(t.flags&8772)!==0;if((t.subtreeFlags&8772)!==0||a){a=F.T,F.T=null;var n=pe.p;pe.p=2;var o=me;me|=4;try{My(e,t.alternate,t)}finally{me=o,pe.p=n,F.T=a}}qe=3}}function Rh(){if(qe===4||qe===3){qe=0;var e=qo;qo=null,q$();var t=za,a=Vi,n=Ja,o=Xy,l=(n&335544064)===n?10262:10256;if((a.subtreeFlags&l)!==0||(a.flags&l)!==0?qe=5:(qe=0,Vi=za=null,tw(t,t.pendingLanes)),l=t.pendingLanes,l===0&&(Kn=null),Ph(n),a=a.stateNode,Wt&&typeof Wt.onCommitFiberRoot=="function")try{Wt.onCommitFiberRoot(wr,a,void 0,(a.current.flags&128)===128)}catch{}if(o!==null){a=F.T,l=pe.p,pe.p=2,F.T=null;try{for(var u=t.onRecoverableError,c=0;c<o.length;c++){var h=o[c];u(h.value,{componentStack:h.stack})}}finally{F.T=a,pe.p=l}}if(o=Bo,u=Io,Io=null,o!==null&&(Bo=null,u===null&&(u=[]),e!==null))for(h=0;h<o.length;h++)a=(0,o[h])(u),a!==void 0&&e.finished.finally(a);(Ja&3)!==0&&Pu(),Wa(t),l=t.pendingLanes,(n&261930)!==0&&(l&42)!==0?t===Ws?ar++:(ar=0,Ws=t):(ar=0,Ws=null),Cr(0,!1)}}function tw(e,t){(e.pooledCacheLanes&=t)===0&&(t=e.pooledCache,t!=null&&(e.pooledCache=null,Tr(t)))}function Pu(){return qo!==null&&(qo.skipTransition(),qo=null),Mh(),Oh(),Rh(),Vh()}function Vh(){if(qe!==5)return!1;var e=za,t=Ah;Ah=0;var a=Ph(Ja),n=F.T,o=pe.p;try{pe.p=32>a?32:a,F.T=null,a=zh,zh=null;var l=za,u=Ja;if(qe=0,Vi=za=null,Ja=0,(me&6)!==0)throw Error(A(331));var c=me;if(me|=4,Gy(l.current),By(l,l.current,u,a),me=c,Cr(0,!1),Wt&&typeof Wt.onPostCommitFiberRoot=="function")try{Wt.onPostCommitFiberRoot(wr,l)}catch{}return!0}finally{pe.p=o,F.T=n,tw(e,t)}}function ib(e,t,a){t=ga(a,t),t=mh(e.stateNode,t,2),e=Xn(e,t,2),e!==null&&(xr(e,2),Wa(e))}function we(e,t,a){if(e.tag===3)ib(e,e,a);else for(;t!==null;){if(t.tag===3){ib(t,e,a);break}else if(t.tag===1){var n=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof n.componentDidCatch=="function"&&(Kn===null||!Kn.has(n))){e=ga(a,e),a=fy(2),n=Xn(t,a,2),n!==null&&(by(a,n,t,e),xr(n,2),Wa(n));break}}t=t.return}}function Ad(e,t,a){var n=e.pingCache;if(n===null){n=e.pingCache=new bN;var o=new Set;n.set(t,o)}else o=n.get(t),o===void 0&&(o=new Set,n.set(t,o));o.has(a)||(Vm=!0,o.add(a),e=TN.bind(null,e,t,a),t.then(e,e))}function TN(e,t,a){var n=e.pingCache;n!==null&&n.delete(t),e.pingedLanes|=e.suspendedLanes&a,e.warmLanes&=~a,Ee===e&&(se&a)===a&&((Ie===4||Ie===3&&(se&62914560)===se&&300>Ft()-Zu)&&(me&2)===0?Zo(e,0):Eu|=a,Xo===se&&(Xo=0)),Wa(e)}function aw(e,t){t===0&&(t=Xb()),e=Ui(e,t),e!==null&&(xr(e,t),Wa(e))}function EN(e){var t=e.memoizedState,a=0;t!==null&&(a=t.retryLane),aw(e,a)}function kN(e,t){var a=0;switch(e.tag){case 31:case 13:var n=e.stateNode,o=e.memoizedState;o!==null&&(a=o.retryLane);break;case 19:n=e.stateNode;break;case 22:n=e.stateNode._retryCache;break;default:throw Error(A(314))}n!==null&&n.delete(t),aw(e,a)}function CN(e,t){return Kh(e,t)}var Ko=null,yo=null,Dh=!1,zu=!1,zd=!1,Ln=0;function Wa(e){e!==yo&&e.next===null&&(yo===null?Ko=yo=e:yo=yo.next=e),zu=!0,Dh||(Dh=!0,zN())}function Cr(e,t){if(!zd&&zu){zd=!0;do for(var a=!1,n=Ko;n!==null;){if(!t)if(e!==0){var o=n.pendingLanes;if(o===0)var l=0;else{var u=n.suspendedLanes,c=n.pingedLanes;l=(1<<31-ea(42|e)+1)-1,l&=o&~(u&~c),l=l&201326741?l&201326741|1:l?l|2:0}l!==0&&(a=!0,ob(n,l))}else l=se,l=Vu(n,n===Ee?l:0,n.cancelPendingCommit!==null||n.timeoutHandle!==-1),(l&3)===0||$r(n,l)||(a=!0,ob(n,l));n=n.next}while(a);zd=!1}}function AN(){nw()}function nw(){zu=Dh=!1;var e=0;Ln!==0&&qN()&&(e=Ln);for(var t=Ft(),a=null,n=Ko;n!==null;){var o=n.next,l=iw(n,t);l===0?(n.next=null,a===null?Ko=o:a.next=o,o===null&&(yo=a)):(a=n,(e!==0||(l&3)!==0)&&(zu=!0)),n=o}qe!==0&&qe!==5||Cr(e,!1),Ln!==0&&(Ln=0)}function iw(e,t){for(var a=e.suspendedLanes,n=e.pingedLanes,o=e.expirationTimes,l=e.pendingLanes&-62914561;0<l;){var u=31-ea(l),c=1<<u,h=o[u];h===-1?((c&a)===0||(c&n)!==0)&&(o[u]=Q$(c,t)):h<=t&&(e.expiredLanes|=c),l&=~c}if(t=Ee,a=se,a=Vu(e,e===t?a:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),n=e.callbackNode,a===0||e===t&&(ve===2||ve===9)||e.cancelPendingCommit!==null)return n!==null&&n!==null&&sd(n),e.callbackNode=null,e.callbackPriority=0;if((a&3)===0||$r(e,a)){if(t=a&-a,t===e.callbackPriority)return t;switch(n!==null&&sd(n),Ph(a)){case 2:case 8:a=Gb;break;case 32:a=su;break;case 268435456:a=Yb;break;default:a=su}return n=ow.bind(null,e),a=Kh(a,n),e.callbackPriority=t,e.callbackNode=a,t}return n!==null&&n!==null&&sd(n),e.callbackPriority=2,e.callbackNode=null,2}function ow(e,t){if(qe!==0&&qe!==5)return e.callbackNode=null,e.callbackPriority=0,null;var a=e.callbackNode;if(Pu()&&e.callbackNode!==a)return null;var n=se;return n=Vu(e,e===Ee?n:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),n===0?null:(Zy(e,n,t),iw(e,Ft()),e.callbackNode!=null&&e.callbackNode===a?ow.bind(null,e):null)}function ob(e,t){if(Pu())return null;Zy(e,t,!0)}function zN(){IN(function(){(me&6)!==0?Kh(Lb,AN):nw()})}function _m(){if(Ln===0){var e=zi;e===0&&(e=ws,ws<<=1,(ws&261888)===0&&(ws=256)),Ln=e}return Ln}function lb(e){return e==null||typeof e=="symbol"||typeof e=="boolean"?null:typeof e=="function"?e:Is(e)}function MN(e,t,a,n,o){if(t==="submit"&&a&&a.stateNode===o){var l=lb((o[Gt]||null).action),u=n.submitter;u&&(t=(t=u[Gt]||null)?lb(t.formAction):u.getAttribute("formAction"),t!==null&&(l=t,u=null));var c=new _u("action","action",null,n,o);e.push({event:c,listeners:[{instance:null,listener:function(){if(n.defaultPrevented){if(Ln!==0){var h=new FormData(o,u);dh(a,{pending:!0,data:h,method:o.method,action:l},null,h)}}else typeof l=="function"&&(c.preventDefault(),h=new FormData(o,u),dh(a,{pending:!0,data:h,method:o.method,action:l},l,h))},currentTarget:o}]})}}for(Ds=0;Ds<eh.length;Ds++)_s=eh[Ds],rb=_s.toLowerCase(),sb=_s[0].toUpperCase()+_s.slice(1),Ma(rb,"on"+sb);var _s,rb,sb,Ds;Ma(bv,"onAnimationEnd");Ma(vv,"onAnimationIteration");Ma(yv,"onAnimationStart");Ma("dblclick","onDoubleClick");Ma("focusin","onFocus");Ma("focusout","onBlur");Ma(Lx,"onTransitionRun");Ma(Gx,"onTransitionStart");Ma(Yx,"onTransitionCancel");Ma(wv,"onTransitionEnd");Go("onMouseEnter",["mouseout","mouseover"]);Go("onMouseLeave",["mouseout","mouseover"]);Go("onPointerEnter",["pointerout","pointerover"]);Go("onPointerLeave",["pointerout","pointerover"]);_i("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));_i("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));_i("onBeforeInput",["compositionend","keypress","textInput","paste"]);_i("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));_i("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));_i("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var hr="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),ON=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(hr));function lw(e,t){t=(t&4)!==0;for(var a=0;a<e.length;a++){var n=e[a],o=n.event;n=n.listeners;e:{var l=void 0;if(t)for(var u=n.length-1;0<=u;u--){var c=n[u],h=c.instance,g=c.currentTarget;if(c=c.listener,h!==l&&o.isPropagationStopped())break e;l=c,o.currentTarget=g;try{l(o)}catch(v){cu(v)}o.currentTarget=null,l=h}else for(u=0;u<n.length;u++){if(c=n[u],h=c.instance,g=c.currentTarget,c=c.listener,h!==l&&o.isPropagationStopped())break e;l=c,o.currentTarget=g;try{l(o)}catch(v){cu(v)}o.currentTarget=null,l=h}}}}function le(e,t){var a=t[tf];a===void 0&&(a=t[tf]=new Set);var n=e+"__bubble";a.has(n)||(rw(t,e,2,!1),a.add(n))}function Md(e,t,a){var n=0;t&&(n|=4),rw(a,e,n,t)}var Hs="_reactListening"+Math.random().toString(36).slice(2);function Hm(e){if(!e[Hs]){e[Hs]=!0,Fb.forEach(function(a){a!=="selectionchange"&&(ON.has(a)||Md(a,!1,e),Md(a,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[Hs]||(t[Hs]=!0,Md("selectionchange",!1,t))}}function rw(e,t,a,n){switch(Mw(t)){case 2:var o=SS;break;case 8:o=TS;break;default:o=Ym}a=o.bind(null,t,a,e),o=void 0,!Jd||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(o=!0),n?o!==void 0?e.addEventListener(t,a,{capture:!0,passive:o}):e.addEventListener(t,a,!0):o!==void 0?e.addEventListener(t,a,{passive:o}):e.addEventListener(t,a,!1)}function Od(e,t,a,n,o){var l=n;if((t&1)===0&&(t&2)===0&&n!==null)e:for(;;){if(n===null)return;var u=n.tag;if(u===3||u===4){var c=n.stateNode.containerInfo;if(c===o)break;if(u===4)for(u=n.return;u!==null;){var h=u.tag;if((h===3||h===4)&&u.stateNode.containerInfo===o)return;u=u.return}for(;c!==null;){if(u=wi(c),u===null)return;if(h=u.tag,h===5||h===6||h===26||h===27){n=l=u;continue e}c=c.parentNode}}n=n.return}lv(function(){var g=l,v=Wh(a),x=[];e:{var f=$v.get(e);if(f!==void 0){var w=_u,z=e;switch(e){case"keypress":if(Gs(a)===0)break e;case"keydown":case"keyup":w=vx;break;case"focusin":z="focus",w=pd;break;case"focusout":z="blur",w=pd;break;case"beforeblur":case"afterblur":w=pd;break;case"click":if(a.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":w=cf;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":w=lx;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":w=Nx;break;case bv:case vv:case yv:w=ux;break;case wv:w=Tx;break;case"scroll":case"scrollend":w=ix;break;case"wheel":w=kx;break;case"copy":case"cut":case"paste":w=dx;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":w=hf;break;case"submit":w=$x;break;case"toggle":case"beforetoggle":w=Ax}var E=(t&4)!==0,_=!E&&(e==="scroll"||e==="scrollend"),$=E?f!==null?f+"Capture":null:f;E=[];for(var b=g,N;b!==null;){var k=b;if(N=k.stateNode,k=k.tag,k!==5&&k!==26&&k!==27||N===null||$===null||(k=ir(b,$),k!=null&&E.push(mr(b,k,N))),_)break;b=b.return}0<E.length&&(f=new w(f,z,null,a,v),x.push({event:f,listeners:E}))}}if((t&7)===0){e:{if(w=e==="mouseover"||e==="pointerover",f=e==="mouseout"||e==="pointerout",w&&a!==Kd&&(z=a.relatedTarget||a.fromElement)&&(wi(z)||z[tl]))break e;(f||w)&&(z=v.window===v?v:(w=v.ownerDocument)?w.defaultView||w.parentWindow:window,f?(w=a.relatedTarget||a.toElement,f=g,w=w?wi(w):null,w!==null&&(_=yr(w),E=w.tag,w!==_||E!==5&&E!==27&&E!==6)&&(w=null)):(f=null,w=g),f!==w&&(E=cf,k="onMouseLeave",$="onMouseEnter",b="mouse",(e==="pointerout"||e==="pointerover")&&(E=hf,k="onPointerLeave",$="onPointerEnter",b="pointer"),_=f==null?z:Il(f),N=w==null?z:Il(w),z=new E(k,b+"leave",f,a,v),z.target=_,z.relatedTarget=N,k=null,wi(v)===g&&(E=new E($,b+"enter",w,a,v),E.target=N,E.relatedTarget=_,k=E),_=k,E=f&&w?Hd(f,w,RN):null,f!==null&&ub(x,z,f,E,!1),w!==null&&_!==null&&ub(x,_,w,E,!0)))}e:{if(f=g?Il(g):window,w=f.nodeName&&f.nodeName.toLowerCase(),w==="select"||w==="input"&&f.type==="file")var R=ff;else if(gf(f))if(hv)R=qx;else{R=Hx;var P=_x}else w=f.nodeName,!w||w.toLowerCase()!=="input"||f.type!=="checkbox"&&f.type!=="radio"?g&&Fh(g.elementType)&&(R=ff):R=Ux;if(R&&(R=R(e,g))){dv(x,R,a,v);break e}P&&P(e,f,g)}switch(P=g?Il(g):window,e){case"focusin":(gf(P)||P.contentEditable==="true")&&(To=P,Fd=g,Xl=null);break;case"focusout":Xl=Fd=To=null;break;case"mousedown":Wd=!0;break;case"contextmenu":case"mouseup":case"dragend":Wd=!1,wf(x,a,v);break;case"selectionchange":if(Ix)break;case"keydown":case"keyup":wf(x,a,v)}var B;if(am)e:{switch(e){case"compositionstart":var G="onCompositionStart";break e;case"compositionend":G="onCompositionEnd";break e;case"compositionupdate":G="onCompositionUpdate";break e}G=void 0}else So?uv(e,a)&&(G="onCompositionEnd"):e==="keydown"&&a.keyCode===229&&(G="onCompositionStart");G&&(sv&&a.locale!=="ko"&&(So||G!=="onCompositionStart"?G==="onCompositionEnd"&&So&&(B=rv()):(Un=v,em="value"in Un?Un.value:Un.textContent,So=!0)),P=Mu(g,G),0<P.length&&(G=new df(G,e,null,a,v),x.push({event:G,listeners:P}),B?G.data=B:(B=cv(a),B!==null&&(G.data=B)))),(B=Mx?Ox(e,a):Rx(e,a))&&(G=Mu(g,"onBeforeInput"),0<G.length&&(P=new df("onBeforeInput","beforeinput",null,a,v),x.push({event:P,listeners:G}),P.data=B)),MN(x,e,g,a,v)}lw(x,t)})}function mr(e,t,a){return{instance:e,listener:t,currentTarget:a}}function Mu(e,t){for(var a=t+"Capture",n=[];e!==null;){var o=e,l=o.stateNode;if(o=o.tag,o!==5&&o!==26&&o!==27||l===null||(o=ir(e,a),o!=null&&n.unshift(mr(e,o,l)),o=ir(e,t),o!=null&&n.push(mr(e,o,l))),e.tag===3)return n;e=e.return}return[]}function RN(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function ub(e,t,a,n,o){for(var l=t._reactName,u=[];a!==null&&a!==n;){var c=a,h=c.alternate,g=c.stateNode;if(c=c.tag,h!==null&&h===n)break;c!==5&&c!==26&&c!==27||g===null||(h=g,o?(g=ir(a,l),g!=null&&u.unshift(mr(a,g,h))):o||(g=ir(a,l),g!=null&&u.push(mr(a,g,h)))),a=a.return}u.length!==0&&e.push({event:t,listeners:u})}var VN=/\r\n?/g,DN=/\u0000|\uFFFD/g;function cb(e){return(typeof e=="string"?e:""+e).replace(VN,`
`).replace(DN,"")}function sw(e,t){return t=cb(t),cb(e)===t}function ye(e,t,a,n,o,l){switch(a){case"children":if(typeof n=="string")t==="body"||t==="textarea"&&n===""||Yo(e,n);else if(typeof n=="number"||typeof n=="bigint")t!=="body"&&Yo(e,""+n);else return;break;case"className":Ns(e,"class",n);break;case"tabIndex":Ns(e,"tabindex",n);break;case"dir":case"role":case"viewBox":case"width":case"height":Ns(e,a,n);break;case"style":ov(e,n,l);return;case"data":if(t!=="object"){Ns(e,"data",n);break}case"src":case"href":if(n===""&&(t!=="a"||a!=="href")){e.removeAttribute(a);break}if(n==null||typeof n=="function"||typeof n=="symbol"||typeof n=="boolean"){e.removeAttribute(a);break}n=Is(n),e.setAttribute(a,n);break;case"action":case"formAction":if(typeof n=="function"){e.setAttribute(a,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof l=="function"&&(a==="formAction"?(t!=="input"&&ye(e,t,"name",o.name,o,null),ye(e,t,"formEncType",o.formEncType,o,null),ye(e,t,"formMethod",o.formMethod,o,null),ye(e,t,"formTarget",o.formTarget,o,null)):(ye(e,t,"encType",o.encType,o,null),ye(e,t,"method",o.method,o,null),ye(e,t,"target",o.target,o,null)));if(n==null||typeof n=="symbol"||typeof n=="boolean"){e.removeAttribute(a);break}n=Is(n),e.setAttribute(a,n);break;case"onClick":n!=null&&(e.onclick=Xa);return;case"onScroll":n!=null&&le("scroll",e);return;case"onScrollEnd":n!=null&&le("scrollend",e);return;case"dangerouslySetInnerHTML":if(n!=null){if(typeof n!="object"||!("__html"in n))throw Error(A(61));if(a=n.__html,a!=null){if(o.children!=null)throw Error(A(60));l?.__html!==a&&(e.innerHTML=a)}}break;case"multiple":e.multiple=n&&typeof n!="function"&&typeof n!="symbol";break;case"muted":e.muted=n&&typeof n!="function"&&typeof n!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(n==null||typeof n=="function"||typeof n=="boolean"||typeof n=="symbol"){e.removeAttribute("xlink:href");break}a=Is(n),e.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",a);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":n!=null&&typeof n!="function"&&typeof n!="symbol"?e.setAttribute(a,n):e.removeAttribute(a);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"credentialless":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":n&&typeof n!="function"&&typeof n!="symbol"?e.setAttribute(a,""):e.removeAttribute(a);break;case"capture":case"download":n===!0?e.setAttribute(a,""):n!==!1&&n!=null&&typeof n!="function"&&typeof n!="symbol"?e.setAttribute(a,n):e.removeAttribute(a);break;case"cols":case"rows":case"size":case"span":n!=null&&typeof n!="function"&&typeof n!="symbol"&&!isNaN(n)&&1<=n?e.setAttribute(a,n):e.removeAttribute(a);break;case"rowSpan":case"start":n==null||typeof n=="function"||typeof n=="symbol"||isNaN(n)?e.removeAttribute(a):e.setAttribute(a,n);break;case"popover":le("beforetoggle",e),le("toggle",e),Bs(e,"popover",n);break;case"xlinkActuate":on(e,"http://www.w3.org/1999/xlink","xlink:actuate",n);break;case"xlinkArcrole":on(e,"http://www.w3.org/1999/xlink","xlink:arcrole",n);break;case"xlinkRole":on(e,"http://www.w3.org/1999/xlink","xlink:role",n);break;case"xlinkShow":on(e,"http://www.w3.org/1999/xlink","xlink:show",n);break;case"xlinkTitle":on(e,"http://www.w3.org/1999/xlink","xlink:title",n);break;case"xlinkType":on(e,"http://www.w3.org/1999/xlink","xlink:type",n);break;case"xmlBase":on(e,"http://www.w3.org/XML/1998/namespace","xml:base",n);break;case"xmlLang":on(e,"http://www.w3.org/XML/1998/namespace","xml:lang",n);break;case"xmlSpace":on(e,"http://www.w3.org/XML/1998/namespace","xml:space",n);break;case"is":Bs(e,"is",n);break;case"innerText":case"textContent":return;default:if(!(2<a.length)||a[0]!=="o"&&a[0]!=="O"||a[1]!=="n"&&a[1]!=="N")a=ax.get(a)||a,Bs(e,a,n);else return}he=!0}function _h(e,t,a,n,o,l){switch(a){case"style":ov(e,n,l);return;case"dangerouslySetInnerHTML":if(n!=null){if(typeof n!="object"||!("__html"in n))throw Error(A(61));if(a=n.__html,a!=null){if(o.children!=null)throw Error(A(60));l?.__html!==a&&(e.innerHTML=a)}}break;case"children":if(typeof n=="string")Yo(e,n);else if(typeof n=="number"||typeof n=="bigint")Yo(e,""+n);else return;break;case"onScroll":n!=null&&le("scroll",e);return;case"onScrollEnd":n!=null&&le("scrollend",e);return;case"onClick":n!=null&&(e.onclick=Xa);return;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":return;case"innerText":case"textContent":return;default:if(!Wb.hasOwnProperty(a))e:{if(a[0]==="o"&&a[1]==="n"&&(o=a.endsWith("Capture"),l=a.slice(2,o?a.length-7:void 0),t=e[Gt]||null,t=t!=null?t[a]:null,typeof t=="function"&&e.removeEventListener(l,t,o),typeof n=="function")){typeof t!="function"&&t!==null&&(a in e?e[a]=null:e.hasAttribute(a)&&e.removeAttribute(a)),e.addEventListener(l,n,o);break e}he=!0,a in e?e[a]=n:n===!0?e.setAttribute(a,""):Bs(e,a,n)}return}he=!0}function gt(e,t,a){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":le("error",e),le("load",e);var n=!1,o=!1,l;for(l in a)if(a.hasOwnProperty(l)){var u=a[l];if(u!=null)switch(l){case"src":n=!0;break;case"srcSet":o=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(A(137,t));default:ye(e,t,l,u,a,null)}}o&&ye(e,t,"srcSet",a.srcSet,a,null),n&&ye(e,t,"src",a.src,a,null);return;case"input":le("invalid",e);var c=l=u=o=null,h=null,g=null;for(n in a)if(a.hasOwnProperty(n)){var v=a[n];if(v!=null)switch(n){case"name":o=v;break;case"type":u=v;break;case"checked":h=v;break;case"defaultChecked":g=v;break;case"value":l=v;break;case"defaultValue":c=v;break;case"children":case"dangerouslySetInnerHTML":if(v!=null)throw Error(A(137,t));break;default:ye(e,t,n,v,a,null)}}av(e,l,c,h,g,u,o,!1);return;case"select":le("invalid",e),n=u=l=null;for(o in a)if(a.hasOwnProperty(o)&&(c=a[o],c!=null))switch(o){case"value":l=c;break;case"defaultValue":u=c;break;case"multiple":n=c;default:ye(e,t,o,c,a,null)}t=l,a=u,e.multiple=!!n,t!=null?Ro(e,!!n,t,!1):a!=null&&Ro(e,!!n,a,!0);return;case"textarea":le("invalid",e),l=o=n=null;for(u in a)if(a.hasOwnProperty(u)&&(c=a[u],c!=null))switch(u){case"value":n=c;break;case"defaultValue":o=c;break;case"children":l=c;break;case"dangerouslySetInnerHTML":if(c!=null)throw Error(A(91));break;default:ye(e,t,u,c,a,null)}iv(e,n,o,l);return;case"option":for(h in a)a.hasOwnProperty(h)&&(n=a[h],n!=null)&&(h==="selected"?e.selected=n&&typeof n!="function"&&typeof n!="symbol":ye(e,t,h,n,a,null));return;case"dialog":le("beforetoggle",e),le("toggle",e),le("cancel",e),le("close",e);break;case"iframe":case"object":le("load",e);break;case"video":case"audio":for(n=0;n<hr.length;n++)le(hr[n],e);break;case"image":le("error",e),le("load",e);break;case"details":le("toggle",e);break;case"embed":case"source":case"link":le("error",e),le("load",e);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(g in a)if(a.hasOwnProperty(g)&&(n=a[g],n!=null))switch(g){case"children":case"dangerouslySetInnerHTML":throw Error(A(137,t));default:ye(e,t,g,n,a,null)}return;default:if(Fh(t)){for(v in a)a.hasOwnProperty(v)&&(n=a[v],n!==void 0&&_h(e,t,v,n,a,void 0));return}}for(c in a)a.hasOwnProperty(c)&&(n=a[c],n!=null&&ye(e,t,c,n,a,null))}var _N={};function HN(e,t,a,n){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var o=null,l=null,u=null,c=null,h=null,g=null,v=null;for(w in a){var x=a[w];if(a.hasOwnProperty(w)&&x!=null)switch(w){case"checked":break;case"value":break;case"defaultValue":h=x;default:n.hasOwnProperty(w)||ye(e,t,w,null,n,x)}}for(var f in n){var w=n[f];if(x=a[f],n.hasOwnProperty(f)&&(w!=null||x!=null))switch(f){case"type":w!==x&&(he=!0),l=w;break;case"name":w!==x&&(he=!0),o=w;break;case"checked":w!==x&&(he=!0),g=w;break;case"defaultChecked":w!==x&&(he=!0),v=w;break;case"value":w!==x&&(he=!0),u=w;break;case"defaultValue":w!==x&&(he=!0),c=w;break;case"children":case"dangerouslySetInnerHTML":if(w!=null)throw Error(A(137,t));break;default:w!==x&&ye(e,t,f,w,n,x)}}Zd(e,u,c,h,g,v,l,o);return;case"select":w=u=c=f=null;for(l in a)if(h=a[l],a.hasOwnProperty(l)&&h!=null)switch(l){case"value":break;case"multiple":w=h;default:n.hasOwnProperty(l)||ye(e,t,l,null,n,h)}for(o in n)if(l=n[o],h=a[o],n.hasOwnProperty(o)&&(l!=null||h!=null))switch(o){case"value":l!==h&&(he=!0),f=l;break;case"defaultValue":l!==h&&(he=!0),c=l;break;case"multiple":l!==h&&(he=!0),u=l;default:l!==h&&ye(e,t,o,l,n,h)}t=c,a=u,n=w,f!=null?Ro(e,!!a,f,!1):!!n!=!!a&&(t!=null?Ro(e,!!a,t,!0):Ro(e,!!a,a?[]:"",!1));return;case"textarea":w=f=null;for(c in a)if(o=a[c],a.hasOwnProperty(c)&&o!=null&&!n.hasOwnProperty(c))switch(c){case"value":break;case"children":break;default:ye(e,t,c,null,n,o)}for(u in n)if(o=n[u],l=a[u],n.hasOwnProperty(u)&&(o!=null||l!=null))switch(u){case"value":o!==l&&(he=!0),f=o;break;case"defaultValue":o!==l&&(he=!0),w=o;break;case"children":break;case"dangerouslySetInnerHTML":if(o!=null)throw Error(A(91));break;default:o!==l&&ye(e,t,u,o,n,l)}nv(e,f,w);return;case"option":for(var z in a)f=a[z],a.hasOwnProperty(z)&&f!=null&&!n.hasOwnProperty(z)&&(z==="selected"?e.selected=!1:ye(e,t,z,null,n,f));for(h in n)f=n[h],w=a[h],n.hasOwnProperty(h)&&f!==w&&(f!=null||w!=null)&&(h==="selected"?(f!==w&&(he=!0),e.selected=f&&typeof f!="function"&&typeof f!="symbol"):ye(e,t,h,f,n,w));return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var E in a)f=a[E],a.hasOwnProperty(E)&&f!=null&&!n.hasOwnProperty(E)&&ye(e,t,E,null,n,f);for(g in n)if(f=n[g],w=a[g],n.hasOwnProperty(g)&&f!==w&&(f!=null||w!=null))switch(g){case"children":case"dangerouslySetInnerHTML":if(f!=null)throw Error(A(137,t));break;default:ye(e,t,g,f,n,w)}return;default:if(Fh(t)){for(var _ in a)f=a[_],a.hasOwnProperty(_)&&f!==void 0&&!n.hasOwnProperty(_)&&_h(e,t,_,void 0,n,f);for(v in n)f=n[v],w=a[v],!n.hasOwnProperty(v)||f===w||f===void 0&&w===void 0||_h(e,t,v,f,n,w);return}}for(var $ in a)f=a[$],a.hasOwnProperty($)&&f!=null&&!n.hasOwnProperty($)&&ye(e,t,$,null,n,f);for(x in n)f=n[x],w=a[x],!n.hasOwnProperty(x)||f===w||f==null&&w==null||ye(e,t,x,f,n,w)}function db(e){switch(e){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function UN(){if(typeof performance.getEntriesByType=="function"){for(var e=0,t=0,a=performance.getEntriesByType("resource"),n=0;n<a.length;n++){var o=a[n],l=o.transferSize,u=o.initiatorType,c=o.duration;if(l&&c&&db(u)){for(u=0,c=o.responseEnd,n+=1;n<a.length;n++){var h=a[n],g=h.startTime;if(g>c)break;var v=h.transferSize,x=h.initiatorType;v&&db(x)&&(h=h.responseEnd,u+=v*(h<c?1:(c-g)/(h-g)))}if(--n,t+=8*(l+u)/(o.duration/1e3),e++,10<e)break}}if(0<e)return t/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e=="number")?e:5}var Hh=null,Uh=null;function pr(e){return e.nodeType===9?e:e.ownerDocument}function hb(e){switch(e){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function uw(e,t){if(e===0)switch(t){case"svg":return 1;case"math":return 2;default:return 0}return e===1&&t==="foreignObject"?0:e}function cw(e,t,a,n){return a=pr(a).createElement(e),a[dt]=n,a[Gt]=t,gt(a,e,t),it(a),a}function qh(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.children=="bigint"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var Rd=null;function qN(){var e=window.event;return e&&e.type==="popstate"?e===Rd?!1:(Rd=e,!0):(Rd=null,!1)}var Um=typeof setTimeout=="function"?setTimeout:void 0,BN=typeof clearTimeout=="function"?clearTimeout:void 0,mb=typeof Promise=="function"?Promise:void 0,pb=typeof requestAnimationFrame=="function"?requestAnimationFrame:Um,IN=typeof queueMicrotask=="function"?queueMicrotask:typeof mb<"u"?function(e){return mb.resolve(null).then(e).catch(LN)}:Um;function LN(e){setTimeout(function(){throw e})}function oi(e){return e==="head"}function gb(e,t){var a=t,n=0;do{var o=a.nextSibling;if(e.removeChild(a),o&&o.nodeType===8)if(a=o.data,a==="/$"||a==="/&"){if(n===0){e.removeChild(o),el(t);return}n--}else if(a==="$"||a==="$?"||a==="$~"||a==="$!"||a==="&")n++;else if(a==="html")Dd(e.ownerDocument.documentElement);else if(a==="head"){a=e.ownerDocument.head,Dd(a);for(var l=a.firstChild;l;){var u=l.nextSibling,c=l.nodeName;l[Nr]||c==="SCRIPT"||c==="STYLE"||c==="LINK"&&l.rel.toLowerCase()==="stylesheet"||a.removeChild(l),l=u}}else a==="body"&&Dd(e.ownerDocument.body);a=o}while(a);el(t)}function fb(e,t){var a=e;e=0;do{var n=a.nextSibling;if(a.nodeType===1?t?(a._stashedDisplay=a.style.display,a.style.display="none"):(a.style.display=a._stashedDisplay||"",a.getAttribute("style")===""&&a.removeAttribute("style")):a.nodeType===3&&(t?(a._stashedText=a.nodeValue,a.nodeValue=""):a.nodeValue=a._stashedText||""),n&&n.nodeType===8)if(a=n.data,a==="/$"){if(e===0)break;e--}else a!=="$"&&a!=="$?"&&a!=="$~"&&a!=="$!"||e++;a=n}while(a)}function dw(e,t,a){if(t=CSS.escape(t)!==t?"r-"+btoa(t).replace(/=/g,""):t,e.style.viewTransitionName=t,a!=null&&(e.style.viewTransitionClass=a),a=getComputedStyle(e),a.display==="inline"){if(t=e.getClientRects(),t.length===1)var n=1;else for(var o=n=0;o<t.length;o++){var l=t[o];0<l.width&&0<l.height&&n++}n===1&&(e=e.style,e.display=t.length===1?"inline-block":"block",e.marginTop="-"+a.paddingTop,e.marginBottom="-"+a.paddingBottom)}}function hw(e,t){e=e.style,t=t.style;var a=t!=null?t.hasOwnProperty("viewTransitionName")?t.viewTransitionName:t.hasOwnProperty("view-transition-name")?t["view-transition-name"]:null:null;e.viewTransitionName=a==null||typeof a=="boolean"?"":(""+a).trim(),a=t!=null?t.hasOwnProperty("viewTransitionClass")?t.viewTransitionClass:t.hasOwnProperty("view-transition-class")?t["view-transition-class"]:null:null,e.viewTransitionClass=a==null||typeof a=="boolean"?"":(""+a).trim(),e.display==="inline-block"&&(t==null?e.display=e.margin="":(a=t.display,e.display=a==null||typeof a=="boolean"?"":a,a=t.margin,a!=null?e.margin=a:(a=t.hasOwnProperty("marginTop")?t.marginTop:t["margin-top"],e.marginTop=a==null||typeof a=="boolean"?"":a,t=t.hasOwnProperty("marginBottom")?t.marginBottom:t["margin-bottom"],e.marginBottom=t==null||typeof t=="boolean"?"":t)))}function mw(e,t,a){return a=a.ownerDocument.defaultView,{rect:e,abs:t.position==="absolute"||t.position==="fixed",clip:t.clipPath!=="none"||t.overflow!=="visible"||t.filter!=="none"||t.mask!=="none"||t.mask!=="none"||t.borderRadius!=="0px",view:0<=e.bottom&&0<=e.right&&e.top<=a.innerHeight&&e.left<=a.innerWidth}}function Bh(e){var t=e.getBoundingClientRect(),a=getComputedStyle(e);return mw(t,a,e)}function GN(e){var t=e.getBoundingClientRect();t=new DOMRect(t.x+2e4,t.y+2e4,t.width,t.height);var a=getComputedStyle(e);return mw(t,a,e)}function YN(e){return e.documentElement.clientHeight}function jN(e){this.addEventListener("load",e),this.addEventListener("error",e)}function XN(e,t,a,n,o,l,u,c,h){var g=t.nodeType===9?t:t.ownerDocument;try{var v=g.startViewTransition({update:function(){var f=g.defaultView,w=f.navigation&&f.navigation.transition,z=g.fonts.status;n();var E=[];if(z==="loaded"&&(YN(g),g.fonts.status==="loading"&&E.push(g.fonts.ready)),z=E.length,e!==null)for(var _=e.suspenseyImages,$=0,b=0;b<_.length;b++){var N=_[b];if(!N.complete){var k=N.getBoundingClientRect();if(0<k.bottom&&0<k.right&&k.top<f.innerHeight&&k.left<f.innerWidth){if($+=Tw(N),$>au){E.length=z;break}N=new Promise(jN.bind(N)),E.push(N)}}}if(0<E.length)return f=Promise.race([Promise.all(E),new Promise(function(R){return setTimeout(R,500)})]).then(o,o),(w?Promise.allSettled([w.finished,f]):f).then(l,l);if(o(),w)return w.finished.then(l,l);l()},types:a});g.__reactViewTransition=v;var x=[];return v.ready.then(function(){for(var f=g.documentElement.getAnimations({subtree:!0}),w=0;w<f.length;w++){var z=f[w],E=z.effect,_=E.pseudoElement;if(_!=null&&_.startsWith("::view-transition")){x.push(z),z=E.getKeyframes();for(var $=_=void 0,b=!0,N=0;N<z.length;N++){var k=z[N],R=k.width;if(_===void 0)_=R;else if(_!==R){b=!1;break}if(R=k.height,$===void 0)$=R;else if($!==R){b=!1;break}delete k.width,delete k.height,k.transform==="none"&&delete k.transform}b&&_!==void 0&&$!==void 0&&(E.setKeyframes(z),b=getComputedStyle(E.target,E.pseudoElement),b.width!==_||b.height!==$)&&(b=z[0],b.width=_,b.height=$,b=z[z.length-1],b.width=_,b.height=$,E.setKeyframes(z))}}u()},function(f){g.__reactViewTransition===v&&(g.__reactViewTransition=null);try{typeof f=="object"&&f!==null&&f.name==="InvalidStateError"&&(f.message==="View transition was skipped because document visibility state is hidden."||f.message==="Skipping view transition because document visibility state has become hidden."||f.message==="Skipping view transition because viewport size changed."||f.message==="Transition was aborted because of invalid state")&&(f=null),f!==null&&h(f)}finally{n(),o(),u()}}),v.finished.finally(function(){for(var f=0;f<x.length;f++)x[f].cancel();g.__reactViewTransition===v&&(g.__reactViewTransition=null),c()}),v}catch{return n(),o(),u(),null}}function $i(e,t){this._scope=document.documentElement,this._selector="::view-transition-"+e+"("+t+")"}$i.prototype.animate=function(e,t){return t=typeof t=="number"?{duration:t}:ke({},t),t.pseudoElement=this._selector,this._scope.animate(e,t)};$i.prototype.getAnimations=function(){for(var e=this._scope,t=this._selector,a=e.getAnimations({subtree:!0}),n=[],o=0;o<a.length;o++){var l=a[o].effect;l!==null&&l.target===e&&l.pseudoElement===t&&n.push(a[o])}return n};$i.prototype.getComputedStyle=function(){return getComputedStyle(this._scope,this._selector)};function pw(e){return{name:e,group:new $i("group",e),imagePair:new $i("image-pair",e),old:new $i("old",e),new:new $i("new",e)}}function na(e){this._fragmentFiber=e,this._observers=this._eventListeners=null}na.prototype.addEventListener=function(e,t,a){var n=null,o=null;if(!(a!=null&&typeof a!="boolean"&&(n=a.signal||null,n!==null&&n.aborted))){this._eventListeners===null&&(this._eventListeners=[]);var l=this._eventListeners;if(gw(l,e,t,a)===-1){var u=this,c=t;a!=null&&typeof a!="boolean"&&a.once===!0&&(c=function(h){u.removeEventListener(e,t,a),typeof t=="function"?t.call(this,h):t.handleEvent(h)}),n!==null&&(o=u.removeEventListener.bind(u,e,t,a),n.addEventListener("abort",o,{once:!0}),o=n.removeEventListener.bind(n,"abort",o)),n=Jo(a),l.push({type:e,listener:t,optionsOrUseCapture:a,attachedListener:c,cleanup:o}),Lt(this._fragmentFiber.child,!1,QN,e,c,n)}this._eventListeners=l}};function QN(e,t,a,n){return Fe(e).addEventListener(t,a,n),!1}na.prototype.removeEventListener=function(e,t,a){var n=this._eventListeners;if(n!==null&&(t=gw(n,e,t,a),t!==-1)){var o=n[t];a=o.attachedListener;var l=o.cleanup;o=Jo(o.optionsOrUseCapture),Lt(this._fragmentFiber.child,!1,ZN,e,a,o),n.splice(t,1),l!==null&&l()}};function ZN(e,t,a,n){return Fe(e).removeEventListener(t,a,n),!1}function Jo(e){return e!=null&&typeof e!="boolean"&&(e.once===!0||e.signal instanceof AbortSignal)?{capture:e.capture,passive:e.passive}:e}function bb(e){return e==null?"c=0":typeof e=="boolean"?"c="+(e?"1":"0"):"c="+(e.capture?"1":"0")}function gw(e,t,a,n){if(e.length===0)return-1;n=bb(n);for(var o=0;o<e.length;o++){var l=e[o];if(l.type===t&&l.listener===a&&bb(l.optionsOrUseCapture)===n)return o}return-1}na.prototype.dispatchEvent=function(e){var t=Di(this._fragmentFiber);if(t===null)return!0;t=Fe(t);var a=this._eventListeners;if(a!==null&&0<a.length||!e.bubbles){var n=t.nodeType===9?t.createComment(""):document.createTextNode("");if(a)for(var o=0;o<a.length;o++){var l=a[o];n.addEventListener(l.type,l.attachedListener,Jo(l.optionsOrUseCapture))}if(t.appendChild(n),e=n.dispatchEvent(e),a)for(o=0;o<a.length;o++)l=a[o],n.removeEventListener(l.type,l.attachedListener,Jo(l.optionsOrUseCapture));return t.removeChild(n),e}return t.dispatchEvent(e)};na.prototype.focus=function(e){Lt(this._fragmentFiber.child,!0,fw,e,void 0,void 0)};function fw(e,t){return e.tag===6?!1:(e=Fe(e),lS(e,t))}na.prototype.focusLast=function(e){var t=[];Lt(this._fragmentFiber.child,!0,qm,t,void 0,void 0);for(var a=t.length-1;0<=a&&!fw(t[a],e);a--);};function qm(e,t){return t.push(e),!1}na.prototype.blur=function(){var e=Di(this._fragmentFiber);e!==null&&(e=Fe(e),e=pr(e).activeElement,e!==null&&Lt(this._fragmentFiber.child,!1,KN,e,void 0,void 0))};function KN(e,t){return e.tag===6?!1:(e=Fe(e),e===t||e.contains(t)?(t.blur(),!0):!1)}na.prototype.observeUsing=function(e){this._observers===null&&(this._observers=new Set),this._observers.add(e),Lt(this._fragmentFiber.child,!1,JN,e,void 0,void 0)};function JN(e,t){return e.tag===6||(e=Fe(e),t.observe(e)),!1}na.prototype.unobserveUsing=function(e){var t=this._observers;if(t!==null&&t.has(e)){t.delete(e),Lt(this._fragmentFiber.child,!1,PN,e,void 0,void 0);for(var a=t=0;a<Aa.length;a++){var n=Aa[a];n.fragmentInstance===this&&n.observer===e?e.unobserve(n.instance):Aa[t++]=n}Aa.length=t}};function PN(e,t){return e.tag===6||(e=Fe(e),t.unobserve(e)),!1}var Aa=[],Vd=!1;function FN(e,t,a){Aa.push({fragmentInstance:e,observer:t,instance:a}),Vd||(Vd=!0,rS(function(){Vd=!1;var n=Aa;Aa=[];for(var o=0;o<n.length;o++){var l=n[o];l.observer.unobserve(l.instance)}}))}na.prototype.getClientRects=function(){var e=[];return Lt(this._fragmentFiber.child,!1,WN,e,void 0,void 0),e};function WN(e,t){if(e.tag===6){e=e.stateNode;var a=e.ownerDocument.createRange();a.selectNodeContents(e),t.push.apply(t,a.getClientRects())}else e=Fe(e),t.push.apply(t,e.getClientRects());return!1}na.prototype.getRootNode=function(e){var t=Di(this._fragmentFiber);return t===null?this:Fe(t).getRootNode(e)};na.prototype.compareDocumentPosition=function(e){var t=Di(this._fragmentFiber);if(t===null)return Node.DOCUMENT_POSITION_DISCONNECTED;var a=[];Lt(this._fragmentFiber.child,!1,qm,a,void 0,void 0);var n=Fe(t);if(a.length===0){if(a=n,Kg(this._fragmentFiber)){e:{for(t=this._fragmentFiber.return;t!==null;){if(t.tag===4){t=t.stateNode.containerInfo;break e}if(t.tag===3||t.tag===5||t.tag===27)break;t=t.return}t=null}t!=null&&(a=t)}t=this._fragmentFiber;var o=n=a.compareDocumentPosition(e);return a===e?o=Node.DOCUMENT_POSITION_CONTAINS:n&Node.DOCUMENT_POSITION_CONTAINED_BY&&(a=Ub(t)[1],a===null?o=Node.DOCUMENT_POSITION_PRECEDING:(e=Fe(a).compareDocumentPosition(e),o=e===0||e&Node.DOCUMENT_POSITION_FOLLOWING?Node.DOCUMENT_POSITION_FOLLOWING:Node.DOCUMENT_POSITION_PRECEDING)),o|=Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC}t=Fe(a[0]),o=Fe(a[a.length-1]);var l=Kg(this._fragmentFiber)?t.parentElement:n;if(l==null)return Node.DOCUMENT_POSITION_DISCONNECTED;n=l.compareDocumentPosition(t)&Node.DOCUMENT_POSITION_CONTAINED_BY,l=l.compareDocumentPosition(o)&Node.DOCUMENT_POSITION_CONTAINED_BY;var u=t.compareDocumentPosition(e),c=o.compareDocumentPosition(e),h=u&Node.DOCUMENT_POSITION_CONTAINED_BY||c&Node.DOCUMENT_POSITION_CONTAINED_BY;return c=n&&l&&u&Node.DOCUMENT_POSITION_FOLLOWING&&c&Node.DOCUMENT_POSITION_PRECEDING,t=n&&t===e||l&&o===e||h||c?Node.DOCUMENT_POSITION_CONTAINED_BY:!n&&t===e||!l&&o===e?Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC:u,t&Node.DOCUMENT_POSITION_DISCONNECTED||t&Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC||eS(t,this._fragmentFiber,a[0],a[a.length-1],e)?t:Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC};function eS(e,t,a,n,o){var l=wi(o);if(e&Node.DOCUMENT_POSITION_CONTAINED_BY){if(a=!!l)e:{for(;l!==null;){if(l.tag===7&&(l===t||l.alternate===t)){a=!0;break e}l=l.return}a=!1}return a}if(e&Node.DOCUMENT_POSITION_CONTAINS){if(l===null)return l=o.ownerDocument,o===l||o===l.documentElement||o===l.body;e:{for(l=t,t=Di(t);l!==null;){if(!(l.tag!==5&&l.tag!==3&&l.tag!==27||l!==t&&l.alternate!==t)){l=!0;break e}l=l.return}l=!1}return l}return e&Node.DOCUMENT_POSITION_PRECEDING?((t=!!l)&&!(t=l===a)&&(t=Hd(a,l,Jg),t===null?t=!1:(Lt(t,!0,z$,l,a),l=wo,wo=null,t=l!==null)),t):e&Node.DOCUMENT_POSITION_FOLLOWING?((t=!!l)&&!(t=l===n)&&(t=Hd(n,l,Jg),t===null?t=!1:(Lt(t,!0,M$,l,n),l=wo,_d=wo=null,t=l!==null)),t):!1}function vb(e,t){var a=e.ownerDocument.createRange();a.selectNodeContents(e),e=a.getBoundingClientRect(),window.scrollTo(window.scrollX+e.left,t?window.scrollY+e.top:window.scrollY+e.bottom-window.innerHeight)}na.prototype.scrollIntoView=function(e){if(typeof e=="object")throw Error(A(566));var t=[];Lt(this._fragmentFiber.child,!1,qm,t,void 0,void 0);var a=e!==!1;if(t.length===0){var n=Ub(this._fragmentFiber);if(n=a?n[1]||n[0]||Di(this._fragmentFiber):n[0]||n[1],n===null)return;if(n.tag===6){e=Fe(n),vb(e,a);return}if(n=Fe(n),n.nodeType!==9){if(n.nodeType===11){a="host"in n?n.host:null,a!==null&&a.scrollIntoView(e);return}n.scrollIntoView(e)}}for(n=a?t.length-1:0;n!==(a?-1:t.length);){var o=t[n];o.tag===6?(o=Fe(o),vb(o,a)):Fe(o).scrollIntoView(e),n+=a?-1:1}};function tS(e,t){return e=Fe(e),bw(e,t),!1}function bw(e,t){e.reactFragments==null&&(e.reactFragments=new Set),e.reactFragments.add(t)}function vw(e,t){var a=t._eventListeners;if(a!==null)for(var n=0;n<a.length;n++){var o=a[n];e.addEventListener(o.type,o.attachedListener,Jo(o.optionsOrUseCapture))}e.nodeType!==3&&(a=t._observers,a!==null&&a.forEach(function(l){for(var u=0,c=0;c<Aa.length;c++){var h=Aa[c];(h.fragmentInstance!==t||h.observer!==l||h.instance!==e)&&(Aa[u++]=h)}Aa.length=u,l.observe(e)}),bw(e,t))}function aS(e,t){var a=t._eventListeners;if(a!==null)for(var n=0;n<a.length;n++){var o=a[n];e.removeEventListener(o.type,o.attachedListener,Jo(o.optionsOrUseCapture))}e.nodeType!==3&&(a=t._observers,a!==null&&a.forEach(function(l){typeof l.rootMargin=="string"?FN(t,l,e):l.unobserve(e)}),e.reactFragments!=null&&e.reactFragments.delete(t))}function Ih(e){var t=e.firstChild;for(t&&t.nodeType===10&&(t=t.nextSibling);t;){var a=t;switch(t=t.nextSibling,a.nodeName){case"HTML":case"HEAD":case"BODY":Ih(a),Du(a);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(a.rel.toLowerCase()==="stylesheet")continue}e.removeChild(a)}}function nS(e,t,a,n){for(;e.nodeType===1;){var o=a;if(e.nodeName.toLowerCase()!==t.toLowerCase()){if(!n&&(e.nodeName!=="INPUT"||e.type!=="hidden"))break}else if(n){if(!e[Nr])switch(t){case"meta":if(!e.hasAttribute("itemprop"))break;return e;case"link":if(l=e.getAttribute("rel"),l==="stylesheet"&&e.hasAttribute("data-precedence"))break;if(l!==o.rel||e.getAttribute("href")!==(o.href==null||o.href===""?null:o.href)||e.getAttribute("crossorigin")!==(o.crossOrigin==null?null:o.crossOrigin)||e.getAttribute("title")!==(o.title==null?null:o.title))break;return e;case"style":if(e.hasAttribute("data-precedence"))break;return e;case"script":if(l=e.getAttribute("src"),(l!==(o.src==null?null:o.src)||e.getAttribute("type")!==(o.type==null?null:o.type)||e.getAttribute("crossorigin")!==(o.crossOrigin==null?null:o.crossOrigin))&&l&&e.hasAttribute("async")&&!e.hasAttribute("itemprop"))break;return e;default:return e}}else if(t==="input"&&e.type==="hidden"){var l=o.name==null?null:""+o.name;if(o.type==="hidden"&&e.getAttribute("name")===l)return e}else return e;if(e=ba(e.nextSibling),e===null)break}return null}function iS(e,t,a){if(t==="")return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!a||(e=ba(e.nextSibling),e===null))return null;return e}function yw(e,t){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!t||(e=ba(e.nextSibling),e===null))return null;return e}function Lh(e){return e.data==="$?"||e.data==="$~"}function Bm(e){return e.data==="$!"||e.data==="$?"&&e.ownerDocument.readyState!=="loading"}function oS(e,t){var a=e.ownerDocument;if(e.data==="$~")e._reactRetry=t;else if(e.data!=="$?"||a.readyState!=="loading")t();else{var n=function(){t(),a.removeEventListener("DOMContentLoaded",n)};a.addEventListener("DOMContentLoaded",n),e._reactRetry=n}}function ba(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?"||t==="$~"||t==="&"||t==="F!"||t==="F")break;if(t==="/$"||t==="/&")return null}}return e}var Gh=null;function yb(e){e=e.nextSibling;for(var t=0;e;){if(e.nodeType===8){var a=e.data;if(a==="/$"||a==="/&"){if(t===0)return ba(e.nextSibling);t--}else a!=="$"&&a!=="$!"&&a!=="$?"&&a!=="$~"&&a!=="&"||t++}e=e.nextSibling}return null}function wb(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var a=e.data;if(a==="$"||a==="$!"||a==="$?"||a==="$~"||a==="&"){if(t===0)return e;t--}else a!=="/$"&&a!=="/&"||t++}e=e.previousSibling}return null}function lS(e,t){function a(){n=!0}if(e.ownerDocument.activeElement===e)return!0;var n=!1;try{e.ownerDocument.addEventListener("focus",a,!0),(e.focus||HTMLElement.prototype.focus).call(e,t)}finally{e.ownerDocument.removeEventListener("focus",a,!0)}return n}function rS(e){pb(function(){pb(function(t){return e(t)})})}function ww(e,t,a){switch(t=pr(a),e){case"html":if(e=t.documentElement,!e)throw Error(A(452));return e;case"head":if(e=t.head,!e)throw Error(A(453));return e;case"body":if(e=t.body,!e)throw Error(A(454));return e;default:throw Error(A(451))}}function $w(e,t,a){for(var n in a){var o=a[n];a.hasOwnProperty(n)&&o!=null&&ye(e,t,n,null,_N,o)}a.dangerouslySetInnerHTML!=null&&(e.textContent=""),e.onclick===Xa&&(e.onclick=null),Du(e)}function Dd(e){for(var t=e.attributes;t.length;)e.removeAttributeNode(t[0]);Du(e)}var va=new Map,$b=new Set;function gr(e){if(typeof e.getRootNode=="function"){var t=e.getRootNode();if(t.nodeType===9||t.nodeType===11)return t}return e.nodeType===9?e:e.ownerDocument}var yn=pe.d;pe.d={f:sS,r:uS,D:cS,C:dS,L:hS,m:mS,X:gS,S:pS,M:fS};function sS(){var e=yn.f(),t=Ku();return e||t}function uS(e){var t=al(e);t!==null&&t.tag===5&&t.type==="form"?oy(t):yn.r(e)}var ll=typeof document>"u"?null:document;function xw(e,t,a){var n=ll;if(n&&typeof t=="string"&&t){var o=pa(t);o='link[rel="'+e+'"][href="'+o+'"]',typeof a=="string"&&(o+='[crossorigin="'+a+'"]'),$b.has(o)||($b.add(o),e={rel:e,crossOrigin:a,href:t},n.querySelector(o)===null&&(t=n.createElement("link"),gt(t,"link",e),it(t),n.head.appendChild(t)))}}function cS(e){yn.D(e),xw("dns-prefetch",e,null)}function dS(e,t){yn.C(e,t),xw("preconnect",e,t)}function hS(e,t,a){yn.L(e,t,a);var n=ll;if(n&&e&&t){var o='link[rel="preload"][as="'+pa(t)+'"]';t==="image"&&a&&a.imageSrcSet?(o+='[imagesrcset="'+pa(a.imageSrcSet)+'"]',typeof a.imageSizes=="string"&&(o+='[imagesizes="'+pa(a.imageSizes)+'"]')):o+='[href="'+pa(e)+'"]';var l=o;switch(t){case"style":l=Po(e);break;case"script":l=rl(e)}if(!(va.has(l)||(e=ke({rel:"preload",href:t==="image"&&a&&a.imageSrcSet?void 0:e,as:t},a),va.set(l,e),n.querySelector(o)!==null||t==="style"&&n.querySelector(Ar(l))||t==="script"&&n.querySelector(zr(l))))){var u=n.createElement("link");gt(u,"link",e),t==="style"&&(u[uu]=!0,u.onload=u.onerror=function(){Pb(u)}),it(u),n.head.appendChild(u)}}}function mS(e,t){yn.m(e,t);var a=ll;if(a&&e){var n=t&&typeof t.as=="string"?t.as:"script",o='link[rel="modulepreload"][as="'+pa(n)+'"][href="'+pa(e)+'"]',l=o;switch(n){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":l=rl(e)}if(!va.has(l)&&(e=ke({rel:"modulepreload",href:e},t),va.set(l,e),a.querySelector(o)===null)){switch(n){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(a.querySelector(zr(l)))return}n=a.createElement("link"),gt(n,"link",e),it(n),a.head.appendChild(n)}}}function pS(e,t,a){yn.S(e,t,a);var n=ll;if(n&&e){var o=Oo(n).hoistableStyles,l=Po(e);t=t||"default";var u=o.get(l);if(!u){var c={loading:0,preload:null};if(u=n.querySelector(Ar(l)))c.loading=5;else{e=ke({rel:"stylesheet",href:e,"data-precedence":t},a),(a=va.get(l))&&Im(e,a);var h=u=n.createElement("link");it(h),gt(h,"link",e),h._p=new Promise(function(g,v){h.onload=g,h.onerror=v}),h.addEventListener("load",function(){c.loading|=1}),h.addEventListener("error",function(){c.loading|=2}),c.loading|=4,eu(u,t,n)}u={type:"stylesheet",instance:u,count:1,state:c},o.set(l,u)}}}function gS(e,t){yn.X(e,t);var a=ll;if(a&&e){var n=Oo(a).hoistableScripts,o=rl(e),l=n.get(o);l||(l=a.querySelector(zr(o)),l||(e=ke({src:e,async:!0},t),(t=va.get(o))&&Lm(e,t),l=a.createElement("script"),it(l),gt(l,"link",e),a.head.appendChild(l)),l={type:"script",instance:l,count:1,state:null},n.set(o,l))}}function fS(e,t){yn.M(e,t);var a=ll;if(a&&e){var n=Oo(a).hoistableScripts,o=rl(e),l=n.get(o);l||(l=a.querySelector(zr(o)),l||(e=ke({src:e,async:!0,type:"module"},t),(t=va.get(o))&&Lm(e,t),l=a.createElement("script"),it(l),gt(l,"link",e),a.head.appendChild(l)),l={type:"script",instance:l,count:1,state:null},n.set(o,l))}}function xb(e,t,a,n){var o=(o=Gn.current)?gr(o):null;if(!o)throw Error(A(446));switch(e){case"meta":case"title":return null;case"style":return typeof a.precedence=="string"&&typeof a.href=="string"?(a=Po(a.href),t=Oo(o).hoistableStyles,n=t.get(a),n||(n={type:"style",instance:null,count:0,state:null},t.set(a,n)),n):{type:"void",instance:null,count:0,state:null};case"link":if(a.rel==="stylesheet"&&typeof a.href=="string"&&typeof a.precedence=="string"){e=Po(a.href);var l=Oo(o).hoistableStyles,u=l.get(e);if(u||(o=o.ownerDocument||o,u={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},l.set(e,u),(l=o.querySelector(Ar(e)))?l._p||(u.instance=l,u.state.loading=5):(l=va.get(e),l||(l={rel:"preload",as:"style",href:a.href,crossOrigin:a.crossOrigin,integrity:a.integrity,media:a.media,hrefLang:a.hrefLang,referrerPolicy:a.referrerPolicy},va.set(e,l)),bS(o,e,l,u.state))),t&&n===null)throw Error(A(528,""));return u}if(t&&n!==null)throw Error(A(529,""));return null;case"script":return t=a.async,a=a.src,typeof a=="string"&&t&&typeof t!="function"&&typeof t!="symbol"?(a=rl(a),t=Oo(o).hoistableScripts,n=t.get(a),n||(n={type:"script",instance:null,count:0,state:null},t.set(a,n)),n):{type:"void",instance:null,count:0,state:null};default:throw Error(A(444,e))}}function Po(e){return'href="'+pa(e)+'"'}function Ar(e){return'link[rel="stylesheet"]['+e+"]"}function Nw(e){return ke({},e,{"data-precedence":e.precedence,precedence:null})}function bS(e,t,a,n){if(t=e.querySelector('link[rel="preload"][as="style"]['+t+"]")){if(t[uu]!==!0){n.loading=1;return}}else t=e.createElement("link"),t[uu]=!0,t.onload=t.onerror=Pb.bind(null,t),gt(t,"link",a),it(t),e.head.appendChild(t);n.preload=t,t.addEventListener("load",function(){return n.loading|=1}),t.addEventListener("error",function(){return n.loading|=2})}function rl(e){return'[src="'+pa(e)+'"]'}function zr(e){return"script[async]"+e}function Nb(e,t,a){if(t.count++,t.instance===null)switch(t.type){case"style":var n=e.querySelector('style[data-href~="'+pa(a.href)+'"]');if(n)return t.instance=n,it(n),n;var o=ke({},a,{"data-href":a.href,"data-precedence":a.precedence,href:null,precedence:null});return n=(e.ownerDocument||e).createElement("style"),it(n),gt(n,"style",o),eu(n,a.precedence,e),t.instance=n;case"stylesheet":o=Po(a.href);var l=e.querySelector(Ar(o));if(l)return t.state.loading|=4,t.instance=l,it(l),l;n=Nw(a),(o=va.get(o))&&Im(n,o),l=(e.ownerDocument||e).createElement("link"),it(l);var u=l;return u._p=new Promise(function(c,h){u.onload=c,u.onerror=h}),gt(l,"link",n),t.state.loading|=4,eu(l,a.precedence,e),t.instance=l;case"script":return l=rl(a.src),(o=e.querySelector(zr(l)))?(t.instance=o,it(o),o):(n=a,(o=va.get(l))&&(n=ke({},a),Lm(n,o)),e=e.ownerDocument||e,o=e.createElement("script"),it(o),gt(o,"link",n),e.head.appendChild(o),t.instance=o);case"void":return null;default:throw Error(A(443,t.type))}else t.type==="stylesheet"&&(t.state.loading&4)===0&&(n=t.instance,t.state.loading|=4,eu(n,a.precedence,e));return t.instance}function eu(e,t,a){for(var n=a.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),o=n.length?n[n.length-1]:null,l=o,u=0;u<n.length;u++){var c=n[u];if(c.dataset.precedence===t)l=c;else if(l!==o)break}l?l.parentNode.insertBefore(e,l.nextSibling):(t=a.nodeType===9?a.head:a,t.insertBefore(e,t.firstChild))}function Im(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.title==null&&(e.title=t.title)}function Lm(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.integrity==null&&(e.integrity=t.integrity)}var tu=null;function Sb(e,t,a){if(tu===null){var n=new Map,o=tu=new Map;o.set(a,n)}else o=tu,n=o.get(a),n||(n=new Map,o.set(a,n));if(n.has(e))return n;for(n.set(e,null),a=a.getElementsByTagName(e),o=0;o<a.length;o++){var l=a[o];if(!(l[Nr]||l[dt]||e==="link"&&l.getAttribute("rel")==="stylesheet")&&l.namespaceURI!=="http://www.w3.org/2000/svg"){var u=l.getAttribute(t)||"";u=e+u;var c=n.get(u);c?c.push(l):n.set(u,[l])}}return n}function Yh(e,t,a){e=e.ownerDocument||e,e.head.insertBefore(a,t==="title"?e.querySelector("head > title"):null)}function vS(e,t,a){if(a===1||t.itemProp!=null)return!1;switch(e){case"meta":case"title":return!0;case"style":if(typeof t.precedence!="string"||typeof t.href!="string"||t.href==="")break;return!0;case"link":if(typeof t.rel!="string"||typeof t.href!="string"||t.href===""||t.onLoad||t.onError)break;return t.rel==="stylesheet"?(e=t.disabled,typeof t.precedence=="string"&&e==null):!0;case"script":if(t.async&&typeof t.async!="function"&&typeof t.async!="symbol"&&!t.onLoad&&!t.onError&&t.src&&typeof t.src=="string")return!0}return!1}function Tb(e,t){return e==="img"&&t.src!=null&&t.src!==""&&t.onLoad==null&&t.loading!=="lazy"}function Sw(e){return!(e.type==="stylesheet"&&(e.state.loading&3)===0)}function Tw(e){return(e.width||100)*(e.height||100)*(typeof devicePixelRatio=="number"?devicePixelRatio:1)*.25}function Eb(e,t){typeof t.decode=="function"&&(e.imgCount++,t.complete||(e.imgBytes+=Tw(t),e.suspenseyImages.push(t)),e=$S.bind(e),t.decode().then(e,e))}function yS(e,t,a,n){if(a.type==="stylesheet"&&(typeof n.media!="string"||matchMedia(n.media).matches!==!1)&&(a.state.loading&4)===0){if(a.instance===null){var o=Po(n.href),l=t.querySelector(Ar(o));if(l){t=l._p,t!==null&&typeof t=="object"&&typeof t.then=="function"&&(e.count++,e=fr.bind(e),t.then(e,e)),a.state.loading|=4,a.instance=l,it(l);return}l=t.ownerDocument||t,n=Nw(n),(o=va.get(o))&&Im(n,o),l=l.createElement("link"),it(l);var u=l;u._p=new Promise(function(c,h){u.onload=c,u.onerror=h}),gt(l,"link",n),a.instance=l}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(a,t),(t=a.state.preload)&&(a.state.loading&3)===0&&(e.count++,a=fr.bind(e),t.addEventListener("load",a),t.addEventListener("error",a))}}var au=0;function wS(e,t){return e.stylesheets&&e.count===0&&nu(e,e.stylesheets),0<e.count||0<e.imgCount?function(a){var n=setTimeout(function(){if(e.stylesheets&&nu(e,e.stylesheets),e.unsuspend){var l=e.unsuspend;e.unsuspend=null,l()}},6e4+t);0<e.imgBytes&&au===0&&(au=62500*UN());var o=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&nu(e,e.stylesheets),e.unsuspend)){var l=e.unsuspend;e.unsuspend=null,l()}},(e.imgBytes>au?50:800)+t);return e.unsuspend=a,function(){e.unsuspend=null,clearTimeout(n),clearTimeout(o)}}:null}function Ew(e){if(e.count===0&&(e.imgCount===0||!e.waitingForImages)){if(e.stylesheets)nu(e,e.stylesheets);else if(e.unsuspend){var t=e.unsuspend;e.unsuspend=null,t()}}}function fr(){this.count--,Ew(this)}function $S(){this.imgCount--,Ew(this)}var Ou=null;function nu(e,t){e.stylesheets=null,e.unsuspend!==null&&(e.count++,Ou=new Map,t.forEach(xS,e),Ou=null,fr.call(e))}function xS(e,t){if(!(t.state.loading&4)){var a=Ou.get(e);if(a)var n=a.get(null);else{a=new Map,Ou.set(e,a);for(var o=e.querySelectorAll("link[data-precedence],style[data-precedence]"),l=0;l<o.length;l++){var u=o[l];(u.nodeName==="LINK"||u.getAttribute("media")!=="not all")&&(a.set(u.dataset.precedence,u),n=u)}n&&a.set(null,n)}o=t.instance,u=o.getAttribute("data-precedence"),l=a.get(u)||n,l===n&&a.set(null,o),a.set(u,o),this.count++,n=fr.bind(this),o.addEventListener("load",n),o.addEventListener("error",n),l?l.parentNode.insertBefore(o,l.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(o,e.firstChild)),t.state.loading|=4}}var Fo={$$typeof:ja,Provider:null,Consumer:null,_currentValue:xi,_currentValue2:xi,_threadCount:0};function NS(e,t,a,n,o,l,u,c,h){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=ud(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=ud(0),this.hiddenUpdates=ud(null),this.identifierPrefix=n,this.onUncaughtError=o,this.onCaughtError=l,this.onRecoverableError=u,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=h,this.transitionTypes=null,this.incompleteTransitions=new Map}function kw(e,t,a,n,o,l,u,c,h,g,v,x){return e=new NS(e,t,a,u,h,g,v,x,c),t=1,l===!0&&(t|=24),l=Bt(3,null,null,t),e.current=l,l.stateNode=e,t=sm(),t.refCount++,e.pooledCache=t,t.refCount++,l.memoizedState={element:n,isDehydrated:a,cache:t},dm(l),e}function Cw(e){return e?(e=Co,e):Co}function Aw(e,t,a,n,o,l){o=Cw(o),n.context===null?n.context=o:n.pendingContext=o,n=jn(t),n.payload={element:a},l=l===void 0?null:l,l!==null&&(n.callback=l),a=Xn(e,n,t),a!==null&&(It(a,e,t),Zl(a,e,t))}function kb(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var a=e.retryLane;e.retryLane=a!==0&&a<t?a:t}}function Gm(e,t){kb(e,t),(e=e.alternate)&&kb(e,t)}function zw(e){if(e.tag===13||e.tag===31){var t=Ui(e,67108864);t!==null&&It(t,e,67108864),Gm(e,67108864)}}function Cb(e){if(e.tag===13||e.tag===31){var t=ta();t=Jh(t);var a=Ui(e,t);a!==null&&It(a,e,t),Gm(e,t)}}var Wo=!0;function SS(e,t,a,n){var o=F.T;F.T=null;var l=pe.p;try{pe.p=2,Ym(e,t,a,n)}finally{pe.p=l,F.T=o}}function TS(e,t,a,n){var o=F.T;F.T=null;var l=pe.p;try{pe.p=8,Ym(e,t,a,n)}finally{pe.p=l,F.T=o}}function Ym(e,t,a,n){if(Wo){var o=jh(n);if(o===null)Od(e,t,n,Ru,a),Ab(e,n);else if(kS(o,e,t,a,n))n.stopPropagation();else if(Ab(e,n),t&4&&-1<ES.indexOf(e)){for(;o!==null;){var l=al(o);if(l!==null)switch(l.tag){case 3:if(l=l.stateNode,l.current.memoizedState.isDehydrated){var u=bi(l.pendingLanes);if(u!==0){var c=l;for(c.pendingLanes|=2,c.entangledLanes|=2;u;){var h=1<<31-ea(u);c.entanglements[1]|=h,u&=~h}Wa(l),(me&6)===0&&(ku=Ft()+500,Cr(0,!1))}}break;case 31:case 13:c=Ui(l,2),c!==null&&It(c,l,2),Ku(),Gm(l,2)}if(l=jh(n),l===null&&Od(e,t,n,Ru,a),l===o)break;o=l}o!==null&&n.stopPropagation()}else Od(e,t,n,null,a)}}function jh(e){return e=Wh(e),jm(e)}var Ru=null;function jm(e){if(Ru=null,e=wi(e),e!==null){var t=yr(e);if(t===null)e=null;else{var a=t.tag;if(a===13){if(e=Db(t),e!==null)return e;e=null}else if(a===31){if(e=_b(t),e!==null)return e;e=null}else if(a===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null)}}return Ru=e,null}function Mw(e){switch(e){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"fullscreenerror":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"resize":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(B$()){case Lb:return 2;case Gb:return 8;case su:case I$:return 32;case Yb:return 268435456;default:return 32}default:return 32}}var Xh=!1,Jn=null,Pn=null,Fn=null,br=new Map,vr=new Map,_n=[],ES="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function Ab(e,t){switch(e){case"focusin":case"focusout":Jn=null;break;case"dragenter":case"dragleave":Pn=null;break;case"mouseover":case"mouseout":Fn=null;break;case"pointerover":case"pointerout":br.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":vr.delete(t.pointerId)}}function Hl(e,t,a,n,o,l){return e===null||e.nativeEvent!==l?(e={blockedOn:t,domEventName:a,eventSystemFlags:n,nativeEvent:l,targetContainers:[o]},t!==null&&(t=al(t),t!==null&&zw(t)),e):(e.eventSystemFlags|=n,t=e.targetContainers,o!==null&&t.indexOf(o)===-1&&t.push(o),e)}function kS(e,t,a,n,o){switch(t){case"focusin":return Jn=Hl(Jn,e,t,a,n,o),!0;case"dragenter":return Pn=Hl(Pn,e,t,a,n,o),!0;case"mouseover":return Fn=Hl(Fn,e,t,a,n,o),!0;case"pointerover":var l=o.pointerId;return br.set(l,Hl(br.get(l)||null,e,t,a,n,o)),!0;case"gotpointercapture":return l=o.pointerId,vr.set(l,Hl(vr.get(l)||null,e,t,a,n,o)),!0}return!1}function Ow(e){var t=wi(e.target);if(t!==null){var a=yr(t);if(a!==null){if(t=a.tag,t===13){if(t=Db(a),t!==null){e.blockedOn=t,ef(e.priority,function(){Cb(a)});return}}else if(t===31){if(t=_b(a),t!==null){e.blockedOn=t,ef(e.priority,function(){Cb(a)});return}}else if(t===3&&a.stateNode.current.memoizedState.isDehydrated){e.blockedOn=a.tag===3?a.stateNode.containerInfo:null;return}}}e.blockedOn=null}function iu(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var a=jh(e.nativeEvent);if(a===null){a=e.nativeEvent;var n=new a.constructor(a.type,a);Kd=n,a.target.dispatchEvent(n),Kd=null}else return t=al(a),t!==null&&zw(t),e.blockedOn=a,!1;t.shift()}return!0}function zb(e,t,a){iu(e)&&a.delete(t)}function CS(){Xh=!1,Jn!==null&&iu(Jn)&&(Jn=null),Pn!==null&&iu(Pn)&&(Pn=null),Fn!==null&&iu(Fn)&&(Fn=null),br.forEach(zb),vr.forEach(zb)}function Us(e,t){e.blockedOn===t&&(e.blockedOn=null,Xh||(Xh=!0,We.unstable_scheduleCallback(We.unstable_NormalPriority,CS)))}var qs=null;function Mb(e){qs!==e&&(qs=e,We.unstable_scheduleCallback(We.unstable_NormalPriority,function(){qs===e&&(qs=null);for(var t=0;t<e.length;t+=3){var a=e[t],n=e[t+1],o=e[t+2];if(typeof n!="function"){if(jm(n||a)===null)continue;break}var l=al(a);l!==null&&(e.splice(t,3),t-=3,dh(l,{pending:!0,data:o,method:a.method,action:n},n,o))}}))}function el(e){function t(h){return Us(h,e)}Jn!==null&&Us(Jn,e),Pn!==null&&Us(Pn,e),Fn!==null&&Us(Fn,e),br.forEach(t),vr.forEach(t);for(var a=0;a<_n.length;a++){var n=_n[a];n.blockedOn===e&&(n.blockedOn=null)}for(;0<_n.length&&(a=_n[0],a.blockedOn===null);)Ow(a),a.blockedOn===null&&_n.shift();if(a=(e.ownerDocument||e).$$reactFormReplay,a!=null)for(n=0;n<a.length;n+=3){var o=a[n],l=a[n+1],u=o[Gt]||null;if(typeof l=="function")u||Mb(a);else if(u){var c=null;if(l&&l.hasAttribute("formAction")){if(o=l,u=l[Gt]||null)c=u.formAction;else if(jm(o)!==null)continue}else c=u.action;typeof c=="function"?a[n+1]=c:(a.splice(n,3),n-=3),Mb(a)}}}function Rw(){function e(l){l.canIntercept&&l.info==="react-transition"&&l.intercept({handler:function(){return new Promise(function(u){return o=u})},focusReset:"manual",scroll:"manual"})}function t(){o!==null&&(o(),o=null),n||setTimeout(a,20)}function a(){if(!n&&!navigation.transition){var l=navigation.currentEntry;l&&l.url!=null&&navigation.navigate(l.url,{state:l.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var n=!1,o=null;return navigation.addEventListener("navigate",e),navigation.addEventListener("navigatesuccess",t),navigation.addEventListener("navigateerror",t),setTimeout(a,100),function(){n=!0,navigation.removeEventListener("navigate",e),navigation.removeEventListener("navigatesuccess",t),navigation.removeEventListener("navigateerror",t),o!==null&&(o(),o=null)}}}function Xm(e){this._internalRoot=e}Fu.prototype.render=Xm.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(A(409));var a=t.current,n=ta();Aw(a,n,e,t,null,null)};Fu.prototype.unmount=Xm.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;Aw(e.current,2,null,e,null,null),Ku(),t[tl]=null}};function Fu(e){this._internalRoot=e}Fu.prototype.unstable_scheduleHydration=function(e){if(e){var t=Jb();e={blockedOn:null,target:e,priority:t};for(var a=0;a<_n.length&&t!==0&&t<_n[a].priority;a++);_n.splice(a,0,e),a===0&&Ow(e)}};var Ob=Rb.version;if(Ob!=="19.3.0")throw Error(A(527,Ob,"19.3.0"));pe.findDOMNode=function(e){var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(A(188)):(e=Object.keys(e).join(","),Error(A(268,e)));return e=A$(t),e=e!==null?Hb(e):null,e=e===null?null:e.stateNode,e};var AS={bundleType:0,version:"19.3.0",rendererPackageName:"react-dom",currentDispatcherRef:F,reconcilerVersion:"19.3.0"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(Ul=__REACT_DEVTOOLS_GLOBAL_HOOK__,!Ul.isDisabled&&Ul.supportsFiber))try{wr=Ul.inject(AS),Wt=Ul}catch{}var Ul;Wu.createRoot=function(e,t){if(!Vb(e))throw Error(A(299));var a=!1,n="",o=my,l=py,u=gy;return t!=null&&(t.unstable_strictMode===!0&&(a=!0),t.identifierPrefix!==void 0&&(n=t.identifierPrefix),t.onUncaughtError!==void 0&&(o=t.onUncaughtError),t.onCaughtError!==void 0&&(l=t.onCaughtError),t.onRecoverableError!==void 0&&(u=t.onRecoverableError)),t=kw(e,1,!1,null,null,a,n,null,o,l,u,Rw),e[tl]=t.current,Hm(e),new Xm(t)};Wu.hydrateRoot=function(e,t,a){if(!Vb(e))throw Error(A(299));var n=!1,o="",l=my,u=py,c=gy,h=null;return a!=null&&(a.unstable_strictMode===!0&&(n=!0),a.identifierPrefix!==void 0&&(o=a.identifierPrefix),a.onUncaughtError!==void 0&&(l=a.onUncaughtError),a.onCaughtError!==void 0&&(u=a.onCaughtError),a.onRecoverableError!==void 0&&(c=a.onRecoverableError),a.formState!==void 0&&(h=a.formState)),t=kw(e,1,!0,t,a??null,n,o,h,l,u,c,Rw),t.context=Cw(null),a=t.current,n=ta(),n=Jh(n),o=jn(n),o.callback=null,Xn(a,o,n),a=n,t.current.lanes=a,xr(t,a),Wa(t),e[tl]=t.current,Hm(e),new Fu(t)};Wu.version="19.3.0"});var Hw=Ua((q5,_w)=>{"use strict";function Dw(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Dw)}catch(e){console.error(e)}}Dw(),_w.exports=Vw()});var Fw=Ua(nc=>{"use strict";var _S=Symbol.for("react.transitional.element"),HS=Symbol.for("react.fragment");function Pw(e,t,a){var n=null;if(a!==void 0&&(n=""+a),t.key!==void 0&&(n=""+t.key),"key"in t){a={};for(var o in t)o!=="key"&&(a[o]=t[o])}else a=t;return t=a.ref,{$$typeof:_S,type:e,key:n,ref:t!==void 0?t:null,props:a}}nc.Fragment=HS;nc.jsx=Pw;nc.jsxs=Pw});var Km=Ua((Z5,Ww)=>{"use strict";Ww.exports=Fw()});var m=hs(ps()),x0=hs(Hw());function zS(e,t=!1){let a=e.replace(/\r\n?/g,`
`).split(`
`),n="",o=[],l=[];for(let u=0;u<a.length;u++){let c=a[u],h=/^ {0,3}(`{3,}|~{3,})/.exec(c)?.[1];if(h&&(n?h[0]===n[0]&&h.length>=n.length&&(n=""):n=h),!n&&!c.trim()&&(!t||u<a.length-1)){let g=o.join(`
`).trim();g&&l.push(g),o=[]}else o.push(c)}if(!t){let u=o.join(`
`).trim();u&&l.push(u)}return l}var MS=['"',"'","\u201D","\u2019","\xBB","\u300D"],OS=['"',"'","\u201C","\u2018","\xAB","\u300C"];function Uw(e){let t=e.trim();return MS.includes(t.slice(-1))&&OS.some(n=>t.slice(0,-1).includes(n))?"speech":"prose"}function qw(e,t){let a=zS(e),n=()=>({paragraphs:a,asides:a.map(()=>[]),expressions:a.map(()=>null)});if(!t||t.length!==a.length)return n();let o=[],l=[],u=[],c=[];for(let h=0;h<a.length;h+=1){let g=t[h];if(g.kind==="untagged"){o.push(a[h]),l.push(c),u.push(g.expression??null),c=[];continue}let v={register:g.kind==="whisper"?"whisper":"side",text:g.text,...g.target?{target:g.target}:{}};o.length?l[l.length-1].push(v):c.push(v)}return o.length===0?n():{paragraphs:o,asides:l,expressions:u}}var RS="\\\\([-\\\\*_~`#|>!=\\[\\]{}])|\\[([^\\]]*)\\]\\((https?:\\/\\/[^)\\s]+)\\)|`([^`\\n]+)`|==(.+?)==|~~(.+?)~~|\\*\\*\\*(.+?)\\*\\*\\*|\\*\\*(.+?)\\*\\*|__(.+?)__|(?<!\\*)\\*(?!\\*)(.+?)(?<!\\*)\\*(?!\\*)|(?<![_\\w])_([^_]+?)_(?![_\\w])";function Bi(e,t){if(t>6)return[{kind:"text",text:e}];let a=[],n=new RegExp(RS,"g"),o=0,l,u=c=>{let h=a[a.length-1];if(h?.kind==="text"){a[a.length-1]={kind:"text",text:h.text+c};return}a.push({kind:"text",text:c})};for(;(l=n.exec(e))!==null;)l.index>o&&u(e.slice(o,l.index)),l[1]!=null?u(l[1]):l[2]!=null&&l[3]!=null?a.push({kind:"link",text:l[2],href:l[3]}):l[4]!=null?a.push({kind:"code",text:l[4]}):l[5]!=null?a.push({kind:"styled",style:"highlight",children:Bi(l[5],t+1)}):l[6]!=null?a.push({kind:"styled",style:"strikethrough",children:Bi(l[6],t+1)}):l[7]!=null?a.push({kind:"styled",style:"bold-italic",children:Bi(l[7],t+1)}):l[8]!=null?a.push({kind:"styled",style:"bold",children:Bi(l[8],t+1)}):l[9]!=null?a.push({kind:"styled",style:"underline",children:Bi(l[9],t+1)}):(l[10]!=null||l[11]!=null)&&a.push({kind:"styled",style:"italic",children:Bi(l[10]??l[11],t+1)}),o=l.index+l[0].length;return o<e.length&&u(e.slice(o)),a}function Bw(e){return Bi(e,0)}function wn(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function Iw(e){return e===null||typeof e=="string"}function Lw(e){return e===null||typeof e=="number"&&Number.isFinite(e)}function ec(e){return Array.isArray(e)&&e.every(t=>typeof t=="string")}function VS(e){return e===null?!0:wn(e)?typeof e.ref=="string"&&typeof e.url=="string"&&typeof e.id=="string":!1}function DS(e){if(!wn(e)||typeof e.id!="string"||e.id.trim().length===0||typeof e.name!="string"||typeof e.purpose!="string"||typeof e.category!="string"||!ec(e.capabilities)||!wn(e.presentation)||!wn(e.occupancy)||!wn(e.state))return!1;let{presentation:t,occupancy:a,state:n}=e;return VS(t.image)&&Lw(t.x)&&Lw(t.y)&&typeof a.playerHome=="boolean"&&Iw(a.residentCharacterId)&&Iw(a.homeKind)&&typeof n.condition=="string"&&ec(n.upgrades)&&ec(n.furniture)&&ec(n.publicFacts)&&typeof n.updatedAt=="string"}function Gw(e){if(!wn(e)||!wn(e.settings)||!Array.isArray(e.settings.venues))return e;let t=e.settings.venues,a=t.filter(DS),n=Array.isArray(e.venueRequests)?e.venueRequests:[],o=n.filter(l=>wn(l)&&typeof l.id=="string"&&wn(l.venueDraft)&&typeof l.venueDraft.name=="string"&&typeof l.venueDraft.purpose=="string"&&typeof l.venueDraft.category=="string");return a.length===t.length&&o.length===n.length&&n===e.venueRequests?e:{...e,venueRequests:o,settings:{...e.settings,venues:a}}}function Yw(e,t,a){return e==="Enter"&&!t&&!a}function tc(){let e=globalThis.crypto;if(typeof e?.randomUUID=="function")return e.randomUUID();if(typeof e?.getRandomValues=="function"){let t=e.getRandomValues(new Uint8Array(16));t[6]=t[6]&15|64,t[8]=t[8]&63|128;let a=Array.from(t,n=>n.toString(16).padStart(2,"0")).join("");return`${a.slice(0,8)}-${a.slice(8,12)}-${a.slice(12,16)}-${a.slice(16,20)}-${a.slice(20)}`}return`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,11)}`}function jw(e,t,a,n){let o=Math.max(0,a-1);return!e||e.roomId!==t?o:a>e.stepCount?e.stepCount:Math.min(n,o)}function Xw(e,t,a){let n=.2*a.photoWidth/a.width,o=.2*a.photoHeight/a.height;return t.some(l=>l.x!==null&&l.y!==null&&Math.abs(l.x-e.x)<n&&Math.abs(l.y-e.y)<o)}function Qw(e,t){return Math.hypot(t.x-e.x,t.y-e.y)>8||Math.abs(t.distance-e.distance)>8}var li=(e,t,a)=>Math.min(a,Math.max(t,e));function ac(e,t){if(!e.width||!e.height||!t.width||!t.height)return 1;let a=Math.min(t.width/e.width,t.height/e.height);return Math.max(t.width/(e.width*a),t.height/(e.height*a))}function Qm(e,t,a){if(!e.width||!e.height||!t.width||!t.height)return{left:0,top:0,width:0,height:0};let n=Math.min(t.width/e.width,t.height/e.height),o=Math.max(a.zoom,ac(e,t)),l=e.width*n*o,u=e.height*n*o,c=t.width/2-a.centerX*l,h=t.height/2-a.centerY*u;return{left:l<=t.width?(t.width-l)/2:li(c,t.width-l,0),top:u<=t.height?(t.height-u)/2:li(h,t.height-u,0),width:l,height:u}}function Zw(e,t,a,n,o,l){let u=Qm(e,t,a);if(!u.width||!u.height)return a;let c=ac(e,t),h=li(a.zoom*l,c,Math.max(4,c*2)),g=h/Math.max(a.zoom,c),v=u.width*g,x=u.height*g,f=(n.x-u.left)/u.width,w=(n.y-u.top)/u.height,z=o.x-f*v,E=o.y-w*x;return{zoom:h,centerX:li((t.width/2-z)/v,0,1),centerY:li((t.height/2-E)/x,0,1)}}function Kw(e,t){let a=Math.max(1,t),n=Math.max(4,a*2);return .32+1.03*((li(e,a,n)-a)/(n-a))}function Jw(e,t){return t?Math.max(1,e):e}function Zm(e,t,a){let n=Math.min(90,t.width/2),o=64,l=116,u=e.left+a.x*e.width,c=e.top+a.y*e.height,h=c+o,g=h+l<=t.height?h:c-o-l;return{left:li(u,n,t.width-n),top:li(g,0,Math.max(0,t.height-l))}}var r=hs(Km()),i="marinara-capability-villages",e0="marinara-capability-villages-styles",US="/api/villages",qS=.7,t0=[{value:"fresh-start",label:"Fresh start"},{value:"refuge",label:"Refuge"},{value:"shared-project",label:"Shared project"},{value:"discovery",label:"Discovery"},{value:"homecoming",label:"Homecoming"},{value:"something-else",label:"Something else"}],a0={roads:!0,structures:!1,water:!1},n0=["Village identity","Connections","Village map","Build the village","Review"],i0=1,Jm=3,Pm="__villages_image_disabled__",ip=["neutral","happy","sad","angry","surprised","thinking"];function o0(e,t,a,n,o=!1,l=1){let u=t==="gathering"?"Gathering Place":o?"Your residence":`Residence ${l}`;return{id:e,name:u,form:t==="gathering"?"Gathering place":"Home",classes:[t],spaces:[{id:t,venueClass:t,description:"",image:null,state:{condition:"",items:[],publicFacts:[],features:[],traces:[],updatedAt:""}}],residenceCapacity:1,residentIds:[],improvements:[null,null],purpose:"",description:"",category:t==="gathering"?"public-center":"",presentation:{image:null,x:a,y:n},occupancy:{playerHome:o,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""},guidance:""}}function BS(e){let t=[];for(let a of e){let n=t[t.length-1];n&&n.label===a.dateLabel?n.entries.push(a):t.push({label:a.dateLabel,entries:[a]})}return t}function op(e){if(e.length===0)return"";let t=new Date(e);return Number.isNaN(t.getTime())?"":C0.format(t)}function IS(e){return op(e.occurredAt)}function LS(e,t){return e.find(a=>a.id===t)?.name??"a place that is gone"}function l0(e){return`${String(Math.floor(e/60)).padStart(2,"0")}:${String(e%60).padStart(2,"0")}`}function Fm(e){let t=e.agenda?.activeDay;if(!t)return!1;let a=(e.ingestSchedule?e.agenda?.scheduleWeek?.[t.weekday]:void 0)??e.agenda?.week?.[t.weekday];return!!a&&JSON.stringify(t.blocks)!==JSON.stringify(a)}var GS=new Intl.DateTimeFormat(void 0,{day:"numeric",month:"short"});function YS(e,t){let a=[],n=Date.parse(e);if(Number.isFinite(n)){let l=Math.floor((Date.now()-n)/864e5);a.push(l<=0?"written today":l===1?"written yesterday":`written ${l} days ago`)}let o=Date.parse(t);return a.push(Number.isFinite(o)?`fades ${GS.format(new Date(o))}`:"no set end"),a.join(" \xB7 ")}function jS(e,t){let a=e.find(n=>n.id===t.placeId);return a?t.area==="outside"?a.presentation.image?.url??"":t.area==="private"?a.privateSpaces?.find(n=>n.ownerId===t.privateOwnerId)?.image?.url??"":(t.spaceClass?He(a,t.spaceClass).image:null)?.url??"":""}var lp=class extends m.Component{constructor(){super(...arguments);gg(this,"state",{error:null})}static getDerivedStateFromError(a){return{error:a}}componentDidCatch(a){let n=a.message||"Villages could not open.";this.props.element.capabilityRuntimeError=n,this.props.element.dispatchEvent(new CustomEvent("marinara-capability-runtime-error",{detail:{message:n},bubbles:!0})),console.error("Villages client capability stopped",a)}render(){return this.state.error?(0,r.jsx)("div",{className:`${i}-root`,role:"alert",children:(0,r.jsxs)("section",{className:`${i}-panel`,children:[(0,r.jsx)("h1",{className:`${i}-panel-title`,children:"Villages could not open"}),(0,r.jsx)("p",{className:`${i}-error`,children:this.state.error.message||"An unexpected client error occurred."}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{this.props.element.capabilityRuntimeError=null,this.setState({error:null})},children:"Try again"})]})}):this.props.children}},XS=`
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
.${i}-roster-row { display: flex; align-items: center; gap: .5rem; font-size: .75rem; }
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
.${i}-room-star button { border: 0; background: transparent; color: inherit; cursor: pointer; font: inherit; font-size: 1.2rem; line-height: 1; }
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
.${i}-sprite-editor { border: 1px solid var(--border); border-radius: .75rem; padding: 1rem; margin-top: 1rem; display: grid; gap: .75rem; }
.${i}-sprite-editor label { display: grid; gap: .25rem; }
.${i}-sprite-editor label.${i}-row { display: flex; align-items: center; }
.${i}-sprite-editor textarea { min-height: 5rem; }
.${i}-sprite-candidate { display: grid; justify-items: start; gap: .5rem; }
.${i}-sprite-candidate img { max-width: min(100%, 20rem); max-height: 24rem; object-fit: contain; background: repeating-conic-gradient(#7773 0 25%, transparent 0 50%) 0 0/20px 20px; }
.${i}-sprite-approved { display: flex; flex-wrap: wrap; gap: .5rem; }
.${i}-sprite-approved > div { display: grid; width: 6rem; text-align: center; }
.${i}-sprite-approved img { width: 6rem; height: 8rem; object-fit: contain; }
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
.${i}-room-star-detail { flex: 1; border: 0; padding: 0; background: transparent; color: inherit; font: inherit; text-align: left; cursor: pointer; }
.${i}-memory-backdrop { position: absolute; inset: 0; z-index: 50; display: flex; align-items: center; justify-content: center; padding: 1rem; background: #0009; }
.${i}-memory-dialog { box-sizing: border-box; width: min(28rem, 100%); max-height: min(75cqh, 36rem); overflow-y: auto; padding: 1rem; border: 1px solid var(--border); border-radius: .8rem; background: var(--popover); color: var(--foreground); box-shadow: 0 1rem 2rem #0009; }
.${i}-memory-dialog-head { display: flex; align-items: flex-start; justify-content: space-between; gap: 1rem; }
.${i}-memory-dialog-head button { border: 0; background: transparent; color: inherit; font: inherit; font-size: 1.5rem; cursor: pointer; }
.${i}-memory-dialog p { margin: .75rem 0 0; white-space: pre-wrap; overflow-wrap: anywhere; line-height: 1.5; }
@container ${i} (max-width: 44rem) { .${i}-room-screen .${i}-chat-vn { width: 100%; padding: .45rem; } .${i}-room-screen .${i}-chat-vn-asides { width: min(85%, 22rem); } .${i}-room-mode-toggle { width: 2.5rem; height: 2.5rem; } }
@container ${i} (min-width: 34rem) and (max-height: 30rem) { .${i}-room-screen .${i}-chat-vn { width: 64%; align-self: flex-end; } }
`;function r0(){let e=document.getElementById(e0);if(!document.querySelector(i)){e?.remove();return}if(e)return;let t=document.createElement("style");t.id=e0,t.textContent=XS,document.head.appendChild(t)}var QS="marinara_admin_secret";function N0(e){let t=new Headers(e?.headers);try{let a=window.localStorage.getItem(QS)?.trim();a&&t.set("X-Admin-Secret",a)}catch{}return typeof e?.body=="string"&&!t.has("Content-Type")&&t.set("Content-Type","application/json"),t}var ZS="This action needs loopback access or admin access. Open the app through localhost, or set ADMIN_SECRET=<secret> in the server .env and paste the same value in Settings \u2192 Advanced \u2192 Admin Access. Marinara sends it as the X-Admin-Secret header.";function S0(e,t,a){let n=e?.error,o=typeof n=="string"&&n?n:a;return t===403&&/admin[-_ ]?secret/iu.test(o)?new Error(`${ZS} (${o})`):new Error(o)}async function U(e,t){let a=await fetch(`${US}${e}`,{...t,headers:N0(t)}),n=await a.json().catch(()=>null);if(!a.ok)throw S0(n,a.status,`The village replied ${a.status}.`);return Gw(n)}async function up(e,t){let a=await fetch(e,{cache:"no-store",credentials:"same-origin",...t,headers:N0(t)}),n=await a.json().catch(()=>null);if(!a.ok)throw S0(n,a.status,`The Engine replied ${a.status}.`);return n}var Ii=e=>typeof e=="number"&&Number.isFinite(e);function T0(e){let t=e;for(let x=0;x<2&&typeof t=="string";x+=1)try{t=JSON.parse(t)}catch{return null}if(!t||typeof t!="object"||Array.isArray(t))return null;let a=t,{srcX:n,srcY:o,srcWidth:l,srcHeight:u}=a;if(Ii(n)&&Ii(o)&&Ii(l)&&Ii(u))return l<=0||u<=0||n<0||o<0||n+l>1.001||o+u>1.001?null:{srcX:n,srcY:o,srcWidth:l,srcHeight:u};let{zoom:c,offsetX:h,offsetY:g,fullImage:v}=a;return!Ii(c)||c<=0||!Ii(h)||!Ii(g)||v!==void 0&&typeof v!="boolean"?null:v===void 0?{zoom:c,offsetX:h,offsetY:g}:{zoom:c,offsetX:h,offsetY:g,fullImage:v}}function KS(e){if(!e)return{};if("zoom"in e){let t=`scale(${e.zoom}) translate(${e.offsetX}%, ${e.offsetY}%)`;return e.fullImage?{objectFit:"contain",transform:t}:e.zoom<=1?{}:{transform:t}}return{position:"absolute",width:`${100/e.srcWidth}%`,height:`${100/e.srcHeight}%`,left:`${-e.srcX/e.srcWidth*100}%`,top:`${-e.srcY/e.srcHeight*100}%`,maxWidth:"none",maxHeight:"none",objectFit:"fill"}}async function JS(e,t){if(e.length===0)return{};let a=await up("/api/characters/summaries",{method:"POST",body:JSON.stringify({ids:e}),signal:t}),n={};if(!Array.isArray(a))return n;for(let o of a){let l=typeof o?.id=="string"?o.id:"",u=typeof o?.avatarUrl=="string"?o.avatarUrl.trim():"";l.length>0&&u.length>0&&(n[l]={url:u,crop:T0(o.avatarCrop)})}return n}async function PS(e,t){let a=e.trim();if(a.length===0)return null;let n=await up(`/api/characters/personas/${encodeURIComponent(a)}`,{signal:t}),o=typeof n?.avatarPath=="string"?n.avatarPath.trim():"";return o.length===0?null:{url:o,crop:T0(n.avatarCrop)}}function FS(e){let t=[];for(let a of e){let n=typeof a.id=="string"?a.id.trim():"";if(n.length===0)continue;let o=typeof a.provider=="string"?a.provider:"";if(o==="video_generation")continue;let l=typeof a.name=="string"&&a.name.trim()?a.name.trim():n;t.push({id:n,name:l,category:o==="image_generation"?"image_generation":"language",defaultForAgents:a.defaultForAgents===!0||a.defaultForAgents==="true"})}return t}function I(e,t){return e instanceof Error&&e.message?e.message:t}function Mr(e){let t=I(e,"");return t.includes("Interrupted: Inactivity")?"inactivity":/no longer available|not active|already ended/iu.test(t)?"elsewhere":null}async function s0(e){try{let{session:t}=await U("/rooms/active",{signal:AbortSignal.timeout(5e3)});return t?.id===e&&t.status!=="opening"?t:null}catch{return null}}function u0(e){let t=I(e,"The greeting could not be prepared.");return/timeout|timed out|exceeded 28 seconds/iu.test(t)?"The greeting took too long. Retry it or continue without a greeting.":`${t} Retry it or continue without a greeting.`}function Rr(e,t){return E0(Bw(e),t)}function E0(e,t){let a=0;return e.map(n=>{let o=`${t}${a++}`;switch(n.kind){case"text":return n.text;case"code":return(0,r.jsx)("code",{className:`${i}-chat-md-code`,dir:"ltr",children:n.text},o);case"link":return(0,r.jsx)("a",{className:`${i}-chat-md-link`,href:n.href,target:"_blank",rel:"noopener noreferrer",children:n.text},o);default:return WS(n,o)}})}function WS(e,t){let a=E0(e.children,`${t}-`);switch(e.style){case"bold":return(0,r.jsx)("strong",{children:a},t);case"bold-italic":return(0,r.jsx)("strong",{children:(0,r.jsx)("em",{children:a})},t);case"italic":return(0,r.jsx)("em",{children:a},t);case"underline":return(0,r.jsx)("u",{children:a},t);case"strikethrough":return(0,r.jsx)("del",{children:a},t);default:return(0,r.jsx)("mark",{className:`${i}-chat-md-highlight`,children:a},t)}}function e5(e){return e==="off"?"Time, schedules, wishes, and approved projects still advance. No optional stories are added.":e==="quiet"?"Usually one optional village story is written on an active day.":e==="lively"?"Up to three optional village stories may be written on an active day.":"Usually one to three optional village stories are written on an active day, averaging two."}function ul(e){return e.classes?.includes("residence")??(e.occupancy.playerHome||e.occupancy.residentCharacterId!==null||e.occupancy.homeKind!==null)}var k0=["residence","workplace","gathering","other"];function xn(e){return e.classes?.length?e.classes:ul(e)?["residence"]:["other"]}function c0(e){return Math.min(4,(e.residenceCapacity??1)+(e.improvements??[]).reduce((t,a)=>t+(a?.extraBeds??0),0))}function oc(e){return(e.residentIds?.length??+!!e.occupancy.residentCharacterId)+Number(e.occupancy.playerHome)}function He(e,t){return e.spaces?.find(a=>a.venueClass===t)??{id:t,venueClass:t,description:e.description,image:e.presentation.image,state:{condition:e.state.condition,items:e.state.furniture,publicFacts:e.state.publicFacts,features:e.state.features??[],traces:e.state.traces??[],updatedAt:e.state.updatedAt}}}function d0({draft:e,existing:t,villagers:a,editableClasses:n,onChange:o}){let l=xn(e),u=(c,h)=>{let g=l.map(v=>v===c?{...He(e,v),...h}:He(e,v));o({...e,spaces:g,description:g[0]?.description??e.description})};return(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsxs)("label",{className:`${i}-label`,children:["Name",(0,r.jsx)("input",{className:`${i}-notice-input`,value:e.name,maxLength:100,onChange:c=>o({...e,name:c.target.value}),placeholder:"The Lantern Workshop"})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Form ",(0,r.jsx)("span",{className:`${i}-hint`,children:"What is it, in your world?"}),(0,r.jsx)("input",{className:`${i}-notice-input`,value:e.form??"",maxLength:200,onChange:c=>o({...e,form:c.target.value}),placeholder:"A converted truck, a sleeping pod, an old diner\u2026"})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Purpose",(0,r.jsx)("input",{className:`${i}-notice-input`,value:e.purpose,maxLength:200,onChange:c=>o({...e,purpose:c.target.value}),placeholder:"What happens here?"})]}),(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Map pin \xB7 optional"}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Use a fraction from 0 to 1 across the map and down the map."}),(0,r.jsx)("div",{className:`${i}-row`,children:["x","y"].map(c=>(0,r.jsxs)("label",{className:`${i}-label`,children:[c==="x"?"Across":"Down",(0,r.jsx)("input",{className:`${i}-notice-input`,type:"number",min:0,max:1,step:.01,value:e.presentation[c]??"",disabled:t&&oc(e)>0,onChange:h=>o({...e,presentation:{...e.presentation,[c]:h.target.value===""?null:Number(h.target.value)}})})]},c))}),t&&oc(e)>0?(0,r.jsx)("p",{className:`${i}-hint`,children:"Move residents before changing this Venue's pin."}):null]}),(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Classes \xB7 choose up to two"}),(0,r.jsx)("div",{className:`${i}-row`,children:k0.map(c=>(0,r.jsxs)("label",{className:`${i}-label`,style:{textTransform:"capitalize"},children:[(0,r.jsx)("input",{type:"checkbox",checked:l.includes(c),disabled:t||!l.includes(c)&&l.length>=2,onChange:h=>{let g=h.target.checked?[...l,c]:l.filter(v=>v!==c);g.length<1||g.length>2||o({...e,classes:g,spaces:g.map(v=>He(e,v))})}})," ",c]},c))}),t?(0,r.jsx)("p",{className:`${i}-hint`,children:"Class changes go through a Venue proposal."}):null]}),l.includes("residence")?(0,r.jsxs)("label",{className:`${i}-label`,children:["Resident capacity \xB7 includes you",(0,r.jsx)("input",{className:`${i}-notice-input`,type:"number",min:1,max:4,value:e.residenceCapacity??1,disabled:t,onChange:c=>o({...e,residenceCapacity:Number(c.target.value)})}),t?(0,r.jsx)("span",{className:`${i}-hint`,children:"Capacity changes go through a Venue proposal."}):null]}):null,l.includes("workplace")?(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Workers"}),a.map(c=>(0,r.jsxs)("label",{className:`${i}-label`,children:[(0,r.jsx)("input",{type:"checkbox",checked:(e.workerIds??[]).includes(c.characterId),onChange:h=>o({...e,workerIds:h.target.checked?[...e.workerIds??[],c.characterId]:(e.workerIds??[]).filter(g=>g!==c.characterId)})})," ",c.name]},c.characterId)),a.length===0?(0,r.jsx)("p",{className:`${i}-hint`,children:"No villagers are available yet."}):null]}):null,l.filter(c=>!n||n.includes(c)).map(c=>{let h=He(e,c);return(0,r.jsxs)("section",{className:`${i}-field`,children:[(0,r.jsxs)("h3",{className:`${i}-panel-title`,style:{textTransform:"capitalize"},children:[c," space"]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Scene description",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:h.description,maxLength:1e3,onChange:g=>u(c,{description:g.target.value})})]}),(0,r.jsxs)("details",{className:`${i}-venue-scene-details`,children:[(0,r.jsx)("summary",{children:"Scene details"}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Current physical state used by visits and pictures."}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Condition now"," ",(0,r.jsx)("span",{className:`${i}-hint`,children:"For example, a leaking roof or a repaired door."}),(0,r.jsx)("input",{className:`${i}-notice-input`,value:h.state.condition,onChange:g=>u(c,{state:{...h.state,condition:g.target.value}})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Present items \xB7 one per line"," ",(0,r.jsx)("span",{className:`${i}-hint`,children:"Objects physically in this space."}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:h.state.items.join(`
`),onChange:g=>u(c,{state:{...h.state,items:g.target.value.split(`
`)}})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Established facts \xB7 one per line"," ",(0,r.jsx)("span",{className:`${i}-hint`,children:"Durable truths about this space."}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:h.state.publicFacts.join(`
`),onChange:g=>u(c,{state:{...h.state,publicFacts:g.target.value.split(`
`)}})})]}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Features \xB7 lasting details established through play"}),h.state.features.map((g,v)=>(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("input",{className:`${i}-notice-input`,value:g.text,"aria-label":`Feature ${v+1}`,onChange:x=>u(c,{state:{...h.state,features:h.state.features.map(f=>f.id===g.id?{...f,text:x.target.value}:f)}})}),(0,r.jsxs)("label",{className:`${i}-label`,children:[(0,r.jsx)("input",{type:"checkbox",checked:g.locked,onChange:x=>u(c,{state:{...h.state,features:h.state.features.map(f=>f.id===g.id?{...f,locked:x.target.checked}:f)}})})," ","Locked"]}),(0,r.jsx)("button",{type:"button",className:`${i}-remove`,"aria-label":`Remove feature ${v+1}`,onClick:()=>u(c,{state:{...h.state,features:h.state.features.filter(x=>x.id!==g.id)}}),children:"\xD7"})]},g.id)),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:h.state.features.length>=5,onClick:()=>u(c,{state:{...h.state,features:[...h.state.features,{id:tc(),text:"",sourceCharacterId:"",locked:!1,updatedAt:""}]}}),children:"Add Feature"})]})]}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Structural improvements use two proposal slots per Venue."})]},c)})]})}function rp(e){return e.filter(t=>ul(t))}function $n(e){return e.filter(t=>!ul(t)||xn(t).some(a=>a!=="residence"))}function t5(e,t){let a=rp(e);return a.length!==t.length?!1:t.every((n,o)=>{let l=a[o];return l.id===n.id&&l.name===n.name&&(l.form??"Home")===n.form&&l.occupancy.playerHome===n.isPlayerHome&&l.occupancy.residentCharacterId===n.characterId&&l.description===n.description&&Math.abs((l.presentation.x??-1)-(n.x??-1))<1e-4&&Math.abs((l.presentation.y??-1)-(n.y??-1))<1e-4})}function a5(e,t){let a=new Map(e.map(o=>[o.id,o]));return[...t.map(o=>{let l=a.get(o.id);return{id:o.id,name:o.name,form:o.form,classes:["residence"],spaces:[{...He(l??{id:o.id,name:o.name,description:o.description,purpose:"",category:"",presentation:{image:null,x:o.x,y:o.y},occupancy:{playerHome:o.isPlayerHome,residentCharacterId:o.characterId,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}},"residence"),description:o.description}],residenceCapacity:l?.residenceCapacity??1,residentIds:o.characterId?[o.characterId]:[],improvements:l?.improvements??[null,null],purpose:l?.purpose??"",description:o.description,category:l?.category??"",presentation:{image:l?.presentation.image??null,x:o.x,y:o.y},occupancy:{playerHome:o.isPlayerHome,residentCharacterId:o.characterId,homeKind:null},capabilities:l?.capabilities??[],state:l?.state??{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}}}),...e.filter(o=>!ul(o))]}function Li(){return Math.random().toString(36).slice(2,10)}function Gi(e){return Math.round(e*1e4)/1e4}var n5=new Intl.DateTimeFormat(void 0,{weekday:"short",day:"numeric",month:"short"}),C0=new Intl.DateTimeFormat(void 0,{hour:"2-digit",minute:"2-digit"}),i5=6e4,o5=700;function h0(e){return`${n5.format(e)} \xB7 ${C0.format(e)}`}function l5(){let[e,t]=(0,m.useState)(()=>h0(new Date));return(0,m.useEffect)(()=>{let a=setInterval(()=>t(h0(new Date)),1e3);return()=>clearInterval(a)},[]),e}function r5(){let[e,t]=l5().split(" \xB7 ");return(0,r.jsxs)("span",{className:`${i}-mobile-clock`,children:[(0,r.jsx)("span",{children:e}),(0,r.jsx)("strong",{children:t})]})}function s5({weather:e}){return(0,r.jsxs)("span",{className:`${i}-mobile-datetime`,children:[(0,r.jsx)(r5,{}),(0,r.jsx)("span",{role:"img","aria-label":`Weather: ${e||"unknown"}`,title:e||"Weather unavailable",children:u5(e)})]})}function u5(e){return/thunder/u.test(e)?"\u26C8\uFE0F":/snow/u.test(e)?"\u2744\uFE0F":/sleet/u.test(e)?"\u{1F328}\uFE0F":/rain|drizzle/u.test(e)?"\u{1F327}\uFE0F":/fog|haze/u.test(e)?"\u{1F32B}\uFE0F":/wind|breez/u.test(e)?"\u{1F32C}\uFE0F":/overcast/u.test(e)?"\u2601\uFE0F":/frost/u.test(e)?"\u{1F976}":/hot|heat/u.test(e)?"\u2600\uFE0F":"\u{1F324}\uFE0F"}function m0(e){return e?.closest(i)??null}function c5(){let[e,t]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let o=()=>t(m0(document.fullscreenElement)!==null);return o(),document.addEventListener("fullscreenchange",o),()=>document.removeEventListener("fullscreenchange",o)},[]);let a=document.fullscreenEnabled,n=a?e?"Leave the whole screen":"Use the whole screen":"This browser will not give the tab the whole screen";return(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-icon-button`,disabled:!a,"aria-pressed":e,"aria-label":n,title:n,onClick:o=>{let l=m0(o.currentTarget);if(!l)return;if(document.fullscreenElement===l){document.exitFullscreen().catch(()=>{});return}let u=l.requestFullscreen?.();u&&u.catch(()=>{})},children:(0,r.jsx)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",focusable:"false",children:e?(0,r.jsx)("path",{d:"M9 4H5a1 1 0 0 0-1 1v4M15 4h4a1 1 0 0 1 1 1v4M9 20H5a1 1 0 0 1-1-1v-4M15 20h4a1 1 0 0 0 1-1v-4"}):(0,r.jsx)("path",{d:"M9 3H4a1 1 0 0 0-1 1v5M15 3h5a1 1 0 0 1 1 1v5M9 21H4a1 1 0 0 1-1-1v-5M15 21h5a1 1 0 0 0 1-1v-5"})})})}function d5({happenings:e,recap:t,mobile:a=!1}){let n=(0,m.useRef)(null),[o,l]=(0,m.useState)(!1);return(0,m.useEffect)(()=>{let u=n.current;if(!u)return;let c=()=>l(u.open);return u.addEventListener("toggle",c),()=>u.removeEventListener("toggle",c)},[]),(0,m.useEffect)(()=>{if(!o)return;let u=c=>{!(c.target instanceof Node)||n.current?.contains(c.target)||n.current?.removeAttribute("open")};return document.addEventListener("pointerdown",u),document.addEventListener("keydown",u),()=>{document.removeEventListener("pointerdown",u),document.removeEventListener("keydown",u)}},[o]),(0,r.jsxs)("details",{ref:n,className:`${i}-news`,children:[(0,r.jsxs)("summary",{className:`${i}-button ${i}-news-toggle`,"aria-label":"Events (NYI)",children:[(0,r.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",focusable:"false",children:[(0,r.jsx)("path",{d:"M4 5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"}),(0,r.jsx)("path",{d:"M8 8h7M8 12h7M8 16h4"})]}),a?null:"Events",(0,r.jsx)("span",{className:`${i}-news-nyi`,children:"NYI"})]}),(0,r.jsxs)("div",{className:`${i}-news-panel`,children:[(0,r.jsx)("h2",{className:`${i}-news-title`,children:"Events"}),t?(0,r.jsxs)("div",{children:[(0,r.jsx)("strong",{children:"While you were away"}),t.details.length>0?(0,r.jsx)("ul",{className:`${i}-news-list`,children:t.details.map(u=>(0,r.jsx)("li",{className:`${i}-news-item`,children:u.text},`recap-${u.id}`))}):null,t.summaries.map(u=>(0,r.jsx)("p",{className:`${i}-news-empty`,children:u},u)),t.pendingDecisionCount>0?(0,r.jsxs)("p",{className:`${i}-news-empty`,children:[t.pendingDecisionCount," pending"," ",t.pendingDecisionCount===1?"decision needs":"decisions need"," your attention."]}):null]}):null,e.length===0?(0,r.jsx)("p",{className:`${i}-news-empty`,children:"No events to show yet."}):(0,r.jsx)("ul",{className:`${i}-news-list`,children:e.map(u=>(0,r.jsx)("li",{className:`${i}-news-item`,children:u.text},u.id))})]})]})}function A0(e,t){return`${e==="You"?t?"Your":"your":`${e}'s`} house`}function h5(e){return e.length>0?A0(e,!0):"Empty house"}function p0(e,t){return t===null?{kind:"",name:"Venue residence",category:""}:e.find(a=>a.kind===t)??{kind:t,name:t,category:""}}function g0(e){return e.isPlayerHome?"player":e.occupant?"resident":"empty"}function m5(e,t){return t.length>0?A0(t,!0):e.name||"An empty house"}function Or(e){return e?e.presentation.x===null||e.presentation.y===null?null:{x:e.presentation.x,y:e.presentation.y}:null}var p5=.028;function Vr(e){return new Promise((t,a)=>{let n=new FileReader;n.onload=()=>t(typeof n.result=="string"?n.result:""),n.onerror=()=>a(new Error("That picture could not be read.")),n.readAsDataURL(e)})}function Wm(e){return new Promise((t,a)=>{let n=new Image;n.onload=()=>t({width:n.naturalWidth,height:n.naturalHeight}),n.onerror=()=>a(new Error("That picture could not be read.")),n.src=e})}var f0=[{fit:"cover",label:"Fill the frame",help:"Keeps the picture's own shape and crops whatever hangs outside the frame. Drag the map to choose which part is kept."},{fit:"stretch",label:"Stretch to fill",help:"Squeezes the whole picture into the frame. Nothing is lost, but a picture that is not the map's shape is drawn stretched."},{fit:"contain",label:"Show all of it",help:"Keeps the whole picture and leaves the frame's own background showing around it."}];function ep(e){return e.width/e.height<1.2?{tone:"warn",text:`This ${e.width}\xD7${e.height} map is nearly square or portrait. It will fit in full, but navigation may feel cramped on a wide desktop.`}:e.width<1024||e.height<700?{tone:"warn",text:`This ${e.width}\xD7${e.height} map will fit in full, but it may look soft when enlarged.`}:{tone:"ok",text:`This ${e.width}\xD7${e.height} map will be shown at its native shape, with the whole image visible.`}}function tp(e,t,a){return e<t?t:e>a?a:e}function g5(e,t,a){if(a.fit==="stretch")return{left:0,top:0,width:t.width,height:t.height};if(a.fit==="contain"){let u=Math.min(t.width/e.width,t.height/e.height),c=e.width*u,h=e.height*u;return{left:(t.width-c)/2,top:(t.height-h)/2,width:c,height:h}}let n=Math.max(t.width/e.width,t.height/e.height)*a.zoom,o=e.width*n,l=e.height*n;return{left:(t.width-o)*(a.focusX/100),top:(t.height-l)*(a.focusY/100),width:o,height:l}}function f5(e){return e.fit==="stretch"?{objectFit:"fill"}:e.fit==="contain"?{objectFit:"contain"}:{objectFit:"cover",objectPosition:`${e.focusX}% ${e.focusY}%`,...e.zoom===1?null:{transform:`scale(${e.zoom})`,transformOrigin:`${e.focusX}% ${e.focusY}%`}}}function ic(e){return{fit:e,focusX:50,focusY:50,zoom:1}}function ap({src:e,alt:t,pins:a,placing:n,view:o,shape:l,zoom:u,onPlace:c,onView:h,onDismiss:g,compact:v,fitToRoom:x,mobile:f,photoPins:w,children:z}){let E=c!==void 0,_=h!==void 0,$=(0,m.useRef)(null),b=(0,m.useRef)(null),[N,k]=(0,m.useState)(null),[R,P]=(0,m.useState)(null),[B,G]=(0,m.useState)(null),ue=(0,m.useRef)(null),D=(0,m.useRef)(new Map),be=(0,m.useRef)(null),[lt,Rt]=(0,m.useState)(null),[en,tn]=(0,m.useState)(null),ya=(0,m.useRef)(null),Ze=(0,m.useRef)(null),ee=(0,m.useRef)(!1),[Vt,Oa]=(0,m.useState)(null),ce=(0,m.useMemo)(()=>Vt?{...o,...Vt}:o,[Vt,o]),rt=e?N?.src===e?N:null:l,Nn={zoom:rt&&R?ac(rt,R):1,centerX:.5,centerY:.5},ia=B??Nn,q=(0,m.useMemo)(()=>f?rt&&R?Qm(rt,R,ia):null:e?N&&N.src===e&&R?g5(N,R,ce):null:R?{left:0,top:0,width:R.width,height:R.height}:null,[N,R,ce,f,rt,ia,e]);(0,m.useEffect)(()=>{G(null),ue.current=null,D.current.clear(),be.current=null},[e,R?.width,R?.height]);let Ce=l?x&&lt?{width:`${lt.width}px`,height:`${lt.height}px`,aspectRatio:`${l.width} / ${l.height}`}:{aspectRatio:`${l.width} / ${l.height}`}:void 0,Y=(0,m.useCallback)(()=>{let C=b.current;if(!C)return;let S=C.getBoundingClientRect();S.width===0||S.height===0||P(Q=>Q&&Q.width===S.width&&Q.height===S.height?Q:{width:S.width,height:S.height})},[]);(0,m.useEffect)(()=>{let C=b.current;if(!C||typeof ResizeObserver>"u")return;let S=new ResizeObserver(()=>Y());return S.observe(C),()=>S.disconnect()},[Y]);let et=(0,m.useCallback)(()=>{let C=$.current?.parentElement;if(!C||!l)return;let S=C.getBoundingClientRect(),Q=getComputedStyle(C),V=st=>Number.parseFloat(Q.getPropertyValue(st))||0,Ne=S.width-V("padding-left")-V("padding-right"),ge=S.height-V("padding-top")-V("padding-bottom"),vt=l.width/l.height,tt=Math.min(Ne,ge*vt);tt>0&&Rt(st=>st&&Math.abs(st.width-tt)<.5?st:{width:tt,height:tt/vt})},[l]);(0,m.useLayoutEffect)(()=>{if(!x||(et(),typeof ResizeObserver>"u"))return;let C=$.current?.parentElement;if(!C)return;let S=new ResizeObserver(()=>et());return S.observe(C),()=>S.disconnect()},[x,et]);let wa=(0,m.useCallback)(C=>{if(!E||!c||!q)return;let S=C.currentTarget.getBoundingClientRect(),Q=(C.clientX-S.left-q.left)/q.width,V=(C.clientY-S.top-q.top)/q.height;if(!(Q>=0&&Q<=1)||!(V>=0&&V<=1))return;let ge=b.current?.querySelector(`.${i}-pin-photo`)?.getBoundingClientRect();c(Gi(Q),Gi(V),{width:q.width,height:q.height,photoWidth:ge?.width??58,photoHeight:ge?.height??58})},[c,E,q]),Nt=(0,m.useCallback)(C=>{if(!_||!q||!h||ce.fit!=="cover")return;let S=C.currentTarget.getBoundingClientRect();ya.current={x:C.clientX,y:C.clientY,focusX:ce.focusX,focusY:ce.focusY,spanX:S.width-q.width,spanY:S.height-q.height},Oa({focusX:ce.focusX,focusY:ce.focusY}),C.currentTarget.setPointerCapture(C.pointerId),C.preventDefault()},[_,ce.focusX,ce.focusY,ce.fit,h,q]),$a=(0,m.useCallback)(C=>{let S=ya.current;if(!S)return;let Q=S.spanX===0?S.focusX:S.focusX+(C.clientX-S.x)/S.spanX*100,V=S.spanY===0?S.focusY:S.focusY+(C.clientY-S.y)/S.spanY*100;Oa({focusX:Gi(tp(Q,0,100)),focusY:Gi(tp(V,0,100))})},[]),Ae=(0,m.useCallback)(C=>{if(!ya.current)return;ya.current=null,C.currentTarget.hasPointerCapture(C.pointerId)&&C.currentTarget.releasePointerCapture(C.pointerId);let S=Vt;Oa(null),S&&h&&h({...o,...S})},[Vt,h,o]),xa=(0,m.useCallback)(C=>{!h||!u||h({...o,zoom:Gi(tp(C,u.min,u.max))})},[h,o,u]),bt=()=>{let C=[...D.current.values()];if(C.length===0){be.current=null;return}let S=C[0],Q=C[1];be.current={view:ue.current??ia,x:Q?(S.x+Q.x)/2:S.x,y:Q?(S.y+Q.y)/2:S.y,distance:Q?Math.hypot(S.x-Q.x,S.y-Q.y):1}},Sn=C=>{if(!f||C.pointerType!=="touch"||(C.isPrimary&&(D.current.clear(),ee.current=!1),!b.current)||C.target instanceof Element&&C.target.closest(`.${i}-doors, .${i}-zoom`))return;$.current?.setAttribute("data-mobile-gesturing","true");let S=b.current.getBoundingClientRect();D.current.set(C.pointerId,{x:C.clientX-S.left,y:C.clientY-S.top}),D.current.size>1&&(ee.current=!0),bt()},ji=C=>{if(!f||!D.current.has(C.pointerId)||!rt||!R||!b.current)return;let S=b.current.getBoundingClientRect();D.current.set(C.pointerId,{x:C.clientX-S.left,y:C.clientY-S.top});let Q=[...D.current.values()],V=Q[0],Ne=Q[1],ge=Ne?(V.x+Ne.x)/2:V.x,vt=Ne?(V.y+Ne.y)/2:V.y,tt=Ne?Math.hypot(V.x-Ne.x,V.y-Ne.y):1,st=be.current;if(!st||!Qw(st,{x:ge,y:vt,distance:tt})&&!ee.current)return;ee.current||g?.(),ee.current=!0;let Dr=Zw(rt,R,st.view,{x:st.x,y:st.y},{x:ge,y:vt},Ne&&st.distance>0?tt/st.distance:1);ue.current=Dr,G(Dr)},Tn=(C,S=!1)=>{if(!f||!D.current.has(C.pointerId))return;let Q=!S&&D.current.size===1&&!ee.current;if(D.current.delete(C.pointerId),D.current.size===0&&$.current?.removeAttribute("data-mobile-gesturing"),bt(),!Q||!(C.target instanceof Element))return;let V=C.target.closest(`.${i}-pin`)?.dataset.pinId,Ne=V?a.find(ge=>ge.id===V):null;if(Ne?.onSelect){ee.current=!0,Ne.onSelect();return}if(!(!C.target.closest(`.${i}-canvas`)||C.target.closest("button")))if(E&&n&&c&&q){let ge=b.current.getBoundingClientRect(),vt=(C.clientX-ge.left-q.left)/q.width,tt=(C.clientY-ge.top-q.top)/q.height;if(vt>=0&&vt<=1&&tt>=0&&tt<=1){ee.current=!0;let En=b.current?.querySelector(`.${i}-pin-photo`)?.getBoundingClientRect();c(Gi(vt),Gi(tt),{width:q.width,height:q.height,photoWidth:En?.width??72,photoHeight:En?.height??72})}}else g&&(ee.current=!0,g())};return(0,r.jsxs)("div",{ref:$,className:`${i}-stage${v?` ${i}-stage-compact`:""}`,style:Ce,"data-shaped":l?"true":"false","data-framing":_&&ce.fit==="cover"?"true":"false","data-mobile":f?"true":"false","data-photo-pins":w?"true":"false","data-empty":e?"false":"true",onPointerDownCapture:C=>{if(f){Sn(C);return}ee.current=!1,Ze.current=C.pointerType==="touch"?{x:C.clientX,y:C.clientY}:null},onPointerMoveCapture:C=>{if(f){ji(C);return}let S=Ze.current;S&&(Math.abs(C.clientX-S.x)>8||Math.abs(C.clientY-S.y)>8)&&(ee.current=!0)},onPointerUpCapture:f?Tn:void 0,onPointerCancelCapture:C=>{f&&Tn(C,!0),Ze.current&&(ee.current=!0)},onClickCapture:C=>{ee.current&&(ee.current=!1,C.preventDefault(),C.stopPropagation())},children:[z,(0,r.jsxs)("div",{ref:b,className:`${i}-canvas`,"data-placing":E&&n?"true":"false","data-dragging":Vt?"true":"false",onClick:E&&n?wa:g?()=>g():void 0,onPointerDown:_?Nt:void 0,onPointerMove:_?$a:void 0,onPointerUp:_?Ae:void 0,onPointerCancel:_?Ae:void 0,children:[e?(0,r.jsx)("img",{className:`${i}-canvas-img`,style:f&&q?{position:"absolute",left:q.left,top:q.top,width:q.width,height:q.height,objectFit:"fill"}:f5(ce),src:e,alt:t,draggable:!1,onLoad:C=>{let{naturalWidth:S,naturalHeight:Q}=C.currentTarget;S<=0||Q<=0||(k({src:e,width:S,height:Q}),Y())},onError:()=>tn(e)}):(0,r.jsxs)(r.Fragment,{children:[f&&q?(0,r.jsx)("span",{className:`${i}-mobile-logical`,style:{left:q.left,top:q.top,width:q.width,height:q.height},"aria-hidden":"true"}):null,(0,r.jsx)("span",{className:`${i}-canvas-empty`,children:"Logical village map"})]}),e&&en===e?(0,r.jsx)("span",{className:`${i}-canvas-missing`,children:"The map picture could not be loaded \u2014 pick another one from the Town map panel."}):null,q?a.map(C=>(0,r.jsxs)("span",{className:`${i}-pin-holder`,"data-selected":C.selected?"true":"false",style:{left:`${q.left+C.x*q.width}px`,top:`${q.top+(C.y+(f&&C.kind!=="person"?0:C.dy??0))*q.height}px`},children:[(0,r.jsx)("button",{type:"button",className:`${i}-pin`,"data-pin-id":C.id,"data-tone":C.tone,"data-kind":C.kind??"place","data-selected":C.selected?"true":"false","aria-expanded":C.doors?!0:void 0,disabled:C.onSelect===void 0,title:C.text,onClick:S=>{S.stopPropagation(),C.onSelect?.()},children:(f||w)&&C.kind!=="person"?(0,r.jsxs)("span",{className:`${i}-pin-photo-card`,style:{transform:`scale(${Jw(f?Kw(ia.zoom,Nn.zoom):qS,C.selected===!0)})`},children:[(0,r.jsxs)("span",{className:`${i}-pin-photo`,"aria-hidden":"true",children:[C.image?(0,r.jsx)("img",{src:C.image,alt:"",loading:"lazy",draggable:!1}):(0,r.jsx)("span",{className:`${i}-pin-photo-empty`,role:"img","aria-label":"House",children:"\u{1F3E0}"}),(0,r.jsx)("span",{className:`${i}-pin-photo-tack`})]}),(0,r.jsx)("span",{className:`${i}-pin-name`,children:C.text})]}):(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("span",{"aria-hidden":"true",className:`${i}-pin-tack`,children:(0,r.jsxs)("svg",{viewBox:"0 0 24 24",focusable:"false",children:[(0,r.jsx)("path",{d:"M7 2h10a1.2 1.2 0 0 1 1.2 1.2v2.4a1.2 1.2 0 0 1-1.2 1.2H7A1.2 1.2 0 0 1 5.8 5.6V3.2A1.2 1.2 0 0 1 7 2Z"}),(0,r.jsx)("path",{d:"M9.4 7.4h5.2l-.7 3.2H10.1z"}),(0,r.jsx)("path",{d:"M11.3 10.9h1.4v10.3l-.7 1.2-.7-1.2z"})]})}),(0,r.jsx)("span",{className:`${i}-pin-name`,children:C.text})]})}),C.onRemove?(0,r.jsx)("button",{type:"button",className:`${i}-pin-remove`,"aria-label":`Take ${C.text} off the map`,onClick:S=>{S.stopPropagation(),C.onRemove?.()},children:"\xD7"}):null,C.onResume?(0,r.jsx)("button",{type:"button",className:`${i}-pin-resume`,onClick:S=>{S.stopPropagation(),C.onResume?.()},children:"DEBUG: Resume Chat"}):null]},C.id)):null]}),q?a.filter(C=>C.doors!==void 0&&C.doors.length>0).map(C=>(0,r.jsx)("div",{className:`${i}-doors`,style:{left:`${R?Zm(q,R,C).left:q.left+C.x*q.width}px`,top:`${R?Zm(q,R,C).top:q.top+(C.y+(C.dy??0))*q.height}px`},children:C.doors?.map(S=>(0,r.jsx)("button",{type:"button",className:`${i}-door`,onClick:Q=>{Q.stopPropagation(),S.onSelect()},children:S.label},S.label))},`doors:${C.id}`)):null,_&&u&&ce.fit==="cover"?(0,r.jsxs)("div",{className:`${i}-zoom`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-zoom-button`,title:"Show less of the picture, larger","aria-label":"Zoom in",disabled:ce.zoom>=u.max,onClick:()=>xa(ce.zoom+u.step),children:"+"}),(0,r.jsx)("button",{type:"button",className:`${i}-zoom-button`,title:"Show more of the picture, smaller","aria-label":"Zoom out",disabled:ce.zoom<=u.min,onClick:()=>xa(ce.zoom-u.step),children:"\u2212"}),(0,r.jsx)("button",{type:"button",className:`${i}-zoom-button`,title:"Put the middle of the picture back in the middle of the frame",disabled:ce.focusX===50&&ce.focusY===50&&ce.zoom===u.min,onClick:()=>{h&&h({...o,focusX:50,focusY:50,zoom:u.min})},children:"Centre"})]}):null]})}function Yi(e){let t=e?.settings.playerPersonaName;return typeof t=="string"&&t.trim()||"You"}function b0({idPrefix:e,personas:t,draft:a,onDraft:n,storedId:o,storedName:l,storedMissing:u,disabled:c}){let h=(t??[]).find(f=>f.id===a)??null,g=h?.name??(a===o?l:""),v=u&&a===o,x=a.length>0;return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-${e}-persona`,children:"Who are you?"}),(0,r.jsxs)("select",{id:`${i}-${e}-persona`,className:`${i}-select`,value:a,disabled:c||t===null||t.length===0,onChange:f=>n(f.target.value),children:[(0,r.jsx)("option",{value:"",disabled:!0,children:t===null?"Reading Personas\u2026":"Choose a Persona"}),(t??[]).map(f=>(0,r.jsx)("option",{value:f.id,children:f.isActive?`${f.name} \u2014 your Persona`:f.name},f.id))]}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:t===null?"Reading your Personas\u2026":t.length===0?"Create a Persona in your library before founding a village.":t.some(f=>f.isActive)?"Your active Persona is offered first. The village reads it live, so editing the Persona changes what the villagers believe about you.":"The village reads the Persona you pick here, live, so editing it changes what the villagers believe about you."})]}),x?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("p",{className:`${i}-empty`,children:v?"The Persona you chose is no longer in your library, so the villagers are going by the copy they kept of it. Pick another one to change who you are.":g.length>0?`The villagers know you as ${g}.`:"The villagers know you as this Persona."}),h&&h.summary.length>0?(0,r.jsx)("p",{className:`${i}-macro-help`,children:h.summary}):null]}):null]})}function v0({books:e,error:t,selected:a,onChange:n,disabled:o}){let l=new Map((e??[]).map(h=>[h.id,h])),u=(e??[]).filter(h=>!h.hiddenFromLibrary||a.includes(h.id)),c=a.filter(h=>!l.has(h));return(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Lorebooks for this village"}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Selected books supply live world facts for places, stories, conversations, wishes, agendas, and generated scenery. Villages never edits them."}),t?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:t}):null,e===null&&!t?(0,r.jsx)("p",{className:`${i}-hint`,children:"Loading lorebooks\u2026"}):null,e===null&&t&&a.length>0?(0,r.jsx)("p",{className:`${i}-hint`,children:"Selected books could not be checked. Lore generation will skip unavailable books."}):null,e?.length===0?(0,r.jsx)("p",{className:`${i}-hint`,children:"No lorebooks in the Engine library."}):null,[...u,...c.map(h=>({id:h,name:h,enabled:!1}))].map(h=>{let g=a.includes(h.id),v=c.includes(h.id)?e===null?t?"Unavailable \u2014 skipped":"Checking status":"Missing \u2014 skipped":h.enabled?"":"Disabled \u2014 skipped";return(0,r.jsxs)("label",{className:`${i}-reason-option`,children:[(0,r.jsx)("input",{type:"checkbox",checked:g,disabled:o||!h.enabled&&!g,onChange:()=>n(g?a.filter(x=>x!==h.id):[...a,h.id])}),h.name,v?` (${v})`:""]},h.id)})]})}function b5({homes:e,villagers:t,disabled:a,selectedId:n,onPatch:o,onRemove:l,onSelect:u,lockedIds:c,showDescriptions:h,onGenerateDescription:g}){let v=new Set(e.map(x=>x.characterId));return(0,r.jsx)("div",{className:`${i}-home-list`,children:e.map((x,f)=>{let w=c?.has(x.id)??!1,z=t.find(E=>E.id===x.characterId)?.name??"";return(0,r.jsxs)("div",{className:`${i}-home-row`,"data-selected":x.id===n?"true":"false",onMouseEnter:()=>u(x.id),children:[(0,r.jsx)("span",{className:`${i}-home-index`,"aria-hidden":"true",children:f+1}),x.isPlayerHome?(0,r.jsx)("span",{className:`${i}-who`,children:"You live here"}):(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("span",{className:`${i}-who`,children:z?`${z} lives here`:"No villager lives here"}),t.length>0?(0,r.jsxs)("select",{className:`${i}-select`,value:x.characterId??"",disabled:a||w,"aria-label":`Who lives in home ${f+1}`,onChange:E=>o(x.id,{characterId:E.target.value||null}),children:[(0,r.jsx)("option",{value:"",children:"Nobody yet"}),t.map(E=>{let _=E.id!==x.characterId&&v.has(E.id);return(0,r.jsx)("option",{value:E.id,disabled:_,children:_?`${E.name} \u2014 already housed`:E.name},E.id)})]}):null]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Venue name",(0,r.jsx)("input",{className:`${i}-notice-input`,value:x.name,maxLength:60,disabled:a||w,onChange:E=>o(x.id,{name:E.target.value})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Form \xB7 what is it?",(0,r.jsx)("input",{className:`${i}-notice-input`,value:x.form,maxLength:240,disabled:a||w,onChange:E=>o(x.id,{form:E.target.value}),placeholder:"Cabin, truck, sleeping pod\u2026"})]}),h?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("textarea",{className:`${i}-textarea`,value:x.description,maxLength:1e3,disabled:a||w,"aria-label":`Description of home ${f+1}`,onChange:E=>o(x.id,{description:E.target.value})}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:a||w,onClick:()=>g?.(x),children:"Generate description draft"})]}):null,(0,r.jsx)("button",{type:"button",className:`${i}-remove`,disabled:a||w,"aria-label":`Take home ${f+1} off the map`,onClick:()=>l(x.id),children:"\xD7"}),w?(0,r.jsx)("span",{className:`${i}-hint`,children:"Move approved and completed before changing this home."}):null]},x.id)})})}function y0({id:e,label:t,hint:a,options:n,value:o,disabled:l,onChange:u}){let c=o.length>0&&!n.some(h=>h.id===o);return(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:e,children:t}),(0,r.jsxs)("select",{id:e,className:`${i}-select`,value:o,disabled:l,onChange:h=>u(h.target.value),children:[(0,r.jsx)("option",{value:"",children:"Engine default"}),c?(0,r.jsx)("option",{value:o,children:"Missing \u2014 this connection is gone"}):null,n.map(h=>(0,r.jsx)("option",{value:h.id,children:h.name},h.id))]}),(0,r.jsx)("span",{className:`${i}-hint`,children:a})]})}function np({onSetupProblem:e,onImageWarningChange:t}){let[a,n]=(0,m.useState)(null),[o,l]=(0,m.useState)([]),[u,c]=(0,m.useState)(""),[h,g]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let E=!1;return(async()=>{try{let[_,$]=await Promise.all([U("/connections"),up("/api/connections")]);if(E)return;n(_),l(FS(Array.isArray($)?$:[]))}catch(_){E||c(I(_,"This agent's connections could not be read."))}})(),()=>{E=!0}},[]);let v=(0,m.useCallback)(async E=>{g(!0),c("");try{n(await U("/connections",{method:"PUT",body:JSON.stringify(E)}))}catch(_){c(I(_,"That connection could not be saved."))}finally{g(!1)}},[]),x=o.filter(E=>E.category==="language"),f=o.filter(E=>E.category==="image_generation"),w=f.some(E=>E.defaultForAgents),z=a!==null&&(a.imageConnectionId===Pm||f.length===0||a.imageConnectionId.length===0&&!w);return(0,m.useEffect)(()=>{if(!e)return;let E=a?.systemConnectionId??"",_=a?.narrationConnectionId??"";a?E.length===0||_.length===0?e("Choose both System and Narration connections before continuing."):!x.some($=>$.id===E)||!x.some($=>$.id===_)?e("Choose available language connections for System and Narration."):e(""):e("Connections are still loading.")},[e,a,x]),(0,m.useEffect)(()=>{t?.(z)},[z,t]),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Connections"}),(0,r.jsx)("p",{className:`${i}-empty`,children:"The village spends model calls on three kinds of work, and they are not worth the same money. The heavy lifting is one long call about the whole village. The conversations are short and frequent. Pictures are drawn only when you ask for one. Leave any of these alone and the agent's own choice is used."}),a?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(y0,{id:`${i}-connection-system`,label:"System",hint:"Founding the village, the write-up each time the day turns over, and the village's reading of what happened while you were away.",options:x,value:a.systemConnectionId,disabled:h,onChange:E=>{v({systemConnectionId:E})}}),(0,r.jsx)(y0,{id:`${i}-connection-narration`,label:"Narration",hint:"Everything the villagers say to you, and how the conversation reads back afterwards.",options:x,value:a.narrationConnectionId,disabled:h,onChange:E=>{v({narrationConnectionId:E})}}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-connection-image`,children:"Images"}),(0,r.jsxs)("select",{id:`${i}-connection-image`,className:`${i}-select`,value:a.imageConnectionId,disabled:h,onChange:E=>{v({imageConnectionId:E.target.value})},children:[(0,r.jsx)("option",{value:Pm,children:"Disabled"}),(0,r.jsx)("option",{value:"",children:"Use Engine default"}),a.imageConnectionId.length>0&&a.imageConnectionId!==Pm&&!f.some(E=>E.id===a.imageConnectionId)?(0,r.jsx)("option",{value:a.imageConnectionId,children:"Missing \u2014 this connection is gone"}):null,f.map(E=>(0,r.jsx)("option",{value:E.id,children:E.name},E.id))]}),(0,r.jsxs)("span",{className:`${i}-hint`,children:["This is the connection that Villages uses to generate images such as character sprites, the Village map, Venue backgrounds, etc."," ",(0,r.jsxs)("span",{className:`${i}-image-recommendation`,children:["The intended experience includes an image generation connection to bring the world and characters to life, and is ",(0,r.jsx)("em",{children:"highly"})," recommended."]})]})]})]}):u.length===0?(0,r.jsx)("span",{className:`${i}-hint`,children:"Reading this agent's connections\u2026"}):null,u?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:u}):null]})}function z0(){let[e,t]=(0,m.useState)(null),[a,n]=(0,m.useState)(""),[o,l]=(0,m.useState)(!1),[u,c]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let g=!1;return U("/narration").then(v=>{g||t(v)}).catch(v=>{g||n(I(v,"Village writing settings could not be read."))}),()=>{g=!0}},[]);let h=(0,m.useCallback)(async g=>{l(!0),c(!1),n("");try{let v=await U("/narration",{method:"PUT",body:JSON.stringify(g)});return t(v),c(!0),v}catch(v){return n(I(v,"That writing change could not be saved.")),null}finally{l(!1)}},[]);return{view:e,error:a,busy:o,saved:u,save:h}}function v5(){let{view:e,error:t,busy:a,saved:n,save:o}=z0(),[l,u]=(0,m.useState)(null),c=l??e?.styleInstructions??"";return(0,r.jsxs)("div",{className:i+"-field",children:[(0,r.jsx)("span",{className:i+"-label",children:"Narration style"}),(0,r.jsx)("p",{className:i+"-empty",children:"Shape scene descriptions and the descriptive beats around replies. Each resident's card still governs their spoken voice. Saved changes apply to the next generated venue turn."}),e?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("textarea",{className:i+"-textarea","aria-label":"Narration style",value:c,rows:3,maxLength:e.styleMaxLength,disabled:a,onChange:h=>u(h.target.value)}),(0,r.jsx)("button",{type:"button",className:i+"-button",disabled:a||c===e.styleInstructions,onClick:()=>{o({styleInstructions:c}).then(h=>{h&&u(h.styleInstructions)})},children:"Apply style"}),(0,r.jsx)("button",{type:"button",className:i+"-button",disabled:a||c===e.defaultStyleInstructions,onClick:()=>{o({styleInstructions:""}).then(h=>{h&&u(h.styleInstructions)})},children:"Restore default style"}),(0,r.jsxs)("div",{className:i+"-row",children:[(0,r.jsxs)("label",{className:i+"-field",children:[(0,r.jsx)("span",{className:i+"-label",children:"Tense"}),(0,r.jsxs)("select",{value:e.tense,disabled:a,onChange:h=>{o({tense:h.target.value})},children:[(0,r.jsx)("option",{value:"present",children:"Present"}),(0,r.jsx)("option",{value:"past",children:"Past"})]})]}),(0,r.jsxs)("label",{className:i+"-field",children:[(0,r.jsx)("span",{className:i+"-label",children:"Person"}),(0,r.jsxs)("select",{value:e.person,disabled:a,onChange:h=>{o({person:h.target.value})},children:[(0,r.jsx)("option",{value:"first",children:"First person (I)"}),(0,r.jsx)("option",{value:"second",children:"Second person (you)"}),(0,r.jsx)("option",{value:"third",children:"Third person (player name)"})]})]}),(0,r.jsxs)("label",{className:i+"-field",children:[(0,r.jsx)("span",{className:i+"-label",children:"Content rating"}),(0,r.jsxs)("select",{value:e.rating,disabled:a,onChange:h=>{o({rating:h.target.value})},children:[(0,r.jsx)("option",{value:"sfw",children:"SFW"}),(0,r.jsx)("option",{value:"nsfw",children:"NSFW"})]})]})]}),(0,r.jsx)("span",{className:i+"-hint",children:"Rating applies to venue narration and dialogue only. NSFW allows adult content when the scene calls for it."})]}):t?null:(0,r.jsx)("span",{className:i+"-hint",children:"Reading narration style\u2026"}),a?(0,r.jsx)("span",{className:i+"-hint",children:"Saving\u2026"}):null,n&&!a?(0,r.jsx)("span",{className:i+"-hint",role:"status",children:"Saved for the next venue turn."}):null,t?(0,r.jsx)("p",{className:i+"-error",role:"alert",children:t}):null]})}function y5(){let{view:e,error:t,busy:a,saved:n,save:o}=z0(),[l,u]=(0,m.useState)(null),c=l??e?.replyGuidance??"";return(0,r.jsxs)("section",{className:i+"-panel",children:[(0,r.jsx)("h2",{className:i+"-panel-title",children:"DEBUG: Villager reply guidance"}),(0,r.jsx)("p",{className:i+"-empty",children:"This prompt guides each resident's voice, knowledge, and motivation. Saved edits apply to the next generated venue turn."}),e?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("textarea",{className:i+"-textarea","aria-label":"Villager reply guidance",value:c,rows:12,maxLength:e.replyGuidanceMaxLength,disabled:a,onChange:h=>u(h.target.value)}),(0,r.jsxs)("div",{className:i+"-row",children:[(0,r.jsx)("button",{type:"button",className:i+"-button",disabled:a||c===e.replyGuidance,onClick:()=>{o({replyGuidance:c}).then(h=>{h&&u(h.replyGuidance)})},children:"Apply guidance"}),(0,r.jsx)("button",{type:"button",className:i+"-button",disabled:a||c===e.defaultReplyGuidance,onClick:()=>{o({replyGuidance:null}).then(h=>{h&&u(h.replyGuidance)})},children:"Restore built-in guidance"})]}),(0,r.jsxs)("details",{children:[(0,r.jsx)("summary",{children:"Show built-in guidance"}),(0,r.jsx)("pre",{className:i+"-hint",style:{whiteSpace:"pre-wrap"},children:e.defaultReplyGuidance})]})]}):t?null:(0,r.jsx)("span",{className:i+"-hint",children:"Reading villager reply guidance\u2026"}),a?(0,r.jsx)("span",{className:i+"-hint",children:"Saving\u2026"}):null,n&&!a?(0,r.jsx)("span",{className:i+"-hint",role:"status",children:"Saved for the next venue turn."}):null,t?(0,r.jsx)("p",{className:i+"-error",role:"alert",children:t}):null]})}function sl({portrait:e,name:t,className:a,glyph:n="initial"}){return(0,r.jsx)("span",{"aria-hidden":"true",className:a,children:e?(0,r.jsx)("img",{src:e.url,alt:"",style:KS(e.crop)}):n==="person"?(0,r.jsxs)("svg",{className:`${i}-person`,viewBox:"0 0 24 24","aria-hidden":"true",focusable:"false",children:[(0,r.jsx)("path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"}),(0,r.jsx)("circle",{cx:"12",cy:"7",r:"4",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})]}):t.slice(0,1).toUpperCase()})}function w5({villager:e,portrait:t,selected:a,onSelect:n}){return(0,r.jsxs)("div",{className:`${i}-tile`,"data-selected":a?"true":"false",children:[(0,r.jsxs)("div",{className:`${i}-tile-head`,children:[(0,r.jsx)(sl,{portrait:t,name:e.name,className:`${i}-avatar`}),(0,r.jsx)("button",{type:"button",className:`${i}-tile-name`,onClick:n,disabled:n===void 0,title:n?`See where ${e.name} is`:`${e.name} has no known venue`,children:e.name})]}),e.summary?(0,r.jsx)("p",{className:`${i}-tile-summary`,children:e.summary}):null,(0,r.jsxs)("div",{className:`${i}-tile-meta`,children:[e.missing?(0,r.jsx)("span",{className:`${i}-badge`,children:"card missing"}):null,e.tags.slice(0,3).map(o=>(0,r.jsx)("span",{className:`${i}-tag`,children:o},o))]})]})}function w0(e,t){let a=URL.createObjectURL(t),n=document.createElement("a");n.href=a,n.download=e,n.click(),setTimeout(()=>URL.revokeObjectURL(a),3e4)}async function $5(e){let t=e.sprite?.images??[];if(!t.length)return;let a=[...t].sort((x,f)=>{let w=z=>{let E=ip.indexOf(z);return E<0?ip.length:E};return w(x.label)-w(f.label)||x.label.localeCompare(f.label)}),n=512,o=768,l=2,u=document.createElement("canvas");u.width=l*n,u.height=Math.ceil(a.length/l)*o;let c=u.getContext("2d");if(!c)throw new Error("The browser cannot assemble this sprite sheet.");let h=[];for(let x=0;x<a.length;x+=1){let f=a[x],w=new Image;w.src=f.url,await w.decode();let z=x%l*n,E=Math.floor(x/l)*o,_=Math.min(n/w.naturalWidth,o/w.naturalHeight),$=Math.round(w.naturalWidth*_),b=Math.round(w.naturalHeight*_);c.drawImage(w,z+Math.floor((n-$)/2),E+o-b,$,b),h.push({expression:f.label,x:z,y:E,width:n,height:o})}let g=await new Promise((x,f)=>u.toBlob(w=>w?x(w):f(new Error("The browser could not export this sheet.")),"image/png")),v=e.name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"resident";w0(`${v}-sprites.png`,g),w0(`${v}-sprites.json`,new Blob([JSON.stringify({width:u.width,height:u.height,cells:h},null,2)],{type:"application/json"}))}function x5({villager:e,onSaved:t}){let a=`/villagers/${encodeURIComponent(e.characterId)}/sprites`,[n,o]=(0,m.useState)("neutral"),[l,u]=(0,m.useState)(""),[c,h]=(0,m.useState)(""),[g,v]=(0,m.useState)(!0),[x,f]=(0,m.useState)(null),[w,z]=(0,m.useState)([]),[E,_]=(0,m.useState)(!1),[$,b]=(0,m.useState)(""),[N,k]=(0,m.useState)(""),R=e.sprite?.images??[],P=R.some(D=>D.label==="neutral"),B=n==="custom"?l.trim().toLowerCase().replace(/\s+/g,"_"):n;(0,m.useEffect)(()=>{f(null),o("neutral"),b(""),U(`${a}/source`).then(D=>z(D.sprites)).catch(()=>z([]))},[a]);async function G(D){_(!0),b(""),k("");try{await D()}catch(be){b(I(be,"The sprite could not be prepared."))}finally{_(!1)}}function ue(){if(!/^[a-z0-9_-]{1,40}$/.test(B))throw new Error("Use a short expression name with letters, numbers, dashes, or underscores.");if(B!=="neutral"&&!P)throw new Error("Approve the neutral sprite first.");return B}return(0,r.jsxs)("section",{className:`${i}-sprite-editor`,"aria-label":`${e.name} sprite creator`,children:[(0,r.jsxs)("h3",{children:["Sprites for ",e.name]}),(0,r.jsx)("p",{children:"Generate a neutral full-body sprite, review it, then add expressions one at a time. Your approved art belongs to this Village."}),(0,r.jsxs)("label",{children:["Expression",(0,r.jsxs)("select",{value:n,onChange:D=>{o(D.target.value),f(null)},children:[ip.map(D=>(0,r.jsx)("option",{value:D,children:D},D)),(0,r.jsx)("option",{value:"custom",children:"Custom\u2026"})]})]}),n==="custom"?(0,r.jsxs)("label",{children:["Custom expression",(0,r.jsx)("input",{value:l,maxLength:40,onChange:D=>{u(D.target.value),f(null)}})]}):null,(0,r.jsx)("p",{className:`${i}-hint`,children:"More starter expressions are coming."}),(0,r.jsxs)("label",{children:["Appearance details for generation",(0,r.jsx)("textarea",{value:c,maxLength:2e3,onChange:D=>h(D.target.value),placeholder:"Use the resident\u2019s saved appearance, or describe it here"})]}),(0,r.jsxs)("label",{className:`${i}-row`,children:[(0,r.jsx)("input",{type:"checkbox",checked:g,onChange:D=>v(D.target.checked)})," Use approved neutral and available portrait as identity references"]}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Turn references off for a connection that cannot accept images. Review identity carefully before approval."}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:E,onClick:()=>{G(async()=>{let D=ue(),be=await U(`${a}/generate`,{method:"POST",body:JSON.stringify({expression:D,appearance:c,useReference:g})});f(be.image),k(`Candidate: ${be.width} \xD7 ${be.height}. Review before approving.`)})},children:E?"Working\u2026":x?"Retry this expression":"Generate candidate"}),(0,r.jsxs)("label",{className:`${i}-button`,children:["Upload candidate",(0,r.jsx)("input",{type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",hidden:!0,onChange:D=>{G(async()=>{ue();let be=D.target.files?.[0];be&&f(await Vr(be)),D.target.value=""})}})]})]}),x?(0,r.jsxs)("div",{className:`${i}-sprite-candidate`,children:[(0,r.jsx)("img",{src:x,alt:`${B} candidate for ${e.name}`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:E,onClick:()=>{G(async()=>{let D=await U(`${a}/approve`,{method:"POST",body:JSON.stringify({expression:ue(),image:x})});t(D),f(null),k(`${B} approved.`)})},children:"Approve this sprite"})]}):null,w.length?(0,r.jsxs)("div",{children:[(0,r.jsx)("p",{children:"Copy an existing Engine full-body sprite:"}),(0,r.jsx)("div",{className:`${i}-row`,children:w.map(D=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:E||D.expression!=="neutral"&&!P,onClick:()=>{G(async()=>{let be=await U(`${a}/import`,{method:"POST",body:JSON.stringify({expression:D.expression})});t(be),k(`${D.expression} copied to this Village.`)})},children:D.expression},D.expression))})]}):null,R.length?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("div",{className:`${i}-sprite-approved`,children:R.map(D=>(0,r.jsxs)("div",{children:[(0,r.jsx)("img",{src:D.url,alt:`${e.name}: ${D.label}`}),(0,r.jsx)("span",{children:D.label})]},D.label))}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsxs)("label",{children:["Display framing"," ",(0,r.jsxs)("select",{value:e.sprite?.framing.mode??"full",disabled:E,onChange:D=>{G(async()=>t(await U(`${a}/framing`,{method:"PATCH",body:JSON.stringify({mode:D.target.value,cropPercent:e.sprite?.framing.cropPercent??58})})))},children:[(0,r.jsx)("option",{value:"full",children:"Full body"}),(0,r.jsx)("option",{value:"half",children:"Waist up"})]})]}),e.sprite?.framing.mode==="half"?(0,r.jsxs)("label",{children:["Visible height: ",e.sprite.framing.cropPercent,"%"," ",(0,r.jsx)("input",{type:"range",min:40,max:85,value:e.sprite.framing.cropPercent,disabled:E,onChange:D=>{G(async()=>t(await U(`${a}/framing`,{method:"PATCH",body:JSON.stringify({mode:"half",cropPercent:Number(D.target.value)})})))}})]}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:E,onClick:()=>{G(()=>$5(e))},children:"Download sheet and manifest"})]})]}):null,N?(0,r.jsx)("p",{role:"status",children:N}):null,$?(0,r.jsx)("p",{role:"alert",children:$}):null]})}function N5({entry:e,onDecide:t}){let[a,n]=(0,m.useState)(e.improvement?.title??""),[o,l]=(0,m.useState)(e.improvement?.description??""),[u,c]=(0,m.useState)(e.improvement?.extraBeds??0),[h,g]=(0,m.useState)(e.improvementSlot??0),[v,x]=(0,m.useState)(!1),[f,w]=(0,m.useState)(""),z=_=>{x(!0),w(""),t(_,{title:a,description:o,extraBeds:u,slot:h}).catch($=>w(I($,"That Venue request could not be decided."))).finally(()=>x(!1))},E=a!==e.improvement?.title||o!==e.improvement?.description||u!==e.improvement?.extraBeds||h!==e.improvementSlot;return(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsxs)("label",{className:`${i}-label`,children:["Proposed improvement",(0,r.jsx)("input",{className:`${i}-notice-input`,value:a,onChange:_=>n(_.target.value)})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["What changes?",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:o,onChange:_=>l(_.target.value)})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Extra beds",(0,r.jsx)("input",{type:"number",min:0,max:3,value:u,onChange:_=>c(Number(_.target.value))})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Improvement slot",(0,r.jsxs)("select",{value:h,onChange:_=>g(Number(_.target.value)),children:[(0,r.jsx)("option",{value:0,children:"Slot 1"}),(0,r.jsx)("option",{value:1,children:"Slot 2"})]})]}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:v||!a.trim()||!o.trim(),onClick:()=>z(!0),children:E?"Send counteroffer":"Approve exact request"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:v,onClick:()=>z(!1),children:"Decline"})]}),f?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:f}):null]})}function S5({room:e,picture:t,draft:a,mode:n,targetId:o,busy:l,error:u,greetingNotice:c,ruling:h,open:g,ended:v,playerName:x,playerPortrait:f,portraits:w,sprites:z,onDraft:E,onMode:_,onTarget:$,onSend:b,onLeave:N,onViewVenue:k,onEnterPrivate:R,privateSpaceOwnerName:P,onEnd:B,onLeavePending:G,endFailed:ue,onRetryGreeting:D,onContinueWithoutGreeting:be,notices:lt,onDismissNotice:Rt,debugDiscardEnabled:en,onDebugDiscard:tn,onUseMailbox:ya}){let[Ze,ee]=(0,m.useState)(0),[Vt,Oa]=(0,m.useState)(!1),[ce,rt]=(0,m.useState)(!1),Nn=!v&&e.status==="active",ia=(0,m.useRef)(null),q=(0,m.useMemo)(()=>{let S=[],Q=new Map;for(let V of e.lines){if(V.kind!=="side"&&V.kind!=="whisper"||!V.asideFor)continue;let Ne=Q.get(V.asideFor)??[];Ne.push({register:V.kind,text:V.content,...V.targetId?{target:e.participants.find(ge=>ge.characterId===V.targetId)?.name??V.targetId}:{},speakerId:V.speakerId,name:V.name,expression:V.expression}),Q.set(V.asideFor,Ne)}for(let V of e.lines){if(V.kind==="side"||V.kind==="whisper")continue;let Ne=V.speakerId.length===0,ge=qw(V.content,V.beats??null);ge.paragraphs.forEach((vt,tt)=>{S.push({key:`${S.length}`,speakerId:Ne?"":V.speakerId,name:Ne?x:V.name,player:Ne,text:vt,asides:[...ge.asides[tt]??[],...tt===ge.paragraphs.length-1?Q.get(V.id??"")??[]:[]],...V.kind?{register:V.kind==="narration"?"narration":"speech"}:{},...V.expression?{expression:V.expression}:{}})})}return S},[x,e.lines,e.participants]);(0,m.useLayoutEffect)(()=>{ee(S=>jw(ia.current,e.id,q.length,S)),ia.current={roomId:e.id,stepCount:q.length}},[e.id,q.length]);let Ce=Math.min(Ze,Math.max(0,q.length-1)),Y=q[Ce],et=Ce>0,wa=Ce<q.length-1,Nt=Y?.register??(Y===void 0||Y.speakerId==="__venue_scene__"?"narration":Y.player||Uw(Y.text)==="speech"?"speech":"narration"),$a=Y===void 0?void 0:Y.player?f:w[Y.speakerId],Ae=e.participants.filter(S=>e.activeIds.includes(S.characterId)),xa=e.status==="closed"&&Ae.length===0?e.participants:Ae,bt=xa.find(S=>S.characterId===Y?.speakerId),Sn=xa.filter(S=>S.characterId!==bt?.characterId),ji=bt?[Sn[0],bt,Sn[1]].filter(S=>!!S):xa.slice(0,3),Tn=xa.filter(S=>!ji.some(Q=>Q.characterId===S.characterId)),C=(0,r.jsxs)("p",{className:`${i}-chat-pending`,role:"status",children:[(0,r.jsx)("span",{className:`${i}-chat-spinner ${i}-spin`,"aria-hidden":"true"}),(0,r.jsx)("span",{className:`${i}-chat-pending-label`,children:e.status==="opening"?"Preparing a greeting\u2026":e.status==="closing"?"Saving this visit\u2026":"The room is answering\u2026"})]});return(0,r.jsxs)("aside",{className:`${i}-chat`,"data-open":g?"true":"false","data-ended":v?"true":"false","data-opening-error":e.status==="opening"&&u?"true":"false","aria-label":`${e.area==="outside"?"Outside":"Inside"} ${e.placeName}`,children:[(0,r.jsx)("p",{className:`${i}-visually-hidden`,children:`Here now: ${Ae.length?Ae.map(S=>`${S.name}${S.doing?` is ${S.doing}`:""}`).join("; "):"nobody"}.`}),(0,r.jsx)("div",{className:`${i}-chat-scene`,"aria-hidden":"true",children:t?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("img",{className:`${i}-chat-scene-backdrop`,src:t,alt:""}),(0,r.jsx)("span",{className:`${i}-chat-scrim`}),(0,r.jsx)("span",{className:`${i}-chat-vignette`})]}):(0,r.jsx)("span",{className:`${i}-chat-scene-placeholder`,children:e.area==="outside"?"Exterior not drawn yet":"Interior / space not drawn yet"})}),(0,r.jsx)("div",{className:`${i}-chat-head`,children:(0,r.jsxs)("span",{className:`${i}-chat-actions`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-chat-tool`,onClick:k,disabled:l,children:"View Venue"}),R?(0,r.jsxs)("button",{type:"button",className:`${i}-button ${i}-chat-tool`,onClick:R,disabled:l,children:["Enter ",P??"private space"]}):null,en&&e.status!=="closed"?(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-chat-tool`,onClick:tn,disabled:l,title:"DEBUG: Clears this visit and transcript. Completed effects and memories remain.",children:"DEBUG: Discard Visit"}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-chat-tool`,onClick:B,disabled:l,title:"End this visit and leave the venue",children:"End visit and leave"}),ue||e.status==="closing"?(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-chat-tool`,onClick:G,children:"Leave with memory pending"}):null]})}),e.area==="outside"?(0,r.jsx)("p",{className:`${i}-hint`,role:"status",children:"You\u2019re outside this Residence. A resident needs to invite you in. You can speak in your own words, or leave whenever you like."}):null,lt.length>0?(0,r.jsx)("div",{className:`${i}-room-stars`,"aria-live":"polite","aria-label":"Village events",children:lt.map(S=>(0,r.jsxs)("div",{className:`${i}-room-star`,role:"status",children:[(0,r.jsx)("span",{"aria-hidden":"true",children:"\u2726"}),(0,r.jsx)("span",{children:S.text}),(0,r.jsx)("button",{type:"button",onClick:()=>Rt(S.id),"aria-label":`Dismiss ${S.text}`,title:"Dismiss notice",children:"\xD7"})]},S.id))}):null,Ae.length>0?(0,r.jsx)("div",{className:`${i}-chat-activities`,tabIndex:0,"aria-label":"What everyone here is doing",children:Ae.map(S=>(0,r.jsx)("span",{className:`${i}-chat-activity`,children:`${S.name}: ${S.doing||"spending time here"}`},S.characterId))}):null,(0,r.jsxs)("div",{className:`${i}-chat-stage`,"aria-hidden":"true",children:[(0,r.jsx)("div",{className:`${i}-chat-cast`,children:ji.map(S=>{let Q=z[S.characterId],V=S.characterId===bt?.characterId?Y?.expression??"neutral":"neutral",Ne=Q?.images.find(ge=>ge.label===V)??Q?.images.find(ge=>ge.label==="neutral");return(0,r.jsxs)("div",{className:`${i}-chat-cast-person`,"data-active":S.characterId===bt?.characterId?"true":"false",children:[Ne?(0,r.jsx)("img",{src:Ne.url,alt:"","data-framing":Q?.framing.mode??"full"}):(0,r.jsx)(sl,{portrait:w[S.characterId],name:S.name,className:`${i}-avatar`}),(0,r.jsx)("span",{children:S.name})]},S.characterId)})}),Tn.length>0?(0,r.jsx)("div",{className:`${i}-chat-cast-rest`,children:Tn.map(S=>(0,r.jsxs)("span",{children:[(0,r.jsx)(sl,{portrait:w[S.characterId],name:S.name,className:`${i}-avatar`}),S.name]},S.characterId))}):null]}),(0,r.jsxs)("div",{className:`${i}-chat-vn`,children:[e.lines.length>0?(0,r.jsx)("button",{type:"button",className:`${i}-chat-history-toggle`,"aria-expanded":Vt,onClick:()=>Oa(S=>!S),children:Vt?"Hide history":"History"}):null,Vt?(0,r.jsx)("div",{className:`${i}-chat-log`,role:"log","aria-label":"Venue conversation history",tabIndex:0,children:e.lines.map((S,Q)=>(0,r.jsxs)("p",{className:`${i}-chat-vn-text`,children:[(0,r.jsxs)("strong",{children:[S.role==="user"?x:S.kind==="narration"||S.speakerId==="__venue_scene__"?"Narration":S.name||"Resident",S.kind==="side"?" \xB7 aside":S.kind==="whisper"?" \xB7 whisper":"",":"," "]}),Rr(S.content,`history-${Q}-`)]},S.id??Q))}):null,Y&&Y.asides.length>0?(0,r.jsx)("div",{className:`${i}-chat-vn-asides`,"aria-live":"polite",children:Y.asides.map((S,Q)=>(0,r.jsxs)("div",{className:`${i}-chat-vn-aside`,"data-register":S.register,children:[(0,r.jsx)(sl,{portrait:S.speakerId?w[S.speakerId]:$a,name:S.name??Y.name,glyph:Y.player?"person":"initial",className:`${i}-chat-vn-aside-face`}),(0,r.jsxs)("div",{className:`${i}-chat-vn-aside-column`,children:[(0,r.jsxs)("p",{className:`${i}-chat-vn-aside-head`,children:[(0,r.jsx)("span",{className:`${i}-chat-vn-aside-icon`,children:S.register==="whisper"?"\u{1F92B}":"\u{1F4AC}"}),(0,r.jsx)("span",{className:`${i}-chat-vn-aside-name`,children:S.name??Y.name}),S.register==="whisper"&&S.target?(0,r.jsx)("span",{className:`${i}-chat-vn-aside-target`,children:`\u2192 ${S.target}`}):null]}),(0,r.jsx)("p",{className:`${i}-chat-vn-aside-text`,children:Rr(S.text,`vn-aside-${Q}-`)})]})]},`${Q}-${S.register}`))}):null,(0,r.jsxs)("div",{className:`${i}-chat-vn-card`,"data-register":Nt,children:[(0,r.jsxs)("div",{className:`${i}-chat-vn-row`,children:[Nt==="speech"?(0,r.jsx)(sl,{portrait:$a,name:Y?.name??"",glyph:Y?.player?"person":"initial",className:`${i}-chat-vn-portrait`}):null,(0,r.jsxs)("div",{className:`${i}-chat-vn-column`,children:[Nt==="narration"?(0,r.jsx)("p",{className:`${i}-chat-vn-label`,children:"Narration"}):(0,r.jsx)("p",{className:`${i}-chat-vn-name`,children:Y?.name??""}),(0,r.jsxs)("div",{className:`${i}-chat-vn-reading`,role:"region","aria-label":"Current paragraph","aria-live":"polite",tabIndex:0,children:[Y?Nt==="narration"?(0,r.jsx)("p",{className:`${i}-chat-vn-beat`,"data-register":"narration",children:Rr(Y.text,"vn-beat-")}):(0,r.jsx)("p",{className:`${i}-chat-vn-text`,children:Rr(Y.text,"vn-")}):(0,r.jsx)("p",{className:`${i}-chat-vn-text`,"data-empty":"true",children:e.status==="opening"?`Preparing a greeting in ${e.placeName}\u2026`:Ae.length===0?`You are alone in ${e.placeName}.`:"\u2026"}),!v&&l?C:null]})]})]}),et||wa?(0,r.jsxs)("div",{className:`${i}-chat-vn-nav`,children:[(0,r.jsxs)("button",{type:"button",className:`${i}-chat-vn-button`,onClick:()=>ee(Ce-1),disabled:!et,title:"Read the paragraph before this one",children:[(0,r.jsx)("svg",{viewBox:"0 0 16 16","aria-hidden":"true",focusable:"false",children:(0,r.jsx)("path",{d:"M10 3.5 5.5 8l4.5 4.5",fill:"none",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round"})}),"Previous paragraph"]}),(0,r.jsx)("span",{className:`${i}-chat-vn-counter`,children:`${Ce+1} / ${Math.max(1,q.length)}`}),(0,r.jsxs)("button",{type:"button",className:`${i}-chat-vn-button`,onClick:()=>ee(Ce+1),disabled:!wa,title:"Read the next paragraph",children:["Next paragraph",(0,r.jsx)("svg",{viewBox:"0 0 16 16","aria-hidden":"true",focusable:"false",children:(0,r.jsx)("path",{d:"M6 3.5 10.5 8 6 12.5",fill:"none",stroke:"currentColor",strokeWidth:"1.6",strokeLinecap:"round",strokeLinejoin:"round"})})]})]}):null]}),(0,r.jsxs)("div",{className:`${i}-room-panel-tools`,children:[e.lines.length>0?(0,r.jsx)("button",{type:"button",className:`${i}-chat-history-toggle`,"aria-expanded":Vt,onClick:()=>Oa(S=>!S),children:Vt?"Hide history":"History"}):null,(0,r.jsx)("span",{className:`${i}-spacer`}),v&&!wa?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:B,disabled:l,children:"Return to map"}):null]}),u&&e.status==="opening"?(0,r.jsxs)("div",{className:`${i}-room-error`,role:"alert",children:[(0,r.jsx)("p",{children:u}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:B,disabled:l,children:"Back to map"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:D,disabled:l,children:"Retry greeting"}),e.id?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:be,disabled:l,children:"Continue without greeting"}):null]}):null,c?(0,r.jsx)("div",{className:`${i}-room-error`,role:"status",children:(0,r.jsx)("p",{children:c})}):null,h?(0,r.jsx)("p",{className:`${i}-empty`,children:h}):null,e.status==="closing"?(0,r.jsx)("p",{className:`${i}-hint`,children:"The visit is still being remembered. You can leave with memory pending if filing cannot finish."}):null,Nn&&n==="fulfill"&&Ae.length===0?(0,r.jsx)("p",{className:`${i}-hint`,children:"Nobody is here whose wish you can fulfill."}):null,Nn?(0,r.jsxs)("div",{className:`${i}-composer`,children:[n==="fulfill"&&Ae.length>0?(0,r.jsxs)("select",{value:o,onChange:S=>$(S.target.value),"aria-label":"Whose wish you fulfilled",disabled:l||v||e.status!=="active",children:[(0,r.jsx)("option",{value:"",children:"Choose one villager"}),Ae.map(S=>(0,r.jsx)("option",{value:S.characterId,children:S.name},S.characterId))]}):null,(0,r.jsx)("div",{className:`${i}-composer-row`,children:(0,r.jsxs)("span",{className:`${i}-chat-input`,children:[(0,r.jsxs)("span",{className:`${i}-room-mode-anchor`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-room-mode-toggle`,onClick:()=>rt(S=>!S),"aria-label":`Mode: ${n==="chat"?"Chat":"Fulfill"}. Choose mode`,"aria-haspopup":"menu","aria-expanded":ce,title:n==="chat"?"Chat":"Fulfill",children:"\u{1F4AC}"}),ce?(0,r.jsxs)("span",{className:`${i}-room-mode-menu`,role:"menu","aria-label":"Visit mode",children:[["chat","fulfill"].map(S=>(0,r.jsx)("button",{type:"button",role:"menuitemradio","aria-checked":n===S,disabled:l||S==="fulfill"&&Ae.length===0,onClick:()=>{_(S),rt(!1)},children:S==="chat"?"Chat":"Fulfill"},S)),(0,r.jsx)("button",{type:"button",role:"menuitem",disabled:l||e.status!=="active",onClick:()=>{rt(!1),N()},children:"Leave Scene"})]}):null]}),ya?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:ya,title:"Use the Mailbox at home",children:"Use\u2026 Mailbox"}):null,(0,r.jsx)("textarea",{className:`${i}-textarea`,value:a,onChange:S=>E(S.target.value),onKeyDown:S=>{Yw(S.key,S.shiftKey,S.nativeEvent.isComposing)&&(S.preventDefault(),e.status==="active"&&(n!=="fulfill"||o)&&b())},placeholder:n==="fulfill"?"What did you do for them?":"Say or do something\u2026","aria-label":`Message at ${e.placeName}`,disabled:l||v||e.status!=="active"}),(0,r.jsx)("button",{type:"button",className:`${i}-chat-send`,onClick:b,disabled:l||v||e.status!=="active"||a.trim().length===0||n==="fulfill"&&!o,"aria-label":l?"Sending":"Send",title:l?"Sending":"Send",children:l?"Sending\u2026":"Send"})]})}),u&&e.status!=="opening"?(0,r.jsxs)("div",{className:`${i}-room-error`,role:"alert",children:[(0,r.jsx)("p",{children:u}),e.status==="active"&&a.trim()?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:b,disabled:l||v,children:"Retry message"}):null]}):null]}):null]}),v?(0,r.jsx)("p",{className:`${i}-chat-ended`,children:"That is the end of it. Each of them has kept what they took from it, and the village is yours again."}):null]})}var $0="Testing action: runs normal time catch-up, then bypasses Story pace for one visual Events update. It can spend a model call, but its prose cannot change memories, wishes, notices, venues, or resident behavior.";function T5({element:e}){let[t,a]=(0,m.useState)(!1);(0,m.useLayoutEffect)(()=>{let s=()=>{let p=e.getBoundingClientRect();a(p.width<=704||p.width<=880&&p.height<=512)};s();let d=new ResizeObserver(s);return d.observe(e),()=>d.disconnect()},[e]);let[n,o]=(0,m.useState)(null),[l,u]=(0,m.useState)(null),[c,h]=(0,m.useState)(null),[g,v]=(0,m.useState)(0),[x,f]=(0,m.useState)(null),[w,z]=(0,m.useState)(0),[E,_]=(0,m.useState)(0),[$,b]=(0,m.useState)(0),[N,k]=(0,m.useState)(null),[R,P]=(0,m.useState)(!1),[B,G]=(0,m.useState)(""),[ue,D]=(0,m.useState)(""),[be,lt]=(0,m.useState)(""),[Rt,en]=(0,m.useState)(null),[tn,ya]=(0,m.useState)(!1),[Ze,ee]=(0,m.useState)("home"),[Vt,Oa]=(0,m.useState)(null),[ce,rt]=(0,m.useState)("view"),[Nn,ia]=(0,m.useState)(!1),[q,Ce]=(0,m.useState)(null),[Y,et]=(0,m.useState)(null),[wa,Nt]=(0,m.useState)(!1),[$a,Ae]=(0,m.useState)(""),[xa,bt]=(0,m.useState)(""),[Sn,ji]=(0,m.useState)(""),[Tn,C]=(0,m.useState)(null),[S,Q]=(0,m.useState)(!1),[V,Ne]=(0,m.useState)("village"),[ge,vt]=(0,m.useState)("index"),[tt,st]=(0,m.useState)({}),[En,Dr]=(0,m.useState)(null),[lc,R0]=(0,m.useState)({}),[ri,cp]=(0,m.useState)({}),[rc,_r]=(0,m.useState)(""),[V0,dp]=(0,m.useState)(null),[hp,mp]=(0,m.useState)(""),[an,Hr]=(0,m.useState)(""),[oa,Ur]=(0,m.useState)(""),[sc,pp]=(0,m.useState)(null),[qr,gp]=(0,m.useState)(""),[Br,fp]=(0,m.useState)([]),[uc,bp]=(0,m.useState)(1600),[Ra,vp]=(0,m.useState)([]),[Xi,yp]=(0,m.useState)(1600),[cc,D0]=(0,m.useState)(null),[wp,$p]=(0,m.useState)(""),[Ir,Qi]=(0,m.useState)([]),[xp,_0]=(0,m.useState)(""),[la,Lr]=(0,m.useState)([]),[si,Dt]=(0,m.useState)(!1),[Gr,ui]=(0,m.useState)(!1),[H0,dc]=(0,m.useState)(null),[U0,hc]=(0,m.useState)(null),[Yr,mc]=(0,m.useState)(null),[jr,Np]=(0,m.useState)(""),[Ue,pc]=(0,m.useState)(0),[Na,Sp]=(0,m.useState)(""),[yt,Tp]=(0,m.useState)(""),[Yt,Ep]=(0,m.useState)(""),[Va,kp]=(0,m.useState)(""),[q0,Xr]=(0,m.useState)([]),[$e,ci]=(0,m.useState)([]),[Cp,kn]=(0,m.useState)(null),[gc,di]=(0,m.useState)(null),[jt,Zi]=(0,m.useState)({}),[cl,Ki]=(0,m.useState)(null),[Sa,Ji]=(0,m.useState)(!1),[Ap,fc]=(0,m.useState)(""),[bc,zp]=(0,m.useState)(a0),[Se,hi]=(0,m.useState)("generate"),[B0,vc]=(0,m.useState)(""),[Qr,yc]=(0,m.useState)(null),[dl,wc]=(0,m.useState)(null),[mi,$c]=(0,m.useState)(""),[hl,xc]=(0,m.useState)(""),[St,ml]=(0,m.useState)(!1),[Mp,Zr]=(0,m.useState)(""),[Nc,I0]=(0,m.useState)("Connections are still loading."),[Op,Rp]=(0,m.useState)(!1),[L0,pl]=(0,m.useState)(!1),[Vp,de]=(0,m.useState)(""),[G0,Kr]=(0,m.useState)(!1),[Jr,Pr]=(0,m.useState)(""),[Ta,Sc]=(0,m.useState)(null),[Tc,gl]=(0,m.useState)(null),[Y0,Ec]=(0,m.useState)(!1),[Da,Pi]=(0,m.useState)(""),[Dp,Cn]=(0,m.useState)(null),Fi=n?.settings.townMapView??ic("cover"),_p=n?Ta?.size??{width:n.settings.townMapExpectedWidth,height:n.settings.townMapExpectedHeight}:null,Hp=n?Se==="existing"?{width:n.settings.townMapExpectedWidth,height:n.settings.townMapExpectedHeight}:dl&&Qr===Se?dl:{width:n.settings.townMapGenerationWidth,height:n.settings.townMapGenerationHeight}:null,j0=n?{min:n.settings.townMapZoomMin,max:n.settings.townMapZoomMax,step:n.settings.townMapZoomStep}:{min:1,max:1,step:.1},Fr=Ta?Ta.image:Jr||null,pi=Se==="none"?null:Se==="existing"?Jr||null:Qr===Se&&B0||null,Wr=Ta!==null||Y0,fl=Wr?Tc??Fi:Fi,kc=Ta?ep(Ta.size):null,[bl,Ve]=(0,m.useState)(""),[Tt,Z]=(0,m.useState)(""),[H,j]=(0,m.useState)(!1),[L,Le]=(0,m.useState)(null),[X0,vl]=(0,m.useState)(!1),[Q0,_a]=(0,m.useState)(!1),[yl,Wi]=(0,m.useState)(""),[es,Cc]=(0,m.useState)("chat"),[wl,ts]=(0,m.useState)(""),[Z0,Up]=(0,m.useState)(""),[K0,ra]=(0,m.useState)([]),Xt=(0,m.useRef)(new Set),[Ac,J0]=(0,m.useState)(!1),qp=(0,m.useRef)(0),eo=(0,m.useRef)(0),Bp=(0,m.useRef)(""),[zc,$l]=(0,m.useState)(""),[sa,Ye]=(0,m.useState)(!1),to=(0,m.useRef)(!1),ao=(0,m.useRef)(null),as=(0,m.useRef)(null),xl=(0,m.useRef)(!1),[P0,ut]=(0,m.useState)(""),[F0,Nl]=(0,m.useState)(""),[Mc,Oc]=(0,m.useState)(!1),[ns,Rc]=(0,m.useState)(""),Ip=(0,m.useRef)(""),is=(0,m.useRef)(!1),[os,Lp]=(0,m.useState)(!1),Vc=(0,m.useRef)(null),Dc=(0,m.useRef)(null);(0,m.useEffect)(()=>{let s=Dc.current,d=Vc.current;s===null||!d||(Dc.current=null,d.focus(),d.setSelectionRange(s,s))},[an]);let ls=(0,m.useCallback)(async(s=!1)=>{if(is.current)return null;is.current=!0;let d=setTimeout(()=>Lp(!0),o5);try{let p=await U("/reconcile",{method:"POST",body:s?JSON.stringify({forceStory:!0}):void 0});return o(p),p}catch{return null}finally{clearTimeout(d),Lp(!1),is.current=!1}},[]),Gp=(0,m.useCallback)(async()=>{let s=n?.happenings[0]?.id??"";Rc("Writing...");let d=await ls(!0);if(!d){Rc("The update request failed. Check the village again before retrying; time catch-up may already have run.");return}Rc((d.happenings[0]?.id??"")===s?"No new happening was added. Other village records may have changed during catch-up.":"A new visual event was added. See Events.")},[n,ls]),Te=(0,m.useCallback)(async(s={})=>{try{let d=await U("",{signal:s.signal});o(d),Ve("")}catch(d){if(s.signal?.aborted||s.quiet)return;o(null),Ve(I(d,"Could not read the village."))}},[]);(0,m.useEffect)(()=>{let s=n?.village.nextTransitionAt??"";s.length===0||s===Ip.current||(Ip.current=s,n?.isFounded&&ls())},[n,ls]);let Ha=(0,m.useCallback)(async s=>{try{let d=await U("/catalog",{signal:s});u(d.characters),Ve("")}catch(d){if(s?.aborted)return;Ve(I(d,"Could not read your character library."))}},[]),no=(0,m.useCallback)(async s=>{try{let d=await U("/personas",{signal:s});pp(d.personas)}catch(d){if(s?.aborted)return;pp([]),Ve(I(d,"Could not read your Personas."))}},[]),io=(0,m.useCallback)(async s=>{try{let d=await U("/lorebooks",{signal:s});D0(d.books),$p("")}catch(d){if(s?.aborted)return;$p(I(d,"Could not read Engine lorebooks. Selected books will be skipped until available."))}},[]),Yp=(0,m.useCallback)(async s=>{try{let d=await U("/story?offset=0&limit=50",{signal:s});h(d.entries),v(d.total)}catch(d){if(s?.aborted)return;h(null),Ve(I(d,"Could not read the village story."))}},[]),W0=(0,m.useCallback)(async s=>{j(!0);try{let d=await U(`/story/${encodeURIComponent(s)}`,{method:"DELETE"});h(d.entries),v(d.total),Ve("")}catch(d){Ve(I(d,"That memory could not be removed."))}finally{j(!1)}},[]),e1=(0,m.useCallback)(async()=>{let s=c?.length??0;try{let d=await U(`/story?offset=${s}&limit=50`);h(p=>[...p??[],...d.entries]),v(d.total)}catch(d){Ve(I(d,"Could not read more memories."))}},[c]),rs=(0,m.useCallback)(async s=>{try{let d=await U("/agendas",{signal:s});en(d.villagers)}catch(d){if(s?.aborted)return;en(null),Ve(I(d,"Could not read what the villagers wish for."))}},[]);(0,m.useEffect)(()=>{if(Ze!=="menu"||V!=="agendas"&&V!=="schedules"||!Rt?.some(d=>d.agenda?.personalizationPending&&!d.agenda.personalizationFailure))return;let s=window.setInterval(()=>{rs()},5e3);return()=>window.clearInterval(s)},[Rt,rs,V,Ze]);let t1=(0,m.useCallback)(async s=>{j(!0);try{let d=await U(`/agendas/${encodeURIComponent(s)}/regenerate`,{method:"POST"});en(d.villagers),Ve("")}catch(d){Ve(I(d,"That villager could not be asked again."))}finally{j(!1)}},[]),a1=(0,m.useCallback)(async(s,d)=>{j(!0);try{let p=await U(`/agendas/${encodeURIComponent(s)}/completed/${encodeURIComponent(d)}/correct`,{method:"POST"});en(p.villagers),Ve("")}catch(p){Ve(I(p,"That wish completion could not be corrected."))}finally{j(!1)}},[]),n1=(0,m.useCallback)(async(s,d)=>{j(!0);try{let p=await U(`/agendas/${encodeURIComponent(s)}/ingestion`,{method:"PATCH",body:JSON.stringify({ingestSchedule:d})});en(p.villagers),Ve("")}catch(p){Ve(I(p,"Schedule use could not be changed."))}finally{j(!1)}},[]);(0,m.useEffect)(()=>{let s=new AbortController;return Te({signal:s.signal}),()=>s.abort()},[Te]),(0,m.useEffect)(()=>{let s=()=>{document.hidden||Te({quiet:!0})},d=setInterval(()=>{document.hidden||is.current||Te({quiet:!0})},i5);return document.addEventListener("visibilitychange",s),()=>{clearInterval(d),document.removeEventListener("visibilitychange",s)}},[Te]),(0,m.useEffect)(()=>{if(!L?.id||L.status==="closed"||Ze!=="room")return;Bp.current!==L.id?(Bp.current=L.id,eo.current=Date.parse(L.lastActivityAt||L.startedAt)||Date.now()):eo.current=Math.max(eo.current,Date.parse(L.lastActivityAt||L.startedAt)||0);let s=!1,d=O=>{s||(Le(null),_a(!1),ra([]),Xt.current.clear(),$l(O==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),ee("home"),Te())},p=(O=!1)=>{U("/rooms/active").then(async({session:oe})=>{if(oe?.id===L.id){O&&(await U("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:L.id})}),eo.current=Date.now());return}let ne=await U(`/rooms/archive/${encodeURIComponent(L.id)}`).catch(()=>null);d(ne?.visit.endReason==="inactivity"?"inactivity":"elsewhere")}).catch(oe=>{let ne=Mr(oe);ne&&d(ne)})},y=O=>{if(Date.now()-eo.current>=30*6e4){O.cancelable&&O.preventDefault(),O.stopImmediatePropagation(),p(!0);return}eo.current=Date.now(),!(Date.now()-qp.current<15e3)&&(qp.current=Date.now(),U("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:L.id})}).catch(oe=>{let ne=Mr(oe);ne?d(ne):p()}))},M=()=>p();window.addEventListener("focus",M),document.addEventListener("visibilitychange",M);for(let O of["pointerdown","keydown","input","scroll"])window.addEventListener(O,y,!0);return()=>{s=!0,window.removeEventListener("focus",M),document.removeEventListener("visibilitychange",M);for(let O of["pointerdown","keydown","input","scroll"])window.removeEventListener(O,y,!0)}},[L?.id,L?.status,L?.lastActivityAt,L?.startedAt,Ze,Te]),(0,m.useEffect)(()=>{let s=new AbortController;return U("/rooms/active",{signal:s.signal}).then(({session:d,debugDiscardEnabled:p})=>{J0(p),!(s.signal.aborted||!d)&&(Le(d),Cc("chat"),_a(!0),ee("room"),d.status==="opening"&&(Ye(!0),U("/rooms/greet",{method:"POST",body:JSON.stringify({sessionId:d.id}),signal:AbortSignal.timeout(3e4)}).then(({session:y})=>{s.signal.aborted||Le(y)}).catch(async y=>{if(s.signal.aborted)return;let M=await s0(d.id);s.signal.aborted||(M?Le(M):ut(u0(y)))}).finally(()=>{s.signal.aborted||Ye(!1)})))}).catch(()=>{}),()=>s.abort()},[]),(0,m.useEffect)(()=>{if(V!=="chatlogs"||!n?.isFounded)return;let s=new AbortController,d=new URLSearchParams;return B&&d.set("venueId",B),ue&&d.set("characterId",ue),d.set("offset",String(E)),d.set("limit","20"),f(null),U(`/rooms/archive?${d.toString()}`,{signal:s.signal}).then(({visits:p,total:y})=>{s.signal.aborted||(f(p),z(y),lt(""))}).catch(p=>{s.signal.aborted||lt(I(p,"Venue visits could not be read."))}),()=>s.abort()},[B,ue,E,$,V,n?.isFounded]);let _c=(0,m.useCallback)(async s=>{try{let d=await U(`/rooms/archive/${encodeURIComponent(s)}`);k(d.visit),lt("")}catch(d){lt(I(d,"That visit could not be read."))}},[]),i1=(0,m.useCallback)(async s=>{j(!0);try{await U(`/rooms/archive/${encodeURIComponent(s)}/retry-memory`,{method:"POST"}),await _c(s),b(d=>d+1),lt("")}catch(d){lt(I(d,"Memory filing is still pending."))}finally{j(!1)}},[_c]),jp=(0,m.useCallback)(async s=>{if(window.confirm(s?"Delete this exact visit transcript? Filed memories and world changes remain. Any pending memory can no longer be retried.":"Delete all completed visit transcripts? Filed memories and world changes remain. Any pending memories can no longer be retried.")){j(!0);try{await U(s?`/rooms/archive/${encodeURIComponent(s)}`:"/rooms/archive",{method:"DELETE"}),k(null),_(0),b(d=>d+1),lt("")}catch(d){lt(I(d,"Visit transcripts could not be deleted."))}finally{j(!1)}}},[]);(0,m.useEffect)(()=>{if(!tn)return;let s=new AbortController;return Ha(s.signal),()=>s.abort()},[tn,Ha]);let Xp=n?n.settings.townMapImageSetAt:null;(0,m.useEffect)(()=>{if(Xp===null)return;let s=new AbortController;return(async()=>{try{let d=await U("/town-map",{signal:s.signal});Pr(d.image)}catch{s.signal.aborted||Pr("")}})(),()=>s.abort()},[Xp]);let o1=(0,m.useCallback)(async s=>{j(!0);try{o(await U("/villagers",{method:"POST",body:JSON.stringify({characterId:s})})),Ve(""),await Ha()}catch(d){Ve(I(d,"That character could not move in."))}finally{j(!1)}},[Ha]),l1=(0,m.useCallback)(async s=>{j(!0);try{o(await U(`/villagers/${encodeURIComponent(s)}`,{method:"DELETE"})),Ve(""),l&&await Ha()}catch(d){Ve(I(d,"That villager could not leave."))}finally{j(!1)}},[l,Ha]),r1=(0,m.useCallback)(async s=>{_r(s);try{let d=await U(`/villagers/${encodeURIComponent(s)}/refresh`);cp(p=>({...p,[s]:d})),Ve("")}catch(d){Ve(I(d,"That villager's card could not be compared."))}finally{_r("")}},[]),s1=(0,m.useCallback)(async s=>{_r(s);try{o(await U(`/villagers/${encodeURIComponent(s)}/refresh`,{method:"POST"})),cp(d=>{let p={...d};return delete p[s],p}),Ve("")}catch(d){Ve(I(d,"That villager's card could not be refreshed."))}finally{_r("")}},[]),Ke=(0,m.useCallback)(s=>{vt(s==="noticeboard"?"noticeboard":s==="general"?"general":s==="replyGuidance"||s==="story"||s==="chatlogs"||s==="agendas"||s==="schedules"?"debug":"village"),Z(""),Q(!1),s==="villagers"&&Ha(),s==="village"&&no(),s==="village"&&io(),s==="story"&&Yp(),(s==="agendas"||s==="schedules")&&rs(),s==="village"&&(Ze!=="menu"||V!=="village")&&n&&(Hr(n.settings.promptKnowledge),Ur(n.settings.playerPersonaId),gp(n.settings.setting),fp(n.settings.selectedLorebookIds),bp(n.settings.loreTokenBudget),Qi($n(n.settings.venues).map(p=>({...p})))),Ne(s),ee("menu")},[rs,Ha,io,no,Yp,V,Ze,n]),Hc=(0,m.useCallback)(()=>{ya(!1),Z(""),C(null),Q(!1),ee("home")},[]),u1=(0,m.useCallback)(async()=>{if(!(!L||sa)){Ye(!0),ut(""),P(!1),Le({...L,status:"closing"});try{if(L.id&&await U("/rooms/end",{method:"POST",body:JSON.stringify({sessionId:L.id})}),to.current)return;_a(!1),Le(null),ra([]),Xt.current.clear(),Wi(""),Nl(""),ee("home"),Te()}catch(s){if(to.current)return;let d=Mr(s);if(d){Le(null),_a(!1),ra([]),Xt.current.clear(),$l(d==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),ee("home"),Te();return}ut(I(s,"You could not leave the venue.")),P(!0)}finally{Ye(!1)}}},[Te,L,sa]),c1=(0,m.useCallback)(async()=>{if(!L?.id||L.status!=="active"||sa||xl.current)return;let s=as.current??tc();as.current=s,Ye(!0),ut(""),P(!1);try{let d=await U("/rooms/leave",{method:"POST",body:JSON.stringify({sessionId:L.id,submissionId:s,message:yl}),signal:AbortSignal.timeout(3e5)});Le(d.session),Te(),Oc(!0);for(let p of d.recordEvents??[])Xt.current.has(p.id)||(Xt.current.add(p.id),ra(y=>[...y,p]));as.current=null,Te()}catch(d){ut(I(d,"The scene could not end yet.")),P(!0)}finally{Ye(!1)}},[Te,L,sa,yl]),d1=(0,m.useCallback)(async()=>{if(!(!L?.id||to.current)){to.current=!0,Ye(!0);try{await U("/rooms/leave-pending",{method:"POST",body:JSON.stringify({sessionId:L.id})}),_a(!1),Le(null),ra([]),Xt.current.clear(),ee("home"),P(!1),Te()}catch(s){ut(I(s,"The visit could not be left yet.")),to.current=!1}finally{Ye(!1)}}},[Te,L]),h1=(0,m.useCallback)(async()=>{if(!(!L?.id||!Ac||sa)&&window.confirm("DEBUG: Discard this visit and its transcript? Completed effects and villager memories remain.")){Ye(!0);try{await U("/rooms/debug/discard",{method:"POST",body:JSON.stringify({sessionId:L.id})}),Le(null),_a(!1),ra([]),Xt.current.clear(),Wi(""),ee("home"),Te()}catch(s){ut(I(s,"The debug discard failed."))}finally{Ye(!1)}}},[L,Ac,sa,Te]),m1=(0,m.useCallback)(async()=>{let s=yl.trim();if(L===null||!L.id||Mc||sa||xl.current||s.length===0)return;xl.current=!0;let d=ao.current??tc();ao.current=d;let p=L;try{await U("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:L.id})})}catch(M){xl.current=!1;let O=Mr(M);O?(Le(null),_a(!1),ra([]),Xt.current.clear(),$l(O==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),ee("home"),Te()):ut(I(M,"The visit could not be checked."));return}let y={speakerId:"",name:"",role:"user",content:s,at:new Date().toISOString()};Ye(!0),ut(""),Wi(""),Le({...L,lines:[...L.lines,y]});try{let M=await U("/rooms/turn",{method:"POST",body:JSON.stringify({sessionId:L.id,message:s,mode:es,targetId:es==="fulfill"?wl:"",submissionId:d}),signal:AbortSignal.timeout(3e5)});if(Le(M.session),Oc(M.session.status==="closed"),M.session.status==="closed")ra([]),Xt.current.clear();else for(let O of M.recordEvents??[])Xt.current.has(O.id)||(Xt.current.add(O.id),ra(oe=>[...oe,O]));wl&&!M.session.activeIds.includes(wl)&&ts(""),Up(M.verdict?.reason??""),ao.current=null,Nl(""),Te()}catch(M){let O=Mr(M);if(O){Le(null),_a(!1),ra([]),Xt.current.clear(),$l(O==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),ee("home"),Te();return}Le(p),Wi(s),ut(I(M,"That line could not be sent."))}finally{xl.current=!1,Ye(!1)}},[Te,L,sa,yl,Mc,es,wl]),p1=(0,m.useCallback)(s=>(n?.villagers??[]).filter(d=>d.place?.id===s),[n]),ss=(0,m.useCallback)(s=>{C(null),Q(!1),Oa(s.id),rt("view"),ia(!1),Ce(null),et(null),ee("venue")},[]),Uc=(0,m.useCallback)(async s=>{Ye(!0),ut(""),Nl("");try{let d=await U("/rooms/greet",{method:"POST",body:JSON.stringify({sessionId:s}),signal:AbortSignal.timeout(3e4)});Le(d.session),Te()}catch(d){let p=await s0(s);p?Le(p):ut(u0(d))}finally{Ye(!1)}},[Te]),g1=(0,m.useCallback)(async s=>{Ye(!0);try{let{session:d}=await U("/rooms/continue",{method:"POST",body:JSON.stringify({sessionId:s}),signal:AbortSignal.timeout(1e4)});Le(d),Nl(d.lines.length===0?"The greeting failed. You can start the conversation now.":""),ut("")}catch(d){ut(I(d,"The visit could not continue. Retry or leave the venue."))}finally{Ye(!1)}},[]),Sl=(0,m.useCallback)(async(s,d,p="")=>{to.current=!1,C(null),Q(!1),Cn(null),Wi(""),Oc(!1),ut(""),Nl(""),ra([]),Xt.current.clear(),Ye(!0),Le({version:1,id:"",placeId:s.id,placeName:s.name,startedAt:"",endedAt:"",status:"opening",activeIds:[],participants:[],lines:[]}),_a(!0),ee("room");try{let{session:y}=await U("/rooms",{method:"POST",body:JSON.stringify({venueId:s.id,spaceClass:d,privateOwnerId:p}),signal:AbortSignal.timeout(2e4)});Le(y),Cc("chat"),ts(""),Up(""),$l(""),_a(!0),Te(),y.status==="opening"&&await Uc(y.id)}catch(y){ut(I(y,"That room could not be opened. Retry or leave the venue."))}finally{Ye(!1)}},[Uc,Te]),Qp=(0,m.useCallback)(s=>{Q(!1),C(s.id),ee("home")},[]),Zp=(0,m.useCallback)(()=>{Oa(null),rt("view"),ia(!1),Ce(null),et(null),C(null),ee("home")},[]),f1=(0,m.useCallback)(async()=>{j(!0),Z("");try{o(await U("/settings",{method:"PATCH",body:JSON.stringify({promptKnowledge:an,playerPersonaId:oa,setting:qr,selectedLorebookIds:Br,loreTokenBudget:uc})}))}catch(s){Z(I(s,"Those settings could not be saved."))}finally{j(!1)}},[an,Br,uc,oa,qr]),b1=(0,m.useCallback)(async s=>{j(!0),Z("");try{o(await U("/settings",{method:"PATCH",body:JSON.stringify({storyPace:s})}))}catch(d){Z(I(d,"That could not be saved."))}finally{j(!1)}},[]),Kp=(0,m.useCallback)(async s=>{j(!0),Z("");try{o(await U("/settings",{method:"PATCH",body:JSON.stringify({visitRetention:s})})),b(d=>d+1)}catch(d){Z(I(d,"Visit retention could not be saved."))}finally{j(!1)}},[]),v1=(0,m.useCallback)(async()=>{if(!(n&&$n(n.settings.venues).length>0&&!window.confirm("Replace the current places with new suggestions? This removes places you created or approved."))){j(!0),Z("");try{let s=await U("/bootstrap",{method:"POST"});Qi(s.places.map(d=>({id:Li(),name:d.name,purpose:d.purpose,description:"",category:"public",presentation:{image:null,x:null,y:null},occupancy:{playerHome:!1,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}})))}catch(s){Z(I(s,"The village did not suggest any places."))}finally{j(!1)}}},[n]),y1=(0,m.useCallback)(async()=>{if(yt.trim().length===0){de("Write the Setting and Theme before generating its map.");return}if(mi.trim().length===0){de("The DEBUG map layout prompt cannot be blank.");return}ml(!0),de("");try{let s=await U("/setup/town-map/generate",{method:"POST",body:JSON.stringify({structure:mi===n?.settings.townMapLayoutPrompt?void 0:mi,negative:hl===n?.settings.townMapNegativePrompt?void 0:hl,setting:yt,options:bc,selectedLorebookIds:Ra})}),d=await Wm(s.image);if(d.width!==s.width||d.height!==s.height)throw new Error("The generated map's reported dimensions do not match the image.");vc(s.image),yc("generate"),wc(d),hi("generate")}catch(s){de(I(s,"The village map could not be generated."))}finally{ml(!1)}},[Ra,hl,mi,yt,bc,n?.settings.townMapLayoutPrompt,n?.settings.townMapNegativePrompt]),w1=(0,m.useCallback)(async()=>{de(""),j(!0);try{let s=await U("/setup/public-venue/names/suggest",{method:"POST",body:JSON.stringify({setting:yt,selectedLorebookIds:Ra,loreTokenBudget:Xi})});Xr(s.names)}catch(s){de(I(s,"The village could not suggest names for the public venue."))}finally{j(!1)}},[Ra,Xi,yt]),$1=(0,m.useCallback)(async s=>{if(!s||!n)return;de("");let d=Math.floor((n.settings.townMapImageMaxLength-64)*3/4);if(s.size>d){let p=y=>Math.round(y/1e5)/10;de(`That picture is ${p(s.size)} MB and a village map holds ${p(d)} MB. Choose a smaller copy.`);return}ml(!0);try{let p=await Vr(s),y=await Wm(p);vc(p),yc("upload"),wc(y),hi("upload")}catch(p){de(I(p,"That picture could not be used as the village map."))}finally{ml(!1)}},[n]),Jp=(0,m.useCallback)(async s=>{if(!s||!n)return;Z("");let d=Math.floor((n.settings.townMapImageMaxLength-64)*3/4);if(s.size>d){let p=y=>Math.round(y/1e5)/10;Z(`That picture is ${p(s.size)} MB and the village map holds ${p(d)} MB. Try a smaller copy.`);return}j(!0);try{let p=await Vr(s),y=await Wm(p);Sc({image:p,size:y}),gl(ic("cover"))}catch(p){Z(I(p,"That picture could not be used as the town map."))}finally{j(!1)}},[n]),Pp=(0,m.useCallback)(async()=>{if(!n)return;let s=Ta?Ta.image:Jr;j(!0),Z("");try{o(await U("/settings",{method:"PATCH",body:JSON.stringify({townMapImage:s,townMapView:Tc??n.settings.townMapView})})),Pr(s),Sc(null),gl(null),Ec(!1)}catch(d){Z(I(d,"The town map could not be saved."))}finally{j(!1)}},[n,Tc,Jr,Ta]),us=(0,m.useCallback)(()=>{Sc(null),gl(null),Ec(!1),Z("")},[]),Fp=(0,m.useCallback)(async()=>{j(!0),Z("");try{o(await U("/settings",{method:"PATCH",body:JSON.stringify({townMapImage:""})})),Pr(""),us()}catch(s){Z(I(s,"The town map could not be taken down."))}finally{j(!1)}},[us]),x1=(0,m.useCallback)(async(s,d,p="")=>{if(!Da){Pi(s),Cn(null),Z("");try{o(await U("/locations/venue/image",{method:"POST",body:JSON.stringify({venueId:s,spaceClass:d,privateOwnerId:p})}))}catch(y){Cn({id:s,text:I(y,"That place could not be drawn.")})}finally{Pi("")}}},[Da]),N1=(0,m.useCallback)(async(s,d,p,y="")=>{if(!(!d||!n||Da)){Pi(s),Cn(null),Z("");try{let M=oe=>Math.round(oe/1e5)/10;if(d.size>n.settings.maxVenueImageBytes){Cn({id:s,text:`That picture is ${M(d.size)} MB and a place holds ${M(n.settings.maxVenueImageBytes)} MB. Try a smaller copy.`});return}let O=await Vr(d);o(await U("/locations/venue/image",{method:"PUT",body:JSON.stringify({venueId:s,image:O,spaceClass:p,privateOwnerId:y})}))}catch(M){Cn({id:s,text:I(M,"That picture could not be kept.")})}finally{Pi("")}}},[Da,n]),S1=(0,m.useCallback)(async(s,d,p="")=>{if(!Da){Pi(s),Cn(null),Z("");try{o(await U("/locations/venue/image",{method:"DELETE",body:JSON.stringify({venueId:s,spaceClass:d,privateOwnerId:p})}))}catch(y){Cn({id:s,text:I(y,"That picture could not be taken away.")})}finally{Pi("")}}},[Da]),T1=n?.settings.maxPlaces??48,oo=n?.settings.setupMaxVillagerCount??Jm,Wp=(n?.settings.homeBuildings??[]).map(s=>({...s,name:n?.settings.homeBuildingNames?.[s.kind]??s.name})),E1=n&&!n.isFounded?1+oo:T1,cs=Math.max(0,E1-$n(n?.settings.venues??[]).length),k1=(n?.settings.venues.length??0)+Ir.filter(s=>!n?.settings.venues.some(d=>d.id===s.id)).length,Tl=(0,m.useCallback)(s=>{let d=rp(s);Lr(d.map(p=>({id:p.id,name:p.name,form:p.form??"Home",description:p.description,x:p.presentation.x,y:p.presentation.y,building:p.occupancy.homeKind,isPlayerHome:p.occupancy.playerHome,characterId:p.occupancy.residentCharacterId}))),dc(d[0]?.id??null),Dt(!1)},[]),eg=(0,m.useCallback)(()=>{Z(""),n&&Tl(n.settings.venues),vt("village"),Ne("homes"),ee("menu")},[Tl,n]),tg=(0,m.useCallback)((s,d)=>{if(Z(""),la.length>=cs||la.length>=1+oo)return;let p=Li(),y=la.length===0;Lr(M=>[...M,{id:p,name:y?"Your residence":`Residence ${M.length+1}`,form:"Home",description:"",x:s,y:d,building:null,isPlayerHome:y,characterId:null}]),dc(p)},[la.length,cs,oo]),C1=(0,m.useCallback)((s,d,p)=>{let y=$e.find(O=>O.category==="public-center"),M=gc??(Gr?y?.id:void 0);if(Xw({x:s,y:d},$e.filter(O=>O.id!==M).map(O=>O.presentation),p??{width:1e3,height:700,photoWidth:58,photoHeight:58})){fc("That photograph would cover another venue. Place it a little to the side.");return}if(fc(""),M)ci(O=>O.map(oe=>oe.id===M?{...oe,presentation:{...oe.presentation,x:s,y:d}}:oe)),kn(M);else if(Gr){let O=o0(Li(),"gathering",s,d);ci(oe=>[...oe,O]),kn(O.id)}else if(si){let O=$e.filter(ne=>ne.classes?.includes("residence"));if(O.length>=1+oo)return;let oe=o0(Li(),"residence",s,d,O.length===0,O.length+1);ci(ne=>[...ne,oe]),kn(oe.id)}di(null),Dt(!1),ui(!1)},[gc,si,Gr,oo,$e]),_t=(0,m.useCallback)((s,d)=>{ci(p=>p.map(y=>y.id===s?d(y):y))},[]),A1=(0,m.useCallback)(s=>{ci(d=>{let p=d.filter(y=>y.id!==s);if(!p.some(y=>y.occupancy.playerHome)){let y=p.findIndex(M=>M.classes?.includes("residence"));y>=0&&(p[y]={...p[y],occupancy:{...p[y].occupancy,playerHome:!0,residentCharacterId:null},residentIds:[]})}return p}),kn(d=>d===s?null:d),Zi(d=>{let p={...d};return delete p[s],p})},[]),z1=(0,m.useCallback)((s,d)=>{tg(s,d),Dt(!1),ee("menu")},[tg]),ag=(0,m.useCallback)((s,d)=>{n?.settings.venues.some(p=>p.id===s&&p.occupancy.residentCharacterId)||Lr(p=>p.map(y=>y.id===s?{...y,...d}:y))},[n]),M1=(0,m.useCallback)(s=>{if(n?.settings.venues.some(d=>d.id===s&&d.occupancy.residentCharacterId)){Z("Move the resident to another venue before removing this home.");return}Lr(d=>{let p=d.filter(y=>y.id!==s);return p.length>0&&!p.some(y=>y.isPlayerHome)&&(p[0]={...p[0],isPlayerHome:!0,characterId:null}),p})},[n]),O1=(0,m.useCallback)(async()=>{if(n){if(la.some(s=>!s.description.trim())){Z("Review a description for every home before saving.");return}j(!0),Z("");try{o(await U("/settings",{method:"PATCH",body:JSON.stringify({venues:a5(n.settings.venues,la),venueScope:"homes"})})),Dt(!1)}catch(s){Z(I(s,"Those homes could not be saved."))}finally{j(!1)}}},[la,n]),R1=async s=>{if(!n)return;let d=n.villagers.find(y=>y.characterId===s.characterId)?.name,p=s.isPlayerHome?`${Yi(n)}'s home`:d?`${d}'s home`:p0(Wp,s.building).name;j(!0),Z("");try{let y=await U("/locations/venue/descriptions/draft",{method:"POST",body:JSON.stringify({venues:[{id:s.id,name:p,purpose:s.isPlayerHome?"Player residence":d?`Home of ${d}`:"Available home",homeKind:s.building}]})});ag(s.id,{description:y.descriptions[s.id]??""})}catch(y){Z(I(y,"The home description could not be generated. You can write it by hand."))}finally{j(!1)}},El=(0,m.useCallback)((s,d)=>{Z(""),de(""),Rp(!1),pl(!1),Kr(!1),ya(!1),mp(""),pc(0),Sp(s?"":d?.village.name??""),Tp(s?"":d?.village.setting??""),Ep(s?"":d?.settings.foundingReason??""),kp(s?"":d?.settings.foundingDetails??""),Xr([]);let p=s||!d?[]:d.settings.venues.filter(y=>y.classes?.includes("residence")||y.category==="public-center");ci(p.map(y=>({...y,guidance:""}))),kn(p[0]?.id??null),di(null),Zi({}),Ki(null),fc(""),vp(s?[]:d?.settings.selectedLorebookIds??[]),yp(s?1600:d?.settings.loreTokenBudget??1600),zp({...a0}),hi(s?"generate":d?.settings.townMapImageSetAt?"existing":"none"),vc(""),yc(null),wc(null),$c(d?.settings.townMapLayoutPrompt??""),xc(d?.settings.townMapNegativePrompt??""),ml(!1),Ur(s?"":d?.settings.playerPersonaId??""),no(),io(),Tl(s||!d?[]:d.settings.venues),ee("setup")},[io,no,Tl]),ng=(0,m.useCallback)(s=>{if(Ue===0&&s>0){if(Na.trim().length===0){de("Give the village a name before continuing.");return}if(oa.trim().length===0){de("Choose the Persona who lives in this village.");return}if(!Yt||Yt==="something-else"&&!Va.trim()){de("Choose why the village is being founded, and describe Something else if selected.");return}}if(Ue===1&&s>1&&Nc.length>0){de(Nc);return}if(Ue===1&&s>1&&Op){pl(!0);return}if(Ue===2&&s>2){if(yt.trim().length===0){de("Write the Setting and Theme before continuing.");return}if(Se!=="none"&&!pi){de(Se==="generate"?"Generate the map, or choose an upload or no background image.":"Choose a map image, or select no background image.");return}}if(Ue===3&&s>3){let d=$e.filter(O=>O.classes?.includes("residence")),p=d.filter(O=>!O.occupancy.playerHome),y=p.length;if(!d.some(O=>O.occupancy.playerHome)||y<i0||y>Jm||!$e.some(O=>O.category==="public-center")){de("Place your home, one to three homes for initial villagers, and a named public meeting location.");return}if($e.some(O=>!O.name.trim()||!O.form?.trim()||!O.description.trim()||!O.spaces?.[0]?.description.trim())){de("Give every venue a name, form, exterior description, and scene description before review.");return}let M=p.map(O=>O.occupancy.residentCharacterId).filter(Boolean);if(M.length!==p.length||new Set(M).size!==M.length){de("Assign a different villager to each villager Residence before review.");return}}pl(!1),de(""),pc(s),s===0&&(no(),io()),s===3&&Ha(),Dt(!1),ui(!1),di(null)},[Nc,$e,Op,Ha,no,io,oa,Se,pi,Na,Yt,Va,yt,Ue]),V1=(0,m.useCallback)(()=>{pl(!1),de(""),pc(2),Dt(!1),ui(!1)},[]),D1=(0,m.useCallback)(()=>{pl(!1),de("")},[]),J=$e.find(s=>s.id===Cp)??null,lo=J?He(J,J.category==="public-center"?"gathering":"residence"):null,ig=s=>({id:s.id,name:s.name,form:s.form??"",purpose:s.purpose,description:s.description,spaceDescription:s.spaces?.[0]?.description??"",venueClass:s.classes?.includes("gathering")?"gathering":"residence",residentCharacterId:s.occupancy.residentCharacterId??"",guidance:s.guidance}),og=async s=>{if(!(!s.length||Sa)){Ji(!0),de("");try{let d=await U("/setup/venues/draft",{method:"POST",body:JSON.stringify({setting:yt,foundingReason:Yt,foundingDetails:Va,selectedLorebookIds:Ra,loreTokenBudget:Xi,venues:s.map(ig)})});Zi(p=>({...p,...d.drafts}))}catch(d){de(I(d,"Venue text could not be drafted."))}finally{Ji(!1)}}},qc=(s,d)=>{let p=jt[s];p&&(_t(s,y=>{let M=(ne,kt,ro="")=>(d||!ne.trim()||ne===ro)&&kt||ne,O=He(y,y.classes?.includes("gathering")?"gathering":"residence"),oe=(ne,kt)=>d||ne.length===0?kt??ne:ne;return{...y,name:M(y.name,p.name,y.category==="public-center"?"Gathering Place":y.occupancy.playerHome?"Your residence":`Residence ${$e.filter(ne=>ne.classes?.includes("residence")).findIndex(ne=>ne.id===y.id)+1}`),form:M(y.form??"",p.form,y.category==="public-center"?"Gathering place":"Home"),purpose:M(y.purpose,p.purpose),description:M(y.description,p.description),spaces:[{...O,description:M(O.description,p.spaceDescription),state:{...O.state,condition:M(O.state.condition,p.condition),items:oe(O.state.items,p.items),publicFacts:oe(O.state.publicFacts,p.publicFacts),features:oe(O.state.features.map(ne=>ne.text),p.features).map((ne,kt)=>({id:O.state.features[kt]?.id??Li(),text:ne,sourceCharacterId:"",locked:O.state.features[kt]?.locked??!1,updatedAt:""}))}}]}}),Zi(y=>{let M={...y};return delete M[s],M}))},_1=async(s,d)=>{if(!Sa){Ji(!0),de("");try{let p=await U("/setup/venue-image/generate",{method:"POST",body:JSON.stringify({venue:ig(s),area:d,villageName:Na,setting:yt,selectedLorebookIds:Ra})});Ki({venueId:s.id,area:d,image:p})}catch(p){de(I(p,"Venue art could not be generated."))}finally{Ji(!1)}}},H1=async(s,d,p)=>{if(!(!p||Sa)){if(p.size>(n?.settings.maxVenueImageBytes??8e6)){de("That venue image is too large. Choose a smaller file.");return}Ji(!0),de("");try{let y=await U("/setup/venue-image",{method:"PUT",body:JSON.stringify({name:s.name,image:await Vr(p)})});Ki({venueId:s.id,area:d,image:y})}catch(y){de(I(y,"That venue image could not be uploaded."))}finally{Ji(!1)}}},U1=()=>{if(!cl)return;let{venueId:s,area:d,image:p}=cl;_t(s,y=>d==="exterior"?{...y,presentation:{...y.presentation,image:p}}:{...y,spaces:[{...He(y,y.classes?.includes("gathering")?"gathering":"residence"),image:p}]}),Ki(null)},lg=(0,m.useCallback)(()=>{if(Na.trim().length===0)return"Give the village a name.";if(oa.trim().length===0)return"Choose the Persona who lives in this village.";if(!Yt||Yt==="something-else"&&!Va.trim())return"Choose why the village is being founded.";if(yt.trim().length===0)return"Write the Setting and Theme.";if(Se!=="none"&&!pi)return"Choose, generate, or upload the village map.";let s=$e.filter(y=>y.classes?.includes("residence")),d=s.filter(y=>!y.occupancy.playerHome);if(d.length<i0||d.length>Jm)return"Place one to three homes for initial villagers.";if(!s.some(y=>y.occupancy.playerHome))return"One Residence has to be yours.";if($e.some(y=>!y.name.trim()||!y.form?.trim()||!y.description.trim()||!y.spaces?.[0]?.description.trim()))return"Give every venue a name, Form, exterior description, and scene description in Step 4.";let p=d.map(y=>y.occupancy.residentCharacterId).filter(y=>y!==null);return p.length!==d.length?"Choose who lives in each villager home.":new Set(p).size!==p.length?"A villager can only live in one house.":$e.filter(y=>y.category==="public-center").length!==1?"Place one Gathering Place.":""},[$e,oa,Se,pi,Na,Yt,Va,yt]),q1=(0,m.useCallback)(async()=>{let s=lg();if(s){de(s);return}j(!0),de("");try{let d=await U("/setup",{method:"POST",body:JSON.stringify({name:Na.trim(),setting:yt.trim(),foundingReason:Yt,foundingDetails:Va.trim(),selectedLorebookIds:Ra,loreTokenBudget:Xi,playerPersonaId:oa,townMapImage:pi??"",townMapView:Se==="existing"?Fi:ic("cover"),venues:$e})});o(d),Dt(!1),ee(!n?.isFounded||d.foundingPreparation?.status==="pending"||d.foundingPreparation?.status==="failed"?"preparing":"home")}catch(d){de(I(d,"The village could not be founded."))}finally{j(!1)}},[n?.isFounded,$e,oa,Fi,lg,Se,pi,Na,Yt,Va,Ra,Xi,yt]),B1=(0,m.useCallback)(async()=>{j(!0),Z("");try{let s=await U("/setup/reset",{method:"POST"});o(s),u(null),El(!0,s)}catch(s){Z(I(s,"The village could not be reset."))}finally{j(!1),Kr(!1)}},[El]),rg=(0,m.useRef)(!1);(0,m.useEffect)(()=>{!n||rg.current||(rg.current=!0,n.isFounded?n.foundingPreparation&&n.foundingPreparation.status!=="ready"&&ee("preparing"):El(!1,n))},[El,n]),(0,m.useEffect)(()=>{if(Ze!=="preparing")return;let s=!1,d=async()=>{try{let y=await U("/setup/preparation");if(s)return;o(y),Zr(""),(!y.foundingPreparation||y.foundingPreparation.status==="ready")&&ee("home")}catch(y){s||Zr(I(y,"Preparation status could not be read."))}};d();let p=window.setInterval(()=>{d()},2500);return()=>{s=!0,window.clearInterval(p)}},[Ze]);let I1=(0,m.useCallback)(async()=>{Zr("");try{o(await U("/setup/preparation/retry",{method:"POST"}))}catch(s){Zr(I(s,"Preparation could not be retried."))}},[]),L1=(0,m.useCallback)(()=>{Ce({id:Li(),name:"",form:"",classes:["other"],spaces:[],residenceCapacity:1,residentIds:[],improvements:[null,null],purpose:"",description:"",category:"",presentation:{image:null,x:null,y:null},occupancy:{playerHome:!1,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}})},[]),G1=(0,m.useCallback)(async s=>{j(!0),Z("");try{let d=n?.settings.venues.some(O=>O.id===s.id)??!1,p=xn(s).map(O=>He(s,O)),y=await U(d?`/locations/venue/${encodeURIComponent(s.id)}`:"/locations/venue",{method:d?"PUT":"POST",body:JSON.stringify({name:s.name,form:s.form,classes:s.classes,residenceCapacity:s.residenceCapacity,spaces:p,workerIds:s.workerIds??[],presentation:{x:s.presentation.x,y:s.presentation.y},purpose:s.purpose,category:s.category,description:p[0]?.description??s.description,state:{condition:p[0]?.state.condition??"",furniture:p[0]?.state.items??[],publicFacts:p[0]?.state.publicFacts??[],features:p[0]?.state.features??[]}})}),M=$n(y.settings.venues).find(O=>d?O.id===s.id:O.name.toLowerCase()===s.name.trim().toLowerCase());o(y),Ce(null),Qi(O=>{let oe=O.map(ne=>ne.id===s.id&&M?M:ne);return[...oe,...$n(y.settings.venues).filter(ne=>!oe.some(kt=>kt.id===ne.id))]})}catch(d){Z(I(d,"That place could not be saved."))}finally{j(!1)}},[n]),Y1=(0,m.useCallback)(async s=>{let d=n?.settings.venues.find(p=>p.id===s);if(!d){Qi(p=>p.filter(y=>y.id!==s));return}j(!0),Z("");try{let p=await U(`/locations/venue/${encodeURIComponent(s)}/dependencies`);if(p.roomPresent||p.playerHome||p.residentCharacterIds.length||p.pendingMailCount){Z(p.roomPresent?"End the active visit before deleting this Venue.":p.pendingMailCount?"Resolve pending Venue decisions before deleting this Venue.":"Move every resident, including yourself, before deleting this Residence.");return}let y=p.residentCharacterIds.length+p.pendingResidenceCharacterIds.length,M=y||p.workerCharacterIds.length||p.remapCount||p.eventCount?`This place is referenced by ${y} pending moves, ${p.workerCharacterIds.length} workers, ${p.remapCount} schedule moves, and ${p.eventCount} events. Delete it?`:`Delete ${d.name}?`;if(!window.confirm(M))return;let O=await U(`/locations/venue/${encodeURIComponent(s)}`,{method:"DELETE",body:JSON.stringify({confirmed:!0})});o(O),Qi(oe=>oe.filter(ne=>ne.id!==s))}catch(p){Z(I(p,"That place could not be removed."))}finally{j(!1)}},[n]),sg=(0,m.useCallback)(async(s,d)=>{j(!0),Z("");try{let p=tt[s.id]??s.venueDraft,y=await U(`/venue-requests/${encodeURIComponent(s.id)}/${d?"approve":"deny"}`,{method:"POST",body:d?JSON.stringify(p):void 0});if(o(y),d){let M=new Set(Ir.map(O=>O.id));Qi(O=>[...O,...$n(y.settings.venues).filter(oe=>!M.has(oe.id))])}st(M=>{let O={...M};return delete O[s.id],O})}catch(p){Z(I(p,d?"That venue could not be approved.":"That request could not be denied."))}finally{j(!1)}},[tt,Ir]),j1=(0,m.useCallback)(s=>{let d=Vc.current,p=d?.selectionStart??an.length,y=d?.selectionEnd??p;Dc.current=p+s.length,Hr(`${an.slice(0,p)}${s}${an.slice(y)}`)},[an]),ug=(0,m.useCallback)(async()=>{let s=jr.trim();if(s.length!==0){j(!0),Z("");try{o(await U("/noticeboard",{method:"POST",body:JSON.stringify({notice:s})})),Np("")}catch(d){Z(I(d,"That notice could not be pinned up."))}finally{j(!1)}}},[jr]),X1=(0,m.useCallback)(async s=>{j(!0),Z("");try{o(await U(`/noticeboard/${s}`,{method:"DELETE"}))}catch(d){Z(I(d,"That notice could not be taken down."))}finally{j(!1)}},[]),ds=hp.trim().toLowerCase(),Bc=(l??[]).filter(s=>ds.length===0||s.name.toLowerCase().includes(ds)||s.comment.toLowerCase().includes(ds)||s.tags.some(d=>d.toLowerCase().includes(ds))),cg=[...(n?.villagers??[]).map(s=>s.characterId),...tn?Bc.map(s=>s.id):[]].join(`
`),dg=(0,m.useRef)(new Set);(0,m.useEffect)(()=>{let s=cg.split(`
`).filter(p=>p.length>0&&!dg.current.has(p));if(s.length===0)return;for(let p of s)dg.current.add(p);let d=new AbortController;return(async()=>{try{let p=await JS(s,d.signal);d.signal.aborted||R0(y=>({...y,...p}))}catch{}})(),()=>d.abort()},[cg]);let Ic=n?.settings.playerPersonaId??"";(0,m.useEffect)(()=>{if(dp(null),Ic.length===0)return;let s=new AbortController;return(async()=>{try{let d=await PS(Ic,s.signal);s.signal.aborted||dp(d)}catch{}})(),()=>s.abort()},[Ic]);let Et=(0,m.useCallback)(s=>s?l?.find(d=>d.id===s)?.name??n?.villagers.find(d=>d.characterId===s)?.name??"":"",[l,n]),Q1=(()=>{let s=n?.settings.venues??[],d=[],p=new Map;for(let y of n?.villagers??[]){let M=y.place?.id;if(!M)continue;let O=p.get(M);O?O.push(y):p.set(M,[y])}for(let y of s){let M=Or(y);if(!M)continue;let O=y.occupancy.residentCharacterId,oe=ul(y),ne=y.occupancy.playerHome?Yi(n):Et(O);d.push({id:y.id,x:M.x,y:M.y,text:oe?h5(ne):y.name,image:y.presentation.image?.url??null,tone:oe?g0({isPlayerHome:y.occupancy.playerHome,occupant:O}):"venue",selected:Tn===y.id,doors:Tn===y.id?[{label:"View venue",onSelect:()=>ss(y)},{label:"Visit",onSelect:()=>{Sl(y)}}]:void 0,onSelect:()=>Qp(y)}),(p.get(y.id)??[]).forEach((kt,ro)=>{d.push({id:`villager:${kt.characterId}`,x:M.x,y:M.y,dy:p5*(ro+1),text:kt.name,tone:"resident",kind:"person"})})}return d})(),Z1=$e.flatMap(s=>{let d=Or(s);return d?[{id:s.id,x:d.x,y:d.y,text:s.name||(s.category==="public-center"?"Gathering Place":"Residence"),image:s.presentation.image?.url??null,tone:s.category==="public-center"?"venue":s.occupancy.playerHome?"player":"resident",onSelect:()=>kn(s.id)}]:[]});if(Ze==="room")return(0,r.jsxs)("div",{className:`${i}-root ${i}-room-screen`,children:[L?(0,r.jsx)(S5,{room:L,picture:jS(n?.settings.venues??[],L),draft:yl,mode:es,targetId:wl,busy:sa,error:P0,greetingNotice:F0,ruling:Z0,open:Q0,ended:Mc,playerName:Yi(n),playerPortrait:V0??void 0,portraits:lc,sprites:Object.fromEntries((n?.villagers??[]).map(s=>[s.characterId,s.sprite])),onDraft:s=>{ao.current=null,as.current=null,Wi(s)},onMode:s=>{ao.current=null,Cc(s),s!=="fulfill"&&ts("")},onTarget:s=>{ao.current=null,ts(s)},onSend:()=>{m1()},onLeave:()=>{c1()},onViewVenue:()=>{Oa(L.placeId),Ce(null),ee("venue"),Te()},onEnterPrivate:L.area==="shared"&&L.privateAccessOwnerId?()=>{Ye(!0),U("/rooms/enter-private",{method:"POST",body:JSON.stringify({sessionId:L.id,ownerId:L.privateAccessOwnerId})}).then(({session:s})=>{Le(s),Te()}).catch(s=>ut(I(s,"That private space could not be entered."))).finally(()=>Ye(!1))}:void 0,privateSpaceOwnerName:Et(L.privateAccessOwnerId),onEnd:()=>{u1()},notices:K0,onDismissNotice:s=>ra(d=>d.filter(p=>p.id!==s)),debugDiscardEnabled:Ac,onDebugDiscard:()=>{h1()},onLeavePending:()=>{d1()},endFailed:R,onRetryGreeting:()=>{if(L.id)Uc(L.id);else{let s=n?.settings.venues.find(d=>d.id===L.placeId);s&&Sl(s)}},onContinueWithoutGreeting:()=>{L.id&&g1(L.id)},onUseMailbox:n?.settings.venues.some(s=>s.id===L.placeId&&s.occupancy.playerHome&&(!L.spaceClass||L.spaceClass==="residence"))?()=>vl(!0):void 0}):(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:Hc,children:"Back to village"}),X0&&n?(0,r.jsx)("div",{className:`${i}-mailbox-backdrop`,onClick:()=>vl(!1),children:(0,r.jsxs)("section",{className:`${i}-mailbox`,role:"dialog","aria-modal":"true","aria-label":"Mailbox",onClick:s=>s.stopPropagation(),children:[(0,r.jsxs)("div",{className:`${i}-row`,style:{justifyContent:"space-between"},children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Mailbox"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>vl(!1),children:"Close"})]}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Venue decisions and replies from the people affected by them."}),(0,r.jsxs)("div",{className:`${i}-mailbox-list`,children:[[...n.venueMail??[]].reverse().map(s=>(0,r.jsxs)("article",{className:`${i}-mailbox-item`,children:[(0,r.jsx)("strong",{children:s.title}),(0,r.jsx)("p",{children:s.detail}),(0,r.jsx)("p",{className:`${i}-hint`,children:s.status==="awaiting-villagers"?`Awaiting replies \xB7 due ${new Date(s.dueAt).toLocaleString()}`:s.status==="pending-player"?"Awaiting your decision":s.status==="approved"?"Approved":"Declined"}),s.decisions.map(d=>(0,r.jsxs)("p",{children:[(0,r.jsxs)("strong",{children:[Et(d.characterId),":"]})," ",d.reply]},d.characterId)),s.status==="pending-player"&&s.kind==="villager-change"?(0,r.jsx)(N5,{entry:s,onDecide:async(d,p)=>{o(await U(`/venue-mail/${encodeURIComponent(s.id)}/decision`,{method:"POST",body:JSON.stringify({approved:d,...p})}))}}):null,s.error?(0,r.jsxs)("p",{className:`${i}-hint`,children:["Reply delayed: ",s.error]}):null]},s.id)),(n.venueMail?.length??0)===0&&n.venueRequests.length===0&&n.upgradeRequests.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"No Venue mail yet."}):null,n.venueRequests.map(s=>(0,r.jsxs)("article",{className:`${i}-mailbox-item`,children:[(0,r.jsxs)("strong",{children:[s.requesterName||"A villager"," suggests ",s.venueDraft.name]}),(0,r.jsx)("p",{children:s.venueDraft.purpose}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{vl(!1),Ke("venueRequests")},children:"Review request"})]},s.id)),n.upgradeRequests.map(s=>(0,r.jsxs)("article",{className:`${i}-mailbox-item`,children:[(0,r.jsxs)("strong",{children:[s.requesterName," suggests a home change"]}),(0,r.jsx)("p",{children:s.detail}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{vl(!1),Ke("venueRequests")},children:"Review request"})]},s.id))]})]})}):null]});if(Ze==="venue"){let s=(n?.settings.venues??[]).find(T=>T.id===Vt)??null;if(!n||!s)return(0,r.jsx)("div",{className:`${i}-root`,children:(0,r.jsxs)("header",{className:`${i}-header`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("h1",{className:`${i}-title`,children:"A place that is gone"}),(0,r.jsx)("p",{className:`${i}-subtitle`,children:"This venue is no longer in the village."})]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:Zp,children:"Back to map"})]})});let d=p1(s.id),p=xn(s),y=s.occupancy.homeKind?p0(Wp,s.occupancy.homeKind).name:"",M=s.occupancy.playerHome?Yi(n):Et(s.occupancy.residentCharacterId),O=p.includes("residence")&&(s.residentIds?.length??0)>0,oe=L?.placeId===s.id&&(L.area==="shared"||L.area==="private"),ne=L?.placeId===s.id&&L.area==="private"?L.privateOwnerId:"",kt=s.occupancy.playerHome||s.playerSeenShared||oe,ro=(s.privateSpaces??[]).filter(T=>s.playerSeenPrivateIds?.includes(T.ownerId)||T.ownerId===ne),kl=[...p.map(T=>({key:T,label:`${T[0].toUpperCase()}${T.slice(1)} space`,spaceClass:T,ownerId:""})),...(s.playerInvitations??[]).filter(T=>T.scope==="private"&&T.ownerId).map(T=>({key:`private:${T.ownerId}`,label:`${Et(T.ownerId??"")}'s private space`,spaceClass:"residence",ownerId:T.ownerId??""}))],Lc=(T,K,X,te="")=>(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsx)("h3",{className:`${i}-panel-title`,children:T}),K?(0,r.jsx)("img",{className:`${i}-venue-space-picture`,src:K.url,alt:`${T} at ${s.name}`}):(0,r.jsx)("div",{className:`${i}-venue-image-empty`,children:"No image yet"}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:!!Da||H,onClick:()=>{x1(s.id,X,te)},children:K?"Redraw image":"Draw image"}),(0,r.jsx)("input",{className:`${i}-file`,type:"file",accept:"image/*","aria-label":`Upload ${T.toLowerCase()} image`,disabled:!!Da||H,onChange:Je=>{let Cl=Je.target.files?.[0];Je.target.value="",N1(s.id,Cl,X,te)}}),K?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:!!Da||H,onClick:()=>{S1(s.id,X,te)},children:"Remove image"}):null]})]},te||X||"exterior"),so=T=>({name:T.name,form:T.form,purpose:T.purpose,workerIds:T.workerIds,position:{x:T.presentation.x,y:T.presentation.y},spaces:p.map(K=>{let X=He(T,K);return{description:X.description,condition:X.state.condition,items:X.state.items,publicFacts:X.state.publicFacts,features:X.state.features.map(({id:te,text:Je,locked:Cl})=>({id:te,text:Je,locked:Cl}))}}),privateSpaces:T.privateSpaces?.map(K=>({ownerId:K.ownerId,description:K.description,condition:K.state.condition,items:K.state.items,publicFacts:K.state.publicFacts,features:K.state.features.map(({id:X,text:te,locked:Je})=>({id:X,text:te,locked:Je}))}))}),K1=!!(q&&JSON.stringify(so(q))!==JSON.stringify(so(s))),J1=!!(Y&&(JSON.stringify(Y.classes)!==JSON.stringify(p)||Y.capacity!==(s.residenceCapacity??1)||Y.slot!==0||Y.title||Y.description||Y.extraBeds)),P1=()=>{(ce==="edit"&&K1||ce==="proposal"&&J1)&&!window.confirm("Discard your unsaved changes?")||(rt("view"),Ce(null),et(null),Ae(""),bt(""))},hg=(T,K)=>{o(T);let X=T.settings.venues.find(te=>te.id===s.id);X&&Ce(structuredClone(X)),bt(K)},F1=async()=>{if(q){if(O){let T=so(q),K=so(s),X=p.indexOf("residence");if((X>=0&&JSON.stringify(T.spaces[X])!==JSON.stringify(K.spaces[X])||JSON.stringify(T.privateSpaces)!==JSON.stringify(K.privateSpaces))&&!window.confirm("Saving Venue details will discard unsaved room changes. Continue?"))return}Nt(!0),Ae(""),bt("");try{let T=p.map(te=>He(O&&te==="residence"?s:q,te)),K=T[0],X=await U(`/locations/venue/${encodeURIComponent(s.id)}`,{method:"PUT",body:JSON.stringify({name:q.name,form:q.form,purpose:q.purpose,description:O?s.description:K?.description??q.description,spaces:T,workerIds:q.workerIds??[],presentation:{x:q.presentation.x,y:q.presentation.y},state:O?s.state:{condition:K?.state.condition??"",furniture:K?.state.items??[],publicFacts:K?.state.publicFacts??[],features:K?.state.features??[]}})});hg(X,"Venue details saved.")}catch(T){Ae(I(T,"The Venue could not be saved."))}finally{Nt(!1)}}},mg=async(T,K="")=>{if(!q)return;let X=T==="private"?q.privateSpaces?.find(Je=>Je.ownerId===K):He(q,"residence");if(!X)return;let te=structuredClone(q);if(T==="shared"?te.spaces=te.spaces?.map(Je=>Je.venueClass==="residence"?He(s,"residence"):Je):te.privateSpaces=te.privateSpaces?.map(Je=>Je.ownerId===K?s.privateSpaces?.find(Cl=>Cl.ownerId===K)??Je:Je),!(JSON.stringify(so(te))!==JSON.stringify(so(s))&&!window.confirm("Submitting this room edit will discard other unsaved changes. Continue?"))){Nt(!0),Ae(""),bt("");try{let Je=await U(`/locations/venue/${encodeURIComponent(s.id)}/edit-proposals`,{method:"POST",body:JSON.stringify({target:T,ownerId:K,description:X.description,state:X.state})});hg(Je,`${T==="private"?"Private":"Shared"} room edit proposed.`)}catch(Je){Ae(I(Je,"That room edit could not be proposed."))}finally{Nt(!1)}}},pg=m5(s,M);return(0,r.jsxs)("div",{className:`${i}-root`,children:[(0,r.jsxs)("header",{className:`${i}-header`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("h1",{className:`${i}-title`,children:ce==="view"?pg:`${ce==="edit"?"Edit Venue":"Propose Change"} \xB7 ${pg}`}),(0,r.jsx)("p",{className:`${i}-subtitle`,children:ce==="view"?d.length===0?"Nobody is here right now":`Villagers here: ${d.map(T=>T.name).join(", ")}`:ce==="edit"?"Pictures and venue details":"Review a structural change"})]}),(0,r.jsx)("div",{className:`${i}-actions`,children:ce==="view"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Ce(structuredClone(s)),Ae(""),bt(""),rt("edit")},children:"Edit Venue"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{et({classes:p,capacity:s.residenceCapacity??1,slot:0,title:"",description:"",extraBeds:0}),Ae(""),bt(""),rt("proposal")},children:"Propose Change"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:L?.placeId===s.id&&L.status!=="closed"?()=>ee("room"):Zp,children:L?.placeId===s.id&&L.status!=="closed"?"Return to scene":"Back to map"})]}):(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:P1,children:ce==="edit"?"Close Editor":"Exit Change Proposal"})})]}),ce==="view"?(0,r.jsxs)("main",{className:`${i}-venue-page`,children:[(0,r.jsxs)("section",{className:`${i}-venue-hero`,children:[s.presentation.image?(0,r.jsx)("img",{className:`${i}-venue-picture`,src:s.presentation.image.url,alt:`Exterior of ${s.name}`}):(0,r.jsx)("div",{className:`${i}-venue-image-empty`,children:"Exterior image not drawn yet"}),(0,r.jsxs)("div",{className:`${i}-venue-context`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"The place"}),s.purpose?(0,r.jsx)("p",{className:`${i}-venue-beat`,children:s.purpose}):null,s.form||y?(0,r.jsx)("p",{children:s.form||y}):null,n.village.setting?(0,r.jsx)("p",{className:`${i}-hint`,children:n.village.setting}):null,p.includes("residence")?(0,r.jsxs)("p",{className:`${i}-hint`,children:[oc(s)," / ",c0(s)," residents"]}):null,(0,r.jsx)("div",{className:`${i}-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:sa,"aria-expanded":kl.length>1?Nn:void 0,onClick:()=>{if(kl.length===1){let T=kl[0];Sl(s,T.spaceClass,T.ownerId)}else ia(T=>!T)},children:sa?"Opening visit\u2026":"Visit Venue"})}),Nn&&kl.length>1?(0,r.jsxs)("div",{className:`${i}-venue-visit-picker`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Choose a space"}),kl.map(T=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:sa,onClick:()=>{ia(!1),Sl(s,T.spaceClass,T.ownerId)},children:T.label},T.key))]}):null,p.includes("residence")&&!s.occupancy.playerHome?(0,r.jsx)("p",{className:`${i}-hint`,children:"You can speak from outside. Entering a resident's home requires an invitation."}):null]})]}),p.includes("residence")&&!kt?(0,r.jsx)("p",{className:`${i}-hint`,children:"The shared Residence space appears after you enter with an invitation."}):null,(0,r.jsxs)("div",{className:`${i}-venue-space-grid`,children:[p.filter(T=>T!=="residence"||kt).map(T=>{let K=He(s,T);return(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:T==="residence"?"Shared Residence space":`${T[0].toUpperCase()}${T.slice(1)} space`}),K.image?(0,r.jsx)("img",{className:`${i}-venue-space-picture`,src:K.image.url,alt:`${T} space at ${s.name}`}):(0,r.jsx)("div",{className:`${i}-venue-image-empty`,children:"Image not drawn yet"}),K.description?(0,r.jsx)("p",{className:`${i}-venue-beat`,children:K.description}):null,K.state.condition?(0,r.jsxs)("p",{className:`${i}-hint`,children:["Condition now: ",K.state.condition]}):null,K.state.items.length?(0,r.jsxs)("p",{className:`${i}-hint`,children:["Present items: ",K.state.items.join(", ")]}):null,K.state.publicFacts.length?(0,r.jsxs)("p",{className:`${i}-hint`,children:["Established facts: ",K.state.publicFacts.join(" \xB7 ")]}):null]},T)}),ro.map(T=>(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsxs)("h2",{className:`${i}-panel-title`,children:[Et(T.ownerId),"'s private space"]}),T.image?(0,r.jsx)("img",{className:`${i}-venue-space-picture`,src:T.image.url,alt:`${Et(T.ownerId)}'s private space`}):(0,r.jsx)("div",{className:`${i}-venue-image-empty`,children:"Image not drawn yet"}),T.description?(0,r.jsx)("p",{className:`${i}-venue-beat`,children:T.description}):null,T.adaptationPending?(0,r.jsx)("p",{className:`${i}-hint`,children:"This room is still being adapted after a move."}):null]},T.ownerId))]}),(s.editProposals??[]).map(T=>(0,r.jsxs)("p",{className:`${i}-hint`,children:["Proposed ",T.target," room edit:"," ",T.declined?"declined or stale":`approved by ${T.approvedIds.length} of ${T.requiredIds.length} residents`]},T.id)),p.includes("residence")&&!s.occupancy.playerHome?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{U(`/locations/venue/${encodeURIComponent(s.id)}/player-move`,{method:"POST"}).then(o).catch(T=>Ae(I(T,"The move could not be requested.")))},children:"Request to live here"}):null,$a?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:$a}):null]}):ce==="edit"?(0,r.jsxs)("main",{className:`${i}-venue-editor-page`,children:[(0,r.jsxs)("div",{className:`${i}-venue-space-grid`,children:[Lc("Exterior image",s.presentation.image),p.filter(T=>T!=="residence"||kt).map(T=>Lc(T==="residence"?"Shared Residence image":`${T} space image`,He(s,T).image,T)),ro.map(T=>Lc(`${Et(T.ownerId)}'s private image`,T.image,"residence",T.ownerId))]}),Da===s.id?(0,r.jsx)("p",{className:`${i}-hint`,children:"Drawing or saving the image\u2026"}):null,Dp?.id===s.id?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Dp.text}):null,q?(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Venue details"}),(0,r.jsx)(d0,{draft:q,existing:!0,villagers:n.villagers,editableClasses:p.filter(T=>T!=="residence"||!O||oe),onChange:Ce}),O?(0,r.jsx)("p",{className:`${i}-hint`,children:"Save Venue details updates the public fields. Changes to the shared Residence room require a separate proposal during an invited visit."}):null,(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:wa||!q.name.trim(),onClick:()=>{F1()},children:"Save Venue details"}),O&&oe?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:wa||!He(q,"residence").description.trim(),onClick:()=>{mg("shared")},children:"Propose shared room edit"}):null]}),O&&!oe?(0,r.jsx)("p",{className:`${i}-hint`,children:"Enter with a resident's invitation to propose changes to the shared room's contents."}):null]}):null,ne&&q?.privateSpaces?.filter(T=>T.ownerId===ne).map(T=>(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsxs)("h2",{className:`${i}-panel-title`,children:["Propose changes to ",Et(T.ownerId),"'s private space"]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Scene description",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:T.description,onChange:K=>Ce(X=>X&&{...X,privateSpaces:X.privateSpaces?.map(te=>te.ownerId===T.ownerId?{...te,description:K.target.value}:te)})})]}),(0,r.jsxs)("details",{className:`${i}-venue-scene-details`,children:[(0,r.jsx)("summary",{children:"Scene details"}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Physical state used during visits and for this room's image. These facts stay private until the player enters this room."}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Condition now"," ",(0,r.jsx)("span",{className:`${i}-hint`,children:"For example, a broken shutter or a repaired floor."}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:T.state.condition,onChange:K=>Ce(X=>X&&{...X,privateSpaces:X.privateSpaces?.map(te=>te.ownerId===T.ownerId?{...te,state:{...te.state,condition:K.target.value}}:te)})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Present items \xB7 one per line"," ",(0,r.jsx)("span",{className:`${i}-hint`,children:"Objects physically in this room."}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:T.state.items.join(`
`),onChange:K=>Ce(X=>X&&{...X,privateSpaces:X.privateSpaces?.map(te=>te.ownerId===T.ownerId?{...te,state:{...te.state,items:K.target.value.split(`
`)}}:te)})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Established facts \xB7 one per line"," ",(0,r.jsx)("span",{className:`${i}-hint`,children:"Durable truths about this room."}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:T.state.publicFacts.join(`
`),onChange:K=>Ce(X=>X&&{...X,privateSpaces:X.privateSpaces?.map(te=>te.ownerId===T.ownerId?{...te,state:{...te.state,publicFacts:K.target.value.split(`
`)}}:te)})})]})]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:wa||!T.description.trim(),onClick:()=>{mg("private",T.ownerId)},children:"Propose private room edit"})]},T.ownerId)),O&&(s.residentIds?.length??0)>0?(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Resident moves"}),(0,r.jsxs)("select",{value:Sn,onChange:T=>ji(T.target.value),"aria-label":"Destination for resident move",children:[(0,r.jsx)("option",{value:"",children:"Choose a Residence with an available bed"}),n.settings.venues.filter(T=>T.id!==s.id&&xn(T).includes("residence")&&oc(T)<c0(T)).map(T=>(0,r.jsx)("option",{value:T.id,children:T.name},T.id))]}),(s.residentIds??[]).map(T=>{let K=n.residences.find(X=>X.characterId===T&&X.status!=="current");return(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("strong",{children:Et(T)}),K?(0,r.jsx)("span",{className:`${i}-hint`,children:K.status==="moving"?"Moving":"Awaiting consent"}):(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:!Sn||wa,onClick:()=>{Nt(!0),U("/residences/proposals",{method:"POST",body:JSON.stringify({characterId:T,venueId:Sn})}).then(o).catch(X=>Ae(I(X,"The move could not be requested."))).finally(()=>Nt(!1))},children:"Ask to move"})]},T)})]}):null,xa?(0,r.jsx)("p",{className:`${i}-hint`,role:"status",children:xa}):null,$a?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:$a}):null]}):(0,r.jsx)("main",{className:`${i}-venue-proposal-page`,children:(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Propose a Venue change"}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Residents and workers affected by a structural change will reply in your Mailbox. A vacant Venue changes after you submit the reviewed terms."}),Y?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Classes \xB7 choose up to two"}),(0,r.jsx)("div",{className:`${i}-row`,children:k0.map(T=>(0,r.jsxs)("label",{className:`${i}-label`,children:[(0,r.jsx)("input",{type:"checkbox",checked:Y.classes.includes(T),disabled:!Y.classes.includes(T)&&Y.classes.length>=2,onChange:K=>et(X=>X&&{...X,classes:K.target.checked?[...X.classes,T]:X.classes.filter(te=>te!==T)})})," ",T]},T))})]}),Y.classes.includes("residence")?(0,r.jsxs)("label",{className:`${i}-label`,children:["Base capacity \xB7 includes you",(0,r.jsx)("input",{className:`${i}-notice-input`,type:"number",min:1,max:4,value:Y.capacity,onChange:T=>et({...Y,capacity:Number(T.target.value)})})]}):null,(0,r.jsxs)("label",{className:`${i}-label`,children:["Improvement slot",(0,r.jsxs)("select",{value:Y.slot,onChange:T=>et({...Y,slot:Number(T.target.value)}),children:[(0,r.jsxs)("option",{value:0,children:["Slot 1 \xB7 ",s.improvements?.[0]?.title??"empty"]}),(0,r.jsxs)("option",{value:1,children:["Slot 2 \xB7 ",s.improvements?.[1]?.title??"empty"]})]})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Improvement title \xB7 leave empty for a Class or capacity proposal",(0,r.jsx)("input",{className:`${i}-notice-input`,value:Y.title,onChange:T=>et({...Y,title:T.target.value}),placeholder:"A second sleeping alcove"})]}),Y.title?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("label",{className:`${i}-label`,children:["What changes in the story?",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:Y.description,onChange:T=>et({...Y,description:T.target.value})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Extra beds \xB7 optional mechanical effect",(0,r.jsx)("input",{className:`${i}-notice-input`,type:"number",min:0,max:3,value:Y.extraBeds,onChange:T=>et({...Y,extraBeds:Number(T.target.value)})})]})]}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:wa||Y.classes.length<1||Y.title.trim().length>0&&!Y.description.trim(),onClick:()=>{Nt(!0),Ae(""),U(`/locations/venue/${encodeURIComponent(s.id)}/proposals`,{method:"POST",body:JSON.stringify({classes:Y.classes,capacity:Y.capacity,...Y.title.trim()?{slot:Y.slot,improvement:{title:Y.title,description:Y.description,extraBeds:Y.extraBeds}}:{},title:Y.title||`Change ${s.name}`,detail:Y.description||`Change Venue Classes or capacity at ${s.name}.`})}).then(T=>{o(T),et(null),bt("Proposal submitted.")}).catch(T=>Ae(I(T,"The proposal could not be saved."))).finally(()=>Nt(!1))},children:"Submit proposal"})]}):(0,r.jsx)("p",{className:`${i}-hint`,role:"status",children:xa||"Proposal submitted."}),$a?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:$a}):null]})})]})}if(Ze==="menu")return(0,r.jsxs)("div",{className:`${i}-root ${i}-sectioned-menu`,"data-section":ge,"data-mobile":t,children:[(0,r.jsxs)("header",{className:`${i}-header`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("h1",{className:`${i}-title`,children:{index:"Menu",general:"General Settings",village:"Village Settings",debug:"DEBUG Settings",noticeboard:"Noticeboard"}[ge]}),t?null:(0,r.jsx)("p",{className:`${i}-subtitle`,children:"Everything you can change about the village lives here, away from the village itself."})]}),(0,r.jsx)("div",{className:`${i}-actions`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:ge!=="index"?()=>vt("index"):Hc,children:ge!=="index"?"Back to menu":"Back to the village"})})]}),bl?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:bl}):null,(0,r.jsx)("nav",{className:`${i}-mobile-menu-nav`,"aria-label":"Village menu",children:ge==="index"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Ke("general"),children:"General Settings"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Ke("village"),children:"Village Settings"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Ke("story"),children:"DEBUG Settings"})]}):ge==="village"?(0,r.jsx)(r.Fragment,{children:[["villagers","Villagers"],["venueRequests","Venue Requests"],["homes","Homes"],["map","Town map"],["village","Village Settings"]].map(([s,d])=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,"data-active":V===s,onClick:()=>s==="homes"?eg():Ke(s),children:d},s))}):ge==="debug"?(0,r.jsxs)(r.Fragment,{children:[[["story","Village Story"],["replyGuidance","Villager reply guidance"],["chatlogs","Venue Visits"],["agendas","Villager Wishes"],["schedules","Villager Agendas"]].map(([s,d])=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,"data-active":V===s,onClick:()=>Ke(s),children:d},s)),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:!n||H||os,onClick:()=>{Gp()},children:"Force Village Update"}),(0,r.jsx)("p",{className:`${i}-status`,children:$0}),ns?(0,r.jsx)("p",{className:`${i}-status`,role:"status",children:ns}):null]}):null}),(0,r.jsxs)("nav",{className:`${i}-menu-nav`,"aria-label":"Everything you can change",children:[(0,r.jsxs)("div",{className:`${i}-menu-group`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Village Management"}),(0,r.jsxs)("div",{className:`${i}-menu-group-buttons`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":V==="villagers","data-active":V==="villagers"?"true":"false",disabled:!n||H,onClick:()=>Ke("villagers"),children:`Villagers (${n?.villagers.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":V==="noticeboard","data-active":V==="noticeboard"?"true":"false",disabled:!n||H,onClick:()=>Ke("noticeboard"),children:`Noticeboard (${n?.noticeboard.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":V==="venueRequests","data-active":V==="venueRequests"?"true":"false",disabled:!n||H,onClick:()=>Ke("venueRequests"),children:`Venue Requests (${(n?.venueRequests?.length??0)+(n?.upgradeRequests?.length??0)+(n?.residences?.filter(s=>s.status==="pending"&&s.requestedBy==="villager").length??0)})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":V==="homes","data-active":V==="homes"?"true":"false",disabled:!n||H,onClick:eg,children:`Homes (${rp(n?.settings.venues??[]).length})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":V==="map","data-active":V==="map"?"true":"false",disabled:!n||H,onClick:()=>Ke("map"),children:"Town map"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":V==="village","data-active":V==="village"?"true":"false",onClick:()=>Ke("village"),children:"Village Settings"})]})]}),(0,r.jsxs)("div",{className:`${i}-menu-group`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"General Settings"}),(0,r.jsx)("div",{className:`${i}-menu-group-buttons`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":V==="general","data-active":V==="general"?"true":"false",onClick:()=>Ke("general"),children:"General settings"})})]}),(0,r.jsxs)("div",{className:`${i}-menu-group`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Debug"}),(0,r.jsxs)("div",{className:`${i}-menu-group-buttons`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":V==="replyGuidance","data-active":V==="replyGuidance"?"true":"false",disabled:!n||H,onClick:()=>Ke("replyGuidance"),children:"DEBUG: Villager reply guidance"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":V==="story","data-active":V==="story"?"true":"false",disabled:!n||H,onClick:()=>Ke("story"),children:`DEBUG: Village Story (${c?.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":V==="chatlogs","data-active":V==="chatlogs"?"true":"false",disabled:!n||H,onClick:()=>Ke("chatlogs"),children:`DEBUG: Venue Visits (${x?.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":V==="agendas","data-active":V==="agendas"?"true":"false",disabled:!n||H,onClick:()=>Ke("agendas"),children:`DEBUG: Villager Wishes (${Rt?.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":V==="schedules","data-active":V==="schedules"?"true":"false",disabled:!n||H,onClick:()=>Ke("schedules"),children:`Villager Agendas (${Rt?.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:!n||H||os,onClick:()=>{Gp()},children:"Force Village Update"})]}),(0,r.jsx)("p",{className:`${i}-status`,children:$0}),ns?(0,r.jsx)("p",{className:`${i}-status`,role:"status",children:ns}):null]})]}),V==="general"?(0,r.jsxs)("section",{className:`${i}-panel`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"General settings"}),(0,r.jsx)(np,{}),n?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-story-pace`,children:"Story pace"}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Village time follows your device clock. When Marinara reopens, the village reconstructs elapsed life from its last saved instant. Story pace controls the visual Events feed only; its prose does not affect narration or village state. Schedules and other rule-driven state always advance."}),(0,r.jsx)("select",{id:`${i}-story-pace`,value:n.settings.storyPace,disabled:H,onChange:s=>{b1(s.target.value)},children:n.settings.storyPaces.map(s=>(0,r.jsx)("option",{value:s,children:s.charAt(0).toUpperCase()+s.slice(1)},s))}),(0,r.jsx)("span",{className:`${i}-hint`,children:e5(n.settings.storyPace)})]}):null,n?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-visit-retention`,children:"Visit transcripts"}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Exact visit logs are kept forever by default. Automatic cleanup skips visits with memory pending and keeps filed memories and world changes."}),(0,r.jsxs)("select",{id:`${i}-visit-retention`,value:n.settings.visitRetention.mode,disabled:H,onChange:s=>{let d=s.target.value;Kp({mode:d,value:d==="count"?100:d==="days"?365:0})},children:[(0,r.jsx)("option",{value:"forever",children:"Keep forever"}),(0,r.jsx)("option",{value:"count",children:"Keep latest visits"}),(0,r.jsx)("option",{value:"days",children:"Retire after days"})]}),n.settings.visitRetention.mode!=="forever"?(0,r.jsx)("input",{type:"number","aria-label":n.settings.visitRetention.mode==="count"?"Number of visits to keep":"Days to keep visits",min:n.settings.visitRetention.mode==="count"?1:30,max:n.settings.visitRetention.mode==="count"?1e3:3650,defaultValue:n.settings.visitRetention.value,onBlur:s=>{let d=Number(s.target.value);d!==n.settings.visitRetention.value&&Kp({mode:n.settings.visitRetention.mode,value:d})}},`${n.settings.visitRetention.mode}:${n.settings.visitRetention.value}`):null]}):null,(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("p",{className:`${i}-empty`,children:"Setting the village up again is the same three questions you answered when you arrived, over the village as it stands now."}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:H||!n,onClick:()=>El(!1,n),children:"Run setup again"}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Keeps your villagers, their conversations and anything you have written."})]})]}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Starting over"}),(0,r.jsx)("p",{className:`${i}-empty`,children:"This is not the same thing. It takes the village apart completely \u2014 the villagers, their conversations, the places, the noticeboard, your own details and the map \u2014 and hands you an empty one. There is no way back."}),(0,r.jsx)("div",{className:`${i}-row`,children:G0?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-danger`,disabled:H,onClick:()=>{B1()},children:"Yes, empty the village"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:H,onClick:()=>Kr(!1),children:"Keep it"})]}):(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:H||!n,onClick:()=>Kr(!0),children:"Reset the village and start over"})})]}),Tt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Tt}):null]}):V==="village"?(0,r.jsxs)("div",{className:`${i}-menu-body`,children:[n?(0,r.jsxs)("section",{className:`${i}-panel`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Village settings"}),(0,r.jsx)("p",{className:`${i}-empty`,children:"These choices belong to this village. Narration style shapes scene prose; resident cards shape their dialogue. Village knowledge is refreshed for every reply."}),(0,r.jsx)(v5,{}),t?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Map background image"}),Fr?(0,r.jsx)("img",{className:`${i}-mobile-map-preview`,src:Fr,alt:"Current village map background"}):(0,r.jsx)("p",{className:`${i}-empty`,children:"The map has no background image."}),(0,r.jsx)("input",{className:`${i}-file`,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",disabled:H,"aria-label":"Choose a town map picture",onChange:s=>{let d=s.target.files?.[0];s.target.value="",Jp(d)}}),Ta?(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:H,onClick:()=>{Pp()},children:"Use this map"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:H,onClick:us,children:"Cancel"})]}):n.settings.townMapImageSetAt?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:H,onClick:()=>{Fp()},children:"Remove background image"}):null]}):null,(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setting`,children:"Setting and Theme"}),(0,r.jsx)("textarea",{id:`${i}-setting`,className:`${i}-textarea ${i}-off`,value:qr,maxLength:n.settings.settingMaxLength,placeholder:"A cliffside fishing town where the boats go out before dawn\u2026",disabled:!0,onChange:s=>gp(s.target.value)}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"Read-only here. What this place is like is the wizard's first question, asked beside where the houses stand so the village is described once rather than twice; run it again to change this. What is written still reaches every villager in the meantime."})]}),(0,r.jsx)(v0,{books:cc,error:wp,selected:Br,onChange:fp,disabled:H}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-lore-budget`,children:"Lorebook token budget"}),(0,r.jsx)("input",{id:`${i}-lore-budget`,className:`${i}-notice-input`,type:"number",min:n.settings.loreTokenBudgetMin,max:n.settings.loreTokenBudgetMax,step:100,value:uc,disabled:H,onChange:s=>bp(Number(s.target.value))}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Maximum approximate lore tokens in future text generation. Image prompts keep a separate short excerpt."})]}),(0,r.jsxs)("section",{className:`${i}-field`,children:[(0,r.jsxs)("div",{className:`${i}-row`,style:{justifyContent:"space-between"},children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Venues"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:L1,disabled:H||k1>=n.settings.maxPlaces,children:"Create Venue"})]}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Each Venue is one unique place. Its Form describes what it is; one or two Classes describe what people do there."}),(0,r.jsx)("input",{className:`${i}-notice-input`,type:"search",value:xp,onChange:s=>_0(s.target.value),placeholder:"Find a Venue by name, Form, or Class","aria-label":"Search Venues"}),(0,r.jsx)("div",{className:`${i}-notice-add`,children:n.settings.venues.filter(s=>`${s.name} ${s.form??""} ${xn(s).join(" ")}`.toLowerCase().includes(xp.toLowerCase())).map(s=>(0,r.jsxs)("div",{className:`${i}-notice-row`,children:[(0,r.jsx)("strong",{children:s.name||"Unnamed Residence"}),(0,r.jsx)("span",{className:`${i}-hint`,children:[s.form,xn(s).join(" + ")].filter(Boolean).join(" \xB7 ")}),xn(s).includes("residence")?(0,r.jsxs)("span",{className:`${i}-hint`,children:[(s.residentIds?.length??+!!s.occupancy.residentCharacterId)+Number(s.occupancy.playerHome)," ","/ ",s.residenceCapacity??1," residents"]}):null,(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>ss(s),children:"View Venue"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Ce(structuredClone(s)),children:"Edit"}),(0,r.jsx)("button",{type:"button",className:`${i}-remove`,onClick:()=>{Y1(s.id)},"aria-label":`Delete ${s.name}`,disabled:H,children:"\xD7"})]})]},s.id))}),q?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("h3",{className:`${i}-panel-title`,children:n.settings.venues.some(s=>s.id===q.id)?"Edit Venue":"Create Venue"}),(0,r.jsx)(d0,{draft:q,existing:n.settings.venues.some(s=>s.id===q.id),villagers:n.villagers,onChange:Ce}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:H||!q.name.trim()||!xn(q).every(s=>He(q,s).description.trim()),onClick:()=>{G1(q)},children:"Save Venue"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Ce(null),children:"Cancel"})]})]}):null,(0,r.jsx)("div",{className:`${i}-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{v1()},disabled:H,children:"Suggest Venues"})}),Ir.filter(s=>!n.settings.venues.some(d=>d.id===s.id)).map(s=>(0,r.jsxs)("div",{className:`${i}-notice-row`,children:[(0,r.jsx)("strong",{children:s.name}),(0,r.jsx)("span",{className:`${i}-hint`,children:s.purpose}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Ce(s),children:"Review suggestion"})]},s.id))]}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-knowledge`,children:"The information villagers know"}),(0,r.jsx)("textarea",{id:`${i}-knowledge`,ref:Vc,className:`${i}-preset`,value:an,maxLength:n.settings.promptBoxMaxLength,spellCheck:!1,onChange:s=>Hr(s.target.value)}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"What a villager here knows, written as tokens the village fills in for itself: the time, the weather, who else lives here, what is on the noticeboard. Because it is written out fresh on every reply, a villager here is always current \u2014 and because it is only these tokens, adding a place or pinning a note reaches every villager without anything being edited here. A resident's card and the DEBUG Villager reply guidance govern how they respond."}),(0,r.jsx)("div",{className:`${i}-macros`,children:n.settings.macros.map(s=>(0,r.jsx)("button",{type:"button",className:`${i}-macro`,title:`${s.label} \u2014 ${s.help}`,onClick:()=>j1(s.token),children:s.token},s.token))}),(0,r.jsxs)("p",{className:`${i}-macro-help`,children:["Click a token to drop it in at the cursor of the box. A token with nothing behind it turns into nothing at all, so ",(0,r.jsx)("code",{children:"{{lore}}"})," can sit in the prompt until there is lore to put there."]})]}),(0,r.jsx)(b0,{idPrefix:"settings",personas:sc,draft:oa,onDraft:Ur,storedId:n.settings.playerPersonaId,storedName:n.settings.playerPersonaName,storedMissing:n.settings.playerPersonaMissing,disabled:H}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{f1()},disabled:H,children:"Save settings"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Hr(n.settings.defaultPromptKnowledge)},disabled:H,children:"Restore the default box"}),(0,r.jsx)("span",{className:`${i}-hint`,children:an===n.settings.promptKnowledge&&oa===n.settings.playerPersonaId&&qr===n.settings.setting&&JSON.stringify(Br)===JSON.stringify(n.settings.selectedLorebookIds)?"No unsaved settings changes. Save places individually.":"Unsaved settings changes. Save places individually."})]})]}):null,Tt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Tt}):null]}):(0,r.jsxs)("div",{className:`${i}-menu-body`,children:[V==="villagers"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Villagers"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Characters from your library live here. Moving someone out forgets nothing about the character card itself."}),(0,r.jsx)("div",{className:`${i}-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>ya(s=>!s),disabled:H,children:tn?"Close the list":"Add a villager"})}),tn?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("input",{className:`${i}-search`,type:"search",value:hp,onChange:s=>mp(s.target.value),placeholder:"Search by name, note or tag\u2026","aria-label":"Search your character library"}),l===null?(0,r.jsx)("p",{className:`${i}-empty`,style:{marginTop:".625rem"},children:"Reading your library\u2026"}):Bc.length===0?(0,r.jsx)("p",{className:`${i}-empty`,style:{marginTop:".625rem"},children:"No characters match that search."}):(0,r.jsx)("div",{className:`${i}-picker-list`,children:Bc.map(s=>(0,r.jsxs)("div",{className:`${i}-picker-item`,"data-resident":s.inVillage?"true":"false",children:[(0,r.jsx)(sl,{portrait:lc[s.id],name:s.name,className:`${i}-avatar`}),(0,r.jsxs)("div",{className:`${i}-picker-text`,children:[(0,r.jsx)("div",{className:`${i}-villager-name`,children:s.name}),(0,r.jsx)("div",{className:`${i}-villager-role`,children:s.comment||s.tags.slice(0,3).join(" \xB7 ")}),s.summary?(0,r.jsx)("p",{className:`${i}-tile-summary`,children:s.summary}):null]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{o1(s.id)},disabled:H||s.inVillage,children:s.inVillage?"Lives here":"Move in"})]},s.id))})]}):null,n&&n.villagers.length>0?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("div",{className:`${i}-villagers`,children:n.villagers.map(s=>(0,r.jsx)(w5,{villager:s,portrait:lc[s.characterId],selected:!1,onSelect:!s.place||L!==null?void 0:()=>{let d=n.settings.venues.find(p=>p.id===s.place?.id);d&&Qp(d)}},s.characterId))}),(0,r.jsx)("div",{className:`${i}-roster`,children:n.villagers.map(s=>(0,r.jsxs)("div",{className:`${i}-roster-row`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("span",{className:`${i}-villager-name`,children:s.name}),s.missing?(0,r.jsx)("span",{className:`${i}-badge`,children:"card missing"}):null,ri[s.characterId]?(0,r.jsx)("div",{className:`${i}-tile-summary`,children:ri[s.characterId].changed?`New card: ${ri[s.characterId].proposed?.name??"unavailable"}`:ri[s.characterId].sourceAvailable?`Snapshot revision ${ri[s.characterId].current.revision} is current.`:"The saved snapshot remains playable; the source card is unavailable."}):null]}),(0,r.jsxs)("span",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Dr(En===s.characterId?null:s.characterId),children:En===s.characterId?"Close sprites":"Sprites"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{r1(s.characterId)},disabled:H||rc.length>0,children:"Compare card"}),ri[s.characterId]?.changed&&ri[s.characterId]?.sourceAvailable?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{s1(s.characterId)},disabled:H||rc.length>0,children:"Apply refresh"}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{l1(s.characterId)},disabled:H||rc.length>0,children:"Move out"})]})]},s.characterId))}),n.villagers.find(s=>s.characterId===En)?(0,r.jsx)(x5,{villager:n.villagers.find(s=>s.characterId===En),onSaved:o}):null]}):(0,r.jsx)("p",{className:`${i}-empty`,children:"Nobody lives here yet. If you have just founded the village, the people you named are on their way."})]}):null,V==="noticeboard"&&n?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Noticeboard"})}),n.noticeboard.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Nothing is pinned up. Anything you add here is something the villagers can bring up in conversation \u2014 and they will pin notes of their own up as time goes on."}):(0,r.jsx)("ul",{className:`${i}-notices`,children:n.noticeboard.map((s,d)=>(0,r.jsxs)("li",{className:`${i}-notice-row`,children:[(0,r.jsxs)("span",{children:[s.author.length>0?(0,r.jsx)("span",{className:`${i}-notice-author`,children:`${s.author}: `}):null,s.text]}),(0,r.jsx)("button",{type:"button",className:`${i}-remove`,onClick:()=>{X1(d)},disabled:H,"aria-label":`Take down: ${s.text}`,children:"\xD7"})]},`${d}:${s.text}`))}),(0,r.jsxs)("div",{className:`${i}-notice-add`,children:[(0,r.jsx)("input",{className:`${i}-notice-input`,type:"text",value:jr,maxLength:n.settings.maxNoticeLength,placeholder:"Pin up a rumour, an event, a rule\u2026","aria-label":"New noticeboard note",onChange:s=>Np(s.target.value),onKeyDown:s=>{s.key==="Enter"&&(s.preventDefault(),ug())}}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{ug()},disabled:H||jr.trim().length===0||n.noticeboard.length>=n.settings.maxNoticeboardNotes,children:`Pin it up (${n.noticeboard.length}/${n.settings.maxNoticeboardNotes})`})]})]}):null,V==="venueRequests"&&n?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Venue Requests"})}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"Villagers can ask for places in conversation or during village life. A place joins the village only when you approve it here. Taking down a notice does not change a request."}),n.venueRequests.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Nobody has requested a new place."}):(0,r.jsx)("ul",{className:`${i}-notices`,children:n.venueRequests.map(s=>{let d=tt[s.id]??s.venueDraft,p=y=>st(M=>({...M,[s.id]:{...d,...y}}));return(0,r.jsx)("li",{className:`${i}-notice-row`,children:(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("strong",{children:s.requesterName||"A villager"}),(0,r.jsx)("span",{className:`${i}-hint`,children:` \xB7 ${s.source==="chat"?"Conversation":"Village life"}`}),(0,r.jsx)("input",{className:`${i}-notice-input`,value:d.name,maxLength:n.settings.maxVenueNameLength,"aria-label":`Requested place name from ${s.requesterName||"villager"}`,onChange:y=>p({name:y.target.value})}),(0,r.jsx)("input",{className:`${i}-notice-input`,value:d.purpose,maxLength:n.settings.maxVenueNoteLength,"aria-label":`Requested place purpose from ${s.requesterName||"villager"}`,onChange:y=>p({purpose:y.target.value})}),(0,r.jsx)("input",{className:`${i}-notice-input`,value:d.category,maxLength:n.settings.maxVenueNoteLength,placeholder:"Category (optional)","aria-label":`Requested place category from ${s.requesterName||"villager"}`,onChange:y=>p({category:y.target.value})}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:d.description??"",maxLength:1e3,"aria-label":`Requested place description from ${s.requesterName||"villager"}`,onChange:y=>p({description:y.target.value})}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:H||!d.name.trim(),onClick:()=>{j(!0),Z(""),U("/locations/venue/descriptions/draft",{method:"POST",body:JSON.stringify({venues:[{id:s.id,name:d.name,purpose:d.purpose}]})}).then(y=>p({description:y.descriptions[s.id]??""})).catch(y=>Z(I(y,"The description draft could not be generated."))).finally(()=>j(!1))},children:"Generate description draft"}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:H||!d.name.trim()||!d.purpose.trim()||!d.description?.trim(),onClick:()=>{sg(s,!0)},children:d.name!==s.venueDraft.name||d.purpose!==s.venueDraft.purpose||d.category!==s.venueDraft.category?"Send counteroffer":"Approve exact request"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:H,onClick:()=>{sg(s,!1)},children:"Deny"})]})]})},s.id)})}),(0,r.jsx)("h3",{className:`${i}-panel-title`,children:"Home upgrade requests"}),n.upgradeRequests.length===0?(0,r.jsx)("p",{className:`${i}-hint`,children:"No home upgrades requested."}):n.upgradeRequests.map(s=>(0,r.jsxs)("div",{className:`${i}-notice-row`,children:[(0,r.jsx)("span",{children:s.detail}),[!0,!1].map(d=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:H,onClick:()=>{j(!0),Z(""),U(`/venue-upgrades/${encodeURIComponent(s.id)}/${d?"approve":"deny"}`,{method:"POST"}).then(o).catch(p=>Z(I(p,"The upgrade request could not be decided."))).finally(()=>j(!1))},children:d?"Approve upgrade":"Deny"},String(d)))]},s.id)),(0,r.jsx)("h3",{className:`${i}-panel-title`,children:"Resident move requests"}),n.residences.filter(s=>s.status!=="current").length===0?(0,r.jsx)("p",{className:`${i}-hint`,children:"No moves pending."}):n.residences.filter(s=>s.status!=="current").map(s=>{let d=Et(s.characterId),p=n.settings.venues.find(y=>y.id===s.proposedVenueId)?.name||"another venue";return(0,r.jsxs)("div",{className:`${i}-notice-row`,children:[(0,r.jsx)("span",{children:`${d} \u2192 ${p}`}),s.status==="moving"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("span",{className:`${i}-hint`,children:["Move due ",new Date(s.completesAt??"").toLocaleString()]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:H,onClick:()=>{j(!0),Z(""),U("/residences/debug/complete-now",{method:"POST",body:JSON.stringify({characterId:s.characterId})}).then(o).catch(y=>Z(I(y,"The move could not be completed."))).finally(()=>j(!1))},children:"DEBUG: Complete move now"})]}):s.requestedBy==="player"?(0,r.jsxs)("span",{className:`${i}-hint`,children:["Awaiting ",d,"'s answer in conversation."]}):[!0,!1].map(y=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:H,onClick:()=>{j(!0),Z(""),U(`/residences/${y?"approvals":"denials"}`,{method:"POST",body:JSON.stringify({characterId:s.characterId})}).then(o).catch(M=>Z(I(M,"The move request could not be decided."))).finally(()=>j(!1))},children:y?"Approve move":"Deny"},String(y)))]},s.characterId)}),Tt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Tt}):null]}):null,V==="homes"&&n?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Homes on the map"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Where everyone lives. Each Residence has its own name and Form. A Residence nobody has moved into is a normal thing for a village to have, and the villagers are told about the occupied ones and nothing else."}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:H||la.length>=cs,onClick:()=>{Dt(!0),Hc()},children:"Put a home on the map"}),(0,r.jsx)("span",{className:`${i}-hint`,children:`${la.length} of at most ${cs}`})]}),la.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"No homes on the map yet."}):(0,r.jsx)(b5,{homes:la,villagers:(n?.villagers??[]).map(s=>({id:s.characterId,name:s.name})),disabled:H,selectedId:H0,onPatch:ag,onRemove:M1,onSelect:dc,showDescriptions:!0,onGenerateDescription:s=>{R1(s)},lockedIds:new Set(n.settings.venues.filter(s=>s.occupancy.residentCharacterId).map(s=>s.id))}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:H,onClick:()=>{O1()},children:"Save the homes"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:H,onClick:()=>Tl(n.settings.venues),children:"Put them back"}),(0,r.jsx)("span",{className:`${i}-hint`,children:t5(n.settings.venues,la)?"No unsaved changes.":"Unsaved changes."})]})]}):null,V==="map"&&n?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Town map"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"The optional picture beneath the village's logical map. Upload one here, or leave the navigation surface clean; venue pins work in either case."}),(0,r.jsx)(ap,{src:Fr,alt:"A preview of the town map, framed the way it will be drawn in the village.",pins:n.settings.venues.flatMap(s=>{let d=Or(s);if(!d)return[];let p=s.occupancy.residentCharacterId?Et(s.occupancy.residentCharacterId):s.occupancy.playerHome?Yi(n):"";return[{id:s.id,x:d.x,y:d.y,text:p?`${s.name||"Home"} \xB7 ${p}`:s.name,tone:ul(s)?g0({isPlayerHome:s.occupancy.playerHome,occupant:s.occupancy.residentCharacterId}):"venue",onSelect:()=>hc(s.id)}]}),placing:Yr!==null,view:fl,shape:_p,zoom:j0,onView:Wr?gl:void 0,onPlace:Yr?(s,d)=>{let p=Yr;j(!0),Z(""),U(`/locations/venue/${encodeURIComponent(p)}`,{method:"PUT",body:JSON.stringify({presentation:{x:s,y:d}})}).then(o).catch(y=>Z(I(y,"The venue could not be placed."))).finally(()=>{j(!1),mc(null)})}:void 0}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Venue positions and residents"}),n.settings.venues.map(s=>{let d=s.occupancy.residentCharacterId?Et(s.occupancy.residentCharacterId):s.occupancy.playerHome?Yi(n):"",p=!!s.occupancy.residentCharacterId;return(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":U0===s.id,onClick:()=>hc(s.id),children:s.name||"Home"}),(0,r.jsx)("span",{className:`${i}-hint`,children:d?`Lives here: ${d}`:"No villager lives here"}),(0,r.jsx)("span",{className:`${i}-hint`,children:Or(s)?"On map":"Not placed"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:H||p,onClick:()=>{hc(s.id),mc(s.id)},children:Or(s)?"Move pin":"Place pin"})]},s.id)}),Yr?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>mc(null),children:"Cancel pin placement"}):null,Tt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Tt}):null]}),Wr?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("div",{className:`${i}-steps`,role:"group","aria-label":"How the picture sits in the frame",children:f0.map(s=>(0,r.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":fl.fit===s.fit?"true":"false","aria-pressed":fl.fit===s.fit,onClick:()=>gl({...fl,fit:s.fit}),children:s.label},s.fit))}),(0,r.jsx)("p",{className:`${i}-hint`,children:f0.find(s=>s.fit===fl.fit)?.help})]}):null,kc?(0,r.jsx)("p",{className:`${i}-hint`,"data-tone":kc.tone,children:kc.text}):null,(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("input",{className:`${i}-file`,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",disabled:H,"aria-label":"Choose a town map picture",onChange:s=>{let d=s.target.files?.[0];s.target.value="",Jp(d)}}),n.settings.townMapImageSetAt?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:H,onClick:()=>{Fp()},children:"Remove background image"}):null]}),Wr?(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:H,onClick:()=>{Pp()},children:Ta?"Use this map":"Keep this framing"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:H,onClick:us,children:"Leave it as it was"})]}):(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("p",{className:`${i}-hint`,children:n.settings.townMapImageSetAt?"Your own map is drawn at the moment.":"The logical map is drawn without a background image."}),n.settings.townMapImageSetAt?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:H,onClick:()=>Ec(!0),children:"Crop or fit it again"}):null]}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"Landscape images work best. Each map keeps its actual size and shape, with the whole image visible on desktop. It is stored with the village so it travels with a backup. A picture that is too large is refused before upload rather than silently shrunk."}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Pictures of the places"}),(0,r.jsxs)("p",{className:`${i}-macro-help`,children:["What a conversation stands in when somebody is there. Open a Venue to generate, upload, or remove its picture. Nothing is drawn automatically. These are kept in the"," ",(0,r.jsx)("strong",{children:n.settings.villageGalleryFolderName})," folder of the Engine's own gallery rather than with the village, so they are yours to reuse or throw away from there, and a village with twenty pictured places stays as small as one with none."]}),$n(n.settings.venues).length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"No places yet, so there is nothing to draw."}):(0,r.jsx)("ul",{className:`${i}-places`,children:$n(n.settings.venues).map(s=>(0,r.jsxs)("li",{className:`${i}-place`,children:[s.presentation.image?(0,r.jsx)("img",{className:`${i}-place-thumb`,src:s.presentation.image.url,alt:"",loading:"lazy"}):(0,r.jsx)("span",{className:`${i}-place-thumb`,"data-empty":"true","aria-hidden":"true"}),(0,r.jsxs)("div",{className:`${i}-place-body`,children:[(0,r.jsx)("span",{className:`${i}-place-name`,children:s.name}),(0,r.jsx)("div",{className:`${i}-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:H,onClick:()=>{ss(s)},children:"View Venue"})})]})]},s.id))})]})]}):null,V==="replyGuidance"?(0,r.jsx)(y5,{}):null,V==="story"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Village story"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Memories from conversations and favors can guide residents. Older model-written tick entries are kept here for review but no longer affect the village while Events is being rebuilt. A private memory is known only to the people named on it and to you. Deleting one here is permanent."}),c===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Reading what the village remembers\u2026"}):c.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Nothing written down yet. Meaningful visits and fulfilled wishes can leave memories."}):BS(c).map(s=>(0,r.jsxs)("section",{children:[(0,r.jsx)("h3",{className:`${i}-story-day`,children:s.label}),(0,r.jsx)("ul",{className:`${i}-story`,children:s.entries.map(d=>{let p=IS(d),y=d.actors.map(M=>M.name).join(", ");return(0,r.jsxs)("li",{className:`${i}-story-row`,children:[(0,r.jsxs)("span",{children:[p.length>0||d.scope==="private"||d.kind==="favour"?(0,r.jsxs)("span",{className:`${i}-story-meta`,children:[p,d.scope==="private"?(0,r.jsx)("span",{className:`${i}-story-scope`,children:` \xB7 private to ${y}`}):null,d.kind==="favour"?(0,r.jsx)("span",{className:`${i}-story-scope`,children:" \xB7 a favour"}):null,d.kind==="tick"?(0,r.jsx)("span",{className:`${i}-story-scope`,children:" \xB7 legacy Events prose"}):null]}):null,d.text]}),(0,r.jsx)("button",{type:"button",className:`${i}-remove`,disabled:H,onClick:()=>{W0(d.id)},"aria-label":`Forget: ${d.text}`,children:"\xD7"})]},d.id)})})]},`${s.label}:${s.entries[0]?.id??""}`)),c&&c.length<g?(0,r.jsxs)("button",{type:"button",className:`${i}-button`,onClick:()=>{e1()},children:["Load more memories (",c.length," of ",g,")"]}):null]}):null,V==="chatlogs"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Venue visits"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Completed venue visits are kept here word for word. Filter by place or resident; each visit has one shared record, including who heard each line. The village uses only the separately distilled memories."}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsxs)("select",{"aria-label":"Filter visits by venue",value:B,onChange:s=>{G(s.target.value),_(0),k(null)},children:[(0,r.jsx)("option",{value:"",children:"All venues"}),(n?.settings.venues??[]).map(s=>(0,r.jsx)("option",{value:s.id,children:s.name},s.id))]}),(0,r.jsxs)("select",{"aria-label":"Filter visits by resident",value:ue,onChange:s=>{D(s.target.value),_(0),k(null)},children:[(0,r.jsx)("option",{value:"",children:"All residents"}),(n?.villagers??[]).map(s=>(0,r.jsx)("option",{value:s.characterId,children:s.name},s.characterId))]})]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:H||w===0,onClick:()=>{jp()},children:"Delete all completed logs"}),be?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:be}):null,x===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Reading venue visits\u2026"}):x.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"No completed visits match these filters."}):x.map(s=>(0,r.jsxs)("section",{children:[(0,r.jsxs)("h3",{className:`${i}-story-day`,children:[s.placeName," \xB7 ",op(s.startedAt)]}),(0,r.jsxs)("p",{className:`${i}-story-meta`,children:[s.participants.map(d=>d.name).join(", ")," \xB7 ",s.lineCount," lines",s.endReason==="inactivity"?" \xB7 Interrupted: Inactivity":"",s.memoryPending?` \xB7 memory pending (${s.memoryProgress?.nextUnit??0}/${s.memoryUnits} pieces processed)`:""]}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{_c(s.id)},children:N?.id===s.id?"Refresh transcript":"Open transcript"}),s.memoryPending?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:H,onClick:()=>{i1(s.id)},children:"Retry memory"}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:H,onClick:()=>{jp(s.id)},children:"Delete log"})]}),N?.id===s.id?(0,r.jsx)("ul",{className:`${i}-story`,children:N.lines.map((d,p)=>(0,r.jsx)("li",{className:`${i}-story-row`,children:(0,r.jsxs)("span",{children:[(0,r.jsxs)("span",{className:`${i}-story-meta`,children:[d.name||Yi(n)," \xB7 ",op(d.at)]}),Rr(d.content,`venue-${s.id}-${p}-`),(0,r.jsxs)("span",{className:`${i}-story-meta`,children:["Heard by:"," ",d.heardBy?.map(y=>N.participants.find(M=>M.characterId===y)?.name??y).join(", ")||"no one"]})]})},`${s.id}:${p}`))}):null]},s.id)),w>20?(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:E===0,onClick:()=>{_(Math.max(0,E-20)),k(null)},children:"Previous"}),(0,r.jsxs)("span",{children:[E+1,"\u2013",Math.min(w,E+20)," of ",w]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:E+20>=w,onClick:()=>{_(E+20),k(null)},children:"Next"})]}):null]}):null,V==="agendas"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"What the villagers wish"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Private wishes can shape what a villager notices, says, and does. Their agenda is in Villager Agendas."}),Rt===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Reading what the villagers wish\u2026"}):Rt.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Nobody lives here yet."}):(0,r.jsx)("section",{children:Rt.map(s=>(0,r.jsxs)("div",{children:[(0,r.jsxs)("h3",{className:`${i}-story-day`,children:[s.name,s.missing?(0,r.jsx)("span",{className:`${i}-badge`,children:"card missing"}):null]}),s.agenda===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Not written for yet. The village works this out on the next part of the day it already runs on, so there is nothing to press."}):s.agenda.wishes.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:s.agenda.personalizationFailure?`Wish generation failed: ${s.agenda.personalizationFailure}`:s.agenda.generatedAt?"No current wishes.":"Wishes are still being worked out. Their provisional agenda is already available."}):(0,r.jsx)("ul",{className:`${i}-story`,children:s.agenda.wishes.map(d=>(0,r.jsxs)("li",{className:`${i}-wish-card`,children:[(0,r.jsx)("p",{className:`${i}-wish-text`,children:d.wish}),d.tell.length>0?(0,r.jsx)("p",{className:`${i}-wish-tell`,children:`Shows as: ${d.tell}`}):null,(0,r.jsx)("p",{className:`${i}-wish-meta`,children:`${d.intensity===1?"Faint":d.intensity===3?"Strong":"Present"} \xB7 ${YS(d.addedAt??"",d.expiresAt??"")}`})]},d.id))}),s.completedWishes.length>0?(0,r.jsxs)("details",{className:`${i}-agenda-notes`,children:[(0,r.jsx)("summary",{children:`Completed wishes (${s.completedWishes.length})`}),(0,r.jsx)("ul",{className:`${i}-story`,children:s.completedWishes.map(d=>(0,r.jsxs)("li",{className:`${i}-wish-card`,children:[(0,r.jsx)("p",{className:`${i}-wish-text`,children:d.wish.wish}),(0,r.jsx)("p",{className:`${i}-wish-meta`,children:`Fulfilled ${new Date(d.fulfilledAt).toLocaleDateString()}`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:H,onClick:()=>{a1(s.characterId,d.wish.id)},children:"Mark as not fulfilled"})]},d.wish.id))})]}):null]},s.characterId))})]}):null,V==="schedules"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Villager agendas"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Each villager follows a Villages agenda. A Marinara schedule can guide future days when enabled."}),Rt===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Loading agendas\u2026"}):Rt.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Nobody lives here yet."}):(0,r.jsx)("div",{className:`${i}-agenda-list`,children:Rt.map(s=>(0,r.jsxs)("details",{className:`${i}-week`,children:[(0,r.jsx)("summary",{className:`${i}-week-toggle`,children:(0,r.jsxs)("h3",{className:`${i}-week-head`,children:[s.name,s.agenda?.personalizationPending?(0,r.jsx)("span",{className:`${i}-badge`,children:s.agenda.personalizationFailure?"Personalization needs retry":"Personalizing"}):null,s.agenda?.personalizationFailure?(0,r.jsx)("span",{className:`${i}-badge`,children:"Personalization failed"}):null,s.missing?(0,r.jsx)("span",{className:`${i}-badge`,children:"Card missing"}):null,s.nativeSchedule?(0,r.jsx)("span",{className:`${i}-badge`,children:s.agenda?.activeDay?.scheduleInformed?"Schedule used today":"Schedule available"}):null,Fm(s)?(0,r.jsx)("span",{className:`${i}-badge`,children:"Earlier hours kept"}):null]})}),(0,r.jsxs)("div",{className:`${i}-week-body`,children:[s.agenda?.routineSummary?(0,r.jsx)("p",{className:`${i}-story-meta`,children:s.agenda.routineSummary}):null,s.agenda?.personalizationFailure?(0,r.jsx)("p",{className:`${i}-empty`,children:s.agenda.personalizationFailure}):s.agenda?.personalizationPending?(0,r.jsx)("p",{className:`${i}-story-scope`,children:"Personalizing this agenda in the background."}):null,(0,r.jsxs)("div",{className:`${i}-agenda-actions`,children:[(0,r.jsxs)("label",{className:`${i}-agenda-switch`,children:[(0,r.jsx)("input",{type:"checkbox",checked:s.ingestSchedule,disabled:H,onChange:d=>{n1(s.characterId,d.target.checked)}}),"Use Marinara schedule when available"]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:H,onClick:()=>{t1(s.characterId)},children:"Regenerate agenda"})]}),s.nativeSchedule?(0,r.jsxs)("p",{className:`${i}-story-scope`,children:[s.ingestSchedule&&s.remapFailure?`Schedule translation failed: ${s.remapFailure.message}`:s.ingestSchedule&&s.agenda?.scheduleWeek?"Schedule guides today and future days.":s.ingestSchedule?"Schedule translation is pending.":"Schedule ingestion is off.",Fm(s)?" Earlier hours retain the previous plan.":""]}):Fm(s)?(0,r.jsx)("p",{className:`${i}-story-scope`,children:"Earlier hours retain the previous plan."}):null,s.weekUnreadable?(0,r.jsx)("p",{className:`${i}-empty`,children:"Marinara schedules could not be read right now. The Villages agenda remains active."}):s.nativeSchedule?null:(0,r.jsx)("p",{className:`${i}-empty`,children:"No Marinara schedule. Villages uses its own agenda."}),(0,r.jsx)("div",{className:`${i}-agenda-days`,children:s.days.map(d=>{let p=d.isToday?s.agenda?.activeDay?.blocks??s.agenda?.week?.[d.weekday]??[]:(s.ingestSchedule?s.agenda?.scheduleWeek?.[d.weekday]:void 0)??s.agenda?.week?.[d.weekday]??[],y=s.nativeSchedule?.days[d.weekday]??[];return(0,r.jsxs)("details",{className:`${i}-agenda-day`,open:d.isToday||void 0,children:[(0,r.jsxs)("summary",{children:[d.weekday," \xB7 ",d.dateLabel,d.isToday?" \xB7 Today":""]}),(0,r.jsxs)("div",{className:`${i}-agenda-compare`,"data-comparison":s.nativeSchedule?"true":void 0,children:[(0,r.jsxs)("section",{"aria-label":`${d.weekday} Villages agenda`,children:[(0,r.jsx)("h4",{children:"Villages agenda"}),(0,r.jsx)("ol",{className:`${i}-agenda-blocks`,children:p.map((M,O)=>(0,r.jsxs)("li",{children:[(0,r.jsxs)("time",{children:[l0(M.startMinute),"\u2013",l0(M.endMinute)]}),(0,r.jsx)("strong",{children:M.activity}),(0,r.jsx)("span",{children:M.venueId?LS(n?.settings.venues??[],M.venueId):"Home"}),(0,r.jsx)("span",{children:M.reason}),(0,r.jsx)("span",{className:`${i}-story-scope`,children:M.status==="idle"?"Available":M.status==="dnd"?"Busy":M.status==="offline"?"Offline":"Online"})]},`${M.startMinute}-${M.endMinute}-${O}`))})]}),s.nativeSchedule?(0,r.jsxs)("section",{"aria-label":`${d.weekday} Marinara schedule`,children:[(0,r.jsx)("h4",{children:"Marinara schedule"}),y.length?(0,r.jsx)("ol",{className:`${i}-agenda-blocks`,children:y.map((M,O)=>(0,r.jsxs)("li",{children:[(0,r.jsx)("time",{children:M.time}),(0,r.jsx)("strong",{children:M.activity}),(0,r.jsx)("span",{className:`${i}-story-scope`,children:M.status||"No availability set"})]},`${M.time}-${O}`))}):(0,r.jsx)("p",{className:`${i}-empty`,children:"No schedule blocks for this day."})]}):null]})]},`${d.weekday}-${d.dateLabel}`)})})]})]},s.characterId))})]}):null,Tt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Tt}):null]})]});if(Ze==="preparing"){let s=n?.foundingPreparation,d=n?.villagers.length??0,p=s?.completedIds.length??0,y=n?.villagers.find(M=>M.characterId===s?.currentId)?.name;return(0,r.jsx)("div",{className:`${i}-root ${i}-preparing`,role:"status","aria-live":"polite",children:(0,r.jsxs)("div",{children:[(0,r.jsx)("div",{className:`${i}-preparing-house`,"aria-hidden":"true",children:"\u{1F3E1}"}),(0,r.jsxs)("h1",{children:[n?.village.name??"Your village"," is settling in"]}),(0,r.jsx)("p",{children:s?.status==="failed"?"The villagers need a hand before the gates open.":y?`Making room for ${y}\u2026`:"Lighting windows and making plans\u2026"}),(0,r.jsx)("p",{children:`${p} of ${d} villagers ready`}),s?.status==="failed"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:s.error}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{I1()},children:"Retry"}),(0,r.jsxs)("details",{children:[(0,r.jsx)("summary",{children:"Change connections"}),(0,r.jsx)(np,{})]})]}):null,Mp?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Mp}):null]})})}if(Ze==="setup"){let s=(l??[]).map(d=>({id:d.id,name:d.name}));return(0,r.jsxs)("div",{className:`${i}-root ${i}-home`,children:[(0,r.jsx)("div",{className:`${i}-mapbar`,children:(0,r.jsx)("span",{className:`${i}-mapbar-title`,children:Na.trim()||"A new village"})}),(0,r.jsxs)("div",{className:`${i}-home-body`,children:[(0,r.jsx)("div",{className:`${i}-side`,children:(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:n?.isFounded?"Setting the village up again":"Founding your village"})}),(0,r.jsx)("div",{className:`${i}-steps`,children:n0.map((d,p)=>(0,r.jsx)("span",{className:`${i}-step`,"data-active":p===Ue?"true":"false","data-done":p<Ue?"true":"false",children:`${p+1}. ${d}`},d))}),Ue===0?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setup-name`,children:"What is this village called?"}),(0,r.jsx)("input",{id:`${i}-setup-name`,className:`${i}-search`,type:"text",value:Na,maxLength:n?.settings.villageNameMaxLength,placeholder:"Ashwater",disabled:H,onChange:d=>Sp(d.target.value)})]}),(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Why is this village being founded?"}),(0,r.jsx)("div",{className:`${i}-reason-options`,children:t0.map(d=>(0,r.jsxs)("label",{className:`${i}-reason-option`,children:[(0,r.jsx)("input",{type:"radio",name:`${i}-founding-reason`,checked:Yt===d.value,disabled:H,onChange:()=>Ep(d.value)}),d.label]},d.value))})]}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsxs)("label",{className:`${i}-label`,htmlFor:`${i}-founding-details`,children:["Founding details ",Yt==="something-else"?"(required)":"(optional)"]}),(0,r.jsx)("textarea",{id:`${i}-founding-details`,className:`${i}-textarea`,value:Va,maxLength:n?.settings.foundingDetailsMaxLength??500,placeholder:"Who brought everyone together, and what are they hoping to build?",disabled:H,onChange:d=>kp(d.target.value)}),(0,r.jsx)("span",{className:`${i}-hint`,children:"This premise informs village stories without forcing repeated events."})]}),(0,r.jsx)(b0,{idPrefix:"setup",personas:sc,draft:oa,onDraft:Ur,storedId:n?.settings.playerPersonaId??"",storedName:n?.settings.playerPersonaName??"",storedMissing:n?.settings.playerPersonaMissing??!1,disabled:H}),(0,r.jsx)(v0,{books:cc,error:wp,selected:Ra,onChange:d=>{vp(d),Xr([])},disabled:H}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setup-lore-budget`,children:"Lorebook token budget"}),(0,r.jsx)("input",{id:`${i}-setup-lore-budget`,className:`${i}-notice-input`,type:"number",min:n?.settings.loreTokenBudgetMin??200,max:n?.settings.loreTokenBudgetMax??3200,step:100,value:Xi,disabled:H,onChange:d=>yp(Number(d.target.value))}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Maximum approximate lore tokens for village text, wishes, and agendas."})]})]}):null,Ue===1?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(np,{onSetupProblem:I0,onImageWarningChange:Rp}),L0?(0,r.jsxs)("div",{className:`${i}-chat-confirm`,role:"alertdialog","aria-label":"Image connection recommendation",children:[(0,r.jsx)("p",{className:`${i}-chat-confirm-note`,children:"Villages is meant to be an immersive experience with dynamic locations and expressive characters. An image connection is highly recommended for the complete Villages experience."}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"Villages is still playable without an image connection. You can always manually add images to locations, characters, and more."}),(0,r.jsxs)("span",{className:`${i}-chat-confirm-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:H,onClick:D1,children:"Set up an image connection"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:H,onClick:V1,children:"I understand, continue"})]})]}):null]}):null,Ue===2?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setup-setting`,children:"Setting and Theme"}),(0,r.jsx)("textarea",{id:`${i}-setup-setting`,className:`${i}-textarea`,value:yt,maxLength:n?.settings.settingMaxLength,placeholder:"A cliffside fishing town where the boats go out before dawn\u2026",disabled:H||St,onChange:d=>{Tp(d.target.value),Xr([])}}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Required. Describe the village's setting, visual style, and narrative vibe."})]}),(0,r.jsxs)("div",{className:`${i}-steps`,role:"group","aria-label":"Village map image source",children:[(0,r.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":Se==="generate"?"true":"false","aria-pressed":Se==="generate",disabled:St,onClick:()=>hi("generate"),children:"Generate with AI"}),(0,r.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":Se==="upload"?"true":"false","aria-pressed":Se==="upload",disabled:St,onClick:()=>hi("upload"),children:"Upload an image"}),(0,r.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":Se==="none"?"true":"false","aria-pressed":Se==="none",disabled:St,onClick:()=>hi("none"),children:"No background image"}),n?.settings.townMapImageSetAt?(0,r.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":Se==="existing"?"true":"false","aria-pressed":Se==="existing",disabled:St,onClick:()=>hi("existing"),children:"Keep current map"}):null]}),Se==="generate"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Map elements"}),(0,r.jsx)("div",{className:`${i}-reason-options`,children:[["roads","Roads and paths"],["structures","Structures"],["water","Water"]].map(([d,p])=>(0,r.jsxs)("label",{className:`${i}-reason-option`,children:[(0,r.jsx)("input",{type:"checkbox",checked:bc[d],disabled:St,onChange:y=>zp(M=>({...M,[d]:y.target.checked}))}),p]},d))}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Unchecked elements are excluded, even if Setting and Theme mentions them. Structures may appear anywhere but must leave room for future locations."})]}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsxs)("label",{className:`${i}-label`,htmlFor:`${i}-setup-map-prompt`,children:[(0,r.jsx)("span",{className:`${i}-debug-label`,children:"DEBUG"})," Map layout prompt"]}),(0,r.jsx)("textarea",{id:`${i}-setup-map-prompt`,className:`${i}-textarea`,value:mi,maxLength:1500,disabled:St,onChange:d=>$c(d.target.value)}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Temporary testing override. The default comes from the server; edits apply only to this setup session."})]}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsxs)("label",{className:`${i}-label`,htmlFor:`${i}-setup-map-negative`,children:[(0,r.jsx)("span",{className:`${i}-debug-label`,children:"DEBUG"})," Negative map tags"]}),(0,r.jsx)("textarea",{id:`${i}-setup-map-negative`,className:`${i}-textarea`,value:hl,maxLength:1500,disabled:St,onChange:d=>xc(d.target.value)}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Image providers handle negative tags differently. Review the resulting map before continuing."})]}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:St||yt.trim().length===0||mi.trim().length===0,onClick:()=>{y1()},children:St?"Generating map\u2026":Qr==="generate"?"Generate again":"Generate map"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:St||mi===n?.settings.townMapLayoutPrompt&&hl===n?.settings.townMapNegativePrompt,onClick:()=>{$c(n?.settings.townMapLayoutPrompt??""),xc(n?.settings.townMapNegativePrompt??"")},children:"Restore default prompt"})]})]}):null,Se==="upload"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("input",{className:`${i}-file`,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",disabled:St,"aria-label":"Choose a village map image",onChange:d=>{let p=d.target.files?.[0];d.target.value="",$1(p)}}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Landscape images work best. PNG, JPEG, WebP, and AVIF are accepted at their native size; the file must fit the size limit shown if it is refused."})]}):null,Se==="none"?(0,r.jsx)("p",{className:`${i}-empty`,children:"Venues will remain clickable on a clean logical map surface. You can add an image from the Town map panel later."}):null,dl&&Se!=="none"&&Qr===Se&&Hp?(0,r.jsx)("p",{className:`${i}-hint`,"data-tone":ep(dl).tone,children:ep(dl).text}):null]}):null,Ue===3?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("p",{className:`${i}-empty`,children:"Place your Residence, one to three villager Residences, and one Gathering Place. Select a photograph to finish it."}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:H||Sa||$e.filter(d=>d.classes?.includes("residence")).length>=1+oo,onClick:()=>{Dt(!0),ui(!1),di(null)},children:"Place a Residence"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:H||Sa||$e.some(d=>d.category==="public-center"),onClick:()=>{Dt(!1),ui(!0),di(null)},children:"Place a Gathering Place"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:H||Sa||$e.length===0,onClick:()=>{ci([]),kn(null),Zi({}),Ki(null),di(null),Dt(!1),ui(!1)},children:"Reset all venues"})]}),Ap?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Ap}):null,(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:H||Sa||!$e.length,onClick:()=>{og($e)},children:"Draft all venue text"}),Object.keys(jt).length>1?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Object.keys(jt).forEach(d=>qc(d,!1)),children:"Use all drafts in empty fields"}):null]}),(0,r.jsx)("div",{className:`${i}-setup-venue-list`,children:$e.map(d=>(0,r.jsxs)("button",{type:"button",className:`${i}-setup-venue-card`,"data-selected":d.id===Cp?"true":"false",onClick:()=>kn(d.id),children:[d.presentation.image?(0,r.jsx)("img",{src:d.presentation.image.url,alt:""}):(0,r.jsx)("span",{className:`${i}-setup-venue-placeholder`,"aria-hidden":"true",children:"\u2302"}),(0,r.jsxs)("span",{children:[(0,r.jsx)("strong",{children:d.name||"Unnamed venue"}),(0,r.jsxs)("small",{children:[d.category==="public-center"?"Gathering Place":"Residence"," \xB7"," ",d.occupancy.playerHome?"You":Et(d.occupancy.residentCharacterId)||"Choose a villager"]})]})]},d.id))}),J&&lo?(0,r.jsxs)("div",{className:`${i}-setup-venue-editor`,children:[(0,r.jsxs)("h3",{className:`${i}-panel-title`,children:[J.category==="public-center"?"Gathering Place":"Residence"," \xB7"," ",J.name]}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{di(J.id),Dt(!1),ui(!1)},children:"Move on map"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>A1(J.id),children:"Remove venue"})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Name",(0,r.jsx)("input",{className:`${i}-notice-input`,value:J.name,maxLength:100,onChange:d=>_t(J.id,p=>({...p,name:d.target.value}))})]}),J.category==="public-center"?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:H||Sa,onClick:()=>{w1()},children:"Suggest three names"}),q0.map(d=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>_t(J.id,p=>({...p,name:d})),children:d},d))]}):null,(0,r.jsxs)("label",{className:`${i}-label`,children:["Form \xB7 what is it?",(0,r.jsx)("input",{className:`${i}-notice-input`,value:J.form??"",maxLength:240,onChange:d=>_t(J.id,p=>({...p,form:d.target.value}))})]}),J.category!=="public-center"?(0,r.jsxs)("label",{className:`${i}-label`,children:["Resident",(0,r.jsxs)("select",{className:`${i}-select`,value:J.occupancy.residentCharacterId??"",disabled:J.occupancy.playerHome,onChange:d=>_t(J.id,p=>({...p,residentIds:d.target.value?[d.target.value]:[],occupancy:{...p.occupancy,residentCharacterId:d.target.value||null}})),children:[(0,r.jsx)("option",{value:"",children:J.occupancy.playerHome?"You":"Choose a villager"}),s.map(d=>(0,r.jsx)("option",{value:d.id,disabled:$e.some(p=>p.id!==J.id&&p.occupancy.residentCharacterId===d.id),children:d.name},d.id))]})]}):null,(0,r.jsxs)("label",{className:`${i}-label`,children:["Purpose",(0,r.jsx)("input",{className:`${i}-notice-input`,value:J.purpose,maxLength:240,onChange:d=>_t(J.id,p=>({...p,purpose:d.target.value}))})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Guidance for AI text and art",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:J.guidance,maxLength:1e3,placeholder:"Mood, materials, details to include or avoid\u2026",onChange:d=>_t(J.id,p=>({...p,guidance:d.target.value}))})]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:Sa,onClick:()=>{og([J])},children:"Generate text draft"}),jt[J.id]?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("strong",{children:"Suggested venue text"}),(0,r.jsxs)("p",{children:[jt[J.id]?.name," \xB7"," ",jt[J.id]?.form]}),(0,r.jsxs)("p",{children:[(0,r.jsx)("strong",{children:"Purpose:"})," ",jt[J.id]?.purpose]}),(0,r.jsxs)("p",{children:[(0,r.jsx)("strong",{children:"Exterior:"})," ",jt[J.id]?.description]}),(0,r.jsxs)("p",{children:[(0,r.jsx)("strong",{children:"Scene:"})," ",jt[J.id]?.spaceDescription]}),(0,r.jsxs)("p",{children:[(0,r.jsx)("strong",{children:"Initial condition:"})," ",jt[J.id]?.condition]}),(0,r.jsxs)("p",{children:[(0,r.jsx)("strong",{children:"Items:"})," ",jt[J.id]?.items.join(", ")||"None"]}),(0,r.jsxs)("p",{children:[(0,r.jsx)("strong",{children:"Public facts:"})," ",jt[J.id]?.publicFacts.join(", ")||"None"]}),(0,r.jsxs)("p",{children:[(0,r.jsx)("strong",{children:"Features:"})," ",jt[J.id]?.features.join(", ")||"None"]}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>qc(J.id,!1),children:"Use in empty fields"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>qc(J.id,!0),children:"Replace text with this draft"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Zi(d=>{let p={...d};return delete p[J.id],p}),children:"Discard draft"})]})]}):null,(0,r.jsxs)("label",{className:`${i}-label`,children:["Exterior description",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:J.description,maxLength:1e3,onChange:d=>_t(J.id,p=>({...p,description:d.target.value}))})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Scene description",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:lo.description,maxLength:1e3,onChange:d=>_t(J.id,p=>({...p,spaces:[{...He(p,p.category==="public-center"?"gathering":"residence"),description:d.target.value}]}))})]}),["exterior","interior"].map(d=>{let p=d==="exterior"?J.presentation.image:lo.image;return(0,r.jsxs)("section",{className:`${i}-field`,children:[(0,r.jsxs)("span",{className:`${i}-label`,children:[d==="exterior"?"Exterior photograph":"Interior photograph"," \xB7 optional"]}),p?(0,r.jsx)("img",{className:`${i}-setup-image-preview`,src:p.url,alt:`${d} of ${J.name}`}):(0,r.jsx)("p",{className:`${i}-hint`,children:"No image yet. A placeholder will be used."}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:Sa,onClick:()=>{_1(J,d)},children:p?"Regenerate image":"Generate image"}),(0,r.jsx)("input",{className:`${i}-file`,type:"file",accept:"image/*",disabled:Sa,"aria-label":`Upload ${d} image for ${J.name}`,onChange:y=>{let M=y.target.files?.[0];y.target.value="",H1(J,d,M)}}),p?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>_t(J.id,y=>d==="exterior"?{...y,presentation:{...y.presentation,image:null}}:{...y,spaces:[{...He(y,y.category==="public-center"?"gathering":"residence"),image:null}]}),children:"Remove image"}):null]}),cl?.venueId===J.id&&cl.area===d?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("img",{className:`${i}-setup-image-preview`,src:cl.image.url,alt:"New image preview"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:U1,children:"Use this photograph"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Ki(null),children:"Discard"})]}):null]},d)}),(0,r.jsxs)("details",{children:[(0,r.jsx)("summary",{children:"Advanced venue details"}),(0,r.jsxs)("div",{className:`${i}-setup-venue-editor`,children:[(0,r.jsxs)("label",{className:`${i}-label`,children:["Initial condition",(0,r.jsx)("input",{className:`${i}-notice-input`,value:lo.state.condition,onChange:d=>_t(J.id,p=>{let y=He(p,p.category==="public-center"?"gathering":"residence");return{...p,spaces:[{...y,state:{...y.state,condition:d.target.value}}]}})})]}),["items","publicFacts"].map(d=>(0,r.jsxs)("label",{className:`${i}-label`,children:[d==="items"?"Notable items \xB7 one per line":"Public facts \xB7 one per line",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:lo.state[d].join(`
`),onChange:p=>_t(J.id,y=>{let M=He(y,y.category==="public-center"?"gathering":"residence");return{...y,spaces:[{...M,state:{...M.state,[d]:p.target.value.split(`
`).map(O=>O.trim()).filter(Boolean)}}]}})})]},d)),(0,r.jsxs)("label",{className:`${i}-label`,children:["Features \xB7 one per line",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:lo.state.features.map(d=>d.text).join(`
`),onChange:d=>_t(J.id,p=>{let y=He(p,p.category==="public-center"?"gathering":"residence");return{...p,spaces:[{...y,state:{...y.state,features:d.target.value.split(`
`).map(M=>M.trim()).filter(Boolean).slice(0,5).map((M,O)=>({id:y.state.features[O]?.id??Li(),text:M,sourceCharacterId:"",locked:!1,updatedAt:""}))}}]}})})]})]})]})]}):(0,r.jsx)("p",{className:`${i}-hint`,children:"Place or select a venue to edit it."}),l===null?(0,r.jsx)("p",{className:`${i}-hint`,children:"Reading your villager library\u2026"}):null]}):null,Ue===4?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("p",{className:`${i}-empty`,children:"Review your village before opening its gates. Return to Step 4 to change a venue."}),(0,r.jsxs)("p",{className:`${i}-hint`,children:[Na.trim()," \xB7 ",yt.trim()," \xB7"," ",$e.filter(d=>d.classes?.includes("residence")).length," Residences \xB7"," ",$e.filter(d=>d.category==="public-center").length," Gathering Place"]}),(0,r.jsxs)("p",{className:`${i}-hint`,children:[(0,r.jsx)("strong",{children:"Persona:"})," ",sc?.find(d=>d.id===oa)?.name??"Selected Persona"," \xB7 ",(0,r.jsx)("strong",{children:"Founded for:"})," ",t0.find(d=>d.value===Yt)?.label??Yt,Va?` \xB7 ${Va}`:""]}),(0,r.jsxs)("p",{className:`${i}-hint`,children:[(0,r.jsx)("strong",{children:"Map:"})," ",Se==="none"?"Logical map":"Chosen picture"," \xB7 ",(0,r.jsx)("strong",{children:"Lorebooks:"})," ",Ra.map(d=>cc?.find(p=>p.id===d)?.name??d).join(", ")||"None"]}),(0,r.jsx)("div",{className:`${i}-setup-venue-list`,children:$e.map(d=>(0,r.jsxs)("div",{className:`${i}-setup-venue-card`,children:[d.presentation.image?(0,r.jsx)("img",{src:d.presentation.image.url,alt:""}):(0,r.jsx)("span",{className:`${i}-setup-venue-placeholder`,"aria-hidden":"true",children:"\u2302"}),(0,r.jsxs)("span",{children:[(0,r.jsxs)("strong",{children:[d.name," \xB7 ",d.category==="public-center"?"Gathering Place":"Residence"]}),(0,r.jsxs)("small",{children:[d.form," \xB7"," ",d.occupancy.playerHome?"You":Et(d.occupancy.residentCharacterId)||"Community"]})]})]},d.id))}),$e.map(d=>(0,r.jsxs)("p",{className:`${i}-hint`,children:[(0,r.jsxs)("strong",{children:[d.name,":"]})," ",d.description," ",d.spaces?.[0]?.description]},`${d.id}-summary`))]}):null,(0,r.jsxs)("div",{className:`${i}-row`,children:[Ue>0?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:H||St,onClick:()=>ng(Ue-1),children:"Back"}):null,Ue<n0.length-1?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:H||St,onClick:()=>ng(Ue+1),children:"Next"}):(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:H||St||!n,onClick:()=>{q1()},children:n?.isFounded?"Save this village":"Found the village"}),n?.isFounded?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("span",{className:`${i}-spacer`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:H,onClick:()=>{Dt(!1),ee("home")},children:"Show me the village"})]}):null]}),Vp?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Vp}):null,Tt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Tt}):null]})}),(0,r.jsx)("div",{className:`${i}-setup-map-shell`,children:(0,r.jsx)("div",{className:`${i}-setup-map-viewport`,children:(0,r.jsx)(ap,{src:pi,alt:`A map of ${Na.trim()||"your new village"}.`,pins:Ue<3?[]:Z1,placing:Ue===3&&(si||Gr||gc!==null),view:Se==="existing"?Fi:ic("cover"),shape:Hp,onPlace:Ue===3?C1:void 0,compact:Ue<2,mobile:t&&Ue>=2,photoPins:Ue>=3})})})]})]})}return(0,r.jsxs)("div",{className:`${i}-root ${i}-home ${i}-home-full`,"data-mobile":t?"true":"false",children:[(0,r.jsxs)("div",{className:`${i}-home-bar`,children:[(0,r.jsx)(s5,{weather:n?.village.weather??""}),!t&&n?.isFounded&&$n(n.settings.venues).length>0?(0,r.jsxs)("div",{className:`${i}-places-picker`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-expanded":S,"aria-controls":`${i}-places-list`,disabled:H,onClick:()=>{C(null),Q(s=>!s)},children:"Places"}),S?(0,r.jsx)("div",{id:`${i}-places-list`,className:`${i}-places-list`,children:n.settings.venues.map(s=>(0,r.jsxs)("div",{className:`${i}-places-list-row`,children:[(0,r.jsx)("span",{className:`${i}-places-list-name`,children:s.name}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>ss(s),children:"View venue"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Sl(s)},children:"Visit"})]},s.id))}):null]}):null,(0,r.jsxs)("span",{className:`${i}-home-bar-actions`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-mobile-board-button`,"aria-label":`Noticeboard (${n?.noticeboard.length??0})`,disabled:!n||H,onClick:()=>Ke("noticeboard"),children:(0,r.jsx)("span",{"aria-hidden":"true",children:"\u25A4"})}),n?.isFounded?(0,r.jsx)(d5,{happenings:n.happenings,recap:n.recap,mobile:t}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-mobile-menu-button`,"aria-label":"Open settings menu",disabled:H||!n,onClick:()=>{vt("index"),ee("menu")},children:"\u2630"}),t?null:(0,r.jsx)(c5,{}),si?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Dt(!1),children:"Cancel"}):null]})]}),(0,r.jsx)("div",{className:`${i}-room`,children:(0,r.jsx)("div",{className:`${i}-home-map-viewport`,children:(0,r.jsx)(ap,{src:Fr,alt:`A map of ${n?.village.name??"the village"}.`,pins:Q1,placing:si,view:Fi,shape:_p,onPlace:z1,onDismiss:()=>{C(null),Q(!1)},fitToRoom:!t,mobile:t,photoPins:!0,children:bl||Tt||si||os||zc?(0,r.jsxs)("div",{className:`${i}-notice`,children:[bl?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:bl}):null,Tt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Tt}):null,si?(0,r.jsx)("span",{className:`${i}-status`,children:"Click the map where the house stands."}):null,os?(0,r.jsxs)("span",{className:`${i}-status`,children:["Catching up on what ",n?.village.name??"the village"," has been doing\u2026"]}):null,zc?(0,r.jsx)("p",{className:`${i}-status`,children:zc}):null]}):null})})})]})}var sp=class extends HTMLElement{connectedCallback(){r0(),this.__root??(this.__root=(0,x0.createRoot)(this)),this.__root.render((0,r.jsx)(lp,{element:this,children:(0,r.jsx)(E5,{element:this})}))}disconnectedCallback(){queueMicrotask(()=>{!this.isConnected&&this.__root&&(this.__root.unmount(),this.__root=null),r0()})}};function E5({element:e}){let[,t]=(0,m.useState)(0);(0,m.useEffect)(()=>{let n=()=>t(o=>o+1);return e.addEventListener("marinara-capability-props",n),()=>e.removeEventListener("marinara-capability-props",n)},[e]);let a=e.getAttribute("view");return a==="tracker"?(0,r.jsx)(z5,{props:e.capabilityProps??{}}):a==="toolbar"?(0,r.jsx)(A5,{props:e.capabilityProps??{}}):(0,r.jsx)(T5,{element:e})}function k5(){return(0,r.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round","aria-hidden":"true",children:[(0,r.jsx)("path",{d:"M3 10.5 12 3l9 7.5"}),(0,r.jsx)("path",{d:"M5.5 9.5V20h13V9.5"}),(0,r.jsx)("path",{d:"M9.5 16.5h5"})]})}var C5="marinara-active-chat-id";function M0(){try{window.localStorage.removeItem(C5)}catch{}window.location.reload()}function O0(e,t){let[a,n]=(0,m.useState)(null),[o,l]=(0,m.useState)(!1);return(0,m.useEffect)(()=>{if(l(!1),n(null),!t)return;let u=new AbortController;return(async()=>{try{let c=await U(`/spinoffs/${encodeURIComponent(e)}`,{signal:u.signal});if(u.signal.aborted)return;n(c??null),l(!0)}catch{}})(),()=>u.abort()},[e,t]),{origin:a,known:o}}function A5({props:e}){let t=typeof e.chatId=="string"?e.chatId:"",a=e.chatMode==="roleplay",n=e.mobileCompact===!0,o=typeof e.toolbarButtonClass=="string"?e.toolbarButtonClass:"",{origin:l,known:u}=O0(t,a&&t.length>0),[c,h]=(0,m.useState)(!1),g=(0,m.useRef)(null);if((0,m.useEffect)(()=>h(!1),[t,a]),(0,m.useEffect)(()=>{if(!c)return;let w=E=>{g.current?.contains(E.target)||h(!1)},z=E=>{E.key==="Escape"&&h(!1)};return document.addEventListener("pointerdown",w),document.addEventListener("keydown",z),()=>{document.removeEventListener("pointerdown",w),document.removeEventListener("keydown",z)}},[c]),!a||!u||l===null)return null;let v=l.name||"your villager",x=l.villageName||"your village",f=`Villages \u2014 this roleplay spun off from ${x}`;return(0,r.jsxs)("span",{className:`${i}-tracker`,"data-compact":n,"data-open":c,ref:g,children:[(0,r.jsxs)("button",{type:"button",className:o?`${o} ${i}-tracker-chip`:`${i}-button ${i}-tracker-chip`,onClick:()=>h(w=>!w),"aria-haspopup":"menu","aria-expanded":c,title:f,"aria-label":f,children:[(0,r.jsx)(k5,{}),(0,r.jsx)("span",{className:`${i}-tracker-label`,children:"Villages"})]}),c?(0,r.jsxs)("div",{className:`${i}-tracker-menu`,role:"menu","aria-label":`Villages \u2014 ${x}`,children:[(0,r.jsxs)("p",{className:`${i}-tracker-menu-title`,children:["This roleplay spun off from ",x]}),l.resident?(0,r.jsxs)("p",{className:`${i}-tracker-menu-note`,children:[v," still lives there. ",x," was photographed into this chat the moment it was made, and has not looked at it since: nothing said here is read, counted or kept by the village."]}):(0,r.jsxs)("p",{className:`${i}-tracker-menu-note`,children:[v," does not live in ",x," any more. This chat is yours either way \u2014 it was let go of the moment it was made, and nothing in the village is waiting on it."]}),(0,r.jsx)("p",{className:`${i}-tracker-menu-note`,children:"It is an ordinary chat in your own list. Renaming it, keeping it or deleting it changes nothing about the village."}),(0,r.jsx)("div",{className:`${i}-tracker-menu-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:M0,title:`Leaves this chat and opens Marinara's home screen, where the ${x} tab is waiting.`,children:"Open the village"})})]}):null]})}function z5({props:e}){let t=typeof e.chatId=="string"?e.chatId:"",a=e.chatMode==="roleplay",{origin:n,known:o}=O0(t,a&&t.length>0);if(!a||!o)return null;if(n===null)return(0,r.jsx)("div",{className:`${i}-panel-view`,children:(0,r.jsx)("p",{className:`${i}-tracker-menu-note`,children:"This chat did not come out of a village. A roleplay started from Villages says so here."})});let l=n.name||"this villager",u=n.villageName||"your village";return(0,r.jsxs)("div",{className:`${i}-panel-view`,children:[(0,r.jsx)("p",{className:`${i}-tracker-menu-note`,children:n.resident?`This roleplay spun off from ${u}, and ${u} has not looked at it since. Nothing said here is read, counted or kept by the village.`:`This roleplay spun off from ${u}, and ${l} does not live there any more. Nothing said here is read by the village either way.`}),(0,r.jsxs)("div",{className:`${i}-panel-view-row`,children:[(0,r.jsx)("span",{className:`${i}-panel-view-key`,children:"Villager"}),(0,r.jsx)("span",{children:l})]}),(0,r.jsxs)("div",{className:`${i}-panel-view-row`,children:[(0,r.jsx)("span",{className:`${i}-panel-view-key`,children:"Chat"}),(0,r.jsx)("span",{children:n.room})]}),(0,r.jsxs)("div",{className:`${i}-panel-view-row`,children:[(0,r.jsx)("span",{className:`${i}-panel-view-key`,children:"Came from"}),(0,r.jsx)("span",{children:u})]}),(0,r.jsx)("div",{className:`${i}-panel-view-actions`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:M0,title:`Leaves this chat and opens Marinara's home screen, where the ${u} tab is waiting.`,children:"Open the village"})})]})}customElements.get(i)||customElements.define(i,sp);
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
