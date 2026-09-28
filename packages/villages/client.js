var O$=Object.create;var fd=Object.defineProperty;var V$=Object.getOwnPropertyDescriptor;var D$=Object.getOwnPropertyNames;var _$=Object.getPrototypeOf,H$=Object.prototype.hasOwnProperty;var I$=(e,t,a)=>t in e?fd(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a;var Fa=(e,t)=>()=>{try{return t||e((t={exports:{}}).exports,t),t.exports}catch(a){throw t=0,a}};var U$=(e,t,a,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let o of D$(t))!H$.call(e,o)&&o!==a&&fd(e,o,{get:()=>t[o],enumerable:!(n=V$(t,o))||n.enumerable});return e};var Hs=(e,t,a)=>(a=e!=null?O$(_$(e)):{},U$(t||!e||!e.__esModule?fd(a,"default",{value:e,enumerable:!0}):a,e));var qg=(e,t,a)=>I$(e,typeof t!="symbol"?t+"":t,a);var Wg=Fa(te=>{"use strict";var yd=Symbol.for("react.transitional.element"),q$=Symbol.for("react.portal"),B$=Symbol.for("react.fragment"),L$=Symbol.for("react.strict_mode"),j$=Symbol.for("react.profiler"),G$=Symbol.for("react.consumer"),Y$=Symbol.for("react.context"),X$=Symbol.for("react.forward_ref"),Q$=Symbol.for("react.suspense"),Z$=Symbol.for("react.memo"),Yg=Symbol.for("react.lazy"),K$=Symbol.for("react.activity"),J$=Symbol.for("react.view_transition"),Bg=Symbol.iterator;function F$(e){return e===null||typeof e!="object"?null:(e=Bg&&e[Bg]||e["@@iterator"],typeof e=="function"?e:null)}var Xg={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},Qg=Object.assign,Zg={};function Mo(e,t,a){this.props=e,this.context=t,this.refs=Zg,this.updater=a||Xg}Mo.prototype.isReactComponent={};Mo.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")};Mo.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function Kg(){}Kg.prototype=Mo.prototype;function wd(e,t,a){this.props=e,this.context=t,this.refs=Zg,this.updater=a||Xg}var $d=wd.prototype=new Kg;$d.constructor=wd;Qg($d,Mo.prototype);$d.isPureReactComponent=!0;var Lg=Array.isArray;function vd(){}var _e={H:null,A:null,T:null,S:null},Jg=Object.prototype.hasOwnProperty;function xd(e,t,a){var n=a.ref;return{$$typeof:yd,type:e,key:t,ref:n!==void 0?n:null,props:a}}function P$(e,t){return xd(e.type,t,e.props)}function Nd(e){return typeof e=="object"&&e!==null&&e.$$typeof===yd}function W$(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(a){return t[a]})}var jg=/\/+/g;function bd(e,t){return typeof e=="object"&&e!==null&&e.key!=null?W$(""+e.key):t.toString(36)}function ex(e){switch(e.status){case"fulfilled":return e.value;case"rejected":throw e.reason;default:switch(typeof e.status=="string"?e.then(vd,vd):(e.status="pending",e.then(function(t){e.status==="pending"&&(e.status="fulfilled",e.value=t)},function(t){e.status==="pending"&&(e.status="rejected",e.reason=t)})),e.status){case"fulfilled":return e.value;case"rejected":throw e.reason}}throw e}function Ro(e,t,a,n,o){var l=typeof e;(l==="undefined"||l==="boolean")&&(e=null);var c=!1;if(e===null)c=!0;else switch(l){case"bigint":case"string":case"number":c=!0;break;case"object":switch(e.$$typeof){case yd:case q$:c=!0;break;case Yg:return c=e._init,Ro(c(e._payload),t,a,n,o)}}if(c)return o=o(e),c=n===""?"."+bd(e,0):n,Lg(o)?(a="",c!=null&&(a=c.replace(jg,"$&/")+"/"),Ro(o,t,a,"",function(g){return g})):o!=null&&(Nd(o)&&(o=P$(o,a+(o.key==null||e&&e.key===o.key?"":(""+o.key).replace(jg,"$&/")+"/")+c)),t.push(o)),1;c=0;var u=n===""?".":n+":";if(Lg(e))for(var h=0;h<e.length;h++)n=e[h],l=u+bd(n,h),c+=Ro(n,t,a,l,o);else if(h=F$(e),typeof h=="function")for(e=h.call(e),h=0;!(n=e.next()).done;)n=n.value,l=u+bd(n,h++),c+=Ro(n,t,a,l,o);else if(l==="object"){if(typeof e.then=="function")return Ro(ex(e),t,a,n,o);throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.")}return c}function Is(e,t,a){if(e==null)return e;var n=[],o=0;return Ro(e,n,"","",function(l){return t.call(a,l,o++)}),n}function tx(e){if(e._status===-1){var t=e._result,a=t();a.then(function(n){(e._status===0||e._status===-1)&&(e._status=1,e._result=n,a.status===void 0&&(a.status="fulfilled",a.value=n))},function(n){(e._status===0||e._status===-1)&&(e._status=2,e._result=n,a.status===void 0&&(a.status="rejected",a.reason=n))}),e._status===-1&&(e._status=0,e._result=a)}if(e._status===1)return e._result.default;throw e._result}var Gg=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)};function Fg(e){var t=_e.T,a={};a.types=t!==null?t.types:null,_e.T=a;try{var n=e(),o=_e.S;o!==null&&o(a,n),typeof n=="object"&&n!==null&&typeof n.then=="function"&&n.then(vd,Gg)}catch(l){Gg(l)}finally{t!==null&&a.types!==null&&(t.types=a.types),_e.T=t}}function Pg(e){var t=_e.T;if(t!==null){var a=t.types;a===null?t.types=[e]:a.indexOf(e)===-1&&a.push(e)}else Fg(Pg.bind(null,e))}var ax={map:Is,forEach:function(e,t,a){Is(e,function(){t.apply(this,arguments)},a)},count:function(e){var t=0;return Is(e,function(){t++}),t},toArray:function(e){return Is(e,function(t){return t})||[]},only:function(e){if(!Nd(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};te.Activity=K$;te.Children=ax;te.Component=Mo;te.Fragment=B$;te.Profiler=j$;te.PureComponent=wd;te.StrictMode=L$;te.Suspense=Q$;te.ViewTransition=J$;te.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=_e;te.__COMPILER_RUNTIME={__proto__:null,c:function(e){return _e.H.useMemoCache(e)}};te.addTransitionType=Pg;te.cache=function(e){return function(){return e.apply(null,arguments)}};te.cacheSignal=function(){return null};te.cloneElement=function(e,t,a){if(e==null)throw Error("The argument must be a React element, but you passed "+e+".");var n=Qg({},e.props),o=e.key;if(t!=null)for(l in t.key!==void 0&&(o=""+t.key),t)!Jg.call(t,l)||l==="key"||l==="__self"||l==="__source"||l==="ref"&&t.ref===void 0||(n[l]=t[l]);var l=arguments.length-2;if(l===1)n.children=a;else if(1<l){for(var c=Array(l),u=0;u<l;u++)c[u]=arguments[u+2];n.children=c}return xd(e.type,o,n)};te.createContext=function(e){return e={$$typeof:Y$,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null},e.Provider=e,e.Consumer={$$typeof:G$,_context:e},e};te.createElement=function(e,t,a){var n,o={},l=null;if(t!=null)for(n in t.key!==void 0&&(l=""+t.key),t)Jg.call(t,n)&&n!=="key"&&n!=="__self"&&n!=="__source"&&(o[n]=t[n]);var c=arguments.length-2;if(c===1)o.children=a;else if(1<c){for(var u=Array(c),h=0;h<c;h++)u[h]=arguments[h+2];o.children=u}if(e&&e.defaultProps)for(n in c=e.defaultProps,c)o[n]===void 0&&(o[n]=c[n]);return xd(e,l,o)};te.createRef=function(){return{current:null}};te.forwardRef=function(e){return{$$typeof:X$,render:e}};te.isValidElement=Nd;te.lazy=function(e){return{$$typeof:Yg,_payload:{_status:-1,_result:e},_init:tx}};te.memo=function(e,t){return{$$typeof:Z$,type:e,compare:t===void 0?null:t}};te.startTransition=Fg;te.unstable_useCacheRefresh=function(){return _e.H.useCacheRefresh()};te.use=function(e){return _e.H.use(e)};te.useActionState=function(e,t,a){return _e.H.useActionState(e,t,a)};te.useCallback=function(e,t){return _e.H.useCallback(e,t)};te.useContext=function(e){return _e.H.useContext(e)};te.useDebugValue=function(){};te.useDeferredValue=function(e,t){return _e.H.useDeferredValue(e,t)};te.useEffect=function(e,t){return _e.H.useEffect(e,t)};te.useEffectEvent=function(e){return _e.H.useEffectEvent(e)};te.useId=function(){return _e.H.useId()};te.useImperativeHandle=function(e,t,a){return _e.H.useImperativeHandle(e,t,a)};te.useInsertionEffect=function(e,t){return _e.H.useInsertionEffect(e,t)};te.useLayoutEffect=function(e,t){return _e.H.useLayoutEffect(e,t)};te.useMemo=function(e,t){return _e.H.useMemo(e,t)};te.useOptimistic=function(e,t){return _e.H.useOptimistic(e,t)};te.useReducer=function(e,t,a){return _e.H.useReducer(e,t,a)};te.useRef=function(e){return _e.H.useRef(e)};te.useState=function(e){return _e.H.useState(e)};te.useSyncExternalStore=function(e,t,a){return _e.H.useSyncExternalStore(e,t,a)};te.useTransition=function(){return _e.H.useTransition()};te.version="19.3.0"});var Us=Fa((x2,ef)=>{"use strict";ef.exports=Wg()});var df=Fa(Le=>{"use strict";function Ed(e,t){var a=e.length;e.push(t);e:for(;0<a;){var n=a-1>>>1,o=e[n];if(0<qs(o,t))e[n]=t,e[a]=o,a=n;else break e}}function Pa(e){return e.length===0?null:e[0]}function Ls(e){if(e.length===0)return null;var t=e[0],a=e.pop();if(a!==t){e[0]=a;e:for(var n=0,o=e.length,l=o>>>1;n<l;){var c=2*(n+1)-1,u=e[c],h=c+1,g=e[h];if(0>qs(u,a))h<o&&0>qs(g,u)?(e[n]=g,e[h]=a,n=h):(e[n]=u,e[c]=a,n=c);else if(h<o&&0>qs(g,a))e[n]=g,e[h]=a,n=h;else break e}}return t}function qs(e,t){var a=e.sortIndex-t.sortIndex;return a!==0?a:e.id-t.id}Le.unstable_now=void 0;typeof performance=="object"&&typeof performance.now=="function"?(tf=performance,Le.unstable_now=function(){return tf.now()}):(Sd=Date,af=Sd.now(),Le.unstable_now=function(){return Sd.now()-af});var tf,Sd,af,yn=[],Ln=[],nx=1,ya=null,zt=3,Cd=!1,nl=!1,il=!1,Ad=!1,rf=typeof setTimeout=="function"?setTimeout:null,lf=typeof clearTimeout=="function"?clearTimeout:null,nf=typeof setImmediate<"u"?setImmediate:null;function Bs(e){for(var t=Pa(Ln);t!==null;){if(t.callback===null)Ls(Ln);else if(t.startTime<=e)Ls(Ln),t.sortIndex=t.expirationTime,Ed(yn,t);else break;t=Pa(Ln)}}function zd(e){if(il=!1,Bs(e),!nl)if(Pa(yn)!==null)nl=!0,Vo||(Vo=!0,Oo());else{var t=Pa(Ln);t!==null&&Rd(zd,t.startTime-e)}}var Vo=!1,ol=-1,sf=5,cf=-1;function uf(){return Ad?!0:!(Le.unstable_now()-cf<sf)}function Td(){if(Ad=!1,Vo){var e=Le.unstable_now();cf=e;var t=!0;try{e:{nl=!1,il&&(il=!1,lf(ol),ol=-1),Cd=!0;var a=zt;try{t:{for(Bs(e),ya=Pa(yn);ya!==null&&!(ya.expirationTime>e&&uf());){var n=ya.callback;if(typeof n=="function"){ya.callback=null,zt=ya.priorityLevel;var o=n(ya.expirationTime<=e);if(e=Le.unstable_now(),typeof o=="function"){ya.callback=o,Bs(e),t=!0;break t}ya===Pa(yn)&&Ls(yn),Bs(e)}else Ls(yn);ya=Pa(yn)}if(ya!==null)t=!0;else{var l=Pa(Ln);l!==null&&Rd(zd,l.startTime-e),t=!1}}break e}finally{ya=null,zt=a,Cd=!1}t=void 0}}finally{t?Oo():Vo=!1}}}var Oo;typeof nf=="function"?Oo=function(){nf(Td)}:typeof MessageChannel<"u"?(kd=new MessageChannel,of=kd.port2,kd.port1.onmessage=Td,Oo=function(){of.postMessage(null)}):Oo=function(){rf(Td,0)};var kd,of;function Rd(e,t){ol=rf(function(){e(Le.unstable_now())},t)}Le.unstable_IdlePriority=5;Le.unstable_ImmediatePriority=1;Le.unstable_LowPriority=4;Le.unstable_NormalPriority=3;Le.unstable_Profiling=null;Le.unstable_UserBlockingPriority=2;Le.unstable_cancelCallback=function(e){e.callback=null};Le.unstable_forceFrameRate=function(e){0>e||125<e?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):sf=0<e?Math.floor(1e3/e):5};Le.unstable_getCurrentPriorityLevel=function(){return zt};Le.unstable_next=function(e){switch(zt){case 1:case 2:case 3:var t=3;break;default:t=zt}var a=zt;zt=t;try{return e()}finally{zt=a}};Le.unstable_requestPaint=function(){Ad=!0};Le.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var a=zt;zt=e;try{return t()}finally{zt=a}};Le.unstable_scheduleCallback=function(e,t,a){var n=Le.unstable_now();switch(typeof a=="object"&&a!==null?(a=a.delay,a=typeof a=="number"&&0<a?n+a:n):a=n,e){case 1:var o=-1;break;case 2:o=250;break;case 5:o=1073741823;break;case 4:o=1e4;break;default:o=5e3}return o=a+o,e={id:nx++,callback:t,priorityLevel:e,startTime:a,expirationTime:o,sortIndex:-1},a>n?(e.sortIndex=a,Ed(Ln,e),Pa(yn)===null&&e===Pa(Ln)&&(il?(lf(ol),ol=-1):il=!0,Rd(zd,a-n))):(e.sortIndex=o,Ed(yn,e),nl||Cd||(nl=!0,Vo||(Vo=!0,Oo()))),e};Le.unstable_shouldYield=uf;Le.unstable_wrapCallback=function(e){var t=zt;return function(){var a=zt;zt=t;try{return e.apply(this,arguments)}finally{zt=a}}}});var mf=Fa((S2,hf)=>{"use strict";hf.exports=df()});var ff=Fa(Rt=>{"use strict";var ix=Us();function gf(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)t+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function jn(){}var Ut={d:{f:jn,r:function(){throw Error(gf(522))},D:jn,C:jn,L:jn,m:jn,X:jn,S:jn,M:jn},p:0,findDOMNode:null},ox=Symbol.for("react.portal"),rx=Symbol.for("react.recoverable"),pf=Symbol.for("react.optimistic_key");function lx(e,t,a){var n=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:ox,key:n==null?null:n===pf?pf:""+n,children:e,containerInfo:t,implementation:a}}var rl=ix.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function js(e,t){if(e==="font")return"";if(typeof t=="string")return t==="use-credentials"?t:""}Rt.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=Ut;Rt.browser=function(e){return{$$typeof:rx,_reason:e}};Rt.createPortal=function(e,t){var a=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)throw Error(gf(299));return lx(e,t,null,a)};Rt.flushSync=function(e){var t=rl.T,a=Ut.p;try{if(rl.T=null,Ut.p=2,e)return e()}finally{rl.T=t,Ut.p=a,Ut.d.f()}};Rt.preconnect=function(e,t){typeof e=="string"&&(t?(t=t.crossOrigin,t=typeof t=="string"?t==="use-credentials"?t:"":void 0):t=null,Ut.d.C(e,t))};Rt.prefetchDNS=function(e){typeof e=="string"&&Ut.d.D(e)};Rt.preinit=function(e,t){if(typeof e=="string"&&t&&typeof t.as=="string"){var a=t.as,n=js(a,t.crossOrigin),o=typeof t.integrity=="string"?t.integrity:void 0,l=typeof t.fetchPriority=="string"?t.fetchPriority:void 0;a==="style"?Ut.d.S(e,typeof t.precedence=="string"?t.precedence:void 0,{crossOrigin:n,integrity:o,fetchPriority:l}):a==="script"&&Ut.d.X(e,{crossOrigin:n,integrity:o,fetchPriority:l,nonce:typeof t.nonce=="string"?t.nonce:void 0})}};Rt.preinitModule=function(e,t){if(typeof e=="string")if(typeof t=="object"&&t!==null){if(t.as==null||t.as==="script"){var a=js(t.as,t.crossOrigin);Ut.d.M(e,{crossOrigin:a,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0})}}else t==null&&Ut.d.M(e)};Rt.preload=function(e,t){if(typeof e=="string"&&typeof t=="object"&&t!==null&&typeof t.as=="string"){var a=t.as,n=js(a,t.crossOrigin);Ut.d.L(e,a,{crossOrigin:n,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,type:typeof t.type=="string"?t.type:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0,referrerPolicy:typeof t.referrerPolicy=="string"?t.referrerPolicy:void 0,imageSrcSet:typeof t.imageSrcSet=="string"?t.imageSrcSet:void 0,imageSizes:typeof t.imageSizes=="string"?t.imageSizes:void 0,media:typeof t.media=="string"?t.media:void 0})}};Rt.preloadModule=function(e,t){if(typeof e=="string")if(t){var a=js(t.as,t.crossOrigin);Ut.d.m(e,{as:typeof t.as=="string"&&t.as!=="script"?t.as:void 0,crossOrigin:a,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0})}else Ut.d.m(e)};Rt.requestFormReset=function(e){Ut.d.r(e)};Rt.unstable_batchedUpdates=function(e,t){return e(t)};Rt.useFormState=function(e,t,a){return rl.H.useFormState(e,t,a)};Rt.useFormStatus=function(){return rl.H.useHostTransitionStatus()};Rt.version="19.3.0"});var yf=Fa((k2,vf)=>{"use strict";function bf(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(bf)}catch(e){console.error(e)}}bf(),vf.exports=ff()});var o0=Fa(Su=>{"use strict";var dt=mf(),iv=Us(),sx=yf();function R(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)t+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function ov(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function Ql(e){for(var t=e,a=t;a&&!a.alternate;)t=a,(t.flags&4098)!==0&&(e=t.return),a=t.return;for(;t.return;)t=t.return;return t.tag===3?e:null}function rv(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function lv(e){if(e.tag===31){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function wf(e){if(Ql(e)!==e)throw Error(R(188))}function cx(e){var t=e.alternate;if(!t){if(t=Ql(e),t===null)throw Error(R(188));return t!==e?null:e}for(var a=e,n=t;;){var o=a.return;if(o===null)break;var l=o.alternate;if(l===null){if(n=o.return,n!==null){a=n;continue}break}if(o.child===l.child){for(l=o.child;l;){if(l===a)return wf(o),e;if(l===n)return wf(o),t;l=l.sibling}throw Error(R(188))}if(a.return!==n.return)a=o,n=l;else{for(var c=!1,u=o.child;u;){if(u===a){c=!0,a=o,n=l;break}if(u===n){c=!0,n=o,a=l;break}u=u.sibling}if(!c){for(u=l.child;u;){if(u===a){c=!0,a=l,n=o;break}if(u===n){c=!0,n=l,a=o;break}u=u.sibling}if(!c)throw Error(R(189))}}if(a.alternate!==n)throw Error(R(190))}if(a.tag!==3)throw Error(R(188));return a.stateNode.current===a?e:t}function sv(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e;for(e=e.child;e!==null;){if(t=sv(e),t!==null)return t;e=e.sibling}return null}function Pt(e,t,a,n,o,l){for(;e!==null;){if((e.tag===5||e.tag===27||e.tag===6)&&a(e,n,o,l)||(e.tag!==22||e.memoizedState===null)&&(t||e.tag!==5&&e.tag!==27)&&Pt(e.child,t,a,n,o,l))return!0;e=e.sibling}return!1}function to(e){for(e=e.return;e!==null;){if(e.tag===3||e.tag===5||e.tag===27)return e;e=e.return}return null}function $f(e){var t=!1;for(e=e.return;e!==null&&(e.tag===4&&(t=!0),!(e.tag===3||e.tag===5||e.tag===27));)e=e.return;return t}function cv(e){var t=[null,null],a=to(e);return a===null||uv(t,e,a.child,{foundSelf:!1}),t}function uv(e,t,a,n){for(;a!==null;){if(a===t)n.foundSelf=!0;else if(a.tag===5||a.tag===27||a.tag===6){if(n.foundSelf)return e[1]=a,!0;e[0]=a}else if((a.tag!==22||a.memoizedState===null)&&uv(e,t,a.child,n))return!0;a=a.sibling}return!1}function ut(e){switch(e.tag){case 5:case 27:case 6:return e.stateNode;case 3:return e.stateNode.containerInfo;default:throw Error(R(559))}}var Bo=null,ch=null;function ux(e,t,a){return e===a?!0:e===t?(Bo=e,!0):!1}function dx(e,t,a){return e===a?(ch=e,!1):e===t?(ch!==null&&(Bo=e),!0):!1}function xf(e){if(e===null)return null;do e=e===null?null:e.return;while(e&&e.tag!==5&&e.tag!==27&&e.tag!==3);return e||null}function uh(e,t,a){for(var n=0,o=e;o;o=a(o))n++;o=0;for(var l=t;l;l=a(l))o++;for(;0<n-o;)e=a(e),n--;for(;0<o-n;)t=a(t),o--;for(;n--;){if(e===t||t!==null&&e===t.alternate)return e;e=a(e),t=a(t)}return null}var Ve=Object.assign,hx=Symbol.for("react.element"),Gs=Symbol.for("react.transitional.element"),ml=Symbol.for("react.portal"),Lo=Symbol.for("react.fragment"),dv=Symbol.for("react.strict_mode"),dh=Symbol.for("react.profiler"),hv=Symbol.for("react.consumer"),on=Symbol.for("react.context"),wm=Symbol.for("react.forward_ref"),hh=Symbol.for("react.suspense"),mh=Symbol.for("react.suspense_list"),$m=Symbol.for("react.memo"),Qn=Symbol.for("react.lazy"),ph=Symbol.for("react.activity"),mx=Symbol.for("react.legacy_hidden"),px=Symbol.for("react.memo_cache_sentinel"),gh=Symbol.for("react.view_transition"),gx=Symbol.for("react.recoverable"),Nf=Symbol.iterator;function ll(e){return e===null||typeof e!="object"?null:(e=Nf&&e[Nf]||e["@@iterator"],typeof e=="function"?e:null)}var fx=Symbol.for("react.client.reference");function fh(e){if(e==null)return null;if(typeof e=="function")return e.$$typeof===fx?null:e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case Lo:return"Fragment";case dh:return"Profiler";case dv:return"StrictMode";case hh:return"Suspense";case mh:return"SuspenseList";case ph:return"Activity";case gh:return"ViewTransition"}if(typeof e=="object")switch(e.$$typeof){case ml:return"Portal";case on:return e.displayName||"Context";case hv:return(e._context.displayName||"Context")+".Consumer";case wm:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case $m:return t=e.displayName||null,t!==null?t:fh(e.type)||"Memo";case Qn:t=e._payload,e=e._init;try{return fh(e(t))}catch{}}return null}var pl=Array.isArray,W=iv.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,xe=sx.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Li={pending:!1,data:null,method:null,action:null},bh=[],jo=-1;function hn(e){return{current:e}}function St(e){0>jo||(e.current=bh[jo],bh[jo]=null,jo--)}function Ue(e,t){jo++,bh[jo]=e.current,e.current=t}var cn=hn(null),Rl=hn(null),ai=hn(null),zc=hn(null);function Rc(e,t){switch(Ue(ai,t),Ue(Rl,e),Ue(cn,null),t.nodeType){case 9:case 11:e=(e=t.documentElement)&&(e=e.namespaceURI)?Hb(e):0;break;default:if(e=t.tagName,t=t.namespaceURI)t=Hb(t),e=Vw(t,e);else switch(e){case"svg":e=1;break;case"math":e=2;break;default:e=0}}St(cn),Ue(cn,e)}function cr(){St(cn),St(Rl),St(ai)}function vh(e){var t=e.memoizedState;t!==null&&(yr._currentValue=t.memoizedState,Ue(zc,e)),t=cn.current;var a=Vw(t,e.type);t!==a&&(Ue(Rl,e),Ue(cn,a))}function Mc(e){Rl.current===e&&(St(cn),St(Rl)),zc.current===e&&(St(zc),yr._currentValue=Li)}var Md,Sf;function Yn(e){if(Md===void 0)try{throw Error()}catch(a){var t=a.stack.trim().match(/\n( *(at )?)/);Md=t&&t[1]||"",Sf=-1<a.stack.indexOf(`
    at`)?" (<anonymous>)":-1<a.stack.indexOf("@")?"@unknown:0:0":""}return`
`+Md+e+Sf}var Od=!1;function Vd(e,t){if(!e||Od)return"";Od=!0;var a=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var n={DetermineComponentFrameRoot:function(){try{if(t){var x=function(){throw Error()};if(Object.defineProperty(x.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct(x,[])}catch(C){var f=C}Reflect.construct(e,[],x)}else{try{x.call()}catch(C){f=C}x=!1;try{var b=Object.getOwnPropertyDescriptor(e.prototype,"props");Object.defineProperty(e.prototype,"props",{configurable:!0,set:function(){throw Error()}}),x=!0,new e}finally{x&&(b!==void 0?Object.defineProperty(e.prototype,"props",b):delete e.prototype.props)}}}else{try{throw Error()}catch(C){f=C}(x=e())&&typeof x.catch=="function"&&x.catch(function(){})}}catch(C){if(C&&f&&typeof C.stack=="string")return[C.stack,f.stack]}return[null,null]}};n.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var o=Object.getOwnPropertyDescriptor(n.DetermineComponentFrameRoot,"name");o&&o.configurable&&Object.defineProperty(n.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var l=n.DetermineComponentFrameRoot(),c=l[0],u=l[1];if(c&&u){var h=c.split(`
`),g=u.split(`
`);for(o=n=0;n<h.length&&!h[n].includes("DetermineComponentFrameRoot");)n++;for(;o<g.length&&!g[o].includes("DetermineComponentFrameRoot");)o++;if(n===h.length||o===g.length)for(n=h.length-1,o=g.length-1;1<=n&&0<=o&&h[n]!==g[o];)o--;for(;1<=n&&0<=o;n--,o--)if(h[n]!==g[o]){if(n!==1||o!==1)do if(n--,o--,0>o||h[n]!==g[o]){var $=`
`+h[n].replace(" at new "," at ");return e.displayName&&$.includes("<anonymous>")&&($=$.replace("<anonymous>",e.displayName)),$}while(1<=n&&0<=o);break}}}finally{Od=!1,Error.prepareStackTrace=a}return(a=e?e.displayName||e.name:"")?Yn(a):""}function bx(e,t){switch(e.tag){case 26:case 27:case 5:return Yn(e.type);case 16:return Yn("Lazy");case 13:return e.child!==t&&t!==null?Yn("Suspense Fallback"):Yn("Suspense");case 19:return Yn("SuspenseList");case 0:case 15:return Vd(e.type,!1);case 11:return Vd(e.type.render,!1);case 1:return Vd(e.type,!0);case 31:return Yn("Activity");case 30:return Yn("ViewTransition");default:return""}}function Tf(e){try{var t="",a=null;do t+=bx(e,a),a=e,e=e.return;while(e);return t}catch(n){return`
Error generating stack: `+n.message+`
`+n.stack}}var yh=Object.prototype.hasOwnProperty,xm=dt.unstable_scheduleCallback,Dd=dt.unstable_cancelCallback,vx=dt.unstable_shouldYield,yx=dt.unstable_requestPaint,sa=dt.unstable_now,wx=dt.unstable_getCurrentPriorityLevel,mv=dt.unstable_ImmediatePriority,pv=dt.unstable_UserBlockingPriority,Oc=dt.unstable_NormalPriority,$x=dt.unstable_LowPriority,gv=dt.unstable_IdlePriority,xx=dt.log,Nx=dt.unstable_setDisableYieldValue,Zl=null,ca=null;function Jn(e){if(typeof xx=="function"&&Nx(e),ca&&typeof ca.setStrictMode=="function")try{ca.setStrictMode(Zl,e)}catch{}}var ua=Math.clz32?Math.clz32:kx,Sx=Math.log,Tx=Math.LN2;function kx(e){return e>>>=0,e===0?32:31-(Sx(e)/Tx|0)|0}var Ys=256,Xs=262144,Qs=4194304;function Hi(e){var t=e&42;if(t!==0)return t;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&-e;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function ou(e,t,a){var n=e.pendingLanes;if(n===0)return 0;var o=0,l=e.suspendedLanes,c=e.pingedLanes;e=e.warmLanes;var u=n&134217727;return u!==0?(n=u&~l,n!==0?o=Hi(n):(c&=u,c!==0?o=Hi(c):a||(a=u&~e,a!==0&&(o=Hi(a))))):(u=n&~l,u!==0?o=Hi(u):c!==0?o=Hi(c):a||(a=n&~e,a!==0&&(o=Hi(a)))),o===0?0:t!==0&&t!==o&&(t&l)===0&&(l=o&-o,a=t&-t,l>=a||l===32&&(a&4194048)!==0)?t:o}function Kl(e,t){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&t)===0}function fv(e,t){(t&8)!==0&&(t|=t&32);var a=e.entangledLanes;if(a!==0)for(e=e.entanglements,a&=t;0<a;){var n=31-ua(a),o=1<<n;t|=e[n],a&=~o}return t}function Ex(e,t){switch(e){case 1:case 2:case 4:case 8:case 64:return t+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function bv(){var e=Qs;return Qs<<=1,(Qs&62914560)===0&&(Qs=4194304),e}function _d(e){for(var t=[],a=0;31>a;a++)t.push(e);return t}function Jl(e,t){e.pendingLanes|=t,t!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function Cx(e,t,a,n,o,l){var c=e.pendingLanes;e.pendingLanes=a,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=a,e.entangledLanes&=a,e.errorRecoveryDisabledLanes&=a,e.shellSuspendCounter=0;var u=e.entanglements,h=e.expirationTimes,g=e.hiddenUpdates;for(a=c&~a;0<a;){var $=31-ua(a),x=1<<$;u[$]=0,h[$]=-1;var f=g[$];if(f!==null)for(g[$]=null,$=0;$<f.length;$++){var b=f[$];b!==null&&(b.lane&=-536870913)}a&=~x}n!==0&&vv(e,n,0),l!==0&&o===0&&e.tag!==0&&(e.suspendedLanes|=l&~(c&~t))}function vv(e,t,a){e.pendingLanes|=t,e.suspendedLanes&=~t;var n=31-ua(t);e.entangledLanes|=t,e.entanglements[n]=e.entanglements[n]|1073741824|a&261930}function yv(e,t){var a=e.entangledLanes|=t;for(e=e.entanglements;a;){var n=31-ua(a),o=1<<n;o&t|e[n]&t&&(e[n]|=t),a&=~o}}function wv(e,t){var a=t&-t;return a=(a&42)!==0?1:Nm(a),(a&(e.suspendedLanes|t))!==0?0:a}function Nm(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function Sm(e){return e&=-e,2<e?8<e?(e&134217727)!==0?32:268435456:8:2}function $v(){var e=xe.p;return e!==0?e:(e=window.event,e===void 0?32:a0(e.type))}function kf(e,t){var a=xe.p;try{return xe.p=e,t()}finally{xe.p=a}}var Mn=Math.random().toString(36).slice(2),xt="__reactFiber$"+Mn,Wt="__reactProps$"+Mn,xr="__reactContainer$"+Mn,Ef="__reactEvents$"+Mn,Ax="__reactListeners$"+Mn,zx="__reactHandles$"+Mn,Cf="__reactResources$"+Mn,Fl="__reactMarker$"+Mn,Vc="__reactLoad$"+Mn;function ru(e){delete e[xt],delete e[Wt],delete e[Ax],delete e[zx]}function qi(e){var t;if(t=e[xt])return t;for(var a=e.parentNode;a;){if(t=a[xr]||a[xt]){if(a=t.alternate,t.child!==null||a!==null&&a.child!==null)for(e=Yb(e);e!==null;){if(a=e[xt])return a;e=Yb(e)}return t}e=a,a=e.parentNode}return null}function Nr(e){if(e=e[xt]||e[xr]){var t=e.tag;if(t===5||t===6||t===13||t===31||t===26||t===27||t===3)return e}return null}function gl(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e.stateNode;throw Error(R(33))}function Wo(e){var t=e[Cf];return t||(t=e[Cf]={hoistableStyles:new Map,hoistableScripts:new Map}),t}function bt(e){e[Fl]=!0}function xv(e){e[Vc]=void 0}var Nv=new Set,Sv={};function ao(e,t){ur(e,t),ur(e+"Capture",t)}function ur(e,t){for(Sv[e]=t,e=0;e<t.length;e++)Nv.add(t[e])}var Rx=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),Af={},zf={};function Mx(e){return yh.call(zf,e)?!0:yh.call(Af,e)?!1:Rx.test(e)?zf[e]=!0:(Af[e]=!0,!1)}var ye=!1;function Rf(){var e=ye;return ye=!1,e}function dc(e,t,a){if(Mx(t))if(a===null)e.removeAttribute(t);else{switch(typeof a){case"undefined":case"function":case"symbol":e.removeAttribute(t);return;case"boolean":var n=t.toLowerCase().slice(0,5);if(n!=="data-"&&n!=="aria-"){e.removeAttribute(t);return}}e.setAttribute(t,a)}}function Zs(e,t,a){if(a===null)e.removeAttribute(t);else{switch(typeof a){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(t);return}e.setAttribute(t,a)}}function wn(e,t,a,n){if(n===null)e.removeAttribute(a);else{switch(typeof n){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(a);return}e.setAttributeNS(t,a,n)}}function ia(e){switch(typeof e){case"bigint":case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function Tv(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function Ox(e,t,a){var n=Object.getOwnPropertyDescriptor(e.constructor.prototype,t);if(!e.hasOwnProperty(t)&&typeof n<"u"&&typeof n.get=="function"&&typeof n.set=="function"){var o=n.get,l=n.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return o.call(this)},set:function(c){a=""+c,l.call(this,c)}}),Object.defineProperty(e,t,{enumerable:n.enumerable}),{getValue:function(){return a},setValue:function(c){a=""+c},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function wh(e){if(!e._valueTracker){var t=Tv(e)?"checked":"value";e._valueTracker=Ox(e,t,""+e[t])}}function kv(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var a=t.getValue(),n="";return e&&(n=Tv(e)?e.checked?"true":"false":e.value),e=n,e!==a?(t.setValue(e),!0):!1}var Vx=/[\n"\\]/g;function Sa(e){return e.replace(Vx,function(t){return"\\"+t.charCodeAt(0).toString(16)+" "})}function $h(e,t,a,n,o,l,c,u){e.name="",c!=null&&typeof c!="function"&&typeof c!="symbol"&&typeof c!="boolean"?e.type=c:e.removeAttribute("type"),t!=null?c==="number"?(t===0&&e.value===""||e.value!=t)&&(e.value=""+ia(t)):e.value!==""+ia(t)&&(e.value=""+ia(t)):c!=="submit"&&c!=="reset"||e.removeAttribute("value"),t!=null?c==="number"&&e.value==t?Hd(e,ia(e.value)):Hd(e,ia(t)):a!=null?Hd(e,ia(a)):n!=null&&e.removeAttribute("value"),o==null&&l!=null&&(e.defaultChecked=!!l),o!=null&&(e.checked=o&&typeof o!="function"&&typeof o!="symbol"),u!=null&&typeof u!="function"&&typeof u!="symbol"&&typeof u!="boolean"?e.name=""+ia(u):e.removeAttribute("name")}function Ev(e,t,a,n,o,l,c,u){if(l!=null&&typeof l!="function"&&typeof l!="symbol"&&typeof l!="boolean"&&(e.type=l),t!=null||a!=null){if(!(l!=="submit"&&l!=="reset"||t!=null)){wh(e);return}a=a!=null?""+ia(a):"",t=t!=null?""+ia(t):a,u||t===e.value||(e.value=t),e.defaultValue=t}n=n??o,n=typeof n!="function"&&typeof n!="symbol"&&!!n,e.checked=u?e.checked:!!n,e.defaultChecked=!!n,c!=null&&typeof c!="function"&&typeof c!="symbol"&&typeof c!="boolean"&&(e.name=c),wh(e)}function Hd(e,t){e.defaultValue!==""+t&&(e.defaultValue=""+t)}function er(e,t,a,n){if(e=e.options,t){t={};for(var o=0;o<a.length;o++)t["$"+a[o]]=!0;for(a=0;a<e.length;a++)o=t.hasOwnProperty("$"+e[a].value),e[a].selected!==o&&(e[a].selected=o),o&&n&&(e[a].defaultSelected=!0)}else{for(a=""+ia(a),t=null,o=0;o<e.length;o++){if(e[o].value===a){e[o].selected=!0,n&&(e[o].defaultSelected=!0);return}t!==null||e[o].disabled||(t=e[o])}t!==null&&(t.selected=!0)}}function Cv(e,t,a){if(t!=null&&(t=""+ia(t),t!==e.value&&(e.value=t),a==null)){e.defaultValue!==t&&(e.defaultValue=t);return}e.defaultValue=a!=null?""+ia(a):""}function Av(e,t,a,n){if(t==null){if(n!=null){if(a!=null)throw Error(R(92));if(pl(n)){if(1<n.length)throw Error(R(93));n=n[0]}a=n}a==null&&(a=""),t=a}a=ia(t),e.defaultValue=a,n=e.textContent,n===a&&n!==""&&n!==null&&(e.value=n),wh(e)}function dr(e,t){if(t){var a=e.firstChild;if(a&&a===e.lastChild&&a.nodeType===3){a.nodeValue=t;return}}e.textContent=t}var Dx=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function Mf(e,t,a){var n=t.indexOf("--")===0;a==null||typeof a=="boolean"||a===""?n?e.setProperty(t,""):t==="float"?e.cssFloat="":e[t]="":n?e.setProperty(t,a):typeof a!="number"||a===0||Dx.has(t)?t==="float"?e.cssFloat=a:e[t]=(""+a).trim():e[t]=a+"px"}function zv(e,t,a){if(t!=null&&typeof t!="object")throw Error(R(62));if(e=e.style,a!=null){for(var n in a)!a.hasOwnProperty(n)||t!=null&&t.hasOwnProperty(n)||(n.indexOf("--")===0?e.setProperty(n,""):n==="float"?e.cssFloat="":e[n]="",ye=!0);for(var o in t)n=t[o],t.hasOwnProperty(o)&&a[o]!==n&&(Mf(e,o,n),ye=!0)}else for(var l in t)t.hasOwnProperty(l)&&Mf(e,l,t[l])}function Tm(e){if(e.indexOf("-")===-1)return!1;switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var _x=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["maskType","mask-type"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),Hx=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function hc(e){return Hx.test(""+e)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":e}function rn(){}var xh=null;function km(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var Go=null,tr=null;function Of(e){var t=Nr(e);if(t&&(e=t.stateNode)){var a=e[Wt]||null;e:switch(e=t.stateNode,t.type){case"input":if($h(e,a.value,a.defaultValue,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name),t=a.name,a.type==="radio"&&t!=null){for(a=e;a.parentNode;)a=a.parentNode;for(a=a.querySelectorAll('input[name="'+Sa(""+t)+'"][type="radio"]'),t=0;t<a.length;t++){var n=a[t];if(n!==e&&n.form===e.form){var o=n[Wt]||null;if(!o)throw Error(R(90));$h(n,o.value,o.defaultValue,o.defaultValue,o.checked,o.defaultChecked,o.type,o.name)}}for(t=0;t<a.length;t++)n=a[t],n.form===e.form&&kv(n)}break e;case"textarea":Cv(e,a.value,a.defaultValue);break e;case"select":t=a.value,t!=null&&er(e,!!a.multiple,t,!1)}}}var Id=!1;function Rv(e,t,a){if(Id)return e(t,a);Id=!0;try{var n=e(t);return n}finally{if(Id=!1,(Go!==null||tr!==null)&&(wu(),Go&&(t=Go,e=tr,tr=Go=null,Of(t),e)))for(t=0;t<e.length;t++)Of(e[t])}}function Ml(e,t){var a=e.stateNode;if(a===null)return null;var n=a[Wt]||null;if(n===null)return null;a=n[t];e:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(n=!n.disabled)||(e=e.type,n=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!n;break e;default:e=!1}if(e)return null;if(a&&typeof a!="function")throw Error(R(231,t,typeof a));return a}var kn=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),Nh=!1;if(kn)try{Do={},Object.defineProperty(Do,"passive",{get:function(){Nh=!0}}),window.addEventListener("test",Do,Do),window.removeEventListener("test",Do,Do)}catch{Nh=!1}var Do,Fn=null,Em=null,mc=null;function Mv(){if(mc)return mc;var e,t=Em,a=t.length,n,o="value"in Fn?Fn.value:Fn.textContent,l=o.length;for(e=0;e<a&&t[e]===o[e];e++);var c=a-e;for(n=1;n<=c&&t[a-n]===o[l-n];n++);return mc=o.slice(e,1<n?1-n:void 0)}function pc(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function Ks(){return!0}function Vf(){return!1}function jt(e){function t(a,n,o,l,c){this._reactName=a,this._targetInst=o,this.type=n,this.nativeEvent=l,this.target=c,this.currentTarget=null;for(var u in e)e.hasOwnProperty(u)&&(a=e[u],this[u]=a?a(l):l[u]);return this.isDefaultPrevented=(l.defaultPrevented!=null?l.defaultPrevented:l.returnValue===!1)?Ks:Vf,this.isPropagationStopped=Vf,this}return Ve(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var a=this.nativeEvent;a&&(a.preventDefault?a.preventDefault():typeof a.returnValue!="unknown"&&(a.returnValue=!1),this.isDefaultPrevented=Ks)},stopPropagation:function(){var a=this.nativeEvent;a&&(a.stopPropagation?a.stopPropagation():typeof a.cancelBubble!="unknown"&&(a.cancelBubble=!0),this.isPropagationStopped=Ks)},persist:function(){},isPersistent:Ks}),t}var bi={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},lu=jt(bi),Pl=Ve({},bi,{view:0,detail:0}),Ix=jt(Pl),Ud,qd,sl,su=Ve({},Pl,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Cm,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==sl&&(sl&&e.type==="mousemove"?(Ud=e.screenX-sl.screenX,qd=e.screenY-sl.screenY):qd=Ud=0,sl=e),Ud)},movementY:function(e){return"movementY"in e?e.movementY:qd}}),Df=jt(su),Ux=Ve({},su,{dataTransfer:0}),qx=jt(Ux),Bx=Ve({},Pl,{relatedTarget:0}),Bd=jt(Bx),Lx=Ve({},bi,{animationName:0,elapsedTime:0,pseudoElement:0}),jx=jt(Lx),Gx=Ve({},bi,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),Yx=jt(Gx),Xx=Ve({},bi,{data:0}),_f=jt(Xx),Qx={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},Zx={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},Kx={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function Jx(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=Kx[e])?!!t[e]:!1}function Cm(){return Jx}var Fx=Ve({},Pl,{key:function(e){if(e.key){var t=Qx[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=pc(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?Zx[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Cm,charCode:function(e){return e.type==="keypress"?pc(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?pc(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),Px=jt(Fx),Wx=Ve({},su,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),Hf=jt(Wx),eN=Ve({},bi,{submitter:0}),tN=jt(eN),aN=Ve({},Pl,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Cm}),nN=jt(aN),iN=Ve({},bi,{propertyName:0,elapsedTime:0,pseudoElement:0}),oN=jt(iN),rN=Ve({},su,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),lN=jt(rN),sN=Ve({},bi,{newState:0,oldState:0,source:0}),cN=jt(sN),uN=[9,13,27,32],Am=kn&&"CompositionEvent"in window,vl=null;kn&&"documentMode"in document&&(vl=document.documentMode);var dN=kn&&"TextEvent"in window&&!vl,Ov=kn&&(!Am||vl&&8<vl&&11>=vl),If=" ",Uf=!1;function Vv(e,t){switch(e){case"keyup":return uN.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function Dv(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var Yo=!1;function hN(e,t){switch(e){case"compositionend":return Dv(t);case"keypress":return t.which!==32?null:(Uf=!0,If);case"textInput":return e=t.data,e===If&&Uf?null:e;default:return null}}function mN(e,t){if(Yo)return e==="compositionend"||!Am&&Vv(e,t)?(e=Mv(),mc=Em=Fn=null,Yo=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return Ov&&t.locale!=="ko"?null:t.data;default:return null}}var pN={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function qf(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!pN[e.type]:t==="textarea"}function _v(e,t,a,n){Go?tr?tr.push(n):tr=[n]:Go=n,t=au(t,"onChange"),0<t.length&&(a=new lu("onChange","change",null,a,n),e.push({event:a,listeners:t}))}var yl=null,Ol=null;function gN(e){Rw(e,0)}function cu(e){var t=gl(e);if(kv(t))return e}function Bf(e,t){if(e==="change")return t}var Hv=!1;kn&&(kn?(Fs="oninput"in document,Fs||(Ld=document.createElement("div"),Ld.setAttribute("oninput","return;"),Fs=typeof Ld.oninput=="function"),Js=Fs):Js=!1,Hv=Js&&(!document.documentMode||9<document.documentMode));var Js,Fs,Ld;function Lf(){yl&&(yl.detachEvent("onpropertychange",Iv),Ol=yl=null)}function Iv(e){if(e.propertyName==="value"&&cu(Ol)){var t=[];_v(t,Ol,e,km(e)),Rv(gN,t)}}function fN(e,t,a){e==="focusin"?(Lf(),yl=t,Ol=a,yl.attachEvent("onpropertychange",Iv)):e==="focusout"&&Lf()}function bN(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return cu(Ol)}function vN(e,t){if(e==="click")return cu(t)}function yN(e,t){if(e==="input"||e==="change")return cu(t)}function wN(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var ha=typeof Object.is=="function"?Object.is:wN;function Vl(e,t){if(ha(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var a=Object.keys(e),n=Object.keys(t);if(a.length!==n.length)return!1;for(n=0;n<a.length;n++){var o=a[n];if(!yh.call(t,o)||!ha(e[o],t[o]))return!1}return!0}function Sh(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}function jf(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function Gf(e,t){var a=jf(e);e=0;for(var n;a;){if(a.nodeType===3){if(n=e+a.textContent.length,e<=t&&n>=t)return{node:a,offset:t-e};e=n}e:{for(;a;){if(a.nextSibling){a=a.nextSibling;break e}a=a.parentNode}a=void 0}a=jf(a)}}function Uv(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?Uv(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function qv(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var t=Sh(e.document);t instanceof e.HTMLIFrameElement;){try{var a=typeof t.contentWindow.location.href=="string"}catch{a=!1}if(a)e=t.contentWindow;else break;t=Sh(e.document)}return t}function zm(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}var $N=kn&&"documentMode"in document&&11>=document.documentMode,Xo=null,Th=null,wl=null,kh=!1;function Yf(e,t,a){var n=a.window===a?a.document:a.nodeType===9?a:a.ownerDocument;kh||Xo==null||Xo!==Sh(n)||(n=Xo,"selectionStart"in n&&zm(n)?n={start:n.selectionStart,end:n.selectionEnd}:(n=(n.ownerDocument&&n.ownerDocument.defaultView||window).getSelection(),n={anchorNode:n.anchorNode,anchorOffset:n.anchorOffset,focusNode:n.focusNode,focusOffset:n.focusOffset}),wl&&Vl(wl,n)||(wl=n,n=au(Th,"onSelect"),0<n.length&&(t=new lu("onSelect","select",null,t,a),e.push({event:t,listeners:n}),t.target=Xo)))}function Di(e,t){var a={};return a[e.toLowerCase()]=t.toLowerCase(),a["Webkit"+e]="webkit"+t,a["Moz"+e]="moz"+t,a}var Qo={animationend:Di("Animation","AnimationEnd"),animationiteration:Di("Animation","AnimationIteration"),animationstart:Di("Animation","AnimationStart"),transitionrun:Di("Transition","TransitionRun"),transitionstart:Di("Transition","TransitionStart"),transitioncancel:Di("Transition","TransitionCancel"),transitionend:Di("Transition","TransitionEnd")},jd={},Bv={};kn&&(Bv=document.createElement("div").style,"AnimationEvent"in window||(delete Qo.animationend.animation,delete Qo.animationiteration.animation,delete Qo.animationstart.animation),"TransitionEvent"in window||delete Qo.transitionend.transition);function no(e){if(jd[e])return jd[e];if(!Qo[e])return e;var t=Qo[e],a;for(a in t)if(t.hasOwnProperty(a)&&a in Bv)return jd[e]=t[a];return e}var Lv=no("animationend"),jv=no("animationiteration"),Gv=no("animationstart"),xN=no("transitionrun"),NN=no("transitionstart"),SN=no("transitioncancel"),Yv=no("transitionend"),Xv=new Map,Eh="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");Eh.push("scrollEnd");function Ya(e,t){Xv.set(e,t),ao(t,[e])}var TN=0;function En(e,t){if(e.name!=null&&e.name!=="auto")return e.name;if(t.autoName!==null)return t.autoName;e=Ga.identifierPrefix;var a=TN++;return e="_"+e+"t_"+a.toString(32)+"_",t.autoName=e}function Xf(e){if(e==null||typeof e=="string")return e;var t=null,a=sr;if(a!==null)for(var n=0;n<a.length;n++){var o=e[a[n]];if(o!=null){if(o==="none")return"none";t=t==null?o:t+(" "+o)}}return t??e.default}function On(e,t){return e=Xf(e),t=Xf(t),t==null?e==="auto"?null:e:t==="auto"?null:t}var Dc=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)},$a=[],Zo=0,Rm=0;function uu(){for(var e=Zo,t=Rm=Zo=0;t<e;){var a=$a[t];$a[t++]=null;var n=$a[t];$a[t++]=null;var o=$a[t];$a[t++]=null;var l=$a[t];if($a[t++]=null,n!==null&&o!==null){var c=n.pending;c===null?o.next=o:(o.next=c.next,c.next=o),n.pending=o}l!==0&&Qv(a,o,l)}}function du(e,t,a,n){$a[Zo++]=e,$a[Zo++]=t,$a[Zo++]=a,$a[Zo++]=n,Rm|=n,e.lanes|=n,e=e.alternate,e!==null&&(e.lanes|=n)}function Mm(e,t,a,n){return du(e,t,a,n),_c(e)}function io(e,t){return du(e,null,null,t),_c(e)}function Qv(e,t,a){e.lanes|=a;var n=e.alternate;n!==null&&(n.lanes|=a);for(var o=!1,l=e.return;l!==null;)l.childLanes|=a,n=l.alternate,n!==null&&(n.childLanes|=a),l.tag===22&&(e=l.stateNode,e===null||e._visibility&1||(o=!0)),e=l,l=l.return;return e.tag===3?(l=e.stateNode,o&&t!==null&&(o=31-ua(a),e=l.hiddenUpdates,n=e[o],n===null?e[o]=[t]:n.push(t),t.lane=a|536870912),l):null}function _c(e){if(50<zl)throw zl=0,Sc=null,Error(R(185));for(var t=e.return;t!==null;)e=t,t=e.return;return e.tag===3?e.stateNode:null}var Ko={};function kN(e,t,a,n){this.tag=e,this.key=a,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=n,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Jt(e,t,a,n){return new kN(e,t,a,n)}function Om(e){return e=e.prototype,!(!e||!e.isReactComponent)}function Sn(e,t){var a=e.alternate;return a===null?(a=Jt(e.tag,t,e.key,e.mode),a.elementType=e.elementType,a.type=e.type,a.stateNode=e.stateNode,a.alternate=e,e.alternate=a):(a.pendingProps=t,a.type=e.type,a.flags=0,a.subtreeFlags=0,a.deletions=null),a.flags=e.flags&1206910976,a.childLanes=e.childLanes,a.lanes=e.lanes,a.child=e.child,a.memoizedProps=e.memoizedProps,a.memoizedState=e.memoizedState,a.updateQueue=e.updateQueue,t=e.dependencies,a.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},a.sibling=e.sibling,a.index=e.index,a.ref=e.ref,a.refCleanup=e.refCleanup,a}function Zv(e,t){e.flags&=1206910978;var a=e.alternate;return a===null?(e.childLanes=0,e.lanes=t,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=a.childLanes,e.lanes=a.lanes,e.child=a.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=a.memoizedProps,e.memoizedState=a.memoizedState,e.updateQueue=a.updateQueue,e.type=a.type,t=a.dependencies,e.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),e}function gc(e,t,a,n,o,l){var c=0;if(n=e,typeof n=="function")Om(n)&&(c=1);else if(typeof n=="string")c=P5(e,a,cn.current)?26:e==="html"||e==="head"||e==="body"?27:5;else e:switch(n){case ph:return e=Jt(31,a,t,o),e.elementType=ph,e.lanes=l,e;case Lo:return ji(a.children,o,l,t);case dv:c=8,o|=24;break;case dh:return e=Jt(12,a,t,o|2),e.elementType=dh,e.lanes=l,e;case hh:return e=Jt(13,a,t,o),e.elementType=hh,e.lanes=l,e;case mh:return e=Jt(19,a,t,o),e.elementType=mh,e.lanes=l,e;case mx:case gh:return e=o|32,e=Jt(30,a,t,e),e.elementType=gh,e.lanes=l,e.stateNode={autoName:null,paired:null,clones:null,ref:null},e;default:if(typeof n=="object"&&n!==null)switch(n.$$typeof){case on:c=10;break e;case hv:c=9;break e;case wm:c=11;break e;case $m:c=14;break e;case Qn:c=16,n=null;break e}c=29,a=Error(R(130,e===null?"null":typeof e,"")),n=null}return t=Jt(c,a,t,o),t.elementType=e,t.type=n,t.lanes=l,t}function ji(e,t,a,n){return e=Jt(7,e,n,t),e.lanes=a,e}function Gd(e,t,a){return e=Jt(6,e,null,t),e.lanes=a,e}function Kv(e){var t=Jt(18,null,null,0);return t.stateNode=e,t}function Yd(e,t,a){return t=Jt(4,e.children!==null?e.children:[],e.key,t),t.lanes=a,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}var Qf=new WeakMap;function Ta(e,t){if(typeof e=="object"&&e!==null){var a=Qf.get(e);return a!==void 0?a:(t={value:e,source:t,stack:Tf(t)},Qf.set(e,t),t)}return{value:e,source:t,stack:Tf(t)}}var Jo=[],Fo=0,Hc=null,Dl=0,xa=[],Na=0,hi=null,ln=1,sn="";function xn(e,t){Jo[Fo++]=Dl,Jo[Fo++]=Hc,Hc=e,Dl=t}function Jv(e,t,a){xa[Na++]=ln,xa[Na++]=sn,xa[Na++]=hi,hi=e;var n=ln;e=sn;var o=32-ua(n)-1;n&=~(1<<o),a+=1;var l=32-ua(t)+o;if(30<l){var c=o-o%5;l=(n&(1<<c)-1).toString(32),n>>=c,o-=c,ln=1<<32-ua(t)+o|a<<o|n,sn=l+e}else ln=1<<l|a<<o|n,sn=e}function hu(e){e.return!==null&&(xn(e,1),Jv(e,1,0))}function Vm(e){for(;e===Hc;)Hc=Jo[--Fo],Jo[Fo]=null,Dl=Jo[--Fo],Jo[Fo]=null;for(;e===hi;)hi=xa[--Na],xa[Na]=null,sn=xa[--Na],xa[Na]=null,ln=xa[--Na],xa[Na]=null}function Fv(e,t){xa[Na++]=ln,xa[Na++]=sn,xa[Na++]=hi,ln=t.id,sn=t.overflow,hi=e}var vt=null,Ie=null,re=!1,ni=null,ka=!1,Ch=Error(R(519));function mi(e){var t=Error(R(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw _l(Ta(t,e)),Ch}function Zf(e){var t=e.stateNode,a=e.type,n=e.memoizedProps;switch(t[xt]=e,t[Wt]=n,a){case"dialog":de("cancel",t),de("close",t);break;case"iframe":case"object":case"embed":de("load",t);break;case"video":case"audio":for(a=0;a<ql.length;a++)de(ql[a],t);break;case"source":de("error",t);break;case"img":case"image":case"link":de("error",t),de("load",t);break;case"details":de("toggle",t);break;case"input":de("invalid",t),Ev(t,n.value,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name,!0);break;case"select":de("invalid",t);break;case"textarea":de("invalid",t),Av(t,n.value,n.defaultValue,n.children)}a=n.children,typeof a!="string"&&typeof a!="number"&&typeof a!="bigint"||t.textContent===""+a||n.suppressHydrationWarning===!0||Ow(t.textContent,a)?(n.popover!=null&&(de("beforetoggle",t),de("toggle",t)),n.onScroll!=null&&de("scroll",t),n.onScrollEnd!=null&&de("scrollend",t),n.onClick!=null&&(t.onclick=rn),t=!0):t=!1,t||mi(e,!0)}function Ic(e){for(vt=e.return;vt;)switch(vt.tag){case 5:case 31:case 13:ka=!1;return;case 27:case 3:ka=!0;return;default:vt=vt.return}}function _o(e){if(e!==vt)return!1;if(!re)return Ic(e),re=!0,!1;var t=e.tag,a;if((a=t!==3&&t!==27)&&((a=t===5)&&(a=e.type,a=!(a!=="form"&&a!=="button")||hm(e.type,e.memoizedProps)),a=!a),a&&Ie&&mi(e),Ic(e),t===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(R(317));Ie=Gb(e)}else if(t===31){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(R(317));Ie=Gb(e)}else t===27?(t=Ie,vi(e.type)?(e=fm,fm=null,Ie=e):Ie=t):Ie=vt?Ea(e.stateNode.nextSibling):null;return!0}function Qi(){Ie=vt=null,re=!1}function Xd(){var e=ni;return e!==null&&(Zt===null?Zt=e:Zt.push.apply(Zt,e),ni=null),e}function _l(e){ni===null?ni=[e]:ni.push(e)}var Ah=hn(null),oo=null,Nn=null;function Pn(e,t,a){Ue(Ah,t._currentValue),t._currentValue=a}function Tn(e){e._currentValue=Ah.current,St(Ah)}function fc(e,t,a){for(;e!==null;){var n=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,n!==null&&(n.childLanes|=t)):n!==null&&(n.childLanes&t)!==t&&(n.childLanes|=t),e===a)break;e=e.return}}function zh(e,t,a,n){var o=e.child;for(o!==null&&(o.return=e);o!==null;){var l=o.dependencies;if(l!==null){var c=o.child;l=l.firstContext;e:for(;l!==null;){var u=l;l=o;for(var h=0;h<t.length;h++)if(u.context===t[h]){l.lanes|=a,u=l.alternate,u!==null&&(u.lanes|=a),fc(l.return,a,e),n||(c=null);break e}l=u.next}}else if(o.tag===18){if(c=o.return,c===null)throw Error(R(341));c.lanes|=a,l=c.alternate,l!==null&&(l.lanes|=a),fc(c,a,e),c=null}else o.tag===13&&o.memoizedState!==null&&o.memoizedState.dehydrated===null?(o.lanes|=a,c=o.alternate,c!==null&&(c.lanes|=a),fc(o.return,a,e),c=o.child,c=c!==null?c.sibling:null):c=o.child;if(c!==null)c.return=o;else for(c=o;c!==null;){if(c===e){c=null;break}if(o=c.sibling,o!==null){o.return=c.return,c=o;break}c=c.return}o=c}}function Zi(e,t,a,n){e=null;for(var o=t,l=!1;o!==null;){if(!l){if((o.flags&524288)!==0)l=!0;else if((o.flags&262144)!==0)break}if(o.tag===10){var c=o.alternate;if(c===null)throw Error(R(387));if(c=c.memoizedProps,c!==null){var u=o.type;ha(o.pendingProps.value,c.value)||(e!==null?e.push(u):e=[u])}}else if(o===zc.current){if(c=o.alternate,c===null)throw Error(R(387));c.memoizedState.memoizedState!==o.memoizedState.memoizedState&&(e!==null?e.push(yr):e=[yr])}o=o.return}return e!==null&&zh(t,e,a,n),t.flags|=262144,e!==null}function Uc(e){for(e=e.firstContext;e!==null;){if(!ha(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function Ki(e){oo=e,Nn=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function Nt(e){return Pv(oo,e)}function Ps(e,t){return oo===null&&Ki(e),Pv(e,t)}function Pv(e,t){var a=t._currentValue;if(t={context:t,memoizedValue:a,next:null},Nn===null){if(e===null)throw Error(R(308));Nn=t,e.dependencies={lanes:0,firstContext:t},e.flags|=524288}else Nn=Nn.next=t;return a}var EN=typeof AbortController<"u"?AbortController:function(){var e=[],t=this.signal={aborted:!1,addEventListener:function(a,n){e.push(n)}};this.abort=function(){t.aborted=!0,e.forEach(function(a){return a()})}},CN=dt.unstable_scheduleCallback,AN=dt.unstable_NormalPriority,tt={$$typeof:on,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function Dm(){return{controller:new EN,data:new Map,refCount:0}}function Wl(e){e.refCount--,e.refCount===0&&CN(AN,function(){e.controller.abort()})}function Kf(e,t){if((e.pendingLanes&4194048)!==0){var a=e.transitionTypes;for(a===null&&(a=e.transitionTypes=[]),e=0;e<t.length;e++){var n=t[e];a.indexOf(n)===-1&&a.push(n)}}}var fl=null;function zN(e){var t=e.transitionTypes;return e.transitionTypes=null,t}var $l=null,Rh=0,Ji=0,ar=null;function RN(e,t){if($l===null){var a=$l=[];Rh=0,Ji=cp(),ar={status:"pending",value:void 0,then:function(n){a.push(n)}}}return Rh++,t.then(Jf,Jf),t}function Jf(){if(--Rh===0&&(fl=null,$l!==null)){ar!==null&&(ar.status="fulfilled");var e=$l;$l=null,Ji=0,ar=null;for(var t=0;t<e.length;t++)(0,e[t])()}}function MN(e,t){var a=[],n={status:"pending",value:null,reason:null,then:function(o){a.push(o)}};return e.then(function(){n.status="fulfilled",n.value=t;for(var o=0;o<a.length;o++)(0,a[o])(t)},function(o){for(n.status="rejected",n.reason=o,o=0;o<a.length;o++)(0,a[o])(void 0)}),n}var Ff=W.S;W.S=function(e,t){if(fw=sa(),typeof t=="object"&&t!==null&&typeof t.then=="function"&&RN(e,t),fl!==null)for(var a=fr;a!==null;)Kf(a,fl),a=a.next;if(a=e.types,a!==null){for(var n=fr;n!==null;)Kf(n,a),n=n.next;if(Ji!==0){n=fl,n===null&&(n=fl=[]);for(var o=0;o<a.length;o++){var l=a[o];n.indexOf(l)===-1&&n.push(l)}}}Ff!==null&&Ff(e,t)};var Gi=hn(null);function _m(){var e=Gi.current;return e!==null?e:Oe.pooledCache}function bc(e,t){t===null?Ue(Gi,Gi.current):Ue(Gi,t.pool)}function Wv(){var e=_m();return e===null?null:{parent:tt._currentValue,pool:e}}var Sr=Error(R(460)),Hm=Error(R(474)),mu=Error(R(542)),qc={then:function(){}};function Pf(e){return e=e.status,e==="fulfilled"||e==="rejected"}function ey(e,t,a){switch(a=e[a],a===void 0?e.push(t):a!==t&&(t.then(rn,rn),t=a),t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,eb(e),e===void 0&&!("reason"in t)?Error(R(600)):e;default:if(typeof t.status=="string")t.then(rn,rn);else{if(e=Oe,e!==null&&100<e.shellSuspendCounter)throw Error(R(482));e=t,e.status="pending",e.then(function(n){if(t.status==="pending"){var o=t;o.status="fulfilled",o.value=n}},function(n){if(t.status==="pending"){var o=t;o.status="rejected",o.reason=n}})}switch(t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,eb(e),e}throw Yi=t,Sr}}function Ii(e){try{var t=e._init;return t(e._payload)}catch(a){throw a!==null&&typeof a=="object"&&typeof a.then=="function"?(Yi=a,Sr):a}}var Yi=null;function Wf(){if(Yi===null)throw Error(R(459));var e=Yi;return Yi=null,e}function eb(e){if(e===Sr||e===mu)throw Error(R(483))}var nr=null,Hl=0;function Ws(e){var t=Hl;return Hl+=1,nr===null&&(nr=[]),ey(nr,e,t)}function Gn(e,t){t=t.props.ref,e.ref=t!==void 0?t:null}function ec(e,t){throw t.$$typeof===hx?Error(R(525)):(e=Object.prototype.toString.call(t),Error(R(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)))}function ty(e){function t(w,y){if(e){var v=w.deletions;v===null?(w.deletions=[y],w.flags|=16):v.push(y)}}function a(w,y){if(!e)return null;for(;y!==null;)t(w,y),y=y.sibling;return null}function n(w){for(var y=new Map;w!==null;)w.key===null?y.set(w.index,w):y.set(w.key,w),w=w.sibling;return y}function o(w,y){return w=Sn(w,y),w.index=0,w.sibling=null,w}function l(w,y,v){return w.index=v,e?(v=w.alternate,v!==null?(v=v.index,v<y?(w.flags|=2,y):v):(w.flags|=134217730,y)):(w.flags|=1048576,y)}function c(w){return e&&w.alternate===null&&(w.flags|=134217730),w}function u(w,y,v,S){return y===null||y.tag!==6?(y=Gd(v,w.mode,S),y.return=w,y):(y=o(y,v),y.return=w,y)}function h(w,y,v,S){var O=v.type;return O===Lo?(w=$(w,y,v.props.children,S,v.key),Gn(w,v),w):y!==null&&(y.elementType===O||typeof O=="object"&&O!==null&&O.$$typeof===Qn&&Ii(O)===y.type)?(y=o(y,v.props),Gn(y,v),y.return=w,y):(y=gc(v.type,v.key,v.props,null,w.mode,S),Gn(y,v),y.return=w,y)}function g(w,y,v,S){return y===null||y.tag!==4||y.stateNode.containerInfo!==v.containerInfo||y.stateNode.implementation!==v.implementation?(y=Yd(v,w.mode,S),y.return=w,y):(y=o(y,v.children||[]),y.return=w,y)}function $(w,y,v,S,O){return y===null||y.tag!==7?(y=ji(v,w.mode,S,O),y.return=w,y):(y=o(y,v),y.return=w,y)}function x(w,y,v){if(typeof y=="string"&&y!==""||typeof y=="number"||typeof y=="bigint")return y=Gd(""+y,w.mode,v),y.return=w,y;if(typeof y=="object"&&y!==null){switch(y.$$typeof){case Gs:return v=gc(y.type,y.key,y.props,null,w.mode,v),Gn(v,y),v.return=w,v;case ml:return y=Yd(y,w.mode,v),y.return=w,y;case Qn:return y=Ii(y),x(w,y,v)}if(pl(y)||ll(y))return y=ji(y,w.mode,v,null),y.return=w,y;if(typeof y.then=="function")return x(w,Ws(y),v);if(y.$$typeof===on)return x(w,Ps(w,y),v);ec(w,y)}return null}function f(w,y,v,S){var O=y!==null?y.key:null;if(typeof v=="string"&&v!==""||typeof v=="number"||typeof v=="bigint")return O!==null?null:u(w,y,""+v,S);if(typeof v=="object"&&v!==null){switch(v.$$typeof){case Gs:return v.key===O?h(w,y,v,S):null;case ml:return v.key===O?g(w,y,v,S):null;case Qn:return v=Ii(v),f(w,y,v,S)}if(pl(v)||ll(v))return O!==null?null:$(w,y,v,S,null);if(typeof v.then=="function")return f(w,y,Ws(v),S);if(v.$$typeof===on)return f(w,y,Ps(w,v),S);ec(w,v)}return null}function b(w,y,v,S,O){if(typeof S=="string"&&S!==""||typeof S=="number"||typeof S=="bigint")return w=w.get(v)||null,u(y,w,""+S,O);if(typeof S=="object"&&S!==null){switch(S.$$typeof){case Gs:return w=w.get(S.key===null?v:S.key)||null,h(y,w,S,O);case ml:return w=w.get(S.key===null?v:S.key)||null,g(y,w,S,O);case Qn:return S=Ii(S),b(w,y,v,S,O)}if(pl(S)||ll(S))return w=w.get(v)||null,$(y,w,S,O,null);if(typeof S.then=="function")return b(w,y,v,Ws(S),O);if(S.$$typeof===on)return b(w,y,v,Ps(y,S),O);ec(y,S)}return null}function C(w,y,v,S){for(var O=null,P=null,H=y,L=y=0,be=null;H!==null&&L<v.length;L++){H.index>L?(be=H,H=null):be=H.sibling;var Y=f(w,H,v[L],S);if(Y===null){H===null&&(H=be);break}e&&H&&Y.alternate===null&&t(w,H),y=l(Y,y,L),P===null?O=Y:P.sibling=Y,P=Y,H=be}if(L===v.length)return a(w,H),re&&xn(w,L),O;if(H===null){for(;L<v.length;L++)H=x(w,v[L],S),H!==null&&(y=l(H,y,L),P===null?O=H:P.sibling=H,P=H);return re&&xn(w,L),O}for(H=n(H);L<v.length;L++)be=b(H,w,L,v[L],S),be!==null&&(e&&(Y=be.alternate,Y!==null&&H.delete(Y.key===null?L:Y.key)),y=l(be,y,L),P===null?O=be:P.sibling=be,P=be);return e&&H.forEach(function(De){return t(w,De)}),re&&xn(w,L),O}function k(w,y,v,S){if(v==null)throw Error(R(151));for(var O=null,P=null,H=y,L=y=0,be=null,Y=v.next();H!==null&&!Y.done;L++,Y=v.next()){H.index>L?(be=H,H=null):be=H.sibling;var De=f(w,H,Y.value,S);if(De===null){H===null&&(H=be);break}e&&H&&De.alternate===null&&t(w,H),y=l(De,y,L),P===null?O=De:P.sibling=De,P=De,H=be}if(Y.done)return a(w,H),re&&xn(w,L),O;if(H===null){for(;!Y.done;L++,Y=v.next())Y=x(w,Y.value,S),Y!==null&&(y=l(Y,y,L),P===null?O=Y:P.sibling=Y,P=Y);return re&&xn(w,L),O}for(H=n(H);!Y.done;L++,Y=v.next())Y=b(H,w,L,Y.value,S),Y!==null&&(e&&(be=Y.alternate,be!==null&&H.delete(be.key===null?L:be.key)),y=l(Y,y,L),P===null?O=Y:P.sibling=Y,P=Y);return e&&H.forEach(function(it){return t(w,it)}),re&&xn(w,L),O}function M(w,y,v,S){if(typeof v=="object"&&v!==null&&v.type===Lo&&v.key===null&&v.props.ref===void 0&&(v=v.props.children),typeof v=="object"&&v!==null){switch(v.$$typeof){case Gs:e:{for(var O=v.key;y!==null;){if(y.key===O){if(O=v.type,O===Lo){if(y.tag===7){a(w,y.sibling),S=o(y,v.props.children),Gn(S,v),S.return=w,w=S;break e}}else if(y.elementType===O||typeof O=="object"&&O!==null&&O.$$typeof===Qn&&Ii(O)===y.type){a(w,y.sibling),S=o(y,v.props),Gn(S,v),S.return=w,w=S;break e}a(w,y);break}else t(w,y);y=y.sibling}v.type===Lo?(S=ji(v.props.children,w.mode,S,v.key),Gn(S,v),S.return=w,w=S):(S=gc(v.type,v.key,v.props,null,w.mode,S),Gn(S,v),S.return=w,w=S)}return c(w);case ml:e:{for(O=v.key;y!==null;){if(y.key===O)if(y.tag===4&&y.stateNode.containerInfo===v.containerInfo&&y.stateNode.implementation===v.implementation){a(w,y.sibling),S=o(y,v.children||[]),S.return=w,w=S;break e}else{a(w,y);break}else t(w,y);y=y.sibling}S=Yd(v,w.mode,S),S.return=w,w=S}return c(w);case Qn:return v=Ii(v),M(w,y,v,S)}if(pl(v))return C(w,y,v,S);if(ll(v)){if(O=ll(v),typeof O!="function")throw Error(R(150));return v=O.call(v),k(w,y,v,S)}if(typeof v.then=="function")return M(w,y,Ws(v),S);if(v.$$typeof===on)return M(w,y,Ps(w,v),S);ec(w,v)}return typeof v=="string"&&v!==""||typeof v=="number"||typeof v=="bigint"?(v=""+v,y!==null&&y.tag===6?(a(w,y.sibling),S=o(y,v),S.return=w,w=S):(a(w,y),S=Gd(v,w.mode,S),S.return=w,w=S),c(w)):a(w,y)}return function(w,y,v,S){try{Hl=0;var O=M(w,y,v,S);return nr=null,O}catch(H){if(H===Sr||H===mu)throw H;var P=Jt(29,H,null,w.mode);return P.lanes=S,P.return=w,P}}}var Fi=ty(!0),ay=ty(!1),Zn=!1;function Im(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function Mh(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function ii(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function oi(e,t,a){var n=e.updateQueue;if(n===null)return null;if(n=n.shared,($e&2)!==0){var o=n.pending;return o===null?t.next=t:(t.next=o.next,o.next=t),n.pending=t,t=_c(e),Qv(e,null,a),t}return du(e,n,t,a),_c(e)}function xl(e,t,a){if(t=t.updateQueue,t!==null&&(t=t.shared,(a&4194048)!==0)){var n=t.lanes;n&=e.pendingLanes,a|=n,t.lanes=a,yv(e,a)}}function Qd(e,t){var a=e.updateQueue,n=e.alternate;if(n!==null&&(n=n.updateQueue,a===n)){var o=null,l=null;if(a=a.firstBaseUpdate,a!==null){do{var c={lane:a.lane,tag:a.tag,payload:a.payload,callback:null,next:null};l===null?o=l=c:l=l.next=c,a=a.next}while(a!==null);l===null?o=l=t:l=l.next=t}else o=l=t;a={baseState:n.baseState,firstBaseUpdate:o,lastBaseUpdate:l,shared:n.shared,callbacks:n.callbacks},e.updateQueue=a;return}e=a.lastBaseUpdate,e===null?a.firstBaseUpdate=t:e.next=t,a.lastBaseUpdate=t}var Oh=!1;function Nl(){if(Oh){var e=ar;if(e!==null)throw e}}function Sl(e,t,a,n){Oh=!1;var o=e.updateQueue;Zn=!1;var l=o.firstBaseUpdate,c=o.lastBaseUpdate,u=o.shared.pending;if(u!==null){o.shared.pending=null;var h=u,g=h.next;h.next=null,c===null?l=g:c.next=g,c=h;var $=e.alternate;$!==null&&($=$.updateQueue,u=$.lastBaseUpdate,u!==c&&(u===null?$.firstBaseUpdate=g:u.next=g,$.lastBaseUpdate=h))}if(l!==null){var x=o.baseState;c=0,$=g=h=null,u=l;do{var f=u.lane&-536870913,b=f!==u.lane;if(b?(me&f)===f:(n&f)===f){f!==0&&f===Ji&&(Oh=!0),$!==null&&($=$.next={lane:0,tag:u.tag,payload:u.payload,callback:null,next:null});e:{var C=e,k=u;f=t;var M=a;switch(k.tag){case 1:if(C=k.payload,typeof C=="function"){x=C.call(M,x,f);break e}x=C;break e;case 3:C.flags=C.flags&-65537|128;case 0:if(C=k.payload,f=typeof C=="function"?C.call(M,x,f):C,f==null)break e;x=Ve({},x,f);break e;case 2:Zn=!0}}f=u.callback,f!==null&&(e.flags|=64,b&&(e.flags|=8192),b=o.callbacks,b===null?o.callbacks=[f]:b.push(f))}else b={lane:f,tag:u.tag,payload:u.payload,callback:u.callback,next:null},$===null?(g=$=b,h=x):$=$.next=b,c|=f;if(u=u.next,u===null){if(u=o.shared.pending,u===null)break;b=u,u=b.next,b.next=null,o.lastBaseUpdate=b,o.shared.pending=null}}while(!0);$===null&&(h=x),o.baseState=h,o.firstBaseUpdate=g,o.lastBaseUpdate=$,l===null&&(o.shared.lanes=0),fi|=c,e.lanes=c,e.memoizedState=x}}function ny(e,t){if(typeof e!="function")throw Error(R(191,e));e.call(t)}function iy(e,t){var a=e.callbacks;if(a!==null)for(e.callbacks=null,e=0;e<a.length;e++)ny(a[e],t)}var pi=hn(null),Bc=hn(0);function tb(e,t){e=Rn,Ue(Bc,e),Ue(pi,t),Rn=e|t.baseLanes}function Vh(){Ue(Bc,Rn),Ue(pi,pi.current)}function Um(){Rn=Bc.current,St(pi),St(Bc)}var Et=hn(null),Mt=null;function ri(e){var t=e.alternate;Ue(Tt,Tt.current&1),Ue(Et,e),Mt===null&&(t===null||pi.current!==null||t.memoizedState!==null)&&(Mt=e)}function Dh(e){Ue(Tt,Tt.current),Ue(Et,e),Mt===null&&(Mt=e)}function oy(e){e.tag===22?(Ue(Tt,Tt.current),Ue(Et,e),Mt===null&&(Mt=e)):li()}function li(){Ue(Tt,Tt.current),Ue(Et,Et.current)}function oa(e){St(Et),Mt===e&&(Mt=null),St(Tt)}var Tt=hn(0);function Il(e,t){Ue(Et,Et.current),Ue(Tt,t)}function qm(e){St(Tt),St(Et),Mt===e&&(Mt=null)}function Lc(e){for(var t=e;t!==null;){if(t.tag===13){var a=t.memoizedState;if(a!==null&&(a=a.dehydrated,a===null||gm(a)||mp(a)))return t}else if(t.tag===19&&t.memoizedProps.revealOrder!=="independent"){if((t.flags&128)!==0)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var Cn=0,ne=null,Re=null,et=null,jc=!1,ir=!1,Pi=!1,Gc=0,Ul=0,or=null,ON=0;function Ke(){throw Error(R(321))}function Bm(e,t){if(t===null)return!1;for(var a=0;a<t.length&&a<e.length;a++)if(!ha(e[a],t[a]))return!1;return!0}function Lm(e,t,a,n,o,l){return Cn=l,ne=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,W.H=e===null||e.memoizedState===null?_y:Hy,Pi=!1,l=a(n,o),Pi=!1,ir&&(l=ly(t,a,n,o)),ry(e),l}function ry(e){W.H=Yc;var t=Re!==null&&Re.next!==null;if(Cn=0,et=Re=ne=null,jc=!1,Ul=0,or=null,t)throw Error(R(300));e===null||at||(e=e.dependencies,e!==null&&Uc(e)&&(at=!0))}function ly(e,t,a,n){ne=e;var o=0;do{if(ir&&(or=null),Ul=0,ir=!1,25<=o)throw Error(R(301));if(o+=1,et=Re=null,e.updateQueue!=null){var l=e.updateQueue;l.lastEffect=null,l.events=null,l.stores=null,l.memoCache!=null&&(l.memoCache.index=0)}W.H=BN,l=t(a,n)}while(ir);return l}function VN(){var e=W.H,t=e.useState()[0];return t=typeof t.then=="function"?es(t):t,e=e.useState()[0],(Re!==null?Re.memoizedState:null)!==e&&(ne.flags|=1024),t}function jm(){var e=Gc!==0;return Gc=0,e}function Gm(e,t,a){t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~a}function Ym(e){if(jc){for(e=e.memoizedState;e!==null;){var t=e.queue;t!==null&&(t.pending=null),e=e.next}jc=!1}Cn=0,et=Re=ne=null,ir=!1,Ul=Gc=0,or=null}function Lt(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return et===null?ne.memoizedState=et=e:et=et.next=e,et}function Fe(){if(Re===null){var e=ne.alternate;e=e!==null?e.memoizedState:null}else e=Re.next;var t=et===null?ne.memoizedState:et.next;if(t!==null)et=t,Re=e;else{if(e===null)throw ne.alternate===null?Error(R(467)):Error(R(310));Re=e,e={memoizedState:Re.memoizedState,baseState:Re.baseState,baseQueue:Re.baseQueue,queue:Re.queue,next:null},et===null?ne.memoizedState=et=e:et=et.next=e}return et}function pu(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function es(e){var t=Ul;return Ul+=1,or===null&&(or=[]),e=ey(or,e,t),t=ne,(et===null?t.memoizedState:et.next)===null&&(t=t.alternate,W.H=t===null||t.memoizedState===null?_y:Hy),e}function gu(e){if(e!==null&&typeof e=="object"){if(typeof e.then=="function")return es(e);if(e.$$typeof===gx)return;if(e.$$typeof===on)return Nt(e)}throw Error(R(438,String(e)))}function Xm(e){var t=null,a=ne.updateQueue;if(a!==null&&(t=a.memoCache),t==null){var n=ne.alternate;n!==null&&(n=n.updateQueue,n!==null&&(n=n.memoCache,n!=null&&(t={data:n.data.map(function(o){return o.slice()}),index:0})))}if(t==null&&(t={data:[],index:0}),a===null&&(a=pu(),ne.updateQueue=a),a.memoCache=t,a=t.data[t.index],a===void 0)for(a=t.data[t.index]=Array(e),n=0;n<e;n++)a[n]=px;return t.index++,a}function An(e,t){return typeof t=="function"?t(e):t}function vc(e){var t=Fe();return Qm(t,Re,e)}function Qm(e,t,a){var n=e.queue;if(n===null)throw Error(R(311));n.lastRenderedReducer=a;var o=e.baseQueue,l=n.pending;if(l!==null){if(o!==null){var c=o.next;o.next=l.next,l.next=c}t.baseQueue=o=l,n.pending=null}if(l=e.baseState,o===null)e.memoizedState=l;else{t=o.next;var u=c=null,h=null,g=t,$=!1;do{var x=g.lane&-536870913;if(x!==g.lane?(me&x)===x:(Cn&x)===x){var f=g.revertLane;if(f===0)h!==null&&(h=h.next={lane:0,revertLane:0,gesture:null,action:g.action,hasEagerState:g.hasEagerState,eagerState:g.eagerState,next:null}),x===Ji&&($=!0);else if((Cn&f)===f){g=g.next,f===Ji&&($=!0);continue}else x={lane:0,revertLane:g.revertLane,gesture:null,action:g.action,hasEagerState:g.hasEagerState,eagerState:g.eagerState,next:null},h===null?(u=h=x,c=l):h=h.next=x,ne.lanes|=f,fi|=f;x=g.action,Pi&&a(l,x),l=g.hasEagerState?g.eagerState:a(l,x)}else f={lane:x,revertLane:g.revertLane,gesture:g.gesture,action:g.action,hasEagerState:g.hasEagerState,eagerState:g.eagerState,next:null},h===null?(u=h=f,c=l):h=h.next=f,ne.lanes|=x,fi|=x;g=g.next}while(g!==null&&g!==t);if(h===null?c=l:h.next=u,!ha(l,e.memoizedState)&&(at=!0,$&&(a=ar,a!==null)))throw a;e.memoizedState=l,e.baseState=c,e.baseQueue=h,n.lastRenderedState=l}return o===null&&(n.lanes=0),[e.memoizedState,n.dispatch]}function Zd(e){var t=Fe(),a=t.queue;if(a===null)throw Error(R(311));a.lastRenderedReducer=e;var n=a.dispatch,o=a.pending,l=t.memoizedState;if(o!==null){a.pending=null;var c=o=o.next;do l=e(l,c.action),c=c.next;while(c!==o);ha(l,t.memoizedState)||(at=!0),t.memoizedState=l,t.baseQueue===null&&(t.baseState=l),a.lastRenderedState=l}return[l,n]}function sy(e,t,a){var n=ne,o=Fe(),l=re;if(l){if(a===void 0)throw Error(R(407));a=a()}else a=t();var c=!ha((Re||o).memoizedState,a);if(c&&(o.memoizedState=a,at=!0),o=o.queue,Zm(dy.bind(null,n,o,e),[e]),e=o.getSnapshot!==t||c||et!==null&&(et.memoizedState.tag&1)!==0,hr(e?9:8,{destroy:void 0},uy.bind(null,n,o,a,t),null),e){if(n.flags|=2048,Oe===null)throw Error(R(349));l||(Cn&127)!==0||cy(n,t,a)}return a}function cy(e,t,a){e.flags|=16384,e={getSnapshot:t,value:a},t=ne.updateQueue,t===null?(t=pu(),ne.updateQueue=t,t.stores=[e]):(a=t.stores,a===null?t.stores=[e]:a.push(e))}function uy(e,t,a,n){t.value=a,t.getSnapshot=n,hy(t)&&my(e)}function dy(e,t,a){return a(function(){hy(t)&&my(e)})}function hy(e){var t=e.getSnapshot;e=e.value;try{var a=t();return!ha(e,a)}catch{return!0}}function my(e){var t=io(e,2);t!==null&&Ft(t,e,2)}function _h(e){var t=Lt();if(typeof e=="function"){var a=e;if(e=a(),Pi){Jn(!0);try{a()}finally{Jn(!1)}}}return t.memoizedState=t.baseState=e,t.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:An,lastRenderedState:e},t}function py(e,t,a,n){return e.baseState=a,Qm(e,Re,typeof n=="function"?n:An)}function DN(e,t,a,n,o){if(bu(e))throw Error(R(485));if(e=t.action,e!==null){var l={payload:o,action:e,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(c){l.listeners.push(c)}};W.T!==null?a(!0):l.isTransition=!1,n(l),a=t.pending,a===null?(l.next=t.pending=l,gy(t,l)):(l.next=a.next,t.pending=a.next=l)}}function gy(e,t){var a=t.action,n=t.payload,o=e.state;if(t.isTransition){var l=W.T,c={};c.types=l!==null?l.types:null,W.T=c;try{var u=a(o,n),h=W.S;h!==null&&h(c,u),ab(e,t,u)}catch(g){Hh(e,t,g)}finally{l!==null&&c.types!==null&&(l.types=c.types),W.T=l}}else try{l=a(o,n),ab(e,t,l)}catch(g){Hh(e,t,g)}}function ab(e,t,a){a!==null&&typeof a=="object"&&typeof a.then=="function"?a.then(function(n){nb(e,t,n)},function(n){return Hh(e,t,n)}):nb(e,t,a)}function nb(e,t,a){t.status="fulfilled",t.value=a,fy(t),e.state=a,t=e.pending,t!==null&&(a=t.next,a===t?e.pending=null:(a=a.next,t.next=a,gy(e,a)))}function Hh(e,t,a){var n=e.pending;if(e.pending=null,n!==null){n=n.next;do t.status="rejected",t.reason=a,fy(t),t=t.next;while(t!==n)}e.action=null}function fy(e){e=e.listeners;for(var t=0;t<e.length;t++)(0,e[t])()}function by(e,t){return t}function ib(e,t){if(re){var a=Oe.formState;if(a!==null){e:{var n=ne;if(re){if(Ie){t:{for(var o=Ie,l=ka;o.nodeType!==8;){if(!l){o=null;break t}if(o=Ea(o.nextSibling),o===null){o=null;break t}}l=o.data,o=l==="F!"||l==="F"?o:null}if(o){Ie=Ea(o.nextSibling),n=o.data==="F!";break e}}mi(n)}n=!1}n&&(t=a[0])}}return a=Lt(),a.memoizedState=a.baseState=t,n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:by,lastRenderedState:t},a.queue=n,a=Oy.bind(null,ne,n),n.dispatch=a,n=_h(!1),l=Pm.bind(null,ne,!1,n.queue),n=Lt(),o={state:t,dispatch:null,action:e,pending:null},n.queue=o,a=DN.bind(null,ne,o,l,a),o.dispatch=a,n.memoizedState=e,[t,a,!1]}function ob(e){var t=Fe();return vy(t,Re,e)}function vy(e,t,a){if(t=Qm(e,t,by)[0],e=vc(An)[0],typeof t=="object"&&t!==null&&typeof t.then=="function")try{var n=es(t)}catch(c){throw c===Sr?mu:c}else n=t;t=Fe();var o=t.queue,l=o.dispatch;return a!==t.memoizedState&&(ne.flags|=2048,hr(9,{destroy:void 0},_N.bind(null,o,a),null)),[n,l,e]}function _N(e,t){e.action=t}function rb(e){var t=Fe(),a=Re;if(a!==null)return vy(t,a,e);Fe(),t=t.memoizedState,a=Fe();var n=a.queue.dispatch;return a.memoizedState=e,[t,n,!1]}function hr(e,t,a,n){return e={tag:e,create:a,deps:n,inst:t,next:null},t=ne.updateQueue,t===null&&(t=pu(),ne.updateQueue=t),a=t.lastEffect,a===null?t.lastEffect=e.next=e:(n=a.next,a.next=e,e.next=n,t.lastEffect=e),e}function yy(){return Fe().memoizedState}function yc(e,t,a,n){var o=Lt();ne.flags|=e,o.memoizedState=hr(1|t,{destroy:void 0},a,n===void 0?null:n)}function fu(e,t,a,n){var o=Fe();n=n===void 0?null:n;var l=o.memoizedState.inst;Re!==null&&n!==null&&Bm(n,Re.memoizedState.deps)?o.memoizedState=hr(t,l,a,n):(ne.flags|=e,o.memoizedState=hr(1|t,l,a,n))}function lb(e,t){yc(8390656,8,e,t)}function Zm(e,t){fu(2048,8,e,t)}function HN(e){ne.flags|=4;var t=ne.updateQueue;if(t===null)t=pu(),ne.updateQueue=t,t.events=[e];else{var a=t.events;a===null?t.events=[e]:a.push(e)}}function wy(e){var t=Fe().memoizedState;return HN({ref:t,nextImpl:e}),function(){if(($e&2)!==0)throw Error(R(440));return t.impl.apply(void 0,arguments)}}function $y(e,t){return fu(4,2,e,t)}function xy(e,t){return fu(4,4,e,t)}function Ny(e,t){if(typeof t=="function"){e=e();var a=t(e);return function(){typeof a=="function"?a():t(null)}}if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function Sy(e,t,a){a=a!=null?a.concat([e]):null,fu(4,4,Ny.bind(null,t,e),a)}function Km(){}function Ty(e,t){var a=Fe();t=t===void 0?null:t;var n=a.memoizedState;return t!==null&&Bm(t,n[1])?n[0]:(a.memoizedState=[e,t],e)}function ky(e,t){var a=Fe();t=t===void 0?null:t;var n=a.memoizedState;if(t!==null&&Bm(t,n[1]))return n[0];if(n=e(),Pi){Jn(!0);try{e()}finally{Jn(!1)}}return a.memoizedState=[n,t],n}function Jm(e,t,a){return a===void 0||(Cn&1073741824)!==0&&(me&261930)===0?e.memoizedState=t:(e.memoizedState=a,e=vw(),ne.lanes|=e,fi|=e,a)}function Ey(e,t,a,n){return ha(a,t)?a:pi.current!==null?(e=Jm(e,a,n),ha(e,t)||(at=!0),e):(Cn&106)===0||(Cn&1073741824)!==0&&(me&261930)===0?(at=!0,e.memoizedState=a):(e=vw(),ne.lanes|=e,fi|=e,t)}function Cy(e,t,a,n,o){var l=xe.p;xe.p=l!==0&&8>l?l:8;var c=W.T,u={};u.types=c!==null?c.types:null,W.T=u,Pm(e,!1,t,a);try{var h=o(),g=W.S;if(g!==null&&g(u,h),h!==null&&typeof h=="object"&&typeof h.then=="function"){var $=MN(h,n);Tl(e,t,$,da(e))}else Tl(e,t,n,da(e))}catch(x){Tl(e,t,{then:function(){},status:"rejected",reason:x},da())}finally{xe.p=l,c!==null&&u.types!==null&&(c.types=u.types),W.T=c}}function IN(){}function Ih(e,t,a,n){if(e.tag!==5)throw Error(R(476));var o=Ay(e).queue;Cy(e,o,t,Li,a===null?IN:function(){return zy(e),a(n)})}function Ay(e){var t=e.memoizedState;if(t!==null)return t;t={memoizedState:Li,baseState:Li,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:An,lastRenderedState:Li},next:null};var a={};return t.next={memoizedState:a,baseState:a,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:An,lastRenderedState:a},next:null},e.memoizedState=t,e=e.alternate,e!==null&&(e.memoizedState=t),t}function zy(e){var t=Ay(e);t.next===null&&(t=e.alternate.memoizedState),Tl(e,t.next.queue,{},da())}function Fm(){return Nt(yr)}function Ry(){return Fe().memoizedState}function My(){return Fe().memoizedState}function UN(e){for(var t=e.return;t!==null;){switch(t.tag){case 24:case 3:var a=da();e=ii(a);var n=oi(t,e,a);n!==null&&(Ft(n,t,a),xl(n,t,a)),t={cache:Dm()},e.payload=t;return}t=t.return}}function qN(e,t,a){var n=da();a={lane:n,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null},bu(e)?Vy(t,a):(a=Mm(e,t,a,n),a!==null&&(Ft(a,e,n),Dy(a,t,n)))}function Oy(e,t,a){var n=da();Tl(e,t,a,n)}function Tl(e,t,a,n){var o={lane:n,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null};if(bu(e))Vy(t,o);else{var l=e.alternate;if(e.lanes===0&&(l===null||l.lanes===0)&&(l=t.lastRenderedReducer,l!==null))try{var c=t.lastRenderedState,u=l(c,a);if(o.hasEagerState=!0,o.eagerState=u,ha(u,c))return du(e,t,o,0),Oe===null&&uu(),!1}catch{}if(a=Mm(e,t,o,n),a!==null)return Ft(a,e,n),Dy(a,t,n),!0}return!1}function Pm(e,t,a,n){if(n={lane:2,revertLane:cp(),gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},bu(e)){if(t)throw Error(R(479))}else t=Mm(e,a,n,2),t!==null&&Ft(t,e,2)}function bu(e){var t=e.alternate;return e===ne||t!==null&&t===ne}function Vy(e,t){ir=jc=!0;var a=e.pending;a===null?t.next=t:(t.next=a.next,a.next=t),e.pending=t}function Dy(e,t,a){if((a&4194048)!==0){var n=t.lanes;n&=e.pendingLanes,a|=n,t.lanes=a,yv(e,a)}}var Yc={readContext:Nt,use:gu,useCallback:Ke,useContext:Ke,useEffect:Ke,useImperativeHandle:Ke,useLayoutEffect:Ke,useInsertionEffect:Ke,useMemo:Ke,useReducer:Ke,useRef:Ke,useState:Ke,useDebugValue:Ke,useDeferredValue:Ke,useTransition:Ke,useSyncExternalStore:Ke,useId:Ke,useHostTransitionStatus:Ke,useFormState:Ke,useActionState:Ke,useOptimistic:Ke,useMemoCache:Ke,useCacheRefresh:Ke,useEffectEvent:Ke},_y={readContext:Nt,use:gu,useCallback:function(e,t){return Lt().memoizedState=[e,t===void 0?null:t],e},useContext:Nt,useEffect:lb,useImperativeHandle:function(e,t,a){a=a!=null?a.concat([e]):null,yc(4194308,4,Ny.bind(null,t,e),a)},useLayoutEffect:function(e,t){return yc(4194308,4,e,t)},useInsertionEffect:function(e,t){yc(4,2,e,t)},useMemo:function(e,t){var a=Lt();t=t===void 0?null:t;var n=e();if(Pi){Jn(!0);try{e()}finally{Jn(!1)}}return a.memoizedState=[n,t],n},useReducer:function(e,t,a){var n=Lt();if(a!==void 0){var o=a(t);if(Pi){Jn(!0);try{a(t)}finally{Jn(!1)}}}else o=t;return n.memoizedState=n.baseState=o,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:o},n.queue=e,e=e.dispatch=qN.bind(null,ne,e),[n.memoizedState,e]},useRef:function(e){var t=Lt();return e={current:e},t.memoizedState=e},useState:function(e){e=_h(e);var t=e.queue,a=Oy.bind(null,ne,t);return t.dispatch=a,[e.memoizedState,a]},useDebugValue:Km,useDeferredValue:function(e,t){var a=Lt();return Jm(a,e,t)},useTransition:function(){var e=_h(!1);return e=Cy.bind(null,ne,e.queue,!0,!1),Lt().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,t,a){var n=ne,o=Lt();if(re){if(a===void 0)throw Error(R(407));a=a()}else{if(a=t(),Oe===null)throw Error(R(349));(me&127)!==0||cy(n,t,a)}o.memoizedState=a;var l={value:a,getSnapshot:t};return o.queue=l,lb(dy.bind(null,n,l,e),[e]),n.flags|=2048,hr(9,{destroy:void 0},uy.bind(null,n,l,a,t),null),a},useId:function(){var e=Lt(),t=Oe.identifierPrefix;if(re){var a=sn,n=ln;a=(n&~(1<<32-ua(n)-1)).toString(32)+a,t="_"+t+"R_"+a,a=Gc++,0<a&&(t+="H"+a.toString(32)),t+="_"}else a=ON++,t="_"+t+"r_"+a.toString(32)+"_";return e.memoizedState=t},useHostTransitionStatus:Fm,useFormState:ib,useActionState:ib,useOptimistic:function(e){var t=Lt();t.memoizedState=t.baseState=e;var a={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return t.queue=a,t=Pm.bind(null,ne,!0,a),a.dispatch=t,[e,t]},useMemoCache:Xm,useCacheRefresh:function(){return Lt().memoizedState=UN.bind(null,ne)},useEffectEvent:function(e){var t=Lt(),a={impl:e};return t.memoizedState=a,function(){if(($e&2)!==0)throw Error(R(440));return a.impl.apply(void 0,arguments)}}},Hy={readContext:Nt,use:gu,useCallback:Ty,useContext:Nt,useEffect:Zm,useImperativeHandle:Sy,useInsertionEffect:$y,useLayoutEffect:xy,useMemo:ky,useReducer:vc,useRef:yy,useState:function(){return vc(An)},useDebugValue:Km,useDeferredValue:function(e,t){var a=Fe();return Ey(a,Re.memoizedState,e,t)},useTransition:function(){var e=vc(An)[0],t=Fe().memoizedState;return[typeof e=="boolean"?e:es(e),t]},useSyncExternalStore:sy,useId:Ry,useHostTransitionStatus:Fm,useFormState:ob,useActionState:ob,useOptimistic:function(e,t){var a=Fe();return py(a,Re,e,t)},useMemoCache:Xm,useCacheRefresh:My,useEffectEvent:wy},BN={readContext:Nt,use:gu,useCallback:Ty,useContext:Nt,useEffect:Zm,useImperativeHandle:Sy,useInsertionEffect:$y,useLayoutEffect:xy,useMemo:ky,useReducer:Zd,useRef:yy,useState:function(){return Zd(An)},useDebugValue:Km,useDeferredValue:function(e,t){var a=Fe();return Re===null?Jm(a,e,t):Ey(a,Re.memoizedState,e,t)},useTransition:function(){var e=Zd(An)[0],t=Fe().memoizedState;return[typeof e=="boolean"?e:es(e),t]},useSyncExternalStore:sy,useId:Ry,useHostTransitionStatus:Fm,useFormState:rb,useActionState:rb,useOptimistic:function(e,t){var a=Fe();return Re!==null?py(a,Re,e,t):(a.baseState=e,[e,a.queue.dispatch])},useMemoCache:Xm,useCacheRefresh:My,useEffectEvent:wy};function Kd(e,t,a,n){t=e.memoizedState,a=a(n,t),a=a==null?t:Ve({},t,a),e.memoizedState=a,e.lanes===0&&(e.updateQueue.baseState=a)}var Uh={enqueueSetState:function(e,t,a){e=e._reactInternals;var n=da(),o=ii(n);o.payload=t,a!=null&&(o.callback=a),t=oi(e,o,n),t!==null&&(Ft(t,e,n),xl(t,e,n))},enqueueReplaceState:function(e,t,a){e=e._reactInternals;var n=da(),o=ii(n);o.tag=1,o.payload=t,a!=null&&(o.callback=a),t=oi(e,o,n),t!==null&&(Ft(t,e,n),xl(t,e,n))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var a=da(),n=ii(a);n.tag=2,t!=null&&(n.callback=t),t=oi(e,n,a),t!==null&&(Ft(t,e,a),xl(t,e,a))}};function sb(e,t,a,n,o,l,c){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(n,l,c):t.prototype&&t.prototype.isPureReactComponent?!Vl(a,n)||!Vl(o,l):!0}function cb(e,t,a,n){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(a,n),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(a,n),t.state!==e&&Uh.enqueueReplaceState(t,t.state,null)}function Wi(e,t){var a=t;if("ref"in t){a={};for(var n in t)n!=="ref"&&(a[n]=t[n])}if(e=e.defaultProps){a===t&&(a=Ve({},a));for(var o in e)a[o]===void 0&&(a[o]=e[o])}return a}function Iy(e){Dc(e)}function Uy(e){console.error(e)}function qy(e){Dc(e)}function Xc(e,t){try{var a=e.onUncaughtError;a(t.value,{componentStack:t.stack})}catch(n){setTimeout(function(){throw n})}}function ub(e,t,a){try{var n=e.onCaughtError;n(a.value,{componentStack:a.stack,errorBoundary:t.tag===1?t.stateNode:null})}catch(o){setTimeout(function(){throw o})}}function qh(e,t,a){return a=ii(a),a.tag=3,a.payload={element:null},a.callback=function(){Xc(e,t)},a}function By(e){return e=ii(e),e.tag=3,e}function Ly(e,t,a,n){var o=a.type.getDerivedStateFromError;if(typeof o=="function"){var l=n.value;e.payload=function(){return o(l)},e.callback=function(){ub(t,a,n)}}var c=a.stateNode;c!==null&&typeof c.componentDidCatch=="function"&&(e.callback=function(){ub(t,a,n),typeof o!="function"&&(si===null?si=new Set([this]):si.add(this));var u=n.stack;this.componentDidCatch(n.value,{componentStack:u!==null?u:""})})}function LN(e,t,a,n,o){if(a.flags|=32768,n!==null&&typeof n=="object"&&typeof n.then=="function"){if(t=a.alternate,t!==null&&Zi(t,a,o,!0),a=Et.current,a!==null){switch(a.tag){case 31:case 13:case 19:return Mt===null?eu():a.alternate===null&&Je===0&&(Je=3),a.flags&=-257,a.flags|=65536,a.lanes=o,n===qc?a.flags|=16384:(t=a.updateQueue,t===null?a.updateQueue=new Set([n]):t.add(n),ah(e,n,o)),!1;case 22:return a.flags|=65536,n===qc?a.flags|=16384:(t=a.updateQueue,t===null?(t={transitions:null,markerInstances:null,retryQueue:new Set([n])},a.updateQueue=t):(a=t.retryQueue,a===null?t.retryQueue=new Set([n]):a.add(n)),ah(e,n,o)),!1}throw Error(R(435,a.tag))}return ah(e,n,o),eu(),!1}if(re)return t=Et.current,t!==null?((t.flags&65536)===0&&(t.flags|=256),t.flags|=65536,t.lanes=o,n!==Ch&&(e=Error(R(422),{cause:n}),_l(Ta(e,a)))):(n!==Ch&&(t=Error(R(423),{cause:n}),_l(Ta(t,a))),e=e.current.alternate,e.flags|=65536,o&=-o,e.lanes|=o,n=Ta(n,a),o=qh(e.stateNode,n,o),Qd(e,o),Je!==4&&(Je=2)),!1;var l=Error(R(520),{cause:n});if(l=Ta(l,a),Al===null?Al=[l]:Al.push(l),Je!==4&&(Je=2),t===null)return!0;n=Ta(n,a),a=t;do{switch(a.tag){case 3:return a.flags|=65536,e=o&-o,a.lanes|=e,e=qh(a.stateNode,n,e),Qd(a,e),!1;case 1:if(t=a.type,l=a.stateNode,(a.flags&128)===0&&(typeof t.getDerivedStateFromError=="function"||l!==null&&typeof l.componentDidCatch=="function"&&(si===null||!si.has(l))))return a.flags|=65536,o&=-o,a.lanes|=o,o=By(o),Ly(o,e,a,n),Qd(a,o),!1;break;case 22:if(a.memoizedState!==null)return a.flags|=65536,!1}a=a.return}while(a!==null);return!1}var Wm=Error(R(461)),at=!1;function ct(e,t,a,n){t.child=e===null?ay(t,null,a,n):Fi(t,e.child,a,n)}function db(e,t,a,n,o){a=a.render;var l=t.ref;if("ref"in n){var c={};for(var u in n)u!=="ref"&&(c[u]=n[u])}else c=n;return Ki(t),n=Lm(e,t,a,c,l,o),u=jm(),e!==null&&!at?(Gm(e,t,o),zn(e,t,o)):(re&&u&&hu(t),t.flags|=1,ct(e,t,n,o),t.child)}function hb(e,t,a,n,o){if(e===null){var l=a.type;return typeof l=="function"&&!Om(l)&&l.defaultProps===void 0&&a.compare===null?(t.tag=15,t.type=l,jy(e,t,l,n,o)):(e=gc(a.type,null,n,t,t.mode,o),e.ref=t.ref,e.return=t,t.child=e)}if(l=e.child,!tp(e,o)){var c=l.memoizedProps;if(a=a.compare,a=a!==null?a:Vl,a(c,n)&&e.ref===t.ref)return zn(e,t,o)}return t.flags|=1,e=Sn(l,n),e.ref=t.ref,e.return=t,t.child=e}function jy(e,t,a,n,o){if(e!==null){var l=e.memoizedProps;if(Vl(l,n)&&e.ref===t.ref)if(at=!1,t.pendingProps=n=l,tp(e,o))(e.flags&131072)!==0&&(at=!0);else return t.lanes=e.lanes,zn(e,t,o)}return Bh(e,t,a,n,o)}function Gy(e,t,a,n){var o=n.children,l=e!==null?e.memoizedState:null;if(e===null&&t.stateNode===null&&(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),n.mode==="hidden"){if((t.flags&128)!==0){if(l=l!==null?l.baseLanes|a:a,e!==null){for(n=t.child=e.child,o=0;n!==null;)o=o|n.lanes|n.childLanes,n=n.sibling;n=o&~l}else n=0,t.child=null;return mb(e,t,l,a,n)}if((a&536870912)!==0)t.memoizedState={baseLanes:0,cachePool:null},e!==null&&bc(t,l!==null?l.cachePool:null),l!==null?tb(t,l):Vh(),oy(t);else return n=t.lanes=536870912,mb(e,t,l!==null?l.baseLanes|a:a,a,n)}else l!==null?(bc(t,l.cachePool),tb(t,l),li(),t.memoizedState=null):(e!==null&&bc(t,null),Vh(),li());return ct(e,t,o,a),t.child}function kl(e,t){return e!==null&&e.tag===22||t.stateNode!==null||(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),t.sibling}function mb(e,t,a,n,o){var l=_m();return l=l===null?null:{parent:tt._currentValue,pool:l},t.memoizedState={baseLanes:a,cachePool:l},e!==null&&bc(t,null),Vh(),oy(t),e!==null&&Zi(e,t,n,!0),t.childLanes=o,null}function wc(e,t){return t=vu({mode:t.mode,children:t.children},e.mode),t.ref=e.ref,e.child=t,t.return=e,t}function pb(e,t,a){return Fi(t,e.child,null,a),e=wc(t,t.pendingProps),e.flags|=2,oa(t),t.memoizedState=null,e}function jN(e,t,a){var n=t.pendingProps,o=(t.flags&128)!==0;if(t.flags&=-129,e===null){if(re){if(n.mode==="hidden")return e=wc(t,n),t.lanes=536870912,e.memoizedState={baseLanes:0,cachePool:null},kl(null,e);if(Dh(t),(e=Ie)?(e=Gw(e,ka),e=e!==null&&e.data==="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:hi!==null?{id:ln,overflow:sn}:null,retryLane:536870912,hydrationErrors:null},a=Kv(e),a.return=t,t.child=a,vt=t,Ie=null)):e=null,e===null)throw mi(t);return t.lanes=536870912,null}return wc(t,n)}var l=e.memoizedState;if(l!==null){var c=l.dehydrated;if(Dh(t),o)if(t.flags&256)t.flags&=-257,t=pb(e,t,a);else if(t.memoizedState!==null)t.child=e.child,t.flags|=128,t=null;else throw Error(R(558));else if(at||Zi(e,t,a,!1),o=(a&e.childLanes)!==0,at||o){if(pi.current===null){if(n=Oe,n!==null&&(c=wv(n,a),c!==0&&c!==l.retryLane))throw l.retryLane=c,io(e,c),Ft(n,e,c),Wm;eu()}t=pb(e,t,a)}else e=l.treeContext,Ie=Ea(c.nextSibling),vt=t,re=!0,ni=null,ka=!1,e!==null&&Fv(t,e),t=wc(t,n),t.flags|=134221824;return t}return e=Sn(e.child,{mode:n.mode,children:n.children}),e.ref=t.ref,t.child=e,e.return=t,e}function Io(e,t){var a=t.ref;if(a===null)e!==null&&e.ref!==null&&(t.flags|=4194816);else{if(typeof a!="function"&&typeof a!="object")throw Error(R(284));(e===null||e.ref!==a)&&(t.flags|=4194816)}}function Bh(e,t,a,n,o){return Ki(t),a=Lm(e,t,a,n,void 0,o),n=jm(),e!==null&&!at?(Gm(e,t,o),zn(e,t,o)):(re&&n&&hu(t),t.flags|=1,ct(e,t,a,o),t.child)}function gb(e,t,a,n,o,l){return Ki(t),t.updateQueue=null,a=ly(t,n,a,o),ry(e),n=jm(),e!==null&&!at?(Gm(e,t,l),zn(e,t,l)):(re&&n&&hu(t),t.flags|=1,ct(e,t,a,l),t.child)}function fb(e,t,a,n,o){if(Ki(t),t.stateNode===null){var l=Ko,c=a.contextType;typeof c=="object"&&c!==null&&(l=Nt(c)),l=new a(n,l),t.memoizedState=l.state!==null&&l.state!==void 0?l.state:null,l.updater=Uh,t.stateNode=l,l._reactInternals=t,l=t.stateNode,l.props=n,l.state=t.memoizedState,l.refs={},Im(t),c=a.contextType,l.context=typeof c=="object"&&c!==null?Nt(c):Ko,l.state=t.memoizedState,c=a.getDerivedStateFromProps,typeof c=="function"&&(Kd(t,a,c,n),l.state=t.memoizedState),typeof a.getDerivedStateFromProps=="function"||typeof l.getSnapshotBeforeUpdate=="function"||typeof l.UNSAFE_componentWillMount!="function"&&typeof l.componentWillMount!="function"||(c=l.state,typeof l.componentWillMount=="function"&&l.componentWillMount(),typeof l.UNSAFE_componentWillMount=="function"&&l.UNSAFE_componentWillMount(),c!==l.state&&Uh.enqueueReplaceState(l,l.state,null),Sl(t,n,l,o),Nl(),l.state=t.memoizedState),typeof l.componentDidMount=="function"&&(t.flags|=4194308),n=!0}else if(e===null){l=t.stateNode;var u=t.memoizedProps,h=Wi(a,u);l.props=h;var g=l.context,$=a.contextType;c=Ko,typeof $=="object"&&$!==null&&(c=Nt($));var x=a.getDerivedStateFromProps;$=typeof x=="function"||typeof l.getSnapshotBeforeUpdate=="function",u=t.pendingProps!==u,$||typeof l.UNSAFE_componentWillReceiveProps!="function"&&typeof l.componentWillReceiveProps!="function"||(u||g!==c)&&cb(t,l,n,c),Zn=!1;var f=t.memoizedState;l.state=f,Sl(t,n,l,o),Nl(),g=t.memoizedState,u||f!==g||Zn?(typeof x=="function"&&(Kd(t,a,x,n),g=t.memoizedState),(h=Zn||sb(t,a,h,n,f,g,c))?($||typeof l.UNSAFE_componentWillMount!="function"&&typeof l.componentWillMount!="function"||(typeof l.componentWillMount=="function"&&l.componentWillMount(),typeof l.UNSAFE_componentWillMount=="function"&&l.UNSAFE_componentWillMount()),typeof l.componentDidMount=="function"&&(t.flags|=4194308)):(typeof l.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=n,t.memoizedState=g),l.props=n,l.state=g,l.context=c,n=h):(typeof l.componentDidMount=="function"&&(t.flags|=4194308),n=!1)}else{l=t.stateNode,Mh(e,t),c=t.memoizedProps,$=Wi(a,c),l.props=$,x=t.pendingProps,f=l.context,g=a.contextType,h=Ko,typeof g=="object"&&g!==null&&(h=Nt(g)),u=a.getDerivedStateFromProps,(g=typeof u=="function"||typeof l.getSnapshotBeforeUpdate=="function")||typeof l.UNSAFE_componentWillReceiveProps!="function"&&typeof l.componentWillReceiveProps!="function"||(c!==x||f!==h)&&cb(t,l,n,h),Zn=!1,f=t.memoizedState,l.state=f,Sl(t,n,l,o),Nl();var b=t.memoizedState;c!==x||f!==b||Zn||e!==null&&e.dependencies!==null&&Uc(e.dependencies)?(typeof u=="function"&&(Kd(t,a,u,n),b=t.memoizedState),($=Zn||sb(t,a,$,n,f,b,h)||e!==null&&e.dependencies!==null&&Uc(e.dependencies))?(g||typeof l.UNSAFE_componentWillUpdate!="function"&&typeof l.componentWillUpdate!="function"||(typeof l.componentWillUpdate=="function"&&l.componentWillUpdate(n,b,h),typeof l.UNSAFE_componentWillUpdate=="function"&&l.UNSAFE_componentWillUpdate(n,b,h)),typeof l.componentDidUpdate=="function"&&(t.flags|=4),typeof l.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof l.componentDidUpdate!="function"||c===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof l.getSnapshotBeforeUpdate!="function"||c===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),t.memoizedProps=n,t.memoizedState=b),l.props=n,l.state=b,l.context=h,n=$):(typeof l.componentDidUpdate!="function"||c===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof l.getSnapshotBeforeUpdate!="function"||c===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),n=!1)}return l=n,Io(e,t),n=(t.flags&128)!==0,l||n?(l=t.stateNode,a=n&&typeof a.getDerivedStateFromError!="function"?null:l.render(),t.flags|=1,e!==null&&n?(t.child=Fi(t,e.child,null,o),t.child=Fi(t,null,a,o)):ct(e,t,a,o),t.memoizedState=l.state,e=t.child):e=zn(e,t,o),e}function bb(e,t,a,n){return Qi(),t.flags|=256,ct(e,t,a,n),t.child}var Lh={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function jh(e){return{baseLanes:e,cachePool:Wv()}}function Gh(e,t,a){return e=e!==null?e.childLanes&~a:0,t&&(e|=la),e}function Yy(e,t,a){var n=t.pendingProps,o=!1,l=(t.flags&128)!==0,c;if((c=l)||(c=e!==null&&e.memoizedState===null?!1:(Tt.current&2)!==0),c&&(o=!0,t.flags&=-129),c=(t.flags&32)!==0,t.flags&=-33,e===null){if(re){if(o?ri(t):li(),(e=Ie)?(e=Gw(e,ka),e=e!==null&&e.data!=="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:hi!==null?{id:ln,overflow:sn}:null,retryLane:536870912,hydrationErrors:null},a=Kv(e),a.return=t,t.child=a,vt=t,Ie=null)):e=null,e===null)throw mi(t);return mp(e)?t.lanes=32:t.lanes=536870912,null}return l=n.children,n=n.fallback,o?(li(),o=t.mode,l=vu({mode:"hidden",children:l},o),n=ji(n,o,a,null),l.return=t,n.return=t,l.sibling=n,t.child=l,n=t.child,n.memoizedState=jh(a),n.childLanes=Gh(e,c,a),t.memoizedState=Lh,kl(null,n)):(ri(t),ep(t,l))}var u=e.memoizedState;if(u!==null){var h=u.dehydrated;if(h!==null)return GN(e,t,l,c,n,h,u,a)}return o?(li(),o=n.fallback,l=t.mode,u=e.child,h=u.sibling,n=Sn(u,{mode:"hidden",children:n.children}),n.subtreeFlags=u.subtreeFlags&1206910976,h!==null?o=Sn(h,o):(o=ji(o,l,a,null),o.flags|=2),o.return=t,n.return=t,n.sibling=o,t.child=n,kl(null,n),n=t.child,o=e.child.memoizedState,o===null?o=jh(a):(l=o.cachePool,l!==null?(u=tt._currentValue,l=l.parent!==u?{parent:u,pool:u}:l):l=Wv(),o={baseLanes:o.baseLanes|a,cachePool:l}),n.memoizedState=o,n.childLanes=Gh(e,c,a),t.memoizedState=Lh,kl(e.child,n)):(ri(t),a=e.child,e=a.sibling,a=Sn(a,{mode:"visible",children:n.children}),a.return=t,a.sibling=null,e!==null&&(c=t.deletions,c===null?(t.deletions=[e],t.flags|=16):c.push(e)),t.child=a,t.memoizedState=null,a)}function ep(e,t){return t=vu({mode:"visible",children:t},e.mode),t.return=e,e.child=t}function vu(e,t){return e=Jt(22,e,null,t),e.lanes=0,e}function tc(e,t,a){return Fi(t,e.child,null,a),e=ep(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function GN(e,t,a,n,o,l,c,u){if(a)return t.flags&256?(ri(t),t.flags&=-257,tc(e,t,u)):t.memoizedState!==null?(li(),t.child=e.child,t.flags|=128,null):(li(),l=o.fallback,c=t.mode,o=vu({mode:"visible",children:o.children},c),l=ji(l,c,u,null),l.flags|=2,o.return=t,l.return=t,o.sibling=l,t.child=o,Fi(t,e.child,null,u),o=t.child,o.memoizedState=jh(u),o.childLanes=Gh(e,n,u),t.memoizedState=Lh,kl(null,o));if(ri(t),mp(l)){if(n=l.nextSibling&&l.nextSibling.dataset,n)var h=n.dgst;return n=h,n!==""&&(o=Error(R(419)),o.stack="",o.digest=n,_l({value:o,source:null,stack:null})),tc(e,t,u)}if(at||Zi(e,t,u,!1),n=(u&e.childLanes)!==0,at||n){if(pi.current!==null)return tc(e,t,u);if(n=Oe,n!==null&&(o=wv(n,u),o!==0&&o!==c.retryLane))throw c.retryLane=o,io(e,o),Ft(n,e,o),Wm;return gm(l)||eu(),tc(e,t,u)}return gm(l)?(t.flags|=192,t.child=e.child,null):(e=c.treeContext,Ie=Ea(l.nextSibling),vt=t,re=!0,ni=null,ka=!1,e!==null&&Fv(t,e),t=ep(t,o.children),t.flags|=134221824,t)}function vb(e,t,a){e.lanes|=t;var n=e.alternate;n!==null&&(n.lanes|=t),fc(e.return,t,a)}function yb(e){for(var t=null;e!==null;){var a=e.alternate;a!==null&&Lc(a)===null&&(t=e),e=e.sibling}return t}function ac(e,t,a,n,o,l){var c=e.memoizedState;c===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:n,tail:a,tailMode:o,treeForkCount:l}:(c.isBackwards=t,c.rendering=null,c.renderingStartTime=0,c.last=n,c.tail=a,c.tailMode=o,c.treeForkCount=l)}function Jd(e){var t=e.child;for(e.child=null;t!==null;){var a=t.sibling;t.sibling=e.child,e.child=t,t=a}}function Yh(e,t,a){var n=t.pendingProps,o=n.revealOrder,l=n.tail;n=n.children;var c=Tt.current;if(t.flags&128)return Il(t,c),null;var u=(c&2)!==0;if(u?(c=c&1|2,t.flags|=128):c&=1,Il(t,c),o==="backwards"&&e!==null?(Jd(e),ct(e,t,n,a),Jd(e)):ct(e,t,n,a),n=re?Dl:0,!u&&e!==null&&(e.flags&128)!==0)e:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&vb(e,a,t);else if(e.tag===19)vb(e,a,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(o){case"backwards":a=yb(t.child),a===null?(o=t.child,t.child=null):(o=a.sibling,a.sibling=null,Jd(t)),ac(t,!0,o,null,l,n);break;case"unstable_legacy-backwards":for(a=null,o=t.child,t.child=null;o!==null;){if(e=o.alternate,e!==null&&Lc(e)===null){t.child=o;break}e=o.sibling,o.sibling=a,a=o,o=e}ac(t,!0,a,null,l,n);break;case"together":ac(t,!1,null,null,void 0,n);break;case"independent":t.memoizedState=null;break;default:a=yb(t.child),a===null?(o=t.child,t.child=null):(o=a.sibling,a.sibling=null),ac(t,!1,o,a,l,n)}return t.child}function wb(e,t,a){var n=t.pendingProps;return Pn(t,t.type,n.value),ct(e,t,n.children,a),t.child}function zn(e,t,a){if(e!==null&&(t.dependencies=e.dependencies),fi|=t.lanes,(a&t.childLanes)===0)if(e!==null){if(Zi(e,t,a,!1),(a&t.childLanes)===0)return null}else return null;if(e!==null&&t.child!==e.child)throw Error(R(153));if(t.child!==null){for(e=t.child,a=Sn(e,e.pendingProps),t.child=a,a.return=t;e.sibling!==null;)e=e.sibling,a=a.sibling=Sn(e,e.pendingProps),a.return=t;a.sibling=null}return t.child}function tp(e,t){return(e.lanes&t)!==0?!0:(e=e.dependencies,!!(e!==null&&Uc(e)))}function YN(e,t,a){switch(t.tag){case 3:Rc(t,t.stateNode.containerInfo),Pn(t,tt,e.memoizedState.cache),Qi();break;case 27:case 5:vh(t);break;case 4:Rc(t,t.stateNode.containerInfo);break;case 10:Pn(t,t.type,t.memoizedProps.value);break;case 31:if(t.memoizedState!==null)return t.flags|=128,Dh(t),null;break;case 13:var n=t.memoizedState;if(n!==null){if(n.dehydrated!==null)return ri(t),t.flags|=128,null;n=Zi(e,t,a,!1);var o=t.child.childLanes;return n||(a&o)!==0?Yy(e,t,a):(ri(t),e=zn(e,t,a),e!==null?e.sibling:null)}ri(t);break;case 19:if(t.flags&128)return Yh(e,t,a);if(o=(e.flags&128)!==0,n=(a&t.childLanes)!==0,n||(Zi(e,t,a,!1),n=(a&t.childLanes)!==0),o){if(n)return Yh(e,t,a);t.flags|=128}if(o=t.memoizedState,o!==null&&(o.rendering=null,o.tail=null,o.lastEffect=null),Il(t,Tt.current),n)break;return null;case 22:return t.lanes=0,Gy(e,t,a,t.pendingProps);case 24:Pn(t,tt,e.memoizedState.cache)}return zn(e,t,a)}function Xy(e,t,a){if(e!==null)if(e.memoizedProps!==t.pendingProps)at=!0;else{if(!tp(e,a)&&(t.flags&128)===0)return at=!1,YN(e,t,a);at=(e.flags&131072)!==0}else at=!1,re&&(t.flags&1048576)!==0&&Jv(t,Dl,t.index);switch(t.lanes=0,t.tag){case 16:e:{var n=t.pendingProps;if(e=Ii(t.elementType),t.type=e,typeof e=="function")Om(e)?(n=Wi(e,n),t.tag=1,t=fb(null,t,e,n,a)):(t.tag=0,t=Bh(null,t,e,n,a));else{if(e!=null){var o=e.$$typeof;if(o===wm){t.tag=11,t=db(null,t,e,n,a);break e}else if(o===$m){t.tag=14,t=hb(null,t,e,n,a);break e}else if(o===on){t.tag=10,t.type=e,t=wb(null,t,a);break e}}throw t=fh(e)||e,Error(R(306,t,""))}}return t;case 0:return Bh(e,t,t.type,t.pendingProps,a);case 1:return n=t.type,o=Wi(n,t.pendingProps),fb(e,t,n,o,a);case 3:e:{if(Rc(t,t.stateNode.containerInfo),e===null)throw Error(R(387));n=t.pendingProps;var l=t.memoizedState;o=l.element,Mh(e,t),Sl(t,n,null,a);var c=t.memoizedState;if(n=c.cache,Pn(t,tt,n),n!==l.cache&&zh(t,[tt],a,!0),Nl(),n=c.element,l.isDehydrated)if(l={element:n,isDehydrated:!1,cache:c.cache},t.updateQueue.baseState=l,t.memoizedState=l,t.flags&256){t=bb(e,t,n,a);break e}else if(n!==o){o=Ta(Error(R(424)),t),_l(o),t=bb(e,t,n,a);break e}else for(e=t.stateNode.containerInfo,e.nodeType===9?e=e.body:e=e.nodeName==="HTML"?e.ownerDocument.body:e,Ie=Ea(e.firstChild),vt=t,re=!0,ni=null,ka=!0,a=ay(t,null,n,a),t.child=a;a;)a.flags=a.flags&-3|134221824,a=a.sibling;else{if(Qi(),n===o){t=zn(e,t,a);break e}ct(e,t,n,a)}t=t.child}return t;case 26:return Io(e,t),e===null?(a=Qb(t.type,null,t.pendingProps,null))?t.memoizedState=a:re||(t.stateNode=Dw(t.type,t.pendingProps,ai.current,t)):t.memoizedState=Qb(t.type,e.memoizedProps,t.pendingProps,e.memoizedState),null;case 27:return vh(t),e===null&&re&&(n=t.stateNode=Yw(t.type,t.pendingProps,ai.current),vt=t,ka=!0,o=Ie,vi(t.type)?(fm=o,Ie=Ea(n.firstChild)):Ie=o),ct(e,t,t.pendingProps.children,a),Io(e,t),e===null&&(t.flags|=4194304),t.child;case 5:return e===null&&re&&((o=n=Ie)&&(n=H5(n,t.type,t.pendingProps,ka),n!==null?(t.stateNode=n,vt=t,Ie=Ea(n.firstChild),ka=!1,o=!0):o=!1),o||mi(t)),vh(t),o=t.type,l=t.pendingProps,c=e!==null?e.memoizedProps:null,n=l.children,hm(o,l)?n=null:c!==null&&hm(o,c)&&(t.flags|=32),t.memoizedState!==null&&(o=Lm(e,t,VN,null,null,a),yr._currentValue=o),Io(e,t),ct(e,t,n,a),t.child;case 6:return e===null&&re&&((e=a=Ie)&&(a=I5(a,t.pendingProps,ka),a!==null?(t.stateNode=a,vt=t,Ie=null,e=!0):e=!1),e||mi(t)),null;case 13:return Yy(e,t,a);case 4:return Rc(t,t.stateNode.containerInfo),n=t.pendingProps,e===null?t.child=Fi(t,null,n,a):ct(e,t,n,a),t.child;case 11:return db(e,t,t.type,t.pendingProps,a);case 7:return n=t.pendingProps,Io(e,t),ct(e,t,n,a),t.child;case 8:return ct(e,t,t.pendingProps.children,a),t.child;case 12:return ct(e,t,t.pendingProps.children,a),t.child;case 10:return wb(e,t,a);case 9:return o=t.type._context,n=t.pendingProps.children,Ki(t),o=Nt(o),n=n(o),t.flags|=1,ct(e,t,n,a),t.child;case 14:return hb(e,t,t.type,t.pendingProps,a);case 15:return jy(e,t,t.type,t.pendingProps,a);case 19:return Yh(e,t,a);case 31:return jN(e,t,a);case 22:return Gy(e,t,a,t.pendingProps);case 24:return Ki(t),n=Nt(tt),e===null?(o=_m(),o===null&&(o=Oe,l=Dm(),o.pooledCache=l,l.refCount++,l!==null&&(o.pooledCacheLanes|=a),o=l),t.memoizedState={parent:n,cache:o},Im(t),Pn(t,tt,o)):((e.lanes&a)!==0&&(Mh(e,t),Sl(t,null,null,a),Nl()),o=e.memoizedState,l=t.memoizedState,o.parent!==n?(o={parent:n,cache:n},t.memoizedState=o,t.lanes===0&&(t.memoizedState=t.updateQueue.baseState=o),Pn(t,tt,n)):(n=l.cache,Pn(t,tt,n),n!==o.cache&&zh(t,[tt],a,!0))),ct(e,t,t.pendingProps.children,a),t.child;case 30:return t.stateNode===null&&(t.stateNode={autoName:null,paired:null,clones:null,ref:null}),n=t.pendingProps,n.name!=null&&n.name!=="auto"?t.flags|=e===null?18882560:18874368:re&&hu(t),e!==null&&e.memoizedProps.name!==n.name?t.flags|=4194816:Io(e,t),ct(e,t,n.children,a),t.child;case 29:throw t.pendingProps}throw Error(R(156,t.tag))}function $n(e){e.flags|=4}function Fd(e,t,a,n,o){var l;if((l=(e.mode&32)!==0)&&(l=a===null?Jb(t,n):Jb(t,n)&&(n.src!==a.src||n.srcSet!==a.srcSet)),l){if(e.flags|=16777216,(o&335544128)===o)if(e.stateNode.complete)e.flags|=8192;else if($w())e.flags|=8192;else throw Yi=qc,Hm}else e.flags&=-16777217}function $b(e,t){if(t.type!=="stylesheet"||(t.state.loading&4)!==0)e.flags&=-16777217;else if(e.flags|=16777216,!Kw(t))if($w())e.flags|=8192;else throw Yi=qc,Hm}function nc(e,t){t!==null&&(e.flags|=4),e.flags&16384&&(t=e.tag!==22?bv():536870912,e.lanes|=t,mr|=t)}function cl(e,t){if(!re)switch(e.tailMode){case"visible":break;case"collapsed":for(var a=e.tail,n=null;a!==null;)a.alternate!==null&&(n=a),a=a.sibling;n===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:n.sibling=null;break;default:for(t=e.tail,a=null;t!==null;)t.alternate!==null&&(a=t),t=t.sibling;a===null?e.tail=null:a.sibling=null}}function He(e){var t=e.alternate!==null&&e.alternate.child===e.child,a=0,n=0;if(t)for(var o=e.child;o!==null;)a|=o.lanes|o.childLanes,n|=o.subtreeFlags&1206910976,n|=o.flags&1206910976,o.return=e,o=o.sibling;else for(o=e.child;o!==null;)a|=o.lanes|o.childLanes,n|=o.subtreeFlags,n|=o.flags,o.return=e,o=o.sibling;return e.subtreeFlags|=n,e.childLanes=a,t}function XN(e,t,a){var n=t.pendingProps;switch(Vm(t),t.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return He(t),null;case 1:return He(t),null;case 3:return a=t.stateNode,n=null,e!==null&&(n=e.memoizedState.cache),t.memoizedState.cache!==n&&(t.flags|=2048),Tn(tt),cr(),a.pendingContext&&(a.context=a.pendingContext,a.pendingContext=null),(e===null||e.child===null)&&(_o(t)?$n(t):e===null||e.memoizedState.isDehydrated&&(t.flags&256)===0||(t.flags|=1024,Xd())),He(t),null;case 26:var o=t.type,l=t.memoizedState;return e===null?($n(t),l!==null?(He(t),$b(t,l)):(He(t),Fd(t,o,null,n,a))):l?l!==e.memoizedState?($n(t),He(t),$b(t,l)):(He(t),t.flags&=-16777217):(e=e.memoizedProps,e!==n&&$n(t),He(t),Fd(t,o,e,n,a)),null;case 27:if(Mc(t),a=ai.current,o=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==n&&$n(t);else{if(!n){if(t.stateNode===null)throw Error(R(166));return He(t),t.subtreeFlags&=-33554433,null}e=cn.current,_o(t)?Zf(t,e):(e=Yw(o,n,a),t.stateNode=e,$n(t))}return He(t),t.subtreeFlags&=-33554433,null;case 5:if(Mc(t),o=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==n&&$n(t);else{if(!n){if(t.stateNode===null)throw Error(R(166));return He(t),t.subtreeFlags&=-33554433,null}if(l=cn.current,_o(t))Zf(t,l);else{var c=Ll(ai.current);switch(l){case 1:l=c.createElementNS("http://www.w3.org/2000/svg",o);break;case 2:l=c.createElementNS("http://www.w3.org/1998/Math/MathML",o);break;default:switch(o){case"svg":l=c.createElementNS("http://www.w3.org/2000/svg",o);break;case"math":l=c.createElementNS("http://www.w3.org/1998/Math/MathML",o);break;case"script":l=c.createElement("div"),l.innerHTML="<script><\/script>",l=l.removeChild(l.firstChild);break;case"select":l=typeof n.is=="string"?c.createElement("select",{is:n.is}):c.createElement("select"),n.multiple?l.multiple=!0:n.size&&(l.size=n.size);break;default:l=typeof n.is=="string"?c.createElement(o,{is:n.is}):c.createElement(o)}}l[xt]=t,l[Wt]=n;e:for(c=t.child;c!==null;){if(c.tag===5||c.tag===6)l.appendChild(c.stateNode);else if(c.tag!==4&&c.tag!==27&&c.child!==null){c.child.return=c,c=c.child;continue}if(c===t)break e;for(;c.sibling===null;){if(c.return===null||c.return===t)break e;c=c.return}c.sibling.return=c.return,c=c.sibling}t.stateNode=l;e:switch(kt(l,o,n),o){case"button":case"input":case"select":case"textarea":n=!!n.autoFocus;break e;case"img":n=!0;break e;default:n=!1}n&&$n(t)}}return He(t),t.subtreeFlags&=-33554433,Fd(t,t.type,e===null?null:e.memoizedProps,t.pendingProps,a),null;case 6:if(e&&t.stateNode!=null)e.memoizedProps!==n&&$n(t);else{if(typeof n!="string"&&t.stateNode===null)throw Error(R(166));if(e=ai.current,_o(t)){if(e=t.stateNode,a=t.memoizedProps,n=null,o=vt,o!==null)switch(o.tag){case 27:case 5:n=o.memoizedProps}e[xt]=t,e=!!(e.nodeValue===a||n!==null&&n.suppressHydrationWarning===!0||Ow(e.nodeValue,a)),e||mi(t,!0)}else e=Ll(e).createTextNode(n),e[xt]=t,t.stateNode=e}return He(t),null;case 31:if(a=t.memoizedState,e===null||e.memoizedState!==null){if(n=_o(t),a!==null){if(e===null){if(!n)throw Error(R(318));if(e=t.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(R(557));e[xt]=t}else Qi(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;He(t),e=!1}else a=Xd(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=a),e=!0;if(!e)return t.flags&256?(oa(t),t):(oa(t),null);if((t.flags&128)!==0)throw Error(R(558))}return He(t),null;case 13:if(n=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(o=_o(t),n!==null&&n.dehydrated!==null){if(e===null){if(!o)throw Error(R(318));if(o=t.memoizedState,o=o!==null?o.dehydrated:null,!o)throw Error(R(317));o[xt]=t}else Qi(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;He(t),o=!1}else o=Xd(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=o),o=!0;if(!o)return t.flags&256?(oa(t),t):(oa(t),null)}return oa(t),(t.flags&128)!==0?(t.lanes=a,t):(a=n!==null,e=e!==null&&e.memoizedState!==null,a&&(n=t.child,o=null,n.alternate!==null&&n.alternate.memoizedState!==null&&n.alternate.memoizedState.cachePool!==null&&(o=n.alternate.memoizedState.cachePool.pool),l=null,n.memoizedState!==null&&n.memoizedState.cachePool!==null&&(l=n.memoizedState.cachePool.pool),l!==o&&(n.flags|=2048)),a!==e&&a&&(t.child.flags|=8192),nc(t,t.updateQueue),He(t),null);case 4:return cr(),e===null&&up(t.stateNode.containerInfo),t.flags|=67108864,He(t),null;case 10:return Tn(t.type),He(t),null;case 19:if(qm(t),n=t.memoizedState,n===null)return He(t),null;if(o=(t.flags&128)!==0,l=n.rendering,l===null)if(o)cl(n,!1);else{if(Je!==0||e!==null&&(e.flags&128)!==0)for(e=t.child;e!==null;){if(l=Lc(e),l!==null){for(t.flags|=128,cl(n,!1),e=l.updateQueue,t.updateQueue=e,nc(t,e),t.subtreeFlags=0,e=a,a=t.child;a!==null;)Zv(a,e),a=a.sibling;return Il(t,Tt.current&1|2),re&&xn(t,n.treeForkCount),t.child}e=e.sibling}n.tail!==null&&sa()>Pc&&(t.flags|=128,o=!0,cl(n,!1),t.lanes=4194304)}else{if(!o)if(e=Lc(l),e!==null){if(t.flags|=128,o=!0,e=e.updateQueue,t.updateQueue=e,nc(t,e),cl(n,!0),n.tail===null&&n.tailMode!=="collapsed"&&n.tailMode!=="visible"&&!l.alternate&&!re)return He(t),null}else 2*sa()-n.renderingStartTime>Pc&&a!==536870912&&(t.flags|=128,o=!0,cl(n,!1),t.lanes=4194304);n.isBackwards?(l.sibling=t.child,t.child=l):(e=n.last,e!==null?e.sibling=l:t.child=l,n.last=l)}if(n.tail!==null){e=n.tail;e:{for(a=e;a!==null;){if(a.alternate!==null){a=!1;break e}a=a.sibling}a=!0}return n.rendering=e,n.tail=e.sibling,n.renderingStartTime=sa(),e.sibling=null,l=Tt.current,l=o?l&1|2:l&1,n.tailMode==="visible"||n.tailMode==="collapsed"||!a||re?Il(t,l):(a=l,Ue(Et,t),Ue(Tt,a),Mt===null&&(Mt=t)),re&&xn(t,n.treeForkCount),e}return He(t),null;case 22:case 23:return oa(t),Um(),n=t.memoizedState!==null,e!==null?e.memoizedState!==null!==n&&(t.flags|=8192):n&&(t.flags|=8192),n?(a&536870912)!==0&&(t.flags&128)===0&&(He(t),t.subtreeFlags&6&&(t.flags|=8192)):He(t),a=t.updateQueue,a!==null&&nc(t,a.retryQueue),a=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),n=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(n=t.memoizedState.cachePool.pool),n!==a&&(t.flags|=2048),e!==null&&St(Gi),null;case 24:return a=null,e!==null&&(a=e.memoizedState.cache),t.memoizedState.cache!==a&&(t.flags|=2048),Tn(tt),He(t),null;case 25:return null;case 30:return t.flags|=33554432,He(t),null}throw Error(R(156,t.tag))}function QN(e,t){switch(Vm(t),t.tag){case 1:return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return Tn(tt),cr(),e=t.flags,(e&65536)!==0&&(e&128)===0?(t.flags=e&-65537|128,t):null;case 26:case 27:case 5:return Mc(t),null;case 31:if(t.memoizedState!==null){if(oa(t),t.alternate===null)throw Error(R(340));Qi()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 13:if(oa(t),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(R(340));Qi()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return qm(t),e=t.flags,e&65536?(t.flags=e&-65537|128,e=t.memoizedState,e!==null&&(e.rendering=null,e.tail=null),t.flags|=4,t):null;case 4:return cr(),null;case 10:return Tn(t.type),null;case 22:case 23:return oa(t),Um(),e!==null&&St(Gi),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 24:return Tn(tt),null;case 25:return null;default:return null}}function Qy(e,t){switch(Vm(t),t.tag){case 3:Tn(tt),cr();break;case 26:case 27:case 5:Mc(t);break;case 4:cr();break;case 31:t.memoizedState!==null&&oa(t);break;case 13:oa(t);break;case 19:qm(t);break;case 10:Tn(t.type);break;case 22:case 23:oa(t),Um(),e!==null&&St(Gi);break;case 24:Tn(tt)}}function ts(e,t){try{var a=t.updateQueue,n=a!==null?a.lastEffect:null;if(n!==null){var o=n.next;a=o;do{if((a.tag&e)===e){n=void 0;var l=a.create,c=a.inst;n=l(),c.destroy=n}a=a.next}while(a!==o)}}catch(u){Ce(t,t.return,u)}}function gi(e,t,a){try{var n=t.updateQueue,o=n!==null?n.lastEffect:null;if(o!==null){var l=o.next;n=l;do{if((n.tag&e)===e){var c=n.inst,u=c.destroy;if(u!==void 0){c.destroy=void 0,o=t;var h=a,g=u;try{g()}catch($){Ce(o,h,$)}}}n=n.next}while(n!==l)}}catch($){Ce(t,t.return,$)}}function Zy(e){var t=e.updateQueue;if(t!==null){var a=e.stateNode;try{iy(t,a)}catch(n){Ce(e,e.return,n)}}}function Ky(e,t,a){a.props=Wi(e.type,e.memoizedProps),a.state=e.memoizedState;try{a.componentWillUnmount()}catch(n){Ce(e,t,n)}}function an(e,t){try{var a=e.ref;if(a!==null){switch(e.tag){case 26:case 27:case 5:var n=e.stateNode;break;case 30:var o=e.stateNode,l=En(e.memoizedProps,o);(o.ref===null||o.ref.name!==l)&&(o.ref=Uw(l)),n=o.ref;break;case 7:if(e.stateNode===null){var c=new ma(e);Pt(e.child,!1,D5,c,void 0,void 0),e.stateNode=c}n=e.stateNode;break;default:n=e.stateNode}typeof a=="function"?e.refCleanup=a(n):a.current=n}}catch(u){Ce(e,t,u)}}function $t(e,t){var a=e.ref,n=e.refCleanup;if(a!==null)if(typeof n=="function")try{n()}catch(o){Ce(e,t,o)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof a=="function")try{a(null)}catch(o){Ce(e,t,o)}else a.current=null}function Qc(e,t){if((e.tag===5||e.tag===27||e.tag===6)&&e.alternate===null&&t!==null)for(var a=0;a<t.length;a++)jw(e.stateNode,t[a])}function xb(e){for(var t=e.return;t!==null&&(np(t)&&jw(e.stateNode,t.stateNode),!ap(t));)t=t.return}function El(e){for(var t=e.return;t!==null&&(np(t)&&_5(e.stateNode,t.stateNode),!ap(t));)t=t.return}function ap(e){return e.tag===5||e.tag===3||e.tag===27}function np(e){return e&&e.tag===7&&e.stateNode!==null}function Xh(e){var t=e.type,a=e.memoizedProps,n=e.stateNode;try{e:switch(t){case"button":case"input":case"select":case"textarea":a.autoFocus&&n.focus();break e;case"img":a.src?n.src=a.src:a.srcSet&&(n.srcset=a.srcSet)}}catch(o){Ce(e,e.return,o)}}function Pd(e,t,a){try{var n=e.stateNode;b5(n,e.type,a,t),n[Wt]=t}catch(o){Ce(e,e.return,o)}}function Jy(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&vi(e.type)||e.tag===4}function Wd(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||Jy(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&vi(e.type)||e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function Qh(e,t,a,n){var o=e.tag;if(o===5||o===6)o=e.stateNode,t?(a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a).insertBefore(o,t):(t=a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a,t.appendChild(o),a=a._reactRootContainer,a!=null||t.onclick!==null||(t.onclick=rn)),Qc(e,n),ye=!0;else if(o!==4&&(o===27&&(Qc(e,n),n=null,vi(e.type)&&(a=e.stateNode,t=null)),e=e.child,e!==null))for(Qh(e,t,a,n),e=e.sibling;e!==null;)Qh(e,t,a,n),e=e.sibling}function Zc(e,t,a,n){var o=e.tag;if(o===5||o===6)o=e.stateNode,t?a.insertBefore(o,t):a.appendChild(o),Qc(e,n),ye=!0;else if(o!==4&&(o===27&&(Qc(e,n),n=null,vi(e.type)&&(a=e.stateNode)),e=e.child,e!==null))for(Zc(e,t,a,n),e=e.sibling;e!==null;)Zc(e,t,a,n),e=e.sibling}function Fy(e){var t=e.stateNode,a=e.memoizedProps;try{for(var n=e.type,o=t.attributes;o.length;)t.removeAttributeNode(o[0]);kt(t,n,a),t[xt]=e,t[Wt]=a}catch(l){Ce(e,e.return,l)}}var Kc=!1,ra=null;function Nb(e){(e.tag===30||(e.subtreeFlags&33554432)!==0)&&(Kc=!0)}var nn=null;function Sb(){var e=nn;return nn=null,e}var Kt=0;function Tr(e,t,a,n,o){return Kt=0,Py(e.child,t,a,n,o)}function Py(e,t,a,n,o){for(var l=!1;e!==null;){if(e.tag===5){var c=e.stateNode;if(n!==null){var u=mm(c);n.push(u),u.view&&(l=!0)}else l||mm(c).view&&(l=!0);Kc=!0,_w(c,Kt===0?t:t+"_"+Kt,a),Kt++}else(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&o||Py(e.child,t,a,n,o)&&(l=!0));e=e.sibling}return l}function dn(e,t){for(;e!==null;)e.tag===5?Hw(e.stateNode,e.memoizedProps):(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&t||dn(e.child,t)),e=e.sibling}function $c(e){if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if((e.tag!==22||e.memoizedState===null)&&($c(e),e.tag===30&&(e.flags&18874368)!==0&&e.stateNode.paired)){var t=e.memoizedProps;if(t.name==null||t.name==="auto")throw Error(R(544));var a=t.name;t=On(t.default,t.share),t!=="none"&&(Tr(e,a,t,null,!1)||dn(e.child,!1))}e=e.sibling}}function Zh(e,t){if(e.tag===30){var a=e.stateNode,n=e.memoizedProps,o=En(n,a),l=On(n.default,a.paired?n.share:n.enter);l!=="none"?Tr(e,o,l,null,!1)?($c(e),a.paired||t||pr(e,n.onEnter)):dn(e.child,!1):$c(e)}else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)Zh(e,t),e=e.sibling;else $c(e)}function Kh(e){if(ra!==null&&ra.size!==0){var t=ra;if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&(e.flags&18874368)!==0){var a=e.memoizedProps,n=a.name;if(n!=null&&n!=="auto"){var o=t.get(n);if(o!==void 0){var l=On(a.default,a.share);if(l!=="none"&&(Tr(e,n,l,null,!1)?(l=e.stateNode,o.paired=l,l.paired=o,pr(e,a.onShare)):dn(e.child,!1)),t.delete(n),t.size===0)break}}}Kh(e)}e=e.sibling}}}function Jh(e){if(e.tag===30){var t=e.memoizedProps,a=En(t,e.stateNode),n=ra!==null?ra.get(a):void 0,o=On(t.default,n!==void 0?t.share:t.exit);o!=="none"&&(Tr(e,a,o,null,!1)?n!==void 0?(o=e.stateNode,n.paired=o,o.paired=n,ra.delete(a),pr(e,t.onShare)):pr(e,t.onExit):dn(e.child,!1)),ra!==null&&Kh(e)}else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)Jh(e),e=e.sibling;else ra!==null&&Kh(e)}function Wy(e){for(e=e.child;e!==null;){if(e.tag===30){var t=e.memoizedProps,a=En(t,e.stateNode);t=On(t.default,t.update),e.flags&=-5,t!=="none"&&Tr(e,a,t,e.memoizedState=[],!1)}else(e.subtreeFlags&33554432)!==0&&Wy(e);e=e.sibling}}function Fh(e){if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&(e.flags&18874368)!==0){var t=e.stateNode;t.paired!==null&&(t.paired=null,dn(e.child,!1))}Fh(e)}e=e.sibling}}function xc(e){if(e.tag===30)e.stateNode.paired=null,dn(e.child,!1),Fh(e);else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)xc(e),e=e.sibling;else Fh(e)}function ew(e){for(e=e.child;e!==null;)e.tag===30?dn(e.child,!1):(e.subtreeFlags&33554432)!==0&&ew(e),e=e.sibling}function ip(e,t,a,n,o,l,c){for(var u=!1;t!==null;){if(t.tag===5){var h=t.stateNode;if(l!==null&&Kt<l.length){var g=l[Kt],$=mm(h);(g.view||$.view)&&(u=!0);var x;if(x=(e.flags&4)===0)if($.clip)x=!0;else{x=g.rect;var f=$.rect;x=x.y!==f.y||x.x!==f.x||x.height!==f.height||x.width!==f.width}x&&(e.flags|=4),$.abs?$=!g.abs:(g=g.rect,$=$.rect,$=g.height!==$.height||g.width!==$.width),$&&(e.flags|=32)}else e.flags|=32;(e.flags&4)!==0&&_w(h,Kt===0?a:a+"_"+Kt,o),u&&(e.flags&4)!==0||(nn===null&&(nn=[]),nn.push(h,Kt===0?n:n+"_"+Kt,t.memoizedProps)),Kt++}else(t.tag!==22||t.memoizedState===null)&&(t.tag===30&&c?e.flags|=t.flags&32:ip(e,t.child,a,n,o,l,c)&&(u=!0));t=t.sibling}return u}function tw(e,t){for(e=e.child;e!==null;){if(e.tag===30){var a=e.memoizedProps,n=e.stateNode,o=En(a,n),l=On(a.default,a.update);if(t){n=n.clones;var c=n===null?null:n.map(N5)}else c=e.memoizedState,e.memoizedState=null;n=e;var u=e.child;Kt=0,o=ip(n,u,o,o,l,c,!1),(e.flags&4)!==0&&o&&(t||pr(e,a.onUpdate))}else(e.subtreeFlags&33554432)!==0&&tw(e,t);e=e.sibling}}var gt=!1,Te=!1,Wa=!1,eh=!1,Tb=typeof WeakSet=="function"?WeakSet:Set,ft=null,en=!1,bl=!1,Jc=!1,Ph=!1;function ZN(e,t,a){if(e=e.containerInfo,um=wr,e=qv(e),zm(e)){if("selectionStart"in e)var n={start:e.selectionStart,end:e.selectionEnd};else e:{n=(n=e.ownerDocument)&&n.defaultView||window;var o=n.getSelection&&n.getSelection();if(o&&o.rangeCount!==0){n=o.anchorNode;var l=o.anchorOffset,c=o.focusNode;o=o.focusOffset;try{n.nodeType,c.nodeType}catch{n=null;break e}var u=0,h=-1,g=-1,$=0,x=0,f=e,b=null;t:for(;;){for(var C;f!==n||l!==0&&f.nodeType!==3||(h=u+l),f!==c||o!==0&&f.nodeType!==3||(g=u+o),f.nodeType===3&&(u+=f.nodeValue.length),(C=f.firstChild)!==null;)b=f,f=C;for(;;){if(f===e)break t;if(b===n&&++$===l&&(h=u),b===c&&++x===o&&(g=u),(C=f.nextSibling)!==null)break;f=b,b=f.parentNode}f=C}n=h===-1||g===-1?null:{start:h,end:g}}else n=null}n=n||{start:0,end:0}}else n=null;for(dm={focusedElem:e,selectionRange:n},wr=!1,a=(a&335544064)===a,ft=t,t=a?9270:1024;ft!==null;){if(e=ft,a&&(n=e.deletions,n!==null))for(l=0;l<n.length;l++)a&&Jh(n[l]);if(e.alternate===null&&(e.flags&2)!==0)a&&Nb(e),ic(a);else{if(e.tag===22){if(n=e.alternate,e.memoizedState!==null){n!==null&&n.memoizedState===null&&a&&Jh(n),ic(a);continue}else if(n!==null&&n.memoizedState!==null){a&&Nb(e),ic(a);continue}}n=e.child,(e.subtreeFlags&t)!==0&&n!==null?(n.return=e,ft=n):(a&&Wy(e),ic(a))}}ra=null}function ic(e){for(;ft!==null;){var t=ft,a=e,n=t.alternate,o=t.flags;switch(t.tag){case 0:case 11:case 15:break;case 1:if((o&1024)!==0&&n!==null){a=void 0,o=n.memoizedProps,n=n.memoizedState;var l=t.stateNode;try{var c=Wi(t.type,o);a=l.getSnapshotBeforeUpdate(c,n),l.__reactInternalSnapshotBeforeUpdate=a}catch(u){Ce(t,t.return,u)}}break;case 3:if((o&1024)!==0){if(n=t.stateNode.containerInfo,a=n.nodeType,a===9)pm(n);else if(a===1)switch(n.nodeName){case"HEAD":case"HTML":case"BODY":pm(n);break;default:n.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;case 30:a&&n!==null&&(a=En(n.memoizedProps,n.stateNode),o=t.memoizedProps,o=On(o.default,o.update),o!=="none"&&Tr(n,a,o,n.memoizedState=[],!0));break;default:if((o&1024)!==0)throw Error(R(163))}if(n=t.sibling,n!==null){n.return=t.return,ft=n;break}ft=t.return}}function aw(e,t,a){var n=a.flags;switch(a.tag){case 0:case 11:case 15:tn(e,a),n&4&&ts(5,a);break;case 1:if(tn(e,a),n&4)if(e=a.stateNode,t===null)try{e.componentDidMount()}catch(c){Ce(a,a.return,c)}else{var o=Wi(a.type,t.memoizedProps);t=t.memoizedState;try{e.componentDidUpdate(o,t,e.__reactInternalSnapshotBeforeUpdate)}catch(c){Ce(a,a.return,c)}}n&64&&Zy(a),n&512&&an(a,a.return);break;case 3:if(tn(e,a),n&64&&(e=a.updateQueue,e!==null)){if(t=null,a.child!==null)switch(a.child.tag){case 27:case 5:t=a.child.stateNode;break;case 1:t=a.child.stateNode}try{iy(e,t)}catch(c){Ce(a,a.return,c)}}break;case 27:t===null&&n&4&&Fy(a);case 26:case 5:tn(e,a),t===null&&n&4&&Xh(a),n&512&&an(a,a.return);break;case 12:tn(e,a);break;case 31:tn(e,a),n&4&&rw(e,a);break;case 13:tn(e,a),n&4&&lw(e,a),n&64&&(e=a.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(a=r5.bind(null,a),U5(e,a))));break;case 22:if(n=a.memoizedState!==null||gt,!n){var l=t!==null&&t.memoizedState!==null||Te;t=gt,o=Te,gt=n,(Te=l)&&!o?(n=2,(a.subtreeFlags&8772)!==0&&(n|=1),Ba(e,a,n)):tn(e,a),gt=t,Te=o}break;case 30:tn(e,a),n&512&&an(a,a.return);break;case 7:n&512&&an(a,a.return);default:tn(e,a)}}function Wh(e,t){for(e=e.child;e!==null;)nw(e,t),e=e.sibling}function nw(e,t){switch(e.tag){case 5:case 26:try{var a=e.stateNode;if(t){var n=a.style;typeof n.setProperty=="function"?n.setProperty("display","none","important"):n.display="none"}else{var o=e.stateNode,l=e.memoizedProps.style,c=l!=null&&l.hasOwnProperty("display")?l.display:null;o.style.display=c==null||typeof c=="boolean"?"":(""+c).trim()}}catch(h){Ce(e,e.return,h)}em(e,t);break;case 6:try{e.stateNode.nodeValue=t?"":e.memoizedProps,ye=!0}catch(h){Ce(e,e.return,h)}break;case 18:try{var u=e.stateNode;t?Bb(u,!0):Bb(e.stateNode,!1)}catch(h){Ce(e,e.return,h)}break;case 22:case 23:e.memoizedState===null&&Wh(e,t);break;default:Wh(e,t)}}function em(e,t){if(e.subtreeFlags&67108864)for(e=e.child;e!==null;){e:{var a=e,n=t;switch(a.tag){case 4:nw(a,n);break e;case 22:a.memoizedState===null&&em(a,n);break e;default:em(a,n)}}e=e.sibling}}function iw(e){var t=e.alternate;t!==null&&(e.alternate=null,iw(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&ru(t)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var je=null,Qt=!1;function qa(e,t,a){for(a=a.child;a!==null;)ow(e,t,a),a=a.sibling}function ow(e,t,a){if(ca&&typeof ca.onCommitFiberUnmount=="function")try{ca.onCommitFiberUnmount(Zl,a)}catch{}switch(a.tag){case 26:Te||$t(a,t),qa(e,t,a),a.memoizedState?a.memoizedState.count--:a.stateNode&&!Te&&(a=a.stateNode,a.parentNode.removeChild(a));break;case 27:Te||$t(a,t),El(a);var n=je,o=Qt;vi(a.type)&&(je=a.stateNode,Qt=!1),qa(e,t,a),Xw(a.stateNode,a.type,a.memoizedProps),je=n,Qt=o;break;case 5:Te||$t(a,t),El(a);case 6:if(a.tag===6&&El(a),n=je,o=Qt,je=null,qa(e,t,a),je=n,Qt=o,je!==null)if(Qt)try{(je.nodeType===9?je.body:je.nodeName==="HTML"?je.ownerDocument.body:je).removeChild(a.stateNode),ye=!0}catch(l){Ce(a,t,l)}else try{je.removeChild(a.stateNode),ye=!0}catch(l){Ce(a,t,l)}break;case 18:je!==null&&(Qt?(e=je,qb(e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,a.stateNode),$r(e)):qb(je,a.stateNode));break;case 4:n=je,o=Qt,je=a.stateNode.containerInfo,Qt=!0,qa(e,t,a),je=n,Qt=o;break;case 0:case 11:case 14:case 15:gi(2,a,t),Te||gi(4,a,t),qa(e,t,a);break;case 1:Te||($t(a,t),n=a.stateNode,typeof n.componentWillUnmount=="function"&&Ky(a,t,n)),qa(e,t,a);break;case 21:qa(e,t,a);break;case 22:Te=(n=Te)||a.memoizedState!==null,qa(e,t,a),Te=n;break;case 30:$t(a,t),qa(e,t,a);break;case 7:Te||$t(a,t),qa(e,t,a);break;default:qa(e,t,a)}}function rw(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{$r(e)}catch(a){Ce(t,t.return,a)}}}function lw(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{$r(e)}catch(a){Ce(t,t.return,a)}}function KN(e){switch(e.tag){case 31:case 13:case 19:var t=e.stateNode;return t===null&&(t=e.stateNode=new Tb),t;case 22:return e=e.stateNode,t=e._retryCache,t===null&&(t=e._retryCache=new Tb),t;default:throw Error(R(435,e.tag))}}function oc(e,t){var a=KN(e);t.forEach(function(n){if(!a.has(n)){a.add(n);var o=l5.bind(null,e,n);n.then(o,o)}})}function qt(e,t,a){var n=t.deletions;if(n!==null)for(var o=0;o<n.length;o++){var l=n[o],c=e,u=t,h=u;e:for(;h!==null;){switch(h.tag){case 27:if(vi(h.type)){je=h.stateNode,Qt=!1;break e}break;case 5:je=h.stateNode,Qt=!1;break e;case 3:case 4:je=h.stateNode.containerInfo,Qt=!0;break e}h=h.return}if(je===null)throw Error(R(160));ow(c,u,l),je=null,Qt=!1,c=l.alternate,c!==null&&(c.return=null),l.return=null}if(t.subtreeFlags&13886)for(t=t.child;t!==null;)sw(t,e,a),t=t.sibling}var La=null;function sw(e,t,a){var n=e.alternate,o=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:if(o&4&&(n=e.updateQueue,n=n!==null?n.events:null,n!==null))for(var l=0;l<n.length;l++){var c=n[l];c.ref.impl=c.nextImpl}qt(t,e,a),Bt(e),o&4&&(gi(3,e,e.return),ts(3,e),gi(5,e,e.return));break;case 1:qt(t,e,a),Bt(e),o&512&&(Te||n===null||$t(n,n.return)),o&64&&gt&&(e=e.updateQueue,e!==null&&(t=e.callbacks,t!==null&&(a=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=a===null?t:a.concat(t))));break;case 26:if(l=La,qt(t,e,a),Bt(e),o&512&&(Te||n===null||$t(n,n.return)),o&4)if(o=n!==null?n.memoizedState:null,a=e.memoizedState,n===null)if(a===null)if(e.stateNode===null)if(gt)e.stateNode=Dw(e.type,e.memoizedProps,t.containerInfo,e);else{e:{t=e.type,a=e.memoizedProps,o=l.ownerDocument||l;t:switch(t){case"title":n=o.getElementsByTagName("title")[0],(!n||n[Fl]||n[xt]||n.namespaceURI==="http://www.w3.org/2000/svg"||n.hasAttribute("itemprop"))&&(n=o.createElement(t),o.head.insertBefore(n,o.querySelector("head > title"))),kt(n,t,a),n[xt]=e,bt(n),t=n;break e;case"link":if(l=Kb("link","href",o).get(t+(a.href||""))){for(c=0;c<l.length;c++)if(n=l[c],n.getAttribute("href")===(a.href==null||a.href===""?null:a.href)&&n.getAttribute("rel")===(a.rel==null?null:a.rel)&&n.getAttribute("title")===(a.title==null?null:a.title)&&n.getAttribute("crossorigin")===(a.crossOrigin==null?null:a.crossOrigin)){l.splice(c,1);break t}}n=o.createElement(t),kt(n,t,a),o.head.appendChild(n);break;case"meta":if(l=Kb("meta","content",o).get(t+(a.content||""))){for(c=0;c<l.length;c++)if(n=l[c],n.getAttribute("content")===(a.content==null?null:""+a.content)&&n.getAttribute("name")===(a.name==null?null:a.name)&&n.getAttribute("property")===(a.property==null?null:a.property)&&n.getAttribute("http-equiv")===(a.httpEquiv==null?null:a.httpEquiv)&&n.getAttribute("charset")===(a.charSet==null?null:a.charSet)){l.splice(c,1);break t}}n=o.createElement(t),kt(n,t,a),o.head.appendChild(n);break;default:throw Error(R(468,t))}n[xt]=e,bt(n),t=n}e.stateNode=t}else gt||bm(l,e.type,e.stateNode);else e.stateNode=Zb(l,a,e.memoizedProps);else o!==a?(o===null?(t=n.stateNode,t===null||Te||t.parentNode.removeChild(t)):o.count--,a===null?gt||bm(l,e.type,e.stateNode):Zb(l,a,e.memoizedProps)):a===null&&e.stateNode!==null&&Pd(e,e.memoizedProps,n.memoizedProps);break;case 27:qt(t,e,a),Bt(e),o&512&&(Te||n===null||$t(n,n.return)),n!==null&&o&4&&Pd(e,e.memoizedProps,n.memoizedProps);break;case 5:if(l=Wa,Wa=!1,qt(t,e,a),Wa=l,Bt(e),o&512&&(Te||n===null||$t(n,n.return)),e.flags&32){t=e.stateNode;try{dr(t,""),ye=!0}catch($){Ce(e,e.return,$)}}o&4&&e.stateNode!=null&&(t=e.memoizedProps,Pd(e,t,n!==null?n.memoizedProps:t)),o&1024&&(eh=!0);break;case 6:if(qt(t,e,a),Bt(e),o&4){if(e.stateNode===null)throw Error(R(162));t=e.memoizedProps,a=e.stateNode;try{a.nodeValue=t,ye=!0}catch($){Ce(e,e.return,$)}}break;case 3:if(ye=!1,kc=null,l=La,La=jl(t.containerInfo),qt(t,e,a),La=l,Bt(e),o&4&&n!==null&&n.memoizedState.isDehydrated)try{$r(t.containerInfo)}catch($){Ce(e,e.return,$)}eh&&(eh=!1,cw(e)),ye=!1;break;case 4:o=Wa,Wa=gt,n=Rf(),l=La,La=jl(e.stateNode.containerInfo),qt(t,e,a),Bt(e),La=l,ye&&bl&&(Jc=!0),ye=n,Wa=o;break;case 12:qt(t,e,a),Bt(e);break;case 31:qt(t,e,a),Bt(e),o&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,oc(e,t)));break;case 13:qt(t,e,a),Bt(e),e.child.flags&8192&&e.memoizedState!==null!=(n!==null&&n.memoizedState!==null)&&(yu=sa()),o&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,oc(e,t)));break;case 22:l=e.memoizedState!==null,c=n!==null&&n.memoizedState!==null;var u=gt,h=Te,g=Wa;gt=u||l,Wa=g||l,Te=h||c,qt(t,e,a),Te=h,Wa=g,gt=u,Bt(e),o&8192&&(t=e.stateNode,t._visibility=l?t._visibility&-2:t._visibility|1,!l||n===null||c||gt||Te||(t=c||Te,a=gt,n=Te,gt=l||gt,Te=t,Xn(e,2),gt=a,Te=n),!l&&Wa||Wh(e,l)),o&4&&(t=e.updateQueue,t!==null&&(a=t.retryQueue,a!==null&&(t.retryQueue=null,oc(e,a))));break;case 19:qt(t,e,a),Bt(e),o&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,oc(e,t)));break;case 30:o&512&&(Te||n===null||$t(n,n.return)),o=Rf(),l=bl,c=(a&335544064)===a,u=e.memoizedProps,bl=c&&On(u.default,u.update)!=="none",qt(t,e,a),Bt(e),c&&n!==null&&ye&&(e.flags|=4),bl=l,ye=o;break;case 21:break;case 7:o&512&&(Te||n===null||$t(n,n.return)),n&&n.stateNode!==null&&(n.stateNode._fragmentFiber=e);default:qt(t,e,a),Bt(e)}}function Bt(e){var t=e.flags;if(t&2){try{for(var a,n=e.return;n!==null;){if(Jy(n)){a=n;break}n=n.return}n=null;for(var o=e.return;o!==null;){if(np(o)){var l=o.stateNode;n===null?n=[l]:n.push(l)}if(ap(o))break;o=o.return}var c=n;if(a==null)throw Error(R(160));switch(a.tag){case 27:var u=a.stateNode,h=Wd(e);Zc(e,h,u,c);break;case 5:var g=a.stateNode;a.flags&32&&(dr(g,""),a.flags&=-33);var $=Wd(e);Zc(e,$,g,c);break;case 3:case 4:var x=a.stateNode.containerInfo,f=Wd(e);Qh(e,f,x,c);break;default:throw Error(R(161))}}catch(b){Ce(e,e.return,b)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function cw(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var t=e;cw(t),t.tag===5&&t.flags&1024&&(t=t.stateNode,wr=!0,t.reset(),wr=!1),e=e.sibling}}function Ho(e,t){if(t.subtreeFlags&9270)for(t=t.child;t!==null;)uw(t,e),t=t.sibling;else tw(t,!1)}function uw(e,t){var a=e.alternate;if(a===null)Zh(e,!1);else switch(e.tag){case 3:if(Ph=en=!1,Sb(),Ho(t,e),!en&&!Jc){if(e=nn,e!==null)for(var n=0;n<e.length;n+=3){a=e[n];var o=e[n+1];Hw(a,e[n+2]),a=a.ownerDocument.documentElement,a!==null&&a.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group("+o+")"})}e=t.containerInfo,e=e.nodeType===9?e.documentElement:e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName===""&&(e.style.viewTransitionName="none",e.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group(root)"}),e.animate({width:[0,0],height:[0,0]},{duration:0,fill:"forwards",pseudoElement:"::view-transition"})),Ph=!0}nn=null;break;case 5:Ho(t,e);break;case 4:n=en,en=!1,Ho(t,e),en&&(Jc=!0),en=n;break;case 22:e.memoizedState===null&&(a.memoizedState!==null?Zh(e,!1):Ho(t,e));break;case 30:n=en,o=Sb(),en=!1,Ho(t,e),en&&(e.flags|=4);var l=e.memoizedProps,c=e.stateNode;t=En(l,c),c=En(a.memoizedProps,c);var u=On(l.default,l.update);u==="none"?t=!1:(l=a.memoizedState,a.memoizedState=null,a=e.child,Kt=0,t=ip(e,a,t,c,u,l,!0),Kt!==(l===null?0:l.length)&&(e.flags|=32)),(e.flags&4)!==0&&t?(pr(e,e.memoizedProps.onUpdate),nn=o):o!==null&&(o.push.apply(o,nn),nn=o),en=(e.flags&32)!==0?!0:n;break;default:Ho(t,e)}}function tn(e,t){if(t.subtreeFlags&8772)for(t=t.child;t!==null;)aw(e,t.alternate,t),t=t.sibling}function Xn(e,t){for(e=e.child;e!==null;){var a=e,n=t;switch(a.tag){case 0:case 11:case 14:case 15:gi(4,a,a.return),Xn(a,n);break;case 1:$t(a,a.return);var o=a.stateNode;typeof o.componentWillUnmount=="function"&&Ky(a,a.return,o),Xn(a,n);break;case 27:(n&2)!==0&&Xw(a.stateNode,a.type,a.memoizedProps);case 5:$t(a,a.return),a.tag!==5&&a.tag!==27||El(a),Xn(a,n);break;case 6:El(a);break;case 26:$t(a,a.return),o=a.stateNode,a.memoizedState!==null||o===null||Te||o.parentNode.removeChild(o),Xn(a,n);break;case 22:a.memoizedState===null&&Xn(a,n);break;case 30:$t(a,a.return),Xn(a,n);break;case 7:$t(a,a.return);default:Xn(a,n)}e=e.sibling}}function Ba(e,t,a){for(a=(t.subtreeFlags&8772)!==0?a:a&-2,t=t.child;t!==null;){var n=t.alternate,o=e,l=t,c=l.flags,u=(a&1)!==0;switch(l.tag){case 0:case 11:case 15:Ba(o,l,a),ts(4,l);break;case 1:if(Ba(o,l,a),n=l,o=n.stateNode,typeof o.componentDidMount=="function")try{o.componentDidMount()}catch($){Ce(n,n.return,$)}if(n=l,o=n.updateQueue,o!==null){var h=n.stateNode;try{var g=o.shared.hiddenCallbacks;if(g!==null)for(o.shared.hiddenCallbacks=null,o=0;o<g.length;o++)ny(g[o],h)}catch($){Ce(n,n.return,$)}}u&&c&64&&Zy(l),an(l,l.return);break;case 27:(a&2)!==0&&Fy(l);case 5:l.tag!==5&&l.tag!==27||xb(l),Ba(o,l,a),u&&n===null&&c&4&&Xh(l),an(l,l.return);break;case 6:xb(l);break;case 26:h=l.stateNode,l.memoizedState!==null||h===null||gt||bm(jl(h.ownerDocument),l.type,h),Ba(o,l,a),u&&n===null&&c&4&&Xh(l),an(l,l.return);break;case 12:Ba(o,l,a);break;case 31:Ba(o,l,a),u&&c&4&&rw(o,l);break;case 13:Ba(o,l,a),u&&c&4&&lw(o,l);break;case 22:l.memoizedState===null&&Ba(o,l,a),an(l,l.return);break;case 30:Ba(o,l,a),an(l,l.return);break;case 7:an(l,l.return);default:Ba(o,l,a)}t=t.sibling}}function op(e,t){var a=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),e=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(e=t.memoizedState.cachePool.pool),e!==a&&(e!=null&&e.refCount++,a!=null&&Wl(a))}function rp(e,t){e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&Wl(e))}function wa(e,t,a,n){var o=(a&335544064)===a;if(t.subtreeFlags&(o?10262:10256))for(t=t.child;t!==null;)dw(e,t,a,n),t=t.sibling;else o&&ew(t)}function dw(e,t,a,n){var o=(a&335544064)===a;o&&t.alternate===null&&t.return!==null&&t.return.alternate!==null&&xc(t);var l=t.flags;switch(t.tag){case 0:case 11:case 15:wa(e,t,a,n),l&2048&&ts(9,t);break;case 1:wa(e,t,a,n);break;case 3:wa(e,t,a,n),o&&Ph&&(e=e.containerInfo,e=e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,e.style.viewTransitionName==="root"&&(e.style.viewTransitionName=""),e=e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName==="none"&&(e.style.viewTransitionName="")),l&2048&&(l=null,t.alternate!==null&&(l=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==l&&(t.refCount++,l!=null&&Wl(l)));break;case 12:if(l&2048){wa(e,t,a,n),l=t.stateNode;try{var c=t.memoizedProps,u=c.id,h=c.onPostCommit;typeof h=="function"&&h(u,t.alternate===null?"mount":"update",l.passiveEffectDuration,-0)}catch(g){Ce(t,t.return,g)}}else wa(e,t,a,n);break;case 31:wa(e,t,a,n);break;case 13:wa(e,t,a,n);break;case 23:break;case 22:c=t.stateNode,u=t.alternate,t.memoizedState!==null?(o&&u!==null&&u.memoizedState===null&&xc(u),c._visibility&2?wa(e,t,a,n):Cl(e,t)):(o&&u!==null&&u.memoizedState!==null&&xc(t),c._visibility&2?wa(e,t,a,n):(c._visibility|=2,Uo(e,t,a,n,(t.subtreeFlags&10256)!==0||!1))),l&2048&&op(u,t);break;case 24:wa(e,t,a,n),l&2048&&rp(t.alternate,t);break;case 30:o&&(l=t.alternate,l!==null&&(dn(l.child,!0),dn(t.child,!0))),wa(e,t,a,n);break;default:wa(e,t,a,n)}}function Uo(e,t,a,n,o){for(o=o&&((t.subtreeFlags&10256)!==0||!1),t=t.child;t!==null;){var l=e,c=t,u=a,h=n,g=c.flags;switch(c.tag){case 0:case 11:case 15:Uo(l,c,u,h,o),ts(8,c);break;case 23:break;case 22:var $=c.stateNode;c.memoizedState!==null?$._visibility&2?Uo(l,c,u,h,o):Cl(l,c):($._visibility|=2,Uo(l,c,u,h,o)),o&&g&2048&&op(c.alternate,c);break;case 24:Uo(l,c,u,h,o),o&&g&2048&&rp(c.alternate,c);break;default:Uo(l,c,u,h,o)}t=t.sibling}}function Cl(e,t){if(t.subtreeFlags&10256)for(t=t.child;t!==null;){var a=e,n=t,o=n.flags;switch(n.tag){case 22:Cl(a,n),o&2048&&op(n.alternate,n);break;case 24:Cl(a,n),o&2048&&rp(n.alternate,n);break;default:Cl(a,n)}t=t.sibling}}var Ui=8192;function _i(e,t,a){if(e.subtreeFlags&Ui)for(e=e.child;e!==null;)hw(e,t,a),e=e.sibling}function hw(e,t,a){switch(e.tag){case 26:_i(e,t,a),e.flags&Ui&&(e.memoizedState!==null?W5(a,La,e.memoizedState,e.memoizedProps):(e=e.stateNode,(t&335544128)===t&&Fb(a,e)));break;case 5:_i(e,t,a),e.flags&Ui&&(e=e.stateNode,(t&335544128)===t&&Fb(a,e));break;case 3:case 4:var n=La;La=jl(e.stateNode.containerInfo),_i(e,t,a),La=n;break;case 22:e.memoizedState===null&&(n=e.alternate,n!==null&&n.memoizedState!==null?(n=Ui,Ui=16777216,_i(e,t,a),Ui=n):_i(e,t,a));break;case 30:if((e.flags&Ui)!==0&&(n=e.memoizedProps.name,n!=null&&n!=="auto")){var o=e.stateNode;o.paired=null,ra===null&&(ra=new Map),ra.set(n,o)}_i(e,t,a);break;default:_i(e,t,a)}}function mw(e){var t=e.alternate;if(t!==null&&(e=t.child,e!==null)){t.child=null;do t=e.sibling,e.sibling=null,e=t;while(e!==null)}}function ul(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var a=0;a<t.length;a++){var n=t[a];ft=n,gw(n,e)}mw(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)pw(e),e=e.sibling}function pw(e){switch(e.tag){case 0:case 11:case 15:ul(e),e.flags&2048&&gi(9,e,e.return);break;case 3:ul(e);break;case 12:ul(e);break;case 22:var t=e.stateNode;e.memoizedState!==null&&t._visibility&2&&(e.return===null||e.return.tag!==13)?(t._visibility&=-3,Nc(e)):ul(e);break;default:ul(e)}}function Nc(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var a=0;a<t.length;a++){var n=t[a];ft=n,gw(n,e)}mw(e)}for(e=e.child;e!==null;){switch(t=e,t.tag){case 0:case 11:case 15:gi(8,t,t.return),Nc(t);break;case 22:a=t.stateNode,a._visibility&2&&(a._visibility&=-3,Nc(t));break;default:Nc(t)}e=e.sibling}}function gw(e,t){for(;ft!==null;){var a=ft;switch(a.tag){case 0:case 11:case 15:gi(8,a,t);break;case 23:case 22:if(a.memoizedState!==null&&a.memoizedState.cachePool!==null){var n=a.memoizedState.cachePool.pool;n!=null&&n.refCount++}break;case 24:Wl(a.memoizedState.cache)}if(n=a.child,n!==null)n.return=a,ft=n;else e:for(a=e;ft!==null;){n=ft;var o=n.sibling,l=n.return;if(iw(n),n===a){ft=null;break e}if(o!==null){o.return=l,ft=o;break e}ft=l}}}var JN={getCacheForType:function(e){var t=Nt(tt),a=t.data.get(e);return a===void 0&&(a=e(),t.data.set(e,a)),a},cacheSignal:function(){return Nt(tt).controller.signal}},FN=typeof WeakMap=="function"?WeakMap:Map,$e=0,Oe=null,he=null,me=0,ke=0,na=null,Wn=!1,kr=!1,lp=!1,Rn=0,Je=0,fi=0,Xi=0,Fc=0,la=0,mr=0,Al=null,Zt=null,tm=!1,yu=0,fw=0,Pc=1/0,Wc=null,si=null,Xe=0,Ga=null,eo=null,un=0,am=0,nm=null,bw=null,rr=null,lr=null,sr=null,zl=0,Sc=null;function da(){return($e&2)!==0&&me!==0?me&-me:W.T!==null?cp():$v()}function vw(){if(la===0)if((me&536870912)===0||re){var e=Xs;Xs<<=1,(Xs&3932160)===0&&(Xs=262144),la=e}else la=536870912;return e=Et.current,e!==null&&(e.flags|=32),la}function pr(e,t){if(t!=null){var a=e.stateNode,n=a.ref;n===null&&(n=a.ref=Uw(En(e.memoizedProps,a))),lr===null&&(lr=[]),lr.push(t.bind(null,n))}}function Ft(e,t,a){(e===Oe&&(ke===2||ke===9)||e.cancelPendingCommit!==null)&&(gr(e,0),ei(e,me,la,!1)),Jl(e,a),(($e&2)===0||e!==Oe)&&(e===Oe&&(($e&2)===0&&(Xi|=a),Je===4&&ei(e,me,la,!1)),mn(e))}function yw(e,t,a){if(($e&6)!==0)throw Error(R(327));var n=!a&&(t&127)===0&&(t&e.expiredLanes)===0||Kl(e,t),o=n?e5(e,t):th(e,t,!0),l=n;do{if(o===0){kr&&!n&&ei(e,t,0,!1);break}else{if(a=e.current.alternate,l&&!PN(a)){o=th(e,t,!1),l=!1;continue}if(o===2){if(l=t,e.errorRecoveryDisabledLanes&l)var c=0;else c=e.pendingLanes&-536870913,c=c!==0?c:c&536870912?536870912:0;if(c!==0){t=c;e:{var u=e;o=Al;var h=u.current.memoizedState.isDehydrated;if(h&&(gr(u,c).flags|=256),c=th(u,c,!1),c!==2&&c!==6){if(lp&&!h){u.errorRecoveryDisabledLanes|=l,Xi|=l,o=4;break e}l=Zt,Zt=o,l!==null&&(Zt===null?Zt=l:Zt.push.apply(Zt,l))}o=c}if(l=!1,o!==2)continue}}if(o===1){gr(e,0),ei(e,t,0,!0);break}e:{switch(n=e,l=o,l){case 0:case 1:throw Error(R(345));case 4:if((t&4194048)!==t&&(t&62914560)!==t)break;case 6:ei(n,t,la,!Wn);break e;case 2:Zt=null;break;case 3:case 5:break;default:throw Error(R(329))}if((t&62914560)===t&&(o=yu+300-sa(),10<o)){if(ei(n,t,la,!Wn),ou(n,0,!0)!==0)break e;un=t,n.timeoutHandle=dp(kb.bind(null,n,a,Zt,Wc,tm,t,la,Xi,mr,Wn,l,"Throttled",-0,0),o);break e}kb(n,a,Zt,Wc,tm,t,la,Xi,mr,Wn,l,null,-0,0)}}break}while(!0);mn(e)}function kb(e,t,a,n,o,l,c,u,h,g,$,x,f,b){e.timeoutHandle=-1;var C=t.subtreeFlags,k=(l&335544064)===l;if(x=null,(k||C&8192||(C&16785408)===16785408)&&(x={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:rn},ra=null,hw(t,l,x),k&&(C=x,k=e.containerInfo,k=(k.nodeType===9?k:k.ownerDocument).__reactViewTransition,k!=null&&(C.count++,C.waitingForViewTransition=!0,C=Gl.bind(C),k.finished.then(C,C))),C=(l&62914560)===l?yu-sa():(l&4194048)===l?fw-sa():0,C=eS(x,C),C!==null)){un=l,e.cancelPendingCommit=C(Cb.bind(null,e,t,l,a,n,o,c,u,h,g,$,x,null,f,b)),ei(e,l,c,!g);return}Cb(e,t,l,a,n,o,c,u,h,g,$,x)}function PN(e){for(var t=e;;){var a=t.tag;if((a===0||a===11||a===15)&&t.flags&16384&&(a=t.updateQueue,a!==null&&(a=a.stores,a!==null)))for(var n=0;n<a.length;n++){var o=a[n],l=o.getSnapshot;o=o.value;try{if(!ha(l(),o))return!1}catch{return!1}}if(a=t.child,t.subtreeFlags&16384&&a!==null)a.return=t,t=a;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function ei(e,t,a,n){t=fv(e,t),t&=~Fc,t&=~Xi,e.suspendedLanes|=t,e.pingedLanes&=~t,n&&(e.warmLanes|=t),n=e.expirationTimes;for(var o=t;0<o;){var l=31-ua(o),c=1<<l;n[l]=-1,o&=~c}a!==0&&vv(e,a,t)}function wu(){return($e&6)===0?(as(0,!1),!1):!0}function sp(){if(he!==null){if(ke===0)var e=he.return;else e=he,Nn=oo=null,Ym(e),nr=null,Hl=0,e=he;for(;e!==null;)Qy(e.alternate,e),e=e.return;he=null}}function gr(e,t){var a=e.timeoutHandle;return a!==-1&&(e.timeoutHandle=-1,w5(a)),a=e.cancelPendingCommit,a!==null&&(e.cancelPendingCommit=null,a()),un=0,sp(),Oe=e,he=a=Sn(e.current,null),me=t,ke=0,na=null,Wn=!1,kr=Kl(e,t),lp=!1,mr=la=Fc=Xi=fi=Je=0,Zt=Al=null,tm=!1,Rn=fv(e,t),uu(),a}function ww(e,t){ne=null,W.H=Yc,t===Sr||t===mu?(t=Wf(),ke=3):t===Hm?(t=Wf(),ke=4):ke=t===Wm?8:t!==null&&typeof t=="object"&&typeof t.then=="function"?6:1,na=t,he===null&&(Je=1,Xc(e,Ta(t,e.current)))}function $w(){var e=Et.current;return e===null?!0:(me&4194048)===me?Mt===null:(me&62914560)===me||(me&536870912)!==0?e===Mt:!1}function xw(){var e=W.H;return W.H=Yc,e===null?Yc:e}function Nw(){var e=W.A;return W.A=JN,e}function eu(){Je=4,Wn||(me&4194048)!==me&&Et.current!==null||(kr=!0),(fi&134217727)===0&&(Xi&134217727)===0||Oe===null||ei(Oe,me,la,!1)}function th(e,t,a){var n=$e;$e|=2;var o=xw(),l=Nw();(Oe!==e||me!==t)&&(Wc=null,gr(e,t)),t=!1;var c=Je;e:do try{if(ke!==0&&he!==null){var u=he,h=na;switch(ke){case 8:sp(),c=6;break e;case 3:case 2:case 9:case 6:Et.current===null&&(t=!0);var g=ke;if(ke=0,na=null,Po(e,u,h,g),a&&kr){c=0;break e}break;default:g=ke,ke=0,na=null,Po(e,u,h,g)}}WN(),c=Je;break}catch($){ww(e,$)}while(!0);return t&&e.shellSuspendCounter++,Nn=oo=null,$e=n,W.H=o,W.A=l,he===null&&(Oe=null,me=0,uu()),c}function WN(){for(;he!==null;)Sw(he)}function e5(e,t){var a=$e;$e|=2;var n=xw(),o=Nw();Oe!==e||me!==t?(Wc=null,Pc=sa()+500,gr(e,t)):kr=Kl(e,t);e:do try{if(ke!==0&&he!==null){t=he;var l=na;t:switch(ke){case 1:ke=0,na=null,Po(e,t,l,1);break;case 2:case 9:if(Pf(l)){ke=0,na=null,Eb(t);break}t=function(){ke!==2&&ke!==9||Oe!==e||(ke=7),mn(e)},l.then(t,t);break e;case 3:ke=7;break e;case 4:ke=5;break e;case 7:Pf(l)?(ke=0,na=null,Eb(t)):(ke=0,na=null,Po(e,t,l,7));break;case 5:var c=null;switch(he.tag){case 26:c=he.memoizedState;case 5:case 27:var u=he;if(c?Kw(c):u.stateNode.complete){ke=0,na=null;var h=u.sibling;if(h!==null)he=h;else{var g=u.return;g!==null?(he=g,$u(g)):he=null}break t}}ke=0,na=null,Po(e,t,l,5);break;case 6:ke=0,na=null,Po(e,t,l,6);break;case 8:sp(),Je=6;break e;default:throw Error(R(462))}}t5();break}catch($){ww(e,$)}while(!0);return Nn=oo=null,W.H=n,W.A=o,$e=a,he!==null?0:(Oe=null,me=0,uu(),Je)}function t5(){for(;he!==null&&!vx();)Sw(he)}function Sw(e){var t=Xy(e.alternate,e,Rn);e.memoizedProps=e.pendingProps,t===null?$u(e):he=t}function Eb(e){var t=e,a=t.alternate;switch(t.tag){case 15:case 0:t=gb(a,t,t.pendingProps,t.type,void 0,me);break;case 11:t=gb(a,t,t.pendingProps,t.type.render,t.ref,me);break;case 5:Ym(t);var n=t;n===vt&&(re?(Ic(n),n.tag===5&&n.stateNode!=null&&(Ie=n.stateNode)):(Ic(n),re=!0));default:Qy(a,t),t=he=Zv(t,Rn),t=Xy(a,t,Rn)}e.memoizedProps=e.pendingProps,t===null?$u(e):he=t}function Po(e,t,a,n){Nn=oo=null,Ym(t),nr=null,Hl=0;var o=t.return;try{if(LN(e,o,t,a,me)){Je=1,Xc(e,Ta(a,e.current)),he=null;return}}catch(l){if(o!==null)throw he=o,l;Je=1,Xc(e,Ta(a,e.current)),he=null;return}t.flags&32768?(re||n===1?e=!0:kr||(me&536870912)!==0?e=!1:(Wn=e=!0,(n===2||n===9||n===3||n===6)&&(n=Et.current,n!==null&&n.tag===13&&(n.flags|=16384))),Tw(t,e)):$u(t)}function $u(e){var t=e;do{if((t.flags&32768)!==0){Tw(t,Wn);return}e=t.return;var a=XN(t.alternate,t,Rn);if(a!==null){he=a;return}if(t=t.sibling,t!==null){he=t;return}he=t=e}while(t!==null);Je===0&&(Je=5)}function Tw(e,t){do{var a=QN(e.alternate,e);if(a!==null){a.flags&=32767,he=a;return}if(a=e.return,a!==null&&(a.flags|=32768,a.subtreeFlags=0,a.deletions=null),!t&&(e=e.sibling,e!==null)){he=e;return}he=e=a}while(e!==null);Je=6,he=null}function Cb(e,t,a,n,o,l,c,u,h,g,$,x){e.cancelPendingCommit=null;do xu();while(Xe!==0);if(($e&6)!==0)throw Error(R(327));if(t!==null){if(t===e.current)throw Error(R(177));e===Oe&&(he=Oe=null,me=0),eo=t,Ga=e,un=a,nm=o,bw=n,a5(e,t,a,c,u,h,x)}}function a5(e,t,a,n,o,l,c){var u=t.lanes|t.childLanes;if(am=u,u|=Rm,Cx(e,a,u,n,o,l),lr=null,(a&335544064)===a?(sr=zN(e),n=10262):(sr=null,n=10256),(t.subtreeFlags&n)!==0||(t.flags&n)!==0?(e.callbackNode=null,e.callbackPriority=0,s5(Oc,function(){return lm(),null})):(e.callbackNode=null,e.callbackPriority=0),Kc=!1,n=(t.flags&13878)!==0,(t.subtreeFlags&13878)!==0||n){n=W.T,W.T=null,o=xe.p,xe.p=2,l=$e,$e|=4;try{ZN(e,t,a)}finally{$e=l,xe.p=o,W.T=n}}Xe=1,Kc?rr=k5(c,e.containerInfo,sr,im,om,i5,rm,lm,n5,null,null):(im(),om(),rm())}function n5(e){if(Xe!==0){var t=Ga.onRecoverableError;t(e,{componentStack:null})}}function i5(){Xe===3&&(Xe=0,uw(eo,Ga),Xe=4)}function im(){if(Xe===1){Xe=0;var e=Ga,t=eo,a=un,n=(t.flags&13878)!==0;if((t.subtreeFlags&13878)!==0||n){n=W.T,W.T=null;var o=xe.p;xe.p=2;var l=$e;$e|=4;try{bl=Jc=!1,sw(t,e,a),a=dm;var c=qv(e.containerInfo),u=a.focusedElem,h=a.selectionRange;if(c!==u&&u&&u.ownerDocument&&Uv(u.ownerDocument.documentElement,u)){if(h!==null&&zm(u)){var g=h.start,$=h.end;if($===void 0&&($=g),"selectionStart"in u)u.selectionStart=g,u.selectionEnd=Math.min($,u.value.length);else{var x=u.ownerDocument||document,f=x&&x.defaultView||window;if(f.getSelection){var b=f.getSelection(),C=u.textContent.length,k=Math.min(h.start,C),M=h.end===void 0?k:Math.min(h.end,C);!b.extend&&k>M&&(c=M,M=k,k=c);var w=Gf(u,k),y=Gf(u,M);if(w&&y&&(b.rangeCount!==1||b.anchorNode!==w.node||b.anchorOffset!==w.offset||b.focusNode!==y.node||b.focusOffset!==y.offset)){var v=x.createRange();v.setStart(w.node,w.offset),b.removeAllRanges(),k>M?(b.addRange(v),b.extend(y.node,y.offset)):(v.setEnd(y.node,y.offset),b.addRange(v))}}}}for(x=[],b=u;b=b.parentNode;)b.nodeType===1&&x.push({element:b,left:b.scrollLeft,top:b.scrollTop});for(typeof u.focus=="function"&&u.focus(),u=0;u<x.length;u++){var S=x[u];S.element.scrollLeft=S.left,S.element.scrollTop=S.top}}wr=!!um,dm=um=null}finally{$e=l,xe.p=o,W.T=n}}e.current=t,Xe=2}}function om(){if(Xe===2){Xe=0;var e=Ga,t=eo,a=(t.flags&8772)!==0;if((t.subtreeFlags&8772)!==0||a){a=W.T,W.T=null;var n=xe.p;xe.p=2;var o=$e;$e|=4;try{aw(e,t.alternate,t)}finally{$e=o,xe.p=n,W.T=a}}Xe=3}}function rm(){if(Xe===4||Xe===3){Xe=0;var e=rr;rr=null,yx();var t=Ga,a=eo,n=un,o=bw,l=(n&335544064)===n?10262:10256;if((a.subtreeFlags&l)!==0||(a.flags&l)!==0?Xe=5:(Xe=0,eo=Ga=null,kw(t,t.pendingLanes)),l=t.pendingLanes,l===0&&(si=null),Sm(n),a=a.stateNode,ca&&typeof ca.onCommitFiberRoot=="function")try{ca.onCommitFiberRoot(Zl,a,void 0,(a.current.flags&128)===128)}catch{}if(o!==null){a=W.T,l=xe.p,xe.p=2,W.T=null;try{for(var c=t.onRecoverableError,u=0;u<o.length;u++){var h=o[u];c(h.value,{componentStack:h.stack})}}finally{W.T=a,xe.p=l}}if(o=lr,c=sr,sr=null,o!==null&&(lr=null,c===null&&(c=[]),e!==null))for(h=0;h<o.length;h++)a=(0,o[h])(c),a!==void 0&&e.finished.finally(a);(un&3)!==0&&xu(),mn(t),l=t.pendingLanes,(n&261930)!==0&&(l&42)!==0?t===Sc?zl++:(zl=0,Sc=t):(zl=0,Sc=null),as(0,!1)}}function kw(e,t){(e.pooledCacheLanes&=t)===0&&(t=e.pooledCache,t!=null&&(e.pooledCache=null,Wl(t)))}function xu(){return rr!==null&&(rr.skipTransition(),rr=null),im(),om(),rm(),lm()}function lm(){if(Xe!==5)return!1;var e=Ga,t=am;am=0;var a=Sm(un),n=W.T,o=xe.p;try{xe.p=32>a?32:a,W.T=null,a=nm,nm=null;var l=Ga,c=un;if(Xe=0,eo=Ga=null,un=0,($e&6)!==0)throw Error(R(331));var u=$e;if($e|=4,pw(l.current),dw(l,l.current,c,a),$e=u,as(0,!1),ca&&typeof ca.onPostCommitFiberRoot=="function")try{ca.onPostCommitFiberRoot(Zl,l)}catch{}return!0}finally{xe.p=o,W.T=n,kw(e,t)}}function Ab(e,t,a){t=Ta(a,t),t=qh(e.stateNode,t,2),e=oi(e,t,2),e!==null&&(Jl(e,2),mn(e))}function Ce(e,t,a){if(e.tag===3)Ab(e,e,a);else for(;t!==null;){if(t.tag===3){Ab(t,e,a);break}else if(t.tag===1){var n=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof n.componentDidCatch=="function"&&(si===null||!si.has(n))){e=Ta(a,e),a=By(2),n=oi(t,a,2),n!==null&&(Ly(a,n,t,e),Jl(n,2),mn(n));break}}t=t.return}}function ah(e,t,a){var n=e.pingCache;if(n===null){n=e.pingCache=new FN;var o=new Set;n.set(t,o)}else o=n.get(t),o===void 0&&(o=new Set,n.set(t,o));o.has(a)||(lp=!0,o.add(a),e=o5.bind(null,e,t,a),t.then(e,e))}function o5(e,t,a){var n=e.pingCache;n!==null&&n.delete(t),e.pingedLanes|=e.suspendedLanes&a,e.warmLanes&=~a,Oe===e&&(me&a)===a&&((Je===4||Je===3&&(me&62914560)===me&&300>sa()-yu)&&($e&2)===0?gr(e,0):Fc|=a,mr===me&&(mr=0)),mn(e)}function Ew(e,t){t===0&&(t=bv()),e=io(e,t),e!==null&&(Jl(e,t),mn(e))}function r5(e){var t=e.memoizedState,a=0;t!==null&&(a=t.retryLane),Ew(e,a)}function l5(e,t){var a=0;switch(e.tag){case 31:case 13:var n=e.stateNode,o=e.memoizedState;o!==null&&(a=o.retryLane);break;case 19:n=e.stateNode;break;case 22:n=e.stateNode._retryCache;break;default:throw Error(R(314))}n!==null&&n.delete(t),Ew(e,a)}function s5(e,t){return xm(e,t)}var fr=null,qo=null,sm=!1,tu=!1,nh=!1,ti=0;function mn(e){e!==qo&&e.next===null&&(qo===null?fr=qo=e:qo=qo.next=e),tu=!0,sm||(sm=!0,u5())}function as(e,t){if(!nh&&tu){nh=!0;do for(var a=!1,n=fr;n!==null;){if(!t)if(e!==0){var o=n.pendingLanes;if(o===0)var l=0;else{var c=n.suspendedLanes,u=n.pingedLanes;l=(1<<31-ua(42|e)+1)-1,l&=o&~(c&~u),l=l&201326741?l&201326741|1:l?l|2:0}l!==0&&(a=!0,zb(n,l))}else l=me,l=ou(n,n===Oe?l:0,n.cancelPendingCommit!==null||n.timeoutHandle!==-1),(l&3)===0||Kl(n,l)||(a=!0,zb(n,l));n=n.next}while(a);nh=!1}}function c5(){Cw()}function Cw(){tu=sm=!1;var e=0;ti!==0&&y5()&&(e=ti);for(var t=sa(),a=null,n=fr;n!==null;){var o=n.next,l=Aw(n,t);l===0?(n.next=null,a===null?fr=o:a.next=o,o===null&&(qo=a)):(a=n,(e!==0||(l&3)!==0)&&(tu=!0)),n=o}Xe!==0&&Xe!==5||as(e,!1),ti!==0&&(ti=0)}function Aw(e,t){for(var a=e.suspendedLanes,n=e.pingedLanes,o=e.expirationTimes,l=e.pendingLanes&-62914561;0<l;){var c=31-ua(l),u=1<<c,h=o[c];h===-1?((u&a)===0||(u&n)!==0)&&(o[c]=Ex(u,t)):h<=t&&(e.expiredLanes|=u),l&=~u}if(t=Oe,a=me,a=ou(e,e===t?a:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),n=e.callbackNode,a===0||e===t&&(ke===2||ke===9)||e.cancelPendingCommit!==null)return n!==null&&n!==null&&Dd(n),e.callbackNode=null,e.callbackPriority=0;if((a&3)===0||Kl(e,a)){if(t=a&-a,t===e.callbackPriority)return t;switch(n!==null&&Dd(n),Sm(a)){case 2:case 8:a=pv;break;case 32:a=Oc;break;case 268435456:a=gv;break;default:a=Oc}return n=zw.bind(null,e),a=xm(a,n),e.callbackPriority=t,e.callbackNode=a,t}return n!==null&&n!==null&&Dd(n),e.callbackPriority=2,e.callbackNode=null,2}function zw(e,t){if(Xe!==0&&Xe!==5)return e.callbackNode=null,e.callbackPriority=0,null;var a=e.callbackNode;if(xu()&&e.callbackNode!==a)return null;var n=me;return n=ou(e,e===Oe?n:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),n===0?null:(yw(e,n,t),Aw(e,sa()),e.callbackNode!=null&&e.callbackNode===a?zw.bind(null,e):null)}function zb(e,t){if(xu())return null;yw(e,t,!0)}function u5(){$5(function(){($e&6)!==0?xm(mv,c5):Cw()})}function cp(){if(ti===0){var e=Ji;e===0&&(e=Ys,Ys<<=1,(Ys&261888)===0&&(Ys=256)),ti=e}return ti}function Rb(e){return e==null||typeof e=="symbol"||typeof e=="boolean"?null:typeof e=="function"?e:hc(e)}function d5(e,t,a,n,o){if(t==="submit"&&a&&a.stateNode===o){var l=Rb((o[Wt]||null).action),c=n.submitter;c&&(t=(t=c[Wt]||null)?Rb(t.formAction):c.getAttribute("formAction"),t!==null&&(l=t,c=null));var u=new lu("action","action",null,n,o);e.push({event:u,listeners:[{instance:null,listener:function(){if(n.defaultPrevented){if(ti!==0){var h=new FormData(o,c);Ih(a,{pending:!0,data:h,method:o.method,action:l},null,h)}}else typeof l=="function"&&(u.preventDefault(),h=new FormData(o,c),Ih(a,{pending:!0,data:h,method:o.method,action:l},l,h))},currentTarget:o}]})}}for(rc=0;rc<Eh.length;rc++)lc=Eh[rc],Mb=lc.toLowerCase(),Ob=lc[0].toUpperCase()+lc.slice(1),Ya(Mb,"on"+Ob);var lc,Mb,Ob,rc;Ya(Lv,"onAnimationEnd");Ya(jv,"onAnimationIteration");Ya(Gv,"onAnimationStart");Ya("dblclick","onDoubleClick");Ya("focusin","onFocus");Ya("focusout","onBlur");Ya(xN,"onTransitionRun");Ya(NN,"onTransitionStart");Ya(SN,"onTransitionCancel");Ya(Yv,"onTransitionEnd");ur("onMouseEnter",["mouseout","mouseover"]);ur("onMouseLeave",["mouseout","mouseover"]);ur("onPointerEnter",["pointerout","pointerover"]);ur("onPointerLeave",["pointerout","pointerover"]);ao("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));ao("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));ao("onBeforeInput",["compositionend","keypress","textInput","paste"]);ao("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));ao("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));ao("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var ql="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),h5=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(ql));function Rw(e,t){t=(t&4)!==0;for(var a=0;a<e.length;a++){var n=e[a],o=n.event;n=n.listeners;e:{var l=void 0;if(t)for(var c=n.length-1;0<=c;c--){var u=n[c],h=u.instance,g=u.currentTarget;if(u=u.listener,h!==l&&o.isPropagationStopped())break e;l=u,o.currentTarget=g;try{l(o)}catch($){Dc($)}o.currentTarget=null,l=h}else for(c=0;c<n.length;c++){if(u=n[c],h=u.instance,g=u.currentTarget,u=u.listener,h!==l&&o.isPropagationStopped())break e;l=u,o.currentTarget=g;try{l(o)}catch($){Dc($)}o.currentTarget=null,l=h}}}}function de(e,t){var a=t[Ef];a===void 0&&(a=t[Ef]=new Set);var n=e+"__bubble";a.has(n)||(Mw(t,e,2,!1),a.add(n))}function ih(e,t,a){var n=0;t&&(n|=4),Mw(a,e,n,t)}var sc="_reactListening"+Math.random().toString(36).slice(2);function up(e){if(!e[sc]){e[sc]=!0,Nv.forEach(function(a){a!=="selectionchange"&&(h5.has(a)||ih(a,!1,e),ih(a,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[sc]||(t[sc]=!0,ih("selectionchange",!1,t))}}function Mw(e,t,a,n){switch(a0(t)){case 2:var o=iS;break;case 8:o=oS;break;default:o=bp}a=o.bind(null,t,a,e),o=void 0,!Nh||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(o=!0),n?o!==void 0?e.addEventListener(t,a,{capture:!0,passive:o}):e.addEventListener(t,a,!0):o!==void 0?e.addEventListener(t,a,{passive:o}):e.addEventListener(t,a,!1)}function oh(e,t,a,n,o){var l=n;if((t&1)===0&&(t&2)===0&&n!==null)e:for(;;){if(n===null)return;var c=n.tag;if(c===3||c===4){var u=n.stateNode.containerInfo;if(u===o)break;if(c===4)for(c=n.return;c!==null;){var h=c.tag;if((h===3||h===4)&&c.stateNode.containerInfo===o)return;c=c.return}for(;u!==null;){if(c=qi(u),c===null)return;if(h=c.tag,h===5||h===6||h===26||h===27){n=l=c;continue e}u=u.parentNode}}n=n.return}Rv(function(){var g=l,$=km(a),x=[];e:{var f=Xv.get(e);if(f!==void 0){var b=lu,C=e;switch(e){case"keypress":if(pc(a)===0)break e;case"keydown":case"keyup":b=Px;break;case"focusin":C="focus",b=Bd;break;case"focusout":C="blur",b=Bd;break;case"beforeblur":case"afterblur":b=Bd;break;case"click":if(a.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":b=Df;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":b=qx;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":b=nN;break;case Lv:case jv:case Gv:b=jx;break;case Yv:b=oN;break;case"scroll":case"scrollend":b=Ix;break;case"wheel":b=lN;break;case"copy":case"cut":case"paste":b=Yx;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":b=Hf;break;case"submit":b=tN;break;case"toggle":case"beforetoggle":b=cN}var k=(t&4)!==0,M=!k&&(e==="scroll"||e==="scrollend"),w=k?f!==null?f+"Capture":null:f;k=[];for(var y=g,v;y!==null;){var S=y;if(v=S.stateNode,S=S.tag,S!==5&&S!==26&&S!==27||v===null||w===null||(S=Ml(y,w),S!=null&&k.push(Bl(y,S,v))),M)break;y=y.return}0<k.length&&(f=new b(f,C,null,a,$),x.push({event:f,listeners:k}))}}if((t&7)===0){e:{if(b=e==="mouseover"||e==="pointerover",f=e==="mouseout"||e==="pointerout",b&&a!==xh&&(C=a.relatedTarget||a.fromElement)&&(qi(C)||C[xr]))break e;(f||b)&&(C=$.window===$?$:(b=$.ownerDocument)?b.defaultView||b.parentWindow:window,f?(b=a.relatedTarget||a.toElement,f=g,b=b?qi(b):null,b!==null&&(M=Ql(b),k=b.tag,b!==M||k!==5&&k!==27&&k!==6)&&(b=null)):(f=null,b=g),f!==b&&(k=Df,S="onMouseLeave",w="onMouseEnter",y="mouse",(e==="pointerout"||e==="pointerover")&&(k=Hf,S="onPointerLeave",w="onPointerEnter",y="pointer"),M=f==null?C:gl(f),v=b==null?C:gl(b),C=new k(S,y+"leave",f,a,$),C.target=M,C.relatedTarget=v,S=null,qi($)===g&&(k=new k(w,y+"enter",b,a,$),k.target=v,k.relatedTarget=M,S=k),M=S,k=f&&b?uh(f,b,m5):null,f!==null&&Vb(x,C,f,k,!1),b!==null&&M!==null&&Vb(x,M,b,k,!0)))}e:{if(f=g?gl(g):window,b=f.nodeName&&f.nodeName.toLowerCase(),b==="select"||b==="input"&&f.type==="file")var O=Bf;else if(qf(f))if(Hv)O=yN;else{O=bN;var P=fN}else b=f.nodeName,!b||b.toLowerCase()!=="input"||f.type!=="checkbox"&&f.type!=="radio"?g&&Tm(g.elementType)&&(O=Bf):O=vN;if(O&&(O=O(e,g))){_v(x,O,a,$);break e}P&&P(e,f,g)}switch(P=g?gl(g):window,e){case"focusin":(qf(P)||P.contentEditable==="true")&&(Xo=P,Th=g,wl=null);break;case"focusout":wl=Th=Xo=null;break;case"mousedown":kh=!0;break;case"contextmenu":case"mouseup":case"dragend":kh=!1,Yf(x,a,$);break;case"selectionchange":if($N)break;case"keydown":case"keyup":Yf(x,a,$)}var H;if(Am)e:{switch(e){case"compositionstart":var L="onCompositionStart";break e;case"compositionend":L="onCompositionEnd";break e;case"compositionupdate":L="onCompositionUpdate";break e}L=void 0}else Yo?Vv(e,a)&&(L="onCompositionEnd"):e==="keydown"&&a.keyCode===229&&(L="onCompositionStart");L&&(Ov&&a.locale!=="ko"&&(Yo||L!=="onCompositionStart"?L==="onCompositionEnd"&&Yo&&(H=Mv()):(Fn=$,Em="value"in Fn?Fn.value:Fn.textContent,Yo=!0)),P=au(g,L),0<P.length&&(L=new _f(L,e,null,a,$),x.push({event:L,listeners:P}),H?L.data=H:(H=Dv(a),H!==null&&(L.data=H)))),(H=dN?hN(e,a):mN(e,a))&&(L=au(g,"onBeforeInput"),0<L.length&&(P=new _f("onBeforeInput","beforeinput",null,a,$),x.push({event:P,listeners:L}),P.data=H)),d5(x,e,g,a,$)}Rw(x,t)})}function Bl(e,t,a){return{instance:e,listener:t,currentTarget:a}}function au(e,t){for(var a=t+"Capture",n=[];e!==null;){var o=e,l=o.stateNode;if(o=o.tag,o!==5&&o!==26&&o!==27||l===null||(o=Ml(e,a),o!=null&&n.unshift(Bl(e,o,l)),o=Ml(e,t),o!=null&&n.push(Bl(e,o,l))),e.tag===3)return n;e=e.return}return[]}function m5(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function Vb(e,t,a,n,o){for(var l=t._reactName,c=[];a!==null&&a!==n;){var u=a,h=u.alternate,g=u.stateNode;if(u=u.tag,h!==null&&h===n)break;u!==5&&u!==26&&u!==27||g===null||(h=g,o?(g=Ml(a,l),g!=null&&c.unshift(Bl(a,g,h))):o||(g=Ml(a,l),g!=null&&c.push(Bl(a,g,h)))),a=a.return}c.length!==0&&e.push({event:t,listeners:c})}var p5=/\r\n?/g,g5=/\u0000|\uFFFD/g;function Db(e){return(typeof e=="string"?e:""+e).replace(p5,`
`).replace(g5,"")}function Ow(e,t){return t=Db(t),Db(e)===t}function Ee(e,t,a,n,o,l){switch(a){case"children":if(typeof n=="string")t==="body"||t==="textarea"&&n===""||dr(e,n);else if(typeof n=="number"||typeof n=="bigint")t!=="body"&&dr(e,""+n);else return;break;case"className":Zs(e,"class",n);break;case"tabIndex":Zs(e,"tabindex",n);break;case"dir":case"role":case"viewBox":case"width":case"height":Zs(e,a,n);break;case"style":zv(e,n,l);return;case"data":if(t!=="object"){Zs(e,"data",n);break}case"src":case"href":if(n===""&&(t!=="a"||a!=="href")){e.removeAttribute(a);break}if(n==null||typeof n=="function"||typeof n=="symbol"||typeof n=="boolean"){e.removeAttribute(a);break}n=hc(n),e.setAttribute(a,n);break;case"action":case"formAction":if(typeof n=="function"){e.setAttribute(a,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof l=="function"&&(a==="formAction"?(t!=="input"&&Ee(e,t,"name",o.name,o,null),Ee(e,t,"formEncType",o.formEncType,o,null),Ee(e,t,"formMethod",o.formMethod,o,null),Ee(e,t,"formTarget",o.formTarget,o,null)):(Ee(e,t,"encType",o.encType,o,null),Ee(e,t,"method",o.method,o,null),Ee(e,t,"target",o.target,o,null)));if(n==null||typeof n=="symbol"||typeof n=="boolean"){e.removeAttribute(a);break}n=hc(n),e.setAttribute(a,n);break;case"onClick":n!=null&&(e.onclick=rn);return;case"onScroll":n!=null&&de("scroll",e);return;case"onScrollEnd":n!=null&&de("scrollend",e);return;case"dangerouslySetInnerHTML":if(n!=null){if(typeof n!="object"||!("__html"in n))throw Error(R(61));if(a=n.__html,a!=null){if(o.children!=null)throw Error(R(60));l?.__html!==a&&(e.innerHTML=a)}}break;case"multiple":e.multiple=n&&typeof n!="function"&&typeof n!="symbol";break;case"muted":e.muted=n&&typeof n!="function"&&typeof n!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(n==null||typeof n=="function"||typeof n=="boolean"||typeof n=="symbol"){e.removeAttribute("xlink:href");break}a=hc(n),e.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",a);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":n!=null&&typeof n!="function"&&typeof n!="symbol"?e.setAttribute(a,n):e.removeAttribute(a);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"credentialless":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":n&&typeof n!="function"&&typeof n!="symbol"?e.setAttribute(a,""):e.removeAttribute(a);break;case"capture":case"download":n===!0?e.setAttribute(a,""):n!==!1&&n!=null&&typeof n!="function"&&typeof n!="symbol"?e.setAttribute(a,n):e.removeAttribute(a);break;case"cols":case"rows":case"size":case"span":n!=null&&typeof n!="function"&&typeof n!="symbol"&&!isNaN(n)&&1<=n?e.setAttribute(a,n):e.removeAttribute(a);break;case"rowSpan":case"start":n==null||typeof n=="function"||typeof n=="symbol"||isNaN(n)?e.removeAttribute(a):e.setAttribute(a,n);break;case"popover":de("beforetoggle",e),de("toggle",e),dc(e,"popover",n);break;case"xlinkActuate":wn(e,"http://www.w3.org/1999/xlink","xlink:actuate",n);break;case"xlinkArcrole":wn(e,"http://www.w3.org/1999/xlink","xlink:arcrole",n);break;case"xlinkRole":wn(e,"http://www.w3.org/1999/xlink","xlink:role",n);break;case"xlinkShow":wn(e,"http://www.w3.org/1999/xlink","xlink:show",n);break;case"xlinkTitle":wn(e,"http://www.w3.org/1999/xlink","xlink:title",n);break;case"xlinkType":wn(e,"http://www.w3.org/1999/xlink","xlink:type",n);break;case"xmlBase":wn(e,"http://www.w3.org/XML/1998/namespace","xml:base",n);break;case"xmlLang":wn(e,"http://www.w3.org/XML/1998/namespace","xml:lang",n);break;case"xmlSpace":wn(e,"http://www.w3.org/XML/1998/namespace","xml:space",n);break;case"is":dc(e,"is",n);break;case"innerText":case"textContent":return;default:if(!(2<a.length)||a[0]!=="o"&&a[0]!=="O"||a[1]!=="n"&&a[1]!=="N")a=_x.get(a)||a,dc(e,a,n);else return}ye=!0}function cm(e,t,a,n,o,l){switch(a){case"style":zv(e,n,l);return;case"dangerouslySetInnerHTML":if(n!=null){if(typeof n!="object"||!("__html"in n))throw Error(R(61));if(a=n.__html,a!=null){if(o.children!=null)throw Error(R(60));l?.__html!==a&&(e.innerHTML=a)}}break;case"children":if(typeof n=="string")dr(e,n);else if(typeof n=="number"||typeof n=="bigint")dr(e,""+n);else return;break;case"onScroll":n!=null&&de("scroll",e);return;case"onScrollEnd":n!=null&&de("scrollend",e);return;case"onClick":n!=null&&(e.onclick=rn);return;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":return;case"innerText":case"textContent":return;default:if(!Sv.hasOwnProperty(a))e:{if(a[0]==="o"&&a[1]==="n"&&(o=a.endsWith("Capture"),l=a.slice(2,o?a.length-7:void 0),t=e[Wt]||null,t=t!=null?t[a]:null,typeof t=="function"&&e.removeEventListener(l,t,o),typeof n=="function")){typeof t!="function"&&t!==null&&(a in e?e[a]=null:e.hasAttribute(a)&&e.removeAttribute(a)),e.addEventListener(l,n,o);break e}ye=!0,a in e?e[a]=n:n===!0?e.setAttribute(a,""):dc(e,a,n)}return}ye=!0}function kt(e,t,a){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":de("error",e),de("load",e);var n=!1,o=!1,l;for(l in a)if(a.hasOwnProperty(l)){var c=a[l];if(c!=null)switch(l){case"src":n=!0;break;case"srcSet":o=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(R(137,t));default:Ee(e,t,l,c,a,null)}}o&&Ee(e,t,"srcSet",a.srcSet,a,null),n&&Ee(e,t,"src",a.src,a,null);return;case"input":de("invalid",e);var u=l=c=o=null,h=null,g=null;for(n in a)if(a.hasOwnProperty(n)){var $=a[n];if($!=null)switch(n){case"name":o=$;break;case"type":c=$;break;case"checked":h=$;break;case"defaultChecked":g=$;break;case"value":l=$;break;case"defaultValue":u=$;break;case"children":case"dangerouslySetInnerHTML":if($!=null)throw Error(R(137,t));break;default:Ee(e,t,n,$,a,null)}}Ev(e,l,u,h,g,c,o,!1);return;case"select":de("invalid",e),n=c=l=null;for(o in a)if(a.hasOwnProperty(o)&&(u=a[o],u!=null))switch(o){case"value":l=u;break;case"defaultValue":c=u;break;case"multiple":n=u;default:Ee(e,t,o,u,a,null)}t=l,a=c,e.multiple=!!n,t!=null?er(e,!!n,t,!1):a!=null&&er(e,!!n,a,!0);return;case"textarea":de("invalid",e),l=o=n=null;for(c in a)if(a.hasOwnProperty(c)&&(u=a[c],u!=null))switch(c){case"value":n=u;break;case"defaultValue":o=u;break;case"children":l=u;break;case"dangerouslySetInnerHTML":if(u!=null)throw Error(R(91));break;default:Ee(e,t,c,u,a,null)}Av(e,n,o,l);return;case"option":for(h in a)a.hasOwnProperty(h)&&(n=a[h],n!=null)&&(h==="selected"?e.selected=n&&typeof n!="function"&&typeof n!="symbol":Ee(e,t,h,n,a,null));return;case"dialog":de("beforetoggle",e),de("toggle",e),de("cancel",e),de("close",e);break;case"iframe":case"object":de("load",e);break;case"video":case"audio":for(n=0;n<ql.length;n++)de(ql[n],e);break;case"image":de("error",e),de("load",e);break;case"details":de("toggle",e);break;case"embed":case"source":case"link":de("error",e),de("load",e);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(g in a)if(a.hasOwnProperty(g)&&(n=a[g],n!=null))switch(g){case"children":case"dangerouslySetInnerHTML":throw Error(R(137,t));default:Ee(e,t,g,n,a,null)}return;default:if(Tm(t)){for($ in a)a.hasOwnProperty($)&&(n=a[$],n!==void 0&&cm(e,t,$,n,a,void 0));return}}for(u in a)a.hasOwnProperty(u)&&(n=a[u],n!=null&&Ee(e,t,u,n,a,null))}var f5={};function b5(e,t,a,n){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var o=null,l=null,c=null,u=null,h=null,g=null,$=null;for(b in a){var x=a[b];if(a.hasOwnProperty(b)&&x!=null)switch(b){case"checked":break;case"value":break;case"defaultValue":h=x;default:n.hasOwnProperty(b)||Ee(e,t,b,null,n,x)}}for(var f in n){var b=n[f];if(x=a[f],n.hasOwnProperty(f)&&(b!=null||x!=null))switch(f){case"type":b!==x&&(ye=!0),l=b;break;case"name":b!==x&&(ye=!0),o=b;break;case"checked":b!==x&&(ye=!0),g=b;break;case"defaultChecked":b!==x&&(ye=!0),$=b;break;case"value":b!==x&&(ye=!0),c=b;break;case"defaultValue":b!==x&&(ye=!0),u=b;break;case"children":case"dangerouslySetInnerHTML":if(b!=null)throw Error(R(137,t));break;default:b!==x&&Ee(e,t,f,b,n,x)}}$h(e,c,u,h,g,$,l,o);return;case"select":b=c=u=f=null;for(l in a)if(h=a[l],a.hasOwnProperty(l)&&h!=null)switch(l){case"value":break;case"multiple":b=h;default:n.hasOwnProperty(l)||Ee(e,t,l,null,n,h)}for(o in n)if(l=n[o],h=a[o],n.hasOwnProperty(o)&&(l!=null||h!=null))switch(o){case"value":l!==h&&(ye=!0),f=l;break;case"defaultValue":l!==h&&(ye=!0),u=l;break;case"multiple":l!==h&&(ye=!0),c=l;default:l!==h&&Ee(e,t,o,l,n,h)}t=u,a=c,n=b,f!=null?er(e,!!a,f,!1):!!n!=!!a&&(t!=null?er(e,!!a,t,!0):er(e,!!a,a?[]:"",!1));return;case"textarea":b=f=null;for(u in a)if(o=a[u],a.hasOwnProperty(u)&&o!=null&&!n.hasOwnProperty(u))switch(u){case"value":break;case"children":break;default:Ee(e,t,u,null,n,o)}for(c in n)if(o=n[c],l=a[c],n.hasOwnProperty(c)&&(o!=null||l!=null))switch(c){case"value":o!==l&&(ye=!0),f=o;break;case"defaultValue":o!==l&&(ye=!0),b=o;break;case"children":break;case"dangerouslySetInnerHTML":if(o!=null)throw Error(R(91));break;default:o!==l&&Ee(e,t,c,o,n,l)}Cv(e,f,b);return;case"option":for(var C in a)f=a[C],a.hasOwnProperty(C)&&f!=null&&!n.hasOwnProperty(C)&&(C==="selected"?e.selected=!1:Ee(e,t,C,null,n,f));for(h in n)f=n[h],b=a[h],n.hasOwnProperty(h)&&f!==b&&(f!=null||b!=null)&&(h==="selected"?(f!==b&&(ye=!0),e.selected=f&&typeof f!="function"&&typeof f!="symbol"):Ee(e,t,h,f,n,b));return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var k in a)f=a[k],a.hasOwnProperty(k)&&f!=null&&!n.hasOwnProperty(k)&&Ee(e,t,k,null,n,f);for(g in n)if(f=n[g],b=a[g],n.hasOwnProperty(g)&&f!==b&&(f!=null||b!=null))switch(g){case"children":case"dangerouslySetInnerHTML":if(f!=null)throw Error(R(137,t));break;default:Ee(e,t,g,f,n,b)}return;default:if(Tm(t)){for(var M in a)f=a[M],a.hasOwnProperty(M)&&f!==void 0&&!n.hasOwnProperty(M)&&cm(e,t,M,void 0,n,f);for($ in n)f=n[$],b=a[$],!n.hasOwnProperty($)||f===b||f===void 0&&b===void 0||cm(e,t,$,f,n,b);return}}for(var w in a)f=a[w],a.hasOwnProperty(w)&&f!=null&&!n.hasOwnProperty(w)&&Ee(e,t,w,null,n,f);for(x in n)f=n[x],b=a[x],!n.hasOwnProperty(x)||f===b||f==null&&b==null||Ee(e,t,x,f,n,b)}function _b(e){switch(e){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function v5(){if(typeof performance.getEntriesByType=="function"){for(var e=0,t=0,a=performance.getEntriesByType("resource"),n=0;n<a.length;n++){var o=a[n],l=o.transferSize,c=o.initiatorType,u=o.duration;if(l&&u&&_b(c)){for(c=0,u=o.responseEnd,n+=1;n<a.length;n++){var h=a[n],g=h.startTime;if(g>u)break;var $=h.transferSize,x=h.initiatorType;$&&_b(x)&&(h=h.responseEnd,c+=$*(h<u?1:(u-g)/(h-g)))}if(--n,t+=8*(l+c)/(o.duration/1e3),e++,10<e)break}}if(0<e)return t/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e=="number")?e:5}var um=null,dm=null;function Ll(e){return e.nodeType===9?e:e.ownerDocument}function Hb(e){switch(e){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function Vw(e,t){if(e===0)switch(t){case"svg":return 1;case"math":return 2;default:return 0}return e===1&&t==="foreignObject"?0:e}function Dw(e,t,a,n){return a=Ll(a).createElement(e),a[xt]=n,a[Wt]=t,kt(a,e,t),bt(a),a}function hm(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.children=="bigint"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var rh=null;function y5(){var e=window.event;return e&&e.type==="popstate"?e===rh?!1:(rh=e,!0):(rh=null,!1)}var dp=typeof setTimeout=="function"?setTimeout:void 0,w5=typeof clearTimeout=="function"?clearTimeout:void 0,Ib=typeof Promise=="function"?Promise:void 0,Ub=typeof requestAnimationFrame=="function"?requestAnimationFrame:dp,$5=typeof queueMicrotask=="function"?queueMicrotask:typeof Ib<"u"?function(e){return Ib.resolve(null).then(e).catch(x5)}:dp;function x5(e){setTimeout(function(){throw e})}function vi(e){return e==="head"}function qb(e,t){var a=t,n=0;do{var o=a.nextSibling;if(e.removeChild(a),o&&o.nodeType===8)if(a=o.data,a==="/$"||a==="/&"){if(n===0){e.removeChild(o),$r(t);return}n--}else if(a==="$"||a==="$?"||a==="$~"||a==="$!"||a==="&")n++;else if(a==="html")sh(e.ownerDocument.documentElement);else if(a==="head"){a=e.ownerDocument.head,sh(a);for(var l=a.firstChild;l;){var c=l.nextSibling,u=l.nodeName;l[Fl]||u==="SCRIPT"||u==="STYLE"||u==="LINK"&&l.rel.toLowerCase()==="stylesheet"||a.removeChild(l),l=c}}else a==="body"&&sh(e.ownerDocument.body);a=o}while(a);$r(t)}function Bb(e,t){var a=e;e=0;do{var n=a.nextSibling;if(a.nodeType===1?t?(a._stashedDisplay=a.style.display,a.style.display="none"):(a.style.display=a._stashedDisplay||"",a.getAttribute("style")===""&&a.removeAttribute("style")):a.nodeType===3&&(t?(a._stashedText=a.nodeValue,a.nodeValue=""):a.nodeValue=a._stashedText||""),n&&n.nodeType===8)if(a=n.data,a==="/$"){if(e===0)break;e--}else a!=="$"&&a!=="$?"&&a!=="$~"&&a!=="$!"||e++;a=n}while(a)}function _w(e,t,a){if(t=CSS.escape(t)!==t?"r-"+btoa(t).replace(/=/g,""):t,e.style.viewTransitionName=t,a!=null&&(e.style.viewTransitionClass=a),a=getComputedStyle(e),a.display==="inline"){if(t=e.getClientRects(),t.length===1)var n=1;else for(var o=n=0;o<t.length;o++){var l=t[o];0<l.width&&0<l.height&&n++}n===1&&(e=e.style,e.display=t.length===1?"inline-block":"block",e.marginTop="-"+a.paddingTop,e.marginBottom="-"+a.paddingBottom)}}function Hw(e,t){e=e.style,t=t.style;var a=t!=null?t.hasOwnProperty("viewTransitionName")?t.viewTransitionName:t.hasOwnProperty("view-transition-name")?t["view-transition-name"]:null:null;e.viewTransitionName=a==null||typeof a=="boolean"?"":(""+a).trim(),a=t!=null?t.hasOwnProperty("viewTransitionClass")?t.viewTransitionClass:t.hasOwnProperty("view-transition-class")?t["view-transition-class"]:null:null,e.viewTransitionClass=a==null||typeof a=="boolean"?"":(""+a).trim(),e.display==="inline-block"&&(t==null?e.display=e.margin="":(a=t.display,e.display=a==null||typeof a=="boolean"?"":a,a=t.margin,a!=null?e.margin=a:(a=t.hasOwnProperty("marginTop")?t.marginTop:t["margin-top"],e.marginTop=a==null||typeof a=="boolean"?"":a,t=t.hasOwnProperty("marginBottom")?t.marginBottom:t["margin-bottom"],e.marginBottom=t==null||typeof t=="boolean"?"":t)))}function Iw(e,t,a){return a=a.ownerDocument.defaultView,{rect:e,abs:t.position==="absolute"||t.position==="fixed",clip:t.clipPath!=="none"||t.overflow!=="visible"||t.filter!=="none"||t.mask!=="none"||t.mask!=="none"||t.borderRadius!=="0px",view:0<=e.bottom&&0<=e.right&&e.top<=a.innerHeight&&e.left<=a.innerWidth}}function mm(e){var t=e.getBoundingClientRect(),a=getComputedStyle(e);return Iw(t,a,e)}function N5(e){var t=e.getBoundingClientRect();t=new DOMRect(t.x+2e4,t.y+2e4,t.width,t.height);var a=getComputedStyle(e);return Iw(t,a,e)}function S5(e){return e.documentElement.clientHeight}function T5(e){this.addEventListener("load",e),this.addEventListener("error",e)}function k5(e,t,a,n,o,l,c,u,h){var g=t.nodeType===9?t:t.ownerDocument;try{var $=g.startViewTransition({update:function(){var f=g.defaultView,b=f.navigation&&f.navigation.transition,C=g.fonts.status;n();var k=[];if(C==="loaded"&&(S5(g),g.fonts.status==="loading"&&k.push(g.fonts.ready)),C=k.length,e!==null)for(var M=e.suspenseyImages,w=0,y=0;y<M.length;y++){var v=M[y];if(!v.complete){var S=v.getBoundingClientRect();if(0<S.bottom&&0<S.right&&S.top<f.innerHeight&&S.left<f.innerWidth){if(w+=Jw(v),w>Ec){k.length=C;break}v=new Promise(T5.bind(v)),k.push(v)}}}if(0<k.length)return f=Promise.race([Promise.all(k),new Promise(function(O){return setTimeout(O,500)})]).then(o,o),(b?Promise.allSettled([b.finished,f]):f).then(l,l);if(o(),b)return b.finished.then(l,l);l()},types:a});g.__reactViewTransition=$;var x=[];return $.ready.then(function(){for(var f=g.documentElement.getAnimations({subtree:!0}),b=0;b<f.length;b++){var C=f[b],k=C.effect,M=k.pseudoElement;if(M!=null&&M.startsWith("::view-transition")){x.push(C),C=k.getKeyframes();for(var w=M=void 0,y=!0,v=0;v<C.length;v++){var S=C[v],O=S.width;if(M===void 0)M=O;else if(M!==O){y=!1;break}if(O=S.height,w===void 0)w=O;else if(w!==O){y=!1;break}delete S.width,delete S.height,S.transform==="none"&&delete S.transform}y&&M!==void 0&&w!==void 0&&(k.setKeyframes(C),y=getComputedStyle(k.target,k.pseudoElement),y.width!==M||y.height!==w)&&(y=C[0],y.width=M,y.height=w,y=C[C.length-1],y.width=M,y.height=w,k.setKeyframes(C))}}c()},function(f){g.__reactViewTransition===$&&(g.__reactViewTransition=null);try{typeof f=="object"&&f!==null&&f.name==="InvalidStateError"&&(f.message==="View transition was skipped because document visibility state is hidden."||f.message==="Skipping view transition because document visibility state has become hidden."||f.message==="Skipping view transition because viewport size changed."||f.message==="Transition was aborted because of invalid state")&&(f=null),f!==null&&h(f)}finally{n(),o(),c()}}),$.finished.finally(function(){for(var f=0;f<x.length;f++)x[f].cancel();g.__reactViewTransition===$&&(g.__reactViewTransition=null),u()}),$}catch{return n(),o(),c(),null}}function Bi(e,t){this._scope=document.documentElement,this._selector="::view-transition-"+e+"("+t+")"}Bi.prototype.animate=function(e,t){return t=typeof t=="number"?{duration:t}:Ve({},t),t.pseudoElement=this._selector,this._scope.animate(e,t)};Bi.prototype.getAnimations=function(){for(var e=this._scope,t=this._selector,a=e.getAnimations({subtree:!0}),n=[],o=0;o<a.length;o++){var l=a[o].effect;l!==null&&l.target===e&&l.pseudoElement===t&&n.push(a[o])}return n};Bi.prototype.getComputedStyle=function(){return getComputedStyle(this._scope,this._selector)};function Uw(e){return{name:e,group:new Bi("group",e),imagePair:new Bi("image-pair",e),old:new Bi("old",e),new:new Bi("new",e)}}function ma(e){this._fragmentFiber=e,this._observers=this._eventListeners=null}ma.prototype.addEventListener=function(e,t,a){var n=null,o=null;if(!(a!=null&&typeof a!="boolean"&&(n=a.signal||null,n!==null&&n.aborted))){this._eventListeners===null&&(this._eventListeners=[]);var l=this._eventListeners;if(qw(l,e,t,a)===-1){var c=this,u=t;a!=null&&typeof a!="boolean"&&a.once===!0&&(u=function(h){c.removeEventListener(e,t,a),typeof t=="function"?t.call(this,h):t.handleEvent(h)}),n!==null&&(o=c.removeEventListener.bind(c,e,t,a),n.addEventListener("abort",o,{once:!0}),o=n.removeEventListener.bind(n,"abort",o)),n=br(a),l.push({type:e,listener:t,optionsOrUseCapture:a,attachedListener:u,cleanup:o}),Pt(this._fragmentFiber.child,!1,E5,e,u,n)}this._eventListeners=l}};function E5(e,t,a,n){return ut(e).addEventListener(t,a,n),!1}ma.prototype.removeEventListener=function(e,t,a){var n=this._eventListeners;if(n!==null&&(t=qw(n,e,t,a),t!==-1)){var o=n[t];a=o.attachedListener;var l=o.cleanup;o=br(o.optionsOrUseCapture),Pt(this._fragmentFiber.child,!1,C5,e,a,o),n.splice(t,1),l!==null&&l()}};function C5(e,t,a,n){return ut(e).removeEventListener(t,a,n),!1}function br(e){return e!=null&&typeof e!="boolean"&&(e.once===!0||e.signal instanceof AbortSignal)?{capture:e.capture,passive:e.passive}:e}function Lb(e){return e==null?"c=0":typeof e=="boolean"?"c="+(e?"1":"0"):"c="+(e.capture?"1":"0")}function qw(e,t,a,n){if(e.length===0)return-1;n=Lb(n);for(var o=0;o<e.length;o++){var l=e[o];if(l.type===t&&l.listener===a&&Lb(l.optionsOrUseCapture)===n)return o}return-1}ma.prototype.dispatchEvent=function(e){var t=to(this._fragmentFiber);if(t===null)return!0;t=ut(t);var a=this._eventListeners;if(a!==null&&0<a.length||!e.bubbles){var n=t.nodeType===9?t.createComment(""):document.createTextNode("");if(a)for(var o=0;o<a.length;o++){var l=a[o];n.addEventListener(l.type,l.attachedListener,br(l.optionsOrUseCapture))}if(t.appendChild(n),e=n.dispatchEvent(e),a)for(o=0;o<a.length;o++)l=a[o],n.removeEventListener(l.type,l.attachedListener,br(l.optionsOrUseCapture));return t.removeChild(n),e}return t.dispatchEvent(e)};ma.prototype.focus=function(e){Pt(this._fragmentFiber.child,!0,Bw,e,void 0,void 0)};function Bw(e,t){return e.tag===6?!1:(e=ut(e),q5(e,t))}ma.prototype.focusLast=function(e){var t=[];Pt(this._fragmentFiber.child,!0,hp,t,void 0,void 0);for(var a=t.length-1;0<=a&&!Bw(t[a],e);a--);};function hp(e,t){return t.push(e),!1}ma.prototype.blur=function(){var e=to(this._fragmentFiber);e!==null&&(e=ut(e),e=Ll(e).activeElement,e!==null&&Pt(this._fragmentFiber.child,!1,A5,e,void 0,void 0))};function A5(e,t){return e.tag===6?!1:(e=ut(e),e===t||e.contains(t)?(t.blur(),!0):!1)}ma.prototype.observeUsing=function(e){this._observers===null&&(this._observers=new Set),this._observers.add(e),Pt(this._fragmentFiber.child,!1,z5,e,void 0,void 0)};function z5(e,t){return e.tag===6||(e=ut(e),t.observe(e)),!1}ma.prototype.unobserveUsing=function(e){var t=this._observers;if(t!==null&&t.has(e)){t.delete(e),Pt(this._fragmentFiber.child,!1,R5,e,void 0,void 0);for(var a=t=0;a<ja.length;a++){var n=ja[a];n.fragmentInstance===this&&n.observer===e?e.unobserve(n.instance):ja[t++]=n}ja.length=t}};function R5(e,t){return e.tag===6||(e=ut(e),t.unobserve(e)),!1}var ja=[],lh=!1;function M5(e,t,a){ja.push({fragmentInstance:e,observer:t,instance:a}),lh||(lh=!0,B5(function(){lh=!1;var n=ja;ja=[];for(var o=0;o<n.length;o++){var l=n[o];l.observer.unobserve(l.instance)}}))}ma.prototype.getClientRects=function(){var e=[];return Pt(this._fragmentFiber.child,!1,O5,e,void 0,void 0),e};function O5(e,t){if(e.tag===6){e=e.stateNode;var a=e.ownerDocument.createRange();a.selectNodeContents(e),t.push.apply(t,a.getClientRects())}else e=ut(e),t.push.apply(t,e.getClientRects());return!1}ma.prototype.getRootNode=function(e){var t=to(this._fragmentFiber);return t===null?this:ut(t).getRootNode(e)};ma.prototype.compareDocumentPosition=function(e){var t=to(this._fragmentFiber);if(t===null)return Node.DOCUMENT_POSITION_DISCONNECTED;var a=[];Pt(this._fragmentFiber.child,!1,hp,a,void 0,void 0);var n=ut(t);if(a.length===0){if(a=n,$f(this._fragmentFiber)){e:{for(t=this._fragmentFiber.return;t!==null;){if(t.tag===4){t=t.stateNode.containerInfo;break e}if(t.tag===3||t.tag===5||t.tag===27)break;t=t.return}t=null}t!=null&&(a=t)}t=this._fragmentFiber;var o=n=a.compareDocumentPosition(e);return a===e?o=Node.DOCUMENT_POSITION_CONTAINS:n&Node.DOCUMENT_POSITION_CONTAINED_BY&&(a=cv(t)[1],a===null?o=Node.DOCUMENT_POSITION_PRECEDING:(e=ut(a).compareDocumentPosition(e),o=e===0||e&Node.DOCUMENT_POSITION_FOLLOWING?Node.DOCUMENT_POSITION_FOLLOWING:Node.DOCUMENT_POSITION_PRECEDING)),o|=Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC}t=ut(a[0]),o=ut(a[a.length-1]);var l=$f(this._fragmentFiber)?t.parentElement:n;if(l==null)return Node.DOCUMENT_POSITION_DISCONNECTED;n=l.compareDocumentPosition(t)&Node.DOCUMENT_POSITION_CONTAINED_BY,l=l.compareDocumentPosition(o)&Node.DOCUMENT_POSITION_CONTAINED_BY;var c=t.compareDocumentPosition(e),u=o.compareDocumentPosition(e),h=c&Node.DOCUMENT_POSITION_CONTAINED_BY||u&Node.DOCUMENT_POSITION_CONTAINED_BY;return u=n&&l&&c&Node.DOCUMENT_POSITION_FOLLOWING&&u&Node.DOCUMENT_POSITION_PRECEDING,t=n&&t===e||l&&o===e||h||u?Node.DOCUMENT_POSITION_CONTAINED_BY:!n&&t===e||!l&&o===e?Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC:c,t&Node.DOCUMENT_POSITION_DISCONNECTED||t&Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC||V5(t,this._fragmentFiber,a[0],a[a.length-1],e)?t:Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC};function V5(e,t,a,n,o){var l=qi(o);if(e&Node.DOCUMENT_POSITION_CONTAINED_BY){if(a=!!l)e:{for(;l!==null;){if(l.tag===7&&(l===t||l.alternate===t)){a=!0;break e}l=l.return}a=!1}return a}if(e&Node.DOCUMENT_POSITION_CONTAINS){if(l===null)return l=o.ownerDocument,o===l||o===l.documentElement||o===l.body;e:{for(l=t,t=to(t);l!==null;){if(!(l.tag!==5&&l.tag!==3&&l.tag!==27||l!==t&&l.alternate!==t)){l=!0;break e}l=l.return}l=!1}return l}return e&Node.DOCUMENT_POSITION_PRECEDING?((t=!!l)&&!(t=l===a)&&(t=uh(a,l,xf),t===null?t=!1:(Pt(t,!0,ux,l,a),l=Bo,Bo=null,t=l!==null)),t):e&Node.DOCUMENT_POSITION_FOLLOWING?((t=!!l)&&!(t=l===n)&&(t=uh(n,l,xf),t===null?t=!1:(Pt(t,!0,dx,l,n),l=Bo,ch=Bo=null,t=l!==null)),t):!1}function jb(e,t){var a=e.ownerDocument.createRange();a.selectNodeContents(e),e=a.getBoundingClientRect(),window.scrollTo(window.scrollX+e.left,t?window.scrollY+e.top:window.scrollY+e.bottom-window.innerHeight)}ma.prototype.scrollIntoView=function(e){if(typeof e=="object")throw Error(R(566));var t=[];Pt(this._fragmentFiber.child,!1,hp,t,void 0,void 0);var a=e!==!1;if(t.length===0){var n=cv(this._fragmentFiber);if(n=a?n[1]||n[0]||to(this._fragmentFiber):n[0]||n[1],n===null)return;if(n.tag===6){e=ut(n),jb(e,a);return}if(n=ut(n),n.nodeType!==9){if(n.nodeType===11){a="host"in n?n.host:null,a!==null&&a.scrollIntoView(e);return}n.scrollIntoView(e)}}for(n=a?t.length-1:0;n!==(a?-1:t.length);){var o=t[n];o.tag===6?(o=ut(o),jb(o,a)):ut(o).scrollIntoView(e),n+=a?-1:1}};function D5(e,t){return e=ut(e),Lw(e,t),!1}function Lw(e,t){e.reactFragments==null&&(e.reactFragments=new Set),e.reactFragments.add(t)}function jw(e,t){var a=t._eventListeners;if(a!==null)for(var n=0;n<a.length;n++){var o=a[n];e.addEventListener(o.type,o.attachedListener,br(o.optionsOrUseCapture))}e.nodeType!==3&&(a=t._observers,a!==null&&a.forEach(function(l){for(var c=0,u=0;u<ja.length;u++){var h=ja[u];(h.fragmentInstance!==t||h.observer!==l||h.instance!==e)&&(ja[c++]=h)}ja.length=c,l.observe(e)}),Lw(e,t))}function _5(e,t){var a=t._eventListeners;if(a!==null)for(var n=0;n<a.length;n++){var o=a[n];e.removeEventListener(o.type,o.attachedListener,br(o.optionsOrUseCapture))}e.nodeType!==3&&(a=t._observers,a!==null&&a.forEach(function(l){typeof l.rootMargin=="string"?M5(t,l,e):l.unobserve(e)}),e.reactFragments!=null&&e.reactFragments.delete(t))}function pm(e){var t=e.firstChild;for(t&&t.nodeType===10&&(t=t.nextSibling);t;){var a=t;switch(t=t.nextSibling,a.nodeName){case"HTML":case"HEAD":case"BODY":pm(a),ru(a);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(a.rel.toLowerCase()==="stylesheet")continue}e.removeChild(a)}}function H5(e,t,a,n){for(;e.nodeType===1;){var o=a;if(e.nodeName.toLowerCase()!==t.toLowerCase()){if(!n&&(e.nodeName!=="INPUT"||e.type!=="hidden"))break}else if(n){if(!e[Fl])switch(t){case"meta":if(!e.hasAttribute("itemprop"))break;return e;case"link":if(l=e.getAttribute("rel"),l==="stylesheet"&&e.hasAttribute("data-precedence"))break;if(l!==o.rel||e.getAttribute("href")!==(o.href==null||o.href===""?null:o.href)||e.getAttribute("crossorigin")!==(o.crossOrigin==null?null:o.crossOrigin)||e.getAttribute("title")!==(o.title==null?null:o.title))break;return e;case"style":if(e.hasAttribute("data-precedence"))break;return e;case"script":if(l=e.getAttribute("src"),(l!==(o.src==null?null:o.src)||e.getAttribute("type")!==(o.type==null?null:o.type)||e.getAttribute("crossorigin")!==(o.crossOrigin==null?null:o.crossOrigin))&&l&&e.hasAttribute("async")&&!e.hasAttribute("itemprop"))break;return e;default:return e}}else if(t==="input"&&e.type==="hidden"){var l=o.name==null?null:""+o.name;if(o.type==="hidden"&&e.getAttribute("name")===l)return e}else return e;if(e=Ea(e.nextSibling),e===null)break}return null}function I5(e,t,a){if(t==="")return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!a||(e=Ea(e.nextSibling),e===null))return null;return e}function Gw(e,t){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!t||(e=Ea(e.nextSibling),e===null))return null;return e}function gm(e){return e.data==="$?"||e.data==="$~"}function mp(e){return e.data==="$!"||e.data==="$?"&&e.ownerDocument.readyState!=="loading"}function U5(e,t){var a=e.ownerDocument;if(e.data==="$~")e._reactRetry=t;else if(e.data!=="$?"||a.readyState!=="loading")t();else{var n=function(){t(),a.removeEventListener("DOMContentLoaded",n)};a.addEventListener("DOMContentLoaded",n),e._reactRetry=n}}function Ea(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?"||t==="$~"||t==="&"||t==="F!"||t==="F")break;if(t==="/$"||t==="/&")return null}}return e}var fm=null;function Gb(e){e=e.nextSibling;for(var t=0;e;){if(e.nodeType===8){var a=e.data;if(a==="/$"||a==="/&"){if(t===0)return Ea(e.nextSibling);t--}else a!=="$"&&a!=="$!"&&a!=="$?"&&a!=="$~"&&a!=="&"||t++}e=e.nextSibling}return null}function Yb(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var a=e.data;if(a==="$"||a==="$!"||a==="$?"||a==="$~"||a==="&"){if(t===0)return e;t--}else a!=="/$"&&a!=="/&"||t++}e=e.previousSibling}return null}function q5(e,t){function a(){n=!0}if(e.ownerDocument.activeElement===e)return!0;var n=!1;try{e.ownerDocument.addEventListener("focus",a,!0),(e.focus||HTMLElement.prototype.focus).call(e,t)}finally{e.ownerDocument.removeEventListener("focus",a,!0)}return n}function B5(e){Ub(function(){Ub(function(t){return e(t)})})}function Yw(e,t,a){switch(t=Ll(a),e){case"html":if(e=t.documentElement,!e)throw Error(R(452));return e;case"head":if(e=t.head,!e)throw Error(R(453));return e;case"body":if(e=t.body,!e)throw Error(R(454));return e;default:throw Error(R(451))}}function Xw(e,t,a){for(var n in a){var o=a[n];a.hasOwnProperty(n)&&o!=null&&Ee(e,t,n,null,f5,o)}a.dangerouslySetInnerHTML!=null&&(e.textContent=""),e.onclick===rn&&(e.onclick=null),ru(e)}function sh(e){for(var t=e.attributes;t.length;)e.removeAttributeNode(t[0]);ru(e)}var Ca=new Map,Xb=new Set;function jl(e){if(typeof e.getRootNode=="function"){var t=e.getRootNode();if(t.nodeType===9||t.nodeType===11)return t}return e.nodeType===9?e:e.ownerDocument}var Vn=xe.d;xe.d={f:L5,r:j5,D:G5,C:Y5,L:X5,m:Q5,X:K5,S:Z5,M:J5};function L5(){var e=Vn.f(),t=wu();return e||t}function j5(e){var t=Nr(e);t!==null&&t.tag===5&&t.type==="form"?zy(t):Vn.r(e)}var Er=typeof document>"u"?null:document;function Qw(e,t,a){var n=Er;if(n&&typeof t=="string"&&t){var o=Sa(t);o='link[rel="'+e+'"][href="'+o+'"]',typeof a=="string"&&(o+='[crossorigin="'+a+'"]'),Xb.has(o)||(Xb.add(o),e={rel:e,crossOrigin:a,href:t},n.querySelector(o)===null&&(t=n.createElement("link"),kt(t,"link",e),bt(t),n.head.appendChild(t)))}}function G5(e){Vn.D(e),Qw("dns-prefetch",e,null)}function Y5(e,t){Vn.C(e,t),Qw("preconnect",e,t)}function X5(e,t,a){Vn.L(e,t,a);var n=Er;if(n&&e&&t){var o='link[rel="preload"][as="'+Sa(t)+'"]';t==="image"&&a&&a.imageSrcSet?(o+='[imagesrcset="'+Sa(a.imageSrcSet)+'"]',typeof a.imageSizes=="string"&&(o+='[imagesizes="'+Sa(a.imageSizes)+'"]')):o+='[href="'+Sa(e)+'"]';var l=o;switch(t){case"style":l=vr(e);break;case"script":l=Cr(e)}if(!(Ca.has(l)||(e=Ve({rel:"preload",href:t==="image"&&a&&a.imageSrcSet?void 0:e,as:t},a),Ca.set(l,e),n.querySelector(o)!==null||t==="style"&&n.querySelector(ns(l))||t==="script"&&n.querySelector(is(l))))){var c=n.createElement("link");kt(c,"link",e),t==="style"&&(c[Vc]=!0,c.onload=c.onerror=function(){xv(c)}),bt(c),n.head.appendChild(c)}}}function Q5(e,t){Vn.m(e,t);var a=Er;if(a&&e){var n=t&&typeof t.as=="string"?t.as:"script",o='link[rel="modulepreload"][as="'+Sa(n)+'"][href="'+Sa(e)+'"]',l=o;switch(n){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":l=Cr(e)}if(!Ca.has(l)&&(e=Ve({rel:"modulepreload",href:e},t),Ca.set(l,e),a.querySelector(o)===null)){switch(n){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(a.querySelector(is(l)))return}n=a.createElement("link"),kt(n,"link",e),bt(n),a.head.appendChild(n)}}}function Z5(e,t,a){Vn.S(e,t,a);var n=Er;if(n&&e){var o=Wo(n).hoistableStyles,l=vr(e);t=t||"default";var c=o.get(l);if(!c){var u={loading:0,preload:null};if(c=n.querySelector(ns(l)))u.loading=5;else{e=Ve({rel:"stylesheet",href:e,"data-precedence":t},a),(a=Ca.get(l))&&pp(e,a);var h=c=n.createElement("link");bt(h),kt(h,"link",e),h._p=new Promise(function(g,$){h.onload=g,h.onerror=$}),h.addEventListener("load",function(){u.loading|=1}),h.addEventListener("error",function(){u.loading|=2}),u.loading|=4,Tc(c,t,n)}c={type:"stylesheet",instance:c,count:1,state:u},o.set(l,c)}}}function K5(e,t){Vn.X(e,t);var a=Er;if(a&&e){var n=Wo(a).hoistableScripts,o=Cr(e),l=n.get(o);l||(l=a.querySelector(is(o)),l||(e=Ve({src:e,async:!0},t),(t=Ca.get(o))&&gp(e,t),l=a.createElement("script"),bt(l),kt(l,"link",e),a.head.appendChild(l)),l={type:"script",instance:l,count:1,state:null},n.set(o,l))}}function J5(e,t){Vn.M(e,t);var a=Er;if(a&&e){var n=Wo(a).hoistableScripts,o=Cr(e),l=n.get(o);l||(l=a.querySelector(is(o)),l||(e=Ve({src:e,async:!0,type:"module"},t),(t=Ca.get(o))&&gp(e,t),l=a.createElement("script"),bt(l),kt(l,"link",e),a.head.appendChild(l)),l={type:"script",instance:l,count:1,state:null},n.set(o,l))}}function Qb(e,t,a,n){var o=(o=ai.current)?jl(o):null;if(!o)throw Error(R(446));switch(e){case"meta":case"title":return null;case"style":return typeof a.precedence=="string"&&typeof a.href=="string"?(a=vr(a.href),t=Wo(o).hoistableStyles,n=t.get(a),n||(n={type:"style",instance:null,count:0,state:null},t.set(a,n)),n):{type:"void",instance:null,count:0,state:null};case"link":if(a.rel==="stylesheet"&&typeof a.href=="string"&&typeof a.precedence=="string"){e=vr(a.href);var l=Wo(o).hoistableStyles,c=l.get(e);if(c||(o=o.ownerDocument||o,c={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},l.set(e,c),(l=o.querySelector(ns(e)))?l._p||(c.instance=l,c.state.loading=5):(l=Ca.get(e),l||(l={rel:"preload",as:"style",href:a.href,crossOrigin:a.crossOrigin,integrity:a.integrity,media:a.media,hrefLang:a.hrefLang,referrerPolicy:a.referrerPolicy},Ca.set(e,l)),F5(o,e,l,c.state))),t&&n===null)throw Error(R(528,""));return c}if(t&&n!==null)throw Error(R(529,""));return null;case"script":return t=a.async,a=a.src,typeof a=="string"&&t&&typeof t!="function"&&typeof t!="symbol"?(a=Cr(a),t=Wo(o).hoistableScripts,n=t.get(a),n||(n={type:"script",instance:null,count:0,state:null},t.set(a,n)),n):{type:"void",instance:null,count:0,state:null};default:throw Error(R(444,e))}}function vr(e){return'href="'+Sa(e)+'"'}function ns(e){return'link[rel="stylesheet"]['+e+"]"}function Zw(e){return Ve({},e,{"data-precedence":e.precedence,precedence:null})}function F5(e,t,a,n){if(t=e.querySelector('link[rel="preload"][as="style"]['+t+"]")){if(t[Vc]!==!0){n.loading=1;return}}else t=e.createElement("link"),t[Vc]=!0,t.onload=t.onerror=xv.bind(null,t),kt(t,"link",a),bt(t),e.head.appendChild(t);n.preload=t,t.addEventListener("load",function(){return n.loading|=1}),t.addEventListener("error",function(){return n.loading|=2})}function Cr(e){return'[src="'+Sa(e)+'"]'}function is(e){return"script[async]"+e}function Zb(e,t,a){if(t.count++,t.instance===null)switch(t.type){case"style":var n=e.querySelector('style[data-href~="'+Sa(a.href)+'"]');if(n)return t.instance=n,bt(n),n;var o=Ve({},a,{"data-href":a.href,"data-precedence":a.precedence,href:null,precedence:null});return n=(e.ownerDocument||e).createElement("style"),bt(n),kt(n,"style",o),Tc(n,a.precedence,e),t.instance=n;case"stylesheet":o=vr(a.href);var l=e.querySelector(ns(o));if(l)return t.state.loading|=4,t.instance=l,bt(l),l;n=Zw(a),(o=Ca.get(o))&&pp(n,o),l=(e.ownerDocument||e).createElement("link"),bt(l);var c=l;return c._p=new Promise(function(u,h){c.onload=u,c.onerror=h}),kt(l,"link",n),t.state.loading|=4,Tc(l,a.precedence,e),t.instance=l;case"script":return l=Cr(a.src),(o=e.querySelector(is(l)))?(t.instance=o,bt(o),o):(n=a,(o=Ca.get(l))&&(n=Ve({},a),gp(n,o)),e=e.ownerDocument||e,o=e.createElement("script"),bt(o),kt(o,"link",n),e.head.appendChild(o),t.instance=o);case"void":return null;default:throw Error(R(443,t.type))}else t.type==="stylesheet"&&(t.state.loading&4)===0&&(n=t.instance,t.state.loading|=4,Tc(n,a.precedence,e));return t.instance}function Tc(e,t,a){for(var n=a.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),o=n.length?n[n.length-1]:null,l=o,c=0;c<n.length;c++){var u=n[c];if(u.dataset.precedence===t)l=u;else if(l!==o)break}l?l.parentNode.insertBefore(e,l.nextSibling):(t=a.nodeType===9?a.head:a,t.insertBefore(e,t.firstChild))}function pp(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.title==null&&(e.title=t.title)}function gp(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.integrity==null&&(e.integrity=t.integrity)}var kc=null;function Kb(e,t,a){if(kc===null){var n=new Map,o=kc=new Map;o.set(a,n)}else o=kc,n=o.get(a),n||(n=new Map,o.set(a,n));if(n.has(e))return n;for(n.set(e,null),a=a.getElementsByTagName(e),o=0;o<a.length;o++){var l=a[o];if(!(l[Fl]||l[xt]||e==="link"&&l.getAttribute("rel")==="stylesheet")&&l.namespaceURI!=="http://www.w3.org/2000/svg"){var c=l.getAttribute(t)||"";c=e+c;var u=n.get(c);u?u.push(l):n.set(c,[l])}}return n}function bm(e,t,a){e=e.ownerDocument||e,e.head.insertBefore(a,t==="title"?e.querySelector("head > title"):null)}function P5(e,t,a){if(a===1||t.itemProp!=null)return!1;switch(e){case"meta":case"title":return!0;case"style":if(typeof t.precedence!="string"||typeof t.href!="string"||t.href==="")break;return!0;case"link":if(typeof t.rel!="string"||typeof t.href!="string"||t.href===""||t.onLoad||t.onError)break;return t.rel==="stylesheet"?(e=t.disabled,typeof t.precedence=="string"&&e==null):!0;case"script":if(t.async&&typeof t.async!="function"&&typeof t.async!="symbol"&&!t.onLoad&&!t.onError&&t.src&&typeof t.src=="string")return!0}return!1}function Jb(e,t){return e==="img"&&t.src!=null&&t.src!==""&&t.onLoad==null&&t.loading!=="lazy"}function Kw(e){return!(e.type==="stylesheet"&&(e.state.loading&3)===0)}function Jw(e){return(e.width||100)*(e.height||100)*(typeof devicePixelRatio=="number"?devicePixelRatio:1)*.25}function Fb(e,t){typeof t.decode=="function"&&(e.imgCount++,t.complete||(e.imgBytes+=Jw(t),e.suspenseyImages.push(t)),e=tS.bind(e),t.decode().then(e,e))}function W5(e,t,a,n){if(a.type==="stylesheet"&&(typeof n.media!="string"||matchMedia(n.media).matches!==!1)&&(a.state.loading&4)===0){if(a.instance===null){var o=vr(n.href),l=t.querySelector(ns(o));if(l){t=l._p,t!==null&&typeof t=="object"&&typeof t.then=="function"&&(e.count++,e=Gl.bind(e),t.then(e,e)),a.state.loading|=4,a.instance=l,bt(l);return}l=t.ownerDocument||t,n=Zw(n),(o=Ca.get(o))&&pp(n,o),l=l.createElement("link"),bt(l);var c=l;c._p=new Promise(function(u,h){c.onload=u,c.onerror=h}),kt(l,"link",n),a.instance=l}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(a,t),(t=a.state.preload)&&(a.state.loading&3)===0&&(e.count++,a=Gl.bind(e),t.addEventListener("load",a),t.addEventListener("error",a))}}var Ec=0;function eS(e,t){return e.stylesheets&&e.count===0&&Cc(e,e.stylesheets),0<e.count||0<e.imgCount?function(a){var n=setTimeout(function(){if(e.stylesheets&&Cc(e,e.stylesheets),e.unsuspend){var l=e.unsuspend;e.unsuspend=null,l()}},6e4+t);0<e.imgBytes&&Ec===0&&(Ec=62500*v5());var o=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&Cc(e,e.stylesheets),e.unsuspend)){var l=e.unsuspend;e.unsuspend=null,l()}},(e.imgBytes>Ec?50:800)+t);return e.unsuspend=a,function(){e.unsuspend=null,clearTimeout(n),clearTimeout(o)}}:null}function Fw(e){if(e.count===0&&(e.imgCount===0||!e.waitingForImages)){if(e.stylesheets)Cc(e,e.stylesheets);else if(e.unsuspend){var t=e.unsuspend;e.unsuspend=null,t()}}}function Gl(){this.count--,Fw(this)}function tS(){this.imgCount--,Fw(this)}var nu=null;function Cc(e,t){e.stylesheets=null,e.unsuspend!==null&&(e.count++,nu=new Map,t.forEach(aS,e),nu=null,Gl.call(e))}function aS(e,t){if(!(t.state.loading&4)){var a=nu.get(e);if(a)var n=a.get(null);else{a=new Map,nu.set(e,a);for(var o=e.querySelectorAll("link[data-precedence],style[data-precedence]"),l=0;l<o.length;l++){var c=o[l];(c.nodeName==="LINK"||c.getAttribute("media")!=="not all")&&(a.set(c.dataset.precedence,c),n=c)}n&&a.set(null,n)}o=t.instance,c=o.getAttribute("data-precedence"),l=a.get(c)||n,l===n&&a.set(null,o),a.set(c,o),this.count++,n=Gl.bind(this),o.addEventListener("load",n),o.addEventListener("error",n),l?l.parentNode.insertBefore(o,l.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(o,e.firstChild)),t.state.loading|=4}}var yr={$$typeof:on,Provider:null,Consumer:null,_currentValue:Li,_currentValue2:Li,_threadCount:0};function nS(e,t,a,n,o,l,c,u,h){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=_d(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=_d(0),this.hiddenUpdates=_d(null),this.identifierPrefix=n,this.onUncaughtError=o,this.onCaughtError=l,this.onRecoverableError=c,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=h,this.transitionTypes=null,this.incompleteTransitions=new Map}function Pw(e,t,a,n,o,l,c,u,h,g,$,x){return e=new nS(e,t,a,c,h,g,$,x,u),t=1,l===!0&&(t|=24),l=Jt(3,null,null,t),e.current=l,l.stateNode=e,t=Dm(),t.refCount++,e.pooledCache=t,t.refCount++,l.memoizedState={element:n,isDehydrated:a,cache:t},Im(l),e}function Ww(e){return e?(e=Ko,e):Ko}function e0(e,t,a,n,o,l){o=Ww(o),n.context===null?n.context=o:n.pendingContext=o,n=ii(t),n.payload={element:a},l=l===void 0?null:l,l!==null&&(n.callback=l),a=oi(e,n,t),a!==null&&(Ft(a,e,t),xl(a,e,t))}function Pb(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var a=e.retryLane;e.retryLane=a!==0&&a<t?a:t}}function fp(e,t){Pb(e,t),(e=e.alternate)&&Pb(e,t)}function t0(e){if(e.tag===13||e.tag===31){var t=io(e,67108864);t!==null&&Ft(t,e,67108864),fp(e,67108864)}}function Wb(e){if(e.tag===13||e.tag===31){var t=da();t=Nm(t);var a=io(e,t);a!==null&&Ft(a,e,t),fp(e,t)}}var wr=!0;function iS(e,t,a,n){var o=W.T;W.T=null;var l=xe.p;try{xe.p=2,bp(e,t,a,n)}finally{xe.p=l,W.T=o}}function oS(e,t,a,n){var o=W.T;W.T=null;var l=xe.p;try{xe.p=8,bp(e,t,a,n)}finally{xe.p=l,W.T=o}}function bp(e,t,a,n){if(wr){var o=vm(n);if(o===null)oh(e,t,n,iu,a),ev(e,n);else if(lS(o,e,t,a,n))n.stopPropagation();else if(ev(e,n),t&4&&-1<rS.indexOf(e)){for(;o!==null;){var l=Nr(o);if(l!==null)switch(l.tag){case 3:if(l=l.stateNode,l.current.memoizedState.isDehydrated){var c=Hi(l.pendingLanes);if(c!==0){var u=l;for(u.pendingLanes|=2,u.entangledLanes|=2;c;){var h=1<<31-ua(c);u.entanglements[1]|=h,c&=~h}mn(l),($e&6)===0&&(Pc=sa()+500,as(0,!1))}}break;case 31:case 13:u=io(l,2),u!==null&&Ft(u,l,2),wu(),fp(l,2)}if(l=vm(n),l===null&&oh(e,t,n,iu,a),l===o)break;o=l}o!==null&&n.stopPropagation()}else oh(e,t,n,null,a)}}function vm(e){return e=km(e),vp(e)}var iu=null;function vp(e){if(iu=null,e=qi(e),e!==null){var t=Ql(e);if(t===null)e=null;else{var a=t.tag;if(a===13){if(e=rv(t),e!==null)return e;e=null}else if(a===31){if(e=lv(t),e!==null)return e;e=null}else if(a===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null)}}return iu=e,null}function a0(e){switch(e){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"fullscreenerror":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"resize":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(wx()){case mv:return 2;case pv:return 8;case Oc:case $x:return 32;case gv:return 268435456;default:return 32}default:return 32}}var ym=!1,ci=null,ui=null,di=null,Yl=new Map,Xl=new Map,Kn=[],rS="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function ev(e,t){switch(e){case"focusin":case"focusout":ci=null;break;case"dragenter":case"dragleave":ui=null;break;case"mouseover":case"mouseout":di=null;break;case"pointerover":case"pointerout":Yl.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":Xl.delete(t.pointerId)}}function dl(e,t,a,n,o,l){return e===null||e.nativeEvent!==l?(e={blockedOn:t,domEventName:a,eventSystemFlags:n,nativeEvent:l,targetContainers:[o]},t!==null&&(t=Nr(t),t!==null&&t0(t)),e):(e.eventSystemFlags|=n,t=e.targetContainers,o!==null&&t.indexOf(o)===-1&&t.push(o),e)}function lS(e,t,a,n,o){switch(t){case"focusin":return ci=dl(ci,e,t,a,n,o),!0;case"dragenter":return ui=dl(ui,e,t,a,n,o),!0;case"mouseover":return di=dl(di,e,t,a,n,o),!0;case"pointerover":var l=o.pointerId;return Yl.set(l,dl(Yl.get(l)||null,e,t,a,n,o)),!0;case"gotpointercapture":return l=o.pointerId,Xl.set(l,dl(Xl.get(l)||null,e,t,a,n,o)),!0}return!1}function n0(e){var t=qi(e.target);if(t!==null){var a=Ql(t);if(a!==null){if(t=a.tag,t===13){if(t=rv(a),t!==null){e.blockedOn=t,kf(e.priority,function(){Wb(a)});return}}else if(t===31){if(t=lv(a),t!==null){e.blockedOn=t,kf(e.priority,function(){Wb(a)});return}}else if(t===3&&a.stateNode.current.memoizedState.isDehydrated){e.blockedOn=a.tag===3?a.stateNode.containerInfo:null;return}}}e.blockedOn=null}function Ac(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var a=vm(e.nativeEvent);if(a===null){a=e.nativeEvent;var n=new a.constructor(a.type,a);xh=n,a.target.dispatchEvent(n),xh=null}else return t=Nr(a),t!==null&&t0(t),e.blockedOn=a,!1;t.shift()}return!0}function tv(e,t,a){Ac(e)&&a.delete(t)}function sS(){ym=!1,ci!==null&&Ac(ci)&&(ci=null),ui!==null&&Ac(ui)&&(ui=null),di!==null&&Ac(di)&&(di=null),Yl.forEach(tv),Xl.forEach(tv)}function cc(e,t){e.blockedOn===t&&(e.blockedOn=null,ym||(ym=!0,dt.unstable_scheduleCallback(dt.unstable_NormalPriority,sS)))}var uc=null;function av(e){uc!==e&&(uc=e,dt.unstable_scheduleCallback(dt.unstable_NormalPriority,function(){uc===e&&(uc=null);for(var t=0;t<e.length;t+=3){var a=e[t],n=e[t+1],o=e[t+2];if(typeof n!="function"){if(vp(n||a)===null)continue;break}var l=Nr(a);l!==null&&(e.splice(t,3),t-=3,Ih(l,{pending:!0,data:o,method:a.method,action:n},n,o))}}))}function $r(e){function t(h){return cc(h,e)}ci!==null&&cc(ci,e),ui!==null&&cc(ui,e),di!==null&&cc(di,e),Yl.forEach(t),Xl.forEach(t);for(var a=0;a<Kn.length;a++){var n=Kn[a];n.blockedOn===e&&(n.blockedOn=null)}for(;0<Kn.length&&(a=Kn[0],a.blockedOn===null);)n0(a),a.blockedOn===null&&Kn.shift();if(a=(e.ownerDocument||e).$$reactFormReplay,a!=null)for(n=0;n<a.length;n+=3){var o=a[n],l=a[n+1],c=o[Wt]||null;if(typeof l=="function")c||av(a);else if(c){var u=null;if(l&&l.hasAttribute("formAction")){if(o=l,c=l[Wt]||null)u=c.formAction;else if(vp(o)!==null)continue}else u=c.action;typeof u=="function"?a[n+1]=u:(a.splice(n,3),n-=3),av(a)}}}function i0(){function e(l){l.canIntercept&&l.info==="react-transition"&&l.intercept({handler:function(){return new Promise(function(c){return o=c})},focusReset:"manual",scroll:"manual"})}function t(){o!==null&&(o(),o=null),n||setTimeout(a,20)}function a(){if(!n&&!navigation.transition){var l=navigation.currentEntry;l&&l.url!=null&&navigation.navigate(l.url,{state:l.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var n=!1,o=null;return navigation.addEventListener("navigate",e),navigation.addEventListener("navigatesuccess",t),navigation.addEventListener("navigateerror",t),setTimeout(a,100),function(){n=!0,navigation.removeEventListener("navigate",e),navigation.removeEventListener("navigatesuccess",t),navigation.removeEventListener("navigateerror",t),o!==null&&(o(),o=null)}}}function yp(e){this._internalRoot=e}Nu.prototype.render=yp.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(R(409));var a=t.current,n=da();e0(a,n,e,t,null,null)};Nu.prototype.unmount=yp.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;e0(e.current,2,null,e,null,null),wu(),t[xr]=null}};function Nu(e){this._internalRoot=e}Nu.prototype.unstable_scheduleHydration=function(e){if(e){var t=$v();e={blockedOn:null,target:e,priority:t};for(var a=0;a<Kn.length&&t!==0&&t<Kn[a].priority;a++);Kn.splice(a,0,e),a===0&&n0(e)}};var nv=iv.version;if(nv!=="19.3.0")throw Error(R(527,nv,"19.3.0"));xe.findDOMNode=function(e){var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(R(188)):(e=Object.keys(e).join(","),Error(R(268,e)));return e=cx(t),e=e!==null?sv(e):null,e=e===null?null:e.stateNode,e};var cS={bundleType:0,version:"19.3.0",rendererPackageName:"react-dom",currentDispatcherRef:W,reconcilerVersion:"19.3.0"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(hl=__REACT_DEVTOOLS_GLOBAL_HOOK__,!hl.isDisabled&&hl.supportsFiber))try{Zl=hl.inject(cS),ca=hl}catch{}var hl;Su.createRoot=function(e,t){if(!ov(e))throw Error(R(299));var a=!1,n="",o=Iy,l=Uy,c=qy;return t!=null&&(t.unstable_strictMode===!0&&(a=!0),t.identifierPrefix!==void 0&&(n=t.identifierPrefix),t.onUncaughtError!==void 0&&(o=t.onUncaughtError),t.onCaughtError!==void 0&&(l=t.onCaughtError),t.onRecoverableError!==void 0&&(c=t.onRecoverableError)),t=Pw(e,1,!1,null,null,a,n,null,o,l,c,i0),e[xr]=t.current,up(e),new yp(t)};Su.hydrateRoot=function(e,t,a){if(!ov(e))throw Error(R(299));var n=!1,o="",l=Iy,c=Uy,u=qy,h=null;return a!=null&&(a.unstable_strictMode===!0&&(n=!0),a.identifierPrefix!==void 0&&(o=a.identifierPrefix),a.onUncaughtError!==void 0&&(l=a.onUncaughtError),a.onCaughtError!==void 0&&(c=a.onCaughtError),a.onRecoverableError!==void 0&&(u=a.onRecoverableError),a.formState!==void 0&&(h=a.formState)),t=Pw(e,1,!0,t,a??null,n,o,h,l,c,u,i0),t.context=Ww(null),a=t.current,n=da(),n=Nm(n),o=ii(n),o.callback=null,oi(a,o,n),a=n,t.current.lanes=a,Jl(t,a),mn(t),e[xr]=t.current,up(e),new Nu(t)};Su.version="19.3.0"});var s0=Fa((C2,l0)=>{"use strict";function r0(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(r0)}catch(e){console.error(e)}}r0(),l0.exports=o0()});var k0=Fa(Cu=>{"use strict";var fS=Symbol.for("react.transitional.element"),bS=Symbol.for("react.fragment");function T0(e,t,a){var n=null;if(a!==void 0&&(n=""+a),t.key!==void 0&&(n=""+t.key),"key"in t){a={};for(var o in t)o!=="key"&&(a[o]=t[o])}else a=t;return t=a.ref,{$$typeof:fS,type:e,key:n,ref:t!==void 0?t:null,props:a}}Cu.Fragment=bS;Cu.jsx=T0;Cu.jsxs=T0});var xp=Fa((I2,E0)=>{"use strict";E0.exports=k0()});var m=Hs(Us()),J0=Hs(s0());function uS(e,t=!1){let a=e.replace(/\r\n?/g,`
`).split(`
`),n="",o=[],l=[];for(let c=0;c<a.length;c++){let u=a[c],h=/^ {0,3}(`{3,}|~{3,})/.exec(u)?.[1];if(h&&(n?h[0]===n[0]&&h.length>=n.length&&(n=""):n=h),!n&&!u.trim()&&(!t||c<a.length-1)){let g=o.join(`
`).trim();g&&l.push(g),o=[]}else o.push(u)}if(!t){let c=o.join(`
`).trim();c&&l.push(c)}return l}var dS=['"',"'","\u201D","\u2019","\xBB","\u300D"],hS=['"',"'","\u201C","\u2018","\xAB","\u300C"];function c0(e){let t=e.trim();return dS.includes(t.slice(-1))&&hS.some(n=>t.slice(0,-1).includes(n))?"speech":"prose"}function u0(e,t){let a=uS(e),n=()=>({paragraphs:a,asides:a.map(()=>[]),expressions:a.map(()=>null)});if(!t||t.length!==a.length)return n();let o=[],l=[],c=[],u=[];for(let h=0;h<a.length;h+=1){let g=t[h];if(g.kind==="untagged"){o.push(a[h]),l.push(u),c.push(g.expression??null),u=[];continue}let $={register:g.kind==="whisper"?"whisper":"side",text:g.text,...g.target?{target:g.target}:{}};o.length?l[l.length-1].push($):u.push($)}return o.length===0?n():{paragraphs:o,asides:l,expressions:c}}var mS="\\\\([-\\\\*_~`#|>!=\\[\\]{}])|\\[([^\\]]*)\\]\\((https?:\\/\\/[^)\\s]+)\\)|`([^`\\n]+)`|==(.+?)==|~~(.+?)~~|\\*\\*\\*(.+?)\\*\\*\\*|\\*\\*(.+?)\\*\\*|__(.+?)__|(?<!\\*)\\*(?!\\*)(.+?)(?<!\\*)\\*(?!\\*)|(?<![_\\w])_([^_]+?)_(?![_\\w])";function ro(e,t){if(t>6)return[{kind:"text",text:e}];let a=[],n=new RegExp(mS,"g"),o=0,l,c=u=>{let h=a[a.length-1];if(h?.kind==="text"){a[a.length-1]={kind:"text",text:h.text+u};return}a.push({kind:"text",text:u})};for(;(l=n.exec(e))!==null;)l.index>o&&c(e.slice(o,l.index)),l[1]!=null?c(l[1]):l[2]!=null&&l[3]!=null?a.push({kind:"link",text:l[2],href:l[3]}):l[4]!=null?a.push({kind:"code",text:l[4]}):l[5]!=null?a.push({kind:"styled",style:"highlight",children:ro(l[5],t+1)}):l[6]!=null?a.push({kind:"styled",style:"strikethrough",children:ro(l[6],t+1)}):l[7]!=null?a.push({kind:"styled",style:"bold-italic",children:ro(l[7],t+1)}):l[8]!=null?a.push({kind:"styled",style:"bold",children:ro(l[8],t+1)}):l[9]!=null?a.push({kind:"styled",style:"underline",children:ro(l[9],t+1)}):(l[10]!=null||l[11]!=null)&&a.push({kind:"styled",style:"italic",children:ro(l[10]??l[11],t+1)}),o=l.index+l[0].length;return o<e.length&&c(e.slice(o)),a}function d0(e){return ro(e,0)}function Dn(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function h0(e){return e===null||typeof e=="string"}function m0(e){return e===null||typeof e=="number"&&Number.isFinite(e)}function Tu(e){return Array.isArray(e)&&e.every(t=>typeof t=="string")}function pS(e){return e===null?!0:Dn(e)?typeof e.ref=="string"&&typeof e.url=="string"&&typeof e.id=="string":!1}function gS(e){if(!Dn(e)||typeof e.id!="string"||e.id.trim().length===0||typeof e.name!="string"||typeof e.category!="string"||!Tu(e.capabilities)||!Dn(e.presentation)||!Dn(e.occupancy)||!Dn(e.state))return!1;let{presentation:t,occupancy:a,state:n}=e;return pS(t.image)&&m0(t.x)&&m0(t.y)&&typeof a.playerHome=="boolean"&&h0(a.residentCharacterId)&&h0(a.homeKind)&&typeof n.condition=="string"&&Tu(n.upgrades)&&Tu(n.furniture)&&Tu(n.publicFacts)&&typeof n.updatedAt=="string"}function p0(e){if(!Dn(e)||!Dn(e.settings)||!Array.isArray(e.settings.venues))return e;let t=e.settings.venues,a=t.filter(gS),n=Array.isArray(e.venueRequests)?e.venueRequests:[],o=n.filter(l=>Dn(l)&&typeof l.id=="string"&&Dn(l.venueDraft)&&typeof l.venueDraft.name=="string"&&typeof l.venueDraft.category=="string");return a.length===t.length&&o.length===n.length&&n===e.venueRequests?e:{...e,venueRequests:o,settings:{...e.settings,venues:a}}}function g0(e,t,a){return e==="Enter"&&!t&&!a}function ku(){let e=globalThis.crypto;if(typeof e?.randomUUID=="function")return e.randomUUID();if(typeof e?.getRandomValues=="function"){let t=e.getRandomValues(new Uint8Array(16));t[6]=t[6]&15|64,t[8]=t[8]&63|128;let a=Array.from(t,n=>n.toString(16).padStart(2,"0")).join("");return`${a.slice(0,8)}-${a.slice(8,12)}-${a.slice(12,16)}-${a.slice(16,20)}-${a.slice(20)}`}return`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,11)}`}function f0(e,t,a,n){let o=Math.max(0,a-1);return!e||e.roomId!==t?o:a>e.stepCount?e.stepCount:Math.min(n,o)}function Ar(e,t){return t?.roomId===e}function b0(e,t){return e.status==="closed"&&e.submissions?.some(a=>a.id===t)===!0}function v0(e,t){return t<0||t===e?"front":t<e?"left":"right"}function y0(e,t,a){let n=a==="front"?"front":"side",o=e.find(l=>l.view===n&&l.label===t)??e.find(l=>l.view===n&&l.label==="neutral")??e.find(l=>l.view==="front"&&l.label===t)??e.find(l=>l.view==="front"&&l.label==="neutral");return o?{image:o,mirrored:o.view==="side"&&a==="left"}:null}function w0(e,t,a){let n=.2*a.photoWidth/a.width,o=.2*a.photoHeight/a.height;return t.some(l=>l.x!==null&&l.y!==null&&Math.abs(l.x-e.x)<n&&Math.abs(l.y-e.y)<o)}function $0(e,t){return Math.hypot(t.x-e.x,t.y-e.y)>8||Math.abs(t.distance-e.distance)>8}var yi=(e,t,a)=>Math.min(a,Math.max(t,e));function Eu(e,t){if(!e.width||!e.height||!t.width||!t.height)return 1;let a=Math.min(t.width/e.width,t.height/e.height);return Math.max(t.width/(e.width*a),t.height/(e.height*a))}function wp(e,t,a){if(!e.width||!e.height||!t.width||!t.height)return{left:0,top:0,width:0,height:0};let n=Math.min(t.width/e.width,t.height/e.height),o=Math.max(a.zoom,Eu(e,t)),l=e.width*n*o,c=e.height*n*o,u=t.width/2-a.centerX*l,h=t.height/2-a.centerY*c;return{left:l<=t.width?(t.width-l)/2:yi(u,t.width-l,0),top:c<=t.height?(t.height-c)/2:yi(h,t.height-c,0),width:l,height:c}}function x0(e,t,a,n,o,l){let c=wp(e,t,a);if(!c.width||!c.height)return a;let u=Eu(e,t),h=yi(a.zoom*l,u,Math.max(4,u*2)),g=h/Math.max(a.zoom,u),$=c.width*g,x=c.height*g,f=(n.x-c.left)/c.width,b=(n.y-c.top)/c.height,C=o.x-f*$,k=o.y-b*x;return{zoom:h,centerX:yi((t.width/2-C)/$,0,1),centerY:yi((t.height/2-k)/x,0,1)}}function N0(e,t){let a=Math.max(1,t),n=Math.max(4,a*2);return .32+1.03*((yi(e,a,n)-a)/(n-a))}function S0(e,t){return t?Math.max(1,e):e}function $p(e,t,a){let n=Math.min(90,t.width/2),o=64,l=116,c=e.left+a.x*e.width,u=e.top+a.y*e.height,h=u+o,g=h+l<=t.height?h:u-o-l;return{left:yi(c,n,t.width-n),top:yi(g,0,Math.max(0,t.height-l))}}var r=Hs(xp()),i="marinara-capability-villages",C0="marinara-capability-villages-styles",vS="/api/villages",yS=.7,Mp=[{value:"rebuild",label:"Rebuild",description:"Begin again, together.",icon:"\u2302",premise:"On Day 1, survivors of a devastating upheaval gather to build a village together. They have a few supplies, uncertain shelter, and a reason to depend on one another."},{value:"pioneer",label:"Pioneer",description:"Follow the horizon.",icon:"\u25B3",premise:"On Day 1, a small group arrives in unfamiliar country to establish a village. They must choose a place to settle and decide what to build first."},{value:"prosper",label:"Prosper",description:"Make opportunity grow.",icon:"\u25A5",premise:"On Day 1, makers, merchants, and newcomers gather at a promising crossroads. They are choosing where to live, work, and begin trading together."},{value:"custom",label:"Custom",description:"Define your own scenario.",icon:"\u2726",premise:""},{value:"none",label:"Open beginning",description:"Write your own first day.",icon:"\u221E",premise:""}],Np=()=>({origin:"",worldFacts:[],openingConditions:[],visualCues:[]}),wS={"fresh-start":"People founded this village for a fresh start.",refuge:"People founded this village as a refuge.","shared-project":"People founded this village as a shared project.",discovery:"People founded this village to explore a discovery.",homecoming:"People founded this village as a homecoming.","something-else":"People founded this village for another reason."},uo=e=>Mp.find(t=>t.value===e),$S=e=>`/api/capability-packages/villages/assets/founding-${e}.jpg`,A0={roads:"auto",structures:"auto",water:"auto"},Au=["Village Beginning","Connections & Persona","Village Map","Build the Village","Review"],z0=1,Sp=3,xS={residence:["A modest stone home, with ivy growing on the walls","A tent and hammock pitched in the shade between two pine trees","A mighty castle, with imposing obsidian pillars and multiple dungeons","A dumpster behind the supermarket","An armored cash transport car, converted into a mobile home"],gathering:["A communal fire pit, with logs and stumps arranged around it in a semicircle","A decommissioned pizzeria, complete with inert animatronic performers","The situation room, with a round table bearing strategic maps","The hardy Brandythrone tavern, where ale and fistfights are plentiful","A meticulously-landscaped public park, where trampling the roses is punishable by fine"]},Tp="__villages_image_disabled__",Mu=["neutral","happy","sad","angry","surprised","thinking"];function R0(e,t,a,n,o=!1,l=1){let c=t==="gathering"?"Gathering Place":o?"Your residence":`Residence ${l}`;return{id:e,name:c,form:"",classes:[t],spaces:[{id:t,venueClass:t,description:"",image:null,state:{condition:"",items:[],publicFacts:[],features:[],traces:[],updatedAt:""}}],residenceCapacity:1,residentIds:[],improvements:[null,null],description:"",category:t==="gathering"?"public-center":"",presentation:{image:null,x:a,y:n},occupancy:{playerHome:o,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}}}function NS(e){let t=[];for(let a of e){let n=t[t.length-1];n&&n.label===a.dateLabel?n.entries.push(a):t.push({label:a.dateLabel,entries:[a]})}return t}var F0={commitment:"Promise & obligation","personal-fact":"Personal truth",preference:"Preference & boundary",relationship:"Relationship change","shared-experience":"Shared experience"};function zu(e){return e.map(t=>t.name).join(", ")||"No resident recorded"}function SS(e,t){let a=Date.parse(e)-t;if(a<=0)return"expiring now";let n=Math.floor(a/36e5),o=Math.max(1,Math.ceil(a%36e5/6e4));return n>0?`${n}h ${o}m left`:`${o}m left`}function TS({library:e,busy:t,onRefresh:a,onForget:n}){let[o,l]=(0,m.useState)("all"),[c,u]=(0,m.useState)(""),[h,g]=(0,m.useState)(""),[$,x]=(0,m.useState)(null),[f,b]=(0,m.useState)(""),C=Date.now(),k=(v,S)=>(!h.trim()||`${v} ${S.map(O=>O.name).join(" ")}`.toLowerCase().includes(h.trim().toLowerCase()))&&(!c||S.some(O=>O.id===c)),M=(e?.recollections??[]).filter(v=>k(v.text,[...v.subjects,...v.knownBy])),w=(e?.durable??[]).filter(v=>k(v.text,[...v.subjects,...v.knownBy])),y=async(v,S)=>{try{let O=await D(`/rooms/archive/${encodeURIComponent(v)}`);x({visit:O.visit,lineIds:S}),b("")}catch(O){x(null),b(U(O,"The source visit could not be read."))}};return(0,r.jsxs)("div",{className:`${i}-memory-library`,children:[(0,r.jsxs)("section",{className:`${i}-memory-hero`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("span",{className:`${i}-memory-kicker`,children:"Continuity, with receipts"}),(0,r.jsx)("h3",{children:"What your villagers carry forward"}),(0,r.jsx)("p",{children:"Passing recollections keep conversations coherent for 24 hours. Durable memories survive because an end-of-visit review found lasting meaning. Exact transcripts remain separate and are never used as hidden character knowledge."})]}),(0,r.jsxs)("div",{className:`${i}-memory-stats`,children:[(0,r.jsxs)("span",{children:[(0,r.jsx)("strong",{children:e?.recollections.length??0})," passing"]}),(0,r.jsxs)("span",{children:[(0,r.jsx)("strong",{children:e?.durable.length??0})," durable"]}),(0,r.jsxs)("span",{children:[(0,r.jsx)("strong",{children:e?.archive.total??0})," archived visits"]})]})]}),(0,r.jsxs)("div",{className:`${i}-memory-layers`,"aria-label":"How Villages memory works",children:[(0,r.jsxs)("article",{children:[(0,r.jsx)("span",{children:"01"}),(0,r.jsx)("strong",{children:"Passing"}),(0,r.jsx)("p",{children:"Useful context with a visible 24-hour expiry."})]}),(0,r.jsxs)("article",{children:[(0,r.jsx)("span",{children:"02"}),(0,r.jsx)("strong",{children:"Durable"}),(0,r.jsx)("p",{children:"Promises, truths, boundaries, bonds, and significant experiences."})]}),(0,r.jsxs)("article",{children:[(0,r.jsx)("span",{children:"03"}),(0,r.jsx)("strong",{children:"Archive"}),(0,r.jsx)("p",{children:"Word-for-word evidence, stored independently from character memory."})]})]}),e?.archive.pendingReviewCount?(0,r.jsxs)("div",{className:`${i}-memory-health`,role:"status",children:[(0,r.jsx)("span",{children:"\u25C7"}),(0,r.jsxs)("div",{children:[(0,r.jsxs)("strong",{children:[e.archive.pendingReviewCount," visit review pending"]}),(0,r.jsx)("p",{children:"The transcript is safe. Villages will retry without holding the room."})]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:t,onClick:a,children:"Retry now"})]}):null,(0,r.jsxs)("div",{className:`${i}-memory-toolbar`,children:[(0,r.jsx)("div",{className:`${i}-memory-tabs`,role:"group","aria-label":"Memory type",children:[["all","All"],["passing","Passing"],["durable","Durable"]].map(([v,S])=>(0,r.jsx)("button",{type:"button","data-active":o===v,onClick:()=>l(v),children:S},v))}),(0,r.jsx)("input",{type:"search",value:h,onChange:v=>g(v.target.value),placeholder:"Search memories\u2026","aria-label":"Search memories"}),(0,r.jsxs)("select",{value:c,onChange:v=>u(v.target.value),"aria-label":"Filter memories by resident",children:[(0,r.jsx)("option",{value:"",children:"Everyone"}),(e?.residents??[]).map(v=>(0,r.jsx)("option",{value:v.id,children:v.name},v.id))]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:t,onClick:a,children:"Refresh"})]}),e===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Reading the village\u2019s memory layers\u2026"}):null,e&&o!=="durable"&&M.length>0?(0,r.jsxs)("section",{className:`${i}-memory-section`,children:[(0,r.jsxs)("div",{className:`${i}-memory-section-head`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("span",{className:`${i}-memory-orb`,"data-kind":"passing",children:"\u25CC"}),(0,r.jsx)("h3",{children:"Passing recollections"})]}),(0,r.jsx)("span",{children:"Quiet context \xB7 expires naturally"})]}),(0,r.jsx)("div",{className:`${i}-memory-grid`,children:M.map(v=>{let S=v.evidence[v.evidence.length-1]??{visitId:v.visitId,lineIds:[]};return(0,r.jsxs)("article",{className:`${i}-memory-card`,"data-kind":"passing",children:[(0,r.jsxs)("div",{className:`${i}-memory-card-top`,children:[(0,r.jsx)("span",{className:`${i}-memory-pill`,children:"Passing"}),(0,r.jsx)("span",{children:SS(v.expiresAt,C)})]}),(0,r.jsx)("p",{className:`${i}-memory-text`,children:v.text}),(0,r.jsxs)("dl",{children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("dt",{children:"About"}),(0,r.jsx)("dd",{children:zu(v.subjects)})]}),(0,r.jsxs)("div",{children:[(0,r.jsx)("dt",{children:"Known by"}),(0,r.jsx)("dd",{children:zu(v.knownBy)})]})]}),v.reinforcementCount>0?(0,r.jsxs)("p",{className:`${i}-memory-reinforced`,children:["\u21BB Reinforced ",v.reinforcementCount," ",v.reinforcementCount===1?"time":"times"]}):null,(0,r.jsxs)("div",{className:`${i}-memory-card-actions`,children:[(0,r.jsx)("button",{type:"button",onClick:()=>{y(S.visitId,S.lineIds)},children:"View evidence"}),(0,r.jsx)("button",{type:"button",disabled:t,onClick:()=>n("recollections",v.id),children:"Let go"})]})]},v.id)})})]}):null,e&&o!=="passing"&&w.length>0?(0,r.jsxs)("section",{className:`${i}-memory-section`,children:[(0,r.jsxs)("div",{className:`${i}-memory-section-head`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("span",{className:`${i}-memory-orb`,"data-kind":"durable",children:"\u2726"}),(0,r.jsx)("h3",{children:"Durable memories"})]}),(0,r.jsx)("span",{children:"Lasting meaning \xB7 no arbitrary visit quota"})]}),(0,r.jsx)("div",{className:`${i}-memory-grid`,children:w.map(v=>(0,r.jsxs)("article",{className:`${i}-memory-card`,"data-kind":"durable",children:[(0,r.jsxs)("div",{className:`${i}-memory-card-top`,children:[(0,r.jsx)("span",{className:`${i}-memory-pill`,children:v.memoryCategory?F0[v.memoryCategory]:v.kind==="favour"?"Fulfilled wish":"Legacy memory"}),(0,r.jsxs)("span",{children:[v.dateLabel,Op(v)?` \xB7 ${Op(v)}`:""]})]}),(0,r.jsx)("p",{className:`${i}-memory-text`,children:v.text}),(0,r.jsxs)("dl",{children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("dt",{children:"About"}),(0,r.jsx)("dd",{children:zu(v.subjects)})]}),(0,r.jsxs)("div",{children:[(0,r.jsx)("dt",{children:"Known by"}),(0,r.jsx)("dd",{children:zu(v.knownBy)})]})]}),(0,r.jsxs)("div",{className:`${i}-memory-card-actions`,children:[v.evidence?(0,r.jsx)("button",{type:"button",onClick:()=>{y(v.evidence.visitId,v.evidence.lineIds)},children:"View evidence"}):(0,r.jsx)("span",{className:`${i}-memory-legacy`,children:"No evidence link on this older memory"}),(0,r.jsx)("button",{type:"button",disabled:t,onClick:()=>n("durable",v.id),children:"Forget"})]})]},v.id))})]}):null,e&&(o!=="durable"&&M.length||o!=="passing"&&w.length)===0?(0,r.jsxs)("div",{className:`${i}-memory-empty`,children:[(0,r.jsx)("span",{children:"\u2727"}),(0,r.jsx)("h3",{children:"No memories match"}),(0,r.jsx)("p",{children:"Try another resident, phrase, or memory layer."})]}):null,e?.expiredRecollectionCount?(0,r.jsxs)("p",{className:`${i}-memory-footnote`,children:[e.expiredRecollectionCount," expired passing recollection",e.expiredRecollectionCount===1?" is":"s are"," waiting for routine cleanup."]}):null,f?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:f}):null,$?(0,r.jsxs)("section",{className:`${i}-memory-evidence`,children:[(0,r.jsxs)("div",{className:`${i}-memory-section-head`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("span",{className:`${i}-memory-orb`,"data-kind":"archive",children:"\u2301"}),(0,r.jsxs)("h3",{children:["Exact evidence \xB7 ",$.visit.placeName]})]}),(0,r.jsx)("button",{type:"button",onClick:()=>x(null),"aria-label":"Close evidence",children:"\xD7"})]}),(0,r.jsx)("p",{children:"Only the cited archive lines are shown. The full visit remains in DEBUG \u2192 Venue Visits."}),(0,r.jsx)("ol",{children:$.visit.lines.filter(v=>$.lineIds.includes(v.id)).map(v=>(0,r.jsxs)("li",{children:[(0,r.jsxs)("span",{children:[(0,r.jsx)("strong",{children:v.name||"Player"}),(0,r.jsxs)("small",{children:[Ou(v.at)," \xB7 heard by"," ",v.heardBy.map(S=>$.visit.participants.find(O=>O.characterId===S)?.name??S).join(", ")||"no one"]})]}),Rr(v.content,`memory-evidence-${v.id}-`)]},v.id))})]}):null]})}function Ou(e){if(e.length===0)return"";let t=new Date(e);return Number.isNaN(t.getTime())?"":a1.format(t)}function Op(e){return Ou(e.occurredAt)}function kS(e,t){return e.find(a=>a.id===t)?.name??"a place that is gone"}function M0(e){return`${String(Math.floor(e/60)).padStart(2,"0")}:${String(e%60).padStart(2,"0")}`}function kp(e){let t=e.agenda?.activeDay;if(!t)return!1;let a=(e.ingestSchedule?e.agenda?.scheduleWeek?.[t.weekday]:void 0)??e.agenda?.week?.[t.weekday];return!!a&&JSON.stringify(t.blocks)!==JSON.stringify(a)}var ES=new Intl.DateTimeFormat(void 0,{day:"numeric",month:"short"});function CS(e,t){let a=[],n=Date.parse(e);if(Number.isFinite(n)){let l=Math.floor((Date.now()-n)/864e5);a.push(l<=0?"written today":l===1?"written yesterday":`written ${l} days ago`)}let o=Date.parse(t);return a.push(Number.isFinite(o)?`fades ${ES.format(new Date(o))}`:"no set end"),a.join(" \xB7 ")}function AS(e,t){let a=e.find(n=>n.id===t.placeId);return a?t.area==="outside"?a.presentation.image?.url??"":t.area==="private"?a.privateSpaces?.find(n=>n.ownerId===t.privateOwnerId)?.image?.url??"":(t.spaceClass?nt(a,t.spaceClass).image:null)?.url??"":""}var Vp=class extends m.Component{constructor(){super(...arguments);qg(this,"state",{error:null})}static getDerivedStateFromError(a){return{error:a}}componentDidCatch(a){let n=a.message||"Villages could not open.";this.props.element.capabilityRuntimeError=n,this.props.element.dispatchEvent(new CustomEvent("marinara-capability-runtime-error",{detail:{message:n},bubbles:!0})),console.error("Villages client capability stopped",a)}render(){return this.state.error?(0,r.jsx)("div",{className:`${i}-root`,role:"alert",children:(0,r.jsxs)("section",{className:`${i}-panel`,children:[(0,r.jsx)("h1",{className:`${i}-panel-title`,children:"Villages could not open"}),(0,r.jsx)("p",{className:`${i}-error`,children:this.state.error.message||"An unexpected client error occurred."}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{this.props.element.capabilityRuntimeError=null,this.setState({error:null})},children:"Try again"})]})}):this.props.children}},zS=`
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
  And the same hiding, for the two states of an opening that has not landed.

  The scene opens first, so while its first moment is being written there is
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
  menu rather than a row of words. Conclude selects an ending in that menu, and
  Send performs it.

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
  centred on the frame's height. The words are the only thing whose height
  changes as they wrap.

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
  sit exactly where the glyph now is. The room composer grows from one line to
  two and then scrolls inside the frame.

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
.${i}-setup-root {
  box-sizing: border-box; container-type: inline-size; overflow-x: hidden; overflow-y: auto;
  --background: #121936; --popover: #141b39; --foreground: #f3f3ff;
  --muted-foreground: #b3bee8; --border: #566ab1; --primary: #b49aff;
  background: radial-gradient(circle at 12% 95%, #263978, #111832 50%, #0e1430);
  color: #f3f3ff;
}
.${i}-setup-body { flex-wrap: nowrap; align-items: stretch; }
.${i}-setup-body { flex: 0 0 auto; min-height: 0; }
.${i}-setup-body > .${i}-side { flex: 1 1 34rem; }
.${i}-setup-visual {
  display: flex; flex-direction: column; gap: .6rem; flex: 1 1 19rem; min-width: 0; min-height: 0;
}
.${i}-setup-visual > .${i}-setup-map-shell { flex: 1 1 auto; min-height: 0; }
.${i}-setup-footer { display: flex; gap: .65rem; min-height: 2.75rem; }
.${i}-setup-footer > .${i}-button { flex: 1 1 0; min-width: 0; }
.${i}-setup-footer > .${i}-setup-forward {
  border-color: #7584ff; background: linear-gradient(135deg, #6077ff, #7365ed);
  color: #fff; font-weight: 700;
}
.${i}-setup-rail {
  flex: 0 0 10rem; display: flex; flex-direction: column; gap: .4rem;
  padding: .75rem .25rem; color: var(--muted-foreground);
}
.${i}-setup-rail-step {
  display: flex; align-items: center; gap: .65rem; padding: .4rem .25rem;
  font-size: .78rem; line-height: 1.35; opacity: .75;
}
.${i}-setup-rail-step[data-active="true"] { color: var(--foreground); opacity: 1; font-weight: 700; }
.${i}-setup-rail-step[data-done="true"] { opacity: 1; }
.${i}-setup-rail-number {
  display: grid; place-items: center; flex: 0 0 2rem; height: 2rem;
  border: 1px solid var(--border); border-radius: 50%; font-weight: 700;
}
.${i}-setup-rail-step[data-active="true"] .${i}-setup-rail-number {
  border-color: #bca5ff; background: linear-gradient(135deg, #7663f6, #446ee9);
  box-shadow: 0 0 .85rem #9878f1a8; color: #fff;
}
.${i}-setup-kicker { margin: 0; color: var(--muted-foreground); font-size: .78rem; }
.${i}-setup-body {
  --background: #151d3b; --popover: #141b39; --foreground: #f3f3ff;
  --muted-foreground: #b3bee8; --border: #566ab1; --primary: #b49aff;
  gap: .75rem; align-items: stretch; color: var(--foreground);
}
.${i}-setup-body > .${i}-side { flex-basis: 35rem; min-height: 0; }
.${i}-setup-body .${i}-overlay {
  gap: .2rem; padding: .65rem .8rem; border-color: #5268b8; border-radius: 1rem;
  background: linear-gradient(145deg, #182044, #101831);
  box-shadow: inset 0 0 2rem #27347866;
}
.${i}-setup-body .${i}-panel-title {
  font-size: clamp(1.25rem, 1.8vw, 1.65rem); color: #f5f5ff;
}
.${i}-setup-body .${i}-field { margin-top: .15rem; }
.${i}-setup-body[data-step="1"] .${i}-overlay { height: 100%; min-height: 0; overflow: hidden; }
.${i}-setup-body .${i}-search,
.${i}-setup-body .${i}-textarea,
.${i}-setup-body .${i}-select,
.${i}-setup-body .${i}-notice-input {
  background: #1c254a; border-color: #7082cf; color: #f2f4ff;
}
.${i}-setup-beginning-textarea { min-height: 4.5rem; }
.${i}-setup-form-field { display: grid; grid-template-columns: 4.5rem minmax(0, 1fr); gap: .35rem .6rem; align-items: start; }
.${i}-setup-form-field > .${i}-label { padding-top: .55rem; }
.${i}-setup-form-field > .${i}-hint { grid-column: 2; }
.${i}-setup-place-spaces { display: grid; gap: .65rem; }
.${i}-setup-place-space { display: grid; gap: .4rem; border: 1px solid #5265ac; border-radius: .85rem; background: #1c254b; padding: .7rem; }
.${i}-setup-place-space h4 { margin: 0; color: #f5f5ff; font-size: 1rem; }
.${i}-setup-advanced {
  border: 1px solid #5265ac; border-radius: .85rem; background: #1c254b; padding: .55rem .65rem;
}
.${i}-setup-advanced > summary { cursor: pointer; }
.${i}-setup-advanced .${i}-reason-options { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .5rem; }
.${i}-setup-advanced .${i}-label { min-width: 0; }
.${i}-setup-review-card {
  display: grid; gap: .3rem; border: 1px solid #5265ac; border-radius: .85rem;
  background: #1c254b; padding: .65rem;
}
.${i}-setup-review-card h3 { margin: 0; color: #f5f5ff; font-size: .9rem; }
.${i}-setup-review-card p { margin: 0; }
.${i}-setup-body .${i}-setup-venue-card {
  border-color: #5265ac; border-radius: .85rem; background: #1c254b; color: #f0f2ff;
}
.${i}-setup-body .${i}-setup-venue-card[data-selected="true"] {
  border-color: #dac8ff; box-shadow: 0 0 0 2px #9a78ff;
}
.${i}-setup-body .${i}-setup-map-shell {
  overflow: hidden; border: 1px solid #6684d4; border-radius: 1.2rem; background: #162550;
}
.${i}-setup-body .${i}-step[data-clickable="true"] {
  border-color: #5265ac; border-radius: .65rem; background: #1c254b; color: #d3ddfa; padding: .4rem .7rem;
}
.${i}-setup-body .${i}-step[data-active="true"] {
  border-color: #dac8ff; background: linear-gradient(165deg, #303d85, #202754);
  box-shadow: 0 0 0 2px #9a78ff; color: #f5f5ff;
}
.${i}-scenario-options {
  display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .4rem; margin-top: .15rem;
}
.${i}-scenario-option {
  position: relative; display: flex; flex-direction: column; align-items: center;
  justify-content: center; gap: .1rem; min-height: 3.2rem; padding: .25rem .3rem;
  border: 1px solid #5265ac; border-radius: .85rem; background: #1c254b;
  color: #f0f2ff; text-align: center; cursor: pointer;
}
.${i}-scenario-option input {
  position: absolute; width: 1px; height: 1px; opacity: 0;
}
.${i}-scenario-option:has(input:checked) {
  border-color: #dac8ff; background: linear-gradient(165deg, #303d85, #202754);
  box-shadow: 0 0 0 2px #9a78ff, 0 0 1rem #9a78ff9c;
}
.${i}-scenario-option:has(input:focus-visible) { outline: 3px solid #f2d6ff; outline-offset: 3px; }
.${i}-scenario-icon { color: #b9c8ff; font-size: max(1.1rem, 18px); line-height: 1; }
.${i}-scenario-option strong { font-size: max(.72rem, 13px); }
.${i}-scenario-option small { color: #bdc8ed; font-size: max(.6rem, 11px); line-height: 1.2; }
.${i}-scenario-art-panel {
  position: relative; flex: 1 1 12rem; min-width: 0; min-height: 8rem;
  overflow: hidden; border: 1px solid #6684d4; border-radius: 1.2rem; background: #162550;
}
.${i}-scenario-art-panel > img {
  position: absolute; inset: 0; width: 100%; height: 100%; object-fit: cover;
}
.${i}-scenario-art-placeholder {
  position: absolute; inset: 0; display: grid; place-items: center;
  color: #d3ddfa; font-size: 2rem;
}
.${i}-scenario-art-panel::after {
  content: ""; position: absolute; inset: 36% 0 0;
  background: linear-gradient(transparent, #0e1a3ba8 48%, #101a3ef0);
}
.${i}-scenario-art-content {
  position: absolute; z-index: 1; inset: auto 1rem 1rem;
  display: flex; flex-direction: column; align-items: center; gap: .5rem;
  color: #fff; text-align: center;
}
.${i}-scenario-art-content p {
  margin: 0; font-family: Georgia, serif; font-style: italic; font-size: clamp(1.25rem, 2vw, 1.9rem);
}
.${i}-scenario-art-content strong { font-weight: 500; }
/* World setup uses the same indigo panels and borders as Identity and Persona. */
.${i}-lore-picker {
  border: 1px solid #5265ac; border-radius: .85rem; background: #1c254b; padding: .65rem;
}
.${i}-lore-selected { display: flex; flex-wrap: wrap; gap: .35rem; max-height: 5rem; overflow-y: auto; margin: .4rem 0; }
.${i}-lore-chip {
  display: inline-flex; align-items: center; gap: .3rem; max-width: 100%; padding: .15rem .25rem .15rem .5rem;
  border: 1px solid #6684d4; border-radius: 999px; background: #303d85; color: #f0f2ff; font-size: .72rem;
}
.${i}-lore-chip span { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.${i}-lore-chip button { border: 0; background: transparent; color: inherit; cursor: pointer; font: inherit; }
.${i}-lore-chip button:focus-visible { outline: 2px solid #f2d6ff; border-radius: 50%; }
.${i}-lore-options > summary { cursor: pointer; list-style-position: inside; }
.${i}-lore-options > .${i}-search { width: 100%; box-sizing: border-box; margin: .5rem 0; }
.${i}-lore-results { display: grid; gap: .15rem; max-height: 12rem; overflow-y: auto; }
/* Compact, role-neutral identity chooser used by Founding's Persona adapter. */
.${i}-founding-persona { display: flex; flex-direction: column; gap: .3rem; min-height: 0; }
.${i}-identity-picker-head { display: flex; align-items: center; gap: .75rem; }
.${i}-identity-picker-head > .${i}-label { flex: 0 0 auto; }
.${i}-identity-picker-head > .${i}-search { flex: 1 1 auto; width: 0; min-width: 0; }
.${i}-identity-strip {
  display: flex; gap: .4rem; min-height: 5.5rem; overflow-x: auto; overflow-y: hidden;
  padding: .15rem .15rem .3rem; scrollbar-width: thin;
}
.${i}-identity-card {
  display: flex; flex-direction: column; align-items: center; gap: .15rem;
  flex: 0 0 6.8rem; min-width: 0; padding: .25rem;
  border: 1px solid #5265ac; border-radius: .6rem; background: #1c254b;
  color: #f0f2ff; font: inherit; font-size: .7rem; cursor: pointer;
}
.${i}-identity-card[aria-pressed="true"] { border-color: #dac8ff; box-shadow: 0 0 0 2px #9a78ff; }
.${i}-identity-card:focus-visible { outline: 3px solid #f2d6ff; outline-offset: 2px; }
.${i}-identity-card-face, .${i}-identity-preview-face {
  position: relative; display: grid; place-items: center; overflow: hidden; flex: 0 0 auto;
  border-radius: 50%; background: #324576; color: #e9edff;
}
.${i}-identity-card-face { width: 2.5rem; height: 2.5rem; }
.${i}-identity-card-face > img, .${i}-identity-preview-face > img { width: 100%; height: 100%; object-fit: cover; }
.${i}-identity-card-face svg, .${i}-identity-preview-face svg { width: 55%; height: 55%; }
.${i}-identity-card strong, .${i}-identity-card small {
  overflow: hidden; max-width: 100%; white-space: nowrap; text-overflow: ellipsis;
}
.${i}-identity-card small { color: #b9c8e9; font-size: .55rem; }
.${i}-identity-preview {
  display: flex; gap: .55rem; min-height: 0; max-height: 9.3rem; overflow-y: auto;
  padding: .5rem; border: 1px solid #5265ac; border-radius: .65rem; background: #1c254b;
}
.${i}-identity-preview-face { width: 3.2rem; height: 3.2rem; }
.${i}-identity-preview-copy { min-width: 0; font-size: .68rem; line-height: 1.35; }
.${i}-identity-preview-copy h3 { margin: 0 0 .15rem; font-size: .9rem; }
.${i}-identity-preview-copy p { margin: .12rem 0; }
.${i}-identity-overview { display: -webkit-box; -webkit-box-orient: vertical; -webkit-line-clamp: 2; overflow: hidden; }
.${i}-identity-details { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .35rem; margin: .3rem 0; }
.${i}-identity-details dt { font-weight: 700; color: #cfdaff; }
.${i}-identity-details dd { margin: 0; }
.${i}-identity-context { color: #bdc8ed; }
.${i}-connections-compact { min-height: 0; }
.${i}-connections-compact > .${i}-hint { margin: 0; }
.${i}-connections-grid { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: .55rem; }
.${i}-connections-grid > .${i}-field { min-width: 0; }
.${i}-connections-grid .${i}-select { width: 100%; }
.${i}-connections-grid .${i}-hint { line-height: 1.25; }
@container (min-width: 80rem) {
  .${i}-scenario-options { grid-template-columns: repeat(4, minmax(0, 1fr)); }
}
@container (max-width: 70rem) {
  .${i}-setup-body { flex-wrap: wrap; }
  .${i}-setup-rail {
    flex: 1 1 100%; flex-direction: row; overflow-x: auto; padding: .25rem 0;
  }
  .${i}-setup-rail-step { flex: 0 0 auto; }
}
@container (min-width: 42.01rem) and (max-width: 70rem) {
  .${i}-setup-body > .${i}-side { flex-basis: 25rem; }
  .${i}-setup-visual { flex-basis: 14rem; }
}
@container (max-width: 42rem) {
  .${i}-setup-body { flex: none; }
  .${i}-setup-body > .${i}-side,
  .${i}-setup-visual { flex: 1 1 100%; }
  .${i}-setup-body[data-step="1"] .${i}-overlay { height: auto; overflow: visible; }
  .${i}-identity-preview { max-height: none; }
  .${i}-connections-grid { grid-template-columns: 1fr; }
  .${i}-scenario-options { grid-template-columns: repeat(2, minmax(0, 1fr)); }
  .${i}-setup-advanced .${i}-reason-options { grid-template-columns: 1fr; }
  .${i}-scenario-art-panel { flex: none; height: 18rem; }
  .${i}-setup-form-field { grid-template-columns: 1fr; }
  .${i}-setup-form-field > .${i}-hint { grid-column: 1; }
}
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

/* Venue visits use a single shallow reading dock so the stage owns the remaining height. */
.${i}-room-screen > .${i}-chat { gap: 0; padding: 0; overflow: hidden; }
.${i}-room-screen .${i}-chat-scrim {
  background: linear-gradient(180deg, color-mix(in srgb, var(--background) 30%, transparent), transparent 25%, transparent 65%, color-mix(in srgb, var(--background) 30%, transparent));
}
.${i}-room-screen .${i}-chat-vignette { opacity: .45; }
.${i}-room-screen .${i}-chat-head { top: .65rem; left: .75rem; right: .75rem; z-index: 6; align-items: center; }
.${i}-room-place, .${i}-room-actions-trigger, .${i}-room-notices-trigger {
  border: 1px solid var(--marinara-chat-chrome-panel-border, var(--border)); border-radius: .65rem;
  background: var(--marinara-chat-chrome-panel-bg, color-mix(in srgb, var(--popover) 82%, transparent));
  color: var(--foreground); backdrop-filter: blur(12px); box-shadow: 0 .25rem .75rem #0004;
}
.${i}-room-place { display: block; max-width: min(18rem, 60%); padding: .35rem .65rem; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; font-size: .75rem; }
.${i}-room-screen .${i}-chat-actions { position: relative; width: auto; margin-left: auto; }
.${i}-room-actions-trigger { width: 2rem; height: 2rem; cursor: pointer; font-size: 1.25rem; line-height: 1; }
.${i}-room-actions-menu { position: absolute; right: 0; top: calc(100% + .4rem); z-index: 15; display: grid; width: min(16rem, 80vw); padding: .25rem; border: 1px solid var(--border); border-radius: .7rem; background: var(--popover); box-shadow: 0 .6rem 1.5rem #0009; }
.${i}-room-actions-menu button { border: 0; border-radius: .4rem; padding: .55rem .65rem; background: transparent; color: var(--foreground); text-align: left; font: inherit; font-size: .8125rem; cursor: pointer; }
.${i}-room-actions-menu button:hover { background: color-mix(in srgb, var(--foreground) 9%, transparent); }
.${i}-room-actions-menu button:disabled { opacity: .45; cursor: default; }
.${i}-room-notices { position: absolute; top: 3.2rem; left: .75rem; z-index: 4; }
.${i}-room-notices-trigger { min-width: 2.5rem; min-height: 2rem; padding: .25rem .55rem; color: #e5b13e; font-size: .75rem; cursor: pointer; }
.${i}-room-screen .${i}-room-stars, .${i}-room-screen[data-mobile="true"] .${i}-room-stars { position: absolute; top: calc(100% + .35rem); left: 0; width: min(20rem, calc(100vw - 1.5rem)); max-height: 35cqh; overflow-y: auto; }
.${i}-room-screen .${i}-chat-stage { position: relative; top: auto; bottom: auto; left: auto; width: 100%; height: auto; min-height: 0; flex: 1 1 auto; padding: 3rem .75rem 0; box-sizing: border-box; }
.${i}-room-screen .${i}-chat-cast { height: 100%; max-height: none; gap: clamp(.2rem, 1vw, 1rem); }
.${i}-room-screen .${i}-chat-cast-person,
.${i}-room-screen .${i}-chat-cast-person[data-active="true"] { position: relative; flex: 1 1 0; max-width: 25%; height: 100%; min-width: 0; opacity: .78; transition: transform .18s ease, opacity .18s ease, filter .18s ease; }
.${i}-room-screen .${i}-chat-cast-person[data-active="true"] { z-index: 2; opacity: 1; filter: brightness(1.08); transform: scale(1.035); transform-origin: center bottom; }
.${i}-room-screen .${i}-chat-cast-person[data-sprite="false"] { justify-content: center; }
.${i}-room-screen .${i}-chat-cast-person > img { width: 100%; height: 100%; max-width: none; object-fit: contain; object-position: center bottom; }
.${i}-room-screen .${i}-chat-cast-person > .${i}-avatar { width: min(8rem, 80%); }
.${i}-room-screen .${i}-chat-cast-person > span:not(.${i}-avatar) { position: absolute; bottom: .3rem; max-width: 95%; }
.${i}-room-screen .${i}-chat-cast-rest { position: absolute; right: .5rem; bottom: .25rem; }
.${i}-room-screen .${i}-chat-vn { position: relative; z-index: 3; flex: 0 0 auto; align-self: center; width: min(72rem, calc(100% - 1.5rem)); margin: 0 auto .5rem; padding: .5rem .75rem; gap: .25rem; border-radius: .85rem; }
.${i}-room-screen .${i}-chat[data-opening-error="true"] .${i}-chat-vn { display: flex; }
.${i}-room-screen .${i}-chat-vn-card { border: 0; border-radius: 0; background: transparent; backdrop-filter: none; box-shadow: none; }
.${i}-room-screen .${i}-chat-vn-row { padding: 0; }
.${i}-room-screen .${i}-chat-vn-column { gap: .18rem; }
.${i}-room-screen .${i}-chat-vn-reading { max-height: 5.8rem; min-height: 1.45rem; padding: 0 .25rem 0 0; overflow-y: auto; }
.${i}-room-screen .${i}-chat-vn-text,
.${i}-room-screen .${i}-chat-vn-beat { max-width: none; padding: 0; border: 0; border-radius: 0; background: transparent; color: var(--foreground); font-size: 1rem; line-height: 1.45; }
.${i}-room-screen .${i}-chat-vn-name,
.${i}-room-screen .${i}-chat-vn-label { align-self: flex-start; margin: 0; padding: 0; border-radius: 0; background: transparent; color: var(--marinara-chat-chrome-highlight-text, var(--primary)); font-size: .72rem; font-weight: 650; line-height: 1.35; letter-spacing: 0; text-transform: none; }
.${i}-room-panel-tools { display: grid; grid-template-columns: minmax(4rem, 1fr) auto minmax(4rem, 1fr); gap: .4rem; min-height: 1.75rem; border-top: 1px solid var(--marinara-chat-chrome-panel-divider, var(--border)); padding-top: .25rem; }
.${i}-room-panel-tools .${i}-chat-history-toggle { justify-self: start; min-height: 1.75rem; padding: .15rem .35rem; border: 0; background: transparent; font-size: .75rem; }
.${i}-room-panel-tools .${i}-chat-vn-counter { justify-self: center; }
.${i}-room-panel-tools .${i}-chat-vn-nav { justify-self: end; gap: .25rem; padding: 0; border: 0; }
.${i}-room-panel-tools .${i}-chat-vn-button { min-height: 1.75rem; padding: .2rem .4rem; border: 0; color: var(--foreground); }
.${i}-room-screen .${i}-chat-log { position: absolute; z-index: 8; bottom: calc(100% + .45rem); left: 0; width: 100%; max-height: min(55cqh, 32rem); box-sizing: border-box; overflow-y: auto; padding: .75rem; border: 1px solid var(--border); border-radius: .75rem; background: var(--popover); box-shadow: 0 .75rem 2rem #0009; }
.${i}-room-screen .${i}-chat-vn-asides { position: absolute; right: .5rem; bottom: calc(100% + .45rem); width: min(25vw, 22rem); max-height: min(20cqh, 10rem); overflow-y: auto; }
.${i}-room-screen .${i}-chat-vn-asides[data-side="left"] { right: auto; left: .5rem; }
.${i}-room-screen[data-mobile="true"] .${i}-chat-vn-asides { position: absolute; right: .5rem; bottom: calc(100% + .45rem); width: min(25vw, 22rem); max-height: min(20cqh, 10rem); margin: 0; }
.${i}-room-screen[data-mobile="true"] .${i}-chat-vn-asides[data-side="left"] { right: auto; left: .5rem; }
.${i}-room-screen .${i}-composer { padding-top: .35rem; border-top: 1px solid var(--marinara-chat-chrome-panel-divider, var(--border)); }
.${i}-room-screen .${i}-chat-input > .${i}-textarea { height: 1.75rem; min-height: 0; max-height: none; overflow-y: hidden; }
.${i}-room-actions-trigger:focus-visible, .${i}-room-actions-menu button:focus-visible, .${i}-room-notices-trigger:focus-visible, .${i}-room-panel-tools button:focus-visible { outline: 2px solid var(--primary); outline-offset: 2px; }
@container ${i} (max-width: 44rem) {
  .${i}-room-screen .${i}-chat-stage { min-height: 0; padding-top: 3rem; }
  .${i}-room-screen .${i}-chat-cast-person, .${i}-room-screen .${i}-chat-cast-person[data-active="true"] { flex: 1 1 0; max-width: 25%; height: 100%; }
  .${i}-room-screen .${i}-chat-cast-person > img { height: 100%; }
  .${i}-room-screen .${i}-chat-vn { width: calc(100% - .75rem); margin-bottom: .35rem; padding: .45rem .55rem; }
  .${i}-room-screen .${i}-chat-vn-asides, .${i}-room-screen[data-mobile="true"] .${i}-chat-vn-asides { position: absolute; right: .25rem; bottom: calc(100% + .3rem); width: min(52vw, 13rem); max-height: 20cqh; margin: 0; }
  .${i}-room-screen .${i}-chat-vn-asides[data-side="left"], .${i}-room-screen[data-mobile="true"] .${i}-chat-vn-asides[data-side="left"] { right: auto; left: .25rem; }
}
@container ${i} (max-height: 30rem) {
  .${i}-room-screen .${i}-chat-stage { min-height: 0; padding-top: 2.5rem; }
  .${i}-room-screen .${i}-chat-vn { width: min(72rem, calc(100% - .75rem)); align-self: center; }
  .${i}-room-screen .${i}-chat-vn-reading { max-height: 4.35rem; }
}
@container ${i} (max-width: 44rem) and (min-height: 40rem) {
  .${i}-room-screen .${i}-chat-vn-asides, .${i}-room-screen[data-mobile="true"] .${i}-chat-vn-asides { bottom: calc(100% + 13rem); }
}
@media (prefers-reduced-motion: reduce) { .${i}-room-screen .${i}-chat-cast-person { transition: none; } }
`;function O0(){let e=document.getElementById(C0);if(!document.querySelector(i)){e?.remove();return}if(e)return;let t=document.createElement("style");t.id=C0,t.textContent=zS,document.head.appendChild(t)}var RS="marinara_admin_secret";function P0(e){let t=new Headers(e?.headers);try{let a=window.localStorage.getItem(RS)?.trim();a&&t.set("X-Admin-Secret",a)}catch{}return typeof e?.body=="string"&&!t.has("Content-Type")&&t.set("Content-Type","application/json"),t}var MS="This action needs loopback access or admin access. Open the app through localhost, or set ADMIN_SECRET=<secret> in the server .env and paste the same value in Settings \u2192 Advanced \u2192 Admin Access. Marinara sends it as the X-Admin-Secret header.";function W0(e,t,a){let n=e?.error,o=typeof n=="string"&&n?n:a;return t===403&&/admin[-_ ]?secret/iu.test(o)?new Error(`${MS} (${o})`):new Error(o)}async function D(e,t){let a=await fetch(`${vS}${e}`,{...t,headers:P0(t)}),n=await a.json().catch(()=>null);if(!a.ok)throw W0(n,a.status,`The village replied ${a.status}.`);return p0(n)}async function Hp(e,t){let a=await fetch(e,{cache:"no-store",credentials:"same-origin",...t,headers:P0(t)}),n=await a.json().catch(()=>null);if(!a.ok)throw W0(n,a.status,`The Engine replied ${a.status}.`);return n}var lo=e=>typeof e=="number"&&Number.isFinite(e);function Ip(e){let t=e;for(let x=0;x<2&&typeof t=="string";x+=1)try{t=JSON.parse(t)}catch{return null}if(!t||typeof t!="object"||Array.isArray(t))return null;let a=t,{srcX:n,srcY:o,srcWidth:l,srcHeight:c}=a;if(lo(n)&&lo(o)&&lo(l)&&lo(c))return l<=0||c<=0||n<0||o<0||n+l>1.001||o+c>1.001?null:{srcX:n,srcY:o,srcWidth:l,srcHeight:c};let{zoom:u,offsetX:h,offsetY:g,fullImage:$}=a;return!lo(u)||u<=0||!lo(h)||!lo(g)||$!==void 0&&typeof $!="boolean"?null:$===void 0?{zoom:u,offsetX:h,offsetY:g}:{zoom:u,offsetX:h,offsetY:g,fullImage:$}}function OS(e){if(!e)return{};if("zoom"in e){let t=`scale(${e.zoom}) translate(${e.offsetX}%, ${e.offsetY}%)`;return e.fullImage?{objectFit:"contain",transform:t}:e.zoom<=1?{}:{transform:t}}return{position:"absolute",width:`${100/e.srcWidth}%`,height:`${100/e.srcHeight}%`,left:`${-e.srcX/e.srcWidth*100}%`,top:`${-e.srcY/e.srcHeight*100}%`,maxWidth:"none",maxHeight:"none",objectFit:"fill"}}async function VS(e,t){if(e.length===0)return{};let a=await Hp("/api/characters/summaries",{method:"POST",body:JSON.stringify({ids:e}),signal:t}),n={};if(!Array.isArray(a))return n;for(let o of a){let l=typeof o?.id=="string"?o.id:"",c=typeof o?.avatarUrl=="string"?o.avatarUrl.trim():"";l.length>0&&c.length>0&&(n[l]={url:c,crop:Ip(o.avatarCrop)})}return n}async function DS(e,t){let a=e.trim();if(a.length===0)return null;let n=await Hp(`/api/characters/personas/${encodeURIComponent(a)}`,{signal:t}),o=typeof n?.avatarPath=="string"?n.avatarPath.trim():"";return o.length===0?null:{url:o,crop:Ip(n.avatarCrop)}}function _S(e){let t=[];for(let a of e){let n=typeof a.id=="string"?a.id.trim():"";if(n.length===0)continue;let o=typeof a.provider=="string"?a.provider:"";if(o==="video_generation")continue;let l=typeof a.name=="string"&&a.name.trim()?a.name.trim():n;t.push({id:n,name:l,category:o==="image_generation"?"image_generation":"language",defaultForAgents:a.defaultForAgents===!0||a.defaultForAgents==="true"})}return t}function U(e,t){return e instanceof Error&&e.message?e.message:t}function zr(e){let t=U(e,"");return t.includes("Interrupted: Inactivity")?"inactivity":/no longer available|not active|already ended/iu.test(t)?"elsewhere":null}async function V0(e){try{let{session:t}=await D("/rooms/active",{signal:AbortSignal.timeout(5e3)});return t?.id===e&&t.status!=="opening"?t:null}catch{return null}}async function D0(e,t){try{let{visit:a}=await D(`/rooms/archive/${encodeURIComponent(e)}`,{signal:AbortSignal.timeout(5e3)});return b0(a,t)?a:null}catch{return null}}function _0(e){let t=U(e,"The scene opening could not be prepared.");return/timeout|timed out|exceeded 28 seconds/iu.test(t)?"The scene opening took too long. Retry it or continue without an opening.":`${t} Retry it or continue without an opening.`}function Vu(e){let t=e?.trim();if(!(!t||/url\(|;|expression\(/i.test(t)))return/^(?:linear|radial|conic)-gradient\(/i.test(t)?CSS.supports("background-image",t)?{backgroundImage:t,backgroundClip:"text",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",color:"transparent"}:void 0:CSS.supports("color",t)?{color:t}:void 0}function Rr(e,t){return e1(d0(e),t)}function e1(e,t){let a=0;return e.map(n=>{let o=`${t}${a++}`;switch(n.kind){case"text":return n.text;case"code":return(0,r.jsx)("code",{className:`${i}-chat-md-code`,dir:"ltr",children:n.text},o);case"link":return(0,r.jsx)("a",{className:`${i}-chat-md-link`,href:n.href,target:"_blank",rel:"noopener noreferrer",children:n.text},o);default:return HS(n,o)}})}function HS(e,t){let a=e1(e.children,`${t}-`);switch(e.style){case"bold":return(0,r.jsx)("strong",{children:a},t);case"bold-italic":return(0,r.jsx)("strong",{children:(0,r.jsx)("em",{children:a})},t);case"italic":return(0,r.jsx)("em",{children:a},t);case"underline":return(0,r.jsx)("u",{children:a},t);case"strikethrough":return(0,r.jsx)("del",{children:a},t);default:return(0,r.jsx)("mark",{className:`${i}-chat-md-highlight`,children:a},t)}}function IS(e){return e==="off"?"Time, schedules, wishes, and approved projects still advance. No optional stories are added.":e==="quiet"?"Usually one optional village story is written on an active day.":e==="lively"?"Up to three optional village stories may be written on an active day.":"Usually one to three optional village stories are written on an active day, averaging two."}function Mr(e){return e.classes?.includes("residence")??(e.occupancy.playerHome||e.occupancy.residentCharacterId!==null||e.occupancy.homeKind!==null)}var t1=["residence","workplace","gathering","other"];function Hn(e){return e.classes?.length?e.classes:Mr(e)?["residence"]:["other"]}function H0(e){return Math.min(4,(e.residenceCapacity??1)+(e.improvements??[]).reduce((t,a)=>t+(a?.extraBeds??0),0))}function Du(e){return(e.residentIds?.length??+!!e.occupancy.residentCharacterId)+Number(e.occupancy.playerHome)}function nt(e,t){return e.spaces?.find(a=>a.venueClass===t)??{id:t,venueClass:t,description:e.description,image:e.presentation.image,state:{condition:e.state.condition,items:e.state.furniture,publicFacts:e.state.publicFacts,features:e.state.features??[],traces:e.state.traces??[],updatedAt:e.state.updatedAt}}}function I0({draft:e,existing:t,villagers:a,editableClasses:n,onChange:o}){let l=Hn(e),c=(u,h)=>{let g=l.map($=>$===u?{...nt(e,$),...h}:nt(e,$));o({...e,spaces:g,description:g[0]?.description??e.description})};return(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsxs)("label",{className:`${i}-label`,children:["Name",(0,r.jsx)("input",{className:`${i}-notice-input`,value:e.name,maxLength:100,onChange:u=>o({...e,name:u.target.value}),placeholder:"The Lantern Workshop"})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Form ",(0,r.jsx)("span",{className:`${i}-hint`,children:"What is it, in your world?"}),(0,r.jsx)("input",{className:`${i}-notice-input`,value:e.form??"",maxLength:200,onChange:u=>o({...e,form:u.target.value}),placeholder:"A converted truck, a sleeping pod, an old diner\u2026"})]}),(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Map pin \xB7 optional"}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Use a fraction from 0 to 1 across the map and down the map."}),(0,r.jsx)("div",{className:`${i}-row`,children:["x","y"].map(u=>(0,r.jsxs)("label",{className:`${i}-label`,children:[u==="x"?"Across":"Down",(0,r.jsx)("input",{className:`${i}-notice-input`,type:"number",min:0,max:1,step:.01,value:e.presentation[u]??"",disabled:t&&Du(e)>0,onChange:h=>o({...e,presentation:{...e.presentation,[u]:h.target.value===""?null:Number(h.target.value)}})})]},u))}),t&&Du(e)>0?(0,r.jsx)("p",{className:`${i}-hint`,children:"Move residents before changing this Venue's pin."}):null]}),(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Classes \xB7 choose up to two"}),(0,r.jsx)("div",{className:`${i}-row`,children:t1.map(u=>(0,r.jsxs)("label",{className:`${i}-label`,style:{textTransform:"capitalize"},children:[(0,r.jsx)("input",{type:"checkbox",checked:l.includes(u),disabled:t||!l.includes(u)&&l.length>=2,onChange:h=>{let g=h.target.checked?[...l,u]:l.filter($=>$!==u);g.length<1||g.length>2||o({...e,classes:g,spaces:g.map($=>nt(e,$))})}})," ",u]},u))}),t?(0,r.jsx)("p",{className:`${i}-hint`,children:"Class changes go through a Venue proposal."}):null]}),l.includes("residence")?(0,r.jsxs)("label",{className:`${i}-label`,children:["Resident capacity \xB7 includes you",(0,r.jsx)("input",{className:`${i}-notice-input`,type:"number",min:1,max:4,value:e.residenceCapacity??1,disabled:t,onChange:u=>o({...e,residenceCapacity:Number(u.target.value)})}),t?(0,r.jsx)("span",{className:`${i}-hint`,children:"Capacity changes go through a Venue proposal."}):null]}):null,l.includes("workplace")?(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Workers"}),a.map(u=>(0,r.jsxs)("label",{className:`${i}-label`,children:[(0,r.jsx)("input",{type:"checkbox",checked:(e.workerIds??[]).includes(u.characterId),onChange:h=>o({...e,workerIds:h.target.checked?[...e.workerIds??[],u.characterId]:(e.workerIds??[]).filter(g=>g!==u.characterId)})})," ",u.name]},u.characterId)),a.length===0?(0,r.jsx)("p",{className:`${i}-hint`,children:"No villagers are available yet."}):null]}):null,l.filter(u=>!n||n.includes(u)).map(u=>{let h=nt(e,u);return(0,r.jsxs)("section",{className:`${i}-field`,children:[(0,r.jsxs)("h3",{className:`${i}-panel-title`,style:{textTransform:"capitalize"},children:[u," space"]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Scene description",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:h.description,maxLength:1e3,onChange:g=>c(u,{description:g.target.value})})]}),(0,r.jsxs)("details",{className:`${i}-venue-scene-details`,children:[(0,r.jsx)("summary",{children:"Scene details"}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Current physical state used by visits and pictures."}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Condition now"," ",(0,r.jsx)("span",{className:`${i}-hint`,children:"For example, a leaking roof or a repaired door."}),(0,r.jsx)("input",{className:`${i}-notice-input`,value:h.state.condition,onChange:g=>c(u,{state:{...h.state,condition:g.target.value}})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Present items \xB7 one per line"," ",(0,r.jsx)("span",{className:`${i}-hint`,children:"Objects physically in this space."}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:h.state.items.join(`
`),onChange:g=>c(u,{state:{...h.state,items:g.target.value.split(`
`)}})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Established facts \xB7 one per line"," ",(0,r.jsx)("span",{className:`${i}-hint`,children:"Durable truths about this space."}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:h.state.publicFacts.join(`
`),onChange:g=>c(u,{state:{...h.state,publicFacts:g.target.value.split(`
`)}})})]}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Features \xB7 lasting details established through play"}),h.state.features.map((g,$)=>(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("input",{className:`${i}-notice-input`,value:g.text,"aria-label":`Feature ${$+1}`,onChange:x=>c(u,{state:{...h.state,features:h.state.features.map(f=>f.id===g.id?{...f,text:x.target.value}:f)}})}),(0,r.jsxs)("label",{className:`${i}-label`,children:[(0,r.jsx)("input",{type:"checkbox",checked:g.locked,onChange:x=>c(u,{state:{...h.state,features:h.state.features.map(f=>f.id===g.id?{...f,locked:x.target.checked}:f)}})})," ","Locked"]}),(0,r.jsx)("button",{type:"button",className:`${i}-remove`,"aria-label":`Remove feature ${$+1}`,onClick:()=>c(u,{state:{...h.state,features:h.state.features.filter(x=>x.id!==g.id)}}),children:"\xD7"})]},g.id)),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:h.state.features.length>=5,onClick:()=>c(u,{state:{...h.state,features:[...h.state.features,{id:ku(),text:"",sourceCharacterId:"",locked:!1,updatedAt:""}]}}),children:"Add Feature"})]})]}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Structural improvements use two proposal slots per Venue."})]},u)})]})}function Dp(e){return e.filter(t=>Mr(t))}function _n(e){return e.filter(t=>!Mr(t)||Hn(t).some(a=>a!=="residence"))}function US(e,t){let a=Dp(e);return a.length!==t.length?!1:t.every((n,o)=>{let l=a[o];return l.id===n.id&&l.name===n.name&&(l.form??"Home")===n.form&&l.occupancy.playerHome===n.isPlayerHome&&l.occupancy.residentCharacterId===n.characterId&&l.description===n.description&&Math.abs((l.presentation.x??-1)-(n.x??-1))<1e-4&&Math.abs((l.presentation.y??-1)-(n.y??-1))<1e-4})}function qS(e,t){let a=new Map(e.map(o=>[o.id,o]));return[...t.map(o=>{let l=a.get(o.id);return{id:o.id,name:o.name,form:o.form,classes:["residence"],spaces:[{...nt(l??{id:o.id,name:o.name,description:o.description,category:"",presentation:{image:null,x:o.x,y:o.y},occupancy:{playerHome:o.isPlayerHome,residentCharacterId:o.characterId,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}},"residence"),description:o.description}],residenceCapacity:l?.residenceCapacity??1,residentIds:o.characterId?[o.characterId]:[],improvements:l?.improvements??[null,null],description:o.description,category:l?.category??"",presentation:{image:l?.presentation.image??null,x:o.x,y:o.y},occupancy:{playerHome:o.isPlayerHome,residentCharacterId:o.characterId,homeKind:null},capabilities:l?.capabilities??[],state:l?.state??{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}}}),...e.filter(o=>!Mr(o))]}function os(){return Math.random().toString(36).slice(2,10)}function so(e){return Math.round(e*1e4)/1e4}var BS=new Intl.DateTimeFormat(void 0,{weekday:"short",day:"numeric",month:"short"}),a1=new Intl.DateTimeFormat(void 0,{hour:"2-digit",minute:"2-digit"}),LS=6e4,jS=700;function U0(e){return`${BS.format(e)} \xB7 ${a1.format(e)}`}function GS(){let[e,t]=(0,m.useState)(()=>U0(new Date));return(0,m.useEffect)(()=>{let a=setInterval(()=>t(U0(new Date)),1e3);return()=>clearInterval(a)},[]),e}function YS(){let[e,t]=GS().split(" \xB7 ");return(0,r.jsxs)("span",{className:`${i}-mobile-clock`,children:[(0,r.jsx)("span",{children:e}),(0,r.jsx)("strong",{children:t})]})}function XS({weather:e}){return(0,r.jsxs)("span",{className:`${i}-mobile-datetime`,children:[(0,r.jsx)(YS,{}),(0,r.jsx)("span",{role:"img","aria-label":`Weather: ${e||"unknown"}`,title:e||"Weather unavailable",children:QS(e)})]})}function QS(e){return/thunder/u.test(e)?"\u26C8\uFE0F":/snow/u.test(e)?"\u2744\uFE0F":/sleet/u.test(e)?"\u{1F328}\uFE0F":/rain|drizzle/u.test(e)?"\u{1F327}\uFE0F":/fog|haze/u.test(e)?"\u{1F32B}\uFE0F":/wind|breez/u.test(e)?"\u{1F32C}\uFE0F":/overcast/u.test(e)?"\u2601\uFE0F":/frost/u.test(e)?"\u{1F976}":/hot|heat/u.test(e)?"\u2600\uFE0F":"\u{1F324}\uFE0F"}function q0(e){return e?.closest(i)??null}function ZS(){let[e,t]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let o=()=>t(q0(document.fullscreenElement)!==null);return o(),document.addEventListener("fullscreenchange",o),()=>document.removeEventListener("fullscreenchange",o)},[]);let a=document.fullscreenEnabled,n=a?e?"Leave the whole screen":"Use the whole screen":"This browser will not give the tab the whole screen";return(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-icon-button`,disabled:!a,"aria-pressed":e,"aria-label":n,title:n,onClick:o=>{let l=q0(o.currentTarget);if(!l)return;if(document.fullscreenElement===l){document.exitFullscreen().catch(()=>{});return}let c=l.requestFullscreen?.();c&&c.catch(()=>{})},children:(0,r.jsx)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",focusable:"false",children:e?(0,r.jsx)("path",{d:"M9 4H5a1 1 0 0 0-1 1v4M15 4h4a1 1 0 0 1 1 1v4M9 20H5a1 1 0 0 1-1-1v-4M15 20h4a1 1 0 0 0 1-1v-4"}):(0,r.jsx)("path",{d:"M9 3H4a1 1 0 0 0-1 1v5M15 3h5a1 1 0 0 1 1 1v5M9 21H4a1 1 0 0 1-1-1v-5M15 21h5a1 1 0 0 0 1-1v-5"})})})}function KS({happenings:e,recap:t,mobile:a=!1}){let n=(0,m.useRef)(null),[o,l]=(0,m.useState)(!1);return(0,m.useEffect)(()=>{let c=n.current;if(!c)return;let u=()=>l(c.open);return c.addEventListener("toggle",u),()=>c.removeEventListener("toggle",u)},[]),(0,m.useEffect)(()=>{if(!o)return;let c=u=>{!(u.target instanceof Node)||n.current?.contains(u.target)||n.current?.removeAttribute("open")};return document.addEventListener("pointerdown",c),document.addEventListener("keydown",c),()=>{document.removeEventListener("pointerdown",c),document.removeEventListener("keydown",c)}},[o]),(0,r.jsxs)("details",{ref:n,className:`${i}-news`,children:[(0,r.jsxs)("summary",{className:`${i}-button ${i}-news-toggle`,"aria-label":"Events (NYI)",children:[(0,r.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",focusable:"false",children:[(0,r.jsx)("path",{d:"M4 5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"}),(0,r.jsx)("path",{d:"M8 8h7M8 12h7M8 16h4"})]}),a?null:"Events",(0,r.jsx)("span",{className:`${i}-news-nyi`,children:"NYI"})]}),(0,r.jsxs)("div",{className:`${i}-news-panel`,children:[(0,r.jsx)("h2",{className:`${i}-news-title`,children:"Events"}),t?(0,r.jsxs)("div",{children:[(0,r.jsx)("strong",{children:"While you were away"}),t.details.length>0?(0,r.jsx)("ul",{className:`${i}-news-list`,children:t.details.map(c=>(0,r.jsx)("li",{className:`${i}-news-item`,children:c.text},`recap-${c.id}`))}):null,t.summaries.map(c=>(0,r.jsx)("p",{className:`${i}-news-empty`,children:c},c)),t.pendingDecisionCount>0?(0,r.jsxs)("p",{className:`${i}-news-empty`,children:[t.pendingDecisionCount," pending"," ",t.pendingDecisionCount===1?"decision needs":"decisions need"," your attention."]}):null]}):null,e.length===0?(0,r.jsx)("p",{className:`${i}-news-empty`,children:"No events to show yet."}):(0,r.jsx)("ul",{className:`${i}-news-list`,children:e.map(c=>(0,r.jsx)("li",{className:`${i}-news-item`,children:c.text},c.id))})]})]})}function n1(e,t){return`${e==="You"?t?"Your":"your":`${e}'s`} house`}function JS(e){return e.length>0?n1(e,!0):"Empty house"}function B0(e,t){return t===null?{kind:"",name:"Venue residence",category:""}:e.find(a=>a.kind===t)??{kind:t,name:t,category:""}}function L0(e){return e.isPlayerHome?"player":e.occupant?"resident":"empty"}function FS(e,t){return t.length>0?n1(t,!0):e.name||"An empty house"}function rs(e){return e?e.presentation.x===null||e.presentation.y===null?null:{x:e.presentation.x,y:e.presentation.y}:null}var PS=.028;function ls(e){return new Promise((t,a)=>{let n=new FileReader;n.onload=()=>t(typeof n.result=="string"?n.result:""),n.onerror=()=>a(new Error("That picture could not be read.")),n.readAsDataURL(e)})}function Ep(e){return new Promise((t,a)=>{let n=new Image;n.onload=()=>t({width:n.naturalWidth,height:n.naturalHeight}),n.onerror=()=>a(new Error("That picture could not be read.")),n.src=e})}var j0=[{fit:"cover",label:"Fill the frame",help:"Keeps the picture's own shape and crops whatever hangs outside the frame. Drag the map to choose which part is kept."},{fit:"stretch",label:"Stretch to fill",help:"Squeezes the whole picture into the frame. Nothing is lost, but a picture that is not the map's shape is drawn stretched."},{fit:"contain",label:"Show all of it",help:"Keeps the whole picture and leaves the frame's own background showing around it."}];function Cp(e){return e.width/e.height<1.2?{tone:"warn",text:`This ${e.width}\xD7${e.height} map is nearly square or portrait. It will fit in full, but navigation may feel cramped on a wide desktop.`}:e.width<1024||e.height<700?{tone:"warn",text:`This ${e.width}\xD7${e.height} map will fit in full, but it may look soft when enlarged.`}:{tone:"ok",text:`This ${e.width}\xD7${e.height} map will be shown at its native shape, with the whole image visible.`}}function Ap(e,t,a){return e<t?t:e>a?a:e}function WS(e,t,a){if(a.fit==="stretch")return{left:0,top:0,width:t.width,height:t.height};if(a.fit==="contain"){let c=Math.min(t.width/e.width,t.height/e.height),u=e.width*c,h=e.height*c;return{left:(t.width-u)/2,top:(t.height-h)/2,width:u,height:h}}let n=Math.max(t.width/e.width,t.height/e.height)*a.zoom,o=e.width*n,l=e.height*n;return{left:(t.width-o)*(a.focusX/100),top:(t.height-l)*(a.focusY/100),width:o,height:l}}function e2(e){return e.fit==="stretch"?{objectFit:"fill"}:e.fit==="contain"?{objectFit:"contain"}:{objectFit:"cover",objectPosition:`${e.focusX}% ${e.focusY}%`,...e.zoom===1?null:{transform:`scale(${e.zoom})`,transformOrigin:`${e.focusX}% ${e.focusY}%`}}}function Ru(e){return{fit:e,focusX:50,focusY:50,zoom:1}}function zp({src:e,alt:t,pins:a,placing:n,view:o,shape:l,zoom:c,onPlace:u,onView:h,onDismiss:g,compact:$,fitToRoom:x,mobile:f,photoPins:b,children:C}){let k=u!==void 0,M=h!==void 0,w=(0,m.useRef)(null),y=(0,m.useRef)(null),[v,S]=(0,m.useState)(null),[O,P]=(0,m.useState)(null),[H,L]=(0,m.useState)(null),be=(0,m.useRef)(null),Y=(0,m.useRef)(new Map),De=(0,m.useRef)(null),[it,ht]=(0,m.useState)(null),[wi,Gt]=(0,m.useState)(null),mt=(0,m.useRef)(null),q=(0,m.useRef)(null),oe=(0,m.useRef)(!1),[Ge,ea]=(0,m.useState)(null),le=(0,m.useMemo)(()=>Ge?{...o,...Ge}:o,[Ge,o]),se=e?v?.src===e?v:null:l,ta={zoom:se&&O?Eu(se,O):1,centerX:.5,centerY:.5},Aa=H??ta,Z=(0,m.useMemo)(()=>f?se&&O?wp(se,O,Aa):null:e?v&&v.src===e&&O?WS(v,O,le):null:O?{left:0,top:0,width:O.width,height:O.height}:null,[v,O,le,f,se,Aa,e]);(0,m.useEffect)(()=>{L(null),be.current=null,Y.current.clear(),De.current=null},[e,O?.width,O?.height]);let pa=l?x&&it?{width:`${it.width}px`,height:`${it.height}px`,aspectRatio:`${l.width} / ${l.height}`}:{aspectRatio:`${l.width} / ${l.height}`}:void 0,ga=(0,m.useCallback)(()=>{let A=y.current;if(!A)return;let B=A.getBoundingClientRect();B.width===0||B.height===0||P(ue=>ue&&ue.width===B.width&&ue.height===B.height?ue:{width:B.width,height:B.height})},[]);(0,m.useEffect)(()=>{let A=y.current;if(!A||typeof ResizeObserver>"u")return;let B=new ResizeObserver(()=>ga());return B.observe(A),()=>B.disconnect()},[ga]);let Ot=(0,m.useCallback)(()=>{let A=w.current?.parentElement;if(!A||!l)return;let B=A.getBoundingClientRect(),ue=getComputedStyle(A),we=Ye=>Number.parseFloat(ue.getPropertyValue(Ye))||0,Ne=B.width-we("padding-left")-we("padding-right"),ee=B.height-we("padding-top")-we("padding-bottom"),ot=l.width/l.height,X=Math.min(Ne,ee*ot);X>0&&ht(Ye=>Ye&&Math.abs(Ye.width-X)<.5?Ye:{width:X,height:X/ot})},[l]);(0,m.useLayoutEffect)(()=>{if(!x||(Ot(),typeof ResizeObserver>"u"))return;let A=w.current?.parentElement;if(!A)return;let B=new ResizeObserver(()=>Ot());return B.observe(A),()=>B.disconnect()},[x,Ot]);let pe=(0,m.useCallback)(A=>{if(!k||!u||!Z)return;let B=A.currentTarget.getBoundingClientRect(),ue=(A.clientX-B.left-Z.left)/Z.width,we=(A.clientY-B.top-Z.top)/Z.height;if(!(ue>=0&&ue<=1)||!(we>=0&&we<=1))return;let ee=y.current?.querySelector(`.${i}-pin-photo`)?.getBoundingClientRect();u(so(ue),so(we),{width:Z.width,height:Z.height,photoWidth:ee?.width??58,photoHeight:ee?.height??58})},[u,k,Z]),Qe=(0,m.useCallback)(A=>{if(!M||!Z||!h||le.fit!=="cover")return;let B=A.currentTarget.getBoundingClientRect();mt.current={x:A.clientX,y:A.clientY,focusX:le.focusX,focusY:le.focusY,spanX:B.width-Z.width,spanY:B.height-Z.height},ea({focusX:le.focusX,focusY:le.focusY}),A.currentTarget.setPointerCapture(A.pointerId),A.preventDefault()},[M,le.focusX,le.focusY,le.fit,h,Z]),ie=(0,m.useCallback)(A=>{let B=mt.current;if(!B)return;let ue=B.spanX===0?B.focusX:B.focusX+(A.clientX-B.x)/B.spanX*100,we=B.spanY===0?B.focusY:B.focusY+(A.clientY-B.y)/B.spanY*100;ea({focusX:so(Ap(ue,0,100)),focusY:so(Ap(we,0,100))})},[]),pt=(0,m.useCallback)(A=>{if(!mt.current)return;mt.current=null,A.currentTarget.hasPointerCapture(A.pointerId)&&A.currentTarget.releasePointerCapture(A.pointerId);let B=Ge;ea(null),B&&h&&h({...o,...B})},[Ge,h,o]),za=(0,m.useCallback)(A=>{!h||!c||h({...o,zoom:so(Ap(A,c.min,c.max))})},[h,o,c]),Yt=()=>{let A=[...Y.current.values()];if(A.length===0){De.current=null;return}let B=A[0],ue=A[1];De.current={view:be.current??Aa,x:ue?(B.x+ue.x)/2:B.x,y:ue?(B.y+ue.y)/2:B.y,distance:ue?Math.hypot(B.x-ue.x,B.y-ue.y):1}},Ra=A=>{if(!f||A.pointerType!=="touch"||(A.isPrimary&&(Y.current.clear(),oe.current=!1),!y.current)||A.target instanceof Element&&A.target.closest(`.${i}-doors, .${i}-zoom`))return;w.current?.setAttribute("data-mobile-gesturing","true");let B=y.current.getBoundingClientRect();Y.current.set(A.pointerId,{x:A.clientX-B.left,y:A.clientY-B.top}),Y.current.size>1&&(oe.current=!0),Yt()},yt=A=>{if(!f||!Y.current.has(A.pointerId)||!se||!O||!y.current)return;let B=y.current.getBoundingClientRect();Y.current.set(A.pointerId,{x:A.clientX-B.left,y:A.clientY-B.top});let ue=[...Y.current.values()],we=ue[0],Ne=ue[1],ee=Ne?(we.x+Ne.x)/2:we.x,ot=Ne?(we.y+Ne.y)/2:we.y,X=Ne?Math.hypot(we.x-Ne.x,we.y-Ne.y):1,Ye=De.current;if(!Ye||!$0(Ye,{x:ee,y:ot,distance:X})&&!oe.current)return;oe.current||g?.(),oe.current=!0;let Xa=x0(se,O,Ye.view,{x:Ye.x,y:Ye.y},{x:ee,y:ot},Ne&&Ye.distance>0?X/Ye.distance:1);be.current=Xa,L(Xa)},pn=(A,B=!1)=>{if(!f||!Y.current.has(A.pointerId))return;let ue=!B&&Y.current.size===1&&!oe.current;if(Y.current.delete(A.pointerId),Y.current.size===0&&w.current?.removeAttribute("data-mobile-gesturing"),Yt(),!ue||!(A.target instanceof Element))return;let we=A.target.closest(`.${i}-pin`)?.dataset.pinId,Ne=we?a.find(ee=>ee.id===we):null;if(Ne?.onSelect){oe.current=!0,Ne.onSelect();return}if(!(!A.target.closest(`.${i}-canvas`)||A.target.closest("button")))if(k&&n&&u&&Z){let ee=y.current.getBoundingClientRect(),ot=(A.clientX-ee.left-Z.left)/Z.width,X=(A.clientY-ee.top-Z.top)/Z.height;if(ot>=0&&ot<=1&&X>=0&&X<=1){oe.current=!0;let Ct=y.current?.querySelector(`.${i}-pin-photo`)?.getBoundingClientRect();u(so(ot),so(X),{width:Z.width,height:Z.height,photoWidth:Ct?.width??72,photoHeight:Ct?.height??72})}}else g&&(oe.current=!0,g())};return(0,r.jsxs)("div",{ref:w,className:`${i}-stage${$?` ${i}-stage-compact`:""}`,style:pa,"data-shaped":l?"true":"false","data-framing":M&&le.fit==="cover"?"true":"false","data-mobile":f?"true":"false","data-photo-pins":b?"true":"false","data-empty":e?"false":"true",onPointerDownCapture:A=>{if(f){Ra(A);return}oe.current=!1,q.current=A.pointerType==="touch"?{x:A.clientX,y:A.clientY}:null},onPointerMoveCapture:A=>{if(f){yt(A);return}let B=q.current;B&&(Math.abs(A.clientX-B.x)>8||Math.abs(A.clientY-B.y)>8)&&(oe.current=!0)},onPointerUpCapture:f?pn:void 0,onPointerCancelCapture:A=>{f&&pn(A,!0),q.current&&(oe.current=!0)},onClickCapture:A=>{oe.current&&(oe.current=!1,A.preventDefault(),A.stopPropagation())},children:[C,(0,r.jsxs)("div",{ref:y,className:`${i}-canvas`,"data-placing":k&&n?"true":"false","data-dragging":Ge?"true":"false",onClick:k&&n?pe:g?()=>g():void 0,onPointerDown:M?Qe:void 0,onPointerMove:M?ie:void 0,onPointerUp:M?pt:void 0,onPointerCancel:M?pt:void 0,children:[e?(0,r.jsx)("img",{className:`${i}-canvas-img`,style:f&&Z?{position:"absolute",left:Z.left,top:Z.top,width:Z.width,height:Z.height,objectFit:"fill"}:e2(le),src:e,alt:t,draggable:!1,onLoad:A=>{let{naturalWidth:B,naturalHeight:ue}=A.currentTarget;B<=0||ue<=0||(S({src:e,width:B,height:ue}),ga())},onError:()=>Gt(e)}):(0,r.jsxs)(r.Fragment,{children:[f&&Z?(0,r.jsx)("span",{className:`${i}-mobile-logical`,style:{left:Z.left,top:Z.top,width:Z.width,height:Z.height},"aria-hidden":"true"}):null,(0,r.jsx)("span",{className:`${i}-canvas-empty`,children:"Logical village map"})]}),e&&wi===e?(0,r.jsx)("span",{className:`${i}-canvas-missing`,children:"The map picture could not be loaded \u2014 pick another one from the Town map panel."}):null,Z?a.map(A=>(0,r.jsxs)("span",{className:`${i}-pin-holder`,"data-selected":A.selected?"true":"false",style:{left:`${Z.left+A.x*Z.width}px`,top:`${Z.top+(A.y+(f&&A.kind!=="person"?0:A.dy??0))*Z.height}px`},children:[(0,r.jsx)("button",{type:"button",className:`${i}-pin`,"data-pin-id":A.id,"data-tone":A.tone,"data-kind":A.kind??"place","data-selected":A.selected?"true":"false","aria-expanded":A.doors?!0:void 0,disabled:A.onSelect===void 0,title:A.text,onClick:B=>{B.stopPropagation(),A.onSelect?.()},children:(f||b)&&A.kind!=="person"?(0,r.jsxs)("span",{className:`${i}-pin-photo-card`,style:{transform:`scale(${S0(f?N0(Aa.zoom,ta.zoom):yS,A.selected===!0)})`},children:[(0,r.jsxs)("span",{className:`${i}-pin-photo`,"aria-hidden":"true",children:[A.image?(0,r.jsx)("img",{src:A.image,alt:"",loading:"lazy",draggable:!1}):(0,r.jsx)("span",{className:`${i}-pin-photo-empty`,role:"img","aria-label":"House",children:"\u{1F3E0}"}),(0,r.jsx)("span",{className:`${i}-pin-photo-tack`})]}),(0,r.jsx)("span",{className:`${i}-pin-name`,children:A.text})]}):(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("span",{"aria-hidden":"true",className:`${i}-pin-tack`,children:(0,r.jsxs)("svg",{viewBox:"0 0 24 24",focusable:"false",children:[(0,r.jsx)("path",{d:"M7 2h10a1.2 1.2 0 0 1 1.2 1.2v2.4a1.2 1.2 0 0 1-1.2 1.2H7A1.2 1.2 0 0 1 5.8 5.6V3.2A1.2 1.2 0 0 1 7 2Z"}),(0,r.jsx)("path",{d:"M9.4 7.4h5.2l-.7 3.2H10.1z"}),(0,r.jsx)("path",{d:"M11.3 10.9h1.4v10.3l-.7 1.2-.7-1.2z"})]})}),(0,r.jsx)("span",{className:`${i}-pin-name`,children:A.text})]})}),A.onRemove?(0,r.jsx)("button",{type:"button",className:`${i}-pin-remove`,"aria-label":`Take ${A.text} off the map`,onClick:B=>{B.stopPropagation(),A.onRemove?.()},children:"\xD7"}):null,A.onResume?(0,r.jsx)("button",{type:"button",className:`${i}-pin-resume`,onClick:B=>{B.stopPropagation(),A.onResume?.()},children:"DEBUG: Resume Chat"}):null]},A.id)):null]}),Z?a.filter(A=>A.doors!==void 0&&A.doors.length>0).map(A=>(0,r.jsx)("div",{className:`${i}-doors`,style:{left:`${O?$p(Z,O,A).left:Z.left+A.x*Z.width}px`,top:`${O?$p(Z,O,A).top:Z.top+(A.y+(A.dy??0))*Z.height}px`},children:A.doors?.map(B=>(0,r.jsx)("button",{type:"button",className:`${i}-door`,onClick:ue=>{ue.stopPropagation(),B.onSelect()},children:B.label},B.label))},`doors:${A.id}`)):null,M&&c&&le.fit==="cover"?(0,r.jsxs)("div",{className:`${i}-zoom`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-zoom-button`,title:"Show less of the picture, larger","aria-label":"Zoom in",disabled:le.zoom>=c.max,onClick:()=>za(le.zoom+c.step),children:"+"}),(0,r.jsx)("button",{type:"button",className:`${i}-zoom-button`,title:"Show more of the picture, smaller","aria-label":"Zoom out",disabled:le.zoom<=c.min,onClick:()=>za(le.zoom-c.step),children:"\u2212"}),(0,r.jsx)("button",{type:"button",className:`${i}-zoom-button`,title:"Put the middle of the picture back in the middle of the frame",disabled:le.focusX===50&&le.focusY===50&&le.zoom===c.min,onClick:()=>{h&&h({...o,focusX:50,focusY:50,zoom:c.min})},children:"Centre"})]}):null]})}function co(e){let t=e?.settings.playerPersonaName;return typeof t=="string"&&t.trim()||"You"}function t2({scenario:e}){let t=$S(e),[a,n]=(0,m.useState)(null);return(0,r.jsxs)("div",{className:`${i}-scenario-art-panel`,children:[a===t?(0,r.jsx)("span",{className:`${i}-scenario-art-placeholder`,role:"img","aria-label":"Village scene unavailable",children:"\u2302"}):(0,r.jsx)("img",{src:t,alt:`${uo(e).label} village scene`,onError:()=>n(t)}),(0,r.jsxs)("div",{className:`${i}-scenario-art-content`,children:[(0,r.jsx)("p",{children:"A new beginning awaits."}),(0,r.jsx)("strong",{children:uo(e).description})]})]})}function a2({label:e,choices:t,selectedId:a,onSelect:n,disabled:o,emptyMessage:l}){return t.length?(0,r.jsx)("div",{className:`${i}-identity-strip`,role:"group","aria-label":e,children:t.map(c=>(0,r.jsxs)("button",{type:"button",className:`${i}-identity-card`,"aria-pressed":a===c.id,disabled:o,onClick:()=>n(c.id),children:[(0,r.jsx)(ho,{portrait:c.portrait,name:c.name,className:`${i}-identity-card-face`,glyph:"person"}),(0,r.jsx)("strong",{children:c.name}),c.hint?(0,r.jsx)("small",{children:c.hint}):null]},c.id))}):(0,r.jsx)("p",{className:`${i}-hint`,children:l})}function n2({value:e}){return(0,r.jsxs)("section",{className:`${i}-identity-preview`,"aria-label":`${e.name} overview`,children:[(0,r.jsx)(ho,{portrait:e.portrait,name:e.name,className:`${i}-identity-preview-face`,glyph:"person"}),(0,r.jsxs)("div",{className:`${i}-identity-preview-copy`,children:[(0,r.jsx)("h3",{children:e.name}),e.overview?(0,r.jsx)("p",{className:`${i}-identity-overview`,children:e.overview}):null,e.details.length?(0,r.jsx)("dl",{className:`${i}-identity-details`,children:e.details.map(({label:t,text:a})=>(0,r.jsxs)("div",{children:[(0,r.jsx)("dt",{children:t}),(0,r.jsx)("dd",{children:a})]},t))}):null,(0,r.jsx)("p",{className:`${i}-identity-context`,children:e.context})]})]})}function G0(e,t){let a=e.replace(/\s+/g," ").trim();if(a.length<=t)return a;let n=a.lastIndexOf(" ",t),o=a.indexOf(" ",t);return`${a.slice(0,n>0?n:o>0?o:a.length).trimEnd()}\u2026`}function Y0(e){return e.avatarPath?{url:e.avatarPath,crop:Ip(e.avatarCrop)}:void 0}function i2({personas:e,draft:t,onDraft:a,disabled:n}){let[o,l]=(0,m.useState)(""),[c,u]=(0,m.useState)(null),[h,g]=(0,m.useState)(""),$=e?.find(k=>k.id===t),x=$?.id,f=o.trim().toLocaleLowerCase(),b=(e??[]).filter(k=>!f||`${k.name} ${k.summary}`.toLocaleLowerCase().includes(f)).sort((k,M)=>k.name.localeCompare(M.name,void 0,{sensitivity:"base"})).map(k=>({id:k.id,name:k.name,portrait:Y0(k),hint:k.summary}));(0,m.useEffect)(()=>{if(u(null),g(""),!t||!x)return;let k=new AbortController;return D(`/personas/${encodeURIComponent(t)}`,{signal:k.signal}).then(M=>{k.signal.aborted||u(M.persona)}).catch(M=>{k.signal.aborted||g(U(M,"This Persona could not be read."))}),()=>k.abort()},[t,x]);let C=c&&c.id===t?{id:c.id,name:c.name,portrait:Y0(c),overview:G0(c.description||c.appearance||c.personality||c.backstory,180),details:[["Appearance",c.appearance],["Personality",c.personality],["Backstory",c.backstory]].filter(([,k])=>k.trim()).map(([k,M])=>({label:k,text:G0(M,120)})),context:"Villages uses this Persona's name and authored details as your identity in future interactions."}:null;return(0,r.jsxs)("div",{className:`${i}-founding-persona`,children:[(0,r.jsxs)("div",{className:`${i}-identity-picker-head`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setup-persona-search`,children:"Who are you?"}),(0,r.jsx)("input",{id:`${i}-setup-persona-search`,className:`${i}-search`,type:"search",value:o,placeholder:"Search Personas",onChange:k=>l(k.target.value),disabled:n||e===null})]}),(0,r.jsx)(a2,{label:"Choose a Persona",choices:b,selectedId:t,onSelect:a,disabled:n,emptyMessage:e===null?"Reading Personas\u2026":e.length===0?"Create a Persona in your library before founding a village.":"No Personas match your search."}),t&&e&&!$?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:"The saved Persona is no longer in your library. Choose another Persona to continue."}):C?(0,r.jsx)(n2,{value:C}):h?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:h}):$?(0,r.jsxs)("p",{className:`${i}-hint`,children:["Reading ",$.name,"\u2026"]}):(0,r.jsx)("p",{className:`${i}-hint`,children:"Choose a Persona to see how Villages will know you."})]})}function o2({idPrefix:e,personas:t,draft:a,onDraft:n,storedId:o,storedName:l,storedMissing:c,disabled:u}){let h=(t??[]).find(f=>f.id===a)??null,g=h?.name??(a===o?l:""),$=c&&a===o,x=a.length>0;return(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-${e}-persona`,children:"Who are you?"}),(0,r.jsxs)("select",{id:`${i}-${e}-persona`,className:`${i}-select`,value:a,disabled:u||t===null||t.length===0,onChange:f=>n(f.target.value),children:[(0,r.jsx)("option",{value:"",disabled:!0,children:t===null?"Reading Personas\u2026":"Choose a Persona"}),(t??[]).map(f=>(0,r.jsx)("option",{value:f.id,children:f.isActive?`${f.name} \u2014 your Persona`:f.name},f.id))]}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:t===null?"Reading your Personas\u2026":t.length===0?"Create a Persona in your library before founding a village.":t.some(f=>f.isActive)?"Your active Persona is offered first. The village reads it live, so editing the Persona changes what the villagers believe about you.":"The village reads the Persona you pick here, live, so editing it changes what the villagers believe about you."})]}),x?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("p",{className:`${i}-empty`,children:$?"The Persona you chose is no longer in your library, so the villagers are going by the copy they kept of it. Pick another one to change who you are.":g.length>0?`The villagers know you as ${g}.`:"The villagers know you as this Persona."}),h&&h.summary.length>0?(0,r.jsx)("p",{className:`${i}-macro-help`,children:h.summary}):null]}):null]})}function X0({books:e,error:t,selected:a,onChange:n,disabled:o}){let[l,c]=(0,m.useState)(""),u=new Map((e??[]).map(b=>[b.id,b])),h=(e??[]).filter(b=>!b.hiddenFromLibrary||a.includes(b.id)),g=a.filter(b=>!u.has(b)),x=[...h,...g.map(b=>({id:b,name:b,enabled:!1}))].filter(b=>b.name.toLocaleLowerCase().includes(l.trim().toLocaleLowerCase())),f=x.slice(0,50);return(0,r.jsxs)("fieldset",{className:`${i}-field ${i}-lore-picker`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Lorebooks for this village"}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Selected books supply live world facts for places, stories, conversations, wishes, agendas, and generated scenery. Villages never edits them."}),(0,r.jsx)("div",{className:`${i}-lore-selected`,"aria-live":"polite",children:a.length?a.map(b=>(0,r.jsxs)("span",{className:`${i}-lore-chip`,children:[(0,r.jsxs)("span",{children:[u.get(b)?.name??b,e===null?" (checking)":u.has(b)?u.get(b)?.enabled?"":" (disabled)":" (missing)"]}),(0,r.jsx)("button",{type:"button","aria-label":`Remove ${u.get(b)?.name??b}`,disabled:o,onClick:()=>n(a.filter(C=>C!==b)),children:"\xD7"})]},b)):(0,r.jsx)("span",{className:`${i}-hint`,children:"No lorebooks selected."})}),t?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:t}):null,e===null&&!t?(0,r.jsx)("p",{className:`${i}-hint`,children:"Loading lorebooks\u2026"}):null,e===null&&t&&a.length>0?(0,r.jsx)("p",{className:`${i}-hint`,children:"Selected books could not be checked. Lore generation will skip unavailable books."}):null,e?.length===0?(0,r.jsx)("p",{className:`${i}-hint`,children:"No lorebooks in the Engine library."}):null,(0,r.jsxs)("details",{className:`${i}-lore-options`,children:[(0,r.jsxs)("summary",{className:`${i}-button`,children:["Choose lorebooks (",a.length,"/24)"]}),(0,r.jsx)("input",{type:"search",className:`${i}-search`,value:l,"aria-label":"Search lorebooks",placeholder:"Search your lorebooks",onChange:b=>c(b.target.value)}),(0,r.jsxs)("div",{className:`${i}-lore-results`,children:[f.map(b=>{let C=a.includes(b.id),k=g.includes(b.id)?e===null?t?"Unavailable \u2014 skipped":"Checking status":"Missing \u2014 skipped":b.enabled?"":"Disabled \u2014 skipped";return(0,r.jsxs)("label",{className:`${i}-reason-option`,children:[(0,r.jsx)("input",{type:"checkbox",checked:C,disabled:o||!b.enabled&&!C||!C&&a.length>=24,onChange:()=>n(C?a.filter(M=>M!==b.id):[...a,b.id])}),b.name,k?` (${k})`:""]},b.id)}),e!==null&&x.length===0?(0,r.jsx)("p",{className:`${i}-hint`,children:"No matching lorebooks."}):null,x.length>f.length?(0,r.jsx)("p",{className:`${i}-hint`,children:"Showing the first 50 matches. Search to narrow the list."}):null]})]})]})}function r2({homes:e,villagers:t,disabled:a,selectedId:n,onPatch:o,onRemove:l,onSelect:c,lockedIds:u,showDescriptions:h,onGenerateDescription:g}){let $=new Set(e.map(x=>x.characterId));return(0,r.jsx)("div",{className:`${i}-home-list`,children:e.map((x,f)=>{let b=u?.has(x.id)??!1,C=t.find(k=>k.id===x.characterId)?.name??"";return(0,r.jsxs)("div",{className:`${i}-home-row`,"data-selected":x.id===n?"true":"false",onMouseEnter:()=>c(x.id),children:[(0,r.jsx)("span",{className:`${i}-home-index`,"aria-hidden":"true",children:f+1}),x.isPlayerHome?(0,r.jsx)("span",{className:`${i}-who`,children:"You live here"}):(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("span",{className:`${i}-who`,children:C?`${C} lives here`:"No villager lives here"}),t.length>0?(0,r.jsxs)("select",{className:`${i}-select`,value:x.characterId??"",disabled:a||b,"aria-label":`Who lives in home ${f+1}`,onChange:k=>o(x.id,{characterId:k.target.value||null}),children:[(0,r.jsx)("option",{value:"",children:"Nobody yet"}),t.map(k=>{let M=k.id!==x.characterId&&$.has(k.id);return(0,r.jsx)("option",{value:k.id,disabled:M,children:M?`${k.name} \u2014 already housed`:k.name},k.id)})]}):null]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Venue name",(0,r.jsx)("input",{className:`${i}-notice-input`,value:x.name,maxLength:60,disabled:a||b,onChange:k=>o(x.id,{name:k.target.value})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Form \xB7 what is it?",(0,r.jsx)("input",{className:`${i}-notice-input`,value:x.form,maxLength:240,disabled:a||b,onChange:k=>o(x.id,{form:k.target.value}),placeholder:"Cabin, truck, sleeping pod\u2026"})]}),h?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("textarea",{className:`${i}-textarea`,value:x.description,maxLength:1e3,disabled:a||b,"aria-label":`Description of home ${f+1}`,onChange:k=>o(x.id,{description:k.target.value})}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:a||b,onClick:()=>g?.(x),children:"Generate description draft"})]}):null,(0,r.jsx)("button",{type:"button",className:`${i}-remove`,disabled:a||b,"aria-label":`Take home ${f+1} off the map`,onClick:()=>l(x.id),children:"\xD7"}),b?(0,r.jsx)("span",{className:`${i}-hint`,children:"Move approved and completed before changing this home."}):null]},x.id)})})}function Q0({id:e,label:t,hint:a,options:n,value:o,disabled:l,onChange:c}){let u=o.length>0&&!n.some(h=>h.id===o);return(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:e,children:t}),(0,r.jsxs)("select",{id:e,className:`${i}-select`,value:o,disabled:l,onChange:h=>c(h.target.value),children:[(0,r.jsx)("option",{value:"",children:"Engine default"}),u?(0,r.jsx)("option",{value:o,children:"Missing \u2014 this connection is gone"}):null,n.map(h=>(0,r.jsx)("option",{value:h.id,children:h.name},h.id))]}),(0,r.jsx)("span",{className:`${i}-hint`,children:a})]})}function Rp({onSetupProblem:e,onImageWarningChange:t,compact:a=!1}){let[n,o]=(0,m.useState)(null),[l,c]=(0,m.useState)([]),[u,h]=(0,m.useState)(""),[g,$]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let M=!1;return(async()=>{try{let[w,y]=await Promise.all([D("/connections"),Hp("/api/connections")]);if(M)return;o(w),c(_S(Array.isArray(y)?y:[]))}catch(w){M||h(U(w,"This agent's connections could not be read."))}})(),()=>{M=!0}},[]);let x=(0,m.useCallback)(async M=>{$(!0),h("");try{o(await D("/connections",{method:"PUT",body:JSON.stringify(M)}))}catch(w){h(U(w,"That connection could not be saved."))}finally{$(!1)}},[]),f=l.filter(M=>M.category==="language"),b=l.filter(M=>M.category==="image_generation"),C=b.some(M=>M.defaultForAgents),k=n!==null&&(n.imageConnectionId===Tp||b.length===0||n.imageConnectionId.length===0&&!C);return(0,m.useEffect)(()=>{if(!e)return;let M=n?.systemConnectionId??"",w=n?.narrationConnectionId??"";n?M.length===0||w.length===0?e("Choose both System and Narration connections before continuing."):!f.some(y=>y.id===M)||!f.some(y=>y.id===w)?e("Choose available language connections for System and Narration."):e(""):e("Connections are still loading.")},[e,n,f]),(0,m.useEffect)(()=>{t?.(k)},[k,t]),(0,r.jsxs)("div",{className:`${i}-field ${a?`${i}-connections-compact`:""}`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Connections"}),a?(0,r.jsx)("p",{className:`${i}-hint`,children:"Choose models for village planning, conversations, and artwork."}):(0,r.jsx)("p",{className:`${i}-empty`,children:"The village spends model calls on three kinds of work, and they are not worth the same money. The heavy lifting is one long call about the whole village. The conversations are short and frequent. Pictures are drawn only when you ask for one. Leave any of these alone and the agent's own choice is used."}),n?(0,r.jsxs)("div",{className:a?`${i}-connections-grid`:"",children:[(0,r.jsx)(Q0,{id:`${i}-connection-system`,label:"System",hint:a?"Founding, daily planning, and recaps.":"Founding the village, the write-up each time the day turns over, and the village's reading of what happened while you were away.",options:f,value:n.systemConnectionId,disabled:g,onChange:M=>{x({systemConnectionId:M})}}),(0,r.jsx)(Q0,{id:`${i}-connection-narration`,label:"Narration",hint:a?"Villagers' speech and conversation recaps.":"Everything the villagers say to you, and how the conversation reads back afterwards.",options:f,value:n.narrationConnectionId,disabled:g,onChange:M=>{x({narrationConnectionId:M})}}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-connection-image`,children:"Images"}),(0,r.jsxs)("select",{id:`${i}-connection-image`,className:`${i}-select`,value:n.imageConnectionId,disabled:g,onChange:M=>{x({imageConnectionId:M.target.value})},children:[(0,r.jsx)("option",{value:Tp,children:"Disabled"}),(0,r.jsx)("option",{value:"",children:"Use Engine default"}),n.imageConnectionId.length>0&&n.imageConnectionId!==Tp&&!b.some(M=>M.id===n.imageConnectionId)?(0,r.jsx)("option",{value:n.imageConnectionId,children:"Missing \u2014 this connection is gone"}):null,b.map(M=>(0,r.jsx)("option",{value:M.id,children:M.name},M.id))]}),(0,r.jsx)("span",{className:`${i}-hint`,children:a?"Maps, sprites, and places. Recommended.":(0,r.jsxs)(r.Fragment,{children:["This is the connection that Villages uses to generate images such as character sprites, the Village map, Venue backgrounds, etc."," ",(0,r.jsxs)("span",{className:`${i}-image-recommendation`,children:["The intended experience includes an image generation connection to bring the world and characters to life, and is ",(0,r.jsx)("em",{children:"highly"})," recommended."]})]})})]})]}):u.length===0?(0,r.jsx)("span",{className:`${i}-hint`,children:"Reading this agent's connections\u2026"}):null,u?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:u}):null]})}function i1(){let[e,t]=(0,m.useState)(null),[a,n]=(0,m.useState)(""),[o,l]=(0,m.useState)(!1),[c,u]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let g=!1;return D("/narration").then($=>{g||t($)}).catch($=>{g||n(U($,"Village writing settings could not be read."))}),()=>{g=!0}},[]);let h=(0,m.useCallback)(async g=>{l(!0),u(!1),n("");try{let $=await D("/narration",{method:"PUT",body:JSON.stringify(g)});return t($),u(!0),$}catch($){return n(U($,"That writing change could not be saved.")),null}finally{l(!1)}},[]);return{view:e,error:a,busy:o,saved:c,save:h}}function l2(){let{view:e,error:t,busy:a,saved:n,save:o}=i1(),[l,c]=(0,m.useState)(null),u=l??e?.styleInstructions??"";return(0,r.jsxs)("div",{className:i+"-field",children:[(0,r.jsx)("span",{className:i+"-label",children:"Narration style"}),(0,r.jsx)("p",{className:i+"-empty",children:"Shape scene descriptions and the descriptive beats around replies. Each resident's card still governs their spoken voice. Saved changes apply to the next generated venue turn."}),e?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("textarea",{className:i+"-textarea","aria-label":"Narration style",value:u,rows:3,maxLength:e.styleMaxLength,disabled:a,onChange:h=>c(h.target.value)}),(0,r.jsx)("button",{type:"button",className:i+"-button",disabled:a||u===e.styleInstructions,onClick:()=>{o({styleInstructions:u}).then(h=>{h&&c(h.styleInstructions)})},children:"Apply style"}),(0,r.jsx)("button",{type:"button",className:i+"-button",disabled:a||u===e.defaultStyleInstructions,onClick:()=>{o({styleInstructions:""}).then(h=>{h&&c(h.styleInstructions)})},children:"Restore default style"}),(0,r.jsxs)("div",{className:i+"-row",children:[(0,r.jsxs)("label",{className:i+"-field",children:[(0,r.jsx)("span",{className:i+"-label",children:"Tense"}),(0,r.jsxs)("select",{value:e.tense,disabled:a,onChange:h=>{o({tense:h.target.value})},children:[(0,r.jsx)("option",{value:"present",children:"Present"}),(0,r.jsx)("option",{value:"past",children:"Past"})]})]}),(0,r.jsxs)("label",{className:i+"-field",children:[(0,r.jsx)("span",{className:i+"-label",children:"Person"}),(0,r.jsxs)("select",{value:e.person,disabled:a,onChange:h=>{o({person:h.target.value})},children:[(0,r.jsx)("option",{value:"first",children:"First person (I)"}),(0,r.jsx)("option",{value:"second",children:"Second person (you)"}),(0,r.jsx)("option",{value:"third",children:"Third person (player name)"})]})]}),(0,r.jsxs)("label",{className:i+"-field",children:[(0,r.jsx)("span",{className:i+"-label",children:"Content rating"}),(0,r.jsxs)("select",{value:e.rating,disabled:a,onChange:h=>{o({rating:h.target.value})},children:[(0,r.jsx)("option",{value:"sfw",children:"SFW"}),(0,r.jsx)("option",{value:"nsfw",children:"NSFW"})]})]})]}),(0,r.jsx)("span",{className:i+"-hint",children:"Rating applies to venue narration and dialogue only. NSFW allows adult content when the scene calls for it."})]}):t?null:(0,r.jsx)("span",{className:i+"-hint",children:"Reading narration style\u2026"}),a?(0,r.jsx)("span",{className:i+"-hint",children:"Saving\u2026"}):null,n&&!a?(0,r.jsx)("span",{className:i+"-hint",role:"status",children:"Saved for the next venue turn."}):null,t?(0,r.jsx)("p",{className:i+"-error",role:"alert",children:t}):null]})}function s2(){let{view:e,error:t,busy:a,saved:n,save:o}=i1(),[l,c]=(0,m.useState)(null),u=l??e?.replyGuidance??"";return(0,r.jsxs)("section",{className:i+"-panel",children:[(0,r.jsx)("h2",{className:i+"-panel-title",children:"DEBUG: Villager reply guidance"}),(0,r.jsx)("p",{className:i+"-empty",children:"This prompt guides each resident's voice, knowledge, and motivation. Saved edits apply to the next generated venue turn."}),e?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("textarea",{className:i+"-textarea","aria-label":"Villager reply guidance",value:u,rows:12,maxLength:e.replyGuidanceMaxLength,disabled:a,onChange:h=>c(h.target.value)}),(0,r.jsxs)("div",{className:i+"-row",children:[(0,r.jsx)("button",{type:"button",className:i+"-button",disabled:a||u===e.replyGuidance,onClick:()=>{o({replyGuidance:u}).then(h=>{h&&c(h.replyGuidance)})},children:"Apply guidance"}),(0,r.jsx)("button",{type:"button",className:i+"-button",disabled:a||u===e.defaultReplyGuidance,onClick:()=>{o({replyGuidance:null}).then(h=>{h&&c(h.replyGuidance)})},children:"Restore built-in guidance"})]}),(0,r.jsxs)("details",{children:[(0,r.jsx)("summary",{children:"Show built-in guidance"}),(0,r.jsx)("pre",{className:i+"-hint",style:{whiteSpace:"pre-wrap"},children:e.defaultReplyGuidance})]})]}):t?null:(0,r.jsx)("span",{className:i+"-hint",children:"Reading villager reply guidance\u2026"}),a?(0,r.jsx)("span",{className:i+"-hint",children:"Saving\u2026"}):null,n&&!a?(0,r.jsx)("span",{className:i+"-hint",role:"status",children:"Saved for the next venue turn."}):null,t?(0,r.jsx)("p",{className:i+"-error",role:"alert",children:t}):null]})}function ho({portrait:e,name:t,className:a,glyph:n="initial"}){return(0,r.jsx)("span",{"aria-hidden":"true",className:a,children:e?(0,r.jsx)("img",{src:e.url,alt:"",style:OS(e.crop)}):n==="person"?(0,r.jsxs)("svg",{className:`${i}-person`,viewBox:"0 0 24 24","aria-hidden":"true",focusable:"false",children:[(0,r.jsx)("path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"}),(0,r.jsx)("circle",{cx:"12",cy:"7",r:"4",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})]}):t.slice(0,1).toUpperCase()})}function c2({villager:e,portrait:t,selected:a,onSelect:n}){return(0,r.jsxs)("div",{className:`${i}-tile`,"data-selected":a?"true":"false",children:[(0,r.jsxs)("div",{className:`${i}-tile-head`,children:[(0,r.jsx)(ho,{portrait:t,name:e.name,className:`${i}-avatar`}),(0,r.jsx)("button",{type:"button",className:`${i}-tile-name`,onClick:n,disabled:n===void 0,title:n?`See where ${e.name} is`:`${e.name} has no known venue`,children:e.name})]}),e.summary?(0,r.jsx)("p",{className:`${i}-tile-summary`,children:e.summary}):null,(0,r.jsxs)("div",{className:`${i}-tile-meta`,children:[e.missing?(0,r.jsx)("span",{className:`${i}-badge`,children:"card missing"}):null,e.tags.slice(0,3).map(o=>(0,r.jsx)("span",{className:`${i}-tag`,children:o},o))]})]})}function Z0(e,t){let a=URL.createObjectURL(t),n=document.createElement("a");n.href=a,n.download=e,n.click(),setTimeout(()=>URL.revokeObjectURL(a),3e4)}async function u2(e){let t=e.sprite?.images??[];if(!t.length)return;let a=[...t].sort((x,f)=>{let b=C=>{let k=Mu.indexOf(C);return k<0?Mu.length:k};return b(x.label)-b(f.label)||x.label.localeCompare(f.label)||x.view.localeCompare(f.view)}),n=512,o=768,l=2,c=document.createElement("canvas");c.width=l*n,c.height=Math.ceil(a.length/l)*o;let u=c.getContext("2d");if(!u)throw new Error("The browser cannot assemble this sprite sheet.");let h=[];for(let x=0;x<a.length;x+=1){let f=a[x],b=new Image;b.src=f.url,await b.decode();let C=x%l*n,k=Math.floor(x/l)*o,M=Math.min(n/b.naturalWidth,o/b.naturalHeight),w=Math.round(b.naturalWidth*M),y=Math.round(b.naturalHeight*M);u.drawImage(b,C+Math.floor((n-w)/2),k+o-y,w,y),h.push({view:f.view,expression:f.label,x:C,y:k,width:n,height:o})}let g=await new Promise((x,f)=>c.toBlob(b=>b?x(b):f(new Error("The browser could not export this sheet.")),"image/png")),$=e.name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"resident";Z0(`${$}-sprites.png`,g),Z0(`${$}-sprites.json`,new Blob([JSON.stringify({width:c.width,height:c.height,cells:h},null,2)],{type:"application/json"}))}function d2({villager:e,onSaved:t}){let a=`/villagers/${encodeURIComponent(e.characterId)}/sprites`,[n,o]=(0,m.useState)("front"),[l,c]=(0,m.useState)("neutral"),[u,h]=(0,m.useState)(""),[g,$]=(0,m.useState)(""),[x,f]=(0,m.useState)(!0),[b,C]=(0,m.useState)(null),[k,M]=(0,m.useState)([]),[w,y]=(0,m.useState)(!1),[v,S]=(0,m.useState)(""),[O,P]=(0,m.useState)(""),H=(0,m.useRef)(null),L=e.sprite?.images??[],be=L.filter(q=>q.view===n),Y=L.some(q=>q.view==="front"&&q.label==="neutral"),De=be.some(q=>q.label==="neutral"),it=l==="custom"?u.trim().toLowerCase().replace(/\s+/g,"_"):l,ht=be.find(q=>q.label===it),wi=[...Mu,...L.map(q=>q.label).filter(q=>!Mu.includes(q))].filter((q,oe,Ge)=>Ge.indexOf(q)===oe);(0,m.useEffect)(()=>{C(null),o("front"),c("neutral"),S(""),D(`${a}/source`).then(q=>M(q.sprites)).catch(()=>M([]))},[a]);async function Gt(q){y(!0),S(""),P("");try{await q()}catch(oe){S(U(oe,"The sprite could not be prepared."))}finally{y(!1)}}function mt(){if(!/^[a-z0-9_-]{1,40}$/.test(it))throw new Error("Use a short expression name with letters, numbers, dashes, or underscores.");if(n==="side"&&!Y)throw new Error("Approve the front neutral sprite first.");if(it!=="neutral"&&!De)throw new Error(`Approve the ${n} neutral sprite first.`);return it}return(0,r.jsxs)("section",{className:`${i}-sprite-editor`,"aria-label":`${e.name} sprite studio`,children:[(0,r.jsxs)("div",{className:`${i}-sprite-heading`,children:[(0,r.jsxs)("div",{children:[(0,r.jsxs)("h3",{children:[e.name,"'s sprite studio"]}),(0,r.jsx)("p",{children:"Build a front view for player conversations and one side profile for villager-to-villager moments."})]}),(0,r.jsxs)("span",{className:`${i}-sprite-count`,children:[L.length," approved"]})]}),(0,r.jsx)("div",{className:`${i}-sprite-views`,"aria-label":"Sprite view",children:["front","side"].map(q=>(0,r.jsxs)("button",{type:"button",className:`${i}-sprite-view`,"aria-pressed":n===q,"data-active":n===q?"true":"false",disabled:w,onClick:()=>{o(q),c("neutral"),C(null)},children:[(0,r.jsx)("strong",{children:q==="front"?"Facing you":"Facing villagers"}),(0,r.jsxs)("span",{children:[L.filter(oe=>oe.view===q).length," approved \xB7"," ",q==="front"?"front":"side, mirrored left or right"]})]},q))}),(0,r.jsxs)("div",{className:`${i}-sprite-section-head`,children:[(0,r.jsx)("strong",{children:"Choose an expression"}),(0,r.jsx)("span",{children:"Only approved images appear in scenes."})]}),(0,r.jsxs)("div",{className:`${i}-sprite-choices`,children:[wi.map(q=>{let oe=be.find(Ge=>Ge.label===q);return(0,r.jsxs)("button",{type:"button",className:`${i}-sprite-choice`,"data-active":l===q?"true":"false","aria-pressed":l===q,disabled:w,onClick:()=>{c(q),C(null)},children:[(0,r.jsx)("span",{className:`${i}-sprite-choice-art`,children:oe?(0,r.jsx)("img",{src:oe.url,alt:""}):(0,r.jsx)("span",{"aria-hidden":"true",children:"\uFF0B"})}),(0,r.jsx)("span",{children:q}),(0,r.jsx)("small",{children:oe?"Approved":"Open"})]},q)}),(0,r.jsxs)("button",{type:"button",className:`${i}-sprite-choice`,"data-active":l==="custom"?"true":"false","aria-pressed":l==="custom",disabled:w,onClick:()=>{c("custom"),C(null)},children:[(0,r.jsx)("span",{className:`${i}-sprite-choice-art`,"aria-hidden":"true",children:"\u2726"}),(0,r.jsx)("span",{children:"Custom"}),(0,r.jsx)("small",{children:"Name your own"})]})]}),l==="custom"?(0,r.jsxs)("label",{children:["Custom expression name",(0,r.jsx)("input",{value:u,maxLength:40,disabled:w,onChange:q=>{h(q.target.value),C(null)}})]}):null,(0,r.jsxs)("div",{className:`${i}-sprite-selected`,children:[(0,r.jsxs)("strong",{children:[n==="front"?"Front":"Side"," \xB7 ",it||"custom"]}),(0,r.jsx)("span",{children:ht?"Approved art is ready. You can replace it after reviewing a new candidate.":"No approved art yet."})]}),n==="side"&&!Y?(0,r.jsx)("p",{className:`${i}-hint`,children:"Start with an approved front neutral sprite to keep the side profile recognizable."}):null,it!=="neutral"&&!De?(0,r.jsx)("p",{className:`${i}-hint`,children:"Approve this view's neutral sprite before adding expressions."}):null,(0,r.jsxs)("label",{children:["Appearance details for generation",(0,r.jsx)("textarea",{value:g,maxLength:2e3,disabled:w,onChange:q=>$(q.target.value),placeholder:"Use the resident\u2019s saved appearance, or describe it here"})]}),(0,r.jsxs)("label",{className:`${i}-row`,children:[(0,r.jsx)("input",{type:"checkbox",checked:x,disabled:w,onChange:q=>f(q.target.checked)})," ","Use an approved neutral or available portrait as the identity reference"]}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Turn references off for a connection that cannot accept images. Review identity carefully before approval."}),(0,r.jsxs)("div",{className:`${i}-sprite-actions`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:w||n==="side"&&!Y||it!=="neutral"&&!De,onClick:()=>{Gt(async()=>{let q=mt(),oe=await D(`${a}/generate`,{method:"POST",body:JSON.stringify({view:n,expression:q,appearance:g,useReference:x})});C({view:n,label:q,image:oe.image}),P(`Candidate: ${oe.width} \xD7 ${oe.height}. Review before approving.`)})},children:w?"Working\u2026":`Generate ${n} ${it||"sprite"} \xB7 1 image request`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:w||n==="side"&&!Y||it!=="neutral"&&!De,onClick:()=>H.current?.click(),children:"Upload candidate"}),(0,r.jsx)("input",{ref:H,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",hidden:!0,onChange:q=>{Gt(async()=>{let oe=mt(),Ge=q.target.files?.[0];Ge&&C({view:n,label:oe,image:await ls(Ge)}),q.target.value=""})}})]}),(0,r.jsx)("p",{className:`${i}-hint`,children:"One cell per click. Approval, mirroring, and export use no image API. If the selected Engine connection fails, its configured fallback may make another provider attempt."}),b?(0,r.jsxs)("div",{className:`${i}-sprite-candidate`,children:[(0,r.jsxs)("div",{className:`${i}-sprite-section-head`,children:[(0,r.jsx)("strong",{children:"Review candidate"}),(0,r.jsxs)("span",{children:[b.view," \xB7 ",b.label]})]}),(0,r.jsxs)("div",{className:`${i}-sprite-candidate-views`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("img",{src:b.image,alt:`${b.view} ${b.label} candidate for ${e.name}`}),(0,r.jsx)("span",{children:b.view==="side"?"Facing right":"Facing you"})]}),b.view==="side"?(0,r.jsxs)("div",{children:[(0,r.jsx)("img",{className:`${i}-sprite-mirrored`,src:b.image,alt:""}),(0,r.jsx)("span",{children:"Mirrored left \xB7 no extra image"})]}):null]}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:w,onClick:()=>{Gt(async()=>{let q=await D(`${a}/approve`,{method:"POST",body:JSON.stringify({view:b.view,expression:b.label,image:b.image})});t(q),C(null),P(`${b.view} ${b.label} approved.`)})},children:"Approve this sprite"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:w,onClick:()=>C(null),children:"Discard candidate"})]})]}):null,k.length&&n==="front"?(0,r.jsxs)("details",{className:`${i}-sprite-more`,children:[(0,r.jsx)("summary",{children:"Copy an existing Engine full-body sprite"}),(0,r.jsx)("div",{className:`${i}-row`,children:k.map(q=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:w||q.expression!=="neutral"&&!De,onClick:()=>{Gt(async()=>{let oe=await D(`${a}/import`,{method:"POST",body:JSON.stringify({view:n,expression:q.expression})});t(oe),P(`${q.expression} copied to this Village.`)})},children:q.expression},q.expression))})]}):null,L.length?(0,r.jsx)(r.Fragment,{children:(0,r.jsxs)("details",{className:`${i}-sprite-more`,children:[(0,r.jsx)("summary",{children:"Display framing and export"}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsxs)("label",{children:["Display framing"," ",(0,r.jsxs)("select",{value:e.sprite?.framing.mode??"full",disabled:w,onChange:q=>{Gt(async()=>t(await D(`${a}/framing`,{method:"PATCH",body:JSON.stringify({mode:q.target.value,cropPercent:e.sprite?.framing.cropPercent??58})})))},children:[(0,r.jsx)("option",{value:"full",children:"Full body"}),(0,r.jsx)("option",{value:"half",children:"Waist up"})]})]}),e.sprite?.framing.mode==="half"?(0,r.jsxs)("label",{children:["Visible height: ",e.sprite.framing.cropPercent,"%"," ",(0,r.jsx)("input",{type:"range",min:40,max:85,value:e.sprite.framing.cropPercent,disabled:w,onChange:q=>{Gt(async()=>t(await D(`${a}/framing`,{method:"PATCH",body:JSON.stringify({mode:"half",cropPercent:Number(q.target.value)})})))}})]}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:w,onClick:()=>{Gt(()=>u2(e))},children:"Download both views and manifest"})]})]})}):null,O?(0,r.jsx)("p",{role:"status",children:O}):null,v?(0,r.jsx)("p",{role:"alert",children:v}):null]})}function h2({entry:e,onDecide:t}){let[a,n]=(0,m.useState)(e.improvement?.title??""),[o,l]=(0,m.useState)(e.improvement?.description??""),[c,u]=(0,m.useState)(e.improvement?.extraBeds??0),[h,g]=(0,m.useState)(e.improvementSlot??0),[$,x]=(0,m.useState)(!1),[f,b]=(0,m.useState)(""),C=M=>{x(!0),b(""),t(M,{title:a,description:o,extraBeds:c,slot:h}).catch(w=>b(U(w,"That Venue request could not be decided."))).finally(()=>x(!1))},k=a!==e.improvement?.title||o!==e.improvement?.description||c!==e.improvement?.extraBeds||h!==e.improvementSlot;return(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsxs)("label",{className:`${i}-label`,children:["Proposed improvement",(0,r.jsx)("input",{className:`${i}-notice-input`,value:a,onChange:M=>n(M.target.value)})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["What changes?",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:o,onChange:M=>l(M.target.value)})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Extra beds",(0,r.jsx)("input",{type:"number",min:0,max:3,value:c,onChange:M=>u(Number(M.target.value))})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Improvement slot",(0,r.jsxs)("select",{value:h,onChange:M=>g(Number(M.target.value)),children:[(0,r.jsx)("option",{value:0,children:"Slot 1"}),(0,r.jsx)("option",{value:1,children:"Slot 2"})]})]}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:$||!a.trim()||!o.trim(),onClick:()=>C(!0),children:k?"Send counteroffer":"Approve exact request"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:$,onClick:()=>C(!1),children:"Decline"})]}),f?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:f}):null]})}function m2({room:e,nameColors:t,speechColors:a,picture:n,draft:o,mode:l,targetId:c,busy:u,error:h,greetingNotice:g,ruling:$,open:x,ended:f,playerName:b,playerPortrait:C,portraits:k,sprites:M,onDraft:w,onMode:y,onTarget:v,onSend:S,onViewVenue:O,onEnterPrivate:P,privateSpaceOwnerName:H,onEnd:L,onLeavePending:be,endFailed:Y,onRetryGreeting:De,onContinueWithoutGreeting:it,notices:ht,onDismissNotice:wi,debugDiscardEnabled:Gt,onDebugDiscard:mt,onUseMailbox:q}){let[oe,Ge]=(0,m.useState)(0),[ea,le]=(0,m.useState)(!1),[se,ta]=(0,m.useState)(!1),[Aa,Z]=(0,m.useState)(!1),[pa,ga]=(0,m.useState)(!1),[Ot,pe]=(0,m.useState)(null),Qe=(0,m.useRef)(null),ie=(0,m.useRef)(null),pt=(0,m.useRef)(null),za=(0,m.useRef)(null),Yt=(0,m.useRef)(null),Ra=(0,m.useRef)(null),yt=(0,m.useRef)(null),pn=(0,m.useRef)(null),A=(0,m.useRef)(null),B=(0,m.useRef)(new Set);(0,m.useEffect)(()=>{let E=new Set(ht.map(F=>F.id)),ce=ht.some(F=>F.kind==="memory"&&!B.current.has(F.id));B.current=E,ce?Z(!0):ht.length===0&&Z(!1)},[ht,e.id]),(0,m.useEffect)(()=>{ea&&window.requestAnimationFrame(()=>Ra.current?.focus())},[ea]),(0,m.useEffect)(()=>{if(!se)return;let E=F=>{pn.current?.contains(F.target)||ta(!1)},ce=F=>{F.key==="Escape"&&ta(!1)};return document.addEventListener("pointerdown",E),document.addEventListener("keydown",ce),()=>{document.removeEventListener("pointerdown",E),document.removeEventListener("keydown",ce)}},[se]),(0,m.useEffect)(()=>{if(!pa)return;let E=F=>{za.current?.contains(F.target)||ga(!1)},ce=F=>{F.key==="Escape"&&ga(!1)};return document.addEventListener("pointerdown",E),document.addEventListener("focusin",E),document.addEventListener("keydown",ce),()=>{document.removeEventListener("pointerdown",E),document.removeEventListener("focusin",E),document.removeEventListener("keydown",ce)}},[pa]);let ue=(0,m.useCallback)(()=>{pe(null),window.requestAnimationFrame(()=>Qe.current?.focus())},[]);(0,m.useEffect)(()=>{if(!Ot)return;window.requestAnimationFrame(()=>ie.current?.focus());let E=ce=>{if(ce.key==="Tab"){ce.preventDefault(),ie.current?.focus();return}ce.key==="Escape"&&(ce.preventDefault(),ue())};return window.addEventListener("keydown",E),()=>window.removeEventListener("keydown",E)},[ue,Ot]);let we=(0,m.useMemo)(()=>{let E=[],ce=new Map;for(let F of e.lines){if(F.kind!=="side"&&F.kind!=="whisper"||!F.asideFor)continue;let Ze=ce.get(F.asideFor)??[];Ze.push({register:F.kind,text:F.content,...F.targetId?{target:e.participants.find(Vt=>Vt.characterId===F.targetId)?.name??F.targetId}:{},speakerId:F.speakerId,name:F.name,expression:F.expression,gazeAt:F.gazeAt}),ce.set(F.asideFor,Ze)}for(let F of e.lines){if(F.kind==="side"||F.kind==="whisper")continue;let Ze=F.speakerId.length===0,Vt=u0(F.content,F.beats??null);Vt.paragraphs.forEach((Pe,gn)=>{E.push({key:`${E.length}`,speakerId:Ze?"":F.speakerId,name:Ze?b:F.name,player:Ze,text:Pe,asides:[...Vt.asides[gn]??[],...gn===Vt.paragraphs.length-1?ce.get(F.id??"")??[]:[]],...F.kind?{register:F.kind==="narration"?"narration":"speech"}:{},...F.expression?{expression:F.expression}:{},...F.gazeAt?{gazeAt:F.gazeAt}:{}})})}return E},[b,e.lines,e.participants]);(0,m.useLayoutEffect)(()=>{Ge(E=>f0(A.current,e.id,we.length,E)),A.current={roomId:e.id,stepCount:we.length}},[e.id,we.length]);let Ne=Math.min(oe,Math.max(0,we.length-1)),ee=we[Ne],ot=Ne>0,X=Ne<we.length-1,Ye=!f&&e.status==="active"&&!X,Ct=(0,m.useCallback)(()=>{let E=pt.current;if(!E)return;let ce=window.getComputedStyle(E),F=Number.parseFloat(ce.lineHeight),Ze=Number.parseFloat(ce.paddingTop)+Number.parseFloat(ce.paddingBottom),Vt=Math.ceil(F+Ze),Pe=Math.ceil(F*2+Ze);E.style.height="auto",E.style.height=`${Math.min(Math.max(E.scrollHeight,Vt),Pe)}px`,E.style.overflowY=E.scrollHeight>Pe+1?"auto":"hidden"},[]);(0,m.useLayoutEffect)(()=>{Ct()},[Ye,o,Ct]),(0,m.useEffect)(()=>{let E=pt.current?.parentElement;if(!E)return;let ce=E.clientWidth,F=new ResizeObserver(()=>{E.clientWidth!==ce&&(ce=E.clientWidth,Ct())});return F.observe(E),()=>F.disconnect()},[Ye,Ct]);let Xa=()=>{!Ye||u||l!=="conclude"&&!o.trim()||l==="fulfill"&&!c||(ga(!1),S())};(0,m.useLayoutEffect)(()=>{yt.current&&(yt.current.scrollTop=0)},[Ne,e.id]);let $i=ee?.register??(ee===void 0||ee.speakerId==="__venue_scene__"?"narration":ee.player||c0(ee.text)==="speech"?"speech":"narration"),ss=ee===void 0?void 0:ee.player?C:k[ee.speakerId],At=e.participants.filter(E=>e.activeIds.includes(E.characterId)),Or=e.status==="closed"&&At.length===0?e.participants:At,In=Or.find(E=>E.characterId===ee?.speakerId),Vr=E=>Vu(a[E]),aa=E=>Vu(t[E]),xi=Or.slice(0,4),mo=Or.filter(E=>!xi.some(ce=>ce.characterId===E.characterId)),po=xi.findIndex(E=>E.characterId===In?.characterId)>=2?"left":"right",_u=(0,r.jsxs)("p",{className:`${i}-chat-pending`,role:"status",children:[(0,r.jsx)("span",{className:`${i}-chat-spinner ${i}-spin`,"aria-hidden":"true"}),(0,r.jsx)("span",{className:`${i}-chat-pending-label`,children:e.status==="opening"?"Opening the scene\u2026":e.status==="closing"?"Saving this visit\u2026":"The room is answering\u2026"})]});return(0,r.jsxs)("aside",{className:`${i}-chat`,"data-open":x?"true":"false","data-ended":f?"true":"false","data-opening-error":e.status==="opening"&&h?"true":"false","aria-label":`${e.area==="outside"?"Outside":"Inside"} ${e.placeName}`,children:[(0,r.jsx)("p",{className:`${i}-visually-hidden`,children:`Here now: ${At.length?At.map(E=>`${E.name}${E.doing?` is ${E.doing}`:""}`).join("; "):"nobody"}.`}),(0,r.jsx)("div",{className:`${i}-chat-scene`,"aria-hidden":"true",children:n?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("img",{className:`${i}-chat-scene-backdrop`,src:n,alt:""}),(0,r.jsx)("span",{className:`${i}-chat-scrim`}),(0,r.jsx)("span",{className:`${i}-chat-vignette`})]}):(0,r.jsx)("span",{className:`${i}-chat-scene-placeholder`,children:e.area==="outside"?"Exterior not drawn yet":"Interior / space not drawn yet"})}),(0,r.jsxs)("div",{className:`${i}-chat-head`,children:[(0,r.jsx)("span",{className:`${i}-room-place`,children:e.placeName}),(0,r.jsxs)("span",{ref:pn,className:`${i}-chat-actions`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-room-actions-trigger`,onClick:()=>ta(E=>!E),"aria-label":"Venue actions","aria-haspopup":"menu","aria-expanded":se,children:"\xB7\xB7\xB7"}),se?(0,r.jsxs)("span",{className:`${i}-room-actions-menu`,role:"menu","aria-label":"Venue actions",children:[(0,r.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{ta(!1),O()},disabled:u,children:"View Venue"}),P?(0,r.jsxs)("button",{type:"button",role:"menuitem",onClick:()=>{ta(!1),P()},disabled:u,children:["Enter ",H??"private space"]}):null,(0,r.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{ta(!1),L()},disabled:u,children:f?"Return to map":"End visit now"}),Y||e.status==="closing"?(0,r.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{ta(!1),be()},children:"Leave with memory pending"}):null,Gt&&e.status!=="closed"?(0,r.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{ta(!1),mt()},disabled:u,children:"DEBUG: Discard Visit"}):null]}):null]})]}),e.area==="outside"?(0,r.jsx)("p",{className:`${i}-hint`,role:"status",children:"You\u2019re outside this Residence. A resident needs to invite you in. You can speak in your own words, or leave whenever you like."}):null,ht.length>0?(0,r.jsxs)("div",{className:`${i}-room-notices`,"aria-live":"polite",children:[(0,r.jsxs)("button",{type:"button",className:`${i}-room-notices-trigger`,onClick:()=>Z(E=>!E),"aria-expanded":Aa,"aria-label":`${ht.length} village ${ht.length===1?"notice":"notices"}`,children:["\u2726 ",ht.length]}),Aa?(0,r.jsx)("div",{className:`${i}-room-stars`,"aria-live":"polite","aria-label":"Village events",children:ht.map(E=>(0,r.jsxs)("div",{className:`${i}-room-star`,children:[(0,r.jsx)("span",{"aria-hidden":"true",children:"\u2726"}),E.kind==="memory"&&E.detail?(0,r.jsx)("button",{type:"button",className:`${i}-room-star-detail`,onClick:ce=>{Qe.current=ce.currentTarget,pe(E)},"aria-label":`View memory: ${E.text}`,title:"View saved memory",children:E.text}):(0,r.jsx)("span",{children:E.text}),(0,r.jsx)("button",{type:"button",className:`${i}-room-star-dismiss`,onClick:()=>{Ot?.id===E.id&&pe(null),wi(E.id)},"aria-label":`Dismiss ${E.text}`,title:"Dismiss notice",children:"\xD7"})]},E.id))}):null]}):null,Ot?.detail?(0,r.jsx)("div",{className:`${i}-memory-backdrop`,onClick:E=>{E.currentTarget===E.target&&ue()},children:(0,r.jsxs)("div",{className:`${i}-memory-dialog`,role:"dialog","aria-modal":"true","aria-labelledby":`${i}-memory-dialog-title`,children:[(0,r.jsxs)("div",{className:`${i}-memory-dialog-head`,children:[(0,r.jsx)("h2",{id:`${i}-memory-dialog-title`,children:Ot.text}),(0,r.jsx)("button",{ref:ie,type:"button",onClick:ue,"aria-label":"Close memory",children:"\xD7"})]}),(0,r.jsx)("p",{children:Ot.detail})]})}):null,At.length>0?(0,r.jsx)("div",{className:`${i}-chat-activities`,tabIndex:0,"aria-label":"What everyone here is doing",children:At.map(E=>(0,r.jsx)("span",{className:`${i}-chat-activity`,children:`${E.name}: ${E.doing||"spending time here"}`},E.characterId))}):null,(0,r.jsxs)("div",{className:`${i}-chat-stage`,"aria-hidden":"true",children:[(0,r.jsx)("div",{className:`${i}-chat-cast`,children:xi.map((E,ce)=>{let F=M[E.characterId],Ze=E.characterId===In?.characterId,Vt=ee?.asides.find(Un=>Un.speakerId===E.characterId),Pe=Ze?ee?.expression??"neutral":Vt?.expression??"neutral",gn=Ze?ee?.gazeAt:Vt?.gazeAt??(E.characterId===ee?.gazeAt?In?.characterId:void 0),Ni=xi.findIndex(Un=>Un.characterId===gn),Si=y0(F?.images??[],Pe,v0(ce,Ni));return(0,r.jsxs)("div",{className:`${i}-chat-cast-person`,"data-active":E.characterId===In?.characterId?"true":"false","data-sprite":Si?"true":"false",children:[Si?(0,r.jsx)("img",{src:Si.image.url,alt:"","data-framing":F?.framing.mode??"full","data-facing":Si.mirrored?"left":"right"}):(0,r.jsx)(ho,{portrait:k[E.characterId],name:E.name,className:`${i}-avatar`}),(0,r.jsx)("span",{style:aa(E.characterId),children:E.name})]},E.characterId)})}),mo.length>0?(0,r.jsx)("div",{className:`${i}-chat-cast-rest`,children:mo.map(E=>(0,r.jsxs)("span",{children:[(0,r.jsx)(ho,{portrait:k[E.characterId],name:E.name,className:`${i}-avatar`}),(0,r.jsx)("span",{style:aa(E.characterId),children:E.name})]},E.characterId))}):null]}),(0,r.jsxs)("div",{className:`${i}-chat-vn`,children:[ea?(0,r.jsx)("div",{ref:Ra,className:`${i}-chat-log`,role:"log","aria-label":"Venue conversation history",tabIndex:0,onKeyDown:E=>{E.key==="Escape"&&(le(!1),window.requestAnimationFrame(()=>Yt.current?.focus()))},children:e.lines.map((E,ce)=>(0,r.jsxs)("p",{className:`${i}-chat-vn-text`,children:[(0,r.jsxs)("strong",{style:E.role==="assistant"&&E.kind!=="narration"?aa(E.speakerId):void 0,children:[E.role==="user"?b:E.kind==="narration"||E.speakerId==="__venue_scene__"?"Narration":E.name||"Resident",E.kind==="side"?" \xB7 aside":E.kind==="whisper"?" \xB7 whisper":"",":"," "]}),(0,r.jsx)("span",{style:E.role==="assistant"&&E.kind!=="narration"?Vr(E.speakerId):void 0,children:Rr(E.content,`history-${ce}-`)})]},E.id??ce))}):null,ee&&ee.asides.length>0?(0,r.jsx)("div",{className:`${i}-chat-vn-asides`,"data-side":po,"aria-live":"polite",children:ee.asides.map((E,ce)=>(0,r.jsxs)("div",{className:`${i}-chat-vn-aside`,"data-register":E.register,children:[(0,r.jsx)(ho,{portrait:E.speakerId?k[E.speakerId]:ss,name:E.name??ee.name,glyph:ee.player?"person":"initial",className:`${i}-chat-vn-aside-face`}),(0,r.jsxs)("div",{className:`${i}-chat-vn-aside-column`,children:[(0,r.jsxs)("p",{className:`${i}-chat-vn-aside-head`,children:[(0,r.jsx)("span",{className:`${i}-chat-vn-aside-icon`,children:E.register==="whisper"?"\u{1F92B}":"\u{1F4AC}"}),(0,r.jsx)("span",{className:`${i}-chat-vn-aside-name`,style:aa(E.speakerId??ee.speakerId),children:E.name??ee.name}),E.register==="whisper"&&E.target?(0,r.jsx)("span",{className:`${i}-chat-vn-aside-target`,children:`\u2192 ${E.target}`}):null]}),(0,r.jsx)("p",{className:`${i}-chat-vn-aside-text`,style:Vr(E.speakerId??ee.speakerId),children:Rr(E.text,`vn-aside-${ce}-`)})]})]},`${ce}-${E.register}`))}):null,(0,r.jsx)("div",{className:`${i}-chat-vn-card`,"data-register":$i,children:(0,r.jsx)("div",{className:`${i}-chat-vn-row`,children:(0,r.jsxs)("div",{className:`${i}-chat-vn-column`,children:[$i==="narration"?(0,r.jsx)("p",{className:`${i}-chat-vn-label`,children:"Narration"}):(0,r.jsx)("p",{className:`${i}-chat-vn-name`,style:ee?.player?void 0:aa(ee?.speakerId??""),children:ee?.name??""}),(0,r.jsxs)("div",{ref:yt,className:`${i}-chat-vn-reading`,role:"region","aria-label":"Current paragraph","aria-live":"polite",tabIndex:0,children:[ee?$i==="narration"?(0,r.jsx)("p",{className:`${i}-chat-vn-beat`,"data-register":"narration",children:Rr(ee.text,"vn-beat-")}):(0,r.jsx)("p",{className:`${i}-chat-vn-text`,style:ee.player?void 0:Vr(ee.speakerId),children:Rr(ee.text,"vn-")}):(0,r.jsx)("p",{className:`${i}-chat-vn-text`,"data-empty":"true",children:e.status==="opening"?`Opening the scene in ${e.placeName}\u2026`:At.length===0?`You are alone in ${e.placeName}.`:"\u2026"}),!f&&u?_u:null]})]})})}),(0,r.jsxs)("div",{className:`${i}-room-panel-tools`,children:[e.lines.length>0?(0,r.jsx)("button",{ref:Yt,type:"button",className:`${i}-chat-history-toggle`,"aria-label":"History","aria-expanded":ea,onClick:()=>le(E=>!E),children:ea?"Hide history":"History"}):null,(0,r.jsx)("span",{className:`${i}-chat-vn-counter`,children:`${Ne+1} / ${Math.max(1,we.length)}`}),(0,r.jsxs)("span",{className:`${i}-chat-vn-nav`,children:[(0,r.jsxs)("button",{type:"button",className:`${i}-chat-vn-button`,onClick:()=>Ge(Ne-1),disabled:!ot,"aria-label":"Previous paragraph",children:["\u2039 ",(0,r.jsx)("span",{children:"Previous"})]}),X?(0,r.jsxs)("button",{type:"button",className:`${i}-chat-vn-button`,onClick:()=>Ge(Ne+1),"aria-label":"Next paragraph",children:[(0,r.jsx)("span",{children:"Next"})," \u203A"]}):f?(0,r.jsx)("button",{type:"button",className:`${i}-chat-vn-button`,onClick:L,disabled:u,children:"Return to map"}):null]})]}),h&&e.status==="opening"?(0,r.jsxs)("div",{className:`${i}-room-error`,role:"alert",children:[(0,r.jsx)("p",{children:h}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:L,disabled:u,children:"Back to map"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:De,disabled:u,children:"Retry opening"}),e.id?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:it,disabled:u,children:"Continue without opening"}):null]}):null,g?(0,r.jsx)("div",{className:`${i}-room-error`,role:"status",children:(0,r.jsx)("p",{children:g})}):null,$?(0,r.jsx)("p",{className:`${i}-empty`,children:$}):null,e.status==="closing"?(0,r.jsx)("p",{className:`${i}-hint`,children:"The visit is still being remembered. You can leave with memory pending if filing cannot finish."}):null,Ye&&l==="fulfill"&&At.length===0?(0,r.jsx)("p",{className:`${i}-hint`,children:"Nobody is here whose wish you can fulfill."}):null,Ye?(0,r.jsxs)("div",{className:`${i}-composer`,children:[l==="fulfill"&&At.length>0?(0,r.jsxs)("select",{value:c,onChange:E=>v(E.target.value),"aria-label":"Whose wish you fulfilled",disabled:u||f||e.status!=="active",children:[(0,r.jsx)("option",{value:"",children:"Choose one villager"}),At.map(E=>(0,r.jsx)("option",{value:E.characterId,children:E.name},E.characterId))]}):null,(0,r.jsx)("div",{className:`${i}-composer-row`,children:(0,r.jsxs)("span",{className:`${i}-chat-input`,children:[(0,r.jsxs)("span",{ref:za,className:`${i}-room-mode-anchor`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-room-mode-toggle`,onClick:()=>ga(E=>!E),"aria-label":`Mode: ${l==="chat"?"Chat":l==="fulfill"?"Fulfill":"Conclude"}. Choose mode`,"aria-haspopup":"menu","aria-expanded":pa,title:l==="chat"?"Chat":l==="fulfill"?"Fulfill":"Conclude",children:l==="chat"?"\u{1F4AC}":l==="fulfill"?"\u{1FAF4}":"\u{1F6AA}"}),pa?(0,r.jsx)("span",{className:`${i}-room-mode-menu`,role:"menu","aria-label":"Visit mode",children:["chat","fulfill","conclude"].map(E=>(0,r.jsx)("button",{type:"button",role:"menuitemradio","aria-checked":l===E,disabled:u||E==="fulfill"&&At.length===0,onClick:()=>{y(E),ga(!1)},children:E==="chat"?"Chat":E==="fulfill"?"Fulfill":"Conclude"},E))}):null]}),q?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:q,title:"Use the Mailbox at home",children:"Use\u2026 Mailbox"}):null,(0,r.jsx)("textarea",{ref:pt,className:`${i}-textarea`,rows:1,value:o,onChange:E=>w(E.target.value),onKeyDown:E=>{g0(E.key,E.shiftKey,E.nativeEvent.isComposing)&&(E.preventDefault(),Xa())},placeholder:l==="fulfill"?"What did you do for them?":l==="conclude"?"Final line (optional)\u2026":"Say or do something\u2026","aria-label":`Message at ${e.placeName}`,disabled:u||f||e.status!=="active"}),(0,r.jsx)("button",{type:"button",className:`${i}-chat-send`,onClick:Xa,disabled:u||f||e.status!=="active"||l!=="conclude"&&o.trim().length===0||l==="fulfill"&&!c,"aria-label":u?"Sending":"Send",title:u?"Sending":"Send",children:u?"Sending\u2026":"Send"})]})})]}):null,h&&e.status!=="opening"?(0,r.jsx)("div",{className:`${i}-room-error`,role:"alert",children:(0,r.jsx)("p",{children:h})}):null]})]})}var K0="Testing action: runs normal time catch-up, then bypasses Story pace for one visual Events update. It can spend a model call, but its prose cannot change memories, wishes, notices, venues, or resident behavior.";function p2({element:e}){let[t,a]=(0,m.useState)(!1);(0,m.useLayoutEffect)(()=>{let s=()=>{let p=e.getBoundingClientRect();a(p.width<=704||p.width<=880&&p.height<=512)};s();let d=new ResizeObserver(s);return d.observe(e),()=>d.disconnect()},[e]);let[n,o]=(0,m.useState)(null),[l,c]=(0,m.useState)(null),[u,h]=(0,m.useState)(null),[g,$]=(0,m.useState)(0),[x,f]=(0,m.useState)("residents"),[b,C]=(0,m.useState)(null),[k,M]=(0,m.useState)(null),[w,y]=(0,m.useState)(0),[v,S]=(0,m.useState)(0),[O,P]=(0,m.useState)(0),[H,L]=(0,m.useState)(null),[be,Y]=(0,m.useState)(!1),[De,it]=(0,m.useState)(""),[ht,wi]=(0,m.useState)(""),[Gt,mt]=(0,m.useState)(""),[q,oe]=(0,m.useState)(null),[Ge,ea]=(0,m.useState)(!1),[le,se]=(0,m.useState)("home"),[ta,Aa]=(0,m.useState)(null),[Z,pa]=(0,m.useState)("view"),[ga,Ot]=(0,m.useState)(!1),[pe,Qe]=(0,m.useState)(null),[ie,pt]=(0,m.useState)(null),[za,Yt]=(0,m.useState)(!1),[Ra,yt]=(0,m.useState)(""),[pn,A]=(0,m.useState)(""),[B,ue]=(0,m.useState)(""),[we,Ne]=(0,m.useState)(null),[ee,ot]=(0,m.useState)(!1),[X,Ye]=(0,m.useState)("village"),[Ct,Xa]=(0,m.useState)("index"),[$i,ss]=(0,m.useState)({}),[At,Or]=(0,m.useState)(null),[In,Vr]=(0,m.useState)({}),[aa,xi]=(0,m.useState)({}),[mo,po]=(0,m.useState)(""),[_u,E]=(0,m.useState)(null),[ce,F]=(0,m.useState)(""),[Ze,Vt]=(0,m.useState)(""),[Pe,gn]=(0,m.useState)(""),[Ni,Si]=(0,m.useState)(null),[Un,Up]=(0,m.useState)(""),[cs,qp]=(0,m.useState)([]),[Hu,Bp]=(0,m.useState)(1600),[Ma,Lp]=(0,m.useState)([]),[go,jp]=(0,m.useState)(1600),[Iu,l1]=(0,m.useState)(null),[Gp,Yp]=(0,m.useState)(""),[us,fo]=(0,m.useState)([]),[Xp,s1]=(0,m.useState)(""),[fa,ds]=(0,m.useState)([]),[Ti,Xt]=(0,m.useState)(!1),[hs,ki]=(0,m.useState)(!1),[c1,Uu]=(0,m.useState)(null),[u1,qu]=(0,m.useState)(null),[ms,Bu]=(0,m.useState)(null),[ps,Qp]=(0,m.useState)(""),[Ae,gs]=(0,m.useState)(0),[Qa,Zp]=(0,m.useState)(""),[wt,Kp]=(0,m.useState)(""),[fn,Jp]=(0,m.useState)("rebuild"),[ba,Lu]=(0,m.useState)(uo("rebuild").premise),[Dr,Fp]=(0,m.useState)(""),[d1,h1]=(0,m.useState)(Np),[bn,Pp]=(0,m.useState)([]),[m1,fs]=(0,m.useState)([]),[Be,Ei]=(0,m.useState)([]),[_r,Oa]=(0,m.useState)(null),[p1,Wp]=(0,m.useState)(0),[eg,ju]=(0,m.useState)(!1),[Gu,Ci]=(0,m.useState)(null),[Hr,qn]=(0,m.useState)(null),[Za,bs]=(0,m.useState)(!1),[tg,Yu]=(0,m.useState)(""),[vs,ag]=(0,m.useState)(A0),[ze,Ai]=(0,m.useState)("generate"),[g1,Xu]=(0,m.useState)(""),[ys,Qu]=(0,m.useState)(null),[f1,ng]=(0,m.useState)(""),[Ir,Zu]=(0,m.useState)(null),[bo,Ku]=(0,m.useState)(""),[vo,Ju]=(0,m.useState)(""),Ur=JSON.stringify({scenario:fn,premise:ba.trim(),direction:Dr.trim(),setting:wt.trim(),lorebooks:Ma,loreBudget:go}),Fu=(0,m.useRef)(Ur);(0,m.useEffect)(()=>{Fu.current!==Ur&&!n?.isFounded&&qn(null),Fu.current=Ur},[Ur,n?.isFounded]);let Pu=JSON.stringify({setting:wt.trim(),worldFacts:n?.isFounded?bn:null,lorebooks:Ma,structure:bo,negative:vo,options:vs}),[Dt,qr]=(0,m.useState)(!1),[ig,ws]=(0,m.useState)(""),[Wu,b1]=(0,m.useState)("Connections are still loading."),[og,rg]=(0,m.useState)(!1),[v1,Br]=(0,m.useState)(!1),[lg,ge]=(0,m.useState)(""),[y1,$s]=(0,m.useState)(!1),[xs,Ns]=(0,m.useState)(""),[Va,ed]=(0,m.useState)(null),[td,Lr]=(0,m.useState)(null),[w1,ad]=(0,m.useState)(!1),[Ka,yo]=(0,m.useState)(""),[sg,Bn]=(0,m.useState)(null),wo=n?.settings.townMapView??Ru("cover"),cg=n?Va?.size??{width:n.settings.townMapExpectedWidth,height:n.settings.townMapExpectedHeight}:null,ug=n?ze==="existing"?{width:n.settings.townMapExpectedWidth,height:n.settings.townMapExpectedHeight}:Ir&&ys===ze?Ir:{width:n.settings.townMapGenerationWidth,height:n.settings.townMapGenerationHeight}:null,$1=n?{min:n.settings.townMapZoomMin,max:n.settings.townMapZoomMax,step:n.settings.townMapZoomStep}:{min:1,max:1,step:.1},Ss=Va?Va.image:xs||null,zi=ze==="none"?null:ze==="existing"?xs||null:ys===ze&&(ze!=="generate"||f1===Pu)&&g1||null,Ts=Va!==null||w1,jr=Ts?td??wo:wo,nd=Va?Cp(Va.size):null,[Gr,Me]=(0,m.useState)(""),[_t,K]=(0,m.useState)(""),[_,G]=(0,m.useState)(!1),[I,qe]=(0,m.useState)(null),[x1,Yr]=(0,m.useState)(!1),[N1,Da]=(0,m.useState)(!1),[Xr,vn]=(0,m.useState)(""),[Qr,ks]=(0,m.useState)("chat"),[Zr,id]=(0,m.useState)(""),[S1,dg]=(0,m.useState)(""),[T1,_a]=(0,m.useState)([]),Ha=(0,m.useRef)(new Set),[od,k1]=(0,m.useState)(!1),hg=(0,m.useRef)(0),$o=(0,m.useRef)(0),mg=(0,m.useRef)(""),[rd,xo]=(0,m.useState)(""),[va,We]=(0,m.useState)(!1),No=(0,m.useRef)(!1),Ri=(0,m.useRef)(null),Kr=(0,m.useRef)(null),Ht=(0,m.useRef)(null),So=(0,m.useCallback)(s=>{let d=[];for(let p of s)Ha.current.has(p.id)||(Ha.current.add(p.id),d.push(p));d.length>0&&_a(p=>[...p,...d])},[]),Jr=(0,m.useRef)(!1),[E1,rt]=(0,m.useState)(""),[C1,Mi]=(0,m.useState)(""),[Fr,To]=(0,m.useState)(!1),[Es,ld]=(0,m.useState)(""),pg=(0,m.useRef)(""),Cs=(0,m.useRef)(!1),[As,gg]=(0,m.useState)(!1),sd=(0,m.useRef)(null),cd=(0,m.useRef)(null);(0,m.useEffect)(()=>{let s=cd.current,d=sd.current;s===null||!d||(cd.current=null,d.focus(),d.setSelectionRange(s,s))},[Ze]);let zs=(0,m.useCallback)(async(s=!1)=>{if(Cs.current)return null;Cs.current=!0;let d=setTimeout(()=>gg(!0),jS);try{let p=await D("/reconcile",{method:"POST",body:s?JSON.stringify({forceStory:!0}):void 0});return o(p),p}catch{return null}finally{clearTimeout(d),gg(!1),Cs.current=!1}},[]),fg=(0,m.useCallback)(async()=>{let s=n?.happenings[0]?.id??"";ld("Writing...");let d=await zs(!0);if(!d){ld("The update request failed. Check the village again before retrying; time catch-up may already have run.");return}ld((d.happenings[0]?.id??"")===s?"No new happening was added. Other village records may have changed during catch-up.":"A new visual event was added. See Events.")},[n,zs]),Se=(0,m.useCallback)(async(s={})=>{try{let d=await D("",{signal:s.signal});o(d),Me("")}catch(d){if(s.signal?.aborted||s.quiet)return;o(null),Me(U(d,"Could not read the village."))}},[]);(0,m.useEffect)(()=>{let s=n?.village.nextTransitionAt??"";s.length===0||s===pg.current||(pg.current=s,n?.isFounded&&zs())},[n,zs]);let Ja=(0,m.useCallback)(async s=>{try{let d=await D("/catalog",{signal:s});c(d.characters),Me("")}catch(d){if(s?.aborted)return;Me(U(d,"Could not read your character library."))}},[]),ko=(0,m.useCallback)(async s=>{try{let d=await D("/personas",{signal:s});Si(d.personas)}catch(d){if(s?.aborted)return;Si([]),Me(U(d,"Could not read your Personas."))}},[]),Eo=(0,m.useCallback)(async s=>{try{let d=await D("/lorebooks",{signal:s});l1(d.books),Yp("")}catch(d){if(s?.aborted)return;Yp(U(d,"Could not read Engine lorebooks. Selected books will be skipped until available."))}},[]),bg=(0,m.useCallback)(async s=>{try{let d=await D("/story?offset=0&limit=50",{signal:s});h(d.entries),$(d.total)}catch(d){if(s?.aborted)return;h(null),Me(U(d,"Could not read the village story."))}},[]),Rs=(0,m.useCallback)(async s=>{try{let d=await D("/memories",{signal:s});C(d),Me("")}catch(d){if(s?.aborted)return;C(null),Me(U(d,"Could not read villager memories."))}},[]),A1=(0,m.useCallback)(async(s,d)=>{let p=s==="durable"?"Forget this durable memory?":"Let this passing recollection go now?";if(window.confirm(p)){G(!0);try{await D(`/memories/${s}/${encodeURIComponent(d)}`,{method:"DELETE"}),await Rs()}catch(N){Me(U(N,"That memory could not be removed."))}finally{G(!1)}}},[Rs]),z1=(0,m.useCallback)(async s=>{G(!0);try{let d=await D(`/story/${encodeURIComponent(s)}`,{method:"DELETE"});h(d.entries),$(d.total),Me("")}catch(d){Me(U(d,"That memory could not be removed."))}finally{G(!1)}},[]),R1=(0,m.useCallback)(async()=>{let s=u?.length??0;try{let d=await D(`/story?offset=${s}&limit=50`);h(p=>[...p??[],...d.entries]),$(d.total)}catch(d){Me(U(d,"Could not read more memories."))}},[u]),Ms=(0,m.useCallback)(async s=>{try{let d=await D("/agendas",{signal:s});oe(d.villagers)}catch(d){if(s?.aborted)return;oe(null),Me(U(d,"Could not read what the villagers wish for."))}},[]);(0,m.useEffect)(()=>{if(le!=="menu"||X!=="agendas"&&X!=="schedules"||!q?.some(d=>d.agenda?.personalizationPending&&!d.agenda.personalizationFailure))return;let s=window.setInterval(()=>{Ms()},5e3);return()=>window.clearInterval(s)},[q,Ms,X,le]);let M1=(0,m.useCallback)(async s=>{G(!0);try{let d=await D(`/agendas/${encodeURIComponent(s)}/regenerate`,{method:"POST"});oe(d.villagers),Me("")}catch(d){Me(U(d,"That villager could not be asked again."))}finally{G(!1)}},[]),O1=(0,m.useCallback)(async(s,d)=>{G(!0);try{let p=await D(`/agendas/${encodeURIComponent(s)}/completed/${encodeURIComponent(d)}/correct`,{method:"POST"});oe(p.villagers),Me("")}catch(p){Me(U(p,"That wish completion could not be corrected."))}finally{G(!1)}},[]),V1=(0,m.useCallback)(async(s,d)=>{G(!0);try{let p=await D(`/agendas/${encodeURIComponent(s)}/ingestion`,{method:"PATCH",body:JSON.stringify({ingestSchedule:d})});oe(p.villagers),Me("")}catch(p){Me(U(p,"Schedule use could not be changed."))}finally{G(!1)}},[]);(0,m.useEffect)(()=>{let s=new AbortController;return Se({signal:s.signal}),()=>s.abort()},[Se]),(0,m.useEffect)(()=>{let s=()=>{document.hidden||Se({quiet:!0})},d=setInterval(()=>{document.hidden||Cs.current||Se({quiet:!0})},LS);return document.addEventListener("visibilitychange",s),()=>{clearInterval(d),document.removeEventListener("visibilitychange",s)}},[Se]),(0,m.useEffect)(()=>{if(!I?.id||I.status==="closed"||le!=="room")return;mg.current!==I.id?(mg.current=I.id,$o.current=Date.parse(I.lastActivityAt||I.startedAt)||Date.now()):$o.current=Math.max($o.current,Date.parse(I.lastActivityAt||I.startedAt)||0);let s=!1,d=V=>{s||Ar(I.id,Ht.current)||(qe(null),Da(!1),_a([]),Ha.current.clear(),xo(V==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),se("home"),Se())},p=(V=!1)=>{Ar(I.id,Ht.current)||D("/rooms/active").then(async({session:j})=>{if(s||Ar(I.id,Ht.current))return;if(j?.id===I.id){V&&(await D("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:I.id})}),$o.current=Date.now());return}let fe=await D(`/rooms/archive/${encodeURIComponent(I.id)}`).catch(()=>null);s||Ar(I.id,Ht.current)||d(fe?.visit.endReason==="inactivity"?"inactivity":"elsewhere")}).catch(j=>{let fe=zr(j);fe&&d(fe)})},N=V=>{if(!Ar(I.id,Ht.current)){if(Date.now()-$o.current>=30*6e4){V.cancelable&&V.preventDefault(),V.stopImmediatePropagation(),p(!0);return}$o.current=Date.now(),!(Date.now()-hg.current<15e3)&&(hg.current=Date.now(),D("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:I.id})}).catch(j=>{let fe=zr(j);fe?d(fe):p()}))}},z=()=>p();window.addEventListener("focus",z),document.addEventListener("visibilitychange",z);for(let V of["pointerdown","keydown","input","scroll"])window.addEventListener(V,N,!0);return()=>{s=!0,window.removeEventListener("focus",z),document.removeEventListener("visibilitychange",z);for(let V of["pointerdown","keydown","input","scroll"])window.removeEventListener(V,N,!0)}},[I?.id,I?.status,I?.lastActivityAt,I?.startedAt,le,Se]),(0,m.useEffect)(()=>{let s=new AbortController;return D("/rooms/active",{signal:s.signal}).then(({session:d,debugDiscardEnabled:p})=>{k1(p),!(s.signal.aborted||!d)&&(qe(d),ks("chat"),Da(!0),se("room"),d.status==="opening"&&(We(!0),D("/rooms/greet",{method:"POST",body:JSON.stringify({sessionId:d.id}),signal:AbortSignal.timeout(3e4)}).then(({session:N})=>{s.signal.aborted||qe(N)}).catch(async N=>{if(s.signal.aborted)return;let z=await V0(d.id);s.signal.aborted||(z?qe(z):rt(_0(N)))}).finally(()=>{s.signal.aborted||We(!1)})))}).catch(()=>{}),()=>s.abort()},[]),(0,m.useEffect)(()=>{if(X!=="chatlogs"||!n?.isFounded)return;let s=new AbortController,d=new URLSearchParams;return De&&d.set("venueId",De),ht&&d.set("characterId",ht),d.set("offset",String(v)),d.set("limit","20"),M(null),D(`/rooms/archive?${d.toString()}`,{signal:s.signal}).then(({visits:p,total:N})=>{s.signal.aborted||(M(p),y(N),mt(""))}).catch(p=>{s.signal.aborted||mt(U(p,"Venue visits could not be read."))}),()=>s.abort()},[De,ht,v,O,X,n?.isFounded]);let ud=(0,m.useCallback)(async s=>{try{let d=await D(`/rooms/archive/${encodeURIComponent(s)}`);L(d.visit),mt("")}catch(d){mt(U(d,"That visit could not be read."))}},[]),D1=(0,m.useCallback)(async s=>{G(!0);try{await D(`/rooms/archive/${encodeURIComponent(s)}/retry-memory`,{method:"POST"}),await ud(s),P(d=>d+1),mt("")}catch(d){mt(U(d,"Memory filing is still pending."))}finally{G(!1)}},[ud]),vg=(0,m.useCallback)(async s=>{if(window.confirm(s?"Delete this exact visit transcript? Filed memories and world changes remain. Any pending memory can no longer be retried.":"Delete all completed visit transcripts? Filed memories and world changes remain. Any pending memories can no longer be retried.")){G(!0);try{await D(s?`/rooms/archive/${encodeURIComponent(s)}`:"/rooms/archive",{method:"DELETE"}),L(null),S(0),P(d=>d+1),mt("")}catch(d){mt(U(d,"Visit transcripts could not be deleted."))}finally{G(!1)}}},[]);(0,m.useEffect)(()=>{if(!Ge)return;let s=new AbortController;return Ja(s.signal),()=>s.abort()},[Ge,Ja]);let yg=n?n.settings.townMapImageSetAt:null;(0,m.useEffect)(()=>{if(yg===null)return;let s=new AbortController;return(async()=>{try{let d=await D("/town-map",{signal:s.signal});Ns(d.image)}catch{s.signal.aborted||Ns("")}})(),()=>s.abort()},[yg]);let _1=(0,m.useCallback)(async s=>{G(!0);try{o(await D("/villagers",{method:"POST",body:JSON.stringify({characterId:s})})),Me(""),await Ja()}catch(d){Me(U(d,"That character could not move in."))}finally{G(!1)}},[Ja]),H1=(0,m.useCallback)(async s=>{G(!0);try{o(await D(`/villagers/${encodeURIComponent(s)}`,{method:"DELETE"})),Me(""),l&&await Ja()}catch(d){Me(U(d,"That villager could not leave."))}finally{G(!1)}},[l,Ja]),I1=(0,m.useCallback)(async s=>{po(s);try{let d=await D(`/villagers/${encodeURIComponent(s)}/refresh`);xi(p=>({...p,[s]:d})),Me("")}catch(d){Me(U(d,"That villager's card could not be compared."))}finally{po("")}},[]),U1=(0,m.useCallback)(async s=>{po(s);try{o(await D(`/villagers/${encodeURIComponent(s)}/refresh`,{method:"POST"})),xi(d=>{let p={...d};return delete p[s],p}),Me("")}catch(d){Me(U(d,"That villager's card could not be refreshed."))}finally{po("")}},[]),lt=(0,m.useCallback)(s=>{Xa(s==="noticeboard"?"noticeboard":s==="general"?"general":s==="replyGuidance"||s==="story"||s==="chatlogs"||s==="agendas"||s==="schedules"?"debug":"village"),K(""),ot(!1),s==="villagers"&&Ja(),s==="villagers"&&(le!=="menu"||X!=="villagers")&&f("residents"),s==="village"&&ko(),s==="village"&&Eo(),s==="story"&&bg(),(s==="agendas"||s==="schedules")&&Ms(),s==="village"&&(le!=="menu"||X!=="village")&&n&&(Vt(n.settings.promptKnowledge),gn(n.settings.playerPersonaId),Up(n.settings.setting),qp(n.settings.selectedLorebookIds),Bp(n.settings.loreTokenBudget),fo(_n(n.settings.venues).map(p=>({...p})))),Ye(s),se("menu")},[Ms,Ja,Eo,ko,bg,X,le,n]),dd=(0,m.useCallback)(()=>{ea(!1),K(""),Ne(null),ot(!1),se("home")},[]),q1=(0,m.useCallback)(async()=>{if(!(!I||va)){if(!I.id||I.status==="closed"||Fr){Ht.current=null,Da(!1),qe(null),_a([]),Ha.current.clear(),vn(""),Mi(""),se("home"),Se();return}We(!0),rt(""),Y(!1),qe({...I,status:"closing"}),Ht.current={roomId:I.id,submissionId:""};try{let s=await D("/rooms/end",{method:"POST",body:JSON.stringify({sessionId:I.id})});if(No.current)return;qe(s.session),To(!0),So(s.recordEvents??[]),vn(""),Mi(""),Se()}catch(s){if(No.current)return;Ht.current=null;let d=zr(s);if(d){qe(null),Da(!1),_a([]),Ha.current.clear(),xo(d==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),se("home"),Se();return}rt(U(s,"You could not leave the venue.")),Y(!0)}finally{We(!1)}}},[Se,So,I,va,Fr]),B1=(0,m.useCallback)(async()=>{if(!I?.id||I.status!=="active"||va||Jr.current)return;let s=Kr.current??ku();Kr.current=s,Ht.current={roomId:I.id,submissionId:s},We(!0),rt(""),Y(!1);try{let d=await D("/rooms/leave",{method:"POST",body:JSON.stringify({sessionId:I.id,submissionId:s,message:Xr}),signal:AbortSignal.timeout(3e5)});qe(d.session),To(!0),So(d.recordEvents??[]),Kr.current=null,vn(""),Se()}catch(d){let p=await D0(I.id,s);if(p){qe(p),To(!0),vn(""),rt(""),Y(!1),Kr.current=null,Se();return}Ht.current=null;let N=zr(d);if(N){qe(null),Da(!1),_a([]),Ha.current.clear(),xo(N==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),se("home"),Se();return}rt(U(d,"The scene could not end yet.")),Y(!0)}finally{We(!1)}},[Se,So,I,va,Xr]),L1=(0,m.useCallback)(async()=>{if(!(!I?.id||No.current)){No.current=!0,We(!0);try{await D("/rooms/leave-pending",{method:"POST",body:JSON.stringify({sessionId:I.id})}),Ht.current=null,Da(!1),qe(null),_a([]),Ha.current.clear(),se("home"),Y(!1),Se()}catch(s){rt(U(s,"The visit could not be left yet.")),No.current=!1}finally{We(!1)}}},[Se,I]),j1=(0,m.useCallback)(async()=>{if(!(!I?.id||!od||va)&&window.confirm("DEBUG: Discard this visit and its transcript? Completed effects and villager memories remain.")){We(!0);try{await D("/rooms/debug/discard",{method:"POST",body:JSON.stringify({sessionId:I.id})}),qe(null),Da(!1),_a([]),Ha.current.clear(),vn(""),se("home"),Se()}catch(s){rt(U(s,"The debug discard failed."))}finally{We(!1)}}},[I,od,va,Se]),G1=(0,m.useCallback)(async()=>{let s=Xr.trim();if(I===null||!I.id||Fr||va||Jr.current||s.length===0)return;Jr.current=!0;let d=Ri.current??ku();Ri.current=d;let p=I;try{await D("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:I.id})})}catch(z){Jr.current=!1;let V=zr(z);V?(qe(null),Da(!1),_a([]),Ha.current.clear(),xo(V==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),se("home"),Se()):rt(U(z,"The visit could not be checked."));return}let N={speakerId:"",name:"",role:"user",content:s,at:new Date().toISOString()};We(!0),rt(""),vn(""),qe({...I,lines:[...I.lines,N]}),Ht.current={roomId:I.id,submissionId:d};try{let z=await D("/rooms/turn",{method:"POST",body:JSON.stringify({sessionId:I.id,message:s,mode:Qr,targetId:Qr==="fulfill"?Zr:"",submissionId:d}),signal:AbortSignal.timeout(3e5)});qe(z.session),To(z.session.status==="closed"),z.session.status!=="closed"&&(Ht.current=null),So(z.recordEvents??[]),Zr&&!z.session.activeIds.includes(Zr)&&id(""),dg(z.verdict?.reason??""),ks("chat"),Ri.current=null,Mi(""),Se()}catch(z){let V=await D0(I.id,d);if(V){qe(V),To(!0),rt(""),Ri.current=null,Mi(""),Se();return}Ht.current=null;let j=zr(z);if(j){qe(null),Da(!1),_a([]),Ha.current.clear(),xo(j==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),se("home"),Se();return}qe(p),vn(s),rt(U(z,"That line could not be sent."))}finally{Jr.current=!1,We(!1)}},[Se,So,I,va,Xr,Fr,Qr,Zr]),Y1=(0,m.useCallback)(s=>(n?.villagers??[]).filter(d=>d.place?.id===s),[n]),Os=(0,m.useCallback)(s=>{Ne(null),ot(!1),Aa(s.id),pa("view"),Ot(!1),Qe(null),pt(null),se("venue")},[]),hd=(0,m.useCallback)(async s=>{We(!0),rt(""),Mi("");try{let d=await D("/rooms/greet",{method:"POST",body:JSON.stringify({sessionId:s}),signal:AbortSignal.timeout(3e4)});qe(d.session),Se()}catch(d){let p=await V0(s);p?qe(p):rt(_0(d))}finally{We(!1)}},[Se]),X1=(0,m.useCallback)(async s=>{We(!0);try{let{session:d}=await D("/rooms/continue",{method:"POST",body:JSON.stringify({sessionId:s}),signal:AbortSignal.timeout(1e4)});qe(d),Mi(d.lines.length===0?"The opening failed. You can start the conversation now.":""),rt("")}catch(d){rt(U(d,"The visit could not continue. Retry or leave the venue."))}finally{We(!1)}},[]),Pr=(0,m.useCallback)(async(s,d,p="")=>{No.current=!1,Ht.current=null,Ne(null),ot(!1),Bn(null),vn(""),To(!1),rt(""),Mi(""),_a([]),Ha.current.clear(),We(!0),qe({version:1,id:"",placeId:s.id,placeName:s.name,startedAt:"",endedAt:"",status:"opening",activeIds:[],participants:[],lines:[]}),Da(!0),se("room");try{let{session:N}=await D("/rooms",{method:"POST",body:JSON.stringify({venueId:s.id,spaceClass:d,privateOwnerId:p}),signal:AbortSignal.timeout(2e4)});qe(N),ks("chat"),id(""),dg(""),xo(""),Da(!0),Se(),N.status==="opening"&&await hd(N.id)}catch(N){rt(U(N,"That room could not be opened. Retry or leave the venue."))}finally{We(!1)}},[hd,Se]),wg=(0,m.useCallback)(s=>{ot(!1),Ne(s.id),se("home")},[]),$g=(0,m.useCallback)(()=>{Aa(null),pa("view"),Ot(!1),Qe(null),pt(null),Ne(null),se("home")},[]),Q1=(0,m.useCallback)(async()=>{G(!0),K("");try{o(await D("/settings",{method:"PATCH",body:JSON.stringify({promptKnowledge:Ze,playerPersonaId:Pe,setting:Un,selectedLorebookIds:cs,loreTokenBudget:Hu})}))}catch(s){K(U(s,"Those settings could not be saved."))}finally{G(!1)}},[Ze,cs,Hu,Pe,Un]),Z1=(0,m.useCallback)(async s=>{G(!0),K("");try{o(await D("/settings",{method:"PATCH",body:JSON.stringify({storyPace:s})}))}catch(d){K(U(d,"That could not be saved."))}finally{G(!1)}},[]),K1=(0,m.useCallback)(async s=>{let d=n?.settings.characterSpeechColors??!0;o(p=>p&&{...p,settings:{...p.settings,characterSpeechColors:s}}),G(!0),K("");try{o(await D("/settings",{method:"PATCH",body:JSON.stringify({characterSpeechColors:s})}))}catch(p){o(N=>N&&{...N,settings:{...N.settings,characterSpeechColors:d}}),K(U(p,"Character speech colors could not be saved."))}finally{G(!1)}},[n?.settings.characterSpeechColors]),xg=(0,m.useCallback)(async s=>{G(!0),K("");try{o(await D("/settings",{method:"PATCH",body:JSON.stringify({visitRetention:s})})),P(d=>d+1)}catch(d){K(U(d,"Visit retention could not be saved."))}finally{G(!1)}},[]),J1=(0,m.useCallback)(async()=>{if(!(n&&_n(n.settings.venues).length>0&&!window.confirm("Replace the current places with new suggestions? This removes places you created or approved."))){G(!0),K("");try{let s=await D("/bootstrap",{method:"POST"});fo(s.places.map(d=>({id:os(),name:d.name,description:"",category:"public",presentation:{image:null,x:null,y:null},occupancy:{playerHome:!1,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}})))}catch(s){K(U(s,"The village did not suggest any places."))}finally{G(!1)}}},[n]),F1=(0,m.useCallback)(async()=>{if(wt.trim().length===0){ge("Describe what the village is like before generating its map.");return}qr(!0),ge("");try{let s=await D("/setup/town-map/generate",{method:"POST",body:JSON.stringify({structure:bo===n?.settings.townMapLayoutPrompt?void 0:bo,negative:vo===n?.settings.townMapNegativePrompt?void 0:vo,setting:wt,options:vs,selectedLorebookIds:Ma,scenarioImprint:n?.isFounded?{origin:"",worldFacts:bn,openingConditions:[],visualCues:[]}:null})}),d=await Ep(s.image);if(d.width!==s.width||d.height!==s.height)throw new Error("The generated map's reported dimensions do not match the image.");Xu(s.image),Qu("generate"),ng(Pu),Zu(d),Ai("generate")}catch(s){ge(U(s,"The village map could not be generated."))}finally{qr(!1)}},[Ma,vo,bo,wt,vs,Pu,bn,n?.isFounded,n?.settings.townMapLayoutPrompt,n?.settings.townMapNegativePrompt]),P1=(0,m.useCallback)(async()=>{ge(""),G(!0);try{let s=await D("/setup/public-venue/names/suggest",{method:"POST",body:JSON.stringify({setting:wt,selectedLorebookIds:Ma,loreTokenBudget:go})});fs(s.names)}catch(s){ge(U(s,"The village could not suggest names for the public venue."))}finally{G(!1)}},[Ma,go,wt]),W1=(0,m.useCallback)(async s=>{if(!s||!n)return;ge("");let d=Math.floor((n.settings.townMapImageMaxLength-64)*3/4);if(s.size>d){let p=N=>Math.round(N/1e5)/10;ge(`That picture is ${p(s.size)} MB and a village map holds ${p(d)} MB. Choose a smaller copy.`);return}qr(!0);try{let p=await ls(s),N=await Ep(p);Xu(p),Qu("upload"),Zu(N),Ai("upload")}catch(p){ge(U(p,"That picture could not be used as the village map."))}finally{qr(!1)}},[n]),Ng=(0,m.useCallback)(async s=>{if(!s||!n)return;K("");let d=Math.floor((n.settings.townMapImageMaxLength-64)*3/4);if(s.size>d){let p=N=>Math.round(N/1e5)/10;K(`That picture is ${p(s.size)} MB and the village map holds ${p(d)} MB. Try a smaller copy.`);return}G(!0);try{let p=await ls(s),N=await Ep(p);ed({image:p,size:N}),Lr(Ru("cover"))}catch(p){K(U(p,"That picture could not be used as the town map."))}finally{G(!1)}},[n]),Sg=(0,m.useCallback)(async()=>{if(!n)return;let s=Va?Va.image:xs;G(!0),K("");try{o(await D("/settings",{method:"PATCH",body:JSON.stringify({townMapImage:s,townMapView:td??n.settings.townMapView})})),Ns(s),ed(null),Lr(null),ad(!1)}catch(d){K(U(d,"The town map could not be saved."))}finally{G(!1)}},[n,td,xs,Va]),Vs=(0,m.useCallback)(()=>{ed(null),Lr(null),ad(!1),K("")},[]),Tg=(0,m.useCallback)(async()=>{G(!0),K("");try{o(await D("/settings",{method:"PATCH",body:JSON.stringify({townMapImage:""})})),Ns(""),Vs()}catch(s){K(U(s,"The town map could not be taken down."))}finally{G(!1)}},[Vs]),e$=(0,m.useCallback)(async(s,d,p="")=>{if(!Ka){yo(s),Bn(null),K("");try{o(await D("/locations/venue/image",{method:"POST",body:JSON.stringify({venueId:s,spaceClass:d,privateOwnerId:p})}))}catch(N){Bn({id:s,text:U(N,"That place could not be drawn.")})}finally{yo("")}}},[Ka]),t$=(0,m.useCallback)(async(s,d,p,N="")=>{if(!(!d||!n||Ka)){yo(s),Bn(null),K("");try{let z=j=>Math.round(j/1e5)/10;if(d.size>n.settings.maxVenueImageBytes){Bn({id:s,text:`That picture is ${z(d.size)} MB and a place holds ${z(n.settings.maxVenueImageBytes)} MB. Try a smaller copy.`});return}let V=await ls(d);o(await D("/locations/venue/image",{method:"PUT",body:JSON.stringify({venueId:s,image:V,spaceClass:p,privateOwnerId:N})}))}catch(z){Bn({id:s,text:U(z,"That picture could not be kept.")})}finally{yo("")}}},[Ka,n]),a$=(0,m.useCallback)(async(s,d,p="")=>{if(!Ka){yo(s),Bn(null),K("");try{o(await D("/locations/venue/image",{method:"DELETE",body:JSON.stringify({venueId:s,spaceClass:d,privateOwnerId:p})}))}catch(N){Bn({id:s,text:U(N,"That picture could not be taken away.")})}finally{yo("")}}},[Ka]),n$=n?.settings.maxPlaces??48,Co=n?.settings.setupMaxVillagerCount??Sp,kg=(n?.settings.homeBuildings??[]).map(s=>({...s,name:n?.settings.homeBuildingNames?.[s.kind]??s.name})),i$=n&&!n.isFounded?1+Co:n$,Ds=Math.max(0,i$-_n(n?.settings.venues??[]).length),o$=(n?.settings.venues.length??0)+us.filter(s=>!n?.settings.venues.some(d=>d.id===s.id)).length,Wr=(0,m.useCallback)(s=>{let d=Dp(s);ds(d.map(p=>({id:p.id,name:p.name,form:p.form??"Home",description:p.description,x:p.presentation.x,y:p.presentation.y,building:p.occupancy.homeKind,isPlayerHome:p.occupancy.playerHome,characterId:p.occupancy.residentCharacterId}))),Uu(d[0]?.id??null),Xt(!1)},[]),Eg=(0,m.useCallback)(()=>{K(""),n&&Wr(n.settings.venues),Xa("village"),Ye("homes"),se("menu")},[Wr,n]),Cg=(0,m.useCallback)((s,d)=>{if(K(""),fa.length>=Ds||fa.length>=1+Co)return;let p=os(),N=fa.length===0;ds(z=>[...z,{id:p,name:N?"Your residence":`Residence ${z.length+1}`,form:"Home",description:"",x:s,y:d,building:null,isPlayerHome:N,characterId:null}]),Uu(p)},[fa.length,Ds,Co]),r$=(0,m.useCallback)((s,d,p)=>{let N=Be.find(V=>V.category==="public-center"),z=Gu??(hs?N?.id:void 0);if(w0({x:s,y:d},Be.filter(V=>V.id!==z).map(V=>V.presentation),p??{width:1e3,height:700,photoWidth:58,photoHeight:58})){Yu("That photograph would cover another venue. Place it a little to the side.");return}if(Yu(""),z)Ei(V=>V.map(j=>j.id===z?{...j,presentation:{...j.presentation,x:s,y:d}}:j)),Oa(z);else if(hs){let V=R0(os(),"gathering",s,d);Ei(j=>[...j,V]),Oa(V.id)}else if(Ti){let V=Be.filter(fe=>fe.classes?.includes("residence"));if(V.length>=1+Co)return;let j=R0(os(),"residence",s,d,V.length===0,V.length+1);Ei(fe=>[...fe,j]),Oa(j.id)}Ci(null),Xt(!1),ki(!1)},[Gu,Ti,hs,Co,Be]),Oi=(0,m.useCallback)((s,d)=>{Ei(p=>p.map(N=>N.id===s?d(N):N))},[]),l$=(0,m.useCallback)(s=>{Ei(d=>{let p=d.filter(N=>N.id!==s);if(!p.some(N=>N.occupancy.playerHome)){let N=p.findIndex(z=>z.classes?.includes("residence"));N>=0&&(p[N]={...p[N],occupancy:{...p[N].occupancy,playerHome:!0,residentCharacterId:null},residentIds:[]})}return p}),Oa(d=>d===s?null:d)},[]),s$=(0,m.useCallback)((s,d)=>{Cg(s,d),Xt(!1),se("menu")},[Cg]),Ag=(0,m.useCallback)((s,d)=>{n?.settings.venues.some(p=>p.id===s&&p.occupancy.residentCharacterId)||ds(p=>p.map(N=>N.id===s?{...N,...d}:N))},[n]),c$=(0,m.useCallback)(s=>{if(n?.settings.venues.some(d=>d.id===s&&d.occupancy.residentCharacterId)){K("Move the resident to another venue before removing this home.");return}ds(d=>{let p=d.filter(N=>N.id!==s);return p.length>0&&!p.some(N=>N.isPlayerHome)&&(p[0]={...p[0],isPlayerHome:!0,characterId:null}),p})},[n]),u$=(0,m.useCallback)(async()=>{if(n){if(fa.some(s=>!s.description.trim())){K("Review a description for every home before saving.");return}G(!0),K("");try{o(await D("/settings",{method:"PATCH",body:JSON.stringify({venues:qS(n.settings.venues,fa),venueScope:"homes"})})),Xt(!1)}catch(s){K(U(s,"Those homes could not be saved."))}finally{G(!1)}}},[fa,n]),d$=async s=>{if(!n)return;let d=n.villagers.find(N=>N.characterId===s.characterId)?.name,p=s.isPlayerHome?`${co(n)}'s home`:d?`${d}'s home`:B0(kg,s.building).name;G(!0),K("");try{let N=await D("/locations/venue/descriptions/draft",{method:"POST",body:JSON.stringify({venues:[{id:s.id,name:p,homeKind:s.building}]})});Ag(s.id,{description:N.descriptions[s.id]??""})}catch(N){K(U(N,"The home description could not be generated. You can write it by hand."))}finally{G(!1)}},h$=s=>{if(n?.isFounded||s===fn)return;let d=uo(fn).premise,p=!!ba.trim()&&ba!==d;Jp(s),p||Lu(uo(s).premise),Fp(""),ge("")},el=(0,m.useCallback)((s,d)=>{K(""),ge(""),rg(!1),Br(!1),$s(!1),ea(!1),F(""),gs(0),Zp(s?"":d?.village.name??""),Kp(s?"":d?.village.setting??"");let p=s?"":d?.settings.foundingReason??"",N=Mp.some(Ua=>Ua.value===p),z=N?p:p?"custom":"rebuild",V=wS[p]??p,j=d?.settings.foundingDetails??"",fe=[V,j].filter(Boolean).join(" "),Ia=fe.length>(d?.settings.foundingDetailsMaxLength??500),Ao=d?.isFounded?j:p&&!N?Ia?j:fe:s||!p?uo(z).premise:j,Vi=s?"":d?.isFounded?d.settings.foundingGuidance??"":[Ia?V:"",d?.settings.foundingGuidance??""].filter(Boolean).join(" ");Jp(z),Lu(Ao),Fp(z==="none"?"":Vi),h1(s?Np():d?.settings.scenarioImprint??Np()),Pp(s?[]:d?.settings.worldFacts??[]),fs([]);let zo=s||!d?[]:d.settings.venues.filter(Ua=>Ua.classes?.includes("residence")||Ua.category==="public-center");Ei(zo),Oa(zo[0]?.id??null),Ci(null),qn(null),Yu(""),Lp(s?[]:d?.settings.selectedLorebookIds??[]),jp(s?1600:d?.settings.loreTokenBudget??1600),ag({...A0}),Ai(s?"generate":d?.settings.townMapImageSetAt?"existing":"none"),Xu(""),Qu(null),ng(""),Zu(null),Ku(d?.settings.townMapLayoutPrompt??""),Ju(d?.settings.townMapNegativePrompt??""),qr(!1),gn(s?"":d?.settings.playerPersonaId??""),ko(),Eo(),Wr(s||!d?[]:d.settings.venues),se("setup")},[Eo,ko,Wr]),zg=(0,m.useCallback)(s=>{if(Ae===0&&s>0){if(Qa.trim().length===0){ge("Give the village a name before continuing.");return}if(wt.trim().length===0){ge("Describe what the village is like before continuing.");return}if(!n?.isFounded&&!ba.trim()){ge("Describe the village's first day before continuing.");return}}if(Ae===1&&s>1){if(!Pe.trim()){ge("Choose the Persona who lives in this village.");return}if(!Ni?.some(d=>d.id===Pe)){ge("That Persona is no longer in your library. Choose another one to continue.");return}if(Wu.length>0){ge(Wu);return}if(og){Br(!0);return}}if(Ae===2&&s>2&&ze!=="none"&&!zi){ge(ze==="generate"?"Generate the map, or choose an upload or no background image.":"Choose a map image, or select no background image.");return}if(Ae===3&&s>3){let d=Be.filter(j=>j.classes?.includes("residence")),p=d.filter(j=>!j.occupancy.playerHome),N=p.length;if(!d.some(j=>j.occupancy.playerHome)||N<z0||N>Sp||!Be.some(j=>j.category==="public-center")){ge("Place your home, one to three homes for initial villagers, and a named public meeting location.");return}let z=p.map(j=>j.occupancy.residentCharacterId).filter(Boolean);if(z.length!==p.length||new Set(z).size!==z.length){ge("Assign a different villager to each villager Residence before review.");return}let V=Be.map(j=>({venue:j,field:j.name.trim()?j.form?.trim()?j.description.trim()?j.spaces?.[0]?.description.trim()?"":"interior-description":"exterior-description":"form":"venue-name"})).find(({field:j})=>j);if(V){Oa(V.venue.id),ge(`Complete ${V.field.replaceAll("-"," ")} for ${V.venue.name||"this venue"} before continuing.`),window.setTimeout(()=>e.querySelector(`#${i}-setup-${V.field}`)?.focus(),0);return}}Br(!1),ge(""),gs(s),s===1&&ko(),s===0&&Eo(),s===3&&Ja(),Xt(!1),ki(!1),Ci(null)},[Wu,Be,og,Ja,ko,Eo,Pe,Ni,ze,zi,Qa,ba,n?.isFounded,wt,Ae,e]),m$=(0,m.useCallback)(()=>{Br(!1),ge(""),gs(2),Xt(!1),ki(!1)},[]),p$=(0,m.useCallback)(()=>{Br(!1),ge("")},[]),ve=Be.find(s=>s.id===_r)??null,tl=ve?.classes?.includes("gathering")?"gathering":"residence";(0,m.useEffect)(()=>{Wp(0),ju(!1)},[_r,tl]),(0,m.useEffect)(()=>{if(!_r||ve?.form?.trim()||eg)return;let s=window.setInterval(()=>Wp(d=>(d+1)%5),4e3);return()=>window.clearInterval(s)},[_r,ve?.form,eg]);let md=ve?nt(ve,ve.category==="public-center"?"gathering":"residence"):null,g$=s=>({id:s.id,name:s.name,form:s.form??"",description:s.description,spaceDescription:s.spaces?.[0]?.description??"",venueClass:s.classes?.includes("gathering")?"gathering":"residence",residentCharacterId:s.occupancy.residentCharacterId??""}),f$=async(s,d)=>{if(Za)return;if(!(d==="exterior"?s.description:s.spaces?.[0]?.description??"").trim()){Oa(s.id),ge(`Add an ${d} description before generating its image.`),window.setTimeout(()=>e.querySelector(`#${i}-setup-${d}-description`)?.focus(),0);return}let N=Ur;bs(!0),ge("");try{let z=await D("/setup/venue-image/generate",{method:"POST",body:JSON.stringify({venue:g$(s),area:d,villageName:Qa,setting:wt,foundingDetails:ba,scenarioImprint:n?.isFounded?d1:null,worldFacts:n?.isFounded?bn:[],selectedLorebookIds:Ma})});Fu.current===N&&qn({venueId:s.id,area:d,image:z})}catch(z){ge(U(z,"Venue art could not be generated."))}finally{bs(!1)}},b$=async(s,d,p)=>{if(!(!p||Za)){if(p.size>(n?.settings.maxVenueImageBytes??8e6)){ge("That venue image is too large. Choose a smaller file.");return}bs(!0),ge("");try{let N=await D("/setup/venue-image",{method:"PUT",body:JSON.stringify({name:s.name,image:await ls(p)})});qn({venueId:s.id,area:d,image:N})}catch(N){ge(U(N,"That venue image could not be uploaded."))}finally{bs(!1)}}},v$=()=>{if(!Hr)return;let{venueId:s,area:d,image:p}=Hr;Oi(s,N=>d==="exterior"?{...N,presentation:{...N.presentation,image:p}}:{...N,spaces:[{...nt(N,N.classes?.includes("gathering")?"gathering":"residence"),image:p}]}),qn(null)},Rg=(0,m.useCallback)(()=>{if(Qa.trim().length===0)return"Give the village a name.";if(Pe.trim().length===0)return"Choose the Persona who lives in this village.";if(!n?.isFounded&&!ba.trim())return"Describe the village's first day.";let s=bn.map(z=>z.trim()).filter(Boolean);if(n?.isFounded&&(s.length>4||s.some(z=>z.length>160)))return"Use at most four current world facts of 160 characters each.";if(wt.trim().length===0)return"Describe what the village is like.";if(ze!=="none"&&!zi)return"Choose, generate, or upload the village map.";let d=Be.filter(z=>z.classes?.includes("residence")),p=d.filter(z=>!z.occupancy.playerHome);if(p.length<z0||p.length>Sp)return"Place one to three homes for initial villagers.";if(!d.some(z=>z.occupancy.playerHome))return"One Residence has to be yours.";if(Be.some(z=>!z.name.trim()||!z.form?.trim()||!z.description.trim()||!z.spaces?.[0]?.description.trim()))return"Complete each venue's Form, Exterior Description, and Interior Description in Step 4.";let N=p.map(z=>z.occupancy.residentCharacterId).filter(z=>z!==null);return N.length!==p.length?"Choose who lives in each villager home.":new Set(N).size!==N.length?"A villager can only live in one house.":Be.filter(z=>z.category==="public-center").length!==1?"Place one Gathering Place.":""},[Be,Pe,ze,zi,Qa,ba,n?.isFounded,bn,wt]),y$=(0,m.useCallback)(async()=>{let s=Rg();if(s){let d=Be.find(p=>!p.name.trim()||!p.form?.trim()||!p.description.trim()||!p.spaces?.[0]?.description.trim());if(d){let p=d.name.trim()?d.form?.trim()?d.description.trim()?"interior-description":"exterior-description":"form":"venue-name";Oa(d.id),gs(3),window.setTimeout(()=>e.querySelector(`#${i}-setup-${p}`)?.focus(),0)}ge(s);return}G(!0),ge("");try{let d=await D("/setup",{method:"POST",body:JSON.stringify({name:Qa.trim(),setting:wt.trim(),foundingReason:n?.isFounded?n.settings.foundingReason:fn,foundingDetails:n?.isFounded?n.settings.foundingDetails:ba.trim(),foundingGuidance:n?.isFounded?n.settings.foundingGuidance:Dr.trim(),scenarioImprint:n?.isFounded?n.settings.scenarioImprint:null,worldFacts:n?.isFounded?bn.map(p=>p.trim()).filter(Boolean):[],selectedLorebookIds:Ma,loreTokenBudget:go,playerPersonaId:Pe,townMapImage:zi??"",townMapView:ze==="existing"?wo:Ru("cover"),venues:Be})});o(d),Xt(!1),se(!n?.isFounded||d.foundingPreparation?.status==="pending"||d.foundingPreparation?.status==="failed"?"preparing":"home")}catch(d){ge(U(d,"The village could not be founded."))}finally{G(!1)}},[e,Be,n?.isFounded,n?.settings.foundingReason,n?.settings.foundingDetails,n?.settings.foundingGuidance,n?.settings.scenarioImprint,Pe,wo,Rg,ze,zi,Qa,fn,ba,Dr,bn,Ma,go,wt]),w$=(0,m.useCallback)(async()=>{G(!0),K("");try{let s=await D("/setup/reset",{method:"POST"});o(s),c(null),el(!0,s)}catch(s){K(U(s,"The village could not be reset."))}finally{G(!1),$s(!1)}},[el]),Mg=(0,m.useRef)(!1);(0,m.useEffect)(()=>{!n||Mg.current||(Mg.current=!0,n.isFounded?n.foundingPreparation&&n.foundingPreparation.status!=="ready"&&se("preparing"):el(!1,n))},[el,n]),(0,m.useEffect)(()=>{if(le!=="preparing")return;let s=!1,d=async()=>{try{let N=await D("/setup/preparation");if(s)return;o(N),ws(""),(!N.foundingPreparation||N.foundingPreparation.status==="ready")&&se("home")}catch(N){s||ws(U(N,"Preparation status could not be read."))}};d();let p=window.setInterval(()=>{d()},2500);return()=>{s=!0,window.clearInterval(p)}},[le]);let $$=(0,m.useCallback)(async()=>{ws("");try{o(await D("/setup/preparation/retry",{method:"POST"}))}catch(s){ws(U(s,"Preparation could not be retried."))}},[]),x$=(0,m.useCallback)(()=>{Qe({id:os(),name:"",form:"",classes:["other"],spaces:[],residenceCapacity:1,residentIds:[],improvements:[null,null],description:"",category:"",presentation:{image:null,x:null,y:null},occupancy:{playerHome:!1,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}})},[]),N$=(0,m.useCallback)(async s=>{G(!0),K("");try{let d=n?.settings.venues.some(V=>V.id===s.id)??!1,p=Hn(s).map(V=>nt(s,V)),N=await D(d?`/locations/venue/${encodeURIComponent(s.id)}`:"/locations/venue",{method:d?"PUT":"POST",body:JSON.stringify({name:s.name,form:s.form,classes:s.classes,residenceCapacity:s.residenceCapacity,spaces:p,workerIds:s.workerIds??[],presentation:{x:s.presentation.x,y:s.presentation.y},category:s.category,description:p[0]?.description??s.description,state:{condition:p[0]?.state.condition??"",furniture:p[0]?.state.items??[],publicFacts:p[0]?.state.publicFacts??[],features:p[0]?.state.features??[]}})}),z=_n(N.settings.venues).find(V=>d?V.id===s.id:V.name.toLowerCase()===s.name.trim().toLowerCase());o(N),Qe(null),fo(V=>{let j=V.map(fe=>fe.id===s.id&&z?z:fe);return[...j,..._n(N.settings.venues).filter(fe=>!j.some(Ia=>Ia.id===fe.id))]})}catch(d){K(U(d,"That place could not be saved."))}finally{G(!1)}},[n]),S$=(0,m.useCallback)(async s=>{let d=n?.settings.venues.find(p=>p.id===s);if(!d){fo(p=>p.filter(N=>N.id!==s));return}G(!0),K("");try{let p=await D(`/locations/venue/${encodeURIComponent(s)}/dependencies`);if(p.roomPresent||p.playerHome||p.residentCharacterIds.length||p.pendingMailCount){K(p.roomPresent?"End the active visit before deleting this Venue.":p.pendingMailCount?"Resolve pending Venue decisions before deleting this Venue.":"Move every resident, including yourself, before deleting this Residence.");return}let N=p.residentCharacterIds.length+p.pendingResidenceCharacterIds.length,z=N||p.workerCharacterIds.length||p.remapCount||p.eventCount?`This place is referenced by ${N} pending moves, ${p.workerCharacterIds.length} workers, ${p.remapCount} schedule moves, and ${p.eventCount} events. Delete it?`:`Delete ${d.name}?`;if(!window.confirm(z))return;let V=await D(`/locations/venue/${encodeURIComponent(s)}`,{method:"DELETE",body:JSON.stringify({confirmed:!0})});o(V),fo(j=>j.filter(fe=>fe.id!==s))}catch(p){K(U(p,"That place could not be removed."))}finally{G(!1)}},[n]),Og=(0,m.useCallback)(async(s,d)=>{G(!0),K("");try{let p=$i[s.id]??s.venueDraft,N=await D(`/venue-requests/${encodeURIComponent(s.id)}/${d?"approve":"deny"}`,{method:"POST",body:d?JSON.stringify(p):void 0});if(o(N),d){let z=new Set(us.map(V=>V.id));fo(V=>[...V,..._n(N.settings.venues).filter(j=>!z.has(j.id))])}ss(z=>{let V={...z};return delete V[s.id],V})}catch(p){K(U(p,d?"That venue could not be approved.":"That request could not be denied."))}finally{G(!1)}},[$i,us]),T$=(0,m.useCallback)(s=>{let d=sd.current,p=d?.selectionStart??Ze.length,N=d?.selectionEnd??p;cd.current=p+s.length,Vt(`${Ze.slice(0,p)}${s}${Ze.slice(N)}`)},[Ze]),Vg=(0,m.useCallback)(async()=>{let s=ps.trim();if(s.length!==0){G(!0),K("");try{o(await D("/noticeboard",{method:"POST",body:JSON.stringify({notice:s})})),Qp("")}catch(d){K(U(d,"That notice could not be pinned up."))}finally{G(!1)}}},[ps]),k$=(0,m.useCallback)(async s=>{G(!0),K("");try{o(await D(`/noticeboard/${s}`,{method:"DELETE"}))}catch(d){K(U(d,"That notice could not be taken down."))}finally{G(!1)}},[]),_s=ce.trim().toLowerCase(),pd=(l??[]).filter(s=>_s.length===0||s.name.toLowerCase().includes(_s)||s.comment.toLowerCase().includes(_s)||s.tags.some(d=>d.toLowerCase().includes(_s))),Dg=[...(n?.villagers??[]).map(s=>s.characterId),...Ge?pd.map(s=>s.id):[]].join(`
`),_g=(0,m.useRef)(new Set);(0,m.useEffect)(()=>{let s=Dg.split(`
`).filter(p=>p.length>0&&!_g.current.has(p));if(s.length===0)return;for(let p of s)_g.current.add(p);let d=new AbortController;return(async()=>{try{let p=await VS(s,d.signal);d.signal.aborted||Vr(N=>({...N,...p}))}catch{}})(),()=>d.abort()},[Dg]);let gd=n?.settings.playerPersonaId??"";(0,m.useEffect)(()=>{if(E(null),gd.length===0)return;let s=new AbortController;return(async()=>{try{let d=await DS(gd,s.signal);s.signal.aborted||E(d)}catch{}})(),()=>s.abort()},[gd]);let It=(0,m.useCallback)(s=>s?l?.find(d=>d.id===s)?.name??n?.villagers.find(d=>d.characterId===s)?.name??"":"",[l,n]),E$=(()=>{let s=n?.settings.venues??[],d=[],p=new Map;for(let N of n?.villagers??[]){let z=N.place?.id;if(!z)continue;let V=p.get(z);V?V.push(N):p.set(z,[N])}for(let N of s){let z=rs(N);if(!z)continue;let V=N.occupancy.residentCharacterId,j=Mr(N),fe=N.occupancy.playerHome?co(n):It(V);d.push({id:N.id,x:z.x,y:z.y,text:j?JS(fe):N.name,image:N.presentation.image?.url??null,tone:j?L0({isPlayerHome:N.occupancy.playerHome,occupant:V}):"venue",selected:we===N.id,doors:we===N.id?[{label:"View venue",onSelect:()=>Os(N)},{label:"Visit",onSelect:()=>{Pr(N)}}]:void 0,onSelect:()=>wg(N)}),(p.get(N.id)??[]).forEach((Ia,Ao)=>{d.push({id:`villager:${Ia.characterId}`,x:z.x,y:z.y,dy:PS*(Ao+1),text:Ia.name,tone:"resident",kind:"person"})})}return d})(),C$=Be.flatMap(s=>{let d=rs(s);return d?[{id:s.id,x:d.x,y:d.y,text:s.name||(s.category==="public-center"?"Gathering Place":"Residence"),image:s.presentation.image?.url??null,tone:s.category==="public-center"?"venue":s.occupancy.playerHome?"player":"resident",onSelect:()=>Oa(s.id)}]:[]});if(le==="room")return(0,r.jsxs)("div",{className:`${i}-root ${i}-room-screen`,"data-mobile":t?"true":"false",children:[I?(0,r.jsx)(m2,{room:I,nameColors:n?.settings.characterSpeechColors?Object.fromEntries(n.villagers.map(s=>[s.characterId,s.nameColor])):{},speechColors:n?.settings.characterSpeechColors?Object.fromEntries(n.villagers.map(s=>[s.characterId,s.dialogueColor])):{},picture:AS(n?.settings.venues??[],I),draft:Xr,mode:Qr,targetId:Zr,busy:va,error:E1,greetingNotice:C1,ruling:S1,open:N1,ended:Fr,playerName:co(n),playerPortrait:_u??void 0,portraits:In,sprites:Object.fromEntries((n?.villagers??[]).map(s=>[s.characterId,s.sprite])),onDraft:s=>{Ri.current=null,Kr.current=null,vn(s)},onMode:s=>{Ri.current=null,ks(s)},onTarget:s=>{Ri.current=null,id(s)},onSend:()=>{Qr==="conclude"?B1():G1()},onViewVenue:()=>{Aa(I.placeId),Qe(null),se("venue"),Se()},onEnterPrivate:I.area==="shared"&&I.privateAccessOwnerId?()=>{We(!0),D("/rooms/enter-private",{method:"POST",body:JSON.stringify({sessionId:I.id,ownerId:I.privateAccessOwnerId})}).then(({session:s})=>{qe(s),Se()}).catch(s=>rt(U(s,"That private space could not be entered."))).finally(()=>We(!1))}:void 0,privateSpaceOwnerName:It(I.privateAccessOwnerId),onEnd:()=>{q1()},notices:T1,onDismissNotice:s=>_a(d=>d.filter(p=>p.id!==s)),debugDiscardEnabled:od,onDebugDiscard:()=>{j1()},onLeavePending:()=>{L1()},endFailed:be,onRetryGreeting:()=>{if(I.id)hd(I.id);else{let s=n?.settings.venues.find(d=>d.id===I.placeId);s&&Pr(s)}},onContinueWithoutGreeting:()=>{I.id&&X1(I.id)},onUseMailbox:n?.settings.venues.some(s=>s.id===I.placeId&&s.occupancy.playerHome&&(!I.spaceClass||I.spaceClass==="residence"))?()=>Yr(!0):void 0}):(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:dd,children:"Back to village"}),x1&&n?(0,r.jsx)("div",{className:`${i}-mailbox-backdrop`,onClick:()=>Yr(!1),children:(0,r.jsxs)("section",{className:`${i}-mailbox`,role:"dialog","aria-modal":"true","aria-label":"Mailbox",onClick:s=>s.stopPropagation(),children:[(0,r.jsxs)("div",{className:`${i}-row`,style:{justifyContent:"space-between"},children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Mailbox"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Yr(!1),children:"Close"})]}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Venue decisions and replies from the people affected by them."}),(0,r.jsxs)("div",{className:`${i}-mailbox-list`,children:[[...n.venueMail??[]].reverse().map(s=>(0,r.jsxs)("article",{className:`${i}-mailbox-item`,children:[(0,r.jsx)("strong",{children:s.title}),(0,r.jsx)("p",{children:s.detail}),(0,r.jsx)("p",{className:`${i}-hint`,children:s.status==="awaiting-villagers"?`Awaiting replies \xB7 due ${new Date(s.dueAt).toLocaleString()}`:s.status==="pending-player"?"Awaiting your decision":s.status==="approved"?"Approved":"Declined"}),s.decisions.map(d=>(0,r.jsxs)("p",{children:[(0,r.jsxs)("strong",{children:[It(d.characterId),":"]})," ",d.reply]},d.characterId)),s.status==="pending-player"&&s.kind==="villager-change"?(0,r.jsx)(h2,{entry:s,onDecide:async(d,p)=>{o(await D(`/venue-mail/${encodeURIComponent(s.id)}/decision`,{method:"POST",body:JSON.stringify({approved:d,...p})}))}}):null,s.error?(0,r.jsxs)("p",{className:`${i}-hint`,children:["Reply delayed: ",s.error]}):null]},s.id)),(n.venueMail?.length??0)===0&&n.venueRequests.length===0&&n.upgradeRequests.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"No Venue mail yet."}):null,n.venueRequests.map(s=>(0,r.jsxs)("article",{className:`${i}-mailbox-item`,children:[(0,r.jsxs)("strong",{children:[s.requesterName||"A villager"," suggests ",s.venueDraft.name]}),(0,r.jsx)("p",{children:s.venueDraft.classes.map(d=>d[0].toUpperCase()+d.slice(1)).join(" / ")}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Yr(!1),lt("venueRequests")},children:"Review request"})]},s.id)),n.upgradeRequests.map(s=>(0,r.jsxs)("article",{className:`${i}-mailbox-item`,children:[(0,r.jsxs)("strong",{children:[s.requesterName," suggests a home change"]}),(0,r.jsx)("p",{children:s.detail}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Yr(!1),lt("venueRequests")},children:"Review request"})]},s.id))]})]})}):null]});if(le==="venue"){let s=(n?.settings.venues??[]).find(T=>T.id===ta)??null;if(!n||!s)return(0,r.jsx)("div",{className:`${i}-root`,children:(0,r.jsxs)("header",{className:`${i}-header`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("h1",{className:`${i}-title`,children:"A place that is gone"}),(0,r.jsx)("p",{className:`${i}-subtitle`,children:"This venue is no longer in the village."})]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:$g,children:"Back to map"})]})});let d=Y1(s.id),p=Hn(s),N=s.occupancy.homeKind?B0(kg,s.occupancy.homeKind).name:"",z=s.occupancy.playerHome?co(n):It(s.occupancy.residentCharacterId),V=p.includes("residence")&&(s.residentIds?.length??0)>0,j=I?.placeId===s.id&&(I.area==="shared"||I.area==="private"),fe=I?.placeId===s.id&&I.area==="private"?I.privateOwnerId:"",Ia=s.occupancy.playerHome||s.playerSeenShared||j,Ao=(s.privateSpaces??[]).filter(T=>s.playerSeenPrivateIds?.includes(T.ownerId)||T.ownerId===fe),Vi=[...p.map(T=>({key:T,label:`${T[0].toUpperCase()}${T.slice(1)} space`,spaceClass:T,ownerId:""})),...(s.playerInvitations??[]).filter(T=>T.scope==="private"&&T.ownerId).map(T=>({key:`private:${T.ownerId}`,label:`${It(T.ownerId??"")}'s private space`,spaceClass:"residence",ownerId:T.ownerId??""}))],zo=(T,J,Q,ae="")=>(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsx)("h3",{className:`${i}-panel-title`,children:T}),J?(0,r.jsx)("img",{className:`${i}-venue-space-picture`,src:J.url,alt:`${T} at ${s.name}`}):(0,r.jsx)("div",{className:`${i}-venue-image-empty`,children:"No image yet"}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:!!Ka||_,onClick:()=>{e$(s.id,Q,ae)},children:J?"Redraw image":"Draw image"}),(0,r.jsx)("input",{className:`${i}-file`,type:"file",accept:"image/*","aria-label":`Upload ${T.toLowerCase()} image`,disabled:!!Ka||_,onChange:st=>{let al=st.target.files?.[0];st.target.value="",t$(s.id,al,Q,ae)}}),J?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:!!Ka||_,onClick:()=>{a$(s.id,Q,ae)},children:"Remove image"}):null]})]},ae||Q||"exterior"),Ua=T=>({name:T.name,form:T.form,workerIds:T.workerIds,position:{x:T.presentation.x,y:T.presentation.y},spaces:p.map(J=>{let Q=nt(T,J);return{description:Q.description,condition:Q.state.condition,items:Q.state.items,publicFacts:Q.state.publicFacts,features:Q.state.features.map(({id:ae,text:st,locked:al})=>({id:ae,text:st,locked:al}))}}),privateSpaces:T.privateSpaces?.map(J=>({ownerId:J.ownerId,description:J.description,condition:J.state.condition,items:J.state.items,publicFacts:J.state.publicFacts,features:J.state.features.map(({id:Q,text:ae,locked:st})=>({id:Q,text:ae,locked:st}))}))}),A$=!!(pe&&JSON.stringify(Ua(pe))!==JSON.stringify(Ua(s))),z$=!!(ie&&(JSON.stringify(ie.classes)!==JSON.stringify(p)||ie.capacity!==(s.residenceCapacity??1)||ie.slot!==0||ie.title||ie.description||ie.extraBeds)),R$=()=>{(Z==="edit"&&A$||Z==="proposal"&&z$)&&!window.confirm("Discard your unsaved changes?")||(pa("view"),Qe(null),pt(null),yt(""),A(""))},Hg=(T,J)=>{o(T);let Q=T.settings.venues.find(ae=>ae.id===s.id);Q&&Qe(structuredClone(Q)),A(J)},M$=async()=>{if(pe){if(V){let T=Ua(pe),J=Ua(s),Q=p.indexOf("residence");if((Q>=0&&JSON.stringify(T.spaces[Q])!==JSON.stringify(J.spaces[Q])||JSON.stringify(T.privateSpaces)!==JSON.stringify(J.privateSpaces))&&!window.confirm("Saving Venue details will discard unsaved room changes. Continue?"))return}Yt(!0),yt(""),A("");try{let T=p.map(ae=>nt(V&&ae==="residence"?s:pe,ae)),J=T[0],Q=await D(`/locations/venue/${encodeURIComponent(s.id)}`,{method:"PUT",body:JSON.stringify({name:pe.name,form:pe.form,description:V?s.description:J?.description??pe.description,spaces:T,workerIds:pe.workerIds??[],presentation:{x:pe.presentation.x,y:pe.presentation.y},state:V?s.state:{condition:J?.state.condition??"",furniture:J?.state.items??[],publicFacts:J?.state.publicFacts??[],features:J?.state.features??[]}})});Hg(Q,"Venue details saved.")}catch(T){yt(U(T,"The Venue could not be saved."))}finally{Yt(!1)}}},Ig=async(T,J="")=>{if(!pe)return;let Q=T==="private"?pe.privateSpaces?.find(st=>st.ownerId===J):nt(pe,"residence");if(!Q)return;let ae=structuredClone(pe);if(T==="shared"?ae.spaces=ae.spaces?.map(st=>st.venueClass==="residence"?nt(s,"residence"):st):ae.privateSpaces=ae.privateSpaces?.map(st=>st.ownerId===J?s.privateSpaces?.find(al=>al.ownerId===J)??st:st),!(JSON.stringify(Ua(ae))!==JSON.stringify(Ua(s))&&!window.confirm("Submitting this room edit will discard other unsaved changes. Continue?"))){Yt(!0),yt(""),A("");try{let st=await D(`/locations/venue/${encodeURIComponent(s.id)}/edit-proposals`,{method:"POST",body:JSON.stringify({target:T,ownerId:J,description:Q.description,state:Q.state})});Hg(st,`${T==="private"?"Private":"Shared"} room edit proposed.`)}catch(st){yt(U(st,"That room edit could not be proposed."))}finally{Yt(!1)}}},Ug=FS(s,z);return(0,r.jsxs)("div",{className:`${i}-root`,children:[(0,r.jsxs)("header",{className:`${i}-header`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("h1",{className:`${i}-title`,children:Z==="view"?Ug:`${Z==="edit"?"Edit Venue":"Propose Change"} \xB7 ${Ug}`}),(0,r.jsx)("p",{className:`${i}-subtitle`,children:Z==="view"?d.length===0?"Nobody is here right now":`Villagers here: ${d.map(T=>T.name).join(", ")}`:Z==="edit"?"Pictures and venue details":"Review a structural change"})]}),(0,r.jsx)("div",{className:`${i}-actions`,children:Z==="view"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Qe(structuredClone(s)),yt(""),A(""),pa("edit")},children:"Edit Venue"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{pt({classes:p,capacity:s.residenceCapacity??1,slot:0,title:"",description:"",extraBeds:0}),yt(""),A(""),pa("proposal")},children:"Propose Change"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:I?.placeId===s.id&&I.status!=="closed"?()=>se("room"):$g,children:I?.placeId===s.id&&I.status!=="closed"?"Return to scene":"Back to map"})]}):(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:R$,children:Z==="edit"?"Close Editor":"Exit Change Proposal"})})]}),Z==="view"?(0,r.jsxs)("main",{className:`${i}-venue-page`,children:[(0,r.jsxs)("section",{className:`${i}-venue-hero`,children:[s.presentation.image?(0,r.jsx)("img",{className:`${i}-venue-picture`,src:s.presentation.image.url,alt:`Exterior of ${s.name}`}):(0,r.jsx)("div",{className:`${i}-venue-image-empty`,children:"Exterior image not drawn yet"}),(0,r.jsxs)("div",{className:`${i}-venue-context`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"The place"}),s.form||N?(0,r.jsx)("p",{children:s.form||N}):null,n.village.setting?(0,r.jsx)("p",{className:`${i}-hint`,children:n.village.setting}):null,p.includes("residence")?(0,r.jsxs)("p",{className:`${i}-hint`,children:[Du(s)," / ",H0(s)," residents"]}):null,(0,r.jsx)("div",{className:`${i}-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:va,"aria-expanded":Vi.length>1?ga:void 0,onClick:()=>{if(Vi.length===1){let T=Vi[0];Pr(s,T.spaceClass,T.ownerId)}else Ot(T=>!T)},children:va?"Opening visit\u2026":"Visit Venue"})}),ga&&Vi.length>1?(0,r.jsxs)("div",{className:`${i}-venue-visit-picker`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Choose a space"}),Vi.map(T=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:va,onClick:()=>{Ot(!1),Pr(s,T.spaceClass,T.ownerId)},children:T.label},T.key))]}):null,p.includes("residence")&&!s.occupancy.playerHome?(0,r.jsx)("p",{className:`${i}-hint`,children:"You can speak from outside. Entering a resident's home requires an invitation."}):null]})]}),p.includes("residence")&&!Ia?(0,r.jsx)("p",{className:`${i}-hint`,children:"The shared Residence space appears after you enter with an invitation."}):null,(0,r.jsxs)("div",{className:`${i}-venue-space-grid`,children:[p.filter(T=>T!=="residence"||Ia).map(T=>{let J=nt(s,T);return(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:T==="residence"?"Shared Residence space":`${T[0].toUpperCase()}${T.slice(1)} space`}),J.image?(0,r.jsx)("img",{className:`${i}-venue-space-picture`,src:J.image.url,alt:`${T} space at ${s.name}`}):(0,r.jsx)("div",{className:`${i}-venue-image-empty`,children:"Image not drawn yet"}),J.description?(0,r.jsx)("p",{className:`${i}-venue-beat`,children:J.description}):null,J.state.condition?(0,r.jsxs)("p",{className:`${i}-hint`,children:["Condition now: ",J.state.condition]}):null,J.state.items.length?(0,r.jsxs)("p",{className:`${i}-hint`,children:["Present items: ",J.state.items.join(", ")]}):null,J.state.publicFacts.length?(0,r.jsxs)("p",{className:`${i}-hint`,children:["Established facts: ",J.state.publicFacts.join(" \xB7 ")]}):null,J.state.features.length?(0,r.jsxs)("p",{className:`${i}-hint`,children:["Defining features: ",J.state.features.map(Q=>Q.text).join(" \xB7 ")]}):null]},T)}),Ao.map(T=>(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsxs)("h2",{className:`${i}-panel-title`,children:[It(T.ownerId),"'s private space"]}),T.image?(0,r.jsx)("img",{className:`${i}-venue-space-picture`,src:T.image.url,alt:`${It(T.ownerId)}'s private space`}):(0,r.jsx)("div",{className:`${i}-venue-image-empty`,children:"Image not drawn yet"}),T.description?(0,r.jsx)("p",{className:`${i}-venue-beat`,children:T.description}):null,T.adaptationPending?(0,r.jsx)("p",{className:`${i}-hint`,children:"This room is still being adapted after a move."}):null]},T.ownerId))]}),(s.editProposals??[]).map(T=>(0,r.jsxs)("p",{className:`${i}-hint`,children:["Proposed ",T.target," room edit:"," ",T.declined?"declined or stale":`approved by ${T.approvedIds.length} of ${T.requiredIds.length} residents`]},T.id)),p.includes("residence")&&!s.occupancy.playerHome?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{D(`/locations/venue/${encodeURIComponent(s.id)}/player-move`,{method:"POST"}).then(o).catch(T=>yt(U(T,"The move could not be requested.")))},children:"Request to live here"}):null,Ra?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Ra}):null]}):Z==="edit"?(0,r.jsxs)("main",{className:`${i}-venue-editor-page`,children:[(0,r.jsxs)("div",{className:`${i}-venue-space-grid`,children:[zo("Exterior image",s.presentation.image),p.filter(T=>T!=="residence"||Ia).map(T=>zo(T==="residence"?"Shared Residence image":`${T} space image`,nt(s,T).image,T)),Ao.map(T=>zo(`${It(T.ownerId)}'s private image`,T.image,"residence",T.ownerId))]}),Ka===s.id?(0,r.jsx)("p",{className:`${i}-hint`,children:"Drawing or saving the image\u2026"}):null,sg?.id===s.id?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:sg.text}):null,pe?(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Venue details"}),(0,r.jsx)(I0,{draft:pe,existing:!0,villagers:n.villagers,editableClasses:p.filter(T=>T!=="residence"||!V||j),onChange:Qe}),V?(0,r.jsx)("p",{className:`${i}-hint`,children:"Save Venue details updates the public fields. Changes to the shared Residence room require a separate proposal during an invited visit."}):null,(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:za||!pe.name.trim(),onClick:()=>{M$()},children:"Save Venue details"}),V&&j?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:za||!nt(pe,"residence").description.trim(),onClick:()=>{Ig("shared")},children:"Propose shared room edit"}):null]}),V&&!j?(0,r.jsx)("p",{className:`${i}-hint`,children:"Enter with a resident's invitation to propose changes to the shared room's contents."}):null]}):null,fe&&pe?.privateSpaces?.filter(T=>T.ownerId===fe).map(T=>(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsxs)("h2",{className:`${i}-panel-title`,children:["Propose changes to ",It(T.ownerId),"'s private space"]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Scene description",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:T.description,onChange:J=>Qe(Q=>Q&&{...Q,privateSpaces:Q.privateSpaces?.map(ae=>ae.ownerId===T.ownerId?{...ae,description:J.target.value}:ae)})})]}),(0,r.jsxs)("details",{className:`${i}-venue-scene-details`,children:[(0,r.jsx)("summary",{children:"Scene details"}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Physical state used during visits and for this room's image. These facts stay private until the player enters this room."}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Condition now"," ",(0,r.jsx)("span",{className:`${i}-hint`,children:"For example, a broken shutter or a repaired floor."}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:T.state.condition,onChange:J=>Qe(Q=>Q&&{...Q,privateSpaces:Q.privateSpaces?.map(ae=>ae.ownerId===T.ownerId?{...ae,state:{...ae.state,condition:J.target.value}}:ae)})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Present items \xB7 one per line"," ",(0,r.jsx)("span",{className:`${i}-hint`,children:"Objects physically in this room."}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:T.state.items.join(`
`),onChange:J=>Qe(Q=>Q&&{...Q,privateSpaces:Q.privateSpaces?.map(ae=>ae.ownerId===T.ownerId?{...ae,state:{...ae.state,items:J.target.value.split(`
`)}}:ae)})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Established facts \xB7 one per line"," ",(0,r.jsx)("span",{className:`${i}-hint`,children:"Durable truths about this room."}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:T.state.publicFacts.join(`
`),onChange:J=>Qe(Q=>Q&&{...Q,privateSpaces:Q.privateSpaces?.map(ae=>ae.ownerId===T.ownerId?{...ae,state:{...ae.state,publicFacts:J.target.value.split(`
`)}}:ae)})})]})]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:za||!T.description.trim(),onClick:()=>{Ig("private",T.ownerId)},children:"Propose private room edit"})]},T.ownerId)),V&&(s.residentIds?.length??0)>0?(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Resident moves"}),(0,r.jsxs)("select",{value:B,onChange:T=>ue(T.target.value),"aria-label":"Destination for resident move",children:[(0,r.jsx)("option",{value:"",children:"Choose a Residence with an available bed"}),n.settings.venues.filter(T=>T.id!==s.id&&Hn(T).includes("residence")&&Du(T)<H0(T)).map(T=>(0,r.jsx)("option",{value:T.id,children:T.name},T.id))]}),(s.residentIds??[]).map(T=>{let J=n.residences.find(Q=>Q.characterId===T&&Q.status!=="current");return(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("strong",{children:It(T)}),J?(0,r.jsx)("span",{className:`${i}-hint`,children:J.status==="moving"?"Moving":"Awaiting consent"}):(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:!B||za,onClick:()=>{Yt(!0),D("/residences/proposals",{method:"POST",body:JSON.stringify({characterId:T,venueId:B})}).then(o).catch(Q=>yt(U(Q,"The move could not be requested."))).finally(()=>Yt(!1))},children:"Ask to move"})]},T)})]}):null,pn?(0,r.jsx)("p",{className:`${i}-hint`,role:"status",children:pn}):null,Ra?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Ra}):null]}):(0,r.jsx)("main",{className:`${i}-venue-proposal-page`,children:(0,r.jsxs)("section",{className:`${i}-venue-card`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Propose a Venue change"}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Residents and workers affected by a structural change will reply in your Mailbox. A vacant Venue changes after you submit the reviewed terms."}),ie?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Classes \xB7 choose up to two"}),(0,r.jsx)("div",{className:`${i}-row`,children:t1.map(T=>(0,r.jsxs)("label",{className:`${i}-label`,children:[(0,r.jsx)("input",{type:"checkbox",checked:ie.classes.includes(T),disabled:!ie.classes.includes(T)&&ie.classes.length>=2,onChange:J=>pt(Q=>Q&&{...Q,classes:J.target.checked?[...Q.classes,T]:Q.classes.filter(ae=>ae!==T)})})," ",T]},T))})]}),ie.classes.includes("residence")?(0,r.jsxs)("label",{className:`${i}-label`,children:["Base capacity \xB7 includes you",(0,r.jsx)("input",{className:`${i}-notice-input`,type:"number",min:1,max:4,value:ie.capacity,onChange:T=>pt({...ie,capacity:Number(T.target.value)})})]}):null,(0,r.jsxs)("label",{className:`${i}-label`,children:["Improvement slot",(0,r.jsxs)("select",{value:ie.slot,onChange:T=>pt({...ie,slot:Number(T.target.value)}),children:[(0,r.jsxs)("option",{value:0,children:["Slot 1 \xB7 ",s.improvements?.[0]?.title??"empty"]}),(0,r.jsxs)("option",{value:1,children:["Slot 2 \xB7 ",s.improvements?.[1]?.title??"empty"]})]})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Improvement title \xB7 leave empty for a Class or capacity proposal",(0,r.jsx)("input",{className:`${i}-notice-input`,value:ie.title,onChange:T=>pt({...ie,title:T.target.value}),placeholder:"A second sleeping alcove"})]}),ie.title?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("label",{className:`${i}-label`,children:["What changes in the story?",(0,r.jsx)("textarea",{className:`${i}-textarea`,value:ie.description,onChange:T=>pt({...ie,description:T.target.value})})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Extra beds \xB7 optional mechanical effect",(0,r.jsx)("input",{className:`${i}-notice-input`,type:"number",min:0,max:3,value:ie.extraBeds,onChange:T=>pt({...ie,extraBeds:Number(T.target.value)})})]})]}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:za||ie.classes.length<1||ie.title.trim().length>0&&!ie.description.trim(),onClick:()=>{Yt(!0),yt(""),D(`/locations/venue/${encodeURIComponent(s.id)}/proposals`,{method:"POST",body:JSON.stringify({classes:ie.classes,capacity:ie.capacity,...ie.title.trim()?{slot:ie.slot,improvement:{title:ie.title,description:ie.description,extraBeds:ie.extraBeds}}:{},title:ie.title||`Change ${s.name}`,detail:ie.description||`Change Venue Classes or capacity at ${s.name}.`})}).then(T=>{o(T),pt(null),A("Proposal submitted.")}).catch(T=>yt(U(T,"The proposal could not be saved."))).finally(()=>Yt(!1))},children:"Submit proposal"})]}):(0,r.jsx)("p",{className:`${i}-hint`,role:"status",children:pn||"Proposal submitted."}),Ra?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Ra}):null]})})]})}if(le==="menu")return(0,r.jsxs)("div",{className:`${i}-root ${i}-sectioned-menu`,"data-section":Ct,"data-mobile":t,children:[(0,r.jsxs)("header",{className:`${i}-header`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("h1",{className:`${i}-title`,children:{index:"Menu",general:"General Settings",village:"Village Settings",debug:"DEBUG Settings",noticeboard:"Noticeboard"}[Ct]}),t?null:(0,r.jsx)("p",{className:`${i}-subtitle`,children:"Everything you can change about the village lives here, away from the village itself."})]}),(0,r.jsx)("div",{className:`${i}-actions`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:Ct!=="index"?()=>Xa("index"):dd,children:Ct!=="index"?"Back to menu":"Back to the village"})})]}),Gr?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Gr}):null,(0,r.jsx)("nav",{className:`${i}-mobile-menu-nav`,"aria-label":"Village menu",children:Ct==="index"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>lt("general"),children:"General Settings"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>lt("village"),children:"Village Settings"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>lt("story"),children:"DEBUG Settings"})]}):Ct==="village"?(0,r.jsx)(r.Fragment,{children:[["villagers","Villagers"],["venueRequests","Venue Requests"],["homes","Homes"],["map","Town map"],["village","Village Settings"]].map(([s,d])=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,"data-active":X===s,onClick:()=>s==="homes"?Eg():lt(s),children:d},s))}):Ct==="debug"?(0,r.jsxs)(r.Fragment,{children:[[["story","Village Story"],["replyGuidance","Villager reply guidance"],["chatlogs","Venue Visits"],["agendas","Villager Wishes"],["schedules","Villager Agendas"]].map(([s,d])=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,"data-active":X===s,onClick:()=>lt(s),children:d},s)),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:!n||_||As,onClick:()=>{fg()},children:"Force Village Update"}),(0,r.jsx)("p",{className:`${i}-status`,children:K0}),Es?(0,r.jsx)("p",{className:`${i}-status`,role:"status",children:Es}):null]}):null}),(0,r.jsxs)("nav",{className:`${i}-menu-nav`,"aria-label":"Everything you can change",children:[(0,r.jsxs)("div",{className:`${i}-menu-group`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Village Management"}),(0,r.jsxs)("div",{className:`${i}-menu-group-buttons`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":X==="villagers","data-active":X==="villagers"?"true":"false",disabled:!n||_,onClick:()=>lt("villagers"),children:`Villagers (${n?.villagers.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":X==="noticeboard","data-active":X==="noticeboard"?"true":"false",disabled:!n||_,onClick:()=>lt("noticeboard"),children:`Noticeboard (${n?.noticeboard.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":X==="venueRequests","data-active":X==="venueRequests"?"true":"false",disabled:!n||_,onClick:()=>lt("venueRequests"),children:`Venue Requests (${(n?.venueRequests?.length??0)+(n?.upgradeRequests?.length??0)+(n?.residences?.filter(s=>s.status==="pending"&&s.requestedBy==="villager").length??0)})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":X==="homes","data-active":X==="homes"?"true":"false",disabled:!n||_,onClick:Eg,children:`Homes (${Dp(n?.settings.venues??[]).length})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":X==="map","data-active":X==="map"?"true":"false",disabled:!n||_,onClick:()=>lt("map"),children:"Town map"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":X==="village","data-active":X==="village"?"true":"false",onClick:()=>lt("village"),children:"Village Settings"})]})]}),(0,r.jsxs)("div",{className:`${i}-menu-group`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"General Settings"}),(0,r.jsx)("div",{className:`${i}-menu-group-buttons`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":X==="general","data-active":X==="general"?"true":"false",onClick:()=>lt("general"),children:"General settings"})})]}),(0,r.jsxs)("div",{className:`${i}-menu-group`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Debug"}),(0,r.jsxs)("div",{className:`${i}-menu-group-buttons`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":X==="replyGuidance","data-active":X==="replyGuidance"?"true":"false",disabled:!n||_,onClick:()=>lt("replyGuidance"),children:"DEBUG: Villager reply guidance"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":X==="story","data-active":X==="story"?"true":"false",disabled:!n||_,onClick:()=>lt("story"),children:`DEBUG: Village Story (${u?.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":X==="chatlogs","data-active":X==="chatlogs"?"true":"false",disabled:!n||_,onClick:()=>lt("chatlogs"),children:`DEBUG: Venue Visits (${k?.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":X==="agendas","data-active":X==="agendas"?"true":"false",disabled:!n||_,onClick:()=>lt("agendas"),children:`DEBUG: Villager Wishes (${q?.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":X==="schedules","data-active":X==="schedules"?"true":"false",disabled:!n||_,onClick:()=>lt("schedules"),children:`Villager Agendas (${q?.length??0})`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:!n||_||As,onClick:()=>{fg()},children:"Force Village Update"})]}),(0,r.jsx)("p",{className:`${i}-status`,children:K0}),Es?(0,r.jsx)("p",{className:`${i}-status`,role:"status",children:Es}):null]})]}),X==="general"?(0,r.jsxs)("section",{className:`${i}-panel`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"General settings"}),(0,r.jsx)(Rp,{}),n?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsxs)("label",{className:`${i}-row`,htmlFor:`${i}-speech-colors`,children:[(0,r.jsx)("input",{id:`${i}-speech-colors`,type:"checkbox",checked:n.settings.characterSpeechColors,disabled:_,onChange:s=>{K1(s.target.checked)}}),(0,r.jsx)("span",{children:"Character chat colors"})]}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Show names and spoken words in the colors captured from each villager\u2019s card. Use Compare card and Apply refresh to adopt later color changes."})]}):null,n?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-story-pace`,children:"Story pace"}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Village time follows your device clock. When Marinara reopens, the village reconstructs elapsed life from its last saved instant. Story pace controls the visual Events feed only; its prose does not affect narration or village state. Schedules and other rule-driven state always advance."}),(0,r.jsx)("select",{id:`${i}-story-pace`,value:n.settings.storyPace,disabled:_,onChange:s=>{Z1(s.target.value)},children:n.settings.storyPaces.map(s=>(0,r.jsx)("option",{value:s,children:s.charAt(0).toUpperCase()+s.slice(1)},s))}),(0,r.jsx)("span",{className:`${i}-hint`,children:IS(n.settings.storyPace)})]}):null,n?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-visit-retention`,children:"Visit transcripts"}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Exact visit logs are kept forever by default. Automatic cleanup skips visits with memory pending and keeps filed memories and world changes."}),(0,r.jsxs)("select",{id:`${i}-visit-retention`,value:n.settings.visitRetention.mode,disabled:_,onChange:s=>{let d=s.target.value;xg({mode:d,value:d==="count"?100:d==="days"?365:0})},children:[(0,r.jsx)("option",{value:"forever",children:"Keep forever"}),(0,r.jsx)("option",{value:"count",children:"Keep latest visits"}),(0,r.jsx)("option",{value:"days",children:"Retire after days"})]}),n.settings.visitRetention.mode!=="forever"?(0,r.jsx)("input",{type:"number","aria-label":n.settings.visitRetention.mode==="count"?"Number of visits to keep":"Days to keep visits",min:n.settings.visitRetention.mode==="count"?1:30,max:n.settings.visitRetention.mode==="count"?1e3:3650,defaultValue:n.settings.visitRetention.value,onBlur:s=>{let d=Number(s.target.value);d!==n.settings.visitRetention.value&&xg({mode:n.settings.visitRetention.mode,value:d})}},`${n.settings.visitRetention.mode}:${n.settings.visitRetention.value}`):null]}):null,(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("p",{className:`${i}-empty`,children:"Revisit the founding setup to update the village as it stands now. Its original first day stays in the founding record."}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_||!n,onClick:()=>el(!1,n),children:"Run setup again"}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Keeps your villagers, their conversations and anything you have written."})]})]}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Starting over"}),(0,r.jsx)("p",{className:`${i}-empty`,children:"This is not the same thing. It takes the village apart completely \u2014 the villagers, their conversations, the places, the noticeboard, your own details and the map \u2014 and hands you an empty one. There is no way back."}),(0,r.jsx)("div",{className:`${i}-row`,children:y1?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-danger`,disabled:_,onClick:()=>{w$()},children:"Yes, empty the village"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>$s(!1),children:"Keep it"})]}):(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_||!n,onClick:()=>$s(!0),children:"Reset the village and start over"})})]}),_t?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:_t}):null]}):X==="village"?(0,r.jsxs)("div",{className:`${i}-menu-body`,children:[n?(0,r.jsxs)("section",{className:`${i}-panel`,children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Village settings"}),(0,r.jsx)("p",{className:`${i}-empty`,children:"These choices belong to this village. Narration style shapes scene prose; resident cards shape their dialogue. Village knowledge is refreshed for every reply."}),(0,r.jsx)(l2,{}),t?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Map background image"}),Ss?(0,r.jsx)("img",{className:`${i}-mobile-map-preview`,src:Ss,alt:"Current village map background"}):(0,r.jsx)("p",{className:`${i}-empty`,children:"The map has no background image."}),(0,r.jsx)("input",{className:`${i}-file`,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",disabled:_,"aria-label":"Choose a town map picture",onChange:s=>{let d=s.target.files?.[0];s.target.value="",Ng(d)}}),Va?(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>{Sg()},children:"Use this map"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:Vs,children:"Cancel"})]}):n.settings.townMapImageSetAt?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>{Tg()},children:"Remove background image"}):null]}):null,(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setting`,children:"What is this village like?"}),(0,r.jsx)("textarea",{id:`${i}-setting`,className:`${i}-textarea ${i}-off`,value:Un,maxLength:n.settings.settingMaxLength,placeholder:"A cliffside fishing town where the boats go out before dawn\u2026",disabled:!0,onChange:s=>Up(s.target.value)}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"Read-only here. Change the village description on World & First Day in the founding wizard. This description still guides what villagers know about their home."})]}),(0,r.jsx)(X0,{books:Iu,error:Gp,selected:cs,onChange:qp,disabled:_}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-lore-budget`,children:"Lorebook token budget"}),(0,r.jsx)("input",{id:`${i}-lore-budget`,className:`${i}-notice-input`,type:"number",min:n.settings.loreTokenBudgetMin,max:n.settings.loreTokenBudgetMax,step:100,value:Hu,disabled:_,onChange:s=>Bp(Number(s.target.value))}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Maximum approximate lore tokens in future text generation. Image prompts keep a separate short excerpt."})]}),(0,r.jsxs)("section",{className:`${i}-field`,children:[(0,r.jsxs)("div",{className:`${i}-row`,style:{justifyContent:"space-between"},children:[(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Venues"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:x$,disabled:_||o$>=n.settings.maxPlaces,children:"Create Venue"})]}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Each Venue is one unique place. Its Form describes what it is; one or two Classes describe what people do there."}),(0,r.jsx)("input",{className:`${i}-notice-input`,type:"search",value:Xp,onChange:s=>s1(s.target.value),placeholder:"Find a Venue by name, Form, or Class","aria-label":"Search Venues"}),(0,r.jsx)("div",{className:`${i}-notice-add`,children:n.settings.venues.filter(s=>`${s.name} ${s.form??""} ${Hn(s).join(" ")}`.toLowerCase().includes(Xp.toLowerCase())).map(s=>(0,r.jsxs)("div",{className:`${i}-notice-row`,children:[(0,r.jsx)("strong",{children:s.name||"Unnamed Residence"}),(0,r.jsx)("span",{className:`${i}-hint`,children:[s.form,Hn(s).join(" + ")].filter(Boolean).join(" \xB7 ")}),Hn(s).includes("residence")?(0,r.jsxs)("span",{className:`${i}-hint`,children:[(s.residentIds?.length??+!!s.occupancy.residentCharacterId)+Number(s.occupancy.playerHome)," ","/ ",s.residenceCapacity??1," residents"]}):null,(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Os(s),children:"View Venue"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Qe(structuredClone(s)),children:"Edit"}),(0,r.jsx)("button",{type:"button",className:`${i}-remove`,onClick:()=>{S$(s.id)},"aria-label":`Delete ${s.name}`,disabled:_,children:"\xD7"})]})]},s.id))}),pe?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("h3",{className:`${i}-panel-title`,children:n.settings.venues.some(s=>s.id===pe.id)?"Edit Venue":"Create Venue"}),(0,r.jsx)(I0,{draft:pe,existing:n.settings.venues.some(s=>s.id===pe.id),villagers:n.villagers,onChange:Qe}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_||!pe.name.trim()||!Hn(pe).every(s=>nt(pe,s).description.trim()),onClick:()=>{N$(pe)},children:"Save Venue"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Qe(null),children:"Cancel"})]})]}):null,(0,r.jsx)("div",{className:`${i}-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{J1()},disabled:_,children:"Suggest Venues"})}),us.filter(s=>!n.settings.venues.some(d=>d.id===s.id)).map(s=>(0,r.jsxs)("div",{className:`${i}-notice-row`,children:[(0,r.jsx)("strong",{children:s.name}),(0,r.jsx)("span",{className:`${i}-hint`,children:s.form}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Qe(s),children:"Review suggestion"})]},s.id))]}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-knowledge`,children:"The information villagers know"}),(0,r.jsx)("textarea",{id:`${i}-knowledge`,ref:sd,className:`${i}-preset`,value:Ze,maxLength:n.settings.promptBoxMaxLength,spellCheck:!1,onChange:s=>Vt(s.target.value)}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"What a villager here knows, written as tokens the village fills in for itself: the time, the weather, who else lives here, what is on the noticeboard. Because it is written out fresh on every reply, a villager here is always current \u2014 and because it is only these tokens, adding a place or pinning a note reaches every villager without anything being edited here. A resident's card and the DEBUG Villager reply guidance govern how they respond."}),(0,r.jsx)("div",{className:`${i}-macros`,children:n.settings.macros.map(s=>(0,r.jsx)("button",{type:"button",className:`${i}-macro`,title:`${s.label} \u2014 ${s.help}`,onClick:()=>T$(s.token),children:s.token},s.token))}),(0,r.jsxs)("p",{className:`${i}-macro-help`,children:["Click a token to drop it in at the cursor of the box. A token with nothing behind it turns into nothing at all, so ",(0,r.jsx)("code",{children:"{{lore}}"})," can sit in the prompt until there is lore to put there."]})]}),(0,r.jsx)(o2,{idPrefix:"settings",personas:Ni,draft:Pe,onDraft:gn,storedId:n.settings.playerPersonaId,storedName:n.settings.playerPersonaName,storedMissing:n.settings.playerPersonaMissing,disabled:_}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Q1()},disabled:_,children:"Save settings"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Vt(n.settings.defaultPromptKnowledge)},disabled:_,children:"Restore the default box"}),(0,r.jsx)("span",{className:`${i}-hint`,children:Ze===n.settings.promptKnowledge&&Pe===n.settings.playerPersonaId&&Un===n.settings.setting&&JSON.stringify(cs)===JSON.stringify(n.settings.selectedLorebookIds)?"No unsaved settings changes. Save places individually.":"Unsaved settings changes. Save places individually."})]})]}):null,_t?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:_t}):null]}):(0,r.jsxs)("div",{className:`${i}-menu-body`,children:[X==="villagers"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Villagers"})}),(0,r.jsxs)("nav",{className:`${i}-villager-submenu`,"aria-label":"Villagers sections",children:[(0,r.jsxs)("button",{type:"button","data-active":x==="residents","aria-pressed":x==="residents",onClick:()=>f("residents"),children:[(0,r.jsx)("span",{children:"Residents"}),(0,r.jsxs)("small",{children:[n?.villagers.length??0," living here"]})]}),(0,r.jsxs)("button",{type:"button","data-active":x==="memories","aria-pressed":x==="memories",onClick:()=>{f("memories"),C(null),Rs()},children:[(0,r.jsx)("span",{children:"Memories"}),(0,r.jsx)("small",{children:"Passing, durable & evidence"})]})]}),x==="residents"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("p",{className:`${i}-empty`,children:"Characters from your library live here. Moving someone out forgets nothing about the character card itself."}),(0,r.jsx)("div",{className:`${i}-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>ea(s=>!s),disabled:_,children:Ge?"Close the list":"Add a villager"})}),Ge?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("input",{className:`${i}-search`,type:"search",value:ce,onChange:s=>F(s.target.value),placeholder:"Search by name, note or tag\u2026","aria-label":"Search your character library"}),l===null?(0,r.jsx)("p",{className:`${i}-empty`,style:{marginTop:".625rem"},children:"Reading your library\u2026"}):pd.length===0?(0,r.jsx)("p",{className:`${i}-empty`,style:{marginTop:".625rem"},children:"No characters match that search."}):(0,r.jsx)("div",{className:`${i}-picker-list`,children:pd.map(s=>(0,r.jsxs)("div",{className:`${i}-picker-item`,"data-resident":s.inVillage?"true":"false",children:[(0,r.jsx)(ho,{portrait:In[s.id],name:s.name,className:`${i}-avatar`}),(0,r.jsxs)("div",{className:`${i}-picker-text`,children:[(0,r.jsx)("div",{className:`${i}-villager-name`,children:s.name}),(0,r.jsx)("div",{className:`${i}-villager-role`,children:s.comment||s.tags.slice(0,3).join(" \xB7 ")}),s.summary?(0,r.jsx)("p",{className:`${i}-tile-summary`,children:s.summary}):null]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{_1(s.id)},disabled:_||s.inVillage,children:s.inVillage?"Lives here":"Move in"})]},s.id))})]}):null,n&&n.villagers.length>0?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("div",{className:`${i}-villagers`,children:n.villagers.map(s=>(0,r.jsx)(c2,{villager:s,portrait:In[s.characterId],selected:!1,onSelect:!s.place||I!==null?void 0:()=>{let d=n.settings.venues.find(p=>p.id===s.place?.id);d&&wg(d)}},s.characterId))}),(0,r.jsx)("div",{className:`${i}-roster`,children:n.villagers.map(s=>(0,r.jsxs)("div",{className:`${i}-roster-entry`,children:[(0,r.jsxs)("div",{className:`${i}-roster-row`,children:[(0,r.jsxs)("div",{children:[(0,r.jsx)("span",{className:`${i}-villager-name`,children:s.name}),s.missing?(0,r.jsx)("span",{className:`${i}-badge`,children:"card missing"}):null,aa[s.characterId]?(0,r.jsx)("div",{className:`${i}-tile-summary`,children:aa[s.characterId].changed?`New card: ${aa[s.characterId].proposed?.name??"unavailable"}`:aa[s.characterId].sourceAvailable?`Snapshot revision ${aa[s.characterId].current.revision} is current.`:"The saved snapshot remains playable; the source card is unavailable."}):null]}),(0,r.jsxs)("span",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Or(At===s.characterId?null:s.characterId),"aria-expanded":At===s.characterId,children:At===s.characterId?"Close sprite studio":`Sprites \xB7 ${s.sprite?.images.length??0} approved`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{I1(s.characterId)},disabled:_||mo.length>0,children:"Compare card"}),aa[s.characterId]?.changed&&aa[s.characterId]?.sourceAvailable?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{U1(s.characterId)},disabled:_||mo.length>0,children:"Apply refresh"}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{H1(s.characterId)},disabled:_||mo.length>0,children:"Move out"})]})]}),At===s.characterId?(0,r.jsx)(d2,{villager:s,onSaved:o}):null]},s.characterId))})]}):(0,r.jsx)("p",{className:`${i}-empty`,children:"Nobody lives here yet. If you have just founded the village, the people you named are on their way."})]}):(0,r.jsx)(TS,{library:b,busy:_,onRefresh:()=>{C(null),Rs()},onForget:(s,d)=>{A1(s,d)}})]}):null,X==="noticeboard"&&n?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Noticeboard"})}),n.noticeboard.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Nothing is pinned up. Anything you add here is something the villagers can bring up in conversation \u2014 and they will pin notes of their own up as time goes on."}):(0,r.jsx)("ul",{className:`${i}-notices`,children:n.noticeboard.map((s,d)=>(0,r.jsxs)("li",{className:`${i}-notice-row`,children:[(0,r.jsxs)("span",{children:[s.author.length>0?(0,r.jsx)("span",{className:`${i}-notice-author`,children:`${s.author}: `}):null,s.text]}),(0,r.jsx)("button",{type:"button",className:`${i}-remove`,onClick:()=>{k$(d)},disabled:_,"aria-label":`Take down: ${s.text}`,children:"\xD7"})]},`${d}:${s.text}`))}),(0,r.jsxs)("div",{className:`${i}-notice-add`,children:[(0,r.jsx)("input",{className:`${i}-notice-input`,type:"text",value:ps,maxLength:n.settings.maxNoticeLength,placeholder:"Pin up a rumour, an event, a rule\u2026","aria-label":"New noticeboard note",onChange:s=>Qp(s.target.value),onKeyDown:s=>{s.key==="Enter"&&(s.preventDefault(),Vg())}}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Vg()},disabled:_||ps.trim().length===0||n.noticeboard.length>=n.settings.maxNoticeboardNotes,children:`Pin it up (${n.noticeboard.length}/${n.settings.maxNoticeboardNotes})`})]})]}):null,X==="venueRequests"&&n?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Venue Requests"})}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"Villagers can ask for places in conversation or during village life. A place joins the village only when you approve it here. Taking down a notice does not change a request."}),n.venueRequests.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Nobody has requested a new place."}):(0,r.jsx)("ul",{className:`${i}-notices`,children:n.venueRequests.map(s=>{let d=$i[s.id]??s.venueDraft,p=N=>ss(z=>({...z,[s.id]:{...d,...N}}));return(0,r.jsx)("li",{className:`${i}-notice-row`,children:(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("strong",{children:s.requesterName||"A villager"}),(0,r.jsx)("span",{className:`${i}-hint`,children:` \xB7 ${s.source==="chat"?"Conversation":"Village life"}`}),(0,r.jsx)("input",{className:`${i}-notice-input`,value:d.name,maxLength:n.settings.maxVenueNameLength,"aria-label":`Requested place name from ${s.requesterName||"villager"}`,onChange:N=>p({name:N.target.value})}),(0,r.jsxs)("select",{className:`${i}-notice-input`,value:d.classes[0]??"gathering","aria-label":`Requested place class from ${s.requesterName||"villager"}`,onChange:N=>p({classes:[N.target.value]}),children:[(0,r.jsx)("option",{value:"residence",children:"Residence"}),(0,r.jsx)("option",{value:"gathering",children:"Gathering"}),(0,r.jsx)("option",{value:"workplace",children:"Workplace"}),(0,r.jsx)("option",{value:"other",children:"Other"})]}),(0,r.jsx)("textarea",{className:`${i}-textarea`,value:d.description??"",maxLength:1e3,"aria-label":`Requested place description from ${s.requesterName||"villager"}`,onChange:N=>p({description:N.target.value})}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_||!d.name.trim(),onClick:()=>{G(!0),K(""),D("/locations/venue/descriptions/draft",{method:"POST",body:JSON.stringify({venues:[{id:s.id,name:d.name,classes:d.classes}]})}).then(N=>p({description:N.descriptions[s.id]??""})).catch(N=>K(U(N,"The description draft could not be generated."))).finally(()=>G(!1))},children:"Generate description draft"}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_||!d.name.trim()||d.classes.length===0||!d.description?.trim(),onClick:()=>{Og(s,!0)},children:d.name!==s.venueDraft.name||JSON.stringify(d.classes)!==JSON.stringify(s.venueDraft.classes)?"Send counteroffer":"Approve exact request"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>{Og(s,!1)},children:"Deny"})]})]})},s.id)})}),(0,r.jsx)("h3",{className:`${i}-panel-title`,children:"Home upgrade requests"}),n.upgradeRequests.length===0?(0,r.jsx)("p",{className:`${i}-hint`,children:"No home upgrades requested."}):n.upgradeRequests.map(s=>(0,r.jsxs)("div",{className:`${i}-notice-row`,children:[(0,r.jsx)("span",{children:s.detail}),[!0,!1].map(d=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>{G(!0),K(""),D(`/venue-upgrades/${encodeURIComponent(s.id)}/${d?"approve":"deny"}`,{method:"POST"}).then(o).catch(p=>K(U(p,"The upgrade request could not be decided."))).finally(()=>G(!1))},children:d?"Approve upgrade":"Deny"},String(d)))]},s.id)),(0,r.jsx)("h3",{className:`${i}-panel-title`,children:"Resident move requests"}),n.residences.filter(s=>s.status!=="current").length===0?(0,r.jsx)("p",{className:`${i}-hint`,children:"No moves pending."}):n.residences.filter(s=>s.status!=="current").map(s=>{let d=It(s.characterId),p=n.settings.venues.find(N=>N.id===s.proposedVenueId)?.name||"another venue";return(0,r.jsxs)("div",{className:`${i}-notice-row`,children:[(0,r.jsx)("span",{children:`${d} \u2192 ${p}`}),s.status==="moving"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("span",{className:`${i}-hint`,children:["Move due ",new Date(s.completesAt??"").toLocaleString()]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>{G(!0),K(""),D("/residences/debug/complete-now",{method:"POST",body:JSON.stringify({characterId:s.characterId})}).then(o).catch(N=>K(U(N,"The move could not be completed."))).finally(()=>G(!1))},children:"DEBUG: Complete move now"})]}):s.requestedBy==="player"?(0,r.jsxs)("span",{className:`${i}-hint`,children:["Awaiting ",d,"'s answer in conversation."]}):[!0,!1].map(N=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>{G(!0),K(""),D(`/residences/${N?"approvals":"denials"}`,{method:"POST",body:JSON.stringify({characterId:s.characterId})}).then(o).catch(z=>K(U(z,"The move request could not be decided."))).finally(()=>G(!1))},children:N?"Approve move":"Deny"},String(N)))]},s.characterId)}),_t?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:_t}):null]}):null,X==="homes"&&n?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Homes on the map"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Where everyone lives. Each Residence has its own name and Form. A Residence nobody has moved into is a normal thing for a village to have, and the villagers are told about the occupied ones and nothing else."}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_||fa.length>=Ds,onClick:()=>{Xt(!0),dd()},children:"Put a home on the map"}),(0,r.jsx)("span",{className:`${i}-hint`,children:`${fa.length} of at most ${Ds}`})]}),fa.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"No homes on the map yet."}):(0,r.jsx)(r2,{homes:fa,villagers:(n?.villagers??[]).map(s=>({id:s.characterId,name:s.name})),disabled:_,selectedId:c1,onPatch:Ag,onRemove:c$,onSelect:Uu,showDescriptions:!0,onGenerateDescription:s=>{d$(s)},lockedIds:new Set(n.settings.venues.filter(s=>s.occupancy.residentCharacterId).map(s=>s.id))}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>{u$()},children:"Save the homes"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>Wr(n.settings.venues),children:"Put them back"}),(0,r.jsx)("span",{className:`${i}-hint`,children:US(n.settings.venues,fa)?"No unsaved changes.":"Unsaved changes."})]})]}):null,X==="map"&&n?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Town map"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"The optional picture beneath the village's logical map. Upload one here, or leave the navigation surface clean; venue pins work in either case."}),(0,r.jsx)(zp,{src:Ss,alt:"A preview of the town map, framed the way it will be drawn in the village.",pins:n.settings.venues.flatMap(s=>{let d=rs(s);if(!d)return[];let p=s.occupancy.residentCharacterId?It(s.occupancy.residentCharacterId):s.occupancy.playerHome?co(n):"";return[{id:s.id,x:d.x,y:d.y,text:p?`${s.name||"Home"} \xB7 ${p}`:s.name,tone:Mr(s)?L0({isPlayerHome:s.occupancy.playerHome,occupant:s.occupancy.residentCharacterId}):"venue",onSelect:()=>qu(s.id)}]}),placing:ms!==null,view:jr,shape:cg,zoom:$1,onView:Ts?Lr:void 0,onPlace:ms?(s,d)=>{let p=ms;G(!0),K(""),D(`/locations/venue/${encodeURIComponent(p)}`,{method:"PUT",body:JSON.stringify({presentation:{x:s,y:d}})}).then(o).catch(N=>K(U(N,"The venue could not be placed."))).finally(()=>{G(!1),Bu(null)})}:void 0}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Venue positions and residents"}),n.settings.venues.map(s=>{let d=s.occupancy.residentCharacterId?It(s.occupancy.residentCharacterId):s.occupancy.playerHome?co(n):"",p=!!s.occupancy.residentCharacterId;return(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":u1===s.id,onClick:()=>qu(s.id),children:s.name||"Home"}),(0,r.jsx)("span",{className:`${i}-hint`,children:d?`Lives here: ${d}`:"No villager lives here"}),(0,r.jsx)("span",{className:`${i}-hint`,children:rs(s)?"On map":"Not placed"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_||p,onClick:()=>{qu(s.id),Bu(s.id)},children:rs(s)?"Move pin":"Place pin"})]},s.id)}),ms?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Bu(null),children:"Cancel pin placement"}):null,_t?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:_t}):null]}),Ts?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("div",{className:`${i}-steps`,role:"group","aria-label":"How the picture sits in the frame",children:j0.map(s=>(0,r.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":jr.fit===s.fit?"true":"false","aria-pressed":jr.fit===s.fit,onClick:()=>Lr({...jr,fit:s.fit}),children:s.label},s.fit))}),(0,r.jsx)("p",{className:`${i}-hint`,children:j0.find(s=>s.fit===jr.fit)?.help})]}):null,nd?(0,r.jsx)("p",{className:`${i}-hint`,"data-tone":nd.tone,children:nd.text}):null,(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("input",{className:`${i}-file`,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",disabled:_,"aria-label":"Choose a town map picture",onChange:s=>{let d=s.target.files?.[0];s.target.value="",Ng(d)}}),n.settings.townMapImageSetAt?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>{Tg()},children:"Remove background image"}):null]}),Ts?(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>{Sg()},children:Va?"Use this map":"Keep this framing"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:Vs,children:"Leave it as it was"})]}):(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("p",{className:`${i}-hint`,children:n.settings.townMapImageSetAt?"Your own map is drawn at the moment.":"The logical map is drawn without a background image."}),n.settings.townMapImageSetAt?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>ad(!0),children:"Crop or fit it again"}):null]}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"Landscape images work best. Each map keeps its actual size and shape, with the whole image visible on desktop. It is stored with the village so it travels with a backup. A picture that is too large is refused before upload rather than silently shrunk."}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("span",{className:`${i}-label`,children:"Pictures of the places"}),(0,r.jsxs)("p",{className:`${i}-macro-help`,children:["What a conversation stands in when somebody is there. Open a Venue to generate, upload, or remove its picture. Nothing is drawn automatically. These are kept in the"," ",(0,r.jsx)("strong",{children:n.settings.villageGalleryFolderName})," folder of the Engine's own gallery rather than with the village, so they are yours to reuse or throw away from there, and a village with twenty pictured places stays as small as one with none."]}),_n(n.settings.venues).length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"No places yet, so there is nothing to draw."}):(0,r.jsx)("ul",{className:`${i}-places`,children:_n(n.settings.venues).map(s=>(0,r.jsxs)("li",{className:`${i}-place`,children:[s.presentation.image?(0,r.jsx)("img",{className:`${i}-place-thumb`,src:s.presentation.image.url,alt:"",loading:"lazy"}):(0,r.jsx)("span",{className:`${i}-place-thumb`,"data-empty":"true","aria-hidden":"true"}),(0,r.jsxs)("div",{className:`${i}-place-body`,children:[(0,r.jsx)("span",{className:`${i}-place-name`,children:s.name}),(0,r.jsx)("div",{className:`${i}-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>{Os(s)},children:"View Venue"})})]})]},s.id))})]})]}):null,X==="replyGuidance"?(0,r.jsx)(s2,{}):null,X==="story"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Village story"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Memories from conversations and favors can guide residents. Older model-written tick entries are kept here for review but no longer affect the village while Events is being rebuilt. A private memory is known only to the people named on it and to you. Deleting one here is permanent."}),u===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Reading what the village remembers\u2026"}):u.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Nothing written down yet. Meaningful visits and fulfilled wishes can leave memories."}):NS(u).map(s=>(0,r.jsxs)("section",{children:[(0,r.jsx)("h3",{className:`${i}-story-day`,children:s.label}),(0,r.jsx)("ul",{className:`${i}-story`,children:s.entries.map(d=>{let p=Op(d),N=d.actors.map(z=>z.name).join(", ");return(0,r.jsxs)("li",{className:`${i}-story-row`,children:[(0,r.jsxs)("span",{children:[p.length>0||d.scope==="private"||d.kind==="favour"?(0,r.jsxs)("span",{className:`${i}-story-meta`,children:[p,d.scope==="private"?(0,r.jsx)("span",{className:`${i}-story-scope`,children:` \xB7 private to ${N}`}):null,d.kind==="favour"?(0,r.jsx)("span",{className:`${i}-story-scope`,children:" \xB7 a favour"}):null,d.kind==="tick"?(0,r.jsx)("span",{className:`${i}-story-scope`,children:" \xB7 legacy Events prose"}):null]}):null,d.text]}),(0,r.jsx)("button",{type:"button",className:`${i}-remove`,disabled:_,onClick:()=>{z1(d.id)},"aria-label":`Forget: ${d.text}`,children:"\xD7"})]},d.id)})})]},`${s.label}:${s.entries[0]?.id??""}`)),u&&u.length<g?(0,r.jsxs)("button",{type:"button",className:`${i}-button`,onClick:()=>{R1()},children:["Load more memories (",u.length," of ",g,")"]}):null]}):null,X==="chatlogs"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Venue visits"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Completed venue visits are kept here word for word. Filter by place or resident; each visit has one shared record, including who heard each line. The village uses only the separately distilled memories."}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsxs)("select",{"aria-label":"Filter visits by venue",value:De,onChange:s=>{it(s.target.value),S(0),L(null)},children:[(0,r.jsx)("option",{value:"",children:"All venues"}),(n?.settings.venues??[]).map(s=>(0,r.jsx)("option",{value:s.id,children:s.name},s.id))]}),(0,r.jsxs)("select",{"aria-label":"Filter visits by resident",value:ht,onChange:s=>{wi(s.target.value),S(0),L(null)},children:[(0,r.jsx)("option",{value:"",children:"All residents"}),(n?.villagers??[]).map(s=>(0,r.jsx)("option",{value:s.characterId,children:s.name},s.characterId))]})]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_||w===0,onClick:()=>{vg()},children:"Delete all completed logs"}),Gt?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Gt}):null,k===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Reading venue visits\u2026"}):k.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"No completed visits match these filters."}):k.map(s=>(0,r.jsxs)("section",{children:[(0,r.jsxs)("h3",{className:`${i}-story-day`,children:[s.placeName," \xB7 ",Ou(s.startedAt)]}),(0,r.jsxs)("p",{className:`${i}-story-meta`,children:[s.participants.map(d=>d.name).join(", ")," \xB7 ",s.lineCount," lines",s.endReason==="inactivity"?" \xB7 Interrupted: Inactivity":"",s.memoryPending?s.memoryReview?.status==="pending"?` \xB7 durable review pending \xB7 ${s.memoryReview.attempts} ${s.memoryReview.attempts===1?"attempt":"attempts"}`:` \xB7 legacy memory pending (${s.memoryProgress?.nextUnit??0}/${s.memoryUnits} pieces processed)`:""]}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{ud(s.id)},children:H?.id===s.id?"Refresh transcript":"Open transcript"}),s.memoryPending?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>{D1(s.id)},children:s.memoryReview?.status==="pending"?"Retry review":"Retry memory"}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>{vg(s.id)},children:"Delete log"})]}),H?.id===s.id?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("ul",{className:`${i}-story`,children:H.lines.map((d,p)=>(0,r.jsx)("li",{className:`${i}-story-row`,children:(0,r.jsxs)("span",{children:[(0,r.jsxs)("span",{className:`${i}-story-meta`,children:[(0,r.jsx)("span",{style:n?.settings.characterSpeechColors&&d.role==="assistant"&&d.kind!=="narration"?Vu(n.villagers.find(N=>N.characterId===d.speakerId)?.nameColor):void 0,children:d.name||co(n)})," \xB7 ",Ou(d.at)]}),(0,r.jsx)("span",{style:n?.settings.characterSpeechColors&&d.role==="assistant"&&d.kind!=="narration"?Vu(n.villagers.find(N=>N.characterId===d.speakerId)?.dialogueColor):void 0,children:Rr(d.content,`venue-${s.id}-${p}-`)}),(0,r.jsxs)("span",{className:`${i}-story-meta`,children:["Heard by:"," ",d.heardBy?.map(N=>H.participants.find(z=>z.characterId===N)?.name??N).join(", ")||"no one"]})]})},`${s.id}:${p}`))}),(H.submissions??[]).some(d=>d.recollections?.length)?(0,r.jsxs)("details",{className:`${i}-agenda-notes`,children:[(0,r.jsx)("summary",{children:"Captured recollections and evidence"}),(0,r.jsx)("ul",{className:`${i}-story`,children:(H.submissions??[]).flatMap(d=>(d.recollections??[]).map(p=>(0,r.jsxs)("li",{className:`${i}-wish-card`,children:[(0,r.jsx)("p",{className:`${i}-wish-text`,children:p.text}),(0,r.jsx)("p",{className:`${i}-wish-meta`,children:`Subjects: ${p.subjectCharacterIds.join(", ")||"none"} \xB7 Known by: ${p.knownByCharacterIds.join(", ")}`}),(0,r.jsx)("p",{className:`${i}-wish-meta`,children:`Evidence: ${p.lineIds.join(", ")}`})]},p.id)))})]}):null,H.memoryReview&&H.memoryReview.status!=="none"?(0,r.jsxs)("details",{className:`${i}-agenda-notes`,open:H.memoryPending,children:[(0,r.jsx)("summary",{children:`Durable review \xB7 ${H.memoryReview?.status??"none"}`}),(0,r.jsxs)("div",{className:`${i}-agenda-notes-body`,children:[(0,r.jsxs)("p",{className:`${i}-story-meta`,children:[`${H.memoryReview?.attempts??0} review attempts`,H.memoryReview?.error?` \xB7 Last error: ${H.memoryReview.error}`:""]}),(0,r.jsx)("ul",{className:`${i}-story`,children:(H.memoryReview?.decisions??[]).map(d=>(0,r.jsxs)("li",{className:`${i}-wish-card`,children:[(0,r.jsx)("p",{className:`${i}-wish-text`,children:`${d.action==="promote"?"Promoted":"Rejected"}${d.category?` \xB7 ${F0[d.category]}`:""}`}),d.text?(0,r.jsx)("p",{children:d.text}):null,(0,r.jsx)("p",{className:`${i}-wish-meta`,children:d.reason}),(0,r.jsx)("p",{className:`${i}-wish-meta`,children:`Sources: ${d.recollectionIds.join(", ")}`})]},d.id))})]})]}):null]}):null]},s.id)),w>20?(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:v===0,onClick:()=>{S(Math.max(0,v-20)),L(null)},children:"Previous"}),(0,r.jsxs)("span",{children:[v+1,"\u2013",Math.min(w,v+20)," of ",w]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:v+20>=w,onClick:()=>{S(v+20),L(null)},children:"Next"})]}):null]}):null,X==="agendas"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"What the villagers wish"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Private wishes can shape what a villager notices, says, and does. Their agenda is in Villager Agendas."}),q===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Reading what the villagers wish\u2026"}):q.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Nobody lives here yet."}):(0,r.jsx)("section",{children:q.map(s=>(0,r.jsxs)("div",{children:[(0,r.jsxs)("h3",{className:`${i}-story-day`,children:[s.name,s.missing?(0,r.jsx)("span",{className:`${i}-badge`,children:"card missing"}):null]}),s.agenda===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Not written for yet. The village works this out on the next part of the day it already runs on, so there is nothing to press."}):s.agenda.wishes.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:s.agenda.personalizationFailure?`Wish generation failed: ${s.agenda.personalizationFailure}`:s.agenda.generatedAt?"No current wishes.":"Wishes are still being worked out. Their provisional agenda is already available."}):(0,r.jsx)("ul",{className:`${i}-story`,children:s.agenda.wishes.map(d=>(0,r.jsxs)("li",{className:`${i}-wish-card`,children:[(0,r.jsx)("p",{className:`${i}-wish-text`,children:d.wish}),d.tell.length>0?(0,r.jsx)("p",{className:`${i}-wish-tell`,children:`Shows as: ${d.tell}`}):null,(0,r.jsx)("p",{className:`${i}-wish-meta`,children:`${d.intensity===1?"Faint":d.intensity===3?"Strong":"Present"} \xB7 ${CS(d.addedAt??"",d.expiresAt??"")}`})]},d.id))}),s.completedWishes.length>0?(0,r.jsxs)("details",{className:`${i}-agenda-notes`,children:[(0,r.jsx)("summary",{children:`Completed wishes (${s.completedWishes.length})`}),(0,r.jsx)("ul",{className:`${i}-story`,children:s.completedWishes.map(d=>(0,r.jsxs)("li",{className:`${i}-wish-card`,children:[(0,r.jsx)("p",{className:`${i}-wish-text`,children:d.wish.wish}),(0,r.jsx)("p",{className:`${i}-wish-meta`,children:`Fulfilled ${new Date(d.fulfilledAt).toLocaleDateString()}`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>{O1(s.characterId,d.wish.id)},children:"Mark as not fulfilled"})]},d.wish.id))})]}):null]},s.characterId))})]}):null,X==="schedules"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:"Villager agendas"})}),(0,r.jsx)("p",{className:`${i}-empty`,children:"Each villager follows a Villages agenda. A Marinara schedule can guide future days when enabled."}),q===null?(0,r.jsx)("p",{className:`${i}-empty`,children:"Loading agendas\u2026"}):q.length===0?(0,r.jsx)("p",{className:`${i}-empty`,children:"Nobody lives here yet."}):(0,r.jsx)("div",{className:`${i}-agenda-list`,children:q.map(s=>(0,r.jsxs)("details",{className:`${i}-week`,children:[(0,r.jsx)("summary",{className:`${i}-week-toggle`,children:(0,r.jsxs)("h3",{className:`${i}-week-head`,children:[s.name,s.agenda?.personalizationPending?(0,r.jsx)("span",{className:`${i}-badge`,children:s.agenda.personalizationFailure?"Personalization needs retry":"Personalizing"}):null,s.agenda?.personalizationFailure?(0,r.jsx)("span",{className:`${i}-badge`,children:"Personalization failed"}):null,s.missing?(0,r.jsx)("span",{className:`${i}-badge`,children:"Card missing"}):null,s.nativeSchedule?(0,r.jsx)("span",{className:`${i}-badge`,children:s.agenda?.activeDay?.scheduleInformed?"Schedule used today":"Schedule available"}):null,kp(s)?(0,r.jsx)("span",{className:`${i}-badge`,children:"Earlier hours kept"}):null]})}),(0,r.jsxs)("div",{className:`${i}-week-body`,children:[s.agenda?.routineSummary?(0,r.jsx)("p",{className:`${i}-story-meta`,children:s.agenda.routineSummary}):null,s.agenda?.personalizationFailure?(0,r.jsx)("p",{className:`${i}-empty`,children:s.agenda.personalizationFailure}):s.agenda?.personalizationPending?(0,r.jsx)("p",{className:`${i}-story-scope`,children:"Personalizing this agenda in the background."}):null,(0,r.jsxs)("div",{className:`${i}-agenda-actions`,children:[(0,r.jsxs)("label",{className:`${i}-agenda-switch`,children:[(0,r.jsx)("input",{type:"checkbox",checked:s.ingestSchedule,disabled:_,onChange:d=>{V1(s.characterId,d.target.checked)}}),"Use Marinara schedule when available"]}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>{M1(s.characterId)},children:"Regenerate agenda"})]}),s.nativeSchedule?(0,r.jsxs)("p",{className:`${i}-story-scope`,children:[s.ingestSchedule&&s.remapFailure?`Schedule translation failed: ${s.remapFailure.message}`:s.ingestSchedule&&s.agenda?.scheduleWeek?"Schedule guides today and future days.":s.ingestSchedule?"Schedule translation is pending.":"Schedule ingestion is off.",kp(s)?" Earlier hours retain the previous plan.":""]}):kp(s)?(0,r.jsx)("p",{className:`${i}-story-scope`,children:"Earlier hours retain the previous plan."}):null,s.weekUnreadable?(0,r.jsx)("p",{className:`${i}-empty`,children:"Marinara schedules could not be read right now. The Villages agenda remains active."}):s.nativeSchedule?null:(0,r.jsx)("p",{className:`${i}-empty`,children:"No Marinara schedule. Villages uses its own agenda."}),(0,r.jsx)("div",{className:`${i}-agenda-days`,children:s.days.map(d=>{let p=d.isToday?s.agenda?.activeDay?.blocks??s.agenda?.week?.[d.weekday]??[]:(s.ingestSchedule?s.agenda?.scheduleWeek?.[d.weekday]:void 0)??s.agenda?.week?.[d.weekday]??[],N=s.nativeSchedule?.days[d.weekday]??[];return(0,r.jsxs)("details",{className:`${i}-agenda-day`,open:d.isToday||void 0,children:[(0,r.jsxs)("summary",{children:[d.weekday," \xB7 ",d.dateLabel,d.isToday?" \xB7 Today":""]}),(0,r.jsxs)("div",{className:`${i}-agenda-compare`,"data-comparison":s.nativeSchedule?"true":void 0,children:[(0,r.jsxs)("section",{"aria-label":`${d.weekday} Villages agenda`,children:[(0,r.jsx)("h4",{children:"Villages agenda"}),(0,r.jsx)("ol",{className:`${i}-agenda-blocks`,children:p.map((z,V)=>(0,r.jsxs)("li",{children:[(0,r.jsxs)("time",{children:[M0(z.startMinute),"\u2013",M0(z.endMinute)]}),(0,r.jsx)("strong",{children:z.activity}),(0,r.jsx)("span",{children:z.venueId?kS(n?.settings.venues??[],z.venueId):"Home"}),(0,r.jsx)("span",{children:z.reason}),(0,r.jsx)("span",{className:`${i}-story-scope`,children:z.status==="idle"?"Available":z.status==="dnd"?"Busy":z.status==="offline"?"Offline":"Online"})]},`${z.startMinute}-${z.endMinute}-${V}`))})]}),s.nativeSchedule?(0,r.jsxs)("section",{"aria-label":`${d.weekday} Marinara schedule`,children:[(0,r.jsx)("h4",{children:"Marinara schedule"}),N.length?(0,r.jsx)("ol",{className:`${i}-agenda-blocks`,children:N.map((z,V)=>(0,r.jsxs)("li",{children:[(0,r.jsx)("time",{children:z.time}),(0,r.jsx)("strong",{children:z.activity}),(0,r.jsx)("span",{className:`${i}-story-scope`,children:z.status||"No availability set"})]},`${z.time}-${V}`))}):(0,r.jsx)("p",{className:`${i}-empty`,children:"No schedule blocks for this day."})]}):null]})]},`${d.weekday}-${d.dateLabel}`)})})]})]},s.characterId))})]}):null,_t?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:_t}):null]})]});if(le==="preparing"){let s=n?.foundingPreparation,d=n?.villagers.length??0,p=s?.completedIds.length??0,N=n?.villagers.find(fe=>fe.characterId===s?.currentId)?.name,z=s?.stage==="reading"?"Reading the character card and native schedule":s?.stage==="lore"?"Selecting relevant entries from the founding lorebooks":s?.stage==="resolving"?"Connecting to the System model":s?.stage==="model"?`Waiting for ${s.modelName||"the System model"} to write wishes, the week, and schedule mappings`:s?.stage==="applying"?"Expanding the week and applying native schedule times":s?.stage==="saving"?"Saving this villager's agenda and translation":"Preparing the first villager",V=s?.stageStartedAt?Date.parse(s.stageStartedAt):NaN,j=s?.status==="pending"&&Number.isFinite(V)?Math.max(0,Math.floor((Date.now()-V)/1e3)):null;return(0,r.jsx)("div",{className:`${i}-root ${i}-preparing`,role:"status","aria-live":"polite",children:(0,r.jsxs)("div",{children:[(0,r.jsx)("div",{className:`${i}-preparing-house`,"aria-hidden":"true",children:"\u{1F3E1}"}),(0,r.jsxs)("h1",{children:[n?.village.name??"Your village"," is settling in"]}),(0,r.jsx)("p",{children:s?.status==="failed"?"The villagers need a hand before the gates open.":N?`Making room for ${N}\u2026`:"Lighting windows and making plans\u2026"}),(0,r.jsx)("p",{children:`${p} of ${d} villagers ready`}),s?.status==="pending"&&s.stage?(0,r.jsxs)("p",{children:[z,N?` for ${N}`:"","."]}):null,s?.attempt?(0,r.jsx)("p",{children:`Attempt ${s.attempt} of 3${j!==null?` \xB7 ${j}s in this stage`:""}`}):null,s?.stage==="resolving"||s?.stage==="model"||s?.stage==="applying"||s?.stage==="saving"?(0,r.jsx)("p",{children:`${s.loreEntryCount??0} relevant lorebook entries included`}):null,s?.status==="pending"&&s.error?(0,r.jsx)("p",{className:`${i}-hint`,children:`Previous attempt: ${s.error}`}):null,s?.status==="failed"?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:s.error}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{$$()},children:"Retry this villager"}),(0,r.jsxs)("details",{children:[(0,r.jsx)("summary",{children:"Change connections"}),(0,r.jsx)(Rp,{})]})]}):null,ig?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:ig}):null]})})}if(le==="setup"){let s=(l??[]).map(d=>({id:d.id,name:d.name}));return(0,r.jsx)("div",{className:`${i}-root ${i}-home ${i}-setup-root`,children:(0,r.jsxs)("div",{className:`${i}-home-body ${i}-setup-body`,"data-step":Ae,children:[(0,r.jsx)("aside",{className:`${i}-setup-rail`,"aria-label":"Founding progress",children:Au.map((d,p)=>(0,r.jsxs)("div",{className:`${i}-setup-rail-step`,"data-active":p===Ae?"true":"false","data-done":p<Ae?"true":"false","aria-current":p===Ae?"step":void 0,children:[(0,r.jsx)("span",{className:`${i}-setup-rail-number`,children:p+1}),(0,r.jsx)("span",{children:d})]},d))}),(0,r.jsx)("div",{className:`${i}-side`,children:(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("div",{className:`${i}-overlay-head`,children:(0,r.jsx)("h2",{className:`${i}-panel-title`,children:n?.isFounded?"Setting the village up again":"Founding your village"})}),(0,r.jsxs)("p",{className:`${i}-setup-kicker`,children:["Step ",Ae+1," of ",Au.length," \xB7 ",Au[Ae]]}),Ae===0?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setup-name`,children:"What is this village called?"}),(0,r.jsx)("input",{id:`${i}-setup-name`,className:`${i}-search`,type:"text",value:Qa,maxLength:n?.settings.villageNameMaxLength,placeholder:"Ashwater",disabled:_,onChange:d=>Zp(d.target.value)})]}),(0,r.jsxs)("fieldset",{className:`${i}-field`,children:[(0,r.jsx)("legend",{className:`${i}-label`,children:"Choose a scenario"}),(0,r.jsx)("div",{className:`${i}-scenario-options`,children:Mp.filter(d=>d.value!=="custom"||n?.isFounded&&fn==="custom").map(d=>(0,r.jsxs)("label",{className:`${i}-scenario-option`,children:[(0,r.jsx)("input",{type:"radio",name:`${i}-founding-scenario`,checked:fn===d.value,disabled:_||n?.isFounded,onChange:()=>h$(d.value)}),(0,r.jsx)("span",{className:`${i}-scenario-icon`,"aria-hidden":"true",children:d.icon}),(0,r.jsx)("strong",{children:d.label}),(0,r.jsx)("small",{children:d.description})]},d.value))})]}),n?.isFounded?(0,r.jsx)("p",{className:`${i}-hint`,children:"The founding choice and Day 1 record are part of this village's history."}):null]}):null,Ae===1?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)(i2,{personas:Ni,draft:Pe,onDraft:gn,disabled:_}),(0,r.jsx)(Rp,{onSetupProblem:b1,onImageWarningChange:rg,compact:!0}),v1?(0,r.jsxs)("div",{className:`${i}-chat-confirm`,role:"alertdialog","aria-label":"Image connection recommendation",children:[(0,r.jsx)("p",{className:`${i}-chat-confirm-note`,children:"Villages is meant to be an immersive experience with dynamic locations and expressive characters. An image connection is highly recommended for the complete Villages experience."}),(0,r.jsx)("p",{className:`${i}-macro-help`,children:"Villages is still playable without an image connection. You can always manually add images to locations, characters, and more."}),(0,r.jsxs)("span",{className:`${i}-chat-confirm-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:p$,children:"Set up an image connection"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:m$,children:"I understand, continue"})]})]}):null]}):null,Ae===0?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setup-setting`,children:"What is this village like?"}),(0,r.jsx)("textarea",{id:`${i}-setup-setting`,className:`${i}-textarea ${i}-setup-beginning-textarea`,value:wt,maxLength:n?.settings.settingMaxLength,placeholder:"A fishing village on steep sea cliffs, with salt-worn cottages, rope bridges, and foggy mornings.",disabled:_||Dt,onChange:d=>{Kp(d.target.value),fs([])}}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Required. Describe the surroundings, buildings, and everyday life. Villagers use this as the village grows; the next field describes only Day 1."})]}),n?.isFounded?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("strong",{children:"Day 1 record"}),(0,r.jsx)("p",{className:`${i}-hint`,children:n.settings.foundingDetails||"This village has no recorded first-day description."}),(0,r.jsx)("span",{className:`${i}-hint`,children:"The village's beginning is history and cannot be rewritten here."})]}):(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-founding-details`,children:"What happens on the village's first day?"}),(0,r.jsx)("textarea",{id:`${i}-founding-details`,className:`${i}-textarea ${i}-setup-beginning-textarea`,value:ba,maxLength:n?.settings.foundingDetailsMaxLength??2e3,placeholder:"The group arrives with tools and supplies, chooses a place to gather, and begins building together.",disabled:_,onChange:d=>Lu(d.target.value)}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Required for every village, including Open beginning. Describe what the group faces and the feeling of its first day. This guides founding, then becomes history."})]}),n?.isFounded?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-world-facts`,children:"Current world facts"}),(0,r.jsx)("textarea",{id:`${i}-world-facts`,className:`${i}-textarea`,value:bn.join(`
`),disabled:_,placeholder:"One stable fact per line, up to four.",onChange:d=>Pp(d.target.value.split(/\r?\n/u))}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Edit these when the village changes. They are current facts, separate from its locked beginning."})]}):null,(0,r.jsx)(X0,{books:Iu,error:Gp,selected:Ma,onChange:d=>{Lp(d),fs([])},disabled:_}),(0,r.jsxs)("details",{className:`${i}-field`,children:[(0,r.jsx)("summary",{className:`${i}-label`,children:"Advanced lore settings"}),(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setup-lore-budget`,children:"Lorebook token budget"}),(0,r.jsx)("input",{id:`${i}-setup-lore-budget`,className:`${i}-notice-input`,type:"number",min:n?.settings.loreTokenBudgetMin??200,max:n?.settings.loreTokenBudgetMax??3200,step:100,value:go,disabled:_,onChange:d=>jp(Number(d.target.value))}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Maximum approximate lore tokens for village text, wishes, and agendas."})]})]}):null,Ae===2?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("div",{className:`${i}-steps`,role:"group","aria-label":"Village map image source",children:[(0,r.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":ze==="generate"?"true":"false","aria-pressed":ze==="generate",disabled:Dt,onClick:()=>Ai("generate"),children:"Generate with AI"}),(0,r.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":ze==="upload"?"true":"false","aria-pressed":ze==="upload",disabled:Dt,onClick:()=>Ai("upload"),children:"Upload an image"}),(0,r.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":ze==="none"?"true":"false","aria-pressed":ze==="none",disabled:Dt,onClick:()=>Ai("none"),children:"No background image"}),n?.settings.townMapImageSetAt?(0,r.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":ze==="existing"?"true":"false","aria-pressed":ze==="existing",disabled:Dt,onClick:()=>Ai("existing"),children:"Keep current map"}):null]}),ze==="generate"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsxs)("details",{className:`${i}-field ${i}-setup-advanced`,children:[(0,r.jsx)("summary",{className:`${i}-label`,children:"Advanced map elements"}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Auto follows your village description. Include or exclude a feature only when you want to override it."}),(0,r.jsx)("div",{className:`${i}-reason-options`,children:[["roads","Roads and paths"],["structures","Structures"],["water","Water"]].map(([d,p])=>(0,r.jsxs)("label",{className:`${i}-label`,children:[p,(0,r.jsxs)("select",{className:`${i}-select`,value:vs[d],disabled:Dt,onChange:N=>ag(z=>({...z,[d]:N.target.value})),children:[(0,r.jsx)("option",{value:"auto",children:"Auto"}),(0,r.jsx)("option",{value:"include",children:"Include"}),(0,r.jsx)("option",{value:"exclude",children:"Exclude"})]})]},d))})]}),(0,r.jsxs)("details",{className:`${i}-field ${i}-setup-advanced`,children:[(0,r.jsx)("summary",{className:`${i}-label`,children:"Testing prompt controls"}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsxs)("label",{className:`${i}-label`,htmlFor:`${i}-setup-map-prompt`,children:[(0,r.jsx)("span",{className:`${i}-debug-label`,children:"DEBUG"})," Map layout prompt"]}),(0,r.jsx)("textarea",{id:`${i}-setup-map-prompt`,className:`${i}-textarea`,value:bo,maxLength:1500,disabled:Dt,onChange:d=>Ku(d.target.value)}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Temporary testing override. The default comes from the server; edits apply only to this setup session."})]}),(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsxs)("label",{className:`${i}-label`,htmlFor:`${i}-setup-map-negative`,children:[(0,r.jsx)("span",{className:`${i}-debug-label`,children:"DEBUG"})," Negative map tags"]}),(0,r.jsx)("textarea",{id:`${i}-setup-map-negative`,className:`${i}-textarea`,value:vo,maxLength:1500,disabled:Dt,onChange:d=>Ju(d.target.value)}),(0,r.jsx)("span",{className:`${i}-hint`,children:"Image providers handle negative tags differently. Review the resulting map before continuing."})]}),(0,r.jsx)("div",{className:`${i}-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:Dt||bo===n?.settings.townMapLayoutPrompt&&vo===n?.settings.townMapNegativePrompt,onClick:()=>{Ku(n?.settings.townMapLayoutPrompt??""),Ju(n?.settings.townMapNegativePrompt??"")},children:"Restore default prompt"})})]}),(0,r.jsx)("div",{className:`${i}-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:Dt||wt.trim().length===0,onClick:()=>{F1()},children:Dt?"Generating map\u2026":ys==="generate"?"Generate again":"Generate map"})})]}):null,ze==="upload"?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("input",{className:`${i}-file`,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",disabled:Dt,"aria-label":"Choose a village map image",onChange:d=>{let p=d.target.files?.[0];d.target.value="",W1(p)}}),(0,r.jsx)("p",{className:`${i}-hint`,children:"Landscape images work best. PNG, JPEG, WebP, and AVIF are accepted at their native size; the file must fit the size limit shown if it is refused."})]}):null,ze==="none"?(0,r.jsx)("p",{className:`${i}-empty`,children:"Venues will remain clickable on a clean logical map surface. You can add an image from the Town map panel later."}):null,Ir&&ze!=="none"&&ys===ze&&ug?(0,r.jsx)("p",{className:`${i}-hint`,"data-tone":Cp(Ir).tone,children:Cp(Ir).text}):null]}):null,Ae===3?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("p",{className:`${i}-empty`,children:"Place your home, one to three villager homes, and a Gathering Place. Choose who lives where. Villages will draft the place details for you to review."}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_||Za||Be.filter(d=>d.classes?.includes("residence")).length>=1+Co,onClick:()=>{Xt(!0),ki(!1),Ci(null)},children:"Place a Residence"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_||Za||Be.some(d=>d.category==="public-center"),onClick:()=>{Xt(!1),ki(!0),Ci(null)},children:"Place a Gathering Place"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_||Za||Be.length===0,onClick:()=>{Ei([]),Oa(null),qn(null),Ci(null),Xt(!1),ki(!1)},children:"Reset all venues"})]}),tg?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:tg}):null,(0,r.jsx)("div",{className:`${i}-setup-venue-list`,children:Be.map(d=>(0,r.jsxs)("button",{type:"button",className:`${i}-setup-venue-card`,"data-selected":d.id===_r?"true":"false",onClick:()=>Oa(d.id),children:[d.presentation.image?(0,r.jsx)("img",{src:d.presentation.image.url,alt:""}):(0,r.jsx)("span",{className:`${i}-setup-venue-placeholder`,"aria-hidden":"true",children:"\u2302"}),(0,r.jsxs)("span",{children:[(0,r.jsx)("strong",{children:d.name||"Unnamed venue"}),(0,r.jsxs)("small",{children:[d.category==="public-center"?"Gathering Place":"Residence"," \xB7"," ",d.occupancy.playerHome?"You":It(d.occupancy.residentCharacterId)||"Choose a villager"]})]})]},d.id))}),ve&&md?(0,r.jsxs)("div",{className:`${i}-setup-venue-editor`,children:[(0,r.jsxs)("h3",{className:`${i}-panel-title`,children:[ve.category==="public-center"?"Gathering Place":"Residence"," \xB7"," ",ve.name]}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Ci(ve.id),Xt(!1),ki(!1)},children:"Move on map"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>l$(ve.id),children:"Remove venue"})]}),(0,r.jsxs)("label",{className:`${i}-label`,children:["Name",(0,r.jsx)("input",{id:`${i}-setup-venue-name`,className:`${i}-notice-input`,value:ve.name,maxLength:100,onChange:d=>Oi(ve.id,p=>({...p,name:d.target.value}))})]}),ve.category==="public-center"?(0,r.jsxs)("div",{className:`${i}-field`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_||Za,onClick:()=>{P1()},children:"Suggest three names"}),m1.map(d=>(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Oi(ve.id,p=>({...p,name:d})),children:d},d))]}):null,(0,r.jsxs)("p",{className:`${i}-hint`,children:["Class: ",tl==="gathering"?"Gathering":"Residence"]}),(0,r.jsxs)("div",{className:`${i}-setup-form-field`,children:[(0,r.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setup-form`,children:"Form"}),(0,r.jsx)("textarea",{id:`${i}-setup-form`,className:`${i}-textarea`,rows:2,value:ve.form??"",maxLength:240,placeholder:xS[tl][p1],onFocus:()=>ju(!0),onBlur:()=>ju(!1),onChange:d=>{Oi(ve.id,p=>({...p,form:d.target.value})),ge("")}}),(0,r.jsx)("small",{className:`${i}-hint`,children:"What the Venue actually is"})]}),ve.category!=="public-center"?(0,r.jsxs)("label",{className:`${i}-label`,children:["Resident",(0,r.jsxs)("select",{className:`${i}-select`,value:ve.occupancy.residentCharacterId??"",disabled:ve.occupancy.playerHome,onChange:d=>Oi(ve.id,p=>({...p,residentIds:d.target.value?[d.target.value]:[],occupancy:{...p.occupancy,residentCharacterId:d.target.value||null}})),children:[(0,r.jsx)("option",{value:"",children:ve.occupancy.playerHome?"You":"Choose a villager"}),s.map(d=>(0,r.jsx)("option",{value:d.id,disabled:Be.some(p=>p.id!==ve.id&&p.occupancy.residentCharacterId===d.id),children:d.name},d.id))]})]}):null,(0,r.jsx)("div",{className:`${i}-setup-place-spaces`,children:["exterior","interior"].map(d=>{let p=d==="exterior",N=p?"Exterior":"Interior",z=p?ve.presentation.image:md.image;return(0,r.jsxs)("section",{className:`${i}-setup-place-space`,children:[(0,r.jsx)("h4",{children:N}),(0,r.jsxs)("label",{className:`${i}-label`,htmlFor:`${i}-setup-${d}-description`,children:[N," Description \xB7 required"]}),(0,r.jsx)("textarea",{id:`${i}-setup-${d}-description`,className:`${i}-textarea`,value:p?ve.description:md.description,maxLength:1e3,onChange:V=>{let j=V.target.value;Oi(ve.id,fe=>p?{...fe,description:j}:{...fe,spaces:[{...nt(fe,tl),description:j}]}),ge(""),qn(null)}}),(0,r.jsxs)("span",{className:`${i}-label`,children:[N," Image \xB7 optional"]}),z?(0,r.jsx)("img",{className:`${i}-setup-image-preview`,src:z.url,alt:`${d} of ${ve.name}`}):(0,r.jsx)("p",{className:`${i}-hint`,children:"No image yet. A placeholder will be used."}),(0,r.jsxs)("div",{className:`${i}-row`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:Za,onClick:()=>{f$(ve,d)},children:z?`Regenerate ${N} Image`:`Generate ${N} Image`}),(0,r.jsx)("input",{className:`${i}-file`,type:"file",accept:"image/*",disabled:Za,"aria-label":`Upload ${d} image for ${ve.name}`,onChange:V=>{let j=V.target.files?.[0];V.target.value="",b$(ve,d,j)}}),z?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Oi(ve.id,V=>p?{...V,presentation:{...V.presentation,image:null}}:{...V,spaces:[{...nt(V,tl),image:null}]}),children:"Remove image"}):null]}),Hr?.venueId===ve.id&&Hr.area===d?(0,r.jsxs)("div",{className:`${i}-overlay`,children:[(0,r.jsx)("img",{className:`${i}-setup-image-preview`,src:Hr.image.url,alt:`New ${d} image preview`}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:v$,children:"Use this image"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>qn(null),children:"Discard"})]}):null]},d)})})]}):(0,r.jsx)("p",{className:`${i}-hint`,children:"Place or select a venue to edit it."}),l===null?(0,r.jsx)("p",{className:`${i}-hint`,children:"Reading your villager library\u2026"}):null]}):null,Ae===4?(0,r.jsxs)(r.Fragment,{children:[(0,r.jsx)("p",{className:`${i}-empty`,children:"Review your village before opening its gates. Return to Step 4 to change a venue."}),(0,r.jsxs)("section",{className:`${i}-setup-review-card`,children:[(0,r.jsx)("h3",{children:"Village Beginning"}),(0,r.jsxs)("p",{className:`${i}-hint`,children:[(0,r.jsx)("strong",{children:Qa.trim()})," \xB7 ",wt.trim()]}),(0,r.jsxs)("p",{className:`${i}-hint`,children:[(0,r.jsx)("strong",{children:"Persona:"})," ",Ni?.find(d=>d.id===Pe)?.name??"Selected Persona"," \xB7 ",(0,r.jsx)("strong",{children:"Scenario:"})," ",uo(fn).label]}),(0,r.jsxs)("p",{className:`${i}-hint`,children:[(0,r.jsx)("strong",{children:"Day 1:"})," ",ba||"No first-day description was recorded."]}),Dr?(0,r.jsxs)("p",{className:`${i}-hint`,children:[(0,r.jsx)("strong",{children:"Original founding direction:"})," ",Dr]}):null]}),(0,r.jsxs)("section",{className:`${i}-setup-review-card`,children:[(0,r.jsx)("h3",{children:"Map and lore"}),(0,r.jsxs)("p",{className:`${i}-hint`,children:[(0,r.jsx)("strong",{children:"Map:"})," ",ze==="none"?"Logical map":"Chosen picture"," \xB7 ",(0,r.jsx)("strong",{children:"Lorebooks:"})," ",Ma.map(d=>Iu?.find(p=>p.id===d)?.name??d).join(", ")||"None"]})]}),(0,r.jsxs)("section",{className:`${i}-setup-review-card`,children:[(0,r.jsx)("h3",{children:"Starting places"}),(0,r.jsx)("div",{className:`${i}-setup-venue-list`,children:Be.map(d=>(0,r.jsxs)("div",{className:`${i}-setup-venue-card`,children:[d.presentation.image?(0,r.jsx)("img",{src:d.presentation.image.url,alt:""}):(0,r.jsx)("span",{className:`${i}-setup-venue-placeholder`,"aria-hidden":"true",children:"\u2302"}),(0,r.jsxs)("span",{children:[(0,r.jsxs)("strong",{children:[d.name," \xB7 ",d.category==="public-center"?"Gathering Place":"Residence"]}),(0,r.jsxs)("small",{children:[d.form," \xB7"," ",d.occupancy.playerHome?"You":It(d.occupancy.residentCharacterId)||"Community"]})]})]},d.id))}),Be.map(d=>(0,r.jsxs)("p",{className:`${i}-hint`,children:[(0,r.jsxs)("strong",{children:[d.name,":"]})," ",d.description," ",d.spaces?.[0]?.description]},`${d.id}-summary`))]})]}):null,lg?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:lg}):null,_t?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:_t}):null]})}),(0,r.jsxs)("div",{className:`${i}-setup-visual`,children:[Ae<=1?(0,r.jsx)(t2,{scenario:fn}):(0,r.jsx)("div",{className:`${i}-setup-map-shell`,children:(0,r.jsx)("div",{className:`${i}-setup-map-viewport`,children:(0,r.jsx)(zp,{src:zi,alt:`A map of ${Qa.trim()||"your new village"}.`,pins:Ae<3?[]:C$,placing:Ae===3&&(Ti||hs||Gu!==null),view:ze==="existing"?wo:Ru("cover"),shape:ug,onPlace:Ae===3?r$:void 0,compact:Ae<2,mobile:t&&Ae>=2,photoPins:Ae>=3})})}),(0,r.jsxs)("nav",{className:`${i}-setup-footer`,"aria-label":"Founding navigation",children:[Ae>0?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_||Dt||Za,onClick:()=>zg(Ae-1),children:"\u2190 Back"}):null,Ae<Au.length-1?(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-setup-forward`,disabled:_||Dt||Za,onClick:()=>zg(Ae+1),children:"Next \u2192"}):(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-setup-forward`,disabled:_||Dt||!n,onClick:()=>{y$()},children:n?.isFounded?"Save this village":"Found the village"}),n?.isFounded?(0,r.jsx)("button",{type:"button",className:`${i}-button`,disabled:_,onClick:()=>{Xt(!1),se("home")},children:"Show me the village"}):null]})]})]})})}return(0,r.jsxs)("div",{className:`${i}-root ${i}-home ${i}-home-full`,"data-mobile":t?"true":"false",children:[(0,r.jsxs)("div",{className:`${i}-home-bar`,children:[(0,r.jsx)(XS,{weather:n?.village.weather??""}),!t&&n?.isFounded&&_n(n.settings.venues).length>0?(0,r.jsxs)("div",{className:`${i}-places-picker`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-button`,"aria-expanded":ee,"aria-controls":`${i}-places-list`,disabled:_,onClick:()=>{Ne(null),ot(s=>!s)},children:"Places"}),ee?(0,r.jsx)("div",{id:`${i}-places-list`,className:`${i}-places-list`,children:n.settings.venues.map(s=>(0,r.jsxs)("div",{className:`${i}-places-list-row`,children:[(0,r.jsx)("span",{className:`${i}-places-list-name`,children:s.name}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Os(s),children:"View venue"}),(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Pr(s)},children:"Visit"})]},s.id))}):null]}):null,(0,r.jsxs)("span",{className:`${i}-home-bar-actions`,children:[(0,r.jsx)("button",{type:"button",className:`${i}-mobile-board-button`,"aria-label":`Noticeboard (${n?.noticeboard.length??0})`,disabled:!n||_,onClick:()=>lt("noticeboard"),children:(0,r.jsx)("span",{"aria-hidden":"true",children:"\u25A4"})}),n?.isFounded?(0,r.jsx)(KS,{happenings:n.happenings,recap:n.recap,mobile:t}):null,(0,r.jsx)("button",{type:"button",className:`${i}-button ${i}-mobile-menu-button`,"aria-label":"Open settings menu",disabled:_||!n,onClick:()=>{Xa("index"),se("menu")},children:"\u2630"}),t?null:(0,r.jsx)(ZS,{}),Ti?(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Xt(!1),children:"Cancel"}):null]})]}),(0,r.jsx)("div",{className:`${i}-room`,children:(0,r.jsx)("div",{className:`${i}-home-map-viewport`,children:(0,r.jsx)(zp,{src:Ss,alt:`A map of ${n?.village.name??"the village"}.`,pins:E$,placing:Ti,view:wo,shape:cg,onPlace:s$,onDismiss:()=>{Ne(null),ot(!1)},fitToRoom:!t,mobile:t,photoPins:!0,children:Gr||_t||Ti||As||rd?(0,r.jsxs)("div",{className:`${i}-notice`,children:[Gr?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:Gr}):null,_t?(0,r.jsx)("p",{className:`${i}-error`,role:"alert",children:_t}):null,Ti?(0,r.jsx)("span",{className:`${i}-status`,children:"Click the map where the house stands."}):null,As?(0,r.jsxs)("span",{className:`${i}-status`,children:["Catching up on what ",n?.village.name??"the village"," has been doing\u2026"]}):null,rd?(0,r.jsx)("p",{className:`${i}-status`,children:rd}):null]}):null})})})]})}var _p=class extends HTMLElement{connectedCallback(){O0(),this.__root??(this.__root=(0,J0.createRoot)(this)),this.__root.render((0,r.jsx)(Vp,{element:this,children:(0,r.jsx)(g2,{element:this})}))}disconnectedCallback(){queueMicrotask(()=>{!this.isConnected&&this.__root&&(this.__root.unmount(),this.__root=null),O0()})}};function g2({element:e}){let[,t]=(0,m.useState)(0);(0,m.useEffect)(()=>{let n=()=>t(o=>o+1);return e.addEventListener("marinara-capability-props",n),()=>e.removeEventListener("marinara-capability-props",n)},[e]);let a=e.getAttribute("view");return a==="tracker"?(0,r.jsx)(y2,{props:e.capabilityProps??{}}):a==="toolbar"?(0,r.jsx)(v2,{props:e.capabilityProps??{}}):(0,r.jsx)(p2,{element:e})}function f2(){return(0,r.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round","aria-hidden":"true",children:[(0,r.jsx)("path",{d:"M3 10.5 12 3l9 7.5"}),(0,r.jsx)("path",{d:"M5.5 9.5V20h13V9.5"}),(0,r.jsx)("path",{d:"M9.5 16.5h5"})]})}var b2="marinara-active-chat-id";function o1(){try{window.localStorage.removeItem(b2)}catch{}window.location.reload()}function r1(e,t){let[a,n]=(0,m.useState)(null),[o,l]=(0,m.useState)(!1);return(0,m.useEffect)(()=>{if(l(!1),n(null),!t)return;let c=new AbortController;return(async()=>{try{let u=await D(`/spinoffs/${encodeURIComponent(e)}`,{signal:c.signal});if(c.signal.aborted)return;n(u??null),l(!0)}catch{}})(),()=>c.abort()},[e,t]),{origin:a,known:o}}function v2({props:e}){let t=typeof e.chatId=="string"?e.chatId:"",a=e.chatMode==="roleplay",n=e.mobileCompact===!0,o=typeof e.toolbarButtonClass=="string"?e.toolbarButtonClass:"",{origin:l,known:c}=r1(t,a&&t.length>0),[u,h]=(0,m.useState)(!1),g=(0,m.useRef)(null);if((0,m.useEffect)(()=>h(!1),[t,a]),(0,m.useEffect)(()=>{if(!u)return;let b=k=>{g.current?.contains(k.target)||h(!1)},C=k=>{k.key==="Escape"&&h(!1)};return document.addEventListener("pointerdown",b),document.addEventListener("keydown",C),()=>{document.removeEventListener("pointerdown",b),document.removeEventListener("keydown",C)}},[u]),!a||!c||l===null)return null;let $=l.name||"your villager",x=l.villageName||"your village",f=`Villages \u2014 this roleplay spun off from ${x}`;return(0,r.jsxs)("span",{className:`${i}-tracker`,"data-compact":n,"data-open":u,ref:g,children:[(0,r.jsxs)("button",{type:"button",className:o?`${o} ${i}-tracker-chip`:`${i}-button ${i}-tracker-chip`,onClick:()=>h(b=>!b),"aria-haspopup":"menu","aria-expanded":u,title:f,"aria-label":f,children:[(0,r.jsx)(f2,{}),(0,r.jsx)("span",{className:`${i}-tracker-label`,children:"Villages"})]}),u?(0,r.jsxs)("div",{className:`${i}-tracker-menu`,role:"menu","aria-label":`Villages \u2014 ${x}`,children:[(0,r.jsxs)("p",{className:`${i}-tracker-menu-title`,children:["This roleplay spun off from ",x]}),l.resident?(0,r.jsxs)("p",{className:`${i}-tracker-menu-note`,children:[$," still lives there. ",x," was photographed into this chat the moment it was made, and has not looked at it since: nothing said here is read, counted or kept by the village."]}):(0,r.jsxs)("p",{className:`${i}-tracker-menu-note`,children:[$," does not live in ",x," any more. This chat is yours either way \u2014 it was let go of the moment it was made, and nothing in the village is waiting on it."]}),(0,r.jsx)("p",{className:`${i}-tracker-menu-note`,children:"It is an ordinary chat in your own list. Renaming it, keeping it or deleting it changes nothing about the village."}),(0,r.jsx)("div",{className:`${i}-tracker-menu-row`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:o1,title:`Leaves this chat and opens Marinara's home screen, where the ${x} tab is waiting.`,children:"Open the village"})})]}):null]})}function y2({props:e}){let t=typeof e.chatId=="string"?e.chatId:"",a=e.chatMode==="roleplay",{origin:n,known:o}=r1(t,a&&t.length>0);if(!a||!o)return null;if(n===null)return(0,r.jsx)("div",{className:`${i}-panel-view`,children:(0,r.jsx)("p",{className:`${i}-tracker-menu-note`,children:"This chat did not come out of a village. A roleplay started from Villages says so here."})});let l=n.name||"this villager",c=n.villageName||"your village";return(0,r.jsxs)("div",{className:`${i}-panel-view`,children:[(0,r.jsx)("p",{className:`${i}-tracker-menu-note`,children:n.resident?`This roleplay spun off from ${c}, and ${c} has not looked at it since. Nothing said here is read, counted or kept by the village.`:`This roleplay spun off from ${c}, and ${l} does not live there any more. Nothing said here is read by the village either way.`}),(0,r.jsxs)("div",{className:`${i}-panel-view-row`,children:[(0,r.jsx)("span",{className:`${i}-panel-view-key`,children:"Villager"}),(0,r.jsx)("span",{children:l})]}),(0,r.jsxs)("div",{className:`${i}-panel-view-row`,children:[(0,r.jsx)("span",{className:`${i}-panel-view-key`,children:"Chat"}),(0,r.jsx)("span",{children:n.room})]}),(0,r.jsxs)("div",{className:`${i}-panel-view-row`,children:[(0,r.jsx)("span",{className:`${i}-panel-view-key`,children:"Came from"}),(0,r.jsx)("span",{children:c})]}),(0,r.jsx)("div",{className:`${i}-panel-view-actions`,children:(0,r.jsx)("button",{type:"button",className:`${i}-button`,onClick:o1,title:`Leaves this chat and opens Marinara's home screen, where the ${c} tab is waiting.`,children:"Open the village"})})]})}customElements.get(i)||customElements.define(i,_p);
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
