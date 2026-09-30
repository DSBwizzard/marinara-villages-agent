var i5=Object.create;var mh=Object.defineProperty;var r5=Object.getOwnPropertyDescriptor;var o5=Object.getOwnPropertyNames;var s5=Object.getPrototypeOf,l5=Object.prototype.hasOwnProperty;var c5=(e,t,a)=>t in e?mh(e,t,{enumerable:!0,configurable:!0,writable:!0,value:a}):e[t]=a;var Hn=(e,t)=>()=>{try{return t||e((t={exports:{}}).exports,t),t.exports}catch(a){throw t=0,a}};var d5=(e,t,a,n)=>{if(t&&typeof t=="object"||typeof t=="function")for(let r of o5(t))!l5.call(e,r)&&r!==a&&mh(e,r,{get:()=>t[r],enumerable:!(n=r5(t,r))||n.enumerable});return e};var tn=(e,t,a)=>(a=e!=null?i5(s5(e)):{},d5(t||!e||!e.__esModule?mh(a,"default",{value:e,enumerable:!0}):a,e));var zc=(e,t,a)=>c5(e,typeof t!="symbol"?t+"":t,a);var Ff=Hn(Vc=>{"use strict";var u5=Symbol.for("react.transitional.element"),h5=Symbol.for("react.fragment");function Qf(e,t,a){var n=null;if(a!==void 0&&(n=""+a),t.key!==void 0&&(n=""+t.key),"key"in t){a={};for(var r in t)r!=="key"&&(a[r]=t[r])}else a=t;return t=a.ref,{$$typeof:u5,type:e,key:n,ref:t!==void 0?t:null,props:a}}Vc.Fragment=h5;Vc.jsx=Qf;Vc.jsxs=Qf});var di=Hn((nC,Jf)=>{"use strict";Jf.exports=Ff()});var hb=Hn(ke=>{"use strict";var fh=Symbol.for("react.transitional.element"),m5=Symbol.for("react.portal"),p5=Symbol.for("react.fragment"),g5=Symbol.for("react.strict_mode"),f5=Symbol.for("react.profiler"),b5=Symbol.for("react.consumer"),v5=Symbol.for("react.context"),y5=Symbol.for("react.forward_ref"),w5=Symbol.for("react.suspense"),x5=Symbol.for("react.memo"),ib=Symbol.for("react.lazy"),$5=Symbol.for("react.activity"),N5=Symbol.for("react.view_transition"),eb=Symbol.iterator;function S5(e){return e===null||typeof e!="object"?null:(e=eb&&e[eb]||e["@@iterator"],typeof e=="function"?e:null)}var rb={isMounted:function(){return!1},enqueueForceUpdate:function(){},enqueueReplaceState:function(){},enqueueSetState:function(){}},ob=Object.assign,sb={};function No(e,t,a){this.props=e,this.context=t,this.refs=sb,this.updater=a||rb}No.prototype.isReactComponent={};No.prototype.setState=function(e,t){if(typeof e!="object"&&typeof e!="function"&&e!=null)throw Error("takes an object of state variables to update or a function which returns an object of state variables.");this.updater.enqueueSetState(this,e,t,"setState")};No.prototype.forceUpdate=function(e){this.updater.enqueueForceUpdate(this,e,"forceUpdate")};function lb(){}lb.prototype=No.prototype;function bh(e,t,a){this.props=e,this.context=t,this.refs=sb,this.updater=a||rb}var vh=bh.prototype=new lb;vh.constructor=bh;ob(vh,No.prototype);vh.isPureReactComponent=!0;var tb=Array.isArray;function gh(){}var vt={H:null,A:null,T:null,S:null},cb=Object.prototype.hasOwnProperty;function yh(e,t,a){var n=a.ref;return{$$typeof:fh,type:e,key:t,ref:n!==void 0?n:null,props:a}}function k5(e,t){return yh(e.type,t,e.props)}function wh(e){return typeof e=="object"&&e!==null&&e.$$typeof===fh}function C5(e){var t={"=":"=0",":":"=2"};return"$"+e.replace(/[=:]/g,function(a){return t[a]})}var ab=/\/+/g;function ph(e,t){return typeof e=="object"&&e!==null&&e.key!=null?C5(""+e.key):t.toString(36)}function T5(e){switch(e.status){case"fulfilled":return e.value;case"rejected":throw e.reason;default:switch(typeof e.status=="string"?e.then(gh,gh):(e.status="pending",e.then(function(t){e.status==="pending"&&(e.status="fulfilled",e.value=t)},function(t){e.status==="pending"&&(e.status="rejected",e.reason=t)})),e.status){case"fulfilled":return e.value;case"rejected":throw e.reason}}throw e}function $o(e,t,a,n,r){var s=typeof e;(s==="undefined"||s==="boolean")&&(e=null);var c=!1;if(e===null)c=!0;else switch(s){case"bigint":case"string":case"number":c=!0;break;case"object":switch(e.$$typeof){case fh:case m5:c=!0;break;case ib:return c=e._init,$o(c(e._payload),t,a,n,r)}}if(c)return r=r(e),c=n===""?"."+ph(e,0):n,tb(r)?(a="",c!=null&&(a=c.replace(ab,"$&/")+"/"),$o(r,t,a,"",function(p){return p})):r!=null&&(wh(r)&&(r=k5(r,a+(r.key==null||e&&e.key===r.key?"":(""+r.key).replace(ab,"$&/")+"/")+c)),t.push(r)),1;c=0;var d=n===""?".":n+":";if(tb(e))for(var h=0;h<e.length;h++)n=e[h],s=d+ph(n,h),c+=$o(n,t,a,s,r);else if(h=S5(e),typeof h=="function")for(e=h.call(e),h=0;!(n=e.next()).done;)n=n.value,s=d+ph(n,h++),c+=$o(n,t,a,s,r);else if(s==="object"){if(typeof e.then=="function")return $o(T5(e),t,a,n,r);throw t=String(e),Error("Objects are not valid as a React child (found: "+(t==="[object Object]"?"object with keys {"+Object.keys(e).join(", ")+"}":t)+"). If you meant to render a collection of children, use an array instead.")}return c}function Ic(e,t,a){if(e==null)return e;var n=[],r=0;return $o(e,n,"","",function(s){return t.call(a,s,r++)}),n}function E5(e){if(e._status===-1){var t=e._result,a=t();a.then(function(n){(e._status===0||e._status===-1)&&(e._status=1,e._result=n,a.status===void 0&&(a.status="fulfilled",a.value=n))},function(n){(e._status===0||e._status===-1)&&(e._status=2,e._result=n,a.status===void 0&&(a.status="rejected",a.reason=n))}),e._status===-1&&(e._status=0,e._result=a)}if(e._status===1)return e._result.default;throw e._result}var nb=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)};function db(e){var t=vt.T,a={};a.types=t!==null?t.types:null,vt.T=a;try{var n=e(),r=vt.S;r!==null&&r(a,n),typeof n=="object"&&n!==null&&typeof n.then=="function"&&n.then(gh,nb)}catch(s){nb(s)}finally{t!==null&&a.types!==null&&(t.types=a.types),vt.T=t}}function ub(e){var t=vt.T;if(t!==null){var a=t.types;a===null?t.types=[e]:a.indexOf(e)===-1&&a.push(e)}else db(ub.bind(null,e))}var A5={map:Ic,forEach:function(e,t,a){Ic(e,function(){t.apply(this,arguments)},a)},count:function(e){var t=0;return Ic(e,function(){t++}),t},toArray:function(e){return Ic(e,function(t){return t})||[]},only:function(e){if(!wh(e))throw Error("React.Children.only expected to receive a single React element child.");return e}};ke.Activity=$5;ke.Children=A5;ke.Component=No;ke.Fragment=p5;ke.Profiler=f5;ke.PureComponent=bh;ke.StrictMode=g5;ke.Suspense=w5;ke.ViewTransition=N5;ke.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=vt;ke.__COMPILER_RUNTIME={__proto__:null,c:function(e){return vt.H.useMemoCache(e)}};ke.addTransitionType=ub;ke.cache=function(e){return function(){return e.apply(null,arguments)}};ke.cacheSignal=function(){return null};ke.cloneElement=function(e,t,a){if(e==null)throw Error("The argument must be a React element, but you passed "+e+".");var n=ob({},e.props),r=e.key;if(t!=null)for(s in t.key!==void 0&&(r=""+t.key),t)!cb.call(t,s)||s==="key"||s==="__self"||s==="__source"||s==="ref"&&t.ref===void 0||(n[s]=t[s]);var s=arguments.length-2;if(s===1)n.children=a;else if(1<s){for(var c=Array(s),d=0;d<s;d++)c[d]=arguments[d+2];n.children=c}return yh(e.type,r,n)};ke.createContext=function(e){return e={$$typeof:v5,_currentValue:e,_currentValue2:e,_threadCount:0,Provider:null,Consumer:null},e.Provider=e,e.Consumer={$$typeof:b5,_context:e},e};ke.createElement=function(e,t,a){var n,r={},s=null;if(t!=null)for(n in t.key!==void 0&&(s=""+t.key),t)cb.call(t,n)&&n!=="key"&&n!=="__self"&&n!=="__source"&&(r[n]=t[n]);var c=arguments.length-2;if(c===1)r.children=a;else if(1<c){for(var d=Array(c),h=0;h<c;h++)d[h]=arguments[h+2];r.children=d}if(e&&e.defaultProps)for(n in c=e.defaultProps,c)r[n]===void 0&&(r[n]=c[n]);return yh(e,s,r)};ke.createRef=function(){return{current:null}};ke.forwardRef=function(e){return{$$typeof:y5,render:e}};ke.isValidElement=wh;ke.lazy=function(e){return{$$typeof:ib,_payload:{_status:-1,_result:e},_init:E5}};ke.memo=function(e,t){return{$$typeof:x5,type:e,compare:t===void 0?null:t}};ke.startTransition=db;ke.unstable_useCacheRefresh=function(){return vt.H.useCacheRefresh()};ke.use=function(e){return vt.H.use(e)};ke.useActionState=function(e,t,a){return vt.H.useActionState(e,t,a)};ke.useCallback=function(e,t){return vt.H.useCallback(e,t)};ke.useContext=function(e){return vt.H.useContext(e)};ke.useDebugValue=function(){};ke.useDeferredValue=function(e,t){return vt.H.useDeferredValue(e,t)};ke.useEffect=function(e,t){return vt.H.useEffect(e,t)};ke.useEffectEvent=function(e){return vt.H.useEffectEvent(e)};ke.useId=function(){return vt.H.useId()};ke.useImperativeHandle=function(e,t,a){return vt.H.useImperativeHandle(e,t,a)};ke.useInsertionEffect=function(e,t){return vt.H.useInsertionEffect(e,t)};ke.useLayoutEffect=function(e,t){return vt.H.useLayoutEffect(e,t)};ke.useMemo=function(e,t){return vt.H.useMemo(e,t)};ke.useOptimistic=function(e,t){return vt.H.useOptimistic(e,t)};ke.useReducer=function(e,t,a){return vt.H.useReducer(e,t,a)};ke.useRef=function(e){return vt.H.useRef(e)};ke.useState=function(e){return vt.H.useState(e)};ke.useSyncExternalStore=function(e,t,a){return vt.H.useSyncExternalStore(e,t,a)};ke.useTransition=function(){return vt.H.useTransition()};ke.version="19.3.0"});var So=Hn((oC,mb)=>{"use strict";mb.exports=hb()});var zb=Hn(Tt=>{"use strict";function Ah(e,t){var a=e.length;e.push(t);e:for(;0<a;){var n=a-1>>>1,r=e[n];if(0<_c(r,t))e[n]=t,e[a]=r,a=n;else break e}}function Un(e){return e.length===0?null:e[0]}function Uc(e){if(e.length===0)return null;var t=e[0],a=e.pop();if(a!==t){e[0]=a;e:for(var n=0,r=e.length,s=r>>>1;n<s;){var c=2*(n+1)-1,d=e[c],h=c+1,p=e[h];if(0>_c(d,a))h<r&&0>_c(p,d)?(e[n]=p,e[h]=a,n=h):(e[n]=d,e[c]=a,n=c);else if(h<r&&0>_c(p,a))e[n]=p,e[h]=a,n=h;else break e}}return t}function _c(e,t){var a=e.sortIndex-t.sortIndex;return a!==0?a:e.id-t.id}Tt.unstable_now=void 0;typeof performance=="object"&&typeof performance.now=="function"?(Nb=performance,Tt.unstable_now=function(){return Nb.now()}):(Ch=Date,Sb=Ch.now(),Tt.unstable_now=function(){return Ch.now()-Sb});var Nb,Ch,Sb,ui=[],Ii=[],_5=1,an=null,ba=3,Rh=!1,tl=!1,al=!1,Mh=!1,Tb=typeof setTimeout=="function"?setTimeout:null,Eb=typeof clearTimeout=="function"?clearTimeout:null,kb=typeof setImmediate<"u"?setImmediate:null;function Hc(e){for(var t=Un(Ii);t!==null;){if(t.callback===null)Uc(Ii);else if(t.startTime<=e)Uc(Ii),t.sortIndex=t.expirationTime,Ah(ui,t);else break;t=Un(Ii)}}function zh(e){if(al=!1,Hc(e),!tl)if(Un(ui)!==null)tl=!0,To||(To=!0,Co());else{var t=Un(Ii);t!==null&&Vh(zh,t.startTime-e)}}var To=!1,nl=-1,Ab=5,Rb=-1;function Mb(){return Mh?!0:!(Tt.unstable_now()-Rb<Ab)}function Th(){if(Mh=!1,To){var e=Tt.unstable_now();Rb=e;var t=!0;try{e:{tl=!1,al&&(al=!1,Eb(nl),nl=-1),Rh=!0;var a=ba;try{t:{for(Hc(e),an=Un(ui);an!==null&&!(an.expirationTime>e&&Mb());){var n=an.callback;if(typeof n=="function"){an.callback=null,ba=an.priorityLevel;var r=n(an.expirationTime<=e);if(e=Tt.unstable_now(),typeof r=="function"){an.callback=r,Hc(e),t=!0;break t}an===Un(ui)&&Uc(ui),Hc(e)}else Uc(ui);an=Un(ui)}if(an!==null)t=!0;else{var s=Un(Ii);s!==null&&Vh(zh,s.startTime-e),t=!1}}break e}finally{an=null,ba=a,Rh=!1}t=void 0}}finally{t?Co():To=!1}}}var Co;typeof kb=="function"?Co=function(){kb(Th)}:typeof MessageChannel<"u"?(Eh=new MessageChannel,Cb=Eh.port2,Eh.port1.onmessage=Th,Co=function(){Cb.postMessage(null)}):Co=function(){Tb(Th,0)};var Eh,Cb;function Vh(e,t){nl=Tb(function(){e(Tt.unstable_now())},t)}Tt.unstable_IdlePriority=5;Tt.unstable_ImmediatePriority=1;Tt.unstable_LowPriority=4;Tt.unstable_NormalPriority=3;Tt.unstable_Profiling=null;Tt.unstable_UserBlockingPriority=2;Tt.unstable_cancelCallback=function(e){e.callback=null};Tt.unstable_forceFrameRate=function(e){0>e||125<e?console.error("forceFrameRate takes a positive int between 0 and 125, forcing frame rates higher than 125 fps is not supported"):Ab=0<e?Math.floor(1e3/e):5};Tt.unstable_getCurrentPriorityLevel=function(){return ba};Tt.unstable_next=function(e){switch(ba){case 1:case 2:case 3:var t=3;break;default:t=ba}var a=ba;ba=t;try{return e()}finally{ba=a}};Tt.unstable_requestPaint=function(){Mh=!0};Tt.unstable_runWithPriority=function(e,t){switch(e){case 1:case 2:case 3:case 4:case 5:break;default:e=3}var a=ba;ba=e;try{return t()}finally{ba=a}};Tt.unstable_scheduleCallback=function(e,t,a){var n=Tt.unstable_now();switch(typeof a=="object"&&a!==null?(a=a.delay,a=typeof a=="number"&&0<a?n+a:n):a=n,e){case 1:var r=-1;break;case 2:r=250;break;case 5:r=1073741823;break;case 4:r=1e4;break;default:r=5e3}return r=a+r,e={id:_5++,callback:t,priorityLevel:e,startTime:a,expirationTime:r,sortIndex:-1},a>n?(e.sortIndex=a,Ah(Ii,e),Un(ui)===null&&e===Un(Ii)&&(al?(Eb(nl),nl=-1):al=!0,Vh(zh,a-n))):(e.sortIndex=r,Ah(ui,e),tl||Rh||(tl=!0,To||(To=!0,Co()))),e};Tt.unstable_shouldYield=Mb;Tt.unstable_wrapCallback=function(e){var t=ba;return function(){var a=ba;ba=t;try{return e.apply(this,arguments)}finally{ba=a}}}});var Ob=Hn((bC,Vb)=>{"use strict";Vb.exports=zb()});var _b=Hn(va=>{"use strict";var H5=So();function Db(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)t+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function Di(){}var Ca={d:{f:Di,r:function(){throw Error(Db(522))},D:Di,C:Di,L:Di,m:Di,X:Di,S:Di,M:Di},p:0,findDOMNode:null},U5=Symbol.for("react.portal"),q5=Symbol.for("react.recoverable"),Ib=Symbol.for("react.optimistic_key");function L5(e,t,a){var n=3<arguments.length&&arguments[3]!==void 0?arguments[3]:null;return{$$typeof:U5,key:n==null?null:n===Ib?Ib:""+n,children:e,containerInfo:t,implementation:a}}var il=H5.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE;function qc(e,t){if(e==="font")return"";if(typeof t=="string")return t==="use-credentials"?t:""}va.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE=Ca;va.browser=function(e){return{$$typeof:q5,_reason:e}};va.createPortal=function(e,t){var a=2<arguments.length&&arguments[2]!==void 0?arguments[2]:null;if(!t||t.nodeType!==1&&t.nodeType!==9&&t.nodeType!==11)throw Error(Db(299));return L5(e,t,null,a)};va.flushSync=function(e){var t=il.T,a=Ca.p;try{if(il.T=null,Ca.p=2,e)return e()}finally{il.T=t,Ca.p=a,Ca.d.f()}};va.preconnect=function(e,t){typeof e=="string"&&(t?(t=t.crossOrigin,t=typeof t=="string"?t==="use-credentials"?t:"":void 0):t=null,Ca.d.C(e,t))};va.prefetchDNS=function(e){typeof e=="string"&&Ca.d.D(e)};va.preinit=function(e,t){if(typeof e=="string"&&t&&typeof t.as=="string"){var a=t.as,n=qc(a,t.crossOrigin),r=typeof t.integrity=="string"?t.integrity:void 0,s=typeof t.fetchPriority=="string"?t.fetchPriority:void 0;a==="style"?Ca.d.S(e,typeof t.precedence=="string"?t.precedence:void 0,{crossOrigin:n,integrity:r,fetchPriority:s}):a==="script"&&Ca.d.X(e,{crossOrigin:n,integrity:r,fetchPriority:s,nonce:typeof t.nonce=="string"?t.nonce:void 0})}};va.preinitModule=function(e,t){if(typeof e=="string")if(typeof t=="object"&&t!==null){if(t.as==null||t.as==="script"){var a=qc(t.as,t.crossOrigin);Ca.d.M(e,{crossOrigin:a,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0})}}else t==null&&Ca.d.M(e)};va.preload=function(e,t){if(typeof e=="string"&&typeof t=="object"&&t!==null&&typeof t.as=="string"){var a=t.as,n=qc(a,t.crossOrigin);Ca.d.L(e,a,{crossOrigin:n,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,type:typeof t.type=="string"?t.type:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0,referrerPolicy:typeof t.referrerPolicy=="string"?t.referrerPolicy:void 0,imageSrcSet:typeof t.imageSrcSet=="string"?t.imageSrcSet:void 0,imageSizes:typeof t.imageSizes=="string"?t.imageSizes:void 0,media:typeof t.media=="string"?t.media:void 0})}};va.preloadModule=function(e,t){if(typeof e=="string")if(t){var a=qc(t.as,t.crossOrigin);Ca.d.m(e,{as:typeof t.as=="string"&&t.as!=="script"?t.as:void 0,crossOrigin:a,integrity:typeof t.integrity=="string"?t.integrity:void 0,nonce:typeof t.nonce=="string"?t.nonce:void 0,fetchPriority:typeof t.fetchPriority=="string"?t.fetchPriority:void 0})}else Ca.d.m(e)};va.requestFormReset=function(e){Ca.d.r(e)};va.unstable_batchedUpdates=function(e,t){return e(t)};va.useFormState=function(e,t,a){return il.H.useFormState(e,t,a)};va.useFormStatus=function(){return il.H.useHostTransitionStatus()};va.version="19.3.0"});var qb=Hn((yC,Ub)=>{"use strict";function Hb(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(Hb)}catch(e){console.error(e)}}Hb(),Ub.exports=_b()});var C1=Hn(xu=>{"use strict";var Wt=Ob(),ky=So(),B5=qb();function q(e){var t="https://react.dev/errors/"+e;if(1<arguments.length){t+="?args[]="+encodeURIComponent(arguments[1]);for(var a=2;a<arguments.length;a++)t+="&args[]="+encodeURIComponent(arguments[a])}return"Minified React error #"+e+"; visit "+t+" for the full message or use the non-minified dev environment for full errors and additional helpful warnings."}function Cy(e){return!(!e||e.nodeType!==1&&e.nodeType!==9&&e.nodeType!==11)}function Gl(e){for(var t=e,a=t;a&&!a.alternate;)t=a,(t.flags&4098)!==0&&(e=t.return),a=t.return;for(;t.return;)t=t.return;return t.tag===3?e:null}function Ty(e){if(e.tag===13){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function Ey(e){if(e.tag===31){var t=e.memoizedState;if(t===null&&(e=e.alternate,e!==null&&(t=e.memoizedState)),t!==null)return t.dehydrated}return null}function Lb(e){if(Gl(e)!==e)throw Error(q(188))}function j5(e){var t=e.alternate;if(!t){if(t=Gl(e),t===null)throw Error(q(188));return t!==e?null:e}for(var a=e,n=t;;){var r=a.return;if(r===null)break;var s=r.alternate;if(s===null){if(n=r.return,n!==null){a=n;continue}break}if(r.child===s.child){for(s=r.child;s;){if(s===a)return Lb(r),e;if(s===n)return Lb(r),t;s=s.sibling}throw Error(q(188))}if(a.return!==n.return)a=r,n=s;else{for(var c=!1,d=r.child;d;){if(d===a){c=!0,a=r,n=s;break}if(d===n){c=!0,n=r,a=s;break}d=d.sibling}if(!c){for(d=s.child;d;){if(d===a){c=!0,a=s,n=r;break}if(d===n){c=!0,n=s,a=r;break}d=d.sibling}if(!c)throw Error(q(189))}}if(a.alternate!==n)throw Error(q(190))}if(a.tag!==3)throw Error(q(188));return a.stateNode.current===a?e:t}function Ay(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e;for(e=e.child;e!==null;){if(t=Ay(e),t!==null)return t;e=e.sibling}return null}function Ha(e,t,a,n,r,s){for(;e!==null;){if((e.tag===5||e.tag===27||e.tag===6)&&a(e,n,r,s)||(e.tag!==22||e.memoizedState===null)&&(t||e.tag!==5&&e.tag!==27)&&Ha(e.child,t,a,n,r,s))return!0;e=e.sibling}return!1}function jr(e){for(e=e.return;e!==null;){if(e.tag===3||e.tag===5||e.tag===27)return e;e=e.return}return null}function Bb(e){var t=!1;for(e=e.return;e!==null&&(e.tag===4&&(t=!0),!(e.tag===3||e.tag===5||e.tag===27));)e=e.return;return t}function Ry(e){var t=[null,null],a=jr(e);return a===null||My(t,e,a.child,{foundSelf:!1}),t}function My(e,t,a,n){for(;a!==null;){if(a===t)n.foundSelf=!0;else if(a.tag===5||a.tag===27||a.tag===6){if(n.foundSelf)return e[1]=a,!0;e[0]=a}else if((a.tag!==22||a.memoizedState===null)&&My(e,t,a.child,n))return!0;a=a.sibling}return!1}function Kt(e){switch(e.tag){case 5:case 27:case 6:return e.stateNode;case 3:return e.stateNode.containerInfo;default:throw Error(q(559))}}var Oo=null,um=null;function Y5(e,t,a){return e===a?!0:e===t?(Oo=e,!0):!1}function G5(e,t,a){return e===a?(um=e,!1):e===t?(um!==null&&(Oo=e),!0):!1}function jb(e){if(e===null)return null;do e=e===null?null:e.return;while(e&&e.tag!==5&&e.tag!==27&&e.tag!==3);return e||null}function hm(e,t,a){for(var n=0,r=e;r;r=a(r))n++;r=0;for(var s=t;s;s=a(s))r++;for(;0<n-r;)e=a(e),n--;for(;0<r-n;)t=a(t),r--;for(;n--;){if(e===t||t!==null&&e===t.alternate)return e;e=a(e),t=a(t)}return null}var pt=Object.assign,P5=Symbol.for("react.element"),Lc=Symbol.for("react.transitional.element"),ul=Symbol.for("react.portal"),Io=Symbol.for("react.fragment"),zy=Symbol.for("react.strict_mode"),mm=Symbol.for("react.profiler"),Vy=Symbol.for("react.consumer"),Gn=Symbol.for("react.context"),$p=Symbol.for("react.forward_ref"),pm=Symbol.for("react.suspense"),gm=Symbol.for("react.suspense_list"),Np=Symbol.for("react.memo"),qi=Symbol.for("react.lazy"),fm=Symbol.for("react.activity"),X5=Symbol.for("react.legacy_hidden"),Z5=Symbol.for("react.memo_cache_sentinel"),bm=Symbol.for("react.view_transition"),Q5=Symbol.for("react.recoverable"),Yb=Symbol.iterator;function rl(e){return e===null||typeof e!="object"?null:(e=Yb&&e[Yb]||e["@@iterator"],typeof e=="function"?e:null)}var F5=Symbol.for("react.client.reference");function vm(e){if(e==null)return null;if(typeof e=="function")return e.$$typeof===F5?null:e.displayName||e.name||null;if(typeof e=="string")return e;switch(e){case Io:return"Fragment";case mm:return"Profiler";case zy:return"StrictMode";case pm:return"Suspense";case gm:return"SuspenseList";case fm:return"Activity";case bm:return"ViewTransition"}if(typeof e=="object")switch(e.$$typeof){case ul:return"Portal";case Gn:return e.displayName||"Context";case Vy:return(e._context.displayName||"Context")+".Consumer";case $p:var t=e.render;return e=e.displayName,e||(e=t.displayName||t.name||"",e=e!==""?"ForwardRef("+e+")":"ForwardRef"),e;case Np:return t=e.displayName||null,t!==null?t:vm(e.type)||"Memo";case qi:t=e._payload,e=e._init;try{return vm(e(t))}catch{}}return null}var hl=Array.isArray,$e=ky.__CLIENT_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Ke=B5.__DOM_INTERNALS_DO_NOT_USE_OR_WARN_USERS_THEY_CANNOT_UPGRADE,Rr={pending:!1,data:null,method:null,action:null},ym=[],Do=-1;function Kn(e){return{current:e}}function ua(e){0>Do||(e.current=ym[Do],ym[Do]=null,Do--)}function xt(e,t){Do++,ym[Do]=e.current,e.current=t}var Qn=Kn(null),Al=Kn(null),Qi=Kn(null),Td=Kn(null);function Ed(e,t){switch(xt(Qi,t),xt(Al,e),xt(Qn,null),t.nodeType){case 9:case 11:e=(e=t.documentElement)&&(e=e.namespaceURI)?iy(e):0;break;default:if(e=t.tagName,t=t.namespaceURI)t=iy(t),e=t1(t,e);else switch(e){case"svg":e=1;break;case"math":e=2;break;default:e=0}}ua(Qn),xt(Qn,e)}function as(){ua(Qn),ua(Al),ua(Qi)}function wm(e){var t=e.memoizedState;t!==null&&(hs._currentValue=t.memoizedState,xt(Td,e)),t=Qn.current;var a=t1(t,e.type);t!==a&&(xt(Al,e),xt(Qn,a))}function Ad(e){Al.current===e&&(ua(Qn),ua(Al)),Td.current===e&&(ua(Td),hs._currentValue=Rr)}var Oh,Gb;function Hi(e){if(Oh===void 0)try{throw Error()}catch(a){var t=a.stack.trim().match(/\n( *(at )?)/);Oh=t&&t[1]||"",Gb=-1<a.stack.indexOf(`
    at`)?" (<anonymous>)":-1<a.stack.indexOf("@")?"@unknown:0:0":""}return`
`+Oh+e+Gb}var Ih=!1;function Dh(e,t){if(!e||Ih)return"";Ih=!0;var a=Error.prepareStackTrace;Error.prepareStackTrace=void 0;try{var n={DetermineComponentFrameRoot:function(){try{if(t){var $=function(){throw Error()};if(Object.defineProperty($.prototype,"props",{set:function(){throw Error()}}),typeof Reflect=="object"&&Reflect.construct){try{Reflect.construct($,[])}catch(V){var f=V}Reflect.construct(e,[],$)}else{try{$.call()}catch(V){f=V}$=!1;try{var y=Object.getOwnPropertyDescriptor(e.prototype,"props");Object.defineProperty(e.prototype,"props",{configurable:!0,set:function(){throw Error()}}),$=!0,new e}finally{$&&(y!==void 0?Object.defineProperty(e.prototype,"props",y):delete e.prototype.props)}}}else{try{throw Error()}catch(V){f=V}($=e())&&typeof $.catch=="function"&&$.catch(function(){})}}catch(V){if(V&&f&&typeof V.stack=="string")return[V.stack,f.stack]}return[null,null]}};n.DetermineComponentFrameRoot.displayName="DetermineComponentFrameRoot";var r=Object.getOwnPropertyDescriptor(n.DetermineComponentFrameRoot,"name");r&&r.configurable&&Object.defineProperty(n.DetermineComponentFrameRoot,"name",{value:"DetermineComponentFrameRoot"});var s=n.DetermineComponentFrameRoot(),c=s[0],d=s[1];if(c&&d){var h=c.split(`
`),p=d.split(`
`);for(r=n=0;n<h.length&&!h[n].includes("DetermineComponentFrameRoot");)n++;for(;r<p.length&&!p[r].includes("DetermineComponentFrameRoot");)r++;if(n===h.length||r===p.length)for(n=h.length-1,r=p.length-1;1<=n&&0<=r&&h[n]!==p[r];)r--;for(;1<=n&&0<=r;n--,r--)if(h[n]!==p[r]){if(n!==1||r!==1)do if(n--,r--,0>r||h[n]!==p[r]){var b=`
`+h[n].replace(" at new "," at ");return e.displayName&&b.includes("<anonymous>")&&(b=b.replace("<anonymous>",e.displayName)),b}while(1<=n&&0<=r);break}}}finally{Ih=!1,Error.prepareStackTrace=a}return(a=e?e.displayName||e.name:"")?Hi(a):""}function J5(e,t){switch(e.tag){case 26:case 27:case 5:return Hi(e.type);case 16:return Hi("Lazy");case 13:return e.child!==t&&t!==null?Hi("Suspense Fallback"):Hi("Suspense");case 19:return Hi("SuspenseList");case 0:case 15:return Dh(e.type,!1);case 11:return Dh(e.type.render,!1);case 1:return Dh(e.type,!0);case 31:return Hi("Activity");case 30:return Hi("ViewTransition");default:return""}}function Pb(e){try{var t="",a=null;do t+=J5(e,a),a=e,e=e.return;while(e);return t}catch(n){return`
Error generating stack: `+n.message+`
`+n.stack}}var xm=Object.prototype.hasOwnProperty,Sp=Wt.unstable_scheduleCallback,_h=Wt.unstable_cancelCallback,K5=Wt.unstable_shouldYield,W5=Wt.unstable_requestPaint,Pa=Wt.unstable_now,eN=Wt.unstable_getCurrentPriorityLevel,Oy=Wt.unstable_ImmediatePriority,Iy=Wt.unstable_UserBlockingPriority,Rd=Wt.unstable_NormalPriority,tN=Wt.unstable_LowPriority,Dy=Wt.unstable_IdlePriority,aN=Wt.log,nN=Wt.unstable_setDisableYieldValue,Pl=null,Xa=null;function ji(e){if(typeof aN=="function"&&nN(e),Xa&&typeof Xa.setStrictMode=="function")try{Xa.setStrictMode(Pl,e)}catch{}}var Za=Math.clz32?Math.clz32:oN,iN=Math.log,rN=Math.LN2;function oN(e){return e>>>=0,e===0?32:31-(iN(e)/rN|0)|0}var Bc=256,jc=262144,Yc=4194304;function kr(e){var t=e&42;if(t!==0)return t;switch(e&-e){case 1:return 1;case 2:return 2;case 4:return 4;case 8:return 8;case 16:return 16;case 32:return 32;case 64:return 64;case 128:return 128;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:return e&-e;case 262144:case 524288:case 1048576:case 2097152:return e&3932160;case 4194304:case 8388608:case 16777216:case 33554432:return e&62914560;case 67108864:return 67108864;case 134217728:return 134217728;case 268435456:return 268435456;case 536870912:return 536870912;case 1073741824:return 0;default:return e}}function au(e,t,a){var n=e.pendingLanes;if(n===0)return 0;var r=0,s=e.suspendedLanes,c=e.pingedLanes;e=e.warmLanes;var d=n&134217727;return d!==0?(n=d&~s,n!==0?r=kr(n):(c&=d,c!==0?r=kr(c):a||(a=d&~e,a!==0&&(r=kr(a))))):(d=n&~s,d!==0?r=kr(d):c!==0?r=kr(c):a||(a=n&~e,a!==0&&(r=kr(a)))),r===0?0:t!==0&&t!==r&&(t&s)===0&&(s=r&-r,a=t&-t,s>=a||s===32&&(a&4194048)!==0)?t:r}function Xl(e,t){return(e.pendingLanes&~(e.suspendedLanes&~e.pingedLanes)&t)===0}function _y(e,t){(t&8)!==0&&(t|=t&32);var a=e.entangledLanes;if(a!==0)for(e=e.entanglements,a&=t;0<a;){var n=31-Za(a),r=1<<n;t|=e[n],a&=~r}return t}function sN(e,t){switch(e){case 1:case 2:case 4:case 8:case 64:return t+250;case 16:case 32:case 128:case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:return t+5e3;case 4194304:case 8388608:case 16777216:case 33554432:return-1;case 67108864:case 134217728:case 268435456:case 536870912:case 1073741824:return-1;default:return-1}}function Hy(){var e=Yc;return Yc<<=1,(Yc&62914560)===0&&(Yc=4194304),e}function Hh(e){for(var t=[],a=0;31>a;a++)t.push(e);return t}function Zl(e,t){e.pendingLanes|=t,t!==268435456&&(e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0)}function lN(e,t,a,n,r,s){var c=e.pendingLanes;e.pendingLanes=a,e.suspendedLanes=0,e.pingedLanes=0,e.warmLanes=0,e.expiredLanes&=a,e.entangledLanes&=a,e.errorRecoveryDisabledLanes&=a,e.shellSuspendCounter=0;var d=e.entanglements,h=e.expirationTimes,p=e.hiddenUpdates;for(a=c&~a;0<a;){var b=31-Za(a),$=1<<b;d[b]=0,h[b]=-1;var f=p[b];if(f!==null)for(p[b]=null,b=0;b<f.length;b++){var y=f[b];y!==null&&(y.lane&=-536870913)}a&=~$}n!==0&&Uy(e,n,0),s!==0&&r===0&&e.tag!==0&&(e.suspendedLanes|=s&~(c&~t))}function Uy(e,t,a){e.pendingLanes|=t,e.suspendedLanes&=~t;var n=31-Za(t);e.entangledLanes|=t,e.entanglements[n]=e.entanglements[n]|1073741824|a&261930}function qy(e,t){var a=e.entangledLanes|=t;for(e=e.entanglements;a;){var n=31-Za(a),r=1<<n;r&t|e[n]&t&&(e[n]|=t),a&=~r}}function Ly(e,t){var a=t&-t;return a=(a&42)!==0?1:kp(a),(a&(e.suspendedLanes|t))!==0?0:a}function kp(e){switch(e){case 2:e=1;break;case 8:e=4;break;case 32:e=16;break;case 256:case 512:case 1024:case 2048:case 4096:case 8192:case 16384:case 32768:case 65536:case 131072:case 262144:case 524288:case 1048576:case 2097152:case 4194304:case 8388608:case 16777216:case 33554432:e=128;break;case 268435456:e=134217728;break;default:e=0}return e}function Cp(e){return e&=-e,2<e?8<e?(e&134217727)!==0?32:268435456:8:2}function By(){var e=Ke.p;return e!==0?e:(e=window.event,e===void 0?32:N1(e.type))}function Xb(e,t){var a=Ke.p;try{return Ke.p=e,t()}finally{Ke.p=a}}var Si=Math.random().toString(36).slice(2),ca="__reactFiber$"+Si,Ua="__reactProps$"+Si,gs="__reactContainer$"+Si,Zb="__reactEvents$"+Si,cN="__reactListeners$"+Si,dN="__reactHandles$"+Si,Qb="__reactResources$"+Si,Ql="__reactMarker$"+Si,Md="__reactLoad$"+Si;function nu(e){delete e[ca],delete e[Ua],delete e[cN],delete e[dN]}function Er(e){var t;if(t=e[ca])return t;for(var a=e.parentNode;a;){if(t=a[gs]||a[ca]){if(a=t.alternate,t.child!==null||a!==null&&a.child!==null)for(e=hy(e);e!==null;){if(a=e[ca])return a;e=hy(e)}return t}e=a,a=e.parentNode}return null}function fs(e){if(e=e[ca]||e[gs]){var t=e.tag;if(t===5||t===6||t===13||t===31||t===26||t===27||t===3)return e}return null}function ml(e){var t=e.tag;if(t===5||t===26||t===27||t===6)return e.stateNode;throw Error(q(33))}function Po(e){var t=e[Qb];return t||(t=e[Qb]={hoistableStyles:new Map,hoistableScripts:new Map}),t}function ia(e){e[Ql]=!0}function jy(e){e[Md]=void 0}var Yy=new Set,Gy={};function Yr(e,t){ns(e,t),ns(e+"Capture",t)}function ns(e,t){for(Gy[e]=t,e=0;e<t.length;e++)Yy.add(t[e])}var uN=RegExp("^[:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD][:A-Z_a-z\\u00C0-\\u00D6\\u00D8-\\u00F6\\u00F8-\\u02FF\\u0370-\\u037D\\u037F-\\u1FFF\\u200C-\\u200D\\u2070-\\u218F\\u2C00-\\u2FEF\\u3001-\\uD7FF\\uF900-\\uFDCF\\uFDF0-\\uFFFD\\-.0-9\\u00B7\\u0300-\\u036F\\u203F-\\u2040]*$"),Fb={},Jb={};function hN(e){return xm.call(Jb,e)?!0:xm.call(Fb,e)?!1:uN.test(e)?Jb[e]=!0:(Fb[e]=!0,!1)}var Qe=!1;function Kb(){var e=Qe;return Qe=!1,e}function ld(e,t,a){if(hN(t))if(a===null)e.removeAttribute(t);else{switch(typeof a){case"undefined":case"function":case"symbol":e.removeAttribute(t);return;case"boolean":var n=t.toLowerCase().slice(0,5);if(n!=="data-"&&n!=="aria-"){e.removeAttribute(t);return}}e.setAttribute(t,a)}}function Gc(e,t,a){if(a===null)e.removeAttribute(t);else{switch(typeof a){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(t);return}e.setAttribute(t,a)}}function hi(e,t,a,n){if(n===null)e.removeAttribute(a);else{switch(typeof n){case"undefined":case"function":case"symbol":case"boolean":e.removeAttribute(a);return}e.setAttributeNS(t,a,n)}}function Ba(e){switch(typeof e){case"bigint":case"boolean":case"number":case"string":case"undefined":return e;case"object":return e;default:return""}}function Py(e){var t=e.type;return(e=e.nodeName)&&e.toLowerCase()==="input"&&(t==="checkbox"||t==="radio")}function mN(e,t,a){var n=Object.getOwnPropertyDescriptor(e.constructor.prototype,t);if(!e.hasOwnProperty(t)&&typeof n<"u"&&typeof n.get=="function"&&typeof n.set=="function"){var r=n.get,s=n.set;return Object.defineProperty(e,t,{configurable:!0,get:function(){return r.call(this)},set:function(c){a=""+c,s.call(this,c)}}),Object.defineProperty(e,t,{enumerable:n.enumerable}),{getValue:function(){return a},setValue:function(c){a=""+c},stopTracking:function(){e._valueTracker=null,delete e[t]}}}}function $m(e){if(!e._valueTracker){var t=Py(e)?"checked":"value";e._valueTracker=mN(e,t,""+e[t])}}function Xy(e){if(!e)return!1;var t=e._valueTracker;if(!t)return!0;var a=t.getValue(),n="";return e&&(n=Py(e)?e.checked?"true":"false":e.value),e=n,e!==a?(t.setValue(e),!0):!1}var pN=/[\n"\\]/g;function ln(e){return e.replace(pN,function(t){return"\\"+t.charCodeAt(0).toString(16)+" "})}function Nm(e,t,a,n,r,s,c,d){e.name="",c!=null&&typeof c!="function"&&typeof c!="symbol"&&typeof c!="boolean"?e.type=c:e.removeAttribute("type"),t!=null?c==="number"?(t===0&&e.value===""||e.value!=t)&&(e.value=""+Ba(t)):e.value!==""+Ba(t)&&(e.value=""+Ba(t)):c!=="submit"&&c!=="reset"||e.removeAttribute("value"),t!=null?c==="number"&&e.value==t?Uh(e,Ba(e.value)):Uh(e,Ba(t)):a!=null?Uh(e,Ba(a)):n!=null&&e.removeAttribute("value"),r==null&&s!=null&&(e.defaultChecked=!!s),r!=null&&(e.checked=r&&typeof r!="function"&&typeof r!="symbol"),d!=null&&typeof d!="function"&&typeof d!="symbol"&&typeof d!="boolean"?e.name=""+Ba(d):e.removeAttribute("name")}function Zy(e,t,a,n,r,s,c,d){if(s!=null&&typeof s!="function"&&typeof s!="symbol"&&typeof s!="boolean"&&(e.type=s),t!=null||a!=null){if(!(s!=="submit"&&s!=="reset"||t!=null)){$m(e);return}a=a!=null?""+Ba(a):"",t=t!=null?""+Ba(t):a,d||t===e.value||(e.value=t),e.defaultValue=t}n=n??r,n=typeof n!="function"&&typeof n!="symbol"&&!!n,e.checked=d?e.checked:!!n,e.defaultChecked=!!n,c!=null&&typeof c!="function"&&typeof c!="symbol"&&typeof c!="boolean"&&(e.name=c),$m(e)}function Uh(e,t){e.defaultValue!==""+t&&(e.defaultValue=""+t)}function Xo(e,t,a,n){if(e=e.options,t){t={};for(var r=0;r<a.length;r++)t["$"+a[r]]=!0;for(a=0;a<e.length;a++)r=t.hasOwnProperty("$"+e[a].value),e[a].selected!==r&&(e[a].selected=r),r&&n&&(e[a].defaultSelected=!0)}else{for(a=""+Ba(a),t=null,r=0;r<e.length;r++){if(e[r].value===a){e[r].selected=!0,n&&(e[r].defaultSelected=!0);return}t!==null||e[r].disabled||(t=e[r])}t!==null&&(t.selected=!0)}}function Qy(e,t,a){if(t!=null&&(t=""+Ba(t),t!==e.value&&(e.value=t),a==null)){e.defaultValue!==t&&(e.defaultValue=t);return}e.defaultValue=a!=null?""+Ba(a):""}function Fy(e,t,a,n){if(t==null){if(n!=null){if(a!=null)throw Error(q(92));if(hl(n)){if(1<n.length)throw Error(q(93));n=n[0]}a=n}a==null&&(a=""),t=a}a=Ba(t),e.defaultValue=a,n=e.textContent,n===a&&n!==""&&n!==null&&(e.value=n),$m(e)}function is(e,t){if(t){var a=e.firstChild;if(a&&a===e.lastChild&&a.nodeType===3){a.nodeValue=t;return}}e.textContent=t}var gN=new Set("animationIterationCount aspectRatio borderImageOutset borderImageSlice borderImageWidth boxFlex boxFlexGroup boxOrdinalGroup columnCount columns flex flexGrow flexPositive flexShrink flexNegative flexOrder gridArea gridRow gridRowEnd gridRowSpan gridRowStart gridColumn gridColumnEnd gridColumnSpan gridColumnStart fontWeight lineClamp lineHeight opacity order orphans scale tabSize widows zIndex zoom fillOpacity floodOpacity stopOpacity strokeDasharray strokeDashoffset strokeMiterlimit strokeOpacity strokeWidth MozAnimationIterationCount MozBoxFlex MozBoxFlexGroup MozLineClamp msAnimationIterationCount msFlex msZoom msFlexGrow msFlexNegative msFlexOrder msFlexPositive msFlexShrink msGridColumn msGridColumnSpan msGridRow msGridRowSpan WebkitAnimationIterationCount WebkitBoxFlex WebKitBoxFlexGroup WebkitBoxOrdinalGroup WebkitColumnCount WebkitColumns WebkitFlex WebkitFlexGrow WebkitFlexPositive WebkitFlexShrink WebkitLineClamp".split(" "));function Wb(e,t,a){var n=t.indexOf("--")===0;a==null||typeof a=="boolean"||a===""?n?e.setProperty(t,""):t==="float"?e.cssFloat="":e[t]="":n?e.setProperty(t,a):typeof a!="number"||a===0||gN.has(t)?t==="float"?e.cssFloat=a:e[t]=(""+a).trim():e[t]=a+"px"}function Jy(e,t,a){if(t!=null&&typeof t!="object")throw Error(q(62));if(e=e.style,a!=null){for(var n in a)!a.hasOwnProperty(n)||t!=null&&t.hasOwnProperty(n)||(n.indexOf("--")===0?e.setProperty(n,""):n==="float"?e.cssFloat="":e[n]="",Qe=!0);for(var r in t)n=t[r],t.hasOwnProperty(r)&&a[r]!==n&&(Wb(e,r,n),Qe=!0)}else for(var s in t)t.hasOwnProperty(s)&&Wb(e,s,t[s])}function Tp(e){if(e.indexOf("-")===-1)return!1;switch(e){case"annotation-xml":case"color-profile":case"font-face":case"font-face-src":case"font-face-uri":case"font-face-format":case"font-face-name":case"missing-glyph":return!1;default:return!0}}var fN=new Map([["acceptCharset","accept-charset"],["htmlFor","for"],["httpEquiv","http-equiv"],["crossOrigin","crossorigin"],["accentHeight","accent-height"],["alignmentBaseline","alignment-baseline"],["arabicForm","arabic-form"],["baselineShift","baseline-shift"],["capHeight","cap-height"],["clipPath","clip-path"],["clipRule","clip-rule"],["colorInterpolation","color-interpolation"],["colorInterpolationFilters","color-interpolation-filters"],["colorProfile","color-profile"],["colorRendering","color-rendering"],["dominantBaseline","dominant-baseline"],["enableBackground","enable-background"],["fillOpacity","fill-opacity"],["fillRule","fill-rule"],["floodColor","flood-color"],["floodOpacity","flood-opacity"],["fontFamily","font-family"],["fontSize","font-size"],["fontSizeAdjust","font-size-adjust"],["fontStretch","font-stretch"],["fontStyle","font-style"],["fontVariant","font-variant"],["fontWeight","font-weight"],["glyphName","glyph-name"],["glyphOrientationHorizontal","glyph-orientation-horizontal"],["glyphOrientationVertical","glyph-orientation-vertical"],["horizAdvX","horiz-adv-x"],["horizOriginX","horiz-origin-x"],["imageRendering","image-rendering"],["letterSpacing","letter-spacing"],["lightingColor","lighting-color"],["markerEnd","marker-end"],["markerMid","marker-mid"],["markerStart","marker-start"],["maskType","mask-type"],["overlinePosition","overline-position"],["overlineThickness","overline-thickness"],["paintOrder","paint-order"],["panose-1","panose-1"],["pointerEvents","pointer-events"],["renderingIntent","rendering-intent"],["shapeRendering","shape-rendering"],["stopColor","stop-color"],["stopOpacity","stop-opacity"],["strikethroughPosition","strikethrough-position"],["strikethroughThickness","strikethrough-thickness"],["strokeDasharray","stroke-dasharray"],["strokeDashoffset","stroke-dashoffset"],["strokeLinecap","stroke-linecap"],["strokeLinejoin","stroke-linejoin"],["strokeMiterlimit","stroke-miterlimit"],["strokeOpacity","stroke-opacity"],["strokeWidth","stroke-width"],["textAnchor","text-anchor"],["textDecoration","text-decoration"],["textRendering","text-rendering"],["transformOrigin","transform-origin"],["underlinePosition","underline-position"],["underlineThickness","underline-thickness"],["unicodeBidi","unicode-bidi"],["unicodeRange","unicode-range"],["unitsPerEm","units-per-em"],["vAlphabetic","v-alphabetic"],["vHanging","v-hanging"],["vIdeographic","v-ideographic"],["vMathematical","v-mathematical"],["vectorEffect","vector-effect"],["vertAdvY","vert-adv-y"],["vertOriginX","vert-origin-x"],["vertOriginY","vert-origin-y"],["wordSpacing","word-spacing"],["writingMode","writing-mode"],["xmlnsXlink","xmlns:xlink"],["xHeight","x-height"]]),bN=/^[\u0000-\u001F ]*j[\r\n\t]*a[\r\n\t]*v[\r\n\t]*a[\r\n\t]*s[\r\n\t]*c[\r\n\t]*r[\r\n\t]*i[\r\n\t]*p[\r\n\t]*t[\r\n\t]*:/i;function cd(e){return bN.test(""+e)?"javascript:throw new Error('React has blocked a javascript: URL as a security precaution.')":e}function Pn(){}var Sm=null;function Ep(e){return e=e.target||e.srcElement||window,e.correspondingUseElement&&(e=e.correspondingUseElement),e.nodeType===3?e.parentNode:e}var _o=null,Zo=null;function ev(e){var t=fs(e);if(t&&(e=t.stateNode)){var a=e[Ua]||null;e:switch(e=t.stateNode,t.type){case"input":if(Nm(e,a.value,a.defaultValue,a.defaultValue,a.checked,a.defaultChecked,a.type,a.name),t=a.name,a.type==="radio"&&t!=null){for(a=e;a.parentNode;)a=a.parentNode;for(a=a.querySelectorAll('input[name="'+ln(""+t)+'"][type="radio"]'),t=0;t<a.length;t++){var n=a[t];if(n!==e&&n.form===e.form){var r=n[Ua]||null;if(!r)throw Error(q(90));Nm(n,r.value,r.defaultValue,r.defaultValue,r.checked,r.defaultChecked,r.type,r.name)}}for(t=0;t<a.length;t++)n=a[t],n.form===e.form&&Xy(n)}break e;case"textarea":Qy(e,a.value,a.defaultValue);break e;case"select":t=a.value,t!=null&&Xo(e,!!a.multiple,t,!1)}}}var qh=!1;function Ky(e,t,a){if(qh)return e(t,a);qh=!0;try{var n=e(t);return n}finally{if(qh=!1,(_o!==null||Zo!==null)&&(bu(),_o&&(t=_o,e=Zo,Zo=_o=null,ev(t),e)))for(t=0;t<e.length;t++)ev(e[t])}}function Rl(e,t){var a=e.stateNode;if(a===null)return null;var n=a[Ua]||null;if(n===null)return null;a=n[t];e:switch(t){case"onClick":case"onClickCapture":case"onDoubleClick":case"onDoubleClickCapture":case"onMouseDown":case"onMouseDownCapture":case"onMouseMove":case"onMouseMoveCapture":case"onMouseUp":case"onMouseUpCapture":case"onMouseEnter":(n=!n.disabled)||(e=e.type,n=!(e==="button"||e==="input"||e==="select"||e==="textarea")),e=!n;break e;default:e=!1}if(e)return null;if(a&&typeof a!="function")throw Error(q(231,t,typeof a));return a}var vi=!(typeof window>"u"||typeof window.document>"u"||typeof window.document.createElement>"u"),km=!1;if(vi)try{Eo={},Object.defineProperty(Eo,"passive",{get:function(){km=!0}}),window.addEventListener("test",Eo,Eo),window.removeEventListener("test",Eo,Eo)}catch{km=!1}var Eo,Yi=null,Ap=null,dd=null;function Wy(){if(dd)return dd;var e,t=Ap,a=t.length,n,r="value"in Yi?Yi.value:Yi.textContent,s=r.length;for(e=0;e<a&&t[e]===r[e];e++);var c=a-e;for(n=1;n<=c&&t[a-n]===r[s-n];n++);return dd=r.slice(e,1<n?1-n:void 0)}function ud(e){var t=e.keyCode;return"charCode"in e?(e=e.charCode,e===0&&t===13&&(e=13)):e=t,e===10&&(e=13),32<=e||e===13?e:0}function Pc(){return!0}function tv(){return!1}function Ra(e){function t(a,n,r,s,c){this._reactName=a,this._targetInst=r,this.type=n,this.nativeEvent=s,this.target=c,this.currentTarget=null;for(var d in e)e.hasOwnProperty(d)&&(a=e[d],this[d]=a?a(s):s[d]);return this.isDefaultPrevented=(s.defaultPrevented!=null?s.defaultPrevented:s.returnValue===!1)?Pc:tv,this.isPropagationStopped=tv,this}return pt(t.prototype,{preventDefault:function(){this.defaultPrevented=!0;var a=this.nativeEvent;a&&(a.preventDefault?a.preventDefault():typeof a.returnValue!="unknown"&&(a.returnValue=!1),this.isDefaultPrevented=Pc)},stopPropagation:function(){var a=this.nativeEvent;a&&(a.stopPropagation?a.stopPropagation():typeof a.cancelBubble!="unknown"&&(a.cancelBubble=!0),this.isPropagationStopped=Pc)},persist:function(){},isPersistent:Pc}),t}var dr={eventPhase:0,bubbles:0,cancelable:0,timeStamp:function(e){return e.timeStamp||Date.now()},defaultPrevented:0,isTrusted:0},iu=Ra(dr),Fl=pt({},dr,{view:0,detail:0}),vN=Ra(Fl),Lh,Bh,ol,ru=pt({},Fl,{screenX:0,screenY:0,clientX:0,clientY:0,pageX:0,pageY:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,getModifierState:Rp,button:0,buttons:0,relatedTarget:function(e){return e.relatedTarget===void 0?e.fromElement===e.srcElement?e.toElement:e.fromElement:e.relatedTarget},movementX:function(e){return"movementX"in e?e.movementX:(e!==ol&&(ol&&e.type==="mousemove"?(Lh=e.screenX-ol.screenX,Bh=e.screenY-ol.screenY):Bh=Lh=0,ol=e),Lh)},movementY:function(e){return"movementY"in e?e.movementY:Bh}}),av=Ra(ru),yN=pt({},ru,{dataTransfer:0}),wN=Ra(yN),xN=pt({},Fl,{relatedTarget:0}),jh=Ra(xN),$N=pt({},dr,{animationName:0,elapsedTime:0,pseudoElement:0}),NN=Ra($N),SN=pt({},dr,{clipboardData:function(e){return"clipboardData"in e?e.clipboardData:window.clipboardData}}),kN=Ra(SN),CN=pt({},dr,{data:0}),nv=Ra(CN),TN={Esc:"Escape",Spacebar:" ",Left:"ArrowLeft",Up:"ArrowUp",Right:"ArrowRight",Down:"ArrowDown",Del:"Delete",Win:"OS",Menu:"ContextMenu",Apps:"ContextMenu",Scroll:"ScrollLock",MozPrintableKey:"Unidentified"},EN={8:"Backspace",9:"Tab",12:"Clear",13:"Enter",16:"Shift",17:"Control",18:"Alt",19:"Pause",20:"CapsLock",27:"Escape",32:" ",33:"PageUp",34:"PageDown",35:"End",36:"Home",37:"ArrowLeft",38:"ArrowUp",39:"ArrowRight",40:"ArrowDown",45:"Insert",46:"Delete",112:"F1",113:"F2",114:"F3",115:"F4",116:"F5",117:"F6",118:"F7",119:"F8",120:"F9",121:"F10",122:"F11",123:"F12",144:"NumLock",145:"ScrollLock",224:"Meta"},AN={Alt:"altKey",Control:"ctrlKey",Meta:"metaKey",Shift:"shiftKey"};function RN(e){var t=this.nativeEvent;return t.getModifierState?t.getModifierState(e):(e=AN[e])?!!t[e]:!1}function Rp(){return RN}var MN=pt({},Fl,{key:function(e){if(e.key){var t=TN[e.key]||e.key;if(t!=="Unidentified")return t}return e.type==="keypress"?(e=ud(e),e===13?"Enter":String.fromCharCode(e)):e.type==="keydown"||e.type==="keyup"?EN[e.keyCode]||"Unidentified":""},code:0,location:0,ctrlKey:0,shiftKey:0,altKey:0,metaKey:0,repeat:0,locale:0,getModifierState:Rp,charCode:function(e){return e.type==="keypress"?ud(e):0},keyCode:function(e){return e.type==="keydown"||e.type==="keyup"?e.keyCode:0},which:function(e){return e.type==="keypress"?ud(e):e.type==="keydown"||e.type==="keyup"?e.keyCode:0}}),zN=Ra(MN),VN=pt({},ru,{pointerId:0,width:0,height:0,pressure:0,tangentialPressure:0,tiltX:0,tiltY:0,twist:0,pointerType:0,isPrimary:0}),iv=Ra(VN),ON=pt({},dr,{submitter:0}),IN=Ra(ON),DN=pt({},Fl,{touches:0,targetTouches:0,changedTouches:0,altKey:0,metaKey:0,ctrlKey:0,shiftKey:0,getModifierState:Rp}),_N=Ra(DN),HN=pt({},dr,{propertyName:0,elapsedTime:0,pseudoElement:0}),UN=Ra(HN),qN=pt({},ru,{deltaX:function(e){return"deltaX"in e?e.deltaX:"wheelDeltaX"in e?-e.wheelDeltaX:0},deltaY:function(e){return"deltaY"in e?e.deltaY:"wheelDeltaY"in e?-e.wheelDeltaY:"wheelDelta"in e?-e.wheelDelta:0},deltaZ:0,deltaMode:0}),LN=Ra(qN),BN=pt({},dr,{newState:0,oldState:0,source:0}),jN=Ra(BN),YN=[9,13,27,32],Mp=vi&&"CompositionEvent"in window,fl=null;vi&&"documentMode"in document&&(fl=document.documentMode);var GN=vi&&"TextEvent"in window&&!fl,ew=vi&&(!Mp||fl&&8<fl&&11>=fl),rv=" ",ov=!1;function tw(e,t){switch(e){case"keyup":return YN.indexOf(t.keyCode)!==-1;case"keydown":return t.keyCode!==229;case"keypress":case"mousedown":case"focusout":return!0;default:return!1}}function aw(e){return e=e.detail,typeof e=="object"&&"data"in e?e.data:null}var Ho=!1;function PN(e,t){switch(e){case"compositionend":return aw(t);case"keypress":return t.which!==32?null:(ov=!0,rv);case"textInput":return e=t.data,e===rv&&ov?null:e;default:return null}}function XN(e,t){if(Ho)return e==="compositionend"||!Mp&&tw(e,t)?(e=Wy(),dd=Ap=Yi=null,Ho=!1,e):null;switch(e){case"paste":return null;case"keypress":if(!(t.ctrlKey||t.altKey||t.metaKey)||t.ctrlKey&&t.altKey){if(t.char&&1<t.char.length)return t.char;if(t.which)return String.fromCharCode(t.which)}return null;case"compositionend":return ew&&t.locale!=="ko"?null:t.data;default:return null}}var ZN={color:!0,date:!0,datetime:!0,"datetime-local":!0,email:!0,month:!0,number:!0,password:!0,range:!0,search:!0,tel:!0,text:!0,time:!0,url:!0,week:!0};function sv(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t==="input"?!!ZN[e.type]:t==="textarea"}function nw(e,t,a,n){_o?Zo?Zo.push(n):Zo=[n]:_o=n,t=Wd(t,"onChange"),0<t.length&&(a=new iu("onChange","change",null,a,n),e.push({event:a,listeners:t}))}var bl=null,Ml=null;function QN(e){K0(e,0)}function ou(e){var t=ml(e);if(Xy(t))return e}function lv(e,t){if(e==="change")return t}var iw=!1;vi&&(vi?(Zc="oninput"in document,Zc||(Yh=document.createElement("div"),Yh.setAttribute("oninput","return;"),Zc=typeof Yh.oninput=="function"),Xc=Zc):Xc=!1,iw=Xc&&(!document.documentMode||9<document.documentMode));var Xc,Zc,Yh;function cv(){bl&&(bl.detachEvent("onpropertychange",rw),Ml=bl=null)}function rw(e){if(e.propertyName==="value"&&ou(Ml)){var t=[];nw(t,Ml,e,Ep(e)),Ky(QN,t)}}function FN(e,t,a){e==="focusin"?(cv(),bl=t,Ml=a,bl.attachEvent("onpropertychange",rw)):e==="focusout"&&cv()}function JN(e){if(e==="selectionchange"||e==="keyup"||e==="keydown")return ou(Ml)}function KN(e,t){if(e==="click")return ou(t)}function WN(e,t){if(e==="input"||e==="change")return ou(t)}function eS(e,t){return e===t&&(e!==0||1/e===1/t)||e!==e&&t!==t}var Fa=typeof Object.is=="function"?Object.is:eS;function zl(e,t){if(Fa(e,t))return!0;if(typeof e!="object"||e===null||typeof t!="object"||t===null)return!1;var a=Object.keys(e),n=Object.keys(t);if(a.length!==n.length)return!1;for(n=0;n<a.length;n++){var r=a[n];if(!xm.call(t,r)||!Fa(e[r],t[r]))return!1}return!0}function Cm(e){if(e=e||(typeof document<"u"?document:void 0),typeof e>"u")return null;try{return e.activeElement||e.body}catch{return e.body}}function dv(e){for(;e&&e.firstChild;)e=e.firstChild;return e}function uv(e,t){var a=dv(e);e=0;for(var n;a;){if(a.nodeType===3){if(n=e+a.textContent.length,e<=t&&n>=t)return{node:a,offset:t-e};e=n}e:{for(;a;){if(a.nextSibling){a=a.nextSibling;break e}a=a.parentNode}a=void 0}a=dv(a)}}function ow(e,t){return e&&t?e===t?!0:e&&e.nodeType===3?!1:t&&t.nodeType===3?ow(e,t.parentNode):"contains"in e?e.contains(t):e.compareDocumentPosition?!!(e.compareDocumentPosition(t)&16):!1:!1}function sw(e){e=e!=null&&e.ownerDocument!=null&&e.ownerDocument.defaultView!=null?e.ownerDocument.defaultView:window;for(var t=Cm(e.document);t instanceof e.HTMLIFrameElement;){try{var a=typeof t.contentWindow.location.href=="string"}catch{a=!1}if(a)e=t.contentWindow;else break;t=Cm(e.document)}return t}function zp(e){var t=e&&e.nodeName&&e.nodeName.toLowerCase();return t&&(t==="input"&&(e.type==="text"||e.type==="search"||e.type==="tel"||e.type==="url"||e.type==="password")||t==="textarea"||e.contentEditable==="true")}var tS=vi&&"documentMode"in document&&11>=document.documentMode,Uo=null,Tm=null,vl=null,Em=!1;function hv(e,t,a){var n=a.window===a?a.document:a.nodeType===9?a:a.ownerDocument;Em||Uo==null||Uo!==Cm(n)||(n=Uo,"selectionStart"in n&&zp(n)?n={start:n.selectionStart,end:n.selectionEnd}:(n=(n.ownerDocument&&n.ownerDocument.defaultView||window).getSelection(),n={anchorNode:n.anchorNode,anchorOffset:n.anchorOffset,focusNode:n.focusNode,focusOffset:n.focusOffset}),vl&&zl(vl,n)||(vl=n,n=Wd(Tm,"onSelect"),0<n.length&&(t=new iu("onSelect","select",null,t,a),e.push({event:t,listeners:n}),t.target=Uo)))}function Nr(e,t){var a={};return a[e.toLowerCase()]=t.toLowerCase(),a["Webkit"+e]="webkit"+t,a["Moz"+e]="moz"+t,a}var qo={animationend:Nr("Animation","AnimationEnd"),animationiteration:Nr("Animation","AnimationIteration"),animationstart:Nr("Animation","AnimationStart"),transitionrun:Nr("Transition","TransitionRun"),transitionstart:Nr("Transition","TransitionStart"),transitioncancel:Nr("Transition","TransitionCancel"),transitionend:Nr("Transition","TransitionEnd")},Gh={},lw={};vi&&(lw=document.createElement("div").style,"AnimationEvent"in window||(delete qo.animationend.animation,delete qo.animationiteration.animation,delete qo.animationstart.animation),"TransitionEvent"in window||delete qo.transitionend.transition);function Gr(e){if(Gh[e])return Gh[e];if(!qo[e])return e;var t=qo[e],a;for(a in t)if(t.hasOwnProperty(a)&&a in lw)return Gh[e]=t[a];return e}var cw=Gr("animationend"),dw=Gr("animationiteration"),uw=Gr("animationstart"),aS=Gr("transitionrun"),nS=Gr("transitionstart"),iS=Gr("transitioncancel"),hw=Gr("transitionend"),mw=new Map,Am="abort auxClick beforeToggle cancel canPlay canPlayThrough click close contextMenu copy cut drag dragEnd dragEnter dragExit dragLeave dragOver dragStart drop durationChange emptied encrypted ended error fullscreenChange fullscreenError gotPointerCapture input invalid keyDown keyPress keyUp load loadedData loadedMetadata loadStart lostPointerCapture mouseDown mouseMove mouseOut mouseOver mouseUp paste pause play playing pointerCancel pointerDown pointerMove pointerOut pointerOver pointerUp progress rateChange reset resize seeked seeking stalled submit suspend timeUpdate touchCancel touchEnd touchStart volumeChange scroll toggle touchMove waiting wheel".split(" ");Am.push("scrollEnd");function Tn(e,t){mw.set(e,t),Yr(t,[e])}var rS=0;function yi(e,t){if(e.name!=null&&e.name!=="auto")return e.name;if(t.autoName!==null)return t.autoName;e=Cn.identifierPrefix;var a=rS++;return e="_"+e+"t_"+a.toString(32)+"_",t.autoName=e}function mv(e){if(e==null||typeof e=="string")return e;var t=null,a=ts;if(a!==null)for(var n=0;n<a.length;n++){var r=e[a[n]];if(r!=null){if(r==="none")return"none";t=t==null?r:t+(" "+r)}}return t??e.default}function ki(e,t){return e=mv(e),t=mv(t),t==null?e==="auto"?null:e:t==="auto"?null:t}var zd=typeof reportError=="function"?reportError:function(e){if(typeof window=="object"&&typeof window.ErrorEvent=="function"){var t=new window.ErrorEvent("error",{bubbles:!0,cancelable:!0,message:typeof e=="object"&&e!==null&&typeof e.message=="string"?String(e.message):String(e),error:e});if(!window.dispatchEvent(t))return}else if(typeof process=="object"&&typeof process.emit=="function"){process.emit("uncaughtException",e);return}console.error(e)},rn=[],Lo=0,Vp=0;function su(){for(var e=Lo,t=Vp=Lo=0;t<e;){var a=rn[t];rn[t++]=null;var n=rn[t];rn[t++]=null;var r=rn[t];rn[t++]=null;var s=rn[t];if(rn[t++]=null,n!==null&&r!==null){var c=n.pending;c===null?r.next=r:(r.next=c.next,c.next=r),n.pending=r}s!==0&&pw(a,r,s)}}function lu(e,t,a,n){rn[Lo++]=e,rn[Lo++]=t,rn[Lo++]=a,rn[Lo++]=n,Vp|=n,e.lanes|=n,e=e.alternate,e!==null&&(e.lanes|=n)}function Op(e,t,a,n){return lu(e,t,a,n),Vd(e)}function Pr(e,t){return lu(e,null,null,t),Vd(e)}function pw(e,t,a){e.lanes|=a;var n=e.alternate;n!==null&&(n.lanes|=a);for(var r=!1,s=e.return;s!==null;)s.childLanes|=a,n=s.alternate,n!==null&&(n.childLanes|=a),s.tag===22&&(e=s.stateNode,e===null||e._visibility&1||(r=!0)),e=s,s=s.return;return e.tag===3?(s=e.stateNode,r&&t!==null&&(r=31-Za(a),e=s.hiddenUpdates,n=e[r],n===null?e[r]=[t]:n.push(t),t.lane=a|536870912),s):null}function Vd(e){if(50<El)throw El=0,xd=null,Error(q(185));for(var t=e.return;t!==null;)e=t,t=e.return;return e.tag===3?e.stateNode:null}var Bo={};function oS(e,t,a,n){this.tag=e,this.key=a,this.sibling=this.child=this.return=this.stateNode=this.type=this.elementType=null,this.index=0,this.refCleanup=this.ref=null,this.pendingProps=t,this.dependencies=this.memoizedState=this.updateQueue=this.memoizedProps=null,this.mode=n,this.subtreeFlags=this.flags=0,this.deletions=null,this.childLanes=this.lanes=0,this.alternate=null}function Da(e,t,a,n){return new oS(e,t,a,n)}function Ip(e){return e=e.prototype,!(!e||!e.isReactComponent)}function fi(e,t){var a=e.alternate;return a===null?(a=Da(e.tag,t,e.key,e.mode),a.elementType=e.elementType,a.type=e.type,a.stateNode=e.stateNode,a.alternate=e,e.alternate=a):(a.pendingProps=t,a.type=e.type,a.flags=0,a.subtreeFlags=0,a.deletions=null),a.flags=e.flags&1206910976,a.childLanes=e.childLanes,a.lanes=e.lanes,a.child=e.child,a.memoizedProps=e.memoizedProps,a.memoizedState=e.memoizedState,a.updateQueue=e.updateQueue,t=e.dependencies,a.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext},a.sibling=e.sibling,a.index=e.index,a.ref=e.ref,a.refCleanup=e.refCleanup,a}function gw(e,t){e.flags&=1206910978;var a=e.alternate;return a===null?(e.childLanes=0,e.lanes=t,e.child=null,e.subtreeFlags=0,e.memoizedProps=null,e.memoizedState=null,e.updateQueue=null,e.dependencies=null,e.stateNode=null):(e.childLanes=a.childLanes,e.lanes=a.lanes,e.child=a.child,e.subtreeFlags=0,e.deletions=null,e.memoizedProps=a.memoizedProps,e.memoizedState=a.memoizedState,e.updateQueue=a.updateQueue,e.type=a.type,t=a.dependencies,e.dependencies=t===null?null:{lanes:t.lanes,firstContext:t.firstContext}),e}function hd(e,t,a,n,r,s){var c=0;if(n=e,typeof n=="function")Ip(n)&&(c=1);else if(typeof n=="string")c=zk(e,a,Qn.current)?26:e==="html"||e==="head"||e==="body"?27:5;else e:switch(n){case fm:return e=Da(31,a,t,r),e.elementType=fm,e.lanes=s,e;case Io:return Mr(a.children,r,s,t);case zy:c=8,r|=24;break;case mm:return e=Da(12,a,t,r|2),e.elementType=mm,e.lanes=s,e;case pm:return e=Da(13,a,t,r),e.elementType=pm,e.lanes=s,e;case gm:return e=Da(19,a,t,r),e.elementType=gm,e.lanes=s,e;case X5:case bm:return e=r|32,e=Da(30,a,t,e),e.elementType=bm,e.lanes=s,e.stateNode={autoName:null,paired:null,clones:null,ref:null},e;default:if(typeof n=="object"&&n!==null)switch(n.$$typeof){case Gn:c=10;break e;case Vy:c=9;break e;case $p:c=11;break e;case Np:c=14;break e;case qi:c=16,n=null;break e}c=29,a=Error(q(130,e===null?"null":typeof e,"")),n=null}return t=Da(c,a,t,r),t.elementType=e,t.type=n,t.lanes=s,t}function Mr(e,t,a,n){return e=Da(7,e,n,t),e.lanes=a,e}function Ph(e,t,a){return e=Da(6,e,null,t),e.lanes=a,e}function fw(e){var t=Da(18,null,null,0);return t.stateNode=e,t}function Xh(e,t,a){return t=Da(4,e.children!==null?e.children:[],e.key,t),t.lanes=a,t.stateNode={containerInfo:e.containerInfo,pendingChildren:null,implementation:e.implementation},t}var pv=new WeakMap;function cn(e,t){if(typeof e=="object"&&e!==null){var a=pv.get(e);return a!==void 0?a:(t={value:e,source:t,stack:Pb(t)},pv.set(e,t),t)}return{value:e,source:t,stack:Pb(t)}}var jo=[],Yo=0,Od=null,Vl=0,on=[],sn=0,rr=null,Xn=1,Zn="";function pi(e,t){jo[Yo++]=Vl,jo[Yo++]=Od,Od=e,Vl=t}function bw(e,t,a){on[sn++]=Xn,on[sn++]=Zn,on[sn++]=rr,rr=e;var n=Xn;e=Zn;var r=32-Za(n)-1;n&=~(1<<r),a+=1;var s=32-Za(t)+r;if(30<s){var c=r-r%5;s=(n&(1<<c)-1).toString(32),n>>=c,r-=c,Xn=1<<32-Za(t)+r|a<<r|n,Zn=s+e}else Xn=1<<s|a<<r|n,Zn=e}function cu(e){e.return!==null&&(pi(e,1),bw(e,1,0))}function Dp(e){for(;e===Od;)Od=jo[--Yo],jo[Yo]=null,Vl=jo[--Yo],jo[Yo]=null;for(;e===rr;)rr=on[--sn],on[sn]=null,Zn=on[--sn],on[sn]=null,Xn=on[--sn],on[sn]=null}function vw(e,t){on[sn++]=Xn,on[sn++]=Zn,on[sn++]=rr,Xn=t.id,Zn=t.overflow,rr=e}var ra=null,wt=null,ze=!1,Fi=null,dn=!1,Rm=Error(q(519));function or(e){var t=Error(q(418,1<arguments.length&&arguments[1]!==void 0&&arguments[1]?"text":"HTML",""));throw Ol(cn(t,e)),Rm}function gv(e){var t=e.stateNode,a=e.type,n=e.memoizedProps;switch(t[ca]=e,t[Ua]=n,a){case"dialog":De("cancel",t),De("close",t);break;case"iframe":case"object":case"embed":De("load",t);break;case"video":case"audio":for(a=0;a<Hl.length;a++)De(Hl[a],t);break;case"source":De("error",t);break;case"img":case"image":case"link":De("error",t),De("load",t);break;case"details":De("toggle",t);break;case"input":De("invalid",t),Zy(t,n.value,n.defaultValue,n.checked,n.defaultChecked,n.type,n.name,!0);break;case"select":De("invalid",t);break;case"textarea":De("invalid",t),Fy(t,n.value,n.defaultValue,n.children)}a=n.children,typeof a!="string"&&typeof a!="number"&&typeof a!="bigint"||t.textContent===""+a||n.suppressHydrationWarning===!0||e1(t.textContent,a)?(n.popover!=null&&(De("beforetoggle",t),De("toggle",t)),n.onScroll!=null&&De("scroll",t),n.onScrollEnd!=null&&De("scrollend",t),n.onClick!=null&&(t.onclick=Pn),t=!0):t=!1,t||or(e,!0)}function Id(e){for(ra=e.return;ra;)switch(ra.tag){case 5:case 31:case 13:dn=!1;return;case 27:case 3:dn=!0;return;default:ra=ra.return}}function Ao(e){if(e!==ra)return!1;if(!ze)return Id(e),ze=!0,!1;var t=e.tag,a;if((a=t!==3&&t!==27)&&((a=t===5)&&(a=e.type,a=!(a!=="form"&&a!=="button")||pp(e.type,e.memoizedProps)),a=!a),a&&wt&&or(e),Id(e),t===13){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(q(317));wt=uy(e)}else if(t===31){if(e=e.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(q(317));wt=uy(e)}else t===27?(t=wt,ur(e.type)?(e=vp,vp=null,wt=e):wt=t):wt=ra?un(e.stateNode.nextSibling):null;return!0}function Ir(){wt=ra=null,ze=!1}function Zh(){var e=Fi;return e!==null&&(Oa===null?Oa=e:Oa.push.apply(Oa,e),Fi=null),e}function Ol(e){Fi===null?Fi=[e]:Fi.push(e)}var Mm=Kn(null),Xr=null,gi=null;function Gi(e,t,a){xt(Mm,t._currentValue),t._currentValue=a}function bi(e){e._currentValue=Mm.current,ua(Mm)}function md(e,t,a){for(;e!==null;){var n=e.alternate;if((e.childLanes&t)!==t?(e.childLanes|=t,n!==null&&(n.childLanes|=t)):n!==null&&(n.childLanes&t)!==t&&(n.childLanes|=t),e===a)break;e=e.return}}function zm(e,t,a,n){var r=e.child;for(r!==null&&(r.return=e);r!==null;){var s=r.dependencies;if(s!==null){var c=r.child;s=s.firstContext;e:for(;s!==null;){var d=s;s=r;for(var h=0;h<t.length;h++)if(d.context===t[h]){s.lanes|=a,d=s.alternate,d!==null&&(d.lanes|=a),md(s.return,a,e),n||(c=null);break e}s=d.next}}else if(r.tag===18){if(c=r.return,c===null)throw Error(q(341));c.lanes|=a,s=c.alternate,s!==null&&(s.lanes|=a),md(c,a,e),c=null}else r.tag===13&&r.memoizedState!==null&&r.memoizedState.dehydrated===null?(r.lanes|=a,c=r.alternate,c!==null&&(c.lanes|=a),md(r.return,a,e),c=r.child,c=c!==null?c.sibling:null):c=r.child;if(c!==null)c.return=r;else for(c=r;c!==null;){if(c===e){c=null;break}if(r=c.sibling,r!==null){r.return=c.return,c=r;break}c=c.return}r=c}}function Dr(e,t,a,n){e=null;for(var r=t,s=!1;r!==null;){if(!s){if((r.flags&524288)!==0)s=!0;else if((r.flags&262144)!==0)break}if(r.tag===10){var c=r.alternate;if(c===null)throw Error(q(387));if(c=c.memoizedProps,c!==null){var d=r.type;Fa(r.pendingProps.value,c.value)||(e!==null?e.push(d):e=[d])}}else if(r===Td.current){if(c=r.alternate,c===null)throw Error(q(387));c.memoizedState.memoizedState!==r.memoizedState.memoizedState&&(e!==null?e.push(hs):e=[hs])}r=r.return}return e!==null&&zm(t,e,a,n),t.flags|=262144,e!==null}function Dd(e){for(e=e.firstContext;e!==null;){if(!Fa(e.context._currentValue,e.memoizedValue))return!0;e=e.next}return!1}function _r(e){Xr=e,gi=null,e=e.dependencies,e!==null&&(e.firstContext=null)}function da(e){return yw(Xr,e)}function Qc(e,t){return Xr===null&&_r(e),yw(e,t)}function yw(e,t){var a=t._currentValue;if(t={context:t,memoizedValue:a,next:null},gi===null){if(e===null)throw Error(q(308));gi=t,e.dependencies={lanes:0,firstContext:t},e.flags|=524288}else gi=gi.next=t;return a}var sS=typeof AbortController<"u"?AbortController:function(){var e=[],t=this.signal={aborted:!1,addEventListener:function(a,n){e.push(n)}};this.abort=function(){t.aborted=!0,e.forEach(function(a){return a()})}},lS=Wt.unstable_scheduleCallback,cS=Wt.unstable_NormalPriority,Zt={$$typeof:Gn,Consumer:null,Provider:null,_currentValue:null,_currentValue2:null,_threadCount:0};function _p(){return{controller:new sS,data:new Map,refCount:0}}function Jl(e){e.refCount--,e.refCount===0&&lS(cS,function(){e.controller.abort()})}function fv(e,t){if((e.pendingLanes&4194048)!==0){var a=e.transitionTypes;for(a===null&&(a=e.transitionTypes=[]),e=0;e<t.length;e++){var n=t[e];a.indexOf(n)===-1&&a.push(n)}}}var pl=null;function dS(e){var t=e.transitionTypes;return e.transitionTypes=null,t}var yl=null,Vm=0,Hr=0,Qo=null;function uS(e,t){if(yl===null){var a=yl=[];Vm=0,Hr=ug(),Qo={status:"pending",value:void 0,then:function(n){a.push(n)}}}return Vm++,t.then(bv,bv),t}function bv(){if(--Vm===0&&(pl=null,yl!==null)){Qo!==null&&(Qo.status="fulfilled");var e=yl;yl=null,Hr=0,Qo=null;for(var t=0;t<e.length;t++)(0,e[t])()}}function hS(e,t){var a=[],n={status:"pending",value:null,reason:null,then:function(r){a.push(r)}};return e.then(function(){n.status="fulfilled",n.value=t;for(var r=0;r<a.length;r++)(0,a[r])(t)},function(r){for(n.status="rejected",n.reason=r,r=0;r<a.length;r++)(0,a[r])(void 0)}),n}var vv=$e.S;$e.S=function(e,t){if(_0=Pa(),typeof t=="object"&&t!==null&&typeof t.then=="function"&&uS(e,t),pl!==null)for(var a=cs;a!==null;)fv(a,pl),a=a.next;if(a=e.types,a!==null){for(var n=cs;n!==null;)fv(n,a),n=n.next;if(Hr!==0){n=pl,n===null&&(n=pl=[]);for(var r=0;r<a.length;r++){var s=a[r];n.indexOf(s)===-1&&n.push(s)}}}vv!==null&&vv(e,t)};var zr=Kn(null);function Hp(){var e=zr.current;return e!==null?e:mt.pooledCache}function pd(e,t){t===null?xt(zr,zr.current):xt(zr,t.pool)}function ww(){var e=Hp();return e===null?null:{parent:Zt._currentValue,pool:e}}var bs=Error(q(460)),Up=Error(q(474)),du=Error(q(542)),_d={then:function(){}};function yv(e){return e=e.status,e==="fulfilled"||e==="rejected"}function xw(e,t,a){switch(a=e[a],a===void 0?e.push(t):a!==t&&(t.then(Pn,Pn),t=a),t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,xv(e),e===void 0&&!("reason"in t)?Error(q(600)):e;default:if(typeof t.status=="string")t.then(Pn,Pn);else{if(e=mt,e!==null&&100<e.shellSuspendCounter)throw Error(q(482));e=t,e.status="pending",e.then(function(n){if(t.status==="pending"){var r=t;r.status="fulfilled",r.value=n}},function(n){if(t.status==="pending"){var r=t;r.status="rejected",r.reason=n}})}switch(t.status){case"fulfilled":return t.value;case"rejected":throw e=t.reason,xv(e),e}throw Vr=t,bs}}function Cr(e){try{var t=e._init;return t(e._payload)}catch(a){throw a!==null&&typeof a=="object"&&typeof a.then=="function"?(Vr=a,bs):a}}var Vr=null;function wv(){if(Vr===null)throw Error(q(459));var e=Vr;return Vr=null,e}function xv(e){if(e===bs||e===du)throw Error(q(483))}var Fo=null,Il=0;function Fc(e){var t=Il;return Il+=1,Fo===null&&(Fo=[]),xw(Fo,e,t)}function _i(e,t){t=t.props.ref,e.ref=t!==void 0?t:null}function Jc(e,t){throw t.$$typeof===P5?Error(q(525)):(e=Object.prototype.toString.call(t),Error(q(31,e==="[object Object]"?"object with keys {"+Object.keys(t).join(", ")+"}":e)))}function $w(e){function t(N,v){if(e){var w=N.deletions;w===null?(N.deletions=[v],N.flags|=16):w.push(v)}}function a(N,v){if(!e)return null;for(;v!==null;)t(N,v),v=v.sibling;return null}function n(N){for(var v=new Map;N!==null;)N.key===null?v.set(N.index,N):v.set(N.key,N),N=N.sibling;return v}function r(N,v){return N=fi(N,v),N.index=0,N.sibling=null,N}function s(N,v,w){return N.index=w,e?(w=N.alternate,w!==null?(w=w.index,w<v?(N.flags|=2,v):w):(N.flags|=134217730,v)):(N.flags|=1048576,v)}function c(N){return e&&N.alternate===null&&(N.flags|=134217730),N}function d(N,v,w,R){return v===null||v.tag!==6?(v=Ph(w,N.mode,R),v.return=N,v):(v=r(v,w),v.return=N,v)}function h(N,v,w,R){var H=w.type;return H===Io?(N=b(N,v,w.props.children,R,w.key),_i(N,w),N):v!==null&&(v.elementType===H||typeof H=="object"&&H!==null&&H.$$typeof===qi&&Cr(H)===v.type)?(v=r(v,w.props),_i(v,w),v.return=N,v):(v=hd(w.type,w.key,w.props,null,N.mode,R),_i(v,w),v.return=N,v)}function p(N,v,w,R){return v===null||v.tag!==4||v.stateNode.containerInfo!==w.containerInfo||v.stateNode.implementation!==w.implementation?(v=Xh(w,N.mode,R),v.return=N,v):(v=r(v,w.children||[]),v.return=N,v)}function b(N,v,w,R,H){return v===null||v.tag!==7?(v=Mr(w,N.mode,R,H),v.return=N,v):(v=r(v,w),v.return=N,v)}function $(N,v,w){if(typeof v=="string"&&v!==""||typeof v=="number"||typeof v=="bigint")return v=Ph(""+v,N.mode,w),v.return=N,v;if(typeof v=="object"&&v!==null){switch(v.$$typeof){case Lc:return w=hd(v.type,v.key,v.props,null,N.mode,w),_i(w,v),w.return=N,w;case ul:return v=Xh(v,N.mode,w),v.return=N,v;case qi:return v=Cr(v),$(N,v,w)}if(hl(v)||rl(v))return v=Mr(v,N.mode,w,null),v.return=N,v;if(typeof v.then=="function")return $(N,Fc(v),w);if(v.$$typeof===Gn)return $(N,Qc(N,v),w);Jc(N,v)}return null}function f(N,v,w,R){var H=v!==null?v.key:null;if(typeof w=="string"&&w!==""||typeof w=="number"||typeof w=="bigint")return H!==null?null:d(N,v,""+w,R);if(typeof w=="object"&&w!==null){switch(w.$$typeof){case Lc:return w.key===H?h(N,v,w,R):null;case ul:return w.key===H?p(N,v,w,R):null;case qi:return w=Cr(w),f(N,v,w,R)}if(hl(w)||rl(w))return H!==null?null:b(N,v,w,R,null);if(typeof w.then=="function")return f(N,v,Fc(w),R);if(w.$$typeof===Gn)return f(N,v,Qc(N,w),R);Jc(N,w)}return null}function y(N,v,w,R,H){if(typeof R=="string"&&R!==""||typeof R=="number"||typeof R=="bigint")return N=N.get(w)||null,d(v,N,""+R,H);if(typeof R=="object"&&R!==null){switch(R.$$typeof){case Lc:return N=N.get(R.key===null?w:R.key)||null,h(v,N,R,H);case ul:return N=N.get(R.key===null?w:R.key)||null,p(v,N,R,H);case qi:return R=Cr(R),y(N,v,w,R,H)}if(hl(R)||rl(R))return N=N.get(w)||null,b(v,N,R,H,null);if(typeof R.then=="function")return y(N,v,w,Fc(R),H);if(R.$$typeof===Gn)return y(N,v,w,Qc(v,R),H);Jc(v,R)}return null}function V(N,v,w,R){for(var H=null,Z=null,te=v,Q=v=0,Te=null;te!==null&&Q<w.length;Q++){te.index>Q?(Te=te,te=null):Te=te.sibling;var B=f(N,te,w[Q],R);if(B===null){te===null&&(te=Te);break}e&&te&&B.alternate===null&&t(N,te),v=s(B,v,Q),Z===null?H=B:Z.sibling=B,Z=B,te=Te}if(Q===w.length)return a(N,te),ze&&pi(N,Q),H;if(te===null){for(;Q<w.length;Q++)te=$(N,w[Q],R),te!==null&&(v=s(te,v,Q),Z===null?H=te:Z.sibling=te,Z=te);return ze&&pi(N,Q),H}for(te=n(te);Q<w.length;Q++)Te=y(te,N,Q,w[Q],R),Te!==null&&(e&&(B=Te.alternate,B!==null&&te.delete(B.key===null?Q:B.key)),v=s(Te,v,Q),Z===null?H=Te:Z.sibling=Te,Z=Te);return e&&te.forEach(function(re){return t(N,re)}),ze&&pi(N,Q),H}function M(N,v,w,R){if(w==null)throw Error(q(151));for(var H=null,Z=null,te=v,Q=v=0,Te=null,B=w.next();te!==null&&!B.done;Q++,B=w.next()){te.index>Q?(Te=te,te=null):Te=te.sibling;var re=f(N,te,B.value,R);if(re===null){te===null&&(te=Te);break}e&&te&&re.alternate===null&&t(N,te),v=s(re,v,Q),Z===null?H=re:Z.sibling=re,Z=re,te=Te}if(B.done)return a(N,te),ze&&pi(N,Q),H;if(te===null){for(;!B.done;Q++,B=w.next())B=$(N,B.value,R),B!==null&&(v=s(B,v,Q),Z===null?H=B:Z.sibling=B,Z=B);return ze&&pi(N,Q),H}for(te=n(te);!B.done;Q++,B=w.next())B=y(te,N,Q,B.value,R),B!==null&&(e&&(Te=B.alternate,Te!==null&&te.delete(Te.key===null?Q:Te.key)),v=s(B,v,Q),Z===null?H=B:Z.sibling=B,Z=B);return e&&te.forEach(function(ve){return t(N,ve)}),ze&&pi(N,Q),H}function O(N,v,w,R){if(typeof w=="object"&&w!==null&&w.type===Io&&w.key===null&&w.props.ref===void 0&&(w=w.props.children),typeof w=="object"&&w!==null){switch(w.$$typeof){case Lc:e:{for(var H=w.key;v!==null;){if(v.key===H){if(H=w.type,H===Io){if(v.tag===7){a(N,v.sibling),R=r(v,w.props.children),_i(R,w),R.return=N,N=R;break e}}else if(v.elementType===H||typeof H=="object"&&H!==null&&H.$$typeof===qi&&Cr(H)===v.type){a(N,v.sibling),R=r(v,w.props),_i(R,w),R.return=N,N=R;break e}a(N,v);break}else t(N,v);v=v.sibling}w.type===Io?(R=Mr(w.props.children,N.mode,R,w.key),_i(R,w),R.return=N,N=R):(R=hd(w.type,w.key,w.props,null,N.mode,R),_i(R,w),R.return=N,N=R)}return c(N);case ul:e:{for(H=w.key;v!==null;){if(v.key===H)if(v.tag===4&&v.stateNode.containerInfo===w.containerInfo&&v.stateNode.implementation===w.implementation){a(N,v.sibling),R=r(v,w.children||[]),R.return=N,N=R;break e}else{a(N,v);break}else t(N,v);v=v.sibling}R=Xh(w,N.mode,R),R.return=N,N=R}return c(N);case qi:return w=Cr(w),O(N,v,w,R)}if(hl(w))return V(N,v,w,R);if(rl(w)){if(H=rl(w),typeof H!="function")throw Error(q(150));return w=H.call(w),M(N,v,w,R)}if(typeof w.then=="function")return O(N,v,Fc(w),R);if(w.$$typeof===Gn)return O(N,v,Qc(N,w),R);Jc(N,w)}return typeof w=="string"&&w!==""||typeof w=="number"||typeof w=="bigint"?(w=""+w,v!==null&&v.tag===6?(a(N,v.sibling),R=r(v,w),R.return=N,N=R):(a(N,v),R=Ph(w,N.mode,R),R.return=N,N=R),c(N)):a(N,v)}return function(N,v,w,R){try{Il=0;var H=O(N,v,w,R);return Fo=null,H}catch(te){if(te===bs||te===du)throw te;var Z=Da(29,te,null,N.mode);return Z.lanes=R,Z.return=N,Z}}}var Ur=$w(!0),Nw=$w(!1),Li=!1;function qp(e){e.updateQueue={baseState:e.memoizedState,firstBaseUpdate:null,lastBaseUpdate:null,shared:{pending:null,lanes:0,hiddenCallbacks:null},callbacks:null}}function Om(e,t){e=e.updateQueue,t.updateQueue===e&&(t.updateQueue={baseState:e.baseState,firstBaseUpdate:e.firstBaseUpdate,lastBaseUpdate:e.lastBaseUpdate,shared:e.shared,callbacks:null})}function Ji(e){return{lane:e,tag:0,payload:null,callback:null,next:null}}function Ki(e,t,a){var n=e.updateQueue;if(n===null)return null;if(n=n.shared,(Je&2)!==0){var r=n.pending;return r===null?t.next=t:(t.next=r.next,r.next=t),n.pending=t,t=Vd(e),pw(e,null,a),t}return lu(e,n,t,a),Vd(e)}function wl(e,t,a){if(t=t.updateQueue,t!==null&&(t=t.shared,(a&4194048)!==0)){var n=t.lanes;n&=e.pendingLanes,a|=n,t.lanes=a,qy(e,a)}}function Qh(e,t){var a=e.updateQueue,n=e.alternate;if(n!==null&&(n=n.updateQueue,a===n)){var r=null,s=null;if(a=a.firstBaseUpdate,a!==null){do{var c={lane:a.lane,tag:a.tag,payload:a.payload,callback:null,next:null};s===null?r=s=c:s=s.next=c,a=a.next}while(a!==null);s===null?r=s=t:s=s.next=t}else r=s=t;a={baseState:n.baseState,firstBaseUpdate:r,lastBaseUpdate:s,shared:n.shared,callbacks:n.callbacks},e.updateQueue=a;return}e=a.lastBaseUpdate,e===null?a.firstBaseUpdate=t:e.next=t,a.lastBaseUpdate=t}var Im=!1;function xl(){if(Im){var e=Qo;if(e!==null)throw e}}function $l(e,t,a,n){Im=!1;var r=e.updateQueue;Li=!1;var s=r.firstBaseUpdate,c=r.lastBaseUpdate,d=r.shared.pending;if(d!==null){r.shared.pending=null;var h=d,p=h.next;h.next=null,c===null?s=p:c.next=p,c=h;var b=e.alternate;b!==null&&(b=b.updateQueue,d=b.lastBaseUpdate,d!==c&&(d===null?b.firstBaseUpdate=p:d.next=p,b.lastBaseUpdate=h))}if(s!==null){var $=r.baseState;c=0,b=p=h=null,d=s;do{var f=d.lane&-536870913,y=f!==d.lane;if(y?(Ue&f)===f:(n&f)===f){f!==0&&f===Hr&&(Im=!0),b!==null&&(b=b.next={lane:0,tag:d.tag,payload:d.payload,callback:null,next:null});e:{var V=e,M=d;f=t;var O=a;switch(M.tag){case 1:if(V=M.payload,typeof V=="function"){$=V.call(O,$,f);break e}$=V;break e;case 3:V.flags=V.flags&-65537|128;case 0:if(V=M.payload,f=typeof V=="function"?V.call(O,$,f):V,f==null)break e;$=pt({},$,f);break e;case 2:Li=!0}}f=d.callback,f!==null&&(e.flags|=64,y&&(e.flags|=8192),y=r.callbacks,y===null?r.callbacks=[f]:y.push(f))}else y={lane:f,tag:d.tag,payload:d.payload,callback:d.callback,next:null},b===null?(p=b=y,h=$):b=b.next=y,c|=f;if(d=d.next,d===null){if(d=r.shared.pending,d===null)break;y=d,d=y.next,y.next=null,r.lastBaseUpdate=y,r.shared.pending=null}}while(!0);b===null&&(h=$),r.baseState=h,r.firstBaseUpdate=p,r.lastBaseUpdate=b,s===null&&(r.shared.lanes=0),cr|=c,e.lanes=c,e.memoizedState=$}}function Sw(e,t){if(typeof e!="function")throw Error(q(191,e));e.call(t)}function kw(e,t){var a=e.callbacks;if(a!==null)for(e.callbacks=null,e=0;e<a.length;e++)Sw(a[e],t)}var sr=Kn(null),Hd=Kn(0);function $v(e,t){e=Ni,xt(Hd,e),xt(sr,t),Ni=e|t.baseLanes}function Dm(){xt(Hd,Ni),xt(sr,sr.current)}function Lp(){Ni=Hd.current,ua(sr),ua(Hd)}var pa=Kn(null),ya=null;function Wi(e){var t=e.alternate;xt(ha,ha.current&1),xt(pa,e),ya===null&&(t===null||sr.current!==null||t.memoizedState!==null)&&(ya=e)}function _m(e){xt(ha,ha.current),xt(pa,e),ya===null&&(ya=e)}function Cw(e){e.tag===22?(xt(ha,ha.current),xt(pa,e),ya===null&&(ya=e)):er()}function er(){xt(ha,ha.current),xt(pa,pa.current)}function ja(e){ua(pa),ya===e&&(ya=null),ua(ha)}var ha=Kn(0);function Dl(e,t){xt(pa,pa.current),xt(ha,t)}function Bp(e){ua(ha),ua(pa),ya===e&&(ya=null)}function Ud(e){for(var t=e;t!==null;){if(t.tag===13){var a=t.memoizedState;if(a!==null&&(a=a.dehydrated,a===null||bp(a)||gg(a)))return t}else if(t.tag===19&&t.memoizedProps.revealOrder!=="independent"){if((t.flags&128)!==0)return t}else if(t.child!==null){t.child.return=t,t=t.child;continue}if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return null;t=t.return}t.sibling.return=t.return,t=t.sibling}return null}var wi=0,Ae=null,ut=null,Xt=null,qd=!1,Jo=!1,qr=!1,Ld=0,_l=0,Ko=null,mS=0;function Ht(){throw Error(q(321))}function jp(e,t){if(t===null)return!1;for(var a=0;a<t.length&&a<e.length;a++)if(!Fa(e[a],t[a]))return!1;return!0}function Yp(e,t,a,n,r,s){return wi=s,Ae=t,t.memoizedState=null,t.updateQueue=null,t.lanes=0,$e.H=e===null||e.memoizedState===null?n0:i0,qr=!1,s=a(n,r),qr=!1,Jo&&(s=Ew(t,a,n,r)),Tw(e),s}function Tw(e){$e.H=Bd;var t=ut!==null&&ut.next!==null;if(wi=0,Xt=ut=Ae=null,qd=!1,_l=0,Ko=null,t)throw Error(q(300));e===null||Qt||(e=e.dependencies,e!==null&&Dd(e)&&(Qt=!0))}function Ew(e,t,a,n){Ae=e;var r=0;do{if(Jo&&(Ko=null),_l=0,Jo=!1,25<=r)throw Error(q(301));if(r+=1,Xt=ut=null,e.updateQueue!=null){var s=e.updateQueue;s.lastEffect=null,s.events=null,s.stores=null,s.memoCache!=null&&(s.memoCache.index=0)}$e.H=xS,s=t(a,n)}while(Jo);return s}function pS(){var e=$e.H,t=e.useState()[0];return t=typeof t.then=="function"?Kl(t):t,e=e.useState()[0],(ut!==null?ut.memoizedState:null)!==e&&(Ae.flags|=1024),t}function Gp(){var e=Ld!==0;return Ld=0,e}function Pp(e,t,a){t.updateQueue=e.updateQueue,t.flags&=-2053,e.lanes&=~a}function Xp(e){if(qd){for(e=e.memoizedState;e!==null;){var t=e.queue;t!==null&&(t.pending=null),e=e.next}qd=!1}wi=0,Xt=ut=Ae=null,Jo=!1,_l=Ld=0,Ko=null}function Aa(){var e={memoizedState:null,baseState:null,baseQueue:null,queue:null,next:null};return Xt===null?Ae.memoizedState=Xt=e:Xt=Xt.next=e,Xt}function Gt(){if(ut===null){var e=Ae.alternate;e=e!==null?e.memoizedState:null}else e=ut.next;var t=Xt===null?Ae.memoizedState:Xt.next;if(t!==null)Xt=t,ut=e;else{if(e===null)throw Ae.alternate===null?Error(q(467)):Error(q(310));ut=e,e={memoizedState:ut.memoizedState,baseState:ut.baseState,baseQueue:ut.baseQueue,queue:ut.queue,next:null},Xt===null?Ae.memoizedState=Xt=e:Xt=Xt.next=e}return Xt}function uu(){return{lastEffect:null,events:null,stores:null,memoCache:null}}function Kl(e){var t=_l;return _l+=1,Ko===null&&(Ko=[]),e=xw(Ko,e,t),t=Ae,(Xt===null?t.memoizedState:Xt.next)===null&&(t=t.alternate,$e.H=t===null||t.memoizedState===null?n0:i0),e}function hu(e){if(e!==null&&typeof e=="object"){if(typeof e.then=="function")return Kl(e);if(e.$$typeof===Q5)return;if(e.$$typeof===Gn)return da(e)}throw Error(q(438,String(e)))}function Zp(e){var t=null,a=Ae.updateQueue;if(a!==null&&(t=a.memoCache),t==null){var n=Ae.alternate;n!==null&&(n=n.updateQueue,n!==null&&(n=n.memoCache,n!=null&&(t={data:n.data.map(function(r){return r.slice()}),index:0})))}if(t==null&&(t={data:[],index:0}),a===null&&(a=uu(),Ae.updateQueue=a),a.memoCache=t,a=t.data[t.index],a===void 0)for(a=t.data[t.index]=Array(e),n=0;n<e;n++)a[n]=Z5;return t.index++,a}function xi(e,t){return typeof t=="function"?t(e):t}function gd(e){var t=Gt();return Qp(t,ut,e)}function Qp(e,t,a){var n=e.queue;if(n===null)throw Error(q(311));n.lastRenderedReducer=a;var r=e.baseQueue,s=n.pending;if(s!==null){if(r!==null){var c=r.next;r.next=s.next,s.next=c}t.baseQueue=r=s,n.pending=null}if(s=e.baseState,r===null)e.memoizedState=s;else{t=r.next;var d=c=null,h=null,p=t,b=!1;do{var $=p.lane&-536870913;if($!==p.lane?(Ue&$)===$:(wi&$)===$){var f=p.revertLane;if(f===0)h!==null&&(h=h.next={lane:0,revertLane:0,gesture:null,action:p.action,hasEagerState:p.hasEagerState,eagerState:p.eagerState,next:null}),$===Hr&&(b=!0);else if((wi&f)===f){p=p.next,f===Hr&&(b=!0);continue}else $={lane:0,revertLane:p.revertLane,gesture:null,action:p.action,hasEagerState:p.hasEagerState,eagerState:p.eagerState,next:null},h===null?(d=h=$,c=s):h=h.next=$,Ae.lanes|=f,cr|=f;$=p.action,qr&&a(s,$),s=p.hasEagerState?p.eagerState:a(s,$)}else f={lane:$,revertLane:p.revertLane,gesture:p.gesture,action:p.action,hasEagerState:p.hasEagerState,eagerState:p.eagerState,next:null},h===null?(d=h=f,c=s):h=h.next=f,Ae.lanes|=$,cr|=$;p=p.next}while(p!==null&&p!==t);if(h===null?c=s:h.next=d,!Fa(s,e.memoizedState)&&(Qt=!0,b&&(a=Qo,a!==null)))throw a;e.memoizedState=s,e.baseState=c,e.baseQueue=h,n.lastRenderedState=s}return r===null&&(n.lanes=0),[e.memoizedState,n.dispatch]}function Fh(e){var t=Gt(),a=t.queue;if(a===null)throw Error(q(311));a.lastRenderedReducer=e;var n=a.dispatch,r=a.pending,s=t.memoizedState;if(r!==null){a.pending=null;var c=r=r.next;do s=e(s,c.action),c=c.next;while(c!==r);Fa(s,t.memoizedState)||(Qt=!0),t.memoizedState=s,t.baseQueue===null&&(t.baseState=s),a.lastRenderedState=s}return[s,n]}function Aw(e,t,a){var n=Ae,r=Gt(),s=ze;if(s){if(a===void 0)throw Error(q(407));a=a()}else a=t();var c=!Fa((ut||r).memoizedState,a);if(c&&(r.memoizedState=a,Qt=!0),r=r.queue,Fp(zw.bind(null,n,r,e),[e]),e=r.getSnapshot!==t||c||Xt!==null&&(Xt.memoizedState.tag&1)!==0,rs(e?9:8,{destroy:void 0},Mw.bind(null,n,r,a,t),null),e){if(n.flags|=2048,mt===null)throw Error(q(349));s||(wi&127)!==0||Rw(n,t,a)}return a}function Rw(e,t,a){e.flags|=16384,e={getSnapshot:t,value:a},t=Ae.updateQueue,t===null?(t=uu(),Ae.updateQueue=t,t.stores=[e]):(a=t.stores,a===null?t.stores=[e]:a.push(e))}function Mw(e,t,a,n){t.value=a,t.getSnapshot=n,Vw(t)&&Ow(e)}function zw(e,t,a){return a(function(){Vw(t)&&Ow(e)})}function Vw(e){var t=e.getSnapshot;e=e.value;try{var a=t();return!Fa(e,a)}catch{return!0}}function Ow(e){var t=Pr(e,2);t!==null&&_a(t,e,2)}function Hm(e){var t=Aa();if(typeof e=="function"){var a=e;if(e=a(),qr){ji(!0);try{a()}finally{ji(!1)}}}return t.memoizedState=t.baseState=e,t.queue={pending:null,lanes:0,dispatch:null,lastRenderedReducer:xi,lastRenderedState:e},t}function Iw(e,t,a,n){return e.baseState=a,Qp(e,ut,typeof n=="function"?n:xi)}function gS(e,t,a,n,r){if(pu(e))throw Error(q(485));if(e=t.action,e!==null){var s={payload:r,action:e,next:null,isTransition:!0,status:"pending",value:null,reason:null,listeners:[],then:function(c){s.listeners.push(c)}};$e.T!==null?a(!0):s.isTransition=!1,n(s),a=t.pending,a===null?(s.next=t.pending=s,Dw(t,s)):(s.next=a.next,t.pending=a.next=s)}}function Dw(e,t){var a=t.action,n=t.payload,r=e.state;if(t.isTransition){var s=$e.T,c={};c.types=s!==null?s.types:null,$e.T=c;try{var d=a(r,n),h=$e.S;h!==null&&h(c,d),Nv(e,t,d)}catch(p){Um(e,t,p)}finally{s!==null&&c.types!==null&&(s.types=c.types),$e.T=s}}else try{s=a(r,n),Nv(e,t,s)}catch(p){Um(e,t,p)}}function Nv(e,t,a){a!==null&&typeof a=="object"&&typeof a.then=="function"?a.then(function(n){Sv(e,t,n)},function(n){return Um(e,t,n)}):Sv(e,t,a)}function Sv(e,t,a){t.status="fulfilled",t.value=a,_w(t),e.state=a,t=e.pending,t!==null&&(a=t.next,a===t?e.pending=null:(a=a.next,t.next=a,Dw(e,a)))}function Um(e,t,a){var n=e.pending;if(e.pending=null,n!==null){n=n.next;do t.status="rejected",t.reason=a,_w(t),t=t.next;while(t!==n)}e.action=null}function _w(e){e=e.listeners;for(var t=0;t<e.length;t++)(0,e[t])()}function Hw(e,t){return t}function kv(e,t){if(ze){var a=mt.formState;if(a!==null){e:{var n=Ae;if(ze){if(wt){t:{for(var r=wt,s=dn;r.nodeType!==8;){if(!s){r=null;break t}if(r=un(r.nextSibling),r===null){r=null;break t}}s=r.data,r=s==="F!"||s==="F"?r:null}if(r){wt=un(r.nextSibling),n=r.data==="F!";break e}}or(n)}n=!1}n&&(t=a[0])}}return a=Aa(),a.memoizedState=a.baseState=t,n={pending:null,lanes:0,dispatch:null,lastRenderedReducer:Hw,lastRenderedState:t},a.queue=n,a=e0.bind(null,Ae,n),n.dispatch=a,n=Hm(!1),s=eg.bind(null,Ae,!1,n.queue),n=Aa(),r={state:t,dispatch:null,action:e,pending:null},n.queue=r,a=gS.bind(null,Ae,r,s,a),r.dispatch=a,n.memoizedState=e,[t,a,!1]}function Cv(e){var t=Gt();return Uw(t,ut,e)}function Uw(e,t,a){if(t=Qp(e,t,Hw)[0],e=gd(xi)[0],typeof t=="object"&&t!==null&&typeof t.then=="function")try{var n=Kl(t)}catch(c){throw c===bs?du:c}else n=t;t=Gt();var r=t.queue,s=r.dispatch;return a!==t.memoizedState&&(Ae.flags|=2048,rs(9,{destroy:void 0},fS.bind(null,r,a),null)),[n,s,e]}function fS(e,t){e.action=t}function Tv(e){var t=Gt(),a=ut;if(a!==null)return Uw(t,a,e);Gt(),t=t.memoizedState,a=Gt();var n=a.queue.dispatch;return a.memoizedState=e,[t,n,!1]}function rs(e,t,a,n){return e={tag:e,create:a,deps:n,inst:t,next:null},t=Ae.updateQueue,t===null&&(t=uu(),Ae.updateQueue=t),a=t.lastEffect,a===null?t.lastEffect=e.next=e:(n=a.next,a.next=e,e.next=n,t.lastEffect=e),e}function qw(){return Gt().memoizedState}function fd(e,t,a,n){var r=Aa();Ae.flags|=e,r.memoizedState=rs(1|t,{destroy:void 0},a,n===void 0?null:n)}function mu(e,t,a,n){var r=Gt();n=n===void 0?null:n;var s=r.memoizedState.inst;ut!==null&&n!==null&&jp(n,ut.memoizedState.deps)?r.memoizedState=rs(t,s,a,n):(Ae.flags|=e,r.memoizedState=rs(1|t,s,a,n))}function Ev(e,t){fd(8390656,8,e,t)}function Fp(e,t){mu(2048,8,e,t)}function bS(e){Ae.flags|=4;var t=Ae.updateQueue;if(t===null)t=uu(),Ae.updateQueue=t,t.events=[e];else{var a=t.events;a===null?t.events=[e]:a.push(e)}}function Lw(e){var t=Gt().memoizedState;return bS({ref:t,nextImpl:e}),function(){if((Je&2)!==0)throw Error(q(440));return t.impl.apply(void 0,arguments)}}function Bw(e,t){return mu(4,2,e,t)}function jw(e,t){return mu(4,4,e,t)}function Yw(e,t){if(typeof t=="function"){e=e();var a=t(e);return function(){typeof a=="function"?a():t(null)}}if(t!=null)return e=e(),t.current=e,function(){t.current=null}}function Gw(e,t,a){a=a!=null?a.concat([e]):null,mu(4,4,Yw.bind(null,t,e),a)}function Jp(){}function Pw(e,t){var a=Gt();t=t===void 0?null:t;var n=a.memoizedState;return t!==null&&jp(t,n[1])?n[0]:(a.memoizedState=[e,t],e)}function Xw(e,t){var a=Gt();t=t===void 0?null:t;var n=a.memoizedState;if(t!==null&&jp(t,n[1]))return n[0];if(n=e(),qr){ji(!0);try{e()}finally{ji(!1)}}return a.memoizedState=[n,t],n}function Kp(e,t,a){return a===void 0||(wi&1073741824)!==0&&(Ue&261930)===0?e.memoizedState=t:(e.memoizedState=a,e=U0(),Ae.lanes|=e,cr|=e,a)}function Zw(e,t,a,n){return Fa(a,t)?a:sr.current!==null?(e=Kp(e,a,n),Fa(e,t)||(Qt=!0),e):(wi&106)===0||(wi&1073741824)!==0&&(Ue&261930)===0?(Qt=!0,e.memoizedState=a):(e=U0(),Ae.lanes|=e,cr|=e,t)}function Qw(e,t,a,n,r){var s=Ke.p;Ke.p=s!==0&&8>s?s:8;var c=$e.T,d={};d.types=c!==null?c.types:null,$e.T=d,eg(e,!1,t,a);try{var h=r(),p=$e.S;if(p!==null&&p(d,h),h!==null&&typeof h=="object"&&typeof h.then=="function"){var b=hS(h,n);Nl(e,t,b,Qa(e))}else Nl(e,t,n,Qa(e))}catch($){Nl(e,t,{then:function(){},status:"rejected",reason:$},Qa())}finally{Ke.p=s,c!==null&&d.types!==null&&(c.types=d.types),$e.T=c}}function vS(){}function qm(e,t,a,n){if(e.tag!==5)throw Error(q(476));var r=Fw(e).queue;Qw(e,r,t,Rr,a===null?vS:function(){return Jw(e),a(n)})}function Fw(e){var t=e.memoizedState;if(t!==null)return t;t={memoizedState:Rr,baseState:Rr,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:xi,lastRenderedState:Rr},next:null};var a={};return t.next={memoizedState:a,baseState:a,baseQueue:null,queue:{pending:null,lanes:0,dispatch:null,lastRenderedReducer:xi,lastRenderedState:a},next:null},e.memoizedState=t,e=e.alternate,e!==null&&(e.memoizedState=t),t}function Jw(e){var t=Fw(e);t.next===null&&(t=e.alternate.memoizedState),Nl(e,t.next.queue,{},Qa())}function Wp(){return da(hs)}function Kw(){return Gt().memoizedState}function Ww(){return Gt().memoizedState}function yS(e){for(var t=e.return;t!==null;){switch(t.tag){case 24:case 3:var a=Qa();e=Ji(a);var n=Ki(t,e,a);n!==null&&(_a(n,t,a),wl(n,t,a)),t={cache:_p()},e.payload=t;return}t=t.return}}function wS(e,t,a){var n=Qa();a={lane:n,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null},pu(e)?t0(t,a):(a=Op(e,t,a,n),a!==null&&(_a(a,e,n),a0(a,t,n)))}function e0(e,t,a){var n=Qa();Nl(e,t,a,n)}function Nl(e,t,a,n){var r={lane:n,revertLane:0,gesture:null,action:a,hasEagerState:!1,eagerState:null,next:null};if(pu(e))t0(t,r);else{var s=e.alternate;if(e.lanes===0&&(s===null||s.lanes===0)&&(s=t.lastRenderedReducer,s!==null))try{var c=t.lastRenderedState,d=s(c,a);if(r.hasEagerState=!0,r.eagerState=d,Fa(d,c))return lu(e,t,r,0),mt===null&&su(),!1}catch{}if(a=Op(e,t,r,n),a!==null)return _a(a,e,n),a0(a,t,n),!0}return!1}function eg(e,t,a,n){if(n={lane:2,revertLane:ug(),gesture:null,action:n,hasEagerState:!1,eagerState:null,next:null},pu(e)){if(t)throw Error(q(479))}else t=Op(e,a,n,2),t!==null&&_a(t,e,2)}function pu(e){var t=e.alternate;return e===Ae||t!==null&&t===Ae}function t0(e,t){Jo=qd=!0;var a=e.pending;a===null?t.next=t:(t.next=a.next,a.next=t),e.pending=t}function a0(e,t,a){if((a&4194048)!==0){var n=t.lanes;n&=e.pendingLanes,a|=n,t.lanes=a,qy(e,a)}}var Bd={readContext:da,use:hu,useCallback:Ht,useContext:Ht,useEffect:Ht,useImperativeHandle:Ht,useLayoutEffect:Ht,useInsertionEffect:Ht,useMemo:Ht,useReducer:Ht,useRef:Ht,useState:Ht,useDebugValue:Ht,useDeferredValue:Ht,useTransition:Ht,useSyncExternalStore:Ht,useId:Ht,useHostTransitionStatus:Ht,useFormState:Ht,useActionState:Ht,useOptimistic:Ht,useMemoCache:Ht,useCacheRefresh:Ht,useEffectEvent:Ht},n0={readContext:da,use:hu,useCallback:function(e,t){return Aa().memoizedState=[e,t===void 0?null:t],e},useContext:da,useEffect:Ev,useImperativeHandle:function(e,t,a){a=a!=null?a.concat([e]):null,fd(4194308,4,Yw.bind(null,t,e),a)},useLayoutEffect:function(e,t){return fd(4194308,4,e,t)},useInsertionEffect:function(e,t){fd(4,2,e,t)},useMemo:function(e,t){var a=Aa();t=t===void 0?null:t;var n=e();if(qr){ji(!0);try{e()}finally{ji(!1)}}return a.memoizedState=[n,t],n},useReducer:function(e,t,a){var n=Aa();if(a!==void 0){var r=a(t);if(qr){ji(!0);try{a(t)}finally{ji(!1)}}}else r=t;return n.memoizedState=n.baseState=r,e={pending:null,lanes:0,dispatch:null,lastRenderedReducer:e,lastRenderedState:r},n.queue=e,e=e.dispatch=wS.bind(null,Ae,e),[n.memoizedState,e]},useRef:function(e){var t=Aa();return e={current:e},t.memoizedState=e},useState:function(e){e=Hm(e);var t=e.queue,a=e0.bind(null,Ae,t);return t.dispatch=a,[e.memoizedState,a]},useDebugValue:Jp,useDeferredValue:function(e,t){var a=Aa();return Kp(a,e,t)},useTransition:function(){var e=Hm(!1);return e=Qw.bind(null,Ae,e.queue,!0,!1),Aa().memoizedState=e,[!1,e]},useSyncExternalStore:function(e,t,a){var n=Ae,r=Aa();if(ze){if(a===void 0)throw Error(q(407));a=a()}else{if(a=t(),mt===null)throw Error(q(349));(Ue&127)!==0||Rw(n,t,a)}r.memoizedState=a;var s={value:a,getSnapshot:t};return r.queue=s,Ev(zw.bind(null,n,s,e),[e]),n.flags|=2048,rs(9,{destroy:void 0},Mw.bind(null,n,s,a,t),null),a},useId:function(){var e=Aa(),t=mt.identifierPrefix;if(ze){var a=Zn,n=Xn;a=(n&~(1<<32-Za(n)-1)).toString(32)+a,t="_"+t+"R_"+a,a=Ld++,0<a&&(t+="H"+a.toString(32)),t+="_"}else a=mS++,t="_"+t+"r_"+a.toString(32)+"_";return e.memoizedState=t},useHostTransitionStatus:Wp,useFormState:kv,useActionState:kv,useOptimistic:function(e){var t=Aa();t.memoizedState=t.baseState=e;var a={pending:null,lanes:0,dispatch:null,lastRenderedReducer:null,lastRenderedState:null};return t.queue=a,t=eg.bind(null,Ae,!0,a),a.dispatch=t,[e,t]},useMemoCache:Zp,useCacheRefresh:function(){return Aa().memoizedState=yS.bind(null,Ae)},useEffectEvent:function(e){var t=Aa(),a={impl:e};return t.memoizedState=a,function(){if((Je&2)!==0)throw Error(q(440));return a.impl.apply(void 0,arguments)}}},i0={readContext:da,use:hu,useCallback:Pw,useContext:da,useEffect:Fp,useImperativeHandle:Gw,useInsertionEffect:Bw,useLayoutEffect:jw,useMemo:Xw,useReducer:gd,useRef:qw,useState:function(){return gd(xi)},useDebugValue:Jp,useDeferredValue:function(e,t){var a=Gt();return Zw(a,ut.memoizedState,e,t)},useTransition:function(){var e=gd(xi)[0],t=Gt().memoizedState;return[typeof e=="boolean"?e:Kl(e),t]},useSyncExternalStore:Aw,useId:Kw,useHostTransitionStatus:Wp,useFormState:Cv,useActionState:Cv,useOptimistic:function(e,t){var a=Gt();return Iw(a,ut,e,t)},useMemoCache:Zp,useCacheRefresh:Ww,useEffectEvent:Lw},xS={readContext:da,use:hu,useCallback:Pw,useContext:da,useEffect:Fp,useImperativeHandle:Gw,useInsertionEffect:Bw,useLayoutEffect:jw,useMemo:Xw,useReducer:Fh,useRef:qw,useState:function(){return Fh(xi)},useDebugValue:Jp,useDeferredValue:function(e,t){var a=Gt();return ut===null?Kp(a,e,t):Zw(a,ut.memoizedState,e,t)},useTransition:function(){var e=Fh(xi)[0],t=Gt().memoizedState;return[typeof e=="boolean"?e:Kl(e),t]},useSyncExternalStore:Aw,useId:Kw,useHostTransitionStatus:Wp,useFormState:Tv,useActionState:Tv,useOptimistic:function(e,t){var a=Gt();return ut!==null?Iw(a,ut,e,t):(a.baseState=e,[e,a.queue.dispatch])},useMemoCache:Zp,useCacheRefresh:Ww,useEffectEvent:Lw};function Jh(e,t,a,n){t=e.memoizedState,a=a(n,t),a=a==null?t:pt({},t,a),e.memoizedState=a,e.lanes===0&&(e.updateQueue.baseState=a)}var Lm={enqueueSetState:function(e,t,a){e=e._reactInternals;var n=Qa(),r=Ji(n);r.payload=t,a!=null&&(r.callback=a),t=Ki(e,r,n),t!==null&&(_a(t,e,n),wl(t,e,n))},enqueueReplaceState:function(e,t,a){e=e._reactInternals;var n=Qa(),r=Ji(n);r.tag=1,r.payload=t,a!=null&&(r.callback=a),t=Ki(e,r,n),t!==null&&(_a(t,e,n),wl(t,e,n))},enqueueForceUpdate:function(e,t){e=e._reactInternals;var a=Qa(),n=Ji(a);n.tag=2,t!=null&&(n.callback=t),t=Ki(e,n,a),t!==null&&(_a(t,e,a),wl(t,e,a))}};function Av(e,t,a,n,r,s,c){return e=e.stateNode,typeof e.shouldComponentUpdate=="function"?e.shouldComponentUpdate(n,s,c):t.prototype&&t.prototype.isPureReactComponent?!zl(a,n)||!zl(r,s):!0}function Rv(e,t,a,n){e=t.state,typeof t.componentWillReceiveProps=="function"&&t.componentWillReceiveProps(a,n),typeof t.UNSAFE_componentWillReceiveProps=="function"&&t.UNSAFE_componentWillReceiveProps(a,n),t.state!==e&&Lm.enqueueReplaceState(t,t.state,null)}function Lr(e,t){var a=t;if("ref"in t){a={};for(var n in t)n!=="ref"&&(a[n]=t[n])}if(e=e.defaultProps){a===t&&(a=pt({},a));for(var r in e)a[r]===void 0&&(a[r]=e[r])}return a}function r0(e){zd(e)}function o0(e){console.error(e)}function s0(e){zd(e)}function jd(e,t){try{var a=e.onUncaughtError;a(t.value,{componentStack:t.stack})}catch(n){setTimeout(function(){throw n})}}function Mv(e,t,a){try{var n=e.onCaughtError;n(a.value,{componentStack:a.stack,errorBoundary:t.tag===1?t.stateNode:null})}catch(r){setTimeout(function(){throw r})}}function Bm(e,t,a){return a=Ji(a),a.tag=3,a.payload={element:null},a.callback=function(){jd(e,t)},a}function l0(e){return e=Ji(e),e.tag=3,e}function c0(e,t,a,n){var r=a.type.getDerivedStateFromError;if(typeof r=="function"){var s=n.value;e.payload=function(){return r(s)},e.callback=function(){Mv(t,a,n)}}var c=a.stateNode;c!==null&&typeof c.componentDidCatch=="function"&&(e.callback=function(){Mv(t,a,n),typeof r!="function"&&(tr===null?tr=new Set([this]):tr.add(this));var d=n.stack;this.componentDidCatch(n.value,{componentStack:d!==null?d:""})})}function $S(e,t,a,n,r){if(a.flags|=32768,n!==null&&typeof n=="object"&&typeof n.then=="function"){if(t=a.alternate,t!==null&&Dr(t,a,r,!0),a=pa.current,a!==null){switch(a.tag){case 31:case 13:case 19:return ya===null?Jd():a.alternate===null&&Ut===0&&(Ut=3),a.flags&=-257,a.flags|=65536,a.lanes=r,n===_d?a.flags|=16384:(t=a.updateQueue,t===null?a.updateQueue=new Set([n]):t.add(n),im(e,n,r)),!1;case 22:return a.flags|=65536,n===_d?a.flags|=16384:(t=a.updateQueue,t===null?(t={transitions:null,markerInstances:null,retryQueue:new Set([n])},a.updateQueue=t):(a=t.retryQueue,a===null?t.retryQueue=new Set([n]):a.add(n)),im(e,n,r)),!1}throw Error(q(435,a.tag))}return im(e,n,r),Jd(),!1}if(ze)return t=pa.current,t!==null?((t.flags&65536)===0&&(t.flags|=256),t.flags|=65536,t.lanes=r,n!==Rm&&(e=Error(q(422),{cause:n}),Ol(cn(e,a)))):(n!==Rm&&(t=Error(q(423),{cause:n}),Ol(cn(t,a))),e=e.current.alternate,e.flags|=65536,r&=-r,e.lanes|=r,n=cn(n,a),r=Bm(e.stateNode,n,r),Qh(e,r),Ut!==4&&(Ut=2)),!1;var s=Error(q(520),{cause:n});if(s=cn(s,a),Tl===null?Tl=[s]:Tl.push(s),Ut!==4&&(Ut=2),t===null)return!0;n=cn(n,a),a=t;do{switch(a.tag){case 3:return a.flags|=65536,e=r&-r,a.lanes|=e,e=Bm(a.stateNode,n,e),Qh(a,e),!1;case 1:if(t=a.type,s=a.stateNode,(a.flags&128)===0&&(typeof t.getDerivedStateFromError=="function"||s!==null&&typeof s.componentDidCatch=="function"&&(tr===null||!tr.has(s))))return a.flags|=65536,r&=-r,a.lanes|=r,r=l0(r),c0(r,e,a,n),Qh(a,r),!1;break;case 22:if(a.memoizedState!==null)return a.flags|=65536,!1}a=a.return}while(a!==null);return!1}var tg=Error(q(461)),Qt=!1;function Jt(e,t,a,n){t.child=e===null?Nw(t,null,a,n):Ur(t,e.child,a,n)}function zv(e,t,a,n,r){a=a.render;var s=t.ref;if("ref"in n){var c={};for(var d in n)d!=="ref"&&(c[d]=n[d])}else c=n;return _r(t),n=Yp(e,t,a,c,s,r),d=Gp(),e!==null&&!Qt?(Pp(e,t,r),$i(e,t,r)):(ze&&d&&cu(t),t.flags|=1,Jt(e,t,n,r),t.child)}function Vv(e,t,a,n,r){if(e===null){var s=a.type;return typeof s=="function"&&!Ip(s)&&s.defaultProps===void 0&&a.compare===null?(t.tag=15,t.type=s,d0(e,t,s,n,r)):(e=hd(a.type,null,n,t,t.mode,r),e.ref=t.ref,e.return=t,t.child=e)}if(s=e.child,!ng(e,r)){var c=s.memoizedProps;if(a=a.compare,a=a!==null?a:zl,a(c,n)&&e.ref===t.ref)return $i(e,t,r)}return t.flags|=1,e=fi(s,n),e.ref=t.ref,e.return=t,t.child=e}function d0(e,t,a,n,r){if(e!==null){var s=e.memoizedProps;if(zl(s,n)&&e.ref===t.ref)if(Qt=!1,t.pendingProps=n=s,ng(e,r))(e.flags&131072)!==0&&(Qt=!0);else return t.lanes=e.lanes,$i(e,t,r)}return jm(e,t,a,n,r)}function u0(e,t,a,n){var r=n.children,s=e!==null?e.memoizedState:null;if(e===null&&t.stateNode===null&&(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),n.mode==="hidden"){if((t.flags&128)!==0){if(s=s!==null?s.baseLanes|a:a,e!==null){for(n=t.child=e.child,r=0;n!==null;)r=r|n.lanes|n.childLanes,n=n.sibling;n=r&~s}else n=0,t.child=null;return Ov(e,t,s,a,n)}if((a&536870912)!==0)t.memoizedState={baseLanes:0,cachePool:null},e!==null&&pd(t,s!==null?s.cachePool:null),s!==null?$v(t,s):Dm(),Cw(t);else return n=t.lanes=536870912,Ov(e,t,s!==null?s.baseLanes|a:a,a,n)}else s!==null?(pd(t,s.cachePool),$v(t,s),er(),t.memoizedState=null):(e!==null&&pd(t,null),Dm(),er());return Jt(e,t,r,a),t.child}function Sl(e,t){return e!==null&&e.tag===22||t.stateNode!==null||(t.stateNode={_visibility:1,_pendingMarkers:null,_retryCache:null,_transitions:null}),t.sibling}function Ov(e,t,a,n,r){var s=Hp();return s=s===null?null:{parent:Zt._currentValue,pool:s},t.memoizedState={baseLanes:a,cachePool:s},e!==null&&pd(t,null),Dm(),Cw(t),e!==null&&Dr(e,t,n,!0),t.childLanes=r,null}function bd(e,t){return t=gu({mode:t.mode,children:t.children},e.mode),t.ref=e.ref,e.child=t,t.return=e,t}function Iv(e,t,a){return Ur(t,e.child,null,a),e=bd(t,t.pendingProps),e.flags|=2,ja(t),t.memoizedState=null,e}function NS(e,t,a){var n=t.pendingProps,r=(t.flags&128)!==0;if(t.flags&=-129,e===null){if(ze){if(n.mode==="hidden")return e=bd(t,n),t.lanes=536870912,e.memoizedState={baseLanes:0,cachePool:null},Sl(null,e);if(_m(t),(e=wt)?(e=u1(e,dn),e=e!==null&&e.data==="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:rr!==null?{id:Xn,overflow:Zn}:null,retryLane:536870912,hydrationErrors:null},a=fw(e),a.return=t,t.child=a,ra=t,wt=null)):e=null,e===null)throw or(t);return t.lanes=536870912,null}return bd(t,n)}var s=e.memoizedState;if(s!==null){var c=s.dehydrated;if(_m(t),r)if(t.flags&256)t.flags&=-257,t=Iv(e,t,a);else if(t.memoizedState!==null)t.child=e.child,t.flags|=128,t=null;else throw Error(q(558));else if(Qt||Dr(e,t,a,!1),r=(a&e.childLanes)!==0,Qt||r){if(sr.current===null){if(n=mt,n!==null&&(c=Ly(n,a),c!==0&&c!==s.retryLane))throw s.retryLane=c,Pr(e,c),_a(n,e,c),tg;Jd()}t=Iv(e,t,a)}else e=s.treeContext,wt=un(c.nextSibling),ra=t,ze=!0,Fi=null,dn=!1,e!==null&&vw(t,e),t=bd(t,n),t.flags|=134221824;return t}return e=fi(e.child,{mode:n.mode,children:n.children}),e.ref=t.ref,t.child=e,e.return=t,e}function Mo(e,t){var a=t.ref;if(a===null)e!==null&&e.ref!==null&&(t.flags|=4194816);else{if(typeof a!="function"&&typeof a!="object")throw Error(q(284));(e===null||e.ref!==a)&&(t.flags|=4194816)}}function jm(e,t,a,n,r){return _r(t),a=Yp(e,t,a,n,void 0,r),n=Gp(),e!==null&&!Qt?(Pp(e,t,r),$i(e,t,r)):(ze&&n&&cu(t),t.flags|=1,Jt(e,t,a,r),t.child)}function Dv(e,t,a,n,r,s){return _r(t),t.updateQueue=null,a=Ew(t,n,a,r),Tw(e),n=Gp(),e!==null&&!Qt?(Pp(e,t,s),$i(e,t,s)):(ze&&n&&cu(t),t.flags|=1,Jt(e,t,a,s),t.child)}function _v(e,t,a,n,r){if(_r(t),t.stateNode===null){var s=Bo,c=a.contextType;typeof c=="object"&&c!==null&&(s=da(c)),s=new a(n,s),t.memoizedState=s.state!==null&&s.state!==void 0?s.state:null,s.updater=Lm,t.stateNode=s,s._reactInternals=t,s=t.stateNode,s.props=n,s.state=t.memoizedState,s.refs={},qp(t),c=a.contextType,s.context=typeof c=="object"&&c!==null?da(c):Bo,s.state=t.memoizedState,c=a.getDerivedStateFromProps,typeof c=="function"&&(Jh(t,a,c,n),s.state=t.memoizedState),typeof a.getDerivedStateFromProps=="function"||typeof s.getSnapshotBeforeUpdate=="function"||typeof s.UNSAFE_componentWillMount!="function"&&typeof s.componentWillMount!="function"||(c=s.state,typeof s.componentWillMount=="function"&&s.componentWillMount(),typeof s.UNSAFE_componentWillMount=="function"&&s.UNSAFE_componentWillMount(),c!==s.state&&Lm.enqueueReplaceState(s,s.state,null),$l(t,n,s,r),xl(),s.state=t.memoizedState),typeof s.componentDidMount=="function"&&(t.flags|=4194308),n=!0}else if(e===null){s=t.stateNode;var d=t.memoizedProps,h=Lr(a,d);s.props=h;var p=s.context,b=a.contextType;c=Bo,typeof b=="object"&&b!==null&&(c=da(b));var $=a.getDerivedStateFromProps;b=typeof $=="function"||typeof s.getSnapshotBeforeUpdate=="function",d=t.pendingProps!==d,b||typeof s.UNSAFE_componentWillReceiveProps!="function"&&typeof s.componentWillReceiveProps!="function"||(d||p!==c)&&Rv(t,s,n,c),Li=!1;var f=t.memoizedState;s.state=f,$l(t,n,s,r),xl(),p=t.memoizedState,d||f!==p||Li?(typeof $=="function"&&(Jh(t,a,$,n),p=t.memoizedState),(h=Li||Av(t,a,h,n,f,p,c))?(b||typeof s.UNSAFE_componentWillMount!="function"&&typeof s.componentWillMount!="function"||(typeof s.componentWillMount=="function"&&s.componentWillMount(),typeof s.UNSAFE_componentWillMount=="function"&&s.UNSAFE_componentWillMount()),typeof s.componentDidMount=="function"&&(t.flags|=4194308)):(typeof s.componentDidMount=="function"&&(t.flags|=4194308),t.memoizedProps=n,t.memoizedState=p),s.props=n,s.state=p,s.context=c,n=h):(typeof s.componentDidMount=="function"&&(t.flags|=4194308),n=!1)}else{s=t.stateNode,Om(e,t),c=t.memoizedProps,b=Lr(a,c),s.props=b,$=t.pendingProps,f=s.context,p=a.contextType,h=Bo,typeof p=="object"&&p!==null&&(h=da(p)),d=a.getDerivedStateFromProps,(p=typeof d=="function"||typeof s.getSnapshotBeforeUpdate=="function")||typeof s.UNSAFE_componentWillReceiveProps!="function"&&typeof s.componentWillReceiveProps!="function"||(c!==$||f!==h)&&Rv(t,s,n,h),Li=!1,f=t.memoizedState,s.state=f,$l(t,n,s,r),xl();var y=t.memoizedState;c!==$||f!==y||Li||e!==null&&e.dependencies!==null&&Dd(e.dependencies)?(typeof d=="function"&&(Jh(t,a,d,n),y=t.memoizedState),(b=Li||Av(t,a,b,n,f,y,h)||e!==null&&e.dependencies!==null&&Dd(e.dependencies))?(p||typeof s.UNSAFE_componentWillUpdate!="function"&&typeof s.componentWillUpdate!="function"||(typeof s.componentWillUpdate=="function"&&s.componentWillUpdate(n,y,h),typeof s.UNSAFE_componentWillUpdate=="function"&&s.UNSAFE_componentWillUpdate(n,y,h)),typeof s.componentDidUpdate=="function"&&(t.flags|=4),typeof s.getSnapshotBeforeUpdate=="function"&&(t.flags|=1024)):(typeof s.componentDidUpdate!="function"||c===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof s.getSnapshotBeforeUpdate!="function"||c===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),t.memoizedProps=n,t.memoizedState=y),s.props=n,s.state=y,s.context=h,n=b):(typeof s.componentDidUpdate!="function"||c===e.memoizedProps&&f===e.memoizedState||(t.flags|=4),typeof s.getSnapshotBeforeUpdate!="function"||c===e.memoizedProps&&f===e.memoizedState||(t.flags|=1024),n=!1)}return s=n,Mo(e,t),n=(t.flags&128)!==0,s||n?(s=t.stateNode,a=n&&typeof a.getDerivedStateFromError!="function"?null:s.render(),t.flags|=1,e!==null&&n?(t.child=Ur(t,e.child,null,r),t.child=Ur(t,null,a,r)):Jt(e,t,a,r),t.memoizedState=s.state,e=t.child):e=$i(e,t,r),e}function Hv(e,t,a,n){return Ir(),t.flags|=256,Jt(e,t,a,n),t.child}var Ym={dehydrated:null,treeContext:null,retryLane:0,hydrationErrors:null};function Gm(e){return{baseLanes:e,cachePool:ww()}}function Pm(e,t,a){return e=e!==null?e.childLanes&~a:0,t&&(e|=Ga),e}function h0(e,t,a){var n=t.pendingProps,r=!1,s=(t.flags&128)!==0,c;if((c=s)||(c=e!==null&&e.memoizedState===null?!1:(ha.current&2)!==0),c&&(r=!0,t.flags&=-129),c=(t.flags&32)!==0,t.flags&=-33,e===null){if(ze){if(r?Wi(t):er(),(e=wt)?(e=u1(e,dn),e=e!==null&&e.data!=="&"?e:null,e!==null&&(t.memoizedState={dehydrated:e,treeContext:rr!==null?{id:Xn,overflow:Zn}:null,retryLane:536870912,hydrationErrors:null},a=fw(e),a.return=t,t.child=a,ra=t,wt=null)):e=null,e===null)throw or(t);return gg(e)?t.lanes=32:t.lanes=536870912,null}return s=n.children,n=n.fallback,r?(er(),r=t.mode,s=gu({mode:"hidden",children:s},r),n=Mr(n,r,a,null),s.return=t,n.return=t,s.sibling=n,t.child=s,n=t.child,n.memoizedState=Gm(a),n.childLanes=Pm(e,c,a),t.memoizedState=Ym,Sl(null,n)):(Wi(t),ag(t,s))}var d=e.memoizedState;if(d!==null){var h=d.dehydrated;if(h!==null)return SS(e,t,s,c,n,h,d,a)}return r?(er(),r=n.fallback,s=t.mode,d=e.child,h=d.sibling,n=fi(d,{mode:"hidden",children:n.children}),n.subtreeFlags=d.subtreeFlags&1206910976,h!==null?r=fi(h,r):(r=Mr(r,s,a,null),r.flags|=2),r.return=t,n.return=t,n.sibling=r,t.child=n,Sl(null,n),n=t.child,r=e.child.memoizedState,r===null?r=Gm(a):(s=r.cachePool,s!==null?(d=Zt._currentValue,s=s.parent!==d?{parent:d,pool:d}:s):s=ww(),r={baseLanes:r.baseLanes|a,cachePool:s}),n.memoizedState=r,n.childLanes=Pm(e,c,a),t.memoizedState=Ym,Sl(e.child,n)):(Wi(t),a=e.child,e=a.sibling,a=fi(a,{mode:"visible",children:n.children}),a.return=t,a.sibling=null,e!==null&&(c=t.deletions,c===null?(t.deletions=[e],t.flags|=16):c.push(e)),t.child=a,t.memoizedState=null,a)}function ag(e,t){return t=gu({mode:"visible",children:t},e.mode),t.return=e,e.child=t}function gu(e,t){return e=Da(22,e,null,t),e.lanes=0,e}function Kc(e,t,a){return Ur(t,e.child,null,a),e=ag(t,t.pendingProps.children),e.flags|=2,t.memoizedState=null,e}function SS(e,t,a,n,r,s,c,d){if(a)return t.flags&256?(Wi(t),t.flags&=-257,Kc(e,t,d)):t.memoizedState!==null?(er(),t.child=e.child,t.flags|=128,null):(er(),s=r.fallback,c=t.mode,r=gu({mode:"visible",children:r.children},c),s=Mr(s,c,d,null),s.flags|=2,r.return=t,s.return=t,r.sibling=s,t.child=r,Ur(t,e.child,null,d),r=t.child,r.memoizedState=Gm(d),r.childLanes=Pm(e,n,d),t.memoizedState=Ym,Sl(null,r));if(Wi(t),gg(s)){if(n=s.nextSibling&&s.nextSibling.dataset,n)var h=n.dgst;return n=h,n!==""&&(r=Error(q(419)),r.stack="",r.digest=n,Ol({value:r,source:null,stack:null})),Kc(e,t,d)}if(Qt||Dr(e,t,d,!1),n=(d&e.childLanes)!==0,Qt||n){if(sr.current!==null)return Kc(e,t,d);if(n=mt,n!==null&&(r=Ly(n,d),r!==0&&r!==c.retryLane))throw c.retryLane=r,Pr(e,r),_a(n,e,r),tg;return bp(s)||Jd(),Kc(e,t,d)}return bp(s)?(t.flags|=192,t.child=e.child,null):(e=c.treeContext,wt=un(s.nextSibling),ra=t,ze=!0,Fi=null,dn=!1,e!==null&&vw(t,e),t=ag(t,r.children),t.flags|=134221824,t)}function Uv(e,t,a){e.lanes|=t;var n=e.alternate;n!==null&&(n.lanes|=t),md(e.return,t,a)}function qv(e){for(var t=null;e!==null;){var a=e.alternate;a!==null&&Ud(a)===null&&(t=e),e=e.sibling}return t}function Wc(e,t,a,n,r,s){var c=e.memoizedState;c===null?e.memoizedState={isBackwards:t,rendering:null,renderingStartTime:0,last:n,tail:a,tailMode:r,treeForkCount:s}:(c.isBackwards=t,c.rendering=null,c.renderingStartTime=0,c.last=n,c.tail=a,c.tailMode=r,c.treeForkCount=s)}function Kh(e){var t=e.child;for(e.child=null;t!==null;){var a=t.sibling;t.sibling=e.child,e.child=t,t=a}}function Xm(e,t,a){var n=t.pendingProps,r=n.revealOrder,s=n.tail;n=n.children;var c=ha.current;if(t.flags&128)return Dl(t,c),null;var d=(c&2)!==0;if(d?(c=c&1|2,t.flags|=128):c&=1,Dl(t,c),r==="backwards"&&e!==null?(Kh(e),Jt(e,t,n,a),Kh(e)):Jt(e,t,n,a),n=ze?Vl:0,!d&&e!==null&&(e.flags&128)!==0)e:for(e=t.child;e!==null;){if(e.tag===13)e.memoizedState!==null&&Uv(e,a,t);else if(e.tag===19)Uv(e,a,t);else if(e.child!==null){e.child.return=e,e=e.child;continue}if(e===t)break e;for(;e.sibling===null;){if(e.return===null||e.return===t)break e;e=e.return}e.sibling.return=e.return,e=e.sibling}switch(r){case"backwards":a=qv(t.child),a===null?(r=t.child,t.child=null):(r=a.sibling,a.sibling=null,Kh(t)),Wc(t,!0,r,null,s,n);break;case"unstable_legacy-backwards":for(a=null,r=t.child,t.child=null;r!==null;){if(e=r.alternate,e!==null&&Ud(e)===null){t.child=r;break}e=r.sibling,r.sibling=a,a=r,r=e}Wc(t,!0,a,null,s,n);break;case"together":Wc(t,!1,null,null,void 0,n);break;case"independent":t.memoizedState=null;break;default:a=qv(t.child),a===null?(r=t.child,t.child=null):(r=a.sibling,a.sibling=null),Wc(t,!1,r,a,s,n)}return t.child}function Lv(e,t,a){var n=t.pendingProps;return Gi(t,t.type,n.value),Jt(e,t,n.children,a),t.child}function $i(e,t,a){if(e!==null&&(t.dependencies=e.dependencies),cr|=t.lanes,(a&t.childLanes)===0)if(e!==null){if(Dr(e,t,a,!1),(a&t.childLanes)===0)return null}else return null;if(e!==null&&t.child!==e.child)throw Error(q(153));if(t.child!==null){for(e=t.child,a=fi(e,e.pendingProps),t.child=a,a.return=t;e.sibling!==null;)e=e.sibling,a=a.sibling=fi(e,e.pendingProps),a.return=t;a.sibling=null}return t.child}function ng(e,t){return(e.lanes&t)!==0?!0:(e=e.dependencies,!!(e!==null&&Dd(e)))}function kS(e,t,a){switch(t.tag){case 3:Ed(t,t.stateNode.containerInfo),Gi(t,Zt,e.memoizedState.cache),Ir();break;case 27:case 5:wm(t);break;case 4:Ed(t,t.stateNode.containerInfo);break;case 10:Gi(t,t.type,t.memoizedProps.value);break;case 31:if(t.memoizedState!==null)return t.flags|=128,_m(t),null;break;case 13:var n=t.memoizedState;if(n!==null){if(n.dehydrated!==null)return Wi(t),t.flags|=128,null;n=Dr(e,t,a,!1);var r=t.child.childLanes;return n||(a&r)!==0?h0(e,t,a):(Wi(t),e=$i(e,t,a),e!==null?e.sibling:null)}Wi(t);break;case 19:if(t.flags&128)return Xm(e,t,a);if(r=(e.flags&128)!==0,n=(a&t.childLanes)!==0,n||(Dr(e,t,a,!1),n=(a&t.childLanes)!==0),r){if(n)return Xm(e,t,a);t.flags|=128}if(r=t.memoizedState,r!==null&&(r.rendering=null,r.tail=null,r.lastEffect=null),Dl(t,ha.current),n)break;return null;case 22:return t.lanes=0,u0(e,t,a,t.pendingProps);case 24:Gi(t,Zt,e.memoizedState.cache)}return $i(e,t,a)}function m0(e,t,a){if(e!==null)if(e.memoizedProps!==t.pendingProps)Qt=!0;else{if(!ng(e,a)&&(t.flags&128)===0)return Qt=!1,kS(e,t,a);Qt=(e.flags&131072)!==0}else Qt=!1,ze&&(t.flags&1048576)!==0&&bw(t,Vl,t.index);switch(t.lanes=0,t.tag){case 16:e:{var n=t.pendingProps;if(e=Cr(t.elementType),t.type=e,typeof e=="function")Ip(e)?(n=Lr(e,n),t.tag=1,t=_v(null,t,e,n,a)):(t.tag=0,t=jm(null,t,e,n,a));else{if(e!=null){var r=e.$$typeof;if(r===$p){t.tag=11,t=zv(null,t,e,n,a);break e}else if(r===Np){t.tag=14,t=Vv(null,t,e,n,a);break e}else if(r===Gn){t.tag=10,t.type=e,t=Lv(null,t,a);break e}}throw t=vm(e)||e,Error(q(306,t,""))}}return t;case 0:return jm(e,t,t.type,t.pendingProps,a);case 1:return n=t.type,r=Lr(n,t.pendingProps),_v(e,t,n,r,a);case 3:e:{if(Ed(t,t.stateNode.containerInfo),e===null)throw Error(q(387));n=t.pendingProps;var s=t.memoizedState;r=s.element,Om(e,t),$l(t,n,null,a);var c=t.memoizedState;if(n=c.cache,Gi(t,Zt,n),n!==s.cache&&zm(t,[Zt],a,!0),xl(),n=c.element,s.isDehydrated)if(s={element:n,isDehydrated:!1,cache:c.cache},t.updateQueue.baseState=s,t.memoizedState=s,t.flags&256){t=Hv(e,t,n,a);break e}else if(n!==r){r=cn(Error(q(424)),t),Ol(r),t=Hv(e,t,n,a);break e}else for(e=t.stateNode.containerInfo,e.nodeType===9?e=e.body:e=e.nodeName==="HTML"?e.ownerDocument.body:e,wt=un(e.firstChild),ra=t,ze=!0,Fi=null,dn=!0,a=Nw(t,null,n,a),t.child=a;a;)a.flags=a.flags&-3|134221824,a=a.sibling;else{if(Ir(),n===r){t=$i(e,t,a);break e}Jt(e,t,n,a)}t=t.child}return t;case 26:return Mo(e,t),e===null?(a=py(t.type,null,t.pendingProps,null))?t.memoizedState=a:ze||(t.stateNode=a1(t.type,t.pendingProps,Qi.current,t)):t.memoizedState=py(t.type,e.memoizedProps,t.pendingProps,e.memoizedState),null;case 27:return wm(t),e===null&&ze&&(n=t.stateNode=h1(t.type,t.pendingProps,Qi.current),ra=t,dn=!0,r=wt,ur(t.type)?(vp=r,wt=un(n.firstChild)):wt=r),Jt(e,t,t.pendingProps.children,a),Mo(e,t),e===null&&(t.flags|=4194304),t.child;case 5:return e===null&&ze&&((r=n=wt)&&(n=bk(n,t.type,t.pendingProps,dn),n!==null?(t.stateNode=n,ra=t,wt=un(n.firstChild),dn=!1,r=!0):r=!1),r||or(t)),wm(t),r=t.type,s=t.pendingProps,c=e!==null?e.memoizedProps:null,n=s.children,pp(r,s)?n=null:c!==null&&pp(r,c)&&(t.flags|=32),t.memoizedState!==null&&(r=Yp(e,t,pS,null,null,a),hs._currentValue=r),Mo(e,t),Jt(e,t,n,a),t.child;case 6:return e===null&&ze&&((e=a=wt)&&(a=vk(a,t.pendingProps,dn),a!==null?(t.stateNode=a,ra=t,wt=null,e=!0):e=!1),e||or(t)),null;case 13:return h0(e,t,a);case 4:return Ed(t,t.stateNode.containerInfo),n=t.pendingProps,e===null?t.child=Ur(t,null,n,a):Jt(e,t,n,a),t.child;case 11:return zv(e,t,t.type,t.pendingProps,a);case 7:return n=t.pendingProps,Mo(e,t),Jt(e,t,n,a),t.child;case 8:return Jt(e,t,t.pendingProps.children,a),t.child;case 12:return Jt(e,t,t.pendingProps.children,a),t.child;case 10:return Lv(e,t,a);case 9:return r=t.type._context,n=t.pendingProps.children,_r(t),r=da(r),n=n(r),t.flags|=1,Jt(e,t,n,a),t.child;case 14:return Vv(e,t,t.type,t.pendingProps,a);case 15:return d0(e,t,t.type,t.pendingProps,a);case 19:return Xm(e,t,a);case 31:return NS(e,t,a);case 22:return u0(e,t,a,t.pendingProps);case 24:return _r(t),n=da(Zt),e===null?(r=Hp(),r===null&&(r=mt,s=_p(),r.pooledCache=s,s.refCount++,s!==null&&(r.pooledCacheLanes|=a),r=s),t.memoizedState={parent:n,cache:r},qp(t),Gi(t,Zt,r)):((e.lanes&a)!==0&&(Om(e,t),$l(t,null,null,a),xl()),r=e.memoizedState,s=t.memoizedState,r.parent!==n?(r={parent:n,cache:n},t.memoizedState=r,t.lanes===0&&(t.memoizedState=t.updateQueue.baseState=r),Gi(t,Zt,n)):(n=s.cache,Gi(t,Zt,n),n!==r.cache&&zm(t,[Zt],a,!0))),Jt(e,t,t.pendingProps.children,a),t.child;case 30:return t.stateNode===null&&(t.stateNode={autoName:null,paired:null,clones:null,ref:null}),n=t.pendingProps,n.name!=null&&n.name!=="auto"?t.flags|=e===null?18882560:18874368:ze&&cu(t),e!==null&&e.memoizedProps.name!==n.name?t.flags|=4194816:Mo(e,t),Jt(e,t,n.children,a),t.child;case 29:throw t.pendingProps}throw Error(q(156,t.tag))}function mi(e){e.flags|=4}function Wh(e,t,a,n,r){var s;if((s=(e.mode&32)!==0)&&(s=a===null?by(t,n):by(t,n)&&(n.src!==a.src||n.srcSet!==a.srcSet)),s){if(e.flags|=16777216,(r&335544128)===r)if(e.stateNode.complete)e.flags|=8192;else if(B0())e.flags|=8192;else throw Vr=_d,Up}else e.flags&=-16777217}function Bv(e,t){if(t.type!=="stylesheet"||(t.state.loading&4)!==0)e.flags&=-16777217;else if(e.flags|=16777216,!f1(t))if(B0())e.flags|=8192;else throw Vr=_d,Up}function ed(e,t){t!==null&&(e.flags|=4),e.flags&16384&&(t=e.tag!==22?Hy():536870912,e.lanes|=t,os|=t)}function sl(e,t){if(!ze)switch(e.tailMode){case"visible":break;case"collapsed":for(var a=e.tail,n=null;a!==null;)a.alternate!==null&&(n=a),a=a.sibling;n===null?t||e.tail===null?e.tail=null:e.tail.sibling=null:n.sibling=null;break;default:for(t=e.tail,a=null;t!==null;)t.alternate!==null&&(a=t),t=t.sibling;a===null?e.tail=null:a.sibling=null}}function yt(e){var t=e.alternate!==null&&e.alternate.child===e.child,a=0,n=0;if(t)for(var r=e.child;r!==null;)a|=r.lanes|r.childLanes,n|=r.subtreeFlags&1206910976,n|=r.flags&1206910976,r.return=e,r=r.sibling;else for(r=e.child;r!==null;)a|=r.lanes|r.childLanes,n|=r.subtreeFlags,n|=r.flags,r.return=e,r=r.sibling;return e.subtreeFlags|=n,e.childLanes=a,t}function CS(e,t,a){var n=t.pendingProps;switch(Dp(t),t.tag){case 16:case 15:case 0:case 11:case 7:case 8:case 12:case 9:case 14:return yt(t),null;case 1:return yt(t),null;case 3:return a=t.stateNode,n=null,e!==null&&(n=e.memoizedState.cache),t.memoizedState.cache!==n&&(t.flags|=2048),bi(Zt),as(),a.pendingContext&&(a.context=a.pendingContext,a.pendingContext=null),(e===null||e.child===null)&&(Ao(t)?mi(t):e===null||e.memoizedState.isDehydrated&&(t.flags&256)===0||(t.flags|=1024,Zh())),yt(t),null;case 26:var r=t.type,s=t.memoizedState;return e===null?(mi(t),s!==null?(yt(t),Bv(t,s)):(yt(t),Wh(t,r,null,n,a))):s?s!==e.memoizedState?(mi(t),yt(t),Bv(t,s)):(yt(t),t.flags&=-16777217):(e=e.memoizedProps,e!==n&&mi(t),yt(t),Wh(t,r,e,n,a)),null;case 27:if(Ad(t),a=Qi.current,r=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==n&&mi(t);else{if(!n){if(t.stateNode===null)throw Error(q(166));return yt(t),t.subtreeFlags&=-33554433,null}e=Qn.current,Ao(t)?gv(t,e):(e=h1(r,n,a),t.stateNode=e,mi(t))}return yt(t),t.subtreeFlags&=-33554433,null;case 5:if(Ad(t),r=t.type,e!==null&&t.stateNode!=null)e.memoizedProps!==n&&mi(t);else{if(!n){if(t.stateNode===null)throw Error(q(166));return yt(t),t.subtreeFlags&=-33554433,null}if(s=Qn.current,Ao(t))gv(t,s);else{var c=ql(Qi.current);switch(s){case 1:s=c.createElementNS("http://www.w3.org/2000/svg",r);break;case 2:s=c.createElementNS("http://www.w3.org/1998/Math/MathML",r);break;default:switch(r){case"svg":s=c.createElementNS("http://www.w3.org/2000/svg",r);break;case"math":s=c.createElementNS("http://www.w3.org/1998/Math/MathML",r);break;case"script":s=c.createElement("div"),s.innerHTML="<script><\/script>",s=s.removeChild(s.firstChild);break;case"select":s=typeof n.is=="string"?c.createElement("select",{is:n.is}):c.createElement("select"),n.multiple?s.multiple=!0:n.size&&(s.size=n.size);break;default:s=typeof n.is=="string"?c.createElement(r,{is:n.is}):c.createElement(r)}}s[ca]=t,s[Ua]=n;e:for(c=t.child;c!==null;){if(c.tag===5||c.tag===6)s.appendChild(c.stateNode);else if(c.tag!==4&&c.tag!==27&&c.child!==null){c.child.return=c,c=c.child;continue}if(c===t)break e;for(;c.sibling===null;){if(c.return===null||c.return===t)break e;c=c.return}c.sibling.return=c.return,c=c.sibling}t.stateNode=s;e:switch(ma(s,r,n),r){case"button":case"input":case"select":case"textarea":n=!!n.autoFocus;break e;case"img":n=!0;break e;default:n=!1}n&&mi(t)}}return yt(t),t.subtreeFlags&=-33554433,Wh(t,t.type,e===null?null:e.memoizedProps,t.pendingProps,a),null;case 6:if(e&&t.stateNode!=null)e.memoizedProps!==n&&mi(t);else{if(typeof n!="string"&&t.stateNode===null)throw Error(q(166));if(e=Qi.current,Ao(t)){if(e=t.stateNode,a=t.memoizedProps,n=null,r=ra,r!==null)switch(r.tag){case 27:case 5:n=r.memoizedProps}e[ca]=t,e=!!(e.nodeValue===a||n!==null&&n.suppressHydrationWarning===!0||e1(e.nodeValue,a)),e||or(t,!0)}else e=ql(e).createTextNode(n),e[ca]=t,t.stateNode=e}return yt(t),null;case 31:if(a=t.memoizedState,e===null||e.memoizedState!==null){if(n=Ao(t),a!==null){if(e===null){if(!n)throw Error(q(318));if(e=t.memoizedState,e=e!==null?e.dehydrated:null,!e)throw Error(q(557));e[ca]=t}else Ir(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;yt(t),e=!1}else a=Zh(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=a),e=!0;if(!e)return t.flags&256?(ja(t),t):(ja(t),null);if((t.flags&128)!==0)throw Error(q(558))}return yt(t),null;case 13:if(n=t.memoizedState,e===null||e.memoizedState!==null&&e.memoizedState.dehydrated!==null){if(r=Ao(t),n!==null&&n.dehydrated!==null){if(e===null){if(!r)throw Error(q(318));if(r=t.memoizedState,r=r!==null?r.dehydrated:null,!r)throw Error(q(317));r[ca]=t}else Ir(),(t.flags&128)===0&&(t.memoizedState=null),t.flags|=4;yt(t),r=!1}else r=Zh(),e!==null&&e.memoizedState!==null&&(e.memoizedState.hydrationErrors=r),r=!0;if(!r)return t.flags&256?(ja(t),t):(ja(t),null)}return ja(t),(t.flags&128)!==0?(t.lanes=a,t):(a=n!==null,e=e!==null&&e.memoizedState!==null,a&&(n=t.child,r=null,n.alternate!==null&&n.alternate.memoizedState!==null&&n.alternate.memoizedState.cachePool!==null&&(r=n.alternate.memoizedState.cachePool.pool),s=null,n.memoizedState!==null&&n.memoizedState.cachePool!==null&&(s=n.memoizedState.cachePool.pool),s!==r&&(n.flags|=2048)),a!==e&&a&&(t.child.flags|=8192),ed(t,t.updateQueue),yt(t),null);case 4:return as(),e===null&&hg(t.stateNode.containerInfo),t.flags|=67108864,yt(t),null;case 10:return bi(t.type),yt(t),null;case 19:if(Bp(t),n=t.memoizedState,n===null)return yt(t),null;if(r=(t.flags&128)!==0,s=n.rendering,s===null)if(r)sl(n,!1);else{if(Ut!==0||e!==null&&(e.flags&128)!==0)for(e=t.child;e!==null;){if(s=Ud(e),s!==null){for(t.flags|=128,sl(n,!1),e=s.updateQueue,t.updateQueue=e,ed(t,e),t.subtreeFlags=0,e=a,a=t.child;a!==null;)gw(a,e),a=a.sibling;return Dl(t,ha.current&1|2),ze&&pi(t,n.treeForkCount),t.child}e=e.sibling}n.tail!==null&&Pa()>Qd&&(t.flags|=128,r=!0,sl(n,!1),t.lanes=4194304)}else{if(!r)if(e=Ud(s),e!==null){if(t.flags|=128,r=!0,e=e.updateQueue,t.updateQueue=e,ed(t,e),sl(n,!0),n.tail===null&&n.tailMode!=="collapsed"&&n.tailMode!=="visible"&&!s.alternate&&!ze)return yt(t),null}else 2*Pa()-n.renderingStartTime>Qd&&a!==536870912&&(t.flags|=128,r=!0,sl(n,!1),t.lanes=4194304);n.isBackwards?(s.sibling=t.child,t.child=s):(e=n.last,e!==null?e.sibling=s:t.child=s,n.last=s)}if(n.tail!==null){e=n.tail;e:{for(a=e;a!==null;){if(a.alternate!==null){a=!1;break e}a=a.sibling}a=!0}return n.rendering=e,n.tail=e.sibling,n.renderingStartTime=Pa(),e.sibling=null,s=ha.current,s=r?s&1|2:s&1,n.tailMode==="visible"||n.tailMode==="collapsed"||!a||ze?Dl(t,s):(a=s,xt(pa,t),xt(ha,a),ya===null&&(ya=t)),ze&&pi(t,n.treeForkCount),e}return yt(t),null;case 22:case 23:return ja(t),Lp(),n=t.memoizedState!==null,e!==null?e.memoizedState!==null!==n&&(t.flags|=8192):n&&(t.flags|=8192),n?(a&536870912)!==0&&(t.flags&128)===0&&(yt(t),t.subtreeFlags&6&&(t.flags|=8192)):yt(t),a=t.updateQueue,a!==null&&ed(t,a.retryQueue),a=null,e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),n=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(n=t.memoizedState.cachePool.pool),n!==a&&(t.flags|=2048),e!==null&&ua(zr),null;case 24:return a=null,e!==null&&(a=e.memoizedState.cache),t.memoizedState.cache!==a&&(t.flags|=2048),bi(Zt),yt(t),null;case 25:return null;case 30:return t.flags|=33554432,yt(t),null}throw Error(q(156,t.tag))}function TS(e,t){switch(Dp(t),t.tag){case 1:return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 3:return bi(Zt),as(),e=t.flags,(e&65536)!==0&&(e&128)===0?(t.flags=e&-65537|128,t):null;case 26:case 27:case 5:return Ad(t),null;case 31:if(t.memoizedState!==null){if(ja(t),t.alternate===null)throw Error(q(340));Ir()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 13:if(ja(t),e=t.memoizedState,e!==null&&e.dehydrated!==null){if(t.alternate===null)throw Error(q(340));Ir()}return e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 19:return Bp(t),e=t.flags,e&65536?(t.flags=e&-65537|128,e=t.memoizedState,e!==null&&(e.rendering=null,e.tail=null),t.flags|=4,t):null;case 4:return as(),null;case 10:return bi(t.type),null;case 22:case 23:return ja(t),Lp(),e!==null&&ua(zr),e=t.flags,e&65536?(t.flags=e&-65537|128,t):null;case 24:return bi(Zt),null;case 25:return null;default:return null}}function p0(e,t){switch(Dp(t),t.tag){case 3:bi(Zt),as();break;case 26:case 27:case 5:Ad(t);break;case 4:as();break;case 31:t.memoizedState!==null&&ja(t);break;case 13:ja(t);break;case 19:Bp(t);break;case 10:bi(t.type);break;case 22:case 23:ja(t),Lp(),e!==null&&ua(zr);break;case 24:bi(Zt)}}function Wl(e,t){try{var a=t.updateQueue,n=a!==null?a.lastEffect:null;if(n!==null){var r=n.next;a=r;do{if((a.tag&e)===e){n=void 0;var s=a.create,c=a.inst;n=s(),c.destroy=n}a=a.next}while(a!==r)}}catch(d){ot(t,t.return,d)}}function lr(e,t,a){try{var n=t.updateQueue,r=n!==null?n.lastEffect:null;if(r!==null){var s=r.next;n=s;do{if((n.tag&e)===e){var c=n.inst,d=c.destroy;if(d!==void 0){c.destroy=void 0,r=t;var h=a,p=d;try{p()}catch(b){ot(r,h,b)}}}n=n.next}while(n!==s)}}catch(b){ot(t,t.return,b)}}function g0(e){var t=e.updateQueue;if(t!==null){var a=e.stateNode;try{kw(t,a)}catch(n){ot(e,e.return,n)}}}function f0(e,t,a){a.props=Lr(e.type,e.memoizedProps),a.state=e.memoizedState;try{a.componentWillUnmount()}catch(n){ot(e,t,n)}}function jn(e,t){try{var a=e.ref;if(a!==null){switch(e.tag){case 26:case 27:case 5:var n=e.stateNode;break;case 30:var r=e.stateNode,s=yi(e.memoizedProps,r);(r.ref===null||r.ref.name!==s)&&(r.ref=o1(s)),n=r.ref;break;case 7:if(e.stateNode===null){var c=new Ja(e);Ha(e.child,!1,gk,c,void 0,void 0),e.stateNode=c}n=e.stateNode;break;default:n=e.stateNode}typeof a=="function"?e.refCleanup=a(n):a.current=n}}catch(d){ot(e,t,d)}}function la(e,t){var a=e.ref,n=e.refCleanup;if(a!==null)if(typeof n=="function")try{n()}catch(r){ot(e,t,r)}finally{e.refCleanup=null,e=e.alternate,e!=null&&(e.refCleanup=null)}else if(typeof a=="function")try{a(null)}catch(r){ot(e,t,r)}else a.current=null}function Yd(e,t){if((e.tag===5||e.tag===27||e.tag===6)&&e.alternate===null&&t!==null)for(var a=0;a<t.length;a++)d1(e.stateNode,t[a])}function jv(e){for(var t=e.return;t!==null&&(rg(t)&&d1(e.stateNode,t.stateNode),!ig(t));)t=t.return}function kl(e){for(var t=e.return;t!==null&&(rg(t)&&fk(e.stateNode,t.stateNode),!ig(t));)t=t.return}function ig(e){return e.tag===5||e.tag===3||e.tag===27}function rg(e){return e&&e.tag===7&&e.stateNode!==null}function Zm(e){var t=e.type,a=e.memoizedProps,n=e.stateNode;try{e:switch(t){case"button":case"input":case"select":case"textarea":a.autoFocus&&n.focus();break e;case"img":a.src?n.src=a.src:a.srcSet&&(n.srcset=a.srcSet)}}catch(r){ot(e,e.return,r)}}function em(e,t,a){try{var n=e.stateNode;JS(n,e.type,a,t),n[Ua]=t}catch(r){ot(e,e.return,r)}}function b0(e){return e.tag===5||e.tag===3||e.tag===26||e.tag===27&&ur(e.type)||e.tag===4}function tm(e){e:for(;;){for(;e.sibling===null;){if(e.return===null||b0(e.return))return null;e=e.return}for(e.sibling.return=e.return,e=e.sibling;e.tag!==5&&e.tag!==6&&e.tag!==18;){if(e.tag===27&&ur(e.type)||e.flags&2||e.child===null||e.tag===4)continue e;e.child.return=e,e=e.child}if(!(e.flags&2))return e.stateNode}}function Qm(e,t,a,n){var r=e.tag;if(r===5||r===6)r=e.stateNode,t?(a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a).insertBefore(r,t):(t=a.nodeType===9?a.body:a.nodeName==="HTML"?a.ownerDocument.body:a,t.appendChild(r),a=a._reactRootContainer,a!=null||t.onclick!==null||(t.onclick=Pn)),Yd(e,n),Qe=!0;else if(r!==4&&(r===27&&(Yd(e,n),n=null,ur(e.type)&&(a=e.stateNode,t=null)),e=e.child,e!==null))for(Qm(e,t,a,n),e=e.sibling;e!==null;)Qm(e,t,a,n),e=e.sibling}function Gd(e,t,a,n){var r=e.tag;if(r===5||r===6)r=e.stateNode,t?a.insertBefore(r,t):a.appendChild(r),Yd(e,n),Qe=!0;else if(r!==4&&(r===27&&(Yd(e,n),n=null,ur(e.type)&&(a=e.stateNode)),e=e.child,e!==null))for(Gd(e,t,a,n),e=e.sibling;e!==null;)Gd(e,t,a,n),e=e.sibling}function v0(e){var t=e.stateNode,a=e.memoizedProps;try{for(var n=e.type,r=t.attributes;r.length;)t.removeAttributeNode(r[0]);ma(t,n,a),t[ca]=e,t[Ua]=a}catch(s){ot(e,e.return,s)}}var Pd=!1,Ya=null;function Yv(e){(e.tag===30||(e.subtreeFlags&33554432)!==0)&&(Pd=!0)}var Yn=null;function Gv(){var e=Yn;return Yn=null,e}var Ia=0;function vs(e,t,a,n,r){return Ia=0,y0(e.child,t,a,n,r)}function y0(e,t,a,n,r){for(var s=!1;e!==null;){if(e.tag===5){var c=e.stateNode;if(n!==null){var d=gp(c);n.push(d),d.view&&(s=!0)}else s||gp(c).view&&(s=!0);Pd=!0,n1(c,Ia===0?t:t+"_"+Ia,a),Ia++}else(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&r||y0(e.child,t,a,n,r)&&(s=!0));e=e.sibling}return s}function Jn(e,t){for(;e!==null;)e.tag===5?i1(e.stateNode,e.memoizedProps):(e.tag!==22||e.memoizedState===null)&&(e.tag===30&&t||Jn(e.child,t)),e=e.sibling}function vd(e){if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if((e.tag!==22||e.memoizedState===null)&&(vd(e),e.tag===30&&(e.flags&18874368)!==0&&e.stateNode.paired)){var t=e.memoizedProps;if(t.name==null||t.name==="auto")throw Error(q(544));var a=t.name;t=ki(t.default,t.share),t!=="none"&&(vs(e,a,t,null,!1)||Jn(e.child,!1))}e=e.sibling}}function Fm(e,t){if(e.tag===30){var a=e.stateNode,n=e.memoizedProps,r=yi(n,a),s=ki(n.default,a.paired?n.share:n.enter);s!=="none"?vs(e,r,s,null,!1)?(vd(e),a.paired||t||ss(e,n.onEnter)):Jn(e.child,!1):vd(e)}else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)Fm(e,t),e=e.sibling;else vd(e)}function Jm(e){if(Ya!==null&&Ya.size!==0){var t=Ya;if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&(e.flags&18874368)!==0){var a=e.memoizedProps,n=a.name;if(n!=null&&n!=="auto"){var r=t.get(n);if(r!==void 0){var s=ki(a.default,a.share);if(s!=="none"&&(vs(e,n,s,null,!1)?(s=e.stateNode,r.paired=s,s.paired=r,ss(e,a.onShare)):Jn(e.child,!1)),t.delete(n),t.size===0)break}}}Jm(e)}e=e.sibling}}}function Km(e){if(e.tag===30){var t=e.memoizedProps,a=yi(t,e.stateNode),n=Ya!==null?Ya.get(a):void 0,r=ki(t.default,n!==void 0?t.share:t.exit);r!=="none"&&(vs(e,a,r,null,!1)?n!==void 0?(r=e.stateNode,n.paired=r,r.paired=n,Ya.delete(a),ss(e,t.onShare)):ss(e,t.onExit):Jn(e.child,!1)),Ya!==null&&Jm(e)}else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)Km(e),e=e.sibling;else Ya!==null&&Jm(e)}function w0(e){for(e=e.child;e!==null;){if(e.tag===30){var t=e.memoizedProps,a=yi(t,e.stateNode);t=ki(t.default,t.update),e.flags&=-5,t!=="none"&&vs(e,a,t,e.memoizedState=[],!1)}else(e.subtreeFlags&33554432)!==0&&w0(e);e=e.sibling}}function Wm(e){if((e.subtreeFlags&18874368)!==0)for(e=e.child;e!==null;){if(e.tag!==22||e.memoizedState===null){if(e.tag===30&&(e.flags&18874368)!==0){var t=e.stateNode;t.paired!==null&&(t.paired=null,Jn(e.child,!1))}Wm(e)}e=e.sibling}}function yd(e){if(e.tag===30)e.stateNode.paired=null,Jn(e.child,!1),Wm(e);else if((e.subtreeFlags&33554432)!==0)for(e=e.child;e!==null;)yd(e),e=e.sibling;else Wm(e)}function x0(e){for(e=e.child;e!==null;)e.tag===30?Jn(e.child,!1):(e.subtreeFlags&33554432)!==0&&x0(e),e=e.sibling}function og(e,t,a,n,r,s,c){for(var d=!1;t!==null;){if(t.tag===5){var h=t.stateNode;if(s!==null&&Ia<s.length){var p=s[Ia],b=gp(h);(p.view||b.view)&&(d=!0);var $;if($=(e.flags&4)===0)if(b.clip)$=!0;else{$=p.rect;var f=b.rect;$=$.y!==f.y||$.x!==f.x||$.height!==f.height||$.width!==f.width}$&&(e.flags|=4),b.abs?b=!p.abs:(p=p.rect,b=b.rect,b=p.height!==b.height||p.width!==b.width),b&&(e.flags|=32)}else e.flags|=32;(e.flags&4)!==0&&n1(h,Ia===0?a:a+"_"+Ia,r),d&&(e.flags&4)!==0||(Yn===null&&(Yn=[]),Yn.push(h,Ia===0?n:n+"_"+Ia,t.memoizedProps)),Ia++}else(t.tag!==22||t.memoizedState===null)&&(t.tag===30&&c?e.flags|=t.flags&32:og(e,t.child,a,n,r,s,c)&&(d=!0));t=t.sibling}return d}function $0(e,t){for(e=e.child;e!==null;){if(e.tag===30){var a=e.memoizedProps,n=e.stateNode,r=yi(a,n),s=ki(a.default,a.update);if(t){n=n.clones;var c=n===null?null:n.map(nk)}else c=e.memoizedState,e.memoizedState=null;n=e;var d=e.child;Ia=0,r=og(n,d,r,r,s,c,!1),(e.flags&4)!==0&&r&&(t||ss(e,a.onUpdate))}else(e.subtreeFlags&33554432)!==0&&$0(e,t);e=e.sibling}}var aa=!1,tt=!1,qn=!1,am=!1,Pv=typeof WeakSet=="function"?WeakSet:Set,na=null,Ln=!1,gl=!1,Xd=!1,ep=!1;function ES(e,t,a){if(e=e.containerInfo,hp=ms,e=sw(e),zp(e)){if("selectionStart"in e)var n={start:e.selectionStart,end:e.selectionEnd};else e:{n=(n=e.ownerDocument)&&n.defaultView||window;var r=n.getSelection&&n.getSelection();if(r&&r.rangeCount!==0){n=r.anchorNode;var s=r.anchorOffset,c=r.focusNode;r=r.focusOffset;try{n.nodeType,c.nodeType}catch{n=null;break e}var d=0,h=-1,p=-1,b=0,$=0,f=e,y=null;t:for(;;){for(var V;f!==n||s!==0&&f.nodeType!==3||(h=d+s),f!==c||r!==0&&f.nodeType!==3||(p=d+r),f.nodeType===3&&(d+=f.nodeValue.length),(V=f.firstChild)!==null;)y=f,f=V;for(;;){if(f===e)break t;if(y===n&&++b===s&&(h=d),y===c&&++$===r&&(p=d),(V=f.nextSibling)!==null)break;f=y,y=f.parentNode}f=V}n=h===-1||p===-1?null:{start:h,end:p}}else n=null}n=n||{start:0,end:0}}else n=null;for(mp={focusedElem:e,selectionRange:n},ms=!1,a=(a&335544064)===a,na=t,t=a?9270:1024;na!==null;){if(e=na,a&&(n=e.deletions,n!==null))for(s=0;s<n.length;s++)a&&Km(n[s]);if(e.alternate===null&&(e.flags&2)!==0)a&&Yv(e),td(a);else{if(e.tag===22){if(n=e.alternate,e.memoizedState!==null){n!==null&&n.memoizedState===null&&a&&Km(n),td(a);continue}else if(n!==null&&n.memoizedState!==null){a&&Yv(e),td(a);continue}}n=e.child,(e.subtreeFlags&t)!==0&&n!==null?(n.return=e,na=n):(a&&w0(e),td(a))}}Ya=null}function td(e){for(;na!==null;){var t=na,a=e,n=t.alternate,r=t.flags;switch(t.tag){case 0:case 11:case 15:break;case 1:if((r&1024)!==0&&n!==null){a=void 0,r=n.memoizedProps,n=n.memoizedState;var s=t.stateNode;try{var c=Lr(t.type,r);a=s.getSnapshotBeforeUpdate(c,n),s.__reactInternalSnapshotBeforeUpdate=a}catch(d){ot(t,t.return,d)}}break;case 3:if((r&1024)!==0){if(n=t.stateNode.containerInfo,a=n.nodeType,a===9)fp(n);else if(a===1)switch(n.nodeName){case"HEAD":case"HTML":case"BODY":fp(n);break;default:n.textContent=""}}break;case 5:case 26:case 27:case 6:case 4:case 17:break;case 30:a&&n!==null&&(a=yi(n.memoizedProps,n.stateNode),r=t.memoizedProps,r=ki(r.default,r.update),r!=="none"&&vs(n,a,r,n.memoizedState=[],!0));break;default:if((r&1024)!==0)throw Error(q(163))}if(n=t.sibling,n!==null){n.return=t.return,na=n;break}na=t.return}}function N0(e,t,a){var n=a.flags;switch(a.tag){case 0:case 11:case 15:Bn(e,a),n&4&&Wl(5,a);break;case 1:if(Bn(e,a),n&4)if(e=a.stateNode,t===null)try{e.componentDidMount()}catch(c){ot(a,a.return,c)}else{var r=Lr(a.type,t.memoizedProps);t=t.memoizedState;try{e.componentDidUpdate(r,t,e.__reactInternalSnapshotBeforeUpdate)}catch(c){ot(a,a.return,c)}}n&64&&g0(a),n&512&&jn(a,a.return);break;case 3:if(Bn(e,a),n&64&&(e=a.updateQueue,e!==null)){if(t=null,a.child!==null)switch(a.child.tag){case 27:case 5:t=a.child.stateNode;break;case 1:t=a.child.stateNode}try{kw(e,t)}catch(c){ot(a,a.return,c)}}break;case 27:t===null&&n&4&&v0(a);case 26:case 5:Bn(e,a),t===null&&n&4&&Zm(a),n&512&&jn(a,a.return);break;case 12:Bn(e,a);break;case 31:Bn(e,a),n&4&&T0(e,a);break;case 13:Bn(e,a),n&4&&E0(e,a),n&64&&(e=a.memoizedState,e!==null&&(e=e.dehydrated,e!==null&&(a=qS.bind(null,a),yk(e,a))));break;case 22:if(n=a.memoizedState!==null||aa,!n){var s=t!==null&&t.memoizedState!==null||tt;t=aa,r=tt,aa=n,(tt=s)&&!r?(n=2,(a.subtreeFlags&8772)!==0&&(n|=1),Nn(e,a,n)):Bn(e,a),aa=t,tt=r}break;case 30:Bn(e,a),n&512&&jn(a,a.return);break;case 7:n&512&&jn(a,a.return);default:Bn(e,a)}}function tp(e,t){for(e=e.child;e!==null;)S0(e,t),e=e.sibling}function S0(e,t){switch(e.tag){case 5:case 26:try{var a=e.stateNode;if(t){var n=a.style;typeof n.setProperty=="function"?n.setProperty("display","none","important"):n.display="none"}else{var r=e.stateNode,s=e.memoizedProps.style,c=s!=null&&s.hasOwnProperty("display")?s.display:null;r.style.display=c==null||typeof c=="boolean"?"":(""+c).trim()}}catch(h){ot(e,e.return,h)}ap(e,t);break;case 6:try{e.stateNode.nodeValue=t?"":e.memoizedProps,Qe=!0}catch(h){ot(e,e.return,h)}break;case 18:try{var d=e.stateNode;t?ly(d,!0):ly(e.stateNode,!1)}catch(h){ot(e,e.return,h)}break;case 22:case 23:e.memoizedState===null&&tp(e,t);break;default:tp(e,t)}}function ap(e,t){if(e.subtreeFlags&67108864)for(e=e.child;e!==null;){e:{var a=e,n=t;switch(a.tag){case 4:S0(a,n);break e;case 22:a.memoizedState===null&&ap(a,n);break e;default:ap(a,n)}}e=e.sibling}}function k0(e){var t=e.alternate;t!==null&&(e.alternate=null,k0(t)),e.child=null,e.deletions=null,e.sibling=null,e.tag===5&&(t=e.stateNode,t!==null&&nu(t)),e.stateNode=null,e.return=null,e.dependencies=null,e.memoizedProps=null,e.memoizedState=null,e.pendingProps=null,e.stateNode=null,e.updateQueue=null}var Et=null,Va=!1;function $n(e,t,a){for(a=a.child;a!==null;)C0(e,t,a),a=a.sibling}function C0(e,t,a){if(Xa&&typeof Xa.onCommitFiberUnmount=="function")try{Xa.onCommitFiberUnmount(Pl,a)}catch{}switch(a.tag){case 26:tt||la(a,t),$n(e,t,a),a.memoizedState?a.memoizedState.count--:a.stateNode&&!tt&&(a=a.stateNode,a.parentNode.removeChild(a));break;case 27:tt||la(a,t),kl(a);var n=Et,r=Va;ur(a.type)&&(Et=a.stateNode,Va=!1),$n(e,t,a),m1(a.stateNode,a.type,a.memoizedProps),Et=n,Va=r;break;case 5:tt||la(a,t),kl(a);case 6:if(a.tag===6&&kl(a),n=Et,r=Va,Et=null,$n(e,t,a),Et=n,Va=r,Et!==null)if(Va)try{(Et.nodeType===9?Et.body:Et.nodeName==="HTML"?Et.ownerDocument.body:Et).removeChild(a.stateNode),Qe=!0}catch(s){ot(a,t,s)}else try{Et.removeChild(a.stateNode),Qe=!0}catch(s){ot(a,t,s)}break;case 18:Et!==null&&(Va?(e=Et,sy(e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,a.stateNode),ps(e)):sy(Et,a.stateNode));break;case 4:n=Et,r=Va,Et=a.stateNode.containerInfo,Va=!0,$n(e,t,a),Et=n,Va=r;break;case 0:case 11:case 14:case 15:lr(2,a,t),tt||lr(4,a,t),$n(e,t,a);break;case 1:tt||(la(a,t),n=a.stateNode,typeof n.componentWillUnmount=="function"&&f0(a,t,n)),$n(e,t,a);break;case 21:$n(e,t,a);break;case 22:tt=(n=tt)||a.memoizedState!==null,$n(e,t,a),tt=n;break;case 30:la(a,t),$n(e,t,a);break;case 7:tt||la(a,t),$n(e,t,a);break;default:$n(e,t,a)}}function T0(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null))){e=e.dehydrated;try{ps(e)}catch(a){ot(t,t.return,a)}}}function E0(e,t){if(t.memoizedState===null&&(e=t.alternate,e!==null&&(e=e.memoizedState,e!==null&&(e=e.dehydrated,e!==null))))try{ps(e)}catch(a){ot(t,t.return,a)}}function AS(e){switch(e.tag){case 31:case 13:case 19:var t=e.stateNode;return t===null&&(t=e.stateNode=new Pv),t;case 22:return e=e.stateNode,t=e._retryCache,t===null&&(t=e._retryCache=new Pv),t;default:throw Error(q(435,e.tag))}}function ad(e,t){var a=AS(e);t.forEach(function(n){if(!a.has(n)){a.add(n);var r=LS.bind(null,e,n);n.then(r,r)}})}function Ta(e,t,a){var n=t.deletions;if(n!==null)for(var r=0;r<n.length;r++){var s=n[r],c=e,d=t,h=d;e:for(;h!==null;){switch(h.tag){case 27:if(ur(h.type)){Et=h.stateNode,Va=!1;break e}break;case 5:Et=h.stateNode,Va=!1;break e;case 3:case 4:Et=h.stateNode.containerInfo,Va=!0;break e}h=h.return}if(Et===null)throw Error(q(160));C0(c,d,s),Et=null,Va=!1,c=s.alternate,c!==null&&(c.return=null),s.return=null}if(t.subtreeFlags&13886)for(t=t.child;t!==null;)A0(t,e,a),t=t.sibling}var Sn=null;function A0(e,t,a){var n=e.alternate,r=e.flags;switch(e.tag){case 0:case 11:case 14:case 15:if(r&4&&(n=e.updateQueue,n=n!==null?n.events:null,n!==null))for(var s=0;s<n.length;s++){var c=n[s];c.ref.impl=c.nextImpl}Ta(t,e,a),Ea(e),r&4&&(lr(3,e,e.return),Wl(3,e),lr(5,e,e.return));break;case 1:Ta(t,e,a),Ea(e),r&512&&(tt||n===null||la(n,n.return)),r&64&&aa&&(e=e.updateQueue,e!==null&&(t=e.callbacks,t!==null&&(a=e.shared.hiddenCallbacks,e.shared.hiddenCallbacks=a===null?t:a.concat(t))));break;case 26:if(s=Sn,Ta(t,e,a),Ea(e),r&512&&(tt||n===null||la(n,n.return)),r&4)if(r=n!==null?n.memoizedState:null,a=e.memoizedState,n===null)if(a===null)if(e.stateNode===null)if(aa)e.stateNode=a1(e.type,e.memoizedProps,t.containerInfo,e);else{e:{t=e.type,a=e.memoizedProps,r=s.ownerDocument||s;t:switch(t){case"title":n=r.getElementsByTagName("title")[0],(!n||n[Ql]||n[ca]||n.namespaceURI==="http://www.w3.org/2000/svg"||n.hasAttribute("itemprop"))&&(n=r.createElement(t),r.head.insertBefore(n,r.querySelector("head > title"))),ma(n,t,a),n[ca]=e,ia(n),t=n;break e;case"link":if(s=fy("link","href",r).get(t+(a.href||""))){for(c=0;c<s.length;c++)if(n=s[c],n.getAttribute("href")===(a.href==null||a.href===""?null:a.href)&&n.getAttribute("rel")===(a.rel==null?null:a.rel)&&n.getAttribute("title")===(a.title==null?null:a.title)&&n.getAttribute("crossorigin")===(a.crossOrigin==null?null:a.crossOrigin)){s.splice(c,1);break t}}n=r.createElement(t),ma(n,t,a),r.head.appendChild(n);break;case"meta":if(s=fy("meta","content",r).get(t+(a.content||""))){for(c=0;c<s.length;c++)if(n=s[c],n.getAttribute("content")===(a.content==null?null:""+a.content)&&n.getAttribute("name")===(a.name==null?null:a.name)&&n.getAttribute("property")===(a.property==null?null:a.property)&&n.getAttribute("http-equiv")===(a.httpEquiv==null?null:a.httpEquiv)&&n.getAttribute("charset")===(a.charSet==null?null:a.charSet)){s.splice(c,1);break t}}n=r.createElement(t),ma(n,t,a),r.head.appendChild(n);break;default:throw Error(q(468,t))}n[ca]=e,ia(n),t=n}e.stateNode=t}else aa||yp(s,e.type,e.stateNode);else e.stateNode=gy(s,a,e.memoizedProps);else r!==a?(r===null?(t=n.stateNode,t===null||tt||t.parentNode.removeChild(t)):r.count--,a===null?aa||yp(s,e.type,e.stateNode):gy(s,a,e.memoizedProps)):a===null&&e.stateNode!==null&&em(e,e.memoizedProps,n.memoizedProps);break;case 27:Ta(t,e,a),Ea(e),r&512&&(tt||n===null||la(n,n.return)),n!==null&&r&4&&em(e,e.memoizedProps,n.memoizedProps);break;case 5:if(s=qn,qn=!1,Ta(t,e,a),qn=s,Ea(e),r&512&&(tt||n===null||la(n,n.return)),e.flags&32){t=e.stateNode;try{is(t,""),Qe=!0}catch(b){ot(e,e.return,b)}}r&4&&e.stateNode!=null&&(t=e.memoizedProps,em(e,t,n!==null?n.memoizedProps:t)),r&1024&&(am=!0);break;case 6:if(Ta(t,e,a),Ea(e),r&4){if(e.stateNode===null)throw Error(q(162));t=e.memoizedProps,a=e.stateNode;try{a.nodeValue=t,Qe=!0}catch(b){ot(e,e.return,b)}}break;case 3:if(Qe=!1,Nd=null,s=Sn,Sn=Ll(t.containerInfo),Ta(t,e,a),Sn=s,Ea(e),r&4&&n!==null&&n.memoizedState.isDehydrated)try{ps(t.containerInfo)}catch(b){ot(e,e.return,b)}am&&(am=!1,R0(e)),Qe=!1;break;case 4:r=qn,qn=aa,n=Kb(),s=Sn,Sn=Ll(e.stateNode.containerInfo),Ta(t,e,a),Ea(e),Sn=s,Qe&&gl&&(Xd=!0),Qe=n,qn=r;break;case 12:Ta(t,e,a),Ea(e);break;case 31:Ta(t,e,a),Ea(e),r&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,ad(e,t)));break;case 13:Ta(t,e,a),Ea(e),e.child.flags&8192&&e.memoizedState!==null!=(n!==null&&n.memoizedState!==null)&&(fu=Pa()),r&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,ad(e,t)));break;case 22:s=e.memoizedState!==null,c=n!==null&&n.memoizedState!==null;var d=aa,h=tt,p=qn;aa=d||s,qn=p||s,tt=h||c,Ta(t,e,a),tt=h,qn=p,aa=d,Ea(e),r&8192&&(t=e.stateNode,t._visibility=s?t._visibility&-2:t._visibility|1,!s||n===null||c||aa||tt||(t=c||tt,a=aa,n=tt,aa=s||aa,tt=t,Ui(e,2),aa=a,tt=n),!s&&qn||tp(e,s)),r&4&&(t=e.updateQueue,t!==null&&(a=t.retryQueue,a!==null&&(t.retryQueue=null,ad(e,a))));break;case 19:Ta(t,e,a),Ea(e),r&4&&(t=e.updateQueue,t!==null&&(e.updateQueue=null,ad(e,t)));break;case 30:r&512&&(tt||n===null||la(n,n.return)),r=Kb(),s=gl,c=(a&335544064)===a,d=e.memoizedProps,gl=c&&ki(d.default,d.update)!=="none",Ta(t,e,a),Ea(e),c&&n!==null&&Qe&&(e.flags|=4),gl=s,Qe=r;break;case 21:break;case 7:r&512&&(tt||n===null||la(n,n.return)),n&&n.stateNode!==null&&(n.stateNode._fragmentFiber=e);default:Ta(t,e,a),Ea(e)}}function Ea(e){var t=e.flags;if(t&2){try{for(var a,n=e.return;n!==null;){if(b0(n)){a=n;break}n=n.return}n=null;for(var r=e.return;r!==null;){if(rg(r)){var s=r.stateNode;n===null?n=[s]:n.push(s)}if(ig(r))break;r=r.return}var c=n;if(a==null)throw Error(q(160));switch(a.tag){case 27:var d=a.stateNode,h=tm(e);Gd(e,h,d,c);break;case 5:var p=a.stateNode;a.flags&32&&(is(p,""),a.flags&=-33);var b=tm(e);Gd(e,b,p,c);break;case 3:case 4:var $=a.stateNode.containerInfo,f=tm(e);Qm(e,f,$,c);break;default:throw Error(q(161))}}catch(y){ot(e,e.return,y)}e.flags&=-3}t&4096&&(e.flags&=-4097)}function R0(e){if(e.subtreeFlags&1024)for(e=e.child;e!==null;){var t=e;R0(t),t.tag===5&&t.flags&1024&&(t=t.stateNode,ms=!0,t.reset(),ms=!1),e=e.sibling}}function Ro(e,t){if(t.subtreeFlags&9270)for(t=t.child;t!==null;)M0(t,e),t=t.sibling;else $0(t,!1)}function M0(e,t){var a=e.alternate;if(a===null)Fm(e,!1);else switch(e.tag){case 3:if(ep=Ln=!1,Gv(),Ro(t,e),!Ln&&!Xd){if(e=Yn,e!==null)for(var n=0;n<e.length;n+=3){a=e[n];var r=e[n+1];i1(a,e[n+2]),a=a.ownerDocument.documentElement,a!==null&&a.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group("+r+")"})}e=t.containerInfo,e=e.nodeType===9?e.documentElement:e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName===""&&(e.style.viewTransitionName="none",e.animate({opacity:[0,0],pointerEvents:["none","none"]},{duration:0,fill:"forwards",pseudoElement:"::view-transition-group(root)"}),e.animate({width:[0,0],height:[0,0]},{duration:0,fill:"forwards",pseudoElement:"::view-transition"})),ep=!0}Yn=null;break;case 5:Ro(t,e);break;case 4:n=Ln,Ln=!1,Ro(t,e),Ln&&(Xd=!0),Ln=n;break;case 22:e.memoizedState===null&&(a.memoizedState!==null?Fm(e,!1):Ro(t,e));break;case 30:n=Ln,r=Gv(),Ln=!1,Ro(t,e),Ln&&(e.flags|=4);var s=e.memoizedProps,c=e.stateNode;t=yi(s,c),c=yi(a.memoizedProps,c);var d=ki(s.default,s.update);d==="none"?t=!1:(s=a.memoizedState,a.memoizedState=null,a=e.child,Ia=0,t=og(e,a,t,c,d,s,!0),Ia!==(s===null?0:s.length)&&(e.flags|=32)),(e.flags&4)!==0&&t?(ss(e,e.memoizedProps.onUpdate),Yn=r):r!==null&&(r.push.apply(r,Yn),Yn=r),Ln=(e.flags&32)!==0?!0:n;break;default:Ro(t,e)}}function Bn(e,t){if(t.subtreeFlags&8772)for(t=t.child;t!==null;)N0(e,t.alternate,t),t=t.sibling}function Ui(e,t){for(e=e.child;e!==null;){var a=e,n=t;switch(a.tag){case 0:case 11:case 14:case 15:lr(4,a,a.return),Ui(a,n);break;case 1:la(a,a.return);var r=a.stateNode;typeof r.componentWillUnmount=="function"&&f0(a,a.return,r),Ui(a,n);break;case 27:(n&2)!==0&&m1(a.stateNode,a.type,a.memoizedProps);case 5:la(a,a.return),a.tag!==5&&a.tag!==27||kl(a),Ui(a,n);break;case 6:kl(a);break;case 26:la(a,a.return),r=a.stateNode,a.memoizedState!==null||r===null||tt||r.parentNode.removeChild(r),Ui(a,n);break;case 22:a.memoizedState===null&&Ui(a,n);break;case 30:la(a,a.return),Ui(a,n);break;case 7:la(a,a.return);default:Ui(a,n)}e=e.sibling}}function Nn(e,t,a){for(a=(t.subtreeFlags&8772)!==0?a:a&-2,t=t.child;t!==null;){var n=t.alternate,r=e,s=t,c=s.flags,d=(a&1)!==0;switch(s.tag){case 0:case 11:case 15:Nn(r,s,a),Wl(4,s);break;case 1:if(Nn(r,s,a),n=s,r=n.stateNode,typeof r.componentDidMount=="function")try{r.componentDidMount()}catch(b){ot(n,n.return,b)}if(n=s,r=n.updateQueue,r!==null){var h=n.stateNode;try{var p=r.shared.hiddenCallbacks;if(p!==null)for(r.shared.hiddenCallbacks=null,r=0;r<p.length;r++)Sw(p[r],h)}catch(b){ot(n,n.return,b)}}d&&c&64&&g0(s),jn(s,s.return);break;case 27:(a&2)!==0&&v0(s);case 5:s.tag!==5&&s.tag!==27||jv(s),Nn(r,s,a),d&&n===null&&c&4&&Zm(s),jn(s,s.return);break;case 6:jv(s);break;case 26:h=s.stateNode,s.memoizedState!==null||h===null||aa||yp(Ll(h.ownerDocument),s.type,h),Nn(r,s,a),d&&n===null&&c&4&&Zm(s),jn(s,s.return);break;case 12:Nn(r,s,a);break;case 31:Nn(r,s,a),d&&c&4&&T0(r,s);break;case 13:Nn(r,s,a),d&&c&4&&E0(r,s);break;case 22:s.memoizedState===null&&Nn(r,s,a),jn(s,s.return);break;case 30:Nn(r,s,a),jn(s,s.return);break;case 7:jn(s,s.return);default:Nn(r,s,a)}t=t.sibling}}function sg(e,t){var a=null;e!==null&&e.memoizedState!==null&&e.memoizedState.cachePool!==null&&(a=e.memoizedState.cachePool.pool),e=null,t.memoizedState!==null&&t.memoizedState.cachePool!==null&&(e=t.memoizedState.cachePool.pool),e!==a&&(e!=null&&e.refCount++,a!=null&&Jl(a))}function lg(e,t){e=null,t.alternate!==null&&(e=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==e&&(t.refCount++,e!=null&&Jl(e))}function nn(e,t,a,n){var r=(a&335544064)===a;if(t.subtreeFlags&(r?10262:10256))for(t=t.child;t!==null;)z0(e,t,a,n),t=t.sibling;else r&&x0(t)}function z0(e,t,a,n){var r=(a&335544064)===a;r&&t.alternate===null&&t.return!==null&&t.return.alternate!==null&&yd(t);var s=t.flags;switch(t.tag){case 0:case 11:case 15:nn(e,t,a,n),s&2048&&Wl(9,t);break;case 1:nn(e,t,a,n);break;case 3:nn(e,t,a,n),r&&ep&&(e=e.containerInfo,e=e.nodeType===9?e.body:e.nodeName==="HTML"?e.ownerDocument.body:e,e.style.viewTransitionName==="root"&&(e.style.viewTransitionName=""),e=e.ownerDocument.documentElement,e!==null&&e.style.viewTransitionName==="none"&&(e.style.viewTransitionName="")),s&2048&&(s=null,t.alternate!==null&&(s=t.alternate.memoizedState.cache),t=t.memoizedState.cache,t!==s&&(t.refCount++,s!=null&&Jl(s)));break;case 12:if(s&2048){nn(e,t,a,n),s=t.stateNode;try{var c=t.memoizedProps,d=c.id,h=c.onPostCommit;typeof h=="function"&&h(d,t.alternate===null?"mount":"update",s.passiveEffectDuration,-0)}catch(p){ot(t,t.return,p)}}else nn(e,t,a,n);break;case 31:nn(e,t,a,n);break;case 13:nn(e,t,a,n);break;case 23:break;case 22:c=t.stateNode,d=t.alternate,t.memoizedState!==null?(r&&d!==null&&d.memoizedState===null&&yd(d),c._visibility&2?nn(e,t,a,n):Cl(e,t)):(r&&d!==null&&d.memoizedState!==null&&yd(t),c._visibility&2?nn(e,t,a,n):(c._visibility|=2,zo(e,t,a,n,(t.subtreeFlags&10256)!==0||!1))),s&2048&&sg(d,t);break;case 24:nn(e,t,a,n),s&2048&&lg(t.alternate,t);break;case 30:r&&(s=t.alternate,s!==null&&(Jn(s.child,!0),Jn(t.child,!0))),nn(e,t,a,n);break;default:nn(e,t,a,n)}}function zo(e,t,a,n,r){for(r=r&&((t.subtreeFlags&10256)!==0||!1),t=t.child;t!==null;){var s=e,c=t,d=a,h=n,p=c.flags;switch(c.tag){case 0:case 11:case 15:zo(s,c,d,h,r),Wl(8,c);break;case 23:break;case 22:var b=c.stateNode;c.memoizedState!==null?b._visibility&2?zo(s,c,d,h,r):Cl(s,c):(b._visibility|=2,zo(s,c,d,h,r)),r&&p&2048&&sg(c.alternate,c);break;case 24:zo(s,c,d,h,r),r&&p&2048&&lg(c.alternate,c);break;default:zo(s,c,d,h,r)}t=t.sibling}}function Cl(e,t){if(t.subtreeFlags&10256)for(t=t.child;t!==null;){var a=e,n=t,r=n.flags;switch(n.tag){case 22:Cl(a,n),r&2048&&sg(n.alternate,n);break;case 24:Cl(a,n),r&2048&&lg(n.alternate,n);break;default:Cl(a,n)}t=t.sibling}}var Tr=8192;function Sr(e,t,a){if(e.subtreeFlags&Tr)for(e=e.child;e!==null;)V0(e,t,a),e=e.sibling}function V0(e,t,a){switch(e.tag){case 26:Sr(e,t,a),e.flags&Tr&&(e.memoizedState!==null?Vk(a,Sn,e.memoizedState,e.memoizedProps):(e=e.stateNode,(t&335544128)===t&&vy(a,e)));break;case 5:Sr(e,t,a),e.flags&Tr&&(e=e.stateNode,(t&335544128)===t&&vy(a,e));break;case 3:case 4:var n=Sn;Sn=Ll(e.stateNode.containerInfo),Sr(e,t,a),Sn=n;break;case 22:e.memoizedState===null&&(n=e.alternate,n!==null&&n.memoizedState!==null?(n=Tr,Tr=16777216,Sr(e,t,a),Tr=n):Sr(e,t,a));break;case 30:if((e.flags&Tr)!==0&&(n=e.memoizedProps.name,n!=null&&n!=="auto")){var r=e.stateNode;r.paired=null,Ya===null&&(Ya=new Map),Ya.set(n,r)}Sr(e,t,a);break;default:Sr(e,t,a)}}function O0(e){var t=e.alternate;if(t!==null&&(e=t.child,e!==null)){t.child=null;do t=e.sibling,e.sibling=null,e=t;while(e!==null)}}function ll(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var a=0;a<t.length;a++){var n=t[a];na=n,D0(n,e)}O0(e)}if(e.subtreeFlags&10256)for(e=e.child;e!==null;)I0(e),e=e.sibling}function I0(e){switch(e.tag){case 0:case 11:case 15:ll(e),e.flags&2048&&lr(9,e,e.return);break;case 3:ll(e);break;case 12:ll(e);break;case 22:var t=e.stateNode;e.memoizedState!==null&&t._visibility&2&&(e.return===null||e.return.tag!==13)?(t._visibility&=-3,wd(e)):ll(e);break;default:ll(e)}}function wd(e){var t=e.deletions;if((e.flags&16)!==0){if(t!==null)for(var a=0;a<t.length;a++){var n=t[a];na=n,D0(n,e)}O0(e)}for(e=e.child;e!==null;){switch(t=e,t.tag){case 0:case 11:case 15:lr(8,t,t.return),wd(t);break;case 22:a=t.stateNode,a._visibility&2&&(a._visibility&=-3,wd(t));break;default:wd(t)}e=e.sibling}}function D0(e,t){for(;na!==null;){var a=na;switch(a.tag){case 0:case 11:case 15:lr(8,a,t);break;case 23:case 22:if(a.memoizedState!==null&&a.memoizedState.cachePool!==null){var n=a.memoizedState.cachePool.pool;n!=null&&n.refCount++}break;case 24:Jl(a.memoizedState.cache)}if(n=a.child,n!==null)n.return=a,na=n;else e:for(a=e;na!==null;){n=na;var r=n.sibling,s=n.return;if(k0(n),n===a){na=null;break e}if(r!==null){r.return=s,na=r;break e}na=s}}}var RS={getCacheForType:function(e){var t=da(Zt),a=t.data.get(e);return a===void 0&&(a=e(),t.data.set(e,a)),a},cacheSignal:function(){return da(Zt).controller.signal}},MS=typeof WeakMap=="function"?WeakMap:Map,Je=0,mt=null,_e=null,Ue=0,it=0,La=null,Pi=!1,ys=!1,cg=!1,Ni=0,Ut=0,cr=0,Or=0,Zd=0,Ga=0,os=0,Tl=null,Oa=null,np=!1,fu=0,_0=0,Qd=1/0,Fd=null,tr=null,zt=0,Cn=null,Br=null,Fn=0,ip=0,rp=null,H0=null,Wo=null,es=null,ts=null,El=0,xd=null;function Qa(){return(Je&2)!==0&&Ue!==0?Ue&-Ue:$e.T!==null?ug():By()}function U0(){if(Ga===0)if((Ue&536870912)===0||ze){var e=jc;jc<<=1,(jc&3932160)===0&&(jc=262144),Ga=e}else Ga=536870912;return e=pa.current,e!==null&&(e.flags|=32),Ga}function ss(e,t){if(t!=null){var a=e.stateNode,n=a.ref;n===null&&(n=a.ref=o1(yi(e.memoizedProps,a))),es===null&&(es=[]),es.push(t.bind(null,n))}}function _a(e,t,a){(e===mt&&(it===2||it===9)||e.cancelPendingCommit!==null)&&(ls(e,0),Xi(e,Ue,Ga,!1)),Zl(e,a),((Je&2)===0||e!==mt)&&(e===mt&&((Je&2)===0&&(Or|=a),Ut===4&&Xi(e,Ue,Ga,!1)),Wn(e))}function q0(e,t,a){if((Je&6)!==0)throw Error(q(327));var n=!a&&(t&127)===0&&(t&e.expiredLanes)===0||Xl(e,t),r=n?OS(e,t):nm(e,t,!0),s=n;do{if(r===0){ys&&!n&&Xi(e,t,0,!1);break}else{if(a=e.current.alternate,s&&!zS(a)){r=nm(e,t,!1),s=!1;continue}if(r===2){if(s=t,e.errorRecoveryDisabledLanes&s)var c=0;else c=e.pendingLanes&-536870913,c=c!==0?c:c&536870912?536870912:0;if(c!==0){t=c;e:{var d=e;r=Tl;var h=d.current.memoizedState.isDehydrated;if(h&&(ls(d,c).flags|=256),c=nm(d,c,!1),c!==2&&c!==6){if(cg&&!h){d.errorRecoveryDisabledLanes|=s,Or|=s,r=4;break e}s=Oa,Oa=r,s!==null&&(Oa===null?Oa=s:Oa.push.apply(Oa,s))}r=c}if(s=!1,r!==2)continue}}if(r===1){ls(e,0),Xi(e,t,0,!0);break}e:{switch(n=e,s=r,s){case 0:case 1:throw Error(q(345));case 4:if((t&4194048)!==t&&(t&62914560)!==t)break;case 6:Xi(n,t,Ga,!Pi);break e;case 2:Oa=null;break;case 3:case 5:break;default:throw Error(q(329))}if((t&62914560)===t&&(r=fu+300-Pa(),10<r)){if(Xi(n,t,Ga,!Pi),au(n,0,!0)!==0)break e;Fn=t,n.timeoutHandle=mg(Xv.bind(null,n,a,Oa,Fd,np,t,Ga,Or,os,Pi,s,"Throttled",-0,0),r);break e}Xv(n,a,Oa,Fd,np,t,Ga,Or,os,Pi,s,null,-0,0)}}break}while(!0);Wn(e)}function Xv(e,t,a,n,r,s,c,d,h,p,b,$,f,y){e.timeoutHandle=-1;var V=t.subtreeFlags,M=(s&335544064)===s;if($=null,(M||V&8192||(V&16785408)===16785408)&&($={stylesheets:null,count:0,imgCount:0,imgBytes:0,suspenseyImages:[],waitingForImages:!0,waitingForViewTransition:!1,unsuspend:Pn},Ya=null,V0(t,s,$),M&&(V=$,M=e.containerInfo,M=(M.nodeType===9?M:M.ownerDocument).__reactViewTransition,M!=null&&(V.count++,V.waitingForViewTransition=!0,V=Bl.bind(V),M.finished.then(V,V))),V=(s&62914560)===s?fu-Pa():(s&4194048)===s?_0-Pa():0,V=Ok($,V),V!==null)){Fn=s,e.cancelPendingCommit=V(Qv.bind(null,e,t,s,a,n,r,c,d,h,p,b,$,null,f,y)),Xi(e,s,c,!p);return}Qv(e,t,s,a,n,r,c,d,h,p,b,$)}function zS(e){for(var t=e;;){var a=t.tag;if((a===0||a===11||a===15)&&t.flags&16384&&(a=t.updateQueue,a!==null&&(a=a.stores,a!==null)))for(var n=0;n<a.length;n++){var r=a[n],s=r.getSnapshot;r=r.value;try{if(!Fa(s(),r))return!1}catch{return!1}}if(a=t.child,t.subtreeFlags&16384&&a!==null)a.return=t,t=a;else{if(t===e)break;for(;t.sibling===null;){if(t.return===null||t.return===e)return!0;t=t.return}t.sibling.return=t.return,t=t.sibling}}return!0}function Xi(e,t,a,n){t=_y(e,t),t&=~Zd,t&=~Or,e.suspendedLanes|=t,e.pingedLanes&=~t,n&&(e.warmLanes|=t),n=e.expirationTimes;for(var r=t;0<r;){var s=31-Za(r),c=1<<s;n[s]=-1,r&=~c}a!==0&&Uy(e,a,t)}function bu(){return(Je&6)===0?(ec(0,!1),!1):!0}function dg(){if(_e!==null){if(it===0)var e=_e.return;else e=_e,gi=Xr=null,Xp(e),Fo=null,Il=0,e=_e;for(;e!==null;)p0(e.alternate,e),e=e.return;_e=null}}function ls(e,t){var a=e.timeoutHandle;return a!==-1&&(e.timeoutHandle=-1,ek(a)),a=e.cancelPendingCommit,a!==null&&(e.cancelPendingCommit=null,a()),Fn=0,dg(),mt=e,_e=a=fi(e.current,null),Ue=t,it=0,La=null,Pi=!1,ys=Xl(e,t),cg=!1,os=Ga=Zd=Or=cr=Ut=0,Oa=Tl=null,np=!1,Ni=_y(e,t),su(),a}function L0(e,t){Ae=null,$e.H=Bd,t===bs||t===du?(t=wv(),it=3):t===Up?(t=wv(),it=4):it=t===tg?8:t!==null&&typeof t=="object"&&typeof t.then=="function"?6:1,La=t,_e===null&&(Ut=1,jd(e,cn(t,e.current)))}function B0(){var e=pa.current;return e===null?!0:(Ue&4194048)===Ue?ya===null:(Ue&62914560)===Ue||(Ue&536870912)!==0?e===ya:!1}function j0(){var e=$e.H;return $e.H=Bd,e===null?Bd:e}function Y0(){var e=$e.A;return $e.A=RS,e}function Jd(){Ut=4,Pi||(Ue&4194048)!==Ue&&pa.current!==null||(ys=!0),(cr&134217727)===0&&(Or&134217727)===0||mt===null||Xi(mt,Ue,Ga,!1)}function nm(e,t,a){var n=Je;Je|=2;var r=j0(),s=Y0();(mt!==e||Ue!==t)&&(Fd=null,ls(e,t)),t=!1;var c=Ut;e:do try{if(it!==0&&_e!==null){var d=_e,h=La;switch(it){case 8:dg(),c=6;break e;case 3:case 2:case 9:case 6:pa.current===null&&(t=!0);var p=it;if(it=0,La=null,Go(e,d,h,p),a&&ys){c=0;break e}break;default:p=it,it=0,La=null,Go(e,d,h,p)}}VS(),c=Ut;break}catch(b){L0(e,b)}while(!0);return t&&e.shellSuspendCounter++,gi=Xr=null,Je=n,$e.H=r,$e.A=s,_e===null&&(mt=null,Ue=0,su()),c}function VS(){for(;_e!==null;)G0(_e)}function OS(e,t){var a=Je;Je|=2;var n=j0(),r=Y0();mt!==e||Ue!==t?(Fd=null,Qd=Pa()+500,ls(e,t)):ys=Xl(e,t);e:do try{if(it!==0&&_e!==null){t=_e;var s=La;t:switch(it){case 1:it=0,La=null,Go(e,t,s,1);break;case 2:case 9:if(yv(s)){it=0,La=null,Zv(t);break}t=function(){it!==2&&it!==9||mt!==e||(it=7),Wn(e)},s.then(t,t);break e;case 3:it=7;break e;case 4:it=5;break e;case 7:yv(s)?(it=0,La=null,Zv(t)):(it=0,La=null,Go(e,t,s,7));break;case 5:var c=null;switch(_e.tag){case 26:c=_e.memoizedState;case 5:case 27:var d=_e;if(c?f1(c):d.stateNode.complete){it=0,La=null;var h=d.sibling;if(h!==null)_e=h;else{var p=d.return;p!==null?(_e=p,vu(p)):_e=null}break t}}it=0,La=null,Go(e,t,s,5);break;case 6:it=0,La=null,Go(e,t,s,6);break;case 8:dg(),Ut=6;break e;default:throw Error(q(462))}}IS();break}catch(b){L0(e,b)}while(!0);return gi=Xr=null,$e.H=n,$e.A=r,Je=a,_e!==null?0:(mt=null,Ue=0,su(),Ut)}function IS(){for(;_e!==null&&!K5();)G0(_e)}function G0(e){var t=m0(e.alternate,e,Ni);e.memoizedProps=e.pendingProps,t===null?vu(e):_e=t}function Zv(e){var t=e,a=t.alternate;switch(t.tag){case 15:case 0:t=Dv(a,t,t.pendingProps,t.type,void 0,Ue);break;case 11:t=Dv(a,t,t.pendingProps,t.type.render,t.ref,Ue);break;case 5:Xp(t);var n=t;n===ra&&(ze?(Id(n),n.tag===5&&n.stateNode!=null&&(wt=n.stateNode)):(Id(n),ze=!0));default:p0(a,t),t=_e=gw(t,Ni),t=m0(a,t,Ni)}e.memoizedProps=e.pendingProps,t===null?vu(e):_e=t}function Go(e,t,a,n){gi=Xr=null,Xp(t),Fo=null,Il=0;var r=t.return;try{if($S(e,r,t,a,Ue)){Ut=1,jd(e,cn(a,e.current)),_e=null;return}}catch(s){if(r!==null)throw _e=r,s;Ut=1,jd(e,cn(a,e.current)),_e=null;return}t.flags&32768?(ze||n===1?e=!0:ys||(Ue&536870912)!==0?e=!1:(Pi=e=!0,(n===2||n===9||n===3||n===6)&&(n=pa.current,n!==null&&n.tag===13&&(n.flags|=16384))),P0(t,e)):vu(t)}function vu(e){var t=e;do{if((t.flags&32768)!==0){P0(t,Pi);return}e=t.return;var a=CS(t.alternate,t,Ni);if(a!==null){_e=a;return}if(t=t.sibling,t!==null){_e=t;return}_e=t=e}while(t!==null);Ut===0&&(Ut=5)}function P0(e,t){do{var a=TS(e.alternate,e);if(a!==null){a.flags&=32767,_e=a;return}if(a=e.return,a!==null&&(a.flags|=32768,a.subtreeFlags=0,a.deletions=null),!t&&(e=e.sibling,e!==null)){_e=e;return}_e=e=a}while(e!==null);Ut=6,_e=null}function Qv(e,t,a,n,r,s,c,d,h,p,b,$){e.cancelPendingCommit=null;do yu();while(zt!==0);if((Je&6)!==0)throw Error(q(327));if(t!==null){if(t===e.current)throw Error(q(177));e===mt&&(_e=mt=null,Ue=0),Br=t,Cn=e,Fn=a,rp=r,H0=n,DS(e,t,a,c,d,h,$)}}function DS(e,t,a,n,r,s,c){var d=t.lanes|t.childLanes;if(ip=d,d|=Vp,lN(e,a,d,n,r,s),es=null,(a&335544064)===a?(ts=dS(e),n=10262):(ts=null,n=10256),(t.subtreeFlags&n)!==0||(t.flags&n)!==0?(e.callbackNode=null,e.callbackPriority=0,BS(Rd,function(){return cp(),null})):(e.callbackNode=null,e.callbackPriority=0),Pd=!1,n=(t.flags&13878)!==0,(t.subtreeFlags&13878)!==0||n){n=$e.T,$e.T=null,r=Ke.p,Ke.p=2,s=Je,Je|=4;try{ES(e,t,a)}finally{Je=s,Ke.p=r,$e.T=n}}zt=1,Pd?Wo=ok(c,e.containerInfo,ts,op,sp,HS,lp,cp,_S,null,null):(op(),sp(),lp())}function _S(e){if(zt!==0){var t=Cn.onRecoverableError;t(e,{componentStack:null})}}function HS(){zt===3&&(zt=0,M0(Br,Cn),zt=4)}function op(){if(zt===1){zt=0;var e=Cn,t=Br,a=Fn,n=(t.flags&13878)!==0;if((t.subtreeFlags&13878)!==0||n){n=$e.T,$e.T=null;var r=Ke.p;Ke.p=2;var s=Je;Je|=4;try{gl=Xd=!1,A0(t,e,a),a=mp;var c=sw(e.containerInfo),d=a.focusedElem,h=a.selectionRange;if(c!==d&&d&&d.ownerDocument&&ow(d.ownerDocument.documentElement,d)){if(h!==null&&zp(d)){var p=h.start,b=h.end;if(b===void 0&&(b=p),"selectionStart"in d)d.selectionStart=p,d.selectionEnd=Math.min(b,d.value.length);else{var $=d.ownerDocument||document,f=$&&$.defaultView||window;if(f.getSelection){var y=f.getSelection(),V=d.textContent.length,M=Math.min(h.start,V),O=h.end===void 0?M:Math.min(h.end,V);!y.extend&&M>O&&(c=O,O=M,M=c);var N=uv(d,M),v=uv(d,O);if(N&&v&&(y.rangeCount!==1||y.anchorNode!==N.node||y.anchorOffset!==N.offset||y.focusNode!==v.node||y.focusOffset!==v.offset)){var w=$.createRange();w.setStart(N.node,N.offset),y.removeAllRanges(),M>O?(y.addRange(w),y.extend(v.node,v.offset)):(w.setEnd(v.node,v.offset),y.addRange(w))}}}}for($=[],y=d;y=y.parentNode;)y.nodeType===1&&$.push({element:y,left:y.scrollLeft,top:y.scrollTop});for(typeof d.focus=="function"&&d.focus(),d=0;d<$.length;d++){var R=$[d];R.element.scrollLeft=R.left,R.element.scrollTop=R.top}}ms=!!hp,mp=hp=null}finally{Je=s,Ke.p=r,$e.T=n}}e.current=t,zt=2}}function sp(){if(zt===2){zt=0;var e=Cn,t=Br,a=(t.flags&8772)!==0;if((t.subtreeFlags&8772)!==0||a){a=$e.T,$e.T=null;var n=Ke.p;Ke.p=2;var r=Je;Je|=4;try{N0(e,t.alternate,t)}finally{Je=r,Ke.p=n,$e.T=a}}zt=3}}function lp(){if(zt===4||zt===3){zt=0;var e=Wo;Wo=null,W5();var t=Cn,a=Br,n=Fn,r=H0,s=(n&335544064)===n?10262:10256;if((a.subtreeFlags&s)!==0||(a.flags&s)!==0?zt=5:(zt=0,Br=Cn=null,X0(t,t.pendingLanes)),s=t.pendingLanes,s===0&&(tr=null),Cp(n),a=a.stateNode,Xa&&typeof Xa.onCommitFiberRoot=="function")try{Xa.onCommitFiberRoot(Pl,a,void 0,(a.current.flags&128)===128)}catch{}if(r!==null){a=$e.T,s=Ke.p,Ke.p=2,$e.T=null;try{for(var c=t.onRecoverableError,d=0;d<r.length;d++){var h=r[d];c(h.value,{componentStack:h.stack})}}finally{$e.T=a,Ke.p=s}}if(r=es,c=ts,ts=null,r!==null&&(es=null,c===null&&(c=[]),e!==null))for(h=0;h<r.length;h++)a=(0,r[h])(c),a!==void 0&&e.finished.finally(a);(Fn&3)!==0&&yu(),Wn(t),s=t.pendingLanes,(n&261930)!==0&&(s&42)!==0?t===xd?El++:(El=0,xd=t):(El=0,xd=null),ec(0,!1)}}function X0(e,t){(e.pooledCacheLanes&=t)===0&&(t=e.pooledCache,t!=null&&(e.pooledCache=null,Jl(t)))}function yu(){return Wo!==null&&(Wo.skipTransition(),Wo=null),op(),sp(),lp(),cp()}function cp(){if(zt!==5)return!1;var e=Cn,t=ip;ip=0;var a=Cp(Fn),n=$e.T,r=Ke.p;try{Ke.p=32>a?32:a,$e.T=null,a=rp,rp=null;var s=Cn,c=Fn;if(zt=0,Br=Cn=null,Fn=0,(Je&6)!==0)throw Error(q(331));var d=Je;if(Je|=4,I0(s.current),z0(s,s.current,c,a),Je=d,ec(0,!1),Xa&&typeof Xa.onPostCommitFiberRoot=="function")try{Xa.onPostCommitFiberRoot(Pl,s)}catch{}return!0}finally{Ke.p=r,$e.T=n,X0(e,t)}}function Fv(e,t,a){t=cn(a,t),t=Bm(e.stateNode,t,2),e=Ki(e,t,2),e!==null&&(Zl(e,2),Wn(e))}function ot(e,t,a){if(e.tag===3)Fv(e,e,a);else for(;t!==null;){if(t.tag===3){Fv(t,e,a);break}else if(t.tag===1){var n=t.stateNode;if(typeof t.type.getDerivedStateFromError=="function"||typeof n.componentDidCatch=="function"&&(tr===null||!tr.has(n))){e=cn(a,e),a=l0(2),n=Ki(t,a,2),n!==null&&(c0(a,n,t,e),Zl(n,2),Wn(n));break}}t=t.return}}function im(e,t,a){var n=e.pingCache;if(n===null){n=e.pingCache=new MS;var r=new Set;n.set(t,r)}else r=n.get(t),r===void 0&&(r=new Set,n.set(t,r));r.has(a)||(cg=!0,r.add(a),e=US.bind(null,e,t,a),t.then(e,e))}function US(e,t,a){var n=e.pingCache;n!==null&&n.delete(t),e.pingedLanes|=e.suspendedLanes&a,e.warmLanes&=~a,mt===e&&(Ue&a)===a&&((Ut===4||Ut===3&&(Ue&62914560)===Ue&&300>Pa()-fu)&&(Je&2)===0?ls(e,0):Zd|=a,os===Ue&&(os=0)),Wn(e)}function Z0(e,t){t===0&&(t=Hy()),e=Pr(e,t),e!==null&&(Zl(e,t),Wn(e))}function qS(e){var t=e.memoizedState,a=0;t!==null&&(a=t.retryLane),Z0(e,a)}function LS(e,t){var a=0;switch(e.tag){case 31:case 13:var n=e.stateNode,r=e.memoizedState;r!==null&&(a=r.retryLane);break;case 19:n=e.stateNode;break;case 22:n=e.stateNode._retryCache;break;default:throw Error(q(314))}n!==null&&n.delete(t),Z0(e,a)}function BS(e,t){return Sp(e,t)}var cs=null,Vo=null,dp=!1,Kd=!1,rm=!1,Zi=0;function Wn(e){e!==Vo&&e.next===null&&(Vo===null?cs=Vo=e:Vo=Vo.next=e),Kd=!0,dp||(dp=!0,YS())}function ec(e,t){if(!rm&&Kd){rm=!0;do for(var a=!1,n=cs;n!==null;){if(!t)if(e!==0){var r=n.pendingLanes;if(r===0)var s=0;else{var c=n.suspendedLanes,d=n.pingedLanes;s=(1<<31-Za(42|e)+1)-1,s&=r&~(c&~d),s=s&201326741?s&201326741|1:s?s|2:0}s!==0&&(a=!0,Jv(n,s))}else s=Ue,s=au(n,n===mt?s:0,n.cancelPendingCommit!==null||n.timeoutHandle!==-1),(s&3)===0||Xl(n,s)||(a=!0,Jv(n,s));n=n.next}while(a);rm=!1}}function jS(){Q0()}function Q0(){Kd=dp=!1;var e=0;Zi!==0&&WS()&&(e=Zi);for(var t=Pa(),a=null,n=cs;n!==null;){var r=n.next,s=F0(n,t);s===0?(n.next=null,a===null?cs=r:a.next=r,r===null&&(Vo=a)):(a=n,(e!==0||(s&3)!==0)&&(Kd=!0)),n=r}zt!==0&&zt!==5||ec(e,!1),Zi!==0&&(Zi=0)}function F0(e,t){for(var a=e.suspendedLanes,n=e.pingedLanes,r=e.expirationTimes,s=e.pendingLanes&-62914561;0<s;){var c=31-Za(s),d=1<<c,h=r[c];h===-1?((d&a)===0||(d&n)!==0)&&(r[c]=sN(d,t)):h<=t&&(e.expiredLanes|=d),s&=~d}if(t=mt,a=Ue,a=au(e,e===t?a:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),n=e.callbackNode,a===0||e===t&&(it===2||it===9)||e.cancelPendingCommit!==null)return n!==null&&n!==null&&_h(n),e.callbackNode=null,e.callbackPriority=0;if((a&3)===0||Xl(e,a)){if(t=a&-a,t===e.callbackPriority)return t;switch(n!==null&&_h(n),Cp(a)){case 2:case 8:a=Iy;break;case 32:a=Rd;break;case 268435456:a=Dy;break;default:a=Rd}return n=J0.bind(null,e),a=Sp(a,n),e.callbackPriority=t,e.callbackNode=a,t}return n!==null&&n!==null&&_h(n),e.callbackPriority=2,e.callbackNode=null,2}function J0(e,t){if(zt!==0&&zt!==5)return e.callbackNode=null,e.callbackPriority=0,null;var a=e.callbackNode;if(yu()&&e.callbackNode!==a)return null;var n=Ue;return n=au(e,e===mt?n:0,e.cancelPendingCommit!==null||e.timeoutHandle!==-1),n===0?null:(q0(e,n,t),F0(e,Pa()),e.callbackNode!=null&&e.callbackNode===a?J0.bind(null,e):null)}function Jv(e,t){if(yu())return null;q0(e,t,!0)}function YS(){tk(function(){(Je&6)!==0?Sp(Oy,jS):Q0()})}function ug(){if(Zi===0){var e=Hr;e===0&&(e=Bc,Bc<<=1,(Bc&261888)===0&&(Bc=256)),Zi=e}return Zi}function Kv(e){return e==null||typeof e=="symbol"||typeof e=="boolean"?null:typeof e=="function"?e:cd(e)}function GS(e,t,a,n,r){if(t==="submit"&&a&&a.stateNode===r){var s=Kv((r[Ua]||null).action),c=n.submitter;c&&(t=(t=c[Ua]||null)?Kv(t.formAction):c.getAttribute("formAction"),t!==null&&(s=t,c=null));var d=new iu("action","action",null,n,r);e.push({event:d,listeners:[{instance:null,listener:function(){if(n.defaultPrevented){if(Zi!==0){var h=new FormData(r,c);qm(a,{pending:!0,data:h,method:r.method,action:s},null,h)}}else typeof s=="function"&&(d.preventDefault(),h=new FormData(r,c),qm(a,{pending:!0,data:h,method:r.method,action:s},s,h))},currentTarget:r}]})}}for(nd=0;nd<Am.length;nd++)id=Am[nd],Wv=id.toLowerCase(),ey=id[0].toUpperCase()+id.slice(1),Tn(Wv,"on"+ey);var id,Wv,ey,nd;Tn(cw,"onAnimationEnd");Tn(dw,"onAnimationIteration");Tn(uw,"onAnimationStart");Tn("dblclick","onDoubleClick");Tn("focusin","onFocus");Tn("focusout","onBlur");Tn(aS,"onTransitionRun");Tn(nS,"onTransitionStart");Tn(iS,"onTransitionCancel");Tn(hw,"onTransitionEnd");ns("onMouseEnter",["mouseout","mouseover"]);ns("onMouseLeave",["mouseout","mouseover"]);ns("onPointerEnter",["pointerout","pointerover"]);ns("onPointerLeave",["pointerout","pointerover"]);Yr("onChange","change click focusin focusout input keydown keyup selectionchange".split(" "));Yr("onSelect","focusout contextmenu dragend focusin keydown keyup mousedown mouseup selectionchange".split(" "));Yr("onBeforeInput",["compositionend","keypress","textInput","paste"]);Yr("onCompositionEnd","compositionend focusout keydown keypress keyup mousedown".split(" "));Yr("onCompositionStart","compositionstart focusout keydown keypress keyup mousedown".split(" "));Yr("onCompositionUpdate","compositionupdate focusout keydown keypress keyup mousedown".split(" "));var Hl="abort canplay canplaythrough durationchange emptied encrypted ended error loadeddata loadedmetadata loadstart pause play playing progress ratechange resize seeked seeking stalled suspend timeupdate volumechange waiting".split(" "),PS=new Set("beforetoggle cancel close invalid load scroll scrollend toggle".split(" ").concat(Hl));function K0(e,t){t=(t&4)!==0;for(var a=0;a<e.length;a++){var n=e[a],r=n.event;n=n.listeners;e:{var s=void 0;if(t)for(var c=n.length-1;0<=c;c--){var d=n[c],h=d.instance,p=d.currentTarget;if(d=d.listener,h!==s&&r.isPropagationStopped())break e;s=d,r.currentTarget=p;try{s(r)}catch(b){zd(b)}r.currentTarget=null,s=h}else for(c=0;c<n.length;c++){if(d=n[c],h=d.instance,p=d.currentTarget,d=d.listener,h!==s&&r.isPropagationStopped())break e;s=d,r.currentTarget=p;try{s(r)}catch(b){zd(b)}r.currentTarget=null,s=h}}}}function De(e,t){var a=t[Zb];a===void 0&&(a=t[Zb]=new Set);var n=e+"__bubble";a.has(n)||(W0(t,e,2,!1),a.add(n))}function om(e,t,a){var n=0;t&&(n|=4),W0(a,e,n,t)}var rd="_reactListening"+Math.random().toString(36).slice(2);function hg(e){if(!e[rd]){e[rd]=!0,Yy.forEach(function(a){a!=="selectionchange"&&(PS.has(a)||om(a,!1,e),om(a,!0,e))});var t=e.nodeType===9?e:e.ownerDocument;t===null||t[rd]||(t[rd]=!0,om("selectionchange",!1,t))}}function W0(e,t,a,n){switch(N1(t)){case 2:var r=Hk;break;case 8:r=Uk;break;default:r=yg}a=r.bind(null,t,a,e),r=void 0,!km||t!=="touchstart"&&t!=="touchmove"&&t!=="wheel"||(r=!0),n?r!==void 0?e.addEventListener(t,a,{capture:!0,passive:r}):e.addEventListener(t,a,!0):r!==void 0?e.addEventListener(t,a,{passive:r}):e.addEventListener(t,a,!1)}function sm(e,t,a,n,r){var s=n;if((t&1)===0&&(t&2)===0&&n!==null)e:for(;;){if(n===null)return;var c=n.tag;if(c===3||c===4){var d=n.stateNode.containerInfo;if(d===r)break;if(c===4)for(c=n.return;c!==null;){var h=c.tag;if((h===3||h===4)&&c.stateNode.containerInfo===r)return;c=c.return}for(;d!==null;){if(c=Er(d),c===null)return;if(h=c.tag,h===5||h===6||h===26||h===27){n=s=c;continue e}d=d.parentNode}}n=n.return}Ky(function(){var p=s,b=Ep(a),$=[];e:{var f=mw.get(e);if(f!==void 0){var y=iu,V=e;switch(e){case"keypress":if(ud(a)===0)break e;case"keydown":case"keyup":y=zN;break;case"focusin":V="focus",y=jh;break;case"focusout":V="blur",y=jh;break;case"beforeblur":case"afterblur":y=jh;break;case"click":if(a.button===2)break e;case"auxclick":case"dblclick":case"mousedown":case"mousemove":case"mouseup":case"mouseout":case"mouseover":case"contextmenu":y=av;break;case"drag":case"dragend":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"dragstart":case"drop":y=wN;break;case"touchcancel":case"touchend":case"touchmove":case"touchstart":y=_N;break;case cw:case dw:case uw:y=NN;break;case hw:y=UN;break;case"scroll":case"scrollend":y=vN;break;case"wheel":y=LN;break;case"copy":case"cut":case"paste":y=kN;break;case"gotpointercapture":case"lostpointercapture":case"pointercancel":case"pointerdown":case"pointermove":case"pointerout":case"pointerover":case"pointerup":y=iv;break;case"submit":y=IN;break;case"toggle":case"beforetoggle":y=jN}var M=(t&4)!==0,O=!M&&(e==="scroll"||e==="scrollend"),N=M?f!==null?f+"Capture":null:f;M=[];for(var v=p,w;v!==null;){var R=v;if(w=R.stateNode,R=R.tag,R!==5&&R!==26&&R!==27||w===null||N===null||(R=Rl(v,N),R!=null&&M.push(Ul(v,R,w))),O)break;v=v.return}0<M.length&&(f=new y(f,V,null,a,b),$.push({event:f,listeners:M}))}}if((t&7)===0){e:{if(y=e==="mouseover"||e==="pointerover",f=e==="mouseout"||e==="pointerout",y&&a!==Sm&&(V=a.relatedTarget||a.fromElement)&&(Er(V)||V[gs]))break e;(f||y)&&(V=b.window===b?b:(y=b.ownerDocument)?y.defaultView||y.parentWindow:window,f?(y=a.relatedTarget||a.toElement,f=p,y=y?Er(y):null,y!==null&&(O=Gl(y),M=y.tag,y!==O||M!==5&&M!==27&&M!==6)&&(y=null)):(f=null,y=p),f!==y&&(M=av,R="onMouseLeave",N="onMouseEnter",v="mouse",(e==="pointerout"||e==="pointerover")&&(M=iv,R="onPointerLeave",N="onPointerEnter",v="pointer"),O=f==null?V:ml(f),w=y==null?V:ml(y),V=new M(R,v+"leave",f,a,b),V.target=O,V.relatedTarget=w,R=null,Er(b)===p&&(M=new M(N,v+"enter",y,a,b),M.target=w,M.relatedTarget=O,R=M),O=R,M=f&&y?hm(f,y,XS):null,f!==null&&ty($,V,f,M,!1),y!==null&&O!==null&&ty($,O,y,M,!0)))}e:{if(f=p?ml(p):window,y=f.nodeName&&f.nodeName.toLowerCase(),y==="select"||y==="input"&&f.type==="file")var H=lv;else if(sv(f))if(iw)H=WN;else{H=JN;var Z=FN}else y=f.nodeName,!y||y.toLowerCase()!=="input"||f.type!=="checkbox"&&f.type!=="radio"?p&&Tp(p.elementType)&&(H=lv):H=KN;if(H&&(H=H(e,p))){nw($,H,a,b);break e}Z&&Z(e,f,p)}switch(Z=p?ml(p):window,e){case"focusin":(sv(Z)||Z.contentEditable==="true")&&(Uo=Z,Tm=p,vl=null);break;case"focusout":vl=Tm=Uo=null;break;case"mousedown":Em=!0;break;case"contextmenu":case"mouseup":case"dragend":Em=!1,hv($,a,b);break;case"selectionchange":if(tS)break;case"keydown":case"keyup":hv($,a,b)}var te;if(Mp)e:{switch(e){case"compositionstart":var Q="onCompositionStart";break e;case"compositionend":Q="onCompositionEnd";break e;case"compositionupdate":Q="onCompositionUpdate";break e}Q=void 0}else Ho?tw(e,a)&&(Q="onCompositionEnd"):e==="keydown"&&a.keyCode===229&&(Q="onCompositionStart");Q&&(ew&&a.locale!=="ko"&&(Ho||Q!=="onCompositionStart"?Q==="onCompositionEnd"&&Ho&&(te=Wy()):(Yi=b,Ap="value"in Yi?Yi.value:Yi.textContent,Ho=!0)),Z=Wd(p,Q),0<Z.length&&(Q=new nv(Q,e,null,a,b),$.push({event:Q,listeners:Z}),te?Q.data=te:(te=aw(a),te!==null&&(Q.data=te)))),(te=GN?PN(e,a):XN(e,a))&&(Q=Wd(p,"onBeforeInput"),0<Q.length&&(Z=new nv("onBeforeInput","beforeinput",null,a,b),$.push({event:Z,listeners:Q}),Z.data=te)),GS($,e,p,a,b)}K0($,t)})}function Ul(e,t,a){return{instance:e,listener:t,currentTarget:a}}function Wd(e,t){for(var a=t+"Capture",n=[];e!==null;){var r=e,s=r.stateNode;if(r=r.tag,r!==5&&r!==26&&r!==27||s===null||(r=Rl(e,a),r!=null&&n.unshift(Ul(e,r,s)),r=Rl(e,t),r!=null&&n.push(Ul(e,r,s))),e.tag===3)return n;e=e.return}return[]}function XS(e){if(e===null)return null;do e=e.return;while(e&&e.tag!==5&&e.tag!==27);return e||null}function ty(e,t,a,n,r){for(var s=t._reactName,c=[];a!==null&&a!==n;){var d=a,h=d.alternate,p=d.stateNode;if(d=d.tag,h!==null&&h===n)break;d!==5&&d!==26&&d!==27||p===null||(h=p,r?(p=Rl(a,s),p!=null&&c.unshift(Ul(a,p,h))):r||(p=Rl(a,s),p!=null&&c.push(Ul(a,p,h)))),a=a.return}c.length!==0&&e.push({event:t,listeners:c})}var ZS=/\r\n?/g,QS=/\u0000|\uFFFD/g;function ay(e){return(typeof e=="string"?e:""+e).replace(ZS,`
`).replace(QS,"")}function e1(e,t){return t=ay(t),ay(e)===t}function rt(e,t,a,n,r,s){switch(a){case"children":if(typeof n=="string")t==="body"||t==="textarea"&&n===""||is(e,n);else if(typeof n=="number"||typeof n=="bigint")t!=="body"&&is(e,""+n);else return;break;case"className":Gc(e,"class",n);break;case"tabIndex":Gc(e,"tabindex",n);break;case"dir":case"role":case"viewBox":case"width":case"height":Gc(e,a,n);break;case"style":Jy(e,n,s);return;case"data":if(t!=="object"){Gc(e,"data",n);break}case"src":case"href":if(n===""&&(t!=="a"||a!=="href")){e.removeAttribute(a);break}if(n==null||typeof n=="function"||typeof n=="symbol"||typeof n=="boolean"){e.removeAttribute(a);break}n=cd(n),e.setAttribute(a,n);break;case"action":case"formAction":if(typeof n=="function"){e.setAttribute(a,"javascript:throw new Error('A React form was unexpectedly submitted. If you called form.submit() manually, consider using form.requestSubmit() instead. If you\\'re trying to use event.stopPropagation() in a submit event handler, consider also calling event.preventDefault().')");break}else typeof s=="function"&&(a==="formAction"?(t!=="input"&&rt(e,t,"name",r.name,r,null),rt(e,t,"formEncType",r.formEncType,r,null),rt(e,t,"formMethod",r.formMethod,r,null),rt(e,t,"formTarget",r.formTarget,r,null)):(rt(e,t,"encType",r.encType,r,null),rt(e,t,"method",r.method,r,null),rt(e,t,"target",r.target,r,null)));if(n==null||typeof n=="symbol"||typeof n=="boolean"){e.removeAttribute(a);break}n=cd(n),e.setAttribute(a,n);break;case"onClick":n!=null&&(e.onclick=Pn);return;case"onScroll":n!=null&&De("scroll",e);return;case"onScrollEnd":n!=null&&De("scrollend",e);return;case"dangerouslySetInnerHTML":if(n!=null){if(typeof n!="object"||!("__html"in n))throw Error(q(61));if(a=n.__html,a!=null){if(r.children!=null)throw Error(q(60));s?.__html!==a&&(e.innerHTML=a)}}break;case"multiple":e.multiple=n&&typeof n!="function"&&typeof n!="symbol";break;case"muted":e.muted=n&&typeof n!="function"&&typeof n!="symbol";break;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"defaultValue":case"defaultChecked":case"innerHTML":case"ref":break;case"autoFocus":break;case"xlinkHref":if(n==null||typeof n=="function"||typeof n=="boolean"||typeof n=="symbol"){e.removeAttribute("xlink:href");break}a=cd(n),e.setAttributeNS("http://www.w3.org/1999/xlink","xlink:href",a);break;case"contentEditable":case"spellCheck":case"draggable":case"value":case"autoReverse":case"externalResourcesRequired":case"focusable":case"preserveAlpha":n!=null&&typeof n!="function"&&typeof n!="symbol"?e.setAttribute(a,n):e.removeAttribute(a);break;case"inert":case"allowFullScreen":case"async":case"autoPlay":case"controls":case"credentialless":case"default":case"defer":case"disabled":case"disablePictureInPicture":case"disableRemotePlayback":case"formNoValidate":case"hidden":case"loop":case"noModule":case"noValidate":case"open":case"playsInline":case"readOnly":case"required":case"reversed":case"scoped":case"seamless":case"itemScope":n&&typeof n!="function"&&typeof n!="symbol"?e.setAttribute(a,""):e.removeAttribute(a);break;case"capture":case"download":n===!0?e.setAttribute(a,""):n!==!1&&n!=null&&typeof n!="function"&&typeof n!="symbol"?e.setAttribute(a,n):e.removeAttribute(a);break;case"cols":case"rows":case"size":case"span":n!=null&&typeof n!="function"&&typeof n!="symbol"&&!isNaN(n)&&1<=n?e.setAttribute(a,n):e.removeAttribute(a);break;case"rowSpan":case"start":n==null||typeof n=="function"||typeof n=="symbol"||isNaN(n)?e.removeAttribute(a):e.setAttribute(a,n);break;case"popover":De("beforetoggle",e),De("toggle",e),ld(e,"popover",n);break;case"xlinkActuate":hi(e,"http://www.w3.org/1999/xlink","xlink:actuate",n);break;case"xlinkArcrole":hi(e,"http://www.w3.org/1999/xlink","xlink:arcrole",n);break;case"xlinkRole":hi(e,"http://www.w3.org/1999/xlink","xlink:role",n);break;case"xlinkShow":hi(e,"http://www.w3.org/1999/xlink","xlink:show",n);break;case"xlinkTitle":hi(e,"http://www.w3.org/1999/xlink","xlink:title",n);break;case"xlinkType":hi(e,"http://www.w3.org/1999/xlink","xlink:type",n);break;case"xmlBase":hi(e,"http://www.w3.org/XML/1998/namespace","xml:base",n);break;case"xmlLang":hi(e,"http://www.w3.org/XML/1998/namespace","xml:lang",n);break;case"xmlSpace":hi(e,"http://www.w3.org/XML/1998/namespace","xml:space",n);break;case"is":ld(e,"is",n);break;case"innerText":case"textContent":return;default:if(!(2<a.length)||a[0]!=="o"&&a[0]!=="O"||a[1]!=="n"&&a[1]!=="N")a=fN.get(a)||a,ld(e,a,n);else return}Qe=!0}function up(e,t,a,n,r,s){switch(a){case"style":Jy(e,n,s);return;case"dangerouslySetInnerHTML":if(n!=null){if(typeof n!="object"||!("__html"in n))throw Error(q(61));if(a=n.__html,a!=null){if(r.children!=null)throw Error(q(60));s?.__html!==a&&(e.innerHTML=a)}}break;case"children":if(typeof n=="string")is(e,n);else if(typeof n=="number"||typeof n=="bigint")is(e,""+n);else return;break;case"onScroll":n!=null&&De("scroll",e);return;case"onScrollEnd":n!=null&&De("scrollend",e);return;case"onClick":n!=null&&(e.onclick=Pn);return;case"suppressContentEditableWarning":case"suppressHydrationWarning":case"innerHTML":case"ref":return;case"innerText":case"textContent":return;default:if(!Gy.hasOwnProperty(a))e:{if(a[0]==="o"&&a[1]==="n"&&(r=a.endsWith("Capture"),s=a.slice(2,r?a.length-7:void 0),t=e[Ua]||null,t=t!=null?t[a]:null,typeof t=="function"&&e.removeEventListener(s,t,r),typeof n=="function")){typeof t!="function"&&t!==null&&(a in e?e[a]=null:e.hasAttribute(a)&&e.removeAttribute(a)),e.addEventListener(s,n,r);break e}Qe=!0,a in e?e[a]=n:n===!0?e.setAttribute(a,""):ld(e,a,n)}return}Qe=!0}function ma(e,t,a){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"img":De("error",e),De("load",e);var n=!1,r=!1,s;for(s in a)if(a.hasOwnProperty(s)){var c=a[s];if(c!=null)switch(s){case"src":n=!0;break;case"srcSet":r=!0;break;case"children":case"dangerouslySetInnerHTML":throw Error(q(137,t));default:rt(e,t,s,c,a,null)}}r&&rt(e,t,"srcSet",a.srcSet,a,null),n&&rt(e,t,"src",a.src,a,null);return;case"input":De("invalid",e);var d=s=c=r=null,h=null,p=null;for(n in a)if(a.hasOwnProperty(n)){var b=a[n];if(b!=null)switch(n){case"name":r=b;break;case"type":c=b;break;case"checked":h=b;break;case"defaultChecked":p=b;break;case"value":s=b;break;case"defaultValue":d=b;break;case"children":case"dangerouslySetInnerHTML":if(b!=null)throw Error(q(137,t));break;default:rt(e,t,n,b,a,null)}}Zy(e,s,d,h,p,c,r,!1);return;case"select":De("invalid",e),n=c=s=null;for(r in a)if(a.hasOwnProperty(r)&&(d=a[r],d!=null))switch(r){case"value":s=d;break;case"defaultValue":c=d;break;case"multiple":n=d;default:rt(e,t,r,d,a,null)}t=s,a=c,e.multiple=!!n,t!=null?Xo(e,!!n,t,!1):a!=null&&Xo(e,!!n,a,!0);return;case"textarea":De("invalid",e),s=r=n=null;for(c in a)if(a.hasOwnProperty(c)&&(d=a[c],d!=null))switch(c){case"value":n=d;break;case"defaultValue":r=d;break;case"children":s=d;break;case"dangerouslySetInnerHTML":if(d!=null)throw Error(q(91));break;default:rt(e,t,c,d,a,null)}Fy(e,n,r,s);return;case"option":for(h in a)a.hasOwnProperty(h)&&(n=a[h],n!=null)&&(h==="selected"?e.selected=n&&typeof n!="function"&&typeof n!="symbol":rt(e,t,h,n,a,null));return;case"dialog":De("beforetoggle",e),De("toggle",e),De("cancel",e),De("close",e);break;case"iframe":case"object":De("load",e);break;case"video":case"audio":for(n=0;n<Hl.length;n++)De(Hl[n],e);break;case"image":De("error",e),De("load",e);break;case"details":De("toggle",e);break;case"embed":case"source":case"link":De("error",e),De("load",e);case"area":case"base":case"br":case"col":case"hr":case"keygen":case"meta":case"param":case"track":case"wbr":case"menuitem":for(p in a)if(a.hasOwnProperty(p)&&(n=a[p],n!=null))switch(p){case"children":case"dangerouslySetInnerHTML":throw Error(q(137,t));default:rt(e,t,p,n,a,null)}return;default:if(Tp(t)){for(b in a)a.hasOwnProperty(b)&&(n=a[b],n!==void 0&&up(e,t,b,n,a,void 0));return}}for(d in a)a.hasOwnProperty(d)&&(n=a[d],n!=null&&rt(e,t,d,n,a,null))}var FS={};function JS(e,t,a,n){switch(t){case"div":case"span":case"svg":case"path":case"a":case"g":case"p":case"li":break;case"input":var r=null,s=null,c=null,d=null,h=null,p=null,b=null;for(y in a){var $=a[y];if(a.hasOwnProperty(y)&&$!=null)switch(y){case"checked":break;case"value":break;case"defaultValue":h=$;default:n.hasOwnProperty(y)||rt(e,t,y,null,n,$)}}for(var f in n){var y=n[f];if($=a[f],n.hasOwnProperty(f)&&(y!=null||$!=null))switch(f){case"type":y!==$&&(Qe=!0),s=y;break;case"name":y!==$&&(Qe=!0),r=y;break;case"checked":y!==$&&(Qe=!0),p=y;break;case"defaultChecked":y!==$&&(Qe=!0),b=y;break;case"value":y!==$&&(Qe=!0),c=y;break;case"defaultValue":y!==$&&(Qe=!0),d=y;break;case"children":case"dangerouslySetInnerHTML":if(y!=null)throw Error(q(137,t));break;default:y!==$&&rt(e,t,f,y,n,$)}}Nm(e,c,d,h,p,b,s,r);return;case"select":y=c=d=f=null;for(s in a)if(h=a[s],a.hasOwnProperty(s)&&h!=null)switch(s){case"value":break;case"multiple":y=h;default:n.hasOwnProperty(s)||rt(e,t,s,null,n,h)}for(r in n)if(s=n[r],h=a[r],n.hasOwnProperty(r)&&(s!=null||h!=null))switch(r){case"value":s!==h&&(Qe=!0),f=s;break;case"defaultValue":s!==h&&(Qe=!0),d=s;break;case"multiple":s!==h&&(Qe=!0),c=s;default:s!==h&&rt(e,t,r,s,n,h)}t=d,a=c,n=y,f!=null?Xo(e,!!a,f,!1):!!n!=!!a&&(t!=null?Xo(e,!!a,t,!0):Xo(e,!!a,a?[]:"",!1));return;case"textarea":y=f=null;for(d in a)if(r=a[d],a.hasOwnProperty(d)&&r!=null&&!n.hasOwnProperty(d))switch(d){case"value":break;case"children":break;default:rt(e,t,d,null,n,r)}for(c in n)if(r=n[c],s=a[c],n.hasOwnProperty(c)&&(r!=null||s!=null))switch(c){case"value":r!==s&&(Qe=!0),f=r;break;case"defaultValue":r!==s&&(Qe=!0),y=r;break;case"children":break;case"dangerouslySetInnerHTML":if(r!=null)throw Error(q(91));break;default:r!==s&&rt(e,t,c,r,n,s)}Qy(e,f,y);return;case"option":for(var V in a)f=a[V],a.hasOwnProperty(V)&&f!=null&&!n.hasOwnProperty(V)&&(V==="selected"?e.selected=!1:rt(e,t,V,null,n,f));for(h in n)f=n[h],y=a[h],n.hasOwnProperty(h)&&f!==y&&(f!=null||y!=null)&&(h==="selected"?(f!==y&&(Qe=!0),e.selected=f&&typeof f!="function"&&typeof f!="symbol"):rt(e,t,h,f,n,y));return;case"img":case"link":case"area":case"base":case"br":case"col":case"embed":case"hr":case"keygen":case"meta":case"param":case"source":case"track":case"wbr":case"menuitem":for(var M in a)f=a[M],a.hasOwnProperty(M)&&f!=null&&!n.hasOwnProperty(M)&&rt(e,t,M,null,n,f);for(p in n)if(f=n[p],y=a[p],n.hasOwnProperty(p)&&f!==y&&(f!=null||y!=null))switch(p){case"children":case"dangerouslySetInnerHTML":if(f!=null)throw Error(q(137,t));break;default:rt(e,t,p,f,n,y)}return;default:if(Tp(t)){for(var O in a)f=a[O],a.hasOwnProperty(O)&&f!==void 0&&!n.hasOwnProperty(O)&&up(e,t,O,void 0,n,f);for(b in n)f=n[b],y=a[b],!n.hasOwnProperty(b)||f===y||f===void 0&&y===void 0||up(e,t,b,f,n,y);return}}for(var N in a)f=a[N],a.hasOwnProperty(N)&&f!=null&&!n.hasOwnProperty(N)&&rt(e,t,N,null,n,f);for($ in n)f=n[$],y=a[$],!n.hasOwnProperty($)||f===y||f==null&&y==null||rt(e,t,$,f,n,y)}function ny(e){switch(e){case"css":case"script":case"font":case"img":case"image":case"input":case"link":return!0;default:return!1}}function KS(){if(typeof performance.getEntriesByType=="function"){for(var e=0,t=0,a=performance.getEntriesByType("resource"),n=0;n<a.length;n++){var r=a[n],s=r.transferSize,c=r.initiatorType,d=r.duration;if(s&&d&&ny(c)){for(c=0,d=r.responseEnd,n+=1;n<a.length;n++){var h=a[n],p=h.startTime;if(p>d)break;var b=h.transferSize,$=h.initiatorType;b&&ny($)&&(h=h.responseEnd,c+=b*(h<d?1:(d-p)/(h-p)))}if(--n,t+=8*(s+c)/(r.duration/1e3),e++,10<e)break}}if(0<e)return t/e/1e6}return navigator.connection&&(e=navigator.connection.downlink,typeof e=="number")?e:5}var hp=null,mp=null;function ql(e){return e.nodeType===9?e:e.ownerDocument}function iy(e){switch(e){case"http://www.w3.org/2000/svg":return 1;case"http://www.w3.org/1998/Math/MathML":return 2;default:return 0}}function t1(e,t){if(e===0)switch(t){case"svg":return 1;case"math":return 2;default:return 0}return e===1&&t==="foreignObject"?0:e}function a1(e,t,a,n){return a=ql(a).createElement(e),a[ca]=n,a[Ua]=t,ma(a,e,t),ia(a),a}function pp(e,t){return e==="textarea"||e==="noscript"||typeof t.children=="string"||typeof t.children=="number"||typeof t.children=="bigint"||typeof t.dangerouslySetInnerHTML=="object"&&t.dangerouslySetInnerHTML!==null&&t.dangerouslySetInnerHTML.__html!=null}var lm=null;function WS(){var e=window.event;return e&&e.type==="popstate"?e===lm?!1:(lm=e,!0):(lm=null,!1)}var mg=typeof setTimeout=="function"?setTimeout:void 0,ek=typeof clearTimeout=="function"?clearTimeout:void 0,ry=typeof Promise=="function"?Promise:void 0,oy=typeof requestAnimationFrame=="function"?requestAnimationFrame:mg,tk=typeof queueMicrotask=="function"?queueMicrotask:typeof ry<"u"?function(e){return ry.resolve(null).then(e).catch(ak)}:mg;function ak(e){setTimeout(function(){throw e})}function ur(e){return e==="head"}function sy(e,t){var a=t,n=0;do{var r=a.nextSibling;if(e.removeChild(a),r&&r.nodeType===8)if(a=r.data,a==="/$"||a==="/&"){if(n===0){e.removeChild(r),ps(t);return}n--}else if(a==="$"||a==="$?"||a==="$~"||a==="$!"||a==="&")n++;else if(a==="html")dm(e.ownerDocument.documentElement);else if(a==="head"){a=e.ownerDocument.head,dm(a);for(var s=a.firstChild;s;){var c=s.nextSibling,d=s.nodeName;s[Ql]||d==="SCRIPT"||d==="STYLE"||d==="LINK"&&s.rel.toLowerCase()==="stylesheet"||a.removeChild(s),s=c}}else a==="body"&&dm(e.ownerDocument.body);a=r}while(a);ps(t)}function ly(e,t){var a=e;e=0;do{var n=a.nextSibling;if(a.nodeType===1?t?(a._stashedDisplay=a.style.display,a.style.display="none"):(a.style.display=a._stashedDisplay||"",a.getAttribute("style")===""&&a.removeAttribute("style")):a.nodeType===3&&(t?(a._stashedText=a.nodeValue,a.nodeValue=""):a.nodeValue=a._stashedText||""),n&&n.nodeType===8)if(a=n.data,a==="/$"){if(e===0)break;e--}else a!=="$"&&a!=="$?"&&a!=="$~"&&a!=="$!"||e++;a=n}while(a)}function n1(e,t,a){if(t=CSS.escape(t)!==t?"r-"+btoa(t).replace(/=/g,""):t,e.style.viewTransitionName=t,a!=null&&(e.style.viewTransitionClass=a),a=getComputedStyle(e),a.display==="inline"){if(t=e.getClientRects(),t.length===1)var n=1;else for(var r=n=0;r<t.length;r++){var s=t[r];0<s.width&&0<s.height&&n++}n===1&&(e=e.style,e.display=t.length===1?"inline-block":"block",e.marginTop="-"+a.paddingTop,e.marginBottom="-"+a.paddingBottom)}}function i1(e,t){e=e.style,t=t.style;var a=t!=null?t.hasOwnProperty("viewTransitionName")?t.viewTransitionName:t.hasOwnProperty("view-transition-name")?t["view-transition-name"]:null:null;e.viewTransitionName=a==null||typeof a=="boolean"?"":(""+a).trim(),a=t!=null?t.hasOwnProperty("viewTransitionClass")?t.viewTransitionClass:t.hasOwnProperty("view-transition-class")?t["view-transition-class"]:null:null,e.viewTransitionClass=a==null||typeof a=="boolean"?"":(""+a).trim(),e.display==="inline-block"&&(t==null?e.display=e.margin="":(a=t.display,e.display=a==null||typeof a=="boolean"?"":a,a=t.margin,a!=null?e.margin=a:(a=t.hasOwnProperty("marginTop")?t.marginTop:t["margin-top"],e.marginTop=a==null||typeof a=="boolean"?"":a,t=t.hasOwnProperty("marginBottom")?t.marginBottom:t["margin-bottom"],e.marginBottom=t==null||typeof t=="boolean"?"":t)))}function r1(e,t,a){return a=a.ownerDocument.defaultView,{rect:e,abs:t.position==="absolute"||t.position==="fixed",clip:t.clipPath!=="none"||t.overflow!=="visible"||t.filter!=="none"||t.mask!=="none"||t.mask!=="none"||t.borderRadius!=="0px",view:0<=e.bottom&&0<=e.right&&e.top<=a.innerHeight&&e.left<=a.innerWidth}}function gp(e){var t=e.getBoundingClientRect(),a=getComputedStyle(e);return r1(t,a,e)}function nk(e){var t=e.getBoundingClientRect();t=new DOMRect(t.x+2e4,t.y+2e4,t.width,t.height);var a=getComputedStyle(e);return r1(t,a,e)}function ik(e){return e.documentElement.clientHeight}function rk(e){this.addEventListener("load",e),this.addEventListener("error",e)}function ok(e,t,a,n,r,s,c,d,h){var p=t.nodeType===9?t:t.ownerDocument;try{var b=p.startViewTransition({update:function(){var f=p.defaultView,y=f.navigation&&f.navigation.transition,V=p.fonts.status;n();var M=[];if(V==="loaded"&&(ik(p),p.fonts.status==="loading"&&M.push(p.fonts.ready)),V=M.length,e!==null)for(var O=e.suspenseyImages,N=0,v=0;v<O.length;v++){var w=O[v];if(!w.complete){var R=w.getBoundingClientRect();if(0<R.bottom&&0<R.right&&R.top<f.innerHeight&&R.left<f.innerWidth){if(N+=b1(w),N>Sd){M.length=V;break}w=new Promise(rk.bind(w)),M.push(w)}}}if(0<M.length)return f=Promise.race([Promise.all(M),new Promise(function(H){return setTimeout(H,500)})]).then(r,r),(y?Promise.allSettled([y.finished,f]):f).then(s,s);if(r(),y)return y.finished.then(s,s);s()},types:a});p.__reactViewTransition=b;var $=[];return b.ready.then(function(){for(var f=p.documentElement.getAnimations({subtree:!0}),y=0;y<f.length;y++){var V=f[y],M=V.effect,O=M.pseudoElement;if(O!=null&&O.startsWith("::view-transition")){$.push(V),V=M.getKeyframes();for(var N=O=void 0,v=!0,w=0;w<V.length;w++){var R=V[w],H=R.width;if(O===void 0)O=H;else if(O!==H){v=!1;break}if(H=R.height,N===void 0)N=H;else if(N!==H){v=!1;break}delete R.width,delete R.height,R.transform==="none"&&delete R.transform}v&&O!==void 0&&N!==void 0&&(M.setKeyframes(V),v=getComputedStyle(M.target,M.pseudoElement),v.width!==O||v.height!==N)&&(v=V[0],v.width=O,v.height=N,v=V[V.length-1],v.width=O,v.height=N,M.setKeyframes(V))}}c()},function(f){p.__reactViewTransition===b&&(p.__reactViewTransition=null);try{typeof f=="object"&&f!==null&&f.name==="InvalidStateError"&&(f.message==="View transition was skipped because document visibility state is hidden."||f.message==="Skipping view transition because document visibility state has become hidden."||f.message==="Skipping view transition because viewport size changed."||f.message==="Transition was aborted because of invalid state")&&(f=null),f!==null&&h(f)}finally{n(),r(),c()}}),b.finished.finally(function(){for(var f=0;f<$.length;f++)$[f].cancel();p.__reactViewTransition===b&&(p.__reactViewTransition=null),d()}),b}catch{return n(),r(),c(),null}}function Ar(e,t){this._scope=document.documentElement,this._selector="::view-transition-"+e+"("+t+")"}Ar.prototype.animate=function(e,t){return t=typeof t=="number"?{duration:t}:pt({},t),t.pseudoElement=this._selector,this._scope.animate(e,t)};Ar.prototype.getAnimations=function(){for(var e=this._scope,t=this._selector,a=e.getAnimations({subtree:!0}),n=[],r=0;r<a.length;r++){var s=a[r].effect;s!==null&&s.target===e&&s.pseudoElement===t&&n.push(a[r])}return n};Ar.prototype.getComputedStyle=function(){return getComputedStyle(this._scope,this._selector)};function o1(e){return{name:e,group:new Ar("group",e),imagePair:new Ar("image-pair",e),old:new Ar("old",e),new:new Ar("new",e)}}function Ja(e){this._fragmentFiber=e,this._observers=this._eventListeners=null}Ja.prototype.addEventListener=function(e,t,a){var n=null,r=null;if(!(a!=null&&typeof a!="boolean"&&(n=a.signal||null,n!==null&&n.aborted))){this._eventListeners===null&&(this._eventListeners=[]);var s=this._eventListeners;if(s1(s,e,t,a)===-1){var c=this,d=t;a!=null&&typeof a!="boolean"&&a.once===!0&&(d=function(h){c.removeEventListener(e,t,a),typeof t=="function"?t.call(this,h):t.handleEvent(h)}),n!==null&&(r=c.removeEventListener.bind(c,e,t,a),n.addEventListener("abort",r,{once:!0}),r=n.removeEventListener.bind(n,"abort",r)),n=ds(a),s.push({type:e,listener:t,optionsOrUseCapture:a,attachedListener:d,cleanup:r}),Ha(this._fragmentFiber.child,!1,sk,e,d,n)}this._eventListeners=s}};function sk(e,t,a,n){return Kt(e).addEventListener(t,a,n),!1}Ja.prototype.removeEventListener=function(e,t,a){var n=this._eventListeners;if(n!==null&&(t=s1(n,e,t,a),t!==-1)){var r=n[t];a=r.attachedListener;var s=r.cleanup;r=ds(r.optionsOrUseCapture),Ha(this._fragmentFiber.child,!1,lk,e,a,r),n.splice(t,1),s!==null&&s()}};function lk(e,t,a,n){return Kt(e).removeEventListener(t,a,n),!1}function ds(e){return e!=null&&typeof e!="boolean"&&(e.once===!0||e.signal instanceof AbortSignal)?{capture:e.capture,passive:e.passive}:e}function cy(e){return e==null?"c=0":typeof e=="boolean"?"c="+(e?"1":"0"):"c="+(e.capture?"1":"0")}function s1(e,t,a,n){if(e.length===0)return-1;n=cy(n);for(var r=0;r<e.length;r++){var s=e[r];if(s.type===t&&s.listener===a&&cy(s.optionsOrUseCapture)===n)return r}return-1}Ja.prototype.dispatchEvent=function(e){var t=jr(this._fragmentFiber);if(t===null)return!0;t=Kt(t);var a=this._eventListeners;if(a!==null&&0<a.length||!e.bubbles){var n=t.nodeType===9?t.createComment(""):document.createTextNode("");if(a)for(var r=0;r<a.length;r++){var s=a[r];n.addEventListener(s.type,s.attachedListener,ds(s.optionsOrUseCapture))}if(t.appendChild(n),e=n.dispatchEvent(e),a)for(r=0;r<a.length;r++)s=a[r],n.removeEventListener(s.type,s.attachedListener,ds(s.optionsOrUseCapture));return t.removeChild(n),e}return t.dispatchEvent(e)};Ja.prototype.focus=function(e){Ha(this._fragmentFiber.child,!0,l1,e,void 0,void 0)};function l1(e,t){return e.tag===6?!1:(e=Kt(e),wk(e,t))}Ja.prototype.focusLast=function(e){var t=[];Ha(this._fragmentFiber.child,!0,pg,t,void 0,void 0);for(var a=t.length-1;0<=a&&!l1(t[a],e);a--);};function pg(e,t){return t.push(e),!1}Ja.prototype.blur=function(){var e=jr(this._fragmentFiber);e!==null&&(e=Kt(e),e=ql(e).activeElement,e!==null&&Ha(this._fragmentFiber.child,!1,ck,e,void 0,void 0))};function ck(e,t){return e.tag===6?!1:(e=Kt(e),e===t||e.contains(t)?(t.blur(),!0):!1)}Ja.prototype.observeUsing=function(e){this._observers===null&&(this._observers=new Set),this._observers.add(e),Ha(this._fragmentFiber.child,!1,dk,e,void 0,void 0)};function dk(e,t){return e.tag===6||(e=Kt(e),t.observe(e)),!1}Ja.prototype.unobserveUsing=function(e){var t=this._observers;if(t!==null&&t.has(e)){t.delete(e),Ha(this._fragmentFiber.child,!1,uk,e,void 0,void 0);for(var a=t=0;a<kn.length;a++){var n=kn[a];n.fragmentInstance===this&&n.observer===e?e.unobserve(n.instance):kn[t++]=n}kn.length=t}};function uk(e,t){return e.tag===6||(e=Kt(e),t.unobserve(e)),!1}var kn=[],cm=!1;function hk(e,t,a){kn.push({fragmentInstance:e,observer:t,instance:a}),cm||(cm=!0,xk(function(){cm=!1;var n=kn;kn=[];for(var r=0;r<n.length;r++){var s=n[r];s.observer.unobserve(s.instance)}}))}Ja.prototype.getClientRects=function(){var e=[];return Ha(this._fragmentFiber.child,!1,mk,e,void 0,void 0),e};function mk(e,t){if(e.tag===6){e=e.stateNode;var a=e.ownerDocument.createRange();a.selectNodeContents(e),t.push.apply(t,a.getClientRects())}else e=Kt(e),t.push.apply(t,e.getClientRects());return!1}Ja.prototype.getRootNode=function(e){var t=jr(this._fragmentFiber);return t===null?this:Kt(t).getRootNode(e)};Ja.prototype.compareDocumentPosition=function(e){var t=jr(this._fragmentFiber);if(t===null)return Node.DOCUMENT_POSITION_DISCONNECTED;var a=[];Ha(this._fragmentFiber.child,!1,pg,a,void 0,void 0);var n=Kt(t);if(a.length===0){if(a=n,Bb(this._fragmentFiber)){e:{for(t=this._fragmentFiber.return;t!==null;){if(t.tag===4){t=t.stateNode.containerInfo;break e}if(t.tag===3||t.tag===5||t.tag===27)break;t=t.return}t=null}t!=null&&(a=t)}t=this._fragmentFiber;var r=n=a.compareDocumentPosition(e);return a===e?r=Node.DOCUMENT_POSITION_CONTAINS:n&Node.DOCUMENT_POSITION_CONTAINED_BY&&(a=Ry(t)[1],a===null?r=Node.DOCUMENT_POSITION_PRECEDING:(e=Kt(a).compareDocumentPosition(e),r=e===0||e&Node.DOCUMENT_POSITION_FOLLOWING?Node.DOCUMENT_POSITION_FOLLOWING:Node.DOCUMENT_POSITION_PRECEDING)),r|=Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC}t=Kt(a[0]),r=Kt(a[a.length-1]);var s=Bb(this._fragmentFiber)?t.parentElement:n;if(s==null)return Node.DOCUMENT_POSITION_DISCONNECTED;n=s.compareDocumentPosition(t)&Node.DOCUMENT_POSITION_CONTAINED_BY,s=s.compareDocumentPosition(r)&Node.DOCUMENT_POSITION_CONTAINED_BY;var c=t.compareDocumentPosition(e),d=r.compareDocumentPosition(e),h=c&Node.DOCUMENT_POSITION_CONTAINED_BY||d&Node.DOCUMENT_POSITION_CONTAINED_BY;return d=n&&s&&c&Node.DOCUMENT_POSITION_FOLLOWING&&d&Node.DOCUMENT_POSITION_PRECEDING,t=n&&t===e||s&&r===e||h||d?Node.DOCUMENT_POSITION_CONTAINED_BY:!n&&t===e||!s&&r===e?Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC:c,t&Node.DOCUMENT_POSITION_DISCONNECTED||t&Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC||pk(t,this._fragmentFiber,a[0],a[a.length-1],e)?t:Node.DOCUMENT_POSITION_IMPLEMENTATION_SPECIFIC};function pk(e,t,a,n,r){var s=Er(r);if(e&Node.DOCUMENT_POSITION_CONTAINED_BY){if(a=!!s)e:{for(;s!==null;){if(s.tag===7&&(s===t||s.alternate===t)){a=!0;break e}s=s.return}a=!1}return a}if(e&Node.DOCUMENT_POSITION_CONTAINS){if(s===null)return s=r.ownerDocument,r===s||r===s.documentElement||r===s.body;e:{for(s=t,t=jr(t);s!==null;){if(!(s.tag!==5&&s.tag!==3&&s.tag!==27||s!==t&&s.alternate!==t)){s=!0;break e}s=s.return}s=!1}return s}return e&Node.DOCUMENT_POSITION_PRECEDING?((t=!!s)&&!(t=s===a)&&(t=hm(a,s,jb),t===null?t=!1:(Ha(t,!0,Y5,s,a),s=Oo,Oo=null,t=s!==null)),t):e&Node.DOCUMENT_POSITION_FOLLOWING?((t=!!s)&&!(t=s===n)&&(t=hm(n,s,jb),t===null?t=!1:(Ha(t,!0,G5,s,n),s=Oo,um=Oo=null,t=s!==null)),t):!1}function dy(e,t){var a=e.ownerDocument.createRange();a.selectNodeContents(e),e=a.getBoundingClientRect(),window.scrollTo(window.scrollX+e.left,t?window.scrollY+e.top:window.scrollY+e.bottom-window.innerHeight)}Ja.prototype.scrollIntoView=function(e){if(typeof e=="object")throw Error(q(566));var t=[];Ha(this._fragmentFiber.child,!1,pg,t,void 0,void 0);var a=e!==!1;if(t.length===0){var n=Ry(this._fragmentFiber);if(n=a?n[1]||n[0]||jr(this._fragmentFiber):n[0]||n[1],n===null)return;if(n.tag===6){e=Kt(n),dy(e,a);return}if(n=Kt(n),n.nodeType!==9){if(n.nodeType===11){a="host"in n?n.host:null,a!==null&&a.scrollIntoView(e);return}n.scrollIntoView(e)}}for(n=a?t.length-1:0;n!==(a?-1:t.length);){var r=t[n];r.tag===6?(r=Kt(r),dy(r,a)):Kt(r).scrollIntoView(e),n+=a?-1:1}};function gk(e,t){return e=Kt(e),c1(e,t),!1}function c1(e,t){e.reactFragments==null&&(e.reactFragments=new Set),e.reactFragments.add(t)}function d1(e,t){var a=t._eventListeners;if(a!==null)for(var n=0;n<a.length;n++){var r=a[n];e.addEventListener(r.type,r.attachedListener,ds(r.optionsOrUseCapture))}e.nodeType!==3&&(a=t._observers,a!==null&&a.forEach(function(s){for(var c=0,d=0;d<kn.length;d++){var h=kn[d];(h.fragmentInstance!==t||h.observer!==s||h.instance!==e)&&(kn[c++]=h)}kn.length=c,s.observe(e)}),c1(e,t))}function fk(e,t){var a=t._eventListeners;if(a!==null)for(var n=0;n<a.length;n++){var r=a[n];e.removeEventListener(r.type,r.attachedListener,ds(r.optionsOrUseCapture))}e.nodeType!==3&&(a=t._observers,a!==null&&a.forEach(function(s){typeof s.rootMargin=="string"?hk(t,s,e):s.unobserve(e)}),e.reactFragments!=null&&e.reactFragments.delete(t))}function fp(e){var t=e.firstChild;for(t&&t.nodeType===10&&(t=t.nextSibling);t;){var a=t;switch(t=t.nextSibling,a.nodeName){case"HTML":case"HEAD":case"BODY":fp(a),nu(a);continue;case"SCRIPT":case"STYLE":continue;case"LINK":if(a.rel.toLowerCase()==="stylesheet")continue}e.removeChild(a)}}function bk(e,t,a,n){for(;e.nodeType===1;){var r=a;if(e.nodeName.toLowerCase()!==t.toLowerCase()){if(!n&&(e.nodeName!=="INPUT"||e.type!=="hidden"))break}else if(n){if(!e[Ql])switch(t){case"meta":if(!e.hasAttribute("itemprop"))break;return e;case"link":if(s=e.getAttribute("rel"),s==="stylesheet"&&e.hasAttribute("data-precedence"))break;if(s!==r.rel||e.getAttribute("href")!==(r.href==null||r.href===""?null:r.href)||e.getAttribute("crossorigin")!==(r.crossOrigin==null?null:r.crossOrigin)||e.getAttribute("title")!==(r.title==null?null:r.title))break;return e;case"style":if(e.hasAttribute("data-precedence"))break;return e;case"script":if(s=e.getAttribute("src"),(s!==(r.src==null?null:r.src)||e.getAttribute("type")!==(r.type==null?null:r.type)||e.getAttribute("crossorigin")!==(r.crossOrigin==null?null:r.crossOrigin))&&s&&e.hasAttribute("async")&&!e.hasAttribute("itemprop"))break;return e;default:return e}}else if(t==="input"&&e.type==="hidden"){var s=r.name==null?null:""+r.name;if(r.type==="hidden"&&e.getAttribute("name")===s)return e}else return e;if(e=un(e.nextSibling),e===null)break}return null}function vk(e,t,a){if(t==="")return null;for(;e.nodeType!==3;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!a||(e=un(e.nextSibling),e===null))return null;return e}function u1(e,t){for(;e.nodeType!==8;)if((e.nodeType!==1||e.nodeName!=="INPUT"||e.type!=="hidden")&&!t||(e=un(e.nextSibling),e===null))return null;return e}function bp(e){return e.data==="$?"||e.data==="$~"}function gg(e){return e.data==="$!"||e.data==="$?"&&e.ownerDocument.readyState!=="loading"}function yk(e,t){var a=e.ownerDocument;if(e.data==="$~")e._reactRetry=t;else if(e.data!=="$?"||a.readyState!=="loading")t();else{var n=function(){t(),a.removeEventListener("DOMContentLoaded",n)};a.addEventListener("DOMContentLoaded",n),e._reactRetry=n}}function un(e){for(;e!=null;e=e.nextSibling){var t=e.nodeType;if(t===1||t===3)break;if(t===8){if(t=e.data,t==="$"||t==="$!"||t==="$?"||t==="$~"||t==="&"||t==="F!"||t==="F")break;if(t==="/$"||t==="/&")return null}}return e}var vp=null;function uy(e){e=e.nextSibling;for(var t=0;e;){if(e.nodeType===8){var a=e.data;if(a==="/$"||a==="/&"){if(t===0)return un(e.nextSibling);t--}else a!=="$"&&a!=="$!"&&a!=="$?"&&a!=="$~"&&a!=="&"||t++}e=e.nextSibling}return null}function hy(e){e=e.previousSibling;for(var t=0;e;){if(e.nodeType===8){var a=e.data;if(a==="$"||a==="$!"||a==="$?"||a==="$~"||a==="&"){if(t===0)return e;t--}else a!=="/$"&&a!=="/&"||t++}e=e.previousSibling}return null}function wk(e,t){function a(){n=!0}if(e.ownerDocument.activeElement===e)return!0;var n=!1;try{e.ownerDocument.addEventListener("focus",a,!0),(e.focus||HTMLElement.prototype.focus).call(e,t)}finally{e.ownerDocument.removeEventListener("focus",a,!0)}return n}function xk(e){oy(function(){oy(function(t){return e(t)})})}function h1(e,t,a){switch(t=ql(a),e){case"html":if(e=t.documentElement,!e)throw Error(q(452));return e;case"head":if(e=t.head,!e)throw Error(q(453));return e;case"body":if(e=t.body,!e)throw Error(q(454));return e;default:throw Error(q(451))}}function m1(e,t,a){for(var n in a){var r=a[n];a.hasOwnProperty(n)&&r!=null&&rt(e,t,n,null,FS,r)}a.dangerouslySetInnerHTML!=null&&(e.textContent=""),e.onclick===Pn&&(e.onclick=null),nu(e)}function dm(e){for(var t=e.attributes;t.length;)e.removeAttributeNode(t[0]);nu(e)}var hn=new Map,my=new Set;function Ll(e){if(typeof e.getRootNode=="function"){var t=e.getRootNode();if(t.nodeType===9||t.nodeType===11)return t}return e.nodeType===9?e:e.ownerDocument}var Ci=Ke.d;Ke.d={f:$k,r:Nk,D:Sk,C:kk,L:Ck,m:Tk,X:Ak,S:Ek,M:Rk};function $k(){var e=Ci.f(),t=bu();return e||t}function Nk(e){var t=fs(e);t!==null&&t.tag===5&&t.type==="form"?Jw(t):Ci.r(e)}var ws=typeof document>"u"?null:document;function p1(e,t,a){var n=ws;if(n&&typeof t=="string"&&t){var r=ln(t);r='link[rel="'+e+'"][href="'+r+'"]',typeof a=="string"&&(r+='[crossorigin="'+a+'"]'),my.has(r)||(my.add(r),e={rel:e,crossOrigin:a,href:t},n.querySelector(r)===null&&(t=n.createElement("link"),ma(t,"link",e),ia(t),n.head.appendChild(t)))}}function Sk(e){Ci.D(e),p1("dns-prefetch",e,null)}function kk(e,t){Ci.C(e,t),p1("preconnect",e,t)}function Ck(e,t,a){Ci.L(e,t,a);var n=ws;if(n&&e&&t){var r='link[rel="preload"][as="'+ln(t)+'"]';t==="image"&&a&&a.imageSrcSet?(r+='[imagesrcset="'+ln(a.imageSrcSet)+'"]',typeof a.imageSizes=="string"&&(r+='[imagesizes="'+ln(a.imageSizes)+'"]')):r+='[href="'+ln(e)+'"]';var s=r;switch(t){case"style":s=us(e);break;case"script":s=xs(e)}if(!(hn.has(s)||(e=pt({rel:"preload",href:t==="image"&&a&&a.imageSrcSet?void 0:e,as:t},a),hn.set(s,e),n.querySelector(r)!==null||t==="style"&&n.querySelector(tc(s))||t==="script"&&n.querySelector(ac(s))))){var c=n.createElement("link");ma(c,"link",e),t==="style"&&(c[Md]=!0,c.onload=c.onerror=function(){jy(c)}),ia(c),n.head.appendChild(c)}}}function Tk(e,t){Ci.m(e,t);var a=ws;if(a&&e){var n=t&&typeof t.as=="string"?t.as:"script",r='link[rel="modulepreload"][as="'+ln(n)+'"][href="'+ln(e)+'"]',s=r;switch(n){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":s=xs(e)}if(!hn.has(s)&&(e=pt({rel:"modulepreload",href:e},t),hn.set(s,e),a.querySelector(r)===null)){switch(n){case"audioworklet":case"paintworklet":case"serviceworker":case"sharedworker":case"worker":case"script":if(a.querySelector(ac(s)))return}n=a.createElement("link"),ma(n,"link",e),ia(n),a.head.appendChild(n)}}}function Ek(e,t,a){Ci.S(e,t,a);var n=ws;if(n&&e){var r=Po(n).hoistableStyles,s=us(e);t=t||"default";var c=r.get(s);if(!c){var d={loading:0,preload:null};if(c=n.querySelector(tc(s)))d.loading=5;else{e=pt({rel:"stylesheet",href:e,"data-precedence":t},a),(a=hn.get(s))&&fg(e,a);var h=c=n.createElement("link");ia(h),ma(h,"link",e),h._p=new Promise(function(p,b){h.onload=p,h.onerror=b}),h.addEventListener("load",function(){d.loading|=1}),h.addEventListener("error",function(){d.loading|=2}),d.loading|=4,$d(c,t,n)}c={type:"stylesheet",instance:c,count:1,state:d},r.set(s,c)}}}function Ak(e,t){Ci.X(e,t);var a=ws;if(a&&e){var n=Po(a).hoistableScripts,r=xs(e),s=n.get(r);s||(s=a.querySelector(ac(r)),s||(e=pt({src:e,async:!0},t),(t=hn.get(r))&&bg(e,t),s=a.createElement("script"),ia(s),ma(s,"link",e),a.head.appendChild(s)),s={type:"script",instance:s,count:1,state:null},n.set(r,s))}}function Rk(e,t){Ci.M(e,t);var a=ws;if(a&&e){var n=Po(a).hoistableScripts,r=xs(e),s=n.get(r);s||(s=a.querySelector(ac(r)),s||(e=pt({src:e,async:!0,type:"module"},t),(t=hn.get(r))&&bg(e,t),s=a.createElement("script"),ia(s),ma(s,"link",e),a.head.appendChild(s)),s={type:"script",instance:s,count:1,state:null},n.set(r,s))}}function py(e,t,a,n){var r=(r=Qi.current)?Ll(r):null;if(!r)throw Error(q(446));switch(e){case"meta":case"title":return null;case"style":return typeof a.precedence=="string"&&typeof a.href=="string"?(a=us(a.href),t=Po(r).hoistableStyles,n=t.get(a),n||(n={type:"style",instance:null,count:0,state:null},t.set(a,n)),n):{type:"void",instance:null,count:0,state:null};case"link":if(a.rel==="stylesheet"&&typeof a.href=="string"&&typeof a.precedence=="string"){e=us(a.href);var s=Po(r).hoistableStyles,c=s.get(e);if(c||(r=r.ownerDocument||r,c={type:"stylesheet",instance:null,count:0,state:{loading:0,preload:null}},s.set(e,c),(s=r.querySelector(tc(e)))?s._p||(c.instance=s,c.state.loading=5):(s=hn.get(e),s||(s={rel:"preload",as:"style",href:a.href,crossOrigin:a.crossOrigin,integrity:a.integrity,media:a.media,hrefLang:a.hrefLang,referrerPolicy:a.referrerPolicy},hn.set(e,s)),Mk(r,e,s,c.state))),t&&n===null)throw Error(q(528,""));return c}if(t&&n!==null)throw Error(q(529,""));return null;case"script":return t=a.async,a=a.src,typeof a=="string"&&t&&typeof t!="function"&&typeof t!="symbol"?(a=xs(a),t=Po(r).hoistableScripts,n=t.get(a),n||(n={type:"script",instance:null,count:0,state:null},t.set(a,n)),n):{type:"void",instance:null,count:0,state:null};default:throw Error(q(444,e))}}function us(e){return'href="'+ln(e)+'"'}function tc(e){return'link[rel="stylesheet"]['+e+"]"}function g1(e){return pt({},e,{"data-precedence":e.precedence,precedence:null})}function Mk(e,t,a,n){if(t=e.querySelector('link[rel="preload"][as="style"]['+t+"]")){if(t[Md]!==!0){n.loading=1;return}}else t=e.createElement("link"),t[Md]=!0,t.onload=t.onerror=jy.bind(null,t),ma(t,"link",a),ia(t),e.head.appendChild(t);n.preload=t,t.addEventListener("load",function(){return n.loading|=1}),t.addEventListener("error",function(){return n.loading|=2})}function xs(e){return'[src="'+ln(e)+'"]'}function ac(e){return"script[async]"+e}function gy(e,t,a){if(t.count++,t.instance===null)switch(t.type){case"style":var n=e.querySelector('style[data-href~="'+ln(a.href)+'"]');if(n)return t.instance=n,ia(n),n;var r=pt({},a,{"data-href":a.href,"data-precedence":a.precedence,href:null,precedence:null});return n=(e.ownerDocument||e).createElement("style"),ia(n),ma(n,"style",r),$d(n,a.precedence,e),t.instance=n;case"stylesheet":r=us(a.href);var s=e.querySelector(tc(r));if(s)return t.state.loading|=4,t.instance=s,ia(s),s;n=g1(a),(r=hn.get(r))&&fg(n,r),s=(e.ownerDocument||e).createElement("link"),ia(s);var c=s;return c._p=new Promise(function(d,h){c.onload=d,c.onerror=h}),ma(s,"link",n),t.state.loading|=4,$d(s,a.precedence,e),t.instance=s;case"script":return s=xs(a.src),(r=e.querySelector(ac(s)))?(t.instance=r,ia(r),r):(n=a,(r=hn.get(s))&&(n=pt({},a),bg(n,r)),e=e.ownerDocument||e,r=e.createElement("script"),ia(r),ma(r,"link",n),e.head.appendChild(r),t.instance=r);case"void":return null;default:throw Error(q(443,t.type))}else t.type==="stylesheet"&&(t.state.loading&4)===0&&(n=t.instance,t.state.loading|=4,$d(n,a.precedence,e));return t.instance}function $d(e,t,a){for(var n=a.querySelectorAll('link[rel="stylesheet"][data-precedence],style[data-precedence]'),r=n.length?n[n.length-1]:null,s=r,c=0;c<n.length;c++){var d=n[c];if(d.dataset.precedence===t)s=d;else if(s!==r)break}s?s.parentNode.insertBefore(e,s.nextSibling):(t=a.nodeType===9?a.head:a,t.insertBefore(e,t.firstChild))}function fg(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.title==null&&(e.title=t.title)}function bg(e,t){e.crossOrigin==null&&(e.crossOrigin=t.crossOrigin),e.referrerPolicy==null&&(e.referrerPolicy=t.referrerPolicy),e.integrity==null&&(e.integrity=t.integrity)}var Nd=null;function fy(e,t,a){if(Nd===null){var n=new Map,r=Nd=new Map;r.set(a,n)}else r=Nd,n=r.get(a),n||(n=new Map,r.set(a,n));if(n.has(e))return n;for(n.set(e,null),a=a.getElementsByTagName(e),r=0;r<a.length;r++){var s=a[r];if(!(s[Ql]||s[ca]||e==="link"&&s.getAttribute("rel")==="stylesheet")&&s.namespaceURI!=="http://www.w3.org/2000/svg"){var c=s.getAttribute(t)||"";c=e+c;var d=n.get(c);d?d.push(s):n.set(c,[s])}}return n}function yp(e,t,a){e=e.ownerDocument||e,e.head.insertBefore(a,t==="title"?e.querySelector("head > title"):null)}function zk(e,t,a){if(a===1||t.itemProp!=null)return!1;switch(e){case"meta":case"title":return!0;case"style":if(typeof t.precedence!="string"||typeof t.href!="string"||t.href==="")break;return!0;case"link":if(typeof t.rel!="string"||typeof t.href!="string"||t.href===""||t.onLoad||t.onError)break;return t.rel==="stylesheet"?(e=t.disabled,typeof t.precedence=="string"&&e==null):!0;case"script":if(t.async&&typeof t.async!="function"&&typeof t.async!="symbol"&&!t.onLoad&&!t.onError&&t.src&&typeof t.src=="string")return!0}return!1}function by(e,t){return e==="img"&&t.src!=null&&t.src!==""&&t.onLoad==null&&t.loading!=="lazy"}function f1(e){return!(e.type==="stylesheet"&&(e.state.loading&3)===0)}function b1(e){return(e.width||100)*(e.height||100)*(typeof devicePixelRatio=="number"?devicePixelRatio:1)*.25}function vy(e,t){typeof t.decode=="function"&&(e.imgCount++,t.complete||(e.imgBytes+=b1(t),e.suspenseyImages.push(t)),e=Ik.bind(e),t.decode().then(e,e))}function Vk(e,t,a,n){if(a.type==="stylesheet"&&(typeof n.media!="string"||matchMedia(n.media).matches!==!1)&&(a.state.loading&4)===0){if(a.instance===null){var r=us(n.href),s=t.querySelector(tc(r));if(s){t=s._p,t!==null&&typeof t=="object"&&typeof t.then=="function"&&(e.count++,e=Bl.bind(e),t.then(e,e)),a.state.loading|=4,a.instance=s,ia(s);return}s=t.ownerDocument||t,n=g1(n),(r=hn.get(r))&&fg(n,r),s=s.createElement("link"),ia(s);var c=s;c._p=new Promise(function(d,h){c.onload=d,c.onerror=h}),ma(s,"link",n),a.instance=s}e.stylesheets===null&&(e.stylesheets=new Map),e.stylesheets.set(a,t),(t=a.state.preload)&&(a.state.loading&3)===0&&(e.count++,a=Bl.bind(e),t.addEventListener("load",a),t.addEventListener("error",a))}}var Sd=0;function Ok(e,t){return e.stylesheets&&e.count===0&&kd(e,e.stylesheets),0<e.count||0<e.imgCount?function(a){var n=setTimeout(function(){if(e.stylesheets&&kd(e,e.stylesheets),e.unsuspend){var s=e.unsuspend;e.unsuspend=null,s()}},6e4+t);0<e.imgBytes&&Sd===0&&(Sd=62500*KS());var r=setTimeout(function(){if(e.waitingForImages=!1,e.count===0&&(e.stylesheets&&kd(e,e.stylesheets),e.unsuspend)){var s=e.unsuspend;e.unsuspend=null,s()}},(e.imgBytes>Sd?50:800)+t);return e.unsuspend=a,function(){e.unsuspend=null,clearTimeout(n),clearTimeout(r)}}:null}function v1(e){if(e.count===0&&(e.imgCount===0||!e.waitingForImages)){if(e.stylesheets)kd(e,e.stylesheets);else if(e.unsuspend){var t=e.unsuspend;e.unsuspend=null,t()}}}function Bl(){this.count--,v1(this)}function Ik(){this.imgCount--,v1(this)}var eu=null;function kd(e,t){e.stylesheets=null,e.unsuspend!==null&&(e.count++,eu=new Map,t.forEach(Dk,e),eu=null,Bl.call(e))}function Dk(e,t){if(!(t.state.loading&4)){var a=eu.get(e);if(a)var n=a.get(null);else{a=new Map,eu.set(e,a);for(var r=e.querySelectorAll("link[data-precedence],style[data-precedence]"),s=0;s<r.length;s++){var c=r[s];(c.nodeName==="LINK"||c.getAttribute("media")!=="not all")&&(a.set(c.dataset.precedence,c),n=c)}n&&a.set(null,n)}r=t.instance,c=r.getAttribute("data-precedence"),s=a.get(c)||n,s===n&&a.set(null,r),a.set(c,r),this.count++,n=Bl.bind(this),r.addEventListener("load",n),r.addEventListener("error",n),s?s.parentNode.insertBefore(r,s.nextSibling):(e=e.nodeType===9?e.head:e,e.insertBefore(r,e.firstChild)),t.state.loading|=4}}var hs={$$typeof:Gn,Provider:null,Consumer:null,_currentValue:Rr,_currentValue2:Rr,_threadCount:0};function _k(e,t,a,n,r,s,c,d,h){this.tag=1,this.containerInfo=e,this.pingCache=this.current=this.pendingChildren=null,this.timeoutHandle=-1,this.callbackNode=this.next=this.pendingContext=this.context=this.cancelPendingCommit=null,this.callbackPriority=0,this.expirationTimes=Hh(-1),this.entangledLanes=this.shellSuspendCounter=this.errorRecoveryDisabledLanes=this.expiredLanes=this.warmLanes=this.pingedLanes=this.suspendedLanes=this.pendingLanes=0,this.entanglements=Hh(0),this.hiddenUpdates=Hh(null),this.identifierPrefix=n,this.onUncaughtError=r,this.onCaughtError=s,this.onRecoverableError=c,this.pooledCache=null,this.pooledCacheLanes=0,this.formState=h,this.transitionTypes=null,this.incompleteTransitions=new Map}function y1(e,t,a,n,r,s,c,d,h,p,b,$){return e=new _k(e,t,a,c,h,p,b,$,d),t=1,s===!0&&(t|=24),s=Da(3,null,null,t),e.current=s,s.stateNode=e,t=_p(),t.refCount++,e.pooledCache=t,t.refCount++,s.memoizedState={element:n,isDehydrated:a,cache:t},qp(s),e}function w1(e){return e?(e=Bo,e):Bo}function x1(e,t,a,n,r,s){r=w1(r),n.context===null?n.context=r:n.pendingContext=r,n=Ji(t),n.payload={element:a},s=s===void 0?null:s,s!==null&&(n.callback=s),a=Ki(e,n,t),a!==null&&(_a(a,e,t),wl(a,e,t))}function yy(e,t){if(e=e.memoizedState,e!==null&&e.dehydrated!==null){var a=e.retryLane;e.retryLane=a!==0&&a<t?a:t}}function vg(e,t){yy(e,t),(e=e.alternate)&&yy(e,t)}function $1(e){if(e.tag===13||e.tag===31){var t=Pr(e,67108864);t!==null&&_a(t,e,67108864),vg(e,67108864)}}function wy(e){if(e.tag===13||e.tag===31){var t=Qa();t=kp(t);var a=Pr(e,t);a!==null&&_a(a,e,t),vg(e,t)}}var ms=!0;function Hk(e,t,a,n){var r=$e.T;$e.T=null;var s=Ke.p;try{Ke.p=2,yg(e,t,a,n)}finally{Ke.p=s,$e.T=r}}function Uk(e,t,a,n){var r=$e.T;$e.T=null;var s=Ke.p;try{Ke.p=8,yg(e,t,a,n)}finally{Ke.p=s,$e.T=r}}function yg(e,t,a,n){if(ms){var r=wp(n);if(r===null)sm(e,t,n,tu,a),xy(e,n);else if(Lk(r,e,t,a,n))n.stopPropagation();else if(xy(e,n),t&4&&-1<qk.indexOf(e)){for(;r!==null;){var s=fs(r);if(s!==null)switch(s.tag){case 3:if(s=s.stateNode,s.current.memoizedState.isDehydrated){var c=kr(s.pendingLanes);if(c!==0){var d=s;for(d.pendingLanes|=2,d.entangledLanes|=2;c;){var h=1<<31-Za(c);d.entanglements[1]|=h,c&=~h}Wn(s),(Je&6)===0&&(Qd=Pa()+500,ec(0,!1))}}break;case 31:case 13:d=Pr(s,2),d!==null&&_a(d,s,2),bu(),vg(s,2)}if(s=wp(n),s===null&&sm(e,t,n,tu,a),s===r)break;r=s}r!==null&&n.stopPropagation()}else sm(e,t,n,null,a)}}function wp(e){return e=Ep(e),wg(e)}var tu=null;function wg(e){if(tu=null,e=Er(e),e!==null){var t=Gl(e);if(t===null)e=null;else{var a=t.tag;if(a===13){if(e=Ty(t),e!==null)return e;e=null}else if(a===31){if(e=Ey(t),e!==null)return e;e=null}else if(a===3){if(t.stateNode.current.memoizedState.isDehydrated)return t.tag===3?t.stateNode.containerInfo:null;e=null}else t!==e&&(e=null)}}return tu=e,null}function N1(e){switch(e){case"beforetoggle":case"cancel":case"click":case"close":case"contextmenu":case"copy":case"cut":case"auxclick":case"dblclick":case"dragend":case"dragstart":case"drop":case"focusin":case"focusout":case"input":case"invalid":case"keydown":case"keypress":case"keyup":case"mousedown":case"mouseup":case"paste":case"pause":case"play":case"pointercancel":case"pointerdown":case"pointerup":case"ratechange":case"reset":case"seeked":case"submit":case"toggle":case"touchcancel":case"touchend":case"touchstart":case"volumechange":case"change":case"selectionchange":case"textInput":case"compositionstart":case"compositionend":case"compositionupdate":case"beforeblur":case"afterblur":case"beforeinput":case"blur":case"fullscreenchange":case"fullscreenerror":case"focus":case"hashchange":case"popstate":case"select":case"selectstart":return 2;case"drag":case"dragenter":case"dragexit":case"dragleave":case"dragover":case"mousemove":case"mouseout":case"mouseover":case"pointermove":case"pointerout":case"pointerover":case"resize":case"scroll":case"touchmove":case"wheel":case"mouseenter":case"mouseleave":case"pointerenter":case"pointerleave":return 8;case"message":switch(eN()){case Oy:return 2;case Iy:return 8;case Rd:case tN:return 32;case Dy:return 268435456;default:return 32}default:return 32}}var xp=!1,ar=null,nr=null,ir=null,jl=new Map,Yl=new Map,Bi=[],qk="mousedown mouseup touchcancel touchend touchstart auxclick dblclick pointercancel pointerdown pointerup dragend dragstart drop compositionend compositionstart keydown keypress keyup input textInput copy cut paste click change contextmenu reset".split(" ");function xy(e,t){switch(e){case"focusin":case"focusout":ar=null;break;case"dragenter":case"dragleave":nr=null;break;case"mouseover":case"mouseout":ir=null;break;case"pointerover":case"pointerout":jl.delete(t.pointerId);break;case"gotpointercapture":case"lostpointercapture":Yl.delete(t.pointerId)}}function cl(e,t,a,n,r,s){return e===null||e.nativeEvent!==s?(e={blockedOn:t,domEventName:a,eventSystemFlags:n,nativeEvent:s,targetContainers:[r]},t!==null&&(t=fs(t),t!==null&&$1(t)),e):(e.eventSystemFlags|=n,t=e.targetContainers,r!==null&&t.indexOf(r)===-1&&t.push(r),e)}function Lk(e,t,a,n,r){switch(t){case"focusin":return ar=cl(ar,e,t,a,n,r),!0;case"dragenter":return nr=cl(nr,e,t,a,n,r),!0;case"mouseover":return ir=cl(ir,e,t,a,n,r),!0;case"pointerover":var s=r.pointerId;return jl.set(s,cl(jl.get(s)||null,e,t,a,n,r)),!0;case"gotpointercapture":return s=r.pointerId,Yl.set(s,cl(Yl.get(s)||null,e,t,a,n,r)),!0}return!1}function S1(e){var t=Er(e.target);if(t!==null){var a=Gl(t);if(a!==null){if(t=a.tag,t===13){if(t=Ty(a),t!==null){e.blockedOn=t,Xb(e.priority,function(){wy(a)});return}}else if(t===31){if(t=Ey(a),t!==null){e.blockedOn=t,Xb(e.priority,function(){wy(a)});return}}else if(t===3&&a.stateNode.current.memoizedState.isDehydrated){e.blockedOn=a.tag===3?a.stateNode.containerInfo:null;return}}}e.blockedOn=null}function Cd(e){if(e.blockedOn!==null)return!1;for(var t=e.targetContainers;0<t.length;){var a=wp(e.nativeEvent);if(a===null){a=e.nativeEvent;var n=new a.constructor(a.type,a);Sm=n,a.target.dispatchEvent(n),Sm=null}else return t=fs(a),t!==null&&$1(t),e.blockedOn=a,!1;t.shift()}return!0}function $y(e,t,a){Cd(e)&&a.delete(t)}function Bk(){xp=!1,ar!==null&&Cd(ar)&&(ar=null),nr!==null&&Cd(nr)&&(nr=null),ir!==null&&Cd(ir)&&(ir=null),jl.forEach($y),Yl.forEach($y)}function od(e,t){e.blockedOn===t&&(e.blockedOn=null,xp||(xp=!0,Wt.unstable_scheduleCallback(Wt.unstable_NormalPriority,Bk)))}var sd=null;function Ny(e){sd!==e&&(sd=e,Wt.unstable_scheduleCallback(Wt.unstable_NormalPriority,function(){sd===e&&(sd=null);for(var t=0;t<e.length;t+=3){var a=e[t],n=e[t+1],r=e[t+2];if(typeof n!="function"){if(wg(n||a)===null)continue;break}var s=fs(a);s!==null&&(e.splice(t,3),t-=3,qm(s,{pending:!0,data:r,method:a.method,action:n},n,r))}}))}function ps(e){function t(h){return od(h,e)}ar!==null&&od(ar,e),nr!==null&&od(nr,e),ir!==null&&od(ir,e),jl.forEach(t),Yl.forEach(t);for(var a=0;a<Bi.length;a++){var n=Bi[a];n.blockedOn===e&&(n.blockedOn=null)}for(;0<Bi.length&&(a=Bi[0],a.blockedOn===null);)S1(a),a.blockedOn===null&&Bi.shift();if(a=(e.ownerDocument||e).$$reactFormReplay,a!=null)for(n=0;n<a.length;n+=3){var r=a[n],s=a[n+1],c=r[Ua]||null;if(typeof s=="function")c||Ny(a);else if(c){var d=null;if(s&&s.hasAttribute("formAction")){if(r=s,c=s[Ua]||null)d=c.formAction;else if(wg(r)!==null)continue}else d=c.action;typeof d=="function"?a[n+1]=d:(a.splice(n,3),n-=3),Ny(a)}}}function k1(){function e(s){s.canIntercept&&s.info==="react-transition"&&s.intercept({handler:function(){return new Promise(function(c){return r=c})},focusReset:"manual",scroll:"manual"})}function t(){r!==null&&(r(),r=null),n||setTimeout(a,20)}function a(){if(!n&&!navigation.transition){var s=navigation.currentEntry;s&&s.url!=null&&navigation.navigate(s.url,{state:s.getState(),info:"react-transition",history:"replace"})}}if(typeof navigation=="object"){var n=!1,r=null;return navigation.addEventListener("navigate",e),navigation.addEventListener("navigatesuccess",t),navigation.addEventListener("navigateerror",t),setTimeout(a,100),function(){n=!0,navigation.removeEventListener("navigate",e),navigation.removeEventListener("navigatesuccess",t),navigation.removeEventListener("navigateerror",t),r!==null&&(r(),r=null)}}}function xg(e){this._internalRoot=e}wu.prototype.render=xg.prototype.render=function(e){var t=this._internalRoot;if(t===null)throw Error(q(409));var a=t.current,n=Qa();x1(a,n,e,t,null,null)};wu.prototype.unmount=xg.prototype.unmount=function(){var e=this._internalRoot;if(e!==null){this._internalRoot=null;var t=e.containerInfo;x1(e.current,2,null,e,null,null),bu(),t[gs]=null}};function wu(e){this._internalRoot=e}wu.prototype.unstable_scheduleHydration=function(e){if(e){var t=By();e={blockedOn:null,target:e,priority:t};for(var a=0;a<Bi.length&&t!==0&&t<Bi[a].priority;a++);Bi.splice(a,0,e),a===0&&S1(e)}};var Sy=ky.version;if(Sy!=="19.3.0")throw Error(q(527,Sy,"19.3.0"));Ke.findDOMNode=function(e){var t=e._reactInternals;if(t===void 0)throw typeof e.render=="function"?Error(q(188)):(e=Object.keys(e).join(","),Error(q(268,e)));return e=j5(t),e=e!==null?Ay(e):null,e=e===null?null:e.stateNode,e};var jk={bundleType:0,version:"19.3.0",rendererPackageName:"react-dom",currentDispatcherRef:$e,reconcilerVersion:"19.3.0"};if(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__<"u"&&(dl=__REACT_DEVTOOLS_GLOBAL_HOOK__,!dl.isDisabled&&dl.supportsFiber))try{Pl=dl.inject(jk),Xa=dl}catch{}var dl;xu.createRoot=function(e,t){if(!Cy(e))throw Error(q(299));var a=!1,n="",r=r0,s=o0,c=s0;return t!=null&&(t.unstable_strictMode===!0&&(a=!0),t.identifierPrefix!==void 0&&(n=t.identifierPrefix),t.onUncaughtError!==void 0&&(r=t.onUncaughtError),t.onCaughtError!==void 0&&(s=t.onCaughtError),t.onRecoverableError!==void 0&&(c=t.onRecoverableError)),t=y1(e,1,!1,null,null,a,n,null,r,s,c,k1),e[gs]=t.current,hg(e),new xg(t)};xu.hydrateRoot=function(e,t,a){if(!Cy(e))throw Error(q(299));var n=!1,r="",s=r0,c=o0,d=s0,h=null;return a!=null&&(a.unstable_strictMode===!0&&(n=!0),a.identifierPrefix!==void 0&&(r=a.identifierPrefix),a.onUncaughtError!==void 0&&(s=a.onUncaughtError),a.onCaughtError!==void 0&&(c=a.onCaughtError),a.onRecoverableError!==void 0&&(d=a.onRecoverableError),a.formState!==void 0&&(h=a.formState)),t=y1(e,1,!0,t,a??null,n,r,h,s,c,d,k1),t.context=w1(null),a=t.current,n=Qa(),n=kp(n),r=Ji(n),r.callback=null,Ki(a,r,n),a=n,t.current.lanes=a,Zl(t,a),Wn(t),e[gs]=t.current,hg(e),new wu(t)};xu.version="19.3.0"});var A1=Hn((xC,E1)=>{"use strict";function T1(){if(!(typeof __REACT_DEVTOOLS_GLOBAL_HOOK__>"u"||typeof __REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE!="function"))try{__REACT_DEVTOOLS_GLOBAL_HOOK__.checkDCE(T1)}catch(e){console.error(e)}}T1(),E1.exports=C1()});var Yt=tn(di()),Ws={enabled:!0,title:"Village Steward",explanation:"The village recognizes you as its trusted coordinator. Residents bring you proposals for improvements, and you help organize Projects, find willing builders, and see agreed plans through."},Kf="You participate as an ordinary resident. You can still receive proposals and organize Projects through cooperation, without an assumed position of authority.";function el(e){return e?e.title.length>80||e.explanation.length>1e3?"Use a role title of at most 80 characters and an explanation of at most 1,000 characters.":e.enabled&&(!e.title.trim()||!e.explanation.trim())?"Give your village role a title and explain why villagers turn to you.":"":"Choose your place in the village."}var sa="marinara-capability-villages";function Oc({role:e}){return(0,Yt.jsxs)("section",{className:`${sa}-field`,"aria-label":"Your place in the village",style:{overflowWrap:"anywhere"},children:[(0,Yt.jsx)("h3",{children:"Your place in the village"}),(0,Yt.jsx)("p",{className:`${sa}-hint`,children:(0,Yt.jsx)("strong",{children:e?e.enabled?e.title:"Ordinary resident":"No founding role recorded"})}),(0,Yt.jsx)("p",{className:`${sa}-hint`,children:e?e.enabled?e.explanation:Kf:"This village keeps its existing narrative framing."}),(0,Yt.jsx)("p",{className:`${sa}-hint`,children:"Your village role is fixed when founding completes."})]})}function Wf({role:e,onChange:t,disabled:a}){return(0,Yt.jsxs)("fieldset",{className:`${sa}-field`,children:[(0,Yt.jsx)("legend",{className:`${sa}-label`,children:"Your place in the village"}),(0,Yt.jsxs)("label",{className:`${sa}-hint`,children:[(0,Yt.jsx)("input",{type:"checkbox",checked:e.enabled,disabled:a,onChange:n=>t({...e,enabled:n.target.checked})})," ","Recognized village role"]}),e.enabled?(0,Yt.jsxs)(Yt.Fragment,{children:[(0,Yt.jsx)("label",{className:`${sa}-label`,htmlFor:`${sa}-role-title`,children:"Role title"}),(0,Yt.jsx)("input",{id:`${sa}-role-title`,className:`${sa}-search`,type:"text",value:e.title,maxLength:80,required:!0,disabled:a,onChange:n=>t({...e,title:n.target.value})}),(0,Yt.jsx)("label",{className:`${sa}-label`,htmlFor:`${sa}-role-explanation`,children:"Why villagers turn to you"}),(0,Yt.jsx)("textarea",{id:`${sa}-role-explanation`,className:`${sa}-textarea`,value:e.explanation,maxLength:1e3,rows:6,required:!0,disabled:a,onChange:n=>t({...e,explanation:n.target.value})}),(0,Yt.jsx)("p",{className:`${sa}-hint`,children:"Make this role your own. Residents can disagree or refuse; their homes and lives remain theirs. Your choice becomes fixed at founding."})]}):(0,Yt.jsx)("p",{className:`${sa}-hint`,children:Kf})]})}var Oi=tn(So()),J=tn(di()),$r={"Painted illustration":"Painted storybook illustration, coherent brushwork, soft lighting, and a consistent color palette.",Watercolor:"Watercolor scenery with translucent washes, textured paper, soft edges, and a harmonious palette.",Cartoon:"Cartoon scenery with clean outlines, simplified shapes, expressive colors, and consistent cel shading.","Pixel art":"Pixel art scenery with crisp pixel edges, a limited consistent palette, and carefully shaded forms.",Photorealism:"Photorealistic scenery with natural materials, realistic lighting, and coherent photographic detail.",Custom:""};function xh({value:e,onChange:t}){return(0,J.jsxs)("fieldset",{className:"villages-scenery-fields",children:[(0,J.jsx)("legend",{children:"Scenery art style"}),(0,J.jsxs)("label",{children:["Style preset",(0,J.jsx)("select",{"aria-label":"Scenery style preset",value:Object.keys($r).find(a=>$r[a]===e)??"Custom",onChange:a=>t($r[a.target.value]),children:Object.keys($r).map(a=>(0,J.jsx)("option",{children:a},a))})]}),(0,J.jsxs)("label",{children:["Style description",(0,J.jsx)("textarea",{"aria-label":"Scenery style description",rows:3,maxLength:600,value:e,onChange:a=>t(a.target.value)})]}),(0,J.jsx)("p",{children:"Used for future map and venue images. Existing artwork stays as it is."})]})}function Dc(){return{id:"private:player",ownerId:"player",name:"Your personal space",purpose:"Personal space",venueClass:"residence",description:"",image:null,state:{condition:"",items:[],publicFacts:[],features:[],traces:[],updatedAt:""}}}function $h({rooms:e,onChange:t,people:a,workplace:n=!1,playerHome:r=!1}){let s=(c,d)=>t(e.map(h=>h.id===c?{...h,...d}:h));return(0,J.jsxs)("section",{className:"villages-private-fields",children:[r?(0,J.jsx)("p",{children:"Your personal space belongs to you. Other residents\u2019 personal spaces remain a surprise until you\u2019re invited."}):n?(0,J.jsx)("p",{children:"A private work area is included automatically. All current workers have access; guests need an invitation."}):(0,J.jsx)("p",{children:"Restricted rooms are optional. Choose who can invite guests and approve lasting changes."}),e.filter(c=>c.ownerId!=="player").map(c=>(0,J.jsxs)("fieldset",{children:[(0,J.jsx)("legend",{children:c.name||"Private space"}),(0,J.jsxs)("label",{children:["Room name",(0,J.jsx)("input",{maxLength:100,value:c.name??"",onChange:d=>s(c.id,{name:d.target.value})})]}),(0,J.jsxs)("label",{children:["Purpose",(0,J.jsx)("input",{maxLength:240,value:c.purpose??"",onChange:d=>s(c.id,{purpose:d.target.value})})]}),n?null:(0,J.jsxs)("fieldset",{children:[(0,J.jsx)("legend",{children:"Room controllers"}),a.map(d=>(0,J.jsxs)("label",{children:[(0,J.jsx)("input",{type:"checkbox",checked:c.controllerIds?.includes(d.id)??!1,onChange:h=>s(c.id,{controllerIds:h.target.checked?[...c.controllerIds??[],d.id]:c.controllerIds?.filter(p=>p!==d.id)})}),d.name]},d.id))]}),(0,J.jsxs)("label",{children:["Description \xB7 optional",(0,J.jsx)("textarea",{maxLength:1e3,value:c.description,onChange:d=>s(c.id,{description:d.target.value})})]}),(0,J.jsx)("p",{children:"Private details will be prepared when the venue opens. Its image is drawn on first invited entry."}),(0,J.jsx)("button",{type:"button",onClick:()=>t(e.filter(d=>d.id!==c.id)),children:"Remove this private space"})]},c.id)),(0,J.jsx)("button",{type:"button",onClick:()=>t([...e,{...Dc(),id:"restricted:"+crypto.randomUUID(),ownerId:"",name:"",purpose:"",venueClass:n?"workplace":"other",controllerIds:[]}]),children:"Add private space"})]})}function pb({venue:e,tag:t,people:a,assignedIds:n,busy:r,problem:s,onPatch:c,onDone:d,onCancel:h,onMove:p,onGenerate:b,onUpload:$,onRemove:f}){let y=e.classes?.includes("residence")??!1,V=y&&!e.occupancy.playerHome,M=V?["Resident","Name and form","Exterior","Shared interior","Private spaces"]:["Name and form","Exterior","Interior","Private spaces"],[O,N]=(0,Oi.useState)(0),[v,w]=(0,Oi.useState)(""),R=(0,Oi.useRef)(null),H=M[O],Z=e.spaces?.[0],te=e.privateSpaces?.find(B=>B.ownerId==="player")??Dc();(0,Oi.useEffect)(()=>{R.current?.querySelector("input,textarea,select,button")?.focus()},[O]);let Q=(B,re)=>(0,J.jsxs)("section",{children:[(0,J.jsx)("p",{children:"Image \xB7 optional"}),re?(0,J.jsx)("img",{className:t+"-setup-image-preview",src:re.url,alt:B+" of "+e.name}):(0,J.jsx)("p",{children:"No image yet."}),(0,J.jsxs)("div",{className:t+"-row",children:[(0,J.jsxs)("button",{type:"button",disabled:r,onClick:()=>b(B),children:[re?"Regenerate":"Generate"," ",B," image"]}),(0,J.jsxs)("label",{children:["Upload ",B," image",(0,J.jsx)("input",{type:"file",accept:"image/*",disabled:r,onChange:ve=>{let ht=ve.target.files?.[0];ve.target.value="",ht&&$(B,ht)}})]}),re?(0,J.jsx)("button",{type:"button",disabled:r,onClick:()=>c(B==="exterior"?{...e,presentation:{...e.presentation,image:null}}:B==="private"?{...e,privateSpaces:(e.privateSpaces??[te]).map(ve=>ve.ownerId==="player"?{...ve,image:null}:ve)}:{...e,spaces:e.spaces?.map((ve,ht)=>ht===0?{...ve,image:null}:ve)}),children:"Remove image"}):null]})]});(0,Oi.useEffect)(()=>{let B=window.visualViewport,re=()=>{let ve=R.current;!ve||!B||window.innerWidth>704||(ve.style.height=B.height+"px",ve.parentElement.style.top=B.offsetTop+"px",ve.parentElement.style.bottom="auto")};return re(),B?.addEventListener("resize",re),B?.addEventListener("scroll",re),()=>{B?.removeEventListener("resize",re),B?.removeEventListener("scroll",re)}},[]);let Te=()=>{let B=H==="Resident"&&!e.occupancy.residentCharacterId?"Choose a villager.":H==="Name and form"&&(!e.name.trim()||!e.form?.trim())?"Add a name and describe the form.":H==="Exterior"&&!e.description.trim()?"Describe the exterior.":(H==="Interior"||H==="Shared interior")&&!Z?.description.trim()?"Describe the interior.":"";if(w(B),B){R.current?.querySelector("input,textarea,select")?.focus();return}O===M.length-1?d():N(O+1)};return(0,J.jsx)("div",{className:"villages-founding-backdrop",children:(0,J.jsxs)("div",{ref:R,className:"villages-founding-dialog",role:"dialog","aria-modal":"true","aria-label":"Define "+e.name,onKeyDown:B=>{if(B.key==="Escape"&&!r&&h(),B.key==="Tab"){let re=Array.from(R.current?.querySelectorAll("button:not(:disabled),input:not(:disabled),select:not(:disabled),textarea:not(:disabled)")??[]);B.shiftKey&&B.target===re[0]?(B.preventDefault(),re.at(-1)?.focus()):!B.shiftKey&&B.target===re.at(-1)&&(B.preventDefault(),re[0]?.focus())}},children:[(0,J.jsxs)("header",{children:[(0,J.jsx)("h3",{children:e.name||"New venue"}),(0,J.jsxs)("p",{children:[H," \xB7 ",O+1," of ",M.length]})]}),(0,J.jsxs)("div",{className:"villages-founding-editor-body",children:[H==="Resident"?(0,J.jsxs)("label",{children:["Assigned villager",(0,J.jsxs)("select",{"aria-label":"Assigned villager",value:e.occupancy.residentCharacterId??"",onChange:B=>c({...e,residentIds:B.target.value?[B.target.value]:[],occupancy:{...e.occupancy,residentCharacterId:B.target.value||null}}),children:[(0,J.jsx)("option",{value:"",children:"Choose a villager"}),a.map(B=>(0,J.jsx)("option",{value:B.id,disabled:n.includes(B.id),children:B.name},B.id))]})]}):null,H==="Name and form"?(0,J.jsxs)(J.Fragment,{children:[(0,J.jsxs)("label",{children:["Name",(0,J.jsx)("input",{"aria-label":"Venue name",maxLength:100,value:e.name,onChange:B=>c({...e,name:B.target.value})})]}),(0,J.jsxs)("label",{children:["Form",(0,J.jsx)("textarea",{"aria-label":"Venue form",maxLength:240,value:e.form??"",placeholder:y?"A stone house, a tent, or a converted vehicle\u2026":"A park, communal fire pit, or gathering hall\u2026",onChange:B=>c({...e,form:B.target.value})})]})]}):null,H==="Exterior"||H==="Interior"||H==="Shared interior"?(0,J.jsxs)(J.Fragment,{children:[(0,J.jsxs)("label",{children:[H," description",(0,J.jsx)("textarea",{"aria-label":H+" description",maxLength:1e3,value:H==="Exterior"?e.description:Z?.description??"",onChange:B=>c(H==="Exterior"?{...e,description:B.target.value}:{...e,spaces:e.spaces?.map((re,ve)=>ve===0?{...re,description:B.target.value}:re)})})]}),(0,J.jsxs)("fieldset",{children:[(0,J.jsx)("legend",{children:"Image context"}),V?(0,J.jsxs)("label",{children:[(0,J.jsx)("input",{type:"checkbox",checked:e.imageContext?.useAssignedVillagerContext??!0,onChange:B=>c({...e,imageContext:{useVisualLore:e.imageContext?.useVisualLore??!0,useAssignedVillagerContext:B.target.checked}})}),"Use assigned villager\u2019s personality"]}):null,(0,J.jsxs)("label",{children:[(0,J.jsx)("input",{type:"checkbox",checked:e.imageContext?.useVisualLore??!0,onChange:B=>c({...e,imageContext:{useAssignedVillagerContext:e.imageContext?.useAssignedVillagerContext??!0,useVisualLore:B.target.checked}})}),"Use selected visual lore"]})]}),Q(H==="Exterior"?"exterior":"interior",H==="Exterior"?e.presentation.image:Z?.image)]}):null,H==="Private spaces"?(0,J.jsxs)(J.Fragment,{children:[V?(0,J.jsx)("p",{children:"This villager\u2019s personal space will be prepared from their personality, relevant lore, and this home\u2019s form. Its details stay hidden until you\u2019re invited."}):null,e.occupancy.playerHome?(0,J.jsxs)(J.Fragment,{children:[(0,J.jsxs)("label",{children:["Your personal-space description",(0,J.jsx)("textarea",{"aria-label":"Your personal-space description",maxLength:1e3,value:te.description,onChange:B=>c({...e,privateSpaces:[...(e.privateSpaces??[]).filter(re=>re.ownerId!=="player"),{...te,description:B.target.value}]})})]}),Q("private",te.image)]}):null,(0,J.jsx)($h,{rooms:e.privateSpaces??[],onChange:B=>c({...e,privateSpaces:B}),people:[{id:"player",name:"You"},...a],playerHome:e.occupancy.playerHome})]}):null,(0,J.jsxs)("div",{className:t+"-row",children:[(0,J.jsx)("button",{type:"button",disabled:r,onClick:p,children:"Move on map"}),(0,J.jsx)("button",{type:"button",disabled:r,onClick:f,children:"Remove venue"})]}),v||s?(0,J.jsx)("p",{role:"alert",className:t+"-error",children:v||s}):null,r?(0,J.jsx)("p",{role:"status",children:"Preparing image\u2026"}):null]}),(0,J.jsxs)("footer",{children:[(0,J.jsx)("button",{type:"button",disabled:r,onClick:h,children:"Cancel"}),(0,J.jsx)("button",{type:"button",disabled:r||O===0,onClick:()=>{w(""),N(O-1)},children:"Back"}),(0,J.jsx)("button",{type:"button",disabled:r,onClick:Te,children:O===M.length-1?"Done":"Continue"})]})]})})}function gb(e,t,a){let n=t*a;if(!n||e.length!==n*4)return!1;let r=e.slice(),s=Math.max(1,Math.ceil(t*.18)),c=Math.max(1,Math.ceil(a*.18)),d=Math.max(1,Math.floor(Math.sqrt(n/4e4))),h=new Map,p=0;for(let z=0;z<a;z+=d)for(let j=0;j<t;j+=d){if(j>=s&&j<t-s&&z>=c&&z<a-c)continue;let me=(z*t+j)*4;if(e[me+3]<128)continue;p++;let ye=[e[me],e[me+1],e[me+2]];if(Math.max(...ye)<180||Math.max(...ye)-Math.min(...ye)<140)continue;let ae=ye.map(Ge=>Math.floor(Ge/32)).join(":"),Be=h.get(ae)??{rgb:[0,0,0],count:0};for(let Ge=0;Ge<3;Ge++)Be.rgb[Ge]+=ye[Ge];Be.count++,h.set(ae,Be)}let b=[...h.values()].sort((z,j)=>j.count-z.count)[0];if(!b||b.count<Math.max(4,p*.25))return!1;let $=b.rgb.map(z=>z/b.count),f=new Float32Array(n);for(let z=0;z<n;z++)f[z]=Math.hypot(r[z*4]-$[0],r[z*4+1]-$[1],r[z*4+2]-$[2]);let y=z=>f[z],V=new Set;for(let z=0;z<a;z+=d)for(let j=0;j<t;j+=d){if(j>=s&&j<t-s&&z>=c&&z<a-c)continue;let me=z*t+j;e[me*4+3]>128&&y(me)<28&&V.add((j>=t/2?1:0)+(z>=a/2?2:0))}if(V.size<3)return!1;let M=new Uint8Array(n),O=new Int32Array(n),N=0,v=0,w=t,R=-1,H=a,Z=-1;for(let z=0;z<n;z++)e[z*4+3]===0||y(z)>=28||(M[z]=1,O[v++]=z,w=Math.min(w,z%t),R=Math.max(R,z%t),H=Math.min(H,Math.floor(z/t)),Z=Math.max(Z,Math.floor(z/t)));let te=(z,j)=>{z%t>0&&j(z-1),z%t<t-1&&j(z+1),z>=t&&j(z-t),z<n-t&&j(z+t)};for(;N<v;)te(O[N++],z=>{M[z]||e[z*4+3]===0||y(z)>=90||(M[z]=1,O[v++]=z)});let Q=$.map((z,j)=>({value:z,index:j})).filter(({value:z})=>z>Math.max(...$)-48),Te=$.map((z,j)=>({value:z,index:j})).filter(({value:z})=>z<Math.min(...$)+48),B=new Float32Array(n),re=new Uint8Array(n);for(let z=0;z<n;z++){let j=255,me=0,ye=0;for(let{index:ae}of Q)j=Math.min(j,r[z*4+ae]),me=Math.max(me,r[z*4+ae]);for(let{index:ae}of Te)ye=Math.max(ye,r[z*4+ae]);B[z]=j-ye,re[z]=j-ye>8&&me-j<48?1:0}let ve=z=>B[z],ht=new Uint8Array(n);for(let z=0;z<n;z++){if(ht[z]||M[z]||e[z*4+3]===0)continue;N=0,v=1,O[0]=z,ht[z]=1;let j=!0;for(;N<v;){let me=O[N++];j&&(j=ve(me)>8&&y(me)<180),te(me,ye=>{ht[ye]||M[ye]||e[ye*4+3]===0||(ht[ye]=1,O[v++]=ye)})}if(v<=16&&j)for(let me=0;me<v;me++)M[O[me]]=1}let Me=Math.min(12,Math.max(6,Math.ceil(Math.min(t,a)/32))),Vt=new Uint8Array(n);N=0,v=0;for(let z=0;z<n;z++)(M[z]||e[z*4+3]===0)&&(Vt[z]=1,O[v++]=z);for(;N<v;){let z=O[N++];Vt[z]>Me*2||te(z,j=>{Vt[j]||(Vt[j]=Vt[z]+1,O[v++]=j)})}for(let z=0;z<n;z++){if(M[z]||!Vt[z]||Vt[z]>Me+1||e[z*4+3]===0)continue;let j=z%t,me=Math.floor(z/t),ye=r[z*4]-$[0],ae=r[z*4+1]-$[1],Be=r[z*4+2]-$[2],Ge,at=1,ie=1/0,st=!!re[z],qe=st?Me*2:Me,Ot=y(z)+8,lt=ve(z)-8;e:for(let $t=Math.max(0,me-qe);$t<=Math.min(a-1,me+qe);$t++)for(let pe=Math.max(0,j-qe);pe<=Math.min(t-1,j+qe);pe++){let ge=$t*t+pe;if(M[ge]||r[ge*4+3]<=128||re[ge]&&Vt[ge]&&Vt[ge]<=Me*2||ve(ge)>=lt||y(ge)<=Ot)continue;let he=r[ge*4]-$[0],ct=r[ge*4+1]-$[1],St=r[ge*4+2]-$[2],nt=Math.max(0,Math.min(1,(he*ye+ct*ae+St*Be)/(he*he+ct*ct+St*St))),Lt=ye-nt*he,Ve=ae-nt*ct,I=Be-nt*St,X=Lt*Lt+Ve*Ve+I*I;if(X<ie&&(ie=X,at=nt,Ge=[r[ge*4],r[ge*4+1],r[ge*4+2]],ie<1e-6))break e}if(Ge){if(st){let $t=Math.min(...Q.map(({index:ge})=>Ge[ge]))-Math.max(...Te.map(({index:ge})=>Ge[ge])),pe=Math.min(...Q.map(({value:ge})=>ge))-Math.max(...Te.map(({value:ge})=>ge));if(ie>64&&ve(z)<pe*.45)continue;at=Math.max(0,Math.min(1,(pe-ve(z))/(pe-$t)))}else if(ie>64||at>=.98)continue;if(e[z*4+3]=Math.round(r[z*4+3]*at),Ge)for(let $t=0;$t<3;$t++)e[z*4+$t]=Ge[$t]}}let qt=z=>z.filter(j=>M[j]).length/z.length,Ft=w<=t*.1&&R>=t*.9-1&&H<=a*.1&&Z>=a*.9-1&&qt(Array.from({length:R-w+1},(z,j)=>H*t+w+j))>.7&&qt(Array.from({length:R-w+1},(z,j)=>Z*t+w+j))>.7&&qt(Array.from({length:Z-H+1},(z,j)=>(H+j)*t+w))>.7&&qt(Array.from({length:Z-H+1},(z,j)=>(H+j)*t+R))>.7;for(let z=0;z<n;z++){let j=z%t,me=Math.floor(z/t),ye=z*4,ae=[e[ye],e[ye+1],e[ye+2]];(M[z]||Ft&&(j<w||j>R||me<H||me>Z)&&(Math.max(...ae)<100&&Math.max(...ae)-Math.min(...ae)<50||ve(z)>8))&&(e[ye+3]=0)}return!0}function fb(){let e=new Map,t=new Map,a=[],n=0,r=!1;function s(){for(;!r&&n<2&&a.length;){let c=a.shift();n++,Promise.resolve().then(c.work).then(d=>{r||(e.set(c.key,d),e.size>12&&e.delete(e.keys().next().value)),t.delete(c.key),c.resolve(d)},d=>{t.delete(c.key),c.reject(d)}).finally(()=>{n--,s()})}}return{get(c,d){if(r)return Promise.reject(new Error("Sprite Studio closed."));if(e.has(c)){let b=e.get(c);return e.delete(c),e.set(c,b),Promise.resolve(b)}let h=t.get(c);if(h)return h;let p=new Promise((b,$)=>a.push({key:c,work:d,resolve:b,reject:$}));return t.set(c,p),s(),p},dispose(){r=!0,e.clear(),t.clear();for(let c of a.splice(0))c.reject(new Error("Sprite Studio closed."))}}}var Ce=tn(So());var Nh={PAPERCRAFT:"Faithfully preserve the source character\u2019s design, clothing, colors, anatomy, and identifying features. Render as a handcrafted 2D papercraft game character: simplified cartoon proportions, bold clean near-black outlines, and a distinct thin off-white paper-cut border around the entire silhouette. Construct the character from flat overlapping cut-paper shapes with crisp angular cel-shaded color regions, subtle layered-paper depth, and tiny contact shadows between overlapping pieces. Apply a clearly visible matte handmade paper texture with fine fibers and gentle printed color variation across the entire character. Slightly imperfect physical cut edges. Clean, expressive, polished storybook character design. Avoid painterly rendering, realistic lighting, smooth gradients, glossy 3D materials, and photorealistic detail. The result should look like a physical illustrated paper character assembled from printed cutouts.",BATTLEHIGHWAY:"Use the reference image ONLY as a character-design reference for identity, species/anatomy, core outfit, colors, proportions, and defining features. Redraw the character strictly in the visual style of early-2000s Sonic Battle character art. Reconstruct the character from bold angular graphic shapes, not smooth modern anatomy. Use exaggerated proportions, a strong asymmetrical silhouette, and slightly hand-drawn, irregular contours. Build the design from large faceted masses, wedges, spikes, tapered limbs, and simplified shape clusters. Do not just take normal anatomy and make it slightly angular. Use thick dark outer outlines and selective thinner interior lines to divide important forms only. Group repeated details like feathers, fur, hair, folds, fingers, and accessories into a few large simplified shapes instead of many small ones. Use flat saturated colors with one large hard-edged shadow shape per major form and only occasional small highlight accents. Keep strong value separation and graphic cutout-like shading, not realistic form rendering. Include some medium-scale structural details that define the character, but remove microdetail. The final image should feel like Sonic Battle character key art: graphic, angular, simplified, lively, and highly readable, not polished modern anime art, not painterly, not vector-clean, and not realistic. No gradients, soft shading, painterly texture, glossy rendering, realistic lighting, detailed folds, excessive feather/fur/hair separation, or 3D volume.",Custom:""};var bb=["neutral","happy","sad","angry","surprised","thinking"];function Sh(e,t){if(!e||!/^[a-z0-9_-]{1,40}$/.test(e.label)||!["front","side"].includes(e.view))throw new Error("Choose a valid view and expression label.");if(typeof e.pose!="string"||e.pose.length>500)throw new Error("Pose instructions must be at most 500 characters.");if(![e.x,e.y,e.width,e.height].every(Number.isInteger)||e.x<0||e.y<0||e.width<1||e.height<1||e.x+e.width>t.width||e.y+e.height>t.height)throw new Error("The crop must fit inside the source image.");if(![e.scale,e.offsetX,e.offsetY].every(Number.isFinite)||e.scale<.1||e.scale>3||Math.abs(e.offsetX)>512||Math.abs(e.offsetY)>768)throw new Error("Choose a scale between 0.1 and 3 and an offset inside the sprite canvas.")}var S=tn(di()),M5=1,ko=e=>e instanceof Error?e.message:"The sprite action failed.";function z5(){let e=crypto.getRandomValues(new Uint8Array(16));e[6]=e[6]&15|64,e[8]=e[8]&63|128;let t=Array.from(e,a=>a.toString(16).padStart(2,"0")).join("");return`${t.slice(0,8)}-${t.slice(8,12)}-${t.slice(12,16)}-${t.slice(16,20)}-${t.slice(20)}`}var vb=e=>new Promise((t,a)=>{let n=new FileReader;n.onload=()=>t(String(n.result)),n.onerror=()=>a(new Error("The file could not be read.")),n.readAsDataURL(e)}),wb=e=>new Promise((t,a)=>{let n=new Image;n.onload=()=>t(n),n.onerror=()=>a(new Error("The image could not be loaded.")),n.src=e});function V5(e,t,a){let n=e.getImageData(0,0,t,a);gb(n.data,t,a)&&e.putImageData(n,0,0)}function O5(e,t,a=!1){return JSON.stringify({source:[e.url,e.source?.sha256],sheetSize:[e.width,e.height],baseScale:e.baseScale??Math.min(512/Math.max(...e.cells.map(n=>n.width)),768/Math.max(...e.cells.map(n=>n.height))),crop:[t.x,t.y,t.width,t.height],transform:[t.scale,t.offsetX,t.offsetY],canvas:[512,768],cleanup:a,cleanupVersion:a?4:0,rendererVersion:M5})}async function xb(e,t,a=!1,n){if(Sh(t,e),!n)return yb(e,t,a);let r=await n.get(O5(e,t,a),()=>yb(e,t,a)),s=document.createElement("canvas");return s.width=r.width,s.height=r.height,s.getContext("2d").drawImage(r,0,0),s}async function yb(e,t,a=!1){Sh(t,e);let n=await wb(e.url),r=document.createElement("canvas");r.width=t.width,r.height=t.height;let s=r.getContext("2d");s.drawImage(n,t.x,t.y,t.width,t.height,0,0,t.width,t.height),a&&V5(s,r.width,r.height);let c=document.createElement("canvas");c.width=512,c.height=768;let d=c.getContext("2d"),p=(e.baseScale??Math.min(512/Math.max(...e.cells.map(M=>M.width)),768/Math.max(...e.cells.map(M=>M.height))))*t.scale,b=s.getImageData(0,0,r.width,r.height).data,$=r.width,f=-1,y=r.height,V=-1;for(let M=0;M<r.height;M++)for(let O=0;O<r.width;O++)b[(M*r.width+O)*4+3]>16&&($=Math.min($,O),f=Math.max(f,O),y=Math.min(y,M),V=Math.max(V,M));if(f>=$){let M=f-$+1,O=V-y+1,N=Math.min(p,480/M,736/O),v=M*N,w=O*N;d.drawImage(r,$,y,M,O,(512-v)/2+t.offsetX,752-w+t.offsetY,v,w)}return c}function kh({candidate:e,mirrored:t=!1,renderCache:a}){let n=(0,Ce.useRef)(null),[r,s]=(0,Ce.useState)("");return(0,Ce.useEffect)(()=>{if(e.cell.rendered)return;let c=!1;return xb(e.sheet,e.cell,e.cell.cleanup,a).then(d=>{!c&&n.current&&(n.current.getContext("2d").clearRect(0,0,512,768),n.current.getContext("2d").drawImage(d,0,0),s(""))}).catch(d=>{c||s(ko(d))}),()=>{c=!0}},[e.sheet,e.cell,a]),e.cell.rendered?(0,S.jsx)("img",{src:e.cell.rendered.url,alt:e.cell.view+" "+e.cell.label,style:{transform:t?"scaleX(-1)":void 0}}):(0,S.jsxs)(S.Fragment,{children:[r?(0,S.jsx)("small",{role:"alert",children:r}):null,(0,S.jsx)("canvas",{ref:n,width:512,height:768,style:{transform:t?"scaleX(-1)":void 0},role:"img","aria-label":e.cell.view+" "+e.cell.label})]})}var I5=`
.vss{--ss-panel:#142038;--ss-border:#354865;color:#eef2ff;display:grid;gap:1rem;min-width:0}
.vss *{box-sizing:border-box}.vss button,.vss input,.vss select,.vss textarea{font:inherit}
.vss button{border:1px solid var(--ss-border);border-radius:.65rem;background:#1c2c48;color:#eef2ff;padding:.6rem .85rem;cursor:pointer}
.vss button:hover{background:#2a3b5d}.vss button:disabled{opacity:.5;cursor:default}.vss button[aria-selected=true],.vss button[aria-pressed=true],.vss .vss-primary{background:#6651b5;border-color:#a497ed}
.vss :focus-visible{outline:3px solid #beadff;outline-offset:3px}.vss h2,.vss h3,.vss p{margin:0}
.vss-header,.vss-row{display:flex;flex-wrap:wrap;align-items:center;gap:.65rem}.vss-header{justify-content:space-between}
.vss-header h2{font-size:1.45rem}.vss small,.vss-hint{color:#bcc9e5;font-size:.85rem;line-height:1.5}
.vss-nav{display:flex;gap:.5rem;border-bottom:1px solid var(--ss-border);padding-bottom:.75rem}
.vss-layout{display:grid;grid-template-columns:minmax(230px,.85fr) minmax(320px,1.2fr);gap:1rem;align-items:start}
.vss-panel{background:var(--ss-panel);border:1px solid var(--ss-border);border-radius:1rem;padding:1rem;display:grid;gap:.9rem;min-width:0}
.vss-preview{position:sticky;top:1rem}.vss-stage{height:clamp(280px,52vh,600px);display:grid;grid-template-rows:minmax(0,1fr);grid-template-columns:minmax(0,1fr);place-items:center;overflow:hidden;border-radius:.75rem;background:linear-gradient(#394b70 0 70%,#526279 70% 72%,#253751 72%);position:relative}
.vss-stage[data-background=light]{background:#f3f1ec}.vss-stage[data-background=dark]{background:#111522}.vss-stage[data-background=checker]{background:repeating-conic-gradient(#c1c5cf 0 25%,#edf0f5 0 50%) 0 0/24px 24px}
.vss-stage canvas,.vss-stage img{width:100%;max-width:100%;min-height:0;max-height:100%;height:100%;object-fit:contain;object-position:center bottom}
.vss-stage[data-half=true] canvas,.vss-stage[data-half=true] img{height:calc(100% * 100 / var(--crop));max-width:none;max-height:none;align-self:start}
.vss label{display:grid;gap:.35rem;min-width:0;font-size:.9rem}.vss label.vss-check{display:flex;align-items:center;gap:.45rem}
.vss input:not([type=checkbox]),.vss select,.vss textarea{min-width:0;width:100%;background:#0c172a;border:1px solid #405577;border-radius:.5rem;color:#eef2ff;padding:.6rem}
.vss textarea{min-height:8rem;resize:vertical}.vss input[type=checkbox]{accent-color:#a390f3}
.vss-grid{display:grid;grid-template-columns:repeat(auto-fit,minmax(115px,1fr));gap:.6rem}
.vss-card{display:grid;gap:.35rem;min-width:0;padding:.5rem;border:1px solid var(--ss-border);border-radius:.65rem;background:#0d182b}
.vss-card button{padding:.25rem;display:grid;place-items:center}.vss-card canvas,.vss-card img{height:125px;max-width:100%;object-fit:contain}
.vss-fields{display:grid;grid-template-columns:repeat(3,minmax(0,1fr));gap:.5rem}.vss-source{width:100%;max-height:240px;background:#0c1524}
.vss-error{border:1px solid #e28c91;background:#472739;padding:.75rem;border-radius:.6rem;overflow-wrap:anywhere}
.vss-progress{border-left:3px solid #b7a4ff;padding:.4rem .75rem}.vss-reference{max-width:95px;max-height:115px;object-fit:contain}
.vss details{border-top:1px solid var(--ss-border);padding-top:.7rem}.vss summary{cursor:pointer;margin-bottom:.7rem}.vss a{color:#c7baff}
@media(max-width:760px){.vss-layout{grid-template-columns:1fr}.vss-preview{position:static}.vss-stage{height:310px}.vss-panel{padding:.8rem}.vss-header h2{font-size:1.2rem}.vss-fields{grid-template-columns:repeat(2,minmax(0,1fr))}}
`;function $b({villager:e,request:t,onSaved:a,onBack:n,onExport:r}){let s=(0,Ce.useMemo)(()=>fb(),[]),c=(0,Ce.useRef)(null);(0,Ce.useEffect)(()=>(c.current!==null&&clearTimeout(c.current),()=>{c.current=setTimeout(()=>s.dispose(),0)}),[s]);let d="/villagers/"+encodeURIComponent(e.characterId)+"/sprites",[h,p]=(0,Ce.useState)(null),[b,$]=(0,Ce.useState)(null),[f,y]=(0,Ce.useState)("Create"),[V,M]=(0,Ce.useState)("front"),[O,N]=(0,Ce.useState)([...bb]),[v,w]=(0,Ce.useState)(""),[R,H]=(0,Ce.useState)({}),[Z,te]=(0,Ce.useState)(!1),[Q,Te]=(0,Ce.useState)(null),[B,re]=(0,Ce.useState)(""),[ve,ht]=(0,Ce.useState)(!1),[Me,Vt]=(0,Ce.useState)([]),[qt,Ft]=(0,Ce.useState)(""),[z,j]=(0,Ce.useState)(""),[me,ye]=(0,Ce.useState)(null),[ae,Be]=(0,Ce.useState)(!1),[Ge,at]=(0,Ce.useState)(""),[ie,st]=(0,Ce.useState)(""),[qe,Ot]=(0,Ce.useState)(!1),[lt,$t]=(0,Ce.useState)(!1),[pe,ge]=(0,Ce.useState)(null),he=(0,Ce.useRef)(null),[ct,St]=(0,Ce.useState)(""),[nt,Lt]=(0,Ce.useState)(null),[Ve,I]=(0,Ce.useState)(1),[X,we]=(0,Ce.useState)(1),[je,Le]=(0,Ce.useState)("neutral"),Ne=(0,Ce.useRef)(null),oe=(0,Ce.useRef)(""),Ze=(0,Ce.useRef)(null),P=(x,_)=>t(d+"/studio"+(x?"/"+x:""),_===void 0?void 0:{method:"POST",body:JSON.stringify(_)}),gt=x=>{p(x.studio),a(x.snapshot)},It=(h?.jobs??[]).flatMap(x=>x.sheets.flatMap(_=>_.cells.map(Y=>({sheet:_,cell:Y})))),de=It.find(x=>x.cell.id===qt),Re=me?It.find(x=>x.cell.id===me.id):null,Dt=h?.jobs.some(x=>x.status==="running")??!1,ft=e.sprite?.images??[],wa=It.filter(x=>x.cell.pending).length,Pt=h?.expressions??[],ea={view:V,individual:Z,settings:b,expressions:O.filter(x=>Pt.some(_=>_.label===x)).map(x=>{let _=Pt.find(Y=>Y.label===x);return{label:x,pose:R[x]??_.pose,expressionId:_.id}})},At=JSON.stringify(ea),kt=h?.reference?.url;(0,Ce.useEffect)(()=>{pe&&!he.current?.open&&he.current?.showModal(),!pe&&he.current?.open&&he.current.close()},[pe]),(0,Ce.useEffect)(()=>{let x=!1;return t(d+"/studio").then(_=>{x||(p(_),$(_.settings),_.jobs.length&&y("Review"))}).catch(_=>{x||at(ko(_))}),Ze.current?.focus(),()=>{x=!0}},[d,t]),(0,Ce.useEffect)(()=>{if(!Dt)return;let x=window.setInterval(()=>{t(d+"/studio").then(p).catch(_=>at(ko(_)))},2e3);return()=>window.clearInterval(x)},[Dt,d,t]),(0,Ce.useEffect)(()=>{let x=!1;if(Te(null),re(""),oe.current!==At&&(Ne.current=null,oe.current=At),!kt||!JSON.parse(At).expressions.length){ht(!1);return}ht(!0);let _=window.setTimeout(()=>{t(d+"/studio/plan",{method:"POST",body:At}).then(Y=>{x||Te(Y)}).catch(Y=>{x||re(ko(Y))}).finally(()=>{x||ht(!1)})},350);return()=>{x=!0,window.clearTimeout(_)}},[At,kt,d,t]);async function Ye(x){Be(!0),at(""),st("");try{await x()}catch(_){at(ko(_));try{p(await P(""))}catch{}}finally{Be(!1)}}async function qa(){let x=await P("plan",ea);if(Te(x),JSON.stringify(x)!==JSON.stringify(Q)){Ne.current=null,st("Summary refreshed. Review the image request and click Generate again.");return}Ne.current??(Ne.current=z5());try{let _=Ne.current,Y=await P("jobs",{...ea,plan:x,submissionId:_});if(p(Y),Ne.current=null,!Y.jobs.some(G=>G.id===_)){st("This submission already completed and its artwork was removed. Click Generate to start a new batch.");return}y("Review"),st("Drawing a saved batch. Existing scene images stay active.")}catch(_){if(/plan changed|model changed|size changed/i.test(ko(_)))Te(await P("plan",ea)),st("Summary refreshed. Click Generate to submit the updated request.");else throw _}}async function Nt(x,_){if(!x.length)throw new Error("Choose cutouts and expression slots.");let Y=[];for(let{candidate:G,expressionId:se}of x)Y.push({id:G.cell.id,expressionId:se,expected:G.cell,...G.cell.rendered?{}:{image:(await xb(G.sheet,G.cell,G.cell.cleanup,s)).toDataURL("image/png")}});gt(await P("assign",{cells:Y,batchId:_})),st("Assigned. These images are now used in scenes.")}async function T(x){let _=(x.assignments??[]).filter(G=>Pt.some(se=>se.id===G.expressionId)),Y=new Map;for(let G of x.sheets)for(let se of G.cells)!se.expressionId||!Pt.some(We=>We.id===se.expressionId)||_.some(We=>We.cellId===se.id)||Y.set(se.view+":"+se.expressionId,{candidate:{sheet:G,cell:se},expressionId:se.expressionId});for(let G of _){let se=It.find(We=>We.cell.id===G.cellId);se&&Y.set(G.view+":"+G.expressionId,{candidate:se,expressionId:G.expressionId})}await Nt([...Y.values()],x.id)}async function W(x){let _=await P("repair-background",{batchId:x.id});p(_);let Y=new Map((_.repairedCells??[]).map(se=>[se.originalId,se.cellId])),G=_.assignments.flatMap(se=>{let We=Y.get(se.cellId),Ma=_.jobs.flatMap(oa=>oa.sheets).find(oa=>oa.cells.some(ta=>ta.id===We)),pn=Ma?.cells.find(oa=>oa.id===We);return Ma&&pn?[{candidate:{sheet:Ma,cell:pn},expressionId:se.expressionId}]:[]});G.length&&await Nt(G,x.id),st("Backgrounds repaired. Original artwork retained; active sprites updated.")}function le(x){Ft(x.cell.id),j(h?.assignments.find(_=>_.cellId===x.cell.id)?.expressionId??x.cell.expressionId??Pt[0]?.id??""),ye(null)}async function Pe(x){let _=await P("delete",{...x,confirmed:!0});p(_.studio),ge(null),Ne.current=null,Vt([]),Ft(""),ye(null),st("Artwork removed. "+_.deleted+" unused files deleted."+(_.failures.length?" Use Delete unused files to retry: "+_.failures.map(Y=>Y.error).join("; "):""))}async function Fe(){let x=await wb(ct),_;if(nt&&typeof nt=="object"&&Array.isArray(nt.cells))_=nt.cells;else{if(!Number.isInteger(Ve)||!Number.isInteger(X)||Ve<1||X<1)throw new Error("Choose a valid grid.");let Y=je.split(",").map(G=>G.trim().toLowerCase().replace(/\s+/g,"_")).filter(Boolean);if(!Y.length||Y.length>Ve*X)throw new Error("Supply one name per occupied cell, separated by commas.");_=Y.map((G,se)=>{let We=Math.floor(se%Ve*x.naturalWidth/Ve),Ma=Math.floor(Math.floor(se/Ve)*x.naturalHeight/X);return{label:G,view:V,x:We,y:Ma,width:Math.floor((se%Ve+1)*x.naturalWidth/Ve)-We,height:Math.floor((Math.floor(se/Ve)+1)*x.naturalHeight/X)-Ma}})}p(await P("import",{image:ct,cells:_})),St(""),Lt(null),y("Review")}function Bt(x){if(x.style&&Object.hasOwn(Nh,x.style)){let Y=x.style;$(G=>G&&{...G,style:Y,connectionId:x.connectionId,prompts:{...G.prompts,[Y]:x.stylePrompt??G.prompts[Y]}})}let _=x.requestedExpressions??[...x.sheets.flatMap(Y=>Y.cells),...x.pendingExpressions??[]];N([...new Set(_.map(Y=>Y.label))]),H(Object.fromEntries(_.map(Y=>[Y.label,Y.pose]))),M(x.view),te(x.individual??!1),Ne.current=null,y("Create"),st("Retry prepared. Generate creates a new batch with the displayed request count.")}let E=(0,S.jsxs)("aside",{className:"vss-panel vss-slots","data-open":lt,"aria-label":"Expression assignment panel",children:[(0,S.jsxs)("h3",{children:["Expressions \xB7 ",Pt.length]}),(0,S.jsx)("p",{className:"vss-hint",children:de?"Selected: "+de.cell.label+" \xB7 "+de.cell.view:"Select a cutout, then Assign. Or drag it onto an expression."}),(0,S.jsxs)("label",{children:["Assign selected cutout to",(0,S.jsxs)("select",{"aria-label":"Assign selected cutout to",value:z,onChange:x=>j(x.target.value),children:[(0,S.jsx)("option",{value:"",children:"Choose expression"}),Pt.map(x=>(0,S.jsx)("option",{value:x.id,children:x.name},x.id))]})]}),(0,S.jsx)("button",{className:"vss-primary",disabled:ae||!de||!z,onClick:()=>de&&void Ye(()=>Nt([{candidate:de,expressionId:z}])),children:"Assign"}),(0,S.jsx)("button",{className:"vss-slot-toggle","aria-expanded":lt,onClick:()=>$t(!lt),children:lt?"Hide expressions":"Show expressions"}),(0,S.jsx)("div",{className:"vss-slot-list",children:Pt.map(x=>{let _=(h?.assignments??[]).filter(Y=>Y.expressionId===x.id);return(0,S.jsxs)("div",{className:"vss-slot",onDragOver:Y=>Y.preventDefault(),onDrop:Y=>{Y.preventDefault();let G=It.find(se=>se.cell.id===Y.dataTransfer.getData("application/x-villages-cutout"));G&&!ae&&Ye(()=>Nt([{candidate:G,expressionId:x.id}]))},children:[(0,S.jsxs)("strong",{children:[x.name,h?.defaultExpressionId===x.id?" \xB7 Default":""]}),(0,S.jsx)("small",{children:x.useWhen||x.pose||"Uses this expression's name as guidance."}),(0,S.jsxs)("div",{className:"vss-row",children:[_.map(Y=>{let G=It.find(se=>se.cell.id===Y.cellId);return G?(0,S.jsxs)("div",{className:"vss-mini",children:[(0,S.jsx)(kh,{renderCache:s,candidate:G}),(0,S.jsx)("small",{children:Y.view})]},Y.view):null}),_.length?null:(0,S.jsx)("small",{children:"Empty \xB7 optional"})]}),(0,S.jsxs)("button",{disabled:ae||!de,"aria-label":"Assign selected cutout to "+x.name,onClick:()=>de&&void Ye(()=>Nt([{candidate:de,expressionId:x.id}])),children:["Assign ",de?.cell.view??""," here"]}),_.length&&h?.defaultExpressionId!==x.id?(0,S.jsx)("button",{disabled:ae,onClick:()=>{Ye(async()=>gt(await P("expression",{defaultId:x.id})))},children:"Use as default scene image"}):null,(0,S.jsxs)("details",{children:[(0,S.jsxs)("summary",{children:["Edit ",x.name]}),(0,S.jsxs)("form",{onSubmit:Y=>{Y.preventDefault();let G=new FormData(Y.currentTarget);Ye(async()=>gt(await P("expression",{id:x.id,name:G.get("name"),label:G.get("name"),pose:G.get("pose"),useWhen:G.get("useWhen")})))},children:[(0,S.jsxs)("label",{children:["Name",(0,S.jsx)("input",{name:"name",defaultValue:x.name,maxLength:40,required:!0})]}),(0,S.jsxs)("label",{children:["Pose for generation",(0,S.jsx)("input",{name:"pose",defaultValue:x.pose,maxLength:500})]}),(0,S.jsxs)("label",{children:["Use when \xB7 optional",(0,S.jsx)("input",{name:"useWhen",defaultValue:x.useWhen,maxLength:1e3})]}),(0,S.jsx)("button",{disabled:ae,children:"Save expression"}),(0,S.jsx)("button",{type:"button",disabled:ae||!!_.length,onClick:()=>{Ye(async()=>gt(await P("expression",{removeId:x.id})))},children:"Remove empty slot"})]})]})]},x.id)})}),(0,S.jsxs)("form",{onSubmit:x=>{x.preventDefault();let _=v.trim();Ye(async()=>{gt(await P("expression",{name:_})),w(""),N(Y=>[...new Set([...Y,_.toLowerCase().replace(/\s+/g,"_")])])})},children:[(0,S.jsxs)("label",{children:["New expression",(0,S.jsx)("input",{value:v,maxLength:40,onChange:x=>w(x.target.value),placeholder:"Delighted, running\u2026"})]}),(0,S.jsx)("button",{disabled:ae||!v.trim(),children:"Add expression"})]})]});return(0,S.jsxs)("section",{className:"vss","aria-label":e.name+" Sprite Studio",children:[(0,S.jsx)("style",{children:I5+D5}),(0,S.jsxs)("header",{className:"vss-header",children:[(0,S.jsxs)("div",{children:[(0,S.jsxs)("p",{className:"vss-hint",children:["Villagers / ",e.name]}),(0,S.jsxs)("h2",{ref:Ze,tabIndex:-1,children:[e.name,"\u2019s Sprite Studio"]}),(0,S.jsxs)("small",{children:[ft.length," in use \xB7 ",It.length," saved cutouts \xB7 ",wa," pending review"]})]}),(0,S.jsx)("button",{disabled:ae,onClick:()=>{Ye(async()=>{b&&await P("settings",b),n()})},children:"\u2190 Back to Villagers"})]}),Ge&&!pe?(0,S.jsx)("p",{className:"vss-error",role:"alert",children:Ge}):null,(0,S.jsx)("p",{role:"status","aria-live":"polite",children:ie}),!h||!b?(0,S.jsx)("p",{children:"Loading saved sprite work\u2026"}):(0,S.jsxs)(S.Fragment,{children:[(0,S.jsx)("nav",{className:"vss-nav","aria-label":"Sprite Studio sections",children:["Create","Review","In use"].map(x=>(0,S.jsxs)("button",{"aria-pressed":f===x,onClick:()=>{y(x),ye(null)},children:[x,x==="Review"&&wa?" \xB7 "+wa:""]},x))}),h.reference?null:(0,S.jsxs)("div",{className:"vss-panel",children:[(0,S.jsx)("h3",{children:"Capture an identity reference"}),(0,S.jsx)("button",{disabled:ae,onClick:()=>{Ye(async()=>p(await P("reference",{})))},children:"Capture current avatar"}),(0,S.jsxs)("label",{children:["Upload reference",(0,S.jsx)("input",{type:"file",accept:"image/png,image/jpeg,image/webp",onChange:x=>{let _=x.target.files?.[0];_&&Ye(async()=>p(await P("reference",{image:await vb(_)})))}})]})]}),f==="Create"?(0,S.jsxs)("div",{className:"vss-create",children:[(0,S.jsxs)("div",{className:"vss-panel",children:[(0,S.jsx)("h3",{children:"Generate a saved batch"}),(0,S.jsx)("p",{className:"vss-hint",children:"Choose any expressions. Neutral is optional. Assign images in Review to use them in scenes."}),(0,S.jsxs)("label",{children:["View",(0,S.jsxs)("select",{"aria-label":"View",value:V,onChange:x=>M(x.target.value),children:[(0,S.jsx)("option",{value:"front",children:"Front \xB7 facing you"}),(0,S.jsx)("option",{value:"side",children:"Side \xB7 facing right, mirrored for left"})]})]}),(0,S.jsx)("div",{className:"vss-expressions",children:Pt.map(x=>(0,S.jsxs)("div",{children:[(0,S.jsxs)("label",{className:"vss-check",children:[(0,S.jsx)("input",{type:"checkbox",checked:O.includes(x.label),onChange:_=>N(_.target.checked?[...O,x.label]:O.filter(Y=>Y!==x.label))}),x.name]}),O.includes(x.label)?(0,S.jsxs)("label",{children:["Pose \xB7 optional",(0,S.jsx)("input",{value:R[x.label]??x.pose,maxLength:500,onChange:_=>H({...R,[x.label]:_.target.value})})]}):null]},x.id))}),(0,S.jsxs)("label",{children:["Art style",(0,S.jsxs)("select",{"aria-label":"Art style",value:b.style,onChange:x=>$({...b,style:x.target.value}),children:[(0,S.jsx)("option",{value:"PAPERCRAFT",children:"Papercraft"}),(0,S.jsx)("option",{value:"BATTLEHIGHWAY",children:"Battle Highway"}),(0,S.jsx)("option",{value:"Custom",children:"Custom"})]})]}),(0,S.jsxs)("details",{children:[(0,S.jsx)("summary",{children:"Style prompt"}),(0,S.jsxs)("label",{children:["Drawing instructions",(0,S.jsx)("textarea",{value:b.prompts[b.style],maxLength:6e3,onChange:x=>$({...b,prompts:{...b.prompts,[b.style]:x.target.value}})})]}),(0,S.jsx)("button",{onClick:()=>$({...b,prompts:{...b.prompts,[b.style]:Nh[b.style]}}),children:"Restore style prompt"})]}),(0,S.jsxs)("label",{children:["Image connection",(0,S.jsxs)("select",{"aria-label":"Image connection",value:b.connectionId,onChange:x=>$({...b,connectionId:x.target.value}),children:[(0,S.jsx)("option",{value:"",children:"Village default"}),h.connections.map(x=>(0,S.jsxs)("option",{value:x.id,children:[x.name," \xB7 ",x.model]},x.id))]})]}),(0,S.jsxs)("label",{children:["Drawing layout",(0,S.jsxs)("select",{"aria-label":"Drawing layout",value:Z?"individual":"sheet",onChange:x=>te(x.target.value==="individual"),children:[(0,S.jsx)("option",{value:"sheet",children:"Efficient sheets \xB7 up to six sprites each"}),(0,S.jsx)("option",{value:"individual",children:"Individual \xB7 more drawing space per sprite"})]})]}),(0,S.jsx)("div",{className:"vss-panel","aria-label":"Generation request summary",children:ve?(0,S.jsx)("p",{children:"Updating request summary\u2026"}):Q?(0,S.jsxs)(S.Fragment,{children:[(0,S.jsxs)("strong",{children:[Q.connection.name," \xB7 ",Q.connection.model]}),(0,S.jsxs)("p",{children:[ea.expressions.length," expressions \xB7 ",Q.batches.length," image"," ",Q.batches.length===1?"request":"requests"," \xB7"," ",Q.estimatedCost===null?"Cost unavailable":"Estimated $"+Q.estimatedCost.toFixed(3)]}),Q.batches.map((x,_)=>(0,S.jsxs)("small",{children:["Sheet ",_+1,": ",x.count," sprites \xB7 ",x.cols," \xD7 ",x.rows," \xB7 ",x.width," \xD7"," ",x.height,"px source"]},_)),(0,S.jsxs)("details",{className:"vss-request",children:[(0,S.jsx)("summary",{children:"Image request"}),Q.batches.map((x,_)=>x.request?(0,S.jsxs)("section",{"aria-label":"Sheet "+(_+1)+" image request",children:[(0,S.jsxs)("strong",{children:["Sheet ",_+1]}),(0,S.jsx)("p",{children:"Positive prompt"}),(0,S.jsx)("pre",{"aria-label":"Sheet "+(_+1)+" positive prompt",children:x.request.prompt}),(0,S.jsx)("p",{children:"Negative prompt"}),(0,S.jsx)("pre",{"aria-label":"Sheet "+(_+1)+" negative prompt",children:x.request.negativePrompt})]},_):null)]}),(0,S.jsxs)("small",{children:["Cutouts saved at 512 \xD7 768."," ",Q.localWorkflow?"Local workflow internal steps and costs are unavailable. ":"","No automatic retries or provider changes."]})]}):(0,S.jsx)("p",{className:"vss-hint",children:B||"Select expressions and capture a reference to see the request summary."})}),(0,S.jsx)("button",{className:"vss-primary",disabled:ae||Dt||ve||!Q||!ea.expressions.length,onClick:()=>{Ye(qa)},children:ae?"Working\u2026":"Generate"}),(0,S.jsxs)("details",{children:[(0,S.jsx)("summary",{children:"Import images or a sheet"}),(0,S.jsxs)("label",{children:["Image",(0,S.jsx)("input",{type:"file",accept:"image/png,image/jpeg,image/webp",onChange:x=>{let _=x.target.files?.[0];_&&Ye(async()=>St(await vb(_)))}})]}),(0,S.jsxs)("label",{children:["Optional exported JSON manifest",(0,S.jsx)("input",{type:"file",accept:".json,application/json",onChange:x=>{let _=x.target.files?.[0];_&&Ye(async()=>Lt(JSON.parse(await _.text())))}})]}),nt?(0,S.jsx)("small",{children:"Using manifest cell positions and views."}):(0,S.jsxs)(S.Fragment,{children:[(0,S.jsxs)("div",{className:"vss-fields",children:[(0,S.jsxs)("label",{children:["Columns",(0,S.jsx)("input",{type:"number",min:1,value:Ve,onChange:x=>I(Number(x.target.value))})]}),(0,S.jsxs)("label",{children:["Rows",(0,S.jsx)("input",{type:"number",min:1,value:X,onChange:x=>we(Number(x.target.value))})]})]}),(0,S.jsxs)("label",{children:["Expression names in reading order",(0,S.jsx)("input",{value:je,onChange:x=>Le(x.target.value)})]})]}),(0,S.jsx)("button",{disabled:ae||!ct,onClick:()=>{Ye(Fe)},children:"Import to gallery"})]})]}),(0,S.jsxs)("div",{children:[h.reference?(0,S.jsxs)("div",{className:"vss-panel",children:[(0,S.jsx)("h3",{children:"Original identity reference"}),(0,S.jsx)("img",{className:"vss-reference",src:h.reference.url,alt:"Captured identity reference"}),(0,S.jsx)("small",{children:"Used for every generation and art style."})]}):null,E]})]}):f==="Review"?(0,S.jsxs)(S.Fragment,{children:[(0,S.jsxs)("div",{className:"vss-row",children:[(0,S.jsx)("h3",{children:"Saved artwork"}),(0,S.jsx)("button",{disabled:ae||!wa,onClick:()=>{Ye(async()=>{p(await P("clear-review",{})),Ot(!1),st("Pending review cleared. All saved artwork remains available.")})},children:"Clear pending review"}),(0,S.jsxs)("label",{className:"vss-check",children:[(0,S.jsx)("input",{type:"checkbox",checked:qe,onChange:x=>Ot(x.target.checked)}),"Pending only"]}),(0,S.jsxs)("button",{disabled:ae||!Me.length,onClick:()=>ge({ids:Me,deleteFiles:!1}),children:["Delete selected cutouts (",Me.length,")"]}),(0,S.jsx)("button",{disabled:ae,onClick:()=>{Ye(async()=>{if(!window.confirm("Delete unused Studio-owned files? Saved alternatives, active assignments, shared originals, and the identity reference are retained."))return;let x=await P("delete-unused",{});p(x.studio),st(x.deleted+" unused files deleted."+(x.failures.length?" Retry needed: "+x.failures.map(_=>_.error).join("; "):""))})},children:"Delete unused files"})]}),(0,S.jsxs)("div",{className:"vss-library",children:[(0,S.jsxs)("div",{className:"vss-gallery",children:[h.jobs.length?null:(0,S.jsx)("div",{className:"vss-panel",children:(0,S.jsx)("p",{children:"Generate or import artwork to begin. Each batch stays here for future swaps."})}),[...h.jobs].reverse().map(x=>{let _=x.sheets.flatMap(Y=>Y.cells.filter(G=>!qe||G.pending).map(G=>({sheet:Y,cell:G})));return qe&&!_.length&&x.status==="ready"?null:(0,S.jsxs)("article",{className:"vss-panel","aria-label":"Batch "+x.id,children:[(0,S.jsx)("h3",{children:x.style==="PAPERCRAFT"?"Papercraft":x.style==="BATTLEHIGHWAY"?"Battle Highway":x.style||x.model||"Saved batch"}),(0,S.jsxs)("small",{children:[new Date(x.createdAt).toLocaleString()," \xB7 ",x.model," \xB7 ",x.attempted," submitted /"," ",x.planned," planned requests \xB7 ",x.status]}),x.error?(0,S.jsx)("p",{className:"vss-hint",children:x.error}):null,(0,S.jsxs)("div",{className:"vss-row",children:[(0,S.jsx)("button",{className:"vss-primary",disabled:ae||x.status==="running"||!_.length,onClick:()=>{Ye(()=>T(x))},children:"Use this batch"}),(0,S.jsx)("button",{disabled:ae||x.status==="running",onClick:()=>ge({batchId:x.id,deleteFiles:!1}),children:"Delete batch"}),(0,S.jsx)("button",{disabled:ae||x.status==="running"||!_.length,onClick:()=>{Ye(()=>W(x))},children:"Repair backgrounds"}),x.status==="interrupted"?(0,S.jsx)("button",{disabled:ae||Dt,onClick:()=>Bt(x),children:"Prepare retry"}):null,x.pendingAssetId&&x.status!=="running"?(0,S.jsx)("button",{disabled:ae,onClick:()=>{Ye(async()=>p(await P("recover",{id:x.id})))},children:"Recover saved original \xB7 no image request"}):null]}),x.sheets.some(Y=>!Y.source||Y.source.kind==="legacy")?(0,S.jsx)("p",{children:"Earlier saved sources may already contain transparency damage. Repair backgrounds cannot restore missing opacity. Generate a new batch to review replacements; existing artwork stays saved."}):null,(0,S.jsx)("div",{className:"vss-originals",children:x.sheets.map((Y,G)=>(0,S.jsxs)("details",{children:[(0,S.jsxs)("summary",{children:["Original sheet ",G+1,(0,S.jsx)("img",{className:"vss-sheet-thumb",src:Y.url,alt:"Sheet thumbnail "+(G+1)})]}),(0,S.jsx)("a",{href:Y.url,target:"_blank",rel:"noreferrer",children:(0,S.jsx)("img",{src:Y.url,alt:"Original sheet "+(G+1)})}),(0,S.jsxs)("small",{children:[Y.width," \xD7 ",Y.height,"px \xB7 Provider usage"," ",Y.usage?JSON.stringify(Y.usage):"unavailable"]})]},Y.assetId+":"+G))}),(0,S.jsx)("div",{className:"vss-grid",children:_.map(Y=>{let G=h.assignments.filter(se=>se.cellId===Y.cell.id);return(0,S.jsxs)("div",{className:"vss-card",draggable:!ae,onDragStart:se=>{se.dataTransfer.setData("application/x-villages-cutout",Y.cell.id),se.dataTransfer.effectAllowed="copy",le(Y)},children:[(0,S.jsx)("button",{"aria-label":"Select "+Y.cell.view+" "+Y.cell.label+" cutout","aria-pressed":qt===Y.cell.id,onClick:()=>le(Y),children:(0,S.jsx)(kh,{renderCache:s,candidate:Y})}),(0,S.jsx)("strong",{children:Y.cell.label.replaceAll("_"," ")}),(0,S.jsx)("small",{children:Y.cell.view}),G.length?(0,S.jsxs)("span",{className:"vss-badge",children:["In use \xB7"," ",G.map(se=>Pt.find(We=>We.id===se.expressionId)?.name).join(", ")]}):(0,S.jsx)("small",{children:Y.cell.pending?"Pending review":"Saved alternative"}),(0,S.jsxs)("label",{className:"vss-check",children:[(0,S.jsx)("input",{type:"checkbox",checked:Me.includes(Y.cell.id),"aria-label":"Select "+Y.cell.label+" for deletion",onChange:se=>Vt(se.target.checked?[...Me,Y.cell.id]:Me.filter(We=>We!==Y.cell.id))}),"Select for deletion"]}),(0,S.jsx)("button",{disabled:ae,onClick:()=>{le(Y),ye(structuredClone(Y.cell))},children:"Adjust image"})]},Y.cell.id)})})]},x.id)})]}),E]}),me&&Re?(0,S.jsxs)("div",{className:"vss-panel","aria-label":"Adjust image",children:[(0,S.jsx)("h3",{children:"Adjust image \xB7 saves another cutout"}),(0,S.jsxs)("div",{className:"vss-adjust",children:[(0,S.jsx)("div",{className:"vss-stage","data-background":"checker",children:(0,S.jsx)(kh,{renderCache:s,candidate:{sheet:Re.sheet,cell:{...me,rendered:void 0}}})}),(0,S.jsxs)("svg",{className:"vss-source",viewBox:"0 0 "+Re.sheet.width+" "+Re.sheet.height,role:"img","aria-label":"Original sheet with selected crop",children:[(0,S.jsx)("image",{href:Re.sheet.url,width:Re.sheet.width,height:Re.sheet.height}),(0,S.jsx)("rect",{x:me.x,y:me.y,width:me.width,height:me.height,fill:"none",stroke:"#c5a4ff",strokeWidth:Math.max(3,Re.sheet.width/150)})]})]}),(0,S.jsx)("div",{className:"vss-fields",children:["x","y","width","height","scale","offsetX","offsetY"].map(x=>(0,S.jsxs)("label",{children:[{x:"Crop X",y:"Crop Y",width:"Crop width",height:"Crop height",scale:"Scale",offsetX:"Horizontal offset",offsetY:"Foot offset"}[x],(0,S.jsx)("input",{type:"number",step:x==="scale"?.05:1,value:me[x],onChange:_=>ye({...me,[x]:Number(_.target.value)})})]},x))}),(0,S.jsxs)("label",{className:"vss-check",children:[(0,S.jsx)("input",{type:"checkbox",checked:me.cleanup??!1,onChange:x=>ye({...me,cleanup:x.target.checked})}),"Remove background"]}),(0,S.jsxs)("div",{className:"vss-row",children:[(0,S.jsx)("button",{disabled:ae,onClick:()=>{Ye(async()=>{let x=await P("cell",{id:me.id,cell:me});p(x),Ft(x.adjustedCellId??qt),ye(null),st("Adjusted cutout saved. Assign it when ready.")})},children:"Save adjusted cutout"}),(0,S.jsx)("button",{onClick:()=>ye(null),children:"Cancel"})]})]}):null]}):(0,S.jsxs)("div",{className:"vss-panel",children:[(0,S.jsx)("h3",{children:"In use"}),(0,S.jsx)("p",{className:"vss-hint",children:"These assignments are used in scenes. Saved alternatives remain in Review."}),(0,S.jsx)("div",{className:"vss-grid",children:ft.map(x=>(0,S.jsxs)("div",{className:"vss-card",children:[(0,S.jsx)("img",{src:x.url,alt:x.label+" "+x.view}),(0,S.jsx)("strong",{children:x.label.replaceAll("_"," ")}),(0,S.jsx)("small",{children:x.view}),(0,S.jsx)("button",{disabled:ae,onClick:()=>{Ye(async()=>{gt(await P("remove",x)),st("Removed from scenes. Saved artwork remains available.")})},children:"Remove from scenes"})]},x.view+":"+x.label))}),ft.length?(0,S.jsxs)(S.Fragment,{children:[(0,S.jsxs)("label",{children:["Scene framing",(0,S.jsxs)("select",{value:e.sprite?.framing.mode??"full",onChange:x=>{Ye(async()=>a(await t(d+"/framing",{method:"POST",body:JSON.stringify({mode:x.target.value,cropPercent:e.sprite?.framing.cropPercent??58})})))},children:[(0,S.jsx)("option",{value:"full",children:"Full body"}),(0,S.jsx)("option",{value:"half",children:"Half body"})]})]}),e.sprite?.framing.mode==="half"?(0,S.jsxs)("label",{children:["Visible body height \xB7 percent",(0,S.jsx)("input",{type:"number",min:40,max:85,defaultValue:e.sprite.framing.cropPercent,onBlur:x=>{let _=Number(x.target.value);_!==e.sprite?.framing.cropPercent&&Ye(async()=>a(await t(d+"/framing",{method:"POST",body:JSON.stringify({mode:"half",cropPercent:_})})))}})]}):null,(0,S.jsx)("button",{disabled:ae,onClick:()=>{Ye(r)},children:"Download both views and manifest"})]}):(0,S.jsx)("p",{children:"No assigned images yet."}),E]})]}),(0,S.jsx)("dialog",{ref:he,className:"vss-delete-dialog","aria-labelledby":"vss-delete-title",onCancel:()=>ge(null),children:pe?(0,S.jsxs)("div",{className:"vss-panel",children:[(0,S.jsx)("h3",{id:"vss-delete-title",children:"Delete saved artwork?"}),Ge?(0,S.jsx)("p",{className:"vss-error",role:"alert",children:Ge}):null,(0,S.jsxs)("p",{children:[pe.batchId?"Remove this batch from the gallery.":"Remove "+pe.ids?.length+" selected cutouts from the gallery."," ","Images currently in use are protected."]}),(0,S.jsxs)("label",{className:"vss-check",children:[(0,S.jsx)("input",{type:"checkbox",checked:pe.deleteFiles,onChange:x=>ge({...pe,deleteFiles:x.target.checked})}),"Also delete unused files from disk"]}),(0,S.jsx)("small",{children:"Shared originals and retained alternatives stay saved. Files kept on disk can be removed later with Delete unused files."}),(0,S.jsxs)("div",{className:"vss-row",children:[(0,S.jsx)("button",{disabled:ae,onClick:()=>ge(null),children:"Cancel"}),(0,S.jsx)("button",{disabled:ae,onClick:()=>{Ye(()=>Pe(pe))},children:"Delete artwork"})]})]}):null})]})}var D5=`
.vss-request{min-width:0}.vss-request pre{white-space:pre-wrap;overflow-wrap:anywhere;font:inherit;font-size:.85rem;max-height:20rem;overflow:auto;background:#0c1524;padding:.7rem;border-radius:.5rem}
.vss-create{display:grid;grid-template-columns:minmax(0,1.5fr) minmax(280px,1fr);gap:1rem;align-items:start}
.vss-create>div:last-child{display:grid;gap:1rem}.vss-library{display:grid;grid-template-columns:minmax(0,1fr) 310px;gap:1rem;align-items:start}
.vss-gallery{display:grid;gap:1.25rem;min-width:0}.vss-slots{position:sticky;top:1rem}.vss-slot-list{display:grid;gap:.75rem;max-height:65vh;overflow:auto;padding:.2rem}
.vss-slot{display:grid;gap:.5rem;padding:.7rem;border:1px solid #405577;border-radius:.75rem;background:#0d182b}.vss-slot:hover{border-color:#ac96fa}
.vss-slot form,.vss-slots>form{display:grid;gap:.5rem}.vss-mini{display:grid;gap:.2rem}.vss-mini canvas,.vss-mini img{width:64px;height:96px;object-fit:contain}.vss-slot-toggle{display:none}.vss-originals img.vss-sheet-thumb{display:block;width:150px;height:110px;margin-top:.5rem}
.vss-grid{grid-template-columns:repeat(auto-fill,minmax(230px,1fr));gap:.8rem}.vss-card{padding:.7rem;gap:.5rem}.vss-card canvas,.vss-card img{height:270px;width:100%;object-fit:contain}
.vss-card>button:first-child{background:repeating-conic-gradient(#27344d 0 25%,#34425a 0 50%) 0 0/20px 20px}.vss-card>button:first-child[aria-pressed=true]{outline:3px solid #c5a4ff}
.vss-badge{color:#d9caff;font-size:.8rem;background:#493767;border-radius:.4rem;padding:.3rem}.vss-originals{display:flex;gap:1rem;flex-wrap:wrap}
.vss-originals details{max-width:100%;flex:1 1 150px}.vss-originals img{max-width:100%;max-height:280px;object-fit:contain;background:#0c172a}
.vss-expressions{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:.8rem}.vss-adjust{display:grid;grid-template-columns:220px minmax(0,1fr);gap:1rem}.vss-delete-dialog{padding:0;max-width:550px;width:calc(100% - 2rem);background:#142038;color:#eef2ff;border:1px solid #ac96fa;border-radius:1rem}.vss-delete-dialog::backdrop{background:#000a}
.vss-adjust .vss-stage{height:300px}.vss-reference{max-width:100%;width:100%;max-height:240px}
@media(max-width:850px){.vss-library,.vss-create{grid-template-columns:1fr}.vss-slots{position:static;order:-1}.vss-slot-toggle{display:block}.vss-slots[data-open=false] .vss-slot-list{display:none}.vss-slot-list{max-height:330px}.vss-grid{grid-template-columns:repeat(2,minmax(0,1fr))}.vss-card canvas,.vss-card img{height:180px}.vss-adjust{grid-template-columns:1fr}.vss-expressions{grid-template-columns:1fr}}
`;var m=tn(So()),wx=tn(A1());function Yk(e,t=!1){let a=e.replace(/\r\n?/g,`
`).split(`
`),n="",r=[],s=[];for(let c=0;c<a.length;c++){let d=a[c],h=/^ {0,3}(`{3,}|~{3,})/.exec(d)?.[1];if(h&&(n?h[0]===n[0]&&h.length>=n.length&&(n=""):n=h),!n&&!d.trim()&&(!t||c<a.length-1)){let p=r.join(`
`).trim();p&&s.push(p),r=[]}else r.push(d)}if(!t){let c=r.join(`
`).trim();c&&s.push(c)}return s}var Gk=['"',"'","\u201D","\u2019","\xBB","\u300D"],Pk=['"',"'","\u201C","\u2018","\xAB","\u300C"];function R1(e){let t=e.trim();return Gk.includes(t.slice(-1))&&Pk.some(n=>t.slice(0,-1).includes(n))?"speech":"prose"}function M1(e,t){let a=Yk(e),n=()=>({paragraphs:a,asides:a.map(()=>[]),expressions:a.map(()=>null)});if(!t||t.length!==a.length)return n();let r=[],s=[],c=[],d=[];for(let h=0;h<a.length;h+=1){let p=t[h];if(p.kind==="untagged"){r.push(a[h]),s.push(d),c.push(p.expression??null),d=[];continue}let b={register:p.kind==="whisper"?"whisper":"side",text:p.text,...p.target?{target:p.target}:{}};r.length?s[s.length-1].push(b):d.push(b)}return r.length===0?n():{paragraphs:r,asides:s,expressions:c}}var Xk="\\\\([-\\\\*_~`#|>!=\\[\\]{}])|\\[([^\\]]*)\\]\\((https?:\\/\\/[^)\\s]+)\\)|`([^`\\n]+)`|==(.+?)==|~~(.+?)~~|\\*\\*\\*(.+?)\\*\\*\\*|\\*\\*(.+?)\\*\\*|__(.+?)__|(?<!\\*)\\*(?!\\*)(.+?)(?<!\\*)\\*(?!\\*)|(?<![_\\w])_([^_]+?)_(?![_\\w])";function Zr(e,t){if(t>6)return[{kind:"text",text:e}];let a=[],n=new RegExp(Xk,"g"),r=0,s,c=d=>{let h=a[a.length-1];if(h?.kind==="text"){a[a.length-1]={kind:"text",text:h.text+d};return}a.push({kind:"text",text:d})};for(;(s=n.exec(e))!==null;)s.index>r&&c(e.slice(r,s.index)),s[1]!=null?c(s[1]):s[2]!=null&&s[3]!=null?a.push({kind:"link",text:s[2],href:s[3]}):s[4]!=null?a.push({kind:"code",text:s[4]}):s[5]!=null?a.push({kind:"styled",style:"highlight",children:Zr(s[5],t+1)}):s[6]!=null?a.push({kind:"styled",style:"strikethrough",children:Zr(s[6],t+1)}):s[7]!=null?a.push({kind:"styled",style:"bold-italic",children:Zr(s[7],t+1)}):s[8]!=null?a.push({kind:"styled",style:"bold",children:Zr(s[8],t+1)}):s[9]!=null?a.push({kind:"styled",style:"underline",children:Zr(s[9],t+1)}):(s[10]!=null||s[11]!=null)&&a.push({kind:"styled",style:"italic",children:Zr(s[10]??s[11],t+1)}),r=s.index+s[0].length;return r<e.length&&c(e.slice(r)),a}function z1(e){return Zr(e,0)}function Ti(e){return typeof e=="object"&&e!==null&&!Array.isArray(e)}function V1(e){return e===null||typeof e=="string"}function O1(e){return e===null||typeof e=="number"&&Number.isFinite(e)}function $u(e){return Array.isArray(e)&&e.every(t=>typeof t=="string")}function Zk(e){return e===null?!0:Ti(e)?typeof e.ref=="string"&&typeof e.url=="string"&&typeof e.id=="string":!1}function Qk(e){if(!Ti(e)||typeof e.id!="string"||e.id.trim().length===0||typeof e.name!="string"||typeof e.category!="string"||!$u(e.capabilities)||!Ti(e.presentation)||!Ti(e.occupancy)||!Ti(e.state))return!1;let{presentation:t,occupancy:a,state:n}=e;return Zk(t.image)&&O1(t.x)&&O1(t.y)&&typeof a.playerHome=="boolean"&&V1(a.residentCharacterId)&&V1(a.homeKind)&&typeof n.condition=="string"&&$u(n.upgrades)&&$u(n.furniture)&&$u(n.publicFacts)&&typeof n.updatedAt=="string"}function I1(e){if(!Ti(e)||!Ti(e.settings)||!Array.isArray(e.settings.venues))return e;let t=e.settings.venues,a=t.filter(Qk),n=Array.isArray(e.venueRequests)?e.venueRequests:[],r=n.filter(s=>Ti(s)&&typeof s.id=="string"&&Ti(s.venueDraft)&&typeof s.venueDraft.name=="string"&&typeof s.venueDraft.category=="string");return a.length===t.length&&r.length===n.length&&n===e.venueRequests?e:{...e,venueRequests:r,settings:{...e.settings,venues:a}}}function D1(e,t,a){return e==="Enter"&&!t&&!a}function hr(){let e=globalThis.crypto;if(typeof e?.randomUUID=="function")return e.randomUUID();if(typeof e?.getRandomValues=="function"){let t=e.getRandomValues(new Uint8Array(16));t[6]=t[6]&15|64,t[8]=t[8]&63|128;let a=Array.from(t,n=>n.toString(16).padStart(2,"0")).join("");return`${a.slice(0,8)}-${a.slice(8,12)}-${a.slice(12,16)}-${a.slice(16,20)}-${a.slice(20)}`}return`${Date.now().toString(36)}-${Math.random().toString(36).slice(2,11)}`}function _1(e,t,a,n){let r=Math.max(0,a-1);return!e||e.roomId!==t?r:a>e.stepCount?e.stepCount:Math.min(n,r)}function $s(e,t){return t?.roomId===e}function H1(e,t){return e.status==="closed"&&e.submissions?.some(a=>a.id===t)===!0}function $g(e){return Object.fromEntries(e.map((t,a)=>[t,{position:e.length===3&&a===1?"center":a<Math.ceil(e.length/2)?"left":"right",expression:"",look:{target:"player"}}]))}function Ng(e){let t=(e.staging??[]).map(r=>({...r}));if(!e.speakerId||e.kind==="narration"||e.speakerId==="__venue_scene__")return t;let a=t.find(r=>r.characterId===e.speakerId)??{characterId:e.speakerId};!a.expression&&e.expression&&(a.expression=e.expression);let n=e.gazeAt||(e.kind==="whisper"?e.targetId:void 0);return!a.look&&n&&(a.look=n==="player"?{target:"player"}:{target:"villager",characterId:n}),!t.includes(a)&&(a.expression||a.look)&&t.push(a),t}function U1(e,t){return Object.fromEntries(Object.entries(e).map(([a,n])=>[a,n.look.target==="villager"&&!t.includes(n.look.characterId)?{...n,look:{target:"player"}}:n]))}function q1(e,t){let a=$g(e),n=e;return t.map(r=>{r.beforeIds&&(n=r.beforeIds,a=U1(a,n)),a={...a};for(let s of r.cues??[]){if(!n.includes(s.characterId)||!a[s.characterId])continue;let{characterId:c,...d}=s;a[c]={...a[c],...d}}return r.afterIds&&(n=r.afterIds,a=U1(a,n)),{state:a,activeIds:n}})}function L1(e,t){let a=new Map,n=new Map(e.flatMap((r,s)=>r.id?[[r.id,s]]:[]));for(let r of t){let s=(r.replyLineIds??[]).filter(b=>n.has(b));if(!s.length)continue;let c=s[0],d=s.at(-1),h=n.get(c);h>0&&e[h-1].role==="user"&&(h-=1);let p=e[h].id;p&&r.activeIdsAtTurn&&a.set(p,{...a.get(p),beforeIds:r.activeIdsAtTurn}),r.activeIdsAfterTurn&&a.set(d,{...a.get(d),afterIds:r.activeIdsAfterTurn})}return a}function B1(e,t){let a=["left","center","right"],n={};a.forEach((r,s)=>{let c=Object.keys(t).filter(d=>t[d]?.position===r);c.forEach((d,h)=>{n[d]={x:(s+(h+.5)/c.length)/3,width:Math.min(.25,.9/(3*c.length)),facing:"front"}})});for(let r of Object.keys(n))e.includes(r)||delete n[r];for(let r of e){let s=n[r];if(!s)continue;let c=t[r].look;if(c.target==="direction")s.facing=c.direction;else if(c.target==="villager"&&n[c.characterId]){let d=n[c.characterId].x;s.facing=d===s.x?"front":d<s.x?"left":"right"}}return n}function j1(e,t){return t<0||t===e?"front":t<e?"left":"right"}function Y1(e,t,a){let n=a==="front"?"front":"side",r=d=>d.expressionId===t||d.label===t||d.aliases?.includes(t),s=d=>d.isDefault||d.label==="neutral",c=e.find(d=>d.view===n&&r(d))??e.find(d=>d.view==="front"&&r(d))??e.find(r)??e.find(d=>d.view===n&&d.isDefault)??e.find(d=>d.view==="front"&&d.isDefault)??e.find(d=>d.isDefault)??e.find(d=>d.view===n&&s(d))??e.find(d=>d.view==="front"&&s(d))??e.find(d=>d.view===n)??e[0];return c?{image:c,mirrored:c.view==="side"&&a==="left"}:null}function G1(e,t,a){let n=.2*a.photoWidth/a.width,r=.2*a.photoHeight/a.height;return t.some(s=>s.x!==null&&s.y!==null&&Math.abs(s.x-e.x)<n&&Math.abs(s.y-e.y)<r)}function P1(e,t){return Math.hypot(t.x-e.x,t.y-e.y)>8||Math.abs(t.distance-e.distance)>8}var mr=(e,t,a)=>Math.min(a,Math.max(t,e));function Nu(e,t){if(!e.width||!e.height||!t.width||!t.height)return 1;let a=Math.min(t.width/e.width,t.height/e.height);return Math.max(t.width/(e.width*a),t.height/(e.height*a))}function Sg(e,t,a){if(!e.width||!e.height||!t.width||!t.height)return{left:0,top:0,width:0,height:0};let n=Math.min(t.width/e.width,t.height/e.height),r=Math.max(a.zoom,Nu(e,t)),s=e.width*n*r,c=e.height*n*r,d=t.width/2-a.centerX*s,h=t.height/2-a.centerY*c;return{left:s<=t.width?(t.width-s)/2:mr(d,t.width-s,0),top:c<=t.height?(t.height-c)/2:mr(h,t.height-c,0),width:s,height:c}}function X1(e,t,a,n,r,s){let c=Sg(e,t,a);if(!c.width||!c.height)return a;let d=Nu(e,t),h=mr(a.zoom*s,d,Math.max(4,d*2)),p=h/Math.max(a.zoom,d),b=c.width*p,$=c.height*p,f=(n.x-c.left)/c.width,y=(n.y-c.top)/c.height,V=r.x-f*b,M=r.y-y*$;return{zoom:h,centerX:mr((t.width/2-V)/b,0,1),centerY:mr((t.height/2-M)/$,0,1)}}function Z1(e,t){let a=Math.max(1,t),n=Math.max(4,a*2);return .32+1.03*((mr(e,a,n)-a)/(n-a))}function Q1(e,t){return t?Math.max(1,e):e}function kg(e,t,a){let n=Math.min(90,t.width/2),r=64,s=116,c=e.left+a.x*e.width,d=e.top+a.y*e.height,h=d+r,p=h+s<=t.height?h:d-r-s;return{left:mr(c,n,t.width-n),top:mr(p,0,Math.max(0,t.height-s))}}var o=tn(di()),i="marinara-capability-villages",F1="marinara-capability-villages-styles",Fk="/api/villages",Jk=.7,Ig=[{value:"rebuild",label:"Rebuild",description:"Begin again, together.",icon:"\u2302",premise:"On Day 1, survivors of a devastating upheaval gather to build a village together. They have a few supplies, uncertain shelter, and a reason to depend on one another."},{value:"pioneer",label:"Pioneer",description:"Follow the horizon.",icon:"\u25B3",premise:"On Day 1, a small group arrives in unfamiliar country to establish a village. They must choose a place to settle and decide what to build first."},{value:"prosper",label:"Prosper",description:"Make opportunity grow.",icon:"\u25A5",premise:"On Day 1, makers, merchants, and newcomers gather at a promising crossroads. They are choosing where to live, work, and begin trading together."},{value:"custom",label:"Custom",description:"Define your own scenario.",icon:"\u2726",premise:""},{value:"none",label:"Open beginning",description:"Write your own first day.",icon:"\u221E",premise:""}],Cg=()=>({origin:"",worldFacts:[],openingConditions:[],visualCues:[]}),Kk={"fresh-start":"People founded this village for a fresh start.",refuge:"People founded this village as a refuge.","shared-project":"People founded this village as a shared project.",discovery:"People founded this village to explore a discovery.",homecoming:"People founded this village as a homecoming.","something-else":"People founded this village for another reason."},Jr=e=>Ig.find(t=>t.value===e),Wk=e=>`/api/capability-packages/villages/assets/founding-${e}.jpg`,J1={roads:"auto",structures:"auto",water:"auto"},Su=["Village Beginning","Connections & Persona","Village Map","Build the Village","Review"],K1=1,W1=3,Tg="__villages_image_disabled__",ex=["neutral","happy","sad","angry","surprised","thinking"];function tx({jobs:e,onRetry:t}){let[a,n]=(0,m.useState)(""),[r,s]=(0,m.useState)(""),c=e.filter(d=>d.status!=="obsolete");return c.length?(0,o.jsxs)("details",{className:i+"-panel",open:c.some(d=>["failed","interrupted"].includes(d.status)),children:[(0,o.jsxs)("summary",{children:["Background work: ",c.filter(d=>d.status!=="completed").length," pending"]}),(0,o.jsx)("p",{className:i+"-hint",children:"Recurring updates run while Villages is visible. Requested work can finish while away."}),c.map(d=>(0,o.jsx)("div",{className:i+"-notice-row",children:(0,o.jsxs)("div",{className:i+"-field",children:[(0,o.jsx)("strong",{children:d.label}),(0,o.jsxs)("span",{children:[d.status,": ",d.completedSteps," saved steps, ",d.requests," requests,"," ",d.tokens===null?"token usage unavailable":d.tokens+" reported tokens"]}),d.error?(0,o.jsx)("p",{className:i+"-status",children:d.error}):null,d.connectionPaused?(0,o.jsx)("p",{className:i+"-status",children:"Automatic work on this connection is paused. A successful retry resumes it."}):null,["failed","interrupted","paused"].includes(d.status)?(0,o.jsx)("button",{type:"button",className:i+"-button",disabled:!!a,onClick:()=>{n(d.id),s(""),t(d).catch(h=>s(F(h,"Could not retry background work."))).finally(()=>n(""))},children:a===d.id?"Queuing...":d.status==="paused"?"Run now":"Retry unfinished work"}):null]})},d.id)),r?(0,o.jsx)("p",{role:"alert",className:i+"-error",children:r}):null]}):null}function ax(e,t,a,n,r=!1,s=1){let c=t==="gathering"?"Gathering Place":r?"Your residence":`Residence ${s}`;return{id:e,name:c,form:"",classes:[t],spaces:[{id:t,venueClass:t,description:"",image:null,state:{condition:"",items:[],publicFacts:[],features:[],traces:[],updatedAt:""}}],residenceCapacity:1,residentIds:[],improvements:[null,null],description:"",category:t==="gathering"?"public-center":"",presentation:{image:null,x:a,y:n},occupancy:{playerHome:r,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}}}var xx={commitment:"Promise & obligation","personal-fact":"Personal truth",preference:"Preference & boundary",relationship:"Relationship change","shared-experience":"Shared experience"};function ku(e){return e.map(t=>t.name).join(", ")||"No resident recorded"}function e2(e,t){let a=Date.parse(e)-t;if(a<=0)return"expiring now";let n=Math.floor(a/36e5),r=Math.max(1,Math.ceil(a%36e5/6e4));return n>0?`${n}h ${r}m left`:`${r}m left`}function t2({library:e,busy:t,onRefresh:a,onForget:n}){let[r,s]=(0,m.useState)("all"),[c,d]=(0,m.useState)(""),[h,p]=(0,m.useState)(""),[b,$]=(0,m.useState)(null),[f,y]=(0,m.useState)(""),V=Date.now(),M=(w,R)=>(!h.trim()||`${w} ${R.map(H=>H.name).join(" ")}`.toLowerCase().includes(h.trim().toLowerCase()))&&(!c||R.some(H=>H.id===c)),O=(e?.recollections??[]).filter(w=>M(w.text,[...w.subjects,...w.knownBy])),N=(e?.durable??[]).filter(w=>M(w.text,[...w.subjects,...w.knownBy])),v=async(w,R)=>{try{let H=await L(`/rooms/archive/${encodeURIComponent(w)}`);$({visit:H.visit,lineIds:R}),y("")}catch(H){$(null),y(F(H,"The source visit could not be read."))}};return(0,o.jsxs)("div",{className:`${i}-memory-library`,children:[(0,o.jsxs)("section",{className:`${i}-memory-hero`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("span",{className:`${i}-memory-kicker`,children:"Continuity, with receipts"}),(0,o.jsx)("h3",{children:"What your villagers carry forward"}),(0,o.jsx)("p",{children:"Passing recollections keep conversations coherent for 24 hours. Durable memories survive because an end-of-visit review found lasting meaning. Exact transcripts remain separate and are never used as hidden character knowledge."})]}),(0,o.jsxs)("div",{className:`${i}-memory-stats`,children:[(0,o.jsxs)("span",{children:[(0,o.jsx)("strong",{children:e?.recollections.length??0})," passing"]}),(0,o.jsxs)("span",{children:[(0,o.jsx)("strong",{children:e?.durable.length??0})," durable"]}),(0,o.jsxs)("span",{children:[(0,o.jsx)("strong",{children:e?.archive.total??0})," archived visits"]})]})]}),(0,o.jsxs)("div",{className:`${i}-memory-layers`,"aria-label":"How Villages memory works",children:[(0,o.jsxs)("article",{children:[(0,o.jsx)("span",{children:"01"}),(0,o.jsx)("strong",{children:"Passing"}),(0,o.jsx)("p",{children:"Useful context with a visible 24-hour expiry."})]}),(0,o.jsxs)("article",{children:[(0,o.jsx)("span",{children:"02"}),(0,o.jsx)("strong",{children:"Durable"}),(0,o.jsx)("p",{children:"Promises, truths, boundaries, bonds, and significant experiences."})]}),(0,o.jsxs)("article",{children:[(0,o.jsx)("span",{children:"03"}),(0,o.jsx)("strong",{children:"Archive"}),(0,o.jsx)("p",{children:"Word-for-word evidence, stored independently from character memory."})]})]}),e?.archive.pendingReviewCount?(0,o.jsxs)("div",{className:`${i}-memory-health`,role:"status",children:[(0,o.jsx)("span",{children:"\u25C7"}),(0,o.jsxs)("div",{children:[(0,o.jsxs)("strong",{children:[e.archive.pendingReviewCount," visit review pending"]}),(0,o.jsx)("p",{children:"The transcript is safe. Villages will retry without holding the room."})]}),(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:t,onClick:a,children:"Retry now"})]}):null,(0,o.jsxs)("div",{className:`${i}-memory-toolbar`,children:[(0,o.jsx)("div",{className:`${i}-memory-tabs`,role:"group","aria-label":"Memory type",children:[["all","All"],["passing","Passing"],["durable","Durable"]].map(([w,R])=>(0,o.jsx)("button",{type:"button","data-active":r===w,onClick:()=>s(w),children:R},w))}),(0,o.jsx)("input",{type:"search",value:h,onChange:w=>p(w.target.value),placeholder:"Search memories\u2026","aria-label":"Search memories"}),(0,o.jsxs)("select",{value:c,onChange:w=>d(w.target.value),"aria-label":"Filter memories by resident",children:[(0,o.jsx)("option",{value:"",children:"Everyone"}),(e?.residents??[]).map(w=>(0,o.jsx)("option",{value:w.id,children:w.name},w.id))]}),(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:t,onClick:a,children:"Refresh"})]}),e===null?(0,o.jsx)("p",{className:`${i}-empty`,children:"Reading the village\u2019s memory layers\u2026"}):null,e&&r!=="durable"&&O.length>0?(0,o.jsxs)("section",{className:`${i}-memory-section`,children:[(0,o.jsxs)("div",{className:`${i}-memory-section-head`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("span",{className:`${i}-memory-orb`,"data-kind":"passing",children:"\u25CC"}),(0,o.jsx)("h3",{children:"Passing recollections"})]}),(0,o.jsx)("span",{children:"Quiet context \xB7 expires naturally"})]}),(0,o.jsx)("div",{className:`${i}-memory-grid`,children:O.map(w=>{let R=w.evidence[w.evidence.length-1]??{visitId:w.visitId,lineIds:[]};return(0,o.jsxs)("article",{className:`${i}-memory-card`,"data-kind":"passing",children:[(0,o.jsxs)("div",{className:`${i}-memory-card-top`,children:[(0,o.jsx)("span",{className:`${i}-memory-pill`,children:"Passing"}),(0,o.jsx)("span",{children:e2(w.expiresAt,V)})]}),(0,o.jsx)("p",{className:`${i}-memory-text`,children:w.text}),(0,o.jsxs)("dl",{children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("dt",{children:"About"}),(0,o.jsx)("dd",{children:ku(w.subjects)})]}),(0,o.jsxs)("div",{children:[(0,o.jsx)("dt",{children:"Known by"}),(0,o.jsx)("dd",{children:ku(w.knownBy)})]})]}),w.reinforcementCount>0?(0,o.jsxs)("p",{className:`${i}-memory-reinforced`,children:["\u21BB Reinforced ",w.reinforcementCount," ",w.reinforcementCount===1?"time":"times"]}):null,(0,o.jsxs)("div",{className:`${i}-memory-card-actions`,children:[(0,o.jsx)("button",{type:"button",onClick:()=>{v(R.visitId,R.lineIds)},children:"View evidence"}),(0,o.jsx)("button",{type:"button",disabled:t,onClick:()=>n("recollections",w.id),children:"Let go"})]})]},w.id)})})]}):null,e&&r!=="passing"&&N.length>0?(0,o.jsxs)("section",{className:`${i}-memory-section`,children:[(0,o.jsxs)("div",{className:`${i}-memory-section-head`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("span",{className:`${i}-memory-orb`,"data-kind":"durable",children:"\u2726"}),(0,o.jsx)("h3",{children:"Durable memories"})]}),(0,o.jsx)("span",{children:"Lasting meaning \xB7 no arbitrary visit quota"})]}),(0,o.jsx)("div",{className:`${i}-memory-grid`,children:N.map(w=>(0,o.jsxs)("article",{className:`${i}-memory-card`,"data-kind":"durable",children:[(0,o.jsxs)("div",{className:`${i}-memory-card-top`,children:[(0,o.jsx)("span",{className:`${i}-memory-pill`,children:w.memoryCategory?xx[w.memoryCategory]:w.kind==="favour"?"Fulfilled wish":"Legacy memory"}),(0,o.jsxs)("span",{children:[w.dateLabel,nx(w)?` \xB7 ${nx(w)}`:""]})]}),(0,o.jsx)("p",{className:`${i}-memory-text`,children:w.text}),(0,o.jsxs)("dl",{children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("dt",{children:"About"}),(0,o.jsx)("dd",{children:ku(w.subjects)})]}),(0,o.jsxs)("div",{children:[(0,o.jsx)("dt",{children:"Known by"}),(0,o.jsx)("dd",{children:ku(w.knownBy)})]})]}),(0,o.jsxs)("div",{className:`${i}-memory-card-actions`,children:[w.evidence?(0,o.jsx)("button",{type:"button",onClick:()=>{v(w.evidence.visitId,w.evidence.lineIds)},children:"View evidence"}):(0,o.jsx)("span",{className:`${i}-memory-legacy`,children:"No evidence link on this older memory"}),(0,o.jsx)("button",{type:"button",disabled:t,onClick:()=>n("durable",w.id),children:"Forget"})]})]},w.id))})]}):null,e&&(r!=="durable"&&O.length||r!=="passing"&&N.length)===0?(0,o.jsxs)("div",{className:`${i}-memory-empty`,children:[(0,o.jsx)("span",{children:"\u2727"}),(0,o.jsx)("h3",{children:"No memories match"}),(0,o.jsx)("p",{children:"Try another resident, phrase, or memory layer."})]}):null,e?.expiredRecollectionCount?(0,o.jsxs)("p",{className:`${i}-memory-footnote`,children:[e.expiredRecollectionCount," expired passing recollection",e.expiredRecollectionCount===1?" is":"s are"," waiting for routine cleanup."]}):null,f?(0,o.jsx)("p",{className:`${i}-error`,role:"alert",children:f}):null,b?(0,o.jsxs)("section",{className:`${i}-memory-evidence`,children:[(0,o.jsxs)("div",{className:`${i}-memory-section-head`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("span",{className:`${i}-memory-orb`,"data-kind":"archive",children:"\u2301"}),(0,o.jsxs)("h3",{children:["Exact evidence \xB7 ",b.visit.placeName]})]}),(0,o.jsx)("button",{type:"button",onClick:()=>$(null),"aria-label":"Close evidence",children:"\xD7"})]}),(0,o.jsx)("p",{children:"Only the cited archive lines are shown. The full visit remains in DEBUG \u2192 Venue Visits."}),(0,o.jsx)("ol",{children:b.visit.lines.filter(w=>b.lineIds.includes(w.id)).map(w=>(0,o.jsxs)("li",{children:[(0,o.jsxs)("span",{children:[(0,o.jsx)("strong",{children:w.name||"Player"}),(0,o.jsxs)("small",{children:[Au(w.at)," \xB7 heard by"," ",w.heardBy.map(R=>b.visit.participants.find(H=>H.characterId===R)?.name??R).join(", ")||"no one"]})]}),Cs(w.content,`memory-evidence-${w.id}-`)]},w.id))})]}):null]})}function Au(e){if(e.length===0)return"";let t=new Date(e);return Number.isNaN(t.getTime())?"":kx.format(t)}function nx(e){return Au(e.occurredAt)}function a2(e,t){return e.find(a=>a.id===t)?.name??"a place that is gone"}function ix(e){return`${String(Math.floor(e/60)).padStart(2,"0")}:${String(e%60).padStart(2,"0")}`}function Eg(e){let t=e.agenda?.activeDay;if(!t)return!1;let a=(e.ingestSchedule?e.agenda?.scheduleWeek?.[t.weekday]:void 0)??e.agenda?.week?.[t.weekday];return!!a&&JSON.stringify(t.blocks)!==JSON.stringify(a)}var n2=new Intl.DateTimeFormat(void 0,{day:"numeric",month:"short"});function i2(e,t){let a=[],n=Date.parse(e);if(Number.isFinite(n)){let s=Math.floor((Date.now()-n)/864e5);a.push(s<=0?"written today":s===1?"written yesterday":`written ${s} days ago`)}let r=Date.parse(t);return a.push(Number.isFinite(r)?`fades ${n2.format(new Date(r))}`:"no set end"),a.join(" \xB7 ")}function r2(e,t){let a=e.find(n=>n.id===t.placeId);return a?t.area==="outside"?a.presentation.image?.url??"":t.zoneId&&a.zones?a.zones.find(n=>n.id===t.zoneId)?.image?.url??"":t.area==="private"?a.privateSpaces?.find(n=>n.ownerId===t.privateOwnerId)?.image?.url??"":(t.spaceClass?mn(a,t.spaceClass).image:null)?.url??"":""}var Dg=class extends m.Component{constructor(){super(...arguments);zc(this,"state",{error:null})}static getDerivedStateFromError(a){return{error:a}}componentDidCatch(a){let n=a.message||"Villages could not open.";this.props.element.capabilityRuntimeError=n,this.props.element.dispatchEvent(new CustomEvent("marinara-capability-runtime-error",{detail:{message:n},bubbles:!0})),console.error("Villages client capability stopped",a)}render(){return this.state.error?(0,o.jsx)("div",{className:`${i}-root`,role:"alert",children:(0,o.jsxs)("section",{className:`${i}-panel`,children:[(0,o.jsx)("h1",{className:`${i}-panel-title`,children:"Villages could not open"}),(0,o.jsx)("p",{className:`${i}-error`,children:this.state.error.message||"An unexpected client error occurred."}),(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{this.props.element.capabilityRuntimeError=null,this.setState({error:null})},children:"Try again"})]})}):this.props.children}},Ag=`
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
/* Villages' current UI language: dark navy, blue glass surfaces, violet focus.
   These scoped values can become a selectable theme palette in a later release. */
.${i}-root[data-venue-view="true"] {
  --venue-bg: #091431;
  --venue-panel: #132653;
  --venue-border: #2d4a91;
  --venue-text: #f3f4ff;
  --venue-muted: #c0c9ee;
  --venue-accent: #7545fb;
  display: grid; grid-template-columns: clamp(13rem, 18cqw, 16rem) minmax(0, 1fr);
  grid-template-rows: auto minmax(0, 1fr); gap: 0; padding: 0;
  background: radial-gradient(circle at 78% 25%, #172d61 0, transparent 52%), linear-gradient(120deg, #09132f, #0e1e43);
  color: var(--venue-text);
}
.${i}-root[data-venue-view="true"] > .${i}-header {
  grid-column: 2; grid-row: 1; align-items: center; padding: 1.25rem 1.5rem .75rem;
}
.${i}-root[data-venue-view="true"] .${i}-venue-header-controls { display: flex; flex-direction: column; align-items: flex-end; gap: .5rem; min-width: 0; }
.${i}-root[data-venue-view="true"] .${i}-actions { flex-wrap: wrap; justify-content: flex-end; }
.${i}-venue-move-error { max-width: 27rem; margin: 0; color: #ffb7c1; font-size: .8rem; line-height: 1.4; text-align: right; }
.${i}-root[data-venue-view="true"] .${i}-title { font-size: clamp(1.35rem, 2.4cqw, 2rem); font-weight: 700; }
.${i}-root[data-venue-view="true"] .${i}-subtitle { color: var(--venue-muted); font-size: .88rem; }
.${i}-root[data-venue-view="true"] .${i}-header .${i}-button,
.${i}-venue-back {
  border: 1px solid #6478c1; border-radius: .7rem; background: #142653;
  color: var(--venue-text); padding: .65rem .9rem; font: inherit; cursor: pointer;
}
.${i}-root[data-venue-view="true"] .${i}-header .${i}-button:hover,
.${i}-venue-back:hover { border-color: #aa92ff; background: #203774; }
.${i}-root[data-venue-view="true"] > .${i}-venue-page { display: contents; }
.${i}-venue-zones {
  grid-column: 1; grid-row: 1 / span 2; display: flex; flex-direction: column; gap: .65rem;
  min-height: 0; overflow-y: auto; padding: 1rem .65rem;
  border-right: 1px solid #314782;
  background: radial-gradient(circle at 30% 85%, #274588, transparent 65%), linear-gradient(#10214a, #142a5b);
}
.${i}-venue-back { min-height: 2.7rem; margin: 0 .1rem 1rem; }
.${i}-venue-zone-tab {
  display: flex; align-items: center; gap: .65rem; min-width: 0; width: 100%;
  border: 1px solid transparent; border-radius: .72rem; padding: .45rem;
  background: transparent; color: var(--venue-text); text-align: left; font: inherit; cursor: pointer;
}
.${i}-venue-zone-tab:hover { background: #253b75; }
.${i}-venue-zone-tab[data-active="true"] {
  border-color: #8060ff; background: linear-gradient(105deg, #5139b4, #253c8d);
  box-shadow: 0 0 0 2px #8756ff, 0 0 1.1rem #683cf977;
}
.${i}-venue-zone-tab:focus-visible, .${i}-venue-back:focus-visible,
.${i}-venue-visit:focus-visible { outline: 3px solid #b6a2ff; outline-offset: 2px; }
.${i}-venue-zone-thumb {
  flex: 0 0 3.4rem; display: grid; place-items: center; width: 3.4rem; height: 3.4rem;
  overflow: hidden; border: 1px solid #5570b0; border-radius: .42rem; background: #18254d;
}
.${i}-venue-zone-thumb img { width: 100%; height: 100%; object-fit: cover; }
.${i}-venue-zone-thumb > span { font-size: 1.5rem; color: #b5c3ec; }
.${i}-venue-zone-copy { min-width: 0; }
.${i}-venue-zone-copy strong, .${i}-venue-zone-copy small { display: block; overflow-wrap: anywhere; }
.${i}-venue-zone-copy strong { font-size: .78rem; line-height: 1.3; }
.${i}-venue-zone-copy small { color: var(--venue-muted); font-size: .68rem; line-height: 1.35; }
.${i}-venue-zone-content {
  grid-column: 2; grid-row: 2; display: grid; grid-template-columns: minmax(0, 1.45fr) minmax(16rem, 1fr);
  align-items: start; gap: 1rem; min-width: 0; padding: .75rem 1.5rem 1.5rem;
}
.${i}-venue-zone-main { display: flex; flex-direction: column; gap: 1rem; min-width: 0; }
.${i}-venue-artwork { overflow: hidden; border: 1px solid var(--venue-border); border-radius: .85rem; background: #0c1732; }
.${i}-venue-artwork img, .${i}-venue-artwork-empty {
  display: block; width: 100%; aspect-ratio: 16 / 10; object-fit: cover;
}
.${i}-venue-artwork-empty { display: grid; place-items: center; color: var(--venue-muted); text-align: center; }
.${i}-venue-zone-context {
  min-width: 0; border: 1px solid var(--venue-border); border-radius: .8rem;
  background: linear-gradient(145deg, #142753, #101e42); padding: 1rem 1.15rem;
}
.${i}-venue-zone-context h2 { margin: 0 0 .55rem; font-size: 1.2rem; }
.${i}-venue-zone-context p { margin: 0; color: var(--venue-muted); line-height: 1.6; }
.${i}-venue-more { margin-top: 1rem; border: 1px solid var(--venue-border); border-radius: .6rem; padding: .7rem .9rem; }
.${i}-venue-more summary { cursor: pointer; }
.${i}-venue-more p { margin-top: .65rem; }
.${i}-venue-zone-context { display: flex; flex-direction: column; min-height: min(31rem, 63cqh); }
.${i}-venue-kicker { color: #b9c5ff; font-size: .72rem; text-transform: uppercase; letter-spacing: .08em; }
.${i}-venue-zone-stat { display: flex; justify-content: space-between; gap: .65rem; border-top: 1px solid #29447f; margin-top: 1.1rem; padding: 1rem 0 0; }
.${i}-venue-zone-stat span { color: var(--venue-muted); }
.${i}-venue-zone-stat strong { font-weight: 500; text-align: right; }
.${i}-venue-zone-guidance { margin-top: 1rem !important; font-size: .85rem; }
.${i}-venue-visit {
  width: 100%; min-height: 3.25rem; margin-top: auto; border: 0; border-radius: .55rem;
  background: linear-gradient(100deg, #3156e8, var(--venue-accent));
  color: white; font: inherit; font-size: 1rem; font-weight: 700; cursor: pointer;
}
.${i}-venue-visit:disabled { opacity: .48; cursor: default; }
@container (max-width: 48rem) {
  .${i}-root[data-venue-view="true"] { display: flex; flex-direction: column; }
  .${i}-root[data-venue-view="true"] > .${i}-header { order: 0; padding: 1rem; }
  .${i}-root[data-venue-view="true"] .${i}-venue-header-controls { align-items: flex-start; }
  .${i}-root[data-venue-view="true"] .${i}-actions { justify-content: flex-start; }
  .${i}-root[data-venue-view="true"] .${i}-venue-move-error { text-align: left; }
  .${i}-root[data-venue-view="true"] > .${i}-venue-page { order: 1; display: flex; flex-direction: column; margin: 0; }
  .${i}-venue-zones { order: 0; flex-direction: row; overflow-x: auto; overflow-y: hidden; padding: .7rem; border-right: 0; border-bottom: 1px solid #314782; }
  .${i}-venue-back { flex: 0 0 auto; margin: 0; }
  .${i}-venue-zone-tab { flex: 0 0 11rem; }
  .${i}-venue-zone-content { order: 2; display: flex; flex-direction: column; width: 100%; box-sizing: border-box; padding: 1rem; }
  .${i}-venue-zone-main, .${i}-venue-zone-context { width: 100%; box-sizing: border-box; }
  .${i}-venue-zone-context { min-height: 0; gap: .25rem; }
  .${i}-venue-visit { margin-top: 1rem; }
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
.villages-founding-backdrop { position:fixed; inset:0; z-index:1000; display:flex; align-items:center; justify-content:center; background:#070b1bd9; }
.villages-founding-dialog { width:min(42rem,94vw); max-height:90dvh; display:flex; flex-direction:column; background:#14213c; border:1px solid #596b9b; border-radius:1rem; color:#f3f5ff; overflow:hidden; }
.villages-founding-dialog footer button:last-child {background:#7461d5;}
.villages-founding-dialog header,.villages-founding-dialog footer { flex:none; padding:1rem; background:#192c4c; }
.villages-founding-dialog footer { display:flex; gap:.5rem; flex-wrap:wrap; }
.villages-founding-dialog footer button { flex:1; min-height:44px; }
.villages-founding-editor-body { flex:1; padding:1rem; min-height:0; overflow:auto; overscroll-behavior:contain; }
.villages-founding-dialog label,.villages-scenery-fields label,.villages-private-fields label { display:flex; gap:.5rem; flex-wrap:wrap; margin:.7rem 0; }
.villages-founding-dialog input:not([type="checkbox"]),.villages-founding-dialog textarea,.villages-founding-dialog select,.villages-scenery-fields textarea,.villages-scenery-fields select { width:100%; min-height:44px; font:inherit; background:#0c1830; color:#f3f5ff; border:1px solid #65799c; border-radius:.4rem; padding:.5rem; box-sizing:border-box; }
.villages-founding-dialog textarea { min-height:6rem; }
.villages-founding-dialog button { min-height:44px; background:#493d83; color:#fff; border:1px solid #8072bf; border-radius:.5rem; padding:.5rem; font:inherit; }
.villages-founding-dialog fieldset,.villages-scenery-fields,.villages-private-fields fieldset { border:1px solid #51688c; border-radius:.5rem; margin:.75rem 0; }
@media(max-width:704px) { .villages-founding-dialog { width:100%; height:100%; max-height:100dvh; border-radius:0; border:0; } .villages-founding-dialog footer { padding-bottom:max(.75rem,env(safe-area-inset-bottom)); } }
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
.${i}-project-screen { display: grid; gap: 1.25rem; min-height: 0; color: #eef2ff; }
.${i}-project-head { display: flex; justify-content: space-between; align-items: start; gap: 1rem; padding: .25rem .25rem .5rem; }
.${i}-project-head h2 { font-size: clamp(1.5rem, 3vw, 2.2rem); margin: .25rem 0; color: #f6f4ff; }
.${i}-project-head p { margin: 0; color: #adbee8; }
.${i}-project-eyebrow { color: #b8adff; font-size: .72rem; font-weight: 800; letter-spacing: .12em; }
.${i}-project-slots { display: grid; grid-template-columns: repeat(2, minmax(0, 1fr)); gap: 1rem; }
.${i}-project-slot, .${i}-project-card { border: 1px solid #3f59ab; border-radius: 1rem; background: linear-gradient(145deg, #182b62, #101d44); box-shadow: 0 1rem 2rem #070e2b44; color: #f1f3ff; }
.${i}-project-slot { display: grid; gap: .6rem; min-height: 11rem; text-align: left; padding: 1.3rem; cursor: pointer; }
.${i}-project-slot:hover, .${i}-project-slot:focus-visible { border-color: #a78bfa; box-shadow: 0 0 0 2px #8d6cf6; }
.${i}-project-slot span { color: #aa9eff; font-size: .78rem; font-weight: 800; letter-spacing: .1em; }
.${i}-project-slot strong { font-size: 1.3rem; }
.${i}-project-slot small { color: #b8c6eb; }
.${i}-project-create { grid-column: 1 / -1; }
.${i}-project-layout { display: grid; grid-template-columns: minmax(10rem, 13rem) minmax(19rem, 1fr); gap: 1rem; align-items: start; min-height: 0; }
.${i}-project-rail { display: grid; gap: .6rem; }
.${i}-project-step { display: flex; align-items: center; gap: .7rem; color: #8da2d4; padding: .7rem; border-radius: .7rem; }
.${i}-project-step b { display: grid; place-items: center; flex: 0 0 2.3rem; height: 2.3rem; border: 1px solid #6480cd; border-radius: 50%; }
.${i}-project-step[data-state="active"] { color: white; background: linear-gradient(110deg, #344af1, #192c69); }
.${i}-project-step[data-state="active"] b { background: #8b4cf4; border-color: #8b4cf4; }
.${i}-project-step[data-state="done"] { color: #b8d6ff; }
.${i}-project-card { display: grid; gap: .85rem; padding: 1.25rem; }
.${i}-project-card h3, .${i}-project-card h4 { margin: 0; }
.${i}-project-card p { margin: .1rem 0; line-height: 1.45; color: #c7d4f6; }
.${i}-project-card label { display: grid; gap: .4rem; font-weight: 650; }
.${i}-project-card input:not([type="file"]), .${i}-project-card select, .${i}-project-card textarea { width: 100%; box-sizing: border-box; border: 1px solid #5470bf; border-radius: .55rem; background: #172b60; color: #f4f6ff; padding: .7rem; font: inherit; }
.${i}-project-card textarea { min-height: 7rem; resize: vertical; }
.${i}-project-card > .${i}-button { background: linear-gradient(100deg, #3656f6, #9448ef); color: white; min-height: 2.75rem; }
.${i}-project-material { display: grid; gap: .35rem; border: 1px solid #425ba1; border-radius: .65rem; padding: .7rem; }
.${i}-project-material span { color: #b6c5ea; }
.${i}-project-finish-visit { display: grid; gap: 1rem; max-width: 62rem; margin: 0 auto; padding: 1.25rem; border: 1px solid #536cc0; border-radius: 1rem; background: #142657; color: #f4f6ff; }
.${i}-project-finish-visit header { display: grid; gap: .5rem; }
.${i}-project-finish-visit h2, .${i}-project-finish-visit p { margin: 0; }
.${i}-project-finish-visit label { display: grid; gap: .4rem; }
.${i}-project-finish-visit input:not([type="file"]), .${i}-project-finish-visit textarea { width: 100%; box-sizing: border-box; border: 1px solid #5470bf; border-radius: .55rem; background: #172b60; color: #f4f6ff; padding: .7rem; font: inherit; }
.${i}-project-finish-visit textarea { min-height: 7rem; }
.${i}-project-image { display: grid; gap: .5rem; border-top: 1px solid #425ba1; padding-top: .8rem; }
.${i}-project-image img { max-width: min(100%, 20rem); aspect-ratio: 3 / 2; object-fit: cover; border-radius: .5rem; }
.${i}-project-footer { display: flex; justify-content: flex-start; border-top: 1px solid #425ba1; padding-top: .8rem; }
@media (max-width: 700px) { .${i}-project-slots, .${i}-project-layout { grid-template-columns: 1fr; } .${i}-project-rail { display: flex; overflow-x: auto; } .${i}-project-step { flex: 0 0 9rem; } }
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
.${i}-room-screen .${i}-chat-cast[data-staging="true"] > .${i}-chat-cast-person,
.${i}-room-screen .${i}-chat-cast[data-staging="true"] > .${i}-chat-cast-person[data-active="true"] { position: absolute; bottom: 0; left: var(--cast-left); width: var(--cast-width); flex: none; max-width: none; height: 100%; transition: left .22s ease, opacity .18s ease, filter .18s ease, transform .18s ease; }
.${i}-room-screen .${i}-chat-cast[data-staging="true"][data-animate="false"] > .${i}-chat-cast-person { transition: none; }
@media (prefers-reduced-motion: reduce) {
  .${i}-room-screen .${i}-chat-cast[data-staging="true"] > .${i}-chat-cast-person { transition: none; }
}
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
/* Mobile artwork grows independently of the staging slots. Shared zones may overlap,
   but the image boxes stay within the floor and the speaker paints above listeners. */
.${i}-room-screen[data-mobile="true"] .${i}-chat-stage .${i}-chat-cast > .${i}-chat-cast-person,
.${i}-room-screen[data-mobile="true"] .${i}-chat-stage .${i}-chat-cast > .${i}-chat-cast-person[data-active="true"] {
  --cast-display-width: var(--cast-width, 25%);
  position: absolute; bottom: 0; flex: none; max-width: none;
  width: var(--cast-display-width); height: 100%;
  left: clamp(0px, calc(var(--cast-center) - var(--cast-display-width) / 2), calc(100% - var(--cast-display-width)));
  transform: none;
}
.${i}-room-screen[data-mobile="true"] .${i}-chat-stage .${i}-chat-cast > .${i}-chat-cast-person[data-sprite="true"] {
  --cast-display-width: min(70cqw, 66.666667cqh);
}
.${i}-room-screen[data-mobile="true"] .${i}-chat-cast-person > img { flex: 0 0 auto; }
.${i}-room-screen[data-mobile="true"] .${i}-chat-cast-person > img[data-framing="half"] { object-fit: cover; object-position: center top; }
@media (prefers-reduced-motion: reduce) { .${i}-room-screen .${i}-chat-cast-person { transition: none; } }

/* The Menu shares View Venue's palette and keeps its navigation on screen. */
.${i}-root.${i}-sectioned-menu {
  --background: #0b1938;
  --foreground: #f3f4ff;
  --popover: #142753;
  --muted: #1d3567;
  --muted-foreground: #c0c9ee;
  --border: #38569a;
  --primary: #ac90ff;
  --primary-foreground: #fff;
  --destructive: #ffb7c1;
  box-sizing: border-box;
  display: grid;
  grid-template-columns: clamp(13rem, 20cqw, 17rem) minmax(0, 1fr);
  grid-template-rows: auto minmax(0, 1fr);
  gap: 0;
  overflow: hidden;
  padding: 0;
  background: radial-gradient(circle at 82% 20%, #1b346d 0, transparent 50%), linear-gradient(120deg, #09132f, #0e1e43);
  color: var(--foreground);
}
.${i}-sectioned-menu > .${i}-header {
  grid-column: 1 / -1; grid-row: 1; align-items: center; min-height: 4.5rem; padding: .8rem 1.25rem;
  border-bottom: 1px solid #314782; background: #101f48e8;
}
.${i}-sectioned-menu .${i}-title { font-size: clamp(1.3rem, 2.4cqw, 2rem); font-weight: 700; }
.${i}-sectioned-menu .${i}-subtitle { color: var(--muted-foreground); font-size: .82rem; }
.${i}-sectioned-menu > .${i}-header > .${i}-error { flex-basis: 100%; margin: 0; }
.${i}-sectioned-menu .${i}-menu-nav {
  grid-column: 1; grid-row: 2; display: flex; flex-direction: column; gap: 1rem; min-height: 0; overflow-y: auto;
  padding: 1rem .7rem; border-right: 1px solid #314782;
  background: radial-gradient(circle at 25% 85%, #274588, transparent 65%), linear-gradient(#10214a, #142a5b);
}
.${i}-sectioned-menu .${i}-menu-group { gap: .45rem; }
.${i}-sectioned-menu .${i}-menu-group > .${i}-panel-title {
  padding: .1rem .5rem; color: #b9c5ff; font-size: .7rem;
}
.${i}-sectioned-menu .${i}-menu-group-buttons { flex-direction: column; align-items: stretch; gap: .25rem; }
.${i}-sectioned-menu .${i}-menu-nav .${i}-button {
  min-height: 2.45rem; border-color: transparent; background: transparent;
  color: var(--foreground); text-align: left; font-size: .85rem;
}
.${i}-sectioned-menu .${i}-menu-nav .${i}-button:hover { border-color: #6a7fc4; background: #253b75; color: white; }
.${i}-sectioned-menu .${i}-menu-nav .${i}-button[data-active="true"] {
  border-color: #8060ff; background: linear-gradient(105deg, #5139b4, #253c8d);
  color: white; box-shadow: 0 0 0 1px #8756ff, 0 0 1rem #683cf955;
}
.${i}-menu-content {
  grid-column: 2; grid-row: 2; box-sizing: border-box; min-width: 0; min-height: 0; overflow-x: hidden; overflow-y: auto;
  padding: clamp(.75rem, 2cqw, 1.5rem);
}
.${i}-menu-content.${i}-panel,
.${i}-menu-content > .${i}-panel,
.${i}-menu-content .${i}-overlay {
  border: 1px solid var(--border); border-radius: .85rem;
  background: linear-gradient(145deg, #172c5e, #101f45); color: var(--foreground);
}
.${i}-menu-content .${i}-panel-title { color: #c7d2ff; font-size: .74rem; }
.${i}-menu-content .${i}-button { min-height: 2.35rem; background: #172d60; color: var(--foreground); font-size: .85rem; }
.${i}-menu-content .${i}-button:hover { border-color: #aa92ff; background: #203774; color: white; }
.${i}-menu-content .${i}-hint,
.${i}-menu-content .${i}-empty,
.${i}-menu-content .${i}-status { font-size: .82rem; line-height: 1.5; }
.${i}-sectioned-menu .${i}-button:focus-visible,
.${i}-sectioned-menu input:focus-visible,
.${i}-sectioned-menu select:focus-visible,
.${i}-sectioned-menu textarea:focus-visible { outline: 3px solid #b6a2ff; outline-offset: 2px; }
.${i}-menu-content input:not([type="checkbox"]):not([type="radio"]),
.${i}-menu-content select, .${i}-menu-content textarea {
  border-color: #5570b0; background: #0c1c42; color: var(--foreground); font-size: .85rem;
}
.${i}-menu-content input::placeholder, .${i}-menu-content textarea::placeholder { color: #aebce3; }
.${i}-menu-content .${i}-notice-row { border-color: #526bb1; background: #1c3568; color: var(--foreground); }
.${i}-menu-content .${i}-notice-author { color: #d9e1ff; }
.${i}-menu-content .${i}-menu-body { gap: 1rem; }
.${i}-sectioned-menu > .${i}-panel.${i}-menu-content { margin: clamp(.75rem, 2cqw, 1.5rem); }
.${i}-menu-welcome { display: grid; align-self: start; gap: .9rem; max-width: 50rem; padding: 1.5rem; }
.${i}-menu-welcome h2 { margin: 0; font-size: clamp(1.4rem, 3cqw, 2.2rem); }
.${i}-menu-welcome p { max-width: 40rem; margin: 0; color: var(--muted-foreground); line-height: 1.6; }
.${i}-menu-quick-links { display: flex; flex-wrap: wrap; gap: .6rem; margin-top: .4rem; }
.${i}-menu-debug-action { display: flex; flex-wrap: wrap; align-items: center; gap: .6rem; margin-bottom: 1rem; }
.${i}-menu-debug-action .${i}-status { margin: 0; flex: 1 1 15rem; }
@container (max-width: 48rem) {
  .${i}-root.${i}-sectioned-menu { grid-template-columns: minmax(0, 1fr); grid-template-rows: auto auto minmax(0, 1fr); }
  .${i}-sectioned-menu .${i}-menu-nav {
    grid-column: 1; grid-row: 2; flex-direction: row; gap: 1.25rem; max-height: 7.5rem;
    overflow-x: auto; overflow-y: hidden; padding: .6rem .75rem;
    border-right: 0; border-bottom: 1px solid #314782;
  }
  .${i}-sectioned-menu .${i}-menu-group { flex: 0 0 auto; }
  .${i}-sectioned-menu .${i}-menu-group-buttons { flex-direction: row; flex-wrap: nowrap; }
  .${i}-sectioned-menu .${i}-menu-nav .${i}-button { flex: 0 0 auto; min-height: 2.5rem; white-space: nowrap; }
  .${i}-menu-content { grid-column: 1; grid-row: 3; padding: .75rem; }
  .${i}-sectioned-menu > .${i}-header { padding: .75rem; }
}
`;function _g(){let e=document.getElementById(F1);if(!document.querySelector(i)){e?.remove();return}if(e){e.textContent!==Ag&&(e.textContent=Ag);return}let t=document.createElement("style");t.id=F1,t.textContent=Ag,document.head.appendChild(t)}var o2=new MutationObserver(()=>{document.querySelector(i)&&_g()});o2.observe(document.head,{childList:!0,subtree:!0});var s2="marinara_admin_secret";function $x(e){let t=new Headers(e?.headers);try{let a=window.localStorage.getItem(s2)?.trim();a&&t.set("X-Admin-Secret",a)}catch{}return typeof e?.body=="string"&&!t.has("Content-Type")&&t.set("Content-Type","application/json"),t}var l2="This action needs loopback access or admin access. Open the app through localhost, or set ADMIN_SECRET=<secret> in the server .env and paste the same value in Settings \u2192 Advanced \u2192 Admin Access. Marinara sends it as the X-Admin-Secret header.",rc=class extends Error{constructor(a,n,r){super(a);zc(this,"status",n);zc(this,"code",r)}};function Nx(e,t,a){let n=e?.error,r=typeof n=="string"&&n?n:a;return t===403&&/admin[-_ ]?secret/iu.test(r)?new Error(`${l2} (${r})`):new rc(r,t,e?.code)}async function L(e,t){let a=await fetch(`${Fk}${e}`,{...t,headers:$x(t)}),n=await a.json().catch(()=>null);if(!a.ok)throw Nx(n,a.status,`The village replied ${a.status}.`);return I1(n)}async function Ug(e,t){let a=await fetch(e,{cache:"no-store",credentials:"same-origin",...t,headers:$x(t)}),n=await a.json().catch(()=>null);if(!a.ok)throw Nx(n,a.status,`The Engine replied ${a.status}.`);return n}var Qr=e=>typeof e=="number"&&Number.isFinite(e);function qg(e){let t=e;for(let $=0;$<2&&typeof t=="string";$+=1)try{t=JSON.parse(t)}catch{return null}if(!t||typeof t!="object"||Array.isArray(t))return null;let a=t,{srcX:n,srcY:r,srcWidth:s,srcHeight:c}=a;if(Qr(n)&&Qr(r)&&Qr(s)&&Qr(c))return s<=0||c<=0||n<0||r<0||n+s>1.001||r+c>1.001?null:{srcX:n,srcY:r,srcWidth:s,srcHeight:c};let{zoom:d,offsetX:h,offsetY:p,fullImage:b}=a;return!Qr(d)||d<=0||!Qr(h)||!Qr(p)||b!==void 0&&typeof b!="boolean"?null:b===void 0?{zoom:d,offsetX:h,offsetY:p}:{zoom:d,offsetX:h,offsetY:p,fullImage:b}}function c2(e){if(!e)return{};if("zoom"in e){let t=`scale(${e.zoom}) translate(${e.offsetX}%, ${e.offsetY}%)`;return e.fullImage?{objectFit:"contain",transform:t}:e.zoom<=1?{}:{transform:t}}return{position:"absolute",width:`${100/e.srcWidth}%`,height:`${100/e.srcHeight}%`,left:`${-e.srcX/e.srcWidth*100}%`,top:`${-e.srcY/e.srcHeight*100}%`,maxWidth:"none",maxHeight:"none",objectFit:"fill"}}async function d2(e,t){if(e.length===0)return{};let a=await Ug("/api/characters/summaries",{method:"POST",body:JSON.stringify({ids:e}),signal:t}),n={};if(!Array.isArray(a))return n;for(let r of a){let s=typeof r?.id=="string"?r.id:"",c=typeof r?.avatarUrl=="string"?r.avatarUrl.trim():"";s.length>0&&c.length>0&&(n[s]={url:c,crop:qg(r.avatarCrop)})}return n}async function u2(e,t){let a=e.trim();if(a.length===0)return null;let n=await Ug(`/api/characters/personas/${encodeURIComponent(a)}`,{signal:t}),r=typeof n?.avatarPath=="string"?n.avatarPath.trim():"";return r.length===0?null:{url:r,crop:qg(n.avatarCrop)}}function h2(e){let t=[];for(let a of e){let n=typeof a.id=="string"?a.id.trim():"";if(n.length===0)continue;let r=typeof a.provider=="string"?a.provider:"";if(r==="video_generation")continue;let s=typeof a.name=="string"&&a.name.trim()?a.name.trim():n;t.push({id:n,name:s,category:r==="image_generation"?"image_generation":"language",defaultForAgents:a.defaultForAgents===!0||a.defaultForAgents==="true"})}return t}function F(e,t){return e instanceof Error&&e.message?e.message:t}function Ns(e){let t=F(e,"");return t.includes("Interrupted: Inactivity")?"inactivity":/no longer available|not active|already ended/iu.test(t)?"elsewhere":null}async function rx(e){try{let{session:t}=await L("/rooms/active",{signal:AbortSignal.timeout(5e3)});return t?.id===e&&t.status!=="opening"?t:null}catch{return null}}async function Ss(e,t){try{t&&await L(`/rooms/${encodeURIComponent(e)}/operations/${encodeURIComponent(t)}`,{signal:AbortSignal.timeout(5e3)});let{session:a}=await L("/rooms/active",{signal:AbortSignal.timeout(5e3)});if(a?.id===e)return a;let{visit:n}=await L(`/rooms/archive/${encodeURIComponent(e)}`,{signal:AbortSignal.timeout(5e3)});return n}catch{return null}}async function ox(e,t){try{let{visit:a}=await L(`/rooms/archive/${encodeURIComponent(e)}`,{signal:AbortSignal.timeout(5e3)});return H1(a,t)?a:null}catch{return null}}function sx(e){let t=F(e,"The scene opening could not be prepared.");return/timeout|timed out|exceeded 28 seconds/iu.test(t)?"The scene opening took too long. Retry it or continue without an opening.":`${t} Retry it or continue without an opening.`}function Ru(e){let t=e?.trim();if(!(!t||/url\(|;|expression\(/i.test(t)))return/^(?:linear|radial|conic)-gradient\(/i.test(t)?CSS.supports("background-image",t)?{backgroundImage:t,backgroundClip:"text",WebkitBackgroundClip:"text",WebkitTextFillColor:"transparent",color:"transparent"}:void 0:CSS.supports("color",t)?{color:t}:void 0}function Cs(e,t){return Sx(z1(e),t)}function Sx(e,t){let a=0;return e.map(n=>{let r=`${t}${a++}`;switch(n.kind){case"text":return n.text;case"code":return(0,o.jsx)("code",{className:`${i}-chat-md-code`,dir:"ltr",children:n.text},r);case"link":return(0,o.jsx)("a",{className:`${i}-chat-md-link`,href:n.href,target:"_blank",rel:"noopener noreferrer",children:n.text},r);default:return m2(n,r)}})}function m2(e,t){let a=Sx(e.children,`${t}-`);switch(e.style){case"bold":return(0,o.jsx)("strong",{children:a},t);case"bold-italic":return(0,o.jsx)("strong",{children:(0,o.jsx)("em",{children:a})},t);case"italic":return(0,o.jsx)("em",{children:a},t);case"underline":return(0,o.jsx)("u",{children:a},t);case"strikethrough":return(0,o.jsx)("del",{children:a},t);default:return(0,o.jsx)("mark",{className:`${i}-chat-md-highlight`,children:a},t)}}function p2(e){return e==="off"?"Automatic Events and new wishes are paused. Existing wishes can still be fulfilled or expire.":e==="quiet"?"Usually one optional village story is written on an active day.":e==="lively"?"Up to three optional village stories may be written on an active day.":"Usually one to three optional village stories are written on an active day, averaging two."}function Mu(e){return e.classes?.includes("residence")??(e.occupancy.playerHome||e.occupancy.residentCharacterId!==null||e.occupancy.homeKind!==null)}function g2({zone:e,onSave:t}){let[a,n]=(0,m.useState)(e.description),[r,s]=(0,m.useState)(e.state?.features.map(b=>b.text).join(`
`)??""),[c,d]=(0,m.useState)(!1),[h,p]=(0,m.useState)("");return(0,o.jsxs)("section",{className:i+"-venue-card",children:[(0,o.jsxs)("h2",{children:[e.label," details"]}),(0,o.jsxs)("label",{children:["Description",(0,o.jsx)("textarea",{value:a,onChange:b=>n(b.target.value)})]}),(0,o.jsxs)("label",{children:["Features \xB7 one per line",(0,o.jsx)("textarea",{value:r,onChange:b=>s(b.target.value)})]}),(0,o.jsx)("p",{children:e.area==="shared"||e.area==="private"?"Resident-controlled changes become exact proposals during an invited visit.":"These details describe this zone."}),(0,o.jsx)("button",{type:"button",className:i+"-button",disabled:c||!a.trim(),onClick:async()=>{d(!0),p("");try{await t({description:a,state:{features:r.split(`
`).map(b=>b.trim()).filter(Boolean).map(b=>({...e.state?.features.find($=>$.text===b),text:b}))}}),p(e.area==="shared"||e.area==="private"?"Saved. Any required resident approvals appear in the Venue.":"Zone saved.")}catch{p("The zone could not be saved. See the message above.")}finally{d(!1)}},children:c?"Saving\u2026":e.area==="shared"||e.area==="private"?"Save / propose zone changes":"Save zone details"}),h?(0,o.jsx)("p",{role:"status",children:h}):null]})}var Es=["residence","workplace","gathering","other"];function ei(e){return e.classes?.length?e.classes:Mu(e)?["residence"]:["other"]}function lx(e){return Math.min(4,(e.residenceCapacity??1)+(e.improvements??[]).reduce((t,a)=>t+(a?.extraBeds??0),0))}function zu(e){return(e.residentIds?.length??+!!e.occupancy.residentCharacterId)+Number(e.occupancy.playerHome)}function mn(e,t){return e.spaces?.find(a=>a.venueClass===t)??{id:t,venueClass:t,description:e.description,image:e.presentation.image,state:{condition:e.state.condition,items:e.state.furniture,publicFacts:e.state.publicFacts,features:e.state.features??[],traces:e.state.traces??[],updatedAt:e.state.updatedAt}}}function cx({draft:e,existing:t,villagers:a,editableClasses:n,onChange:r}){let s=ei(e),c=(d,h)=>{let p=s.map(b=>b===d?{...mn(e,b),...h}:mn(e,b));r({...e,spaces:p,description:p[0]?.description??e.description})};return(0,o.jsxs)("div",{className:`${i}-field`,children:[(0,o.jsxs)("label",{className:`${i}-label`,children:["Name",(0,o.jsx)("input",{className:`${i}-notice-input`,value:e.name,maxLength:100,onChange:d=>r({...e,name:d.target.value}),placeholder:"The Lantern Workshop"})]}),(0,o.jsxs)("label",{className:`${i}-label`,children:["Form ",(0,o.jsx)("span",{className:`${i}-hint`,children:"What is it, in your world?"}),(0,o.jsx)("input",{className:`${i}-notice-input`,value:e.form??"",maxLength:200,onChange:d=>r({...e,form:d.target.value}),placeholder:"A converted truck, a sleeping pod, an old diner\u2026"})]}),(0,o.jsxs)("fieldset",{className:`${i}-field`,children:[(0,o.jsx)("legend",{className:`${i}-label`,children:"Map pin \xB7 optional"}),(0,o.jsx)("p",{className:`${i}-hint`,children:"Use a fraction from 0 to 1 across the map and down the map."}),(0,o.jsx)("div",{className:`${i}-row`,children:["x","y"].map(d=>(0,o.jsxs)("label",{className:`${i}-label`,children:[d==="x"?"Across":"Down",(0,o.jsx)("input",{className:`${i}-notice-input`,type:"number",min:0,max:1,step:.01,value:e.presentation[d]??"",disabled:t&&zu(e)>0,onChange:h=>r({...e,presentation:{...e.presentation,[d]:h.target.value===""?null:Number(h.target.value)}})})]},d))}),t&&zu(e)>0?(0,o.jsx)("p",{className:`${i}-hint`,children:"Move residents before changing this Venue's pin."}):null]}),(0,o.jsxs)("fieldset",{className:`${i}-field`,children:[(0,o.jsx)("legend",{className:`${i}-label`,children:"Classes \xB7 choose up to two"}),(0,o.jsx)("div",{className:`${i}-row`,children:Es.map(d=>(0,o.jsxs)("label",{className:`${i}-label`,style:{textTransform:"capitalize"},children:[(0,o.jsx)("input",{type:"checkbox",checked:s.includes(d),disabled:t||!s.includes(d)&&s.length>=2,onChange:h=>{let p=h.target.checked?[...s,d]:s.filter(b=>b!==d);p.length<1||p.length>2||r({...e,classes:p,spaces:p.map(b=>mn(e,b))})}})," ",d]},d))}),t?(0,o.jsx)("p",{className:`${i}-hint`,children:"Class changes go through a Venue proposal."}):null]}),s.includes("residence")?(0,o.jsxs)("label",{className:`${i}-label`,children:["Resident capacity \xB7 includes you",(0,o.jsx)("input",{className:`${i}-notice-input`,type:"number",min:1,max:4,value:e.residenceCapacity??1,disabled:t,onChange:d=>r({...e,residenceCapacity:Number(d.target.value)})}),t?(0,o.jsx)("span",{className:`${i}-hint`,children:"Capacity changes go through a Venue proposal."}):null]}):null,s.includes("workplace")?(0,o.jsxs)("fieldset",{className:`${i}-field`,children:[(0,o.jsx)("legend",{className:`${i}-label`,children:"Workers"}),a.map(d=>(0,o.jsxs)("label",{className:`${i}-label`,children:[(0,o.jsx)("input",{type:"checkbox",checked:(e.workerIds??[]).includes(d.characterId),onChange:h=>r({...e,workerIds:h.target.checked?[...e.workerIds??[],d.characterId]:(e.workerIds??[]).filter(p=>p!==d.characterId)})})," ",d.name]},d.characterId)),a.length===0?(0,o.jsx)("p",{className:`${i}-hint`,children:"No villagers are available yet."}):null]}):null,s.filter(d=>!n||n.includes(d)).map(d=>{let h=mn(e,d);return(0,o.jsxs)("section",{className:`${i}-field`,children:[(0,o.jsxs)("h3",{className:`${i}-panel-title`,style:{textTransform:"capitalize"},children:[d," space"]}),(0,o.jsxs)("label",{className:`${i}-label`,children:["Scene description",(0,o.jsx)("textarea",{className:`${i}-textarea`,value:h.description,maxLength:1e3,onChange:p=>c(d,{description:p.target.value})})]}),(0,o.jsxs)("details",{className:`${i}-venue-scene-details`,children:[(0,o.jsx)("summary",{children:"Scene details"}),(0,o.jsx)("p",{className:`${i}-hint`,children:"Current physical state used by visits and pictures."}),(0,o.jsxs)("label",{className:`${i}-label`,children:["Condition now"," ",(0,o.jsx)("span",{className:`${i}-hint`,children:"For example, a leaking roof or a repaired door."}),(0,o.jsx)("input",{className:`${i}-notice-input`,value:h.state.condition,onChange:p=>c(d,{state:{...h.state,condition:p.target.value}})})]}),(0,o.jsxs)("label",{className:`${i}-label`,children:["Present items \xB7 one per line"," ",(0,o.jsx)("span",{className:`${i}-hint`,children:"Objects physically in this space."}),(0,o.jsx)("textarea",{className:`${i}-textarea`,value:h.state.items.join(`
`),onChange:p=>c(d,{state:{...h.state,items:p.target.value.split(`
`)}})})]}),(0,o.jsxs)("label",{className:`${i}-label`,children:["Established facts \xB7 one per line"," ",(0,o.jsx)("span",{className:`${i}-hint`,children:"Durable truths about this space."}),(0,o.jsx)("textarea",{className:`${i}-textarea`,value:h.state.publicFacts.join(`
`),onChange:p=>c(d,{state:{...h.state,publicFacts:p.target.value.split(`
`)}})})]}),(0,o.jsxs)("div",{className:`${i}-field`,children:[(0,o.jsx)("span",{className:`${i}-label`,children:"Features \xB7 lasting details established through play"}),h.state.features.map((p,b)=>(0,o.jsxs)("div",{className:`${i}-row`,children:[(0,o.jsx)("input",{className:`${i}-notice-input`,value:p.text,"aria-label":`Feature ${b+1}`,onChange:$=>c(d,{state:{...h.state,features:h.state.features.map(f=>f.id===p.id?{...f,text:$.target.value}:f)}})}),(0,o.jsxs)("label",{className:`${i}-label`,children:[(0,o.jsx)("input",{type:"checkbox",checked:p.locked,onChange:$=>c(d,{state:{...h.state,features:h.state.features.map(f=>f.id===p.id?{...f,locked:$.target.checked}:f)}})})," ","Locked"]}),(0,o.jsx)("button",{type:"button",className:`${i}-remove`,"aria-label":`Remove feature ${b+1}`,onClick:()=>c(d,{state:{...h.state,features:h.state.features.filter($=>$.id!==p.id)}}),children:"\xD7"})]},p.id)),(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:h.state.features.length>=5,onClick:()=>c(d,{state:{...h.state,features:[...h.state.features,{id:hr(),text:"",sourceCharacterId:"",locked:!1,updatedAt:""}]}}),children:"Add Feature"})]})]}),(0,o.jsx)("p",{className:`${i}-hint`,children:"Structural improvements use two proposal slots per Venue."})]},d)})]})}function ks(e){return e.filter(t=>!Mu(t)||ei(t).some(a=>a!=="residence"))}function Cu(){return Math.random().toString(36).slice(2,10)}function Fr(e){return Math.round(e*1e4)/1e4}var f2=new Intl.DateTimeFormat(void 0,{weekday:"short",day:"numeric",month:"short"}),kx=new Intl.DateTimeFormat(void 0,{hour:"2-digit",minute:"2-digit"}),b2=6e4,v2=700;function dx(e){return`${f2.format(e)} \xB7 ${kx.format(e)}`}function y2(){let[e,t]=(0,m.useState)(()=>dx(new Date));return(0,m.useEffect)(()=>{let a=setInterval(()=>t(dx(new Date)),1e3);return()=>clearInterval(a)},[]),e}function w2(){let[e,t]=y2().split(" \xB7 ");return(0,o.jsxs)("span",{className:`${i}-mobile-clock`,children:[(0,o.jsx)("span",{children:e}),(0,o.jsx)("strong",{children:t})]})}function x2({weather:e}){return(0,o.jsxs)("span",{className:`${i}-mobile-datetime`,children:[(0,o.jsx)(w2,{}),(0,o.jsx)("span",{role:"img","aria-label":`Weather: ${e||"unknown"}`,title:e||"Weather unavailable",children:$2(e)})]})}function $2(e){return/thunder/u.test(e)?"\u26C8\uFE0F":/snow/u.test(e)?"\u2744\uFE0F":/sleet/u.test(e)?"\u{1F328}\uFE0F":/rain|drizzle/u.test(e)?"\u{1F327}\uFE0F":/fog|haze/u.test(e)?"\u{1F32B}\uFE0F":/wind|breez/u.test(e)?"\u{1F32C}\uFE0F":/overcast/u.test(e)?"\u2601\uFE0F":/frost/u.test(e)?"\u{1F976}":/hot|heat/u.test(e)?"\u2600\uFE0F":"\u{1F324}\uFE0F"}function ux(e){return e?.closest(i)??null}function N2(){let[e,t]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let r=()=>t(ux(document.fullscreenElement)!==null);return r(),document.addEventListener("fullscreenchange",r),()=>document.removeEventListener("fullscreenchange",r)},[]);let a=document.fullscreenEnabled,n=a?e?"Leave the whole screen":"Use the whole screen":"This browser will not give the tab the whole screen";return(0,o.jsx)("button",{type:"button",className:`${i}-button ${i}-icon-button`,disabled:!a,"aria-pressed":e,"aria-label":n,title:n,onClick:r=>{let s=ux(r.currentTarget);if(!s)return;if(document.fullscreenElement===s){document.exitFullscreen().catch(()=>{});return}let c=s.requestFullscreen?.();c&&c.catch(()=>{})},children:(0,o.jsx)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",focusable:"false",children:e?(0,o.jsx)("path",{d:"M9 4H5a1 1 0 0 0-1 1v4M15 4h4a1 1 0 0 1 1 1v4M9 20H5a1 1 0 0 1-1-1v-4M15 20h4a1 1 0 0 0 1-1v-4"}):(0,o.jsx)("path",{d:"M9 3H4a1 1 0 0 0-1 1v5M15 3h5a1 1 0 0 1 1 1v5M9 21H4a1 1 0 0 1-1-1v-5M15 21h5a1 1 0 0 0 1-1v-5"})})})}function S2({happenings:e,recap:t,mobile:a=!1}){let n=(0,m.useRef)(null),[r,s]=(0,m.useState)(!1);return(0,m.useEffect)(()=>{let c=n.current;if(!c)return;let d=()=>s(c.open);return c.addEventListener("toggle",d),()=>c.removeEventListener("toggle",d)},[]),(0,m.useEffect)(()=>{if(!r)return;let c=d=>{!(d.target instanceof Node)||n.current?.contains(d.target)||n.current?.removeAttribute("open")};return document.addEventListener("pointerdown",c),document.addEventListener("keydown",c),()=>{document.removeEventListener("pointerdown",c),document.removeEventListener("keydown",c)}},[r]),(0,o.jsxs)("details",{ref:n,className:`${i}-news`,children:[(0,o.jsxs)("summary",{className:`${i}-button ${i}-news-toggle`,"aria-label":"Events (NYI)",children:[(0,o.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round",focusable:"false",children:[(0,o.jsx)("path",{d:"M4 5a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2z"}),(0,o.jsx)("path",{d:"M8 8h7M8 12h7M8 16h4"})]}),a?null:"Events",(0,o.jsx)("span",{className:`${i}-news-nyi`,children:"NYI"})]}),(0,o.jsxs)("div",{className:`${i}-news-panel`,children:[(0,o.jsx)("h2",{className:`${i}-news-title`,children:"Events"}),t?(0,o.jsxs)("div",{children:[(0,o.jsx)("strong",{children:"While you were away"}),t.details.length>0?(0,o.jsx)("ul",{className:`${i}-news-list`,children:t.details.map(c=>(0,o.jsx)("li",{className:`${i}-news-item`,children:c.text},`recap-${c.id}`))}):null,t.summaries.map(c=>(0,o.jsx)("p",{className:`${i}-news-empty`,children:c},c)),t.pendingDecisionCount>0?(0,o.jsxs)("p",{className:`${i}-news-empty`,children:[t.pendingDecisionCount," pending"," ",t.pendingDecisionCount===1?"decision needs":"decisions need"," your attention."]}):null]}):null,e.length===0?(0,o.jsx)("p",{className:`${i}-news-empty`,children:"No events to show yet."}):(0,o.jsx)("ul",{className:`${i}-news-list`,children:e.map(c=>(0,o.jsx)("li",{className:`${i}-news-item`,children:c.text},c.id))})]})]})}function Cx(e,t){return`${e==="You"?t?"Your":"your":`${e}'s`} house`}function k2(e){return e.length>0?Cx(e,!0):"Empty house"}function C2(e,t){return t===null?{kind:"",name:"Venue residence",category:""}:e.find(a=>a.kind===t)??{kind:t,name:t,category:""}}function hx(e){return e.isPlayerHome?"player":e.occupant?"resident":"empty"}function T2(e,t){return t.length>0?Cx(t,!0):e.name||"An empty house"}function Tu(e){return e?e.presentation.x===null||e.presentation.y===null?null:{x:e.presentation.x,y:e.presentation.y}:null}var E2=.028;function Ts(e){return new Promise((t,a)=>{let n=new FileReader;n.onload=()=>t(typeof n.result=="string"?n.result:""),n.onerror=()=>a(new Error("That picture could not be read.")),n.readAsDataURL(e)})}function Eu(e){return new Promise((t,a)=>{let n=new Image;n.onload=()=>t({width:n.naturalWidth,height:n.naturalHeight}),n.onerror=()=>a(new Error("That picture could not be read.")),n.src=e})}var mx=[{fit:"cover",label:"Fill the frame",help:"Keeps the picture's own shape and crops whatever hangs outside the frame. Drag the map to choose which part is kept."},{fit:"stretch",label:"Stretch to fill",help:"Squeezes the whole picture into the frame. Nothing is lost, but a picture that is not the map's shape is drawn stretched."},{fit:"contain",label:"Show all of it",help:"Keeps the whole picture and leaves the frame's own background showing around it."}];function Rg(e){return e.width/e.height<1.2?{tone:"warn",text:`This ${e.width}\xD7${e.height} map is nearly square or portrait. It will fit in full, but navigation may feel cramped on a wide desktop.`}:e.width<1024||e.height<700?{tone:"warn",text:`This ${e.width}\xD7${e.height} map will fit in full, but it may look soft when enlarged.`}:{tone:"ok",text:`This ${e.width}\xD7${e.height} map will be shown at its native shape, with the whole image visible.`}}var A2=`data:image/svg+xml,${encodeURIComponent('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 640 440"><rect width="640" height="440" fill="#11285b"/><g stroke="#6c9bd5" opacity=".34" stroke-width="1"><path d="M0 40H640M0 80H640M0 120H640M0 160H640M0 200H640M0 240H640M0 280H640M0 320H640M0 360H640M0 400H640M40 0V440M80 0V440M120 0V440M160 0V440M200 0V440M240 0V440M280 0V440M320 0V440M360 0V440M400 0V440M440 0V440M480 0V440M520 0V440M560 0V440M600 0V440"/></g><g fill="none" stroke="#d7e9ff" stroke-width="5" stroke-linejoin="round"><path d="M110 195 320 88 530 195 320 302Z"/><path d="M110 195v150l210 87 210-87V195M320 302v130"/><path d="M212 153v89l108 46 108-46v-89M257 128v76l63 29 63-29v-76"/><path d="M160 221v72l95 40v-72zM385 334l95-40v-72l-95 40z"/></g><g fill="#d7e9ff" font-family="Arial,sans-serif" letter-spacing="9" text-anchor="middle"><text x="320" y="48" font-size="22">VILLAGE PROJECT</text></g></svg>')}`;function Mg(e,t,a){return e<t?t:e>a?a:e}function R2(e,t,a){if(a.fit==="stretch")return{left:0,top:0,width:t.width,height:t.height};if(a.fit==="contain"){let c=Math.min(t.width/e.width,t.height/e.height),d=e.width*c,h=e.height*c;return{left:(t.width-d)/2,top:(t.height-h)/2,width:d,height:h}}let n=Math.max(t.width/e.width,t.height/e.height)*a.zoom,r=e.width*n,s=e.height*n;return{left:(t.width-r)*(a.focusX/100),top:(t.height-s)*(a.focusY/100),width:r,height:s}}function M2(e){return e.fit==="stretch"?{objectFit:"fill"}:e.fit==="contain"?{objectFit:"contain"}:{objectFit:"cover",objectPosition:`${e.focusX}% ${e.focusY}%`,...e.zoom===1?null:{transform:`scale(${e.zoom})`,transformOrigin:`${e.focusX}% ${e.focusY}%`}}}function nc(e){return{fit:e,focusX:50,focusY:50,zoom:1}}function zg({src:e,alt:t,pins:a,placing:n,view:r,shape:s,zoom:c,onPlace:d,onView:h,onDismiss:p,compact:b,fitToRoom:$,mobile:f,photoPins:y,placementCursor:V,children:M}){let O=d!==void 0,N=h!==void 0,v=(0,m.useRef)(null),w=(0,m.useRef)(null),[R,H]=(0,m.useState)(null),[Z,te]=(0,m.useState)(null),[Q,Te]=(0,m.useState)(null),B=(0,m.useRef)(null),re=(0,m.useRef)(new Map),ve=(0,m.useRef)(null),[ht,Me]=(0,m.useState)(null),[Vt,qt]=(0,m.useState)(null),Ft=(0,m.useRef)(null),z=(0,m.useRef)(null),j=(0,m.useRef)(!1),[me,ye]=(0,m.useState)(null),ae=(0,m.useMemo)(()=>me?{...r,...me}:r,[me,r]),Be=(0,m.useMemo)(()=>e?R?.src===e?R:null:s??{width:1280,height:720},[e,R,s]),Ge={zoom:Be&&Z?Nu(Be,Z):1,centerX:.5,centerY:.5},at=Q??Ge,ie=(0,m.useMemo)(()=>f?Be&&Z?Sg(Be,Z,at):null:e?R&&R.src===e&&Z?R2(R,Z,ae):null:Z?{left:0,top:0,width:Z.width,height:Z.height}:null,[R,Z,ae,f,Be,at,e]);(0,m.useEffect)(()=>{Te(null),B.current=null,re.current.clear(),ve.current=null},[e]);let st=s?$&&ht?{width:`${ht.width}px`,height:`${ht.height}px`,aspectRatio:`${s.width} / ${s.height}`}:{aspectRatio:`${s.width} / ${s.height}`}:void 0,qe=(0,m.useCallback)(()=>{let I=w.current;if(!I)return;let X=I.getBoundingClientRect();X.width===0||X.height===0||te(we=>we&&we.width===X.width&&we.height===X.height?we:{width:X.width,height:X.height})},[]);(0,m.useEffect)(()=>{let I=w.current;if(!I||typeof ResizeObserver>"u")return;let X=new ResizeObserver(()=>qe());return X.observe(I),()=>X.disconnect()},[qe]);let Ot=(0,m.useCallback)(()=>{let I=v.current?.parentElement;if(!I||!s)return;let X=I.getBoundingClientRect(),we=getComputedStyle(I),je=P=>Number.parseFloat(we.getPropertyValue(P))||0,Le=X.width-je("padding-left")-je("padding-right"),Ne=X.height-je("padding-top")-je("padding-bottom"),oe=s.width/s.height,Ze=Math.min(Le,Ne*oe);Ze>0&&Me(P=>P&&Math.abs(P.width-Ze)<.5?P:{width:Ze,height:Ze/oe})},[s]);(0,m.useLayoutEffect)(()=>{if(!$||(Ot(),typeof ResizeObserver>"u"))return;let I=v.current?.parentElement;if(!I)return;let X=new ResizeObserver(()=>Ot());return X.observe(I),()=>X.disconnect()},[$,Ot]);let lt=(0,m.useCallback)(I=>{if(!O||!d||!ie)return;let X=I.currentTarget.getBoundingClientRect(),we=(I.clientX-X.left-ie.left)/ie.width,je=(I.clientY-X.top-ie.top)/ie.height;if(!(we>=0&&we<=1)||!(je>=0&&je<=1))return;let Ne=w.current?.querySelector(`.${i}-pin-photo`)?.getBoundingClientRect();d(Fr(we),Fr(je),{width:ie.width,height:ie.height,photoWidth:Ne?.width??58,photoHeight:Ne?.height??58})},[d,O,ie]),$t=(0,m.useCallback)(I=>{if(!N||!ie||!h||ae.fit!=="cover")return;let X=I.currentTarget.getBoundingClientRect();Ft.current={x:I.clientX,y:I.clientY,focusX:ae.focusX,focusY:ae.focusY,spanX:X.width-ie.width,spanY:X.height-ie.height},ye({focusX:ae.focusX,focusY:ae.focusY}),I.currentTarget.setPointerCapture(I.pointerId),I.preventDefault()},[N,ae.focusX,ae.focusY,ae.fit,h,ie]),pe=(0,m.useCallback)(I=>{let X=Ft.current;if(!X)return;let we=X.spanX===0?X.focusX:X.focusX+(I.clientX-X.x)/X.spanX*100,je=X.spanY===0?X.focusY:X.focusY+(I.clientY-X.y)/X.spanY*100;ye({focusX:Fr(Mg(we,0,100)),focusY:Fr(Mg(je,0,100))})},[]),ge=(0,m.useCallback)(I=>{if(!Ft.current)return;Ft.current=null,I.currentTarget.hasPointerCapture(I.pointerId)&&I.currentTarget.releasePointerCapture(I.pointerId);let X=me;ye(null),X&&h&&h({...r,...X})},[me,h,r]),he=(0,m.useCallback)(I=>{!h||!c||h({...r,zoom:Fr(Mg(I,c.min,c.max))})},[h,r,c]),ct=()=>{let I=[...re.current.values()];if(I.length===0){ve.current=null;return}let X=I[0],we=I[1];ve.current={view:B.current??at,x:we?(X.x+we.x)/2:X.x,y:we?(X.y+we.y)/2:X.y,distance:we?Math.hypot(X.x-we.x,X.y-we.y):1}},St=I=>{if(!f||I.pointerType!=="touch"||(I.isPrimary&&(re.current.clear(),j.current=!1),!w.current)||I.target instanceof Element&&I.target.closest(`.${i}-doors, .${i}-zoom`))return;v.current?.setAttribute("data-mobile-gesturing","true");let X=w.current.getBoundingClientRect();re.current.set(I.pointerId,{x:I.clientX-X.left,y:I.clientY-X.top}),re.current.size>1&&(j.current=!0),ct()},nt=I=>{if(!f||!re.current.has(I.pointerId)||!Be||!Z||!w.current)return;let X=w.current.getBoundingClientRect();re.current.set(I.pointerId,{x:I.clientX-X.left,y:I.clientY-X.top});let we=[...re.current.values()],je=we[0],Le=we[1],Ne=Le?(je.x+Le.x)/2:je.x,oe=Le?(je.y+Le.y)/2:je.y,Ze=Le?Math.hypot(je.x-Le.x,je.y-Le.y):1,P=ve.current;if(!P||!P1(P,{x:Ne,y:oe,distance:Ze})&&!j.current)return;j.current||p?.(),j.current=!0;let It=X1(Be,Z,P.view,{x:P.x,y:P.y},{x:Ne,y:oe},Le&&P.distance>0?Ze/P.distance:1);B.current=It,Te(It)},Lt=(I,X)=>{let we=je=>{document.removeEventListener("click",we,!0),Math.abs(je.clientX-I)<3&&Math.abs(je.clientY-X)<3&&(je.preventDefault(),je.stopImmediatePropagation())};document.addEventListener("click",we,!0),window.setTimeout(()=>document.removeEventListener("click",we,!0),500)},Ve=(I,X=!1)=>{if(!f||!re.current.has(I.pointerId))return;let we=!X&&re.current.size===1&&!j.current;if(re.current.delete(I.pointerId),re.current.size===0&&v.current?.removeAttribute("data-mobile-gesturing"),ct(),!we||!(I.target instanceof Element))return;let je=I.target.closest(`.${i}-pin`)?.dataset.pinId,Le=je?a.find(Ne=>Ne.id===je):null;if(Le?.onSelect){j.current=!0,Lt(I.clientX,I.clientY),Le.onSelect();return}if(!(!I.target.closest(`.${i}-canvas`)||I.target.closest("button")))if(O&&n&&d&&ie){let Ne=w.current.getBoundingClientRect(),oe=(I.clientX-Ne.left-ie.left)/ie.width,Ze=(I.clientY-Ne.top-ie.top)/ie.height;if(oe>=0&&oe<=1&&Ze>=0&&Ze<=1){j.current=!0;let gt=w.current?.querySelector(`.${i}-pin-photo`)?.getBoundingClientRect();Lt(I.clientX,I.clientY),d(Fr(oe),Fr(Ze),{width:ie.width,height:ie.height,photoWidth:gt?.width??72,photoHeight:gt?.height??72})}}else p&&(j.current=!0,p())};return(0,o.jsxs)("div",{ref:v,className:`${i}-stage${b?` ${i}-stage-compact`:""}`,style:st,"data-shaped":s?"true":"false","data-framing":N&&ae.fit==="cover"?"true":"false","data-mobile":f?"true":"false","data-photo-pins":y?"true":"false","data-empty":e?"false":"true",onPointerDownCapture:I=>{if(f){St(I);return}j.current=!1,z.current=I.pointerType==="touch"?{x:I.clientX,y:I.clientY}:null},onPointerMoveCapture:I=>{if(f){nt(I);return}let X=z.current;X&&(Math.abs(I.clientX-X.x)>8||Math.abs(I.clientY-X.y)>8)&&(j.current=!0)},onPointerUpCapture:f?Ve:void 0,onPointerCancelCapture:I=>{f&&Ve(I,!0),z.current&&(j.current=!0)},onClickCapture:I=>{j.current&&(j.current=!1,I.preventDefault(),I.stopPropagation())},children:[M,(0,o.jsxs)("div",{ref:w,className:`${i}-canvas`,"data-placing":O&&n?"true":"false","data-dragging":me?"true":"false",onClick:O&&n?lt:p?()=>p():void 0,onPointerDown:N?$t:void 0,onPointerMove:N?pe:void 0,onPointerUp:N?ge:void 0,onPointerCancel:N?ge:void 0,children:[e?(0,o.jsx)("img",{className:`${i}-canvas-img`,style:f&&ie?{position:"absolute",left:ie.left,top:ie.top,width:ie.width,height:ie.height,objectFit:"fill"}:M2(ae),src:e,alt:t,draggable:!1,onLoad:I=>{let{naturalWidth:X,naturalHeight:we}=I.currentTarget;X<=0||we<=0||(H({src:e,width:X,height:we}),qe())},onError:()=>qt(e)}):(0,o.jsxs)(o.Fragment,{children:[f&&ie?(0,o.jsx)("span",{className:`${i}-mobile-logical`,style:{left:ie.left,top:ie.top,width:ie.width,height:ie.height},"aria-hidden":"true"}):null,(0,o.jsx)("span",{className:`${i}-canvas-empty`,children:"Logical village map"})]}),e&&Vt===e?(0,o.jsx)("span",{className:`${i}-canvas-missing`,children:"The map picture could not be loaded \u2014 choose another one in Village Settings \u2192 Village Map."}):null,ie&&V&&n?(0,o.jsx)("span",{className:`${i}-placement-cursor`,"aria-hidden":"true",style:{position:"absolute",left:ie.left+V.x*ie.width,top:ie.top+V.y*ie.height,zIndex:3,pointerEvents:"none",border:"2px solid #d5c6ff",background:"#251a3a99",borderRadius:"50%",width:"1rem",height:"1rem",transform:"translate(-50%,-50%)"}}):null,ie?a.map(I=>(0,o.jsxs)("span",{className:`${i}-pin-holder`,"data-selected":I.selected?"true":"false",style:{left:`${ie.left+I.x*ie.width}px`,top:`${ie.top+(I.y+(f&&I.kind!=="person"?0:I.dy??0))*ie.height}px`},children:[(0,o.jsx)("button",{type:"button",className:`${i}-pin`,"data-pin-id":I.id,"data-tone":I.tone,"data-kind":I.kind??"place","data-selected":I.selected?"true":"false","aria-expanded":I.doors?!0:void 0,disabled:I.onSelect===void 0,title:I.text,onClick:X=>{X.stopPropagation(),I.onSelect?.()},children:(f||y)&&I.kind!=="person"?(0,o.jsxs)("span",{className:`${i}-pin-photo-card`,style:{transform:`scale(${Q1(f?Z1(at.zoom,Ge.zoom):Jk,I.selected===!0)})`},children:[(0,o.jsxs)("span",{className:`${i}-pin-photo`,"aria-hidden":"true",children:[I.image?(0,o.jsx)("img",{src:I.image,alt:"",loading:"lazy",draggable:!1}):(0,o.jsx)("span",{className:`${i}-pin-photo-empty`,role:"img","aria-label":"House",children:"\u{1F3E0}"}),(0,o.jsx)("span",{className:`${i}-pin-photo-tack`})]}),(0,o.jsx)("span",{className:`${i}-pin-name`,children:I.text})]}):(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("span",{"aria-hidden":"true",className:`${i}-pin-tack`,children:(0,o.jsxs)("svg",{viewBox:"0 0 24 24",focusable:"false",children:[(0,o.jsx)("path",{d:"M7 2h10a1.2 1.2 0 0 1 1.2 1.2v2.4a1.2 1.2 0 0 1-1.2 1.2H7A1.2 1.2 0 0 1 5.8 5.6V3.2A1.2 1.2 0 0 1 7 2Z"}),(0,o.jsx)("path",{d:"M9.4 7.4h5.2l-.7 3.2H10.1z"}),(0,o.jsx)("path",{d:"M11.3 10.9h1.4v10.3l-.7 1.2-.7-1.2z"})]})}),(0,o.jsx)("span",{className:`${i}-pin-name`,children:I.text})]})}),I.onRemove?(0,o.jsx)("button",{type:"button",className:`${i}-pin-remove`,"aria-label":`Take ${I.text} off the map`,onClick:X=>{X.stopPropagation(),I.onRemove?.()},children:"\xD7"}):null,I.onResume?(0,o.jsx)("button",{type:"button",className:`${i}-pin-resume`,onClick:X=>{X.stopPropagation(),I.onResume?.()},children:"DEBUG: Resume Chat"}):null]},I.id)):null]}),ie?a.filter(I=>I.doors!==void 0&&I.doors.length>0).map(I=>(0,o.jsx)("div",{className:`${i}-doors`,style:{left:`${Z?kg(ie,Z,I).left:ie.left+I.x*ie.width}px`,top:`${Z?kg(ie,Z,I).top:ie.top+(I.y+(I.dy??0))*ie.height}px`},children:I.doors?.map(X=>(0,o.jsx)("button",{type:"button",className:`${i}-door`,onClick:we=>{we.stopPropagation(),X.onSelect()},children:X.label},X.label))},`doors:${I.id}`)):null,N&&c&&ae.fit==="cover"?(0,o.jsxs)("div",{className:`${i}-zoom`,children:[(0,o.jsx)("button",{type:"button",className:`${i}-zoom-button`,title:"Show less of the picture, larger","aria-label":"Zoom in",disabled:ae.zoom>=c.max,onClick:()=>he(ae.zoom+c.step),children:"+"}),(0,o.jsx)("button",{type:"button",className:`${i}-zoom-button`,title:"Show more of the picture, smaller","aria-label":"Zoom out",disabled:ae.zoom<=c.min,onClick:()=>he(ae.zoom-c.step),children:"\u2212"}),(0,o.jsx)("button",{type:"button",className:`${i}-zoom-button`,title:"Put the middle of the picture back in the middle of the frame",disabled:ae.focusX===50&&ae.focusY===50&&ae.zoom===c.min,onClick:()=>{h&&h({...r,focusX:50,focusY:50,zoom:c.min})},children:"Centre"})]}):null]})}function ic(e){let t=e?.settings.playerPersonaName;return typeof t=="string"&&t.trim()||"You"}function z2({scenario:e}){let t=Wk(e),[a,n]=(0,m.useState)(null);return(0,o.jsxs)("div",{className:`${i}-scenario-art-panel`,children:[a===t?(0,o.jsx)("span",{className:`${i}-scenario-art-placeholder`,role:"img","aria-label":"Village scene unavailable",children:"\u2302"}):(0,o.jsx)("img",{src:t,alt:`${Jr(e).label} village scene`,onError:()=>n(t)}),(0,o.jsxs)("div",{className:`${i}-scenario-art-content`,children:[(0,o.jsx)("p",{children:"A new beginning awaits."}),(0,o.jsx)("strong",{children:Jr(e).description})]})]})}function V2({label:e,choices:t,selectedId:a,onSelect:n,disabled:r,emptyMessage:s}){return t.length?(0,o.jsx)("div",{className:`${i}-identity-strip`,role:"group","aria-label":e,children:t.map(c=>(0,o.jsxs)("button",{type:"button",className:`${i}-identity-card`,"aria-pressed":a===c.id,disabled:r,onClick:()=>n(c.id),children:[(0,o.jsx)(Kr,{portrait:c.portrait,name:c.name,className:`${i}-identity-card-face`,glyph:"person"}),(0,o.jsx)("strong",{children:c.name}),c.hint?(0,o.jsx)("small",{children:c.hint}):null]},c.id))}):(0,o.jsx)("p",{className:`${i}-hint`,children:s})}function O2({value:e}){return(0,o.jsxs)("section",{className:`${i}-identity-preview`,"aria-label":`${e.name} overview`,children:[(0,o.jsx)(Kr,{portrait:e.portrait,name:e.name,className:`${i}-identity-preview-face`,glyph:"person"}),(0,o.jsxs)("div",{className:`${i}-identity-preview-copy`,children:[(0,o.jsx)("h3",{children:e.name}),e.overview?(0,o.jsx)("p",{className:`${i}-identity-overview`,children:e.overview}):null,e.details.length?(0,o.jsx)("dl",{className:`${i}-identity-details`,children:e.details.map(({label:t,text:a})=>(0,o.jsxs)("div",{children:[(0,o.jsx)("dt",{children:t}),(0,o.jsx)("dd",{children:a})]},t))}):null,(0,o.jsx)("p",{className:`${i}-identity-context`,children:e.context})]})]})}function px(e,t){let a=e.replace(/\s+/g," ").trim();if(a.length<=t)return a;let n=a.lastIndexOf(" ",t),r=a.indexOf(" ",t);return`${a.slice(0,n>0?n:r>0?r:a.length).trimEnd()}\u2026`}function gx(e){return e.avatarPath?{url:e.avatarPath,crop:qg(e.avatarCrop)}:void 0}function I2({personas:e,draft:t,onDraft:a,disabled:n}){let[r,s]=(0,m.useState)(""),[c,d]=(0,m.useState)(null),[h,p]=(0,m.useState)(""),b=e?.find(M=>M.id===t),$=b?.id,f=r.trim().toLocaleLowerCase(),y=(e??[]).filter(M=>!f||`${M.name} ${M.summary}`.toLocaleLowerCase().includes(f)).sort((M,O)=>M.name.localeCompare(O.name,void 0,{sensitivity:"base"})).map(M=>({id:M.id,name:M.name,portrait:gx(M),hint:M.summary}));(0,m.useEffect)(()=>{if(d(null),p(""),!t||!$)return;let M=new AbortController;return L(`/personas/${encodeURIComponent(t)}`,{signal:M.signal}).then(O=>{M.signal.aborted||d(O.persona)}).catch(O=>{M.signal.aborted||p(F(O,"This Persona could not be read."))}),()=>M.abort()},[t,$]);let V=c&&c.id===t?{id:c.id,name:c.name,portrait:gx(c),overview:px(c.description||c.appearance||c.personality||c.backstory,180),details:[["Appearance",c.appearance],["Personality",c.personality],["Backstory",c.backstory]].filter(([,M])=>M.trim()).map(([M,O])=>({label:M,text:px(O,120)})),context:"Villages uses this Persona's name and authored details as your identity in future interactions."}:null;return(0,o.jsxs)("div",{className:`${i}-founding-persona`,children:[(0,o.jsxs)("div",{className:`${i}-identity-picker-head`,children:[(0,o.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setup-persona-search`,children:"Who are you?"}),(0,o.jsx)("input",{id:`${i}-setup-persona-search`,className:`${i}-search`,type:"search",value:r,placeholder:"Search Personas",onChange:M=>s(M.target.value),disabled:n||e===null})]}),(0,o.jsx)(V2,{label:"Choose a Persona",choices:y,selectedId:t,onSelect:a,disabled:n,emptyMessage:e===null?"Reading Personas\u2026":e.length===0?"Create a Persona in your library before founding a village.":"No Personas match your search."}),t&&e&&!b?(0,o.jsx)("p",{className:`${i}-error`,role:"alert",children:"The saved Persona is no longer in your library. Choose another Persona to continue."}):V?(0,o.jsx)(O2,{value:V}):h?(0,o.jsx)("p",{className:`${i}-error`,role:"alert",children:h}):b?(0,o.jsxs)("p",{className:`${i}-hint`,children:["Reading ",b.name,"\u2026"]}):(0,o.jsx)("p",{className:`${i}-hint`,children:"Choose a Persona to see how Villages will know you."})]})}function D2({idPrefix:e,personas:t,draft:a,onDraft:n,storedId:r,storedName:s,storedMissing:c,disabled:d}){let h=(t??[]).find(f=>f.id===a)??null,p=h?.name??(a===r?s:""),b=c&&a===r,$=a.length>0;return(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("div",{className:`${i}-field`,children:[(0,o.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-${e}-persona`,children:"Who are you?"}),(0,o.jsxs)("select",{id:`${i}-${e}-persona`,className:`${i}-select`,value:a,disabled:d||t===null||t.length===0,onChange:f=>n(f.target.value),children:[(0,o.jsx)("option",{value:"",disabled:!0,children:t===null?"Reading Personas\u2026":"Choose a Persona"}),(t??[]).map(f=>(0,o.jsx)("option",{value:f.id,children:f.isActive?`${f.name} \u2014 your Persona`:f.name},f.id))]}),(0,o.jsx)("p",{className:`${i}-macro-help`,children:t===null?"Reading your Personas\u2026":t.length===0?"Create a Persona in your library before founding a village.":t.some(f=>f.isActive)?"Your active Persona is offered first. The village reads it live, so editing the Persona changes what the villagers believe about you.":"The village reads the Persona you pick here, live, so editing it changes what the villagers believe about you."})]}),$?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("p",{className:`${i}-empty`,children:b?"The Persona you chose is no longer in your library, so the villagers are going by the copy they kept of it. Pick another one to change who you are.":p.length>0?`The villagers know you as ${p}.`:"The villagers know you as this Persona."}),h&&h.summary.length>0?(0,o.jsx)("p",{className:`${i}-macro-help`,children:h.summary}):null]}):null]})}function fx({books:e,error:t,selected:a,onChange:n,disabled:r}){let[s,c]=(0,m.useState)(""),d=new Map((e??[]).map(y=>[y.id,y])),h=(e??[]).filter(y=>!y.hiddenFromLibrary||a.includes(y.id)),p=a.filter(y=>!d.has(y)),$=[...h,...p.map(y=>({id:y,name:y,enabled:!1}))].filter(y=>y.name.toLocaleLowerCase().includes(s.trim().toLocaleLowerCase())),f=$.slice(0,50);return(0,o.jsxs)("fieldset",{className:`${i}-field ${i}-lore-picker`,children:[(0,o.jsx)("legend",{className:`${i}-label`,children:"Lorebooks for this village"}),(0,o.jsx)("p",{className:`${i}-hint`,children:"Selected books supply live world facts for places, stories, conversations, wishes, agendas, and generated scenery. Villages never edits them."}),(0,o.jsx)("div",{className:`${i}-lore-selected`,"aria-live":"polite",children:a.length?a.map(y=>(0,o.jsxs)("span",{className:`${i}-lore-chip`,children:[(0,o.jsxs)("span",{children:[d.get(y)?.name??y,e===null?" (checking)":d.has(y)?d.get(y)?.enabled?"":" (disabled)":" (missing)"]}),(0,o.jsx)("button",{type:"button","aria-label":`Remove ${d.get(y)?.name??y}`,disabled:r,onClick:()=>n(a.filter(V=>V!==y)),children:"\xD7"})]},y)):(0,o.jsx)("span",{className:`${i}-hint`,children:"No lorebooks selected."})}),t?(0,o.jsx)("p",{className:`${i}-error`,role:"alert",children:t}):null,e===null&&!t?(0,o.jsx)("p",{className:`${i}-hint`,children:"Loading lorebooks\u2026"}):null,e===null&&t&&a.length>0?(0,o.jsx)("p",{className:`${i}-hint`,children:"Selected books could not be checked. Lore generation will skip unavailable books."}):null,e?.length===0?(0,o.jsx)("p",{className:`${i}-hint`,children:"No lorebooks in the Engine library."}):null,(0,o.jsxs)("details",{className:`${i}-lore-options`,children:[(0,o.jsxs)("summary",{className:`${i}-button`,children:["Choose lorebooks (",a.length,"/24)"]}),(0,o.jsx)("input",{type:"search",className:`${i}-search`,value:s,"aria-label":"Search lorebooks",placeholder:"Search your lorebooks",onChange:y=>c(y.target.value)}),(0,o.jsxs)("div",{className:`${i}-lore-results`,children:[f.map(y=>{let V=a.includes(y.id),M=p.includes(y.id)?e===null?t?"Unavailable \u2014 skipped":"Checking status":"Missing \u2014 skipped":y.enabled?"":"Disabled \u2014 skipped";return(0,o.jsxs)("label",{className:`${i}-reason-option`,children:[(0,o.jsx)("input",{type:"checkbox",checked:V,disabled:r||!y.enabled&&!V||!V&&a.length>=24,onChange:()=>n(V?a.filter(O=>O!==y.id):[...a,y.id])}),y.name,M?` (${M})`:""]},y.id)}),e!==null&&$.length===0?(0,o.jsx)("p",{className:`${i}-hint`,children:"No matching lorebooks."}):null,$.length>f.length?(0,o.jsx)("p",{className:`${i}-hint`,children:"Showing the first 50 matches. Search to narrow the list."}):null]})]})]})}function bx({id:e,label:t,hint:a,options:n,value:r,disabled:s,onChange:c}){let d=r.length>0&&!n.some(h=>h.id===r);return(0,o.jsxs)("div",{className:`${i}-field`,children:[(0,o.jsx)("label",{className:`${i}-label`,htmlFor:e,children:t}),(0,o.jsxs)("select",{id:e,className:`${i}-select`,value:r,disabled:s,onChange:h=>c(h.target.value),children:[(0,o.jsx)("option",{value:"",children:"Engine default"}),d?(0,o.jsx)("option",{value:r,children:"Missing \u2014 this connection is gone"}):null,n.map(h=>(0,o.jsx)("option",{value:h.id,children:h.name},h.id))]}),(0,o.jsx)("span",{className:`${i}-hint`,children:a})]})}function Vg({onSetupProblem:e,onImageWarningChange:t,compact:a=!1}){let[n,r]=(0,m.useState)(null),[s,c]=(0,m.useState)([]),[d,h]=(0,m.useState)(""),[p,b]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let O=!1;return(async()=>{try{let[N,v]=await Promise.all([L("/connections"),Ug("/api/connections")]);if(O)return;r(N),c(h2(Array.isArray(v)?v:[]))}catch(N){O||h(F(N,"This agent's connections could not be read."))}})(),()=>{O=!0}},[]);let $=(0,m.useCallback)(async O=>{b(!0),h("");try{r(await L("/connections",{method:"PUT",body:JSON.stringify(O)}))}catch(N){h(F(N,"That connection could not be saved."))}finally{b(!1)}},[]),f=s.filter(O=>O.category==="language"),y=s.filter(O=>O.category==="image_generation"),V=y.some(O=>O.defaultForAgents),M=n!==null&&(n.imageConnectionId===Tg||y.length===0||n.imageConnectionId.length===0&&!V);return(0,m.useEffect)(()=>{if(!e)return;let O=n?.systemConnectionId??"",N=n?.narrationConnectionId??"";n?O.length===0||N.length===0?e("Choose both System and Narration connections before continuing."):!f.some(v=>v.id===O)||!f.some(v=>v.id===N)?e("Choose available language connections for System and Narration."):e(""):e("Connections are still loading.")},[e,n,f]),(0,m.useEffect)(()=>{t?.(M)},[M,t]),(0,o.jsxs)("div",{className:`${i}-field ${a?`${i}-connections-compact`:""}`,children:[(0,o.jsx)("span",{className:`${i}-label`,children:"Connections"}),a?(0,o.jsx)("p",{className:`${i}-hint`,children:"Choose models for village planning, conversations, and artwork."}):(0,o.jsx)("p",{className:`${i}-empty`,children:"The village spends model calls on three kinds of work, and they are not worth the same money. The heavy lifting is one long call about the whole village. The conversations are short and frequent. Pictures are drawn only when you ask for one. Leave any of these alone and the agent's own choice is used."}),n?(0,o.jsxs)("div",{className:a?`${i}-connections-grid`:"",children:[(0,o.jsx)(bx,{id:`${i}-connection-system`,label:"System",hint:a?"Founding, daily planning, and recaps.":"Founding the village, the write-up each time the day turns over, and the village's reading of what happened while you were away.",options:f,value:n.systemConnectionId,disabled:p,onChange:O=>{$({systemConnectionId:O})}}),(0,o.jsx)(bx,{id:`${i}-connection-narration`,label:"Narration",hint:a?"Villagers' speech and conversation recaps.":"Everything the villagers say to you, and how the conversation reads back afterwards.",options:f,value:n.narrationConnectionId,disabled:p,onChange:O=>{$({narrationConnectionId:O})}}),(0,o.jsxs)("div",{className:`${i}-field`,children:[(0,o.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-connection-image`,children:"Images"}),(0,o.jsxs)("select",{id:`${i}-connection-image`,className:`${i}-select`,value:n.imageConnectionId,disabled:p,onChange:O=>{$({imageConnectionId:O.target.value})},children:[(0,o.jsx)("option",{value:Tg,children:"Disabled"}),(0,o.jsx)("option",{value:"",children:"Use Engine default"}),n.imageConnectionId.length>0&&n.imageConnectionId!==Tg&&!y.some(O=>O.id===n.imageConnectionId)?(0,o.jsx)("option",{value:n.imageConnectionId,children:"Missing \u2014 this connection is gone"}):null,y.map(O=>(0,o.jsx)("option",{value:O.id,children:O.name},O.id))]}),(0,o.jsx)("span",{className:`${i}-hint`,children:a?"Maps, sprites, and places. Recommended.":(0,o.jsxs)(o.Fragment,{children:["This is the connection that Villages uses to generate images such as character sprites, the Village map, Venue backgrounds, etc."," ",(0,o.jsxs)("span",{className:`${i}-image-recommendation`,children:["The intended experience includes an image generation connection to bring the world and characters to life, and is ",(0,o.jsx)("em",{children:"highly"})," recommended."]})]})})]})]}):d.length===0?(0,o.jsx)("span",{className:`${i}-hint`,children:"Reading this agent's connections\u2026"}):null,d?(0,o.jsx)("p",{className:`${i}-error`,role:"alert",children:d}):null]})}function _2(){let[e,t]=(0,m.useState)(null),[a,n]=(0,m.useState)(""),[r,s]=(0,m.useState)(!1),[c,d]=(0,m.useState)(!1);(0,m.useEffect)(()=>{let p=!1;return L("/narration").then(b=>{p||t(b)}).catch(b=>{p||n(F(b,"Village writing settings could not be read."))}),()=>{p=!0}},[]);let h=(0,m.useCallback)(async p=>{s(!0),d(!1),n("");try{let b=await L("/narration",{method:"PUT",body:JSON.stringify(p)});return t(b),d(!0),b}catch(b){return n(F(b,"That writing change could not be saved.")),null}finally{s(!1)}},[]);return{view:e,error:a,busy:r,saved:c,save:h}}function H2(){let{view:e,error:t,busy:a,saved:n,save:r}=_2(),[s,c]=(0,m.useState)(null),d=s??e?.writingGuidance??"";return(0,o.jsxs)("div",{className:i+"-field",children:[(0,o.jsx)("span",{className:i+"-label",children:"Additional writing guidance"}),(0,o.jsx)("p",{className:i+"-empty",children:"Optionally influence narration and dialogue in this village. Resident cards, scene facts, and the player's choices remain in charge. Leave this empty for Villages' own scene writing. Saved changes apply to the next generated venue turn."}),e?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("textarea",{className:i+"-textarea","aria-label":"Additional writing guidance",value:d,rows:5,maxLength:e.writingGuidanceMaxLength,disabled:a,onChange:h=>c(h.target.value)}),(0,o.jsx)("button",{type:"button",className:i+"-button",disabled:a||d===e.writingGuidance,onClick:()=>{r({writingGuidance:d}).then(h=>{h&&c(h.writingGuidance)})},children:"Apply guidance"}),(0,o.jsx)("button",{type:"button",className:i+"-button",disabled:a||!d,onClick:()=>{r({writingGuidance:""}).then(h=>{h&&c(h.writingGuidance)})},children:"Clear guidance"}),(0,o.jsxs)("div",{className:i+"-row",children:[(0,o.jsxs)("label",{className:i+"-field",children:[(0,o.jsx)("span",{className:i+"-label",children:"Tense"}),(0,o.jsxs)("select",{value:e.tense,disabled:a,onChange:h=>{r({tense:h.target.value})},children:[(0,o.jsx)("option",{value:"present",children:"Present"}),(0,o.jsx)("option",{value:"past",children:"Past"})]})]}),(0,o.jsxs)("label",{className:i+"-field",children:[(0,o.jsx)("span",{className:i+"-label",children:"Person"}),(0,o.jsxs)("select",{value:e.person,disabled:a,onChange:h=>{r({person:h.target.value})},children:[(0,o.jsx)("option",{value:"first",children:"First person (I)"}),(0,o.jsx)("option",{value:"second",children:"Second person (you)"}),(0,o.jsx)("option",{value:"third",children:"Third person (player name)"})]})]}),(0,o.jsxs)("label",{className:i+"-field",children:[(0,o.jsx)("span",{className:i+"-label",children:"Content rating"}),(0,o.jsxs)("select",{value:e.rating,disabled:a,onChange:h=>{r({rating:h.target.value})},children:[(0,o.jsx)("option",{value:"sfw",children:"SFW"}),(0,o.jsx)("option",{value:"nsfw",children:"NSFW"})]})]})]}),(0,o.jsx)("span",{className:i+"-hint",children:"Rating applies to venue narration and dialogue only. NSFW allows adult content when the scene calls for it."})]}):t?null:(0,o.jsx)("span",{className:i+"-hint",children:"Reading village writing settings\u2026"}),a?(0,o.jsx)("span",{className:i+"-hint",children:"Saving\u2026"}):null,n&&!a?(0,o.jsx)("span",{className:i+"-hint",role:"status",children:"Saved for the next venue turn."}):null,t?(0,o.jsx)("p",{className:i+"-error",role:"alert",children:t}):null]})}function Kr({portrait:e,name:t,className:a,glyph:n="initial"}){return(0,o.jsx)("span",{"aria-hidden":"true",className:a,children:e?(0,o.jsx)("img",{src:e.url,alt:"",style:c2(e.crop)}):n==="person"?(0,o.jsxs)("svg",{className:`${i}-person`,viewBox:"0 0 24 24","aria-hidden":"true",focusable:"false",children:[(0,o.jsx)("path",{d:"M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"}),(0,o.jsx)("circle",{cx:"12",cy:"7",r:"4",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round",strokeLinejoin:"round"})]}):t.slice(0,1).toUpperCase()})}function U2({villager:e,portrait:t,selected:a,onSelect:n}){return(0,o.jsxs)("div",{className:`${i}-tile`,"data-selected":a?"true":"false",children:[(0,o.jsxs)("div",{className:`${i}-tile-head`,children:[(0,o.jsx)(Kr,{portrait:t,name:e.name,className:`${i}-avatar`}),(0,o.jsx)("button",{type:"button",className:`${i}-tile-name`,onClick:n,disabled:n===void 0,title:n?`See where ${e.name} is`:`${e.name} has no known venue`,children:e.name})]}),e.summary?(0,o.jsx)("p",{className:`${i}-tile-summary`,children:e.summary}):null,(0,o.jsxs)("div",{className:`${i}-tile-meta`,children:[e.missing?(0,o.jsx)("span",{className:`${i}-badge`,children:"card missing"}):null,e.tags.slice(0,3).map(r=>(0,o.jsx)("span",{className:`${i}-tag`,children:r},r))]})]})}function vx(e,t){let a=URL.createObjectURL(t),n=document.createElement("a");n.href=a,n.download=e,n.click(),setTimeout(()=>URL.revokeObjectURL(a),3e4)}async function q2(e){let t=e.sprite?.images??[];if(!t.length)return;let a=[...t].sort(($,f)=>{let y=V=>{let M=ex.indexOf(V);return M<0?ex.length:M};return y($.label)-y(f.label)||$.label.localeCompare(f.label)||$.view.localeCompare(f.view)}),n=512,r=768,s=2,c=document.createElement("canvas");c.width=s*n,c.height=Math.ceil(a.length/s)*r;let d=c.getContext("2d");if(!d)throw new Error("The browser cannot assemble this sprite sheet.");let h=[];for(let $=0;$<a.length;$+=1){let f=a[$],y=new Image;y.src=f.url,await y.decode();let V=$%s*n,M=Math.floor($/s)*r,O=Math.min(n/y.naturalWidth,r/y.naturalHeight),N=Math.round(y.naturalWidth*O),v=Math.round(y.naturalHeight*O);d.drawImage(y,V+Math.floor((n-N)/2),M+r-v,N,v),h.push({view:f.view,expression:f.label,x:V,y:M,width:n,height:r})}let p=await new Promise(($,f)=>c.toBlob(y=>y?$(y):f(new Error("The browser could not export this sheet.")),"image/png")),b=e.name.toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"")||"resident";vx(`${b}-sprites.png`,p),vx(`${b}-sprites.json`,new Blob([JSON.stringify({width:c.width,height:c.height,cells:h},null,2)],{type:"application/json"}))}function L2({entry:e,onDecide:t}){let[a,n]=(0,m.useState)(e.improvement?.title??""),[r,s]=(0,m.useState)(e.improvement?.description??""),[c,d]=(0,m.useState)(e.improvement?.extraBeds??0),[h,p]=(0,m.useState)(e.improvementSlot??0),[b,$]=(0,m.useState)(!1),[f,y]=(0,m.useState)(""),V=O=>{$(!0),y(""),t(O,{title:a,description:r,extraBeds:c,slot:h}).catch(N=>y(F(N,"That Venue request could not be decided."))).finally(()=>$(!1))},M=a!==e.improvement?.title||r!==e.improvement?.description||c!==e.improvement?.extraBeds||h!==e.improvementSlot;return(0,o.jsxs)("div",{className:`${i}-field`,children:[(0,o.jsxs)("label",{className:`${i}-label`,children:["Proposed improvement",(0,o.jsx)("input",{className:`${i}-notice-input`,value:a,onChange:O=>n(O.target.value)})]}),(0,o.jsxs)("label",{className:`${i}-label`,children:["What changes?",(0,o.jsx)("textarea",{className:`${i}-textarea`,value:r,onChange:O=>s(O.target.value)})]}),(0,o.jsxs)("label",{className:`${i}-label`,children:["Extra beds",(0,o.jsx)("input",{type:"number",min:0,max:3,value:c,onChange:O=>d(Number(O.target.value))})]}),(0,o.jsxs)("label",{className:`${i}-label`,children:["Improvement slot",(0,o.jsxs)("select",{value:h,onChange:O=>p(Number(O.target.value)),children:[(0,o.jsx)("option",{value:0,children:"Slot 1"}),(0,o.jsx)("option",{value:1,children:"Slot 2"})]})]}),(0,o.jsxs)("div",{className:`${i}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:b||!a.trim()||!r.trim(),onClick:()=>V(!0),children:M?"Send counteroffer":"Approve exact request"}),(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:b,onClick:()=>V(!1),children:"Decline"})]}),f?(0,o.jsx)("p",{className:`${i}-error`,role:"alert",children:f}):null]})}function B2({room:e,nameColors:t,speechColors:a,picture:n,draft:r,mode:s,targetId:c,busy:d,error:h,greetingNotice:p,ruling:b,open:$,ended:f,playerName:y,playerPortrait:V,portraits:M,sprites:O,onDraft:N,onMode:v,onTarget:w,onSend:R,onViewVenue:H,onEnterPrivate:Z,privateSpaceOwnerName:te,onEnd:Q,onLeavePending:Te,endFailed:B,reviewing:re,onRetryGreeting:ve,onContinueWithoutGreeting:ht,notices:Me,onDismissNotice:Vt,debugDiscardEnabled:qt,onDebugDiscard:Ft,onUseMailbox:z,onProjects:j}){let[me,ye]=(0,m.useState)(0),[ae,Be]=(0,m.useState)(!1),[Ge,at]=(0,m.useState)(!1),[ie,st]=(0,m.useState)(!1),[qe,Ot]=(0,m.useState)(!1),[lt,$t]=(0,m.useState)(null),pe=(0,m.useRef)(null),ge=(0,m.useRef)(null),he=(0,m.useRef)(null),ct=(0,m.useRef)(null),St=(0,m.useRef)(null),nt=(0,m.useRef)(null),Lt=(0,m.useRef)(null),Ve=(0,m.useRef)(null),I=(0,m.useRef)(null),X=(0,m.useRef)(new Set);(0,m.useEffect)(()=>{let E=new Set(Me.map(_=>_.id)),x=Me.some(_=>_.kind==="memory"&&!X.current.has(_.id));X.current=E,x?st(!0):Me.length===0&&st(!1)},[Me,e.id]),(0,m.useEffect)(()=>{ae&&window.requestAnimationFrame(()=>nt.current?.focus())},[ae]),(0,m.useEffect)(()=>{if(!Ge)return;let E=_=>{Ve.current?.contains(_.target)||at(!1)},x=_=>{_.key==="Escape"&&at(!1)};return document.addEventListener("pointerdown",E),document.addEventListener("keydown",x),()=>{document.removeEventListener("pointerdown",E),document.removeEventListener("keydown",x)}},[Ge]),(0,m.useEffect)(()=>{if(!qe)return;let E=_=>{ct.current?.contains(_.target)||Ot(!1)},x=_=>{_.key==="Escape"&&Ot(!1)};return document.addEventListener("pointerdown",E),document.addEventListener("focusin",E),document.addEventListener("keydown",x),()=>{document.removeEventListener("pointerdown",E),document.removeEventListener("focusin",E),document.removeEventListener("keydown",x)}},[qe]);let we=(0,m.useCallback)(()=>{$t(null),window.requestAnimationFrame(()=>pe.current?.focus())},[]),je=new Set((e.submissions??[]).flatMap(E=>(E.recollections??[]).map(x=>x.id))).size;(0,m.useEffect)(()=>{if(!lt)return;window.requestAnimationFrame(()=>ge.current?.focus());let E=x=>{if(x.key==="Tab"){x.preventDefault(),ge.current?.focus();return}x.key==="Escape"&&(x.preventDefault(),we())};return window.addEventListener("keydown",E),()=>window.removeEventListener("keydown",E)},[we,lt]);let Le=(0,m.useMemo)(()=>{let E=[],x=L1(e.lines,e.submissions??[]),_=new Map,Y=new Map;for(let G of e.lines){if(G.kind!=="side"&&G.kind!=="whisper"||!G.asideFor)continue;let se=Y.get(G.asideFor)??[];se.push({register:G.kind,text:G.content,...G.targetId?{target:e.participants.find(We=>We.characterId===G.targetId)?.name??G.targetId}:{},speakerId:G.speakerId,name:G.name,expression:G.expression,gazeAt:G.gazeAt}),Y.set(G.asideFor,se),_.set(G.asideFor,[..._.get(G.asideFor)??[],G])}for(let G of e.lines){if(G.kind==="side"||G.kind==="whisper")continue;let se=G.speakerId.length===0,We=M1(G.content,G.beats??null),Ma=_.get(G.id??"")??[],pn=[G,...Ma].map(En=>x.get(En.id??"")),oa=pn.find(En=>En?.beforeIds)?.beforeIds,ta=pn.find(En=>En?.afterIds)?.afterIds;We.paragraphs.forEach((En,gn)=>{E.push({key:`${E.length}`,...e.stagingVersion===1?{stagingEvent:{cues:[...gn===0?Ng(G):[],...gn===We.paragraphs.length-1?Ma.flatMap(Ng):[]],...gn===0&&oa?{beforeIds:oa}:{},...gn===We.paragraphs.length-1&&ta?{afterIds:ta}:{}}}:{},speakerId:se?"":G.speakerId,name:se?y:G.name,player:se,text:En,asides:[...We.asides[gn]??[],...gn===We.paragraphs.length-1?Y.get(G.id??"")??[]:[]],...G.kind?{register:G.kind==="narration"?"narration":"speech"}:{},...G.expression?{expression:G.expression}:{},...G.gazeAt?{gazeAt:G.gazeAt}:{}})})}return E},[y,e.lines,e.participants,e.stagingVersion,e.submissions]);(0,m.useLayoutEffect)(()=>{ye(E=>_1(I.current,e.id,Le.length,E)),I.current={roomId:e.id,stepCount:Le.length}},[e.id,Le.length]);let Ne=Math.min(me,Math.max(0,Le.length-1)),oe=Le[Ne],P=(0,m.useMemo)(()=>e.stagingVersion===1?q1(e.participants.map(E=>E.characterId),Le.map(E=>E.stagingEvent??{})):[],[e.stagingVersion,e.participants,Le])[Ne],gt=P?.state??$g(e.participants.map(E=>E.characterId)),It=(0,m.useRef)(null),de=(0,m.useMemo)(()=>It.current?.roomId===e.id&&!It.current.restoring&&Ne>It.current.at,[e.id,Ne]);(0,m.useLayoutEffect)(()=>{let E=It.current?.roomId!==e.id;It.current={roomId:e.id,at:Ne,restoring:E&&Ne!==Math.max(0,Le.length-1)}},[e.id,Ne,Le.length]);let Re=Ne>0,Dt=Ne<Le.length-1,ft=!f&&e.status==="active"&&!Dt,wa=(0,m.useCallback)(()=>{let E=he.current;if(!E)return;let x=window.getComputedStyle(E),_=Number.parseFloat(x.lineHeight),Y=Number.parseFloat(x.paddingTop)+Number.parseFloat(x.paddingBottom),G=Math.ceil(_+Y),se=Math.ceil(_*2+Y);E.style.height="auto",E.style.height=`${Math.min(Math.max(E.scrollHeight,G),se)}px`,E.style.overflowY=E.scrollHeight>se+1?"auto":"hidden"},[]);(0,m.useLayoutEffect)(()=>{wa()},[ft,r,wa]),(0,m.useEffect)(()=>{let E=he.current?.parentElement;if(!E)return;let x=E.clientWidth,_=new ResizeObserver(()=>{E.clientWidth!==x&&(x=E.clientWidth,wa())});return _.observe(E),()=>_.disconnect()},[ft,wa]);let Pt=()=>{!ft||d||s!=="conclude"&&!r.trim()||s==="fulfill"&&!c||(Ot(!1),R())};(0,m.useLayoutEffect)(()=>{Lt.current&&(Lt.current.scrollTop=0)},[Ne,e.id]);let ea=oe?.register??(oe===void 0||oe.speakerId==="__venue_scene__"?"narration":oe.player||R1(oe.text)==="speech"?"speech":"narration"),At=oe===void 0?void 0:oe.player?V:M[oe.speakerId],kt=e.participants.filter(E=>e.activeIds.includes(E.characterId)),Ye=e.stagingVersion===1?e.participants.filter(E=>(P?.activeIds??e.activeIds).includes(E.characterId)):e.status==="closed"&&kt.length===0?e.participants:kt,qa=Ye.find(E=>E.characterId===oe?.speakerId),Nt=E=>Ru(a[E]),T=E=>Ru(t[E]),W=Ye.slice(0,4),le=Ye.filter(E=>!W.some(x=>x.characterId===E.characterId)),Pe=B1(W.map(E=>E.characterId),gt),Fe=(e.stagingVersion===1?(Pe[qa?.characterId??""]?.x??0)>.5:W.findIndex(E=>E.characterId===qa?.characterId)>=2)?"left":"right",Bt=(0,o.jsxs)("p",{className:`${i}-chat-pending`,role:"status",children:[(0,o.jsx)("span",{className:`${i}-chat-spinner ${i}-spin`,"aria-hidden":"true"}),(0,o.jsx)("span",{className:`${i}-chat-pending-label`,children:e.status==="opening"?"Opening the scene\u2026":e.status==="closing"?"Saving this visit\u2026":"The room is answering\u2026"})]});return(0,o.jsxs)("aside",{className:`${i}-chat`,"data-open":$?"true":"false","data-ended":f?"true":"false","data-opening-error":e.status==="opening"&&h?"true":"false","aria-label":`${e.area==="outside"?"Outside":"Inside"} ${e.placeName}`,children:[(0,o.jsx)("p",{className:`${i}-visually-hidden`,children:`Here now: ${kt.length?kt.map(E=>`${E.name}${E.doing?` is ${E.doing}`:""}`).join("; "):"nobody"}.`}),(0,o.jsx)("div",{className:`${i}-chat-scene`,"aria-hidden":"true",children:n?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("img",{className:`${i}-chat-scene-backdrop`,src:n,alt:""}),(0,o.jsx)("span",{className:`${i}-chat-scrim`}),(0,o.jsx)("span",{className:`${i}-chat-vignette`})]}):(0,o.jsx)("span",{className:`${i}-chat-scene-placeholder`,children:e.area==="outside"?"Exterior not drawn yet":"Interior / space not drawn yet"})}),(0,o.jsxs)("div",{className:`${i}-chat-head`,children:[(0,o.jsx)("span",{className:`${i}-room-place`,children:e.placeName}),(0,o.jsxs)("span",{ref:Ve,className:`${i}-chat-actions`,children:[(0,o.jsx)("button",{type:"button",className:`${i}-room-actions-trigger`,onClick:()=>at(E=>!E),"aria-label":"Venue actions","aria-haspopup":"menu","aria-expanded":Ge,children:"\xB7\xB7\xB7"}),Ge?(0,o.jsxs)("span",{className:`${i}-room-actions-menu`,role:"menu","aria-label":"Venue actions",children:[(0,o.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{at(!1),H()},disabled:d,children:"View Venue"}),Z?(0,o.jsxs)("button",{type:"button",role:"menuitem",onClick:()=>{at(!1),Z()},disabled:d,children:["Enter ",te??"private space"]}):null,(0,o.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{at(!1),f&&e.memoryPending?Te():Q()},disabled:d,children:f&&e.memoryPending?"Leave with memory pending":f?"Return to map":"End visit now"}),(B||e.status==="closing"||e.memoryPending)&&!f?(0,o.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{at(!1),Te()},children:"Leave with memory pending"}):null,qt&&e.status!=="closed"?(0,o.jsx)("button",{type:"button",role:"menuitem",onClick:()=>{at(!1),Ft()},disabled:d,children:"DEBUG: Discard Visit"}):null]}):null]})]}),e.area==="outside"?(0,o.jsx)("p",{className:`${i}-hint`,role:"status",children:e.spaceClass==="residence"?"You\u2019re outside this Residence. A resident needs to invite you in. You can speak in your own words, or leave whenever you like.":"You\u2019re outside this Venue. You can speak in your own words, or leave whenever you like."}):null,Me.length>0?(0,o.jsxs)("div",{className:`${i}-room-notices`,"aria-live":"polite",children:[(0,o.jsxs)("button",{type:"button",className:`${i}-room-notices-trigger`,onClick:()=>st(E=>!E),"aria-expanded":ie,"aria-label":`${Me.length} village ${Me.length===1?"notice":"notices"}`,children:["\u2726 ",Me.length]}),ie?(0,o.jsx)("div",{className:`${i}-room-stars`,"aria-live":"polite","aria-label":"Village events",children:Me.map(E=>(0,o.jsxs)("div",{className:`${i}-room-star`,children:[(0,o.jsx)("span",{"aria-hidden":"true",children:"\u2726"}),E.kind==="memory"&&E.detail?(0,o.jsx)("button",{type:"button",className:`${i}-room-star-detail`,onClick:x=>{pe.current=x.currentTarget,$t(E)},"aria-label":`View memory: ${E.text}`,title:"View saved memory",children:E.text}):(0,o.jsx)("span",{children:E.text}),(0,o.jsx)("button",{type:"button",className:`${i}-room-star-dismiss`,onClick:()=>{lt?.id===E.id&&$t(null),Vt(E.id)},"aria-label":`Dismiss ${E.text}`,title:"Dismiss notice",children:"\xD7"})]},E.id))}):null]}):null,lt?.detail?(0,o.jsx)("div",{className:`${i}-memory-backdrop`,onClick:E=>{E.currentTarget===E.target&&we()},children:(0,o.jsxs)("div",{className:`${i}-memory-dialog`,role:"dialog","aria-modal":"true","aria-labelledby":`${i}-memory-dialog-title`,children:[(0,o.jsxs)("div",{className:`${i}-memory-dialog-head`,children:[(0,o.jsx)("h2",{id:`${i}-memory-dialog-title`,children:lt.text}),(0,o.jsx)("button",{ref:ge,type:"button",onClick:we,"aria-label":"Close memory",children:"\xD7"})]}),(0,o.jsx)("p",{children:lt.detail})]})}):null,kt.length>0?(0,o.jsx)("div",{className:`${i}-chat-activities`,tabIndex:0,"aria-label":"What everyone here is doing",children:kt.map(E=>(0,o.jsx)("span",{className:`${i}-chat-activity`,children:`${E.name}: ${E.doing||"spending time here"}`},E.characterId))}):null,(0,o.jsxs)("div",{className:`${i}-chat-stage`,"aria-hidden":"true",children:[(0,o.jsx)("div",{className:`${i}-chat-cast`,"data-staging":e.stagingVersion===1?"true":"false","data-animate":de?"true":"false",children:W.map((E,x)=>{let _=O[E.characterId],Y=E.characterId===qa?.characterId,G=oe?.asides.find(ta=>ta.speakerId===E.characterId),se=e.stagingVersion===1?Pe[E.characterId]:void 0,We=se?gt[E.characterId].expression:Y?oe?.expression??"":G?.expression??"",Ma=Y?oe?.gazeAt:G?.gazeAt??(E.characterId===oe?.gazeAt?qa?.characterId:void 0),pn=W.findIndex(ta=>ta.characterId===Ma),oa=Y1(_?.images??[],We,se?.facing??j1(x,pn));return(0,o.jsxs)("div",{className:`${i}-chat-cast-person`,"data-active":E.characterId===qa?.characterId?"true":"false","data-sprite":oa?"true":"false","data-character-id":E.characterId,"data-position":se?gt[E.characterId].position:void 0,"data-attention":se?se.facing:void 0,style:{"--cast-center":`${(se?.x??(x+.5)/W.length)*100}%`,...se?{"--cast-left":`${(se.x-se.width/2)*100}%`,"--cast-width":`${se.width*100}%`}:{}},children:[oa?(0,o.jsx)("img",{src:oa.image.url,alt:"","data-framing":_?.framing.mode??"full","data-facing":oa.image.view==="front"?"front":oa.mirrored?"left":"right"}):(0,o.jsx)(Kr,{portrait:M[E.characterId],name:E.name,className:`${i}-avatar`}),(0,o.jsx)("span",{style:T(E.characterId),children:E.name})]},E.characterId)})}),le.length>0?(0,o.jsx)("div",{className:`${i}-chat-cast-rest`,children:le.map(E=>(0,o.jsxs)("span",{children:[(0,o.jsx)(Kr,{portrait:M[E.characterId],name:E.name,className:`${i}-avatar`}),(0,o.jsx)("span",{style:T(E.characterId),children:E.name})]},E.characterId))}):null]}),(0,o.jsxs)("div",{className:`${i}-chat-vn`,children:[ae?(0,o.jsx)("div",{ref:nt,className:`${i}-chat-log`,role:"log","aria-label":"Venue conversation history",tabIndex:0,onKeyDown:E=>{E.key==="Escape"&&(Be(!1),window.requestAnimationFrame(()=>St.current?.focus()))},children:e.lines.map((E,x)=>(0,o.jsxs)("p",{className:`${i}-chat-vn-text`,children:[(0,o.jsxs)("strong",{style:E.role==="assistant"&&E.kind!=="narration"?T(E.speakerId):void 0,children:[E.role==="user"?y:E.kind==="narration"||E.speakerId==="__venue_scene__"?"Narration":E.name||"Resident",E.kind==="side"?" \xB7 aside":E.kind==="whisper"?" \xB7 whisper":"",":"," "]}),(0,o.jsx)("span",{style:E.role==="assistant"&&E.kind!=="narration"?Nt(E.speakerId):void 0,children:Cs(E.content,`history-${x}-`)})]},E.id??x))}):null,oe&&oe.asides.length>0?(0,o.jsx)("div",{className:`${i}-chat-vn-asides`,"data-side":Fe,"aria-live":"polite",children:oe.asides.map((E,x)=>(0,o.jsxs)("div",{className:`${i}-chat-vn-aside`,"data-register":E.register,children:[(0,o.jsx)(Kr,{portrait:E.speakerId?M[E.speakerId]:At,name:E.name??oe.name,glyph:oe.player?"person":"initial",className:`${i}-chat-vn-aside-face`}),(0,o.jsxs)("div",{className:`${i}-chat-vn-aside-column`,children:[(0,o.jsxs)("p",{className:`${i}-chat-vn-aside-head`,children:[(0,o.jsx)("span",{className:`${i}-chat-vn-aside-icon`,children:E.register==="whisper"?"\u{1F92B}":"\u{1F4AC}"}),(0,o.jsx)("span",{className:`${i}-chat-vn-aside-name`,style:T(E.speakerId??oe.speakerId),children:E.name??oe.name}),E.register==="whisper"&&E.target?(0,o.jsx)("span",{className:`${i}-chat-vn-aside-target`,children:`\u2192 ${E.target}`}):null]}),(0,o.jsx)("p",{className:`${i}-chat-vn-aside-text`,style:Nt(E.speakerId??oe.speakerId),children:Cs(E.text,`vn-aside-${x}-`)})]})]},`${x}-${E.register}`))}):null,(0,o.jsx)("div",{className:`${i}-chat-vn-card`,"data-register":ea,children:(0,o.jsx)("div",{className:`${i}-chat-vn-row`,children:(0,o.jsxs)("div",{className:`${i}-chat-vn-column`,children:[ea==="narration"?(0,o.jsx)("p",{className:`${i}-chat-vn-label`,children:"Narration"}):(0,o.jsx)("p",{className:`${i}-chat-vn-name`,style:oe?.player?void 0:T(oe?.speakerId??""),children:oe?.name??""}),(0,o.jsxs)("div",{ref:Lt,className:`${i}-chat-vn-reading`,role:"region","aria-label":"Current paragraph","aria-live":"polite",tabIndex:0,children:[oe?ea==="narration"?(0,o.jsx)("p",{className:`${i}-chat-vn-beat`,"data-register":"narration",children:Cs(oe.text,"vn-beat-")}):(0,o.jsx)("p",{className:`${i}-chat-vn-text`,style:oe.player?void 0:Nt(oe.speakerId),children:Cs(oe.text,"vn-")}):(0,o.jsx)("p",{className:`${i}-chat-vn-text`,"data-empty":"true",children:e.status==="opening"?`Opening the scene in ${e.placeName}\u2026`:kt.length===0?`You are alone in ${e.placeName}.`:"\u2026"}),!f&&d?Bt:null]})]})})}),(0,o.jsxs)("div",{className:`${i}-room-panel-tools`,children:[e.lines.length>0?(0,o.jsx)("button",{ref:St,type:"button",className:`${i}-chat-history-toggle`,"aria-label":"History","aria-expanded":ae,onClick:()=>Be(E=>!E),children:ae?"Hide history":"History"}):null,(0,o.jsx)("span",{className:`${i}-chat-vn-counter`,children:`${Ne+1} / ${Math.max(1,Le.length)}`}),(0,o.jsxs)("span",{className:`${i}-chat-vn-nav`,children:[(0,o.jsxs)("button",{type:"button",className:`${i}-chat-vn-button`,onClick:()=>ye(Ne-1),disabled:!Re,"aria-label":"Previous paragraph",children:["\u2039 ",(0,o.jsx)("span",{children:"Previous"})]}),Dt?(0,o.jsxs)("button",{type:"button",className:`${i}-chat-vn-button`,onClick:()=>ye(Ne+1),"aria-label":"Next paragraph",children:[(0,o.jsx)("span",{children:"Next"})," \u203A"]}):f?(0,o.jsx)("button",{type:"button",className:`${i}-chat-vn-button`,onClick:e.memoryPending?Te:Q,disabled:d,children:e.memoryPending?"Leave with memory pending":"Return to map"}):null]})]}),h&&e.status==="opening"?(0,o.jsxs)("div",{className:`${i}-room-error`,role:"alert",children:[(0,o.jsx)("p",{children:h}),(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:Q,disabled:d,children:"Back to map"}),(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:ve,disabled:d,children:"Retry opening"}),e.id?(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:ht,disabled:d,children:"Continue without opening"}):null]}):null,p?(0,o.jsx)("div",{className:`${i}-room-error`,role:"status",children:(0,o.jsx)("p",{children:p})}):null,b?(0,o.jsx)("p",{className:`${i}-empty`,children:b}):null,e.status==="closing"||e.memoryPending?(0,o.jsx)("p",{className:`${i}-hint`,children:e.memoryPending?`Memory review ${re?"in progress":"pending"} \xB7 ${e.memoryReview?.nextRecollection??0}/${je} recollections reviewed. You can leave with memory pending and retry from Memories.`:"Closing this visit\u2026"}):null,f&&!e.memoryPending&&e.memoryReview?.status==="complete"&&!e.memoryReview.decisions?.some(E=>E.action==="promote")?(0,o.jsx)("p",{className:`${i}-hint`,role:"status",children:"Review complete. No durable memories were made from this visit."}):null,ft&&s==="fulfill"&&kt.length===0?(0,o.jsx)("p",{className:`${i}-hint`,children:"Nobody is here whose wish you can fulfill."}):null,ft?(0,o.jsxs)("div",{className:`${i}-composer`,children:[s==="fulfill"&&kt.length>0?(0,o.jsxs)("select",{value:c,onChange:E=>w(E.target.value),"aria-label":"Whose wish you fulfilled",disabled:d||f||e.status!=="active",children:[(0,o.jsx)("option",{value:"",children:"Choose one villager"}),kt.map(E=>(0,o.jsx)("option",{value:E.characterId,children:E.name},E.characterId))]}):null,(0,o.jsx)("div",{className:`${i}-composer-row`,children:(0,o.jsxs)("span",{className:`${i}-chat-input`,children:[(0,o.jsxs)("span",{ref:ct,className:`${i}-room-mode-anchor`,children:[(0,o.jsx)("button",{type:"button",className:`${i}-room-mode-toggle`,onClick:()=>Ot(E=>!E),"aria-label":`Mode: ${s==="chat"?"Chat":s==="fulfill"?"Fulfill":"Conclude"}. Choose mode`,"aria-haspopup":"menu","aria-expanded":qe,title:s==="chat"?"Chat":s==="fulfill"?"Fulfill":"Conclude",children:s==="chat"?"\u{1F4AC}":s==="fulfill"?"\u{1FAF4}":"\u{1F6AA}"}),qe?(0,o.jsx)("span",{className:`${i}-room-mode-menu`,role:"menu","aria-label":"Visit mode",children:["chat","fulfill","conclude"].map(E=>(0,o.jsx)("button",{type:"button",role:"menuitemradio","aria-checked":s===E,disabled:d||E==="fulfill"&&kt.length===0,onClick:()=>{v(E),Ot(!1)},children:E==="chat"?"Chat":E==="fulfill"?"Fulfill":"Conclude"},E))}):null]}),z?(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:z,title:"Use the Mailbox at home",children:"Use\u2026 Mailbox"}):null,j?(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:j,children:"Projects"}):null,(0,o.jsx)("textarea",{ref:he,className:`${i}-textarea`,rows:1,value:r,onChange:E=>N(E.target.value),onKeyDown:E=>{D1(E.key,E.shiftKey,E.nativeEvent.isComposing)&&(E.preventDefault(),Pt())},placeholder:s==="fulfill"?"What did you do for them?":s==="conclude"?"Final line (optional)\u2026":"Say or do something\u2026","aria-label":`Message at ${e.placeName}`,disabled:d||f||e.status!=="active"}),(0,o.jsx)("button",{type:"button",className:`${i}-chat-send`,onClick:Pt,disabled:d||f||e.status!=="active"||s!=="conclude"&&r.trim().length===0||s==="fulfill"&&!c,"aria-label":d?"Sending":"Send",title:d?"Sending":"Send",children:d?"Sending\u2026":"Send"})]})})]}):null,h&&e.status!=="opening"?(0,o.jsx)("div",{className:`${i}-room-error`,role:"alert",children:(0,o.jsx)("p",{children:h})}):null]})]})}function j2(e){return e==="index"||e==="general"?e:["chatlogs","progress","agendas","schedules"].includes(e)?"debug":"village"}var Y2={index:"Menu",villagers:"Villagers",noticeboard:"Noticeboard",venueRequests:"Venue Requests",projects:"Projects",memories:"Memories",village:"Village Settings",general:"General Settings",chatlogs:"Venue Visits",progress:"Progress",agendas:"Villager Wishes",schedules:"Villager Agendas"},G2="Testing action: runs normal time catch-up, then bypasses Background events and wishes for one visual Events update. It can spend a model call, but its prose cannot change memories, wishes, notices, venues, or resident behavior.",Og=["concept","approval","builder","requirements","materials","construction","finishing"],yx={concept:"Concept & placement",approval:"Affected villagers",builder:"Assign a Builder",requirements:"Define requirements",materials:"Prepare materials",construction:"Construction",finishing:"Finishing visit"};function P2({project:e,busy:t,onSave:a}){let[n,r]=(0,m.useState)(!1),[s,c]=(0,m.useState)(e.title),[d,h]=(0,m.useState)(()=>structuredClone(e.lifecycle.change)),p=d.improvement;return n?(0,o.jsxs)("section",{className:i+"-project-card",children:[(0,o.jsx)("p",{children:"Changing reviewed terms requires fresh affected-person approvals, a Builder agreement, and a checklist. Acquired supplies remain available."}),(0,o.jsxs)("label",{children:["Project name",(0,o.jsx)("input",{value:s,onChange:b=>c(b.target.value)})]}),(0,o.jsxs)("label",{children:["Reviewed change",(0,o.jsx)("textarea",{value:d.detail,onChange:b=>h({...d,detail:b.target.value})})]}),d.classes?(0,o.jsxs)("label",{children:["Base Classes",Es.map(b=>(0,o.jsxs)("label",{children:[(0,o.jsx)("input",{type:"checkbox",checked:d.classes.includes(b),onChange:$=>h({...d,classes:$.target.checked?[...d.classes,b]:d.classes.filter(f=>f!==b)})}),b]},b))]}):null,d.capacity!==void 0?(0,o.jsxs)("label",{children:["Residential capacity",(0,o.jsx)("input",{type:"number",min:1,max:4,value:d.capacity,onChange:b=>h({...d,capacity:Number(b.target.value)})})]}):null,p?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("label",{children:["Upgrade title",(0,o.jsx)("input",{value:p.title,onChange:b=>h({...d,improvement:{...p,title:b.target.value}})})]}),(0,o.jsxs)("label",{children:["Upgrade description",(0,o.jsx)("textarea",{value:p.description,onChange:b=>h({...d,improvement:{...p,description:b.target.value}})})]}),(0,o.jsxs)("label",{children:["Contributed Class",(0,o.jsxs)("select",{value:p.classContribution??"",onChange:b=>h({...d,improvement:{...p,classContribution:b.target.value||void 0}}),children:[(0,o.jsx)("option",{value:"",children:"No additional Class"}),Es.map(b=>(0,o.jsx)("option",{value:b,children:b},b))]})]}),(p.zones??[]).map((b,$)=>(0,o.jsxs)("section",{children:[(0,o.jsxs)("label",{children:["Zone name",(0,o.jsx)("input",{value:b.name,onChange:f=>h({...d,improvement:{...p,zones:p.zones.map((y,V)=>V===$?{...y,name:f.target.value}:y)}})})]}),(0,o.jsxs)("label",{children:["Zone description",(0,o.jsx)("textarea",{value:b.description,onChange:f=>h({...d,improvement:{...p,zones:p.zones.map((y,V)=>V===$?{...y,description:f.target.value}:y)}})})]}),(0,o.jsxs)("label",{children:["Zone kind",(0,o.jsxs)("select",{value:b.kind,onChange:f=>h({...d,improvement:{...p,zones:p.zones.map((y,V)=>V===$?{...y,kind:f.target.value,venueClass:f.target.value==="staff"?"workplace":f.target.value==="shared-residence"?"residence":p.classContribution??y.venueClass}:y)}}),children:[(0,o.jsx)("option",{value:"public",children:"Public"}),(0,o.jsx)("option",{value:"shared-residence",children:"Shared residential"}),(0,o.jsx)("option",{value:"staff",children:"Staff"})]})]}),(0,o.jsx)("button",{type:"button",className:i+"-button",onClick:()=>h({...d,improvement:{...p,zones:p.zones.filter((f,y)=>y!==$)}}),children:"Remove this zone"})]},b.id||$)),(0,o.jsx)("button",{type:"button",className:i+"-button",disabled:(p.zones?.length??0)>=16,onClick:()=>h({...d,improvement:{...p,zones:[...p.zones??[],{id:"",name:"",description:"",kind:"public",venueClass:p.classContribution??"other"}]}}),children:"Add a zone"})]}):null,(0,o.jsx)("button",{type:"button",className:i+"-button",disabled:t,onClick:async()=>{await a({title:s,...d})&&r(!1)},children:"Submit revised proposal"}),(0,o.jsx)("button",{type:"button",className:i+"-button",disabled:t,onClick:()=>r(!1),children:"Cancel revision"})]}):(0,o.jsx)("button",{type:"button",className:i+"-button",disabled:t,onClick:()=>r(!0),children:"Revise reviewed proposal"})}function X2({snapshot:e,room:t,onSnapshot:a,onReturn:n,onMap:r,onPlaceOnMap:s,mobile:c,debugEnabled:d,focusProjectId:h,siteProjectId:p}){let[b,$]=(0,m.useState)(h),[f,y]=(0,m.useState)(""),[V,M]=(0,m.useState)(""),[O,N]=(0,m.useState)("gathering"),[v,w]=(0,m.useState)(""),[R,H]=(0,m.useState)(""),[Z,te]=(0,m.useState)("upgrade"),[Q,Te]=(0,m.useState)(["gathering"]),[B,re]=(0,m.useState)(""),[ve,ht]=(0,m.useState)(2),[Me,Vt]=(0,m.useState)(0),[qt,Ft]=(0,m.useState)(0),[z,j]=(0,m.useState)("replace"),[me,ye]=(0,m.useState)(""),[ae,Be]=(0,m.useState)([]),[Ge,at]=(0,m.useState)(""),[ie,st]=(0,m.useState)(""),[qe,Ot]=(0,m.useState)(""),[lt,$t]=(0,m.useState)(null),[pe,ge]=(0,m.useState)(null),[he,ct]=(0,m.useState)({}),[St,nt]=(0,m.useState)(null),[Lt,Ve]=(0,m.useState)(!1),[I,X]=(0,m.useState)([]),[we,je]=(0,m.useState)(e.settings.personalizeVenueImagesByDefault!==!1),[Le,Ne]=(0,m.useState)(e.settings.useVisualLoreByDefault!==!1);(0,m.useEffect)(()=>{X([])},[b]);let[oe,Ze]=(0,m.useState)(!1),[P,gt]=(0,m.useState)("");(0,m.useEffect)(()=>{h&&$(h)},[h]);let It=e.projects.filter(T=>(T.kind==="new-venue"||T.kind==="renovation")&&T.lifecycle?.phase!=="complete"),de=It.find(T=>T.id===b)??null,Re=de?.lifecycle,Dt=e.settings.venues.find(T=>T.id===de?.venueId),ft=e.settings.venues.find(T=>T.id===R),wa=JSON.stringify(ft?.improvements?.[Me]??null);(0,m.useEffect)(()=>{let T=JSON.parse(wa);z==="modify"&&T?(M(T.title),w(T.description),Ft(T.extraBeds),re(T.spaceId??""),ye(T.classContribution??""),Be(T.zones??[])):(ye(""),re(""),Be([]))},[ft?.id,wa,Me,z]);let Pt=JSON.stringify(ft?.baseClasses??ft?.classes??["gathering"]);(0,m.useEffect)(()=>{Te(JSON.parse(Pt))},[ft?.id,Pt]);let ea=async(T,W={})=>{Ze(!0),gt("");try{let le=await L(T,{method:"POST",body:JSON.stringify(W)});return a(le),le}catch(le){return gt(F(le,"The Project could not be updated.")),null}finally{Ze(!1)}},At=(T,W={})=>de&&ea(`/projects/${encodeURIComponent(de.id)}/${T}`,W),kt=async()=>{let T=f==="new-venue"?{name:V,venueClass:O,description:v}:{title:V,detail:v,...Z==="class"&&ft?{classes:Q}:{},...Z==="capacity"?{capacity:ve}:{},...Z==="upgrade"?{slot:Me,improvement:{id:z==="modify"?ft?.improvements?.[Me]?.id:void 0,title:V,description:v,extraBeds:qt,spaceId:B||null,classContribution:me||void 0,zones:ae}}:{},...Z==="remove-upgrade"?{slot:Me,improvement:null}:{}},le=(await ea(f==="new-venue"?"/projects":`/projects/renovations/${encodeURIComponent(R)}`,T))?.projects.find(Pe=>Pe.kind===f&&Pe.lifecycle?.phase!=="complete");le&&($(le.id),y(""))},Ye=async T=>{if(de){Ze(!0),gt("");try{let W=await L("/setup/venue-image/generate",{method:"POST",body:JSON.stringify({venue:{id:Dt?.id||de.venueId||de.id,name:de.title,form:Ge||de.title,description:ie||de.venueDraft?.description||Dt?.description,spaceDescription:qe||Dt?.spaces?.[0]?.description||ie,venueClass:de.venueDraft?.classes?.[0]??Dt?.classes?.[0]??"other"},area:T,villageName:e.village.name,setting:e.settings.setting,worldFacts:e.settings.worldFacts,selectedLorebookIds:e.settings.selectedLorebookIds,sceneryArtStyle:e.settings.sceneryArtStyle,useVisualLore:Le,useAssignedVillagerContext:we})});nt({area:T,image:W})}catch(W){gt(F(W,"The Venue image could not be generated."))}finally{Ze(!1)}}},qa=async(T,W)=>{if(!(!W||!de)){Ze(!0),gt("");try{let le=await L("/setup/venue-image",{method:"PUT",body:JSON.stringify({name:de.title,image:await Ts(W)})});nt({area:T,image:le})}catch(le){gt(F(le,"The Venue image could not be uploaded."))}finally{Ze(!1)}}},Nt=Re?.phase;return de&&Nt==="finishing"&&Lt?(0,o.jsxs)("div",{className:`${i}-project-finish-visit`,children:[(0,o.jsxs)("header",{children:[(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Ve(!1),children:"Back to Project"}),(0,o.jsx)("h2",{children:de.kind==="new-venue"?`Open ${de.title}`:`Review ${de.title}`}),(0,o.jsx)("p",{children:de.kind==="new-venue"?"Give the finished place its form, exterior, and interior. Images are optional.":"Review the approved zone names, access, and descriptions, then choose final images if you wish."})]}),de.kind==="renovation"?(0,o.jsx)("button",{type:"button",className:i+"-button",disabled:oe,onClick:async()=>{await At("renew-approvals")&&Ve(!1)},children:"Renew approvals for current residents and workers"}):null,de.kind==="new-venue"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("label",{children:["Form",(0,o.jsx)("input",{value:Ge,onChange:T=>at(T.target.value),placeholder:"What is this place, physically?"})]}),(0,o.jsxs)("label",{children:["Exterior description",(0,o.jsx)("textarea",{value:ie,onChange:T=>st(T.target.value)})]}),(0,o.jsxs)("label",{children:["Interior description",(0,o.jsx)("textarea",{value:qe,onChange:T=>Ot(T.target.value)})]}),(0,o.jsxs)("label",{children:[(0,o.jsx)("input",{type:"checkbox",checked:we,onChange:T=>je(T.target.checked)}),"Use assigned villagers\u2019 personality for images"]}),(0,o.jsxs)("label",{children:[(0,o.jsx)("input",{type:"checkbox",checked:Le,onChange:T=>Ne(T.target.checked)}),"Use selected visual lore"]}),Dt?.classes?.includes("residence")?(0,o.jsx)("p",{children:"Each occupant receives a personal space when they move in."}):null,(0,o.jsx)($h,{rooms:I,onChange:X,workplace:Dt?.classes?.includes("workplace"),people:[{id:"player",name:"You"},...e.villagers.map(T=>({id:T.characterId,name:T.name}))]})]}):(0,o.jsx)("p",{children:Re?.change?.detail}),["exterior",...de.kind==="new-venue"?["interior"]:[]].map(T=>{let W=T==="exterior"?lt:pe;return(0,o.jsxs)("section",{className:`${i}-project-image`,children:[(0,o.jsxs)("h3",{children:[T==="exterior"?"Exterior":"Interior"," image \xB7 optional"]}),W?(0,o.jsx)("img",{src:W.url,alt:`${T} preview`}):(0,o.jsx)("p",{children:"No image chosen. A placeholder will be used."}),(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:oe,onClick:()=>{Ye(T)},children:"Generate image"}),(0,o.jsx)("input",{type:"file",accept:"image/*","aria-label":`Upload ${T} image`,disabled:oe,onChange:le=>{let Pe=le.target.files?.[0];le.target.value="",qa(T,Pe)}})]},T)}),de.kind==="renovation"?(Re?.change?.improvement?.zones??[]).map(T=>(0,o.jsxs)("section",{className:i+"-project-image",children:[(0,o.jsxs)("h3",{children:[T.name," \xB7 ",T.kind]}),(0,o.jsx)("p",{children:T.description}),he[T.id]?(0,o.jsx)("img",{src:he[T.id].url,alt:T.name+" preview"}):(0,o.jsx)("p",{children:"Image optional. Existing images are preserved."}),(0,o.jsxs)("label",{children:["Upload final zone image",(0,o.jsx)("input",{type:"file",accept:"image/*",disabled:oe,onChange:async W=>{let le=W.target.files?.[0];if(W.target.value="",!!le){Ze(!0);try{let Pe=await L("/setup/venue-image",{method:"PUT",body:JSON.stringify({name:T.name,image:await Ts(le)})});ct(Fe=>({...Fe,[T.id]:Pe}))}catch(Pe){gt(F(Pe,"The zone image could not be uploaded."))}finally{Ze(!1)}}}})]})]},T.id)):null,St?(0,o.jsxs)("section",{className:`${i}-project-image`,children:[(0,o.jsx)("img",{src:St.image.url,alt:"Generated Venue candidate"}),(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{St.area==="exterior"?$t(St.image):ge(St.image),nt(null)},children:"Use this image"}),(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>nt(null),children:"Discard"})]}):null,(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:oe||de.kind==="new-venue"&&(!Ge.trim()||!ie.trim()||!qe.trim()),onClick:async()=>{await At("open",{form:Ge,exteriorDescription:ie,interiorDescription:qe,exteriorImage:lt,interiorImage:pe,zoneImages:he,privateSpaces:I,imageContext:{useAssignedVillagerContext:we,useVisualLore:Le}})&&Ve(!1)},children:"Open Venue"}),P?(0,o.jsx)("p",{className:`${i}-error`,role:"alert",children:P}):null]}):(0,o.jsxs)("div",{className:`${i}-project-screen`,"data-mobile":c,children:[(0,o.jsxs)("header",{className:`${i}-project-head`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("span",{className:`${i}-project-eyebrow`,children:"PROJECTS"}),(0,o.jsx)("h2",{children:de?.title??"Build something in the Village"}),(0,o.jsx)("p",{children:de?de.kind==="new-venue"?"A new place, from blueprint to opening day.":"Change a place that already belongs to the Village.":"One New Venue and one Renovation may be underway at once."})]}),de?(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>$(""),children:"All Projects"}):null]}),de?(0,o.jsxs)("div",{className:`${i}-project-layout`,children:[(0,o.jsx)("nav",{className:`${i}-project-rail`,"aria-label":"Project phases",children:Og.filter(T=>T!=="approval"||de.kind==="renovation").map((T,W)=>{let le=Og.indexOf(Nt),Pe=Og.indexOf(T);return(0,o.jsxs)("div",{className:`${i}-project-step`,"data-state":Pe===le?"active":Pe<le?"done":"locked",children:[(0,o.jsx)("b",{children:Pe<le?"\u2713":W+1}),(0,o.jsx)("span",{children:yx[T]})]},T)})}),(0,o.jsxs)("main",{className:`${i}-project-card`,children:[de.kind==="renovation"&&!["construction","finishing","complete"].includes(Nt??"")?(0,o.jsx)(P2,{project:de,busy:oe,onSave:T=>ea(`/projects/${encodeURIComponent(de.id)}/revise`,T)},de.id+de.updatedAt):null,Nt==="concept"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h3",{children:"Place the blueprint"}),(0,o.jsx)("p",{children:de.venueDraft?.description}),(0,o.jsx)("p",{children:"Choose a clear spot on the Village map. The blueprint marks where this Venue will be built."}),(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>s(de.id),children:"Place on Village map"})]}):null,Nt==="approval"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h3",{children:"People affected by this change"}),(0,o.jsx)("p",{children:Re?.change?.detail}),(Re?.change?.improvement?.zones??[]).map(T=>(0,o.jsxs)("p",{children:[(0,o.jsx)("strong",{children:T.name})," \xB7 ",T.kind,": ",T.description]},T.id)),(0,o.jsx)("p",{children:"They may approve in conversation or reply through Mailbox. Every affected resident or worker must agree before you ask for a Builder."}),Re?.affectedIds.map(T=>(0,o.jsxs)("p",{children:[e.villagers.find(W=>W.characterId===T)?.name??T,":"," ",Re.approvals.some(W=>W.residentId===T)?"Approved":"Awaiting approval"]},T)),(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:oe,onClick:()=>{At("request-approval")},children:"Ask remaining villagers through Mailbox"})]}):null,Nt==="builder"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h3",{children:"Find a Builder"}),(0,o.jsx)("p",{children:"Find villagers on the map and ask them about this Project in a real conversation. Their clear agreements appear here automatically."}),e.progressEngineVersion!==1?(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:oe,onClick:()=>{At("recheck-builder")},children:"Review recent chats for missed agreements"}):null,Re?.candidates.length?Re.candidates.map(T=>(0,o.jsxs)("button",{type:"button",className:`${i}-button`,disabled:oe,onClick:()=>{At("builder",{residentId:T.residentId})},children:["Assign"," ",e.villagers.find(W=>W.characterId===T.residentId)?.name??"this Villager"]},T.residentId)):(0,o.jsx)("p",{children:"No one has agreed yet."})]}):null,Nt==="requirements"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h3",{children:"Define requirements with your Builder"}),(0,o.jsxs)("p",{children:["Ask"," ",e.villagers.find(T=>T.characterId===Re?.builderId)?.name??"your Builder"," ","what this job needs. They decide the materials, functional equipment, and finishing supplies. Their checklist appears here automatically."]}),Re?.requirements.length?(0,o.jsxs)("div",{children:[Re.requirements.map(T=>(0,o.jsxs)("p",{children:[(0,o.jsx)("strong",{children:T.category})," \xB7 ",T.needed?T.title:"Not needed"]},T.id)),(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:oe,onClick:()=>{At("requirements")},children:"Accept Builder's plan"}),(0,o.jsx)("p",{children:"To change it, discuss a revision with the Builder."})]}):(0,o.jsx)("p",{children:"Waiting for the Builder's plan."}),Re?.candidates.filter(T=>T.residentId!==Re.builderId).map(T=>(0,o.jsxs)("button",{type:"button",className:`${i}-button`,disabled:oe,onClick:()=>{At("builder",{residentId:T.residentId})},children:["Switch to"," ",e.villagers.find(W=>W.characterId===T.residentId)?.name??"another Builder"]},T.residentId))]}):null,Nt==="materials"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h3",{children:"Prepare materials"}),(0,o.jsx)("p",{children:"Find each supply in the Village, then bring it to this blueprint site. Offers and handoffs are recognized during your visits. Deliveries update the list here."}),Re?.requirements.filter(T=>T.needed).map(T=>(0,o.jsxs)("div",{className:`${i}-project-material`,children:[(0,o.jsx)("strong",{children:T.title}),(0,o.jsx)("span",{children:T.deliveredAt?"Delivered":T.carriedAt?"Ready to deliver":"Find and obtain"}),e.progressEngineVersion===1&&!T.carriedAt?(0,o.jsx)(o.Fragment,{children:Re.sources?.some(W=>W.requirementId===T.id)?(0,o.jsx)("p",{children:"The supplier\u2019s handoff will be recognized during your visit."}):(0,o.jsxs)(o.Fragment,{children:[(Re.recordedItems??[]).filter(W=>W.itemName.toLocaleLowerCase()===T.title.toLocaleLowerCase()).map(W=>(0,o.jsxs)("button",{type:"button",className:`${i}-button`,disabled:oe,onClick:()=>{At("existing-source",{requirementId:T.id,venueId:W.venueId,zoneId:W.zoneId})},children:["Choose available item at"," ",e.settings.venues.find(le=>le.id===W.venueId)?.name??"Venue",W.zoneId?" \xB7 "+(e.settings.venues.find(le=>le.id===W.venueId)?.zones?.find(le=>le.id===W.zoneId)?.name??"Zone"):""]},W.venueId+":"+W.zoneId+":"+W.itemName)),(Re.heldSupplies??[]).filter(W=>!W.assignedRequirementId&&W.itemName.toLocaleLowerCase()===T.title.toLocaleLowerCase()).map(W=>(0,o.jsxs)("button",{type:"button",className:`${i}-button`,disabled:oe,onClick:()=>{At("reallocate-held",{requirementId:T.id,heldId:W.id})},children:["Commit previously acquired ",W.itemName,W.deliveredAt?" (already delivered)":""]},W.id))]})}):null,T.carriedAt&&!T.deliveredAt&&p===de.id?(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:oe,onClick:()=>{At("deliver",{requirementId:T.id})},children:"Deliver at blueprint site"}):null,T.carriedAt&&!T.deliveredAt&&p!==de.id?(0,o.jsx)("span",{children:"Visit this Project's blueprint on the Village map to deliver it."}):null]},T.id)),(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:oe||Re?.requirements.some(T=>T.needed&&!T.deliveredAt),onClick:()=>{At("start")},children:"Begin construction"})]}):null,Nt==="construction"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h3",{children:"Construction is underway"}),(0,o.jsxs)("p",{children:[e.villagers.find(T=>T.characterId===Re?.builderId)?.name??"The Builder"," is focused on this site for 24 hours, with normal rest and essential breaks."]}),Re?.workOrder?(0,o.jsxs)("p",{children:["Expected completion: ",new Date(Re.workOrder.completesAt).toLocaleString()]}):null,Re?.blockedReason?(0,o.jsx)("p",{role:"status",children:Re.blockedReason}):null,de.status==="blocked"?Re?.candidates.filter(T=>T.residentId!==Re.builderId).map(T=>(0,o.jsxs)("button",{type:"button",className:`${i}-button`,onClick:()=>{At("builder",{residentId:T.residentId})},children:["Continue with"," ",e.villagers.find(W=>W.characterId===T.residentId)?.name??"Builder"]},T.residentId)):null,d&&de.status==="building"?(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:oe,onClick:()=>{At("debug-complete")},children:"DEBUG: Complete construction now"}):null]}):null,Nt==="finishing"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h3",{children:"Construction is complete"}),(0,o.jsxs)("p",{children:["Visit the finished ",de.kind==="new-venue"?"Venue":"Renovation"," to define its final details and open it to the Village."]}),(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Ve(!0),children:"Visit finished Venue"})]}):null,P?(0,o.jsx)("p",{className:`${i}-error`,role:"alert",children:P}):null,(0,o.jsx)("footer",{className:`${i}-project-footer`,children:t?.status==="active"?(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:n,children:"Return to current visit"}):(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:r,children:"Back to map"})})]})]}):(0,o.jsxs)("div",{className:`${i}-project-slots`,children:[["new-venue","renovation"].map(T=>{let W=It.find(le=>le.kind===T);return(0,o.jsxs)("button",{type:"button",className:`${i}-project-slot`,onClick:()=>W?$(W.id):y(T),children:[(0,o.jsx)("span",{children:T==="new-venue"?"NEW VENUE":"RENOVATION"}),(0,o.jsx)("strong",{children:W?.title??(T==="new-venue"?"Imagine a new place":"Change an existing Venue")}),(0,o.jsx)("small",{children:W?.lifecycle?yx[W.lifecycle.phase]??"Opening":"Available"})]},T)}),f?(0,o.jsxs)("section",{className:`${i}-project-card ${i}-project-create`,children:[(0,o.jsx)("h3",{children:f==="new-venue"?"Describe the new Venue":"Describe the Renovation"}),f==="renovation"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("label",{children:["Venue",(0,o.jsxs)("select",{value:R,onChange:T=>H(T.target.value),children:[(0,o.jsx)("option",{value:"",children:"Choose a Venue"}),e.settings.venues.filter(T=>T.constructionStatus!=="worksite").map(T=>(0,o.jsx)("option",{value:T.id,children:T.name},T.id))]})]}),(0,o.jsxs)("label",{children:["Physical change",(0,o.jsxs)("select",{value:Z,onChange:T=>te(T.target.value),children:[(0,o.jsx)("option",{value:"upgrade",children:"Add or replace an Upgrade"}),(0,o.jsx)("option",{value:"remove-upgrade",children:"Remove an Upgrade"}),(0,o.jsx)("option",{value:"class",children:"Change base Classes"}),(0,o.jsx)("option",{value:"capacity",children:"Change Residence capacity"})]})]}),Z==="class"?(0,o.jsxs)("fieldset",{children:[(0,o.jsx)("legend",{children:"Base Classes"}),(0,o.jsx)("p",{children:"Choose one or two base Classes. Upgrade contributions also count toward the two-Class limit."}),Es.map(T=>(0,o.jsxs)("label",{children:[(0,o.jsx)("input",{type:"checkbox",checked:Q.includes(T),onChange:W=>Te(le=>W.target.checked?[...le,T]:le.filter(Pe=>Pe!==T))}),T]},T))]}):null,Z==="capacity"?(0,o.jsxs)("label",{children:["Capacity",(0,o.jsx)("input",{type:"number",min:1,max:4,value:ve,onChange:T=>ht(Number(T.target.value))})]}):null,Z==="upgrade"||Z==="remove-upgrade"?(0,o.jsxs)("label",{children:["Upgrade slot",(0,o.jsxs)("select",{value:Me,onChange:T=>Vt(Number(T.target.value)),children:[(0,o.jsxs)("option",{value:0,children:["Slot 1 \xB7 ",ft?.improvements?.[0]?.title??"empty"]}),(0,o.jsxs)("option",{value:1,children:["Slot 2 \xB7 ",ft?.improvements?.[1]?.title??"empty"]})]})]}):null,Z==="upgrade"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("label",{children:["Upgrade action",(0,o.jsxs)("select",{value:z,onChange:T=>j(T.target.value),children:[(0,o.jsx)("option",{value:"replace",children:"Add or replace this Upgrade"}),ft?.improvements?.[Me]?(0,o.jsx)("option",{value:"modify",children:"Modify the existing Upgrade"}):null]})]}),(0,o.jsxs)("label",{children:["Class contributed",(0,o.jsxs)("select",{value:me,onChange:T=>ye(T.target.value),children:[(0,o.jsx)("option",{value:"",children:"No additional Class"}),Es.map(T=>(0,o.jsx)("option",{value:T,children:T},T))]})]}),(0,o.jsxs)("label",{children:["Existing area improved (optional)",(0,o.jsxs)("select",{value:B,onChange:T=>re(T.target.value),children:[(0,o.jsx)("option",{value:"",children:"No existing area"}),ft?.zones?.filter(T=>T.kind!=="private-residence").map(T=>(0,o.jsx)("option",{value:T.id,children:T.name},T.id))]})]}),(0,o.jsx)("p",{children:"A Venue supports at most two distinct Classes, including its Upgrades. An Upgrade can add zones or improve an existing area."}),(ae??[]).map((T,W)=>(0,o.jsxs)("section",{className:i+"-project-card",children:[(0,o.jsxs)("label",{children:["Zone name",(0,o.jsx)("input",{value:T.name,onChange:le=>Be(Pe=>Pe?.map((Fe,Bt)=>Bt===W?{...Fe,name:le.target.value}:Fe))})]}),(0,o.jsxs)("label",{children:["Area",(0,o.jsxs)("select",{value:T.kind,onChange:le=>Be(Pe=>Pe?.map((Fe,Bt)=>Bt===W?{...Fe,kind:le.target.value,venueClass:le.target.value==="shared-residence"?"residence":le.target.value==="staff"?"workplace":me||ft?.classes?.[0]||"other"}:Fe)),children:[(0,o.jsx)("option",{value:"public",children:"Public \xB7 everyone"}),(0,o.jsx)("option",{value:"shared-residence",children:"Shared living \xB7 residents and guests"}),(0,o.jsx)("option",{value:"staff",children:"Staff \xB7 all current workers and guests"}),(0,o.jsx)("option",{value:"restricted",children:"Private \xB7 assigned controllers and guests"})]})]}),["staff","restricted"].includes(T.kind)?(0,o.jsxs)("label",{children:["Purpose",(0,o.jsx)("input",{value:T.purpose??"",maxLength:240,onChange:le=>Be(Pe=>Pe?.map((Fe,Bt)=>Bt===W?{...Fe,purpose:le.target.value}:Fe))})]}):null,T.kind==="restricted"?(0,o.jsxs)("fieldset",{children:[(0,o.jsx)("legend",{children:"Room controllers"}),e.villagers.map(le=>(0,o.jsxs)("label",{children:[(0,o.jsx)("input",{type:"checkbox",checked:T.controllerIds?.includes(le.characterId)??!1,onChange:Pe=>Be(Fe=>Fe?.map((Bt,E)=>E===W?{...Bt,controllerIds:Pe.target.checked?[...Bt.controllerIds??[],le.characterId]:Bt.controllerIds?.filter(x=>x!==le.characterId)}:Bt))}),le.name]},le.characterId))]}):null,(0,o.jsxs)("label",{children:["Description",(0,o.jsx)("textarea",{value:T.description,onChange:le=>Be(Pe=>Pe?.map((Fe,Bt)=>Bt===W?{...Fe,description:le.target.value}:Fe))})]}),(0,o.jsx)("button",{type:"button",className:i+"-button",onClick:()=>Be(le=>le?.filter((Pe,Fe)=>Fe!==W)),children:"Remove from proposal"})]},T.id??W)),(0,o.jsx)("button",{type:"button",className:i+"-button",onClick:()=>Be(T=>[...T??[],{name:"",kind:"public",description:"",venueClass:me||ft?.classes?.[0]||"other"}]),children:"Add a Zone to this Upgrade"})]}):null,Z==="upgrade"?(0,o.jsxs)("label",{children:["Extra beds",(0,o.jsx)("input",{type:"number",min:0,max:3,value:qt,onChange:T=>Ft(Number(T.target.value))})]}):null]}):(0,o.jsxs)("label",{children:["Venue Class",(0,o.jsxs)("select",{value:O,onChange:T=>N(T.target.value),children:[(0,o.jsx)("option",{value:"residence",children:"Residence"}),(0,o.jsx)("option",{value:"workplace",children:"Workplace"}),(0,o.jsx)("option",{value:"gathering",children:"Gathering"}),(0,o.jsx)("option",{value:"other",children:"Other"})]})]}),(0,o.jsxs)("label",{children:[f==="new-venue"?"Venue name":"Project name",(0,o.jsx)("input",{value:V,onChange:T=>M(T.target.value),placeholder:"Give this place a name"})]}),(0,o.jsxs)("label",{children:["What would this ",f==="new-venue"?"place":"change"," be like in the Village?",(0,o.jsx)("textarea",{value:v,onChange:T=>w(T.target.value)})]}),(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:oe||!V.trim()||!v.trim()||f==="renovation"&&(!R||Z==="class"&&(!Q.length||Q.length>2)),onClick:()=>{kt()},children:f==="new-venue"?"Continue to map placement":"Start Renovation"})]}):null]}),!de&&P?(0,o.jsx)("p",{className:`${i}-error`,role:"alert",children:P}):null]})}function Z2({characterId:e,total:t,busy:a,onCorrect:n}){let[r,s]=(0,m.useState)(null),[c,d]=(0,m.useState)(!1),[h,p]=(0,m.useState)(""),b=async $=>{d(!0),p("");try{s(await L(`/agendas/${encodeURIComponent(e)}/history${$===void 0?"":`?cursor=${encodeURIComponent($)}`}`))}catch(f){p(F(f,"Wish history could not be read."))}finally{d(!1)}};return(0,o.jsxs)("details",{className:`${i}-agenda-notes`,onToggle:$=>{$.currentTarget.open&&!r&&!c&&b()},children:[(0,o.jsx)("summary",{children:`Wish history (${t})`}),h?(0,o.jsx)("p",{role:"alert",children:h}):null,c?(0,o.jsx)("p",{children:"Loading wish history\u2026"}):null,(0,o.jsx)("ul",{className:`${i}-story`,children:r?.entries.map($=>(0,o.jsxs)("li",{className:`${i}-wish-card`,children:[(0,o.jsx)("p",{className:`${i}-wish-text`,children:$.wish.wish}),(0,o.jsx)("p",{className:`${i}-wish-meta`,children:`${$.correctedAt?"Corrected":$.kind==="fulfilled"?"Fulfilled":"Expired"} ${new Date($.correctedAt||$.fulfilledAt).toLocaleDateString()}`}),$.kind==="fulfilled"&&!$.correctedAt?(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:a||c,onClick:()=>{(async()=>{await n(e,$.wish.id),await b()})()},children:"Mark as not fulfilled"}):null]},$.sequence))}),(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:c,onClick:()=>{b()},children:"Latest outcomes"}),r?.nextCursor?(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:c,onClick:()=>{b(r.nextCursor)},children:"Older outcomes"}):null]})}function Q2({element:e}){let[t,a]=(0,m.useState)(!1);(0,m.useLayoutEffect)(()=>{let l=()=>{let g=e.getBoundingClientRect();a(g.width<=704||g.width<=880&&g.height<=512)};l();let u=new ResizeObserver(l);return u.observe(e),()=>u.disconnect()},[e]);let[n,r]=(0,m.useState)(null),s=n?.settings.homeBuildings??[],[c,d]=(0,m.useState)(null),[h,p]=(0,m.useState)(null),[b,$]=(0,m.useState)(null),[f,y]=(0,m.useState)(0),[V,M]=(0,m.useState)(0),[O,N]=(0,m.useState)(0),[v,w]=(0,m.useState)(null),[R,H]=(0,m.useState)(!1),[Z,te]=(0,m.useState)(""),[Q,Te]=(0,m.useState)(""),[B,re]=(0,m.useState)(""),[ve,ht]=(0,m.useState)(null),[Me,Vt]=(0,m.useState)(null),[qt,Ft]=(0,m.useState)(!1),[z,j]=(0,m.useState)("home"),[me,ye]=(0,m.useState)(""),[ae,Be]=(0,m.useState)(""),[Ge,at]=(0,m.useState)(""),[ie,st]=(0,m.useState)(null),[qe,Ot]=(0,m.useState)("view"),[lt,$t]=(0,m.useState)("exterior");(0,m.useEffect)(()=>{if(lt==="exterior")return;let l=n?.settings.venues.find(g=>g.id===ie);l?.zones?.some(g=>g.id===lt)||(lt.startsWith("class:")?l&&ei(l).includes(lt.slice(6)):l&&lt.startsWith("private:")&&(l.residentIds??(l.occupancy.residentCharacterId?[l.occupancy.residentCharacterId]:[])).includes(lt.slice(8))&&l.privateSpaces?.some(g=>g.ownerId===lt.slice(8)))||$t("exterior")},[n,ie,lt]);let[pe,ge]=(0,m.useState)(null),[he,ct]=(0,m.useState)(null),[St,nt]=(0,m.useState)(!1),[Lt,Ve]=(0,m.useState)(""),[I,X]=(0,m.useState)(""),[we,je]=(0,m.useState)(""),[Le,Ne]=(0,m.useState)(null),[oe,Ze]=(0,m.useState)(!1),[P,gt]=(0,m.useState)("index"),It=j2(P),[de,Re]=(0,m.useState)({}),[Dt,ft]=(0,m.useState)(null),wa=(0,m.useRef)(null),Pt=(0,m.useRef)([]),[ea,At]=(0,m.useState)({}),[kt,Ye]=(0,m.useState)({}),[qa,Nt]=(0,m.useState)(""),[T,W]=(0,m.useState)(null),[le,Pe]=(0,m.useState)(""),[Fe,Bt]=(0,m.useState)(""),[E,x]=(0,m.useState)(""),[_,Y]=(0,m.useState)(null),[G,se]=(0,m.useState)(""),[We,Ma]=(0,m.useState)([]),[pn,oa]=(0,m.useState)(1600),[ta,En]=(0,m.useState)([]),[gn,Lg]=(0,m.useState)(1600),[Vu,Ax]=(0,m.useState)(null),[Bg,jg]=(0,m.useState)(""),[oc,Wr]=(0,m.useState)([]),[Yg,Rx]=(0,m.useState)(""),[As,Ei]=(0,m.useState)(!1),[eo,to]=(0,m.useState)(!1),[Mx,sc]=(0,m.useState)(null),[ao,Rs]=(0,m.useState)(null),[fn,Ou]=(0,m.useState)(!1),[Ms,no]=(0,m.useState)(!1),[io,Gg]=(0,m.useState)(!1),[Pg,zx]=(0,m.useState)(""),[Xg,Vx]=(0,m.useState)({}),[zs,Zg]=(0,m.useState)({}),[lc,Qg]=(0,m.useState)(""),[Xe,cc]=(0,m.useState)(0),[An,Fg]=(0,m.useState)(""),[xa,Jg]=(0,m.useState)(""),[ti,Kg]=(0,m.useState)("rebuild"),[Ka,Iu]=(0,m.useState)(Jr("rebuild").premise),[Vs,Wg]=(0,m.useState)(""),[bn,ef]=(0,m.useState)({...Ws}),[Ox,Ix]=(0,m.useState)(Cg),[ai,tf]=(0,m.useState)([]),[Oe,Ai]=(0,m.useState)([]),[Rn,af]=(0,m.useState)(1),[Du,Dx]=(0,m.useState)({x:.5,y:.5}),[nf,ni]=(0,m.useState)(!1),[pr,_u]=(0,m.useState)([]),[rf,dc]=(0,m.useState)(""),ii=(0,m.useRef)(null),[Mn,uc]=(0,m.useState)($r["Painted illustration"]),[zn,hc]=(0,m.useState)(!0),[Vn,mc]=(0,m.useState)(!0),[ro,of]=(0,m.useState)(!0),[sf,vn]=(0,m.useState)(null),[Os,Is]=(0,m.useState)(null),[Ds,pc]=(0,m.useState)(!1),[lf,Hu]=(0,m.useState)(""),[gc,cf]=(0,m.useState)(J1),[dt,gr]=(0,m.useState)("generate"),[_x,Uu]=(0,m.useState)(""),[fc,qu]=(0,m.useState)(null),[Hx,df]=(0,m.useState)(""),[_s,Lu]=(0,m.useState)(null),[oo,Bu]=(0,m.useState)(""),[so,ju]=(0,m.useState)(""),Hs=JSON.stringify({scenario:ti,premise:Ka.trim(),direction:Vs.trim(),setting:xa.trim(),lorebooks:ta,loreBudget:gn,persona:E,artStyle:Mn,personalityDefault:zn,visualLoreDefault:Vn}),Yu=(0,m.useRef)(Hs),uf=(0,m.useRef)(Oe);(0,m.useEffect)(()=>{uf.current=Oe},[Oe]),(0,m.useEffect)(()=>{Yu.current!==Hs&&n?.isFounded,Yu.current=Hs},[Hs,n?.isFounded]);let Gu=JSON.stringify({setting:xa.trim(),worldFacts:n?.isFounded?ai:null,lorebooks:ta,artStyle:Mn,useVisualLore:ro,structure:oo,negative:so,options:gc}),[$a,Us]=(0,m.useState)(!1),[hf,bc]=(0,m.useState)(""),[Pu,Ux]=(0,m.useState)("Connections are still loading."),[mf,pf]=(0,m.useState)(!1),[qx,qs]=(0,m.useState)(!1),[Xu,Ee]=(0,m.useState)(""),[Lx,vc]=(0,m.useState)(!1),[lo,Zu]=(0,m.useState)(""),[On,co]=(0,m.useState)(null),[Qu,ri]=(0,m.useState)(null),[gf,yc]=(0,m.useState)(!1),[In,uo]=(0,m.useState)(""),[ff,oi]=(0,m.useState)(null),ho=n?.settings.townMapView??nc("cover"),bf=n?{width:n.settings.townMapExpectedWidth,height:n.settings.townMapExpectedHeight}:null,Bx=On?.size??bf,vf=n?dt==="existing"?{width:n.settings.townMapExpectedWidth,height:n.settings.townMapExpectedHeight}:_s&&fc===dt?_s:{width:n.settings.townMapGenerationWidth,height:n.settings.townMapGenerationHeight}:null,jx=n?{min:n.settings.townMapZoomMin,max:n.settings.townMapZoomMax,step:n.settings.townMapZoomStep}:{min:1,max:1,step:.1},Yx=Ms?null:On?On.image:lo||null,fr=dt==="none"?null:dt==="existing"?lo||null:fc===dt&&(dt!=="generate"||Hx===Gu)&&_x||null,wc=On!==null||gf,br=wc?Qu??ho:ho,Fu=On?Rg(On.size):null,[Ri,bt]=(0,m.useState)(""),[Na,be]=(0,m.useState)(""),[ee,ce]=(0,m.useState)(!1),[D,He]=(0,m.useReducer)((l,u)=>{let g=typeof u=="function"?u(l):u;return l?.id&&l.id===g?.id&&(l.sceneRevision??0)>(g.sceneRevision??0)?l:g},null),[Gx,Ls]=(0,m.useState)(!1),[Px,Wa]=(0,m.useState)(!1),[vr,en]=(0,m.useState)(""),[Bs,xc]=(0,m.useState)("chat"),[js,$c]=(0,m.useState)(""),[Xx,yf]=(0,m.useState)(""),[Zx,yn]=(0,m.useState)([]),wn=(0,m.useRef)(new Set),[Ys,Qx]=(0,m.useState)(!1),wf=(0,m.useRef)(0),mo=(0,m.useRef)(0),xf=(0,m.useRef)(""),[Ju,po]=(0,m.useState)(""),[ga,Ct]=(0,m.useState)(!1),[Gs,$f]=(0,m.useState)(""),Nc=(0,m.useRef)(new Set),si=(0,m.useRef)(!1),li=(0,m.useRef)(null),go=(0,m.useRef)(null),fa=(0,m.useRef)(null),Dn=(0,m.useCallback)(l=>{let u=[];for(let g of l)wn.current.has(g.id)||(wn.current.add(g.id),u.push(g));u.length>0&&yn(g=>[...g,...u])},[]),Ps=(0,m.useRef)(!1),[Fx,Rt]=(0,m.useState)(""),[Xs,Mi]=(0,m.useState)(null),[Jx,yr]=(0,m.useState)(""),[fo,ci]=(0,m.useState)(!1),[Nf,Ku]=(0,m.useState)(""),Sf=(0,m.useRef)(""),Sc=(0,m.useRef)(!1),[Wu,kf]=(0,m.useState)(!1),eh=(0,m.useRef)(null),th=(0,m.useRef)(null);(0,m.useEffect)(()=>{let l=th.current,u=eh.current;l===null||!u||(th.current=null,u.focus(),u.setSelectionRange(l,l))},[Fe]);let ah=(0,m.useRef)(n);(0,m.useEffect)(()=>{ah.current=n},[n]);let Zs=(0,m.useRef)(null),bo=(0,m.useCallback)(async(l=!1)=>{if(Sc.current)return null;Sc.current=!0;let u=setTimeout(()=>kf(!0),v2);try{let g=await L("/reconcile",{method:"POST",body:l?JSON.stringify({forceStory:!0,...Zs.current??(Zs.current={id:hr(),expectedAttempt:ah.current?.backgroundWork?.find(k=>k.kind==="story")?.attempt??0}),actionId:Zs.current.id}):void 0});return r(g),l&&(Zs.current=null),g}catch{return null}finally{clearTimeout(u),kf(!1),Sc.current=!1}},[]),Kx=(0,m.useCallback)(async()=>{let l=n?.happenings[0]?.id??"";Ku("Writing...");let u=await bo(!0);if(!u){Ku("The update request failed. Check the village again before retrying; time catch-up may already have run.");return}Ku(u.backgroundWork?.some(g=>g.kind==="story"&&["queued","running","paused"].includes(g.status))?"The event is queued. See Background work for progress.":(u.happenings[0]?.id??"")===l?"No new happening was added. Other village records may have changed during catch-up.":"A new visual event was added. See Events.")},[n,bo]),Ie=(0,m.useCallback)(async(l={})=>{try{let u=await L("",{signal:l.signal});r(u),bt("")}catch(u){if(l.signal?.aborted||l.quiet)return;r(null),bt(F(u,"Could not read the village."))}},[]),Qs=(0,m.useRef)("");(0,m.useEffect)(()=>{if(!n?.isFounded)return;Qs.current||(Qs.current=hr());let l=0,u=async()=>{let U=++l,K=document.visibilityState==="visible"&&e.checkVisibility({checkVisibilityCSS:!0});try{let Se=await L("/background/presence",{method:"POST",body:JSON.stringify({sessionId:Qs.current,visible:K})});K&&U===l&&(Se.snapshot?r(Se.snapshot):(await bo(),await Ie({quiet:!0})))}catch{}};u();let g=window.setInterval(()=>{u()},3e4),k=()=>{u()};document.addEventListener("visibilitychange",k);let A=new IntersectionObserver(k);return A.observe(e),()=>{A.disconnect(),l++,clearInterval(g),document.removeEventListener("visibilitychange",k),L("/background/presence",{method:"POST",body:JSON.stringify({sessionId:Qs.current,visible:!1})}).catch(()=>{})}},[n?.isFounded,bo,Ie,e]);let Cf=n?.backgroundWork?.some(l=>["queued","running"].includes(l.status))??!1;(0,m.useEffect)(()=>{if(!Cf)return;let l=window.setInterval(()=>{document.visibilityState==="visible"&&Ie({quiet:!0})},5e3);return()=>clearInterval(l)},[Cf,Ie]),(0,m.useEffect)(()=>{let l=n?.village.nextTransitionAt??"";l.length===0||l===Sf.current||(Sf.current=l,n?.isFounded&&bo())},[n,bo]);let _n=(0,m.useCallback)(async l=>{try{let u=await L("/catalog",{signal:l});d(u.characters),bt("")}catch(u){if(l?.aborted)return;bt(F(u,"Could not read your character library."))}},[]),vo=(0,m.useCallback)(async l=>{try{let u=await L("/personas",{signal:l});Y(u.personas)}catch(u){if(l?.aborted)return;Y([]),bt(F(u,"Could not read your Personas."))}},[]),yo=(0,m.useCallback)(async l=>{try{let u=await L("/lorebooks",{signal:l});Ax(u.books),jg("")}catch(u){if(l?.aborted)return;jg(F(u,"Could not read Engine lorebooks. Selected books will be skipped until available."))}},[]),Tf=(0,m.useRef)(new Set),Fs=(0,m.useCallback)(async l=>{try{let u=await L("/memories",{signal:l});p(u),bt("");let g=u.archive.pendingReviewId;g&&!Tf.current.has(g)&&!l?.aborted&&(Tf.current.add(g),window.setTimeout(()=>{l?.aborted||L(`/rooms/archive/${encodeURIComponent(g)}/retry-memory`,{method:"POST"}).then(()=>L("/memories")).then(k=>{l?.aborted||p(k)}).catch(()=>{})},0))}catch(u){if(l?.aborted)return;p(null),bt(F(u,"Could not read villager memories."))}},[]),Wx=(0,m.useCallback)(async(l,u)=>{let g=l==="durable"?"Forget this durable memory?":"Let this passing recollection go now?";if(window.confirm(g)){ce(!0);try{await L(`/memories/${l}/${encodeURIComponent(u)}`,{method:"DELETE"}),await Fs()}catch(k){bt(F(k,"That memory could not be removed."))}finally{ce(!1)}}},[Fs]),wo=(0,m.useCallback)(async l=>{try{let u=await L("/agendas",{signal:l});ht(u.villagers)}catch(u){if(l?.aborted)return;ht(null),bt(F(u,"Could not read what the villagers wish for."))}},[]);(0,m.useEffect)(()=>{if(z!=="menu"||P!=="agendas"&&P!=="schedules"||!ve?.some(u=>u.agenda?.personalizationPending&&!u.agenda.personalizationFailure))return;let l=window.setInterval(()=>{wo()},5e3);return()=>window.clearInterval(l)},[ve,wo,P,z]);let nh=(0,m.useRef)(new Map),kc=(0,m.useCallback)(async l=>{let u=nh.current.get(l.id);u||(u={id:hr(),attempt:l.attempt},nh.current.set(l.id,u));let g=await L("/background/retry",{method:"POST",body:JSON.stringify({id:l.id,expectedAttempt:u.attempt,actionId:u.id})});r(g),nh.current.delete(l.id),await wo()},[wo]),Cc=(0,o.jsx)(tx,{jobs:(n?.backgroundWork??[]).filter(l=>P==="agendas"?["agenda","wish"].includes(l.kind):P==="schedules"?["agenda","translation"].includes(l.kind):P==="venueRequests"?["mail","adaptation"].includes(l.kind):!0),onRetry:kc}),ih=(0,m.useRef)(new Map),e$=(0,m.useCallback)(async l=>{ce(!0);try{let u=ah.current?.backgroundWork?.find(A=>A.kind==="agenda"&&A.subjectId===l&&["failed","interrupted","paused"].includes(A.status));if(u){await kc(u);return}let g=ih.current.get(l)??hr();ih.current.set(l,g);let k=await L(`/agendas/${encodeURIComponent(l)}/regenerate`,{method:"POST",body:JSON.stringify({actionId:g})});ih.current.delete(l),ht(k.villagers),bt("")}catch(u){bt(F(u,"That villager could not be asked again."))}finally{ce(!1)}},[kc]),t$=(0,m.useCallback)(async(l,u)=>{ce(!0);try{let g=await L(`/agendas/${encodeURIComponent(l)}/completed/${encodeURIComponent(u)}/correct`,{method:"POST"});ht(g.villagers),bt("")}catch(g){bt(F(g,"That wish completion could not be corrected."))}finally{ce(!1)}},[]),a$=(0,m.useCallback)(async(l,u)=>{ce(!0);try{let g=await L(`/agendas/${encodeURIComponent(l)}/ingestion`,{method:"PATCH",body:JSON.stringify({ingestSchedule:u})});ht(g.villagers),bt("")}catch(g){bt(F(g,"Schedule use could not be changed."))}finally{ce(!1)}},[]);(0,m.useEffect)(()=>{let l=new AbortController;return Ie({signal:l.signal}),()=>l.abort()},[Ie]),(0,m.useEffect)(()=>{let l=()=>{document.hidden||Ie({quiet:!0})},u=setInterval(()=>{document.hidden||Sc.current||Ie({quiet:!0})},b2);return document.addEventListener("visibilitychange",l),()=>{clearInterval(u),document.removeEventListener("visibilitychange",l)}},[Ie]),(0,m.useEffect)(()=>{if(!D?.id||D.status==="closed"||z!=="room")return;xf.current!==D.id?(xf.current=D.id,mo.current=Date.parse(D.lastActivityAt||D.startedAt)||Date.now()):mo.current=Math.max(mo.current,Date.parse(D.lastActivityAt||D.startedAt)||0);let l=!1,u=U=>{l||$s(D.id,fa.current)||(He(null),Wa(!1),yn([]),wn.current.clear(),po(U==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),j("home"),Ie())},g=(U=!1)=>{$s(D.id,fa.current)||L("/rooms/active").then(async({session:K})=>{if(l||$s(D.id,fa.current))return;if(K?.id===D.id){He(K),U&&(await L("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:D.id})}),mo.current=Date.now());return}let Se=await L(`/rooms/archive/${encodeURIComponent(D.id)}`).catch(()=>null);l||$s(D.id,fa.current)||u(Se?.visit.endReason==="inactivity"?"inactivity":"elsewhere")}).catch(K=>{let Se=Ns(K);Se&&u(Se)})},k=U=>{if(!$s(D.id,fa.current)){if(Date.now()-mo.current>=30*6e4){U.cancelable&&U.preventDefault(),U.stopImmediatePropagation(),g(!0);return}mo.current=Date.now(),!(Date.now()-wf.current<15e3)&&(wf.current=Date.now(),L("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:D.id})}).catch(K=>{let Se=Ns(K);Se?u(Se):g()}))}},A=()=>g();window.addEventListener("focus",A),document.addEventListener("visibilitychange",A);for(let U of["pointerdown","keydown","input","scroll"])window.addEventListener(U,k,!0);return()=>{l=!0,window.removeEventListener("focus",A),document.removeEventListener("visibilitychange",A);for(let U of["pointerdown","keydown","input","scroll"])window.removeEventListener(U,k,!0)}},[D?.id,D?.status,D?.lastActivityAt,D?.startedAt,z,Ie]),(0,m.useEffect)(()=>{Xs&&(Xs.sessionId!==D?.id||D?.status!=="opening")&&Mi(null)},[D?.id,D?.status,Xs]),(0,m.useEffect)(()=>{if(!D?.id||D.operation?.status!=="running"||ga)return;let l=!1,u=!1,g=async()=>{if(l||u||document.hidden)return;u=!0;let A=await Ss(D.id,D.operation?.id);u=!1,!l&&A&&(He(A),ci(A.status==="closed"),A.operation?.status!=="running"&&Rt(""))},k=window.setInterval(()=>{g()},1500);return window.addEventListener("focus",g),document.addEventListener("visibilitychange",g),()=>{l=!0,window.clearInterval(k),window.removeEventListener("focus",g),document.removeEventListener("visibilitychange",g)}},[D?.id,D?.operation?.id,D?.operation?.status,ga]),(0,m.useEffect)(()=>{if(!D?.id||D.operation?.status!=="interrupted"||D.submissions?.some(u=>u.id===D.operation?.id))return;let l=!1;return L(`/rooms/${encodeURIComponent(D.id)}/operations/${encodeURIComponent(D.operation.id)}`).then(({operation:u})=>{l||!u?.input?.message||en(g=>g||u.input?.message||"")}).catch(()=>{}),()=>{l=!0}},[D?.id,D?.operation?.id,D?.operation?.status,D?.submissions]),(0,m.useEffect)(()=>{let l=new AbortController;return L("/rooms/active",{signal:l.signal}).then(({session:u,debugDiscardEnabled:g})=>{Qx(g),!(l.signal.aborted||!u)&&(He(u),xc("chat"),Wa(!0),j("room"),u.status==="opening"&&(Ct(!0),L("/rooms/greet",{method:"POST",body:JSON.stringify({sessionId:u.id}),signal:AbortSignal.timeout(3e4)}).then(({session:k})=>{l.signal.aborted||(He(A=>A?.id===u.id?k:A),Mi(A=>A?.sessionId===u.id?null:A))}).catch(async k=>{if(l.signal.aborted)return;let A=await rx(u.id);l.signal.aborted||(A?(He(U=>U?.id===u.id?A:U),Mi(U=>U?.sessionId===u.id?null:U)):Mi(U=>U&&U.sessionId!==u.id?U:{sessionId:u.id,message:sx(k)}))}).finally(()=>{l.signal.aborted||Ct(!1)})))}).catch(()=>{}),()=>l.abort()},[]),(0,m.useEffect)(()=>{if(P!=="chatlogs"||!n?.isFounded)return;let l=new AbortController,u=new URLSearchParams;return Z&&u.set("venueId",Z),Q&&u.set("characterId",Q),u.set("offset",String(V)),u.set("limit","20"),$(null),L(`/rooms/archive?${u.toString()}`,{signal:l.signal}).then(({visits:g,total:k})=>{l.signal.aborted||($(g),y(k),re(""))}).catch(g=>{l.signal.aborted||re(F(g,"Venue visits could not be read."))}),()=>l.abort()},[Z,Q,V,O,P,n?.isFounded]);let rh=(0,m.useCallback)(async l=>{try{let u=await L(`/rooms/archive/${encodeURIComponent(l)}`);w(u.visit),re("")}catch(u){re(F(u,"That visit could not be read."))}},[]),n$=(0,m.useCallback)(async l=>{ce(!0);try{let u=await L(`/rooms/${encodeURIComponent(l)}/operation`);await L(`/rooms/archive/${encodeURIComponent(l)}/retry-memory`,{method:"POST",body:JSON.stringify({retryOfAttemptId:u.operation?.attemptId})}),await rh(l),N(g=>g+1),re("")}catch(u){re(F(u,"Memory filing is still pending."))}finally{ce(!1)}},[rh]),Ef=(0,m.useCallback)(async l=>{if(window.confirm(l?"Delete this exact visit transcript? Filed memories and world changes remain. Any pending memory can no longer be retried.":"Delete all completed visit transcripts? Filed memories and world changes remain. Any pending memories can no longer be retried.")){ce(!0);try{await L(l?`/rooms/archive/${encodeURIComponent(l)}`:"/rooms/archive",{method:"DELETE"}),w(null),M(0),N(u=>u+1),re("")}catch(u){re(F(u,"Visit transcripts could not be deleted."))}finally{ce(!1)}}},[]);(0,m.useEffect)(()=>{if(!qt)return;let l=new AbortController;return _n(l.signal),()=>l.abort()},[qt,_n]);let Af=n?n.settings.townMapImageSetAt:null;(0,m.useEffect)(()=>{if(Af===null)return;let l=new AbortController;return(async()=>{try{let u=await L("/town-map",{signal:l.signal});Zu(u.image)}catch{l.signal.aborted||Zu("")}})(),()=>l.abort()},[Af]);let i$=(0,m.useCallback)(async l=>{ce(!0);try{r(await L("/villagers",{method:"POST",body:JSON.stringify({characterId:l})})),bt(""),await _n()}catch(u){bt(F(u,"That character could not move in."))}finally{ce(!1)}},[_n]),r$=(0,m.useCallback)(async l=>{ce(!0);try{r(await L(`/villagers/${encodeURIComponent(l)}`,{method:"DELETE"})),bt(""),c&&await _n()}catch(u){bt(F(u,"That villager could not leave."))}finally{ce(!1)}},[c,_n]),o$=(0,m.useCallback)(async l=>{Nt(l);try{let u=await L(`/villagers/${encodeURIComponent(l)}/refresh`);Ye(g=>({...g,[l]:u})),bt("")}catch(u){bt(F(u,"That villager's card could not be compared."))}finally{Nt("")}},[]),s$=(0,m.useCallback)(async l=>{Nt(l);try{r(await L(`/villagers/${encodeURIComponent(l)}/refresh`,{method:"POST"})),Ye(u=>{let g={...u};return delete g[l],g}),bt("")}catch(u){bt(F(u,"That villager's card could not be refreshed."))}finally{Nt("")}},[]),jt=(0,m.useCallback)(l=>{l==="projects"&&at(""),be(""),Ze(!1),l==="villagers"&&_n(),l==="village"&&vo(),l==="village"&&yo(),l==="memories"&&(p(null),Fs()),(l==="agendas"||l==="schedules")&&wo(),l==="progress"&&L("/progress/debug").then(Vt).catch(g=>{Vt(null),bt(F(g,"Progress diagnostics are unavailable."))}),l==="village"&&(z!=="menu"||P!=="village")&&n&&(Bt(n.settings.promptKnowledge),x(n.settings.playerPersonaId),se(n.settings.setting),Ma(n.settings.selectedLorebookIds),oa(n.settings.loreTokenBudget),uc(n.settings.sceneryArtStyle??""),hc(n.settings.personalizeVenueImagesByDefault!==!1),mc(n.settings.useVisualLoreByDefault!==!1),Wr(ks(n.settings.venues).map(g=>({...g})))),gt(l),j("menu")},[wo,_n,yo,Fs,vo,P,z,n]),Tc=(0,m.useCallback)(()=>{Ft(!1),be(""),Ne(null),Ze(!1),j("home")},[]),zi=(0,m.useCallback)(l=>{!l.memoryPending||Nc.current.has(l.id)||(Nc.current.add(l.id),$f(l.id),L(`/rooms/archive/${encodeURIComponent(l.id)}/retry-memory`,{method:"POST"}).then(u=>{si.current||(He(g=>g?.id===l.id?u.session:g),Dn(u.recordEvents??[]))}).catch(u=>{si.current||Rt(F(u,"Memory review is still pending. You can leave and retry from Memories."))}).finally(()=>{Nc.current.delete(l.id),$f(u=>u===l.id?"":u)}))},[Dn]);(0,m.useEffect)(()=>{if(!Gs)return;let l=window.setInterval(()=>{L(`/rooms/archive/${encodeURIComponent(Gs)}`).then(({visit:u})=>{si.current||!Nc.current.has(Gs)||He(g=>g?.id===u.id&&g.memoryPending?{...g,memoryPending:u.memoryPending,memoryReview:u.memoryReview}:g)}).catch(()=>{})},2e3);return()=>window.clearInterval(l)},[Gs]);let l$=(0,m.useCallback)(async()=>{if(!(!D||ga)&&!(D.memoryPending&&(D.status==="closed"||fo))){if(!D.id||D.status==="closed"||fo){fa.current=null,Wa(!1),He(null),yn([]),wn.current.clear(),en(""),yr(""),j("home"),Ie();return}Ct(!0),Rt(""),H(!1),He({...D,status:"closing"}),fa.current={roomId:D.id,submissionId:""};try{let l=await L("/rooms/end",{method:"POST",body:JSON.stringify({sessionId:D.id,expectedSceneRevision:D.sceneRevision??0})});if(si.current)return;He(l.session),ci(!0),Dn(l.recordEvents??[]),zi(l.session),en(""),yr(""),Ie()}catch(l){if(si.current)return;fa.current=null;let u=Ns(l);if(u){He(null),Wa(!1),yn([]),wn.current.clear(),po(u==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),j("home"),Ie();return}let g=await Ss(D.id);g&&(He(g),ci(g.status==="closed")),Rt(F(l,"You could not leave the venue.")),H(!0)}finally{Ct(!1)}}},[Ie,Dn,D,ga,fo,zi]),c$=(0,m.useCallback)(async()=>{if(!D?.id||D.status!=="active"||ga||Ps.current)return;let l=go.current??hr();go.current=l,fa.current={roomId:D.id,submissionId:l},Ct(!0),Rt(""),H(!1);try{let u=await L("/rooms/leave",{method:"POST",body:JSON.stringify({sessionId:D.id,submissionId:l,message:vr,expectedSceneRevision:D.sceneRevision??0}),signal:AbortSignal.timeout(3e5)});He(u.session),ci(!0),Dn(u.recordEvents??[]),zi(u.session),go.current=null,en(""),Ie()}catch(u){let g=await Ss(D.id,l);g&&He(g);let k=g?.submissions?.some(U=>U.id===l)?g:await ox(D.id,l);if(k){He(k),ci(k.status==="closed"),k.status==="closed"&&zi(k),en(""),Rt(""),H(!1),go.current=null,Ie();return}fa.current=null;let A=Ns(u);if(A){He(null),Wa(!1),yn([]),wn.current.clear(),po(A==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),j("home"),Ie();return}Rt(F(u,"The scene could not end yet.")),H(!0)}finally{Ct(!1)}},[Ie,Dn,D,ga,vr,zi]),d$=(0,m.useCallback)(async()=>{if(!(!D?.id||si.current)){si.current=!0,Ct(!0);try{await L("/rooms/leave-pending",{method:"POST",body:JSON.stringify({sessionId:D.id})}),fa.current=null,Wa(!1),He(null),yn([]),wn.current.clear(),j("home"),H(!1),Ie()}catch(l){Rt(F(l,"The visit could not be left yet.")),si.current=!1}finally{Ct(!1)}}},[Ie,D]),u$=(0,m.useCallback)(async()=>{if(!(!D?.id||!Ys||ga)&&window.confirm("DEBUG: Discard this visit and its transcript? Completed effects and villager memories remain.")){Ct(!0);try{await L("/rooms/debug/discard",{method:"POST",body:JSON.stringify({sessionId:D.id})}),He(null),Wa(!1),yn([]),wn.current.clear(),en(""),j("home"),Ie()}catch(l){Rt(F(l,"The debug discard failed."))}finally{Ct(!1)}}},[D,Ys,ga,Ie]),h$=(0,m.useCallback)(async()=>{let l=vr.trim();if(D===null||!D.id||fo||ga||Ps.current||l.length===0)return;Ps.current=!0;let u=li.current??hr();li.current=u;let g=D;try{await L("/rooms/activity",{method:"POST",body:JSON.stringify({sessionId:D.id})})}catch(A){Ps.current=!1;let U=Ns(A);U?(He(null),Wa(!1),yn([]),wn.current.clear(),po(U==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),j("home"),Ie()):Rt(F(A,"The visit could not be checked."));return}let k={speakerId:"",name:"",role:"user",content:l,at:new Date().toISOString()};Ct(!0),Rt(""),en(""),He({...D,lines:[...D.lines,k]}),fa.current={roomId:D.id,submissionId:u};try{let A=await L("/rooms/turn",{method:"POST",body:JSON.stringify({sessionId:D.id,message:l,mode:Bs,targetId:Bs==="fulfill"?js:"",submissionId:u,expectedSceneRevision:D.sceneRevision??0}),signal:AbortSignal.timeout(3e5)});He(A.session),ci(A.session.status==="closed"),A.session.status!=="closed"&&(fa.current=null),Dn(A.recordEvents??[]),A.session.status==="closed"&&zi(A.session),js&&!A.session.activeIds.includes(js)&&$c(""),yf(A.verdict?.reason??""),xc("chat"),li.current=null,yr(""),Ie()}catch(A){let U=await Ss(D.id,u);U&&He(U);let K=U?.submissions?.some(wr=>wr.id===u)?U:await ox(D.id,u);if(K){He(K),ci(K.status==="closed"),K.status==="closed"&&zi(K),Rt(""),en(""),li.current=null,yr(""),Ie();return}fa.current=null;let Se=Ns(A);if(Se){He(null),Wa(!1),yn([]),wn.current.clear(),po(Se==="inactivity"?"Interrupted: Inactivity. Your completed exchanges were saved in the visit archive.":"This visit ended while you were away. Its completed exchanges are in the visit archive."),j("home"),Ie();return}let Sa=await Ss(D.id,u);Sa?He(Sa):A instanceof rc||He(g),A instanceof rc&&(A.code==="SCENE_BUSY"||A.code==="SCENE_STALE")&&(li.current=null),en(l),Rt(F(A,"That line could not be sent."))}finally{Ps.current=!1,Ct(!1)}},[Ie,Dn,D,ga,vr,fo,Bs,js,zi]),m$=(0,m.useCallback)(l=>(n?.villagers??[]).filter(u=>u.place?.id===l),[n]),oh=(0,m.useCallback)(l=>{Ne(null),Ze(!1),st(l.id),Ot("view"),$t("exterior"),ge(null),ct(null),j("venue")},[]),sh=(0,m.useCallback)(async l=>{Ct(!0),Rt(""),Mi(null),yr("");try{let u=await L("/rooms/greet",{method:"POST",body:JSON.stringify({sessionId:l}),signal:AbortSignal.timeout(3e4)});He(g=>g?.id===l?u.session:g),Mi(g=>g?.sessionId===l?null:g),Ie()}catch(u){let g=await rx(l);g?(He(k=>k?.id===l?g:k),Mi(k=>k?.sessionId===l?null:k)):Mi(k=>k&&k.sessionId!==l?k:{sessionId:l,message:sx(u)})}finally{Ct(!1)}},[Ie]),p$=(0,m.useCallback)(async()=>{if(!(!D?.id||!D.operation||ga)){Ct(!0);try{let{operation:l}=await L(`/rooms/${encodeURIComponent(D.id)}/operations/${encodeURIComponent(D.operation.id)}`),u=l.kind==="move"?"/rooms/zone":l.kind==="memory"?`/rooms/archive/${encodeURIComponent(D.id)}/retry-memory`:l.kind==="greet"?"/rooms/greet":l.kind==="turn"?l.input?.mode==="leave"?"/rooms/leave":"/rooms/turn":"/rooms/end",g=await L(u,{method:"POST",body:JSON.stringify({...l.input,sessionId:D.id,submissionId:l.id,operationId:l.id,expectedSceneRevision:D.sceneRevision??0,retryOfAttemptId:l.attemptId}),signal:AbortSignal.timeout(3e5)});He(g.session),ci(g.session.status==="closed"),Dn(g.recordEvents??[]),vr.trim()===l.input?.message&&en(""),li.current=null,go.current=null,fa.current=null,Rt(""),Ie()}catch(l){let u=await Ss(D.id);u&&He(u),Rt(F(l,"The saved request could not be recovered."))}finally{Ct(!1)}}},[D,ga,vr,Dn,Ie]),g$=(0,m.useCallback)(async l=>{Ct(!0);try{let{session:u}=await L("/rooms/continue",{method:"POST",body:JSON.stringify({sessionId:l}),signal:AbortSignal.timeout(1e4)});He(u),yr(u.lines.length===0?"The opening failed. You can start the conversation now.":""),Rt("")}catch(u){Rt(F(u,"The visit could not continue. Retry or leave the venue."))}finally{Ct(!1)}},[]),Ec=(0,m.useCallback)(async(l,u,g="",k,A)=>{if(D?.id&&D.status==="active"&&D.placeId===l.id&&A){Ct(!0),Rt("");try{let{session:U}=await L("/rooms/zone",{method:"POST",body:JSON.stringify({sessionId:D.id,zoneId:A,expectedSceneRevision:D.sceneRevision??0})});He(U),$c(""),j("room"),Wa(!0),Ie()}catch(U){Rt(F(U,"That zone could not be entered."))}finally{Ct(!1)}return}si.current=!1,fa.current=null,Ne(null),Ze(!1),oi(null),en(""),ci(!1),Rt(""),yr(""),yn([]),wn.current.clear(),Ct(!0),He({version:1,id:"",placeId:l.id,placeName:l.name,startedAt:"",endedAt:"",status:"opening",activeIds:[],participants:[],lines:[]}),Wa(!0),j("room");try{let{session:U}=await L("/rooms",{method:"POST",body:JSON.stringify({venueId:l.id,spaceClass:u,privateOwnerId:g,entryArea:k,zoneId:A,expectedSceneRevision:D?.sceneRevision}),signal:AbortSignal.timeout(2e4)});He(U),xc("chat"),$c(""),yf(""),po(""),Wa(!0),Ie(),U.status==="opening"&&await sh(U.id)}catch(U){Rt(F(U,"That room could not be opened. Retry or leave the venue."))}finally{Ct(!1)}},[sh,Ie,D]),Rf=(0,m.useCallback)(l=>{Ze(!1),Ne(l.id),j("home")},[]),Mf=(0,m.useCallback)(()=>{st(null),Ot("view"),$t("exterior"),ge(null),ct(null),Ne(null),j("home")},[]),f$=(0,m.useCallback)(async()=>{ce(!0),be("");try{r(await L("/settings",{method:"PATCH",body:JSON.stringify({promptKnowledge:Fe,playerPersonaId:E,setting:G,selectedLorebookIds:We,loreTokenBudget:pn})}))}catch(l){be(F(l,"Those settings could not be saved."))}finally{ce(!1)}},[Fe,We,pn,E,G]),b$=(0,m.useCallback)(async l=>{ce(!0),be("");try{r(await L("/settings",{method:"PATCH",body:JSON.stringify({storyPace:l})}))}catch(u){be(F(u,"That could not be saved."))}finally{ce(!1)}},[]),v$=(0,m.useCallback)(async l=>{let u=n?.settings.characterSpeechColors??!0;r(g=>g&&{...g,settings:{...g.settings,characterSpeechColors:l}}),ce(!0),be("");try{r(await L("/settings",{method:"PATCH",body:JSON.stringify({characterSpeechColors:l})}))}catch(g){r(k=>k&&{...k,settings:{...k.settings,characterSpeechColors:u}}),be(F(g,"Character speech colors could not be saved."))}finally{ce(!1)}},[n?.settings.characterSpeechColors]),zf=(0,m.useCallback)(async l=>{ce(!0),be("");try{r(await L("/settings",{method:"PATCH",body:JSON.stringify({visitRetention:l})})),N(u=>u+1)}catch(u){be(F(u,"Visit retention could not be saved."))}finally{ce(!1)}},[]),y$=(0,m.useCallback)(async()=>{if(!(n&&ks(n.settings.venues).length>0&&!window.confirm("Replace the current places with new suggestions? This removes places you created or approved."))){ce(!0),be("");try{let l=await L("/bootstrap",{method:"POST"});Wr(l.places.map(u=>({id:Cu(),name:u.name,description:"",category:"public",presentation:{image:null,x:null,y:null},occupancy:{playerHome:!1,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}})))}catch(l){be(F(l,"The village did not suggest any places."))}finally{ce(!1)}}},[n]),w$=(0,m.useCallback)(async()=>{if(xa.trim().length===0){Ee("Describe what the village is like before generating its map.");return}Us(!0),Ee("");try{let l=await L("/setup/town-map/generate",{method:"POST",body:JSON.stringify({structure:oo===n?.settings.townMapLayoutPrompt?void 0:oo,negative:so===n?.settings.townMapNegativePrompt?void 0:so,setting:xa,options:gc,selectedLorebookIds:ta,sceneryArtStyle:Mn,useVisualLore:ro,scenarioImprint:n?.isFounded?{origin:"",worldFacts:ai,openingConditions:[],visualCues:[]}:null})}),u=await Eu(l.image);if(u.width!==l.width||u.height!==l.height)throw new Error("The generated map's reported dimensions do not match the image.");Uu(l.image),qu("generate"),df(Gu),Lu(u),gr("generate")}catch(l){Ee(F(l,"The village map could not be generated."))}finally{Us(!1)}},[ta,so,oo,xa,gc,Gu,Mn,ro,ai,n?.isFounded,n?.settings.townMapLayoutPrompt,n?.settings.townMapNegativePrompt]),x$=(0,m.useCallback)(async l=>{if(!l||!n)return;Ee("");let u=Math.floor((n.settings.townMapImageMaxLength-64)*3/4);if(l.size>u){let g=k=>Math.round(k/1e5)/10;Ee(`That picture is ${g(l.size)} MB and a village map holds ${g(u)} MB. Choose a smaller copy.`);return}Us(!0);try{let g=await Ts(l),k=await Eu(g);Uu(g),qu("upload"),Lu(k),gr("upload")}catch(g){Ee(F(g,"That picture could not be used as the village map."))}finally{Us(!1)}},[n]),$$=(0,m.useCallback)(()=>{if(!n)return;let l=Object.fromEntries(n.settings.venues.map(u=>[u.id,{x:u.presentation.x,y:u.presentation.y}]));Vx(l),Zg(l),zx(n.settings.townMapImageSetAt),sc(n.settings.venues[0]?.id??null),Ou(!0),no(!1),co(null),ri(null),yc(!1),be("")},[n]),N$=(0,m.useCallback)(async()=>{if(n){Gg(!0),be("");try{let l=await L("/setup/town-map/generate",{method:"POST",body:JSON.stringify({setting:n.settings.setting,selectedLorebookIds:n.settings.selectedLorebookIds,scenarioImprint:{origin:"",worldFacts:n.settings.worldFacts,openingConditions:[],visualCues:[]}})}),u=await Eu(l.image);if(u.width!==l.width||u.height!==l.height)throw new Error("The generated map's reported dimensions do not match the image.");co({image:l.image,size:u}),no(!1),ri(nc("cover"))}catch(l){be(F(l,"The village map could not be generated."))}finally{Gg(!1)}}},[n]),S$=(0,m.useCallback)(async l=>{if(!l||!n)return;be("");let u=Math.floor((n.settings.townMapImageMaxLength-64)*3/4);if(l.size>u){let g=k=>Math.round(k/1e5)/10;be(`That picture is ${g(l.size)} MB and the village map holds ${g(u)} MB. Try a smaller copy.`);return}ce(!0);try{let g=await Ts(l),k=await Eu(g);co({image:g,size:k}),no(!1),ri(nc("cover"))}catch(g){be(F(g,"That picture could not be used as the village map."))}finally{ce(!1)}},[n]),Vf=(0,m.useCallback)(async()=>{if(!n)return;let l=Ms?"":On?.image??lo;ce(!0),be("");try{let u=Object.fromEntries(n.settings.venues.map(k=>[k.id,Tu(k)])),g=await L("/town-map",{method:"PUT",body:JSON.stringify({image:l,view:Qu??n.settings.townMapView,expectedMapSetAt:fn?Pg:n.settings.townMapImageSetAt,placements:Object.entries(fn?Xg:u).map(([k,A])=>({venueId:k,fromX:A.x,fromY:A.y,x:fn?zs[k]?.x??null:A.x,y:fn?zs[k]?.y??null:A.y}))})});r(g),Zu(l),co(null),ri(null),yc(!1),Ou(!1),no(!1),Rs(null)}catch(u){be(F(u,"The village map could not be saved."))}finally{ce(!1)}},[n,Qu,lo,On,Ms,fn,Pg,Xg,zs]),Of=(0,m.useCallback)(()=>{co(null),ri(null),yc(!1),Ou(!1),no(!1),Rs(null),be("")},[]),k$=(0,m.useCallback)(async(l,u,g="",k)=>{if(!In){uo(l),oi(null),be("");try{r(await L("/locations/venue/image",{method:"POST",body:JSON.stringify({venueId:l,spaceClass:u,privateOwnerId:g,zoneId:k})}))}catch(A){oi({id:l,text:F(A,"That place could not be drawn.")})}finally{uo("")}}},[In]),C$=(0,m.useCallback)(async(l,u,g,k="",A)=>{if(!(!u||!n||In)){uo(l),oi(null),be("");try{let U=Se=>Math.round(Se/1e5)/10;if(u.size>n.settings.maxVenueImageBytes){oi({id:l,text:`That picture is ${U(u.size)} MB and a place holds ${U(n.settings.maxVenueImageBytes)} MB. Try a smaller copy.`});return}let K=await Ts(u);r(await L("/locations/venue/image",{method:"PUT",body:JSON.stringify({venueId:l,image:K,spaceClass:g,privateOwnerId:k,zoneId:A})}))}catch(U){oi({id:l,text:F(U,"That picture could not be kept.")})}finally{uo("")}}},[In,n]),T$=(0,m.useCallback)(async(l,u,g="",k)=>{if(!In){uo(l),oi(null),be("");try{r(await L("/locations/venue/image",{method:"DELETE",body:JSON.stringify({venueId:l,spaceClass:u,privateOwnerId:g,zoneId:k})}))}catch(A){oi({id:l,text:F(A,"That picture could not be taken away.")})}finally{uo("")}}},[In]),E$=(n?.settings.venues.length??0)+oc.filter(l=>!n?.settings.venues.some(u=>u.id===l.id)).length,If=(0,m.useCallback)((l,u,g)=>{let k=Oe.find(U=>U.category==="public-center"),A=Os??(eo?k?.id:void 0);if(G1({x:l,y:u},Oe.filter(U=>U.id!==A).map(U=>U.presentation),g??{width:1e3,height:700,photoWidth:58,photoHeight:58})){Hu("That photograph would cover another venue. Place it a little to the side.");return}if(Hu(""),A)Ai(U=>U.map(K=>K.id===A?{...K,presentation:{...K.presentation,x:l,y:u}}:K)),vn(A),ni(!0);else if(eo){let U={...ax(Cu(),"gathering",l,u),imageContext:{useAssignedVillagerContext:zn,useVisualLore:Vn}};Ai(K=>[...K,U]),vn(U.id),dc(U.id),ni(!0),ii.current=null}else if(As){let U=Oe.filter(Se=>Se.classes?.includes("residence"));if(U.length>=1+Rn)return;let K={...ax(Cu(),"residence",l,u,!U.some(Se=>Se.occupancy.playerHome),U.length+1),imageContext:{useAssignedVillagerContext:zn,useVisualLore:Vn}};Ai(Se=>[...Se,K]),vn(K.id),dc(K.id),ni(!0),ii.current=null}Is(null),Ei(!1),to(!1)},[Os,As,eo,Rn,Oe,zn,Vn]),Df=(0,m.useCallback)((l,u)=>{Ai(g=>g.map(k=>k.id===l?u(k):k))},[]),A$=(0,m.useCallback)(l=>{Ai(u=>u.filter(k=>k.id!==l)),vn(u=>u===l?null:u)},[]),R$=l=>{if(n?.isFounded||l===ti)return;let u=Jr(ti).premise,g=!!Ka.trim()&&Ka!==u;Kg(l),g||Iu(Jr(l).premise),Wg(""),Ee("")},Js=(0,m.useCallback)((l,u)=>{be(""),Ee(""),pf(!1),qs(!1),vc(!1),Ft(!1),Pe(""),cc(0),Fg(l?"":u?.village.name??""),Jg(l?"":u?.village.setting??"");let g=l?"":u?.settings.foundingReason??"",k=Ig.some(ka=>ka.value===g),A=k?g:g?"custom":"rebuild",U=Kk[g]??g,K=u?.settings.foundingDetails??"",Se=[U,K].filter(Boolean).join(" "),Sa=Se.length>(u?.settings.foundingDetailsMaxLength??500),wr=u?.isFounded?K:g&&!k?Sa?K:Se:l||!g?Jr(A).premise:K,Vi=l?"":u?.isFounded?u.settings.foundingGuidance??"":[Sa?U:"",u?.settings.foundingGuidance??""].filter(Boolean).join(" ");Kg(A),Iu(wr),Wg(A==="none"?"":Vi),ef(l?{...Ws}:u?.isFounded?u.settings.playerRole??null:{...u?.settings.playerRole??Ws}),Ix(l?Cg():u?.settings.scenarioImprint??Cg()),tf(l?[]:u?.settings.worldFacts??[]);let Mt=l||!u?[]:u.settings.venues.filter(ka=>ka.classes?.includes("residence")||ka.category==="public-center");Ai(Mt),af(Math.max(1,Mt.filter(ka=>ka.classes?.includes("residence")&&!ka.occupancy.playerHome).length)),_u(Mt.filter(ka=>ka.form?.trim()&&ka.description.trim()&&ka.spaces?.[0]?.description.trim()).map(ka=>ka.id)),ni(!1),dc(""),uc(l||!u?.isFounded?$r["Painted illustration"]:u.settings.sceneryArtStyle??""),hc(u?.settings.personalizeVenueImagesByDefault!==!1),mc(u?.settings.useVisualLoreByDefault!==!1),of(u?.settings.useVisualLoreByDefault!==!1),vn(Mt[0]?.id??null),Is(null),Hu(""),En(l?[]:u?.settings.selectedLorebookIds??[]),Lg(l?1600:u?.settings.loreTokenBudget??1600),cf({...J1}),gr(l?"generate":u?.settings.townMapImageSetAt?"existing":"none"),Uu(""),qu(null),df(""),Lu(null),Bu(u?.settings.townMapLayoutPrompt??""),ju(u?.settings.townMapNegativePrompt??""),Us(!1),x(l?"":u?.settings.playerPersonaId??""),vo(),yo(),j("setup")},[yo,vo]),_f=(0,m.useCallback)(l=>{if(Xe===0&&l>0){if(An.trim().length===0){Ee("Give the village a name before continuing.");return}if(xa.trim().length===0){Ee("Describe what the village is like before continuing.");return}if(!n?.isFounded&&!Ka.trim()){Ee("Describe the village's first day before continuing.");return}}if(Xe===1&&l>1){if(!n?.isFounded&&el(bn)){Ee(el(bn));return}if(!E.trim()){Ee("Choose the Persona who lives in this village.");return}if(!_?.some(u=>u.id===E)){Ee("That Persona is no longer in your library. Choose another one to continue.");return}if(Pu.length>0){Ee(Pu);return}if(mf){qs(!0);return}}if(Xe===2&&l>2&&dt!=="none"&&!fr){Ee(dt==="generate"?"Generate the map, or choose an upload or no background image.":"Choose a map image, or select no background image.");return}if(Xe===3&&l>3){if(!n?.isFounded&&Oe.some(K=>!pr.includes(K.id))){Ee("Finish each venue with Done before review.");return}if(!n?.isFounded&&Oe.filter(K=>K.classes?.includes("residence")).length<1+Rn){Ee("Place the selected number of homes before review.");return}let u=Oe.filter(K=>K.classes?.includes("residence")),g=u.filter(K=>!K.occupancy.playerHome),k=g.length;if(!u.some(K=>K.occupancy.playerHome)||k<K1||k>W1||!Oe.some(K=>K.category==="public-center")){Ee("Place your home, one to three homes for initial villagers, and a named public meeting location.");return}let A=g.map(K=>K.occupancy.residentCharacterId).filter(Boolean);if(A.length!==g.length||new Set(A).size!==A.length){Ee("Assign a different villager to each villager Residence before review.");return}let U=Oe.map(K=>({venue:K,field:K.name.trim()?K.form?.trim()?K.description.trim()?K.spaces?.[0]?.description.trim()?"":"interior-description":"exterior-description":"form":"venue-name"})).find(({field:K})=>K);if(U){vn(U.venue.id),Ee(`Complete ${U.field.replaceAll("-"," ")} for ${U.venue.name||"this venue"} before continuing.`),window.setTimeout(()=>e.querySelector(`#${i}-setup-${U.field}`)?.focus(),0);return}}qs(!1),Ee(""),cc(l),l===1&&vo(),l===0&&yo(),l===3&&(_n(),ni(!1)),Ei(l===3&&!n?.isFounded&&Oe.filter(u=>u.classes?.includes("residence")).length<1+Rn),to(l===3&&!n?.isFounded&&Oe.filter(u=>u.classes?.includes("residence")).length>=1+Rn&&!Oe.some(u=>u.category==="public-center")),Is(null)},[Rn,pr,Pu,Oe,mf,_n,vo,yo,E,_,dt,fr,An,Ka,bn,n?.isFounded,xa,Xe,e]),M$=(0,m.useCallback)(()=>{qs(!1),Ee(""),cc(2),Ei(!1),to(!1)},[]),z$=(0,m.useCallback)(()=>{qs(!1),Ee("")},[]),_t=Oe.find(l=>l.id===sf)??null,V$=l=>({id:l.id,name:l.name,form:l.form??"",description:l.description,spaceDescription:l.spaces?.[0]?.description??"",venueClass:l.classes?.includes("gathering")?"gathering":"residence",residentCharacterId:l.occupancy.residentCharacterId??""}),O$=async(l,u)=>{if(Ds)return;let g=u==="private"?l.privateSpaces?.find(U=>U.ownerId==="player")?.description??"":u==="exterior"?l.description:l.spaces?.[0]?.description??"";if(!g.trim()){vn(l.id),Ee(`Add an ${u} description before generating its image.`),window.setTimeout(()=>e.querySelector(`#${i}-setup-${u}-description`)?.focus(),0);return}let k=Hs,A=JSON.stringify(l);pc(!0),Ee("");try{let U=await L("/setup/venue-image/generate",{method:"POST",body:JSON.stringify({venue:V$(l),area:u,privateOwnerId:u==="private"?"player":void 0,privateDescription:g,playerPersonaId:E,sceneryArtStyle:Mn,useAssignedVillagerContext:l.imageContext?.useAssignedVillagerContext??zn,useVisualLore:l.imageContext?.useVisualLore??Vn,villageName:An,setting:xa,foundingDetails:Ka,scenarioImprint:n?.isFounded?Ox:null,worldFacts:n?.isFounded?ai:[],selectedLorebookIds:ta})});if(Yu.current!==k||JSON.stringify(uf.current.find(K=>K.id===l.id))!==A){Ee("The venue changed while its image was generated. Generate again.");return}Ai(K=>K.map(Se=>Se.id===l.id&&JSON.stringify(Se)===A?Hf(Se,u,U):Se))}catch(U){Ee(F(U,"Venue art could not be generated."))}finally{pc(!1)}},I$=async(l,u,g)=>{if(!(!g||Ds)){if(g.size>(n?.settings.maxVenueImageBytes??8e6)){Ee("That venue image is too large. Choose a smaller file.");return}pc(!0),Ee("");try{let k=await L("/setup/venue-image",{method:"PUT",body:JSON.stringify({name:l.name,image:await Ts(g)})});Df(l.id,A=>Hf(A,u,k))}catch(k){Ee(F(k,"That venue image could not be uploaded."))}finally{pc(!1)}}},Hf=(l,u,g)=>u==="exterior"?{...l,presentation:{...l.presentation,image:g}}:u==="private"?{...l,privateSpaces:(l.privateSpaces??[Dc()]).map(k=>k.ownerId==="player"?{...k,image:g}:k)}:{...l,spaces:l.spaces?.map((k,A)=>A===0?{...k,image:g}:k)},lh=(l,u=pr)=>{let g=l.find(A=>!u.includes(A.id));ni(!1),vn(null),dc(g?.id??""),Is(g?.id??null);let k=l.filter(A=>A.classes?.includes("residence")).length;Ei(!g&&(k<1+Rn||!l.some(A=>A.occupancy.playerHome))),to(!g&&k>=1+Rn&&!l.some(A=>A.category==="public-center")),window.setTimeout(()=>{let A=e.querySelector("."+i+"-setup-map-viewport");A?.scrollIntoView({block:"nearest"}),A?.focus()},0)},D$=()=>{if(_t){if(_t.classes?.includes("residence")&&!_t.occupancy.playerHome&&!_t.occupancy.residentCharacterId){Ee("Choose a villager.");return}if(!_t.name.trim()||!_t.form?.trim()||!_t.description.trim()||!_t.spaces?.[0]?.description.trim()){Ee("Complete this venue\u2019s name, form, exterior, and interior.");return}if(_t.privateSpaces?.some(l=>l.ownerId!=="player"&&(!l.name?.trim()||!l.purpose?.trim()||!l.controllerIds?.length))){Ee("Give each private room a name, purpose, and controller.");return}_u(l=>[...new Set([...l,_t.id])]),Ee(""),lh(Oe,[...pr,_t.id])}},_$=()=>{let l=rf===sf?Oe.filter(u=>u.id!==rf):Oe.map(u=>u.id===ii.current?.id?ii.current:u);Ai(l),Ee(""),lh(l)},Uf=(0,m.useCallback)(()=>{if(An.trim().length===0)return"Give the village a name.";if(E.trim().length===0)return"Choose the Persona who lives in this village.";if(!n?.isFounded&&!Ka.trim())return"Describe the village's first day.";if(!n?.isFounded&&el(bn))return el(bn);let l=ai.map(A=>A.trim()).filter(Boolean);if(n?.isFounded&&(l.length>4||l.some(A=>A.length>160)))return"Use at most four current world facts of 160 characters each.";if(xa.trim().length===0)return"Describe what the village is like.";if(dt!=="none"&&!fr)return"Choose, generate, or upload the village map.";if(!n?.isFounded&&Oe.some(A=>!pr.includes(A.id)))return"Finish each venue with Done in Step 4.";let u=Oe.filter(A=>A.classes?.includes("residence")),g=u.filter(A=>!A.occupancy.playerHome);if(g.length<K1||g.length>W1)return"Place one to three homes for initial villagers.";if(!u.some(A=>A.occupancy.playerHome))return"One Residence has to be yours.";if(Oe.some(A=>!A.name.trim()||!A.form?.trim()||!A.description.trim()||!A.spaces?.[0]?.description.trim()))return"Complete each venue's Form, Exterior Description, and Interior Description in Step 4.";let k=g.map(A=>A.occupancy.residentCharacterId).filter(A=>A!==null);return k.length!==g.length?"Choose who lives in each villager home.":new Set(k).size!==k.length?"A villager can only live in one house.":Oe.filter(A=>A.category==="public-center").length!==1?"Place one Gathering Place.":""},[Oe,pr,E,dt,fr,An,Ka,bn,n?.isFounded,ai,xa]),H$=(0,m.useCallback)(async()=>{let l=Uf();if(l){let u=Oe.find(g=>!g.name.trim()||!g.form?.trim()||!g.description.trim()||!g.spaces?.[0]?.description.trim());if(u){let g=u.name.trim()?u.form?.trim()?u.description.trim()?"interior-description":"exterior-description":"form":"venue-name";vn(u.id),cc(3),window.setTimeout(()=>e.querySelector(`#${i}-setup-${g}`)?.focus(),0)}Ee(l);return}ce(!0),Ee("");try{let u=await L("/setup",{method:"POST",body:JSON.stringify({name:An.trim(),setting:xa.trim(),foundingReason:n?.isFounded?n.settings.foundingReason:ti,foundingDetails:n?.isFounded?n.settings.foundingDetails:Ka.trim(),foundingGuidance:n?.isFounded?n.settings.foundingGuidance:Vs.trim(),playerRole:n?.isFounded?n.settings.playerRole??null:bn,scenarioImprint:n?.isFounded?n.settings.scenarioImprint:null,worldFacts:n?.isFounded?ai.map(g=>g.trim()).filter(Boolean):[],selectedLorebookIds:ta,personalizeVenueImagesByDefault:zn,useVisualLoreByDefault:Vn,sceneryArtStyle:Mn,useVisualLore:ro,loreTokenBudget:gn,playerPersonaId:E,townMapImage:fr??"",townMapView:dt==="existing"?ho:nc("cover"),venues:Oe})});r(u),Ei(!1),j(!n?.isFounded||u.foundingPreparation?.status==="pending"||u.foundingPreparation?.status==="failed"?"preparing":"home")}catch(u){Ee(F(u,"The village could not be founded."))}finally{ce(!1)}},[e,Oe,n?.isFounded,n?.settings.foundingReason,n?.settings.foundingDetails,n?.settings.foundingGuidance,n?.settings.playerRole,n?.settings.scenarioImprint,E,ho,Uf,Mn,ro,zn,Vn,dt,fr,An,ti,Ka,Vs,bn,ai,ta,gn,xa]),U$=(0,m.useCallback)(async()=>{ce(!0),be("");try{let l=await L("/setup/reset",{method:"POST"});r(l),d(null),Js(!0,l)}catch(l){be(F(l,"The village could not be reset."))}finally{ce(!1),vc(!1)}},[Js]),qf=(0,m.useRef)(!1);(0,m.useEffect)(()=>{!n||qf.current||(qf.current=!0,n.isFounded?n.foundingPreparation&&n.foundingPreparation.status!=="ready"&&j("preparing"):Js(!1,n))},[Js,n]),(0,m.useEffect)(()=>{if(z!=="preparing")return;let l=!1,u=async()=>{try{let k=await L("/setup/preparation");if(l)return;r(k),bc(""),(!k.foundingPreparation||k.foundingPreparation.status==="ready")&&j("home")}catch(k){l||bc(F(k,"Preparation status could not be read."))}};u();let g=window.setInterval(()=>{u()},2500);return()=>{l=!0,window.clearInterval(g)}},[z]);let q$=(0,m.useCallback)(async()=>{bc("");try{r(await L("/setup/preparation/retry",{method:"POST"}))}catch(l){bc(F(l,"Preparation could not be retried."))}},[]),L$=(0,m.useCallback)(()=>{ge({id:Cu(),name:"",form:"",classes:["other"],spaces:[],residenceCapacity:1,residentIds:[],improvements:[null,null],description:"",category:"",presentation:{image:null,x:null,y:null},occupancy:{playerHome:!1,residentCharacterId:null,homeKind:null},capabilities:[],state:{condition:"",upgrades:[],furniture:[],publicFacts:[],updatedAt:""}})},[]),B$=(0,m.useCallback)(async l=>{ce(!0),be("");try{let u=n?.settings.venues.some(U=>U.id===l.id)??!1,g=ei(l).map(U=>mn(l,U)),k=await L(u?`/locations/venue/${encodeURIComponent(l.id)}`:"/projects",{method:u?"PUT":"POST",body:JSON.stringify(u?{name:l.name,description:g[0]?.description??l.description}:{name:l.name,classes:l.classes,description:g[0]?.description??l.description})}),A=ks(k.settings.venues).find(U=>u?U.id===l.id:U.name.toLowerCase()===l.name.trim().toLowerCase());r(k),ge(null),u||jt("projects"),Wr(U=>{let K=U.map(Se=>Se.id===l.id&&A?A:Se);return[...K,...ks(k.settings.venues).filter(Se=>!K.some(Sa=>Sa.id===Se.id))]})}catch(u){be(F(u,"That place could not be saved."))}finally{ce(!1)}},[n,jt]),j$=(0,m.useCallback)(async l=>{let u=n?.settings.venues.find(g=>g.id===l);if(!u){Wr(g=>g.filter(k=>k.id!==l));return}ce(!0),be("");try{let g=await L(`/locations/venue/${encodeURIComponent(l)}/dependencies`);if(g.roomPresent||g.playerHome||g.residentCharacterIds.length||g.pendingMailCount){be(g.roomPresent?"End the active visit before deleting this Venue.":g.pendingMailCount?"Resolve pending Venue decisions before deleting this Venue.":"Move every resident, including yourself, before deleting this Residence.");return}let k=g.residentCharacterIds.length+g.pendingResidenceCharacterIds.length,A=k||g.workerCharacterIds.length||g.remapCount||g.eventCount?`This place is referenced by ${k} pending moves, ${g.workerCharacterIds.length} workers, ${g.remapCount} schedule moves, and ${g.eventCount} events. Delete it?`:`Delete ${u.name}?`;if(!window.confirm(A))return;let U=await L(`/locations/venue/${encodeURIComponent(l)}`,{method:"DELETE",body:JSON.stringify({confirmed:!0})});r(U),Wr(K=>K.filter(Se=>Se.id!==l))}catch(g){be(F(g,"That place could not be removed."))}finally{ce(!1)}},[n]),Lf=(0,m.useCallback)(async(l,u)=>{ce(!0),be("");try{let g=de[l.id]??l.venueDraft,k=await L(`/venue-requests/${encodeURIComponent(l.id)}/${u?"approve":"deny"}`,{method:"POST",body:u?JSON.stringify(g):void 0});if(r(k),u){let A=new Set(oc.map(U=>U.id));Wr(U=>[...U,...ks(k.settings.venues).filter(K=>!A.has(K.id))])}Re(A=>{let U={...A};return delete U[l.id],U})}catch(g){be(F(g,u?"That venue could not be approved.":"That request could not be denied."))}finally{ce(!1)}},[de,oc]),Y$=(0,m.useCallback)(l=>{let u=eh.current,g=u?.selectionStart??Fe.length,k=u?.selectionEnd??g;th.current=g+l.length,Bt(`${Fe.slice(0,g)}${l}${Fe.slice(k)}`)},[Fe]),Bf=(0,m.useCallback)(async()=>{let l=lc.trim();if(l.length!==0){ce(!0),be("");try{r(await L("/noticeboard",{method:"POST",body:JSON.stringify({notice:l})})),Qg("")}catch(u){be(F(u,"That notice could not be pinned up."))}finally{ce(!1)}}},[lc]),G$=(0,m.useCallback)(async l=>{ce(!0),be("");try{r(await L(`/noticeboard/${l}`,{method:"DELETE"}))}catch(u){be(F(u,"That notice could not be taken down."))}finally{ce(!1)}},[]),Ac=le.trim().toLowerCase(),ch=(c??[]).filter(l=>Ac.length===0||l.name.toLowerCase().includes(Ac)||l.comment.toLowerCase().includes(Ac)||l.tags.some(u=>u.toLowerCase().includes(Ac))),jf=[...(n?.villagers??[]).map(l=>l.characterId),...qt?ch.map(l=>l.id):[]].join(`
`),Yf=(0,m.useRef)(new Set);(0,m.useEffect)(()=>{let l=jf.split(`
`).filter(g=>g.length>0&&!Yf.current.has(g));if(l.length===0)return;for(let g of l)Yf.current.add(g);let u=new AbortController;return(async()=>{try{let g=await d2(l,u.signal);u.signal.aborted||At(k=>({...k,...g}))}catch{}})(),()=>u.abort()},[jf]);let dh=n?.settings.playerPersonaId??"";(0,m.useEffect)(()=>{if(W(null),dh.length===0)return;let l=new AbortController;return(async()=>{try{let u=await u2(dh,l.signal);l.signal.aborted||W(u)}catch{}})(),()=>l.abort()},[dh]);let xn=(0,m.useCallback)(l=>l?c?.find(u=>u.id===l)?.name??n?.villagers.find(u=>u.characterId===l)?.name??"":"",[c,n]),P$=(()=>{let l=n?.settings.venues??[],u=[],g=new Map;for(let k of n?.villagers??[]){let A=k.place?.id;if(!A)continue;let U=g.get(A);U?U.push(k):g.set(A,[k])}for(let k of l){let A=Tu(k);if(!A)continue;let U=n?.projects.find(Vi=>Vi.venueId===k.id&&Vi.lifecycle?.phase!=="complete"),K=()=>{U&&(jt("projects"),ye(U.id),at(U.id))},Se=k.occupancy.residentCharacterId,Sa=Mu(k),wr=k.occupancy.playerHome?ic(n):xn(Se);u.push({id:k.id,x:A.x,y:A.y,text:Sa?k2(wr):k.name,image:U?A2:k.presentation.image?.url??null,tone:Sa?hx({isPlayerHome:k.occupancy.playerHome,occupant:Se}):"venue",selected:Le===k.id,doors:Le===k.id?[...U?[{label:"View Project",onSelect:K}]:[],...U?.kind==="new-venue"?[]:[{label:"View venue",onSelect:()=>oh(k)},{label:"Visit",onSelect:()=>{Ec(k)}}]]:void 0,onSelect:U?.kind==="new-venue"?K:()=>Rf(k)}),(g.get(k.id)??[]).forEach((Vi,Mt)=>{u.push({id:`villager:${Vi.characterId}`,x:A.x,y:A.y,dy:E2*(Mt+1),text:Vi.name,tone:"resident",kind:"person"})})}return u})(),X$=Oe.flatMap(l=>{let u=Tu(l);return u?[{id:l.id,x:u.x,y:u.y,text:l.name||(l.category==="public-center"?"Gathering Place":"Residence"),image:l.presentation.image?.url??null,tone:l.category==="public-center"?"venue":l.occupancy.playerHome?"player":"resident",onSelect:()=>{ii.current=structuredClone(l),vn(l.id),ni(!0),Ee("")}}]:[]});if(z==="room")return(0,o.jsxs)("div",{className:`${i}-root ${i}-room-screen`,"data-mobile":t?"true":"false",children:[D?.operation?.status==="running"?(0,o.jsx)("div",{role:"status",children:"This conversation is responding. Your draft stays here."}):null,D?.operation?.status==="interrupted"?(0,o.jsxs)("div",{role:"alert",className:`${i}-room-error`,children:[(0,o.jsx)("p",{children:"The previous request may have been billed. Retry the saved request only when you are ready to authorize further work."}),(0,o.jsx)("button",{className:`${i}-button`,disabled:ga,onClick:()=>{p$()},children:"Retry saved request"})]}):null,D?(0,o.jsx)(B2,{room:D,nameColors:n?.settings.characterSpeechColors?Object.fromEntries(n.villagers.map(l=>[l.characterId,l.nameColor])):{},speechColors:n?.settings.characterSpeechColors?Object.fromEntries(n.villagers.map(l=>[l.characterId,l.dialogueColor])):{},picture:r2(n?.settings.venues??[],D),draft:vr,mode:Bs,targetId:js,busy:ga||D.operation?.status==="running",error:Fx||(D.status==="opening"&&Xs?.sessionId===D.id?Xs.message:""),greetingNotice:Jx,ruling:Xx,open:Px,ended:fo,playerName:ic(n),playerPortrait:T??void 0,portraits:ea,sprites:Object.fromEntries((n?.villagers??[]).map(l=>[l.characterId,l.sprite])),onDraft:l=>{li.current=null,go.current=null,en(l)},onMode:l=>{li.current=null,xc(l)},onTarget:l=>{li.current=null,$c(l)},onSend:()=>{Bs==="conclude"?c$():h$()},onViewVenue:()=>{st(D.placeId),ge(null),j("venue"),Ie()},onEnterPrivate:D.area==="shared"&&D.privateAccessOwnerId?()=>{Ct(!0),L("/rooms/enter-private",{method:"POST",body:JSON.stringify({sessionId:D.id,ownerId:D.privateAccessOwnerId,expectedSceneRevision:D.sceneRevision??0})}).then(({session:l})=>{He(l),Ie()}).catch(l=>Rt(F(l,"That private space could not be entered."))).finally(()=>Ct(!1))}:void 0,privateSpaceOwnerName:xn(D.privateAccessOwnerId),onEnd:()=>{l$()},notices:Zx,onDismissNotice:l=>yn(u=>u.filter(g=>g.id!==l)),debugDiscardEnabled:Ys,onDebugDiscard:()=>{u$()},onLeavePending:()=>{d$()},endFailed:R,reviewing:Gs===D.id,onRetryGreeting:()=>{if(D.id)sh(D.id);else{let l=n?.settings.venues.find(u=>u.id===D.placeId);l&&Ec(l)}},onContinueWithoutGreeting:()=>{D.id&&g$(D.id)},onUseMailbox:n?.settings.venues.some(l=>l.id===D.placeId&&l.occupancy.playerHome&&(!D.spaceClass||D.spaceClass==="residence"))?()=>Ls(!0):void 0,onProjects:()=>jt("projects")}):(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:Tc,children:"Back to village"}),Gx&&n?(0,o.jsx)("div",{className:`${i}-mailbox-backdrop`,onClick:()=>Ls(!1),children:(0,o.jsxs)("section",{className:`${i}-mailbox`,role:"dialog","aria-modal":"true","aria-label":"Mailbox",onClick:l=>l.stopPropagation(),children:[(0,o.jsxs)("div",{className:`${i}-row`,style:{justifyContent:"space-between"},children:[(0,o.jsx)("h2",{className:`${i}-panel-title`,children:"Mailbox"}),(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Ls(!1),children:"Close"})]}),(0,o.jsx)("p",{className:`${i}-hint`,children:"Venue decisions and replies from the people affected by them."}),(0,o.jsxs)("div",{className:`${i}-mailbox-list`,children:[[...n.venueMail??[]].reverse().map(l=>(0,o.jsxs)("article",{className:`${i}-mailbox-item`,children:[(0,o.jsx)("strong",{children:l.title}),(0,o.jsx)("p",{children:l.detail}),(0,o.jsx)("p",{className:`${i}-hint`,children:l.status==="awaiting-villagers"?`Awaiting replies \xB7 due ${new Date(l.dueAt).toLocaleString()}`:l.status==="pending-player"?"Awaiting your decision":l.status==="approved"?"Approved":"Declined"}),l.decisions.map(u=>(0,o.jsxs)("p",{children:[(0,o.jsxs)("strong",{children:[xn(u.characterId),":"]})," ",u.reply]},u.characterId)),l.status==="pending-player"&&l.kind==="villager-change"?(0,o.jsx)(L2,{entry:l,onDecide:async(u,g)=>{r(await L(`/venue-mail/${encodeURIComponent(l.id)}/decision`,{method:"POST",body:JSON.stringify({approved:u,...g})}))}}):null,l.error?(0,o.jsxs)("p",{className:`${i}-hint`,children:["Reply delayed: ",l.error]}):null]},l.id)),(n.venueMail?.length??0)===0&&n.venueRequests.length===0&&n.upgradeRequests.length===0?(0,o.jsx)("p",{className:`${i}-empty`,children:"No Venue mail yet."}):null,n.venueRequests.map(l=>(0,o.jsxs)("article",{className:`${i}-mailbox-item`,children:[(0,o.jsxs)("strong",{children:[l.requesterName||"A villager"," suggests ",l.venueDraft.name]}),(0,o.jsx)("p",{children:l.venueDraft.classes.map(u=>u[0].toUpperCase()+u.slice(1)).join(" / ")}),(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Ls(!1),jt("venueRequests")},children:"Review request"})]},l.id)),n.upgradeRequests.map(l=>(0,o.jsxs)("article",{className:`${i}-mailbox-item`,children:[(0,o.jsxs)("strong",{children:[l.requesterName," suggests a home change"]}),(0,o.jsx)("p",{children:l.detail}),(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Ls(!1),jt("venueRequests")},children:"Review request"})]},l.id))]})]})}):null]});if(z==="venue"){let l=(n?.settings.venues??[]).find(C=>C.id===ie)??null;if(!n||!l)return(0,o.jsx)("div",{className:`${i}-root`,children:(0,o.jsxs)("header",{className:`${i}-header`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("h1",{className:`${i}-title`,children:"A place that is gone"}),(0,o.jsx)("p",{className:`${i}-subtitle`,children:"This venue is no longer in the village."})]}),(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:Mf,children:"Back to map"})]})});let u=m$(l.id),g=ei(l),k=l.occupancy.homeKind?C2(s,l.occupancy.homeKind).name:"",A=l.occupancy.playerHome?ic(n):xn(l.occupancy.residentCharacterId),U=l.residentIds??(l.occupancy.residentCharacterId?[l.occupancy.residentCharacterId]:[]),K=g.includes("residence")&&U.length>0,Se=D?.placeId===l.id&&(D.area==="shared"||D.area==="private"),Sa=D?.placeId===l.id&&D.area==="private"?D.privateOwnerId:"",wr=l.occupancy.playerHome||l.playerSeenShared||Se,Vi=(l.privateSpaces??[]).filter(C=>l.playerSeenPrivateIds?.includes(C.ownerId)||C.ownerId===Sa),Mt=D?.status!=="closed"&&D?.id?D:null,ka=(l.playerInvitations??[]).some(C=>U.includes(C.residentId)),Z$=[{key:"exterior",label:"Exterior",subtitle:"Outside the building",area:"outside",spaceClass:g[0],ownerId:"",image:l.presentation.image,description:l.form||k||`The outside of ${l.name}.`,state:l.exteriorState,locked:!1,canEnter:!0,accessLabel:"Open (no restrictions)"},...g.map(C=>{let xe=mn(l,C),ne=C==="residence",fe=ne?!wr:!l.playerSeenPublic&&!(Mt?.placeId===l.id&&Mt.area==="public"),et=!ne||!K||l.occupancy.playerHome||ka;return{key:`class:${C}`,label:g.length===1?"Interior":`${C[0].toUpperCase()}${C.slice(1)} interior`,subtitle:ne?"Shared living space":`${C[0].toUpperCase()}${C.slice(1)} space`,area:ne?"shared":"public",spaceClass:C,ownerId:"",image:fe?null:xe.image,description:fe?"":xe.description,state:fe?void 0:xe.state,locked:fe,canEnter:et,accessLabel:et?"Open to visit":"Resident invitation required"}}),...(l.privateSpaces??[]).filter(C=>U.includes(C.ownerId)).map(C=>{let xe=xn(C.ownerId),ne=!l.playerSeenPrivateIds?.includes(C.ownerId)&&C.ownerId!==Sa,fe=(l.playerInvitations??[]).some(et=>et.scope==="private"&&et.ownerId===C.ownerId&&et.residentId===C.ownerId);return{key:`private:${C.ownerId}`,label:`${xe}'s Private Space`,subtitle:"Restricted area",area:"private",spaceClass:"residence",ownerId:C.ownerId,image:ne?null:C.image,description:ne?"":C.description,state:ne?void 0:C.state,locked:ne,canEnter:fe,accessLabel:fe?"Owner's invitation available":"Owner's invitation required",adaptationPending:!ne&&C.adaptationPending}})],Rc=l.zones?l.zones.map(C=>{let xe=C.kind==="exterior"?"outside":C.kind==="private-residence"?"private":C.kind==="shared-residence"?"shared":"public",ne=C.kind!=="exterior"&&!C.seen&&!(l.occupancy.playerHome&&C.kind==="shared-residence")&&!(Mt?.placeId===l.id&&Mt.zoneId===C.id),fe=l.playerInvitations?.some(za=>za.zoneId===C.id)||Mt?.placeId===l.id&&Mt.grantedZoneIds?.includes(C.id),et=!C.closed&&(C.kind==="exterior"||C.kind==="public"||(C.kind==="shared-residence"||C.kind==="private-residence"&&C.ownerId==="player")&&l.occupancy.playerHome||!!fe||C.kind==="restricted"&&!!C.controllerIds?.includes("player"));return{key:C.id,zoneId:C.id,label:C.kind==="private-residence"?C.ownerId==="player"?"Your personal space":xn(C.ownerId??"")+"'s Private Space":C.name,subtitle:C.kind==="staff"?"Staff area":C.kind==="shared-residence"?"Shared living space":C.kind==="private-residence"?"Resident's personal space":C.kind==="exterior"?"Outside the building":"Public area",area:xe,spaceClass:C.venueClass,ownerId:C.ownerId??"",image:ne?null:C.image,description:ne?"":C.description,state:ne?void 0:C.state,locked:ne,canEnter:et,accessLabel:C.closed?"Closed for Renovation":C.kind==="exterior"||C.kind==="public"?"Open to everyone":fe?"Permission for this visit":C.kind==="private-residence"?"Owner's invitation required":C.kind==="staff"?"Workers and invited guests":C.kind==="restricted"?"Assigned controllers and invited guests":"Residents and invited guests"}}):Z$,ue=Rc.find(C=>C.key===lt)??Rc[0],xr=l.zones?.find(C=>C.id===ue.zoneId),Ks=xr?.preparation,Q$=xr?.kind==="staff"?l.workerIds??[]:xr?.kind==="private-residence"?[xr.ownerId??""]:xr?.controllerIds??[],Gf=(l.editProposals??[]).filter(C=>C.zoneId?C.zoneId===ue.zoneId:ue.area==="shared"?C.target==="shared":ue.area==="private"&&C.target==="private"&&C.ownerId===ue.ownerId),uh=ue.description&&ue.description!==l.form&&ue.description!==k?ue.description:"",F$=!ue.locked&&!!(uh||ue.adaptationPending||ue.state?.condition||ue.state?.items.length||ue.state?.publicFacts.length||ue.state?.features.length||ue.area==="outside"&&n.village.setting||Gf.length),Mc=Mt?.placeId===l.id&&(ue.zoneId?Mt.zoneId===ue.zoneId:Mt.area===ue.area)&&(ue.zoneId?Mt.zoneId===ue.zoneId:ue.area==="outside"||Mt.spaceClass===ue.spaceClass)&&(ue.area!=="private"||Mt.privateOwnerId===ue.ownerId),J$=(C,xe,ne,fe="",et)=>(0,o.jsxs)("section",{className:`${i}-venue-card`,children:[(0,o.jsx)("h3",{className:`${i}-panel-title`,children:C}),fe?(0,o.jsx)("p",{children:"Personal-space images always reflect their owner."}):null,(0,o.jsxs)("fieldset",{children:[(0,o.jsx)("legend",{children:"Venue image context"}),(fe?["useVisualLore"]:["useAssignedVillagerContext","useVisualLore"]).map(za=>(0,o.jsxs)("label",{children:[(0,o.jsx)("input",{type:"checkbox",disabled:ee,checked:l.imageContext?.[za]??(za==="useVisualLore"?n.settings.useVisualLoreByDefault!==!1:n.settings.personalizeVenueImagesByDefault!==!1),onChange:async hh=>{let a5={useAssignedVillagerContext:l.imageContext?.useAssignedVillagerContext??n.settings.personalizeVenueImagesByDefault!==!1,useVisualLore:l.imageContext?.useVisualLore??n.settings.useVisualLoreByDefault!==!1,[za]:hh.target.checked};ce(!0);try{r(await L("/locations/venue/"+encodeURIComponent(l.id),{method:"PUT",body:JSON.stringify({name:l.name,description:l.description,imageContext:a5})}))}catch(n5){be(F(n5,"Image context could not be saved."))}finally{ce(!1)}}}),za==="useVisualLore"?"Use selected visual lore":"Use assigned villagers\u2019 personality"]},za))]}),xe?(0,o.jsx)("img",{className:`${i}-venue-space-picture`,src:xe.url,alt:`${C} at ${l.name}`}):(0,o.jsx)("div",{className:`${i}-venue-image-empty`,children:"No image yet"}),(0,o.jsxs)("div",{className:`${i}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:!!In||ee,onClick:()=>{k$(l.id,ne,fe,et)},children:xe?"Redraw image":"Draw image"}),(0,o.jsx)("input",{className:`${i}-file`,type:"file",accept:"image/*","aria-label":`Upload ${C.toLowerCase()} image`,disabled:!!In||ee,onChange:za=>{let hh=za.target.files?.[0];za.target.value="",C$(l.id,hh,ne,fe,et)}}),xe?(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:!!In||ee,onClick:()=>{T$(l.id,ne,fe,et)},children:"Remove image"}):null]})]},et||fe||ne||"exterior"),xo=C=>({name:C.name,form:C.form,workerIds:C.workerIds,position:{x:C.presentation.x,y:C.presentation.y},spaces:g.map(xe=>{let ne=mn(C,xe);return{description:ne.description,condition:ne.state.condition,items:ne.state.items,publicFacts:ne.state.publicFacts,features:ne.state.features.map(({id:fe,text:et,locked:za})=>({id:fe,text:et,locked:za}))}}),privateSpaces:C.privateSpaces?.map(xe=>({ownerId:xe.ownerId,description:xe.description,condition:xe.state.condition,items:xe.state.items,publicFacts:xe.state.publicFacts,features:xe.state.features.map(({id:ne,text:fe,locked:et})=>({id:ne,text:fe,locked:et}))}))}),K$=!!(pe&&JSON.stringify(xo(pe))!==JSON.stringify(xo(l))),W$=!!(he&&(JSON.stringify(he.classes)!==JSON.stringify(g)||he.capacity!==(l.residenceCapacity??1)||he.slot!==0||he.title||he.description||he.extraBeds)),e5=()=>{(qe==="edit"&&K$||qe==="proposal"&&W$)&&!window.confirm("Discard your unsaved changes?")||(Ot("view"),ge(null),ct(null),Ve(""),X(""))},Pf=(C,xe)=>{r(C);let ne=C.settings.venues.find(fe=>fe.id===l.id);ne&&ge(structuredClone(ne)),X(xe)},t5=async()=>{if(pe){if(pe.form!==l.form||JSON.stringify(pe.classes)!==JSON.stringify(l.classes)||JSON.stringify(pe.workerIds??[])!==JSON.stringify(l.workerIds??[])||JSON.stringify(pe.state)!==JSON.stringify(l.state)||pe.presentation.x!==l.presentation.x||pe.presentation.y!==l.presentation.y){Ve("Physical edits and map moves need an earned route. Edit only the name or description here.");return}if(K){let C=xo(pe),xe=xo(l),ne=g.indexOf("residence");if((ne>=0&&JSON.stringify(C.spaces[ne])!==JSON.stringify(xe.spaces[ne])||JSON.stringify(C.privateSpaces)!==JSON.stringify(xe.privateSpaces))&&!window.confirm("Saving Venue details will discard unsaved room changes. Continue?"))return}nt(!0),Ve(""),X("");try{let C=await L(`/locations/venue/${encodeURIComponent(l.id)}`,{method:"PUT",body:JSON.stringify({name:pe.name,description:pe.description})});Pf(C,"Venue details saved.")}catch(C){Ve(F(C,"The Venue could not be saved."))}finally{nt(!1)}}},Xf=async(C,xe="")=>{if(!pe)return;let ne=C==="private"?pe.privateSpaces?.find(et=>et.ownerId===xe):mn(pe,"residence");if(!ne)return;let fe=structuredClone(pe);if(C==="shared"?fe.spaces=fe.spaces?.map(et=>et.venueClass==="residence"?mn(l,"residence"):et):fe.privateSpaces=fe.privateSpaces?.map(et=>et.ownerId===xe?l.privateSpaces?.find(za=>za.ownerId===xe)??et:et),!(JSON.stringify(xo(fe))!==JSON.stringify(xo(l))&&!window.confirm("Submitting this room edit will discard other unsaved changes. Continue?"))){nt(!0),Ve(""),X("");try{let et=await L(`/locations/venue/${encodeURIComponent(l.id)}/edit-proposals`,{method:"POST",body:JSON.stringify({target:C,ownerId:xe,description:ne.description,state:ne.state})});Pf(et,`${C==="private"?"Private":"Shared"} room edit proposed.`)}catch(et){Ve(F(et,"That room edit could not be proposed."))}finally{nt(!1)}}},Zf=T2(l,A);return(0,o.jsxs)("div",{className:`${i}-root`,"data-venue-view":qe==="view"?"true":void 0,children:[(0,o.jsxs)("header",{className:`${i}-header`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("h1",{className:`${i}-title`,children:qe==="view"?Zf:`${qe==="edit"?"Edit Venue":"Propose Change"} \xB7 ${Zf}`}),(0,o.jsx)("p",{className:`${i}-subtitle`,children:qe==="view"?l.form||k||(u.length===0?"Nobody is here right now":`Villagers here: ${u.map(C=>C.name).join(", ")}`):qe==="edit"?"Pictures and venue details":"Review a structural change"})]}),(0,o.jsxs)("div",{className:`${i}-venue-header-controls`,children:[(0,o.jsx)("div",{className:`${i}-actions`,children:qe==="view"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{ge(structuredClone(l)),Ve(""),X(""),Ot("edit")},children:"Edit Venue"}),g.includes("residence")&&!l.occupancy.playerHome?(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Ve(""),L(`/locations/venue/${encodeURIComponent(l.id)}/player-move`,{method:"POST"}).then(r).catch(C=>Ve(F(C,"The move could not be requested.")))},children:"Request to live here"}):null,(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{ct({classes:g,capacity:l.residenceCapacity??1,slot:0,title:"",description:"",extraBeds:0}),Ve(""),X(""),Ot("proposal")},children:"Propose Change"}),Mt?.placeId===l.id?(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>j("room"),children:"Return to scene"}):null]}):(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:e5,children:qe==="edit"?"Close Editor":"Exit Change Proposal"})}),qe==="view"&&Lt?(0,o.jsx)("p",{className:`${i}-venue-move-error`,role:"alert",children:Lt}):null]})]}),qe==="view"?(0,o.jsxs)("main",{className:i+"-venue-page","aria-label":"View Venue",children:[(0,o.jsxs)("nav",{className:i+"-venue-zones","aria-label":"Venue zones",children:[(0,o.jsx)("button",{type:"button",className:i+"-venue-back",onClick:Mf,children:"\u2190 Back to map"}),Rc.map(C=>(0,o.jsxs)("button",{type:"button",className:i+"-venue-zone-tab","data-active":ue.key===C.key?"true":"false","aria-current":ue.key===C.key?"page":void 0,onClick:()=>$t(C.key),children:[(0,o.jsx)("span",{className:i+"-venue-zone-thumb",children:C.image&&!C.locked?(0,o.jsx)("img",{src:C.image.url,alt:""}):(0,o.jsx)("span",{"aria-hidden":"true",children:C.locked?"\u25C8":"\u2302"})}),(0,o.jsxs)("span",{className:i+"-venue-zone-copy",children:[(0,o.jsx)("strong",{children:C.label}),(0,o.jsx)("small",{children:C.subtitle})]})]},C.key))]}),(0,o.jsxs)("div",{className:i+"-venue-zone-content",children:[(0,o.jsx)("section",{className:i+"-venue-zone-main","aria-label":ue.label,children:(0,o.jsx)("div",{className:i+"-venue-artwork",children:ue.image&&!ue.locked?(0,o.jsx)("img",{src:ue.image.url,alt:ue.label+" at "+l.name}):(0,o.jsx)("div",{className:i+"-venue-artwork-empty",children:ue.locked?"Area not discovered yet":"No image for this area yet"})})}),(0,o.jsxs)("aside",{className:i+"-venue-zone-context",children:[(0,o.jsx)("span",{className:i+"-venue-kicker",children:"Zone"}),(0,o.jsx)("h2",{children:ue.label}),(0,o.jsx)("p",{children:ue.subtitle}),(0,o.jsxs)("div",{className:i+"-venue-zone-stat",children:[(0,o.jsx)("span",{children:"Occupancy"}),(0,o.jsx)("strong",{children:g.includes("residence")?zu(l)+" / "+lx(l)+" residents":u.length+" here now"})]}),(0,o.jsxs)("div",{className:i+"-venue-zone-stat",children:[(0,o.jsx)("span",{children:"Accessibility"}),(0,o.jsx)("strong",{children:ue.accessLabel})]}),xr&&["private-residence","staff","restricted"].includes(xr.kind)?(0,o.jsxs)("div",{className:i+"-venue-zone-stat",children:[(0,o.jsx)("span",{children:"Controllers"}),(0,o.jsx)("strong",{children:Q$.map(C=>C==="player"?"You":n.villagers.find(xe=>xe.characterId===C)?.name??C).join(", ")||"No current controllers"})]}):null,Ks?.status==="ready"?(0,o.jsx)("p",{role:"status",children:"Private space ready."}):null,Ks&&Ks.status!=="ready"?(0,o.jsxs)("p",{role:"status",children:["Private space ",Ks.status==="failed"?"preparation failed":"is being prepared",".",Ks.status==="failed"?(0,o.jsx)("button",{type:"button",disabled:ee,onClick:async()=>{ce(!0);try{r(await L("/private-spaces/retry",{method:"POST"}))}catch(C){be(F(C,"Private preparation failed."))}finally{ce(!1)}},children:"Retry private-space preparation"}):null]}):null,F$?(0,o.jsxs)("details",{className:i+"-venue-more",children:[(0,o.jsx)("summary",{children:"Area details"}),uh?(0,o.jsx)("p",{children:uh}):null,ue.adaptationPending?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("p",{children:"This room is still being adapted after a move."}),(0,o.jsx)(tx,{jobs:(n?.backgroundWork??[]).filter(C=>C.kind==="adaptation"),onRetry:kc})]}):null,ue.state?.condition?(0,o.jsxs)("p",{children:["Condition: ",ue.state.condition]}):null,ue.state?.items.length?(0,o.jsxs)("p",{children:["Present items: ",ue.state.items.join(", ")]}):null,ue.state?.publicFacts.length?(0,o.jsxs)("p",{children:["Established facts: ",ue.state.publicFacts.join(" \xB7 ")]}):null,ue.state?.features.length?(0,o.jsxs)("p",{children:["Defining features: ",ue.state.features.map(C=>C.text).join(" \xB7 ")]}):null,ue.area==="outside"&&n.village.setting?(0,o.jsxs)("p",{children:["Village: ",n.village.setting]}):null,Gf.map(C=>(0,o.jsxs)("p",{children:["Proposed room edit:"," ",C.declined?"declined or stale":`approved by ${C.approvedIds.length} of ${C.requiredIds.length} residents`]},C.id))]}):null,ue.locked&&!ue.canEnter?(0,o.jsx)("p",{className:i+"-venue-zone-guidance",children:"Visit the exterior and ask the resident for an invitation."}):null,Mt&&!Mc?(0,o.jsx)("p",{className:i+"-venue-zone-guidance",children:"Move between zones to continue this visit."}):null,(0,o.jsx)("button",{type:"button",className:i+"-venue-visit",disabled:ga||!Mc&&(!!Mt&&Mt?.placeId!==l.id||!ue.canEnter),onClick:()=>Mc?j("room"):void Ec(l,ue.spaceClass,ue.ownerId,ue.area,ue.zoneId),children:ga?"Opening visit\u2026":Mc?"Return to scene \u2192":"Visit this area \u2192"})]})]})]}):qe==="edit"?(0,o.jsxs)("main",{className:`${i}-venue-editor-page`,children:[(0,o.jsx)("div",{className:`${i}-venue-space-grid`,children:Rc.filter(C=>!C.locked).map(C=>J$(C.label+" image",C.image,C.area==="outside"?void 0:C.spaceClass,C.ownerId,C.zoneId))}),In===l.id?(0,o.jsx)("p",{className:`${i}-hint`,children:"Drawing or saving the image\u2026"}):null,ff?.id===l.id?(0,o.jsx)("p",{className:`${i}-error`,role:"alert",children:ff.text}):null,ue.zoneId&&!ue.locked?(0,o.jsx)(g2,{zone:ue,onSave:async C=>{try{r(await L(`/venues/${encodeURIComponent(l.id)}/zones/${encodeURIComponent(ue.zoneId)}`,{method:"PUT",body:JSON.stringify(C)}))}catch(xe){throw oi({id:l.id,text:F(xe,"The zone could not be saved.")}),xe}}},ue.zoneId):null,pe?(0,o.jsxs)("section",{className:`${i}-venue-card`,children:[(0,o.jsx)("h2",{className:`${i}-panel-title`,children:"Venue details"}),(0,o.jsx)(cx,{draft:pe,existing:!0,villagers:n.villagers,editableClasses:g.filter(C=>C!=="residence"||!K||Se),onChange:ge}),K?(0,o.jsx)("p",{className:`${i}-hint`,children:"Save Venue details updates the public fields. Changes to the shared Residence room require a separate proposal during an invited visit."}):null,(0,o.jsxs)("div",{className:`${i}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:St||!pe.name.trim(),onClick:()=>{t5()},children:"Save Venue details"}),K&&Se?(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:St||!mn(pe,"residence").description.trim(),onClick:()=>{Xf("shared")},children:"Propose shared room edit"}):null]}),K&&!Se?(0,o.jsx)("p",{className:`${i}-hint`,children:"Enter with a resident's invitation to propose changes to the shared room's contents."}):null]}):null,Sa&&pe?.privateSpaces?.filter(C=>C.ownerId===Sa).map(C=>(0,o.jsxs)("section",{className:`${i}-venue-card`,children:[(0,o.jsxs)("h2",{className:`${i}-panel-title`,children:["Propose changes to ",xn(C.ownerId),"'s private space"]}),(0,o.jsxs)("label",{className:`${i}-label`,children:["Scene description",(0,o.jsx)("textarea",{className:`${i}-textarea`,value:C.description,onChange:xe=>ge(ne=>ne&&{...ne,privateSpaces:ne.privateSpaces?.map(fe=>fe.ownerId===C.ownerId?{...fe,description:xe.target.value}:fe)})})]}),(0,o.jsxs)("details",{className:`${i}-venue-scene-details`,children:[(0,o.jsx)("summary",{children:"Scene details"}),(0,o.jsx)("p",{className:`${i}-hint`,children:"Physical state used during visits and for this room's image. These facts stay private until the player enters this room."}),(0,o.jsxs)("label",{className:`${i}-label`,children:["Condition now"," ",(0,o.jsx)("span",{className:`${i}-hint`,children:"For example, a broken shutter or a repaired floor."}),(0,o.jsx)("textarea",{className:`${i}-textarea`,value:C.state.condition,onChange:xe=>ge(ne=>ne&&{...ne,privateSpaces:ne.privateSpaces?.map(fe=>fe.ownerId===C.ownerId?{...fe,state:{...fe.state,condition:xe.target.value}}:fe)})})]}),(0,o.jsxs)("label",{className:`${i}-label`,children:["Present items \xB7 one per line"," ",(0,o.jsx)("span",{className:`${i}-hint`,children:"Objects physically in this room."}),(0,o.jsx)("textarea",{className:`${i}-textarea`,value:C.state.items.join(`
`),onChange:xe=>ge(ne=>ne&&{...ne,privateSpaces:ne.privateSpaces?.map(fe=>fe.ownerId===C.ownerId?{...fe,state:{...fe.state,items:xe.target.value.split(`
`)}}:fe)})})]}),(0,o.jsxs)("label",{className:`${i}-label`,children:["Established facts \xB7 one per line"," ",(0,o.jsx)("span",{className:`${i}-hint`,children:"Durable truths about this room."}),(0,o.jsx)("textarea",{className:`${i}-textarea`,value:C.state.publicFacts.join(`
`),onChange:xe=>ge(ne=>ne&&{...ne,privateSpaces:ne.privateSpaces?.map(fe=>fe.ownerId===C.ownerId?{...fe,state:{...fe.state,publicFacts:xe.target.value.split(`
`)}}:fe)})})]})]}),(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:St||!C.description.trim(),onClick:()=>{Xf("private",C.ownerId)},children:"Propose private room edit"})]},C.ownerId)),K&&(l.residentIds?.length??0)>0?(0,o.jsxs)("section",{className:`${i}-venue-card`,children:[(0,o.jsx)("h2",{className:`${i}-panel-title`,children:"Resident moves"}),(0,o.jsxs)("select",{value:we,onChange:C=>je(C.target.value),"aria-label":"Destination for resident move",children:[(0,o.jsx)("option",{value:"",children:"Choose a Residence with an available bed"}),n.settings.venues.filter(C=>C.id!==l.id&&ei(C).includes("residence")&&zu(C)<lx(C)).map(C=>(0,o.jsx)("option",{value:C.id,children:C.name},C.id))]}),(l.residentIds??[]).map(C=>{let xe=n.residences.find(ne=>ne.characterId===C&&ne.status!=="current");return(0,o.jsxs)("div",{className:`${i}-row`,children:[(0,o.jsx)("strong",{children:xn(C)}),xe?(0,o.jsx)("span",{className:`${i}-hint`,children:xe.status==="moving"?"Moving":"Awaiting consent"}):(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:!we||St,onClick:()=>{nt(!0),L("/residences/proposals",{method:"POST",body:JSON.stringify({characterId:C,venueId:we})}).then(r).catch(ne=>Ve(F(ne,"The move could not be requested."))).finally(()=>nt(!1))},children:"Ask to move"})]},C)})]}):null,I?(0,o.jsx)("p",{className:`${i}-hint`,role:"status",children:I}):null,Lt?(0,o.jsx)("p",{className:`${i}-error`,role:"alert",children:Lt}):null]}):(0,o.jsx)("main",{className:`${i}-venue-proposal-page`,children:(0,o.jsxs)("section",{className:`${i}-venue-card`,children:[(0,o.jsx)("h2",{className:`${i}-panel-title`,children:"Propose a Venue change"}),(0,o.jsx)("p",{className:`${i}-hint`,children:"Residents and workers affected by a structural change will reply in your Mailbox. A vacant Venue changes after you submit the reviewed terms."}),he?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("fieldset",{className:`${i}-field`,children:[(0,o.jsx)("legend",{className:`${i}-label`,children:"Classes \xB7 choose up to two"}),(0,o.jsx)("div",{className:`${i}-row`,children:Es.map(C=>(0,o.jsxs)("label",{className:`${i}-label`,children:[(0,o.jsx)("input",{type:"checkbox",checked:he.classes.includes(C),disabled:!he.classes.includes(C)&&he.classes.length>=2,onChange:xe=>ct(ne=>ne&&{...ne,classes:xe.target.checked?[...ne.classes,C]:ne.classes.filter(fe=>fe!==C)})})," ",C]},C))})]}),he.classes.includes("residence")?(0,o.jsxs)("label",{className:`${i}-label`,children:["Base capacity \xB7 includes you",(0,o.jsx)("input",{className:`${i}-notice-input`,type:"number",min:1,max:4,value:he.capacity,onChange:C=>ct({...he,capacity:Number(C.target.value)})})]}):null,(0,o.jsxs)("label",{className:`${i}-label`,children:["Improvement slot",(0,o.jsxs)("select",{value:he.slot,onChange:C=>ct({...he,slot:Number(C.target.value)}),children:[(0,o.jsxs)("option",{value:0,children:["Slot 1 \xB7 ",l.improvements?.[0]?.title??"empty"]}),(0,o.jsxs)("option",{value:1,children:["Slot 2 \xB7 ",l.improvements?.[1]?.title??"empty"]})]})]}),(0,o.jsxs)("label",{className:`${i}-label`,children:["Improvement title \xB7 leave empty for a Class or capacity proposal",(0,o.jsx)("input",{className:`${i}-notice-input`,value:he.title,onChange:C=>ct({...he,title:C.target.value}),placeholder:"A second sleeping alcove"})]}),he.title?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("label",{className:`${i}-label`,children:["What changes in the story?",(0,o.jsx)("textarea",{className:`${i}-textarea`,value:he.description,onChange:C=>ct({...he,description:C.target.value})})]}),(0,o.jsxs)("label",{className:`${i}-label`,children:["Extra beds \xB7 optional mechanical effect",(0,o.jsx)("input",{className:`${i}-notice-input`,type:"number",min:0,max:3,value:he.extraBeds,onChange:C=>ct({...he,extraBeds:Number(C.target.value)})})]})]}):null,(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:St||he.classes.length<1||he.title.trim().length>0&&!he.description.trim(),onClick:()=>{nt(!0),Ve(""),L(`/locations/venue/${encodeURIComponent(l.id)}/proposals`,{method:"POST",body:JSON.stringify({classes:he.classes,capacity:he.capacity,...he.title.trim()?{slot:he.slot,improvement:{title:he.title,description:he.description,extraBeds:he.extraBeds}}:{},title:he.title||`Change ${l.name}`,detail:he.description||`Change Venue Classes or capacity at ${l.name}.`})}).then(C=>{r(C),ct(null),X("Proposal submitted.")}).catch(C=>Ve(F(C,"The proposal could not be saved."))).finally(()=>nt(!1))},children:"Submit proposal"})]}):(0,o.jsx)("p",{className:`${i}-hint`,role:"status",children:I||"Proposal submitted."}),Lt?(0,o.jsx)("p",{className:`${i}-error`,role:"alert",children:Lt}):null]})})]})}if(z==="menu")return(0,o.jsxs)("div",{className:`${i}-root ${i}-sectioned-menu`,"data-section":It,"data-page":P,"data-mobile":t,children:[(0,o.jsxs)("header",{className:`${i}-header`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("h1",{className:`${i}-title`,children:Y2[P]}),t?null:(0,o.jsx)("p",{className:`${i}-subtitle`,children:"Everything you can change about the village lives here, away from the village itself."})]}),(0,o.jsx)("div",{className:`${i}-actions`,children:(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:P!=="index"?()=>gt("index"):Tc,children:P!=="index"?"Back to menu":"Back to the village"})}),Ri?(0,o.jsx)("p",{className:`${i}-error`,role:"alert",children:Ri}):null]}),(0,o.jsxs)("nav",{className:`${i}-menu-nav`,"aria-label":"Village menu pages",children:[(0,o.jsxs)("div",{className:`${i}-menu-group`,children:[(0,o.jsx)("h2",{className:`${i}-panel-title`,children:"Village Management"}),(0,o.jsxs)("div",{className:`${i}-menu-group-buttons`,children:[(0,o.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":P==="villagers","data-active":P==="villagers"?"true":"false",disabled:!n||ee,onClick:()=>jt("villagers"),children:`Villagers (${n?.villagers.length??0})`}),(0,o.jsx)("button",{type:"button",className:i+"-button","aria-pressed":P==="memories","data-active":P==="memories"?"true":"false",disabled:!n||ee,onClick:()=>jt("memories"),children:"Memories"}),(0,o.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":P==="venueRequests","data-active":P==="venueRequests"?"true":"false",disabled:!n||ee,onClick:()=>jt("venueRequests"),children:`Venue Requests (${(n?.venueRequests?.length??0)+(n?.upgradeRequests?.length??0)+(n?.residences?.filter(l=>l.status==="pending"&&l.requestedBy==="villager").length??0)})`}),(0,o.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":P==="projects","data-active":P==="projects"?"true":"false",disabled:!n||ee,onClick:()=>jt("projects"),children:`Projects (${n?.projects?.filter(l=>(l.kind==="new-venue"||l.kind==="renovation")&&l.lifecycle?.phase!=="complete").length??0})`}),(0,o.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":P==="village","data-active":P==="village"?"true":"false",onClick:()=>jt("village"),children:"Village Settings"})]})]}),(0,o.jsxs)("div",{className:`${i}-menu-group`,children:[(0,o.jsx)("h2",{className:`${i}-panel-title`,children:"General Settings"}),(0,o.jsx)("div",{className:`${i}-menu-group-buttons`,children:(0,o.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":P==="general","data-active":P==="general"?"true":"false",onClick:()=>jt("general"),children:"General settings"})})]}),(0,o.jsxs)("div",{className:`${i}-menu-group`,children:[(0,o.jsx)("h2",{className:`${i}-panel-title`,children:"Debug"}),(0,o.jsxs)("div",{className:`${i}-menu-group-buttons`,children:[Ys?(0,o.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":P==="progress","data-active":P==="progress"?"true":"false",disabled:!n||ee,onClick:()=>jt("progress"),children:"DEBUG: Progress"}):null,(0,o.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":P==="chatlogs","data-active":P==="chatlogs"?"true":"false",disabled:!n||ee,onClick:()=>jt("chatlogs"),children:`DEBUG: Venue Visits (${b?.length??0})`}),(0,o.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":P==="agendas","data-active":P==="agendas"?"true":"false",disabled:!n||ee,onClick:()=>jt("agendas"),children:`DEBUG: Villager Wishes (${ve?.length??0})`}),(0,o.jsx)("button",{type:"button",className:`${i}-button`,"aria-pressed":P==="schedules","data-active":P==="schedules"?"true":"false",disabled:!n||ee,onClick:()=>jt("schedules"),children:`Villager Agendas (${ve?.length??0})`})]})]})]}),P==="index"?(0,o.jsxs)("section",{className:`${i}-panel ${i}-menu-content ${i}-menu-welcome`,role:"main",children:[Cc,(0,o.jsx)("span",{className:`${i}-venue-kicker`,children:"Village menu"}),(0,o.jsx)("h2",{children:"Choose where to go"}),(0,o.jsx)("p",{children:"Manage the people and places in your village, adjust settings, or inspect its DEBUG records."}),(0,o.jsxs)("div",{className:`${i}-menu-quick-links`,children:[(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>jt("villagers"),children:"Village Management"}),(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>jt("general"),children:"General Settings"}),(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>jt("chatlogs"),children:"DEBUG Settings"})]})]}):!n&&P!=="general"?(0,o.jsx)("section",{className:`${i}-panel ${i}-menu-content`,role:"main",children:Ri?"The village could not be loaded. Return to the village and try again.":"Loading village menu\u2026"}):P==="general"?(0,o.jsxs)("section",{className:`${i}-panel ${i}-menu-content`,role:"main",children:[Cc,(0,o.jsx)("h2",{className:`${i}-panel-title`,children:"General settings"}),(0,o.jsx)(Vg,{}),n?(0,o.jsxs)("div",{className:`${i}-field`,children:[(0,o.jsxs)("label",{className:`${i}-row`,htmlFor:`${i}-speech-colors`,children:[(0,o.jsx)("input",{id:`${i}-speech-colors`,type:"checkbox",checked:n.settings.characterSpeechColors,disabled:ee,onChange:l=>{v$(l.target.checked)}}),(0,o.jsx)("span",{children:"Character chat colors"})]}),(0,o.jsx)("span",{className:`${i}-hint`,children:"Show names and spoken words in the colors captured from each villager\u2019s card. Use Compare card and Apply refresh to adopt later color changes."})]}):null,n?(0,o.jsxs)("div",{className:`${i}-field`,children:[(0,o.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-story-pace`,children:"Background events and wishes"}),(0,o.jsx)("p",{className:`${i}-empty`,children:"Controls automatic Events, resident housing proposals from those events, and new wishes. Off pauses these. Time, schedules, approved moves, construction, and existing wish expiry continue. Visits and other generation features use their own controls. All enabled levels allow at most one new wish per resident per day and two active wishes; quiet days can have none."}),(0,o.jsx)("select",{id:`${i}-story-pace`,value:n.settings.storyPace,disabled:ee,onChange:l=>{b$(l.target.value)},children:n.settings.storyPaces.map(l=>(0,o.jsx)("option",{value:l,children:l.charAt(0).toUpperCase()+l.slice(1)},l))}),(0,o.jsx)("span",{className:`${i}-hint`,children:p2(n.settings.storyPace)})]}):null,n?(0,o.jsxs)("div",{className:`${i}-field`,children:[(0,o.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-visit-retention`,children:"Visit transcripts"}),(0,o.jsx)("p",{className:`${i}-empty`,children:"Exact visit logs are kept forever by default. Automatic cleanup skips visits with memory pending and keeps filed memories and world changes."}),(0,o.jsxs)("select",{id:`${i}-visit-retention`,value:n.settings.visitRetention.mode,disabled:ee,onChange:l=>{let u=l.target.value;zf({mode:u,value:u==="count"?100:u==="days"?365:0})},children:[(0,o.jsx)("option",{value:"forever",children:"Keep forever"}),(0,o.jsx)("option",{value:"count",children:"Keep latest visits"}),(0,o.jsx)("option",{value:"days",children:"Retire after days"})]}),n.settings.visitRetention.mode!=="forever"?(0,o.jsx)("input",{type:"number","aria-label":n.settings.visitRetention.mode==="count"?"Number of visits to keep":"Days to keep visits",min:n.settings.visitRetention.mode==="count"?1:30,max:n.settings.visitRetention.mode==="count"?1e3:3650,defaultValue:n.settings.visitRetention.value,onBlur:l=>{let u=Number(l.target.value);u!==n.settings.visitRetention.value&&zf({mode:n.settings.visitRetention.mode,value:u})}},`${n.settings.visitRetention.mode}:${n.settings.visitRetention.value}`):null]}):null,(0,o.jsxs)("div",{className:`${i}-field`,children:[(0,o.jsx)("span",{className:`${i}-label`,children:"Starting over"}),(0,o.jsx)("p",{className:`${i}-empty`,children:"This is not the same thing. It takes the village apart completely \u2014 the villagers, their conversations, the places, the noticeboard, your own details and the map \u2014 and hands you an empty one. There is no way back."}),(0,o.jsx)("div",{className:`${i}-row`,children:Lx?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("button",{type:"button",className:`${i}-button ${i}-danger`,disabled:ee,onClick:()=>{U$()},children:"Yes, empty the village"}),(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:ee,onClick:()=>vc(!1),children:"Keep it"})]}):(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:ee||!n,onClick:()=>vc(!0),children:"Reset the village and start over"})})]}),Na?(0,o.jsx)("p",{className:`${i}-error`,role:"alert",children:Na}):null]}):P==="village"?(0,o.jsxs)("div",{className:`${i}-menu-body ${i}-menu-content`,role:"main",children:[(0,o.jsxs)("section",{className:i+"-venue-card",children:[(0,o.jsx)(xh,{value:Mn,onChange:uc}),(0,o.jsxs)("label",{children:[(0,o.jsx)("input",{type:"checkbox",checked:zn,onChange:l=>hc(l.target.checked)}),"Personalize new venue images by default"]}),(0,o.jsxs)("label",{children:[(0,o.jsx)("input",{type:"checkbox",checked:Vn,onChange:l=>mc(l.target.checked)}),"Use visual lore by default"]}),(0,o.jsx)("button",{type:"button",disabled:ee,onClick:async()=>{ce(!0),be("");try{r(await L("/settings",{method:"PATCH",body:JSON.stringify({sceneryArtStyle:Mn,personalizeVenueImagesByDefault:zn,useVisualLoreByDefault:Vn})}))}catch(l){be(F(l,"Scenery settings could not be saved."))}finally{ce(!1)}},children:"Save scenery settings"})]}),Cc,n?(0,o.jsxs)("section",{className:`${i}-panel`,children:[(0,o.jsx)("h2",{className:`${i}-panel-title`,children:"Village settings"}),(0,o.jsx)("p",{className:`${i}-empty`,children:"These choices belong to this village. Resident cards shape their voices, and Villages writes each scene around what is happening now. Village knowledge is refreshed for every reply."}),(0,o.jsx)(H2,{}),(0,o.jsxs)("section",{className:i+"-field","aria-label":"Village Map",children:[(0,o.jsx)("h3",{className:i+"-panel-title",children:"Village Map"}),(0,o.jsx)("p",{className:i+"-hint",children:"Replace the background image here. Venue pins remain in their saved places until you reposition them in the preview."}),fn?(0,o.jsx)("p",{className:i+"-error",role:"alert",children:"Venues will not move automatically. Review every pin on the new map; moving one here is free and does not change its residents, projects, or history."}):null,(0,o.jsx)(zg,{src:Yx,alt:"Village map preview with venue pins",pins:n.settings.venues.flatMap(l=>{let u=fn?zs[l.id]:Tu(l);return!u||u.x===null||u.y===null?[]:[{id:l.id,x:u.x,y:u.y,text:l.name,tone:Mu(l)?hx({isPlayerHome:l.occupancy.playerHome,occupant:l.occupancy.residentCharacterId}):"venue",onSelect:()=>sc(l.id)}]}),placing:fn&&ao!==null,view:br,shape:Bx,zoom:jx,mobile:t,onView:wc&&!ao?ri:void 0,onPlace:fn&&ao?(l,u)=>{Zg(g=>({...g,[ao]:{x:l,y:u}})),sc(ao),Rs(null)}:void 0}),fn?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("div",{className:i+"-row",children:[(0,o.jsx)("button",{type:"button",className:i+"-button",disabled:ee||io,onClick:()=>{N$()},children:io?"Generating map\u2026":"Generate replacement"}),(0,o.jsx)("input",{className:i+"-file",type:"file",accept:"image/png,image/jpeg,image/webp,image/avif","aria-label":"Upload replacement village map",disabled:ee||io,onChange:l=>{let u=l.target.files?.[0];l.target.value="",S$(u)}}),(0,o.jsx)("button",{type:"button",className:i+"-button",disabled:ee||io,onClick:()=>{no(!0),co(null),ri(null),Rs(null)},children:"No background image"})]}),On||Ms?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("p",{className:i+"-hint",children:"Select a venue, then choose Move pin and its new position on the preview. Unmoved venues keep their saved coordinates."}),(0,o.jsx)("div",{className:i+"-field","aria-label":"Venue placement",children:n.settings.venues.map(l=>{let u=zs[l.id],g=l.occupancy.residentCharacterId?xn(l.occupancy.residentCharacterId):l.occupancy.playerHome?ic(n):"";return(0,o.jsxs)("div",{className:i+"-row",children:[(0,o.jsx)("button",{type:"button",className:i+"-button","aria-pressed":Mx===l.id,onClick:()=>sc(l.id),children:l.name}),(0,o.jsx)("span",{className:i+"-hint",children:g||"No resident"}),(0,o.jsx)("span",{className:i+"-hint",children:u?.x!==null&&u?.x!==void 0&&u?.y!==null&&u?.y!==void 0?"On map":"Not placed"}),(0,o.jsx)("button",{type:"button",className:i+"-button","aria-pressed":ao===l.id,onClick:()=>Rs(l.id),children:"Move pin"})]},l.id)})})]}):null,Fu?(0,o.jsx)("p",{className:i+"-hint","data-tone":Fu.tone,children:Fu.text}):null,wc?(0,o.jsx)("div",{className:i+"-steps",role:"group","aria-label":"How the picture sits in the frame",children:mx.map(l=>(0,o.jsx)("button",{type:"button",className:i+"-step","data-clickable":"true","data-active":br.fit===l.fit?"true":"false","aria-pressed":br.fit===l.fit,onClick:()=>ri({...br,fit:l.fit}),children:l.label},l.fit))}):null,(0,o.jsxs)("div",{className:i+"-row",children:[(0,o.jsx)("button",{type:"button",className:i+"-button",disabled:ee||io||!On&&!Ms,onClick:()=>{Vf()},children:"Save map and placements"}),(0,o.jsx)("button",{type:"button",className:i+"-button",disabled:ee||io,onClick:Of,children:"Cancel replacement"})]})]}):wc?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("div",{className:i+"-steps",role:"group","aria-label":"How the picture sits in the frame",children:mx.map(l=>(0,o.jsx)("button",{type:"button",className:i+"-step","data-clickable":"true","data-active":br.fit===l.fit?"true":"false","aria-pressed":br.fit===l.fit,onClick:()=>ri({...br,fit:l.fit}),children:l.label},l.fit))}),(0,o.jsxs)("div",{className:i+"-row",children:[(0,o.jsx)("button",{type:"button",className:i+"-button",disabled:ee,onClick:()=>{Vf()},children:"Save framing"}),(0,o.jsx)("button",{type:"button",className:i+"-button",disabled:ee,onClick:Of,children:"Cancel"})]})]}):(0,o.jsxs)("div",{className:i+"-row",children:[(0,o.jsx)("button",{type:"button",className:i+"-button",disabled:ee,onClick:$$,children:"Replace map"}),n.settings.townMapImageSetAt?(0,o.jsx)("button",{type:"button",className:i+"-button",disabled:ee||!lo,onClick:()=>yc(!0),children:"Crop or fit current map"}):null]}),Na?(0,o.jsx)("p",{className:i+"-error",role:"alert",children:Na}):null]}),(0,o.jsxs)("div",{className:`${i}-field`,children:[(0,o.jsx)("p",{className:`${i}-empty`,children:"Revisit the founding setup to update the village as it stands now. Its original first day stays in the founding record."}),(0,o.jsxs)("div",{className:`${i}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:ee||!n,onClick:()=>Js(!1,n),children:"Run setup again"}),(0,o.jsx)("span",{className:`${i}-hint`,children:"Keeps your villagers, their conversations and anything you have written."})]})]}),(0,o.jsxs)("div",{className:`${i}-field`,children:[(0,o.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setting`,children:"What is this village like?"}),(0,o.jsx)("textarea",{id:`${i}-setting`,className:`${i}-textarea ${i}-off`,value:G,maxLength:n.settings.settingMaxLength,placeholder:"A cliffside fishing town where the boats go out before dawn\u2026",disabled:!0,onChange:l=>se(l.target.value)}),(0,o.jsx)("p",{className:`${i}-macro-help`,children:"Read-only here. Change the village description on World & First Day in the founding wizard. This description still guides what villagers know about their home."})]}),(0,o.jsx)(fx,{books:Vu,error:Bg,selected:We,onChange:Ma,disabled:ee}),(0,o.jsxs)("div",{className:`${i}-field`,children:[(0,o.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-lore-budget`,children:"Lorebook token budget"}),(0,o.jsx)("input",{id:`${i}-lore-budget`,className:`${i}-notice-input`,type:"number",min:n.settings.loreTokenBudgetMin,max:n.settings.loreTokenBudgetMax,step:100,value:pn,disabled:ee,onChange:l=>oa(Number(l.target.value))}),(0,o.jsx)("p",{className:`${i}-hint`,children:"Maximum approximate lore tokens in future text generation. Image prompts keep a separate short excerpt."})]}),(0,o.jsxs)("section",{className:`${i}-field`,children:[(0,o.jsxs)("div",{className:`${i}-row`,style:{justifyContent:"space-between"},children:[(0,o.jsx)("h2",{className:`${i}-panel-title`,children:"Venues"}),(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:L$,disabled:ee||E$>=n.settings.maxPlaces,children:"Propose Venue Project"})]}),(0,o.jsx)("p",{className:`${i}-hint`,children:"Each Venue is one unique place. Its Form describes what it is; one or two Classes describe what people do there."}),(0,o.jsx)("input",{className:`${i}-notice-input`,type:"search",value:Yg,onChange:l=>Rx(l.target.value),placeholder:"Find a Venue by name, Form, or Class","aria-label":"Search Venues"}),(0,o.jsx)("div",{className:`${i}-notice-add`,children:n.settings.venues.filter(l=>`${l.name} ${l.form??""} ${ei(l).join(" ")}`.toLowerCase().includes(Yg.toLowerCase())).map(l=>(0,o.jsxs)("div",{className:`${i}-notice-row`,children:[(0,o.jsx)("strong",{children:l.name||"Unnamed Residence"}),(0,o.jsx)("span",{className:`${i}-hint`,children:[l.form,ei(l).join(" + ")].filter(Boolean).join(" \xB7 ")}),ei(l).includes("residence")?(0,o.jsxs)("span",{className:`${i}-hint`,children:[(l.residentIds?.length??+!!l.occupancy.residentCharacterId)+Number(l.occupancy.playerHome)," ","/ ",l.residenceCapacity??1," residents"]}):null,(0,o.jsxs)("div",{className:`${i}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>oh(l),children:"View Venue"}),(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>ge(structuredClone(l)),children:"Edit"}),(0,o.jsx)("button",{type:"button",className:`${i}-remove`,onClick:()=>{j$(l.id)},"aria-label":`Delete ${l.name}`,disabled:ee,children:"\xD7"})]})]},l.id))}),pe?(0,o.jsxs)("div",{className:`${i}-field`,children:[(0,o.jsx)("h3",{className:`${i}-panel-title`,children:n.settings.venues.some(l=>l.id===pe.id)?"Edit Venue":"Create Venue"}),(0,o.jsx)(cx,{draft:pe,existing:n.settings.venues.some(l=>l.id===pe.id),villagers:n.villagers,onChange:ge}),(0,o.jsxs)("div",{className:`${i}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:ee||!pe.name.trim()||!ei(pe).every(l=>mn(pe,l).description.trim()),onClick:()=>{B$(pe)},children:"Save Venue"}),(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>ge(null),children:"Cancel"})]})]}):null,(0,o.jsx)("div",{className:`${i}-row`,children:(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{y$()},disabled:ee,children:"Suggest Venues"})}),oc.filter(l=>!n.settings.venues.some(u=>u.id===l.id)).map(l=>(0,o.jsxs)("div",{className:`${i}-notice-row`,children:[(0,o.jsx)("strong",{children:l.name}),(0,o.jsx)("span",{className:`${i}-hint`,children:l.form}),(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>ge(l),children:"Review suggestion"})]},l.id))]}),(0,o.jsxs)("div",{className:`${i}-field`,children:[(0,o.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-knowledge`,children:"The information villagers know"}),(0,o.jsx)("textarea",{id:`${i}-knowledge`,ref:eh,className:`${i}-preset`,value:Fe,maxLength:n.settings.promptBoxMaxLength,spellCheck:!1,onChange:l=>Bt(l.target.value)}),(0,o.jsx)("p",{className:`${i}-macro-help`,children:"What a villager here knows, written as tokens the village fills in for itself: the time, the weather, who else lives here, what is on the noticeboard. Because it is written out fresh on every reply, a villager here is always current \u2014 and because it is only these tokens, adding a place or pinning a note reaches every villager without anything being edited here. A resident's card guides their voice; additional writing guidance is in Village Settings."}),(0,o.jsx)("div",{className:`${i}-macros`,children:n.settings.macros.map(l=>(0,o.jsx)("button",{type:"button",className:`${i}-macro`,title:`${l.label} \u2014 ${l.help}`,onClick:()=>Y$(l.token),children:l.token},l.token))}),(0,o.jsxs)("p",{className:`${i}-macro-help`,children:["Click a token to drop it in at the cursor of the box. A token with nothing behind it turns into nothing at all, so ",(0,o.jsx)("code",{children:"{{lore}}"})," can sit in the prompt until there is lore to put there."]})]}),(0,o.jsx)(D2,{idPrefix:"settings",personas:_,draft:E,onDraft:x,storedId:n.settings.playerPersonaId,storedName:n.settings.playerPersonaName,storedMissing:n.settings.playerPersonaMissing,disabled:ee}),(0,o.jsx)(Oc,{role:n.settings.playerRole}),(0,o.jsxs)("div",{className:`${i}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{f$()},disabled:ee,children:"Save settings"}),(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Bt(n.settings.defaultPromptKnowledge)},disabled:ee,children:"Restore the default box"}),(0,o.jsx)("span",{className:`${i}-hint`,children:Fe===n.settings.promptKnowledge&&E===n.settings.playerPersonaId&&G===n.settings.setting&&JSON.stringify(We)===JSON.stringify(n.settings.selectedLorebookIds)?"No unsaved settings changes. Save places individually.":"Unsaved settings changes. Save places individually."})]})]}):null,Na&&!fn&&!gf?(0,o.jsx)("p",{className:`${i}-error`,role:"alert",children:Na}):null]}):(0,o.jsxs)("div",{className:`${i}-menu-body ${i}-menu-content`,role:"main",children:[Cc,It==="debug"?(0,o.jsxs)("section",{className:`${i}-panel ${i}-menu-debug-action`,children:[(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:!n||ee||Wu,onClick:()=>{Kx()},children:"Force Village Update"}),(0,o.jsx)("p",{className:`${i}-status`,children:G2}),Nf?(0,o.jsx)("p",{className:`${i}-status`,role:"status",children:Nf}):null]}):null,P==="villagers"&&Dt&&n?.villagers.some(l=>l.characterId===Dt)?(0,o.jsx)($b,{villager:n.villagers.find(l=>l.characterId===Dt),request:L,onSaved:l=>r(l),onExport:()=>q2(n.villagers.find(l=>l.characterId===Dt)),onBack:()=>{ft(null),requestAnimationFrame(()=>{for(let{element:l,top:u}of Pt.current)l.scrollTop=u;wa.current?.focus({preventScroll:!0})})}},Dt):null,P==="villagers"?(0,o.jsxs)("div",{className:`${i}-overlay`,style:Dt?{display:"none"}:void 0,children:[(0,o.jsx)("div",{className:`${i}-overlay-head`,children:(0,o.jsx)("h2",{className:`${i}-panel-title`,children:"Villagers"})}),(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("p",{className:`${i}-empty`,children:"Characters from your library live here. Moving someone out forgets nothing about the character card itself."}),(0,o.jsx)("div",{className:`${i}-row`,children:(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>Ft(l=>!l),disabled:ee,children:qt?"Close the list":"Add a villager"})}),qt?(0,o.jsxs)("div",{className:`${i}-field`,children:[(0,o.jsx)("input",{className:`${i}-search`,type:"search",value:le,onChange:l=>Pe(l.target.value),placeholder:"Search by name, note or tag\u2026","aria-label":"Search your character library"}),c===null?(0,o.jsx)("p",{className:`${i}-empty`,style:{marginTop:".625rem"},children:"Reading your library\u2026"}):ch.length===0?(0,o.jsx)("p",{className:`${i}-empty`,style:{marginTop:".625rem"},children:"No characters match that search."}):(0,o.jsx)("div",{className:`${i}-picker-list`,children:ch.map(l=>(0,o.jsxs)("div",{className:`${i}-picker-item`,"data-resident":l.inVillage?"true":"false",children:[(0,o.jsx)(Kr,{portrait:ea[l.id],name:l.name,className:`${i}-avatar`}),(0,o.jsxs)("div",{className:`${i}-picker-text`,children:[(0,o.jsx)("div",{className:`${i}-villager-name`,children:l.name}),(0,o.jsx)("div",{className:`${i}-villager-role`,children:l.comment||l.tags.slice(0,3).join(" \xB7 ")}),l.summary?(0,o.jsx)("p",{className:`${i}-tile-summary`,children:l.summary}):null]}),(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{i$(l.id)},disabled:ee||l.inVillage,children:l.inVillage?"Lives here":"Move in"})]},l.id))})]}):null,n&&n.villagers.length>0?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("div",{className:`${i}-villagers`,children:n.villagers.map(l=>(0,o.jsx)(U2,{villager:l,portrait:ea[l.characterId],selected:!1,onSelect:!l.place||D!==null?void 0:()=>{let u=n.settings.venues.find(g=>g.id===l.place?.id);u&&Rf(u)}},l.characterId))}),(0,o.jsx)("div",{className:`${i}-roster`,children:n.villagers.map(l=>(0,o.jsx)("div",{className:`${i}-roster-entry`,children:(0,o.jsxs)("div",{className:`${i}-roster-row`,children:[(0,o.jsxs)("div",{children:[(0,o.jsx)("span",{className:`${i}-villager-name`,children:l.name}),l.missing?(0,o.jsx)("span",{className:`${i}-badge`,children:"card missing"}):null,kt[l.characterId]?(0,o.jsx)("div",{className:`${i}-tile-summary`,children:kt[l.characterId].changed?`New card: ${kt[l.characterId].proposed?.name??"unavailable"}`:kt[l.characterId].sourceAvailable?`Snapshot revision ${kt[l.characterId].current.revision} is current.`:"The saved snapshot remains playable; the source card is unavailable."}):null]}),(0,o.jsxs)("span",{className:`${i}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:u=>{wa.current=u.currentTarget,Pt.current=[];for(let g=u.currentTarget.parentElement;g;g=g.parentElement)Pt.current.push({element:g,top:g.scrollTop});ft(l.characterId)},"aria-expanded":Dt===l.characterId,children:`Sprite Studio \xB7 ${l.sprite?.images.length??0} approved`}),(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{o$(l.characterId)},disabled:ee||qa.length>0,children:"Compare card"}),kt[l.characterId]?.changed&&kt[l.characterId]?.sourceAvailable?(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{s$(l.characterId)},disabled:ee||qa.length>0,children:"Apply refresh"}):null,(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{r$(l.characterId)},disabled:ee||qa.length>0,children:"Move out"})]})]})},l.characterId))})]}):(0,o.jsx)("p",{className:`${i}-empty`,children:"Nobody lives here yet. If you have just founded the village, the people you named are on their way."})]})]}):null,P==="memories"?(0,o.jsxs)("div",{className:i+"-overlay",children:[(0,o.jsx)("div",{className:i+"-overlay-head",children:(0,o.jsx)("h2",{className:i+"-panel-title",children:"Memories"})}),(0,o.jsx)(t2,{library:h,busy:ee,onRefresh:()=>{p(null),Fs()},onForget:(l,u)=>{Wx(l,u)}})]}):null,P==="noticeboard"&&n?(0,o.jsxs)("div",{className:`${i}-overlay`,children:[(0,o.jsx)("div",{className:`${i}-overlay-head`,children:(0,o.jsx)("h2",{className:`${i}-panel-title`,children:"Noticeboard"})}),n.noticeboard.length===0?(0,o.jsx)("p",{className:`${i}-empty`,children:"Nothing is pinned up. Anything you add here is something the villagers can bring up in conversation \u2014 and they will pin notes of their own up as time goes on."}):(0,o.jsx)("ul",{className:`${i}-notices`,children:n.noticeboard.map((l,u)=>(0,o.jsxs)("li",{className:`${i}-notice-row`,children:[(0,o.jsxs)("span",{children:[l.author.length>0?(0,o.jsx)("span",{className:`${i}-notice-author`,children:`${l.author}: `}):null,l.text]}),(0,o.jsx)("button",{type:"button",className:`${i}-remove`,onClick:()=>{G$(u)},disabled:ee,"aria-label":`Take down: ${l.text}`,children:"\xD7"})]},`${u}:${l.text}`))}),(0,o.jsxs)("div",{className:`${i}-notice-add`,children:[(0,o.jsx)("input",{className:`${i}-notice-input`,type:"text",value:lc,maxLength:n.settings.maxNoticeLength,placeholder:"Pin up a rumour, an event, a rule\u2026","aria-label":"New noticeboard note",onChange:l=>Qg(l.target.value),onKeyDown:l=>{l.key==="Enter"&&(l.preventDefault(),Bf())}}),(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Bf()},disabled:ee||lc.trim().length===0||n.noticeboard.length>=n.settings.maxNoticeboardNotes,children:`Pin it up (${n.noticeboard.length}/${n.settings.maxNoticeboardNotes})`})]})]}):null,P==="projects"&&n?(0,o.jsx)(X2,{snapshot:n,room:D,onSnapshot:r,onReturn:()=>j("room"),onMap:()=>{at(""),Tc()},onPlaceOnMap:l=>{ye(l),Be(l),Tc()},mobile:t,debugEnabled:Ys,focusProjectId:me,siteProjectId:Ge}):null,P==="venueRequests"&&n?(0,o.jsxs)("div",{className:`${i}-overlay`,children:[(0,o.jsx)("div",{className:`${i}-overlay-head`,children:(0,o.jsx)("h2",{className:`${i}-panel-title`,children:"Venue Requests"})}),(0,o.jsx)("p",{className:`${i}-macro-help`,children:"Villagers can ask for places in conversation. Accepting a request starts a New Venue Project; place its blueprint on the map, find a willing Builder, and work through the Project phases."}),n.venueRequests.length===0?(0,o.jsx)("p",{className:`${i}-empty`,children:"Nobody has requested a new place."}):(0,o.jsx)("ul",{className:`${i}-notices`,children:n.venueRequests.map(l=>{let u=de[l.id]??l.venueDraft,g=k=>Re(A=>({...A,[l.id]:{...u,...k}}));return(0,o.jsx)("li",{className:`${i}-notice-row`,children:(0,o.jsxs)("div",{className:`${i}-field`,children:[(0,o.jsx)("strong",{children:l.requesterName||"A villager"}),l.requestQuote?(0,o.jsxs)("p",{children:["\u201C",l.requestQuote,"\u201D"]}):null,(0,o.jsx)("span",{className:`${i}-hint`,children:` \xB7 ${l.source==="chat"?"Conversation":"Village life"}`}),(0,o.jsx)("input",{className:`${i}-notice-input`,value:u.name,maxLength:n.settings.maxVenueNameLength,"aria-label":`Requested place name from ${l.requesterName||"villager"}`,onChange:k=>g({name:k.target.value})}),(0,o.jsxs)("select",{className:`${i}-notice-input`,value:u.classes[0]??"gathering","aria-label":`Requested place class from ${l.requesterName||"villager"}`,onChange:k=>g({classes:[k.target.value]}),children:[(0,o.jsx)("option",{value:"residence",children:"Residence"}),(0,o.jsx)("option",{value:"gathering",children:"Gathering"}),(0,o.jsx)("option",{value:"workplace",children:"Workplace"}),(0,o.jsx)("option",{value:"other",children:"Other"})]}),(0,o.jsx)("textarea",{className:`${i}-textarea`,value:u.description??"",maxLength:1e3,"aria-label":`Requested place description from ${l.requesterName||"villager"}`,onChange:k=>g({description:k.target.value})}),(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:ee||!u.name.trim(),onClick:()=>{ce(!0),be(""),L("/locations/venue/descriptions/draft",{method:"POST",body:JSON.stringify({venues:[{id:l.id,name:u.name,classes:u.classes}]})}).then(k=>g({description:k.descriptions[l.id]??""})).catch(k=>be(F(k,"The description draft could not be generated."))).finally(()=>ce(!1))},children:"Generate description draft"}),(0,o.jsxs)("div",{className:`${i}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:ee||!u.name.trim()||u.classes.length===0||!u.description?.trim(),onClick:()=>{Lf(l,!0)},children:u.name!==l.venueDraft.name||JSON.stringify(u.classes)!==JSON.stringify(l.venueDraft.classes)?"Send counteroffer":"Start planning project"}),(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:ee,onClick:()=>{Lf(l,!1)},children:"Deny"})]})]})},l.id)})}),(0,o.jsx)("h3",{className:`${i}-panel-title`,children:"Home upgrade requests"}),n.upgradeRequests.length===0?(0,o.jsx)("p",{className:`${i}-hint`,children:"No home upgrades requested."}):n.upgradeRequests.map(l=>(0,o.jsxs)("div",{className:`${i}-notice-row`,children:[(0,o.jsx)("span",{children:l.detail}),[!0,!1].map(u=>(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:ee,onClick:()=>{ce(!0),be(""),L(`/venue-upgrades/${encodeURIComponent(l.id)}/${u?"approve":"deny"}`,{method:"POST"}).then(r).catch(g=>be(F(g,"The upgrade request could not be decided."))).finally(()=>ce(!1))},children:u?"Approve upgrade":"Deny"},String(u)))]},l.id)),(0,o.jsx)("h3",{className:`${i}-panel-title`,children:"Resident move requests"}),n.residences.filter(l=>l.status!=="current").length===0?(0,o.jsx)("p",{className:`${i}-hint`,children:"No moves pending."}):n.residences.filter(l=>l.status!=="current").map(l=>{let u=xn(l.characterId),g=n.settings.venues.find(k=>k.id===l.proposedVenueId)?.name||"another venue";return(0,o.jsxs)("div",{className:`${i}-notice-row`,children:[(0,o.jsx)("span",{children:`${u} \u2192 ${g}`}),l.status==="moving"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("span",{className:`${i}-hint`,children:["Move due ",new Date(l.completesAt??"").toLocaleString()]}),(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:ee,onClick:()=>{ce(!0),be(""),L("/residences/debug/complete-now",{method:"POST",body:JSON.stringify({characterId:l.characterId})}).then(r).catch(k=>be(F(k,"The move could not be completed."))).finally(()=>ce(!1))},children:"DEBUG: Complete move now"})]}):l.requestedBy==="player"?(0,o.jsxs)("span",{className:`${i}-hint`,children:["Awaiting ",u,"'s answer in conversation."]}):[!0,!1].map(k=>(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:ee,onClick:()=>{ce(!0),be(""),L(`/residences/${k?"approvals":"denials"}`,{method:"POST",body:JSON.stringify({characterId:l.characterId})}).then(r).catch(A=>be(F(A,"The move request could not be decided."))).finally(()=>ce(!1))},children:k?"Approve move":"Deny"},String(k)))]},l.characterId)}),Na?(0,o.jsx)("p",{className:`${i}-error`,role:"alert",children:Na}):null]}):null,P==="progress"?(0,o.jsxs)("div",{className:`${i}-panel`,children:[(0,o.jsx)("h2",{children:"DEBUG: Progress"}),(0,o.jsxs)("p",{children:["Engine version: ",Me?.engineVersion??"loading"]}),(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{L("/progress/debug").then(Vt)},children:"Refresh diagnostics"}),Me?.backlog.length?(0,o.jsxs)("section",{children:[(0,o.jsx)("h3",{children:"Unprocessed saved turns"}),Me.backlog.map(l=>(0,o.jsxs)("p",{children:[l.at," \xB7 ",l.sessionId,"/",l.submissionId," ",l.error?`\xB7 ${l.error}`:"\xB7 awaiting replay"]},`${l.sessionId}:${l.submissionId}`))]}):(0,o.jsx)("p",{children:"No saved turns await replay."}),Me?.speechProofs?.length?(0,o.jsxs)("section",{children:[(0,o.jsx)("h3",{children:"Captured Project speech"}),Me.speechProofs.map(l=>(0,o.jsxs)("p",{children:[l.projectId," \xB7 ",l.grade??"typed"," \xB7 ",l.lineId,": \u201C",l.quote,"\u201D",l.citations?.map((u,g)=>(0,o.jsxs)("span",{children:[" ","\xB7 ",u.lineId,": \u201C",u.quote,"\u201D"]},`${u.lineId}:${g}`))]},`${l.projectId}:${l.lineId}`))]}):null,Me?.tasks.map(l=>(0,o.jsxs)("details",{open:!0,children:[(0,o.jsxs)("summary",{children:[l.definition.owner.kind," ",l.definition.owner.id," \xB7 revision ",l.definition.revision," \xB7"," ",l.resolvedAt?"resolved":l.definition.phases[l.phaseIndex]?.title??"complete"]}),(0,o.jsxs)("p",{children:["Disclosed: ",l.visibleAt||"hidden",l.resolvedAt?` \xB7 Resolved: ${l.resolvedAt} \xB7 ${l.resolutionKey}`:""]}),l.definition.phases.map(u=>(0,o.jsxs)("section",{children:[(0,o.jsx)("h3",{children:u.title}),u.requirements.map(g=>{let k=l.receipts.filter(A=>A.phaseId===u.id&&A.requirementId===g.id);return(0,o.jsxs)("p",{children:[g.title," \xB7 ",l.requirementVisibleAt[g.id]||"hidden"," \xB7"," ",k.length?k.map(A=>`${A.routeId} [${A.evidence.grade??"typed"}]: ${A.evidence.sourceId} ${A.evidence.excerpt??""} ${(A.evidence.citations??[]).map(U=>`${U.lineId}: ${U.quote}`).join("; ")}`).join("; "):"pending"]},g.id)})]},u.id)),l.attempts.length?(0,o.jsxs)("section",{children:[(0,o.jsx)("h3",{children:"Rejected or unavailable"}),l.attempts.map((u,g)=>(0,o.jsxs)("p",{children:[u.phaseId,"/",u.requirementId," \xB7 ",u.status,": ",u.reason]},`${u.evidenceId}:${g}`))]}):null,l.transitions.length?(0,o.jsxs)("section",{children:[(0,o.jsx)("h3",{children:"Transitions"}),l.transitions.map((u,g)=>(0,o.jsxs)("p",{children:[u.phaseId," \u2192 ",u.at," \xB7 ",u.evidenceId]},`${u.phaseId}:${g}`))]}):null,l.revisionHistory?.map(u=>(0,o.jsxs)("details",{children:[(0,o.jsxs)("summary",{children:["Earlier revision ",u.definition.revision," \xB7 ",u.receipts.length," accepted sources"]}),u.receipts.map(g=>(0,o.jsxs)("p",{children:[g.requirementId," \xB7 ",g.evidence.grade??"typed"," \xB7 ",g.evidence.sourceId," ","\xB7 ",g.evidence.excerpt??"",g.evidence.citations?.map(k=>(0,o.jsxs)("span",{children:[" ","\xB7 ",k.lineId,": \u201C",k.quote,"\u201D"]},`${k.lineId}:${k.quote}`))]},`${g.requirementId}:${g.evidence.sourceId}`)),u.transitions.map((g,k)=>(0,o.jsxs)("p",{children:[g.phaseId," \u2192 ",g.at]},`${g.phaseId}:${k}`))]},u.definition.revision))]},l.definition.id)),Ri?(0,o.jsx)("p",{className:`${i}-error`,role:"alert",children:Ri}):null]}):null,P==="chatlogs"?(0,o.jsxs)("div",{className:`${i}-overlay`,children:[(0,o.jsx)("div",{className:`${i}-overlay-head`,children:(0,o.jsx)("h2",{className:`${i}-panel-title`,children:"Venue visits"})}),(0,o.jsx)("p",{className:`${i}-empty`,children:"Completed venue visits are kept here word for word. Filter by place or resident; each visit has one shared record, including who heard each line. The village uses only the separately distilled memories."}),(0,o.jsxs)("div",{className:`${i}-row`,children:[(0,o.jsxs)("select",{"aria-label":"Filter visits by venue",value:Z,onChange:l=>{te(l.target.value),M(0),w(null)},children:[(0,o.jsx)("option",{value:"",children:"All venues"}),(n?.settings.venues??[]).map(l=>(0,o.jsx)("option",{value:l.id,children:l.name},l.id))]}),(0,o.jsxs)("select",{"aria-label":"Filter visits by resident",value:Q,onChange:l=>{Te(l.target.value),M(0),w(null)},children:[(0,o.jsx)("option",{value:"",children:"All residents"}),(n?.villagers??[]).map(l=>(0,o.jsx)("option",{value:l.characterId,children:l.name},l.characterId))]})]}),(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:ee||f===0,onClick:()=>{Ef()},children:"Delete all completed logs"}),B?(0,o.jsx)("p",{className:`${i}-error`,role:"alert",children:B}):null,b===null?(0,o.jsx)("p",{className:`${i}-empty`,children:"Reading venue visits\u2026"}):b.length===0?(0,o.jsx)("p",{className:`${i}-empty`,children:"No completed visits match these filters."}):b.map(l=>(0,o.jsxs)("section",{children:[(0,o.jsxs)("h3",{className:`${i}-story-day`,children:[l.placeName," \xB7 ",Au(l.startedAt)]}),(0,o.jsxs)("p",{className:`${i}-story-meta`,children:[l.participants.map(u=>u.name).join(", ")," \xB7 ",l.lineCount," lines",l.endReason==="inactivity"?" \xB7 Interrupted: Inactivity":"",l.memoryPending?l.memoryReview?.status==="pending"?` \xB7 durable review pending \xB7 ${l.memoryReview.nextRecollection??0}/${l.recollectionCount} recollections reviewed \xB7 ${l.memoryReview.attempts} ${l.memoryReview.attempts===1?"attempt":"attempts"}`:` \xB7 legacy memory pending (${l.memoryProgress?.nextUnit??0}/${l.memoryUnits} pieces processed)`:""]}),(0,o.jsxs)("div",{className:`${i}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{rh(l.id)},children:v?.id===l.id?"Refresh transcript":"Open transcript"}),l.memoryPending?(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:ee,onClick:()=>{n$(l.id)},children:l.memoryReview?.status==="pending"?"Retry review":"Retry memory"}):null,(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:ee,onClick:()=>{Ef(l.id)},children:"Delete log"})]}),v?.id===l.id?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("ul",{className:`${i}-story`,children:v.lines.map((u,g)=>(0,o.jsx)("li",{className:`${i}-story-row`,children:(0,o.jsxs)("span",{children:[(0,o.jsxs)("span",{className:`${i}-story-meta`,children:[(0,o.jsx)("span",{style:n?.settings.characterSpeechColors&&u.role==="assistant"&&u.kind!=="narration"?Ru(n.villagers.find(k=>k.characterId===u.speakerId)?.nameColor):void 0,children:u.name||ic(n)})," \xB7 ",Au(u.at)]}),(0,o.jsx)("span",{style:n?.settings.characterSpeechColors&&u.role==="assistant"&&u.kind!=="narration"?Ru(n.villagers.find(k=>k.characterId===u.speakerId)?.dialogueColor):void 0,children:Cs(u.content,`venue-${l.id}-${g}-`)}),(0,o.jsxs)("span",{className:`${i}-story-meta`,children:["Heard by:"," ",u.heardBy?.map(k=>v.participants.find(A=>A.characterId===k)?.name??k).join(", ")||"no one"]})]})},`${l.id}:${g}`))}),(v.submissions??[]).some(u=>u.recollections?.length)?(0,o.jsxs)("details",{className:`${i}-agenda-notes`,children:[(0,o.jsx)("summary",{children:"Captured recollections and evidence"}),(0,o.jsx)("ul",{className:`${i}-story`,children:(v.submissions??[]).flatMap(u=>(u.recollections??[]).map(g=>(0,o.jsxs)("li",{className:`${i}-wish-card`,children:[(0,o.jsx)("p",{className:`${i}-wish-text`,children:g.text}),(0,o.jsx)("p",{className:`${i}-wish-meta`,children:`Subjects: ${g.subjectCharacterIds.join(", ")||"none"} \xB7 Known by: ${g.knownByCharacterIds.join(", ")}`}),(0,o.jsx)("p",{className:`${i}-wish-meta`,children:`Evidence: ${g.lineIds.join(", ")}`})]},g.id)))})]}):null,v.memoryReview&&v.memoryReview.status!=="none"?(0,o.jsxs)("details",{className:`${i}-agenda-notes`,open:v.memoryPending,children:[(0,o.jsx)("summary",{children:`Durable review \xB7 ${v.memoryReview?.status??"none"}`}),(0,o.jsxs)("div",{className:`${i}-agenda-notes-body`,children:[(0,o.jsxs)("p",{className:`${i}-story-meta`,children:[`${v.memoryReview?.attempts??0} review attempts \xB7 ${v.memoryReview?.nextRecollection??0} recollections reviewed`,v.memoryReview?.error?` \xB7 Last error: ${v.memoryReview.error}`:""]}),(0,o.jsx)("ul",{className:`${i}-story`,children:(v.memoryReview?.decisions??[]).map(u=>(0,o.jsxs)("li",{className:`${i}-wish-card`,children:[(0,o.jsx)("p",{className:`${i}-wish-text`,children:`${u.action==="promote"?"Promoted":"Rejected"}${u.category?` \xB7 ${xx[u.category]}`:""}`}),u.text?(0,o.jsx)("p",{children:u.text}):null,(0,o.jsx)("p",{className:`${i}-wish-meta`,children:u.reason}),(0,o.jsx)("p",{className:`${i}-wish-meta`,children:`Sources: ${u.recollectionIds.join(", ")}`})]},u.id))})]})]}):null]}):null]},l.id)),f>20?(0,o.jsxs)("div",{className:`${i}-row`,children:[(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:V===0,onClick:()=>{M(Math.max(0,V-20)),w(null)},children:"Previous"}),(0,o.jsxs)("span",{children:[V+1,"\u2013",Math.min(f,V+20)," of ",f]}),(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:V+20>=f,onClick:()=>{M(V+20),w(null)},children:"Next"})]}):null]}):null,P==="agendas"?(0,o.jsxs)("div",{className:`${i}-overlay`,children:[(0,o.jsx)("div",{className:`${i}-overlay-head`,children:(0,o.jsx)("h2",{className:`${i}-panel-title`,children:"What the villagers wish"})}),(0,o.jsx)("p",{className:`${i}-empty`,children:"Private wishes can shape what a villager notices, says, and does. Their agenda is in Villager Agendas."}),ve===null?(0,o.jsx)("p",{className:`${i}-empty`,children:"Reading what the villagers wish\u2026"}):ve.length===0?(0,o.jsx)("p",{className:`${i}-empty`,children:"Nobody lives here yet."}):(0,o.jsx)("section",{children:ve.map(l=>(0,o.jsxs)("div",{children:[(0,o.jsxs)("h3",{className:`${i}-story-day`,children:[l.name,l.missing?(0,o.jsx)("span",{className:`${i}-badge`,children:"card missing"}):null]}),l.agenda===null?(0,o.jsx)("p",{className:`${i}-empty`,children:"Not written for yet. The village works this out on the next part of the day it already runs on, so there is nothing to press."}):l.agenda.wishes.length===0?(0,o.jsx)("p",{className:`${i}-empty`,children:l.agenda.personalizationFailure?`Routine personalization needs attention: ${l.agenda.personalizationFailure}`:l.agenda.generatedAt?"No current wishes.":"Their provisional routine is available. New wishes follow the daily allowance."}):(0,o.jsx)("ul",{className:`${i}-story`,children:l.agenda.wishes.map(u=>(0,o.jsxs)("li",{className:`${i}-wish-card`,children:[(0,o.jsx)("p",{className:`${i}-wish-text`,children:u.wish}),u.tell.length>0?(0,o.jsx)("p",{className:`${i}-wish-tell`,children:`Shows as: ${u.tell}`}):null,(0,o.jsx)("p",{className:`${i}-wish-meta`,children:`${u.intensity===1?"Faint":u.intensity===3?"Strong":"Present"} \xB7 ${i2(u.addedAt??"",u.expiresAt??"")}`})]},u.id))}),(0,o.jsx)(Z2,{characterId:l.characterId,total:l.wishHistoryCount??0,busy:ee,onCorrect:t$}),l.wishAttempt?(0,o.jsx)("p",{className:`${i}-hint`,children:`Wish update: ${l.wishAttempt.stage} \xB7 ${l.wishAttempt.reason} \xB7 ${l.wishAttempt.calls} requests \xB7 input tokens ${l.wishAttempt.inputTokens??"unavailable"} \xB7 output tokens ${l.wishAttempt.outputTokens??"unavailable"}`}):null]},l.characterId))})]}):null,P==="schedules"?(0,o.jsxs)("div",{className:`${i}-overlay`,children:[(0,o.jsx)("div",{className:`${i}-overlay-head`,children:(0,o.jsx)("h2",{className:`${i}-panel-title`,children:"Villager agendas"})}),(0,o.jsx)("p",{className:`${i}-empty`,children:"Each villager follows a Villages agenda. A Marinara schedule can guide future days when enabled."}),ve===null?(0,o.jsx)("p",{className:`${i}-empty`,children:"Loading agendas\u2026"}):ve.length===0?(0,o.jsx)("p",{className:`${i}-empty`,children:"Nobody lives here yet."}):(0,o.jsx)("div",{className:`${i}-agenda-list`,children:ve.map(l=>(0,o.jsxs)("details",{className:`${i}-week`,children:[(0,o.jsx)("summary",{className:`${i}-week-toggle`,children:(0,o.jsxs)("h3",{className:`${i}-week-head`,children:[l.name,l.agenda?.personalizationPending?(0,o.jsx)("span",{className:`${i}-badge`,children:l.agenda.personalizationFailure?"Personalization needs retry":"Personalizing"}):null,l.agenda?.personalizationFailure?(0,o.jsx)("span",{className:`${i}-badge`,children:"Personalization failed"}):null,l.missing?(0,o.jsx)("span",{className:`${i}-badge`,children:"Card missing"}):null,l.nativeSchedule?(0,o.jsx)("span",{className:`${i}-badge`,children:l.agenda?.activeDay?.scheduleInformed?"Schedule used today":"Schedule available"}):null,Eg(l)?(0,o.jsx)("span",{className:`${i}-badge`,children:"Earlier hours kept"}):null]})}),(0,o.jsxs)("div",{className:`${i}-week-body`,children:[l.agenda?.routineSummary?(0,o.jsx)("p",{className:`${i}-story-meta`,children:l.agenda.routineSummary}):null,l.agenda?.personalizationFailure?(0,o.jsx)("p",{className:`${i}-empty`,children:l.agenda.personalizationFailure}):l.agenda?.personalizationPending?(0,o.jsx)("p",{className:`${i}-story-scope`,children:"Personalizing this agenda in the background."}):null,(0,o.jsxs)("div",{className:`${i}-agenda-actions`,children:[(0,o.jsxs)("label",{className:`${i}-agenda-switch`,children:[(0,o.jsx)("input",{type:"checkbox",checked:l.ingestSchedule,disabled:ee,onChange:u=>{a$(l.characterId,u.target.checked)}}),"Use Marinara schedule when available"]}),(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:ee,onClick:()=>{e$(l.characterId)},children:"Regenerate agenda"})]}),l.nativeSchedule?(0,o.jsxs)("p",{className:`${i}-story-scope`,children:[l.ingestSchedule&&l.remapFailure?`Schedule translation failed: ${l.remapFailure.message}`:l.ingestSchedule&&l.agenda?.scheduleWeek?"Schedule guides today and future days.":l.ingestSchedule?"Schedule translation is pending.":"Schedule ingestion is off.",Eg(l)?" Earlier hours retain the previous plan.":""]}):Eg(l)?(0,o.jsx)("p",{className:`${i}-story-scope`,children:"Earlier hours retain the previous plan."}):null,l.weekUnreadable?(0,o.jsx)("p",{className:`${i}-empty`,children:"Marinara schedules could not be read right now. The Villages agenda remains active."}):l.nativeSchedule?null:(0,o.jsx)("p",{className:`${i}-empty`,children:"No Marinara schedule. Villages uses its own agenda."}),(0,o.jsx)("div",{className:`${i}-agenda-days`,children:l.days.map(u=>{let g=u.isToday?l.effectiveDays?.[u.weekday]??l.agenda?.activeDay?.blocks??l.agenda?.week?.[u.weekday]??[]:l.effectiveDays?.[u.weekday]??(l.ingestSchedule?l.agenda?.scheduleWeek?.[u.weekday]:void 0)??l.agenda?.week?.[u.weekday]??[],k=l.nativeSchedule?.days[u.weekday]??[];return(0,o.jsxs)("details",{className:`${i}-agenda-day`,open:u.isToday||void 0,children:[(0,o.jsxs)("summary",{children:[u.weekday," \xB7 ",u.dateLabel,u.isToday?" \xB7 Today":""]}),(0,o.jsxs)("div",{className:`${i}-agenda-compare`,"data-comparison":l.nativeSchedule?"true":void 0,children:[(0,o.jsxs)("section",{"aria-label":`${u.weekday} Villages agenda`,children:[(0,o.jsx)("h4",{children:"Villages agenda"}),(0,o.jsx)("ol",{className:`${i}-agenda-blocks`,children:g.map((A,U)=>(0,o.jsxs)("li",{children:[(0,o.jsxs)("time",{children:[ix(A.startMinute),"\u2013",ix(A.endMinute)]}),(0,o.jsx)("strong",{children:A.activity}),(0,o.jsx)("span",{children:A.venueId?a2(n?.settings.venues??[],A.venueId):"Home"}),(0,o.jsx)("span",{children:A.reason}),(0,o.jsx)("span",{className:`${i}-story-scope`,children:A.status==="idle"?"Available":A.status==="dnd"?"Busy":A.status==="offline"?"Offline":"Online"})]},`${A.startMinute}-${A.endMinute}-${U}`))})]}),l.nativeSchedule?(0,o.jsxs)("section",{"aria-label":`${u.weekday} Marinara schedule`,children:[(0,o.jsx)("h4",{children:"Marinara schedule"}),k.length?(0,o.jsx)("ol",{className:`${i}-agenda-blocks`,children:k.map((A,U)=>(0,o.jsxs)("li",{children:[(0,o.jsx)("time",{children:A.time}),(0,o.jsx)("strong",{children:A.activity}),(0,o.jsx)("span",{className:`${i}-story-scope`,children:A.status||"No availability set"})]},`${A.time}-${U}`))}):(0,o.jsx)("p",{className:`${i}-empty`,children:"No schedule blocks for this day."})]}):null]})]},`${u.weekday}-${u.dateLabel}`)})})]})]},l.characterId))})]}):null,Na?(0,o.jsx)("p",{className:`${i}-error`,role:"alert",children:Na}):null]})]});if(z==="preparing"){let l=n?.foundingPreparation,u=n?.villagers.length??0,g=l?.completedIds.length??0,k=n?.villagers.find(Se=>Se.characterId===l?.currentId)?.name,A=l?.stage==="reading"?"Reading the character card and native schedule":l?.stage==="lore"?"Selecting relevant entries from the founding lorebooks":l?.stage==="resolving"?"Connecting to the System model":l?.stage==="model"?`Waiting for ${l.modelName||"the System model"} to write wishes, the week, and schedule mappings`:l?.stage==="applying"?"Expanding the week and applying native schedule times":l?.stage==="saving"?"Saving this villager's agenda and translation":"Preparing the first villager",U=l?.stageStartedAt?Date.parse(l.stageStartedAt):NaN,K=l?.status==="pending"&&Number.isFinite(U)?Math.max(0,Math.floor((Date.now()-U)/1e3)):null;return(0,o.jsx)("div",{className:`${i}-root ${i}-preparing`,role:"status","aria-live":"polite",children:(0,o.jsxs)("div",{children:[(0,o.jsx)("div",{className:`${i}-preparing-house`,"aria-hidden":"true",children:"\u{1F3E1}"}),(0,o.jsxs)("h1",{children:[n?.village.name??"Your village"," is settling in"]}),(0,o.jsx)("p",{children:l?.status==="failed"?"The villagers need a hand before the gates open.":k?`Making room for ${k}\u2026`:"Lighting windows and making plans\u2026"}),(0,o.jsx)("p",{children:`${g} of ${u} villagers ready`}),l?.status==="pending"&&l.stage?(0,o.jsxs)("p",{children:[A,k?` for ${k}`:"","."]}):null,l?.attempt?(0,o.jsx)("p",{children:`Attempt ${l.attempt} of 3${K!==null?` \xB7 ${K}s in this stage`:""}`}):null,l?.stage==="resolving"||l?.stage==="model"||l?.stage==="applying"||l?.stage==="saving"?(0,o.jsx)("p",{children:`${l.loreEntryCount??0} relevant lorebook entries included`}):null,l?.status==="pending"&&l.error?(0,o.jsx)("p",{className:`${i}-hint`,children:`Previous attempt: ${l.error}`}):null,l?.status==="failed"?(0,o.jsxs)("div",{className:`${i}-overlay`,children:[(0,o.jsx)("p",{className:`${i}-error`,role:"alert",children:l.error}),(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{q$()},children:"Retry this villager"}),(0,o.jsxs)("details",{children:[(0,o.jsx)("summary",{children:"Change connections"}),(0,o.jsx)(Vg,{})]})]}):null,hf?(0,o.jsx)("p",{className:`${i}-error`,role:"alert",children:hf}):null]})})}if(z==="setup"){let l=(c??[]).map(u=>({id:u.id,name:u.name}));return(0,o.jsx)("div",{className:`${i}-root ${i}-home ${i}-setup-root`,children:(0,o.jsxs)("div",{className:`${i}-home-body ${i}-setup-body`,"data-step":Xe,children:[(0,o.jsx)("aside",{className:`${i}-setup-rail`,"aria-label":"Founding progress",children:Su.map((u,g)=>(0,o.jsxs)("div",{className:`${i}-setup-rail-step`,"data-active":g===Xe?"true":"false","data-done":g<Xe?"true":"false","aria-current":g===Xe?"step":void 0,children:[(0,o.jsx)("span",{className:`${i}-setup-rail-number`,children:g+1}),(0,o.jsx)("span",{children:u})]},u))}),(0,o.jsx)("div",{className:`${i}-side`,children:(0,o.jsxs)("div",{className:`${i}-overlay`,children:[(0,o.jsx)("div",{className:`${i}-overlay-head`,children:(0,o.jsx)("h2",{className:`${i}-panel-title`,children:n?.isFounded?"Setting the village up again":"Founding your village"})}),(0,o.jsxs)("p",{className:`${i}-setup-kicker`,children:["Step ",Xe+1," of ",Su.length," \xB7 ",Su[Xe]]}),Xe===0?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("div",{className:`${i}-field`,children:[(0,o.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setup-name`,children:"What is this village called?"}),(0,o.jsx)("input",{id:`${i}-setup-name`,className:`${i}-search`,type:"text",value:An,maxLength:n?.settings.villageNameMaxLength,placeholder:"Ashwater",disabled:ee,onChange:u=>Fg(u.target.value)})]}),(0,o.jsxs)("fieldset",{className:`${i}-field`,children:[(0,o.jsx)("legend",{className:`${i}-label`,children:"Choose a scenario"}),(0,o.jsx)("div",{className:`${i}-scenario-options`,children:Ig.filter(u=>u.value!=="custom"||n?.isFounded&&ti==="custom").map(u=>(0,o.jsxs)("label",{className:`${i}-scenario-option`,children:[(0,o.jsx)("input",{type:"radio",name:`${i}-founding-scenario`,checked:ti===u.value,disabled:ee||n?.isFounded,onChange:()=>R$(u.value)}),(0,o.jsx)("span",{className:`${i}-scenario-icon`,"aria-hidden":"true",children:u.icon}),(0,o.jsx)("strong",{children:u.label}),(0,o.jsx)("small",{children:u.description})]},u.value))})]}),n?.isFounded?(0,o.jsx)("p",{className:`${i}-hint`,children:"The founding choice and Day 1 record are part of this village's history."}):null]}):null,Xe===1?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(I2,{personas:_,draft:E,onDraft:x,disabled:ee}),n?.isFounded?(0,o.jsx)(Oc,{role:bn}):(0,o.jsx)(Wf,{role:bn??{...Ws},onChange:ef,disabled:ee}),(0,o.jsx)(Vg,{onSetupProblem:Ux,onImageWarningChange:pf,compact:!0}),qx?(0,o.jsxs)("div",{className:`${i}-chat-confirm`,role:"alertdialog","aria-label":"Image connection recommendation",children:[(0,o.jsx)("p",{className:`${i}-chat-confirm-note`,children:"Villages is meant to be an immersive experience with dynamic locations and expressive characters. An image connection is highly recommended for the complete Villages experience."}),(0,o.jsx)("p",{className:`${i}-macro-help`,children:"Villages is still playable without an image connection. You can always manually add images to locations, characters, and more."}),(0,o.jsxs)("span",{className:`${i}-chat-confirm-row`,children:[(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:ee,onClick:z$,children:"Set up an image connection"}),(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:ee,onClick:M$,children:"I understand, continue"})]})]}):null]}):null,Xe===0?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("div",{className:`${i}-field`,children:[(0,o.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setup-setting`,children:"What is this village like?"}),(0,o.jsx)("textarea",{id:`${i}-setup-setting`,className:`${i}-textarea ${i}-setup-beginning-textarea`,value:xa,maxLength:n?.settings.settingMaxLength,placeholder:"A fishing village on steep sea cliffs, with salt-worn cottages, rope bridges, and foggy mornings.",disabled:ee||$a,onChange:u=>{Jg(u.target.value)}}),(0,o.jsx)("span",{className:`${i}-hint`,children:"Required. Describe the surroundings, buildings, and everyday life. Villagers use this as the village grows; the next field describes only Day 1."})]}),n?.isFounded?(0,o.jsxs)("div",{className:`${i}-field`,children:[(0,o.jsx)("strong",{children:"Day 1 record"}),(0,o.jsx)("p",{className:`${i}-hint`,children:n.settings.foundingDetails||"This village has no recorded first-day description."}),(0,o.jsx)("span",{className:`${i}-hint`,children:"The village's beginning is history and cannot be rewritten here."})]}):(0,o.jsxs)("div",{className:`${i}-field`,children:[(0,o.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-founding-details`,children:"What happens on the village's first day?"}),(0,o.jsx)("textarea",{id:`${i}-founding-details`,className:`${i}-textarea ${i}-setup-beginning-textarea`,value:Ka,maxLength:n?.settings.foundingDetailsMaxLength??2e3,placeholder:"The group arrives with tools and supplies, chooses a place to gather, and begins building together.",disabled:ee,onChange:u=>Iu(u.target.value)}),(0,o.jsx)("span",{className:`${i}-hint`,children:"Required for every village, including Open beginning. Describe what the group faces and the feeling of its first day. This guides founding, then becomes history. In the next step, choose your place in this community."})]}),n?.isFounded?(0,o.jsxs)("div",{className:`${i}-field`,children:[(0,o.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-world-facts`,children:"Current world facts"}),(0,o.jsx)("textarea",{id:`${i}-world-facts`,className:`${i}-textarea`,value:ai.join(`
`),disabled:ee,placeholder:"One stable fact per line, up to four.",onChange:u=>tf(u.target.value.split(/\r?\n/u))}),(0,o.jsx)("span",{className:`${i}-hint`,children:"Edit these when the village changes. They are current facts, separate from its locked beginning."})]}):null,(0,o.jsx)(fx,{books:Vu,error:Bg,selected:ta,onChange:u=>{En(u)},disabled:ee}),(0,o.jsxs)("details",{className:`${i}-field`,children:[(0,o.jsx)("summary",{className:`${i}-label`,children:"Advanced lore settings"}),(0,o.jsx)("label",{className:`${i}-label`,htmlFor:`${i}-setup-lore-budget`,children:"Lorebook token budget"}),(0,o.jsx)("input",{id:`${i}-setup-lore-budget`,className:`${i}-notice-input`,type:"number",min:n?.settings.loreTokenBudgetMin??200,max:n?.settings.loreTokenBudgetMax??3200,step:100,value:gn,disabled:ee,onChange:u=>Lg(Number(u.target.value))}),(0,o.jsx)("p",{className:`${i}-hint`,children:"Maximum approximate lore tokens for village text, wishes, and agendas."})]})]}):null,Xe===2&&n?.isFounded?(0,o.jsx)("p",{className:`${i}-hint`,children:"Replace the map and review venue pins in Village Settings \u2192 Village Map. Finish this setup to keep changes you made on earlier steps."}):null,Xe===2&&!n?.isFounded?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)(xh,{value:Mn,onChange:uc}),(0,o.jsxs)("label",{children:[(0,o.jsx)("input",{type:"checkbox",checked:ro,onChange:u=>of(u.target.checked)}),"Use selected visual lore for the map"]}),(0,o.jsxs)("label",{children:[(0,o.jsx)("input",{type:"checkbox",checked:Vn,onChange:u=>mc(u.target.checked)}),"Use visual lore for new venues by default"]}),(0,o.jsxs)("div",{className:`${i}-steps`,role:"group","aria-label":"Village map image source",children:[(0,o.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":dt==="generate"?"true":"false","aria-pressed":dt==="generate",disabled:$a,onClick:()=>gr("generate"),children:"Generate with AI"}),(0,o.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":dt==="upload"?"true":"false","aria-pressed":dt==="upload",disabled:$a,onClick:()=>gr("upload"),children:"Upload an image"}),(0,o.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":dt==="none"?"true":"false","aria-pressed":dt==="none",disabled:$a,onClick:()=>gr("none"),children:"No background image"}),n?.settings.townMapImageSetAt?(0,o.jsx)("button",{type:"button",className:`${i}-step`,"data-clickable":"true","data-active":dt==="existing"?"true":"false","aria-pressed":dt==="existing",disabled:$a,onClick:()=>gr("existing"),children:"Keep current map"}):null]}),dt==="generate"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsxs)("details",{className:`${i}-field ${i}-setup-advanced`,children:[(0,o.jsx)("summary",{className:`${i}-label`,children:"Advanced map elements"}),(0,o.jsx)("p",{className:`${i}-hint`,children:"Auto follows your village description. Include or exclude a feature only when you want to override it."}),(0,o.jsx)("div",{className:`${i}-reason-options`,children:[["roads","Roads and paths"],["structures","Structures"],["water","Water"]].map(([u,g])=>(0,o.jsxs)("label",{className:`${i}-label`,children:[g,(0,o.jsxs)("select",{className:`${i}-select`,value:gc[u],disabled:$a,onChange:k=>cf(A=>({...A,[u]:k.target.value})),children:[(0,o.jsx)("option",{value:"auto",children:"Auto"}),(0,o.jsx)("option",{value:"include",children:"Include"}),(0,o.jsx)("option",{value:"exclude",children:"Exclude"})]})]},u))})]}),(0,o.jsxs)("details",{className:`${i}-field ${i}-setup-advanced`,children:[(0,o.jsx)("summary",{className:`${i}-label`,children:"Testing prompt controls"}),(0,o.jsxs)("div",{className:`${i}-field`,children:[(0,o.jsxs)("label",{className:`${i}-label`,htmlFor:`${i}-setup-map-prompt`,children:[(0,o.jsx)("span",{className:`${i}-debug-label`,children:"DEBUG"})," Map layout prompt"]}),(0,o.jsx)("textarea",{id:`${i}-setup-map-prompt`,className:`${i}-textarea`,value:oo,maxLength:1500,disabled:$a,onChange:u=>Bu(u.target.value)}),(0,o.jsx)("span",{className:`${i}-hint`,children:"Temporary testing override. The default comes from the server; edits apply only to this setup session."})]}),(0,o.jsxs)("div",{className:`${i}-field`,children:[(0,o.jsxs)("label",{className:`${i}-label`,htmlFor:`${i}-setup-map-negative`,children:[(0,o.jsx)("span",{className:`${i}-debug-label`,children:"DEBUG"})," Negative map tags"]}),(0,o.jsx)("textarea",{id:`${i}-setup-map-negative`,className:`${i}-textarea`,value:so,maxLength:1500,disabled:$a,onChange:u=>ju(u.target.value)}),(0,o.jsx)("span",{className:`${i}-hint`,children:"Image providers handle negative tags differently. Review the resulting map before continuing."})]}),(0,o.jsx)("div",{className:`${i}-row`,children:(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:$a||oo===n?.settings.townMapLayoutPrompt&&so===n?.settings.townMapNegativePrompt,onClick:()=>{Bu(n?.settings.townMapLayoutPrompt??""),ju(n?.settings.townMapNegativePrompt??"")},children:"Restore default prompt"})})]}),(0,o.jsx)("div",{className:`${i}-row`,children:(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:$a||xa.trim().length===0,onClick:()=>{w$()},children:$a?"Generating map\u2026":fc==="generate"?"Generate again":"Generate map"})})]}):null,dt==="upload"?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("input",{className:`${i}-file`,type:"file",accept:"image/png,image/jpeg,image/webp,image/avif",disabled:$a,"aria-label":"Choose a village map image",onChange:u=>{let g=u.target.files?.[0];u.target.value="",x$(g)}}),(0,o.jsx)("p",{className:`${i}-hint`,children:"Landscape images work best. PNG, JPEG, WebP, and AVIF are accepted at their native size; the file must fit the size limit shown if it is refused."})]}):null,dt==="none"?(0,o.jsx)("p",{className:`${i}-empty`,children:"Venues will remain clickable on a clean logical map surface. You can add an image in Village Settings \u2192 Village Map later."}):null,_s&&dt!=="none"&&fc===dt&&vf?(0,o.jsx)("p",{className:`${i}-hint`,"data-tone":Rg(_s).tone,children:Rg(_s).text}):null]}):null,Xe===3&&n?.isFounded?(0,o.jsx)("p",{className:`${i}-hint`,children:"Existing Venues keep their locations. Use Village Settings \u2192 Village Map to reposition them with a replacement map, and View Venue to edit their details."}):null,Xe===3&&!n?.isFounded?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("h3",{children:"Place your village"}),(0,o.jsxs)("label",{className:i+"-label",children:["Villager homes",(0,o.jsx)("select",{"aria-label":"Number of villager homes",value:Rn,onChange:u=>{let g=Number(u.target.value);af(g);let k=Oe.filter(A=>A.classes?.includes("residence")).length;Ei(k<1+g),to(k>=1+g&&!Oe.some(A=>A.category==="public-center"))},children:[1,2,3].map(u=>(0,o.jsx)("option",{value:u,children:u},u))})]}),(0,o.jsxs)("label",{children:["Home image default",(0,o.jsxs)("select",{"aria-label":"Home image default",value:zn?"personalized":"generic",onChange:u=>hc(u.target.value==="personalized"),children:[(0,o.jsx)("option",{value:"personalized",children:"Personalized homes"}),(0,o.jsx)("option",{value:"generic",children:"Generic homes"})]})]}),(0,o.jsx)("p",{role:"status",children:Os?"Select a new spot for this venue.":As?Oe.some(u=>u.occupancy.playerHome)?"Select a spot for the next villager home.":"Select a spot for your home.":eo?"Select a spot for the Gathering Venue.":"Your venues are placed. Review the village when ready."}),Oe.filter(u=>u.classes?.includes("residence")).length>1+Rn?(0,o.jsx)("p",{role:"alert",children:"Completed homes are kept when you lower the count. You can review these homes or remove one explicitly."}):null,(0,o.jsx)("div",{className:i+"-setup-venue-list",children:Oe.map(u=>(0,o.jsxs)("button",{type:"button",className:i+"-setup-venue-card",onClick:()=>{ii.current=structuredClone(u),vn(u.id),ni(!0),Ee("")},children:[u.name," \xB7 ",pr.includes(u.id)?"Done":"Edit"]},u.id))}),lf?(0,o.jsx)("p",{role:"alert",className:i+"-error",children:lf}):null,nf&&_t?(0,o.jsx)(pb,{venue:_t,tag:i,people:l,assignedIds:Oe.filter(u=>u.id!==_t.id).map(u=>u.occupancy.residentCharacterId??""),busy:Ds,problem:Xu,onPatch:u=>{Df(u.id,()=>u),Ee("")},onDone:D$,onCancel:_$,onMove:()=>{ii.current??(ii.current=structuredClone(_t)),Is(_t.id),ni(!1),Ei(!1),to(!1)},onRemove:()=>{let u=Oe.filter(g=>g.id!==_t.id);A$(_t.id),_u(g=>g.filter(k=>k!==_t.id)),lh(u)},onGenerate:u=>{O$(_t,u)},onUpload:(u,g)=>{I$(_t,u,g)}},_t.id):null,c===null?(0,o.jsx)("p",{children:"Reading your villager library\u2026"}):null]}):null,Xe===4?(0,o.jsxs)(o.Fragment,{children:[(0,o.jsx)("p",{className:`${i}-empty`,children:"Review your village before opening its gates. Return to Step 4 to change a venue."}),(0,o.jsxs)("section",{className:`${i}-setup-review-card`,children:[(0,o.jsx)("h3",{children:"Village Beginning"}),(0,o.jsxs)("p",{className:`${i}-hint`,children:[(0,o.jsx)("strong",{children:An.trim()})," \xB7 ",xa.trim()]}),(0,o.jsxs)("p",{className:`${i}-hint`,children:[(0,o.jsx)("strong",{children:"Persona:"})," ",_?.find(u=>u.id===E)?.name??"Selected Persona"," \xB7 ",(0,o.jsx)("strong",{children:"Scenario:"})," ",Jr(ti).label]}),(0,o.jsxs)("p",{className:`${i}-hint`,children:[(0,o.jsx)("strong",{children:"Day 1:"})," ",Ka||"No first-day description was recorded."]}),Vs?(0,o.jsxs)("p",{className:`${i}-hint`,children:[(0,o.jsx)("strong",{children:"Original founding direction:"})," ",Vs]}):null]}),(0,o.jsx)("section",{className:`${i}-setup-review-card`,children:(0,o.jsx)(Oc,{role:bn})}),(0,o.jsxs)("section",{className:`${i}-setup-review-card`,children:[(0,o.jsx)("h3",{children:"Map and lore"}),(0,o.jsxs)("p",{className:`${i}-hint`,children:[(0,o.jsx)("strong",{children:"Map:"})," ",dt==="none"?"Logical map":"Chosen picture"," \xB7 ",(0,o.jsx)("strong",{children:"Lorebooks:"})," ",ta.map(u=>Vu?.find(g=>g.id===u)?.name??u).join(", ")||"None"]})]}),(0,o.jsxs)("section",{className:`${i}-setup-review-card`,children:[(0,o.jsx)("h3",{children:"Starting places"}),(0,o.jsx)("div",{className:`${i}-setup-venue-list`,children:Oe.map(u=>(0,o.jsxs)("div",{className:`${i}-setup-venue-card`,children:[u.presentation.image?(0,o.jsx)("img",{src:u.presentation.image.url,alt:""}):(0,o.jsx)("span",{className:`${i}-setup-venue-placeholder`,"aria-hidden":"true",children:"\u2302"}),(0,o.jsxs)("span",{children:[(0,o.jsxs)("strong",{children:[u.name," \xB7 ",u.category==="public-center"?"Gathering Place":"Residence"]}),(0,o.jsxs)("small",{children:[u.form," \xB7"," ",u.occupancy.playerHome?"You":xn(u.occupancy.residentCharacterId)||"Community"]})]})]},u.id))}),Oe.map(u=>(0,o.jsxs)("p",{className:`${i}-hint`,children:[(0,o.jsxs)("strong",{children:[u.name,":"]})," ",u.description," ",u.spaces?.[0]?.description]},`${u.id}-summary`))]})]}):null,Xu?(0,o.jsx)("p",{className:`${i}-error`,role:"alert",children:Xu}):null,Na?(0,o.jsx)("p",{className:`${i}-error`,role:"alert",children:Na}):null]})}),(0,o.jsxs)("div",{className:`${i}-setup-visual`,children:[Xe<=1?(0,o.jsx)(z2,{scenario:ti}):(0,o.jsx)("div",{className:`${i}-setup-map-shell`,children:(0,o.jsx)("div",{className:`${i}-setup-map-viewport`,tabIndex:0,"aria-label":"Venue placement map. Arrow keys choose a spot; Enter places a venue.",onKeyDown:u=>{u.target!==u.currentTarget||Xe!==3||nf||!(As||eo||Os)||(u.key==="Enter"?(u.preventDefault(),If(Du.x,Du.y)):["ArrowLeft","ArrowRight","ArrowUp","ArrowDown"].includes(u.key)&&(u.preventDefault(),Dx(g=>({x:Math.max(.02,Math.min(.98,g.x+(u.key==="ArrowLeft"?-.025:u.key==="ArrowRight"?.025:0))),y:Math.max(.02,Math.min(.98,g.y+(u.key==="ArrowUp"?-.025:u.key==="ArrowDown"?.025:0)))}))))},children:(0,o.jsx)(zg,{src:fr,alt:`A map of ${An.trim()||"your new village"}.`,pins:Xe<3?[]:X$,placing:Xe===3&&!n?.isFounded&&(As||eo||Os!==null),view:dt==="existing"?ho:nc("cover"),shape:vf,onPlace:Xe===3&&!n?.isFounded?If:void 0,compact:Xe<2,mobile:t&&Xe>=2,photoPins:Xe>=3,placementCursor:Xe===3?Du:void 0})})}),(0,o.jsxs)("nav",{className:`${i}-setup-footer`,"aria-label":"Founding navigation",children:[Xe>0?(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:ee||$a||Ds,onClick:()=>_f(Xe-1),children:"\u2190 Back"}):null,Xe<Su.length-1?(0,o.jsx)("button",{type:"button",className:`${i}-button ${i}-setup-forward`,disabled:ee||$a||Ds,onClick:()=>_f(Xe+1),children:Xe===3?"Review village":"Next \u2192"}):(0,o.jsx)("button",{type:"button",className:`${i}-button ${i}-setup-forward`,disabled:ee||$a||!n,onClick:()=>{H$()},children:n?.isFounded?"Save this village":"Found the village"}),n?.isFounded?(0,o.jsx)("button",{type:"button",className:`${i}-button`,disabled:ee,onClick:()=>{Ei(!1),j("home")},children:"Show me the village"}):null]})]})]})})}return(0,o.jsxs)("div",{className:`${i}-root ${i}-home ${i}-home-full`,"data-mobile":t?"true":"false",children:[(0,o.jsxs)("div",{className:`${i}-home-bar`,children:[(0,o.jsx)(x2,{weather:n?.village.weather??""}),!t&&n?.isFounded&&ks(n.settings.venues).length>0?(0,o.jsxs)("div",{className:`${i}-places-picker`,children:[(0,o.jsx)("button",{type:"button",className:`${i}-button`,"aria-expanded":oe,"aria-controls":`${i}-places-list`,disabled:ee,onClick:()=>{Ne(null),Ze(l=>!l)},children:"Places"}),oe?(0,o.jsx)("div",{id:`${i}-places-list`,className:`${i}-places-list`,children:n.settings.venues.map(l=>(0,o.jsxs)("div",{className:`${i}-places-list-row`,children:[(0,o.jsx)("span",{className:`${i}-places-list-name`,children:l.name}),(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>oh(l),children:"View venue"}),(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Ec(l)},children:"Visit"})]},l.id))}):null]}):null,(0,o.jsxs)("span",{className:`${i}-home-bar-actions`,children:[(0,o.jsx)("button",{type:"button",className:`${i}-mobile-board-button`,"aria-label":`Noticeboard (${n?.noticeboard.length??0})`,disabled:!n||ee,onClick:()=>jt("noticeboard"),children:(0,o.jsx)("span",{"aria-hidden":"true",children:"\u25A4"})}),n?.isFounded?(0,o.jsx)(S2,{happenings:n.happenings,recap:n.recap,mobile:t}):null,(0,o.jsx)("button",{type:"button",className:`${i}-button ${i}-mobile-menu-button`,"aria-label":"Open settings menu",disabled:ee||!n,onClick:()=>{gt("index"),j("menu")},children:"\u2630"}),t?null:(0,o.jsx)(N2,{}),ae?(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:()=>{Be("")},children:"Cancel placement"}):null]})]}),(0,o.jsx)("div",{className:`${i}-room`,children:(0,o.jsx)("div",{className:`${i}-home-map-viewport`,children:(0,o.jsx)(zg,{src:lo||null,alt:`A map of ${n?.village.name??"the village"}.`,pins:P$,placing:!!ae,view:ho,shape:bf,onPlace:(l,u)=>{if(!ae)return;let g=ae;ce(!0),bt(""),L(`/projects/${encodeURIComponent(g)}/place`,{method:"POST",body:JSON.stringify({x:l,y:u})}).then(k=>{r(k),Be(""),ye(g),jt("projects")}).catch(k=>bt(F(k,"The blueprint could not be placed here."))).finally(()=>ce(!1))},onDismiss:()=>{Ne(null),Ze(!1)},fitToRoom:!t,mobile:t,photoPins:!0,children:Ri||Na||Wu||Ju?(0,o.jsxs)("div",{className:`${i}-notice`,children:[Ri?(0,o.jsx)("p",{className:`${i}-error`,role:"alert",children:Ri}):null,Na?(0,o.jsx)("p",{className:`${i}-error`,role:"alert",children:Na}):null,Wu?(0,o.jsxs)("span",{className:`${i}-status`,children:["Catching up on what ",n?.village.name??"the village"," has been doing\u2026"]}):null,Ju?(0,o.jsx)("p",{className:`${i}-status`,children:Ju}):null]}):null})})})]})}var Hg=class extends HTMLElement{connectedCallback(){_g(),this.__root??(this.__root=(0,wx.createRoot)(this)),this.__root.render((0,o.jsx)(Dg,{element:this,children:(0,o.jsx)(F2,{element:this})}))}disconnectedCallback(){queueMicrotask(()=>{!this.isConnected&&this.__root&&(this.__root.unmount(),this.__root=null),_g()})}};function F2({element:e}){let[,t]=(0,m.useState)(0);(0,m.useEffect)(()=>{let n=()=>t(r=>r+1);return e.addEventListener("marinara-capability-props",n),()=>e.removeEventListener("marinara-capability-props",n)},[e]);let a=e.getAttribute("view");return a==="tracker"?(0,o.jsx)(eC,{props:e.capabilityProps??{}}):a==="toolbar"?(0,o.jsx)(W2,{props:e.capabilityProps??{}}):(0,o.jsx)(Q2,{element:e})}function J2(){return(0,o.jsxs)("svg",{viewBox:"0 0 24 24",fill:"none",stroke:"currentColor",strokeWidth:"2",strokeLinecap:"round","aria-hidden":"true",children:[(0,o.jsx)("path",{d:"M3 10.5 12 3l9 7.5"}),(0,o.jsx)("path",{d:"M5.5 9.5V20h13V9.5"}),(0,o.jsx)("path",{d:"M9.5 16.5h5"})]})}var K2="marinara-active-chat-id";function Tx(){try{window.localStorage.removeItem(K2)}catch{}window.location.reload()}function Ex(e,t){let[a,n]=(0,m.useState)(null),[r,s]=(0,m.useState)(!1);return(0,m.useEffect)(()=>{if(s(!1),n(null),!t)return;let c=new AbortController;return(async()=>{try{let d=await L(`/spinoffs/${encodeURIComponent(e)}`,{signal:c.signal});if(c.signal.aborted)return;n(d??null),s(!0)}catch{}})(),()=>c.abort()},[e,t]),{origin:a,known:r}}function W2({props:e}){let t=typeof e.chatId=="string"?e.chatId:"",a=e.chatMode==="roleplay",n=e.mobileCompact===!0,r=typeof e.toolbarButtonClass=="string"?e.toolbarButtonClass:"",{origin:s,known:c}=Ex(t,a&&t.length>0),[d,h]=(0,m.useState)(!1),p=(0,m.useRef)(null);if((0,m.useEffect)(()=>h(!1),[t,a]),(0,m.useEffect)(()=>{if(!d)return;let y=M=>{p.current?.contains(M.target)||h(!1)},V=M=>{M.key==="Escape"&&h(!1)};return document.addEventListener("pointerdown",y),document.addEventListener("keydown",V),()=>{document.removeEventListener("pointerdown",y),document.removeEventListener("keydown",V)}},[d]),!a||!c||s===null)return null;let b=s.name||"your villager",$=s.villageName||"your village",f=`Villages \u2014 this roleplay spun off from ${$}`;return(0,o.jsxs)("span",{className:`${i}-tracker`,"data-compact":n,"data-open":d,ref:p,children:[(0,o.jsxs)("button",{type:"button",className:r?`${r} ${i}-tracker-chip`:`${i}-button ${i}-tracker-chip`,onClick:()=>h(y=>!y),"aria-haspopup":"menu","aria-expanded":d,title:f,"aria-label":f,children:[(0,o.jsx)(J2,{}),(0,o.jsx)("span",{className:`${i}-tracker-label`,children:"Villages"})]}),d?(0,o.jsxs)("div",{className:`${i}-tracker-menu`,role:"menu","aria-label":`Villages \u2014 ${$}`,children:[(0,o.jsxs)("p",{className:`${i}-tracker-menu-title`,children:["This roleplay spun off from ",$]}),s.resident?(0,o.jsxs)("p",{className:`${i}-tracker-menu-note`,children:[b," still lives there. ",$," was photographed into this chat the moment it was made, and has not looked at it since: nothing said here is read, counted or kept by the village."]}):(0,o.jsxs)("p",{className:`${i}-tracker-menu-note`,children:[b," does not live in ",$," any more. This chat is yours either way \u2014 it was let go of the moment it was made, and nothing in the village is waiting on it."]}),(0,o.jsx)("p",{className:`${i}-tracker-menu-note`,children:"It is an ordinary chat in your own list. Renaming it, keeping it or deleting it changes nothing about the village."}),(0,o.jsx)("div",{className:`${i}-tracker-menu-row`,children:(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:Tx,title:`Leaves this chat and opens Marinara's home screen, where the ${$} tab is waiting.`,children:"Open the village"})})]}):null]})}function eC({props:e}){let t=typeof e.chatId=="string"?e.chatId:"",a=e.chatMode==="roleplay",{origin:n,known:r}=Ex(t,a&&t.length>0);if(!a||!r)return null;if(n===null)return(0,o.jsx)("div",{className:`${i}-panel-view`,children:(0,o.jsx)("p",{className:`${i}-tracker-menu-note`,children:"This chat did not come out of a village. A roleplay started from Villages says so here."})});let s=n.name||"this villager",c=n.villageName||"your village";return(0,o.jsxs)("div",{className:`${i}-panel-view`,children:[(0,o.jsx)("p",{className:`${i}-tracker-menu-note`,children:n.resident?`This roleplay spun off from ${c}, and ${c} has not looked at it since. Nothing said here is read, counted or kept by the village.`:`This roleplay spun off from ${c}, and ${s} does not live there any more. Nothing said here is read by the village either way.`}),(0,o.jsxs)("div",{className:`${i}-panel-view-row`,children:[(0,o.jsx)("span",{className:`${i}-panel-view-key`,children:"Villager"}),(0,o.jsx)("span",{children:s})]}),(0,o.jsxs)("div",{className:`${i}-panel-view-row`,children:[(0,o.jsx)("span",{className:`${i}-panel-view-key`,children:"Chat"}),(0,o.jsx)("span",{children:n.room})]}),(0,o.jsxs)("div",{className:`${i}-panel-view-row`,children:[(0,o.jsx)("span",{className:`${i}-panel-view-key`,children:"Came from"}),(0,o.jsx)("span",{children:c})]}),(0,o.jsx)("div",{className:`${i}-panel-view-actions`,children:(0,o.jsx)("button",{type:"button",className:`${i}-button`,onClick:Tx,title:`Leaves this chat and opens Marinara's home screen, where the ${c} tab is waiting.`,children:"Open the village"})})]})}customElements.get(i)||customElements.define(i,Hg);
/*! Bundled license information:

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
*/
